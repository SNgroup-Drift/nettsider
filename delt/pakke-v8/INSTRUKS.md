# Pakke v8 · 11.10

To CRM-skjermer tatt på nytt, og fil 60 (hengsel.no) som fasit. Legg pakken oppå v7.

## Innhold
- pc/ : MacBook, 2880 × 1800 (16:10).
  - crm-mal-skisser (fil 32 C01, Ordre › Mål og skisser). Uten «sigdal»-logo.
  - crm-moduler (fil 50 I31, Moduler for superadmin).
- display/ : Studio Display, 2560 × 1440 (16:9). Samme to skjermer.
- fasit/60 hengsel.no.dc.html : designfila for hengsel.no, med W1 forside og W2 testere / hva er nytt.
- fasit/60-hengsel-no-frittstaende.html : samme side i én fil. Den åpnes rett i nettleseren og har bilder og skrift inne.

## Om fil 60
- Bruk den som fasit for oppbygning, tekst og rekkefølge på seksjonene.
- Bildene i fila er gamle webp-forhåndsvisninger, med blant annet Tuva Skinnrud og Pål. Ikke kopier dem. Bruk bildene fra pakkene i stedet:
  - montørbilder: v7 `ios/ute-*`, og `ute-i-dag` fra v5
  - iPad: v4 `ios/ute-ipad-bildeverktoy`, 2360 × 1640, til 11″-rammen
  - PC: `pc/` til MacBook og `display/` til Studio Display
- Rammer: Apple-rammene i `rammer/` (fra v3–v7). Bildet ligger under rammen med `object-fit: cover; object-position: top`.

## Sjekk før PR
Ingen kutt i venstre kant, ingen dobbel statuslinje, ingen merkenavn, bildene fyller skjermhullet, npm test grønn.
