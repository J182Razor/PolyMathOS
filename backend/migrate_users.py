import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def migrate():
    conn_str = os.getenv("DATABASE_URL")
    if not conn_str:
        print("DATABASE_URL not set")
        return

    try:
        conn = psycopg2.connect(conn_str)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("Adding password_hash column...")
        try:
            cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);")
            print("Column added successfully")
        except Exception as e:
            print(f"Failed to add column: {e}")
            
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    migrate()
