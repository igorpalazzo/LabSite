from fastapi import APIRouter, Depends, HTTPException

from ..schemas import LoginRequest
from ..security import create_token, current_user, verify_password
from ..store import store


router = APIRouter(prefix="/auth", tags=["Autenticação"])


def safe_user(user: dict) -> dict:
    return {key: value for key, value in user.items() if key != "password_hash"}


@router.post("/login")
def login(payload: LoginRequest):
    user = next(
        (u for u in store.all("users") if u["email"].lower() == payload.email.lower()),
        None,
    )
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    return {"access_token": create_token(user), "token_type": "bearer", "user": safe_user(user)}


@router.get("/me")
def me(user: dict = Depends(current_user)):
    return safe_user(user)

