# N-7b – Nettsidene på designsystem 2.10

Gren `claude/n7b-design-2-10` fra `origin/main` (5c444d7, der PR #93 / N-7 er flettet og `designsystem.pin.json` var 2.5.0). Dagøkt 18.10.2026, startet kl. 17.35. Skrevet av Code.
Ventet på K-371b: den lå på `claude/k371b-ds-2-9` i hengsel-crm først, og ble flettet til `demo` som `8bb8351a` («demo: flett claude/k371b-ds-2-9»). Rapporten `claude/k371b-rapport.md` fantes ikke på `origin/demo` da jeg pinnet, så pinnen er den flettede commiten, på samme måte som N-7 pinnet K-371-flettecommiten.

## Kort

- **Pin:** `8bb8351a3f7906bdb375df65bd210d9c162fcf29`, `designsystem.pin.json` **2.10.0**. Ingen genererte filer er redigert for hånd.
- **`tokens.css`** har nå `--teller-*` (meny, fane, flis, merke, farger), `--flate-meny`, `--radius-rad`, `--radius-liten`, `--skrift-mono`, `--skrift-sidetittel`, `--skrift-tall-stor`, hele CRM- og Admin-paletten (33 roller, ikke bare 14) og P3-/økt-kontrast-blokker, også per produkt (nettsider, crm, admin). **75 ikoner** (22 nye siden 2.4).
- **Dokumentmaler** på design.hengsel.no: ny side `/dokumentmaler` med alle 28 maler (7 familier, 54 sider), generert fra den pinnede mappa.
- **Admin:** Teller-komponenten og de sju ikonene er på plass der Admin hadde egne (se «Teller» og «De sju ikonene»).
- **Workers Builds** (admin, design): ingen feil igjen i repoet; det som gjenstår er i Cloudflare-dashbordet (se egen del).
- `npm test` grønn: **229 tester, 0 feilet** (4 nye i `scripts/n7b.test.mjs`). `npm run build` bygger alle nettstedene. `npx wrangler deploy --dry-run` for design og admin er grønn (design: 839 filer, 22 MB, ingen over grensen på 25 MiB).

## Hva som endret seg synlig, per side

| Side | Før | Nå |
|---|---|---|
| **hengsel.no** (alle sider) | produktpaletter fra 2.5 | `nettsider` og `ute`/`crm` som før; P3 og økt kontrast er på plass for nettsider (oransje aksent mørkere ved «økt kontrast»). Ingen egen pille for tellere på sidene, så ingen markup-endring. CRM-skjermene (`crm`) får full CRM-palett (kant, felt, tabell, lenke) |
| **vis.hengsel.no** | som hengsel.no | samme token-endringer. «Ordrens reise» har ingen tellerpille (bare statuslinjer og tidslinje), så ingen sideendring |
| **design.hengsel.no** | 72 ikoner, 7 sider i menyen | **ny meny «Dokumentmaler» og siden `/dokumentmaler`** (se under); `/komponenter` viser 75 ikoner; `/farger` viser alle rollene i produktpalettene (33 for CRM og Admin); `code` og adresselinjer bruker `--skrift-mono`; forsiden har et nytt kort til dokumentmalene |
| **admin.hengsel.no** | egen aksentfylt pille for tellere i menyen og rød pille på bjella | **Teller:** tallet i aksent på `--teller-bg` med kant (20 px i menyen, 16 px i smal meny og bjella); «haster» (`.feil`, f.eks. «N feil» i fakturakjøringen) får `--teller-haster-tekst` og et rundt «!»-merke øverst til høyre med ring i menyflaten. Ikonene montasjeplan, innboks, profil, hjelp, lenke, dra og last-opp er Designs 2.6-utgaver. Status «ny» er gråblå (følger Admin-paletten) |
| sngroup.no, byggem.no, demo.hengsel.no | – | ikke rørt |

## Per punkt

### 1. Pin
`npm run design:hent -- --kilde <hengsel-crm> --commit 8bb8351a…` (hengsel-crm klonet utenfor repoet). Endringer i `scripts/hent-designsystem.mjs`: `dokumentmaler` (med bare `README.md` av .md-filene, så tabellen kan leses) og `tokens/layout.css` er lagt i `HENTES`. `layout.css` brukes bare til Teller-blokka; resten er ikke Hengsel-sidenes (N-1-regelen er uendret).
`scripts/lag-hengsel-tokens.mjs` skriver nå: Teller-blokka (kopiert ord for ord fra `layout.css`, uten kundetema-/plattformvelgerne), alle produktroller, produktenes status, og P3/økt kontrast per produkt. Tokens og `--sjekk` er grønne.

### 2. Teller
- hengsel.no og vis.hengsel.no har ikke tellerpiller i CRM-eksemplene: skjermene er bilder fra biblioteket, og de egne tallene (`.tall`, `.pil`) er tallkort og statuspiller, ikke antall saker. Derfor **ingen sideendring** der (som oppgaven sa).
- Admin har egne tellere (menyen: `.meny .tall`, bjella: `.bjelle-tall`) og er bygd om til Teller (`sites/admin/src/styles/skall.css`, `support.css`). Fliskantene med `.teller`/`.antall` i admin.css (antall rader i tittelen) er vanlig tekst, ikke Teller, og er ikke rørt.
- Status «ny» gråblå følger tokens **bare der en produktpalett har status** (crm og admin). Grunnpaletten (`--status-ny-*` på `:root`) er fortsatt blå (#1A57AD) i 2.10, så hengsel.no og design.hengsel.no har blå «ny» der den brukes utenfor CRM-/Admin-flater. Det kan bare Design endre (åpent for Eirik, se under).

### De sju ikonene
montasjeplan, innboks, profil, hjelp (nå Designs egne), og lenke, dra, last-opp (nye i 2.6) står i Admins ikonliste (`sites/admin/src/lib/ikoner.ts`); innmaten er byttet byte for byte mot `ds/ikoner-2-5/20/*.svg`. På design.hengsel.no kommer de automatisk fra `ikoner.json`.

### 3. Dokumentmaler på design.hengsel.no
- Side `/dokumentmaler` (`sites/design/src/pages/dokumentmaler.astro`, `src/lib/dokumentmaler.ts`): nummer, navn (fra `felter.json`), familie og «ny» (fra tabellen i pin-mappas `README.md`), sider (antall `side-N.png` i mappa), antall flettefelt, mappenavn i `--skrift-mono`, forhåndsvisning av side 1 og lenker til `eksempel.html` og `felter.json`. Ingen håndskrevet liste: en mal uten rad i tabellen stopper bygget. Adresselinjen («Furuvegen 12, 2312 Ottestad») er satt i `--skrift-mono`.
- `eksempel.html` serveres på `/ds/dokumentmaler/<mappe>/eksempel.html`. Pakkens filer bryter CSP-en til siden (innebygd temaskript, 25 ulike `style="…"`, `<title>undefined</title>`), så `scripts/lag-dokumentmaler.mjs` (kjøres i `npm run build -w sites/design` rett etter `kopier-ds.mjs`) gjør kopien i `public/ds` CSP-trygg: skriptet flyttes til `felles/tema.js`, stilene til `felles/eksempel-stiler.css`, tittelen får malens navn, siden får favicon og noindex. Kildefilene i pin-mappa røres aldri.
- **Valg jeg tok:** pakkens `side-N.png` er tatt i **Sigdal-temaet** (serif, varm brun; står i `dokumentmaler/README.md` i designsystemet) og er derfor ikke publisert (heller ikke i `/ds`). I stedet viser siden egne forhåndsvisninger av side 1 i Hengsel standard (`sites/design/public/dokumentmaler/<mappe>.png`, 28 filer, 2 MB), laget av `npm run design:dokumentmal-bilder` (Playwright mot eksempelet i `tema/hengsel.css`). De er ikke app-skjermbilder (de er utskriftsark fra designsystemet), så de ligger i repoet. Når Design leverer `side-1.png` i Hengsel standard (2.10-delta), kan skriptet fjernes. `mal.html` (flettefelt) er heller ikke i `/ds` (ikke en side).
- Ingen Sigdal på siden eller i eksemplene (testet).

### 4. Workers Builds: admin og design er røde
**Det jeg kan se fra repoet:** GitHub-sjekkene «Workers Builds: design» og «…: admin» på PR #93 (og #92) er `failure` uten tekst; loggen ligger bare i Cloudflare-dashbordet (lenkene under «details»), og det kan ikke leses herfra. Alt som kan sjekkes i repoet er grønt: ren `npm ci`, `npm run build -w sites/design` / `-w sites/admin`, `wrangler deploy --dry-run -c …` for begge, `.nvmrc` = 22 (`engines` ≥ 22.12), `wrangler` 4.148 låst, begge wrangler-filer har `"previews": {}`, ingen workflow berører bygget. Dette er det samme som N-4 fant (`claude/n4-rapport.md`, «Del 2»), og repoet er rettet siden den gang; PR #93 er bygd etter at N-4 var flettet, så årsaken står igjen i dashbordet.
**Sannsynlig årsak (må sjekkes av Eirik):** begge er nye Workers med feltet **Preview command** (ikke «Non-production branch deploy command»), og standardverdien `npx wrangler preview` mangler `-c`, så wrangler ikke finner `sites/<navn>/wrangler.jsonc` fra rotmappen. Samme feil på **Deploy command** hvis den mangler `-c`.
**Eirik gjør i Cloudflare** (Workers & Pages → Worker → Settings → Build; for både `design` og `admin`; ingen nøkler trengs):

| Felt | design | admin |
|---|---|---|
| Build command | `npm run build -w sites/design` | `npm run build -w sites/admin` |
| Deploy command | `npx wrangler deploy -c sites/design/wrangler.jsonc` | `npx wrangler deploy -c sites/admin/wrangler.jsonc` |
| **Preview command** | `npx wrangler preview -c sites/design/wrangler.jsonc` | `npx wrangler preview -c sites/admin/wrangler.jsonc` |
| Build variable | `NODE_VERSION` = `22` | `NODE_VERSION` = `22` |
| Path | `/` | `/` |

Trykk «Retry build» på siste commit (på PR-en og på `main`). Er bygget fortsatt rødt: åpne bygglogg-lenka på PR-en (sjekken «Workers Builds: …» → Details) og send første linje med `✘ [ERROR]`; da er det ikke dette. Admins forhåndsvisning svarer 503 (låst) bevisst, siden en Preview ikke arver D1 og `ACCESS_*` (se `docs/hosting.md`).
Jeg har ikke endret `wrangler.*`, `package.json`-bygg for admin eller `.github/workflows/*` for dette punktet.

### 5. Test og skjermbilder
- `npm test`: 229/229 grønne, 0 feilet, 0 hoppet over i denne kjøringen. Nye: `scripts/n7b.test.mjs` (tokens, Teller i Admin, dokumentmalene, CSP-sikre eksempler). Oppdatert: 75 ikoner og 2.10.0 i `design-fasit`, `produktpaletter`; og:image-testen hopper over `ds/dokumentmaler/` (utskriftsark).
- Skjermbilder (1440 og 390): forsidene hengsel.no, hengsel.no/crm, vis., design. (forside, /dokumentmaler, /farger, /komponenter) og admin (innlogging; `/` trenger API-et bak Access) i `claude/n7b-skjermbilder/` (`npm run build` og `node scripts/skjermbilder-n7b.mjs`). **Bilder fra biblioteket (bilder.hengsel.no) vises ikke i skjermbildene**: sandkassen når ikke nettet, manifestkopien i repoet brukes, så enhetsrammene står uten app-bilde. Admin-menyen med tellere er ikke i skjermbildene (den krever data fra API-et).

## Åpent for Eirik
1. **Cloudflare** (punkt 4): sett Preview command (og sjekk Deploy command) med `-c`, og trykk «Retry build».
2. **Status «ny» i grunnpaletten** er fortsatt blå i 2.10; gråblå gjelder bare CRM og Admin. Skal hengsel.no og design.hengsel.no også ha gråblå, må Design endre grunnpaletten.
3. **Dokumentmal-forhåndsvisningene** er min egen rendering i Hengsel standard fordi pakkens PNG-er er i kundetemaet (Sigdal). Si fra hvis du heller vil vise pakkens bilder, men da står kundetemaet på design.hengsel.no.
4. `claude/k371b-rapport.md` fantes ikke på `origin/demo` da jeg pinnet; hvis rapporten oppgir en annen pin-commit enn `8bb8351a`, kjør `npm run design:hent` på nytt med den.
5. HawkScan er ikke kjørt (ingen nøkkel i økta; statiske sider).

## Kontroll og begrensninger
- Ingen nøkler, passord eller tokens i repo, chat eller rapport. Ikke flettet, ikke deployet. Ingen subagenter. sngroup.no, byggem.no og `packages/design` er ikke rørt. Ingen hex i sidene (`hengsel-regler`-testen er grønn; hex finnes bare i `tokens.css` og i den pinnede `ds`-kopien).

N-7b KLAR
