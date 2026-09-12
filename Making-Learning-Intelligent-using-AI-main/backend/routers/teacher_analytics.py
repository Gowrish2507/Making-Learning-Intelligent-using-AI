from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json
import logging

from backend.database import get_db
from backend.models import Student, Course, Assessment, Intervention, StudentKnowledgeProfile, Teacher
from backend.schemas import TeacherDashboardStats

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/dashboard/{teacher_id}", response_model=TeacherDashboardStats)
def get_teacher_dashboard_analytics(teacher_id: int, db: Session = Depends(get_db)):
    """Fetch complete aggregated analytics, risk distribution, and intervention queue for Teacher Dashboard"""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        # Fallback if generic check
        pass

    students = db.query(Student).filter(Student.is_active == True).all()
    total_students = len(students)

    profiles = db.query(StudentKnowledgeProfile).all()
    profile_map = {p.student_id: p for p in profiles}

    low_risk = 0
    med_risk = 0
    high_risk = 0
    total_mastery = 0.0

    high_risk_list = []
    topic_failure_counter: Dict[str, int] = {}

    for s in students:
        p = profile_map.get(s.id)
        if p:
            total_mastery += (p.overall_mastery or 0.0)
            if p.risk_level == "HIGH":
                high_risk += 1
                weak_t = json.loads(p.weak_topics_json or "[]")
                high_risk_list.append({
                    "id": s.id,
                    "full_name": s.full_name,
                    "email": s.email,
                    "risk_score": p.risk_score,
                    "mastery": p.overall_mastery,
                    "weak_topics": weak_t,
                    "support_tier": p.support_tier
                })
            elif p.risk_level == "MEDIUM":
                med_risk += 1
            else:
                low_risk += 1

            # Count topic deficits
            w_list = json.loads(p.weak_topics_json or "[]")
            for t in w_list:
                topic_failure_counter[t] = topic_failure_counter.get(t, 0) + 1
        else:
            low_risk += 1
            total_mastery += 65.0

    avg_mastery = round(total_mastery / total_students, 1) if total_students > 0 else 0.0
    active_courses = db.query(Course).filter(Course.is_active == True).count()
    pending_interventions = db.query(Intervention).filter(Intervention.status.in_(["active", "escalated"])).count()

    risk_dist = [
        {"name": "Low Risk", "value": low_risk, "color": "#10B981"},
        {"name": "Medium Risk", "value": med_risk, "color": "#F59E0B"},
        {"name": "High Risk", "value": high_risk, "color": "#EF4444"}
    ]

    topic_weaknesses = [
        {"topic": topic, "students_struggling": count, "difficulty_index": round(count / max(1, total_students) * 100, 1)}
        for topic, count in sorted(topic_failure_counter.items(), key=lambda x: x[1], reverse=True)[:6]
    ]

    recent_assessments_db = db.query(Assessment).order_by(Assessment.created_at.desc()).limit(10).all()
    recent_assessments = []
    for a in recent_assessments_db:
        recent_assessments.append({
            "id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.full_name if a.student else "Student",
            "title": a.title,
            "topic": a.topic or "General",
            "score": a.score,
            "max_score": a.max_score,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })

    return {
        "total_students": total_students,
        "low_risk_count": low_risk,
        "medium_risk_count": med_risk,
        "high_risk_count": high_risk,
        "average_class_mastery": avg_mastery,
        "active_courses_count": active_courses,
        "pending_interventions_count": pending_interventions,
        "risk_distribution": risk_dist,
        "topic_weaknesses": topic_weaknesses,
        "high_risk_students": high_risk_list,
        "recent_assessments": recent_assessments
    }
