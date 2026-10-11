# Pakke v4 · 11.10

Rene skjermbilder tatt rett fra designfilene i Apples oppløsning (regel i logo/enheter/LES-MEG.md). Bytt filer med samme navn fra v3. Filer som ikke er med her, gjelder fortsatt fra v3.

## Innhold
- pc/ : 2880×1800 (16:10) til Studio Display og MacBook.
  - crm-tilbud.png : fil 10 T08.0, tilbudssiden uten modal.
  - crm-tilbud-kunde.png : fil 10 F01.4, tilbudet slik kunden ser det i kundeportalen.
  - crm-ordre-kontrollmal.png : fil 18 H3.1, Ordre › Kontrollmål.
  - kundeportal-pc.png : fil 15 KP1 Mitt kjøkken, øverste 1440×900.
- ios/ : iPhone 18 Pro 1206×2622, uten statuslinje, 62 pt (186 px) safe-area øverst i skjermens bakgrunnsfarge.
  - portal-tilbud.png : fil 15 K04 Tilbudet.
  - portal-levering.png : fil 15 K10 Bekreft leveringsdag.
  - portal-montering.png : fil 15 K12 Bekreft montering.
  - portal-fdv.png : fil 15 K14 Ditt nye kjøkken (FDV, garanti, vedlikehold).
- ios/ute-ipad-bildeverktoy.png : fil 36 MV18, iPad 2360×1640 liggende, uten statuslinje.
- rammer/ : Apple-rammer, uendret fra v3.

## Skjermhull (andel av rammen)
| Ramme | left | top | width | height |
|---|---|---|---|---|
| iphone-18 | 5,37 % | 2,50 % | 89,27 % | 95,00 % |
| studio-display-ramme | 2,59 % | 3,37 % | 94,81 % | 69,23 % |
| ipad-liggende | 5,00 % | 6,84 % | 90,00 % | 86,32 % |
| macbook | 12,63 % | 14,19 % | 74,75 % | 71,63 % |

Bildet ligger under rammen, klippes til hullet med overflow:hidden og hjørneradius, object-fit:cover, object-position:top.

## Rettelser fra v3
- Alle bildene: Butikknavn og Kari Nordmann. Ingen Sigdal, Blek Blue, Tapwell, Siemens, klikkmerker eller dimmet modal.
- crm-tilbud: tilbudssiden «Kjøkken Lys blå» i stedet for lista med «Kjøkken Blek Blue» og klikkmerker.
- crm-tilbud-kunde: kundens visning i stedet for dialogen over dimmet bakgrunn.
- crm-ordre-kontrollmal: uten etikettene «27 · H3.1 · PC 1440 · Lys» øverst.
- portal-tilbud: K04 Tilbudet i stedet for Mine kjøp med «Studio Sigdal Hamar».
- Nye: portal-levering, portal-montering, portal-fdv, kundeportal-pc, ute-ipad-bildeverktoy.
- crm-montasje er ikke med: designfilene har ingen montasjeplan på PC. Bruk ikke crm-montasje fra v3 (den viser kontrollmål).

## Sjekk før PR
Ingen kutt i venstre kant, ingen dobbel statuslinje, ingen merkenavn, bildene fyller skjermhullet, npm test grønn.
