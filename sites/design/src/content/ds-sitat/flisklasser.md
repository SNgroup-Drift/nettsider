# Flisklasser

Fasit: `dokumentasjon/LAYOUT-REGLER.md` 2c og 2d, komponenten `Flis klasse="…"` (`components/layout/Flis.jsx`). Skrift i alle fliser: tittel 16/600, innhold 14/400, undertekst 12, stort tall 32/400. Tekst som ikke får plass kuttes med … på én linje og vises hel i tooltip. Tom, laster og feil har samme høyde som fylt flis.

| Klasse | `klasse` | Bredde | Fast høyde (px) | Innhold | Tom / laster / feil | Bilde |
|---|---|---|---|---|---|---|
| Tall | `tall` | 1/4 eller 1/3 | 120 | Etikett 14, ett tall 32 (tabulære sifre), undertekst 12 | Laster: tallet som «…» i samme høyde. Tom: «0» med undertekst. Feil: «–» og undertekst «Kunne ikke hente» | `dokumentasjon/bilder/flis-tall.png` |
| Status | `status` | 1/3 | 120 | Tittel, én pille, én setning (kuttes med …) | Laster: grå pille. Feil: pille «Feil» og setningen | `dokumentasjon/bilder/flis-status.png` |
| Steg | `steg` | 1/1 | 120 | Tittel, vannrett rad av steg (strek 4, navn 20, status 16) | Laster: grå streker. Feil: banner over raden | `dokumentasjon/bilder/flis-steg.png` |
| Kortliste | `kortliste` | 1/3 | 320 | Tittel 40, maks 5 rader à 40, «Vis alle (n)» 48 | Tom: én linje «Ingenting her». Laster: grå rader. Feil: én linje og «Prøv igjen» | `dokumentasjon/bilder/flis-kortliste.png` |
| Liste | `liste` | 1/2 | 320 | Tittel, maks 5 rader à 40 med to kolonner, «Vis alle (n)» (A19) | Som Kortliste | `dokumentasjon/bilder/flis-liste.png` |
| Diagram | `diagram` | 1/2 | 320 | Tittel, én graf, én forklaringslinje | Laster: grå flate. Tom: «Ingen tall ennå» | `dokumentasjon/bilder/flis-diagram.png` |
| Skjema | `skjema` | 1/2 | 480 | Tittel, maks 4 felt (etikett 16 + 8 + felt 40, 12 mellom), handling 48 nederst til høyre | Laster: felt grå. Feil: rød tekst under feltet | `dokumentasjon/bilder/flis-skjema.png` |
| Tekst | `tekst` | 1/1 (1/2 ved Skjema) | 120, 320 eller 480 | Tittel, brødtekst 14/22, maks 720 px bredde | – | `dokumentasjon/bilder/flis-tekst.png` |
| Tabell | `tabell` | 1/1 | 480 (til 6 rader) eller 640 (til 10) | Tittel, verktøylinje 36 + 8, overskrift 36, rader 44, sidevelger eller «n rader» 48 | Tom: forklaring + handling. Laster: grå rader. Feil: banner, gamle rader står | `dokumentasjon/bilder/flis-tabell.png` |
| Tavle | `tavle` | 1/1 | 480 | 2–6 kolonner, kolonnenavn 14/600 + antall, maks 5 kort à 44, «Vis alle (n)». Telefon: én kolonne med velger | Tom: tomme kolonner + forklaring. Laster: grå kort | `dokumentasjon/bilder/flis-tavle.png` |
| Uke | `uke` | 1/1 | 480 | 5 eller 7 dager, maks 5 avtaler à 44 med klokkeslett først, «+n». Telefon: én dag med dagvelger | Som Tavle | `dokumentasjon/bilder/flis-uke.png` |
| Plan | `plan` | 1/1 | 480 (til 7 rader) eller 640 (til 10) | Navnekolonne 200 + 8 uker, rader 44, stolpe 24, «Vis alle (n)» | Laster: grå stolper | `dokumentasjon/bilder/flis-plan.png` |
| Tegning | `tegning` | 1/1 | 480 | Bildeflate som fyller flisen, én linje under. Nål og kommentar med punktnummer | Laster: grå flate. Feil: «Tegningen kunne ikke åpnes» | `dokumentasjon/bilder/flis-tegning.png` |

Alle klassene står samlet på 29-004 (`20_sidekart/gjennomgang/29-004.png`). Tavle, Uke, Plan og Tegning er lagt til 17.10.
