"""Sensor entities for Auchan Grocery price and availability monitoring."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import AuchanCoordinator
from .storage import GroceryItem, GroceryStorage
from .const import (
    DOMAIN,
    NAME,
    VERSION,
    AVAILABILITY_AVAILABLE,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Auchan Grocery sensor entities."""
    data = hass.data[DOMAIN][entry.entry_id]
    storage: GroceryStorage = data["storage"]
    coordinator: AuchanCoordinator = data.get("coordinator")

    if not coordinator:
        _LOGGER.warning("Coordinator not ready, skipping sensor setup")
        return

    entities: dict[
        tuple[str, str, str], AuchanPriceSensor | AuchanAvailabilitySensor
    ] = {}

    def _add_sensors_for_watched_items() -> None:
        """Add sensors for all currently watched items across all lists."""
        new_entities: list[AuchanPriceSensor | AuchanAvailabilitySensor] = []
        desired: set[tuple[str, str, str]] = set()

        for grocery_list in storage.get_all_lists():
            for item in grocery_list.watched_items:
                if item.watch_price or item.watch:
                    key = (grocery_list.id, item.sku_id, "price")
                    desired.add(key)
                    if key not in entities:
                        entity = AuchanPriceSensor(
                            coordinator, storage, item, grocery_list.id
                        )
                        entities[key] = entity
                        new_entities.append(entity)
                if item.watch_stock or item.watch:
                    key = (grocery_list.id, item.sku_id, "availability")
                    desired.add(key)
                    if key not in entities:
                        entity = AuchanAvailabilitySensor(
                            coordinator, storage, item, grocery_list.id
                        )
                        entities[key] = entity
                        new_entities.append(entity)

        for key in set(entities) - desired:
            entity = entities.pop(key)
            if entity.hass:
                hass.async_create_task(entity.async_remove())

        if new_entities:
            async_add_entities(new_entities)

    # Initial load
    _add_sensors_for_watched_items()

    # Re-check when coordinator updates (new watched items may have been added)
    entry.async_on_unload(
        coordinator.async_add_listener(_add_sensors_for_watched_items)
    )


# ── Device info shared across all Auchan entities ────────────────────────────


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=NAME,
        manufacturer="Auchan România",
        model="VTEX IO",
        sw_version=VERSION,
        configuration_url="https://www.auchan.ro",
    )


# ── Price Sensor ─────────────────────────────────────────────────────────────


class AuchanPriceSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor tracking the current price of a watched grocery item.

    State: current price in RON (float)
    Attributes: list_price, discount_pct, last_updated, availability
    """

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "RON"
    _attr_icon = "mdi:tag-outline"
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: AuchanCoordinator,
        storage: GroceryStorage,
        item: GroceryItem,
        list_id: str,
    ) -> None:
        super().__init__(coordinator)
        self._storage = storage
        self._item = item
        self._list_id = list_id
        self._attr_unique_id = f"{DOMAIN}_{list_id}_{item.sku_id}_price"
        self._attr_name = f"{item.name} — Preț"
        self._attr_translation_key = "product_price"

    @callback
    def _handle_coordinator_update(self) -> None:
        """Pull latest price from coordinator data."""
        self.async_write_ha_state()

    @property
    def _current_item(self) -> GroceryItem | None:
        grocery_list = self._storage.get_list(self._list_id)
        return grocery_list.get_item(self._item.sku_id) if grocery_list else None

    @property
    def native_value(self) -> float | None:
        item = self._current_item
        return item.current_price if item and item.current_price > 0 else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        item = self._current_item or self._item
        return {
            "sku_id": item.sku_id,
            "product_id": item.product_id,
            "brand": item.brand,
            "category": item.category,
            "list_price": item.list_price,
            "discount_pct": item.discount_pct,
            "price_when_added": item.price_when_added,
            "availability": item.availability,
            "list_id": self._list_id,
            "last_checked": item.last_checked,
            "image_url": item.image_url,
        }

    @property
    def available(self) -> bool:
        return self._current_item is not None and self.coordinator.last_update_success


# ── Availability Sensor ───────────────────────────────────────────────────────


class AuchanAvailabilitySensor(CoordinatorEntity, SensorEntity):
    """
    Sensor tracking the stock availability of a watched grocery item.

    State: "available" | "withoutStock" | "cannotBeHandled"
    """

    _attr_icon = "mdi:package-variant-closed"
    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: AuchanCoordinator,
        storage: GroceryStorage,
        item: GroceryItem,
        list_id: str,
    ) -> None:
        super().__init__(coordinator)
        self._storage = storage
        self._item = item
        self._list_id = list_id
        self._attr_unique_id = f"{DOMAIN}_{list_id}_{item.sku_id}_availability"
        self._attr_name = f"{item.name} — Disponibilitate"
        self._attr_translation_key = "product_availability"

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()

    @property
    def _current_item(self) -> GroceryItem | None:
        grocery_list = self._storage.get_list(self._list_id)
        return grocery_list.get_item(self._item.sku_id) if grocery_list else None

    @property
    def native_value(self) -> str:
        item = self._current_item
        return item.availability if item else "unknown"

    @property
    def icon(self) -> str:
        if self.native_value == AVAILABILITY_AVAILABLE:
            return "mdi:package-variant-closed-check"
        return "mdi:package-variant-closed-remove"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        item = self._current_item or self._item
        return {
            "sku_id": item.sku_id,
            "product_name": item.name,
            "brand": item.brand,
            "list_id": self._list_id,
            "is_available": item.is_available,
            "last_checked": item.last_checked,
        }

    @property
    def available(self) -> bool:
        return self._current_item is not None and self.coordinator.last_update_success
