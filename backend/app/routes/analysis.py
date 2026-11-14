import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.taxonomy import RoleTaxonomy, SkillTaxonomy
from app.models.user import User, Profile
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/analysis", tags=["Skill Analysis"])

@router.get("")
def get_skill_analysis(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role_name = profile.target_role if profile else "Full Stack Developer"

    # Find target role benchmark
    target_role_clean = target_role_name.lower().strip().replace(" ", "-")
    role = db.query(RoleTaxonomy).filter(
        (RoleTaxonomy.role_id == target_role_clean) | (RoleTaxonomy.title.ilike(target_role_name))
    ).first()
    role_reqs = json.loads(role.required_skills) if role else {}

    tax_skills = {s.skill_id: s for s in db.query(SkillTaxonomy).all()}

    # Compile user skills map
    user_skills_map = {}
    skills_list = []
    strengths = []
    weaknesses = []

    for s in current_user.skills:
        s_id = s.skill_name.lower().strip().replace(" ", "-")
        lvl = s.verified_level if s.verified_level is not None else s.proficiency
        user_skills_map[s_id] = {
            "name": tax_skills[s_id].name if s_id in tax_skills else s.skill_name,
            "level": lvl,
            "confidence": s.confidence,
            "verified_level": s.verified_level,
            "self_rated": s.proficiency
        }
        item_data = {
            "skill_id": s_id,
            "name": tax_skills[s_id].name if s_id in tax_skills else s.skill_name,
            "category": tax_skills[s_id].category if s_id in tax_skills else "General",
            "proficiency": lvl,
            "target_level": role_reqs.get(s_id, 3),
            "confidence": s.confidence,
            "verified_level": s.verified_level,
            "is_verified": s.confidence == "verified by assessment"
        }
        skills_list.append(item_data)

        if lvl >= 3:
            strengths.append(item_data)
        else:
            weaknesses.append(item_data)

    # Radar chart points (top 6-8 relevant skills comparing learner level vs role target level)
    radar_data = []
    radar_skills = list(role_reqs.keys())[:8] if role_reqs else ["html", "css", "javascript", "react", "nodejs", "sql", "git", "python"]
    for s_id in radar_skills:
        s_name = tax_skills[s_id].name if s_id in tax_skills else s_id.title()
        user_val = user_skills_map.get(s_id, {}).get("level", 0)
        target_val = role_reqs.get(s_id, 3)
        radar_data.append({
            "subject": s_name,
            "learner_level": user_val,
            "target_level": target_val,
            "full_mark": 5
        })

    # Category breakdown
    cat_scores = {}
    for item in skills_list:
        cat = item["category"]
        cat_scores.setdefault(cat, []).append(item["proficiency"])
    category_summary = [{"category": k, "avg_proficiency": round(sum(v)/len(v), 1)} for k, v in cat_scores.items()]

    return {
        "target_role": target_role_name,
        "radar_data": radar_data,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "all_skills": skills_list,
        "category_summary": category_summary,
        "readiness_pct": profile.readiness_pct if profile else 0.0
    }
