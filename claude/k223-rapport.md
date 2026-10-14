# K-223 · hengsel.no/sigdal: egen Sigdal-portal (14.10.2026)

Gren `claude/k223-sigdal-portal` (fra `origin/main`), PR mot `main`, sak S-61. Ikke flettet: Eirik fletter selv. Ingen nøkler eller passord i repoet. Cloudflare Access er ikke satt opp (det gjør Eirik, se under): **ikke fletting til main før Access står foran `/sigdal*`**, ellers svarer Worker-en 403 (det er meningen), men sjekk det i forhåndsvisningen først.

## Hva som er laget
- **Sigdal-temaet** som eget sett: `packages/kundetema-sigdal/` (`tokens.css`, `profil.json`, `tilkunde.mjs`, `fonter.mjs`). Åtte farger (Warm Black, Off White, Beige 4–1, Deep Blue, Dusty Blue), aldri #FFFFFF, ingen rosa/magenta, bare lys modus. Newsreader (overskrifter, vekt 500, ikke små størrelser) og Inter (tekst, knapper, underoverskrifter i 650), selvhostet fra npm. Primærknapp i Warm Black; Deep Blue brukes sparsomt (lenker, fokus, valgt).
- **Sidene**: `/sigdal` (forside), `/crm`, `/ute`, `/kundeportal`, `/integrasjoner`, `/slik-virker-det`, `/dokumenter`, `/apptest` (innholdet, uten eget passord) under `/sigdal/`. Ikke `/priser-og-demo`, ikke design. og admin. Ingen sider er kopiert: `src/pages/sigdal/*.astro` er én-linjes wrappere, og `Side.astro` bytter tema, meny, bunn, tekst og bilder når stien ligger under `/sigdal` (`src/kunde.ts`). Hengsel-sidene er uendret (testet: ingen `data-kunde`, ingen Sigdal-skrift eller -farger).
- **Visningsrommet**: hele vis-listen (28 sider, de samme rommene som K-212 rørte) ligger under `/sigdal/vis/`.
- **Worker** (`worker/sigdal.ts`): uten `Cf-Access-Jwt-Assertion` gir alle stier under `/sigdal` 403; alle svar (også 403) har `X-Robots-Tag: noindex, nofollow` og `Cache-Control: private, no-store`. Ikke i sitemap, ikke i Hengsels meny. Innloggede får demopassordet satt inn på `/sigdal/apptest` som på `/apptest`.
- **Tester** (`npm test`, 117 grønne): `scripts/kundetema.test.mjs` (palett, hver Hengsel-farge-rolle er byttet ut, /sigdal bare Sigdal-farger og Hengsel-sidene bare Hengsel-farger i en ekte nettleser, ingen lekkasje av logo/lenker/skjermbilder, tekstserstatningene treffer), `scripts/sigdal-worker.test.mjs` (mot ekte `wrangler dev`: 403, noindex, no-store, testmodus bare på localhost), `hengsel-regler.test.mjs` utvidet (Sigdal-hex bare under `/sigdal`), `sjekk-lenker` utvidet (noindex og sitemap for /sigdal).

## Valget for vis-rommene
Valgt: **bygge Visningsrommet i Sigdal-utgave inn i `hengsel.no/sigdal/vis/`** av `scripts/bygg-sigdal-vis.mjs`, som kjører det vanlige vis-bygget til en midlertidig mappe og gjør det om (tema, logo, stier, plassholdere, tekst). Ingen rom er kopiert, så en endring i et rom kommer med i begge utgavene ved neste bygg. Alternativet (egen utgave i `sites/vis`) ville gitt en tredje kopi av stier og bilder, og ville lagt Sigdal-brukere bak den eksisterende Access-appen «Visningsrommet», med innsyn i hele Hengsel-utgaven. Med valget dekker én Access-app (`/sigdal*`) alt. Pris: vis-rommene har inline stil, så `/sigdal/vis/*` får vis' egen CSP fra Worker-en (testet).

## Steg for Eirik: Cloudflare Access foran hengsel.no/sigdal
1. Cloudflare Zero Trust › **Access › Applications › Add an application › Self-hosted**.
2. Application name: «Sigdal-portalen». Session duration etter ønske (f.eks. 24 timer).
3. **Public hostname**: domain `hengsel.no`, path `sigdal*` (dekker `/sigdal` og `/sigdal/*`). Legg ikke til `www`.
4. **Identity providers**: slå på **One-time PIN** (e-postkode).
5. **Policy**: navn «Sigdal», action **Allow**, Include › **Emails ending in**: `@studiosigdal-innlandet.no` og `@sngroup.no`; legg til enkeltadresser med Include › **Emails** ved behov.
6. Lagre. Test i et privat vindu: `https://hengsel.no/sigdal` skal be om e-post og kode; uten innlogging skal ingenting av innholdet komme.
7. Sjekk at `https://hengsel.no/` og `/crm` fortsatt er åpne.
8. Valgfritt (anbefalt senere): sett `AUD` og team-domene som variabler og la Worker-en verifisere JWT-signaturen. Nå sjekkes bare at headeren finnes (så siden aldri er åpen hvis Access mangler); en som omgår Access og setter headeren selv, slipper inn. Access foran sonen er selve beskyttelsen.
9. Legg `sites/vis/*` til i Build watch paths for Workeren `hengsel` (docs/hosting.md), siden `/sigdal/vis/` bygges fra vis-kildene.
10. `DEMO_PASSORD` (hemmelighet i Workeren) vises på `/sigdal/apptest` for alle som kommer gjennom Access. Fjern den hemmeligheten eller begrens policyen hvis det ikke er ønsket.

## Åpne punkter og avvik
- **Sigdal-logoen** er lagt inn av en annen økt (commit `f3b566c`, transparent PNG i Warm Black og Off White, `sites/hengsel/public/sigdal/logo/`). Menyen, bunnen og vis-rommene bruker Warm Black-utgaven med «levert av Hengsel» som tekst under. En SVG som `sigdal-logo.svg` i samme mappe går foran PNG-en (SVG-en kan ha Sigdal-hex, testen godtar det). Hengsel Levering-logoen er ikke brukt fordi den har Hengsel-grønt.
- **Ingen rød eller grønn i profilen.** Statustonene, advarsel og feil er tegnet med Beige, Warm Black og blå toner (feil: Warm Black på Beige 2 med mørk ramme). Be Design avgjøre om feil/advarsel trenger egen farge.
- **Aksenten** `--accent` (tekst og fyll) er Deep Blue mørknet 20 % med Warm Black, fordi ren Deep Blue har 4,28:1 mot Beige 4 (under 4,5:1). Ren Deep Blue brukes som `--aksent`.
- **Produktnavn:** «Hengsel CRM» → «Sigdal CRM». «Hengsel Ute» og «levert av Hengsel» beholdes (appen heter Hengsel Ute i butikkene). Demo-CTA-er («Be om demo») er byttet til «Ta kontakt» (mailto hei@hengsel.no), og «Priser og demo»-kortet er omskrevet. Tekstene står i `packages/kundetema-sigdal/profil.json`.
- Økt kontrast (`prefers-contrast: more`) og Display P3 er ikke laget for Sigdal-temaet.
- Appikon-motion på `/sigdal/ute` er Hengsel Ute-ikonet (produktfil, ikke skjermbilde); Apples enhetsrammer er beholdt.
- Meldingen på 404 under `/sigdal/` er Hengsels 404-side.

## Plassholdere (190 filer, «Skjermbilde kommer» i Sigdal-stil, samme filnavn og mål)
Fullstendig liste: `claude/k223-plassholdere.md` (laget av `node scripts/lag-sigdal-plassholdere.mjs`). Design leverer Sigdal-utgavene med samme filnavn og legger dem over filene:
- `sites/hengsel/public/sigdal/img/app/`: avvik-lys, ferdig-lys, idag-lys, ipad-bildeverktoy-laser, ipad-idag-lys, jobben-lys, ks-lys, punkter-lys, uten-nett-lys (.webp)
- `sites/hengsel/public/sigdal/img/apptest/`: foresporsler-lys, mottak-lys, ruten-lys (hver også @1x)
- `sites/hengsel/public/sigdal/img/dok-forside.webp`
- `sites/hengsel/public/sigdal/img/vis/`: hero, hero-enkel, rom-* (24), flate-* (4), forsta-* (2)
- `sites/hengsel/public/sigdal/img/vis/skjermbilder/`: alle `crm-*`, `ute-*`, `kundeportal-*`, `portal-*`, `dok-d*` m.fl. (2× og @1x; bare lys)
Kjør aldri skriptet med `--alle` etter at ekte bilder er lagt inn.

## Kontroll
- `npm run build`: grønn. `npm test`: 118 tester, 117 grønne, 0 røde, 1 hoppet over av testen selv (som før). Lenkesjekken grønn (834 forespørsler, 0 feil; inkl. alle /sigdal-sider, vis-rommene og plassholderne).
- Skjermbilder 390 og 1280 px med lokal omgåelse av Access-sjekken (`SIGDAL_TESTMODUS=1`, bare localhost): `claude/k223-skjermbilder/` (`sigdal-forside`, `sigdal-crm`, `sigdal-vis-crm`, og i tillegg ute, kundeportal, dokumenter, apptest). Sjekket: Off White-bakgrunn, Warm Black-tekst, Newsreader og Inter lastet, ingen vannrett rulling, ingen konsollfeil eller 4xx. Lag på nytt: `npm run skjermbilder:sigdal`.
- Workers Builds: se PR-en (status sjekket etter push).

## Oppdatering etter fletting med K-226 (14.10.2026)
- Access-sjekken for `/sigdal` er nå den delte modulen `worker/access.ts` (signaturkontroll mot `ACCESS_TEAM_DOMAIN` og `ACCESS_AUD`, samme som `/hjelp`). Den enkle header-sjekken og `SIGDAL_TESTMODUS` er fjernet. Mangler variablene, gir både `/sigdal` og `/hjelp` 403. Skjermbildene tas nå fra de statiske filene uten Worker.
