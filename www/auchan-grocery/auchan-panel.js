/**
 * Auchan Grocery List — Lovelace Panel
 * LitElement Web Component · Auchan-inspired retail design
 * v0.4.0 — Aligned with the Auchan storefront design system
 */

import { LitElement, html, css, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const DOMAIN = "auchan_grocery";
const API_BASE = "/api/auchan_grocery";
const DEBOUNCE_MS = 350;

// ── SVG Icons (Heroicons 24 outline) ─────────────────────────────────────────
const ICONS = {
  cart:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.925-7.125a60.914 60.914 0 0 0-18.786-1.002c-.355-.013-.704.015-1.05.04A3.75 3.75 0 0 0 3.636 8.25M7.5 14.25 5.106 5.272M7.5 14.25l-1.5 1.5M18 18.75a3 3 0 0 1-3-3m0 0a3 3 0 0 1-3-3m3 3h.008v.008H15v-.008Z"/></svg>`,
  search:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>`,
  map:      `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/></svg>`,
  recipes:  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.872c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5M3.75 13.121c.626-2.562 2.99-4.372 5.752-4.372h5c2.762 0 5.126 1.81 5.752 4.372m-3.752.13v4.5m-9.25-4.5v4.5M12 21v-4.5m-3.75 4.5h7.5"/></svg>`,
  dashboard:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>`,
  list:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>`,
  pin:      `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>`,
  plus:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>`,
  trash:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>`,
  star:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>`,
  starFill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd"/></svg>`,
  link:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>`,
  xmark:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>`,
  chevron:  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>`,
  alert:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>`,
  eye:      `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>`,
  eyeOff:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>`,
  clipboard:`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>`,
  arrowUp:  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"/></svg>`,
  wrench:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>`,
  home:        `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>`,
  refresh:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>`,
  clock:       `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>`,
  qr:          `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75V4.5Zm11.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1-.75-.75V4.5Zm-11.25 11.25A.75.75 0 0 1 4.5 15h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75v-3.75ZM15 15h2.25v2.25H15V15Zm3.75 0h1.5v5.25h-5.25v-1.5h3.75V15Z"/></svg>`,
};

function icon(name, size = 20) {
  return html`<span class="icon" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${unsafeHTML(ICONS[name] || "")}</span>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

function fmtPrice(val) {
  if (!val || val === 0) return "—";
  return Number(val).toFixed(2) + " RON";
}

function availabilityInfo(avail) {
  const map = {
    available:                    { color: "var(--action)",     label: "În stoc" },
    withoutStock:                 { color: "var(--brand)",      label: "Epuizat" },
    withoutPriceFulfillment:      { color: "var(--brand)",      label: "Indisponibil" },
    withoutSearchSelection:       { color: "var(--amber-deep)", label: "Indisponibil în zonă" },
    cannotBeHandled:              { color: "var(--amber-deep)", label: "Indisponibil în zonă" },
  };
  return map[avail] || { color: "var(--text-3)", label: avail || "Necunoscut" };
}

// Dark palette — the same navy family as light, inverted. Shared by the
// Home Assistant-driven selector and the OS-preference fallback.
const DARK_PALETTE = css`
  --bg:        #071726;
  --surface:   #0E2338;
  --surface-2: rgba(214, 225, 236, 0.07);
  --surface-3: rgba(214, 225, 236, 0.14);
  --text:      #F2F7FB;
  --text-2:    #A9C0D4;
  --text-3:    #7E9AB2;
  --text-mute: #7E9AB2;
  --sep:       rgba(214, 225, 236, 0.16);
  --sep-strong:rgba(214, 225, 236, 0.26);
  --brand-tint:  rgba(237, 0, 46, 0.20);
  --red-tint:    rgba(237, 0, 46, 0.20);
  --action-tint: rgba(0, 172, 108, 0.16);
  --green-tint:  rgba(0, 172, 108, 0.16);
  --blue-tint:   rgba(63, 169, 245, 0.16);
  --amber-deep:  var(--amber);
  --sh-md: 0 4px 16px rgba(0, 0, 0, .45);
  --sh-lg: 0 16px 40px rgba(0, 0, 0, .60);
  --card-border: 1px solid rgba(214, 225, 236, 0.12);
`;

const QRCODE_JS = "/auchan_grocery_static/vendor/qrcode.min.js";

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── API Client ────────────────────────────────────────────────────────────────
class AuchanAPI {
  constructor(hass) { this._hass = hass; }

  async _request(method, path, body) {
    const apiPath = path.replace(/^\/api\//, "");
    return this._hass.callApi(method, apiPath, body);
  }

  async callService(service, data = {}) {
    return this._hass.callService(DOMAIN, service, data);
  }

  async getLists() {
    return this._request("GET", `${API_BASE}/lists`);
  }

  async search(query, listId) {
    return this._request("GET", `${API_BASE}/search?q=${encodeURIComponent(query)}&list_id=${encodeURIComponent(listId || '')}`);
  }

  async getPickupPoints(lat, lng) {
    return this._request("GET", `${API_BASE}/pickup?lat=${lat}&lng=${lng}`);
  }

  async getRecipes() {
    return this._request("GET", `${API_BASE}/recipes`);
  }

  async getChefStatus() {
    return this._request("GET", `${API_BASE}/chef/status`);
  }

  async startChefLogin() {
    return this._request("POST", `${API_BASE}/chef/login`, {});
  }

  async getChefLoginStatus(loginId) {
    return this._request("GET", `${API_BASE}/chef/login/${encodeURIComponent(loginId)}`);
  }

  async logoutChef() {
    return this._request("POST", `${API_BASE}/chef/logout`, {});
  }

  async getChefPreferences() {
    return this._request("GET", `${API_BASE}/chef/preferences`);
  }

  async saveChefPreferences(preferences) {
    return this._request("PUT", `${API_BASE}/chef/preferences`, preferences);
  }

  async createChefPlan(prompt, threadId = null) {
    return this._request("POST", `${API_BASE}/chef/plan`, {
      prompt,
      thread_id: threadId || undefined,
    });
  }

  async importChefProducts(payload) {
    return this._request("POST", `${API_BASE}/chef/import`, payload);
  }

  async getAddresses() {
    return this._request("GET", `${API_BASE}/addresses`);
  }

  async addAddress(label, displayName, latitude, longitude, postalCode = '') {
    return this._request("POST", `${API_BASE}/addresses`, {
      label, display_name: displayName, latitude, longitude,
      postal_code: postalCode, set_active: true,
    });
  }

  async deleteAddress(addressId) {
    await this._request("DELETE", `${API_BASE}/addresses/${encodeURIComponent(addressId)}`);
    return true;
  }

  async activateAddress(addressId) {
    return this._request("POST", `${API_BASE}/addresses/${encodeURIComponent(addressId)}/activate`, {});
  }

  async geocode(query) {
    return this._request("GET", `${API_BASE}/geocode?q=${encodeURIComponent(query)}`);
  }

  async getRegionInfo(force = false) {
    return this._request("GET", `${API_BASE}/region${force ? '?force=1' : ''}`);
  }

  async resolveRegion(lat, lng) {
    return this._request("GET", `${API_BASE}/region_resolve?lat=${lat}&lng=${lng}`);
  }

  // Generic helpers for recipe detail + import
  async getJson(path) {
    return this._request("GET", path);
  }

  async postJson(path, body) {
    return this._request("POST", path, body);
  }
}

// ── Dialog State Manager (replaces confirm/prompt) ────────────────────────────
class DialogManager {
  constructor(panel) { this._panel = panel; this._resolve = null; }

  async confirm(message, destructive = false) {
    return new Promise(resolve => {
      this._resolve = resolve;
      this._panel._dialog = { type: 'confirm', message, destructive };
    });
  }

  async prompt(message, placeholder = '') {
    return new Promise(resolve => {
      this._resolve = resolve;
      this._panel._dialog = { type: 'prompt', message, placeholder, value: '' };
    });
  }

  respond(value) {
    if (this._resolve) {
      this._resolve(value);
      this._resolve = null;
      this._panel._dialog = null;
    }
  }
}

// ── Main Panel ────────────────────────────────────────────────────────────────
class AuchanGroceryPanel extends LitElement {
  static properties = {
    hass: { type: Object },
    narrow: { type: Boolean },
    panel: { type: Object },
    _lists: { type: Array, state: true },
    _activeListId: { type: String, state: true },
    _searchQuery: { type: String, state: true },
    _searchResults: { type: Array, state: true },
    _pickupPoints: { type: Array, state: true },
    _addresses: { type: Array, state: true },
    _loading: { type: Boolean, state: true },
    _searchLoading: { type: Boolean, state: true },
    _showQr: { type: Boolean, state: true },
    _qrUrl: { type: String, state: true },
    _tab: { type: String, state: true },
    _notification: { type: Object, state: true },
    _recipes: { type: Array, state: true },
    _recipesLoading: { type: Boolean, state: true },
    _showAddressModal: { type: Boolean, state: true },
    _showAddressSheet: { type: Boolean, state: true },
    _addrQuery: { type: String, state: true },
    _addrSuggestions: { type: Array, state: true },
    _addrLabel: { type: String, state: true },
    _addrSelected: { type: Object, state: true },
    _addrLoading: { type: Boolean, state: true },
    _regionInfo: { type: Object, state: true },
    _showDiagnostics: { type: Boolean, state: true },
    _dialog: { type: Object, state: true },
    _dialogValue: { type: String, state: true },
    _sortBy: { type: String, state: true },
    _filterCategory: { type: String, state: true },
    _isMobile: { type: Boolean, state: true },
    _pickupPointsLoading: { type: Boolean, state: true },
    _busyActions: { type: Object, state: true },
    _recipeModalData: { type: Object, state: true },
    _recipeImportListId: { type: String, state: true },
    _chefStatus: { type: Object, state: true },
    _chefStatusLoading: { type: Boolean, state: true },
    _chefLogin: { type: Object, state: true },
    _chefPrompt: { type: String, state: true },
    _chefPlan: { type: Object, state: true },
    _chefThreadId: { type: String, state: true },
    _chefSelected: { type: Object, state: true },
    _chefPreferences: { type: Object, state: true },
    _chefSettingsOpen: { type: Boolean, state: true },
    _chefGenerating: { type: Boolean, state: true },
    _chefImporting: { type: Boolean, state: true },
    _chefTargetListId: { type: String, state: true },
  };

  constructor() {
    super();
    this._lists = [];
    this._activeListId = null;
    this._searchQuery = "";
    this._searchResults = [];
    this._pickupPoints = [];
    this._addresses = [];
    this._loading = true;
    this._searchLoading = false;
    this._notification = null;
    this._showQr = false;
    this._qrUrl = "";
    this._tab = "dashboard";
    this._api = null;
    this._recipes = [];
    this._recipesLoading = false;
    this._showAddressModal = false;
    this._showAddressSheet = false;
    this._addrQuery = "";
    this._addrSuggestions = [];
    this._addrLabel = "Acasă";
    this._addrSelected = null;
    this._addrLoading = false;
    this._regionInfo = null;
    this._showDiagnostics = false;
    this._dialog = null;
    this._dialogValue = "";
    this._sortBy = "added"; // "added" | "price_asc" | "price_desc" | "name"
    this._filterCategory = "";
    this._isMobile = window.innerWidth < 768;
    this._searchDebounced = debounce(this._doSearch.bind(this), DEBOUNCE_MS);
    this._addrDebounced = debounce(this._doAddrSearch.bind(this), 400);
    this._dialogMgr = new DialogManager(this);
    this._pickupPointsLoading = false;
    this._busyActions = {};
    this._recipeModalData = null;
    this._recipeImportListId = null;
    this._chefStatus = null;
    this._chefStatusLoading = false;
    this._chefLogin = null;
    this._chefPrompt = "";
    this._chefPlan = null;
    this._chefThreadId = "";
    this._chefSelected = {};
    this._chefPreferences = {
      household_size: 2,
      budget: "mediu",
      max_time_minutes: 45,
      dietary: [],
      dislikes: "",
      pantry: "",
      loyalty_card_alias: "",
    };
    this._chefSettingsOpen = false;
    this._chefGenerating = false;
    this._chefImporting = false;
    this._chefTargetListId = "";
    this._timers = new Set();
    this._mapChannel = crypto.randomUUID();
    this._resizeObserver = new ResizeObserver(e => {
      this._isMobile = e[0].contentRect.width < 768;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._resizeObserver.observe(this);
    this._onMapMessage = this._handleMapMessage.bind(this);
    window.addEventListener('message', this._onMapMessage);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver.disconnect();
    window.removeEventListener('message', this._onMapMessage);
    this._searchDebounced.cancel();
    this._addrDebounced.cancel();
    this._timers.forEach(timer => clearTimeout(timer));
    this._timers.clear();
  }

  _schedule(callback, delay) {
    const timer = setTimeout(() => {
      this._timers.delete(timer);
      callback();
    }, delay);
    this._timers.add(timer);
    return timer;
  }

  async _runAction(key, action, successMessage = "") {
    if (this._busyActions[key]) return null;
    this._busyActions = { ...this._busyActions, [key]: true };
    try {
      const result = await action();
      if (successMessage) this._showToast(successMessage, "success");
      return result;
    } catch (error) {
      console.error(`[AuchanPanel] ${key} failed`, error);
      this._showToast("Acțiunea nu a putut fi finalizată. Încearcă din nou.", "error");
      return null;
    } finally {
      const { [key]: _finished, ...remaining } = this._busyActions;
      this._busyActions = remaining;
    }
  }

  async _handleMapMessage(e) {
    const iframe = this.shadowRoot?.querySelector('#leaflet-iframe');
    if (e.source !== iframe?.contentWindow || e.data?.channel !== this._mapChannel) return;
    const { type, lat, lng, name } = e.data || {};
    const safeLat = Number(lat);
    const safeLng = Number(lng);
    if (!type || !Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return;
    if (safeLat < 43.5 || safeLat > 48.3 || safeLng < 20.0 || safeLng > 30.0) return;

    if (type === 'map_click') {
      // Explore mode: discover stores near click point
      const regionData = await this._runAction(
        "map-region",
        () => this._api?.resolveRegion(safeLat, safeLng),
      );
      if (!regionData || !regionData.all_sellers?.length) {
        this._showToast('Niciun magazin Auchan găsit în această zonă', 'warning');
        return;
      }
      // Build store list for iframe (all sellers in region)
      const stores = regionData.all_sellers.map(s => ({
        lat: safeLat, lng: safeLng,
        name: s.name || s.id,
        desc: s.id,
      }));
      iframe?.contentWindow?.postMessage(
        { type: 'explore_stores', stores, channel: this._mapChannel },
        "*",
      );
      this._showToast(`${stores.length} magazin(e) găsite în zonă`, 'success');
    }

    if (type === 'store_set_active') {
      // Set clicked store as active address (creates + activates)
      const existing = this._addresses.find(a =>
        Math.abs(a.latitude - safeLat) < 0.001 && Math.abs(a.longitude - safeLng) < 0.001
      );
      if (existing) {
        const activated = await this._runAction(
          `map-address:${existing.id}`,
          () => this._api?.activateAddress(existing.id),
        );
        if (!activated) return;
        await this._loadAddresses();
        this._showToast(`${name || 'Magazin'} setat ca adresă activă ✓`, 'success');
      } else {
        const label = name || 'Adresă magazin';
        const saved = await this._runAction(
          "map-address:new",
          () => this._api?.addAddress(label, name || "Magazin Auchan", safeLat, safeLng),
        );
        if (!saved) return;
        await this._loadAddresses();
        this._showToast(`${label} setat ca adresă activă ✓`, 'success');
      }
    }

    if (type === 'store_save_new') {
      // Save as new address with custom label
      const label = await this._dialogMgr.prompt(`Etichetă pentru ${name || 'magazin'}:`, name || 'Magazin Auchan');
      if (!label) return;
      const saved = await this._runAction(
        "map-address:save",
        () => this._api?.addAddress(label, name || "Magazin Auchan", safeLat, safeLng),
      );
      if (!saved) return;
      await this._loadAddresses();
      this._showToast(`"${label}" salvat ✓`, 'success');
    }
  }

  // The palette is fixed, but light/dark follows the Home Assistant theme.
  // hass.themes.darkMode is absent on older cores, in which case we drop the
  // marker attribute and let the prefers-color-scheme fallback take over.
  _syncTheme() {
    const dark = this.hass?.themes?.darkMode;
    if (typeof dark === "boolean") {
      this.toggleAttribute("theme-known", true);
      this.toggleAttribute("dark", dark);
    } else {
      this.removeAttribute("theme-known");
      this.removeAttribute("dark");
    }
  }

  updated(changed) {
    let justInit = false;
    if (changed.has("hass")) this._syncTheme();
    if (changed.has("hass") && this.hass) {
      if (!this._api) {
        this._api = new AuchanAPI(this.hass);
        justInit = true;
      } else {
        this._api._hass = this.hass;
      }
      if (justInit) {
        this._loadData();
        this._loadAddresses();
        this._loadPickupPoints(); // Load stores immediately so Dashboard stat card shows count
      }
    }
    if (changed.has("_tab")) {
      if (this._tab === "map" && this._pickupPoints.length === 0) this._loadPickupPoints();
      if (this._tab === "recipes" && !this._chefStatus) this._loadChef();
    }
  }

  // ── Data loading ─────────────────────────────────────────────────────────────
  async _loadData() {
    this._loading = true;
    try {
      const data = await this._api?.getLists() || [];
      this._lists = data;
      if (!data.some(list => list.id === this._activeListId)) {
        this._activeListId = data.find(list => list.is_active)?.id || data[0]?.id || null;
      }
    } catch (e) {
      console.error("[AuchanPanel] loadData:", e);
      this._showToast("Listele nu au putut fi încărcate.", "error");
    }
    this._loading = false;
  }

  async _loadAddresses() {
    if (!this._api) return;
    try {
      this._addresses = await this._api.getAddresses();
    } catch (error) {
      console.error("[AuchanPanel] addresses failed", error);
      this._showToast("Adresele nu au putut fi încărcate.", "error");
    }
  }

  async _loadPickupPoints() {
    if (!this._api) return;
    this._pickupPointsLoading = true;
    // Use active address coords if available; fall back to HA home config
    const activeAddr = this._addresses?.find(a => a.is_active);
    const lat = activeAddr?.latitude || this.hass?.config?.latitude || 44.4195;
    const lng = activeAddr?.longitude || this.hass?.config?.longitude || 26.1776;
    try {
      this._pickupPoints = await this._api.getPickupPoints(lat, lng);
    } catch (error) {
      console.error("[AuchanPanel] pickup points failed", error);
      this._showToast("Magazinele nu au putut fi încărcate.", "error");
    }
    this._pickupPointsLoading = false;
  }

  async _loadRecipes() {
    if (!this._api) return;
    this._recipesLoading = true;
    try {
      this._recipes = await this._api.getRecipes();
    } catch (error) {
      console.error("[AuchanPanel] recipes failed", error);
      this._showToast("Rețetele nu au putut fi încărcate.", "error");
    }
    this._recipesLoading = false;
  }

  async _loadChef() {
    if (!this._api || this._chefStatusLoading) return;
    this._chefStatusLoading = true;
    const [statusResult, preferencesResult] = await Promise.allSettled([
      this._api.getChefStatus(),
      this._api.getChefPreferences(),
    ]);
    if (statusResult.status === "fulfilled") {
      this._chefStatus = statusResult.value;
    } else {
      console.error("[AuchanPanel] chef status failed", statusResult.reason);
      this._chefStatus = {
        configured: true,
        connected: false,
        error: "Serviciul Chef AI nu răspunde. Verifică adresa bridge-ului.",
      };
    }
    if (preferencesResult.status === "fulfilled") {
      this._chefPreferences = { ...this._chefPreferences, ...preferencesResult.value };
    }
    if (!this._chefTargetListId) this._chefTargetListId = this._activeListId || "new";
    this._chefStatusLoading = false;
  }

  async _loadLists() {
    await this._loadData();
  }

  // ── Search ───────────────────────────────────────────────────────────────────
  _onSearchInput(e) {
    this._searchQuery = e.target.value;
    if (this._searchQuery.length >= 2) {
      this._searchDebounced();
    } else {
      this._searchResults = [];
    }
  }

  async _doSearch() {
    if (!this._api || !this._searchQuery || this._searchQuery.length < 2) return;
    this._searchLoading = true;
    try {
      this._searchResults = await this._api.search(this._searchQuery, this._activeListId);
    } catch (error) {
      console.error("[AuchanPanel] search failed", error);
      this._searchResults = [];
      this._showToast("Căutarea nu este disponibilă momentan.", "error");
    }
    this._searchLoading = false;
  }

  _clearSearch() {
    this._searchQuery = "";
    this._searchResults = [];
    const input = this.shadowRoot?.querySelector("#search-input");
    if (input) input.value = "";
  }

  // ── Addresses ─────────────────────────────────────────────────────────────────
  _openAddressModal() {
    // Mobile: show bottom sheet for selecting/switching address
    // Desktop: show modal for adding new address (sidebar already shows list)
    if (this._isMobile) {
      this._showAddressSheet = true;
      return;
    }
    this._showAddressModal = true;
    this._addrQuery = "";
    this._addrSuggestions = [];
    this._addrSelected = null;
    this._addrLabel = "Acasă";
  }

  _openAddAddressModal() {
    this._showAddressSheet = false;
    this._showAddressModal = true;
    this._addrQuery = "";
    this._addrSuggestions = [];
    this._addrSelected = null;
    this._addrLabel = "Acasă";
  }

  _closeAddressModal() { this._showAddressModal = false; }

  _onAddrInput(e) {
    this._addrQuery = e.target.value;
    this._addrSelected = null;
    if (this._addrQuery.length >= 3) this._addrDebounced();
    else this._addrSuggestions = [];
  }

  async _doAddrSearch() {
    if (!this._api || this._addrQuery.length < 3) return;
    this._addrLoading = true;
    this._addrSuggestions = await this._api.geocode(this._addrQuery).catch(() => []);
    this._addrLoading = false;
  }

  _selectAddrSuggestion(s) {
    this._addrSelected = s;
    this._addrQuery = s.display_name;
    this._addrSuggestions = [];
  }

  async _saveAddress() {
    if (!this._addrSelected || !this._api) return;
    this._addrLoading = true;
    let addr = null;
    try {
      addr = await this._api.addAddress(
        this._addrLabel,
        this._addrSelected.display_name,
        this._addrSelected.latitude,
        this._addrSelected.longitude,
        this._addrSelected.postal_code || "",
      );
    } catch (error) {
      console.error("[AuchanPanel] address save failed", error);
    } finally {
      this._addrLoading = false;
    }
    if (addr) {
      this._showToast(`Adresă "${this._addrLabel}" salvată!`, "success");
      await this._loadAddresses();
      this._closeAddressModal();
    } else {
      this._showToast("Eroare la salvarea adresei", "error");
    }
  }

  async _activateAddress(addressId) {
    if (!this._api) return;

    const activated = await this._runAction(
      `address:${addressId}`,
      () => this._api.activateAddress(addressId),
    );
    if (!activated) return;

    // Immediately update all dependent state
    await this._loadAddresses();
    await this._loadLists();
    this._pickupPoints = [];

    // Re-fetch regionInfo so diagnostics panel shows correct region for new address
    // This also persists the region_id into the address if not already cached
    this._regionInfo = await this._api.getRegionInfo(true).catch(() => null);

    this._showToast("Adresă activată! Se actualizează stocurile...", "info");

    // Second reload after VTEX simulation completes on backend (~7s)
    this._schedule(async () => {
      await this._loadLists();
      this._showToast("Stocuri actualizate pentru adresa selectată ✓", "success");
    }, 7000);
  }

  async _deleteAddress(addressId, label) {
    const confirmed = await this._dialogMgr.confirm(`Ștergi adresa "${label}"?`, true);
    if (!confirmed) return;
    const deleted = await this._runAction(
      `delete-address:${addressId}`,
      () => this._api?.deleteAddress(addressId),
    );
    if (!deleted) return;
    await this._loadAddresses();
    this._showToast("Adresă ștearsă", "info");
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  async _addSearchResult(product) {
    if (!this._activeListId || !this._api) return;
    const result = await this._runAction(`add:${product.sku_id}`, () => this._api.callService("add_item", {
      list_id: this._activeListId,
      sku_id: product.sku_id,
      product_id: product.product_id,
      name: product.name,
      brand: product.brand || "",
      quantity: 1,
      price: product.price || 0,
      list_price: product.list_price || 0,
      image_url: product.image_url || "",
      category: product.category || "",
      url: product.url || "",
      description: product.description || "",
      seller_id: product.seller_id || "1",
    }), `"${product.name}" adăugat în listă!`);
    if (result === null) return;
    this._clearSearch();
    await this._loadData();
  }

  async _toggleCart(listId, skuId) {
    const result = await this._runAction(`cart:${listId}:${skuId}`, () =>
      this._api?.callService("toggle_in_cart", { list_id: listId, sku_id: skuId }));
    if (result === null) return;
    await this._loadData();
  }

  async _toggleWatch(listId, skuId) {
    const result = await this._runAction(`watch:${listId}:${skuId}`, () =>
      this._api?.callService("toggle_watch", { list_id: listId, sku_id: skuId }));
    if (result === null) return;
    await this._loadData();
  }

  async _removeItem(listId, skuId, name) {
    const confirmed = await this._dialogMgr.confirm(`Elimini "${name}" din listă?`, true);
    if (!confirmed) return;
    const result = await this._runAction(`remove:${listId}:${skuId}`, () =>
      this._api?.callService("remove_item", { list_id: listId, sku_id: skuId }));
    if (result === null) return;
    await this._loadData();
  }

  async _updateQty(listId, skuId, delta, currentQty) {
    const newQty = Math.max(0, currentQty + delta);
    const result = await this._runAction(`quantity:${listId}:${skuId}`, () =>
      this._api?.callService("set_item_quantity", { list_id: listId, sku_id: skuId, quantity: newQty }));
    if (result === null) return;
    if (newQty === 0) this._showToast("Produs eliminat din listă", "info");
    await this._loadData();
  }

  async _createList() {
    const name = await this._dialogMgr.prompt("Nume listă nouă:", "ex: Cumpărături Săptămână");
    if (name === null) return;
    const listName = (name || "").trim() || "Lista " + new Date().toLocaleDateString('ro-RO');
    const result = await this._runAction("create-list", () =>
      this._api?.callService("create_list", { name: listName }), `Lista "${listName}" creată!`);
    if (result === null) return;
    await this._loadData();
  }

  async _generateCartLink() {
    const list = this._activeList;
    if (!list) return;
    const items = (list.items || []).filter(i => i.in_cart !== false);
    if (items.length === 0) {
      this._showToast("Bifează cel puțin un produs pentru coș.", "warning");
      return;
    }
    const params = new URLSearchParams();
    for (const item of items) {
      params.append("sku", item.sku_id);
      params.append("qty", String(item.quantity || 1));
      params.append("seller", item.seller_id || "1");
    }
    params.set("sc", "1");
    const url = `https://www.auchan.ro/checkout/cart/add?${params.toString()}`;
    this._qrUrl = url;
    this._showQr = true;
    await this._renderQr(url);
  }

  async _renderQr(url) {
    await loadScript(QRCODE_JS);
    await this.updateComplete;
    const container = this.shadowRoot?.querySelector("#qr-container");
    if (!container) return;
    container.innerHTML = "";
    try {
      new window.QRCode(container, {
        text: url, width: 200, height: 200,
        colorDark: "#000000", colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    } catch (e) { container.textContent = url; }
  }

  async _addRecipeIngredients(recipe) {
    if (!this._activeListId || !recipe.ingredients?.length) return;
    let added = 0;
    let failed = 0;
    for (const ing of recipe.ingredients) {
      if (!ing.name) continue;
      try {
        await this._api.callService("search_and_add", {
          list_id: this._activeListId,
          query: ing.name,
          quantity: 1,
          auto_add_first: true,
        });
        added++;
      } catch (error) {
        failed++;
        console.error("[AuchanPanel] ingredient import failed", error);
      }
      if (added + failed >= 10) break;
    }
    this._showToast(
      failed
        ? `${added} ingrediente adăugate, ${failed} nu au putut fi adăugate.`
        : `${added} ingrediente din "${recipe.title}" adăugate!`,
      failed ? "warning" : "success",
    );
    await this._loadData();
  }

  async _selectPickupStore(p) {
    if (!this._api) return;
    const label = `Magazin ${p.name}`;
    const displayName = [p.address, p.city].filter(Boolean).join(" · ");
    const saved = await this._runAction(
      `pickup-address:${p.id || p.name}`,
      () => this._api.addAddress(label, displayName, p.latitude, p.longitude, p.postal_code || ""),
    );
    if (!saved) return;
    await this._loadAddresses();
    this._showToast(`Setat ca locație: ${p.name}`, "success");
    this._tab = "list";
  }

  _flyToStore(store) {
    if (!store.latitude || !store.longitude) return;
    const iframe = this.shadowRoot?.querySelector('#leaflet-iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: 'fly', lat: store.latitude, lng: store.longitude, channel: this._mapChannel },
        "*",
      );
    }
  }

  // ── Toast ─────────────────────────────────────────────────────────────────────
  _showToast(message, type = "info") {
    this._notification = { message, type };
    this._schedule(() => { this._notification = null; }, 3500);
  }

  async _selectList(listId) {
    if (!listId || listId === this._activeListId) return;
    const previous = this._activeListId;
    this._activeListId = listId;
    this._filterCategory = "";
    const result = await this._runAction("select-list", () =>
      this._api?.callService("set_active_list", { list_id: listId }));
    if (result === null) this._activeListId = previous;
  }

  // ── Dialog ───────────────────────────────────────────────────────────────────
  _renderDialog() {
    if (!this._dialog) return nothing;
    const d = this._dialog;
    return html`
      <div class="dialog-overlay" @click=${() => this._dialogMgr.respond(null)}>
        <div class="dialog-sheet" @click=${e => e.stopPropagation()}>
          <p class="dialog-message">${d.message}</p>
          ${d.type === 'prompt' ? html`
            <input class="dialog-input" type="text"
              placeholder=${d.placeholder || ""}
              .value=${this._dialogValue}
              @input=${e => this._dialogValue = e.target.value}
              @keydown=${e => e.key === 'Enter' && this._dialogMgr.respond(this._dialogValue)}
              autofocus />
          ` : nothing}
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn--cancel" @click=${() => { this._dialogValue = ""; this._dialogMgr.respond(null); }}>
              Anulează
            </button>
            <button class="dialog-btn ${d.destructive ? 'dialog-btn--danger' : 'dialog-btn--confirm'}"
              @click=${() => {
                const val = d.type === 'prompt' ? (this._dialogValue || "") : true;
                this._dialogValue = "";
                this._dialogMgr.respond(val);
              }}>
              ${d.type === 'prompt' ? 'Salvează' : (d.destructive ? 'Șterge' : 'OK')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Computed ─────────────────────────────────────────────────────────────────
  get _activeList() {
    const lists = this._lists || [];
    return lists.find(l => l.id === this._activeListId) || lists[0] || null;
  }

  get _activeItems() {
    let items = [...(this._activeList?.items || [])];
    if (this._filterCategory) items = items.filter(i => i.category === this._filterCategory);
    switch (this._sortBy) {
      case "price_asc": return items.sort((a, b) => (a.current_price || 0) - (b.current_price || 0));
      case "price_desc": return items.sort((a, b) => (b.current_price || 0) - (a.current_price || 0));
      case "name": return items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      default: return items;
    }
  }

  get _categories() {
    const cats = new Set((this._activeList?.items || []).map(i => i.category).filter(Boolean));
    return [...cats];
  }

  get _cartTotal() {
    return (this._activeList?.items || [])
      .filter(i => i.in_cart !== false)
      .reduce((sum, i) => sum + (i.current_price || i.price_when_added || 0) * (i.quantity || 1), 0);
  }

  get _cartSavings() {
    return (this._activeList?.items || [])
      .filter(i => i.in_cart !== false && i.list_price > i.current_price)
      .reduce((sum, i) => sum + (i.list_price - i.current_price) * (i.quantity || 1), 0);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  render() {
    const isDesktop = !this._isMobile;
    return html`
      ${this._renderToast()}
      ${this._renderDialog()}
      <div class="panel-root ${isDesktop ? 'panel-root--desktop' : ''}">
        ${this._renderHeader()}
        <div class="search-wrap">
          ${this._renderSearch()}
          ${this._renderSearchResults()}
        </div>
        ${isDesktop ? html`
          <div class="desktop-layout">
            <aside class="sidebar">${this._renderSidebar()}</aside>
            <main class="main-content">
              ${this._renderTabs()}
              <div class="tab-content">${this._renderActiveTab()}</div>
              ${this._renderActionBar()}
            </main>
          </div>
        ` : html`
          <div class="tab-content">${this._renderActiveTab()}</div>
          ${this._renderActionBar()}
          ${this._renderMobileBottomNav()}
        `}
        ${this._showQr ? this._renderQrModal() : nothing}
        ${this._showAddressModal ? this._renderAddressModal() : nothing}
        ${this._showAddressSheet ? this._renderAddressSheet() : nothing}
      </div>
    `;
  }

  _renderActiveTab() {
    switch (this._tab) {
      case "dashboard": return this._renderDashboardView();
      case "list":      return this._renderListView();
      case "map":       return this._renderMapView();
      case "recipes":   return this._renderRecipesView();
    }
  }

  // ── Toast ────────────────────────────────────────────────────────────────────
  _renderToast() {
    if (!this._notification) return nothing;
    const { message, type } = this._notification;
    return html`<div class="toast toast--${type}" role="alert">${message}</div>`;
  }
  _renderHeader() {
    const addresses = this._addresses || [];
    const lists = this._lists || [];
    const activeAddr = addresses.find(a => a.is_active);
    const addrLabel = activeAddr?.label || 'Fără adresă';
    const activeList = this._activeList;

    return html`
      <header class="panel-header" role="banner">
        <!-- HA Home / Back button -->
        <button class="hdr-home-btn"
          @click=${() => {
            // Navigate back to HA default dashboard
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = '/';
            }
          }}
          title="Înapoi la tabloul de bord HA"
          aria-label="Înapoi la tabloul de bord Home Assistant">
          ${icon('home', 18)}
        </button>

        <!-- Brand -->
        <div class="header-brand" aria-label="Auchan Grocery">
          <div class="brand-icon">${icon('cart', 16)}</div>
          <span class="brand-name">Auchan <small>Grocery</small></span>
        </div>

        <!-- Address pill -->
        <button class="header-pill" @click=${this._openAddressModal}
          title="Gestionează adrese"
          aria-label="Adresă activă: ${addrLabel}">
          ${icon('pin', 13)}
          <span class="pill-label">${addrLabel}</span>
          ${icon('chevron', 10)}
        </button>

        <!-- List selector -->
        <div class="header-list-wrap">
          ${icon('list', 13)}
          <select class="header-select"
            @change=${e => this._selectList(e.target.value)}
            aria-label="Listă activă">
            ${lists.map(l => html`
              <option value=${l.id} ?selected=${l.id === this._activeListId}>${l.name || l.id}</option>
            `)}
          </select>
        </div>

        <!-- Right actions -->
        <div class="header-actions">
          <button class="hdr-btn" @click=${this._createList}
            title="Listă nouă" aria-label="Crează listă nouă">
            ${icon('plus', 16)}
          </button>
          <button class="hdr-btn hdr-btn--diag ${this._showDiagnostics ? 'hdr-btn--active' : ''}"
            @click=${() => {
              this._showDiagnostics = !this._showDiagnostics;
              if (this._showDiagnostics && !this._regionInfo)
                this._api?.getRegionInfo().then(r => this._regionInfo = r);
            }}
            title="Diagnostice" aria-label="Diagnostice">
            ${icon('wrench', 15)}
          </button>
        </div>
      </header>
      ${this._showDiagnostics ? this._renderDiagnostics() : nothing}
    `;
  }


  // ── Diagnostics ──────────────────────────────────────────────────────────────
  _renderDiagnostics() {
    const ri = this._regionInfo;
    // Live data from _addresses is always fresher than cached _regionInfo
    const activeAddr = this._addresses?.find(a => a.is_active);
    const liveRegionId = activeAddr?.region_id || ri?.region_id;

    return html`
      <div class="diagnostics">
        <div class="diag-row">
          <span class="diag-label">Region ID</span>
          <code class="diag-val ${liveRegionId ? '' : 'diag-val--missing'}">
            ${liveRegionId || '❌ lipsă — apasă ↺ Refresh'}
          </code>
        </div>
        <div class="diag-row">
          <span class="diag-label">Adresă activă</span>
          <code class="diag-val">${activeAddr?.display_name || ri?.address?.display_name || '—'}</code>
        </div>
        <div class="diag-row">
          <span class="diag-label">Seller</span>
          <code class="diag-val">${activeAddr?.seller_id || '—'}</code>
        </div>
        <button class="diag-refresh-btn" @click=${async () => {
          this._regionInfo = await this._api?.getRegionInfo(true).catch(() => null);
          await this._loadAddresses();
        }}>
          ↺ Refresh Region
        </button>
      </div>
    `;
  }

  // ── Search ────────────────────────────────────────────────────────────────────
  _renderSearch() {
    return html`
      <div class="search-bar" role="search">
        <span class="search-icon">${icon('search', 18)}</span>
        <input
          id="search-input"
          class="search-input"
          type="search"
          placeholder="Caută produse Auchan..."
          .value=${this._searchQuery}
          @input=${this._onSearchInput}
          @keydown=${e => e.key === 'Escape' && this._clearSearch()}
          autocomplete="off"
          aria-label="Caută produse"
        />
        ${this._searchLoading ? html`<div class="spinner" aria-label="Se caută..."></div>` : nothing}
        ${this._searchQuery ? html`
          <button class="search-clear" @click=${this._clearSearch} aria-label="Șterge căutarea">
            ${icon('xmark', 16)}
          </button>
        ` : nothing}
      </div>
    `;
  }

  _renderSearchResults() {
    if (!this._searchResults?.length && !this._searchLoading) return nothing;
    if (this._searchLoading && !this._searchResults?.length) {
      return html`
        <div class="search-results">
          ${[1,2,3].map(() => html`<div class="search-skeleton"></div>`)}
        </div>
      `;
    }
    return html`
      <div class="search-results" role="list" aria-label="Rezultate căutare">
        ${this._searchResults.map(p => html`
          <div class="search-row" role="listitem">
            ${p.image_url ? html`
              <img class="search-thumb" src=${p.image_url} alt="" loading="lazy" referrerpolicy="no-referrer"
                   @error=${e => e.target.style.display = 'none'} />
            ` : html`<div class="search-thumb search-thumb--placeholder"></div>`}
            <div class="search-info">
              <span class="search-name">${p.name}</span>
              ${p.brand ? html`<span class="search-brand">${p.brand}</span>` : nothing}
            </div>
            <div class="search-price-col">
              <span class="search-price">${fmtPrice(p.price)}</span>
              ${p.discount_pct > 0 ? html`<span class="search-discount">-${p.discount_pct}%</span>` : nothing}
            </div>
            <button class="search-add-btn" aria-label="Adaugă ${p.name}"
              ?disabled=${Boolean(this._busyActions[`add:${p.sku_id}`])}
              @click=${() => this._addSearchResult(p)}>
              ${this._busyActions[`add:${p.sku_id}`] ? html`<div class="spinner spinner--sm"></div>` : icon('plus', 16)}
            </button>
          </div>
        `)}
      </div>
    `;
  }

  // ── Sidebar (desktop) ─────────────────────────────────────────────────────────
  _renderSidebar() {
    const lists = this._lists || [];
    const addresses = this._addresses || [];
    return html`
      <nav class="sidebar-nav" aria-label="Navigare">
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Liste</h3>
          ${lists.map(l => html`
            <button class="sidebar-item ${l.id === this._activeListId ? 'sidebar-item--active' : ''}"
              @click=${() => this._selectList(l.id)}>
              ${icon('list', 16)}
              <span>${l.name || l.id}</span>
              <span class="sidebar-count">${l.item_count ?? l.items?.length ?? 0}</span>
            </button>
          `)}
          <button class="sidebar-add-btn" @click=${this._createList}>
            ${icon('plus', 14)} Listă nouă
          </button>
        </div>
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Adrese</h3>
          ${addresses.map(a => html`
            <div class="sidebar-addr ${a.is_active ? 'sidebar-addr--active' : ''}">
              <button class="sidebar-addr-main" @click=${() => this._activateAddress(a.id)}>
                ${icon('pin', 14)}
                <span>${a.label}</span>
                ${a.is_active ? html`<span class="dot-active"></span>` : nothing}
              </button>
              <button class="sidebar-addr-del" @click=${() => this._deleteAddress(a.id, a.label)}
                aria-label="Șterge adresa ${a.label}">
                ${icon('trash', 14)}
              </button>
            </div>
          `)}
          <button class="sidebar-add-btn" @click=${this._openAddressModal}>
            ${icon('plus', 14)} Adresă nouă
          </button>
        </div>
      </nav>
    `;
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  _renderTabs() {
    const tabs = [
      { id: "dashboard", icon: "dashboard", label: "Tablou" },
      { id: "list",      icon: "list",      label: "Listă" },
      { id: "map",       icon: "map",       label: "Hartă" },
      { id: "recipes",   icon: "recipes",   label: "Chef AI" },
    ];
    return html`
      <nav class="tab-bar" role="tablist" aria-label="Secțiuni">
        ${tabs.map(t => html`
          <button
            class="tab ${this._tab === t.id ? 'tab--active' : ''}"
            role="tab"
            aria-selected=${this._tab === t.id}
            @click=${() => { this._tab = t.id; }}
            id="tab-${t.id}">
            ${icon(t.icon, 20)}
            <span class="tab-label">${t.label}</span>
          </button>
        `)}
      </nav>
    `;
  }

  // ── Mobile Bottom Navigation ──────────────────────────────────────────────────
  _renderMobileBottomNav() {
    const tabs = [
      { id: "dashboard", icon: "dashboard", label: "Tablou" },
      { id: "list",      icon: "list",      label: "List\u0103" },
      { id: "map",       icon: "map",       label: "Hart\u0103" },
      { id: "recipes",   icon: "recipes",   label: "Chef AI" },
    ];
    return html`
      <nav class="mobile-bottom-nav" role="tablist" aria-label="Navigare">
        ${tabs.map(t => html`
          <button
            class="tab ${this._tab === t.id ? 'tab--active' : ''}"
            role="tab"
            aria-selected=${this._tab === t.id}
            @click=${() => { this._tab = t.id; }}
            id="mob-tab-${t.id}">
            ${icon(t.icon, 22)}
            <span class="tab-label">${t.label}</span>
          </button>
        `)}
      </nav>
    `;
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  _renderDashboardView() {
    const list = this._activeList;
    const items = list?.items || [];
    const cartItems = items.filter(i => i.in_cart !== false);
    const outOfStock = items.filter(i => {
      const a = i.availability;
      return !a || a === 'withoutStock' || a === 'withoutPriceFulfillment' ||
             a === 'withoutSearchSelection' || a === 'cannotBeHandled';
    });
    const watched = items.filter(i => i.watch || i.watch_price || i.watch_stock);
    const savings = this._cartSavings;

    const cats = {};
    items.forEach(i => { if (i.category) cats[i.category] = (cats[i.category] || 0) + 1; });
    const catEntries = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4);

    if (!list) return html`
      <div class="empty-state">
        ${icon('list', 48)}
        <h3>Nicio listă</h3>
        <p>Creează o listă nouă pentru a începe</p>
        <button class="primary-btn" @click=${this._createList}>${icon('plus', 16)} Listă nouă</button>
      </div>
    `;

    return html`
      <div class="dash">
        <!-- Hero Card -->
        <div class="dash-hero">
          <div class="dash-hero-left">
            <h2 class="dash-list-name">${list.name || list.id}</h2>
          </div>
          <div class="dash-hero-right">
            <span class="dash-total-label">Total coș</span>
            <span class="dash-total-val">${fmtPrice(this._cartTotal)}</span>
            ${savings > 0.01 ? html`
              <span class="dash-chip dash-chip--green">Economii ${fmtPrice(savings)}</span>
            ` : nothing}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="bento">
          <button class="bento-card stat-card" @click=${() => { this._tab = "list"; this._filterCategory = ""; }}>
            <div class="stat-icon stat-icon--blue">${icon('list', 22)}</div>
            <div class="stat-body">
              <span class="stat-num">${cartItems.length}</span>
              <span class="stat-name">În coș</span>
            </div>
          </button>

          <button class="bento-card stat-card" @click=${() => this._tab = "list"}>
            <div class="stat-icon stat-icon--orange">${icon('eye', 22)}</div>
            <div class="stat-body">
              <span class="stat-num">${watched.length}</span>
              <span class="stat-name">Monitorizate</span>
            </div>
          </button>

          <button class="bento-card stat-card ${outOfStock.length > 0 ? 'stat-card--alert' : ''}"
            @click=${() => this._tab = "list"}>
            <div class="stat-icon stat-icon--red">${icon('alert', 22)}</div>
            <div class="stat-body">
              <span class="stat-num">${outOfStock.length}</span>
              <span class="stat-name">Epuizate</span>
            </div>
          </button>

          <button class="bento-card stat-card" @click=${() => this._tab = "map"}>
            <div class="stat-icon stat-icon--green">${icon('pin', 22)}</div>
            <div class="stat-body">
              <span class="stat-num">${this._pickupPoints.length || '—'}</span>
              <span class="stat-name">Magazine</span>
            </div>
          </button>
        </div>

        <!-- Categories -->
        ${catEntries.length > 0 ? html`
          <div class="bento-card">
            <h4 class="card-section-title">Categorii</h4>
            ${catEntries.map(([cat, count]) => html`
              <button class="cat-row" @click=${() => { this._tab = "list"; this._filterCategory = cat; }}>
                <span class="cat-name">${cat}</span>
                <span class="cat-badge">${count}</span>
              </button>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  // ── List View ─────────────────────────────────────────────────────────────────
  _renderListView() {
    if (this._loading) return this._renderSkeleton();
    const items = this._activeItems;
    const cats = this._categories;

    return html`
      <div class="list-view">
        <!-- Filters row -->
        <div class="filter-bar">
          <div class="filter-chips">
            <button class="filter-chip ${!this._filterCategory ? 'filter-chip--active' : ''}"
              @click=${() => this._filterCategory = ""}>
              Toate (${this._activeList?.items?.length || 0})
            </button>
            ${cats.map(cat => html`
              <button class="filter-chip ${this._filterCategory === cat ? 'filter-chip--active' : ''}"
                @click=${() => this._filterCategory = cat}>
                ${cat}
              </button>
            `)}
          </div>
          <select class="sort-select" @change=${e => this._sortBy = e.target.value} aria-label="Sortare">
            <option value="added">Ordine adăugare</option>
            <option value="name">Alfabetic</option>
            <option value="price_asc">Preț crescător</option>
            <option value="price_desc">Preț descrescător</option>
          </select>
        </div>

        <!-- Product list -->
        ${items.length === 0 ? html`
          <div class="empty-state">
            ${icon('cart', 48)}
            <h3>Lista e goală</h3>
            <p>Caută produse în bara de sus pentru a le adăuga</p>
          </div>
        ` : html`
          <ul class="product-list" role="list">
            ${items.map(item => this._renderProductCard(item))}
          </ul>
        `}
      </div>
    `;
  }

  _renderSkeleton() {
    return html`
      <div class="product-list">
        ${[1,2,3,4].map(() => html`
          <div class="product-card skeleton-card" aria-hidden="true">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton skeleton-line skeleton-line--short"></div>
              <div class="skeleton skeleton-line"></div>
              <div class="skeleton skeleton-line skeleton-line--med"></div>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _renderProductCard(item) {
    const avail = availabilityInfo(item.availability);
    const inCart = item.in_cart !== false;
    const isWatched = item.watch || item.watch_price || item.watch_stock;
    const discount = item.discount_pct || 0;
    const listId = this._activeListId;

    return html`
      <li class="product-card ${!inCart ? 'product-card--unchecked' : ''} ${item.availability !== 'available' ? 'product-card--unavail' : ''}"
          role="listitem">
        <!-- Left: Image -->
        <div class="prod-thumb-wrap">
          ${item.image_url ? html`
            <img class="prod-thumb" src=${item.image_url} alt=${item.name} loading="lazy" referrerpolicy="no-referrer"
                 @error=${e => e.target.style.display = 'none'} />
          ` : html`<div class="prod-thumb prod-thumb--fallback">${icon('cart', 24)}</div>`}
          ${discount > 0 && item.availability === 'available' ? html`<span class="discount-badge">-${Math.round(discount)}%</span>` : nothing}
        </div>

        <!-- Right: Body -->
        <div class="prod-body">
          <div class="prod-top">
            ${item.brand ? html`<span class="prod-brand">${item.brand}</span>` : nothing}
            <div class="prod-actions">
              <button class="icon-btn ${isWatched ? 'icon-btn--watch-active' : ''}"
                @click=${() => this._toggleWatch(listId, item.sku_id)}
                ?disabled=${Boolean(this._busyActions[`watch:${listId}:${item.sku_id}`])}
                aria-label="${isWatched ? 'Dezactivează monitorizare' : 'Monitorizează preț/stoc'}"
                title="${isWatched ? 'Monitorizare activă' : 'Monitorizează'}">
                ${isWatched ? icon('starFill', 17) : icon('star', 17)}
              </button>
              <button class="icon-btn icon-btn--danger"
                @click=${() => this._removeItem(listId, item.sku_id, item.name)}
                ?disabled=${Boolean(this._busyActions[`remove:${listId}:${item.sku_id}`])}
                aria-label="Elimină ${item.name}">
                ${icon('trash', 17)}
              </button>
            </div>
          </div>

          <p class="prod-name">
            ${item.url ? html`<a href=${item.url} target="_blank" rel="noopener">${item.name}</a>` : item.name}
          </p>

          <!-- Availability -->
          <div class="prod-avail">
            <span class="avail-dot" style="background:${avail.color}"></span>
            <span class="avail-label" style="color:${avail.color}">${avail.label}</span>
          </div>

          <!-- Footer: price + controls -->
          <div class="prod-footer">
            <div class="price-block">
              ${item.list_price > 0 && item.list_price !== item.current_price ? html`
                <span class="price-original">${fmtPrice(item.list_price)}</span>
              ` : nothing}
              <span class="price-current">${fmtPrice(item.current_price || item.price_when_added)}</span>
            </div>
            <div class="prod-controls">
              <div class="qty-control">
                <button class="qty-btn" @click=${() => this._updateQty(listId, item.sku_id, -1, item.quantity || 1)}
                  ?disabled=${Boolean(this._busyActions[`quantity:${listId}:${item.sku_id}`])}
                  aria-label="Scade cantitate">−</button>
                <span class="qty-val" aria-label="Cantitate: ${item.quantity || 1}">${item.quantity || 1}</span>
                <button class="qty-btn" @click=${() => this._updateQty(listId, item.sku_id, 1, item.quantity || 1)}
                  ?disabled=${Boolean(this._busyActions[`quantity:${listId}:${item.sku_id}`])}
                  aria-label="Crește cantitate">+</button>
              </div>
              <button class="cart-toggle-btn ${inCart ? 'cart-toggle-btn--active' : ''}"
                @click=${() => this._toggleCart(listId, item.sku_id)}
                ?disabled=${Boolean(this._busyActions[`cart:${listId}:${item.sku_id}`])}
                aria-label="${inCart ? 'Scoate din coș' : 'Adaugă în coș'}"
                aria-pressed=${inCart}>
                ${inCart ? 'În coș' : 'Adaugă'}
              </button>
            </div>
          </div>
        </div>
      </li>
    `;
  }

  // ── Map View ──────────────────────────────────────────────────────────────────
  _renderMapView() {
    const activeAddress = this._addresses?.find(address => address.is_active);
    const lat = activeAddress?.latitude || this.hass?.config?.latitude || 44.4195;
    const lng = activeAddress?.longitude || this.hass?.config?.longitude || 26.1776;
    const points = this._pickupPoints || [];
    const isLoading = this._pickupPointsLoading;
    const mapHtml = this._buildMapHtml(lat, lng, points);

    return html`
      <div class="map-view">
        <iframe
          id="leaflet-iframe"
          class="leaflet-iframe"
          srcdoc=${mapHtml}
          sandbox="allow-scripts"
          title="Hartă magazine Auchan"
          loading="lazy">
        </iframe>

        <div class="map-stores-header">
          <h3 class="section-heading">
            ${isLoading ? 'Se caută magazine...' : `Magazine aproape (${points.length})`}
          </h3>
          <button class="icon-btn" @click=${() => this._loadPickupPoints()}
            title="Reîncarcă magazine" aria-label="Reîncarcă magazine">
            ${icon('refresh', 16)}
          </button>
        </div>

        ${isLoading ? html`
          <div class="pickup-skeleton">
            ${[1,2,3].map(() => html`<div class="skeleton pickup-skel-row"></div>`)}
          </div>
        ` : points.length > 0 ? html`
          <ul class="pickup-list" role="list">
            ${points.map((p, i) => html`
              <li class="pickup-item ${i === 0 ? 'pickup-item--best' : ''}" role="listitem">
                <div class="pickup-icon">${icon('pin', 20)}</div>
                <div class="pickup-info">
                  <span class="pickup-name">${p.name}</span>
                  <span class="pickup-addr">${p.address ? `${p.address}, ` : ""}${p.city || ""}</span>
                </div>
                <div class="pickup-right">
                  ${p.distance_km ? html`<span class="pickup-dist">${p.distance_km.toFixed(1)} km</span>` : nothing}
                  <button class="icon-btn" @click=${() => this._flyToStore(p)} title="Centrare pe hartă" aria-label="Centrează ${p.name}">
                    ${icon('map', 16)}
                  </button>
                  <button class="icon-btn" @click=${() => this._selectPickupStore(p)} title="Selectează magazin" aria-label="Selectează ${p.name}">
                    ${icon('check', 16)}
                  </button>
                </div>
              </li>
            `)}
          </ul>
        ` : html`
          <div class="empty-state">
            ${icon('map', 48)}
            <p>Nu s-au găsit magazine Auchan în zonă.</p>
            <button class="primary-btn" @click=${() => this._loadPickupPoints()}>
              ${icon('refresh', 16)} Reîncarcă
            </button>
          </div>
        `}
      </div>
    `;
  }

  _buildMapHtml(lat, lng, points) {
    const serialize = value => JSON.stringify(value)
      .replaceAll("<", "\\u003c")
      .replaceAll("\u2028", "\\u2028")
      .replaceAll("\u2029", "\\u2029");
    const pts = serialize(points.map(p => ({
      lat: Number(p.latitude),
      lng: Number(p.longitude),
      name: String(p.name || "Magazin Auchan").slice(0, 120),
      desc: [p.address, p.city].filter(Boolean).join(", ").slice(0, 220),
    })));
    const channel = serialize(this._mapChannel);
    const assetOrigin = window.location.origin;
    const leafletCss = `${assetOrigin}/auchan_grocery_static/vendor/leaflet.css`;
    const leafletJs = `${assetOrigin}/auchan_grocery_static/vendor/leaflet.js`;
    const markerAsset = serialize(`${assetOrigin}/auchan_grocery_static/images/auchan-marker.svg`);
    return `<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' ${assetOrigin}; style-src 'unsafe-inline' ${assetOrigin}; img-src data: ${assetOrigin} https://tile.openstreetmap.org; connect-src 'none'">
<link rel="stylesheet" href="${leafletCss}"/>
<script src="${leafletJs}"><\/script>
<style>
body{margin:0;font-family:system-ui,sans-serif}#map{width:100vw;height:100vh}
.auchan-pin{width:34px;height:34px;display:grid;place-items:center;background:#fff;border:2px solid #ED002E;border-radius:50% 50% 50% 5px;box-shadow:0 4px 12px rgba(1,23,42,.30);transform:rotate(-45deg)}
.auchan-pin img{width:23px;height:23px;display:block;transform:rotate(45deg)}
.auchan-pin--explore{border-color:#3FA9F5;box-shadow:0 4px 12px rgba(63,169,245,.36)}
.store-popup{min-width:180px}.store-popup b{display:block;margin-bottom:4px}.store-popup .addr{font-size:12px;color:#3C617E;margin-bottom:8px}.store-popup button{border-radius:6px;padding:7px 10px;cursor:pointer;font-size:12px;font-weight:700;width:100%;margin-top:4px}
</style></head>
<body><div id="map"></div><script>
const CHANNEL=${channel};
const AUCHAN_MARKER=${markerAsset};
const map=L.map('map').setView([${lat},${lng}],12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  maxZoom:19
}).addTo(map);
const uIcon=L.divIcon({html:'<div style="background:#ED002E;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.4)"></div>',className:''});
const markerHtml=variant=>'<div class="auchan-pin '+(variant==='explore'?'auchan-pin--explore':'')+'"><img src="'+AUCHAN_MARKER+'" alt="" /></div>';
const sIcon=L.divIcon({html:markerHtml('store'),className:'',iconSize:[38,44],iconAnchor:[19,42],popupAnchor:[0,-38]});
const exploreIcon=L.divIcon({html:markerHtml('explore'),className:'',iconSize:[38,44],iconAnchor:[19,42],popupAnchor:[0,-38]});
L.marker([${lat},${lng}],{icon:uIcon}).addTo(map).bindPopup('Loca\u021bia ta');
function send(type,p){window.parent.postMessage({type,lat:p.lat,lng:p.lng,name:p.name,channel:CHANNEL},'*');}
function popupFor(p,color){
  const root=document.createElement('div');root.className='store-popup';
  const title=document.createElement('b');title.textContent=p.name;root.append(title);
  const addr=document.createElement('div');addr.className='addr';addr.textContent=p.desc;root.append(addr);
  const active=document.createElement('button');active.textContent='\u2713 Seteaz\u0103 ca adres\u0103 activ\u0103';active.style.cssText='background:#00AC6C;color:white;border:none';active.addEventListener('click',()=>send('store_set_active',p));root.append(active);
  const save=document.createElement('button');save.textContent='+ Salveaz\u0103 ca adres\u0103 nou\u0103';save.style.cssText='background:white;color:'+color+';border:1px solid '+color;save.addEventListener('click',()=>send('store_save_new',p));root.append(save);
  return root;
}
${pts}.forEach(p=>{if(Number.isFinite(p.lat)&&Number.isFinite(p.lng)){L.marker([p.lat,p.lng],{icon:sIcon}).addTo(map).bindPopup(popupFor(p,'#ED002E'))}});
let exploreMarkers=[];
function clearExplore(){exploreMarkers.forEach(m=>map.removeLayer(m));exploreMarkers=[];}
function addExploreStores(stores){stores.forEach(p=>{if(Number.isFinite(p.lat)&&Number.isFinite(p.lng)){const m=L.marker([p.lat,p.lng],{icon:exploreIcon}).addTo(map).bindPopup(popupFor(p,'#3FA9F5'));exploreMarkers.push(m)}});}
map.on('click',function(e){window.parent.postMessage({type:'map_click',lat:e.latlng.lat,lng:e.latlng.lng,channel:CHANNEL},'*');});
window.addEventListener('message',e=>{
  if(e.data?.channel!==CHANNEL)return;
  if(e.data?.type==='fly')map.flyTo([e.data.lat,e.data.lng],15);
  if(e.data?.type==='explore_stores'){clearExplore();addExploreStores(e.data.stores||[]);}
});
<\/script></body></html>`;
  }

  // ── Recipes View ──────────────────────────────────────────────────────────────
  async _startChefLogin() {
    try {
      this._chefLogin = { status: "starting" };
      const login = await this._api.startChefLogin();
      this._chefLogin = { ...login, status: "pending" };
      if (login.login_id) this._pollChefLogin(login.login_id, 0);
    } catch (error) {
      console.error("[AuchanPanel] Chef login failed", error);
      this._chefLogin = null;
      this._showToast("Autentificarea ChatGPT nu a putut fi pornită.", "error");
    }
  }

  _pollChefLogin(loginId, attempt) {
    if (!this._chefLogin || attempt > 180) return;
    this._schedule(async () => {
      try {
        const result = await this._api.getChefLoginStatus(loginId);
        this._chefLogin = { ...this._chefLogin, ...result };
        if (result.status === "completed") {
          this._showToast("Contul ChatGPT a fost conectat.", "success");
          this._chefLogin = null;
          this._chefStatus = null;
          await this._loadChef();
          return;
        }
        if (result.status === "failed") {
          this._showToast(result.error || "Autentificarea ChatGPT a eșuat.", "error");
          return;
        }
        this._pollChefLogin(loginId, attempt + 1);
      } catch (error) {
        console.error("[AuchanPanel] Chef login polling failed", error);
        this._pollChefLogin(loginId, attempt + 1);
      }
    }, 2000);
  }

  async _logoutChef() {
    try {
      await this._api.logoutChef();
      this._chefStatus = null;
      this._chefPlan = null;
      this._chefThreadId = "";
      await this._loadChef();
      this._showToast("Contul ChatGPT a fost deconectat.", "success");
    } catch (error) {
      console.error("[AuchanPanel] Chef logout failed", error);
      this._showToast("Contul nu a putut fi deconectat.", "error");
    }
  }

  _setChefPreference(key, value) {
    this._chefPreferences = { ...this._chefPreferences, [key]: value };
  }

  async _saveChefPreferences() {
    try {
      this._chefPreferences = await this._api.saveChefPreferences(this._chefPreferences);
      this._chefSettingsOpen = false;
      this._showToast("Preferințele au fost salvate.", "success");
    } catch (error) {
      console.error("[AuchanPanel] Chef preferences failed", error);
      this._showToast("Preferințele nu au putut fi salvate.", "error");
    }
  }

  async _askChef(prompt = this._chefPrompt) {
    const question = String(prompt || "").trim();
    if (question.length < 3 || this._chefGenerating) return;
    this._chefPrompt = question;
    this._chefGenerating = true;
    try {
      const result = await this._api.createChefPlan(question, this._chefThreadId);
      this._chefPlan = result.recipe;
      this._chefThreadId = result.thread_id || this._chefThreadId;
      const selected = {};
      (result.recipe?.ingredients || []).forEach((ingredient, index) => {
        const available = (ingredient.matches || []).find(product => product.is_available) || ingredient.matches?.[0];
        if (available?.sku_id) selected[index] = available.sku_id;
      });
      this._chefSelected = selected;
    } catch (error) {
      console.error("[AuchanPanel] Chef generation failed", error);
      this._showToast("Chef AI nu a putut genera rețeta. Încearcă din nou.", "error");
    }
    this._chefGenerating = false;
  }

  _selectChefProduct(ingredientIndex, skuId) {
    this._chefSelected = { ...this._chefSelected, [ingredientIndex]: skuId };
  }

  _skipChefProduct(ingredientIndex) {
    const selected = { ...this._chefSelected };
    delete selected[ingredientIndex];
    this._chefSelected = selected;
  }

  async _importChefPlan() {
    if (!this._chefPlan || this._chefImporting) return;
    const selections = (this._chefPlan.ingredients || []).flatMap((ingredient, index) => {
      const skuId = this._chefSelected[index];
      const product = (ingredient.matches || []).find(candidate => candidate.sku_id === skuId);
      if (!product) return [];
      return [{
        ingredient_name: ingredient.name,
        search_query: product.match_query || ingredient.search_query,
        sku_id: product.sku_id,
        quantity: product.suggested_packages || 1,
      }];
    });
    if (!selections.length) {
      this._showToast("Alege cel puțin un produs.", "error");
      return;
    }
    this._chefImporting = true;
    try {
      const result = await this._api.importChefProducts({
        list_id: this._chefTargetListId || this._activeListId || "new",
        recipe_title: this._chefPlan.title,
        selections,
      });
      await this._loadLists();
      if (result.list_id) this._activeListId = result.list_id;
      const rejected = result.rejected_count ? `, ${result.rejected_count} respinse la reverificare` : "";
      this._showToast(`${result.added_count} produse adăugate${rejected}.`, result.added_count ? "success" : "error");
      if (result.added_count) this._tab = "list";
    } catch (error) {
      console.error("[AuchanPanel] Chef import failed", error);
      this._showToast("Produsele nu au putut fi importate.", "error");
    }
    this._chefImporting = false;
  }

  _renderChefPreferences() {
    const p = this._chefPreferences;
    return html`
      <section class="chef-settings">
        <div class="chef-settings-grid">
          <label>Persoane
            <input type="number" min="1" max="20" .value=${String(p.household_size || 2)}
              @input=${event => this._setChefPreference("household_size", Number(event.target.value))} />
          </label>
          <label>Buget
            <select .value=${p.budget || "mediu"} @change=${event => this._setChefPreference("budget", event.target.value)}>
              <option value="economic">Economic</option><option value="mediu">Mediu</option><option value="premium">Premium</option>
            </select>
          </label>
          <label>Timp maxim
            <select .value=${String(p.max_time_minutes || 45)} @change=${event => this._setChefPreference("max_time_minutes", Number(event.target.value))}>
              <option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="120">2 ore</option>
            </select>
          </label>
          <label>Regim / alergii
            <input .value=${(p.dietary || []).join(", ")} placeholder="vegetarian, fără lactoză"
              @input=${event => this._setChefPreference("dietary", event.target.value.split(",").map(value => value.trim()).filter(Boolean))} />
          </label>
          <label class="chef-wide">Nu ne plac
            <input .value=${p.dislikes || ""} placeholder="coriandru, măsline..."
              @input=${event => this._setChefPreference("dislikes", event.target.value)} />
          </label>
          <label class="chef-wide">Avem deja în cămară
            <input .value=${p.pantry || ""} placeholder="sare, ulei, piper..."
              @input=${event => this._setChefPreference("pantry", event.target.value)} />
          </label>
          <label class="chef-wide">Card de fidelitate (alias, opțional)
            <input .value=${p.loyalty_card_alias || ""} placeholder="ex: Cardul familiei"
              @input=${event => this._setChefPreference("loyalty_card_alias", event.target.value)} />
          </label>
        </div>
        <button class="primary-btn chef-save" @click=${this._saveChefPreferences}>Salvează preferințele</button>
      </section>`;
  }

  _renderChefProduct(product, ingredientIndex, selectedSku) {
    const selected = product.sku_id === selectedSku;
    return html`
      <button class="chef-product ${selected ? "chef-product--selected" : ""}"
        @click=${() => this._selectChefProduct(ingredientIndex, product.sku_id)}>
        <span class="chef-product-check">${selected ? "✓" : ""}</span>
        ${product.image_url ? html`<img src=${product.image_url} alt=${product.name} loading="lazy" />` : html`<span class="chef-product-placeholder">${icon("cart", 24)}</span>`}
        <span class="chef-product-copy">
          <strong>${product.name}</strong>
          <small>${product.brand || "Auchan"} · SKU ${product.sku_id}</small>
          <span><b>${fmtPrice(product.price)}</b>${product.suggested_packages > 1 ? html` · ${product.suggested_packages} bucăți` : nothing}</span>
        </span>
      </button>`;
  }

  _renderChefPlan() {
    const recipe = this._chefPlan;
    if (!recipe) return nothing;
    if (recipe.type === "clarification") return html`
      <section class="chef-clarification">
        <span class="chef-avatar">?</span>
        <div><strong>Mai am nevoie de un detaliu</strong><p>${recipe.message}</p></div>
      </section>`;

    const selectedCount = Object.keys(this._chefSelected).length;
    const estimatedTotal = (recipe.ingredients || []).reduce((sum, ingredient, index) => {
      const product = (ingredient.matches || []).find(item => item.sku_id === this._chefSelected[index]);
      return sum + (product?.price || 0) * (product?.suggested_packages || 1);
    }, 0);
    return html`
      <article class="chef-plan">
        <header class="chef-plan-head">
          <div><span class="chef-kicker">Propunerea Chef AI</span><h2>${recipe.title}</h2><p>${recipe.description}</p></div>
          <div class="chef-meta"><span>${recipe.servings} porții</span><span>${recipe.prep_minutes + recipe.cook_minutes} min</span><span>${recipe.difficulty}</span></div>
        </header>
        <section class="chef-plan-section">
          <h3>Ingrediente și produse Auchan</h3>
          <p class="chef-help">Alegerea este a ta. Importăm numai SKU-ul bifat și îl reverificăm înainte de salvare.</p>
          <div class="chef-ingredients">
            ${(recipe.ingredients || []).map((ingredient, index) => html`
              <div class="chef-ingredient">
                <div class="chef-ingredient-title">
                  <span>${index + 1}</span>
                  <div>
                    <strong>${ingredient.name}</strong>
                    <small>${ingredient.quantity || ""} ${ingredient.unit || ""}${ingredient.optional ? " · opțional" : ""}</small>
                    ${this._chefSelected[index] ? html`<button @click=${() => this._skipChefProduct(index)}>Am deja / nu cumpăr</button>` : nothing}
                  </div>
                </div>
                ${(ingredient.matches || []).length ? html`
                  <div class="chef-products">${ingredient.matches.map(product => this._renderChefProduct(product, index, this._chefSelected[index]))}</div>
                ` : html`<div class="chef-no-match">Nu am găsit un produs alimentar suficient de relevant. Ingredientul nu va fi importat.</div>`}
              </div>`)}
          </div>
        </section>
        <section class="chef-plan-section chef-steps">
          <h3>Mod de preparare</h3>
          <ol>${(recipe.instructions || []).map(step => html`<li>${step}</li>`)}</ol>
        </section>
        <footer class="chef-import-bar">
          <div><strong>${selectedCount} produse</strong><span>Estimare: ${fmtPrice(estimatedTotal)}</span></div>
          <select .value=${this._chefTargetListId || this._activeListId || "new"} @change=${event => this._chefTargetListId = event.target.value}>
            ${(this._lists || []).map(list => html`<option value=${list.id}>${list.name}</option>`)}
            <option value="new">+ Listă nouă pentru rețetă</option>
          </select>
          <button class="primary-btn" ?disabled=${this._chefImporting || !selectedCount} @click=${this._importChefPlan}>
            ${this._chefImporting ? "Se reverifică..." : `Adaugă ${selectedCount} produse`}
          </button>
        </footer>
      </article>`;
  }

  _renderRecipesView() {
    if (this._chefStatusLoading && !this._chefStatus) return html`<div class="chef-loading"><div class="spinner"></div><span>Se pregătește Chef AI...</span></div>`;
    if (!this._chefStatus?.configured) return html`
      <section class="chef-onboarding">
        <span class="chef-avatar">AI</span>
        <h2>Configurează Chef AI</h2>
        <p>Adaugă adresa serviciului privat și tokenul în <strong>Setări → Dispozitive și servicii → Auchan Grocery → Configurează</strong>.</p>
        <button class="secondary-btn" @click=${() => { this._chefStatus = null; this._loadChef(); }}>${icon("refresh", 16)} Verifică din nou</button>
      </section>`;
    if (!this._chefStatus?.connected) return html`
      <section class="chef-onboarding">
        <span class="chef-avatar">AI</span>
        <span class="chef-kicker">Fără cheie API</span>
        <h2>Conectează contul ChatGPT</h2>
        <p>Primești un cod, deschizi pagina oficială OpenAI și autorizezi dispozitivul. Datele de autentificare rămân în serviciul tău privat.</p>
        ${this._chefStatus?.error ? html`<div class="chef-error">${this._chefStatus.error}</div>` : nothing}
        ${this._chefLogin?.user_code ? html`
          <div class="chef-device-code">
            <small>Cod de autorizare</small>
            <strong>${this._chefLogin.user_code}</strong>
            <div>
              <button class="secondary-btn" @click=${() => navigator.clipboard?.writeText(this._chefLogin.user_code)}>Copiază codul</button>
              <a class="primary-btn" href=${this._chefLogin.verification_url || "https://auth.openai.com/codex/device"} target="_blank" rel="noopener">Deschide OpenAI</a>
            </div>
            <span class="chef-waiting"><i></i>Aștept autorizarea...</span>
          </div>
        ` : html`<button class="primary-btn" ?disabled=${this._chefLogin?.status === "starting"} @click=${this._startChefLogin}>${this._chefLogin?.status === "starting" ? "Se generează codul..." : "Conectează ChatGPT"}</button>`}
      </section>`;

    const account = this._chefStatus.account || {};
    const quickPrompts = ["Cină rapidă în 30 de minute", "Ceva bun din pui pentru familie", "O rețetă vegetariană economică"];
    return html`
      <div class="chef-view">
        <header class="chef-header">
          <div><span class="chef-kicker">Auchan Chef AI</span><h1>Ce gătim azi?</h1><p>Rețetă personalizată, apoi produse reale din magazinul tău.</p></div>
          <div class="chef-account">
            <span><i></i>${account.email || "ChatGPT conectat"}${account.plan_type ? ` · ${account.plan_type}` : ""}</span>
            <button class="icon-btn" title="Preferințe" @click=${() => this._chefSettingsOpen = !this._chefSettingsOpen}>${icon("wrench", 18)}</button>
            <button class="text-btn" @click=${this._logoutChef}>Ieșire</button>
          </div>
        </header>
        ${this._chefSettingsOpen ? this._renderChefPreferences() : nothing}
        <section class="chef-composer">
          <textarea .value=${this._chefPrompt} @input=${event => this._chefPrompt = event.target.value}
            @keydown=${event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") this._askChef(); }}
            placeholder="Ex: Am niște dovlecei și vreau o cină ușoară pentru 3 persoane, fără lactoză..."></textarea>
          <button class="chef-send" ?disabled=${this._chefGenerating || this._chefPrompt.trim().length < 3} @click=${() => this._askChef()} aria-label="Trimite către Chef AI">${this._chefGenerating ? html`<div class="spinner spinner--sm"></div>` : icon("arrowUp", 20)}</button>
          <div class="chef-chips">${quickPrompts.map(prompt => html`<button @click=${() => { this._chefPrompt = prompt; this._askChef(prompt); }}>${prompt}</button>`)}</div>
        </section>
        ${this._chefGenerating ? html`<div class="chef-thinking"><div class="spinner"></div><div><strong>Chef AI pregătește propunerea</strong><span>Apoi verificăm separat produsele și disponibilitatea Auchan.</span></div></div>` : this._renderChefPlan()}
      </div>`;
  }

  _renderLegacyRecipesView() {
    if (this._recipesLoading) {
      return html`
        <div class="recipes-skeleton">
          ${[1,2,3,4,5,6].map(() => html`
            <div class="recipe-card recipe-skel-card">
              <div class="skel-img"></div>
              <div class="recipe-body">
                <div class="skel-line" style="width:80%"></div>
                <div class="skel-line" style="width:50%;margin-top:6px"></div>
              </div>
            </div>
          `)}
        </div>`;
    }
    if (!this._recipes?.length) return html`
      <div class="empty-state">
        ${icon('recipes', 48)}
        <h3>Rețete Auchan</h3>
        <p>Nu s-au găsit rețete. Verifică conexiunea la internet.</p>
        <button class="primary-btn" @click=${this._loadRecipes}>${icon('refresh', 16)} Reîncarcă</button>
      </div>`;

    return html`
      <div class="recipes-header">
        <span class="recipes-count">${this._recipes.length} rețete</span>
        <button class="icon-btn" @click=${this._loadRecipes} title="Reîncarcă rețete">${icon('refresh', 16)}</button>
      </div>
      <div class="recipes-grid">
        ${this._recipes.map(r => this._renderRecipeCard(r))}
      </div>
      ${this._recipeModalData ? this._renderRecipeModal() : nothing}
    `;
  }

  _renderRecipeCard(r) {
    return html`
      <article class="recipe-card" role="button" tabindex="0"
        aria-label="Deschide rețeta ${r.title}"
        @click=${() => this._openRecipeModal(r)}
        @keydown=${event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this._openRecipeModal(r);
          }
        }}>
        <div class="recipe-img-wrap">
          ${r.image_url ? html`
            <img class="recipe-img" src=${r.image_url} alt=${r.title} loading="lazy" referrerpolicy="no-referrer"
                 @error=${e => e.target.parentElement.innerHTML = `<div class="recipe-img--placeholder">${icon('recipes', 32)}</div>`} />
          ` : html`<div class="recipe-img--placeholder">${icon('recipes', 32)}</div>`}
          ${r.ingredients?.length > 0 ? html`
            <div class="recipe-badge">${r.ingredients.length} ing.</div>
          ` : nothing}
        </div>
        <div class="recipe-body">
          <h4 class="recipe-title">${r.title}</h4>
          <div class="recipe-meta">
            ${r.prep_time ? html`<span>${icon('clock', 11)} ${r.prep_time}</span>` : nothing}
            ${r.servings ? html`<span>👥 ${r.servings}</span>` : nothing}
          </div>
        </div>
      </article>`;
  }

  async _openRecipeModal(recipe) {
    // Show modal immediately with what we have
    this._recipeModalData = { recipe, loading: !recipe.detail_fetched, selected: new Set(), importing: false, result: null };

    // Fetch detail in the background if not yet done
    if (!recipe.detail_fetched) {
      try {
        const detail = await this._api.getJson(`/api/auchan_grocery/recipes/${recipe.id}/detail`);
        // Merge detail into existing recipe object
        Object.assign(recipe, detail);
        recipe.detail_fetched = true;
        this._recipeModalData = { ...this._recipeModalData, recipe, loading: false };
        // Pre-select only products proven to come from the recipe's VTEX shelf.
        this._recipeModalData.selected = new Set((recipe.ingredients || [])
          .map((item, index) => item.found && item.sku_id && item.product_id ? index : null)
          .filter(index => index !== null));
      } catch (e) {
        this._recipeModalData = { ...this._recipeModalData, loading: false };
        this._showToast('Nu s-au putut încărca produsele rețetei', 'error');
      }
    } else {
      this._recipeModalData.selected = new Set((recipe.ingredients || [])
        .map((item, index) => item.found && item.sku_id && item.product_id ? index : null)
        .filter(index => index !== null));
    }
  }

  _renderRecipeModal() {
    const { recipe, loading, selected, importing, result } = this._recipeModalData;
    const ingredients = recipe.ingredients || [];
    const products = ingredients
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.found && item.sku_id && item.product_id);
    const lists = this._lists || [];

    return html`
      <div class="modal-overlay" @click=${() => this._recipeModalData = null}
           role="dialog" aria-modal="true" aria-label="Produsele rețetei">
        <div class="modal-card recipe-modal" @click=${e => e.stopPropagation()}>

          <!-- Header -->
          <div class="modal-header">
            <div class="recipe-modal-title-wrap">
              <span class="modal-title">${recipe.title}</span>
              ${recipe.prep_time ? html`<span class="recipe-modal-meta">⏱ ${recipe.prep_time}</span>` : nothing}
              ${recipe.servings ? html`<span class="recipe-modal-meta">👥 ${recipe.servings}</span>` : nothing}
            </div>
            <button class="icon-btn" @click=${() => this._recipeModalData = null} aria-label="Închide">${icon('xmark', 18)}</button>
          </div>

          <!-- Image (if available) -->
          ${recipe.image_url ? html`
            <img class="recipe-modal-img" src=${recipe.image_url} alt=${recipe.title} referrerpolicy="no-referrer" />
          ` : nothing}

          <!-- Import result -->
          ${result ? html`
            <div class="recipe-import-result">
              <div class="import-result-row">
                ${icon('cart', 20)}
                <span>${result.added_count} produse adăugate în lista <strong>${result.list_name}</strong></span>
              </div>
              ${result.not_found?.length ? html`
                <div class="import-not-found">
                  <span class="import-not-found-label">Indisponibile:</span>
                  ${result.not_found.map(n => html`<span class="import-not-found-item">${n}</span>`)}
                </div>
              ` : nothing}
              <button class="primary-btn" style="margin-top:12px;width:100%"
                @click=${() => { this._recipeModalData = null; this._tab = 'list'; }}>
                ${icon('list', 16)} Vezi lista
              </button>
            </div>
          ` : html`

            <!-- Loading state -->
            ${loading ? html`
              <div class="recipe-modal-loading">
                <div class="spinner"></div>
                <span>Se încarcă produsele rețetei...</span>
              </div>
            ` : html`

              <!-- Ingredients checklist -->
              <div class="ingredients-section">
                <div class="ingredients-header">
                  <span class="section-heading">Produse din sliderul Auchan</span>
                  ${products.length ? html`<div class="ingredients-sel-actions">
                    <button class="text-btn" @click=${() => {
                      this._recipeModalData = { ...this._recipeModalData, selected: new Set(products.map(({ index }) => index)) };
                    }}>Toate</button>
                    <button class="text-btn" @click=${() => {
                      this._recipeModalData = { ...this._recipeModalData, selected: new Set() };
                    }}>Niciuna</button>
                  </div>` : nothing}
                </div>
                <ul class="recipe-ingredients-list">
                  ${products.length === 0 ? html`
                    <li class="recipe-no-ing recipe-no-ing--safe">
                      <strong>Niciun produs verificat</strong>
                      <span>Auchan nu publică un slider de produse pentru această rețetă. Importul automat este dezactivat pentru a evita produse fără legătură.</span>
                    </li>
                  ` : products.map(({ item: ing, index: idx }) => html`
                    <li class="recipe-ing-item ${selected.has(idx) ? 'recipe-ing-item--checked' : ''}"
                        @click=${() => {
                          const s = new Set(selected);
                          s.has(idx) ? s.delete(idx) : s.add(idx);
                          this._recipeModalData = { ...this._recipeModalData, selected: s };
                        }}>
                      <span class="recipe-ing-check">${selected.has(idx) ? '✓' : ''}</span>
                      ${ing.found && ing.image_url ? html`
                        <img class="recipe-ing-thumb" src=${ing.image_url} alt=${ing.name} referrerpolicy="no-referrer" />
                      ` : nothing}
                      <span class="recipe-ing-content">
                        <span class="recipe-ing-name">
                          ${ing.name}
                        </span>
                        ${ing.sku_id || ing.price ? html`
                          <span class="recipe-ing-meta">
                            ${ing.sku_id ? html`SKU ${ing.sku_id}` : nothing}
                            ${ing.sku_id && ing.price ? html`<span aria-hidden="true">·</span>` : nothing}
                            ${ing.price ? html`<strong>${Number(ing.price).toFixed(2).replace('.', ',')} lei</strong>` : nothing}
                          </span>
                        ` : nothing}
                      </span>
                    </li>
                  `)}
                </ul>
              </div>

              <!-- Import actions -->
              <div class="recipe-import-actions">
                <div class="recipe-list-selector">
                  <label class="recipe-list-label">${icon('list', 14)} Adaugă în lista:</label>
                  <select class="header-select" .value=${this._recipeImportListId || this._activeListId || ''}
                    @change=${e => this._recipeImportListId = e.target.value}>
                    ${lists.map(l => html`<option value=${l.id} ?selected=${l.id === (this._recipeImportListId || this._activeListId)}>${l.name || l.id}</option>`)}
                    <option value="new">+ Creează listă nouă din rețetă</option>
                  </select>
                </div>
                <div class="recipe-import-btns">
                  <a href=${recipe.url} target="_blank" rel="noopener" class="secondary-btn" style="flex:0 0 auto;padding:10px 14px">
                    ${icon('link', 15)}
                  </a>
                  <button class="primary-btn" style="flex:1"
                    ?disabled=${importing || products.length === 0 || selected.size === 0}
                    @click=${() => this._importRecipe(recipe, selected)}>
                    ${importing ? html`<div class="spinner spinner--sm"></div> Se importă...` : html`${icon('cart', 16)} Adaugă ${selected.size > 0 ? selected.size : ''} produse`}
                  </button>
                </div>
              </div>
            `}
          `}
        </div>
      </div>`;
  }

  async _importRecipe(recipe, selected) {
    this._recipeModalData = { ...this._recipeModalData, importing: true };
    const ingredients = recipe.ingredients || [];
    const chosenIngredients = [...selected].map(i => ingredients[i]).filter(Boolean);
    const listId = this._recipeImportListId || this._activeListId;
    const isNew = listId === 'new';
    try {
      const result = await this._api.postJson(
        `/api/auchan_grocery/recipes/${recipe.id}/import`,
        {
          list_id: listId,
          list_name: isNew ? `Rețetă: ${recipe.title.slice(0, 40)}` : undefined,
          sku_ids: chosenIngredients.map(i => i.sku_id),
        }
      );
      // Refresh lists
      await this._loadLists();
      if (result.list_id) this._activeListId = result.list_id;
      this._recipeModalData = { ...this._recipeModalData, importing: false, result };
      this._showToast(`${result.added_count} produse adăugate!`, 'success');
    } catch (e) {
      this._recipeModalData = { ...this._recipeModalData, importing: false };
      this._showToast('Eroare la importul rețetei', 'error');
    }
  }

  // ── Action Bar ────────────────────────────────────────────────────────────────
  _renderActionBar() {
    if (!this._activeList || this._tab === "recipes") return nothing;
    const cartCount = (this._activeList?.items || []).filter(i => i.in_cart !== false).length;
    return html`
      <div class="action-bar" role="toolbar" aria-label="Acțiuni">
        <button class="action-btn action-btn--primary" @click=${this._generateCartLink}
          aria-label="Generează link coș">
          ${icon('qr', 18)} Coș (${cartCount})
        </button>
        <button class="action-btn" @click=${() => { this._tab = "map"; }}
          aria-label="Deschide harta">
          ${icon('map', 18)} Hartă
        </button>
      </div>
    `;
  }

  // ── QR Modal ──────────────────────────────────────────────────────────────────
  _renderQrModal() {
    return html`
      <div class="modal-overlay" @click=${() => { this._showQr = false; }} role="dialog" aria-modal="true" aria-label="Link coș">
        <div class="modal-card" @click=${e => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">Scanează sau copiază link-ul</span>
            <button class="icon-btn" @click=${() => { this._showQr = false; }} aria-label="Închide">${icon('xmark', 18)}</button>
          </div>
          <div id="qr-container" class="qr-container"></div>
          <div class="url-row">
            <input class="url-input" readonly .value=${this._qrUrl || ""} aria-label="Link coș" />
            <button class="icon-btn" @click=${() => navigator.clipboard?.writeText(this._qrUrl)} title="Copiază" aria-label="Copiază link">
              ${icon('clipboard', 18)}
            </button>
          </div>
          <a href=${this._qrUrl} target="_blank" rel="noopener" class="primary-btn">
            ${icon('cart', 16)} Deschide pe Auchan.ro
          </a>
        </div>
      </div>
    `;
  }

  // ── Address Modal ─────────────────────────────────────────────────────────────
  _renderAddressModal() {
    return html`
      <div class="modal-overlay" @click=${this._closeAddressModal} role="dialog" aria-modal="true" aria-label="Adaugă adresă">
        <div class="modal-card modal-card--addr" @click=${e => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">${icon('pin', 18)} Adresă nouă</span>
            <button class="icon-btn" @click=${this._closeAddressModal} aria-label="Închide">${icon('xmark', 18)}</button>
          </div>

          <div class="addr-field">
            <label class="field-label">Etichetă</label>
            <div class="chip-row">
              ${['Acasă', 'Birou', 'Familie', 'Altul'].map(lbl => html`
                <button class="chip ${this._addrLabel === lbl ? 'chip--active' : ''}"
                  @click=${() => { this._addrLabel = lbl; }}>
                  ${lbl}
                </button>
              `)}
            </div>
          </div>

          <div class="addr-field">
            <label class="field-label" for="addr-search">Caută adresa</label>
            <div class="input-wrap">
              <input id="addr-search" class="search-input" type="text"
                placeholder="ex: Auchan Titan, București..."
                .value=${this._addrQuery}
                @input=${this._onAddrInput}
                autocomplete="off" />
              ${this._addrLoading ? html`<div class="spinner"></div>` : nothing}
            </div>
            ${this._addrSuggestions.length > 0 ? html`
              <ul class="suggestions" role="listbox">
                ${this._addrSuggestions.map(s => html`
                  <li class="suggestion-row" role="option" @click=${() => this._selectAddrSuggestion(s)}>
                    ${icon('pin', 14)}
                    <span>${s.display_name}</span>
                  </li>
                `)}
              </ul>
            ` : nothing}
            ${this._addrSelected ? html`
              <div class="addr-selected">
                ${icon('check', 14)}
                <span>${this._addrSelected.display_name}</span>
              </div>
            ` : nothing}
          </div>

          <div class="addr-actions">
            <button class="secondary-btn" @click=${this._closeAddressModal}>Anulează</button>
            <button class="primary-btn" @click=${this._saveAddress}
              ?disabled=${!this._addrSelected || this._addrLoading}>
              ${this._addrLoading ? html`<div class="spinner spinner--sm"></div>` : icon('check', 16)}
              Salvează
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Address Sheet (mobile) ────────────────────────────────────────────────────
  _renderAddressSheet() {
    const addresses = this._addresses || [];
    return html`
      <div class="sheet-backdrop" @click=${() => this._showAddressSheet = false} role="dialog" aria-modal="true" aria-label="Selectează adresa">
        <div class="sheet-card" @click=${e => e.stopPropagation()}>
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            ${icon('pin', 18)}
            <span class="sheet-title">Adresă activă</span>
            <button class="icon-btn" @click=${() => this._showAddressSheet = false} aria-label="Închide">
              ${icon('xmark', 18)}
            </button>
          </div>

          <div class="sheet-body">
            ${addresses.length === 0 ? html`
              <p class="sheet-empty">Nicio adresă salvată. Adaugă una!</p>
            ` : addresses.map(a => html`
              <div class="sheet-addr-row ${a.is_active ? 'sheet-addr-row--active' : ''}"
                @click=${() => { this._activateAddress(a.id); this._showAddressSheet = false; }}>
                <span class="sheet-addr-icon">${icon('pin', 16)}</span>
                <div class="sheet-addr-info">
                  <div class="sheet-addr-label">${a.label}</div>
                  ${a.display_name ? html`<div class="sheet-addr-sub">${a.display_name}</div>` : nothing}
                </div>
                ${a.is_active ? html`
                  <span class="sheet-addr-check">${icon('check', 16)}</span>
                ` : nothing}
              </div>
            `)}
          </div>

          <div class="sheet-footer">
            <button class="sheet-add-btn" @click=${this._openAddAddressModal}>
              ${icon('plus', 16)} Adresă nouă
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  static styles = css`
    @font-face {
      font-family: "Source Sans 3";
      src: url("/auchan_grocery_static/fonts/source-sans-3-400.woff2") format("woff2");
      font-style: normal;
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: "Source Sans 3";
      src: url("/auchan_grocery_static/fonts/source-sans-3-600.woff2") format("woff2");
      font-style: normal;
      font-weight: 600;
      font-display: swap;
    }
    @font-face {
      font-family: "Source Sans 3";
      src: url("/auchan_grocery_static/fonts/source-sans-3-700.woff2") format("woff2");
      font-style: normal;
      font-weight: 700;
      font-display: swap;
    }
    /* ── Design Tokens ─────────────────────────────────────────────────────
       Auchan storefront design system. Two rules carry the brand:
       red is identity and promo only, green is the action colour, and the
       neutrals are a cool blue-grey family built around the navy ink. */
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;

      /* Brand — logo, promo badges, selection. Never a bare action. */
      --brand:       #ED002E;
      --brand-hover: #D40029;
      --brand-tint:  rgba(237, 0, 46, 0.08);

      /* Action — cart, add, confirm, in-stock */
      --action:       #00AC6C;
      --action-hover: #00985F;
      --action-deep:  #007B4D;
      --action-tint:  #E8F9F2;

      /* Ink and neutrals */
      --bg:        #FAFAFA;
      --surface:   #FFFFFF;
      --surface-2: #EEF5FB;
      --surface-3: #D6E1EC;
      --text:      #01172A;
      --text-2:    #3C617E;
      --text-3:    #6B879E;
      --text-mute: #747474;
      --sep:       #D6E1EC;
      --sep-strong:#B0C4D5;

      /* Semantic */
      --green:      #00AC6C;
      --green-deep: #007B4D;
      --green-tint: #E8F9F2;
      --red:        #ED002E;
      --red-tint:   rgba(237, 0, 46, 0.08);
      --blue:       #3FA9F5;
      --blue-tint:  #EEF5FB;
      --amber:      #FFCE42;
      --amber-tint: rgba(255, 206, 66, 0.20);
      --amber-deep: #9A6B00;

      /* Aliases — every rule that should read as brand keeps using these. */
      --accent:       var(--brand);
      --accent-hover: var(--brand-hover);
      --accent-light: var(--brand-tint);

      /* Spacing — 4pt scale */
      --s-1:  4px;
      --s-2:  8px;
      --s-3: 12px;
      --s-4: 16px;
      --s-5: 20px;
      --s-6: 24px;
      --s-7: 32px;

      /* Type scale */
      --fs-2xs: 10px;
      --fs-xs:  12px;
      --fs-sm:  13px;
      --fs-md:  14px;
      --fs-lg:  16px;
      --fs-xl:  20px;
      --fs-2xl: 28px;

      /* Radius */
      --r-xs:    6px;
      --r-sm:    8px;
      --r-md:   12px;
      --r-lg:   16px;
      --r-xl:   20px;
      --r-pill: 999px;

      /* Elevation — surfaces are flat, shadow is reserved for overlays. */
      --sh-sm: none;
      --sh-md: 0 4px 16px rgba(1, 23, 42, .10);
      --sh-lg: 0 16px 40px rgba(1, 23, 42, .18);

      --card-border: 1px solid var(--sep);
    }

    /* ── Dark mode ──────────────────────────────────────────────────────────
       Driven by the Home Assistant theme when the panel can read it (the host
       then carries [theme-known]); otherwise it falls back to the OS setting,
       so an older core still gets a sensible dark mode. The two selectors are
       mutually exclusive: [dark] is only ever set alongside [theme-known]. */
    :host([dark]) { ${DARK_PALETTE} }

    @media (prefers-color-scheme: dark) {
      :host(:not([theme-known])) { ${DARK_PALETTE} }
    }

    /* ── Root layout ── */
    .panel-root {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg);
      color: var(--text);
      overflow: hidden;
    }

    .panel-root--desktop .desktop-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Header — compact single row ── */
    .panel-header {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      padding: 0 var(--s-4);
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
      height: 60px;
    }

    /* HA Home / Back button */
    .hdr-home-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: var(--surface-2);
      color: var(--text-2);
      border-radius: var(--r-sm);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 140ms, color 140ms;
    }
    .hdr-home-btn:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      flex-shrink: 0;
      margin-right: var(--s-1);
      position: relative;
      padding-right: var(--s-3);
    }

    .brand-icon {
      width: 28px;
      height: 28px;
      background: var(--brand);
      color: white;
      border-radius: var(--r-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: var(--fs-lg);
      font-weight: 700;
      color: var(--brand);
      line-height: 1;
    }
    .brand-name small {
      display: block;
      color: var(--text-2);
      font: 700 8px/1 "Source Sans 3", sans-serif;
      letter-spacing: 1.2px;
      margin-top: var(--s-1);
    }

    /* Address pill — clickable */
    .header-pill {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      padding: var(--s-1) var(--s-2);
      background: var(--surface-2);
      border: 1px solid var(--sep);
      border-radius: var(--r-pill);
      color: var(--text-2);
      font-size: var(--fs-sm);
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      flex-shrink: 1;
      min-width: 0;
      max-width: 240px;
      transition: background 140ms, border-color 140ms;
      white-space: nowrap;
      overflow: hidden;
    }
    .header-pill:hover {
      background: var(--accent-light);
      border-color: var(--accent);
      color: var(--accent);
    }
    .pill-label {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    /* List selector row */
    .header-list-wrap {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      color: var(--text-3);
      flex: 1;
      min-width: 0;
      max-width: 220px;
    }

    .header-select {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: none;
      color: var(--text);
      padding: var(--s-1) var(--s-1);
      font-size: var(--fs-sm);
      font-weight: 600;
      outline: none;
      cursor: pointer;
      text-overflow: ellipsis;
      appearance: none;
      -webkit-appearance: none;
    }
    .header-select:focus { color: var(--accent); }

    /* Right actions cluster */
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      margin-left: auto;
      flex-shrink: 0;
    }

    .hdr-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-2);
      border-radius: var(--r-sm);
      cursor: pointer;
      transition: background 120ms, color 120ms;
    }
    .hdr-btn:hover { background: var(--surface-2); color: var(--accent); }
    .hdr-btn--active { color: var(--accent); background: var(--accent-light); }
    .hdr-btn--diag {} /* alias */

    .addr-missing {
      font-size: var(--fs-xs);
      color: var(--amber-deep);
      font-weight: 600;
      padding: var(--s-1) var(--s-2);
      background: var(--amber-tint);
      border-radius: var(--r-pill);
    }

    /* ── Diagnostics ── */
    .diagnostics {
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      align-items: center;
      font-size: var(--fs-xs);
      animation: slideDown 150ms ease-out;
      flex-shrink: 0;
    }

    .diag-row { display: flex; align-items: center; gap: var(--s-2); }
    .diag-label { color: var(--text-2); }
    .diag-val { font-family: "SF Mono", "Fira Code", monospace; color: var(--accent); background: var(--accent-light); padding: 1px var(--s-1); border-radius: 4px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
    .diag-val--missing { color: var(--red); background: var(--red-tint); }
    .diag-refresh-btn { margin-left: auto; font-size: var(--fs-xs); font-weight: 600; color: var(--blue); background: none; border: none; cursor: pointer; padding: var(--s-1) var(--s-2); border-radius: var(--r-xs); }
    .diag-refresh-btn:hover { background: var(--blue-tint); }

    /* ── Search ── */
    .search-wrap {
      position: relative;
      z-index: 100;
      flex-shrink: 0;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
    }

    .search-icon { color: var(--text-3); flex-shrink: 0; }

    .search-input {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--sep-strong);
      border-radius: var(--r-sm);
      color: var(--text);
      padding: var(--s-3) var(--s-4);
      font-size: var(--fs-md);
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
    }
    .search-input::placeholder { color: var(--text-3); }
    .search-input:focus {
      border-color: var(--action);
      box-shadow: 0 0 0 3px var(--action-tint);
    }

    .search-clear {
      background: none;
      border: none;
      color: var(--text-3);
      cursor: pointer;
      padding: var(--s-1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      transition: background 120ms;
    }
    .search-clear:hover { background: var(--surface-2); color: var(--text); }

    /* ── Search Results ── */
    .search-results {
      position: absolute;
      inset: 100% 0 auto 0;
      background: var(--surface);
      border: 1px solid var(--sep);
      border-top: none;
      max-height: 60vh;
      overflow-y: auto;
      box-shadow: var(--sh-lg);
      border-radius: 0 0 var(--r-md) var(--r-md);
      animation: slideDown 180ms ease-out;
    }

    .search-row {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      cursor: pointer;
      transition: background 100ms;
      border-bottom: 1px solid var(--sep);
    }
    .search-row:last-child { border-bottom: none; }
    .search-row:hover { background: var(--surface-2); }

    .search-thumb {
      width: 48px;
      height: 48px;
      object-fit: contain;
      border-radius: var(--r-xs);
      background: var(--surface-2);
      flex-shrink: 0;
    }
    .search-thumb--placeholder { display: flex; align-items: center; justify-content: center; }

    .search-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--s-1); }
    .search-name { font-size: var(--fs-xs); font-weight: 500; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
    .search-brand { font-size: var(--fs-xs); color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

    .search-price-col { display: flex; flex-direction: column; align-items: flex-end; gap: var(--s-1); flex-shrink: 0; }
    .search-price { font-size: var(--fs-md); font-weight: 700; color: var(--text); }
    .search-discount { font-size: var(--fs-xs); font-weight: 700; color: var(--green); background: var(--green-tint); padding: 1px var(--s-2); border-radius: var(--r-pill); }

    .search-add-btn {
      width: 34px; height: 34px;
      background: var(--action); color: white;
      border: none; border-radius: var(--r-xs);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 120ms, transform 120ms;
    }
    .search-add-btn:hover { background: var(--action-hover); }

    .search-skeleton {
      height: 64px;
      margin: var(--s-2) var(--s-4);
      border-radius: var(--r-sm);
      animation: shimmer 1.4s infinite;
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
    }

    /* ── Tabs ── */
    .tab-bar {
      display: flex;
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
      overflow-x: auto;
    }

    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--s-1);
      padding: var(--s-2) var(--s-1);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-3);
      cursor: pointer;
      font-size: var(--fs-2xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      transition: color 150ms, border-color 150ms;
      min-height: 49px;
      min-width: 44px;
    }

    .tab--active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    .tab-label { font-size: var(--fs-2xs); }

    /* ── Tab content ── */
    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--s-3);
    }

    /* Desktop sidebar */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--sep);
      overflow-y: auto;
      padding: var(--s-3);
    }

    .sidebar-nav { display: flex; flex-direction: column; gap: var(--s-4); }
    .sidebar-section { display: flex; flex-direction: column; gap: var(--s-1); }
    .sidebar-heading { font-size: var(--fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-3); padding: 0 var(--s-1) var(--s-2); margin: 0; border-bottom: 1px solid var(--sep); }
    .sidebar-item { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-3); border: none; background: none; border-radius: var(--r-sm); color: var(--text-2); cursor: pointer; font-size: var(--fs-md); font-weight: 500; width: 100%; transition: background 120ms; text-align: left; }
    .sidebar-item:hover { background: var(--surface-2); }
    .sidebar-item--active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
    .sidebar-count { margin-left: auto; font-size: var(--fs-xs); background: var(--surface-2); padding: var(--s-1) var(--s-2); border-radius: var(--r-pill); color: var(--text-2); }
    .sidebar-add-btn { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-3); border: 1px dashed var(--sep); background: none; border-radius: var(--r-sm); color: var(--text-3); cursor: pointer; font-size: var(--fs-sm); width: 100%; transition: all 120ms; }
    .sidebar-add-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
    .sidebar-addr { display: flex; align-items: center; gap: var(--s-1); }
    .sidebar-addr-main { display: flex; align-items: center; gap: var(--s-2); flex: 1; padding: var(--s-2) var(--s-3); border: none; background: none; border-radius: var(--r-sm); cursor: pointer; font-size: var(--fs-sm); font-weight: 500; color: var(--text-2); transition: background 120ms; }
    .sidebar-addr-main:hover { background: var(--surface-2); }
    .sidebar-addr--active .sidebar-addr-main { color: var(--accent); }
    .sidebar-addr-del { width: 28px; height: 28px; border: none; background: none; color: var(--text-3); cursor: pointer; border-radius: var(--r-xs); display: flex; align-items: center; justify-content: center; transition: background 120ms, color 120ms; }
    .sidebar-addr-del:hover { background: var(--red-tint); color: var(--red); }
    .dot-active { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: auto; }

    /* Desktop main content */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* ── Dashboard ── */
    .dash {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      padding-bottom: 80px;
    }

    .dash-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--s-5);
      background: var(--surface);
      border-radius: var(--r-lg);
      border: 1px solid var(--sep);
      box-shadow: var(--sh-sm);
      position: relative;
      overflow: hidden;
    }
    .dash-list-name { margin: 0 0 var(--s-2); font: 700 var(--fs-2xl)/1.1 inherit; color: var(--text); }
    .dash-total-label { font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); font-weight: 600; }
    .dash-total-val { font: 700 var(--fs-2xl)/1.1 inherit; color: var(--text); font-variant-numeric: tabular-nums; }
    .dash-hero-right { text-align: right; display: flex; flex-direction: column; gap: var(--s-1); z-index: 1; }

    .dash-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      font-size: var(--fs-xs);
      font-weight: 600;
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-pill);
    }
    .dash-chip--green { background: var(--green-tint); color: var(--green); }

    .bento {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--s-3);
    }

    .bento-card {
      background: var(--surface);
      border-radius: var(--r-md);
      border: var(--card-border, 1px solid var(--sep));
      box-shadow: var(--sh-sm);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      transition: transform 200ms, box-shadow 200ms;
    }
    .bento-card:hover { border-color: var(--sep-strong); }

    .stat-card {
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      border: none;
      text-align: left;
      color: var(--text);
    }
    .stat-card--alert { border-color: var(--red); background: var(--red-tint); }

    .stat-icon {
      width: 44px; height: 44px;
      border-radius: var(--r-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon--blue { background: var(--blue-tint); color: var(--blue); }
    .stat-icon--orange { background: var(--amber-tint); color: var(--amber-deep); }
    .stat-icon--red { background: var(--red-tint); color: var(--red); }
    .stat-icon--green { background: var(--green-tint); color: var(--green); }

    .stat-body { display: flex; flex-direction: column; }
    .stat-num { font-size: var(--fs-xl); font-weight: 700; line-height: 1.15; font-variant-numeric: tabular-nums; }
    .stat-name { font-size: var(--fs-xs); color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

    .card-section-title { font-size: var(--fs-sm); font-weight: 600; color: var(--text-2); margin: 0 0 var(--s-2); padding-bottom: var(--s-2); border-bottom: 1px solid var(--sep); }
    .cat-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border: none; background: none; width: 100%; cursor: pointer; color: var(--text); font-size: var(--fs-sm); transition: opacity 120ms; }
    .cat-row:hover { opacity: 0.7; }
    .cat-name { font-weight: 500; }
    .cat-badge { font-size: var(--fs-xs); font-weight: 700; background: var(--accent-light); color: var(--accent); padding: var(--s-1) var(--s-3); border-radius: var(--r-pill); }

    /* ── List View ── */
    .list-view { display: flex; flex-direction: column; gap: var(--s-3); }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: var(--s-1);
    }

    .filter-chips { display: flex; gap: var(--s-2); flex-shrink: 0; }

    .filter-chip {
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-pill);
      border: 1px solid var(--sep);
      background: var(--surface);
      color: var(--text-2);
      font-size: var(--fs-sm);
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 120ms;
    }
    .filter-chip--active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }

    .sort-select {
      margin-left: auto;
      flex-shrink: 0;
      background: var(--surface);
      border: 1px solid var(--sep);
      border-radius: var(--r-sm);
      color: var(--text-2);
      padding: var(--s-1) var(--s-2);
      font-size: var(--fs-xs);
      outline: none;
      cursor: pointer;
    }

    .product-list { list-style: none; margin: 0; padding: 0 0 80px; display: flex; flex-direction: column; gap: var(--s-2); }

    /* ── Product Card ── */
    .product-card {
      display: flex;
      background: var(--surface);
      border-radius: var(--r-md);
      border: var(--card-border, 1px solid var(--sep));
      box-shadow: var(--sh-sm);
      overflow: hidden;
      transition: transform 200ms, box-shadow 200ms;
    }
    .product-card:hover { border-color: var(--sep-strong); }
    .product-card--unchecked { opacity: 0.65; }
    .product-card--unavail { filter: grayscale(0.6); }

    .prod-thumb-wrap {
      width: 88px;
      min-width: 88px;
      background: var(--surface);
      border-right: 1px solid var(--sep);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-3);
      position: relative;
    }

    .prod-thumb {
      max-width: 68px;
      max-height: 68px;
      object-fit: contain;
    }
    .prod-thumb--fallback { color: var(--text-3); }

    .discount-badge {
      position: absolute;
      top: var(--s-1);
      left: var(--s-1);
      background: var(--brand);
      color: #fff;
      font-size: var(--fs-2xs);
      font-weight: 700;
      padding: 2px var(--s-1);
      border-radius: var(--r-xs);
    }

    .prod-body {
      flex: 1;
      min-width: 0;
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }

    .prod-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .prod-brand { font-size: var(--fs-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); }
    .prod-actions { display: flex; gap: var(--s-1); margin-top: -4px; margin-right: -6px; }

    .prod-name {
      font-size: var(--fs-md);
      font-weight: 500;
      line-height: 1.4;
      color: var(--text);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .prod-name a { color: inherit; text-decoration: none; }
    .prod-name a:hover { color: var(--accent); text-decoration: underline; }

    .prod-avail { display: flex; align-items: center; gap: var(--s-1); }
    .avail-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .avail-label { font-size: var(--fs-xs); font-weight: 700; }

    .prod-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--s-2);
      margin-top: auto;
      padding-top: var(--s-2);
    }

    .price-block { display: flex; flex-direction: column; }
    .price-current { font-size: var(--fs-lg); font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .price-original { font-size: var(--fs-xs); text-decoration: line-through; color: var(--text-mute); white-space: nowrap; }

    .prod-controls { display: flex; gap: var(--s-2); align-items: center; }

    .qty-control {
      display: flex;
      align-items: center;
      background: var(--surface-2);
      border-radius: var(--r-pill);
      padding: var(--s-1);
      gap: 0;
    }

    .qty-btn {
      width: 30px; height: 30px;
      border: none; background: var(--surface);
      border-radius: 50%;
      cursor: pointer;
      font-size: var(--fs-xl);
      line-height: 1;
      color: var(--text-2);
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--sh-sm);
      transition: background 120ms;
      flex-shrink: 0;
    }
    .qty-btn:hover { background: var(--text); color: white; }

    .qty-val {
      width: 30px;
      text-align: center;
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--text);
    }

    .cart-toggle-btn {
      background: var(--surface-3);
      color: var(--text-2);
      border: none;
      border-radius: var(--r-pill);
      padding: 0 var(--s-4);
      height: 32px;
      font-size: var(--fs-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;
      white-space: nowrap;
      min-width: 44px;
    }
    .cart-toggle-btn:hover { background: var(--text); color: white; }
    .cart-toggle-btn--active { background: var(--action); color: white; }
    .cart-toggle-btn--active:hover { background: var(--action-hover); }

    /* ── Shared Buttons ── */
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-3);
      border-radius: var(--r-xs);
      cursor: pointer;
      transition: background 120ms, color 120ms;
      flex-shrink: 0;
    }
    .icon-btn:hover { background: var(--surface-2); color: var(--text-2); }
    .icon-btn--watch-active { color: var(--amber-deep) !important; }
    .icon-btn--watch-active:hover { color: var(--amber-deep) !important; }
    .icon-btn--danger:hover { background: var(--red-tint); color: var(--red); }

    .primary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      background: var(--action);
      color: white;
      border: none;
      border-radius: var(--r-sm);
      padding: var(--s-3) var(--s-5);
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms, transform 150ms;
      text-decoration: none;
    }
    .primary-btn:hover { background: var(--action-hover); }
    .primary-btn[disabled] { opacity: 0.5; cursor: not-allowed; transform: none; }

    .secondary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      background: var(--surface-2);
      color: var(--text-2);
      border: 1px solid var(--sep);
      border-radius: var(--r-sm);
      padding: var(--s-3) var(--s-5);
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms;
    }
    .secondary-btn:hover { background: var(--surface-3); }

    /* ── Action Bar ── */
    .action-bar {
      display: flex;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      background: var(--surface);
      border-top: 1px solid var(--sep);
      flex-shrink: 0;
      box-shadow: 0 -4px 12px rgba(1, 23, 42, .05);
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      padding: var(--s-3);
      border-radius: var(--r-sm);
      border: 1px solid var(--sep);
      background: var(--surface-2);
      color: var(--text);
      cursor: pointer;
      font-size: var(--fs-md);
      font-weight: 600;
      transition: all 150ms;
      min-height: 48px;
    }
    .action-btn:hover { background: var(--surface-3); }
    .action-btn--primary {
      background: var(--action);
      color: white;
      border: none;
    }
    .action-btn--primary:hover { background: var(--action-hover); }

    /* ── Map View ── */
    .map-view { display: flex; flex-direction: column; gap: var(--s-3); height: 100%; }
    .leaflet-iframe {
      width: 100%; height: 320px;
      border: 1px solid var(--sep);
      border-radius: var(--r-md);
      background: var(--surface-2);
      flex-shrink: 0;
    }

    .pickup-list { list-style: none; margin: 0; padding: 0 0 80px; display: flex; flex-direction: column; gap: var(--s-2); }

    .map-stores-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--s-1);
    }

    .section-heading { font: 700 var(--fs-xl)/1.2 inherit; color: var(--text); margin: 0; }

    .pickup-skeleton { display: flex; flex-direction: column; gap: var(--s-2); }
    .pickup-skel-row { height: 64px; border-radius: var(--r-md); }

    .pickup-item {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
      border: 1px solid var(--sep);
      border-radius: var(--r-md);
      box-shadow: var(--sh-sm);
      transition: transform 150ms, box-shadow 150ms;
    }
    .pickup-item:hover { border-color: var(--sep-strong); }
    .pickup-item--best { border-color: var(--accent); border-width: 2px; }

    .pickup-icon { color: var(--accent); flex-shrink: 0; }
    .pickup-info { flex: 1; display: flex; flex-direction: column; gap: var(--s-1); }
    .pickup-name { font-size: var(--fs-md); font-weight: 600; color: var(--text); }
    .pickup-addr { font-size: var(--fs-xs); color: var(--text-3); }
    .pickup-right { display: flex; align-items: center; gap: var(--s-1); flex-shrink: 0; }
    .pickup-dist { font-size: var(--fs-sm); font-weight: 700; color: var(--accent); }

    /* ── Recipes ── */
    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--s-3);
      padding-bottom: 80px;
    }

    .recipe-card {
      background: var(--surface);
      border-radius: var(--r-md);
      border: 1px solid var(--sep);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 150ms, box-shadow 150ms;
    }
    .recipe-card:hover { border-color: var(--sep-strong); }

    .recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .recipe-img--placeholder { display: flex; align-items: center; justify-content: center; background: var(--surface-2); height: 110px; color: var(--text-3); }

    .recipe-body { padding: var(--s-2) var(--s-3); flex: 1; }
    .recipe-title { font-size: var(--fs-sm); font-weight: 600; color: var(--text); margin: 0 0 var(--s-1); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .recipe-meta { display: flex; gap: var(--s-2); flex-wrap: wrap; }
    .recipe-meta span { font-size: var(--fs-xs); color: var(--text-3); }

    .recipe-actions {
      display: flex;
      gap: var(--s-2);
      padding: var(--s-2) var(--s-3);
      border-top: 1px solid var(--sep);
    }
    .recipe-btn {
      display: flex; align-items: center; gap: var(--s-1);
      font-size: var(--fs-xs); font-weight: 600;
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-xs);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background 120ms;
    }
    .recipe-btn--link { background: var(--surface-2); color: var(--blue); }
    .recipe-btn--link:hover { background: var(--blue-tint); }
    .recipe-btn--add { background: var(--accent-light); color: var(--accent); }
    .recipe-btn--add:hover { background: var(--brand-tint); }

    /* ── Recipes enhanced ── */
    .recipes-header { display: flex; align-items: center; justify-content: space-between; padding: 0 var(--s-1) var(--s-3); }
    .recipes-count { font-size: var(--fs-xs); font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

    .recipes-skeleton { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--s-3); }
    .recipe-skel-card { background: var(--surface); border-radius: var(--r-md); overflow: hidden; }
    .skel-img { width: 100%; height: 110px; }

    .recipe-img-wrap { position: relative; background: var(--surface-2); }
    .recipe-img-wrap .recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .recipe-img-wrap .recipe-img--placeholder { display: flex; align-items: center; justify-content: center; height: 110px; color: var(--text-3); }
    .recipe-badge {
      position: absolute; bottom: 6px; right: 6px;
      background: rgba(1, 23, 42, .55); color: white;
      font-size: var(--fs-2xs); font-weight: 700; padding: var(--s-1) var(--s-2);
      border-radius: var(--r-pill); backdrop-filter: blur(4px);
    }
    .recipe-card { cursor: pointer; }

    /* ── Recipe Modal ── */
    .recipe-modal { border-radius: var(--r-xl); padding: 0; overflow: hidden; gap: 0; }

    .recipe-modal-title-wrap { flex: 1; display: flex; flex-direction: column; gap: var(--s-1); }
    .recipe-modal-meta { font-size: var(--fs-xs); color: var(--text-3); font-weight: 500; }
    .recipe-modal .modal-header { padding: var(--s-4) var(--s-4) var(--s-3); border-bottom: 1px solid var(--sep); }

    .recipe-modal-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
      flex-shrink: 0;
    }

    .recipe-modal-loading {
      display: flex; align-items: center; gap: var(--s-3);
      padding: var(--s-6) var(--s-4); color: var(--text-2); font-size: var(--fs-md);
    }

    /* ── Ingredients checklist ── */
    .ingredients-section { padding: var(--s-3) var(--s-4) 0; }
    .ingredients-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--s-2); }
    .ingredients-sel-actions { display: flex; gap: var(--s-2); }

    .text-btn {
      background: none; border: none;
      color: var(--accent); font-size: var(--fs-xs); font-weight: 600;
      cursor: pointer; padding: var(--s-1) var(--s-2); border-radius: var(--r-xs);
      transition: background 120ms;
    }
    .text-btn:hover { background: var(--accent-light); }

    .recipe-ingredients-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-1); max-height: 240px; overflow-y: auto; }
    .recipe-no-ing { font-size: var(--fs-sm); color: var(--text-3); padding: var(--s-3) 0; text-align: center; }
    .recipe-no-ing--safe { display: flex; flex-direction: column; gap: var(--s-1); padding: var(--s-4); border: 1px solid var(--sep); border-left: 3px solid var(--accent); border-radius: var(--r-sm); background: var(--surface-2); text-align: left; }
    .recipe-no-ing--safe strong { color: var(--text); font-size: var(--fs-sm); }
    .recipe-no-ing--safe span { line-height: 1.35; }

    .recipe-ing-item {
      display: flex; align-items: center; gap: var(--s-3);
      padding: var(--s-2) var(--s-3);
      border-radius: var(--r-sm);
      background: var(--surface-2);
      cursor: pointer;
      transition: background 120ms;
      user-select: none;
    }
    .recipe-ing-item:hover { background: var(--surface-3); }
    .recipe-ing-item--checked { background: var(--accent-light); }

    .recipe-ing-check {
      width: 20px; height: 20px; min-width: 20px;
      border: 1.5px solid var(--sep);
      border-radius: var(--r-xs);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--fs-xs); font-weight: 700; color: var(--accent);
      background: var(--surface);
      transition: all 120ms;
    }
    .recipe-ing-item--checked .recipe-ing-check { background: var(--accent); color: white; border-color: var(--accent); }
    .recipe-ing-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--s-1); }
    .recipe-ing-name { font-size: var(--fs-sm); line-height: 1.25; color: var(--text); }
    .recipe-ing-name strong { color: var(--accent); font-variant-numeric: tabular-nums; }
    .recipe-ing-meta { display: flex; align-items: center; gap: var(--s-1); color: var(--text-3); font-size: var(--fs-2xs); letter-spacing: .02em; }
    .recipe-ing-meta strong { color: var(--accent); font-size: var(--fs-xs); font-variant-numeric: tabular-nums; }
    .recipe-ing-thumb { width: 42px; height: 42px; flex: 0 0 42px; object-fit: contain; border-radius: var(--r-xs); background: var(--surface); }

    /* ── Import actions ── */
    .recipe-import-actions { padding: var(--s-3) var(--s-4) var(--s-4); display: flex; flex-direction: column; gap: var(--s-3); border-top: 1px solid var(--sep); margin-top: var(--s-2); }
    .recipe-list-selector { display: flex; align-items: center; gap: var(--s-2); }
    .recipe-list-label { font-size: var(--fs-sm); font-weight: 600; color: var(--text-2); white-space: nowrap; display: flex; align-items: center; gap: var(--s-1); }
    .recipe-list-selector .header-select { flex: 1; }
    .recipe-import-btns { display: flex; gap: var(--s-2); align-items: stretch; }

    /* ── Import result ── */
    .recipe-import-result { padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-3); }
    .import-result-row { display: flex; align-items: center; gap: var(--s-3); font-size: var(--fs-md); font-weight: 500; color: var(--text); }
    .import-not-found { display: flex; flex-wrap: wrap; gap: var(--s-2); align-items: center; }
    .import-not-found-label { font-size: var(--fs-xs); font-weight: 600; color: var(--text-3); }
    .import-not-found-item { font-size: var(--fs-xs); background: var(--red-tint); color: var(--red); padding: var(--s-1) var(--s-2); border-radius: var(--r-pill); }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 23, 42, .60);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 150ms ease;
    }

    @media (min-width: 480px) {
      .modal-overlay { align-items: center; }
    }

    .modal-card {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      padding: var(--s-5);
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      box-shadow: 0 -4px 32px rgba(1, 23, 42, .20);
      animation: slideUp 200ms ease-out;
      max-height: 90vh;
      overflow-y: auto;
    }

    @media (min-width: 480px) {
      .modal-card { border-radius: var(--r-xl); animation: popIn 200ms ease-out; box-shadow: var(--sh-lg); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--fs-lg);
      font-weight: 700;
    }
    .modal-title { display: flex; align-items: center; gap: var(--s-2); }

    .modal-card--addr { max-width: 400px; }

    .qr-container { background: white; padding: var(--s-3); border-radius: var(--r-md); align-self: center; }
    .url-row { display: flex; gap: var(--s-2); width: 100%; }
    .url-input { flex: 1; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-sm); color: var(--text-3); padding: var(--s-2) var(--s-3); font-size: var(--fs-xs); outline: none; overflow: hidden; text-overflow: ellipsis; }

    /* ── Address Modal Fields ── */
    .addr-field { display: flex; flex-direction: column; gap: var(--s-2); }
    .field-label { font-size: var(--fs-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); }
    .chip-row { display: flex; gap: var(--s-2); flex-wrap: wrap; }
    .chip { padding: var(--s-2) var(--s-4); border-radius: var(--r-pill); border: 1.5px solid var(--sep); background: var(--surface-2); color: var(--text-2); cursor: pointer; font-size: var(--fs-sm); font-weight: 500; transition: all 120ms; }
    .chip--active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    .input-wrap { position: relative; display: flex; align-items: center; gap: var(--s-2); }
    .suggestions { list-style: none; margin: 0; padding: 0; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-md); max-height: 180px; overflow-y: auto; animation: slideDown 150ms ease-out; }
    .suggestion-row { display: flex; align-items: flex-start; gap: var(--s-2); padding: var(--s-2) var(--s-3); cursor: pointer; border-bottom: 1px solid var(--sep); transition: background 100ms; font-size: var(--fs-sm); color: var(--text); }
    .suggestion-row:last-child { border-bottom: none; }
    .suggestion-row:hover { background: var(--surface); }
    .addr-selected { display: flex; align-items: center; gap: var(--s-2); font-size: var(--fs-sm); color: var(--green); padding: var(--s-2) var(--s-3); background: var(--green-tint); border-radius: var(--r-sm); border: 1px solid var(--green); }
    .addr-actions { display: flex; justify-content: space-between; gap: var(--s-3); }

    /* ── Custom Dialog ── */
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 23, 42, .50);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 120ms ease;
    }

    .dialog-sheet {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      padding: var(--s-6) var(--s-5);
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      animation: slideUp 180ms ease-out;
    }

    @media (min-width: 480px) {
      .dialog-overlay { align-items: center; }
      .dialog-sheet { border-radius: var(--r-xl); }
    }

    .dialog-message { margin: 0; font-size: var(--fs-lg); font-weight: 600; color: var(--text); text-align: center; }
    .dialog-input { background: var(--surface-2); border: 1.5px solid var(--sep); border-radius: var(--r-sm); color: var(--text); padding: var(--s-3); font-size: var(--fs-md); outline: none; width: 100%; box-sizing: border-box; transition: border-color 150ms; }
    .dialog-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .dialog-actions { display: flex; gap: var(--s-3); }
    .dialog-btn { flex: 1; padding: var(--s-3); border: none; border-radius: var(--r-sm); font-size: var(--fs-lg); font-weight: 600; cursor: pointer; transition: background 150ms; min-height: 48px; }
    .dialog-btn--cancel { background: var(--surface-2); color: var(--text-2); }
    .dialog-btn--cancel:hover { background: var(--surface-3); }
    .dialog-btn--confirm { background: var(--action); color: white; }
    .dialog-btn--confirm:hover { background: var(--action-hover); }
    .dialog-btn--danger { background: var(--red); color: white; }
    .dialog-btn--danger:hover { background: var(--brand-hover); }

    /* ── Spinner ── */
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--sep);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 600ms linear infinite;
      flex-shrink: 0;
    }
    .spinner--sm { width: 14px; height: 14px; }
    .spinner--lg { width: 36px; height: 36px; border-width: 3px; }

    /* ── Skeleton ── */
    .skeleton-card {
      height: 100px;
      background: var(--surface) !important;
    }

    .skeleton {
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: var(--r-xs);
    }

    .skeleton-img { width: 68px; height: 68px; border-radius: var(--r-sm); }
    .skeleton-body { flex: 1; display: flex; flex-direction: column; gap: var(--s-2); padding: var(--s-4); }
    .skeleton-line { height: 12px; border-radius: var(--r-xs); }
    .skeleton-line--short { width: 40%; }
    .skeleton-line--med { width: 65%; }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--s-3);
      padding: 60px var(--s-5);
      text-align: center;
      color: var(--text-2);
    }
    .empty-state h3 { margin: 0; font-size: var(--fs-xl); font-weight: 700; color: var(--text); }
    .empty-state p { margin: 0; font-size: var(--fs-md); color: var(--text-3); }

    .loading-center { display: flex; flex-direction: column; align-items: center; gap: var(--s-3); padding: 60px var(--s-5); color: var(--text-3); font-size: var(--fs-md); }

    /* ── Toast ── */
    .toast {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      padding: var(--s-3) var(--s-5);
      border-radius: var(--r-sm);
      font-size: var(--fs-md);
      font-weight: 600;
      animation: toastIn 200ms ease-out, toastOut 250ms 3s ease-in forwards;
      box-shadow: var(--sh-lg);
      white-space: nowrap;
      max-width: 90vw;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .toast--success { background: var(--green); color: white; }
    .toast--info    { background: var(--blue); color: white; }
    .toast--error   { background: var(--red); color: white; }

    /* ── Animations ── */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }

    /* ── Icon helper ── */
    .icon svg { width: 100%; height: 100%; }

    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    [tabindex]:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: .55;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 1ms !important;
      }
    }

    /* ── Chef AI ── */
    .chef-view { max-width: 1180px; margin: 0 auto; padding-bottom: 92px; }
    .chef-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-6); margin: var(--s-1) 0 var(--s-5); }
    .chef-header h1, .chef-plan h2 { margin: var(--s-1) 0 var(--s-2); font: 700 var(--fs-2xl)/1.15 inherit; color: var(--text); }
    .chef-header p, .chef-plan-head p { margin: 0; color: var(--text-2); line-height: 1.45; }
    .chef-kicker { color: var(--accent); text-transform: uppercase; letter-spacing: .09em; font-size: var(--fs-xs); font-weight: 800; }
    .chef-account { display: flex; align-items: center; gap: var(--s-2); color: var(--text-3); font-size: var(--fs-xs); }
    .chef-account > span { display: flex; align-items: center; gap: var(--s-2); }
    .chef-account i, .chef-waiting i { width: 8px; height: 8px; display: inline-block; border-radius: 50%; background: var(--action); box-shadow: 0 0 0 4px var(--action-tint); }

    .chef-composer { position: relative; padding: var(--s-4); background: var(--surface); border: 1px solid var(--sep); border-radius: var(--r-xl); box-shadow: var(--sh-md); }
    .chef-composer textarea { width: 100%; min-height: 94px; resize: vertical; box-sizing: border-box; padding: var(--s-1) 52px var(--s-3) var(--s-1); border: 0; outline: 0; color: var(--text); background: transparent; font: 500 16px/1.45 inherit; }
    .chef-send { position: absolute; right: 16px; top: 16px; width: 42px; height: 42px; display: grid; place-items: center; color: #fff; background: var(--action); border: 0; border-radius: var(--r-md); cursor: pointer; }
    .chef-chips { display: flex; gap: var(--s-2); flex-wrap: wrap; padding-top: var(--s-3); border-top: 1px solid var(--sep); }
    .chef-chips button { padding: var(--s-2) var(--s-3); border: 1px solid var(--sep); border-radius: var(--r-pill); color: var(--text-2); background: var(--surface-2); font-size: var(--fs-xs); cursor: pointer; }
    .chef-chips button:hover { border-color: var(--accent); color: var(--accent); }

    .chef-settings { margin-bottom: var(--s-4); padding: var(--s-4); background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-lg); }
    .chef-settings-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--s-3); }
    .chef-settings label { display: flex; flex-direction: column; gap: var(--s-2); color: var(--text-2); font-size: var(--fs-xs); font-weight: 700; }
    .chef-settings input, .chef-settings select, .chef-import-bar select { min-height: 40px; padding: var(--s-2) var(--s-3); box-sizing: border-box; border: 1px solid var(--sep); border-radius: var(--r-sm); color: var(--text); background: var(--surface); font: inherit; }
    .chef-settings .chef-wide { grid-column: span 3; }
    .chef-save { margin-top: var(--s-3); }

    .chef-loading, .chef-thinking { min-height: 180px; display: flex; align-items: center; justify-content: center; gap: var(--s-4); color: var(--text-2); }
    .chef-thinking { min-height: 120px; margin-top: var(--s-4); border: 1px dashed var(--sep); border-radius: var(--r-lg); }
    .chef-thinking > div:last-child { display: flex; flex-direction: column; gap: var(--s-1); }
    .chef-thinking span { font-size: var(--fs-xs); color: var(--text-3); }
    .chef-onboarding { min-height: 360px; max-width: 560px; margin: var(--s-6) auto; padding: var(--s-7); box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-3); text-align: center; background: var(--surface); border: 1px solid var(--sep); border-radius: var(--r-xl); box-shadow: var(--sh-md); }
    .chef-onboarding h2 { margin: 0; font: 700 var(--fs-2xl)/1.15 inherit; }
    .chef-onboarding p { max-width: 470px; margin: 0 0 var(--s-1); color: var(--text-2); line-height: 1.55; }
    .chef-avatar { width: 54px; height: 54px; display: grid; place-items: center; border-radius: var(--r-lg); color: #fff; background: linear-gradient(145deg, var(--brand), #FF5C74); font: 700 var(--fs-lg)/1 inherit; }
    .chef-error { padding: var(--s-2) var(--s-3); border-radius: var(--r-sm); color: var(--brand-hover); background: var(--brand-tint); font-size: var(--fs-xs); }
    .chef-device-code { width: 100%; display: flex; flex-direction: column; align-items: center; gap: var(--s-3); }
    .chef-device-code > strong { padding: var(--s-3) var(--s-5); border: 1px dashed var(--accent); border-radius: var(--r-md); background: var(--accent-light); color: var(--accent); font: 800 25px/1 monospace; letter-spacing: .12em; }
    .chef-device-code > div { display: flex; gap: var(--s-2); }
    .chef-waiting { display: flex; align-items: center; gap: var(--s-2); color: var(--text-3); font-size: var(--fs-xs); }

    .chef-clarification { margin-top: var(--s-4); padding: var(--s-5); display: flex; align-items: center; gap: var(--s-4); border: 1px solid var(--sep); border-radius: var(--r-lg); background: var(--surface); }
    .chef-clarification .chef-avatar { width: 42px; height: 42px; border-radius: var(--r-md); }
    .chef-clarification p { margin: var(--s-1) 0 0; color: var(--text-2); }
    .chef-plan { margin-top: var(--s-4); overflow: hidden; border: 1px solid var(--sep); border-radius: var(--r-xl); background: var(--surface); box-shadow: var(--sh-sm); }
    .chef-plan-head { padding: var(--s-6); display: flex; justify-content: space-between; gap: var(--s-5); background: linear-gradient(135deg, var(--surface), var(--accent-light)); }
    .chef-plan-head > div:first-child { max-width: 720px; }
    .chef-plan h2 { font-size: var(--fs-2xl); }
    .chef-meta { display: flex; align-items: flex-start; gap: var(--s-2); flex-wrap: wrap; justify-content: flex-end; }
    .chef-meta span { padding: var(--s-2) var(--s-2); border-radius: var(--r-pill); color: var(--text-2); background: var(--surface); border: 1px solid var(--sep); font-size: var(--fs-xs); font-weight: 700; }
    .chef-plan-section { padding: var(--s-5) var(--s-6); border-top: 1px solid var(--sep); }
    .chef-plan-section h3 { margin: 0 0 var(--s-1); font: 700 var(--fs-xl)/1.2 inherit; }
    .chef-help { margin: 0 0 var(--s-4); color: var(--text-3); font-size: var(--fs-xs); }
    .chef-ingredients { display: flex; flex-direction: column; gap: var(--s-4); }
    .chef-ingredient { display: grid; grid-template-columns: minmax(160px, .7fr) minmax(0, 2fr); gap: var(--s-4); align-items: start; }
    .chef-ingredient-title { display: flex; gap: var(--s-2); align-items: flex-start; padding-top: var(--s-2); }
    .chef-ingredient-title > span { width: 24px; height: 24px; display: grid; place-items: center; flex: 0 0 24px; border-radius: var(--r-sm); color: var(--accent); background: var(--accent-light); font-size: var(--fs-xs); font-weight: 800; }
    .chef-ingredient-title div { display: flex; flex-direction: column; gap: var(--s-1); }
    .chef-ingredient-title strong { font-size: var(--fs-md); color: var(--text); }
    .chef-ingredient-title small { color: var(--text-3); }
    .chef-ingredient-title button { align-self: flex-start; margin: var(--s-1) 0 0; padding: 0; border: 0; color: var(--accent); background: transparent; font-size: var(--fs-2xs); cursor: pointer; }
    .chef-products { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--s-2); }
    .chef-product { position: relative; min-width: 0; padding: var(--s-2); display: flex; align-items: center; gap: var(--s-2); text-align: left; color: var(--text); background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-md); cursor: pointer; }
    .chef-product:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--sep)); }
    .chef-product--selected { border: 2px solid var(--accent); padding: var(--s-2); background: var(--accent-light); }
    .chef-product-check { position: absolute; right: 7px; top: 7px; width: 18px; height: 18px; display: grid; place-items: center; color: #fff; background: var(--accent); border-radius: 50%; font-size: var(--fs-2xs); }
    .chef-product:not(.chef-product--selected) .chef-product-check { background: transparent; border: 1px solid var(--sep); }
    .chef-product img, .chef-product-placeholder { width: 54px; height: 54px; flex: 0 0 54px; object-fit: contain; border-radius: var(--r-sm); background: #fff; }
    .chef-product-placeholder { display: grid; place-items: center; color: var(--text-3); }
    .chef-product-copy { min-width: 0; display: flex; flex-direction: column; gap: var(--s-1); padding-right: var(--s-4); }
    .chef-product-copy strong { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: var(--fs-xs); line-height: 1.25; }
    .chef-product-copy small { color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: var(--fs-2xs); }
    .chef-product-copy span { color: var(--text-2); font-size: var(--fs-2xs); }
    .chef-product-copy b { color: var(--accent); font-size: var(--fs-xs); }
    .chef-no-match { padding: var(--s-3); border-radius: var(--r-md); color: var(--text-3); background: var(--surface-2); font-size: var(--fs-xs); }
    .chef-steps ol { margin: var(--s-4) 0 0; padding-left: var(--s-6); display: grid; gap: var(--s-2); color: var(--text-2); line-height: 1.45; }
    .chef-import-bar { position: sticky; bottom: 0; padding: var(--s-3) var(--s-5); display: flex; align-items: center; justify-content: flex-end; gap: var(--s-3); border-top: 1px solid var(--sep); background: color-mix(in srgb, var(--surface) 92%, transparent); backdrop-filter: blur(12px); }
    .chef-import-bar > div { margin-right: auto; display: flex; flex-direction: column; }
    .chef-import-bar > div span { color: var(--text-3); font-size: var(--fs-xs); }

    @media (max-width: 1050px) {
      .chef-products { grid-template-columns: 1fr; }
    }
    @media (max-width: 767px) {
      .chef-view { padding-bottom: 120px; }
      .chef-header, .chef-plan-head { flex-direction: column; }
      .chef-account { width: 100%; flex-wrap: wrap; }
      .chef-settings-grid { grid-template-columns: 1fr; }
      .chef-settings .chef-wide { grid-column: auto; }
      .chef-ingredient { grid-template-columns: 1fr; }
      .chef-plan-section, .chef-plan-head { padding: var(--s-4); }
      .chef-meta { justify-content: flex-start; }
      .chef-import-bar { align-items: stretch; flex-direction: column; }
      .chef-import-bar > div { margin: 0; flex-direction: row; justify-content: space-between; }
      .chef-onboarding { min-height: 300px; margin: var(--s-3) auto; padding: var(--s-6) var(--s-5); }
    }

    /* ── Address Bottom Sheet (mobile) ── */
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(1, 23, 42, .55);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 150ms ease;
    }

    .sheet-card {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      max-height: 75vh;
      animation: slideUp 220ms cubic-bezier(.22,.68,0,1.2);
      box-shadow: 0 -8px 32px rgba(1, 23, 42, .25);
    }

    .sheet-handle {
      width: 36px;
      height: 4px;
      background: var(--surface-3);
      border-radius: var(--r-pill);
      margin: var(--s-3) auto 0;
      flex-shrink: 0;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      padding: var(--s-4) var(--s-4) var(--s-3);
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
    }
    .sheet-title {
      flex: 1;
      font-size: var(--fs-lg);
      font-weight: 700;
      color: var(--text);
    }

    .sheet-body {
      overflow-y: auto;
      flex: 1;
      padding: var(--s-2) 0;
    }

    .sheet-addr-row {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-4) var(--s-4);
      cursor: pointer;
      border-radius: 0;
      transition: background 100ms;
    }
    .sheet-addr-row:hover,
    .sheet-addr-row:active { background: var(--surface-2); }

    .sheet-addr-row--active {
      background: var(--accent-light);
    }
    .sheet-addr-row--active .sheet-addr-label { color: var(--accent); font-weight: 700; }
    .sheet-addr-row--active .sheet-addr-icon { color: var(--accent); }

    .sheet-addr-icon { color: var(--text-3); flex-shrink: 0; }
    .sheet-addr-info { flex: 1; min-width: 0; }
    .sheet-addr-label { font-size: var(--fs-md); font-weight: 600; color: var(--text); }
    .sheet-addr-sub { font-size: var(--fs-xs); color: var(--text-3); margin-top: var(--s-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sheet-addr-check { color: var(--accent); flex-shrink: 0; }

    .sheet-empty { padding: var(--s-6) var(--s-4); font-size: var(--fs-md); color: var(--text-3); text-align: center; margin: 0; }

    .sheet-footer {
      padding: var(--s-3) var(--s-4);
      border-top: 1px solid var(--sep);
      flex-shrink: 0;
      padding-bottom: max(16px, env(safe-area-inset-bottom));
    }

    .sheet-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      width: 100%;
      padding: var(--s-3);
      border: 1.5px dashed var(--sep);
      background: none;
      border-radius: var(--r-md);
      color: var(--text-2);
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;
    }
    .sheet-add-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

    /* ── Mobile bottom navigation ── */
    @media (max-width: 767px) {
      /* Push tab-content up to avoid overlap with bottom nav */
      .tab-content {
        padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px));
      }

      /* Hide top tab-bar on mobile — replaced by bottom nav */
      .tab-bar {
        display: none !important;
      }

      /* The bottom nav is fixed, so the action bar has to clear it. */
      .action-bar {
        margin-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
        padding-bottom: var(--s-3);
      }

      /* Fixed bottom nav bar — iOS style */
      .mobile-bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(56px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: var(--surface);
        border-top: 1px solid var(--sep);
        display: flex;
        z-index: 100;
        box-shadow: 0 -2px 12px rgba(1, 23, 42, .08);
      }

      .mobile-bottom-nav .tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--s-1);
        padding: var(--s-2) var(--s-1);
        background: none;
        border: none;
        border-top: 2px solid transparent;
        color: var(--text-3);
        cursor: pointer;
        font-size: var(--fs-2xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        transition: color 150ms, border-color 150ms;
        min-height: 44px;
      }

      .mobile-bottom-nav .tab--active {
        color: var(--accent);
        border-top-color: var(--accent);
      }

      .mobile-bottom-nav .tab-label { font-size: var(--fs-2xs); }
    }

    /* Desktop: hide bottom nav (handled by sidebar) */
    @media (min-width: 768px) {
      .mobile-bottom-nav { display: none !important; }
    }
  `;
}

if (!customElements.get("auchan-grocery-panel")) {
  customElements.define("auchan-grocery-panel", AuchanGroceryPanel);
}
