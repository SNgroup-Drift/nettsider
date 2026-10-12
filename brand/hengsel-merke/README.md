# Hengsel-merket – logo og app-ikoner (fasit 12.10.2026)

Denne mappa inneholder alt som trengs for å bytte til det nye Hengsel-merket i alle løsningene. Den er laget for å gis til Claude Code sammen med repoene. Visuell fasit ligger i Claude Design: `Logo-bruk.dc.html` (bruk og plasseringer) og `Ute-ikon.dc.html` (app-ikonet).

---

## Oppgave til Claude Code
> Bytt det gamle Hengsel-merket (H-merke med «engsel» og hake over CRM/UTE, og app-ikonet 2b «Gjennom linsa») med det nye merket fra denne mappa i alle repoene. Følg reglene og plasseringene under nøyaktig. Ikke tegn om filene, og ikke legg til farger eller effekter. Når du er ferdig, gå gjennom sjekklista i punkt 8 og rapporter hva som er gjort per repo, og hva som gjenstår.

---

## 1. Merket
**Leddet:** to hengselblader og en stift i midten. Sammen danner de en H.
- **Symbolet** er Hengsel. Det står alene der navnet står ved siden av uansett: app-ikon, favicon og profilbilde.
- **Navnet** «Hengsel» står i Inter 500 ved siden av symbolet. Produktnavnet står i Inter 400. All tekst i SVG-ene er konturert.
- **Farger** (ingen andre): Warm Black #31261D, Off White #FBF9F6, Deep Blue #5074A9, Dusty Blue #9CA9BD. Flatene er Beige 3 #F2E9DB og mørk #1F1914.

## 2. Filer
```
svg/                                  logoer, 4 fargeutgaver hver
  hengsel-symbol-{v}.svg              symbol alene
  hengsel-{v}.svg                     symbol + «Hengsel»
  hengsel-ute-{v}.svg                 symbol + «Hengsel Ute»
  hengsel-crm-{v}.svg                 symbol + «Hengsel CRM»
  ute-{v}.svg                         symbol + «Ute»       (bare inne i Ute)
  crm-{v}.svg                         symbol + «CRM»       (bare inne i CRM)
  levert-av-{v}.svg                   «Levert av» + symbol + «Hengsel»
  sendt-med-{v}.svg                   «Sendt med» + symbol + «Hengsel»
app-ikon/ute/                         Hengsel Ute (iOS, iPad, Android, Expo)
  icon-composer/lag/*.svg             3 lag + mørk stift, 1024 × 1024, flate
  icon-composer/Hengsel Ute.icon      ferdig fil til Icon Composer (ikke testet)
  expo/ute-1024-{lys,mork,tonet}.png
  android/forgrunn|bakgrunn|monokrom-432.(svg|png), ic_launcher.xml, play-512.png
  visning/                            gjengitte forhåndsvisninger (ikke til bygg)
  LES-MEG.md                          innstillinger for Icon Composer, Expo og Android
app-ikon/visning/                     avrundede ikoner til nettsider og dokumentasjon (ute, crm, lys/mørk)
pwa/                                  CRM som web-app: 192, 512, maskable 512, apple-touch 180 + manifest
favicon/                              favicon.svg, favicon-16.svg, png 16/32/48/180/192/512, head.html
```
`{v}` er én av fire utgaver:
- `aksent-lys`: Warm Black med stift i Deep Blue. **Standard på lys flate.**
- `aksent-mork`: Off White med stift i Dusty Blue. **Standard på mørk flate.**
- `lys`: helt Warm Black, til trykk i én farge og PDF.
- `mork`: helt Off White, til blå flater og foto.

## 3. Regler
1. **Kunden først.** Inne i løsningene står butikkens logo øverst og er alltid størst.
2. **Hengsel nederst.** Hengsel står lite på fast plass og flytter seg aldri, uansett hvordan kundens logo ser ut.
3. **Inne i appene står symbolet og produktnavnet** (`ute-*`, `crm-*`). Ordet «Hengsel» står på hengsel.no, i PDF, i «Levert av» og i «Sendt med».
4. Minste størrelse: symbol 16 px, logo med tekst 14 px høyde. Fri sone: minst halve symbolhøyden rundt.
5. Ikke strekk, roter, legg til skygge, glød eller kontur, eller bytt farger. Ikke bruk symbolet som bokstav i tekst.

## 4. Plasseringer
| Flate | Kundens logo | Hengsel |
|---|---|---|
| hengsel.no, toppfelt | – | `hengsel-aksent-lys/-mork`, 30 px (34 px fra 1180 px) |
| hengsel.no, bunn | – | `hengsel-aksent-*`, 30 px |
| hengsel.no /ute, /crm | – | `hengsel-ute-*` / `hengsel-crm-*`, 34 px i heroen |
| vis.hengsel.no | – | `hengsel-aksent-*`, 28 px i toppfeltet |
| CRM sidemeny PC/iPad | øverst til venstre, maks 200 × 40 px | `crm-aksent-*` 16 px **nederst til venstre**, under brukeren, + «v. {versjon}» 11 px |
| CRM telefon | toppfelt, maks 140 × 28 px | `crm-aksent-*` 16 px nederst i menyen ≡ |
| CRM innlogging | midtstilt, maks 200 × 64 px | `crm-aksent-*` 16 px nederst midtstilt |
| Ute innlogging / låseskjerm | midtstilt, maks 200 × 64 px | `ute-aksent-*` 18 px nederst midtstilt |
| Ute Meg / Profil (også utkjører og lager) | – | `ute-aksent-*` 16 px nederst + «Versjon x (bygg)» 12 px |
| Kundeportal | toppfelt, maks 180 × 36 px | `levert-av-aksent-*` 14 px, bunntekst høyre |
| PDF-maler | øverst, maks 50 × 12 mm | `hengsel-lys` 3 mm, bunnlinje høyre |
| E-post | øverst midtstilt, maks 160 × 48 px | `sendt-med-lys` 12 px nederst midtstilt (PNG 2× i e-post) |
| sngroup.no, familiebånd | – | `hengsel-aksent-*`, 24 px |

Uten kundelogo, eller før kunden er kjent: butikkens navn i Inter 600 i samme felt. I innlogging uten kjent kunde brukes `ute-aksent-*` / `crm-aksent-*` med 32 px høyde i midten.

## 5. Hengsel i tekst
- Skriv alltid «Hengsel» med stor H, aldri «HENGSEL» i tekst.
- **hengsel.no:** «Hengsel CRM» og «Hengsel Ute» første gang på en side, deretter «CRM» og «Ute». Kundeportalen skrives «kundeportalen» i løpende tekst.
- **App Store og Play:** «Hengsel Ute». Under ikonet (`CFBundleDisplayName` / `android:label`): «Ute».
- **I appene, SMS og e-post** er butikken avsender. «Hengsel» står ikke i knapper og tekster.
- **Fanetittel i CRM:** «{Side} – {Butikknavn}».

## 6. Per repo
**`sngroup-nettsider` → `sites/hengsel`**
- Kopier `svg/hengsel-aksent-lys.svg`, `-aksent-mork.svg`, `hengsel-ute-*`, `hengsel-crm-*` og `app-ikon/visning/ute.svg` til `public/logo/`.
- Kopier `favicon/*` og `pwa/manifest-hengsel-no.webmanifest` (som `manifest.webmanifest`) til `public/`.
- Bytt logoen i sidehode og bunn, i Ute- og CRM-heroen, på /apptest og passordsiden, og app-ikonet i «Bli tester».
- Lim inn `favicon/head.html` i base-layouten.
- Lag nytt og:image med `hengsel-aksent-lys.svg` på Off White.

**`sngroup-nettsider` → `sites/vis`**
- Bytt toppfelt og innlogging, og bunnlinjen i dokumentmalene (punkt 4).
- Favicon som over. Bruk `pwa/vis-maskable-512.svg` hvis det finnes et manifest.

**CRM**
- Bytt sidemeny, telefonmeny og innlogging etter punkt 4.
- Legg `pwa/crm-*.png` og `manifest-crm.webmanifest` i public, og favicon som over.
- `CustomerLogo` får presets: `sidebar` 200×40, `topbar-phone` 140×28, `login` 200×64, `portal` 180×36, `email` 160×48. Logoen vises med `object-fit: contain`, uten beskjæring.
- Opplasting av kundens logo: lys og mørk utgave, SVG eller PNG med gjennomsiktig bakgrunn, minst 400 px bred. Mangler den mørke, brukes den lyse på en Off White-flis med 8 px luft.

**`hengsel-ios` (Ute, iPhone/iPad)**
- Legg `app-ikon/ute/icon-composer/Hengsel Ute.icon` i Xcode i stedet for AppIcon.
- Åpnes den ikke, bygg den fra `lag/` etter `app-ikon/ute/LES-MEG.md`.
- `CFBundleDisplayName` = «Ute».
- Innlogging, låseskjerm og Meg etter punkt 4.
- Fjern `ikon/2b/*`, `assets/hengsel-merke-*.svg` og alle bilder av det gamle ikonet i widget, varsler og innlogging.

**Expo-appen (`montorapp`)**
- `app.json`:
  ```json
  "ios": { "icon": { "light": "./assets/ute-1024-lys.png", "dark": "./assets/ute-1024-mork.png", "tinted": "./assets/ute-1024-tonet.png" } },
  "android": { "adaptiveIcon": { "foregroundImage": "./assets/forgrunn-432.png", "backgroundImage": "./assets/bakgrunn-432.png", "monochromeImage": "./assets/monokrom-432.png" } }
  ```
- `name`: «Hengsel Ute».
- PNG-ene har alfakanal. Klager App Store Connect, se LES-MEG.

**Google Play:** `android/play-512.png`.

**Designsystemet (`hengsel-designsystem`)**
- `Brand` får props `form` ('symbol' | 'hengsel' | 'hengsel-ute' | 'hengsel-crm' | 'ute' | 'crm' | 'levert-av' | 'sendt-med'), `utgave` ('aksent' | 'ensfarget') og `hoyde` (px). Komponenten bruker filene i `svg/`.
- Fjern `--mark-*`-tokens.
- Erstatt `guidelines/hengsel-merke.md` med punkt 3–5 her, og oppdater README-avsnittet «Logo og kundens logo».
- Flytt gamle `assets/logo/*` til `assets/arkiv/v2-h-merke/`.

**E-postmaler og PDF-maler:** kundens logo øverst og Hengsel nederst etter punkt 4. Fjern «by Hengsel» og «Levert med» med det gamle merket.

**sngroup.no:** familiebånd og bunn etter punkt 4.

## 7. Gamle filer som skal bort
- H-merket med «engsel»: `hengsel-logo-*`, `hengsel-crm-logo-*`, `hengsel-ute-logo-*`, `hengsel-merke-*`, `hengsel-app-ikon-*` og `favicon.svg` (gammel)
- App-ikonet 2b: `ikon/2b/**`, `Hengsel Ute.icon` (gammel), `04_ikon_L9_*`, `05_ikon_L9_*`
- `--mark-*`-tokens og «by Hengsel»-tekster

## 8. Sjekkliste
- [ ] Søk i alle repoer etter `engsel`, `hengsel-logo`, `hengsel-merke`, `2b`, `L9`, `by Hengsel` og `Levert med`. Ingen treff utenom arkivet.
- [ ] Hengsel står på samme sted i lys og mørk modus, med lang og kort kundelogo og uten logo.
- [ ] Kundens logo er aldri mindre enn Hengsel.
- [ ] Favicon er riktig i Safari, Chrome og Edge, og på iOS (Legg til på Hjem-skjerm).
- [ ] Ute-ikonet ser riktig ut i lys, mørk, klar og tonet modus på iOS 26, og som adaptivt og monokromt ikon på Android.
- [ ] «Ute» står under ikonet, og «Hengsel Ute» i butikkene.
- [ ] Ingen UI-tekst sier «Hengsel» der butikkens navn skal stå.
