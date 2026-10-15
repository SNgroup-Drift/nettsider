# 60-205 Hengsel Admin, fase A: spesifikasjon (S-62)

14.10.2026, runde 2. admin.hengsel.no. Bare lys modus. PC først (1440), telefon (390) for Oversikt, Tavle som liste og Eierkort. Profil: furu v2 med PC-laget (`data-plattform="pc"`). Alle navn og beløp er eksempeldata. Prisene er merket «Eksempel – prislisten er ikke låst».

Filer: `60-201_admin_pc.dc.html` (SA1–SA5, SA7–SA9 og tilstander), `60-202_admin_telefon.dc.html`, `60-203_admin_tilbud_pdf.dc.html` (SA6), `60-204_admin_komponenter.dc.html`. Data og prisberegning: `assets/admin-data.js` (`AdminData.beregn`). Tilstand for Tavle, Eiere, Eierkort og Avtaler velges i Tweaks (`tilstand`: normal, tom, laster, feil).

## Datamodell

| Objekt | Felt |
|---|---|
| Eier | id, navn, org.nr., adresse, fylke, kjede (Sigdal / annen), produktlinje, status, kilde, er kunde, neste steg (tekst, dato), tapsgrunn |
| Butikk | navn, sted, eier, pakke (egen per butikk), brukere, montører, moduler |
| Kontakt | navn, rolle, telefon, e-post, eier |
| Mulighet | eier, produktlinje, antall butikker, verdi per måned (fra prisberegner), fase (= tavlekolonne), åpnet dato |
| Aktivitet | type (samtale, møte, demo, e-post, notat), dato, tittel, tekst, hvem, kontakt, eier, neste steg |
| Tilbud | nr., versjon, dato, gyldig til, prislisteversjon, leverandør (kopi), linjer per butikk, Ute, rabatt (én linje), tillegg, mva, etablering, viderefakturering, status (utkast, sendt, erstattet, akseptert), mulighet |
| Avtale | nr., eier, status, leverandør, dokumenter (mal + malversjon), signatarer i rekkefølge (1 kunden, 2 leverandøren; status, tid), binding, oppsigelsesfrist, start, fornyelsesdato, prisjustering, per måned, signert PDF |
| Prisliste | versjon, gjelder fra, status (utkast, aktiv, arkivert); per produktlinje og pakke: pris, inkluderte brukere, pris for ekstra bruker, inkludert support; etablering per pakke; Ute: montørpris, firmapris og maks montører for firmapris; tillegg (navn, pris, når inkludert); rabattrinn (antall butikker, prosent) og hva rabatten gjelder; viderefakturering i prosent; binding; prisjustering; mva |
| Leverandør | navn, org.nr., adresse, e-post, signatar. Under Innstillinger, ikke fast tekst |
| Kundemiljø | adresse, database, tema, versjon, siste innlogging |
| Lead | tid, kanal, melding, butikker, ansatte. Blir eier med status Ny |

## Meny

Oversikt · **Salg**: Tavle, Eiere og butikker, Prisberegner · Kunder · Avtaler · Support (kommer) · Fakturering (kommer) · **Drift**: Status, Lenker, Kontoer, Frister, Rutiner · **Innstillinger**: Prisliste, Avtalemaler.

«Kommer»-punkter står i menyen med dempet tekst og merket «Kommer». De kan klikkes og åpner en side som forklarer hva som kommer. Drift-sidene finnes i dag og er ikke tegnet på nytt.

## SA1 Oversikt

- **Viser:** fem tall: aktive kunder, butikker hos kunder, inntekt per måned (signerte avtaler, uten mva), åpne muligheter med verdi per måned, og avtaler som fornyes innen 90 dager. Neste steg (forfalte og dagens, eldste først). Nye leads fra «Be om demo». Frister fra Drift.
- **Handlinger:** tallene lenker til tavle, kunder og avtaler. Klikk på et neste steg eller lead åpner eierkortet. «Ny aktivitet» i toppfeltet.
- **Data:** eier, mulighet, aktivitet (neste steg), avtale, lead, frist.
- **Tilstander:** forfalt neste steg har rød tekst og timeglass, uten rødt fyll. «I dag» i aksent-tekst.

## SA2 Salgstavle

- **Kolonner:** Ny · Demo avtalt · Tilbud sendt · Forhandling · Signert · Tapt. Antall og sum per måned i hvert kolonnehode.
- **Kort:** eier, kjede (Sigdal / Uavhengig), antall butikker, verdi per måned, neste steg med dato. Forfalt: rød tekst og ikon, ikke rødt fyll.
- **Handlinger:** dra mellom kolonner (slippmål tones furu). Slipp i Tapt åpner dialog som krever grunn. Klikk åpner eierkortet. Filter på produktlinje. «Ny mulighet».
- **Telefon:** liste gruppert på status, med antall og sum. Status endres fra eierkortet.
- **Tilstander:** tom (tomme kolonner, forklaring, «Importer fra Excel» og «Ny eier»), laster (grå plassholderkort), feil (rødt banner med «Prøv igjen», kortene står).

## SA3 Eiere og butikker

- **Viser:** tabell med eier, org.nr., butikker, kjede, fylke, verdi per måned, status og første kontakt. Samme visning under «Kunder», filtrert på kunder.
- **Handlinger:** søk (navn, sted, org.nr., butikkens sted), filter på status (prospekt, kunde, tapt), kjede og fylke, med antall. «Importer fra Excel», «Ny eier». Klikk på rad åpner eierkortet.
- **Import:** forhåndsvisning før import. Hver rad får resultat: ny, oppdateres (finnes fra før, matches på org.nr.) eller mangler org.nr. Ingenting lagres før «Importer».
- **Tilstander:** tom, laster (plassholderrader), feil (banner), ingen treff.

## SA4 Eierkort

- **Topp:** status, kjede, produktlinje, navn, org.nr., adresse og kilde. «Ny aktivitet» og «Prisberegner» (kunde: «Endre abonnement»).
- **Prospekt:** butikker med foreslått pakke og pris per butikk, kontaktpersoner med rolle, muligheter, tilbud (med versjon og prislisteversjon) og avtaler, tidslinje med filter og neste steg øverst.
- **Kunde:** i tillegg kundemiljø (adresse, versjon, siste innlogging, tema og database) og «Åpne kundesiden». Butikktabellen viser pakke per butikk, moduler, brukere, montører og pakke + brukere per butikk.
- **Lead:** blått banner med melding fra «Be om demo», «Avtal demo» (åpner ny aktivitet) og «Ikke aktuell» (krever grunn, som Tapt).
- **Tilstander:** tom (ny eier, ingen aktiviteter), laster (plassholdere), feil (feilside med «Tilbake» og «Prøv igjen»).

## SA5 Prisberegner

- **Velg:** produktlinje (Sigdal CRM / Hengsel). Butikkene hentes fra eieren og kan legges til, fjernes og gis navn.
- **Per butikk:** egen pakkevelger (Start, Butikk, Komplett), ekstra brukere og montører. Viser inkluderte brukere og support, og pakke + ekstra brukere per måned.
- **Gjelder hele eieren:** Hengsel Ute (billigste av montørpris og firmapris), tillegg (utvidet sikkerhetskopi, eget domene; sikkerhetskopien vises som «Inkludert» ved Komplett eller flere butikker) og en merknad om viderefakturering.
- **Sum:** linje per butikk, Hengsel Ute, og så kjederabatten som én linje under linjene den gjelder. Rabattrinnet regnes ut fra antall butikker hos eieren (15 % fra 3, 25 % fra 10). Deretter tillegg uten rabatt, per måned uten og med mva, per år uten og med mva, snitt per butikk. Etablering per pakke står for seg, uten rabatt, med og uten mva. Viser hvor mange butikker som mangler til neste rabattrinn.
- **Regel:** alle tall kommer fra aktiv prisliste. Ingen priser i koden. Rabatten avrundes til hele kroner.
- **Handling:** «Lag tilbud» lagrer en ny tilbudsversjon på muligheten, med prislisteversjonen, og lager PDF (SA6).

## SA6 Tilbud som PDF

A4, én side. Leverandøren hentes fra Innstillinger › Leverandør (i tegningen: ES-Holding AS, merket som eksempel). Kunde med org.nr., adresse og kontakt. Tilbudsnr. med versjon, dato og gyldig til. Linjer per butikk med pakke, så Hengsel Ute, og kjederabatten som én linje under. Tillegg uten rabatt. Per måned og per år, uten og med mva. Etablering og viderefakturering står for seg, uten rabatt. Vilkår: binding 12 måneder, fornyelse, oppsigelse, KPI-justering, inkludert support, rekkefølge for signering. Bunntekst med versjon, prisliste og hvilken versjon tilbudet erstatter.

Kontroll av eksempelet: 3 × 4 990 + 600 = 15 570. Rabatt 15 % = 2 336 (2 335,50 avrundet). Per måned 13 234 kr, mva 3 308,50, med mva 16 542,50. Per år 158 808, med mva 198 510. Etablering 75 000, med mva 93 750.

## SA7 Avtaler

- **Liste:** nr., eier, status (Utkast · Til signering · Signert · Fornyes snart · Sagt opp), per måned, start, fornyes, binding. Filter på status med antall. «Fornyes snart» = fornyelsesdato innen 90 dager.
- **Avtaleside:** signering i Penneo i fast rekkefølge: 1 kunden (signaturrett hos eieren), 2 Eirik for leverandøren. Status per signatar (Venter / Signert, med tid; «Ikke sendt» for utkast). Avtalen blir «Signert» først når begge har signert. Videre: dokumentene med malversjon (kundeavtale, databehandleravtale, supportnivå), signert PDF (når alle har signert), vilkår: start, binding (12 måneder), oppsigelsesfrist, fornyelsesdato, prisjustering (KPI), prisliste og leverandør.
- **Handlinger:** «Send påminnelse» (til signering), «Forhåndsvis PDF» / «Last ned signert PDF», «Ny avtale fra tilbud».
- **Tilstander:** tom, laster, feil (Penneo svarer ikke: listen vises, status kan være utdatert).

## SA8 Ny aktivitet og lead

- **Dialog:** type (samtale, møte, demo, e-post, notat), eier, kontakt, «Hva skjedde» (påkrevd), notat, neste steg med dato. «Lagre» er av til «Hva skjedde» er fylt ut. Lagret aktivitet havner øverst i tidslinjen.
- **Lead:** kommer inn som eier med status Ny, kilde «Be om demo», markert «Ny» i Oversikt og med banner i eierkortet. Neste steg settes automatisk: «Ta kontakt innen 24 timer».

## SA9 Innstillinger › Prisliste (og Leverandør)

- **Versjoner:** kort per versjon med status (utkast, aktiv, arkivert), gjelder fra og hvor mange tilbud som bruker den.
- **Produktlinjer og pakker:** per linje og pakke: pris per butikk per måned, inkluderte brukere, pris for ekstra bruker, inkludert support (første år) og etablering per butikk.
- **Hengsel Ute:** montørpris (150 kr) og firmapris (990 kr for opptil 8 montører).
- **Tillegg:** utvidet sikkerhetskopi (1 090 kr, inkludert i Komplett og for eiere med flere butikker), eget domene (110 kr).
- **Kjederabatt:** rabattrinn (fra 3 butikker 15 %, fra 10 butikker 25 %) og hva rabatten gjelder og ikke gjelder.
- **Viderefakturering og vilkår:** påslag 15 % på SMS, Penneo og AI, binding 12 måneder, prisjustering etter KPI, mva 25 %.
- **Leverandør (Innstillinger › Leverandør):** navn, org.nr., adresse, e-post og signatar. Brukes i tilbud og avtaler. ES-Holding AS er et eksempel. Tegnet som et kort på samme side i denne runden, uten egen skjerm.
- **Regler:** bare utkast kan endres. Aktiv versjon er låst («Ny versjon» lager et utkast). «Publiser» tar utkastet i bruk fra «gjelder fra». Tilbud husker hvilken versjon de ble laget med.

## Tilstander, oppsummert

| Skjerm | Tom | Laster | Feil |
|---|---|---|---|
| SA2 Tavle | Tomme kolonner + forklaring og import | Grå kort | Banner, gamle data står |
| SA3 Eiere | Tom tabell + import | Grå rader | Banner med sist oppdatert |
| SA4 Eierkort | Ingen aktiviteter, «Første aktivitet» | Grå blokker | Feilside med kode og «Prøv igjen» |
| SA7 Avtaler | Forklaring om at avtaler lages fra tilbud | Grå rader | Penneo-banner |
