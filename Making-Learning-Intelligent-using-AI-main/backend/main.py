from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from backend.config import settings
from backend.database import engine, Base
from backend.routers import (
    students, teachers, courses, assessments,
    auth, enrollments, lessons, knowledge,
    mentors, interventions, teacher_analytics
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting up LearnIQ Predictive AI Learning Platform...")
    # Create database tables if they do not exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully")
    yield
    logger.info("Shutting down LearnIQ API...")


app = FastAPI(
    title="LearnIQ API – Predictive AI Learning Platform",
    description="Intelligent EdTech backend with Knowledge Profile Tracing, Predictive Risk Assessment, and 3-Tier Support Escalation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon flexibility, including Vite on port 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["Teachers"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(lessons.router, prefix="/api/v1/lessons", tags=["Lessons"])
app.include_router(enrollments.router, prefix="/api/v1/enrollments", tags=["Enrollments"])
app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["Assessments"])

# AI & Support Escalation Routers
app.include_router(knowledge.router, prefix="/api/v1", tags=["AI Knowledge & Risk"])
app.include_router(mentors.router, prefix="/api/v1/mentors", tags=["Mentors"])
app.include_router(mentors.router, prefix="/api/v1/mentorship", tags=["Mentorship Operations"])
app.include_router(interventions.router, prefix="/api/v1/interventions", tags=["Interventions & Escalation"])
app.include_router(teacher_analytics.router, prefix="/api/v1/teacher-analytics", tags=["Teacher Analytics"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "platform": "LearnIQ",
        "motto": "Predict. Personalize. Intervene. Improve.",
        "version": "1.0.0",
        "status": "operational",
        "tiers": {
            "tier_1": "AI Personalized Support",
            "tier_2": "Peer & Expert Mentor Matching",
            "tier_3": "Faculty Escalation & Closed-Loop Reassessment"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "LearnIQ AI Engine"}
