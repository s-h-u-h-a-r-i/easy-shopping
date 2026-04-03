from typing import Annotated

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

__all__ = ("settings",)


class Settings(BaseSettings):
    host: Annotated[
        str,
        Field(
            default="127.0.0.1",
            description="Host for the FastAPI server (e.g., 0.0.0.0 for all interfaces)",
            alias="HOST",
        ),
    ]
    port: Annotated[
        int,
        Field(default=8000, description="Port for the FastAPI server", alias="PORT"),
    ]

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()  # type: ignore[call-arg]
