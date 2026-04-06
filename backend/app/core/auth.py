import typing

import httpx

from app.core.config import settings

_jwks: typing.Optional[typing.Dict[str, typing.Any]] = None


async def init_jwks() -> None:
    global _jwks
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        )
        response.raise_for_status()
        _jwks = response.json()


def get_jwks() -> typing.Dict[str, typing.Any]:
    assert _jwks is not None, "JWKS not initialized"
    return _jwks
