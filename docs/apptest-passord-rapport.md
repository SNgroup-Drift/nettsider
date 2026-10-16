# Demopassordet ut av HTML-en på /kunde/apptest

Gren: `claude/apptest-passord-fjern` (fra `main`). Ikke pushet til `main`, ikke deployet.

## Funn

- «Sigdal12!» står ikke i repoet, verken i kilde, bygde filer eller dokumenter (søkt uten hensyn til store/små bokstaver, `node_modules` og `.git` unntatt). Det er verdien til hemmeligheten `DEMO_PASSORD` i Cloudflare.
- Passordet havnet i HTML-en fordi `sites/hengsel/worker/kunde.ts` kalte `medDemopassord()` for `/kunde/apptest` og `/kunde/sigdal/apptest`. Den setter passordet inn i hver `<span data-demopassord>` for innloggede (Access), og viser «Kopier»-knappene.

## Endring

- `sites/hengsel/worker/kunde.ts`: fjernet innsettingen (`MED_DEMOPASSORD`, kallet til `medDemopassord`, `DEMO_PASSORD` i `KundeEnv`). Svaret fra de statiske filene sendes uendret (med Access-sjekken, `noindex` og `private, no-store` som før).
- Resultat på `/kunde/apptest` og `/kunde/sigdal/apptest` (samme komponent, `apptest.astro`): passordfeltet står med «••••••••», «Passordet får du av den som inviterte deg» vises, og «Kopier» på passordet er skjult. Brukernavn og PDF-en med demobrukerne er som før.
- `/apptest` (bak eget passord, K-107/K-114) er ikke endret og setter fortsatt inn demopassordet; `worker/apptest.ts` og komponenten er urørt.
- Kommentarer og dokumentasjon oppdatert: `sites/hengsel/wrangler.jsonc`, `docs/hosting.md`.
- Test: `scripts/kunde-worker.test.mjs` sjekker nå at passordet aldri står i svaret på de to adressene, heller ikke med gyldig token og `DEMO_PASSORD` satt, og at plassholderen står igjen. Uten token er svaret fortsatt 403.

## Kontroll

- `npm run build` grønn. `npm test` grønn: 203 bestått, 0 feil, 1 hoppet over.
- Søk etter «Sigdal12» i hele repoet (inkl. `dist`): ingen treff.

## Verdt å vite

- Et passord som har stått i HTML-en for innloggede kunder kan ha havnet i nettlesercache eller historikk. Vurder å bytte `DEMO_PASSORD` (`npx wrangler secret put DEMO_PASSORD -c sites/hengsel/wrangler.jsonc`); jeg har ikke rørt hemmeligheter.
- Kunder som skal logge inn i demoen får nå passordet fra den som inviterte dem (og i PDF-en «Logg inn i demoen» hvis den viser det; jeg har ikke åpnet PDF-en).
- Fjerner du `DEMO_PASSORD` som sekret helt, virker `/apptest` fortsatt uten passord i teksten; den siden beholder logikken.
