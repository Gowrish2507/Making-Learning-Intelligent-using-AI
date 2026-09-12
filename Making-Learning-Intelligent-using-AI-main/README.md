# Adaptive Learning Platform

An AI-driven personalized education platform that provides adaptive learning experiences for students, actionable insights for teachers, and data-driven decision-making tools for administrators.

## Product Vision

To create a future where every learner receives personalized, adaptive education that proactively addresses their unique needs, empowering both students and educators through transparent AI-driven insights and scalable technology.

## Target Audience

- **Students**: Seeking personalized learning experiences tailored to their unique needs
- **Teachers**: Requiring actionable insights for timely intervention and support
- **Administrators**: Needing data-driven decision-making tools for institutional improvement

## Core Features

- **Student Management**: Complete CRUD operations for student profiles with learning preferences
- **Teacher Management**: Manage educator profiles with specializations and departments
- **Course Management**: Create and manage courses with difficulty levels and subjects
- **Assessment Tracking**: Track student performance with detailed feedback and scoring

## Technology Stack

- **Backend Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM (SQLite default, PostgreSQL/MySQL supported)
- **Authentication**: JWT with bcrypt password hashing
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Architecture**: Modular Monolith with clear separation of concerns

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment tool (venv or virtualenv)

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Create a virtual environment**:
```bash
python -m venv venv
```

3. **Activate the virtual environment**:
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

4. **Install dependencies**:
```bash
pip install -r backend/requirements.txt
```

5. **Set up environment variables**:
```bash
cp .env.example .env
```
Edit `.env` file and update the configuration values, especially:
- `SECRET_KEY`: Use a strong random string for production
- `DATABASE_URL`: Configure your database connection

## Running the Application

### Development Mode

Run the application with auto-reload enabled:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API Base URL: http://localhost:8000
- Interactive API Documentation (Swagger UI): http://localhost:8000/docs
- Alternative API Documentation (ReDoc): http://localhost:8000/redoc

### Production Mode

For production deployment:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Students
- `POST /api/v1/students/` - Create a new student
- `GET /api/v1/students/` - List all students (with pagination)
- `GET /api/v1/students/{student_id}` - Get student by ID
- `PUT /api/v1/students/{student_id}` - Update student
- `DELETE /api/v1/students/{student_id}` - Delete student (soft delete)

### Teachers
- `POST /api/v1/teachers/` - Create a new teacher
- `GET /api/v1/teachers/` - List all teachers (with pagination)
- `GET /api/v1/teachers/{teacher_id}` - Get teacher by ID
- `PUT /api/v1/teachers/{teacher_id}` - Update teacher
- `DELETE /api/v1/teachers/{teacher_id}` - Delete teacher (soft delete)

### Courses
- `POST /api/v1/courses/` - Create a new course
- `GET /api/v1/courses/` - List all courses (with pagination)
- `GET /api/v1/courses/{course_id}` - Get course by ID
- `PUT /api/v1/courses/{course_id}` - Update course
- `DELETE /api/v1/courses/{course_id}` - Delete course (soft delete)

### Assessments
- `POST /api/v1/assessments/` - Create a new assessment
- `GET /api/v1/assessments/` - List all assessments (with pagination)
- `GET /api/v1/assessments/{assessment_id}` - Get assessment by ID
- `PUT /api/v1/assessments/{assessment_id}` - Update assessment
- `DELETE /api/v1/assessments/{assessment_id}` - Delete assessment

## Project Structure

```
adaptive-learning-platform/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection and session
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── utils.py             # Utility functions (password hashing)
│   ├── requirements.txt     # Python dependencies
│   └── routers/             # API route handlers
│       ├── __init__.py
│       ├── students.py      # Student endpoints
│       ├── teachers.py      # Teacher endpoints
│       ├── courses.py       # Course endpoints
│       └── assessments.py   # Assessment endpoints
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Architecture Overview

The application follows a **Modular Monolith** architecture with clear separation of concerns:

- **Models Layer**: SQLAlchemy ORM models defining database schema
- **Schemas Layer**: Pydantic models for request/response validation
- **Routers Layer**: FastAPI route handlers for API endpoints
- **Database Layer**: Connection management and session handling
- **Configuration Layer**: Centralized settings management
- **Utils Layer**: Shared utility functions

## Database Configuration

### SQLite (Default)
The application uses SQLite by default for easy setup:
```
DATABASE_URL=sqlite:///./adaptive_learning.db
```

### PostgreSQL
For production, PostgreSQL is recommended:
```
DATABASE_URL=postgresql://user:password@localhost:5432/adaptive_learning
```

### MySQL
MySQL is also supported:
```
DATABASE_URL=mysql://user:password@localhost:3306/adaptive_learning
```

## Security Features

- **Password Hashing**: Bcrypt algorithm for secure password storage
- **JWT Authentication**: Token-based authentication (ready for implementation)
- **Input Validation**: Pydantic schemas validate all inputs
- **SQL Injection Prevention**: SQLAlchemy ORM prevents SQL injection
- **CORS Configuration**: Configurable allowed origins
- **Environment Variables**: Sensitive data stored in environment variables

## Development

### Adding New Features

1. **Create Model**: Add new model in `backend/models.py`
2. **Create Schema**: Add Pydantic schemas in `backend/schemas.py`
3. **Create Router**: Add new router file in `backend/routers/`
4. **Register Router**: Include router in `backend/main.py`

### Code Quality

- Follow PEP 8 style guidelines
- Add type hints to function signatures
- Include docstrings for functions and classes
- Add logging for important operations
- Handle errors gracefully with proper HTTP status codes

## Logging

The application includes structured logging:
- INFO level: Normal operations and successful actions
- ERROR level: Errors and exceptions

Logs include timestamps, logger names, and detailed messages.

## Future Enhancements

- AI-powered personalized learning recommendations
- Real-time progress tracking and analytics
- Interactive dashboards for teachers and administrators
- Advanced assessment analytics
- Integration with external learning management systems
- Mobile application support

## Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.

## License

[Specify your license here]
