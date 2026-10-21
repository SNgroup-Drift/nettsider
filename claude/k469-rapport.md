# K-469 – Hengsel Admin: Støtte, Oppstart, Fakturering, Tall og Drift på v5-kitet (S-62)

Gren `claude/k469-admin-resten` fra `origin/main`. PR mot main: https://github.com/SNgroup-Drift/nettsider/pull/106 (Ready for review).
Eirik eller Oversikt fletter.

## Kartlegging: finnes på main, ligger på gren, mangler

| Del | Finnes på main | Ligger på gren | Manglet før K-469 (bygget nå) |
|---|---|---|---|
| D1-migreringer | 0001 fase A, 0002 fase B (sak, melding, tidsføring, oppstart, rollen support), 0003 fase C (abonnement, fakturakjøring, KPI, konto, frist, rutine) | – | Ingen. K-469 trenger ingen ny migrering |
| API | api-support, api-oppstart, api-fakturering, api-drift, hjelp.js (POST /api/hjelp), poweroffice.js | – | Support får `GET /api/eiere*` uten beløp (`worker/belop.js`) |
| K-259 (fase B) og K-260 (fase C og Drift) | Flettet | `claude/k259*`, `claude/k260*`: 0 commits utenfor main | – |
| N-4-kitet (26-001–26-013) | `src/lib/kit.ts`, `kit.css`, Flis, Rad, Innhold | `claude/n4*`: 0 commits utenfor main | Fase B/C/Drift-sidene var ikke på kitet. Nå bygget |
| K-272 | – | 2 commits (ikke tatt med, som K-teksten sier) | Oppstart kan kobles til senere via `POST /api/oppstart` og `oppstart.avtale_id`, uten migrering 0004 |
| 26-011 Støtte | KommerSide | – | SB1 Saker på `/stotte`, SB2 Sak og SB3 Timer på kitet |
| 26-012 Fakturering | KommerSide | – | SC2 Fakturakjøring på `/fakturering`, med SC1, SC3 og SC4 i kitrammen |
| Menyen | Støtte og Fakturering sto ikke i menyen | – | Eier: Salg · Støtte · Oppstart · Fakturering · Tall · Drift · Innstillinger. Support: Kunder · Saker · Timer |
| Rollen support | Saker og timer | – | Ser også Støtte og Kunder (uten beløp). ADM-403 ellers |
| Oversikt (26-009) | Tavla | – | Tre kort: Åpne saker og frister, Oppstarter i gang, Neste fakturakjøring |
| 26-001 (D-12 del B) | Innlogging uten Admin-logo, ingen «Ingen tilgang» for ukjent adresse | – | Admin-logoen, «Logg inn / Send kode» og «Ingen tilgang» med adressen (403) |

## Det som er bygget

- **Menyen** (`src/lib/meny.ts`): Støtte og Fakturering står i menyen så snart sidene er bygget (svar fra Eirik), og Innstillinger står sist.
  Bjella går til `/stotte`, og bunnfanene for support er Saker, Timer og Kunder.
- **SB1 Saker** (`/stotte`):
  - Status står som faner med antall, og flisa «Saker» har verktøyene Prioritet ▾, Kilde ▾, Kunde ▾ og søk.
  - Tabell på PC og kort på telefon. Forfalte saker får rød tekst og ramme, uten rødt fyll.
  - Svarfristen står som tid igjen. Sidepillen viser «Eksempel – svarfrister».
  - Tilstander: tom, laster, feil og ingen treff.
- **SB2 Sak**:
  - Hodet viser saksnummeret (H-nnnn) med statussegmentet.
  - Rad med «Tråd» (2/3), og ved siden av fliser for Tidsføring, Kontakt og kunde og «Sendt med «Hjelp»».
  - Svar lages bare som utkast.
- **SB3 Timer**: «Timer per kunde» med månedsvelger. Timeprisen er merket «Eksempel – timepris». Support ser timene uten beløp.
- **SO1 og SO2 Oppstart**:
  - SO1 har fanene «I gang · Fullført», og «Ny oppstart» står i topplinja.
  - SO2 har statusflisene Oppstartsdato, Avtale og Fremdrift, flisa «Stopper» med Send påminnelse, og «Sjekkliste».
- **SC2 Fakturakjøring** (`/fakturering`):
  - Faner Alle/Klar/Sendt/Feil.
  - Summene uten mva, mva 25 % og med mva.
  - «Fakturaer» (2/3) med månedsvelger, og «Engangslinjer».
  - «Lag utkast / Regn ut på nytt» og «Send til PowerOffice» står i topplinja.
- **PowerOffice**: av uten `POWEROFFICE_*`. Knappen er grå med «PowerOffice er ikke koblet til», og API-et kalles aldri.
- **SC1, SC3, SC4, ST1 og SD1/SD2**: sidehodet er flyttet til topplinja (`sidehode()` i `fase-c.ts`), og innholdet ligger i `Innhold`. Lenker er bygget om til én Flis per gruppe.
  - Kontoer lenker til 1Password-hvelvet. Hemmeligheter vises aldri.
- **Rollen support**:
  - `kanSe` åpner `/stotte`, `/kunder` og `GET /api/eiere*`.
  - Workeren sender svaret på `/api/eiere*` gjennom `utenBelopSvar`, så alle felt som slutter på `_ore` blir null.
  - Kunder viser verken beløpskolonne, sumrad eller «Ny aktivitet», og prislisten hentes ikke for support.
  - `POST /api/eiere`, Fakturering, Oppstart, Tall og Drift gir ADM-403. Sidene viser «Ingen tilgang» med 403.
- **26-001**:
  - `logg-inn` (steg epost) og `logg-inn-ingen` (steg ingen).
  - En gyldig Access-token uten rolle gir «Ingen tilgang» med adressen (escapet) og 403 på sider, og ADM-403 på API-et.
  - CSS, fonter, logo og favicon til innloggingssiden vises uten Access (`utenInnlogging`). Skript krever fortsatt Access.
- **POST /api/hjelp**: står utenfor Access med samme vern som /api/lead (fra K-259; uendret, testet på nytt).
- **Uavklarte verdier** står med «Eksempel»: svarfrister, timepris og prisliste.

## Avvik og valg

- **Justeres etter Design**: disse er bygget med kitets fliser, fordi de ikke er tegnet i 60-211 eller D-12 del B.
  - Innholdet på SC1, SC3, SC4, ST1 og SD1/SD2 er K-260-kortene i kitrammen.
  - Oversikt-kortene og flisa «Stopper» på SO2.
  - Kunder uten beløp for support.
- **Favicon**: `Hode.astro` i `packages/` peker fast på `/favicon-flis.svg`. `packages/` skal ikke røres, så Admin har samme favicon som før.
  Admin-logoen står i menyen og på innloggingssiden.
- **Kodesteget i 26-001** er Cloudflare Access sin egen side, så den kan ikke tegnes om herfra. «Send kode» sender e-posten videre til Access.
- **Skjermbildet fra «Hjelp»** lagres i R2, ikke D1. Det valget ble gjort i K-259 fordi en D1-rad har tak under 2 MiB.
  R2-bindingen står fortsatt kommentert ut, så `docs/hosting.md` er ikke endret.
- **Nettsider har ikke noe flette-skript eller noen demo-gren.** Leveransen er derfor PR-en mot main, som K-teksten sier.
- **HawkScan** er ikke kjørt, fordi det ikke finnes noen HAWK_API_KEY.

## Forhåndsvisning

Admin bygges av Workers Builds med `npx wrangler preview -c sites/admin/wrangler.jsonc` (`docs/hosting.md`).
Da PR-en ble laget, sto bare «Workers Builds: sngroup» og «Manifest, bilder, bygg og test» som sjekker, og ingen lenke til forhåndsvisning av admin var postet.
Cloudflare har postet forhåndsvisningen av grenen for Pages-prosjektet sngroup-nettsider: https://claude-k469-admin-resten.sngroup-nettsider.pages.dev
(commit 28c4761: https://4692158c.sngroup-nettsider.pages.dev). Admin står bak Cloudflare Access og har ingen egen forhåndsvisning på PR-en,
så det er skjermbildene under som viser Admin-sidene.

## Tester

- `npm test`: 268 tester grønne, og lenkesjekken gir 1144 forespørsler med 0 feil. Admin svarer 200 på 88 interne adresser.
- Ny testfil `scripts/admin-k469.test.mjs` (står i `npm test`). Den dekker:
  - Migreringene 0001–0003 kjører lokalt, og Oppstart kan kobles til K-272 uten 0004.
  - Tilgang for eier, support og ingen rolle (26-001 og ADM-403). Support ser kundene uten beløp.
  - `utenInnlogging` og `utenBelop`.
  - Menyen, og at /stotte og /fakturering ikke er «Kommer».
  - Frist-stopp ved «Venter på kunde», kvarter-avrunding, internt notat aldri i kundevisningen, 15 % påslag (412 → 473,80 kr), KPI (8 134 → 8 386 kr) og PowerOffice av uten nøkler.
- Det som allerede var testet, er fortsatt grønt i `admin-fase-b` og `admin-fase-c`:
  - svarfrist, frist-stopp gjennom API-et og kvarter i tidtaker;
  - vernet på /api/hjelp og internt notat;
  - fakturakjøringen: Granlund 29 860, Strand 9 290, Aune 8 134, Vestby 5 290 og Nordli 13 234 kr;
  - KPI og PowerOffice med og uten nøkler.
  `admin-fase-b` og `admin.test` er oppdatert til menyen og support-tilgangen i K-469.
- `npm run build -w sites/admin`: grønn (43 sider).
- `npx wrangler deploy --dry-run -c sites/admin/wrangler.jsonc`: grønn.
- `node scripts/hengsel-regler.mjs sites/admin`: «ingen fargeverdier utenfor den delte fila, og ingen mørk modus».

## Skjermbilder

`claude/k469-skjermbilder/` har 27 bilder, laget med `node scripts/skjermbilder-k469.mjs`.
Skriptet sjekker også at det ikke er konsollfeil, mislykkede forespørsler eller sidelengs rulling.

- **1440, alle nye sider**: Oversikt, SB1, SB2, SB3, SO1, SO2, SC1–SC4, ST1, SD1, SD2 (lenker, kontoer, frister, rutiner), Kunder (support), «Ingen tilgang» (support) og 26-001 «Ingen tilgang».
- **390**: SB1 og SB2 som eier og som support, og SO2.

## Sikkerhet og grenser

- Ingen prod, ingen fletting til main, ingen D1 remote og ingen `wrangler deploy`.
- Ingen nøkler, og ingen e-post eller fakturaer er sendt.
- `sites/hengsel`, `vis`, `sngroup`, `byggem` og `design`, `packages/`, workflowene, DNS og Access er ikke rørt.
- Bare tokens fra `packages/hengsel-tokens/tokens.css`, med paletten `[data-produkt="admin"]`.

K-469 KLAR
