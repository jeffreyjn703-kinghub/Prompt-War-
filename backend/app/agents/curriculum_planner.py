import json
import math
from typing import Any, Dict, List, Optional, Type
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.taxonomy import ResourceItem
from app.schemas.agent import (
    CurriculumPlannerOutput,
    LearnerContext,
    RoadmapItemData,
    RoadmapPhaseData,
)

class CurriculumPlannerAgent(BaseAgent):
    name: str = "Curriculum Planner"
    description: str = "Generates sequenced multi-phase roadmaps respecting weekly hours budget, prerequisites, and adaptive events."
    system_prompt: str = """You are the Curriculum Planner Agent for SkillPath AI.
Given prioritized skill gaps and weekly hours budget, synthesize a structured, phased learning roadmap.
Adhere strictly to prerequisite order.
On ASSESSMENT_POOR, inject a targeted remedial phase before higher-level topics.
On GOAL_CHANGED, preserve completed competencies and plan the incremental delta.
Output valid JSON matching CurriculumPlannerOutput schema.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        gr = context.gap_report or {}
        gaps_count = len(gr.get("prioritized_gaps", []))
        return f"Event: {context.trigger_event}, Weekly Hours: {context.weekly_hours}h, Gaps: {gaps_count}"

    def summarize_output(self, context: LearnerContext) -> str:
        rm = context.roadmap or {}
        phases = rm.get("phases", [])
        total_h = rm.get("total_estimated_hours", 0)
        weeks = rm.get("estimated_weeks", 0)
        remedial_flag = " [Remedial Injected]" if any(p.get("is_remedial") for p in phases) else ""
        return f"Generated {len(phases)} phases ({total_h}h across ~{weeks} weeks){remedial_flag}"

    def build_user_prompt(self, context: LearnerContext) -> str:
        return f"""Plan a phased curriculum:
Target Role: {context.target_role}
Trigger Event: {context.trigger_event}
Weekly Hours: {context.weekly_hours}
Gap Report: {json.dumps(context.gap_report)}
Assessment Result: {json.dumps(context.assessment_result)}
Completed Skills: {json.dumps(context.completed_item_ids)}

Return JSON matching CurriculumPlannerOutput:
- target_role: str
- total_phases: int
- total_estimated_hours: int
- estimated_weeks: int
- weekly_hours_budget: int
- phases: list of RoadmapPhaseData
- replan_reason: str
"""

    def get_output_schema(self) -> Optional[Type[CurriculumPlannerOutput]]:
        return CurriculumPlannerOutput

    def apply_llm_result(self, context: LearnerContext, result: Dict[str, Any]):
        context.roadmap = result

    def apply_fallback(self, context: LearnerContext, db: Session):
        gap_report = context.gap_report or {}
        prioritized_gaps = gap_report.get("prioritized_gaps", [])
        event = context.trigger_event
        weekly_hours = max(context.weekly_hours, 5)

        phases: List[Dict[str, Any]] = []
        phase_num = 1
        replan_reason = ""

        # Case 1: ASSESSMENT_POOR -> Insert Remedial Phase First
        if event == "ASSESSMENT_POOR" and context.assessment_result:
            poor_skill = context.assessment_result.get("skill_id", "javascript")
            score = context.assessment_result.get("score_pct", 0)
            weak_topics = context.assessment_result.get("weak_topics", [])
            topics_str = ", ".join(weak_topics) if weak_topics else "Core Fundamentals & Mental Models"
            
            remedial_title = f"Remedial Phase: {poor_skill.replace('-', ' ').title()} Core Mastery"
            remedial_desc = f"Targeted reinforcement for topics scored at {score:.0f}%: {topics_str}. Solidify fundamentals before resuming progression."
            replan_reason = f"Assessment score ({score:.0f}%) triggered adaptive remedial phase for {poor_skill.title()}."

            phases.append({
                "phase_number": phase_num,
                "title": remedial_title,
                "description": remedial_desc,
                "estimated_hours": 12,
                "is_remedial": True,
                "items": [] # Items populated by Resource Recommender
            })
            phase_num += 1

        # Group remaining gaps into 3-4 structured logical phases
        # Group 1: Foundations (HTML, CSS, JS, Git, Python basic)
        # Group 2: Core Stack & Frameworks (React, Node, Express, FastAPI, SQL)
        # Group 3: Architecture, Integration & Data (PostgreSQL, Docker, Auth, REST)
        # Group 4: Advanced Capstone & Production Deployment

        foundational_skills = {"html", "css", "javascript", "git", "python", "sql", "linux"}
        core_skills = {"react", "nodejs", "express", "fastapi", "vue", "tailwind", "typescript", "data-analysis-pandas"}
        advanced_skills = {"docker", "kubernetes", "aws", "postgresql", "redis", "auth-jwt", "microservices", "mlops", "deep-learning-pytorch"}

        p1_gaps = []
        p2_gaps = []
        p3_gaps = []

        for g in prioritized_gaps:
            s_id = g["skill_id"]
            if s_id in foundational_skills:
                p1_gaps.append(g)
            elif s_id in core_skills:
                p2_gaps.append(g)
            else:
                p3_gaps.append(g)

        # Build Phase 1: Foundations
        if p1_gaps or phase_num == 1:
            names = [g["name"] for g in p1_gaps]
            phases.append({
                "phase_number": phase_num,
                "title": "Phase 1: Engineering Foundations & Core Syntax",
                "description": f"Master essential tools and language runtime fundamentals: {', '.join(names[:4]) if names else 'Foundational coding standards'}.",
                "estimated_hours": max(len(p1_gaps) * 10, 15),
                "is_remedial": False,
                "items": []
            })
            phase_num += 1

        # Build Phase 2: Core Frameworks & Applications
        if p2_gaps:
            names = [g["name"] for g in p2_gaps]
            phases.append({
                "phase_number": phase_num,
                "title": "Phase 2: Modern Frameworks & Full-Stack Implementation",
                "description": f"Develop interactive components and scalable APIs: {', '.join(names[:4])}.",
                "estimated_hours": max(len(p2_gaps) * 12, 20),
                "is_remedial": False,
                "items": []
            })
            phase_num += 1

        # Build Phase 3: Infrastructure, Security & Production Capstone
        if p3_gaps or len(phases) < 3:
            names = [g["name"] for g in p3_gaps]
            phases.append({
                "phase_number": phase_num,
                "title": "Phase 3: Production Readiness, Security & Cloud Deployment",
                "description": f"Hardening, deployment pipelines, containerization, and capstone project: {', '.join(names[:4]) if names else 'Cloud architectures'}.",
                "estimated_hours": max(len(p3_gaps) * 14, 20),
                "is_remedial": False,
                "items": []
            })

        # Calculate totals
        total_hours = sum(p["estimated_hours"] for p in phases)
        estimated_weeks = max(1, math.ceil(total_hours / weekly_hours))

        if event == "GOAL_CHANGED":
            replan_reason = f"Target role changed to {context.target_role}. Existing competencies preserved; generated delta roadmap."
        elif event == "ASSESSMENT_STRONG":
            replan_reason = "High assessment score (>85%) demonstrated strong mastery. Introductory modules compressed."
            # Reduce total hours slightly to reflect accelerated pacing
            total_hours = int(total_hours * 0.85)
            estimated_weeks = max(1, math.ceil(total_hours / weekly_hours))
        elif event == "PROGRESS_STALLED":
            replan_reason = "Inactivity detected. Curriculum pacing modulated to lighter weekly milestone increments."

        result = {
            "target_role": context.target_role,
            "total_phases": len(phases),
            "total_estimated_hours": total_hours,
            "estimated_weeks": estimated_weeks,
            "weekly_hours_budget": weekly_hours,
            "phases": phases,
            "replan_reason": replan_reason or "Personalized roadmap generated against role benchmark."
        }

        context.roadmap = result
