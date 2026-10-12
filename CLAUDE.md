# Retningslinjer for dette repoet

- **Hengsel-sidene** (hengsel.no, vis.hengsel.no, design.hengsel.no, admin.hengsel.no, demo.hengsel.no og nye Hengsel-sider) følger [docs/design/hengsel-regler.md](docs/design/hengsel-regler.md): farger og skrift bare som variabler fra `packages/hengsel-tokens/tokens.css` (generert fra den pinnede `hengsel.tokens.json`), aldri hex/rgb/hsl i sidene, og bare lys modus. `npm test` gir rødt bygg ved brudd.
- Farger endres bare i designsystemet (innlandet-crm-sync), og deretter pinnes ny commit med `npm run design:hent`.
- sngroup.no og byggem.no har SN Groups palett i `packages/design` og er ikke omfattet.
- Se README.md for oppsett, kommandoer og hosting (docs/hosting.md).
