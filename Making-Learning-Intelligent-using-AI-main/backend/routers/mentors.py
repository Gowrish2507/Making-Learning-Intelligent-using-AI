from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import logging

from backend.database import get_db
from backend.models import Mentor, MentorshipAssignment, MentorshipSession, Student, Intervention
from backend.schemas import (
    MentorResponse, MentorMatchResponse,
    MentorshipAssignmentCreate, MentorshipAssignmentResponse,
    MentorshipSessionCreate, MentorshipSessionResponse
)
from backend.services.mentor_matcher import match_mentors_for_student

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[MentorResponse])
def get_all_mentors(db: Session = Depends(get_db)):
    """List all registered mentors and their expertise/availability"""
    mentors = db.query(Mentor).filter(Mentor.is_active == True).all()
    return mentors


@router.get("/{mentor_id}", response_model=MentorResponse)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    """Get mentor details by ID"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor


@router.get("/match/{student_id}", response_model=List[MentorMatchResponse])
def get_mentor_matches(student_id: int, db: Session = Depends(get_db)):
    """
    Run intelligent mentor matching algorithm for a student.
    Returns ranked candidates with match percentage and explainable 'Why' bullet points.
    """
    matches = match_mentors_for_student(db, student_id)
    return matches


@router.post("/assign", response_model=MentorshipAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_mentor(data: MentorshipAssignmentCreate, db: Session = Depends(get_db)):
    """Assign a mentor to a student for Tier 2 escalation support"""
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    mentor = db.query(Mentor).filter(Mentor.id == data.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    # Calculate match reasoning
    matches = match_mentors_for_student(db, data.student_id)
    matched_candidate = next((m for m in matches if m["mentor_id"] == mentor.id), None)
    match_score = matched_candidate["match_score"] if matched_candidate else 85.0
    match_reasons = "\n".join(matched_candidate["match_reasons"]) if matched_candidate else "Direct manual assignment."

    # Check for existing active assignment
    existing = db.query(MentorshipAssignment).filter(
        MentorshipAssignment.student_id == data.student_id,
        MentorshipAssignment.mentor_id == data.mentor_id,
        MentorshipAssignment.status.in_(["pending", "active"])
    ).first()
    if existing:
        return existing

    assignment = MentorshipAssignment(
        student_id=data.student_id,
        mentor_id=data.mentor_id,
        course_id=data.course_id,
        topic=data.topic or "Foundational Remediation",
        match_score=match_score,
        match_reasons=match_reasons,
        status="active"
    )
    db.add(assignment)
    
    # Increment mentor workload
    mentor.current_workload = (mentor.current_workload or 0) + 1

    # Ensure a Tier 2 intervention is recorded
    active_intervention = db.query(Intervention).filter(
        Intervention.student_id == data.student_id,
        Intervention.status == "active"
    ).first()
    if not active_intervention:
        active_intervention = Intervention(
            student_id=data.student_id,
            course_id=data.course_id,
            topic=data.topic or "Foundational Remediation",
            tier="TIER_2_MENTOR",
            trigger_reason=f"Assigned to Mentor {mentor.full_name} for personalized 1-on-1 support.",
            status="active"
        )
        db.add(active_intervention)
    else:
        active_intervention.tier = "TIER_2_MENTOR"
        active_intervention.mentor_notes = f"Assigned to {mentor.full_name}."

    db.commit()
    db.refresh(assignment)

    assignment.mentor_name = mentor.full_name
    assignment.student_name = student.full_name
    return assignment


@router.get("/assignments/mentor/{mentor_id}", response_model=List[MentorshipAssignmentResponse])
def get_mentor_assignments(mentor_id: int, db: Session = Depends(get_db)):
    """Fetch all students assigned to a specific mentor"""
    assignments = db.query(MentorshipAssignment).filter(
        MentorshipAssignment.mentor_id == mentor_id
    ).order_by(MentorshipAssignment.created_at.desc()).all()

    for a in assignments:
        if a.student:
            a.student_name = a.student.full_name
        if a.mentor:
            a.mentor_name = a.mentor.full_name
    return assignments


@router.get("/assignments/student/{student_id}", response_model=List[MentorshipAssignmentResponse])
def get_student_assignments(student_id: int, db: Session = Depends(get_db)):
    """Fetch assigned mentor(s) for a student"""
    assignments = db.query(MentorshipAssignment).filter(
        MentorshipAssignment.student_id == student_id
    ).order_by(MentorshipAssignment.created_at.desc()).all()

    for a in assignments:
        if a.mentor:
            a.mentor_name = a.mentor.full_name
        if a.student:
            a.student_name = a.student.full_name
    return assignments


@router.put("/assignments/{assignment_id}/status", response_model=MentorshipAssignmentResponse)
def update_assignment_status(assignment_id: int, status: str, db: Session = Depends(get_db)):
    """Update mentorship assignment status (active, completed, escalated)"""
    assignment = db.query(MentorshipAssignment).filter(MentorshipAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.status = status
    if status == "completed" and assignment.mentor:
        assignment.mentor.current_workload = max(0, (assignment.mentor.current_workload or 1) - 1)

    db.commit()
    db.refresh(assignment)
    if assignment.student:
        assignment.student_name = assignment.student.full_name
    if assignment.mentor:
        assignment.mentor_name = assignment.mentor.full_name
    return assignment


@router.post("/sessions", response_model=MentorshipSessionResponse, status_code=status.HTTP_201_CREATED)
def create_mentorship_session(data: MentorshipSessionCreate, db: Session = Depends(get_db)):
    """Mentor logs a completed 1-on-1 tutoring session with notes and action items"""
    assignment = db.query(MentorshipAssignment).filter(MentorshipAssignment.id == data.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Mentorship assignment not found")

    session = MentorshipSession(
        assignment_id=data.assignment_id,
        notes=data.notes,
        recommended_resources=data.recommended_resources,
        action_items=data.action_items,
        status="completed"
    )
    db.add(session)

    # Also update any active intervention with mentor notes
    intervention = db.query(Intervention).filter(
        Intervention.student_id == assignment.student_id,
        Intervention.status == "active"
    ).first()
    if intervention:
        intervention.mentor_notes = (intervention.mentor_notes or "") + f"\n[Session Note]: {data.notes}"

    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/assignment/{assignment_id}", response_model=List[MentorshipSessionResponse])
def get_assignment_sessions(assignment_id: int, db: Session = Depends(get_db)):
    """Get all session logs for an assignment"""
    sessions = db.query(MentorshipSession).filter(
        MentorshipSession.assignment_id == assignment_id
    ).order_by(MentorshipSession.created_at.desc()).all()
    return sessions
