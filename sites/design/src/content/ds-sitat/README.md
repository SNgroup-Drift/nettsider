# Hengsel designsystem

Én fasit for Hengsel som alle flater henter fra: CRM (web), kundeportal, e-post og PDF, montørappen (Expo), Hengsel Ute (iOS), hengsel.no, vis.hengsel.no, design.hengsel.no og admin.hengsel.no. Versjon 2.2.0 (K-307, 17.10.2026: designsystem 2.0 fra Design, S-68, lagt inn med layout-regler, flisklasser, sidemaler, kundetema Sigdal, komponenter, UI-kits, plattformfiler og e-postmal; K-222, 14.10.2026: ramme, overlegg, alltid-mork, paa-alltid-mork og mørk tekst-svak og kant i grunnpaletten, plattformlagene på for alle; K-220, 14.10.2026: ikonsett, plattformlag og logoer fra design_handoff_hengsel_furu_v2; K-206, 13.10.2026: palett «blekk med furu», nytt merke og Schibsted Grotesk).

Hengsel er systemet kjøkken- og interiørbutikker bruker til salg, tilbud, ordre, bestilling, montasje og oppfølging. Produktene er **Hengsel CRM** (PC, og nettleser på mobil og nettbrett), **Hengsel Ute** (appen for montører, utkjørere og montørfirmaer på iPhone, iPad og Android – én app), **Hengsel Admin**, **Hengsel Levering**, kundeportalen og nettsiden hengsel.no.

**Fasit for farger er `tokens/hengsel.tokens.json`.** Designsystem 2.0 fra Design bygger på palett 1.1 (`tokens/hengsel-palett.tokens.json`, 14.10.2026), som er eldre enn beslutningene i K-222 og K-234. Der filene fra Design avviker, gjelder `hengsel.tokens.json` (se [Designsystem 2.0](#designsystem-20-k-307-17102026) under).

Åpne `index.html` for oversikten (farger, skrift, merket i alle former og `Brand` i lys og mørk). Den er generert fra tokens og viser alltid det som faktisk ligger i systemet. Komponentene og UI-kitene fra Design vises i `components/*/*.card.html` og `ui_kits/*/index.html`.

## Hva som ligger hvor

```
tokens/
  hengsel.tokens.json      ENESTE KILDE: farger (lys, mørk, økt kontrast og P3), status, iOS, skrift, størrelser, radius, avstand, skygge
  tokens.css               generert, web
  plattform.css            generert (K-220, K-222), plattformlag a og b. BESLUTTET, på for alle i CRM-et: skallet setter html[data-flate="skrivebord nettleser"] (se under)
  fonts.css                generert, @font-face for Schibsted Grotesk (Hengsel-skriften) og for Inter og Newsreader (kundetemaet)
  fonts-fri-liste.css      generert, @font-face for kundetemaets frie liste
  tokens.ts                generert, CRM og Expo (inkl. kundetema og kundetemaCss)
  HengselTokens.swift      generert, Hengsel Ute (iOS), inkl. HengselTokens.Ios
  ── fra Design (2.0, K-307). Brukes av komponentene og UI-kitene via styles.css, ikke av CRM-et (src/) ──
  hengsel-palett.tokens.json  Designs kilde, palett 1.1 (14.10). IKKE fasit; se fargesjekken i claude/k307-rapport.md
  hengsel-palett.css       palett 1.1 som CSS: grunn, P3, økt kontrast, data-tema="mork", plattformlag a og b (data-plattform="pc")
  grunn.css                standardverdier for mål, skrift, radier og skygger (samme som plattformlag a)
  layout.css               layout-reglene: rutenett, radhøyder, flisklasser, sidemeny bred/smal
  ios.css                  plattformlag c (data-plattform="ios") og d (data-plattform="expo")
  kundetema-sigdal.css     kundetema Sigdal (data-kundetema="sigdal") med TWK Lausanne
  sigdal.tokens.json       fasit for kundetema Sigdal (besluttet 17.10)
styles.css                 inngang for komponentene og kitene (bare @import av tokens/ over)
forhandsvisning.js         laster komponentene i kortene og kitene når den bygde bunten ikke finnes (HengselLast)
assets/
  favicon/                 K-220: favicon.svg og PNG fra pakke v2. K-230: favicon-flis (svg, 16, 32, 48 og .ico; merket på hvit flis, synlig i mørke faner) er den som brukes i public/
  app-ikon/                K-220: hengsel_ute.icon (Icon Composer). K-230: pwa/ (CRM og Visning), expo/ute og expo/visning (iOS lys/mørk/tonet, Android adaptivt, splash), android/ute og android/visning (mipmap i alle tettheter). 2.0: «Hengsel Ute.icon» (lys og mørk)
  logo/                    nytt merke (K-206): 32 Brand-filer (12 med nytt innhold, 20 uendret) + 36 nye filer under eget navn + 16 monokrome produktlogoer og -merker (K-220, hvit og blekk for CRM, Ute, Admin og Levering; GODKJENT 14.10, K-222; plasseringen i CRM-et gjøres i K-218)
  logo/kunde/              2.0: Sigdal-logoen (Warm Black, PNG) for kundetemaet og e-postmalen. Kundens, ikke Hengsels; Brand bruker den ikke
  merkepakke-v2/logo/      K-230: «Levert av Hengsel» (lys, mørk, blekk, hvit) og «Sendt med Hengsel» (lys, mørk), svg + png 1×/2×/3×. Portal, PDF og e-post. Eget mappe, så Brand-kartet over (assets/logo/) ikke røres
  merkepakke-v2/sigdal/    K-230: «Sigdal CRM · levert av Hengsel» (Warm Black og Off White; svg + png 1×–4×). E-post og PDF for Sigdal-temaet
  fonts/                   Schibsted Grotesk (variabel 400–800), Inter og Newsreader (beholdt for kundetemaet), OFL, latin-delsett + lisens. 2.0: Schibsted Grotesk 400–900 normal og kursiv, latin og latin-ext (LISENS.md); fonts.css bruker fortsatt den første fila
  fonts/fri-liste/         DM Sans, Source Sans 3, Source Serif 4, Lora (kundetemaets frie liste), OFL + lisens
  fonts/kundetema-sigdal/  2.0: TWK Lausanne 350 og 650 (lisensiert Sigdal-skrift; lisensen må dekke portalen)
  ikoner/                  2.0: ikonsettet i 16, 20 og 24, sprite og hengsel-ikoner.js (window.HengselIkoner) for kitene
  arkiv/v2-h-merke/        gamle H-merket med «engsel». Skal ikke brukes.
ikoner/                    K-220: Hengsel-ikonene v2. 16/, 20/, 24/ (49 SVG-er fra K-220 + Montasjeplan, Innboks, Profil og Hjelp fra K-230, currentColor), ikoner.json (navn, gruppe, SF Symbol, bruk), IKONER.md, hengsel-ikoner.svg (sprite)
components/Brand/          React-komponenten Brand + brandFil.mjs (filvalget) + Brand.css
components/<gruppe>/       2.0: 30 komponenter (.jsx, .d.ts, .prompt.md) og ett forhåndsvisningskort (<gruppe>.card.html) per gruppe, se Komponenter under
ui_kits/                   2.0: crm, hengsel-ute, kundeportal og nettside (index.html + .jsx + README.md)
plattform/                 2.0: swift/ (HengselTokens.swift, Hengsel.xcassets i Display P3), ios/ (HengselFarger.swift, HengselPlattform.swift), rn/ (hengsel-tokens.ts), app/ (montor-tema.ts, hengsel-app.tokens.json), android/ (values, values-night), tailwind/ (hengsel-preset.js). Fra palett 1.1; appene bruker de genererte filene over
templates/epost/           2.0: e-posttopp «Sigdal CRM – levert av Hengsel» (sigdal-topp.html + PNG 2×)
guidelines/                hengsel-merke.md, farger.md, skrift.md, komponenter.md, kundetema.md. 2.0: grunnkort som HTML (colors-*, type-*, spacing-*, brand-*, ios-*, layout-regler.html)
dokumentasjon/             2.0: LAYOUT-REGLER (fasit for layout), SIDEMALER, PLATTFORMLAG, APP (iOS), MIGRERING, KONTROLL, PALETT-1.0, HANDOFF-CODE og bilder/ (flisklassene)
layout.md, flisklasser.md, maler.md   2.0: layout-reglene, flisklassene og sidemalene (se under)
kilde/                     overleveringene fra Design (palett, plattformlag v2) og logo-kartet
claude-design/             pakken som lastes opp i Claude Design (se claude-design/README.md)
index.html                 oversiktssiden (generert)
ENDRINGSLOGG.md            fra «Hengsel – designsystem» (Sigdal-profilen) til 2.0, og videre
SKILL.md                   Agent Skill-oppsett (hengsel-design) for Claude Design og Claude Code
```

## Designsystem 2.0 (K-307, 17.10.2026)

Design laget 2.0 16.–17.10.2026 (S-68, pakken `Hengsel_2_0.zip`, mappa `00_designsystem`). Det erstatter «Hengsel – designsystem» (prosjekt 5a9d09c6…), som bygde på Sigdal-profilen. Alle filene fra pakken ligger her; ingen filer i repoet er slettet eller overskrevet (`tokens/fonts.css` er fortsatt generert av `lag-tokens.mjs`). Hva som er nytt står i `ENDRINGSLOGG.md`.

**Fargesjekken (K-307).** Alle farger i de nye filene er sjekket mot `hengsel.tokens.json` og `sigdal.tokens.json` (`node scripts/design/k307-fargesjekk.mjs`). Palett 1.1 er eldre enn K-222 og K-234, så disse verdiene i filene fra Design er ikke fasit: `--aksent` lys #068472 (fasit #05806F), `--paa-aksent` lys #FFFFFF (fasit Off White #FBF9F6), mørk `--kant` #6A6F76 (fasit #767B82), mørk `--tekst-svak` #868B92 (fasit #90969D). Hele lista med fil og linje står i `claude/k307-rapport.md`. Disse er ikke endret; Eirik avgjør om de skal rettes i Design eller her. Rettet er bare det testene håndhever fra før: den egne PC-rammen i pakken er byttet til `--ramme` #CBCFD4 (K-222), og listene over de gamle fargekodene fra forrige palett i `dokumentasjon/MIGRERING.md`, `KONTROLL.md` og `APP.md` er byttet med en henvisning til originalene i `design/handoff/design_handoff_hengsel_furu_v2/` (K-220).

**Hva bruker hva.** CRM-et (`src/`), montørappen og iOS-appen henter fortsatt de genererte filene (`tokens.css`, `plattform.css`, `fonts.css`, `tokens.ts`, `HengselTokens.swift`, `montorapp/tokens/`). Filene fra Design (`styles.css`, `hengsel-palett.css`, `grunn.css`, `layout.css`, `ios.css`, `kundetema-sigdal.css`, `plattform/`) brukes av komponentene og UI-kitene i designsystemet. Nettsider-repoet pinner `tokens/`, `assets/logo/` og `assets/fonts/` (`npm run design:hent`) og får derfor også de nye filene der.

### Layout-regler

Fastsatt av Eirik 16.10.2026 (S-67). Gjelder alt nytt i CRM, Hengsel Ute og kundeportalen. Fasit: `dokumentasjon/LAYOUT-REGLER.md`; regel 1–8, 2d og 3b ordrett med eksempler i `layout.md`. Tokens: `tokens/layout.css`. Komponenter: `Rutenett`, `Rad`, `Flis` (`components/layout`) og `Sidemeny` med bred/smal (`components/navigation`). Visuell side: `guidelines/layout-regler.html`.

- **Rutenett:** PC 12 kolonner (24 px mellomrom, 32 px marg, innhold maks 1280 px), iPad 8 kolonner, telefon 4 kolonner (alt i én kolonne). Avstander bare fra skalaen 4, 8, 12, 16, 24, 32, 48 px.
- **Fliser:** bredde 1/3, 1/2 eller 1/1; 1/4 bare for flisklassen Tall. En flis er én ting. Samme høyde i samme rad, og hver rad går opp (symmetri).
- **Radhøyder (2d):** 120/320/480/640 px (`--rad-1`–`--rad-4`), én høyde per rad, 24/20/16 px mellom rader.
- **Sidemeny** bred 240 / smal 64 px, topplinje 56 px.

### Flisklasser

Fasit: `dokumentasjon/LAYOUT-REGLER.md` 2c og 2d og komponenten `Flis klasse="…"` (`components/layout/Flis.jsx`). Tabellen med bredde, fast høyde, innhold og tom/laster/feil for hver klasse står i `flisklasser.md`, med bilde av hver i `dokumentasjon/bilder/flis-*.png`.

Klassene: Tall (1/4 eller 1/3, 120), Status (1/3, 120), Steg (1/1, 120), Kortliste (1/3, 320), Liste (1/2, 320), Diagram (1/2, 320), Skjema (1/2, 480), Tekst (1/1, 120/320/480), Tabell (1/1, 480/640), Tavle, Uke, Plan og Tegning (1/1, 480; nye 17.10). Skrift i alle fliser: tittel 16/600, innhold 14/400, undertekst 12, stort tall 32/400.

### Maler

Én mal per sidetype (regel 3b.5): samme første rad, samme fliser i samme rekkefølge og handlingene på samme sted. Tabellen står i `maler.md`, og sidemalene M1–M14 med brukssteder i `dokumentasjon/SIDEMALER.md`.

M1 Startside · M2 Liste · M3 Detalj · M4 Stegside · M5 Skjema · M6 Status og koblinger · M7 Tavle, uke og plan · M8 Hengsel Ute · M9 Portal · M10 Nettside · M11 Dokument (e-post og PDF) · M12 Innlogging · M13 Tekstside · M14 Felles mønster.

### Kundetema Sigdal

Kundeportalen, prosjektportalen, e-post og dokumenter til sluttkunden bruker butikkens eget uttrykk. For Sigdal er fargene besluttet 17.10 (`tokens/sigdal.tokens.json`), og `tokens/kundetema-sigdal.css` setter de samme rolle-tokenene som Hengsel-paletten under `data-kundetema="sigdal"`, så komponentene virker uendret. Bare lys, aldri furu eller andre Hengsel-farger. Skrift TWK Lausanne (`assets/fonts/kundetema-sigdal/`); den er lisensiert, og lisensen må dekke portalen. Hengsel står bare i bunnteksten («Levert av Hengsel»). Sigdal-logoen ligger i `assets/logo/kunde/`, og e-posttoppen «Sigdal CRM – levert av Hengsel» i `templates/epost/` (se README der). Det generelle kundetemaet (kunden velger logo, aksent og skrift) står under [Kundetema](#kundetema).

### Komponenter

30 komponenter i `components/<gruppe>/` (`.jsx` med `.d.ts` og `.prompt.md`), ett kort per gruppe (`<gruppe>.card.html`):

- brand: Logo, Ikon
- actions: Knapp, IkonKnapp
- forms: Sokefelt, Felt, Velger, Segment
- status: Statuspille, Butikkmerke, Varsel, Tilstand, Tallkort
- layout: Kort, Listerad, Tabell, Rutenett, Rad, Flis, Detaljpanel, NokkelVerdi
- navigation: Butikkvalg, Sidemeny, Toppfelt, Fanelinje, Faner
- overlays: Dialog, Ark, Skuff
- crm: Ordresteg

`Ikon` og `Logo` pakker inn ikonsettet og logofilene. `Faner`, `Tallkort`, `Detaljpanel`, `Skuff` og `NokkelVerdi` er tatt inn fra v4 med nye farger (16.10, se 11-019). `Butikkvalg`, `Butikkmerke`, `Segment`, `Velger`, `Felt`, `Tilstand` og `Ordresteg` er fra S-67. React-komponenten `Brand` (`components/Brand/`) står som før.

### UI-kit

- `ui_kits/crm/` – CRM på PC (Min dag, ordresiden, montasjeplan, butikkvalg, ny kunde).
- `ui_kits/hengsel-ute/` – iPhone og iPad, lys og mørk.
- `ui_kits/kundeportal/` – kundeportalen i butikkens kundetema (Sigdal), telefon og PC: innlogging, kjøkkenet ditt, tilbud og avtale, tilvalg, levering og montering, dokumenter, betaling, meldinger, melde feil.
- `ui_kits/nettside/` – hengsel.no med tekst fra nettsiden: forside, CRM, Hengsel Ute, kundeportal, integrasjoner, priser og demo.

Kitene og kortene laster komponentene med `forhandsvisning.js` (Babel i nettleseren) og stilene med `styles.css`.

## Innhold og språk

- **Språk:** norsk bokmål. Rett på sak, saklig og vennlig. Ikke byråkratisk, ikke markedsføring.
- **Person:** systemet sier «du» til brukeren («10 ting venter», «Du har ikke tilgang til Lillehammer»). Nettsiden sier «dere» til butikken og «vi» om seg selv.
- **Setningsstil overalt:** «Ny kunde», «Fullfør og signer», «Levering bekreftet». Versaler bare i små seksjonsetiketter på iOS («JOBBER», «SJEKKLISTE»).
- **Metalinjer** skilles med midtprikk: «O-2026-0412 · Sigdal kjøkken · Storgata 12, 2317 Hamar».
- **Knapper:** kort verb: «Godta», «Spør leverandør», «Planlegg», «Godkjenn», «Send avvik», «Ring».
- **Varsler:** fet innledning + fakta: «**Prisavvik på benkeplate.** Ny plate kommer uke 44.»
- **Tilstander** sier hva som skjedde og hva du kan gjøre: «Fikk ikke hentet Min dag. Sjekk nettet og prøv igjen. Ingenting av det du har lagret er borte.» Feilkode i liten tekst («Feilkode MD-503»).
- **Tall:** mellomrom som tusenskille, komma som desimal, «kr» etter: «1 240 000 kr», «92 %». Datoer «fredag 16. oktober», «21.10», «uke 44». Klokkeslett med punktum: «07.30» (avvik A10). Lister: «tir. 17.11». Overskrifter og kundeportalen: «tirsdag 17. november».
- **Punkter:** feil og mangler etter montering heter «Punkter» overalt (CRM, Hengsel Ute, kundeportalen), med samme nummer (14-3). «Avvik» brukes bare om varer og OB. «Ferdigmelding» er ordet for avslutningen; knappen i Hengsel Ute heter «Ferdigmeld og signer» (avvik A8–A9, 16.10).
- **Domeneord:** OB (ordrebekreftelse), KS, kontrollmål, endringsfrist, ferdigmelding, etterkalkyle, montørfirma, varemottak, restordre.
- **Emoji:** brukes ikke. Unicode bare som tegn i tekst: «·», «–», «…», «×».
- **Eksempeldata:** oppdiktet (Kari Nordli, Ingrid og Ola Haugen, Nordli Kjøkken Hamar/Gjøvik/Lillehammer). Aldri ekte kunder eller beløp.

## Visuelt grunnlag

- **Retning:** blekk med furu som aksent. Kjølige, nesten hvite flater med svak blåtone (hue 255), blekk som tekst, furu (hue 178) som eneste aksent.
- **Farger:** `--flate-side` #F6F8FB, `--flate-kort` #FBFDFF, `--tekst` #1A1D22, `--aksent` #05806F (K-234; palett 1.1 fra Design har #068472). Tekst på aksentflate er Off White #FBF9F6 (K-234, aldri #FFFFFF). Sju statuser (ny, pågår, venter, sannsynlig, ferdig, advarsel/prisavvik, feil/stopper), hver med fg/bg/kant, bare i piller og varsler og alltid med tekst. Ingen hex i skjermene, bare tokens.
- **Kundetema:** kundeportalen bruker butikkens eget uttrykk (`data-kundetema="sigdal"`, se [Kundetema Sigdal](#kundetema-sigdal)).
- **Modus:** CRM, admin, nettsider og kundeportal er **bare lyse** (K-201). Mørk modus (`data-tema="mork"`) bare i Hengsel Ute og iOS-appen. Økt kontrast via `prefers-contrast: more`. P3 via `color-gamut: p3`.
- **Plattformlag:** a) PC, b) under 1024 px (44 px trykkflater, 16 px skrift), c) iOS (systemflater, Liquid Glass), d) Expo/Android: samme Hengsel Ute-app som på iOS, uten glass (besluttet 16.10). I CRM-et er a og b besluttet og på for alle (K-222, `plattform.css` med `html[data-flate]`); filene fra Design bruker `data-plattform="pc|ios|expo"` og merker a–d som foreslått.
- **Skrift:** Schibsted Grotesk på nett, i CRM og admin. Fontfilene ligger i `assets/fonts/` og lastes ikke fra Google. SF Pro (system) på iOS, systemskrift i Expo. PC-skala: sidetittel 28/700 (−0,6 px), korttittel 16/700, grunn 15, tabell 14, meta 13, pille 12/600. Linjehøyde 1,45. `tabular-nums` bare på beløp og antall.
- **Bakgrunner:** ensfargede flater. Ingen gradienter, mønstre eller illustrasjoner. Stripemønster brukes bare som plassholder for tegninger og bilder.
- **Kort:** `flate-kort` på `flate-side`, 1 px `--ramme`, radius 14, `--skygge-kort` (0 1px 2px). Padding 16×18. Ikke kort i kort; lister går helt ut til kanten med 1 px `--linje` mellom radene. iOS: radius 20 uten ramme.
- **Radier:** felt og knapp 10, kort 14, pille 999. iOS kort 20, store knapper 28.
- **Skygger:** `--skygge-kort` på kort, `--skygge-flytende` på dialog, meny og toast. Ingen indre skygger.
- **Knapper:** 36 px på PC (mus), 44 px touch, 52–56 px hovedknapp nederst i appen. Primær furu med `--paa-aksent`; sekundær med `--kant`; tekstknapp i `--aksent-tekst`.
- **Hover:** primær → `--aksent-trykk`; sekundær, rader og menypunkter → `--flate-hover`. **Valgt:** `--flate-valgt` med `--aksent-tekst`. **Deaktivert:** 45 % opasitet.
- **Fokus:** 2 px aksent (`--fokus-ring`). Felt får aksentkant.
- **Animasjon:** nesten ingen. 160 ms `cubic-bezier(.2,.7,.2,1)` på farge og fremdrift. Ingen sprett.
- **Glass og blur:** bare på iOS (Liquid Glass i fanelinje, verktøylinje, sidefelt og flytende knapper; aktiv fane tonet med furu). Toppfeltet på PC har blur 8 px. Ellers ikke.
- **Layout:** følger [Layout-regler](#layout-regler). Før 16.10 hadde CRM fast sidemeny 248 px (butikkvalg øverst, Hengsel CRM-logo med versjon nederst) og toppfelt 60 px med kundens logo øverst til høyre (maks 28 px); ikonstripe 72 px på iPad stående og under 1024 px (avvik A11).
- **Avstand:** 4, 8, 12, 16, 20, 24, 32. Side 28, mellom kort 16, i kort 18.
- **Tetthet:** tabeller tett 36 / normal 44 / luftig 52 px.

## Ikoner

- **Besluttet 16.10:** Hengsels eget ikonsett på nett og i CRM, SF Symbols på iOS. Material Symbols brukes ikke.
- **Eget ikonsett:** strekikoner i `ikoner/` og `assets/ikoner/` (16, 20, 24 px), runde ender, `currentColor`, strek 1,5–1,75 etter størrelse. Sprite (`hengsel-ikoner.svg`) og `assets/ikoner/hengsel-ikoner.js` (`window.HengselIkoner`) for kitene. Komponent: `Ikon` (kitene) og `<Ikon navn="ordre" />` i CRM-et (`src/komponenter/ikon/`, generert av `node scripts/design/lag-ikoner.mjs`).
- **iOS:** SF Symbols. `ikoner.json` har riktig SF Symbol for hvert ikon, og «egen» der SF Symbols ikke har et godt treff.
- **Aktiv:** samme ikon i `--aksent-tekst`. Ingen fylte varianter.
- Ingen emoji, ingen ikonfont, ingen PNG-ikoner.
- **Merke og logo:** merket v3: to blad i blekk (høyre smalere) og stift i furu. Logoene i `assets/logo/` (Hengsel, CRM, Ute, Admin, Levering; lys, mørk, hvit, blekk, glass, tonet). App-ikon: `assets/app-ikon/`. Favicon: `assets/favicon/`. Ikke tegn merket på nytt (se [Logo og kundens logo](#logo-og-kundens-logo)).

## Åpne spørsmål (fra Design, 17.10)

- hengsel.no har ikke sidene «For butikkleder / kjede», «Kunder og referanser» og «Om oss». De lages når teksten finnes.
- Kundetema Sigdal: TWK Lausanne er lisensiert; lisensen må dekke portalen.
- Signering i portalen er satt til BankID i Penneo og innlogging til SMS-kode, slik hengsel.no beskriver det.
- Plattformlag c og d er foreslått i filene fra Design. Det er ikke bestemt hvem som godkjenner dem.
- Fargene i filene fra Design som avviker fra `hengsel.tokens.json` (se fargesjekken over).

## K-256, 15.10.2026 (to nye tokens fra Admin fase A, S-62)

- **`flate-kolonne`** (60-213 punkt k.7): flaten bak tavlekolonner, `#E3E6EA` i lys og `#191B1F` i mørk. **`aksent-paa-mork`** (punkt k.12): aksent for ikoner og tekst på mørk flate (toasten), `#54B9A5` i begge utgaver. `paa-aksent` er fortsatt tekst på aksentflate. Ingen andre verdier er endret; utfilene er generert på nytt. Admin (nettsider) bruker dem etter at ny commit er pinnet (`npm run design:hent`). iOS kan hente `flateKolonne` og `aksentPaaMork` fra `tokens/HengselTokens.swift` når appen trenger dem.

## K-220, 14.10.2026 (pakke design_handoff_hengsel_furu_v2)

- **Besluttet og inne:** grunnpaletten (lys, mørk, økt kontrast, P3; lik K-206, kontrollert verdi for verdi mot pakken), ikonsettet (`ikoner/`: 49 ikoner i 16, 20 og 24, `ikoner.json` med SF Symbol, `IKONER.md`, sprite) og logoene. `src/komponenter/ikon/` (`<Ikon navn="ordre" />`, generert av `node scripts/design/lag-ikoner.mjs`) bruker settet i CRM-et.
- **Foreslått i K-220, besluttet i K-222 (se under):** plattformlag a (PC) og b (under 1024 px), `ramme`/`overlegg`/`alltid-mork` fra K-206 (a) og de mørke verdiene `tekst-svak` #90969D og kant #767B82.
- Pakkens README og PLATTFORMLAG ligger i `kilde/OVERLEVERING-v2-*.md`; hele pakken (også MIGRERING og KONTROLL, som lister de gamle fargekodene) ligger i `design/handoff/`.

## K-230, 14.10.2026 (pakke design/handoff/hengsel_merke_v2)

- Logoer, favicon med flis, PWA- og app-ikoner og de fire nye ikonene (Montasjeplan, Innboks, Profil, Hjelp) er lagt inn under `assets/` og `ikoner/` som i pakken. Motion, delingsbilder og butikkgrafikk (`1-motion`, `2-deling`, `3-butikk`) brukes ikke av appene og ligger bare i `design/handoff/`.
- `node scripts/kopier-merkepakke.mjs` kopierer favicon, PWA-ikoner og «Sendt med»/«Levert av» til `public/` og PDF-malene. `python3 montorapp/scripts/kopier-appikon.py` gjør det samme for Hengsel Ute.

## K-222, 14.10.2026 (Eiriks beslutninger på pakke v2, del 2)

- **Grunnpaletten (`farge` i JSON):** `ramme` er #CBCFD4 overalt (PC-laget har ikke egen ramme lenger; mørk #3D4248). `overlegg` er rgba(26,29,34,.40) i lys og rgba(0,0,0,.60) i mørk, `alltid-mork` er #0B0D11, og **`paa-alltid-mork` (#EAEDF0) er ny** (tekst og ikoner på alltid-mork). Mørk `tekst-svak` er #90969D (4,57:1 på valgt flate) og mørk `kant` er #767B82 (3,20:1 på #13332D); økt kontrast er uendret. CSS, ts og swift er generert på nytt. **K-221 (iOS) må hente de nye swift-verdiene** fra `tokens/HengselTokens.swift`: `kant` og `tekstSvak` i mørk, `ramme` (mørk #3D4248), `overlegg` (nå dynamisk lys/mørk, var en enkelt `Color`), `alltidMork` #0B0D11 og nye `paaAlltidMork`.
- **Plattformlagene a og b er på for alle i CRM-et.** `V4Skall` (`useFlateLag`) setter `data-flate="skrivebord nettleser"` på `<html>`; kundeportalen og nettsidene har ikke attributtet. Bryteren «Prøv nytt PC-oppsett» er fjernet. Tettheten (`data-tetthet="tett|luftig"`; normal er standard) lagres per bruker i `bruker_utseende` (Supabase, RLS bare egen rad), med nettleserens lagring som hurtigbuffer.
- **Menyen:** nettbrett 768–1023 px har skuff (300 px, `--skuff-bredde`) bak menyknappen i toppfeltet; under 768 px er bunnfanene Min dag, Kunder, Ordre og Saker + Mer.
- **Logoer og favicon godkjent:** de monokrome produktlogoene (`assets/logo/`) og favicon-pakken (`assets/favicon/`, brukt i `public/`). Logoplasseringen i CRM-et (toppfelt, versjonslinje) gjøres i K-218.
- **Montørappen (Expo, også Android):** `montorapp/tokens/hengsel-tokens.ts` (generert av `lag-tokens.mjs`: `grunn` og lag d `montorapp`, med `useHengselTema()`), ikonsettet som SVG via react-native-svg og lag d («som iPhone/iPad uten glass», mørk kant #767B82).

## Fasit K-206, 13.10.2026 (Eiriks valg)

0. **Palett «blekk med furu»** (kilde `kilde/hengsel-palett.tokens.json`): blekk som tekst, furu som aksent (`#068472` lys, `#54B9A5` mørk; K-234 satte aksent lys til `#05806F`), sideflate `#F6F8FB`, kortflate `#FBFDFF`, sju statustoner (`ny`, `pagar`, `venter`, `sannsynlig`, `ferdig`, `advarsel`, `feil`), økt kontrast og Display P3. **Nytt merke** med smalere høyre blad. **Skrift: Schibsted Grotesk** i CRM, admin, nettsidene og montørappen. Kundetemaet, kundeportalen, PDF og e-post til kunde beholder Sigdal-temaet. Se `guidelines/farger.md`, `skrift.md` og `hengsel-merke.md`.

## Fasit 12.10.2026 (Eiriks valg, delvis avløst av K-206)

1. **Skrift (avløst av K-206):** Hengsel har ett skriftsett, **Schibsted Grotesk** (variabel 400–800). På iPhone (Hengsel Ute) brukes systemskriften **SF Pro**. Inter og Newsreader ligger igjen for kundetemaet. Kundens egne skrifter hører til kundetemaet, ikke til Hengsel. Se `guidelines/skrift.md`.
2. **Kundetema:** kunden kan velge logo, aksent og skrift bare på det sluttkunden ser: tilbud og kontrakt (PDF), e-post til kunde og kundeportal. CRM, montørapp, Hengsel Ute og admin har alltid Hengsel-skrift. Se `guidelines/kundetema.md` og `kundetema` i JSON.
3. **Mørk bakgrunn er `#0B0D11`** (`--flate-side` mørk, palett 1.0; mørk gjelder bare montørappen og iOS).
4. **iOS:** Hengsel Ute bruker tokens på flatene (side `#F6F8FB` / `#0B0D11`, kort `#FBFDFF` / `#111418`). Knapper, lister og kontroller følger iOS. Furu som tekst på sideflaten bruker `aksent-tekst` `#016D5E`, ikke `aksent`.
5. **`sannsynlig`** har lys og mørk fg, bg og kant (forslag), og alle sju statustoner vises i lys og mørk på `index.html`.

## Endre tokens

1. Rediger `tokens/hengsel.tokens.json` (og bare den).
2. Kjør `node scripts/design/lag-tokens.mjs`. Det skriver `tokens.css`, `plattform.css`, `fonts.css`, `fonts-fri-liste.css`, `tokens.ts`, `HengselTokens.swift`, `index.html`, `montorapp/tokens/` og kopien i `claude-design/`.
3. `npm test` feiler (`scripts/design/lag-tokens.test.ts`) hvis en utfil ikke matcher JSON, hvis `--mark-*` dukker opp, eller hvis kontrasten i et viktig fargepar blir under 4,5:1.

Hold navn og verdier i JSON. Ikke rediger utfilene for hånd. Filene fra Design (`hengsel-palett.*`, `grunn.css`, `layout.css`, `ios.css`, `plattform/`) genereres ikke herfra; de kommer fra Designs egen palettfil.

## Slik henter hver flate tokens

| Flate | Henter | Slik |
|---|---|---|
| **CRM (web)** | `tokens.css`, `fonts.css` og `tokens.ts` | `import '…/_ds/hengsel-designsystem/tokens/tokens.css'` og `fonts.css` i `src/main.tsx` (Schibsted Grotesk). Rollenavnene (`--flate-side`, `--tekst`, `--aksent` …) er de samme som i `src/tema/lys-mork.css`. CRM-et er bare lyst (K-201). `tokens.ts` for farger i kode (`farge('aksent', 'lys')`). Tailwind peker på variablene som i dag. |
| **Kundeportal** | `tokens.css` | Samme som CRM. `<html data-alltid-lys>` gjør at den aldri blir mørk. Merke: `Brand form="levert-av"`. Kundetema Sigdal: se over. |
| **E-post og PDF** | `tokens.ts` + SVG/PNG | E-post har ikke CSS-variabler. Les verdier fra `tokens.ts` (`roller`, `farge()`) når malen bygges. Merke: `sendt-med` (PNG 2×) i e-post og `hengsel` ensfarget i PDF. Alltid lys utgave. Sigdal-toppen: `templates/epost/`. |
| **Montørappen (Expo)** | `tokens.ts` | `import { roller, status } from '…/tokens/tokens'`. Samme form som `TOKENS` i `montorapp/src/theme.ts` (`{ lys, mork }`). `montorapp/src/palett.ts` bør bygge på `roller` og `status`. Skriften (Schibsted Grotesk fra `assets/fonts/`) lastes av appen selv med expo-font. Logoer i appen: kopier SVG-ene til appens `assets/`. |
| **Hengsel Ute (iOS)** | `HengselTokens.swift` | Legg fila i målet `Hengsel`. **Flatene bruker navngitte farger** (lys/mørk følger enheten): `HengselTokens.Ios.side` (`#F6F8FB` / `#0B0D11`), `.kort` (`#FBFDFF` / `#111418`), `.senket`, `.valgt`, `.linje`, `.tekst`, `.tekstDempet`. **Furu som tekst på sideflaten: `HengselTokens.Ios.lenke`** (`#016D5E`), aldri `.aksent`. Knapper, lister og kontroller følger iOS. Tekst er systemskriften SF Pro med Dynamic Type; Øvrige: `HengselTokens.Farge.*`, `HengselTokens.Status.ferdig.fg`, `HengselTokens.Radius.kortStor`. Fargene følger lys/mørk og økt kontrast (`accessibilityContrast`) og er i Display P3. Logo: `Hengsel Ute.icon` og SVG-ene i Xcode. |
| **hengsel.no** | `tokens.css` | Kopier `tokens.css` til `packages/design/src/styles/` (eller importer fra en delt pakke). `sites/hengsel/src/styles/hengsel.css` peker sine variabler (`--bg`, `--ink` …) på rollene. Kopier SVG-ene til `public/logo/`. |
| **vis.hengsel.no** | `tokens.css` | Samme som hengsel.no. `sites/vis/src/assets/vis.css` har egne fargetokens i dag og skal peke på rollene. |
| **design.hengsel.no** | `tokens.css`, `index.html` | Publiser `index.html` med `tokens/`, `assets/logo/` og `components/` ved siden av. `?tema=dark` eller `data-theme` på `<html>` låser utgaven. |
| **admin.hengsel.no** | `tokens.css` | Samme som hengsel.no. Sett `data-theme` eller la systemet bestemme. |

Hvordan hver flate faktisk avviker i dag, står i `claude/k186-rapport.md` (egne økter retter appene).

## Kundetema

`tokens.ts` har `kundetema` (de to eksemplene: Eksempel Interiør AS og Eksempel Kjøkken AS, den frie listen) og `kundetemaCss(tema)`, som gir `--kunde-aksent`, `--kunde-paa-aksent`, `--kunde-skrift-tekst` og `--kunde-skrift-overskrift` til en flate. Bruk dem bare i PDF-mal, e-postmal og kundeportal (alltid lyse). Reglene for aksent og skrift står i `guidelines/kundetema.md`, og testen sjekker kontrasten (aksent ≥ 4,5:1 mot Off White eller egen tekst-på-aksent, og ≥ 3:1 mot `#1F1914`). Kundetema Sigdal fra 2.0 er beskrevet [over](#kundetema-sigdal).

## Logo og kundens logo

Reglene (kunden først, Hengsel nederst, minstemål, fri sone) står i `guidelines/hengsel-merke.md` og `guidelines/kundetema.md`. I React:

```tsx
import { Brand } from '…/_ds/hengsel-designsystem/components/Brand/Brand';
<Brand form="crm" hoyde={16} />
```

`Brand` tegner SVG-filene i `assets/logo/` uendret. Kopier mappa til flatens `public/logo/` (standard `base="/logo/"`). Det finnes ingen `--mark-*`-tokens. Det gamle H-merket (v2) ligger i `assets/arkiv/v2-h-merke/` og skal ikke brukes.

## Kilder

- `docs/design/hengsel-merke-v3/README.md` (merket, punkt 3–8)
- `docs/design/v4/crm/07 Lys og mork.dc.html` og `src/tema/lys-mork.css` (lys og mørk)
- `docs/design/v4/crm/komponenter.md` (komponenter)
- `montorapp/src/palett.ts` (statusfarger i mørk utgave)
- `claude/k175-rapport.md` punkt 68 (hva som manglet i `_ds`)
- Designsystem 2.0 (Design, S-68): palett 1.1 fra `design_handoff_hengsel_furu_v2/tokens/` (her `tokens/hengsel-palett.tokens.json`); `design_handoff_hengsel_furu_v2/` (PLATTFORMLAG, MIGRERING, KONTROLL med 284 kontrastpar, ikoner, Swift, React Native, Android, Tailwind; her i `dokumentasjon/` og `plattform/`); `design_handoff_hengsel_plattform/` (APP.md, HengselFarger.swift, HengselPlattform.swift, montor-tema.ts); merket v3, logoer og Icon Composer-pakken; `11_crm-saker/S-65` og `S-67` (komponentene og CRM-kitet). Det gamle designsystemet i Design (prosjekt 5a9d09c6-be10-4ae1-a516-a0a32d786c17) er arkiv.
