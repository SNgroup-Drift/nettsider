# Opprett kunde i admin.hengsel.no (K-272, S-65)

Oppstart › **Opprett kunde** setter opp en ny kunde teknisk med ett klikk. Veiviseren (`/oppstart/opprett-kunde`) samler kunde-id (slug), navn,
kjede, org.nr., butikker, merker, tema, domene og første administrator (e-post), og viser en oppsummering som må bekreftes. «Start» starter GitHub Action
**Ny kunde** i `SNgroup-Drift/hengsel-crm` (`.github/workflows/ny-kunde.yml`, `scripts/ny-kunde/`). Action-en rapporterer hvert steg hit, og
fremdriftssiden (`/oppstart/ny-kunde/<id>`) viser grønt/rødt, logg, «Prøv igjen herfra», «Fjern testkunde» (bare kunder merket test) og til slutt
sjekklisten for kunden (DNS-post, e-postkobling (K-273), første innlogging).

## Deler

| Del | Fil |
|---|---|
| Veiviser og fremdrift | `sites/admin/src/pages/oppstart/opprett-kunde.astro`, `.../ny-kunde/jobb.astro`, `src/scripts/opprett-kunde.ts`, `src/scripts/ny-kunde-jobb.ts`, `src/styles/ny-kunde.css` |
| Kontroll av oppsettet, steg, sjekkliste (felles for Worker og nettleser) | `sites/admin/src/lib/ny-kunde.js` (samme regler som `scripts/ny-kunde/lib/kunde.mjs` i hengsel-crm) |
| API (start, prøv igjen, fjern, les) | `sites/admin/worker/api-ny-kunde.js` |
| Rapporter fra Action-en (utenfor Access, signert) | `sites/admin/worker/ny-kunde-rapport.js` → `POST /api/oppstart/rapport` |
| D1 | `sites/admin/migrations/0004_ny_kunde.sql`: `ny_kunde_jobb`, `ny_kunde_steg`, `ny_kunde_logg` (ingen hemmeligheter) |
| Tester og skjermbilder | `scripts/admin-k272.test.mjs`, `scripts/skjermbilder-k272.mjs` → `claude/k272-skjermbilder/` |

## Sikkerhet

- **Bare es@sngroup.no kan starte, prøve igjen og fjerne** (Cloudflare Access + rollen eier + `STARTERE` i `api-ny-kunde.js`). Alle andre får ADM-403.
- Hvert steg, hver start og hvert «prøv igjen» logges med hvem og når (`ny_kunde_logg`). Rapporter fra Action-en står som «Action #<kjøring>».
- Hemmeligheter ligger **bare** som Worker-hemmeligheter og i GitHub-miljøet «ny-kunde»: `GITHUB_DISPATCH_TOKEN` (Actions: Read and write, bare hengsel-crm,
  utløp ≤ 90 dager) og `NY_KUNDE_RAPPORTNOKKEL`. Ingenting av det står i D1, loggen eller svarene; loggen renses i Action-en og en gang til i Workeren.
- `/api/oppstart/rapport` er den eneste stien utenfor Access (Bypass-policy kreves for akkurat denne stien). Den krever HMAC-SHA256 over `<tid>.<kropp>`, tidsvindu på 5 minutter, maks 64 KB, kjent jobb og kjent steg.
