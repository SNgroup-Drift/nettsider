# 60-213 Hengsel Admin, fase A: overlevering til Code (S-62)

15.10.2026. Mål: `SNgroup-Drift/nettsider`, `sites/admin` (Astro, Cloudflare Worker med D1, bak Cloudflare Access). Denne fila er skrevet for å kunne leses uten Design-prosjektet. Alt som trengs står her eller i filene som er nevnt.

Beslutningene fra runde 2 (60-206, 14.10) gjelder uendret. Nytt siden runde 2 er bare fargene i K-234 (punkt c).

## 0. Filer i eksporten

| Fil | Hva |
|---|---|
| `60_nettsider/60-201_admin_pc.dc.html` | PC, 1440 px. Alle skjermer SA1–SA9 i én side. Velg skjerm med menyen, eller med `#side` i adressen (tabell under) |
| `60_nettsider/60-202_admin_telefon.dc.html` | Telefon, 390 px. SA1, SA2 som liste, SA4, og tilstandene |
| `60_nettsider/60-203_admin_tilbud_pdf.dc.html` | SA6 tilbud som A4-PDF |
| `60_nettsider/60-204_admin_komponenter.dc.html` | Tavlekort, tidslinje, prisberegnerlinje, statuspiller |
| `60_nettsider/60-205_admin_spesifikasjon.md` | Spesifikasjon per skjerm, fase A |
| `60_nettsider/60-206_admin_valg_og_usikkerhet.md` | Beslutninger runde 2 og åpne spørsmål |
| `60_nettsider/assets/admin-data.js` | Eksempeldata og `AdminData.beregn` (prisberegningen som kjørbar referanse) |
| `60_nettsider/assets/hengsel-ikoner.js` | Ikonene (20 × 20 rutenett, strek 1,6 / 1,875 på 16 px) |
| `60_nettsider/assets/*.svg` | Hengsel Admin-logo, Hengsel-logo, merke |
| `design_handoff_hengsel_furu_v2/tokens/hengsel-palett.css` | Tokens: grunnpalett lys og PC-laget `[data-plattform="pc"]` |

**Åpne uten Design:** `.dc.html`-filene åpnes direkte i en vanlig nettleser. De laster `./support.js` og `./assets/…` med relative stier fra mappa `60_nettsider/`, og Schibsted Grotesk fra Google Fonts (krever nett). Hold mappa samlet. Filene 60-207 til 60-212 hører til fase B og C og skal ikke bygges nå. Menyen i 60-201 lenker dit, se punkt a.

**Tegning er ikke kode.** Filene viser oppsett, tekster, tilstander og tall. Bygg med Astro-komponenter og tokens, ikke ved å kopiere de innebygde stilene.

## a) Skjermliste

Alle skjermer i fase A ses bare av Eirik (rolle `eier`). Cloudflare Access slipper inn, og Admin sjekker e-posten mot brukertabellen.

| Nr. | Skjerm | Rute (forslag) | PC: 60-201 | Telefon: 60-202 |
|---|---|---|---|---|
| SA1 | Oversikt | `/` | `#oversikt` (start) | «SA1 Oversikt» |
| SA2 | Salgstavle | `/salg/tavle` | `#tavle` | «SA2 Tavle som liste» |
| SA3 | Eiere og butikker | `/salg/eiere` | `#eiere` | «SA3 Eiere: søk uten treff» (bare tilstanden er tegnet, listen følger tavlelisten) |
| SA3 | Kunder (samme tabell, filtrert) | `/kunder` | `#kunder` | – |
| SA3 | Import fra Excel (dialog) | `/salg/eiere?import=1` | knappen «Importer fra Excel» | Ikke på telefon |
| SA4 | Eierkort | `/salg/eiere/:id` (kunde: `/kunder/:id`) | klikk på en eier; bytt eksempel med Lead / Prospekt / Kunde øverst | «SA4 Eierkort» |
| SA5 | Prisberegner | `/salg/prisberegner?eier=:id` | `#pris` | Ikke på telefon |
| SA6 | Tilbud som PDF | `/salg/tilbud/:nr/:versjon.pdf` | 60-203 | – |
| SA7 | Avtaler | `/avtaler` | `#avtaler` | Under «Mer» (ikke tegnet) |
| SA7 | Avtaleside | `/avtaler/:nr` | klikk på en avtale | – |
| SA8 | Ny aktivitet (dialog) | ingen egen rute, åpnes fra toppfeltet og eierkortet | «Ny aktivitet» | «+» i toppfeltet |
| SA8 | Lead fra «Be om demo» | `POST /api/lead` (fra hengsel.no) | vises i SA1 og SA4 | SA1 |
| SA9 | Prisliste | `/innstillinger/prisliste` | `#prisliste` | Ikke på telefon |
| SA9 | Leverandør | `/innstillinger/leverandor` | kort på prislistesiden | – |

Tilstand velges i Design-panelet Tweaks (`tilstand`: normal, tom, laster, feil) og gjelder Tavle, Eiere, Eierkort og Avtaler. Utenfor Design står alle tegningene i tilstanden «normal». Tom, laster og feil er beskrevet i punkt b og tegnet for telefon i 60-202.

**Menyen** (full, fra 15.10): Oversikt · Salg (Tavle, Eiere og butikker, Prisberegner) · Kunder · Avtaler · Support (Saker, Timer) · Oppstart · Fakturering (Abonnement, Fakturakjøring, KPI, Utestående) · Tall · Drift (Status, Lenker, Kontoer, Frister, Rutiner) · Innstillinger. I fase A bygges bare Oversikt, Salg, Kunder, Avtaler og Innstillinger › Prisliste og Leverandør. Forslag: lag menyen fra én konfigurasjon og skjul punkter som ikke er bygget. Drift-sidene som finnes i dag beholdes.

**Telefon:** bunnfaner Oversikt, Tavle, Eiere, Avtaler og Mer (fase A). Under 1024 px blir sidemenyen en skuff, under 768 px bunnfaner. Ingen dra og slipp på telefon.

## b) Tilstander per skjerm

| Skjerm | Tom | Laster | Feil | Forfalt | Ingen treff |
|---|---|---|---|---|---|
| SA1 Oversikt | Tallene viser 0. «Neste steg»: «Ingen steg i dag». Ingen leads: kortet skjules | Grå kort | Banner øverst, kortene står med sist hentede tall | Neste steg før i dag: rød tekst (`--feil-tekst`), vekt 600, ikon `frist`, «Forfalt 13.10». I dag: `--aksent-tekst`, «I dag» | – |
| SA2 Tavle | Tomme kolonner med «Tomt», og et kort under: «Ingen muligheter ennå», «Importer fra Excel», «Ny eier» | 2 grå kort per kolonne (1 i Tapt) | Rødt banner «Kunne ikke hente salgstavla», «Prøv igjen». Kortene står | Som SA1, på kortets neste steg | Filter på produktlinje uten kort: «Dra et kort hit» i tomme kolonner |
| SA3 Eiere | «Ingen eiere ennå», forklaring, «Importer fra Excel» | 6 grå rader | Banner med «Sist oppdatert 14.10 kl. 09:12», «Prøv igjen» | – | «Ingen treff», tekst om hva søket ser på |
| SA4 Eierkort | Ny eier: ingen aktiviteter, «Første aktivitet». Ingen muligheter: «Ingen åpne muligheter». Ingen tilbud: «Lag et i prisberegneren» | Grå blokker, «Henter eierkortet …» | Egen side: «Kunne ikke åpne eierkortet», feilkode, «Tilbake til listen» og «Prøv igjen» | Neste steg øverst i tidslinjen, rød tekst | Filter i tidslinjen uten treff: tom liste |
| SA5 Prisberegner | Én tom butikklinje | – (alt regnes lokalt fra prislisten) | Prislisten kan ikke hentes: banner, «Lag tilbud» er av | – | – |
| SA7 Avtaler | Forklaring: avtaler lages fra tilbud | Grå rader | Banner «Penneo svarer ikke», listen vises, status kan være utdatert | «Fornyes snart» (gul pille) innen 90 dager | Filter uten treff: tom tabell med filternavn |
| SA8 Ny aktivitet | – | – | Lagring feiler: feilmelding i dialogen, teksten beholdes | – | – |
| SA9 Prisliste | Bare én versjon: ingen arkiverte | – | Lagring av utkast feiler: banner | – | – |

Telefon (60-202, rad 2): Tavle tom, Tavle laster, Tavle feil, Eiere søk uten treff, Eierkort laster, Eierkort feil. Forfalt står i Oversikt, Tavle og Eierkort i rad 1.

**Feilkoder (forslag):** `ADM-401` ikke innlogget, `ADM-403` ingen tilgang, `ADM-404` finnes ikke, `ADM-504` databasen svarte ikke. Vis koden i liten tekst.

## c) Komponenter og tokens

Bare lys modus. Sett `data-plattform="pc"` på `<html>`. Tokens fra `design_handoff_hengsel_furu_v2/tokens/hengsel-palett.css` (grunnpalett + PC-lag). Bruk tokennavn, ikke hex.

**K-234, 15.10:** `--aksent` lys er nå **#05806F** (var #068472). `--paa-aksent` er nå **Off White #FBF9F6** (var #FFFFFF). Tegningene 60-201 til 60-204 er oppdatert. `tokens.css` i repoet må oppdateres. `--aksent-trykk` (#007665) og `--aksent-tekst` (#016D5E) er ikke nevnt i K-234 og står uendret.

### Fra hex i tegningene til token

| I tegningen | Token |
|---|---|
| #ECEFF3 | `--flate-side` (PC) |
| #FFFFFF (kort, sidemeny, felt) | `--flate-kort`, `--sidemeny-flate` |
| #F3F5F8 | `--flate-senket`, `--flate-hover` |
| #E3E6EA | `--linje`. Som flate i tavlekolonner: foreslått `--flate-kolonne` |
| #CDD1D6 | `--ramme` (PC) |
| #7B8188 | `--kant` (felt og sekundærknapper) |
| #1A1D22 | `--tekst` |
| #51565C | `--tekst-dempet` |
| #62686F | `--tekst-svak` (PC) |
| #05806F | `--aksent` (K-234) |
| #007665 | `--aksent-trykk` |
| #016D5E | `--aksent-tekst` |
| #E0F4EE | `--aksent-svak`, `--flate-valgt`, `--sidemeny-aktiv-flate` |
| #BCE6DB | `--aksent-valgt` |
| #FBF9F6 | `--paa-aksent` (K-234) |
| #FFE9BC / #6D5000 / #E0C07F | `--varsel-flate` / `--varsel-tekst` / `--status-advarsel-kant` |
| #FFEBE8 / #9E2D28 / #F9AEA5 | `--feil-flate` / `--feil-tekst` / `--status-feil-kant` |
| #E7F1FF / #1A57AD / #A0C6FF | `--status-ny-bg` / `-fg` / `-kant` |
| #EFEEFF / #5C46A7 / #C3BBFB | `--status-pagar-*` |
| #FCE9FF / #80378C / #E0B1E7 | `--status-sannsynlig-*` |
| #E3F7DE / #1F6D02 / #A5D39B | `--status-ferdig-*` |
| #E9F1FB / #555B64 / #BDC5CF | `--status-venter-*` |
| 0 1px 2px rgba(26,29,34,.06) | `--skygge-kort` |
| 0 0 0 1px rgba(26,29,34,.08), 0 16px 40px -12px rgba(26,29,34,.28) | `--skygge-flytende` |
| rgba(26,29,34,.40) | `--overlegg` |
| rgba(236,239,243,.9) + blur 8 px | `--toppfelt-flate` |
| Toast: #1A1D22 / #FBFDFF | `--tekst` som flate, `--tekst-invers` som tekst |
| Toast-ikon #54B9A5 og lenke #8ACDBE | Ingen lys token. Dette er aksentene fra mørk modus. Se åpent spørsmål 12 |
| #DDE1E6, #B9BEC4 | Bare lerret og telefonramme i tegningen. Bygges ikke |

Mål: radius `--radius-kort` 14, `--radius-felt` 10, `--radius-knapp` 10, `--radius-pille` 999. Høyder `--knapp-hoyde` / `--felt-hoyde` 36, `--rad` 44, `--sidemeny-rad` 34, `--toppfelt-hoyde` 60, `--sidemeny-bredde` 248. Skrift `--font-grunn` 15, `--font-tabell` 14, `--font-meta` 13, `--font-pille` 12, `--font-korttittel` 16, `--font-sidetittel` 28. Telefon: grunnskrift 16, trykkflater 44.

### Komponentene i 60-204

| Komponent | Varianter | Tokens |
|---|---|---|
| **Tavlekort** | normal, hover, dras (opasitet .45), slippmål (kolonnen), forfalt, i dag, senere, tapt (med grunn) | `--flate-kort`, `--ramme`, `--skygge-kort`, hover `--kant`; kolonne `--flate-kolonne` (forslag); slippmål `--aksent-svak` + 2 px `--aksent`; forfalt `--feil-tekst` vekt 600 + ikon `frist`; i dag `--aksent-tekst`; senere `--tekst-dempet`; kjedemerke Sigdal `--flate-senket`/`--ramme`, Uavhengig `--flate-kort`/`--linje` |
| **Tidslinje** | samtale, møte, demo, e-post, notat; med og uten neste steg | Ikonsirkel: samtale `--status-ny-*`, møte `--status-pagar-*`, demo `--aksent-svak`/`--aksent-tekst`, e-post `--status-venter-*`, notat `--flate-senket`/`--tekst-dempet`. Linje `--linje` 2 px. Neste steg-boks `--flate-senket` |
| **Prisberegnerlinje** | per butikk: navn, pakkevelger (Start, Butikk, Komplett), tellere for ekstra brukere og montører, sum | Felt `--kant`; valgt pakke `--flate-kort` + `--aksent` ring og `--aksent-tekst`; segmentflate `--flate-senket`; teller-knapper `--kant` |
| **Statuspille** | Ny, Demo avtalt, Tilbud sendt, Forhandling, Signert, Tapt, Kunde; avtale: Utkast, Til signering, Signert, Fornyes snart, Sagt opp; prisliste: Aktiv, Utkast, Arkivert; Eksempel | Tavle: Ny `--status-ny`, Demo `--status-pagar`, Tilbud `--status-sannsynlig`, Forhandling `--aksent-svak`/`--aksent-tekst`/`--aksent-valgt`, Signert og Kunde `--status-ferdig`, Tapt `--status-venter`. Avtale: Utkast `--status-venter`, Til signering `--status-pagar`, Signert `--status-ferdig`, Fornyes snart `--status-advarsel`, Sagt opp `--status-feil`. Eksempel `--varsel-*` |
| **Knapper** (brukt overalt) | primær, sekundær, tekstknapp, av | Primær `--aksent` / `--paa-aksent`, trykk `--aksent-trykk`. Sekundær `--flate-kort` + `--kant`. Tekst `--aksent-tekst`. Av `--linje` / `--tekst-svak` |
| **Banner** | feil, lead (info) | Feil `--feil-flate`, `--feil-tekst`, `--status-feil-kant`. Lead `--status-ny-bg`, `--status-ny-kant`, tittel `--status-ny-fg` |
| **Dialog** | Ny aktivitet, Marker som tapt, Import | `--flate-kort`, `--skygge-flytende`, `--overlegg`, radius 14 |

## d) Datamodell for D1

Typer: `TEXT` id (ULID), `TEXT` dato (ISO `2026-10-14`) og tid (ISO med tidssone), beløp som `INTEGER` i øre, prosent som `REAL`. `opprettet` og `endret` (TEXT, påkrevd) finnes i alle tabeller og er ikke gjentatt. P = påkrevd, V = valgfritt.

**eier**
| Felt | Type | | Merknad |
|---|---|---|---|
| id | TEXT | P | |
| navn | TEXT | P | |
| orgnr | TEXT | V | 9 siffer uten mellomrom. UNIQUE når satt |
| adresse, postnr, sted | TEXT | V | |
| fylke | TEXT | V | |
| kjede | TEXT | P | `sigdal` / `annen` |
| produktlinje | TEXT | P | `sigdal` / `hengsel` |
| status | TEXT | P | `ny`, `demo`, `tilbud`, `forhandling`, `signert`, `tapt` (= tavlekolonne) |
| er_kunde | INTEGER | P | 0/1. Settes når første avtale er signert |
| kilde | TEXT | V | `be_om_demo`, `sigdal_kjedemote`, `anbefaling`, `messe`, `import`, `annet` |
| tap_grunn | TEXT | V | Påkrevd når status = `tapt` |
| tap_merknad | TEXT | V | |
| neste_tekst, neste_dato | TEXT | V | Påkrevd når status er ny, demo, tilbud eller forhandling |
| lead_tid, lead_kanal, lead_melding, lead_butikker, lead_ansatte | TEXT/INTEGER | V | Fra «Be om demo» |
| lead_ny | INTEGER | P | 0/1. «Ny» i Oversikt til eierkortet er åpnet |
| miljo_adresse, miljo_database, miljo_tema | TEXT | V | Kunder. Versjon og siste innlogging leses fra kundemiljøet, lagres ikke |

**butikk**: id P, eier_id P → eier, navn P, sted V, pakke V (`start`, `butikk`, `komplett`; foreslått pakke for prospekt, avtalt pakke for kunde), brukere INTEGER V (totalt), montorer INTEGER V, rekkefolge INTEGER P.

**kontakt**: id P, eier_id P → eier, navn P, rolle V, telefon V, epost V, signaturrett INTEGER P (0/1), primaer INTEGER P (0/1).

**mulighet**: id P, eier_id P → eier, produktlinje P, fase P (= tavlekolonne), antall_butikker INTEGER P, verdi_mnd_ore INTEGER V (fra siste tilbud eller prisberegner), aapnet TEXT P, lukket TEXT V. Én åpen mulighet per eier i fase A.

**aktivitet**: id P, eier_id P → eier, kontakt_id V → kontakt, mulighet_id V → mulighet, type P (`samtale`, `mote`, `demo`, `epost`, `notat`), dato P, tittel P («Hva skjedde»), tekst V, hvem P (bruker), neste_tekst V, neste_dato V. Lagring setter `eier.neste_*`.

**tilbud**: id P, nr P (`T-2026-031`), versjon INTEGER P, mulighet_id P → mulighet, eier_id P → eier, kontakt_id V → kontakt, prisliste_id P → prisliste, produktlinje P, dato P, gyldig_til P, status P (`utkast`, `sendt`, `erstattet`, `akseptert`), erstatter_id V → tilbud, leverandor_json P (kopi av leverandøren da tilbudet ble laget), sum_mnd_ore, mva_mnd_ore, rabatt_prosent REAL, rabatt_ore, etablering_ore (alle P), pdf_nokkel V (R2). UNIQUE (nr, versjon).

**tilbudslinje**: id P, tilbud_id P → tilbud, rekkefolge INTEGER P, type P (`pakke`, `ekstra_brukere`, `ute`, `rabatt`, `tillegg`, `etablering`, `viderefakturering`), butikk_navn V, pakke V, antall INTEGER V, enhetspris_ore V, belop_ore INTEGER P (rabatt negativ), rabatterbar INTEGER P (0/1), tekst V.

**avtale**: id P, nr P (`A-2026-019`), eier_id P → eier, tilbud_id V → tilbud, status P (`utkast`, `signering`, `signert`, `sagt_opp`; «Fornyes snart» regnes ut), leverandor_json P, binding_mnd INTEGER P, oppsigelse_mnd INTEGER P, start V, fornyes V, opphorer V, prisjustering P (`kpi`), per_mnd_ore INTEGER P, prisliste_id P, penneo_sak_id V, signert_pdf_nokkel V, signert_tid V.

**avtaledokument**: id P, avtale_id P → avtale, avtalemal_id P → avtalemal, rekkefolge P. (Kundeavtale, databehandleravtale, supportnivå.)

**avtalemal**: id P, navn P, versjon P (`v3.1`), gjelder_fra P, status P (`utkast`, `aktiv`, `arkivert`), fil_nokkel P.

**signatar**: id P, avtale_id P → avtale, rekkefolge INTEGER P (1 kunden, 2 leverandøren), part P (`kunde` / `leverandor`), navn P, epost P, rolle V, status P (`ikke_sendt`, `venter`, `signert`), sendt V, signert V, penneo_id V.

**prisliste**: id P, versjon P UNIQUE (`2026.2`), gjelder_fra P, status P (`utkast`, `aktiv`, `arkivert`), binding_mnd P (12), prisjustering P (`kpi`), viderefakturering_prosent REAL P (15), mva_prosent REAL P (25), rabatt_gjelder P (JSON: `["pakke","ekstra_brukere","ute"]`), publisert V. Bare én aktiv om gangen. Aktiv og arkivert kan ikke endres.

**prislisterad**: id P, prisliste_id P → prisliste, type P, og feltene under. UNIQUE (prisliste_id, type, produktlinje, kode).
| type | Felt i bruk |
|---|---|
| `pakke` | produktlinje, kode (`start`/`butikk`/`komplett`), navn, pris_ore (per butikk per mnd, per produktlinje), inkl_brukere, ekstra_bruker_ore, support_timer, etablering_ore, moduler (JSON) |
| `ute` | kode `montor` (pris_ore per montør) eller `firma` (pris_ore, maks_antall 8) |
| `tillegg` | kode (`backup`, `domene`), navn, pris_ore, inkludert_regel (`komplett_eller_flere_butikker` / null), merknad |
| `rabattrinn` | fra_butikker INTEGER, prosent REAL |

Pakkens inkluderte brukere, ekstrapris, support og etablering er like for begge produktlinjer i runde 2. Lagres per linje likevel, så de kan skilles senere.

**innstilling** (én rad per nøkkel): nokkel P UNIQUE, verdi P (JSON), eksempel INTEGER P (0/1). Nøkler i fase A: `leverandor` (`{navn, orgnr, adresse, epost, signatar, signatar_rolle, signatar_epost}`), `fornyes_snart_dager` (90), `tilbud_gyldig_dager` (14).

**bruker**: id P, epost P UNIQUE, navn P, rolle P (`eier` i fase A).

Relasjoner: eier 1–n butikk, kontakt, mulighet, aktivitet, tilbud, avtale. mulighet 1–n tilbud. tilbud 1–n tilbudslinje. avtale 1–n signatar, avtaledokument. prisliste 1–n prislisterad, tilbud.

## e) Prisberegningen

**Eksempel – prislisten er ikke låst.** Alle tall under kommer fra prisliste 2026.2 og er eksempler.

| | Sigdal CRM | Hengsel | Inkl. brukere | Ekstra bruker | Support første år | Etablering |
|---|---|---|---|---|---|---|
| Start | 2 990 kr | 1 990 kr | 3 | 350 kr | 1 t/mnd | 15 000 kr |
| Butikk | 4 990 kr | 3 990 kr | 5 | 450 kr | 2 t/mnd | 25 000 kr |
| Komplett | 6 990 kr | 5 990 kr | 6 | 550 kr | 3 t/mnd | 39 000 kr |

Hengsel Ute: 150 kr per montør, eller firmapris 990 kr for opptil 8 montører. Tillegg: utvidet sikkerhetskopi 1 090 kr (inkludert når en butikk har Komplett, eller eieren har 2 eller flere butikker), eget domene 110 kr. Kjederabatt: 15 % fra 3 butikker, 25 % fra 10 butikker hos samme eier. Viderefakturering: kostpris + 15 %.

### Regler, i rekkefølge

1. Alle tall hentes fra aktiv prisliste. Ingen priser i koden. Tilbudet lagrer prislisteversjonen.
2. Hver butikk har sin egen pakke. Butikklinje = pakkepris (for produktlinjen) + ekstra brukere × ekstrapris for pakken.
3. Hengsel Ute regnes for hele eieren: montører summeres over butikkene. Pris = det billigste av montørpris × antall og firmapris (firmapris bare når antall ≤ 8). 0 montører = ingen linje.
4. Grunnlag for rabatt = sum butikklinjer + Ute.
5. Rabattrinn velges fra antall butikker hos eieren (høyeste trinn som passer). Rabatt = grunnlag × prosent, **avrundet til hele kroner** (0,5 rundes opp). Vises som én linje under linjene den gjelder.
6. **Rabatten gjelder:** pakker, ekstra brukere og Hengsel Ute. **Gjelder ikke:** tillegg, etablering og viderefakturering.
7. Tillegg legges til etter rabatten. Sikkerhetskopi som er inkludert vises som «Inkludert», 0 kr.
8. Per måned uten mva = grunnlag − rabatt + tillegg. Mva = 25 %, med øre. Per år = per måned × 12.
9. Etablering = sum av etablering per butikk etter pakke, engangs, uten rabatt, med og uten mva.
10. Viderefakturering (SMS, Penneo, AI) står som tekst i tilbudet og faktureres etter bruk.

Referanse: `AdminData.beregn(linje, butikker, { tillegg })` i `assets/admin-data.js` gir alle tallene under.

### Eksempel 1: én butikk, Hengsel Start

| Linje | Beløp |
|---|---|
| Butikk 1, Start (3 brukere inkludert, 1 t support) | 1 990 kr |
| Hengsel Ute, 1 montør × 150 kr (billigere enn firmapris) | 150 kr |
| Kjederabatt | ingen (1 butikk, 2 til 15 %) |
| Utvidet sikkerhetskopi | ikke inkludert (1 butikk, ikke Komplett), ikke valgt |
| **Per måned uten mva** | **2 140 kr** |
| Mva 25 % | 535 kr |
| **Per måned med mva** | **2 675 kr** |
| Per år uten mva / mva / med mva | 25 680 kr / 6 420 kr / 32 100 kr |
| Etablering, 1 × Start, uten rabatt | 15 000 kr, mva 3 750 kr, med mva 18 750 kr |

### Eksempel 2: tre butikker, Sigdal CRM, ulik pakke (15 %)

| Linje | Beløp |
|---|---|
| Butikk A, Komplett 6 990 kr + 2 ekstra brukere × 550 kr (1 100 kr) | 8 090 kr |
| Butikk B, Butikk 4 990 kr + 1 ekstra bruker × 450 kr | 5 440 kr |
| Butikk C, Start | 2 990 kr |
| Hengsel Ute, 5 montører × 150 kr (750 kr, billigere enn 990 kr) | 750 kr |
| Grunnlag for rabatt | 17 270 kr |
| **Kjederabatt 15 % (3 butikker)** av 17 270 kr (2 590,50 avrundet) | **−2 591 kr** |
| Utvidet sikkerhetskopi (Komplett og flere butikker) | Inkludert, 0 kr |
| Eget domene, tillegg uten rabatt | 110 kr |
| **Per måned uten mva** | **14 789 kr** |
| Mva 25 % | 3 697,25 kr |
| **Per måned med mva** | **18 486,25 kr** |
| Per år uten mva / mva / med mva | 177 468 kr / 44 367 kr / 221 835 kr |
| Etablering, 39 000 + 25 000 + 15 000, uten rabatt | 79 000 kr, mva 19 750 kr, med mva 98 750 kr |
| Support inkludert første år | 3 + 2 + 1 = 6 t/mnd |

### Eksempel 3: elleve butikker, Hengsel, Ute og tillegg (25 %)

| Linje | Beløp |
|---|---|
| Butikk 1 og 2, Komplett 5 990 kr + 3 ekstra brukere × 550 kr (1 650 kr), 2 × 7 640 kr | 15 280 kr |
| Butikk 3, Butikk 3 990 kr + 1 ekstra bruker × 450 kr | 4 440 kr |
| Butikk 4–8, Butikk, 5 × 3 990 kr | 19 950 kr |
| Butikk 9–11, Start, 3 × 1 990 kr | 5 970 kr |
| Hengsel Ute, 22 montører × 150 kr (over 8, firmapris gjelder ikke) | 3 300 kr |
| Grunnlag for rabatt | 48 940 kr |
| **Kjederabatt 25 % (11 butikker)** av 48 940 kr | **−12 235 kr** |
| Utvidet sikkerhetskopi | Inkludert, 0 kr |
| Eget domene, tillegg uten rabatt | 110 kr |
| **Per måned uten mva** | **36 815 kr** |
| Mva 25 % | 9 203,75 kr |
| **Per måned med mva** | **46 018,75 kr** |
| Per år uten mva / mva / med mva | 441 780 kr / 110 445 kr / 552 225 kr |
| Etablering, 2 × 39 000 + 6 × 25 000 + 3 × 15 000, uten rabatt | 273 000 kr, mva 68 250 kr, med mva 341 250 kr |
| Viderefakturering, f.eks. SMS med kostpris 400 kr | 460 kr, uten rabatt, etter bruk |

Kontroll fra 60-205 (tilbudet i 60-203): 3 × Butikk Sigdal 4 990 + Ute 4 × 150 = 15 570. Rabatt 15 % = 2 336. Per måned 13 234 kr, mva 3 308,50, med mva 16 542,50. Etablering 75 000, med mva 93 750.

## f) Salgstavla

- **Kolonner:** Ny · Demo avtalt · Tilbud sendt · Forhandling · Signert · Tapt. Hodet viser antall og sum per måned uten mva. Filter på produktlinje (Alle, Sigdal CRM, Hengsel). «Åpen verdi» = Ny til Forhandling.
- **Kort:** eier, kjede (Sigdal / Uavhengig), antall butikker, verdi per måned (fra siste tilbud, ellers standard oppsett i prisberegneren), neste steg med dato. Tapt viser grunn.
- **Hva flytter et kort:** dra og slipp på PC (setter `eier.status` og `mulighet.fase`, logger en aktivitet «Flyttet til …»). På telefon: status i eierkortet. Automatisk: lead fra «Be om demo» lander i Ny.
- **Tapt** åpner dialogen «Marker … som tapt». Grunn er påkrevd, «Flytt til Tapt» er av til en grunn er valgt. Grunner: Valgte annen leverandør · For dyrt · Ikke riktig tidspunkt · Mangler funksjon · Svarer ikke. «Ikke aktuell» på et lead bruker samme dialog.
- Signert flyttes ikke tilbake med dra og slipp (forslag).

## g) Tilbud, avtaler og Penneo

- **Tilbud:** `utkast` → `sendt` → `akseptert`. Ny versjon setter forrige til `erstattet`. «Lag tilbud» i SA5 lagrer en ny versjon med prislisteversjonen og lager PDF. Gyldig 14 dager (forslag).
- **Avtale:** `utkast` (laget fra tilbud) → `signering` (sendt til Penneo) → `signert`. Senere `sagt_opp`. «Fornyes snart» er en visning når fornyelsesdatoen er innen 90 dager, ikke en lagret status.
- **Rekkefølge:** 1 kunden (kontakt med signaturrett hos eieren), 2 Eirik for leverandøren. Leverandøren får invitasjon først når kunden har signert.
- **Når én har signert:** signatar 1 = `signert` med tid, avtalen står fortsatt som «Til signering». Signatar 2 får invitasjon. Avtalesiden viser «Venter på leverandøren».
- **Når begge har signert:** avtale = `signert`, signert PDF lagres, tilbudet = `akseptert`, eier og mulighet = `signert`, `eier.er_kunde = 1`.
- **Handlinger:** «Send påminnelse» (til den som venter), «Forhåndsvis PDF» / «Last ned signert PDF», «Ny avtale fra tilbud».
- **Leverandøren** er et felt i Innstillinger › Leverandør (navn, org.nr., adresse, e-post, signatar). Den kopieres inn i tilbud og avtale når de lages. Ingen fast tekst i koden. ES-Holding AS er et eksempel.

## h) Excel-import (SA3)

Én rad per eier. Første rad er overskrifter. Fila kan være `.xlsx` eller `.csv`.

| Kol. | Navn | | Eksempel |
|---|---|---|---|
| A | Eier | Påkrevd | Lunde Kjøkken AS |
| B | Org.nr. | Valgfri, sterkt anbefalt | 930 221 467 |
| C | Adresse | Valgfri | Storgata 1 |
| D | Postnr. | Valgfri | 2317 |
| E | Sted | Valgfri | Hamar |
| F | Fylke | Valgfri | Innlandet |
| G | Kjede | Valgfri (Sigdal / Annen, tom = Annen) | Sigdal |
| H | Antall butikker | Valgfri (tom = 1) | 2 |
| I | Butikker | Valgfri, skilt med semikolon | Lunde Hamar; Lunde Gjøvik |
| J | Kontakt | Valgfri | Ola Lunde |
| K | Kontakt e-post | Valgfri | ola@lunde.no |
| L | Kontakt telefon | Valgfri | 900 00 000 |
| M | Kilde | Valgfri (tom = import) | Sigdal-kjedemøte |

- **Dubletter:** org.nr. renses (bare siffer) og sammenlignes med `eier.orgnr`. Treff = «Oppdateres»: tomme felt fylles, utfylte felt overskrives ikke (forslag). Uten org.nr.: importeres som prospekt med «Mangler org.nr.» og et neste steg for oppfølging.
- **Forhåndsvisning:** filnavn og antall rader, telling (nye, oppdateres, mangler org.nr.), tabell med Eier, Org.nr., Butikker, Kjede, Fylke og Resultat. Ingenting lagres før «Importer N rader». Etterpå: melding «6 rader importert. 1 må få org.nr.».
- Nye eiere får status Ny og kilde fra kolonne M.

## i) Tilbud-PDF (60-203)

A4 stående, én side, marger 16 mm, Schibsted Grotesk.

1. **Topp:** Hengsel-logo (fast) til venstre. Leverandør til høyre: navn, org.nr., adresse, e-post (fra Innstillinger).
2. **Tittel:** «Tilbud» og overskrift (f.eks. «Sigdal CRM for tre butikker»). Nr. med versjon, dato, gyldig til.
3. **Til:** kunde, org.nr., adresse, att. kontakt og rolle. **Produktlinje** med prislisteversjon.
4. **Linjer per måned:** én per butikk (navn, pakke, beløp, «5 brukere og 2 t support/mnd inkludert»), Hengsel Ute (antall × pris eller firmapris, med forklaring), kjederabatten som én linje med grunnlag, tillegg (eller «Inkludert»).
5. **Etablering** (engangs, uten rabatt) med mva, og en tekst om viderefakturering.
6. **Sum:** per måned uten mva, mva, med mva; per år uten mva, mva, med mva.
7. **Vilkår:** binding, fornyelse, oppsigelse, KPI, forskuddsfakturering, priser uten mva, kjederabatt følger antall butikker, inkludert support. Hvilke avtaler som lages (mal og versjon) og rekkefølgen for signering.
8. **Bunntekst:** nr., versjon, prisliste, hvilken versjon den erstatter, side.

**Fra Innstillinger / data:** leverandør, kunde og kontakt, nr., datoer, prisliste og alle beløp, binding og oppsigelse (prisliste), avtalemalenes navn og versjon. **Fast tekst:** logo, overskrifter, setningene i vilkårene rundt verdiene. Merket «Eksempel – leverandør og priser er ikke låst» er bare for tegningen.

## j) Eksempeldata som ikke skal bygges inn

- Alle eiere, butikker, kontakter, telefonnumre, e-poster og org.nr. (Nordli, Granlund, Fjordhuset, Vestby, Strand, Aune, Hovde osv.). Oppdiktet.
- Alle priser og beløp i prislisten 2026.1, 2026.2 og 2027.1, og tallene i Oversikt.
- Leverandøren ES-Holding AS med org.nr. og adresse.
- Tilbuds- og avtalenumre, datoer, aktiviteter, «Be om demo»-meldingen og importfila `kjedeliste-sigdal-okt.xlsx`.
- Kundemiljøenes adresser, databaser, versjoner og innloggingstider.
- «Dagens dato» 14.10.2026, versjonsnummeret «Admin 2.1.0» og feilkoden ADM-504 i tekstene.
- Merket «Eksempel» på prisliste og leverandør skal bygges som en funksjon (felt `eksempel`), men teksten fjernes når verdiene er bekreftet.

## k) Åpne spørsmål (fra 60-206, med forslag)

1. **Nummerering:** 60-201 til 60-213 er forslag. Forslag: sjekk mot registeret i «Hengsel.no 2.0 redesign» før filene legges i repoet.
2. **Leverandør:** hvilket selskap selger Hengsel? Forslag: bygg som innstilling, behold ES-Holding AS som eksempel til det er besluttet.
3. **Priser:** prislisten er ikke låst. Forslag: bygg prislisteversjoner fullt ut, legg inn 2026.2 som utkast.
4. **Fornyes snart:** 90 dager. Forslag: innstilling `fornyes_snart_dager`, standard 90.
5. **Lead-flyt:** lages eier og kontakt med en gang, eller i en innboks? Forslag: med en gang, status Ny og «Ny»-merke. «Ikke aktuell» lukker.
6. **Telefonens bunnfaner:** Oversikt, Tavle, Eiere, Avtaler, Mer. Forslag: behold. Når Support kommer: Saker erstatter Avtaler, som flyttes til Mer.
7. **Kolonnefargen** #E3E6EA som flate. Forslag: nytt token `--flate-kolonne`.
8. **Mva på etablering:** vises. Forslag: ja, etablering er mva-pliktig som resten.
9. **Tillegg og rabatt:** tegnet uten rabatt. Forslag: behold.
10. **Firmapris for Ute:** per eier (tegnet) eller per butikk? Forslag: per eier.
11. **«Flere butikker»** for gratis sikkerhetskopi = 2 eller flere. Forslag: behold.
12. **Toast** bruker aksentene fra mørk modus (#54B9A5, #8ACDBE) på mørk flate. Forslag: nytt token `--aksent-paa-mork`, eller bruk `--paa-aksent` på ikonet.
13. **K-234 og `--aksent-trykk`:** skal trykkfargen (#007665) og `--aksent-tekst` (#016D5E) også justeres når aksent er #05806F? Forslag: behold dem til de er kontrastsjekket mot den nye aksenten.
14. **Support etter første år:** hva skjer med inkluderte timer fra år 2? Forslag: samme timer så lenge avtalen løper (påvirker bare tekst i fase A).
15. **Hengsel-linjen:** har samme brukere, support og etablering som Sigdal CRM. Forslag: behold, men lagre per linje.
16. **Tilbud gyldig:** 14 dager (tegnet 13.10 → 27.10). Forslag: innstilling `tilbud_gyldig_dager`.
