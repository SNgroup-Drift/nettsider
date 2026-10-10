# Skjermbilder og Apple-rammer på hengsel.no

Kilde: pakke v3 (11.10.2026, `delt/pakke-v3/INSTRUKS.md` på grenen `pakke-v3`), som erstatter v1 og v2. Rammene er Apples Product
Bezels med gjennomsiktig skjermhull (`public/img/ramme-*.webp`, byte for byte lik rammene i v2); skjermbildet ligger under rammen og
klippes til hullet med hjørneradius, `object-fit: cover`, `object-position: top` (`src/components/Enhet.astro`). Rammen er ikke
beskåret, vippet eller speilvendt, og har ingen skygge. Skjermbildene er WebP (kvalitet 80–82) laget av PNG-ene i pakken, uten
endring i oppløsning. Skjermhull (andel av rammen): se tabellen i INSTRUKS.md; verdiene står i `Enhet.astro`.

## Hvor hvert bilde brukes

| Sted | Ramme | Bilde |
|---|---|---|
| Hero | Studio Display + iPhone 18 | `crm-min-dag` + `ute-i-dag` |
| Sju steg 1 Befaring / 5 Montering / 6 Punkter og saker / 7 Ferdig og faktura | iPhone 18 | `ute-laser` / `ute-ks` / `ute-punkter` / `ute-ferdig` |
| Sju steg 2 Tilbud | iPhone 18 | `portal-kjokken` (kundeportalen, tilbudet) |
| Sju steg 3 Ordre og bestilling / 4 Levering | Studio Display | `crm-bestilling` / `crm-ordre-kontrollmal` (fra v2) |
| Hengsel Ute, åtte grep | iPhone 18 | `ute-i-dag`, `ute-laser`, `ute-jobb-under`, `ute-ks` + `ute-ks-kamera`, `ute-typeskilt`, `ute-avvik`, `ute-punkter` + `ute-punktkort`, `ute-ferdig` |
| Merking på iPad | iPad liggende | `ute-ipad-bildeverktoy` (fra v2) |
| For kontoret (fire faner) | Studio Display | `crm-resultater` (Ledertavle), `crm-montasje`, `crm-bestilling`, `crm-etterkalkyle` |
| Kundeportalen | MacBook | `kundeportalen-pc` (fra v1) |
| /apptest | iPhone 18 ×3 | `ute-i-dag`, `ute-ks`, `ute-laser` |

## Fra v2 og v1 (finnes ikke i v3)

- `crm-ordre-kontrollmal` (v2), `ute-ipad-bildeverktoy` (v2) og `kundeportalen-pc` (v1) står uendret fordi v3 ikke har dem. Bytt dem når
  de kommer. `ute-ipad-bildeverktoy` er 4:3 mot hullets 1,44:1 og vises derfor hele (`fit="contain"`), med smale kanter på sidene.
- iPad-bildene i v3 (`crm-ipad-*`, 2360 × 1640) er ikke i bruk på hengsel.no (ingen CRM-iPad-seksjon).

## Ikke brukt fra v3 (feil i bildene)

- `pc/crm-tilbud`: har «Kjøkken Blek Blue» tre steder og et «Klikk .2»-merke ved Neste-knappen, selv om INSTRUKS sier at begge er
  fjernet. Hero bruker `crm-min-dag`, og steg 2 (Tilbud) viser tilbudet i kundeportalen (`portal-kjokken`).
- `ios/portal-tilbud`: har «Studio Sigdal Hamar · Strandgata 10» nederst. `portal-kjokken` er samme skjerm med «Butikknavn Hamar».
- Ikke i bruk av andre grunner: `crm-saker`, `crm-salgstavla` (ingen seksjon for dem), `kundeportal-k03/k04/k06/k08` (Kunden-seksjonen
  er en PC-skjerm), Duo-rammen `iphone-aapen` (INSTRUKS: ikke i bruk).

## Valg

- Hero: telefonen står foran skjermens nedre høyre hjørne i 18 % av skjermens bredde (22 % under 700 px), omtrent 1,6 ganger så stor
  som i virkeligheten, så Ute-skjermen kan leses. Endres i `.hero-telefon` i `src/pages/index.astro`.
- PC-bildene fra v3 er 16:10 (2880 × 1800), Studio Display-hullet er 16:9. Bildet fyller hullet og de nederste 10 % klippes (tomt
  bakgrunnsfelt, og varselet nederst i `crm-bestilling`). Navnene i pakken stemmer ikke alltid med innholdet: `crm-resultater` og
  `crm-salgstavla` er begge Leder-sider, `crm-saker` er «Belastninger til montasjefirma», `crm-montasje` er Mer › Montasje
  (kontrollmål). Alt-tekstene i `src/content/forside.ts` beskriver det bildene faktisk viser.
- `ute-typeskilt` er 1170 × 2532 (ikke 1206 × 2622 som INSTRUKS sier); formatet avviker 0,5 %, så det fyller hullet likevel.

## Sjekk

`npm test` (lenker og 27 bilder i `img/` svarer 200, pluss enhetstestene) og `node scripts/skjermbilder.mjs` (steg 2 og fane 2 viser de nye
bildene, lysboksen åpner i full størrelse, ingen eksterne forespørsler, ingen informasjonskapsler). Sett i nettleser på PC 1440 og telefon
390: hero, steg 2, KS-raden, alle fire fanene og /apptest.
