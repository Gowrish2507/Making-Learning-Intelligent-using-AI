import json
import logging
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from backend.models import Student, Assessment, StudentKnowledgeProfile, Enrollment, LessonProgress

logger = logging.getLogger(__name__)


def calculate_student_profile(db: Session, student_id: int) -> StudentKnowledgeProfile:
    """
    LearnIQ Knowledge Profile & Risk Estimation Engine
    
    Calculates:
    - Topic-level mastery scores
    - Overall mastery score
    - Performance trend (IMPROVING, DECLINING, STABLE)
    - Strong topics and weak topics
    - Explainable risk score (0-100) & risk level (LOW, MEDIUM, HIGH)
    - Explainable reasons for risk
    - Actionable personalized recommendation with "Why?"
    - 3-Tier support level (TIER_1_AI, TIER_2_MENTOR, TIER_3_FACULTY)
    
    Architecture is extensible to plug in trained ML models (e.g. XGBoost or Knowledge Tracing).
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student {student_id} not found")

    # Fetch all assessments ordered by completion date
    assessments = db.query(Assessment).filter(
        Assessment.student_id == student_id
    ).order_by(Assessment.created_at.asc()).all()

    # Track assessments grouped by topic
    topic_scores: Dict[str, List[float]] = {}
    all_scores: List[float] = []

    for a in assessments:
        score_pct = (a.score / a.max_score * 100.0) if a.max_score and a.max_score > 0 else (a.score or 0.0)
        score_pct = max(0.0, min(100.0, score_pct))
        all_scores.append(score_pct)
        
        topic_name = a.topic or "General Fundamentals"
        if topic_name not in topic_scores:
            topic_scores[topic_name] = []
        topic_scores[topic_name].append(score_pct)

    # Calculate weighted topic mastery
    # Weight recent attempts more heavily (65% recent attempt, 35% past attempts)
    topic_mastery: Dict[str, float] = {}
    for topic, scores in topic_scores.items():
        if len(scores) == 1:
            topic_mastery[topic] = round(scores[0], 1)
        else:
            recent_score = scores[-1]
            prior_avg = sum(scores[:-1]) / len(scores[:-1])
            weighted = (recent_score * 0.65) + (prior_avg * 0.35)
            topic_mastery[topic] = round(weighted, 1)

    # Default fallback topics if student has no assessments yet
    if not topic_mastery:
        topic_mastery = {"Fundamentals": 70.0}

    # Categorize Strong (>= 75%) and Weak (< 60%) topics
    strong_topics = [t for t, m in topic_mastery.items() if m >= 75.0]
    weak_topics = [t for t, m in topic_mastery.items() if m < 60.0]
    
    # Calculate Overall Mastery
    if all_scores:
        overall_mastery = round(sum(topic_mastery.values()) / len(topic_mastery), 1)
    else:
        overall_mastery = 65.0

    # Calculate Performance Trend
    trend = "STABLE"
    score_delta = 0.0
    if len(all_scores) >= 2:
        recent_chunk = all_scores[-2:]
        earlier_chunk = all_scores[:-2] if len(all_scores) > 2 else [all_scores[0]]
        avg_recent = sum(recent_chunk) / len(recent_chunk)
        avg_earlier = sum(earlier_chunk) / len(earlier_chunk)
        score_delta = avg_recent - avg_earlier
        if score_delta > 5.0:
            trend = "IMPROVING"
        elif score_delta < -5.0:
            trend = "DECLINING"
        else:
            trend = "STABLE"

    # Risk Calculation Algorithm & Explainability Generation
    risk_score = 15.0  # baseline
    risk_reasons: List[str] = []
    predicted_difficult_topics: List[str] = []

    # Reason 1: Mastery level
    if overall_mastery < 45.0:
        risk_score += 40.0
        risk_reasons.append(f"Overall mastery is critically low ({overall_mastery}%), indicating widespread foundational gaps.")
    elif overall_mastery < 60.0:
        risk_score += 25.0
        risk_reasons.append(f"Overall mastery is below the 60% competency threshold ({overall_mastery}%).")

    # Reason 2: Trend
    if trend == "DECLINING":
        drop_pct = abs(round(score_delta, 1))
        risk_score += 25.0
        risk_reasons.append(f"Recent assessment scores declined by {drop_pct}%, showing regression in retention.")
    elif trend == "IMPROVING":
        risk_score = max(0.0, risk_score - 15.0)

    # Reason 3: Weak prerequisite topics
    if weak_topics:
        risk_score += (len(weak_topics) * 12.0)
        weakest_topic = min(weak_topics, key=lambda t: topic_mastery[t])
        weakest_val = topic_mastery[weakest_topic]
        risk_reasons.append(f"Severe deficit in '{weakest_topic}' ({weakest_val}% mastery), which is a key prerequisite.")
        predicted_difficult_topics.extend(weak_topics)

    # Reason 4: Recent failed attempts (score < 50%)
    low_scores_count = sum(1 for s in all_scores[-3:] if s < 50.0)
    if low_scores_count >= 2:
        risk_score += 20.0
        risk_reasons.append(f"{low_scores_count} of the last 3 assessments resulted in scores below 50%.")

    # Bound risk score between 5.0 and 95.0
    risk_score = round(max(5.0, min(95.0, risk_score)), 1)

    # Determine Risk Level & 3-Tier Escalation
    if risk_score >= 70.0:
        risk_level = "HIGH"
        support_tier = "TIER_3_FACULTY"
    elif risk_score >= 40.0:
        risk_level = "MEDIUM"
        support_tier = "TIER_2_MENTOR"
    else:
        risk_level = "LOW"
        support_tier = "TIER_1_AI"

    if not risk_reasons:
        risk_reasons.append("Learning pace and performance metrics are consistent with syllabus expectations.")

    # Generate Personalized Recommendation with Explainable "Why"
    if weak_topics:
        primary_target_topic = min(weak_topics, key=lambda t: topic_mastery[t])
        current_m = topic_mastery[primary_target_topic]
        recommended_topic = primary_target_topic
        recommended_resource = f"Interactive Module: Mastering {primary_target_topic} Fundamentals"
        recommended_action = f"Complete targeted practice questions on {primary_target_topic}"
        recommendation_reason = (
            f"Recommended because your mastery in '{primary_target_topic}' is currently {current_m}%, "
            f"which is below the 60% proficiency threshold. Solidifying this topic will prevent escalation."
        )
    else:
        # Suggest next progression topic
        all_known = list(topic_mastery.keys())
        recommended_topic = f"Advanced {all_known[0]}" if all_known else "Next Learning Unit"
        recommended_resource = f"Advanced Case Studies in {recommended_topic}"
        recommended_action = "Attempt challenging problem set for bonus mastery"
        recommendation_reason = (
            f"Recommended because you have mastered foundational topics ({overall_mastery}% overall). "
            f"Pushing forward to advanced applications will deepen conceptual synthesis."
        )

    # Engagement & consistency indicators
    engagement_score = round(max(40.0, min(98.0, 70.0 + (len(assessments) * 4.0) - (risk_score * 0.2))), 1)
    consistency_score = round(max(40.0, min(95.0, 85.0 - (abs(score_delta) * 1.5))), 1)

    # Update or create the profile in DB
    profile = db.query(StudentKnowledgeProfile).filter(
        StudentKnowledgeProfile.student_id == student_id
    ).first()

    if not profile:
        profile = StudentKnowledgeProfile(student_id=student_id)
        db.add(profile)

    profile.overall_mastery = overall_mastery
    profile.risk_score = risk_score
    profile.risk_level = risk_level
    profile.performance_trend = trend
    profile.topic_mastery_json = json.dumps(topic_mastery)
    profile.weak_topics_json = json.dumps(weak_topics)
    profile.strong_topics_json = json.dumps(strong_topics)
    profile.predicted_difficult_topics_json = json.dumps(predicted_difficult_topics)
    profile.risk_reasons_json = json.dumps(risk_reasons)
    profile.recommended_topic = recommended_topic
    profile.recommended_resource = recommended_resource
    profile.recommended_action = recommended_action
    profile.recommendation_reason = recommendation_reason
    profile.support_tier = support_tier
    profile.engagement_score = engagement_score
    profile.consistency_score = consistency_score
    profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(profile)
    logger.info(f"Knowledge Profile updated for student {student_id}: Mastery={overall_mastery}%, Risk={risk_level} ({risk_score}%), Tier={support_tier}")
    return profile


def get_profile_data(profile: StudentKnowledgeProfile, student: Optional[Student] = None) -> Dict[str, Any]:
    """Helper to convert StudentKnowledgeProfile DB model into serializable dict"""
    topic_mastery = json.loads(profile.topic_mastery_json or "{}")
    weak_topics = json.loads(profile.weak_topics_json or "[]")
    strong_topics = json.loads(profile.strong_topics_json or "[]")
    predicted_difficult_topics = json.loads(profile.predicted_difficult_topics_json or "[]")
    risk_reasons = json.loads(profile.risk_reasons_json or "[]")

    return {
        "id": profile.id,
        "student_id": profile.student_id,
        "student_name": student.full_name if student else None,
        "overall_mastery": profile.overall_mastery,
        "risk_score": profile.risk_score,
        "risk_level": profile.risk_level,
        "performance_trend": profile.performance_trend,
        "topic_mastery": topic_mastery,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "predicted_difficult_topics": predicted_difficult_topics,
        "risk_reasons": risk_reasons,
        "recommended_topic": profile.recommended_topic,
        "recommended_resource": profile.recommended_resource,
        "recommended_action": profile.recommended_action,
        "recommendation_reason": profile.recommendation_reason,
        "support_tier": profile.support_tier,
        "engagement_score": profile.engagement_score,
        "consistency_score": profile.consistency_score,
        "updated_at": profile.updated_at
    }
