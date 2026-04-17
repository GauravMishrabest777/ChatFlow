from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    app_id: str
    name: str
    access_token: Optional[str] = None
    token_type: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    app_id: str
    user_name: str

class FriendRequestCreate(BaseModel):
    receiver_app_id: str

class ContactResponse(BaseModel):
    friend_app_id: str
    friend_name: str
    is_blocked: bool
    is_private: bool

class MessageCreate(BaseModel):
    receiver_app_id: str
    content: str
    is_saved: bool = False

class MessageResponse(BaseModel):
    id: int
    sender_app_id: str
    content: str
    timestamp: datetime
    is_saved: bool

    class Config:
        from_attributes = True

class FriendRequestResponse(BaseModel):
    id: int
    sender_app_id: str
    sender_name: str
    status: str

    class Config:
        from_attributes = True
