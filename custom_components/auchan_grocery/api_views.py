"""REST API views for Auchan Grocery integration."""

from __future__ import annotations

from functools import wraps
import logging
import math
import re
import uuid

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .api.chef import (
    ChefBridgeClient,
    ChefBridgeError,
    match_recipe_products,
    product_match_score,
)
from .api.orderform import VtexOrderFormClient
from .api.regions import VtexRegionsClient
from .api.search import VtexSearchClient
from .const import (
    CONF_CHEF_BRIDGE_TOKEN,
    CONF_CHEF_BRIDGE_URL,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_REGION_ID,
    DOMAIN,
    RO_LAT_MAX,
    RO_LAT_MIN,
    RO_LNG_MAX,
    RO_LNG_MIN,
)
from .storage import GroceryItem, GroceryStorage, SavedAddress

_LOGGER = logging.getLogger(__name__)


def _get_domain_data(hass: HomeAssistant) -> dict:
    """Get the first active integration data dict."""
    domain_data = hass.data.get(DOMAIN, {})
    if not domain_data:
        raise KeyError(f"{DOMAIN} not set up")
    return next(iter(domain_data.values()))


def _server_error(operation: str, exc: Exception) -> web.Response:
    """Log internal detail while returning a stable, non-sensitive response."""
    _LOGGER.exception("%s failed", operation, exc_info=exc)
    return web.json_response(
        {"error": "Serviciul Auchan nu este disponibil momentan"}, status=502
    )


def _chef_client(data: dict) -> ChefBridgeClient | None:
    """Build the server-side bridge client without exposing its token to the UI."""
    config = data.get("config", {})
    url = str(config.get(CONF_CHEF_BRIDGE_URL, "") or "").strip()
    token = str(config.get(CONF_CHEF_BRIDGE_TOKEN, "") or "").strip()
    if not url or not token:
        return None
    try:
        return ChefBridgeClient(data["session"], url, token)
    except ValueError:
        return None


def _chef_unavailable(message: str, status: int = 503) -> web.Response:
    return web.json_response({"error": message}, status=status)


def _coordinates(value_lat: object, value_lng: object) -> tuple[float, float]:
    """Validate finite coordinates inside Romania's bounding box."""
    lat = float(value_lat)
    lng = float(value_lng)
    if not math.isfinite(lat) or not math.isfinite(lng):
        raise ValueError("Coordinates must be finite")
    if not (RO_LAT_MIN <= lat <= RO_LAT_MAX and RO_LNG_MIN <= lng <= RO_LNG_MAX):
        raise ValueError("Coordinates must be inside Romania")
    return lat, lng


async def _enrich_recipe_products(data: dict, recipe) -> None:
    """Hydrate the recipe shelf with exact, region-aware VTEX product data."""
    from .api.recipes import RecipeIngredient

    storage: GroceryStorage = data["storage"]
    active_addr = storage.get_active_address()
    region_id = (
        active_addr.region_id if active_addr else data["config"].get(CONF_REGION_ID, "")
    )
    search_client = VtexSearchClient(data["vtex"])
    if not recipe.collection_id:
        seed_urls = [item.url for item in recipe.ingredients if item.url]
        for product_url in seed_urls[:3]:
            try:
                recipe.collection_id = (
                    await search_client.collection_for_recipe_product(
                        product_url, recipe.title
                    )
                )
            except Exception as exc:  # noqa: BLE001
                _LOGGER.debug("Could not resolve recipe collection: %s", exc)
            if recipe.collection_id:
                break
    if not recipe.collection_id:
        return

    try:
        products = await search_client.by_collection(
            recipe.collection_id, region_id=region_id, count=30
        )
    except Exception as exc:  # noqa: BLE001
        _LOGGER.warning("Could not load exact recipe collection: %s", exc)
        return
    if not products:
        return

    by_sku = {product.sku_id: product for product in products if product.sku_id}
    shelf_skus = [item.sku_id for item in recipe.ingredients if item.sku_id]
    ordered_products = (
        [by_sku[sku] for sku in shelf_skus if sku in by_sku] if shelf_skus else products
    )
    if not ordered_products:
        return

    recipe.ingredients = [
        RecipeIngredient(
            name=product.name,
            raw=product.name,
            sku_id=product.sku_id,
            product_id=product.product_id,
            image_url=product.image_url,
            price=product.price,
            list_price=product.list_price,
            brand=product.brand,
            category=product.category,
            seller_id=product.seller_id or "1",
            availability=product.availability,
            url=product.url,
            description=product.description,
            found=True,
        )
        for product in ordered_products
    ]


def _text(value: object, *, default: str = "", max_length: int = 160) -> str:
    """Normalize user-controlled text at the HTTP boundary."""
    result = str(value or default).strip()
    if len(result) > max_length:
        raise ValueError("Text value is too long")
    return result


def _admin_required(handler):
    """Restrict private grocery/address endpoints to HA administrators."""

    @wraps(handler)
    async def wrapped(self, request: web.Request, *args, **kwargs):
        user = request.get("hass_user")
        if user is None or not user.is_admin:
            raise web.HTTPForbidden(text="Administrator access required")
        return await handler(self, request, *args, **kwargs)

    return wrapped


class AuchanSearchView(HomeAssistantView):
    """GET /api/auchan_grocery/search?q=...&list_id=... → product results."""

    url = "/api/auchan_grocery/search"
    name = "api:auchan_grocery:search"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        query = request.rel_url.query.get("q", "").strip()
        if not query or len(query) < 2 or len(query) > 120:
            return web.json_response({"error": "Query too short"}, status=400)

        try:
            data = _get_domain_data(request.app["hass"])
            vtex = data["vtex"]
            region_id = data["config"].get(CONF_REGION_ID)

            # Prefer active address regionId if available
            storage: GroceryStorage = data["storage"]
            active_addr = storage.get_active_address()
            if active_addr and active_addr.region_id:
                region_id = active_addr.region_id

            search = VtexSearchClient(vtex)
            results = await search.search(query, region_id=region_id, count=15)

            return web.json_response(
                [
                    {
                        "sku_id": r.sku_id,
                        "product_id": r.product_id,
                        "name": r.name,
                        "brand": r.brand,
                        "category": r.category,
                        "image_url": r.image_url,
                        "price": r.price,
                        "list_price": r.list_price,
                        "availability": r.availability,
                        "discount_pct": r.discount_pct,
                        "url": r.url,
                        "description": r.description,
                        "seller_id": r.seller_id,
                    }
                    for r in results
                ]
            )
        except Exception as exc:  # noqa: BLE001
            return _server_error("Product search", exc)


class AuchanPickupView(HomeAssistantView):
    """GET /api/auchan_grocery/pickup?lat=...&lng=... → pickup points."""

    url = "/api/auchan_grocery/pickup"
    name = "api:auchan_grocery:pickup"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            lat_raw = request.rel_url.query.get("lat")
            lng_raw = request.rel_url.query.get("lng")
            lat, lng = (
                _coordinates(lat_raw, lng_raw) if lat_raw and lng_raw else (0.0, 0.0)
            )
        except ValueError:
            return web.json_response({"error": "Invalid coordinates"}, status=400)

        if not lat or not lng:
            # Prefer active address coordinates; fall back to HA config then Bucharest
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            active_addr = storage.get_active_address()
            if active_addr and active_addr.latitude and active_addr.longitude:
                lat = active_addr.latitude
                lng = active_addr.longitude
            else:
                lat = data["config"].get(CONF_LATITUDE, 44.4195)
                lng = data["config"].get(CONF_LONGITUDE, 26.1776)

        try:
            data = _get_domain_data(request.app["hass"])
            vtex = data["vtex"]
            of_client = VtexOrderFormClient(vtex)
            points = await of_client.nearby_pickup_points(lat, lng)

            return web.json_response(
                [
                    {
                        "id": p.id,
                        "name": p.name,
                        "address": p.address,
                        "city": p.city,
                        "postal_code": p.postal_code,
                        "latitude": p.latitude,
                        "longitude": p.longitude,
                        "distance_km": p.distance_km,
                        "is_active": p.is_active,
                    }
                    for p in points
                ]
            )
        except Exception as exc:  # noqa: BLE001
            return _server_error("Pickup search", exc)


class AuchanListsView(HomeAssistantView):
    """GET /api/auchan_grocery/lists → all grocery lists."""

    url = "/api/auchan_grocery/lists"
    name = "api:auchan_grocery:lists"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            lists = storage.get_all_lists()

            return web.json_response(
                [
                    {
                        "id": lst.id,
                        "name": lst.name,
                        "is_active": lst.id == storage.get_active_list_id(),
                        "selected_sla": lst.selected_sla,
                        "item_count": lst.item_count,
                        "items": [
                            {
                                "sku_id": i.sku_id,
                                "product_id": i.product_id,
                                "name": i.name,
                                "brand": i.brand,
                                "quantity": i.quantity,
                                "current_price": i.current_price,
                                "list_price": i.list_price,
                                "discount_pct": i.discount_pct,
                                "availability": i.availability,
                                "in_cart": i.in_cart,
                                "watch": i.watch,
                                "watch_price": i.watch_price,
                                "watch_stock": i.watch_stock,
                                "image_url": i.image_url,
                                "url": i.url,
                                "description": getattr(i, "description", ""),
                                "category": i.category,
                                "seller_id": i.seller_id,
                            }
                            for i in lst.items
                        ],
                    }
                    for lst in lists
                ]
            )
        except Exception as exc:  # noqa: BLE001
            return _server_error("List loading", exc)


class AuchanRecipesView(HomeAssistantView):
    """
    GET /api/auchan_grocery/recipes → scraped Auchan recipes (listing only).
    Recipes are cached in hass.data for 6 hours.
    Query params:
      force=1  → bypass cache
    """

    url = "/api/auchan_grocery/recipes"
    name = "api:auchan_grocery:recipes"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            from datetime import UTC, datetime, timedelta
            from .api.recipes import AuchanRecipeScraper

            hass = request.app["hass"]
            force = request.rel_url.query.get("force", "").lower() == "1"

            # Per-domain cache stored in hass.data
            data = _get_domain_data(hass)
            now = datetime.now(UTC)
            cache_expiry: datetime | None = data.get("_recipes_expiry")
            cached: list | None = data.get("_recipes_cache")

            if not force and cached and cache_expiry and now < cache_expiry:
                return web.json_response([r.to_dict() for r in cached])

            scraper = AuchanRecipeScraper(data["session"])
            recipes = await scraper.get_recipes(max_per_category=12)

            # Store raw Recipe objects for detail endpoint reuse
            data["_recipes_cache"] = recipes
            data["_recipes_expiry"] = now + timedelta(hours=6)
            data["_recipes_by_id"] = {r.id: r for r in recipes}

            return web.json_response([r.to_dict() for r in recipes])
        except Exception as exc:  # noqa: BLE001
            return _server_error("Recipe loading", exc)


class AuchanRecipeDetailView(HomeAssistantView):
    """
    GET /api/auchan_grocery/recipes/{recipe_id}/detail
    → full recipe with ingredients (scrapes detail page if not cached).
    """

    url = "/api/auchan_grocery/recipes/{recipe_id}/detail"
    name = "api:auchan_grocery:recipe_detail"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request, recipe_id: str) -> web.Response:
        try:
            from .api.recipes import AuchanRecipeScraper

            hass = request.app["hass"]
            data = _get_domain_data(hass)

            recipes_by_id: dict = data.get("_recipes_by_id", {})
            recipe = recipes_by_id.get(recipe_id)
            if not recipe:
                return web.json_response(
                    {"error": "Recipe not found. Fetch /recipes first."}, status=404
                )

            scraper = AuchanRecipeScraper(data["session"])
            recipe = await scraper.get_recipe_detail(recipe)
            await _enrich_recipe_products(data, recipe)

            # Persist updated recipe back
            data["_recipes_by_id"][recipe_id] = recipe

            return web.json_response(recipe.to_dict())
        except Exception as exc:  # noqa: BLE001
            return _server_error("Recipe detail", exc)


class AuchanRecipeImportView(HomeAssistantView):
    """
    POST /api/auchan_grocery/recipes/{recipe_id}/import
    → add exact products from the recipe's merchant-curated VTEX shelf.

    Body (JSON):
      {
        "list_id":        "<list_id>",        // required; or "new" to create
        "list_name":      "Supă de legume",   // used if list_id=="new"
        "sku_ids": ["427486", "149369"] // optional filter; default = all
      }

    Response:
      {
        "recipe_title": str,
        "list_id": str,
        "list_name": str,
        "added": [{name, sku_id, product_name, price}],
        "not_found": ["<ingredient_name>", ...]
      }
    """

    url = "/api/auchan_grocery/recipes/{recipe_id}/import"
    name = "api:auchan_grocery:recipe_import"
    requires_auth = True

    @_admin_required
    async def post(self, request: web.Request, recipe_id: str) -> web.Response:
        try:
            from .api.recipes import (
                AuchanRecipeScraper,
                select_importable_recipe_products,
            )

            hass = request.app["hass"]
            data = _get_domain_data(hass)
            storage: GroceryStorage = data["storage"]

            try:
                body = await request.json()
            except Exception:
                return web.json_response({"error": "Invalid JSON"}, status=400)
            if not isinstance(body, dict):
                return web.json_response({"error": "JSON object required"}, status=400)

            # ── Resolve recipe ──
            recipes_by_id: dict = data.get("_recipes_by_id", {})
            recipe = recipes_by_id.get(recipe_id)
            if not recipe:
                return web.json_response(
                    {"error": "Recipe not found. Fetch /recipes first."}, status=404
                )

            # ── Fetch detail if needed ──
            if not recipe.detail_fetched:
                scraper = AuchanRecipeScraper(data["session"])
                recipe = await scraper.get_recipe_detail(recipe)
                data["_recipes_by_id"][recipe_id] = recipe

            # Refresh the exact collection before import so product IDs,
            # regional availability, seller and prices stay authoritative.
            await _enrich_recipe_products(data, recipe)

            exact_products = select_importable_recipe_products(recipe.ingredients[:30])
            if not exact_products:
                return web.json_response(
                    {
                        "error": (
                            "Auchan does not expose a verified product shelf "
                            "for this recipe"
                        )
                    },
                    status=422,
                )

            # Filter by immutable VTEX SKU IDs. Older cached frontends may still
            # send names; they are accepted only to select already-verified
            # shelf products and never trigger a catalog text search.
            selected_skus: list[str] | None = body.get("sku_ids")
            if selected_skus is not None and (
                not isinstance(selected_skus, list)
                or any(not isinstance(sku, str) for sku in selected_skus)
            ):
                return web.json_response(
                    {"error": "sku_ids must be a string list"}, status=400
                )
            if selected_skus is not None:
                ingredients = select_importable_recipe_products(
                    exact_products, set(selected_skus)
                )
            else:
                selected_names: list[str] | None = body.get("ingredient_names")
                if selected_names is not None and (
                    not isinstance(selected_names, list)
                    or any(not isinstance(name, str) for name in selected_names)
                ):
                    return web.json_response(
                        {"error": "ingredient_names must be a string list"},
                        status=400,
                    )
                if selected_names is not None:
                    selected_lower = {name.lower() for name in selected_names}
                    ingredients = [
                        item
                        for item in exact_products
                        if item.name.lower() in selected_lower
                    ]
                else:
                    ingredients = exact_products

            if not ingredients:
                return web.json_response(
                    {"error": "No verified products selected"}, status=422
                )

            # ── Resolve target list ──
            list_id = body.get("list_id", "new")
            if list_id == "new":
                from slugify import slugify

                new_name = _text(
                    body.get("list_name"),
                    default=f"Rețetă: {recipe.title[:40]}",
                    max_length=80,
                )
                candidate = slugify(new_name, separator="_")[:48] or "reteta"
                if storage.get_list(candidate):
                    candidate = f"{candidate}_{uuid.uuid4().hex[:8]}"
                new_list = await storage.create_list(candidate, new_name)
                if not new_list:
                    return web.json_response(
                        {"error": "List limit reached"}, status=409
                    )
                list_id = new_list.id
                _LOGGER.info("Created a new list for recipe import")
            elif not isinstance(list_id, str) or not storage.get_list(list_id):
                return web.json_response({"error": "List not found"}, status=404)

            # Add only the exact, already hydrated VTEX shelf products.
            added = []
            not_found = []

            for product in ingredients:
                try:
                    stored = await storage.add_item(
                        list_id,
                        GroceryItem(
                            sku_id=product.sku_id,
                            product_id=product.product_id,
                            name=product.name,
                            brand=product.brand,
                            quantity=1,
                            image_url=product.image_url,
                            price_when_added=product.price,
                            current_price=product.price,
                            list_price=product.list_price,
                            category=product.category,
                            description=product.description,
                            availability=product.availability,
                            url=product.url,
                            seller_id=product.seller_id or "1",
                        ),
                    )
                    if not stored:
                        raise ValueError("list capacity reached")
                    added.append(
                        {
                            "ingredient": product.name,
                            "sku_id": product.sku_id,
                            "product_name": product.name,
                            "price": product.price,
                            "image_url": product.image_url,
                        }
                    )
                except Exception as exc:
                    _LOGGER.warning("Could not add %s to list: %s", product.name, exc)
                    not_found.append(product.name)

            # Get list info for response
            the_list = storage.get_list(list_id)
            list_name = (
                the_list.name if the_list and hasattr(the_list, "name") else list_id
            )

            return web.json_response(
                {
                    "recipe_title": recipe.title,
                    "list_id": list_id,
                    "list_name": list_name,
                    "added_count": len(added),
                    "not_found_count": len(not_found),
                    "added": added,
                    "not_found": not_found,
                }
            )

        except Exception as exc:  # noqa: BLE001
            return _server_error("Recipe import", exc)


# ── Chef AI Views ─────────────────────────────────────────────────────────────


class AuchanChefStatusView(HomeAssistantView):
    """GET /api/auchan_grocery/chef/status → private bridge/auth status."""

    url = "/api/auchan_grocery/chef/status"
    name = "api:auchan_grocery:chef_status"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        data = _get_domain_data(request.app["hass"])
        client = _chef_client(data)
        if client is None:
            return web.json_response(
                {
                    "configured": False,
                    "connected": False,
                    "error": (
                        "Configurează adresa și tokenul Chef AI în opțiunile "
                        "integrării Home Assistant."
                    ),
                }
            )
        try:
            result = await client.status()
            result["configured"] = True
            if result.get("connected"):
                try:
                    result["usage"] = await client.usage()
                except ChefBridgeError:
                    result["usage"] = None
            return web.json_response(result)
        except ChefBridgeError as exc:
            return web.json_response(
                {"configured": True, "connected": False, "error": str(exc)},
                status=502,
            )


class AuchanChefLoginStartView(HomeAssistantView):
    """POST /api/auchan_grocery/chef/login → start ChatGPT device login."""

    url = "/api/auchan_grocery/chef/login"
    name = "api:auchan_grocery:chef_login_start"
    requires_auth = True

    @_admin_required
    async def post(self, request: web.Request) -> web.Response:
        data = _get_domain_data(request.app["hass"])
        client = _chef_client(data)
        if client is None:
            return _chef_unavailable("Chef AI bridge is not configured")
        try:
            return web.json_response(await client.start_device_login())
        except ChefBridgeError as exc:
            return _chef_unavailable(str(exc), 502)


class AuchanChefLoginStatusView(HomeAssistantView):
    """GET /api/auchan_grocery/chef/login/{login_id} → poll device login."""

    url = "/api/auchan_grocery/chef/login/{login_id}"
    name = "api:auchan_grocery:chef_login_status"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request, login_id: str) -> web.Response:
        data = _get_domain_data(request.app["hass"])
        client = _chef_client(data)
        if client is None:
            return _chef_unavailable("Chef AI bridge is not configured")
        try:
            return web.json_response(await client.device_login_status(login_id))
        except ValueError:
            return web.json_response({"error": "Invalid login ID"}, status=400)
        except ChefBridgeError as exc:
            return _chef_unavailable(str(exc), 502)


class AuchanChefLogoutView(HomeAssistantView):
    """POST /api/auchan_grocery/chef/logout → remove ChatGPT credentials."""

    url = "/api/auchan_grocery/chef/logout"
    name = "api:auchan_grocery:chef_logout"
    requires_auth = True

    @_admin_required
    async def post(self, request: web.Request) -> web.Response:
        data = _get_domain_data(request.app["hass"])
        client = _chef_client(data)
        if client is None:
            return _chef_unavailable("Chef AI bridge is not configured")
        try:
            return web.json_response(await client.logout())
        except ChefBridgeError as exc:
            return _chef_unavailable(str(exc), 502)


class AuchanChefPreferencesView(HomeAssistantView):
    """GET/PUT /api/auchan_grocery/chef/preferences → cooking profile."""

    url = "/api/auchan_grocery/chef/preferences"
    name = "api:auchan_grocery:chef_preferences"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        data = _get_domain_data(request.app["hass"])
        storage: GroceryStorage = data["storage"]
        return web.json_response(storage.get_chef_preferences())

    @_admin_required
    async def put(self, request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)
        if not isinstance(body, dict):
            return web.json_response({"error": "JSON object required"}, status=400)
        data = _get_domain_data(request.app["hass"])
        storage: GroceryStorage = data["storage"]
        return web.json_response(await storage.set_chef_preferences(body))


def _validate_recipe_payload(value: object) -> dict:
    """Apply a second trust boundary after the bridge's JSON Schema validation."""
    if not isinstance(value, dict):
        raise ValueError("Invalid recipe payload")
    recipe_type = value.get("type")
    if recipe_type not in {"recipe", "clarification"}:
        raise ValueError("Invalid recipe type")

    def clean(key: str, limit: int) -> str:
        return str(value.get(key, "") or "").strip()[:limit]

    try:
        servings = min(20, max(1, int(value.get("servings", 2))))
        prep_minutes = min(1440, max(0, int(value.get("prep_minutes", 0))))
        cook_minutes = min(1440, max(0, int(value.get("cook_minutes", 0))))
    except (TypeError, ValueError) as exc:
        raise ValueError("Invalid recipe numbers") from exc

    ingredients: list[dict] = []
    raw_ingredients = value.get("ingredients", [])
    if not isinstance(raw_ingredients, list):
        raise ValueError("Invalid ingredients")
    for raw in raw_ingredients[:30]:
        if not isinstance(raw, dict):
            continue
        name = str(raw.get("name", "") or "").strip()[:120]
        query = str(raw.get("search_query", "") or name).strip()[:120]
        if not name or not query:
            continue
        try:
            quantity = min(100000.0, max(0.0, float(raw.get("quantity", 0))))
        except (TypeError, ValueError):
            quantity = 0.0
        ingredients.append(
            {
                "name": name,
                "search_query": query,
                "quantity": quantity,
                "unit": str(raw.get("unit", "") or "")[:24],
                "optional": bool(raw.get("optional", False)),
                "notes": str(raw.get("notes", "") or "")[:240],
            }
        )

    def string_list(key: str, count: int, length: int) -> list[str]:
        raw = value.get(key, [])
        if not isinstance(raw, list):
            return []
        return [str(item).strip()[:length] for item in raw[:count] if str(item).strip()]

    return {
        "type": recipe_type,
        "message": clean("message", 500),
        "title": clean("title", 160),
        "description": clean("description", 1000),
        "servings": servings,
        "prep_minutes": prep_minutes,
        "cook_minutes": cook_minutes,
        "difficulty": clean("difficulty", 20),
        "ingredients": ingredients,
        "instructions": string_list("instructions", 24, 600),
        "tips": string_list("tips", 10, 400),
        "source_urls": string_list("source_urls", 8, 500),
    }


class AuchanChefPlanView(HomeAssistantView):
    """POST /api/auchan_grocery/chef/plan → recipe plus verified candidates."""

    url = "/api/auchan_grocery/chef/plan"
    name = "api:auchan_grocery:chef_plan"
    requires_auth = True

    @_admin_required
    async def post(self, request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)
        if not isinstance(body, dict):
            return web.json_response({"error": "JSON object required"}, status=400)
        try:
            prompt = _text(body.get("prompt"), max_length=2000)
        except ValueError:
            return web.json_response({"error": "Prompt too long"}, status=400)
        if len(prompt) < 3:
            return web.json_response({"error": "Prompt too short"}, status=400)
        thread_id = str(body.get("thread_id", "") or "")[:100]

        data = _get_domain_data(request.app["hass"])
        client = _chef_client(data)
        if client is None:
            return _chef_unavailable("Chef AI bridge is not configured")
        storage: GroceryStorage = data["storage"]
        try:
            generated = await client.recipe(
                prompt,
                storage.get_chef_preferences(),
                thread_id,
            )
            recipe = _validate_recipe_payload(generated.get("recipe"))
            if recipe["type"] == "recipe":
                active_address = storage.get_active_address()
                region_id = active_address.region_id if active_address else None
                recipe["ingredients"] = await match_recipe_products(
                    VtexSearchClient(data["vtex"]),
                    recipe["ingredients"],
                    region_id,
                )
            return web.json_response(
                {
                    "thread_id": str(generated.get("thread_id", ""))[:100],
                    "recipe": recipe,
                }
            )
        except ChefBridgeError as exc:
            return _chef_unavailable(str(exc), 502)
        except ValueError as exc:
            _LOGGER.warning("Chef bridge returned invalid recipe data: %s", exc)
            return _chef_unavailable("Chef AI returned an invalid recipe", 502)


class AuchanChefImportView(HomeAssistantView):
    """POST /api/auchan_grocery/chef/import → import revalidated exact SKUs."""

    url = "/api/auchan_grocery/chef/import"
    name = "api:auchan_grocery:chef_import"
    requires_auth = True

    @_admin_required
    async def post(self, request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)
        if not isinstance(body, dict) or not isinstance(body.get("selections"), list):
            return web.json_response({"error": "Invalid selections"}, status=400)
        selections = body["selections"][:30]
        if not selections:
            return web.json_response({"error": "No products selected"}, status=400)

        data = _get_domain_data(request.app["hass"])
        storage: GroceryStorage = data["storage"]
        list_id = body.get("list_id") or storage.get_active_list_id() or "new"
        if list_id == "new":
            from slugify import slugify

            recipe_title = _text(
                body.get("recipe_title"), default="Chef AI", max_length=80
            )
            list_name = f"Rețetă: {recipe_title[:60]}"
            candidate = slugify(list_name, separator="_")[:48] or "chef_ai"
            if storage.get_list(candidate):
                candidate = f"{candidate}_{uuid.uuid4().hex[:8]}"
            created = await storage.create_list(candidate, list_name)
            if created is None:
                return web.json_response({"error": "List limit reached"}, status=409)
            list_id = created.id
        elif not isinstance(list_id, str) or not storage.get_list(list_id):
            return web.json_response({"error": "List not found"}, status=404)

        active_address = storage.get_active_address()
        region_id = active_address.region_id if active_address else None
        search = VtexSearchClient(data["vtex"])
        added: list[dict] = []
        rejected: list[str] = []

        for selection in selections:
            if not isinstance(selection, dict):
                continue
            sku_id = str(selection.get("sku_id", "") or "")
            query = str(selection.get("search_query", "") or "")[:120]
            ingredient_name = str(selection.get("ingredient_name", query) or query)[
                :120
            ]
            try:
                quantity = min(20, max(1, int(selection.get("quantity", 1))))
            except (TypeError, ValueError):
                quantity = 1
            if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", sku_id) or not query:
                rejected.append(ingredient_name)
                continue
            try:
                product = await search.by_sku(sku_id, region_id=region_id)
            except Exception as exc:  # noqa: BLE001
                _LOGGER.warning("Could not revalidate selected Chef SKU: %s", exc)
                product = None
            if product is None or product_match_score(query, product) < 0.45:
                rejected.append(ingredient_name)
                continue
            stored = await storage.add_item(
                list_id,
                GroceryItem(
                    sku_id=product.sku_id,
                    product_id=product.product_id,
                    name=product.name,
                    brand=product.brand,
                    quantity=quantity,
                    image_url=product.image_url,
                    price_when_added=product.price,
                    current_price=product.price,
                    list_price=product.list_price,
                    category=product.category,
                    description=product.description,
                    availability=product.availability,
                    url=product.url,
                    seller_id=product.seller_id or "1",
                ),
            )
            if not stored:
                rejected.append(ingredient_name)
                continue
            added.append(
                {
                    "ingredient": ingredient_name,
                    "sku_id": product.sku_id,
                    "product_name": product.name,
                    "quantity": quantity,
                }
            )

        grocery_list = storage.get_list(list_id)
        return web.json_response(
            {
                "list_id": list_id,
                "list_name": grocery_list.name if grocery_list else str(list_id),
                "added_count": len(added),
                "rejected_count": len(rejected),
                "added": added,
                "rejected": rejected,
            }
        )


# ── Address Views ──────────────────────────────────────────────────────────────


class AuchanAddressesView(HomeAssistantView):
    """
    GET  /api/auchan_grocery/addresses → list all saved addresses
    POST /api/auchan_grocery/addresses → add a new address
    """

    url = "/api/auchan_grocery/addresses"
    name = "api:auchan_grocery:addresses"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            addresses = storage.get_all_addresses()
            return web.json_response([_addr_to_dict(a) for a in addresses])
        except Exception as exc:  # noqa: BLE001
            return _server_error("Address loading", exc)

    @_admin_required
    async def post(self, request: web.Request) -> web.Response:
        """
        Body (JSON):
          {
            "label": "Acasă",
            "display_name": "Str. Exemplu 1, București",
            "latitude": 44.42,
            "longitude": 26.10,
            "postal_code": "010101"   // optional — will be resolved if missing
          }
        """
        try:
            body = await request.json()
        except Exception:
            return web.json_response({"error": "Invalid JSON"}, status=400)

        if not isinstance(body, dict):
            return web.json_response({"error": "JSON object required"}, status=400)
        try:
            lat, lng = _coordinates(body.get("latitude"), body.get("longitude"))
            label = _text(body.get("label"), default="Adresă nouă", max_length=60)
            display_name = _text(
                body.get("display_name"),
                default=f"{lat:.4f}, {lng:.4f}",
                max_length=240,
            )
            postal_code = _text(body.get("postal_code"), max_length=16)
        except (TypeError, ValueError):
            return web.json_response({"error": "Invalid address data"}, status=400)

        try:
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            vtex = data["vtex"]

            address_id = str(uuid.uuid4())[:8]
            # Auto-resolve postal code from coordinates via Nominatim if not provided
            if not postal_code:
                try:
                    from .api.nominatim import NominatimClient

                    nom = NominatimClient(vtex.session)
                    geo_result = await nom.reverse(lat, lng)
                    if geo_result:
                        postal_code = geo_result.postcode or ""
                        _LOGGER.info("Auto-resolved postal code for saved address")
                except Exception as exc_geo:
                    _LOGGER.warning(
                        "Could not resolve postal code from coords: %s", exc_geo
                    )

            address = SavedAddress(
                id=address_id,
                label=label,
                display_name=display_name,
                latitude=lat,
                longitude=lng,
                postal_code=postal_code,
                is_active=body.get("set_active", True),
            )

            # Resolve regionId + seller synchronously (5s timeout, graceful fallback)
            regions_client = VtexRegionsClient(vtex)
            region_info = await regions_client.resolve_region(
                latitude=address.latitude,
                longitude=address.longitude,
                postal_code=address.postal_code or None,
            )
            if region_info:
                address.region_id = region_info["region_id"]
                address.seller_id = region_info["seller_id"]
                address.store_name = region_info["store_name"]
                address.store_id = region_info["seller_id"]  # legacy compat
                _LOGGER.info("Saved address was regionalized successfully")
            else:
                _LOGGER.warning("Saved address has no resolved regionId")

            ok = await storage.add_address(address)
            if not ok:
                return web.json_response({"error": "Address limit reached"}, status=409)

            return web.json_response(_addr_to_dict(address), status=201)
        except Exception as exc:  # noqa: BLE001
            return _server_error("Address creation", exc)


class AuchanAddressDetailView(HomeAssistantView):
    """
    DELETE /api/auchan_grocery/addresses/{address_id}
    """

    url = "/api/auchan_grocery/addresses/{address_id}"
    name = "api:auchan_grocery:address_detail"
    requires_auth = True

    @_admin_required
    async def delete(self, request: web.Request, address_id: str) -> web.Response:
        try:
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            ok = await storage.delete_address(address_id)
            if not ok:
                return web.json_response({"error": "Address not found"}, status=404)
            return web.json_response({"ok": True})
        except Exception as exc:  # noqa: BLE001
            return _server_error("Address deletion", exc)


class AuchanAddressActivateView(HomeAssistantView):
    """POST /api/auchan_grocery/addresses/{address_id}/activate"""

    url = "/api/auchan_grocery/addresses/{address_id}/activate"
    name = "api:auchan_grocery:address_activate"
    requires_auth = True

    @_admin_required
    async def post(self, request: web.Request, address_id: str) -> web.Response:
        try:
            hass = request.app["hass"]
            data = _get_domain_data(hass)
            storage: GroceryStorage = data["storage"]
            ok = await storage.set_active_address(address_id)
            if not ok:
                return web.json_response({"error": "Address not found"}, status=404)

            active = storage.get_active_address()

            # Re-resolve region + seller for the newly active address
            # This ensures seller_id is correct for the new store (not stale from old address)
            if active and active.latitude and active.longitude:
                try:
                    regions_client = VtexRegionsClient(data["vtex"])
                    region_info = await regions_client.resolve_region(
                        active.latitude,
                        active.longitude,
                        postal_code=active.postal_code or None,
                    )
                    if region_info:
                        await storage.update_address_region(
                            active.id,
                            region_id=region_info["region_id"],
                            seller_id=region_info["seller_id"],
                            store_name=region_info["store_name"],
                        )
                        _LOGGER.info(
                            "Activated '%s': region=%s seller=%s",
                            active.display_name,
                            active.region_id,
                            active.seller_id,
                        )
                except Exception as exc:  # noqa: BLE001
                    _LOGGER.warning("Could not re-resolve region on activate: %s", exc)

            # Trigger availability/price refresh in background
            coordinator = data.get("coordinator")
            if coordinator:
                coordinator.async_request_refresh()

            return web.json_response(_addr_to_dict(active) if active else {"ok": True})
        except Exception as exc:  # noqa: BLE001
            return _server_error("Address activation", exc)


class AuchanSellersView(HomeAssistantView):
    """GET /api/auchan_grocery/sellers → sellers for active address."""

    url = "/api/auchan_grocery/sellers"
    name = "api:auchan_grocery:sellers"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            vtex = data["vtex"]

            active = storage.get_active_address()
            if not active:
                return web.json_response({"error": "No active address"}, status=404)

            regions_client = VtexRegionsClient(vtex)

            # Resolve regionId if not cached
            if not active.region_id:
                region_id = await regions_client.get_region_id(
                    active.latitude,
                    active.longitude,
                    postal_code=active.postal_code or None,
                )
                if region_id:
                    await storage.update_address_region_id(active.id, region_id)
                    active.region_id = region_id

            if not active.region_id:
                return web.json_response(
                    {"error": "Could not determine regionId"}, status=422
                )

            sellers = await regions_client.get_sellers_by_region(
                active.region_id, active.latitude, active.longitude
            )

            # Also fetch pickup points to enrich sellers with coordinates
            of_client = VtexOrderFormClient(vtex)
            pickup_points = await of_client.nearby_pickup_points(
                active.latitude,
                active.longitude,
                postal_code=active.postal_code or None,
            )
            pickup_by_name = {p.name.lower(): p for p in pickup_points}

            result = []
            for seller in sellers:
                # Try to match seller name to a pickup point for coordinates
                pp = pickup_by_name.get(seller.name.lower())
                result.append(
                    {
                        "id": seller.id,
                        "name": seller.name,
                        "logo": seller.logo,
                        "latitude": pp.latitude if pp else 0.0,
                        "longitude": pp.longitude if pp else 0.0,
                        "distance_km": pp.distance_km if pp else 0.0,
                        "address": pp.address if pp else "",
                        "city": pp.city if pp else "",
                        "postal_code": pp.postal_code if pp else "",
                    }
                )

            # Merge pickup points not matched to any seller
            matched_names = {s["name"].lower() for s in result}
            for pp in pickup_points:
                if pp.name.lower() not in matched_names:
                    result.append(
                        {
                            "id": pp.id,
                            "name": pp.name,
                            "logo": "",
                            "latitude": pp.latitude,
                            "longitude": pp.longitude,
                            "distance_km": pp.distance_km,
                            "address": pp.address,
                            "city": pp.city,
                            "postal_code": pp.postal_code,
                        }
                    )

            result.sort(key=lambda s: s.get("distance_km", 999))
            return web.json_response(result)

        except Exception as exc:  # noqa: BLE001
            return _server_error("Seller loading", exc)


class AuchanGeocodeView(HomeAssistantView):
    """GET /api/auchan_grocery/geocode?q=... → address autocomplete via Photon."""

    url = "/api/auchan_grocery/geocode"
    name = "api:auchan_grocery:geocode"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        query = request.rel_url.query.get("q", "").strip()
        if not query or len(query) < 2:
            return web.json_response([], status=200)
        if len(query) > 160:
            return web.json_response({"error": "Query too long"}, status=400)

        try:
            data = _get_domain_data(request.app["hass"])
            vtex = data["vtex"]
            regions_client = VtexRegionsClient(vtex)
            results = await regions_client.geocode_autocomplete(query)
            return web.json_response(results)
        except Exception as exc:  # noqa: BLE001
            return _server_error("Geocoding", exc)


class AuchanRegionView(HomeAssistantView):
    """GET /api/auchan_grocery/region → regionId + diagnostics for active address."""

    url = "/api/auchan_grocery/region"
    name = "api:auchan_grocery:region"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            data = _get_domain_data(request.app["hass"])
            storage: GroceryStorage = data["storage"]
            vtex = data["vtex"]
            config = data["config"]

            active = storage.get_active_address()

            lat = active.latitude if active else config.get(CONF_LATITUDE, 0)
            lng = active.longitude if active else config.get(CONF_LONGITUDE, 0)
            postal_code = active.postal_code if active else ""
            region_id = active.region_id if active else config.get(CONF_REGION_ID, "")

            # Recalculate if forced or no regionId cached
            force = request.rel_url.query.get("force", "").lower() == "1"
            if force or not region_id:
                regions_client = VtexRegionsClient(vtex)
                new_region_id = await regions_client.get_region_id(
                    lat, lng, postal_code or None
                )
                if new_region_id:
                    region_id = new_region_id
                    if active:
                        await storage.update_address_region_id(active.id, region_id)

            return web.json_response(
                {
                    "address": _addr_to_dict(active) if active else None,
                    "region_id": region_id,
                    "latitude": lat,
                    "longitude": lng,
                    "postal_code": postal_code,
                }
            )

        except Exception as exc:  # noqa: BLE001
            return _server_error("Region diagnostics", exc)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _addr_to_dict(addr: SavedAddress) -> dict:
    return {
        "id": addr.id,
        "label": addr.label,
        "display_name": addr.display_name,
        "latitude": addr.latitude,
        "longitude": addr.longitude,
        "postal_code": addr.postal_code,
        "region_id": addr.region_id,
        "seller_id": addr.seller_id,
        "store_name": addr.store_name,
        "is_active": addr.is_active,
        "created_at": addr.created_at,
    }


class AuchanRegionResolveView(HomeAssistantView):
    """
    GET /api/auchan_grocery/region_resolve?lat=44.41&lng=26.09

    Resolves VTEX regionId + stores for given coordinates.
    Used by the map for explore-mode (click anywhere -> discover stores).
    Returns: { region_id, seller_id, store_name, all_sellers }
    """

    url = "/api/auchan_grocery/region_resolve"
    name = "api:auchan_grocery:region_resolve"
    requires_auth = True

    @_admin_required
    async def get(self, request: web.Request) -> web.Response:
        try:
            lat, lng = _coordinates(
                request.rel_url.query.get("lat"),
                request.rel_url.query.get("lng"),
            )
        except (TypeError, ValueError):
            return web.json_response(
                {"error": "lat and lng required (float)"}, status=400
            )

        try:
            data = _get_domain_data(request.app["hass"])
            vtex = data["vtex"]
            regions_client = VtexRegionsClient(vtex)
            region_info = await regions_client.resolve_region(lat, lng)

            if not region_info:
                return web.json_response(
                    {"error": "No Auchan stores found near these coordinates"},
                    status=404,
                )

            return web.json_response(
                {
                    "region_id": region_info["region_id"],
                    "seller_id": region_info["seller_id"],
                    "store_name": region_info["store_name"],
                    "all_sellers": region_info["all_sellers"],
                    "latitude": lat,
                    "longitude": lng,
                }
            )
        except Exception as exc:  # noqa: BLE001
            return _server_error("Region resolution", exc)
