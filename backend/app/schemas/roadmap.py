from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class RoadmapItemResponse(BaseModel):
    id: int
    skill_id: str
    title: str
    item_type: str
    estimated_hours: int
    rationale: str
    provider: str
    url: str
    is_completed: bool
    completed_at: Optional[datetime] = None
    sort_order: int

class RoadmapPhaseResponse(BaseModel):
    id: int
    phase_number: int
    title: str
    description: str
    estimated_hours: int
    is_remedial: bool
    is_completed: bool
    items: List[RoadmapItemResponse]

class RoadmapVersionResponse(BaseModel):
    id: int
    version_number: int
    target_role: str
    trigger_event: str
    reason_diff: str
    total_phases: int
    total_hours: int
    is_active: bool
    created_at: datetime
    phases: List[RoadmapPhaseResponse]

class RoadmapDiffResponse(BaseModel):
    old_version: Optional[int]
    new_version: int
    trigger_event: str
    summary_diff: str
    added_phases: List[str]
    remedial_items: List[str]
    preserved_completed_skills: List[str]
