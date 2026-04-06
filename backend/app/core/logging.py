import logging
import typing

import structlog
from structlog.types import Processor

from app.core.config import settings

__all__ = ("configure_logging", "get_logger")


def configure_logging() -> None:
    shared_processors: typing.List[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    if settings.is_local:
        processors = shared_processors + [structlog.dev.ConsoleRenderer()]
    else:
        processors = shared_processors + [structlog.processors.JSONRenderer()]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
    )


def get_logger() -> structlog.types.FilteringBoundLogger:
    logger = structlog.get_logger()
    return typing.cast(structlog.types.FilteringBoundLogger, logger)
