# Pakke v7 · 11.10

Alle montørbildene fra fil 36 tatt på nytt med nye navn: kunden heter Kari Nordmann, og montøren heter Ola. Legg pakken oppå v6.

## Innhold
- ios/ : iPhone 18 Pro 1206 × 2622, uten statuslinje, 62 pt (186 px) safe-area øverst.
  - ute-jobb-under (MV4.1)
  - ute-laser (MV13.1)
  - ute-ks-kamera (MV16)
  - ute-ks (MV16.1, «Ta bilde først»)
  - ute-avvik (MV17)
  - ute-punkter (MV14, filterraden rettet)
  - ute-punktkort (MV15)
  - ute-ferdig (MV1.3)
  - ute-typeskilt (MV19.8)
- rammer/ : uendret.

## Rettelser
- **ute-ks:** v5-utgaven var samme skjerm som ute-ks-kamera (MV16). Nå er det MV16.1, slik som i v3.
- **iPad:** INSTRUKS i v3 og v6 er feil om iPad. `rammer/ipad-liggende.png` er en iPad Air 11″-ramme. Rammen er 2400 × 1740, hullet er 2160 × 1502 og forholdet 1,44:1. Bruk iPad-bildene i 2360 × 1640 fra v3 (`ios/crm-ipad-*`) og v4 (`ios/ute-ipad-bildeverktoy`). `ipad13/` fra v6 er 4:3 og passer ikke i denne rammen.
- **Studio Display:** `display/` fra v6 står. `pc/` er bare for MacBook.

## Gjenstår
`pc/crm-mal-skisser` og `pc/crm-moduler` er fra v2. `crm-mal-skisser` har «sigdal»-logoen i sidemenyen. De bør ikke brukes før de er tatt på nytt.

## Sjekk før PR
Ingen kutt i venstre kant, ingen dobbel statuslinje, ingen merkenavn, bildene fyller skjermhullet, npm test grønn.
