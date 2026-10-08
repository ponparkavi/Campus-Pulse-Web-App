from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
import math
from models.all_models import (
    Student, Faculty, Department, Subject, Attendance, Mark,
    Assignment, AssignmentSubmission, LeaveRequest, ODRequest,
    Fee, PlacementDrive, PlacementApplication, EveningClassStudent,
    CounsellingRecord
)

def calculate_student_attendance(db: Session, student_id: int) -> Dict[str, Any]:
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total_classes = len(records)
    present_count = sum(1 for r in records if r.status == "PRESENT")
    absent_count = sum(1 for r in records if r.status == "ABSENT")
    od_count = sum(1 for r in records if r.status == "OD")
    leave_count = sum(1 for r in records if r.status == "LEAVE")

    effective_present = present_count + od_count
    attendance_pct = round((effective_present / total_classes * 100), 2) if total_classes > 0 else 100.0

    # Subject wise breakdown
    subject_map: Dict[int, Dict[str, Any]] = {}
    for r in records:
        if r.subject_id not in subject_map:
            subj = db.query(Subject).filter(Subject.id == r.subject_id).first()
            subject_map[r.subject_id] = {
                "subject_id": r.subject_id,
                "subject_name": subj.name if subj else f"Subject #{r.subject_id}",
                "subject_code": subj.code if subj else "N/A",
                "total": 0,
                "present": 0,
                "absent": 0,
                "od": 0,
                "leave": 0
            }
        sm = subject_map[r.subject_id]
        sm["total"] += 1
        if r.status == "PRESENT": sm["present"] += 1
        elif r.status == "ABSENT": sm["absent"] += 1
        elif r.status == "OD": sm["od"] += 1
        elif r.status == "LEAVE": sm["leave"] += 1

    subject_list = []
    low_attendance_subjects = []
    for s_id, sm in subject_map.items():
        eff = sm["present"] + sm["od"]
        pct = round((eff / sm["total"] * 100), 2) if sm["total"] > 0 else 100.0
        sm["percentage"] = pct
        subject_list.append(sm)
        if pct < 75.0:
            low_attendance_subjects.append(sm["subject_name"])

    # "How many classes can I miss?" calculator (target threshold = 75%)
    target_pct = 75.0
    classes_can_miss = 0
    classes_needed = 0
    if total_classes > 0:
        if attendance_pct >= target_pct:
            # (effective_present) / (total_classes + X) >= 0.75 => effective_present >= 0.75 * total + 0.75 * X
            # X <= (effective_present - 0.75 * total_classes) / 0.75
            max_missable = (effective_present - (target_pct / 100.0) * total_classes) / (target_pct / 100.0)
            classes_can_miss = max(0, int(math.floor(max_missable)))
        else:
            # (effective_present + Y) / (total_classes + Y) >= 0.75 => effective_present + Y >= 0.75 * total + 0.75 * Y
            # 0.25 * Y >= 0.75 * total - effective_present => Y >= (0.75 * total - effective_present) / 0.25
            needed = ((target_pct / 100.0) * total_classes - effective_present) / (1.0 - (target_pct / 100.0))
            classes_needed = max(1, int(math.ceil(needed)))

    return {
        "total_classes": total_classes,
        "present_count": present_count,
        "absent_count": absent_count,
        "od_count": od_count,
        "leave_count": leave_count,
        "attendance_percentage": attendance_pct,
        "subject_breakdown": subject_list,
        "low_attendance_subjects": low_attendance_subjects,
        "classes_can_miss": classes_can_miss,
        "classes_needed": classes_needed,
        "is_low": attendance_pct < 75.0
    }

def calculate_student_performance(db: Session, student_id: int) -> Dict[str, Any]:
    marks = db.query(Mark).filter(Mark.student_id == student_id).all()
    if not marks:
        return {
            "total_assessments": 0,
            "overall_percentage": 0.0,
            "pass_count": 0,
            "fail_count": 0,
            "status": "PASS",
            "subject_scores": [],
            "performance_trend": [],
            "strong_subjects": [],
            "weak_subjects": []
        }

    total_score = sum(m.score for m in marks)
    max_score_total = sum(m.max_score for m in marks if m.max_score > 0)
    overall_pct = round((total_score / max_score_total * 100), 2) if max_score_total > 0 else 0.0

    pass_count = sum(1 for m in marks if (m.score / m.max_score >= 0.5) if m.max_score > 0)
    fail_count = len(marks) - pass_count

    # Group by subject
    by_subject: Dict[int, Dict[str, Any]] = {}
    for m in marks:
        if m.subject_id not in by_subject:
            subj = db.query(Subject).filter(Subject.id == m.subject_id).first()
            by_subject[m.subject_id] = {
                "subject_id": m.subject_id,
                "subject_name": subj.name if subj else f"Subject #{m.subject_id}",
                "code": subj.code if subj else "N/A",
                "scores": [],
                "total_scored": 0.0,
                "total_max": 0.0
            }
        by_subject[m.subject_id]["scores"].append({
            "exam_type": m.exam_type,
            "score": m.score,
            "max_score": m.max_score,
            "percentage": round((m.score / m.max_score * 100), 1) if m.max_score > 0 else 0
        })
        by_subject[m.subject_id]["total_scored"] += m.score
        by_subject[m.subject_id]["total_max"] += m.max_score

    subject_scores = []
    strong_subjects = []
    weak_subjects = []
    for sid, sdata in by_subject.items():
        pct = round((sdata["total_scored"] / sdata["total_max"] * 100), 1) if sdata["total_max"] > 0 else 0
        sdata["percentage"] = pct
        subject_scores.append(sdata)
        if pct >= 75.0:
            strong_subjects.append(sdata["subject_name"])
        elif pct < 50.0:
            weak_subjects.append(sdata["subject_name"])

    # Trend by exam_type
    trend_map: Dict[str, List[float]] = {}
    for m in marks:
        if m.max_score > 0:
            trend_map.setdefault(m.exam_type, []).append(round(m.score / m.max_score * 100, 1))
    
    trend = [{"exam_type": et, "average": round(sum(vals)/len(vals), 1)} for et, vals in trend_map.items()]

    return {
        "total_assessments": len(marks),
        "overall_percentage": overall_pct,
        "pass_count": pass_count,
        "fail_count": fail_count,
        "status": "PASS" if fail_count == 0 else "NEEDS_IMPROVEMENT",
        "subject_scores": subject_scores,
        "performance_trend": trend,
        "strong_subjects": strong_subjects,
        "weak_subjects": weak_subjects
    }

def calculate_student_risk(db: Session, student_id: int) -> Dict[str, Any]:
    att = calculate_student_attendance(db, student_id)
    perf = calculate_student_performance(db, student_id)
    
    reasons: List[str] = []
    risk_score = 0  # 0 to 10

    # 1. Attendance checks
    if att["total_classes"] > 0:
        if att["attendance_percentage"] < 65.0:
            reasons.append(f"Critical low attendance: {att['attendance_percentage']}% (threshold 75%)")
            risk_score += 4
        elif att["attendance_percentage"] < 75.0:
            reasons.append(f"Borderline attendance: {att['attendance_percentage']}%")
            risk_score += 2

    # 2. Performance checks
    if perf["total_assessments"] > 0:
        if perf["overall_percentage"] < 40.0:
            reasons.append(f"Critical academic score: {perf['overall_percentage']}%")
            risk_score += 4
        elif perf["overall_percentage"] < 50.0:
            reasons.append(f"Below average marks: {perf['overall_percentage']}%")
            risk_score += 2
        
        if perf["fail_count"] > 1:
            reasons.append(f"Failed {perf['fail_count']} assessments")
            risk_score += 3
        elif perf["fail_count"] == 1:
            reasons.append(f"Failed 1 assessment")
            risk_score += 1

    # 3. Pending assignments
    student = db.query(Student).filter(Student.id == student_id).first()
    if student and student.department_id:
        dept_subjects = [s.id for s in db.query(Subject).filter(Subject.department_id == student.department_id).all()]
        total_assignments = db.query(Assignment).filter(Assignment.subject_id.in_(dept_subjects)).count()
        submitted = db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == student_id).count()
        pending_assignments = max(0, total_assignments - submitted)
        if pending_assignments >= 3:
            reasons.append(f"{pending_assignments} assignments pending submission")
            risk_score += 2

    if risk_score >= 5:
        category = "AT_RISK"
    elif risk_score >= 2:
        category = "NEEDS_ATTENTION"
    else:
        category = "GOOD"

    recommended_actions = []
    if category == "AT_RISK":
        recommended_actions.append("Schedule urgent Mentor Counselling")
        recommended_actions.append("Assign Evening Academic Support Class")
        recommended_actions.append("Dispatch Attendance & Performance Notice to Parent")
    elif category == "NEEDS_ATTENTION":
        recommended_actions.append("Assign Subject Peer Mentoring")
        recommended_actions.append("Monitor next internal assessment results")

    return {
        "student_id": student_id,
        "category": category,
        "risk_score": risk_score,
        "reasons": reasons,
        "recommended_actions": recommended_actions,
        "attendance_percentage": att["attendance_percentage"],
        "academic_percentage": perf["overall_percentage"]
    }

def calculate_department_analytics(db: Session, department_id: int) -> Dict[str, Any]:
    students = db.query(Student).filter(Student.department_id == department_id).all()
    faculty_count = db.query(Faculty).filter(Faculty.department_id == department_id).count()
    student_ids = [s.id for s in students]

    total_students = len(students)
    if total_students == 0:
        return {
            "total_students": 0,
            "faculty_count": faculty_count,
            "attendance_percentage": 0.0,
            "present_count": 0,
            "absent_count": 0,
            "od_count": 0,
            "leave_count": 0,
            "pass_percentage": 0.0,
            "at_risk_count": 0,
            "at_risk_students": [],
            "pending_leave_count": 0,
            "pending_od_count": 0,
            "fee_stats": {"total": 0, "paid": 0, "outstanding": 0}
        }

    # Department Attendance
    attendances = db.query(Attendance).filter(Attendance.student_id.in_(student_ids)).all()
    total_att = len(attendances)
    present_cnt = sum(1 for a in attendances if a.status == "PRESENT")
    absent_cnt = sum(1 for a in attendances if a.status == "ABSENT")
    od_cnt = sum(1 for a in attendances if a.status == "OD")
    leave_cnt = sum(1 for a in attendances if a.status == "LEAVE")
    overall_att_pct = round(((present_cnt + od_cnt) / total_att * 100), 2) if total_att > 0 else 0.0

    # Department Marks
    marks = db.query(Mark).filter(Mark.student_id.in_(student_ids)).all()
    total_marks = len(marks)
    pass_marks = sum(1 for m in marks if (m.score / m.max_score >= 0.5) if m.max_score > 0)
    pass_pct = round((pass_marks / total_marks * 100), 2) if total_marks > 0 else 0.0

    # Risk analysis across students
    at_risk_students = []
    for s in students:
        risk = calculate_student_risk(db, s.id)
        if risk["category"] in ["AT_RISK", "NEEDS_ATTENTION"]:
            at_risk_students.append({
                "student_id": s.id,
                "name": s.name,
                "register_number": s.register_number,
                "year": s.year,
                "category": risk["category"],
                "reasons": risk["reasons"],
                "attendance_percentage": risk["attendance_percentage"],
                "academic_percentage": risk["academic_percentage"]
            })

    # Leave & OD requests
    pending_leave = db.query(LeaveRequest).filter(LeaveRequest.student_id.in_(student_ids), LeaveRequest.status == "PENDING").count()
    pending_od = db.query(ODRequest).filter(ODRequest.student_id.in_(student_ids), ODRequest.status == "PENDING").count()

    # Fee statistics
    fees = db.query(Fee).filter(Fee.student_id.in_(student_ids)).all()
    total_fees = sum(f.total_amount for f in fees)
    paid_fees = sum(f.paid_amount for f in fees)
    outstanding_fees = total_fees - paid_fees

    return {
        "total_students": total_students,
        "faculty_count": faculty_count,
        "attendance_percentage": overall_att_pct,
        "present_count": present_cnt,
        "absent_count": absent_cnt,
        "od_count": od_cnt,
        "leave_count": leave_cnt,
        "pass_percentage": pass_pct,
        "fail_percentage": round(100.0 - pass_pct, 2) if total_marks > 0 else 0.0,
        "at_risk_count": len(at_risk_students),
        "at_risk_students": at_risk_students,
        "pending_leave_count": pending_leave,
        "pending_od_count": pending_od,
        "fee_stats": {
            "total": total_fees,
            "paid": paid_fees,
            "outstanding": outstanding_fees,
            "collection_rate": round(paid_fees / total_fees * 100, 1) if total_fees > 0 else 100.0
        }
    }

def calculate_college_analytics(db: Session) -> Dict[str, Any]:
    departments = db.query(Department).all()
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()

    # Overall Attendance
    attendances = db.query(Attendance).all()
    total_att = len(attendances)
    present_cnt = sum(1 for a in attendances if a.status == "PRESENT")
    absent_cnt = sum(1 for a in attendances if a.status == "ABSENT")
    od_cnt = sum(1 for a in attendances if a.status == "OD")
    leave_cnt = sum(1 for a in attendances if a.status == "LEAVE")
    overall_att_pct = round(((present_cnt + od_cnt) / total_att * 100), 2) if total_att > 0 else 0.0

    # Overall Pass/Fail
    marks = db.query(Mark).all()
    total_marks = len(marks)
    pass_cnt = sum(1 for m in marks if (m.score / m.max_score >= 0.5) if m.max_score > 0)
    pass_pct = round((pass_cnt / total_marks * 100), 2) if total_marks > 0 else 0.0

    # Fees
    fees = db.query(Fee).all()
    total_fee_sum = sum(f.total_amount for f in fees)
    paid_fee_sum = sum(f.paid_amount for f in fees)
    outstanding_fee_sum = total_fee_sum - paid_fee_sum

    # Placements
    total_apps = db.query(PlacementApplication).count()
    placed_apps = db.query(PlacementApplication).filter(PlacementApplication.status == "SELECTED").count()
    placement_rate = round(placed_apps / total_apps * 100, 1) if total_apps > 0 else 0.0

    # Department breakdown
    dept_stats = []
    total_at_risk = 0
    for d in departments:
        d_stat = calculate_department_analytics(db, d.id)
        total_at_risk += d_stat["at_risk_count"]
        dept_stats.append({
            "department_id": d.id,
            "name": d.name,
            "code": d.code,
            "student_count": d_stat["total_students"],
            "faculty_count": d_stat["faculty_count"],
            "attendance_percentage": d_stat["attendance_percentage"],
            "pass_percentage": d_stat["pass_percentage"],
            "at_risk_count": d_stat["at_risk_count"]
        })

    return {
        "total_departments": len(departments),
        "total_students": total_students,
        "total_faculty": total_faculty,
        "attendance_percentage": overall_att_pct,
        "present_count": present_cnt,
        "absent_count": absent_cnt,
        "od_count": od_cnt,
        "leave_count": leave_cnt,
        "pass_percentage": pass_pct,
        "fail_percentage": round(100.0 - pass_pct, 2) if total_marks > 0 else 0.0,
        "total_at_risk": total_at_risk,
        "placement_rate": placement_rate,
        "total_fees": total_fee_sum,
        "paid_fees": paid_fee_sum,
        "outstanding_fees": outstanding_fee_sum,
        "department_breakdown": dept_stats
    }
