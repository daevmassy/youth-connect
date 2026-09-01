from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..database import db_cursor
from ..auth import require_auth

router = APIRouter()


class ReadingPlanDayInput(BaseModel):
    dayNumber: int
    passage: str
    reflection: str = ""


class CreateReadingPlanRequest(BaseModel):
    title: str
    description: str = ""
    days: list[ReadingPlanDayInput]


@router.get("/reading-plans")
def list_reading_plans(user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute("SELECT * FROM reading_plans")
        plans = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM reading_plan_days ORDER BY day_number ASC")
        days = [dict(r) for r in cur.fetchall()]

    plans_out = []
    for p in plans:
        plan_days = [
            {
                "id": d["id"],
                "planId": d["plan_id"],
                "dayNumber": d["day_number"],
                "passage": d["passage"],
                "reflection": d["reflection"],
            }
            for d in days if d["plan_id"] == p["id"]
        ]
        plans_out.append({
            "id": p["id"],
            "title": p["title"],
            "description": p["description"],
            "createdAt": p["created_at"],
            "days": plan_days,
        })
    return {"plans": plans_out}


@router.post("/reading-plans", status_code=201)
def create_reading_plan(body: CreateReadingPlanRequest, user_id: int = Depends(require_auth)):
    if not body.title.strip():
        raise HTTPException(400, "A study guide title is required.")
    if not body.days:
        raise HTTPException(400, "Add at least one verse to the study guide.")
    if any(day.dayNumber < 1 or not day.passage.strip() for day in body.days):
        raise HTTPException(400, "Each study day needs a valid number and passage.")

    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO reading_plans (title, description)
               VALUES (%s, %s) RETURNING *""",
            (body.title.strip(), body.description.strip()),
        )
        plan = dict(cur.fetchone())
        for day in body.days:
            cur.execute(
                """INSERT INTO reading_plan_days (plan_id, day_number, passage, reflection)
                   VALUES (%s, %s, %s, %s)""",
                (plan["id"], day.dayNumber, day.passage.strip(), day.reflection.strip()),
            )

    return {
        "plan": {
            "id": plan["id"],
            "title": plan["title"],
            "description": plan["description"],
            "createdAt": plan["created_at"],
            "days": [
                {
                    "id": index + 1,
                    "planId": plan["id"],
                    "dayNumber": day.dayNumber,
                    "passage": day.passage.strip(),
                    "reflection": day.reflection.strip(),
                }
                for index, day in enumerate(body.days)
            ],
        }
    }


@router.get("/reading-plans/progress")
def get_reading_progress(user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM reading_progress WHERE user_id = %s",
            (user_id,),
        )
        rows = [dict(r) for r in cur.fetchall()]
    return {"progress": [{
        "id": r["id"],
        "userId": r["user_id"],
        "planDayId": r["plan_day_id"],
        "completed": r["completed"],
        "completedAt": r["completed_at"],
    } for r in rows]}


@router.post("/reading-plans/days/{day_id}/complete", status_code=201)
def complete_reading_day(day_id: int, user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute(
            "SELECT * FROM reading_progress WHERE user_id = %s AND plan_day_id = %s LIMIT 1",
            (user_id, day_id),
        )
        existing = cur.fetchone()

    if existing:
        row = dict(existing)
        return {"progress": {
            "id": row["id"],
            "userId": row["user_id"],
            "planDayId": row["plan_day_id"],
            "completed": row["completed"],
            "completedAt": row["completed_at"],
        }}

    with db_cursor(commit=True) as cur:
        cur.execute(
            "INSERT INTO reading_progress (user_id, plan_day_id) VALUES (%s, %s) RETURNING *",
            (user_id, day_id),
        )
        row = dict(cur.fetchone())
    return {"progress": {
        "id": row["id"],
        "userId": row["user_id"],
        "planDayId": row["plan_day_id"],
        "completed": row["completed"],
        "completedAt": row["completed_at"],
    }}
