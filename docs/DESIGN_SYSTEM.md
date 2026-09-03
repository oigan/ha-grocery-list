# Auchan Grocery design system

Interfața urmează sistemul vizual al magazinului Auchan (machetele de livrare
națională: home, listing, pagină de produs). Valorile de mai jos sunt extrase
din stratul vectorial al machetelor, nu aproximate din capturi.

## Principii

- **roșul este identitate și promoție, nu acțiune** — logo, badge de reducere,
  selecție activă, contoare; niciodată un buton obișnuit;
- **verdele este culoarea de acțiune** — coș, adaugă, confirmă, „în stoc";
- neutrele sunt o familie bleu-gri rece, construită în jurul cernelii navy;
- paleta este fixă — panoul nu se lasă recolorat de Home Assistant, dar
  comută light/dark odată cu tema HA;
- **suprafețele sunt plate**: card alb, bordură de 1px, fără umbră; umbra e
  rezervată overlay-urilor (modal, dropdown, toast);
- o singură familie tipografică, diferențiată prin greutate — fără font
  condensat și fără titluri all-caps;
- stări explicite pentru loading, eroare, gol, indisponibil și focus tastatură;
- mișcarea este redusă automat când sistemul cere `prefers-reduced-motion`.

## Culori

| Rol | Token | Valoare |
|---|---|---|
| Brand | `--brand` | `#ED002E` |
| Brand hover | `--brand-hover` | `#D40029` |
| Acțiune | `--action` | `#00AC6C` |
| Acțiune hover | `--action-hover` | `#00985F` |
| Acțiune închis | `--action-deep` | `#007B4D` |
| Cerneală / text | `--text` | `#01172A` |
| Text secundar | `--text-2` | `#3C617E` |
| Text terțiar | `--text-3` | `#6B879E` |
| Preț tăiat | `--text-mute` | `#747474` |
| Linie | `--sep` | `#D6E1EC` |
| Linie accentuată | `--sep-strong` | `#B0C4D5` |
| Suprafață tentă | `--surface-2` | `#EEF5FB` |
| Suprafață | `--surface` | `#FFFFFF` |
| Fundal | `--bg` | `#FAFAFA` |
| Informativ | `--blue` | `#3FA9F5` |
| Atenționare | `--amber` / `--amber-deep` | `#FFCE42` / `#9A6B00` |

Paleta este **fixă**: panoul nu preia variabilele de temă Home Assistant
(`--primary-background-color`, `--card-background-color`, `--primary-text-color`,
`--secondary-text-color`, `--divider-color`). Sub orice temă HA, panoul arată
identic — decizie deliberată, ca identitatea Auchan să rămână intactă.

Singura variație este modul întunecat, care inversează aceeași familie navy
(`#071726` fundal, `#0E2338` suprafață) — nu negru neutru. **Modul urmează tema
Home Assistant**, nu culorile ei: panoul citește `hass.themes.darkMode` și pune
`[theme-known]` plus `[dark]` pe host. Astfel nu apare cusătura dintre un
sidebar HA întunecat și un panou luminos, dar paleta rămâne Auchan.

Dacă `hass.themes.darkMode` lipsește (core mai vechi), atributul marker nu se
pune și se aplică rezerva pe `prefers-color-scheme`. Cei doi selectori se
exclud reciproc: `[dark]` apare doar împreună cu `[theme-known]`.

## Scale

- **spațiere**, pas de 4: `--s-1` 4px … `--s-7` 32px;
- **tipografie**: `--fs-2xs` 10, `--fs-xs` 12, `--fs-sm` 13, `--fs-md` 14,
  `--fs-lg` 16, `--fs-xl` 20, `--fs-2xl` 28;
- **rază**: `--r-xs` 6 (badge), `--r-sm` 8 (control), `--r-md` 12 (card),
  `--r-lg` 16, `--r-xl` 20 (sheet), `--r-pill` 999.

## Tipografie

Macheta folosește **SanaSansAlt**, fontul proprietar Auchan, care nu poate fi
redistribuit cu integrarea. Panoul livrează local **Source Sans 3** (400/600/700)
ca înlocuitor humanist apropiat, în aceeași logică de o singură familie.

Leaflet și generatorul QR sunt de asemenea livrate local.
