# Pakke v3 · 11.10

Erstatter v1 og v2. Bytt alle filer med samme navn.

## Innhold
- ios/ : iPhone 18 Pro 1206×2622, uten statuslinje (rammen har island), 62 pt safe-area øverst. Ute: i-dag, jobb-under, laser, ks, ks-kamera, avvik, punkter, punktkort, ferdig, typeskilt. Kundeportal: k03, k04, k06, k08, portal-kjokken, portal-tilbud.
- ios/crm-ipad-*.png : iPad 2360×1640 (1,44:1, passer skjermhullet), Butikknavn.
- pc/ : CRM 2880×1800 til Studio Display og MacBook, ny Hengsel-logo, uten Sigdal, Tapwell, Blek Blue, Siemens og klikkmerker.
- rammer/ : Apple-rammer.
- fasit/ : fil 62, forsiden slik den skal se ut.

## Skjermhull (andel av rammen)
| Ramme | left | top | width | height |
|---|---|---|---|---|
| iphone-18 | 5,37 % | 2,50 % | 89,27 % | 95,00 % |
| studio-display-ramme | 2,59 % | 3,37 % | 94,81 % | 69,23 % |
| ipad-liggende | 5,00 % | 6,84 % | 90,00 % | 86,32 % |
| macbook | 12,63 % | 14,19 % | 74,75 % | 71,63 % |
| iphone-aapen | én skjerm 1878×2670 (7:10), ikke to. Brukes ikke før egne bilder i 7:10 finnes. |

Bildet ligger under rammen, klippes til hullet med overflow:hidden og hjørneradius, object-fit:cover, object-position:top.

## Rettelser fra v2
- k06 og k08 var tomme: nå tatt på nytt med innhold.
- k03 hadde «Studio Sigdal Hamar»: nå Butikknavn Hamar.
- ute-ferdig, ute-ks-kamera, ute-typeskilt: nye i 1206×2622.
- iPad-bildene: Butikknavn, riktig forhold.
- Bruk crm-resultater i stedet for crm-leder-oversikt.
- Duo: ikke i bruk.

## Sjekk før PR
Ingen kutt i venstre kant, ingen dobbel statuslinje, ingen merkenavn, bildene fyller skjermhullet, npm test grønn.
