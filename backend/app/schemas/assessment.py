from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AssessmentQuestion(BaseModel):
    id: int
    question_text: str
    question_type: str # mcq, practical
    options: List[str]
    explanation: Optional[str] = None
    difficulty: str

class AssessmentGenerateResponse(BaseModel):
    skill_id: str
    skill_name: str
    questions: List[AssessmentQuestion]
    total_questions: int

class AssessmentSubmission(BaseModel):
    skill_id: str
    answers: Dict[int, int] # question_id -> selected_option_index
    practical_response: Optional[str] = ""

class AssessmentResultResponse(BaseModel):
    attempt_id: int
    skill_id: str
    score_pct: float
    passed: bool
    total_questions: int
    correct_questions: int
    new_verified_level: int
    weak_topics: List[str]
    trigger_action: str # ASSESSMENT_POOR, ASSESSMENT_STRONG, NONE
    replan_triggered: bool
    replan_summary: Optional[str] = None
    mentor_feedback: str
    created_at: datetime
