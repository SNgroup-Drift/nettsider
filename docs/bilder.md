# Skjermbilder og Apple-rammer på hengsel.no

Kilde: pakke v5 (`delt/pakke-v5/` på grenen `pakke-v5`) for `crm-montasje`, `ute-i-dag` og `ute-ks`, pakke v4 (`delt/pakke-v4/`, grenen
`pakke-v4`) for filene den har, og pakke v3 (`delt/pakke-v3/`, grenen `pakke-v3`) for resten. Rammene er Apples Product Bezels med gjennomsiktig skjermhull (`public/img/ramme-*.webp`, uendret fra
v3 til v4); skjermbildet ligger under rammen og klippes til hullet med hjørneradius, `object-fit: cover`, `object-position: top`
(`src/components/Enhet.astro`). Rammen er ikke beskåret, vippet eller speilvendt, og har ingen skygge. Skjermbildene er WebP
(kvalitet 80–82) laget av PNG-ene i pakkene, uten endring i oppløsning. Skjermhull (andel av rammen): tabellen i INSTRUKS.md; verdiene
står i `Enhet.astro`.

## Hvor hvert bilde brukes

| Sted | Ramme | Bilde (pakke) |
|---|---|---|
| Hero | Studio Display + iPhone 18 | `crm-tilbud` (v4) + `ute-i-dag` (v5) |
| Sju steg 1 Befaring / 5 Montering / 6 Punkter og saker / 7 Ferdig og faktura | iPhone 18 | `ute-laser` (v3) / `ute-ks` (v5) / `ute-punkter` (v3) / `ute-ferdig` (v3) |
| Sju steg 2 Tilbud / 3 Ordre og bestilling | Studio Display | `crm-tilbud` (v4) / `crm-bestilling` (v3) |
| Sju steg 4 Levering | iPhone 18 | `portal-levering` (v4, kundeportalen) |
| Hengsel Ute, åtte grep | iPhone 18 | `ute-i-dag` (v5), `ute-laser`, `ute-jobb-under`, `ute-ks` (v5), `ute-typeskilt`, `ute-avvik`, `ute-punkter` + `ute-punktkort`, `ute-ferdig` (v3) |
| Merking på iPad | iPad liggende | `ute-ipad-bildeverktoy` (v4, 2360 × 1640) |
| For kontoret (fire faner) | Studio Display | `crm-resultater` (v3, Ledertavle), `crm-montasje` (v5, Montasjeplan), `crm-bestilling` (v3), `crm-etterkalkyle` (v3) |
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
- `crm-tilbud-kunde` (v4, tilbudet slik kunden ser det på PC) er ikke brukt.
- Hero: telefonen står foran skjermens nedre høyre hjørne i 18 % av skjermens bredde (22 % under 700 px), omtrent 1,6 ganger så stor
  som i virkeligheten, så Ute-skjermen kan leses. Endres i `.hero-telefon` i `src/pages/index.astro`.
- PC-bildene er 16:10 (2880 × 1800), Studio Display-hullet er 16:9. Bildet fyller hullet og de nederste 10 % klippes (tomt bakgrunnsfelt,
  og varselet nederst i `crm-bestilling`). Navnene i v3 stemmer ikke alltid med innholdet: `crm-resultater` er Leder › Oversikt.
  Alt-tekstene i `src/content/forside.ts` beskriver det bildene faktisk viser.
- `ute-typeskilt` (v3) er 1170 × 2532 (ikke 1206 × 2622 som INSTRUKS sier); formatet avviker 0,5 %, så det fyller hullet likevel.
- Ikke i bruk: `crm-saker`, `crm-salgstavla`, `crm-ipad-*`, `kundeportal-k03/k04/k06/k08` (v3), Duo-rammen `iphone-aapen` (INSTRUKS: ikke i bruk).

## Sjekk

`npm test` (lenker og bilder i `img/` svarer 200, pluss enhetstestene) og `node scripts/skjermbilder.mjs` (steg 2 og fane 2 viser de nye
bildene, lysboksen åpner i full størrelse, ingen eksterne forespørsler, ingen informasjonskapsler). Sett i nettleser på PC 1440 og telefon
390: hero, steg 2 og 4, KS-raden, iPad, alle fire fanene, kundeportalen og /apptest.
