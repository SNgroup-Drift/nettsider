# N-6b: skjermbilder (nattkjøring 18.10.2026)

Astro kunne ikke installeres i økta (npm-registeret var sperret), så forsiden kunne ikke bygges og fotograferes her.
Bildene i denne mappa er tatt i Chromium (Playwright) av **stegmerkene med pause-knappen** på en fixture-side som bruker den samme markupen og
CSS-en som `Stegmerker.astro` og det kompilerte `simulering.ts`, i 1440 og 390 px:

- `fixture-stegmerker-pause-<bredde>.png` – serien går, pause-ikonet vises (`aria-pressed="false"`)
- `fixture-stegmerker-pauset-<bredde>.png` – satt på pause: knappen er fylt med aksentfargen og viser spill av-ikonet (`aria-pressed="true"`)

Skjermbilder av hele forsiden (390 og 1280 px, med ekte bilder fra biblioteket) tar workflowen «Bibliotek-sjekk» på PR-en:
artefaktet `bibliotek-sjekk-46` (kjøring 39081107495), `claude/k233/hengsel-no-forside-{390,1280}.webp`. Artefaktlageret nås ikke fra økta.
