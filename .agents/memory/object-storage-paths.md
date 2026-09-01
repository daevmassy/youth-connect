---
name: App Storage object paths
description: Replit App Storage private-object URL and sidecar path conventions used by the Python API.
---

The app-facing URL for a private uploaded object is `/objects/uploads/<id>`. In a FastAPI route declared as `/objects/{object_path:path}`, the captured value is `uploads/<id>`; prepend the configured private object directory only when signing the GCS URL through the local storage sidecar.

**Why:** The route parameter and the app-facing normalized path have different prefixes, and treating them as interchangeable produces a working upload with a broken playback URL.

**How to apply:** Keep database audio paths normalized as `/objects/uploads/<id>`, expose them under `/api/storage/objects/uploads/<id>`, and validate the captured path before signing GET URLs.