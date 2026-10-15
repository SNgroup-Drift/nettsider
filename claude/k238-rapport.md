# K-238: ny aksent fra K-234, Bibliotek-sjekkens rapport og sngroup.no/design (15.10.2026)

Sak S-61. Gren `claude/k238-aksent-og-sjekk` fra `origin/claude/k233-bibliotek` (PR #71, 4eba214). PR mot main opprettes først når PR #71 er flettet.
Skjermbilder før og etter: `claude/k238/` (hengsel.no-forsiden med knappen, sngroup.no/design; 390 og 1280 px; `for.json` og `etter.json` med verdiene nettleseren ser).

## 1. Ny pin av Hengsel-tokenene (K-234)

- `npm run design:hent -- --kilde <hengsel-crm> --commit 7ff84e88` (demo i SNgroup-Drift/hengsel-crm, «demo: flett claude/k234-knappetekst-r2»; `_ds/hengsel-designsystem` er uendret til HEAD 1df2ea1b). Designsystem 2.1.0, 374 filer i pin-fila. Én pin.
- Den delte fila `packages/hengsel-tokens/tokens.css`: `--aksent: #05806F` (var `#068472`), `--paa-aksent: #FBF9F6` (var `#FFFFFF`), P3-aksent `color(display-p3 0.2196 0.4941 0.4353)` (var `0.2275 0.5098 0.4471`). Med fra 2.1.0 (K-222, plattformlag): `--overlegg: rgba(26, 29, 34, 0.40)`, `--alltid-mork: #0B0D11`, ny rolle `--paa-alltid-mork: #EAEDF0`; i de mørke fargeprøvene (bare design.) `--mork-kant #767B82`, `--mork-tekst-svak #90969D`, `--mork-ramme #3D4248`, `--mork-overlegg rgba(0,0,0,0.60)`, `--mork-alltid-mork #0B0D11`, `--mork-paa-alltid-mork #EAEDF0`. Ny fil i ds: `tokens/plattform.css` (brukes ikke av sidene).
- Knappen på hengsel.no: før `rgb(6, 132, 114)` med hvit tekst, etter `rgb(5, 128, 111)` med Off White `rgb(251, 249, 246)` (`claude/k238/etter.json`).
- Testene som pinnet furu-verdiene:
  - `scripts/gamle-farger.test.mjs` (P3-blokken): krever nå K-234-aksenten i P3 og at resten av blokken er lik palettpakkens besluttede blokk; furu-aksenten i P3 gir rødt.
  - `scripts/kundetema.test.mjs` f): Off White `#FBF9F6` er nå både Hengsels `--paa-aksent` og Sigdals bakgrunn, så farger begge temaer har sjekkes ikke lenger som «feil tema».
  - `scripts/design-fasit.test.mjs` leser verdiene fra pinnet JSON og trengte ingen endring (grønn).
- `packages/kundetema-sigdal/tokens.css`: den nye rollen `--paa-alltid-mork` byttet ut (Off White), og «aldri #FFFFFF» i kommentaren omskrevet, siden `#FFFFFF` ikke lenger finnes i den delte fila (hengsel-regler a).
- `scripts/hent-designsystem.mjs`: legger nå også merkepakke v2 (K-231) inn igjen etter palettpakken. Uten det forsvant 146 merkepakke-filer fra ds og blokken `merkepakke` fra pin-fila ved denne pinnen (oppdaget og rettet her). Repo-navnet i pin-fila, skriptet, CLAUDE.md og README er `SNgroup-Drift/hengsel-crm` (før innlandet-crm-sync).
- `docs/design/hengsel-regler.md` punkt 5 og kildedokumentet `docs/hjelp/hengsel-brukerveiledning.html` oppdatert til `#05806F`. `scripts/skjermbilder-k212-runde2.mjs` (K-212-sjekken) forventer nå K-234-verdiene.
- **`#068472` som er igjen, utenfor historikk:** bare der furu er furu og ikke aksent: `--furu` (råfargen i paletten, generert fra `palett.furu` i pinnet JSON) i `tokens.css`, og stiften i logoene og favicon-flisen (`hengsel-aksent-lys.svg`, `levert-av-hengsel-lys.svg`, `favicon-flis.svg` i sites/ og ds/assets fra palett- og merkepakken). Designsystemet selv har `logo.stift.lys = #068472` og logoene på demo er uendret, så de er riktige. Pinnet `hengsel.tokens.json` har også furu i rampen (trinn 9) og i montørapp-laget; det endres bare i designsystemet. Selvtesten i gamle-farger bruker `#068472` som eksempel på en farge som IKKE er gammel brevann. Ingen `#068472` i sidenes CSS, Astro, TS eller bygde sider ellers.

## 2. Bibliotek-sjekk: rapportfilene manglet i sammendraget

Årsak (kjøring 5 på PR #71, jobb 116088820600): `scripts/skjermbilder-k233.mjs` startet med `rm -r claude/k233` og slettet `bibliotek-sjekk.md` og `bibliotek-rapport.md` som alt var skrevet. Artefaktet fikk 14 filer (manifest-kopi, LES-MEG.md og 12 skjermbilder), sammendraget bare LES-MEG.md. Rettet:

- `scripts/sjekk-bibliotek.mjs`: sjekken ligger i en funksjon med `try/finally`; `bibliotek-sjekk.md` skrives alltid, også når manifestet ikke nås (exit 2, med adressen og feilen i fila) eller skriptet stopper (exit 1, med feilen). Prøvd uten nett: fila skrives, exit 2.
- `scripts/bibliotek-rapport.mjs`: samme grep; mangler byggene eller stopper skriptet, står det i fila (exit 1).
- `scripts/skjermbilder-k233.mjs`: fjerner bare egne filer (`*.webp` og `LES-MEG.md`), ikke hele mappa.
- `.github/workflows/bibliotek-sjekk.yml`: skjermbildene og rapporten er to steg (begge `if: always()`, skjermbildene først), og sammendraget skriver exit-koden fra sjekken, utfallet av `npm test`, og de tre filene, eller «mangler» med forklaring om en fil ikke finnes.

Det kjøringen faktisk feilet på var testen «Skjermbilde kommer vises bare for kjente mangler» (ikke rapportene): 17 bilder som ikke står i det ekte manifestet og ikke i `KJENTE_MANGLER` (apptest/foresporsler, apptest/ruten, apptest/mottak, hjelp/i-dag, vis/hero, vis/skjermbilder/ute-*, vis/flate-montoren). Ikke rørt her (punkt 4).

## 3. sngroup.no/design: `#5074a9` i temaprøven

`sites/sngroup/src/pages/design.astro`, `.tema-hengsel` under Familiegrep: `--aksent: #5074a9` og `--pa-aksent: #fbf9f6` fjernet, så prøven bruker SN Groups `--aksent` (fjord `#46698f`) og `--pa-aksent` fra `packages/design`. Før: `--aksent #5074a9`; etter: `#46698f` (`claude/k238/for.json` og `etter.json`). Ingen `#5074a9` igjen i sites/sngroup.

## 4. Ikke rørt

`KJENTE_MANGLER` (`scripts/lib/bildedomene.mjs`) og manifest-kopien `packages/hengsel-tokens/skjermbilder-manifest.json`: det gjør Bibliotek-sjekk med «oppdater kopi» etter neste Skjermbilder-kjøring.

## Sjekk

- `npm run build`: grønn (alle sidene; biblioteket nås ikke fra Code-økta, kopien av manifestet brukes som før).
- `npm test`: 160 tester, 0 feil; lenkesjekken 663 forespørsler, 0 feil.
- `node scripts/hent-designsystem.mjs --kilde <hengsel-crm>` uten `--commit`: filene på pinnet commit er lik pin-fila.
- Skjermbilder: `node scripts/skjermbilder-k238.mjs for|etter` (nytt skript), ingen konsollfeil, ingen horisontal rulling på 390.
- Workflowen Bibliotek-sjekk er ikke kjørt herfra (ingen PR ennå); kjør den for hånd på grenen når PR #71 er flettet og PR-en mot main er oppe.
