# 60-211 Hengsel Admin, fase B, C og Drift: spesifikasjon (S-62)

15.10.2026. admin.hengsel.no. Bare lys modus. PC først (1440), telefon (390) for SB1, SB2 og SO2. Profil: furu v2 med PC-laget, som i fase A. Alle navn og beløp er eksempeldata. «Nå» i tegningene er 14.10.2026 kl. 10:20, som i fase A.

Filer:
- `60-207_admin_pc_fase_bc.dc.html`: SB1–SB3, SO1–SO2, SC1–SC4, ST1, SD1–SD2, Innstillinger, ingen tilgang. Tweaks: `rolle` (eirik / support), `startside`, `tilstand` (normal / tom / laster / feil). Adressen tar også `#side`, f.eks. `#kjoring`.
- `60-201_admin_pc.dc.html`: full meny uten «Kommer», ny Oversikt (SA1).
- `60-208_admin_telefon_fase_b.dc.html`: SB1, SB2, SO2 på telefon.
- `60-209_hjelp_fra_kunden.dc.html`: SB4 i Hengsel CRM og Hengsel Ute.
- `60-210_admin_komponenter_fase_bc.dc.html`: nye komponenter med tokens.
- Data: `assets/admin-data-bc.js` (`AdminBC`), i tillegg til `assets/admin-data.js` fra fase A. Prisene i Abonnement regnes med `AdminData.beregn`.

## Grunnregler

- Admin har egen database. Fra kundemiljøene leses bare tall: brukere, siste innlogging, versjon og feil. Ordre og sluttkunder kopieres aldri inn.
- Passord og nøkler vises aldri. Kontoer lenker til 1Password.
- Drift er bare til å lese. Utrulling og fletting skjer ikke fra Admin.
- Ikke besluttet, vist med merket «Eksempel»: timepris for support (1 150 kr), svarfrister per prioritet (1 t, 4 t, 1 virkedag, 3 virkedager), varsel før KPI-justering (30 dager) og leverandør (ES-Holding AS).

## Meny

Oversikt · **Salg**: Tavle, Eiere og butikker, Prisberegner · Kunder · Avtaler · **Support**: Saker, Timer · Oppstart · **Fakturering**: Abonnement, Fakturakjøring, KPI, Utestående · Tall · **Drift**: Status, Lenker, Kontoer, Frister, Rutiner · Innstillinger.

Tall i menyen: åpne saker, oppstarter i gang, «1 feil» på Fakturakjøring (rød tekst), frister innen 14 dager.

**Rolle Support** ser bare: Kunder · Support (Saker, Timer). Timer vises uten beløp. Åpner rollen en annen side (lenke eller adresse), vises «Du har ikke tilgang til Fakturering» med feilkode ADM-403, «Til saker» og «Spør Eirik om tilgang».

## Datamodell, nytt

| Objekt | Felt |
|---|---|
| Sak | nr. (H-nnnn), emne, eier, butikk, kontakt, kilde (hjelp-crm, hjelp-ute, e-post), prioritet (kritisk, høy, normal, lav), status (ny, åpen, venter på kunde, løst), opprettet, svarfrist (beregnet fra supportnivå), frist stoppet (når status = venter), løst tid, hjelp-data (side, adresse, appversjon, nettleser/enhet, innlogget bruker, skjermbilde) |
| Melding | sak, type (kunde, svar, internt notat), hvem, tid, kanal, tekst, vedlegg. Internt notat sendes aldri til kunden |
| Tidsføring | sak, eier, dato, fra, til, minutter, hvem, tekst, måte (tidtaker, manuell), fakturert i (fakturakjøring) |
| Oppstart | eier, avtale, oppstartsdato, status (beregnet), punkter |
| Oppstartspunkt | oppstart, nr., punkt (fast liste på 9), ansvarlig (Eirik, Code, kunden), dato eller frist, status (ikke startet, i gang, venter på kunden, stopper, ferdig), detalj; opplæring har økter (navn, dato og tid, sted, deltakere) |
| Abonnement | eier, avtale, prisliste, gjelder fra, binding til, neste KPI-dato, neste faktura; linjer per butikk (pakke, brukere, ekstra brukere, montører), tillegg; kjederabatt regnes ut, lagres ikke |
| Abonnementsendring | abonnement, gjelder fra, type (pakke, ekstra brukere, montører, butikk lagt til, butikk fjernet, tillegg, start), tekst, hvem, opprettet |
| Fakturakjøring | måned, fakturadato, status (utkast, delvis sendt, sendt), fakturaer |
| Faktura (i kjøringen) | kjøring, eier, status (klar, sendt, feil), feilmelding, PowerOffice-id, endringer siden forrige måned, sum uten og med mva |
| Fakturalinje | faktura, type (abonnement, etablering, timer, viderefakturert), tekst, antall, pris, kostpris (viderefakturert), påslag 15 %, rabatt (bare abonnement), beløp |
| KPI-justering | år, prosent (for hånd), kilde, varsel dager før; per kunde: KPI-dato, pris i dag, ny pris, varseldato, e-postutkast, varslet (dato) |
| Utestående (lest) | fakturanr., eier, beløp med mva, fakturadato, forfall, dager over, purrestatus, hentet tid. Lagres ikke, leses fra PowerOffice |
| Kundemiljø (lest) | adresse, versjon, siste utrulling, feil siste 24 t, siste innlogging, brukere, sikkerhetskopi (på/av, type) |
| Konto | tjeneste, eier, plan, kost per måned, fornyelse, 1Password-hvelv (lenke, aldri hemmelighet), merknad |
| Frist | tekst, kategori, dato, varsel (dager før) |
| Rutine | gruppe (måned, uke, kvartal), punkter med avkryssing per periode |
| Innstilling | leverandør, supportnivå (svarfrist per prioritet, arbeidstid), timepris, føres i (15 min), svarmaler, varsler |
| Bruker og rolle | navn, e-post, rolle (eier, support), sist innlogget |

## SA1 Oversikt (oppdatert)

- Nytt: tre kort under tallene: «Åpne saker og frister» (fire nærmeste, forfalt først), «Oppstarter i gang» (fremdrift og hva som stopper) og «Neste fakturakjøring» (dato, antall, sum uten mva, klar og sendt, feil i rød tekst).
- Klikk åpner Saker, Oppstart og Fakturakjøring.

## SB1 Saker

- **Felt:** prioritet (merke med fire stolper), emne, nr., kontakt, kunde, butikk, kilde, status, svarfrist, sist aktivitet.
- **Filter:** status (Alle åpne · Ny · Åpen · Venter på kunde · Løst), prioritet, kilde («Hjelp» i CRM, «Hjelp» i Ute, e-post) og kunde. Antall per valg.
- **Sortering:** forfalt først, så snart, så resten.
- **Svarfrist:** «42 min igjen». Snart (25 % eller mindre igjen): gul flate. Forfalt: rød tekst, ikon og ring, hvit flate. Venter på kunde: «Pause», klokka står.
- **Handlinger:** klikk åpner saken. «Ny sak» i toppfeltet (for e-post eller telefon).
- **Tilstander:** tom (forklaring om hvor saker kommer fra), laster (grå rader), feil (banner: innboksen svarte ikke, listen står), ingen treff.
- **Telefon:** kort per sak med prioritet, status, emne, kunde og frist. Filterbrikker øverst.

## SB2 Sak

- **Topp:** nr., prioritet, kilde, opprettet, emne, svarfrist med fristen for prioriteten. Status som segment (Ny · Åpen · Venter på kunde · Løst).
- **Tråd:** kundens meldinger (hvite), svar (furu) og interne notater (gule, merket «kunden ser ikke dette»).
- **Skriv:** fane «Svar til kunden» / «Internt notat». Svarmaler fyller inn fornavn, svarfrist og lenke. «Lenke til brukerveiledningen». «Send svar» er av til teksten er fylt ut. Svar går på e-post og til «Mine saker».
- **Kontakt og kunde:** navn, rolle, telefon, e-post, butikk, kunde, pakker, «Åpne kunden».
- **Sendt med «Hjelp»:** side i appen, adresse, versjon, nettleser eller enhet, innlogget som, skjermbilde (hvis lagt ved). E-post: forklaring om at dette mangler.
- **Tidsføring:** tidtaker med Start / «Stopp og før», manuell føring (minutter og tekst), liste over føringer, sum for saken. Under: kundens inkluderte timer denne måneden med stolpe og hva som er igjen eller over.
- **Tilstander:** tom (ingen meldinger, opprettet av Eirik), laster (grå blokker), feil (svaret kunne ikke sendes, lagret som utkast).
- **Telefon:** tråd, «Sendt med Hjelp» som kort, tidtaker i toppen, svarmaler som brikker og svarfelt nederst.

## SB3 Timer

- Per kunde og måned: pakker per butikk, inkludert (1/2/3 per butikk etter pakke), brukt, antall saker, stolpe med merke for inkludert, status (Under · På grensen ≥ 90 % · Over inkludert).
- Over: «1,5 t × 1 150 kr = 1 725 kr blir en fakturalinje i november», med lenke til fakturakjøringen. Support-rollen ser ikke beløp.
- Eksempel: Granlund under (4,5 av 11), Strand på grensen (3,75 av 4), Aune over (4,5 av 3). Vestby under.
- År 2 er ikke avklart. Aune og Vestby er tegnet som år 1 og merket.

## SB4 «Hjelp» sett fra kunden

- **CRM (PC):** «Hjelp» nederst i menyen åpner en dialog nede til høyre: emne, «Hva skjedde?», skjermbilde (valgfritt), prioritet med forklaring og svarfrist. Teksten «Vi sender med: side, versjon, nettleser» står over «Send».
- **Ute (telefon):** samme felt i et ark nedenfra. Skjermbilde fra kamera eller galleri. Trykkflater 44–52 px.
- **Kvittering:** «Saken er sendt», saksnummer, svarfrist og hvor svaret kommer.
- **Mine saker:** egne saker med status. Kunden ser Ny, Under arbeid (= Åpen), Venter på deg (= Venter på kunde) og Løst.

## SO2 Oppstarter i gang

- Én rad per kunde: kunde, avtale, oppstartsdato, fremdrift (x av 9), neste punkt med ansvarlig, og «Stopper: …» i rød tekst. Fullført under.
- «Ny oppstart». Klikk åpner SO1.
- **Telefon:** kort per kunde med samme innhold.

## SO1 Oppstart per kunde

- **Topp:** oppstartsdato stort, dager igjen, kunde, avtale, fremdrift.
- **Stopper:** banner med 2 px rød ring, hva som stopper, hva det hindrer, hva som venter på kunden, «Send påminnelse».
- **Sjekkliste:** ni punkter med status, ansvarlig (Eirik, Code, kunden), dato eller frist og detalj. Opplæring 1 og 2 viser dato, sted og deltakere. Klikk på status bytter.
- **Tilstander:** tom («Lag sjekkliste fra mal»), laster, feil (endring ikke lagret).

## SC1 Abonnement

- Velg kunde. Fakta: gjelder fra, binding til, neste KPI-dato, neste faktura, avtale, prisliste.
- Linjer per butikk: pakke, brukere, ekstra brukere, montører, pakkepris, sum. Så Hengsel Ute, kjederabatten som én linje (fra fase A), tillegg uten rabatt, per måned uten mva, mva og med mva. Under 3 butikker: hvor mange som mangler til 15 %.
- **Endringer:** «Ny endring» med type, gjelder fra og tekst. Historikk med dato, nyeste først.
- **Tilstander:** tom (lages fra signert avtale), laster, feil (prislisten kunne ikke hentes, gamle beløp vises).

## SC2 Fakturakjøring

- Per måned, faktureres forskuddsvis den 1.
- Ett kort per faktura: kunde, status (Klar · Sendt · Feil), feilmelding, «Endret:» mot forrige måned, abonnementslinjen, engangslinjer (etablering, timer ut over inkludert, viderefakturert SMS/Penneo/AI som kostpris + 15 %, uten rabatt), sum uten mva, mva og med mva.
- Sidepanel: antall, sum uten mva, mva 25 % og sum med mva; engangslinjer summert per type.
- «Send N til PowerOffice» sender de som er Klar. Koblingen er ikke avklart, bare knappen og statusene er tegnet.
- **Tilstander:** tom, laster, feil (PowerOffice svarte ikke, ingenting sendt).

## SC3 KPI-justering

- Prosent legges inn for hånd. Varsel dager før (Eksempel: 30).
- Tabell: kunde, KPI-dato, varseldato, pris i dag, ny pris (hele kroner), endring, status (Utkast klart / Senere).
- Utkast til e-post for neste kunde. «Kopier e-posten» og «Merk som varslet». Ingenting sendes automatisk.

## SC4 Utestående

- Lest fra PowerOffice, med tidspunkt. Faktura, kunde, fakturadato, forfall, beløp med mva, dager over forfall (rød tekst), purrestatus. Sum og forfalt. Bare til å lese.

## ST1 Tall

- Fire tall: inntekt i oktober, hittil i år, kunder, butikker.
- Inntekt per måned (12 stolper, verdi over hver), inntekt per år (2025, 2026 hittil, prognose).
- Kunder og butikker over tid (to stolper per måned).
- Supporttimer mot inkludert per kunde.
- Driftskost og bidrag per kunde: inntekt, database, supporttimer × intern kost (650 kr, eksempel), kost, bidrag og andel.
- Salgstrakt med antall og overgang, og årsaker til tapt. Avtaler som fornyes de neste 90 dagene.
- **Tilstander:** tom, laster, feil (noen kundemiljøer svarte ikke).

## SD1 Status

Én rad per kundemiljø: adresse, versjon (merket «Eldre»), siste utrulling, feil siste 24 t (5 eller flere: gul tekst), siste innlogging, brukere, sikkerhetskopi (På/Av med type). Bare til å lese.

## SD2 Lenker, Kontoer, Frister, Rutiner

- **Lenker:** kort med navn, hva den er, adresse.
- **Kontoer:** tjeneste, eier, plan, kost per måned, fornyelse (snart: rød tekst), «1Password · hvelv». Sum fast kost.
- **Frister:** frist, kategori, dato, varsel, dager igjen (7 eller færre: gul). «Ny frist».
- **Rutiner:** grupper (måned, uke, kvartal) med avkryssing og telling.

## Innstillinger

Undermeny: Leverandør (Eksempel) · Prisliste (åpner SA9) · Avtalemaler (versjon, gjelder fra, brukt i, status) · Supportnivå (svarfrist per prioritet, Eksempel; inkluderte timer fra prislisten) · Timepris for support (Eksempel, føres i 15 min) · Svarmaler · Brukere og roller (Eirik og supportrolle, tilgangstabell) · Varsler (brytere for frister, fornyelser, KPI, svarfrist og fakturakjøring).

## Tilstander, oppsummert

| Skjerm | Tom | Laster | Feil |
|---|---|---|---|
| SB1 Saker | Forklaring om kildene | Grå rader | Banner, listen står |
| SB2 Sak | Ingen meldinger ennå | Grå blokker | Svaret ikke sendt, lagret som utkast |
| SO1 Oppstart | «Lag sjekkliste fra mal» | Grå rader | Endring ikke lagret |
| SC1 Abonnement | Lages fra signert avtale | Grå blokker | Prisliste ikke hentet, gamle beløp |
| SC2 Fakturakjøring | Ingen fakturaer ennå | Grå kort | PowerOffice svarte ikke |
| ST1 Tall | Ingen tall ennå | Grå blokker | Noen miljøer svarte ikke |
| Support-rollen | – | – | «Ingen tilgang», ADM-403 |
