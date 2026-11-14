from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.taxonomy import ResourceItem

router = APIRouter(prefix="/api/resources", tags=["Resource Catalog"])

@router.get("")
def list_resources(
    skill_id: Optional[str] = Query(None),
    item_type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ResourceItem)
    if skill_id:
        query = query.filter(ResourceItem.skill_id == skill_id)
    if item_type:
        query = query.filter(ResourceItem.type == item_type)
    if difficulty:
        query = query.filter(ResourceItem.difficulty == difficulty)
    if search:
        query = query.filter(
            ResourceItem.title.ilike(f"%{search}%") | ResourceItem.description.ilike(f"%{search}%")
        )

    items = query.all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "type": r.type,
            "skill_id": r.skill_id,
            "difficulty": r.difficulty,
            "estimated_hours": r.estimated_hours,
            "provider": r.provider,
            "url": r.url,
            "description": r.description
        }
        for r in items
    ]
