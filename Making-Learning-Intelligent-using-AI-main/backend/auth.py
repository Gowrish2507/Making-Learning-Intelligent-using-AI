from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import Student, Teacher, Mentor
from backend.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 48)  # Generous session for hackathon demo
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> dict:
    """Get currently authenticated user dictionary and model instance"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    role: str = payload.get("role")
    user_id: int = payload.get("user_id")
    
    if email is None or role is None or user_id is None:
        raise credentials_exception
    
    user_obj = None
    if role == "student":
        user_obj = db.query(Student).filter(Student.id == user_id, Student.is_active == True).first()
    elif role == "teacher":
        user_obj = db.query(Teacher).filter(Teacher.id == user_id, Teacher.is_active == True).first()
    elif role == "mentor":
        user_obj = db.query(Mentor).filter(Mentor.id == user_id, Mentor.is_active == True).first()
    
    if user_obj is None:
        raise credentials_exception
    
    return {
        "user_id": user_id,
        "email": email,
        "role": role,
        "full_name": user_obj.full_name,
        "user_instance": user_obj
    }


def get_current_student(current_user: dict = Depends(get_current_user)) -> Student:
    """Ensure the authenticated user is a student"""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Student role required"
        )
    return current_user["user_instance"]


def get_current_teacher(current_user: dict = Depends(get_current_user)) -> Teacher:
    """Ensure the authenticated user is a teacher"""
    if current_user["role"] != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Teacher role required"
        )
    return current_user["user_instance"]


def get_current_mentor(current_user: dict = Depends(get_current_user)) -> Mentor:
    """Ensure the authenticated user is a mentor"""
    if current_user["role"] != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Mentor role required"
        )
    return current_user["user_instance"]
