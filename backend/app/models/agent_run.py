from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class AgentRunTrace(Base):
    __tablename__ = "agent_run_traces"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_name = Column(String(100), default="ORCHESTRATION") # e.g. INITIAL, GOAL_CHANGED, ASSESSMENT_POOR, SSE_MENTOR
    agent_name = Column(String(100), nullable=False) # Profile Analyst, Career Matcher, etc.
    input_summary = Column(Text, default="")
    output_summary = Column(Text, default="")
    duration_ms = Column(Integer, default=0)
    used_llm = Column(Boolean, default=False) # False = Fallback rule engine, True = Gemini LLM
    status = Column(String(50), default="SUCCESS") # SUCCESS, RETRIED, FALLBACK, ERROR
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="agent_traces")
