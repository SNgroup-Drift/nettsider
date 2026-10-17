# N-5 · design.hengsel.no etter sidekartet: mønstersidene 29-001–29-006 (S-68)

Grenen `claude/n5-design-sidekart` er laget fra `origin/main` (2a1a969). PR mot `main` er SNgroup-Drift/nettsider#85, og **Eirik fletter**.
Fasiten er `docs/sidekart/29-00n.md` med bildene (PC 1440, iPad 1024, Telefon 390) og `regel-layout-hengsel.md` på `demo` i hengsel-crm
(a15f1400). Regeltekstene er hentet fra Hengsel-designsystemet 2.2.0 (`_ds/hengsel-designsystem`, commit 6003bc0b).

## Kort

- Menyen på design.hengsel.no har fått punktet **«Mønstre»** (`/monstre`), mellom Skjermer og Last ned.
  - Oversikten `/monstre` lenker til de seks sidene.
  - Hver mønsterside har en fanerad med de seks sidene i sidekartets rekkefølge.
- De eksisterende sidene er urørt, også forsiden.
- Hver side viser mønsteret med kitet: de samme flisene, radene og høydene som i sidekartet.
  - Under mønsteret står **«Regelen i designsystemet»**: ordrette sitater, hvert med fila det står i, og commiten under.
  - Regelen er også en flis, slik regel 6 krever: ingen tekst uten flis mellom fliser.
- Sjekker:
  - `npm run build` er grønt for alle nettstedene.
  - `npm test`: 208 grønne, 0 feil. Én test er hoppet over (`fristfarger … # SKIP TypeScript-import ikke tilgjengelig`), og den hoppes også over på main.
  - Lenkesjekken har 0 feil i 779 forespørsler.
  - `node scripts/hengsel-regler.mjs sites/design` finner ingen fargeverdier og ingen mørk modus.
- Ingen hex og ingen mørk modus på sidene. Pillene bruker statusrollene i den delte token-fila, og resten bruker rollene (`--flate-kort`, `--linje` osv.).
- Ingen nye avhengigheter. `packages/`, workflowene og de andre nettstedene er ikke rørt.
- Skjermbilder i `claude/n5-skjermbilder/`: 7 sider × 1440, 1024 og 390, hele siden, webp.
  - Bildene er tatt med Chromium i mørk modus på maskinen, så det er også en sjekk av at siden holder seg lys.
  - Ved hvert bilde ble disse sjekket, og alle var grønne: ingen konsollfeil, ingen `style`-attributter, ingen vannrett rulling, og axe-core (WCAG 2.2 AA og beste praksis) med 0 brudd.

## Kitet (`sites/design/src/components/kit/`)

Kitet er kopiert fra N-3 (`sites/hengsel/src/components/kit` og `src/scripts/kit.ts` på `claude/n3-hengsel-sidekart`, PR #83, ikke flettet ennå), ikke importert. N-4 har ikke noe kit (den gjelder previews). Endringer i kopien:

| Hva | Hvorfor |
|---|---|
| Klassene har prefikset `k-` (`k-flis`, `k-pille`, `k-tabell` …) | `design.css` har globale `.pille`, `.tabell`, `.kort`, `.felt` og `th { text-transform: uppercase }`, som ellers lekker inn |
| iPad-trinnet 768–1199 px: 1/4 og 1/3 blir 1/2, og en 1/3 som blir til overs, blir 1/1. Telefon er under 768 px | Sidekartet har egne iPad-bilder for 29-xxx (8 kolonner). N-3 hadde bare PC og telefon (960 px) |
| `Flis` har fått bredden 1/4 (bare Tall) og `etikett` (tilgjengelig navn når tre fliser heter det samme) | 29-004 og 29-006 har Tall 1/4 ×4. axe krever ulike landemerkenavn |
| `Pille` har alle sju tonene (også `feil` og `sannsynlig`) | N-3 brukte ikke rødt på hengsel.no. 29-001 og 29-005 viser «Haster» og «MD-503» |
| `Sidetopp` har tittel 32 px med undertekst på sideflaten, og fanene under | «Rammen» i 29-xxx. N-3 hadde 48 px på kortflaten (25-xxx) |
| `Tabellflis` har to utgaver:<br>• `kompakt`: søk i tittelfeltet, rader 40<br>• `full`: verktøylinje med søk 240 px, filterknapper, Butikk og Eksporter, rader 44, sidevelger 48<br>I begge kan tallkolonner høyrejusteres med tabulære sifre, celler kan vise piller, og `bryt` gir lang tekst over flere linjer | 29-003, 29-006 og regeltabellene. Høyden går opp i trinnet: luft 16 over og under, tittelfelt 40 (2d) |
| Nye fliser:<br>• `Tallflis`, `Skjemaflis`, `Diagramflis` (SVG)<br>• `Stegflis`<br>• `Tavleflis` (Tavle og Uke, med kolonnevelger på telefon)<br>• `Planflis` (stolpene plassert med klasser)<br>• `Tegningflis` (stripeplassholder av tokens)<br>• `Regelflis`, `Monsterfaner`, `Monsterside` | Flisklassene i 29-004 som N-3 ikke hadde |
| Dialogene («Vis alle») ligger inne i flisen | Ellers teller de som barn i raden, og iPad-regelen for den siste 1/3 bommer |
| `kit.ts`: filter (status og butikk) sammen med søket, og kolonnevelgeren i Tavle og Uke | 29-003 og 29-004. Uten skript står alt åpent |

Ingen `style`-attributter: høyder og plassering ligger i klasser eller SVG-attributter, fordi CSP-en er `style-src 'self' 'sha256-…'`.

## Per side

| Side | Gjort | Avvik fra sidekartet, med grunn |
|---|---|---|
| 29-004 Flisklasser (`/monstre/flisklasser`) | Rad 1–11 som i sidekartet: Tall 1/4 ×4, Status 1/3 ×3, Kortliste 1/3 ×3, Liste + Diagram, Skjema + Tekst (480), Tabell (2 rader = 320), Steg, Tavle, Uke, Plan og Tegning. Under står tabellen «Flisklassene i designsystemet», med cellene ordrett fra `flisklasser.md`, og regelflisen | **«OB 88412 fra Sigdal Kjøkken AS»** er endret til **«Nordli Kjøkken AS»**. «Sigdal» er forbudt på design.hengsel.no (FORBUDT, K-151), og designsystemet bruker selv Nordli Kjøkken som eksempel. **Første kortliste viser 5 av 7** (tegningen viser 3). Regelen sier maks 5 rader, så fire rader til er diktet opp, og «Vis alle (7)» åpner alle sju. Tavla «Tilbud sendt» har fått et sjette kort, som «Vis alle (6)» krever. Diagramtallene er lest av søylehøydene. «Lagre» sender ingenting |
| 29-001 Tilstander (`/monstre/tilstander`) | Status 1/3 ×3 (Tom, Laster, Feil) og Tabell «Tekstene» (4 rader = 320). Under står regelen og tabellen «Tom, laster og feil per flisklasse» (fra `flisklasser.md`) | Tekstene som er kuttet med … i tegningen, er skrevet ut. Feil-teksten er tatt fra designsystemets README («Sjekk nettet og prøv igjen. Ingenting av det du har lagret er borte.») |
| 29-005 Ikoner og piller (`/monstre/ikoner-og-piller`) | Status 1/3 ×3 i to rader (ny, pagar, venter / advarsel, feil, ferdig) og Tabell «Ord og nøkkel» (6 rader = 480) med pillen i siste kolonne | Som i sidekartet vises seks av de sju nøklene (`sannsynlig` mangler). Ikonene vises ikke som fliser, fordi sidekartet ikke har det. De står med navn på /komponenter, og regelen for ikonene er sitert under |
| 29-006 Datoer, beløp og tall (`/monstre/tall`) | Tall 1/4 ×4, Tabell «Skrivemåte» (9 rader = 480) og Tabell «Høyrejustert med tabulære tall» (4 rader = 320) | Ingen. Datoene i tabellen er høyrejustert med tabulære tall som i sidekartet. Det strider mot `Tabell.prompt.md`, se punkt 3 under |
| 29-003 Tabell (`/monstre/tabell`) | Tabell «Kunder» (640): 412 til høyre, søk 240 px, «Filter: Alle · Lead · Tilbud · Ordre · Ferdig · Butikk · Eksporter», 10 rader à 44 og sidevelger «1–10 av 412», 10 per side. Under står Tekst «Regler» (320) og regelflisen | **«Bjørn Rønning» er endret til «Even Rønning»**: «bjørn» står i FORBUDT. Filterknappene og Butikk filtrerer de ti radene. «Eksporter» og sidetallene er plassholdere (`aria-disabled`/`disabled`), fordi siden bare har ti rader. Sidekartet har bare PC. På telefon følger siden regelen (første og siste kolonne, raden åpner resten), men raden blir 711 høy fordi verktøylinja brytes |
| 29-002 Dialoger og skuffer (`/monstre/dialoger`) | Skjema «Dialog: Ny kunde» (Navn, Telefon, Butikk, «Lagre kunde») og Tekst «Når dialog» (480), og Tabell «Dialog, skuff og ark» (4 rader = 320) | Ingen. Dialogen er vist som flis, som i sidekartet. En levende dialog finnes i «Vis alle» på 29-004 |

Felles:
- iPad og telefon har de samme flisene i samme rekkefølge og med samme høyder. Bare bredden endres, som i sidekartets iPad- og telefonbilder:
  - Tall blir 2 × 2.
  - Status 1/3 ×3 blir 1/2 + 1/2 + 1/1.
  - På telefon blir alt 1/1, og tabellene viser første og siste kolonne.
- Tabell kompakt med 9 rader går opp i 480 (luft 16 over og under).
- Regelflisene og regeltabellene har høyden `auto`, fordi sitatene er lengre enn 320. Rapporten nevner det, som N-3 krever.

## DS-tekstene som er brukt

**Den pinnede kopien i `packages/hengsel-tokens/ds` (2.1.0, 82490f41) har ikke regeltekstene.** Nettsider pinner bare `tokens/` og `assets/` (det står også i designsystemets README). LAYOUT-REGLER, Tilstand og de andre fantes heller ikke ved den commiten. Siden N-5 ikke får røre `packages/`, er løsningen denne:

- Filene under er kopiert **ordrett** fra hengsel-crm `6003bc0b` (designsystem 2.2.0, siste endring i `_ds` på demo) til `sites/design/src/content/ds-sitat/`, med repo, sti, commit og sha256 per fil i `kilde.json`.
- `src/lib/ds-tekst.ts` leser fila fra **den pinnede kopien når den finnes der** (for eksempel etter en ny pin), ellers fra `ds-sitat`.
- Hvert sitat er et utsnitt (regex) av fila. Finnes ikke utsnittet, stopper bygget.
- `design-fasit.test.mjs` sjekker:
  - at sha256 i `kilde.json` stemmer
  - at hvert sitat på de bygde sidene står ordrett i fila det kom fra
  - at den pinnede kopien brukes når den finnes

| Fil (`_ds/hengsel-designsystem/…`) | Sitert på |
|---|---|
| `dokumentasjon/LAYOUT-REGLER.md` (1 Rutenett, 2 Bredder, 2b, 2c Tall/Tabell/Felles, 2d, 3 Skjemaer) | 29-001, 29-002, 29-003, 29-004, 29-006 |
| `flisklasser.md` (intro og tabellen med de 13 klassene) | 29-001 (tom/laster/feil per klasse), 29-002, 29-003, 29-004 (hele tabellen) |
| `components/status/Tilstand.prompt.md` | 29-001 |
| `components/overlays/Dialog.prompt.md`, `Ark.prompt.md`, `Skuff.prompt.md` | 29-002 |
| `components/layout/Tabell.prompt.md` | 29-003, 29-006 |
| `components/layout/Flis.prompt.md` | 29-004 |
| `components/status/Statuspille.prompt.md`, `components/brand/Ikon.prompt.md` | 29-005 |
| `README.md` («Tilstander», «Tall», «Farger»: sju statuser, «Ikoner») | 29-001, 29-005, 29-006 |

Sitatene er valgt så de ikke har fargeverdier eller ekte navn. Første linje i `Dialog.prompt.md` har for eksempel `rgba(…)`, så bare «Dialog for bekreftelse og korte skjema.» er tatt med.

## Utenfor «Gjelder», med grunn

- `sites/design/src/content/nav.ts`: menypunktet «Mønstre» (det menyen leser).
- `sites/design/src/content/monstre.ts`: lista over de seks sidene (tittel, sti, undertekst fra sidekartet), som menyen, fanene og oversikten bruker.
- `sites/design/src/content/ds-sitat/` og `sites/design/src/lib/ds-tekst.ts`: sitatene (se over).
- `scripts/design-fasit.test.mjs` har fått fem nye tester, og noindex-testen dekker /monstre-sidene.
- Skjermbildeskriptet er ikke lagt i repoet, fordi «Gjelder» ikke har det. Det er Playwright med axe, likt `scripts/skjermbilder-design.mjs`, for /monstre i 1440, 1024 og 390.

## N-1

**N-1 (designsystem-pin) var ikke flettet til main da økta var ferdig** (`origin/main` = 2a1a969, ingen `claude/n1-*`-gren på origin). Derfor:
- PR #85 **står som utkast** til Eirik sier fra.
- Når N-1 er inne: `git fetch origin main && git merge origin/main`. Konflikter i `scripts/design-fasit.test.mjs` løses ved å beholde begge: N-5-testene står i en egen blokk nederst, og bare én linje er endret i noindex-testen (sidelista). Kjør deretter `npm run build` og `npm test`.
- Pinner N-1 også tekstfilene, leser sidene dem fra `packages/hengsel-tokens/ds` av seg selv. Er en sitert setning endret i den nye versjonen, stopper bygget med beskjed om hvilket sitat som må rettes.

## Hva Eirik bør se på

1. **Regeltekstene er ikke pinnet i nettsider.** De ligger som ordrett kopi med sha256 i `sites/design/src/content/ds-sitat/`. Skal de pinnes sammen med tokens (`hent-designsystem.mjs` + `designsystem.pin.json`), må det gjøres i en sak som får røre `packages/`.
2. **Designsystemet på demo (2.2.0) og sidekartet er ikke helt like.**
   - `LAYOUT-REGLER.md` i designsystemet har ikke 2e, 3c og 9.
   - `flisklasser.md` sier at Tabell er «480 (til 6 rader) eller 640», mens sidekartet (2d, 13.36) sier Tabell kompakt 320 til 5 rader og 480 til 9.
   - Sidene følger sidekartet. Sitatene viser designsystemet slik det står.
3. **Tabulære tall på datoer.** `Tabell.prompt.md` sier «tabular-nums bare på beløp og antall, ikke på datoer», men 29-006 og 29-003 viser datoene høyrejustert med tabulære tall. Sidene følger sidekartet. Begge står på siden.
4. **Kortliste viser 5 rader** (regelen), mens tegningen viser 3 av 7. Si fra hvis tegningen skal gjelde.
5. Fiktive navn er byttet der FORBUDT slo til: «Sigdal Kjøkken AS» ble «Nordli Kjøkken AS», og «Bjørn Rønning» ble «Even Rønning». Sidekartet har dem som oppdiktede eksempler, men testen på design.hengsel.no stopper dem.
6. 29-003 på telefon er ikke tegnet. Siden følger regelen, men raden blir høyere enn 640 fordi verktøylinja brytes.
7. Bunnen på design.hengsel.no viser fortsatt «Designsystem 2.1.0 · pinnet commit 82490f41» (pinnen), mens regelflisene siterer 2.2.0 (6003bc0b). Det retter seg når N-1 eller en ny pin er inne.

N-5 KLAR
