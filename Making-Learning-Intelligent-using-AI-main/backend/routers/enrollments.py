from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from backend.database import get_db
from backend.models import Enrollment, Course, Student
from backend.schemas import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse
from backend.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
    """Enroll a student into a course"""
    # Verify student and course exist
    student = db.query(Student).filter(Student.id == enrollment.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(Enrollment).filter(
        Enrollment.student_id == enrollment.student_id,
        Enrollment.course_id == enrollment.course_id
    ).first()
    if existing:
        return existing

    new_enr = Enrollment(
        student_id=enrollment.student_id,
        course_id=enrollment.course_id,
        progress_percentage=0.0,
        status="active"
    )
    db.add(new_enr)
    db.commit()
    db.refresh(new_enr)
    
    # Attach course title for response
    new_enr.course_title = course.title
    new_enr.course_description = course.description
    return new_enr


@router.get("/student/{student_id}", response_model=List[EnrollmentResponse])
def get_student_enrollments(student_id: int, db: Session = Depends(get_db)):
    """Get all courses enrolled by a student"""
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    for e in enrollments:
        if e.course:
            e.course_title = e.course.title
            e.course_description = e.course.description
    return enrollments


@router.get("/course/{course_id}", response_model=List[EnrollmentResponse])
def get_course_enrollments(course_id: int, db: Session = Depends(get_db)):
    """Get all student enrollments for a specific course"""
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    for e in enrollments:
        if e.course:
            e.course_title = e.course.title
            e.course_description = e.course.description
    return enrollments


@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment(enrollment_id: int, update_data: EnrollmentUpdate, db: Session = Depends(get_db)):
    """Update progress or status of an enrollment"""
    enr = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enr:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    data = update_data.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(enr, k, v)

    db.commit()
    db.refresh(enr)
    if enr.course:
        enr.course_title = enr.course.title
        enr.course_description = enr.course.description
    return enr
