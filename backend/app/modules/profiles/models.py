import typing
from dataclasses import dataclass
from datetime import datetime

__all__ = ("Profile",)


@dataclass(frozen=True, kw_only=True)
class Profile:
    id: str
    username: str
    display_name: typing.Optional[str]
    created_at: datetime
