# N-7e – Ny pin: designsystem 2.13 (K-388 Statusrad) inn på nettsidene

Gren `claude/n7e-design-2-13` bygget oppå `origin/claude/n7d-design-2-12` (#101 er ikke i main ennå); `origin/main` er flettet inn (alt i main var allerede med). Dagsøkt 19.10.2026 kl. 07.20, skrevet av Code. Ingen spørsmål stilt, valgene står her. HawkScan hoppet over (ingen nøkkel; statiske sider). Ingen subagenter. Ikke flettet, ikke deployet.

## Kort
- **Pin: `40ea84f39aee4e3e4caa9d6e16d37a85fe2cd7ff`** i hengsel-crm (K-388), designsystem 2.13. Tokens uendret (2.12.0): diff på `tokens.css` og `tokens-mork-prover.css` er bare commit-kortsha i toppkommentaren. 860 filer fra commiten (885 i `ds` med palett- og merkepakke).
- Ikonmappa har 82 ikoner (77 + `status-ny/-pagar/-sannsynlig/-ferdig/-ingen`), 12 px av `prisavvik` og `stoppet` er kommet til, og `status-ikon.json` (versjon 2.13) kom med uten endring i `hent-designsystem.mjs` (regelen for `ikoner/` tok den).
- `npm test`: 262 tester, 261 bestått, 0 feilet, 1 hoppet over (fra før); lenkesjekken grønn; alle sider bygger.

## Per punkt
1. **Pin.** `npm run design:hent -- --kilde <hengsel-crm> --commit 40ea84f3…`. Den fulle sha-en (ikke «07e33401f» fra demo, som ikke lot seg hente som forkortet sha) ble hentet direkte.
2. **Sider.**
   - design.hengsel.no/komponenter: nytt kort **Statusrad** (Min dag › Trenger deg, tabell for PC og kortliste for telefon, lys og mørk). Bygget fra strukturen i `components/Statusrad/preview.html`, men uten Designs hex og inline-stiler: stilen er felles og leser bare variabler. «Sigdal» i eksempelteksten er byttet til «Leverandør A» (design-testen forbyr Sigdal). Ikonrutene og ikonteksten viser de nye ikonene (82, «ny i 2.13»).
   - Felles kode: `packages/hengsel-tokens/src/statusrad.ts` (kartet, `statusSvg`) og `statusrad.css` (`.statusrad[data-status]`, `.rad-ikon`).
   - hengsel.no-kitet: `Tabellflis` (`rader[].status`) og `Listeflis` (rader som `{ tekst, status }`) får ikonkolonne og radfarge når minst én rad har status, rader uten status får `ingen`; uten status er de som før. `Statusflis` er én pille uten rader og er uendret.
   - Regelen står som nr. 14 i `docs/design/hengsel-regler.md`.
3. **Tester.** `design-fasit` (82 ikoner, 29 nye, 2.13-lista), `n7b` (82), `n7d` (82; pinnen sjekkes generisk, den eksakte commiten ligger i n7e), ny **`n7e.test.mjs`** (pin, `status-ikon.json` i pakken og pinnet, alle ikonene i kartet i 12/16/20/24, `farge` har statustokens, CSS uten fargeverdier og med alle nøkler, kit, kortet på /komponenter). `design-fasit`-skanningen etter forbudte navn leste base64 i c2pa-manifestet i en ny svg og fant tilfeldig «maxbo»; manifestet strippes nå før skanningen.
4. **Skjermbilder** i `claude/n7e-skjermbilder/` (1440 og 390): Statusrad-kortet og statusikonene på design.hengsel.no/komponenter, og Tabellflis/Listeflis med status. Skriptet er `scripts/skjermbilder-n7e.mjs`.

## Valg og avvik
- **Ingen side på hengsel.no har statusrader.** Ingen kit-tabell har en statuskolonne i dag, så jeg la ikke status på noe innhold (det ville vært å finne på). hengsel.no-skjermbildene er tatt av en midlertidig prøveside som bruker kitet (ikke i repoet). Min dag-listen i `CrmSkjerm.astro` (app-illustrasjonen) har fortsatt venstrestreken for haster; den ligger utenfor omfanget og kan få Statusrad i en egen økt.
- **Hover** bruker `color-mix(in oklab, <radfarge> 94%, var(--tekst))` (ca. L −0,03) i stedet for Designs `oklch(from …)`, fordi `hengsel-regler.mjs` forbyr fargefunksjoner i sidene.
- Valgt rad (`aria-selected`, kant 3 px) er i CSS og på design-kortet; kit-radene er ikke valgbare, så den brukes ikke der.
- Tabellkortet på design er vannrett rullbart i de smale prøvepanelene; telefonlista står under.

## Kontroll
Ingen nøkler, passord eller tokens i repo, chat, rapport eller logg. Rørte ikke `sites/vis/`, `sites/admin/`, sngroup.no, byggem.no, workflows eller `wrangler.*`. Ingen hex i sidene (`hengsel-regler` grønn). Ingen app-skjermbilder i repoet. Pin-commit: `40ea84f39aee4e3e4caa9d6e16d37a85fe2cd7ff`.

N-7e KLAR
