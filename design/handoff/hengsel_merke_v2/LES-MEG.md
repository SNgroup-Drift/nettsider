# hengsel_merke_v2

14.10.2026. Merke, motion og logoer til Hengsel-sidene, furu v2. Bare besluttet fra v2: grunnpaletten (aksent #068472, mørk aksent #54B9A5), Schibsted Grotesk, logoene og app-ikonet. Alle navn og data er oppdiktet. Ingen app-skjermbilder (de tas automatisk fra demo.hengsel.no, K-228).

All tekst i SVG-er er gjort om til kurver, så de ikke trenger skriften. Unntaket er butikkmalene i `3-butikk`, der tekstfeltene er ekte `<text>` som Code skal fylle inn. PNG-er med `-2x`/`-3x`/`-4x` er samme motiv i høyere oppløsning.

## 1. Motion (`1-motion/`)

Animasjon uten skjermbilder: app-ikonet åpner seg, stiften i furu fyller bildet, tre punkter (Dagens jobber, Sjekkliste og avvik, Signert hos kunden), og så lukker ikonet seg igjen med «Hengsel Ute» og hengsel.no. Første bilde er ikonet med «Hengsel Ute», og det er også plakatbildet.

| Fil | Størrelse | Bruk |
|---|---|---|
| `ute-motion-1080x1080-plakat.png` | 1080×1080 | Plakatbilde, første bilde |
| `ute-motion-1080x1080.mp4` | 1080×1080, 10 s, 30 fps | H.264 High, 8 Mbit/s, uten lyd |
| `ute-motion-1080x1080.webm` | 1080×1080, 10 s, 30 fps | VP9, uten lyd |
| `ute-motion-1080x1920-plakat.png` | 1080×1920 | Plakatbilde, første bilde |
| `ute-motion-1080x1920.mp4` | 1080×1920, 10 s, 30 fps | H.264 High, 10 Mbit/s, uten lyd |
| `ute-motion-1080x1920.webm` | 1080×1920, 10 s, 30 fps | VP9, uten lyd |

## 2. Delingsbilder (`2-deling/`)

Open Graph og delingsbilder, 1200×630. `<meta property="og:image" content="…/og-hengsel-no.png">`. Tekstene er forslag.

| Fil | Størrelse | Bruk |
|---|---|---|
| `og-apptest.png` | 1200×630 | Invitasjon til apptest |
| `og-apptest.svg` | 1200×630 | Invitasjon til apptest |
| `og-hengsel-no.png` | 1200×630 | hengsel.no |
| `og-hengsel-no.svg` | 1200×630 | hengsel.no |
| `og-kunde.png` | 1200×630 | Kundeområdet |
| `og-kunde.svg` | 1200×630 | Kundeområdet |
| `og-vis-hengsel-no.png` | 1200×630 | vis.hengsel.no |
| `og-vis-hengsel-no.svg` | 1200×630 | vis.hengsel.no |

## 3. Butikkgrafikk (`3-butikk/`)

Maler med navngitte felt: `#bakgrunn`, `#overskrift` (`#overskrift-linje-1`, `#overskrift-linje-2`), `#undertekst`, `#enhetsramme`, `#skjermbilde` (tomt `<image href="">`, klippet med `#skjerm-klipp`) og `#skjermbilde-felt` (plassholder, fjernes). Mål for hvert felt står i `maler.json`. Forslag til tekst for fem bilder står i `tekster.json`. Forhåndsvisninger ligger i `forhandsvisning/`.

| Fil | Størrelse | Bruk |
|---|---|---|
| `app-store/ipad-13.svg` | 2064×2752 | App Store, iPad 13" (påkrevd hvis appen støtter iPad). Mal med navngitte felt |
| `app-store/iphone-6-5.svg` | 1284×2778 | App Store, iPhone 6,5". Mal med navngitte felt |
| `app-store/iphone-6-9.svg` | 1320×2868 | App Store, iPhone 6,9" (påkrevd). Mal med navngitte felt |
| `forhandsvisning/app-store-ipad-13.png` | 2064×2752 | Forhåndsvisning med eksempeltekst |
| `forhandsvisning/app-store-iphone-6-5.png` | 1284×2778 | Forhåndsvisning med eksempeltekst |
| `forhandsvisning/app-store-iphone-6-9.png` | 1320×2868 | Forhåndsvisning med eksempeltekst |
| `forhandsvisning/google-play-nettbrett-10.png` | 1600×2560 | Forhåndsvisning med eksempeltekst |
| `forhandsvisning/google-play-telefon.png` | 1080×1920 | Forhåndsvisning med eksempeltekst |
| `google-play/funksjonsgrafikk-1024x500.png` | 1024×500 | Google Play, feature graphic |
| `google-play/funksjonsgrafikk-1024x500.svg` | 1024×500 | Google Play, feature graphic (påkrevd). Ingen gjennomsiktighet |
| `google-play/nettbrett-10.svg` | 1600×2560 | Google Play, nettbrett 10". Mal med navngitte felt |
| `google-play/telefon.svg` | 1080×1920 | Google Play, telefon 9:16. Mal med navngitte felt |
| `maler.json` | – | Felt og mål for alle maler |
| `tekster.json` | – | Forslag til tekst for fem skjermbilder |

## 4. PWA og app-ikon (`4-pwa-appikon/`)

PWA-ikoner for CRM og Visning, og app-ikon for Expo og Android (Ute og Visning) bygd fra `hengsel_ute.icon`. Bakgrunn #EFF1F3 (lys) og #121416 (mørk), som i Icon Composer-pakken.

| Fil | Størrelse | Bruk |
|---|---|---|
| `android/ute/ic_launcher-playstore-512.png` | 512×512 | Google Play, 512×512, uten alfa |
| `android/ute/res/values/ic_launcher_background.xml` | – |  |
| `android/visning/ic_launcher-playstore-512.png` | 512×512 | Google Play, 512×512, uten alfa |
| `android/visning/res/values/ic_launcher_background.xml` | – |  |
| `expo/ute/adaptive-icon-monochrome.png` | 1024×1024 | Android 13 tema-ikon |
| `expo/ute/adaptive-icon.png` | 1024×1024 | Android forgrunn. backgroundColor #EFF1F3 |
| `expo/ute/app-json-utdrag.json` | – | Utdrag til app.json |
| `expo/ute/icon-dark.png` | 1024×1024 | iOS mørk («ios.icon.dark») |
| `expo/ute/icon-tinted.png` | 1024×1024 | iOS tonet («ios.icon.tinted»), gråtoner |
| `expo/ute/icon.png` | 1024×1024 | iOS og Expo «icon». Uten gjennomsiktighet |
| `expo/ute/splash-icon-dark.png` | 1024×1024 | Splash mørk |
| `expo/ute/splash-icon.png` | 1024×1024 | Splash. imageWidth 200, bakgrunn #F6F8FB / #0B0D11 |
| `expo/visning/adaptive-icon-monochrome.png` | 1024×1024 | Android 13 tema-ikon |
| `expo/visning/adaptive-icon.png` | 1024×1024 | Android forgrunn. backgroundColor #EFF1F3 |
| `expo/visning/app-json-utdrag.json` | – | Utdrag til app.json |
| `expo/visning/icon-dark.png` | 1024×1024 | iOS mørk («ios.icon.dark») |
| `expo/visning/icon-tinted.png` | 1024×1024 | iOS tonet («ios.icon.tinted»), gråtoner |
| `expo/visning/icon.png` | 1024×1024 | iOS og Expo «icon». Uten gjennomsiktighet |
| `expo/visning/splash-icon-dark.png` | 1024×1024 | Splash mørk |
| `expo/visning/splash-icon.png` | 1024×1024 | Splash. imageWidth 200, bakgrunn #F6F8FB / #0B0D11 |
| `ios/hengsel_ute.icon` | mappe | Icon Composer-pakke fra v2 (uendret), kilde for alle app-ikonene |
| `pwa/crm-192.png` | 192×192 | CRM, purpose any. Hvit flis, CRM-stift |
| `pwa/crm-192.svg` | 192×192 | CRM, purpose any. Hvit flis, CRM-stift |
| `pwa/crm-512.png` | 512×512 | CRM, purpose any |
| `pwa/crm-512.svg` | 512×512 | CRM, purpose any |
| `pwa/crm-apple-touch-180.png` | 180×180 | CRM, apple-touch-icon. Uten gjennomsiktighet, iOS runder hjørnene |
| `pwa/crm-apple-touch-180.svg` | 180×180 | CRM, apple-touch-icon. Uten gjennomsiktighet, iOS runder hjørnene |
| `pwa/crm-maskable-512.png` | 512×512 | CRM, purpose maskable. Merket innenfor sikker sone (sirkel 80 %) |
| `pwa/crm-maskable-512.svg` | 512×512 | CRM, purpose maskable. Merket innenfor sikker sone (sirkel 80 %) |
| `pwa/manifest-utdrag.json` | – | Utdrag til manifest.webmanifest |
| `pwa/vis-maskable-512.png` | 512×512 | Visning, purpose maskable. Hengsel-merket |
| `pwa/vis-maskable-512.svg` | 512×512 | Visning, purpose maskable. Hengsel-merket |

Android-ressurser, likt for `android/ute/res/` og `android/visning/res/`:

| Mappe | ic_launcher, ic_launcher_round | ic_launcher_foreground, ic_launcher_monochrome |
|---|---|---|
| mipmap-mdpi | 48×48 | 108×108 |
| mipmap-hdpi | 72×72 | 162×162 |
| mipmap-xhdpi | 96×96 | 216×216 |
| mipmap-xxhdpi | 144×144 | 324×324 |
| mipmap-xxxhdpi | 192×192 | 432×432 |

`mipmap-anydpi-v26/ic_launcher.xml` og `ic_launcher_round.xml` peker på forgrunn, monokrom og `@color/ic_launcher_background` (#EFF1F3).

## 5. Logoer og ikoner (`5-logoer-ikoner/`)

«Levert av Hengsel», «Sendt med Hengsel», favicon med flis og nye ikoner. Bruk PNG i e-post (mange e-postklienter viser ikke SVG). Vis «Sendt med Hengsel» i 160 px bredde med `-2x`-fila.

| Fil | Størrelse | Bruk |
|---|---|---|
| `favicon-flis-16.png` | 16×16 |  |
| `favicon-flis-32.png` | 32×32 | Synlig i mørke faner |
| `favicon-flis-48.png` | 48×48 |  |
| `favicon-flis.svg` | 32×32 (skalerbar) | Merket på hvit flis |
| `favicon.ico` | 16, 32, 48 | ICO med flis |
| `ikoner/16/hjelp.svg` | 16×16 | Strekikon, currentColor |
| `ikoner/16/innboks.svg` | 16×16 | Strekikon, currentColor |
| `ikoner/16/montasjeplan.svg` | 16×16 | Strekikon, currentColor |
| `ikoner/16/profil.svg` | 16×16 | Strekikon, currentColor |
| `ikoner/20/hjelp.svg` | 20×20 | Strekikon, currentColor |
| `ikoner/20/innboks.svg` | 20×20 | Strekikon, currentColor |
| `ikoner/20/montasjeplan.svg` | 20×20 | Strekikon, currentColor |
| `ikoner/20/profil.svg` | 20×20 | Strekikon, currentColor |
| `ikoner/24/hjelp.svg` | 24×24 | Strekikon, currentColor |
| `ikoner/24/innboks.svg` | 24×24 | Strekikon, currentColor |
| `ikoner/24/montasjeplan.svg` | 24×24 | Strekikon, currentColor |
| `ikoner/24/profil.svg` | 24×24 | Strekikon, currentColor |
| `ikoner/ikoner-tillegg.json` | – | Navn, fil, SF Symbol og bruk for de nye ikonene |
| `levert-av-hengsel-blekk-2x.png` | 508×80 | Ensfarget blekk |
| `levert-av-hengsel-blekk-3x.png` | 762×120 | Ensfarget blekk |
| `levert-av-hengsel-blekk.png` | 254×40 | Ensfarget blekk |
| `levert-av-hengsel-blekk.svg` | 254×40 | Ensfarget blekk |
| `levert-av-hengsel-hvit-2x.png` | 508×80 | Ensfarget hvit, på bilde eller farge |
| `levert-av-hengsel-hvit-3x.png` | 762×120 | Ensfarget hvit, på bilde eller farge |
| `levert-av-hengsel-hvit.png` | 254×40 | Ensfarget hvit, på bilde eller farge |
| `levert-av-hengsel-hvit.svg` | 254×40 | Ensfarget hvit, på bilde eller farge |
| `levert-av-hengsel-lys-2x.png` | 508×80 | Lys flate. Kundeportal og kundeområde |
| `levert-av-hengsel-lys-3x.png` | 762×120 | Lys flate. Kundeportal og kundeområde |
| `levert-av-hengsel-lys.png` | 254×40 | Lys flate. Kundeportal og kundeområde |
| `levert-av-hengsel-lys.svg` | 254×40 | Lys flate. Kundeportal og kundeområde |
| `levert-av-hengsel-mork-2x.png` | 508×80 | Mørk flate |
| `levert-av-hengsel-mork-3x.png` | 762×120 | Mørk flate |
| `levert-av-hengsel-mork.png` | 254×40 | Mørk flate |
| `levert-av-hengsel-mork.svg` | 254×40 | Mørk flate |
| `sendt-med-hengsel-lys-2x.png` | 534×80 | E-post, lys bakgrunn. Bruk PNG i e-post |
| `sendt-med-hengsel-lys-3x.png` | 801×120 | E-post, lys bakgrunn. Bruk PNG i e-post |
| `sendt-med-hengsel-lys.png` | 267×40 | E-post, lys bakgrunn. Bruk PNG i e-post |
| `sendt-med-hengsel-lys.svg` | 267×40 | E-post, lys bakgrunn. Bruk PNG i e-post |
| `sendt-med-hengsel-mork-2x.png` | 534×80 | E-post, mørk bakgrunn |
| `sendt-med-hengsel-mork-3x.png` | 801×120 | E-post, mørk bakgrunn |
| `sendt-med-hengsel-mork.png` | 267×40 | E-post, mørk bakgrunn |
| `sendt-med-hengsel-mork.svg` | 267×40 | E-post, mørk bakgrunn |

## 6. Sigdal (`6-sigdal/`)

«Sigdal CRM · levert av Hengsel» i Warm Black (#31261D) og Off White (#FBF9F6), gjennomsiktig bakgrunn. Sigdal-logoen er PNG fra Sigdal-designsystemet, lagt inn i SVG-en. Hele merket er i én farge, også Hengsel-logoen. Ikke rosa eller magenta.

| Fil | Størrelse | Bruk |
|---|---|---|
| `sigdal-crm-levert-av-hengsel-off-white-2x.png` | 832×96 | Off White #FBF9F6, transparent. Mørk bakgrunn |
| `sigdal-crm-levert-av-hengsel-off-white-3x.png` | 1248×144 | Off White #FBF9F6, transparent. Mørk bakgrunn |
| `sigdal-crm-levert-av-hengsel-off-white-4x.png` | 1664×192 | Off White #FBF9F6, transparent. Mørk bakgrunn |
| `sigdal-crm-levert-av-hengsel-off-white.png` | 416×48 | Off White #FBF9F6, transparent. Mørk bakgrunn |
| `sigdal-crm-levert-av-hengsel-off-white.svg` | 416×48 | Off White #FBF9F6, transparent. Mørk bakgrunn |
| `sigdal-crm-levert-av-hengsel-warm-black-2x.png` | 832×96 | Warm Black #31261D, transparent. Lys bakgrunn |
| `sigdal-crm-levert-av-hengsel-warm-black-3x.png` | 1248×144 | Warm Black #31261D, transparent. Lys bakgrunn |
| `sigdal-crm-levert-av-hengsel-warm-black-4x.png` | 1664×192 | Warm Black #31261D, transparent. Lys bakgrunn |
| `sigdal-crm-levert-av-hengsel-warm-black.png` | 416×48 | Warm Black #31261D, transparent. Lys bakgrunn |
| `sigdal-crm-levert-av-hengsel-warm-black.svg` | 416×48 | Warm Black #31261D, transparent. Lys bakgrunn |

## Bruk, kort

- **PWA:** `4-pwa-appikon/pwa/manifest-utdrag.json`. Maskable-ikonene har merket innenfor den sikre sirkelen (80 %).
- **Expo:** kopier `expo/ute/` eller `expo/visning/` til `assets/` og bruk `app-json-utdrag.json`. iOS-ikonet har lys, mørk og tonet utgave.
- **Android (uten Expo):** kopier `android/<app>/res/` inn i `app/src/main/res/`. `ic_launcher-playstore-512.png` er Google Play-ikonet.
- **iOS (SwiftUI):** bruk `ios/hengsel_ute.icon` direkte i Xcode.
- **Favicon:** `<link rel="icon" href="/favicon.ico" sizes="any">` og `<link rel="icon" href="/favicon-flis.svg" type="image/svg+xml">`. Flisen er hvit, så merket synes også i mørke faner.
- **Motion:** `<video autoplay muted loop playsinline poster="ute-motion-1080x1080-plakat.png"><source src="ute-motion-1080x1080.webm" type="video/webm"><source src="ute-motion-1080x1080.mp4" type="video/mp4"></video>`.

## Venter på Eirik

1. **Ikoner fra K-220/K-222:** lista er ikke mottatt. Montasjeplan, Innboks, Profil og Hjelp er laget. Resten lages når lista kommer.
2. **Visning:** det finnes ikke noe eget merke for Visning i v2. `vis-maskable-512` og app-ikonene for Visning bruker Hengsel-merket og er like Ute-ikonene. Skal Visning ha egen stiftfarge eller eget motiv?
3. **Tekster:** overskriftene i delingsbildene og butikkmalene er forslag.
4. **Motion:** laget uten skjermbilder. Skal det komme en versjon med telefon og automatiske skjermbilder, kan Code rendre på nytt med `1-motion/kilde/motion.js`.
5. **Sigdal:** Sigdal-logoen finnes bare som PNG (1000×430). En vektorfil (SVG/EPS) gir skarpere resultat i PDF. Hengsel-delen er i samme farge som Sigdal. Skal den heller ha egne farger (blekk og furu)?
6. **CRM-ikonene** bruker CRM-stiften (#5165D3) fra v2-logoene. Bekreft, eller bytt til furu.
7. **Google Play, telefonmalen:** enhetsrammen er generell (samme som iPhone, med kamerautsparing øverst). Si fra hvis den skal se ut som en Android-telefon.
