import os
import sys
from datetime import datetime, date, timedelta

from database.session import SessionLocal, engine, Base
from models.all_models import (
    User, RoleEnum, Department, Student, Faculty, Subject, 
    Announcement, Attendance, Mark, Assignment, AssignmentSubmission, StudyMaterial,
    Timetable, Exam, LeaveRequest, ODRequest, Event, EventRegistration, Club, ClubMembership,
    Opportunity, Fee, Query, Notification, MentorAssignment, CounsellingRecord,
    ParentStudentMapping, Achievement, PlacementCompany, PlacementDrive, PlacementApplication,
    DocumentRecord, GenericRequest, AuditLog, SystemSetting, EmailLog, CalendarEvent,
    EveningClass, EveningClassStudent
)
from utils.security import get_password_hash

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    print("Seeding CampusPulse Complete Ecosystem Data...")

    # 1. System Settings
    settings_data = [
        ("min_attendance_threshold", "75", "Minimum attendance percentage required to appear for semester exams"),
        ("pass_mark_threshold", "50", "Minimum score percentage required to pass an internal or term assessment"),
        ("academic_year", "2026-2027", "Current academic session"),
        ("institution_name", "CampusPulse Institute of Technology", "College institution official name"),
        ("semester_cycle", "EVEN_2026", "Current active semester cycle")
    ]
    for key, val, desc in settings_data:
        s = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if not s:
            db.add(SystemSetting(key=key, value=val, description=desc))
    db.commit()

    # 2. Departments
    dept_map = {}
    departments_info = [
        ("Computer Science & Engineering", "CSE"),
        ("Artificial Intelligence & Data Science", "AIDS"),
        ("Electronics & Communication Engineering", "ECE"),
        ("Electrical & Electronics Engineering", "EEE"),
        ("Mechanical Engineering", "MECH")
    ]
    for name, code in departments_info:
        d = db.query(Department).filter(Department.code == code).first()
        if not d:
            d = Department(name=name, code=code)
            db.add(d)
            db.commit()
            db.refresh(d)
        dept_map[code] = d

    # 3. Users and Profiles
    # Admin
    admin_user = db.query(User).filter(User.email == "admin@campuspulse.com").first()
    if not admin_user:
        admin_user = User(email="admin@campuspulse.com", hashed_password=get_password_hash("password123"), role=RoleEnum.ADMIN)
        db.add(admin_user)
        db.commit()

    # Principal
    principal_user = db.query(User).filter(User.email == "principal@campuspulse.com").first()
    if not principal_user:
        principal_user = User(email="principal@campuspulse.com", hashed_password=get_password_hash("password123"), role=RoleEnum.PRINCIPAL)
        db.add(principal_user)
        db.commit()
        db.refresh(principal_user)
        db.add(Faculty(user_id=principal_user.id, name="Dr. Margaret Hamilton", department_id=dept_map["CSE"].id, phone="9876543210"))
        db.commit()

    # HOD (CSE)
    hod_user = db.query(User).filter(User.email == "hod@campuspulse.com").first()
    if not hod_user:
        hod_user = User(email="hod@campuspulse.com", hashed_password=get_password_hash("password123"), role=RoleEnum.HOD)
        db.add(hod_user)
        db.commit()
        db.refresh(hod_user)
        db.add(Faculty(user_id=hod_user.id, name="Dr. Ada Lovelace", department_id=dept_map["CSE"].id, phone="9876543211"))
        db.commit()

    # Faculty (CSE)
    faculty_user = db.query(User).filter(User.email == "faculty@campuspulse.com").first()
    if not faculty_user:
        faculty_user = User(email="faculty@campuspulse.com", hashed_password=get_password_hash("password123"), role=RoleEnum.FACULTY)
        db.add(faculty_user)
        db.commit()
        db.refresh(faculty_user)
        db.add(Faculty(user_id=faculty_user.id, name="Dr. Alan Turing", department_id=dept_map["CSE"].id, phone="9876543212"))
        db.commit()

    # Mentor (CSE)
    mentor_user = db.query(User).filter(User.email == "mentor@campuspulse.com").first()
    if not mentor_user:
        mentor_user = User(email="mentor@campuspulse.com", hashed_password=get_password_hash("password123"), role=RoleEnum.MENTOR)
        db.add(mentor_user)
        db.commit()
        db.refresh(mentor_user)
        db.add(Faculty(user_id=mentor_user.id, name="Prof. Grace Hopper", department_id=dept_map["CSE"].id, phone="9876543213"))
        db.commit()

    mentor_faculty = db.query(Faculty).filter(Faculty.name == "Prof. Grace Hopper").first()
    cse_faculty = db.query(Faculty).filter(Faculty.name == "Dr. Alan Turing").first()

    # Students
    students_data = [
        ("student@campuspulse.com", "CS2026001", "Alice Smith", "CSE", 3, 6, "9123456780", "Python, React, Algorithms", "AI, Open Source"),
        ("brian@campuspulse.com", "AI2026002", "Brian Kernighan", "AIDS", 3, 6, "9123456781", "PyTorch, SQL", "Data Science, Robotics"),
        ("clara@campuspulse.com", "EC2026003", "Clara Barton", "ECE", 2, 4, "9123456782", "Embedded C, IoT, Verilog", "Hardware, Competitive Programming"),
        ("david@campuspulse.com", "ME2026004", "David Miller", "MECH", 4, 8, "9123456783", "AutoCAD, SolidWorks", "Automotive, Drone Design")
    ]

    student_objs = {}
    for email, reg, name, dcode, yr, sem, phone, skills, interests in students_data:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(email=email, hashed_password=get_password_hash("password123"), role=RoleEnum.STUDENT)
            db.add(u)
            db.commit()
            db.refresh(u)
            s = Student(user_id=u.id, register_number=reg, name=name, department_id=dept_map[dcode].id, year=yr, semester=sem, phone=phone, skills=skills, interests=interests)
            db.add(s)
            db.commit()
            db.refresh(s)
            student_objs[reg] = s
        else:
            student_objs[reg] = db.query(Student).filter(Student.user_id == u.id).first()

    alice = student_objs["CS2026001"]
    brian = student_objs["AI2026002"]
    clara = student_objs["EC2026003"]
    david = student_objs["ME2026004"]

    # Parent (linked to Alice)
    parent_user = db.query(User).filter(User.email == "parent@campuspulse.com").first()
    if not parent_user:
        parent_user = User(email="parent@campuspulse.com", hashed_password=get_password_hash("password123"), role=RoleEnum.PARENT)
        db.add(parent_user)
        db.commit()
        db.refresh(parent_user)
        db.add(ParentStudentMapping(parent_user_id=parent_user.id, student_id=alice.id, relationship_type="FATHER"))
        db.commit()

    # 4. Subjects
    subjects_info = [
        ("CS101", "Data Structures & Algorithms", "CSE", cse_faculty.id, 6),
        ("CS102", "Operating Systems", "CSE", mentor_faculty.id, 6),
        ("AI201", "Machine Learning & Neural Nets", "AIDS", None, 6),
        ("EC201", "Digital Signal Processing", "ECE", None, 4),
        ("ME301", "Thermodynamics & Heat Transfer", "MECH", None, 8)
    ]
    sub_map = {}
    for code, name, dcode, fid, sem in subjects_info:
        sub = db.query(Subject).filter(Subject.code == code).first()
        if not sub:
            sub = Subject(code=code, name=name, department_id=dept_map[dcode].id, faculty_id=fid, semester=sem)
            db.add(sub)
            db.commit()
            db.refresh(sub)
        sub_map[code] = sub

    # 5. Mentor Assignments
    if db.query(MentorAssignment).count() == 0:
        db.add(MentorAssignment(faculty_id=mentor_faculty.id, student_id=alice.id))
        db.add(MentorAssignment(faculty_id=mentor_faculty.id, student_id=david.id))
        db.commit()

    # 6. Counselling Record
    if db.query(CounsellingRecord).count() == 0:
        db.add(CounsellingRecord(
            mentor_id=mentor_faculty.id,
            student_id=david.id,
            session_date=date(2026, 10, 2),
            remarks="Discussed persistent absences and falling scores in technical assessments.",
            action_plan="Enroll in evening academic support tutorial; daily study schedule of 2 hours; mentor check-in every Friday.",
            follow_up_date=date(2026, 10, 16)
        ))
        db.add(CounsellingRecord(
            mentor_id=mentor_faculty.id,
            student_id=alice.id,
            session_date=date(2026, 9, 20),
            remarks="Career guidance on placement drives and system design internship readiness.",
            action_plan="Build full stack capstone portfolio project; prepare for Google and Microsoft placement drives.",
            follow_up_date=date(2026, 10, 25)
        ))
        db.commit()

    # 7. Attendance (Realistic multi-date records with PRESENT, ABSENT, OD, LEAVE)
    if db.query(Attendance).count() <= 3:
        # Alice (High Attendance + 1 Approved OD + 1 Approved Leave)
        dates_alice = [
            (date(2026, 9, 15), "PRESENT"), (date(2026, 9, 16), "PRESENT"),
            (date(2026, 9, 17), "PRESENT"), (date(2026, 9, 18), "OD"),
            (date(2026, 9, 21), "PRESENT"), (date(2026, 9, 22), "LEAVE"),
            (date(2026, 9, 23), "PRESENT"), (date(2026, 9, 24), "PRESENT"),
            (date(2026, 9, 25), "PRESENT"), (date(2026, 9, 28), "PRESENT")
        ]
        for dt, st in dates_alice:
            db.add(Attendance(student_id=alice.id, subject_id=sub_map["CS101"].id, date=dt, status=st))
            db.add(Attendance(student_id=alice.id, subject_id=sub_map["CS102"].id, date=dt, status=st))

        # David (Critical Low Attendance: 55% -> Triggers At-Risk Engine)
        dates_david = [
            (date(2026, 9, 15), "PRESENT"), (date(2026, 9, 16), "ABSENT"),
            (date(2026, 9, 17), "ABSENT"), (date(2026, 9, 18), "PRESENT"),
            (date(2026, 9, 21), "ABSENT"), (date(2026, 9, 22), "ABSENT"),
            (date(2026, 9, 23), "PRESENT"), (date(2026, 9, 24), "ABSENT"),
            (date(2026, 9, 25), "PRESENT"), (date(2026, 9, 28), "ABSENT")
        ]
        for dt, st in dates_david:
            db.add(Attendance(student_id=david.id, subject_id=sub_map["ME301"].id, date=dt, status=st))

        # Clara (Exceptional Attendance: 95%)
        dates_clara = [
            (date(2026, 9, 15), "PRESENT"), (date(2026, 9, 16), "PRESENT"),
            (date(2026, 9, 17), "PRESENT"), (date(2026, 9, 18), "PRESENT"),
            (date(2026, 9, 21), "PRESENT"), (date(2026, 9, 22), "PRESENT"),
            (date(2026, 9, 23), "PRESENT"), (date(2026, 9, 24), "PRESENT"),
            (date(2026, 9, 25), "PRESENT"), (date(2026, 9, 28), "PRESENT")
        ]
        for dt, st in dates_clara:
            db.add(Attendance(student_id=clara.id, subject_id=sub_map["EC201"].id, date=dt, status=st))

        # Brian (Borderline Attendance: 70%)
        dates_brian = [
            (date(2026, 9, 15), "PRESENT"), (date(2026, 9, 16), "ABSENT"),
            (date(2026, 9, 17), "PRESENT"), (date(2026, 9, 18), "PRESENT"),
            (date(2026, 9, 21), "ABSENT"), (date(2026, 9, 22), "PRESENT"),
            (date(2026, 9, 23), "PRESENT"), (date(2026, 9, 24), "ABSENT"),
            (date(2026, 9, 25), "PRESENT"), (date(2026, 9, 28), "PRESENT")
        ]
        for dt, st in dates_brian:
            db.add(Attendance(student_id=brian.id, subject_id=sub_map["AI201"].id, date=dt, status=st))
        db.commit()

    # 8. Marks & Performance
    if db.query(Mark).count() <= 2:
        # Alice (Excelling)
        db.add(Mark(student_id=alice.id, subject_id=sub_map["CS101"].id, exam_type="INTERNAL_1", score=86.0, max_score=100.0))
        db.add(Mark(student_id=alice.id, subject_id=sub_map["CS101"].id, exam_type="INTERNAL_2", score=92.0, max_score=100.0))
        db.add(Mark(student_id=alice.id, subject_id=sub_map["CS102"].id, exam_type="INTERNAL_1", score=84.0, max_score=100.0))
        db.add(Mark(student_id=alice.id, subject_id=sub_map["CS102"].id, exam_type="INTERNAL_2", score=88.0, max_score=100.0))

        # David (Critical Failure: 34% -> Triggers At-Risk Engine)
        db.add(Mark(student_id=david.id, subject_id=sub_map["ME301"].id, exam_type="INTERNAL_1", score=32.0, max_score=100.0))
        db.add(Mark(student_id=david.id, subject_id=sub_map["ME301"].id, exam_type="INTERNAL_2", score=36.0, max_score=100.0))

        # Clara (Top Performer: 94%)
        db.add(Mark(student_id=clara.id, subject_id=sub_map["EC201"].id, exam_type="INTERNAL_1", score=95.0, max_score=100.0))
        db.add(Mark(student_id=clara.id, subject_id=sub_map["EC201"].id, exam_type="INTERNAL_2", score=96.0, max_score=100.0))

        # Brian (Average: 54%)
        db.add(Mark(student_id=brian.id, subject_id=sub_map["AI201"].id, exam_type="INTERNAL_1", score=55.0, max_score=100.0))
        db.add(Mark(student_id=brian.id, subject_id=sub_map["AI201"].id, exam_type="INTERNAL_2", score=52.0, max_score=100.0))
        db.commit()

    # 9. OD Requests
    if db.query(ODRequest).count() == 0:
        db.add(ODRequest(
            student_id=alice.id,
            event_name="National Smart India Hackathon Grand Finale",
            purpose="Selected as Finalist for Smart Campus AI Solution",
            organization="Ministry of Education & AICTE",
            date=date(2026, 9, 18),
            start_time="09:00 AM",
            end_time="05:00 PM",
            venue="IIT Bombay Convention Center",
            status="APPROVED",
            remarks="Verified selection letter and approved by HOD."
        ))
        db.add(ODRequest(
            student_id=clara.id,
            event_name="IEEE International VLSI Symposium",
            purpose="Paper presentation on FPGA Edge Architectures",
            organization="IEEE Circuits & Systems Society",
            date=date(2026, 10, 22),
            start_time="10:00 AM",
            end_time="04:00 PM",
            venue="Bangalore International Exhibition Center",
            status="PENDING",
            remarks="Under faculty review"
        ))
        db.commit()

    # 10. Placement Companies & Drives
    if db.query(PlacementCompany).count() == 0:
        google = PlacementCompany(name="Google Cloud", industry="Cloud Computing & AI", website="https://careers.google.com", contact_email="campus@google.com")
        msft = PlacementCompany(name="Microsoft Corporation", industry="Enterprise Software & Cloud", website="https://careers.microsoft.com", contact_email="university@microsoft.com")
        zoho = PlacementCompany(name="Zoho Corporation", industry="SaaS & Productivity Suites", website="https://zoho.com/careers", contact_email="recruit@zohocorp.com")
        db.add_all([google, msft, zoho])
        db.commit()

        d1 = PlacementDrive(
            company_id=google.id,
            job_role="Software Engineer (Backend & Cloud)",
            ctc_package="24.5 LPA",
            eligibility_cgpa=7.5,
            drive_date=date(2026, 11, 10),
            deadline=date(2026, 10, 30),
            location="Bangalore / Hyderabad",
            description="Seeking talented engineers proficient in Distributed Systems, Algorithms, and Cloud Services.",
            status="UPCOMING"
        )
        d2 = PlacementDrive(
            company_id=msft.id,
            job_role="Cloud Solution Architect",
            ctc_package="18.0 LPA",
            eligibility_cgpa=7.0,
            drive_date=date(2026, 11, 18),
            deadline=date(2026, 11, 5),
            location="Hyderabad",
            description="Role focused on Azure Architecture, DevOps, and scalable enterprise systems.",
            status="UPCOMING"
        )
        d3 = PlacementDrive(
            company_id=zoho.id,
            job_role="Member Technical Staff (MTS)",
            ctc_package="8.5 LPA",
            eligibility_cgpa=6.5,
            drive_date=date(2026, 10, 28),
            deadline=date(2026, 10, 20),
            location="Chennai / Tenkasi",
            description="Product engineering role working on Zoho CRM and low-latency distributed microservices.",
            status="ONGOING"
        )
        db.add_all([d1, d2, d3])
        db.commit()

        # Placement Applications
        db.add(PlacementApplication(drive_id=d1.id, student_id=clara.id, status="SELECTED", remarks="Selected with outstanding system design performance."))
        db.add(PlacementApplication(drive_id=d2.id, student_id=alice.id, status="SHORTLISTED", remarks="Cleared coding round. Technical interview scheduled."))
        db.add(PlacementApplication(drive_id=d3.id, student_id=brian.id, status="APPLIED", remarks="Resume screened."))
        db.commit()

    # 11. Achievements & Digital Portfolio
    if db.query(Achievement).count() == 0:
        db.add(Achievement(
            student_id=alice.id,
            title="AWS Certified Solutions Architect - Associate",
            category="CERTIFICATION",
            description="Validated expertise in designing distributed, cost-effective systems on AWS Cloud.",
            date=date(2026, 8, 15),
            proof_url="https://aws.amazon.com/verification/AWSSA12345",
            verification_status="VERIFIED"
        ))
        db.add(Achievement(
            student_id=alice.id,
            title="IEEE TechCon 2026 Best Paper Award",
            category="PAPER_PRESENTATION",
            description="Presented research on 'Optimized Graph Traversal in Distributed Microservices'.",
            date=date(2026, 9, 10),
            proof_url="https://ieee.org/papers/2026/tc9981",
            verification_status="VERIFIED"
        ))
        db.add(Achievement(
            student_id=clara.id,
            title="Smart India Hackathon 2026 1st Prize Winner",
            category="HACKATHON",
            description="Developed real-time IoT water monitoring system with hardware edge analytics.",
            date=date(2026, 7, 20),
            proof_url="https://sih.gov.in/winners/2026/team-nova",
            verification_status="VERIFIED"
        ))
        db.add(Achievement(
            student_id=david.id,
            title="Formula Student All-Terrain Vehicle Competition",
            category="COMPETITION",
            description="Led chassis fabrication and suspension telemetry analysis team.",
            date=date(2026, 6, 12),
            proof_url="https://formulastudent.org/2026/team-mech",
            verification_status="PENDING"
        ))
        db.commit()

    # 12. Document Repository
    if db.query(DocumentRecord).count() == 0:
        db.add(DocumentRecord(
            title="Academic Regulations & Credit Framework 2026",
            category="REGULATIONS",
            file_url="https://campuspulse.edu/docs/regulations-2026.pdf",
            department_id=dept_map["CSE"].id,
            uploaded_by_id=admin_user.id
        ))
        db.add(DocumentRecord(
            title="Data Structures & Algorithms Laboratory Manual",
            category="LAB_MANUALS",
            file_url="https://campuspulse.edu/docs/cs101-lab-manual.pdf",
            department_id=dept_map["CSE"].id,
            semester=6,
            uploaded_by_id=faculty_user.id
        ))
        db.add(DocumentRecord(
            title="Previous Year Model Question Bank - End Semester",
            category="QUESTION_PAPERS",
            file_url="https://campuspulse.edu/docs/model-questions-sem6.pdf",
            department_id=dept_map["CSE"].id,
            semester=6,
            uploaded_by_id=faculty_user.id
        ))
        db.commit()

    # 13. Generic Requests
    if db.query(GenericRequest).count() == 0:
        db.add(GenericRequest(
            student_id=alice.id,
            request_type="BONAFIDE",
            reason="Required for applying for Passport renewal and International Tech Conference travel.",
            status="APPROVED",
            stage="COMPLETED",
            remarks="Digital Bonafide generated and dispatched."
        ))
        db.add(GenericRequest(
            student_id=david.id,
            request_type="ACADEMIC_REQUEST",
            reason="Request for special permission for lab exam re-assessment due to medical leave.",
            status="PENDING",
            stage="HOD",
            remarks="Under evaluation with course instructor."
        ))
        db.commit()

    # 14. Calendar Events
    if db.query(CalendarEvent).count() == 0:
        now = datetime.utcnow()
        db.add(CalendarEvent(
            title="Annual Inter-College Hackathon: PulseHacks 2026",
            description="36-hour flagship hackathon with tracks in AI, Cloud, Cybersecurity, and Web3.",
            start_date=now + timedelta(days=12),
            end_date=now + timedelta(days=14),
            event_type="WORKSHOP",
            role_visibility="ALL"
        ))
        db.add(CalendarEvent(
            title="End Semester Practical Model Examinations",
            description="Laboratory model examinations across all engineering departments.",
            start_date=now + timedelta(days=20),
            end_date=now + timedelta(days=25),
            event_type="EXAM",
            role_visibility="ALL"
        ))
        db.commit()

    # 15. Evening Academic Support Classes
    if db.query(EveningClass).count() == 0:
        ec = EveningClass(
            subject_id=sub_map["CS101"].id,
            faculty_id=cse_faculty.id,
            date=date(2026, 10, 18),
            time="05:00 PM - 06:30 PM"
        )
        db.add(ec)
        db.commit()
        db.refresh(ec)
        db.add(EveningClassStudent(evening_class_id=ec.id, student_id=david.id))
        db.commit()

    # 16. Fees for all students
    for s_obj, total, paid in [
        (alice, 65000.0, 65000.0),
        (brian, 65000.0, 45000.0),
        (clara, 60000.0, 60000.0),
        (david, 65000.0, 25000.0)
    ]:
        existing_fee = db.query(Fee).filter(Fee.student_id == s_obj.id).first()
        if not existing_fee:
            db.add(Fee(student_id=s_obj.id, total_amount=total, paid_amount=paid, due_date=date(2026, 11, 30)))
    db.commit()

    # 17. Audit Logs
    if db.query(AuditLog).count() == 0:
        db.add(AuditLog(user_id=admin_user.id, user_email=admin_user.email, action="SYSTEM_INIT", entity="SystemSetting", description="CampusPulse Digital Ecosystem initialized successfully."))
        db.add(AuditLog(user_id=faculty_user.id, user_email=faculty_user.email, action="MARK_ATTENDANCE", entity="Attendance", description="Attendance submitted for CSE Department CS101."))
        db.commit()

    print("CampusPulse Ecosystem Data Seeded Successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
