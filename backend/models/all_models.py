import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Enum, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database.session import Base

class RoleEnum(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    MENTOR = "MENTOR"
    HOD = "HOD"
    PRINCIPAL = "PRINCIPAL"
    PARENT = "PARENT"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    hod_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    students = relationship("Student", back_populates="department")
    faculties = relationship("Faculty", back_populates="department")
    subjects = relationship("Subject", back_populates="department")
    classes = relationship("ClassSection", back_populates="department")
    hod = relationship("User", foreign_keys=[hod_id])

class ClassSection(Base):
    __tablename__ = "class_sections"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    section = Column(String, nullable=False)
    name = Column(String, nullable=False) # e.g. III AI&DS A

    department = relationship("Department", back_populates="classes")
    students = relationship("Student", back_populates="class_section")
    assignments = relationship("FacultySubjectAssignment", back_populates="class_section")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    register_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    year = Column(Integer)
    semester = Column(Integer)
    class_section_id = Column(Integer, ForeignKey("class_sections.id"), nullable=True)
    phone = Column(String, nullable=True)
    skills = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)

    user = relationship("User", back_populates="student_profile")
    department = relationship("Department", back_populates="students")
    class_section = relationship("ClassSection", back_populates="students")
    attendances = relationship("Attendance", back_populates="student")
    marks = relationship("Mark", back_populates="student")
    assignment_submissions = relationship("AssignmentSubmission", back_populates="student")
    leave_requests = relationship("LeaveRequest", back_populates="student")

class Faculty(Base):
    __tablename__ = "faculties"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    phone = Column(String, nullable=True)

    user = relationship("User", back_populates="faculty_profile")
    department = relationship("Department", back_populates="faculties")
    subjects = relationship("Subject", back_populates="faculty")
    subject_assignments = relationship("FacultySubjectAssignment", back_populates="faculty")

class FacultySubjectAssignment(Base):
    __tablename__ = "faculty_subject_assignments"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    class_section_id = Column(Integer, ForeignKey("class_sections.id"))
    academic_year = Column(String, nullable=True)
    semester = Column(Integer, nullable=True)

    faculty = relationship("Faculty", back_populates="subject_assignments")
    subject = relationship("Subject")
    class_section = relationship("ClassSection", back_populates="assignments")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=True)
    semester = Column(Integer)

    department = relationship("Department", back_populates="subjects")
    faculty = relationship("Faculty", back_populates="subjects")
    attendances = relationship("Attendance", back_populates="subject")
    marks = relationship("Mark", back_populates="subject")
    assignments = relationship("Assignment", back_populates="subject")

class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    date = Column(Date, nullable=False)
    status = Column(String) # PRESENT, ABSENT
    
    student = relationship("Student", back_populates="attendances")
    subject = relationship("Subject", back_populates="attendances")

class Mark(Base):
    __tablename__ = "marks"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    exam_type = Column(String) # INTERNAL_1, INTERNAL_2, SEMESTER
    score = Column(Float)
    max_score = Column(Float)
    source = Column(String, default="MANUAL")
    import_id = Column(Integer, nullable=True) # ForeignKey("mark_imports.id") in logic

    student = relationship("Student", back_populates="marks")
    subject = relationship("Subject", back_populates="marks")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="SUBMITTED") # SUBMITTED, EVALUATED
    marks = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="assignment_submissions")

class EveningClass(Base):
    __tablename__ = "evening_classes"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    date = Column(Date)
    time = Column(String)

class EveningClassStudent(Base):
    __tablename__ = "evening_class_students"
    id = Column(Integer, primary_key=True, index=True)
    evening_class_id = Column(Integer, ForeignKey("evening_classes.id"))
    student_id = Column(Integer, ForeignKey("students.id"))

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    reason = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    remarks = Column(Text, nullable=True)

    student = relationship("Student", back_populates="leave_requests")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Fee(Base):
    __tablename__ = "fees"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    total_amount = Column(Float)
    paid_amount = Column(Float, default=0.0)
    due_date = Column(Date)

class StudyMaterial(Base):
    __tablename__ = "study_materials"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    subject = relationship("Subject")

class Timetable(Base):
    __tablename__ = "timetable"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    day_of_week = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    room = Column(String)

    subject = relationship("Subject")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    name = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    time = Column(String, nullable=False)
    room = Column(String)

    subject = relationship("Subject")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    date = Column(Date)
    venue = Column(String)
    category = Column(String)

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    student_id = Column(Integer, ForeignKey("students.id"))

class Club(Base):
    __tablename__ = "clubs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)

class ClubMembership(Base):
    __tablename__ = "club_memberships"
    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String, default="PENDING") # PENDING, APPROVED

class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    organization = Column(String)
    description = Column(Text)
    category = Column(String) # Internship, Placement, Scholarship, etc.
    deadline = Column(Date)
    link = Column(String)

class Query(Base):
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    status = Column(String, default="OPEN") # OPEN, RESOLVED

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text)
    type = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ODRequest(Base):
    __tablename__ = "od_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    event_name = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    organization = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    venue = Column(String, nullable=True)
    proof_url = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")

class MentorAssignment(Base):
    __tablename__ = "mentor_assignments"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    student_id = Column(Integer, ForeignKey("students.id"), unique=True)
    academic_year = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty")
    student = relationship("Student")

class CounsellingRecord(Base):
    __tablename__ = "counselling_records"
    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("faculties.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    session_date = Column(Date, nullable=False)
    remarks = Column(Text, nullable=False)
    action_plan = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mentor = relationship("Faculty")
    student = relationship("Student")

class ParentStudentMapping(Base):
    __tablename__ = "parent_student_mappings"
    id = Column(Integer, primary_key=True, index=True)
    parent_user_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    relationship_type = Column(String, default="PARENT")

    parent_user = relationship("User")
    student = relationship("Student")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # HACKATHON, CERTIFICATION, INTERNSHIP, PROJECT, WORKSHOP, COMPETITION, SPORTS, NSS, CLUB, PAPER
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    proof_url = Column(String, nullable=True)
    verification_status = Column(String, default="PENDING") # PENDING, VERIFIED, REJECTED
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")

class PlacementCompany(Base):
    __tablename__ = "placement_companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PlacementDrive(Base):
    __tablename__ = "placement_drives"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("placement_companies.id"))
    job_role = Column(String, nullable=False)
    ctc_package = Column(String, nullable=True)
    eligibility_cgpa = Column(Float, default=6.0)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    drive_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="UPCOMING") # UPCOMING, ONGOING, COMPLETED

    company = relationship("PlacementCompany")
    department = relationship("Department")

class PlacementApplication(Base):
    __tablename__ = "placement_applications"
    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("placement_drives.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    status = Column(String, default="APPLIED") # APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
    applied_at = Column(DateTime, default=datetime.utcnow)
    remarks = Column(Text, nullable=True)

    drive = relationship("PlacementDrive")
    student = relationship("Student")

class DocumentRecord(Base):
    __tablename__ = "document_records"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # SYLLABUS, REGULATIONS, CIRCULARS, FORMS, QUESTION_PAPERS, LAB_MANUALS
    file_url = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    semester = Column(Integer, nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department")

class GenericRequest(Base):
    __tablename__ = "generic_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    request_type = Column(String, nullable=False) # BONAFIDE, CERTIFICATE, NO_DUE, ACADEMIC_REQUEST, FEE_REQUEST, DOCUMENT_REQUEST, OTHER
    reason = Column(Text, nullable=False)
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, APPROVED, REJECTED
    stage = Column(String, default="MENTOR") # MENTOR, HOD, PRINCIPAL, ADMIN, COMPLETED
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)

class EmailLog(Base):
    __tablename__ = "email_logs"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recipient_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    template_name = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="SENT") # SENT, SIMULATED, FAILED

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    event_type = Column(String, nullable=False) # CLASS, EXAM, ASSIGNMENT, HOLIDAY, LEAVE, OD, WORKSHOP, PLACEMENT, MEETING, COLLEGE, Personal, etc.
    role_visibility = Column(String, default="ALL") # ALL, STUDENT, FACULTY, HOD, PRINCIPAL
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Personal Calendar additions
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    location = Column(String, nullable=True)
    reminder_time = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MarkImport(Base):
    __tablename__ = "mark_imports"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculties.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    assessment_id = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    source = Column(String, nullable=True)
    total_rows = Column(Integer, default=0)
    matched_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    updated_rows = Column(Integer, default=0)
    status = Column(String, default="COMPLETED")
    created_at = Column(DateTime, default=datetime.utcnow)

class MarkImportRow(Base):
    __tablename__ = "mark_import_rows"
    id = Column(Integer, primary_key=True, index=True)
    import_id = Column(Integer, ForeignKey("mark_imports.id"))
    register_number = Column(String, nullable=True)
    student_name = Column(String, nullable=True)
    mark = Column(Float, nullable=True)
    status = Column(String, nullable=True)
    issue = Column(String, nullable=True)

