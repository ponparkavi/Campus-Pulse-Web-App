# CampusPulse — Integrated Academic and Administrative Platform

CampusPulse is a comprehensive role-based college management platform connecting Students, Faculty, and Administrators in one centralized system.

## 🚀 Features Implemented
- **Role-Based Access Control**: Secure login and dashboards for `STUDENT`, `FACULTY`, and `ADMIN`.
- **Authentication**: JWT based authentication, securely hashed passwords (bcrypt).
- **Attendance**: Faculty can submit class attendance; students can view their attendance history, overall percentage, and alerts for low attendance.
- **Marks & Performance**: Faculty can input marks for tests/exams. Students can view a visual performance trend chart (Recharts) and pass/fail/at-risk analysis.
- **Assignments**: Faculty can create assignments and evaluate them with marks and feedback. Students can submit text assignments.
- **Study Materials**: Faculty can share resource links/documents for subjects. Students can access them.
- **Timetable & Exams**: Centralized schedule for classes and exams.
- **Leave Requests**: Students can apply for leave. Faculty can approve/reject and provide remarks.
- **Evening Class / Academic Support**: The system automatically flags at-risk students (low attendance or failed tests). Faculty review these recommendations and can schedule mandatory evening classes, notifying the students.

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts
- **Backend**: FastAPI, Python, SQLAlchemy, Alembic, Pydantic, Passlib, python-jose
- **Database**: SQLite (Configured to easily switch back to PostgreSQL via `.env`)

## 🔐 Demo Accounts
- **Admin**: `admin@campuspulse.com` / `password123`
- **Faculty**: `faculty@campuspulse.com` / `password123`
- **Student**: `student@campuspulse.com` / `password123`

## 🏃 How to Run Locally

### 1. Backend (FastAPI)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python create_seed.py # Generates the database and seeds all demo data
.\start_backend.ps1   # Runs uvicorn on port 8000
```

### 2. Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

## 📁 Architecture Overview
- `backend/models/all_models.py`: Contains all the database schemas (User, Student, Faculty, Attendance, Mark, Assignment, Timetable, Leave, EveningClass, etc).
- `backend/routers/api.py`: Contains the RESTful endpoints for all modules.
- `frontend/src/layouts/`: Contains Role-specific wrapper layouts (Sidebar, Navbar, Outlet).
- `frontend/src/pages/`: Contains all feature pages (Attendance, Marks, Assignments, etc.).
- `frontend/src/services/api.ts`: Configures the Axios interceptor for JWT auth.
