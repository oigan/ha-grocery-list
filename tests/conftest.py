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

    sys.modules["homeassistant"] = homeassistant
    sys.modules["homeassistant.core"] = core
    sys.modules["homeassistant.helpers"] = helpers
    sys.modules["homeassistant.helpers.storage"] = storage
