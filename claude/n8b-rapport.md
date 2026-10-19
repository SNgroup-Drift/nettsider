# N-8b · Telefonbildene (19.10.2026)

**Resultat: ingen av de 12 telefonnøklene finnes i biblioteket ennå.** Ingen nøkler ble fjernet fra `KJENTE_MANGLER`; alle står igjen med ny kommentar. Manifestkopien er uendret.

## 1. Manifestet
- `npm run bibliotek:sjekk` (og byggene) når ikke `bilder.hengsel.no` fra sandkassen (proxy 403 / «fetch failed»). Kopien kunne derfor ikke oppdateres.
- Filer i manifestkopien før: **458** (versjon 1, laget 2026-10-17T19:31:37Z). Etter: **458** (uendret).
- Kjøringen 39206192030 (hengsel-crm, jobben «Ta og last opp», lest via GitHub Actions-loggen, ikke `gh api`): manifest.json på R2 har etter opplastingen 458 filer (192 tatt nå + 266 beholdt fra forrige manifest; 100 nye/endrede filer lastet opp).
- Alle 12 nøkler står i seksjonen «266 · står i liste.json, men ble ikke tatt i denne kjøringen» (48 filer: 12 nøkler × Hengsel/Sigdal × `@1x`). De ble altså ikke tatt og ikke lastet opp:

| Nøkkel (tema hengsel) | Finnes? |
|---|---|
| telefon/crm-min-dag, crm-kunder, crm-ordre, crm-saker, crm-mer | nei |
| telefon/portal-tilbud, portal-levering | nei |
| vis/skjermbilder/crm-tilbud-telefon, crm-tilbud-kunde-telefon, crm-ordre-kontrollmal-telefon, crm-montasje-telefon, crm-etterkalkyle-telefon | nei |

- Årsak fra loggen: i alle tlf-kjøringene gikk innloggingen ikke mot demo.studiosigdal-innlandet.no («innloggingen som skjermbilde.selger / montasjeleder / leder / superadmin gikk ikke (finnes brukeren …?)», også portalbrukeren), for både Hengsel- og Sigdal-tema. Kjøringen ble grønn likevel fordi feilene teller som advarsler. Brukerne `skjermbilde.*` må finnes i demo-databasen før K-228b kan ta 390 px-bildene.

## 2. KJENTE_MANGLER
- Fjernet: ingen.
- Gjenværende (alle 12): se tabellen over; kommentaren i `scripts/lib/bildedomene.mjs` er byttet til «N-8b 19.10: mangler fortsatt – …».

## 3. Sidene
- hengsel.no og vis.hengsel.no bygger (vis: 62 bilder lenket, 13 egne lokale, 13 plassholdere). Siden ingen nøkkel finnes, viser /telefon, «På telefon»-seksjonene og Telefon-knappen «Skjermbilde kommer». Ingen nøkkelnavn endret; `docs/bilder.md` er urørt. Visuell sjekk på 390 px er ikke gjort (ingen bilder å vise).

## 4. Test
- `npm ci`, `npm run build` og `npm test`: 251 pass, 0 fail (lenkesjekk grønn). Bildevakta er grønn.
- HawkScan er hoppet over. Ingen subagenter. Ingen nøkler i repo eller rapport.

## Neste steg
Opprett/fiks brukerne `skjermbilde.*` i demoen (hengsel-crm), kjør Skjermbilder-workflowen på nytt, og kjør så N-8b på nytt (`npm run bibliotek:sjekk -- --skriv` fra et nett som når biblioteket).

N-8b KLAR
