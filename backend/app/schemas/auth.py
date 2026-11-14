from typing import Optional
from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str = "Learner"

class UserLogin(BaseModel):
    email: str
    password: str
    force: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    is_demo: bool = False
