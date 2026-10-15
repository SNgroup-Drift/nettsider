# K-259 · Hengsel Admin fase B: Support, Oppstart og rollen Support (S-62)

Gren `claude/k259-admin-fase-b` fra `main` (a5da856, etter K-240). PR mot main; Eirik fletter. Ingen DNS, domener, Cloudflare Access eller hengsel-crm er rørt. Ingen nøkler eller passord i kode, data, commit eller skjermbilder. Ingen e-post sendes. Grunnlaget er 60-211 (fasit), 60-207, 60-208, 60-210, 60-212 og `assets/admin-data-bc.js`.

**Delingen med K-260** (fase C og Drift, parallelt): K-259 eier `src/lib/meny.ts`, `migrations/0002_fase_b.sql`, `worker/api-support.js` og `worker/api-oppstart.js`. I `worker/api.js` er det bare to linjer, én per modul (`monterSupport(rute)`, `monterOppstart(rute)`), rett over `export { RUTER }`. K-260 bruker 0003 og egne filer.

## Hva som er bygget

| Del | Hvor |
|---|---|
| Migrering | `sites/admin/migrations/0002_fase_b.sql`: `sak` (H-nnnn, løpenummer `nr_tall` fra 1001), `melding` (kunde / svar / intern; CHECK: et internt notat kan aldri få `utsendelse`), `tidsforing`, `tidtaker`, `oppstart`, `oppstartspunkt` (nr 1–9), `opplaeringsokt`. `bruker` er bygd på nytt med `rolle IN ('eier','support')`, `aktiv` og `sist_innlogget`. Innstillinger: `supportniva` (svarfrist per prioritet, arbeidstid 08–16 hverdager), `support_timepris_ore` 115000, `support_foring_min` 15, `svarmaler`, `brukerveiledning_url` – alle `eksempel=1` – og `hjelp_origins`, `oppstart_punkter` (den faste lista på ni) |
| Regnereglene | `src/lib/support.js` (rene funksjoner, brukt i Worker, nettleser og tester): svarfrist i arbeidstid (norsk tid uten bibliotek, sommertid håndtert), frist-stopp/-start ved «venter på kunde», snart (≤ 25 %), forfalt, sortering, påbegynte 15 min, inkluderte timer og status (Under / På grensen ≥ 90 % / Over), svarmaler, `kundeVisning` (aldri interne notater), oppstartstatus |
| API Support | `worker/api-support.js`: saker (liste med filter/sortering og antall per valg, sak, ny sak fra e-post/telefon, statusbytte, prioritet, kunde), meldinger (svar = e-postutkast, internt notat, kundens svar), e-postutkast, tidtaker (start/stopp/avbryt, lagret i D1 så den overlever at siden lukkes), manuell føring, sletting (ikke fakturerte; support bare egne), timer per måned, menytall, SA1-kortet, Innstillinger › Support, supportpersoner |
| API Oppstart | `worker/api-oppstart.js`: liste (i gang / fullført), ny fra avtale (ni punkter fra malen), én oppstart, punkt (status, ansvarlig, dato/frist, detalj), opplæringsøkter, «Send påminnelse» (logges som aktivitet, sendes ikke), SA1-kortet. Status beregnes, lagres ikke. Punkt 1 «Avtale signert» følger avtalen automatisk |
| «Hjelp» | `worker/hjelp.js`: `POST /api/hjelp` (se under) |
| Tilgang | `worker/tilgang.js`, `worker/index.js` (se under) |
| Sider | SB1 `/support/saker`, SB2 `/support/saker/H-nnnn`, SB3 `/support/timer`, SO2 `/oppstart`, SO1 `/oppstart/:id`, «Ingen tilgang» `/ingen-tilgang`, Innstillinger › Support og roller `/innstillinger/support`, SA1 med tre nye kort. Skript i `src/scripts/` (saker, sak, timer, oppstart, oppstart-kunde, ny-sak, ingen-tilgang, support-innstillinger), visningsbiter i `src/lib/support-ui.ts`, stiler i `src/styles/support.css` (bare token-variabler, bare lys). Telefon: SB1 (kort + filterbrikker), SB2 (tidtaker øverst, «Sendt med Hjelp» som kort, svarmaler som brikker), SO2 (kort) |
| Meny | `src/lib/meny.ts`: **alle** punktene for fase B, C og Drift er på. Punktene har `roller`; support ser bare Support (Saker, Timer). Tall: åpne saker, oppstarter i gang, «N feil» på Fakturakjøring i rød tekst (fra K-260-endepunktet), frister innen 14 dager. Bunnfaner på telefon: Oversikt, Tavle, Saker, Eiere, Mer (60-212 valg 14); support: Saker, Timer, Mer |
| Eksempeldata | Bare `scripts/lib/admin-eksempeldata-b.mjs` (sakene H-1040–H-1048, tråden i H-1047, timene i oktober, oppstartene for Nordli, Elvetangen, Strand og Granlund), lagt inn etter fase A-dataene. Fristene settes ut fra «nå», så forfalt/snart/pause vises uansett når det kjøres |
| Tester | `scripts/admin-fase-b.test.mjs` (13 tester, i `npm test`) |
| Skjermbilder | `claude/k259/` (33 PNG), laget av `npm run skjermbilder:k259` |

### Tilgang og rollen Support
- **Eier** (står i `worker/tilgang.js` som før) skriver alt.
- **Support**: supportpersoner står i D1-tabellen `bruker` (`rolle = 'support'`, `aktiv = 1`), så Eirik kan legge dem til under Innstillinger › Support og roller uten kodeendring. Databasen kan bare gi rollen support, aldri eier (testet). Support kan lese og skrive `/api/saker*` og `/api/tidsforing*`, lese `/api/timer` (uten beløp: `timepris_ore` og `belop_ore` er `null`), `/api/meg` og `/api/meny-tall`. Alt annet gir **ADM-403**. Åpner rollen en annen side, serverer Workeren «Ingen tilgang» med status 403 og teksten «Du har ikke tilgang til *Fakturering*» (området leses fra adressen), «Til saker» og «Spør Eirik om tilgang».
- **Kunder for support**: holdt utenfor til Eirik svarer på 60-212 spørsmål 6 (i dag 403). Menypunktet kan slås på i `meny.ts` (`roller`) og `tilgang.js` (`SUPPORT_SE`).

### Svarfrist og frist-stopp
Fristen regnes i arbeidstid fra saken ble opprettet (Kritisk 1 t, Høy 4 t, Normal 1 virkedag, Lav 3 virkedager, 08–16 hverdager – alt Eksempel og endres i Innstillinger › Support). Ved «Venter på kunde» lagres arbeidsminuttene som var igjen og klokka står («Pause»). Når saken går tilbake til Åpen (for hånd eller fordi kundens svar registreres), får den ny frist = nå + det som var igjen. En løst sak som gjenåpnes, får full frist fra nå. Endret prioritet regner fristen på nytt fra opprettet. Helligdager er ikke med.

### POST /api/hjelp – valg: skjermbildet i **R2**, ikke D1
Unntatt Access i Workeren som `/api/lead`, med samme vern: bare POST (+ OPTIONS for CORS), **Origin fra innstillingen `hjelp_origins`** (standard `https://*.hengsel.no` = alle kundemiljøene; `*.` dekker underdomener, ikke hengsel.no selv og ikke `hengsel.no.annet.no`), honeypot `nettsted`, tidsfeltet `t` (3 s – 24 t), lengdegrenser og kontrolltegn, innholdstype JSON eller multipart, maks 2 MB bilde + 64 KB, og valgfri **`HJELP_NOKKEL`** (Bearer). Uten Origin (Ute som app) kreves nøkkelen. Feltene som i SB4/60-209: emne, tekst, prioritet, app (crm/ute → kilde hjelp-crm/hjelp-ute), side, adresse, versjon, enhet, bruker, bruker_epost, valgfritt skjermbilde. Saken kobles til eieren via vertsnavnet i adressen (eller Origin) mot `eier.miljo_adresse`, og til kontakten via e-posten. Svaret har saksnummer, svarfrist og kvitteringsteksten.

**Hvorfor R2:** D1 tillater maks 2 000 000 byte per rad, som er mindre enn 2 MiB, og bilder i databasen gjør sikkerhetskopi, eksport og Time Travel tunge. R2 er laget for filer og koster lite. Bildet sjekkes på de første bytene (PNG/JPEG/WebP; en SVG med `.png`-navn avvises), og vises bak Access fra `/api/saker/H-nnnn/skjermbilde` med `Content-Security-Policy: default-src 'none'; sandbox` og `nosniff`. Er R2 ikke koblet til, lagres saken uten bilde og får et internt notat om det.

### E-post til kunden: bare utkast
«Lagre svar» lagrer svaret i tråden med `utsendelse = 'utkast'` og viser e-posten (til, emne «Re: [H-1047] …», teksten og tidligere meldinger slik kunden ser dem, **aldri interne notater**) med «Kopier e-posten». Ingenting sendes. For å sende trengs:
1. Valg av løsning (f.eks. Cloudflare Email Service / Email Routing send-binding, Postmark, Resend eller Microsoft 365 Graph fra `support@hengsel.no`).
2. Avsenderdomene med SPF, DKIM og DMARC for avsenderadressen (DNS – ikke rørt).
3. En hemmelighet (API-nøkkel) eller binding i Workeren, og en funksjon som sender `epostUtkast(...)` og setter `utsendelse = 'sendt'` (kolonnen og CHECK finnes).
4. Svar inn: adresse/webhook som legger kundens svar i saken som `type = 'kunde'` (starter fristen igjen; logikken finnes i `POST /api/saker/:nr/meldinger`).
5. Samme løsning kan brukes til «Send påminnelse» i Oppstart og varsel om svar til «Mine saker».

### Neste fakturakjøring (SA1) og K-260
Kortet og menytallet leser `GET /api/fakturakjoring/neste`. Til K-260 har laget det, svarer API-et 404 og kortet viser «Kommer». Formen kortet forventer: `{ dato: "2026-11-01", mnd_navn: "November", dager_til: 18, antall: 6, sum_uten_mva_ore: 14951200, klar: 3, sendt: 2, feil: 1, feilmeldinger: ["Nordli finnes ikke i PowerOffice"] }`. Menyen viser «N feil» ved Fakturakjøring når `feil > 0`. Stiene for fase C i menyen er de som sto i `meny.ts` fra K-240 (`/fakturering/abonnement`, `/fakturering/kjoring`, `/fakturering/kpi`, `/fakturering/utestaende`, `/tall`); Drift-punktene peker på dagens `/drift#…`. Endrer K-260 stier, må `meny.ts` følge med.

## Før fletting og utrulling (Oversikt)
1. **D1:** `npx wrangler d1 migrations apply hengsel-admin --remote -c sites/admin/wrangler.jsonc` (kjører 0002).
2. **Access:** bypass-policy for stien **`/api/hjelp`** (som for `/api/lead`), ellers stopper Access «Hjelp» før Workeren. Supportpersoner må også slippes inn av Access-policyen (Workeren sjekker rollen selv i tillegg).
3. **R2:** `npx wrangler r2 bucket create hengsel-admin-skjermbilder --location weur`, og ta inn den utkommenterte `r2_buckets`-blokken i `sites/admin/wrangler.jsonc` (binding `SKJERMBILDER`).
4. **Valgfritt:** `npx wrangler secret put HJELP_NOKKEL -c sites/admin/wrangler.jsonc` (påkrevd hvis Ute sender fra app uten Origin).
5. Hjelp-knappen i CRM/Ute bygges i egen K i hengsel-crm og skal sende til `https://admin.hengsel.no/api/hjelp`.

## Åpne spørsmål (60-212) og hvor svaret legges inn
| Nr. | Spørsmål | Standard nå | Hvor |
|---|---|---|---|
| 1 | Inkluderte timer fra år 2 | Samme timer så lenge avtalen løper; SB3 viser «År 2 … regnet som år 1 til regelen er avklart» | `avtaleAar` / `timer`-ruten i `worker/api-support.js` |
| 2 | Timepris | 1 150 kr, påbegynte 15 min (Eksempel) | Innstillinger › Support og roller. Ingen kode |
| 3 | Svarfrister | 1 t / 4 t / 1 virkedag / 3 virkedager, 08–16 (Eksempel) | Samme sted. Ingen kode |
| 6 | Support og Kunder | Support ser ikke Kunder | `meny.ts` (`roller`) og `tilgang.js` (`SUPPORT_SE`) |
| 7 | Oppstart før signering | Oppstart kan lages når avtalen er sendt til signering | `GET /api/oppstart/valg` |
| 10 | Admin i CRM ser alle saker | Ikke bygd («Mine saker» kommer med Hjelp-knappen) | `kundeVisning` i `src/lib/support.js` er klar til et kunde-endepunkt |

## Sjekk
- `npm test`: 190 av 191 tester grønne, 1 hoppet over (som før), 0 feil; `sjekk-lenker` grønn. Nye tester i `scripts/admin-fase-b.test.mjs`: migreringen, tilgang eier/support/ingen (ren funksjon og gjennom Workeren med ekte Access-token), svarfrist i arbeidstid (helg, natt, sommertid, annen arbeidstid), snart/forfalt og sortering, frist-stopp og -start (rent og gjennom API-et), kvart-time-avrunding (tidtaker og manuell), timer under/grense/over, hjelp-vernet, at internt notat aldri kommer i kundevisningen eller e-postutkastet, oppstartstatus og eksempeldataene. `admin-fase-a.test.mjs` sjekker nå også at `wrangler d1 migrations apply --local` kjører 0002.
- `npm run build`: alle nettstedene bygger.
- `node scripts/hengsel-regler.mjs sites/admin`: «ingen fargeverdier utenfor den delte fila, og ingen mørk modus».
- Skjermbilder i `claude/k259/`: 1440 for alle nye skjermer, 390 for SB1, SB2, SO2 og «Ingen tilgang», som eier og som support, og tilstandene tom, laster, feil og ingen treff. Ingen konsollfeil, mislykkede forespørsler eller sidelengs rulling.
- HawkScan (DAST) kunne ikke kjøres: `hawk` er ikke installert og `HAWK_API_KEY` er ikke satt. Sikkerheten er dekket av testene over (Access, roller, validering, Origin/honeypot/tid/nøkkel, bildetype, CSP uten inline).

## Kjente begrensninger
- Helligdager er ikke med i svarfristen.
- Oppstart lages for hånd («Ny oppstart» fra en avtale); den lages ikke automatisk når avtalen sendes (det ville kreve endring i K-240-ruten for avtaler).
- Sidemenyen filtreres på rolle i nettleseren etter `/api/meg` (huskes i sessionStorage). Første gang kan eier-punktene vises et øyeblikk for support; Workeren stenger uansett.
- Toppfeltets meny-knapp (…) var synlig på PC i K-240 (CSS-rekkefølge). Rettet i `support.css`.
