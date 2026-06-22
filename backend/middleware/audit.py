"""Audit/observability middleware — observe-only, additive.

Wraps every HTTP request and records one document into the `audit_logs`
collection. It NEVER changes existing behavior:
  * unhandled exceptions are captured (type + message + stack trace) and then
    RE-RAISED so FastAPI's default 500 response is unchanged,
  * for >=400 responses the body is drained and rebuilt byte-for-byte so the
    client receives identical content (and we can read the error detail),
  * success (<400) responses are passed through untouched,
  * the DB write is fire-and-forget and self-swallowing, so a logging failure
    can never bubble into the request.

Request bodies are intentionally NOT read/replayed (that could break downstream
routes), so payloads are not captured — the "raw payload" shown in the UI is the
assembled audit event itself.
"""

import asyncio
import json
import os
import re
import time
import traceback
import uuid
from datetime import datetime

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

# Paths we never log (self-noise / recursion / noise).
_SKIP_PREFIXES = ("/api/admin/audit",)
_SKIP_EXACT = {"/", "/health"}

_MODULE_MAP = {
    "/api/auth": "Auth Service",
    "/api/predictions": "Prediction Service",
    "/api/payment": "Payment Service",
    "/api/admin": "Admin Service",
}

_USER_ID_RE = re.compile(r"/(?:user|consume-token|users)/([A-Za-z0-9]+)")

_ENVIRONMENT = os.getenv("ENVIRONMENT", "production")


def _module_for(path: str) -> str:
    for prefix, name in _MODULE_MAP.items():
        if path.startswith(prefix):
            return name
    return "Other"


def _action_for(method: str, path: str) -> str:
    tail = path.rstrip("/").split("/")[-1] or "root"
    # strip obvious id segments so actions group nicely
    if re.fullmatch(r"[A-Za-z0-9]{16,}", tail):
        parts = path.rstrip("/").split("/")
        tail = parts[-2] if len(parts) >= 2 else tail
    return f"{method.lower()}_{tail}"


def _error_meta(status_code: int):
    """Return (error_code, error_category, is_security) for a status code."""
    mapping = {
        400: ("BAD_REQUEST", "Bad Request", False),
        401: ("UNAUTHORIZED", "Unauthorized", True),
        402: ("PAYMENT_REQUIRED", "Payment Required", False),
        403: ("FORBIDDEN", "Forbidden", True),
        404: ("RESOURCE_NOT_FOUND", "Resource Not Found", False),
        409: ("CONFLICT", "Conflict", False),
        422: ("VALIDATION_ERROR", "Validation Error", False),
        429: ("RATE_LIMITED", "Rate Limited", True),
    }
    if status_code in mapping:
        return mapping[status_code]
    if status_code >= 500:
        return ("INTERNAL_ERROR", "Internal Server Error", False)
    return (None, None, False)


def _severity_for(status_code: int) -> str:
    if status_code >= 500:
        return "error"
    if status_code >= 400:
        return "warning"
    return "info"


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        path = request.url.path
        if request.method == "OPTIONS" or path in _SKIP_EXACT or any(
            path.startswith(p) for p in _SKIP_PREFIXES
        ):
            return await call_next(request)

        start = time.perf_counter()
        correlation_id = str(uuid.uuid4())
        exc_info = None
        status_code = 500
        error_message = None
        response = None

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as exc:  # noqa: BLE001 — observe then re-raise
            exc_info = {
                "exception_type": type(exc).__name__,
                "error_message": str(exc),
                "stack_trace": traceback.format_exc(),
            }
            error_message = str(exc)
            status_code = 500

        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        # For >=400 responses, read the body so we can capture the error detail,
        # then rebuild an identical response for the client.
        rebuilt = None
        if response is not None and status_code >= 400:
            try:
                body_chunks = [chunk async for chunk in response.body_iterator]
                body = b"".join(
                    c if isinstance(c, bytes) else c.encode("utf-8") for c in body_chunks
                )
                rebuilt = Response(
                    content=body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type,
                )
                try:
                    parsed = json.loads(body.decode("utf-8"))
                    if isinstance(parsed, dict):
                        error_message = parsed.get("detail") or parsed.get("message")
                except (ValueError, UnicodeDecodeError):
                    pass
            except Exception:  # noqa: BLE001 — never break the response on logging
                rebuilt = None

        # Assemble + persist the audit event (fire-and-forget, never blocks).
        try:
            db = getattr(request.app, "db", None)
            if db is not None:
                event = self._build_event(
                    request, path, status_code, duration_ms, correlation_id,
                    error_message, exc_info,
                )
                asyncio.create_task(self._safe_insert(db, event))
        except Exception:  # noqa: BLE001
            pass

        if exc_info is not None:
            # Re-raise so FastAPI's default error handling is unchanged.
            raise

        return rebuilt if rebuilt is not None else response

    def _build_event(self, request, path, status_code, duration_ms, correlation_id,
                     error_message, exc_info) -> dict:
        method = request.method
        user_match = _USER_ID_RE.search(path)
        error_code, error_category, is_security = _error_meta(status_code)
        status = "success" if status_code < 400 else "failure"
        severity = _severity_for(status_code)

        fwd = request.headers.get("x-forwarded-for")
        ip = fwd.split(",")[0].strip() if fwd else (
            request.client.host if request.client else None
        )

        event = {
            "ts": datetime.utcnow(),
            "correlation_id": correlation_id,
            "method": method,
            "path": path,
            "query": str(request.url.query) or None,
            "action": _action_for(method, path),
            "module": _module_for(path),
            "event_type": _module_for(path).replace(" Service", ""),
            "severity": severity,
            "status": status,
            "status_code": status_code,
            "error_code": error_code,
            "error_category": error_category,
            "error_message": error_message,
            "is_security": is_security,
            "user_id": user_match.group(1) if user_match else None,
            "ip": ip,
            "user_agent": request.headers.get("user-agent"),
            "duration_ms": duration_ms,
            "environment": _ENVIRONMENT,
        }
        if exc_info:
            event.update(exc_info)
        return event

    @staticmethod
    async def _safe_insert(db, event):
        try:
            await db.audit_logs.insert_one(event)
        except Exception:  # noqa: BLE001 — logging must never raise
            pass
