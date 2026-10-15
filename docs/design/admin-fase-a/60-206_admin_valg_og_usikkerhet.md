# 60-206 Hengsel Admin, fase A: valg og usikkerhet

Runde 2, 14.10.2026.

## Besluttet 14.10

- **Kjederabatt:** 15 % fra 3 butikker og 25 % fra 10 butikker hos samme eier. Rabatten gjelder pakker, ekstra brukere og montører (Hengsel Ute). Den gjelder ikke etablering og ikke viderefakturert SMS, Penneo og AI.
  - Prisberegneren (SA5) og tilbudet (SA6) viser rabatten som én linje under linjene den gjelder.
  - Etablering og viderefakturering står for seg, uten rabatt.
- **Pakke per butikk:** hver butikk hos samme eier kan ha sin egen pakke. Rabattrinnet regnes ut fra hvor mange butikker eieren har til sammen.
  - SA5 har egen pakkevelger på hver butikklinje.
  - Eierkortet (SA4) viser pakke per butikk.
- **Signering i Penneo:** kunden signerer først (den med signaturrett hos eieren), deretter Eirik for leverandøren.
  - SA7 viser rekkefølgen med status per signatar: 1 Kunden (Venter/Signert), 2 Eirik (Venter/Signert).
  - Avtalen får status «Signert» først når begge har signert.

## Ikke besluttet

- **Leverandør:** det er ikke besluttet hvilket selskap som selger Hengsel. Leverandøren er et felt under Innstillinger (navn, org.nr., adresse, e-post, signatar). «ES-Holding AS» er brukt som eksempel og er merket «Eksempel».
- **Priser:** alle priser er eksempler. Prislisten er ikke låst.

## Valg jeg tok

- **Profil:** PC-laget fra furu v2 (side #ECEFF3, hvite kort med ramme). Laget er foreslått, ikke besluttet. Admin følger CRM-et.
- **Logo:** Hengsel Admin-logoen øverst i sidemenyen, og Hengsel-logoen med versjon nederst til venstre, som i CRM-et.
- **Statusfarger på tavla:** Ny = ny (blå), Demo = pågår (lilla), Tilbud = sannsynlig, Forhandling = furu, Signert = ferdig (grønn), Tapt = venter (grå). Tapt er grå og ikke rød, fordi det ikke er en feil.
- **Kunder** er samme tabell som «Eiere og butikker», filtrert på kunder.
- **Telefon:** bunnfaner Oversikt, Tavle, Eiere, Avtaler og Mer. Ingen dra og slipp på telefon.
- **«Ikke aktuell»** på et lead bruker samme dialog som Tapt, med obligatorisk grunn.
- **Hengsel Ute:** montører telles per butikk. Ute prises per eier, og prisberegneren velger det billigste av montørpris (150 kr × antall) og firmapris (990 kr for opptil 8 montører).
- **Tillegg** (utvidet sikkerhetskopi, eget domene) gjelder hele eieren og får ikke rabatt. Sikkerhetskopien vises som «Inkludert» når en butikk har Komplett, eller når eieren har flere butikker.
- **Rabatten** avrundes til hele kroner. Mva vises med øre. Per år med mva = per år uten mva × 1,25.
- **Nye ikoner:** lenke, dra og last opp, i samme rutenett og med samme strek som de 49.

## Usikker på

1. **Nummerering:** filene er nummerert 60-201 til 60-206 som forslag og må sjekkes mot registeret i «Hengsel.no 2.0 redesign».
2. **Fornyes snart** er satt til 90 dager før fornyelsesdatoen.
3. **Lead-flyt:** skal «Be om demo» lage eier og kontakt med en gang, eller ligge i en innboks til Eirik godtar det?
4. **Telefonens bunnfaner** (Oversikt, Tavle, Eiere, Avtaler, Mer).
5. **Kolonnefargen** på tavla (#E3E6EA) er ny som flatebruk. Foreslått som `--flate-kolonne`.
6. **Mva på etablering** vises. Er det riktig?
7. **Tillegg og rabatt:** regelen nevner ikke tillegg. Tegnet uten rabatt.
8. **Firmapris for Ute:** gjelder den per eier (tegnet slik) eller per butikk?
9. **«Flere butikker»** for gratis sikkerhetskopi er tegnet som 2 eller flere.
10. **Support etter første år:** hva skjer med de inkluderte timene fra år 2?
11. **Hengsel-linjen:** har den samme brukere, support og etablering som Sigdal CRM? Tegnet likt.
