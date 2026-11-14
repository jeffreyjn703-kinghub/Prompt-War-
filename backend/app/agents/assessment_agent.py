import json
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.data.seed.questions import QUESTION_BANK_SEED
from app.models.taxonomy import QuizQuestion, SkillTaxonomy
from app.models.user import UserSkill
from app.models.progress import AssessmentAttempt
from app.schemas.agent import LearnerContext

class AssessmentAgent(BaseAgent):
    name: str = "Assessment Agent"
    description: str = "Generates targeted quizzes (8-10 MCQs + 1 practical challenge), evaluates student submissions, and validates verified skill levels."
    system_prompt: str = """You are the Assessment Agent for SkillPath AI.
Generate balanced, rigorous technical assessments consisting of multiple-choice questions plus a practical coding scenario.
Grade submissions objectively, pinpoint weak subtopics, and award verified proficiency levels.
"""

    def generate_quiz(self, skill_id: str, db: Session) -> Dict[str, Any]:
        """
        Retrieves quiz for the skill. Checks DB questions or fallback question bank.
        """
        db_questions = db.query(QuizQuestion).filter(QuizQuestion.skill_id == skill_id).all()
        
        # If not in DB, populate from seed question bank
        if not db_questions and skill_id in QUESTION_BANK_SEED:
            bank = QUESTION_BANK_SEED[skill_id]
            for mcq in bank.get("mcqs", []):
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
            
            prac = bank.get("practical")
            if prac:
                pq = QuizQuestion(
                    skill_id=skill_id,
                    question_text=prac["question_text"],
                    question_type="practical",
                    practical_rubric=prac.get("rubric", ""),
                    explanation="Practical implementation rubric assessment.",
                    difficulty=prac.get("difficulty", "intermediate")
                )
                db.add(pq)
            db.commit()
            db_questions = db.query(QuizQuestion).filter(QuizQuestion.skill_id == skill_id).all()

        questions_out = []
        for q in db_questions:
            opts = json.loads(q.options) if q.options else []
            questions_out.append({
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": opts,
                "explanation": q.explanation,
                "difficulty": q.difficulty
            })

        tax = db.query(SkillTaxonomy).filter(SkillTaxonomy.skill_id == skill_id).first()
        skill_name = tax.name if tax else skill_id.title()

        return {
            "skill_id": skill_id,
            "skill_name": skill_name,
            "questions": questions_out,
            "total_questions": len(questions_out)
        }

    def grade_assessment(
        self,
        user_id: int,
        skill_id: str,
        answers: Dict[int, int],
        practical_text: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Grades submitted assessment.
        Updates UserSkill with verified_level and records AssessmentAttempt.
        """
        questions = db.query(QuizQuestion).filter(QuizQuestion.skill_id == skill_id).all()
        mcq_questions = [q for q in questions if q.question_type == "mcq"]
        practical_questions = [q for q in questions if q.question_type == "practical"]

        total_mcq = len(mcq_questions)
        correct_mcq = 0
        weak_topics = []

        for q in mcq_questions:
            user_ans = answers.get(q.id)
            if user_ans is not None and user_ans == q.correct_answer:
                correct_mcq += 1
            else:
                # Track weak topic from explanation or question text
                topic = q.question_text[:50] + "..."
                weak_topics.append(topic)

        # Practical grading (rubric keyword analysis)
        practical_score = 0
        if practical_questions and practical_text.strip():
            pq = practical_questions[0]
            rubric_words = [w.strip().lower() for w in pq.practical_rubric.split(",") if w.strip()]
            user_lower = practical_text.lower()
            matched_words = [w for w in rubric_words if w in user_lower]
            if rubric_words:
                practical_score = min(20, int((len(matched_words) / len(rubric_words)) * 20))
            else:
                practical_score = 15
        elif practical_questions:
            weak_topics.append("Practical coding implementation")

        mcq_weight = 80.0
        mcq_earned = (correct_mcq / max(total_mcq, 1)) * mcq_weight
        total_score_pct = round(mcq_earned + practical_score, 1)

        # Determine verified level
        if total_score_pct >= 85.0:
            verified_level = 4
            trigger_action = "ASSESSMENT_STRONG"
            passed = True
        elif total_score_pct >= 65.0:
            verified_level = 3
            trigger_action = "NONE"
            passed = True
        elif total_score_pct >= 50.0:
            verified_level = 2
            trigger_action = "NONE"
            passed = False
        else:
            verified_level = 1
            trigger_action = "ASSESSMENT_POOR"
            passed = False

        # If score is under 60%, ensure ASSESSMENT_POOR trigger
        if total_score_pct < 60.0:
            trigger_action = "ASSESSMENT_POOR"

        # Update UserSkill
        user_skill = db.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.skill_name.ilike(skill_id)
        ).first()

        if not user_skill:
            user_skill = UserSkill(
                user_id=user_id,
                skill_name=skill_id,
                proficiency=verified_level,
                verified_level=verified_level,
                confidence="verified by assessment"
            )
            db.add(user_skill)
        else:
            user_skill.verified_level = verified_level
            user_skill.confidence = "verified by assessment"

        attempt = AssessmentAttempt(
            user_id=user_id,
            skill_id=skill_id,
            score_pct=total_score_pct,
            passed=passed,
            total_questions=len(questions),
            correct_questions=correct_mcq + (1 if practical_score >= 10 else 0),
            practical_feedback=f"Practical response earned {practical_score}/20 points.",
            weak_topics=json.dumps(weak_topics[:3]),
            trigger_action=trigger_action
        )
        db.add(attempt)
        db.commit()

        return {
            "attempt_id": attempt.id,
            "skill_id": skill_id,
            "score_pct": total_score_pct,
            "passed": passed,
            "total_questions": len(questions),
            "correct_questions": attempt.correct_questions,
            "new_verified_level": verified_level,
            "weak_topics": weak_topics[:3],
            "trigger_action": trigger_action
        }
