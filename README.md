# Auchan Grocery List pentru Home Assistant

Integrare neoficială Home Assistant pentru liste de cumpărături Auchan.ro,
prețuri și disponibilitate regională, adrese multiple, magazine apropiate,
rețete și linkuri de coș.

Versiune: **0.3.1** · Home Assistant: **2025.1+** · România

## Ce oferă

- până la 50 de liste și 100 de produse per listă;
- căutare produse Auchan, cu oferta și seller-ul selectat de VTEX;
- monitorizare la minimum 30 de minute pentru preț și stoc;
- adrese multiple, regionalizare VTEX și maximum 10 adrese salvate;
- hartă cu magazine/puncte pickup, cu fallback marcat ca neconfirmat;
- Chef AI conectat la abonamentul ChatGPT prin browser și cod de autorizare,
  fără cheie API;
- rețete personalizate, potrivire deterministă cu produse Auchan și alegerea
  explicită a SKU-ului înainte de import;
- link și cod QR add-to-cart, fără expunerea orderForm-ului intern de monitorizare;
- panou responsive, dark mode și active frontend livrate local.

## Instalare prin HACS

1. În HACS, adaugă `https://github.com/oigan/ha-grocery-list`
   ca repository de tip **Integration**.
2. Instalează **Auchan Grocery List** și repornește Home Assistant.
3. Deschide **Setări → Dispozitive și servicii → Adaugă integrare** și caută
   **Auchan Grocery List**.
4. După configurare, folosește panoul **Auchan Grocery** din bara laterală și
   adaugă o adresă pentru prețuri regionale.

Nu este necesară copierea manuală în `/config/www`; bundle-ul frontend este
servit din `custom_components/auchan_grocery/frontend`.

## Instalare manuală

Copiază directorul `custom_components/auchan_grocery` în
`/config/custom_components/auchan_grocery`, apoi repornește Home Assistant și
adaugă integrarea din UI.

## Servicii

| Serviciu | Scop |
|---|---|
| `auchan_grocery.create_list` | Creează o listă |
| `auchan_grocery.set_active_list` | Salvează lista activă |
| `auchan_grocery.rename_list` | Redenumește lista |
| `auchan_grocery.delete_list` | Șterge lista |
| `auchan_grocery.add_item` | Adaugă un SKU și seller |
| `auchan_grocery.remove_item` | Elimină un produs |
| `auchan_grocery.set_item_quantity` | Actualizează cantitatea |
| `auchan_grocery.toggle_in_cart` | Include/exclude din linkul de coș |
| `auchan_grocery.toggle_watch` | Activează monitorizarea |
| `auchan_grocery.search_and_add` | Caută și adaugă primul rezultat |
| `auchan_grocery.export_list` | Exportă lista într-o notificare HA |

Integrarea emite evenimentele `auchan_grocery_price_drop`,
`auchan_grocery_back_in_stock` și `auchan_grocery_out_of_stock`.

## Arhitectură și siguranță

Browserul comunică cu API-ul intern prin clientul autentificat Home Assistant;
tokenul nu este copiat în variabile globale. Panoul și endpoint-urile private
sunt disponibile doar administratorilor. Datele persistente sunt salvate prin
Home Assistant Storage, iar adresele și coordonatele nu sunt scrise în loguri.

Operațiile VTEX care modifică orderForm-ul sunt serializate. Retry automat este
folosit numai pentru cereri idempotente; răspunsul `Retry-After` este respectat.
OrderForm-urile sunt folosite intern pentru simulare și nu sunt trimise în
linkul de checkout al utilizatorului.

Servicii externe folosite: Auchan.ro/VTEX, Nominatim, Photon, tile-uri
OpenStreetMap și,
doar când edge-ul VTEX livrează o pagină de rețetă goală, serviciul public
Jina AI Reader pentru extragerea conținutului acelei pagini publice. Nu se trimit
date Home Assistant, adrese sau produse din liste către reader.
Integrarea nu cere chei API și nu colectează telemetrie proprie.

## Chef AI fără cheie API

Chef AI folosește un serviciu companion privat, inclus în directorul `bridge/`.
Acesta rulează Codex App Server și păstrează autentificarea ChatGPT într-un
volum propriu. Tokenul bridge-ului este doar o parolă internă între Home
Assistant și serviciu; nu este o cheie OpenAI.

În Coolify creează un serviciu Docker din `bridge/Dockerfile`, cu un volum
persistent montat la `/data/codex` și variabilele:

```text
BRIDGE_TOKEN=<minimum 24 caractere aleatoare>
PORT=8787
```

Nu publica portul direct pe internet dacă Home Assistant îl poate accesa prin
rețeaua Docker. În opțiunile integrării configurează URL-ul intern al
serviciului și același `BRIDGE_TOKEN`. Apoi intră în fila **Chef AI**, apasă
**Conectează ChatGPT**, deschide pagina oficială OpenAI afișată și introdu codul.

Pentru o instalare administrată pe același host, tokenul poate fi păstrat în
`/config/.storage/auchan_grocery_chef_token`; integrarea va folosi automat
`http://auchan-chef-bridge:8787` cât timp ambele containere sunt în aceeași
rețea Docker. Fișierul nu trebuie inclus în Git sau în backupuri publice.

Modelul nu poate furniza produse, prețuri sau SKU-uri. El produce numai rețeta
și termeni scurți de căutare. Home Assistant caută separat în catalogul VTEX,
respinge rezultate nerelevante/non-alimentare și reverifică SKU-ul ales chiar
înainte de import.

## Dezvoltare

```bash
npm install
npm run build
python -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/pytest -q
ruff check custom_components tests
ruff format --check custom_components tests
```

Sursa frontend este în `www/auchan-grocery/auchan-panel.js`; rezultatul HACS
este generat în `custom_components/auchan_grocery/frontend`.

## Limitări

- disponibilitatea și prețurile depind de API-urile publice Auchan/VTEX;
- magazinele statice de fallback sunt orientative și nu sunt marcate active;
- Nominatim este limitat global la o cerere pe secundă;
- deschiderea linkului de coș mută utilizatorul pe Auchan.ro pentru finalizare.

Detalii de design: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

## Licență și marcă

[MIT](LICENSE). Proiectul nu este afiliat cu Auchan România sau VTEX. Numele și
mărcile aparțin proprietarilor lor.
