import random
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..database import db_cursor
from ..auth import require_auth

router = APIRouter()

VALID_ROOMS = {"friends", "anonymous"}


class SendMessageRequest(BaseModel):
    content: str
    displayName: str


class SubmitQuestionRequest(BaseModel):
    content: str


class AnswerQuestionRequest(BaseModel):
    answer: str


@router.get("/chat/{room}")
def list_messages(room: str, user_id: int = Depends(require_auth)):
    if room not in VALID_ROOMS:
        raise HTTPException(400, "Unknown chat room.")
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM chat_messages WHERE room = %s ORDER BY created_at ASC LIMIT 200",
            (room,),
        )
        rows = [dict(r) for r in cur.fetchall()]
    return {"messages": [{
        "id": r["id"],
        "room": r["room"],
        "userId": r["user_id"],
        "displayName": r["display_name"],
        "content": r["content"],
        "createdAt": r["created_at"],
    } for r in rows]}


@router.post("/chat/{room}", status_code=201)
def send_message(room: str, body: SendMessageRequest, user_id: int = Depends(require_auth)):
    if room not in VALID_ROOMS:
        raise HTTPException(400, "Unknown chat room.")
    if not body.content or not body.content.strip():
        raise HTTPException(400, "Message content is required.")
    if not body.displayName:
        raise HTTPException(400, "Display name is required.")
    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO chat_messages (room, user_id, display_name, content)
               VALUES (%s, %s, %s, %s) RETURNING *""",
            (room, user_id, body.displayName, body.content.strip()),
        )
        row = dict(cur.fetchone())
    return {"message": {
        "id": row["id"],
        "room": row["room"],
        "userId": row["user_id"],
        "displayName": row["display_name"],
        "content": row["content"],
        "createdAt": row["created_at"],
    }}


@router.get("/questions")
def list_my_questions(user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM questions WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        )
        rows = [dict(r) for r in cur.fetchall()]
    return {"questions": [_camel_q(r) for r in rows]}


@router.get("/questions/all")
def list_all_questions(user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute("SELECT * FROM questions ORDER BY created_at DESC")
        rows = [dict(r) for r in cur.fetchall()]
    return {"questions": [_camel_q(r) for r in rows]}


@router.post("/questions", status_code=201)
def submit_question(body: SubmitQuestionRequest, user_id: int = Depends(require_auth)):
    if not body.content or not body.content.strip():
        raise HTTPException(400, "Question content is required.")
    ticket_code = f"YC-{random.randint(1000, 9999)}"
    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO questions (user_id, ticket_code, content)
               VALUES (%s, %s, %s) RETURNING *""",
            (user_id, ticket_code, body.content.strip()),
        )
        row = dict(cur.fetchone())
    return {"question": _camel_q(row)}


@router.patch("/questions/{question_id}/answer")
def answer_question(question_id: int, body: AnswerQuestionRequest, user_id: int = Depends(require_auth)):
    if not body.answer:
        raise HTTPException(400, "Answer is required.")
    with db_cursor(commit=True) as cur:
        cur.execute(
            """UPDATE questions SET answer = %s, answered_at = NOW()
               WHERE id = %s RETURNING *""",
            (body.answer, question_id),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Question not found.")
    return {"question": _camel_q(dict(row))}


def _camel_q(r: dict) -> dict:
    return {
        "id": r["id"],
        "userId": r["user_id"],
        "ticketCode": r["ticket_code"],
        "content": r["content"],
        "answer": r["answer"],
        "createdAt": r["created_at"],
        "answeredAt": r["answered_at"],
    }
