# 20-000 Sidekart – gjennomgang

S-68 · 17.10.2026, runde 11 19.10.2026 · 192 sider (175 i treet og 15 forslag; 23-015 og 26-013 lagt til i runde 2). Kilde: `20_sidekart/assets/sidekart-data.js` og `sidekart-skjermer.js`. Bilder og beskrivelse per side: `<nr>.png` og `<nr>.md` i denne mappa. Alle 187 sider som skal vises, er tegnet som egen skjerm med `_skjerm.dc.html` (76 av dem i S-68 17.10, fra kildefila). De tre SKJULT tegnes ikke.

Runde 11 (19.10): kolonnen **Vei inn** sier hvordan brukeren kommer til siden: meny · fane på <nr> · lenke fra <nr> · topplinje · e-post/SMS · app · egen adresse. Logikken står i `meny.md`. 21-118 Proff og 21-605 Økonomi er nye samlesider. 21-314 og 21-315 har fått 22-020 og 22-021. 21-902…921 bruker `/innstillinger/…`, og `/settings/…` fra menyV5.ts blir alias.

| Nr. | Navn | Rute | Hvem ser den | Enheter | Status | Kilde | Endret mot v4 | Forslag | Vei inn |
|---|---|---|---|---|---|---|---|---|---|
| 21-001 | Innlogging (kundens logo og bilde, K-303) | `/#/logg-inn` | Alle | PC 1440, Telefon 390 | NY | 11-007 | v4 /login. Innlogging med Microsoft (SSO), kundens logo og bilde (K-303). | **BEHOLD** | egen adresse |
| 21-002 | Sett passord | `/#/sett-passord` | Alle (fra invitasjon) | PC 1440, Telefon 390 | NY | Dagens app, S-68 | v4 /set-password. Samme funksjon, nytt kort; Microsoft som alternativ. | **BEHOLD** | e-post/SMS |
| 21-003 | Startside (videresending) | `/#/` | Alle | PC 1440, iPad 1024, Telefon 390 | NY | S-68 | v4 sendte leder til /leder og montasjeleder til /montasje. Nå til Min dag for rollen. | **BEHOLD** | egen adresse |
| 21-004 | Min dag selger | `/#/b/:butikk/min-dag` | Selger | PC 1440, Telefon 390 | NY | 11-012 | v4 01 Min dag: fanene ble filtre, gruppert i Haster, I dag og Denne uka. Rettet i S-68: Tallrad 1/4 ×4 øverst; Haster, I dag og Denne uka som én tabell 1/1 med filtrene i verktøylinja (2b); topplinje og meny etter regel 7 og 8. Runde 11: Mine tall er en fane på Min dag. | **BEHOLD** | meny |
| 21-005 | Min dag KAM | `/#/b/:butikk/min-dag` | KAM | PC 1440, Telefon 390 | NY | 11-014 | Ikke i v4. Ny i v5 (11-014). Runde 4: Antall i fanene (Proffkunder 3 · Til fordeling 4 · Innboks 3); verktøylinja uten piller (Butikk ▾ · Ring). Runde 3: Tabellene som faner (Proffkunder · Til fordeling · bestilling@). | **BEHOLD** | meny |
| 21-006 | Min dag butikkleder | `/#/b/:butikk/min-dag` | Butikkleder | PC 1440 | NY | 11-013 | Erstatter v4 /leder, /resultater (Butikker) og /team. Runde 4: Tallraden er tatt bort (siden står ikke lenger i 2e); antall i fanen «Trenger deg 6». Runde 3: Tabellene som faner; tallraden står (oversiktsside). Runde 4b: Tabellen «Trenger deg» tilbake under fanene (rettet feil fra runde 4). Runde 11: flisene lenker rett til fanene i Butikken. | **BEHOLD** | meny |
| 21-007 | Min dag montasjeleder | `/#/b/:butikk/min-dag` | Montasjeleder | PC 1440, iPad 1024 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | meny |
| 21-008 | Sidemeny bred/smal | `–` | Alle | PC 1440, iPad 1024 | NY | 11-011, 11-017, _meny | v4 sidemeny 220 px med «Mer». Nå 240/64 px per rolle med tillegg som egne grupper. Runde 11: grunnmeny per rolle (høyst 7) og ett punkt per tillegg under skillelinja. Tegnet for åtte roller, bred og smal, og Mer-arket på telefon. | **BEHOLD** | meny |
| 21-009 | Topplinje og søk (⌘K) | `–` | Alle | PC 1440, iPad 1024, Telefon 390 | NY | _topp, DS Toppfelt | v4 hadde søk nederst i menyen. Nå topplinje 56 px etter regel 8. Runde 11: søket har gruppen «Alle sider» med sti, og + Ny har kunde, tilbud, sak og avtale. | **BEHOLD** | topplinje |
| 21-010 | Varsler | `/#/varsler` | Alle | PC 1440, iPad 1024, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | topplinje |
| 21-011 | Profil | `/#/profil` | Alle | PC 1440, Telefon 390 | ENDRET | v4 11 | v4 11 Profil uten Utseende-bryteren. | **BEHOLD** | topplinje |
| 21-012 | Hjelp | `/#/hjelp` | Alle | PC 1440, Telefon 390 | NY | 60-209 | Ikke i v4. Ny i v5 (60-209). | **BEHOLD** | topplinje |
| 21-013 | Demo-bånd og feilside | `–` | Alle | PC 1440, iPad 1024, Telefon 390 | NY | DS Toppfelt (demo), Tilstand | Ikke i v4. Ny i v5 (DS Toppfelt (demo), Tilstand). | **BEHOLD** | egen adresse |
| 21-014 | Butikkvalg og «Alle butikker» | `–` | Alle med flere butikker | PC 1440, iPad 1024, Telefon 390 | NY | 11-017 | Ikke i v4. Ny i v5 (11-017). | **BEHOLD** | topplinje |
| 21-101 | Kunder (liste) | `/#/b/:butikk/kunder` | Selger | PC 1440, Telefon 390 | ENDRET | v4 03, crm 08 | v4 03/crm 08 Kortliste. Butikkvelgeren er flyttet til sidemenyen; butikk-merkelapp ved «Alle». | **BEHOLD** | meny |
| 21-102 | Kundekort oversikt | `/#/b/:butikk/kunder/:id` | Selger | PC 1440, Telefon 390 | ENDRET | v4 03 | v4 03 kundekort med faner som piller. Nå topplinje, tallrad 1/4 ×4 og kortlister 1/3 ×3. Runde 3: Seks faner (spm 2); Produkter og Dokumenter som lister på Oversikt. Runde 10: ny fane Avtaler (sju faner, Samtale og Avtaler under Mer på telefon). | **BEHOLD** | lenke fra 21-101 |
| 21-103 | Kundekort tilbud og ordre | `/#/b/:butikk/kunder/:id/tilbud` | Selger | PC 1440, Telefon 390 | ENDRET | v4 03 | Fane. Runde 3: Seks faner (spm 2). | **BEHOLD** | fane på 21-102 |
| 21-104 | Kundekort montering og saker | `/#/b/:butikk/kunder/:id/montering` | Selger | PC 1440, Telefon 390 | ENDRET | v4 03 | Fane. Runde 3: Seks faner (spm 2). | **BEHOLD** | fane på 21-102 |
| 21-105 | Kundekort fakturaer | `/#/b/:butikk/kunder/:id/fakturaer` | Selger | PC 1440, Telefon 390 | ENDRET | v4 03 | Fane. Runde 3: Seks faner (spm 2). | **BEHOLD** | fane på 21-102 |
| 21-106 | Kundekort filer | `/#/b/:butikk/kunder/:id/filer` | Selger | PC 1440, Telefon 390 | FINNES | v4 03 | Samme funksjon som v4 (v4 03). Nye farger og flisoppsett. Runde 3: Fanen heter Dokumenter (Filer og E-post samlet). | **BEHOLD** | fane på 21-102 |
| 21-107 | Kundekort e-post | `/#/b/:butikk/kunder/:id/epost` | Selger | PC 1440, Telefon 390 | FINNES | v4 03 | Samme funksjon som v4 (v4 03). Nye farger og flisoppsett. Runde 3: E-post ligger under fanen Dokumenter. | **BEHOLD** | fane på 21-102 |
| 21-108 | Samtaler (liste, S1) | `/#/b/:butikk/samtaler` | Selger | PC 1440, Telefon 390 | ENDRET | v4 02 | v4 02 Samtaler. Eget menypunkt med teller (S1); liste og panel er delt i 21-108 og 21-109. | **BEHOLD** | meny |
| 21-109 | Samtale på kunden | `/#/b/:butikk/kunder/:id/samtale` | Selger | PC 1440, Telefon 390 | FINNES | v4 03 (fanen Samtale), 02 | Samtalepanelet fra 02 er flyttet inn som fane på kundekortet med samme topp og tallrad som de andre fanene. Runde 3: Seks faner (spm 2). 19.10: meldingstråd (M16). | **BEHOLD** | fane på 21-102 |
| 21-110 | Ny kunde | `/#/b/:butikk/kunder/ny` | Selger | PC 1440, Telefon 390 | NY | 11-001, 11-002 | Ikke i v4. Ny i v5 (11-001, 11-002). | **BEHOLD** | topplinje |
| 21-111 | Leads / innboks | `/#/b/:butikk/leads` | Selger | PC 1440, Telefon 390 | ENDRET | v4 /innkommende (/leads), 03 | v4 /innkommende. Egen side med tall, tabell og valgt lead. | **BEHOLD** | lenke fra 21-004 |
| 21-112 | Fordel leads (KAM) | `/#/b/:butikk/fordel-leads` | KAM | PC 1440, Telefon 390 | NY | 11-014 | Ikke i v4. Ny i v5 (11-014). Runde 3: KAM-menyen: «Innboks». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-118 |
| 21-113 | Proffkunder (KAM) | `/#/b/:butikk/proffkunder` | KAM | PC 1440, Telefon 390 | ENDRET | v4 /prosjektsalg/proffkunder (crm 13) | v4 /prosjektsalg/proffkunder (bare i koden). Samlet side for KAM. Runde 3: KAM-menyen: «Innboks». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-118 |
| 21-114 | Unoterte (KAM) | `/#/b/:butikk/unoterte` | KAM | PC 1440 | FINNES | v4 crm 23 | Samme funksjon som v4 (v4 crm 23). Nye farger og flisoppsett. Runde 3: KAM-menyen: «Innboks». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-118 |
| 21-115 | Produkter hos kunden og produktkort (skuff) | `/#/b/:butikk/kunder/:id/produkter` | Selger | PC 1440, Telefon 390 | FINNES | v4 03 (S2, S3 Meld feil) | Samme funksjon som v4 (v4 03 (S2, S3 Meld feil)). Nye farger og flisoppsett. Runde 3: Produkter som kortliste på Oversikt, produktkortet som skuff. | **BEHOLD** | fane på 21-102 |
| 21-116 | Nytt firma (proffkunde) | `/#/b/:butikk/firma/ny` | Selger, KAM | PC 1440, Telefon 390 | NY | 11-001 | Ikke i v4. Ny i v5 (11-001). Runde 3: KAM-menyen: «Innboks». | **BEHOLD** | lenke fra 21-113 |
| 21-117 | Proffkundekort | `/#/b/:butikk/proffkunder/:id` | KAM, Selger | PC 1440 | NY | Løp 7 | Ny 19.10. Faner Oversikt · Avtaler · Tilbud og anbud · Ordre · Saker · Faktura · Kommunikasjon. (Bestilt som 21-114, som er opptatt.) | **BEHOLD** | lenke fra 21-113 |
| 21-118 | Proff (samleside) | `/#/b/:butikk/proff/:fane` | KAM | PC 1440 | NY | Runde 11 | Ny i runde 11. Samleside med fanene Proffkunder · Til fordeling · Unoterte · Innboks. Gamle adresser (/fordel-leads, /proffkunder, /unoterte, /innboks-bestilling) er aliaser. | **BEHOLD** | meny |
| 21-201 | Tilbud (liste, med salgstavle) | `/#/b/:butikk/tilbud` | Selger | PC 1440, Telefon 390 | ENDRET | v4 03, 04 | v4 03 Salgstavle og v4 04 Tilbud slått sammen: tavle og liste som faner. | **BEHOLD** | meny |
| 21-202 | Tilbudet (linjer, pris, avrunding, leveringstid, betalingsplan) | `/#/b/:butikk/tilbud/:id` | Selger | PC 1440, Telefon 390 | ENDRET | v4 04, crm 10 | v4 04/crm 10. Rabattgodkjenning er fjernet, retningslinjer for rabatt står i tilbudet. Runde 4: Ny fane Oversikt med Kunden, Pris og vilkår og Siste hendelser som kortlister; Linjer uten piller, «Legg til linje» som dialog (CET, leverandørlister, Tradeplace). Runde 3: Fanene Linjer · Tegninger · Tilvalg · Kalkyle · Vilkår · Dokumenter; «Legg til linje» med søk i katalog, leverandørlister og Tradeplace over linjene. 19.10: åtte faner (Oversikt · Fjordkjøkken · Andre leverandører · Kalkyle · Alternativer · Kontrollmåling · Send og kommunikasjon · Kontrakt). Runde 10: linja Betingelser i Pris og vilkår med «Endre», skuff med kampanjer, avtale og Spesielle, begrunnelse påkrevd; variant a (bare begrunnelse) og b (til godkjenning), varselpille når kampanjen er utgått. | **BEHOLD** | lenke fra 21-201 |
| 21-203 | Tegninger fra CET | `/#/b/:butikk/tilbud/:id/tegning/:tegningId` | Selger | PC 1440 | NY | 11-001 | Ikke i v4. Ny i v5 (11-001). Runde 3: Samme faner som 21-202. **→ 21-202 fane** (19.10) | **UTGÅR** | lenke fra 21-202 |
| 21-204 | Tilvalg på tilbudet | `/#/b/:butikk/tilbud/:id/tilvalg` | Selger | PC 1440 | FINNES | v4 04 | Samme funksjon som v4 (v4 04). Nye farger og flisoppsett. Runde 3: Samme faner som 21-202. **→ 21-202 fane Alternativer** (19.10) | **UTGÅR** | fane på 21-202 |
| 21-205 | Send til kunde (Penneo/BankID) | `/#/b/:butikk/tilbud/:id/send` | Selger | PC 1440, Telefon 390 | ENDRET | v4 04 | v4 04. Signering med BankID i Penneo. **→ 21-202 fane Send og kommunikasjon** (19.10) | **UTGÅR** | lenke fra 21-202 |
| 21-206 | Verktøy: Priseksempler | `/#/b/:butikk/tilbud/verktoy/priseksempler` | Selger | PC 1440, iPad 1024 | ENDRET | v4 10 | v4 10. Flyttet til Tilbud › Verktøy (S2). | **BEHOLD** | lenke fra 21-201 |
| 21-207 | Verktøy: Salgsbanken | `/#/b/:butikk/tilbud/verktoy/salgsbanken` | Selger | PC 1440 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. | **BEHOLD** | lenke fra 21-201 |
| 21-208 | Kalkyle (montering) | `/#/b/:butikk/tilbud/:id/kalkyle` | Selger | PC 1440 | FINNES | v4 16 | v4 16. Kalkylen bor i tilbudet; Excel-kalkylen utgår. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. **→ 21-202 fane Kalkyle** (19.10) | **UTGÅR** | fane på 21-202 |
| 21-209 | Anbud (rediger) | `/#/b/:butikk/anbud/:id` | KAM, Selger | PC 1440 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. Runde 3: KAM-menyen: «Innboks». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 21-112 |
| 21-210 | Anbud – tilbudsvisning | `/#/b/:butikk/anbud/:id/tilbud` | KAM, Selger | PC 1440 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. Runde 3: KAM-menyen: «Innboks». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-209 |
| 21-301 | Ordre (liste) | `/#/b/:butikk/ordre` | Selger | PC 1440, Telefon 390 | ENDRET | v4 05 | v4 05. Butikk-merkelapp ved «Alle». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | meny |
| 21-302 | Ordresiden med stegene | `/#/b/:butikk/ordre/:id` | Selger | PC 1440, Telefon 390 | NY | 11-015 | v4 05: fanene Bestillinger, Kontrollmål og Montasje er byttet mot åtte steg på én side. Runde 4: Arbeidsflisen OB-kontroll rett under stegraden, kortlistene nederst (3c); verktøylinja uten piller. Runde 3: Kortlistene opp, OB-kontroll under. Runde 4b: Ingen faner; Status-rad 1/3 ×3 nederst (Montering 17.11 · Endringsfrist 21.10 · Fakturert 77 310 kr av 257 700). 19.10: ni steg, Oversikt · Kontrollmåling · Dokumenter · Bestilling · Levering · Varemottak · Montering · KS · Faktura. | **BEHOLD** | lenke fra 21-301 |
| 21-303 | Steg Bestilling (leverandør, Tradeplace, benkeplate) | `/#/b/:butikk/ordre/:id/bestilling` | Selger, Bestilling | PC 1440, Telefon 390 | NY | 11-004, 11-015 | Ikke i v4. Ny i v5 (11-004, 11-015). 19.10: steg 4, OB-kontroll i utvidet rad. | **BEHOLD** | fane på 21-302 |
| 21-304 | Steg OB-kontroll | `/#/b/:butikk/ordre/:id/ob` | Selger, Bestilling | PC 1440, Telefon 390 | NY | 11-004, 11-015 | Ikke i v4. Ny i v5 (11-004, 11-015). Runde 4: Arbeidsflisen (OB fra leverandøren) rett under stegraden, statusflisene nederst (3c). Runde 3: Statusflisene opp, OB-tabellen under. **Utgår → 21-303** (19.10) | **UTGÅR** | fane på 21-302 |
| 21-305 | Steg Levering og leveringsdag | `/#/b/:butikk/ordre/:id/levering` | Selger | PC 1440, Telefon 390 | NY | 11-015 | Ikke i v4. Ny i v5 (11-015). Runde 4: Arbeidsflisen Leveranser rett under stegraden, statusflisene nederst (3c). Rettet i S-68: Stegraden vannrett øverst uten trekkspill (regel 4), fliser for steget Levering under; topplinje etter regel 8. 19.10: steg 5. | **BEHOLD** | fane på 21-302 |
| 21-306 | Steg Varemottak | `/#/b/:butikk/ordre/:id/varemottak` | Selger | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. Runde 4: Arbeidsflisen Kolli rett under stegraden, statusflisene nederst (3c). 19.10: steg 6. | **BEHOLD** | fane på 21-302 |
| 21-307 | Steg Montering (oppstart, montørfirma) | `/#/b/:butikk/ordre/:id/montering` | Selger, Montasjeleder | PC 1440, Telefon 390 | NY | 11-015 | Ikke i v4. Ny i v5 (11-015). Runde 4: Arbeidsflisen Monteringsdagene rett under stegraden, statusflisene nederst (3c). Rettet i S-68: Stegraden vannrett øverst uten trekkspill (regel 4), fliser for steget Montering under; topplinje etter regel 8. 19.10: steg 7, meldingstråd. | **BEHOLD** | fane på 21-302 |
| 21-308 | Steg Kontrollmål | `/#/b/:butikk/ordre/:id/kontrollmal` | Selger, Montasjeleder | PC 1440, iPad 1024 | ENDRET | v4 crm 18 | v4 crm 18. På nettbrett, ikke papir. 19.10: steg 2 Kontrollmåling. | **BEHOLD** | fane på 21-302 |
| 21-309 | Steg Befaring | `/#/b/:butikk/ordre/:id/befaring/:id` | Selger | PC 1440, iPad 1024, Telefon 390 | ENDRET | v4 14 | v4 14. Befaring som steg i ordren. | **BEHOLD** | fane på 21-302 |
| 21-310 | Steg Ferdigmelding og KS | `/#/b/:butikk/ordre/:id/ks` | Selger, Montasjeleder | PC 1440, Telefon 390 | NY | 11-004, 11-015 | Ikke i v4. Ny i v5 (11-004, 11-015). Runde 4: Arbeidsflisen KS-punkter rett under stegraden, statusflisene nederst (3c). 19.10: steg 8 KS. | **BEHOLD** | fane på 21-302 |
| 21-311 | Steg Faktura | `/#/b/:butikk/ordre/:id/faktura` | Selger, Økonomi | PC 1440 | NY | 11-015 | Ikke i v4. Ny i v5 (11-015). Runde 4: Arbeidsflisen Betalingsplan rett under stegraden, statusflisene nederst (3c). Rettet i S-68: Stegraden vannrett øverst uten trekkspill (regel 4), fliser for steget Faktura under; topplinje etter regel 8. 19.10: steg 9. | **BEHOLD** | fane på 21-302 |
| 21-312 | Restordrer | `/#/b/:butikk/ordre/:id/levering#rest` | Selger | PC 1440 | NY | Dagens app, S-68 | v4 /rest var egen side. Nå under steget Levering. | **BEHOLD** | lenke fra 21-305 |
| 21-313 | Endringsfrist og OB-dato | `/#/b/:butikk/ordre/:id#frist` | Selger | PC 1440 | ENDRET | v4 05 | v4 05. Endringsfrist og OB-dato som statusfliser i ordren. **Utgår → 21-302** (19.10) | **UTGÅR** | lenke fra 21-302 |
| 21-316 | Hvitevarer på ordren | `/#/b/:butikk/ordre/:id#hvitevarer` | Selger | PC 1440 | FINNES | v4 05 (P1) | Samme funksjon som v4 (v4 05 (P1)). Nye farger og flisoppsett. | **BEHOLD** | lenke fra 21-302 |
| 21-317 | Ordrebekreftelser (liste) | `/#/b/:butikk/ordrebekreftelser` | Bestilling | PC 1440, Telefon 390 | NY | 11-004, 11-005 | Ikke i v4. Ny i v5 (11-004, 11-005). | **BEHOLD** | lenke fra 21-715 |
| 21-401 | Kalender (Outlook) | `/#/b/:butikk/kalender` | Selger | PC 1440, Telefon 390 | NY | v4 /activities, /team (Kalender), S-68 | v4 /activities gikk til Min dag. Nå eget menypunkt Kalender. 19.10: Hjemmebesøk oppretter befaring. | **BEHOLD** | meny |
| 21-402 | Frister | `/#/b/:butikk/kalender/frister` | Selger | PC 1440 | ENDRET | v4 /frister (01) | v4 /frister var alias for Min dag. Nå fane under Kalender. | **BEHOLD** | fane på 21-401 |
| 21-403 | Oppfølging | `/#/b/:butikk/kalender/oppfolging` | Selger | PC 1440, Telefon 390 | ENDRET | v4 01 | v4 01 filteret Oppfølging. Nå fane under Kalender. 19.10: Gjelder Tilbud · Kunde. | **BEHOLD** | fane på 21-401 |
| 21-501 | Saker (liste) | `/#/b/:butikk/saker` | Selger | PC 1440, Telefon 390 | ENDRET | v4 09 | v4 09 Saker. Heter Reklamasjoner i menyen. | **BEHOLD** | meny |
| 21-502 | Saken | `/#/b/:butikk/saker/:id` | Selger | PC 1440, Telefon 390 | FINNES | v4 09 | Samme funksjon som v4 (v4 09). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 21-501 |
| 21-503 | Reklamasjon og retting (montasjeleder) | `/#/b/:butikk/reklamasjon` | Montasjeleder | PC 1440, iPad 1024 | NY | v4 /saker/:id, /belastninger (09), S-68 | v4 09 og /belastninger. Egen side for montasjeleder. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | meny |
| 21-504 | Punkter (felles ord) | `–` | Alle | PC 1440, iPad 1024, Telefon 390 | NY | 11-019 A9, DS readme | Ikke i v4. Ny i v5 (11-019 A9, DS readme). | **BEHOLD** | lenke fra 21-502 |
| 21-505 | Meld en feil fra nettsiden (uten innlogging) | `hengsel.no/:butikk/reklamasjon` | Kunde (ikke i CRM) | PC 1440, Telefon 390 | NY | Løp 6 | Ny 19.10. Blir sak uten kunde i 21-501, «fra nettsiden». (Bestilt som 21-504, som er opptatt.) | **BEHOLD** | egen adresse |
| 21-601 | Mine tall selger | `/#/b/:butikk/mine-tall` | Selger | PC 1440, Telefon 390 | NY | S-68 | v4 /resultater og /data for selger. Sum og fordeling per butikk ved «Alle». Runde 11: fane på Min dag (21-004). /mine-tall er alias. | **BEHOLD** | fane på 21-004 |
| 21-602 | Rapporter | `/#/rapporter` | Butikkleder, Ledergruppen | PC 1440, Telefon 390 | NY | 11-007, 11-008 | Ikke i v4. Ny i v5 (11-007, 11-008). Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 21-707 |
| 21-603 | Fakturaer (liste) | `/#/b/:butikk/fakturaer` | Økonomi | PC 1440 | ENDRET | v4 crm 14 | Ny layout etter layout-reglene. | **BEHOLD** | lenke fra 21-605 |
| 21-604 | Faktura | `/#/b/:butikk/fakturaer/:id` | Økonomi | PC 1440 | ENDRET | v4 crm 16 | Ny layout etter layout-reglene. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 21-603 |
| 21-605 | Økonomi (samleside) | `/#/b/:butikk/okonomi/:fane` | Økonomi | PC 1440 | NY | Runde 11 | Ny i runde 11. Samleside med fanene Økonomikontroll · Milepælsfaktura · Forskudd til Nobia (midlertidig). /okonomi og /innstillinger/forskudd er aliaser. | **BEHOLD** | meny |
| 21-701 | Prosjekter (liste) | `/#/b/:butikk/prosjekter` | Prosjektleder | PC 1440 | FINNES | v4 crm 12 | Samme funksjon som v4 (v4 crm 12). Nye farger og flisoppsett. | **BEHOLD** | meny |
| 21-702 | Prosjektet | `/#/b/:butikk/prosjekter/:id` | Prosjektleder | PC 1440 | FINNES | v4 crm 12 | Samme funksjon som v4 (v4 crm 12). Nye farger og flisoppsett. Runde 10: ny fane Avtaler (bestilt som 21-703, se A43). Runde 11: fanene Tilvalg og Milepælsfaktura. | **BEHOLD** | lenke fra 21-701 |
| 21-703 | Tilvalg (prosjektleder, S3) | `/#/b/:butikk/prosjekter/:id/tilvalg` | Prosjektleder | PC 1440 | ENDRET | v4 17 | v4 17 Tilvalg mot standard med nye farger (S3). Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-702 |
| 21-704 | Milepælsfaktura | `/#/b/:butikk/prosjekter/:id/faktura` | Prosjektleder | PC 1440 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | fane på 21-702 |
| 21-705 | Prosjektplan | `/#/b/:butikk/prosjektplan` | Prosjektleder | PC 1440 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. | **BEHOLD** | lenke fra 21-702 |
| 21-706 | Prosjektavtaler | `/#/b/:butikk/prosjektavtaler` | Prosjektleder, KAM | PC 1440 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. Runde 3: KAM-menyen: «Innboks». Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-710 |
| 21-707 | Butikken (samleside) | `/#/b/:butikk/butikken/:fane` | Butikkleder | PC 1440 | NY | 11-013 | Ikke i v4. Ny i v5 (11-013). Runde 4: Tabellen per selger tilbake rett under tallraden; fordeling og diagram nederst. Runde 3: Fordeling og diagram opp, tabellen per selger under. Runde 11: samleside med fanene Tall per selger · Trenger deg · Rabatt · Betingelser · Budsjett og team · Utstillinger · Resultatkort montørfirmaer. Første fane er den som har mest som venter. | **BEHOLD** | meny |
| 21-708 | Trenger deg | `/#/b/:butikk/butikken/trenger-deg` | Butikkleder | PC 1440 | NY | 11-013 | Ikke i v4. Ny i v5 (11-013). Rettet i S-68: Tallrad 1/3 ×3 og Trenger deg som tabell 1/1; topplinje etter regel 8. | **BEHOLD** | fane på 21-707 |
| 21-709 | Rabattoversikt | `/#/b/:butikk/butikken/rabatt` | Butikkleder | PC 1440 | NY | S-68 | Erstatter rabattgodkjenning og rabattmatriser. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-707 |
| 21-710 | Betingelser | `/#/b/:butikk/butikken/betingelser` | Butikkleder | PC 1440 | ENDRET | v4 crm 21 | Runde 10: nytt navn (tidligere Prisliste og kampanjer). Faner Kampanjer · Kundeavtaler · Prosjektavtaler · Spesielle · Prisliste; kolonner Navn · Type · Gjelder for · Gyldig fra–til · Status · Brukt på; verktøylinja søk · Ny betingelse · Kopier. | **BEHOLD** | fane på 21-707 |
| 21-710b | Betingelsesskjema | `/#/b/:butikk/butikken/betingelser/:id` | Butikkleder | PC 1440 | NY | Runde 10 | Ny i runde 10. Ett skjema for kampanje, kundeavtale, prosjektavtale og spesielle: topp, matrisetabell per produktgruppe/serie, egen tabell for andre leverandører, kobling til kunde eller prosjekt. | **BEHOLD** | lenke fra 21-710 |
| 21-711 | Budsjett og team | `/#/b/:butikk/butikken/budsjett` | Butikkleder | PC 1440 | ENDRET | v4 crm 04, 23 | v4 /team og /budgets samlet under Butikken. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-707 |
| 21-712 | Resultatkort montørfirmaer (med belastninger, S6) | `/#/b/:butikk/butikken/montorfirmaer` | Butikkleder | PC 1440 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-707 |
| 21-713 | Utstillinger | `/#/b/:butikk/butikken/utstillinger` | Butikkleder | PC 1440, iPad 1024 | ENDRET | v4 10 | v4 10. Under Butikken og som fane under Produkter (S2). | **BEHOLD** | fane på 21-707 |
| 21-714 | Økonomikontroll (PowerOffice) | `/#/b/:butikk/okonomi` | Økonomi, Admin | PC 1440 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | fane på 21-605 |
| 21-715 | Innboks | `/#/b/:butikk/innboks-bestilling` | KAM, Bestilling | PC 1440, Telefon 390 | NY | 11-004, 11-014 | Ikke i v4. Ny i v5 (11-004, 11-014). Runde 4: Tittel «Innboks» med bestilling@nordli.no under; antall i fanene. Runde 3: Heter «Innboks». | **BEHOLD** | meny |
| 21-716 | Bestilling (liste) | `/#/b/:butikk/bestilling` | Bestilling | PC 1440 | ENDRET | v4 06 | v4 06 Bestilling. Bare for tillegget Bestilling; stegene ligger i ordren. | **BEHOLD** | fane på 21-715 |
| 21-717 | Bestilling › Innboks med forslag | `/#/b/:butikk/bestilling/innboks` | Bestilling | PC 1440 | NY | 11-004 | Ikke i v4. Ny i v5 (11-004). | **BEHOLD** | fane på 21-715 |
| 21-801 | Montasjeplan (kapasitet alle/per butikk) | `/#/b/:butikk/montasjeplan` | Montasjeleder | PC 1440, iPad 1024 | NY | 11-016 | Ikke i v4. Ny i v5 (11-016). Runde 3: Samme mønster: kortlistene opp, kapasitetstabellen under. Runde 11: fanen Ressurser (21-807). | **BEHOLD** | meny |
| 21-802 | Kontrollmål (liste) | `/#/b/:butikk/kontrollmal` | Montasjeleder | PC 1440, iPad 1024 | ENDRET | v4 07, 11-016 | Ny layout etter layout-reglene. | **BEHOLD** | meny |
| 21-803 | Montørfirmaer | `/#/b/:butikk/montorfirmaer` | Montasjeleder | PC 1440 | FINNES | v4 crm 03 | Samme funksjon som v4 (v4 crm 03). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. Runde 11: fanene Fakturaer (21-806) og Resultatkort. | **BEHOLD** | meny |
| 21-804 | KS og ferdigmelding | `/#/b/:butikk/ks` | Montasjeleder | PC 1440, iPad 1024 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | meny |
| 21-805 | Etterkalkyle | `/#/b/:butikk/etterkalkyle` | Montasjeleder | PC 1440 | FINNES | v4 16 | Samme funksjon som v4 (v4 16). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | meny |
| 21-806 | Montørfakturaer (belastninger) | `/#/b/:butikk/montorfakturaer` | Montasjeleder | PC 1440, iPad 1024 | NY | 11-016 | Ikke i v4. Ny i v5 (11-016). Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | fane på 21-803 |
| 21-807 | Ressurser (ressursplan) | `/#/b/:butikk/ressurser` | Montasjeleder | PC 1440 | ENDRET | v4 10, crm 20 | v4 10/crm 20 Ressurser. I montasjeleder-menyen (S2). | **BEHOLD** | fane på 21-801 |
| 21-901 | Innstillinger (oversikt) | `/#/innstillinger` | Admin | PC 1440, Telefon 390 | ENDRET | v4 11, crm 01, 60-214 | v4 11/crm 01. Undermenyen fra 60-214. Runde 11: fliser per avsnitt. Avsnittene er menypunktene for admin som ikke selger. Prisliste er flyttet til Butikken › Betingelser. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 21-902 | Brukere og roller (v5-roller og tillegg) | `/#/innstillinger/brukere` | Admin | PC 1440, Telefon 390 | ENDRET | v4 crm 05, 11-011 | v4 crm 05. Fem roller og fire tillegg (11-011). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-903 | Butikker | `/#/innstillinger/butikker` | Admin | PC 1440, Telefon 390 | NY | 60-214 | Ikke i v4. Ny i v5 (60-214). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-904 | Automatikk og funksjoner | `/#/innstillinger/automatikk` | Admin | PC 1440, Telefon 390 | NY | 60-214 | Ikke i v4. Ny i v5 (60-214). Runde 4: Antall i fanene (Funksjoner 5 · Automatikk 4); verktøylinja med «Status ▾». Runde 3: Funksjoner og Automatikk i hver sin fane. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-905 | Prisliste | `/#/innstillinger/prisliste` | Admin | PC 1440, Telefon 390 | FINNES | v4 crm 11 | Samme funksjon som v4 (v4 crm 11). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | fane på 21-710 |
| 21-906 | Leveringstid og betalingsplan | `/#/innstillinger/levering` | Admin | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-907 | Leverandører og hovedleverandør | `/#/innstillinger/leverandorer` | Admin | PC 1440, Telefon 390 | ENDRET | v4 11 | v4 11 Leverandører med hovedleverandør. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-908 | Tradeplace | `/#/innstillinger/tradeplace` | Admin | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-909 | Penneo og Vipps | `/#/innstillinger/penneo` | Admin | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-910 | E-postmaler | `/#/innstillinger/maler` | Admin | PC 1440, Telefon 390 | FINNES | v4 crm 02 | Samme funksjon som v4 (v4 crm 02). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-911 | Budsjett | `/#/innstillinger/budsjett` | Admin | PC 1440, Telefon 390 | FINNES | v4 crm 04 | Samme funksjon som v4 (v4 crm 04). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-912 | Forskudd til Nobia (midlertidig) | `/#/innstillinger/forskudd` | Admin | PC 1440, Telefon 390 | FINNES | v4 crm 23 | Samme funksjon som v4 (v4 crm 23). Nye farger og flisoppsett. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | fane på 21-605 |
| 21-913 | Vis som | `–` | Admin | PC 1440, Telefon 390 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | topplinje |
| 21-914 | Utseende (Klassisk / Nytt uttrykk) | `/#/innstillinger/utseende` | – | –, Telefon 390 | SKJULT | v4 11 | Fjernet: Fjernet i koden (K-85). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **FJERN** | lenke fra 21-901 |
| 21-915 | Anmeldelser | `/#/innstillinger/anmeldelser` | Admin | PC 1440, Telefon 390 | NY | 11-001 | Ikke i v4. Ny i v5 (11-001). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-916 | Innlogging med Microsoft (oppsett) | `/#/innstillinger/innlogging` | Admin | PC 1440, Telefon 390 | NY | 11-007 | Ikke i v4. Ny i v5 (11-007). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-917 | Revisjonslogg | `/#/innstillinger/logg` | Admin | PC 1440, Telefon 390 | NY | 11-007 | Ikke i v4. Ny i v5 (11-007). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-918 | Integrasjoner per kunde | `/#/innstillinger/integrasjoner` | Admin | PC 1440, Telefon 390 | NY | 11-007 | Ikke i v4. Ny i v5 (11-007). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-919 | Moduler | `/#/innstillinger/moduler` | Admin | PC 1440, Telefon 390 | FINNES | v4 crm 50 | Samme funksjon som v4 (v4 crm 50). Nye farger og flisoppsett. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-920 | Innstillinger for løpet | `/#/innstillinger/lopet` | Admin, Butikkleder | PC 1440, Telefon 390 | NY | Runde 8 | Ny 19.10. Møtetyper, kontrollmåling, fakturaregler, KS-OK, domener, Comactivity. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 21-901 |
| 21-921 | Merkevare | `/#/innstillinger/merkevare` | Superadmin, hengsel_drift | PC 1440, Telefon 390 | NY | D-12 | Ny 20.10 (D-12 punkt 8). Kundetema per kjede: skjema, forhåndsvisning og kontrastsjekk. | **BEHOLD** | lenke fra 21-901 |
| 22-001 | Innlogging | `ute://logg-inn` | Alle i appen | Telefon 390, iPad 1024 | NY | Dagens app, S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander, eget iPad-oppsett, e-post og passord, Ekte/Demo, Face ID og varsler. | **BEHOLD** | app |
| 22-002 | Mine oppdrag | `ute://oppdrag` | Montør, Servicemontør | Telefon 390, iPad 1024 | NY | 11-018, DS hengsel-ute | Ikke i v4. Ny i v5 (11-018, DS hengsel-ute). Rettet i S-68: Hovedknappen «Start neste oppdrag» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander, eget iPad-oppsett. | **BEHOLD** | app |
| 22-003 | Oppdraget (med butikk-merkelapp, S9) | `ute://oppdrag/:id` | Montør | Telefon 390, iPad 1024 | NY | 11-018 | Ikke i v4. Ny i v5 (11-018). Rettet i S-68: Hovedknappen «Start jobben» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-004 | Tegning | `ute://oppdrag/:id/tegning` | Montør | Telefon 390, iPad 1024 | ENDRET | v4 crm 33 | v4 crm 33 Romtegning med nål. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander, eget iPad-oppsett. | **BEHOLD** | app |
| 22-005 | Montørspesifikasjon | `ute://oppdrag/:id/spesifikasjon` | Montør | Telefon 390 | NY | v4 spesifikasjon T05, S-68 | Ikke i v4. Ny i v5 (v4 spesifikasjon T05, S-68). D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-006 | Punkter og bilder | `ute://oppdrag/:id/punkter` | Montør | Telefon 390, iPad 1024 | NY | 11-018 | Ikke i v4. Ny i v5 (11-018). Rettet i S-68: Hovedknappen «Nytt punkt med bilde» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander, eget iPad-oppsett. | **BEHOLD** | app |
| 22-007 | Timer | `ute://timer` | Montør | Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-008 | Ferdigmelding med kundesignatur | `ute://oppdrag/:id/ferdig` | Montør | Telefon 390 | NY | 11-018 | Ikke i v4. Ny i v5 (11-018). Rettet i S-68: Hovedknappen «Ferdigmeld» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-009 | Utkjøring (utkjører) | `ute://leveranser` | Utkjører | Telefon 390 | NY | 11-018 | Ikke i v4. Ny i v5 (11-018). Rettet i S-68: Hovedknappen «Start levering» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-010 | Firmaleder: oversikt og fakturaer | `ute://firma` | Firmaleder | Telefon 390, iPad 1024 | NY | 11-018 | Ikke i v4. Ny i v5 (11-018). Rettet i S-68: Hovedknappen «Fordel oppdrag» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander, eget iPad-oppsett. | **BEHOLD** | app |
| 22-011 | Servicemontør | `ute://service` | Servicemontør | Telefon 390 | NY | 11-018 | Ikke i v4. Ny i v5 (11-018). Rettet i S-68: Hovedknappen «Start jobben» fast nederst (regel 5); innholdet som fliser 1/1 i telefonramme. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-012 | Selgermodus (S4: Kunder, Oppfølging, kunde, logg) | `ute://selger` | Selger | Telefon 390 | ENDRET | v4 crm 34 | v4 crm 34 Selgermodus (S4). D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-013 | Uten nett (kø og varsel) | `–` | Alle i appen | Telefon 390, iPad 1024 | NY | 11-009 | Ikke i v4. Ny i v5 (11-009). D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-014 | Profil og språk | `ute://profil` | Alle i appen | Telefon 390 | NY | Dagens app (seks språk), S-68 | Finnes i dagens app, ikke tegnet i v4. Tegnet i S-68. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-015 | Varsler | `ute://varsler` | Montør, Firmaleder | Telefon 390 | NY | montorapp Varsler, S-68 | Ikke i v4. Ny i v5, tegnet i S-68. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-016 | Meldinger på jobben | `ute://jobb/:id/meldinger` | Montør | Telefon 390, iPad 1024 | NY | Runde 7 | Ny 19.10. Samme tråd som 21-307. | **BEHOLD** | app |
| 22-017 | Varemottak med avvik | `ute://jobb/:id/varemottak` | Montør | Telefon 390, iPad 1024 | NY | Runde 7 | Ny 19.10. Avvik går til selgeren med en gang. | **BEHOLD** | app |
| 22-018 | Rettejobb | `ute://rettejobb/:id` | Montør | Telefon 390, iPad 1024 | NY | Runde 7 | Ny 19.10. Fra 21-502/21-503, Utføres av. | **BEHOLD** | app |
| 22-019 | Kontrollmåling (jobbtype) | `ute://jobb/:id/kontrollmaling` | Montør | Telefon 390, iPad 1024 | NY | Runde 7 | Ny 19.10. Fra 23-016, fyller 21-202/21-302. | **BEHOLD** | app |
| 22-020 | Lager (ekspress) | `ute://lager` | Utkjører | Telefon 390 | NY | v4 crm 47 | Fjernet: Tegnes ikke. Runde 3: Tilbake som side for utkjører i Hengsel Ute: ut i dag og mottatt, med plass. Runde 11: tidligere 21-314. Ute-side, derfor 22-nummer. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 22-021 | Skanner | `ute://skann` | Utkjører | Telefon 390 | NY | Dagens app | Fjernet: Tegnes ikke. Runde 3: Tilbake som side for utkjører: strekkode på kolli kobles til ordre og levering. Runde 11: tidligere 21-315. Ute-side, derfor 22-nummer. D-12: palett-ute lys og mørk, bunnmeny med teller, tilstander. | **BEHOLD** | app |
| 23-001 | Inngang med kode (SMS) | `/min/lenke/:lenke` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). | **BEHOLD** | e-post/SMS |
| 23-002 | Min side | `/min` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). | **BEHOLD** | lenke fra 23-001 |
| 23-003 | Tilbudet | `/min/tilbud/:id` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 23-002 |
| 23-004 | Tegningene med kommentarer | `/min/tilbud/:id/tegning` | Kunde | Telefon 390, PC 1440 | ENDRET | v4 12 | v4 12 Tegningene, i butikkens uttrykk. | **BEHOLD** | lenke fra 23-002 |
| 23-005 | Tilvalg med pris | `/min/tilbud/:id/tilvalg` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. **Utgår 19.10 → 23-003** | **UTGÅR** | lenke fra 23-002 |
| 23-006 | Signering (BankID) | `/min/tilbud/:id/signer` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). **Utgår 19.10 → 23-017** | **UTGÅR** | lenke fra 23-002 |
| 23-007 | Status etter signering | `/min/tilbud/:id/status` | Kunde | Telefon 390, PC 1440 | ENDRET | v4 12 (Reisen) | v4 12 Reisen er byttet mot de samme stegene som ordren, forenklet. **Utgår 19.10 → 23-017** | **UTGÅR** | lenke fra 23-002 |
| 23-008 | Bekreft leveringsdag (S8) | `/min/leveringsdag/:token` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). **Utgår 19.10 → 23-018** | **UTGÅR** | e-post/SMS |
| 23-009 | Varemottak (S8) | `/min/tilbud/:id/varemottak` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). | **BEHOLD** | e-post/SMS |
| 23-010 | Bekreft montering (S8) | `/min/bekreft/:token` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). **Utgår 19.10 → 23-018** | **UTGÅR** | e-post/SMS |
| 23-011 | Betaling (fakturaer, PowerOffice) | `/min/betaling` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 23-002 |
| 23-012 | Dokumenter (tilbud, kjøpsavtale, FDV – S5) | `/min/dokumenter` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). | **BEHOLD** | lenke fra 23-002 |
| 23-013 | Meld en feil (reklamasjon, åpen) | `/reklamasjon` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal | Ikke i v4. Ny i v5 (DS kundeportal). | **BEHOLD** | egen adresse |
| 23-014 | Spørreskjema etter levering | `/min/sporreskjema` | Kunde | Telefon 390, PC 1440 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | e-post/SMS |
| 23-015 | Skriv til selgeren | `/min/samtale` | Kunde | Telefon 390, PC 1440 | NY | DS kundeportal, svar 10 (17.10) | Ikke i v4. Ny side 17.10 (runde 2). **Utgår 19.10 → 23-019** | **UTGÅR** | lenke fra 23-002 |
| 23-016 | Kontrollmåling | `/min/tilbud/:id/kontrollmaling` | Kunde | Telefon 390, PC 1440 | NY | Runde 6 | Ny 19.10. Tre valg sett fra kunden. | **BEHOLD** | e-post/SMS |
| 23-017 | Kontrakt og signering | `/min/tilbud/:id/kontrakt` | Kunde | Telefon 390, PC 1440 | NY | Runde 6 | Ny 19.10. BankID i Penneo, forskudd etter signering. Erstatter 23-006/007. | **BEHOLD** | lenke fra 23-002 |
| 23-018 | Ordren | `/min/ordre/:id` | Kunde | Telefon 390, PC 1440 | NY | Runde 6 | Ny 19.10. Kundens steg; levering som info. Erstatter 23-008/010. | **BEHOLD** | lenke fra 23-002 |
| 23-019 | Meldinger | `/min/meldinger` | Kunde | Telefon 390, PC 1440 | NY | Runde 6 | Ny 19.10. Tråd per sak med vedlegg. Erstatter 23-015. | **BEHOLD** | lenke fra 23-002 |
| 24-001 | Inngang | `/prosjekt/lenke/:lenke` | Entreprenør | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | e-post/SMS |
| 24-002 | Prosjektet | `/prosjekt/:id` | Entreprenør | PC 1440, Telefon 390 | ENDRET | v4 crm 45, 46 | v4 crm 45/46 Prosjektportal. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. | **BEHOLD** | lenke fra 24-001 |
| 24-003 | Enheter og tilvalg | `/prosjekt/:id/enheter` | Entreprenør, kjøper | PC 1440, Telefon 390 | ENDRET | v4 17 (portalens Tilvalg) | v4 17 portalens tilvalg. | **BEHOLD** | fane på 24-002 |
| 24-004 | Dokumenter | `/prosjekt/:id/dokumenter` | Entreprenør | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | fane på 24-002 |
| 24-005 | Status og milepæler | `/prosjekt/:id/status` | Entreprenør | PC 1440, Telefon 390 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | fane på 24-002 |
| 25-001 | Forside («En dag i butikken», «Bygget for», film) | `hengsel.no/` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-002 | CRM | `hengsel.no/crm` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-003 | Hengsel Ute | `hengsel.no/ute` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-004 | Kundeportal | `hengsel.no/kundeportal` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-005 | Integrasjoner | `hengsel.no/integrasjoner` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-006 | Priser | `hengsel.no/priser-og-demo` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-007 | Demo (skjema) | `hengsel.no/priser-og-demo#demo` | Alle | PC 1440, Telefon 390 | NY | DS nettside | Ikke i v4. Ny i v5 (DS nettside). | **BEHOLD** | egen adresse |
| 25-008 | For butikkleder | `hengsel.no/for-butikkleder` | Alle | PC 1440, Telefon 390 | KOMMER | S-68 (plassholder) | Ikke i v4. Plassholder til teksten kommer. | **BEHOLD** | egen adresse |
| 25-009 | Kunder og referanser | `hengsel.no/kunder` | Alle | PC 1440, Telefon 390 | KOMMER | S-68 (plassholder) | Ikke i v4. Plassholder til teksten kommer. | **BEHOLD** | egen adresse |
| 25-010 | Om oss | `hengsel.no/om-oss` | Alle | PC 1440, Telefon 390 | KOMMER | S-68 (plassholder) | Ikke i v4. Plassholder til teksten kommer. | **BEHOLD** | egen adresse |
| 25-011 | Personvern og vilkår | `hengsel.no/personvern` | Alle | PC 1440, Telefon 390 | NY | hengsel.no, S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | egen adresse |
| 25-012 | Bli tester | `hengsel.no/apptest` | Alle | PC 1440, Telefon 390 | NY | hengsel.no, S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | egen adresse |
| 26-001 | Innlogging (Access) | `admin.hengsel.no/` | Hengsel | PC 1440, Telefon 390 | NY | 60-201, S-68 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander, Access med e-postkode og ingen tilgang. | **BEHOLD** | egen adresse |
| 26-002 | Kunder, eiere og butikker | `admin.hengsel.no/eiere` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA3, 60-202 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. Runde 4b: Bare antall som faner; beløp, datoer og prosent i Status-rad 1/3 nederst. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-003 | Prisliste (versjonert) | `admin.hengsel.no/innstillinger/prisliste` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA9, S-43 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. Runde 4: Versjonene som faner (2026.2 utkast valgt, status «Utkast»); pakker, Hengsel Ute og tillegg, kjederabatt og support under hverandre. Runde 3: Pakker, Hengsel Ute og tillegg, og Kjederabatt og vilkår i hver sin fane. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-004 | Avtale og Penneo | `admin.hengsel.no/avtaler` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA7 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. Runde 4: Antall i fanene (Alle 6 · Utkast 1 · Til signering 1 · Signert 4 · Fornyes snart 2); verktøylinja med «Eier ▾». Runde 3: Avtaler, Signering og Dokumenter og vilkår i hver sin fane. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-005 | Pakke per butikk og prisberegner | `admin.hengsel.no/eiere/:id/prisberegner` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA4, SA5 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. Runde 4: Bare tabellen Pakke per butikk; verktøylinja Produktlinje ▾ · Legg til butikk · Fjern. Runde 3: Per butikk, Hele eieren, Sum per måned og Etablering i hver sin fane. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-006 | Tilbud-PDF | `admin.hengsel.no/tilbud/:id/pdf` | Hengsel | A4 | NY | 60-203 SA6 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 26-005 |
| 26-007 | Excel-import | `admin.hengsel.no/eiere/import` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA3 (import) | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 26-002 |
| 26-008 | Tilbakemeldinger | `admin.hengsel.no/innstillinger/tilbakemeldinger` | Hengsel (superadmin) | PC 1440, Telefon 390 | NY | v4 /tilbakemeldinger, S-68 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-009 | Salg (muligheter og tavle) | `admin.hengsel.no/salg` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA1, SA2, SA8, 60-202 | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. Runde 3: Fem kolonner; Tapt som filter (spm 26). D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-010 | Innstillinger (leverandør) | `admin.hengsel.no/innstillinger/leverandor` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA9 (Leverandør) | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | meny |
| 26-011 | Støtte | `admin.hengsel.no/stotte` | Hengsel | PC 1440, Telefon 390 | KOMMER | 60-205 (meny), 60-207 fase B | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander, nøytral Kommer-side utenfor menyen. | **BEHOLD** | meny |
| 26-012 | Fakturering | `admin.hengsel.no/fakturering` | Hengsel | PC 1440, Telefon 390 | KOMMER | 60-205 (meny), 60-207 fase C | Ikke i v4. Fase A (S-62) tegnet på nytt i Hengsel-designsystemet 17.10. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander, nøytral Kommer-side utenfor menyen. | **BEHOLD** | meny |
| 26-013 | Eierkort | `admin.hengsel.no/eiere/:id` | Hengsel | PC 1440, Telefon 390 | NY | 60-201 SA4, svar 27 (17.10) | Ikke i v4. Ny side 17.10 (runde 2). Runde 4: Rad 2: Butikker og Tidslinje som Liste 1/2 + 1/2. Runde 3: Rad 2 delt i to: Kontaktpersoner og Muligheter og tilbud, øverst. D-12: Admin-paletten (lilla), Admin-logo og favicon, tilstander. | **BEHOLD** | lenke fra 26-002 |
| 27-001 | Butikkens tavle | `/#/tv` | TV-bruker | TV | NY | Dagens app, S-68 | v4 /tv (dagens app). Lys, flisoppsett. | **BEHOLD** | egen adresse |
| 27-002 | Alle butikker | `/#/tv/alle` | TV-bruker | TV | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | egen adresse |
| 28-001 | E-posttopp og bunn | `–` | – | E-post | NY | DS templates/epost | Ikke i v4. Ny i v5 (DS templates/epost). | **BEHOLD** | e-post/SMS |
| 28-002 | Tilbud sendt | `–` | – | E-post | ENDRET | v4 crm 40 | v4 crm 40 E-post. Butikkens uttrykk (S5). | **BEHOLD** | e-post/SMS |
| 28-003 | Kontrakt til signering | `–` | – | E-post | ENDRET | v4 crm 41 | v4 crm 41 Kjøpsavtale. Butikkens uttrykk (S5). | **BEHOLD** | e-post/SMS |
| 28-004 | Ordrebekreftelse | `–` | – | E-post | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | e-post/SMS |
| 28-005 | Leveringsdag | `–` | – | E-post | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | e-post/SMS |
| 28-006 | Ferdigmelding | `–` | – | E-post | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | e-post/SMS |
| 28-007 | Spørreskjema | `–` | – | E-post | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | e-post/SMS |
| 28-008 | Tilbuds-PDF | `–` | – | A4 | ENDRET | v4 crm 43 | v4 crm 43 Tilbud-PDF. Butikkens uttrykk (S5). | **BEHOLD** | lenke fra 21-202 |
| 28-009 | Kjøpsavtale | `–` | – | A4 | ENDRET | v4 crm 41 | v4 crm 41. Butikkens uttrykk (S5). | **BEHOLD** | lenke fra 23-017 |
| 28-010 | OB-PDF | `–` | – | A4 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | lenke fra 21-304 |
| 28-011 | FDV | `–` | – | A4 | NY | S-68 | Ikke i v4. Ny i v5, tegnet i S-68. | **BEHOLD** | lenke fra 23-012 |
| 29-001 | Tom-, laste- og feiltilstander | `–` | – | PC 1440, iPad 1024, Telefon 390 | NY | DS Tilstand | Ikke i v4. Ny i v5 (DS Tilstand). | **BEHOLD** | egen adresse |
| 29-002 | Dialoger og skuffer | `–` | – | PC 1440, iPad 1024, Telefon 390 | NY | DS Dialog, Ark, Skuff | Ikke i v4. Ny i v5 (DS Dialog, Ark, Skuff). | **BEHOLD** | egen adresse |
| 29-003 | Tabell | `–` | – | PC 1440 | NY | DS Tabell | Ikke i v4. Ny i v5 (DS Tabell). | **BEHOLD** | egen adresse |
| 29-004 | Flisklasser (alle) | `–` | – | PC 1440, iPad 1024, Telefon 390 | NY | DS Flis, LAYOUT-REGLER | Ikke i v4. Ny i v5 (DS Flis, LAYOUT-REGLER). | **BEHOLD** | egen adresse |
| 29-005 | Ikoner og piller | `–` | – | PC 1440, iPad 1024, Telefon 390 | NY | DS Ikon, Statuspille | Ikke i v4. Ny i v5 (DS Ikon, Statuspille). | **BEHOLD** | egen adresse |
| 29-006 | Datoer, beløp og tall | `–` | – | PC 1440, iPad 1024, Telefon 390 | NY | DS readme | Ikke i v4. Ny i v5 (DS readme). | **BEHOLD** | egen adresse |

## Tall per status

| Status | Antall |
|---|---|
| FINNES | 18 |
| ENDRET | 42 |
| NY | 124 |
| KOMMER | 5 |
| SKJULT | 1 |
| **Sum** | **190** |

Forslag: BEHOLD 189, ENDRE 0, FJERN 1.


## v4-ruter og numre

Alle ruter i `docs/design/v4/systemoversikt/sider.md` (web og montørappen) med nummeret de har fått. Omdirigeringene har ikke egen side.

| v4-rute | Nr. |
|---|---|
| `/` | 21-003 |
| `/min-dag` | 21-004 |
| `/frister` | 21-402 |
| `/resultater` | 21-601 |
| `/leder` | 21-006 |
| `/team` | 21-711 |
| `/budgets` | 21-711 |
| `/etterkalkyle` | 21-805 |
| `/bestilling` | 21-716 |
| `/utstillinger` | 21-713 |
| `/utstillinger/:id` | 21-713 |
| `/forskudd-nobia` | 21-912 |
| `/unoterte-leverandor` | 21-114 |
| `/innkommende` | 21-111 |
| `/innboks` | 21-111 |
| `/leads` | 21-111 |
| `/samtaler` | 21-108 |
| `/salgstavle` | 21-201 |
| `/customers` | 21-101 |
| `/customers/:id` | 21-102 |
| `/quotes` | 21-201 |
| `/quotes/:id` | 21-202 |
| `/priseksempler` | 21-206 |
| `/hurtigpris` | 21-206 |
| `/priseksempler/ny` | 21-206 |
| `/priseksempler/oppsett` | 21-710 |
| `/priseksempler/:id` | 21-206 |
| `/priseksempler/:id/prislapp` | 21-206 |
| `/utstillingsmodeller` | 21-713 |
| `/orders` | 21-301 |
| `/orders/:id` | 21-302 |
| `/orders/:id/kontrollmal` | 21-308 |
| `/orders/:id/befaring/:installasjonId` | 21-309 |
| `/rest` | 21-312 |
| `/projects` | 21-701 |
| `/projects/:id` | 21-702 |
| `/prosjektavtaler` | 21-706 |
| `/anbud/:id` | 21-209 |
| `/anbud/:id/tilbud` | 21-210 |
| `/prosjektsalg` | 21-113 |
| `/prosjektsalg/oppfolging` | 21-113 |
| `/prosjektsalg/proffkunder` | 21-113 |
| `/prosjektsalg/avtaler` | 21-706 |
| `/prosjektsalg/avtaler/:id` | 21-706 |
| `/prosjektsalg/prosjekt/:id` | 21-113 |
| `/prosjektsalg/logg` | 22-012 |
| `/prosjektsalg/referat/:id` | 21-113 |
| `/prosjektsalg/kunde/:id` | 21-113 |
| `/montasje` | 21-801 |
| `/montasjeplan` | 21-801 |
| `/montering` | 21-208 |
| `/montering/:id` | 21-208 |
| `/prosjektplan` | 21-705 |
| `/saker` | 21-501 |
| `/saker/:id` | 21-502 |
| `/belastninger` | 21-806 |
| `/invoices` | 21-603 |
| `/invoices/:id` | 21-604 |
| `/data` | 21-602 |
| `/salgsbanken` | 21-207 |
| `/salgsbanken/innstillinger` | 21-207 |
| `/profile` | 21-011 |
| `/tv` | 27-001 |
| `/tilbakemeldinger` | 26-008 |
| `/ressurser` | 21-807 |
| `/ressurser/leverandor` | 21-907 |
| `/help (og /help/projects, /offers, /orders, /invoices)` | 21-012 |
| `/settings` | 21-901 |
| `/settings/brukere` | 21-902 |
| `/settings/moduler` | 21-919 |
| `/settings/automatikk` | 21-904 |
| `/settings/maler` | 21-910 |
| `/settings/kundevarsler` | 21-910 |
| `/settings/vilkar` | 21-901 |
| `/settings/tilvalg` | 21-703 |
| `/settings/rabattmatriser` | 21-709 |
| `/settings/oppfolging` | 21-403 |
| `/settings/montorer` | 21-803 |
| `/settings/montasjefirma` | 21-803 |
| `/settings/monteringssatser` | 21-803 |
| `/settings/montering-dg` | 21-805 |
| `/settings/montasje` | 21-801 |
| `/settings/ks-maler` | 21-804 |
| `/settings/oppstartsimport` | 26-007 |
| `/settings/leverandorer` | 21-907 |
| `/settings/leverandorer/:id/produkter` | 21-905 |
| `/settings/leveringspartnere` | 21-907 |
| `/settings/leverandor` | 21-907 |
| `/login` | 21-001 |
| `/set-password` | 21-002 |
| `/shared/:token` | 23-012 |
| `/tilbud/:token` | 23-003 |
| `/pris/:token` | 21-206 |
| `/montor/:token` | 22-005 |
| `/tegning` | 22-004 |
| `/reklamasjon` | 23-013 |
| `/min` | 23-002 |
| `/min/lenke/:lenke` | 23-001 |
| `/min/bekreft/:token` | 23-010 |
| `/min/leveringsdag/:token` | 23-008 |
| `/min/tilbud/:id` | 23-003 |
| `/min/tilbud/:id/tegning` | 23-004 |
| `/min/tilbud/:id/tilvalg` | 23-005 |
| `/min/tilbud/:id/status` | 23-007 |
| `/min/tilbud/:id/levering/:del` | 23-008 |
| `/min/tilbud/:id/tillegg` | 23-005 |
| `/min/tilbud/:id/varemottak` | 23-009 |
| `/min/samtale` | 23-002 |
| `* (Fant ikke siden)` | 21-013 |
| `/dashboard, /activities, /my-page, /rapporter, /settings/utseende, /settings/montering, /utseende-test (omdirigeringer)` | – |
| `montorapp I dag, Uke, Kommende, Ferdige` | 22-002 |
| `montorapp Forespørsler` | 22-010 |
| `montorapp Kontrollmål (fane, ansatt)` | 21-802 |
| `montorapp Kunder, Oppfølging, Selger: kunde, Selger: logg besøk` | 22-012 |
| `montorapp Profil, Språk` | 22-014 |
| `montorapp Jobb, Kontrollmål, Varekontroll` | 22-003 |
| `montorapp KS, Hvitevarer, Ferdig montert` | 22-008 |
| `montorapp Avvik, Tillegg, Restpunkt, Vareavvik` | 22-006 |
| `montorapp Tegning` | 22-004 |
| `montorapp Belastninger` | 22-010 |
| `montorapp Varsler` | 22-015 |
| `montorapp Innlogging` | 22-001 |

## v4-ruter uten nummer

Ingen. To ruter manglet nummer og har fått det i S-68: `/tilbakemeldinger` → 26-008 Tilbakemeldinger, og Varsler i montørappen → 22-015 Varsler. Begge står som forslag i 20-000.

| Nr. | Navn | Rute | Hvem ser den | Enheter | Status | Kilde | Endret mot v4 | Forslag | Vei inn |
|---|---|---|---|---|---|---|---|---|---|
| 28-032 | Leveringsinfo til kunden | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 30-e12-leveringsinfo (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-033 | Forskuddsfaktura ved signatur | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 31-e13-forskuddsfaktura (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-034 | Sluttfaktura på fabrikkdato | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 32-e14-sluttfaktura (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-035 | Alt er bestilt | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 33-e15-alt-er-bestilt (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-036 | Kvittering på sak fra nettsiden | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 34-e16-kvittering-nettsiden (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-037 | Ny melding fra selgeren | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 35-e17-ny-melding (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-038 | Bekreftelse på bestilt kontrollmåling | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 36-e18-kontrollmaling-bestilt (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | e-post/SMS |
| 28-039 | Tilbuds-PDF med alternativer | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 37-tilbud-med-alternativer (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | lenke fra 21-202 |
| 28-040 | Kontrakt-PDF med valgt alternativ | – | Kunde | E-post / PDF | NY | Runde 8 | Mal: 38-kjopsavtale-med-alternativ (laget i runde 9). Kundetema og «Levert av Hengsel» som før. | **BEHOLD** | lenke fra 23-017 |
