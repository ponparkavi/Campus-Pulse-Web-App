from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database.session import get_db
from models.all_models import User, Student, Faculty, RoleEnum
from schemas.schemas import Token, UserResponse, StudentRegister, FacultyRegister
from utils.security import verify_password, get_password_hash, create_access_token
from core.config import settings
from jose import JWTError, jwt

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register/student", response_model=UserResponse)
def register_student(student_in: StudentRegister, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == student_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(student_in.password)
    new_user = User(email=student_in.email, hashed_password=hashed_pw, role=RoleEnum.STUDENT)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    student_profile = Student(
        user_id=new_user.id,
        register_number=student_in.register_number,
        name=student_in.name,
        department_id=student_in.department_id,
        year=student_in.year,
        semester=student_in.semester
    )
    db.add(student_profile)
    db.commit()
    return new_user

@router.get("/me")
def get_current_user_info(db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordRequestForm)):
    # Very basic auth extraction for demo
    pass
