# N-1: hent bare Hengsel-delen av designsystemet

Gren `claude/n1-designsystem-pin` fra `main`. Kilde: hengsel-crm `demo`, commit `b1841be7` (`b1841be768052d8828b8543df2b948497b8712f9`).

## Pin fra / til

| | fra | til |
|---|---|---|
| commit | `82490f41` | `b1841be7` |
| versjon | 2.1.0 | 2.2.0 |
| filer i pin-fila | 374 | 378 |

## Fillista før / etter (`packages/hengsel-tokens/ds`)

Før = `main`, etter = denne grenen. Antall filer per mappe:

| mappe / fil | før | etter |
|---|---|---|
| `assets/app-ikon` | 71 | 71 |
| `assets/butikk` | 14 | 14 |
| `assets/deling` | 8 | 8 |
| `assets/favicon` | 12 | 12 |
| `assets/fonts` | 22 | 26 |
| `assets/ikoner` | 163 | 163 |
| `assets/logo` | 60 | 60 |
| `assets/motion` | 7 | 7 |
| `assets/pwa` | 11 | 11 |
| `tokens/fonts-fri-liste.css` | 1 | 1 |
| `tokens/fonts.css` | 1 | 1 |
| `tokens/hengsel.tokens.json` | 1 | 1 |
| `tokens/plattform.css` | 1 | 1 |
| `tokens/tokens.css` | 1 | 1 |
| `tokens/tokens.ts` | 1 | 1 |

Forskjellen er fire filer: Schibsted Grotesk har fått fire nye woff2 (`SchibstedGrotesk-{Normal,Kursiv}-{latin,latin-ext}.woff2`) i `assets/fonts`, som del av 2.2.0. `tokens/fonts-fri-liste.css` er fortsatt med (se avvik). Kundetemaet lå ikke i `main` fra før; det ville kommet inn med den gamle K-307-grenen. Ingen fil fra forrige pin mangler.

Hentes nå (konstanten `HENTES` i `scripts/hent-designsystem.mjs`, med kommentar som peker hit): `tokens/hengsel.tokens.json`, `tokens.css`, `fonts.css`, `plattform.css`, `tokens.ts`, `assets/logo/**` (uten `kunde/`), `assets/fonts/**` (uten `kundetema-sigdal/` og alt som heter Lausanne), `assets/favicon/**`, `assets/ikoner/**`. Som før hoppes `.md`, `.swift` og `arkiv/` over.

Holdt utenfor: `sigdal.tokens.json`, `kundetema-sigdal.css`, `hengsel-palett.*`, `grunn.css`, `layout.css`, `ios.css`, `HengselTokens.swift`, `assets/logo/kunde/**`, `assets/fonts/kundetema-sigdal/**` (TWK Lausanne), `components/`, `ui_kits/`, `plattform/`, `templates/`, `dokumentasjon/`, `guidelines/`. Sjekket: ingen fil i `packages/hengsel-tokens/ds` eller `sites/design/public/ds` har «sigdal» eller «lausanne» i navn eller innhold.

## Avvik fra oppdraget (trenger Eiriks blikk)

- **`tokens/fonts-fri-liste.css` er tatt med, selv om den ikke står i lista.** design.hengsel.no bruker den (`/skrift` lenker den, `/last-ned` viser den med sha256). Uten den feiler `npm run build -w sites/design` på `/last-ned`, og designet ville endret seg. Den har bare OFL-skriftene (DM Sans, Source Sans 3, Source Serif 4, Lora) og ingenting av Sigdal eller TWK. Står som egen linje med kommentar i `HENTES`. Vil du heller ha den ut, må `skrift.astro` og `last-ned.astro` endres (design-endring), så det er ikke gjort her.
- **Grenen `claude/k307-pin` er ikke brukt og ikke slettet.** Den drar med kundetemaet (`sigdal.tokens.json`, `kundetema-sigdal.css`, TWK Lausanne) og er laget på eldre main. Anbefaler å slette den; jeg har ikke gjort det.

## Resultat

- `npm run design:hent -- --kilde <hengsel-crm> --commit b1841be76` er kjørt (palettpakke og merkepakke legges inn igjen som før).
- `npm run build` grønn (sngroup, hengsel, byggem, design, admin og vis).
- `npm test`: 204 tester, 203 grønne, 0 røde, 1 hoppet over (samme som før).
- Ingen fargeendringer: `tokens.css` (ds og delt) er endret i bare én kommentarlinje (versjonsnummer). `hengsel.tokens.json` endrer bare versjon, dato, merknad og de fire nye Schibsted Grotesk-fontoppføringene. `fonts.css` har fått tre nye `@font-face` (kursiv og latin-ext, `unicode-range`, lastes bare ved behov) fra designsystemet 2.2.0. Ingen hex i sidene, ingen endring i hengsel-crm.

## Kjente røde sjekker på main (ikke fra N-1, ikke rettet)

- Manifest/bibliotek
- Workers Builds: design og admin

N-1 KLAR
