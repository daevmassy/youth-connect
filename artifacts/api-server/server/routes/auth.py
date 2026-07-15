from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from passlib.context import CryptContext

from ..database import db_cursor
from ..auth import sign_token, require_auth

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    identifier: str
    password: str


class UpdateProfileRequest(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    bio: str | None = None


def _public_user(row: dict) -> dict:
    return {k: v for k, v in row.items() if k != "password_hash"}


@router.post("/auth/register", status_code=201)
def register(body: RegisterRequest):
    if not body.password or len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")

    email = body.email.strip().lower()
    username = body.username.strip().lower()

    with db_cursor() as cur:
        cur.execute(
            "SELECT id FROM users WHERE email = %s OR username = %s LIMIT 1",
            (email, username),
        )
        if cur.fetchone():
            raise HTTPException(409, "An account with that email or username already exists.")

    password_hash = pwd_ctx.hash(body.password)

    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO users (first_name, last_name, username, email, password_hash)
               VALUES (%s, %s, %s, %s, %s) RETURNING *""",
            (body.firstName.strip(), body.lastName.strip(), username, email, password_hash),
        )
        user = dict(cur.fetchone())

    token = sign_token(user["id"])
    return {"token": token, "user": _public_user(user)}


@router.post("/auth/login")
def login(body: LoginRequest):
    normalized = body.identifier.strip().lower()

    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM users WHERE email = %s OR username = %s LIMIT 1",
            (normalized, normalized),
        )
        row = cur.fetchone()

    if not row or not pwd_ctx.verify(body.password, row["password_hash"]):
        raise HTTPException(401, "Invalid credentials.")

    user = dict(row)
    token = sign_token(user["id"])
    return {"token": token, "user": _public_user(user)}


@router.get("/auth/me")
def get_me(user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = %s LIMIT 1", (user_id,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(404, "User not found.")
    return {"user": _public_user(dict(row))}


@router.patch("/auth/me")
def update_me(body: UpdateProfileRequest, user_id: int = Depends(require_auth)):
    updates = {}
    if body.firstName is not None:
        updates["first_name"] = body.firstName.strip()
    if body.lastName is not None:
        updates["last_name"] = body.lastName.strip()
    if body.bio is not None:
        updates["bio"] = body.bio

    if not updates:
        with db_cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return {"user": _public_user(dict(cur.fetchone()))}

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    with db_cursor(commit=True) as cur:
        cur.execute(
            f"UPDATE users SET {set_clause} WHERE id = %s RETURNING *",
            (*updates.values(), user_id),
        )
        row = cur.fetchone()
    return {"user": _public_user(dict(row))}
