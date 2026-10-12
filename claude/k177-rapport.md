# K-177 · Fiktive skjermer på alle nettsidene (hengsel.no, vis, sngroup.no, byggem.no)

Gren `claude/k177-fiktive-skjermer`, laget fra `origin/main` (PR #49 / K-174 er flettet) med `origin/claude/hengsel-merke-v3` flettet inn (motion, og:image, butikkgrafikk). Kilden til skjermene er `SNgroup-Drift/innlandet-crm-sync`, gren `claude/hengsel-merke-v3`, `docs/design/v4/{crm,hengsel}` (bare lest). Ingen ekte skjermbilder er tatt fra CRM eller apper, og ingen passord eller nøkler er brukt.

## Kort fortalt
- Alle CRM-, kundeportal-, dokument- og app-skjermer i Visningsrommet (vis), på sngroup.no og på hengsel.no /apptest og /ute er nå gjengitt fra designfilene (*.dc.html) med Playwright, med det nye merket: kundens logo øverst («Din logo» / «Butikknavn Hamar»), `crm-aksent` lite nederst i CRM-menyen, ingen «by Hengsel», ingen egen statuslinje i bildene (rammen tegner den én gang).
- 60 skjermer × lys/mørk (der designet har mørk) × 1× og 2× = 215 webp-filer. Alt lages av `scripts/fiktive-skjermer.mjs` (kan kjøres på nytt).
- Navn på leverandører og merker byttes til nøytrale navn før bildet tas (Hovedleverandør A/B/C, Hvitevaremerke X/Y/Z, Lasermåler A/B/C, Armaturleverandør). Skriptet feiler hvis et forbudt ord (Sigdal, HTH, Bosch, Siemens, Nobia, Elkjøp, Electrolux, AEG, Tapwell m.fl.) står igjen i teksten i en ramme.
- Versjonen nederst i CRM-menyen er **`v. 1.7.0`** i alle skjermene, lest fra `sites/hengsel/src/apptest-lenker.ts`. «v. 4.2» og «v. 1.4.0» fra designet brukes ikke. (hengsel.no sin egen `CrmSkjerm` leste allerede den samme verdien.)
- Motion-videoen brukes på /ute og /apptest (lazy, autoplay, muted, loop, playsinline; bare plakaten ved redusert bevegelse).
- 72 gamle filer som ikke lenger brukes er fjernet (liste under).
- Kvalitet: `npm run build` OK, `npm test` 42/42 + lenkesjekk 603 forespørsler 0 feil, `scripts/skjermbilder.mjs` 0 feil, axe color-contrast 0 brudd på 160 visninger, Lighthouse mobil 98 / 99 / 98, CLS 0 på hengsel.no. Se «Kvalitet» for det som gjenstår i vis og sngroup (fantes fra før).

PR: se linken i meldingen under. Eirik fletter.

## Hva er gjort

### Kilder og gjengivelse
| Fra | Til |
|---|---|
| `crm/eksport/CRM sju skjermer` (Min dag, Bestilling, Etterkalkyle, Montasje, Saker, Salgstavle, Resultater, Min dag iPad) | `crm-min-dag`, `crm-bestilling`, `crm-etterkalkyle`, `crm-montasje`, `crm-saker`, `crm-salgstavla`, `crm-resultater`, `crm-ipad-min-dag` |
| `crm/10 Tilbud`, `18`, `50`, `hengsel/32` | `crm-tilbud`, `crm-tilbud-kunde`, `crm-ordre-kontrollmal`, `crm-moduler`, `crm-mal-skisser` |
| `crm/17 Besluttet`, `18`, `16`, `30` (A10 telefonmenyen) | iPad og telefon: `crm-ipad-*`, `crm-tlf-*`, `crm-meny-apen` |
| `crm/15 Kundeportalen` (K03–K14, KP1) | `kundeportal-*`, `portal-*` |
| `crm/65 Dokumenter slik lages det` (D1–D12, lys + mørk) | `d1-…` til `d12-…` (Studio Display 16:9, 1440 × 810) |
| `hengsel/36 Hengsel montor v2`, `31`, `crm/18 H3.13` | `ute-*`, `ute-ipad-bildeverktoy`, og rollene på /apptest |

- Designfilene henter React/Babel fra unpkg og skrifter fra Google Fonts (stengt). Skriptet svarer med pakkene fra npm (`NPM_DIR`) og Inter/Newsreader fra repoet. TWK Lausanne ligger i designmappa. Siden åpnes fra lokal server (ikke fra disk).
- Feil i designfila: `40 E-post fra appen` har «<kundeportal@…>» uten escape, og React stopper. Rettes i svaret fra den lokale serveren, ikke i designfila. (40 gir ikke egne bilder i denne PR-en; de brukes ikke på nettsidene.)
- **Mørk utgave**: designets egne mørke rammer brukes der de finnes (D1–D10, Min dag-menyen A10.2, Ute «I dag» og «Jobb»). For andre CRM- og Ute-skjermer byttes fargene etter 07 Lys og mørk (fargeparene fra eksempelet «07.1 Fakturaer › Inngående»: tekst, flate, kort, valgt rad, ytterkant, dempet tekst; merket byttes fra `-lys` til `-mork`). **Kundeportal, PDF og e-post er alltid lyse** (07 «Regler»), og har derfor ikke mørk utgave.
- **PC-skjermene** er 1440 × 900 (16:10) i designet, men Studio Display-rammen i vis er 16:9. `<navn>.webp` er vinduet skalert til 90 % og midtstilt på en 16:9-flate i skjermens farge, slik at **hele menyen med merket nederst** vises (før ble bunnen beskåret). `mb-<navn>.webp` er hele 16:10 til MacBook-rammen.
- Telefon: designets 09:41-rad og eget island skjules i selve bildet, så statuslinje og Dynamic Island bare vises én gang (av rammen: iPhone 18-bezelen i vis og sngroup, `Enhet` på hengsel.no). Ute-skjermene fra `36` hadde det gamle app-ikonet med «Hengsel UTE ✓» i toppen; det er byttet med «Din logo».
- Filnavn: `<navn>.webp` lys 2×, `<navn>@1x.webp` lys 1×, `<navn>-mork.webp` og `<navn>-mork@1x.webp` mørk. Filnavnene er beholdt der skjermen finnes i designet; 2× er 2880 × 1620 (PC), 2360 × 1640 (iPad), 780 × 1688 (telefon). `width`/`height` settes på alle bildene (bygg.mjs for vis, `Enhet` for sngroup, `hd`-prop for hengsel).

### Visningsrommet (sites/vis)
- 56 skjermer (CRM PC/iPad/telefon, kundeportal, Ute, D1–D12) byttet. `bilder.js` velger lys/mørk (system eller `data-theme`), 1×/2× som `srcset`, og setter mål fra bygget.
- «Slik lages det» (`packages/design/src/dokumenter/lages.js`, bare `bilde` og `alt`): Tilbud → D1 og D10, Kjøpsavtale → D2b og D2a, Ordrebekreftelse → D3, Anbud → D4, Monteringsrapport → D5, Punktrapport → D6, FDV → D7 og D11, Montasjeplan → D8, Faktura → D9. D12 er laget, men ingen steg viser den.
- Romkort, flater og hero (`rom-*`, `flate-*`, `forsta-*`, `hero*.webp`) er laget på nytt med `npm run rammer:vis`. Rom uten skjermbilde fra designet (`skjermbilder-vis.mjs`) er tatt på nytt, nå med nøytrale leverandørnavn i selve bildet.
- CRM-rommet: telefonen viser nå Ordre og telefonmenyen (A10).
- Dokumentmalene (A4) rendres fra felles data i `packages/design/src/dokumenter` og stemmer i oppbygging med `A4Side`, 41 og 43: «Din logo | Butikknavn Hamar» øverst, `hengsel-lys.svg` 3 mm nederst til høyre, sidetall. Tallene og teksten i dokumentene er fra de felles dataene og er ikke endret.

### hengsel.no
- /apptest: de fire heroskjermene (I dag, Jobben, KS, Ferdig) og montørrollen (Avvik) bruker nå designets iOS-skjermer (`img/app`, de samme som på /ute). Firmaleder (Godta eller Bestrid), utkjører (Rute for dagen) og lager (Mottak) hadde ekte TestFlight-skjermbilder («Kari Demo» osv.) og er gjengitt fra designet (2× og 1×, lys og mørk). Rammen tegner statuslinje og island én gang (`utenStatus` er fjernet). Alt-tekstene for firmaleder og montør er byttet til det bildene viser.
- /ute: iPad-bildet (`ipad-bildeverktoy-laser.webp`, var «dagens skjermbilde fra repoet») er gjengitt fra designet. Telefonskjermene (`img/app`) kommer fra designets `hengsel.no/ios` via `Enhet`, uendret fra K-174.
- Forsiden, /crm, /kundeportal, /slik-virker-det, /dokumenter, /integrasjoner og /priser-og-demo viser CRM, portal og dokumenter som HTML (`CrmSkjerm`, `PortalSkjerm`, A4), ikke som bilder, og er allerede fiktive (K-174). Ingen endring nødvendig utover det over.
- Motion: `public/media/ute-motion-1080x1080.{webm,mp4}` + plakat (webp, 8 kB) fra `brand/hengsel-merke/motion/`. Komponent `UteMotion.astro` + `scripts/motion.ts`: `autoplay muted loop playsinline preload="none"`, kildene settes inn først når videoen er nær skjermen (på /ute lastes ikke videoen før «Bli tester»-feltet nærmer seg), og ved `prefers-reduced-motion` settes ingen kilder og autoplay fjernes (bare plakaten). Målt i Chromium: /ute ruller først, så spiller webm; redusert bevegelse gir bare plakaten. På /apptest står videoen i heroen (i stedet for den lille app-flisen).

### sngroup.no og byggem.no
- sngroup.no (Hengsel-delen): `ute-i-dag`, `ute-jobb-under`, `ute-ks`, `portal-tilbud` og `crm-tilbud` er byttet til de samme fiktive skjermene (webp, 1×/2×, mørk der den finnes).
- **byggem.no har ingen Hengsel-skjermbilder og ingen familieseksjon med Hengsel** (grep etter «hengsel» i `sites/byggem/src` gir ingen treff, og `public/` har bare logoer og delingsbilde). Ingenting å bytte.

## Fjernet (brukes ikke lenger)
- `sites/hengsel/public/img/`: `crm-bestilling`, `crm-etterkalkyle`, `crm-montasje`, `crm-resultater`, `portal-tilbud`, `ramme-ipad`, `ramme-iphone`, `ramme-macbook`, `ute-avvik`, `ute-ferdig`, `ute-i-dag`, `ute-ipad-bildeverktoy`, `ute-jobb-under`, `ute-ks`, `ute-laser`, `ute-punkter`, `ute-punktkort`, `ute-typeskilt` (alle .webp, ikke referert noe sted).
- `sites/hengsel/public/img/apptest/`: `idag`, `jobben`, `ks`, `ferdig` (lys og mørk; ekte skjermbilder). 
- `sites/sngroup/public/skjermbilder/`: alle 45 PNG-er (35 + 11 i `display/`; bare 5 av dem var i bruk, og de er erstattet av webp).
- vis: ingen filer fjernet; alle 45 gamle skjermbilder er overskrevet med samme navn, og 4 `mb-`-filer er beholdt.

## Tabell per bilde (gammelt → nytt, kilde i designet)
Mål er 2× lys (PC: 16:9-flaten). «Kilde» er designfil · skjerm i `docs/design/v4`.

| Bilde | Brukes på | Type | Gammelt | Kilde i designet | Mål | Utgaver |
|---|---|---|---|---|---|---|
| `crm-min-dag` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-min-dag | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-bestilling` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-bestilling | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-etterkalkyle` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-etterkalkyle | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-montasje` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-montasje | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-saker` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-saker | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-salgstavla` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-salgstavla | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-resultater` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-resultater | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-tilbud` | vis + sngroup.no | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/10 Tilbud` · T01.1 Tilbudslista | 2880 × 1620 | lys + mørk |
| `crm-tilbud-kunde` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/10 Tilbud` · T08.1 Tilbud og kunde | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-ordre-kontrollmal` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/18 Kontrollmal befaring belastninger` · H3.1 Ordre › Kontrollmål | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-moduler` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/50 Moduler og punktrapport` · I31 Moduler (superadmin) | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-mal-skisser` | vis | PC 1440 × 900 (16:9-flate) | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `hengsel/32 Mal og skisser` · C01 Ordre › Mål og skisser | 2880 × 1620 (mb-: 2880 × 1800) | lys + mørk |
| `crm-ipad-min-dag` | vis | iPad 1180 × 820 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/eksport/CRM sju skjermer` · eksport crm-min-dag-800 | 2360 × 1640 | lys + mørk |
| `crm-ipad-leder` | vis | iPad 1180 × 820 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/17 Besluttet 07.10` · B4.4 Leder på iPad og telefon | 2360 × 1640 | lys + mørk |
| `crm-ipad-kontrollmal` | vis | iPad 1180 × 820 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/18 Kontrollmal befaring belastninger` · H3.5 Utfylling på iPad og telefon | 2360 × 1640 | lys + mørk |
| `crm-ipad-belastninger` | vis | iPad 1180 × 820 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/18 Kontrollmal befaring belastninger` · H3.12 Belastninger på iPad | 2360 × 1640 | lys + mørk |
| `crm-ipad-innstillinger` | vis | iPad 1180 × 820 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/17 Besluttet 07.10` · B5.3 Innstillinger på iPad og telefon | 2360 × 1640 | lys + mørk |
| `crm-tlf-min-dag` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/16 Inngaende faktura` · OP4 Min dag på telefon | 780 × 1688 | lys + mørk |
| `crm-tlf-ordre` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/16 Inngaende faktura` · EK3 Etterkalkyle på telefon | 780 × 1688 | lys + mørk |
| `crm-tlf-kundekort` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/18 Kontrollmal befaring belastninger` · H3.9 Befaring på iPad og telefon (ramme 2) | 780 × 1688 | lys + mørk |
| `crm-tlf-leder` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/17 Besluttet 07.10` · B4.4 Leder på iPad og telefon (ramme 2) | 780 × 1688 | lys + mørk |
| `crm-tlf-kontrollmal` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/18 Kontrollmal befaring belastninger` · H3.5 Utfylling på iPad og telefon (ramme 2) | 780 × 1688 | lys + mørk |
| `crm-tlf-innstillinger` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/17 Besluttet 07.10` · B5.3 Innstillinger på iPad og telefon (ramme 2) | 780 × 1688 | lys + mørk |
| `crm-meny-apen` | vis | telefon 390 × 844 | Gammelt Hengsel-merke øverst i menyen, 09:41-statuslinje i selve bildet | `crm/30 Telefon og iPad` · A10.1 Menyen åpen, lys | 780 × 1688 | lys + mørk |
| `kundeportal-k03` | vis | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K03 Mine kjøp | 780 × 1688 | lys (alltid lys i designet) |
| `portal-tilbud` | vis + sngroup.no | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K04 Tilbudet | 780 × 1688 | lys (alltid lys i designet) |
| `kundeportal-k06` | vis | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K06 Oppgraderinger | 780 × 1688 | lys (alltid lys i designet) |
| `kundeportal-k08` | vis | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K08 Kjøpsavtalen | 780 × 1688 | lys (alltid lys i designet) |
| `portal-levering` | vis | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K10 Bekreft leveringsdag | 780 × 1688 | lys (alltid lys i designet) |
| `portal-montering` | vis | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K12 Bekreft montering | 780 × 1688 | lys (alltid lys i designet) |
| `portal-fdv` | vis | telefon 390 × 844 | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · K14 Ditt nye kjøkken | 780 × 1688 | lys (alltid lys i designet) |
| `kundeportal-pc` | vis | PC, hel side | Gammelt «Hengsel»-merke i toppen og «Levert med», 09:41 i bildet | `crm/15 Kundeportalen` · KP1 Mitt kjøkken | 2884 × 4190 | lys (alltid lys i designet) |
| `ute-i-dag` | vis + sngroup.no | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV1.3 Meld ferdig montert | 776 × 1684 | lys + mørk |
| `ute-jobb-under` | vis + sngroup.no | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV4.1 Jobb · Under | 776 × 1684 | lys + mørk |
| `ute-ks` | vis + sngroup.no | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV16.1 KS · kamera avbrutt | 776 × 1684 | lys + mørk |
| `ute-ks-kamera` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV16 KS · OK åpner kameraet | 776 × 1684 | lys + mørk |
| `ute-avvik` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV17 Meld avvik · arket | 776 × 1684 | lys + mørk |
| `ute-punkter` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV14 Punktliste · kunde | 776 × 1684 | lys + mørk |
| `ute-punktkort` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV15 Løse et punkt | 776 × 1684 | lys + mørk |
| `ute-ferdig` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV5.3 Oppsummering | 776 × 1684 | lys + mørk |
| `ute-typeskilt` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV19.8 Hvitevarer · lagret | 776 × 1684 | lys + mørk |
| `ute-laser` | vis | telefon 390 × 844 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV13.1 Laser · søker og funnet | 776 × 1684 | lys + mørk |
| `ute-ipad-bildeverktoy` | vis | iPad 1180 × 820 | Gammelt Hengsel Ute-ikon med «UTE ✓» i toppen, 09:41 og island i selve bildet (dobbelt med rammen) | `hengsel/36 Hengsel montor v2` · MV18 Bildeverktøy på iPad 1180 | 2356 × 1636 | lys + mørk |
| `foresporsler` | hengsel.no /apptest | telefon 390 × 844 | Ekte TestFlight-skjermbilde («Kari Demo», «Tuva Demo») | `crm/18 Kontrollmal befaring belastninger` · H3.13 Firmaleder i Hengsel: Godta eller Bestrid | 780 × 1688 | lys + mørk |
| `ruten` | hengsel.no /apptest | telefon 390 × 844 | Ekte TestFlight-skjermbilde («Kari Demo», «Tuva Demo») | `hengsel/31 Utkjorer-app` · U02.2 Rute for dagen | 776 × 1684 | lys + mørk |
| `mottak` | hengsel.no /apptest | telefon 390 × 844 | Ekte TestFlight-skjermbilde («Kari Demo», «Tuva Demo») | `hengsel/36 Hengsel montor v2` · LG1 Mottak | 776 × 1684 | lys + mørk |
| `ipad-bildeverktoy-laser` | hengsel.no /ute | iPad 1180 × 820 | Skjermbilde fra repoet med laseren omdøpt | `hengsel/36 Hengsel montor v2` · MV18 Bildeverktøy på iPad 1180 | 2356 × 1636 | lys (alltid lys i designet) |
| `d1-lag-pdf-og-send` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d1-lag-pdf-og-send-lys | 2880 × 1620 | lys + mørk |
| `d2a-signer-med-bankid` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d2a-signer-med-bankid-lys | 2880 × 1620 | lys (alltid lys i designet) |
| `d2b-signert` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d2b-signert-lys | 2880 × 1620 | lys + mørk |
| `d3-send-ordrebekreftelse` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d3-send-ordrebekreftelse-lys | 2880 × 1620 | lys + mørk |
| `d4-lag-tilvalgsliste` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d4-lag-tilvalgsliste-lys | 2880 × 1620 | lys + mørk |
| `d5-lag-monteringsrapport` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d5-lag-monteringsrapport-lys | 2880 × 1620 | lys + mørk |
| `d6-lag-punktrapport` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d6-lag-punktrapport-lys | 2880 × 1620 | lys + mørk |
| `d7-lag-leveringspakke-fdv` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d7-lag-leveringspakke-fdv-lys | 2880 × 1620 | lys + mørk |
| `d8-skriv-ut-plan` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d8-skriv-ut-plan-lys | 2880 × 1620 | lys + mørk |
| `d9-lag-faktura` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d9-lag-faktura-lys | 2880 × 1620 | lys + mørk |
| `d10-sendt-til-kunden` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d10-sendt-til-kunden-lys | 2880 × 1620 | lys + mørk |
| `d11-min-side-nytt` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d11-min-side-nytt-lys | 2880 × 1620 | lys (alltid lys i designet) |
| `d12-e-postvarsel` | vis | PC 1440 × 810 | Eldre CRM-skjerm brukt som «Slik lages det» (ikke D-skjermen) | `crm/65 Dokumenter slik lages det` · eksport d12-e-postvarsel-lys | 2880 × 1620 | lys (alltid lys i designet) |

Alle gamle bilder viste enten det gamle merket (Hengsel-ordmerke i menyen/toppen), «by Hengsel»/«Levert med», en egen 09:41-statuslinje oppå rammens island, eller (på /apptest) ekte TestFlight-data. De nye viser ingen av delene. De fire rom-bildene for rom uten design (`rom-system` m.fl.) er skjermbilder av vis-sidene selv og er tatt på nytt med nøytrale navn.

## Før og etter
Skjermbilder (webp, 390 og 1440 px, lys og mørk, hele siden opp til 5000 px) i `claude/k177-skjermbilder/for/` (origin/main) og `claude/k177-skjermbilder/etter/` for hengsel.no (/, /ute, /apptest, /crm, /kundeportal, /dokumenter), vis (/, /crm/, /dokumenter/, /reise/, /minside/) og sngroup.no (/). Filnavn: `<side>-<bredde>-<lys|mork>.webp`.

## Kvalitet
| Sjekk | Resultat |
|---|---|
| `npm run build` | OK |
| `npm test` | 42/42, lenkesjekk 603 forespørsler 0 feil (nå også alle bilder og videoer sidene peker på, inkl. `data-bilder`, `srcset`, `poster`) |
| `scripts/skjermbilder.mjs` (alle sidene, 390/1440, lys/mørk) | 0 feil |
| `scripts/skjermbilder-vis.mjs` | 30 sider × 6 visninger, 0 feil |
| `scripts/kvalitet-k177.mjs` (nytt): 160 visninger, ingen konsollfeil, ingen vannrett rulling, `width`/`height` på bilder, axe color-contrast | **axe: 0 brudd** |
| Lighthouse mobil (Chromium, simulert throttling) | forsiden **98**, /ute **99**, /apptest **98** (ytelse); tilgjengelighet 100, beste praksis 100; SEO 100/100/69 (/apptest er noindex med vilje). LCP 2,1–2,4 s |
| CLS hengsel.no | **0** på alle sidene (høyst 0,0001 på /kundeportal 1440, demoen som skiftes med skript) |

**Fantes fra før og er ikke løst her** (samme sider hadde det på origin/main, se `kvalitet-for`): CLS i vis (sider som bygger kort/innhold med skript, f.eks. /rom/, /butikken/, /opplaering/, /prosjekt/ på 390 px, 0,0–0,6) og 0,002–0,003 i sngroup.no (tekst som skifter når skriften lastes). Bilder uten `width`/`height` i vis (romkort, skjermer) og sngroup er rettet her, så de er ikke lenger en årsak. Antall visninger med problem: vis 60 → 20, sngroup 4 → 3, hengsel 0 → 0 (bortsett fra 0,0001 over).

## Må avklares / åpent
1. **«Nobia» står som tekst i vis** (rolle- og undersidetekster, `/sv/`, `/en/`, systemkart, veikart, `rom.js`). Tekster er ikke endret (utenfor oppgaven). Bildene viser ikke navnet. Si fra om det skal byttes til «Hovedleverandør».
2. **Navn i designet**: personnavn er generiske oppdiktede navn (Kari Nordmann, Eva Berg, Siri Selger, Tuva Skinnrud, Pål Prøvesen …) fra designfilene. Jeg har ikke funnet navn jeg kan knytte til virkelige personer, men «ekte personnavn» kan ikke avgjøres av et skript; kontrollen mot ord står i `FORBUDT` i `scripts/lib/design.mjs` og kan utvides. Tekstene i alle 108 rammer ligger i en kjøring med `TEKST=fil.json` om du vil lese dem.
3. **Mørk utgave for CRM og Ute er laget med designets fargepar, ikke tegnet av Design.** Noen skjermer (Ute-lister med bildeflater) kan se litt annerledes ut enn en ekte mørk tegning. Kundeportal, PDF og e-post er lyse i begge moduser, etter 07.
4. **Valg av skjerm der navnet ikke finnes i designet**: iPad-bildene `crm-ipad-leder/kontrollmal/belastninger/innstillinger` og telefon `crm-tlf-*` er hentet fra 17 og 18 (Leder, Kontrollmål, Belastninger, Innstillinger, Befaring) og 16 (Min dag, Etterkalkyle). `crm-tlf-kundekort` viser Befaring på ordren (ingen kundekort-skjerm på telefon i v3-pakken). Alt-tekstene i vis er ikke endret; filnavnene kan stå noe misvisende.
5. `crm-meny-apen` (A10, telefonmenyen åpen, lys og mørk) er med som nytt bilde i CRM-rommet.
6. Det som ikke er gjort: app-lenkene (`.well-known`) er ikke rørt (K-170). Ekte skjermbilder tas senere i K-170 hvis ønsket.

## Slik kjøres det på nytt
```
mkdir -p /tmp/crm-npm && cd /tmp/crm-npm && npm init -y && npm i react@18.3.1 react-dom@18.3.1 @babel/standalone@7.29.0
NPM_DIR=/tmp/crm-npm DESIGN=/sti/til/innlandet-crm-sync/docs/design/v4 node scripts/fiktive-skjermer.mjs        # alle, eller navn som argument
npm run rammer:vis && npm run build            # romkort, flater og hero
AXE_PATH=…/axe.min.js node scripts/kvalitet-k177.mjs
```
Chromium: `/opt/pw-browsers/chromium` (eller `CHROMIUM_PATH`). Skriptene: `scripts/fiktive-skjermer.mjs`, `scripts/lib/design.mjs`, `scripts/kvalitet-k177.mjs`.

K-177 KLAR
