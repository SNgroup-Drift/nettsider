# Skjermbilder og Apple-rammer på hengsel.no

> **K-233 (14.10):** alle app-skjermbilder på Hengsel-sidene (hengsel.no, /kunde/sigdal, vis.hengsel.no og Sigdal-utgaven, design.hengsel.no) hentes fra
> skjermbildebiblioteket på `https://bilder.hengsel.no/skjermbilder/v1/<tema>/<sti>` (K-228 i hengsel-crm tar dem automatisk fra demoen i Hengsel- og
> Sigdal-tema). Oppskriften er `packages/hengsel-tokens/skjermbilder.mjs` (`BILDEDOMENE`, manifestet, plassholderen); ingen app-skjermbilder ligger i
> repoet lenger, og bygget laster ingen ned: bare `manifest.json` leses (med fallback til `skjermbilder-manifest.json` i repoet, som bygget oppdaterer).
> Bilder som ikke står i manifestet, vises som plassholderen «Skjermbilde kommer» med `data-skjermbilde="<nøkkel>"`; `scripts/skjermbilder-bibliotek.test.mjs`
> godtar bare nøklene i `KJENTE_MANGLER` (`scripts/lib/bildedomene.mjs`). Stiene: `app/<navn>-lys.webp` (iOS), `apptest/<navn>-lys[@1x].webp`, `hjelp/<id>[@1x].webp`,
> `dok-forside.webp`, `vis/skjermbilder/<navn>[-mork][@1x].webp` og `vis/<rom|flate|forsta|hero>*.webp`. CSP-ene har `img-src … https://bilder.hengsel.no`.
> Resten av dette dokumentet beskriver rammene (som fortsatt ligger lokalt) og historikken for bildene.

> K-177 (12.10): skjermbildene i `public/img/app/` (Hengsel Ute, iOS-designet) og `public/img/apptest/` (CRM-designet, bare lys) er fiktive demo-skjermer fra designfasiten. Statuslinje og Dynamic Island tegnes av rammen (`Enhet.astro`), ikke av bildet. De gamle `crm-*`, `ute-*`, `portal-tilbud` og `ramme-ipad/-iphone/-macbook` er fjernet. Se `claude/k177-rapport.md`.

Struktur, tekst og rekkefølge følger fil 60 (`delt/pakke-v8/fasit/60 hengsel.no.dc.html`, W1 forside og W2 /apptest). Bildene i den fila (webp-forhåndsvisninger med
navn fra før) er ikke brukt; alle bilder kommer fra pakkene.

Kilde, i prioritert rekkefølge: pakke v8 (fasit), v7 (`ute-*` unntatt `ute-i-dag`), v6 (`display/` til Studio Display), v5 (`ute-i-dag`), v4
(`portal-tilbud` og `ute-ipad-bildeverktoy`). Hver ramme har sitt eget bildeformat: Studio Display 16:9 (`display/`, 2560 × 1440), MacBook 16:10
(`pc/`, 2880 × 1800; ikke i bruk på siden nå), iPad (`ipad-liggende` er en iPad Air 11″-ramme, hull 1,44:1) 2360 × 1640 og iPhone 18 1206 × 2622.
Rammene er Apples Product Bezels med gjennomsiktig skjermhull (`public/img/ramme-*.webp`); skjermbildet ligger under rammen og klippes til hullet med
hjørneradius, `object-fit: cover`, `object-position: top` (`src/components/Enhet.astro`). Rammen er ikke beskåret, vippet eller speilvendt, og har
ingen skygge. Skjermbildene er WebP (kvalitet 80–82) laget av PNG-ene i pakkene, uten endring i oppløsning. Skjermhullene (andel av rammen) står i
`Enhet.astro` og i INSTRUKS.md.

## Hvor hvert bilde brukes (forsiden, W1)

| Seksjon | Ramme | Bilde (pakke) |
|---|---|---|
| Hero | iPhone 18 | `ute-i-dag` (v5) |
| Hengsel Ute, ni skjermer | iPhone 18 | `ute-i-dag` (v5), `ute-jobb-under`, `ute-laser`, `ute-ks`, `ute-avvik`, `ute-punkter`, `ute-punktkort`, `ute-ferdig`, `ute-typeskilt` (alle v7) |
| Hengsel Ute, bildeverktøy | iPad liggende (11″) | `ute-ipad-bildeverktoy` (v4, 2360 × 1640) |
| For kontoret (liste som faner) | Studio Display | `crm-resultater` (Ledertavle), `crm-montasje` (Montasjeplan og kontrollmål), `crm-bestilling` (Bestilling), `crm-etterkalkyle` (Økonomi), alle v6 `display/` |
| Kundeportalen | iPhone 18 | `portal-tilbud` (v4) |
| /apptest | iPhone 18 ×3 | `ute-i-dag` (v5), `ute-ks`, `ute-laser` (v7) |

Seksjonsrekkefølge: hero, produkt (tre kort), «Slik går en jobb gjennom Hengsel» (sju steg uten bilder), Hengsel Ute (mørk), For kontoret,
Kundeportalen, Integrasjoner, priser og om, kontakt.

## Valg og avvik

- **Fjernet etter fil 60:** hero-sammensetningen med Studio Display + telefon (hero er nå bare telefonen), bilder i de sju stegene, steg-fanene,
  «åtte grep» (erstattet av ni skjermer i Hengsel Ute), moduloversikten og kundeportalen med MacBook og fire telefoner. Bildene som ikke lenger brukes
  er slettet fra `public/img/`: `crm-tilbud`, `kundeportal-pc`, `portal-levering`, `portal-montering`, `portal-fdv`, `ute-ks-kamera`.
- **Ikke brukt fra v8:** `crm-mal-skisser` og `crm-moduler` finnes i pakken, men er ikke i fil 60.
- **For kontoret** er en liste i fasit. Listen fungerer som faner, så alle fire CRM-skjermene fra v6 beholdes (`role=tablist`, ett Studio Display-panel
  per punkt).
- **Navn i Ute-bildene:** alle `ute-*` fra v7 (og `ute-i-dag` fra v5) har Kari Nordmann og Ola.
- **Studio Display (v6):** `display/`-bildene er 16:9 og passer hullet (94,81 % × 69,23 % av rammen) uten beskjæring. Navnene i pakken stemmer ikke
  alltid med innholdet: `crm-resultater` er Leder › Oversikt. Alt-tekstene i `src/content/forside.ts` beskriver det bildene faktisk viser.
- **iPad:** `ute-ipad-bildeverktoy` er 2360 × 1640 (1,44:1, v4) og fyller hullet i `ipad-liggende` uten beskjæring. Det finnes ingen bildetilpasning
  (`fit`, `contain`) i `Enhet.astro`.
- **Ferdig montert:** teksten er «Klar for ferdigmelding» (som bildet i v7), ikke «Kundens signatur på skjermen» fra fil 60.
- **Topplogo:** `Meny.astro` bruker `hengsel-aksent-lys.svg` / `-mork.svg` fra merkepakken i `brand/` (fasit 12.10.2026, K-174). Sidebakgrunnen er Off White; kortene er Beige 3. Begge er avgjort å beholde.
- **Appknapper:** `/apptest` er skjult (passordvegg, noindex, ikke lenket), så «App Store · TestFlight» og «Google Play» er deaktiverte knapper
  (`TODO_…` i `src/content/forside.ts`) til lenkene er avklart. «Bli tester» er `mailto:test@hengsel.no`.
- **Ikke i fasit, men beholdt:** kontaktskjemaet med plantegning og bunnen. Avgjort å beholde, i likhet med deaktiverte appknapper og faner i «For kontoret».
- **/apptest** følger W2 (korttekster, pillknapper, «‹ Tilbake til hengsel.no», to kolonner, bunn med merke). Beholdt fra tidligere beskjed: Ute-logoen
  øverst, versjon og «Hva er nytt» fra `apptest-lenker.ts` (Action), «Siste oppdatering», «Testere» og tre iPhone-skjermer.
- Ikke i bruk i pakkene: `ipad13/*`, Duo-rammen `iphone-aapen`, `pc/*` (ingen MacBook-ramme på siden).

## Sjekk

`npm test` (lenker og bilder i `img/` svarer 200, pluss enhetstestene) og `node scripts/skjermbilder.mjs` (ni telefoner i Hengsel Ute, fire
kontorfaner med lysboks, ingen eksterne forespørsler, ingen informasjonskapsler). Sett i nettleser på PC 1440 og telefon 390, lyst og mørkt: forside
og /apptest. Ingen kuttede kanter, ingen dobbel statuslinje, ingen merkenavn, bildene fyller skjermhullet.

/apptest er gjennomgått på 1440 og 390: ingen dobbel statuslinje (bildene har ingen statuslinje, rammen har island), og ingen kundenavn eller Sigdal/Nobia. Appskjermen `ute-laser` viser lasermålernes produktnavn (Bosch GLM, Leica DISTO, Hilti PD-S); de er en del av bildet fra pakken.
