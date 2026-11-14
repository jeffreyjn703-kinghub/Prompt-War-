from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class UserSkillItem(BaseModel):
    skill_name: str
    proficiency: int = Field(ge=1, le=5)
    verified_level: Optional[int] = None
    confidence: str = "self-rated"
    last_assessed_at: Optional[datetime] = None

class CertificationItem(BaseModel):
    name: str
    issuer: str = ""
    issue_date: str = ""

class ProjectItem(BaseModel):
    title: str
    description: str = ""
    skills_used: str = ""

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    education: Optional[str] = None
    target_role: Optional[str] = None
    weekly_hours: Optional[int] = Field(default=None, ge=1, le=80)
    skills: Optional[List[UserSkillItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    projects: Optional[List[ProjectItem]] = None

class ProfileResponse(BaseModel):
    user_id: int
    email: str
    full_name: str
    education: str
    target_role: str
    weekly_hours: int
    readiness_pct: float
    streak_days: int
    skills: List[UserSkillItem]
    certifications: List[CertificationItem]
    projects: List[ProjectItem]
    last_active_at: Optional[datetime] = None
    is_new_user: Optional[bool] = False
