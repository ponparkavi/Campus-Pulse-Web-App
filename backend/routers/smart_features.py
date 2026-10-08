from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.session import get_db
from models.all_models import (
    User, Student, Faculty, Department, Subject, Mark, MarkImport, MarkImportRow,
    CalendarEvent, Notification, AuditLog
)
from utils.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import datetime
import csv
import json
import io

router = APIRouter()

# ---------------------------------------------
# PERSONAL CALENDAR
# ---------------------------------------------

class CalendarEventCreatePersonal(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    event_type: str
    location: Optional[str] = None
    reminder_time: Optional[str] = None
    priority: Optional[str] = None

@router.post("/calendar/personal")
def create_personal_event(data: CalendarEventCreatePersonal, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    start_dt = datetime.datetime.fromisoformat(data.start_date.replace("Z", ""))
    end_dt = datetime.datetime.fromisoformat(data.end_date.replace("Z", ""))
    ce = CalendarEvent(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        start_date=start_dt,
        end_date=end_dt,
        start_time=data.start_time,
        end_time=data.end_time,
        event_type=data.event_type,
        location=data.location,
        reminder_time=data.reminder_time,
        priority=data.priority,
        status="ACTIVE"
    )
    db.add(ce)
    
    if data.reminder_time:
        db.add(Notification(
            user_id=current_user.id,
            title=f"Reminder Setup: {data.title}",
            message=f"You will be reminded {data.reminder_time} before the event.",
            type="CALENDAR_REMINDER"
        ))
        
    db.commit()
    db.refresh(ce)
    return {"message": "Personal event created", "id": ce.id}

@router.get("/calendar/personal")
def get_personal_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).all()
    return events

@router.put("/calendar/personal/{event_id}")
def update_personal_event(event_id: int, data: CalendarEventCreatePersonal, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ce = db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id).first()
    if not ce:
        raise HTTPException(status_code=404, detail="Event not found")
        
    ce.title = data.title
    ce.description = data.description
    ce.start_date = datetime.datetime.fromisoformat(data.start_date.replace("Z", ""))
    ce.end_date = datetime.datetime.fromisoformat(data.end_date.replace("Z", ""))
    ce.start_time = data.start_time
    ce.end_time = data.end_time
    ce.event_type = data.event_type
    ce.location = data.location
    ce.reminder_time = data.reminder_time
    ce.priority = data.priority
    
    db.commit()
    return {"message": "Event updated"}

@router.delete("/calendar/personal/{event_id}")
def delete_personal_event(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ce = db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id).first()
    if not ce:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(ce)
    db.commit()
    return {"message": "Event deleted"}

# ---------------------------------------------
# SMART MARKS IMPORT
# ---------------------------------------------

@router.post("/marks/import/parse")
async def parse_marks_import(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if current_user.role != "FACULTY":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    content = await file.read()
    # Dummy parse for now, normally we use pandas/csv/pdfplumber
    parsed_data = []
    
    if file.filename.endswith(".csv"):
        text = content.decode("utf-8", errors="ignore")
        reader = csv.reader(io.StringIO(text))
        header = next(reader, None)
        if header:
            for row in reader:
                if len(row) >= 3:
                    parsed_data.append({
                        "register_number": row[0].strip(),
                        "name": row[1].strip(),
                        "mark": row[2].strip()
                    })
    else:
        text = content.decode("utf-8", errors="ignore")
        lines = text.split("\n")
        for line in lines:
            parts = line.split()
            if len(parts) >= 3:
                # heuristic: first part is reg no, last part is mark
                reg = parts[0]
                mark = parts[-1]
                name = " ".join(parts[1:-1])
                parsed_data.append({"register_number": reg, "name": name, "mark": mark})

    return {"filename": file.filename, "extracted_rows": parsed_data}

class MarkImportConfirmRequest(BaseModel):
    subject_id: int
    assessment_id: str
    file_name: str
    source: str
    rows: List[dict] # {"register_number": str, "mark": float, "student_name": str}

@router.post("/marks/import/confirm")
def confirm_marks_import(data: MarkImportConfirmRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    
    new_import = MarkImport(
        faculty_id=faculty.id,
        subject_id=data.subject_id,
        assessment_id=data.assessment_id,
        file_name=data.file_name,
        file_type="parsed",
        source=data.source,
        total_rows=len(data.rows),
        status="COMPLETED"
    )
    db.add(new_import)
    db.commit()
    db.refresh(new_import)
    
    matched = 0
    failed = 0
    updated = 0
    
    for row in data.rows:
        reg_no = row.get("register_number")
        mark_val = row.get("mark")
        stu_name = row.get("student_name", "")
        
        student = db.query(Student).filter(Student.register_number == reg_no).first()
        if not student:
            failed += 1
            db.add(MarkImportRow(
                import_id=new_import.id, register_number=reg_no, student_name=stu_name,
                mark=None, status="FAILED", issue="Student not found"
            ))
            continue
            
        try:
            mark_float = float(mark_val)
        except:
            failed += 1
            db.add(MarkImportRow(
                import_id=new_import.id, register_number=reg_no, student_name=stu_name,
                mark=None, status="FAILED", issue="Invalid mark format"
            ))
            continue
            
        matched += 1
        
        # Check existing mark
        existing_mark = db.query(Mark).filter(
            Mark.student_id == student.id,
            Mark.subject_id == data.subject_id,
            Mark.exam_type == data.assessment_id
        ).first()
        
        if existing_mark:
            old_mark = existing_mark.score
            existing_mark.score = mark_float
            existing_mark.source = data.source
            existing_mark.import_id = new_import.id
            updated += 1
            
            db.add(AuditLog(
                user_id=current_user.id, user_email=current_user.email,
                action="UPDATE_MARK", entity="Mark", entity_id=str(existing_mark.id),
                description=f"Mark changed {old_mark} -> {mark_float} via {data.source}"
            ))
        else:
            new_mark = Mark(
                student_id=student.id,
                subject_id=data.subject_id,
                exam_type=data.assessment_id,
                score=mark_float,
                max_score=100.0,
                source=data.source,
                import_id=new_import.id
            )
            db.add(new_mark)
            
        db.add(MarkImportRow(
            import_id=new_import.id, register_number=reg_no, student_name=student.name,
            mark=mark_float, status="SUCCESS"
        ))
        
    new_import.matched_rows = matched
    new_import.failed_rows = failed
    new_import.updated_rows = updated
    db.commit()
    
    return {
        "message": "Import successful",
        "import_id": new_import.id,
        "matched": matched,
        "failed": failed,
        "updated": updated
    }

@router.get("/marks/import/history")
def get_import_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "FACULTY":
        raise HTTPException(status_code=403, detail="Not authorized")
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    imports = db.query(MarkImport).filter(MarkImport.faculty_id == faculty.id).order_by(MarkImport.created_at.desc()).all()
    
    result = []
    for imp in imports:
        subj = db.query(Subject).filter(Subject.id == imp.subject_id).first()
        result.append({
            "id": imp.id,
            "subject_name": subj.name if subj else "Unknown",
            "assessment_id": imp.assessment_id,
            "file_name": imp.file_name,
            "source": imp.source,
            "total_rows": imp.total_rows,
            "matched_rows": imp.matched_rows,
            "failed_rows": imp.failed_rows,
            "updated_rows": imp.updated_rows,
            "status": imp.status,
            "created_at": imp.created_at
        })
    return result
