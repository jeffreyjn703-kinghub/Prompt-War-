import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.progress import AssessmentAttempt, ActivityLog
from app.models.roadmap import RoadmapVersion, RoadmapItem
from app.models.taxonomy import RoleTaxonomy
from app.models.user import User, Profile
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking"])

@router.get("")
def get_progress_overview(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if profile else "Full Stack Developer"

    # Active roadmap completion metrics
    active_version = db.query(RoadmapVersion).filter(
        RoadmapVersion.user_id == current_user.id,
        RoadmapVersion.is_active == True
    ).first()

    phase_progress = []
    total_roadmap_items = 0
    completed_roadmap_items = 0
    total_completed_hours = 0

    if active_version:
        for phase in active_version.phases:
            p_items = phase.items
            p_total = len(p_items)
            p_done = sum(1 for it in p_items if it.is_completed)
            p_hours = sum(it.estimated_hours for it in p_items if it.is_completed)

            total_roadmap_items += p_total
            completed_roadmap_items += p_done
            total_completed_hours += p_hours

            pct = round((p_done / max(p_total, 1)) * 100, 1)
            phase_progress.append({
                "phase_id": phase.id,
                "phase_number": phase.phase_number,
                "title": phase.title,
                "is_remedial": phase.is_remedial,
                "total_items": p_total,
                "completed_items": p_done,
                "progress_pct": pct,
                "is_completed": phase.is_completed
            })

    roadmap_completion_pct = round((completed_roadmap_items / max(total_roadmap_items, 1)) * 100, 1)

    # Assessment score history line chart data
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.created_at.asc()).all()

    score_history = [
        {
            "id": a.id,
            "skill_id": a.skill_id,
            "skill_name": a.skill_id.title(),
            "score_pct": a.score_pct,
            "passed": a.passed,
            "date": a.created_at.strftime("%b %d, %H:%M") if a.created_at else "Recently",
            "trigger_action": a.trigger_action
        }
        for a in attempts
    ]

    # Skill progress bars against target role
    target_role_clean = target_role.lower().strip().replace(" ", "-")
    role_obj = db.query(RoleTaxonomy).filter(
        (RoleTaxonomy.role_id == target_role_clean) | (RoleTaxonomy.title.ilike(target_role))
    ).first()
    role_reqs = json.loads(role_obj.required_skills) if role_obj else {}

    user_skills_map = {s.skill_name.lower().replace(" ", "-"): s for s in current_user.skills}
    skill_progress_bars = []

    for s_id, target_lvl in role_reqs.items():
        us = user_skills_map.get(s_id)
        cur_lvl = us.verified_level if us and us.verified_level else (us.proficiency if us else 0)
        conf = us.confidence if us else "not started"
        pct = min(100.0, round((cur_lvl / max(target_lvl, 1)) * 100, 1))
        
        skill_progress_bars.append({
            "skill_id": s_id,
            "skill_name": s_id.replace("-", " ").title(),
            "current_level": cur_lvl,
            "target_level": target_lvl,
            "progress_pct": pct,
            "confidence": conf,
            "is_verified": conf == "verified by assessment"
        })

    # Recent activity logs
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(ActivityLog.created_at.desc()).limit(10).all()

    activity_feed = [
        {
            "id": act.id,
            "activity_type": act.activity_type,
            "title": act.title,
            "description": act.description,
            "created_at": act.created_at.strftime("%b %d, %H:%M") if act.created_at else "Recently"
        }
        for act in activities
    ]

    return {
        "readiness_pct": profile.readiness_pct if profile else 0.0,
        "streak_days": profile.streak_days if profile else 1,
        "total_completed_hours": total_completed_hours,
        "weekly_hours_budget": profile.weekly_hours if profile else 15,
        "roadmap_completion_pct": roadmap_completion_pct,
        "total_roadmap_items": total_roadmap_items,
        "completed_roadmap_items": completed_roadmap_items,
        "phase_progress": phase_progress,
        "score_history": score_history,
        "skill_progress_bars": skill_progress_bars,
        "activity_feed": activity_feed
    }
