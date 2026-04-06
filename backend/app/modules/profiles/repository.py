import typing
from datetime import datetime

from supabase._async.client import AsyncClient

from app.core.effect import Effect
from app.core.errors import DBError, NotFound

from .models import Profile

__all__ = ("UserProfileRepository",)


class UserProfileRepository:
    def __init__(self, client: AsyncClient) -> None:
        self._client: AsyncClient = client

    def fetch_user_profile(self, user_id: str):
        async def query():
            response = (
                await self._client.table("profiles")
                .select("*")
                .eq("id", user_id)
                .maybe_single()
                .execute()
            )
            if response is None or response.data is None:
                raise NotFound(f"Profile with id {user_id}")
            return typing.cast(dict[str, typing.Any], response.data)

        return Effect.from_async(
            query,
            map_exc=lambda exc: (
                exc if isinstance(exc, NotFound) else DBError(cause=exc)
            ),
        ).map(_parse_profile_row)


def _parse_profile_row(row: dict[str, typing.Any]) -> Profile:
    return Profile(
        id=str(row["id"]),
        username=str(row["username"]),
        display_name=(
            str(row["display_name"]) if row.get("display_name") is not None else None
        ),
        created_at=datetime.fromisoformat(row["created_at"]),
    )
