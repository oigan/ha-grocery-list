"""Auchan Grocery List — Home Assistant Integration."""

from __future__ import annotations

import logging
from pathlib import Path

import aiohttp
from homeassistant.components.frontend import (
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api.vtex_client import VtexClient
from .api_views import (
    AuchanAddressActivateView,
    AuchanAddressDetailView,
    AuchanAddressesView,
    AuchanGeocodeView,
    AuchanChefImportView,
    AuchanChefLoginStartView,
    AuchanChefLoginStatusView,
    AuchanChefLogoutView,
    AuchanChefPlanView,
    AuchanChefPreferencesView,
    AuchanChefStatusView,
    AuchanListsView,
    AuchanPickupView,
    AuchanRecipeDetailView,
    AuchanRecipeImportView,
    AuchanRecipesView,
    AuchanRegionResolveView,
    AuchanRegionView,
    AuchanSearchView,
    AuchanSellersView,
)
from .coordinator import AuchanCoordinator
from .const import (
    CHEF_BRIDGE_TOKEN_FILE,
    CONF_CHEF_BRIDGE_TOKEN,
    CONF_CHEF_BRIDGE_URL,
    DEFAULT_CHEF_BRIDGE_URL,
    DOMAIN,
    FRONTEND_SCRIPT_URL,
    FRONTEND_STATIC_URL,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL,
)
from .services import async_setup_services, async_unregister_services
from .storage import GroceryStorage

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[str] = ["sensor", "binary_sensor", "select", "button"]


def _read_private_chef_token(path: Path) -> str:
    """Read an optional deployment-managed bridge token outside the repository."""
    try:
        token = path.read_text(encoding="utf-8").strip()
    except OSError:
        return ""
    return token if 24 <= len(token) <= 256 else ""


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the integration after options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Register HTTP views (no config-entry dependency)."""
    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_STATIC_URL,
                str(frontend_dir),
                cache_headers=False,
            )
        ]
    )

    hass.http.register_view(AuchanSearchView())
    hass.http.register_view(AuchanPickupView())
    hass.http.register_view(AuchanListsView())
    hass.http.register_view(AuchanRecipesView())
    hass.http.register_view(AuchanRecipeDetailView())
    hass.http.register_view(AuchanRecipeImportView())
    hass.http.register_view(AuchanAddressesView())
    hass.http.register_view(AuchanAddressDetailView())
    hass.http.register_view(AuchanAddressActivateView())
    hass.http.register_view(AuchanSellersView())
    hass.http.register_view(AuchanGeocodeView())
    hass.http.register_view(AuchanRegionView())
    hass.http.register_view(AuchanRegionResolveView())
    hass.http.register_view(AuchanChefStatusView())
    hass.http.register_view(AuchanChefLoginStartView())
    hass.http.register_view(AuchanChefLoginStatusView())
    hass.http.register_view(AuchanChefLogoutView())
    hass.http.register_view(AuchanChefPreferencesView())
    hass.http.register_view(AuchanChefPlanView())
    hass.http.register_view(AuchanChefImportView())
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Auchan Grocery from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    if hass.data[DOMAIN] and entry.entry_id not in hass.data[DOMAIN]:
        _LOGGER.error("Only one Auchan Grocery config entry is supported")
        return False

    session: aiohttp.ClientSession = async_get_clientsession(hass)

    storage = GroceryStorage(hass)
    try:
        await storage.async_load()
    except Exception as exc:  # noqa: BLE001
        _LOGGER.error("Failed to load grocery storage: %s", exc)
        raise ConfigEntryNotReady("Could not load grocery list storage") from exc

    vtex = VtexClient(session)
    coordinator = AuchanCoordinator(hass, entry, vtex, storage)

    try:
        await coordinator.async_config_entry_first_refresh()
    except Exception as exc:  # noqa: BLE001
        _LOGGER.warning("Initial refresh failed (will retry): %s", exc)

    # Migrate legacy address from config_entry.data if no addresses saved yet
    from .const import CONF_LATITUDE, CONF_LONGITUDE, CONF_REGION_ID

    cfg = entry.data
    if cfg.get(CONF_LATITUDE) and cfg.get(CONF_LONGITUDE):
        await storage.migrate_address_from_config(
            latitude=cfg[CONF_LATITUDE],
            longitude=cfg[CONF_LONGITUDE],
            postal_code="",
            region_id=cfg.get(CONF_REGION_ID, ""),
            display_name=cfg.get("address_text", ""),
        )

    resolved_config = {**entry.data, **entry.options}
    if not resolved_config.get(CONF_CHEF_BRIDGE_TOKEN):
        token_path = Path(hass.config.path(CHEF_BRIDGE_TOKEN_FILE))
        private_token = await hass.async_add_executor_job(
            _read_private_chef_token, token_path
        )
        if private_token:
            resolved_config[CONF_CHEF_BRIDGE_TOKEN] = private_token
            resolved_config.setdefault(CONF_CHEF_BRIDGE_URL, DEFAULT_CHEF_BRIDGE_URL)

    hass.data[DOMAIN][entry.entry_id] = {
        "session": session,
        "storage": storage,
        "vtex": vtex,
        "coordinator": coordinator,
        "config": resolved_config,
    }

    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))

    # Register HA services
    await async_setup_services(hass)

    try:
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            frontend_url_path=PANEL_URL,
            config={
                "_panel_custom": {
                    "name": "auchan-grocery-panel",
                    "module_url": FRONTEND_SCRIPT_URL,
                    "embed_iframe": False,
                    "trust_external_script": False,
                }
            },
            require_admin=True,
        )
    except Exception as exc:  # noqa: BLE001
        _LOGGER.warning("Could not register Lovelace panel (non-fatal): %s", exc)

    _LOGGER.info(
        "Auchan Grocery set up — %d lists loaded, coordinator every %s",
        len(storage.get_all_lists()),
        coordinator.update_interval,
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    await async_unregister_services(hass)

    try:
        async_remove_panel(hass, PANEL_URL)
    except Exception:  # noqa: BLE001
        pass

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
