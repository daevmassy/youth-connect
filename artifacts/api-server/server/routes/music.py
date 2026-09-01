from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from ..auth import require_auth
from ..database import db_cursor
from ..storage import get_audio_url, request_audio_upload

router = APIRouter()


class CreateMusicRequest(BaseModel):
    title: str
    artist: str
    duration: int
    audioPath: str


class UploadUrlRequest(BaseModel):
    name: str
    size: int
    contentType: str


def _track(row: dict) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "artist": row["artist"],
        "duration": row["duration"],
        "audioUrl": f"/api/storage{row['audio_path']}",
        "createdAt": row["created_at"],
    }


@router.get("/music")
def list_music(user_id: int = Depends(require_auth)):
    with db_cursor() as cur:
        cur.execute("SELECT * FROM music_tracks ORDER BY created_at DESC")
        rows = [dict(row) for row in cur.fetchall()]
    return {"tracks": [_track(row) for row in rows]}


@router.post("/music", status_code=201)
def create_music(body: CreateMusicRequest, user_id: int = Depends(require_auth)):
    if not body.title.strip() or not body.artist.strip():
        raise HTTPException(400, "Title and artist are required.")
    if body.duration < 0:
        raise HTTPException(400, "Duration cannot be negative.")
    if not body.audioPath.startswith("/objects/uploads/"):
        raise HTTPException(400, "A valid uploaded audio file is required.")

    with db_cursor(commit=True) as cur:
        cur.execute(
            """INSERT INTO music_tracks (title, artist, duration, audio_path)
               VALUES (%s, %s, %s, %s) RETURNING *""",
            (body.title.strip(), body.artist.strip(), body.duration, body.audioPath),
        )
        row = dict(cur.fetchone())
    return {"track": _track(row)}


@router.delete("/music/{track_id}", status_code=204)
def delete_music(track_id: int, user_id: int = Depends(require_auth)):
    with db_cursor(commit=True) as cur:
        cur.execute("DELETE FROM music_tracks WHERE id = %s", (track_id,))


@router.post("/storage/uploads/request-url")
def request_upload_url(body: UploadUrlRequest, user_id: int = Depends(require_auth)):
    return request_audio_upload(body.name, body.size, body.contentType)


@router.get("/storage/objects/{object_path:path}")
def serve_storage_object(object_path: str):
    return RedirectResponse(get_audio_url(object_path), status_code=307)