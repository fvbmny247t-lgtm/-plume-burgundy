"""Smoobu REST client with HMAC-SHA256 request signing.

Official scheme (support.smoobu.com / docs.smoobu.com):
  Headers on every request: X-API-Key, X-Timestamp (UTC ISO8601 'Z'),
  X-Nonce (UUID v4), X-Signature (Base64 HMAC-SHA256).
  Canonical string:
      METHOD \n PATH \n SORTED_QUERY \n TIMESTAMP \n NONCE \n BODY_SHA256_HEX \n API_KEY
  GET/DELETE => body is the empty string. Query params sorted alphabetically.
"""
import os
import base64
import hashlib
import hmac
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx

logger = logging.getLogger(__name__)

BASE = os.environ.get("SMOOBU_API_BASE_URL", "https://login.smoobu.com/api").rstrip("/")


def _creds():
    key = os.environ.get("SMOOBU_API_KEY")
    secret = os.environ.get("SMOOBU_API_SECRET")
    if not key or not secret:
        raise RuntimeError("SMOOBU_API_KEY and SMOOBU_API_SECRET are required")
    return key, secret


def _base_path() -> str:
    # BASE ends with '/api'; keep that prefix in the signed PATH.
    from urllib.parse import urlparse
    return urlparse(BASE).path.rstrip("/")  # e.g. "/api"


def _signed_headers(method: str, path: str, query: str, body: bytes = b"") -> dict:
    key, secret = _creds()
    ts = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    nonce = str(uuid.uuid4())
    body_hash = hashlib.sha256(body).hexdigest()
    canonical = "\n".join([method.upper(), path, query, ts, nonce, body_hash, key])
    sig = base64.b64encode(
        hmac.new(secret.encode(), canonical.encode(), hashlib.sha256).digest()
    ).decode()
    return {
        "X-API-Key": key,
        "X-Timestamp": ts,
        "X-Nonce": nonce,
        "X-Signature": sig,
        "Accept": "application/json",
    }


def _sorted_query(params: dict) -> str:
    pairs = sorted(
        (k, str(v).lower() if isinstance(v, bool) else str(v))
        for k, v in params.items()
        if v is not None
    )
    return urlencode(pairs)


async def get(endpoint: str, params: dict | None = None) -> dict:
    params = params or {}
    query = _sorted_query(params)
    path = f"{_base_path()}/{endpoint.lstrip('/')}"
    url = f"{BASE}/{endpoint.lstrip('/')}" + (f"?{query}" if query else "")
    headers = _signed_headers("GET", path, query)
    async with httpx.AsyncClient(timeout=30) as client:
        for attempt in range(3):
            r = await client.get(url, headers=headers)
            if r.status_code == 429:
                retry_after = int(r.headers.get("X-RateLimit-Retry-After", "2"))
                await asyncio.sleep(min(retry_after, 10))
                continue
            if r.is_error:
                raise RuntimeError(f"Smoobu {r.status_code} on {endpoint}: {r.text[:300]}")
            return r.json()
    raise RuntimeError("Smoobu rate limit: exhausted retries")


async def get_apartments() -> dict:
    return await get("apartments", {})


async def iter_reservations(**filters):
    """Yield every booking across all pages for the given filters."""
    page = 1
    while True:
        data = await get("reservations", {"page": page, "pageSize": 100, **filters})
        bookings = data.get("bookings", []) or []
        for b in bookings:
            yield b
        page_count = data.get("page_count") or 1
        if page >= page_count or not bookings:
            break
        page += 1
