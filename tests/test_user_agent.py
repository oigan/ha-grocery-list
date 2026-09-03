"""Guard against the version drifting back out of sync.

The User-Agent string used to be hardcoded in four modules. Two of them were
still announcing 0.2.9 five releases later, because a version bump only ever
touched the files someone remembered to grep for. USER_AGENT is now derived
from VERSION, and this test keeps it that way.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

from custom_components.auchan_grocery.const import USER_AGENT, VERSION

PACKAGE = Path(__file__).parents[1] / "custom_components" / "auchan_grocery"


def test_user_agent_is_derived_from_version():
    assert USER_AGENT == f"ha-auchan-grocery/{VERSION}"


@pytest.mark.parametrize(
    "path", sorted(PACKAGE.rglob("*.py")), ids=lambda p: p.name
)
def test_no_hardcoded_version_in_user_agent(path: Path):
    """Only const.py may spell the User-Agent out; everyone else imports it."""
    if path.name == "const.py":
        return
    hardcoded = re.findall(r"ha-auchan-grocery/[\d.]+", path.read_text())
    assert not hardcoded, f"{path.name} hardcodes {hardcoded}; import USER_AGENT"


def test_manifest_version_matches_const():
    """A release bump has to move both, or Home Assistant reports the wrong one."""
    import json

    manifest = json.loads((PACKAGE / "manifest.json").read_text())
    assert manifest["version"] == VERSION
