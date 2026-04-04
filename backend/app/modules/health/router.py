import typing
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

__all__ = ("v1",)


# TODO: This should go in proper file
class HealthResponseModel(BaseModel):
    status: typing.Annotated[Literal["ok"], Field(default="ok", init=False)] = Field(
        default="ok", init=False
    )


v1 = APIRouter(prefix="/v1", tags=["Health"])


@v1.get("/health")
async def health() -> HealthResponseModel:
    return HealthResponseModel()
