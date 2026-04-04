from app.core.effect import Die, Effect, Err, Ok
from app.core.errors import AppError
from fastapi import HTTPException, status

__all__ = ("run",)


async def run[A](effect: Effect[A, AppError]) -> A:
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
