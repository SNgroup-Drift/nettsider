# K-182 · design.hengsel.no: egen Worker «design» med Hengsel-designfasiten

Status: **ferdig til gjennomgang.** PR mot `main` (Eirik fletter). Gren: `claude/k182-design-worker`.
Ingen DNS eller Cloudflare-oppsett er rørt. Ingen nøkler, passord eller tokens i repoet.

## Hva som er gjort

Del 1 (stoppet 12.10, ingen bygging) spurte hva siden skulle være. Svar fra Eirik: vi bryr oss ikke om hva den viste før (Pages-prosjektet `sngroup-nettsider` har ikke bygd siden PR #43, og byggeinnstillingene lå bare i Cloudflare), siden bygges på nytt som **Designfasit**, åpen med noindex og streng CSP, uten Access.

| # | Punkt | Gjort |
|---|---|---|
| 1 | Merket | `/merke`: alle 8 former × aksent/ensfarget × lys/mørk (32 SVG-er fra designsystemet), fri sone og minste størrelse, 6 app-ikoner, «Levert av» og «Sendt med», kundens logo øverst og Hengsel nederst (CRM-meny lys og mørk, kundeportal, e-post) og plasseringstabellen |
| 2 | Farger | `/farger`: 9 palettfarger, 22 roller i lys og mørk med hex, 15 kontrastpar (beregnet, avrundet ned), 7 statustoner (også «sannsynlig») i lys og mørk, og regelen for kundens aksent (4,5:1 mot lys, 3:1 mot mørk, ikke liten brødtekst i mørk) med beregnede eksempler |
| 3 | Skrift | `/skrift`: Inter og Newsreader (selvhostet woff2, OFL, lisenser lenket), skalaen fra JSON, SF Pro på iPhone, kundetema (fri liste med 6 skrifter, egen fil bare med bekreftet lisens, e-post-reservekjede) |
| 4 | Komponenter | `/komponenter`: knapper, piller, kort uten fargekant, varsel, faner, tabell, skjema (felt og bryter), tom tilstand og Sheet/Dialog. Hver i lys og mørk side om side med «Brukes til» og «Brukes ikke til» |
| 5 | Skjermer | `/skjermer`: CRM Min dag, Tilbud, Ordre (kontrollmål) og Samtaler (Logg samtale), kundeportal (telefon og PC), Hengsel Ute (I dag, Jobben, KS) og hengsel.no, lys og mørk der designet har det. Laget med `scripts/fiktive-skjermer.mjs` (nytt: `SKJERMER_UT` skriver til `sites/design/public/skjermer` uten å røre vis og sngroup.no; ny skjerm `crm-samtaler`) og `scripts/skjermer-hengsel-no.mjs` |
| 6 | Last ned | `/last-ned`: `hengsel.tokens.json`, `tokens.css`, `tokens.ts`, `fonts.css`, `fonts-fri-liste.css` (med sha256), skriftfilene med lisens og `hengsel-logopakke.zip` (32 SVG + lisensfilene, laget ved bygging) |
| 7 | Generert fra tokens | Siden leser `public/ds/tokens/hengsel.tokens.json` direkte (roller, status, palett, skala, kundetema, skrift). `scripts/hent-designsystem.mjs` henter filene fra en **pinnet commit** (`sites/design/designsystem.pin.json`: `4749410947bde111cf88698650b86b945baab842`, designsystem 1.1.0, med sha256 per fil). Testen `scripts/design-fasit.test.mjs` feiler hvis pin og filer er ulike, hvis `tokens.css`/`tokens.ts` ikke samsvarer med JSON, eller hvis den bygde siden ikke viser verdiene i JSON (bekreftet ved å endre én hex og én tekst: testene feilet) |
| 8 | Tokens i repoet | Se «Endringer for å samsvare med designsystemet» under |
| 9 | Arkiv | `docs/design/hengsel-no-2.0/` → `docs/arkiv/hengsel-no-2.0/` (git mv, ingenting slettet) med `docs/arkiv/LES-MEG.md`. De andre `.dc.html`-ene i `docs/design/hengsel` er gjeldende fasit (merke v3, apptest, Logo-bruk, Ute-ikon) og ligger fast |
| 10 | Grep | Se «Grep» under |
| 11 | Docs | `docs/hosting.md` (kolonne for `design`, egen seksjon, domenet), `README.md` (tabell, kommandoer, skript). Admin: lenken til design.hengsel.no fantes allerede (K-184) |
| 12 | Cloudflare | Stegene (a)–(e) under |

Merket v3 gjennomgående: topp (Meny) og bunn (Bunn) bruker `hengsel-aksent-lys/-mork.svg`, favicon er `brand/hengsel-merke/favicon` (svg, 32, 180, 192), og:image (`og.png`, 1200 × 630) er tegnet fra designsystemets skrifter og logo. Ingen gammel H-logo, ingen «by Hengsel».

## Kilde for fasiten: K-186 runde 2

`git log origin/demo` i innlandet-crm-sync har «demo: flett claude/k186-runde2» (`47494109`), så det ble ikke ventet i bakgrunnen, og grenen `claude/k186-runde2` er ikke brukt. Tokens er fra den commiten (Inter og Newsreader, kundetema, mørk `#1F1914`, iOS-farger, «sannsynlig»).

**Skjermbildene** kommer fra to kilder, fordi designfilene på `origin/demo` (`47494109`) ennå har det gamle H-merket nederst i CRM-menyen:
- `crm-samtaler` er laget fra `claude/hengsel-merke-v3` i innlandet-crm-sync (`68caa905`, merkebytte v3), med `scripts/fiktive-skjermer.mjs` og mørk `#1F1914`.
- `crm-min-dag`, `crm-tilbud`, `crm-ordre-kontrollmal`, `portal-tilbud`, `kundeportal-pc` og `ute-*` er de fiktive skjermene fra K-177 (samme skript, samme gren), kopiert fra Visningsrommet. Ingen ekte navn: skriptet feiler på FORBUDT i teksten før bildet tas.
- `hengsel-no-forside` er et skjermbilde av den bygde `sites/hengsel`.
Skal skjermene lages på nytt fra `origin/demo` etter at merkebyttet v3 er flettet der: `NPM_DIR=… DESIGN=…/docs/design/v4 SKJERMER_UT=sites/design/public/skjermer node scripts/fiktive-skjermer.mjs crm-samtaler` (og tilsvarende for de andre).

## Endringer for å samsvare med designsystemet (punkt 8)

**`packages/design/src/styles/tokens.css` er SN Groups palett** (kalk, lin, sand, stein, umbra, fjord, dis), brukt av sngroup.no og byggem.no. Den er ikke Hengsel-paletten og kan ikke få «samme verdier» som designsystemet uten å gjøre sngroup.no og byggem.no om. Jeg har derfor bare byttet det som er **samme rolle**: mørk sidebakgrunn (`flate-side` mørk = `#1F1914`). Resten av forskjellene er følgesaker (tabell under). Hver endring:

| Fil | Før | Etter |
|---|---|---|
| `packages/design/src/styles/tokens.css` `--natt` (mørk bakgrunn, sngroup.no og byggem.no) | `#1e1916` | `#1f1914` |
| `packages/design/src/components/BaseLayout.astro` standard `temafarge` mørk | `#1E1916` | `#1F1914` |
| `packages/design/src/dokumenter/dokumentvisning.css` lysboks (2 steder) | `#1b1713` | `#1f1914` |
| `sites/sngroup/src/pages/design.astro` mørk bakgrunn (3 steder, kontrast regnes ut ved bygging) | `#1E1916` | `#1F1914` |
| `sites/hengsel/src/styles/tokens.css` `--bakgrunn` og `--pa-aksent` mørk (4 steder) | `#1b1713` | `#1f1914` |
| `sites/hengsel/src/styles/hengsel.css` `--surface-app` mørk | `#1b1713` | `#1f1914` |
| `sites/hengsel/src/layouts/Side.astro` `temafarge` mørk | `#1B1713` | `#1F1914` |
| `sites/admin/src/styles/profil.css` `--bakgrunn` og `--pa-aksent` mørk (4 steder) og `sites/admin/src/layouts/Side.astro` `temafarge` (kom med K-184 da main ble flettet inn) | `#1b1713` / `#1B1713` | `#1f1914` / `#1F1914` |
| `sites/vis/src/assets/vis.css` `--bg` mørk (2 steder) og README | `#1B1713` | `#1F1914` |
| `brand/hengsel-merke/README.md` og `favicon/head.html` (theme-color) | `#1B1713` | `#1F1914` |
| `sites/hengsel/src/styles/tokens.css` og `sites/admin/src/styles/profil.css` `--merke-*` (11 linjer i hver, rester av det gamle inline-H-merket, ubrukt) | fantes | fjernet |

**Test:** `scripts/tokens-avvik.test.mjs` (og `node scripts/tokens-avvik.mjs --sjekk`) feiler hvis mørk sidebakgrunn i packages/design, sngroup.no, hengsel.no eller vis avviker fra `flate-side` mørk i designsystemet, hvis de åtte merkevarefargene på hengsel.no avviker, eller hvis `#1b1713`/`#1e1916` dukker opp igjen i kode som tegner flater (enhetsrammer er unntatt). Bekreftet ved å sette `--natt` tilbake: testen feilet.

Sjekk: kontrasten på vis (`--muted` på ny bakgrunn) er 8,8:1, og sngroup.no/design regner ut kontrasten selv. `npm run skjermbilder` (alle sider på alle nettsteder, 0 feil) og `npm test` er grønne. Før/etter for mørk hengsel.no og sngroup.no ligger i `claude/k182-skjermbilder/for-etter/`.

### Følgesaker (krever mer enn et variabelbytte)

Hengsel.no sine egne mørke og lyse roller mot nærmeste rolle i designsystemet (`node scripts/tokens-avvik.mjs`):

| Hva | Verdi i repoet | Nærmeste rolle | Verdi i designsystemet |
|---|---|---|---|
| hengsel.no `--kort` (mork) | `#26201a` | designsystemet `flate-kort` (mork) | `#2A221C` |
| hengsel.no `--flate-myk` (lys) | `#efe5d6` | designsystemet `flate-senket` (lys) | `#F8F2EC` |
| hengsel.no `--flate-myk` (mork) | `#2f2820` | designsystemet `flate-senket` (mork) | `#251E18` |
| hengsel.no `--flate-sterk` (mork) | `#3b3229` | designsystemet `flate-valgt` (mork) | `#3A3028` |
| hengsel.no `--linje` (mork) | `#3b3229` | designsystemet `linje` (mork) | `rgba(242, 233, 219, 0.14)` |
| hengsel.no `--tekst` (mork) | `#f1e9de` | designsystemet `tekst` (mork) | `#F2E9DB` |
| hengsel.no `--tekst-dempet` (lys) | `#5e564c` | designsystemet `tekst-dempet` (lys) | `rgba(49, 38, 29, 0.72)` |
| hengsel.no `--tekst-dempet` (mork) | `#c3b7a8` | designsystemet `tekst-dempet` (mork) | `rgba(242, 233, 219, 0.72)` |
| hengsel.no `--tekst-svak` (lys) | `#6e6355` | designsystemet `tekst-svak` (lys) | `#6F6458` |
| hengsel.no `--tekst-svak` (mork) | `#9a8e80` | designsystemet `tekst-svak` (mork) | `rgba(242, 233, 219, 0.56)` |
| hengsel.no `--ok` (lys) | `#376c49` | designsystemet `status ok fg` (lys) | `#3B6547` |
| hengsel.no `--ok` (mork) | `#8cc39b` | designsystemet `status ok fg` (mork) | `#9FC28A` |
| hengsel.no `--feil` (mork) | `#e69a87` | designsystemet `status feil fg` (mork) | `#E5927A` |

I tillegg, ikke gjort:
- **hengsel.no `--aksent` mørk** er `var(--dusty-blue)` (`#9CA9BD`), designsystemet har `aksent` mørk `#8FA9D1` og `aksent-tekst` `#8FA9D1`. Lys `--bakgrunn` er Off White på hengsel.no (valgt i K-174), designsystemets `flate-side` er Beige 3.
- **hengsel.no, vis og Visningsrommets** egne tekst-, kort- og linjeverdier i mørk (`#F1E9DE`, `#26201A`, `#2F2820`, `#3B3229`) er ikke rollene i designsystemet.
- **sngroup.no og byggem.no** bruker SN Groups palett (`packages/design/tokens.css`). Bytte til Hengsel-roller er en egen designbeslutning.
- **Enhetsrammer** (`#1b1713` i `Enhet.astro`, `--ramme`/`--lysboks`, telefonrammen i `sites/vis`): maskinvare, ikke flate. Designsystemet har `ramme` mørk `#000000`.
- **App-ikonenes mørke fyll** (`#1B1713` i SVG-ene i `brand/hengsel-merke/app-ikon` og `LES-MEG.md`) er kunstverk fra Claude Design og må tegnes på nytt der, ikke byttes her.
- **Designsystemets egen `guidelines/hengsel-merke.md`** sier fortsatt «mørk `#1B1713`» (flaten til merkefilene). Tokens (`#1F1914`) er fasit; retningslinjen bør rettes i K-186.
- **`docs/kilde/**`** (historiske kilder) og `sites/vis/fasit` er ikke endret.

## Grep (punkt 10)

Søkt i `sites/hengsel`, `sites/design`, `sites/admin` og `packages/design` (utenom `public/ds`, som er designsystemets filer og er sjekket mot pin, og utenom `docs/arkiv`). `sites/admin` (K-184) kom med da main ble flettet inn: 0 treff på «by Hengsel», «engsel», Lausanne og Reckless; `--merke-*` fjernet som i hengsel; mørk bakgrunn er byttet (tabellen over).

| Mønster | Treff utenom arkivet | Rettet |
|---|---|---|
| «by Hengsel» | 0 | – |
| «engsel» som eget ord (lest som det gamle H-merket med «engsel»; treff på «Hengsel» er ikke tatt med) | 0 | – |
| Lausanne, Reckless (i kode, filer og filnavn) | 0 | – |
| Gammel H-logo: «H-merke», `hengsel-merke-liten`, `v2-h-merke`, «Gjennom linsa», `--merke-*` | 11 linjer `--merke-dor/-linje/-grep/-ord/-crm` i `sites/hengsel/src/styles/tokens.css` og i `sites/admin/src/styles/profil.css` (ubrukte, rester av inline-merket) | Fjernet. Alle logofiler i `sites/hengsel/public/logo` er byte-for-byte like designsystemets (v3); `ute.svg` er `brand/hengsel-merke/app-ikon/visning/ute.svg` |
| Gammel mørk bakgrunn `#1B1713` / `#1E1916` | 15 treff i kode | Byttet (tabellen over); igjen: enhetsrammer og app-ikon-SVG (følgesak) |

Testen `design-fasit.test.mjs` sjekker det samme på hele `sites/design/dist` (tekst, alt, tittel, aria, css, js, svg): ingen FORBUDT-treff (K-151-listen: merkenavn, leverandører, ekte kunder), ingen «by Hengsel», «engsel», H-merke, Lausanne eller Reckless.

**Unntak du bør vite om:** `tokens/hengsel.tokens.json` og `tokens.ts` (nedlastingene, uendret fra designsystemet) har kundetemaeksempelet «Studio Sigdal Innlandet» med Sigdal-skriftene («TWK Lausanne», «Reckless Standard M»). Siden åpen og uten Access publiserer de dermed navnet på en ekte kunde (og skrifttypenavn, ikke skriftfilene). På selve sidene er eksempelet erstattet av «Eksempel Interiør AS» med samme aksent og Hengsel-skriftene. Anbefaling: fjern eksempelet fra `kundetema.eksempler` i designsystemet (K-186) og pin på nytt; da forsvinner unntaket i testen. Si fra hvis nedlastingene heller skal renses her.

## Tester og sjekker (alle grønne)

- `npm run build`: alle seks nettstedene bygger. `npx wrangler deploy --dry-run -c sites/design/wrangler.jsonc`: leser 129 filer, ingen bindinger.
- `npm test` (etter flett med main/K-184): 76 tester (hvorav 12 nye: `design-fasit.test.mjs` og `tokens-avvik.test.mjs`) + lenkesjekken: **design: 89 interne adresser og 74 bilder/videoer svarer 200, ukjente sider får 404.html**; hengsel, sngroup, byggem, vis og admin grønne (777 forespørsler, 0 feil).
- `node scripts/skjermbilder-design.mjs` (Chromium og axe-core 4.14): 8 sider × 390/1440 px × lys/mørk = 32 kombinasjoner, hver med **0 kontrastbrudd** og **0 øvrige axe-brudd** (WCAG 2.x A/AA og beste praksis), ingen konsollfeil eller CSP-brudd, ingen eksterne forespørsler, ingen `style=`-attributter eller inline-skript, alle bilder har width/height, ingen vannrett rulling (også ved 360 px).
- `npm run skjermbilder` (den gamle sjekken av alle nettsteder): 0 feil. Skriptet hopper nå over `design` (har egne sjekker), og skjermbildene det skriver (`docs/skjermbilder`, `claude/k160-`, `k172-`) er ikke tatt med i PR-en.
- Det er ikke kjørt Lighthouse, skjermleser, tastaturnavigasjon utover fokusringer, eller Safari/iOS. Bryteren Auto/Lys/Mørk trenger skript; uten skript følger siden systemet.

## Skjermbilder

`claude/k182-skjermbilder/`: alle sider i 390 og 1440 px, lys og mørk (`<side>-<bredde>-<lys|mork>.webp`, 32 filer). `for-etter/`: hengsel.no og sngroup.no i mørk modus før og etter bakgrunnsbyttet.
**Før-bilde av design.hengsel.no finnes ikke:** siden er bygget på nytt, den gamle versjonen er ikke i repoet, Pages-bygget har feilet siden PR #43, og nettet herfra når ikke design.hengsel.no (403 fra proxyen).

## Ikke gjort (og hvorfor)

- **admin (lenker):** `sites/admin/src/data/plattform/lenker.json` har allerede «design.hengsel.no» (lagt inn i K-184, «Designsystemet (sites/design, K-182)»). Ingen endring nødvendig.
- **DNS, Cloudflare, Access, Workers Builds-kobling:** ikke rørt (stegene under er dine).
- **`public/ds/tokens/HengselTokens.swift` og designsystemets `index.html`** er ikke kopiert (Swift hører til appen; `index.html` er erstattet av denne siden).
- **sngroup.no/design** (SN Groups egen designside) er uendret utenom mørk bakgrunn.

## Cloudflare etter fletting: stegene for Eirik

Rekkefølgen holder nedetiden kort. Ikke gjør (b) før (a) er bekreftet, og gjør (b) og (c) rett etter hverandre.

**(a) Worker «design» har deployet.**
1. Cloudflare → Workers & Pages → Create → Workers → **Import a repository** → `SNgroup-Drift/sngroup-nettsider`.
2. Worker-navn: `design`. Produksjonsgren: `main`. Path: `/`.
3. Build command: `npm run build -w sites/design`
4. Deploy command: `npx wrangler deploy -c sites/design/wrangler.jsonc`
5. Non-production branch deploy command: `npx wrangler versions upload -c sites/design/wrangler.jsonc`
6. Build variables: `NODE_VERSION` = `22`. API-token: samme nettside-token som de andre.
7. Build watch paths, include: `sites/design/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json`.
8. Vent på «Deployed» og åpne `https://design.drift-697.workers.dev`: forsiden skal vise «Fasiten for Hengsel» med merket i toppen. (Hvis deploy feiler med «Missing entry-point», mangler `-c` i Deploy command eller Non-production branch deploy command.)

**(b) Fjern design.hengsel.no fra Pages-prosjektet.** Workers & Pages → Pages-prosjektet `sngroup-nettsider` → Custom domains → `design.hengsel.no` → Remove. Domenet er nede til (c) er gjort.

**(c) Legg design.hengsel.no som Custom domain på Worker «design».** Workers & Pages → `design` → Settings → Domains & Routes → Add → **Custom domain** → `design.hengsel.no` → Add. Cloudflare lager DNS-posten og sertifikatet selv (`hengsel.no` ligger i samme konto). Hvis Cloudflare sier at det allerede finnes en DNS-post for `design` (CNAME til `sngroup-nettsider.pages.dev` fra Pages): slett den posten i hengsel.no → DNS → Records og legg til custom domain på nytt. Ikke lag `www.design.hengsel.no`.

**(d) Sjekk at siden svarer 200.**
```sh
curl -s -o /dev/null -w '%{http_code}\n' https://design.hengsel.no/            # 200
curl -s -o /dev/null -w '%{http_code}\n' https://design.hengsel.no/farger      # 200
curl -s -o /dev/null -w '%{http_code}\n' https://design.hengsel.no/finnes-ikke # 404 (404-siden)
curl -sI https://design.hengsel.no | grep -iE 'x-robots-tag|content-security-policy'   # noindex, nofollow og streng CSP
curl -s https://design.hengsel.no/ds/tokens/hengsel.tokens.json | head -c 200  # tokens
```
Åpne siden i et privat vindu og se at merket (symbol + «Hengsel») står i toppen, at fanen har Hengsel-symbolet som favicon, og at Auto/Lys/Mørk-bryteren virker.

**(e) Slå av bygg i Pages-prosjektet og slett det etter en uke.**
1. Pages-prosjektet `sngroup-nettsider` → Settings → Builds → Branch control → **Automatic deployments: Disabled** (slik at ingen flere bygg starter og feiler).
2. La prosjektet stå i en uke og sjekk at `design.hengsel.no` svarer 200 hele uka (kjør (d) en gang per dag, eller sjekk Workers → `design` → Metrics).
3. Etter en uke: Pages-prosjektet `sngroup-nettsider` → Settings → **Delete project**. Det er forsvarlig fordi alle nettstedene (hengsel, sngroup, byggem, design) nå kjører som Workers, og `vis` ligger i sitt eget Pages-prosjekt (`vis`, ikke rørt).

## Filer

`sites/design/` (Astro, 8 sider, `wrangler.jsonc`, `public/_headers`, `designsystem.pin.json`, `public/ds`, `public/skjermer`, `public/merke/app-ikon`), `scripts/hent-designsystem.mjs`, `lag-logopakke.mjs`, `lag-og-design.mjs`, `skjermer-hengsel-no.mjs`, `skjermbilder-design.mjs`, `tokens-avvik.mjs`, `design-fasit.test.mjs`, `tokens-avvik.test.mjs`, `docs/arkiv`, `docs/hosting.md`, `README.md`.
