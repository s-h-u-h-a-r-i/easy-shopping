# easy-shopping — Development Progress

## Completed

- [x] Supabase projects created (dev + prod)
- [x] Git initialised and pushed to GitHub
- [x] Multi-root VSCode workspace (`easy-shopping.code-workspace`)
- [x] SolidStart frontend scaffolded (`frontend/`) — Bun, TypeScript
- [x] FastAPI backend scaffolded (`backend/`)
  - [x] `core/effect/` — custom `Effect[A, E]` system (ZIO/Effect-TS style)
  - [x] `core/errors.py` — typed `AppError` hierarchy
  - [x] `core/effect/runner.py` — end-of-the-world HTTP boundary
  - [x] `core/config.py` — pydantic-settings with environment validation
  - [x] `core/supabase/` — async client, initialised in lifespan
  - [x] `core/auth.py` — JWKS fetched from Supabase at startup (ES256)
  - [x] `core/dependencies.py` — JWT auth dependency, returns `user_id: str`
  - [x] `core/logging.py` — structlog, pretty in local, JSON in prod
  - [x] `core/middleware/` — `LoggingMiddleware` with request-scoped context vars
  - [x] CORS, lifespan, global exception handler, health check, API versioning

## In Progress

- [ ] Supabase schema migrations (dev project)

## Up Next

- [ ] `modules/lists/` — shopping list CRUD
- [ ] Auth flow working end-to-end (frontend ↔ backend)
- [ ] `modules/items/` — list items CRUD
- [ ] Basic CRUD verified working
- [ ] Dockerfile + Cloud Run deployment
- [ ] Google Secret Manager for production credentials
- [ ] `modules/ai/` — AI suggestion endpoint
- [ ] Frontend UI — shopping list views
- [ ] Frontend UI — AI suggestion flow
