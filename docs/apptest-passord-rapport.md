# Hengsel apptest: passordet og demobrukerne tilbake (S-56), kontroll 16.10

Gren: `claude/apptest-passord-tilbake-aryuba` (fra `main` f041603). Ingen database. Ikke pushet til `main`, ikke deployet (ingen `wrangler deploy`, ingen versions upload).
Ingen passord står i denne rapporten, i koden eller i en innsjekket `.dev.vars`. Testverdiene var tilfeldige, lokale og står i en `.dev.vars` som er slettet igjen (filen er i `.gitignore`).

## Kort svar

**Denne bestillingen er allerede utført, og `main` har fortsatt alt den ber om.** Jeg har ikke endret kode. Eneste endring i grenen er denne rapporten og nye skjermbilder.
Bestillingen beskriver tilstanden før PR #44 (`c9ff6c4`, 11.10 13:49, «passordsiden i ny stil og demobrukerne tilbake»). Commit `07c82d6` finnes ikke i dette repoet.

## 1. Hva fjernet passordet?

`git log -p` for `sites/hengsel` (wrangler.jsonc, `worker/`, `src/pages/apptest.astro`) siden 09.10:

| Når | Hva | Effekt |
|---|---|---|
| 10.10 PR #9 (`4f36a73`) | Ny statisk testside «1.6.0, uten passord»: slettet Workeren, `passord.astro`, PDF-en og demodelen | Passord og demobrukere borte |
| 10.10 PR #9 (`407f115`) | Passordet tilbake (K-107-versjonen) | Passordet tilbake, **demobrukerne ikke** |
| 11.10 PR #44 (`c9ff6c4`) | `DEMO_PASSORD` i Workeren, «Prøv med demobrukerne», PDF, «Kopier», ny passordside med bestillingens tekster | Alt tilbake |
| 11.10 K-172 (`7b7e43e`) | `/apptest` v3 etter Claude Design: demobrukerne ligger nå per rolle (brukernavn + passord + «Kopier») under «Velg rollen din», PDF-lenke per rolle; passordsidens tekster fra fasiten | Erstatter delen «Prøv med demobrukerne» |
| 14.10 K-229 (`f4fabbf`) | `/kunde/apptest` bak Cloudflare Access (samme side, uten eget passord). `/apptest` beholder passordet; med `APPTEST_VIDERE=1` sendes den med 301 til `/kunde/apptest` | Ingen åpning av `/apptest` |

Ingen commit på `main` fjerner passordet etter 10.10. `wrangler.jsonc` har hele tiden `run_worker_first: ["/apptest", "/apptest/*", …]` (nå også `/api/demo`, `/kunde`, `/kunde/*`).
Hvis hengsel.no/apptest likevel vises åpen, ligger årsaken utenfor koden. Sandkassen når ikke hengsel.no (403 fra proxyen), så jeg har ikke selv sett det. Mulige årsaker:
1. Nettleseren har gyldig `hengsel_apptest`-kapsel (30 dager). Test i privat vindu / `curl -sI https://hengsel.no/apptest` (skal gi 200 med passordsiden).
2. Workers Builds bruker ikke `-c sites/hengsel/wrangler.jsonc` i både Deploy command og Non-production branch deploy command, så `run_worker_first` ikke gjelder.
3. En Worker-versjon fra en annen gren er utrullet (versions upload) og er aktiv.
4. `APPTEST_VIDERE=1` er satt: da gir `/apptest` 301 til `/kunde/apptest`, som krever Access (403 uten gyldig token), ikke åpen side.
Jeg kan ikke se Cloudflare-innstillingene herfra.

## 2. Commits og endrede filer

Kode: ingen endringer. Filer: `docs/apptest-passord-rapport.md` (denne), `docs/skjermbilder/apptest-*.png` (10 bilder, nytt utseende etter K-172/K-233).

## 3. Valg (og det jeg er usikker på)

- **Jeg bygde ikke om til K-114-oppsettet.** Punkt 1–3 i bestillingen er oppfylt på `main`: passord foran siden, 303/401/503, HMAC-kapsel, `data-demopassord`/`data-uten-demopassord`, PDF bak passordet, innholdet i versjon 1.7.0. Å legge tilbake den gamle delen «Prøv med demobrukerne» ville duplisert demopassordet og gått mot v3-designet og testene (`scripts/apptest-passord.test.mjs`).
- **Avvik fra bestillingens ordlyd** (bevisst beholdt fra v3, trenger Eiriks ja hvis de skal tilbake): passordsiden sier «Siden er for dem som er invitert til å teste appen. Skriv inn passordet du har fått.» og feilen «Feil passord. Sjekk e-posten eller SMS-en med invitasjonen og prøv igjen.» (bestillingen: «Skriv passordet du fikk sammen med lenken.» / «Feil passord. Prøv igjen, eller spør Eirik.»). PDF-lenken heter «Alle demobrukere (PDF)», ikke «Last ned oversikten (PDF)». Merkene `data-demopassord-verdi` finnes ikke lenger.
- **`@demo.invalid`:** brukernavnene står med `@demo.invalid` i `apptest-innhold.ts`. Jeg har ikke sjekket om brukernavn-innlogging virker i 1.7.0 denne gangen (appkoden er ikke i økta). Uendret.
- **`DEMO_PASSORD` i økta:** miljøet har en variabel `DEMO_PASSORD` satt. Jeg har ikke lest eller brukt verdien (lokal test brukte tilfeldige verdier; skjermbildeskriptet kjørt med `env -u DEMO_PASSORD`). Er det virkelige passordet, bør det ikke ligge i økt-miljøet.
- Siden er bare lys modus, så «mørk» er identisk med «lys» i skjermbildene.
- Skjermbildene viser en tilfeldig testverdi i demopassord-feltet. App-bilder fra bilder.hengsel.no lastes ikke i sandkassen, så de mangler i bildene (og gir 8 «konsollfeil» i skjermbildeskriptet; alt annet i skriptet er grønt).

## 4. Kontroll

`npm run build`: grønn. `node --test` på apptest-passord, kunde-worker og apptest-innhold: 19 av 19 grønne. `scripts/skjermbilder-apptest.mjs` med axe-core: 0 axe-brudd, 390 og 1440, ingen vannrett rulling, én kapsel (HttpOnly, Secure, SameSite=Lax, Path=/apptest), Kopier virker, demopassordet satt inn av Workeren; eneste røde er nettverksfeilene mot bilder.hengsel.no beskrevet over. (Fullt `npm test` kjørte jeg ikke; lenkesjekken trenger bilder.hengsel.no.)

`wrangler dev` lokalt (verdier utelatt):

```
(a) alle hemmeligheter
GET  /apptest uten kapsel        200  Cache-Control: private, no-store | X-Robots-Tag: noindex, nofollow | Vary: Cookie
                                      CSP: default-src 'self'; script-src 'self'; style-src 'self' 'sha256-…'; … form-action 'self'; frame-ancestors 'none'
                                      body: passordsiden, 0 treff på data-demopassord
POST /apptest feil passord       401  noindex + no-store | «Feil passord.» vises
POST /apptest riktig passord     303  Location: /apptest | Set-Cookie: hengsel_apptest=<verdi>; Max-Age=2592000; Path=/apptest; HttpOnly; Secure; SameSite=Lax
                                      CSP: default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'
GET  /apptest med kapsel         200  noindex + no-store | «Test Hengsel Ute», demopassordet satt inn
GET  /apptest/Logg_inn_i_demoen.pdf  uten kapsel 401, med kapsel 200 application/pdf
GET  /   200   GET /personvern 200   (0 treff på demopassordet i de statiske sidene)

(b) uten hemmeligheter
GET  /apptest 503   /apptest/passord 503   /apptest/Logg_inn_i_demoen.pdf 503   POST /apptest 503  «Siden er låst. Passordet er ikke satt opp ennå.»
     alle med noindex + no-store
GET  /   200   GET /personvern 200  (uendret)
```

Skjermbilder i `docs/skjermbilder/`: `apptest-passord-{mobil,desktop}-{lys,mork}.png`, `apptest-passord-feil-mobil-{lys,mork}.png`, `apptest-{mobil,desktop}-{lys,mork}.png` (mobil = 390, desktop = 1440).

## 5. Før main

- Ingenting i koden å flette. Sjekk deploy-oppsettet (punkt 2–4 i listen over) hvis /apptest fortsatt er åpen på hengsel.no, og kontroller at `DEMO_PASSORD` ligger som hemmelighet på Workeren `hengsel`.
- Merge av denne grenen gir bare rapport og nye skjermbilder.

INGEN KODEENDRING TRENGS. KLAR FOR MAIN (kun rapport og skjermbilder).
