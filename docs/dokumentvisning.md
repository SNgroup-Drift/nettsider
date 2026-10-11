# Dokumentvisning: gjenbruk i Visningsrommet (K-161)

Visningen på hengsel.no/dokumenter er bygd for å kunne brukes en gang til. Dataene er atskilt fra visningen, og visningen tar dataene som parameter.

## Filene (alle i `sites/hengsel/src/`)

| Fil | Hva | Avhengigheter |
|---|---|---|
| `content/dokumenter-data.ts` | De ni dokumentene (`DOKUMENTER`), typene (`Dokument`, `DokSide`, `Blokk` …), `LAGES_STEG`, `A4` | Ingen. Ren TS, ingen Astro eller DOM. |
| `components/dokumenter/a4-stil.ts` | `a4DynamiskCss(dokumenter)`, `malKlasse`, `hhKlasse` | Ren TS |
| `components/dokumenter/A4Side.astro` | Én A4-side, stående eller liggende, alle sidetyper | Astro |
| `components/dokumenter/Dokumentpanel.astro` | Ett dokument: «Slik lages det», arket, bla-knapper, innholdsliste | Astro |
| `components/dokumenter/Dokumentvisning.astro` | Velger, paneler (første ferdig, resten i `<template>`), lysboks (`<dialog>`) | Astro |
| `scripts/dokumentvisning.ts` | Faner, bla, innholdsliste, lysboks, fokusfelle | Ingen (vanlig TS) |
| `styles/a4.css` | A4-papiret. Skalerer med bredden uten skript (container-enheter, `--u` = én designpiksel) | Ingen |
| `styles/dokumentvisning.css` | Velger, stripe, bla-knapper, innholdsliste, lysboks | Variablene `--bg --surface --surface-soft --surface-highlight --line --ink --muted --accent --f-display --f-body` |

Forsidebildet er `public/img/dok-forside.webp` (1200 × 768), hentet fra `/img/dok-forside.webp`. Skriftene hentes fra `--a4-skrift` og `--a4-overskrift`, med «Inter Variable»/«Inter» og «Newsreader Variable»/«Newsreader» som reserve (Visningsrommet bruker «Inter» og «Newsreader», så det virker uten endring).

## Dataene

`DOKUMENTER` er en vanlig liste og kan serialiseres: `JSON.stringify(DOKUMENTER)` (typene er bare TS og forsvinner). Et dokument har `id`, `t`, `s`, `fot`, `lages` (fem tekster), `ligg` (liggende) og `sider`. En side har enten `forside`, `todelt` eller `blokker`; blokkene er en union på `type` (se `Blokk`). Under bygging kan andre byggetrinn importere filen direkte (`import { DOKUMENTER } from ".../dokumenter-data.ts"` via esbuild/tsx/Astro) eller lese en JSON-utgave. Teksten er oppdiktet eksempelinnhold og vises med «Eksempel»-merking; nytt innhold skal ikke nevne merkenavn.

## Slik brukes visningen

I en Astro-side: `<Dokumentvisning dokumenter={DOKUMENTER} />` (eller et utvalg). Komponenten importerer selv CSS-en og laster skriptet (Astro bundler `<script>`). Siden må ha variablene over; i `sites/hengsel` kommer de fra `styles/hengsel.css` og `tokens.css`. CSP: ingen `style`-attributter eller innebygde skript brukes. Kolonnemalene i tabellene ligger i én `<style>` fra `a4DynamiskCss()` (hashes av `scripts/csp-hasher.mjs` i hengsel; Visningsrommet må tillate eller hashe den).

## Hva som må til for at `sites/vis` (ren HTML uten Astro) kan bruke den

Markup lages av Astro-komponentene, så det trengs ett mellomledd. Valgene, enklest først:

1. **Fragment fra hengsel-bygget.** Legg en Astro-side (eller endepunkt) i `sites/hengsel` som bare gir `<Dokumentvisning dokumenter={DOKUMENTER} />` som HTML-fragment (uten meny og bunn), og la `sites/vis/bygg.mjs` sette fragmentet inn der det står en markør (som den allerede gjør med `<!--hengsel-logo N-->`). Kopier `_astro/*.css` og `_astro/Dokumentvisning*.js` fra `sites/hengsel/dist` til `dist/` i vis og lenk dem. Bygg hengsel først (rekkefølgen i rot-skriptet).
2. **Astro Container API** (`experimental_AstroContainer`) i et eget byggetrinn som rendrer `Dokumentvisning.astro` til en streng. Ikke prøvd.
3. **Egen gjengiver i ren JS** over de samme dataene. Klassene i `a4.css` og `dokumentvisning.css` og `data-*`-attributtene i `scripts/dokumentvisning.ts` er kontrakten; skriptet og stilene kan brukes uendret. Mest arbeid (A4Side er ca. 150 linjer markup).

Uansett: skriptet og de to CSS-filene kan gjenbrukes som de er (`esbuild --bundle --minify scripts/dokumentvisning.ts`), og Visningsrommets CSP må tillate egne skript og stil fra samme opprinnelse. Visningsrommets dokumentmaler (`sites/vis/src/dokumenter/*.webp`) er forbildet og kan beholdes som forhåndsbilder til de ni dokumentene.

## Lysboksen (tilgjengelighet)

`<dialog>` med `showModal()` (resten av siden er inert), egen fokusfelle, Esc lukker, ← og → blar, `aria-label` «Åpne siden i lysboksen», «Forrige side», «Neste side», «Lukk» og «Dokumenter» (fanelisten). Fokus går tilbake til knappen som åpnet den. På telefon (under 700 px) vises arket i lesbar størrelse og kan rulles, knappene ligger under.
