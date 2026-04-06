from fastapi import APIRouter

from .schemas import HealthResponseModel

__all__ = ("v1",)


v1 = APIRouter(prefix="/health", tags=["Health"])


@v1.get("/", response_model=HealthResponseModel)
async def health():
    return HealthResponseModel()
