from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from backend.database import get_db
from backend.models import Teacher
from backend.schemas import TeacherCreate, TeacherUpdate, TeacherResponse
from backend.utils import hash_password

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(teacher: TeacherCreate, db: Session = Depends(get_db)):
    """Create a new teacher"""
    try:
        existing_teacher = db.query(Teacher).filter(Teacher.email == teacher.email).first()
        if existing_teacher:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Teacher with this email already exists"
            )
        
        db_teacher = Teacher(
            email=teacher.email,
            full_name=teacher.full_name,
            department=teacher.department,
            specialization=teacher.specialization,
            hashed_password=hash_password(teacher.password)
        )
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        
        logger.info(f"Created teacher: {db_teacher.email}")
        return db_teacher
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating teacher: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create teacher"
        )


@router.get("/", response_model=List[TeacherResponse])
def get_teachers(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get all teachers with pagination"""
    try:
        teachers = db.query(Teacher).offset(skip).limit(limit).all()
        return teachers
    except Exception as e:
        logger.error(f"Error fetching teachers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teachers"
        )


@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Get a specific teacher by ID"""
    try:
        teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        return teacher
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching teacher {teacher_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teacher"
        )


@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(teacher_id: int, teacher_update: TeacherUpdate, db: Session = Depends(get_db)):
    """Update a teacher"""
    try:
        teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        
        update_data = teacher_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(teacher, field, value)
        
        db.commit()
        db.refresh(teacher)
        
        logger.info(f"Updated teacher: {teacher.email}")
        return teacher
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating teacher {teacher_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update teacher"
        )


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Delete a teacher (soft delete)"""
    try:
        teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found"
            )
        
        teacher.is_active = False
        db.commit()
        
        logger.info(f"Deleted teacher: {teacher.email}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting teacher {teacher_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete teacher"
        )
