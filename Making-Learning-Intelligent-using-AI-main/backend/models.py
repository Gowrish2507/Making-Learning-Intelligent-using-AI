from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base


class Student(Base):
    """Student model for learners in the platform"""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    grade_level = Column(String(50))
    learning_style = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")
    knowledge_profile = relationship("StudentKnowledgeProfile", back_populates="student", uselist=False, cascade="all, delete-orphan")
    mentorship_assignments = relationship("MentorshipAssignment", back_populates="student", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="student", cascade="all, delete-orphan")


class Teacher(Base):
    """Teacher model for educators in the platform"""
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    department = Column(String(100))
    specialization = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    courses = relationship("Course", back_populates="teacher")


class Mentor(Base):
    """Mentor model for peer/expert tutors in Tier 2 escalation"""
    __tablename__ = "mentors"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    expertise = Column(Text)  # Comma-separated or JSON list of topics (e.g., "Python, Functions, Data Structures")
    availability_hours = Column(Float, default=10.0)  # Available hours per week
    current_workload = Column(Integer, default=0)      # Number of active assigned students
    effectiveness_score = Column(Float, default=90.0)  # Percentage score of student improvement
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    assignments = relationship("MentorshipAssignment", back_populates="mentor")


class Course(Base):
    """Course model for learning content"""
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    subject = Column(String(100))
    difficulty_level = Column(String(50))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    teacher = relationship("Teacher", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")
    lessons = relationship("Lesson", back_populates="course")


class Lesson(Base):
    """Lesson model for course content units"""
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    order = Column(Integer, default=1)
    duration_minutes = Column(Integer, default=15)
    topic = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class LessonProgress(Base):
    """Tracks lesson completion per student"""
    __tablename__ = "lesson_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    student = relationship("Student", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress")


class Enrollment(Base):
    """Enrollment model linking students to courses"""
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress_percentage = Column(Float, default=0.0)
    status = Column(String(50), default="active")
    
    # Relationships
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Assessment(Base):
    """Assessment model for tracking student performance"""
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String(255), nullable=False)
    assessment_type = Column(String(50), default="quiz")  # "quiz", "midterm", "practice", "reassessment"
    topic = Column(String(100), nullable=True)            # Specific topic e.g. "Arrays", "Functions", "SQL Joins"
    score = Column(Float)
    max_score = Column(Float, default=100.0)
    feedback = Column(Text, nullable=True)
    reassessment_of_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="assessments")


class MentorshipAssignment(Base):
    """Assignment linking a student to a mentor (Tier 2 Escalation)"""
    __tablename__ = "mentorship_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    topic = Column(String(100), nullable=True)
    match_score = Column(Float, default=90.0)
    match_reasons = Column(Text, nullable=True)  # JSON or newline-separated explanation of why matched
    status = Column(String(50), default="active")  # "pending", "active", "completed", "escalated"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="mentorship_assignments")
    mentor = relationship("Mentor", back_populates="assignments")
    sessions = relationship("MentorshipSession", back_populates="assignment", cascade="all, delete-orphan")


class MentorshipSession(Base):
    """Session log recorded by a mentor"""
    __tablename__ = "mentorship_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("mentorship_assignments.id"), nullable=False)
    session_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    recommended_resources = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    status = Column(String(50), default="completed")  # "scheduled", "completed"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    assignment = relationship("MentorshipAssignment", back_populates="sessions")


class Intervention(Base):
    """Intervention tracking across the 3 tiers (AI, Mentor, Faculty)"""
    __tablename__ = "interventions"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    topic = Column(String(100), nullable=True)
    tier = Column(String(50), nullable=False)  # "TIER_1_AI", "TIER_2_MENTOR", "TIER_3_FACULTY"
    trigger_reason = Column(Text, nullable=False)
    status = Column(String(50), default="active")  # "active", "reassessing", "resolved", "escalated"
    faculty_notes = Column(Text, nullable=True)
    mentor_notes = Column(Text, nullable=True)
    
    # Before and after metrics for closed loop reassessment verification
    before_mastery = Column(Float, nullable=True)
    before_risk = Column(Float, nullable=True)
    after_mastery = Column(Float, nullable=True)
    after_risk = Column(Float, nullable=True)
    outcome = Column(String(100), nullable=True)  # "Intervention Successful", "Additional Support Recommended"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="interventions")


class StudentKnowledgeProfile(Base):
    """Calculated AI knowledge profile, risk and recommendations for a student"""
    __tablename__ = "student_knowledge_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    
    overall_mastery = Column(Float, default=0.0)      # 0 to 100
    risk_score = Column(Float, default=0.0)           # 0 to 100
    risk_level = Column(String(50), default="LOW")    # "LOW", "MEDIUM", "HIGH"
    performance_trend = Column(String(50), default="STABLE")  # "IMPROVING", "STABLE", "DECLINING"
    
    # JSON strings of topic mastery lists and explainability
    topic_mastery_json = Column(Text, default="{}")   # {"Arrays": 38, "Functions": 45, ...}
    weak_topics_json = Column(Text, default="[]")     # ["Arrays", "Recursion"]
    strong_topics_json = Column(Text, default="[]")   # ["Syntax", "Loops"]
    predicted_difficult_topics_json = Column(Text, default="[]")
    risk_reasons_json = Column(Text, default="[]")    # List of string reasons for why at risk
    
    # Recommendations
    recommended_topic = Column(String(100), nullable=True)
    recommended_resource = Column(String(255), nullable=True)
    recommended_action = Column(String(255), nullable=True)
    recommendation_reason = Column(Text, nullable=True)
    
    # Escalation Tier
    support_tier = Column(String(50), default="TIER_1_AI")  # "TIER_1_AI", "TIER_2_MENTOR", "TIER_3_FACULTY"
    
    # Learning behavior indicators
    engagement_score = Column(Float, default=80.0)
    consistency_score = Column(Float, default=75.0)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="knowledge_profile")
