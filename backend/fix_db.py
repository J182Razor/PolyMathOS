import os
import sys
import psycopg2
import json
import uuid
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

def fix_db():
    print("Fixing Database Tables (DROP CASCADE & RECREATE)...")
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set")
        return

    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        with conn.cursor() as cur:
            print("Dropping memory_palaces table (CASCADE)...")
            cur.execute("DROP TABLE IF EXISTS memory_palaces CASCADE")
            
            print("Creating memory_palaces table...")
            cur.execute("""
                CREATE TABLE memory_palaces (
                    palace_id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255),
                    template VARCHAR(100),
                    user_id VARCHAR(255),
                    description TEXT,
                    loci JSONB,
                    journey JSONB,
                    review_count INTEGER DEFAULT 0,
                    retention_rate FLOAT DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("Table created successfully.")
            
            # Try to insert a row
            print("Inserting test row...")
            palace_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO memory_palaces 
                (palace_id, name, template, user_id, description, loci, journey, review_count, retention_rate, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                palace_id,
                "Test Palace",
                "home",
                "test_user",
                "Description",
                json.dumps([{"id": "l1"}]),
                json.dumps(["l1"]),
                0,
                0.0,
                datetime.now()
            ))
            print("Insertion successful.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_db()
