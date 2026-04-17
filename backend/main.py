import random
import asyncio
import json
from datetime import datetime, timedelta, timezone
from typing import Dict

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, schemas, auth, os
from database import engine, get_db
from routers import friends

# Establish PostgreSQL Models schema
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ChatFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://chatflow-gaurav.vercel.app", # Replace with your actual Vercel URL
        "*" # Fallback (Note: some browsers might still be strict)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(friends.router)

# --- Base Authentication ---
@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    app_id = f"USER-{random.randint(1000, 9999)}"
    while db.query(models.User).filter(models.User.app_id == app_id).first():
        app_id = f"USER-{random.randint(1000, 9999)}"
        
    hashed_pw = auth.get_password_hash(user.password)
    db_user = models.User(app_id=app_id, name=user.name, email=user.email, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate token for immediate login after signup
    access_token = auth.create_access_token(
        data={"sub": db_user.app_id}, 
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Add token to response
    db_user.access_token = access_token
    db_user.token_type = "bearer"
    
    return db_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Using form_data.username as the Email field
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect User ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.app_id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "app_id": user.app_id,
        "user_name": user.name
    }

# --- WebSockets for Chat delivery ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, app_id: str):
        await websocket.accept()
        self.active_connections[app_id] = websocket

    def disconnect(self, app_id: str):
        if app_id in self.active_connections:
            del self.active_connections[app_id]

    async def send_personal_message(self, message: str, app_id: str):
        if app_id in self.active_connections:
            websocket = self.active_connections[app_id]
            await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{app_id}")
async def websocket_endpoint(websocket: WebSocket, app_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, app_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Expecting payload: {"receiver_id": "USER-XXXX", "content": "text string (voice or typed)", "is_saved": false}
            
            receiver_id = data.get("receiver_id")
            content = data.get("content")
            is_saved = data.get("is_saved", False)
            
            sender = db.query(models.User).filter(models.User.app_id == app_id).first()
            receiver = db.query(models.User).filter(models.User.app_id == receiver_id).first()
            
            if not receiver:
                continue

            # Verify Blocking Rule
            contact = db.query(models.Contact).filter(
                models.Contact.user_id == receiver.id, 
                models.Contact.friend_id == sender.id
            ).first()
            
            if contact and contact.is_blocked:
                # Silently drop or notify sender
                pass
            else:
                # Save Message to DB (PostgreSQL)
                msg_entry = models.Message(sender_id=sender.id, receiver_id=receiver.id, content=content, is_saved=is_saved)
                db.add(msg_entry)
                db.commit()
                
                # Broadcast relay text using proper JSON serialization
                payload = json.dumps({"sender_id": app_id, "content": content})
                await manager.send_personal_message(payload, receiver_id)
            
    except WebSocketDisconnect:
        manager.disconnect(app_id)


# --- Automatic Destroy Background Task ---
async def delete_old_messages():
    """ 
    Runs on loop every 15 minutes checking the message timestamp TTL. 
    It wipes messages older than 2 hours if they are not explicitly saved. 
    """
    while True:
        await asyncio.sleep(60 * 15)  
        db = next(get_db())
        # Calc strictly two hours limit
        time_limit = datetime.now(timezone.utc) - timedelta(hours=2)
        
        # Action Query Execute
        db.query(models.Message).filter(
            models.Message.timestamp < time_limit,
            models.Message.is_saved == False
        ).delete()
        db.commit()

@app.on_event("startup")
async def startup_event():
    # Spin up un-awaited worker execution string
    asyncio.create_task(delete_old_messages())

