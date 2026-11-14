import json
from typing import Any, Dict, Optional, Type
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.taxonomy import SkillTaxonomy
from app.schemas.agent import LearnerContext, ProfileAnalystOutput

class ProfileAnalystAgent(BaseAgent):
    name: str = "Profile Analyst"
    description: str = "Normalizes skills, certifications, and projects into a structured skill graph with proficiency levels."
    system_prompt: str = """You are the Profile Analyst Agent for SkillPath AI.
Analyze the user's reported skills, certifications, and project experiences.
Normalize skill names into standard taxonomy IDs, evaluate strengths and growth areas, and output valid JSON matching the ProfileAnalystOutput schema.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        skills_summary = ", ".join([f"{k}:{v}" for k, v in list(context.current_skills.items())[:5]])
        return f"Raw Skills: [{skills_summary}], Certs: {len(context.certifications)}, Projects: {len(context.projects)}"

    def summarize_output(self, context: LearnerContext) -> str:
        prof = context.metadata.get("normalized_profile", {})
        strengths = prof.get("strengths", [])
        return f"Normalized {len(prof.get('normalized_skills', {}))} skills. Key Strengths: {', '.join(strengths[:3])}"

    def build_user_prompt(self, context: LearnerContext) -> str:
        return f"""Analyze this learner profile:
User: {context.full_name}
Target Role: {context.target_role}
Skills: {json.dumps(context.current_skills)}
Verified Skills: {json.dumps(context.verified_skills)}
Certifications: {json.dumps(context.certifications)}
Projects: {json.dumps(context.projects)}

Return a JSON object with:
- normalized_skills: dict[str, int]
- skill_categories: dict[str, str]
- confidence_ratings: dict[str, str]
- inferred_experience_level: str
- strengths: list[str]
- growth_areas: list[str]
"""

    def get_output_schema(self) -> Optional[Type[ProfileAnalystOutput]]:
        return ProfileAnalystOutput

    def apply_llm_result(self, context: LearnerContext, result: Dict[str, Any]):
        context.metadata["normalized_profile"] = result
        # Sync normalized skills back into current_skills if updated
        if "normalized_skills" in result:
            for s, lvl in result["normalized_skills"].items():
                context.current_skills[s] = lvl

    def apply_fallback(self, context: LearnerContext, db: Session):
        # Query taxonomy for skill categorization
        all_skills = db.query(SkillTaxonomy).all()
        tax_map = {s.skill_id: s for s in all_skills}
        name_map = {s.name.lower(): s.skill_id for s in all_skills}

        normalized_skills = {}
        skill_categories = {}
        confidence_ratings = {}

        for raw_k, lvl in context.current_skills.items():
            k_slug = raw_k.lower().strip().replace(" ", "-")
            matched_id = k_slug if k_slug in tax_map else name_map.get(raw_k.lower().strip(), k_slug)
            
            # Use verified level if present
            if matched_id in context.verified_skills:
                eff_lvl = context.verified_skills[matched_id]
                confidence_ratings[matched_id] = "verified by assessment"
            else:
                eff_lvl = lvl
                confidence_ratings[matched_id] = "self-rated"

            normalized_skills[matched_id] = eff_lvl
            
            if matched_id in tax_map:
                skill_categories[matched_id] = tax_map[matched_id].category
            else:
                skill_categories[matched_id] = "General"

        # Evaluate strengths (level >= 3) and growth areas (< 3)
        strengths = [tax_map[k].name if k in tax_map else k.title() for k, v in normalized_skills.items() if v >= 3]
        growth_areas = [tax_map[k].name if k in tax_map else k.title() for k, v in normalized_skills.items() if v < 3]

        if not strengths:
            strengths = ["Eager to learn fundamentals"]

        avg_lvl = sum(normalized_skills.values()) / max(len(normalized_skills), 1)
        inferred = "Advanced" if avg_lvl >= 4 else "Intermediate" if avg_lvl >= 2.5 else "Beginner"

        result = {
            "normalized_skills": normalized_skills,
            "skill_categories": skill_categories,
            "confidence_ratings": confidence_ratings,
            "inferred_experience_level": inferred,
            "strengths": strengths,
            "growth_areas": growth_areas
        }
        context.metadata["normalized_profile"] = result
        context.current_skills = normalized_skills
