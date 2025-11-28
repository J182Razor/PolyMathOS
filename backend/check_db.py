import os
import psycopg2

def check_db():
    conn_str = os.getenv("DATABASE_URL")
    if not conn_str:
        print("DATABASE_URL not set")
        return

    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        
        print("--- Version ---")
        cur.execute("SELECT version();")
        print(cur.fetchone()[0])
        
        print("\n--- Extensions ---")
        cur.execute("SELECT * FROM pg_extension;")
        for row in cur.fetchall():
            print(row)
            
        print("\n--- Available Extensions (pg_available_extensions) ---")
        # Limit to relevant ones
        cur.execute("SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name LIKE '%vector%' OR name LIKE '%timescale%';")
        for row in cur.fetchall():
            print(row)
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
