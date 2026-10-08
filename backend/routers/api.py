from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from models.all_models import (
    User, Student, Faculty, Department, Subject, Announcement, Mark, Attendance,
    EveningClass, EveningClassStudent, Assignment, AssignmentSubmission,
    StudyMaterial, Timetable, Exam, LeaveRequest, Event, EventRegistration,
    Club, ClubMembership, Fee, Query, Opportunity, Notification, ParentStudentMapping
)
from utils.deps import get_current_user
from pydantic import BaseModel
from typing import List
from routers import ecosystem
from services.analytics_service import calculate_student_attendance, calculate_student_performance

router = APIRouter()
router.include_router(ecosystem.router)

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    profile = None
    if role_str == "STUDENT":
        profile = db.query(Student).filter(Student.user_id == current_user.id).first()
    elif role_str in ["FACULTY", "MENTOR", "HOD", "PRINCIPAL"]:
        profile = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    elif role_str == "PARENT":
        mapping = db.query(ParentStudentMapping).filter(ParentStudentMapping.parent_user_id == current_user.id).first()
        if mapping:
            profile = db.query(Student).filter(Student.id == mapping.student_id).first()
        else:
            profile = db.query(Student).first()
    return {"user": current_user, "profile": profile}

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

@router.get("/faculties")
def get_faculties(db: Session = Depends(get_db)):
    return db.query(Faculty).all()

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()

@router.get("/announcements")
def get_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()

@router.get("/marks")
def get_marks(db: Session = Depends(get_db)):
    return db.query(Mark).all()

class AttendanceSubmit(BaseModel):
    subject_id: int
    date: str
    records: List[dict] # {"student_id": int, "status": str}

@router.post("/attendance")
def submit_attendance(data: AttendanceSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["FACULTY", "HOD", "ADMIN"]:
        return {"error": "Not authorized"}
    
    # Simple validation for duplicates
    for record in data.records:
        existing = db.query(Attendance).filter(
            Attendance.student_id == record["student_id"],
            Attendance.subject_id == data.subject_id,
            Attendance.date == data.date
        ).first()
        if existing:
            existing.status = record["status"]
        else:
            db.add(Attendance(
                student_id=record["student_id"],
                subject_id=data.subject_id,
                date=data.date,
                status=record["status"]
            ))
    db.commit()
    return {"message": "Attendance saved successfully"}

@router.get("/attendance/my")
def get_my_attendance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return []
    records = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    return records

@router.get("/marks/my")
def get_my_marks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return []
    return db.query(Mark).filter(Mark.student_id == student.id).all()

class MarkSubmit(BaseModel):
    subject_id: int
    exam_type: str
    records: List[dict] # {"student_id": int, "score": float, "max_score": float}

@router.post("/marks")
def submit_marks(data: MarkSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY":
        return {"error": "Not authorized"}
    
    for record in data.records:
        existing = db.query(Mark).filter(
            Mark.student_id == record["student_id"],
            Mark.subject_id == data.subject_id,
            Mark.exam_type == data.exam_type
        ).first()
        if existing:
            existing.score = record["score"]
            existing.max_score = record["max_score"]
        else:
            db.add(Mark(
                student_id=record["student_id"],
                subject_id=data.subject_id,
                exam_type=data.exam_type,
                score=record["score"],
                max_score=record["max_score"]
            ))
    db.commit()
    return {"message": "Marks saved successfully"}


@router.get("/dashboard/student")
def student_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        return {"error": "Profile not found"}
    
    # Calculate mock or real stats for dashboard
    attendance = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    total_classes = len(attendance)
    attended = sum(1 for a in attendance if a.status == "PRESENT")
    attendance_pct = (attended / total_classes * 100) if total_classes > 0 else 0

    marks = db.query(Mark).filter(Mark.student_id == student.id).all()
    total_score = sum(m.score for m in marks)
    max_total = sum(m.max_score for m in marks)
    avg_performance = (total_score / max_total * 100) if max_total > 0 else 0

    announcements = db.query(Announcement).order_by(Announcement.created_at.desc()).limit(5).all()

    return {
        "attendance_percentage": round(attendance_pct, 2),
        "average_performance": round(avg_performance, 2),
        "recent_announcements": announcements,
        "marks": marks
    }

@router.get("/dashboard/faculty")
def faculty_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY":
        return {"error": "Not authorized"}
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        return {"error": "Profile not found"}
    
    subjects = db.query(Subject).filter(Subject.faculty_id == faculty.id).all()
    students_count = db.query(Student).count() # simplify
    
    # Weak student recommendation logic
    all_marks = db.query(Mark).all()
    weak_students = []
    # simple mockup logic
    
    return {
        "subjects": subjects,
        "total_students": students_count,
        "weak_students_recommendation": weak_students
    }

@router.get("/dashboard/admin")
def admin_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        return {"error": "Not authorized"}
    return {
        "total_students": db.query(Student).count(),
        "total_faculty": db.query(Faculty).count(),
        "total_departments": db.query(Department).count(),
        "announcements": db.query(Announcement).count()
    }

class AssignmentCreate(BaseModel):
    subject_id: int
    title: str
    description: str
    deadline: str

@router.post("/assignments")
def create_assignment(data: AssignmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    from datetime import datetime
    new_assignment = Assignment(
        subject_id=data.subject_id,
        title=data.title,
        description=data.description,
        deadline=datetime.fromisoformat(data.deadline.replace('Z', '+00:00')) if 'T' in data.deadline else datetime.strptime(data.deadline, "%Y-%m-%d")
    )
    db.add(new_assignment)
    db.commit()
    return {"message": "Assignment created"}

@router.get("/assignments")
def get_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        subjects = [s.id for s in db.query(Subject).filter(Subject.department_id == student.department_id).all()]
        return db.query(Assignment).filter(Assignment.subject_id.in_(subjects)).all()
    else:
        return db.query(Assignment).all()

class SubmissionCreate(BaseModel):
    # In a real app, this would be a file upload. Here we use text for demo speed.
    content: str 

@router.post("/assignments/{id}/submit")
def submit_assignment(id: int, data: SubmissionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    sub = AssignmentSubmission(
        assignment_id=id,
        student_id=student.id,
        status="SUBMITTED",
        feedback=data.content # Storing content in feedback for demo simplicity
    )
    db.add(sub)
    db.commit()
    return {"message": "Submitted"}

@router.get("/assignments/{id}/submissions")
def get_submissions(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    return db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == id).all()

class EvaluateSubmit(BaseModel):
    marks: float
    feedback: str

@router.post("/assignments/submissions/{id}/evaluate")
def evaluate_submission(id: int, data: EvaluateSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == id).first()
    if sub:
        sub.status = "EVALUATED"
        sub.marks = data.marks
        sub.feedback = data.feedback
        db.commit()
    return {"message": "Evaluated"}

class MaterialCreate(BaseModel):
    subject_id: int
    title: str
    description: str
    file_url: str

@router.post("/materials")
def create_material(data: MaterialCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    new_mat = StudyMaterial(
        subject_id=data.subject_id,
        title=data.title,
        description=data.description,
        file_url=data.file_url
    )
    db.add(new_mat)
    db.commit()
    return {"message": "Material uploaded"}

@router.get("/materials")
def get_materials(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        subjects = [s.id for s in db.query(Subject).filter(Subject.department_id == student.department_id).all()]
        return db.query(StudyMaterial).filter(StudyMaterial.subject_id.in_(subjects)).all()
    else:
        return db.query(StudyMaterial).all()

class TimetableCreate(BaseModel):
    subject_id: int
    day_of_week: str
    start_time: str
    end_time: str
    room: str

@router.post("/timetable")
def create_timetable(data: TimetableCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": return {"error": "Not authorized"}
    db.add(Timetable(**data.model_dump()))
    db.commit()
    return {"message": "Timetable created"}

@router.get("/timetable")
def get_timetable(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        subjects = [s.id for s in db.query(Subject).filter(Subject.department_id == student.department_id).all()]
        return db.query(Timetable).filter(Timetable.subject_id.in_(subjects)).all()
    elif current_user.role == "FACULTY":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        subjects = [s.id for s in db.query(Subject).filter(Subject.faculty_id == faculty.id).all()]
        return db.query(Timetable).filter(Timetable.subject_id.in_(subjects)).all()
    else:
        return db.query(Timetable).all()

class ExamCreate(BaseModel):
    subject_id: int
    name: str
    date: str
    time: str
    room: str

@router.post("/exams")
def create_exam(data: ExamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": return {"error": "Not authorized"}
    from datetime import datetime
    new_exam = Exam(
        subject_id=data.subject_id,
        name=data.name,
        date=datetime.strptime(data.date, "%Y-%m-%d").date(),
        time=data.time,
        room=data.room
    )
    db.add(new_exam)
    db.commit()
    return {"message": "Exam created"}

@router.get("/exams")
def get_exams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Exam).all()

class LeaveCreate(BaseModel):
    reason: str
    start_date: str
    end_date: str

@router.post("/leave")
def create_leave(data: LeaveCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    from datetime import datetime
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    new_leave = LeaveRequest(
        student_id=student.id,
        reason=data.reason,
        start_date=datetime.strptime(data.start_date, "%Y-%m-%d").date(),
        end_date=datetime.strptime(data.end_date, "%Y-%m-%d").date()
    )
    db.add(new_leave)
    db.commit()
    return {"message": "Leave request submitted"}

@router.get("/leave")
def get_leaves(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        return db.query(LeaveRequest).filter(LeaveRequest.student_id == student.id).all()
    else:
        # Admin or Faculty
        return db.query(LeaveRequest).all()

class LeaveUpdate(BaseModel):
    status: str
    remarks: str

@router.post("/leave/{id}/status")
def update_leave_status(id: int, data: LeaveUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY"]: return {"error": "Not authorized"}
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if leave:
        leave.status = data.status
        leave.remarks = data.remarks
        # Send Notification
        student = db.query(Student).filter(Student.id == leave.student_id).first()
        if student:
            db.add(Notification(
                user_id=student.user_id,
                title=f"Leave Request {data.status}",
                message=f"Your leave request from {leave.start_date} to {leave.end_date} has been {data.status.lower()}.",
                type="LEAVE"
            ))
        db.commit()
    return {"message": "Status updated"}

@router.get("/evening-classes/recommendations")
def get_evening_class_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    # Rule based analysis
    students = db.query(Student).all()
    recommendations = []
    
    for s in students:
        reasons = []
        # Check attendance
        attendances = db.query(Attendance).filter(Attendance.student_id == s.id).all()
        total_att = len(attendances)
        present = sum(1 for a in attendances if a.status == 'PRESENT')
        if total_att > 0 and (present / total_att) < 0.75:
            reasons.append("Low attendance")
            
        # Check marks
        marks = db.query(Mark).filter(Mark.student_id == s.id).all()
        for m in marks:
            if m.max_score > 0 and (m.score / m.max_score) < 0.5:
                reasons.append(f"Failed test in subject {m.subject_id}")
                
        if reasons:
            recommendations.append({
                "student_id": s.id,
                "name": s.name,
                "register_number": s.register_number,
                "reasons": list(set(reasons))
            })
            
    return recommendations

class EveningClassCreate(BaseModel):
    subject_id: int
    date: str
    time: str
    student_ids: List[int]

@router.post("/evening-classes")
def schedule_evening_class(data: EveningClassCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    from datetime import datetime
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    
    new_class = EveningClass(
        subject_id=data.subject_id,
        faculty_id=faculty.id,
        date=datetime.strptime(data.date, "%Y-%m-%d").date(),
        time=data.time
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    for s_id in data.student_ids:
        db.add(EveningClassStudent(
            evening_class_id=new_class.id,
            student_id=s_id
        ))
        # Automatic notification
        student = db.query(Student).filter(Student.id == s_id).first()
        if student:
            db.add(Notification(
                user_id=student.user_id,
                title="Academic Support Class Scheduled",
                message=f"You have been assigned an evening class on {data.date} at {data.time}.",
                type="EVENING_CLASS"
            ))
    db.commit()
    return {"message": "Evening class scheduled"}

@router.get("/evening-classes/my")
def get_my_evening_classes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    # Get class IDs assigned to student
    class_links = db.query(EveningClassStudent).filter(EveningClassStudent.student_id == student.id).all()
    class_ids = [l.evening_class_id for l in class_links]
    
    classes = db.query(EveningClass).filter(EveningClass.id.in_(class_ids)).all()
    
    result = []
    for c in classes:
        subj = db.query(Subject).filter(Subject.id == c.subject_id).first()
        fac = db.query(Faculty).filter(Faculty.id == c.faculty_id).first()
        result.append({
            "id": c.id,
            "subject_name": subj.name if subj else "Unknown",
            "faculty_name": fac.name if fac else "Unknown",
            "date": c.date,
            "time": c.time
        })
    return result

@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@router.post("/events/{id}/register")
def register_event(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    existing = db.query(EventRegistration).filter(EventRegistration.event_id == id, EventRegistration.student_id == student.id).first()
    if not existing:
        db.add(EventRegistration(event_id=id, student_id=student.id))
        db.commit()
    return {"message": "Registered"}

@router.get("/clubs")
def get_clubs(db: Session = Depends(get_db)):
    return db.query(Club).all()

@router.post("/clubs/{id}/join")
def join_club(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    existing = db.query(ClubMembership).filter(ClubMembership.club_id == id, ClubMembership.student_id == student.id).first()
    if not existing:
        db.add(ClubMembership(club_id=id, student_id=student.id))
        db.commit()
    return {"message": "Membership requested"}

@router.get("/fees/my")
def get_my_fees(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    return db.query(Fee).filter(Fee.student_id == student.id).all()

class QueryCreate(BaseModel):
    question: str

@router.post("/queries")
def submit_query(data: QueryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT": return {"error": "Not authorized"}
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    db.add(Query(student_id=student.id, question=data.question))
    db.commit()
    return {"message": "Query submitted"}

@router.get("/queries")
def get_queries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        return db.query(Query).filter(Query.student_id == student.id).all()
    else:
        return db.query(Query).all()

class QueryUpdate(BaseModel):
    answer: str
    status: str

@router.patch("/queries/{id}")
def update_query(id: int, data: QueryUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY": return {"error": "Not authorized"}
    query = db.query(Query).filter(Query.id == id).first()
    if query:
        query.answer = data.answer
        query.status = data.status
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        query.faculty_id = faculty.id
        # Send Notification
        student = db.query(Student).filter(Student.id == query.student_id).first()
        if student:
            db.add(Notification(
                user_id=student.user_id,
                title="Query Responded",
                message=f"Faculty has responded to your query.",
                type="QUERY"
            ))
        db.commit()
    return {"message": "Query updated"}

@router.get("/opportunities")
def get_opportunities(db: Session = Depends(get_db)):
    return db.query(Opportunity).all()

class OpportunityCreate(BaseModel):
    title: str
    organization: str
    description: str
    category: str
    deadline: str
    link: str

@router.post("/opportunities")
def create_opportunity(data: OpportunityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY"]: return {"error": "Not authorized"}
    from datetime import datetime
    new_opp = Opportunity(
        title=data.title,
        organization=data.organization,
        description=data.description,
        category=data.category,
        deadline=datetime.strptime(data.deadline, "%Y-%m-%d").date(),
        link=data.link
    )
    db.add(new_opp)
    db.commit()
    return {"message": "Opportunity created"}

@router.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()

@router.get("/notifications/unread-count")
def get_unread_notifications_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).count()
    return {"count": count}

@router.patch("/notifications/{id}/read")
def read_notification(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}

@router.patch("/notifications/read-all")
def read_all_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}

@router.get("/search")
def global_search(q: str, db: Session = Depends(get_db)):
    q = f"%{q}%"
    announcements = db.query(Announcement).filter(Announcement.title.ilike(q) | Announcement.content.ilike(q)).all()
    events = db.query(Event).filter(Event.title.ilike(q) | Event.description.ilike(q) | Event.category.ilike(q)).all()
    clubs = db.query(Club).filter(Club.name.ilike(q) | Club.description.ilike(q)).all()
    opportunities = db.query(Opportunity).filter(Opportunity.title.ilike(q) | Opportunity.organization.ilike(q) | Opportunity.description.ilike(q)).all()
    materials = db.query(StudyMaterial).filter(StudyMaterial.title.ilike(q) | StudyMaterial.description.ilike(q)).all()
    
    return {
        "announcements": [{"id": a.id, "title": a.title, "description": a.content[:100], "type": "Announcement"} for a in announcements],
        "events": [{"id": e.id, "title": e.title, "description": e.description[:100], "type": "Event"} for e in events],
        "clubs": [{"id": c.id, "title": c.name, "description": c.description[:100], "type": "Club"} for c in clubs],
        "opportunities": [{"id": o.id, "title": o.title, "description": o.description[:100], "type": "Opportunity"} for o in opportunities],
        "materials": [{"id": m.id, "title": m.title, "description": m.description[:100], "type": "Material"} for m in materials]
    }

# --- ADMIN APIs ---

@router.get("/admin/users")
def get_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).all()
    result = []
    for u in users:
        dept = None
        name = "Admin"
        if u.role == "STUDENT":
            profile = db.query(Student).filter(Student.user_id == u.id).first()
            if profile:
                name = profile.name
                if profile.department_id:
                    d = db.query(Department).filter(Department.id == profile.department_id).first()
                    dept = d.name if d else None
        elif u.role == "FACULTY":
            profile = db.query(Faculty).filter(Faculty.user_id == u.id).first()
            if profile:
                name = profile.name
                if profile.department_id:
                    d = db.query(Department).filter(Department.id == profile.department_id).first()
                    dept = d.name if d else None
        
        result.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "name": name,
            "department": dept
        })
    return result

@router.patch("/admin/users/{user_id}/status")
def update_user_status(user_id: int, status: bool, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    u = db.query(User).filter(User.id == user_id).first()
    if u:
        u.is_active = status
        db.commit()
        return {"message": "Status updated"}
    raise HTTPException(status_code=404, detail="User not found")

class DepartmentCreate(BaseModel):
    name: str
    code: str

@router.post("/departments")
def create_department(data: DepartmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    dept = Department(name=data.name, code=data.code)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.put("/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if dept:
        dept.name = data.name
        dept.code = data.code
        db.commit()
        db.refresh(dept)
        return dept
    raise HTTPException(status_code=404)

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept: raise HTTPException(status_code=404)
    students = db.query(Student).filter(Student.department_id == dept_id).count()
    if students > 0: raise HTTPException(status_code=400, detail="Cannot delete department with active students")
    db.delete(dept)
    db.commit()
    return {"message": "Deleted"}

class SubjectCreate(BaseModel):
    code: str
    name: str
    department_id: int
    semester: int
    faculty_id: int = None

@router.post("/subjects")
def create_subject(data: SubjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    sub = Subject(**data.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.put("/subjects/{sub_id}")
def update_subject(sub_id: int, data: SubjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    sub = db.query(Subject).filter(Subject.id == sub_id).first()
    if sub:
        sub.code = data.code
        sub.name = data.name
        sub.department_id = data.department_id
        sub.semester = data.semester
        sub.faculty_id = data.faculty_id
        db.commit()
        db.refresh(sub)
        return sub
    raise HTTPException(status_code=404)

@router.delete("/subjects/{sub_id}")
def delete_subject(sub_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    sub = db.query(Subject).filter(Subject.id == sub_id).first()
    if not sub: raise HTTPException(status_code=404)
    db.delete(sub)
    db.commit()
    return {"message": "Deleted"}

class AnnouncementCreate(BaseModel):
    title: str
    content: str

@router.post("/announcements")
def create_announcement(data: AnnouncementCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    ann = Announcement(title=data.title, content=data.content)
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann

@router.put("/announcements/{ann_id}")
def update_announcement(ann_id: int, data: AnnouncementCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if ann:
        ann.title = data.title
        ann.content = data.content
        db.commit()
        db.refresh(ann)
        return ann
    raise HTTPException(status_code=404)

@router.delete("/announcements/{ann_id}")
def delete_announcement(ann_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if ann:
        db.delete(ann)
        db.commit()
        return {"message": "Deleted"}
    raise HTTPException(status_code=404)

@router.get("/admin/classes")
def get_classes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN": raise HTTPException(status_code=403, detail="Not authorized")
    from sqlalchemy import func
    results = db.query(
        Student.department_id,
        Department.name.label("department_name"),
        Student.year,
        Student.semester,
        func.count(Student.id).label("student_count")
    ).join(Department).group_by(Student.department_id, Department.name, Student.year, Student.semester).all()
    
    classes = []
    for idx, r in enumerate(results):
        classes.append({
            "id": idx,
            "department_id": r.department_id,
            "department_name": r.department_name,
            "year": r.year,
            "semester": r.semester,
            "student_count": r.student_count
        })
    return classes
