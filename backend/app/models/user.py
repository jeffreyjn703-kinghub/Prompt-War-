from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    roadmap_versions = relationship("RoadmapVersion", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    agent_traces = relationship("AgentRunTrace", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), default="Demo Learner")
    education = Column(String(255), default="B.S. in Computer Science")
    target_role = Column(String(100), default="Full Stack Developer")
    weekly_hours = Column(Integer, default=15)
    readiness_pct = Column(Float, default=0.0)
    streak_days = Column(Integer, default=3)
    last_active_at = Column(DateTime, default=utcnow)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="profile")

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency = Column(Integer, default=1) # 1-5 self-rated
    verified_level = Column(Integer, nullable=True) # 1-5 verified by assessment
    confidence = Column(String(50), default="self-rated") # "self-rated" or "verified by assessment"
    last_assessed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="skills")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), default="")
    issue_date = Column(String(50), default="")

    user = relationship("User", back_populates="certifications")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    skills_used = Column(String(500), default="") # Comma-separated or JSON list

    user = relationship("User", back_populates="projects")
