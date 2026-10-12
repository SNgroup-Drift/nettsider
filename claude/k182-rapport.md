# K-182 · design.hengsel.no: flytt fra gammelt Pages-prosjekt til egen Worker

Status: **stoppet før bygging, trenger svar fra Eirik** (punkt 1 i oppdraget: «Er det uklart: lag ingen ny side, skriv spørsmålet i rapporten og stopp»).
Ingen filer under `sites/`, ingen endringer i build, test eller lenkesjekk, ingen PR.

## Hva jeg fant (og ikke fant)

- `design.hengsel.no` står ingen steder i repoet, verken i filer eller commit-meldinger (søkt i alle 191 commits, `git log -S`).
- Byggeinnstillingene til Pages-prosjektet `sngroup-nettsider` (byggekommando, output-mappe, rotmappe) ligger ikke i repoet. De ligger bare i Cloudflare-dashbordet. `docs/hosting.md` beskriver bare Workers (bestemt 07.10, erstatter Pages-beslutningen fra 04.10) og Pages-prosjektet `vis`. Det finnes ingen `wrangler.toml`, `_headers` eller annen Pages-fil i rotmappen eller i historikken.
- Jeg kan ikke åpne selve siden herfra (utgående nett til `design.hengsel.no` gir 403 fra proxyen), så jeg har ikke sett hva den viser nå.
- Pages-prosjektet er koblet til hele repoet. Det er derfor umulig å lese ut av repoet hvilken mappe det publiserte som `design.hengsel.no`.

## Kandidater for hva siden skal være

| # | Kandidat | For | Mot |
|---|---|---|---|
| A | `docs/design/hengsel/`: designfasiten for hengsel.no 2.0, /apptest og merket (Oversikt, åtte sider, Logo-bruk, Ute-ikon, Kontroll, `_ds/` designsystemet). 11 MB, ren statisk HTML/JS (`.dc.html` + `support.js`), åpnes med `npx serve .` | Din gjetning. Filene er laget for å serveres statisk. Passer navnet «design» under hengsel.no | Mappa har også interne filer: `LEVERANSE-1210.md`, `LES-MEG.md`, `Apptest-valg.md`, `hengsel-merke/README.md` (oppgaver til Claude Code), og kildefiler for app-ikoner. Navn på demobrukere (`montor@demo.hengsel.no` m.fl.) står i `Apptest-valg.md` (ingen passord) |
| B | `docs/design/hengsel-no-2.0/`: den eldre kopien av de samme sidene | Kan være det som lå på siden da Pages sist bygde | `LEVERANSE-1210.md` sier at den er erstattet av A og ikke skal med |
| C | Designpakken på én side, slik `sites/sngroup/src/pages/design.astro` viser den (`sngroup.no/design`, noindex, fargene med hex og kontrast, skrifter, komponenter) | Den heter allerede «design» og er en arbeidsside for godkjenning | Det er sngroup-paletten (kalk/umbra/fjord), ikke Hengsel. Ligger allerede på sngroup.no |
| D | Noe annet (f.eks. `vis`-designfasiten eller en egen bygget side) | | Ikke noe i repoet peker dit |

Min anbefaling er A, men den er ikke sikker nok til å bygge på, siden jeg ikke har sett hva `design.hengsel.no` viste.

## Spørsmål til Eirik

1. **Hva viste `design.hengsel.no` da den sist virket?** Det raskeste svaret er Cloudflare → Workers & Pages → `sngroup-nettsider` → Settings → Builds: hva står i *Build command* og *Build output directory*? (Én linje er nok. Ikke send tokens eller nøkler.) Alternativt: send et skjermbilde av siden slik den ser ut nå.
2. **Er A riktig?** Hvis ja, bør hele `docs/design/hengsel/` ut, eller bare en utvalgt del? Forslag: publiser `Oversikt`, de åtte sidene, `Logo-bruk`, `Ute-ikon`, `Kontroll`, `Apptest*.dc.html`, `_ds/`, `support.js`, `dokumenter-data.js` og bildemappene, men **ikke** `*.md`-filene og `hengsel-merke/` (kildefiler og oppgaver). Si fra om du vil ha alt.
3. **Skal siden være åpen eller låses?** Forslag: åpen med `noindex` og streng CSP, siden den bare har oppdiktede eksempler («Eksempel»-merket) og ingen kundedata. Vil du heller ha den bak Cloudflare Access som `vis`, må det settes opp av deg i Zero Trust (jeg rører ikke Cloudflare-oppsettet).

## Hva jeg gjør når du har svart

1. `sites/design/` som egen Worker `design`, etter mønster fra `sites/hengsel` (men uten Astro og uten Worker-skript, i stedet ren statisk `public`/`dist` som `sites/vis`): `wrangler.jsonc` med `assets`, `_headers` med `X-Robots-Tag: noindex` og streng CSP, `404.html`. Eventuelt kopierer byggeskriptet filene fra `docs/design/hengsel/` slik at det ikke blir to kopier.
2. `design` inn i `npm run build` (workspace), `npm test` og `scripts/sjekk-lenker.mjs`.
3. `docs/hosting.md` og `README.md` får en rad for `design`.
4. Skjermbilder før/etter, PR mot `main` (du fletter), og avslutning med «K-182 KLAR».

## Stegene i Cloudflare etter fletting (for Eirik, ferdig utfylt når bygget finnes)

Rekkefølgen er laget for kort nedetid. Ikke start før (a) er bekreftet.

- (a) Workers & Pages → Create → Workers → Import a repository → `SNgroup-Drift/sngroup-nettsider`. Worker-navn `design`, gren `main`, Build command `npm run build -w sites/design`, Deploy command `npx wrangler deploy -c sites/design/wrangler.jsonc`, Non-production branch deploy command `npx wrangler versions upload -c sites/design/wrangler.jsonc`, `NODE_VERSION` = `22`, samme nettside-token som de andre. Vent til første bygg viser «Deployed» og åpne testadressen `https://design.drift-697.workers.dev`.
- (b) Pages-prosjektet `sngroup-nettsider` → Custom domains → `design.hengsel.no` → Remove. Domenet er nede til (c) er gjort.
- (c) Worker `design` → Settings → Domains & Routes → Add → Custom domain → `design.hengsel.no`. Cloudflare lager DNS-posten og sertifikatet selv (sonen `hengsel.no` ligger i samme konto).
- (d) Sjekk: `curl -sI https://design.hengsel.no | head -1` skal gi `HTTP/2 200`, og `curl -sI https://design.hengsel.no | grep -i x-robots-tag` skal gi `noindex`.
- (e) Pages-prosjektet `sngroup-nettsider` → Settings → Builds → slå av automatiske bygg (Disable automatic deployments / Production branch builds). Slett prosjektet (Settings → Delete project) etter en uke, når `design.hengsel.no` har svart 200 hele uken.

Merk: de tre trinnene (a)–(c) er foreløpige til spørsmålene over er besvart; Worker-navn, byggekommando og mappe følger repoet slik det blir bygget.
