from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from backend.database import get_db
from backend.models import Student
from backend.schemas import StudentCreate, StudentUpdate, StudentResponse
from backend.utils import hash_password

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    try:
        # Check if student already exists
        existing_student = db.query(Student).filter(Student.email == student.email).first()
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student with this email already exists"
            )
        
        # Create new student
        db_student = Student(
            email=student.email,
            full_name=student.full_name,
            grade_level=student.grade_level,
            learning_style=student.learning_style,
            hashed_password=hash_password(student.password)
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        
        logger.info(f"Created student: {db_student.email}")
        return db_student
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating student: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create student"
        )


@router.get("/", response_model=List[StudentResponse])
def get_students(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get all students with pagination"""
    try:
        students = db.query(Student).offset(skip).limit(limit).all()
        return students
    except Exception as e:
        logger.error(f"Error fetching students: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch students"
        )


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        return student
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching student {student_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student"
        )


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student_update: StudentUpdate, db: Session = Depends(get_db)):
    """Update a student"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Update fields
        update_data = student_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(student, field, value)
        
        db.commit()
        db.refresh(student)
        
        logger.info(f"Updated student: {student.email}")
        return student
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating student {student_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update student"
        )


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student (soft delete by setting is_active to False)"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        student.is_active = False
        db.commit()
        
        logger.info(f"Deleted student: {student.email}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting student {student_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete student"
        )
