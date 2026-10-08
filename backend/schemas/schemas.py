from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class StudentProfile(BaseModel):
    register_number: str
    name: str
    department_id: Optional[int]
    year: Optional[int]
    semester: Optional[int]
    phone: Optional[str]
    skills: Optional[str]
    interests: Optional[str]

class FacultyProfile(BaseModel):
    name: str
    department_id: Optional[int]
    phone: Optional[str]

class StudentRegister(UserCreate):
    name: str
    register_number: str
    department_id: Optional[int]
    year: Optional[int]
    semester: Optional[int]

class FacultyRegister(UserCreate):
    name: str
    department_id: Optional[int]

class DepartmentBase(BaseModel):
    name: str
    code: str

class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    code: str
    name: str
    department_id: int
    semester: Optional[int]

class SubjectResponse(SubjectBase):
    id: int
    faculty_id: Optional[int]
    class Config:
        from_attributes = True

class MarkBase(BaseModel):
    subject_id: int
    exam_type: str
    score: float
    max_score: float

class MarkResponse(MarkBase):
    id: int
    student_id: int
    class Config:
        from_attributes = True

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class ODCreate(BaseModel):
    event_name: str
    purpose: str
    organization: Optional[str] = None
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    proof_url: Optional[str] = None

class ODStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class AchievementCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    date: Optional[str] = None
    proof_url: Optional[str] = None

class AchievementVerify(BaseModel):
    verification_status: str # VERIFIED or REJECTED

class PlacementCompanyCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None

class PlacementDriveCreate(BaseModel):
    company_id: int
    job_role: str
    ctc_package: Optional[str] = None
    eligibility_cgpa: Optional[float] = 6.0
    department_id: Optional[int] = None
    drive_date: str
    deadline: str
    location: Optional[str] = None
    description: Optional[str] = None

class PlacementApplicationStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class CounsellingCreate(BaseModel):
    student_id: int
    session_date: str
    remarks: str
    action_plan: Optional[str] = None
    follow_up_date: Optional[str] = None

class GenericRequestCreate(BaseModel):
    request_type: str
    reason: str

class GenericRequestUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None

class DocumentCreate(BaseModel):
    title: str
    category: str
    file_url: str
    department_id: Optional[int] = None
    semester: Optional[int] = None

class EmailSendRequest(BaseModel):
    recipient_email: str
    subject: str
    body: str
    template_name: Optional[str] = "GENERAL_ANNOUNCEMENT"

class SettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

