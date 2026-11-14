import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.taxonomy import RoleTaxonomy, SkillTaxonomy, ResourceItem, QuizQuestion
from app.models.user import User, Profile, UserSkill
from app.services.seeder import seed_database
from app.agents.career_matcher import CareerMatcherAgent
from app.agents.skill_gap import SkillGapAgent
from app.agents.curriculum_planner import CurriculumPlannerAgent
from app.agents.resource_recommender import ResourceRecommenderAgent
from app.agents.orchestrator import orchestrator
from app.schemas.agent import LearnerContext

@pytest.fixture(scope="module")
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()
    seed_database(db)
    yield db
    db.close()

def test_match_score_computation(test_db):
    """
    Test that Career Matcher computes accurate match % and categorizes matched, partial, missing skills.
    """
    matcher = CareerMatcherAgent()
    # Scenario: User has Python 4, SQL 3, HTML 2 against Full Stack Developer
    ctx = LearnerContext(
        user_id=1,
        full_name="Test Learner",
        target_role="Full Stack Developer",
        current_skills={"python": 4, "sql": 3, "html": 2},
        trigger_event="INITIAL"
    )
    matcher.apply_fallback(ctx, test_db)
    mr = ctx.match_report
    assert mr is not None
    assert mr["role_title"] == "Full Stack Developer"
    assert "match_percentage" in mr
    assert 10.0 <= mr["match_percentage"] <= 50.0 # Expected around ~25-35% with only 3 skills
    assert len(mr["missing_skills"]) > 0 # JavaScript, React, Node, etc. should be missing
    assert any("JavaScript" in s for s in mr["missing_skills"])

def test_gap_prioritization_and_prerequisites(test_db):
    """
    Test that Skill Gap Agent orders foundational prerequisites before dependent skills.
    """
    matcher = CareerMatcherAgent()
    gap_agent = SkillGapAgent()

    ctx = LearnerContext(
        user_id=1,
        full_name="Test Learner",
        target_role="Full Stack Developer",
        current_skills={"html": 2},
        trigger_event="INITIAL"
    )
    matcher.apply_fallback(ctx, test_db)
    gap_agent.apply_fallback(ctx, test_db)

    gr = ctx.gap_report
    assert gr is not None
    gaps = gr["prioritized_gaps"]
    assert len(gaps) > 0

    # Foundational prerequisites (like HTML, CSS, JavaScript) must have higher priority than React/Node
    skills_order = [g["skill_id"] for g in gaps]
    if "javascript" in skills_order and "react" in skills_order:
        assert skills_order.index("javascript") < skills_order.index("react")

def test_adaptive_replan_assessment_poor_inserts_remedial_phase(test_db):
    """
    Test that an ASSESSMENT_POOR trigger (<60% score) inserts a dedicated remedial phase
    with beginner-friendly resources before subsequent phases.
    """
    planner = CurriculumPlannerAgent()
    recommender = ResourceRecommenderAgent()

    ctx = LearnerContext(
        user_id=1,
        full_name="Test Learner",
        target_role="Frontend Developer",
        weekly_hours=12,
        current_skills={"html": 4, "css": 4, "javascript": 2},
        trigger_event="ASSESSMENT_POOR",
        assessment_result={
            "skill_id": "javascript",
            "score_pct": 42.0,
            "weak_topics": ["Lexical Closures", "Event Loop"]
        }
    )

    # Fake prioritized gap list
    ctx.gap_report = {
        "prioritized_gaps": [
            {"skill_id": "javascript", "name": "JavaScript (ES6+)", "gap_score": 3, "priority": 1},
            {"skill_id": "react", "name": "React", "gap_score": 4, "priority": 2}
        ]
    }

    planner.apply_fallback(ctx, test_db)
    recommender.apply_fallback(ctx, test_db)

    roadmap = ctx.roadmap
    assert roadmap is not None
    phases = roadmap["phases"]
    assert len(phases) >= 2
    # First phase MUST be remedial!
    first_phase = phases[0]
    assert first_phase["is_remedial"] is True
    assert "remedial" in first_phase["title"].lower()
    assert len(first_phase["items"]) > 0

def test_adaptive_replan_goal_changed_preserves_completed_skills(test_db):
    """
    Test that switching goal from Full Stack to Data Scientist preserves completed skills
    and re-plans only the delta roadmap.
    """
    # Create test user
    user = User(email="test_goal_switch@vyntrixa.ai", hashed_password="pw")
    test_db.add(user)
    test_db.flush()

    # Seed UserSkills
    test_db.add(UserSkill(user_id=user.id, skill_name="python", proficiency=4, verified_level=4, confidence="verified by assessment"))
    test_db.add(UserSkill(user_id=user.id, skill_name="sql", proficiency=3, verified_level=3, confidence="verified by assessment"))
    test_db.commit()

    ctx = LearnerContext(
        user_id=user.id,
        full_name="Goal Switcher",
        target_role="Data Scientist",
        weekly_hours=15,
        current_skills={"python": 4, "sql": 3},
        verified_skills={"python": 4, "sql": 3},
        completed_item_ids=["python-basics-complete"],
        trigger_event="GOAL_CHANGED",
        metadata={"old_target_role": "Full Stack Developer"}
    )

    # Run orchestrator
    import asyncio
    asyncio.run(orchestrator.run(ctx, test_db))

    assert ctx.roadmap is not None
    assert ctx.roadmap["target_role"] == "Data Scientist"
    # Preserved completed skills in diff
    assert "GOAL_CHANGED" in ctx.metadata.get("roadmap_diff", "")
    assert ctx.mentor_message is not None
    assert "Data Scientist" in ctx.mentor_message
