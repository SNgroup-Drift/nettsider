# K-184 · Hengsel Admin fase 1: admin.hengsel.no

Gren `claude/k184-hengsel-admin` fra `origin/main`. PR mot main; Eirik fletter. Ingen DNS, ingen Cloudflare-oppsett, ingen andre nettsteder er rørt (bare build og test av dem). Ingen passord, nøkler, tokens eller gjenopprettingskoder i kode, data, commit eller denne rapporten.

## Hva som er bygget

`sites/admin/` er en egen Worker «admin» (statisk Astro, samme mønster som `sites/hengsel`), med domene `admin.hengsel.no` som Eirik kobler.

| Del | Hvor |
|---|---|
| Worker med Access-sjekk | `sites/admin/worker/index.js`, `access.js` (JWT-sjekk), `tilgang.js` (hvem ser hva) |
| Oppsett | `sites/admin/wrangler.jsonc` (`run_worker_first: true`, `keep_vars`), `public/_headers`, `public/robots.txt` |
| Data, én fil per modul | `src/data/plattform/{lenker,kontoer,frister}.json` og `rutiner.md`; `src/data/kunder/<kunde-id>/{kunde,lenker,kontoer,frister}.json` |
| Sider | `/` (Plattform: lenker, kontoer, frister, rutiner), `/kunder`, `/kunder/<id>`, 404 |
| Stil | Hengsel-merket v3, lys og mørk, 390–1440 px (`src/styles/profil.css` + `admin.css`) |
| Søk | Feltet øverst filtrerer alle lenker, kontoer og frister (og kundelista i menyen); `/` hopper til feltet |
| Tester | `scripts/admin.test.mjs` (med i `npm test`), `scripts/admin-kvalitet.mjs` (skjermbilder, axe, CSP, søk) |

**Tilgang og sikkerhet**
- Alle forespørsler går gjennom Workeren. Uten `Cf-Access-Jwt-Assertion` svarer den 401; ugyldig token 401; riktig token men en adresse som ikke står i `worker/tilgang.js` 403; mangler `ACCESS_TEAM_DOMAIN`/`ACCESS_AUD` svarer den 503 og viser ingenting (siden virker ikke uten Access). Tokenet sjekkes fullt ut: RS256-signatur mot teamets nøkler, utsteder, Access-app (aud), utløp, nbf og e-post. Testet med en generert nøkkel for 11 tilfeller (feil nøkkel, endret innhold, feil app, feil utsteder, utløpt, `alg: none` osv.).
- `_headers`: `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: private, no-store`, CSP `default-src 'none'; script-src 'self'; style-src 'self' (+ hasher fra csp-hasher); connect-src 'none'; form-action 'none'; frame-ancestors 'none'`. Ingen tredjepartsskript, ingen nettverkskall fra siden. `robots.txt` stenger alt.
- Rollemodellen er klar for en senere kunde-admin: `worker/tilgang.js` har `{ alle: true }` for es@sngroup.no, og en rolle `{ kunder: ["<id>"] }` ser bare `/kunder/<id>` (testet). Ingen slik rolle er i bruk.

## Multitenant

- To nivåer i hele siden: **Plattform** (øverst i menyen) og **Kunder** (kundeliste i menyen, `/kunder` med søk).
- Ny kunde = ny mappe `src/data/kunder/<kunde-id>/` med fire filer. Ingen kodeendring. Bygget feiler hvis kunde-id ≠ mappenavn ≠ `tenant.nokkel`, eller en fil mangler.
- Kundesiden viser kundekort (selskaper med org.nr., kontaktperson, domener, lisens), de 7 salgsmodulene på/av, leverandørintegrasjoner, lenker, kontoer og frister.
- Kundens lenker med `plattformgruppe` (f.eks. CRM-adressene) vises også i Plattform-oversikten med kundemerke, og kundenes frister samles i Plattform-fristlista. Eksempelkunden tas aldri med der.
- **Kunde 1: Studio Sigdal Innlandet** (`sigdal-innlandet`) med Hamar Innredning AS, Gjøvik Innredning AS og Lillehammer Innredning AS. **Eksempel Kjøkken AS** (`eksempel-kjokken`) er fiktiv og tydelig merket (banner, «eksempel» i menyen, `.example`-adresser).
- **Tenant-nøkkel:** CRM-databasen har ikke en kunde-/kjedenøkkel ennå. `docs/flytting-app-hengsel-no.md` A6 sier bare at flere kunder i samme database krever egen K-sak, og `docs/multi-tenant-kartlegging.md` (K-135) er en kartlegging uten kode: forslaget er tabellen `kjeder` med `kode`, og Sigdal Innlandet som standardkjede. Jeg bruker derfor **sluggen `sigdal-innlandet`** som kunde-id og `tenant.nokkel`. Når `kjeder.kode` finnes, byttes mappenavn og `tenant.nokkel` til den (testen krever at de er like).

## Hva som er fylt inn

- **Lenker (alle gruppene fra oppdraget):** nettstedene (demo.hengsel.no merket «kommer · K-180/K-181», app.hengsel.no «kommer · K-183»), CRM og apper (prod, demo og Min side ligger under kunden Sigdal og vises i oversikten), Drift (GitHub, de to repoene, Actions, Supabase prod `jzqglcldsqkxvwsaovth` og demo `cqztkoigidtjtslxdlmo`, Cloudflare, Sentry, Expo/EAS, App Store Connect/TestFlight, Google Play Console, Apple Developer), Microsoft (admin, Exchange, Entra, Outlook for drift@), Forretning, og «Sigdal beslutninger».
  Adressene er offisielle innloggingsadresser fra min kunnskap. **Nettverket i økta når ikke tjenestene, så ingen er slått opp eller åpnet.** Sjekk dem når du bruker dem første gang.
- **Kontoer:** alle 18 tjenestene fra oppdraget er der som kort (M365, GitHub, Supabase, Cloudflare, Lovable «sies opp etter 20.10», Sentry, Peliqan, Anthropic, domeneregistrar, Apple Developer med eier ES-Holding AS, Google Play, Expo, PowerOffice, Vipps, Penneo, DealBuilder, Unifon, Mobit). Fylt ut: M365 (es@sngroup.no, med forklaringen es@/drift@/eirik@) og Apple Developer (ES-Holding AS). For Sigdal ligger leverandørkontoene (CET, Tradeplace, PowerOffice-klienter, Penneo, KAOnline, Nobia) og eirik@studiosigdal-innlandet.no for Microsoft.
- **Frister:** Lovable-oppsigelse **20.10.2026** (gul i dag, 8 dager), KA Interiørs prisregulering **01.01.2027**. Resten er oppført med navn, type og tjeneste, uten dato: Entra-klienthemmeligheten «Sigdal CRM e-post», Apple-distribusjonssertifikat, APNs-nøkkel (.p8), Apple Developer-medlemskap, `EXPO_TOKEN`, `CRM_LESETOKEN`, Cloudflare-tokenene, `SUPABASE_ACCESS_TOKEN`, Anthropic-nøkler, domenene (hengsel.no, sngroup.no, byggem.no, studiosigdal-innlandet.no), Cloudflare SSL (fornyes automatisk) og 11 abonnementer. Bare navnene på hemmelighetene står her, aldri verdiene.
- **Rutiner** (korte, hver lenket til kilden i innlandet-crm-sync eller dette repoet; alle kildefilene finnes): flett til demo, prod-utrulling, migreringer, glemt passord, ny bruker, ny butikk, gjenopprett sikkerhetskopi, noe er nede.

## Står som «fyll inn»

- **Lenker uten adresse:** Hengsel Ute (iOS: App Store-/TestFlight-lenken), Tradeplace, CET, domeneregistrar.
- **Kontoer:** innlogging, 2FA-metode, 1Password-hvelv, elementnavn og 1Password-lenke er tomme for alle tjenester unntatt det som står over. Jeg gjetter ikke hvilken innlogging (es@/drift@/eirik@) hver tjeneste bruker.
- **Frister:** alle datoer og priser unntatt de to over. Entra-hemmelighetens utløp bør fylles inn først (da stopper e-posten fra CRM-et).
- **Kunde:** org.nr. for alle tre selskaper, telefon til kontaktpersonen (jeg har bare «Eirik» og eirik@studiosigdal-innlandet.no), lisensplan, fra-dato og pris, kontonavn hos hver leverandør. Modulene er satt til «på» for alle sju fordi ingen rad i `butikk_moduler` betyr på; bekreft i CRM › Innstillinger › Moduler.
- **Rutinen «Ny butikk»:** ingen ferdig rutine finnes i docs (K-135 er bare kartlegging). Siden sier det og lenker til kartleggingen.

Slik fyller du inn: åpne JSON-filen i `sites/admin/src/data/...`, bytt `null` med verdien (dato som `ÅÅÅÅ-MM-DD`), og flett. Testen stopper hvis noe ligner en nøkkel eller et passord.

## Stegene for Eirik

### 1. Worker og domene
1. Cloudflare › Workers & Pages › Create › Import a repository › `SNgroup-Drift/sngroup-nettsider`. Worker-navn **`admin`**, gren `main`, Path `/`.
2. Build command `npm run build -w sites/admin`. Deploy command `npx wrangler deploy -c sites/admin/wrangler.jsonc`. **Non-production branch deploy command** `npx wrangler versions upload -c sites/admin/wrangler.jsonc` (begge må ha `-c`). Build variable `NODE_VERSION` = `22`. Samme nettside-token som de andre. Build watch paths: `sites/admin/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json`.
3. Worker `admin` › Settings › Domains & Routes › Add › Custom domain › **`admin.hengsel.no`** (sonen hengsel.no ligger i samme konto, så Cloudflare lager DNS-posten selv).
4. Samme sted: slå av **workers.dev** og forhåndsvisnings-URL-er for `admin`. (Worker-en avviser dem uansett, siden de ikke har Access-token, men da er det en adresse mindre.)

### 2. Cloudflare Access (Zero Trust, one.dash.cloudflare.com)
1. **Innloggingsmetoder:** Settings › Authentication › Login methods › Add new.
   - **Microsoft** (Entra ID): i Entra admin › App registrations › New registration, navn «Cloudflare Access», kun SN Groups tenant. Redirect URI (type Web): `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`. Kopier Application (client) ID og Directory (tenant) ID, lag en client secret, og lim dem inn i Cloudflare. **Legg secretens utløpsdato inn i frister.json** (`entra-access-hemmelighet`).
   - **One-time PIN** (e-postkode): legg til som reserve.
2. **Applikasjon:** Access › Applications › Add an application › Self-hosted.
   - Application name: `Hengsel Admin`. Session duration: 24 hours.
   - Public hostname: `admin.hengsel.no`, tom path.
   - **Policy** (Action: Allow): Include › Emails › `es@sngroup.no`. Ingen andre policyer, ingen «Everyone».
   - Login methods: huk av for Microsoft og One-time PIN. Slå **av** «Accept all available identity providers» hvis den er på. Koden sendes bare til adresser policyen slipper inn, altså es@sngroup.no.
3. Etter at appen er lagret: åpne den og kopier **Application Audience (AUD) Tag** (Overview). **Team domain** står under Settings › Custom Pages / General (`<team>.cloudflareaccess.com`).

### 3. Koble Worker-en til Access
Worker `admin` › Settings › Variables and Secrets › Add, type **Text** (ikke hemmeligheter, men de står ikke i repoet):
- `ACCESS_TEAM_DOMAIN` = `<team>.cloudflareaccess.com`
- `ACCESS_AUD` = AUD-taggen fra steg 2.3

`keep_vars` i `wrangler.jsonc` hindrer at neste utrulling overskriver dem. Uten dem svarer Worker-en 503.

### 4. Test
1. Privat vindu › `https://admin.hengsel.no` → Microsoft-innlogging som es@sngroup.no → siden vises.
2. Velg e-postkode i stedet → koden kommer til es@sngroup.no → siden vises.
3. En annen adresse (Microsoft eller kode) skal stoppes av Access. Får en annen adresse likevel et gyldig token (for vid policy), svarer Worker-en 403.
4. `curl -i https://admin.hengsel.no` uten innlogging gir Access-siden (302), aldri innholdet. Er Access ikke koblet til Worker-en, gir den 503.
5. Endrer du Access-appen eller lager en ny, får den ny AUD: oppdater `ACCESS_AUD`.

## Kvalitet

- `npm run build` (alle fem nettstedene) og `npm test` er grønne: 64 tester (17 nye for admin) og lenkesjekken (613 forespørsler, 0 feil, `admin` med 23 interne adresser og 404-siden).
- **axe: 0 brudd (alle regler, ikke bare kontrast), 0 kontrastbrudd**, lys og mørk, på alle fire sidene og 404, ved 390, 768 og 1440 px. Ingen konsollfeil (serveren i testen sender CSP-en fra `dist/_headers`, så CSP-brudd ville vist seg), ingen sidelengs rulling. Søk og fristfarger er testet i nettleser.
- Skjermbilder 390 og 1440, lys og mørk (hele sider): `claude/k184-skjermbilder/`. Kjør på nytt med `AXE_PATH=<axe.min.js> UT=claude/k184-skjermbilder npm run kvalitet:admin` etter `npm run build -w sites/admin`.
- Hemmelighetstesten (`scripts/admin.test.mjs`) skanner alle datafiler for `sk-`, `ghp_`/`github_pat_`, `eyJ`, `BEGIN … PRIVATE KEY`, AWS-, Slack- og Supabase-tokens, hex-strenger på 40+ tegn og lange blandede base64-strenger, og forbyr feltnavn som passord/secret/token/nøkkel/kode. Den har en selvtest som beviser at mønstrene slår til (og at vanlige adresser og prosjekt-id-er ikke gir falsk alarm). Kontoer har et fast felt-sett, og `onepassword` må være en 1Password-lenke eller `null`.
- Ikke testet: selve Cloudflare Access og Microsoft-innloggingen (krever Eiriks oppsett), og `wrangler dev` mot en ekte JWKS. `wrangler deploy --dry-run` godtar oppsettet.

## Endringer i felles filer (for K-182)

- `package.json`: `admin.test.mjs` lagt til sist i `test`-linjen, pluss `dev:admin` og `kvalitet:admin`.
- `package-lock.json`: de to nye arbeidsområde-oppføringene for `sites/admin` (12 linjer, ingen versjoner endret). K-182 vil legge til sine; ved konflikt: kjør `npm install` og behold begge.
- `docs/hosting.md`: ny seksjon sist om admin.
- `sites/admin/src/styles/profil.css` er en **kopi** av `sites/hengsel/src/styles/tokens.css` (Hengsel-merket v3), fordi profilen ikke ligger i `packages/design` ennå. Når K-182 flytter den dit, bytt filen mot importen.
- Ingenting under `sites/hengsel`, `sites/sngroup`, `sites/byggem`, `sites/vis` eller `packages/` er endret.

## Neste (fase 2, ikke gjort)

Levende data per kunde (CRM-databasen, `kjede_id` når den finnes), varsler på frister, og 1Password-lenker per element når hvelv og elementnavn er fylt inn.
