# Lead fra «Be om demo» gjennom service binding (oppfølging av K-240)

Gjennomgangen av `POST /api/lead` viste at ruten var åpen for alle på internett når `LEAD_NOKKEL` ikke var satt. Origin, honeypot og tidsfeltet `t`
settes av avsenderen og kan forfalskes. Denne runden lager tiltak 1, 5, 6, 7 og 8 fra gjennomgangen. Rate limiting og Turnstile tas i en egen runde.

## Hva er endret

| Tiltak | Endring |
|---|---|
| 1. Service binding | Admin har et navngitt inngangspunkt `LeadInngang` (`sites/admin/worker/inngang.js`, RPC-metoden `lagre`). Hovedmodulen er nå `worker/main.js`, som eksporterer fetch-handleren fra `worker/index.js` og `LeadInngang`. hengsel-Workeren kaller det gjennom `services: ADMIN_LEAD → admin#LeadInngang` i `sites/hengsel/wrangler.jsonc`. HTTP-ruten `/api/lead` er fjernet, så stien går gjennom Access-sjekken (401 uten token, 503 uten Access-variabler). `LEAD_URL`, `LEAD_NOKKEL` og `LEAD_ORIGIN` brukes ikke lenger. Leaden sendes bare når den nye variabelen `LEAD_TIL_ADMIN` er `1` (av som standard). |
| 5. Ingen overskriving | Finnes kontakten fra før (samme e-post eller telefon), endres verken kontakten eller eierens felt (`lead_melding`, `lead_butikker`, `lead_tid`, navn og status). Leadet blir bare en aktivitet, og eieren merkes «Ny». Samme melding fra samme eier innen 24 timer lagres ikke på nytt (dublett). |
| 6. Størrelse | `/api/demo` på hengsel.no: `Content-Length` må være et heltall når den er med (ellers 400), og over 8 KB gir 413 uten at kroppen leses. Kroppen leses som en strøm med tak (`lesMedTak`) og avbrytes like over 8 KB, også uten `Content-Length` (chunked). I Admin sjekker `mottaLead` at det som kommer er et vanlig objekt med bare strengverdier og høyst 8 KB som JSON, før de vanlige feltreglene. |
| 7. Tidsavbrudd og waitUntil | `sendLead` gir opp etter 5 s (`LEAD_TIDSAVBRUDD`) og kaster aldri. `worker/index.ts` sender `ctx` videre, og leaden går ferdig med `ctx.waitUntil` etter at svaret er sendt til nettleseren. Bare feilkoden logges. |
| 8. Tester | `scripts/admin-fase-a.test.mjs`: nytt lead, ingen overskriving og dubletter, type- og størrelsessjekk, at `/api/lead` gir 401 eller 503, og at det ekte `LeadInngang` fra `main.js` lagrer (med en etterligning av `cloudflare:workers`, `scripts/lib/cloudflare-workers-stub.mjs`). `scripts/demo.test.mjs`: Content-Length, strøm med tak (også chunked), av/på-bryter, feil hos Admin, waitUntil, tidsavbrudd og konfigurasjonen. `scripts/admin.test.mjs`: `main` er `./worker/main.js`. |

`Content-Length` kreves ikke på `/api/demo`, fordi nettlesere ikke alltid sender den over HTTP/2 og HTTP/3. Strømlesingen med tak dekker tilfellet uten.

## Det du må gjøre selv (ingenting av dette er gjort)

1. **Rull ut `admin` først**, så `LeadInngang` finnes. Deretter `hengsel`, som har bindingen.
2. **Slå på leaden:** sett variabelen `LEAD_TIL_ADMIN` = `1` på hengsel-Workeren i dashbordet (Settings → Variables and Secrets). Er `LEAD_URL` satt
   der i dag, kom leadene frem før. Etter utrulling kommer de ikke frem før `LEAD_TIL_ADMIN` er satt.
3. **Rydd i Cloudflare:** fjern bypass-policyen for `/api/lead` i Access-appen foran admin.hengsel.no. Fjern også variablene `LEAD_URL` og
   `LEAD_ORIGIN` og hemmelighetene `LEAD_NOKKEL` på begge Workerne. Ingen av dem leses lenger.
4. Prøv ett skjema på hengsel.no/priser-og-demo og se at leaden dukker opp i Oversikt.

## Ikke med i denne runden

- Rate limiting og Turnstile på `/api/demo` (egen runde).
- `POST /api/hjelp` i Admin har samme mønster som den gamle `/api/lead` (unntatt Access, `arrayBuffer` uten strøm). Den er ikke endret her.
