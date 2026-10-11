# Skjermbilder og Apple-rammer på hengsel.no

Kilde, i prioritert rekkefølge: pakke v7 (`delt/pakke-v7/`, grenen `pakke-v7`: alle `ute-*` utenom `ute-i-dag`), pakke v6 (`display/` til
Studio Display), pakke v5 (`ute-i-dag`), pakke v4 (`crm-tilbud`-serien, portalbildene og `ute-ipad-bildeverktoy`, grenen `pakke-v4`) og pakke v3
(`pakke-v3`) for resten. Hver ramme har sitt eget bildeformat: Studio Display 16:9 (`display/`, 2560 × 1440), MacBook 16:10 (`pc/`,
2880 × 1800), iPad (`ipad-liggende` er en iPad Air 11″-ramme, hull 1,44:1) 2360 × 1640 og iPhone 18 1206 × 2622. `ipad13/` (v6, 4:3) passer
ikke i iPad-rammen og er ikke brukt. Rammene er Apples Product Bezels med gjennomsiktig skjermhull (`public/img/ramme-*.webp`, uendret
fra v3 til v7); skjermbildet ligger under rammen og klippes til hullet med hjørneradius, `object-fit: cover`, `object-position: top`
(`src/components/Enhet.astro`). Rammen er ikke beskåret, vippet eller speilvendt, og har ingen skygge. Skjermbildene er WebP
(kvalitet 80–82) laget av PNG-ene i pakkene, uten endring i oppløsning. Skjermhull (andel av rammen): tabellen i INSTRUKS.md; verdiene
står i `Enhet.astro`.

## Hvor hvert bilde brukes

| Sted | Ramme | Bilde (pakke) |
|---|---|---|
| Hero | Studio Display + iPhone 18 | `crm-tilbud` (v6) + `ute-i-dag` (v5; finnes ikke i v7) |
| Sju steg 1 Befaring / 5 Montering / 6 Punkter og saker / 7 Ferdig og faktura | iPhone 18 | `ute-laser` / `ute-ks` / `ute-punkter` / `ute-ferdig` (alle v7) |
| Sju steg 2 Tilbud / 3 Ordre og bestilling | Studio Display | `crm-tilbud` / `crm-bestilling` (v6) |
| Sju steg 4 Levering | iPhone 18 | `portal-levering` (v4, kundeportalen) |
| Hengsel Ute, åtte grep | iPhone 18 | `ute-i-dag` (v5), `ute-laser`, `ute-jobb-under`, `ute-ks` + `ute-ks-kamera`, `ute-typeskilt`, `ute-avvik`, `ute-punkter` + `ute-punktkort`, `ute-ferdig` (alle v7) |
| Merking på iPad | iPad liggende (11″) | `ute-ipad-bildeverktoy` (v4, 2360 × 1640) |
| For kontoret (fire faner) | Studio Display | `crm-resultater` (Ledertavle), `crm-montasje` (Montasjeplan), `crm-bestilling`, `crm-etterkalkyle` (alle v6) |
| Kundeportalen | MacBook | `kundeportal-pc` (v4) |
| Kundeportalen, under PC-skjermen | iPhone 18 ×4 | `portal-tilbud`, `portal-levering`, `portal-montering`, `portal-fdv` (v4) |
| /apptest | iPhone 18 ×3 | `ute-i-dag` (v5), `ute-ks`, `ute-laser` (v7) |

## Valg og avvik

- **Montasjeplan:** fanen viser `crm-montasje` fra v5 (Mer › Montasje › Montasjeplan, uke 42 per montør og montasjefirma). v3-bildet med samme
  navn viste kontrollmål og er byttet ut. `crm-ordre-kontrollmal` (v4) er ikke i bruk lenger, siden v5 sier at den bare skal brukes der det
  handler om kontrollmål, og ingen side gjør det; filen er fjernet. Fjernet tidligere: `crm-min-dag`, `portal-kjokken`, `kundeportalen-pc`.
- **KS-raden (grep 4) har to telefoner igjen:** v7 `ute-ks` er MV16.1 («Ta bilde først»), `ute-ks-kamera` er MV16 (kameraet åpnet). v5 `ute-ks`
  var samme skjerm som `ute-ks-kamera`, og er byttet ut.
- **Navn i Ute-bildene:** alle `ute-*` fra v7 (og `ute-i-dag` fra v5) har Kari Nordmann og Ola. «Jobb»-fanen som nevnes i v7-oppdraget finnes ikke på hengsel.no
  (den ligger på sngroup.no); `ute-jobb-under` brukes i grep 3, «Varer og tegning på jobben».
- Steg 4 (Levering) viser `portal-levering` («Bekreft leveringsdag») i stedet for et CRM-bilde; stegets undertekst heter «Kundeportalen».
- De fire portalbildene under MacBook-skjermen følger lista over kundeportalen (tilbud, leveringsdag og montering, FDV). Ny rad i
  `index.astro` (`.portal-telefoner`): fire telefoner på bred skjerm, to og to på smal. Ikke i fil 60 (som ikke ligger i repoet).
- Hero: telefonen står foran skjermens nedre høyre hjørne i 18 % av skjermens bredde (22 % under 700 px), omtrent 1,6 ganger så stor
  som i virkeligheten, så Ute-skjermen kan leses. Endres i `.hero-telefon` i `src/pages/index.astro`.
- **Studio Display (v6):** `display/`-bildene er 16:9 og passer hullet (94,81 % × 69,23 % av rammen) uten beskjæring. Navnene i pakken stemmer
  ikke alltid med innholdet: `crm-resultater` er Leder › Oversikt. Alt-tekstene i `src/content/forside.ts` beskriver det bildene faktisk viser.
- **iPad:** `ute-ipad-bildeverktoy` er 2360 × 1640 (1,44:1, v4) og fyller hullet i `ipad-liggende` (iPad Air 11″, 2160 × 1502) uten beskjæring, så
  verktøylinja under bildet kommer med. Det finnes ingen bildetilpasning (`fit`, `contain`) i `Enhet.astro`.
- MacBook (`pc/`, 16:10): bare `kundeportal-pc` (v4) bruker den. `display/kundeportal-pc` (16:9) er ikke brukt.
- Ikke i bruk: `crm-saker`, `crm-salgstavla`, `crm-min-dag`, `crm-tilbud-kunde` og `ipad13/*` (v6), `crm-ipad-*` (v3), `kundeportal-k03/k04/k06/k08` (v3), Duo-rammen `iphone-aapen` (INSTRUKS: ikke i bruk).

## Sjekk

`npm test` (lenker og bilder i `img/` svarer 200, pluss enhetstestene) og `node scripts/skjermbilder.mjs` (steg 2 og fane 2 viser de nye
bildene, lysboksen åpner i full størrelse, ingen eksterne forespørsler, ingen informasjonskapsler). Sett i nettleser på PC 1440 og telefon
390: hero, steg 2 og 4, KS-raden, iPad, alle fire fanene, kundeportalen og /apptest.
