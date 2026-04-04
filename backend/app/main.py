from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.supabase import init_supabase
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_supabase()
    yield


app = FastAPI(
    title="Easy Shopping API",
    description="Backend API for the Easy Shopping app. Manages shopping lists and AI-powered suggestions.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.host, port=settings.port, reload=settings.is_local
    )
