"""Config flow for the Auchan Grocery List integration — simplified setup."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .const import (
    CONF_CHEF_BRIDGE_TOKEN,
    CONF_CHEF_BRIDGE_URL,
    CONF_EMAIL,
    CONF_PRICE_DROP_THRESHOLD,
    CONF_SCAN_INTERVAL_MINUTES,
    DEFAULT_PRICE_DROP_THRESHOLD_PCT,
    DOMAIN,
    NAME,
    SCAN_INTERVAL_OPTIONS,
)

_LOGGER = logging.getLogger(__name__)


class AuchanConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """
    Simplified config flow — only email and scan interval.
    Address / location management is done from the Lovelace panel after setup.
    """

    VERSION = 1

    # ── Step 1: Basic setup ───────────────────────────────────────────────────

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Single-step setup: just email + scan interval."""
        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=NAME,
                data={
                    CONF_EMAIL: user_input.get(CONF_EMAIL, ""),
                    CONF_SCAN_INTERVAL_MINUTES: int(
                        user_input.get(CONF_SCAN_INTERVAL_MINUTES, 30)
                    ),
                    CONF_PRICE_DROP_THRESHOLD: float(
                        user_input.get(
                            CONF_PRICE_DROP_THRESHOLD, DEFAULT_PRICE_DROP_THRESHOLD_PCT
                        )
                    ),
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_EMAIL, default=""): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.EMAIL)
                    ),
                    vol.Required(
                        CONF_SCAN_INTERVAL_MINUTES,
                        default=30,
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[str(m) for m in SCAN_INTERVAL_OPTIONS],
                            mode=SelectSelectorMode.LIST,
                            translation_key="scan_interval",
                        )
                    ),
                    vol.Required(
                        CONF_PRICE_DROP_THRESHOLD,
                        default=DEFAULT_PRICE_DROP_THRESHOLD_PCT,
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=1, max=50, step=1, mode=NumberSelectorMode.SLIDER
                        )
                    ),
                }
            ),
            description_placeholders={
                "hint": "Adresele se configurează din panoul Auchan după setup."
            },
        )

    # ── Options flow (reconfigure after setup) ────────────────────────────────

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return AuchanOptionsFlow(config_entry)


class AuchanOptionsFlow(config_entries.OptionsFlow):
    """Allow reconfiguring email, scan interval, price threshold from the UI."""

    def __init__(self, entry: config_entries.ConfigEntry) -> None:
        self._entry = entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = {**self._entry.data, **self._entry.options}

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_EMAIL,
                        default=current.get(CONF_EMAIL, ""),
                    ): TextSelector(TextSelectorConfig(type=TextSelectorType.EMAIL)),
                    vol.Required(
                        CONF_SCAN_INTERVAL_MINUTES,
                        default=str(current.get(CONF_SCAN_INTERVAL_MINUTES, 30)),
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[str(m) for m in SCAN_INTERVAL_OPTIONS],
                            mode=SelectSelectorMode.LIST,
                        )
                    ),
                    vol.Required(
                        CONF_PRICE_DROP_THRESHOLD,
                        default=current.get(
                            CONF_PRICE_DROP_THRESHOLD, DEFAULT_PRICE_DROP_THRESHOLD_PCT
                        ),
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=1, max=50, step=1, mode=NumberSelectorMode.SLIDER
                        )
                    ),
                    vol.Optional(
                        CONF_CHEF_BRIDGE_URL,
                        default=current.get(CONF_CHEF_BRIDGE_URL, ""),
                    ): TextSelector(TextSelectorConfig(type=TextSelectorType.URL)),
                    vol.Optional(
                        CONF_CHEF_BRIDGE_TOKEN,
                        default=current.get(CONF_CHEF_BRIDGE_TOKEN, ""),
                    ): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD)),
                }
            ),
        )
