# 60-212 Hengsel Admin, fase B, C og Drift: valg og usikkerhet

15.10.2026. Runde 2 fra fase A var gjort (60-206, 14.10), så denne runden bygger på den.

## Valg jeg tok

1. **Filer:** alt nytt på PC ligger i én fil (60-207) med samme sidemeny som 60-201. Menyen lenker mellom de to filene.
2. **Supportrollen** ser Kunder og Support (Saker og Timer). Ikke Oversikt, siden den viser inntekt. Timer vises uten beløp.
3. **Svarfrist** regnes i arbeidstid (hverdager 08–16) og står stille mens saken venter på kunden. «Snart» = 25 % eller mindre igjen.
4. **Forfalt** er rød tekst, ikon og en rød ring på hvit flate. Snart har gul flate.
5. **Prioritet** vises som fire stolper og ord, ikke farge, så Kritisk ikke blir rødt fyll.
6. **Interne notater** er gule (varsel-flate). Svar er furu, kundens meldinger hvite.
7. **Inkluderte timer** gjelder per måned og nullstilles hver måned, uten overføring.
8. **Timer føres** i påbegynte 15 minutter (eksempel).
9. **Oppstart** åpnes når avtalen sendes til signering, så Code kan lage kundemiljøet før kunden har signert (Nordli).
10. **Over inkludert** bruker de lilla «sannsynlig»-fargene, så det ikke ser ut som en feil. Alias `--status-over-*` er foreslått.
11. **Fakturering skjer forskuddsvis den 1.** Timer og viderefakturering for forrige måned kommer på samme faktura.
12. **KPI-dato** er avtalens årsdag. Ny pris avrundes til hele kroner, og viderefakturering justeres ikke.
13. **Kunden ser andre statusnavn:** Ny, Under arbeid, Venter på deg og Løst.
14. **Telefonens bunnfaner:** Oversikt, Tavle, Saker, Eiere og Mer. Avtaler er flyttet til Mer.
15. **Driftskost** i Tall regner en supporttime som 650 kr i intern kost (eksempel). Det er ikke timeprisen kunden betaler.

## Spørsmål jeg er usikker på (med mitt forslag)

1. **Inkluderte timer fra år 2?** Forslag: samme timer så lenge avtalen løper. Aune og Vestby er tegnet slik og merket.
2. **Timepris for support?** Forslag: 1 150 kr uten mva, ført i påbegynte 15 minutter.
3. **Svarfrister?** Forslag: Kritisk 1 time, Høy 4 timer, Normal 1 virkedag, Lav 3 virkedager, i arbeidstid.
4. **Varsel før KPI-justering?** Forslag: 30 dager.
5. **Leverandør?** Står fortsatt som ES-Holding AS med merket «Eksempel».
6. **Supportrollen og Kunder:** skal den se verdi per måned og avtaler? Forslag: nei, bare kontakter, butikker, kundemiljø og saker.
7. **Oppstart før signering:** er det greit at kundemiljøet lages før kunden har signert? Forslag: ja, men det åpnes ikke for brukere før avtalen er signert.
8. **PowerOffice:** sender vi én faktura per eier eller per butikk? Forslag: per eier, med butikkene som linjer. Kunden må finnes i PowerOffice først (Nordli står med Feil).
9. **Viderefakturering:** hvor kommer kostprisen for SMS, Penneo og AI fra? Forslag: legges inn for hånd hver måned til vi har en kobling (står som rutine).
10. **«Hjelp» i CRM:** skal admin i CRM hos kunden se alle saker fra butikken, eller bare egne? Forslag: admin ser alle, andre ser egne.
11. **Nummerering:** 60-207 til 60-212 er forslag og må sjekkes mot registeret i «Hengsel.no 2.0 redesign».
