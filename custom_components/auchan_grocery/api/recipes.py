"""Recipe scraper for auchan.ro — inspiratie-si-savoare section.

Scrapes recipe listings + detail pages and enriches them with
VTEX product data found in the embedded product slider.

Architecture:
  - AuchanRecipeScraper: fetches & parses HTML (listing + detail)
  - Cache: stored in caller (hass.data) – see AuchanRecipesView
  - Ingredient → product mapping: done via VTEX search (see api_views)
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup

from ..const import USER_AGENT

_LOGGER = logging.getLogger(__name__)

RECIPES_CACHE_TTL = timedelta(hours=6)
SCRAPER_TIMEOUT = aiohttp.ClientTimeout(total=20)
THUMBNAIL_TIMEOUT = aiohttp.ClientTimeout(total=8)
SCRAPER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.5",
}

# Auchan recipe listing pages
RECIPE_LISTING_URLS = [
    "https://www.auchan.ro/inspiratie-si-savoare/retete-cu-imagini",
    "https://www.auchan.ro/inspiratie-si-savoare/retete-cu-razvan-exarhu",
]

# Real VTEX CSS selectors found on auchan.ro (2025-04)
SELECTOR_LISTING_CARD = (
    "a.vtex-list-context-0-x-infoCardCallActionContainer--blogArticles, "
    "a[class*='infoCardCallActionContainer']"
)

SELECTOR_INGREDIENTS = (
    "ul.vtex-rich-text-0-x-list--blogArticleContent li, "
    "ul[class*='list--blogArticleContent'] li"
)

SELECTOR_TITLE = (
    "h1.vtex-rich-text-0-x-heading--blogArticleTitle, "
    "[class*='heading--blogArticleTitle'], "
    "h1"
)

SELECTOR_PARAGRAPH = (
    "p.vtex-rich-text-0-x-paragraph--blogArticleContent, "
    "[class*='paragraph--blogArticleContent']"
)

AUCHAN_BASE = "https://www.auchan.ro"
AUCHAN_SITEMAP_INDEX_URL = f"{AUCHAN_BASE}/sitemap.xml"
JINA_READER_BASE = "https://r.jina.ai/http://www.auchan.ro"
MAX_RECIPE_HTML_BYTES = 2_000_000
MAX_RECIPE_READER_BYTES = 500_000
MAX_RECIPE_THUMBNAIL_BYTES = 64_000
THUMBNAIL_FETCH_CONCURRENCY = 6
THUMBNAIL_FETCH_BUDGET_SECONDS = 18


class RecipeFetchError(Exception):
    """Raised when an Auchan recipe cannot be fetched safely."""


async def _read_limited_response(
    response: aiohttp.ClientResponse, max_bytes: int
) -> bytes:
    """Read every response chunk while enforcing a strict total-size limit."""
    payload = bytearray()
    async for chunk in response.content.iter_chunked(64 * 1024):
        payload.extend(chunk)
        if len(payload) > max_bytes:
            raise RecipeFetchError("Recipe response is too large")
    return bytes(payload)


def _recipe_url(href: str) -> str | None:
    """Normalize and enforce the recipe URL allowlist."""
    url = urljoin(AUCHAN_BASE, href)
    parsed = urlparse(url)
    if (
        parsed.scheme != "https"
        or parsed.hostname != "www.auchan.ro"
        or not parsed.path.startswith("/inspiratie-si-savoare/")
    ):
        return None
    return url


def _product_url(href: str) -> str | None:
    """Normalize and enforce the public Auchan product URL allowlist."""
    url = urljoin(AUCHAN_BASE, href)
    url = re.sub(r"^http://www\.auchan\.ro", AUCHAN_BASE, url, flags=re.I)
    parsed = urlparse(url)
    if (
        parsed.scheme != "https"
        or parsed.hostname != "www.auchan.ro"
        or not parsed.path.endswith("/p")
    ):
        return None
    return url


# ── Data Models ───────────────────────────────────────────────────────────────


@dataclass
class RecipeIngredient:
    """A single ingredient from an Auchan recipe."""

    name: str
    quantity: str = ""
    unit: str = ""
    raw: str = ""
    # Enriched via VTEX search
    sku_id: str = ""
    product_id: str = ""
    image_url: str = ""
    price: float = 0.0
    list_price: float = 0.0
    brand: str = ""
    category: str = ""
    seller_id: str = "1"
    availability: str = "available"
    url: str = ""
    description: str = ""
    found: bool = False


def select_importable_recipe_products(
    ingredients: list[RecipeIngredient], selected_sku_ids: set[str] | None = None
) -> list[RecipeIngredient]:
    """Return only products proven to come from an Auchan recipe shelf."""
    products = [
        item
        for item in ingredients
        if item.found
        and re.fullmatch(r"[A-Za-z0-9_-]{1,64}", item.sku_id)
        and re.fullmatch(r"\d{1,20}", item.product_id)
    ]
    if selected_sku_ids is None:
        return products
    return [item for item in products if item.sku_id in selected_sku_ids]


@dataclass
class Recipe:
    """An Auchan recipe with ingredients."""

    id: str
    title: str
    url: str
    image_url: str = ""
    prep_time: str = ""
    cook_time: str = ""
    servings: str = ""
    difficulty: str = ""
    description: str = ""
    ingredients: list[RecipeIngredient] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    collection_id: str = ""
    # Whether detail has been fetched
    detail_fetched: bool = False
    fetched_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "url": self.url,
            "image_url": self.image_url,
            "prep_time": self.prep_time,
            "cook_time": self.cook_time,
            "servings": self.servings,
            "difficulty": self.difficulty,
            "description": self.description,
            "detail_fetched": self.detail_fetched,
            "tags": self.tags,
            "collection_id": self.collection_id,
            "ingredients": [
                {
                    "name": i.name,
                    "quantity": i.quantity,
                    "unit": i.unit,
                    "raw": i.raw,
                    "sku_id": i.sku_id,
                    "product_id": i.product_id,
                    "image_url": i.image_url,
                    "price": i.price,
                    "list_price": i.list_price,
                    "brand": i.brand,
                    "category": i.category,
                    "seller_id": i.seller_id,
                    "availability": i.availability,
                    "url": i.url,
                    "description": i.description,
                    "found": i.found,
                }
                for i in self.ingredients
            ],
        }


# ── Scraper ───────────────────────────────────────────────────────────────────


class AuchanRecipeScraper:
    """
    Scraper for auchan.ro recipe pages.

    Fetches recipes from two categories:
    - /inspiratie-si-savoare/retete-cu-imagini
    - /inspiratie-si-savoare/retete-cu-razvan-exarhu

    Parses ingredient lists from detail pages using multiple selector
    strategies for robustness against layout changes.
    """

    def __init__(self, session: aiohttp.ClientSession) -> None:
        self._session = session

    # ── Public API ───────────────────────────────────────────────────────────

    async def get_recipes(
        self, max_per_category: int = 12, force_refresh: bool = False
    ) -> list[Recipe]:
        """
        Fetch recipes from all listing pages concurrently.
        Returns merged, de-duplicated list.
        """
        tasks = [
            self._fetch_listing(url, max_per_category) for url in RECIPE_LISTING_URLS
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        seen_urls: set[str] = set()
        recipes: list[Recipe] = []
        for result in results:
            if isinstance(result, Exception):
                _LOGGER.warning("Recipe listing error: %s", result)
                continue
            for r in result:
                if r.url not in seen_urls:
                    seen_urls.add(r.url)
                    recipes.append(r)

        if not recipes:
            recipes = await self._fetch_sitemap_recipes(max_per_category * 2)

        # VTEX frequently returns an SSR shell without listing-card images to
        # server-side clients. Fill only missing thumbnails, under a strict
        # concurrency and wall-clock budget; the caller caches the result for
        # six hours.
        await self._enrich_missing_images(recipes)

        _LOGGER.info("Fetched %d recipes total from auchan.ro", len(recipes))
        return recipes

    async def _enrich_missing_images(self, recipes: list[Recipe]) -> None:
        """Populate missing thumbnails without delaying the listing indefinitely."""
        missing = [recipe for recipe in recipes if not recipe.image_url]
        if not missing:
            return

        semaphore = asyncio.Semaphore(THUMBNAIL_FETCH_CONCURRENCY)

        async def enrich(recipe: Recipe) -> None:
            async with semaphore:
                try:
                    recipe.image_url = await self._fetch_recipe_thumbnail_url(
                        recipe.url
                    )
                except Exception as exc:  # noqa: BLE001
                    _LOGGER.debug(
                        "Could not fetch thumbnail for '%s': %s", recipe.title, exc
                    )

        tasks = [asyncio.create_task(enrich(recipe)) for recipe in missing]
        done, pending = await asyncio.wait(
            tasks, timeout=THUMBNAIL_FETCH_BUDGET_SECONDS
        )
        for task in pending:
            task.cancel()
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)
            _LOGGER.debug(
                "Recipe thumbnail budget ended with %d pending requests", len(pending)
            )
        for task in done:
            task.result()

    async def get_recipe_detail(self, recipe: Recipe) -> Recipe:
        """
        Fetch and parse ingredient details for a single recipe.
        Mutates and returns the same Recipe object.
        """
        if recipe.detail_fetched:
            return recipe
        try:
            try:
                html = await self._fetch_html(recipe.url)
                self._parse_detail(html, recipe)
            except Exception as exc:  # noqa: BLE001
                _LOGGER.debug(
                    "Direct recipe page unavailable for '%s': %s",
                    recipe.title,
                    exc,
                )
            if not recipe.ingredients:
                markdown = await self._fetch_reader_markdown(recipe.url)
                self._parse_reader_markdown(markdown, recipe)
            if not recipe.ingredients:
                raise RecipeFetchError("Recipe page did not contain ingredients")
            recipe.detail_fetched = True
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning("Could not fetch detail for '%s': %s", recipe.title, exc)
            raise RecipeFetchError("Recipe detail is unavailable") from exc
        return recipe

    # ── Listing ──────────────────────────────────────────────────────────────

    async def _fetch_listing(self, url: str, max_count: int) -> list[Recipe]:
        """Fetch one listing page and return recipe stubs."""
        try:
            html = await self._fetch_html(url)
            recipes = self._parse_listing(html, max_count)
            if recipes:
                return recipes
        except Exception as exc:  # noqa: BLE001
            # Large VTEX Store Framework responses are expected here. Continue
            # with the bounded reader endpoint instead of dropping to sitemap
            # stubs, which have no card artwork.
            _LOGGER.debug("Direct recipe listing unavailable for %s: %s", url, exc)

        try:
            # The public reader exposes the rendered category in one bounded
            # response, including official image URLs and destinations.
            markdown = await self._fetch_reader_markdown(url)
            return self._parse_reader_listing(markdown, max_count)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning("Could not fetch listing %s: %s", url, exc)
            return []

    def _parse_reader_listing(self, markdown: str, max_count: int) -> list[Recipe]:
        """Parse rendered recipe cards and thumbnails from category markdown."""
        card_pattern = re.compile(
            r"\[!\[[^\]]*\]\("
            r"(https://auchan\.vtexassets\.com/[^\s)]+)"
            r"\)\]\("
            r"(https?://www\.auchan\.ro/inspiratie-si-savoare/"
            r"(?:retete-cu-imagini|retete-cu-razvan-exarhu)/[^\s)]+)"
            r"\)",
            re.I,
        )
        recipes: list[Recipe] = []
        seen: set[str] = set()
        previous_end = 0

        for match in card_pattern.finditer(markdown):
            image_url, raw_url = match.groups()
            secure_url = re.sub(r"^http://", "https://", raw_url, flags=re.I)
            url = _recipe_url(secure_url)
            if not url or url in seen:
                previous_end = match.end()
                continue

            prefix = markdown[previous_end : match.start()].strip()
            paragraphs = [
                paragraph.strip()
                for paragraph in re.split(r"\n\s*\n", prefix)
                if paragraph.strip()
            ]
            title = ""
            description = ""
            if len(paragraphs) >= 2:
                title = paragraphs[-2].splitlines()[-1].strip()
                description = " ".join(paragraphs[-1].split())[:400]
            if not title or len(title) < 5 or len(title) > 220:
                title = url.rstrip("/").split("/")[-1].replace("-", " ").title()

            recipe_id = re.sub(r"[^a-z0-9]", "_", title.lower())[:48].strip("_")
            recipes.append(
                Recipe(
                    id=recipe_id,
                    title=title,
                    url=url,
                    image_url=image_url,
                    description=description,
                )
            )
            seen.add(url)
            previous_end = match.end()
            if len(recipes) >= max_count:
                break

        return recipes

    def _parse_listing(self, html: str, max_count: int) -> list[Recipe]:
        """Parse recipe cards from a listing page using actual auchan.ro VTEX selectors."""
        soup = BeautifulSoup(html, "html.parser")
        recipes: list[Recipe] = []
        seen: set[str] = set()

        # Primary: real auchan.ro VTEX infoCard selector
        cards = soup.select(SELECTOR_LISTING_CARD)

        # Fallback: any <a> with infoCard in class + href containing recipe path
        if not cards:
            cards = [
                el
                for el in soup.find_all("a", href=True)
                if "infoCard" in " ".join(el.get("class", []))
                or "/inspiratie-si-savoare/" in el.get("href", "")
            ]

        # Secondary fallback: article elements
        if not cards:
            cards = soup.select("article")

        for card in cards[: max_count * 2]:
            try:
                recipe = self._parse_card(soup, card)
                if recipe and recipe.url not in seen:
                    seen.add(recipe.url)
                    recipes.append(recipe)
                    if len(recipes) >= max_count:
                        break
            except Exception as exc:
                _LOGGER.debug("Skipping card: %s", exc)

        # Strategy 2: fallback — any link matching recipe URL
        if not recipes:
            recipes = self._fallback_links(soup, max_count)

        # Strategy 3: VTEX can omit cards from SSR for some clients while still
        # publishing the route table in __RUNTIME__. Extract only allowlisted
        # recipe-detail routes so the panel remains useful in that response mode.
        if not recipes:
            recipes = self._fallback_embedded_routes(html, max_count)

        return recipes

    def _parse_card(self, soup: BeautifulSoup, card) -> Recipe | None:
        """
        Parse an auchan.ro infoCard <a> element into a Recipe stub.
        The card IS the <a> tag on auchan.ro.
        """
        # If card is already an <a> with href
        if card.name == "a" and card.get("href"):
            href = card["href"]
        else:
            link = card.find("a", href=True)
            if not link:
                return None
            href = link["href"]

        href = _recipe_url(href)
        if not href:
            return None

        # Title: look for heading inside card, then strong, then alt text, then URL slug
        title_el = (
            card.find(["h1", "h2", "h3", "h4"])
            or card.find("strong")
            or card.find("span", class_=re.compile(r"title|heading|name", re.I))
        )
        if title_el:
            title = title_el.get_text(strip=True)
        else:
            # Fallback: derive from URL slug
            title = href.rstrip("/").split("/")[-1].replace("-", " ").title()

        # Filter out nav/category links
        if (
            not title
            or len(title) < 5
            or title.lower() in {"retete", "inspiratie", "savoare", "retete cu imagini"}
        ):
            return None

        # Image: look inside card for <img>
        img = card.find("img")
        image_url = ""
        if img:
            image_url = img.get("src") or img.get("data-src") or ""
            if image_url and not image_url.startswith("http"):
                image_url = f"{AUCHAN_BASE}{image_url}"

        recipe_id = re.sub(r"[^a-z0-9]", "_", title.lower())[:48].strip("_")
        return Recipe(id=recipe_id, title=title, url=href, image_url=image_url)

    def _fallback_links(self, soup: BeautifulSoup, max_count: int) -> list[Recipe]:
        """Extract recipe links matching /inspiratie-si-savoare/.../slug."""
        recipes: list[Recipe] = []
        seen: set[str] = set()
        pattern = re.compile(r"/inspiratie-si-savoare/[^/]+/[^/]+", re.I)

        for link in soup.find_all("a", href=pattern):
            href = link["href"]
            href = _recipe_url(href)
            if not href:
                continue
            if href in seen:
                continue
            seen.add(href)

            # Try to get title from link text or nearby heading
            title = link.get_text(strip=True)
            if not title or len(title) < 5:
                parent = link.find_parent(["div", "article", "li"])
                if parent:
                    h = parent.find(["h1", "h2", "h3", "h4"])
                    title = h.get_text(strip=True) if h else ""
            if not title:
                # derive from URL slug
                title = href.split("/")[-1].replace("-", " ").title()

            # Image
            parent = link.find_parent(["div", "article", "li"])
            img = parent.find("img") if parent else None
            image_url = img.get("src", "") if img else ""

            recipe_id = re.sub(r"[^a-z0-9]", "_", title.lower())[:48].strip("_")
            recipes.append(
                Recipe(id=recipe_id, title=title, url=href, image_url=image_url)
            )
            if len(recipes) >= max_count:
                break

        return recipes

    def _fallback_embedded_routes(self, html: str, max_count: int) -> list[Recipe]:
        """Extract recipe stubs from VTEX's embedded route registry."""
        normalized = html.replace(r"\u002F", "/")
        pattern = re.compile(
            r"/inspiratie-si-savoare/"
            r"(retete-cu-imagini|retete-cu-razvan-exarhu)/"
            r"([a-z0-9][a-z0-9-]{2,})",
            re.I,
        )
        recipes: list[Recipe] = []
        seen: set[str] = set()
        for category, slug in pattern.findall(normalized):
            path = f"/inspiratie-si-savoare/{category}/{slug}"
            url = _recipe_url(path)
            if not url or url in seen:
                continue
            seen.add(url)
            title = slug.replace("-", " ").title()
            recipe_id = re.sub(r"[^a-z0-9]", "_", title.lower())[:48].strip("_")
            recipes.append(Recipe(id=recipe_id, title=title, url=url))
            if len(recipes) >= max_count:
                break
        return recipes

    async def _fetch_sitemap_recipes(self, max_count: int) -> list[Recipe]:
        """Use VTEX custom-route sitemaps when recipe listing SSR is empty."""
        try:
            index = await self._fetch_document(AUCHAN_SITEMAP_INDEX_URL)
            sitemap_urls = list(
                dict.fromkeys(
                    re.findall(
                        r"https://www\.auchan\.ro/sitemap/custom-user-routes-\d+\.xml",
                        index,
                        re.I,
                    )
                )
            )
            recipes: list[Recipe] = []
            seen: set[str] = set()
            for sitemap_url in sitemap_urls[:12]:
                xml = await self._fetch_document(sitemap_url)
                for recipe in self._parse_sitemap(xml, max_count):
                    if recipe.url in seen:
                        continue
                    seen.add(recipe.url)
                    recipes.append(recipe)
                    if len(recipes) >= max_count:
                        return recipes
            return recipes
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning("Recipe sitemap fallback failed: %s", exc)
            return []

    @staticmethod
    def _parse_sitemap(xml: str, max_count: int) -> list[Recipe]:
        """Parse allowlisted recipe URLs from one sitemap document."""
        pattern = re.compile(
            r"https://www\.auchan\.ro/inspiratie-si-savoare/"
            r"(retete-cu-imagini|retete-cu-razvan-exarhu)/"
            r"([a-z0-9][a-z0-9-]{2,})",
            re.I,
        )
        recipes: list[Recipe] = []
        seen: set[str] = set()
        for category, slug in pattern.findall(xml):
            url = _recipe_url(f"/inspiratie-si-savoare/{category}/{slug}")
            if not url or url in seen:
                continue
            seen.add(url)
            title = slug.replace("-", " ").title()
            recipe_id = re.sub(r"[^a-z0-9]", "_", title.lower())[:48].strip("_")
            recipes.append(Recipe(id=recipe_id, title=title, url=url))
            if len(recipes) >= max_count:
                break
        return recipes

    # ── Detail page ──────────────────────────────────────────────────────────

    def _parse_detail(self, html: str, recipe: Recipe) -> None:
        """
        Parse ingredient list + meta from a recipe detail page.

        Auchan.ro uses VTEX Rich Text components:
        - Ingredients: ul.vtex-rich-text-0-x-list--blogArticleContent li
        - Text: p.vtex-rich-text-0-x-paragraph--blogArticleContent
        - Title: h1.vtex-rich-text-0-x-heading--blogArticleTitle
        - NO JSON-LD schema.org/Recipe found on these pages
        """
        soup = BeautifulSoup(html, "html.parser")
        recipe.collection_id = self._extract_slider_collection_id(html, recipe.url)

        # The product shelf is the merchant-curated source of truth for what
        # should be added to the basket. It is published as schema.org ItemList
        # data in the SSR response, including products not initially visible in
        # the carousel viewport.
        slider_products = self._extract_slider_products(soup)

        # ── Strategy 1: JSON-LD (check anyway for future-compatibility) ──
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                ld = json.loads(script.string or "")
                if isinstance(ld, list):
                    ld = next((x for x in ld if x.get("@type") == "Recipe"), {})
                if ld.get("@type") == "Recipe":
                    self._extract_from_jsonld(ld, recipe)
            except (TypeError, ValueError, StopIteration) as exc:
                _LOGGER.debug("Invalid recipe JSON-LD ignored: %s", exc)

        if slider_products:
            recipe.ingredients = slider_products
        else:
            # ── Strategy 2: the first section headed "Ingrediente" ──
            ingredient_texts = self._find_ingredients_by_heading(soup)

            # ── Strategy 3: legacy VTEX unordered ingredient list ──
            if not ingredient_texts:
                ingredient_items = soup.select(SELECTOR_INGREDIENTS)
                ingredient_texts = [
                    item.get_text(" ", strip=True)
                    for item in ingredient_items
                    if item.get_text(" ", strip=True)
                ]

            # ── Strategy 4: generic list search ──
            if not ingredient_texts:
                generic_items = soup.select(
                    ".ingrediente li, .ingredients li"
                ) or soup.select("ul.ingredients li, ol.ingredients li")
                ingredient_texts = [
                    item.get_text(" ", strip=True)
                    for item in generic_items
                    if item.get_text(" ", strip=True)
                ]

            if ingredient_texts:
                recipe.ingredients = [
                    self._parse_ingredient_text(text) for text in ingredient_texts
                ]

        # ── Extract servings from first paragraph (e.g. "pentru ~25 de gogoși") ──
        paragraphs = soup.select(SELECTOR_PARAGRAPH)
        for p in paragraphs[:5]:
            text = p.get_text(strip=True)
            m = re.search(
                r"(\d+[-–]?\d*)\s*(?:portii?|persoane?|buc[ăa]ți?|clătite?|gogoși?|prajituri?)",
                text,
                re.I,
            )
            if m and not recipe.servings:
                recipe.servings = m.group(0)

        # ── Meta: servings, prep_time ──
        self._extract_meta(soup, recipe)

        # ── Description: first non-ingredient paragraph ──
        for p in paragraphs[:4]:
            text = p.get_text(" ", strip=True)
            if len(text) > 40 and not recipe.description:
                recipe.description = text[:400]
                break

    @staticmethod
    def _extract_slider_collection_id(html: str, recipe_url: str) -> str:
        """Return the VTEX collection configured for this recipe's product shelf."""
        path = urlparse(recipe_url).path.strip("/")
        if not path:
            return ""
        route_key = "store.custom#" + path.replace("/", "-")
        match = re.search(
            r'\\"collection\\":\\"(\d{1,12})\\".{0,3000}?'
            r'"treePath":"[^\"]*'
            + re.escape(route_key)
            + r"[^\"]*(?:product-list|product-slider)",
            html,
            re.S,
        )
        return match.group(1) if match else ""

    @classmethod
    def _extract_slider_products(cls, soup: BeautifulSoup) -> list[RecipeIngredient]:
        """Parse all merchant-curated products from a schema.org ItemList."""
        ingredients: list[RecipeIngredient] = []
        seen: set[str] = set()

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
            except (TypeError, ValueError):
                continue

            stack = list(data) if isinstance(data, list) else [data]
            while stack:
                node = stack.pop()
                if not isinstance(node, dict):
                    continue
                node_type = node.get("@type")
                if node_type == "ItemList":
                    for entry in node.get("itemListElement") or []:
                        product = (
                            entry.get("item", entry) if isinstance(entry, dict) else {}
                        )
                        ingredient = cls._jsonld_product(product)
                        if not ingredient:
                            continue
                        key = ingredient.sku_id or ingredient.url
                        if key and key not in seen:
                            seen.add(key)
                            ingredients.append(ingredient)
                for value in node.values():
                    if isinstance(value, dict):
                        stack.append(value)
                    elif isinstance(value, list):
                        stack.extend(item for item in value if isinstance(item, dict))

        return ingredients[:30]

    @staticmethod
    def _jsonld_product(product: object) -> RecipeIngredient | None:
        """Convert one allowlisted schema.org Product into a recipe item."""
        if not isinstance(product, dict) or product.get("@type") != "Product":
            return None

        name = str(product.get("name") or "").strip()[:240]
        sku_id = str(product.get("sku") or "").strip()
        if not name or not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", sku_id):
            return None

        raw_url = str(product.get("@id") or product.get("url") or "")
        parsed_url = urlparse(raw_url)
        url = (
            raw_url
            if parsed_url.scheme == "https"
            and parsed_url.hostname == "www.auchan.ro"
            and parsed_url.path.endswith("/p")
            else ""
        )

        raw_image = product.get("image") or ""
        if isinstance(raw_image, list):
            raw_image = raw_image[0] if raw_image else ""
        if isinstance(raw_image, dict):
            raw_image = raw_image.get("url", "")
        image_url = str(raw_image)
        parsed_image = urlparse(image_url)
        if parsed_image.scheme != "https" or parsed_image.hostname not in {
            "auchan.vtexassets.com",
            "auchan.vteximg.com.br",
        }:
            image_url = ""

        offers = product.get("offers") or {}
        if isinstance(offers, list):
            offers = offers[0] if offers else {}
        price_value = offers.get("lowPrice", offers.get("price", 0))
        try:
            price = max(0.0, float(price_value or 0))
        except (TypeError, ValueError):
            price = 0.0

        brand = product.get("brand") or ""
        if isinstance(brand, dict):
            brand = brand.get("name", "")

        return RecipeIngredient(
            name=name,
            raw=name,
            sku_id=sku_id,
            product_id=str(product.get("productID") or product.get("productId") or ""),
            image_url=image_url,
            price=price,
            list_price=price,
            brand=str(brand)[:120],
            url=url,
            description=str(product.get("description") or "")[:4000],
            found=True,
        )

    def _extract_from_jsonld(self, ld: dict, recipe: Recipe) -> None:
        """Populate recipe from schema.org/Recipe JSON-LD."""
        if not recipe.servings:
            recipe.servings = str(ld.get("recipeYield", ""))
        if not recipe.prep_time:
            recipe.prep_time = _duration_str(ld.get("prepTime", ""))
        if not recipe.cook_time:
            recipe.cook_time = _duration_str(ld.get("cookTime", ""))
        if not recipe.description:
            recipe.description = ld.get("description", "")[:400]
        if not recipe.image_url:
            img = ld.get("image")
            if isinstance(img, list):
                img = img[0]
            if isinstance(img, dict):
                img = img.get("url", "")
            recipe.image_url = img or ""

        raw_ingredients = ld.get("recipeIngredient", [])
        if raw_ingredients:
            recipe.ingredients = [
                self._parse_ingredient_text(i) for i in raw_ingredients if i
            ]

    def _find_ingredients_by_heading(self, soup: BeautifulSoup) -> list[str]:
        """
        Find ingredient lines following an ``Ingrediente`` heading.

        Current Auchan pages encode the list as one paragraph separated by
        ``<br>`` elements, while older pages used a semantic ``<ul>``.
        """
        # Find heading containing "ingrediente"
        heading = soup.find(
            lambda tag: tag.name in {"h1", "h2", "h3", "h4", "strong", "b", "p"}
            and re.fullmatch(r"\s*ingrediente\s*:?[\s ]*", tag.get_text(" "), re.I)
        )
        if not heading:
            return []

        # Walk siblings/parent to find a subsequent list
        for sibling in heading.find_next_siblings():
            if sibling.name in {"ul", "ol"}:
                return [
                    item.get_text(" ", strip=True)
                    for item in sibling.find_all("li")
                    if item.get_text(" ", strip=True)
                ]
            # If it's a div/p containing list items
            items = sibling.find_all("li")
            if items:
                return [
                    item.get_text(" ", strip=True)
                    for item in items
                    if item.get_text(" ", strip=True)
                ]
            if sibling.name == "p":
                return [
                    line.strip()
                    for line in sibling.get_text("\n").splitlines()
                    if line.strip()
                ]
            # Stop if we hit another heading
            if sibling.name in {"h1", "h2", "h3", "h4"}:
                break

        # Check parent container
        parent = heading.find_parent(["section", "div", "article"])
        if parent:
            items = parent.find_all("li")
            if items:
                return [
                    item.get_text(" ", strip=True)
                    for item in items
                    if item.get_text(" ", strip=True)
                ]

        return []

    def _parse_reader_markdown(self, markdown: str, recipe: Recipe) -> None:
        """Parse the first ingredient section from the reader fallback."""
        if not recipe.image_url:
            recipe.image_url = self._extract_reader_image_url(markdown)

        slider_products = self._extract_reader_slider_products(markdown)
        if slider_products:
            recipe.ingredients = slider_products
            return

        collecting = False
        ingredient_texts: list[str] = []
        for raw_line in markdown.splitlines():
            line = raw_line.strip()
            normalized = line.casefold().rstrip(":")
            if not collecting:
                if normalized == "ingrediente":
                    collecting = True
                continue
            if normalized.startswith("mod de preparare"):
                break
            match = re.match(r"^[*+-]\s+(.+)$", line)
            if match:
                ingredient_texts.append(match.group(1).strip())
            elif ingredient_texts and line and not line.startswith(("#", ">")):
                break

        if ingredient_texts:
            recipe.ingredients = [
                self._parse_ingredient_text(text) for text in ingredient_texts
            ]

    @staticmethod
    def _extract_reader_slider_products(markdown: str) -> list[RecipeIngredient]:
        """Parse visible shelf products when VTEX sends HA only an SSR shell."""
        section = re.search(
            r"^[ \t]*##\s+Adaugă ingredientele în coș\s*$"
            r"(?P<body>.*?)"
            r"^[ \t]*##\s+Mod de preparare\s*$",
            markdown,
            re.I | re.M | re.S,
        )
        if not section:
            return []

        products: list[RecipeIngredient] = []
        seen: set[str] = set()
        for line in section.group("body").splitlines():
            link_match = re.search(
                r"\]\((https?://www\.auchan\.ro/[^\s)]+/p)\)\s*$", line, re.I
            )
            if not link_match:
                continue
            product_url = _product_url(link_match.group(1))
            if not product_url or product_url in seen:
                continue

            image_matches = re.findall(
                r"!\[([^\]]+)\]"
                r"\((https://auchan\.vtexassets\.com/arquivos/ids/[^\s)]+)\)",
                line,
                re.I,
            )
            if image_matches:
                raw_name, image_url = image_matches[-1]
                name = re.sub(r"^Image\s+\d+\s*:\s*", "", raw_name, flags=re.I)
            else:
                image_url = ""
                name = (
                    urlparse(product_url)
                    .path.rstrip("/")
                    .removesuffix("/p")
                    .split("/")[-1]
                    .replace("-", " ")
                    .title()
                )

            price_match = re.search(r"\b(\d+[,.]\d{2})\s*lei\b", line, re.I)
            price = (
                float(price_match.group(1).replace(",", ".")) if price_match else 0.0
            )
            products.append(
                RecipeIngredient(
                    name=name[:240],
                    raw=name[:240],
                    image_url=image_url,
                    price=price,
                    list_price=price,
                    url=product_url,
                )
            )
            seen.add(product_url)

        return products[:30]

    @staticmethod
    def _extract_reader_image_url(markdown: str) -> str:
        """Return the first allowlisted Auchan VTEX image from reader markdown."""
        # A recipe hero is emitted as a standalone Markdown image. Navigation
        # logos/category icons are wrapped in links (``[![...]](...)``), so an
        # anchored match deliberately excludes those generic assets.
        for candidate in re.findall(
            r"^\s*!\[[^\]]*\]\((https://[^\s)]+)\)\s*$",
            markdown,
            flags=re.MULTILINE,
        ):
            parsed = urlparse(candidate)
            if parsed.scheme == "https" and parsed.hostname == "auchan.vtexassets.com":
                return candidate
        return ""

    def _extract_meta(self, soup: BeautifulSoup, recipe: Recipe) -> None:
        """Extract prep_time and servings from various page patterns."""
        full_text = soup.get_text(" ")

        # Prep time patterns: "30 minute", "1 ora", "45 min"
        if not recipe.prep_time:
            m = re.search(
                r"(?:timp\s+(?:de\s+)?pregătire|preparare|timp\s+total)[:\s]+(\d+[\d\s]*(?:ore?|minute?|min|h))",
                full_text,
                re.I,
            )
            if m:
                recipe.prep_time = m.group(1).strip()
            else:
                # Simple: "Timp: 30 min"
                m = re.search(r"(\d+)\s*(minute?|min|ore?|h)\b", full_text[:1000], re.I)
                if m:
                    recipe.prep_time = f"{m.group(1)} {m.group(2)}"

        # Servings: "pentru 4 persoane", "4 portii"
        if not recipe.servings:
            m = re.search(
                r"(\d+[-–]?\d*)\s*(?:portii?|persoane?|portie|bucati?|clătite|prajituri?)",
                full_text[:2000],
                re.I,
            )
            if m:
                recipe.servings = m.group(0).strip()

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _parse_ingredient_text(text: str) -> RecipeIngredient:
        """
        Parse ingredient text like:
        "200g faina", "2 oua", "1 lingura ulei", "sare dupa gust"
        "300 ml lapte", "o lingurița zahăr vanilat"
        """
        text = text.strip()
        # Normalize: "o" → "1"
        text_norm = re.sub(r"^o\b", "1", text, flags=re.I)

        match = re.match(
            r"^([\d.,½¼¾]+)\s*"
            r"(lingurițe?|linguri|lingură|lingura|lingurit[ăe]?|"
            r"pliculețe?|plicuri?|plic|pachet(?:e|ul)?|"
            r"bucăț?i?|buc\.?|pahare?|canăr?|cuburi?|pungi?|"
            r"căt?u?ș?i?e?|felii?|fire?|crengu?ț?e?|praf|kg|ml|g|l)?"
            r"(?=\s|$)\s*"
            r"(.+)$",
            text_norm,
            re.I | re.UNICODE,
        )
        if match:
            return RecipeIngredient(
                name=match.group(3).strip().rstrip(".,;"),
                quantity=match.group(1) or "",
                unit=(match.group(2) or "").strip(),
                raw=text,
            )
        return RecipeIngredient(name=text.rstrip(".,;"), raw=text)

    async def _fetch_html(self, url: str) -> str:
        return await self._fetch_document(url)

    async def _fetch_reader_markdown(self, recipe_url: str) -> str:
        """Fetch public recipe text when the VTEX edge returns an empty shell."""
        safe_url = _recipe_url(recipe_url)
        if not safe_url:
            raise RecipeFetchError("Recipe URL is outside the Auchan allowlist")
        reader_url = f"{JINA_READER_BASE}{urlparse(safe_url).path}"
        async with self._session.get(
            reader_url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/markdown",
            },
            timeout=SCRAPER_TIMEOUT,
            allow_redirects=False,
        ) as resp:
            resp.raise_for_status()
            payload = await _read_limited_response(resp, MAX_RECIPE_READER_BYTES)
            return payload.decode("utf-8", errors="replace")

    async def _fetch_recipe_thumbnail_url(self, recipe_url: str) -> str:
        """Read only the beginning of the public reader response for its hero image."""
        safe_url = _recipe_url(recipe_url)
        if not safe_url:
            raise RecipeFetchError("Recipe URL is outside the Auchan allowlist")
        reader_url = f"{JINA_READER_BASE}{urlparse(safe_url).path}"
        async with self._session.get(
            reader_url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/markdown",
            },
            timeout=THUMBNAIL_TIMEOUT,
            allow_redirects=False,
        ) as resp:
            resp.raise_for_status()
            payload = await resp.content.read(MAX_RECIPE_THUMBNAIL_BYTES)
            markdown = payload.decode("utf-8", errors="replace")
            return self._extract_reader_image_url(markdown)

    async def _fetch_document(self, url: str) -> str:
        """Fetch an allowlisted recipe or sitemap document with strict limits."""
        parsed = urlparse(url)
        is_recipe = parsed.path.startswith("/inspiratie-si-savoare/")
        is_sitemap = parsed.path == "/sitemap.xml" or bool(
            re.fullmatch(r"/sitemap/custom-user-routes-\d+\.xml", parsed.path)
        )
        if (
            parsed.scheme != "https"
            or parsed.hostname != "www.auchan.ro"
            or not (is_recipe or is_sitemap)
        ):
            raise RecipeFetchError("Document URL is outside the Auchan allowlist")
        async with self._session.get(
            url,
            headers=SCRAPER_HEADERS,
            timeout=SCRAPER_TIMEOUT,
            allow_redirects=True,
        ) as resp:
            resp.raise_for_status()
            if resp.url.host != "www.auchan.ro":
                raise RecipeFetchError("Recipe redirect left the Auchan domain")
            payload = await _read_limited_response(resp, MAX_RECIPE_HTML_BYTES)
            return payload.decode("utf-8", errors="replace")


def _duration_str(iso: str) -> str:
    """Convert ISO 8601 duration like PT30M to '30 minute'."""
    if not iso:
        return ""
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", iso)
    if not m:
        return iso
    hours = int(m.group(1) or 0)
    minutes = int(m.group(2) or 0)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes} min")
    return " ".join(parts) or iso
