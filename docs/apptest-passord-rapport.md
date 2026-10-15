# Hengsel apptest: passordet og demobrukerne tilbake på hengsel.no/apptest (S-56, runde 2)

Gren: `claude/apptest-passord-tilbake`, laget fra `main` f041603 (15.10). Ingen database. Ikke pushet til `main`, ikke deployet (ingen `wrangler deploy`, ingen versions upload).
Ingen passord står i denne rapporten, i koden eller i en innsjekket `.dev.vars`. Under kontrollen brukte jeg tilfeldige lokale testverdier i en `.dev.vars` som er slettet igjen
(filen står i `.gitignore`). Det ekte demopassordet har jeg ikke sett eller brukt.

## 0. Kort

- Bestillingen bygger på at passordet og demobrukerne er borte. **Det stemmer ikke for koden på `main`.** Samme bestilling ble levert 11.10 (PR #44, `c9ff6c4`, rapporten som lå i denne filen). Passordet foran
  `/apptest` har ligget i Workeren hele tiden, og demobrukerne kom tilbake i #44.
- Siden da har `main` fått to endringer som gjør at deler av bestillingen ikke lenger stemmer med siden: K-172 (11.10, `7b7e43e`) skrev `/apptest` om etter Claude Design «apptest v3», der demobruker og
  passord står i hvert rollekort, og delen «Prøv med demobrukerne» og passordsidens tekster forsvant. K-229 (14.10) la `/kunde/apptest` bak Cloudflare Access.
- Jeg har derfor ikke gjort bestillingen om fra bunnen, men lagt inn det som manglet mot den: delen «Prøv med demobrukerne» og passordsidens tekster. Resten var på plass og er bekreftet (punkt 4).
- Jeg kan ikke se hvorfor hengsel.no/apptest viste siden uten passord. Det er listet som åpne punkter under (punkt 1). Sandkassen når ikke hengsel.no.

## 1. Hva fjernet passordet?

`git log -p` for `sites/hengsel` (`wrangler.jsonc`, `worker/apptest.ts`, `worker/index.ts`, `src/pages/apptest.astro`) siden 09.10:

| Når | Commit | Hva | Effekt på passord / demobrukere |
|---|---|---|---|
| 10.10 | PR #9 `4f36a73` | «ny testside … statisk og uten passord»: slettet Worker, passordside og PDF | Passord **og** demobrukere borte |
| 10.10 | PR #9 `407f115` | «passordet tilbake som før» | Passordet tilbake. Demobrukerne ikke. |
| 11.10 | `c9ff6c4` (#44) | Første levering av denne bestillingen: `DEMO_PASSORD`, delen «Prøv med demobrukerne», passordside, PDF, vakttest | Demobrukerne tilbake |
| 11.10 | `7b7e43e` K-172 | `/apptest` etter «apptest v3»: demobruker og passord i rollekortene | Egen demodel og passordsidens gamle tekster borte. Workeren uendret |
| 11.10 | `ebc30fe` K-160 | `worker/index.ts` blir `main`, `/api/demo` kommer til; `/apptest*` går til `worker/apptest.ts` | Ingen endring i passordet |
| 14.10 | `f4fabbf` K-229 | `/kunde/*` bak Access. `/apptest` beholder passordet; variabelen `APPTEST_VIDERE=1` (dashbordet) sender `/apptest*` med 301 til `/kunde/apptest` | Se under |

Funn:

- **Ingen commit etter 11.10 fjerner passordet foran `/apptest`.** `wrangler.jsonc` har hele tiden hatt `run_worker_first: ["/apptest", "/apptest/*", …]`, og `worker/apptest.ts` er uendret i passordlogikken
  (kontrollert med curl mot `wrangler dev`, punkt 4).
- K-229 er den eneste endringen som kan gi en annen oppførsel i produksjon: står `APPTEST_VIDERE` på «1» i Workerens variabler, får `/apptest` en 301 til `/kunde/apptest` (Access, e-postkode) i stedet for
  passordsiden. Er Access-policyen der satt til «Bypass» eller «Allow everyone», åpnes siden uten passord. Jeg kan ikke lese variablene eller Access-policyen herfra.
- Andre mulige forklaringer, slik de stod i forrige rapport, og som jeg fortsatt ikke kan utelukke fra repoet:
  1. Nettleseren har en gyldig informasjonskapsel (`hengsel_apptest`, 30 dager, `Path=/apptest`). Test med `curl -sI https://hengsel.no/apptest` eller et privat vindu.
  2. Utrullingen bruker ikke `-c sites/hengsel/wrangler.jsonc` i både Deploy command og Non-production branch deploy command; da gjelder ikke `run_worker_first`.
  3. Mangler `APPTEST_PASSORD` eller `APPTEST_NOKKEL`, blir siden **låst** (503), ikke åpen (kontrollert, punkt 4).
- Åpent, må sjekkes i dashbordet: (a) står `APPTEST_VIDERE` på «1»? (b) hva er Access-policyen for `/kunde*`? (c) ligger `DEMO_PASSORD` på Workeren `hengsel`? Mangler den, står
  «Passordet får du av den som inviterte deg.» på siden og ingenting går i stykker.

## 2. Commits og endrede filer

- `d4ef65b` hengsel.no/apptest: «Prøv med demobrukerne» tilbake, passordsiden med bestillingens tekst
- (denne rapporten, egen commit etterpå)

Endringene i `d4ef65b`:

- `sites/hengsel/src/pages/apptest.astro`: ny del `#demobrukere` **etter de tre installeringskortene og før «Velg rollen din»**: forklaringen, demopassordet i egen flate med «Kopier»,
  merknaden om `@demo.invalid`, listene «I appen» (velg «Demo») og «I CRM-et» (nettleseren) og knappen «Last ned oversikten (PDF)» → `/apptest/Logg_inn_i_demoen.pdf`
  (`/kunde/sigdal/…` i Sigdal-utgaven, som for PDF-lenken i rollekortene). Stil med de eksisterende variablene; ingen farger i sidene.
- `sites/hengsel/src/apptest-innhold.ts`: `DEMO_APP` og `DEMO_CRM` (listene fra K-114). Passordet står ikke her.
- `sites/hengsel/worker/apptest.ts`: `medDemopassord()` setter passordet også inn i `[data-demopassord-verdi]`. Merkene `data-demopassord`, `data-demopassord-verdi`, `data-demopassord-knapp` og
  `data-uten-demopassord` er alle i bruk. Ellers uendret.
- `sites/hengsel/src/pages/apptest/passord.astro`: «Skriv passordet du fikk sammen med lenken.» og «Feil passord. Prøv igjen, eller spør Eirik.».
- `scripts/apptest-passord.test.mjs`: tekstene, `data-demopassord-verdi`, og en ny test for plasseringen av demodelen (etter kortene, før rollene), PDF, begge listene og at koden bare har prikker.
- `scripts/skjermbilder-apptest.mjs`: ny feiltekst, og kontrollen teller nå fem steder med demopassord (fire roller + den nye delen).
- `docs/skjermbilder/apptest-*.png`: nye bilder (punkt 4).

## 3. Valg

- **Delen ligger i tillegg til demobrukerne i rollekortene.** Rollekortene (K-172) viser én demobruker og passordet per rolle; den gamle delen viste alle brukere, i appen og i CRM-et, og PDF-en. Bestillingen ber om delen,
  så den er tilbake, men det er nå to steder som viser passordet. Vil Eirik ha bare ett, er rollekortene det som kan strykes (eller omvendt). Det er ikke noe jeg avgjør her.
- **Ett felles passordfelt i delen**, med både `data-demopassord` og `data-demopassord-verdi` på samme element, så Workeren setter det inn én gang. Uten hemmelighet står «••••••••»,
  Kopier er skjult og «Passordet får du av den som inviterte deg.» vises.
- **`@demo.invalid`-merknaden står igjen.** Brukernavn-innlogging («montor1» → `montor1@demo.invalid`) finnes i appkoden i SNgroup-Drift/hengsel-crm (`montorapp/src/bibliotek/…`, brukt i
  `innlogging.tsx`), men jeg finner den ikke i historikken før 12.10 (kan være eldre under et gammelt filnavn), og 1.7.0 står med dato 10.10 mens kildekoden står på 1.9.0. Jeg kan derfor ikke slå fast at 1.7.0 klarer seg med bare «montor1». Fjern merknaden
  (og setningen i PDF-en) når testlenkene peker på en versjon som har den.
- **Passordsiden:** «Har du ikke fått passord? Skriv til hei@hengsel.no.» står igjen under knappen. Bestillingen nevner den ikke, men den fantes i v3-designet og er nyttig for testere uten passord.
- **Ingen Basic Auth.** POST til `/apptest`, informasjonskapsel med HMAC som i K-107 (`HttpOnly; Secure; SameSite=Lax; Path=/apptest; Max-Age=2592000`). Signaturnøkkelen avhenger av både
  `APPTEST_NOKKEL` og `APPTEST_PASSORD`, så nytt passord gjør gamle kapsler ugyldige. Passordet sammenlignes i konstant tid (`timingSafeEqual` på SHA-256).
- **Mørk modus:** Hengsel-sidene er bare lyse (`hengsel-regler.md`). «Mørk» er derfor en nettleser med `prefers-color-scheme: dark` og gir samme bilde som «lys».
- Skjermbildene viser en tilfeldig testverdi i passordflaten, ikke det ekte passordet. Bilder fra `bilder.hengsel.no` nås ikke fra sandkassen, så telefonbildene i rollekortene mangler i skjermbildene
  (rammen står tom). Det gjelder ikke selve delen med demobrukerne.

## 4. Kontroll

- `npm run build`: grønn. `npm test`: 205 tester, 204 grønne, 0 feil, 1 hoppet over (ikke undersøkt), pluss lenkesjekken (771 forespørsler, 0 feil).
- `scripts/skjermbilder-apptest.mjs` med axe-core (WCAG 2 A/AA): **0 brudd** på passordsiden, passordsiden med feil og `/apptest` etter innlogging, i 390 og 1440, lys og mørk (12 av 12 grønne).
  Demopassordet står på alle fem stedene, Kopier legger det på utklippstavlen, PDF-en er tilgjengelig etter innlogging, ingen vannrett rulling (360 og 390), én informasjonskapsel med riktige flagg.
  Eneste røde punkt: «ingen konsollfeil», fordi sandkassen ikke når `bilder.hengsel.no` (`ERR_TUNNEL_CONNECTION_FAILED`). Ingen CSP-feil.
- `wrangler dev -c sites/hengsel/wrangler.jsonc` med lokal `.dev.vars` (tilfeldige testverdier). Statuskoder og hoder, verdier utelatt:

```
(a) APPTEST_PASSORD, APPTEST_NOKKEL og DEMO_PASSORD satt
GET  /apptest (uten kapsel)           200  Cache-Control: private, no-store | X-Robots-Tag: noindex, nofollow
                                           CSP: default-src 'self'; script-src 'self'; style-src 'self' 'sha256-…' 'sha256-…'; img-src …; form-action 'self'; frame-ancestors 'none'
                                           body: «Skriv passordet du fikk sammen med lenken.»; demopassordet står ikke i svaret (0 treff)
POST /apptest passord=feil            401  noindex, nofollow | no-store | body: «Feil passord. Prøv igjen, eller spør Eirik.»
POST /apptest riktig passord          303  Location: /apptest | Set-Cookie: hengsel_apptest=<verdi>; Max-Age=2592000; Path=/apptest; HttpOnly; Secure; SameSite=Lax
                                           Content-Security-Policy: default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none' | noindex, nofollow | no-store
GET  /apptest (med kapsel)            200  noindex, nofollow | no-store | samme CSP | «Prøv med demobrukerne» og «Last ned oversikten (PDF)» på siden
                                           demopassordet satt inn 5 ganger (4 rollekort + den nye delen), data-uten-demopassord fjernet (0 igjen)
GET  /apptest/Logg_inn_i_demoen.pdf   uten kapsel 401, med kapsel 200 application/pdf
GET  /   200    GET /personvern   200    GET /finnes-ikke   404 (uendret)    demopassordet står ikke i forsiden (0 treff)

(b) uten hemmeligheter (.dev.vars borte)
GET  /apptest 503   GET /apptest/passord 503   GET /apptest/Logg_inn_i_demoen.pdf 503   POST /apptest 503
                    alle med noindex, nofollow og no-store; body «Siden er låst. Passordet er ikke satt opp ennå.»
GET  /   200    GET /personvern   200    (uendret)
```

  (Kontrollen av «uten DEMO_PASSORD alene» ligger i vakttesten og i forrige rapport: siden står da med «Passordet får du av den som inviterte deg.».)

Skjermbilder i `docs/skjermbilder/`, 390 (`mobil`) og 1440 (`desktop`), lys og mørk:

- `apptest-passord-{mobil,desktop}-{lys,mork}.png`: passordsiden
- `apptest-passord-feil-mobil-{lys,mork}.png`: etter feil passord
- `apptest-{mobil,desktop}-{lys,mork}.png`: siden etter innlogging, rullet til «Prøv med demobrukerne»

## 5. Før main

1. Sjekk i Cloudflare-dashbordet for Workeren `hengsel`: `APPTEST_VIDERE` (skal ikke stå på «1» hvis `/apptest` fortsatt skal ha passordet), Access-policyen for `/kunde*`, og at `DEMO_PASSORD` er satt.
2. Etter utrulling: `curl -sI https://hengsel.no/apptest` uten informasjonskapsel skal gi `200` med passordsiden (ikke «Test Hengsel Ute», ikke 503, ikke 301).
   Gir den selve siden, sjekk at både Deploy command og Non-production branch deploy command har `-c sites/hengsel/wrangler.jsonc`.
3. HawkScan-skanning er ikke kjørt: `HAWK_API_KEY` er ikke satt i denne økten.

KLAR FOR MAIN
