# N-4 · admin.hengsel.no etter sidekartet 26-001–26-013, og de røde Workers-byggene

Gren `claude/n4-admin-sidekart` fra `origin/main` (2a1a969). PR mot `main`: SNgroup-Drift/nettsider#84 (flettes av Eirik).
Fasit: `docs/sidekart/26-0nn.md` og `26-0nn.webp` / `-tlf.webp` og `regel-layout-hengsel.md` fra grenen `demo` i hengsel-crm, klonet utenfor repoet.
Ingen nøkler, ingen Access-, Penneo- eller D1-hemmeligheter, ingen `wrangler deploy` (bare `--dry-run`), ingen remote-migreringer. `sites/hengsel`, `sites/vis`,
`sites/sngroup`, `sites/byggem`, `packages/` og workflowene er ikke rørt.

## Kort

- De 13 sidene finnes og er bygd med flis-kitet fra N-3, kopiert til `sites/admin/src/components/kit/`. Kitet bruker bare tokens og har bare lys modus.
  KOMMER-sidene (`/stotte`, `/fakturering`) er nøytrale og står ikke i menyen.
- API-et og dataene er som før. Den eneste endringen i Workeren er at 401-svaret på sider nå viser innloggingskortet (26-001); se «Utenfor Gjelder».
- **Byggene:** Lokalt er alt grønt for admin og design: `npm ci`, bygg, `wrangler deploy --dry-run` og `wrangler versions upload --dry-run`.
  Feilen ligger i Workers Builds-oppsettet: «design» og «admin» er nye Workers. Grenbygg kjører der **Preview command** `npx wrangler preview` uten `-c`,
  og `wrangler preview` krever i tillegg en `previews`-blokk, som admin manglet.
  Rettet i repoet: blokken i admin, tabellen i `docs/hosting.md` og en test. Resten står under «Eirik setter i Cloudflare».
- `npm test`: 206 av 207 grønne (1 hoppet over fra før). Lenkesjekken: 0 feil i 774 forespørsler. `npm run build` er grønt for alle nettstedene.
  `node scripts/hengsel-regler.mjs sites/admin` finner ingen fargeverdier og ingen mørk modus. Ingen nye avhengigheter.
- Skjermbilder: 36 filer i `claude/n4-skjermbilder/` (1440, og 390 der fasiten har telefon), pluss tilbudet som PDF.

## Del 2 – de røde Workers-byggene (S-68/S-62)

### Hva som er sjekket
| Sjekk | Resultat |
|---|---|
| Ren klon av `main`, `npm ci --progress=false`, `npm run build -w sites/admin` / `-w sites/design` | Grønt (som Workers Builds gjør det) |
| `npx wrangler deploy --dry-run -c sites/admin/wrangler.jsonc` og `… sites/design/…` | Grønt (admin: D1 `DB` + `ASSETS`; design: 458 filer, ingen bindinger) |
| `npx wrangler versions upload --dry-run -c …` for begge | Grønt |
| Node | `.nvmrc` = `22`, `engines` ≥ 22.12. Workers Builds har siden 14.10 Node 24.21 som standard, men følger `.nvmrc`/`NODE_VERSION`; Node 22 er forhåndsinstallert |
| wrangler | 4.148.0 i package-lock (≥ 4.135, som Worker Previews krever). Ikke oppdatert |
| `compatibility_date` | `2026-10-01` for begge, som de grønne Workerne. Godtas av wrangler 4.148 |
| `-c` i `docs/hosting.md` | Admin manglet i tabellen; raden for grenbygg brukte et felt som ikke finnes for nye Workers. Rettet |
| PR #81 | Endret bare `sites/hengsel/public/apptest/Logg_inn_i_demoen.pdf` og `docs/demo-pdf-rapport.md`, ikke csp-hasher eller skript. Den brekker ingenting. Byggene var røde før den: design siden PR #65 (K-212 runde 2, 14.10), admin på alle PR-er der den bygger (#79, #81) |
| Størrelser og grenser | Største fil i dist er 1,4 MB (grensen er 25 MiB). `_headers`-linjene er maks 382 tegn (grensen er 2000) |

### Funnet
1. **Grenbygg i nye Workers kjører `npx wrangler preview`.** Workers som er koblet til Workers Builds etter at Worker Previews kom, har ikke
   «Non-production branch deploy command», men **Preview command**, med standardverdien `npx wrangler preview`. Den kjøres fra rotmappen uten `-c` og finner
   ikke `sites/<navn>/wrangler.jsonc`. Design var grønn på PR #64 (13.10, forhåndsvisningen fikk `…/previews/claude-k212-furu/…`) og rød fra PR #65. Admin
   har vært rød på hver PR. sngroup og byggem bruker fortsatt den gamle modellen (`versions upload -c …`) og er grønne.
2. **`wrangler preview` stopper uten `previews`-blokk** («Your Wrangler configuration is missing a `previews` block», lest i wrangler 4.148). Design har
   en tom blokk siden 13.10; admin hadde ingen. **Rettet:** `"previews": {}` i `sites/admin/wrangler.jsonc`. Blokken er tom med vilje. En Preview arver ikke
   D1 eller variabler fra produksjon, så forhåndsvisningen av admin får verken produksjonsdatabasen eller `ACCESS_*` og svarer 503 (låst, aldri åpent).
3. **Produksjonsbyggene på `main`.** GitHub-sjekkene viser bare «failure» og en lenke til dashbordet; loggen kan ikke leses herfra (dashbordet og
   workers.dev kan ikke nås fra økta). Er Deploy command uten `-c`, gir det samme feil på `main`. Det må sjekkes i dashbordet (lista under).

### Rettet i repoet
- `sites/admin/wrangler.jsonc`: tom `previews`-blokk, og kommentaren sier Preview command.
- `sites/design/wrangler.jsonc`: bare kommentaren (Preview command med `-c`). Oppsettet er uendret.
- `docs/hosting.md`: admin-kolonne i tabellen; rader for hva grenbygg-feltet heter (Non-production branch deploy command / **Preview command**) og
  kommandoen per Worker; watch paths for hengsel har `sites/vis/*` (står allerede lenger ned i dokumentet); avsnittet «Grenbygg i nye Workers».
- `scripts/admin.test.mjs`: testen sjekker at begge wrangler-filene har `"previews": {}`, og at `hosting.md` har Deploy og Preview command med `-c` for begge.

### Eirik setter i Cloudflare
Workers & Pages → Worker → Settings → Build. Verdiene står i tabellen i `docs/hosting.md`.

| Felt | `design` | `admin` |
|---|---|---|
| Git-repo / gren for produksjon | `SNgroup-Drift/nettsider` / `main` | `SNgroup-Drift/nettsider` / `main` |
| Root directory (Path) | `/` | `/` |
| Build command | `npm run build -w sites/design` | `npm run build -w sites/admin` |
| Deploy command | `npx wrangler deploy -c sites/design/wrangler.jsonc` | `npx wrangler deploy -c sites/admin/wrangler.jsonc` |
| **Preview command** (står det «Non-production branch deploy command»: `npx wrangler versions upload -c …` i stedet) | `npx wrangler preview -c sites/design/wrangler.jsonc` | `npx wrangler preview -c sites/admin/wrangler.jsonc` |
| Build variables | `NODE_VERSION` = `22` | `NODE_VERSION` = `22` |
| Build watch paths, include | `sites/design/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json` | `sites/admin/*`, `packages/*`, `scripts/*`, `package.json`, `package-lock.json` |
| API-token | Nettside-tokenet. Står det «deleted or rolled» i loggen, velg et nytt | Samme |

Deretter: «Retry build» på siste commit på `main` og på PR-en. Er bygget fortsatt rødt, trengs den første linja med `✘ [ERROR]` fra loggen.
- Valgfritt for admin: skal forhåndsvisningen vise sider (ikke 503), settes `ACCESS_TEAM_DOMAIN` og `ACCESS_AUD` som **Preview**-variabler, og det lages en egen
  D1 for forhåndsvisning (ikke produksjonsdatabasen), som legges i `previews.d1_databases`. Det er ikke gjort; jeg har ikke laget noen ressurser.
- PR #81 brakk ikke design eller admin (se tabellen). Watch paths er antakelig ikke satt for design og admin, siden begge bygget på PR #81, som bare endret `sites/hengsel`.

## Del 1 – sidene

### Felles (skallet og kitet)
- **Kitet** (`src/components/kit/`): Flis, Rad, Innhold, Pille, Sok, Statusflis, Tekstflis, KommerSide fra N-3, pluss Tallflis. Stilen er gjort global i
  `src/styles/kit.css` med prefikset `k-`, fordi de fleste flisene tegnes i nettleseren fra `/api`. Prefikset hindrer kollisjon med `.tabell`, `.rad`,
  `.tall` og `.teller` i `admin.css`. `src/lib/kit.ts` lager samme markup: rad, flis, tallflis, tabell, liste med «Vis alle», faner, sidevelger, pille og søk.
  `Sidetopp`, `Listeflis` og `Tabellflis` fra N-3 er ikke tatt med, fordi Admin har topplinje (regel 8) og tegner lister og tabeller i nettleseren.
  Kitet importeres ikke fra `sites/hengsel`; testen sjekker det.
- **Sidemeny** (regel 7): «Hengsel Admin», omfanget «admin.hengsel.no · Alle kunder», sidekartets punkter og Innstillinger, og nederst profilen
  (Eirik, Admin) med bred/smal-knappen. Smal meny er 64 px, automatisk mellom 1024 og 1439 px, og valget huskes i nettleseren. Under 1024 px er menyen en skuff.
- **Topplinje** (regel 8): forelder over tittelen, statuspille, søk 320 px (⌘K / Ctrl+K og «/»), maks én sekundær- og én hovedknapp, bjelle og profil.
  Telefon: 48 px, søkeikon og «⋯», hovedknappen fast nederst og bunnfanene Oversikt, Tavle, Eiere, Avtaler og Mer.
- **Faner** 40 px under topplinja, med antall (regel 2e). Ingen tallpiller i verktøylinjene.
- «Eksempel – prislisten er ikke låst» vises i topplinja når gjeldende prisliste er merket eksempel (`GET /api/prisliste/gjeldende`).

### Per side
| Side | Gjort | Avvik, med grunn |
|---|---|---|
| 26-001 Innlogging | `/logg-inn`: kortet 400 px med merket, «Hengsel Admin», teksten og «Logg inn med Access» (til https://admin.hengsel.no/). Workeren viser kortet med status 401 når en side bes om uten gyldig Access-token | Ruten er `/logg-inn`, ikke `/`, fordi `/` er startsiden etter innlogging. Med Access foran domenet viser Cloudflare sin egen innlogging; kortet ses når en forespørsel når Workeren uten token (workers.dev, feil policy) |
| 26-002 Eiere og butikker | Faner Alle · Aktive kunder · Butikker hos kunder · Åpne muligheter. Tabell 1/1 (640): søk, «Status ▾», «Kjede ▾», «Fylke ▾», «Importer fra Excel», sumraden «Inntekt per måned», og «Inntekt per måned» til høyre i tittelen. Sidevelger med 10 per side. «Ny eier» og «Ny aktivitet» i topplinja. `/kunder` åpner fanen Aktive kunder | Fanen **«Alle»** er lagt til først, fordi siden ellers ikke viser tapte og prospekter samlet (fasiten har tre faner). «Butikker hos kunder» viser kundene sortert etter antall butikker; API-et har ikke én rad per butikk. Inntekten er summen av verdien hos kundene (samme kilde som kolonnen) |
| 26-003 Prisliste | Versjonene som faner, status som pille, «Publiser utkastet» og «Ny versjon». Tabell «Produktlinjer og pakker» (480, rediger i utkast), Tabell «Hengsel Ute og tillegg», Tekst «Kjederabatt og vilkår» (feltene i teksten kan redigeres i utkast) | Rad 4 er «Moduler per pakke» og «Innstillinger» (fornyes snart, tilbud gyldig). De fantes før og har ikke noe annet sted. **Fasitens Tekst «Support etter første år (forslag)» er tatt ut** (N-4b, Eirik 17.10): vilkårene i tilbud-PDF-en gjelder («samme timer så lenge avtalen løper», K-240 spørsmål 14). Se «Avvik fra sidekartet» |
| 26-004 Avtaler | Faner Alle · Utkast · Til signering · Signert · Fornyes snart · Dokumenter og vilkår (+ Sagt opp når det finnes). Tabell «Avtaler» med «Eier ▾» og søk, Penneo-status i tittelen. «Ny avtale fra tilbud» i topplinja. Avtalesiden (`/avtaler/:nr`) har fått skallet, men flisene er som før | «Sagt opp» blir sjuende fane når det finnes oppsagte avtaler (data fra K-240). Verktøylinja «Signering i Penneo: Send påminnelse · Forhåndsvis PDF» ligger på avtalesiden, der den gjelder én avtale |
| 26-005 Prisberegner | Faner Per butikk · Hele eieren · Sum per måned · Etablering. Tabell «Pakke per butikk» med «Produktlinje ▾» og «Legg til butikk»; pakke, ekstra brukere og montører endres i raden. «Lag tilbud» i topplinja. Brødsmule «Eiere og butikker › <eier>» | Kolonnen **«Montører»** er lagt til, fordi beregningen av Hengsel Ute bruker montører per butikk. «Fjern» er et kryss per rad. «Att.» (kontakten i tilbudet) står i fanen Hele eieren. Ruten er som før (`/salg/prisberegner?eier=…`) |
| 26-006 Tilbud-PDF | Uendret: PDF-en lages i Workeren (`worker/pdf.js`, `GET /salg/tilbud/:nr/:v.pdf`) | **Ikke bygd om.** PDF-en er Worker-kode (utenfor Gjelder), og K-teksten sier at Workeren skal være som før. Den har alt innholdet i fasiten (leverandør, til, tilbud/dato/gyldig/prisliste, linjer per butikk, Ute, kjederabatt, tillegg, per måned og år, etablering, viderefakturert, vilkår, eksempel-merket, bunntekst med versjon og sidetall), men i oppsettet fra 60-203. Se «Hva Eirik bør se på» |
| 26-007 Excel-import | Egen side `/salg/import`: velg fil → faner Nye · Oppdateres · Mangler org.nr. (· Hoppes over · Alle), Tabell kompakt «Forhåndsvisning: <fil>» med «N rader · Velg en annen fil» og søk, «Importer N rader» i topplinja, Tekst «Slik virker importen» | Ruten er `/salg/import` (fasiten: `/eiere/import`), fordi rutene i fase A ligger under `/salg`. `/salg/eiere?import=1` sender dit. Fanen «Alle» er lagt til |
| 26-008 Tilbakemeldinger | `/innstillinger/tilbakemeldinger`: faner Nye · Under arbeid · Løst i <måned>, Tabell kompakt (Når, Fra, Kunde, Kanal, Hva, Status) med «Kunde ▾» og søk. Raden åpner saken | Dataene er sakene med kilde `hjelp-crm`/`hjelp-ute` fra `GET /api/saker` (K-259); det finnes ingen egen tabell for tilbakemeldinger i Admin. Kolonnen «Side» (21-302 osv.) er byttet med **«Kanal»** (CRM/Ute), fordi listen fra API-et ikke har siden. «Lag K-sak» er raden som åpner saken |
| 26-009 Salg | `/` og `/salg/tavle`: faner Tavle · Liste, Tall 1/4 ×4 (Åpne muligheter, Inntekt per måned, Neste steg i dag, Fornyes innen N dager), Tavle «Salgstavle» med fem kolonner, søk og «Status ▾» (Åpne, Tapt), Tabell «Neste steg: forfalt og i dag». Dra og slipp på PC; mens et kort dras, vises «Tapt» som slippfelt, og grunn kreves | Kolonnen **«Hvem»** er tatt ut; `neste_steg` i API-et har ikke hvem. «Filter: Produktlinje» er ikke med av samme grunn. «Neste steg i dag» er rød når noe er forfalt (regel 9). Kortene fra fase B/C på den gamle Oversikten er tatt bort (sidekartet slår Oversikt sammen med tavla); sakene, oppstartene og fakturakjøringen har egne sider. Ruten er `/` (fasiten: `/salg`) |
| 26-010 Leverandør | Skjema 1/2 ×2 «Leverandør» og «Signatar», hver med «Lagre», Tekst «Brukes i», pillen «Eksempel» | Avkrysningen «Merk som eksempel» står i Signatar-flisen. Begge knappene lagrer hele leverandøren (`PUT /api/leverandor`, som før) |
| 26-011 Støtte | `/stotte`: «Kommer», Tekst 1/1 «Kommer i fase B» med fasitens første setning | Ikke i menyen. Setningene om tegnenumre og menypunktet er tatt bort (notater til den som bygger). **Support finnes allerede** (K-259, `/support/saker`) og står i menyen under sidekartets punkter |
| 26-012 Fakturering | `/fakturering`: «Kommer», Tekst 1/1 «Kommer i fase C» | Som over. **Faktureringen finnes allerede** (K-260, `/fakturering/abonnement` osv.) |
| 26-013 Eierkort | `/salg/eiere/:id` og `/kunder/:id`: brødsmule, navn, statuspille, «Prisberegner», «Ny aktivitet» og «⋯» (Rediger eier, Endre status, Ikke aktuell / åpne på nytt). Faner Oversikt · Prisberegner · Tilbud · Avtaler · Tidslinje. Oversikt: Liste 1/2 ×2 Kontaktpersoner + Muligheter og tilbud, Liste 1/2 ×2 Butikker + Tidslinje. Alle handlingene fra før (endre/slette butikk og kontakt, merk sendt, lag avtale, lead-banner, tapt) er med | For kunder: rad 3 med «Kundemiljø» og «Avtaler». Org.nr., adresse, kjede, linje og kilde står som tooltip på tittelen (regel 6: ingen tekst utenfor fliser) |

### Menyen
Øverst står sidekartets punkter: Salg, Eiere og butikker, Prisberegner og Avtaler, og gruppen Innstillinger med Prisliste, Leverandør, Excel-import og Tilbakemeldinger.
**Under en strek står modulene som er bygd i fase B og C og Drift, uendret:** Support (Saker, Timer, Support og roller), Oppstart, Fakturering (Abonnement,
Fakturakjøring, KPI, Utestående), Tall og Drift. Sidekartet viser ikke disse, men de virker, og `admin-fase-b.test.mjs` krever dem.
Å ta dem bort ville fjernet funksjoner. Sidene deres har fått det nye skallet med topplinje og meny; innholdet er det samme.
Rollen Support ser fortsatt bare Saker og Timer.

## Avvik fra sidekartet (rettes i neste Design-runde)
Eirik 17.10 kl. 20.57: appen beholdes slik, og sidekartet (`docs/sidekart/` i hengsel-crm) rettes etter lista under.

| Side | Sidekartet sier | Appen har (gjelder) |
|---|---|---|
| 26-003 Prisliste | Tekst «Support etter første år (forslag)»: timene halveres fra år 2 | Flisen er tatt ut (N-4b). Vilkårene i tilbud-PDF-en gjelder: samme supporttimer så lenge avtalen løper (K-240 spørsmål 14) |
| 26-009 Salg | `/salg` | `/` (og `/salg/tavle`) |
| 26-002 Eiere og butikker | `/eiere` | `/salg/eiere` (`/kunder` for fanen Aktive kunder) |
| 26-013 Eierkort | `/eiere/:id` | `/salg/eiere/:id` (`/kunder/:id` for kunder) |
| 26-005 Prisberegner | `/eiere/:id/prisberegner` | `/salg/prisberegner?eier=:id` |
| 26-007 Excel-import | `/eiere/import` | `/salg/import` (`/salg/eiere?import=1` sender dit) |
| 26-006 Tilbud-PDF | `/tilbud/:id/pdf` | `/salg/tilbud/:nr/:v.pdf`. Oppsettet bygges om i egen sak **N-6** etter prod; Workeren røres ikke nå |
| 26-008 Tilbakemeldinger | `/innstillinger/tilbakemeldinger` | Som sidekartet |
| 26-011 Støtte, 26-012 Fakturering | Kommer | Kommer-sidene står utenfor menyen. Support (K-259) og Fakturering (K-260) er bygd og står under streken i menyen |

**API-mangler** (kolonnene kommer når API-et har feltet):
- 26-009 Salg, Tabell «Neste steg»: kolonnen **«Hvem»** mangler, fordi `neste_steg` i `GET /api/oversikt` ikke har hvem. Det samme gjelder «Filter: Produktlinje» på tavla.
- 26-008 Tilbakemeldinger: kolonnen **«Side»** (21-302 osv.) mangler, fordi sakene fra `GET /api/saker` ikke har siden. Appen viser «Kanal» (CRM/Ute) i stedet.

## Utenfor «Gjelder», med grunn
- `sites/admin/worker/index.js` (12 linjer): 401 på GET/HEAD av sider viser `/logg-inn` (26-001) i stedet for ren tekst. Workeren henter bare den ene fila;
  API-et svarer fortsatt ADM-401 i JSON. Testen er `admin.test.mjs` «N-4 (26-001)».
- `sites/admin/src/lib/meny.ts`, `src/scripts/*` og `src/styles/*` ligger under `src/**`. `scripts/admin-fase-b.test.mjs` er i Gjelder: `omradeFor("/")` er nå «Salg».

## Sjekk
- `npm test`: 206 av 207 grønne, 1 hoppet over («fristfarger», TypeScript-import, fra før). Lenkesjekken: 0 feil i 774 forespørsler.
  Nye tester i `scripts/admin.test.mjs`: previews-blokkene og hosting-tabellen, innloggingskortet ved 401, og menyen og Kommer-sidene.
- `npm run build`: grønt for alle nettstedene. `npx wrangler deploy --dry-run -c sites/admin/wrangler.jsonc` og `… sites/design/…`: grønt.
- `node scripts/skjermbilder-k240.mjs`: «Alt grønt», uten konsollfeil, mislykkede forespørsler eller sidelengs rulling. 36 filer i `claude/n4-skjermbilder/`.
  Skriptet bruker nå N-4-sidene, legger også inn fase B-eksempeldataene (til Tilbakemeldinger) og skriver til `claude/n4-skjermbilder/`.
- HawkScan (DAST) er ikke kjørt: `HAWK_API_KEY` er ikke satt i økta. Sikkerheten er dekket av testene (Access-sjekken, roller, 401/403/503, CSP uten inline-skript).

## Hva Eirik bør se på – svar 17.10 kl. 20.57
1. **Cloudflare-lista over** (Preview command med `-c`) står fortsatt hos Eirik. Er bygget rødt etter «Retry», trengs `✘`-linja fra loggen.
2. **Fase B/C i menyen:** behold. Støtte og Fakturering står under streken, og Kommer-sidene står utenfor menyen.
3. **26-006 Tilbud-PDF:** egen sak N-6 etter prod. Workeren røres ikke nå.
4. **«Support etter første år (forslag)»:** vilkårene i PDF-en gjelder. Flisen er tatt ut av prislisten i N-4b (`sites/admin/src/scripts/prisliste.ts`, vakttest i
   `scripts/admin.test.mjs`). Sidekartet rettes i neste Design-runde (se «Avvik fra sidekartet»).
5. **Ruter:** rutene fra fase A beholdes. De står i «Avvik fra sidekartet», så sidekartet kan oppdateres.
6. **«Hvem» og «Side»:** står som API-mangler i «Avvik fra sidekartet».
7. Bjella viser antall åpne saker og går til Support. Det finnes ingen egen varselkilde i Admin.

## N-4b (17.10)
PR #84 er flettet til main (ba527a6), sammen med N-1 (#86), N-3 (#83) og N-5 (#85). N-4b er gjort på grenen `claude/n4b-prisliste-tekst` fra `origin/main`:
flisen «Support etter første år (forslag)» er tatt ut av prislisten, det er lagt til en vakttest, og rapporten har fått «Avvik fra sidekartet» og svarene over.
De kjente røde sjekkene (Bibliotek-sjekk og Workers Builds design/admin) er ikke rørt.

N-4 KLAR
