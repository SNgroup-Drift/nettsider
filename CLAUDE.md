# Retningslinjer for dette repoet

- **Hengsel-sidene** (hengsel.no, vis.hengsel.no, design.hengsel.no, admin.hengsel.no, demo.hengsel.no og nye Hengsel-sider) følger [docs/design/hengsel-regler.md](docs/design/hengsel-regler.md): farger og skrift bare som variabler fra `packages/hengsel-tokens/tokens.css` (generert fra den pinnede `hengsel.tokens.json`), aldri hex/rgb/hsl i sidene, og bare lys modus. `npm test` gir rødt bygg ved brudd.
- Farger endres bare i designsystemet (innlandet-crm-sync), og deretter pinnes ny commit med `npm run design:hent`.
- sngroup.no og byggem.no har SN Groups palett i `packages/design` og er ikke omfattet.
- **App-skjermbilder** (CRM, Ute, kundeportal, hjelp) ligger aldri i repoet: de lenkes fra biblioteket på bilder.hengsel.no via `packages/hengsel-tokens/skjermbilder.mjs` (K-233, se docs/bilder.md). Mangler et bilde i manifestet, vises «Skjermbilde kommer»; bare nøklene i `KJENTE_MANGLER` (`scripts/lib/bildedomene.mjs`) er lov. Unntak: nettsidenes egne bilder i `LOKALE_BILDER` (romkortene for rom uten app-skjermbilde, dokumentforsiden) ligger lokalt og kommer aldri i biblioteket.
- Se README.md for oppsett, kommandoer og hosting (docs/hosting.md).
