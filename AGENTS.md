# Agent notes — easy_shopping

Dense instructions for whoever loads this workspace. Humans may read it incidentally; optimize for correctness and retrieval, not onboarding prose.

## Identity of the repo

- Multi-root workspace root: shopping app with `frontend/` and `backend/`.
- **Frontend**: SolidJS + Vite, TypeScript, SPA; Bun tooling per `frontend/` docs (`DEV_MODE.md` when relevant).
- **Backend**: FastAPI; custom `Effect` style in `core/effect/`; typed `AppError`; Supabase async client + JWT (JWKS, ES256) at HTTP boundary.
- **Data**: Supabase Postgres; migrations/RLS and `handle_new_user` documented in progress notes; MCP server may be enabled as `plugin-supabase-supabase` — **read tool schemas under the project `mcps/` folder before calling MCP tools.**

## Canonical project state

- Treat `PROGRESS.md` at repo root as the backlog / done list unless the user overrides.
- Deferred items there (e.g. PWA/offline per `PWA.md`, AI list generation) are out of scope unless the user explicitly expands scope.

## Operating rules specific to this user

- Do **not** write or patch repo files unless the **current user message** contains the exact phrase `WRITE_TO_FILES`.
- Prefer absolute paths in tool arguments for this workspace.
- No drive-by refactors or unsolicited markdown/doc files unless the user asked.
- User said not to worry about backwards compatibility unless they say otherwise.

## How to work effectively here

1. Before changing behavior or APIs, read the nearby module and matching patterns (`AppError`, effect runners, frontend service layer).
2. Keep diffs minimal and scoped; match existing naming, imports, and error/style patterns.
3. For Supabase: use the Supabase skill path from the skill list when the task touches schema, Auth, RLS, or migrations; honor Postgres best-practices skill when writing SQL.
4. Run the project’s actual commands (`bun`, `uv`/`pytest`, etc.) — confirm from `frontend/` and `backend/` configs rather than guessing.

## Silence / hallucination avoidance

- If something isn’t in the repo or MCP output, search or read files; don’t invent endpoints or table columns.
- When uncertain about runtime or env vars, grep for usage or read settings modules (e.g. backend `core/config.py`).

## Outputs

- Cite existing code with the required citation format (`start:end:path` blocks) when showing code to the user.
- Final answers: clear, proportional; skip engagement prompts unless a real follow-up is needed.
