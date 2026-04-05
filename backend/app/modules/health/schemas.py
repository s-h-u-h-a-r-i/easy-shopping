import typing

from pydantic import BaseModel, Field

__all__ = ("HealthResponseModel",)


class HealthResponseModel(BaseModel):
    status: typing.Annotated[typing.Literal["ok"], Field(default="ok", init=False)] = (
        Field(default="ok", init=False)
    )
