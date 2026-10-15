# Hengsel-reglene for farger, skrift og lys modus

Gjelder hengsel.no, vis.hengsel.no, design.hengsel.no, admin.hengsel.no, demo.hengsel.no og nye Hengsel-sider. sngroup.no og byggem.no er ikke omfattet (de har SN Groups palett i `packages/design`).

1. **Én kilde.** Alle farger, skrifter, avstander og radier kommer fra `hengsel.tokens.json` i innlandet-crm-sync (`_ds/hengsel-designsystem/`), hentet fra en pinnet commit.
2. **Én delt fil.** Tokens genereres til én Hengsel-fil som alle Hengsel-sidene importerer (`packages/hengsel-tokens/tokens.css`, skriften i `fonts.css`, som bare har Schibsted Grotesk). Sidene bruker bare variablene, aldri hex, rgb eller hsl direkte.
3. **Fasit.** design.hengsel.no viser det som gjelder. Avviker en annen Hengsel-side, er det den som er feil.
4. **Bare lys modus.** Nettsidene har ikke mørk modus, og følger ikke maskinens mørke innstilling.
5. **Furu-profilen og Schibsted Grotesk (K-212).** Palett «blekk med furu» (aksent lys `#05806F` fra K-234, ett hakk mørkere enn furu `#068472` så Off White-tekst `#FBF9F6` på aksent holder 4,5:1; sideflate `#F6F8FB`, kort `#FBFDFF`; verdiene står bare i `hengsel.tokens.json`) og nytt merke med smalere høyre blad. Schibsted Grotesk er den ene skriften, til tekst og overskrifter (overskrifter vekt 700), selvhostet som variabel woff2 med `font-display: swap`, aldri Google Fonts. Inter og Newsreader hører bare til kundetemaet (kundeportal, PDF og e-post) og lastes ikke på Hengsel-sidene.
5b. **Palettpakke v2 (K-212 runde 2, Design 14.10.2026).** Pakken ligger i `design/handoff/design_handoff_hengsel_furu_v2/` og blir liggende som kilde. Bare det som er merket «besluttet» er tatt i bruk: grunnpaletten (lys verdier er identiske med `hengsel.tokens.json`, 328 verdier sjekket), **Display P3** (`@media (color-gamut: p3)`, furu: aksent `color(display-p3 0.2275 0.5098 0.4471)`) og **økt kontrast** i lys (`@media (prefers-contrast: more)`, også sammen med P3). Blokkene genereres av `scripts/lag-hengsel-tokens.mjs` fra `rolle.p3.lys`, `rolle.lys-okt-kontrast` og `rolle.p3.lys-okt-kontrast` i pinnet JSON (bare roller som avviker). Logoer, merker, ikonsett (49 SVG, **foreslått**), favicon og app-ikon ligger i `ds/assets/` fra pakken (`node scripts/hent-palettpakke.mjs`; pin-fila har `palettpakke`). **Ikke tatt i bruk (venter på Eirik):** rollene ramme, overlegg, alltid-mørk og paa-alltid-mørk (K-206 a; verdiene i `tokens.css` er de fra runde 1, ikke pakkens), foreslåtte mørke verdier (K-206 b), plattformlagene a–d, skrivebord-laget og de monokrome produktlogoene (hvit og blekk for CRM, Ute, Admin og Levering). Nettsidene er bare lyse; mørk og mørk økt kontrast er ikke med.
6. **Kundens aksent** gjelder bare det sluttkunden ser, og må være minst 4,5:1 mot lys bakgrunn.
7. **Tester stopper avvik.** Farge utenfor den delte fila, en delt fil som avviker fra pinnen, eller mørk modus gir rødt bygg.
8. **Farger endres bare i designsystemet** i innlandet-crm-sync, og deretter pinnes ny commit her. Ingen retter farger på én side alene.
9. **Omfang:** hengsel.no, vis.hengsel.no, design.hengsel.no, admin.hengsel.no, demo.hengsel.no og nye Hengsel-sider.

## Kundeutgaver (K-223): hengsel.no/kunde/sigdal

En kundeutgave er ikke en Hengsel-side: den har kundens tema i `packages/kundetema-<kunde>/` (for Sigdal `tokens.css`, `profil.json`), lastet som egen fil (`/kunde/sigdal/tema.css`) og bare under kunderoten, aldri på Hengsel-sidene. Temaet bytter ut hver farge-rolle og skriften over de delte variablene (`:root[data-kunde="sigdal"]`). Sidene bruker fortsatt bare variabler. `scripts/kundetema.test.mjs` sjekker at /kunde/sigdal bare har Sigdal-fargene (i nettleser, computed styles), at hver farge-rolle i den delte fila er byttet ut, og at Hengsel-sidene ikke har noe av Sigdal-temaet. Ny kunde: kopier pakken, legg kunden til i `sites/hengsel/src/kunde.ts`, `worker/kunde.ts` og testene. Se `claude/k223-rapport.md`.

## Slik følger du reglene

- **Bruk variablene.** `var(--flate-side)`, `var(--tekst)`, `var(--aksent)`, `var(--status-ok-fg)` osv. Navnene står i `packages/hengsel-tokens/tokens.css`. Gjennomsiktige varianter: `color-mix(in srgb, var(--tekst) 12%, transparent)`.
- **Importer den delte fila.** Astro-sider bruker `@sngroup/hengsel-tokens/Hode.astro` som ramme (den importerer `tokens.css`, `fonts.css` og `grunn.css`). `sites/vis` kopierer fila til `dist/assets/` ved bygging (`bygg.mjs`).
- **Mørke tokens** (`--mork-*`, fargeprøver) ligger i en egen fil, `packages/hengsel-tokens/tokens-mork-prover.css`, under klassen `.mork-prover` (aldri `:root`, ingen `@media`). Bare design.hengsel.no importerer den, til prøvene for appene og CRM-et. Den delte `tokens.css` har ingen mørke verdier, og `color-scheme: light` står på `:root`.
- **Kundens aksent** (`--kunde-*`) er eksempler fra `kundetema` i JSON. Kundens egen farge kommer fra kundens data og gjelder kundeportal, tilbud/kontrakt (PDF) og e-post til kunde.
- **Merkefiler.** Logoene i `packages/hengsel-tokens/ds/assets/logo/` (palettpakke v2: `logo-{hengsel,crm,ute,admin,levering}-{lys,mork}`, `merke-*`, `hengsel-merke-*`; merkepakke v2: `levert-av-hengsel-*`, `sendt-med-hengsel-*`) og de øvrige SVG-ene i `ds/assets/` er ferdige filer med egne farger. App-ikonet Hengsel Ute er Icon Composer-pakken i `ds/assets/app-ikon/` (PNG-forhåndsvisninger: `node scripts/lag-appikon.mjs`). De brukes som `<img>`/favicon, og testen godtar dem bare når de er byte-identiske med originalen (sha256, i `ds` eller i `design/handoff/hengsel_merke_v2`). Gamle merkefiler (blå aksent, `brand/hengsel-merke/`, `levert-av-aksent`, gammel favicon-flis) er borte, og `scripts/merkepakke.test.mjs` stopper dem hvis de kommer tilbake.
5c. **Merkepakke v2 (K-231, Design 14.10.2026).** `design/handoff/hengsel_merke_v2/` (LES-MEG.md) er kilden. `node scripts/hent-merkepakke.mjs` legger den i `ds/assets/` (levert av og sendt med som SVG og PNG, favicon med hvit flis, fire nye ikoner, motion, delingsbilder, butikkmaler, PWA-ikoner, app-ikon for Expo og Android) og legger de filene sidene bruker byte for byte i `sites/*/public` (favicon på alle fire Hengsel-sidene, Ute-motion og delingsbilder på hengsel.no og vis, «Levert av Hengsel» i kundeportal-mocken og Visningsrommet, Sigdal-merket). Alt pinnes med sha256 i `designsystem.pin.json` (blokken `merkepakke`: `utplassert` har kilde og sha256 per fil). Kjøres automatisk etter `hent-palettpakke.mjs`. Rediger aldri en utplassert fil for hånd. Favicon: `<link rel="icon" href="/favicon.ico" sizes="any">` og `<link rel="icon" href="/favicon-flis.svg" type="image/svg+xml">` (settes av `Hode.astro`).
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
| `scripts/hengsel-regler.test.mjs` c) | en Hengsel-side har `prefers-color-scheme`, `data-theme`, `.dark`, `color-scheme: dark` eller en mørk-bryter (kilde og bygd), eller `color-scheme: light` mangler. Sjekker også de ferdige filene `tokens.css`, `tokens-mork-prover.css`, `fonts.css`, `grunn.css`, `Hode.astro` og alle `dist`-mapper (K-202) |
| `scripts/mork-modus-nettleser.test.mjs` | maskinen står i mørk modus (Playwright `colorScheme: 'dark'`) og forsiden og to undersider av hengsel, vis, admin eller design har computed `color-scheme` annet enn light, eller body-bakgrunn annet enn `--flate-side` (kjør `npm run build` først; manglende dist er feil) |
| `scripts/design-fasit.test.mjs` | design.hengsel.no og tokens ikke er like |

Skann for hånd: `node scripts/hengsel-regler.mjs [mappe …]`.

Unntak, med grunn: `sites/design/public/ds` (kopi av den pinnede designsystemmappa, nedlastinger til appene og CRM-et med både lys og mørk), `sites/vis/fasit` (frittstående designfil til sammenlikning, bygges ikke inn) og `.md`-filer (dokumentasjon).
