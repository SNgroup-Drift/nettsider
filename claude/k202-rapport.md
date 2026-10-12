# K-202 · Bare lys modus på Hengsel-sidene, og lik bakgrunn

Gren `claude/k202-bare-lys-retting` fra `main` (0d47d0a). Fletter ikke.

## Viktigste funn: årsaken i oppgaven stemmer ikke med main

Oppgaven sier at `packages/hengsel-tokens/tokens.css` på main har `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]):not([data-alltid-lys]) {…} }`. **Det har den ikke.** Jeg sjekket på main (0d47d0a):

- `git show origin/main:packages/hengsel-tokens/tokens.css | grep -c prefers-color` → 0. Blokken ble fjernet i K-192 (cf56f98).
- Ingen `prefers-color-scheme` i bygd CSS/HTML for vis, hengsel, admin eller design (bare i den pinnede nedlastingskopien `sites/design/dist/ds/tokens/tokens.css`, som ikke lastes av noen side, og i sngroup.no/byggem.no som ikke er omfattet).
- Nettleser med mørk maskin mot en `npm run build` av main: vis, admin og design er **lyse** (`color-scheme: light`, bakgrunn `#F2E9DB`). Bare hengsel.no avviker, på bakgrunnen.

Jeg kunne ikke åpne vis.hengsel.no herfra (nettverket er stengt for den verten), så jeg kan ikke bekrefte det Eirik så 12.10. Den mest sannsynlige forklaringen er at det som kjører live ikke er bygget fra main-koden nå (eldre bygg, eller cachet `/assets/hengsel-tokens.css`). **Anbefaling:** sjekk at siste main-bygg faktisk er deployet til vis, og tøm cachen for `/assets/hengsel-tokens.css`. Dette er et Cloudflare-steg og er ikke rørt her.

Rettingen under gjør uansett at feilen ikke kan komme tilbake, og at testene fanger den (se «Bevis»).

## Endringer

1. **Delt token-fil bare lys.** `tokens.css` har bare lyse verdier, `color-scheme: light` på `:root`, ingen `@media` mot fargeskjema, ingen `[data-theme]`, ingen `--mork-*`.
2. **Mørke fargeprøver i egen fil.** `packages/hengsel-tokens/tokens-mork-prover.css` (generert av `scripts/lag-hengsel-tokens.mjs`) har `--mork-*` under klassen `.mork-prover` (ikke `:root`). Bare `sites/design` importerer den (`Side.astro`, `<div class="side mork-prover">`). Testen sjekker at ingen annen side gjør det.
3. **Pinne- og sammenligningstest.** Lyse verdier sammenlignes som før mot den pinnede `hengsel.tokens.json` og designsystemets egen `tokens.css`. **Mørke verdier:** ny test sammenligner hver `--mork-*` i prøvefila med `mork`-verdiene i `hengsel.tokens.json` (farger, statuser, skygger), og at filen ikke berører `:root`/`html`/`body`/`@media`. Pinnen er uendret (samme commit, samme sha256).
4. **hengsel.no**: sidebakgrunn `var(--flate-side)` (`body` i `hengsel.css` og `.side` i `Side.astro`). Kort (`--surface` = `--flate-kort`), meny, bunn og appskjermer er uendret. Før: `#FBF9F6`, nå `#F2E9DB` som de andre sidene.
5. **Kontrast (funnet av axe etter bakgrunnsendringen):** vanlig lenketekst på hengsel.no brukte `--aksent` (3,95:1 mot `#F2E9DB`). Satt til `--aksent-tekst` (`a { color }` i `hengsel.css`). Nå 0 brudd.

## Tester

- **Ny** `scripts/mork-modus-nettleser.test.mjs` (med i `npm test`): Playwright `colorScheme: 'dark'`, forside + to undersider av hengsel, vis, admin, design. Feiler hvis computed `color-scheme` på `<html>` ikke er `light`, eller body-bakgrunnen ikke er `--flate-side` (lest fra tokens.css). Feiler også hvis `dist` mangler (hoppes ikke over).
- **K-192-testen rettet** (`hengsel-regler.test.mjs`): den skannet bare kildene, aldri den ferdige token-fila, og den hoppet over manglende `dist`. Nå skanner den `tokens.css`, `tokens-mork-prover.css`, `fonts.css`, `grunn.css`, `Hode.astro`, krever `color-scheme: light` på `:root` og ingen `--mork-*` i `tokens.css`, og feiler hvis `dist` mangler.

### Bevis (4b)

- **Før rettingen (main, nettleser-testen):** `hengsel/: body-bakgrunn er rgb(251, 249, 246), skal være --flate-side (#F2E9DB)`. vis, admin og design besto (de var allerede lyse på main).
- **Blokken fra oppgaven lagt inn på nytt** (jeg la den manuelt inn i `tokens.css`, bygde vis): nettleser-testen feiler med `vis/: color-scheme på html er «dark», skal være light`, og tre regeltester feiler (b: delt fil avviker fra pinnen, c: token-fila, c: bygde sider). Fjernet igjen etterpå.

## Resultat av kjøringene

- `npm run build`: grønt. `npm test`: 99 tester, 0 feil, lenkesjekken grønn.
- axe (color-contrast), mørk maskin, 390 og 1440 px, 25 sider (hengsel 10, vis 3, admin 2, design 5): **0 brudd** etter rettingen. Før rettingen: 0 på forsidene.
- Skjermbilder med mørk maskin, 390 og 1440, forside for alle fire: `claude/k202-skjermbilder/<side>-<bredde>-før|etter.png`. Alle er lyse. hengsel.no skifter fra Off White til `--flate-side`. (Gjenskapes med `node scripts/skjermbilder-k202.mjs før|etter`.)

## Ikke gjort

- Ikke rørt DNS, Cloudflare eller Worker «design». design.hengsel.no viser fortsatt det gamle galleriet til Worker er satt opp (Eiriks steg); rettingen gjelder `sites/design` og er bygget og testet der.
