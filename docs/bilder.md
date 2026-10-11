# Skjermbilder og Apple-rammer på hengsel.no

Kilde, i prioritert rekkefølge: pakke v6 (`delt/pakke-v6/`, grenen `pakke-v6`: `display/` til Studio Display og `ipad13/` til iPad),
pakke v5 (`ute-i-dag`, `ute-ks`), pakke v4 (`crm-tilbud` m.fl., grenen `pakke-v4`) og pakke v3 (`pakke-v3`) for resten. Hver ramme har sitt
eget bildeformat: Studio Display 16:9 (`display/`, 2560 × 1440), MacBook 16:10 (`pc/`, 2880 × 1800), iPad 13″ 4:3 (`ipad13/`,
2732 × 2048) og iPhone 18 (`ios/`, 1206 × 2622). Rammene er Apples Product Bezels med gjennomsiktig skjermhull (`public/img/ramme-*.webp`, uendret fra
v3 til v4); skjermbildet ligger under rammen og klippes til hullet med hjørneradius, `object-fit: cover`, `object-position: top`
(`src/components/Enhet.astro`). Rammen er ikke beskåret, vippet eller speilvendt, og har ingen skygge. Skjermbildene er WebP
(kvalitet 80–82) laget av PNG-ene i pakkene, uten endring i oppløsning. Skjermhull (andel av rammen): tabellen i INSTRUKS.md; verdiene
står i `Enhet.astro`.

## Hvor hvert bilde brukes

| Sted | Ramme | Bilde (pakke) |
|---|---|---|
| Hero | Studio Display + iPhone 18 | `crm-tilbud` (v6) + `ute-i-dag` (v5) |
| Sju steg 1 Befaring / 5 Montering / 6 Punkter og saker / 7 Ferdig og faktura | iPhone 18 | `ute-laser` (v3) / `ute-ks` (v5) / `ute-punkter` (v3) / `ute-ferdig` (v3) |
| Sju steg 2 Tilbud / 3 Ordre og bestilling | Studio Display | `crm-tilbud` / `crm-bestilling` (v6) |
| Sju steg 4 Levering | iPhone 18 | `portal-levering` (v4, kundeportalen) |
| Hengsel Ute, åtte grep | iPhone 18 | `ute-i-dag` (v5), `ute-laser`, `ute-jobb-under`, `ute-ks` (v5), `ute-typeskilt`, `ute-avvik`, `ute-punkter` + `ute-punktkort`, `ute-ferdig` (v3) |
| Merking på iPad | iPad liggende (13″) | `ute-ipad-bildeverktoy` (v6, `ipad13/`) |
| For kontoret (fire faner) | Studio Display | `crm-resultater` (Ledertavle), `crm-montasje` (Montasjeplan), `crm-bestilling`, `crm-etterkalkyle` (alle v6) |
| Kundeportalen | MacBook | `kundeportal-pc` (v4) |
| Kundeportalen, under PC-skjermen | iPhone 18 ×4 | `portal-tilbud`, `portal-levering`, `portal-montering`, `portal-fdv` (v4) |
| /apptest | iPhone 18 ×3 | `ute-i-dag`, `ute-ks` (v5), `ute-laser` (v3) |

## Valg og avvik

- **Montasjeplan:** fanen viser `crm-montasje` fra v5 (Mer › Montasje › Montasjeplan, uke 42 per montør og montasjefirma). v3-bildet med samme
  navn viste kontrollmål og er byttet ut. `crm-ordre-kontrollmal` (v4) er ikke i bruk lenger, siden v5 sier at den bare skal brukes der det
  handler om kontrollmål, og ingen side gjør det; filen er fjernet. Fjernet tidligere: `crm-min-dag`, `portal-kjokken`, `kundeportalen-pc`.
- **KS-raden (grep 4) har én telefon:** `ute-ks` i v5 viser nå kameraet (OK åpner kameraet), akkurat som `ute-ks-kamera` fra v3. To bilder
  ville vist samme skjerm to ganger, så `ute-ks-kamera` er tatt ut.
- **Navn i bildene (v5):** `ute-i-dag` og `ute-ks` har Kari Nordmann og Ola. De andre Ute-bildene fra v3 (`ute-jobb-under`, `ute-laser`,
  `ute-punkter`, `ute-punktkort`, `ute-avvik`, `ute-ferdig`, `ute-typeskilt`) kan fortsatt ha de gamle navnene (Tuva Skinnrud, Pål); v5 sier fra
  hvis de skal tas på nytt. Det gjelder også `ute-i-dag`/`ute-ks` på /apptest (nå v5).
- Steg 4 (Levering) viser `portal-levering` («Bekreft leveringsdag») i stedet for et CRM-bilde; stegets undertekst heter «Kundeportalen».
- De fire portalbildene under MacBook-skjermen følger lista over kundeportalen (tilbud, leveringsdag og montering, FDV). Ny rad i
  `index.astro` (`.portal-telefoner`): fire telefoner på bred skjerm, to og to på smal. Ikke i fil 60 (som ikke ligger i repoet).
- Hero: telefonen står foran skjermens nedre høyre hjørne i 18 % av skjermens bredde (22 % under 700 px), omtrent 1,6 ganger så stor
  som i virkeligheten, så Ute-skjermen kan leses. Endres i `.hero-telefon` i `src/pages/index.astro`.
- **Studio Display (v6):** `display/`-bildene er 16:9 og passer hullet (94,81 % × 69,23 % av rammen) uten beskjæring. Navnene i pakken stemmer
  ikke alltid med innholdet: `crm-resultater` er Leder › Oversikt. Alt-tekstene i `src/content/forside.ts` beskriver det bildene faktisk viser.
- **iPad (v6):** `ipad13/` er 4:3 (2732 × 2048), men hullet i `ipad-liggende` er 1,44:1 (90 % × 2400 mot 86,32 % × 1740). Bildet fyller hullet
  (`cover`, fra toppen), så de nederste ca. 7 % klippes. I `ute-ipad-bildeverktoy` betyr det at verktøylinja under bildet (Punkt, Mål, Pil,
  Ring, Frihånd, Tekst og målingene) ikke vises; infolinja «Bosch tilkoblet» står nederst. Det finnes ingen tilpasning (`fit`, `contain`) lenger.
  For å vise hele skjermen trengs enten et bilde i 1,44:1 til 13″-rammen eller en 13″-ramme med 4:3-hull.
- MacBook (`pc/`, 16:10): bare `kundeportal-pc` (v4) bruker den. `display/kundeportal-pc` (16:9) er ikke brukt.
- `ute-typeskilt` (v3) er 1170 × 2532 (ikke 1206 × 2622 som INSTRUKS sier); formatet avviker 0,5 %, så det fyller hullet likevel.
- Ikke i bruk: `crm-saker`, `crm-salgstavla`, `crm-min-dag`, `crm-tilbud-kunde` og `ipad13/crm-ipad-*` (v6), `crm-ipad-*` (v3), `kundeportal-k03/k04/k06/k08` (v3), Duo-rammen `iphone-aapen` (INSTRUKS: ikke i bruk).

## Sjekk

`npm test` (lenker og bilder i `img/` svarer 200, pluss enhetstestene) og `node scripts/skjermbilder.mjs` (steg 2 og fane 2 viser de nye
bildene, lysboksen åpner i full størrelse, ingen eksterne forespørsler, ingen informasjonskapsler). Sett i nettleser på PC 1440 og telefon
390: hero, steg 2 og 4, KS-raden, iPad, alle fire fanene, kundeportalen og /apptest.
