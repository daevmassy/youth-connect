---
name: GitHub history reconciliation caution
description: Remote main has status-prefix-looking paths that must be reviewed before cleanup.
---

When reconciling this repository with GitHub `main`, remote-only entries may have names beginning with status-like prefixes such as `A` or `M` (for example, `Aartifacts/...` or `M.replit`). Preserve them until their contents are reviewed; a safe merge can add the canonical local paths without deleting remote-only entries.

**Why:** Removing paths based only on their appearance could destroy unique remote content.

**How to apply:** Inspect the current remote tree and compare contents before cleanup. When pushing, preserve unrelated remote paths and avoid force-updating `main`.
