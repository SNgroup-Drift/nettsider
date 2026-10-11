# K-149 · Nettsidene (del C) · rapport 11.10.2026

Sak S-43. Ordre: `claude/design/ordre-full-retting-1110.md` på `demo` i innlandet-crm-sync.

## Utgangspunkt
PR #34, #35, #36 og #37 var alle flettet til `main` kl. 09:00–09:09 UTC 11.10, etter at ordren ble skrevet. De kan ikke endres, så
jeg reviderte `main` mot ordren og pakke v3–v8 og lagde nye oppfølgings-PR-er fra `main`, én per site. Ingenting er flettet.

| Site | Gren / PR |
|---|---|
| hengsel.no (erstatter #34) | `claude/k149-hengsel` (denne PR-en) |
| vis (erstatter #35 og #37) | `claude/k149-vis` |
| sngroup.no (erstatter #36) | `claude/k149-sngroup` |

## Metode
Pakkene (`pakke-v3` … `pakke-v8`, mappen `delt/`) er lagt oppå hverandre i rekkefølgen v3 → v8. Hvert skjermbilde i hver site er sammenlignet
mot nyeste utgave i pakkene (nedskalert pikseldiff). Sidetekst, alt-tekst og bygget HTML er søkt etter Sigdal, Tapwell, Siemens, Blek Blue og Bosch.
Teksten i fasit `60 hengsel.no.dc.html` er sammenlignet med bygget forside og /apptest.

## Rettet
- **hengsel.no:** «Bosch laser» i integrasjonslinjen er «Lasermåler». Bildene stemte alt med pakkene (Studio Display fra `display/`, iPad 2360 × 1640 i 11″-ramme fra v4, montørbilder fra v7, `ute-i-dag` fra v5). Fasit 60 er fulgt: de eneste linjene som ikke er med er designnotater, TODO-linjer, versjonsnummer (styres av Action) og «Kundens signatur på skjermen» (avgjort: «Klar for ferdigmelding»).
- **vis:** `ute-punkter` (var v3, nå v7) og `crm-ordre-kontrollmal` (nå v8). Montørappen på iPad brukte `ute-ipad-i-dag` og `ute-ipad-ks` (v2, ikke i pakkene, kuttet i høyre kant); bytta til `ute-ipad-bildeverktoy` (v4, 2360 × 1640) i 11″-rammen, og de to v2-bildene er slettet. Hvitevarer: «Bosch» er «BSH» i tekst, filter og data.
- **sngroup.no:** `ute-punkter` (v3 → v7, ikke i bruk på siden). Ingen merkenavn og ingen `fit`/`contain` i `sites/sngroup/`.

## Kontroll
- `npm test`: grønn på alle tre grenene (hengsel 46 adresser, vis 120, sngroup 33; 0 feil). `scripts/skjermbilder.mjs` og `skjermbilder-vis.mjs`: 0 feil.
- Skjermbilder 1440 og 390, lyst og mørkt: hengsel forside (`docs/skjermbilder/hengsel-forside-*`), vis `/montor/` og `/hvitevarer/` (`k149-vis-*`), sngroup forside (`k149-sngroup-*`). Ingen vannrett rulling, ingen konsollfeil. Nettstedene følger systemets lys/mørk-innstilling; hengsel.no har bare lys.
- Ingen `object-fit: fill/contain/scale-down` på skjermbilder; `Enhet.astro` og vis bruker `cover` + `top`.

## Åpent (kan ikke rettes i koden)
1. **`ute-laser` og `ute-ipad-bildeverktoy` i pakkene viser «Bosch GLM 50-27 CG»** (og Leica DISTO, Hilti PD-S i `ute-laser`) inni selve bildet. De står på hengsel.no (forside og /apptest), vis (Montørappen, Tegningen) og sngroup.no (ikke vist). Trenger nye bilder fra pakkelaget, eller at skjermene tas ut.
2. **vis bruker bilder som ikke finnes i v3–v8:** `crm-tlf-*` (seks telefonskjermer i Firmaleder og CRM) og romkortbildene (`rom-*`, laget av skriptet). `crm-tlf-*` er sjekket bare mot hva pakkene mangler, ikke lest bilde for bilde. Trenger ny pakke eller beskjed om at de kan stå.
3. **Merkenavn i vis som ikke vises som tekst:** `?rolle=sigdal` er et gammelt søkeparameter-alias i `assets/rom.js` (til `nobia`), og SJEKKLISTE.md/README nevner navnene. Ikke endret.
4. **byggem.no** (`sites/byggem/src/content/innhold.ts`) har «Sigdal» som merke på åtte produkter. byggem er utenfor K-149 (#34–#37) og er ikke rørt.
5. `/apptest`-skjermbilder (`scripts/skjermbilder-apptest.mjs`) krever `APPTEST_PASSORD`, som ikke finnes i denne økta. Ikke kjørt på nytt; forrige bilder er uendret.
6. Vis: forsiden og fasit 62 er ikke sammenlignet på nytt (bygd i #37, ikke i ordren).
