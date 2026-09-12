from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import logging
from datetime import datetime

from backend.database import get_db
from backend.models import Intervention, Student, Assessment, StudentKnowledgeProfile
from backend.schemas import (
    InterventionCreate, InterventionUpdate, InterventionResponse,
    ReassessmentRequest, ReassessmentResponse
)
from backend.services.knowledge_engine import calculate_student_profile

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/high-risk", response_model=List[InterventionResponse])
def get_high_risk_interventions(db: Session = Depends(get_db)):
    """
    Fetch all active high-risk interventions requiring Faculty Attention (Tier 3).
    Includes students escalated from Tier 1/2 or directly predicted as HIGH risk.
    """
    interventions = db.query(Intervention).filter(
        Intervention.status.in_(["active", "escalated"])
    ).order_by(Intervention.created_at.desc()).all()

    res = []
    for it in interventions:
        item = InterventionResponse.model_validate(it)
        if it.student:
            item.student_name = it.student.full_name
        res.append(item)
    return res


@router.get("/student/{student_id}", response_model=List[InterventionResponse])
def get_student_interventions(student_id: int, db: Session = Depends(get_db)):
    """Fetch complete intervention history for a student"""
    interventions = db.query(Intervention).filter(
        Intervention.student_id == student_id
    ).order_by(Intervention.created_at.desc()).all()

    res = []
    for it in interventions:
        item = InterventionResponse.model_validate(it)
        if it.student:
            item.student_name = it.student.full_name
        res.append(item)
    return res


@router.post("/", response_model=InterventionResponse, status_code=status.HTTP_201_CREATED)
def create_intervention(data: InterventionCreate, db: Session = Depends(get_db)):
    """Create a new intervention record"""
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Capture current before metrics
    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == data.student_id
    ).first()
    before_m = profile.overall_mastery if profile else 40.0
    before_r = profile.risk_score if profile else 75.0

    it = Intervention(
        student_id=data.student_id,
        course_id=data.course_id,
        topic=data.topic or "General Remediation",
        tier=data.tier,
        trigger_reason=data.trigger_reason,
        faculty_notes=data.faculty_notes,
        before_mastery=before_m,
        before_risk=before_r,
        status="active"
    )
    db.add(it)
    db.commit()
    db.refresh(it)

    it.student_name = student.full_name
    return it


@router.put("/{intervention_id}", response_model=InterventionResponse)
def update_intervention(intervention_id: int, update_data: InterventionUpdate, db: Session = Depends(get_db)):
    """Update intervention notes, status, or outcome"""
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Intervention not found")

    data = update_data.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(it, k, v)

    db.commit()
    db.refresh(it)
    if it.student:
        it.student_name = it.student.full_name
    return it


@router.post("/{intervention_id}/escalate", response_model=InterventionResponse)
def escalate_intervention(intervention_id: int, notes: Optional[str] = None, db: Session = Depends(get_db)):
    """Escalate an intervention up to Faculty (Tier 3)"""
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Intervention not found")

    it.tier = "TIER_3_FACULTY"
    it.status = "escalated"
    if notes:
        it.faculty_notes = (it.faculty_notes or "") + f"\n[Escalation Note]: {notes}"

    # Also update profile support tier
    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == it.student_id
    ).first()
    if profile:
        profile.support_tier = "TIER_3_FACULTY"
        profile.risk_level = "HIGH"

    db.commit()
    db.refresh(it)
    if it.student:
        it.student_name = it.student.full_name
    return it


@router.post("/{intervention_id}/reassess", response_model=ReassessmentResponse)
def conduct_reassessment(
    intervention_id: int,
    req: ReassessmentRequest,
    db: Session = Depends(get_db)
):
    """
    Execute the LearnIQ Closed-Loop Reassessment.
    
    1. Records the reassessment score in assessments table
    2. Recalculates student's knowledge profile and risk
    3. Compares BEFORE vs AFTER mastery and risk
    4. Determines whether intervention was successful or if additional support is needed
    5. Updates the intervention record with outcomes
    """
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Intervention not found")

    student_id = it.student_id
    
    # Store initial before values if not present
    if it.before_mastery is None or it.before_risk is None:
        curr_profile = db.query(StudentKnowledgeProfile).filter(
            StudentKnowledgeProfile.student_id == student_id
        ).first()
        it.before_mastery = curr_profile.overall_mastery if curr_profile else 40.0
        it.before_risk = curr_profile.risk_score if curr_profile else 75.0

    # 1. Create reassessment record
    score_pct = (req.score / req.max_score * 100.0) if req.max_score else req.score
    new_assessment = Assessment(
        student_id=student_id,
        course_id=it.course_id,
        title=f"Post-Intervention Reassessment: {req.topic}",
        assessment_type="reassessment",
        topic=req.topic,
        score=req.score,
        max_score=req.max_score,
        feedback=f"Completed post-intervention reassessment for {it.tier}. Score: {req.score}/{req.max_score} ({score_pct:.1f}%)"
    )
    db.add(new_assessment)
    db.commit()

    # 2. Recalculate AI Knowledge Profile & Risk
    new_profile = calculate_student_profile(db, student_id)

    # 3. Compare Before vs After
    it.after_mastery = new_profile.overall_mastery
    it.after_risk = new_profile.risk_score

    # 4. Evaluate closed loop outcome
    if new_profile.overall_mastery >= 65.0 or (new_profile.risk_score < it.before_risk and score_pct >= 70.0):
        it.outcome = "Intervention Successful"
        it.status = "resolved"
        msg = f"Reassessment passed ({score_pct:.1f}%). Mastery improved from {it.before_mastery}% to {it.after_mastery}%, Risk dropped from {it.before_risk}% to {it.after_risk}%. Intervention resolved!"
    else:
        it.outcome = "Additional Support Recommended"
        it.status = "active"
        msg = f"Reassessment indicates continued gaps ({score_pct:.1f}%). Mastery: {it.after_mastery}%, Risk: {it.after_risk}%. Additional support recommended."

    db.commit()
    db.refresh(it)

    return {
        "intervention_id": it.id,
        "student_id": student_id,
        "topic": req.topic,
        "score": req.score,
        "before_mastery": it.before_mastery,
        "before_risk": it.before_risk,
        "after_mastery": it.after_mastery,
        "after_risk": it.after_risk,
        "outcome": it.outcome,
        "message": msg
    }
