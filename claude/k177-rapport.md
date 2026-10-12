# K-177 · Fiktive skjermer med det nye merket

Dato 12.10.2026. Gren `claude/k177-fiktive-skjermer` (fra `origin/main`, PR #49 og #50 var allerede flettet; `claude/hengsel-merke-v3` er flettet inn: motion-videoene, og:image og butikkgrafikk). Kilden i innlandet-crm-sync (`claude/hengsel-merke-v3`) er bare lest.

## Kort fortalt
- Alle CRM-, portal-, dokument- og app-skjermer på hengsel.no, vis.hengsel.no og sngroup.no er fiktive demo-skjermer fra designfasiten, med det nye merket. Ingen bilder viser det gamle merket, «by Hengsel» eller ekte data. byggem.no har ingen skjermbilder, bare Hengsel-logoen i familieseksjonen (allerede det nye merket fra K-174, byte for byte lik `brand/hengsel-merke/svg/hengsel-aksent-lys.svg`).
- Bildene lages av `scripts/fiktive-skjermer.mjs` (Playwright, Chromium via `/opt/pw-browsers/chromium`). Navn byttes i `scripts/lib/fiktive-navn.mjs`. Versjonen nederst i CRM-menyen er `APPTEST.versjon` (**v. 1.7.0**) fra `sites/hengsel/src/apptest-lenker.ts` på alle bildene, ikke «v. 1.4.0» eller «v. 4.2».
- `npm run build`: grønn. `npm test` (42 tester + lenkesjekk): grønn. `scripts/skjermbilder.mjs`: 0 feil. axe-kontrast: **0 brudd** på alle sider, 390 og 1440 px, lys og mørk (160 målinger). Lighthouse mobil: hengsel.no `/` 99, `/ute` 99, `/apptest` 98; CLS 0 på alle tre.

## 1. Kartlegging (før)
| Nettsted | Bilder | Funn |
|---|---|---|
| hengsel.no | `img/app` (iOS-design, 17), `img/apptest` (14), `img/crm-*`, `img/ute-*`, `img/portal-tilbud` (13 ubrukte), `img/dok-forside.webp`, rammer | CRM, kundeportal og A4-dokumenter på hengsel.no er HTML-komponenter (`CrmSkjerm`, `PortalSkjerm`, `A4Side`) og var allerede fiktive med det nye merket og versjon fra `apptest-lenker.ts`. `img/app` er identiske med designets `ios/` (bare webp-komprimering). **`img/apptest` var ekte app-skjermbilder** med «Demo – ingen ekte kunder», Kari/Ola Demo, adresser og innbakt statuslinje (dobbel statuslinje i rammen). `crm-*`, `ute-*` og `portal-tilbud` i `img/` var ubrukte og viste «Hengsel»-logoen i menyen. |
| vis.hengsel.no | 45 skjermbilder, 28 sammensatte bilder (`rom-*`, `hero`, `flate-*`, `forsta-*`) | Alle skjermbilder viste det gamle merket («Hengsel»-logoen øverst i menyen) og navn som Tuva Skinnrud, Hans Hansen og leverandørnavn. Sammensatte bilder bygger på dem. |
| sngroup.no | 46 PNG (11 i `display/`) | Bare 5 var i bruk (Hengsel-seksjonen); alle viste det gamle merket. |
| byggem.no | 7 (favicon, logo, delingsbilde) | Ingen skjermbilder. Hengsel-logoen i bunnen er det nye merket. |

Søk etter sigdal, hth, bosch, siemens, nobia, miele, gaggenau, electrolux, ikea, kvik, elkjøp og blanco i alt-tekster, `data-alt` og filnavn på alle sidene: ingen treff. Merkenavnene sto i **bildene** (designfilene: «Sigdal», «Elkjøp Proff», «Electrolux», «iQ700», «Blanco», «Steni», «Fjellmontasje AS», personnavn som Hans Hansen); de er byttet før gjengivelsen (se under).

## 2. Hvordan bildene lages
- **Kilder:** innlandet-crm-sync `docs/design/v4/crm/` (CRM sju skjermer, 04, 10, 15, 18, 30, 31, 32, 65) og sngroup-nettsider `docs/design/hengsel/hengsel.no/` (`ios/`, `img/ute-ipad-bildeverktoy`). Designfilene hentet React/Babel fra unpkg; skriptet svarer med lokale npm-pakker (`NPM_DIR`).
- **Fiktive data:** «Din logo», «Butikknavn Hamar», Kari Nordmann (og X Nordmann som etternavn), «Hovedleverandør A/B», «Hvitevaremerke X», «Vaskemerke Y», «Montasjefirma A/B/Nord». Rollenavnene i designet (Siri Selger, Morten Montasjeleder, Lea Ledersen) står.
- **Statuslinje og Dynamic Island:** designfilene tegner egen ramme og statuslinje på telefon og iPad. Rammen, border og klokkeraden er fjernet i bildet, så rammen på nettsiden (`Enhet.astro`, vis-rammene) tegner dem én gang. Merkelappene fra designet («Klikk 3») er skjult.
- **Skala:** PC og iPad 2×, telefon 3× (`ute-*` fra designets iOS-PNG-er, som bare finnes i 1×; de er derfor oppskalert og ikke skarpere enn før). 1×-varianter ligger i `claude/k177-skjermer/<navn>@1x.webp`; nettsidene bruker 2×/3×-filene (ikke koblet til `srcset`).
- **Lys og mørk:** hengsel.no `img/app` har lys og mørk (iOS-designet). CRM-designet har bare lys (CRM sju skjermer og fil 65 har ingen mørk gjengivelse av disse rammene i eksportfilen, bortsett fra D-skjermene som ikke brukes mørkt på vis). Skjermene fra CRM-designet vises derfor like i mørk modus (som før); telefonrammen er den samme.

## 3. Bilde for bilde

### vis.hengsel.no (`sites/vis/src/skjermbilder/`, gammelt → nytt)
Gammelt viste det gamle merket (og i flere tilfeller andre navn); nytt er fiktivt med nytt merke.

| Fil | Mål (gammelt → nytt) | Kilde i designet |
|---|---|---|
| `vis/skjermbilder/crm-bestilling.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-bestilling |
| `vis/skjermbilder/crm-etterkalkyle.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-etterkalkyle |
| `vis/skjermbilder/crm-ipad-belastninger.webp` | 2360×1640 → 2360×1640 | 18 Kontrollmal befaring belastninger · H3.12 |
| `vis/skjermbilder/crm-ipad-innstillinger.webp` | 2360×1640 → 2360×1640 | 30 Telefon og iPad · A08.5 |
| `vis/skjermbilder/crm-ipad-kontrollmal.webp` | 2360×1640 → 2360×1640 | 18 Kontrollmal befaring belastninger · H3.5 |
| `vis/skjermbilder/crm-ipad-leder.webp` | 2360×1640 → 2360×1640 | 30 Telefon og iPad · A05 |
| `vis/skjermbilder/crm-mal-skisser.webp` | 2560×1440 → 2880×1800 | 10 Tilbud · T04.1 |
| `vis/skjermbilder/crm-min-dag.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-min-dag |
| `vis/skjermbilder/crm-moduler.webp` | 2560×1440 → 2880×1800 | 04 Innstillinger Leder · I18L |
| `vis/skjermbilder/crm-montasje.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-montasje |
| `vis/skjermbilder/crm-ordre-kontrollmal.webp` | 2560×1440 → 2880×1800 | 18 Kontrollmal befaring belastninger · H3.1 |
| `vis/skjermbilder/crm-resultater.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-resultater |
| `vis/skjermbilder/crm-saker.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-saker |
| `vis/skjermbilder/crm-salgstavla.webp` | 2560×1440 → 2880×1800 | eksport/CRM sju skjermer · crm-salgstavla |
| `vis/skjermbilder/crm-tilbud-kunde.webp` | 2560×1440 → 2884×1800 | 15 Kundeportalen · KP1 |
| `vis/skjermbilder/crm-tilbud.webp` | 2560×1440 → 2880×1800 | 10 Tilbud · T14 |
| `vis/skjermbilder/crm-tlf-kundekort.webp` | 1206×2622 → 1170×2532 | 30 Telefon og iPad · A01 |
| `vis/skjermbilder/crm-tlf-min-dag.webp` | 1206×2622 → 1170×2532 | 30 Telefon og iPad · A10.1 |
| `vis/skjermbilder/crm-tlf-ordre.webp` | 1206×2622 → 1170×2532 | 30 Telefon og iPad · A03 |
| `vis/skjermbilder/dok-d1.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D1 |
| `vis/skjermbilder/dok-d10.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D10 |
| `vis/skjermbilder/dok-d11.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D11 |
| `vis/skjermbilder/dok-d2a.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D2a |
| `vis/skjermbilder/dok-d2b.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D2b |
| `vis/skjermbilder/dok-d3.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D3 |
| `vis/skjermbilder/dok-d4.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D4 |
| `vis/skjermbilder/dok-d5.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D5 |
| `vis/skjermbilder/dok-d6.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D6 |
| `vis/skjermbilder/dok-d7.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D7 |
| `vis/skjermbilder/dok-d8.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D8 |
| `vis/skjermbilder/dok-d9.webp` | ny → 2880×1620 | 65 Dokumenter slik lages det · D9 |
| `vis/skjermbilder/kundeportal-k03.webp` | 1206×2622 → 1173×2532 | 15 Kundeportalen · K03 |
| `vis/skjermbilder/kundeportal-k06.webp` | 1206×2622 → 1173×2532 | 15 Kundeportalen · K06 |
| `vis/skjermbilder/kundeportal-k08.webp` | 1206×2622 → 1173×2532 | 15 Kundeportalen · K08 |
| `vis/skjermbilder/kundeportal-pc.webp` | 2560×1440 → 2884×2364 | 15 Kundeportalen · KP3 |
| `vis/skjermbilder/mb-crm-ordre-kontrollmal.webp` | 2880×1800 → 2880×1800 | 18 Kontrollmal befaring belastninger · H3.1 (16:10, beskåret) |
| `vis/skjermbilder/mb-crm-tilbud-kunde.webp` | 2880×1800 → 2880×1800 | 15 Kundeportalen · KP1 (16:10, beskåret) |
| `vis/skjermbilder/portal-fdv.webp` | 1206×2622 → 1170×2532 | 15 Kundeportalen · K14 |
| `vis/skjermbilder/portal-levering.webp` | 1206×2622 → 1173×2532 | 15 Kundeportalen · K10 |
| `vis/skjermbilder/portal-montering.webp` | 1206×2622 → 1173×2532 | 15 Kundeportalen · K12 |
| `vis/skjermbilder/portal-tilbud.webp` | 1206×2622 → 1170×2532 | 15 Kundeportalen · K04 |
| `vis/skjermbilder/ute-avvik.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/avvik-lys (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-ferdig.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/ferdig-lys (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-i-dag.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/idag-lys (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-ipad-bildeverktoy.webp` | 2360×1640 → 2360×1640 | hengsel.no/img/ute-ipad-bildeverktoy (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-jobb-under.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/jobben-lys (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-ks-kamera.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/bilde-mal (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-ks.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/ks-lys (Hengsel Ute, iOS-design) |
| `vis/skjermbilder/ute-laser.webp` | 1206×2622 → 1170×2532 | 32 Mal og skisser · P14 |
| `vis/skjermbilder/ute-punkter.webp` | 1206×2622 → 1206×2622 | hengsel.no/ios/punkter-lys (Hengsel Ute, iOS-design) |

Merknader: `crm-ipad-leder` er nå iPad-skjermen «Innstillinger» (30 A05) og `crm-tlf-*` er menyen, Innstillinger og Mer (30 A10.1, A01, A03); alt-tekstene i `crm/`, `firmaleder/` er endret til å si det. `kundeportal-pc` (KP3) og `crm-tilbud-kunde` (KP1) er kundeportalen; i designet er stemningsbildet en flate, ikke et foto. De fire PC-bildene `crm-*` er nå 16:10 (1440 × 900); rammen viser fra toppen (cover), så bunnen av menyen med versjonen kappes i Studio Display (16:9) men vises i MacBook-bildene `mb-*`.

### «Slik lages det» (D1–D12)
`packages/design/src/dokumenter/lages.js`: alle 27 steg peker nå på nye bilder med nye alt-tekster. Hvert dokument bruker D-skjermene fra fil 65: tilbud D1, D1, D10; kjøpsavtale D2a, D2b, D2b; ordrebekreftelse D3; anbud D4; monteringsrapport D5; punktrapport D6; FDV D7 og D11; montasjeplan D8; faktura D9; resten fra CRM sju skjermer. D12 (e-post) er ikke brukt. Bildemålet i `dokumenter.mjs` er 2880 × 1620 (D-skjermene er 16:9). Dokumentmalene selv (A4-sidene i `/dokumenter/`) er HTML fra de felles dokumentdataene (`A4Side`): «Din logo | Butikknavn Hamar» øverst og `hengsel-lys.svg` i bunnlinjen, og var allerede riktige.

### Romkort, flater og hero (vis)
`rom-*`, `flate-*`, `forsta-*`, `hero.webp`, `hero-enkel.webp`, `rom-dokumenter.webp` er laget på nytt med `scripts/rammer-vis.mjs` og `scripts/skjermbilder-vis.mjs` fra de nye skjermbildene (Apples rammer uendret). Alt-teksten på forsiden sier nå «iPad (innstillinger)».

### hengsel.no
| Fil | Før → nå | Kilde |
|---|---|---|
| `img/apptest/idag-*`, `jobben-*`, `ks-*`, `ferdig-*` (lys og mørk) | ekte app-skjermbilder 600 × 1305 → fjernet, siden bruker `img/app/<navn>-lys/-mork.webp` | designets `ios/` (idag, jobben, ks, ferdig) |
| `img/apptest/foresporsler-lys.webp` | ekte 600 × 1305 → 780 × 1688 | 18 Kontrollmål, H3.13 «Godta eller Bestrid» |
| `img/apptest/ruten-lys.webp` | ekte → 780 × 1688 | 31 Utkjører, U02.2 «Rute for dagen» |
| `img/apptest/mottak-lys.webp` | ekte → 780 × 1688 | 31 Utkjører, U04.2 «Meld mottatt» |
| `img/app/*` (Ute på forsiden, /ute og /apptest) | uendret | designets `ios/` (var allerede riktige) |
| `media/ute-motion-1080x1080.{webm,mp4}`, `-plakat.webp` | ny | `brand/hengsel-merke/motion/` |
Mørk modus på `/apptest` viser de tre CRM-skjermene (foresporsler, ruten, mottak) i lys utførelse. `apptest.astro` mister `utenStatus`, så statuslinjen og Dynamic Island vises én gang (fra rammen). Alt-tekstene til rollene er endret så de beskriver bildene. Forside, `/crm`, `/kundeportal`, `/slik-virker-det`, `/dokumenter` og `/integrasjoner` viser CRM, portal og dokumenter som HTML-komponenter fra designet (ikke bilder); jeg har sett over dem på skjermbilder og de har «Din logo», Hengsel lite, og versjon 1.7.0.

**Motion:** `components/Motion.astro` + `scripts/motion.ts` (via `scripts/ute.ts` og `scripts/apptest.ts` pga. CSP-testen). `<video autoplay muted loop playsinline preload="none">` med plakat; kildene settes først når videoen nærmer seg synsfeltet (IntersectionObserver), og ved `prefers-reduced-motion` eller uten skript vises bare plakaten. Brukt ved «Bli tester» på `/ute` (ved siden av teksten) og i hero på `/apptest` ved siden av appikonet.

### sngroup.no
| Fil | Før → nå | Kilde |
|---|---|---|
| `skjermbilder/crm-min-dag.webp` (Studio Display, erstatter `display/crm-tilbud.png`) | PNG 2560×1440 → webp 2880×1800 | CRM sju skjermer · Min dag |
| `skjermbilder/ute-i-dag.webp`, `ute-jobb-under.webp`, `ute-ks.webp` | PNG 1206×2622 → webp 1206×2622 | designets `ios/` |
| `skjermbilder/portal-tilbud.webp` | PNG → webp 1230×2592 | 15 Kundeportalen, K04 |
`HengselEnheter.astro` og `Enhet.astro` er oppdatert til `.webp`.

### byggem.no
Ingen skjermbilder å bytte. Familiebåndet viser `hengsel-aksent-lys/-mork.svg` (det nye merket, kontrollert).

## 4. Gamle bilder som er ryddet bort
- `sites/hengsel/public/img/` (18): `crm-bestilling.webp`, `crm-etterkalkyle.webp`, `crm-montasje.webp`, `crm-resultater.webp`, `portal-tilbud.webp`, `ramme-ipad.webp`, `ramme-iphone.webp`, `ramme-macbook.webp`, `ute-avvik.webp`, `ute-ferdig.webp`, `ute-i-dag.webp`, `ute-ipad-bildeverktoy.webp`, `ute-jobb-under.webp`, `ute-ks.webp`, `ute-laser.webp`, `ute-punkter.webp`, `ute-punktkort.webp`, `ute-typeskilt.webp`
- `sites/hengsel/public/img/apptest/` (11): `ferdig-lys.webp`, `ferdig-mork.webp`, `foresporsler-mork.webp`, `idag-lys.webp`, `idag-mork.webp`, `jobben-lys.webp`, `jobben-mork.webp`, `ks-lys.webp`, `ks-mork.webp`, `mottak-mork.webp`, `ruten-mork.webp`
- `sites/hengsel/src/components/` (1): `EnhetBilde.astro`
- `sites/hengsel/src/scripts/` (1): `bilder.ts`
- `sites/sngroup/public/skjermbilder/` (35): `crm-bestilling.png`, `crm-etterkalkyle.png`, `crm-ipad-belastninger.png`, `crm-ipad-innstillinger.png`, `crm-ipad-kontrollmal.png`, `crm-ipad-leder.png`, `crm-min-dag.png`, `crm-montasje.png`, `crm-ordre-kontrollmal.png`, `crm-resultater.png`, `crm-saker.png`, `crm-salgstavla.png`, `crm-tilbud-kunde.png`, `crm-tilbud.png`, `kundeportal-k03.png`, `kundeportal-k04.png`, `kundeportal-k06.png`, `kundeportal-k08.png`, `kundeportal-pc.png`, `portal-fdv.png`, `portal-kjokken.png`, `portal-levering.png`, `portal-montering.png`, `portal-tilbud.png`, `ute-avvik.png`, `ute-ferdig.png`, `ute-i-dag.png`, `ute-ipad-bildeverktoy.png`, `ute-jobb-under.png`, `ute-ks-kamera.png`, `ute-ks.png`, `ute-laser.png`, `ute-punkter.png`, `ute-punktkort.png`, `ute-typeskilt.png`
- `sites/sngroup/public/skjermbilder/display/` (11): `crm-bestilling.png`, `crm-etterkalkyle.png`, `crm-min-dag.png`, `crm-montasje.png`, `crm-ordre-kontrollmal.png`, `crm-resultater.png`, `crm-saker.png`, `crm-salgstavla.png`, `crm-tilbud-kunde.png`, `crm-tilbud.png`, `kundeportal-pc.png`
- `sites/vis/src/skjermbilder/` (7): `crm-tlf-innstillinger.webp`, `crm-tlf-kontrollmal.webp`, `crm-tlf-leder.webp`, `mb-crm-mal-skisser.webp`, `mb-crm-moduler.webp`, `ute-punktkort.webp`, `ute-typeskilt.webp`

Beholdt: Apples rammer, `dok-forside.webp` (foto, ikke skjerm), illustrasjonene i `vis/src/assets/ill/` (tegninger), og designmappa `docs/design/hengsel/hengsel.no/img/` (designets egne gamle bilder, ikke brukt på sidene).

## 5. Kvalitet
- `npm run build`, `npm test` og `node scripts/skjermbilder.mjs`: grønne. Lenkesjekken ligger i `npm test`.
- `scripts/k177-kontroll.mjs` (nytt): skjermbilder og målinger av hengsel.no (9 sider), vis (30 sider), sngroup.no og byggem.no på 390 og 1440 px, lys og mørk. Resultatet står i `claude/k177-skjermbilder/etter/maling.md`; før-bildene i `claude/k177-skjermbilder/for/` (bygg av `origin/main`), etter i `etter/` (webp, 1×, øverste 7000 px).
- **axe color-contrast: 0 brudd** (160 målinger).
- **Lighthouse mobil** (standard emulering): `/` ytelse 99, tilgjengelighet 100, god praksis 100, SEO 100, CLS 0, LCP 2,2 s. `/ute` 99/100/100/100, CLS 0. `/apptest` 98/100/100/69 (SEO er 69 fordi siden er `noindex` med vilje), CLS 0.
- **CLS:** 0 på alle hengsel.no-sider og i Lighthouse. På vis.hengsel.no var det CLS opptil 0,37 på sider som bygges av JavaScript (`butikken`, `kunden`, `leverandoren`, `montoren`; footeren hoppet da kortene ble satt inn). Rettet med én CSS-regel i `vis.css` (footeren skjules til innholdet står der). Igjen på vis, uendret fra main og under 0,1 i enkeltmålinger (varierer fra kjøring til kjøring, skrift- og layoutbytte i JS-sider): vis/ 390 lys: 0.019; vis/ 1440 lys: 0.033; vis/ 1440 mørk: 0.033; vis/gevinst/ 1440 lys: 0.030; vis/hvitevarer/ 1440 mørk: 0.080; vis/kunde/ 1440 mørk: 0.006; vis/reise/ 390 lys: 0.078; vis/reise/ 1440 lys: 0.051; vis/reise/ 1440 mørk: 0.002; sngroup/ 390 lys: 0.003; sngroup/ 390 mørk: 0.003. Dette er ikke endret av K-177 og er ikke løst.

## 6. Ikke gjort / merk
- Økta ble ikke opprettet på nytt med miljøet «Standard» og Auto; arbeidet er gjort i denne økta.
- Ingen ekte skjermbilder er tatt (K-170). App-lenkene (`.well-known`) er ikke rørt. Ingen tekster er endret utenom alt-tekster og bildetekster.
- Skjermer fra CRM-designet finnes ikke i mørk utførelse (se over). 1×-filene er ikke koblet inn med `srcset`.
- `scripts/fiktive-skjermer.mjs` trenger designfilene fra innlandet-crm-sync (`CRM_DESIGN`) og `NPM_DIR` med react, react-dom og @babel/standalone: `NPM_DIR=/sti CRM_DESIGN=/sti/docs/design/v4/crm node scripts/fiktive-skjermer.mjs`.
- Ingen passord eller nøkler i noe av dette. Demobrukerne (`*@demo.invalid`) er uendret.
