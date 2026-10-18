# N-6b · Pause-knapp, symboltest og én symboldefinisjon på forsiden (nettsider, nattkjøring 18.10.2026)

PR: https://github.com/SNgroup-Drift/nettsider/pull/92 (gren `claude/n6b-pause-symboler`, mot `main`). Eirik fletter.

## Gjort
1. **Pause-knapp (WCAG 2.2.2).** `Stegmerker.astro` har fått en liten knapp (32 × 32 px) etter merkene: `data-pause`, `aria-label="Pause serien"`,
   `aria-pressed` («true» = på pause), pause-/spill av-ikon som inline-SVG med `currentColor`. Bare tokens (`--linje`, `--kant`, `--tekst-dempet`,
   `--aksent`, `--tekst-invers`, `--radius-felt`), ingen `style=`. Knappen vises først når skriptet har tatt den i bruk (klassen `klar`), aldri ved
   `prefers-reduced-motion` (serien går ikke av seg selv der, som før) og ikke uten skript.
   `scripts/simulering.ts`: serien stoppes/startes med knappen (klikk, Enter og Space som vanlig `<button>`), holdes automatisk mens musen er over
   rammen (`pointerenter`/`pointerleave`, bare `pointerType === "mouse"`, så berøring på telefon holder ikke) eller fokus er inne i gruppen
   (`focusin`/`focusout` med `relatedTarget`), og går videre når musen/fokus går ut. Gjelder både enkeltsimuleringene og «Tre enheter» (felles merker).
2. **Symboltest.** `scripts/symboler.test.mjs`, lagt i `npm test` etter `simuleringer.test.mjs`: leser id-ene `sb-*` fra `Enhet.astro`; test 1 (kilden)
   feiler hvis en side under `src/pages` eller `src/sider` har mer enn én `<Enhet>` uten `symboler=`; test 2 (bygget) leser alle `.html` i
   `sites/hengsel/dist` og feiler hvis en sb-id er definert mer enn én gang, eller brukes (`href="#sb-…"`) uten å være definert. Mangler `dist`,
   sier den «kjør npm run build først» (som de andre testene).
3. **Forsiden.** iPhone-rammen i toppen av `index.astro` har `symboler={false}`; Studio Display-rammen (den første) definerer symbolene.
   Simuleringene (`Simulering.astro`) hadde allerede `symboler={false}`, så dobbeltdefinisjonen kom fra de to rammene i toppen (N-3c). Andre sider
   har bare én ramme uten `symboler=`; testen er grønn på alle.
4. **Regel 11** i `docs/design/hengsel-regler.md`: én setning om pause-knappen og symbolene. Dokumentasjon i `Simulering.astro` og `index.astro`.

Ikke rørt: `skjermbilder.mjs`, `bildedomene.mjs`, `KJENTE_MANGLER`, workflows, `Enhet.astro`, andre sider enn `sites/hengsel/`.

## Valg (ingen kunne spørres)
- Knappen ligger i `Stegmerker.astro` (ikke i `Simulering.astro`): da får «Tre enheter», som har ett felles sett merker og `merker={false}` på
  hver enkelt ramme, også én pause-knapp. Serier med bare ett bilde (stillrammer) har verken merker eller knapp.
- Etiketten er fast («Pause serien») og tilstanden ligger i `aria-pressed` (ARIA-mønsteret for toggle-knapp); ikonet bytter.
- Et trykk på et stegmerke med mus eller tastatur holder serien så lenge fokus står inne i gruppen (det er det N-teksten ber om); serien går
  videre når fokus går ut. Berøring på rammen holder ikke serien (telefon).
- Pause-knappen holdes også når `pauset` er satt og fokus går ut: den manuelle pausen varer til knappen trykkes igjen.

## Kontroll
- **npm-registeret var sperret fra økta** (DNS/proxy: `registry.npmjs.org` og speil nås ikke), så Astro kunne ikke installeres, og `npm run build`
  og `npm test` kunne ikke kjøres lokalt. I stedet:
  - `tsc --strict` på `simulering.ts`: ingen feil.
  - Playwright (Chromium, /opt) mot en fixture med den bygde markupen og det kompilerte skriptet: 24 sjekker grønne – knappen vises med skript,
    serien går, pause/aria-pressed, ikonbytte, start igjen, mus over rammen holder og slipper, fokus holder og slipper, Enter og Space, merketrykk,
    berøring på 390 (ramme holder ikke, tapp pauser/starter, knappen 32 × 32), reduced-motion (første bilde står, ingen knapp), uten skript (ingen knapp).
  - Kildetestene som ikke trenger `dist`: `symboler` test 1 grønn (og rød på forsiden fra `origin/main`), `simuleringer` 1/2/4, `enhetsrammer` 1,
    `node scripts/hengsel-regler.mjs sites/hengsel/src` («ingen fargeverdier utenfor den delte fila»). `symboler` test 2 rød på en syntetisk
    `dist` med dobbel definisjon og manglende definisjon, grønn når hver side definerer én gang.
- **GitHub Actions «Bibliotek-sjekk»** (kjøring 39081107495 på PR #92, commit 4df73c0): `npm ci`, `npm run build`, `npm test` grønne –
  222 tester, 221 grønne, 0 røde, 1 hoppet over (eksisterende); symboltesten er nr. 212–213; lenkesjekken 1178 forespørsler, 0 feil; skjermbildene
  av forsiden (390 og 1280) med 15 bilder fra biblioteket og 0 plassholdere.
- **Skjermbilder:** `claude/n6b-skjermbilder/` har stegmerkene med pause-knappen (1440 og 390, fixture, se LES-MEG.md der). Skjermbilder av hele
  forsiden i 1440/390 kunne ikke tas i økta (ingen build); workflowen tok 390 og 1280 med ekte bilder (artefaktet `bibliotek-sjekk-46`), men
  artefaktlageret nås ikke herfra. Utseendet på den ekte siden må ses av Eirik (forhåndsversjonen fra Workers Builds, eller artefaktet).

N-6b KLAR
