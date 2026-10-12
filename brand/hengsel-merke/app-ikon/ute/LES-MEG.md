# Hengsel Ute – app-ikon (12.10.2026)

Forhåndsvisning: `Ute-ikon.dc.html` i prosjektroten.

## Filer
- `icon-composer/lag/`: SVG per lag, 1024 × 1024 på samme lerret, uten bakgrunn og hjørner. Bare `<path d fill>` med flate farger, uten gradient, opasitet, maske eller metadata.
  - `1-blad-venstre.svg`: kant Beige 3 #F2E9DB, flate Off White #FBF9F6
  - `2-blad-hoyre.svg`: smalere (åpnet ca. 18°), kant Beige 3, to flate felt: Off White mot stiften og Beige 4 #F8F2EC ytterst
  - `3-stift.svg`: Off White. `3-stift-mork.svg`: Dusty Blue #9CA9BD
  - Luften rundt stiften er skåret ut av bladene i selve formen.
- `icon-composer/lag-rene/*.svg.txt`: de samme lagene garantert uten metadata. Kjør `sh gi-nytt-navn.sh` for å gjøre dem om til .svg.
- `icon-composer/rens-svg.sh`: fjerner c2pa-metadata fra `lag/` og `Assets/`. Nedlastingen legger metadata på alle .svg-filer, så kjør dette, eller bruk `lag-rene/`, før filene tas inn i Icon Composer.
- `icon-composer/Hengsel Ute.icon/`: ferdig fil til Icon Composer (`icon.json` + `Assets/`)
- `expo/ute-1024-lys.png`, `ute-1024-mork.png`, `ute-1024-tonet.png`: ferdig gjengitt med dybde, uten hjørner
- `android/`: `forgrunn-432.svg/png`, `bakgrunn-432.svg/png`, `monokrom-432.svg/png`, `ic_launcher.xml` og `play-512.png`
- `visning/`: gjengitte forhåndsvisninger og lag med effekter. Brukes bare til forhåndsvisning.

## Motion (hengsel.no/apptest og App Store-forhåndsvisning)
`Ute-motion.dc.html` i prosjektet: hengselet åpner seg fra 0 til 18°, og stiften fanger lyset. Den varer 3 s og går i sømløs loop.
- Velg format i Tweaks: 1080 × 1080 eller 1080 × 1920. Eksporter med Share › Export › Video, én gang per format.
- Den brukes ikke i selve app-ikonet. Bevegelsen der lager iOS fra lagene.
- På /apptest brukes `<video autoplay muted loop playsinline>` med poster fra første bilde. Ved prefers-reduced-motion vises bare posteren.
- App Store krever at forhåndsvisninger er 15–30 s i telefonformat. Loopen kan brukes som åpning eller avslutning i en lengre forhåndsvisning, eller som 1080 × 1920-klipp i markedsføringen.

## Ferdig app-ikon (du trenger ikke åpne Icon Composer)
`icon-composer/Hengsel Ute.icon` er en ferdig ikonpakke i formatet til Icon Composer: en mappe med `icon.json` og `Assets/`. Xcode 26 bygger alle størrelser og utgaver fra den: lys, mørk, klar og tonet, iPhone, iPad og App Store-ikonet.

**Innhold i `icon.json`:**
- Fill: Automatic Gradient fra Deep Blue #5074A9. Mørk: Solid #1B1713.
- Tre grupper, front til bak:

| Gruppe | Lag | Glass | Specular | Shadow | Translucency |
|---|---|---|---|---|---|
| Stift | `3-stift.svg` (mørk: `3-stift-mork.svg`) | på | på | Neutral 60 % | av |
| Høyre blad | `2-blad-hoyre.svg` | på | på | Neutral 50 % | 20 % |
| Venstre blad | `1-blad-venstre.svg` | på | på | Neutral 45 % | 20 % |

- Lighting Combined, ingen blur. Klar og tonet lages av iOS.
- SVG-farger tolkes som sRGB.

**Ta den i bruk:**
1. Kjør `sh icon-composer/rens-svg.sh`, slik at SVG-ene i `Assets/` er uten metadata.
2. **Xcode 26:** dra `Hengsel Ute.icon` inn i prosjektet (ikke i Assets.xcassets). Sett Target › General › App Icon til `Hengsel Ute`. Slett den gamle AppIcon.
3. **Expo (SDK 54 eller nyere):** legg pakken i `assets/` og sett `"ios": { "icon": "./assets/Hengsel Ute.icon" }` i `app.json`. PNG-ene i `expo/` er reserve for eldre SDK.
4. Bygg og sjekk ikonet på hjemskjermen i lys, mørk, klar og tonet modus.

Formatet er ikke dokumentert av Apple. `icon.json` følger det Icon Composer 1.x skriver. Viser Xcode feil, åpne pakken én gang i Icon Composer og lagre. Da skrives fila om til riktig versjon, med de samme lagene og innstillingene.

## Bygge på nytt i Icon Composer (bare ved behov)
1. Kjør `rens-svg.sh`, eller bruk `lag-rene/`. New › dra inn de tre SVG-ene. Legg hvert lag i sin egen gruppe, i denne rekkefølgen ovenfra: Stift, Høyre blad, Venstre blad.
2. Document › Fill: Automatic Gradient fra #5074A9 (lysere øverst til venstre). Dark: Solid #1B1713.
3. Innstillinger per gruppe (rekkefølgen gir dybden, og Stift får størst parallakse):

| Gruppe | Liquid Glass | Specular | Shadow | Translucency | Blur |
|---|---|---|---|---|---|
| Stift | på | på | Neutral 60 % | av | av |
| Høyre blad | på | på | Neutral 50 % | 20 % | av |
| Venstre blad | på | på | Neutral 45 % | 20 % | av |

4. Stift › Appearance Dark: fyll #9CA9BD, eller bytt til `3-stift-mork.svg`.
5. Clear og Tinted lages av systemet. Sjekk dem i forhåndsvisningen: H-en og stiften skal kunne leses i gråtoner.
6. Lagre som `Hengsel Ute.icon` og legg den i Xcode i stedet for AppIcon.

## Expo
I `app.json` skal det stå:
```json
"ios": { "icon": { "light": "./assets/ute-1024-lys.png", "dark": "./assets/ute-1024-mork.png", "tinted": "./assets/ute-1024-tonet.png" } }
```
PNG-ene er fullt dekkende, men har alfakanal. Klager App Store Connect, kjør `sips -s format png --deleteProperty hasAlpha` eller `magick ute-1024-lys.png -alpha off ute-1024-lys.png`.

## Android
- Legg forgrunn, bakgrunn og monokrom som drawable (eller som vector via Image Asset i Android Studio), og bruk `ic_launcher.xml`.
- Symbolet ligger innenfor den sikre sonen (66/108).
- `play-512.png` er Play-ikonet uten hjørner, fordi Play legger på maske selv.

## Valg
- Høyre blad er 14 % smalere og har en kjøligere toning. Det leses som at hengselet er åpnet ca. 18°, uten perspektivtegning. Dybden ellers kommer fra lagene i Icon Composer.
- Fasen er laget med to flate farger: en kant i Beige 3 og en flate i Off White. Den ses ned til 60 px, og under det blir bladet en jevn flate.
- Stiften er Off White på blått i lys modus. Den blå stiften fra logoen ville forsvunnet mot Deep Blue.
- Symbolet fyller ca. 64 % av ikonet. Det er større enn i første utkast, slik at H-en kjennes igjen ned til 29 px.
- Ingen tynne streker. Luften rundt stiften er minst 6 px ved 60 px.
