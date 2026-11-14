from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.agent_run import AgentRunTrace
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/agents", tags=["Agent Activity & Trace"])

@router.get("/runs")
def get_agent_traces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    traces = db.query(AgentRunTrace).filter(
        AgentRunTrace.user_id == current_user.id
    ).order_by(AgentRunTrace.created_at.desc()).limit(50).all()

    trace_list = [
        {
            "id": t.id,
            "event_name": t.event_name,
            "agent_name": t.agent_name,
            "input_summary": t.input_summary,
            "output_summary": t.output_summary,
            "duration_ms": t.duration_ms,
            "used_llm": t.used_llm,
            "status": t.status,
            "created_at": t.created_at.strftime("%H:%M:%S (%b %d)") if t.created_at else "Just now"
        }
        for t in traces
    ]

    # Hand-off visual graph topology
    nodes = [
        {"id": "orchestrator", "name": "Orchestrator", "type": "coordinator", "role": "Event dispatch & hand-offs"},
        {"id": "profile_analyst", "name": "Profile Analyst", "type": "worker", "role": "Skill graph normalization"},
        {"id": "career_matcher", "name": "Career Matcher", "type": "worker", "role": "Role gap & match scoring"},
        {"id": "skill_gap", "name": "Skill Gap Agent", "type": "worker", "role": "Prerequisite topological sort"},
        {"id": "curriculum_planner", "name": "Curriculum Planner", "type": "worker", "role": "Phased roadmap & hours budget"},
        {"id": "resource_recommender", "name": "Resource Recommender", "type": "worker", "role": "Curated catalog mapping"},
        {"id": "assessment_agent", "name": "Assessment Agent", "type": "evaluator", "role": "Quiz generation & grading"},
        {"id": "progress_evaluator", "name": "Progress Evaluator", "type": "evaluator", "role": "Velocity & struggle detection"},
        {"id": "mentor_agent", "name": "Mentor Agent", "type": "communicator", "role": "Guidance & SSE conversational stream"}
    ]

    edges = [
        {"from": "orchestrator", "to": "profile_analyst", "label": "Normalize profile"},
        {"from": "profile_analyst", "to": "career_matcher", "label": "Normalized skill graph"},
        {"from": "career_matcher", "to": "skill_gap", "label": "Identified gap deficits"},
        {"from": "skill_gap", "to": "curriculum_planner", "label": "Prioritized dependency order"},
        {"from": "curriculum_planner", "to": "resource_recommender", "label": "Phase roadmap structure"},
        {"from": "resource_recommender", "to": "progress_evaluator", "label": "Populated roadmap"},
        {"from": "progress_evaluator", "to": "mentor_agent", "label": "Readiness & health flags"},
        {"from": "assessment_agent", "to": "progress_evaluator", "label": "Assessment score trigger"}
    ]

    total_runs = len(trace_list)
    llm_runs = sum(1 for t in trace_list if t["used_llm"])
    fallback_runs = total_runs - llm_runs
    avg_latency = round(sum(t["duration_ms"] for t in trace_list) / max(total_runs, 1), 1)

    return {
        "traces": trace_list,
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_runs": total_runs,
            "llm_runs": llm_runs,
            "fallback_runs": fallback_runs,
            "avg_latency_ms": avg_latency
        }
    }
