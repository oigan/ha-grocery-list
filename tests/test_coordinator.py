"""Tests for AuchanCoordinator's scheduled scan.

The scan used to refresh only items carrying a watch flag, so an ordinary item
kept whatever price and availability search had returned on the day it was
added — it could read "available" long after the store had run out.
"""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock

from custom_components.auchan_grocery.coordinator import AuchanCoordinator
from custom_components.auchan_grocery.api.orderform import SimulationResult
from custom_components.auchan_grocery.storage import GroceryList, GroceryItem


def _item(sku_id: str, **overrides) -> GroceryItem:
    return GroceryItem(
        sku_id=sku_id,
        product_id=sku_id,
        name=f"Produs {sku_id}",
        availability="available",
        current_price=10.0,
        **overrides,
    )


def _coordinator(simulation: SimulationResult) -> AuchanCoordinator:
    """Build a coordinator without Home Assistant's runtime."""
    c = object.__new__(AuchanCoordinator)
    c._latitude = 44.4195
    c._longitude = 26.1776
    c._price_drop_threshold = 5.0

    c._storage = MagicMock()
    c._storage.get_active_address.return_value = None
    c._storage.update_list_order_form = AsyncMock()
    c._storage.bulk_update_prices = AsyncMock()
    c._storage.mark_list_simulated = AsyncMock()

    c._orderform = MagicMock()
    c._orderform.create_order_form = AsyncMock(return_value="of-1")
    c._orderform.simulate_order_form = AsyncMock(return_value=simulation)

    c._fire_price_drop = MagicMock()
    c._fire_back_in_stock = MagicMock()
    c._fire_out_of_stock = MagicMock()
    return c


@pytest.mark.asyncio
async def test_unwatched_item_still_gets_fresh_availability():
    """An item with no watch flag must still be refreshed — the regression."""
    plain = _item("111")
    assert not (plain.watch or plain.watch_price or plain.watch_stock)

    grocery_list = GroceryList(id="l1", name="Listă", items=[plain])
    coordinator = _coordinator(
        SimulationResult(
            order_form_id="of-1",
            slas=[],
            item_prices={"111": 12.5},
            item_availability={"111": "withoutStock"},
        )
    )

    await coordinator._scan_list(grocery_list, grocery_list.items)

    coordinator._storage.bulk_update_prices.assert_awaited_once()
    _, updates = coordinator._storage.bulk_update_prices.await_args.args
    assert updates["111"]["availability"] == "withoutStock"
    assert updates["111"]["current_price"] == 12.5


@pytest.mark.asyncio
async def test_unwatched_item_is_refreshed_without_firing_events():
    """Watch flags gate notifications, not data freshness."""
    grocery_list = GroceryList(id="l1", name="Listă", items=[_item("111")])
    coordinator = _coordinator(
        SimulationResult(
            order_form_id="of-1",
            slas=[],
            item_prices={"111": 4.0},
            item_availability={"111": "withoutStock"},
        )
    )

    await coordinator._scan_list(grocery_list, grocery_list.items)

    coordinator._fire_out_of_stock.assert_not_called()
    coordinator._fire_price_drop.assert_not_called()


@pytest.mark.asyncio
async def test_watched_item_still_fires_events():
    """A watched item keeps raising the stock and price events."""
    watched = _item("222", watch_stock=True, watch_price=True)
    grocery_list = GroceryList(id="l1", name="Listă", items=[watched])
    coordinator = _coordinator(
        SimulationResult(
            order_form_id="of-1",
            slas=[],
            item_prices={"222": 4.0},  # a 60% drop from 10.0
            item_availability={"222": "withoutStock"},
        )
    )

    await coordinator._scan_list(grocery_list, grocery_list.items)

    coordinator._fire_out_of_stock.assert_called_once()
    coordinator._fire_price_drop.assert_called_once()


@pytest.mark.asyncio
async def test_list_without_watched_items_is_still_scanned():
    """The scheduled refresh must not skip a list just because nothing is watched.

    Goes through _async_update_data rather than _scan_list, so it covers the
    item selection itself — the scan used to skip such a list outright.
    """
    grocery_list = GroceryList(id="l1", name="Listă", items=[_item("111")])
    coordinator = _coordinator(
        SimulationResult(
            order_form_id="of-1",
            slas=[],
            item_prices={"111": 12.5},
            item_availability={"111": "withoutStock"},
        )
    )
    coordinator._storage.get_all_lists.return_value = [grocery_list]

    await coordinator._async_update_data()

    coordinator._orderform.simulate_order_form.assert_awaited_once()
    sim_items = coordinator._orderform.simulate_order_form.await_args.args[1]
    assert [i["id"] for i in sim_items] == ["111"]


@pytest.mark.asyncio
async def test_every_item_reaches_the_simulation_payload():
    """Watched and unwatched items share one simulation call."""
    grocery_list = GroceryList(
        id="l1",
        name="Listă",
        items=[_item("111"), _item("222", watch_stock=True)],
    )
    coordinator = _coordinator(
        SimulationResult(
            order_form_id="of-1", slas=[], item_prices={}, item_availability={}
        )
    )
    coordinator._storage.get_all_lists.return_value = [grocery_list]

    await coordinator._async_update_data()

    coordinator._orderform.simulate_order_form.assert_awaited_once()
    sim_items = coordinator._orderform.simulate_order_form.await_args.args[1]
    assert {i["id"] for i in sim_items} == {"111", "222"}
