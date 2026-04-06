# easy-shopping — AI Agent Context

This file provides context for AI assistants working on this project across sessions.

## Project Overview

A smart shopping list application where users can manage grocery/shopping lists. An AI layer learns from user behaviour and generates personalised shopping list suggestions over time.

This is a portfolio project to showcase PostgreSQL experience via Supabase.

## Goals

- Users can create and manage shopping lists, organised into personal groups
- Products added via barcode scan — global catalogue, API lookup, local-only if not found
- Lists can be shared with others (owner / editor / viewer roles) via user invite
- Snapshots taken on "finished shopping" — supports revert and future AI generation
- AI list generation deferred — history data is in place; AI will generate based on group snapshot history
- Clean, modern UI with SolidStart
- REST API with FastAPI deployed to Google Cloud Run
- Supabase (PostgreSQL) as the primary database and auth provider

## Tech Stack


| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Frontend   | SolidJS + Vite (TypeScript) + Bun          |
| Backend    | FastAPI (Python)                           |
| Database   | Supabase (PostgreSQL)                      |
| Auth       | Supabase Auth (JWT-based)                  |
| AI         | TBD — likely OpenAI API                    |
| Deployment | Google Cloud Run (backend), TBD (frontend) |
| VCS        | GitHub (monorepo)                          |


## Repository Structure (Monorepo)

```
easy-shopping/
├── frontend/        # SolidStart app (Bun, TypeScript)
├── backend/         # FastAPI app (Python)
├── AGENTS.md        # AI context (this file)
├── PROGRESS.md      # Development checklist
└── README.md
```

## Supabase Projects


| Environment | Project Name      | URL                                        |
| ----------- | ----------------- | ------------------------------------------ |
| Production  | Easy Shopping     | `https://qrzihjudzlxekgbjgbkc.supabase.co` |
| Development | Easy Shopping Dev | TBD (check Supabase dashboard)             |


- Local `.env` always points to the **dev** project
- Production credentials go in Cloud Run environment variables (or Secret Manager later)

### Auth Strategy

- Supabase Auth handles user registration/login (email+password to start, OAuth later)
- Frontend uses the Supabase JS client to sign in and get a JWT (ES256)
- FastAPI verifies JWTs via JWKS fetched from Supabase at startup — no shared secret
- RLS enabled on all user-facing tables

### Schema (public schema — 9 tables)

```
profiles              extends auth.users; username (unique, for invite lookup), display_name
products              global catalogue; barcode (unique), name, brand, category, image_url
list_groups           personal collections owned by a user; used to organise lists and scope AI generation
shopping_lists        status: active | shopping | completed; group_id (nullable FK list_groups); created_by
shopping_list_members list_id + user_id + role (owner | editor | viewer)
list_invites          list_id, invited_by, invited_user_id, role, status (pending | accepted | declined)
list_items            list_id, product_id (NOT NULL — every saved item must reference a product), quantity, unit, checked
list_snapshots        created when user clicks "finished shopping"; accessible to owner + editors only
snapshot_items        denormalised product name/brand/category at snapshot time + product_id (nullable)
```

**Key design decisions:**
- No free-text items in DB — items must reference a product; local-only items (barcode not found) stay in localStorage
- Products catalogue is global (shared across all users)
- Sharing = access to current list state only; history (snapshots) visible to owner + editors, not viewers
- List groups are personal (owner only) — shared lists appear in a "shared with me" view for other members
- AI list generation is deferred — history data (snapshots) is in place to support it when ready
- `generation_sessions` deferred — will be added when AI generation is implemented

## FastAPI Backend Notes

- Python project in `backend/`
- Uses `supabase-py` to interact with Supabase
- JWT verification: ES256 asymmetric signing via JWKS fetched from Supabase at startup — no shared secret
- Deployed to Google Cloud Run — Dockerfile required
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### Backend Architecture — Effect Pattern

All business logic is wrapped in a custom `Effect[A, E]` system (`app/core/effect/`), modelled after ZIO/Effect-TS. This enforces typed error handling throughout the application.

**Exit types:** `Ok[A]` | `Err[E]` | `Die` (unexpected defect)

**Layers:**

- `app/core/effect/effect.py` — core `Effect[A, E]` class with `gen`, `par`, `gather_exits`, `map`, `flat_map`, `retry`, `timeout`, etc.
- `app/core/effect/runner.py` — `run(effect)` — the "end of the world"; awaits an Effect and converts the exit to an HTTP response or raises `HTTPException`
- `app/core/errors.py` — base `AppError` ABC with concrete types: `NotFound`, `Unauthorized`, `Forbidden`, `DBError`, `ValidationError`
- Module-specific errors live in `app/modules/<module>/errors.py` and extend `AppError`

**Pattern per layer:**

```
router.py       (controller) → HTTP only; calls service, returns response via run()
service.py                   → business logic; orchestrates Effects, maps errors; no HTTP, no raw DB
repository.py                → data access only; all Supabase queries; returns Effect[T, DBError]
schemas.py                   → Pydantic request/response models
dependencies.py              → plain FastAPI async deps (framework boundary, JWT auth)
```

**Module structure:**
```
app/modules/<module>/
├── __init__.py
├── models.py       ← DB row representation (dataclass, mirrors DB schema)
├── schemas.py      ← HTTP request/response shapes (Pydantic)
├── repository.py   ← Supabase queries only; returns Effect[Model | None, DBError]
├── service.py      ← business logic; maps Model → Schema; returns Effect[Schema, AppError]
└── router.py       ← FastAPI routes; calls service via run()
```

**Type boundary at repository:** supabase-py stubs use `Any` in places — use `# type: ignore` once at the raw dict → Model parse in repository, restore proper types immediately. Everything above repository is fully typed.

**Error type in routes is always `AppError` (or a subtype).** `AppError.to_http_exception()` handles the conversion at the boundary in `runner.py`.

## Frontend Notes

- Pure SPA — SolidJS + Vite (TypeScript)
- Package manager: **Bun**
- Client-side only, no SSR — all content behind auth so no SEO requirement
- Uses `@supabase/supabase-js` for auth and direct DB reads where appropriate
- Calls FastAPI for AI-related endpoints
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
- **Styling: SCSS Modules** — every component has a co-located `.module.scss` file; global styles in `src/styles/`
- **Global styles structure:**
  - `src/styles/index.scss` — entry point, imports all partials
  - `src/styles/_theme.scss` — CSS custom properties (light + dark via media query)
  - `src/styles/_reset.scss` — box model reset
  - `src/styles/_typography.scss` — base font and heading rules
  - `src/styles/_layout.scss` — `#root`, `html`, `body` base layout
- **Component structure:** `src/ui/<Component>/` with `Component.tsx`, `Component.module.scss`, `index.ts`
- **Routing:** `@solidjs/router` with lazy-loaded routes; `Layout.tsx` as persistent shell with `<Outlet />`

## Development Progress

See `PROGRESS.md` for the full checklist of completed and upcoming work.

## Learned User Preferences

- User prefers to write code themselves; AI should provide step-by-step instructions rather than implementing changes directly.
- Conventional commit messages are expected (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:` prefixes).

## Learned Workspace Facts

- Git branch naming convention: `feat/`, `fix/`, `chore/`, `ref/` prefixes.
- mypy configured as strict with `disallow_untyped_defs = false` and `disallow_incomplete_defs = false` — return type annotations are not required.
- Two Supabase MCP instances configured locally in Cursor: `supabase-dev` and `supabase-prod`, each locked to their respective project (project ref only in config, no secrets).
- Supabase new key naming (2025+): "Publishable key" = anon key (frontend); "Secret key" = service role key (backend).
- Supabase CLI initialized at repo root (`supabase/migrations/`) for versioned schema migrations; apply per environment via CLI.
- `postgres-language-server.jsonc` is gitignored — contains the dev DB connection string (password); must never be committed.
- Multi-root Cursor workspace file `easy-shopping.code-workspace` at repo root — three roots: `root`, `backend`, `frontend`.
