from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# --------------------------------------------------
# Authentication Schemas
# --------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    email: str
    full_name: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None  # Optional hint: "student", "teacher", "mentor" (auto-detected if omitted)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    # Role-specific fields
    grade_level: Optional[str] = None
    learning_style: Optional[str] = None
    department: Optional[str] = None
    specialization: Optional[str] = None
    expertise: Optional[str] = None


# --------------------------------------------------
# Student Schemas
# --------------------------------------------------
class StudentBase(BaseModel):
    email: EmailStr
    full_name: str
    grade_level: Optional[str] = None
    learning_style: Optional[str] = None


class StudentCreate(StudentBase):
    password: str


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    grade_level: Optional[str] = None
    learning_style: Optional[str] = None


class StudentResponse(StudentBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# Teacher Schemas
# --------------------------------------------------
class TeacherBase(BaseModel):
    email: EmailStr
    full_name: str
    department: Optional[str] = None
    specialization: Optional[str] = None


class TeacherCreate(TeacherBase):
    password: str


class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    specialization: Optional[str] = None


class TeacherResponse(TeacherBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# Mentor Schemas
# --------------------------------------------------
class MentorBase(BaseModel):
    email: EmailStr
    full_name: str
    expertise: Optional[str] = None
    availability_hours: Optional[float] = 10.0
    bio: Optional[str] = None


class MentorCreate(MentorBase):
    password: str


class MentorUpdate(BaseModel):
    full_name: Optional[str] = None
    expertise: Optional[str] = None
    availability_hours: Optional[float] = None
    bio: Optional[str] = None


class MentorResponse(MentorBase):
    id: int
    current_workload: int
    effectiveness_score: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# Course Schemas
# --------------------------------------------------
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    difficulty_level: Optional[str] = None


class CourseCreate(CourseBase):
    teacher_id: int


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    difficulty_level: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    id: int
    teacher_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# Lesson Schemas
# --------------------------------------------------
class LessonBase(BaseModel):
    course_id: int
    title: str
    content: Optional[str] = None
    order: Optional[int] = 1
    duration_minutes: Optional[int] = 15
    topic: Optional[str] = None


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    duration_minutes: Optional[int] = None
    topic: Optional[str] = None


class LessonResponse(LessonBase):
    id: int
    created_at: datetime
    is_completed_by_current_student: Optional[bool] = False
    
    class Config:
        from_attributes = True


class LessonProgressResponse(BaseModel):
    lesson_id: int
    student_id: int
    is_completed: bool
    completed_at: Optional[datetime] = None


# --------------------------------------------------
# Enrollment Schemas
# --------------------------------------------------
class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    progress_percentage: Optional[float] = None
    status: Optional[str] = None


class EnrollmentResponse(EnrollmentBase):
    id: int
    enrolled_at: datetime
    progress_percentage: float
    status: str
    course_title: Optional[str] = None
    course_description: Optional[str] = None
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# Assessment Schemas
# --------------------------------------------------
class AssessmentBase(BaseModel):
    title: str
    assessment_type: Optional[str] = "quiz"
    topic: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = 100.0
    feedback: Optional[str] = None


class AssessmentCreate(AssessmentBase):
    student_id: int
    course_id: Optional[int] = None
    reassessment_of_id: Optional[int] = None


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    completed_at: Optional[datetime] = None


class AssessmentResponse(AssessmentBase):
    id: int
    student_id: int
    course_id: Optional[int] = None
    reassessment_of_id: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# AI Knowledge Engine Schemas
# --------------------------------------------------
class KnowledgeProfileResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    overall_mastery: float
    risk_score: float
    risk_level: str
    performance_trend: str
    topic_mastery: Dict[str, float]
    weak_topics: List[str]
    strong_topics: List[str]
    predicted_difficult_topics: List[str]
    risk_reasons: List[str]
    recommended_topic: Optional[str] = None
    recommended_resource: Optional[str] = None
    recommended_action: Optional[str] = None
    recommendation_reason: Optional[str] = None
    support_tier: str
    engagement_score: float
    consistency_score: float
    updated_at: datetime


class RiskResponse(BaseModel):
    student_id: int
    risk_score: float
    risk_level: str
    reasons: List[str]
    predicted_difficult_topics: List[str]
    support_tier: str
    explanation: str


class RecommendationResponse(BaseModel):
    student_id: int
    recommended_next: str
    topic: str
    recommended_resource: str
    recommended_action: str
    explanation: str
    support_tier: str
    difficulty_adjustment: str
    practice_resources: List[Dict[str, str]] = []


# --------------------------------------------------
# Mentor & Matching Schemas
# --------------------------------------------------
class MentorMatchResponse(BaseModel):
    mentor_id: int
    mentor_name: str
    mentor_email: str
    expertise: List[str]
    match_score: float
    match_reasons: List[str]
    availability_hours: float
    current_workload: int
    effectiveness_score: float


class MentorshipAssignmentCreate(BaseModel):
    student_id: int
    mentor_id: int
    course_id: Optional[int] = None
    topic: Optional[str] = None


class MentorshipAssignmentResponse(BaseModel):
    id: int
    student_id: int
    mentor_id: int
    course_id: Optional[int] = None
    topic: Optional[str] = None
    match_score: float
    match_reasons: Optional[str] = None
    status: str
    created_at: datetime
    mentor_name: Optional[str] = None
    student_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class MentorshipSessionCreate(BaseModel):
    assignment_id: int
    notes: Optional[str] = None
    recommended_resources: Optional[str] = None
    action_items: Optional[str] = None


class MentorshipSessionResponse(BaseModel):
    id: int
    assignment_id: int
    session_date: datetime
    notes: Optional[str] = None
    recommended_resources: Optional[str] = None
    action_items: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# --------------------------------------------------
# Intervention Schemas
# --------------------------------------------------
class InterventionCreate(BaseModel):
    student_id: int
    course_id: Optional[int] = None
    topic: Optional[str] = None
    tier: str
    trigger_reason: str
    faculty_notes: Optional[str] = None


class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    faculty_notes: Optional[str] = None
    mentor_notes: Optional[str] = None
    outcome: Optional[str] = None


class InterventionResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    course_id: Optional[int] = None
    topic: Optional[str] = None
    tier: str
    trigger_reason: str
    status: str
    faculty_notes: Optional[str] = None
    mentor_notes: Optional[str] = None
    before_mastery: Optional[float] = None
    before_risk: Optional[float] = None
    after_mastery: Optional[float] = None
    after_risk: Optional[float] = None
    outcome: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ReassessmentRequest(BaseModel):
    intervention_id: int
    topic: str
    score: float
    max_score: float = 100.0


class ReassessmentResponse(BaseModel):
    intervention_id: int
    student_id: int
    topic: str
    score: float
    before_mastery: float
    before_risk: float
    after_mastery: float
    after_risk: float
    outcome: str
    message: str


# --------------------------------------------------
# Teacher Dashboard Analytics Schema
# --------------------------------------------------
class TeacherDashboardStats(BaseModel):
    total_students: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    average_class_mastery: float
    active_courses_count: int
    pending_interventions_count: int
    risk_distribution: List[Dict[str, Any]]
    topic_weaknesses: List[Dict[str, Any]]
    high_risk_students: List[Dict[str, Any]]
    recent_assessments: List[Dict[str, Any]]
