"""Button entities for Auchan Grocery actions."""

from __future__ import annotations

import logging
from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .api.vtex_client import VtexClient
from .api.orderform import VtexOrderFormClient
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
    vtex: VtexClient = data["vtex"]

    device_info = DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=NAME,
        manufacturer="Auchan România",
        model="VTEX IO",
        sw_version=VERSION,
    )

    async_add_entities(
        [
            AuchanRefreshButton(coordinator, entry, device_info),
            AuchanCartLinkButton(storage, vtex, entry, device_info),
        ]
    )


class AuchanRefreshButton(ButtonEntity):
    """Button: trigger a manual price/stock refresh."""

    _attr_has_entity_name = True
    _attr_name = "Actualizează Prețuri"
    _attr_icon = "mdi:refresh"

    def __init__(
        self,
        coordinator: AuchanCoordinator,
        entry: ConfigEntry,
        device_info: DeviceInfo,
    ) -> None:
        self._coordinator = coordinator
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_refresh"
        self._attr_device_info = device_info

    async def async_press(self) -> None:
        await self._coordinator.async_request_refresh()
        _LOGGER.debug("Manual refresh triggered")


class AuchanCartLinkButton(ButtonEntity):
    """
    Button: generate add-to-cart URL for the active list.

    Fires a persistent notification with the URL + instructions.
    """

    _attr_has_entity_name = True
    _attr_name = "Generează Link Coș"
    _attr_icon = "mdi:cart-arrow-right"

    def __init__(
        self,
        storage: GroceryStorage,
        vtex: VtexClient,
        entry: ConfigEntry,
        device_info: DeviceInfo,
    ) -> None:
        self._storage = storage
        self._vtex = vtex
        self._entry = entry
        self._attr_unique_id = f"{DOMAIN}_{entry.entry_id}_cart_link"
        self._attr_device_info = device_info

    async def async_press(self) -> None:
        of_client = VtexOrderFormClient(self._vtex)
        grocery_list = self._storage.get_active_list()

        if not grocery_list:
            _LOGGER.warning("No grocery lists available")
            return
        cart_items = grocery_list.cart_items

        if not cart_items:
            _LOGGER.warning("No items marked in_cart for list '%s'", grocery_list.name)
            return

        items_payload = [
            {
                "id": item.sku_id,
                "quantity": item.quantity,
                "seller": item.seller_id or "1",
            }
            for item in cart_items
        ]

        cart_url = of_client.build_cart_url(
            items_payload,
        )

        # Fire persistent notification with the cart URL
        from homeassistant.components.persistent_notification import async_create

        message = (
            f"**Lista**: {grocery_list.name}\n\n"
            f"**Produse ({len(cart_items)} buc)**:\n"
            + "\n".join(f"- {i.name} x{i.quantity}" for i in cart_items[:10])
            + ("\n- ..." if len(cart_items) > 10 else "")
            + f"\n\n**[🔗 Deschide Coș Auchan]({cart_url})**"
        )

        async_create(
            self.hass,
            message=message,
            title="🛒 Auchan — Link Coș Generat",
            notification_id=f"auchan_cart_{grocery_list.id}",
        )

        _LOGGER.info("Cart URL generated for list '%s'", grocery_list.name)
