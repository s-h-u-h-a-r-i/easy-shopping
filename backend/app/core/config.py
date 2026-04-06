import typing
from enum import StrEnum

from pydantic import Field, StringConstraints
from pydantic_settings import BaseSettings, SettingsConfigDict

__all__ = ("settings",)


class Environment(StrEnum):
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    # region Environment

    env: typing.Annotated[
        Environment,
        Field(
            ..., description="Deployment environment (e.g., local, staging, production)"
        ),
    ]

    @property
    def is_local(self) -> bool:
        return self.env == Environment.LOCAL

    # endregion Environment

    # region Server Config

    host: typing.Annotated[
        str,
        Field(
            default="127.0.0.1",
            description="Host for the FastAPI server (e.g., 0.0.0.0 for all interfaces)",
        ),
        StringConstraints(
            min_length=7,
            max_length=15,
            pattern=r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^localhost$",
            strip_whitespace=True,
        ),
    ]
    port: typing.Annotated[
        int,
        Field(
            default=8000,
            ge=1,
            le=65535,
            description="Port for the FastAPI server (1-65535)",
        ),
    ]
    allowed_origins: typing.Annotated[
        typing.List[str],
        Field(
            ...,
            description="List of allowed CORS origins. Must not be empty.",
            min_length=1,
        ),
    ]

    # endregion Server Config

    # region Supabase Config

    supabase_url: typing.Annotated[
        str,
        Field(..., description="Supabase project URL (e.g. https://xyz.supabase.co)"),
        StringConstraints(
            min_length=10,
            max_length=200,
            pattern=r"^https://[a-z0-9]+\.supabase\.co$",
            strip_whitespace=True,
        ),
    ]
    supabase_service_role_key: typing.Annotated[
        str,
        Field(
            ...,
            description="Supabase Service Role key (high privilege, only for backend use)",
        ),
        StringConstraints(
            min_length=40,
            pattern=r"^[A-Za-z0-9\._\-]+$",
            strip_whitespace=True,
        ),
    ]

    # endregion Supabase Config

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()  # type: ignore[call-arg]
