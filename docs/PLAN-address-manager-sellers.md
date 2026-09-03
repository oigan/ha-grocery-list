# Address Manager, RegionId Discovery & Sellers Map

> Document istoric de planificare. Implementarea curentă, inclusiv resursele
> locale, limitele de securitate și designul vizual, este descrisă în
> `README.md` și `docs/DESIGN_SYSTEM.md`; detaliile de mai jos pot reflecta
> decizii intermediare care au fost ulterior schimbate.

## ✅ Decizii Confirmate

| #   | Întrebare                          | Decizie                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Config flow simplificat?           | **DA** — setup minimal (email + interval); user adaugă adresele din panel după setup |
| 2   | Autocomplete via backend proxy?    | **DA** — `/api/auchan_grocery/geocode?q=...` proxied prin HA                         |
| 3   | Fallback regionId strategy?        | **geoCoordinates first → cod postal fallback** (dacă geoCoord fail CHK0119)          |
| 4   | Sellers vs Pickup Points separate? | **NU** — sunt același lucru; un seller = un pickup point fizic                       |
| 5   | Adresă per-listă sau globală?      | **Globală** — o singură adresă activă pentru toate listele                           |

---

## Obiectiv

Mutarea logicii de adresă/coordonate/cod postal din wizard-ul de setup HA (config_flow) într-un UI dinamic în cadrul panoului Lovelace, cu:

1. **Multi-adresă** — utilizatorul poate salva mai multe adrese (acasă, birou, etc.)
2. **Autocomplete adresă** în header — câmp de căutare cu sugestii de la Photon/Nominatim (similar Google Maps) — Leaflet este deja integrat!
3. **Selector adresă activă** — dropdown în header să aleagă adresa pentru care se generează lista
4. **Descoperire regionId** — explicat pas cu pas + expus în UI cu un buton "Diagnostics"
5. **VTEX Regions v2 → lista de sellers** — apel API real pe baza regionId + coordonate → returnează magazine/sellers
6. **Hartă Leaflet cu sellers** — marcheri pe hartă + selector pentru alegerea magazinului preferat

---

## User Review Required

> [!IMPORTANT]
> **Decizie arhitecturală: Adresele rămân și în config_flow?**
> Propunerea este ca setup-ul inițial să fie simplificat (doar email + interval), iar adresele să fie gestionate exclusiv din panel UI. Asta înseamnă că upgrade-ul pe integrări existente va reseta adresa stocată în config_entry.data la prima rulare.
> **Alternativă**: Păstrăm config_flow ca fallback, adăugăm adresele în storage separat (fără a atinge config_entry)

> [!WARNING]
> **VTEX Regions v2 vs v2.1** — Auchan.ro folosește endpoint-ul `/api/checkout/pub/regions/{regionId}` cu versiunea `v2.1BB18CE...`. Acest prefix `v2.1` este **hardcodat în regionId** (nu un path param), deci regionId-ul complet este trimis ca path param. Nu există un `v2.1` ca versiune de API separată — este o convenție de naming VTEX.
>
> Exemplul din request: `regionId = "v2.1BB18CE648B5111D0933734ED83EC783"` — deci regionId include prefixul versiunii.

> [!NOTE]
> **Leaflet este deja integrat** — `auchan-panel.js` încarcă Leaflet 1.9.4 lazy. Nu avem nevoie de biblioteci externe suplimentare pentru hartă sau geocoding visual.

---

## Cum funcționează regionId — Explicat

### Flow complet de descoperire regionId

```
1. User introduce adresă text (ex: "Str. Mihai Eminescu, București")
   ↓
2. Autocomplete: Photon API (photon.komoot.io) → lista candidați cu lat/lng
   ↓
3. User selectează candidatul dorit
   ↓
4. Reverse geocode → cod poștal (via Nominatim /reverse)
   ↓
5. VTEX Regions API:
   GET /api/checkout/pub/regions?country=ROU&postalCode=011002
   → Response: [{ "id": "v2.1BB18CE648B5111D0933...", "sellers": [...] }]
   ↓
6. regionId = data[0].id  ← acesta este regionId-ul complet

   * SAU alternativ cu geoCoordinates (dacă auchan.ro suportă):
   GET /api/checkout/pub/regions?country=ROU&geoCoordinates=-25.xxx&geoCoordinates=-44.xxx
   → același response format
```

### Sellers via regionId (pasul următor)

```
GET https://www.auchan.ro/api/checkout/pub/regions/{regionId}?country=ROU
    &geoCoordinates={lng}&geoCoordinates={lat}
    &individualShippingEstimates=true

→ Response: {
    "id": "v2.1BB18CE...",
    "sellers": [
      {
        "id": "1",
        "name": "Auchan Titan",
        "logo": "...",
        "fulfillmentEndpoints": [...]
      }
    ]
  }
```

Această listă de `sellers` reprezintă **magazinele Auchan care pot onora comenzi** pentru adresa ta.

---

## Proposed Changes

### Component 1: Backend — Storage pentru adrese

---

#### [MODIFY] [storage.py](file:///Users/eugen.predescu/Work/Git/utils/ha-auchan-grocery-list/custom_components/auchan_grocery/storage.py)

Adăugăm un nou dataclass `SavedAddress` și extindem `GroceryStorage` cu CRUD pentru adrese:

```python
@dataclass
class SavedAddress:
    id: str                    # uuid sau slug
    label: str                 # "Acasă", "Birou"
    display_name: str          # text afișat
    latitude: float
    longitude: float
    postal_code: str = ""
    region_id: str = ""        # cached regionId
    is_active: bool = False    # adresa curent selectată
    created_at: str = ...
```

Storage key rămâne același `auchan_grocery.grocery_lists`, extindem schema cu `"addresses": {}`.

**Metode noi în GroceryStorage:**

- `get_all_addresses() → list[SavedAddress]`
- `get_active_address() → SavedAddress | None`
- `add_address(address: SavedAddress) → bool`
- `delete_address(address_id: str) → bool`
- `set_active_address(address_id: str) → bool`
- `update_address_region_id(address_id, region_id) → bool`

---

#### [NEW] api/regions.py

Client nou dedicat VTEX Regions v2:

```python
class VtexRegionsClient:
    async def get_region_id(postal_code, country) -> str | None
    async def get_sellers_by_region(region_id, lat, lng) -> list[SellerInfo]
    async def get_sellers_by_address(postal_code, lat, lng) -> list[SellerInfo]

@dataclass
class SellerInfo:
    id: str
    name: str
    logo: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    fulfillment_endpoints: list[str] = field(default_factory=list)
```

Logica de `get_region_id` din `orderform.py` se mută COMPLET în `regions.py` (DRY). `orderform.py` va importa din `regions.py`.

---

#### [MODIFY] [api_views.py](file:///Users/eugen.predescu/Work/Git/utils/ha-auchan-grocery-list/custom_components/auchan_grocery/api_views.py)

Adăugăm endpoint-uri noi:

| Endpoint                                      | Metodă | Descriere                                   |
| --------------------------------------------- | ------ | ------------------------------------------- |
| `/api/auchan_grocery/addresses`               | GET    | Lista adreselor salvate                     |
| `/api/auchan_grocery/addresses`               | POST   | Adaugă adresă nouă                          |
| `/api/auchan_grocery/addresses/{id}`          | DELETE | Șterge adresă                               |
| `/api/auchan_grocery/addresses/{id}/activate` | POST   | Setează adresă activă                       |
| `/api/auchan_grocery/sellers`                 | GET    | Lista sellers pentru adresa activă          |
| `/api/auchan_grocery/geocode`                 | GET    | Autocomplete adresă `?q=...`                |
| `/api/auchan_grocery/region`                  | GET    | RegionId + diagnostics pentru adresa activă |

---

#### [MODIFY] [const.py](file:///Users/eugen.predescu/Work/Git/utils/ha-auchan-grocery-list/custom_components/auchan_grocery/const.py)

```python
VTEX_REGIONS_V2_ENDPOINT = "/api/checkout/pub/regions/{region_id}"
MAX_SAVED_ADDRESSES = 10
```

---

### Component 2: Backend — Config Flow Simplificat

---

#### [MODIFY] [config_flow.py](file:///Users/eugen.predescu/Work/Git/utils/ha-auchan-grocery-list/custom_components/auchan_grocery/config_flow.py)

**Simplificăm radical** — setup-ul inițial doar colectează:

- Email (opțional)
- Scan interval

Adresele vor fi gestionate din UI. La prima pornire, dacă există `CONF_LATITUDE` & `CONF_LONGITUDE` în config_entry (din instalarea veche), le migrăm automat ca prima `SavedAddress` în storage.

---

### Component 3: Frontend — Panel UI Extins

---

#### [MODIFY] [auchan-panel.js](file:///Users/eugen.predescu/Work/Git/utils/ha-auchan-grocery-list/www/auchan-grocery/auchan-panel.js)

##### 3A. Header — Address Manager Widget

```
┌─────────────────────────────────────────────────────────────┐
│ 🛒 Auchan Grocery   [📍 Acasă ▼] [+Adresă]  [📋 Lista ▼]  │
└─────────────────────────────────────────────────────────────┘
```

- Dropdown cu adresele salvate
- Buton `＋ Adresă` → deschide modal de adăugare
- Input de search cu autocomplete via `/api/auchan_grocery/geocode?q=...`
- La selectare sugestie → backend calculează regionId și salvează adresa

##### 3B. Modal „Adaugă Adresă"

```
┌─── Adaugă adresă nouă ─────────────────────────────────────┐
│ Label: [Acasă / Birou / Altul...]                          │
│ Caută: [🔍 Introduceți adresa...            ]              │
│        ↓ dropdown autocomplete Photon                      │
│        • Str. Mihai Eminescu 102, București                │
│ [Anulează]                      [Salvează adresa →]        │
└────────────────────────────────────────────────────────────┘
```

##### 3C. Tab Hartă — Sellers pe hartă

- Sellers (din VTEX Regions v2) marcați cu iconițe distincte față de pickup points
- Click pe seller → popup cu detalii + buton „Alege magazin"
- Lista sellers sub hartă cu buton „Alege ca magazin preferat"

##### 3D. Diagnostics (collapsible în tab Hartă)

Afișează:

- Adresa activă + coordonate + cod postal
- RegionId calculat + buton „Recalculează"
- CURL echivalent (copy-ready):
  ```
  curl 'https://www.auchan.ro/api/checkout/pub/regions/{regionId}?country=ROU&geoCoordinates={lng}&geoCoordinates={lat}'
  ```

---

## ✅ Decizii finale — toate confirmate, gata de implementare

---

## Verification Plan

### Automated Tests

```bash
pytest tests/ -v -k "address or region or seller"

curl -H "Authorization: Bearer $HA_TOKEN" \
  http://homeassistant.local:8123/api/auchan_grocery/addresses

curl -H "Authorization: Bearer $HA_TOKEN" \
  "http://homeassistant.local:8123/api/auchan_grocery/geocode?q=Auchan+Titan"

curl -H "Authorization: Bearer $HA_TOKEN" \
  "http://homeassistant.local:8123/api/auchan_grocery/sellers"

curl -H "Authorization: Bearer $HA_TOKEN" \
  "http://homeassistant.local:8123/api/auchan_grocery/region"
```

### Manual Verification

1. Adăugare adresă din panel → verifică că regionId e calculat și afișat
2. Switch adresă → sellers pe hartă se actualizează
3. Sellers pe hartă → iconițe distincte față de pickup points
4. Diagnostics CURL → copiezi și rulezi manual, primești același regionId

---

## Task Breakdown

### Phase 1 — Backend (Python)

- [ ] `api/regions.py` — `VtexRegionsClient` cu `get_region_id` + `get_sellers_by_region`
- [ ] `storage.py` — `SavedAddress` dataclass + CRUD în `GroceryStorage`
- [ ] `const.py` — constante noi
- [ ] `api_views.py` — 7 endpoint-uri noi
- [ ] `config_flow.py` — simplificare + migrare adresă existentă

### Phase 2 — Frontend (JavaScript)

- [ ] Header: dropdown adrese + buton adăugare
- [ ] Modal: câmp autocomplete + sugestii Photon
- [ ] API client: metode noi `getAddresses()`, `addAddress()`, `setActiveAddress()`, `getSellers()`
- [ ] Hartă: markers sellers + popup + selector magazin preferat
- [ ] Diagnostics collapsible

### Phase 3 — Integrare & Polish

- [ ] Migrare automată `config_entry.data` → `SavedAddress` la startup
- [ ] Persistare magazin preferat per-listă
- [ ] Notificări UI pentru erori geocoding / regionId

### Phase 4 — Teste

- [ ] Unit tests pentru `VtexRegionsClient`
- [ ] Unit tests pentru `GroceryStorage` address CRUD
- [ ] Test E2E manual cu HA real
