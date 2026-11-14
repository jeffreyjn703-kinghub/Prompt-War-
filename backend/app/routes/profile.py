from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile, UserSkill, Certification, Project
from app.schemas.profile import ProfileResponse, ProfileUpdate, UserSkillItem, CertificationItem, ProjectItem
from app.services.auth_service import get_current_user
from app.agents.orchestrator import orchestrator
from app.schemas.agent import LearnerContext

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, full_name="Learner")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = [
        UserSkillItem(
            skill_name=s.skill_name,
            proficiency=s.proficiency,
            verified_level=s.verified_level,
            confidence=s.confidence,
            last_assessed_at=s.last_assessed_at
        )
        for s in current_user.skills
    ]

    certs = [
        CertificationItem(name=c.name, issuer=c.issuer, issue_date=c.issue_date)
        for c in current_user.certifications
    ]

    projs = [
        ProjectItem(title=p.title, description=p.description, skills_used=p.skills_used)
        for p in current_user.projects
    ]

    return ProfileResponse(
        user_id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        education=profile.education,
        target_role=profile.target_role,
        weekly_hours=profile.weekly_hours,
        readiness_pct=profile.readiness_pct,
        streak_days=profile.streak_days,
        skills=skills,
        certifications=certs,
        projects=projs,
        last_active_at=profile.last_active_at
    )

@router.put("", response_model=ProfileResponse)
async def update_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    target_role_changed = False
    old_target_role = profile.target_role

    if update_data.full_name is not None:
        profile.full_name = update_data.full_name
    if update_data.education is not None:
        profile.education = update_data.education
    if update_data.target_role is not None and update_data.target_role != old_target_role:
        profile.target_role = update_data.target_role
        target_role_changed = True
    if update_data.weekly_hours is not None:
        profile.weekly_hours = update_data.weekly_hours

    # Update skills if provided
    if update_data.skills is not None:
        # Keep verified levels if existing
        verified_cache = {s.skill_name.lower(): (s.verified_level, s.confidence) for s in current_user.skills if s.verified_level}
        db.query(UserSkill).filter(UserSkill.user_id == current_user.id).delete()
        for s in update_data.skills:
            v_lvl, conf = verified_cache.get(s.skill_name.lower(), (s.verified_level, s.confidence))
            db.add(UserSkill(
                user_id=current_user.id,
                skill_name=s.skill_name,
                proficiency=s.proficiency,
                verified_level=v_lvl,
                confidence=conf
            ))

    # Update certifications
    if update_data.certifications is not None:
        db.query(Certification).filter(Certification.user_id == current_user.id).delete()
        for c in update_data.certifications:
            db.add(Certification(
                user_id=current_user.id,
                name=c.name,
                issuer=c.issuer,
                issue_date=c.issue_date
            ))

    # Update projects
    if update_data.projects is not None:
        db.query(Project).filter(Project.user_id == current_user.id).delete()
        for p in update_data.projects:
            db.add(Project(
                user_id=current_user.id,
                title=p.title,
                description=p.description,
                skills_used=p.skills_used
            ))

    db.commit()
    db.refresh(profile)

    # If target role changed, trigger GOAL_CHANGED adaptive event
    if target_role_changed:
        cur_skills = {s.skill_name.lower(): s.proficiency for s in current_user.skills}
        ver_skills = {s.skill_name.lower(): s.verified_level for s in current_user.skills if s.verified_level}
        ctx = LearnerContext(
            user_id=current_user.id,
            full_name=profile.full_name,
            education=profile.education,
            target_role=profile.target_role,
            weekly_hours=profile.weekly_hours,
            current_skills=cur_skills,
            verified_skills=ver_skills,
            trigger_event="GOAL_CHANGED",
            metadata={"old_target_role": old_target_role}
        )
        await orchestrator.run(ctx, db)

    return get_profile(current_user=current_user, db=db)
