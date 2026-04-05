from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.core.effect import run
from app.core.supabase import get_supabase

from .repository import UserProfileRepository
from .schemas import ProfileResponse

__all__ = ("v1",)

v1 = APIRouter(tags=["Profile"])


@v1.get("/me", response_model=ProfileResponse)
async def get_my_profile(user_id: str = Depends(get_current_user)):
    client = get_supabase()
    repository = UserProfileRepository(client)
    profile = await run(repository.fetch_user_profile(user_id))
    return ProfileResponse.from_model(profile)
