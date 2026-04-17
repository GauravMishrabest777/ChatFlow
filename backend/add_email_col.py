import psycopg2

def upgrade_db():
    conn = psycopg2.connect("postgresql://postgres:Gaurav12@localhost:5432/chat_flow")
    cur = conn.cursor()
    # Check if table has email
    try:
        cur.execute("ALTER TABLE users ADD COLUMN email VARCHAR UNIQUE;")
        conn.commit()
        print("Successfully added email column to the 'users' table.")
    except Exception as e:
        print("Column might already exist or table is empty/missing:", e)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    upgrade_db()
