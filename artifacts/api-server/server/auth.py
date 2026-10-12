import os
import hmac
from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.environ.get("SESSION_SECRET")
if not JWT_SECRET:
    raise RuntimeError("SESSION_SECRET must be set to sign auth tokens.")

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

bearer_scheme = HTTPBearer(auto_error=False)


def sign_token(user_id: int | None, is_admin: bool = False) -> str:
    payload = {
        "userId": user_id,
        "isAdmin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token_payload(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None


def verify_token(token: str) -> Optional[int]:
    payload = verify_token_payload(token)
    if not payload:
        return None
    user_id = payload.get("userId")
    return int(user_id) if user_id is not None else None


def require_auth(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> int:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )
    payload = verify_token_payload(credentials.credentials)
    if payload is None or (payload.get("userId") is None and not payload.get("isAdmin")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return int(payload.get("userId") or 0)


def require_admin(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> int:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")
    payload = verify_token_payload(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    if not payload.get("isAdmin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access required")
    return int(payload.get("userId") or 0)
