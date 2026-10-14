# K-226 · hengsel.no/hjelp: brukerveiledningen bak innlogging (14.10.2026)

Sak S-61. Gren `claude/k226-hjelp` (fra `main`, commit e6489c5 med kildeteksten). PR mot `main`; Eirik fletter selv.

## Hva som er gjort

1. **/hjelp som Astro-side** (`sites/hengsel/src/pages/hjelp.astro`): én side med rollevelger øverst (sju ankere: Kom i gang, Selger, Prosjektleder, Montasjeleder,
   Leder og admin, Montør (Ute), Kunde (Min side)). Velgeren står fast øverst og virker uten skript. Bare Hengsel-tokens (furu v2, Schibsted Grotesk), ingen hex,
   bare lys modus. Egen enkel topp (logo og «Brukerveiledning»), ikke hovedmenyen.
2. **Én datafil** (`sites/hengsel/src/data/hjelp.ts`): all tekst ligger her. Hver oppgave har `kapittel`, `rolle`, `tittel`, `menyvei`, `tekst`/`steg`, `tips` og
   `skjermbilde`; rollene har ingress og menygrupper. Testen `scripts/hjelp.test.mjs` sammenlikner datafila med kildeteksten (alle 28 oppgavetitler, alle 35 steg ordrett, 7 skjermbilder).
3. **Plassholdere**: «Skjermbilde kommer» (med navnet på bildet under). Når bildet finnes, legges stien i `fil` på `skjermbilde` (under `public/img/hjelp/`), og siden viser bildet.
4. **Copyright** nederst (`components/Hjelpebunn.astro`, teksten ordrett fra oppdraget, i `hjelp.ts`). Siden bruker ikke den vanlige bunnen, så linjen er helt nederst.
5. **Innlogging** (`sites/hengsel/worker/access.ts` og `hjelp.ts`): `/hjelp`, `/hjelp/*` og `/hjelp.html` går gjennom Workeren (`run_worker_first`).
   - Uten `Cf-Access-Jwt-Assertion`: **403**. Ugyldig token (signatur, utsteder, Access-app, utløp, nbf, e-post, `alg: none`): 403.
   - Gyldig token: siden. Annen metode enn GET/HEAD: 405. Mangler `ACCESS_TEAM_DOMAIN`/`ACCESS_AUD` i Cloudflare: 503 (403 hvis tokenet mangler).
   - Alle svar: `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store`. I tillegg `noindex,nofollow` i siden og i `_headers`.
   - Ikke i `sitemap.txt` eller `robots.txt`, ikke i menyen eller bunnen. `scripts/sjekk-lenker.mjs` feiler hvis en åpen side lenker til /hjelp eller sitemap nevner den.
   - Hvem som slipper inn avgjøres av policyen i Access-appen (adressene Eirik inviterer), ikke av en liste i repoet.
6. **K-223** er ikke flettet (se under).

Andre endringer: `Side.astro` fikk valget `utenBunn`; `wrangler.jsonc` fikk de tre /hjelp-stiene i `run_worker_first` og `keep_vars: true` (så ACCESS-variablene satt i dashbordet ikke overskrives av utrulling);
`apptest-passord.test.mjs` forventer den nye stilisten; `docs/hosting.md` har en ny del «hengsel.no/hjelp».

## Slik utvider Eirik Access (gjøres i Cloudflare, ikke i repoet)

Zero Trust → Access → Applications.

- **Alternativ A (én app for begge):** utvid Access-appen fra K-223 med nok en destinasjon, `hengsel.no` med sti `hjelp*`. Da gjelder samme policy som for /sigdal
  (samme invitert-liste). Ulempen: alle som er invitert til /sigdal, får også veiledningen, og kunder som bare skal se veiledningen, kan ikke ligge i den appen.
- **Alternativ B (egen app for /hjelp):** lag en ny Self-hosted-app med destinasjon `hengsel.no/hjelp*`, innloggingsmetode «One-time PIN» (e-postkode) og en policy som slipper inn e-postadressene
  Eirik inviterer (Allow → Emails). Da kan de som skal se veiledningen og de som skal se /sigdal holdes adskilt.
- **Variabler på Workeren `hengsel`** (Settings → Variables and Secrets, ikke hemmeligheter, ikke i repoet): `ACCESS_TEAM_DOMAIN` = `<team>.cloudflareaccess.com` og `ACCESS_AUD` =
  AUD-taggen til Access-appen. Har /sigdal og /hjelp hver sin app, skriv begge taggene i `ACCESS_AUD`, skilt med komma.
- Uten disse variablene svarer /hjelp 403 (ingen token) eller 503 (token uten oppsett), og ingenting vises. Access foran Workeren er det som slipper folk inn; Workeren er andre lås.
- Sjekk etter utrulling: `curl -sI https://hengsel.no/hjelp` skal sendes til Access-innloggingen (eller gi 403 hvis Access ikke dekker stien ennå), aldri 200.

## K-223 og rekkefølgen

K-223 (/sigdal) finnes ikke i repoet: ingen gren, commit eller kode for /sigdal på `main` eller i noen gren. Jeg har derfor ikke kunnet se hvordan K-223 sjekker Access.
Sjekken er laget som en egen, delt modul (`worker/access.ts`, funksjonen `vakt(req, env)`), slik at /sigdal kan bruke den uten å kopiere kode. Den er en TypeScript-versjon av sjekken i
`sites/admin/worker/access.js` (K-184), med de samme kontrollene.

- Ingen av PR-ene trenger den andre for å virke. **Flett K-223 først hvis den allerede har en egen Access-sjekk**; da bør den flyttes over til `worker/access.ts` i en liten oppfølging.
  Flettes K-226 først, kan K-223 importere `vakt` fra `worker/access.ts`.
- Forvent en liten konflikt i `wrangler.jsonc` (`run_worker_first`), `worker/index.ts` (rutingen) og `docs/hosting.md` hos den som fletter sist. Den løses ved å beholde begge.

## Antakelser og ting Eirik bør vite

- **K-225 er ikke tilgjengelig her.** Datafila følger feltene i oppdraget (kapittel, rolle, tittel, menyvei, steg, skjermbilde). Er CRM-ets navn eller typer annerledes, endres bare `hjelp.ts`.
- **Innholdet er kildeteksten, med tre små endringer:** «(K-222)» (internt saksnummer) er tatt ut av bunnteksten, linja «Skrift på siden: Schibsted Grotesk (Hengsel)» er fjernet (designnotat), og «Skjermbilde: Min dag» er blitt «Skjermbilde kommer».
  Merknaden om «Prosjektleder og tilvalg i Sigdal CRM» er fjernet fra hjelpeteksten (K-226, etter K-223-flettingen).
- Bare lys modus (reglene for Hengsel-sidene). Kildeutkastet hadde mørk modus og Google Fonts; begge er tatt bort.
- Ingen HawkScan-skanning er kjørt (ingen API-nøkkel i miljøet).

## Sjekker

- `npm run build`: grønn. `npm test`: 116 grønne, 1 hoppet over (den var hoppet over før også), 0 røde. Nye tester: `scripts/hjelp.test.mjs` (Access-sjekken med genererte nøkler: 403 uten token, 11 ugyldige tokens, 503, 405, flere AUD; ruting; ingen omgåelse i Worker-koden; datafila mot kilden; den bygde siden).
- Lenkesjekken er grønn: hengsel 52 interne adresser svarer 200 (inkludert `/hjelp`), og siden har `noindex,nofollow`, er ikke i sitemap og lenkes ikke fra andre sider.
- Ekte Worker-kjøring med `wrangler dev` (workerd): `/hjelp`, `/hjelp/`, `/hjelp/x`, `/hjelp.html` uten token gir 403 med noindex og no-store, `/personvern` gir 200; en tokenlignende tekst `a.b.c` gir 403.
- Skjermbilder i `claude/k226-skjermbilder/` (webp): `hjelp-390` og `hjelp-1280` (hele siden), `-skjerm` (første skjerm med rollevelgeren), og 390 med maskinen i mørk modus (siden er fortsatt lys). `sjekker.json`: ingen sideveis rulling på 390 px,
  Schibsted Grotesk lastet, `color-scheme: light`, rollevelgeren fester seg, ankeret til Montør lander i vinduet, ingen konsollfeil, 7 plassholdere og copyright finnes.
  Access-sjekken er omgått bare i skjermbildeskriptet (`scripts/skjermbilder-k226.mjs` henter fra `dist` med den statiske testserveren); Worker-koden har ingen omgåelse, og testen passer på det.
- Workers Builds på PR-en: se PR-en (status legges til under når den er kjørt).

## Gjenstår

- Eirik: Access-app/-sti og de to variablene over, så invitere kundene.
- Skjermbildene fra demo.hengsel.no når den nye menyen (K-222) er i demo.

**K-226 KLAR**
