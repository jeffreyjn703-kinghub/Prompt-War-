import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.models.progress import AssessmentAttempt
from app.models.roadmap import RoadmapVersion
from app.services.auth_service import get_current_user
from app.agents.mentor_agent import MentorAgent
from app.schemas.agent import LearnerContext

router = APIRouter(prefix="/api/mentor", tags=["AI Mentor"])
mentor_agent = MentorAgent()

@router.get("/guidance")
def get_mentor_guidance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Check latest assessment attempt
    latest_attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.created_at.desc()).first()

    event = "INITIAL"
    if latest_attempt:
        if latest_attempt.trigger_action == "ASSESSMENT_POOR":
            event = "ASSESSMENT_POOR"
        elif latest_attempt.trigger_action == "ASSESSMENT_STRONG":
            event = "ASSESSMENT_STRONG"

    ctx = LearnerContext(
        user_id=current_user.id,
        full_name=profile.full_name if profile else "Learner",
        target_role=profile.target_role if profile else "Full Stack Developer",
        weekly_hours=profile.weekly_hours if profile else 15,
        trigger_event=event,
        metadata={"readiness": profile.readiness_pct if profile else 0.0}
    )

    if latest_attempt and event == "ASSESSMENT_POOR":
        ctx.assessment_result = {
            "skill_id": latest_attempt.skill_id,
            "score_pct": latest_attempt.score_pct,
            "weak_topics": json.loads(latest_attempt.weak_topics) if latest_attempt.weak_topics else []
        }

    mentor_agent.apply_fallback(ctx, db)

    return {
        "message": ctx.mentor_message,
        "action_suggestion": ctx.metadata.get("mentor_action", ""),
        "nudges": ctx.metadata.get("mentor_nudges", []),
        "target_role": ctx.target_role
    }

@router.get("/chat")
async def chat_with_mentor(
    message: str = Query(..., description="User message to AI Mentor"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    cur_skills = {s.skill_name: s.proficiency for s in current_user.skills}
    ver_skills = {s.skill_name: s.verified_level for s in current_user.skills if s.verified_level}

    ctx = LearnerContext(
        user_id=current_user.id,
        full_name=profile.full_name if profile else "Learner",
        target_role=profile.target_role if profile else "Full Stack Developer",
        weekly_hours=profile.weekly_hours if profile else 15,
        current_skills=cur_skills,
        verified_skills=ver_skills,
        metadata={"readiness": profile.readiness_pct if profile else 0.0}
    )

    async def event_generator():
        try:
            async for chunk in mentor_agent.stream_mentor_chat(message, ctx, []):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
