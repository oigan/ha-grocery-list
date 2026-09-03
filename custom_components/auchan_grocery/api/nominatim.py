"""Nominatim (OpenStreetMap) geocoding client — primary geo provider."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any

import aiohttp

from ..const import (
    NOMINATIM_BASE_URL,
    NOMINATIM_REVERSE_ENDPOINT,
    NOMINATIM_SEARCH_ENDPOINT,
    NOMINATIM_USER_AGENT,
    RO_LAT_MAX,
    RO_LAT_MIN,
    RO_LNG_MAX,
    RO_LNG_MIN,
)

_LOGGER = logging.getLogger(__name__)

NOMINATIM_TIMEOUT = 5  # seconds — spec: fallback la Photon dacă depășim


@dataclass
class GeoResult:
    """Geocoding result with coordinates and display address."""

    latitude: float
    longitude: float
    display_name: str
    city: str = ""
    country: str = "Romania"
    postcode: str = ""
    raw: dict = field(default_factory=dict)

    def is_in_romania(self) -> bool:
        """Validate coordinates are within România bounding box."""
        return (
            RO_LAT_MIN <= self.latitude <= RO_LAT_MAX
            and RO_LNG_MIN <= self.longitude <= RO_LNG_MAX
        )


class NominatimError(Exception):
    """Raised on Nominatim API failure."""


class NominatimClient:
    """
    Async Nominatim (OSM) geocoding client.

    - Forward geocoding: text address → GeoResult
    - Reverse geocoding: lat/lng → GeoResult
    - Rate limit: 1 req/sec (per Nominatim ToS)
    - Timeout: 5s (spec: fallback la Photon dacă depășim)

    Usage::

        async with aiohttp.ClientSession() as session:
            client = NominatimClient(session)
            result = await client.forward("Strada Exemplu 1, București")
    """

    _rate_lock = asyncio.Lock()
    _global_last_request_time: float = 0.0

    def __init__(self, session: aiohttp.ClientSession) -> None:
        self._session = session
        self._headers = {
            "User-Agent": NOMINATIM_USER_AGENT,
            "Accept-Language": "ro",
        }
        self._timeout = aiohttp.ClientTimeout(total=NOMINATIM_TIMEOUT)

    async def forward(self, query: str, limit: int = 5) -> list[GeoResult]:
        """
        Forward geocoding: text → list of GeoResult candidates.

        Returns top `limit` results. Caller picks best match.
        Raises NominatimError on failure.
        """
        await self._rate_limit()

        params = {
            "q": query,
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": limit,
            "countrycodes": "ro",  # limităm la România
        }

        try:
            data = await self._get(NOMINATIM_SEARCH_ENDPOINT, params)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            raise NominatimError(f"Nominatim forward geocode failed: {exc}") from exc

        if not data:
            return []

        return [self._parse_search_result(item) for item in data]

    async def reverse(self, lat: float, lng: float) -> GeoResult:
        """
        Reverse geocoding: lat/lng → GeoResult.

        Raises NominatimError on failure or if no result.
        """
        await self._rate_limit()

        params = {
            "lat": lat,
            "lon": lng,
            "format": "jsonv2",
            "addressdetails": 1,
        }

        try:
            data = await self._get(NOMINATIM_REVERSE_ENDPOINT, params)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            raise NominatimError(f"Nominatim reverse geocode failed: {exc}") from exc

        if not data or "error" in data:
            raise NominatimError("No reverse geocode result")

        return self._parse_search_result(data)

    async def _get(self, endpoint: str, params: dict) -> Any:
        url = f"{NOMINATIM_BASE_URL}{endpoint}"
        async with self._session.get(
            url, params=params, headers=self._headers, timeout=self._timeout
        ) as resp:
            resp.raise_for_status()
            return await resp.json(content_type=None)

    async def _rate_limit(self) -> None:
        """Ensure ≥1s between Nominatim requests (ToS compliance)."""
        import time

        async with self._rate_lock:
            now = time.monotonic()
            elapsed = now - type(self)._global_last_request_time
            if elapsed < 1.0:
                await asyncio.sleep(1.0 - elapsed)
            type(self)._global_last_request_time = time.monotonic()

    @staticmethod
    def _parse_search_result(data: dict) -> GeoResult:
        address = data.get("address", {})
        return GeoResult(
            latitude=float(data.get("lat", 0)),
            longitude=float(data.get("lon", 0)),
            display_name=data.get("display_name", ""),
            city=(
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
                or ""
            ),
            country=address.get("country", "Romania"),
            postcode=address.get("postcode", ""),
            raw=data,
        )
