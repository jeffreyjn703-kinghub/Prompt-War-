import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.roadmap import RoadmapVersion, RoadmapPhase, RoadmapItem
from app.models.user import UserSkill

class RoadmapService:
    @staticmethod
    def persist_roadmap_version(
        user_id: int,
        target_role: str,
        trigger_event: str,
        roadmap_data: Dict[str, Any],
        db: Session
    ) -> RoadmapVersion:
        """
        Deactivates previous roadmap versions and creates a new versioned snapshot with diff summary.
        Preserves previously completed items!
        """
        # 1. Fetch current active version
        old_active = db.query(RoadmapVersion).filter(
            RoadmapVersion.user_id == user_id,
            RoadmapVersion.is_active == True
        ).first()

        old_version_num = old_active.version_number if old_active else 0
        new_version_num = old_version_num + 1

        # 2. Collect completed items from old version
        completed_titles = set()
        completed_skills = set()
        if old_active:
            for p in old_active.phases:
                for it in p.items:
                    if it.is_completed:
                        completed_titles.add(it.title.lower())
                        completed_skills.add(it.skill_id)

        # 3. Deactivate old version
        if old_active:
            old_active.is_active = False

        # 4. Formulate human-readable diff
        diff_text = RoadmapService.generate_version_diff(
            old_version=old_version_num,
            new_version=new_version_num,
            trigger_event=trigger_event,
            target_role=target_role,
            roadmap_data=roadmap_data,
            preserved_skills=list(completed_skills)
        )

        phases_data = roadmap_data.get("phases", [])
        total_hours = roadmap_data.get("total_estimated_hours", 0)

        # 5. Create new RoadmapVersion
        new_version = RoadmapVersion(
            user_id=user_id,
            version_number=new_version_num,
            target_role=target_role,
            trigger_event=trigger_event,
            reason_diff=diff_text,
            total_phases=len(phases_data),
            total_hours=total_hours,
            is_active=True
        )
        db.add(new_version)
        db.flush()

        # 6. Create RoadmapPhases and RoadmapItems
        for p_idx, p_data in enumerate(phases_data, 1):
            phase = RoadmapPhase(
                roadmap_version_id=new_version.id,
                phase_number=p_idx,
                title=p_data.get("title", f"Phase {p_idx}"),
                description=p_data.get("description", ""),
                estimated_hours=p_data.get("estimated_hours", 10),
                is_remedial=p_data.get("is_remedial", False),
                is_completed=False
            )
            db.add(phase)
            db.flush()

            items_data = p_data.get("items", [])
            for it_idx, it_data in enumerate(items_data):
                is_done = it_data.get("title", "").lower() in completed_titles
                item = RoadmapItem(
                    phase_id=phase.id,
                    user_id=user_id,
                    skill_id=it_data.get("skill_id", "general"),
                    title=it_data.get("title", "Topic module"),
                    item_type=it_data.get("item_type", "course"),
                    estimated_hours=it_data.get("estimated_hours", 4),
                    rationale=it_data.get("rationale", ""),
                    provider=it_data.get("provider", "freeCodeCamp"),
                    url=it_data.get("url", ""),
                    is_completed=is_done,
                    completed_at=datetime.now(timezone.utc) if is_done else None,
                    sort_order=it_idx
                )
                db.add(item)

        db.commit()
        db.refresh(new_version)
        return new_version

    @staticmethod
    def generate_version_diff(
        old_version: int,
        new_version: int,
        trigger_event: str,
        target_role: str,
        roadmap_data: Dict[str, Any],
        preserved_skills: List[str]
    ) -> str:
        phases = roadmap_data.get("phases", [])
        remedial = [p["title"] for p in phases if p.get("is_remedial")]

        diff_lines = [
            f"### Roadmap Evolution: Version {old_version} -> Version {new_version}",
            f"- **Trigger Event:** `{trigger_event}`",
            f"- **Target Benchmark:** `{target_role}`",
            f"- **Total Phases:** {len(phases)} phases ({roadmap_data.get('total_estimated_hours', 0)} total hours)"
        ]

        if trigger_event == "ASSESSMENT_POOR":
            diff_lines.append(
                f"- **Adaptive Action [ASSESSMENT_POOR]:** Injected dedicated **{remedial[0] if remedial else 'Remedial Phase'}** "
                f"with foundational interactive drills before resuming progression."
            )
        elif trigger_event == "GOAL_CHANGED":
            diff_lines.append(
                f"- **Adaptive Action [GOAL_CHANGED]:** Re-anchored milestones to {target_role}. "
                f"Preserved {len(preserved_skills)} previously mastered competencies: {', '.join(preserved_skills) if preserved_skills else 'None yet'}."
            )
        elif trigger_event == "ASSESSMENT_STRONG":
            diff_lines.append(
                "- **Adaptive Action [ASSESSMENT_STRONG]:** Validated advanced mastery. "
                "Compressed introductory modules and advanced timeline."
            )
        elif trigger_event == "PROGRESS_STALLED":
            diff_lines.append(
                "- **Adaptive Action [PROGRESS_STALLED]:** Modulated weekly hour commitments into bite-sized momentum milestones."
            )
        else:
            diff_lines.append(
                "- **Initial Architecture:** Synthesized personalized roadmap through multi-agent collaboration."
            )

        return "\n".join(diff_lines)
