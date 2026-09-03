"""Select entity for choosing the active grocery list."""

from __future__ import annotations

import logging

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import AuchanCoordinator
from .storage import GroceryStorage
from .const import DOMAIN, NAME, VERSION

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: AuchanCoordinator = data.get("coordinator")
    storage: GroceryStorage = data["storage"]
    if not coordinator:
        return
    async_add_entities([AuchanActiveListSelect(coordinator, storage, entry)])


class AuchanActiveListSelect(CoordinatorEntity, SelectEntity):
    """
    Select entity for the currently active grocery list.

    State: list_id of the selected list.
    Options: all list IDs.
    """

    _attr_has_entity_name = True
    _attr_name = "Listă Activă"
    _attr_icon = "mdi:format-list-bulleted"

    def __init__(
        self,
        coordinator: AuchanCoordinator,
        storage: GroceryStorage,
        entry: ConfigEntry,
    ) -> None:
        super().__init__(coordinator)
        self._storage = storage
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_active_list"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=NAME,
            manufacturer="Auchan România",
            model="VTEX IO",
            sw_version=VERSION,
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        # Refresh options list when coordinator updates (new lists may exist)
        self.async_write_ha_state()

    @property
    def options(self) -> list[str]:
        return [lst.id for lst in self._storage.get_all_lists()]

    @property
    def current_option(self) -> str | None:
        return self._storage.get_active_list_id()

    async def async_select_option(self, option: str) -> None:
        if option in self.options:
            await self._storage.set_active_list(option)
            self.async_write_ha_state()
        else:
            _LOGGER.warning("List '%s' not found", option)
