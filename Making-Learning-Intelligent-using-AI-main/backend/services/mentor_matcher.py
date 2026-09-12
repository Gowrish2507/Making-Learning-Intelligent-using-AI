import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Mentor, Student, StudentKnowledgeProfile


def match_mentors_for_student(db: Session, student_id: int) -> List[Dict[str, Any]]:
    """
    Intelligently matches available mentors to a student requiring Tier 2 support.
    
    Evaluates:
    - Topic Alignment: Match between mentor's listed expertise and student's weak topics (40% weight)
    - Availability: Higher available weekly hours (20% weight)
    - Workload: Fewer currently assigned students (20% weight)
    - Historical Effectiveness: Track record of past student improvements (20% weight)
    
    Produces explicit 'Why' reasons for every candidate.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return []

    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == student_id
    ).first()

    weak_topics: List[str] = []
    recommended_topic: str = ""
    if profile:
        weak_topics = json.loads(profile.weak_topics_json or "[]")
        recommended_topic = profile.recommended_topic or ""

    needed_topics = set([t.lower() for t in weak_topics])
    if recommended_topic:
        needed_topics.add(recommended_topic.lower())

    mentors = db.query(Mentor).filter(Mentor.is_active == True).all()
    matches = []

    for mentor in mentors:
        reasons = []
        # Parse expertise
        mentor_skills = [s.strip().lower() for s in (mentor.expertise or "").split(",") if s.strip()]
        
        # 1. Topic alignment (0-40 points)
        matching_skills = [s for s in mentor_skills if any(need in s or s in need for need in needed_topics)]
        if matching_skills:
            topic_score = 40.0
            reasons.append(f"Strong expertise in target topic '{matching_skills[0].title()}'")
        elif mentor_skills:
            topic_score = 25.0
            reasons.append(f"Broad domain competency in {mentor_skills[0].title()}")
        else:
            topic_score = 15.0

        # 2. Availability (0-20 points)
        avail = mentor.availability_hours or 0.0
        if avail >= 15.0:
            avail_score = 20.0
            reasons.append(f"High availability ({int(avail)} hours/week)")
        elif avail >= 8.0:
            avail_score = 15.0
            reasons.append(f"Standard availability ({int(avail)} hours/week)")
        else:
            avail_score = 8.0
            reasons.append(f"Limited availability ({int(avail)} hours/week)")

        # 3. Workload capacity (0-20 points)
        workload = mentor.current_workload or 0
        if workload == 0:
            workload_score = 20.0
            reasons.append("Zero current caseload - immediate 1-on-1 capacity")
        elif workload <= 2:
            workload_score = 16.0
            reasons.append("Low current caseload - excellent availability")
        elif workload <= 5:
            workload_score = 10.0
        else:
            workload_score = 5.0
            reasons.append("Moderate existing caseload")

        # 4. Effectiveness score (0-20 points)
        eff = mentor.effectiveness_score or 85.0
        eff_score = round((eff / 100.0) * 20.0, 1)
        if eff >= 90.0:
            reasons.append(f"Exceptional student outcome track record ({int(eff)}% rating)")
        elif eff >= 80.0:
            reasons.append(f"Solid historical outcome track record ({int(eff)}% rating)")

        total_match_score = round(topic_score + avail_score + workload_score + eff_score, 1)
        total_match_score = min(99.0, max(45.0, total_match_score))

        matches.append({
            "mentor_id": mentor.id,
            "mentor_name": mentor.full_name,
            "mentor_email": mentor.email,
            "expertise": [s.strip() for s in (mentor.expertise or "").split(",") if s.strip()],
            "match_score": total_match_score,
            "match_reasons": reasons,
            "availability_hours": mentor.availability_hours,
            "current_workload": mentor.current_workload,
            "effectiveness_score": mentor.effectiveness_score
        })

    # Sort descending by match score
    matches.sort(key=lambda m: m["match_score"], reverse=True)
    return matches
