# Hengsel-reglene for farger, skrift og lys modus

Gjelder hengsel.no, vis.hengsel.no, design.hengsel.no, admin.hengsel.no, demo.hengsel.no og nye Hengsel-sider. sngroup.no og byggem.no er ikke omfattet (de har SN Groups palett i `packages/design`).

1. **Én kilde.** Alle farger, skrifter, avstander og radier kommer fra `hengsel.tokens.json` i innlandet-crm-sync (`_ds/hengsel-designsystem/`), hentet fra en pinnet commit.
2. **Én delt fil.** Tokens genereres til én Hengsel-fil som alle Hengsel-sidene importerer (`packages/hengsel-tokens/tokens.css`, skriftene i `fonts.css`). Sidene bruker bare variablene, aldri hex, rgb eller hsl direkte.
3. **Fasit.** design.hengsel.no viser det som gjelder. Avviker en annen Hengsel-side, er det den som er feil.
4. **Bare lys modus.** Nettsidene har ikke mørk modus, og følger ikke maskinens mørke innstilling.
5. **Merket v3, Newsreader og Inter.** Newsreader for overskrifter og Inter for tekst, selvhostet.
6. **Kundens aksent** gjelder bare det sluttkunden ser, og må være minst 4,5:1 mot lys bakgrunn.
7. **Tester stopper avvik.** Farge utenfor den delte fila, en delt fil som avviker fra pinnen, eller mørk modus gir rødt bygg.
8. **Farger endres bare i designsystemet** i innlandet-crm-sync, og deretter pinnes ny commit her. Ingen retter farger på én side alene.
9. **Omfang:** hengsel.no, vis.hengsel.no, design.hengsel.no, admin.hengsel.no, demo.hengsel.no og nye Hengsel-sider.

## Slik følger du reglene

- **Bruk variablene.** `var(--flate-side)`, `var(--tekst)`, `var(--aksent)`, `var(--status-ok-fg)` osv. Navnene står i `packages/hengsel-tokens/tokens.css`. Gjennomsiktige varianter: `color-mix(in srgb, var(--tekst) 12%, transparent)`.
- **Importer den delte fila.** Astro-sider bruker `@sngroup/hengsel-tokens/Hode.astro` som ramme (den importerer `tokens.css`, `fonts.css` og `grunn.css`). `sites/vis` kopierer fila til `dist/assets/` ved bygging (`bygg.mjs`).
- **Mørke tokens** finnes som `--mork-*` (fargeprøver). De er bare til design.hengsel.no, som viser dem til appene og CRM-et. De gjør ingen side mørk.
- **Kundens aksent** (`--kunde-*`) er eksempler fra `kundetema` i JSON. Kundens egen farge kommer fra kundens data og gjelder kundeportal, tilbud/kontrakt (PDF) og e-post til kunde.
- **Merkefiler.** Logoene i `packages/hengsel-tokens/ds/assets/logo/` og filene i `brand/hengsel-merke/` (favicon, appikoner) er ferdige SVG-filer med egne farger. De brukes som `<img>`/favicon, og testen godtar dem bare når de er byte-identiske med originalen (sha256).
- **Lysboksen** i dokumentvisningen er mørk (`--alltid-mork`, samme rolle som bildeeditor og kamera). Det er en bildevisning, ikke mørk modus.

## Ny farge eller ny verdi

1. Endre `hengsel.tokens.json` i innlandet-crm-sync (`_ds/hengsel-designsystem/tokens/`) og generer der.
2. Pin ny commit her: `npm run design:hent -- --kilde <sti til innlandet-crm-sync> --commit <sha>`. Skriptet henter filene fra commiten, oppdaterer `packages/hengsel-tokens/designsystem.pin.json` (sha256 per fil) og genererer `tokens.css` og `fonts.css` på nytt.
3. `npm run build` og `npm test`. Alle fire sidene og design.hengsel.no følger med, siden de bruker de samme variablene.

Aldri rediger `tokens.css`, `fonts.css` eller filene i `packages/hengsel-tokens/ds/` for hånd.

## Testene (`npm test`)

| Test | Feiler når |
|---|---|
| `scripts/hengsel-regler.test.mjs` a) | en fil under `sites/hengsel`, `sites/vis`, `sites/design`, `sites/admin`, `packages/hengsel-dokumenter` eller `packages/hengsel-tokens/src` har en fargeverdi (hex, rgb/hsl/…, navngitt farge, Tailwind-farge), eller en bygd side har en hex som ikke finnes i den delte fila |
| `scripts/hengsel-regler.test.mjs` b) | `tokens.css` eller `fonts.css` avviker fra det som genereres fra pinnet `hengsel.tokens.json`, en pinnet fil er endret, eller det finnes mer enn én pin |
| `scripts/hengsel-regler.test.mjs` c) | en Hengsel-side har `prefers-color-scheme`, `data-theme`, `.dark`, `color-scheme: dark` eller en mørk-bryter (kilde og bygd), eller `color-scheme: light` mangler |
| `scripts/design-fasit.test.mjs` | design.hengsel.no og tokens ikke er like |

Skann for hånd: `node scripts/hengsel-regler.mjs [mappe …]`.

Unntak, med grunn: `sites/design/public/ds` (kopi av den pinnede designsystemmappa, nedlastinger til appene og CRM-et med både lys og mørk), `sites/vis/fasit` (frittstående designfil til sammenlikning, bygges ikke inn) og `.md`-filer (dokumentasjon).
