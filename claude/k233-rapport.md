# K-233 · Nettsidene henter alle app-skjermbilder fra biblioteket på bilder.hengsel.no

14.10.2026. Gren `claude/k233-bibliotek` fra `origin/main` (982b9db, etter K-229). PR mot `main` ([#71](https://github.com/SNgroup-Drift/nettsider/pull/71)), Eirik fletter selv. Sak S-61.
**Rettelse 14.10 (punkt 0):** de 13 romkortene for rom uten app-skjermbilde og dokumentforsiden er nettsidenes egne bilder og ligger lokalt som før, ikke plassholdere.
Oppskriften: `claude/k228/nettsider/LES-MEG.md`, `skjermbilder-bibliotek.test.mjs` og `claude/k228-rapport.md` i hengsel-crm (gren `demo`, d653b66).

## 0. Rettelsen 14.10: nettsidenes egne bilder forblir lokale

Etter K-228-rapporten punkt 6 kommer romkortene for rommene uten app-skjermbilde (dokumenter, gevinst, hvitevarer, kontroll, leder, leverandør, levprøv,
montasjeplan, opplæring, prosjekt, sv, system, veikart) og dokumentforsiden aldri i biblioteket. De er tatt tilbake fra `origin/main` og ligger der de lå:
`sites/vis/src/img/rom-*.webp` (13, lages av `npm run skjermbilder:vis`) og `sites/hengsel/public/img/dok-forside.webp`.

- Lista `LOKALE_BILDER` (nøkkel → fil) står i `packages/hengsel-tokens/skjermbilder.mjs` med `erLokal()` og `lokalUrl()` («vis/rom-sv.webp» → `/img/rom-sv.webp`);
  `KJENTE_MANGLER` har de 47 stiene som skal komme i biblioteket (de 14 er tatt ut).
- `sites/vis/bygg.mjs` lenker dem lokalt i Hengsel-utgaven (`/img/rom-*.webp` i `BILDER` i rom.js og på `/forsta/`, mål lest fra fila; `dok-forside.webp` kopieres fra
  hengsel.no til `dist/img` som før). `A4Side.astro` og `dokumenter.mjs` bruker `/img/dok-forside.webp`. Lenkesjekken henter dem (de ligger i `dist/img`).
- I Sigdal-utgavene (`/kunde/sigdal` og `/kunde/sigdal/vis/`) finnes ikke disse bildene (K-223: ingen Hengsel-bilder der), så de vises som «Skjermbilde kommer»
  slik de Sigdal-stilte plassholderfilene gjorde før. Testen godtar `LOKALE_BILDER` som plassholder bare under `/kunde/sigdal`.
- Testen (`scripts/skjermbilder-bibliotek.test.mjs`): mappene skal være tomme unntatt akkurat filene i `LOKALE_BILDER` (som må finnes), de 14 nøklene skal ikke stå
  i manifestet eller i `KJENTE_MANGLER`, Hengsel-utgavene skal aldri lenke dem fra biblioteket, og `BILDER` i rom.js skal peke på `/img/` for dem.
- `npm run build`, `npm test` (160 tester, 0 feil) og lenkesjekken (663 forespørsler, 0 feil) er grønne. Skjermbildene i `claude/k233/` er tatt på nytt,
  nå også vis-forsiden og `/rom/` med de 13 egne romkortene.

## 1. Kort

- **Én konstant:** `BILDEDOMENE = "https://bilder.hengsel.no/skjermbilder/v1"` i `packages/hengsel-tokens/skjermbilder.mjs` (eksportert som
  `@sngroup/hengsel-tokens/skjermbilder.mjs`; `scripts/lib/bildedomene.mjs` eksporterer det samme til skript og tester). Ingen hemmeligheter.
- **Alle app-skjermbilder lenkes derfra** etter adressetabellen i LES-MEG.md: hengsel.no (`app/`, `apptest/`, `hjelp/<id>`, `dok-forside.webp`),
  /kunde/sigdal (samme stier, tema `sigdal`), vis og Sigdal-utgaven av vis (`vis/skjermbilder/…`, `vis/rom-*`, `flate-*`, `forsta-*`, `hero*`),
  design (`vis/skjermbilder/…`). sngroup.no har ingen app-skjermbilder siden K-229 (ett Hengsel-kort uten bilder), så der er det ingenting å lenke.
- **Bare manifest.json leses ved bygging**, aldri bildene. Byggene (astro.config.mjs i hengsel og design, bygg.mjs i vis) henter
  `…/v1/manifest.json` med 5 s frist og skriver det over kopien `packages/hengsel-tokens/skjermbilder-manifest.json` når det svarer 200 med gyldig
  innhold; ellers brukes kopien, og bygget feiler aldri på det. Første kopi er `claude/k228/manifest.json` fra hengsel-crm (278 filer, laget 14.10 16:47).
- **Plassholderen** «Skjermbilde kommer» er `<figure data-skjermbilde="<nøkkel>">` overalt (Enhet/Skjermbilde på hengsel.no, hjelp, A4-forsiden,
  rammene og kortene i vis, design) og vises bare når bildet ikke står i manifestet. `KJENTE_MANGLER` (K-228-rapporten punkt 6: de 47 stiene i
  `claude/k228/kjente-mangler.json` som skal komme i biblioteket, uten de mørke CRM-utgavene og uten nettsidenes egne bilder i `LOKALE_BILDER`) ligger i
  `scripts/lib/bildedomene.mjs`; alt annet som mangler gir rød test.
- **Testen** `scripts/skjermbilder-bibliotek.test.mjs` er med i `npm test`. De lokale bildemappene er tømt (hengsel `public/img/app`, `public/img/apptest`,
  `public/kunde/sigdal/img` med de 190 plassholderne, vis `src/img` utenom de 13 egne romkortene, `src/skjermbilder` (bare `_kart.json` igjen), design
  `public/skjermer`). `scripts/rammer-vis.mjs` og `scripts/lag-sigdal-plassholdere.mjs` er pensjonert. Ingen `#5074A9` på Hengsel-sidene.
- **Mørke CRM-utgaver** brukes ikke: hengsel.no, vis og design viste alt bare lys utgave, og det er uendret. Ute-skjermene i biblioteket har lys og mørk, men sidene bruker lys.
- `npm run build`, `npm test` (160 tester, 0 feil) og lenkesjekken (663 forespørsler, 0 feil) er grønne. Ingen app-skjermbilder i noen `dist` utenom
  lenker til BILDEDOMENE; det som ligger igjen av webp er nettsidenes egne bilder (`LOKALE_BILDER`), Apples enhetsrammer og `ramme-studio-display.webp`.

## 2. Hva som er gjort, fil for fil

**Felles (`packages/hengsel-tokens`)**
- `skjermbilder.mjs`: `BILDEDOMENE`, `TEMAER`, `bildeUrl()`, `skjermbildeNokkel()` («app/idag-lys.webp» → «app/idag»), `lesManifest()`, `finnes()`,
  `skjermbilde(tema, sti, { hd })` (adresse, mål, og 1×-utgave/srcset når `@1x` finnes), `plassholderHtml()` og `oppdaterManifest()`. Kopien importeres som
  JSON, så Vite bunter den inn i Astro-byggene (der peker ikke `import.meta.url` på pakkemappa).
- `skjermbilder-manifest.json`: sist kjente manifest. `package.json`: begge eksportert.

**hengsel.no (`sites/hengsel`)**
- `Skjermbilde.astro` / `Enhet.astro`: ny prop `bilde="app/idag-lys.webp"` (sti uten tema). Temaet er `kundeFra(Astro.url.pathname)` (sigdal under
  /kunde/sigdal, ellers hengsel), målene kommer fra manifestet, og et bilde som mangler blir plassholderen inne i rammen (skalerer med skjermen; i små rammer vises bare «Skjermbilde kommer»).
- `index.astro`, `ute.astro` (+ `content/ute.ts`), `apptest.astro`: bruker `bilde=`. Apptest-rollene (`apptest/<rolle>-lys.webp`, 2× med @1x) finnes i biblioteket; iOS-skjermene er kjente mangler.
- `data/hjelp.ts` + `kunde/hjelp.astro`: hvert skjermbilde har `id` (min-dag, meny-pc-og-mobil, innkommende, tilbud, ordre, montasje-oversikt, i-dag, de
  samme som «hjelp» i `liste.json`), og siden lenker `hjelp/<id>@1x.webp` 1x / `hjelp/<id>.webp` 2x. Alle sju finnes i manifestet, så ingen plassholdere der nå.
- `dokumenter/A4Side.astro` og `packages/hengsel-dokumenter/src/render.js`: `bildeSti` er `/img/dok-forside.webp` (nettsidenes eget bilde) i Hengsel-utgaven og
  `null` i Sigdal-utgaven → plassholder i `.a4-foto` (stil i `a4.css`).
- `astro.config.mjs`: `await oppdaterManifest()`. `public/_headers` og `worker/kunde.ts` (CSP-en for Sigdal-utgaven av vis): `img-src 'self' data: https://bilder.hengsel.no`.
- `packages/kundetema-sigdal/tilkunde.mjs`: i stedet for å peke `/img/app` osv. til plassholdermappa, byttes `…/v1/hengsel/` til `…/v1/sigdal/` som sikkerhetsnett
  (komponentene velger temaet selv). Pakken avhenger nå av `@sngroup/hengsel-tokens` (package-lock oppdatert).

**vis (`sites/vis`)**
- `bygg.mjs`: leser mål fra manifest.json (ikke lenger `sharp` på lokale filer). `<img data-bibliotek="vis/hero.webp">` i `index.html`, `forsta/` og `prov/`
  får `src`, `width` og `height`; `assets/rom.js` har `b:'rom-reise'` og får tabellen `BILDER` (adresse og mål, `null` = plassholder, kortet lages av
  skript); `assets/bilder.js` får `SKJERM` (2×, 1×, mål) og bygget legger en skjult `<figure data-skjermbilde>` per navn som mangler inn i `.skjerm`, så
  den bygde siden viser hva som venter. `VIS_TEMA=sigdal` gir Sigdal-adresser, `SKJERMBILDER_MANIFEST=kopi` hopper over hentingen (brukes av
  `scripts/bygg-sigdal-vis.mjs`, som ikke lenger skriver om bildestier, men feiler om et rom peker på et lokalt bilde).
- `dokumenter.mjs`: «Slik lages det» fra biblioteket i riktig tema; A4-forsiden fra `/img/dok-forside.webp` (Sigdal: plassholder). Romkortene i `LOKALE_BILDER` lenkes som `/img/rom-*.webp` fra `src/img`. Plassholderstil i `vis.css`, `enhet.css`, `forside.css`. Bunnteksten i rommene
  sier nå «Skjermbildene er tatt fra demoen med oppdiktede data». `src/_headers`: img-src med bilder.hengsel.no.

**design (`sites/design`)**
- `Bilde.astro`: biblioteket (`vis/skjermbilder/<fil>`, 1× og 2×, mål fra manifestet) eller plassholder. `hengsel-no-forside` er ikke en app (K-228-rapporten
  punkt 6) og ligger fortsatt lokalt, flyttet til `public/nettsider/` (`skjermer.ts` kilde «nettside», `scripts/skjermer-hengsel-no.mjs` skriver dit).
- `astro.config.mjs`: `await oppdaterManifest()`. `_headers`: img-src.

**Skript og tester**
- `scripts/skjermbilder-bibliotek.test.mjs` (fra K-228, tilpasset): (1) ingen lokale app-skjermbilder i kildene eller mappene (også `public/kunde/sigdal/img`
  etter K-229), og de to skriptene er borte; (2) ingen `#5074A9` på hengsel, vis og design; (3) «Skjermbilde kommer» bare for `KJENTE_MANGLER`, også i
  tabellene `BILDER`/`SKJERM` i vis (kortene lages av skript); (4) hver bibliotekadresse i dist (HTML og skript) står i manifestet, og `KJENTE_MANGLER` har bare
  nøkler som faktisk mangler (lista må ryddes når bildene kommer); (5) manifestkopien er gyldig og har begge temaer med samme stier (Sigdal uten `hjelp/`).
- `scripts/sjekk-lenker.mjs`: henter ikke bibliotekadresser, men sjekker dem mot manifestet (100 på hengsel, 74 på vis, 14 på design). `hjelp.test.mjs`,
  `design-fasit.test.mjs`, `kundetema.test.mjs` (d: Sigdal-sidene bruker bare `…/v1/sigdal/…`, og alle finnes i manifestet) og `dokumenter.test.mjs` er tilpasset.
- `scripts/skjermbilder-vis.mjs` lager rommet selv i Studio Display for rommene i `LOKALE_BILDER` til `sites/vis/src/img/` som før. `scripts/fiktive-skjermer.mjs`
  nekter å skrive inn i `sites/` (krever `SKJERMER_UT` utenfor).
- `scripts/skjermbilder-k233.mjs` tok skjermbildene i punkt 5. README.md, docs/bilder.md, docs/hosting.md, docs/dokumentvisning.md, sites/vis/README.md og CLAUDE.md er oppdatert.

## 3. Hva sidene viser nå (plassholdere er kjente mangler)

| Side | Plassholder |
|---|---|
| hengsel.no `/` og `/kunde/sigdal` | iPhone i hero (`app/idag`, iOS tas på Mac) |
| `/ute` (begge utgaver) | de seks stegene og «uten nett» (`app/*`) |
| `/apptest`, `/kunde/apptest`, `/kunde/sigdal/apptest` | iOS-skjermene idag, jobben, ks, avvik, ferdig; rollene uten iOS-skjerm (`apptest/*`) kommer fra biblioteket |
| `/kunde/sigdal/dokumenter` og `/kunde/sigdal/vis/dokumenter/` | forsidebildet på arkene (`dok-forside`, finnes bare i Hengsel-utgave); i vis `/dokumenter/` også d1, d4, d2a, d11 og crm-mal-skisser i «Slik lages det» |
| vis forsiden, `/forsta/`, `/prov/`, `/rom/` og gruppesidene | `forsta-kunde`, `flate-kunden`, rom-kunde, rom-minside og rom-tegning; de 13 romkortene for rom uten app og `rom-system` er nettsidenes egne (lokalt); hero, hero-enkel, rom-reise/crm/montor/firmaleder, forsta-reise, flate-butikken/montoren/leverandoren kommer fra biblioteket. I Sigdal-utgaven er de 13 romkortene plassholder |
| vis `/kunde/`, `/minside/`, `/kunden/` | kundeportalen (engangskode) |
| vis `/montor/`, `/tegning/` | k119-flyten (ute-laser, ute-punkter, ute-punktkort, ute-typeskilt, ute-ks-kamera, ute-ipad-bildeverktoy) |
| design `/skjermer` | portal-tilbud og kundeportal-pc |

45 plassholder-nøkler er i bruk: alle står i `KJENTE_MANGLER`, eller er `LOKALE_BILDER` under `/kunde/sigdal`.

## 3b. Sjekken mot det ekte biblioteket gjøres i GitHub Actions (14.10, kveld)

Code-økta når ikke `bilder.hengsel.no` (proxyen avviser verten, og WebFetch slår ikke opp navnet), så sjekken er lagt i workflowen **Bibliotek-sjekk**
(`.github/workflows/bibliotek-sjekk.yml`, `workflow_dispatch` og `pull_request`):
1. `scripts/sjekk-bibliotek.mjs --skriv`: henter det ekte `manifest.json`, lister avvik fra kopien (nye, borte, endrede mål/sha256, kjente mangler som nå finnes,
   egne bilder som likevel ligger der), ber om hver bildeadresse i manifestet (200, `image/webp`, `content-length` = bytes) og skriver kopien i arbeidsmappa.
2. `npm run build` med det ekte manifestet, så `SKJERMBILDER_NETT=1 npm test` (bibliotekstesten, og lenkesjekken ber om hver bibliotekadresse i dist over nettet).
3. `scripts/bibliotek-rapport.mjs` (antall bilder fra biblioteket, egne bilder og plassholdere per side) og `scripts/skjermbilder-k233.mjs --ekte` (uten stand-in).
4. Artefakt `bibliotek-sjekk-<n>`: manifest-kopien, `bibliotek-sjekk.md`, `bibliotek-rapport.md`, `LES-MEG.md` og skjermbildene; det samme i jobbsammendraget.
5. Valget «oppdater kopi» (bare for hånd) committer `packages/hengsel-tokens/skjermbilder-manifest.json` til grenen workflowen kjøres på. Ingen hemmeligheter (GITHUB_TOKEN).
Avvik mellom det ekte manifestet og kopien jeg bygde mot står i `bibliotek-sjekk.md` i artefaktet; jeg har ikke gjettet på dem. Finner workflowen kjente mangler
som nå finnes, feiler test 4 i bibliotekstesten med beskjed om hvilke nøkler som skal ut av `KJENTE_MANGLER`.

## 4. Dette må Eirik gjøre

1. **Kjør Actions › Bibliotek-sjekk › Run workflow på grenen `claude/k233-bibliotek`** (manifestet svarer 200 fra 14.10 kveld), først uten, så med «oppdater kopi»
   når sjekken er grønn, så kopien committes til PR-grenen. Les `bibliotek-sjekk.md` og `bibliotek-rapport.md` i artefaktet eller jobbsammendraget.
   Avviker manifestet fra kopien (navn, mål, manglende filer), står det der; kjente mangler som nå finnes, gir rød test 4 med nøklene som skal ut av `KJENTE_MANGLER`.
   **Ikke flett før sjekken er grønn.**
2. Workers Builds for **hengsel, vis og design** bygger forhåndsversjoner av PR-grenen; sjekk at de er grønne og at bildene faktisk lastes der (CSP-en har
   `img-src https://bilder.hengsel.no`; Sigdal-utgaven av vis får den fra `worker/kunde.ts`).
3. Når bildene i punkt 6 i K-228-rapporten kommer (iOS på Mac, kundeportalen, PDF-arkene, k119, Mål og skisser, e-post, rommene uten app): fjern nøklene fra
   `KJENTE_MANGLER` i `scripts/lib/bildedomene.mjs` (testen sier fra om en nøkkel finnes i manifestet).
4. Rommene uten app-skjermbilde og dokumentforsiden er nettsidenes egne og trenger ingen opplasting: `npm run build && npm run skjermbilder:vis` fornyer
   romkortene i `sites/vis/src/img/` når rommene endres.

## 5. Skjermbilder (`claude/k233/`)

390 og 1280 px av hengsel.no (forsiden), `/kunde/sigdal`, vis (forsiden, `/rom/` og `/crm/`) og sngroup.no, tatt av `scripts/skjermbilder-k233.mjs` mot de bygde sidene.
Biblioteket nås ikke herfra, så adresser som står i manifestet ble svart med sist kjente lokale kopi fra git (origin/main) som stand-in (9 bilder: hero, hero-enkel,
rom-reise/crm/montor/firmaleder og tre skjermer i vis-rommet), og alt annet fikk 404 (plassholderne vises som i drift). Nettsidenes egne bilder (13 romkort, dokumentforsiden)
er ekte lokale filer. hengsel.no-forsiden og Sigdal-forsiden viser den ekte plassholderen i iPhonen; sngroup.no har ingen app-skjermbilder. Se `claude/k233/LES-MEG.md`.

## 6. Merknader

- `sites/sngroup/src/pages/design.astro` har `--aksent: #5074a9` i klassen `.tema-hengsel` (temaprøven på sngroup.no/design). sngroup.no er ikke en
  Hengsel-side (CLAUDE.md), så testen dekker hengsel, vis og design; men prøven viser Sigdals Deep Blue som «Hengsel»-aksent og bør nok rettes i en egen sak.
- K-228-testen (fra hengsel-crm) listet `vis/hero` som kjent mangel; `hero.webp` finnes i manifestet, så den står ikke i `KJENTE_MANGLER` her.
- `sites/vis/src/skjermbilder/_kart.json` (kartet til `fiktive-skjermer.mjs`) står igjen som dokumentasjon; testen krever bare at mappene ikke har bilder.
- HawkScan er ikke kjørt (ingen `HAWK_API_KEY`). Ingen Cloudflare- eller GitHub-miljøer er rørt; ingen nøkler eller passord i endringene.

**K-233 SJEKK KLAR**
