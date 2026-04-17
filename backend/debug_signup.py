import models, schemas, auth
from database import SessionLocal, engine
from sqlalchemy.orm import Session
import random

def test_signup():
    db = SessionLocal()
    try:
        app_id = f"USER-{random.randint(1000, 9999)}"
        name = "Debug User"
        email = f"debug_{random.randint(100,999)}@test.com"
        password = "password123"
        
        hashed_pw = auth.get_password_hash(password)
        db_user = models.User(app_id=app_id, name=name, email=email, hashed_password=hashed_pw)
        
        print(f"Attempting to add user: {app_id}, {name}, {email}")
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print("Signup successful in test script!")
        
    except Exception as e:
        print("Signup FAILED in test script!")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
