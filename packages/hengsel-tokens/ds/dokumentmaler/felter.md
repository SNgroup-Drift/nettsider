# Flettefelt i dokumentmalene

409 felt i 51 objekter, samlet fra `felter.json` i de 28 malene (eksport fra CRM_v4, 18.10.2026). Alle er nye (NY), unntatt `kunde.*`, som kommer fra kundetemaet. Feltform `{{objekt.felt}}`. Lister skrives `{{#liste}}…{{/liste}}`, og «hvis ikke» skrives `{{^x}}…{{/x}}`. Felt med `[]` er felt per rad i en liste. Kolonnen «Maler» viser malnumrene.

## kunde (3)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `kunde.kortnavn` | tekst | Kjøkkenstudio | 28 |
| `kunde.logo_lys` | tekst |  | 01, 02, 03, 04, 05, 06, 07, 08, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27 |
| `kunde.navn` | tekst | Kjøkkenstudio Hamar | 01, 02, 03, 04, 05, 06, 07, 08, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27 |

## butikk (9)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `butikk.adresse` | tekst | Storgata 1, 2317 Hamar | 01, 03, 05, 06, 07, 08, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 27 |
| `butikk.by` | tekst | Hamar | 12, 13 |
| `butikk.epost` | tekst | post@demo.invalid | 08, 11, 13, 17, 18, 19, 20, 21, 22, 23, 27 |
| `butikk.faktura_epost` | tekst | faktura@demo.invalid | 06 |
| `butikk.kontonr` | tekst | 0000 00 00000 | 16 |
| `butikk.navn` | tekst | Kjøkkenstudio Hamar | 01, 03, 06, 08, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 27 |
| `butikk.orgnr` | tekst | 999 999 999 | 05, 06, 07, 15, 16 |
| `butikk.selskap` | tekst | Kjøkkenstudio Hamar AS | 05, 06, 07 |
| `butikk.telefon` | tekst | 970 06 500 | 07, 08, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 27 |

## kjoper (6)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `kjoper.adresse` | tekst | Furuvegen 12, 2312 Ottestad | 01, 05, 11, 12, 14, 15, 16 |
| `kjoper.epost` | tekst | ola@demo.invalid | 05, 11 |
| `kjoper.fornavn` | tekst | Ola | 18 |
| `kjoper.kundenr` | tekst | 10355 | 05, 16 |
| `kjoper.navn` | tekst | Kari Nordmann | 01, 02, 04, 05, 11, 12, 14, 15, 16, 24, 25, 26 |
| `kjoper.telefon` | tekst | 000 00 046 | 05, 11 |

## proffkunde (6)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `proffkunde.adresse` | tekst | Storgata 14, 2317 Hamar | 06 |
| `proffkunde.epost` | tekst | lena@demo.invalid | 06 |
| `proffkunde.kontakt` | tekst | Per Prosjektleder | 03, 06 |
| `proffkunde.navn` | tekst | Byggmester Demo AS | 03, 06 |
| `proffkunde.orgnr` | tekst | 912 345 678 | 06 |
| `proffkunde.telefon` | tekst | 900 00 610 | 06 |

## selger (4)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `selger.epost` | tekst | kari@demo.invalid | 01, 03, 05, 06 |
| `selger.fornavn` | tekst | Kari | 18, 19 |
| `selger.navn` | tekst | Kari Selger | 01, 02, 03, 05, 06, 07, 11, 15, 16, 19, 27 |
| `selger.telefon` | tekst | 000 00 047 | 01, 03, 05, 06, 18, 27 |

## leverandor (1)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `leverandor.navn` | tekst | Leverandør A | 03, 06 |

## tilbud (33)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `tilbud.betalingsplan` | liste |  | 01 |
| `tilbud.betalingsplan[].belop` | tekst |  | 01 |
| `tilbud.betalingsplan[].navn` | tekst |  | 01 |
| `tilbud.bilde` | tekst |  | 18 |
| `tilbud.dato` | tekst | 8. oktober 2026 | 01 |
| `tilbud.grupper` | liste |  | 01 |
| `tilbud.grupper[].linjer` | liste |  | 01 |
| `tilbud.grupper[].linjer[].antall` | tekst |  | 01 |
| `tilbud.grupper[].linjer[].beskrivelse` | tekst |  | 01 |
| `tilbud.grupper[].linjer[].pos` | tekst |  | 01 |
| `tilbud.grupper[].linjer[].pris` | tekst |  | 01 |
| `tilbud.grupper[].navn` | tekst |  | 01 |
| `tilbud.grupper[].sum` | tekst |  | 01 |
| `tilbud.gyldig_til` | tekst | 7. november 2026 | 01, 18 |
| `tilbud.gyldig_til_kort` | tekst | 7. november | 01 |
| `tilbud.innhold` | liste |  | 01 |
| `tilbud.innhold[].navn` | tekst |  | 01 |
| `tilbud.innhold[].verdi` | tekst |  | 01 |
| `tilbud.modell` | tekst | Fluted eik | 18 |
| `tilbud.nr` | tekst | 10418 | 01, 05, 18 |
| `tilbud.prisgrupper` | liste |  | 01 |
| `tilbud.prisgrupper[].belop` | tekst |  | 01 |
| `tilbud.prisgrupper[].navn` | tekst |  | 01 |
| `tilbud.rom` | tekst | Kjøkken | 01, 18 |
| `tilbud.status` | valg |  | 01 |
| `tilbud.status[].tilbud.status` | tekst |  | 01 |
| `tilbud.tegninger` | liste |  | 01 |
| `tilbud.tegninger[].hoyde` | tekst |  | 01 |
| `tilbud.tegninger[].tittel` | tekst |  | 01 |
| `tilbud.tegninger[].url` | tekst |  | 01 |
| `tilbud.tittel` | tekst | Kjøkkenet til Kari Nordmann | 01 |
| `tilbud.total` | tekst | 189 900 kr | 01, 18 |
| `tilbud.versjon` | tekst | 3 | 01, 05 |

## tilvalg (12)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `tilvalg.dager_igjen` | tekst | 6 | 24 |
| `tilvalg.frist` | tekst | 20. oktober 2026 | 02, 24 |
| `tilvalg.linjer` | liste |  | 02, 24 |
| `tilvalg.linjer[].navn` | tekst |  | 24 |
| `tilvalg.linjer[].omrade` | tekst |  | 02 |
| `tilvalg.linjer[].pris` | tekst |  | 02, 24 |
| `tilvalg.linjer[].standard` | tekst |  | 02 |
| `tilvalg.linjer[].valg` | tekst |  | 02 |
| `tilvalg.sendt` | tekst | 8. oktober 2026 | 02 |
| `tilvalg.sum` | tekst | + 14 900 kr | 02, 24 |
| `tilvalg.tegning` | tekst |  | 02 |
| `tilvalg.versjon` | tekst | 2 | 02 |

## anbud (38)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `anbud.antall_totalt` | tekst | 48 | 03 |
| `anbud.dato` | tekst | 8. oktober 2026 | 03 |
| `anbud.etapper` | liste |  | 03 |
| `anbud.etapper[].naar` | tekst |  | 03 |
| `anbud.etapper[].nr` | tekst |  | 03 |
| `anbud.etapper[].omfang` | tekst |  | 03 |
| `anbud.garanti_tekst` | tekst | skap og fronter 10 år, benkeplater 5 år, montering 5 år. | 03 |
| `anbud.gyldig_dager` | tekst | 60 | 03 |
| `anbud.hvitevarer_tekst` | tekst | Etter egen liste (vedlegg 2). Kan leveres av entreprenør; da | 03 |
| `anbud.ingress` | tekst | 48 leiligheter i tre typer. | 03 |
| `anbud.losning_tittel` | tekst | Tre kjøkken, én linje | 03 |
| `anbud.materialgrupper` | liste |  | 03 |
| `anbud.materialgrupper[].navn` | tekst |  | 03 |
| `anbud.materialgrupper[].valg` | liste |  | 03 |
| `anbud.materialgrupper[].valg[].bilde` | tekst |  | 03 |
| `anbud.materialgrupper[].valg[].navn` | tekst |  | 03 |
| `anbud.nokkeltall` | liste |  | 03 |
| `anbud.nokkeltall[].tall` | tekst |  | 03 |
| `anbud.nokkeltall[].tekst` | tekst |  | 03 |
| `anbud.nr` | tekst | A-2026-031 | 03 |
| `anbud.omfang` | tekst | Kjøkken og garderobe | 03 |
| `anbud.priser` | liste |  | 03 |
| `anbud.priser[].antall` | tekst |  | 03 |
| `anbud.priser[].per_enhet` | tekst |  | 03 |
| `anbud.priser[].sum` | tekst |  | 03 |
| `anbud.priser[].type` | tekst |  | 03 |
| `anbud.tittel` | tekst | Kjøkken til Fjordhagen | 03 |
| `anbud.total` | tekst | 2 762 600 kr | 03 |
| `anbud.typer` | liste |  | 03 |
| `anbud.typer[].antall` | tekst |  | 03 |
| `anbud.typer[].egenskaper` | liste |  | 03 |
| `anbud.typer[].egenskaper[].navn` | tekst |  | 03 |
| `anbud.typer[].egenskaper[].verdi` | tekst |  | 03 |
| `anbud.typer[].kode` | tekst |  | 03 |
| `anbud.typer[].navn` | tekst |  | 03 |
| `anbud.vedlegg` | liste |  | 03 |
| `anbud.vedlegg[].navn` | tekst |  | 03 |
| `anbud.vedlegg[].nr` | tekst |  | 03 |

## avtale (12)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `avtale.fra` | tekst | 01.11.2026 | 06 |
| `avtale.garanti_tekst` | tekst | 25 års garanti på skrog og 5 år på fronter | 06 |
| `avtale.levering_eksempel` | tekst | uke 45 | 06 |
| `avtale.omfang` | tekst | kjøkken, bad og garderobe fra Leverandør A | 06 |
| `avtale.omfang_kort` | tekst | kjøkken og garderobe | 06 |
| `avtale.omrade` | tekst | Hamar | 06 |
| `avtale.rabatter` | liste |  | 06 |
| `avtale.rabatter[].gruppe` | tekst |  | 06 |
| `avtale.rabatter[].merknad` | tekst |  | 06 |
| `avtale.rabatter[].rabatt` | tekst |  | 06 |
| `avtale.rabattmatrise` | tekst | Lokal proff standard | 06 |
| `avtale.til` | tekst | 31.10.2027 | 06 |

## ordre (38)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `ordre.adresse` | tekst | Oppdiktet gate 4 | 19, 20, 21, 22, 23 |
| `ordre.avtale` | tekst | K-10412 | 15 |
| `ordre.bekreftet` | tekst | 20.10.2026 | 15 |
| `ordre.bestillinger` | liste |  | 15 |
| `ordre.bestillinger[].hva` | tekst |  | 15 |
| `ordre.bestillinger[].leverandor` | tekst |  | 15 |
| `ordre.bestillinger[].status` | tekst |  | 15 |
| `ordre.betaling` | liste |  | 05 |
| `ordre.betaling[].belop` | tekst |  | 05 |
| `ordre.betaling[].navn` | tekst |  | 05 |
| `ordre.betalingsfrist` | tekst | 14 dager | 05 |
| `ordre.dato` | tekst | 8. oktober 2026 | 05 |
| `ordre.endringsfrist` | tekst | 20. oktober | 05 |
| `ordre.forskudd` | tekst | 86 100 kr | 15 |
| `ordre.forskudd_betalt` | tekst | 18.10 | 15 |
| `ordre.innbaering` | tekst | Inn i rom | 05 |
| `ordre.innhold` | liste |  | 05 |
| `ordre.innhold[].navn` | tekst |  | 05 |
| `ordre.innhold[].verdi` | tekst |  | 05 |
| `ordre.levering` | tekst | Uke 45 · 3.–6. november | 15 |
| `ordre.leveringsadresse` | tekst | Furuvegen 12, 2312 Ottestad | 05 |
| `ordre.linjer` | liste |  | 15 |
| `ordre.linjer[].antall` | tekst |  | 15 |
| `ordre.linjer[].belop` | tekst |  | 15 |
| `ordre.linjer[].beskrivelse` | tekst |  | 15 |
| `ordre.modell` | tekst | Form · Jordnær Leire | 15 |
| `ordre.montering` | tekst | Ja · oppstart avtales ca. 2 uker før | 05, 15 |
| `ordre.nr` | tekst | 10412 | 05, 07, 11, 12, 13, 15, 16 |
| `ordre.onsket_levering` | tekst | Uke 46 | 05 |
| `ordre.pris` | liste |  | 05 |
| `ordre.pris[].belop` | tekst |  | 05 |
| `ordre.pris[].navn` | tekst |  | 05 |
| `ordre.rest` | tekst | 200 900 kr | 15 |
| `ordre.rom` | tekst | Kjøkken | 05, 15, 19, 20, 21, 22, 23 |
| `ordre.signert` | tekst | 12.10.2026 | 15 |
| `ordre.sum` | tekst | 287 000 kr | 15 |
| `ordre.tittel` | tekst | Kjøkken Nordmann | 15 |
| `ordre.total` | tekst | 210 625 kr | 05 |

## bestilling (11)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `bestilling.adresse` | tekst | Oppdiktet gate 4, Hamar | 27 |
| `bestilling.flere` | tekst | 20 | 27 |
| `bestilling.kundenr` | tekst | SSI-0412 | 27 |
| `bestilling.levering` | tekst | uke 50 | 27 |
| `bestilling.linjer` | liste |  | 27 |
| `bestilling.linjer[].antall` | tekst |  | 27 |
| `bestilling.linjer[].navn` | tekst |  | 27 |
| `bestilling.nr` | tekst | O-10398 | 27 |
| `bestilling.onsket` | tekst | Uke 50, til Hamar | 27 |
| `bestilling.svaradresse` | tekst | bestilling@demo.invalid | 27 |
| `bestilling.vedlegg` | tekst | O-10398.xml (CET) · Bestilling_O-10398.pdf | 27 |

## faktura (15)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `faktura.a_betale` | tekst | 200 900 kr | 16 |
| `faktura.dato` | tekst | 12.11.2026 | 16 |
| `faktura.forfall` | tekst | 26.11.2026 · 14 dager | 16 |
| `faktura.fradrag` | liste |  | 16 |
| `faktura.fradrag[].belop` | tekst |  | 16 |
| `faktura.fradrag[].tekst` | tekst |  | 16 |
| `faktura.kid` | tekst | 000000000000 | 16 |
| `faktura.linjer` | liste |  | 16 |
| `faktura.linjer[].antall` | tekst |  | 16 |
| `faktura.linjer[].belop` | tekst |  | 16 |
| `faktura.linjer[].beskrivelse` | tekst |  | 16 |
| `faktura.mva` | tekst | 40 180 kr | 16 |
| `faktura.nr` | tekst | F-2088 | 16 |
| `faktura.sum_ordre` | tekst | 287 000 kr | 16 |
| `faktura.type` | tekst | Sluttfaktura | 16 |

## montering (8)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `montering.dato` | tekst | 7. oktober 2026 | 12 |
| `montering.ks_bilde` | tekst |  | 23 |
| `montering.periode` | tekst | 11.–14. desember | 23 |
| `montering.signert` | tekst | 7. oktober 2026 kl. 15.42 | 12 |
| `montering.start` | tekst | Mandag 15. desember kl. 07.30 | 21 |
| `montering.tid` | tekst | 6.–7. oktober · 14,5 timer | 12 |
| `montering.tittel` | tekst | Kjøkken, Kari Nordmann | 12 |
| `montering.varighet` | tekst | 4 dager, ferdig torsdag | 21 |

## oppdrag (16)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `oppdrag.befaring` | liste |  | 11 |
| `oppdrag.befaring[]` | tekst |  | 11 |
| `oppdrag.dagsplan` | liste |  | 11 |
| `oppdrag.dagsplan[].arbeid` | tekst |  | 11 |
| `oppdrag.dagsplan[].dag` | tekst |  | 11 |
| `oppdrag.dagsplan[].merk` | tekst |  | 11 |
| `oppdrag.kolli` | liste |  | 11 |
| `oppdrag.kolli[]` | tekst |  | 11 |
| `oppdrag.kontakter` | liste |  | 11 |
| `oppdrag.kontakter[].kontakt` | tekst |  | 11 |
| `oppdrag.kontakter[].rolle` | tekst |  | 11 |
| `oppdrag.periode` | tekst | 15.–18. desember 2026 | 11 |
| `oppdrag.punkter` | liste |  | 11 |
| `oppdrag.punkter[]` | tekst |  | 11 |
| `oppdrag.tilgang` | tekst | Hjemme fra kl. 07. Nøkkel i boks, kode fra selger. | 11 |
| `oppdrag.tittel` | tekst | Nordmann, Hamar · Form eik | 11 |

## rapport (20)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `rapport.adresse` | tekst | Furuvegen 12, 2320 Furnes | 04 |
| `rapport.antall_bilder` | tekst | 6 | 04 |
| `rapport.antall_mal` | tekst | 13 | 04 |
| `rapport.antall_omrader` | tekst | 3 | 04 |
| `rapport.apne` | tekst | 2 | 13 |
| `rapport.dato` | tekst | 6.11.2026 | 04 |
| `rapport.faser` | liste |  | 13 |
| `rapport.faser[].antall` | tekst |  | 13 |
| `rapport.faser[].navn` | tekst |  | 13 |
| `rapport.forsidebilde` | tekst |  | 04 |
| `rapport.generert` | tekst | 11.12.2026 09.14 | 13 |
| `rapport.laget` | tekst | 11.12.2026 | 13 |
| `rapport.laget_av` | tekst | Montøren | 13 |
| `rapport.lost` | tekst | 4 | 13 |
| `rapport.mal_mangler` | tekst | 2 | 04 |
| `rapport.montert` | tekst | 10.12.2026 | 13 |
| `rapport.oversiktsbilde` | tekst |  | 13 |
| `rapport.tittel` | tekst | Nordmann, Hamar · Form eik | 13 |
| `rapport.totalt` | tekst | 7 | 13 |
| `rapport.utgatt` | tekst | 1 | 13 |

## plan (17)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `plan.dager` | liste |  | 10 |
| `plan.dager[]` | tekst |  | 10 |
| `plan.montorer` | liste |  | 10 |
| `plan.montorer[].dager` | liste |  | 10 |
| `plan.montorer[].dager[].jobb` | liste |  | 10 |
| `plan.montorer[].dager[].jobb[].kunde` | tekst |  | 10 |
| `plan.montorer[].dager[].jobb[].ordre` | tekst |  | 10 |
| `plan.montorer[].dager[].jobb[].vis.adresse` | liste |  | 10 |
| `plan.montorer[].dager[].jobb[].vis.adresse[].adresse` | tekst |  | 10 |
| `plan.montorer[].dager[].jobb[].vis.adresse[].telefon` | tekst |  | 10 |
| `plan.montorer[].dager[].jobb[].vis.kolli` | liste |  | 10 |
| `plan.montorer[].dager[].jobb[].vis.kolli[].kolli` | tekst |  | 10 |
| `plan.montorer[].navn` | tekst |  | 10 |
| `plan.montorer[].type` | tekst |  | 10 |
| `plan.periode` | tekst | 12.–16. oktober 2026 | 10 |
| `plan.skrevet_ut` | tekst | 12.10 | 10 |
| `plan.uke` | tekst | 42 | 10 |

## prosjekt (2)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `prosjekt.entreprenor` | tekst | Byggmester Demo AS | 02 |
| `prosjekt.navn` | tekst | Fjordhagen | 02, 03, 24 |

## enhet (1)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `enhet.nr` | tekst | H0304 | 02, 24, 25, 26 |

## levering (5)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `levering.dag` | tekst | Torsdag 11. desember | 20 |
| `levering.kolli` | tekst | 24 kolli, ca. 2 paller | 20 |
| `levering.svarfrist` | tekst | mandag 8. desember | 20 |
| `levering.tidsrom` | tekst | 08.00–12.00 | 20 |
| `levering.utkjorer` | tekst | Kjøkkenstudio Hamar, ring 30 min før | 20 |

## utkjoring (13)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `utkjoring.adresse` | tekst | Strandvegen 12 B, leilighet H0201, 2317 Hamar | 07 |
| `utkjoring.ankomst` | tekst | 09.40 | 22 |
| `utkjoring.beskjed` | tekst | Nøkkel i byggeboden. Bær inn på kjøkkenet. Emballasje tas me | 07 |
| `utkjoring.dato` | tekst | Tirsdag 3.11 | 07 |
| `utkjoring.innbaering` | tekst | IB2 · 2. etasje | 07 |
| `utkjoring.kolli` | tekst | 24 | 22 |
| `utkjoring.kontakt` | tekst | Jonas Moe · 900 00 731 | 07 |
| `utkjoring.nr` | tekst | UT-2026-0391-1 | 07 |
| `utkjoring.prosjekt` | tekst | Mjøsbygg AS · Strandvegen B · leilighet 4 | 07 |
| `utkjoring.sendt` | tekst | 29.10.2026 | 07 |
| `utkjoring.sum_kolli` | tekst | 18 | 07 |
| `utkjoring.tidsrom` | tekst | 12–16 | 07 |
| `utkjoring.utkjorer` | tekst | Kjell, Kjøkkenstudio Hamar | 22 |

## utkjorer (3)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `utkjorer.adresse` | tekst | Alnabruveien 10, 0668 Oslo | 07 |
| `utkjorer.firma` | tekst | Oslo transportsentral | 07 |
| `utkjorer.kontakt` | tekst | Per Lager | 07 |

## kolli (5)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `kolli` | liste |  | 07 |
| `kolli[].antall` | tekst |  | 07 |
| `kolli[].innhold` | tekst |  | 07 |
| `kolli[].merking` | tekst |  | 07 |
| `kolli[].nr` | tekst |  | 07 |

## etikett (7)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `etikett.av` | tekst | 18 | 28 |
| `etikett.innhold` | tekst | Benkeplate | 28 |
| `etikett.kode` | tekst | HU-7K3Q9F | 28 |
| `etikett.n` | tekst | 5 | 28 |
| `etikett.ordre` | tekst | 10412 | 28 |
| `etikett.qr` | tekst |  | 28 |
| `etikett.uke` | tekst | 41 | 28 |

## etiketter (11)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `etiketter` | liste |  | 09 |
| `etiketter[].tom` | liste |  | 09 |
| `etiketter[].tom[].av` | tekst |  | 09 |
| `etiketter[].tom[].butikk.navn` | tekst |  | 09 |
| `etiketter[].tom[].innhold` | tekst |  | 09 |
| `etiketter[].tom[].kode` | tekst |  | 09 |
| `etiketter[].tom[].leverandor` | tekst |  | 09 |
| `etiketter[].tom[].n` | tekst |  | 09 |
| `etiketter[].tom[].ordre` | tekst |  | 09 |
| `etiketter[].tom[].qr` | tekst |  | 09 |
| `etiketter[].tom[].uke` | tekst |  | 09 |

## vis (12)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `vis.bilde` | valg |  | 01, 03, 05, 06 |
| `vis.bilde[].anbud.bilde_om_oss` | tekst |  | 03 |
| `vis.bilde[].anbud.forsidebilde` | tekst |  | 03 |
| `vis.bilde[].avtale.forsidebilde` | tekst |  | 06 |
| `vis.bilde[].ordre.forsidebilde` | tekst |  | 05 |
| `vis.bilde[].tilbud.forsidebilde` | tekst |  | 01 |
| `vis.bilder` | valg |  | 12 |
| `vis.bilder[].bilder` | valg |  | 12 |
| `vis.bilder[].bilder[].tekst` | tekst |  | 12 |
| `vis.bilder[].bilder[].url` | tekst |  | 12 |
| `vis.illustrasjon` | valg |  | 06 |
| `vis.illustrasjon[].avtale.illustrasjon` | tekst |  | 06 |

## dok (1)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `dok.sider` | tekst | 5 | 01, 02, 03, 04, 05, 06, 07, 08, 10, 11, 12, 13, 14, 15, 16 |

## vilkar (1)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `vilkar.versjon` | tekst | 2026.2 | 01, 05 |

## bilde (3)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `bilde.minikart` | tekst |  | 04 |
| `bilde.navn` | tekst | Bilde 1 | 04 |
| `bilde.url` | tekst |  | 04 |

## bilde2 (7)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `bilde2.mal` | liste |  | 04 |
| `bilde2.mal[].mangler` | liste |  | 04 |
| `bilde2.mal[].navn` | tekst |  | 04 |
| `bilde2.mal[].nr` | tekst |  | 04 |
| `bilde2.mal[].verdi` | tekst |  | 04 |
| `bilde2.navn` | tekst | Bilde 2 | 04 |
| `bilde2.url` | tekst |  | 04 |

## epost (4)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `epost.bunnlinje` | tekst | Svar gjerne direkte i Min side. | 17, 18, 19, 20, 21, 22, 23 |
| `epost.forhandstekst` | tekst | Koden din til Min side er 902200. Den varer i 10 minutter. | 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27 |
| `epost.knapp` | tekst | Se tilbudet | 18, 19, 20, 21, 22, 23, 24, 25, 26 |
| `epost.lenke` | tekst | # | 18, 19, 20, 21, 22, 23, 24, 25, 26 |

## fdv (7)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `fdv.antall` | tekst | 6 | 14 |
| `fdv.grupper` | liste |  | 14 |
| `fdv.grupper[].dokumenter` | liste |  | 14 |
| `fdv.grupper[].dokumenter[].produkt` | tekst |  | 14 |
| `fdv.grupper[].dokumenter[].type` | tekst |  | 14 |
| `fdv.grupper[].leverandor` | tekst |  | 14 |
| `fdv.oppdatert` | tekst | 10.12.2026 | 14 |

## for_etter (6)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `for_etter` | liste |  | 13 |
| `for_etter[].etter` | tekst |  | 13 |
| `for_etter[].for` | tekst |  | 13 |
| `for_etter[].merknad` | tekst |  | 13 |
| `for_etter[].ref` | tekst |  | 13 |
| `for_etter[].tittel` | tekst |  | 13 |

## garanti (5)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `garanti` | liste |  | 01, 05, 14 |
| `garanti[].lengde` | tekst |  | 14 |
| `garanti[].navn` | tekst |  | 01, 05, 14 |
| `garanti[].tekst` | tekst |  | 14 |
| `garanti[].verdi` | tekst |  | 01, 05 |

## instruks (1)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `instruks.versjon` | tekst | 2026-10 | 08 |

## jobb (1)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `jobb.nr` | tekst | 24318 | 04 |

## kode (2)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `kode.minutter` | tekst | 10 | 17 |
| `kode.visning` | tekst | 902 200 | 17 |

## ks (4)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `ks` | liste |  | 12 |
| `ks[].kontroll` | tekst |  | 12 |
| `ks[].ok` | liste |  | 12 |
| `ks[].punkt` | tekst |  | 12 |

## mal (4)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `mal` | liste |  | 13 |
| `mal[].navn` | tekst |  | 13 |
| `mal[].verdi` | tekst |  | 13 |
| `mal[].verktoy` | tekst |  | 13 |

## maltyper (8)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `maltyper` | liste |  | 04 |
| `maltyper[].mal` | liste |  | 04 |
| `maltyper[].mal[].laser` | liste |  | 04 |
| `maltyper[].mal[].mangler` | liste |  | 04 |
| `maltyper[].mal[].navn` | tekst |  | 04 |
| `maltyper[].mal[].nr` | tekst |  | 04 |
| `maltyper[].mal[].verdi` | tekst |  | 04 |
| `maltyper[].type` | tekst |  | 04 |

## melding (2)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `melding.tekst` | tekst | Hei Ola! Lys blå matt er bestilt. Vi ser på levering uke 46. | 19, 26 |
| `melding.tid` | tekst | i dag 09.12 | 19, 26 |

## merknader (4)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `merknader` | liste |  | 04 |
| `merknader[].av` | tekst |  | 04 |
| `merknader[].tekst` | tekst |  | 04 |
| `merknader[].tid` | tekst |  | 04 |

## montor (3)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `montor.firma` | tekst | Montasje AS | 12 |
| `montor.fornavn` | tekst | Jonas | 21, 23 |
| `montor.navn` | tekst | Tor Montør | 04, 11, 12, 13, 21, 23 |

## omrade (5)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `omrade.lerret` | tekst |  | 04 |
| `omrade.merknad` | valg |  | 04 |
| `omrade.merknad[].omrade.merknad` | tekst |  | 04 |
| `omrade.navn` | tekst | Kjøkken | 04 |
| `omrade.nr` | tekst | 1 | 04 |

## pakke (7)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `pakke.forsidebilde` | tekst |  | 14 |
| `pakke.innhold` | liste |  | 14 |
| `pakke.innhold[].nr` | tekst |  | 14 |
| `pakke.innhold[].tekst` | tekst |  | 14 |
| `pakke.innhold[].tittel` | tekst |  | 14 |
| `pakke.montert` | tekst | 7. oktober 2026 | 14 |
| `pakke.montert_dato` | tekst | 10.12.2026 | 14 |

## punkter_side1 (7)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `punkter_side1` | liste |  | 13 |
| `punkter_side1[].av` | tekst |  | 13 |
| `punkter_side1[].dato` | tekst |  | 13 |
| `punkter_side1[].fase` | tekst |  | 13 |
| `punkter_side1[].ref` | tekst |  | 13 |
| `punkter_side1[].status` | tekst |  | 13 |
| `punkter_side1[].tekst` | tekst |  | 13 |

## punkter_side2 (7)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `punkter_side2` | liste |  | 13 |
| `punkter_side2[].av` | tekst |  | 13 |
| `punkter_side2[].dato` | tekst |  | 13 |
| `punkter_side2[].fase` | tekst |  | 13 |
| `punkter_side2[].ref` | tekst |  | 13 |
| `punkter_side2[].status` | tekst |  | 13 |
| `punkter_side2[].tekst` | tekst |  | 13 |

## restpunkt (4)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `restpunkt` | valg |  | 12 |
| `restpunkt[].nr` | tekst |  | 12 |
| `restpunkt[].tekst` | tekst |  | 12 |
| `restpunkt[].tittel` | tekst |  | 12 |

## signatarer (3)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `signatarer` | liste |  | 05 |
| `signatarer[].navn` | tekst |  | 05 |
| `signatarer[].rolle` | tekst |  | 05 |

## vedlegg (2)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `vedlegg` | liste |  | 05 |
| `vedlegg[]` | tekst |  | 05 |

## vedlikehold (3)

| Felt | Type | Eksempel | Maler |
|---|---|---|---|
| `vedlikehold` | liste |  | 14 |
| `vedlikehold[].overflate` | tekst |  | 14 |
| `vedlikehold[].tekst` | tekst |  | 14 |

