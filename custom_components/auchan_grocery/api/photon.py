"""Photon (Komoot) geocoding client — fallback geo provider."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp

from ..const import (
    PHOTON_BASE_URL,
    PHOTON_REVERSE_ENDPOINT,
    PHOTON_SEARCH_ENDPOINT,
)
from .nominatim import GeoResult, NominatimError

_LOGGER = logging.getLogger(__name__)

PHOTON_TIMEOUT = 5  # seconds


class PhotonError(Exception):
    """Raised on Photon API failure."""


class PhotonClient:
    """
    Async Photon (photon.komoot.io) geocoding client — fallback provider.

    Same GeoResult interface as NominatimClient for transparent substitution.
    Photon is faster, no rate limit declared, also based on OSM data.

    Usage::

        async with aiohttp.ClientSession() as session:
            client = PhotonClient(session)
            results = await client.forward("București, Sector 3")
    """

    def __init__(self, session: aiohttp.ClientSession) -> None:
        self._session = session
        self._headers = {
            "Accept": "application/json",
            "User-Agent": "ha-auchan-grocery/0.4.0",
        }
        self._timeout = aiohttp.ClientTimeout(total=PHOTON_TIMEOUT)

    async def forward(self, query: str, limit: int = 5) -> list[GeoResult]:
        """
        Forward geocoding: text → list of GeoResult.

        Raises PhotonError on failure.
        """
        params = {
            "q": query,
            "limit": limit,
            "lang": "ro",
            "bbox": "20.2,43.6,30.0,48.3",  # România bounding box
        }

        try:
            data = await self._get(PHOTON_SEARCH_ENDPOINT, params)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            raise PhotonError(f"Photon forward geocode failed: {exc}") from exc

        features = data.get("features", [])
        return [self._parse_feature(f) for f in features]

    async def reverse(self, lat: float, lng: float) -> GeoResult:
        """
        Reverse geocoding: lat/lng → GeoResult.

        Raises PhotonError on failure or no result.
        """
        params = {"lat": lat, "lon": lng, "lang": "ro"}

        try:
            data = await self._get(PHOTON_REVERSE_ENDPOINT, params)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            raise PhotonError(f"Photon reverse geocode failed: {exc}") from exc

        features = data.get("features", [])
        if not features:
            raise PhotonError("No reverse geocode result")

        return self._parse_feature(features[0])

    async def _get(self, endpoint: str, params: dict) -> Any:
        url = f"{PHOTON_BASE_URL}{endpoint}"
        async with self._session.get(
            url, params=params, headers=self._headers, timeout=self._timeout
        ) as resp:
            resp.raise_for_status()
            return await resp.json(content_type=None)

    @staticmethod
    def _parse_feature(feature: dict) -> GeoResult:
        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [0.0, 0.0])
        # GeoJSON: [longitude, latitude]
        lng, lat = float(coords[0]), float(coords[1])

        city = props.get("city") or props.get("county") or props.get("state") or ""
        display_parts = [
            props.get("name", ""),
            props.get("street", ""),
            props.get("housenumber", ""),
            city,
            props.get("country", ""),
        ]
        display_name = ", ".join(p for p in display_parts if p)

        return GeoResult(
            latitude=lat,
            longitude=lng,
            display_name=display_name,
            city=city,
            country=props.get("country", "Romania"),
            postcode=props.get("postcode", ""),
            raw=feature,
        )


async def geocode_with_fallback(
    nominatim: Any,
    photon: PhotonClient,
    query: str,
    limit: int = 5,
) -> list[GeoResult]:
    """
    Forward geocode with automatic Nominatim → Photon fallback.

    Tries Nominatim first. If it raises NominatimError (timeout, error, empty),
    falls back transparently to Photon.

    Returns list of GeoResult candidates (at most `limit`).
    """
    try:
        results = await nominatim.forward(query, limit=limit)
        if results:
            _LOGGER.debug("Nominatim returned %d geocoding results", len(results))
            return results
        _LOGGER.debug("Nominatim returned no geocoding results; trying Photon")
    except NominatimError as exc:
        _LOGGER.warning("Nominatim failed: %s — falling back to Photon", exc)

    try:
        results = await photon.forward(query, limit=limit)
        _LOGGER.debug("Photon returned %d geocoding results", len(results))
        return results
    except PhotonError as exc:
        _LOGGER.error("Both geocoding providers failed: %s", exc)
        return []


async def reverse_geocode_with_fallback(
    nominatim: Any,
    photon: PhotonClient,
    lat: float,
    lng: float,
) -> GeoResult | None:
    """
    Reverse geocode with automatic Nominatim → Photon fallback.

    Returns GeoResult or None if both providers fail.
    """
    try:
        result = await nominatim.reverse(lat, lng)
        _LOGGER.debug("Reverse geocoded via Nominatim")
        return result
    except NominatimError as exc:
        _LOGGER.warning("Nominatim reverse failed: %s — trying Photon", exc)

    try:
        result = await photon.reverse(lat, lng)
        _LOGGER.debug("Reverse geocoded via Photon")
        return result
    except PhotonError as exc:
        _LOGGER.error("Both providers failed for reverse geocode: %s", exc)
        return None
