import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.agent_run import AgentRunTrace
from app.models.progress import AssessmentAttempt, ClientMutation, ActivityLog
from app.models.roadmap import RoadmapVersion, RoadmapPhase, RoadmapItem
from app.models.taxonomy import RoleTaxonomy, SkillTaxonomy, ResourceItem, QuizQuestion
from app.models.user import User, Profile, UserSkill
from app.services.auth_service import get_current_user
from app.services.roadmap_service import RoadmapService

logger = logging.getLogger("vyntrixa.sync")

router = APIRouter(prefix="/api/sync", tags=["Offline Sync"])

class MutationItem(BaseModel):
    client_uuid: str
    type: str
    payload: Dict[str, Any]
    created_at: Optional[str] = None

class PushRequest(BaseModel):
    mutations: List[MutationItem]

@router.get("/bootstrap")
def bootstrap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns complete dataset for offline hydration:
    learner profile, current skills, active roadmap, progress, catalogs, and server time.
    """
    server_time = datetime.now(timezone.utc).isoformat()
    user_id = current_user.id
    profile = current_user.profile

    # 1. Profile and Skills
    skills_map: Dict[str, int] = {}
    verified_map: Dict[str, int] = {}
    for us in current_user.skills:
        skills_map[us.skill_name.lower()] = us.proficiency
        if us.verified_level is not None:
            verified_map[us.skill_name.lower()] = us.verified_level

    profile_data = {
        "user_id": user_id,
        "email": current_user.email,
        "full_name": profile.full_name if profile else "Learner",
        "education": profile.education if profile else "Computer Science",
        "target_role": profile.target_role if profile else "Full Stack Developer",
        "weekly_hours": profile.weekly_hours if profile else 15,
        "readiness_pct": profile.readiness_pct if profile else 0.0,
        "streak_days": profile.streak_days if profile else 1,
        "current_skills": skills_map,
        "verified_skills": verified_map,
        "updatedAt": profile.updated_at.isoformat() if profile and profile.updated_at else server_time
    }

    # 2. Active Roadmap
    active_version = db.query(RoadmapVersion).filter(
        RoadmapVersion.user_id == user_id,
        RoadmapVersion.is_active == True
    ).first()

    active_roadmap = None
    if active_version:
        phases_out = []
        for p in active_version.phases:
            items_out = []
            for it in p.items:
                items_out.append({
                    "id": it.id,
                    "skill_id": it.skill_id,
                    "title": it.title,
                    "item_type": it.item_type,
                    "estimated_hours": it.estimated_hours,
                    "rationale": it.rationale,
                    "provider": it.provider,
                    "url": it.url,
                    "is_completed": it.is_completed,
                    "completed_at": it.completed_at.isoformat() if it.completed_at else None,
                    "sort_order": it.sort_order
                })
            phases_out.append({
                "id": p.id,
                "phase_number": p.phase_number,
                "title": p.title,
                "description": p.description,
                "estimated_hours": p.estimated_hours,
                "is_remedial": p.is_remedial,
                "is_completed": p.is_completed,
                "items": items_out
            })
        active_roadmap = {
            "id": active_version.id,
            "version_number": active_version.version_number,
            "target_role": active_version.target_role,
            "trigger_event": active_version.trigger_event,
            "reason_diff": active_version.reason_diff,
            "total_phases": active_version.total_phases,
            "total_hours": active_version.total_hours,
            "is_active": True,
            "phases": phases_out,
            "createdAt": active_version.created_at.isoformat() if active_version.created_at else server_time
        }

    # Past roadmap versions history
    all_versions = db.query(RoadmapVersion).filter(
        RoadmapVersion.user_id == user_id
    ).order_by(RoadmapVersion.version_number.desc()).all()

    roadmap_history = [
        {
            "id": v.id,
            "version_number": v.version_number,
            "target_role": v.target_role,
            "trigger_event": v.trigger_event,
            "reason_diff": v.reason_diff,
            "total_phases": v.total_phases,
            "total_hours": v.total_hours,
            "is_active": v.is_active,
            "createdAt": v.created_at.isoformat() if v.created_at else server_time
        }
        for v in all_versions
    ]

    # 3. Progress & Score History
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == user_id
    ).order_by(AssessmentAttempt.created_at.desc()).all()

    score_history = [
        {
            "attempt_id": a.id,
            "skill_id": a.skill_id,
            "score_pct": a.score_pct,
            "passed": a.passed,
            "total_questions": a.total_questions,
            "correct_questions": a.correct_questions,
            "weak_topics": json.loads(a.weak_topics) if a.weak_topics else [],
            "createdAt": a.created_at.isoformat() if a.created_at else server_time
        }
        for a in attempts
    ]

    # 4. Catalogs
    skills_cat = db.query(SkillTaxonomy).all()
    roles_cat = db.query(RoleTaxonomy).all()
    resources_cat = db.query(ResourceItem).all()
    questions_cat = db.query(QuizQuestion).all()

    catalogs = {
        "skills": [
            {
                "skill_id": s.skill_id,
                "name": s.name,
                "category": s.category,
                "description": s.description,
                "prerequisites": json.loads(s.prerequisites) if s.prerequisites else []
            }
            for s in skills_cat
        ],
        "roles": [
            {
                "role_id": r.role_id,
                "title": r.title,
                "department": r.department,
                "description": r.description,
                "required_skills": json.loads(r.required_skills) if r.required_skills else {}
            }
            for r in roles_cat
        ],
        "resources": [
            {
                "id": res.id,
                "title": res.title,
                "type": res.type,
                "skill_id": res.skill_id,
                "difficulty": res.difficulty,
                "estimated_hours": res.estimated_hours,
                "provider": res.provider,
                "url": res.url,
                "description": res.description
            }
            for res in resources_cat
        ],
        "questions": [
            {
                "id": q.id,
                "skill_id": q.skill_id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": json.loads(q.options) if q.options else [],
                "difficulty": q.difficulty,
                "explanation": q.explanation
            }
            for q in questions_cat
        ]
    }

    # 5. Agent Run Traces
    traces = db.query(AgentRunTrace).filter(
        AgentRunTrace.user_id == user_id
    ).order_by(AgentRunTrace.created_at.desc()).limit(30).all()

    agent_runs = [
        {
            "id": t.id,
            "event_name": t.event_name,
            "agent_name": t.agent_name,
            "input_summary": t.input_summary,
            "output_summary": t.output_summary,
            "duration_ms": t.duration_ms,
            "used_llm": t.used_llm,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else server_time,
            "runtime_mode": "Online · LLM" if t.used_llm else "Online · Fallback"
        }
        for t in traces
    ]

    return {
        "server_time": server_time,
        "version_tag": "2026.11-offline-pwa",
        "profile": profile_data,
        "active_roadmap": active_roadmap,
        "roadmap_history": roadmap_history,
        "scores": score_history,
        "catalogs": catalogs,
        "agent_runs": agent_runs
    }

@router.post("/push")
def push_mutations(
    req: PushRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Applies queued offline mutations idempotently by client_uuid.
    Conflict policy:
    - Catalogs: server authoritative
    - Profile: last-write-wins per field with timestamp check
    - Roadmap items & assessments: append-only merge by ID
    """
    user_id = current_user.id
    results = []

    for item in req.mutations:
        # Check idempotency
        existing = db.query(ClientMutation).filter(
            ClientMutation.client_uuid == item.client_uuid
        ).first()

        if existing:
            results.append({
                "client_uuid": item.client_uuid,
                "type": item.type,
                "status": "ALREADY_APPLIED"
            })
            continue

        try:
            m_type = item.type
            payload = item.payload

            if m_type == "TOGGLE_ROADMAP_ITEM":
                item_id = payload.get("id") or payload.get("item_id")
                title = payload.get("title", "")
                is_completed = payload.get("is_completed", False)
                completed_at_str = payload.get("completed_at")
                comp_dt = datetime.fromisoformat(completed_at_str.replace("Z", "+00:00")) if completed_at_str else datetime.now(timezone.utc)

                road_item = None
                if item_id and str(item_id).isdigit():
                    road_item = db.query(RoadmapItem).filter(
                        RoadmapItem.id == int(item_id),
                        RoadmapItem.user_id == user_id
                    ).first()

                if not road_item and title:
                    road_item = db.query(RoadmapItem).filter(
                        RoadmapItem.user_id == user_id,
                        RoadmapItem.title.ilike(title)
                    ).first()

                if road_item:
                    road_item.is_completed = is_completed
                    road_item.completed_at = comp_dt if is_completed else None
                    db.commit()

            elif m_type == "UPDATE_PROFILE":
                profile = current_user.profile
                if profile:
                    # LWW check
                    client_ts_str = payload.get("updatedAt")
                    client_ts = datetime.fromisoformat(client_ts_str.replace("Z", "+00:00")) if client_ts_str else None
                    if not profile.updated_at or not client_ts or client_ts >= profile.updated_at.replace(tzinfo=timezone.utc):
                        if "full_name" in payload:
                            profile.full_name = payload["full_name"]
                        if "target_role" in payload:
                            profile.target_role = payload["target_role"]
                        if "weekly_hours" in payload:
                            profile.weekly_hours = int(payload["weekly_hours"])
                        if "education" in payload:
                            profile.education = payload["education"]
                        if "readiness_pct" in payload:
                            profile.readiness_pct = float(payload["readiness_pct"])
                        db.commit()

            elif m_type == "SUBMIT_ASSESSMENT":
                skill_id = payload.get("skill_id", "javascript").lower()
                score_pct = float(payload.get("score_pct", 0.0))
                passed = bool(payload.get("passed", False))
                new_lvl = int(payload.get("new_verified_level", 1))
                weak = payload.get("weak_topics", [])
                trigger_action = payload.get("trigger_action", "NONE")

                attempt = AssessmentAttempt(
                    user_id=user_id,
                    skill_id=skill_id,
                    score_pct=score_pct,
                    passed=passed,
                    total_questions=int(payload.get("total_questions", 10)),
                    correct_questions=int(payload.get("correct_questions", 0)),
                    practical_feedback="Synced from offline assessment.",
                    weak_topics=json.dumps(weak),
                    trigger_action=trigger_action
                )
                db.add(attempt)

                # Update UserSkill
                usk = db.query(UserSkill).filter(
                    UserSkill.user_id == user_id,
                    UserSkill.skill_name.ilike(skill_id)
                ).first()
                if not usk:
                    usk = UserSkill(
                        user_id=user_id,
                        skill_name=skill_id,
                        proficiency=new_lvl,
                        verified_level=new_lvl,
                        confidence="verified by assessment"
                    )
                    db.add(usk)
                else:
                    usk.verified_level = max(usk.verified_level or 0, new_lvl)
                    usk.confidence = "verified by assessment"

                db.commit()

            elif m_type == "ROADMAP_VERSION":
                # Persist offline adapted roadmap
                roadmap_data = payload.get("roadmap_data", {})
                target_role = payload.get("target_role", current_user.profile.target_role if current_user.profile else "Full Stack Developer")
                trigger_event = payload.get("trigger_event", "GOAL_CHANGED")

                if roadmap_data and "phases" in roadmap_data:
                    RoadmapService.persist_roadmap_version(
                        user_id=user_id,
                        target_role=target_role,
                        trigger_event=trigger_event,
                        roadmap_data=roadmap_data,
                        db=db
                    )

            # Record client mutation
            record = ClientMutation(
                user_id=user_id,
                client_uuid=item.client_uuid,
                mutation_type=m_type,
                status="APPLIED"
            )
            db.add(record)
            db.commit()

            results.append({
                "client_uuid": item.client_uuid,
                "type": item.type,
                "status": "APPLIED"
            })

        except Exception as e:
            logger.error(f"Error applying mutation {item.client_uuid}: {e}", exc_info=True)
            db.rollback()
            results.append({
                "client_uuid": item.client_uuid,
                "type": item.type,
                "status": "ERROR",
                "error": str(e)
            })

    return {
        "server_time": datetime.now(timezone.utc).isoformat(),
        "applied_count": sum(1 for r in results if r["status"] == "APPLIED"),
        "results": results
    }
