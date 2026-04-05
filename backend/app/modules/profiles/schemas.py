import typing
from datetime import datetime

from app.modules.profiles import Profile
from pydantic import BaseModel, Field

__all__ = ("ProfileResponse",)


class ProfileResponse(BaseModel):
    id: typing.Annotated[str, Field(...)]
    username: typing.Annotated[str, Field(...)]
    display_name: typing.Annotated[typing.Optional[str], Field(...)]
    created_at: typing.Annotated[datetime, Field(...)]

    @classmethod
    def from_model(cls, profile: Profile) -> "ProfileResponse":
        return ProfileResponse(
            id=profile.id,
            username=profile.username,
            display_name=profile.display_name,
        )


name: str = 1
