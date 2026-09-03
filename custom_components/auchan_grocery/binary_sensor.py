"""Binary sensor entities for Auchan Grocery integration."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import AuchanCoordinator
from .const import DOMAIN, NAME, VERSION

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: AuchanCoordinator = data.get("coordinator")
    if not coordinator:
        return
    async_add_entities([AuchanConnectedSensor(coordinator, entry)])


class AuchanConnectedSensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor: True when auchan.ro API is reachable."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_has_entity_name = True
    _attr_name = "Auchan Conectat"
    _attr_icon = "mdi:web-check"

    def __init__(self, coordinator: AuchanCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_connected"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=NAME,
            manufacturer="Auchan România",
            model="VTEX IO",
            sw_version=VERSION,
            configuration_url="https://www.auchan.ro",
        )

    @property
    def is_on(self) -> bool:
        return self.coordinator.last_update_success

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        coordinator = self.coordinator
        return {
            "last_scan": (
                coordinator.last_scan_at.isoformat()
                if coordinator.last_scan_at
                else None
            ),
            "successful_lists": coordinator.last_scan_count,
            "errors": coordinator.last_scan_errors,
        }
