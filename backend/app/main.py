from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import init_jwks
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.middleware import LoggingMiddleware
from app.core.supabase import init_supabase
from app.modules.health import v1 as health_v1
from app.modules.profiles import v1 as profiles_v1

configure_logging()

# region Lifespan


@asynccontextmanager
async def lifespan(_: FastAPI):
    get_logger().info(
        "Uvicorn server started",
        host=settings.host,
        port=settings.port,
        reload=settings.is_local,
    )
    await init_supabase()
    await init_jwks()
    yield


# endregion Lifespan


# region FastAPI App Setup

app = FastAPI(
    title="Easy Shopping API",
    description="Backend API for the Easy Shopping app. Manages shopping lists and AI-powered suggestions.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
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

app.add_middleware(LoggingMiddleware)

# endregion Middleware

# region Routers

v1_router = APIRouter(prefix="/api/v1", tags=["v1"])
v1_router.include_router(health_v1)
v1_router.include_router(profiles_v1)

app.include_router(v1_router)

# endregion Routers

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_local,
        log_config=None,
    )
