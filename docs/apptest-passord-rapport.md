# Hengsel apptest: passordet og demobrukerne tilbake (S-56)

Gren: `claude/apptest-passord-tilbake` (fra `main` 64d96fd). Ingen database. Ikke pushet til `main`, ikke deployet (ingen `wrangler deploy`, ingen versions upload).
Ingen passord står i denne rapporten, i koden eller i en innsjekket `.dev.vars`. Testverdiene under kontrollen var tilfeldige, lokale og står bare
i en `.dev.vars` som er slettet igjen (filen står i `.gitignore`).

## 1. Hva fjernet passordet og demobrukerne?

Tidslinjen i `git log -p` for `sites/hengsel` (wrangler.jsonc, `worker/apptest.ts`, `src/pages/apptest.astro`):

| Når | Hva | Effekt |
|---|---|---|
| 07.10 `a4c1581` (K-107, PR #1 08.10) | Workeren `worker/apptest.ts`, `run_worker_first`, `passord.astro` | Passordet foran `/apptest` |
| 08.10 `665cb4f` (K-114, PR #3 08.10 19:33) | `DEMO_PASSORD` satt inn av Workeren, PDF med fyllbart passordfelt, delen «Prøv med demobrukerne» | Demobrukerne |
| 10.10 `4f36a73` (PR #9, merget 10.10 01:09) | «ny testside for Hengsel Ute 1.6.0, statisk og uten passord»: slettet `worker/apptest.ts`, `passord.astro`, `scripts/apptest.ts`, PDF-en og skrev `apptest.astro` om | Passord **og** demobrukere borte |
| 10.10 `407f115` (samme PR #9) | «passordet tilbake som før»: Workeren, `passord.astro` og `run_worker_first` kom tilbake, men fra K-107-versjonen | Passordet tilbake. **Demobrukerne kom ikke tilbake**: `DEMO_PASSORD`-koden i Workeren, PDF-en og demodelen i siden mangler. |
| 11.10 #34 (`4f7fab3`) | Ny `/apptest` etter fil 60 | Rørte ikke Workeren; demodelen var allerede borte |

Funn:

- **Demobrukerne og demopassordet** ble fjernet av PR #9 (`4f36a73`) og aldri tatt inn igjen av `407f115`. Dette er rettet her.
- **Passordet foran siden finnes på `main`**: `wrangler.jsonc` har `main: ./worker/apptest.ts` og `run_worker_first: ["/apptest", "/apptest/*"]`, og
  Workeren er uendret siden `407f115`. Jeg leste også Worker-koden som ligger utrullet på Cloudflare (Worker `hengsel`, endret 11.10 09:04, etter
  #34): det er samme kode (passordside, 303/401/503, HMAC-informasjonskapsel), uten `DEMO_PASSORD`. Jeg fant altså ingen endring i koden som slipper
  folk inn uten passord. Sandkassen når ikke hengsel.no, så jeg har ikke selv sett at `/apptest` er åpen.
- Det jeg ser som mulige forklaringer på at siden åpnes uten passordside, i denne rekkefølgen:
  1. En nettleser med en gyldig informasjonskapsel (`hengsel_apptest`, 30 dager, Path=/apptest). Signaturen avhenger bare av
     `APPTEST_PASSORD` og `APPTEST_NOKKEL`, som ikke er byttet, så kapselen fra tidligere innlogging virker fortsatt. Test i et privat vindu eller med
     `curl -sI https://hengsel.no/apptest` (skal gi 200 med passordsiden; se `docs/hosting.md`).
  2. Hemmelighetene mangler på Workeren i en annen Cloudflare-konto/miljø enn jeg ser: da gir siden 503, ikke åpen side (kontrollert lokalt, under).
  3. Utrullingen: `assets.run_worker_first` er en innstilling som bare virker hvis Workers Builds bruker `-c sites/hengsel/wrangler.jsonc` i både
     Deploy command og Non-production branch deploy command. Jeg kan ikke lese bygginnstillingene herfra.
  Hvis `curl` uten informasjonskapsel gir selve «Test Hengsel Ute»-siden (ikke passordsiden eller 503), er det 3, og da må Deploy command sjekkes i
  dashbordet. Det er ikke noe jeg kan se eller endre fra repoet.
- Åpent: jeg vet ikke om hemmeligheten `DEMO_PASSORD` ligger på Workeren `hengsel` (ingen verktøy for å liste hemmeligheter). Mangler den, står
  «Passordet får du av den som inviterte deg.» på siden; ingenting går i stykker. Sett den med
  `npx wrangler secret put DEMO_PASSORD -c sites/hengsel/wrangler.jsonc`.

## 2. Commits og endrede filer

Se `git log main..claude/apptest-passord-tilbake`. Endringene:

- `sites/hengsel/worker/apptest.ts`: `DEMO_PASSORD` i `Env`, `medDemopassord()` (HTMLRewriter) bare for HTML-svar til innloggede. Merkene er
  `data-demopassord`, `data-demopassord-verdi` og `data-uten-demopassord`.
- `sites/hengsel/wrangler.jsonc`: kommentaren nevner `DEMO_PASSORD`. `run_worker_first` er som før.
- `sites/hengsel/src/pages/apptest.astro`: ny del «Prøv med demobrukerne» etter de tre kortene (forklaring, demopassord i egen flate med «Kopier»,
  merknad om `@demo.invalid`, «Last ned oversikten (PDF)», listene «I appen» og «I CRM-et»). Logoen i toppen er flyttet til komponenten under.
  Knapper har mørkere blå ved hover i stedet for gjennomsiktighet (axe: kontrast).
- `sites/hengsel/src/pages/apptest/passord.astro`: passordsiden i samme stil som `/apptest`, med teksten fra bestillingen.
- `sites/hengsel/src/components/UteLogo.astro` (ny): Ute-logoen, felles for `/apptest` og passordsiden. Tilgjengelig navn: «Hengsel Ute – forside».
- `sites/hengsel/src/scripts/kopier.ts` (ny): «Kopier» (utklippstavle, med markering som reserve). Ingen inline-skript, så CSP `script-src 'self'` holder.
- `sites/hengsel/public/apptest/Logg_inn_i_demoen.pdf`: gjenopprettet fra git (`4f36a73^`). Passordfeltet i PDF-en er tomt og fylles ut av den som deler den.
- `scripts/skjermbilder-apptest.mjs`: lys og mørk, sjekker demopassord, Kopier, PDF, feilteksten. `scripts/apptest-passord.test.mjs` (ny, kjøres av `npm test`):
  vakt for `run_worker_first`, 503-låsen, merkene og teksten på passordsiden. `package.json`: test-skriptet tar med den.
- `docs/hosting.md`: `DEMO_PASSORD`, ny feiltekst, lokal testing. `docs/skjermbilder/apptest-*.png` (nye navn, lys og mørk), de gamle navnene er slettet.

## 3. Valg

- **Innhold i «Test Hengsel Ute» er uendret** (versjon 1.7.0, tre kort, lenker, skjermbilder, «Slik melder du feil», «Hva er nytt i 1.7.0», «Testere»).
- **Demodelen står mellom kortene og skjermbildene.** Samme tekst som i K-114. «Kopier» er ny (bestillingen ber om den; den fantes ikke i K-114).
- **`@demo.invalid`-merknaden står igjen.** Jeg sjekket appkoden i `innlandet-crm-sync` (`main`, 67d0d62): innloggingen sender e-postfeltet uendret til
  `supabase.auth.signInWithPassword({ email: epost.trim(), … })`, og ingenting legger til `@demo.invalid`. «Hva er nytt i 1.7.0» nevner heller ikke
  brukernavn-innlogging. Brukernavn alene virker altså ikke ut fra det jeg kan se. Fjern merknaden når den nye innloggingen er ute. PDF-en har samme forbehold.
- **Passordsiden:** knappen heter «Åpne», feilen «Feil passord. Prøv igjen, eller spør Eirik.», og teksten «Skriv passordet du fikk sammen med lenken.». Toppfelt
  og bunn som på `/apptest`. Feilteksten ligger i den statiske siden og vises ved at Workeren fjerner `hidden` (som før).
- **Ingen Basic Auth.** Skjemaet bruker POST til `/apptest` og informasjonskapsel som i K-107.
- **PDF og andre filer under `/apptest/` ligger bak passordet** (Workeren går først for alt under `/apptest/`). `/apptest.html` svarer 307 til `/apptest`
  (som så går gjennom Workeren), så siden kan ikke hentes rundt passordet.
- **Skjermbildene viser en testverdi** i demopassord-flaten (en tilfeldig lokal verdi som bare er brukt i testen), ikke det ekte passordet.
- Siden er bare i lys modus (`tema="light"`), så «mørk» er identisk med «lys» i skjermbildene. Begge er tatt med, med colorScheme dark.

## 4. Kontroll

`npm run build`: grønn. `npm test`: 16 enhetstester (inkl. 3 nye) og lenkesjekk (280 forespørsler, 0 feil). `scripts/skjermbilder-apptest.mjs` med axe-core
(WCAG 2 A/AA): 0 feil, 390 og 1440, lys og mørk, passordside, passordside med feil, siden etter innlogging, 360 px uten vannrett rulling,
ingen konsollfeil, én informasjonskapsel (HttpOnly, Secure, SameSite=Lax, Path=/apptest).

`wrangler dev` (lokalt, testhemmeligheter), statuskoder og hoder (verdier utelatt):

```
(a) alle tre hemmeligheter
GET  /apptest (uten kapsel)       200  Cache-Control: private, no-store | X-Robots-Tag: noindex, nofollow | Vary: Cookie
                                       CSP: default-src 'self'; script-src 'self'; style-src 'self' 'sha256-…'; … form-action 'self'; frame-ancestors 'none'
                                       body: passordsiden («Skriv passordet du fikk sammen med lenken.», ingen data-demopassord)
POST /apptest passord=feil        401  X-Robots-Tag: noindex, nofollow | body: «Feil passord. Prøv igjen, eller spør Eirik.», #passord aria-invalid
POST /apptest riktig passord      303  Location: /apptest | Set-Cookie: hengsel_apptest=<verdi>; Max-Age=2592000; Path=/apptest; HttpOnly; Secure; SameSite=Lax
GET  /apptest (med kapsel)        200  noindex + no-store + samme CSP | demopassordet satt inn (1 treff), data-uten-demopassord fjernet,
                                       <div class="passord" data-demopassord> uten hidden
GET  /apptest/Logg_inn_i_demoen.pdf  uten kapsel 401, med kapsel 200 application/pdf
GET  /   200   GET /personvern 200   GET /apptest.html 307 (til /apptest)   demopassordet står ikke i den statiske forsiden (0 treff)

(b) APPTEST_* satt, uten DEMO_PASSORD
GET  /apptest (med kapsel)        200  «Passordet får du av den som inviterte deg.» står, [data-demopassord] er skjult

(c) uten hemmeligheter
GET  /apptest                     503  «Siden er låst. Passordet er ikke satt opp ennå.» | noindex + no-store
GET  /apptest/passord             503   GET /apptest/Logg_inn_i_demoen.pdf 503   POST /apptest 503
GET  /   200   GET /personvern 200   GET /finnes-ikke 404 (uendret)
```

Skjermbilder (`docs/skjermbilder/`): `apptest-passord-{mobil,desktop}-{lys,mork}.png`, `apptest-passord-feil-mobil-{lys,mork}.png`,
`apptest-{mobil,desktop}-{lys,mork}.png` (siden etter innlogging, med demodelen).

## 5. Før main

- Sett `DEMO_PASSORD` på Workeren `hengsel` hvis den ikke ligger der (se over). Uten den vises «Passordet får du av den som inviterte deg.».
- Etter utrulling: `curl -sI https://hengsel.no/apptest` uten informasjonskapsel skal gi `200` med passordsiden (ikke «Test Hengsel Ute», ikke 503).
  Hvis den gir selve siden, sjekk at både Deploy command og Non-production branch deploy command har `-c sites/hengsel/wrangler.jsonc`.

KLAR FOR MAIN
