import sqlite3
from database.session import engine, Base
from models.all_models import *

# Create new tables (ClassSection, FacultySubjectAssignment)
Base.metadata.create_all(bind=engine)

# Alter existing tables
conn = sqlite3.connect("campuspulse.db")
cursor = conn.cursor()

def try_alter(query):
    try:
        cursor.execute(query)
        print(f"Success: {query}")
    except Exception as e:
        print(f"Ignored: {e}")

try_alter("ALTER TABLE departments ADD COLUMN hod_id INTEGER")
try_alter("ALTER TABLE students ADD COLUMN class_section_id INTEGER")
try_alter("ALTER TABLE mentor_assignments ADD COLUMN academic_year VARCHAR")
try_alter("ALTER TABLE mentor_assignments ADD COLUMN active BOOLEAN DEFAULT 1")

conn.commit()
conn.close()
print("DB altered successfully.")
