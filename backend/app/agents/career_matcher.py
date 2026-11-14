import json
from typing import Any, Dict, List, Optional, Type
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.taxonomy import RoleTaxonomy, SkillTaxonomy
from app.schemas.agent import CareerMatcherOutput, LearnerContext, MatchedSkill

class CareerMatcherAgent(BaseAgent):
    name: str = "Career Matcher"
    description: str = "Evaluates skills against job role benchmark requirements, computes match % and identifies skill gaps."
    system_prompt: str = """You are the Career Matcher Agent for VYNTRIXA.
Compare the user's current skill proficiencies against target role requirements.
Calculate the match percentage precisely, categorize skills into matched, partial, and missing, and determine the top 3 recommended roles.
Return valid JSON matching the CareerMatcherOutput schema.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        return f"Target Role: {context.target_role}, Evaluated against {len(context.current_skills)} user skills"

    def summarize_output(self, context: LearnerContext) -> str:
        mr = context.match_report or {}
        pct = mr.get("match_percentage", 0.0)
        matched_count = len(mr.get("matched_skills", []))
        missing_count = len(mr.get("missing_skills", []))
        return f"Match: {pct:.1f}%. Matched: {matched_count}, Missing: {missing_count}"

    def build_user_prompt(self, context: LearnerContext) -> str:
        return f"""Evaluate career match for learner:
Target Role: {context.target_role}
User Skills: {json.dumps(context.current_skills)}
Verified Skills: {json.dumps(context.verified_skills)}

Return JSON matching CareerMatcherOutput schema:
- role_id: str
- role_title: str
- match_percentage: float (0.0 to 100.0)
- matched_skills: list of objects with skill_id, name, current_level, required_level, status, level_gap
- missing_skills: list of str
- partial_skills: list of str
- top_recommended_roles: list of {{"role_id": str, "title": str, "match_pct": float}}
"""

    def get_output_schema(self) -> Optional[Type[CareerMatcherOutput]]:
        return CareerMatcherOutput

    def apply_llm_result(self, context: LearnerContext, result: Dict[str, Any]):
        context.match_report = result

    def apply_fallback(self, context: LearnerContext, db: Session):
        roles = db.query(RoleTaxonomy).all()
        skills = {s.skill_id: s.name for s in db.query(SkillTaxonomy).all()}
        
        target_role_clean = context.target_role.lower().strip().replace(" ", "-")
        # Match role
        matched_role = None
        for r in roles:
            if r.role_id == target_role_clean or r.title.lower() == context.target_role.lower():
                matched_role = r
                break
        
        if not matched_role and roles:
            matched_role = roles[0] # Default to Full Stack Developer

        # Compute match scores for all roles to find top 3
        role_scores = []
        for r in roles:
            reqs = json.loads(r.required_skills)
            total_req = len(reqs)
            if total_req == 0:
                continue
            
            score_sum = 0.0
            for skill_id, req_lvl in reqs.items():
                # Prefer verified skill level if available
                cur_lvl = context.verified_skills.get(skill_id, context.current_skills.get(skill_id, 0))
                if cur_lvl >= req_lvl:
                    score_sum += 1.0
                elif cur_lvl > 0:
                    score_sum += (cur_lvl / req_lvl)
                else:
                    score_sum += 0.0

            pct = round((score_sum / total_req) * 100, 1)
            role_scores.append({
                "role_id": r.role_id,
                "title": r.title,
                "match_pct": pct
            })

        role_scores.sort(key=lambda x: x["match_pct"], reverse=True)
        top_roles = role_scores[:3]

        # Detailed breakdown for target role
        target_reqs = json.loads(matched_role.required_skills)
        matched_skills_list = []
        missing_skills_list = []
        partial_skills_list = []

        total_req = len(target_reqs)
        total_score = 0.0

        for skill_id, req_lvl in target_reqs.items():
            cur_lvl = context.verified_skills.get(skill_id, context.current_skills.get(skill_id, 0))
            name = skills.get(skill_id, skill_id.replace("-", " ").title())
            gap = max(0, req_lvl - cur_lvl)

            if cur_lvl >= req_lvl:
                status = "matched"
                total_score += 1.0
            elif cur_lvl > 0:
                status = "partial"
                total_score += (cur_lvl / req_lvl)
                partial_skills_list.append(name)
            else:
                status = "missing"
                missing_skills_list.append(name)

            matched_skills_list.append({
                "skill_id": skill_id,
                "name": name,
                "current_level": cur_lvl,
                "required_level": req_lvl,
                "status": status,
                "level_gap": gap
            })

        target_pct = round((total_score / max(total_req, 1)) * 100, 1)

        result = {
            "role_id": matched_role.role_id,
            "role_title": matched_role.title,
            "match_percentage": target_pct,
            "matched_skills": matched_skills_list,
            "missing_skills": missing_skills_list,
            "partial_skills": partial_skills_list,
            "top_recommended_roles": top_roles
        }

        context.match_report = result
