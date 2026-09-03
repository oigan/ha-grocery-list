"""Tests for GroceryStorage."""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.auchan_grocery.storage import (
    GroceryList,
    GroceryStorage,
    GroceryItem,
)
from custom_components.auchan_grocery.const import MAX_LISTS, MAX_ITEMS_PER_LIST


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    return hass


@pytest.fixture
def mock_store():
    store = MagicMock()
    store.async_load = AsyncMock(return_value=None)
    store.async_save = AsyncMock()
    return store


@pytest.fixture
async def storage(mock_hass, mock_store):
    with patch(
        "custom_components.auchan_grocery.storage.Store",
        return_value=mock_store,
    ):
        s = GroceryStorage(mock_hass)
        await s.async_load()
        return s


# ── List CRUD ─────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_list(storage):
    lst = await storage.create_list("test_list", "Test")
    assert lst is not None
    assert lst.id == "test_list"
    assert lst.name == "Test"
    assert storage.get_list("test_list") is not None


@pytest.mark.asyncio
async def test_create_list_max_limit(storage):
    for i in range(MAX_LISTS):
        await storage.create_list(f"list_{i}", f"List {i}")

    result = await storage.create_list("overflow", "Overflow")
    assert result is None


@pytest.mark.asyncio
async def test_delete_list(storage):
    await storage.create_list("to_delete", "Delete Me")
    ok = await storage.delete_list("to_delete")
    assert ok is True
    assert storage.get_list("to_delete") is None


@pytest.mark.asyncio
async def test_rename_list(storage):
    await storage.create_list("my_list", "Old Name")
    ok = await storage.rename_list("my_list", "New Name")
    assert ok is True
    assert storage.get_list("my_list").name == "New Name"


# ── Item CRUD ─────────────────────────────────────────────────────────────────


def _make_item(sku_id="sku123", name="Test Product", quantity=1) -> GroceryItem:
    return GroceryItem(
        sku_id=sku_id,
        product_id="prod123",
        name=name,
        quantity=quantity,
        current_price=9.99,
        list_price=12.99,
    )


@pytest.mark.asyncio
async def test_add_item(storage):
    await storage.create_list("list1", "List 1")
    ok = await storage.add_item("list1", _make_item())
    assert ok is True
    lst = storage.get_list("list1")
    assert len(lst.items) == 1
    assert lst.items[0].sku_id == "sku123"


@pytest.mark.asyncio
async def test_add_item_duplicate_increases_quantity(storage):
    await storage.create_list("list1", "List 1")
    await storage.add_item("list1", _make_item(quantity=2))
    await storage.add_item("list1", _make_item(quantity=3))
    lst = storage.get_list("list1")
    assert len(lst.items) == 1
    assert lst.items[0].quantity == 5


@pytest.mark.asyncio
async def test_add_item_max_limit(storage):
    await storage.create_list("list1", "List 1")
    for i in range(MAX_ITEMS_PER_LIST):
        await storage.add_item(
            "list1", _make_item(sku_id=f"sku_{i}", name=f"Product {i}")
        )

    overflow = _make_item(sku_id="overflow", name="Overflow")
    ok = await storage.add_item("list1", overflow)
    assert ok is False


@pytest.mark.asyncio
async def test_duplicate_can_increment_when_list_is_full(storage):
    await storage.create_list("list1", "List 1")
    for i in range(MAX_ITEMS_PER_LIST):
        await storage.add_item("list1", _make_item(sku_id=f"sku_{i}"))

    assert await storage.add_item("list1", _make_item(sku_id="sku_0", quantity=2))
    assert storage.get_list("list1").get_item("sku_0").quantity == 3


@pytest.mark.asyncio
async def test_remove_item(storage):
    await storage.create_list("list1", "List 1")
    await storage.add_item("list1", _make_item())
    ok = await storage.remove_item("list1", "sku123")
    assert ok is True
    assert len(storage.get_list("list1").items) == 0


@pytest.mark.asyncio
async def test_set_item_quantity_zero_removes(storage):
    await storage.create_list("list1", "List 1")
    await storage.add_item("list1", _make_item())
    ok = await storage.set_item_quantity("list1", "sku123", 0)
    assert ok is True
    assert len(storage.get_list("list1").items) == 0


@pytest.mark.asyncio
async def test_toggle_in_cart(storage):
    await storage.create_list("list1", "List 1")
    await storage.add_item("list1", _make_item())
    item = storage.get_list("list1").items[0]
    assert item.in_cart is True

    await storage.toggle_in_cart("list1", "sku123")
    assert storage.get_list("list1").items[0].in_cart is False

    await storage.toggle_in_cart("list1", "sku123")
    assert storage.get_list("list1").items[0].in_cart is True


@pytest.mark.asyncio
async def test_toggle_watch(storage):
    await storage.create_list("list1", "List 1")
    await storage.add_item("list1", _make_item())

    await storage.toggle_watch("list1", "sku123")
    item = storage.get_list("list1").items[0]
    assert item.watch is True
    assert item.watch_price is True
    assert item.watch_stock is True


# ── Bulk price update ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_bulk_update_prices(storage):
    await storage.create_list("list1", "List 1")
    await storage.add_item("list1", _make_item(sku_id="sku1"))
    await storage.add_item("list1", _make_item(sku_id="sku2"))

    await storage.bulk_update_prices(
        "list1",
        {
            "sku1": {"current_price": 7.99, "availability": "available"},
            "sku2": {"current_price": 4.50, "availability": "withoutStock"},
        },
    )

    items = storage.get_list("list1").items
    sku1 = next(i for i in items if i.sku_id == "sku1")
    sku2 = next(i for i in items if i.sku_id == "sku2")
    assert sku1.current_price == 7.99
    assert sku2.availability == "withoutStock"


# ── GroceryItem properties ────────────────────────────────────────────────────


def test_discount_pct():
    item = GroceryItem(
        sku_id="x",
        product_id="x",
        name="X",
        current_price=8.5,
        list_price=10.0,
    )
    assert item.discount_pct == 15.0


def test_is_available():
    item = _make_item()
    item.availability = "available"
    assert item.is_available is True

    item.availability = "withoutStock"
    assert item.is_available is False


# ── Export / Import ───────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_export_import_round_trip(storage):
    await storage.create_list("mylist", "My List")
    await storage.add_item("mylist", _make_item())

    exported = storage.export_list("mylist")
    assert exported is not None
    assert exported["name"] == "My List"

    # Delete original and import
    await storage.delete_list("mylist")
    imported = await storage.import_list(exported)
    assert imported is not None
    assert imported.name == "My List"
    assert len(imported.items) == 1


def test_list_deserialization_does_not_mutate_input():
    source = {
        "id": "weekly",
        "name": "Weekly",
        "items": [_make_item().to_dict()],
    }

    GroceryList.from_dict(source)

    assert len(source["items"]) == 1


@pytest.mark.asyncio
async def test_active_list_is_persisted(storage):
    await storage.create_list("one", "One")
    await storage.create_list("two", "Two")

    assert await storage.set_active_list("two")
    assert storage.get_active_list_id() == "two"


@pytest.mark.asyncio
async def test_chef_preferences_are_normalized_and_saved(storage, mock_store):
    saved = await storage.set_chef_preferences(
        {
            "household_size": 200,
            "budget": "ECONOMIC",
            "max_time_minutes": 30,
            "dietary": ["vegetarian", "fără lactoză"],
            "dislikes": "coriandru",
            "pantry": "sare, ulei",
            "loyalty_card_alias": "Familie",
        }
    )

    assert saved["household_size"] == 20
    assert saved["budget"] == "economic"
    assert saved["dietary"] == ["vegetarian", "fără lactoză"]
    assert storage.get_chef_preferences() == saved
    mock_store.async_save.assert_awaited()
