"""Lightweight import scaffolding for unit tests outside Home Assistant."""

from __future__ import annotations

import sys
from pathlib import Path
from types import ModuleType


PACKAGE_PATH = Path(__file__).parents[1] / "custom_components" / "auchan_grocery"

# Import submodules without executing the integration entrypoint, which requires
# a complete Home Assistant runtime. Deployment is validated separately with
# Home Assistant's native check_config command.
package = ModuleType("custom_components.auchan_grocery")
package.__path__ = [str(PACKAGE_PATH)]
sys.modules.setdefault("custom_components.auchan_grocery", package)

try:
    import homeassistant  # noqa: F401
except ImportError:
    homeassistant = ModuleType("homeassistant")
    core = ModuleType("homeassistant.core")
    helpers = ModuleType("homeassistant.helpers")
    storage = ModuleType("homeassistant.helpers.storage")

    class HomeAssistant:
        """Type-only Home Assistant stand-in."""

    class Store:
        """Patched by storage tests before construction."""

    core.HomeAssistant = HomeAssistant
    storage.Store = Store
    homeassistant.core = core
    homeassistant.helpers = helpers
    helpers.storage = storage

    config_entries = ModuleType("homeassistant.config_entries")
    update_coordinator = ModuleType("homeassistant.helpers.update_coordinator")

    class ConfigEntry:
        """Type-only config entry stand-in."""

    class DataUpdateCoordinator:
        """Coordinator stand-in; tests drive the scan methods directly."""

        def __init__(self, *args, **kwargs):
            pass

    class UpdateFailed(Exception):
        """Raised when a refresh cannot complete."""

    config_entries.ConfigEntry = ConfigEntry
    update_coordinator.DataUpdateCoordinator = DataUpdateCoordinator
    update_coordinator.UpdateFailed = UpdateFailed
    homeassistant.config_entries = config_entries
    helpers.update_coordinator = update_coordinator

    # A plain module object is not a package, so submodule imports such as
    # "from homeassistant.config_entries import ConfigEntry" need __path__.
    homeassistant.__path__ = []
    helpers.__path__ = []

    sys.modules["homeassistant"] = homeassistant
    sys.modules["homeassistant.core"] = core
    sys.modules["homeassistant.helpers"] = helpers
    sys.modules["homeassistant.helpers.storage"] = storage
    sys.modules["homeassistant.config_entries"] = config_entries
    sys.modules["homeassistant.helpers.update_coordinator"] = update_coordinator
