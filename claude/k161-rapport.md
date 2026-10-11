# K-161 · Visningsrommet: hele dokumenter, og hvordan de lages

Sak S-28. Gren `claude/k161-vis-dokumenter` → PR mot `main` (ikke flettet; Eirik fletter). Skjermbilder: `claude/k161-skjermbilder/` (16 filer: oversikten og tre dokumenter, 390 og 1280 px, lys og mørk).

## 1. Hva som er gjort

| # | Krav | Resultat |
|---|---|---|
| 1 | `/dokumenter` med ni hele dokumenter | `sites/vis/src/dokumenter/index.html` har markøren `<!--dokumentvisning-->`; `bygg.mjs` fyller den med velger (faner), ark med bla-knapper, tastatur (← →), sveip på mobil, «Side 2 av 6», innholdsliste og lysboks. Samme dokumenter, sider og tekster som hengsel.no. |
| 2 | Felles datafil | `packages/design/src/dokumenter/data.js` (+ `data.d.ts`). hengsel.no importerer den (`content/dokumenter-data.ts` re-eksporterer), vis leser den ved bygging. A4-markupen er flyttet til én gjengiver (`render.js`) som begge bruker, og `a4.css`, `dokumentvisning.css` og `dokumentvisning.js` ligger også i pakken. Et dokument endres ett sted. |
| 3 | Slik lages det | `packages/design/src/dokumenter/lages.js`: 3 steg per dokument (kravet er 3–5) med skjermbilde i Studio Display-ramme fra CRM-designfilene, knappen som trykkes, og «Etterpå» (PDF, e-post, SMS, signering, lagring). Øverst står de fem delene fra dataene («Ordren i CRM · Valg · Knapp · Ferdig PDF · Sendt»). |
| 4 | Lenker fra rom | Ordrens reise scene 2 og 3 → `#kjopsavtale`; Montørappen → `#montering`; Kundens Min side → `#fdv`. Hvert dokument lenker også tilbake til rommene som viser det. |
| 5 | Fjern `dok-*.webp` | Alle ni slettet. Forsiden viser nå ekte A4-ark (første side av fem dokumenter) fra samme gjengiver, og `rom-dokumenter.webp` er laget på nytt fra en gjengitt tilbudsforside (`scripts/rammer-vis.mjs`). |
| 6 | Ytelse og tilgjengelighet | Se 3. |
| 7 | Tester og skjermbilder | Se 2. |

Eiriks beslutninger: nøytrale demonavn (Butikknavn, Kari Nordmann, Leverandør A) merket «Eksempel»; «Din logo» øverst og «by Hengsel» i bunnlinjen (testet at det er ett av hvert per side og ingen Hengsel-logo som bilde); ingen merkenavn (testet); Newsreader og Inter; beige flater, Deep Blue bare på knapper og lenker (knappen i «Slik lages det», faner og piler følger vis-tokens).

## 2. Kontroller

- `npm run build`: alle fire sider bygger.
- `npm test`: 36 tester (nye: `scripts/dokumenter.test.mjs`: ni dokumenter, 3–5 steg, skjermbildene finnes, ingen merkenavn, én «Din logo»/«by Hengsel» per side, escaping) + lenkesjekken (127 adresser i vis, 0 feil; `#id`-ene til dokumentene sjekkes også).
- `node scripts/skjermbilder-vis.mjs`: 0 feil. For `/dokumenter/` på 390 og 1280, lys og mørk:
  - bare første dokument i DOM (fem A4-sider; åtte dokumenter i `<template>`), `#tilbud`, `#kjopsavtale` og `#montering` viser bare det dokumentet,
  - alle bilder har `width`, `height` og `alt`, alle knapper har navn,
  - ← og → blar, sveip til venstre går til side 2 (mobil), lysboks åpner, blar, Esc lukker og fokus går tilbake,
  - kontrast minst 4,5:1 (3:1 for stor tekst) på tekst utenom A4-papiret, CLS 0,000, ingen konsollfeil (CSP gjelder), ingen vannrett rulling.
- hengsel.no/dokumenter sjekket etter flyttingen: fem A4-sider i DOM, faner og bla virker, ingen konsollfeil.

## 3. Ytelse og tilgjengelighet

- A4-sidene lazy-lastes: første dokument i DOM, resten i `<template>` og settes inn når de velges; sider som ikke vises er `hidden`; forsidebildet er `loading="lazy"` (første side `eager`).
- Skjermbildene i «Slik lages det» er `loading="lazy"` med `width="2560" height="1440"`; rammen har fast `aspect-ratio`.
- Arket har `tabindex="0"` og `aria-label`; teller har `aria-live`; faneliste med piltaster, Home og End; `#id` åpner dokumentet.
- Papiret er alltid lyst (som utskrift). Sidene rundt følger lys/mørk modus.

## 4. Per dokument

| Dokument | Sider | Steg i «Slik lages det» | Skjermbilder (CRM-designfilene) | Adresse |
|---|---|---|---|---|
| Tilbud | 5 | 3 | crm-tilbud, crm-mal-skisser, crm-tilbud-kunde | `/dokumenter/#tilbud` |
| Kjøpsavtale | 5 | 3 | crm-tilbud-kunde, crm-ordre-kontrollmal, kundeportal-pc | `#kjopsavtale` |
| Ordrebekreftelse | 3 | 3 | crm-ordre-kontrollmal, crm-bestilling, kundeportal-pc | `#ob` |
| Anbud og tilvalgsliste | 4 (liggende) | 3 | crm-tilbud, crm-tilbud-kunde, crm-salgstavla | `#anbud` |
| Monteringsrapport med KS | 2 | 3 | crm-montasje, crm-ordre-kontrollmal, crm-min-dag | `#montering` |
| Punktrapport | 2 | 3 | crm-min-dag, crm-ordre-kontrollmal, kundeportal-pc | `#punkt` |
| Leveringspakke og FDV | 5 | 3 | crm-ordre-kontrollmal, crm-etterkalkyle, kundeportal-pc | `#fdv` |
| Montasjeplan | 2 (liggende) | 3 | crm-montasje, crm-saker | `#plan` |
| Faktura | 2 | 3 | crm-ordre-kontrollmal, crm-etterkalkyle, crm-bestilling | `#faktura` |

## 5. Valg og forbehold (Eirik bør se på disse)

1. **Skjermbildene passer bare delvis.** CRM-designfilene har ikke egne skjermer for «Send til signering», «Lag punktrapport», «Lag leveringspakke», «Skriv ut uke» eller PDF-forhåndsvisning. Stegene bruker nærmeste ekte CRM-skjerm (for eksempel ordren med fanen Dokumenter), og teksten sier hva som skjer. Knappen vises som en merkelapp ved siden av bildet, ikke tegnet inn i skjermbildet. Samme bilde brukes i flere steg i noen dokumenter. Anbud, punktrapport og faktura har de svakeste treffene. Vil du ha nøyaktige skjermer, må de tegnes og eksporteres (nye `crm-*`-bilder i `sites/vis/src/skjermbilder`), og `lages.js` byttes.
2. **Bare tre steg per dokument**, ikke fire–fem: mer ville krevd å gjenta de samme få skjermene. Det er plass til to til per dokument i `lages.js` (testen krever 3–5).
3. **Montør og punkter vises på PC.** Montørappen (iPhone) har ekte skjermer (`ute-ks`, `ute-punkter`), men regelen din var Studio Display. Appen er i stedet lenket (`/montor/`).
4. **Gjengiver delt, ikke bare data.** Avtalen var én datafil; jeg delte også A4-markupen (`render.js`), ellers ville Astro-komponenten og vis-gjengiveren drive fra hverandre. `A4Side.astro` er nå en tynn innpakning. Ingen visuell endring på hengsel.no (sjekket).
5. **`.dv-panel[hidden]`**: panelene hadde `display:flex` som overstyrte `hidden` i vis (der hengsel.no har en global regel). Rettet i den felles CSS-en og dekket av testen over.
6. **Skygge**: arkene har skyggen fra README (`0 8px 24px`), som er unntaket for dokumentark.
7. **Skjermbilder** (`claude/k161-skjermbilder/`) er hele sider, de høyeste ca. 23 000 px på 390 px × 2; 13 MB totalt.
8. **Branch**: harnessen hadde laget `claude/k161-vis-dokumenter-em89nj` samtidig. Arbeidet ligger på `claude/k161-vis-dokumenter` (navnet fra oppgaven).
9. Ingenting er flettet eller kjørt mot live; ingen passord eller nøkler er brukt.

## 6. Filer

Nye: `packages/design/src/dokumenter/{data,lages,render,a4-stil}.{js,d.ts}`, `sites/vis/dokumenter.mjs`, `sites/vis/src/assets/dokumenter.css`, `scripts/dokumenter.test.mjs`. Flyttet fra hengsel: `a4.css`, `dokumentvisning.css`, `dokumentvisning.js` (nå vanlig JS, med tastatur og sveip). Endret: `sites/vis/bygg.mjs`, `sites/vis/src/{dokumenter,index}.html`, `reise/`, `montor/`, `minside/`, `assets/forside.css`, `scripts/{skjermbilder-vis,rammer-vis}.mjs`, `package.json`, README og `docs/dokumentvisning.md`. Slettet: `sites/vis/src/dokumenter/dok-*.webp` (9).
