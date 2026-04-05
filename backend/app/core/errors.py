import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass

from fastapi import HTTPException, status

__all__ = (
    "AppError",
    "NotFound",
    "Unauthorized",
    "Forbidden",
    "DBError",
    "ValidationError",
)


class AppError(ABC):
    @abstractmethod
    def to_http_exception(self) -> HTTPException: ...


@dataclass
class Unauthorized(AppError):
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )


@dataclass
class Forbidden(AppError):
    def to_http_exception(self) -> HTTPException:
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@dataclass
class NotFound(AppError):
    resource: str

    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"{self.resource} not found"
        )


@dataclass
class ValidationError(AppError):
    detail: str

    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=self.detail
        )


@dataclass
class DBError(AppError):
    detail: str = "Database error"
    cause: typing.Optional[Exception] = None

    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=self.detail
        )
