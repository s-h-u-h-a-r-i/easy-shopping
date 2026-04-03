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
| Frontend   | SolidJS (TypeScript)                       |
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
├── backend/         # FastAPI app
├── AGENTS.md        # This file
└── README.md
```

## Supabase Project

- **Project URL:** `https://qrzihjudzlxekgbjgbkc.supabase.co`
- **Region:** TBD (check Supabase dashboard)
- **Status at project start:** Fresh project, no public schema tables yet

### Auth Strategy

- Supabase Auth handles user registration/login (email+password to start, OAuth later)
- Frontend uses the Supabase JS client to sign in and get a JWT
- FastAPI backend verifies the Supabase JWT on protected routes using the Supabase JWT secret
- Row Level Security (RLS) enabled on all user-facing tables

### Planned Schema (public schema)

```sql
-- Core tables to be designed and migrated via Supabase migrations

profiles          -- extends auth.users (user preferences, display name, etc.)
shopping_lists    -- a list belonging to a user
list_items        -- items on a shopping list (name, quantity, unit, checked)
item_history      -- historical record of items a user has purchased (for AI training)
```

## FastAPI Backend Notes

- Python project in `backend/`
- Uses `supabase-py` to interact with Supabase
- JWT verification: validate Supabase-issued JWTs using the project's JWT secret
- Deployed to Google Cloud Run — Dockerfile required
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`

## SolidJS Frontend Notes

- TypeScript project in `frontend/`
- Uses `@supabase/supabase-js` for auth and direct DB reads where appropriate
- Calls FastAPI for AI-related endpoints
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

## Development Status

- [x] Supabase project created
- [ ] Git initialised and pushed to GitHub
- [ ] Supabase schema designed and migrations applied
- [ ] FastAPI backend scaffolded
- [ ] SolidJS frontend scaffolded
- [ ] Auth flow working end-to-end
- [ ] Basic CRUD for shopping lists
- [ ] AI suggestion endpoint
