# Prikkene under telefonen på /kunde/apptest (15.10.2026)

Gren `claude/apptest-prikker` fra `main`. Ingen database, ikke pushet til main, ikke deployet.
Repoet heter `SNgroup-Drift/nettsider` (oppgaven sa `sngroup-nettsider`).

## Årsak

I `sites/hengsel/src/pages/apptest.astro` var ikke-valgte prikker `--surface-highlight-strong`, som i `hengsel.css` er alias for `--flate-valgt` (lys mint `#E0F4EE`). Heroen ligger på `--flate-senket` (`#EFF1F4`): kontrast **1,01:1**. Valgt prikk var `--ink` (`--tekst`). Prikken var 8 × 8 px.

## Endring

`sites/hengsel/src/pages/apptest.astro` (bare CSS, ingen hex, bare tokenvariabler):

| Tilstand | Før | Nå | Kontrast mot `--flate-senket` |
|---|---|---|---|
| Ikke valgt | `--surface-highlight-strong` (1,01:1) | `var(--kant)` | 3,48:1 |
| Valgt (`aria-selected="true"`) | `--ink`, 8 × 8 | `var(--aksent)`, **20 × 8**, full rundhet | 4,29:1 |
| Hover | ingen | `var(--tekst-svak)` | 4,55:1 |
| Fokus (`:focus-visible`) | felles ring fra `hengsel.css` | 2 px `var(--aksent)`-ring rundt knappen, prikken `--tekst-svak` (valgt prikk beholder `--aksent`) | ring 4,29:1 |

- Valgt prikk velges nå på `aria-selected`, ikke bare på `.on`.
- **Trykkflate:** hver knapp er 28 × 44 px (krav: minst 24 × 24, WCAG 2.5.8). Prikken er fortsatt 8 × 8 inne i knappen. Fjernet `margin-inline: -8px` og `min-width: 44px`, som lot nabo-knappene overlappe hverandre; knappene ligger nå kant i kant uten overlapp.
- Bredden på valgt prikk animeres (`--dur`, `--ease`); `prefers-reduced-motion` er uendret (autoavspilling står stille, prikkene virker).

## Samme mønster andre steder

Søkt i `sites/hengsel`, `sites/vis`, `sites/design`, `sites/admin` og `packages/hengsel-tokens` etter `.prikk`, `.dots`, `role="tab"`, `aria-selected`, 6–10 px runde former og karusell/pager/indikator.

- **vis.hengsel.no/leverandor** (`sites/vis/src/leverandor/index.html`, `.dots button::before`): samme feil. Ikke valgt var `--linje` (1,32:1 mot `--flate-side`), hover `--ramme`, og ingen egen fokusring. Rettet likt: ikke valgt `--kant` (3,70:1), valgt `--aksent` 20 px bred (4,57:1), hover og fokus `--tekst-svak`, fokusring `2px solid var(--aksent)`. Knappen var allerede 28 × 40 px (uendret). Prikkene skjules under 820 px, så de finnes bare på PC.
- **hengsel.no** øvrige sider: `/crm`, `/ute`, `/kundeportal`, `/slik-virker-det` bruker nummererte faner (`role="tab"`, 28–44 px), ikke prikker. Ikke endret.
- **design.hengsel.no:** `.pille i` (8 px) er statusprikken i en pille, ledsaget av ord. Ikke en karusell. Ikke endret.
- **admin.hengsel.no:** `.prikk` / `.statusprikk` er tidslinje- og statusikoner på 28–32 px med ikon og kant. Ikke en karusell. Ikke endret.
- **vis** `hvitevarer`, `prosjekt`, `veikart`: listepunkt og radioknapp-merke, ikke karusell. Ikke endret.
- **Ikke rettet, bare nevnt:** fremdriftssporene `.spor` i `PortalSkjerm.astro` og `.stolpe` i `apptest.astro` bruker også `--surface-highlight-strong` som spor (8 px / 6 px). De er dekorative, vises med tall ved siden av og er ikke interaktive, så de er utenfor denne oppgaven. Si fra hvis de også skal få `--kant`/`--linje`.

## Kontroll

- `npm run build`: grønt (alle workspaces).
- `npm test`: 203 grønne, 0 røde, 1 hoppet over (som før). `hengsel-regler.test.mjs` godtar endringen (ingen fargeverdier utenfor tokenfila).
- `node scripts/apptest-prikker-kontroll.mjs` (ny, kjører mot `dist`): alt grønt.
  - axe (wcag2a, wcag2aa, wcag21a/aa, wcag22aa) uten brudd på `/kunde/apptest` i 390 og 1440 og på `vis /leverandor` i 1440. `color-contrast` er med.
  - Alle fire prikkene: knapp 28 × 44 px, ikke-valgte 3,48:1, valgt 4,29:1, med prikk 1 og prikk 3 valgt, i både 390 og 1440.
  - Hover gir `rgb(104, 110, 117)` (`--tekst-svak`), fokus gir 2 px `rgb(5, 128, 111)` (`--aksent`).
- Skjermbilder i `docs/apptest-prikker/`:
  - `apptest-prikker-390-prikk1.png`, `apptest-prikker-390-prikk3.png`
  - `apptest-prikker-1440-prikk1.png`, `apptest-prikker-1440-prikk3.png`
  - `apptest-prikker-390-fokus.png`, `apptest-prikker-1440-fokus.png` (fokus på prikk 2)
  - `vis-leverandor-prikker.png`
- **Merk:** telefonbildene i skjermbildene er tomme (alt-tekst vises). Appbildene lenkes fra `bilder.hengsel.no`, som ikke nås fra denne maskinen (`fetch failed` i bygget). Det gjelder bare skjermbildene her, ikke endringen; prikkene og målingene er de samme.
- Testen kjører med `reducedMotion: reduce` så autoavspillingen ikke bytter valgt prikk midt i skjermbildet.

## Filer

- `sites/hengsel/src/pages/apptest.astro`
- `sites/vis/src/leverandor/index.html`
- `scripts/apptest-prikker-kontroll.mjs` (ny, ikke lagt inn i `npm test` fordi den trenger `dist` og Chromium)
- `docs/apptest-prikker-rapport.md`, `docs/apptest-prikker/*.png`
