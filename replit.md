# Pekuti Youth App

A mobile app for Ruwa City Youth (Zimbabwe) — daily devotions, anonymous community chat, private Q&A with Pastor, prayer room, and gospel music, all with Shona/English toggle.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

**Pekuti** — "church in your pocket" for Ruwa City Youth, Harare. Navy + Gold theme, Shona/English toggle throughout.

- **Home** — Dashboard with today's verse, streak counter, quick-access grid, upcoming service RSVP
- **Pekuti (Devotion)** — Daily Shona/English devotion with streak tracking and day selector
- **Imba / Bvunza** — Anonymous group chat (Imba Yokutaura) + private Q&A with Pastor (Bvunza)
- **Prayer Room (Namata)** — Daily prayer focus + anonymous prayer requests with heart button
- **Gospel Music (Nziyo)** — Admin-curated playlists with mini player
- **Admin Panel** — Questions queue, devotion management, prayer focus, chat moderation (password protected, route guarded)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
