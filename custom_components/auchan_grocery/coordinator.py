"""DataUpdateCoordinator for Auchan Grocery price & stock monitoring."""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api.vtex_client import VtexClient, VtexApiError, VtexRateLimitError
from .api.orderform import VtexOrderFormClient, SimulationResult
from .storage import GroceryStorage, GroceryList, GroceryItem
from .const import (
    DOMAIN,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_PRICE_DROP_THRESHOLD,
    DEFAULT_PRICE_DROP_THRESHOLD_PCT,
    CONF_SCAN_INTERVAL_MINUTES,
    EVENT_PRICE_DROP,
    EVENT_BACK_IN_STOCK,
    EVENT_OUT_OF_STOCK,
    AVAILABILITY_AVAILABLE,
)

_LOGGER = logging.getLogger(__name__)


class AuchanCoordinator(DataUpdateCoordinator):
    """
    Polls VTEX for price and stock changes across all watched grocery lists.

    Per scan cycle:
    1. For each list with watched items, run orderForm simulation
    2. Compare new data with stored data
    3. Fire HA events on price drops, stock changes
    4. Update storage with latest prices/availability
    5. Expose updated data to sensor entities

    Data shape returned by _async_update_data:
    {
      "<list_id>": {
        "simulation": SimulationResult,
        "changes": [
          { "type": "price_drop"|"back_in_stock"|"out_of_stock",
            "item": GroceryItem, "old_price": float, "new_price": float }
        ]
      }
    }
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        vtex: VtexClient,
        storage: GroceryStorage,
    ) -> None:
        self._vtex = vtex
        self._orderform = VtexOrderFormClient(vtex)
        self._storage = storage
        self._config = {**entry.data, **entry.options}
        self._latitude: float = self._config.get(CONF_LATITUDE, 44.4195197)
        self._longitude: float = self._config.get(CONF_LONGITUDE, 26.1776484)
        self._price_drop_threshold: float = self._config.get(
            CONF_PRICE_DROP_THRESHOLD, DEFAULT_PRICE_DROP_THRESHOLD_PCT
        )

        scan_minutes = int(self._config.get(CONF_SCAN_INTERVAL_MINUTES, 30))
        update_interval = timedelta(minutes=max(30, scan_minutes))
        self.last_scan_errors: list[str] = []
        self.last_scan_at: datetime | None = None
        self.last_scan_count = 0

        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_coordinator",
            config_entry=entry,
            update_interval=update_interval,
            always_update=False,  # only push updates on actual changes
        )

    async def _async_update_data(self) -> dict[str, Any]:
        """Refresh price and availability for every item in every list.

        The watch flags decide which changes raise an event, not which items
        get refreshed: an unwatched item still has to show a truthful price
        and stock state. One simulation covers a whole list, so scanning every
        item costs the same number of requests as scanning only watched ones.
        """
        lists = self._storage.get_all_lists()
        results: dict[str, Any] = {}
        attempted = 0
        succeeded = 0
        errors: list[str] = []

        for grocery_list in lists:
            items = grocery_list.items
            if not items:
                continue
            attempted += 1

            try:
                result = await self._scan_list(grocery_list, items)
                if result:
                    results[grocery_list.id] = result
                    succeeded += 1
                else:
                    errors.append(f"{grocery_list.id}:empty_simulation")
            except VtexRateLimitError as exc:
                _LOGGER.warning("Rate limited while scanning a list: %s", exc)
                errors.append(f"{grocery_list.id}:rate_limited")
            except VtexApiError as exc:
                _LOGGER.error("API error while scanning a list: %s", exc)
                errors.append(f"{grocery_list.id}:api_error")
            except Exception as exc:  # noqa: BLE001
                _LOGGER.exception("Unexpected error while scanning a list: %s", exc)
                errors.append(f"{grocery_list.id}:unexpected_error")

        self.last_scan_at = datetime.now(UTC)
        self.last_scan_count = succeeded
        self.last_scan_errors = errors
        if attempted and succeeded == 0:
            raise UpdateFailed(f"All {attempted} VTEX list scans failed")
        return results

    async def refresh_all_lists(self) -> dict[str, int]:
        """
        Refresh price + availability for ALL items in ALL lists using the active address.

        Uses simulate_order_form (add items + set shippingData with postalCode) which
        is the reliable VTEX approach. The headless /simulation endpoint returns ORD002.
        """
        addr = self._storage.get_active_address()
        lat = addr.latitude if addr else self._latitude
        lng = addr.longitude if addr else self._longitude
        store_id = addr.store_id if addr else None
        postal_code = (addr.postal_code if addr and addr.postal_code else None) or None
        region_id = addr.region_id if addr else None

        summary = {"lists": 0, "items": 0, "errors": 0}
        _LOGGER.info("Manual VTEX refresh started")

        for grocery_list in self._storage.get_all_lists():
            all_items = grocery_list.items
            if not all_items:
                continue

            # We need an orderFormId to simulate via update_items + shippingData
            order_form_id = grocery_list.order_form_id
            if not order_form_id or self._is_expired(grocery_list):
                order_form_id = await self._orderform.create_order_form()
            if not order_form_id:
                summary["errors"] += 1
                _LOGGER.warning("Could not obtain a monitoring orderForm")
                continue
            if order_form_id != grocery_list.order_form_id:
                await self._storage.update_list_order_form(
                    grocery_list.id, order_form_id
                )

            sim_items = [
                {
                    "id": item.sku_id,
                    "quantity": item.quantity,
                    "seller": item.seller_id
                    or (addr.seller_id if addr else "1")
                    or "1",
                }
                for item in all_items
            ]

            try:
                simulation = await self._orderform.simulate_order_form(
                    order_form_id,
                    sim_items,
                    lat,
                    lng,
                    store_id=store_id,
                    postal_code=postal_code,
                    region_id=region_id,
                )
                if not simulation:
                    summary["errors"] += 1
                    _LOGGER.warning("Manual refresh returned an empty simulation")
                    continue

                price_updates: dict[str, dict] = {}
                for item in all_items:
                    update: dict = {}
                    new_price = simulation.item_prices.get(item.sku_id)
                    new_avail = simulation.item_availability.get(item.sku_id)

                    if new_price is not None:
                        update["current_price"] = new_price
                    if new_avail is not None:
                        update["availability"] = new_avail

                    if update:
                        update["last_checked"] = datetime.now(UTC).isoformat()
                        price_updates[item.sku_id] = update

                if price_updates:
                    await self._storage.bulk_update_prices(
                        grocery_list.id, price_updates
                    )
                    await self._storage.mark_list_simulated(grocery_list.id)
                    summary["lists"] += 1
                    summary["items"] += len(price_updates)
                    _LOGGER.info("Manual refresh updated %d items", len(price_updates))

            except Exception as exc:  # noqa: BLE001
                summary["errors"] += 1
                _LOGGER.warning("Manual refresh failed for a list: %s", exc)

        if summary["lists"] == 0 and summary["errors"]:
            raise UpdateFailed("Manual VTEX refresh failed for every non-empty list")
        return summary

    async def _scan_list(
        self, grocery_list: GroceryList, items: list[GroceryItem]
    ) -> dict[str, Any] | None:
        """Simulate one list, persist fresh data, and detect changes."""
        # Get active address for coordinates and postal code
        addr = self._storage.get_active_address()
        lat = addr.latitude if addr else self._latitude
        lng = addr.longitude if addr else self._longitude
        store_id = addr.store_id if addr else None
        postal_code = (addr.postal_code if addr and addr.postal_code else None) or None
        region_id = addr.region_id if addr else None
        fallback_seller = addr.seller_id if addr and addr.seller_id else "1"
        sim_items = [
            {
                "id": item.sku_id,
                "quantity": item.quantity,
                "seller": item.seller_id or fallback_seller,
            }
            for item in items
        ]

        # Use the list's dedicated orderForm if available and not expired
        order_form_id = grocery_list.order_form_id
        if not order_form_id or self._is_expired(grocery_list):
            order_form_id = await self._orderform.create_order_form()
            if order_form_id:
                await self._storage.update_list_order_form(
                    grocery_list.id, order_form_id
                )

        simulation: SimulationResult | None = None

        if order_form_id:
            simulation = await self._orderform.simulate_order_form(
                order_form_id,
                sim_items,
                lat,
                lng,
                store_id=store_id,
                postal_code=postal_code,
                region_id=region_id,
            )

        if not simulation:
            _LOGGER.warning("Simulation returned no data for a list")
            return None

        # Detect changes and build price update payload
        changes: list[dict[str, Any]] = []
        price_updates: dict[str, dict[str, Any]] = {}

        for item in items:
            new_price = simulation.item_prices.get(item.sku_id)
            new_avail = simulation.item_availability.get(item.sku_id)

            update: dict[str, Any] = {}

            # Price: always stored, but only a watched item raises an event.
            if new_price is not None:
                old_price = item.current_price
                if item.watch_price and old_price > 0 and new_price < old_price:
                    drop_pct = (old_price - new_price) / old_price * 100
                    threshold = (
                        item.price_drop_threshold_pct
                        if item.price_drop_threshold_pct is not None
                        else self._price_drop_threshold
                    )
                    if drop_pct >= threshold:
                        changes.append(
                            {
                                "type": EVENT_PRICE_DROP,
                                "item": item,
                                "old_price": old_price,
                                "new_price": new_price,
                                "drop_pct": round(drop_pct, 1),
                                "list_name": grocery_list.name,
                            }
                        )
                        self._fire_price_drop(
                            item, old_price, new_price, drop_pct, grocery_list
                        )

                update["current_price"] = new_price

            # Stock: always stored, but only a watched item raises an event.
            if new_avail is not None:
                old_avail = item.availability
                if (
                    item.watch_stock
                    and old_avail != AVAILABILITY_AVAILABLE
                    and new_avail == AVAILABILITY_AVAILABLE
                ):
                    changes.append(
                        {
                            "type": EVENT_BACK_IN_STOCK,
                            "item": item,
                            "list_name": grocery_list.name,
                        }
                    )
                    self._fire_back_in_stock(item, grocery_list)

                elif (
                    item.watch_stock
                    and old_avail == AVAILABILITY_AVAILABLE
                    and new_avail != AVAILABILITY_AVAILABLE
                ):
                    changes.append(
                        {
                            "type": EVENT_OUT_OF_STOCK,
                            "item": item,
                            "list_name": grocery_list.name,
                        }
                    )
                    self._fire_out_of_stock(item, grocery_list)

                update["availability"] = new_avail

            if update:
                update["last_checked"] = datetime.now(UTC).isoformat()
                price_updates[item.sku_id] = update

        # Persist changes to storage
        if price_updates:
            await self._storage.bulk_update_prices(grocery_list.id, price_updates)
        await self._storage.mark_list_simulated(grocery_list.id)

        return {"simulation": simulation, "changes": changes}

    # ── Event helpers ─────────────────────────────────────────────────────────

    def _fire_price_drop(
        self,
        item: GroceryItem,
        old_price: float,
        new_price: float,
        drop_pct: float,
        grocery_list: GroceryList,
    ) -> None:
        self.hass.bus.fire(
            EVENT_PRICE_DROP,
            {
                "sku_id": item.sku_id,
                "product_name": item.name,
                "brand": item.brand,
                "old_price": old_price,
                "new_price": new_price,
                "drop_pct": drop_pct,
                "list_id": grocery_list.id,
                "list_name": grocery_list.name,
                "image_url": item.image_url,
            },
        )
        _LOGGER.info(
            "Price drop: %s → %.2f RON (was %.2f, -%.1f%%) in list '%s'",
            item.name,
            new_price,
            old_price,
            drop_pct,
            grocery_list.name,
        )

    def _fire_back_in_stock(self, item: GroceryItem, grocery_list: GroceryList) -> None:
        self.hass.bus.fire(
            EVENT_BACK_IN_STOCK,
            {
                "sku_id": item.sku_id,
                "product_name": item.name,
                "brand": item.brand,
                "list_id": grocery_list.id,
                "list_name": grocery_list.name,
                "image_url": item.image_url,
            },
        )
        _LOGGER.info("Back in stock: %s in list '%s'", item.name, grocery_list.name)

    def _fire_out_of_stock(self, item: GroceryItem, grocery_list: GroceryList) -> None:
        self.hass.bus.fire(
            EVENT_OUT_OF_STOCK,
            {
                "sku_id": item.sku_id,
                "product_name": item.name,
                "brand": item.brand,
                "list_id": grocery_list.id,
                "list_name": grocery_list.name,
                "image_url": item.image_url,
            },
        )
        _LOGGER.info("Out of stock: %s in list '%s'", item.name, grocery_list.name)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _is_expired(self, grocery_list: GroceryList) -> bool:
        if grocery_list.order_form_expires:
            try:
                expires = datetime.fromisoformat(grocery_list.order_form_expires)
                if expires.tzinfo is None:
                    expires = expires.replace(tzinfo=UTC)
                return expires <= datetime.now(UTC)
            except ValueError:
                return True
        return self._orderform.is_order_form_expired(grocery_list.last_simulation)
