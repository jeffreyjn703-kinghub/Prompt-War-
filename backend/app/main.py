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

import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse

# 3. Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# 4. In-Memory Rate Limiting for Sensitive Auth Endpoints
_auth_rate_limits = defaultdict(list)
_AUTH_MAX_ATTEMPTS = 60
_AUTH_WINDOW_SECONDS = 60

@app.middleware("http")
async def rate_limit_auth_endpoints(request: Request, call_next):
    if request.method == "POST" and request.url.path in ["/api/auth/login", "/api/auth/register"]:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        timestamps = _auth_rate_limits[client_ip]
        _auth_rate_limits[client_ip] = [ts for ts in timestamps if now - ts < _AUTH_WINDOW_SECONDS]
        if len(_auth_rate_limits[client_ip]) >= _AUTH_MAX_ATTEMPTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many authentication requests. Please try again in 60 seconds."}
            )
        _auth_rate_limits[client_ip].append(now)
    return await call_next(request)

# CORS configuration - OWASP compliant origin regex & explicit trusted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://prompt-war-umber.vercel.app"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.pinggy-free\.link|.*\.lhr\.life)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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
