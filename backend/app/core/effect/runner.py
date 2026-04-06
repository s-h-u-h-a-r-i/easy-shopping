from fastapi import HTTPException, status

from app.core.effect import Die, Effect, Err, Ok
from app.core.errors import AppError

__all__ = ("run",)


async def run[A, E: AppError](effect: Effect[A, E]) -> A:
    exit = await effect
    match exit:
        case Ok(value=v):
            return v
        case Err(error=e):
            raise e.to_http_exception()
        case Die():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error",
            )
