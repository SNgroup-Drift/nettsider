# K-231 · Merkepakke v2 inn på nettsidene (sak S-61)

Gren `claude/k231-merke-v2` (fra main b68f979, etter K-223). Pakke: `design/handoff/hengsel_merke_v2/` (LES-MEG.md). PR mot main; Eirik fletter selv.

## Gjort
1. **Pinnet import, ikke kopiert for hånd.** `scripts/hent-merkepakke.mjs` (liste i `scripts/lib/merkepakke.mjs`) legger pakken i `packages/hengsel-tokens/ds/assets/` og kopierer de filene sidene bruker byte for byte. Alt får sha256 i `designsystem.pin.json` (blokken `merkepakke`, med kilde og sha256 per utplassert fil; alle ds-filer i `filer`). Kjøres automatisk etter `hent-palettpakke.mjs`, som tømmer mappene den legger oppå. Idempotent (kjørt to ganger, ingen diff).
2. **Motion** på hengsel.no (`UteMotion.astro`, `public/media`): 1080×1080 og 1080×1920, MP4, WebM og plakat (PNG). Komponenten har `format="staende"` for 1080×1920. Begge flatene som viser motion i dag (Bli tester på /ute og ikonet på /apptest) er kvadratiske miniatyrer, så de bruker 1080×1080; 1080×1920-filene er med og komponenten støtter dem, men ingen flate er stående ennå.
3. **Delingsbilder:** `og-hengsel-no` (alle hengsel.no-sider), `og-apptest` (/apptest), `og-vis-hengsel-no` (alle 30 vis-sider), `og-kunde` ligger i `sites/hengsel/public/` klar til K-229 (siden /kunde finnes ikke i repoet). De rendrede og.png for hengsel og vis er slettet. design.hengsel.no beholder sitt rendrede «Designfasit»-bilde (pakken har ikke noe for design). Lagt til `og:image:width/height` og `twitter:card` på vis.
4. **Favicon med hvit flis** (`favicon.ico`, `favicon-flis.svg`, 16/32/48) på hengsel, vis, design og admin via `Hode.astro` og designsidens layout. Gamle `favicon-32.png` er slettet. 180/192/512 (palettpakken, hvit flate) er uendret.
5. **«Levert av Hengsel» (lys)** i kundeportal-mocken og alle seks vis-rom med «levert av»-bunn. Byttet fra K-212 runde 2 («Hengsel Levering») er tilbakestilt, inkl. teksten i `kundeportal.ts`.
6. **/sigdal:** «Sigdal CRM · levert av Hengsel» (Warm Black) i toppen og i Visningsrommet i Sigdal-utgave, i stedet for Sigdal-logoen med tekst under. `KundeLogo` har `flate="mork"` som velger Off White; PNG-ene for den finnes. Ingen flate på /sigdal er mørk i dag, så Off White vises foreløpig bare på /merke.
7. **design.hengsel.no:** /merke har nye seksjoner (Levert av og Sendt med, favicon, de fire nye ikonene, butikkmaler, motion, Sigdal som kundemerke på lys og mørk flate). /komponenter viser 53 ikoner. /last-ned har logopakken (+ levert av, sendt med, favicon), ikonpakken (53), nye `hengsel-butikkmaler.zip` og `hengsel-appikoner.zip`, og lenker til motion og delingsbilder.
8. **`brand/hengsel-merke/` er slettet.** Ingen side brukte den lenger (alt som brukes er utplassert fra pakken), og pakken ligger som kilde i `design/handoff/` og som pinnet i ds. Regelskriptet godtar nå byte-like kopier av SVG fra ds og pakken i stedet for brand/. Gamle rapporter i `claude/` og leveransearkivet `docs/design/hengsel/` er urørt.
9. **Tester:** `gamle-farger.test.mjs` utvidet (sha256-liste over 98 gamle merkefiler i `scripts/gamle-merkefiler.json`, gamle navn i kode, blå Deep Blue i SVG, brand/ borte, gammel favicon/og/motion borte). Ny `merkepakke.test.mjs`: pin og byte-likhet, **og:image-validering** (alle sider: absolutt URL, riktig bilde per side, PNG 1200×630, under 1 MB, twitter:card), favicon (ico har 16/32/48), motion, «levert av», Sigdal.

## Avvik og funn
- **Sigdal-SVG-ene i pakken er defekte:** `<image>` mangler `href`, så selve Sigdal-logoen er ikke lagt inn, og de gjengir bare «CRM · levert av Hengsel». PNG-ene er riktige og brukes (1×, 2×, 3×); SVG-ene er ikke tatt i bruk. Design bør levere ny SVG.
- Ikonsprite og IKONER.md dekker fortsatt bare de 49; de fire nye ligger som egne filer og i `ikoner-tillegg.json`.
- Navnet «Sigdal» står nå på design.hengsel.no/merke (som du ba om); testen tillater det bare der.
- Besvares av Eirik fra pakkens «Venter på»-liste: ikonlista K-220/K-222, eget Visning-merke, tekstene i delings- og butikkbildene, CRM-ikonfarge, Android-ramme.

## Sjekk
`npm run build` grønn. `npm test` grønn (129 tester, 0 feil) med lenkesjekk. Skjermbilder 390 og 1280 px i `claude/k231-skjermbilder/` (`node scripts/skjermbilder-k231.mjs`): /ute og /apptest med motion i avspilling (WebM, 1080×1080), /sigdal og to Sigdal-undersider (toppen), kundeportal, design /merke og /last-ned; ingen konsollfeil og ingen horisontal rulling på 390 px.
Workers Builds på PR-en: se PR (design-forhåndsvisningen feiler kjent, jf. K-212 runde 2).
