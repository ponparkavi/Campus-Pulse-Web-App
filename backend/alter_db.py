import sqlite3
from database.session import engine, Base
from models.all_models import *

# Create new tables
Base.metadata.create_all(bind=engine)

# Alter existing tables
conn = sqlite3.connect("campuspulse.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE marks ADD COLUMN source VARCHAR DEFAULT 'MANUAL'")
    cursor.execute("ALTER TABLE marks ADD COLUMN import_id INTEGER")
except Exception as e:
    print(f"Marks alter error: {e}")

try:
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN user_id INTEGER")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN start_time VARCHAR")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN end_time VARCHAR")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN location VARCHAR")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN reminder_time VARCHAR")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN priority VARCHAR")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN status VARCHAR")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN created_at DATETIME")
    cursor.execute("ALTER TABLE calendar_events ADD COLUMN updated_at DATETIME")
except Exception as e:
    print(f"CalendarEvent alter error: {e}")

conn.commit()
conn.close()
print("DB altered successfully.")
