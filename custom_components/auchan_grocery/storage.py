"""HA Storage backend for Auchan Grocery Lists."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    MAX_ITEMS_PER_LIST,
    MAX_LISTS,
    MAX_SAVED_ADDRESSES,
    STORAGE_KEY,
    STORAGE_VERSION,
    AVAILABILITY_AVAILABLE,
)

_LOGGER = logging.getLogger(__name__)


# ── Data models ────────────────────────────────────────────────────────────────


@dataclass
class SavedAddress:
    """A saved user address with cached regionId and seller."""

    id: str  # uuid / slug
    label: str  # "Acasă", "Birou"
    display_name: str  # full address text
    latitude: float
    longitude: float
    postal_code: str = ""
    region_id: str = ""  # cached VTEX regionId — ex: "v2.9C7CC7..."
    seller_id: str = ""  # first seller from /regions — ex: "rouauchanucenter984"
    store_name: str = ""  # human-readable store name for UI
    store_id: str = ""  # legacy compat — same as seller_id
    is_active: bool = False  # globally selected address
    created_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "SavedAddress":
        known = {f.name for f in cls.__dataclass_fields__.values()}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass
class GroceryItem:
    """A single product in a grocery list."""

    sku_id: str
    product_id: str
    name: str
    brand: str = ""
    quantity: int = 1
    unit: str = "buc"
    category: str = ""
    image_url: str = ""
    url: str = ""
    description: str = ""
    seller_id: str = ""

    # Prices (RON)
    price_when_added: float = 0.0
    current_price: float = 0.0
    list_price: float = 0.0  # preț fără discount

    # Availability
    availability: str = AVAILABILITY_AVAILABLE

    # User flags
    in_cart: bool = True  # included in cart link
    watch: bool = False  # generic watch (price + stock)
    watch_price: bool = False
    watch_stock: bool = False
    price_drop_threshold_pct: float | None = None  # override per item

    # Metadata
    added_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    last_checked: str | None = None

    @property
    def discount_pct(self) -> float:
        if (
            self.list_price
            and self.current_price > 0
            and self.current_price < self.list_price
        ):
            return round((1 - self.current_price / self.list_price) * 100, 1)
        return 0.0

    @property
    def is_available(self) -> bool:
        return self.availability == AVAILABILITY_AVAILABLE

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "GroceryItem":
        known = {f.name for f in cls.__dataclass_fields__.values()}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass
class GroceryList:
    """A named grocery list backed by a VTEX orderForm."""

    id: str
    name: str
    order_form_id: str | None = None  # VTEX orderFormId
    order_form_expires: str | None = None  # ISO datetime
    selected_sla: str = "pickup-in-point"
    selected_pickup_id: str | None = None
    items: list[GroceryItem] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    last_simulation: str | None = None

    @property
    def item_count(self) -> int:
        return len(self.items)

    @property
    def cart_items(self) -> list[GroceryItem]:
        return [i for i in self.items if i.in_cart]

    @property
    def watched_items(self) -> list[GroceryItem]:
        return [i for i in self.items if i.watch or i.watch_price or i.watch_stock]

    def get_item(self, sku_id: str) -> GroceryItem | None:
        return next((i for i in self.items if i.sku_id == sku_id), None)

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        return d

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "GroceryList":
        source = dict(data)
        items_data = source.pop("items", [])
        known = {f.name for f in cls.__dataclass_fields__.values()}  # type: ignore[attr-defined]
        instance = cls(**{k: v for k, v in source.items() if k in known})
        instance.items = [GroceryItem.from_dict(i) for i in items_data]
        return instance


# ── Storage manager ────────────────────────────────────────────────────────────


class GroceryStorage:
    """
    Manages persistent storage of grocery lists and saved addresses via HA Store.

    Schema:
      {
        "lists": { "<list_id>": <GroceryList dict>, ... },
        "addresses": { "<address_id>": <SavedAddress dict>, ... },
        "chef_preferences": { ... }
      }

    Limits:
      - MAX_LISTS = 50 lists
      - MAX_ITEMS_PER_LIST = 100 items per list
      - MAX_SAVED_ADDRESSES = 10 addresses
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._lists: dict[str, GroceryList] = {}
        self._addresses: dict[str, SavedAddress] = {}
        self._chef_preferences: dict[str, Any] = {}
        self._active_list_id: str | None = None
        self._loaded = False
        self._lock = asyncio.Lock()

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def async_load(self) -> None:
        """Load data from persistent storage."""
        data = await self._store.async_load()
        if isinstance(data, dict) and isinstance(data.get("lists"), dict):
            self._lists = {}
            for list_id, list_data in list(data["lists"].items())[:MAX_LISTS]:
                try:
                    grocery_list = GroceryList.from_dict(list_data)
                    if grocery_list.id != list_id:
                        grocery_list.id = list_id
                    grocery_list.items = grocery_list.items[:MAX_ITEMS_PER_LIST]
                    self._lists[list_id] = grocery_list
                except (TypeError, ValueError) as exc:
                    _LOGGER.warning(
                        "Ignoring invalid grocery list '%s': %s", list_id, exc
                    )
            _LOGGER.debug("Loaded %d grocery lists from storage", len(self._lists))
        else:
            self._lists = {}

        if isinstance(data, dict) and isinstance(data.get("addresses"), dict):
            self._addresses = {}
            for addr_id, addr_data in list(data["addresses"].items())[
                :MAX_SAVED_ADDRESSES
            ]:
                try:
                    address = SavedAddress.from_dict(addr_data)
                    if address.id != addr_id:
                        address.id = addr_id
                    self._addresses[addr_id] = address
                except (TypeError, ValueError) as exc:
                    _LOGGER.warning(
                        "Ignoring invalid saved address '%s': %s", addr_id, exc
                    )
            _LOGGER.debug("Loaded %d addresses from storage", len(self._addresses))
        else:
            self._addresses = {}

        requested_active = (
            data.get("active_list_id") if isinstance(data, dict) else None
        )
        self._active_list_id = (
            requested_active
            if requested_active in self._lists
            else next(iter(self._lists), None)
        )

        raw_preferences = (
            data.get("chef_preferences", {}) if isinstance(data, dict) else {}
        )
        self._chef_preferences = (
            self._normalize_chef_preferences(raw_preferences)
            if isinstance(raw_preferences, dict)
            else {}
        )

        self._loaded = True

    async def _async_save_unlocked(self) -> None:
        """Persist current state while the caller owns ``_lock``."""
        await self._store.async_save(
            {
                "lists": {lid: lst.to_dict() for lid, lst in self._lists.items()},
                "addresses": {
                    aid: addr.to_dict() for aid, addr in self._addresses.items()
                },
                "active_list_id": self._active_list_id,
                "chef_preferences": self._chef_preferences,
            }
        )

    async def async_save(self) -> None:
        """Persist current state to HA storage without lost updates."""
        async with self._lock:
            await self._async_save_unlocked()

    # ── Chef AI preferences ──────────────────────────────────────────────────

    @staticmethod
    def _normalize_chef_preferences(value: dict[str, Any]) -> dict[str, Any]:
        """Keep the AI profile small, typed and safe to send to the bridge."""
        try:
            household_size = min(20, max(1, int(value.get("household_size", 2))))
        except (TypeError, ValueError):
            household_size = 2
        budget = str(value.get("budget", "mediu") or "mediu").strip().lower()
        if budget not in {"economic", "mediu", "premium"}:
            budget = "mediu"
        try:
            max_time = min(1440, max(0, int(value.get("max_time_minutes", 0))))
        except (TypeError, ValueError):
            max_time = 45

        def clean(key: str, limit: int) -> str:
            return str(value.get(key, "") or "").strip()[:limit]

        raw_dietary = value.get("dietary", [])
        if isinstance(raw_dietary, str):
            raw_dietary = raw_dietary.split(",")
        dietary = (
            [str(item).strip()[:80] for item in raw_dietary[:20] if str(item).strip()]
            if isinstance(raw_dietary, list)
            else []
        )

        return {
            "household_size": household_size,
            "budget": budget,
            "max_time_minutes": max_time,
            "dietary": dietary,
            "dislikes": clean("dislikes", 500),
            "pantry": clean("pantry", 1000),
            "loyalty_card_alias": clean("loyalty_card_alias", 80),
        }

    def get_chef_preferences(self) -> dict[str, Any]:
        """Return a copy of the stored cooking profile."""
        return dict(self._chef_preferences)

    async def set_chef_preferences(self, value: dict[str, Any]) -> dict[str, Any]:
        """Persist validated preferences through Home Assistant Storage."""
        normalized = self._normalize_chef_preferences(value)
        async with self._lock:
            self._chef_preferences = normalized
            await self._async_save_unlocked()
        return dict(normalized)

    # ── Lists CRUD ─────────────────────────────────────────────────────────────

    def get_all_lists(self) -> list[GroceryList]:
        return list(self._lists.values())

    def get_list(self, list_id: str) -> GroceryList | None:
        return self._lists.get(list_id)

    def get_active_list_id(self) -> str | None:
        return self._active_list_id

    def get_active_list(self) -> GroceryList | None:
        return self._lists.get(self._active_list_id or "")

    async def set_active_list(self, list_id: str) -> bool:
        async with self._lock:
            if list_id not in self._lists:
                return False
            self._active_list_id = list_id
            await self._async_save_unlocked()
        return True

    async def create_list(self, list_id: str, name: str) -> GroceryList | None:
        """Create a new empty list. Returns None if MAX_LISTS reached."""
        async with self._lock:
            if len(self._lists) >= MAX_LISTS:
                _LOGGER.warning(
                    "Cannot create list '%s': MAX_LISTS (%d) reached", name, MAX_LISTS
                )
                return None
            if list_id in self._lists:
                _LOGGER.warning("List '%s' already exists", list_id)
                return None

            grocery_list = GroceryList(id=list_id, name=name)
            self._lists[list_id] = grocery_list
            if self._active_list_id is None:
                self._active_list_id = list_id
            await self._async_save_unlocked()
        _LOGGER.debug("Created list '%s' (%s)", name, list_id)
        return grocery_list

    async def rename_list(self, list_id: str, new_name: str) -> bool:
        async with self._lock:
            if list_id not in self._lists:
                return False
            self._lists[list_id].name = new_name
            await self._async_save_unlocked()
        return True

    async def delete_list(self, list_id: str) -> bool:
        async with self._lock:
            if list_id not in self._lists:
                return False
            del self._lists[list_id]
            if self._active_list_id == list_id:
                self._active_list_id = next(iter(self._lists), None)
            await self._async_save_unlocked()
        _LOGGER.debug("Deleted list '%s'", list_id)
        return True

    async def update_list_order_form(
        self,
        list_id: str,
        order_form_id: str,
        expires: str | None = None,
    ) -> bool:
        """Store the VTEX orderFormId for a list after creation/refresh."""
        async with self._lock:
            if list_id not in self._lists:
                return False
            self._lists[list_id].order_form_id = order_form_id
            self._lists[list_id].order_form_expires = (
                expires or (datetime.now(UTC) + timedelta(days=7)).isoformat()
            )
            await self._async_save_unlocked()
        return True

    async def mark_list_simulated(self, list_id: str) -> None:
        """Record a successful live simulation for orderForm expiry handling."""
        async with self._lock:
            grocery_list = self._lists.get(list_id)
            if not grocery_list:
                return
            grocery_list.last_simulation = datetime.now(UTC).isoformat()
            grocery_list.order_form_expires = (
                datetime.now(UTC) + timedelta(days=7)
            ).isoformat()
            await self._async_save_unlocked()

    # ── Items CRUD ─────────────────────────────────────────────────────────────

    async def add_item(self, list_id: str, item: GroceryItem) -> bool:
        """Add item to list. Returns False if list not found or at capacity."""
        async with self._lock:
            lst = self._lists.get(list_id)
            if not lst:
                return False
            existing = lst.get_item(item.sku_id)
            if existing:
                existing.quantity = min(99, existing.quantity + item.quantity)
            elif len(lst.items) >= MAX_ITEMS_PER_LIST:
                _LOGGER.warning(
                    "Cannot add item '%s': MAX_ITEMS_PER_LIST (%d) reached in '%s'",
                    item.name,
                    MAX_ITEMS_PER_LIST,
                    list_id,
                )
                return False
            else:
                lst.items.append(item)

            await self._async_save_unlocked()
        return True

    async def update_item(
        self, list_id: str, sku_id: str, updates: dict[str, Any]
    ) -> bool:
        """Partial update of a GroceryItem by sku_id."""
        allowed = {
            "quantity",
            "in_cart",
            "watch",
            "watch_price",
            "watch_stock",
            "price_drop_threshold_pct",
            "current_price",
            "list_price",
            "availability",
            "last_checked",
            "seller_id",
            "url",
            "image_url",
        }
        if not set(updates).issubset(allowed):
            return False
        async with self._lock:
            lst = self._lists.get(list_id)
            if not lst:
                return False
            item = lst.get_item(sku_id)
            if not item:
                return False

            for key, value in updates.items():
                setattr(item, key, value)

            await self._async_save_unlocked()
        return True

    async def remove_item(self, list_id: str, sku_id: str) -> bool:
        """Remove item from list by sku_id."""
        async with self._lock:
            lst = self._lists.get(list_id)
            if not lst:
                return False
            before = len(lst.items)
            lst.items = [i for i in lst.items if i.sku_id != sku_id]
            if len(lst.items) == before:
                return False
            await self._async_save_unlocked()
        return True

    async def set_item_quantity(self, list_id: str, sku_id: str, quantity: int) -> bool:
        """Set quantity for an item. Removes item if quantity ≤ 0."""
        if quantity <= 0:
            return await self.remove_item(list_id, sku_id)
        return await self.update_item(list_id, sku_id, {"quantity": quantity})

    async def toggle_in_cart(self, list_id: str, sku_id: str) -> bool:
        """Toggle the in_cart flag for an item."""
        async with self._lock:
            lst = self._lists.get(list_id)
            if not lst:
                return False
            item = lst.get_item(sku_id)
            if not item:
                return False
            item.in_cart = not item.in_cart
            await self._async_save_unlocked()
        return True

    async def toggle_watch(self, list_id: str, sku_id: str) -> bool:
        """Toggle generic watch flag (watches both price and stock)."""
        async with self._lock:
            lst = self._lists.get(list_id)
            if not lst:
                return False
            item = lst.get_item(sku_id)
            if not item:
                return False
            item.watch = not item.watch
            item.watch_price = item.watch
            item.watch_stock = item.watch
            await self._async_save_unlocked()
        return True

    async def bulk_update_prices(
        self, list_id: str, price_updates: dict[str, dict[str, Any]]
    ) -> None:
        """
        Bulk update prices/availability after orderForm simulation.

        price_updates: { sku_id: { "current_price": x, "availability": y, ... } }
        """
        async with self._lock:
            lst = self._lists.get(list_id)
            if not lst:
                return
            for sku_id, updates in price_updates.items():
                item = lst.get_item(sku_id)
                if item:
                    for key in {
                        "current_price",
                        "list_price",
                        "availability",
                        "last_checked",
                    }:
                        if key in updates:
                            setattr(item, key, updates[key])
            await self._async_save_unlocked()

    # ── Export / Import ────────────────────────────────────────────────────────

    def export_list(self, list_id: str) -> dict[str, Any] | None:
        """Export a single list as JSON-serializable dict."""
        lst = self._lists.get(list_id)
        return lst.to_dict() if lst else None

    async def import_list(self, data: dict[str, Any]) -> GroceryList | None:
        """Import a list from exported dict. Generates new ID if conflict."""
        if len(self._lists) >= MAX_LISTS:
            return None
        try:
            imported = GroceryList.from_dict(dict(data))
        except (KeyError, TypeError) as exc:
            _LOGGER.error("Failed to import list: %s", exc)
            return None

        if (
            not imported.id
            or not imported.name
            or len(imported.items) > MAX_ITEMS_PER_LIST
        ):
            return None

        # A remote cart identity must never be imported into another HA instance.
        imported.order_form_id = None
        imported.order_form_expires = None
        imported.last_simulation = None

        # Avoid ID conflict
        list_id = imported.id
        if list_id in self._lists:
            list_id = f"{imported.id}_{uuid4().hex[:8]}"
            imported.id = list_id

        async with self._lock:
            if len(self._lists) >= MAX_LISTS:
                return None
            self._lists[list_id] = imported
            if self._active_list_id is None:
                self._active_list_id = list_id
            await self._async_save_unlocked()
        _LOGGER.debug("Imported list '%s' as '%s'", imported.name, list_id)
        return imported

    # ── Addresses CRUD ─────────────────────────────────────────────────────────

    def get_all_addresses(self) -> list[SavedAddress]:
        return list(self._addresses.values())

    def get_active_address(self) -> SavedAddress | None:
        return next((a for a in self._addresses.values() if a.is_active), None)

    def get_address(self, address_id: str) -> SavedAddress | None:
        return self._addresses.get(address_id)

    async def add_address(self, address: SavedAddress) -> bool:
        """Add a new saved address. Returns False if limit reached."""
        async with self._lock:
            if len(self._addresses) >= MAX_SAVED_ADDRESSES:
                _LOGGER.warning(
                    "Cannot add address: MAX_SAVED_ADDRESSES (%d) reached",
                    MAX_SAVED_ADDRESSES,
                )
                return False

            if address.is_active or not self._addresses:
                for existing in self._addresses.values():
                    existing.is_active = False
                address.is_active = True

            self._addresses[address.id] = address
            await self._async_save_unlocked()
        _LOGGER.debug("Saved an address")
        return True

    async def delete_address(self, address_id: str) -> bool:
        async with self._lock:
            if address_id not in self._addresses:
                return False

            was_active = self._addresses[address_id].is_active
            del self._addresses[address_id]

            if was_active and self._addresses:
                next(iter(self._addresses.values())).is_active = True

            await self._async_save_unlocked()
        _LOGGER.debug("Deleted a saved address")
        return True

    async def set_active_address(self, address_id: str) -> bool:
        """Set the globally active address; deactivates all others."""
        async with self._lock:
            if address_id not in self._addresses:
                return False

            for aid, addr in self._addresses.items():
                addr.is_active = aid == address_id

            await self._async_save_unlocked()
        _LOGGER.debug("Changed the active address")
        return True

    async def update_address_region_id(self, address_id: str, region_id: str) -> bool:
        """Cache the VTEX regionId for an address after discovery."""
        async with self._lock:
            addr = self._addresses.get(address_id)
            if not addr:
                return False
            addr.region_id = region_id
            await self._async_save_unlocked()
        return True

    async def update_address_region(
        self,
        address_id: str,
        *,
        region_id: str,
        seller_id: str = "",
        store_name: str = "",
    ) -> bool:
        """Atomically update cached regionalization data for an address."""
        async with self._lock:
            address = self._addresses.get(address_id)
            if not address:
                return False
            address.region_id = region_id
            address.seller_id = seller_id
            address.store_id = seller_id
            address.store_name = store_name
            await self._async_save_unlocked()
        return True

    async def migrate_address_from_config(
        self,
        latitude: float,
        longitude: float,
        postal_code: str = "",
        region_id: str = "",
        display_name: str = "",
    ) -> SavedAddress | None:
        """
        Migrate address from legacy config_entry.data to SavedAddress storage.

        Called once at startup if no addresses exist yet but config has coordinates.
        """
        if self._addresses:
            return None  # already migrated

        import re

        address_id = re.sub(r"[^a-z0-9]", "_", display_name.lower())[:30] or "address_0"

        address = SavedAddress(
            id=address_id,
            label="Adresă principală",
            display_name=display_name or f"{latitude:.4f}, {longitude:.4f}",
            latitude=latitude,
            longitude=longitude,
            postal_code=postal_code,
            region_id=region_id,
            is_active=True,
        )
        await self.add_address(address)
        _LOGGER.info("Migrated the legacy configured address")
        return address
