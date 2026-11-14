import os
import base64
_DEFAULT_KEY = base64.b64decode("QVEuQWI4Uk42SzkzaTU1UV9VWkJIeWZZeU9hOVZhWEt0QThqNVAxbzZZYkNScDdRT3VXMFE=").decode("utf-8")

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillpath.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skillpath-super-secret-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", _DEFAULT_KEY)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

settings = Settings()
