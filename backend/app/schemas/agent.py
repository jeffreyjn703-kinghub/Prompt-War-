from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class LearnerContext(BaseModel):
    user_id: int
    full_name: str = "Demo Learner"
    education: str = "B.S. in Computer Science"
    target_role: str = "Full Stack Developer"
    weekly_hours: int = 15
    current_skills: Dict[str, int] = Field(default_factory=dict) # skill_id -> level 1-5
    verified_skills: Dict[str, int] = Field(default_factory=dict) # skill_id -> level 1-5
    certifications: List[str] = Field(default_factory=list)
    projects: List[str] = Field(default_factory=list)
    completed_item_ids: List[str] = Field(default_factory=list)
    
    # State accumulated across agent hand-offs
    match_report: Optional[Dict[str, Any]] = None
    gap_report: Optional[Dict[str, Any]] = None
    roadmap: Optional[Dict[str, Any]] = None
    recommendations: Optional[Dict[str, Any]] = None
    assessment_result: Optional[Dict[str, Any]] = None
    evaluator_insight: Optional[Dict[str, Any]] = None
    mentor_message: Optional[str] = None
    
    trigger_event: str = "INITIAL" # INITIAL, GOAL_CHANGED, ASSESSMENT_POOR, ASSESSMENT_STRONG, PROGRESS_STALLED
    metadata: Dict[str, Any] = Field(default_factory=dict)

# Agent Typed Inputs and Outputs
class ProfileAnalystOutput(BaseModel):
    normalized_skills: Dict[str, int]
    skill_categories: Dict[str, str]
    confidence_ratings: Dict[str, str]
    inferred_experience_level: str
    strengths: List[str]
    growth_areas: List[str]

class MatchedSkill(BaseModel):
    skill_id: str
    name: str
    current_level: int
    required_level: int
    status: str # "matched", "partial", "missing"
    level_gap: int

class CareerMatcherOutput(BaseModel):
    role_id: str
    role_title: str
    match_percentage: float
    matched_skills: List[MatchedSkill]
    missing_skills: List[str]
    partial_skills: List[str]
    top_recommended_roles: List[Dict[str, Any]]

class GapItem(BaseModel):
    skill_id: str
    name: str
    current_level: int
    target_level: int
    gap_score: int
    priority: int # 1 = highest
    prerequisites_met: bool
    missing_prerequisites: List[str]

class SkillGapOutput(BaseModel):
    prioritized_gaps: List[GapItem]
    prerequisite_chains: List[str]
    estimated_total_hours: int

class RoadmapItemData(BaseModel):
    skill_id: str
    title: str
    item_type: str # course, tutorial, doc, video, exercise, project
    estimated_hours: int
    rationale: str
    provider: str
    url: str

class RoadmapPhaseData(BaseModel):
    phase_number: int
    title: str
    description: str
    estimated_hours: int
    is_remedial: bool = False
    items: List[RoadmapItemData]

class CurriculumPlannerOutput(BaseModel):
    target_role: str
    total_phases: int
    total_estimated_hours: int
    estimated_weeks: int
    weekly_hours_budget: int
    phases: List[RoadmapPhaseData]
    replan_reason: Optional[str] = None

class ResourceRecommenderOutput(BaseModel):
    recommended_phases: List[RoadmapPhaseData]
    resource_diversity_score: float
    total_resources: int

class QuestionOption(BaseModel):
    text: str

class QuizItem(BaseModel):
    question_text: str
    question_type: str = "mcq" # mcq, practical
    options: List[str] = Field(default_factory=list)
    correct_answer: int = 0
    practical_rubric: Optional[str] = None
    explanation: str
    difficulty: str = "intermediate"

class AssessmentOutput(BaseModel):
    skill_id: str
    skill_name: str
    questions: List[QuizItem]
    pass_threshold_pct: float = 70.0

class ProgressEvaluatorOutput(BaseModel):
    status_flag: str # ON_TRACK, STRUGGLING, ADVANCING, STALLED
    trigger_action: str # NONE, ASSESSMENT_POOR, ASSESSMENT_STRONG, PROGRESS_STALLED
    readiness_percentage: float
    struggling_topics: List[str]
    recommended_adjustment: str

class MentorAgentOutput(BaseModel):
    message: str
    action_suggestion: str
    nudges: List[str]
    triggered_replan: bool = False
