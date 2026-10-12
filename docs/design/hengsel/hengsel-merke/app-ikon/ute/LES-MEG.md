# Hengsel Ute – app-ikon (12.10.2026)

Forhåndsvisning: `Ute-ikon.dc.html` i prosjektroten.

## Filer
- `icon-composer/lag/`: SVG per lag, 1024 × 1024, flate farger, uten hjørner og uten effekter
  - `1-blad-venstre.svg`: kant Beige 3 #F2E9DB, flate Off White #FBF9F6
  - `2-blad-hoyre.svg`: smalere (åpnet ca. 18°), kant Beige 3, flate tonet Off White → Beige 3
  - `3-stift.svg`: Off White. `3-stift-mork.svg`: Dusty Blue #9CA9BD
- `icon-composer/Hengsel Ute.icon/`: ferdig fil til Icon Composer (`icon.json` + `Assets/`)
- `expo/ute-1024-lys.png`, `ute-1024-mork.png`, `ute-1024-tonet.png`: ferdig gjengitt med dybde, uten hjørner
- `android/`: `forgrunn-432.svg/png`, `bakgrunn-432.svg/png`, `monokrom-432.svg/png`, `ic_launcher.xml` og `play-512.png`
- `visning/`: gjengitte forhåndsvisninger og lag med effekter. Brukes bare til forhåndsvisning.

## Icon Composer
`icon.json` er skrevet for hånd uten å være testet. Åpnes den ikke, bygg ikonet slik:

1. New › dra inn de tre SVG-ene fra `lag/`. Legg hvert lag i sin egen gruppe, i denne rekkefølgen ovenfra: Stift, Høyre blad, Venstre blad.
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
