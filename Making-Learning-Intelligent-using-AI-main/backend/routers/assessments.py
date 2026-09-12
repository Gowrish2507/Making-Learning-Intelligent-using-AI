from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from backend.database import get_db
from backend.models import Assessment
from backend.schemas import AssessmentCreate, AssessmentUpdate, AssessmentResponse
from backend.services.knowledge_engine import calculate_student_profile

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(assessment: AssessmentCreate, db: Session = Depends(get_db)):
    """
    Create a new assessment submission.
    Automatically recalculates the student's knowledge profile and risk score!
    """
    try:
        db_assessment = Assessment(
            student_id=assessment.student_id,
            course_id=assessment.course_id,
            title=assessment.title,
            assessment_type=assessment.assessment_type or "quiz",
            topic=assessment.topic or "General",
            score=assessment.score,
            max_score=assessment.max_score or 100.0,
            feedback=assessment.feedback,
            reassessment_of_id=assessment.reassessment_of_id
        )
        db.add(db_assessment)
        db.commit()
        db.refresh(db_assessment)
        
        # Trigger Knowledge Profile & Risk recalculation
        try:
            calculate_student_profile(db, db_assessment.student_id)
        except Exception as ke_err:
            logger.warning(f"Could not recalculate profile for student {db_assessment.student_id}: {ke_err}")

        logger.info(f"Created assessment: {db_assessment.title} for student {db_assessment.student_id}")
        return db_assessment
    except Exception as e:
        logger.error(f"Error creating assessment: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create assessment"
        )


@router.get("/", response_model=List[AssessmentResponse])
def get_assessments(
    skip: int = 0,
    limit: int = 50,
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all assessments with optional filtering by student or course"""
    try:
        query = db.query(Assessment)
        if student_id is not None:
            query = query.filter(Assessment.student_id == student_id)
        if course_id is not None:
            query = query.filter(Assessment.course_id == course_id)
        assessments = query.order_by(Assessment.created_at.desc()).offset(skip).limit(limit).all()
        return assessments
    except Exception as e:
        logger.error(f"Error fetching assessments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch assessments"
        )


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get a specific assessment by ID"""
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching assessment {assessment_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch assessment"
        )


@router.put("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(assessment_id: int, assessment_update: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update an assessment and recalculate student profile"""
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        update_data = assessment_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assessment, field, value)
        
        db.commit()
        db.refresh(assessment)

        try:
            calculate_student_profile(db, assessment.student_id)
        except Exception as ke_err:
            logger.warning(f"Could not recalculate profile for student {assessment.student_id}: {ke_err}")

        logger.info(f"Updated assessment: {assessment.title}")
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating assessment {assessment_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update assessment"
        )


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Delete an assessment"""
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        sid = assessment.student_id
        db.delete(assessment)
        db.commit()
        
        try:
            calculate_student_profile(db, sid)
        except Exception:
            pass

        logger.info(f"Deleted assessment: {assessment.title}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting assessment {assessment_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete assessment"
        )
