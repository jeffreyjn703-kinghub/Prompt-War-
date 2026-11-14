import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_api_health_and_demo_login():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # 2. Demo Login for Arjun Kumar
        login_res = client.post("/api/auth/demo-login?learner=demo")
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        assert token_data["email"] == "demo@vyntrixa.ai"
        assert token_data["full_name"] == "Arjun Kumar"
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Profile
        prof_res = client.get("/api/profile", headers=headers)
        assert prof_res.status_code == 200
        prof = prof_res.json()
        assert prof["target_role"] == "Full Stack Developer"
        assert len(prof["skills"]) >= 3

        # 4. Skills Taxonomy
        skills_res = client.get("/api/skills")
        assert skills_res.status_code == 200
        skills = skills_res.json()
        assert len(skills) >= 80 # Must have 80+ skills

        # 5. Roles Taxonomy
        roles_res = client.get("/api/roles")
        assert roles_res.status_code == 200
        roles = roles_res.json()
        assert len(roles) == 9 # Exactly 9 roles

        # 6. Skill Analysis (Radar + Confidence)
        analysis_res = client.get("/api/analysis", headers=headers)
        assert analysis_res.status_code == 200
        analysis = analysis_res.json()
        assert "radar_data" in analysis
        assert len(analysis["radar_data"]) >= 6

        # 7. Career Match
        match_res = client.get("/api/match", headers=headers)
        assert match_res.status_code == 200
        match = match_res.json()
        assert "match_percentage" in match
        assert len(match["top_recommended_roles"]) == 3

        # 8. Active Roadmap
        roadmap_res = client.get("/api/roadmap", headers=headers)
        assert roadmap_res.status_code == 200
        roadmap = roadmap_res.json()
        assert len(roadmap["phases"]) >= 2
        assert "reason_diff" in roadmap

        # 9. Assessment Generation
        quiz_res = client.get("/api/assessments/generate/javascript", headers=headers)
        assert quiz_res.status_code == 200
        quiz = quiz_res.json()
        assert len(quiz["questions"]) >= 8

        # 10. Agent Activity / Runs
        agents_res = client.get("/api/agents/runs", headers=headers)
        assert agents_res.status_code == 200
        agents_data = agents_res.json()
        assert len(agents_data["traces"]) > 0
        assert len(agents_data["nodes"]) >= 7

        # 11. Org Cohort
        org_res = client.get("/api/org/cohort")
        assert org_res.status_code == 200
        org_data = org_res.json()
        assert len(org_data["cohort"]) >= 2
        assert len(org_data["skill_heatmap"]) >= 6

def test_security_headers():
    with TestClient(app) as client:
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.headers.get("X-Content-Type-Options") == "nosniff"
        assert res.headers.get("X-Frame-Options") == "DENY"
        assert res.headers.get("X-XSS-Protection") == "1; mode=block"
        assert "strict-origin" in res.headers.get("Referrer-Policy", "")
        assert "max-age=31536000" in res.headers.get("Strict-Transport-Security", "")

def test_auth_registration_and_validation():
    import uuid
    unique_email = f"user_{uuid.uuid4().hex[:8]}@vyntrixa.ai"
    with TestClient(app) as client:
        # Valid registration
        res = client.post("/api/auth/register", json={
            "email": unique_email,
            "password": "SecurePassword123!",
            "full_name": "Test Learner"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["email"] == unique_email

        # Duplicate registration should fail
        dup_res = client.post("/api/auth/register", json={
            "email": unique_email,
            "password": "SecurePassword123!",
            "full_name": "Test Learner"
        })
        assert dup_res.status_code == 400

        # Invalid login password
        bad_login = client.post("/api/auth/login", json={
            "email": unique_email,
            "password": "WrongPassword999!"
        })
        assert bad_login.status_code == 401

def test_assessment_submit_and_evaluation():
    with TestClient(app) as client:
        login_res = client.post("/api/auth/demo-login?learner=demo")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # First fetch quiz to get actual question ID
        quiz_res = client.get("/api/assessments/generate/javascript", headers=headers)
        assert quiz_res.status_code == 200
        quiz = quiz_res.json()
        q_id = quiz["questions"][0]["id"]

        # Submit assessment
        submit_res = client.post(
            "/api/assessments/submit",
            headers=headers,
            json={
                "skill_id": "javascript",
                "answers": {
                    q_id: 0
                }
            }
        )
        assert submit_res.status_code in [200, 201]
        data = submit_res.json()
        assert "score_pct" in data
        assert "passed" in data

def test_mentor_guidance_and_chat():
    with TestClient(app) as client:
        login_res = client.post("/api/auth/demo-login?learner=demo")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Mentor proactive guidance
        guidance_res = client.get("/api/mentor/guidance", headers=headers)
        assert guidance_res.status_code == 200
        data = guidance_res.json()
        assert "message" in data
        assert "action_suggestion" in data

        # Mentor chat stream check
        chat_res = client.get("/api/mentor/chat?message=Hello", headers=headers)
        assert chat_res.status_code == 200

def test_sync_bootstrap_and_push():
    with TestClient(app) as client:
        login_res = client.post("/api/auth/demo-login?learner=demo")
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Offline bootstrap sync
        bootstrap_res = client.get("/api/sync/bootstrap", headers=headers)
        assert bootstrap_res.status_code == 200
        data = bootstrap_res.json()
        assert "profile" in data
        assert "active_roadmap" in data
        assert "server_time" in data

