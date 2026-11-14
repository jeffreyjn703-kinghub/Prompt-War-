import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.services.seeder import seed_database
from app.routes import (
    auth,
    profile,
    skills,
    roles,
    analysis,
    match,
    roadmap,
    resources,
    progress,
    assessments,
    mentor,
    agents,
    org,
    sync,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("vyntrixa.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create database tables
    logger.info("Verifying SQLite schema...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed database
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error seeding database: {e}", exc_info=True)
    finally:
        db.close()
    
    yield
    logger.info("Application shutting down...")

app = FastAPI(
    title="VYNTRIXA API",
    description="AI-Powered Adaptive Learning Intelligence - Multi-agent career readiness and personalized learning path engine.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/docker ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(skills.router)
app.include_router(roles.router)
app.include_router(analysis.router)
app.include_router(match.router)
app.include_router(roadmap.router)
app.include_router(resources.router)
app.include_router(progress.router)
app.include_router(assessments.router)
app.include_router(mentor.router)
app.include_router(agents.router)
app.include_router(org.router)
app.include_router(sync.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VYNTRIXA API",
        "version": "1.0.0"
    }
