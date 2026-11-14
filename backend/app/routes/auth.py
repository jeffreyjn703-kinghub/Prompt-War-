from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
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
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=profile.full_name,
        is_demo=False
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    name = profile.full_name if profile else "Learner"

    token = create_access_token({"sub": str(user.id), "email": user.email})
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
