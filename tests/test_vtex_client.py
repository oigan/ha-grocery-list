"""Tests for VTEX API clients (with mocked HTTP)."""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.auchan_grocery.api.vtex_client import (
    VtexClient,
    VtexApiError,
    VtexNotFoundError,
)
from custom_components.auchan_grocery.api.orderform import VtexOrderFormClient
from custom_components.auchan_grocery.api.search import VtexSearchClient


def _mock_vtex(return_value=None, status=200):
    """Create a VtexClient mock that returns provided data."""
    vtex = MagicMock(spec=VtexClient)
    vtex.get = AsyncMock(return_value=return_value)
    vtex.post = AsyncMock(return_value=return_value)
    vtex.patch = AsyncMock(return_value=return_value)
    vtex.put = AsyncMock(return_value=return_value)
    return vtex


# ── VtexClient retry logic ────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_vtex_client_retry_on_500():
    """Client retries 3 times on 500 then raises VtexApiError."""
    from unittest.mock import AsyncMock

    mock_response = MagicMock()
    mock_response.status = 500
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=False)

    session = MagicMock()
    session.request = MagicMock(return_value=mock_response)

    client = VtexClient(session, max_retries=2)

    with patch("asyncio.sleep", new_callable=AsyncMock):
        with pytest.raises(VtexApiError):
            await client._request("GET", "/test")


@pytest.mark.asyncio
async def test_vtex_client_404_raises_not_found():
    mock_response = MagicMock()
    mock_response.status = 404
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=False)

    session = MagicMock()
    session.request = MagicMock(return_value=mock_response)

    client = VtexClient(session)

    with pytest.raises(VtexNotFoundError):
        await client._request("GET", "/test")


@pytest.mark.asyncio
async def test_vtex_client_does_not_retry_mutations():
    mock_response = MagicMock()
    mock_response.status = 500
    mock_response.headers = {}
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=False)

    session = MagicMock()
    session.request = MagicMock(return_value=mock_response)
    client = VtexClient(session, max_retries=3)

    with pytest.raises(VtexApiError):
        await client._request("POST", "/mutation")

    assert session.request.call_count == 1


# ── RegionId ─────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_region_id_success():
    vtex = _mock_vtex(return_value=[{"id": "v2.BC1D2C7ED5FE460186F4946EDD83EB"}])
    of_client = VtexOrderFormClient(vtex)

    region_id = await of_client.get_region_id(26.1776, 44.4195, postal_code="030886")
    assert region_id == "v2.BC1D2C7ED5FE460186F4946EDD83EB"
    vtex.get.assert_called_once()


@pytest.mark.asyncio
async def test_get_region_id_empty_response():
    vtex = _mock_vtex(return_value=[])
    of_client = VtexOrderFormClient(vtex)

    region_id = await of_client.get_region_id(26.1776, 44.4195, postal_code="030886")
    assert region_id is None


@pytest.mark.asyncio
async def test_get_region_id_api_error():
    vtex = _mock_vtex()
    vtex.get = AsyncMock(side_effect=VtexApiError("connection error"))
    of_client = VtexOrderFormClient(vtex)

    region_id = await of_client.get_region_id(26.1776, 44.4195, postal_code="030886")
    assert region_id is None


# ── OrderForm creation ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_order_form_success():
    vtex = _mock_vtex(return_value={"orderFormId": "abc123def456"})
    of_client = VtexOrderFormClient(vtex)

    order_form_id = await of_client.create_order_form()
    assert order_form_id == "abc123def456"


@pytest.mark.asyncio
async def test_create_order_form_failure():
    vtex = _mock_vtex()
    vtex.post = AsyncMock(side_effect=VtexApiError("timeout"))
    of_client = VtexOrderFormClient(vtex)

    order_form_id = await of_client.create_order_form()
    assert order_form_id is None


# ── Simulation parsing ────────────────────────────────────────────────────────


def test_parse_simulation_result():
    of_client = VtexOrderFormClient(MagicMock())

    raw = {
        "orderFormId": "form123",
        "items": [
            {"id": "sku1", "price": 4299, "availability": "available"},
            {"id": "sku2", "price": 829, "availability": "withoutStock"},
        ],
        "logisticsInfo": [
            {
                "slas": [
                    {
                        "id": "pickup-titan",
                        "name": "Pickup Titan",
                        "deliveryChannel": "pickup-in-point",
                        "price": 0,
                        "shippingEstimate": "0bd",
                        "pickupStoreInfo": {"friendlyName": "Auchan Titan"},
                        "pickupDistance": 2.3,
                    }
                ]
            },
            {"slas": []},
        ],
    }

    result = of_client._parse_simulation(raw)
    assert result.order_form_id == "form123"
    assert result.item_prices["sku1"] == 42.99
    assert result.item_prices["sku2"] == 8.29
    assert result.item_availability["sku1"] == "available"
    assert result.item_availability["sku2"] == "withoutStock"
    assert len(result.slas) == 1
    assert result.slas[0].delivery_channel == "pickup-in-point"
    assert result.slas[0].price == 0.0
    assert result.slas[0].pickup_distance_km == 2.3


# ── Cart URL builder ──────────────────────────────────────────────────────────


def test_build_cart_url_does_not_expose_monitoring_order_form():
    url = VtexOrderFormClient.build_cart_url([], order_form_id="abc123")
    assert "orderFormId" not in url
    assert url == "https://www.auchan.ro"


def test_build_cart_url_sku_based():
    items = [
        {"id": "sku1", "quantity": 2, "seller": "1"},
        {"id": "sku2", "quantity": 1, "seller": "1"},
    ]
    url = VtexOrderFormClient.build_cart_url(items)
    assert "sku=sku1&qty=2&seller=1" in url
    assert "sku=sku2&qty=1&seller=1" in url
    assert url.startswith("https://www.auchan.ro/checkout/cart/add")


# ── Order form expiry ─────────────────────────────────────────────────────────


def test_order_form_not_expired():
    from datetime import datetime, timedelta

    of_client = VtexOrderFormClient(MagicMock())
    recent = (datetime.utcnow() - timedelta(days=1)).isoformat()
    assert of_client.is_order_form_expired(recent) is False


def test_order_form_expired():
    from datetime import datetime, timedelta

    of_client = VtexOrderFormClient(MagicMock())
    old = (datetime.utcnow() - timedelta(days=8)).isoformat()
    assert of_client.is_order_form_expired(old) is True


def test_order_form_none_is_expired():
    of_client = VtexOrderFormClient(MagicMock())
    assert of_client.is_order_form_expired(None) is True


# ── Pickup point parsing ──────────────────────────────────────────────────────


def test_parse_pickup_point():
    raw = {
        "id": "AUCHAN_TITAN",
        "friendlyName": "Auchan Titan",
        "address": {
            "street": "Strada Liviu Rebreanu",
            "city": "București",
            "postalCode": "030886",
            "geoCoordinates": [26.1776, 44.4195],
        },
        "location": {"latitude": 44.4195, "longitude": 26.1776},
        "distance": 2.3,
        "isActive": True,
    }
    point = VtexOrderFormClient._parse_pickup_point(raw)
    assert point.id == "AUCHAN_TITAN"
    assert point.name == "Auchan Titan"
    assert point.distance_km == 2.3
    assert point.is_active is True
    assert abs(point.latitude - 44.4195) < 0.001


# ── Search result parsing ─────────────────────────────────────────────────────


def test_parse_graphql_product():
    raw = {
        "productId": "1234",
        "productName": "Cafea Tchibo",
        "brand": "Tchibo",
        "linkText": "cafea-tchibo-crema-250g",
        "link": "/cafea-tchibo-crema-250g/p",
        "categories": ["/Cafea & Ceai/Cafea/"],
        "items": [
            {
                "itemId": "55555",
                "images": [{"imageUrl": "https://cdn.auchan.ro/img.jpg"}],
                "sellers": [
                    {
                        "sellerId": "1",
                        "commertialOffer": {
                            "Price": 42.99,
                            "ListPrice": 49.99,
                            "AvailableQuantity": 10,
                        },
                    }
                ],
            }
        ],
    }
    result = VtexSearchClient._parse_graphql_product(raw)
    assert result.sku_id == "55555"
    assert result.name == "Cafea Tchibo"
    assert result.brand == "Tchibo"
    assert result.category == "Cafea"
    assert result.category_path == "Cafea & Ceai/Cafea"
    assert result.price == 42.99
    assert result.list_price == 49.99
    assert result.quantity_available == 10
    assert result.is_available is True
    assert abs(result.discount_pct - 14.0) < 1.0


def test_parse_product_handles_inconsistent_numbers_and_external_links():
    raw = {
        "productId": "1234",
        "productName": "Produs",
        "link": "https://example.org/not-allowed",
        "items": [
            {
                "itemId": "55555",
                "sellers": [
                    {
                        "sellerId": "seller",
                        "commertialOffer": {
                            "Price": None,
                            "ListPrice": "invalid",
                            "AvailableQuantity": "2.0",
                        },
                    }
                ],
            }
        ],
    }

    result = VtexSearchClient._parse_graphql_product(raw)

    assert result.quantity_available == 2
    assert result.url == ""


@pytest.mark.asyncio
async def test_search_by_collection_uses_exact_vtex_filter():
    vtex = _mock_vtex(
        return_value=[
            {
                "productId": "1234",
                "productName": "Lapte BIO",
                "items": [{"itemId": "5678", "sellers": []}],
            }
        ]
    )
    client = VtexSearchClient(vtex)

    products = await client.by_collection("9991", region_id="v2.region")

    assert [product.product_id for product in products] == ["1234"]
    vtex.get.assert_awaited_once_with(
        "/api/catalog_system/pub/products/search",
        params={
            "fq": "productClusterIds:9991",
            "sc": "1",
            "_from": 0,
            "_to": 29,
            "regionId": "v2.region",
        },
    )


@pytest.mark.asyncio
async def test_search_by_sku_keeps_the_requested_item():
    vtex = _mock_vtex(
        return_value=[
            {
                "productId": "1234",
                "productName": "Produs cu variante",
                "items": [
                    {
                        "itemId": "other",
                        "sellers": [
                            {
                                "sellerId": "1",
                                "commertialOffer": {
                                    "Price": 2,
                                    "ListPrice": 2,
                                    "AvailableQuantity": 5,
                                },
                            }
                        ],
                    },
                    {
                        "itemId": "wanted",
                        "sellers": [
                            {
                                "sellerId": "seller-2",
                                "commertialOffer": {
                                    "Price": 3,
                                    "ListPrice": 4,
                                    "AvailableQuantity": 1,
                                },
                            }
                        ],
                    },
                ],
            }
        ]
    )
    client = VtexSearchClient(vtex)

    product = await client.by_sku("wanted")

    assert product is not None
    assert product.sku_id == "wanted"
    assert product.seller_id == "seller-2"
    assert product.price == 3


@pytest.mark.asyncio
async def test_resolves_recipe_collection_from_seed_product():
    vtex = _mock_vtex(
        return_value=[
            {
                "productClusters": {
                    "957": "ALL-products",
                    "9991": (
                        "Farfuria lui Exarhu - Griș cu lapte prăjit și spumă de zmeură"
                    ),
                }
            }
        ]
    )
    client = VtexSearchClient(vtex)

    collection_id = await client.collection_for_recipe_product(
        "https://www.auchan.ro/lapte-bio/p",
        "Gris cu lapte prajit si spuma de zmeura",
    )

    assert collection_id == "9991"
    vtex.get.assert_awaited_once_with(
        "/api/catalog_system/pub/products/search/lapte-bio/p", params={"sc": "1"}
    )
