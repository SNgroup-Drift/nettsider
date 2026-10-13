# design.hengsel.no: siden mangler stilene etter bygget (K-182 oppfølging)

Gren: `claude/design-stiler` (fra `main` `471f8ec`). Ikke pushet til main, ikke deployet. Navnet i `sites/design/wrangler.jsonc` er ikke endret (`design`); Eirik gir Workeren nytt navn i Cloudflare.

## Årsaken

**`sites/design/src/styles/design.css` linje 39 manglet en avsluttende `}`.** K-192 (`cf56f98`) fjernet `.bryter`-reglene (bryteren Auto/Lys/Mørk ble tatt bort i den bare-lyse siden) og etterlot dette:

```css
@media (max-width: 767.98px) { .meny nav { … } .meny .rad { gap: 8px 12px; }
```

Mediesøket ble aldri lukket, så **alle reglene i resten av fila** (`.hode`, `.sek`, `.kort`, `.sv`, `.bunn`, `.pille`, `.knapp` …) havnet inne i `@media (max-width: 767.98px)` og gjaldt bare på telefonbredde. På PC var bare det som står før linje 39 (kroppen, menyen, tokenene og skriften) i kraft. Det passer med funnet:

| Det Eirik så | Forklaring |
|---|---|
| Tokenene virker: bakgrunn `#F2E9DB`, skrift Inter | `body`, `:root` og skriften står før linje 39 og er på øverste nivå |
| Fargeprøvene er bare tekst («warm-black#31261D») | `.sv.stor` (høyde og kant) lå inni mediesøket. Bakgrunnen kommer fra de genererte `.f-*`-klassene, men uten høyde har prøven ingen flate å vise den på |
| Kortene på forsiden er understrekede lenker | `.kort.lenke { text-decoration: none }` og `.kort` (rutenett, ramme) lå inni mediesøket, så det som gjaldt var `a { text-decoration: underline }` |
| Bunnteksten flyter sammen | `.bunn` (rutenett, mellomrom) lå inni mediesøket |
| Bare 2 `<style>`-blokker, ingen `<link rel="stylesheet">` | Riktig, og slik er det ment: Astro legger all CSS inline (`inlineStylesheets: "always"`) i blokk 2 (tokens, skrift og `design.css`), og de genererte fargeklassene i blokk 1 |

**Hvorfor bygget var grønt:** minifieren (Vite/esbuild) lukker en uavsluttet `@media` ved filslutt, så CSS-en i `dist` er balansert, og `csp-hasher.mjs` hasher bare det som står i HTML-en («CSP: 2 stilhash(er)» stemmer). Ingen av de eksisterende testene (HTML-innhold, lenker, axe, kontrast) så på om reglene faktisk gjelder på PC. Axe-kjøringene i K-182 ble tatt før K-192 fjernet `.bryter`.

**Det er ikke** `csp-hasher.mjs` (den fjerner eller endrer ingen `<style>`-blokker: antall før og etter er 2, og begge hasher står i `_headers`), ikke `inlineStylesheets`, og ikke en manglende import (`tokens.css`, `tokens-mork-prover.css`, `fonts.css` og `design.css` er alle importert i `Side.astro` og ligger i blokk 2). Jeg bygde også i en ren utsjekking med `CI=1 npm ci` og `npm run build -w sites/design`, slik Workers Builds gjør: byte-for-byte lik `dist` som lokalt, så det er ikke miljøet.

**Ekstra funn med den nye testen:** `/farger` (statustonene) brukte fortsatt klassene `tema-lys` og `tema-mork`, som K-202 døpte om til `prove-lys`/`prove-mork` i CSS-en. De to flatene hadde derfor ingen stil. Rettet i `farger.astro`.

**Liten kosmetisk feil, også rettet:** bunnteksten var smalere enn innholdet (flex-element med `margin-inline: auto` krympet til innholdet). `.side > .bunn { width: 100% }`.

Jeg kan ikke åpne den utrullede siden herfra (nettet til workers.dev og design.hengsel.no gir 403 fra proxyen). Årsaken er derfor utledet ved å gjenskape symptomene lokalt (skjermbildene «før»), ikke ved å se på selve utrullingen. Hvis siden fortsatt mangler stil etter at dette er rullet ut, er det en ny feil: sjekk da at Workers Builds bygger denne commiten, og at `_headers` og HTML-en i utrullingen har samme hasher (`curl -s https://…/farger | grep -o "<style" | wc -l` skal gi 2).

## Rettingene

| Commit | Hva |
|---|---|
| `Rett design.css: lukk @media-blokken …` | `design.css` linje 39 lukket med `}`; `tema-lys`/`tema-mork` → `prove-lys`/`prove-mork` i `farger.astro`; `.side > .bunn { width: 100% }` |
| `Test: stilene til design.hengsel.no …` | `scripts/design-stiler.test.mjs` (lagt i `npm test`) og `scripts/design-stiler-skjermbilder.mjs` |
| `Skjermbilder før og etter …` | `docs/skjermbilder/design-*-for.png` og `design-*-etter.png`, denne rapporten |

(Hashene står i `git log claude/design-stiler`.)

## Testen (punkt 3)

`scripts/design-stiler.test.mjs`, kjøres av `npm test` (feiler hvis `sites/design/dist` mangler). Alle åtte sidene lastes i Chromium med `_headers`/CSP som på Cloudflare, i 1440 og 390 px:

1. `design.css` har like mange `{` som `}`, og hver `<style>`-blokk i `dist/*.html` er balansert og har sin sha256 i CSP-en i `dist/_headers`.
2. Hver CSS-klasse siden bruker finnes i en regel (fanger klasser uten stil, som `tema-lys`), og kjernereglene (`.meny`, `.bunn`, `.hode`, `.wrap`, `.side`, `.sek`, `.kort`, `.pille`, `.knapp` …) står på **øverste nivå**, ikke inni en `@media` (fanger akkurat denne feilen).
3. Computed style: fargeprøvene `.sv.stor` på `/farger` har bakgrunnsfarge og høyde 64 px, kortene `a.kort.lenke` på forsiden har `text-decoration: none` og `display: grid`, `.bunn` er `grid` og `.meny` er `sticky`.
4. Ingen CSP-brudd i konsollen.

Bevist at den fanger feilen: med `design.css` slik den var (uten `}` på linje 39) feiler alle tre testene, med meldinger som «reglene for .bunn, .hode, .sek, .kort står ikke på øverste nivå», «.bunn er display:block, skal være grid», «fargeprøvene (.sv.stor) mangler stil: … høyde auto» og «kortene (.kort.lenke) mangler stil: text-decoration underline». Med rettingen er de grønne.

## Skjermbilder (punkt 4)

`docs/skjermbilder/design-<side>-<390|1440>-<for|etter>.png` for forsiden, `farger`, `komponenter` og `merke`: 16 filer (hele siden, bare lys modus). «Før» er tatt av bygget fra `main` slik det var, og «etter» fra rettingen. De eldre `design-desktop-*` og `design-mobil-*` i samme mappe hører til `sngroup.no/design` og er ikke rørt. Generert med `node scripts/design-stiler-skjermbilder.mjs for|etter`.

## Kontroll

- `npm run build`: alle seks nettsteder bygger. `npm test`: **101 tester, 0 feil** (3 nye), og lenkesjekken: 628 forespørsler, 0 feil (design: 85 adresser og 58 bilder svarer 200, ukjente sider får 404.html).
- `node scripts/skjermbilder-design.mjs` (axe-core, 8 sider × 390/1440 × lys/mørk): **0 kontrastbrudd og 0 øvrige brudd**, ingen CSP- eller konsollfeil, ingen vannrett rulling. (Skriptet skriver over `claude/k182-skjermbilder`; de filene er tilbakestilt og er ikke med i denne grenen.)
- CSP: begge `<style>`-blokkene på hver side har hashen sin i `_headers` (testen over).
- `npx wrangler deploy --dry-run -c sites/design/wrangler.jsonc` ikke kjørt på nytt: `wrangler.jsonc` er uendret.

## Usikkert

- Utrullingen er ikke sett (se over). Jeg har ikke sett den utrullede HTML-en, bare gjenskapt symptomene.
- Workers Builds vil lage en PR om navnet i `wrangler.jsonc` («design») mot Workeren «sngroup-nettsider». Den bør ikke flettes: Eirik gir Workeren nytt navn i Cloudflare.
- Skjermene til mørk modus (`.prove-mork`) er med vilje mørke på den lyse siden (K-202): de viser de mørke tokenene til appene, og er ikke en mørk utgave av siden.
