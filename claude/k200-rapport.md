# K-200 · /app/jobb/<id> på PC sendes videre til jobben i CRM-et

## Hva som er gjort

- Ny side `sites/hengsel/src/pages/app/lenke.astro` (`/app/lenke`). `_redirects` skriver `/app/jobb/*` og `/app/foresporsel/*` om til den (200, adressen står uendret, slik at iOS fortsatt kan åpne appen via AASA).
- Skriptet `src/scripts/app-lenke.ts` leser stien og velger tilstand:
  - **PC:** `location.replace` til jobben i CRM-et med en gang. Den synlige lenka «Åpne jobben i CRM-et» står på siden hvis videresendingen ikke skjer.  På PC vises bare CRM-lenka.
  - **Telefon uten appen** (Android, iPhone, iPad inkl. iPadOS som oppgir seg som Mac): «Åpne jobben i CRM-et» og «Hent Hengsel-appen». Ingen automatisk videresending.
  - **Ugyldig id / ukjent lenke:** melding om at lenka ikke er gyldig og «Hent Hengsel-appen». Ingen videresending.
  - **Uten JavaScript:** meldingen «åpnes i Hengsel-appen» og «Hent Hengsel-appen».
- Skriptet er en ekstern fil, så CSP-en (`script-src 'self'`) er uendret. Ingen inline-skript.
- `/app/apne` er beholdt som den var (gammel generell reserveside), men er ikke lenger mål for omskrivingen.
- AASA-fila er ikke endret.

## CRM-adressen og ruten: ett sted

`sites/hengsel/src/content/crm-lenke.mjs`:

```js
export const CRM_ADRESSE = "https://crm.studiosigdal-innlandet.no";
export const RUTER = { jobb: "/#/orders/{id}", foresporsel: null };
```

En test sjekker at adressen ikke står i noen annen fil under `src/` eller `public/`, og ikke i den bygde HTML-en.

### Slik byttes adressen når K-183 er ferdig

1. Endre `CRM_ADRESSE` til `https://app.hengsel.no` i `crm-lenke.mjs`. Endre `RUTER.jobb` hvis ruten i det nye CRM-et ikke lenger er `/#/orders/<id>` (for eksempel `/orders/{id}` hvis hash-ruting byttes ut).
2. Oppdater den forventede adressen i testen «gyldig id gir riktig CRM-adresse» i `scripts/app-lenker.test.mjs`.
3. `npm run build` og `npm test`. Ingen andre filer, ingen DNS- eller Cloudflare-endringer.

## Sikkerhet

- id-en må matche `^[A-Za-z0-9_-]{1,64}$` (uuid, tall, nøkler) før den settes inn. Punktum, skråstrek, `%`, `?`, `#`, mellomrom og alt annet gir ingen videresending.
- Verten er alltid `CRM_ADRESSE`. Det finnes ingen parameter, ingen `?til=` og ingen annen kilde til adressen, så ingen åpen videresending. Stien må ha nøyaktig formen `/app/(jobb|foresporsel)/<id>`.

## Må avklares: /app/foresporsel/<id>

`/app/foresporsel/*` står i AASA og går til samme side, men jeg fant ingen kjent CRM-rute for forespørsler (K-195 handler om `/#/orders/<id>`, og K-195-rapporten ligger ikke i dette repoet). Derfor er `RUTER.foresporsel = null`: den lenketypen får ingen videresending, bare «Hent Hengsel-appen». Når ruten er bestemt, er det én linje i `crm-lenke.mjs`.

## Tester

I `scripts/app-lenker.test.mjs` (kjøres av `npm test`):

- gyldig id gir `https://crm.studiosigdal-innlandet.no/#/orders/<id>`, og verten er alltid CRM-adressen
- ugyldige id-er og stier (`a.b`, `a/b`, `..`, `//evil.example`, `%2F`, for lang, tegn utenfor tillatt mengde …) og ukjente typer gir `null`, altså ingen videresending
- forespørsel gir ingen CRM-adresse ennå
- PC og telefon skilles (inkl. iPadOS)
- CRM-adressen står bare i `crm-lenke.mjs`
- bygd side: noindex, ingen inline-skript, lenke til `/apptest`, ingen fargeverdier i kilden, ingen `prefers-color-scheme`
- `_redirects` skriver app-stiene om til `/app/lenke`

Fargeverdier utenfor token-fila fanges i tillegg av `hengsel-regler.test.mjs` (a–c), som dekker `sites/hengsel`. Siden bruker bare variabler (`--ink`, `--accent`, `--tekst-dempet`, …) og den delte rammen fra `@sngroup/hengsel-tokens`. Bare lys modus.

`npm run build`: grønt. `npm test`: 92 tester, 91 bestått, 0 feil, 1 hoppet over (eksisterende), og lenkesjekken ga 628 forespørsler uten feil.

I tillegg kjørte jeg den bygde siden i Chromium med omskrivingen etterlignet: PC-agent på `/app/jobb/abc-123` endte på `https://crm.studiosigdal-innlandet.no/#/orders/abc-123`. iPhone-agent ble stående på siden med begge knappene. PC med ugyldig id (`a.b`) ble stående på siden med bare «Hent Hengsel-appen». Selve Cloudflare-omskrivingen er ikke testet i produksjon.

## Merk

- Sidens tittel er «Åpne jobben» også for forespørsler. Tekstene er generelle nok til begge.
- Ikke kjørt mot ekte Cloudflare, og ingenting er flettet.
