from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.assessment import AssessmentSubmission, AssessmentResultResponse, AssessmentGenerateResponse
from app.services.auth_service import get_current_user
from app.agents.assessment_agent import AssessmentAgent
from app.agents.orchestrator import orchestrator
from app.schemas.agent import LearnerContext

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])
assessment_agent = AssessmentAgent()

@router.get("/generate/{skill_id}", response_model=AssessmentGenerateResponse)
def generate_assessment(
    skill_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz_data = assessment_agent.generate_quiz(skill_id.lower().strip(), db)
    if not quiz_data.get("questions"):
        raise HTTPException(status_code=404, detail=f"No questions available for skill '{skill_id}'")
    return quiz_data

@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_assessment(
    submission: AssessmentSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill_id = submission.skill_id.lower().strip()
    result = assessment_agent.grade_assessment(
        user_id=current_user.id,
        skill_id=skill_id,
        answers=submission.answers,
        practical_text=submission.practical_response or "",
        db=db
    )

    replan_triggered = False
    replan_summary = None
    mentor_feedback = ""

    trigger_action = result["trigger_action"]

    # If score is POOR (<60%) or STRONG (>=85%), trigger adaptive re-plan
    if trigger_action in ("ASSESSMENT_POOR", "ASSESSMENT_STRONG"):
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        cur_skills = {s.skill_name.lower().replace(" ", "-"): s.proficiency for s in current_user.skills}
        ver_skills = {s.skill_name.lower().replace(" ", "-"): s.verified_level for s in current_user.skills if s.verified_level}
        
        ctx = LearnerContext(
            user_id=current_user.id,
            full_name=profile.full_name if profile else "Learner",
            target_role=profile.target_role if profile else "Full Stack Developer",
            weekly_hours=profile.weekly_hours if profile else 15,
            current_skills=cur_skills,
            verified_skills=ver_skills,
            trigger_event=trigger_action,
            assessment_result={
                "skill_id": skill_id,
                "score_pct": result["score_pct"],
                "weak_topics": result["weak_topics"]
            }
        )

        updated_ctx = await orchestrator.run(ctx, db)
        replan_triggered = True
        replan_summary = updated_ctx.metadata.get("roadmap_diff")
        mentor_feedback = updated_ctx.mentor_message or ""
    else:
        mentor_feedback = f"Assessment completed for {skill_id.title()} with {result['score_pct']:.0f}%. Keep building steady progress!"

    return AssessmentResultResponse(
        attempt_id=result["attempt_id"],
        skill_id=result["skill_id"],
        score_pct=result["score_pct"],
        passed=result["passed"],
        total_questions=result["total_questions"],
        correct_questions=result["correct_questions"],
        new_verified_level=result["new_verified_level"],
        weak_topics=result["weak_topics"],
        trigger_action=trigger_action,
        replan_triggered=replan_triggered,
        replan_summary=replan_summary,
        mentor_feedback=mentor_feedback,
        created_at=datetime.now(timezone.utc)
    )
