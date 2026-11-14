import json
from typing import Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.taxonomy import RoleTaxonomy, SkillTaxonomy
from app.models.user import User, Profile
from app.services.auth_service import get_current_user
from app.agents.orchestrator import orchestrator
from app.schemas.agent import LearnerContext

router = APIRouter(prefix="/api/match", tags=["Career Match"])

@router.get("")
def get_career_match(
    role_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    selected_role_id = role_id or (profile.target_role.lower().replace(" ", "-") if profile else "full-stack-developer")

    roles = db.query(RoleTaxonomy).all()
    tax_skills = {s.skill_id: s.name for s in db.query(SkillTaxonomy).all()}

    user_skills = {s.skill_name.lower().replace(" ", "-"): (s.verified_level or s.proficiency) for s in current_user.skills}
    verified_skills = {s.skill_name.lower().replace(" ", "-"): s.verified_level for s in current_user.skills if s.verified_level}

    # Match across all roles to find top 3
    role_matches = []
    target_role_obj = None

    for r in roles:
        reqs = json.loads(r.required_skills) if r.required_skills else {}
        if not reqs:
            continue
        
        score_sum = 0.0
        for s_id, req_lvl in reqs.items():
            u_lvl = verified_skills.get(s_id, user_skills.get(s_id, 0))
            if u_lvl >= req_lvl:
                score_sum += 1.0
            elif u_lvl > 0:
                score_sum += (u_lvl / req_lvl)
        
        match_pct = round((score_sum / len(reqs)) * 100, 1)
        role_matches.append({
            "role_id": r.role_id,
            "title": r.title,
            "department": r.department,
            "match_pct": match_pct
        })

        if r.role_id == selected_role_id or r.title.lower() == selected_role_id.lower():
            target_role_obj = r

    if not target_role_obj and roles:
        target_role_obj = roles[0]

    role_matches.sort(key=lambda x: x["match_pct"], reverse=True)
    top_3_roles = role_matches[:3]

    # Detailed breakdown for selected role
    target_reqs = json.loads(target_role_obj.required_skills) if target_role_obj.required_skills else {}
    matched_skills = []
    missing_skills = []
    partial_skills = []
    total_score = 0.0

    for s_id, req_lvl in target_reqs.items():
        u_lvl = verified_skills.get(s_id, user_skills.get(s_id, 0))
        name = tax_skills.get(s_id, s_id.replace("-", " ").title())
        gap = max(0, req_lvl - u_lvl)

        if u_lvl >= req_lvl:
            status = "matched"
            total_score += 1.0
        elif u_lvl > 0:
            status = "partial"
            total_score += (u_lvl / req_lvl)
            partial_skills.append({
                "skill_id": s_id,
                "name": name,
                "current_level": u_lvl,
                "required_level": req_lvl,
                "gap": gap
            })
        else:
            status = "missing"
            missing_skills.append({
                "skill_id": s_id,
                "name": name,
                "current_level": 0,
                "required_level": req_lvl,
                "gap": req_lvl
            })

        matched_skills.append({
            "skill_id": s_id,
            "name": name,
            "current_level": u_lvl,
            "required_level": req_lvl,
            "status": status,
            "gap": gap
        })

    target_match_pct = round((total_score / max(len(target_reqs), 1)) * 100, 1)

    return {
        "role_id": target_role_obj.role_id,
        "title": target_role_obj.title,
        "department": target_role_obj.department,
        "description": target_role_obj.description,
        "match_percentage": target_match_pct,
        "matched_skills": matched_skills,
        "partial_skills": partial_skills,
        "missing_skills": missing_skills,
        "top_recommended_roles": top_3_roles
    }

@router.post("/select-role")
async def select_role(
    role_id: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Selects a new target role, triggers GOAL_CHANGED adaptive event,
    preserves completed skills, and generates an updated roadmap version with diff!
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    old_role = profile.target_role if profile else "Full Stack Developer"

    role_obj = db.query(RoleTaxonomy).filter(
        (RoleTaxonomy.role_id == role_id) | (RoleTaxonomy.title.ilike(role_id))
    ).first()
    new_role_title = role_obj.title if role_obj else role_id

    if profile:
        profile.target_role = new_role_title
        db.commit()

    # Build context for GOAL_CHANGED
    cur_skills = {s.skill_name.lower().replace(" ", "-"): s.proficiency for s in current_user.skills}
    ver_skills = {s.skill_name.lower().replace(" ", "-"): s.verified_level for s in current_user.skills if s.verified_level}

    ctx = LearnerContext(
        user_id=current_user.id,
        full_name=profile.full_name if profile else "Learner",
        education=profile.education if profile else "",
        target_role=new_role_title,
        weekly_hours=profile.weekly_hours if profile else 15,
        current_skills=cur_skills,
        verified_skills=ver_skills,
        trigger_event="GOAL_CHANGED",
        metadata={"old_target_role": old_role}
    )

    updated_ctx = await orchestrator.run(ctx, db)

    return {
        "status": "success",
        "old_role": old_role,
        "new_role": new_role_title,
        "replan_diff": updated_ctx.metadata.get("roadmap_diff", ""),
        "mentor_message": updated_ctx.mentor_message,
        "new_roadmap_version": updated_ctx.metadata.get("active_roadmap_version", 1)
    }
