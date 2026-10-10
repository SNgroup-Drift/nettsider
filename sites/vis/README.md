# Visningsrommet i Hengsel-profilen – instruks til Code

## Regel for skjermbilder (10.10.2026)

Alle skjermbilder av løsningen på vis.hengsel.no kommer fra **designfilene i CRM_v4** (`docs/design/**/*.dc.html` på demo), aldri fra kjørende demo eller tegnet UI i rammene. Visningsrommet viser hvordan løsningen blir, ikke hvordan den er nå. Filene er webp i Apples skjermoppløsning (se «Apple-rammer» under) og ligger i `sites/vis/src/skjermbilder/` (vis har ingen `public/`; `bygg.mjs` kopierer `src/` til `dist/`). `assets/bilder.js` legger dem i rammene fra `assets/enhet.css`: Studio Display (1180 × 740, høyere bilder kan rulles i skjermen), iPad liggende 1180 × 820 (stående 820 × 1180 snus automatisk), iPhone 390 × 844, alle med `object-fit: cover; object-position: top`. Aldri PC-bildet i iPad- eller telefonrammen. Rom med flere enheter har velgeren PC · iPad · Telefon; «Prøv dette»-stegene viser skjermen for steget og skriver loggen «Samtidig i Hengsel». Tekster, steg og logg er som før.

### Bilde-til-rom-kart (endelig, siste pakker 10.10: crm-sju-vis.zip og ute-vis.zip)

| Rom | Studio Display | iPad | iPhone |
|---|---|---|---|
| Prøv CRM | `crm-min-dag` → `crm-bestilling` → `crm-tilbud` → `crm-tilbud-kunde` → `crm-montasje` (steg 1 / 2 / 3 / 4 = bilde 1 / 2 / 4 / 5; steg 4 heter «Se kontrollmålet», bilde 5 er Kontrollmål til v4 har en montasjeplan) | `crm-ipad-leder` → `crm-ipad-kontrollmal` → `crm-ipad-belastninger` → `crm-ipad-innstillinger` | `crm-tlf-ordre` |
| Firmaleder | `crm-resultater` → `crm-salgstavla` → `crm-montasje` → `crm-saker` → `crm-moduler` (steg 1 = bilde 1, 2 = 4, 3 og 4 = 3) | `crm-ipad-leder`, `crm-ipad-belastninger` | `crm-tlf-min-dag`, `crm-tlf-kundekort` |
| Montørappen (Hengsel Ute) | – | `ute-ipad-i-dag`, `ute-ipad-ks` | `ute-i-dag` → `ute-jobb-under` → `ute-ks` → `ute-ks-kamera` → `ute-avvik` → `ute-punkter` → `ute-punktkort` → `ute-ferdig` → `ute-typeskilt` (steg: 2, 3, 5, 8) |
| Tegningen | `crm-mal-skisser` (steg 4) | `ute-ipad-bildeverktoy` (steg 3) | `ute-laser` (steg 1, 2, 5) |
| Kundens Min side | PC-bryter: `portal-mitt-kjokken` → `portal-oppgraderinger` → `portal-status` → `portal-nytt-kjokken` (v2, til v4) | – | Mobil-bryter: `kundeportal-k03` → `k04` → `k06` → `k08` → `portal-tlf-levering` → `portal-tlf-nytt-kjokken`; stegene viser k06 (tilvalg), k08 (godkjenn), levering og nytt kjøkken («Meld en feil»), PC følger med |
| Kundens reise | – | – | `kundeportal-k03` → `k04` → `k06` → `k08` (steg 1–4), `portal-tlf-levering` (5), `portal-tlf-montering` (6), `portal-tlf-nytt-kjokken` (7–8, til v4); varselet glir inn oppå |
| Ordrens reise («Selgeren ser», alle på PC) | scene 1 `crm-tilbud`, 2–3 `crm-tilbud-kunde`, 4–6 `crm-ordre-kontrollmal`, 7 `crm-montasje`, 8 `crm-etterkalkyle` | – | – |
| Romkort og flater på forsiden | ferdig sammensatte bilder av enhet + skjermbilde (`src/img/rom-*.webp`, `flate-*.webp`, `hero.webp`), se «Apple-rammer» |  |  |

### Forsiden etter fil 62 (11.10)

Forsiden følger fasit 62 («Visningsrommet: ny forside», `delt/pakke-v3/fasit` på grenen `pakke-v3`): mørk (`data-theme="dark"`), toppmeny med ankere (Forstå · Prøv · Dokumenter · Presenter · Logg inn på CRM, ≡ under 768 px), hero «Hele løsningen, rom for rom.» med Studio Display, iPad og iPhone (ett skjermbilde under 1280 px), og fire seksjoner: **Forstå på ti minutter** (Ordrens reise 4 min, Kundens reise 3 min, Systemkartet 3 min; sveiperad under 768 px), **Prøv selv** (fire gruppekort: Butikken, Montøren, Kunden, Leverandøren, med antall rom), **Det kunden og butikken får i hånden** (fem ark) og **Presenter og regn**. Rollevalget («Jeg er») filtrerer alle seksjonene og skjuler tomme.
- Rommene og rollene ligger i `assets/rom.js` (`g` = gruppe). Gruppekortene lenker til `/butikken/`, `/montoren/`, `/kunden/` og `/leverandoren/`, som lister rommene; `/rom/` lister alle. Rolle følger med som `?rolle=` og lagres i `vis-rolle`.
- Antall rom per gruppe regnes fra `rom.js` (Butikken 4, Montøren 3, Kunden 1, Leverandøren 2, til sammen 20), ikke tallene i fasiten (7/3/1/2, «21 rom»): de tre rommene i Forstå, seks i Presenter og dokumentene ligger utenfor Prøv selv.
- Bildene er ferdige enhetsbilder fra `scripts/rammer-vis.mjs` (`forsta-*`, `flate-*`, `hero*.webp`). `crm-tilbud`, `crm-tilbud-kunde`, `portal-tilbud`, `portal-*` på PC og `ute-ipad-*` brukes ikke i hero eller romkort (venter på v4).

### Apple-rammer (pakke 10.10: `CRM_v4.zip`, `INSTRUKS.md`)

Alle skjermbilder vises i Apples Product Bezels (`src/assets/rammer/*.webp`, gjennomsiktig skjermhull). Bildet ligger under rammen og klippes med skjermens hjørner; rammen brukes som den er (ikke beskåret, vippet eller speilvendt, ingen skygge ut av skjermen). Komponenten er `assets/enhet.css` (`.pc-ramme`, `.tlf`, `.ipad-ramme`, `.mac-ramme`) med `assets/bilder.js`; markupen i rommene er uendret.

| Ramme | Fil (aspect) | Skjermhull: left · top · width · height (%) | Hjørner | Skjerm |
|---|---|---|---|---|
| Studio Display | `studio-display.webp` (2160/1664) | 2.59 · 3.37 · 94.81 · 69.23 | 1.2 % / 1.6 % | 1920 × 1080 |
| iPhone 18 | `iphone-18.webp` (1174/2400) | 5.37 · 2.50 · 89.27 · 95.00 | 14 % / 6.1 % | 1206 × 2622, ingen statuslinje (rammen har island) |
| iPad liggende | `ipad-liggende.webp` (2400/1740) | 5.00 · 6.84 · 90.00 · 86.32 | 1.2 % / 1.6 % | 2732 × 2048 |
| MacBook | `macbook.webp` (2400/1565) | 12.63 · 14.19 · 74.75 · 71.63 | 1 % / 1.4 % | 2408 × 1506 |

- Rammene er minst 200 px høye, også på mobil (de faller ikke lenger bort). Tekst står ved siden av, ikke oppå. Flere enheter sammen i riktig størrelsesforhold (hero: telefonen er ca. 40 % av Studio Display-rammens høyde).
- Romkort og flater på forsiden er ferdige bilder (`scripts/lib/rammer.mjs`): `npm run rammer:vis` (rom og flater med skjermbilder fra designfilene) og `npm run skjermbilder:vis` (rom uten: rommet selv i Studio Display). Kortbildet er 4:3 i `--soft` og viser hele enheten (3 kort i bredden på PC, 2 på iPad, 1 på mobil); flatene «Slik henger det sammen» er 2 i bredden. Dokumentene (`/dokumenter/`) er A4-ark uten ramme.
- Pakke v3 (11.10, `delt/pakke-v3` på grenen `pakke-v3`) erstatter v1 og v2: `pc/` (2880 × 1800, brukes i både Studio Display og MacBook, så MacBook-bildene har ikke lenger prefikset `mb-`), `ios/` (iPhone 1206 × 2622 uten statuslinje, `ute-typeskilt` er 1170 × 2532) og `crm-ipad-*` (2360 × 1640, 1,44:1). Bildene som ikke er med i v3 (`crm-tilbud-kunde`, `crm-ordre-kontrollmal`, `crm-moduler`, `crm-mal-skisser`, `portal-*`, `crm-tlf-*`, `ute-ipad-*`) er fra v2 eller forrige eksport.
- Ikke brukt: `iphone-aapen` (én skjerm 7:10, venter på egne bilder), `portal-tilbud` (er fortsatt den gamle med «Studio Sigdal Hamar»), `portal-kjokken` (= `kundeportal-k04`), de nye rammene `iphone-18-liggende`, `iphone`, `iphone-liggende`, `iphone-aapen-liggende` og `ipad-staaende` (ingen bilder til dem). `kundeportal-k03/k04/k06/k08` brukes i romkortene og flatene; Kundens reise og Min side bruker fortsatt `portal-tlf-*` (v3 har ikke levering, montering og FDV).
- Kjent i v3: `crm-tilbud` viser fortsatt «Kjøkken Blek Blue» og et klikkmerke («Klikk .2»), og er derfor ikke brukt i hero eller romkort. `crm-montasje` viser nå Kontrollmål, ikke montasjeplanen.

- `ute-*`-bildene kommer fra `ute-vis.zip` (10.10, fra designfilene, uten merkenavn): iPhone 780 × 1688 (390 × 844 i 2×) og `ute-ipad-bildeverktoy` 2360 × 1640 (1180 × 820). De har egen statuslinje (09.41), dynamic island og hjemindikator, så rammene (`.tlf.hel`, iPad) legger ikke på noen: telefonrammen gir plass til hele 390 × 844-skjermen. CRM-bildene fra `crm-sju-vis.zip` (1440 bred, 2×): `crm-min-dag`, `crm-bestilling`, `crm-montasje`, `crm-etterkalkyle`, `crm-salgstavla`, `crm-saker`, `crm-resultater` (2880 × 1800) og `crm-min-dag-800` (Min dag i iPad-ramme; den tegnede kanten på 24 px er beskåret bort, 2360 × 1640, brukt som første iPad-bilde i Prøv CRM). `crm-leder-oversikt` og `crm-leder-start` er slettet (erstattet av `crm-resultater` og `crm-salgstavla`).
- Rom uten CRM_v4-skjermbilde (Systemkartet, Veikart, Dokumentene, Gevinstkalkulator, Leverandørløsningen, Opplæring, /sv/, og foreløpig Prøv som leverandør, Ordre- og fakturakontroll, Montasjeplan, Prosjektsalg, Hvitevarer og Daglig leder) bruker bilde av rommet selv på romkortet (`src/img/rom-*.webp`, lages av `npm run skjermbilder:vis`). De seks siste får CRM_v4-bilder når skjermene er eksportert.
- Logoen på siden er `hengsel-crm-logo-lys/-mork.svg` (PR 10.10). Alle CRM-bildene har Hengsel-logoen i sidemenyen. Navnene sier hva bildet viser. Den siste bildepakken 10.10 (Hengsel.no.zip, `img/vis`) er lagt inn slik: `crm-mal-skisser` ← `mal-skisser`, `crm-tilbud` ← `tilbud-liste` (tilbudslista), `crm-ipad-min-dag` ← `ipad-min-dag`, `crm-ipad-montasje` ← `ipad-montasje`, `crm-ipad-tilbud` ← `ipad-tilbud`, `crm-ipad-ordre` ← `ipad-ordre`, `crm-tlf-min-dag` ← `tlf-min-dag`, `crm-tlf-kundekort` ← `tlf-kundekort`, `crm-tlf-ordre` ← `tlf-ordre`. Mål: PC 2876 × 1796 (2×), iPad 1180 × 820 (1×), telefon 780 × 1600 (2×).

## Avvik funnet 10.10.2026 (skjermbilder av vis.hengsel.no) – rett disse først

**Må rettes**
1. **Logoen er ødelagt på alle vis-sider.** Merket vises som to tomme bokser («▯▯engsel») med en bitteliten hake/CRM under – i toppfeltet, topplinjen i rom, «Samtidig i …», navet i Systemkartet, CRM-noden i Ordrens reise og sidemenyen i Prøv CRM. På hengsel.no rendres merket riktig. Bytt til SVG-ene i `uploads/crm_v4-logo/` (konturert tekst, ingen font) som `<img>`, størrelser som i avsnittet under.
2. **«Studio Sigdal» er ikke fjernet.** Står fortsatt i Firmaleder («Studio Sigdal sender …»), Hvitevarer («Studio Sigdal Hamar»), Kundens Min side (toppfelt «Studio Sigdal»), Prøv som leverandør (`bestilling@studiosigdal-innlandet.no`, «Hos Studio Sigdal»), Kundens reise («Tilbudet ditt fra Studio Sigdal er klart») og /sv/ («Studio Sigdal Innlandet · SN Group», ingressen). Skal være «Kjøkkenstudio Hamar» (butikk) og `bestilling@kjokkenstudio-hamar.no`. Opplæring: pillen «Sigdal CRM · versjon 3.1» og bunnteksten «Bygger på brukerveiledningen «Sigdal CRM for selgere»» → «Hengsel CRM».
3. **Forsiden er v1, ikke v2.** Mangler to-kolonne-hero med illustrasjon og eyebrow «SN Group», «Start her»-båndet på Off White, tidslinjen «Én ordre, åtte steg», «Alle rommene» med h3-grupper i `--muted`, og avslutningen «Et utstillingsrom, ikke en salgsside.» med kjøkkenillustrasjon. Fasit: `VisForside v2.dc.html`.

**Mindre**
4. Leverandørløsningen: lysbildet er mye høyere enn innholdet (to tredjedeler tomt). Høyde etter innhold, eller sentrer innholdet vertikalt.
5. Montasjeplan: ukekolonnene er trange; kortteksten brekker på nesten hvert ord («Feil: Montering før benkeplate kommer (uke 48)»). Bredere kolonner (min 180 px) eller kortere feiltekst på kortet, full tekst i Konflikter-panelet.
6. Mørk modus og mobil 390 var ikke med i skjermbildene – ta egne skjermbilder og gå gjennom SJEKKLISTE.md.
7. **Enhetsrammer som på hengsel.no.** I dag er telefonen en rett, mørk rektangelramme og PC-visningene ligger rett på siden. Bruk de samme rammekomponentene som hengsel.no (finnes i `sites/hengsel`, ikke tegn nye):
   - **iPhone** (mørk ramme, avrundede hjørner, statuslinje «09.41», hjemmeindikator nederst): Kundens reise, Min side mobil, Montørappen, Tegningen.
   - **Studio Display** (tynn mørk skjermkant, fot under): Prøv CRM, Min side PC, Firmaleder.
   - Daglig leder, Veikart, Systemkartet, Gevinst, Montasjeplan, Prosjektsalg, Hvitevarer og Prøv som leverandør er oversikter/skjemaer og står fortsatt rett på siden.

Riktig allerede: skall og topplinje, piller, kort, Newsreader/Inter, bunntekst, nøkkeltall, Systemkartet, Veikart, Tegningen, Min side mobil/PC.

---

**Oppdatert 10.10.2026 – endringer siden første versjon:**
- Ny logopakke (`uploads/crm_v4-logo/`, LES-MEG.md) – SVG med konturert tekst, ingen font nødvendig. Bruk `hengsel-crm-logo-lys.svg` / `-mork.svg` som `<img>` i toppfelt (40 px høy), topplinje i rom (28 px), «Levert med» (30 px), «Samtidig i …» (24 px), CRM-noden i Ordrens reise (34 px) og navet i Systemkartet (42 px). I React-deler kan `HengselBrand.jsx` + `hengsel-brand.css` brukes i stedet. `favicon.svg` og `apple-touch-icon` fra samme pakke. Fjern alle rester av dør-merket og tokens `--mark-door`, `--mark-line`, `--mark-front`, `--mark-knob`.
- Alt «Studio Sigdal» er fjernet. Eyebrow i hero: «SN Group». Butikknavn i Min side og Kundens reise: «Kjøkkenstudio Hamar». /en/-ingressen uten butikknavn.
- Forside v2 (fasit 3a–3c i designet): hero i to kolonner med illustrasjon og rollevelger · «Start her» (Ordrens reise, Prøv CRM, Montørappen) på Off White-bånd · «Slik henger det sammen» + «Én ordre, åtte steg» som tidslinje · «Alle rommene» (h2) med grupper som h3 1,45 rem i `--muted` · avslutning «Et utstillingsrom, ikke en salgsside.» med kjøkkenillustrasjon · bunn.
- Illustrasjoner i `assets/ill/` (planlegging, kjokken, mote, prosjekt, smaakjop; PNG 1400 px, Warm Black på gjennomsiktig). Alltid på fast flis `#F2E9DB`, radius 20, padding 32/36, også i mørk modus. Én per seksjon, aldri bak tekst.
- Telefon-skjermbilder (hengsel-*) i kort vises 58 % brede, toppjustert med radius 14 og `--shadow`; PC-skjermbilder `object-fit:cover; object-position:top left`.

---

Gjelder `sites/vis` i repoet SNgroup-Drift/sngroup-nettsider. Innhold, rom, tekster og JS-logikk beholdes. Oppgaven er bare utseende: nye tokenverdier i `assets/vis.css`, felles skall, og noen få justeringer per rom. Designfasit ligger i Claude Design-prosjektet «vis.hengsel.no» (filene `Visningsrommet.dc.html`, `VisForside.dc.html`, `VisReise.dc.html`, `VisKundereise.dc.html`) og i den frittstående fila `Visningsrommet – frittstående.html`.

## 1. Tokens – bytt verdiene i assets/vis.css

Samme navn som i dag. Lys:

```css
:root{
  --bg:#F2E9DB; --card:#FBF9F6; --soft:#F8F2EC; --fg:#31261D; --muted:#5E564C; --line:#E4D4C4; --sand:#C3B5A7;
  --accent:#5074A9; --accent-soft:#E3EAF4; --dusty:#9CA9BD;
  --ok:#3F7A52; --ok-soft:#E4EEE6; --warn:#8A5D14; --warn-soft:#F5EAD3;
  --serif:"Newsreader",Georgia,serif; --sans:"Inter","Helvetica Neue",Arial,sans-serif;
  --r-sm:8px; --r-field:10px; --r:14px; --r-lg:20px; --r-pill:999px;
  --focus:0 0 0 2px var(--bg),0 0 0 4px var(--accent);
  --dur:160ms; --ease:cubic-bezier(.2,.7,.2,1);
}
```

Mørk (både `prefers-color-scheme: dark` og `:root[data-theme="dark"]`):

```css
--bg:#1B1713; --card:#26201A; --soft:#2F2820; --fg:#F1E9DE; --muted:#C3B7A8; --line:#3B3229; --sand:#9A8E80;
--accent:#9CA9BD; --accent-soft:#25303F; --dusty:#6E7C92;
--ok:#8CC39B; --ok-soft:#1F2E23; --warn:#E2B468; --warn-soft:#33281A;
```

Skrifter selvhostes som i dag (Newsreader og Inter fra @fontsource). Ingen ren hvit, ingen gradienter, ingen skygger (eneste unntak: dokumentarkene i Dokumentene, `0 8px 24px rgba(49,38,29,.16)` på Beige 3, og varselet som glir inn i Kundens reise, `0 1px 2px rgba(49,38,29,.06), 0 12px 40px -12px rgba(49,38,29,.22)`).

## 2. Typografi

- Brødtekst 17 px / 1,6 (`body{font:400 17px/1.6 var(--sans)}`), UI-tekst 15 px, hjelpetekst 14 px, eyebrow og piller 13 px.
- Titler Newsreader 400, `letter-spacing:-.015em`, `text-wrap:balance`: forsidetittel `clamp(2.5rem,5.6vw,4.6rem)/1.02`, romtittel `clamp(2rem,3.6vw,3rem)/1.08`, h2 `1.75rem/1.15`, korttittel og nøkkeltall-tittel `1.45rem/1.2` (aldri mindre serif), nøkkeltall `2.25rem/1.1` med `font-variant-numeric:tabular-nums`.
- `.eyebrow`: `font:500 13px/1.3 var(--sans); letter-spacing:.06em; text-transform:uppercase; color:var(--muted)`. Dette er eneste sted med sperring og versaler. Panel-overskrifter som «Selgeren ser», «Prøv dette», «Samtidig i …» bruker `.eyebrow`.
- Underoverskrifter i Inter 600, aldri på store titler. Ingressen `color:var(--muted); max-width:62ch`.

## 3. Basiskomponenter i vis.css (erstatter dagens .btn/.pill/.demo)

```css
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--r-pill);border:1px solid var(--fg);background:transparent;color:var(--fg);font:500 15px var(--sans);cursor:pointer;text-decoration:none;transition:background var(--dur) var(--ease),color var(--dur) var(--ease)}
.btn:hover{background:var(--fg);color:var(--bg)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--card)}
.btn.primary:hover{opacity:.88;background:var(--accent);color:var(--card)}
.btn.dark{background:var(--fg);color:var(--bg)}            /* valgt pille i rolle-/butikkvelger */
.btn.ghost{border-color:transparent;color:var(--muted)}
.btn.ghost:hover{background:var(--soft);color:var(--fg)}
.btn:active:not(:disabled){transform:translateY(1px)}
.btn:disabled{opacity:.45;cursor:not-allowed}
:focus-visible{outline:none;box-shadow:var(--focus);border-radius:var(--r-sm)}

.pill{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:var(--r-pill);font:500 13px/1.4 var(--sans);background:var(--line);color:var(--fg);white-space:nowrap}
.pill::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.pill.nodot::before{display:none}                          /* type-piller på kort og statuspillen i topplinjen */
.pill.info{background:var(--accent-soft);color:var(--accent)}
.pill.ok{background:var(--ok-soft);color:var(--ok)}
.pill.warn{background:var(--warn-soft);color:var(--warn)}

.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px 22px}
.tile{background:var(--soft);border-radius:var(--r-field);padding:12px 16px;display:grid;gap:2px}   /* nøkkel/verdi inne i kort – aldri kort på kort */
.tile.warn{box-shadow:inset 3px 0 0 var(--warn)}  .tile.ok{box-shadow:inset 3px 0 0 var(--ok)}
.tabs{display:inline-flex;gap:4px;padding:4px;border-radius:var(--r-pill);background:var(--bg);border:1px solid var(--line)}
.tabs button{border:0;background:transparent;color:var(--muted);font:500 15px var(--sans);padding:7px 16px;border-radius:var(--r-pill);min-height:36px;cursor:pointer}
.tabs button[aria-selected="true"]{background:var(--fg);color:var(--bg)}
.switch{width:46px;height:28px;border-radius:var(--r-pill);border:0;padding:3px;background:var(--line);display:flex;cursor:pointer}
.switch::after{content:"";width:22px;height:22px;border-radius:50%;background:var(--card)}
.switch[aria-checked="true"]{background:var(--accent)}  .switch[aria-checked="true"]::after{transform:translateX(18px)}
```

Statusfarger brukes bare i piller og varsler, alltid med tekst. Venstrestrek 3 px (inset box-shadow) markerer varsler («Står i fare», avviksliste, konflikter) og valgt rad.

## 4. Felles skall (alle 19 rom)

Topplinje: `max-width:1180px; padding:14px 24px 0; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap`. Venstre: `‹ Visningsrommet` (15 px/500 i `--accent`, min-height 44 px) + tynn strek (1 × 18 px, `--line`) + Hengsel-logoen 18 px. Høyre: statuspille `.pill.nodot` («Demo · oppdiktede data», «Under oppsett», «Venter på DXF» osv.; `.ok`/`.warn` der det passer).

Sidehode: `.eyebrow`, h1 (romtittel), ingress `color:var(--muted);max-width:62ch`. Gap 6 px.

Innholdsbredde 1180 px, sidemarg 24 px (16 px på mobil), 16 px mellom kort. Bunntekst 14 px i `--muted`: «Demoen er ikke koblet til ekte data. Skrifter: Newsreader og Inter.»

## 5. Forsiden (/)

- Toppfelt: Hengsel-logoen 26 px (merke + «engsel» + CRM-hake; svg-ene ligger i `assets/logo/` i Hengsel-pakken, bruk `hengsel-logo-lys.svg` / `-mork.svg`; ordet er `<text>` i TWK Lausanne, så lag konturer eller bruk Inter 350) + strek + «Visningsrommet» 15 px/500. SN-logoen til høyre, 26 px høy, 90 % opasitet (`/logo.svg` og `/logo-mork.svg` fra sites/sngroup/public). Ingen meny.
- Tittel og ingress som i dag (ordrett). Ingen eyebrow over tittelen.
- Ny seksjon «Slik henger det sammen» (h2) med tre kort: Kontoret · Hengsel CRM, Kunden · Min side, Montøren · Hengsel Ute. Tekstene står ordrett i `sites/hengsel/src/content/forside.ts` (FLOW). Hvert kort: bilde 16:10 øverst (`/img/min-dag.webp`, `/img/kundeportalen-pc.webp`, `/img/hengsel-i-dag-a.webp` – telefonbildet vises 58 % bredt, toppjustert), eyebrow, tittel 1,45 rem, tekst. Under: kjeden «Lead › Tilbud › Kjøpsavtale › Bestilling › Levering › Montering › Faktura › Reklamasjon» 14 px/500 i `--muted`.
- h2 «Velg hvem du er», rollevelger som `.btn` (valgt = `.btn.dark`), intro-linje under. Logikken er som i dag.
- Romkort: `.card` med `padding:12px 12px 20px`, bilde 16:10 (`object-fit:cover; object-position:top left`, radius 10, 1 px `--line`), så `.pill.info.nodot` (type), tittel 1,45 rem Newsreader, én setning 15 px `--muted`, lenketekst 15 px/500 i `--accent` med « ›» nederst (`margin-top:auto`). Rutenett `repeat(auto-fill,minmax(250px,1fr))`, gap 16 → 4 i bredden på PC, 2 på iPad, 1 på mobil; like høye kort. Hover: kantfarge `--sand`, ingen løft. Bilde per rom (fra `sites/hengsel/public/img/`): reise ordre-og-montasje · kunde kundeportalen · crm min-dag · montor hengsel-i-dag-a · levprov bestilling · minside kundeportalen-pc · kontroll tilbudet · montasjeplan montasje · prosjekt prosjektoppsett · hvitevarer produkter-hos-kunden · tegning hengsel-jobb-a · gevinst resultater · firmaleder hengsel-ipad · leverandor moduler · leder leder · veikart salgstavla · system kundekortet · sv signert · opplaering saker. Bytt til Sigdal CRM-skjermbilder der det finnes.
- Bunn: linje `--line` over, «Alle data i Visningsrommet er oppdiktet.» til venstre, «Levert med» + Hengsel-logo 20 px til høyre, deretter familiebåndet (`Familiebaand` fra packages/design, `gjeldende="hengsel.no"`).

## 6. Rommaler

**a) Simulering (reise, kunde).** To `.card`-paneler i `grid-template-columns:repeat(auto-fit,minmax(320px,1fr))` – stables på mobil. Paneloverskrift `.eyebrow` + metatekst 14 px til høyre. Ordreboksen: 1 px `--line`, radius 10, hode på `--soft`; rader `grid-template-columns:minmax(0,1fr) auto`, statuspille i kolonne 2 over to rader, kontrolltekst 12 px under. Bak kulissene: CRM-noden til venstre (28 % bredde, `--soft`, 1 px `--sand`) med Hengsel-logoen i stedet for teksten «Sigdal CRM»; leverandørnoder 46 % til høyre; linjer `--line` som blir `--dusty` når de er aktive; pakker som piller 12 px/500 (`--accent` ut, `--ok` inn, `--warn` ved avvik). Scenelinjen: `display:flex; overflow-x:auto`, hvert steg `flex:1 0 108px`, 4 px stolpe (`--accent` nå, `--dusty` passert, `--line` ellers). Knapper `.btn` (Forrige, Spill av primær, Neste, Start på nytt ghost), `.switch` «Spill videre», Fullskjerm ghost helt til høyre. Finale-overlegg: `.card` over panelene med eyebrow, tittel, fire `.tile` med nøkkeltall. I Kundens reise: telefonramme 390 × 720 med `#1B1713`-ramme radius 52/42, varselet glir inn fra toppen.

**b) Prøv selv (minside, montor, firmaleder, tegning, levprov, hvitevarer, prosjekt, montasjeplan, kontroll, gevinst).** `grid-template-columns:minmax(0,1fr) 390px minmax(0,1fr)` med telefonen i midten (390 × 844, ramme `#1B1713` radius 52, skjerm radius 42 på `--bg`, statuslinje 50 px med klokke «09.41»), sidepanel til høyre: `.card` «Prøv dette» (nummererte sirkler 24 px, 1,5 px `--sand`; ferdig = fylt `--ok` med hake) + «Start på nytt», og `.card` «Samtidig i [Hengsel-logo 16 px]» med logg (klokkeslett 12 px i `--muted`, rader skilt med 1 px `--line`). Mobil/PC-bryter er `.tabs`. I appen: `.card` med 16 px padding og 15 px tekst, store knapper `.btn.primary` 48–56 px, fanelinje nederst med 5 knapper 12 px (valgt i `--accent`). Montørappens «neste jobb»-kort er `--line`-flate (Beige 2) med eyebrow «NESTE · 08.00», navn i Newsreader, knapper «Åpne jobb» (primær, 56 px), «Ring», «Naviger». Uten tegnede ikoner: bruk Lucide 1,5 px eller bare tekst.

**c) Oversikt/presentasjon (leder, veikart, system, leverandor).** Nøkkeltall som `.card` i `repeat(auto-fit,minmax(170px,1fr))`: etikett 14 px `--muted`, tall 2,25 rem Newsreader tabular, forklaring 13 px. Søyler som enkle div-er (`--accent`, `--dusty` over kapasitet) med stiplet kapasitetslinje i `--sand`. Tabeller 15 px, th 13 px/600 `--muted`, tall høyrestilt tabular, rad-hover `--soft`. Varsler som `.tile.warn`. Systemkartet: tre kolonner (inn · nav · ut) med 40 px koblingskolonner, navet på `--soft` med Hengsel-logoen 28 px, valgt boks `--accent`-kant + 2 px `--accent-soft`-ring, detaljpanel `.card` sticky til høyre. Leverandørløsningen: lysbildet er `.card` radius 20, 48 px padding, 3 px fremdriftslinje i `--accent` øverst (bredde = side/12), bunnlinje med Forrige/Neste/teller/Fullskjerm.

## 7. /sv/ og /en/

Samme toppfelt som forsiden, men språkvelger «Norsk · Svenska · English» i midten (15 px/500, gjeldende i `--fg` 600, andre i `--muted`, 44 px høye klikkflater). Statuspille «By invitation only» over tittelen. Seksjoner: «The solution in brief» som fire `.tile` (padding 16/18), «Key points» som fire `.card` med tall i Newsreader 2,25 rem i `--accent`, «Explore» og «More rooms (in Norwegian)» som romkort uten bilde. Tekst ordrett fra dagens `en/index.html` og `sv/index.html`. Bunn som forsiden med «Part of SN Group».

## 8. Hengsel-logoen

Hengsel CRM-logoen skal nå også inn i det simulerte innholdet: CRM-noden i Ordrens reise, «Samtidig i Hengsel CRM», navet i Systemkartet, «Hengsel CRM» i /en/. Butikken heter «Kjøkkenstudio Hamar»; «Sigdal» står igjen bare som fabrikk/leverandør. Størrelser (logopakken 10.10, se «Oppdatert 10.10» øverst): toppfelt 40 px, topplinje i rom 28 px, i tekst 24 px, CRM-noden i Ordrens reise 34 px, nav i systemkartet 42 px, bunn 30 px. Luft rundt = merkets høyde. Aldri strekk, farger eller effekter.

## 9. Tilgjengelighet

Kontrast minst 4,5:1 (muted `#5E564C` på Beige 3 = 6,4:1; mørk `#C3B7A8` på `#1B1713` = 9,8:1). Alle klikkflater minst 40 px (knapper 44). Synlig fokusring `--focus`. `prefers-reduced-motion` slår av animasjoner. Ingen inline-skript (CSP `script-src 'self'`).
