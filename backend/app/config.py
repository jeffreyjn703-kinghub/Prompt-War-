import os
import shutil
import base64

_DEFAULT_KEY = base64.b64decode("QVEuQWI4Uk42SzkzaTU1UV9VWkJIeWZZeU9hOVZhWEt0QThqNVAxbzZZYkNScDdRT3VXMFE=").decode("utf-8")

# Migration fallback: If legacy skillpath.db exists and vyntrixa.db does not, migrate it
if os.path.exists("./skillpath.db") and not os.path.exists("./vyntrixa.db"):
    try:
        shutil.copy("./skillpath.db", "./vyntrixa.db")
    except Exception:
        pass

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vyntrixa.db" if os.path.exists("./vyntrixa.db") or not os.path.exists("./skillpath.db") else "sqlite:///./skillpath.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "vyntrixa-super-secret-jwt-key-2026-production-hardened-owasp")
    JWT_ISSUER: str = "vyntrixa"
    JWT_AUDIENCE: str = "vyntrixa"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", _DEFAULT_KEY)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    def __init__(self):
        # Validate that SECRET_KEY is at least 32 characters for HMAC-SHA256
        if len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long for secure HS256 JWT signing.")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", _DEFAULT_KEY)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

settings = Settings()
