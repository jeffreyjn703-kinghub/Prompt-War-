import json
from typing import Any, Dict, List, Optional, Type
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.taxonomy import ResourceItem, SkillTaxonomy
from app.schemas.agent import LearnerContext, ResourceRecommenderOutput, RoadmapItemData

class ResourceRecommenderAgent(BaseAgent):
    name: str = "Resource Recommender"
    description: str = "Matches roadmap phases with diverse courses, tutorials, docs, and projects from the catalog with tailored rationale."
    system_prompt: str = """You are the Resource Recommender Agent for VYNTRIXA.
Map curated high-quality resources to each phase of the learner's curriculum roadmap.
Ensure a balanced mix of documentation, structured courses, hands-on coding exercises, and portfolio projects.
Provide a clear, pedagogical 'why this' rationale for each recommended item.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        rm = context.roadmap or {}
        return f"Mapping catalog resources for {len(rm.get('phases', []))} phases. Event: {context.trigger_event}"

    def summarize_output(self, context: LearnerContext) -> str:
        rm = context.roadmap or {}
        total_items = sum(len(p.get("items", [])) for p in rm.get("phases", []))
        return f"Populated {total_items} curated resources with pedagogic rationale across {len(rm.get('phases', []))} phases"

    def apply_fallback(self, context: LearnerContext, db: Session):
        roadmap = context.roadmap or {}
        phases = roadmap.get("phases", [])
        gap_report = context.gap_report or {}
        prioritized_gaps = gap_report.get("prioritized_gaps", [])

        all_resources = db.query(ResourceItem).all()
        # Group resources by skill_id
        res_by_skill: Dict[str, List[ResourceItem]] = {}
        for r in all_resources:
            res_by_skill.setdefault(r.skill_id, []).append(r)

        tax_skills = {s.skill_id: s.name for s in db.query(SkillTaxonomy).all()}

        # Map skills to phases
        for phase in phases:
            is_remedial = phase.get("is_remedial", False)
            phase_num = phase.get("phase_number", 1)
            items: List[Dict[str, Any]] = []

            if is_remedial:
                # Remedial phase: pick beginner-friendly items for the struggling skill
                poor_skill = "javascript"
                if context.assessment_result:
                    poor_skill = context.assessment_result.get("skill_id", "javascript")

                avail = res_by_skill.get(poor_skill, [])
                # Filter for beginner tutorials/exercises
                beginner_res = [r for r in avail if r.difficulty == "beginner" or "remedial" in r.title.lower()]
                if not beginner_res:
                    beginner_res = avail[:3]

                for r in beginner_res[:4]:
                    items.append({
                        "skill_id": r.skill_id,
                        "title": r.title,
                        "item_type": r.type,
                        "estimated_hours": r.estimated_hours,
                        "rationale": f"Adaptive remedial reinforcement: focuses on core mental models and hands-on drills for {poor_skill.title()}.",
                        "provider": r.provider,
                        "url": r.url
                    })

            else:
                # Select target skills relevant to this phase
                if phase_num == 1:
                    target_skills = ["html", "css", "javascript", "git"]
                elif phase_num == 2:
                    target_skills = ["react", "nodejs", "express", "sql", "fastapi", "data-analysis-pandas"]
                else:
                    target_skills = ["rest-api", "docker", "auth-jwt", "postgresql", "aws", "kubernetes"]

                # Intersect with learner's actual prioritized gaps
                active_gaps = [g["skill_id"] for g in prioritized_gaps if g["skill_id"] in target_skills]
                if not active_gaps and prioritized_gaps:
                    active_gaps = [g["skill_id"] for g in prioritized_gaps[:3]]

                # For each active gap skill, pick 1 course/doc, 1 exercise/project
                for s_id in active_gaps[:3]:
                    avail = res_by_skill.get(s_id, [])
                    # Pick top 2 items of diverse types
                    picked = []
                    has_proj = False
                    for res in avail:
                        if res.type in ("project", "exercise") and not has_proj:
                            picked.append(res)
                            has_proj = True
                        elif res.type in ("course", "doc", "tutorial") and len(picked) < 2:
                            picked.append(res)
                        if len(picked) >= 2:
                            break

                    if not picked and avail:
                        picked = avail[:2]

                    skill_name = tax_skills.get(s_id, s_id.title())
                    for r in picked:
                        items.append({
                            "skill_id": r.skill_id,
                            "title": r.title,
                            "item_type": r.type,
                            "estimated_hours": r.estimated_hours,
                            "rationale": f"Essential for {context.target_role}: builds verified capability in {skill_name}.",
                            "provider": r.provider,
                            "url": r.url
                        })

            # Ensure every phase has at least 2 items
            if not items and all_resources:
                for r in all_resources[:3]:
                    items.append({
                        "skill_id": r.skill_id,
                        "title": r.title,
                        "item_type": r.type,
                        "estimated_hours": r.estimated_hours,
                        "rationale": f"Curriculum requirement for {context.target_role}.",
                        "provider": r.provider,
                        "url": r.url
                    })

            phase["items"] = items
            phase["estimated_hours"] = sum(it["estimated_hours"] for it in items)

        # Update roadmap total hours
        roadmap["total_estimated_hours"] = sum(p["estimated_hours"] for p in phases)
        context.roadmap = roadmap
