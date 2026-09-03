# Auchan Grocery List pentru Home Assistant

Integrare neoficială Home Assistant pentru liste de cumpărături Auchan.ro,
prețuri și disponibilitate regională, adrese multiple, magazine apropiate,
rețete și linkuri de coș.

Versiune: **0.4.2** · Home Assistant: **2025.1+** · România

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

---

# Instalare

## Înainte de a începe

Ai nevoie de:

- Home Assistant **2025.1** sau mai nou;
- [HACS](https://hacs.xyz) instalat;
- drept de administrator în Home Assistant, fiindcă panoul și endpoint-urile
  private sunt rezervate administratorilor.

Nu ai nevoie de nicio cheie API și de nicio configurare în `configuration.yaml`.

## Pasul 1 — adaugă repository-ul în HACS

1. Deschide **HACS** din bara laterală.
2. Meniul **⋮** din dreapta sus → **Custom repositories**.
3. La *Repository* pune `https://github.com/oigan/ha-grocery-list`,
   la *Type* alege **Integration**, apoi **Add**.

## Pasul 2 — instalează integrarea

1. Caută **Auchan Grocery List** în HACS și deschide-o.
2. **Download** → confirmă versiunea propusă.

HACS copiază `custom_components/auchan_grocery` în configurația ta. Nu trebuie să
copiezi nimic în `/config/www`: bundle-ul frontend este servit direct de
integrare, din `custom_components/auchan_grocery/frontend`.

> Cât timp repository-ul nu are un tag de release, HACS afișează ca versiune
> hash-ul commit-ului, nu `0.4.2`. Integrarea funcționează normal; un tag
> `v0.4.2` ar activa doar afișarea versiunii și notificările de update.

## Pasul 3 — repornește Home Assistant

**Setări → Sistem → Repornire → Repornește Home Assistant.**

Repornirea este obligatorie: Home Assistant încarcă integrările Python o
singură dată, la pornire. Prima repornire după instalare durează mai mult decât
de obicei, fiindcă Home Assistant instalează dependențele declarate în manifest
(`beautifulsoup4` și `python-slugify`).

## Pasul 4 — adaugă integrarea

1. **Setări → Dispozitive și servicii → Adaugă integrare**.
2. Caută **Auchan Grocery List**.
3. Completează formularul:

   | Câmp | Obligatoriu | Implicit | Ce face |
   |---|---|---|---|
   | Email | nu | gol | Doar pentru pre-completarea coșului pe Auchan.ro. Poate rămâne gol. |
   | Interval de scanare | da | `30` minute | Cât de des se reverifică prețul și stocul. Valori: 30, 60, 360 sau 720. |
   | Prag scădere preț | da | `5` % | Sub ce procent de scădere nu se emite evenimentul de preț. |

Toate trei se pot schimba oricând din **Configurare**, fără reinstalare.

După confirmare apar patru entități:

| Entitate | Rol |
|---|---|
| `binary_sensor.auchan_grocery_auchan_conectat` | Starea conexiunii la Auchan; atributele `last_scan`, `successful_lists` și `errors` arată ultima scanare. |
| `select.auchan_grocery_lista_activa` | Lista pe care lucrează serviciile și butoanele. |
| `button.auchan_grocery_actualizeaza_preturi` | Forțează o reverificare imediată. |
| `button.auchan_grocery_genereaza_link_cos` | Construiește linkul add-to-cart pentru lista activă. |

Lista activă rămâne `unknown` până creezi prima listă. Este normal.

## Pasul 5 — adaugă o adresă

Deschide panoul **Auchan Grocery** din bara laterală și adaugă o adresă.

Nu sări peste pasul ăsta. Auchan livrează prețuri și stocuri **regionalizate**
prin VTEX, iar fără o adresă salvată integrarea nu are pe ce regiune să
interogheze: vei vedea produse, dar prețurile și disponibilitatea vor fi
nerelevante, iar harta de magazine va rămâne goală.

Poți salva până la 10 adrese și comuta între ele.

## Instalare manuală, fără HACS

1. Copiază directorul `custom_components/auchan_grocery` în
   `/config/custom_components/auchan_grocery`.
2. Repornește Home Assistant.
3. Continuă de la **Pasul 4**.

## Dacă ceva nu merge

- **Integrarea nu apare la *Adaugă integrare*** — nu ai repornit, sau
  repornirea a eșuat. Verifică **Setări → Sistem → Jurnale**.
- **Integrarea apare cu eroare** — cel mai probabil au eșuat dependențele pip la
  prima pornire, ceea ce cere acces la internet din container. Repornește încă o
  dată și recitește jurnalul.
- **Panoul lipsește din bara laterală** — panoul este vizibil doar
  administratorilor. Verifică și golește cache-ul browserului.
- **Prețurile par greșite** — aproape sigur lipsește adresa (Pasul 5) sau este
  salvată alta decât cea la care te aștepți.

---

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
`auchan_grocery_back_in_stock` și `auchan_grocery_out_of_stock`, utile ca
declanșatoare în automatizări.

---

# Chef AI (opțional)

Chef AI generează rețete folosind abonamentul tău ChatGPT, prin browser și cod
de autorizare — **fără cheie API**. Pentru asta are nevoie de un serviciu
companion, inclus în directorul `bridge/`, care rulează Codex App Server și
păstrează sesiunea ChatGPT într-un volum propriu.

Tokenul bridge-ului este doar o parolă internă între Home Assistant și serviciu.
Nu este o cheie OpenAI.

**Chef AI este complet opțional.** Fără el, tot restul integrării funcționează
normal: liste, căutare, prețuri, stoc, magazine, linkuri de coș.

## Varianta recomandată: add-on din acest repository

Acest repository este în același timp repository HACS pentru integrare **și**
repository de add-on-uri pentru Supervisor. Cele două nu se încurcă: HACS
citește `hacs.json` și `custom_components/`, iar Supervisor caută foldere de
nivel 1 care conțin `config.yaml` și găsește doar `bridge/`.

Ca add-on, Supervisor îi oferă din oficiu volumul persistent `/data` și rețeaua
internă comună cu Home Assistant. Nu ai nevoie de Docker gestionat manual, de
volume declarate de mână sau de porturi publicate.

1. **Setări → Add-ons → Add-on Store → ⋮ → Repositories**, adaugă
   `https://github.com/oigan/ha-grocery-list`, apoi **Add** și **Close**.
2. Tot în magazin, deschide **Auchan Chef Bridge** și apasă **Install**. Prima
   instalare durează câteva minute: Supervisor construiește imaginea local,
   inclusiv `@openai/codex` și `bubblewrap`.
3. Apasă **Start**, apoi deschide fila **Log** a add-on-ului.

   Lasă opțiunile goale. La prima pornire bridge-ul își generează singur un
   token de 32 de caractere, îl salvează în `/data` ca să supraviețuiască
   restarturilor și update-urilor, și îl afișează în log între două linii de
   `=`. Dacă preferi să alegi tu tokenul, scrie-l în opțiunile add-on-ului —
   valoarea din opțiuni are prioritate față de cea generată.
4. Notează **hostname-ul** afișat pe pagina add-on-ului, la *Info*.
5. În **Setări → Dispozitive și servicii → Auchan Grocery → Configurare**
   completează:
   - *Chef bridge URL*: `http://<hostname>:8787`
   - *Chef bridge token*: tokenul din log

> Hostname-ul nu poate fi ghicit din slug. Add-on-urile instalate dintr-un
> repository extern primesc un prefix derivat prin hash din URL-ul acelui
> repository. Doar dacă instalezi add-on-ul local — copiind `bridge/` în
> `/addons/auchan-chef-bridge/` și instalându-l din *Local add-ons* —
> hostname-ul este previzibil: `local-auchan-chef-bridge`.

## Varianta pentru Docker gestionat (Coolify, compose)

Aceeași imagine funcționează și ca serviciu Docker obișnuit; `bridge/entry.mjs`
detectează singur în ce mod rulează. Creează un serviciu din `bridge/Dockerfile`
cu un volum persistent montat la `/data` și variabilele:

```text
BRIDGE_TOKEN=<minimum 24 caractere aleatoare>
PORT=8787
```

Montează volumul la `/data`, nu doar la `/data/codex`: acolo se salvează și
tokenul generat automat, dacă nu setezi `BRIDGE_TOKEN`.

Nu publica portul pe internet dacă Home Assistant îl poate accesa prin rețeaua
Docker. În opțiunile integrării configurează URL-ul intern al serviciului și
același `BRIDGE_TOKEN`.

Dacă numești containerul exact `auchan-chef-bridge` și îl pui în aceeași rețea
Docker cu Home Assistant, poți lăsa URL-ul gol: integrarea folosește implicit
`http://auchan-chef-bridge:8787`. În acest caz tokenul poate fi pus în
`/config/.storage/auchan_grocery_chef_token`, iar integrarea îl citește de
acolo. Acel fișier nu trebuie inclus în Git sau în backupuri publice.

## Autentificarea ChatGPT

Indiferent de variantă, intră în fila **Chef AI** din panou, apasă **Conectează
ChatGPT**, deschide pagina oficială OpenAI afișată și introdu codul. Sesiunea
rămâne în `/data/codex`, deci pasul se face o singură dată.

Modelul nu poate furniza produse, prețuri sau SKU-uri. El produce numai rețeta
și termeni scurți de căutare. Home Assistant caută separat în catalogul VTEX,
respinge rezultate nerelevante sau non-alimentare și reverifică SKU-ul ales
chiar înainte de import.

---

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
OpenStreetMap și, doar când edge-ul VTEX livrează o pagină de rețetă goală,
serviciul public Jina AI Reader pentru extragerea conținutului acelei pagini
publice. Nu se trimit date Home Assistant, adrese sau produse din liste către
reader. Integrarea nu cere chei API și nu colectează telemetrie proprie.

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

Sursa frontend este în `www/auchan-grocery/auchan-panel.js`; bundle-ul livrat
este generat în `custom_components/auchan_grocery/frontend`.

Pentru dezvoltare cu sincronizare live către o instanță reală, `dev-sync.sh`
face `npm run build` urmat de `rsync` peste SSH. Cere `HA_SSH_TARGET` și
`HA_SSH_KEY` în mediu.

## Limitări

- disponibilitatea și prețurile depind de API-urile publice Auchan/VTEX;
- magazinele statice de fallback sunt orientative și nu sunt marcate active;
- Nominatim este limitat global la o cerere pe secundă;
- deschiderea linkului de coș mută utilizatorul pe Auchan.ro pentru finalizare.

Detalii de design: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

## Licență și marcă

[MIT](LICENSE). Proiectul nu este afiliat cu Auchan România sau VTEX. Numele și
mărcile aparțin proprietarilor lor.
