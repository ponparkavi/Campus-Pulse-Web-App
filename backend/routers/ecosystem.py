from fastapi import APIRouter, Depends, HTTPException, status, Query as FastQuery
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta

from database.session import get_db
from models.all_models import (
    User, Student, Faculty, Department, Subject, Attendance, Mark,
    Assignment, AssignmentSubmission, StudyMaterial, Timetable, Exam,
    LeaveRequest, ODRequest, EveningClass, EveningClassStudent, Event,
    EventRegistration, Club, ClubMembership, Opportunity, Fee, Query,
    Notification, MentorAssignment, CounsellingRecord, ParentStudentMapping,
    Achievement, PlacementCompany, PlacementDrive, PlacementApplication,
    DocumentRecord, GenericRequest, AuditLog, SystemSetting, EmailLog, CalendarEvent
)
from utils.deps import get_current_user
from schemas.schemas import (
    ODCreate, ODStatusUpdate, AchievementCreate, AchievementVerify,
    PlacementCompanyCreate, PlacementDriveCreate, PlacementApplicationStatusUpdate,
    CounsellingCreate, GenericRequestCreate, GenericRequestUpdate,
    DocumentCreate, EmailSendRequest, SettingUpdate
)
from services.analytics_service import (
    calculate_student_attendance, calculate_student_performance,
    calculate_student_risk, calculate_department_analytics, calculate_college_analytics
)
from services.notification_service import create_notification, log_email
from services.audit_service import log_audit
from pydantic import BaseModel

router = APIRouter()

# ==============================================================================
# 1. STUDENT PROFILE & DIGITAL IDENTITY
# ==============================================================================

class ProfileUpdate(BaseModel):
    phone: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None

@router.get("/students/me/profile")
def get_my_full_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    dept = db.query(Department).filter(Department.id == student.department_id).first()
    att = calculate_student_attendance(db, student.id)
    perf = calculate_student_performance(db, student.id)
    risk = calculate_student_risk(db, student.id)
    achievements = db.query(Achievement).filter(Achievement.student_id == student.id).all()
    
    # Mentor details if assigned
    mentor_assign = db.query(MentorAssignment).filter(MentorAssignment.student_id == student.id).first()
    mentor_info = None
    if mentor_assign:
        m_faculty = db.query(Faculty).filter(Faculty.id == mentor_assign.faculty_id).first()
        if m_faculty:
            mentor_info = {"id": m_faculty.id, "name": m_faculty.name, "phone": m_faculty.phone}

    return {
        "id": student.id,
        "user_id": student.user_id,
        "register_number": student.register_number,
        "name": student.name,
        "email": current_user.email,
        "department_id": student.department_id,
        "department_name": dept.name if dept else "N/A",
        "department_code": dept.code if dept else "N/A",
        "year": student.year,
        "semester": student.semester,
        "phone": student.phone,
        "skills": student.skills,
        "interests": student.interests,
        "attendance_summary": att,
        "performance_summary": perf,
        "risk_summary": risk,
        "achievements": achievements,
        "mentor": mentor_info
    }

@router.put("/students/me/profile")
def update_my_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    if data.phone is not None: student.phone = data.phone
    if data.skills is not None: student.skills = data.skills
    if data.interests is not None: student.interests = data.interests
    db.commit()
    return {"message": "Profile updated successfully"}

@router.get("/students/{student_id}/full-profile")
def get_student_full_profile(student_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    dept = db.query(Department).filter(Department.id == student.department_id).first()
    att = calculate_student_attendance(db, student.id)
    perf = calculate_student_performance(db, student.id)
    risk = calculate_student_risk(db, student.id)
    achievements = db.query(Achievement).filter(Achievement.student_id == student.id).all()
    user = db.query(User).filter(User.id == student.user_id).first()

    return {
        "id": student.id,
        "user_id": student.user_id,
        "register_number": student.register_number,
        "name": student.name,
        "email": user.email if user else "",
        "department_id": student.department_id,
        "department_name": dept.name if dept else "N/A",
        "department_code": dept.code if dept else "N/A",
        "year": student.year,
        "semester": student.semester,
        "phone": student.phone,
        "skills": student.skills,
        "interests": student.interests,
        "attendance_summary": att,
        "performance_summary": perf,
        "risk_summary": risk,
        "achievements": achievements
    }

# ==============================================================================
# 2. ADVANCED ATTENDANCE & ANALYTICS
# ==============================================================================

@router.get("/attendance/analytics")
def get_attendance_analytics(
    department_id: Optional[int] = None,
    year: Optional[int] = None,
    semester: Optional[int] = None,
    subject_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if year:
        query = query.filter(Student.year == year)
    if semester:
        query = query.filter(Student.semester == semester)
    
    students = query.all()
    student_ids = [s.id for s in students]

    att_query = db.query(Attendance).filter(Attendance.student_id.in_(student_ids))
    if subject_id:
        att_query = att_query.filter(Attendance.subject_id == subject_id)
    
    records = att_query.all()
    total = len(records)
    present = sum(1 for r in records if r.status == "PRESENT")
    absent = sum(1 for r in records if r.status == "ABSENT")
    od = sum(1 for r in records if r.status == "OD")
    leave = sum(1 for r in records if r.status == "LEAVE")
    pct = round(((present + od) / total * 100), 2) if total > 0 else 0.0

    # Low attendance student count
    low_att_count = 0
    for s in students:
        s_att = calculate_student_attendance(db, s.id)
        if s_att["attendance_percentage"] < 75.0:
            low_att_count += 1

    return {
        "total_students": len(students),
        "total_classes_recorded": total,
        "present_count": present,
        "absent_count": absent,
        "od_count": od,
        "leave_count": leave,
        "attendance_percentage": pct,
        "low_attendance_students_count": low_att_count
    }

@router.get("/attendance/student/{student_id}")
def get_specific_student_attendance(student_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return calculate_student_attendance(db, student_id)

# ==============================================================================
# 3. MARKS, PASS/FAIL & CORRELATION ANALYTICS
# ==============================================================================

@router.get("/performance/analytics")
def get_performance_analytics(
    department_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    students = query.all()
    student_ids = [s.id for s in students]

    marks = db.query(Mark).filter(Mark.student_id.in_(student_ids)).all()
    total = len(marks)
    passed = sum(1 for m in marks if (m.score / m.max_score >= 0.5) if m.max_score > 0)
    failed = total - passed
    pass_pct = round((passed / total * 100), 2) if total > 0 else 0.0

    # Subject wise pass/fail breakdown
    by_subject: Dict[int, Dict[str, Any]] = {}
    for m in marks:
        if m.subject_id not in by_subject:
            subj = db.query(Subject).filter(Subject.id == m.subject_id).first()
            by_subject[m.subject_id] = {
                "subject_id": m.subject_id,
                "name": subj.name if subj else "N/A",
                "code": subj.code if subj else "N/A",
                "total": 0,
                "passed": 0,
                "failed": 0
            }
        bs = by_subject[m.subject_id]
        bs["total"] += 1
        if m.max_score > 0 and (m.score / m.max_score >= 0.5):
            bs["passed"] += 1
        else:
            bs["failed"] += 1

    subject_breakdown = []
    for sid, sdata in by_subject.items():
        sdata["pass_percentage"] = round((sdata["passed"] / sdata["total"] * 100), 1) if sdata["total"] > 0 else 0
        subject_breakdown.append(sdata)

    return {
        "total_assessments": total,
        "passed_count": passed,
        "failed_count": failed,
        "pass_percentage": pass_pct,
        "fail_percentage": round(100.0 - pass_pct, 2) if total > 0 else 0.0,
        "subject_breakdown": subject_breakdown
    }

@router.get("/performance/correlation")
def get_performance_attendance_correlation(
    department_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    students = query.all()

    quadrants = {
        "high_att_high_marks": [],  # Att >= 75%, Marks >= 60% (Excelling)
        "high_att_low_marks": [],   # Att >= 75%, Marks < 60% (Needs Academic Support)
        "low_att_high_marks": [],   # Att < 75%, Marks >= 60% (Attendance Intervention)
        "low_att_low_marks": []     # Att < 75%, Marks < 60% (Critical Risk)
    }

    data_points = []
    for s in students:
        att = calculate_student_attendance(db, s.id)["attendance_percentage"]
        perf = calculate_student_performance(db, s.id)["overall_percentage"]
        
        item = {
            "student_id": s.id,
            "name": s.name,
            "register_number": s.register_number,
            "attendance": att,
            "marks": perf
        }
        data_points.append(item)

        if att >= 75.0 and perf >= 60.0:
            quadrants["high_att_high_marks"].append(item)
        elif att >= 75.0 and perf < 60.0:
            quadrants["high_att_low_marks"].append(item)
        elif att < 75.0 and perf >= 60.0:
            quadrants["low_att_high_marks"].append(item)
        else:
            quadrants["low_att_low_marks"].append(item)

    return {
        "data_points": data_points,
        "summary": {
            "excelling_count": len(quadrants["high_att_high_marks"]),
            "needs_academic_support_count": len(quadrants["high_att_low_marks"]),
            "attendance_warning_count": len(quadrants["low_att_high_marks"]),
            "critical_risk_count": len(quadrants["low_att_low_marks"])
        },
        "quadrants": quadrants
    }

# ==============================================================================
# 4. EXPLAINABLE RULE-BASED RISK ENGINE
# ==============================================================================

@router.get("/risk/students")
def get_all_risk_students(
    department_id: Optional[int] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    students = query.all()

    results = []
    for s in students:
        risk = calculate_student_risk(db, s.id)
        if category and risk["category"] != category:
            continue
        dept = db.query(Department).filter(Department.id == s.department_id).first()
        results.append({
            "student_id": s.id,
            "name": s.name,
            "register_number": s.register_number,
            "department": dept.name if dept else "N/A",
            "year": s.year,
            "semester": s.semester,
            "category": risk["category"],
            "risk_score": risk["risk_score"],
            "reasons": risk["reasons"],
            "recommended_actions": risk["recommended_actions"],
            "attendance_percentage": risk["attendance_percentage"],
            "academic_percentage": risk["academic_percentage"]
        })

    return results

@router.get("/risk/student/{student_id}")
def get_single_student_risk(student_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return calculate_student_risk(db, student_id)

@router.get("/risk/my")
def get_my_risk(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    return calculate_student_risk(db, student.id)

# ==============================================================================
# 5. ON DUTY (OD) WORKFLOW & ANALYTICS
# ==============================================================================

@router.post("/od")
def apply_od(data: ODCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Only students can apply for OD")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    od_date = datetime.strptime(data.date, "%Y-%m-%d").date()
    new_od = ODRequest(
        student_id=student.id,
        event_name=data.event_name,
        purpose=data.purpose,
        organization=data.organization,
        date=od_date,
        start_time=data.start_time,
        end_time=data.end_time,
        venue=data.venue,
        proof_url=data.proof_url,
        status="PENDING"
    )
    db.add(new_od)
    db.commit()
    db.refresh(new_od)

    log_audit(db, "APPLY_OD", "ODRequest", user_id=current_user.id, user_email=current_user.email, entity_id=str(new_od.id), description=f"OD applied for {data.event_name}")
    return {"message": "OD request submitted successfully", "id": new_od.id}

@router.get("/od")
def get_od_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        ods = db.query(ODRequest).filter(ODRequest.student_id == student.id).order_by(ODRequest.created_at.desc()).all()
    elif current_user.role == "HOD":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        dept_students = [s.id for s in db.query(Student).filter(Student.department_id == faculty.department_id).all()]
        ods = db.query(ODRequest).filter(ODRequest.student_id.in_(dept_students)).order_by(ODRequest.created_at.desc()).all()
    else:
        ods = db.query(ODRequest).order_by(ODRequest.created_at.desc()).all()

    result = []
    for od in ods:
        stu = db.query(Student).filter(Student.id == od.student_id).first()
        result.append({
            "id": od.id,
            "student_id": od.student_id,
            "student_name": stu.name if stu else "Unknown",
            "register_number": stu.register_number if stu else "N/A",
            "event_name": od.event_name,
            "purpose": od.purpose,
            "organization": od.organization,
            "date": od.date,
            "start_time": od.start_time,
            "end_time": od.end_time,
            "venue": od.venue,
            "proof_url": od.proof_url,
            "status": od.status,
            "remarks": od.remarks,
            "created_at": od.created_at
        })
    return result

@router.post("/od/{od_id}/status")
def update_od_status(od_id: int, data: ODStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "HOD", "FACULTY", "PRINCIPAL"]:
        raise HTTPException(status_code=403, detail="Not authorized to approve OD")
    
    od = db.query(ODRequest).filter(ODRequest.id == od_id).first()
    if not od:
        raise HTTPException(status_code=404, detail="OD request not found")
    
    od.status = data.status
    if data.remarks:
        od.remarks = data.remarks
    
    student = db.query(Student).filter(Student.id == od.student_id).first()

    # If APPROVED: connect to Attendance! Set attendance record for that date to OD
    if data.status == "APPROVED" and student:
        # Check student's subjects
        subjects = db.query(Subject).filter(Subject.department_id == student.department_id).all()
        for subj in subjects:
            existing_att = db.query(Attendance).filter(
                Attendance.student_id == student.id,
                Attendance.subject_id == subj.id,
                Attendance.date == od.date
            ).first()
            if existing_att:
                existing_att.status = "OD"
            else:
                db.add(Attendance(
                    student_id=student.id,
                    subject_id=subj.id,
                    date=od.date,
                    status="OD"
                ))

    # Send Notification to Student
    if student:
        create_notification(
            db,
            user_id=student.user_id,
            title=f"OD Request {data.status}",
            message=f"Your On-Duty request for {od.event_name} on {od.date} has been {data.status.lower()}.",
            notif_type="OD"
        )

    log_audit(db, f"UPDATE_OD_{data.status}", "ODRequest", user_id=current_user.id, user_email=current_user.email, entity_id=str(od.id), description=f"OD status updated to {data.status}")
    db.commit()
    return {"message": f"OD request {data.status.lower()} successfully"}

@router.get("/od/analytics")
def get_od_analytics(department_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ODRequest)
    if department_id:
        dept_students = [s.id for s in db.query(Student).filter(Student.department_id == department_id).all()]
        query = query.filter(ODRequest.student_id.in_(dept_students))
    
    ods = query.all()
    total = len(ods)
    approved = sum(1 for o in ods if o.status == "APPROVED")
    rejected = sum(1 for o in ods if o.status == "REJECTED")
    pending = sum(1 for o in ods if o.status == "PENDING")

    return {
        "total_od": total,
        "approved_od": approved,
        "rejected_od": rejected,
        "pending_od": pending,
        "approval_rate": round(approved / total * 100, 1) if total > 0 else 0.0
    }

# ==============================================================================
# 6. MASTER ACADEMIC CALENDAR
# ==============================================================================

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    event_type: str # CLASS, EXAM, ASSIGNMENT, HOLIDAY, LEAVE, OD, WORKSHOP, PLACEMENT, MEETING, COLLEGE
    role_visibility: Optional[str] = "ALL"
    department_id: Optional[int] = None

@router.get("/calendar/events")
def get_calendar_events(
    start: Optional[str] = None,
    end: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    merged_events = []

    # 1. Base custom calendar events
    custom_events = db.query(CalendarEvent).all()
    for ce in custom_events:
        merged_events.append({
            "id": f"cal-{ce.id}",
            "title": ce.title,
            "description": ce.description,
            "start": ce.start_date.isoformat(),
            "end": ce.end_date.isoformat(),
            "type": ce.event_type,
            "category": "COLLEGE_EVENT"
        })

    # 2. Exams
    exams = db.query(Exam).all()
    for ex in exams:
        subj = db.query(Subject).filter(Subject.id == ex.subject_id).first()
        merged_events.append({
            "id": f"exam-{ex.id}",
            "title": f"Exam: {ex.name} ({subj.code if subj else ''})",
            "description": f"Room: {ex.room}, Time: {ex.time}",
            "start": ex.date.isoformat(),
            "end": ex.date.isoformat(),
            "type": "EXAM",
            "category": "ACADEMIC"
        })

    # 3. Events & Symposia
    events = db.query(Event).all()
    for ev in events:
        merged_events.append({
            "id": f"event-{ev.id}",
            "title": ev.title,
            "description": f"Venue: {ev.venue} - {ev.description}",
            "start": ev.date.isoformat(),
            "end": ev.date.isoformat(),
            "type": "EVENT",
            "category": ev.category or "EVENT"
        })

    # 4. Placement Drives
    drives = db.query(PlacementDrive).all()
    for dr in drives:
        comp = db.query(PlacementCompany).filter(PlacementCompany.id == dr.company_id).first()
        merged_events.append({
            "id": f"drive-{dr.id}",
            "title": f"Placement: {comp.name if comp else 'Company'} - {dr.job_role}",
            "description": f"Package: {dr.ctc_package}, Location: {dr.location}",
            "start": dr.drive_date.isoformat(),
            "end": dr.drive_date.isoformat(),
            "type": "PLACEMENT",
            "category": "CAREER"
        })

    # 5. Evening Classes
    evening = db.query(EveningClass).all()
    for ec in evening:
        subj = db.query(Subject).filter(Subject.id == ec.subject_id).first()
        merged_events.append({
            "id": f"evening-{ec.id}",
            "title": f"Support Class: {subj.name if subj else 'Subject'}",
            "description": f"Time: {ec.time}",
            "start": ec.date.isoformat(),
            "end": ec.date.isoformat(),
            "type": "EVENING_CLASS",
            "category": "SUPPORT"
        })

    # 6. Approved ODs & Leaves for current student or department
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            ods = db.query(ODRequest).filter(ODRequest.student_id == student.id, ODRequest.status == "APPROVED").all()
            for o in ods:
                merged_events.append({
                    "id": f"od-{o.id}",
                    "title": f"Approved OD: {o.event_name}",
                    "description": f"Venue: {o.venue}",
                    "start": o.date.isoformat(),
                    "end": o.date.isoformat(),
                    "type": "OD",
                    "category": "OD"
                })
            leaves = db.query(LeaveRequest).filter(LeaveRequest.student_id == student.id, LeaveRequest.status == "APPROVED").all()
            for l in leaves:
                merged_events.append({
                    "id": f"leave-{l.id}",
                    "title": f"Approved Leave",
                    "description": l.reason,
                    "start": l.start_date.isoformat(),
                    "end": l.end_date.isoformat(),
                    "type": "LEAVE",
                    "category": "LEAVE"
                })

    return merged_events

@router.post("/calendar/events")
def create_calendar_event(data: CalendarEventCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "HOD", "PRINCIPAL", "FACULTY"]:
        raise HTTPException(status_code=403, detail="Not authorized to post calendar events")
    
    start_dt = datetime.fromisoformat(data.start_date.replace("Z", ""))
    end_dt = datetime.fromisoformat(data.end_date.replace("Z", ""))
    ce = CalendarEvent(
        title=data.title,
        description=data.description,
        start_date=start_dt,
        end_date=end_dt,
        event_type=data.event_type,
        role_visibility=data.role_visibility or "ALL",
        department_id=data.department_id
    )
    db.add(ce)
    db.commit()
    db.refresh(ce)
    return {"message": "Calendar event created", "id": ce.id}

# ==============================================================================
# 7. MENTORSHIP & COUNSELLING ECOSYSTEM
# ==============================================================================

@router.get("/mentor/mentees")
def get_mentor_mentees(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["FACULTY", "MENTOR", "HOD"]:
        raise HTTPException(status_code=403, detail="Mentor role required")
    
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    
    assignments = db.query(MentorAssignment).filter(MentorAssignment.faculty_id == faculty.id).all()
    mentee_ids = [a.student_id for a in assignments]
    students = db.query(Student).filter(Student.id.in_(mentee_ids)).all()

    results = []
    for s in students:
        att = calculate_student_attendance(db, s.id)
        perf = calculate_student_performance(db, s.id)
        risk = calculate_student_risk(db, s.id)
        last_counselling = db.query(CounsellingRecord).filter(
            CounsellingRecord.student_id == s.id
        ).order_by(CounsellingRecord.session_date.desc()).first()

        results.append({
            "id": s.id,
            "name": s.name,
            "register_number": s.register_number,
            "year": s.year,
            "semester": s.semester,
            "phone": s.phone,
            "attendance_percentage": att["attendance_percentage"],
            "academic_percentage": perf["overall_percentage"],
            "risk_category": risk["category"],
            "risk_reasons": risk["reasons"],
            "recommended_actions": risk["recommended_actions"],
            "last_counselling_date": last_counselling.session_date if last_counselling else None,
            "last_counselling_remarks": last_counselling.remarks if last_counselling else None
        })
    return results

@router.get("/mentor/mentee/{student_id}/counselling")
def get_counselling_history(student_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(CounsellingRecord).filter(
        CounsellingRecord.student_id == student_id
    ).order_by(CounsellingRecord.session_date.desc()).all()
    
    result = []
    for r in records:
        mentor = db.query(Faculty).filter(Faculty.id == r.mentor_id).first()
        result.append({
            "id": r.id,
            "mentor_id": r.mentor_id,
            "mentor_name": mentor.name if mentor else "Mentor",
            "session_date": r.session_date,
            "remarks": r.remarks,
            "action_plan": r.action_plan,
            "follow_up_date": r.follow_up_date,
            "created_at": r.created_at
        })
    return result

@router.post("/mentor/counselling")
def add_counselling_session(data: CounsellingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=403, detail="Faculty record required")
    
    session_dt = datetime.strptime(data.session_date, "%Y-%m-%d").date()
    follow_up_dt = datetime.strptime(data.follow_up_date, "%Y-%m-%d").date() if data.follow_up_date else None
    
    record = CounsellingRecord(
        mentor_id=faculty.id,
        student_id=data.student_id,
        session_date=session_dt,
        remarks=data.remarks,
        action_plan=data.action_plan,
        follow_up_date=follow_up_dt
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Notify student
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if student:
        create_notification(
            db,
            user_id=student.user_id,
            title="Mentor Counselling Recorded",
            message=f"Mentor session on {data.session_date} recorded. Action Plan: {data.action_plan or 'Follow guidance'}",
            notif_type="COUNSELLING"
        )

    log_audit(db, "ADD_COUNSELLING", "CounsellingRecord", user_id=current_user.id, user_email=current_user.email, entity_id=str(record.id), description=f"Counselling recorded for student {data.student_id}")
    return {"message": "Counselling session recorded successfully", "id": record.id}

class MentorAssignRequest(BaseModel):
    faculty_id: int
    student_id: int

@router.post("/hod/assign-mentor")
def assign_mentor(data: MentorAssignRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["HOD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="HOD or Admin authorization required")
    
    existing = db.query(MentorAssignment).filter(MentorAssignment.student_id == data.student_id).first()
    if existing:
        existing.faculty_id = data.faculty_id
    else:
        db.add(MentorAssignment(faculty_id=data.faculty_id, student_id=data.student_id))
    db.commit()

    faculty = db.query(Faculty).filter(Faculty.id == data.faculty_id).first()
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if student and faculty:
        create_notification(
            db,
            user_id=student.user_id,
            title="Mentor Assigned",
            message=f"{faculty.name} has been assigned as your academic mentor.",
            notif_type="MENTOR"
        )
    return {"message": "Mentor assigned successfully"}

# ==============================================================================
# 8. HOD & PRINCIPAL DASHBOARD PORTALS
# ==============================================================================

@router.get("/dashboard/hod")
def get_hod_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["HOD", "ADMIN"]:
        raise HTTPException(status_code=403, detail="HOD authorization required")
    
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    dept_id = faculty.department_id if faculty else 1
    dept = db.query(Department).filter(Department.id == dept_id).first()
    
    dept_analytics = calculate_department_analytics(db, dept_id)
    subjects = db.query(Subject).filter(Subject.department_id == dept_id).all()
    faculties = db.query(Faculty).filter(Faculty.department_id == dept_id).all()

    return {
        "department": {"id": dept.id, "name": dept.name, "code": dept.code} if dept else None,
        "analytics": dept_analytics,
        "subjects": subjects,
        "faculty_members": faculties
    }

@router.get("/dashboard/principal")
def get_principal_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["PRINCIPAL", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Principal authorization required")
    
    college_analytics = calculate_college_analytics(db)
    pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status == "PENDING").count()
    pending_ods = db.query(ODRequest).filter(ODRequest.status == "PENDING").count()
    total_events = db.query(Event).count()

    return {
        "college_analytics": college_analytics,
        "pending_approvals": {
            "leaves": pending_leaves,
            "od": pending_ods
        },
        "total_events": total_events
    }

# ==============================================================================
# 9. PARENT PORTAL
# ==============================================================================

@router.get("/dashboard/parent")
def get_parent_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "PARENT":
        raise HTTPException(status_code=403, detail="Parent role required")
    
    mapping = db.query(ParentStudentMapping).filter(ParentStudentMapping.parent_user_id == current_user.id).first()
    if not mapping:
        # Fallback to demo first student if mapping not created yet
        student = db.query(Student).first()
    else:
        student = db.query(Student).filter(Student.id == mapping.student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Linked student profile not found")

    dept = db.query(Department).filter(Department.id == student.department_id).first()
    att = calculate_student_attendance(db, student.id)
    perf = calculate_student_performance(db, student.id)
    risk = calculate_student_risk(db, student.id)
    fee = db.query(Fee).filter(Fee.student_id == student.id).first()
    
    mentor_assign = db.query(MentorAssignment).filter(MentorAssignment.student_id == student.id).first()
    mentor_info = None
    if mentor_assign:
        m_faculty = db.query(Faculty).filter(Faculty.id == mentor_assign.faculty_id).first()
        if m_faculty:
            mentor_info = {"name": m_faculty.name, "phone": m_faculty.phone}

    return {
        "student": {
            "id": student.id,
            "name": student.name,
            "register_number": student.register_number,
            "department": dept.name if dept else "N/A",
            "year": student.year,
            "semester": student.semester
        },
        "attendance": att,
        "performance": perf,
        "risk_status": risk,
        "fee": fee,
        "mentor": mentor_info,
        "alerts": risk["reasons"] if risk["category"] in ["AT_RISK", "NEEDS_ATTENTION"] else []
    }

class LinkParentRequest(BaseModel):
    register_number: str
    relationship_type: Optional[str] = "PARENT"

@router.post("/parent/link-student")
def link_parent_student(data: LinkParentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "PARENT":
        raise HTTPException(status_code=403, detail="Parent authorization required")
    
    student = db.query(Student).filter(Student.register_number == data.register_number).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student register number not found")
    
    existing = db.query(ParentStudentMapping).filter(ParentStudentMapping.parent_user_id == current_user.id).first()
    if existing:
        existing.student_id = student.id
        existing.relationship_type = data.relationship_type or "PARENT"
    else:
        db.add(ParentStudentMapping(parent_user_id=current_user.id, student_id=student.id, relationship_type=data.relationship_type or "PARENT"))
    db.commit()
    return {"message": f"Successfully connected to student {student.name}"}

# ==============================================================================
# 10. PLACEMENT CELL ECOSYSTEM
# ==============================================================================

@router.get("/placement/companies")
def get_placement_companies(db: Session = Depends(get_db)):
    return db.query(PlacementCompany).all()

@router.post("/placement/companies")
def create_placement_company(data: PlacementCompanyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY", "HOD"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    comp = PlacementCompany(**data.model_dump())
    db.add(comp)
    db.commit()
    db.refresh(comp)
    log_audit(db, "CREATE_COMPANY", "PlacementCompany", user_id=current_user.id, user_email=current_user.email, entity_id=str(comp.id), description=f"Company {comp.name} added")
    return comp

@router.get("/placement/drives")
def get_placement_drives(db: Session = Depends(get_db)):
    drives = db.query(PlacementDrive).all()
    results = []
    for d in drives:
        comp = db.query(PlacementCompany).filter(PlacementCompany.id == d.company_id).first()
        dept = db.query(Department).filter(Department.id == d.department_id).first() if d.department_id else None
        results.append({
            "id": d.id,
            "company_name": comp.name if comp else "Unknown",
            "company_website": comp.website if comp else "",
            "job_role": d.job_role,
            "ctc_package": d.ctc_package,
            "eligibility_cgpa": d.eligibility_cgpa,
            "department_name": dept.name if dept else "All Departments",
            "drive_date": d.drive_date,
            "deadline": d.deadline,
            "location": d.location,
            "description": d.description,
            "status": d.status
        })
    return results

@router.post("/placement/drives")
def create_placement_drive(data: PlacementDriveCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY", "HOD"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    drive_dt = datetime.strptime(data.drive_date, "%Y-%m-%d").date()
    deadline_dt = datetime.strptime(data.deadline, "%Y-%m-%d").date()
    
    drive = PlacementDrive(
        company_id=data.company_id,
        job_role=data.job_role,
        ctc_package=data.ctc_package,
        eligibility_cgpa=data.eligibility_cgpa or 6.0,
        department_id=data.department_id,
        drive_date=drive_dt,
        deadline=deadline_dt,
        location=data.location,
        description=data.description
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)
    log_audit(db, "CREATE_DRIVE", "PlacementDrive", user_id=current_user.id, user_email=current_user.email, entity_id=str(drive.id), description=f"Placement drive {data.job_role} created")
    return drive

@router.post("/placement/drives/{drive_id}/apply")
def apply_to_drive(drive_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Only students can apply")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    existing = db.query(PlacementApplication).filter(
        PlacementApplication.drive_id == drive_id,
        PlacementApplication.student_id == student.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this drive")
    
    app = PlacementApplication(drive_id=drive_id, student_id=student.id, status="APPLIED")
    db.add(app)
    db.commit()

    log_audit(db, "APPLY_PLACEMENT", "PlacementApplication", user_id=current_user.id, user_email=current_user.email, entity_id=str(app.id), description=f"Student applied to drive #{drive_id}")
    return {"message": "Placement application submitted successfully"}

@router.get("/placement/my-applications")
def get_my_placement_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    apps = db.query(PlacementApplication).filter(PlacementApplication.student_id == student.id).all()
    results = []
    for a in apps:
        d = db.query(PlacementDrive).filter(PlacementDrive.id == a.drive_id).first()
        comp = db.query(PlacementCompany).filter(PlacementCompany.id == d.company_id).first() if d else None
        results.append({
            "id": a.id,
            "drive_id": a.drive_id,
            "company_name": comp.name if comp else "Company",
            "job_role": d.job_role if d else "N/A",
            "ctc_package": d.ctc_package if d else "N/A",
            "status": a.status,
            "applied_at": a.applied_at,
            "remarks": a.remarks
        })
    return results

@router.get("/placement/drives/{drive_id}/applications")
def get_drive_applications(drive_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(PlacementApplication).filter(PlacementApplication.drive_id == drive_id).all()
    results = []
    for a in apps:
        stu = db.query(Student).filter(Student.id == a.student_id).first()
        results.append({
            "id": a.id,
            "student_id": a.student_id,
            "student_name": stu.name if stu else "Unknown",
            "register_number": stu.register_number if stu else "N/A",
            "year": stu.year if stu else 0,
            "status": a.status,
            "applied_at": a.applied_at,
            "remarks": a.remarks
        })
    return results

@router.patch("/placement/applications/{app_id}/status")
def update_placement_status(app_id: int, data: PlacementApplicationStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY", "HOD", "PRINCIPAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    app = db.query(PlacementApplication).filter(PlacementApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app.status = data.status
    if data.remarks: app.remarks = data.remarks
    db.commit()

    student = db.query(Student).filter(Student.id == app.student_id).first()
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == app.drive_id).first()
    comp = db.query(PlacementCompany).filter(PlacementCompany.id == drive.company_id).first() if drive else None

    if student:
        create_notification(
            db,
            user_id=student.user_id,
            title=f"Placement Update: {data.status}",
            message=f"Your application status for {comp.name if comp else 'Company'} has changed to {data.status}.",
            notif_type="PLACEMENT"
        )

    log_audit(db, f"UPDATE_PLACEMENT_{data.status}", "PlacementApplication", user_id=current_user.id, user_email=current_user.email, entity_id=str(app.id), description=f"Updated application #{app_id} to {data.status}")
    return {"message": "Status updated successfully"}

@router.get("/placement/analytics")
def get_placement_analytics(db: Session = Depends(get_db)):
    apps = db.query(PlacementApplication).all()
    total = len(apps)
    selected = sum(1 for a in apps if a.status == "SELECTED")
    interview = sum(1 for a in apps if a.status == "INTERVIEW")
    shortlisted = sum(1 for a in apps if a.status == "SHORTLISTED")
    rejected = sum(1 for a in apps if a.status == "REJECTED")

    return {
        "total_applications": total,
        "selected_count": selected,
        "interview_count": interview,
        "shortlisted_count": shortlisted,
        "rejected_count": rejected,
        "placement_rate": round(selected / total * 100, 1) if total > 0 else 0.0,
        "total_drives": db.query(PlacementDrive).count(),
        "total_companies": db.query(PlacementCompany).count()
    }

# ==============================================================================
# 11. DIGITAL PORTFOLIO (ACHIEVEMENTS)
# ==============================================================================

@router.post("/achievements")
def create_achievement(data: AchievementCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()

    ach_date = datetime.strptime(data.date, "%Y-%m-%d").date() if data.date else None
    ach = Achievement(
        student_id=student.id,
        title=data.title,
        category=data.category,
        description=data.description,
        date=ach_date,
        proof_url=data.proof_url,
        verification_status="PENDING"
    )
    db.add(ach)
    db.commit()
    db.refresh(ach)

    log_audit(db, "ADD_ACHIEVEMENT", "Achievement", user_id=current_user.id, user_email=current_user.email, entity_id=str(ach.id), description=f"Achievement added: {data.title}")
    return {"message": "Achievement added to portfolio", "id": ach.id}

@router.get("/achievements/my")
def get_my_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    return db.query(Achievement).filter(Achievement.student_id == student.id).order_by(Achievement.created_at.desc()).all()

@router.get("/achievements/pending")
def get_pending_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY", "HOD"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    achs = db.query(Achievement).filter(Achievement.verification_status == "PENDING").all()
    results = []
    for a in achs:
        stu = db.query(Student).filter(Student.id == a.student_id).first()
        results.append({
            "id": a.id,
            "student_id": a.student_id,
            "student_name": stu.name if stu else "Unknown",
            "register_number": stu.register_number if stu else "N/A",
            "title": a.title,
            "category": a.category,
            "description": a.description,
            "date": a.date,
            "proof_url": a.proof_url,
            "verification_status": a.verification_status,
            "created_at": a.created_at
        })
    return results

@router.patch("/achievements/{ach_id}/verify")
def verify_achievement(ach_id: int, data: AchievementVerify, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY", "HOD"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    ach.verification_status = data.verification_status
    ach.verified_by_id = current_user.id
    db.commit()

    student = db.query(Student).filter(Student.id == ach.student_id).first()
    if student:
        create_notification(
            db,
            user_id=student.user_id,
            title=f"Achievement {data.verification_status}",
            message=f"Your achievement '{ach.title}' has been {data.verification_status.lower()}.",
            notif_type="ACHIEVEMENT"
        )
    return {"message": "Verification updated"}

# ==============================================================================
# 12. DOCUMENT MANAGEMENT REPOSITORY
# ==============================================================================

@router.get("/documents")
def get_documents(category: Optional[str] = None, department_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(DocumentRecord)
    if category: query = query.filter(DocumentRecord.category == category)
    if department_id: query = query.filter(DocumentRecord.department_id == department_id)
    return query.order_by(DocumentRecord.created_at.desc()).all()

@router.post("/documents")
def upload_document(data: DocumentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "FACULTY", "HOD"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    doc = DocumentRecord(**data.model_dump(), uploaded_by_id=current_user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    log_audit(db, "UPLOAD_DOCUMENT", "DocumentRecord", user_id=current_user.id, user_email=current_user.email, entity_id=str(doc.id), description=f"Uploaded {doc.title}")
    return doc

# ==============================================================================
# 13. GENERIC REQUEST MANAGEMENT (Bonafide, No-Due, etc.)
# ==============================================================================

@router.post("/requests")
def create_generic_request(data: GenericRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "STUDENT":
        raise HTTPException(status_code=403, detail="Student role required")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    req = GenericRequest(student_id=student.id, request_type=data.request_type, reason=data.reason, status="PENDING")
    db.add(req)
    db.commit()
    db.refresh(req)

    log_audit(db, "CREATE_REQUEST", "GenericRequest", user_id=current_user.id, user_email=current_user.email, entity_id=str(req.id), description=f"Submitted request: {data.request_type}")
    return {"message": "Request submitted successfully", "id": req.id}

@router.get("/requests")
def get_generic_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        reqs = db.query(GenericRequest).filter(GenericRequest.student_id == student.id).order_by(GenericRequest.created_at.desc()).all()
    else:
        reqs = db.query(GenericRequest).order_by(GenericRequest.created_at.desc()).all()

    results = []
    for r in reqs:
        stu = db.query(Student).filter(Student.id == r.student_id).first()
        results.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": stu.name if stu else "Unknown",
            "register_number": stu.register_number if stu else "N/A",
            "request_type": r.request_type,
            "reason": r.reason,
            "status": r.status,
            "stage": r.stage,
            "remarks": r.remarks,
            "created_at": r.created_at
        })
    return results

@router.patch("/requests/{req_id}/status")
def update_request_status(req_id: int, data: GenericRequestUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "HOD", "FACULTY", "PRINCIPAL"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    req = db.query(GenericRequest).filter(GenericRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = data.status
    if data.remarks: req.remarks = data.remarks
    db.commit()

    student = db.query(Student).filter(Student.id == req.student_id).first()
    if student:
        create_notification(
            db,
            user_id=student.user_id,
            title=f"Request {data.status}: {req.request_type}",
            message=f"Your {req.request_type} request has been {data.status.lower()}.",
            notif_type="REQUEST"
        )
    return {"message": "Request status updated"}

# ==============================================================================
# 14. COMMUNICATION & EMAIL ARCHITECTURE (DEV SAFE)
# ==============================================================================

@router.post("/email/send")
def send_email_communication(data: EmailSendRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["ADMIN", "HOD", "FACULTY", "PRINCIPAL", "MENTOR"]:
        raise HTTPException(status_code=403, detail="Not authorized to send institution emails")
    
    log = log_email(
        db,
        recipient_email=data.recipient_email,
        subject=data.subject,
        body=data.body,
        template_name=data.template_name,
        sender_id=current_user.id
    )
    return {"message": "Email logged and dispatched in simulated development mode", "log_id": log.id}

@router.get("/email/logs")
def get_email_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(EmailLog).order_by(EmailLog.sent_at.desc()).limit(100).all()

# ==============================================================================
# 15. AUDIT LOGS & SYSTEM SETTINGS
# ==============================================================================

@router.get("/audit/logs")
def get_audit_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(150).all()

@router.get("/settings")
def get_system_settings(db: Session = Depends(get_db)):
    return db.query(SystemSetting).all()

@router.put("/settings/{key}")
def update_system_setting(key: str, data: SettingUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if setting:
        setting.value = data.value
        if data.description: setting.description = data.description
    else:
        setting = SystemSetting(key=key, value=data.value, description=data.description)
        db.add(setting)
    db.commit()
    log_audit(db, "UPDATE_SETTING", "SystemSetting", user_id=current_user.id, user_email=current_user.email, entity_id=key, description=f"Updated setting {key} to {data.value}")
    return {"message": "Setting saved"}

# ==============================================================================
# 16. COMPREHENSIVE REPORTS CENTER
# ==============================================================================

@router.get("/reports/{report_type}")
def generate_report(
    report_type: str,
    department_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "HOD", "PRINCIPAL", "FACULTY"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if report_type == "attendance":
        query = db.query(Student)
        if department_id: query = query.filter(Student.department_id == department_id)
        students = query.all()
        rows = []
        for s in students:
            dept = db.query(Department).filter(Department.id == s.department_id).first()
            att = calculate_student_attendance(db, s.id)
            rows.append({
                "Register Number": s.register_number,
                "Name": s.name,
                "Department": dept.name if dept else "N/A",
                "Year": s.year,
                "Total Classes": att["total_classes"],
                "Present": att["present_count"],
                "Absent": att["absent_count"],
                "OD": att["od_count"],
                "Leave": att["leave_count"],
                "Attendance %": f"{att['attendance_percentage']}%",
                "Status": "Normal" if att["attendance_percentage"] >= 75.0 else "Low Attendance Warning"
            })
        return {"report_title": "Comprehensive Student Attendance Report", "data": rows}

    elif report_type == "performance":
        query = db.query(Student)
        if department_id: query = query.filter(Student.department_id == department_id)
        students = query.all()
        rows = []
        for s in students:
            dept = db.query(Department).filter(Department.id == s.department_id).first()
            perf = calculate_student_performance(db, s.id)
            rows.append({
                "Register Number": s.register_number,
                "Name": s.name,
                "Department": dept.name if dept else "N/A",
                "Assessments Taken": perf["total_assessments"],
                "Overall Marks %": f"{perf['overall_percentage']}%",
                "Passed Tests": perf["pass_count"],
                "Failed Tests": perf["fail_count"],
                "Academic Status": perf["status"]
            })
        return {"report_title": "Academic Marks & Performance Report", "data": rows}

    elif report_type == "risk":
        query = db.query(Student)
        if department_id: query = query.filter(Student.department_id == department_id)
        students = query.all()
        rows = []
        for s in students:
            dept = db.query(Department).filter(Department.id == s.department_id).first()
            risk = calculate_student_risk(db, s.id)
            rows.append({
                "Register Number": s.register_number,
                "Name": s.name,
                "Department": dept.name if dept else "N/A",
                "Risk Category": risk["category"],
                "Risk Score": f"{risk['risk_score']}/10",
                "Reasons": "; ".join(risk["reasons"]),
                "Recommended Actions": "; ".join(risk["recommended_actions"])
            })
        return {"report_title": "At-Risk Student Diagnostic Report", "data": rows}

    elif report_type == "placements":
        apps = db.query(PlacementApplication).all()
        rows = []
        for a in apps:
            stu = db.query(Student).filter(Student.id == a.student_id).first()
            d = db.query(PlacementDrive).filter(PlacementDrive.id == a.drive_id).first()
            comp = db.query(PlacementCompany).filter(PlacementCompany.id == d.company_id).first() if d else None
            rows.append({
                "Student": stu.name if stu else "Unknown",
                "Register Number": stu.register_number if stu else "N/A",
                "Company": comp.name if comp else "N/A",
                "Job Role": d.job_role if d else "N/A",
                "Package": d.ctc_package if d else "N/A",
                "Status": a.status,
                "Applied Date": str(a.applied_at.date()) if a.applied_at else ""
            })
        return {"report_title": "Campus Placement Drive Report", "data": rows}

    elif report_type == "fees":
        fees = db.query(Fee).all()
        rows = []
        for f in fees:
            stu = db.query(Student).filter(Student.id == f.student_id).first()
            rows.append({
                "Student": stu.name if stu else "Unknown",
                "Register Number": stu.register_number if stu else "N/A",
                "Total Fee": f.total_amount,
                "Paid Amount": f.paid_amount,
                "Outstanding Amount": f.total_amount - f.paid_amount,
                "Due Date": str(f.due_date),
                "Status": "PAID" if f.paid_amount >= f.total_amount else "PENDING"
            })
        return {"report_title": "Student Fee Collection & Outstanding Report", "data": rows}

    else:
        raise HTTPException(status_code=400, detail="Unknown report type")
