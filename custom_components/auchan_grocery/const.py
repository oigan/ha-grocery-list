"""Constants for the Auchan Grocery List integration."""

from datetime import timedelta

DOMAIN = "auchan_grocery"
NAME = "Auchan Grocery"
VERSION = "0.4.0"

# ── VTEX / Auchan endpoints ───────────────────────────────────────────────────
AUCHAN_BASE_URL = "https://www.auchan.ro"
VTEX_REGIONS_ENDPOINT = "/api/checkout/pub/regions"
VTEX_ORDERFORM_NEW_ENDPOINT = (
    "/api/checkout/pub/orderForm"  # GET → creates new orderForm
)
VTEX_ORDERFORM_ENDPOINT = "/api/checkout/pub/orderForm/{order_form_id}"
VTEX_ORDERFORM_ITEMS_ENDPOINT = "/api/checkout/pub/orderForm/{order_form_id}/items"
VTEX_ORDERFORM_REMOVE_ALL_ENDPOINT = (
    "/api/checkout/pub/orderForm/{order_form_id}/items/removeAll"
)
VTEX_ORDERFORM_UPDATE_ITEMS_ENDPOINT = (
    "/api/checkout/pub/orderForm/{order_form_id}/items/update"
)
VTEX_ORDERFORM_SHIPPING_ENDPOINT = (
    "/api/checkout/pub/orderForm/{order_form_id}/attachments/shippingData"
)
VTEX_SIMULATION_ENDPOINT = "/api/checkout/pub/orderForm/simulation"
VTEX_PICKUP_POINTS_ENDPOINT = "/api/checkout/pub/pickup-points"
VTEX_REGIONS_V2_ENDPOINT = "/api/checkout/pub/regions/{region_id}"
VTEX_INTELLIGENT_SEARCH_REST_ENDPOINT = (
    "/api/io/_v/api/intelligent-search/product_search"
)
VTEX_PRODUCT_SEARCH_ENDPOINT = "/api/catalog_system/pub/products/search/{term}"

# Auchan Recipes
AUCHAN_RECIPES_URL = (
    "https://www.auchan.ro/inspiratie-si-savoare/retete-cu-razvan-exarhu"
)

# ── Default values ────────────────────────────────────────────────────────────
# Default fallback store: Auchan Titan, București
DEFAULT_STORE_NAME = "Auchan Titan"
DEFAULT_LONGITUDE = 26.1776484
DEFAULT_LATITUDE = 44.4195197
DEFAULT_COUNTRY = "ROU"
DEFAULT_SALES_CHANNEL = "1"

# ── Geo providers ─────────────────────────────────────────────────────────────
NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"
NOMINATIM_SEARCH_ENDPOINT = "/search"
NOMINATIM_REVERSE_ENDPOINT = "/reverse"
NOMINATIM_USER_AGENT = "ha-auchan-grocery/0.4.0"

PHOTON_BASE_URL = "https://photon.komoot.io"
PHOTON_SEARCH_ENDPOINT = "/api"
PHOTON_REVERSE_ENDPOINT = "/reverse"

# România bounding box — validare coordonate
RO_LAT_MIN = 43.6
RO_LAT_MAX = 48.3
RO_LNG_MIN = 20.2
RO_LNG_MAX = 30.0

# ── Polling & limits ──────────────────────────────────────────────────────────
DEFAULT_SCAN_INTERVAL = timedelta(minutes=30)
MIN_SCAN_INTERVAL_MINUTES = 30
SCAN_INTERVAL_OPTIONS = [30, 60, 360, 720]  # minute

MAX_LISTS = 50
MAX_ITEMS_PER_LIST = 100
MAX_SIMILAR_PRODUCTS = 5
MAX_SEARCH_RESULTS = 20
MAX_SAVED_ADDRESSES = 10
PICKUP_SEARCH_RADIUS_KM = 50

# orderForm expiră după 7 zile inactivitate (VTEX default)
ORDER_FORM_TTL_DAYS = 7

# ── Notification thresholds ───────────────────────────────────────────────────
DEFAULT_PRICE_DROP_THRESHOLD_PCT = 5  # %
PRICE_DROP_NOTIFICATION_TAG = "auchan_price_drop_{sku_id}"
BACK_IN_STOCK_NOTIFICATION_TAG = "auchan_back_in_stock_{sku_id}"
OUT_OF_STOCK_NOTIFICATION_TAG = "auchan_out_of_stock_{sku_id}"

# ── HA Events ─────────────────────────────────────────────────────────────────
EVENT_PRICE_DROP = f"{DOMAIN}_price_drop"
EVENT_BACK_IN_STOCK = f"{DOMAIN}_back_in_stock"
EVENT_OUT_OF_STOCK = f"{DOMAIN}_out_of_stock"
EVENT_RECIPE_IMPORTED = f"{DOMAIN}_recipe_imported"

# ── Config entry keys ─────────────────────────────────────────────────────────
CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"
CONF_EMAIL = "email"
CONF_SCAN_INTERVAL_MINUTES = "scan_interval_minutes"
CONF_PRICE_DROP_THRESHOLD = "price_drop_threshold_pct"
CONF_REGION_ID = "region_id"
CONF_CHEF_BRIDGE_URL = "chef_bridge_url"
CONF_CHEF_BRIDGE_TOKEN = "chef_bridge_token"
DEFAULT_CHEF_BRIDGE_URL = "http://auchan-chef-bridge:8787"
CHEF_BRIDGE_TOKEN_FILE = ".storage/auchan_grocery_chef_token"

# ── Availability states ───────────────────────────────────────────────────────
AVAILABILITY_AVAILABLE = "available"
AVAILABILITY_OUT_OF_STOCK = "withoutStock"
AVAILABILITY_CANNOTBEHANDLED = "cannotBeHandled"

# ── HTTP client ───────────────────────────────────────────────────────────────
HTTP_TIMEOUT_SECONDS = 10
HTTP_MAX_RETRIES = 3
HTTP_RETRY_BACKOFF_BASE = 1  # secunde
HTTP_RETRY_STATUS_CODES = {429, 500, 502, 503, 504}

# ── Storage keys ──────────────────────────────────────────────────────────────
STORAGE_KEY = f"{DOMAIN}.grocery_lists"
STORAGE_VERSION = 1

# ── Frontend panel ────────────────────────────────────────────────────────────
PANEL_URL = "auchan-grocery"
PANEL_TITLE = "Auchan Grocery"
PANEL_ICON = "mdi:cart-outline"
PANEL_JS_FILENAME = "auchan-panel.js"
FRONTEND_STATIC_URL = f"/{DOMAIN}_static"
FRONTEND_SCRIPT_URL = f"{FRONTEND_STATIC_URL}/{PANEL_JS_FILENAME}?v={VERSION}"
