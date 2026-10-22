# Hengsel-nettsiden etter nettsider-temaet

Gren: `claude/hengsel-nettside-astro-fzorjy`. Ingen nytt prosjekt: det er bygget videre i `sites/hengsel`.

## Bygg og deploy (kopiert fra sngroup, ingen nye Cloudflare-navn)
- `npm run build -w sites/hengsel` = `astro build` + `scripts/csp-hasher.mjs` + `scripts/bygg-sigdal-vis.mjs`.
- Worker `hengsel` (`sites/hengsel/wrangler.jsonc`): statiske filer fra `dist`, skript bare for `/apptest*`, `/api/demo` og `/kunde*`.
  Samme modell som `sites/sngroup`, som er helt statisk. Deploy: `npx wrangler deploy -c sites/hengsel/wrangler.jsonc`; grenbygg: `npx wrangler versions upload -c sites/hengsel/wrangler.jsonc` (docs/hosting.md).
- Testadresse for produksjonsgrenen: https://hengsel.drift-697.workers.dev. Adressen for denne grenen lages av Workers Builds når grenen pushes; jeg har ikke tilgang til Cloudflare herfra og har ikke funnet på noen adresse. Se PR for lenken når byggekontrollen har kjørt.

## Ruter
Åpne: `/`, `/crm`, `/ute`, `/kundeportal`, `/for-butikkleder`, `/integrasjoner`, `/priser-og-demo`, `/kunder`, `/om-oss`, `/telefon`, `/personvern`, `/app/apne`, `/app/lenke`, `/manifest.webmanifest`, 404.
Passord (K-107): `/apptest`, `/apptest/passord`, `/apptest/Logg_inn_i_demoen.pdf` (PDF-en fra PR #81 ligger uendret).
Bak Cloudflare Access: `/kunde`, `/kunde/apptest`, `/kunde/dokumenter`, `/kunde/hjelp`, `/kunde/sigdal`, `/kunde/sigdal/{apptest,crm,dokumenter,integrasjoner,kundeportal,slik-virker-det,ute}`, `/kunde/sigdal/vis/*`, `/kunde/sigdal/tema.css`. `/api/demo` er skjemaendepunktet.

## Sammenligning med tokens
Fargene i oppgaven finnes allerede i `packages/hengsel-tokens/tokens.css` under `[data-produkt="nettsider"]` (generert fra pinnet designsystem) og brukes av sidene via variabler:
`--merke-stift #B54F00`, `--aksent #AD5626`, `--aksent-trykk #99440F`, `--flate-side #FAF6F2`, `--flate-kort #FEFDFB`, `--flate-senket #F3EFE9`, `--tekst #272D38`, `--tekst-dempet #4E535C`, `--tekst-svak #666A71`. Skrift: Schibsted Grotesk, selvhostet, ingen serif.

**Avvik som ikke er rettet** (reglene sier at farger bare endres i designsystemet, og `npm test` feiler på håndredigert `tokens.css`):
- `--linje`: oppgaven #F0EEEB, pinnet verdi #D7DADE.
- `--paa-aksent`: oppgaven #FFFFFF, pinnet verdi #FBF9F6 (Off White; holder kontrastkravet).
Skal disse endres, må det gjøres i hengsel-crm og ny commit pinnes med `npm run design:hent`.

## Endret
Bare `sites/hengsel/src/styles/hengsel.css`: skriftskala for nettsider-temaet i en blokk avgrenset til `:root[data-produkt="nettsider"]`: h1 56/64 bold med -1.5px, h2 40/48, h3 32/40, ingress 18/28, brødtekst 16/26 (fluid ned på telefon). Ingen farger, tekster eller ruter er endret. Header/footer og forsiden brukte allerede tokens og ble ikke rørt.
Kundeutgavene (`/kunde/*`) har ikke `data-produkt` og beholder sin skala. `/apptest` bruker samme ramme og får den nye skalaen (kun tekststørrelse; passord, PDF og logikk er urørt).

## Kontroll
`npm run build` og `npm test` (269 tester, 0 feil, 1144 forespørsler i lenkesjekken uten feil).

## Gjenstår
- Visuell gjennomgang av skalaen i nettleser på testadressen (jeg har ikke sett siden rendret).
- Beslutning om `--linje` og `--paa-aksent` i designsystemet.
- Brødtekst er nå 16 px mens `html` fortsatt er 17 px for rem-baserte mål (K-174); en full overgang til 16 px rem er ikke gjort.
- React og Tailwind er ikke lagt til (ikke behov; Tailwind-farger er forbudt av reglene).
