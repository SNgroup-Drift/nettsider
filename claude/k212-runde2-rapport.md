# K-212 runde 2: palettpakke v2 på alle Hengsel-sidene

14.10.2026. Gren `claude/k212-runde2` (fra `main` 7a4ebcd), PR mot `main`. Flettes ikke av meg. Pakken: `design/handoff/design_handoff_hengsel_furu_v2/` (Design, 14.10), som blir liggende som kilde.

## 1. Kort

- **Tokens:** grunnpaletten i lys modus var allerede furu etter runde 1 og er identisk med pakkens besluttede palett (328 verdier sjekket: lys, mørk, økt kontrast og P3, roller og statustoner). Det som manglet på sidene var **P3-blokken** og **økt kontrast**. Begge er nå i den delte `tokens.css`, generert fra pinnet JSON, og lik pakkens besluttede blokker (testen `scripts/gamle-farger.test.mjs` sammenlikner P3-blokken verdi for verdi). P3-aksent: `color(display-p3 0.2275 0.5098 0.4471)`.
- **Søk:** de 31 gamle fargekodene, `#177E97` `#4FB0CC` `color(display-p3 0.1494 0.4916 0.5815)`, `#008094` `#24B7D2`, `rgba(0,126,146` og «brevann» har **ingen treff** i `sites/` og `packages/` (kilde), og det er nå en test. De gamle merkefargene fra før furu (`#31261D`, `#5074A9`, `#9CA9BD`) satt igjen i logoer og app-ikon; de er byttet (se 3).
- **Logoer, favicon og app-ikon** fra pakken. **Ikonsettet** (49) ligger i designsystemet, i komponentoversikten på design.hengsel.no og som nedlasting.
- **Bygg og tester:** `npm run build` (seks nettsteder) og `npm test` grønne: 105 tester ok, 0 feil, 1 hoppet over (samme som før: `fristfarger`, «TypeScript-import ikke tilgjengelig»), pluss lenkesjekken for alle seks nettsteder.
- **Ikke gjort:** skjermbildene av appene er ikke byttet (se 6). De viser fortsatt den gamle paletten.

## 2. Tokens

| Hva | Status |
|---|---|
| Grunnpalett lys, mørk, økt kontrast, P3 (BESLUTTET) | Lys, P3 og økt kontrast i lys i `tokens.css`. Mørk og mørk økt kontrast er ikke med: sidene er bare lyse |
| P3-blokk | `@media (color-gamut: p3)`: 35 variabler, identiske med pakkens |
| Økt kontrast | `@media (prefers-contrast: more)` og `… and (color-gamut: p3)`, bare roller som avviker |
| Variabelnavn | Repoets egne (`--blekk`, `--furu`, `--flate-*` …). Pakkens `--merke-blekk`, `--merke-stift` og `--font` er ikke innført (samme verdier) |

Generatoren er `scripts/lag-hengsel-tokens.mjs`; P3 leses fra `rolle.p3.lys` i pinnet `hengsel.tokens.json` (hex-sifrene der er P3-koordinater). Den delte fila er fortsatt den eneste med fargeverdier.

**Ikke tatt i bruk (venter på Eirik):**
- Rollene `ramme`, `overlegg`, `alltid-mork`, `paa-alltid-mork` (K-206 a). Runde 1 har allerede `--ramme`, `--overlegg` og `--alltid-mork` med egne regnede verdier (brukt blant annet av lysboksen i dokumentvisningen). De er **uendret** og avviker fra pakkens forslag: `overlegg` er `rgba(11, 13, 17, 0.48)` her mot `rgba(26,29,34,.40)` i pakken, `alltid-mork` er `#06080B` mot `#0B0D11`. `paa-alltid-mork` finnes ikke.
- Foreslåtte mørke verdier (K-206 b), plattformlag a–d (PC, nettleser under 1024 px, iOS, montørapp), skrivebord-laget, tetthet og `data-plattform`.
- Monokrome produktlogoer (hvit og blekk for CRM, Ute, Admin og Levering): ligger ikke i designsystemet (`hent-palettpakke.mjs` hopper over dem).
- Sigdal-sidene og kundetemaet er ikke endret.

## 3. Logoer, merker, favicon, app-ikon

`node scripts/hent-palettpakke.mjs` legger pakkens `designsystem/logo`, `favicon`, `app-ikon` og `ikoner` i `packages/hengsel-tokens/ds/assets/` og skriver pin-fila på nytt (sha256 per fil; ny nøkkel `palettpakke`). Commit og tokens-filer i pinnen er uendret. De gamle formene (symbol, hengsel-ute, hengsel-crm, ute, crm, levert-av, sendt-med: 32 filer, delvis med `#31261D`/`#5074A9`) er fjernet fra designsystemet.

**De tre filene du nevnte hadde ikke gamle farger.** `sites/hengsel/public/logo/hengsel-crm-aksent-lys.svg`, `…/hengsel-ute-aksent-lys.svg` og `sites/vis/src/assets/logo/hengsel-crm-aksent-lys.svg` er byte-identiske med pakkens `logo-crm-lys.svg` og `logo-ute-lys.svg` (sha256 sjekket). Blått (`#5165D3`, CRM) og oransje (`#B54F00`, Ute) er produktfargene i stiften, og de er uendret i pakken («samme stiftfarger som før»). Jeg har ikke endret dem. Det som faktisk var gammelt:

| Fil | Var | Nå |
|---|---|---|
| hengsel.no `logo/crm-aksent-lys.svg` (CRM-mock, nederst i sidemenyen) | `#31261D`/`#5074A9`, gammelt merke | `logo/hengsel-crm-aksent-lys.svg` (v2 `logo-crm-lys`). Samme plass og 16 px høyde, bredere fordi navnet er «Hengsel CRM» |
| hengsel.no `logo/levert-av-aksent-lys.svg` (kundeportal-mock) | «Levert av Hengsel», gammelt | `logo/hengsel-levering-aksent-lys.svg` (v2 `logo-levering-lys`, «Hengsel Levering»). `alt` er «Hengsel Levering» |
| vis `assets/logo/crm-aksent-lys.svg`, `levert-av-aksent-lys.svg` | samme | samme erstatning (`bygg.mjs`: skjemaene `crm` og `levert-av` peker på de nye filene; plassholderne i rommene er uendret) |
| sngroup.no `logo/hengsel-aksent-lys/-mork.svg` (familiebånd, Hengsel-rommet) | gammelt merke | v2 `logo-hengsel-lys/-mork`; bredde/høyde 422 × 100 |
| byggem.no `logo/hengsel-aksent-lys/-mork.svg` (familiebåndet) | gammelt merke | samme. byggem.no er ellers ikke omfattet, men Hengsel-logoen der var gammel |
| admin `logo/hengsel-symbol-lys.svg` | blekk-merket uten stift | `logo/merke-admin-lys.svg` (Admin-merket med produktfarge). Samme plass og størrelse |
| favicon 180, 192, 512 (hengsel, design, admin, vis) | rendret her fra merket | pakkens `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png` |
| `ikon-ute-192.png` (flisen på /apptest/passord) og design.hengsels app-ikoner | blå bakgrunn `#5074A9` | flat gjengivelse av `hengsel_ute.icon` (`scripts/lag-appikon.mjs`) |

Avvik og valg du bør vite om:
- **favicon-32** er ikke byttet til pakkens `favicon-32.png`: den er gjennomsiktig med mørke blad og blir usynlig i mørke nettleserfaner (K-202). Vi beholder 32 px-flisen fra runde 1, som er rendret av det samme merket. Favicon er «foreslått» i pakkens README (punkt 18).
- **«Levert av» er byttet til «Hengsel Levering»** fordi pakken ikke har noen «levert av»-logo. Teksten i `kundeportal.ts` er endret tilsvarende. Er Levering det samme som kundeportalen? Det bør Design bekrefte.
- **«Sendt med»** (e-post) har ingen motpart i pakken. design.hengsel.no viser ensfarget Hengsel (`logo-hengsel-blekk`) til Design har laget en ny.
- **Appikon-PNG-ene** er flate gjengivelser (uten Liquid Glass), forhåndsvisning til nettsidene. Det ekte ikonet er `.icon`-pakken (iOS 26).
- **`brand/hengsel-merke/`** (merkepakke v3: favicon, PWA, appikon for Expo og Android, butikkgrafikk, delingsbilder, motion) er **ikke endret** og er fra før furu (blå). Pakken har ingen nye utgaver av Android/Expo-lagene, butikkgrafikken eller motion. Ingen side bruker den som kilde lenger, bortsett fra motion (se 6).
- **Apptest-PDF-en** «Logg inn i demoen» har ingen Hengsel-logo eller Hengsel-farger: den er Sigdal-profilert (Sigdal-logo, beige og brun) og er ikke endret.

## 4. design.hengsel.no

- `/merke`: bygget på pakkens familie: symbol (`merke-hengsel-*`, `merke-blekk`/`-hvit`) og logoene Hengsel, CRM, Ute, Admin og Levering i lys og mørk, ensfarget (blekk/hvit) bare for symbolet og Hengsel (resten er foreslått og vises som «foreslått, ikke i bruk»). Plasseringstabellen følger de besluttede logoreglene fra 14.10 (kundens logo øverst til høyre, maks 28 px; Hengsel CRM nederst til venstre, 16 px, med versjon). App-ikoner: Ute lys og mørk (gjengitt), nettapp (pakkens apple-touch).
- `/komponenter#ikoner`: alle 49 ikoner (inline SVG med `currentColor`, lys og mørk), tabell med SF Symbol og bruk, status «foreslått, venter på bekreftelse». Ikonene uten godt SF-treff står som «egen»: Forskudd til leverandør og Unoterte til leverandør.
- `/last-ned`: `hengsel-logopakke.zip` (36 logoer) og nye `hengsel-ikoner.zip` (49 × 3 størrelser, json, sprite, tabell).
- Tester (`scripts/design-fasit.test.mjs`) er oppdatert: logoene og de monokrome som skal være borte, app-ikonene, alle 49 ikoner med SF Symbol og filer, begge zip-filene.

## 5. Ikoner (steg 4)

Sidene viser nesten ingen funksjonsikoner (ingen Material Symbols; menyene og funksjonskortene er tekst, vis-rommene har ingen). Byttet:
- `/apptest` «Meld feil»: **kamera** → `kamera.svg`.
- Meny på hengsel.no: **lukk (×)** → `lukk.svg` (rutenett 20, strek 1,6).

**Ikoner uten motpart i settet** (beholdt som de er):
- `/apptest`: «Meg» (person alene) og «rist telefonen» (telefon som enhet; `telefon.svg` er en telefonrør, «Ring»).
- Hamburger-menyen (≡) på hengsel.no: settet har `mer` (tre prikker), men ikke ≡. Tegnet med samme strek.
- Statuslinjeikonene (signal, Wi-Fi, batteri) i iPhone- og iPad-rammene er systemgrafikk, ikke funksjonsikoner.
- CRM-mocken (sidemeny) og kundeportal-mocken har ingen ikoner i dag (bare tekst). Jeg har ikke lagt dem til (ville flyttet layouten).
- Fra settet har ingen side bruk for: salgsbanken, leder, etterkalkyler, forskudd/unoterte til leverandør (antatt betydning, venter på Eirik).

## 6. Skjermbilder av appene med gammel palett (ikke byttet)

Alle skjermbildene av appene viser den gamle paletten (blå aksent `#5074A9`, beige «Off White»-flater) og er ikke byttet: jeg lager ikke falske. Pakken har egne PNG-er i `skjermer/png/`, men de er designutkast med foreslåtte layouter (lag a–d), ikke skjermbilder av appene. Byttes når nye skjermbilder finnes:

| Sted | Filer |
|---|---|
| hengsel.no `public/img/app/` | 9: avvik, ferdig, idag, jobben, ks, punkter, uten-nett (telefon), ipad-idag, ipad-bildeverktoy-laser |
| hengsel.no `public/img/apptest/` | 6 (3 skjermer × 2): foresporsler, mottak, ruten |
| hengsel.no `public/media/` | Ute-motion: plakat (webp), mp4 og webm (video med gammel palett) |
| design.hengsel.no `public/skjermer/` | 36 (18 skjermer × 2): CRM Min dag, Ordre, Samtaler, Tilbud (lys og mørk), kundeportal, portal-tilbud, Ute i dag, jobb, KS (lys og mørk), hengsel.no-forsiden (lys og mørk) |
| vis `src/skjermbilder/` | 259 filer (ca. 130 skjermer, lys og mørk, 2× og 1×): CRM (PC, iPad, telefon), dokumentene d1–d12, kundeportal, portal-*, Ute-skjermene, `mb-*` |
| vis `src/img/` | 28: romkortene `rom-*`, `hero`, `flate-*`, `forsta-*` (enhetsbilder med skjermer) |
| sngroup.no `public/skjermbilder/` | 19 (crm-tilbud, portal-tilbud, ute-i-dag, ute-jobb-under, ute-ks, lys og mørk) |
| `brand/hengsel-merke/` | butikkgrafikk, delingsbilder, favicon- og PWA-PNG-ene, Expo/Android-appikon, motion (alle gamle) |
| `sites/vis/fasit/` | frittstående designfil til sammenlikning (`Visningsrommet - frittstående.html`, gammel palett; bygges ikke inn) |

Delingsbildene (`og.png`, `og-apptest.png`) og favicon er furu (rendret av `lag-favicon.mjs`).

## 7. Bygg, tester og skjermbilder

- `npm run build` og `npm test` grønne (se 1). `scripts/gamle-farger.test.mjs` er ny: «Søk etter» fra MIGRERING.md som test, pluss P3-blokken mot pakken.
- Skjermbilder i 390 og 1280 px (hele siden) av hengsel.no (forsiden, /apptest, /dokumenter, /crm, /kundeportal), design.hengsel.no (forsiden, /merke, /komponenter), admin og tre vis-rom (forsiden, crm, montoren): `claude/k212-runde2-skjermbilder/` (webp; `scripts/skjermbilder-k212-runde2.mjs`). To av de lange 390-bildene er beskåret til 16 000 px (webp-grensen).
- Sjekker i samme kjøring (`sjekker.json`): `--aksent` er `#068472` på alle 24 visninger; ingen horisontal overflow på 390; alle bilder lastet (logoer og favicon); ingen konsollfeil.
- **P3:** jeg har ikke en Mac eller iPhone i denne økta. P3 er testet ved å emulere `color-gamut: p3` i Chromium (CDP): `matchMedia('(color-gamut: p3)')` er sann og `--aksent` blir `color(display-p3 0.2275 0.5098 0.4471)` på alle sider (bildene `hengsel-no-forside-p3-emulert-*`). Selve P3-gjengivelsen på en bred skjerm er ikke sett. Se etter at aksenten er grønn og ikke blå på Mac og iPhone.
- HawkScan er ikke kjørt (ingen `HAWK_API_KEY`; sidene er statiske).

## 8. Spørsmål til Eirik

1. Er «Levering» det samme som kundeportalen? (Byttet «Levert av Hengsel» til «Hengsel Levering».)
2. Skal «Sendt med» (e-post) få en ny utgave fra Design?
3. Favicon: pakkens 32 px er gjennomsiktig og usynlig i mørke faner. Beholde flisen?
4. K-206 a: `overlegg` og `alltid-mork` har ulike verdier i repoet og i pakken. Hvilke skal gjelde?
5. Nye skjermbilder av appene (se 6) og ny Ute-motion.
