import models, schemas, auth
from database import SessionLocal, engine
from sqlalchemy.orm import Session
import random

def debug_login():
    db = SessionLocal()
    try:
        # 1. Create a test user
        email = f"test_{random.randint(100,999)}@example.com"
        password = "password123"
        hashed_pw = auth.get_password_hash(password)
        app_id = "USER-TEST"
        
        test_user = models.User(app_id=app_id, name="Tester", email=email, hashed_password=hashed_pw)
        db.add(test_user)
        db.commit()
        print(f"Created test user with email: {email}")

        # 2. Try to find them by email (simulating /token logic)
        found_user = db.query(models.User).filter(models.User.email == email).first()
        if found_user:
            print(f"Found user by email! App ID: {found_user.app_id}")
            if auth.verify_password(password, found_user.hashed_password):
                print("Password verified successfully!")
            else:
                print("Password verification FAILED!")
        else:
            print("Could NOT find user by email!")

    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_login()
