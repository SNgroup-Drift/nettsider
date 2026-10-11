# Pakke v6 · 11.10

Egne bilder til Studio Display (16:9) og iPad Air 13″ (4:3). Tatt rett fra designfilene, uten statuslinje, merkenavn eller klikkmerker. Legg dem oppå v5. pc/ (16:10) gjelder fortsatt for MacBook.

## Innhold
- display/ : Studio Display 2560 × 1440 (16:9). CRM-vinduet i 1440 × 810, tatt i 2× og skalert til 2560 × 1440.
  crm-min-dag, crm-bestilling, crm-etterkalkyle, crm-saker, crm-salgstavla, crm-resultater, crm-tilbud, crm-tilbud-kunde, crm-ordre-kontrollmal, kundeportal-pc, crm-montasje.
- ipad13/ : iPad Air 13″ liggende 2732 × 2048 (4:3). Skjermen i 1366 × 1024, tatt i 2×.
  crm-ipad-kontrollmal (fil 18 H3.5), crm-ipad-belastninger (fil 18 H3.12), crm-ipad-leder (fil 17 B4.4), crm-ipad-innstillinger (fil 17 B5.3), ute-ipad-bildeverktoy (fil 36 MV18).
- rammer/ : Apple-rammer, uendret.

## Hvilket bilde i hvilken ramme
| Ramme | Mappe | Størrelse | Skjermhull (left / top, width × height) |
|---|---|---|---|
| studio-display-ramme | display/ | 2560 × 1440 | 2,59 % / 3,37 %, 94,81 % × 69,23 % |
| macbook | pc/ (v3–v5) | 2880 × 1800, skaleres til 2408 × 1506 | 12,63 % / 14,19 %, 74,75 % × 71,63 % |
| ipad-liggende (13″) | ipad13/ | 2732 × 2048 | 5,00 % / 6,84 %, 90,00 % × 86,32 % |
| iphone-18 | ios/ (v4–v5) | 1206 × 2622 | 5,37 % / 2,50 %, 89,27 % × 95,00 % |

## Rettelser
- iPad-bildene i ios/ fra v3 og v4 (2360 × 1640) er iPad Air 11″ og passer ikke i 13″-rammen. Bruk ipad13/.
- pc/ er 16:10 og passer ikke i Studio Display uten beskjæring. Bruk display/ der.

## Sjekk før PR
Ingen kutt i venstre kant, ingen dobbel statuslinje, ingen merkenavn, bildene fyller skjermhullet, npm test grønn.
