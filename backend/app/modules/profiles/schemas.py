import typing
from datetime import datetime

from pydantic import BaseModel, Field

from app.modules.profiles import Profile

__all__ = ("ProfileResponse",)


class ProfileResponse(BaseModel):
    id: typing.Annotated[str, Field(...)]
    username: typing.Annotated[str, Field(...)]
    display_name: typing.Annotated[str | None, Field(...)]
    created_at: typing.Annotated[datetime, Field(...)]

    @classmethod
    def from_model(cls, profile: Profile) -> "ProfileResponse":
        return ProfileResponse(
            id=profile.id,
            username=profile.username,
            display_name=profile.display_name,
            created_at=profile.created_at,
        )
