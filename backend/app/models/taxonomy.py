from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class SkillTaxonomy(Base):
    __tablename__ = "skill_taxonomy"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(String(100), unique=True, index=True, nullable=False) # e.g. "react"
    name = Column(String(100), nullable=False) # e.g. "React"
    category = Column(String(100), nullable=False) # Frontend, Backend, Database, Cloud & DevOps, Data & AI, Security, Mobile, Soft Skills & Tools
    description = Column(Text, default="")
    prerequisites = Column(Text, default="[]") # JSON list of skill_ids

class RoleTaxonomy(Base):
    __tablename__ = "role_taxonomy"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(String(100), unique=True, index=True, nullable=False) # e.g. "full-stack-developer"
    title = Column(String(100), nullable=False) # e.g. "Full Stack Developer"
    department = Column(String(100), default="Engineering")
    description = Column(Text, default="")
    required_skills = Column(Text, default="{}") # JSON dict {skill_id: required_level}

class ResourceItem(Base):
    __tablename__ = "resource_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # course, tutorial, doc, video, exercise, project
    skill_id = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), default="intermediate") # beginner, intermediate, advanced
    estimated_hours = Column(Integer, default=5)
    provider = Column(String(100), default="freeCodeCamp")
    url = Column(String(500), nullable=False)
    description = Column(Text, default="")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(String(100), index=True, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), default="mcq") # mcq, practical
    options = Column(Text, default="[]") # JSON list of strings (for MCQ)
    correct_answer = Column(Integer, default=0) # Index for MCQ (0-3)
    practical_rubric = Column(Text, default="") # Rubric/keywords for practical question
    explanation = Column(Text, default="")
    difficulty = Column(String(50), default="intermediate") # beginner, intermediate, advanced
