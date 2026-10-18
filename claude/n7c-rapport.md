# N-7c – Nettsidene på designsystemet etter K-371c

Gren `claude/n7c-design-2-10c` fra `origin/main` (d5a8aca, #93, #94 og #95 er flettet). Dagøkt 18.10.2026, startet kl. 20.15. Skrevet av Code. HawkScan hoppet over (ingen nøkkel; statiske sider). Ingen subagenter.

## Kort
- **Pin: `12c2c2450a400ee8a999975f71a14daa60cf6983`** i hengsel-crm (`demo: flett claude/k371c-ds-2-10-delta-demo`, 18.10 kl. 18.10 UTC), designsystem 2.10.0. K-371c var allerede inne i demo da økta startet, så jeg trengte ikke vente. Rapporten `claude/k371c-rapport.md` på demo har bare plassholderen `PIN_COMMIT` der pin-commiten skulle stå, så pinnen er flettecommiten (som N-7b gjorde).
- **`tokens.css` er uendret** (diff mot forrige): bare commit-kommentaren i første linje (`8bb8351a` → `12c2c245`) i `tokens.css` og `tokens-mork-prover.css`. `fonts.css` er helt lik. Ingen verdier endret seg.
- **design.hengsel.no/dokumentmaler:** 29 maler, Designs **55 `side-N.png`** i Hengsel standard (N-7bs egne forhåndsvisninger og skriptet som lagde dem er fjernet), alle sidene i «Alle N sider» (`<details>`, ingen skript), bredde og høyde fra bildet, dokumentasjonsseksjon med LAYOUT-REGLER 3c.
- **/telefon:** i `sitemap.txt`, i `enhetsrammer.test.mjs`, og «Telefon» i hovedmenyen rett etter Kundeportal (aktiv på /telefon; Sigdal-utgaven har den ikke). Test som sier fra når manifestet har `telefon/*`-nøklene.
- `npm test` grønn: **238 tester, 237 bestått, 0 feilet, 1 hoppet over (fra før)**. 6 nye i `scripts/n7c.test.mjs`. `npm run build` bygger alt; `wrangler deploy --dry-run` for design er grønn (959 filer, ingen over grensen).

## Per punkt
### 1. Pin
`npm run design:hent -- --kilde <hengsel-crm> --commit 12c2c245…`. Endring i `scripts/hent-designsystem.mjs`: `dokumentasjon/LAYOUT-REGLER.md` og `dokumentmaler/felter.md` hentes nå (bare disse to .md-filene i tillegg til README; resten av .md holdes utenfor). Mal 29 kom med (`mal.css`, `side-1.png`), og `_maler.json`.

### 2. /dokumentmaler
- `sites/design/src/lib/dokumentmaler.ts` leser mappene, README-tabellen, `felter.json` og `side-N.png` (mål fra PNG-hodet). `kopier-ds.mjs` kopierer nå `side-N.png` til `/ds/dokumentmaler/<mappe>/`; `.md` og `mal.html` holdes fortsatt utenfor.
- Kortene: side 1 øverst (lenker til eksempel.html), «Alle N sider» viser resten. E-postmalene 17–29 har Designs bilder med avsender, «Kundeportal og e-post»-familien, og «Levert av Hengsel»-signaturen i bunnen.
- **Dokumentasjon** (`#dokumentasjon`): LAYOUT-REGLER 3c («navn i stegraden»: høyst 14 tegn, Ferdigmelding og KS, Befaring som hendelse 21-309) hentet fra pinnet fil, ingen Sigdal og ingen hex (testet).
- Fortsatt grønt: N-7b-vakten (ingen Sigdal på siden, CSP-trygge eksempler, ingen `side-N.png` fra kundetema; testen er oppdatert fordi bildene nå er Hengsel standard).

### Det som ikke var i runde 1-pinnen (løst i runde 2, se under)
1. **Mal 29-e11 er foreløpig:** bare `mal.css` og `side-1.png`; ingen `eksempel.html`, `felter.json`, `mal.html` eller rad i README-tabellen (K-371c-rapporten sier det samme: `eksport-2-10c` er ikke kommet). Kortet vises derfor med «foreløpig», flettefelt «kommer» og uten eksempellenker. Navnet «E-post: Hvordan gikk det» står i `FORELOPIG` i `dokumentmaler.ts` (min tolkning av mappenavnet). Testen b) feiler når mal 29 blir komplett, så oppføringen kan fjernes.
2. **«Nye i 2.10b» i `felter.md` finnes ikke:** `felter.md` i commiten har ingen slik seksjon (grep på «2.10» og «Nye i»). Siden har et kort for den som sier det, og viser innholdet automatisk når avsnittet kommer i en senere pin.
3. **Fritekst, merknad og testmodus-stripe i 18-e2 og 27-e10:** `eksempel.html` i 18-e2 og 27-e10 har ikke disse (ingen treff på fritekst, merknad eller testmodus i `eksempel.html`, `mal.html` eller bildene). Jeg har ikke funnet på noe: siden viser det Design har levert. Samme for «signatur» som eget element i e-postene: det som står er «Levert av Hengsel» i bunnen på alle 17–29.

### 3. /telefon-rester
- `public/sitemap.txt`, `enhetsrammer.test.mjs` (`telefon.astro` → `telefon.html`), `content/nav.ts` (`["telefon", "Telefon", "/telefon"]` etter Kundeportal), `pages/telefon.astro` (`aktiv="telefon"`). Bunnmenyen er ikke rørt (ikke bedt om).
- **KJENTE_MANGLER:** de 12 nøklene (7 `telefon/*` og 5 `vis/skjermbilder/*-telefon`) står der. `n7c.test.mjs` f) teller dem og feiler med navnene hvis manifestet har dem, så de kan fjernes (generelle testen i `skjermbilder-bibliotek.test.mjs` gjorde det fra før, men uten egen melding om K-228b). `scripts/lib/bildedomene.mjs` er ikke endret.

### 4. Workers Builds design og admin
Se PR-kommentaren (samme som N-7b: Preview/Deploy command `-c sites/<navn>/wrangler.jsonc`).

### 5. Skjermbilder
`claude/n7c-skjermbilder/` (`node scripts/skjermbilder-n7c.mjs`, etter `npm run build`): `design-dokumentmaler-1440/390.png` (29 kort, 0 bilder uten mål) og `hengsel-telefon-1440/390.png`. Bildene fra biblioteket (bilder.hengsel.no) vises ikke i sandkassen; enhetsrammene på /telefon står uten app-bilde («Skjermbilde kommer»), som i N-8.

## Åpent for Eirik
1. Sjekk at «E-post: Hvordan gikk det» er riktig visningsnavn for mal 29 til Design leverer `felter.json`.
2. Be Design om 2.10c (mal 29 komplett, «Nye i 2.10b», fritekst/merknad/testmodus-stripe i 18-e2 og 27-e10 om de skal være med); da en liten ny pin-runde.
3. K-371c-rapporten har `PIN_COMMIT` som plassholder; pin-commiten her er flettecommiten `12c2c245`.
4. Cloudflare Workers Builds (se PR-kommentaren).

## Kontroll
Ingen nøkler, passord eller tokens i repo, chat, rapport eller logg. Ikke flettet, ikke deployet. Rørte ikke `sites/vis/`, sngroup.no, byggem.no, workflows eller `wrangler.*`. Ingen hex i sidene (`hengsel-regler`-testen grønn). Ingen app-skjermbilder i repoet. For å lese pin-kilden ble hengsel-crm lagt til i økta (`add_repo`, bare lesing) og klonet utenfor repoet.

## Runde 2 (Eirik 20.35): pin mot K-371c andre runde
Runde 1 (PR #96, pin `12c2c245`) ble flettet før andre runde var inne, så dette er en ny gren fra oppdatert `main` (13817d9) og en ny PR; #96 er ikke gjenbrukt.
- **Ny pin: `3ad8cd783be3ffe5af8b1d477bacf7924cf94c6e`** (`demo: flett claude/k371c-ds-2-10-delta-demo`, etter `12c2c245`; funnet av sjekken i bakgrunnen, hvert 5. minutt). Designsystem fortsatt 2.10.0.
- **`tokens.css`, `tokens-mork-prover.css` og `fonts.css` er uendret** bortsett fra commit-kommentaren (`12c2c245` → `3ad8cd78`). Ingen verdier endret seg.
- De tre punktene som sto som «mangler» er nå med:
  1. **Mal 29 er komplett** (`eksempel.html`, `felter.json`, `mal.html`, rad i README-tabellen): `FORELOPIG` er tom, kortet har eksempel- og flettefeltlenker, og testen b) feiler hvis en mal igjen mangler README-rad.
  2. **«Nye i 2.10b» (og «Nye i 2.10» for E11) i `felter.md`** vises som tabeller under «Dokumentasjon» sammen med punktene om signatur, valgfrie avsnitt og testmodus.
  3. **Fritekst, merknad og testmodus-stripe** står i `eksempel.html` for 18-e2 og 27-e10, og alle e-postene 17–29 har signaturen (`epost-signatur`); `n7c.test.mjs` c) sjekker det. De nye bildene viser «Testbestilling – ikke send videre» øverst i 27-e10.
- Dokumentasjonskortene ligger i én kolonne (tabellene er for brede for tre), og felttabellene ruller sidelengs på 390 uten at siden får vannrett rulling.
- `npm test`: 238 tester, 237 bestått, 0 feilet, 1 hoppet over (fra før). Skjermbildene i `claude/n7c-skjermbilder/` er tatt på nytt.
- «Åpent for Eirik» punkt 1–2 over er løst (mal 29 hentet navnet «E-post: Hvordan gikk det?» fra `felter.json`). Punkt 3: K-371c-rapportens `PIN_COMMIT` er fortsatt plassholder hos meg å se; pinnen er flettecommiten.

N-7c KLAR
