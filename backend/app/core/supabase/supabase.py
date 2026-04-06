from supabase import AsyncClient, acreate_client

from app.core.config import settings

__all__ = ("init_supabase", "get_supabase")

_client: AsyncClient | None = None


async def init_supabase() -> None:
    global _client
    _client = await acreate_client(
        settings.supabase_url, settings.supabase_service_role_key
    )


def get_supabase() -> AsyncClient:
    assert _client is not None, "Supabase client not initialized"
    return _client
