import json
import logging
from sqlalchemy.orm import Session
from app.data.seed.skills import SKILL_TAXONOMY_SEED
from app.data.seed.roles import ROLE_TAXONOMY_SEED
from app.data.seed.resources import RESOURCE_ITEMS_SEED
from app.data.seed.questions import QUESTION_BANK_SEED
from app.models.taxonomy import SkillTaxonomy, RoleTaxonomy, ResourceItem, QuizQuestion
from app.models.user import User, Profile, UserSkill, Certification, Project
from app.models.progress import AssessmentAttempt
from app.services.auth_service import hash_password
from app.agents.orchestrator import orchestrator
from app.schemas.agent import LearnerContext

logger = logging.getLogger("vyntrixa.seeder")

def seed_database(db: Session):
    """
    Seeds skills, roles, resources, questions, Demo Learner, and Adaptive Demo Learner.
    """
    logger.info("Initializing database seed check...")

    # 1. Seed Skills Taxonomy (80+)
    if db.query(SkillTaxonomy).count() == 0:
        logger.info(f"Seeding {len(SKILL_TAXONOMY_SEED)} skills into taxonomy...")
        for s in SKILL_TAXONOMY_SEED:
            item = SkillTaxonomy(
                skill_id=s["skill_id"],
                name=s["name"],
                category=s["category"],
                description=s["description"],
                prerequisites=json.dumps(s.get("prerequisites", []))
            )
            db.add(item)
        db.commit()

    # 2. Seed Roles Taxonomy (9 Roles)
    if db.query(RoleTaxonomy).count() == 0:
        logger.info(f"Seeding {len(ROLE_TAXONOMY_SEED)} job roles into taxonomy...")
        for r in ROLE_TAXONOMY_SEED:
            role = RoleTaxonomy(
                role_id=r["role_id"],
                title=r["title"],
                department=r["department"],
                description=r["description"],
                required_skills=json.dumps(r["required_skills"])
            )
            db.add(role)
        db.commit()

    # 3. Seed Resource Catalog (120+ Items)
    if db.query(ResourceItem).count() == 0:
        logger.info(f"Seeding {len(RESOURCE_ITEMS_SEED)} learning resources...")
        for res in RESOURCE_ITEMS_SEED:
            item = ResourceItem(
                title=res["title"],
                type=res["type"],
                skill_id=res["skill_id"],
                difficulty=res.get("difficulty", "intermediate"),
                estimated_hours=res.get("estimated_hours", 5),
                provider=res.get("provider", "freeCodeCamp"),
                url=res["url"],
                description=res.get("description", "")
            )
            db.add(item)
        db.commit()

    # 4. Seed Question Bank
    if db.query(QuizQuestion).count() == 0:
        logger.info("Seeding question bank for core skills...")
        for skill_id, content in QUESTION_BANK_SEED.items():
            for mcq in content.get("mcqs", []):
                q = QuizQuestion(
                    skill_id=skill_id,
                    question_text=mcq["question_text"],
                    question_type="mcq",
                    options=json.dumps(mcq["options"]),
                    correct_answer=mcq["correct_answer"],
                    explanation=mcq.get("explanation", ""),
                    difficulty=mcq.get("difficulty", "intermediate")
                )
                db.add(q)
            prac = content.get("practical")
            if prac:
                pq = QuizQuestion(
                    skill_id=skill_id,
                    question_text=prac["question_text"],
                    question_type="practical",
                    practical_rubric=prac.get("rubric", ""),
                    explanation="Practical implementation coding challenge",
                    difficulty=prac.get("difficulty", "intermediate")
                )
                db.add(pq)
        db.commit()

    # 5. Seed Demo Learner (Arjun Kumar)
    # Migrate any legacy demo user from skillpath.ai to vyntrixa.ai
    legacy_demo = db.query(User).filter(User.email == "demo@skillpath.ai").first()
    if legacy_demo:
        legacy_demo.email = "demo@vyntrixa.ai"
        db.commit()

    demo_email = "demo@vyntrixa.ai"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        logger.info("Seeding Demo Learner (Arjun Kumar: Python 4, SQL 3, HTML 2 -> Full Stack Developer, Readiness 32%)...")
        demo_user = User(
            email=demo_email,
            hashed_password=hash_password("demo1234"),
            is_demo=True
        )
        db.add(demo_user)
        db.flush()

        profile = Profile(
            user_id=demo_user.id,
            full_name="Arjun Kumar",
            education="B.E. CSE Student",
            target_role="Full Stack Developer",
            weekly_hours=10,
            readiness_pct=32.0,
            streak_days=6
        )
        db.add(profile)

        # Seed initial skills
        skills_to_seed = [
            ("python", 4, None, "self-rated"),
            ("sql", 3, None, "self-rated"),
            ("html", 2, None, "self-rated")
        ]
        for s_name, prof, ver, conf in skills_to_seed:
            db.add(UserSkill(
                user_id=demo_user.id,
                skill_name=s_name,
                proficiency=prof,
                verified_level=ver,
                confidence=conf
            ))

        db.add(Certification(
            user_id=demo_user.id,
            name="Python for Everybody (Coursera)",
            issuer="University of Michigan",
            issue_date="2024"
        ))

        db.add(Project(
            user_id=demo_user.id,
            title="Library Management API with Python & SQLite",
            description="Designed relational schema with SQLAlchemy, built CRUD endpoints, and containerized service.",
            skills_used="Python, SQL, PostgreSQL, Docker"
        ))
        db.commit()

        # Run initial orchestration pipeline to generate full roadmap for Sarah Chen
        init_context = LearnerContext(
            user_id=demo_user.id,
            full_name=profile.full_name,
            education=profile.education,
            target_role=profile.target_role,
            weekly_hours=profile.weekly_hours,
            current_skills={"python": 4, "sql": 3, "html": 2},
            verified_skills={},
            certifications=["AWS Certified Cloud Practitioner"],
            projects=["E-Commerce API with FastAPI and PostgreSQL"],
            trigger_event="INITIAL"
        )
        import asyncio
        import concurrent.futures

        def run_sync(coro):
            try:
                loop = asyncio.get_running_loop()
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    return pool.submit(asyncio.run, coro).result()
            except RuntimeError:
                return asyncio.run(coro)

        run_sync(orchestrator.run(init_context, db))

    # 6. Seed Second Learner (Alex Rivera) with immediate adaptive demoable scenario (poor assessment -> remedial phase)
    legacy_alex = db.query(User).filter(User.email == "alex@skillpath.ai").first()
    if legacy_alex:
        legacy_alex.email = "alex@vyntrixa.ai"
        db.commit()

    alex_email = "alex@vyntrixa.ai"
    alex_user = db.query(User).filter(User.email == alex_email).first()
    if not alex_user:
        logger.info("Seeding Adaptive Demo Learner (Alex Rivera: Poor JS Assessment -> Remedial Phase Active)...")
        alex_user = User(
            email=alex_email,
            hashed_password=hash_password("alex1234"),
            is_demo=False
        )
        db.add(alex_user)
        db.flush()

        alex_profile = Profile(
            user_id=alex_user.id,
            full_name="Alex Rivera",
            education="Self-Taught Web Developer",
            target_role="Frontend Developer",
            weekly_hours=12,
            readiness_pct=42.0,
            streak_days=4
        )
        db.add(alex_profile)

        # Seed skills
        alex_skills = [
            ("html", 4, 4, "verified by assessment"),
            ("css", 4, 3, "verified by assessment"),
            ("javascript", 2, 1, "verified by assessment")
        ]
        for s_name, prof, ver, conf in alex_skills:
            db.add(UserSkill(
                user_id=alex_user.id,
                skill_name=s_name,
                proficiency=prof,
                verified_level=ver,
                confidence=conf
            ))

        # Record a poor assessment score (38%)
        attempt = AssessmentAttempt(
            user_id=alex_user.id,
            skill_id="javascript",
            score_pct=38.0,
            passed=False,
            total_questions=10,
            correct_questions=3,
            practical_feedback="Practical debounce implementation missed timer cleanup and closure state.",
            weak_topics=json.dumps(["Event loop execution order", "Lexical closures", "Promise error chaining"]),
            trigger_action="ASSESSMENT_POOR"
        )
        db.add(attempt)
        db.commit()

        # Run adaptive ASSESSMENT_POOR pipeline for Alex
        alex_context = LearnerContext(
            user_id=alex_user.id,
            full_name=alex_profile.full_name,
            education=alex_profile.education,
            target_role=alex_profile.target_role,
            weekly_hours=alex_profile.weekly_hours,
            current_skills={"html": 4, "css": 4, "javascript": 2},
            verified_skills={"html": 4, "css": 3, "javascript": 1},
            trigger_event="ASSESSMENT_POOR",
            assessment_result={
                "skill_id": "javascript",
                "score_pct": 38.0,
                "weak_topics": ["Event loop execution order", "Lexical closures", "Promise error chaining"]
            }
        )
        run_sync(orchestrator.run(alex_context, db))

    logger.info("Database seeding complete!")
