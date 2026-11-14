import json
import asyncio
from typing import Any, AsyncGenerator, Dict, List, Optional
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.llm.client import llm_client
from app.schemas.agent import LearnerContext, MentorAgentOutput

class MentorAgent(BaseAgent):
    name: str = "Mentor Agent"
    description: str = "Empathetic conversational AI guide that explains curriculum changes, motivates through friction, and answers technical questions."
    system_prompt: str = """You are the AI Mentor for SkillPath AI.
You have holistic context of the learner's current profile, verified skill levels, career aspirations, and assessment history.
Provide highly practical, encouraging, and pedagogically clear guidance.
Explain learning path adjustments transparently, suggest actionable immediate steps, and answer technical questions with code examples when appropriate.
"""

    def summarize_input(self, context: LearnerContext) -> str:
        return f"Event: {context.trigger_event}. Target: {context.target_role}. Readiness: {context.metadata.get('readiness', 0)}%"

    def summarize_output(self, context: LearnerContext) -> str:
        msg = context.mentor_message or ""
        snippet = msg[:80] + "..." if len(msg) > 80 else msg
        return f"Guidance message dispatched: '{snippet}'"

    def apply_fallback(self, context: LearnerContext, db: Session):
        event = context.trigger_event
        role = context.target_role
        name = context.full_name or "Learner"

        if event == "GOAL_CHANGED":
            msg = (
                f"Welcome to your updated career roadmap towards **{role}**! "
                f"I've re-aligned your learning path. The great news is that your completed foundation "
                f"skills (like Python and SQL) are fully preserved. We have focused your upcoming phases "
                f"on closing the specific deltas needed for {role}."
            )
            action = f"Review your new Phase 1 milestones tailored for {role}."
            nudges = [
                f"Check the Career Match tab to inspect the exact requirements for {role}.",
                "Begin with the newly added interactive tutorials in your Roadmap."
            ]
        elif event == "ASSESSMENT_POOR":
            score = context.assessment_result.get("score_pct", 40) if context.assessment_result else 40
            skill = context.assessment_result.get("skill_id", "JavaScript").title() if context.assessment_result else "JavaScript"
            weak = context.assessment_result.get("weak_topics", []) if context.assessment_result else []
            weak_str = f" Particularly around {', '.join(weak[:2])}." if weak else ""
            msg = (
                f"You scored **{score:.0f}%** on your {skill} assessment. Remember: every senior engineer has stumbled on these exact concepts{weak_str}! "
                f"I have automatically adapted your roadmap by inserting a dedicated **Remedial Phase** with beginner-friendly interactive exercises "
                f"to lock in your mental models before tackling advanced topics."
            )
            action = f"Dive into the Remedial Phase resources for {skill} to master the underlying mechanics."
            nudges = [
                "Work through the bite-sized interactive drills before retrying the assessment.",
                "Take 10 minutes to test code in your browser console to verify your understanding."
            ]
        elif event == "ASSESSMENT_STRONG":
            score = context.assessment_result.get("score_pct", 90) if context.assessment_result else 90
            skill = context.assessment_result.get("skill_id", "Core Skills").title() if context.assessment_result else "Core Skills"
            msg = (
                f"Fantastic performance! You achieved **{score:.0f}%** on {skill}, demonstrating solid verified mastery! "
                f"I've accelerated your roadmap by marking redundant introductory content as verified and advancing you directly to higher-impact projects."
            )
            action = "Jump straight to Phase 2 real-world integration projects."
            nudges = [
                "Your verified readiness score just increased!",
                "Try tackling the hands-on capstone project to cement this competency."
            ]
        elif event == "PROGRESS_STALLED":
            msg = (
                f"Hey {name}, I noticed you haven't logged study activity in a few days. Consistency beats intensity every time! "
                f"I've lightened your weekly load so you can build momentum with small 15-minute daily wins."
            )
            action = "Complete just one 10-minute documentation overview today."
            nudges = [
                "Pick one short tutorial to keep your learning streak alive.",
                "Feel free to ask me any questions if you feel stuck on a difficult concept!"
            ]
        else:
            msg = (
                f"Hello {name}! I am your AI Mentor. I have synthesized your skill profile against the **{role}** "
                f"benchmark and generated a custom adaptive roadmap. I'm here 24/7 to clarify complex topics, review code, "
                f"and adapt your path as you progress."
            )
            action = "Explore your personalized roadmap and start your first recommended resource!"
            nudges = [
                "Take a skill assessment whenever you want to test and verify your proficiency.",
                "You can change your target role anytime — I'll automatically adapt your roadmap."
            ]

        context.mentor_message = msg
        context.metadata["mentor_nudges"] = nudges
        context.metadata["mentor_action"] = action

    async def stream_mentor_chat(
        self,
        user_message: str,
        context: LearnerContext,
        chat_history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """
        Yields streaming chat responses for the SSE endpoint.
        Uses Gemini if available, or rich contextual simulation fallback.
        """
        if llm_client.is_available:
            system_prompt = f"""You are the friendly, expert AI Mentor on SkillPath AI.
Learner Context:
Name: {context.full_name}
Target Role: {context.target_role}
Current Readiness: {context.metadata.get('readiness', 40)}%
Recent Event: {context.trigger_event}
Current Skills: {json.dumps(context.current_skills)}
Verified Skills: {json.dumps(context.verified_skills)}

Provide motivating, technically precise answers with Markdown and concise code examples where useful.
If the user asks to change goals or re-plan, advise them that the system can dynamically adapt.
"""
            async for token in llm_client.stream_chat(system_prompt, user_message):
                yield token
            return

        # Fallback simulated streaming
        prompt_lower = user_message.lower()
        if "remedial" in prompt_lower or "fail" in prompt_lower or "score" in prompt_lower or "quiz" in prompt_lower:
            reply = (
                f"Don't worry about lower scores—that is precisely why the adaptive system exists! "
                f"When an assessment identifies weak subtopics, the Curriculum Planner agent immediately inserts remedial "
                f"interactive practice so you can solidify foundational mental models before building on top of them. "
                f"Take it step-by-step and retry whenever you feel confident!"
            )
        elif "role" in prompt_lower or "switch" in prompt_lower or "change" in prompt_lower:
            reply = (
                f"You can switch target roles at any time in the **Career Match** tab! "
                f"When you select a new role (like *Data Scientist* or *Frontend Developer*), the Orchestrator runs "
                f"Career Matcher, Skill Gap, and Curriculum Planner agents. It preserves all your completed competencies "
                f"and builds only the delta roadmap needed for the new target."
            )
        elif "react" in prompt_lower:
            reply = (
                f"In React, remember that state should be treated as immutable. Whenever you update state, always return "
                f"a new object or array (e.g. `setItems(prev => [...prev, newItem])`). This allows React's reconciliation engine "
                f"to detect changes by shallow reference comparison and schedule efficient re-renders!"
            )
        elif "javascript" in prompt_lower or "closure" in prompt_lower:
            reply = (
                f"A **closure** in JavaScript is the combination of a function bundled together with references to its surrounding "
                f"lexical environment. Even after the outer function finishes executing, inner functions retain access to variables "
                f"declared in that outer scope. This powers data privacy, function factories, and hooks like `useState`!"
            )
        else:
            reply = (
                f"Great question! In your journey toward **{context.target_role}**, focusing on foundational concepts "
                f"and steady daily practice will yield the highest returns. I'm actively monitoring your roadmap progress "
                f"and will help adapt your path as you complete exercises or take skill assessments. What would you like to explore next?"
            )

        # Stream words with slight delay for realistic SSE experience
        words = reply.split(" ")
        for i, word in enumerate(words):
            yield (word + " ")
            await asyncio.sleep(0.03)
