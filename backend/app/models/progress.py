from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(100), nullable=False)
    score_pct = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    total_questions = Column(Integer, default=10)
    correct_questions = Column(Integer, default=0)
    practical_feedback = Column(Text, default="")
    weak_topics = Column(Text, default="[]") # JSON list of weak topic strings
    trigger_action = Column(String(100), default="NONE") # ASSESSMENT_POOR, ASSESSMENT_STRONG, NONE
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="assessments")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False) # ITEM_COMPLETED, ASSESSMENT_TAKEN, GOAL_CHANGED, CHAT_MENTOR
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)
