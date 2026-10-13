# Sjekkliste før merge – Visningsrommet i Hengsel-profilen

Kjør gjennom alle 24 sider i lys og mørk, PC 1440 og mobil 390. Fasit: `Visningsrommet – frittstående.html` og README §1–§9.

## Funn 10.10.2026 (se README øverst) – rettet i PR-en 10.10
- [x] Logoen rendres som tomme bokser på alle vis-sider – byttet til SVG fra merkepakken (`src/assets/logo/`).
- [x] «Studio Sigdal» / «Sigdal CRM» fjernet fra Firmaleder, Hvitevarer, Min side, Prøv som leverandør, Kundens reise, /sv/ og Opplæring.
- [x] Forsiden er v2 (hero med illustrasjon, Start her, tidslinje, Alle rommene, avslutning).
- [x] Leverandørløsningen: lysbildet ikke høyere enn innholdet.
- [x] Montasjeplan: ukekolonner brede nok til at korttekst ikke brekker per ord.
- [x] Skjermbilder i rammene kommer fra designfilene i CRM_v4 (`src/skjermbilder/`, README «Regel for skjermbilder»): ingen tegnet UI, ingen bilder fra kjørende demo. Aldri PC-bildet i iPad- eller telefonrammen.
- [x] Alle skjermbilder i Apples rammer (README «Apple-rammer»): ingen bilde uten ramme (unntak: A4-arkene i Dokumentene), ingen bilde utenfor skjermhullet, ingen dobbel statuslinje på iPhone, rammer minst 200 px høye.

## Logo
- [ ] Hengsel-merket er SVG fra merkepakken (`src/assets/logo/*-aksent-lys.svg` / `-mork.svg` som `<img>`, byttes med CSS; konturert tekst). Aldri strukket, rotert eller i andre farger.
- [ ] Størrelser (merkepakken 12.10): toppfelt og topplinje i rom 28 px (`hengsel-aksent`) · i tekst («Samtidig i …») 24 px (`crm-aksent`) · CRM-noden i Ordrens reise 34 px og navet i Systemkartet 42 px (`hengsel-crm-aksent`) · bunn 14 px (`levert-av-aksent`).
- [ ] Mørk modus bruker `-aksent-mork`-utgavene (symbol og ord i Off White, stift i Dusty Blue).
- [ ] SN-logoen 26 px høy, 90 % opasitet, bytter til `logo-mork.svg` i mørk modus.
- [ ] «Sigdal CRM» er borte fra simulert innhold; butikken heter «Kjøkkenstudio Hamar» (bestilling@kjokkenstudio-hamar.no); «Sigdal» står bare som fabrikk/leverandør.

## Typografi
- [ ] Overskrifter i Schibsted Grotesk 700, aldri versaler.
- [ ] Sperring (0,06 em) og versaler bare på `.eyebrow`. Ingen `letter-spacing` på små bokstaver.
- [ ] Brødtekst 17 px/1,6, UI 15 px, hjelpetekst 14 px, eyebrow og piller 13 px.
- [ ] Underoverskrifter Schibsted Grotesk 600, aldri på store titler.

## Farger og flater
- [ ] Bare tokenverdiene fra README §1. Ingen ren hvit, ingen gradienter, ingen skygger (unntak: varselet i Kundens reise og dokumentarkene i Dokumentene).
- [ ] Sidebakgrunn `--bg` (Beige 3), kort `--card`, fliser inne i kort `--soft`. Aldri kort på kort.
- [ ] Statusfarger bare i piller og varsler, alltid med tekst. Venstrestrek 3 px inset på varsler og valgt rad.
- [ ] Mørk modus på alle rom: ingen faste Beige-verdier (`#E4D4C4`, `#F2E9DB` osv.) i rom-CSS – bruk `--line`/`--soft`/`--bg`, ellers forsvinner tekst (feilen i Kundens reise-heroen).
- [ ] Kontrast minst 4,5:1 på all tekst, også på piller og i mørk modus.

## Skall
- [ ] Topplinje: «‹ Visningsrommet» 15 px/500 i `--accent` · strek 1 × 18 px · Hengsel-logo 28 px · statuspille `.pill.nodot` til høyre.
- [ ] Sidehode: `.eyebrow` → h1 → ingress (`--muted`, maks 62 tegn). Gap 6 px.
- [ ] Bredde 1180 px, marg 24 px (16 på mobil), 16 px mellom kort.
- [ ] Bunntekst 14 px `--muted`: «Demoen er ikke koblet til ekte data. Skrift: Schibsted Grotesk.»

## Forsiden
- [ ] Toppfelt: logo 40 px + strek + «Visningsrommet»; SN-logo høyre; ingen meny.
- [ ] «Slik henger det sammen»: fire kort (2 i bredden) med enhetsbilde, eyebrow (Butikken/Montøren/Kunden/Leverandøren), tittel, FLOW-tekst ordrett.
- [ ] Kjeden «Lead › … › Reklamasjon» 14 px/500 i `--muted`.
- [ ] Rollevelger `.btn`, valgt `.btn.dark`. Filtrerer kortene, lagrer i localStorage og `?rolle=`.
- [ ] Romkort: enhetsbilde 4:3 → type-pille `.pill.info.nodot` → tittel 1,45 rem → én setning → lenketekst med « ›» nederst. Like høye. 4 / 2 / 1 i bredden (1440 / 1180 iPad / 390).
- [ ] Hover på kort: kantfarge `--sand`, ingen løft.
- [ ] Bunn: «Alle data i Visningsrommet er oppdiktet.» + «Levert av» + Hengsel (`levert-av-aksent`, 14 px) + familiebåndet (`gjeldende="hengsel.no"`).

## Rommaler
- [ ] Simulering: panelene stables på 390 px; scenelinjen ruller horisontalt (`flex:1 0 108px`); Spill av / Pause / Fortsett / Spill av igjen; «Spill videre» er `.switch`; piltaster og mellomrom virker.
- [ ] Ordrens reise: pakkene går `--accent` ut, `--ok` inn, `--warn` ved avvik; linjene blir `--dusty` når aktive; finale-overlegget vises etter scene 8.
- [ ] Kundens reise: varselet glir inn fra toppen og ut etter ~3 s; autoavspilling 5,2 s per steg.
- [ ] Prøv selv: telefon 390 × 844 i midten, sidepanel til høyre; «Prøv dette» med 24 px sirkler (ferdig = fylt `--ok`); «Samtidig i [Hengsel]»-logg med klokkeslett. Mobil/PC-bryter er `.tabs`.
- [ ] Oversikt: nøkkeltall 2,25 rem tabular; søyler `--accent`/`--dusty` med stiplet kapasitetslinje; tabeller 15 px med høyrestilte tall; varsler `.tile.warn`.
- [ ] Systemkartet: valgt boks `--accent`-kant + ring, detaljpanel sticky, koblingslinjer tynne (1,5 px), ikke blokker.
- [ ] Montasjeplan: kort med 3 px venstrestrek (`--warn` feil, `--dusty` advarsel, `--ok` akseptert); navn og «ordre · sted» på hver sin linje, ingen overlapp.
- [ ] Leverandørløsningen: lysbilde `.card` radius 20, 3 px fremdriftslinje `--accent` (bredde = side/12), teller «n / 12».

## /sv/ og /en/
- [ ] Språkvelger «Norsk · Svenska · English» i toppfeltet, gjeldende i `--fg` 600, 44 px klikkflater, `hreflang`.
- [ ] «The solution in brief» som fire `.tile`, «Key points» som fire `.card` med tall i `--accent`.
- [ ] Tekst ordrett fra dagens filer. Bunn «Part of SN Group».

## Teknisk
- [ ] Ingen inline-skript; CSP `script-src 'self'` passerer på alle sider.
- [ ] Skrift selvhostet (Schibsted Grotesk). Ingen Google Fonts-lenke.
- [ ] `prefers-reduced-motion` slår av animasjoner.
- [ ] Alle klikkflater minst 40 px (knapper 44, montørapp 56). Synlig fokusring `--focus`.
- [ ] `npm test` (lenkesjekk inkl. lenker i `side.js`) og `npm run skjermbilder` grønt. Skjermbilder regenerert i `docs/skjermbilder`.
- [ ] `sites/vis/README.md` oppdatert; PR #2 oppdatert eller lukket til fordel for den nye grenen.
