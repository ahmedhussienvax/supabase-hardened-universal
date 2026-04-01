import psycopg2
import os
import time
import sys

def verify_database():
    dbname = os.getenv('DB_DATABASE', '_supabase')
    user = os.getenv('DB_USERNAME', 'supabase_admin')
    password = os.getenv('DB_PASSWORD')
    host = os.getenv('DB_HOSTNAME', 'supabase-db')
    port = os.getenv('DB_PORT', '5432')
    
    print(f"[*] Starting healthcheck - Connecting to {host}:{port}/{dbname}...")

    max_retries = 15
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port, connect_timeout=5)
            cur = conn.cursor()
            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '_analytics' AND table_name = 'sources');")
            exists = cur.fetchone()[0]
            if exists:
                print("[+] SUCCESS: _analytics.sources table found.")
                cur.close()
                conn.close()
                sys.exit(0)
            cur.close()
            conn.close()
        except Exception as e:
            print(f"[!] Retry {i+1}/{max_retries}: {e}")
        time.sleep(5)
    sys.exit(1)

if __name__ == '__main__':
    verify_database()
