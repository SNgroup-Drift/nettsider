# N-6 · Flere bilder og simuleringer på hengsel.no (nettsider, nattøkt 18.10.2026)

## Gjort
- `Simulering.astro` (bildeserie i `Enhet`, crossfade ca. 3,5 s, stegmerker som kan trykkes, `scripts` i `src/scripts/simulering.ts`), `Stegmerker.astro`, `TreEnheter.astro` (Studio Display bak, iPad foran til venstre, iPhone foran til høyre, bytter i takt med felles merker) og `kit/Simuleringsflis.astro` (rad + flis).
- `Enhet.astro` utvidet bakoverkompatibelt med `serie` (sporet er en bildeserie: ingen skalering, ingen statuslinje, ingen forskyvning). API ellers urørt.
- Sider: forsiden, /crm, /ute, /kundeportal, /for-butikkleder, /kunder, /priser-og-demo og slik-virker-det (kilden `src/sider/`, vises bare i Sigdal-utgaven siden K-229). `KommerSide` fikk et åpent spor.
- Data i `src/content/simuleringer.ts`. Test: `scripts/simuleringer.test.mjs` (lagt i `npm test`). Regel 11 og nøkkelliste i `docs/bilder.md`.
- Ikke rørt: `skjermbilder.mjs`, `bildedomene.mjs`, `KJENTE_MANGLER`, workflows, andre sider enn `sites/hengsel/`.

## Valg (ingen kunne spørres)
- **Full N-tekst (`claude/saker/S-68-n6-…`) kunne ikke leses** (Projects-verktøyet finnes ikke i denne økta); jeg fulgte teksten i oppdraget.
- **Kundeportal:** d2a, d2b, d10 og d11 er PC-format (2880×1620), kundeportal-k03/k06/k08 og portal-montering/-fdv er telefonformat (780×1688). Jeg byttet derfor enhet: PC (kundeportal-pc, d2a, d2b, d10, d11) og iPhone (k03, k06, k08, portal-montering, portal-fdv). iPad utgikk der (portal-bildene er telefonformat).
- Rammene tegner ingen egen statuslinje over seriene (antatt at bibliotekbildene har egen, som `app/*` fra K-267). Kunne ikke sjekkes: bilder.hengsel.no nås ikke herfra.
- Tre enheter bruker «Min dag → Ordre → Kontrollmål» på alle tre.
- «Uten nett»: stillramme med `app/uten-nett-lys`. /kunder og /priser-og-demo har PC + iPhone som stillramme (de er KOMMER-sider / uten komposisjon).
- slik-virker-det er ikke lenger en side på hengsel.no (K-229); simuleringene er lagt i kilden og vises i Sigdal-utgaven.

## Nøkler
Alle nøkler som er brukt står i `docs/bilder.md` («Nøkler i bruk i simuleringene»). **Manglet i manifestet: ingen** (testen sjekker begge temaer). Ubrukt: hjelp/ finnes ikke i Sigdal, ikke relevant.

## Kontroll
- `npm run build` og `npm test`: 220 tester, 219 grønne, 0 røde (1 hoppet over, eksisterende).
- Playwright mot `astro preview` (1440 og 390): ingen CLS (0), ingen horisontal scroll, ett aktivt steg per serie, merketrykk bytter steg, med `reduced-motion` står første bilde etter 4,5 s.
- Skjermbilder i `claude/n6-skjermbilder/` (forside, crm, ute, kundeportal; 1440 og 390; `-hel` er hele siden). **Bildene i dem er nøytrale plassholdere** (bilder.hengsel.no er ikke tilgjengelig fra økta; de ble byttet ut i nettleseren med grå flater med filnavn, bare i skjermbildene, ikke i repoet).
- Ikke gjort: ekte Lighthouse; CLS ble målt med PerformanceObserver. Utseende med ekte bilder må ses av Eirik.

N-6 KLAR
