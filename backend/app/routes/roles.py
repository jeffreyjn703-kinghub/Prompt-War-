import hashlib
import json
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.taxonomy import RoleTaxonomy

router = APIRouter(prefix="/api/roles", tags=["Role Taxonomy"])

@router.get("")
def list_roles(response: Response, db: Session = Depends(get_db)):
    roles = db.query(RoleTaxonomy).all()
    out = []
    for r in roles:
        reqs = json.loads(r.required_skills) if r.required_skills else {}
        out.append({
            "role_id": r.role_id,
            "title": r.title,
            "department": r.department,
            "description": r.description,
            "required_skills": reqs,
            "total_skills_count": len(reqs)
        })
    body_str = json.dumps(out, sort_keys=True)
    etag = f'"{hashlib.md5(body_str.encode()).hexdigest()}"'
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=86400, stale-while-revalidate=604800"
    response.headers["Last-Modified"] = "Sun, 01 Jan 2026 00:00:00 GMT"
    return out
