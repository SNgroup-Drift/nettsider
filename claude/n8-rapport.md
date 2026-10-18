# N-8 · Hengsel på telefon (18.10.2026)

Gren `claude/n8-telefon` fra `origin/main` (PR #93, N-7, er flettet). HawkScan hoppet over. Ikke pinnet på nytt, ikke rørt: `packages/`, `sites/design/`, `wrangler.*`, workflows.

## Levert
- **/telefon** (`sites/hengsel/src/pages/telefon.astro`, tekster i `content/telefon.ts`): toppen med tre telefoner (CRM i nettleseren, Ute på iPhone, Ute på Android) og én setning under hver · «CRM-et på telefon» og «Kundeportalen på telefon» (`telefon/*`) · «Appen gjør mer» (tabell, ja/nei/delvis med hake, lukk og en strek for delvis, bare tokens) · «Hengsel Ute» (ni skjermer lys, iPad lys og mørk, ni skjermer mørk) · «Android» med plassholderen «Kommer i App Store og Google Play» (ingen lenke) · «Prøv i nettleseren nå» → demo.hengsel.no og kontakt.
- **Komponenter:** `Enhet.astro` utvidet med `type="android"` (nøytral ramme, hullkamera, ingen merke); nye `NettleserTelefon.astro` (iPhone med adresselinje), `Telefonrad.astro`, `PaaTelefon.astro`; `Statusflis.astro` fikk valgfri `lenke`.
- **Produktsider:** «På telefon» med ett bilde og lenke til /telefon på /crm, /ute og /kundeportal; forsidens tre produktkort har «På telefon ›». Sigdal-utgaven (/kunde/sigdal) viser ikke seksjonen eller lenken, fordi /telefon ikke finnes der.
- **vis.hengsel.no/reise:** «Telefon»-knapp (bytter også tilbake til Studio Display) som bytter rammen til iPhone og viser `vis/skjermbilder/<navn>-telefon`, ellers plassholder. Samme scene, samme rekkefølge.
- `npm test` grønn (225 pass, 0 feil; lenkesjekk 892 forespørsler, 0 feil). `scripts/skjermbilder-n8.mjs` sjekker i nettleser: ingen konsollfeil, ingen vannrett rulling på 390, ingen style-attributter i HTML, symboler definert én gang, Telefon-knappen, Sigdal uten lenke.
- Skjermbilder 1440/390 i `claude/n8-skjermbilder/` (telefon, forside, /ute «På telefon», reise med telefon). **Bibliotekbilder vises ikke i sandkassen** (bilder.hengsel.no nås ikke): rammene står uten bilde eller med «Skjermbilde kommer».

## Valg jeg tok (sjekk)
1. **Nøkkelnavn i biblioteket.** `app/ute-*` finnes ikke; Ute-skjermene ligger som `vis/skjermbilder/ute-*` (lys og `-mork`), `app/` har bare `idag/jobben/ks/avvik/punkter/ferdig/uten-nett-lys`. Ni-skjerm-raden bruker `vis/skjermbilder/ute-*`: i-dag, jobb-under, laser, ks, ks-kamera, avvik, punkter, punktkort, ferdig (ute-typeskilt er liggende 1688×780 og passer ikke i telefonramme). Mørkt = samme navn med `-mork`; iPad = `ute-ipad-bildeverktoy[-mork]`. Alle finnes i manifestet.
2. **Android-rammen bruker `vis/skjermbilder/ute-*`, ikke `app/`.** `app/`-bildene har iOS-klokke og Dynamic Island i selve bildet, som ville stått i en Android-ramme. `vis`-bildene har ingen statuslinje, så rammen tegner en nøytral. Bytt til `app/` ved å endre `content/telefon.ts` om dere vil.
3. **Tabellen «app mot web»:** ja/nei/delvis er mitt forslag, ikke fra produktteamet. Eirik må sjekke særlig varsler, GPS, hjemskjerm og iPad (delvis i nettleser) og «Oppdateres selv» (nettleser ja, app delvis).
4. Delvis-ikonet er en strek i samme stil som hake/lukk (systemet har ikke ett).
5. **Tester utvidet:** `scripts/skjermbilder-bibliotek.test.mjs` godtok bare `app|apptest|hjelp|vis`; `telefon` er lagt til (to regex). Utenfor «Gjelder», men nødvendig for nøklene `telefon/*`.
6. Nettleserrammene viser adressen `demo.hengsel.no`. Bunnmenyen i CRM-bildene er det K-228b skal ta.
7. Ikke lagt i hovedmenyen; `public/sitemap.txt` ikke endret (utenfor Gjelder, legg til `/telefon` når siden går live). `enhetsrammer.test.mjs` kjenner ikke /telefon ennå.

## Nye nøkler (i `KJENTE_MANGLER`, «N-8: tas av K-228b (390 px) i hengsel-crm»)
`telefon/crm-min-dag`, `telefon/crm-kunder`, `telefon/crm-ordre`, `telefon/crm-saker`, `telefon/crm-mer`, `telefon/portal-tilbud`, `telefon/portal-levering`; `vis/skjermbilder/crm-tilbud-telefon`, `…/crm-tilbud-kunde-telefon`, `…/crm-ordre-kontrollmal-telefon`, `…/crm-montasje-telefon`, `…/crm-etterkalkyle-telefon`.

## Bestilling til K-228b (hengsel-crm)
Alle 12 filer: **390 px bredt, tema hengsel (og sigdal), lys**, nettleser-skjermbilde uten statuslinje og uten adresselinje (rammen tegner dem), som `webp` i samme format og med samme @1x/2× som `vis/skjermbilder/crm-tlf-*` (780×1688).
- `telefon/crm-min-dag`, `crm-kunder`, `crm-ordre`, `crm-saker`: v5-skjermene Min dag, Kunder, Ordre, Saker i CRM på telefon (nettleser). `telefon/crm-mer`: Mer-arket åpent.
- `telefon/portal-tilbud`, `telefon/portal-levering`: kundeportalen, tilbudet og leveringen.
- `vis/skjermbilder/crm-tilbud-telefon`, `crm-tilbud-kunde-telefon`, `crm-ordre-kontrollmal-telefon`, `crm-montasje-telefon`, `crm-etterkalkyle-telefon`: samme ruter som de eksisterende PC-bildene (`crm-tilbud`, `crm-tilbud-kunde`, `crm-ordre-kontrollmal`, `crm-montasje`, `crm-etterkalkyle`) i 390 px.
- Ute-skjermer finnes alt under `app/` og `vis/skjermbilder/ute-*`. Fjern nøklene fra `KJENTE_MANGLER` når de er i manifestet (testen sier fra).

N-8 KLAR
