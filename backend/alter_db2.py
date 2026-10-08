import sqlite3

conn = sqlite3.connect("campuspulse.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE marks ADD COLUMN import_id INTEGER")
except Exception as e:
    print(f"Marks import_id alter error: {e}")

conn.commit()
conn.close()
print("DB altered successfully.")
