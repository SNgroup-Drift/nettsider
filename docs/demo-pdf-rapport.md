# Hengsel: ny PDF «Logg inn i demoen» med Hengsel-merket

Gren: `claude/demo-pdf-hengsel` (fra `main` f041603). Bare `sites/hengsel` er endret, i tillegg til denne rapporten. Ikke pushet til `main`, ikke deployet
(ingen `wrangler deploy`, ingen versions upload). Ingen passord står i rapporten eller i repoet; testverdiene i den lokale kontrollen ble gitt som `--var`
til `wrangler dev` og er ikke lagret.

## 1. Fila er byttet

| | Før (Sigdal-malen) | Nå (Hengsel) |
|---|---|---|
| Fil | `sites/hengsel/public/apptest/Logg_inn_i_demoen.pdf` | samme sti og filnavn |
| Sider | 3 | 2 |
| Gjelder fra | 08.10.2026 | 16.10.2026 |
| Merke | sigdal-logo, bunntekst «Studio Sigdal Innlandet» | Hengsel-logo, bunntekst «Logg inn i demoen · Hengsel» |
| Passord | fyllbart skjemafelt «Demopassord» (tomt) | ingen felt, ingen passord; «Du får det av den som inviterte deg» |
| «Sigdal» | 5 treff i teksten, i tillegg `sigdal-crm-demo…workers.dev` | 0 treff, verken i teksten eller i noen PDF-objekter (alle strømmer dekomprimert og søkt) |
| Størrelse / sha256 | 513 757 byte / `de0e65c5…` | 229 254 byte / `31f1eb19…` |

Innholdet er det som er beskrevet: «Slik logger du inn», brukere i CRM-et, brukere i Hengsel Ute og «Godt å vite». Fila har ingen lenker
(annotasjoner), ingen JavaScript og ingen skjemafelt.

Merk: PDF-metadataene har tittelen `demo.html` (fra Chrome, som laget fila). Nettleserfanen viser det når PDF-en åpnes. Det er ufarlig, men kan rettes
i kilden neste gang fila lages.

Filnavnet og stien er uendret, så lenkene «Alle demobrukere (PDF)» virker som før. I bygget (`dist`) peker de slik:

- `/apptest` og `/kunde/apptest` → `/apptest/Logg_inn_i_demoen.pdf`
- `/kunde/sigdal/apptest` → `/kunde/sigdal/apptest/Logg_inn_i_demoen.pdf`

`scripts/bygg-sigdal-vis.mjs` kopierer fila ved bygging til `dist/kunde/apptest/` og `dist/kunde/sigdal/apptest/`. Alle tre kopiene i `dist` har den nye
sha256-en (kontrollert etter `npm run build`). **Sigdal-kundens egen utgave (`/kunde/sigdal/apptest`) får dermed også Hengsel-PDF-en.** Skal Sigdal
ha en egen utgave, må det legges inn en egen fil i byggeskriptet.

## 2. Passord og Cache-Control

Kontrollert mot den bygde siden med `npx wrangler dev -c sites/hengsel/wrangler.jsonc` lokalt (tilfeldige testverdier for `APPTEST_PASSORD` og `APPTEST_NOKKEL`):

| Forespørsel | Svar |
|---|---|
| `GET /apptest/Logg_inn_i_demoen.pdf` uten informasjonskapsel | **401**, passordsiden (HTML), `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow` |
| `POST /apptest` med feil passord | 401 |
| `POST /apptest` med riktig passord | 303 til `/apptest`, `hengsel_apptest` (HttpOnly, Secure, SameSite=Lax, Path=/apptest) |
| `GET /apptest/Logg_inn_i_demoen.pdf` med informasjonskapsel | **200** `application/pdf`, `Cache-Control: private, no-store`, `Vary: Cookie`, ingen ETag, 2 sider, ny sha256 |
| `HEAD` samme, med informasjonskapsel | 200, `Cache-Control: private, no-store` |
| `GET /kunde/apptest/Logg_inn_i_demoen.pdf` uten Access-token | 403, `Cache-Control: private, no-store` |
| `GET /kunde/sigdal/apptest/Logg_inn_i_demoen.pdf` uten Access-token | 403, `Cache-Control: private, no-store` |

PDF-en ligger altså bak passordet (`run_worker_first: ["/apptest", "/apptest/*", …]` i `wrangler.jsonc`, `worker/apptest.ts`), og `merk()` setter
`Cache-Control: private, no-store` på alle svar under `/apptest`, som for resten av `/apptest`. Kopiene under `/kunde` ligger bak Cloudflare Access
(`worker/kunde.ts`), med samme hode. Ingen kodeendring var nødvendig.

Det som fantes fra før, og som ikke er endret her: `/kunde/apptest` lenker til `/apptest/Logg_inn_i_demoen.pdf`, ikke til kopien under `/kunde/apptest/`.
En som er logget inn med Access, men ikke har apptest-kapselen, får derfor passordsiden når hen trykker på lenken (eller 301 til `/kunde/apptest/…` når
`APPTEST_VIDERE=1`). Bør rettes i `src/pages/apptest.astro` hvis `/kunde/apptest` skal brukes alene.

## 3. Andre PDF-er og bilder med «Sigdal» i Hengsel-sidene

Søkt i `sites/hengsel` (utenom `node_modules` og `dist`) og i `packages/hengsel-tokens`: filnavn, tekst i PDF-er og SVG-er, og strenger i bildefilene.
De største bildene uten tekst er også sett på (`og-apptest.png`, `og-kunde.png`, `img/dok-forside.webp`, `media/ute-motion-1080x1080-plakat.png`).

| Fil | Hva | Vurdering |
|---|---|---|
| `public/apptest/Logg_inn_i_demoen.pdf` | Sigdal-malen | **Byttet i denne grenen** |
| `public/kunde/sigdal/logo/sigdal-logo.svg` | Sigdal-logoen | Tilhører kundens egen utgave `/kunde/sigdal` |
| `public/kunde/sigdal/logo/sigdal-logo-off-white.svg` | Sigdal-logoen, lys | Samme |
| `public/kunde/sigdal/logo/sigdal-crm-levert-av-hengsel-warm-black{,-2x,-3x}.png` | «Sigdal CRM levert av Hengsel» | Samme |
| `public/kunde/sigdal/logo/sigdal-crm-levert-av-hengsel-off-white{,-2x,-3x}.png` | Samme, lys | Samme |

Det er ingen andre PDF-er under `sites/hengsel`. De andre bildene (favikoner, `logo/hengsel-*.svg`, `og-*.png`, `ikon-ute-192.png`, `img/*.webp`, `media/*-plakat.png`)
har ikke Sigdal. App-skjermbildene ligger på bilder.hengsel.no og er ikke med i dette søket (K-233).

## 4. Bygg og test

- `npm ci` og `npm run build`: grønt.
- `npm test`: grønt, 204 tester: 203 bestått, 0 feilet, 1 hoppet over (`fristfarger …`, «TypeScript-import ikke tilgjengelig». Det skyldes Node-versjonen i sandkassen, ikke PDF-en).
  `sjekk-lenker`: 771 forespørsler, 0 feil.
- Under byggingen nådde ikke sandkassen `bilder.hengsel.no/…/manifest.json`, så kopien i repoet ble brukt (som vanlig i sandkassen).

## Endrede filer

- `sites/hengsel/public/apptest/Logg_inn_i_demoen.pdf` (byttet)
- `docs/demo-pdf-rapport.md` (ny)
