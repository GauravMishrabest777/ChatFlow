from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# PostgreSQL Connection URL
# Format: postgresql://<username>:<password>@<host>:<port>/<database_name>
# Please update 'postgres:password' to your actual PostgreSQL credentials!
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Gaurav12@localhost:5432/chat_flow"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
