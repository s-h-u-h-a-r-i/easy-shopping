import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware

__all__ = ("LoggingMiddleware",)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        structlog.contextvars.clear_contextvars()

        structlog.contextvars.bind_contextvars(
            request_id=str(uuid.uuid4()), method=request.method, path=request.url.path
        )

        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start

        structlog.contextvars.bind_contextvars(
            status_code=response.status_code, duration=duration
        )
        structlog.get_logger().info("Request completed", duration=duration)

        return response
