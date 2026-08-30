from __future__ import annotations

import json
import logging
import os
import time
import uuid
from contextvars import ContextVar
from datetime import UTC, datetime

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

request_id_context: ContextVar[str] = ContextVar("request_id", default="")
REQUESTS = Counter("http_requests_total", "HTTP requests", ["service", "method", "route", "status_class"])
DURATION = Histogram("http_request_duration_seconds", "HTTP request duration", ["service", "method", "route"])
IN_PROGRESS = Gauge("http_requests_in_progress", "In-progress HTTP requests", ["service"])


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(UTC).isoformat(),
            "severity": record.levelname,
            "service": getattr(record, "service", os.getenv("SERVICE_NAME", "unknown")),
            "version": os.getenv("SERVICE_VERSION", "0.1.0"),
            "environment": os.getenv("ENVIRONMENT", "local"),
            "requestId": request_id_context.get(),
            "message": record.getMessage(),
            "httpMethod": getattr(record, "http_method", ""),
            "route": getattr(record, "route", ""),
            "responseStatus": getattr(record, "response_status", ""),
            "durationMs": getattr(record, "duration_ms", ""),
        }
        return json.dumps({key: value for key, value in payload.items() if value != ""})


def configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), handlers=[handler], force=True)


class Problem(Exception):
    def __init__(self, status: int, code: str, title: str, detail: str):
        self.status = status
        self.code = code
        self.title = title
        self.detail = detail


def install_http_adapters(app: FastAPI, service_name: str) -> None:
    configure_logging()
    logger = logging.getLogger(service_name)

    @app.middleware("http")
    async def request_context(request: Request, call_next):
        supplied = request.headers.get("x-request-id", "")
        request_id = supplied if 0 < len(supplied) <= 128 and supplied.isascii() and supplied.isprintable() else str(uuid.uuid4())
        token = request_id_context.set(request_id)
        started = time.perf_counter()
        IN_PROGRESS.labels(service_name).inc()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            route = request.scope.get("route")
            route_path = getattr(route, "path", "unmatched")
            elapsed = time.perf_counter() - started
            REQUESTS.labels(service_name, request.method, route_path, f"{status // 100}xx").inc()
            DURATION.labels(service_name, request.method, route_path).observe(elapsed)
            IN_PROGRESS.labels(service_name).dec()
            logger.info("request_completed", extra={"http_method": request.method, "route": route_path, "response_status": status, "duration_ms": round(elapsed * 1000, 2)})
            request_id_context.reset(token)

    @app.exception_handler(Problem)
    async def problem_handler(_: Request, exc: Problem):
        return JSONResponse(
            status_code=exc.status,
            media_type="application/problem+json",
            content={
                "type": f"https://example.invalid/problems/{exc.code}",
                "title": exc.title,
                "status": exc.status,
                "code": exc.code,
                "detail": exc.detail,
                "requestId": request_id_context.get(),
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            media_type="application/problem+json",
            content={
                "type": "https://example.invalid/problems/validation-error",
                "title": "Request validation failed",
                "status": 422,
                "code": "validation-error",
                "detail": "One or more request values are invalid.",
                "requestId": request_id_context.get(),
                "errors": [{"detail": error["msg"], "pointer": "/" + "/".join(str(part) for part in error["loc"] if part != "body")} for error in exc.errors()],
            },
        )

    @app.get("/metrics", summary="Expose Prometheus metrics", operation_id="getMetrics", response_class=PlainTextResponse)
    def metrics() -> PlainTextResponse:
        return PlainTextResponse(generate_latest().decode(), media_type=CONTENT_TYPE_LATEST)
