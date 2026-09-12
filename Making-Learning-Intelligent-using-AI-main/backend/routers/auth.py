from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from backend.database import get_db
from backend.models import Student, Teacher, Mentor
from backend.schemas import (
    Token, LoginRequest, UserResponse,
    StudentCreate, StudentResponse,
    TeacherCreate, TeacherResponse,
    MentorCreate, MentorResponse
)
from backend.utils import hash_password, verify_password
from backend.auth import create_access_token, get_current_user
from backend.services.knowledge_engine import calculate_student_profile

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user (Student, Teacher, or Mentor) and issue a JWT token.
    Supports role auto-detection based on email if role is not specified.
    """
    email = request.email.strip().lower()
    password = request.password
    role = request.role

    user_obj = None
    resolved_role = None

    # Try requested role or detect across all 3 tables
    if role == "student" or not role:
        s = db.query(Student).filter(Student.email == email).first()
        if s and verify_password(password, s.hashed_password):
            user_obj = s
            resolved_role = "student"

    if not user_obj and (role == "teacher" or not role):
        t = db.query(Teacher).filter(Teacher.email == email).first()
        if t and verify_password(password, t.hashed_password):
            user_obj = t
            resolved_role = "teacher"

    if not user_obj and (role == "mentor" or not role):
        m = db.query(Mentor).filter(Mentor.email == email).first()
        if m and verify_password(password, m.hashed_password):
            user_obj = m
            resolved_role = "mentor"

    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token(data={
        "sub": user_obj.email,
        "role": resolved_role,
        "user_id": user_obj.id,
        "name": user_obj.full_name
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": resolved_role,
        "user_id": user_obj.id,
        "email": user_obj.email,
        "full_name": user_obj.full_name
    }


@router.post("/register/student", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def register_student(data: StudentCreate, db: Session = Depends(get_db)):
    """Register a new student account"""
    email = data.email.strip().lower()
    existing = db.query(Student).filter(Student.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already exists")

    new_student = Student(
        email=email,
        full_name=data.full_name.strip(),
        grade_level=data.grade_level,
        learning_style=data.learning_style or "Visual / Practical",
        hashed_password=hash_password(data.password)
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Initialize knowledge profile
    try:
        calculate_student_profile(db, new_student.id)
    except Exception as e:
        logger.warning(f"Initial profile calculation skipped: {e}")

    return new_student


@router.post("/register/teacher", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def register_teacher(data: TeacherCreate, db: Session = Depends(get_db)):
    """Register a new teacher/faculty account"""
    email = data.email.strip().lower()
    existing = db.query(Teacher).filter(Teacher.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teacher with this email already exists")

    new_teacher = Teacher(
        email=email,
        full_name=data.full_name.strip(),
        department=data.department or "Computer Science",
        specialization=data.specialization or "Artificial Intelligence",
        hashed_password=hash_password(data.password)
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher


@router.post("/register/mentor", response_model=MentorResponse, status_code=status.HTTP_201_CREATED)
def register_mentor(data: MentorCreate, db: Session = Depends(get_db)):
    """Register a new mentor account"""
    email = data.email.strip().lower()
    existing = db.query(Mentor).filter(Mentor.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mentor with this email already exists")

    new_mentor = Mentor(
        email=email,
        full_name=data.full_name.strip(),
        expertise=data.expertise or "Python, Algorithms",
        availability_hours=data.availability_hours or 10.0,
        bio=data.bio or "Experienced tutor ready to assist students.",
        hashed_password=hash_password(data.password)
    )
    db.add(new_mentor)
    db.commit()
    db.refresh(new_mentor)
    return new_mentor


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Fetch current user's profile based on JWT token"""
    instance = current_user["user_instance"]
    role = current_user["role"]

    res = {
        "id": instance.id,
        "email": instance.email,
        "full_name": instance.full_name,
        "role": role,
        "is_active": instance.is_active,
        "created_at": instance.created_at,
        "grade_level": getattr(instance, "grade_level", None),
        "learning_style": getattr(instance, "learning_style", None),
        "department": getattr(instance, "department", None),
        "specialization": getattr(instance, "specialization", None),
        "expertise": getattr(instance, "expertise", None),
    }
    return res
