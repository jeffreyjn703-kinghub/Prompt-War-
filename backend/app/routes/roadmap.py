from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.roadmap import RoadmapVersion, RoadmapPhase, RoadmapItem
from app.models.user import User, Profile
from app.models.progress import ActivityLog
from app.services.auth_service import get_current_user
from app.schemas.roadmap import RoadmapVersionResponse, RoadmapPhaseResponse, RoadmapItemResponse
from app.agents.orchestrator import orchestrator
from app.schemas.agent import LearnerContext

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])

@router.get("", response_model=RoadmapVersionResponse)
async def get_active_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    version = db.query(RoadmapVersion).filter(
        RoadmapVersion.user_id == current_user.id,
        RoadmapVersion.is_active == True
    ).order_by(RoadmapVersion.version_number.desc()).first()

    if not version:
        # If no active roadmap, generate initial
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        target_role = profile.target_role if profile else "Full Stack Developer"
        cur_skills = {s.skill_name.lower().replace(" ", "-"): s.proficiency for s in current_user.skills}
        ctx = LearnerContext(
            user_id=current_user.id,
            full_name=profile.full_name if profile else "Learner",
            target_role=target_role,
            weekly_hours=profile.weekly_hours if profile else 15,
            current_skills=cur_skills,
            trigger_event="INITIAL"
        )
        await orchestrator.run(ctx, db)
        
        version = db.query(RoadmapVersion).filter(
            RoadmapVersion.user_id == current_user.id,
            RoadmapVersion.is_active == True
        ).first()

    if not version:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    phases_out = []
    for p in version.phases:
        items_out = [
            RoadmapItemResponse(
                id=it.id,
                skill_id=it.skill_id,
                title=it.title,
                item_type=it.item_type,
                estimated_hours=it.estimated_hours,
                rationale=it.rationale,
                provider=it.provider,
                url=it.url,
                is_completed=it.is_completed,
                completed_at=it.completed_at,
                sort_order=it.sort_order
            )
            for it in p.items
        ]
        phases_out.append(RoadmapPhaseResponse(
            id=p.id,
            phase_number=p.phase_number,
            title=p.title,
            description=p.description,
            estimated_hours=p.estimated_hours,
            is_remedial=p.is_remedial,
            is_completed=p.is_completed,
            items=items_out
        ))

    return RoadmapVersionResponse(
        id=version.id,
        version_number=version.version_number,
        target_role=version.target_role,
        trigger_event=version.trigger_event,
        reason_diff=version.reason_diff,
        total_phases=version.total_phases,
        total_hours=version.total_hours,
        is_active=version.is_active,
        created_at=version.created_at,
        phases=phases_out
    )

@router.post("/items/{item_id}/toggle")
def toggle_item_completion(
    item_id: int = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(RoadmapItem).filter(
        RoadmapItem.id == item_id,
        RoadmapItem.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Roadmap item not found")

    item.is_completed = not item.is_completed
    item.completed_at = datetime.now(timezone.utc) if item.is_completed else None

    # Check if parent phase is completed
    phase = item.phase
    if phase:
        all_done = all(it.is_completed for it in phase.items)
        phase.is_completed = all_done

    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        activity_type="ITEM_COMPLETED" if item.is_completed else "ITEM_UNCHECKED",
        title=f"{'Completed' if item.is_completed else 'Unchecked'} {item.title}"
    )
    db.add(log)
    db.commit()

    return {
        "item_id": item.id,
        "is_completed": item.is_completed,
        "phase_id": phase.id if phase else None,
        "phase_is_completed": phase.is_completed if phase else False
    }

@router.get("/versions")
def get_roadmap_versions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    versions = db.query(RoadmapVersion).filter(
        RoadmapVersion.user_id == current_user.id
    ).order_by(RoadmapVersion.version_number.desc()).all()

    return [
        {
            "id": v.id,
            "version_number": v.version_number,
            "target_role": v.target_role,
            "trigger_event": v.trigger_event,
            "reason_diff": v.reason_diff,
            "total_phases": v.total_phases,
            "total_hours": v.total_hours,
            "is_active": v.is_active,
            "created_at": v.created_at
        }
        for v in versions
    ]

@router.post("/regenerate")
async def regenerate_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
        trigger_event="INITIAL"
    )

    await orchestrator.run(ctx, db)
    return get_active_roadmap(current_user=current_user, db=db)
