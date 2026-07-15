import os
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


def sign_token(user_id: int) -> str:
    payload = {
        "userId": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("userId")
    except jwt.PyJWTError:
        return None


def require_auth(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> int:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )
    user_id = verify_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return user_id
