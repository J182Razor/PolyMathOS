import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def debug_db():
    conn_str = os.getenv("DATABASE_URL")
    if not conn_str:
        print("DATABASE_URL not set")
        return

    try:
        conn = psycopg2.connect(conn_str)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        print("--- Testing gen_random_uuid() ---")
        try:
            cur.execute("SELECT gen_random_uuid();")
            print(f"UUID: {cur.fetchone()[0]}")
        except Exception as e:
            print(f"gen_random_uuid failed: {e}")
            
        print("\n--- Testing CREATE TABLE ---")
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS test_users (
                    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255)
                );
            """)
            print("Table test_users created successfully")
        except Exception as e:
            print(f"CREATE TABLE failed: {e}")
            
        print("\n--- Testing INSERT ---")
        try:
            cur.execute("INSERT INTO test_users (email) VALUES ('test@example.com');")
            print("INSERT successful")
        except Exception as e:
            print(f"INSERT failed: {e}")

        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    debug_db()
