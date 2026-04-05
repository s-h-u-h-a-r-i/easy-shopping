from fastapi import APIRouter

from .schemas import HealthResponseModel

__all__ = ("v1",)


v1 = APIRouter(tags=["Health"])


@v1.get("/health", response_model=HealthResponseModel)
async def health():
    return HealthResponseModel()
