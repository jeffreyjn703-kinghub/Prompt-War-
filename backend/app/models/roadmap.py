from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class RoadmapVersion(Base):
    __tablename__ = "roadmap_versions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, default=1)
    target_role = Column(String(100), nullable=False)
    trigger_event = Column(String(50), default="INITIAL") # INITIAL, GOAL_CHANGED, ASSESSMENT_POOR, ASSESSMENT_STRONG, PROGRESS_STALLED
    reason_diff = Column(Text, default="") # Markdown/text diff explaining changes
    total_phases = Column(Integer, default=1)
    total_hours = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="roadmap_versions")
    phases = relationship("RoadmapPhase", back_populates="roadmap_version", cascade="all, delete-orphan", order_by="RoadmapPhase.phase_number")

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_version_id = Column(Integer, ForeignKey("roadmap_versions.id", ondelete="CASCADE"), nullable=False)
    phase_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    estimated_hours = Column(Integer, default=0)
    is_remedial = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)

    roadmap_version = relationship("RoadmapVersion", back_populates="phases")
    items = relationship("RoadmapItem", back_populates="phase", cascade="all, delete-orphan", order_by="RoadmapItem.sort_order")

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(Integer, primary_key=True, index=True)
    phase_id = Column(Integer, ForeignKey("roadmap_phases.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    item_type = Column(String(50), default="course") # course, tutorial, doc, video, exercise, project
    estimated_hours = Column(Integer, default=3)
    rationale = Column(Text, default="") # "why this" explanation
    provider = Column(String(100), default="freeCodeCamp")
    url = Column(String(500), default="")
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    sort_order = Column(Integer, default=0)

    phase = relationship("RoadmapPhase", back_populates="items")
