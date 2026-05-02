# easy-shopping — Development Progress

## Completed

- Supabase schema migrated to dev project (9 tables, strict RLS, `handle_new_user` trigger)
- Supabase projects created (dev + prod)
- Git initialised and pushed to GitHub
- Multi-root VSCode workspace (`easy-shopping.code-workspace`)
- Frontend scaffolded (`frontend/`) — SolidJS + Vite, Bun, TypeScript, SPA mode; feature layer uses async services and discriminated `AppError` types (no Effect-TS on the client)
- FastAPI backend scaffolded (`backend/`)
  - `core/effect/` — custom `Effect[A, E]` system (ZIO/Effect-TS style)
  - `core/errors.py` — typed `AppError` hierarchy
  - `core/effect/runner.py` — end-of-the-world HTTP boundary
  - `core/config.py` — pydantic-settings with environment validation
  - `core/supabase/` — async client, initialised in lifespan
  - `core/auth.py` — JWKS fetched from Supabase at startup (ES256)
  - `core/dependencies.py` — JWT auth dependency, returns `user_id: str`
  - `core/logging.py` — structlog, pretty in local, JSON in prod
  - `core/middleware/` — `LoggingMiddleware` with request-scoped context vars
  - CORS, lifespan, global exception handler, health check, API versioning

## Up Next
- `modules/profiles/` — create profile on signup, update username/display name
- `modules/products/` — barcode lookup, add to global catalogue
- `modules/groups/` — create/manage personal list groups
- `modules/lists/` — create/manage shopping lists, status transitions (active → shopping → completed)
- `modules/items/` — add/remove/check items on a list (product_id required)
- `modules/snapshots/` — create snapshot on "finished shopping", revert list to snapshot
- `modules/members/` — invite users, manage roles, revoke access
- Auth flow working end-to-end (frontend ↔ backend)
- Basic CRUD verified working
- Dockerfile + Cloud Run deployment
- Google Secret Manager for production credentials

## Deferred (not in scope yet)

- AI list generation — endpoint + `generation_sessions` schema
- Frontend UI
- Offline support — strategy documented in `PWA.md`; implementation deferred until shopping list feature is built