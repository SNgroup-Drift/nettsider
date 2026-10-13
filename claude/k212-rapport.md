# K-212 · Nettsidene får Hengsel-profilen «blekk med furu» (13.10.2026)

Gren `claude/k212-furu`, PR mot `main`. Ikke flettet: Eirik fletter selv etter forhåndsvisningen.

## Kilde
Pinnet commit `256974aed25d4dd413eb0a9c67d602505d9613f4` (`demo` i innlandet-crm-sync, flettet fra `claude/k206-palett-furu`), designsystem 2.0.0. Hentet med `npm run design:hent -- --kilde <sti> --commit 256974ae` (les-tilgang, ingenting endret i innlandet-crm-sync). Fargene er ikke skrevet for hånd: `tokens.css` og `fonts.css` er generert fra `hengsel.tokens.json`.

Palett furu: aksent lys `#068472`, sideflate `#F6F8FB`, kort `#FBFDFF`. Det lukker det åpne punktet fra K-192 om sideflate på hengsel.no (alle fire sidene bruker nå `--flate-side`).

## Endret per side
| Side | Endring |
|---|---|
| **hengsel.no** (`sites/hengsel`) | Furu-tokens, Schibsted Grotesk (overskrifter vekt 700), nytt merke (`hengsel-*`-logoene med smalere høyre blad, nye mål 422/570/622 × 100), favicon, apple-touch (180), manifest (192, 512, `theme_color` og `background_color` fra `flate-side`), delingsbilder, app-ikon på /apptest (Hengsel Ute) |
| **design.hengsel.no** (`sites/design`) | Samme, pluss /farger, /skrift, /merke, /komponenter og /last-ned omskrevet til furu og Schibsted Grotesk; sju nye statustoner (ny, pågår, venter, sannsynlig, ferdig, advarsel, feil); app-ikonene er de nye (PNG fra Ute og CRM) |
| **admin.hengsel.no** (`sites/admin`) | Samme tokens, skrift, symbol og favicon |
| **vis.hengsel.no** (`sites/vis`) | Samme tokens, bare Schibsted Grotesk i `dist/assets/ds`, nytt merke i toppfeltet, favicon, delingsbilde, statusnavn |
| Delt (`packages/hengsel-tokens`) | Ny pin, `Hode.astro` forhåndslaster én skrift, `grunn.css` |
| `packages/hengsel-dokumenter` | Variabelnavn og skrift (A4-arkene bruker Hengsel-skriften, med mindre kundens skrift settes via `--a4-skrift`) |

Ikke endret: Sigdal-sider, kundetemaet (`--kunde-*`, kundeportalens og PDF-ens frie skrifter), sngroup.no, byggem.no, `crm-lenke.mjs`, `RUTER.foresporsel`.

## Skript og tester
- `scripts/lag-hengsel-tokens.mjs`: `fonts.css` har bare Schibsted Grotesk (Inter og Newsreader hører til kundetemaet og tas ikke med), lager også `--skrift-*-vekt`, `--skrift-*-sporing` og `--skrift-tabell`, og hopper over `ios-tittel` som ikke finnes lenger.
- `scripts/lag-favicon.mjs` (ny): favicon 32/180/192/512, `og.png` og `og-apptest.png` fra de pinnede merkefilene. `favicon.svg` er fjernet (den pinnede merkefila er gjennomsiktig og blir usynlig i mørke nettleserfaner).
- Tester tilpasset den nye strukturen, ikke svekket: `tokens.ts` har nå også økt kontrast og P3 (sammenligner lys og mørk), `--*-hsl`, `--*-rgb` og `--skala-*` i designsystemets `tokens.css` er CRM-følgevariabler som ikke er med i den delte fila, /merke sjekker de 32 Brand-filene (mappa har nå 68 SVG-filer).
- `docs/design/hengsel-regler.md` punkt 5 omskrevet.
- Status- og farge-variabler som er fjernet i designsystemet er byttet i sidene: `status-ok → ferdig`, `haster → advarsel`, `info → ny`, `noytral → venter`, `beige-*`, `deep-blue`, `dusty-blue`, `off-white`, `warm-black` → rollene (`kant`, `linje`, `flate-valgt`, `aksent`, `aksent-svak`, `flate-kort`, `tekst`).

## Kontroll
- `npm run build`: alle sider bygger uten feil.
- `npm test`: 102 tester, 101 grønne, 0 røde, 1 hoppet over av testen selv (fristfarger i admin: «TypeScript-import ikke tilgjengelig», ikke relatert), og `sjekk-lenker` grønn.
- Konsoll: ingen feil på forsidene; Schibsted Grotesk lastes (`document.fonts.check`), body-bakgrunn er `rgb(246, 248, 251)`, ingen vannrett rulling ved 390 px.
- Skjermbilder (forsiden, 390 og 1280 px): `claude/k212-skjermbilder/` (`hengsel-no-*`, `design-hengsel-no-*`, `admin-*`).

## Søk etter gamle koder, Inter og Newsreader i Hengsel-sidene
- Gamle hex (`#31261D`, `#FBF9F6`, `#F8F2EC`, `#F2E9DB`, `#E4D4C4`, `#C3B5A7`, `#5074A9`, `#9CA9BD`, `#8FA9D1` m.fl.) i kilde og bygg: ingen treff i sidene. Treff som står igjen, og hvorfor:
  - `crm-aksent-lys.svg`, `levert-av-aksent-lys.svg` (og `crm-*`, `ute-*`, `levert-av-*`, `sendt-med-*` i `ds/` og `/ds/` på design): designsystemet har ikke ny fil for disse 20 navnene (`kilde/logo-kart.json`, «ikke»). De er pinnede og byte-identiske med originalen. Det nye merket kommer i dem når designsystemet leverer det.
  - `--kunde-eksempel-*` i `tokens.css` (`#B0523A`, `#2E7D6B`, `#FBF9F6` som tekst på kundens aksent): kundetemaets eksempler, ikke Hengsel-paletten.
- `Inter` og `Newsreader` i kilde: bare i tekst om kundetemaets frie skrifter (`sites/design/src/pages/skrift.astro`: «Serif (Newsreader, Source Serif 4, Lora) brukes ikke under 20 px», og skriftlista fra JSON), og i designhistorikk i `sites/vis/README.md`. Ingen `@font-face`, ingen forhåndslasting og ingen `font-family` for dem på Hengsel-sidene.

## Gjenstår
- Skjermbildene av appene som ligger som bilder (`sites/hengsel/public/img/app`, `/apptest`, `ramme-studio-display.webp`, rom-bilder i vis) viser fortsatt den gamle paletten og det gamle merket. De må tas på nytt med `npm run skjermbilder` og `npm run skjermer` når appene er oppdatert (egen oppgave).
- Designsystemet mangler nytt merke for `crm-*`, `ute-*`, `levert-av-*` og `sendt-med-*` (se over).
- `RUTER.foresporsel` settes etter prod (egen oppgave).
