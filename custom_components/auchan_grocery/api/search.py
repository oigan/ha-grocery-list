"""VTEX Intelligent Search client for Auchan.ro."""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass
from typing import Any
from urllib.parse import quote, urljoin, urlparse

from .vtex_client import VtexClient
from ..const import (
    AUCHAN_BASE_URL,
    DEFAULT_SALES_CHANNEL,
    MAX_SEARCH_RESULTS,
    VTEX_INTELLIGENT_SEARCH_REST_ENDPOINT,
    VTEX_PRODUCT_SEARCH_ENDPOINT,
    AVAILABILITY_AVAILABLE,
    AVAILABILITY_OUT_OF_STOCK,
)

_LOGGER = logging.getLogger(__name__)


def _number(value: object, default: float = 0.0) -> float:
    """Parse inconsistent VTEX numeric fields safely."""
    try:
        return float(value if value is not None else default)
    except (TypeError, ValueError):
        return default


def _product_url(link: object, slug: object = "") -> str:
    """Return only an Auchan product URL."""
    candidate = str(link or "") or (f"/{slug}/p" if slug else "")
    if not candidate:
        return ""
    url = urljoin(AUCHAN_BASE_URL, candidate)
    parsed = urlparse(url)
    return (
        url if parsed.scheme == "https" and parsed.hostname == "www.auchan.ro" else ""
    )


@dataclass
class ProductSearchResult:
    """A product returned from VTEX Intelligent Search."""

    sku_id: str
    product_id: str
    name: str
    brand: str = ""
    category: str = ""
    category_path: str = ""
    image_url: str = ""
    price: float = 0.0  # preț curent (RON)
    list_price: float = 0.0  # preț fără discount
    availability: str = AVAILABILITY_AVAILABLE
    seller_id: str = "1"
    quantity_available: int = 0
    slug: str = ""
    url: str = ""
    description: str = ""

    @property
    def is_available(self) -> bool:
        return (
            self.availability == AVAILABILITY_AVAILABLE and self.quantity_available > 0
        )

    @property
    def discount_pct(self) -> float:
        if self.list_price > 0 and self.price < self.list_price:
            return round((1 - self.price / self.list_price) * 100, 1)
        return 0.0


class VtexSearchClient:
    """
    Client for VTEX Intelligent Search on auchan.ro.

    Supports:
    - Full-text search with regionId for local availability
    - Fallback to the public Catalog REST search
    - Result pagination (max MAX_SEARCH_RESULTS per call)
    """

    def __init__(self, vtex: VtexClient) -> None:
        self._vtex = vtex

    async def search(
        self,
        query: str,
        region_id: str | None = None,
        count: int = MAX_SEARCH_RESULTS,
        page: int = 0,
    ) -> list[ProductSearchResult]:
        """
        Search products via VTEX Intelligent Search REST.

        Falls back to REST catalog search if GraphQL fails.
        regionId filters availability to the user's local store.
        """
        try:
            return await self._search_intelligent_rest(query, region_id, count, page)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning(
                "Intelligent Search REST failed: %s — falling back to Catalog REST",
                exc,
            )
            return await self._search_rest(query, count, page)

    async def by_collection(
        self,
        collection_id: str,
        region_id: str | None = None,
        count: int = 30,
    ) -> list[ProductSearchResult]:
        """Return the exact products assigned to a VTEX product collection."""
        if not re.fullmatch(r"\d{1,12}", collection_id):
            return []
        path = VTEX_PRODUCT_SEARCH_ENDPOINT.format(term="").rstrip("/")
        params: dict[str, Any] = {
            "fq": f"productClusterIds:{collection_id}",
            "sc": DEFAULT_SALES_CHANNEL,
            "_from": 0,
            "_to": min(max(count, 1), 50) - 1,
        }
        if region_id:
            params["regionId"] = region_id
        data = await self._vtex.get(path, params=params)
        if not isinstance(data, list):
            return []
        return [
            self._parse_rest_product(product)
            for product in data
            if isinstance(product, dict)
        ]

    async def collection_for_recipe_product(
        self, product_url: str, recipe_title: str
    ) -> str:
        """Find the recipe collection shared by a known shelf product."""
        parsed = urlparse(product_url)
        if (
            parsed.scheme != "https"
            or parsed.hostname != "www.auchan.ro"
            or not parsed.path.endswith("/p")
        ):
            return ""
        product_path = parsed.path.strip("/")
        path = VTEX_PRODUCT_SEARCH_ENDPOINT.format(term=quote(product_path, safe="/"))
        data = await self._vtex.get(path, params={"sc": DEFAULT_SALES_CHANNEL})
        if not isinstance(data, list) or not data or not isinstance(data[0], dict):
            return ""

        title_key = self._fold_text(recipe_title)
        clusters = data[0].get("productClusters") or {}
        for collection_id, collection_name in clusters.items():
            if (
                re.fullmatch(r"\d{1,12}", str(collection_id))
                and title_key
                and title_key in self._fold_text(collection_name)
            ):
                return str(collection_id)
        return ""

    async def by_sku(
        self, sku_id: str, region_id: str | None = None
    ) -> ProductSearchResult | None:
        """Resolve one exact SKU instead of relying on full-text ranking."""
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", sku_id):
            return None
        path = VTEX_PRODUCT_SEARCH_ENDPOINT.format(term="").rstrip("/")
        params: dict[str, Any] = {
            "fq": f"skuId:{sku_id}",
            "sc": DEFAULT_SALES_CHANNEL,
            "_from": 0,
            "_to": 0,
        }
        if region_id:
            params["regionId"] = region_id
        data = await self._vtex.get(path, params=params)
        if not isinstance(data, list) or not data or not isinstance(data[0], dict):
            return None
        return self._parse_rest_product(data[0], preferred_sku_id=sku_id)

    async def _search_intelligent_rest(
        self,
        query: str,
        region_id: str | None,
        count: int,
        page: int,
    ) -> list[ProductSearchResult]:
        """VTEX Intelligent Search via high-speed REST endpoint."""

        path = VTEX_INTELLIGENT_SEARCH_REST_ENDPOINT
        params: dict[str, Any] = {
            "query": query,
            "hideUnavailableItems": "true",
            "count": count,
            "page": page + 1,
        }
        if region_id:
            params["region-id"] = region_id

        data = await self._vtex.get(path, params=params)

        if not isinstance(data, dict):
            raise ValueError(f"Unexpected response type: {type(data)}")

        products = data.get("products", [])

        results = []
        for product in products:
            try:
                results.append(self._parse_graphql_product(product))
            except (AttributeError, IndexError, KeyError, TypeError, ValueError) as exc:
                _LOGGER.debug("Failed to parse Intelligent Search product: %s", exc)
        return results

    async def _search_rest(
        self, query: str, count: int, page: int
    ) -> list[ProductSearchResult]:
        """Fallback: VTEX catalog REST search."""
        path = VTEX_PRODUCT_SEARCH_ENDPOINT.format(term=quote(query, safe=""))
        start = page * count
        params = {
            "sc": DEFAULT_SALES_CHANNEL,
            "_from": start,
            "_to": start + count - 1,
        }
        data = await self._vtex.get(path, params=params)

        if not isinstance(data, list):
            return []

        results = []
        for product in data:
            try:
                results.append(self._parse_rest_product(product))
            except (KeyError, IndexError, TypeError) as exc:
                _LOGGER.debug("Failed to parse REST product: %s", exc)
        return results

    @staticmethod
    def _parse_graphql_product(p: dict) -> ProductSearchResult:
        """Parse a product from Intelligent Search GraphQL response."""
        sku, seller = VtexSearchClient._best_sku_and_seller(p)
        offer = seller.get("commertialOffer", {})

        price = _number(offer.get("Price"))
        list_price = _number(offer.get("ListPrice"), price)
        qty = max(0, int(_number(offer.get("AvailableQuantity"))))

        images = sku.get("images", [])
        image_url = images[0].get("imageUrl", "") if images else ""

        link = p.get("link", "")
        slug = p.get("linkText", "")

        url = _product_url(link, slug)

        categories = p.get("categories", [])
        category_path = categories[0].strip("/") if categories else ""
        category = category_path.split("/")[-1] if category_path else ""

        # Keep downstream data plain-text. The frontend decides presentation.
        description = p.get("description", "")
        properties = p.get("properties", [])
        if properties:
            property_lines = []
            for prop in properties:
                name = prop.get("name", "")
                values = ", ".join(prop.get("values", []))
                if name and values:
                    property_lines.append(f"{name}: {values}")
            if property_lines:
                description = "\n".join(filter(None, [description, *property_lines]))

        return ProductSearchResult(
            sku_id=sku.get("itemId", ""),
            product_id=p.get("productId", ""),
            name=str(p.get("productName", ""))[:240],
            brand=str(p.get("brand", ""))[:120],
            category=category,
            category_path=category_path,
            image_url=image_url,
            price=price,
            list_price=list_price,
            availability=AVAILABILITY_AVAILABLE
            if qty > 0
            else AVAILABILITY_OUT_OF_STOCK,
            seller_id=seller.get("sellerId", "1"),
            quantity_available=qty,
            slug=slug,
            url=url,
            description=str(description)[:4000],
        )

    @staticmethod
    def _parse_rest_product(
        p: dict, preferred_sku_id: str | None = None
    ) -> ProductSearchResult:
        """Parse a product from the REST catalog search response."""
        sku, seller = VtexSearchClient._best_sku_and_seller(p, preferred_sku_id)
        offer = seller.get("commertialOffer", {})

        price = _number(offer.get("Price"))
        list_price = _number(offer.get("ListPrice"), price)
        qty = max(0, int(_number(offer.get("AvailableQuantity"))))

        images = sku.get("images", [])
        image_url = images[0].get("imageUrl", "") if images else ""

        link = p.get("link", "")
        slug = link.split("/")[-1].replace("/p", "") if link else ""

        categories = p.get("categories", [])
        category_path = categories[0].strip("/") if categories else ""

        return ProductSearchResult(
            sku_id=sku.get("itemId", ""),
            product_id=str(p.get("productId", "")),
            name=str(p.get("productName", ""))[:240],
            brand=str(p.get("brand", ""))[:120],
            category=category_path.split("/")[-1] if category_path else "",
            category_path=category_path,
            image_url=image_url,
            price=price,
            list_price=list_price,
            availability=AVAILABILITY_AVAILABLE
            if qty > 0
            else AVAILABILITY_OUT_OF_STOCK,
            seller_id=seller.get("sellerId", "1"),
            quantity_available=qty,
            slug=slug,
            url=_product_url(link, slug),
            description=str(p.get("description", ""))[:4000],
        )

    @staticmethod
    def _best_sku_and_seller(
        product: dict, preferred_sku_id: str | None = None
    ) -> tuple[dict, dict]:
        """Choose an available SKU/seller pair, falling back deterministically."""
        items = product.get("items") or []
        if preferred_sku_id:
            preferred = next(
                (
                    sku
                    for sku in items
                    if str(sku.get("itemId", "")) == preferred_sku_id
                ),
                None,
            )
            if preferred is not None:
                sellers = preferred.get("sellers") or []
                available = [
                    seller
                    for seller in sellers
                    if _number(
                        (seller.get("commertialOffer") or {}).get("AvailableQuantity")
                    )
                    > 0
                ]
                if available:
                    return preferred, min(
                        available,
                        key=lambda seller: _number(
                            (seller.get("commertialOffer") or {}).get("Price")
                        ),
                    )
                return preferred, sellers[0] if sellers else {}

        fallback_sku = items[0] if items else {}
        fallback_seller = (fallback_sku.get("sellers") or [{}])[0]
        for sku in items:
            sellers = sku.get("sellers") or []
            available = [
                seller
                for seller in sellers
                if _number(
                    (seller.get("commertialOffer") or {}).get("AvailableQuantity")
                )
                > 0
            ]
            if available:
                return sku, min(
                    available,
                    key=lambda seller: _number(
                        (seller.get("commertialOffer") or {}).get("Price")
                    ),
                )
        return fallback_sku, fallback_seller

    @staticmethod
    def _fold_text(value: object) -> str:
        """Normalize merchant labels for accent-insensitive collection matching."""
        decomposed = unicodedata.normalize("NFKD", str(value or ""))
        plain = "".join(char for char in decomposed if not unicodedata.combining(char))
        return re.sub(r"[^a-z0-9]+", " ", plain.casefold()).strip()
