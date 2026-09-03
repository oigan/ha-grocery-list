"""HA Services for Auchan Grocery list and item management."""

from __future__ import annotations

import logging
import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from slugify import slugify

from .storage import GroceryStorage, GroceryItem
from .api.vtex_client import VtexClient
from .api.search import VtexSearchClient
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# ── Service names ─────────────────────────────────────────────────────────────
SERVICE_CREATE_LIST = "create_list"
SERVICE_DELETE_LIST = "delete_list"
SERVICE_RENAME_LIST = "rename_list"
SERVICE_ADD_ITEM = "add_item"
SERVICE_REMOVE_ITEM = "remove_item"
SERVICE_SET_QUANTITY = "set_item_quantity"
SERVICE_TOGGLE_CART = "toggle_in_cart"
SERVICE_TOGGLE_WATCH = "toggle_watch"
SERVICE_SEARCH_AND_ADD = "search_and_add"
SERVICE_EXPORT_LIST = "export_list"
SERVICE_SET_ACTIVE_LIST = "set_active_list"

# ── Service schemas ───────────────────────────────────────────────────────────
_ID = vol.All(cv.string, vol.Length(min=1, max=64), vol.Match(r"^[a-zA-Z0-9_-]+$"))
_NAME = vol.All(cv.string, vol.Length(min=1, max=80))
_LIST_ID = vol.Schema({vol.Required("list_id"): _ID})

CREATE_LIST_SCHEMA = vol.Schema(
    {
        vol.Required("name"): _NAME,
        vol.Optional("list_id"): _ID,
    }
)

RENAME_LIST_SCHEMA = vol.Schema(
    {
        vol.Required("list_id"): _ID,
        vol.Required("name"): _NAME,
    }
)

ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("list_id"): _ID,
        vol.Required("sku_id"): vol.All(cv.string, vol.Length(min=1, max=80)),
        vol.Required("product_id"): vol.All(cv.string, vol.Length(min=1, max=80)),
        vol.Required("name"): vol.All(cv.string, vol.Length(min=1, max=240)),
        vol.Optional("brand", default=""): vol.All(cv.string, vol.Length(max=120)),
        vol.Optional("quantity", default=1): vol.All(int, vol.Range(min=1, max=99)),
        vol.Optional("price", default=0.0): vol.All(
            vol.Coerce(float), vol.Range(min=0)
        ),
        vol.Optional("list_price", default=0.0): vol.All(
            vol.Coerce(float), vol.Range(min=0)
        ),
        vol.Optional("image_url", default=""): vol.All(cv.string, vol.Length(max=2048)),
        vol.Optional("category", default=""): vol.All(cv.string, vol.Length(max=160)),
        vol.Optional("url", default=""): vol.All(cv.string, vol.Length(max=2048)),
        vol.Optional("description", default=""): vol.All(
            cv.string, vol.Length(max=4000)
        ),
        vol.Optional("seller_id", default="1"): vol.All(cv.string, vol.Length(max=120)),
        vol.Optional("watch", default=False): cv.boolean,
        vol.Optional("watch_price", default=False): cv.boolean,
        vol.Optional("watch_stock", default=False): cv.boolean,
    }
)

SKU_IN_LIST_SCHEMA = vol.Schema(
    {
        vol.Required("list_id"): _ID,
        vol.Required("sku_id"): vol.All(cv.string, vol.Length(min=1, max=80)),
    }
)

SET_QUANTITY_SCHEMA = vol.Schema(
    {
        vol.Required("list_id"): _ID,
        vol.Required("sku_id"): vol.All(cv.string, vol.Length(min=1, max=80)),
        vol.Required("quantity"): vol.All(int, vol.Range(min=0, max=99)),
    }
)

SEARCH_ADD_SCHEMA = vol.Schema(
    {
        vol.Required("list_id"): _ID,
        vol.Required("query"): vol.All(cv.string, vol.Length(min=2, max=120)),
        vol.Optional("quantity", default=1): vol.All(int, vol.Range(min=1, max=99)),
        vol.Optional("auto_add_first", default=True): cv.boolean,
    }
)


async def async_setup_services(hass: HomeAssistant) -> None:
    """Register all Auchan Grocery HA services."""

    def _get_data(entry_id: str | None = None) -> dict:
        """Get the single supported config-entry runtime."""
        domain_data = hass.data.get(DOMAIN, {})
        if not domain_data:
            raise ValueError("Auchan Grocery integration not set up")

        if entry_id and entry_id in domain_data:
            data = domain_data[entry_id]
        else:
            data = next(iter(domain_data.values()))

        return data

    async def _refresh_entities() -> None:
        data = _get_data()
        data["coordinator"].async_set_updated_data(data["coordinator"].data or {})

    # ── create_list ───────────────────────────────────────────────────────────
    async def handle_create_list(call: ServiceCall) -> None:
        name = call.data["name"]
        list_id = call.data.get("list_id") or slugify(name, separator="_")
        storage: GroceryStorage = _get_data()["storage"]

        lst = await storage.create_list(list_id, name)
        if not lst:
            raise HomeAssistantError(
                "Lista nu a putut fi creată: ID duplicat sau limită atinsă"
            )
        await _refresh_entities()

    # ── delete_list ───────────────────────────────────────────────────────────
    async def handle_delete_list(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        ok = await storage.delete_list(call.data["list_id"])
        if not ok:
            raise HomeAssistantError("Lista nu există")
        await _refresh_entities()

    # ── rename_list ───────────────────────────────────────────────────────────
    async def handle_rename_list(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        if not await storage.rename_list(call.data["list_id"], call.data["name"]):
            raise HomeAssistantError("Lista nu există")
        await _refresh_entities()

    async def handle_set_active_list(call: ServiceCall) -> None:
        """Persist the list selected in the panel."""
        storage: GroceryStorage = _get_data()["storage"]
        if not await storage.set_active_list(call.data["list_id"]):
            raise HomeAssistantError("Lista nu există")
        await _refresh_entities()

    # ── add_item ──────────────────────────────────────────────────────────────
    async def handle_add_item(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        item = GroceryItem(
            sku_id=call.data["sku_id"],
            product_id=call.data["product_id"],
            name=call.data["name"],
            brand=call.data.get("brand", ""),
            quantity=call.data.get("quantity", 1),
            price_when_added=call.data.get("price", 0.0),
            current_price=call.data.get("price", 0.0),
            list_price=call.data.get("list_price", 0.0),
            image_url=call.data.get("image_url", ""),
            url=call.data.get("url", ""),
            description=call.data.get("description", ""),
            seller_id=call.data.get("seller_id", "1") or "1",
            category=call.data.get("category", ""),
            watch=call.data.get("watch", False),
            watch_price=call.data.get("watch_price", False),
            watch_stock=call.data.get("watch_stock", False),
        )
        list_id = call.data["list_id"]
        ok = await storage.add_item(list_id, item)

        if not ok:
            raise HomeAssistantError("Produsul nu a putut fi adăugat")
        await _refresh_entities()

    # ── remove_item ───────────────────────────────────────────────────────────
    async def handle_remove_item(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        list_id = call.data["list_id"]
        sku_id = call.data["sku_id"]
        if not await storage.remove_item(list_id, sku_id):
            raise HomeAssistantError("Produsul nu există în listă")
        await _refresh_entities()

    # ── set_item_quantity ─────────────────────────────────────────────────────
    async def handle_set_quantity(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        list_id = call.data["list_id"]
        sku_id = call.data["sku_id"]
        quantity = call.data["quantity"]
        if not await storage.set_item_quantity(list_id, sku_id, quantity):
            raise HomeAssistantError("Cantitatea nu a putut fi actualizată")
        await _refresh_entities()

    # ── toggle_in_cart ────────────────────────────────────────────────────────
    async def handle_toggle_cart(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        if not await storage.toggle_in_cart(call.data["list_id"], call.data["sku_id"]):
            raise HomeAssistantError("Produsul nu există în listă")
        await _refresh_entities()

    # ── toggle_watch ──────────────────────────────────────────────────────────
    async def handle_toggle_watch(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        if not await storage.toggle_watch(call.data["list_id"], call.data["sku_id"]):
            raise HomeAssistantError("Produsul nu există în listă")
        await _refresh_entities()

    # ── search_and_add ────────────────────────────────────────────────────────
    async def handle_search_and_add(call: ServiceCall) -> None:
        """Search VTEX and add first (or best) result to list."""
        data = _get_data()
        storage: GroceryStorage = data["storage"]
        vtex: VtexClient = data["vtex"]
        query = call.data["query"]
        list_id = call.data["list_id"]
        quantity = call.data.get("quantity", 1)
        auto_add = call.data.get("auto_add_first", True)

        active_address = storage.get_active_address()
        region_id = active_address.region_id if active_address else None
        search_client = VtexSearchClient(vtex)
        results = await search_client.search(query, region_id=region_id, count=5)

        if not results:
            _LOGGER.warning("No product results returned for search-and-add")
            return

        if auto_add:
            product = results[0]
            item = GroceryItem(
                sku_id=product.sku_id,
                product_id=product.product_id,
                name=product.name,
                brand=product.brand,
                quantity=quantity,
                price_when_added=product.price,
                current_price=product.price,
                list_price=product.list_price,
                image_url=product.image_url,
                url=product.url,
                description=product.description,
                category=product.category,
                availability=product.availability,
                seller_id=product.seller_id or "1",
            )
            if not await storage.add_item(list_id, item):
                raise HomeAssistantError("Produsul nu a putut fi adăugat")
            _LOGGER.info(
                "Auto-added '%s' (%.2f RON) to list '%s'",
                product.name,
                product.price,
                list_id,
            )
            await _refresh_entities()

    # ── export_list ───────────────────────────────────────────────────────────
    async def handle_export_list(call: ServiceCall) -> None:
        storage: GroceryStorage = _get_data()["storage"]
        list_id = call.data["list_id"]
        data = storage.export_list(list_id)
        if data:
            import json
            from homeassistant.components.persistent_notification import async_create

            async_create(
                hass,
                message=f"```json\n{json.dumps(data, indent=2, ensure_ascii=False)}\n```",
                title=f"📤 Export Lista: {data.get('name', list_id)}",
                notification_id=f"auchan_export_{list_id}",
            )

    # Register all services
    hass.services.async_register(
        DOMAIN, SERVICE_CREATE_LIST, handle_create_list, CREATE_LIST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DELETE_LIST, handle_delete_list, _LIST_ID
    )
    hass.services.async_register(
        DOMAIN, SERVICE_RENAME_LIST, handle_rename_list, RENAME_LIST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_ACTIVE_LIST, handle_set_active_list, _LIST_ID
    )
    hass.services.async_register(
        DOMAIN, SERVICE_ADD_ITEM, handle_add_item, ADD_ITEM_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_REMOVE_ITEM, handle_remove_item, SKU_IN_LIST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_QUANTITY, handle_set_quantity, SET_QUANTITY_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_TOGGLE_CART, handle_toggle_cart, SKU_IN_LIST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_TOGGLE_WATCH, handle_toggle_watch, SKU_IN_LIST_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SEARCH_AND_ADD, handle_search_and_add, SEARCH_ADD_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_EXPORT_LIST, handle_export_list, _LIST_ID
    )

    _LOGGER.debug("Auchan Grocery services registered (%d services)", 11)


async def async_unregister_services(hass: HomeAssistant) -> None:
    """Remove all registered services."""
    for service in [
        SERVICE_CREATE_LIST,
        SERVICE_DELETE_LIST,
        SERVICE_RENAME_LIST,
        SERVICE_SET_ACTIVE_LIST,
        SERVICE_ADD_ITEM,
        SERVICE_REMOVE_ITEM,
        SERVICE_SET_QUANTITY,
        SERVICE_TOGGLE_CART,
        SERVICE_TOGGLE_WATCH,
        SERVICE_SEARCH_AND_ADD,
        SERVICE_EXPORT_LIST,
    ]:
        hass.services.async_remove(DOMAIN, service)
