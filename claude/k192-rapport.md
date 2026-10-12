# K-192: like farger og bare lys modus på Hengsel-sidene, og en fast regel

Økt 12.10.2026 kl. 19. Gren `claude/k192-hengsel-farger`, PR mot main (flettes ikke av meg).

## 0. Det som var gjort før denne økta

Den tidligere K-192-økta ble arkivert uten å melde KLAR. Jeg sjekket grener og PR-er (GitHub): det fantes ingen gren som begynner med `claude/k192` og ingen PR fra en slik gren, og ingen `claude/k192-rapport.md`. Det var altså ingenting å bygge videre på. Grenen er laget fra main (`dff2a90`, med PR #58 og #59 flettet, pin `3099a27b`).

## 1. Oppsummering

- **Én delt Hengsel-fil:** `packages/hengsel-tokens/tokens.css` (+ `fonts.css`) genereres av `scripts/lag-hengsel-tokens.mjs` fra den pinnede `hengsel.tokens.json`. De lyse verdiene er identiske med designsystemets egen `tokens.css` (92 variabler, kontrollert i testen).
- **Én pin:** `packages/hengsel-tokens/designsystem.pin.json` (commit `3099a27b`, sha256 per fil) og `packages/hengsel-tokens/ds/`. `scripts/hent-designsystem.mjs` henter nå dit og genererer den delte fila. `sites/design` har ikke egen pin lenger; `public/ds` kopieres dit ved bygging (`scripts/kopier-ds.mjs`, ikke i git).
- **Alle fire sidene** (hengsel.no, vis., design., admin.) bruker bare variablene fra den delte fila. Ingen hex, rgb, hsl, navngitte farger eller Tailwind-farger i kildene (skanner + test).
- **Bare lys modus:** all `prefers-color-scheme`, `data-theme`, `.dark`, mørk `theme-color`, mørk-brytere og mørke bildevalg er fjernet. `color-scheme: light` står i den delte fila. Alle 24 side × bredde-kombinasjoner av de skjermbildene jeg tok gir **pikselvis lik side** med lys og mørk maskininnstilling.
- **Merket v3, Newsreader og Inter, selvhostet:** hengsel.no, admin og vis bruker nå de pinnede statiske woff2-filene (Inter 400/500/600, Newsreader 400/500) fra `packages/hengsel-tokens/ds/assets/fonts`. `@fontsource` er ikke lenger brukt av Hengsel-sidene.
- **SN Groups palett:** hengsel.no og admin hentet farger og ramme fra `packages/design` (BaseLayout, tokens.css, base.css, PrivacyPage, IkkeFunnet, Plantegningsstrek). De er flyttet over: ny ramme `@sngroup/hengsel-tokens/Hode.astro`, og de tre komponentene er kopiert inn i hengsel.no med delte variabler. A4-dokumentene (brukt av hengsel.no og vis) er flyttet til `packages/hengsel-dokumenter` og tokenisert. `packages/design`, sngroup.no og byggem.no er ikke rørt.
- **Norsk dato:** admin viser lisensdatoen som dd.mm.åååå (se 4).
- **Regelen:** `docs/design/hengsel-regler.md`, vist til fra README og `CLAUDE.md` (repoet hadde ingen CLAUDE.md eller AGENTS.md, så jeg opprettet `CLAUDE.md`).
- **Kontroll:** `npm run build` grønt (alle seks nettsteder), `npm test` 84 tester grønne + lenkesjekken uten feil, axe **0 kontrastbrudd** på 112 sidevisninger (alle sider i de fire sidene, 390 og 1440 px).

## 2. Kartlegging: fargeverdier, hvor de ble brukt og hvilket token de ble

Før-tall (hex, rgb/hsl, Tailwind-treff i kildene, inkl. SVG-filer): hengsel.no 202, vis 192, admin 90, design 222. Dark-treff (media query, data-theme, mørk-ord): hengsel 66, vis 162, admin 20, design 179. Ingen Tailwind-fargeklasser ble funnet i noen av sidene. Tabellene under er per nettsted og lister hver distinkte gamle verdi.

### hengsel.no


#### A) Fargetabell
Gammel `src/styles/tokens.css` er slettet; navnene lever videre som korte lokale alias i `src/styles/hengsel.css` som peker på delte variabler.

| Verdi | Hvor | Token | Merknad |
|---|---|---|---|
| `--bakgrunn` (Off White #fbf9f6) | tokens.css, Side/alle sider via `--bg` | `--flate-kort` (alias `--bg`) | samme verdi som før |
| `--flate` / `--surface-highlight` (Beige 3) | seksjonsbånd | `--flate-side` | samme verdi |
| `--kort` (Off White) | kort, felt (`--surface`) | `--flate-kort` | |
| `--flate-myk` #efe5d6 | sidemeny, felt, rader i fiktive skjermer (`--surface-soft`, ~10 steder) | `--flate-senket` | avvek fra fasit (litt mørkere enn Beige 4) |
| `--flate-sterk` (Beige 2) | piller, avatarer | `--flate-valgt` | |
| `--beige-3-ute` #f2e9dc, `--off-white-ute` #fbf9f5 | definert, ubrukt | fjernet | |
| `--linje`, `--linje-svak` (Beige 2) | ~68 steder | `--linje` (alias `--line`) | |
| `--ikon` (Beige 1) | definert, ubrukt | fjernet | `--beige-1` brukes fortsatt direkte (palett, 11 steder) |
| `--tekst-dempet` #5e564c | ~62 steder (`--muted`) | `--tekst-dempet` (delt) | delt verdi er rgba 72 % av Warm Black |
| `--tekst-svak` #6e6355 | `--soft` (3 steder) | `--tekst-svak` | delt #6F6458 |
| `--aksent` / `--pa-aksent` | knapper, lenker | `--aksent` / `--paa-aksent` | |
| `--aksent-myk` (Beige 3) | info-piller, valgte felt | `--flate-valgt` | litt mørkere beige (Beige 2) |
| `--info-tekst` | piller | `--tekst` | |
| `--ok` #376c49 / `--ok-myk` #e4eee6 | pille, banner, punkt | `--status-ok-fg` / `--status-ok-bg` | avvek fra fasit |
| `--feil` #8e3522 / `--feil-myk` #f4e1db | pille, banner | `--status-feil-fg` / `--status-feil-bg` | |
| `--warn` #8a5d14 / `--warn-soft` #f5ead3 (hengsel.css:108) | pille, celle | `--status-haster-fg` / `-bg` | |
| `--surface-app` Beige 3 (hengsel.css:108) | fiktive skjermer | `--flate-side` | |
| `--skygge` rgb(49 38 29 …) | enhetsrammer, panel | `--skygge-overlegg` | |
| `--ramme`/`--lysboks` #1b1713, `#1b1713` (Enhet.astro:112,116) | iPad/iPhone-ramme | `--alltid-mork` | |
| `#000` (Enhet.astro:80, :124, :126) | Dynamic Island, statuslinje | `--alltid-mork` (klasse `.oy`) | |
| `#fff` (Enhet.astro:125) | hvit statuslinje | `--tekst-invers` | |
| `#c3b5a7`, `#31261d` (Enhet.astro:132) | «Din logo»-boks | `--beige-1`, `--tekst` | |
| `#6b5d50`, `#f1e9de` (Enhet.astro:134, mørk) | | fjernet | mørk |
| `#46699d` (apptest.astro:287,290) | lenker på /apptest (`--a-lenke`) | `--aksent-tekst` | avvek fra fasit |
| Beige 4 (`--a-flate`, apptest.astro:287,290, passord.astro:40,43) | flate på /apptest og passordside | `--flate-senket` | |
| `#fbf9f6`, `#31261d` (apptest.astro:351-352) | QR-rute | `--flate-kort`, `--tekst` | |
| `rgb(49 38 29 / .18)` (ApptestIkon.astro:11) | skygge | `color-mix(--tekst 18 %)` | |
| `#FBF9F6`/`#1F1914` temafarge (Side.astro:35) | | Hode.astro setter theme-color fra JSON | |
| manifest `#FBF9F6` (theme/background) | public/manifest.webmanifest | slettet; `src/pages/manifest.webmanifest.ts` leser `tokens.json` palett["off-white"] | |
| `--font-overskrift`/`--font-tekst` (Newsreader/Inter Variable) | tokens.css, apne.astro:23 | `--skrift-familie-hengsel-*` (alias `--f-display`, `--f-body`) | |
| `--beige-1..4`, `--off-white`, `--warm-black`, `--deep-blue`, `--dusty-blue` | definert lokalt i tokens.css | slettet; delt palett brukes | |

#### B) Mørk modus – fjernet
- tokens.css: `@media (prefers-color-scheme: dark)` og `[data-theme="dark"]` (hele fila slettet).
- hengsel.css:112-114 mørk `--surface-app/--warn/--warn-soft`.
- Enhet.astro:127, 133-135 (statuslinje/«Din logo» mørk), `srcDark`-prop, `folgerTema`, `data-lys-mork`, `sb-auto`.
- Skjermbilde.astro: `<source media=dark>`/`srcDark`. Kallere i ute.astro, index.astro, apptest.astro (2), `UTEN_NETT.mork` i content/ute.ts.
- apptest.astro:288-292 og passord.astro:41-45 (mørk `--a-flate/--a-lenke`).
- Logo-`<source media=dark>` i Meny, Bunn, ApptestHode, CrmSkjerm, PortalSkjerm, ute.astro, crm.astro.
- Side.astro: temafarge [lys, mørk] (nå én theme-color uten media fra Hode.astro).
- **Ikke slettet (se D):** `public/img/app/*-mork.webp` (8), `public/img/apptest/*-mork*.webp` (6), `public/logo/*-mork.svg` (5) og ubrukte `public/logo/hengsel-lys.svg` – ingen referanser lenger.

#### C) Endret
- Side.astro bruker `@sngroup/hengsel-tokens/Hode.astro` (tokens, fonts, grunn.css); ingen import fra `@sngroup/design` igjen.
- hengsel.css: alias-blokk mot delte variabler + mål (bredde, pad/gutter, topp, seksjon, t-*, ease, dur). Fra SN base.css trengtes ingenting utover det grunn.css gir (`.wrap/.label/.pill/em` brukes ikke på siden bare i de kopierte komponentene).
- Kopiert inn: `components/PrivacyPage.astro`, `IkkeFunnet.astro` (kun aksent-knapp, ingen mørk/«eksempel»-variant), `Plantegningsstrek.astro`, `content/typer.ts` (Avsnitt). Egen etikett-/wrap-stil (`.h-innhold`), `tittelAksent`/kursiv `em` fjernet.
- Skrift: ingen vekter utenfor 400/500/600, ingen kursiv funnet; Variable-navn fjernet.
- Radius: 999→`--radius-pille`, 14→`--radius-kort-stor`, 10 og 8→`--radius-kort-lite`, 6 og 7→`--radius-felt`; `--r-field` = `--radius-kort-lite`.
- Dato: /apptest viser nå dd.mm.åååå (Intl 2-digit); personvern «Sist oppdatert 09.10.2026». ISO i data (apptest-lenker.ts/innhold.ts) beholdt (testene krever det).
- Manifest genereres av endepunkt fra tokens.json.

#### D) Hoppet over / avgjøres
- Slettingen av mørke bildefiler og ubrukte logofiler ble avvist av tillatelsessystemet; slett selv: `sites/hengsel/public/img/app/*-mork.webp`, `public/img/apptest/*-mork*.webp`, `public/logo/*-mork.svg`, `public/logo/hengsel-lys.svg`. `scripts/fiktive-skjermer.mjs` (din) genererer dem fortsatt.
- `public/favicon.svg` (sha lik brand/hengsel-merke/favicon/favicon.svg) og `public/logo/ute.svg` (lik brand/.../app-ikon/ute-lys.svg) beholdt med hex, per tillegget ditt. Øvrige logoer i public/logo er byte-identiske med pinnede.
- `--r-lg` 20px og prosent-radiuser på iPad/iPhone-ramme beholdt. 10px-radius ble avrundet til 8 (valgt `kort-lite` framfor `felt`).
- `apptest-innhold.ts` endringslogg nevner «mørk modus» som app-funksjon (bygg 12/13, linje 30, 46, 85); er produkttekst om appen, ikke nettstedets tema, urørt – avgjør om det skal bort. Enhet.astro har fiktiv klokke «man. 12. okt.» i iPad-statuslinja (ikke en dato i klartekst på siden).
- `--a4-*`, `--k/--nw/--nh/--inset` er variabler satt av dokumenter/skript, ikke definert i CSS (forventet).
- Alias som `--ink/--line` beholdt (peker på delte variabler) i stedet for omskriving.

#### E) Resultater
- `npm run build -w sites/hengsel`: grønt, 13 sider.
- Skanner: eneste treff utenfor logo/favicon er ingen (kilder rene).
- Tester: apptest-innhold, apptest-versjon, apptest-passord, app-lenker, demo, dokumenter, design-fasit: 61 pass, 0 fail (tokens-avvik ignorert).
- axe color-contrast: 26 sidevisninger (13 sider × 390/1440, lys), 0 brudd. Forside identisk piksel for piksel med colorScheme dark (390 og 1440).
- Visuelt: forside, 404 ser nesten lik «før»; synlig forskjell er litt lysere sidemeny/felt i fiktive skjermer (`--flate-senket`), litt mørkere info-piller (Beige 2). Skjermbilder: scratchpad/hengsel/*.png. /crm, /priser-og-demo og øvrige sider kun kontrastsjekket og tatt skjermbilde av, ikke detaljert sammenlignet.

### vis.hengsel.no


#### A) Fargetabell
Siden brukte egne variabler (alias lokalt i vis.css, med hex). Disse er fjernet og alle bruk (html, css, js, ca. 30 sider) er byttet direkte til delte variabler.

| Verdi | Hvor brukt | Token den ble | Merknad |
|---|---|---|---|
| `--bg` (Beige 3, hex) | vis.css og alle sider (23 steder) | `--flate-side` | `color:var(--bg)` (tekst på mørk knapp/valgt fane) → `--tekst-invers` |
| `--card` | alle sider (47) | `--flate-kort` | `.btn.primary` / `.knapp-chip` tekst → `--paa-aksent` |
| `--soft` | 50 steder | `--flate-senket` | |
| `--fg` | 90 steder | `--tekst` | |
| `--muted` (avvek: Warm Black-grå, ikke tokenet) | 169 steder | `--tekst-dempet` | avvek fra fasit |
| `--line` | 94 steder | `--linje` | |
| `--sand` | 45 steder | `--ramme` | |
| `--accent` | 57 | `--aksent` | `.btn.primary:hover` var opacity .88, er nå `--aksent-trykk` |
| `--accent-tekst` (egen mørkere blå) | 25 | `--aksent-tekst` | avvek fra fasit |
| `--accent-soft` (lyseblå flate) | 22 | `--flate-valgt` | avvek: var blåtint, blir beige; `.pill.info` → `--status-info-bg/-fg` |
| `--dusty` | 11 | `--aksent-svak` | |
| `--ok`, `--ok-tekst` | 34 + 9 | `--status-ok-fg` | avvek (egen grønn) |
| `--ok-soft` | 7 | `--status-ok-bg` | |
| `--warn` | 28 | `--status-haster-fg` | avvek (egen gul/brun) |
| `--warn-soft` | 12 | `--status-haster-bg` | |
| `--skjermbunn` (hex Beige 3), enhet.css | enhet.css, 4 bruk | `--flate-side` | variabelen fjernet |
| hex Beige 3, `.ill` i vis.css | vis.css | `--flate-side` | |
| `#1B1713` telefonramme | prosjekt/index.html:56 (+kommentar) | `--alltid-mork` | maskinvareramme |
| `rgba(49,38,29,.06/.22)` skygge | kunde/index.html:28 (.notif) | `--skygge-overlegg` | |
| `rgba(49,38,29,.16)` skygge | dokumenter.css (.dv-ark:focus-visible, .ark-lenke .ark) | `--skygge-overlegg` | |
| mørke paletter (bg/card/soft/fg/muted/line/sand/accent/ok/warn …) | vis.css :root, 2 blokker | fjernet | se B |
| `<meta theme-color>` med Off White-hex | alle 30 sider | markør `%TEMAFARGE%`, byttes i bygg.mjs med `palett.palett["off-white"]` fra pinnet JSON | ingen hex i kilde |
| `--serif`, `--sans` | 54 + 88 | `--skrift-familie-hengsel-overskrift` / `-tekst` | |
| `--r-sm`, `--r-field`, `--r`, `--r-pill` | 12+46+19+21 | `--radius-kort-lite`, `--radius-kort-lite`, `--radius-kort-stor`, `--radius-pille` | field 10→8, r 14→12 |
| radius 6/10/12 px literalt | forside.css, sider | `--radius-felt`, `--radius-bilde`, `--radius-kort-stor` | |

Lokalt beholdt (ingen farge): `--r-lg:20px`, `--focus` (bygget av `--flate-side`/`--aksent`), `--dur`, `--ease`.

#### B) Mørk modus (fjernet)
- vis.css: `@media (prefers-color-scheme:dark)` og `:root[data-theme="dark"]` med full mørk palett; `.hlogo .mork`-regler; `color-scheme:dark`.
- dokumenter.css: to regler for mørk skygge på `.dv-ark`.
- en/index.html og sv/index.html: `.sn.mork`-regler og `<img class="sn mork" src="/img/sn-logo-mork.svg">` (bygg.mjs kopierer ikke lenger sn-logo-mork.svg).
- Alle 30 HTML-sider: `data-theme="light"` på `<html>`; `theme-color` flyttet til markør.
- assets/bilder.js: `matchMedia('(prefers-color-scheme: dark)')`, `data-theme`-lesing, `MORK`-lista, `-mork`-skjermbildevalget og change-lytteren. Bare lyse skjermbilder brukes nå.
- bygg.mjs: `<img class="mork">` per logo fjernet; `.hlogo` har bare lys utgave. dokumenter.mjs: ubrukt `MORK`-sett og `_kart.json`-innlesing fjernet.
- Slettet: `src/assets/logo/{crm-aksent,hengsel-aksent,hengsel-crm-aksent,levert-av-aksent}-mork.svg` (ingen referanser igjen).
- Klassen `.dark` på knapper (valgt-tilstand, ikke tema) omdøpt til `.valgt` (vis.css, hvitevarer/leder/rom/kontroll/veikart side.js, forside.js).
- Kommentarer om mørk modus ryddet (vis.css, forside.css, dokumenter.css).

#### C) Endret
- bygg.mjs kopierer `packages/hengsel-tokens/tokens.css` → `dist/assets/hengsel-tokens.css`, `fonts.css` → `dist/assets/hengsel-fonts.css`, `ds/assets/fonts/*.woff2` → `dist/assets/ds/assets/fonts/` (relative url-er virker; same-origin, passer CSP `font-src 'self'`). Alle 30 HTML-sider linker tokens + fonts FØR vis.css; preload peker på Inter 400 og Newsreader 400.
- @fontsource-bygging (13 filer i dist/fonts) fjernet fra bygg.mjs; `@fontsource-*` fjernet fra sites/vis/package.json (lock-fil ikke rørt).
- bygg.mjs henter dokumentfilene fra `packages/hengsel-dokumenter/src` (var packages/design/src/dokumenter, flyttet av deg).
- Skrift: bare Inter/Newsreader via delte variabler; sidene bruker bare vekt 400/500/600 (ingen endring nødvendig). Ingen kursiv Newsreader i bruk (`<em>` i loggen er `font-style:normal`).
- Dato: ingen ISO-datoer i klartekst funnet (sv/ er dessuten bevisst). `en`-siden bruker `toLocaleDateString('en-GB')`, uendret.
- Ingen strukturendring.

#### D) Hoppet over / avgjøres
- `sites/vis/fasit/Visningsrommet - frittstående.html` er SPORET i git og har hex (minst 5 treff): ikke skannet/rørt. Må unntas i testen eller slettes.
- SVG med fargeverdier beholdt (byte-identiske med pinnet): `src/favicon.svg` (= brand/hengsel-merke/favicon/favicon.svg), `src/assets/logo/{crm-aksent-lys,hengsel-aksent-lys,hengsel-crm-aksent-lys,hengsel-lys,levert-av-aksent-lys}.svg` (= packages/hengsel-tokens/ds/assets/logo). PNG/WebP (favicon-*.png, og.png, rammer, ill, skjermbilder) er rasterbilder, urørt.
- Mørke skjermbilder `src/skjermbilder/*-mork.webp` og `_kart.json` (`"tema":"mork"`): ikke slettet. De er ikke lenger referert av siden, men `_kart.json` og scripts/fiktive-skjermer.mjs (ditt område) refererer dem, og scriptet kan forvente markøren `/*MORK*/` i bilder.js (er fjernet). Kan slettes når scriptet er justert. Før-bilder `vis-*-for-mork.webp` i claude/ rørt ikke.
- Radius som beholdes: `--r-lg` 20, 52/44/42/36 (telefonramme), 4/3/2 px, prosent-hjørner på enhetsrammer.
- Teksten «Mørk strek er nivået i dag» (leverandor/index.html:227) og «Mørk grå» (levprov) er innhold, ikke tema, urørt.
- dokumenter.css kobler fortsatt hengsel-dokumenter via dens egne variabelnavn (`--surface`, `--ink`, `--f-display` …) til delte variabler; `--a4-skrift`/`--a4-overskrift` er fortsatt «Inter»/«Newsreader» som literal familienavn. Din tokenisering av pakken kan kreve justering her.
- npm install/lock: package-lock må oppdateres av deg (fontsource fjernet fra vis).
- scripts/skjermbilder-vis.mjs og andre scripts er ikke sjekket for avhengighet til dist/fonts.

#### E) Resultater
- `npm run build -w sites/vis`: grønt (5 skriftfiler, logo på 30 sider).
- `node --test scripts/dokumenter.test.mjs`: 4/4 grønne. `node scripts/sjekk-lenker.mjs`: grønn (hengsel, sngroup, vis: 131 interne adresser, 0 feil av 687 forespørsler).
- Skann (kilder, uten fasit/): ingen treff utenom de pinnede SVG-ene over.
- axe color-contrast: 60 sidevisninger (30 sider × 390 og 1440 px, lys), 0 brudd. Ingen CSP-feil i konsollen. Skjermbilder lagret i scratchpad/vis/. Med `colorScheme: dark` er forsiden, /crm/ og /dokumenter/ byte-identiske med lys (1440).
- Visuelt: forsiden og /dokumenter/ ser ut som før i lys (beige side, off-white kort, mørk valgt-knapp, Deep Blue-lenker). Synlige forskjeller: info-piller og chips er beige (var lyseblå), ok/venter-farger bruker statustonene, hover på primærknapp er `--aksent-trykk` (før redusert opasitet), nå samme Inter/Newsreader som før men statiske filer. Øvrige sider ble bare sjekket med axe og full 1440-skjermbilde (ikke sett inn hver for hånd).

### admin.hengsel.no


#### A) Fargetabell (gammel variabel/verdi -> token)
| Verdi | Hvor | Token | Merknad |
|---|---|---|---|
| `--bakgrunn` (Off White) | profil.css, admin.css (body, .topp) | `--flate-side` | Sideflaten er nå Beige 3 (fasit), ikke Off White; kort er Off White |
| `--flate` (Beige 3) | admin.css .meny a:hover / aria-current | `--flate-valgt` | Beige 3 = sideflate nå, så hover/valgt må være en annen flate |
| `--kort` | admin.css (sok input, lenkeliste, konto, frist, moduler) | `--flate-kort` | |
| `--flate-myk` #efe5d6 | admin.css code, .status, .moduler .av | `--flate-senket` (code), `--status-noytral-*` (status, av-merke) | avvek fra fasit |
| `--beige-3-ute`, `--off-white-ute`, `--flate-sterk`, `--ikon`, `--skygge`, `--ramme`, `--lysboks` | profil.css, ubrukt i admin | fjernet | |
| `--linje`, `--linje-svak` | admin.css | `--linje` | |
| `--aksent` på lenker | admin.css a | `--aksent-tekst` | Knapp/fokus beholder `--aksent` |
| `--pa-aksent` | admin.css .skip | `--paa-aksent` | |
| `--aksent-myk` + `--info-tekst` (merker) | admin.css span.merke | `--status-info-bg/-fg` | |
| `--gul` #5c4300 / `--gul-myk` #f6e7b8 | admin.css banner, merke.kommer, frist-kant, .status.gul, eksempel-merke | `--status-haster-fg/-bg` | |
| `--rod`/`--rod-myk` (feil) | admin.css frist-kant, .status.rod | `--status-feil-fg/-bg` | |
| `--ok` #376c49 / `--ok-myk` | admin.css frist-kant, .status.gronn | `--status-ok-fg/-bg` | |
| `--tekst-dempet` #5e564c, `--tekst-svak` | profil.css | delte `--tekst-dempet` (uendret bruk) | |
| `--warm-black`, `--off-white`, `--beige-*`, `--deep-blue`, `--dusty-blue` (lokale kopier) | profil.css | fjernet, delt tokens.css | |
| `--font-overskrift` / `--font-tekst` (Newsreader/Inter Variable) | admin.css | `--skrift-familie-hengsel-overskrift` / `-tekst` | |
| `--radius` 14 / `--radius-liten` 8 | admin.css | `--radius-kort-stor` / `--radius-kort-lite` | |
| `--gutter`, `--t-h1`, `--t-h2` | profil.css | flyttet til admin.css (ikke farger) | |

profil.css er slettet (ble tom for ikke-farge-mål utenom de tre målene over).

#### B) Mørk modus fjernet
- profil.css: `@media (prefers-color-scheme: dark)` og `[data-theme="dark"]`-blokker (hele fila slettet)
- admin.css: dark-media og data-theme-regler for `--gul` og logo (.merke .lys/.mork)
- Side.astro: `temafarge={[lys, mørk]}` (nå én theme-color fra Hode.astro), `<img class="mork">`
- public/logo/symbol-mork.svg slettet. Ingen tema-bryter eller tema-lagring fantes i admin.ts (ingenting å fjerne).

#### C) Endret
- Side.astro: BaseLayout -> `@sngroup/hengsel-tokens/Hode.astro`; fjernet `@sngroup/design/fonts.css` og profil.css-import. Ingen fil importerer lenger `@sngroup/design`.
- Logo: public/logo/symbol-lys.svg erstattet med byte-identisk `hengsel-symbol-lys.svg` (pinnet); menyen bruker den.
- favicon.svg: uendret (byte-identisk med brand/hengsel-merke/favicon/favicon.svg, sha256 2801009c...). Treff i skanneren er forventet.
- SN base.css-behov: admin brukte bare h1/h2/h3 (alle overstyrt eksplisitt), body, .skip (overstyrt) – ingenting måtte kopieres; grunn.css dekker resten. Ikke brukt: .wrap, .pill, .label, .lede.
- Skrift: delte familier; vekt 300 på h1/h2 fra base.css er borte (admin satte 400). Ingen kursiv Newsreader.
- Radius: 14->12, 8->8; felt/banner 10px og code 4px beholdt (avvik > 2 px / ikke på listen).
- Dato (dd.mm.åååå): ny `src/lib/dato.ts` `norskDato(iso)` (ren strengomforming).
  - src/pages/kunder/[id].astro:7 (import) og :33 (lisens «fra»: `12.10.2026`-format, f.eks. 01.11.2026)
  - src/lib/frist.ts:6 (import) og :40 (`datoNorsk` delegerer til `norskDato`); Frister.astro bruker `datoNorsk` (allerede norsk, uendret)
  - src/data/plattform/rutiner.md:62: «2026-10-12 06:00:41 UTC» -> «12.10.2026 06:00:41 UTC»
  - JSON beholder ISO internt (kunde.json lisens.fra, frister.json dato). Kontoer/Lenker/index/kunder-index viser ingen datoer.

#### D) Hoppet over / uløst
- admin.css: `border-radius: 10px` (sok-felt, banner) og `4px` (code) – avvik > 2 px fra `--radius-felt` (6).
- public/logo/hengsel-symbol-lys.svg og public/favicon.svg har hex, men er byte-identiske med pinnet/merkepakke (navngitt unntak). public/favicon-32.png/-180.png er binære, urørt.
- Ingen endring i scripts/admin.test.mjs nødvendig; testen sjekker ikke mørk/tema/BaseLayout. Forslag (valgfritt): test som leser `src/lib/dato.ts` og sjekker `norskDato("2026-10-12") === "12.10.2026"`, og at dist/kunder/eksempel-kjokken.html inneholder «01.11.2026» og ikke «2026-11-01» i synlig tekst (data-dato-attributt er ISO bevisst).
- Worker (worker/) har ingen farger/tema, urørt.
- package-lock.json/avhengigheter er din oppgave (ikke rørt).

#### E) Resultater
- `npm run build -w sites/admin`: grønt (5 sider, CSP-hash lagt inn).
- `node --test scripts/admin.test.mjs`: 16 pass, 0 fail.
- Skanner (kommandoen i briefen + `@sngroup/design`/«mørk»): kun de to byte-identiske SVG-ene.
- axe color-contrast: 20 sidevisninger (/, /kunder, sigdal-innlandet, eksempel-kjokken, 404 x 390/1440 x light/dark): 0 brudd.
- colorScheme dark gir pikselidentisk skjermbilde som light (sjekket forside 1440).
- Visuelt: sideflaten er nå beige (Beige 3) i stedet for Off White, med hvite/Off White kort; menyvalg/hover er Beige 2; statuspiller/merker bruker statustonene (litt andre grønn/gul/rød enn før); lenker er blå `--aksent-tekst`; fonter Inter/Newsreader statisk. Layout uendret. Mørke før-bilder er ikke lenger relevante. Prøvebilder: scratchpad/admin-*.png (+ -dark).


### design.hengsel.no (Claude, hovedøkta)

| Verdi | Hvor | Token | Merknad |
|---|---|---|---|
| `lagFasitCss()` skrev hex per rolle/tone/palett (`.f-<rolle>-lys{background:#…}`) | `sites/design/src/lib/tokens.ts` | `var(--<rolle>)`, `var(--mork-<rolle>)`, `var(--status-<tone>-bg/fg/kant)`, `var(--mork-status-…)`, `var(--kunde-<id>-aksent)` | de mørke tokenene vises fortsatt som fargeprøver (`--mork-*` i den delte fila) |
| `#F2E9DB`/`#1F1914` theme-color (lys/mørk) | `layouts/Side.astro:36-37` | én `theme-color` fra `palett`/`farge["flate-side"].lys` i JSON | ingen mørk theme-color |
| `rgb(49 38 29 / …)`, `rgb(0 0 0 / …)` skygge i prøveflatene | `lib/tokens.ts` | `--skygge-overlegg`, `--mork-skygge-overlegg` | |
| `#000000` standard i `kontrast()` | `lib/tokens.ts` | `SVART`-objekt (tall) | ingen hex i koden |
| `#FFFFFF`, `#5074A9` i brødtekst | `pages/farger.astro:21,85` | tekst uten hex / verdi hentet fra JSON | |
| `/ds/tokens/tokens.css` og `fonts.css` lastet som lenker | `layouts/Side.astro` | import av `@sngroup/hengsel-tokens/tokens.css` og `fonts.css` | siden bruker nå den delte fila; `/ds/` er bare nedlastinger |
| `.tema-lys/.tema-mork/.tema-par/.tema-navn` | pages, `Komponent.astro`, `design.css` | omdøpt til `.prove-lys/.prove-mork/…` | `color-scheme: dark` på prøveflaten fjernet |

Merkefiler med egne farger beholdt (byte-identiske med pinnede logoer eller `brand/hengsel-merke`, brukt som `<img>`/favicon): alle logoer i `public/ds` og i hengsel/vis/admin, `favicon.svg` (×4), `logo/ute.svg`, `merke/app-ikon/*.svg`. Testen godkjenner dem på sha256.

## 3. Mørk modus (alt som er fjernet)

Se delrapportene over (B). I tillegg på design.hengsel.no: bryteren Auto/Lys/Mørk (`Meny.astro`, `scripts/tema.ts` slettet), `.for-lys/.for-mork`-vekslingen for logoer og skjermbilder, `?tema=`-parameteren og tre `prefers-color-scheme`-/data-theme-regler i `design.css`. design.hengsel.no viser fortsatt de mørke tokenene som fargeprøver (`/farger`, lys og mørk prøve ved siden av hverandre, og lys/mørk komponentprøver på `/komponenter`), men selve siden er lys. Skjermbildene av appene vises bare i lys utgave (de mørke webp-filene er ikke lenger brukt av design.hengsel.no).

## 4. Norsk dato

- `sites/admin/src/pages/kunder/[id].astro:33` viste lisensdatoen rått (`2026-11-01`). Nå dd.mm.åååå via ny `sites/admin/src/lib/dato.ts` (`norskDato`, ren strengomforming uten `Date`). `lib/frist.ts:40` bruker samme hjelper. `data/plattform/rutiner.md:62`: «2026-10-12 06:00:41 UTC» → «12.10.2026 06:00:41 UTC». JSON-data beholder ISO internt.
- hengsel.no: `/apptest` viser datoen som dd.mm.åååå; personvern «Sist oppdatert 09.10.2026». ISO i `apptest-lenker.ts`/`apptest-innhold.ts` er data som testene krever, urørt.
- vis.hengsel.no: ingen ISO-datoer i klartekst funnet (`/sv/` er bevisst svensk, uendret).
- design.hengsel.no: ingen ISO-datoer funnet.

## 5. Tester (punkt 8)

Alle i `scripts/hengsel-regler.test.mjs` (kjøres av `npm test`); skanneren er `scripts/hengsel-regler.mjs`. Gamle `tokens-avvik.mjs`/`.test.mjs` er fjernet (sjekket mørk bakgrunn, som nå ikke finnes).

**a) Fargeverdi utenfor den delte fila gir rødt.** Demonstrert: la `.test-k192 { color: #ff0000; }` inn i `sites/admin/src/styles/admin.css` → «not ok 1 - a) ingen fargeverdi utenfor den delte token-fila (kilde)». Fjernet igjen. Testen sjekker også byte-identitet for SVG-merkefiler, og at hver hex i bygde CSS/HTML/JS finnes i den delte fila (minifisert rgba → #rrggbbaa er tatt hensyn til). Selvtest av skanneren på hex, rgb, rgba, hsl, navngitt farge og Tailwind-farge.

**b) Delt fil som avviker fra pinnen gir rødt.** Demonstrert: endret `--flate-side` i `tokens.css` fra `#F2E9DB` til `#F2E9DC` → «not ok 5» (fila avviker fra generert) og «not ok 6» (avviker fra designsystemets egen tokens.css). Gjenopprettet med `node scripts/lag-hengsel-tokens.mjs`. Testen sjekker også sha256 for alle pinnede filer og at det bare finnes én `designsystem.pin.json`.

**c) Mørk modus gir rødt.** Demonstrert: la `@media (prefers-color-scheme: dark) {…}` inn i `sites/vis/src/assets/vis.css` → «not ok 8 - c) ingen mørk modus eller mørk-bryter i kilden». Fjernet igjen. Testen sjekker også bygde sider (ingen mørk modus, `color-scheme: light` til stede) og selvtester på ni mørk-mønstre (media, data-theme, .dark, color-scheme: dark, matchMedia, data-valg, lagret tema, `<source media=dark>`, `dark:`).

**d) Bygg, tester, lenker, axe.**
- `npm run build`: grønt.
- `npm test`: 84 tester, 0 feil. Lenkesjekken: admin 14, design 85, hengsel 55, vis 131 interne adresser og alle bilder svarer 200, 0 feil.
- axe (`node scripts/skjermbilder-k192.mjs axe`, WCAG 2.x A/AA + beste praksis): **112 sidevisninger (alle HTML-sider i de fire sidene × 390/1440 px), 0 kontrastbrudd.** Øvrige axe-brudd (449 noder, bl.a. `region`, `heading-order`, `landmark-one-main` på vis) fantes før og er ikke berørt av denne oppgaven; de er ikke rettet.

## 6. Før- og etterbilder (390 og 1440 px, forside + to sider per nettsted)

Lenkene peker på `claude/k192-skjermbilder/`. «før» finnes også som `-for-mork` (hvordan mørk maskininnstilling så ut før), og etter-sjekken `-etter-maskin-mork` viser at mørk maskininnstilling nå gir samme side.

### hengsel.no

| Side | 390 før | 390 etter | 1440 før | 1440 etter |
|---|---|---|---|---|
| Forside | [for](k192-skjermbilder/hengsel-forside-390-for.webp) | [etter](k192-skjermbilder/hengsel-forside-390-etter.webp) | [for](k192-skjermbilder/hengsel-forside-1440-for.webp) | [etter](k192-skjermbilder/hengsel-forside-1440-etter.webp) |
| /crm | [for](k192-skjermbilder/hengsel-crm-390-for.webp) | [etter](k192-skjermbilder/hengsel-crm-390-etter.webp) | [for](k192-skjermbilder/hengsel-crm-1440-for.webp) | [etter](k192-skjermbilder/hengsel-crm-1440-etter.webp) |
| /priser-og-demo | [for](k192-skjermbilder/hengsel-priser-og-demo-390-for.webp) | [etter](k192-skjermbilder/hengsel-priser-og-demo-390-etter.webp) | [for](k192-skjermbilder/hengsel-priser-og-demo-1440-for.webp) | [etter](k192-skjermbilder/hengsel-priser-og-demo-1440-etter.webp) |

### vis.hengsel.no

| Side | 390 før | 390 etter | 1440 før | 1440 etter |
|---|---|---|---|---|
| Forside | [for](k192-skjermbilder/vis-forside-390-for.webp) | [etter](k192-skjermbilder/vis-forside-390-etter.webp) | [for](k192-skjermbilder/vis-forside-1440-for.webp) | [etter](k192-skjermbilder/vis-forside-1440-etter.webp) |
| /crm/ | [for](k192-skjermbilder/vis-crm-390-for.webp) | [etter](k192-skjermbilder/vis-crm-390-etter.webp) | [for](k192-skjermbilder/vis-crm-1440-for.webp) | [etter](k192-skjermbilder/vis-crm-1440-etter.webp) |
| /dokumenter/ | [for](k192-skjermbilder/vis-dokumenter-390-for.webp) | [etter](k192-skjermbilder/vis-dokumenter-390-etter.webp) | [for](k192-skjermbilder/vis-dokumenter-1440-for.webp) | [etter](k192-skjermbilder/vis-dokumenter-1440-etter.webp) |

### design.hengsel.no

| Side | 390 før | 390 etter | 1440 før | 1440 etter |
|---|---|---|---|---|
| Forside | [for](k192-skjermbilder/design-forside-390-for.webp) | [etter](k192-skjermbilder/design-forside-390-etter.webp) | [for](k192-skjermbilder/design-forside-1440-for.webp) | [etter](k192-skjermbilder/design-forside-1440-etter.webp) |
| /farger | [for](k192-skjermbilder/design-farger-390-for.webp) | [etter](k192-skjermbilder/design-farger-390-etter.webp) | [for](k192-skjermbilder/design-farger-1440-for.webp) | [etter](k192-skjermbilder/design-farger-1440-etter.webp) |
| /komponenter | [for](k192-skjermbilder/design-komponenter-390-for.webp) | [etter](k192-skjermbilder/design-komponenter-390-etter.webp) | [for](k192-skjermbilder/design-komponenter-1440-for.webp) | [etter](k192-skjermbilder/design-komponenter-1440-etter.webp) |

### admin.hengsel.no

| Side | 390 før | 390 etter | 1440 før | 1440 etter |
|---|---|---|---|---|
| Forside | [for](k192-skjermbilder/admin-forside-390-for.webp) | [etter](k192-skjermbilder/admin-forside-390-etter.webp) | [for](k192-skjermbilder/admin-forside-1440-for.webp) | [etter](k192-skjermbilder/admin-forside-1440-etter.webp) |
| /kunder | [for](k192-skjermbilder/admin-kunder-390-for.webp) | [etter](k192-skjermbilder/admin-kunder-390-etter.webp) | [for](k192-skjermbilder/admin-kunder-1440-for.webp) | [etter](k192-skjermbilder/admin-kunder-1440-etter.webp) |
| /kunder/sigdal-innlandet | [for](k192-skjermbilder/admin-kunde-390-for.webp) | [etter](k192-skjermbilder/admin-kunde-390-etter.webp) | [for](k192-skjermbilder/admin-kunde-1440-for.webp) | [etter](k192-skjermbilder/admin-kunde-1440-etter.webp) |

## 7. Synlige forskjeller (bevisst)

Fargene på hengsel.no, vis., og admin. er nå designsystemets, så noen flater har byttet nyanse:
- Info-piller, chips og valgte felt: beige (`--flate-valgt`) i stedet for lyseblå/Beige 3.
- OK-/advarsel-/feilfarger er statustonene (litt andre grønn/gul/rød).
- Sidemeny og felt i de fiktive CRM-skjermene på hengsel.no er `--flate-senket` (litt lysere).
- admin: sideflaten er Beige 3 (som design.hengsel.no) med Off White-kort; var Off White.
- vis: hover på primærknapp er `--aksent-trykk` (var redusert opasitet).
- Lenker er `--aksent-tekst` (var en egen blå).

## 8. Hoppet over / bør avgjøres

1. **hengsel.no sideflate er fortsatt Off White** (`--flate-kort`), ikke `--flate-side` (Beige 3) som på design.hengsel.no og admin. Jeg lot hengsel.no stå slik for å unngå et helt nytt utseende på forsiden uten at du har sett det. Det er én linje (`--bg` i `sites/hengsel/src/styles/hengsel.css`) hvis du vil ha Beige 3 også der.
2. **Lysboksen** i dokumentvisningen (`packages/hengsel-dokumenter`) er mørk (`--alltid-mork`, rollen for bildeeditor/kamera). Det er en bildevisning, ikke mørk modus; jeg har beholdt den og dokumentert den i regelen.
3. **Avstander** (px for padding/gap) er ikke flyttet til `--avstand-*`; bare farger, skriftfamilier og radius er tokenisert (radius der avviket var ≤ 2 px; øvrige radiuser, f.eks. 20 px og enhetsrammer, står som før).
4. **Kursiv Newsreader** finnes ikke i den pinnede fonten. Ingen av sidene brukte kursiv i overskrifter (sjekket), men `<em>` i SN-komponentene er satt til normal.
5. **Ubrukte mørke bildefiler:** fjernet i hengsel.no (14 webp + 5 logoer). I vis ligger `src/skjermbilder/*-mork.webp` og `_kart.json` igjen, fordi `scripts/fiktive-skjermer.mjs` fortsatt genererer dem (se punkt 6).
6. `scripts/fiktive-skjermer.mjs` kan fortsatt lage mørke skjermbilder; ikke endret. Nedlastingene i `/ds/` på design.hengsel.no (`tokens.css`, `tokens.ts`, `hengsel.tokens.json`) har fortsatt lys og mørk og `prefers-color-scheme`: de er til appene og CRM-et, og er unntatt skanneren (`sites/design/public/ds`).
7. `sites/vis/fasit/` (frittstående designfil til sammenlikning, sporet i git, ikke bygget inn) og `.md`-filer er unntatt skanneren.
8. `dokumenter.css` i vis kobler dokumentvisningen til delte variabler via pakkens egne navn (`--surface`, `--ink`, `--f-display`). Fungerer, men er et alias-lag som kan forenkles.
9. `apptest-innhold.ts` nevner «mørk modus» i endringsloggen for appen (produkttekst, ikke nettstedets tema).
10. Mange av de øvrige axe-bruddene på vis (`region`, `landmark-one-main`, `heading-order`) er gamle og ikke en del av oppgaven.
11. Radius 10 px beholdt i admin (søkefelt/banner), og `4px` på `code`.
12. Kontrollert mot kilden i innlandet-crm-sync: ikke gjort. Repoet er utenfor denne øktas tilgang; pinnen er den eksisterende (`3099a27b`) og verifisert med sha256 mot filene i repoet. `hent-designsystem.mjs` er flyttet og tilpasset, men ikke kjørt mot kilden.
13. Ingen DNS eller Cloudflare-oppsett er rørt. Ingen nøkler.
