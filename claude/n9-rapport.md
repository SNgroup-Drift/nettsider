# N-9 · Produktlogoene på hengsel.no

Dagøkt 18.10.2026 (Eirik, svar B på logoer-produkter-1810). Gren `claude/n9-produktlogoer` fra `origin/main` (#93–#97 flettet). Ikke flettet, ikke deployet.

## Gjort

1. **Produktlogo i toppen på produktsidene.** `Sidetopp.astro` har valgfri prop `produkt` (`crm | ute | admin | levering | kundeportal | telefon`). Med logo (crm, ute, admin, levering): designsystemets produktlogo (aksent, lys), 34 px høy, over tittelen. Uten logo (kundeportal, telefon): Hengsel-symbolet (`merke-hengsel-lys.svg`, aksent, lys) + tekstnavnet «Kundeportal» / «Hengsel på telefon», samme høyde (34 px, tekst 24 px/700). Logoen er pyntet (`alt=""`) når tittelen alt sier produktnavnet (bare /telefon, «Hengsel på telefon.»); ellers `alt` = produktnavnet (/crm «Hengsel CRM», /ute «Hengsel Ute»). På tekstvarianten er symbolet alltid pyntet, og tekstnavnet skjules for skjermleser bare når tittelen sier navnet. Brukt på `/crm`, `/ute`, `/kundeportal`, `/telefon`; andre sider uendret (testet).
2. **«Produktene» på forsiden** som ny `Rad` etter «Samme ordre på alle enheter»: seks fliser (Hengsel CRM, Hengsel Ute, Kundeportal, Hengsel på telefon, Hengsel Admin, Hengsel Levering), hver med logo (24 px) eller symbol + tekstnavn, navn, Eiriks setning (ordrett) og lenke. Lenken («Les mer ›») står øverst til høyre i flisen (tittelfeltet, som «På telefon» i Status-flisene), ikke nederst. CRM → /crm, Ute → /ute, Kundeportal → /kundeportal, Telefon → /telefon, Admin → /for-butikkleder, Levering uten lenke. Tekstene ligger i `content/produkter.ts` (nytt; forsidens øvrige tekster står i `content/forside.ts`). TV er ikke med.
3. **design.hengsel.no/merke:** `FORMER` har radene Kundeportal, Telefon og TV («Logo kommer (Design 2.13) – til da Hengsel-symbol + tekstnavn»; symbolet vises lyst og mørkt, ensfarget-cellene sier «Logo kommer»), og `PLASSERINGER` har to nye rader (produktsidene 34 px, forsiden 24 px). Ingen nye logofiler.
4. **Test:** `scripts/n9.test.mjs` (lagt i `npm test`): a) fire produktsider har `produkt=` og riktig logo/symbol + tekstnavn i den bygde toppen, a2) sider uten `produkt` er uendret, b) seks produktfliser med de seks navnene, i rekkefølge, etter «Samme ordre på alle enheter», lenker som over og alle målsider finnes (`sjekk-lenker.mjs` sjekker i tillegg alle lenker med HTTP), c) /merke har radene og plasseringene. `npm test`: 242 tester, 241 grønne, 1 hoppet over som før; `hengsel-regler` grønn (ingen hex, bare lys modus); alle sider bygger (`npm run build`).
5. **Skjermbilder** 1440 og 390 i `claude/n9-skjermbilder/`: forsiden (Produktene-raden), `/crm` og `/kundeportal` (toppen). Bildene fra bilder.hengsel.no ble blokkert i skjermbildeøkta (ingen nett), så rammene under toppen viser alt-tekst; det er ikke en feil i siden. Ingen app-skjermbilder i repoet utover disse skjermbildene av nettsiden selv.

## Valg jeg tok (ingen spørsmål stoppet meg)

- **`PRODUKTLOGO` har bare nettsider, crm, ute og admin, ikke Levering** (`packages/hengsel-tokens/src/produktlogo.ts`), selv om oppgaven sa at den har alle fem. Jeg rørte ikke pakken (forbudt, ingen ny pin): Levering og Hengsel-symbolet importeres i stedet direkte fra de pinnede filene (`@sngroup/hengsel-tokens/ds/produktlogo/logo-levering-lys.svg` og `merke-hengsel-lys.svg`, byte for byte, via den eksisterende `./ds/*`-eksporten). Når Design/pinnen legger Levering i `PRODUKTLOGO`, kan importen i `content/produkter.ts` byttes.
- **Ny komponent `components/Produktlogo.astro`** og nytt `content/produkter.ts`: begge brukes av både Sidetopp og forsiden, så logikken (logo eller symbol + tekstnavn, høyde, alt) står ett sted. Utenfor «Gjelder»-lista, men innenfor sites/hengsel.
- **Radhøyde «auto»** for Produktene-raden (to rader à tre fliser med to–tre linjer tekst): 120 er for lite og 320 gir mye tom luft. Forklart i en kommentar i `index.astro`.
- **Navnet står to ganger i flisene** (flisens tittel og logoen under), siden oppgaven ber om både logo og navn. Navnet i tittelen er flisens h2; logoen er pyntet (`alt=""`).
- **Endret en eldre test:** `scripts/merkepakke.test.mjs` c) forbød «Hengsel Levering» overalt på hengsel.no (K-212 runde 2: «Levert av Hengsel» i kundeportal-bunnen). Nå unntas bare produktfliska `produkt-levering` på forsiden; regelen gjelder ellers uendret. Eirik bør bekrefte at dette er ment.
- Ensfarget/monokrome produktlogoer er ikke brukt (venter på Eirik, regel 5b).
- I `/merke` vises tekstnavnet bare på den lyse prøveflaten for de tre nye radene (den mørke prøveflaten har ikke tekstfarge i fasiten); symbolet står på begge.

## Ikke gjort / merknader

- **HawkScan hoppet over** (som avtalt i oppdraget).
- Ingen ny pin, ingen nye logofiler, ingen endringer i `packages/hengsel-tokens/`, `sites/vis/`, `sites/admin/`, sngroup.no, byggem.no, workflows eller `wrangler.*`.
- Ingen nøkler, passord eller tokens i repo, rapport eller logg.

N-9 KLAR
