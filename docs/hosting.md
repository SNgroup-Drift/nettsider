# Hosting: Cloudflare Workers med statiske filer

Bestemt 07.10.2026 (erstatter Pages-beslutningen fra 04.10): hvert nettsted er sin egen Cloudflare Worker med
statiske filer, bygd med **Workers Builds** og Git-integrasjon fra samme repo (`SNgroup-Drift/sngroup-nettsider`).
Workerne serverer `sites/<navn>/dist`. Unntaket er `hengsel`, som har et lite skript bare for `/apptest` (passordet, se
«hengsel.no/apptest» under) og `/api/demo` (demoskjemaet, se «hengsel.no/api/demo» under). Eirik kobler Cloudflare til GitHub selv.

Repoet har ingen API-nøkler, ingen kontoinformasjon, ingen hemmeligheter og ingen wrangler-innlogging. Det eneste
Cloudflare-oppsettet i repoet er `sites/<navn>/wrangler.jsonc` (her sngroup; hengsel har i tillegg `main`, `binding` og
`run_worker_first`, se under):

```jsonc
{
  "name": "sngroup",                       // hengsel, byggem
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist",                 // relativt til wrangler.jsonc
    "not_found_handling": "404-page",      // ukjente sider får dist/404.html med status 404
    "html_handling": "auto-trailing-slash" // /personvern → personvern.html
  }
}
```

Uten `not_found_handling` gir Workers en tom 404 og bruker ikke `404.html`. Det var feilen på
sngroup.drift-697.workers.dev før denne filen kom.

## Innstillinger per Worker

Workers & Pages → Create → Workers → Import a repository → velg `SNgroup-Drift/sngroup-nettsider`. For en Worker som
finnes: Worker → Settings → Build.

| | sngroup | hengsel | byggem | design |
|---|---|---|---|---|
| Worker-navn | `sngroup` | `hengsel` | `byggem` | `design` |
| Git-gren for produksjon | `main` | `main` | `main` | `main` |
| Build command | `npm run build -w sites/sngroup` | `npm run build -w sites/hengsel` | `npm run build -w sites/byggem` | `npm run build -w sites/design` |
| Deploy command | `npx wrangler deploy -c sites/sngroup/wrangler.jsonc` | `npx wrangler deploy -c sites/hengsel/wrangler.jsonc` | `npx wrangler deploy -c sites/byggem/wrangler.jsonc` | `npx wrangler deploy -c sites/design/wrangler.jsonc` |
| Non-production branch deploy command (preview) | `npx wrangler versions upload -c sites/sngroup/wrangler.jsonc` | `npx wrangler versions upload -c sites/hengsel/wrangler.jsonc` | `npx wrangler versions upload -c sites/byggem/wrangler.jsonc` | `npx wrangler versions upload -c sites/design/wrangler.jsonc` |
| Path (rotmappe) | `/` | `/` | `/` | `/` |
| Build variables | `NODE_VERSION` = `22` | `NODE_VERSION` = `22` | `NODE_VERSION` = `22` | `NODE_VERSION` = `22` |
| API-token | Eget token for nettsidene | Samme nettside-token | Samme nettside-token | Samme nettside-token |
| Build watch paths, include | `sites/sngroup/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json` | `sites/hengsel/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json` | `sites/byggem/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json` | `sites/design/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json` |
| Testadresse | https://sngroup.drift-697.workers.dev | https://hengsel.drift-697.workers.dev | https://byggem.drift-697.workers.dev | https://design.drift-697.workers.dev |
| Egne domener | `sngroup.no`, `www.sngroup.no` | `hengsel.no`, `www.hengsel.no` | `byggem.no`, `www.byggem.no` | `design.hengsel.no` |

**API-token:** bruk et eget token for nettsidene, ikke tokenet til CRM-demoen. Workers Builds lager det i
dashbordet når Worker-en kobles til Git (eller velg et eksisterende nettside-token). Tokenet lagres bare hos Cloudflare,
aldri i repoet.

**Deploy command må ha `-c`.** Wrangler-filen ligger i `sites/<navn>/`, ikke i rotmappen. Uten
`-c sites/<navn>/wrangler.jsonc` finner ikke wrangler oppsettet, og 404-siden blir ikke slått på.
Det gjelder **begge** feltene: Deploy command og Non-production branch deploy command. Er feltet for
ikke-produksjonsgreiner tomt, kjører Workers Builds standardkommandoen `npx wrangler versions upload` uten `-c`, og
forhåndsvisningen feiler med `✘ [ERROR] Missing entry-point to Worker script or to assets directory` (byggesteget går
gjennom). Det er akkurat den feilen wrangler gir når den kjøres fra rotmappen uten `-c`. Med `-c` og feil sti blir
feilen i stedet `Could not read file: …`. Rettes i Worker → Settings → Build → Non-production branch deploy command.

Node: `.nvmrc` i rotmappen sier 22. `NODE_VERSION` = `22` gjør det samme i byggmiljøet (Astro krever 22.12 eller nyere).
`wrangler` står som `devDependency` i rotens `package.json`, så `npx wrangler` bruker den låste versjonen.

Byggekommandoen kjører `astro build` og så `scripts/csp-hasher.mjs`, som legger hashen for inline-CSS-en inn i
`Content-Security-Policy` i `dist/_headers`. Bygg alltid med `npm run build`, ikke bare `astro build`; ellers blokkerer
CSP-en stilarket.

### Sjekk lokalt uten innlogging

```sh
npm run build
npx wrangler deploy --dry-run -c sites/sngroup/wrangler.jsonc   # leser dist og oppsettet, laster ikke opp noe
npx wrangler dev -c sites/sngroup/wrangler.jsonc                # kjører Worker-en lokalt på http://localhost:8787
```

## Hvorfor rotmappen og ikke `sites/<navn>` som Path

Nettstedene henter designpakken (`@sngroup/design`) fra npm workspaces. Workers Builds kjører `npm install` i Path, og
bare installasjon fra rotmappen kobler workspaces sammen. Med `sites/<navn>` som Path ville installasjonen prøve å hente
`@sngroup/design` fra npm og feile. Byggekommandoen med `-w` bygger likevel bare det ene nettstedet, `-c` peker deploy på
riktig wrangler-fil, og watch paths gjør at en endring i `sites/hengsel` ikke bygger sngroup på nytt.

## Egne domener

1. Legg domenet til som sone i Cloudflare (hvis det ikke er der) og pek navnetjenerne hos registraren til Cloudflare.
2. I Worker-en: Settings → Domains & Routes → Add → **Custom domain** → `sngroup.no`, og så `www.sngroup.no`.
   Cloudflare lager DNS-postene og sertifikatet selv når sonen ligger i samme konto.
3. Gjør det samme for `hengsel.no` og `www.hengsel.no` i Worker-en `hengsel`, og `byggem.no` og `www.byggem.no` i
   Worker-en `byggem`.
4. `design.hengsel.no` er et underdomene og ligger i Worker-en `design` (uten `www`, se «design.hengsel.no» under).

## design.hengsel.no (K-182)

Designfasiten for Hengsel (merket v3, farger i lys og mørk, skrift, komponenter, fiktive skjermer). Egen Worker `design` med bare statiske filer (`sites/design`, Astro, ingen skript fra tredjepart og ingen kode i Worker-en). Åpen, men `noindex` (meta og `X-Robots-Tag` i `_headers`), uten sitemap og uten Cloudflare Access (Eirik 12.10). Innstillingene står i tabellen over.

- **Kilde:** siden genereres fra `packages/hengsel-tokens/ds/tokens/hengsel.tokens.json`, som er den eneste kilden i Hengsel-designsystemet (`SNgroup-Drift/innlandet-crm-sync`, `_ds/hengsel-designsystem`). Filene er kopiert inn fra en **pinnet commit** (`packages/hengsel-tokens/designsystem.pin.json`, med sha256 for hver fil), så bygget er reproduserbart og Workers Builds ikke trenger tilgang til det private repoet.
- **Ny versjon av designsystemet:** `npm run design:hent -- --kilde /sti/til/innlandet-crm-sync --commit <sha>`, så `npm run build`, `npm test` og `npm run design:skjermbilder`. Ikke rediger filene i `packages/hengsel-tokens` for hånd: `scripts/hengsel-regler.test.mjs` og `scripts/design-fasit.test.mjs` feiler hvis en fil ikke samsvarer med pin-fila, hvis den delte `tokens.css` avviker fra JSON, hvis en Hengsel-side har fargeverdier utenfor den, eller hvis siden ikke viser verdiene i JSON. Det er én pin for alle Hengsel-sidene (K-192, se `docs/design/hengsel-regler.md`).
- **Bygging:** `npm run build -w sites/design` lager logopakken (`scripts/lag-logopakke.mjs`), bygger Astro og legger CSP-hashene inn i `dist/_headers`. Fargeflatene er CSS-klasser generert fra tokens (ingen `style=""`, siden CSP-en ikke tillater det).
- **Bildene** (`public/skjermer`) er fiktive skjermer fra designfilene (`scripts/fiktive-skjermer.mjs`, med `SKJERMER_UT=sites/design/public/skjermer` for nye) og hengsel.no (`scripts/skjermer-hengsel-no.mjs`). `og.png` lages av `scripts/lag-og-design.mjs`.
- **Sjekk:** `node scripts/skjermbilder-design.mjs` tar skjermbilder (390 og 1440 px, lys og mørk) og kjører axe (0 brudd på kontrast, 0 øvrige brudd), CSP-, konsoll- og overflytsjekk.
- **Flytting fra Pages:** `design.hengsel.no` lå tidligere som custom domain på Pages-prosjektet `sngroup-nettsider`, som ikke har bygd siden PR #43. Trinnene for å flytte domenet til Worker-en `design` står i `claude/k182-rapport.md`.

## www til apex

`_redirects` støtter bare stier, ikke domener, så www → apex kan ikke ligge der. Gjør det med en Redirect Rule i sonen,
én gang per domene:

Sonen (f.eks. `sngroup.no`) → Rules → Overview → Create rule → Redirect Rule → malen **«Redirect from WWW to root»**:

- When incoming requests match: Hostname equals `www.sngroup.no`
- Then: Dynamic, expression `concat("https://sngroup.no", http.request.uri.path)`, status 301, preserve query string på

Gjenta for `hengsel.no` og `byggem.no`. `www.<domene>` må ha en proxied DNS-post, og det får den når www er lagt til
som custom domain i trinn 2 over.

Sjekk etterpå: `curl -sI https://www.sngroup.no/personvern` skal gi `301` med `location: https://sngroup.no/personvern`.

## Sikkerhetshoder

Workers med statiske filer leser `_headers` og `_redirects` fra `assets.directory` (`dist`), på samme måte som Pages.
Filene serveres ikke selv (`/_headers` gir 404). `sites/<navn>/public/_headers` gjelder alle sider:

- `Content-Security-Policy`: bare egne filer (`'self'`), ingen inline-skript, ingen eksterne kilder, `frame-ancestors 'none'`.
  Inline-CSS er tillatt bare med hashen som `csp-hasher.mjs` legger inn i `dist/_headers` ved bygging.
- `Strict-Transport-Security` (1 år, uten `includeSubDomains`, så andre underdomener ikke påvirkes)
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` slår av kamera, mikrofon, posisjon, betaling og USB
- `Cross-Origin-Opener-Policy: same-origin`
- `/_astro/*` (filer med hash i navnet) caches i ett år.

Sjekk etter publisering:

```sh
curl -sI https://sngroup.no | grep -iE 'content-security|strict-transport|x-frame'
curl -s -o /dev/null -w '%{http_code}\n' https://sngroup.no/finnes-ikke   # skal gi 404 (med 404-siden)
```

## Ting å la være av

- Cloudflare Web Analytics / Zaraz: ikke slå på (ingen sporing). Web Analytics ville også trenge en endring i CSP-en.
- Ingen `main` i wrangler.jsonc og ingen Worker-kode: nettstedene er rent statiske.
- Ingen `main` og ingen Worker-kode for sngroup og byggem: de er rent statiske. hengsel har bare skriptet for `/apptest` og `/api/demo`.
- Ingen bindinger (KV, D1, R2) og ingen `account_id` i repoet. Den eneste hemmeligheten er passordet for
  hengsel.no/apptest, og den ligger bare i Cloudflare.
- `run_worker_first`: bare `["/apptest", "/apptest/*", "/api/demo"]` i hengsel. Ikke utvid den; resten av nettstedet skal ikke gå
  gjennom kode.

## hengsel.no/api/demo (demoskjemaet)

Skjemaet «Be om demo» på `/priser-og-demo` (K-160) sender med `fetch` til `POST /api/demo`. Koden ligger i
`sites/hengsel/worker/demo.ts`; `worker/index.ts` er inngangen (`main`) og sender `/api/demo` dit og `/apptest*` til
`worker/apptest.ts`, som er uendret. Stien står i `assets.run_worker_first`, ellers ville den ha blitt servert som statisk fil.

- **Metode og kontroll:** bare POST (ellers 405 med `Allow: POST`). `Origin` må være nettstedets egen adresse (ellers 403), body
  maks 8 KB (413), JSON eller `application/x-www-form-urlencoded` (415).
- **Spamvern:** skjult felt `nettsted` (honeypot: utfylt gir 200 `{ok:true}`, men ingenting sendes) og tidsfeltet `t` (settes av
  `src/scripts/demo.ts` når skjemaet vises; må være mellom 3 sekunder og 24 timer gammelt). Uten JavaScript kan skjemaet derfor ikke
  sendes; siden viser da en e-postlenke i stedet.
- **Validering på tjeneren:** navn 1–120 tegn, e-post (enkel sjekk, bare ASCII) eller telefon (6–20 siffer), minst én av dem, butikk
  maks 120, «Hva vil dere se?» maks 1000, antall avdelinger fra fast liste (`1`, `2-3`, `4+`). Kontrolltegn og linjeskift avvises i
  alle felt som kan havne i e-posthoder.
- **Svar:** `200 {ok:true}` (e-post sendt), `200 {ok:true, levert:false, reserve:"mailto"}` (e-postbindingen finnes ikke, se under),
  `400 {ok:false, feil:{felt:melding}}`, `503 {ok:false, reserve:"mailto"}` når bindingen finnes, men Cloudflare avviser sendingen.
  Ingenting lagres, og det logges ingen persondata (bare feilkoden fra Cloudflare).
- **E-post (foreløpig AV, Eirik 11.10):** `send_email`-blokken er tatt ut av `wrangler.jsonc` (står som kommentar der). Koden sjekker om
  bindingen `DEMO_EPOST` finnes og sender bare da; slås e-post på senere ved å legge blokken tilbake, uten kodeendring.
  Bindingen er `send_email` med `destination_address: hei@hengsel.no`. Workeren bygger rå
  MIME for hånd (`EmailMessage` fra `cloudflare:email`, emnet RFC 2047, UTF-8 base64-kropp, `Reply-To` til kundens e-post) fra
  `demo@hengsel.no`. Ingen npm-pakker, ingen nøkler eller hemmeligheter i repoet.
- **Reserve:** mangler bindingen (slik det er nå), validerer ruten forespørselen og svarer 200 med `levert:false`; siden viser da uten
  feilmelding «Send forespørselen på e-post til hei@hengsel.no.» med en `mailto:`-lenke med utfylt emne og innhold, pluss telefonnummeret.
  Finnes bindingen, men Cloudflare avviser sendingen (Email Routing ikke slått på, avsender ikke på sonen, destinasjon ikke
  verifisert), svarer ruten 503, og siden viser mailto-lenken med teksten «Forespørselen ble ikke sendt.».
- **Det Eirik må slå på i Cloudflare:** se `docs/k160-cloudflare-skjema.md`.
- **Test lokalt:** `npm run build -w sites/hengsel`, så `npx wrangler dev -c sites/hengsel/wrangler.jsonc`. Uten `send_email`-blokken viser skjemaet mailto-lenken. Med blokken lagt tilbake simulerer wrangler lokalt
  `send_email` og skriver e-posten som `.eml`-fil under `sites/hengsel/.wrangler/tmp/email/` (ingen ekte sending). `npm test` kjører
  `scripts/demo.test.mjs`.

## hengsel.no/apptest (passord)

Siden som viser testerne hvordan de installerer testversjonen av Hengsel Ute (K-107, nytt utseende 10.10.2026). Den
ligger bak ett felles passord, står ikke i menyen, i `sitemap.txt` eller i lenker fra andre sider, og har `noindex,nofollow`.
`scripts/sjekk-lenker.mjs` passer på alle tre.

Slik virker det:

- `sites/hengsel/wrangler.jsonc` har `"main": "./worker/index.ts"` (sender `/api/demo` til `worker/demo.ts` og alt annet til `worker/apptest.ts`)
  og `assets.run_worker_first: ["/apptest", "/apptest/*", "/api/demo"]`.
  Skriptet kjører bare for de stiene. Alt annet serveres som statiske filer, uten kode.
- Uten gyldig informasjonskapsel viser `/apptest` passordsiden (`dist/apptest/passord.html`). Skjemaet sender passordet med
  POST til `/apptest`. Riktig passord gir 303 til `/apptest` og informasjonskapselen `hengsel_apptest` (HttpOnly, Secure,
  SameSite=Lax, Path=/apptest, 30 dager). Feil passord gir 401 og «Feil passord. Prøv igjen, eller spør Eirik.».
- Informasjonskapselen er en utløpstid og en HMAC-signatur, ikke passordet. Signaturnøkkelen lages av `APPTEST_NOKKEL` og
  `APPTEST_PASSORD`, så når passordet byttes, må alle skrive det nye.
- Mangler en av hemmelighetene, er siden låst (503 «Siden er låst. Passordet er ikke satt opp ennå.»).
- Demobrukerne (K-114): delen «Prøv med demobrukerne» står på `/apptest`, og Workeren setter demopassordet inn fra hemmeligheten
  `DEMO_PASSORD` (`data-demopassord`, `data-demopassord-verdi`, `data-uten-demopassord`) bare for innloggede. Mangler den, står
  «Passordet får du av den som inviterte deg.». PDF-en `/apptest/Logg_inn_i_demoen.pdf` ligger bak samme passord.
- Alle svar fra `/apptest` har `X-Robots-Tag: noindex, nofollow` og `Cache-Control: private, no-store`.

### Sette eller bytte passordet

Fra rotmappen i repoet, innlogget med `npx wrangler login` (eller i dashbordet: Worker `hengsel` → Settings →
Variables and Secrets → Add → Type **Secret**):

```sh
npx wrangler secret put APPTEST_PASSORD -c sites/hengsel/wrangler.jsonc   # skriv passordet når wrangler spør
openssl rand -base64 32                                                    # lag en tilfeldig nøkkel …
npx wrangler secret put APPTEST_NOKKEL -c sites/hengsel/wrangler.jsonc    # … og lim den inn her
```

Begge må settes før `/apptest` kan åpnes. Demopassordet settes på samme måte (valgfritt, siden fungerer uten):
`npx wrangler secret put DEMO_PASSORD -c sites/hengsel/wrangler.jsonc`. Nøkkelen settes én gang. For å bytte passord kjøres bare den første
kommandoen på nytt; gamle informasjonskapsler slutter da å virke. Bytter du `APPTEST_NOKKEL`, må også alle logge inn på
nytt. Hemmelighetene skal aldri stå i repoet, i en innsjekket `.dev.vars` eller i rapporter.

Sjekk etterpå (uten informasjonskapsel skal du få passordsiden, ikke 503):

```sh
curl -sI https://hengsel.no/apptest | grep -iE '^HTTP|x-robots|cache-control|content-security'
```

### Bytte lenker og versjon

Alt ligger i `sites/hengsel/src/apptest-lenker.ts`: versjon, TestFlight-lenken, Google Play-lenken (intern testing),
APK-fila, «Siste oppdatering», «Hva er nytt» og e-postadressen. En verdi som begynner med `TODO_` gir en deaktivert knapp
med teksten «Lenke kommer». Bytt verdien, commit og push.

Området mellom `// <apptest-versjon>` og `// </apptest-versjon>` (versjon, APK, dato og «Hva er nytt») skrives av
Action-en under. Rediger det ikke for hånd; neste kjøring overskriver det.

### Automatisk versjon (`.github/workflows/apptest-versjon.yml`)

Action-en holder versjon, APK-lenke, «Siste oppdatering» og «Hva er nytt» à jour uten at noen skriver dem inn:

- **Når:** hver dag kl. 06.00 norsk tid (to cron-tider i UTC, 04 og 05, og et steg som bare slipper gjennom kl. 06 i Oslo),
  og for hånd under Actions › Apptest-versjon › Run workflow. «dry_run» viser bare endringen. GitHub kan forsinke
  planlagte kjøringer; en kjøring som havner utenfor kl. 06 i Oslo hoppes over, og neste dag tar det igjen.
- **Fra EAS** (`eas-cli`, `EXPO_TOKEN`): siste `FINISHED` bygg per plattform og siste EAS Update på grenen `preview`.
  APK-en er det nyeste ferdige Android-bygget med en `.apk`-lenke på expo.dev (AAB-ene til Play hoppes over). Versjonen er
  APK-ens `appVersion`. «Siste oppdatering» er den nyeste av APK-bygget, iOS-bygget (samme versjon) og EAS Update med
  kjøretid lik versjonen, som dato i Oslo.
- **«Hva er nytt»** leses fra `claude/hengsel-bygg-<n>.md` på **demo** i `SNgroup-Drift/innlandet-crm-sync`
  (`CRM_LESETOKEN`, lesetilgang). Filen velges på tittelen `# Hengsel bygg <n> (<versjon>)`, med høyeste `<n>` for versjonen.
  Punktene står i en del med overskriften `## Hva er nytt` (eller `## Hva er nytt i <versjon>`) som punktliste, én linje
  per punkt (ordrett, maks 15 punkter og 200 tegn per punkt). Mangler delen, beholdes dagens punkter hvis versjonen er den
  samme; ellers tømmes lista og siden viser «Punktene kommer.». PR-en sier fra om det.
- **PR:** hvis noe er endret, committes `apptest-lenker.ts` på grenen `apptest-versjon` (bygges på nytt fra `main` hver
  gang), og én PR åpnes eller oppdateres. **Den merger aldri selv og slår ikke på auto-merge.** Er alt som før, skjer ingenting.
- **Verdiene valideres** før de skrives (versjon `x.y.z`, APK-lenke bare `https://expo.dev/artifacts/eas/….apk`, dato,
  lengder) og settes inn som JSON-strenger. Testene ligger i `scripts/apptest-versjon.test.mjs` og kjøres av `npm test`.

Oppsett én gang:

1. Secrets i repoet (Settings › Secrets and variables › Actions): `EXPO_TOKEN` (lesetilgang til prosjektet `montorapp`
   i `hamar-innredning-as` holder) og `CRM_LESETOKEN` (lesetilgang til `innlandet-crm-sync`). Mangler en av dem, stopper
   kjøringen med en tydelig feil.
2. Settings › Actions › General › Workflow permissions: «Allow GitHub Actions to create and approve pull requests».
3. Filen må ligge på `main` for at tidsplanen og «Run workflow» skal virke.
4. Kjør den første gangen for hånd med «dry_run» på, og se at diffen er den du venter.

### Teste lokalt

Lag `sites/hengsel/.dev.vars` (står i `.gitignore`, sjekkes aldri inn) med et testpassord:

```sh
printf 'APPTEST_PASSORD=%s\nAPPTEST_NOKKEL=%s\nDEMO_PASSORD=%s\n' "et-testpassord" "$(openssl rand -base64 32)" "et-demopassord" > sites/hengsel/.dev.vars
npm run build -w sites/hengsel
npx wrangler dev -c sites/hengsel/wrangler.jsonc          # http://localhost:8787/apptest
node scripts/skjermbilder-apptest.mjs                       # skjermbilder og sjekker mot wrangler dev
```

## vis

Visningsrommet (`vis.sngroup.no`, K-110) er et rent statisk nettsted uten byggesteg utover kopiering (se
`sites/vis/README.md`). Det ligger bak **Cloudflare Access** (appen «Visningsrommet», policy «Inviterte»), og er derfor
et **Pages-prosjekt**, ikke en Worker som de andre nettstedene. Pages leser `_headers` fra output-mappen på samme måte.

Fram til K-110 ble det lastet opp for hånd som zip til Pages-prosjektet `vis-sngroup` (Direct Upload). Et Direct
Upload-prosjekt kan ikke kobles til Git i etterkant, så det lages et nytt prosjekt `vis`, og domenet flyttes over.
Repoet har ingen nøkler eller konto-ID for dette; alt under gjøres i dashbordet.

### 1. Nytt Pages-prosjekt koblet til repoet

Workers & Pages → Create → **Pages** → Connect to Git → velg `SNgroup-Drift/sngroup-nettsider`.

| Felt | Verdi |
|---|---|
| Project name | `vis` (gir `vis-8we.pages.dev`: `vis.pages.dev` var opptatt, så Cloudflare la til et tilfeldig suffiks) |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build -w sites/vis` |
| Build output directory | `sites/vis/dist` |
| Root directory (advanced) | tomt, altså rotmappen (workspaces må installeres fra roten, se over) |
| Environment variables | `NODE_VERSION` = `22` |

**Rekkefølgen sørger for at ingenting havner åpent på nettet før Access er på plass.** Bestemt 08.10: Pages, og ingen
forhåndsvisninger for vis.

1. Lag prosjektet **før** PR-en for K-110 er flettet til `main`. Veiviseren starter et første bygg fra `main` med en
   gang, og det **feiler** (`sites/vis` finnes ikke på `main` ennå). Det er meningen: da publiseres ingenting.
2. Settings → Build → **Branch control** → Automatic deployments for preview branches: **None**. Da bygges ingen
   andre greiner (heller ikke `claude/*`) til åpne adresser under `*.vis-8we.pages.dev`.
3. Settings → Build → **Build watch paths**, Include: `sites/vis/*`, `package.json`, `package-lock.json`. Da bygger
   ikke en endring i sngroup, hengsel eller byggem vis på nytt.
4. Gjør trinn 2 under (Access).
5. Flett PR-en. Det første vellykkede bygget havner da på `vis-8we.pages.dev`, som allerede er bak Access.

Har PR-en allerede blitt flettet når prosjektet lages, blir første bygg publisert med en gang på en åpen
`vis-8we.pages.dev`. Gjør da punkt 2 til 4 umiddelbart.

### 2. Access før domenet flyttes

> **Access-appen «Visningsrommet» må dekke alle tre adressene før domenet flyttes:**
>
> - `vis-8we.pages.dev`
> - `*.vis-8we.pages.dev`
> - `vis.sngroup.no`
>
> Flytt `vis.sngroup.no` (trinn 3) **først når Access er utvidet** og sjekken under viser innloggingen. Ellers kan
> det nye prosjektet være åpent for alle i glippet mellom flytting og Access.

Zero Trust → Access → Applications → **Visningsrommet** → Edit → Overview / Public hostnames → Add public hostname:

- `vis-8we.pages.dev`
- `*.vis-8we.pages.dev`. Hver produksjonsdeploy får også en egen adresse per commit (`<hash>.vis-8we.pages.dev`), selv med
  forhåndsvisninger av, så jokertegnet trengs.

Lagre. Kontroller at `vis.sngroup.no` fortsatt står i lista (den skal allerede være der), og behold
`vis-sngroup.pages.dev` til trinn 4. Ikke endre policyen «Inviterte».

Sjekk etter at PR-en er flettet (i et privat vindu): `https://vis-8we.pages.dev` og adressen til siste deploy (Deployments → kopier lenken) skal
begge sende deg til innloggingen hos Access, ikke vise forsiden.

```sh
curl -sI https://vis-8we.pages.dev | grep -iE '^HTTP|^location'   # 302 til …cloudflareaccess.com, ikke 200
```

### 3. Flytt `vis.sngroup.no`

Ikke start før trinn 2 er gjort og sjekket: Access-appen må dekke `vis-8we.pages.dev`, `*.vis-8we.pages.dev` og
`vis.sngroup.no`.

1. Pages-prosjektet `vis-sngroup` → Custom domains → `vis.sngroup.no` → Remove. Domenet er nede til trinn 2 under er
   ferdig (vanligvis et par minutter).
2. Pages-prosjektet `vis` → Custom domains → Set up a custom domain → `vis.sngroup.no` → Activate. Cloudflare oppdaterer
   CNAME-en til `vis-8we.pages.dev` selv, siden sonen ligger i samme konto.
3. Access-appen trenger ingen ny endring her. Den dekker allerede `vis.sngroup.no` (kontrollert i trinn 2), og
   beskyttelsen følger vertsnavnet, ikke Pages-prosjektet.

Sjekk: `https://vis.sngroup.no` gir innloggingen, og etter innlogging den nye forsiden (Deployments i `vis` viser
samme commit som `main`). Skriftene skal komme fra `/fonts/`, ikke fra Google (DevTools → Network → Font).

### 4. Rydd etter 14 dager

`vis-sngroup` står urørt i 14 dager som reserve (domenet kan flyttes tilbake med trinn 3 i omvendt rekkefølge). Deretter:

1. Workers & Pages → `vis-sngroup` → Settings → Delete project.
2. Zero Trust → Access → Applications → Visningsrommet → fjern `vis-sngroup.pages.dev` fra public hostnames.

### Ellers

- Publisering skjer ved push til `main`. Ingen opplasting for hånd lenger; `vis-sngroup.zip` på Macen er ikke kilden
  lenger, det er `sites/vis/src/`.
- CSP og andre hoder ligger i `sites/vis/src/_headers` og kopieres uendret til `dist/`. CSP-en tillater bare skrifter
  fra `'self'` (skriftene ligger i `dist/fonts/`, ingen Google Fonts).
- `sites/vis/src/404.html` gjør at ukjente adresser får status 404 med en egen side. Uten den svarer Pages med forsiden
  og status 200 på alt (enkeltside-modus).
- Sjekk etter publisering, innlogget: `https://vis.sngroup.no/finnes-ikke` skal vise «Fant ikke siden».
- `robots.txt` stenger for søkemotorer, men det er Access som faktisk holder nettstedet privat.

## admin.hengsel.no (K-184)

Egen Worker `admin` (`sites/admin`), statiske filer bak Cloudflare Access. Til forskjell fra de andre nettstedene går **alle** forespørsler
gjennom `worker/index.js`, som avviser alt uten gyldig `Cf-Access-Jwt-Assertion` (signatur, utsteder, Access-app, utløp og e-postadresse).
Variablene `ACCESS_TEAM_DOMAIN` og `ACCESS_AUD` settes i dashbordet (ikke hemmeligheter, men heller ikke i repoet; `keep_vars` hindrer at
utrulling overskriver dem). Mangler de, svarer Workeren 503. Build command `npm run build -w sites/admin`, Deploy command og
Non-production branch deploy command `-c sites/admin/wrangler.jsonc`. Domene, Access-app og policy: se `claude/k184-rapport.md`.


## hengsel.no/sigdal (K-223)

Kundeutgave for Sigdal i samme Worker som hengsel.no. `run_worker_first` har `/sigdal` og `/sigdal/*`; `worker/sigdal.ts` svarer 403 uten `Cf-Access-Jwt-Assertion` (Cloudflare Access legger den på), og alle svar har `X-Robots-Tag: noindex, nofollow` og `Cache-Control: private, no-store`. Cloudflare Access settes opp i dashbordet (steg i `claude/k223-rapport.md`). Testmodus (`wrangler dev --var SIGDAL_TESTMODUS:1`) virker bare på localhost. Visningsrommet bygges inn i `dist/sigdal/vis/` av `scripts/bygg-sigdal-vis.mjs` (kjøres av `npm run build -w sites/hengsel`), så **Build watch paths for hengsel må også ha `sites/vis/*`**.
