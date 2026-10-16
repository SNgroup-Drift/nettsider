# Prikkene under telefonen på /kunde/apptest (funn 15.10)

Gren: `claude/apptest-prikker` (fra `main`). Bare Hengsel-sidene; ingen database, ingen deploy, ikke pushet til `main`.
Repoet i oppdraget het `sngroup-nettsider`. Pakken heter det, men GitHub-repoet er `SNgroup-Drift/nettsider`, og det er der grenen ligger.

## Årsak

I `sites/hengsel/src/pages/apptest.astro` (samme side som `/apptest`; `/kunde/apptest` importerer den) var prikken en `span` inni `button.prikk`:

- Ikke valgt prikk: `background: var(--surface-highlight-strong)`, som er `--flate-valgt` (lys mint) og ligger nesten oppå sideflaten. Kontrast ca. 1,1:1.
- Valgt prikk: `--ink` (= `--tekst`), samme størrelse som de andre. Forskjellen ssto bare i farge.
- Ingen hover, ingen egen fokusring.

Trykkflaten var allerede 44 × 44 px (`min-width/min-height: 44px` på knappen). Det som er 8 × 8 px er selve prikken (`span`), ikke knappen. Jeg beholdt den store trykkflaten og målte den (se under).

## Rettet (bare tokenvariabler, ingen hex/rgb/hsl)

`sites/hengsel/src/pages/apptest.astro`:

| Tilstand | Før | Nå |
|---|---|---|
| Ikke valgt | `--surface-highlight-strong` | `var(--kant)`, 8 × 8 |
| Valgt (`aria-selected="true"`) | `--ink`, 8 × 8 | `var(--aksent)`, 20 × 8 med full rundhet (`--radius-pille`), så den skiller seg ut også uten farge |
| Hover og fokus | ingen | prikken `var(--tekst-svak)` (valgt prikk beholder `--aksent`) |
| Fokusring | global `box-shadow` | `outline: 2px solid var(--aksent)` på knappen (44 × 44, rund), `outline-offset: -4px` |
| Overgang | farge | farge og bredde; av ved `prefers-reduced-motion` |

Utvalget følger `aria-selected`, som skriptet (`scripts/apptest.ts`) allerede setter; skriptet er ikke endret.

## Samme mønster andre steder

Søkt etter små runde prikker, `role="tab"`/`aria-selected`, karuseller og `.dot(s)`/`.prikk` i hengsel, vis, design og admin.

- **Funnet og rettet: `sites/vis/src/leverandor/index.html`** (vis.hengsel.no/leverandor/, `.dots button::before`). Samme feil: ikke valgt prikk i `--linje` (ca. 1,3:1 mot flaten), hover `--ramme`, ingen fokusring. Rettet likt: `--kant` / `--aksent` bredere (20 × 8, fantes fra før) / `--tekst-svak` ved hover og fokus / fokusring `--aksent`. Trykkflaten er 28 × 40 px (over 24 × 24) og er ikke endret. Prikkene vises bare over 820 px.
- **Sett, men ikke samme mønster (ikke endret):** `.prikkt` i tidslinjen på apptest (dekor, ikke knapp, `--kant`-kant), statusprikker i admin (`.statusprikk`, `.tidslinje .prikk`, 28–32 px, ikke trykkbare), statuspiller `.pil::before` / `.pille i` (dekor ved siden av tekst), fremdriftsspor (`.spor`, `.stolpe`, `.meter`).
- Fanene (`role="tab"`) på /crm, /ute, /kundeportal, /slik-virker-det, dokumentvisningen og vis er tekstfaner med egen farge, ikke prikker.
- design.hengsel.no har ingen prikkekarusell.

## Kontroll

`npm run build` grønn. `npm test` grønn (203 bestått, 0 feil, 1 hoppet over, 771 forespørsler uten feil). Nettleserkontrollen er nytt skript `scripts/skjermbilder-prikker.mjs` (`npm run prikker:sjekk`), som serverer de bygde mappene, lys modus, redusert bevegelse (så karusellen står stille):

| Side | Prikk (ikke valgt) | Prikk (valgt) | Trykkflate | Kontrast ikke valgt | Kontrast valgt |
|---|---|---|---|---|---|
| /kunde/apptest 390 | 8×8 | 20×8 | 44×44 | 3,48:1 | 4,29:1 |
| /kunde/apptest 1440 | 8×8 | 20×8 | 44×44 | 3,48:1 | 4,29:1 |
| vis /leverandor 1440 | 8×8 | 20×8 | 28×40 | 3,70:1 | 4,57:1 |

Kontrasten er prikkens bakgrunn mot flaten bak den (computed farger). Kravet var minst 3:1 (WCAG 1.4.11).
Fokusring: 2 px solid `rgb(5, 128, 111)` (= `--aksent`), målt med tastatur.
axe (wcag2a, wcag2aa, wcag21aa, wcag22aa): 0 brudd på /kunde/apptest ved 390 og 1440 og på vis /leverandor ved 1440.

Skjermbilder (karusellen med prikk 1 og prikk 3 valgt) i `docs/apptest-prikker/`:

- `apptest-390-prikk1.png`, `apptest-390-prikk3.png`
- `apptest-1440-prikk1.png`, `apptest-1440-prikk3.png`
- `vis-leverandor-1440.png` (verktøylinjen med prikkene)

Merk: telefonrammene er tomme i skjermbildene fordi appbildene lenkes fra bilder.hengsel.no, som ikke nås fra utviklingsmaskinen jeg kjørte på (bygget brukte kopien av manifestet i repoet). Det gjelder bare bildene i rammen, ikke prikkene.

## Ikke gjort

- Ikke pushet til `main`, ikke deployet.
- Ingen endringer i tokens, designsystemet eller `tokens.css`.
