# Migrering: Hengsel furu v2

14.10.2026. For utviklere som tar i bruk palett, plattformlag, ikoner og logoer. Følg rekkefølgen. Gjør steg 1 (palett) i alle kodebaser før plattformlag og ikoner.

## 1. Palett: brevann til furu (besluttet)

1. Erstatt tokenfila med `tokens/hengsel-palett.css`, eller generer fra `tokens/hengsel-palett.tokens.json` i bygget. CSS-en er generert fra JSON, også P3-blokkene.
2. Søk etter de 31 gamle fargekodene under og bytt dem til tokens. Ikke bytt hex mot hex.
3. Søk etter `rgba(0, 126, 146` og `rgba(0,126,146`. Furu er `rgba(6, 132, 114, …)`.
4. Søk etter ordet «brevann» i kode, kommentarer og variabelnavn. Det heter «furu».
5. Søk etter gamle P3-verdier: `#177E97`, `#4FB0CC` og `color(display-p3 0.1494 0.4916 0.5815)`.
6. Søk etter gammel stiftfarge i logoer: `#008094` og `#24B7D2`.
7. Bytt logoer, favicon og app-ikon (se steg 4).
8. Skrift: Schibsted Grotesk i CRM, admin og på nett. Systemskrift (SF Pro) i appene.
9. Nettsider, CRM, admin og kundeportal er bare lyse. Bare appene bruker mørk modus.
10. Kundetemaet (Sigdal for sluttkunden) skal ikke røres.

### Tabell over endrede tokens

Alle andre roller er uendret. Flater, tekst, varsel og feil er de samme som før.

| Modus | Token | Før (brevann) | Nå (furu) |
|---|---|---|---|
| lys | `--flate-valgt` | #DCF4F9 | #E0F4EE |
| lys | `--aksent` | #007E92 | #068472 |
| lys | `--aksent-trykk` | #007082 | #007665 |
| lys | `--aksent-tekst` | #006879 | #016D5E |
| lys | `--aksent-svak` | #DCF4F9 | #E0F4EE |
| lys | `--aksent-valgt` | #B2E6F2 | #BCE6DB |
| lys | `--status-ferdig-fg` | #006E30 | #1F6D02 |
| lys | `--status-ferdig-bg` | #DEF8E2 | #E3F7DE |
| lys | `--status-ferdig-kant` | #9AD5A5 | #A5D39B |
| mørk | `--flate-valgt` | #03333C | #13332D |
| mørk | `--aksent` | #00B3CF | #54B9A5 |
| mørk | `--aksent-trykk` | #27C2DE | #63C8B3 |
| mørk | `--aksent-tekst` | #74CDE1 | #8ACDBE |
| mørk | `--aksent-svak` | #08272E | #112823 |
| mørk | `--aksent-valgt` | #003E49 | #163F37 |
| mørk | `--status-ferdig-fg` | #9CE6AB | #AAE39E |
| mørk | `--status-ferdig-bg` | #0F3118 | #173012 |
| mørk | `--status-ferdig-kant` | #2E663C | #3B6432 |
| lys, økt kontrast | `--flate-valgt` | #DCF4F9 | #E0F4EE |
| lys, økt kontrast | `--aksent` | #006575 | #006A5B |
| lys, økt kontrast | `--aksent-trykk` | #005664 | #005B4D |
| lys, økt kontrast | `--aksent-tekst` | #004B58 | #004E42 |
| lys, økt kontrast | `--aksent-svak` | #DCF4F9 | #E0F4EE |
| lys, økt kontrast | `--aksent-valgt` | #9DDCEB | #AADDD0 |
| lys, økt kontrast | `--status-ferdig-fg` | #004B1E | #104B00 |
| lys, økt kontrast | `--status-ferdig-bg` | #E5FFE9 | #E9FEE5 |
| lys, økt kontrast | `--status-ferdig-kant` | #298646 | #448335 |
| mørk, økt kontrast | `--flate-valgt` | #03333C | #13332D |
| mørk, økt kontrast | `--aksent` | #30C7E3 | #68CDB7 |
| mørk, økt kontrast | `--aksent-trykk` | #43D4F0 | #75DAC4 |
| mørk, økt kontrast | `--aksent-tekst` | #A3ECFD | #B4ECDE |
| mørk, økt kontrast | `--aksent-svak` | #08272E | #112823 |
| mørk, økt kontrast | `--aksent-valgt` | #004A56 | #194B41 |
| mørk, økt kontrast | `--status-ferdig-fg` | #BAFFC7 | #C4FEB7 |
| mørk, økt kontrast | `--status-ferdig-bg` | #00220A | #092104 |
| mørk, økt kontrast | `--status-ferdig-kant` | #6FA87B | #7AA671 |

Merke: stiften på Hengsel-merket er `#068472` på lyst og `#54B9A5` på mørkt. Før: `#008094` og `#24B7D2`. Produktmerkene (CRM, Ute, Levering, Admin) har samme stiftfarger som før.

## Søk etter

Hardkodede verdier som ikke skal finnes i koden etter byttet:

```
#DCF4F9 #007E92 #007082 #006879 #B2E6F2 #006E30 #DEF8E2 #9AD5A5 #03333C #00B3CF #27C2DE #74CDE1 #08272E #003E49 #9CE6AB #0F3118 #2E663C #006575 #005664 #004B58 #9DDCEB #004B1E #E5FFE9 #298646 #30C7E3 #43D4F0 #A3ECFD #004A56 #BAFFC7 #00220A #6FA87B
```


## 2. Filer som byttes hvor

| Fil i pakken | Erstatter / nytt | Kodebase |
|---|---|---|
| `tokens/hengsel-palett.css` | Erstatter tidligere `hengsel-palett.css` og `hengsel-plattform.css`. Grunn, P3, økt kontrast, K-206 og plattformlag a og b i én fil | CRM, admin, nett, kundeportal |
| `tokens/hengsel-palett.tokens.json` | Kilde for alt. Grunn + `k206` + `plattform` med `status` per lag | Bygg |
| `tokens/tailwind/hengsel-preset.js` | Nytt. Tailwind-preset som peker på CSS-variablene | CRM, admin |
| `tokens/swift/HengselTokens.swift` | Erstatter `HengselFarger.swift` og `HengselPlattform.swift` | Hengsel 2.0 (SwiftUI) |
| `tokens/swift/Hengsel.xcassets` | Erstatter fargesettene. 30 sett i Display P3, med `AccentColor` | Hengsel 2.0 |
| `tokens/rn/hengsel-tokens.ts` | Erstatter `montor-tema.ts` og `hengsel-app.tokens.json` | Montørappen (Expo) |
| `tokens/android/` | Fargeressurser lys og mørk | Android, hvis aktuelt |
| `ikoner/16`, `20`, `24` | Nytt ikonsett, 49 SVG-er med currentColor. Erstatter Material Symbols | CRM, admin, nett, Expo |
| `ikoner/hengsel-ikoner.svg` | Sprite med `<symbol id>` | CRM (valgfritt) |
| `ikoner/ikoner.json` | Navn, fil, SF Symbol og bruk | Alle |
| `designsystem/logo/` | Alle logoer og merker | Alle |
| `designsystem/favicon/` | favicon.svg, 16, 32, 180, 192, 512 | Nett, CRM, admin, kundeportal |
| `designsystem/app-ikon/hengsel_ute.icon` | Icon Composer-pakke | Hengsel 2.0 |

## 3. CRM og admin (React + Tailwind)

1. Importer `tokens/hengsel-palett.css` globalt, før Tailwind-lagene (`@import "./hengsel-palett.css";` øverst i `globals.css`).
2. Legg til preset i `tailwind.config.js`: `presets: [require('./hengsel-preset.js')]`. Klassene blir for eksempel `bg-flate-kort`, `text-tekst-dempet`, `border-ramme`, `shadow-kort`, `h-rad`, `rounded-kort`, `max-w-innhold`.
3. Sett `data-plattform="pc"` på `<html>` i CRM og admin. Lag b (under 1024 px) slår inn av seg selv. Ikke sett det på nettsidene eller kundeportalen.
4. Bytt hardkodede farger og mål i komponentene til klassene over. Kort: `bg-flate-kort rounded-kort shadow-kort`.
5. Sidemeny: alle punktene i dagens rekkefølge, med ikon. Under 1024 px skuff, under 768 px bunnfaner + «Mer».
6. **Logoer (besluttet 14.10):** Hengsel CRM-logoen med versjonsnummer står nederst til venstre i sidemenyen (16 px høy, versjon i `text-tekst-svak`, 12 px). Kundens logo står øverst til høyre i toppfeltet, etter varsler, med skillelinje. `max-h-kundelogo w-auto` (28 px på PC, 24 px under 1024 px). På mobil står Hengsel-logoen nederst i «Mer».
7. Tabeller: valg for tetthet i verktøylinjen. Sett `data-tetthet="tett|luftig"` på tabellen. Normal er standard.
8. Ikoner: én komponent `<Ikon navn="ordre" size={16|20|24} />`. Importer SVG-ene med SVGR, eller bruk spriten: `<svg width={20} height={20}><use href="/ikoner.svg#ordre" /></svg>`. Strek per størrelse i viewBox 20: 1.875 (16), 1.6 (20), 1.458 (24). Fargen arves fra `color`.
9. Fjern Material Symbols fra font-lastingen når alle ikonene er byttet.
10. Favicon: se `designsystem/favicon/README.md`.

## 4. Hengsel 2.0 (SwiftUI)

1. Legg `HengselTokens.swift` og `Hengsel.xcassets` i target. Fjern de gamle fargefilene.
2. Sett `AccentColor` som Global Accent Color. På roten: `.tint(Plattform.aksent)`.
3. Flater: `Plattform.flateSide`, `.flateKort`, `.flateSenket` (systemfarger). Ikke bruk `HengselTokens.flate*` på iOS.
4. Sekundærtekst: `Plattform.tekstDempet` i stedet for `.secondary`. Tekstknapper rett på grå flate eller glass: `.tint(Plattform.aksentTekst)`.
5. Primærhandling: `.buttonStyle(.glassProminent)`. Sekundær: `.buttonStyle(.glass)`. Fanelinje, verktøylinje og sidefelt får Liquid Glass fra systemet.
6. iPad: `NavigationSplitView` med `.listStyle(.sidebar)`. Valgt rad: `.listRowBackground(valgt ? Plattform.sidefeltValgt : nil)` og tekst i `Plattform.paaSidefeltValgt`.
7. Statuspiller: `HengselTokens.Status.*Fg/Bg/Kant`. 12 pt, semibold, padding 3×10, kapsel med 1 pt kant.
8. Ikoner: SF Symbol fra `ikoner/ikoner.json` (`sf`). To er merket «egen» (Forskudd til leverandør, Unoterte til leverandør). Venter på avklaring, bruk nærmeste til da.
9. App-ikon: dra `designsystem/app-ikon/hengsel_ute.icon` inn i Xcode (Icon Composer-format, iOS 26).

## 5. Montørappen (Expo / React Native)

1. Legg inn `tokens/rn/hengsel-tokens.ts`. Bruk `useHengselTema()` for lys og mørk.
2. Fanelinje og toppfelt: hele flater (`flateKort`) med hårstrek i `linje`. Ikke bruk `BlurView` som glass.
3. Aktiv fane `fanelinje.aktiv`, inaktiv `fanelinje.inaktiv`.
4. Kant i mørk modus er `#767B82` (ikke grunnens `#6A6F76`), så felt på `flateSenket` holder 3:1.
5. Ikoner: SVG-ene i `ikoner/24/` via `react-native-svg` med `color`-prop, eller SF Symbols via `expo-symbols`. Velg én.
6. Systemskrift. Ikke last Schibsted Grotesk i appen.

## 6. Kontroll etter bytte

- Søk etter alle verdiene i steg 1. Ingen treff skal finnes i kode, CSS, SVG eller fargesett.
- Sammenlign skjermene med `skjermer/png/`.
- Kjør kontrastsjekk mot `KONTROLL.md`.
