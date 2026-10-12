# K-174 · Hengsel-merket v3 i nettsidene

Gren `claude/k174-hengsel-merke` (fra `origin/claude/hengsel-merke-v3`, flettet på nytt etter Designs siste levering `6751362`) → PR mot `main`. **Ikke flettet.** Ingen passord eller nøkler i noen fil eller i denne rapporten.
Fasit: `brand/hengsel-merke/` (README, `ENDRINGER-merkebytte-1210.md`) og `docs/design/hengsel/`. Filene i merkepakken er brukt som de er (ikke tegnet om, ingen nye farger eller effekter, aksent-lys/-mørk som standard). Bare filene som brukes er kopiert til `public/` (ingen `brand/`- eller `docs/`-mapper i bygget).

Skjermbilder (390 og 1440 px, lys og mørk): `claude/k174-skjermbilder/foer/` og `claude/k174-skjermbilder/etter/`, 44 i hver. Sider: hengsel `/`, `/crm`, `/ute`, `/kundeportal`, `/dokumenter`, `/apptest`, `/apptest/passord`; vis `/`, `/crm/`, `/dokumenter/`; sngroup `/`.

## Gjort per nettsted

**sites/hengsel**
- Logo i sidehode og bunn: `hengsel-aksent-*`, 30 px (34 px fra 1180 px) i meny og apptest-hode, 30 px i bunn. /ute-heroen: `hengsel-ute-aksent-*` 34 px. /crm-heroen: `hengsel-crm-aksent-*` 34 px (erstatter eyebrow-teksten «Hengsel CRM»; alt-teksten er den samme).
- /apptest og passordsiden: nytt sidehode; appikonet (`logo/ute.svg`) i «Bli tester» på /ute og i ikonflisen på /apptest.
- Favicon, apple-touch, `manifest.webmanifest` og `theme-color` fra `favicon/head.html` via `Side.astro` (nytt valg `manifest` i `BaseLayout`). Filene ligger i `public/` (`favicon.svg`, `-32`, `-180`, `-192`, `-512`).
- og:image: Designs filer brukt som de er: `og.png` (hengsel.no) og `og-apptest.png` (/apptest, via `delingsbilde`).
- Demoskjermene (Designs oppdaterte CrmSkjerm, PortalSkjerm, Enhet, A4Side): «by Hengsel» fjernet under «Din logo»; CRM-sidemenyen har `crm-aksent` 16 px + «v. {versjon}» nederst; kundeportalen har `levert-av-aksent` 14 px nederst; A4-dokumentene har `hengsel-lys.svg` 3 mm i bunnlinja til høyre (`logoSti` i `renderA4Side`). Versjonen i CRM-skjermen hentes fra appens versjon (`APPTEST.versjon`, nå 1.7.0), ikke «4.2».
- Teksten «Levert med» er erstattet av logoen «Levert av» (alt: «Levert av Hengsel»).
- Fjernet: hele gamle `public/logo/*`, `public/favicon.svg`, `public/img/hengsel-{app-ikon,crm-logo,merke}-lys.svg`, `public/img/logo-epost.png` (gammelt merke, ikke brukt), `src/assets/hengsel-ute-logo-mork.svg`, `UteLogo.astro` (ubrukt).

**sites/vis**
- Toppfelt og topplinje i rommene: `hengsel-aksent` 28 px. «Samtidig i …»: `crm-aksent` 24 px. CRM-noden i Ordrens reise (34 px) og navet i Systemkartet (42 px): `hengsel-crm-aksent`. Bunnlinja: «Levert av» + Hengsel (`levert-av-aksent`) 14 px. Dokumentmalene: `hengsel-lys.svg` 3 mm i bunnlinja.
- Favicon, apple-touch og `theme-color` (lys #FBF9F6, mørk #1B1713) på alle 30 sider; `og:image` = Designs `og-vis-hengsel-no`. Ikke manifest (vis har ingen), så `vis-maskable-512.svg` er ikke brukt.
- Markørene i HTML heter nå `<!--logo-hengsel N [skjema]-->` (var `hengsel-logo`). Gamle `src/assets/logo/*` (inkl. `HengselBrand.jsx.txt`, `hengsel-brand.css`, PNG-er) fjernet.
- Produktnavn i eyebrow skrives ikke lenger med store bokstaver (`.eyebrow.navn`).

**sites/sngroup**
- Familiebåndet viser `hengsel-aksent-*` 24 px i stedet for teksten «hengsel.no» (nytt valg `hengselLogo` i `Familiebaand.astro`; byggem og vis bruker det ikke). Hengsel-seksjonen på forsiden bruker de nye logoene. Teksten «CRM by Hengsel og montørappen Hengsel» er «Hengsel CRM og montørappen Hengsel Ute».

**Tekst (punkt 5):** «Hengsel CRM» og «Hengsel Ute» første gang, deretter «CRM»/«Ute» i løpende tekst (rettet i Slik virker det). Ingen «HENGSEL» i tekst eller i gjengitt tekst.

## Designfasit: endringer utover logoen (punkt 0)
Sammenlignet de åtte sidene og /apptest mot dagens sites/hengsel: alle 731 tekstene i LES-MEG «Tekstene ordrett» finnes i den bygde siden. De 12 som ikke ble funnet er forklart: «Levert med» og «Laget i Hengsel» (byttet i merkepakken), tre alt-/placeholder-tekster og dynamiske tekster («Takk, …»). Ingen innholdsendringer, ingen nye seksjoner. Funn:
1. **Rot-skriftstørrelse (rettet):** designet setter `html, body { font-size: 17px }`, så 1 rem = 17 px. Siden hadde 16 px på `html`, så alle rem-mål var 6 % mindre enn i designet. Satt `html { font-size: 17px }` og `body { font-size: 1rem }` i `sites/hengsel/src/styles/hengsel.css`. Alle sjekker (ingen vannrett rulling, kontrast) er kjørt etter endringen. **Dette endrer utseendet på alle hengsel.no-sider litt (alt blir 6 % større); se etter-bildene.**
2. **Tekst under appikonet:** designets /apptest viser «Hengsel», men `Logo-bruk` og README sier «Ute» under ikonet. Satt «Ute» (`ApptestIkon.astro`).
3. **/apptest-skjermbilder:** designet bruker iOS-skjermer med «Din logo»-overlegg og Dynamic Island; siden bruker de ekte appskjermene fra K-172. Uendret.
4. **Versjon/dato i designets /apptest** (0.9.3, 11. oktober) er eksempler; siden leser dem fra `apptest-lenker.ts`.
5. **`?tema=` og `?feil=`** finnes ikke i bygget (som i K-172).
6. **CRM-hero:** designet har eyebrow-teksten «Hengsel CRM», README ber om logo i heroen; logoen er brukt.
7. **Skrifter:** sidene bruker bare Newsreader og Inter (selvhostet fra `@fontsource-variable`); skriptet sjekker at ingen andre skrifter lastes, og `git ls-files` har ingen Reckless/TWK Lausanne. Navnene står fortsatt i designsystemets `readme.md` under `docs/design/` (Designs fil, ikke rørt).

## Sjekkliste (README punkt 8, nettsidene)
- [x] Søk etter `engsel` (som eget ord), `hengsel-logo`, `hengsel-merke`, `2b`, `L9`, `by Hengsel` og `Levert med`: ingen treff utenom `brand/`, `docs/design/`, `claude/`-rapporter, `docs/k87-*` og `docs/kilde/hengsel.no` (arkiv) og `sites/vis/fasit` (frittstående arkivfil). To bevisste treff: testen `scripts/dokumenter.test.mjs` sjekker at «by Hengsel» ikke finnes, og `sites/vis/README.md`/`SJEKKLISTE.md` er oppdatert.
- [x] Hengsel på samme sted i lys og mørk (se skjermbildene). Kundelogo-variantene (lang, kort, ingen) gjelder CRM, Ute og portalen, ikke nettsidene.
- [x] Kundens logo er aldri mindre enn Hengsel i skjermene («Din logo» 34–40 px, Hengsel 14–16 px).
- [ ] Favicon i Safari, Chrome, Edge og iOS (Legg til på Hjem-skjerm): ikke testet i ekte nettlesere/enheter.
- [n/a] Ute-ikonet i iOS 26 og Android, «Ute» under ikonet, butikkenes tekster: gjelder appene, ikke nettsidene.
- [x] Ingen UI-tekst sier «Hengsel» der butikkens navn skal stå (demoskjermene viser «Din logo»/«Butikknavn»).

## Kjørt
- `npm run build`: grønt. `npm test`: 42 av 42 tester og lenkesjekken (340 forespørsler, 0 feil).
- `npm run skjermbilder` (390/1440, lys/mørk): 0 feil (ingen konsollfeil, ingen vannrett rulling, ingen style-attributter eller inline-skript, bare Newsreader/Inter, ingen eksterne forespørsler). Skriptets utdata til `claude/k160-skjermbilder/`, `k172-skjermbilder/` og `docs/skjermbilder/` er ikke lagt med i PR-en (de gamle ligger urørt); «etter»-bildene i `k174-skjermbilder/` er laget med eget skript fra samme bygg.
- Kontrast: axe-core (color-contrast) på 11 hengsel-sider, 7 vis-sider og 3 sngroup-sider, 390 og 1440 px, lys og mørk: 0 brudd (minst 4,5:1).

## Det som gjenstår
1. **Skjermbildene** (`hengsel.no/img/`, `ute-*`, `crm-*`, `portal-tilbud`, `dok-forside` m.fl.) og `sites/sngroup/public/skjermbilder/` viser «by Hengsel» eller det gamle ikonet og må tas på nytt når merket er byttet i appene (som `ENDRINGER-merkebytte-1210.md` sier). Ikke gjort her.
2. **CRM på telefon** har ikke logo nederst (menyen ≡ er ikke åpen i skjermen).
3. **byggem.no**: familiebåndet viser fortsatt teksten «hengsel.no» (README nevner bare sngroup.no). Avklar om byggem skal ha logoen også.
4. **Visningsrommets innlogging** er Cloudflare Access (ingen egen innloggingsside i repoet), så den er ikke byttet.
5. **sngroup.no `favicon.svg`** er SN Groups eget og har fortsatt c2pa-metadata; ikke Hengsel-fil, ikke rørt.
6. Personvern-teksten på hengsel.no og sngroup.no («Montørappen Hengsel») er juridisk tekst og ikke endret til «Hengsel Ute».
7. Favicon må sjekkes i ekte nettlesere og på iOS.
8. Rot-skriftstørrelsen (17 px) bør godkjennes av Eirik, siden den endrer utseendet litt på alle hengsel.no-sider.

K-174 KLAR
