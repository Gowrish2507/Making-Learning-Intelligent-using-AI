import sys
import os
from datetime import datetime, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import SessionLocal, engine, Base
from backend.models import (
    Student, Teacher, Mentor, Course, Lesson, Enrollment,
    Assessment, MentorshipAssignment, MentorshipSession,
    Intervention, StudentKnowledgeProfile, LessonProgress
)
from backend.utils import hash_password
from backend.services.knowledge_engine import calculate_student_profile


def seed_database():
    print("Dropping existing tables and rebuilding schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    default_pwd = hash_password("password123")

    try:
        print("Seeding Teachers...")
        t1 = Teacher(
            email="sarah@learniq.com",
            full_name="Dr. Sarah Chen",
            department="Computer Science & Engineering",
            specialization="Machine Learning & Data Structures",
            hashed_password=default_pwd
        )
        t2 = Teacher(
            email="alan@learniq.com",
            full_name="Prof. Alan Turing",
            department="Computer Science",
            specialization="Theory of Computation & Databases",
            hashed_password=default_pwd
        )
        t_demo = Teacher(
            email="teacher@learniq.com",
            full_name="Dr. Sarah Chen (Teacher Demo)",
            department="Computer Science",
            specialization="AI & Systems",
            hashed_password=default_pwd
        )
        db.add_all([t1, t2, t_demo])
        db.commit()

        print("Seeding Mentors...")
        m1 = Mentor(
            email="rahul.mentor@learniq.com",
            full_name="Rahul Sharma",
            expertise="Arrays, Data Structures, Algorithms, Python",
            availability_hours=14.0,
            current_workload=1,
            effectiveness_score=94.0,
            bio="Senior CS Major, specialized in algorithmic problem solving and data structure visualization.",
            hashed_password=default_pwd
        )
        m2 = Mentor(
            email="divya.mentor@learniq.com",
            full_name="Divya Nair",
            expertise="Python, Functions, OOP, Recursion",
            availability_hours=12.0,
            current_workload=1,
            effectiveness_score=91.0,
            bio="Teaching assistant passionate about guiding beginners through functional abstractions.",
            hashed_password=default_pwd
        )
        m3 = Mentor(
            email="karan.mentor@learniq.com",
            full_name="Karan Joshi",
            expertise="Database Systems, SQL Joins, Normalization, Indexing",
            availability_hours=8.0,
            current_workload=0,
            effectiveness_score=88.0,
            bio="Database enthusiast with strong focus on SQL query optimization and schema design.",
            hashed_password=default_pwd
        )
        m_demo = Mentor(
            email="mentor@learniq.com",
            full_name="Rahul Sharma (Mentor Demo)",
            expertise="Arrays, Data Structures, Algorithms, Python",
            availability_hours=14.0,
            current_workload=1,
            effectiveness_score=94.0,
            bio="Mentor Demo Account",
            hashed_password=default_pwd
        )
        db.add_all([m1, m2, m3, m_demo])
        db.commit()

        print("Seeding Courses & Lessons...")
        c1 = Course(
            title="Python for Artificial Intelligence",
            description="Master modern Python programming paradigms with a focus on data analysis, functions, and algorithm foundations.",
            subject="Computer Science",
            difficulty_level="Beginner to Intermediate",
            teacher_id=t1.id
        )
        c2 = Course(
            title="Data Structures and Algorithms",
            description="In-depth study of abstract data types, dynamic arrays, linked structures, tree traversals, and algorithmic complexity.",
            subject="Computer Science",
            difficulty_level="Intermediate",
            teacher_id=t1.id
        )
        c3 = Course(
            title="Database Management Systems",
            description="Relational database architecture, relational algebra, SQL optimization, transactions, and normalization theory.",
            subject="Information Systems",
            difficulty_level="Intermediate",
            teacher_id=t2.id
        )
        db.add_all([c1, c2, c3])
        db.commit()

        # Lessons for Course 1
        l1_1 = Lesson(
            course_id=c1.id,
            title="Python Fundamentals & Variables",
            topic="Variables",
            order=1,
            duration_minutes=15,
            content="Variables in Python dynamically bind references to memory objects. Understanding primitive types (int, float, str, bool) and immutability."
        )
        l1_2 = Lesson(
            course_id=c1.id,
            title="Control Flow & Iteration Loops",
            topic="Loops",
            order=2,
            duration_minutes=20,
            content="Branching logic using if/elif/else statements and iteration loops (for, while) with range generators and break/continue constructs."
        )
        l1_3 = Lesson(
            course_id=c1.id,
            title="Functions, Parameters & Return Values",
            topic="Functions",
            order=3,
            duration_minutes=25,
            content="Defining modular functions, default parameters, variable-length *args and **kwargs, lambda expressions, and scope boundaries."
        )
        l1_4 = Lesson(
            course_id=c1.id,
            title="Data Structures: Lists, Tuples & Dictionaries",
            topic="Python Collections",
            order=4,
            duration_minutes=30,
            content="Manipulating sequences and hash-maps: list comprehensions, slicing notation, tuple unpacking, and dictionary key-value mappings."
        )

        # Lessons for Course 2
        l2_1 = Lesson(
            course_id=c2.id,
            title="Linear Data Structures: Arrays & Vectors",
            topic="Arrays",
            order=1,
            duration_minutes=25,
            content="Memory layout of contiguous arrays, pointer arithmetic, amortized resizing complexity O(1), and common algorithmic patterns (Two Pointers, Sliding Window)."
        )
        l2_2 = Lesson(
            course_id=c2.id,
            title="Singly and Doubly Linked Lists",
            topic="Linked Lists",
            order=2,
            duration_minutes=30,
            content="Dynamic node linking, pointer redirection, fast/slow runner cycle detection, and reversal techniques."
        )
        l2_3 = Lesson(
            course_id=c2.id,
            title="Recursion and Divide & Conquer",
            topic="Recursion",
            order=3,
            duration_minutes=35,
            content="Call stack mechanics, base case termination, recurrence relations, and Divide & Conquer algorithms."
        )

        # Lessons for Course 3
        l3_1 = Lesson(
            course_id=c3.id,
            title="Relational Schema Design & Constraints",
            topic="Relational Model",
            order=1,
            duration_minutes=20,
            content="Entity-Relationship modeling, primary keys, foreign key referential integrity constraints, and schema normalization."
        )
        l3_2 = Lesson(
            course_id=c3.id,
            title="Advanced SQL Queries & Table Joins",
            topic="SQL Joins",
            order=2,
            duration_minutes=30,
            content="Inner joins, Left/Right outer joins, self joins, grouping aggregates with HAVING clauses, and subqueries."
        )
        db.add_all([l1_1, l1_2, l1_3, l1_4, l2_1, l2_2, l2_3, l3_1, l3_2])
        db.commit()

        print("Seeding Students...")
        # 1. High-Risk Student: Arun Kumar
        s_arun = Student(
            email="arun@learniq.com",
            full_name="Arun Kumar",
            grade_level="Year 2 - Semester 3",
            learning_style="Kinesthetic / Practical",
            hashed_password=default_pwd
        )
        # 2. Medium-Risk Student: Priya Sharma
        s_priya = Student(
            email="priya@learniq.com",
            full_name="Priya Sharma",
            grade_level="Year 1 - Semester 2",
            learning_style="Visual / Conceptual",
            hashed_password=default_pwd
        )
        # 3. Low-Risk Student: Rahul Verma
        s_rahul = Student(
            email="rahul@learniq.com",
            full_name="Rahul Verma",
            grade_level="Year 3 - Semester 5",
            learning_style="Logical / Analytical",
            hashed_password=default_pwd
        )
        # 4. Low-Risk Student: Sneha Patel
        s_sneha = Student(
            email="sneha@learniq.com",
            full_name="Sneha Patel",
            grade_level="Year 2 - Semester 4",
            learning_style="Visual / Reading",
            hashed_password=default_pwd
        )
        # 5. Quick Demo Student
        s_demo = Student(
            email="student@learniq.com",
            full_name="Arun Kumar (Student Demo)",
            grade_level="Year 2 - Semester 3",
            learning_style="Kinesthetic / Practical",
            hashed_password=default_pwd
        )
        db.add_all([s_arun, s_priya, s_rahul, s_sneha, s_demo])
        db.commit()

        print("Enrolling Students in Courses...")
        for s in [s_arun, s_priya, s_rahul, s_sneha, s_demo]:
            db.add(Enrollment(student_id=s.id, course_id=c1.id, progress_percentage=60.0, status="active"))
            db.add(Enrollment(student_id=s.id, course_id=c2.id, progress_percentage=40.0, status="active"))
            db.add(Enrollment(student_id=s.id, course_id=c3.id, progress_percentage=25.0, status="active"))
        db.commit()

        print("Seeding Assessments...")
        # Arun (High Risk profile: low scores in Arrays and Recursion, declining trend)
        now = datetime.utcnow()
        for s in [s_arun, s_demo]:
            db.add(Assessment(
                student_id=s.id, course_id=c1.id, title="Python Syntax & Loops Diagnostic",
                assessment_type="quiz", topic="Loops", score=65.0, max_score=100.0,
                feedback="Acceptable foundation, but watch nested loop index termination.",
                created_at=now - timedelta(days=14), completed_at=now - timedelta(days=14)
            ))
            db.add(Assessment(
                student_id=s.id, course_id=c2.id, title="Arrays & Memory Pointers Quiz",
                assessment_type="quiz", topic="Arrays", score=38.0, max_score=100.0,
                feedback="Significant difficulty with array indexing, boundary conditions, and memory manipulation.",
                created_at=now - timedelta(days=7), completed_at=now - timedelta(days=7)
            ))
            db.add(Assessment(
                student_id=s.id, course_id=c2.id, title="Recursion & Call Stack Evaluation",
                assessment_type="quiz", topic="Recursion", score=32.0, max_score=100.0,
                feedback="Repeated infinite recursion errors. Base case conceptual confusion.",
                created_at=now - timedelta(days=2), completed_at=now - timedelta(days=2)
            ))

        # Priya (Medium Risk: struggled with Functions & Recursion, moderate overall)
        db.add(Assessment(
            student_id=s_priya.id, course_id=c1.id, title="Python Syntax Diagnostic",
            assessment_type="quiz", topic="Variables", score=82.0, max_score=100.0,
            feedback="Strong comprehension of primitives and syntax.",
            created_at=now - timedelta(days=12), completed_at=now - timedelta(days=12)
        ))
        db.add(Assessment(
            student_id=s_priya.id, course_id=c1.id, title="Functions & Scope Parameters Quiz",
            assessment_type="quiz", topic="Functions", score=52.0, max_score=100.0,
            feedback="Struggling with variable scope and parameter mutation.",
            created_at=now - timedelta(days=5), completed_at=now - timedelta(days=5)
        ))
        db.add(Assessment(
            student_id=s_priya.id, course_id=c2.id, title="Intro to Arrays Quiz",
            assessment_type="quiz", topic="Arrays", score=68.0, max_score=100.0,
            feedback="Fair performance on simple array iterations.",
            created_at=now - timedelta(days=2), completed_at=now - timedelta(days=2)
        ))

        # Rahul Verma (Low Risk: excellent performance across all topics)
        db.add(Assessment(
            student_id=s_rahul.id, course_id=c1.id, title="Python Advanced Mastery",
            assessment_type="quiz", topic="Functions", score=92.0, max_score=100.0,
            feedback="Excellent mastery of modular design and closures.",
            created_at=now - timedelta(days=10), completed_at=now - timedelta(days=10)
        ))
        db.add(Assessment(
            student_id=s_rahul.id, course_id=c2.id, title="Arrays & Vector Algorithms",
            assessment_type="quiz", topic="Arrays", score=88.0, max_score=100.0,
            feedback="Superb implementation of Two-Pointer and Sliding Window techniques.",
            created_at=now - timedelta(days=3), completed_at=now - timedelta(days=3)
        ))

        # Sneha Patel (Low Risk)
        db.add(Assessment(
            student_id=s_sneha.id, course_id=c1.id, title="Python Syntax Diagnostic",
            assessment_type="quiz", topic="Variables", score=85.0, max_score=100.0,
            feedback="Solid work.",
            created_at=now - timedelta(days=9), completed_at=now - timedelta(days=9)
        ))
        db.add(Assessment(
            student_id=s_sneha.id, course_id=c3.id, title="SQL Relational Schemas",
            assessment_type="quiz", topic="Relational Model", score=90.0, max_score=100.0,
            feedback="Clean entity normalization.",
            created_at=now - timedelta(days=4), completed_at=now - timedelta(days=4)
        ))
        db.commit()

        print("Computing Knowledge Profiles & Risk via AI Engine...")
        for s in [s_arun, s_priya, s_rahul, s_sneha, s_demo]:
            calculate_student_profile(db, s.id)

        print("Seeding Mentorship Assignments & Interventions for Demo Flow...")
        # Priya has a Tier 2 assignment with Mentor Divya
        asgn_priya = MentorshipAssignment(
            student_id=s_priya.id,
            mentor_id=m2.id,
            course_id=c1.id,
            topic="Functions",
            match_score=92.0,
            match_reasons="Strong Python expertise\nAvailable weekly tutoring hours\nLow current caseload\nProven track record with functional concepts",
            status="active",
            created_at=now - timedelta(days=4)
        )
        db.add(asgn_priya)
        db.commit()

        # Log a completed session for Priya
        db.add(MentorshipSession(
            assignment_id=asgn_priya.id,
            notes="Reviewed variable scope, global keyword nuances, and lambda syntax. Priya grasped parameter passing by reference well.",
            recommended_resources="Read Python Official Docs on Scopes and Namespaces; Complete 3 exercises on LeetCode Functions.",
            action_items="Practice writing 5 helper functions with keyword arguments.",
            status="completed",
            created_at=now - timedelta(days=2)
        ))

        # Active Tier 2 Intervention for Priya
        db.add(Intervention(
            student_id=s_priya.id,
            course_id=c1.id,
            topic="Functions",
            tier="TIER_2_MENTOR",
            trigger_reason="Mastery in Functions is 52%, below 60% threshold. Paired with Mentor Divya Nair.",
            status="active",
            mentor_notes="Session 1 completed. Student is progressing smoothly and ready for self-directed quiz.",
            before_mastery=67.0,
            before_risk=58.0
        ))

        # Arun has an escalated Tier 3 Faculty Intervention
        for target_student in [s_arun, s_demo]:
            it_arun = Intervention(
                student_id=target_student.id,
                course_id=c2.id,
                topic="Arrays & Recursion",
                tier="TIER_3_FACULTY",
                trigger_reason="Critical learning deficit in Arrays (38%) and Recursion (32%). Scores declined by 18%. Tier 1 AI and Tier 2 Peer support exhausted.",
                faculty_notes="Schedule 1-on-1 office hour review on memory indexing and pointer visualization. Require diagnostic reassessment after review.",
                status="active",
                before_mastery=35.0,
                before_risk=87.0,
                created_at=now - timedelta(days=3)
            )
            db.add(it_arun)

            # Also assign Mentor Rahul Sharma to Arun for active support
            db.add(MentorshipAssignment(
                student_id=target_student.id,
                mentor_id=m1.id,
                course_id=c2.id,
                topic="Arrays",
                match_score=94.0,
                match_reasons="Top domain expertise in Arrays & Data Structures\nHigh availability (14 hrs/week)\nOutstanding student outcome rating (94%)",
                status="active",
                created_at=now - timedelta(days=3)
            ))

        db.commit()
        print("Database seed completed successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
