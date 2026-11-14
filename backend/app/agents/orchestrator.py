import logging
import time
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.agents.career_matcher import CareerMatcherAgent
from app.agents.curriculum_planner import CurriculumPlannerAgent
from app.agents.mentor_agent import MentorAgent
from app.agents.profile_analyst import ProfileAnalystAgent
from app.agents.progress_evaluator import ProgressEvaluatorAgent
from app.agents.resource_recommender import ResourceRecommenderAgent
from app.agents.skill_gap import SkillGapAgent
from app.models.agent_run import AgentRunTrace
from app.schemas.agent import LearnerContext
from app.services.roadmap_service import RoadmapService

logger = logging.getLogger("vyntrixa.orchestrator")

class Orchestrator:
    def __init__(self):
        self.profile_analyst = ProfileAnalystAgent()
        self.career_matcher = CareerMatcherAgent()
        self.skill_gap = SkillGapAgent()
        self.curriculum_planner = CurriculumPlannerAgent()
        self.resource_recommender = ResourceRecommenderAgent()
        self.progress_evaluator = ProgressEvaluatorAgent()
        self.mentor_agent = MentorAgent()

    def get_execution_plan(self, event: str) -> List[Any]:
        """
        Decides which agents run and in what order based on the incoming trigger event.
        """
        if event == "GOAL_CHANGED":
            # New target role: re-evaluate match -> identify new gaps -> rebuild curriculum -> map resources -> evaluate readiness -> mentor guidance
            return [
                self.career_matcher,
                self.skill_gap,
                self.curriculum_planner,
                self.resource_recommender,
                self.progress_evaluator,
                self.mentor_agent
            ]
        elif event == "ASSESSMENT_POOR":
            # Low score: progress evaluator flags friction -> skill gap prioritizes weak skill -> planner injects remedial phase -> recommender picks beginner material -> mentor motivates
            return [
                self.progress_evaluator,
                self.skill_gap,
                self.curriculum_planner,
                self.resource_recommender,
                self.mentor_agent
            ]
        elif event == "ASSESSMENT_STRONG":
            # High score: progress evaluator flags mastery -> planner compresses introductory material -> recommender refines -> mentor congratulates
            return [
                self.progress_evaluator,
                self.skill_gap,
                self.curriculum_planner,
                self.resource_recommender,
                self.mentor_agent
            ]
        elif event == "PROGRESS_STALLED":
            # Inactivity: progress evaluator detects stagnation -> planner lightens weekly commitments -> mentor nudges
            return [
                self.progress_evaluator,
                self.curriculum_planner,
                self.mentor_agent
            ]
        else: # INITIAL or full regeneration
            return [
                self.profile_analyst,
                self.career_matcher,
                self.skill_gap,
                self.curriculum_planner,
                self.resource_recommender,
                self.progress_evaluator,
                self.mentor_agent
            ]

    async def run(self, context: LearnerContext, db: Session) -> LearnerContext:
        """
        Runs the orchestrated pipeline with explicit hand-offs.
        """
        start_time = time.time()
        pipeline = self.get_execution_plan(context.trigger_event)
        agent_names = [a.name for a in pipeline]
        
        logger.info(f"Orchestrator starting execution plan for event [{context.trigger_event}]: {' -> '.join(agent_names)}")

        # Log Orchestrator start trace
        plan_trace = AgentRunTrace(
            user_id=context.user_id,
            event_name=context.trigger_event,
            agent_name="Orchestrator",
            input_summary=f"Event: {context.trigger_event}, Target Role: {context.target_role}",
            output_summary=f"Execution Plan: {' -> '.join(agent_names)}",
            duration_ms=0,
            used_llm=False,
            status="SUCCESS"
        )
        db.add(plan_trace)
        db.commit()

        # Execute agents sequentially with hand-offs
        for agent in pipeline:
            logger.info(f"Hand-off to [{agent.name}]...")
            context = await agent.execute(context, db)

        # If a new or revised roadmap was produced, persist version and diff
        if context.roadmap and "phases" in context.roadmap:
            new_version = RoadmapService.persist_roadmap_version(
                user_id=context.user_id,
                target_role=context.target_role,
                trigger_event=context.trigger_event,
                roadmap_data=context.roadmap,
                db=db
            )
            context.metadata["active_roadmap_version"] = new_version.version_number
            context.metadata["roadmap_diff"] = new_version.reason_diff

        total_duration_ms = int((time.time() - start_time) * 1000)
        logger.info(f"Orchestrator finished pipeline in {total_duration_ms}ms")
        
        return context

orchestrator = Orchestrator()
