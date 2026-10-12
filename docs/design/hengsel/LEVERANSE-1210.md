# Hengsel – leveranse fra Claude Design (12.10.2026)

Alt som er relevant for GitHub fra prosjektet «Hengsel.no 2.0 redesign». Mappestrukturen følger repoet `SNgroup-Drift/sngroup-nettsider`.

```
til-github/
  hengsel-merke/          Logo, app-ikoner og favicon – med README til Claude Code
  docs/design/hengsel/    Designfasit for hengsel.no 2.0, /apptest og merket
```

## 1. `hengsel-merke/` – nytt merke
Legg mappa i repoet som `brand/hengsel-merke/`, eller der dere samler merkevarefiler. `hengsel-merke/README.md` er oppgaven til Claude Code. Den beskriver hvordan merket byttes i hengsel.no, vis.hengsel.no, CRM, Ute (iOS, Expo og Android), kundeportalen, PDF, e-post og sngroup.no, og har en sjekkliste for når jobben er ferdig.

## 2. `docs/design/hengsel/` – designfasit
Legg mappa i repoet som `docs/design/hengsel/` og erstatt det som ligger der fra før. Sidene er Design Components (`.dc.html`) som åpnes i nettleseren via en lokal server:
```
cd docs/design/hengsel && npx serve .
```
Åpne deretter `Oversikt.dc.html`. Ved direkte åpning av fila fra disk blir ikke bildene og delene lastet.

| Fil | Hva |
|---|---|
| `Forside`, `CRM`, `Ute`, `Kundeportal`, `Slik-virker-det`, `Dokumenter`, `Integrasjoner`, `Priser-og-demo` | De åtte sidene i hengsel.no 2.0 (PC 1440 og telefon 390, lys og mørk) |
| `Meny`, `Bunn`, `Enhet`, `CrmSkjerm`, `PortalSkjerm`, `A4Side`, `dokumenter-data.js` | Felles deler |
| `Apptest`, `Apptest-passord` | hengsel.no/apptest og passordsiden. Tilstander: `?enhet=iphone\|android\|apk\|pc`, `?feil=tom`, `?tema=lys\|mork` |
| `Logo-bruk` | Fasit for merket: former, plasseringer, app-ikoner og tekstregler |
| `Ute-ikon` | Fasit for app-ikonet med animert forhåndsvisning |
| `Oversikt` | Alle sidene i fire visninger, med tilstandsknapper for /apptest |
| `Kontroll` | Automatisk sjekk av kontrast, overflyt og bilder |
| `LES-MEG.md` | Beskrivelse av hengsel.no 2.0 og alle tekstene ordrett |
| `Apptest-valg.md` | Valgene for /apptest og det som må fylles inn |
| `support.js` | Kjøretøy for `.dc.html` |
| `_ds/` | Hengsel-designsystemet (tokens og komponenter, Newsreader og Inter) |
| `hengsel.no/`, `hengsel-merke/` | Bilder, iOS-skjermbilder og logofiler som sidene bruker |

## 3. Oppgaver til Claude Code
1. **Merket:** følg `hengsel-merke/README.md`.
2. **hengsel.no 2.0:** bygg sidene i `sites/hengsel` (Astro) etter `docs/design/hengsel/LES-MEG.md` og de åtte sidene. Logoen er allerede byttet til det nye merket i designet.
3. **/apptest:** bygg en statisk Astro-side bak dagens passord-Worker, med noindex, uten oppføring i sitemap og uten lenke fra menyen. Følg `Apptest.dc.html` og `Apptest-valg.md`. Behold `data-demopassord`-merkene. Skriptene skal være små og innebygde, og siden skal virke uten skript. QR-koden lages som SVG ved bygging.
4. **Designsystemet:** skriftene er byttet til Newsreader (titler) og Inter (tekst), og de lisensierte skriftfilene er fjernet. Oppdater `hengsel-designsystem` i repoet tilsvarende hvis det ikke er gjort.

## Ikke med
- `hengsel-no-2.0/`: en eldre kopi av sidene i prosjektet. Den er erstattet av filene over.
- `uploads/`: iOS-designeksporten (runde 1–7) og ordrene. De hører til iOS-prosjektet og ligger allerede der.
