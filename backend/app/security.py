from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings
from .store import store


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_token(user: dict) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode(
        {"sub": user["id"], "role": user["role"], "exp": expires},
        settings.jwt_secret,
        algorithm="HS256",
    )


def current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão inválida ou expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id = payload.get("sub")
    except JWTError as exc:
        raise credentials_error from exc
    user = store.get("users", user_id) if user_id else None
    if not user or not user.get("active", True):
        raise credentials_error
    return user


def require_roles(*roles: str):
    def dependency(user: dict = Depends(current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Você não tem permissão para esta ação")
        return user

    return dependency


def ensure_admin() -> None:
    users = store.all("users")
    if any(user["email"].lower() == settings.admin_email.lower() for user in users):
        return
    store.insert(
        "users",
        {
            "id": str(uuid4()),
            "name": "Administrador LIRA",
            "email": settings.admin_email.lower(),
            "password_hash": hash_password(settings.admin_password),
            "role": "ADMIN",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )

