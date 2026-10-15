# K-240 · Hengsel Admin fase A: salg, kunder, avtaler og prisberegner (S-62)

Gren `claude/k240-admin-fase-a` fra `main` (d97278f). PR mot main; Oversikt fletter når alt er grønt. Ingen DNS, domener eller Cloudflare Access er rørt, hengsel-crm er ikke rørt. Ingen nøkler, passord eller tokens i kode, data, commit, skjermbilder eller denne rapporten. Grunnlaget er `docs/design/admin-fase-a/60-213_overlevering_code_fase_a.md` med tegningene 60-201 til 60-206; 60-207 til 60-212 (fase B/C) er ikke bygd.

## Hva som er bygget

| Del | Hvor |
|---|---|
| Database (D1, binding `DB`) | `sites/admin/wrangler.jsonc` (plassholder-id, se «Før fletting»), `sites/admin/migrations/0001_fase_a.sql`: alle tabellene fra 60-213 punkt d (eier, butikk, kontakt, mulighet, aktivitet, tilbud, tilbudslinje, avtale, avtaledokument, avtalemal, signatar, prisliste, prislisterad, innstilling, bruker) pluss `lopenummer` (T-2026-031 / A-2026-019). Beløp i øre, ULID-id-er, `opprettet`/`endret` overalt |
| Prisliste 2026.2 | I migreringen som **utkast** med `eksempel=1` («Eksempel – prislisten er ikke låst»): pakkene per produktlinje, Ute (150 kr / firmapris 990 kr for ≤ 8), tillegg, rabattrinn 15 % fra 3 og 25 % fra 10, viderefakturering 15 %, binding 12, oppsigelse 3, mva 25 |
| Prisberegningen | `sites/admin/src/lib/pris.js`: én ren funksjon `beregn(prisliste, linje, butikker, {tillegg})`, brukt i nettleseren (SA5), i Workeren (tilbud) og i testene. Ingen priser i koden |
| API i Workeren | `sites/admin/worker/api.js` (ruter), `db.js`, `valider.js` (all input valideres på serveren), `tilgang.js` (bare rollen `eier` skriver), `index.js`. GET/POST/PATCH/PUT/DELETE under `/api` for eier, butikk, kontakt, mulighet, aktivitet, tilbud, avtale, prisliste, leverandør, innstillinger og import. Feilkoder ADM-400/401/403/404/409/413/415/504 |
| Lead fra hengsel.no | `worker/lead.js`: `POST /api/lead`, unntatt Access i Workeren, samme vern som `/api/demo` (metode, Origin, honeypot, tidssjekk, lengder, innholdstype) + valgfri `LEAD_NOKKEL`. Lager eier (status Ny, kilde be_om_demo, «Ny»-merke), kontakt, butikk, mulighet og neste steg «Ta kontakt innen 24 timer». `sites/hengsel/worker/demo.ts` sender leaden server til server når `LEAD_URL` er satt (av som standard) |
| Excel-import | `worker/import.js`: .xlsx (zip + XML, egen leser uten avhengigheter) og .csv, overskrifter A–M, forhåndsvisning med ny / oppdateres (dublett på org.nr.) / mangler org.nr. / hoppes, ingenting lagres før «Importer N rader» |
| Tilbud-PDF (SA6) | `worker/pdf.js`: egen PDF-skriver (A4, marger 16 mm, Helvetica, WinAnsi, Hengsel-logoen tegnet fra den pinnede SVG-en), oppsettet fra 60-203, flere sider ved mange butikker. `GET /salg/tilbud/:nr/:versjon.pdf`. Fargene leses fra `hengsel.tokens.json` |
| Penneo | `worker/penneo.js`: rekkefølgen (1 kunden, 2 leverandøren) og statusene som ren tilstandsmaskin; integrasjonen er AV til `PENNEO_API_KEY` er satt. Uten den viser avtalesiden «Penneo er ikke koblet til» og signeringen markeres for hånd i rekkefølge |
| Sider (Astro, Hengsel-tokens, bare lys, `data-plattform="pc"`) | SA1 `/`, SA2 `/salg/tavle`, SA3 `/salg/eiere` (+ `?import=1`) og `/kunder`, SA4 `/salg/eiere/:id` og `/kunder/:id`, SA5 `/salg/prisberegner?eier=:id`, SA6 PDF, SA7 `/avtaler` og `/avtaler/:nr`, SA8 dialogen «Ny aktivitet» (toppfeltet og eierkortet), SA9 `/innstillinger/prisliste` og `/innstillinger/leverandor`. Drift-sidene fra K-184 beholdt under `/drift`, `/drift/kunder`, `/drift/kunder/:id` |
| Meny | Én konfigurasjon i `src/lib/meny.ts`; fase B/C-punktene står der med fase «b»/«c» og vises ikke. Telefon: bunnfaner Oversikt, Tavle, Eiere, Avtaler, Mer; skuff under 1024 px |
| Tilstander | Tom, laster, feil, forfalt, i dag, ingen treff på alle skjermene i punkt b (`?tilstand=tom|laster|feil` i adressen viser dem) |
| Tester | `scripts/admin-fase-a.test.mjs` (16 tester, i `npm test`), oppdaterte `scripts/admin.test.mjs` og `scripts/demo.test.mjs` |
| Skjermbilder | `claude/k240/` (40 PNG i 1440 og 390 px + tilbudet som PDF og PNG), laget av `npm run skjermbilder:k240` med eksempeldata lokalt |

### Sidene er statiske, API-et er i Workeren
Sidene bygges som før (Astro, statiske filer, CSP uten inline-skript). Dataene hentes i nettleseren fra `/api` i samme Worker (`connect-src 'self'`). Sider med id i adressen serveres fra én fil hver (`worker/ruter.js`), så ingen bygging trengs for nye eiere. Cloudflare Access ligger foran alt som før; Workeren sjekker fortsatt tokenet selv, og `/api` svarer JSON med ADM-401/403.

### Prisberegningen
`scripts/admin-fase-a.test.mjs` gir nøyaktig de tre regneeksemplene i 60-213 punkt e, med alle linjene: 2 140 kr (eksempel 1), 14 789 kr / 3 697,25 / 18 486,25 (eksempel 2, rabatt 2 590,50 avrundet til 2 591), 36 815 kr / 9 203,75 / 46 018,75 (eksempel 3, 22 montører over firmapris), per år og etablering med mva, og kontrolltallet fra 60-203 (13 234 kr, rabatt 2 336). Firmapris velges når den er billigst og antall ≤ 8.

### Hva som skjer i flyten
- **Tavla:** dra og slipp på PC setter `eier.status` og `mulighet.fase` og logger «Flyttet til …». Slipp i Tapt åpner dialogen med grunn (påkrevd). En signert kunde flyttes ikke (409). På telefon er tavla en liste, og status endres fra eierkortet (velger).
- **Tilbud:** «Lag tilbud» i prisberegneren lagrer en ny versjon på eierens åpne mulighet (ny mulighet hvis ingen), med prislisteversjon, leverandør-kopi og alle linjene, og åpner PDF-en. Forrige versjon blir «erstattet». Gyldig i `tilbud_gyldig_dager` (14). Status utkast → «Merk som sendt» på eierkortet → sendt.
- **Avtale:** «Lag avtale» fra et tilbud (eierkortet eller Avtaler › Ny avtale fra tilbud) lager utkast med signatarer (kontakt med signaturrett, leverandørens signatar fra Innstillinger) og dokumentene fra de aktive avtalemalene. «Send til signering» → kunden venter, leverandøren «ikke sendt». Når kunden har signert, får leverandøren invitasjon. Når begge har signert: avtale signert, tilbud akseptert, eier og mulighet signert, `er_kunde = 1`, start = første dag i neste måned (eller valgt), fornyes = start + binding. «Fornyes snart» regnes ut (innen `fornyes_snart_dager`). «Si opp» setter sagt_opp med opphørsdato.
- **Lead:** kommer inn som eier med status Ny og vises i Oversikt og på tavla; «Ny»-merket fjernes når eierkortet åpnes. Samme kontakt (e-post eller telefon) to ganger gir en aktivitet på eieren, ikke en ny eier.
- **Prisliste:** bare utkast kan endres; «Publiser» gjør utkastet aktivt, arkiverer den gamle og fjerner eksempel-merket (verdiene er da bekreftet). Tilbud husker versjonen de ble laget med. Til en versjon er publisert bruker tavla, eierkortet og prisberegneren det nyeste utkastet som eksempel (banner i Oversikt).

## Før fletting og utrulling (Oversikt)

1. **D1:** lag databasen `hengsel-admin` (weur) og sett `database_id` i `sites/admin/wrangler.jsonc` (plassholderen `00000000-…`). Kjør `npx wrangler d1 migrations apply hengsel-admin --remote -c sites/admin/wrangler.jsonc`.
2. **Access:** `POST /api/lead` er unntatt i Workeren, men Access-appen foran admin.hengsel.no må få en **bypass-policy for stien `/api/lead`** (jeg har ikke rørt Access). Uten den stopper Access leaden før Workeren.
3. **Lead på hengsel.no:** sett variabelen `LEAD_URL=https://admin.hengsel.no/api/lead` på hengsel-Workeren når det skal på (av som standard). Valgfritt: samme `LEAD_NOKKEL` (wrangler secret) på begge Workerne.
4. **Penneo:** `PENNEO_API_KEY` (wrangler secret) slår på integrasjonen. Endepunktene i `PenneoKlient` (`/casefiles`, `/signers`, `/remind`) er skrevet etter beste skjønn og må bekreftes mot Penneos API-dokumentasjon før nøkkelen settes; til da kalles de aldri.
5. **K-234:** `tokens.css` skal ha `--aksent #05806F` og `--paa-aksent #FBF9F6`. Det gjøres bare i designsystemet (innlandet-crm-sync) og pinnes med `npm run design:hent` etter regel 8 i hengsel-regler.md; jeg har ikke tilgang til det repoet herfra, så fargene i Admin er fortsatt de pinnede (#068472 / #FFFFFF). Admin følger med automatisk når pinnen oppdateres.
6. **PC-laget** (`[data-plattform="pc"]`) er ikke tatt inn i den delte token-fila (hengsel-regler 5b, «foreslått»). Admin setter attributtet på `<html>` og bruker lokale aliaser av delte tokens (`--flate-kolonne: var(--linje)` osv.) i `admin.css`, aldri egne farger. Når laget pinnes, overstyrer det automatisk.

## Åpne spørsmål (60-213 punkt k) og hvor svaret må inn

| Nr. | Spørsmål | Standard nå | Hvor svaret legges inn |
|---|---|---|---|
| 2 | Leverandør | ES-Holding AS som eksempel (`innstilling.leverandor`, `eksempel=1`), org.nr./adresse/e-post tomme | Innstillinger › Leverandør i Admin (fyll inn og fjern haken «eksempel»). Ingen kode |
| 3 | Priser | Prisliste 2026.2 som utkast, eksempel=1 | Innstillinger › Prisliste: endre tallene i utkastet og «Publiser». Ingen kode |
| 4 | Fornyes snart | 90 dager (`innstilling.fornyes_snart_dager`) | Innstillinger › Prisliste › Innstillinger (nederst). Ingen kode |
| 5 | Lead-flyt | Eier og kontakt lages med en gang, status Ny, «Ny»-merke; «Ikke aktuell» lukker med grunn | Skal det være innboks i stedet: `worker/lead.js` (`lagreLead`) og SA1 |
| 6 | Bunnfaner | Oversikt, Tavle, Eiere, Avtaler, Mer | `src/lib/meny.ts` (`BUNNFANER`) |
| 7 | `--flate-kolonne` | Alias av `--linje` i `admin.css` | Nytt token i `hengsel.tokens.json` (innlandet-crm-sync) + `npm run design:hent`; fjern aliaset i `admin.css` |
| 8 | Mva på etablering | Vises (med og uten mva) | `pris.js` (`etablering_mva_ore`) og PDF/SA5 hvis det skal bort |
| 9 | Tillegg og rabatt | Tillegg uten rabatt | `pris.js` regel 7 (`rabatt_gjelder` i prislisten er forberedt for å ta med `tillegg`) |
| 10 | Firmapris Ute | Per eier | `pris.js` regel 3 |
| 11 | Gratis sikkerhetskopi | Komplett eller ≥ 2 butikker | `prislisterad.inkludert_regel` (`komplett_eller_flere_butikker`) og `pris.js` |
| 12 | Toast-farger | `--tekst` som flate, `--tekst-invers` som tekst, ikonet i `--paa-aksent` | Nytt token `--aksent-paa-mork` i designsystemet; `admin.css` `.toast` |
| 13 | `--aksent-trykk` / `--aksent-tekst` etter K-234 | Uendret (pinnet) | Designsystemet, pinnes med `design:hent` |
| 14 | Support etter første år | Samme timer så lenge avtalen løper (bare tekst) | Vilkårsteksten i `worker/pdf.js` og SA5 (`prisberegner.ts`) |
| 15 | Hengsel-linjen | Samme brukere, support og etablering som Sigdal CRM, lagret per linje | Innstillinger › Prisliste (radene per linje). Ingen kode |
| 16 | Tilbud gyldig | 14 dager (`innstilling.tilbud_gyldig_dager`) | Innstillinger › Prisliste › Innstillinger. Ingen kode |
| 1 | Nummerering 60-201 … | Filene ligger som i eksporten | `docs/design/admin-fase-a/` hvis registeret sier noe annet |

Eiriks svar i portalen legges inn der tabellen sier; innstillingene (2, 3, 4, 15, 16) krever ingen kodeendring.

## Sjekk

- `npm test`: alle testene grønne (hengsel-regler, gamle-farger, admin, demo, mørk modus i nettleser, lenker …), inkludert de nye i `scripts/admin-fase-a.test.mjs`: prisberegningen (tre eksempler + kontroll), migreringene (node:sqlite og ekte `wrangler d1 migrations apply --local` mot `sites/admin/wrangler.jsonc`), API-tilgang (401 uten Access, 403 for ukjent adresse, 403 på skriving for andre enn eier, 503 uten DB), lead-vernet (metode, Origin, honeypot, tid, lengder, innholdstype, nøkkel), Excel-import (.xlsx og .csv, dubletter, ingenting lagres før import), tilbud-PDF (gyldig PDF med riktige beløp, bak Access), Penneo-rekkefølgen, og hele eksempeldatasettet gjennom API-et (Oversikt, Tavle, Eiere, Avtaler, eierkort, prisliste-versjoner).
- `npm run build`: alle nettstedene bygger.
- `node scripts/hengsel-regler.mjs sites/admin`: ingen fargeverdier utenfor den delte fila, ingen mørk modus. CSP uten inline-stiler og -skript holder (ingen `style=`-attributter; små hjelpeklasser i `admin.css`).
- Skjermbilder i `claude/k240/`: ingen konsollfeil, ingen mislykkede forespørsler, ingen sidelengs rulling.

- HawkScan (DAST): kunne ikke kjøres i denne økta, `hawk`-CLI-en er ikke installert og `HAWK_API_KEY` er ikke satt. Sikkerheten er sjekket med testene over (Access-sjekk, rolle, validering, CSP uten inline, lead-vern), ikke med en DAST-skanning.

## Eksempeldata

Alt i 60-213 punkt j (eiere, kontakter, org.nr., beløp, avtalenumre, importfila) ligger bare i `scripts/lib/admin-eksempeldata.mjs` og legges inn gjennom API-et i en lokal database til testene og skjermbildene. Ingenting av det er i migreringen eller sidene. Migreringen har bare prisliste 2026.2 (utkast, eksempel), avtalemalene (navn og versjon fra 60-203, merket eksempel til filene finnes), innstillingene og brukeren (samme adresse som `worker/tilgang.js`).

## Kjente begrensninger

- Tilbud-PDF-en bruker Helvetica (PDF-standardskrift), ikke Schibsted Grotesk: repoet har bare woff2, og innbaking krever TTF. Oppsett, tekster og tall er som i 60-203.
- Kundemiljøets versjon og siste innlogging «leses fra kundemiljøet» i 60-213; det er ikke koblet til i fase A (vises som tekst på kundekortet).
- Signert PDF fra Penneo (R2) lagres ikke før integrasjonen er på; feltet `signert_pdf_nokkel` finnes.
- Excel-importen tar første ark, maks 2 MB og 2000 rader.
