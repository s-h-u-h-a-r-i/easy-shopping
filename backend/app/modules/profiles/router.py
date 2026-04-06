from fastapi import APIRouter

__all__ = ("v1",)

v1 = APIRouter(prefix="/profile", tags=["Profile"])
