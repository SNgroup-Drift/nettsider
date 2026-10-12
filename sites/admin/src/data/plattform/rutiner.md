### Flett til demo

Aldri `git push` til demo. Fletting går alltid gjennom skriptet, som bestiller Action-en «Flett til demo». Den fletter, kjører tsc, vite build, npm test og vitest, og pusher demo. Én fletting om gangen.

1. Grenen må være pushet.
2. Kjør den nyeste utgaven av skriptet: `git fetch origin demo && bash <(git show origin/demo:scripts/demo/flett-til-demo.sh) <gren>`
3. Skriptet venter på svaret (opptil 45 min): ✅ grenen er i demo, ⛔ noe feilet og demo er urørt.
4. Konflikt med demo: lag en gren fra demo, flett grenen din inn der, løs konflikten, og flett den nye grenen.
5. Push til demo starter Demo-utrulling (edge-funksjoner og migreringer).

Kilde: [CLAUDE.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/CLAUDE.md) og [scripts/demo/flett-til-demo.sh](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/scripts/demo/flett-til-demo.sh) i innlandet-crm-sync.

### Prod-utrulling

Rekkefølge: migreringer først, så edge-funksjoner, så nettappen. Eirik gir «ja» for hver del.

1. Før start: bekreft at Point in Time Recovery er på (Supabase › Database › Backups), og noter tidspunkt (UTC).
2. Nettappen: GitHub › Actions › **Prod-utrulling** › Run workflow, grenen `main`. Den manuelle kjøringen er godkjenningen. Workflowen rører aldri Supabase.
3. Edge-funksjoner: `supabase functions deploy <navn> --project-ref jzqglcldsqkxvwsaovth --use-api`.
4. Røyktest mot crm.studiosigdal-innlandet.no etterpå. Er `vakt` eller `bygg` rød, bruk ikke `--force`.

Kilde: [claude/prod-plan.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/claude/prod-plan.md) og [prod-deploy.yml](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/.github/workflows/prod-deploy.yml).

### Migreringer

Aldri `supabase db push` mot prod uten videre: prod har migreringer registrert under andre versjonsnumre.

1. Kjør filene i stigende filnavn-rekkefølge, én fil per `begin … commit`, i bunter i SQL-editoren.
2. Registrer hver fil i `supabase_migrations.schema_migrations` under filnummeret (`on conflict do nothing`).
3. Filer med DROP eller DELETE trenger Eiriks «ja» hver for seg. I demo gjelder lista `drop-godkjent.txt`.
4. Etter hver bunt: kontroller `list_migrations` og security-advisors (ingen ERROR). Gi Eirik status før neste bunt.

Kilde: [docs/migreringer-rekkefolge.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/docs/migreringer-rekkefolge.md) og [claude/prod-plan.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/claude/prod-plan.md).

### Glemt passord

1. Brukeren trykker «Glemt passord» på innloggingssiden (de fleste logger inn med Microsoft og trenger ikke passord).
2. E-posten sendes av Supabase Auth-hooken `auth-epost` fra kundeportal@. Lenken lander på `<CRM-adressen>/#/set-password`.
3. Kommer den ikke: kontroller at adressen står under Redirect URLs i Supabase (Authentication › URL Configuration), og at `APP_URL` er riktig i Supabase › Secrets.

Kilde: [docs/flytting-app-hengsel-no.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/docs/flytting-app-hengsel-no.md) og [claude/graph-ny-app-rapport.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/claude/graph-ny-app-rapport.md).

### Ny bruker

1. M365 admin › Brukere › Legg til (`fornavn@studiosigdal-innlandet.no`), lisens og grupper. Gruppen `sigdal-crm-epost@` må være med, ellers kan ikke appen sende fra postboksen (Graph gir 403).
2. CRM › Innstillinger › Brukere og roller › Inviter. Velg rolle og butikk. Brukeren logger inn med Microsoft.
3. Hengsel ved behov (montør, firmaleder, utkjører), kalendersynk og leverandørtilganger (CET, Sigdal, Nobia).
4. Sluttet: deaktiver i CRM med overtakelse, blokker pålogging i M365, fjern leverandørtilganger.

Kilde: [docs/drift/ansatte-sjekkliste.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/docs/drift/ansatte-sjekkliste.md).

### Ny butikk

Fyll inn: ingen ferdig rutine er dokumentert. Butikkene er i dag verdier i databasetypen `public.location` (`hamar`, `lillehammer`, `gjovik`) og en rad i `companies`; nye koder legges til med `butikk_legg_til_kode()`. Ny **kunde** (kjede) krever et eget oppsett som ikke er bygget ennå.

Kilde: [docs/multi-tenant-kartlegging.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/docs/multi-tenant-kartlegging.md) (K-135, bare kartlegging).

### Gjenopprett sikkerhetskopi

Prod har Point in Time Recovery. Demo-databasen prøves hver søndag kl. 04 (pg_dump til en midlertidig Postgres, restore og radtelling).

1. Prod: Supabase › Database › Backups › Point in Time. Velg tidspunkt (UTC) like før feilen. Gjenopprettingspunkt før K-173-utrullingen: 2026-10-12 06:00:41 UTC.
2. Vurder å gjenopprette til et **nytt** prosjekt og hente ut det som mangler, i stedet for å overskrive prod.
3. Kontroller etterpå med `scripts/gjenoppretting/verifiser-restore.sh` (struktur og regler) og tell rader i nøkkeltabellene.
4. Ukentlig prøve: Actions › Gjenoppretting (ukentlig). Rød prøve betyr at demo-sikkerhetskopien ikke lar seg gjenopprette; se oppsummeringen i jobben.

Kilde: [claude/prod-plan.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/claude/prod-plan.md), [gjenoppretting-ukentlig.yml](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/.github/workflows/gjenoppretting-ukentlig.yml) og [docs/migreringer-rekkefolge.md](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/docs/migreringer-rekkefolge.md).

### Noe er nede

1. Oppetid-workflowen sjekker crm., minside., hengsel.no og sngroup.no hvert 30. minutt og åpner en GitHub-issue med etiketten «nede» etter to feil på rad. Se åpne saker i Actions-oversikten for innlandet-crm-sync.
2. Kjør Domenesjekk (Actions › Domenesjekk › Run workflow) for crm. og minside.: sertifikat, hoder og kundeportal-lenker.
3. Cloudflare › Workers & Pages: er siste utrulling rød? Rull tilbake til forrige versjon. Nettsidene er egne Workers (hengsel, sngroup, byggem, admin); CRM-et er Pages-prosjektet `sigdal-crm-prod`.
4. Supabase › Logs og Advisors. Sentry for feil i appen.
5. Gjenopprett fra sikkerhetskopi bare som siste utvei (rutinen over), og bare med Eiriks «ja».

Kilde: [oppetid.yml](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/.github/workflows/oppetid.yml), [domenesjekk.yml](https://github.com/SNgroup-Drift/innlandet-crm-sync/blob/main/.github/workflows/domenesjekk.yml) og [docs/hosting.md](https://github.com/SNgroup-Drift/sngroup-nettsider/blob/main/docs/hosting.md).
