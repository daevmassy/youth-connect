from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import bcrypt

from ..database import db_cursor
from ..auth import sign_token, require_auth

router = APIRouter()


def _password_bytes(password: str) -> bytes:
    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        raise HTTPException(400, "Password must be 72 bytes or fewer.")
    return encoded


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(_password_bytes(password), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


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
    return {
        "id": row["id"],
        "firstName": row["first_name"],
        "lastName": row["last_name"],
        "username": row["username"],
        "email": row["email"],
        "bio": row.get("bio") or "",
        "createdAt": row["created_at"],
    }


@router.post("/auth/register", status_code=201)
def register(body: RegisterRequest):
    if not body.password or len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    _password_bytes(body.password)

    email = body.email.strip().lower()
    username = body.username.strip().lower()

    with db_cursor() as cur:
        cur.execute(
            "SELECT id FROM users WHERE email = %s OR username = %s LIMIT 1",
            (email, username),
        )
        if cur.fetchone():
            raise HTTPException(409, "An account with that email or username already exists.")

    password_hash = _hash_password(body.password)

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

    if not row or not _verify_password(body.password, row["password_hash"]):
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
