from typing import List, Dict, Any
from pydantic import BaseModel

class CohortLearner(BaseModel):
    user_id: int
    name: str
    email: str
    target_role: str
    readiness_pct: float
    streak_days: int
    top_gaps: List[str]
    last_active: str

class SkillHeatmapCell(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    avg_level: float
    target_level: float
    gap_count: int # How many learners are missing this skill
    criticality: str # High, Medium, Low

class CohortOverviewResponse(BaseModel):
    total_learners: int
    avg_readiness: float
    top_target_roles: List[Dict[str, Any]]
    cohort: List[CohortLearner]
    skill_heatmap: List[SkillHeatmapCell]
