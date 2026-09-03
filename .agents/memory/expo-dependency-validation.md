---
name: Expo dependency validation
description: The two checks needed to prevent Expo SDK dependency drift in pnpm workspaces
---

Expo’s `install --check` validates resolved installed package versions against the SDK’s recommended ranges, but it does not by itself detect a changed package manifest whose workspace lockfile was not updated. Pair it with a frozen lockfile-only pnpm install.

**Why:** A manifest-only version change can make the Expo check report success while the lockfile still resolves the old dependency specification.

**How to apply:** Keep both checks read-only and run them before mobile release/build work; do not use Expo’s `--fix` mode or an unfrozen install in validation.