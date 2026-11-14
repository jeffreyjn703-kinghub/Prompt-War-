import time
import logging
from typing import Any, Dict, Optional, Type
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.llm.client import llm_client
from app.models.agent_run import AgentRunTrace
from app.schemas.agent import LearnerContext

logger = logging.getLogger("vyntrixa.agents")

class BaseAgent:
    name: str = "BaseAgent"
    description: str = "Base agent specification"
    system_prompt: str = ""

    def __init__(self):
        self.logger = logging.getLogger(f"vyntrixa.agent.{self.name.lower().replace(' ', '_')}")

    async def execute(self, context: LearnerContext, db: Session) -> LearnerContext:
        """
        Executes the agent workflow:
        1. Formulate prompt from context
        2. Attempt LLM call with retry
        3. If failed/unavailable, execute deterministic rule-based fallback
        4. Log execution trace to DB
        5. Return updated LearnerContext
        """
        start_time = time.time()
        used_llm = False
        status = "SUCCESS"
        output_summary = ""
        input_summary = self.summarize_input(context)

        self.logger.info(f"Agent [{self.name}] starting for user {context.user_id} on event {context.trigger_event}")

        try:
            llm_result = None
            if llm_client.is_available:
                user_prompt = self.build_user_prompt(context)
                schema_cls = self.get_output_schema()
                llm_result = await llm_client.generate_json(
                    system_prompt=self.system_prompt,
                    user_prompt=user_prompt,
                    schema_cls=schema_cls,
                    retries=1
                )
            
            if llm_result is not None:
                used_llm = True
                status = "SUCCESS"
                self.apply_llm_result(context, llm_result)
                output_summary = f"[Gemini LLM] {self.summarize_output(context)}"
            else:
                # Deterministic rule-based fallback
                self.apply_fallback(context, db)
                used_llm = False
                status = "FALLBACK"
                output_summary = f"[Rule Engine] {self.summarize_output(context)}"

        except Exception as e:
            self.logger.error(f"Error in agent [{self.name}]: {e}", exc_info=True)
            self.apply_fallback(context, db)
            used_llm = False
            status = "FALLBACK"
            output_summary = f"[Recovered Fallback] {self.summarize_output(context)}"

        duration_ms = int((time.time() - start_time) * 1000)

        # Record agent trace in SQLite DB
        try:
            trace = AgentRunTrace(
                user_id=context.user_id,
                event_name=context.trigger_event,
                agent_name=self.name,
                input_summary=input_summary[:500],
                output_summary=output_summary[:500],
                duration_ms=duration_ms,
                used_llm=used_llm,
                status=status
            )
            db.add(trace)
            db.commit()
        except Exception as trace_err:
            self.logger.warning(f"Failed to record agent trace: {trace_err}")

        return context

    def summarize_input(self, context: LearnerContext) -> str:
        return f"Event: {context.trigger_event}, Target: {context.target_role}, Skills count: {len(context.current_skills)}"

    def summarize_output(self, context: LearnerContext) -> str:
        return "Completed step"

    def build_user_prompt(self, context: LearnerContext) -> str:
        return ""

    def get_output_schema(self) -> Optional[Type[BaseModel]]:
        return None

    def apply_llm_result(self, context: LearnerContext, result: Dict[str, Any]):
        pass

    def apply_fallback(self, context: LearnerContext, db: Session):
        pass
