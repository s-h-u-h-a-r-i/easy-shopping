# easy-shopping — AI Agent Context

This file provides context for AI assistants working on this project across sessions.

## Project Overview

A smart shopping list application where users can manage grocery/shopping lists. An AI layer learns from user behaviour and generates personalised shopping list suggestions over time.

This is a portfolio project to showcase PostgreSQL experience via Supabase.

## Goals

- Users can create and manage shopping lists
- AI generates/suggests lists based on learnt usage patterns (purchase history, frequency, preferences)
- Clean, modern UI with SolidJS
- REST API with FastAPI deployed to Google Cloud Run
- Supabase (PostgreSQL) as the primary database and auth provider

## Tech Stack

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Frontend   | SolidStart (TypeScript) + Bun              |
| Backend    | FastAPI (Python)                           |
| Database   | Supabase (PostgreSQL)                      |
| Auth       | Supabase Auth (JWT-based)                  |
| AI         | TBD — likely OpenAI API                    |
| Deployment | Google Cloud Run (backend), TBD (frontend) |
| VCS        | GitHub (monorepo)                          |

## Repository Structure (Monorepo)

```
easy-shopping/
├── frontend/        # SolidJS app
├── backend/         # FastAPI app (Python, managed with uv)
├── AGENTS.md        # This file
└── README.md
```

## Supabase Projects

| Environment | Project Name      | URL                                          |
|-------------|-------------------|----------------------------------------------|
| Production  | Easy Shopping     | `https://qrzihjudzlxekgbjgbkc.supabase.co`  |
| Development | Easy Shopping Dev | TBD (check Supabase dashboard)               |

- Local `.env` always points to the **dev** project
- Production credentials go in Cloud Run environment variables (or Secret Manager later)

### Auth Strategy

- Supabase Auth handles user registration/login (email+password to start, OAuth later)
- Frontend uses the Supabase JS client to sign in and get a JWT
- FastAPI backend verifies the Supabase JWT on protected routes using the Supabase JWT secret
- Row Level Security (RLS) enabled on all user-facing tables

### Schema (public schema)

```sql
profiles              -- extends auth.users (display name, preferences)
shopping_lists        -- belongs to a user; type = 'manual' | 'ai_generated'; status = 'active' | 'completed' | 'archived'
list_items            -- belongs to a list; name, quantity, unit, category, checked
generation_sessions   -- groups a set of AI-generated list variants; records which list the user selected
```

`shopping_lists.selected_from_session` → FK to `generation_sessions` (set when a user picks an AI-generated list).
`generation_sessions.selected_list_id` → FK back to `shopping_lists` (the chosen variant).
RLS enabled on all tables. Indexes on `user_id` and `list_id` columns.

## FastAPI Backend Notes

- Python project in `backend/`
- Uses `supabase-py` to interact with Supabase
- JWT verification: validate Supabase-issued JWTs using the project's JWT secret
- Deployed to Google Cloud Run — Dockerfile required
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`

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
service.py   → returns Effect[A, AppError]   (pure composition, no HTTP)
router.py    → async def route(): return await run(service.do_thing())
dependencies.py → plain FastAPI async deps (framework boundary, JWT auth)
```

**Error type in routes is always `AppError` (or a subtype).** `AppError.to_http_exception()` handles the conversion at the boundary in `runner.py`.

## SolidStart Frontend Notes

- TypeScript project in `frontend/`, scaffolded with `bun create solid --solidstart --ts`
- Package manager: **Bun**
- SolidStart provides file-based routing and SSR
- Uses `@supabase/supabase-js` for auth and direct DB reads where appropriate
- Calls FastAPI for AI-related endpoints
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

## Development Status

- [x] Supabase project created
- [x] Git initialised and pushed to GitHub
- [ ] Supabase schema designed and migrations applied
- [x] FastAPI backend scaffolded (`backend/`)
  - [x] `core/effect/` — custom Effect system
  - [x] `core/errors.py` — typed AppError hierarchy
  - [x] `core/effect/runner.py` — end-of-the-world boundary
  - [x] `core/config.py` — settings via pydantic-settings
  - [ ] **API fundamentals**
    - [ ] Supabase client — initialised once at startup, shared via dependency
    - [ ] Lifespan — startup/shutdown events (`asynccontextmanager` on `app`)
    - [ ] CORS middleware — allow SolidJS frontend origin
    - [ ] Global exception handler — catch unhandled exceptions cleanly
    - [ ] API versioning — all routes prefixed `/api/v1/`
    - [ ] Health check — `GET /health` for Cloud Run probes
    - [ ] Logging — structured logging configured at startup
  - [ ] `core/dependencies.py` — JWT auth dependency
  - [ ] `modules/lists/` — shopping list CRUD
  - [ ] Dockerfile
- [x] SolidStart frontend scaffolded (`frontend/`) — Bun, TypeScript, SolidStart
- [ ] Auth flow working end-to-end
- [ ] Basic CRUD for shopping lists
- [ ] AI suggestion endpoint
