# SN Group nettsider

Nettstedene til SN Group (ES-HOLDING AS, org.nr. 927 363 585), samlet i ett repo:

| Nettsted | Mappe | Innhold |
|---|---|---|
| sngroup.no | `sites/sngroup` | Forsiden med plantegningen, virksomhetene, Hengsel, kontakt, `/personvern` (montørappen Hengsel) og `/design` |
| hengsel.no | `sites/hengsel` | hengsel.no 2.0 (K-160): forside, /crm, /ute, /kundeportal, /slik-virker-det, /dokumenter, /integrasjoner, /priser-og-demo (skjema til /api/demo), personvern, /apptest og 404 |
| byggem.no | `sites/byggem` | Forside, prosjekter, kontakt, personvern og 404 (K-87 del 5) |
| design.hengsel.no | `sites/design` | Designfasiten for Hengsel (K-182): merket v3, farger i lys og mørk, skrift, komponenter og fiktive skjermer. Astro, generert fra Hengsel-designsystemets tokens (pinnet commit), åpen men noindex, egen Worker `design` (se `docs/hosting.md`) |
| hengsel.no/kunde/sigdal | `sites/hengsel` (`src/pages/kunde/sigdal*`) + `packages/kundetema-sigdal` | K-223: Sigdal-utgave av Hengsel-sidene og Visningsrommet (`/kunde/sigdal/vis/`), bak Cloudflare Access, noindex. Se `claude/k223-rapport.md` |
| vis.sngroup.no | `sites/vis` | Visningsrommet: lukket demo bak Cloudflare Access, ren HTML uten Astro, på Cloudflare Pages (K-110, se `sites/vis/README.md`) |

**Hengsel-sidene** (hengsel.no, vis., design., admin.) har én delt token-fil og bare lys modus; reglene står i [docs/design/hengsel-regler.md](docs/design/hengsel-regler.md).

Alt er statisk (Astro, og ren HTML for Visningsrommet): ingen server, ingen database, ingen sporing og ingen informasjonskapsler. Unntakene på hengsel.no: /apptest ligger bak et felles passord med et lite Worker-skript og én informasjonskapsel, og demoskjemaet sender til /api/demo i samme Worker (se docs/hosting.md).

## Oppsett

```
packages/design/        Felles designpakke
  src/styles/tokens.css   Fargene (lys og mørk), skrift og mål som CSS-variabler
  src/styles/base.css     Grunnstil
  src/styles/fonts.css    Newsreader og Inter, selvhostet fra npm (@fontsource-variable). Importeres av
                          sngroup.no og hengsel.no; byggem.no bruker Poppins og Inter (se sites/byggem/src/layouts/Side.astro)
  src/components/         BaseLayout, SiteHeader, SiteFooter, Section, Card, ContactBlock,
                          CompanyRow, PrivacyPage, ComingSoon
                          Familiegrep: Toppfelt, Plantegningsstrek, Familiebaand, IkkeFunnet
packages/hengsel-tokens/  Den delte Hengsel-fila (K-192): tokens.css og fonts.css genereres fra hengsel.tokens.json (ds/, pinnet commit, designsystem.pin.json);
                          src/Hode.astro og grunn.css er rammen for hengsel.no og admin. Se docs/design/hengsel-regler.md
packages/hengsel-dokumenter/  A4-dokumentene (data, markup, stil, visning) som hengsel.no og vis. deler
sites/<navn>/           Ett Astro-prosjekt per nettsted
  src/content/            Tekst og selskapsopplysninger (TODO der tekst mangler)
  src/pages/              Sidene
  public/_headers         Sikkerhetshoder (Cloudflare Workers, statiske filer)
  public/_redirects       Stibaserte omdirigeringer (www → apex gjøres i Cloudflare, se docs/hosting.md)
  wrangler.jsonc          Worker-oppsett: navn, dist som statiske filer, 404-side (ingen nøkler; kode bare for hengsel.no/apptest)
  worker/                 (bare hengsel) index.ts sender /apptest til apptest.ts (passordet) og /api/demo til demo.ts (demoskjemaet)
scripts/
  sjekk-lenker.mjs        npm test: alle interne lenker på de bygde sidene svarer 200
  skjermbilder.mjs        Skjermbilder og nettlesersjekker (360 px, konsoll, CSP)
  skjermbilder-apptest.mjs  Skjermbilder og sjekker av hengsel.no/apptest mot wrangler dev (passordet)
  apptest-versjon.mjs     Oppdaterer versjon, APK, dato og «Hva er nytt» på /apptest fra EAS og byggnotatene (kjøres av .github/workflows/apptest-versjon.yml; testet av apptest-versjon.test.mjs)
  skjermbilder-vis.mjs    Skjermbilder og sjekker av Visningsrommet (390 og 1280 px, lys og mørk, skriftene)
  hent-designsystem.mjs   Henter Hengsel-designsystemet (pinnet commit) til packages/hengsel-tokens/ds og genererer den delte token-fila (K-182, K-192)
  hent-palettpakke.mjs    Legger palettpakke v2 (design/handoff/…, K-212 runde 2): logoer, ikonsett, favicon og app-ikon inn i ds og pin-fila
  lag-appikon.mjs         PNG-forhåndsvisninger av app-ikonet Hengsel Ute fra Icon Composer-pakken (ds/assets/app-ikon)
  lag-hengsel-tokens.mjs  Genererer packages/hengsel-tokens/tokens.css og fonts.css fra hengsel.tokens.json (--sjekk)
  hengsel-regler.mjs      Skanner Hengsel-sidene for fargeverdier og mørk modus; hengsel-regler.test.mjs er testen (K-192)
  design-fasit.test.mjs   npm test: design.hengsel.no og tokens er like (pin, tokens.css/ts, roller, status, skrift, logoer, komponenter, ingen ekte navn eller gammel logo)
  csp-hasher.mjs          Legger hashen for inline-CSS inn i CSP-en i dist/_headers
  statisk-server.mjs      Liten server som løser stier og 404 som Cloudflare Workers
```

## Kommandoer

Krever Node 22.12 eller nyere (`.nvmrc`).

```sh
npm install
npm run build          # bygger alle nettstedene til sites/*/dist
npm test               # sjekker interne lenker (etter build)
npm run skjermbilder   # skjermbilder til docs/skjermbilder + nettlesersjekker (krever Chromium)
npm run dev:sngroup    # utviklingsserver (også dev:hengsel, dev:byggem og dev:design)
npm run design:hent -- --kilde <innlandet-crm-sync> --commit <sha>   # henter designsystemet til packages/hengsel-tokens (pinnet)
npm run design:skjermbilder   # skjermbilder og axe for design.hengsel.no (krever Chromium)
```

## Legge til et nytt nettsted

1. Kopier et nettsted som utgangspunkt: `cp -r sites/byggem sites/<navn>` og slett `sites/<navn>/dist` og `node_modules` hvis de finnes.
2. I `sites/<navn>/package.json`: sett `"name": "@sngroup/site-<navn>"`.
3. I `sites/<navn>/astro.config.mjs`: sett `site` til riktig domene.
4. Fyll inn `src/content/selskap.ts` og `src/content/personvern.ts`. Bruk bare tekst som er bekreftet, og skriv `TODO` der noe mangler.
5. Bytt domenet i `public/_redirects`-kommentaren og i `public/sitemap.txt`, og sett `"name"` i `wrangler.jsonc` til `<navn>`.
6. Kjør `npm install`, `npm run build` og `npm test` fra rotmappen.
7. Sjekk Worker-oppsettet uten å logge inn: `npx wrangler deploy --dry-run -c sites/<navn>/wrangler.jsonc`.
8. Opprett en Worker med Git-integrasjon etter [docs/hosting.md](docs/hosting.md), og legg nettstedet til i tabellen der.

`npm run build` bygger alle mappene under `sites/` automatisk (npm workspaces), og `npm test` sjekker dem alle.

## Bygging og publisering

Hvert nettsted er sin egen Cloudflare Worker med statiske filer (Workers Builds med Git-integrasjon), koblet til dette
repoet. En push til `main` bygger og publiserer. Andre grener lastes opp som forhåndsversjoner. Oppsettet for hver Worker
ligger i `sites/<navn>/wrangler.jsonc`, og innstillingene i Cloudflare står i [docs/hosting.md](docs/hosting.md).

Ingen API-nøkler, kontoinformasjon eller wrangler-innlogging ligger i repoet. Cloudflare kobles til GitHub i
Cloudflare-dashbordet.

## Designregler (kort)

- Farger bare fra `tokens.css`. Komponentene bruker de semantiske navnene (`--bakgrunn`, `--tekst`, `--aksent` …), så lys og mørk modus følger med automatisk.
- Ingen rosa/magenta, ingen signalfarger, ingen gradienter, ingen Sigdal-farger, -logo eller -bilder.
- Newsreader til overskrifter (aldri små, aldri versaler), Inter til alt annet. Ingen sperring på små bokstaver, bortsett fra små versale etiketter (`.label`).
- Ingen inline-skript (CSP `script-src 'self'`). Bruk `<script>` i Astro-komponenter; Astro legger dem i egne filer.
- Bevegelse slås av med `prefers-reduced-motion`.
