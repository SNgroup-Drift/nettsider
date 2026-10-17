# N-1b: Schibsted Grotesk-filene kopieres med i bygget av vis

Gren `claude/n1b-schibsted-filer` fra `origin/main` (56dc9c5).

## Årsak

`sites/vis/bygg.mjs` kopierte bare `schibsted-grotesk-latin-wght-normal.woff2` til `dist/assets/ds/assets/fonts/` (hardkodet filter). Etter N-1 (pin 2.2.0) viser `hengsel-fonts.css` til fire filer, så Normal latin-ext, Kursiv latin og Kursiv latin-ext manglet i `dist`, og lenkesjekken ga 3 feil.

## Rettelse

Bare `sites/vis/bygg.mjs`: fillista leses nå fra `fonts.css` selv (alle `url('./ds/assets/fonts/…')`), og nøyaktig de filene kopieres. Stilarket og kopieringen kan dermed ikke komme ut av takt ved neste pin. Andre sider bruker ikke `hengsel-fonts.css` (sjekket med grep); `scripts/bygg-sigdal-vis.mjs` utelater stilarket og fontmappen bevisst. `HENTES` i `scripts/hent-designsystem.mjs` trengte ingen endring: alle fire filene lå allerede i `packages/hengsel-tokens/ds/assets/fonts`.

## Fillista i `dist/assets/ds/assets/fonts` (vis)

| før | etter |
|---|---|
| `schibsted-grotesk-latin-wght-normal.woff2` | `schibsted-grotesk-latin-wght-normal.woff2` |
| | `SchibstedGrotesk-Normal-latin-ext.woff2` |
| | `SchibstedGrotesk-Kursiv-latin.woff2` |
| | `SchibstedGrotesk-Kursiv-latin-ext.woff2` |

Ingen nye skrifter, ingen designendring, ingen TWK Lausanne eller Sigdal-filer.

## Resultat

- `npm run build` grønn for alle sider.
- `npm test`: 213 tester, 212 grønne, 0 røde, 1 hoppet over. Lenkesjekken i vis er grønn. De tre bibliotekstestene er ikke røde i denne kjøringen (manifestet ble lest fra kopien i repoet fordi bilder.hengsel.no ikke nås fra dette miljøet).
- Rører ikke hengsel-crm, og ikke de kjente røde sjekkene (bibliotek, Workers preview design/admin).

N-1b KLAR
