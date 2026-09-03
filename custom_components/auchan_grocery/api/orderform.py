"""VTEX OrderForm and Logistics API client for Auchan.ro."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

from .nominatim import NominatimClient
from .vtex_client import VtexClient
from ..const import (
    AUCHAN_BASE_URL,
    DEFAULT_COUNTRY,
    DEFAULT_SALES_CHANNEL,
    ORDER_FORM_TTL_DAYS,
    PICKUP_SEARCH_RADIUS_KM,
    VTEX_ORDERFORM_NEW_ENDPOINT,
    VTEX_ORDERFORM_ENDPOINT,
    VTEX_ORDERFORM_ITEMS_ENDPOINT,
    VTEX_ORDERFORM_REMOVE_ALL_ENDPOINT,
    VTEX_ORDERFORM_SHIPPING_ENDPOINT,
    VTEX_PICKUP_POINTS_ENDPOINT,
    VTEX_REGIONS_ENDPOINT,
    VTEX_SIMULATION_ENDPOINT,
)

_LOGGER = logging.getLogger(__name__)


# ── Data models ────────────────────────────────────────────────────────────────


@dataclass
class PickupPoint:
    """An Auchan store available for pickup."""

    id: str
    name: str
    address: str = ""
    city: str = ""
    postal_code: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    distance_km: float = 0.0
    business_hours: list[dict] = field(default_factory=list)
    is_active: bool = True
    seller_id: str = "1"

    @property
    def formatted_address(self) -> str:
        parts = [self.address, self.city, self.postal_code]
        return ", ".join(p for p in parts if p)


@dataclass
class ShippingSla:
    """A shipping SLA option from orderForm simulation."""

    id: str
    name: str
    delivery_channel: str  # "pickup-in-point" | "delivery"
    price: float = 0.0  # RON
    estimate: str = ""  # "1d", "2bd", etc.
    pickup_store_name: str | None = None
    pickup_point_id: str | None = None
    pickup_distance_km: float = 0.0


@dataclass
class SimulationResult:
    """Result of an orderForm simulation for a list."""

    order_form_id: str
    slas: list[ShippingSla] = field(default_factory=list)
    item_prices: dict[str, float] = field(default_factory=dict)  # sku_id → price (RON)
    item_availability: dict[str, str] = field(
        default_factory=dict
    )  # sku_id → availability
    pickup_points: list[PickupPoint] = field(default_factory=list)
    simulated_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())

    @property
    def pickup_slas(self) -> list[ShippingSla]:
        return [s for s in self.slas if s.delivery_channel == "pickup-in-point"]

    @property
    def delivery_slas(self) -> list[ShippingSla]:
        return [s for s in self.slas if s.delivery_channel == "delivery"]


# ── OrderForm client ──────────────────────────────────────────────────────────


class VtexOrderFormClient:
    """
    Client for VTEX Checkout / Logistics API.

    Operations:
    - create_order_form() → new empty orderFormId
    - get_region_id(lng, lat) → regionId string
    - simulate(order_form_id, items, lat, lng) → SimulationResult
    - add_items() / remove_item() → orderForm item management
    - nearby_pickup_points() → list[PickupPoint]
    - is_order_form_expired() → bool (TTL 7 days)
    """

    def __init__(self, vtex: VtexClient) -> None:
        self._vtex = vtex

    # ── Region ────────────────────────────────────────────────────────────────

    async def get_region_id(
        self,
        longitude: float,
        latitude: float,
        country: str = DEFAULT_COUNTRY,
        sales_channel: str = DEFAULT_SALES_CHANNEL,
        postal_code: str | None = None,
    ) -> str | None:
        """
        Get VTEX regionId from postal code (primary) or geo-coordinates (via reverse geocode).

        VTEX regions API accepts `postalCode` via GET — geoCoordinates are NOT
        supported by auchan.ro (returns CHK0119 error).

        Strategy:
        1. If postal_code provided → use directly
        2. Else → reverse geocode lng/lat via Nominatim to get postal code
        3. POST lookup with postalCode → regionId
        """
        postcode = postal_code

        if not postcode:
            # Attempt reverse geocode to obtain postal code
            postcode = await self._reverse_geocode_postcode(latitude, longitude)

        if not postcode:
            _LOGGER.error("Cannot get regionId — no postal code available")
            return None

        params = {
            "country": country,
            "postalCode": postcode,
        }

        try:
            data = await self._vtex.get(VTEX_REGIONS_ENDPOINT, params=params)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.error("Failed to get regionId: %s", exc)
            return None

        if isinstance(data, list) and data:
            region_id = data[0].get("id")
            _LOGGER.debug("Resolved regionId '%s'", region_id)
            return region_id

        _LOGGER.warning("No regionId returned for the configured address")
        return None

    async def _reverse_geocode_postcode(
        self, latitude: float, longitude: float
    ) -> str | None:
        """
        Reverse geocode coordinates to get postal code.

        Uses Nominatim directly (no VtexClient needed).
        Falls back gracefully on any error.
        """
        try:
            result = await NominatimClient(self._vtex.session).reverse(
                latitude, longitude
            )
            return result.postcode or None
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning("Reverse geocode failed: %s", exc)
            return None

    # ── OrderForm lifecycle ───────────────────────────────────────────────────

    async def create_order_form(self) -> str | None:
        """
        Create (or retrieve) a new VTEX orderForm.

        VTEX creates a new orderForm on GET /api/checkout/pub/orderForm
        when no session cookie exists, or returns the current one.
        POST /api/checkout/pub/orderForms is NOT a valid public endpoint (405).
        """
        try:
            data = await self._vtex.get(VTEX_ORDERFORM_NEW_ENDPOINT)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.error("Failed to create orderForm: %s", exc)
            return None

        order_form_id = data.get("orderFormId") if isinstance(data, dict) else None
        if order_form_id:
            _LOGGER.debug("Created or retrieved a monitoring orderForm")
        return order_form_id

    async def get_order_form(self, order_form_id: str) -> dict | None:
        """Fetch current orderForm state."""
        path = VTEX_ORDERFORM_ENDPOINT.format(order_form_id=order_form_id)
        return await self._vtex.get(path)

    def is_order_form_expired(self, last_activity: str | None) -> bool:
        """Check if an orderForm has exceeded its TTL (7 days inactivity)."""
        if not last_activity:
            return True
        try:
            last = datetime.fromisoformat(last_activity)
            if last.tzinfo is None:
                last = last.replace(tzinfo=UTC)
            return datetime.now(UTC) - last > timedelta(days=ORDER_FORM_TTL_DAYS)
        except ValueError:
            return True

    # ── Items management ──────────────────────────────────────────────────────

    async def add_items(
        self,
        order_form_id: str,
        items: list[dict],
        expected_order_form_sections: list[str] | None = None,
    ) -> dict | None:
        """
        Add/update items in an orderForm.

        items format: [{"id": "sku_id", "quantity": 1, "seller": "1"}, ...]
        """
        path = VTEX_ORDERFORM_ITEMS_ENDPOINT.format(order_form_id=order_form_id)
        payload = {
            "orderItems": items,
            "allowedOutdatedData": ["paymentData"],
        }
        return await self._vtex.post(path, json=payload)

    async def update_items(
        self,
        order_form_id: str,
        items: list[dict],
    ) -> dict | None:
        """
        Update items quantity or remove them (by setting quantity to 0).
        items format: [{"id": "sku_id", "quantity": 0, "seller": "1"}, ...]
        """
        from ..const import VTEX_ORDERFORM_UPDATE_ITEMS_ENDPOINT

        path = VTEX_ORDERFORM_UPDATE_ITEMS_ENDPOINT.format(order_form_id=order_form_id)
        payload = {
            "orderItems": items,
            "allowedOutdatedData": ["paymentData"],
        }
        return await self._vtex.post(path, json=payload)

    async def update_shipping_address(
        self,
        order_form_id: str,
        latitude: float,
        longitude: float,
        store_id: str | None = None,
        country: str = DEFAULT_COUNTRY,
        postal_code: str | None = None,
        region_id: str | None = None,
    ) -> dict | None:
        """
        Attach shipping address + regionId to orderForm.

        VTEX validates stock per postal code zone, not geocoordinates.
        regionId is the key for marketplace seller regionalization —
        without it VTEX ignores seller-specific availability.
        """
        path = VTEX_ORDERFORM_SHIPPING_ENDPOINT.format(order_form_id=order_form_id)

        if postal_code:
            address_payload: dict = {
                "addressType": "residential",
                "postalCode": postal_code,
                "country": country,
            }
        else:
            address_payload = {
                "addressType": "search",
                "receiverName": "Auchan Customer",
                "geoCoordinates": [longitude, latitude],
                "country": country,
            }
            if store_id:
                ref = store_id.split("_")[0] if "_" in store_id else store_id
                address_payload["reference"] = ref

        # regionId is critical for VTEX marketplace seller regionalization
        if region_id:
            address_payload["regionId"] = region_id
            _LOGGER.debug("Simulation with regionId=%s", region_id)

        payload = {"selectedAddresses": [address_payload]}
        return await self._vtex.post(path, json=payload)

    # ── Simulation ────────────────────────────────────────────────────────────

    async def clear_order_form_items(self, order_form_id: str) -> bool:
        """
        Remove all items from an orderForm before using it for simulation.

        Prevents item accumulation across scan cycles when reusing orderFormIds.
        Uses the removeAllItems endpoint when available, else zeroes quantities.
        """
        path = VTEX_ORDERFORM_REMOVE_ALL_ENDPOINT.format(order_form_id=order_form_id)
        await self._vtex.post(path, json={"expectedOrderFormSections": ["items"]})
        return True

    async def simulate(
        self,
        items: list[dict],
        latitude: float,
        longitude: float,
        country: str = DEFAULT_COUNTRY,
        sales_channel: str = DEFAULT_SALES_CHANNEL,
    ) -> SimulationResult | None:
        """
        DEPRECATED — Use simulate_order_form() instead.

        The headless /orderForm/simulation endpoint requires a valid VTEX session
        and returns ORD002 (400) for auchan.ro without proper auth cookies.
        Kept for reference only — do not call from production code.
        """
        _LOGGER.warning(
            "simulate() is deprecated and will always fail on auchan.ro. "
            "Use simulate_order_form() instead."
        )
        return None

    async def simulate_order_form(
        self,
        order_form_id: str,
        items: list[dict],
        latitude: float,
        longitude: float,
        store_id: str | None = None,
        postal_code: str | None = None,
        region_id: str | None = None,
    ) -> SimulationResult | None:
        """
        Reliable orderForm-based stock simulation.

        Flow:
        1. Clear existing items (prevent accumulation across scan cycles)
        2. Add target items (POST /items)
        3. Update shippingData with postalCode + regionId → VTEX returns regional availability
        4. Parse items[].availability from response

        regionId is the key for VTEX marketplace seller regionalization:
        Without it, availability is global (any seller), not regional (local store).
        """
        if not items:
            return None

        async with self._vtex.mutation_lock(order_form_id):
            await self.clear_order_form_items(order_form_id)
            added = await self.add_items(order_form_id, items)
            if not isinstance(added, dict):
                raise ValueError("VTEX returned an invalid item mutation response")

            raw = await self.update_shipping_address(
                order_form_id,
                latitude,
                longitude,
                store_id,
                postal_code=postal_code,
                region_id=region_id,
            )
            if not isinstance(raw, dict):
                raise ValueError("VTEX returned an invalid shipping response")

        result = self._parse_simulation(raw)
        result.order_form_id = order_form_id
        return result

    def _parse_simulation(self, data: dict) -> SimulationResult:
        """Parse orderForm simulation API response."""
        order_form_id = data.get("orderFormId", "")
        logistics_info: list[dict] = data.get("logisticsInfo", [])
        items_data: list[dict] = data.get("items", [])

        # Extract item-level prices and availability
        item_prices: dict[str, float] = {}
        item_availability: dict[str, str] = {}

        for i, item in enumerate(items_data):
            sku_id = str(item.get("id", ""))
            if not sku_id:
                continue

            # Price: VTEX returns null for withoutPriceFulfillment items — guard against it
            raw_price = item.get("sellingPrice") or item.get("price")
            item_prices[sku_id] = (
                float(raw_price) / 100 if raw_price is not None else 0.0
            )

            # Availability: read directly from the item field (not inferred from slas).
            # VTEX may return slas even for withoutPriceFulfillment items, so slas
            # presence alone is NOT a reliable indicator of stock.
            raw_avail = item.get("availability", "")
            item_availability[sku_id] = (
                "available" if raw_avail == "available" else raw_avail or "withoutStock"
            )

        # Extract SLAs (deduplicate by id)
        seen_sla_ids: set[str] = set()
        slas: list[ShippingSla] = []

        for li in logistics_info:
            for sla_data in li.get("slas", []):
                sla_id = sla_data.get("id", "")
                if sla_id in seen_sla_ids:
                    continue
                seen_sla_ids.add(sla_id)

                pickup_info = sla_data.get("pickupStoreInfo", {})
                slas.append(
                    ShippingSla(
                        id=sla_id,
                        name=sla_data.get("name", sla_id),
                        delivery_channel=sla_data.get("deliveryChannel", "delivery"),
                        price=float(sla_data.get("price", 0)) / 100,
                        estimate=sla_data.get("shippingEstimate", ""),
                        pickup_store_name=pickup_info.get("friendlyName"),
                        pickup_point_id=sla_data.get("pickupPointId"),
                        pickup_distance_km=float(sla_data.get("pickupDistance", 0)),
                    )
                )

        return SimulationResult(
            order_form_id=order_form_id,
            slas=slas,
            item_prices=item_prices,
            item_availability=item_availability,
        )

    # ── Pickup points ─────────────────────────────────────────────────────────

    async def nearby_pickup_points(
        self,
        latitude: float,
        longitude: float,
        max_distance_km: int = PICKUP_SEARCH_RADIUS_KM,
        items: list[dict] | None = None,
        postal_code: str | None = None,
    ) -> list[PickupPoint]:
        """
        Fetch nearby Auchan pickup points.

        Strategy:
        1. VTEX /api/checkout/pub/pickup-points?geoCoordinates=lng;lat (standard VTEX)
        2. Fallback: orderForm simulation with a probe SKU → pickupPoints[]
        3. Fallback: static list of all known Auchan Romania stores

        Returns list of PickupPoint sorted by distance_km ASC.
        """
        # Strategy 1: Direct VTEX pickup-points endpoint (geoCoordinates=lng;lat)
        points = await self._pickup_via_geo_endpoint(latitude, longitude)
        if points:
            return sorted(
                (p for p in points if p.distance_km <= max_distance_km),
                key=lambda p: p.distance_km,
            )

        # Strategy 2: Simulation-based (needs postal code)
        postcode = postal_code
        if not postcode:
            postcode = await self._reverse_geocode_postcode(latitude, longitude)

        if postcode:
            points = await self._pickup_via_simulation(postcode, latitude, longitude)
            if points:
                return sorted(points, key=lambda p: p.distance_km)

        # Strategy 3: Static fallback with all known stores
        return self._static_auchan_stores(latitude, longitude, max_distance_km)

    async def _pickup_via_geo_endpoint(
        self,
        latitude: float,
        longitude: float,
    ) -> list[PickupPoint]:
        """
        Try the VTEX standard pickup-points endpoint with geoCoordinates.

        VTEX format: geoCoordinates=longitude;latitude (semicolon-separated)
        """
        geo_param = f"{longitude};{latitude}"
        params = {"geoCoordinates": geo_param}

        try:
            data = await self._vtex.get(VTEX_PICKUP_POINTS_ENDPOINT, params=params)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.debug("pickup-points geo endpoint failed: %s", exc)
            return []

        # Response can be a list directly or {"items": [...]}
        raw_list: list[dict] = []
        if isinstance(data, list):
            raw_list = data
        elif isinstance(data, dict):
            raw_list = data.get("items", data.get("pickupPoints", []))

        if not raw_list:
            _LOGGER.debug("Pickup endpoint returned no results")
            return []

        points: list[PickupPoint] = []
        for item in raw_list:
            try:
                p = self._parse_pickup_point(item)
                if p.id and (p.latitude or p.longitude):
                    # Calculate distance if not provided by API
                    if not p.distance_km:
                        p.distance_km = round(
                            self._haversine_km(
                                latitude, longitude, p.latitude, p.longitude
                            ),
                            2,
                        )
                    points.append(p)
            except Exception as exc:  # noqa: BLE001
                _LOGGER.debug("parse pickup geo: %s", exc)

        _LOGGER.info("Pickup endpoint returned %d stores", len(points))
        return points

    # Known working Auchan SKU for simulation trigger
    _PROBE_SKU = "459611"  # Auchan branded product, usually in stock

    async def _pickup_via_simulation(
        self, postal_code: str, latitude: float, longitude: float
    ) -> list[PickupPoint]:
        """Use orderForm simulation to discover pickup points for a postal code."""
        payload = {
            "items": [{"id": self._PROBE_SKU, "quantity": 1, "seller": "1"}],
            "country": DEFAULT_COUNTRY,
            "shippingData": {
                "selectedAddresses": [
                    {
                        "addressType": "residential",
                        "postalCode": postal_code,
                        "country": DEFAULT_COUNTRY,
                        "geoCoordinates": [longitude, latitude],
                    }
                ]
            },
        }
        try:
            data = await self._vtex.post(VTEX_SIMULATION_ENDPOINT, json=payload)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.debug("Simulation pickup probe failed: %s", exc)
            return []

        if not isinstance(data, dict):
            return []

        pickup_points_raw: list[dict] = data.get("pickupPoints", [])
        points: list[PickupPoint] = []

        for raw in pickup_points_raw:
            try:
                address = raw.get("address", {})
                geo = address.get("geoCoordinates", [])
                lat_p = float(geo[1]) if len(geo) > 1 else latitude
                lng_p = float(geo[0]) if geo else longitude

                dist = self._haversine_km(latitude, longitude, lat_p, lng_p)

                points.append(
                    PickupPoint(
                        id=raw.get("id", raw.get("pickupPointId", "")),
                        name=raw.get("friendlyName", "Auchan"),
                        address=address.get("street", ""),
                        city=address.get("city", ""),
                        postal_code=address.get("postalCode", ""),
                        latitude=lat_p,
                        longitude=lng_p,
                        distance_km=dist,
                        is_active=False,
                    )
                )
            except Exception as exc:  # noqa: BLE001
                _LOGGER.debug("Could not parse simulation pickup: %s", exc)

        # Also try from logisticsInfo SLAs
        for li in data.get("logisticsInfo", []):
            for sla in li.get("slas", []):
                if sla.get("deliveryChannel") != "pickup-in-point":
                    continue
                store_info = sla.get("pickupStoreInfo", {})
                addr_raw = store_info.get("address", {})
                geo = addr_raw.get("geoCoordinates", [])
                lat_p = float(geo[1]) if len(geo) > 1 else latitude
                lng_p = float(geo[0]) if geo else longitude
                dist = float(sla.get("pickupDistance", 0)) or self._haversine_km(
                    latitude, longitude, lat_p, lng_p
                )

                pid = sla.get("pickupPointId", sla.get("id", ""))
                if any(p.id == pid for p in points):
                    continue

                points.append(
                    PickupPoint(
                        id=pid,
                        name=store_info.get("friendlyName", "Auchan"),
                        address=addr_raw.get("street", ""),
                        city=addr_raw.get("city", ""),
                        postal_code=addr_raw.get("postalCode", ""),
                        latitude=lat_p,
                        longitude=lng_p,
                        distance_km=dist,
                        is_active=False,
                    )
                )

        return points

    @staticmethod
    def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance in km between two coordinates."""
        import math

        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def _static_auchan_stores(
        self, lat: float, lng: float, max_dist_km: int
    ) -> list[PickupPoint]:
        """Return known Auchan Romania stores as last-resort fallback."""
        known: list[dict] = [
            # București
            {
                "id": "TITAN",
                "name": "Auchan Titan",
                "addr": "bd. 1 Decembrie 1918 33A",
                "city": "București",
                "lat": 44.4220,
                "lng": 26.1700,
            },
            {
                "id": "MILITARI",
                "name": "Auchan Militari",
                "addr": "Calea Militari 159",
                "city": "București",
                "lat": 44.4380,
                "lng": 26.0270,
            },
            {
                "id": "BANEASA",
                "name": "Auchan Băneasa",
                "addr": "Șos. București-Ploiești 42",
                "city": "București",
                "lat": 44.5080,
                "lng": 26.0780,
            },
            {
                "id": "PALLADY",
                "name": "Auchan Pallady",
                "addr": "Bd. Theodor Pallady 51",
                "city": "București",
                "lat": 44.4310,
                "lng": 26.2110,
            },
            {
                "id": "DRUMUL_TABEREI",
                "name": "Auchan Drumul Taberei",
                "addr": "Bd. Timișoara 26",
                "city": "București",
                "lat": 44.4174,
                "lng": 26.0316,
            },
            {
                "id": "U_CENTER",
                "name": "Auchan U-Center",
                "addr": "Calea Șerban Vodă 133",
                "city": "București",
                "lat": 44.4165,
                "lng": 26.0985,
            },
            {
                "id": "COLENTINA",
                "name": "Auchan Colentina",
                "addr": "Sos. Colentina 426",
                "city": "București",
                "lat": 44.4677,
                "lng": 26.1641,
            },
            {
                "id": "PANTELIMON",
                "name": "Auchan Pantelimon",
                "addr": "Str. Iancu Nicolae 58-60",
                "city": "Ilfov",
                "lat": 44.4480,
                "lng": 26.2580,
            },
            # Rest of Romania
            {
                "id": "PITESTI",
                "name": "Auchan Pitești",
                "addr": "Str. Exercițiu 26",
                "city": "Pitești",
                "lat": 44.8603,
                "lng": 24.8600,
            },
            {
                "id": "BRAILA",
                "name": "Auchan Brăila",
                "addr": "Calea Galați 331",
                "city": "Brăila",
                "lat": 45.2650,
                "lng": 27.9590,
            },
            {
                "id": "GALATI",
                "name": "Auchan Galați",
                "addr": "Str. Oțelarilor 2",
                "city": "Galați",
                "lat": 45.4493,
                "lng": 28.0576,
            },
            {
                "id": "CONSTANTA",
                "name": "Auchan Constanța",
                "addr": "Bd. Alexandru Lăpușneanu",
                "city": "Constanța",
                "lat": 44.1850,
                "lng": 28.6293,
            },
            {
                "id": "CLUJ",
                "name": "Auchan Cluj",
                "addr": "Calea Florești 47",
                "city": "Cluj-Napoca",
                "lat": 46.7670,
                "lng": 23.5870,
            },
            {
                "id": "BRASOV",
                "name": "Auchan Brașov",
                "addr": "Calea București 57",
                "city": "Brașov",
                "lat": 45.6470,
                "lng": 25.6120,
            },
            {
                "id": "IASI",
                "name": "Auchan Iași",
                "addr": "Bd. Dacia 79",
                "city": "Iași",
                "lat": 47.1585,
                "lng": 27.5850,
            },
            {
                "id": "TIMISOARA",
                "name": "Auchan Timișoara",
                "addr": "Calea Torontalului 541",
                "city": "Timișoara",
                "lat": 45.7489,
                "lng": 21.2087,
            },
            {
                "id": "TIMISOARA_SC",
                "name": "Auchan Timișoara Shopping City",
                "addr": "Calea Șagului 100",
                "city": "Timișoara",
                "lat": 45.7260,
                "lng": 21.2730,
            },
            {
                "id": "CRAIOVA",
                "name": "Auchan Craiova",
                "addr": "Calea Severinului 18",
                "city": "Craiova",
                "lat": 44.3302,
                "lng": 23.7948,
            },
            {
                "id": "PLOIESTI",
                "name": "Auchan Ploiești",
                "addr": "Str. Gageni 88",
                "city": "Ploiești",
                "lat": 44.9426,
                "lng": 26.0143,
            },
            {
                "id": "SIBIU",
                "name": "Auchan Sibiu",
                "addr": "Calea Șurii Mici 10",
                "city": "Sibiu",
                "lat": 45.7983,
                "lng": 24.1430,
            },
            {
                "id": "BACAU",
                "name": "Auchan Bacău",
                "addr": "Str. Mioriței 80",
                "city": "Bacău",
                "lat": 46.5674,
                "lng": 26.9149,
            },
            {
                "id": "SUCEAVA",
                "name": "Auchan Suceava",
                "addr": "Str. Humorului 61",
                "city": "Suceava",
                "lat": 47.6581,
                "lng": 26.2698,
            },
        ]
        points = []
        for store in known:
            dist = self._haversine_km(lat, lng, store["lat"], store["lng"])
            if dist <= max_dist_km:
                points.append(
                    PickupPoint(
                        id=store["id"],
                        name=store["name"],
                        address=store.get("addr", ""),
                        city=store["city"],
                        latitude=store["lat"],
                        longitude=store["lng"],
                        distance_km=round(dist, 2),
                        is_active=True,
                    )
                )
        return sorted(points, key=lambda p: p.distance_km)

    @staticmethod
    def _parse_pickup_point(item: dict) -> PickupPoint:
        """Parse a raw logistics API pickup point."""
        address = item.get("address", {})
        location = item.get("location", {})
        geo = address.get("geoCoordinates", [0.0, 0.0])

        return PickupPoint(
            id=item.get("id", ""),
            name=item.get("friendlyName", item.get("id", "")),
            address=address.get("street", ""),
            city=address.get("city", ""),
            postal_code=address.get("postalCode", ""),
            latitude=float(location.get("latitude") or (geo[1] if len(geo) > 1 else 0)),
            longitude=float(location.get("longitude") or (geo[0] if geo else 0)),
            distance_km=float(item.get("distance", 0)),
            business_hours=item.get("businessHours", []),
            is_active=item.get("isActive", True),
            seller_id=item.get("sellerId", "1"),
        )

    # ── Cart link generation ──────────────────────────────────────────────────

    @staticmethod
    def build_cart_url(
        items: list[dict],
        order_form_id: str | None = None,
    ) -> str:
        """
        Build an add-to-cart URL for auchan.ro.

        Always build a classic SKU URL. Monitoring orderForms are internal and
        must never be exposed as a shopper cart.
        """
        params: list[tuple[str, str | int]] = []
        for item in items:
            sku_id = item.get("id", "")
            qty = item.get("quantity", 1)
            seller = item.get("seller", "1")
            if sku_id:
                params.extend(
                    [("sku", str(sku_id)), ("qty", int(qty)), ("seller", str(seller))]
                )

        if not params:
            return AUCHAN_BASE_URL

        params.append(("sc", DEFAULT_SALES_CHANNEL))
        query = urlencode(params)
        return f"{AUCHAN_BASE_URL}/checkout/cart/add?{query}"
