"""VTEX Regions v2 API client for Auchan.ro — regionId discovery + sellers."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import quote

from .nominatim import NominatimClient
from .photon import PhotonClient, geocode_with_fallback, reverse_geocode_with_fallback
from .vtex_client import VtexClient
from ..const import (
    DEFAULT_COUNTRY,
    VTEX_REGIONS_ENDPOINT,
    VTEX_REGIONS_V2_ENDPOINT,
)

_LOGGER = logging.getLogger(__name__)


# ── Data models ────────────────────────────────────────────────────────────────


@dataclass
class SellerInfo:
    """A VTEX seller that can service a given address/region."""

    id: str
    name: str
    logo: str = ""
    # Coordinates may not be in the regions API response; populated separately
    latitude: float = 0.0
    longitude: float = 0.0
    distance_km: float = 0.0
    address: str = ""
    city: str = ""
    fulfillment_endpoints: list[str] = field(default_factory=list)


# ── Client ────────────────────────────────────────────────────────────────────


class VtexRegionsClient:
    """
    Client for VTEX Checkout Regions v2 endpoints.

    Responsibilities:
    - Discover regionId from address (geoCoordinates first → postalCode fallback)
    - Fetch sellers/stores for a given regionId + coordinates
    - Expose geocode autocomplete via Photon (proxy for frontend)

    Strategy for regionId discovery:
    1. Try geoCoordinates → GET /api/checkout/pub/regions?country=ROU
                            &geoCoordinates={lng}&geoCoordinates={lat}
    2. If CHK0119 / no result → fallback to postalCode (from reverse geocode)
    """

    def __init__(self, vtex: VtexClient) -> None:
        self._vtex = vtex

    # ── Region resolution (primary — used at address save) ───────────────────

    async def resolve_region(
        self,
        latitude: float,
        longitude: float,
        country: str = DEFAULT_COUNTRY,
        postal_code: str | None = None,
    ) -> dict | None:
        """
        Resolve VTEX regionId + primary seller for given coordinates.

        Calls: GET /api/checkout/pub/regions with two repeated
        ``geoCoordinates`` query values, in LONGITUDE then LATITUDE order.

        Returns: {region_id, seller_id, store_name} or None on failure.
        Used at address save time so regionId is cached on the address.
        """
        region_id = await self.get_region_id(
            latitude, longitude, postal_code=postal_code, country=country
        )
        if not region_id:
            return None
        sellers = await self.get_sellers_by_region(
            region_id, latitude, longitude, country
        )
        first_seller = sellers[0] if sellers else None

        result = {
            "region_id": region_id,
            "seller_id": first_seller.id if first_seller else "",
            "store_name": first_seller.name if first_seller else "",
            "all_sellers": [
                {"id": seller.id, "name": seller.name} for seller in sellers
            ],
        }
        _LOGGER.info("Regionalization resolved successfully")
        return result

    async def get_region_id(
        self,
        latitude: float,
        longitude: float,
        postal_code: str | None = None,
        country: str = DEFAULT_COUNTRY,
    ) -> str | None:
        """
        Discover VTEX regionId for given coordinates.

        Strategy:
        1. geoCoordinates (direct — faster, no extra geocode needed)
        2. postalCode (from arg or reverse geocode via Nominatim)
        """
        # Attempt #1: geoCoordinates
        region_id = await self._region_by_geo(latitude, longitude, country)
        if region_id:
            return region_id

        _LOGGER.debug("Coordinate regionalization failed; trying postal code")

        # Attempt #2: postalCode
        postcode = postal_code or await self._reverse_geocode_postcode(
            latitude, longitude
        )
        if not postcode:
            _LOGGER.error("Cannot determine regionId — no postal code available")
            return None

        return await self._region_by_postcode(postcode, country)

    async def _region_by_geo(
        self, latitude: float, longitude: float, country: str = DEFAULT_COUNTRY
    ) -> str | None:
        """Try GET /regions?geoCoordinates=lng&geoCoordinates=lat."""
        params = {
            "country": country,
            "geoCoordinates": [str(longitude), str(latitude)],
        }
        try:
            data = await self._vtex.get(VTEX_REGIONS_ENDPOINT, params=params)
            if isinstance(data, list) and data:
                region_id = data[0].get("id")
                if region_id:
                    _LOGGER.debug("Resolved regionId via coordinates")
                    return region_id
        except Exception as exc:  # noqa: BLE001
            _LOGGER.debug("geoCoordinates regionId lookup failed: %s", exc)
        return None

    async def _region_by_postcode(
        self, postal_code: str, country: str = DEFAULT_COUNTRY
    ) -> str | None:
        """Try GET /regions?postalCode=XXXXX."""
        params = {"country": country, "postalCode": postal_code}
        try:
            data = await self._vtex.get(VTEX_REGIONS_ENDPOINT, params=params)
            if isinstance(data, list) and data:
                region_id = data[0].get("id")
                if region_id:
                    _LOGGER.debug("Resolved regionId via postal code")
                    return region_id
        except Exception as exc:  # noqa: BLE001
            _LOGGER.error("Postal-code regionId lookup failed: %s", exc)
        return None

    # ── Sellers by region ─────────────────────────────────────────────────────

    async def get_sellers_by_region(
        self,
        region_id: str,
        latitude: float,
        longitude: float,
        country: str = DEFAULT_COUNTRY,
    ) -> list[SellerInfo]:
        """
        Fetch sellers that service a given regionId.

        Calls GET /api/checkout/pub/regions/{region_id}
             ?country=ROU&geoCoordinates={lng}&geoCoordinates={lat}
             &individualShippingEstimates=true
        """
        if not region_id or len(region_id) > 256 or any(c.isspace() for c in region_id):
            return []
        path = VTEX_REGIONS_V2_ENDPOINT.format(region_id=quote(region_id, safe="._-~"))
        params: dict[str, Any] = {
            "country": country,
            "geoCoordinates": [str(longitude), str(latitude)],
            "individualShippingEstimates": "true",
        }
        try:
            data = await self._vtex.get(path, params=params)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.error("Seller lookup for resolved region failed: %s", exc)
            return []

        return self._parse_sellers(data)

    async def get_sellers_by_address(
        self,
        latitude: float,
        longitude: float,
        postal_code: str | None = None,
        country: str = DEFAULT_COUNTRY,
    ) -> tuple[str | None, list[SellerInfo]]:
        """
        Convenience: discover regionId then fetch sellers.

        Returns (region_id, sellers).
        """
        region_id = await self.get_region_id(latitude, longitude, postal_code, country)
        if not region_id:
            return None, []

        sellers = await self.get_sellers_by_region(
            region_id, latitude, longitude, country
        )
        return region_id, sellers

    # ── Parsing ───────────────────────────────────────────────────────────────

    @staticmethod
    def _parse_sellers(data: Any) -> list[SellerInfo]:
        """Parse VTEX regions v2 response into SellerInfo list."""
        if not isinstance(data, dict):
            return []

        raw_sellers: list[dict] = data.get("sellers", [])
        sellers: list[SellerInfo] = []

        for raw in raw_sellers:
            seller_id = str(raw.get("id", ""))
            name = raw.get("name", raw.get("id", ""))
            logo = raw.get("logo", "")

            # Extract fulfillment endpoints (may contain address info)
            endpoints: list[str] = [
                ep.get("endpoint", "")
                for ep in raw.get("fulfillmentEndpoints", [])
                if ep.get("endpoint")
            ]

            sellers.append(
                SellerInfo(
                    id=seller_id,
                    name=name,
                    logo=logo,
                    fulfillment_endpoints=endpoints,
                )
            )

        _LOGGER.debug("Parsed %d sellers from regions v2 response", len(sellers))
        return sellers

    # ── Geocoding helpers (proxy for frontend autocomplete) ───────────────────

    async def geocode_autocomplete(self, query: str, limit: int = 5) -> list[dict]:
        """
        Autocomplete address search via Photon (komoot.io).

        Returns list of {display_name, latitude, longitude, postal_code} dicts.
        Photon is queried directly — no VTEX dependency.
        """
        session = self._vtex.session
        results = await geocode_with_fallback(
            NominatimClient(session), PhotonClient(session), query, limit=limit
        )
        return [
            {
                "display_name": result.display_name,
                "latitude": result.latitude,
                "longitude": result.longitude,
                "postal_code": result.postcode,
                "city": result.city,
            }
            for result in results
            if result.is_in_romania()
        ]

    async def _reverse_geocode_postcode(
        self, latitude: float, longitude: float
    ) -> str | None:
        """Reverse geocode coordinates to postal code via Nominatim."""
        session = self._vtex.session
        result = await reverse_geocode_with_fallback(
            NominatimClient(session), PhotonClient(session), latitude, longitude
        )
        return result.postcode if result else None
