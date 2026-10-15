# K-260 · Hengsel Admin fase C og Drift: Fakturering, KPI, Utestående, Tall og Drift-sidene (S-62)

Gren `claude/k260-admin-fase-c` fra `main` (a5da856, etter K-240). PR mot main; Eirik fletter. Går parallelt med K-259 (fase B).
Grunnlaget er `docs/design/admin-fase-a/60-211_admin_spesifikasjon_fase_bc.md` med 60-207, 60-210, 60-212 og `assets/admin-data-bc.js`.
Ingen DNS, domener, Cloudflare Access eller hengsel-crm er rørt. Ingen nøkler, passord eller tokens i kode, data, commit eller skjermbilder.
Ingen fakturaer eller e-post er sendt; PowerOffice er ikke kalt.

## Hva som er bygget

| Del | Hvor |
|---|---|
| Migrering | `sites/admin/migrations/0003_fase_c.sql`: abonnement, abonnementslinje (gjelder fra/til), abonnementsendring, fakturakjoring, faktura, fakturalinje, kpi_justering, kpi_justering_kunde, konto, frist, rutine, rutinepunkt, rutineavkryssing (per periode). Innstillingene varsler, kundemiljoer og internkost_time_ore (eksempel). Kjederabatten lagres ikke. Avhenger bare av 0001 |
| Rene regler | `sites/admin/src/lib/fakturering.js`: pris på en dato (alltid `beregn()` fra `pris.js`, K-240), KPI-faktor, hvem som er med i en måned, fakturaen for ett abonnement (abonnement, etablering, timer, viderefakturert), «Endret:», e-postutkast for KPI |
| API | `worker/api-fakturering.js` (SC1–SC4, ST1, SA1-kortet) og `worker/api-drift.js` (SD1, SD2, Innstillinger). I `worker/api.js` er det én import per modul og én linje som registrerer rutene |
| PowerOffice | `worker/poweroffice.js`: AV til `POWEROFFICE_APP_KEY`, `POWEROFFICE_CLIENT_KEY` og `POWEROFFICE_SUBSCRIPTION_KEY` er satt (samme mønster som Penneo). Klienten kan ikke lages uten dem |
| Sider | `/fakturering/abonnement`, `/fakturering/kjoring`, `/fakturering/kpi`, `/fakturering/utestaende`, `/tall`, `/drift/status`, `/drift/lenker`, `/drift/kontoer`, `/drift/frister`, `/drift/rutiner`, `/innstillinger/varsler`, `/innstillinger/kundemiljoer`, `/innstillinger/avtalemaler`, `/innstillinger/brukere`. Felles hjelpere i `src/lib/fase-c.ts`, stiler i `src/styles/fase-c.css` (egen fil, så den ikke kolliderer med K-259 i admin.css) |
| Eksempeldata | Bare `scripts/lib/admin-eksempeldata-c.mjs` (bygger på fase A-dataene) |
| Tester | `scripts/admin-fase-c.test.mjs` (13 tester, i `npm test`) |
| Skjermbilder | `claude/k260/` (27 PNG i 1440), `npm run skjermbilder:k260` |

### Hva som skjer i flyten
- **SC1 Abonnement:** lages fra en signert avtale (409 ellers). Linjene hentes fra tilbudet avtalen ble laget fra (pakke og ekstra brukere per butikk, montører fra butikkene, tillegg som ikke er inkludert), med avtalens prisliste. Prisen er da lik avtalens pris (testet for alle seks). «Ny endring» (pakke, ekstra brukere, montører, butikk lagt til/fjernet, tillegg) lukker linjen dagen før og lager en ny fra «gjelder fra». Historikk nyeste først, framtidige merket «Kommer». Kjederabatten regnes ut på nytt hver gang.
- **SC2 Fakturakjøring:** neste måned som standard, forskuddsvis den 1. Siden viser en forhåndsvisning til «Lag utkast» lagrer den. Ett kort per faktura: abonnementet, etablering første måned (uten rabatt, én gang), timer forrige måned ut over inkludert × timepris, viderefakturert (kostpris lagt inn for hånd + 15 %, uten rabatt), «Endret:» mot forrige måned (med beløpet), sum uten mva, mva og med mva. Sidepanelet har summene og engangslinjene per type. «Regn ut på nytt» beholder kostprisene og status Feil; sendte fakturaer er låst. «Send N til PowerOffice» er grå med forklaring når PowerOffice ikke er koblet til.
- **SC3 KPI:** prosent for hånd (per år), varsel dager før (30, merket «Eksempel»). Ny pris = pris i dag × (1 + KPI), hele kroner. «Utkast klart» når varseldatoen er innen 14 dager. E-postutkast per kunde, «Kopier e-posten» og «Merk som varslet». Ingenting sendes. Først når kunden er merket som varslet, får fakturaene ny pris fra KPI-datoen, og neste KPI-dato flyttes ett år.
- **SC4 Utestående:** leses fra PowerOffice hver gang og lagres ikke. Uten nøkler: tom tilstand med forklaring.
- **ST1 Tall:** regnet i Workeren fra egne tabeller: MRR (inntekt i måneden), hittil i år, kunder, butikker, churn (sagt opp siste 12 mnd), inntekt per måned (12 søyler) og per år (i fjor, hittil, prognose), kunder og butikker over tid, supporttimer mot inkludert, driftskost og bidrag (supporttimer × intern kost 650 kr, eksempel), salgstrakt og tapt-årsaker fra tavla, fornyelser de neste 90 dagene. Saker telles når fase B-tabellen `sak` finnes.
- **SD1 Status:** én rad per kundemiljø fra Innstillinger › Kundemiljøer (eller miljøadressene på kundekortene når lista er tom). Versjon, utrulling, feil, innlogging, brukere og sikkerhetskopi står som «Ikke koblet». Cloudflare og Supabase vises fra de offentlige statussidene (`/api/v2/status.json`, ingen nøkler, 2,5 s tidsavbrudd). Ingen utrulling fra Admin.
- **SD2:** Lenker (fra datafilene i `src/data`, samme kilde som Drift fra K-184), Kontoer (kost per måned, fornyelse rød innen 30 dager, lenke til 1Password-hvelv, sum fast kost), Frister (dager igjen, gul ved 7 eller færre, «Ny frist»), Rutiner (måned, uke, kvartal, avkryssing per periode med telling). Tekstfelt som ser ut som passord eller nøkler avvises (ADM-400), og hvelv-lenken må være https til 1password.com/.eu/.ca.
- **Innstillinger:** Varsler (brytere), Kundemiljøer, Avtalemaler (versjon, gjelder fra, brukt i, status) og Brukere og roller (tilgangstabell). Leverandør og Prisliste er fra K-240.
- **Tilgang:** alle rutene i fase C og Drift krever rollen eier, også GET. Supportrollen (og alle andre) får 403 ADM-403 «Du har ikke tilgang til Fakturering/Tall/Drift/Innstillinger», og sidene viser «Du har ikke tilgang til …» med «Til saker» og «Spør Eirik om tilgang».

## Avtaler med K-259

| Hva | Avtale |
|---|---|
| **GET /api/oversikt/fakturering** (SA1-kortet «Neste fakturakjøring») | `{ ok, maaned: "2026-11", navn: "November 2026", dato: "2026-11-01", antall, sum_uten_mva_ore, klar, sendt, feil, lagret, href: "/fakturering/kjoring" }`. Beløp i øre. Gjelder neste måned; er utkastet ikke lagret, er tallene en forhåndsvisning (`lagret: false`). Bare eier (403 for support). «1 feil» i menyen kan leses fra `feil` |
| **Meny** (`meny.ts`, K-259) | Jeg har ikke rørt menyen. Stiene: Abonnement `/fakturering/abonnement`, Fakturakjøring `/fakturering/kjoring`, KPI `/fakturering/kpi`, Utestående `/fakturering/utestaende` (som i meny.ts), Tall `/tall`, Drift: Status `/drift/status`, Lenker `/drift/lenker`, Kontoer `/drift/kontoer`, Frister `/drift/frister`, Rutiner `/drift/rutiner` (meny.ts peker i dag på `/drift#…`, som er K-184-siden; den er beholdt). Innstillinger: `/innstillinger/varsler`, `/innstillinger/kundemiljoer`, `/innstillinger/avtalemaler`, `/innstillinger/brukere`. Side-id-er (`aktiv`): `abonnement`, `kjoring`, `kpi`, `utestaende`, `tall`, `drift-status`, `drift-lenker`, `drift-kontoer`, `drift-frister`, `drift-rutiner`, `innstillinger-varsler|kundemiljoer|avtalemaler|brukere`. «Frister innen 14 dager» i menyen: `innen_14` i GET /api/drift/frister |
| **Tidsføring** (fase B) | Fakturakjøringen og Tall leser tabellen `tidsforing` når den finnes, med kolonnene `eier_id`, `dato` (ÅÅÅÅ-MM-DD), `minutter` og (valgfri) `fakturert_kjoring_id`. Minuttene er allerede rundet til påbegynte 15 min. Når en faktura med timelinje er sendt, settes `fakturert_kjoring_id` på føringene for den måneden. Har K-259 andre navn, er det én spørring i `minutterPerEier` (`worker/api-fakturering.js`) |
| **Timepris** (K-259 eier innstillingen) | Leses fra innstillingen `support_timepris_ore` (heltall øre). Mangler den: 1 150 kr som eksempel. Supportnivå, timepris og svarmaler er K-259s; jeg har ikke laget sider for dem |
| **Supportrolle** | Jeg har ikke endret `worker/tilgang.js`. Rutene mine sjekker `bruker.rolle === "eier"` selv, så rollen `support` (når K-259 legger den inn) får 403 uten mer kode. Supportrollens sider bør kunne nå `/fakturering/*` (for å se «Ingen tilgang»), eller få 403 fra Workeren |
| **Migreringer** | Jeg bruker bare `0003_fase_c.sql`, som ikke avhenger av 0002 |

## Før fletting og utrulling

1. **D1:** `npx wrangler d1 migrations apply hengsel-admin --remote -c sites/admin/wrangler.jsonc` (0003 etter 0001/0002).
2. **PowerOffice** er av. Før nøklene settes (`npx wrangler secret put POWEROFFICE_APP_KEY|POWEROFFICE_CLIENT_KEY|POWEROFFICE_SUBSCRIPTION_KEY -c sites/admin/wrangler.jsonc`) må stiene og feltene i `PowerOfficeKlient` sjekkes mot Postman-samlingen på developer.poweroffice.net: innlogging (OAuth client credentials, Basic app:klient + `Ocp-Apim-Subscription-Key`, token 20 min) er etter dokumentasjonen, mens `GET /Customers?organizationNumbers=`, `POST /SalesOrders/Complete` og `GET /CustomerLedger/OpenItems?toDate=` er skrevet etter beste skjønn. developer.poweroffice.net svarte ikke fra denne økta. Vil dere prøve mot demo først: `POWEROFFICE_API_URL=https://goapi.poweroffice.net/demo/v2`.
3. **Statussidene** for Cloudflare og Supabase hentes fra Workeren uten nøkler. `DRIFT_STATUSSIDER=av` slår det av.

## Åpne spørsmål og hvor svaret legges inn

| Spørsmål (60-212) | Standard nå | Hvor |
|---|---|---|
| 2 Timepris | 1 150 kr (eksempel) til `support_timepris_ore` er satt | Innstillinger › Timepris (K-259) |
| 4 Varsel før KPI | 30 dager, merket Eksempel | KPI-siden (feltet). Ingen kode |
| 8 Én faktura per eier eller butikk | Per eier, butikkene i abonnementslinjen | `lagFaktura` i `src/lib/fakturering.js` og `lagSalgsordre` |
| 9 Kostpris for SMS/Penneo/AI | For hånd per kjøring («Kostpris» på kortet), rutine i Drift | Kobling senere: legg linjene inn med kilde «manuell» |
| 15 Intern kost per supporttime | 650 kr, eksempel (`internkost_time_ore`) | Innstillingen i D1 |
| Start midt i måneden | Hele måneden faktureres (ingen forholdsmessig del) | `erMed`/`lagFaktura` hvis det skal deles |
| KPI når pakken endres etter justering | Faktoren gjelder hele prisen, også nye linjer | `prisPaa` |
| Databasekost per kunde i Tall | Ikke med (ikke koblet) | Kommer med kundemiljø-koblingen |

## Sjekk

- `npm test`: 190 bestått, 0 feilet, 1 hoppet over (fra før). Nye i `scripts/admin-fase-c.test.mjs`: migreringen (tabeller, ingen rabatt lagret, kjører uten 0002, ingen eksempeldata eller nøkler), abonnement fra signert avtale (= avtalens pris, 409 ellers), fakturakjøringen (abonnementslinjen = `AdminData.beregn` og = `fast` i admin-data-bc.js for Granlund 29 860, Strand 9 290, Aune 8 134, Vestby 5 290 og Nordli 13 234 kr; rabatten; summer og mva), etablering (Nordli 75 000 kr, bare én gang), timer (Aune 1,5 t × 1 150 = 1 725 kr), påslag 15 % (412 → 473,80, 286 → 328,90, 98 → 112,70, 64 → 73,60), endring Start → Butikk (+1 700 kr i «Endret:»), KPI (8 134 → 8 386 kr, ny pris først etter varsling, neste KPI-dato +1 år), tilgang (support får ADM-403 på Fakturering, også GET, Tall, Drift og Innstillinger), PowerOffice av uten nøkkel (409, `fetch` kalles aldri, Utestående tom) og med nøkler mot et stubbet API (Sendt, Feil «kunden finnes ikke», låste fakturaer, tidsføring merket), Drift (hemmeligheter avvises, 1Password-lenke, perioder og avkryssing), SA1-formen og Tall.
- `npm run build`: alle nettstedene bygger.
- `node scripts/hengsel-regler.mjs sites/admin`: ingen fargeverdier utenfor den delte fila, ingen mørk modus. Ingen `style=`-attributter (diagrammene er SVG med klasser), ingen eksterne adresser i koden.
- Skjermbilder i `claude/k260/` (1440): alle skjermene, dialogene «Ny endring» og «Kostpris», tilstandene tom/laster/feil for Fakturakjøring, Abonnement og Tall, og «Ingen tilgang» for supportrollen. Ingen konsollfeil, ingen mislykkede forespørsler, ingen sidelengs rulling. Menyen i skjermbildene er fase A-menyen (K-259 eier den).
- HawkScan (DAST): kunne ikke kjøres i denne økta. `hawk`-CLI-en er ikke installert og `HAWK_API_KEY` er ikke satt. Sikkerheten er sjekket med testene over (rolle på hver rute, validering på serveren, ingen hemmeligheter, ingen utgående kall uten nøkler).

## Kjente begrensninger

- Kundemiljøenes tall (versjon, utrulling, feil, innlogging, brukere, sikkerhetskopi) er ikke koblet til; de vises som «Ikke koblet».
- Status Sendt/Feil i skjermbildene er satt rett i den lokale databasen (merket i `admin-eksempeldata-c.mjs`), siden PowerOffice ikke er koblet til.
- Tidsføringen i eksempeldataene er en minste utgave av fase B-tabellen, laget bare når K-259 ikke har laget den.
