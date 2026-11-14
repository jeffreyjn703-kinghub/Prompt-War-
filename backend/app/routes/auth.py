from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token

from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory active student session registry: email -> session details
ACTIVE_SESSIONS: dict[str, dict] = {}

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This email ID is already in use. Multiple student accounts with the same email are restricted. Please sign in instead."
        )

    user = User(
        email=email_clean,
        hashed_password=hash_password(req.password),
        is_demo=False
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        full_name=req.full_name,
        target_role="Full Stack Developer",
        weekly_hours=15
    )
    db.add(profile)
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    ACTIVE_SESSIONS[email_clean] = {
        "user_id": user.id,
        "token": token,
        "logged_in_at": datetime.now(timezone.utc).isoformat()
    }

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=profile.full_name,
        is_demo=False
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Restriction: check if this student email is already in use by an active session
    if email_clean in ACTIVE_SESSIONS and not req.force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email ID is already in use by an active student session. Multiple student logins with the same email ID are restricted."
        )

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    name = profile.full_name if profile else "Learner"

    token = create_access_token({"sub": str(user.id), "email": user.email})
    ACTIVE_SESSIONS[email_clean] = {
        "user_id": user.id,
        "token": token,
        "logged_in_at": datetime.now(timezone.utc).isoformat()
    }

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=name,
        is_demo=user.is_demo
    )

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(learner: str = "demo", db: Session = Depends(get_db)):
    """
    One-click instant login for Demo Learner ('demo' -> Sarah Chen, 'alex' -> Alex Rivera)
    """
    target_email = "alex@skillpath.ai" if learner == "alex" else "demo@skillpath.ai"
    user = db.query(User).filter(User.email == target_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Please restart server to seed data.")

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    name = profile.full_name if profile else "Demo Learner"

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=name,
        is_demo=True
    )

@router.post("/logout")
def logout(email: Optional[str] = None):
    if email and email.strip().lower() in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[email.strip().lower()]
    return {"status": "success", "message": "Session terminated successfully"}

@router.post("/release-session")
def release_session(email: str):
    email_clean = email.strip().lower()
    if email_clean in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[email_clean]
        return {"status": "success", "message": f"Session released for {email_clean}"}
    return {"status": "success", "message": "No active lock for this email"}
