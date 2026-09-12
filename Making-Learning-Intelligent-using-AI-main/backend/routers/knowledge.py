from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
import logging

from backend.database import get_db
from backend.models import Student, StudentKnowledgeProfile
from backend.schemas import KnowledgeProfileResponse, RiskResponse, RecommendationResponse
from backend.services.knowledge_engine import calculate_student_profile, get_profile_data

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/students/{student_id}/knowledge-profile", response_model=KnowledgeProfileResponse)
def get_student_knowledge_profile(student_id: int, db: Session = Depends(get_db)):
    """Fetch the dynamic AI Knowledge Profile for a student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == student_id
    ).first()

    if not profile:
        profile = calculate_student_profile(db, student_id)

    data = get_profile_data(profile, student)
    return data


@router.get("/students/{student_id}/risk", response_model=RiskResponse)
def get_student_risk(student_id: int, db: Session = Depends(get_db)):
    """
    Fetch the predictive AI Risk Assessment for a student.
    Returns Risk Score, Risk Level (LOW, MEDIUM, HIGH), and Explainable Reasons.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == student_id
    ).first()

    if not profile:
        profile = calculate_student_profile(db, student_id)

    reasons = json.loads(profile.risk_reasons_json or "[]")
    diff_topics = json.loads(profile.predicted_difficult_topics_json or "[]")

    if profile.risk_level == "HIGH":
        expl = f"CRITICAL: Student exhibits {profile.risk_score}% learning vulnerability requiring immediate Faculty Escalation."
    elif profile.risk_level == "MEDIUM":
        expl = f"ATTENTION: Student demonstrates moderate learning gaps ({profile.risk_score}% risk) recommended for Tier 2 Peer Mentorship."
    else:
        expl = f"STABLE: Student demonstrates solid comprehension ({profile.risk_score}% risk). Tier 1 AI self-paced support active."

    return {
        "student_id": student_id,
        "risk_score": profile.risk_score,
        "risk_level": profile.risk_level,
        "reasons": reasons,
        "predicted_difficult_topics": diff_topics,
        "support_tier": profile.support_tier,
        "explanation": expl
    }


@router.get("/students/{student_id}/recommendations", response_model=RecommendationResponse)
def get_student_recommendations(student_id: int, db: Session = Depends(get_db)):
    """
    Fetch explainable personalized recommendations for a student.
    Considers weak topics, prerequisite dependencies, and performance trajectory.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == student_id
    ).first()

    if not profile:
        profile = calculate_student_profile(db, student_id)

    target_topic = profile.recommended_topic or "Core Programming Concepts"
    weak_topics = json.loads(profile.weak_topics_json or "[]")

    difficulty_adjustment = "Reduced Cognitive Load" if profile.risk_level == "HIGH" else ("Standard Progression" if profile.risk_level == "MEDIUM" else "Advanced Challenge")
    
    practice_resources = [
        {"title": f"Deep Dive: {target_topic} Fundamentals", "type": "Interactive Guide", "duration": "15 mins"},
        {"title": f"{target_topic} Step-by-Step Problem Solving", "type": "Guided Practice", "duration": "20 mins"},
        {"title": f"Self-Check Assessment: {target_topic}", "type": "Diagnostic Quiz", "duration": "10 mins"}
    ]

    return {
        "student_id": student_id,
        "recommended_next": f"{target_topic} -> Guided Practice -> Diagnostic Quiz",
        "topic": target_topic,
        "recommended_resource": profile.recommended_resource or f"Targeted Review: {target_topic}",
        "recommended_action": profile.recommended_action or f"Solve practice set on {target_topic}",
        "explanation": profile.recommendation_reason or f"Recommended based on mastery level and prerequisite importance.",
        "support_tier": profile.support_tier,
        "difficulty_adjustment": difficulty_adjustment,
        "practice_resources": practice_resources
    }


@router.post("/students/{student_id}/recalculate", response_model=KnowledgeProfileResponse)
def recalculate_profile(student_id: int, db: Session = Depends(get_db)):
    """Force re-run the Knowledge Engine and risk model for a student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = calculate_student_profile(db, student_id)
    return get_profile_data(profile, student)
