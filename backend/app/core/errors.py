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
class NotFound(AppError):
    resource: str

    def to_http_exception(self) -> HTTPException:
        return HTTPException(status.HTTP_400_BAD_REQUEST, f"{self.resource} not found")


@dataclass
class Unauthorized(AppError):
    def to_http_exception(self) -> HTTPException:
        return HTTPException(status.HTTP_401_UNAUTHORIZED, "Unauthorized")


@dataclass
class Forbidden(AppError):
    def to_http_exception(self):
        return HTTPException(status.HTTP_403_FORBIDDEN, "Forbidden")


@dataclass
class DBError(AppError):
    detail: str = "Database error"

    def to_http_exception(self) -> HTTPException:
        return HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, self.detail)


@dataclass
class ValidationError(AppError):
    detail: str

    def to_http_exception(self) -> HTTPException:
        return HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, self.detail)
