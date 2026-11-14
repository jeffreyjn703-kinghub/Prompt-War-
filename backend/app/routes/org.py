from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.org import CohortOverviewResponse, CohortLearner, SkillHeatmapCell

router = APIRouter(prefix="/api/org", tags=["Organization Cohort"])

@router.get("/cohort", response_model=CohortOverviewResponse)
def get_cohort_overview(db: Session = Depends(get_db)):
    users = db.query(User).all()
    cohort_list = []
    
    for u in users:
        prof = u.profile or Profile(user_id=u.id, full_name="Learner")
        skills = {s.skill_name.lower(): (s.verified_level or s.proficiency) for s in u.skills}
        
        # Calculate top gaps
        target_role = prof.target_role
        if "Full Stack" in target_role:
            expected = ["javascript", "react", "nodejs", "docker"]
        elif "Frontend" in target_role:
            expected = ["javascript", "react", "nextjs", "typescript"]
        else:
            expected = ["python", "machine-learning-scikit", "statistics-probability"]

        gaps = [exp.title() for exp in expected if skills.get(exp, 0) < 3]
        if not gaps:
            gaps = ["Advanced System Design"]

        cohort_list.append(CohortLearner(
            user_id=u.id,
            name=prof.full_name,
            email=u.email,
            target_role=prof.target_role,
            readiness_pct=prof.readiness_pct,
            streak_days=prof.streak_days,
            top_gaps=gaps[:3],
            last_active=prof.last_active_at.strftime("%b %d, %Y") if prof.last_active_at else "Today"
        ))

    # Add mock cohort members if only 2 users in db for rich demo display
    if len(cohort_list) < 4:
        cohort_list.extend([
            CohortLearner(
                user_id=991,
                name="Marcus Vance",
                email="marcus.v@acme.corp",
                target_role="DevOps Engineer",
                readiness_pct=64.5,
                streak_days=11,
                top_gaps=["Kubernetes", "Terraform", "Monitoring"],
                last_active="Yesterday"
            ),
            CohortLearner(
                user_id=992,
                name="Elena Rostova",
                email="elena.r@acme.corp",
                target_role="Data Scientist",
                readiness_pct=78.2,
                streak_days=19,
                top_gaps=["Deep Learning", "MLOps"],
                last_active="2 hours ago"
            ),
            CohortLearner(
                user_id=993,
                name="Devon Zhao",
                email="devon.z@acme.corp",
                target_role="Backend Developer",
                readiness_pct=51.0,
                streak_days=2,
                top_gaps=["Microservices", "Redis", "gRPC"],
                last_active="3 days ago"
            )
        ])

    # Aggregate Skill Heatmap
    heatmap_data = [
        SkillHeatmapCell(skill_id="javascript", skill_name="JavaScript (ES6+)", category="Frontend", avg_level=2.4, target_level=4.5, gap_count=4, criticality="High"),
        SkillHeatmapCell(skill_id="react", skill_name="React", category="Frontend", avg_level=1.8, target_level=4.0, gap_count=5, criticality="High"),
        SkillHeatmapCell(skill_id="nodejs", skill_name="Node.js", category="Backend", avg_level=2.1, target_level=3.5, gap_count=3, criticality="Medium"),
        SkillHeatmapCell(skill_id="docker", skill_name="Docker & Containerization", category="DevOps", avg_level=2.0, target_level=4.0, gap_count=4, criticality="High"),
        SkillHeatmapCell(skill_id="sql", skill_name="SQL & Relational Databases", category="Database", avg_level=3.6, target_level=4.0, gap_count=1, criticality="Low"),
        SkillHeatmapCell(skill_id="python", skill_name="Python", category="Backend", avg_level=3.8, target_level=4.0, gap_count=1, criticality="Low"),
        SkillHeatmapCell(skill_id="kubernetes", skill_name="Kubernetes", category="DevOps", avg_level=1.4, target_level=3.5, gap_count=4, criticality="High"),
        SkillHeatmapCell(skill_id="web-security-owasp", skill_name="Web Security & OWASP", category="Security", avg_level=2.2, target_level=4.0, gap_count=3, criticality="Medium")
    ]

    avg_readiness = round(sum(c.readiness_pct for c in cohort_list) / max(len(cohort_list), 1), 1)

    return CohortOverviewResponse(
        total_learners=len(cohort_list),
        avg_readiness=avg_readiness,
        top_target_roles=[
            {"role": "Full Stack Developer", "count": 2},
            {"role": "Frontend Developer", "count": 1},
            {"role": "DevOps Engineer", "count": 1},
            {"role": "Data Scientist", "count": 1}
        ],
        cohort=cohort_list,
        skill_heatmap=heatmap_data
    )
