# Dokumentvisning: felles for hengsel.no og Visningsrommet (K-160, K-161)

Dokumentene vises på to steder: hengsel.no/dokumenter (Astro) og vis.hengsel.no/dokumenter (ren HTML, `sites/vis`). Begge leser **samme datafil**, så et dokument endres bare ett sted.

## Filene (`packages/hengsel-dokumenter/src/`)

| Fil | Hva |
|---|---|
| `data.js` + `data.d.ts` | De ni dokumentene (`DOKUMENTER`), `LAGES_STEG`, `A4`, typene (`Dokument`, `DokSide`, `Blokk` …). Ren data, ingen Astro eller DOM. |
| `lages.js` + `lages.d.ts` | «Slik lages det» per dokument i Visningsrommet: 3–5 steg (tittel, tekst, knappen som trykkes, skjermbilde fra CRM-designfilene), hva som skjer etterpå (PDF, e-post, SMS, signering, lagring) og lenker til rommene. |
| `render.js` + `render.d.ts` | `renderA4Side(side, { fot, nr, total, ligg, forst })` gir HTML for én A4-side. Brukes av begge stedene. Alle tekster escapes. |
| `a4-stil.js` + `.d.ts` | `a4DynamiskCss(dokumenter)`, `malKlasse`, `hhKlasse`: kolonnemaler og bildehøyder som klasser. |
| `a4.css` | A4-papiret. Skalerer med bredden uten skript (container-enheter, `--u` = én designpiksel). Papiret er alltid lyst. |
| `dokumentvisning.css` | Velger, stripe, bla-knapper, innholdsliste, lysboks. Trenger variablene `--bg --surface --surface-soft --surface-highlight --line --ink --muted --accent --f-display --f-body`. |
| `dokumentvisning.js` | Faner, bla (knapper, ← →, sveip), innholdsliste, lysboks, `#id` i adressen (når `data-hash` står på `[data-dokvisning]`). Vanlig JavaScript. |

Pakken eksporterer dem som `@sngroup/hengsel-dokumenter/data`, `…/render`, `…/a4-stil`, `…/lages`, `…/a4.css`, `…/dokumentvisning.css` og `…/dokumentvisning`.

## hengsel.no

`sites/hengsel/src/content/dokumenter-data.ts` re-eksporterer `data.js`. `A4Side.astro` kaller `renderA4Side` (`set:html`), `Dokumentpanel.astro` og `Dokumentvisning.astro` lager panelene (første dokument i DOM, resten i `<template>`), og Astro bundler skriptet og CSS-en fra pakken.

## Visningsrommet (`sites/vis`)

`bygg.mjs` kopierer `a4.css`, `dokumentvisning.css` og `dokumentvisning.js` til `dist/assets/dokumenter/` og forsidebildet `dok-forside.webp` (fra `sites/hengsel/public/img`) til `dist/img/`. `sites/vis/dokumenter.mjs` lager HTML av de felles dataene og `bygg.mjs` setter den inn der markørene står:

| Markør | Gir | Brukes i |
|---|---|---|
| `<!--dokumentvisning-->` | Velger, ni dokumenter med ark og bla-knapper, «Slik lages det» | `src/dokumenter/index.html` |
| `<!--a4-stil-->` | `<style>` med kolonnemaler og bildehøyder | alle sider som viser A4 |
| `<!--a4-ark:id:side:Tittel-->` | Ett lite ark som lenke til `/dokumenter/#id` | forsiden |

Det finnes ingen dokumentbilder (`dok-*.webp` er fjernet). Romkortet `src/img/rom-dokumenter.webp` lages av `npm run rammer:vis` fra en gjengitt tilbudsforside (krever `npm run build -w sites/vis` først).

Lenker til et dokument: `/dokumenter/#tilbud`, `#kjopsavtale`, `#ob`, `#anbud`, `#montering`, `#punkt`, `#fdv`, `#plan`, `#faktura`.

## Endre eller legge til et dokument

1. Rediger `data.js` (side, blokk eller tekst). Begge stedene følger med ved neste bygg.
2. Legg til `LAGES.<id>` i `lages.js` (3–5 steg, skjermbilder fra `sites/vis/src/skjermbilder`). `scripts/dokumenter.test.mjs` feiler om et dokument mangler «Slik lages det», om et skjermbilde ikke finnes, eller om et merkenavn dukker opp.
3. Bruk nøytrale demonavn (Butikknavn, Kari Nordmann, Leverandør A). «Din logo» øverst og Hengsel-logoen (`hengsel-lys.svg`, 3 mm) i bunnlinjen til høyre, aldri to Hengsel-logoer. Stien til logoen settes med `logoSti` i `renderA4Side` (standard `/logo/hengsel-lys.svg`).

## Tilgjengelighet og ytelse

- Arket (`[data-ark]`) har `tabindex="0"`; ← og → blar når arket eller knappene har fokus. Sveip til sidene på berøringsskjerm (også i lysboksen). Teller «Side 2 av 6» (`aria-live`).
- Lysboksen er en modal `<dialog>` (`showModal()`, inert bakgrunn), egen fokusfelle, Esc lukker, fokus går tilbake til knappen som åpnet den. På telefon (under 700 px) vises arket i lesbar størrelse og kan rulles.
- Bare det første dokumentet ligger i DOM-en; de andre i `<template>`. Alle sider unntatt den viste er `hidden`, og forsidebildene er `loading="lazy"`. Bilder har `width` og `height` (CLS 0).
- `scripts/skjermbilder-vis.mjs` sjekker bla med tastatur og sveip, lazy-lasting, bilder uten mål eller alt, lysboks, CLS og kontrast (4,5:1) på `/dokumenter/` på 390 og 1280 px, lys og mørk.
