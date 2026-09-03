"""Async HTTP client for VTEX / Auchan.ro API calls with retry and backoff."""

from __future__ import annotations

import asyncio
import logging
from collections import defaultdict
from email.utils import parsedate_to_datetime
from datetime import UTC, datetime
from typing import Any

import aiohttp

from ..const import (
    AUCHAN_BASE_URL,
    HTTP_MAX_RETRIES,
    HTTP_RETRY_BACKOFF_BASE,
    HTTP_RETRY_STATUS_CODES,
    HTTP_TIMEOUT_SECONDS,
)

_LOGGER = logging.getLogger(__name__)


class VtexApiError(Exception):
    """Generic VTEX API error."""


class VtexRateLimitError(VtexApiError):
    """Raised when VTEX returns 429 Too Many Requests."""


class VtexNotFoundError(VtexApiError):
    """Raised when VTEX returns 404."""


class VtexClient:
    """
    Async HTTP client for all VTEX / auchan.ro API calls.

    Features:
    - Automatic retry with exponential backoff for idempotent reads only
    - Configurable timeout
    - Structured error mapping
    - Session reuse via aiohttp.ClientSession
    """

    def __init__(
        self,
        session: aiohttp.ClientSession,
        base_url: str = AUCHAN_BASE_URL,
        timeout: int = HTTP_TIMEOUT_SECONDS,
        max_retries: int = HTTP_MAX_RETRIES,
    ) -> None:
        self._session = session
        self._base_url = base_url.rstrip("/")
        self._timeout = aiohttp.ClientTimeout(total=timeout)
        self._max_retries = max_retries
        self._headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "ha-auchan-grocery/0.4.1",
        }
        self._mutation_locks: defaultdict[str, asyncio.Lock] = defaultdict(asyncio.Lock)

    @property
    def session(self) -> aiohttp.ClientSession:
        """Return the shared Home Assistant client session."""
        return self._session

    def mutation_lock(self, resource_id: str) -> asyncio.Lock:
        """Return the shared serialization lock for a mutable VTEX resource."""
        return self._mutation_locks[resource_id]

    async def get(
        self,
        path: str,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Perform a GET request with retry logic."""
        return await self._request("GET", path, params=params, headers=headers)

    async def post(
        self,
        path: str,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Perform a POST request with retry logic."""
        return await self._request(
            "POST", path, json=json, params=params, headers=headers
        )

    async def put(
        self,
        path: str,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Perform a PUT request with retry logic."""
        return await self._request("PUT", path, json=json, headers=headers)

    async def patch(
        self,
        path: str,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Perform a PATCH request with retry logic."""
        return await self._request("PATCH", path, json=json, headers=headers)

    async def delete(
        self,
        path: str,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        """Perform a non-retried DELETE request."""
        return await self._request("DELETE", path, json=json, headers=headers)

    async def _request(
        self,
        method: str,
        path: str,
        json: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        url = f"{self._base_url}{path}"
        merged_headers = {**self._headers, **(headers or {})}
        last_exc: Exception | None = None
        retry_count = self._max_retries if method in {"GET", "HEAD", "OPTIONS"} else 0

        for attempt in range(retry_count + 1):
            try:
                async with self._session.request(
                    method,
                    url,
                    json=json,
                    params=params,
                    headers=merged_headers,
                    timeout=self._timeout,
                ) as response:
                    if response.status == 404:
                        raise VtexNotFoundError(f"VTEX resource not found: {path}")

                    if response.status == 429:
                        wait = self._retry_after_seconds(response, attempt)
                        _LOGGER.warning(
                            "VTEX rate limited (%s %s). Retry %d/%d in %.1fs",
                            method,
                            path,
                            attempt + 1,
                            retry_count,
                            wait,
                        )
                        if attempt < retry_count:
                            await asyncio.sleep(wait)
                            continue
                        raise VtexRateLimitError(
                            f"VTEX rate limit reached for {method} {path}"
                        )

                    if response.status in HTTP_RETRY_STATUS_CODES:
                        wait = self._retry_after_seconds(response, attempt)
                        _LOGGER.warning(
                            "VTEX error %d (%s %s). Retry %d/%d in %.1fs",
                            response.status,
                            method,
                            path,
                            attempt + 1,
                            retry_count,
                            wait,
                        )
                        last_exc = VtexApiError(
                            f"VTEX HTTP {response.status} for {method} {path}"
                        )
                        if attempt < retry_count:
                            await asyncio.sleep(wait)
                            continue
                        raise last_exc

                    if response.status >= 400:
                        raise VtexApiError(
                            f"VTEX HTTP {response.status} for {method} {path}"
                        )

                    content_type = response.headers.get("Content-Type", "")
                    if "application/json" in content_type:
                        return await response.json(content_type=None)
                    return await response.text()

            except (aiohttp.ClientConnectionError, asyncio.TimeoutError) as exc:
                wait = self._backoff(attempt)
                _LOGGER.warning(
                    "Network error (%s %s): %s. Retry %d/%d in %.1fs",
                    method,
                    path,
                    exc,
                    attempt + 1,
                    retry_count,
                    wait,
                )
                last_exc = exc
                if attempt < retry_count:
                    await asyncio.sleep(wait)
                    continue

        raise VtexApiError(f"VTEX request failed for {method} {path}") from last_exc

    @staticmethod
    def _backoff(attempt: int) -> float:
        """Exponential backoff: 1s, 2s, 4s, 8s…"""
        return HTTP_RETRY_BACKOFF_BASE * (2**attempt)

    @classmethod
    def _retry_after_seconds(
        cls, response: aiohttp.ClientResponse, attempt: int
    ) -> float:
        """Honor Retry-After while keeping waits bounded for HA updates."""
        value = response.headers.get("Retry-After", "").strip()
        if value:
            try:
                return min(30.0, max(0.0, float(value)))
            except ValueError:
                try:
                    retry_at = parsedate_to_datetime(value)
                    if retry_at.tzinfo is None:
                        retry_at = retry_at.replace(tzinfo=UTC)
                    return min(
                        30.0,
                        max(0.0, (retry_at - datetime.now(UTC)).total_seconds()),
                    )
                except (TypeError, ValueError, OverflowError):
                    pass
        return cls._backoff(attempt)
