import json
import os
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from fastapi import HTTPException

SIDECAR_ENDPOINT = "http://127.0.0.1:1106"


def _storage_location() -> tuple[str, str]:
    private_dir = os.environ.get("PRIVATE_OBJECT_DIR", "").strip().strip("/")
    if not private_dir:
        raise HTTPException(500, "Object storage is not configured.")
    parts = private_dir.split("/", 1)
    if len(parts) != 2:
        raise HTTPException(500, "Object storage path is invalid.")
    return parts[0], parts[1]


def _sign_object_url(bucket_name: str, object_name: str, method: str, ttl_seconds: int) -> str:
    payload = {
        "bucket_name": bucket_name,
        "object_name": object_name,
        "method": method,
        "expires_at": (
            datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        ).isoformat().replace("+00:00", "Z"),
    }
    request = Request(
        f"{SIDECAR_ENDPOINT}/object-storage/signed-object-url",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as exc:
        raise HTTPException(502, "Could not connect to object storage.") from exc

    signed_url = result.get("signed_url")
    if not signed_url:
        raise HTTPException(502, "Object storage did not return an upload URL.")
    return signed_url


def request_audio_upload(name: str, size: int, content_type: str) -> dict:
    if not name.strip() or size <= 0:
        raise HTTPException(400, "A valid audio file is required.")
    if size > 100 * 1024 * 1024:
        raise HTTPException(400, "Audio files must be 100 MB or smaller.")
    if not content_type.lower().startswith("audio/"):
        raise HTTPException(400, "Only audio files can be uploaded.")

    bucket_name, private_prefix = _storage_location()
    object_id = str(uuid4())
    object_name = f"{private_prefix}/uploads/{object_id}"
    return {
        "uploadURL": _sign_object_url(bucket_name, object_name, "PUT", 900),
        "objectPath": f"/objects/uploads/{object_id}",
    }


def get_audio_url(object_path: str) -> str:
    normalized = object_path.strip("/")
    if not normalized.startswith("uploads/") or ".." in normalized:
        raise HTTPException(404, "Audio file not found.")
    object_id = normalized
    bucket_name, private_prefix = _storage_location()
    return _sign_object_url(bucket_name, f"{private_prefix}/{object_id}", "GET", 3600)