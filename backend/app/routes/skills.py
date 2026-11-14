import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.taxonomy import SkillTaxonomy

router = APIRouter(prefix="/api/skills", tags=["Skills Taxonomy"])

@router.get("")
def list_skills(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(SkillTaxonomy)
    if category:
        query = query.filter(SkillTaxonomy.category == category)
    if search:
        query = query.filter(
            SkillTaxonomy.name.ilike(f"%{search}%") | SkillTaxonomy.skill_id.ilike(f"%{search}%")
        )
    
    results = query.all()
    out = []
    for s in results:
        prereqs = json.loads(s.prerequisites) if s.prerequisites else []
        out.append({
            "skill_id": s.skill_id,
            "name": s.name,
            "category": s.category,
            "description": s.description,
            "prerequisites": prereqs
        })
    return out

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(SkillTaxonomy.category).distinct().all()
    return [c[0] for c in categories]
