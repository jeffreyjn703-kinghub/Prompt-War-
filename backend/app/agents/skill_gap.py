import json
from typing import Any, Dict, List, Optional, Type
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.taxonomy import SkillTaxonomy
from app.schemas.agent import GapItem, LearnerContext, SkillGapOutput

class SkillGapAgent(BaseAgent):
    name: str = "Skill Gap Agent"
    description: str = "Analyzes missing and partial skills, resolves prerequisite dependencies, and produces a prioritized learning order."
    system_prompt: str = """You are the Skill Gap Agent for SkillPath AI.
Analyze the gaps identified in the match report.
Topologically sort skills so prerequisites are mastered before dependent skills.
Prioritize gaps based on level deficit, prerequisite centrality, and adaptive trigger events.
Output valid JSON adhering to the SkillGapOutput schema.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        mr = context.match_report or {}
        missing_count = len(mr.get("missing_skills", []))
        partial_count = len(mr.get("partial_skills", []))
        return f"Event: {context.trigger_event}. Input: {missing_count} missing, {partial_count} partial skills"

    def summarize_output(self, context: LearnerContext) -> str:
        gr = context.gap_report or {}
        gaps = gr.get("prioritized_gaps", [])
        top_3 = [g.get("name") for g in gaps[:3]]
        return f"Prioritized {len(gaps)} skill gaps. Immediate priorities: {', '.join(top_3)}"

    def build_user_prompt(self, context: LearnerContext) -> str:
        return f"""Analyze and prioritize skill gaps:
Trigger Event: {context.trigger_event}
Match Report: {json.dumps(context.match_report)}
Current Skills: {json.dumps(context.current_skills)}
Verified Skills: {json.dumps(context.verified_skills)}
Assessment Context: {json.dumps(context.assessment_result)}

Return JSON matching SkillGapOutput:
- prioritized_gaps: list of GapItem
- prerequisite_chains: list of strings (e.g. "html -> css -> javascript -> react")
- estimated_total_hours: int
"""

    def get_output_schema(self) -> Optional[Type[SkillGapOutput]]:
        return SkillGapOutput

    def apply_llm_result(self, context: LearnerContext, result: Dict[str, Any]):
        context.gap_report = result

    def apply_fallback(self, context: LearnerContext, db: Session):
        match_report = context.match_report or {}
        matched_skills = match_report.get("matched_skills", [])
        
        all_tax_skills = db.query(SkillTaxonomy).all()
        tax_map = {s.skill_id: s for s in all_tax_skills}

        # Identify gaps: any skill where level_gap > 0
        gap_items = []
        for ms in matched_skills:
            gap = ms.get("level_gap", 0)
            if gap > 0:
                skill_id = ms.get("skill_id")
                tax_entry = tax_map.get(skill_id)
                prereqs = json.loads(tax_entry.prerequisites) if tax_entry else []
                
                # Check which prerequisites are unmet
                missing_prereqs = []
                for p in prereqs:
                    p_lvl = context.verified_skills.get(p, context.current_skills.get(p, 0))
                    if p_lvl < 2: # At least basic competence required
                        missing_prereqs.append(tax_map[p].name if p in tax_map else p)

                gap_items.append({
                    "skill_id": skill_id,
                    "name": ms.get("name", skill_id),
                    "current_level": ms.get("current_level", 0),
                    "target_level": ms.get("required_level", 3),
                    "gap_score": gap,
                    "prerequisites_met": len(missing_prereqs) == 0,
                    "missing_prerequisites": missing_prereqs,
                    "prereq_raw": prereqs
                })

        # Prerequisite dependency resolution (graph sort)
        # Skills with no missing prereqs come before skills with missing prereqs
        # Foundational skills (html, css, javascript, python, sql, git) get boosted
        foundations = {"html": 100, "css": 90, "javascript": 80, "git": 75, "python": 70, "sql": 65}

        # If adaptive event is ASSESSMENT_POOR, boost the assessed skill to absolute top priority
        poor_skill_id = None
        if context.trigger_event == "ASSESSMENT_POOR" and context.assessment_result:
            poor_skill_id = context.assessment_result.get("skill_id")

        def sort_key(item):
            s_id = item["skill_id"]
            if poor_skill_id and s_id == poor_skill_id:
                return -999999 # Absolute first priority
            
            # Prereq count penalty: items depending on many unmet prereqs move later
            unmet_penalty = len(item["missing_prerequisites"]) * 50
            # Foundation bonus
            f_bonus = foundations.get(s_id, 0)
            # Gap weight
            gap_weight = item["gap_score"] * 10
            
            return unmet_penalty - f_bonus - gap_weight

        gap_items.sort(key=sort_key)

        # Assign clean priority numbers 1..N
        for idx, item in enumerate(gap_items, 1):
            item["priority"] = idx

        # Extract notable prerequisite chains
        chains = [
            "HTML5 -> CSS3 & Layouts -> JavaScript (ES6+) -> React",
            "JavaScript (ES6+) -> Node.js -> Express.js -> RESTful API Design",
            "SQL & Relational Databases -> Database Design -> PostgreSQL / ORM",
            "Linux -> Docker -> CI/CD Pipelines"
        ]

        total_est_hours = sum(item["gap_score"] * 8 for item in gap_items)

        result = {
            "prioritized_gaps": gap_items,
            "prerequisite_chains": chains,
            "estimated_total_hours": total_est_hours
        }
        context.gap_report = result
