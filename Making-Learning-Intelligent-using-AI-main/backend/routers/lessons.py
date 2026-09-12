from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging

from backend.database import get_db
from backend.models import Lesson, Course, LessonProgress, Enrollment
from backend.schemas import LessonCreate, LessonUpdate, LessonResponse, LessonProgressResponse
from backend.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(lesson: LessonCreate, db: Session = Depends(get_db)):
    """Create a new lesson under a course"""
    course = db.query(Course).filter(Course.id == lesson.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_lesson = Lesson(
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        order=lesson.order or 1,
        duration_minutes=lesson.duration_minutes or 15,
        topic=lesson.topic
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson


@router.get("/course/{course_id}", response_model=List[LessonResponse])
def get_course_lessons(
    course_id: int,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all lessons for a course in sequential order, with optional completion status for a student"""
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order.asc()).all()
    
    completed_ids = set()
    if student_id:
        completed = db.query(LessonProgress.lesson_id).filter(
            LessonProgress.student_id == student_id,
            LessonProgress.is_completed == True
        ).all()
        completed_ids = {c[0] for c in completed}

    res = []
    for l in lessons:
        item = LessonResponse.model_validate(l)
        item.is_completed_by_current_student = l.id in completed_ids
        res.append(item)
    return res


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Get a single lesson by ID"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(lesson_id: int, update_data: LessonUpdate, db: Session = Depends(get_db)):
    """Update a lesson's content or order"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    data = update_data.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(lesson, k, v)

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Delete a lesson"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db.delete(lesson)
    db.commit()
    return None


@router.post("/{lesson_id}/complete", response_model=LessonProgressResponse)
def complete_lesson(
    lesson_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):
    """Mark a lesson completed by a student and update course enrollment progress"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    prog = db.query(LessonProgress).filter(
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.student_id == student_id
    ).first()

    if not prog:
        prog = LessonProgress(
            lesson_id=lesson_id,
            student_id=student_id,
            is_completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(prog)
    else:
        prog.is_completed = True
        prog.completed_at = datetime.utcnow()

    db.commit()

    # Recalculate enrollment progress percentage
    total_course_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).count()
    if total_course_lessons > 0:
        course_lesson_ids = [l.id for l in db.query(Lesson.id).filter(Lesson.course_id == lesson.course_id).all()]
        completed_count = db.query(LessonProgress).filter(
            LessonProgress.student_id == student_id,
            LessonProgress.lesson_id.in_(course_lesson_ids),
            LessonProgress.is_completed == True
        ).count()
        progress_pct = round((completed_count / total_course_lessons) * 100.0, 1)

        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == student_id,
            Enrollment.course_id == lesson.course_id
        ).first()
        if enrollment:
            enrollment.progress_percentage = progress_pct
            db.commit()

    return {
        "lesson_id": prog.lesson_id,
        "student_id": prog.student_id,
        "is_completed": prog.is_completed,
        "completed_at": prog.completed_at
    }
