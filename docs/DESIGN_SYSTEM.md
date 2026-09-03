# Auchan Grocery design system

Interfața folosește o direcție retail utilitară inspirată de ritmul vizual al
auchan.ro, fără a copia identitatea sau activele mărcii.

## Principii

- alb și gri cald pentru suprafețe; roșu doar pentru brand și acțiunea principală;
- verde pentru succes/disponibilitate și portocaliu pentru atenționări;
- titluri compacte `Barlow Condensed`, conținut `Source Sans 3`;
- carduri clare, raze moderate, informație densă dar aerisită;
- stări explicite pentru loading, eroare, gol, indisponibil și focus tastatură;
- mișcarea este redusă automat când sistemul cere `prefers-reduced-motion`.

## Tokenuri principale

| Rol | Valoare |
|---|---|
| Accent | `#E30613` |
| Succes | `#008F4C` |
| Atenție | `#F28C00` |
| Text | `#17212B` |
| Fundal | `#F7F6F2` |
| Suprafață | `#FFFFFF` |

Tema Home Assistant poate suprascrie fundalul, suprafața și culorile de text.
Fonturile, Lit, Leaflet și generatorul QR sunt livrate local în integrare.
