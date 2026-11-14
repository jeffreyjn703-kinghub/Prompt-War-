import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.progress import AssessmentAttempt
from app.models.roadmap import RoadmapItem
from app.models.taxonomy import RoleTaxonomy
from app.models.user import Profile, UserSkill
from app.schemas.agent import LearnerContext, ProgressEvaluatorOutput

class ProgressEvaluatorAgent(BaseAgent):
    name: str = "Progress Evaluator"
    description: str = "Monitors completion velocity, score trajectory, detects learning friction or stagnation, and updates readiness %."
    system_prompt: str = """You are the Progress Evaluator Agent for SkillPath AI.
Examine historical assessment scores, completed roadmap milestones, and study activity velocity.
Diagnose whether the learner is ON_TRACK, STRUGGLING, ADVANCING, or STALLED.
Output valid JSON matching ProgressEvaluatorOutput schema.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        return f"Event: {context.trigger_event}. Target: {context.target_role}. Completed items: {len(context.completed_item_ids)}"

    def summarize_output(self, context: LearnerContext) -> str:
        ins = context.evaluator_insight or {}
        flag = ins.get("status_flag", "ON_TRACK")
        readiness = ins.get("readiness_percentage", 0.0)
        return f"Readiness: {readiness:.1f}%. Status: {flag}. Action: {ins.get('trigger_action', 'NONE')}"

    def apply_fallback(self, context: LearnerContext, db: Session):
        user_id = context.user_id
        
        # 1. Fetch target role requirements
        target_role_clean = context.target_role.lower().strip().replace(" ", "-")
        role = db.query(RoleTaxonomy).filter(
            (RoleTaxonomy.role_id == target_role_clean) | (RoleTaxonomy.title.ilike(context.target_role))
        ).first()

        reqs = json.loads(role.required_skills) if role else {}

        # 2. Compute live readiness percentage
        total_req_points = sum(reqs.values()) if reqs else 1
        earned_points = 0.0

        for skill_id, target_lvl in reqs.items():
            verified_lvl = context.verified_skills.get(skill_id)
            self_lvl = context.current_skills.get(skill_id, 0)
            
            if verified_lvl is not None:
                # Verified skills carry full weight
                earned = min(verified_lvl, target_lvl)
            else:
                # Self-rated skills carry 0.85 calibration factor
                earned = min(self_lvl, target_lvl) * 0.85
            earned_points += earned

        readiness_pct = round((earned_points / max(total_req_points, 1)) * 100, 1)

        # 3. Detect struggle or stagnation
        attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == user_id).order_by(AssessmentAttempt.created_at.desc()).all()
        
        status_flag = "ON_TRACK"
        trigger_action = "NONE"
        struggling_topics: List[str] = []
        recommendation = "Maintain regular study pace and continue hands-on practice."

        if context.trigger_event == "ASSESSMENT_POOR":
            status_flag = "STRUGGLING"
            trigger_action = "ASSESSMENT_POOR"
            if context.assessment_result:
                struggling_topics = context.assessment_result.get("weak_topics", [])
            recommendation = "Insert targeted remedial phase with foundational drills before moving forward."
        elif context.trigger_event == "ASSESSMENT_STRONG":
            status_flag = "ADVANCING"
            trigger_action = "ASSESSMENT_STRONG"
            recommendation = "Compress beginner introductory modules to accelerate roadmap completion."
        elif attempts and attempts[0].score_pct < 60.0:
            status_flag = "STRUGGLING"
            trigger_action = "ASSESSMENT_POOR"
            struggling_topics = json.loads(attempts[0].weak_topics) if attempts[0].weak_topics else []
            recommendation = "Reinforce core mental models with beginner resources."

        # Check completed items
        completed_count = db.query(RoadmapItem).filter(
            RoadmapItem.user_id == user_id,
            RoadmapItem.is_completed == True
        ).count()

        # Update profile readiness
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            profile.readiness_pct = readiness_pct
            db.commit()

        result = {
            "status_flag": status_flag,
            "trigger_action": trigger_action,
            "readiness_percentage": readiness_pct,
            "struggling_topics": struggling_topics,
            "recommended_adjustment": recommendation
        }

        context.evaluator_insight = result
