from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/friends", tags=["Friends"])

# Search user by ID to get Real Name
@router.get("/search/{app_id}", response_model=schemas.UserResponse)
def search_user(app_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.app_id == app_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Send request
@router.post("/request")
def send_friend_request(req: schemas.FriendRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    receiver = db.query(models.User).filter(models.User.app_id == req.receiver_app_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
    if receiver.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")
        
    # check existing
    existing = db.query(models.FriendRequest).filter(
        models.FriendRequest.sender_id == current_user.id,
        models.FriendRequest.receiver_id == receiver.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already sent")
        
    friend_req = models.FriendRequest(sender_id=current_user.id, receiver_id=receiver.id)
    db.add(friend_req)
    db.commit()
    return {"message": "Request sent successfully"}

# Accept request
@router.post("/accept/{request_id}")
def accept_friend_request(request_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    req = db.query(models.FriendRequest).filter(models.FriendRequest.id == request_id, models.FriendRequest.receiver_id == current_user.id).first()
    if not req or req.status != 'pending':
        raise HTTPException(status_code=404, detail="Request not found or already processed")
        
    req.status = 'accepted'
    
    # Create contact for both users symmetrically
    contact1 = models.Contact(user_id=current_user.id, friend_id=req.sender_id)
    contact2 = models.Contact(user_id=req.sender_id, friend_id=current_user.id)
    db.add_all([contact1, contact2])
    db.commit()
    
    return {"message": "Friend added successfully"}

# Block User
@router.post("/block/{friend_app_id}")
def block_user(friend_app_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    friend = db.query(models.User).filter(models.User.app_id == friend_app_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
        
    contact = db.query(models.Contact).filter(models.Contact.user_id == current_user.id, models.Contact.friend_id == friend.id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    contact.is_blocked = True
    db.commit()
    return {"message": f"User {friend.name} blocked."}

# Toggle Private Vault Status
@router.post("/toggle-private/{friend_app_id}")
def toggle_private_vault(friend_app_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    friend = db.query(models.User).filter(models.User.app_id == friend_app_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
        
    contact = db.query(models.Contact).filter(models.Contact.user_id == current_user.id, models.Contact.friend_id == friend.id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    contact.is_private = not contact.is_private
    db.commit()
    return {"is_private": contact.is_private, "message": "Vault status updated"}

# Reject request
@router.post("/reject/{request_id}")
def reject_friend_request(request_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    req = db.query(models.FriendRequest).filter(models.FriendRequest.id == request_id, models.FriendRequest.receiver_id == current_user.id).first()
    if not req or req.status != 'pending':
        raise HTTPException(status_code=404, detail="Request not found or already processed")
        
    req.status = 'rejected'
    db.commit()
    return {"message": "Request rejected successfully"}

# Get accepted friend list with optional vault filter
@router.get("/list", response_model=List[schemas.ContactResponse])
def get_friend_list(private: Optional[bool] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Contact).filter(models.Contact.user_id == current_user.id)
    if private is not None:
        query = query.filter(models.Contact.is_private == private)
    
    contacts = query.all()
    results = []
    for c in contacts:
        f = db.query(models.User).filter(models.User.id == c.friend_id).first()
        results.append({
            "friend_app_id": f.app_id,
            "friend_name": f.name,
            "is_blocked": c.is_blocked,
            "is_private": c.is_private
        })
    return results

# Get pending requests
@router.get("/pending", response_model=List[schemas.FriendRequestResponse])
def get_pending_requests(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reqs = db.query(models.FriendRequest).filter(
        models.FriendRequest.receiver_id == current_user.id, 
        models.FriendRequest.status == 'pending'
    ).all()
    
    results = []
    for r in reqs:
        sender = db.query(models.User).filter(models.User.id == r.sender_id).first()
        results.append({
            "id": r.id,
            "sender_app_id": sender.app_id,
            "sender_name": sender.name,
            "status": r.status
        })
    return results

# Get messages between user and friend
@router.get("/messages/{friend_app_id}", response_model=List[schemas.MessageResponse])
def get_messages(friend_app_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    friend = db.query(models.User).filter(models.User.app_id == friend_app_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
        
    msgs = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == friend.id)) |
        ((models.Message.sender_id == friend.id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.timestamp.asc()).all()
    
    res = []
    for m in msgs:
        sender = db.query(models.User).filter(models.User.id == m.sender_id).first()
        res.append({
            "id": m.id,
            "sender_app_id": sender.app_id,
            "content": m.content,
            "timestamp": m.timestamp,
            "is_saved": m.is_saved
        })
    return res
