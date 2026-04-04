from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.supabase import init_supabase
from app.modules.health import v1 as health_v1
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# region Lifespan


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_supabase()
    yield


# endregion Lifespan

# region FastAPI App Setup

app = FastAPI(
    title="Easy Shopping API",
    description="Backend API for the Easy Shopping app. Manages shopping lists and AI-powered suggestions.",
    version="0.1.0",
    lifespan=lifespan,
)

# endregion FastAPI App Setup

# region Middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# endregion Middleware

# region Routers

router = APIRouter(prefix="/api")
router.include_router(health_v1)

# endregion Routers

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.host, port=settings.port, reload=settings.is_local
    )
