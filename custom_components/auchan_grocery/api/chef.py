"""Chef AI bridge client and deterministic ingredient-to-product matching."""

from __future__ import annotations

import asyncio
from dataclasses import asdict
import math
import re
import unicodedata
from typing import Any
from urllib.parse import urlparse

import aiohttp

from .search import ProductSearchResult, VtexSearchClient


class ChefBridgeError(Exception):
    """Raised when the private Chef bridge cannot complete a request."""


class ChefBridgeClient:
    """HTTP client for the private Codex App Server bridge."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        base_url: str,
        token: str,
    ) -> None:
        parsed = urlparse(base_url.strip())
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.hostname
            or parsed.username
            or parsed.password
            or parsed.query
            or parsed.fragment
        ):
            raise ValueError("Invalid Chef bridge URL")
        self._session = session
        self._base_url = base_url.rstrip("/")
        self._token = token.strip()

    @property
    def configured(self) -> bool:
        return bool(self._base_url and self._token)

    async def status(self) -> dict[str, Any]:
        return await self._request("GET", "/v1/auth/status", timeout=30)

    async def start_device_login(self) -> dict[str, Any]:
        return await self._request("POST", "/v1/auth/device/start", {}, timeout=30)

    async def device_login_status(self, login_id: str) -> dict[str, Any]:
        if not re.fullmatch(r"[A-Za-z0-9-]{1,80}", login_id):
            raise ValueError("Invalid login ID")
        return await self._request("GET", f"/v1/auth/device/{login_id}", timeout=30)

    async def logout(self) -> dict[str, Any]:
        return await self._request("POST", "/v1/auth/logout", {}, timeout=30)

    async def usage(self) -> dict[str, Any]:
        return await self._request("GET", "/v1/usage", timeout=30)

    async def recipe(
        self,
        prompt: str,
        preferences: dict[str, Any],
        thread_id: str = "",
    ) -> dict[str, Any]:
        return await self._request(
            "POST",
            "/v1/recipes",
            {
                "prompt": prompt,
                "preferences": preferences,
                "thread_id": thread_id,
            },
            timeout=190,
        )

    async def _request(
        self,
        method: str,
        path: str,
        json: dict[str, Any] | None = None,
        *,
        timeout: int,
    ) -> dict[str, Any]:
        if not self.configured:
            raise ChefBridgeError("Chef AI bridge is not configured")
        headers = {"Authorization": f"Bearer {self._token}"}
        client_timeout = aiohttp.ClientTimeout(total=timeout)
        try:
            async with self._session.request(
                method,
                f"{self._base_url}{path}",
                headers=headers,
                json=json,
                timeout=client_timeout,
            ) as response:
                try:
                    payload = await response.json(content_type=None)
                except (aiohttp.ContentTypeError, ValueError) as exc:
                    raise ChefBridgeError(
                        "Chef bridge returned an invalid response"
                    ) from exc
                if not isinstance(payload, dict):
                    raise ChefBridgeError("Chef bridge returned an invalid payload")
                if response.status >= 400:
                    message = str(payload.get("error") or "Chef bridge request failed")
                    raise ChefBridgeError(message[:300])
                return payload
        except (aiohttp.ClientError, TimeoutError) as exc:
            raise ChefBridgeError("Chef AI bridge is unavailable") from exc


_STOP_WORDS = {
    "de",
    "din",
    "cu",
    "si",
    "sau",
    "pentru",
    "proaspat",
    "proaspata",
    "proaspete",
    "bio",
    "eco",
    "verde",
}

_NON_FOOD_TERMS = {
    "aspirator",
    "baterie",
    "bec",
    "bicicleta",
    "detergent",
    "electrocasnice",
    "frigider",
    "gradina",
    "jucarii",
    "mobilier",
    "piscina",
    "sampon",
    "televizor",
    "uscator",
}

_UNREQUESTED_VARIANTS = {
    "amestec",
    "aroma",
    "ceai",
    "congelat",
    "congelata",
    "conserva",
    "esenta",
    "germeni",
    "granulat",
    "iute",
    "mustar",
    "pate",
    "pudra",
    "salata",
    "sos",
    "stoarsa",
    "stors",
    "suc",
    "ton",
    "trufe",
}

_QUERY_ALIASES = {
    "ardei gras rosu": ["ardei kapia"],
    "couscous": ["cuscus", "cus cus", "cous cous"],
    "lamaie": ["lamai"],
}

_FRESH_PRODUCE_TERMS = {
    "ardei",
    "castravete",
    "castraveti",
    "ceapa",
    "cartof",
    "cartofi",
    "dovlecel",
    "dovlecei",
    "lamaie",
    "lamai",
    "morcov",
    "morcovi",
    "patrunjel",
    "rosie",
    "rosii",
    "usturoi",
    "vanata",
    "vinete",
}

_PROCESSED_QUERY_TERMS = {
    "congelat",
    "congelata",
    "conserva",
    "granulat",
    "murata",
    "murat",
    "pudra",
    "sos",
    "suc",
    "uscat",
    "uscata",
}

_FRESH_CATEGORY_TERMS = {
    "fructe",
    "legume",
    "verdeata",
    "verdeturi",
}

_PROCESSED_CATEGORY_TERMS = {
    "bauturi",
    "ceai",
    "congelate",
    "condimente",
    "conserve",
    "dulciuri",
    "mancare gata",
    "mezeluri",
    "mustar",
    "pate",
    "salate preparate",
    "semipreparate",
    "sosuri",
    "supe",
}

_PANTRY_STAPLE_TERMS = {"couscous", "cuscus", "faina", "gris", "malai", "orez", "paste"}

_COUSCOUS_TERMS = {"couscous", "cuscus"}

_COUSCOUS_CATEGORY_TERMS = {"bulgur", "cus cus", "quinoa"}

_WRONG_COUSCOUS_CATEGORY_TERMS = {
    "conserve",
    "paste fainoase",
    "peste",
    "salate",
    "semipreparate",
}

_WRONG_STAPLE_CATEGORY_TERMS = {
    "conserve",
    "mancare gata",
    "salate preparate",
    "semipreparate",
}

_CATEGORY_PREFERENCES = (
    (
        _PANTRY_STAPLE_TERMS,
        {"bacanie", "cereale", "faina", "orez", "paste"},
    ),
    (
        {"carne", "curcan", "porc", "pui", "vita"},
        {"carne", "macelarie", "pasare"},
    ),
    (
        {"branza", "frisca", "iaurt", "lapte", "smantana", "unt"},
        {"lactate", "lapte", "oua"},
    ),
    (
        {"boia", "condiment", "piper", "sare"},
        {"condimente", "sare"},
    ),
    (
        {"ulei"},
        {"ulei", "otet"},
    ),
)


def _fold(value: object) -> str:
    decomposed = unicodedata.normalize("NFKD", str(value or ""))
    plain = "".join(char for char in decomposed if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", plain.casefold()).strip()


def _tokens(value: object) -> set[str]:
    return {
        token
        for token in _fold(value).split()
        if len(token) >= 2 and token not in _STOP_WORDS
    }


def _similar_token(left: str, right: str) -> bool:
    if left == right:
        return True
    shortest = min(len(left), len(right))
    return (
        shortest >= 4 and left[: max(4, shortest - 1)] == right[: max(4, shortest - 1)]
    )


def _has_similar_token(tokens: set[str], expected: set[str]) -> bool:
    return any(
        _similar_token(token, candidate) for token in tokens for candidate in expected
    )


def _category_relevance(query: str, product: ProductSearchResult) -> int:
    """Return -1 for an incompatible category, 1 for the expected aisle."""
    query_tokens = _tokens(query)
    category = _fold(f"{product.category_path} {product.category}")
    if not category:
        return 0

    if _has_similar_token(query_tokens, _COUSCOUS_TERMS):
        if any(term in category for term in _COUSCOUS_CATEGORY_TERMS):
            return 1
        if any(term in category for term in _WRONG_COUSCOUS_CATEGORY_TERMS):
            return -1
        return 0

    wants_fresh_produce = _has_similar_token(query_tokens, _FRESH_PRODUCE_TERMS)
    explicitly_processed = _has_similar_token(query_tokens, _PROCESSED_QUERY_TERMS)
    if wants_fresh_produce and not explicitly_processed:
        if any(term in category for term in _PROCESSED_CATEGORY_TERMS):
            return -1
        if any(term in category for term in _FRESH_CATEGORY_TERMS):
            return 1
        return 0

    if _has_similar_token(query_tokens, _PANTRY_STAPLE_TERMS):
        if any(term in category for term in _WRONG_STAPLE_CATEGORY_TERMS):
            return -1

    for ingredient_terms, expected_categories in _CATEGORY_PREFERENCES:
        if _has_similar_token(query_tokens, ingredient_terms) and any(
            term in category for term in expected_categories
        ):
            return 1
    return 0


def product_match_score(query: str, product: ProductSearchResult) -> float:
    """Score lexical relevance and reject obviously non-food catalog results."""
    query_tokens = _tokens(query)
    product_name = _fold(product.name)
    product_text = _fold(
        f"{product.name} {product.category_path} {product.category} {product.brand}"
    )
    product_tokens = _tokens(product_text)
    if not query_tokens or any(term in product_tokens for term in _NON_FOOD_TERMS):
        return 0.0
    category_relevance = _category_relevance(query, product)
    if category_relevance < 0:
        return 0.0
    if (_UNREQUESTED_VARIANTS & product_tokens) - query_tokens:
        return 0.0
    if query_tokens == {"sare"} and "lamaie" in product_tokens:
        return 0.0

    matched = sum(
        1
        for query_token in query_tokens
        if any(
            _similar_token(query_token, product_token)
            for product_token in product_tokens
        )
    )
    if matched == 0:
        return 0.0

    coverage = matched / len(query_tokens)
    if len(query_tokens) > 1 and coverage < 1:
        return 0.0
    name_tokens = _tokens(product.name)
    if len(query_tokens) == 1:
        first_name_token = next(iter(product_name.split()), "")
        only_query_token = next(iter(query_tokens))
        if not _similar_token(only_query_token, first_name_token):
            return 0.0

    phrase_position = product_name.find(_fold(query))
    phrase_bonus = 0.25 if phrase_position == 0 else 0.1 if phrase_position > 0 else 0.0
    simplicity_bonus = min(0.1, len(query_tokens) / max(1, len(name_tokens)) * 0.1)
    availability_bonus = 0.1 if product.is_available else 0.0
    return min(
        1.0,
        coverage * 0.6
        + phrase_bonus
        + simplicity_bonus
        + availability_bonus
        + (0.05 if category_relevance > 0 else 0.0),
    )


_PACKAGE_RE = re.compile(
    r"(?<!\d)(\d+(?:[.,]\d+)?)\s*(kg|g|ml|cl|l|litri?|buc(?:ati)?|buc\.?)(?![a-z])",
    re.IGNORECASE,
)


def package_quantity(required: float, unit: str, product_name: str) -> int:
    """Estimate package count only when required and package units are compatible."""
    if required <= 0:
        return 1
    required_unit = _fold(unit).replace(" ", "")
    required_base = required
    dimension = ""
    if required_unit == "kg":
        required_base *= 1000
        dimension = "mass"
    elif required_unit == "g":
        dimension = "mass"
    elif required_unit == "l":
        required_base *= 1000
        dimension = "volume"
    elif required_unit == "ml":
        dimension = "volume"
    elif required_unit == "buc":
        dimension = "count"
    else:
        return 1

    matches = list(_PACKAGE_RE.finditer(_fold(product_name)))
    if not matches:
        return 1
    amount = float(matches[-1].group(1).replace(",", "."))
    package_unit = matches[-1].group(2).rstrip(".")
    if package_unit == "kg":
        amount *= 1000
        package_dimension = "mass"
    elif package_unit == "g":
        package_dimension = "mass"
    elif package_unit == "l" or package_unit.startswith("lit"):
        amount *= 1000
        package_dimension = "volume"
    elif package_unit == "cl":
        amount *= 10
        package_dimension = "volume"
    elif package_unit == "ml":
        package_dimension = "volume"
    else:
        package_dimension = "count"
    if package_dimension != dimension or amount <= 0:
        return 1
    return max(1, min(20, math.ceil(required_base / amount)))


def product_to_dict(
    product: ProductSearchResult,
    *,
    score: float,
    match_query: str,
    required_quantity: float,
    required_unit: str,
) -> dict[str, Any]:
    data = asdict(product)
    data["match_confidence"] = round(score, 3)
    data["match_query"] = match_query
    data["suggested_packages"] = package_quantity(
        required_quantity, required_unit, product.name
    )
    return data


async def match_recipe_products(
    search: VtexSearchClient,
    ingredients: list[dict[str, Any]],
    region_id: str | None,
) -> list[dict[str, Any]]:
    """Resolve each ingredient to reviewed VTEX candidates without trusting the model."""
    semaphore = asyncio.Semaphore(3)

    async def resolve(ingredient: dict[str, Any]) -> dict[str, Any]:
        name = str(ingredient.get("name") or "")[:120]
        query = str(ingredient.get("search_query") or name)[:120]
        try:
            required = float(ingredient.get("quantity") or 0)
        except (TypeError, ValueError):
            required = 0
        unit = str(ingredient.get("unit") or "")[:24]
        matched_query = query
        ranked: list[tuple[float, ProductSearchResult]] = []
        queries = [query, *_QUERY_ALIASES.get(_fold(query), [])]
        for candidate_query in queries:
            async with semaphore:
                products = await search.search(
                    candidate_query, region_id=region_id, count=20
                )
            ranked = sorted(
                (
                    (score, product)
                    for product in products
                    if (score := product_match_score(candidate_query, product)) >= 0.45
                ),
                key=lambda item: (
                    _category_relevance(candidate_query, item[1]),
                    item[0],
                    item[1].is_available,
                    -item[1].price,
                ),
                reverse=True,
            )[:3]
            if ranked:
                matched_query = candidate_query
                break
        enriched = dict(ingredient)
        enriched["name"] = name
        enriched["search_query"] = query
        enriched["quantity"] = required
        enriched["unit"] = unit
        enriched["matches"] = [
            product_to_dict(
                product,
                score=score,
                match_query=matched_query,
                required_quantity=required,
                required_unit=unit,
            )
            for score, product in ranked
        ]
        return enriched

    results = await asyncio.gather(
        *(resolve(ingredient) for ingredient in ingredients[:30]),
        return_exceptions=True,
    )
    normalized: list[dict[str, Any]] = []
    for ingredient, result in zip(ingredients[:30], results, strict=False):
        if isinstance(result, Exception):
            fallback = dict(ingredient)
            fallback["matches"] = []
            normalized.append(fallback)
        else:
            normalized.append(result)
    return normalized
