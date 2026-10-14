# Kontroll

14.10.2026. Generert fra `tokens/hengsel-palett.tokens.json`. WCAG 2-kontrast i sRGB.

Krav: tekst 4,5:1. Ikoner og kanter som må sees: 3:1. `linje` og `ramme` er bare visuelle og har ikke krav. «Valgt» er `flate-valgt` (= `aksent-svak`). Glass er regnet som 72 % flate over grouped background.

## Sammendrag

284 par er kontrollert. 276 er OK. 8 er under krav:

| Lag | Par | Kontrast | Brukes? | Tiltak |
|---|---|---|---|---|
| Grunn, mørk (besluttet) | tekst-svak på flate-valgt | 3,98:1 | Ja | K-206 (b): foreslått `#90969D` (4,57:1). Ligger utkommentert. Venter på Eirik |
| Grunn, mørk (besluttet) | kant på flate-valgt | 2,70:1 | Ja, avkrysning i valgt rad | Forslag: kant mørk `#767B82` (3,20:1). Venter på Eirik |
| iPhone/iPad, lys | secondaryLabel på grouped, celle og glass | 3,08–3,44:1 | Nei | Erstattet av `Plattform.tekstDempet` (7,41:1) |
| iPhone/iPad, lys | aksent som tekst på grouped | 4,14:1 | Nei | Erstattet av `Plattform.aksentTekst` på tekstknapper (5,62:1) |
| iPhone/iPad, mørk | hvit på aksent (systemets valgte rad) | 2,37:1 | Nei | Erstattet av `Plattform.sidefeltValgt` #163F37 (11,66:1) |
| Montørapp, mørk | kant på flateSenket | 2,75:1 med grunnens #6A6F76 | Nei | Montørappen bruker `#767B82` (3,27:1). Rettet i lag d |

## Brevann-søk

Hele pakken er søkt gjennom etter:

- de 31 gamle fargekodene (lys, mørk og økt kontrast, se `MIGRERING.md`),
- gamle P3-verdier `#177E97`, `#4FB0CC` og `color(display-p3 0.1494 0.4916 0.5815)`,
- gammel stiftfarge `#008094` og `#24B7D2`,
- `rgba(0, 126, 146` med og uten mellomrom,
- ordet «brevann».

Søket gikk gjennom tokens (CSS, JSON, Swift, TypeScript, Tailwind, Android-XML), fargesettene i `Hengsel.xcassets`, alle SVG-er (ikoner, logoer, merker, favicon, app-ikon) og alle skjermene (`.dc.html`).

Resultat: **ingen treff** i noen av disse filene. Verdiene står bare i `MIGRERING.md` og i denne fila, som liste over hva det skal søkes etter.

P3-blokkene i `hengsel-palett.css` er generert fra `p3` i JSON-fila og er furu.

# Alle par

## Grunn, lys

Status: besluttet.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #1A1D22 | #F6F8FB | 15,88:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #1A1D22 | #FBFDFF | 16,57:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #1A1D22 | #EFF1F4 | 14,93:1 | 4,5:1 | OK |
| Tekst: tekst på valgt | #1A1D22 | #E0F4EE | 14,76:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #51565C | #F6F8FB | 6,96:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #51565C | #FBFDFF | 7,26:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #51565C | #EFF1F4 | 6,55:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på valgt | #51565C | #E0F4EE | 6,47:1 | 4,5:1 | OK |
| Tekst: tekst-svak på side | #686E75 | #F6F8FB | 4,84:1 | 4,5:1 | OK |
| Tekst: tekst-svak på kort | #686E75 | #FBFDFF | 5,05:1 | 4,5:1 | OK |
| Tekst: tekst-svak på senket | #686E75 | #EFF1F4 | 4,55:1 | 4,5:1 | OK |
| Tekst: tekst-svak på valgt | #686E75 | #E0F4EE | 4,50:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på side | #016d5e | #F6F8FB | 5,89:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #016d5e | #FBFDFF | 6,15:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #016d5e | #EFF1F4 | 5,54:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på valgt | #016d5e | #E0F4EE | 5,48:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #068472 | #F6F8FB | 4,34:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #068472 | #FBFDFF | 4,53:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #068472 | #EFF1F4 | 4,08:1 | 3:1 | OK |
| Ikon/kant: aksent på valgt | #068472 | #E0F4EE | 4,03:1 | 3:1 | OK |
| Ikon/kant: kant på side | #7B8188 | #F6F8FB | 3,70:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #7B8188 | #FBFDFF | 3,86:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #7B8188 | #EFF1F4 | 3,48:1 | 3:1 | OK |
| Ikon/kant: kant på valgt | #7B8188 | #E0F4EE | 3,44:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på side | #51565C | #F6F8FB | 6,96:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #51565C | #FBFDFF | 7,26:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #51565C | #EFF1F4 | 6,55:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på valgt | #51565C | #E0F4EE | 6,47:1 | 3:1 | OK |
| Statuspille ny: fg på bg | #1A57AD | #E7F1FF | 6,12:1 | 4,5:1 | OK |
| Statuspille pagar: fg på bg | #5C46A7 | #EFEEFF | 6,35:1 | 4,5:1 | OK |
| Statuspille venter: fg på bg | #555B64 | #E9F1FB | 6,01:1 | 4,5:1 | OK |
| Statuspille sannsynlig: fg på bg | #80378C | #FCE9FF | 6,42:1 | 4,5:1 | OK |
| Statuspille ferdig: fg på bg | #1F6D02 | #E3F7DE | 5,74:1 | 4,5:1 | OK |
| Statuspille advarsel: fg på bg | #6D5000 | #FFE9BC | 6,30:1 | 4,5:1 | OK |
| Statuspille feil: fg på bg | #9E2D28 | #FFEBE8 | 6,40:1 | 4,5:1 | OK |

## Grunn, mørk

Status: besluttet.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #EAEDF0 | #0B0D11 | 16,55:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #EAEDF0 | #111418 | 15,72:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #EAEDF0 | #06080B | 17,06:1 | 4,5:1 | OK |
| Tekst: tekst på valgt | #EAEDF0 | #13332D | 11,61:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #ADB1B7 | #0B0D11 | 9,03:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #ADB1B7 | #111418 | 8,57:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #ADB1B7 | #06080B | 9,31:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på valgt | #ADB1B7 | #13332D | 6,33:1 | 4,5:1 | OK |
| Tekst: tekst-svak på side | #868B92 | #0B0D11 | 5,67:1 | 4,5:1 | OK |
| Tekst: tekst-svak på kort | #868B92 | #111418 | 5,38:1 | 4,5:1 | OK |
| Tekst: tekst-svak på senket | #868B92 | #06080B | 5,85:1 | 4,5:1 | OK |
| Tekst: tekst-svak på valgt | #868B92 | #13332D | 3,98:1 | 4,5:1 | **Under** |
| Tekst: aksent-tekst på side | #8ACDBE | #0B0D11 | 10,70:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #8ACDBE | #111418 | 10,16:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #8ACDBE | #06080B | 11,03:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på valgt | #8ACDBE | #13332D | 7,51:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #0D1013 | #54B9A5 | 8,05:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #54B9A5 | #0B0D11 | 8,20:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #54B9A5 | #111418 | 7,79:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #54B9A5 | #06080B | 8,46:1 | 3:1 | OK |
| Ikon/kant: aksent på valgt | #54B9A5 | #13332D | 5,76:1 | 3:1 | OK |
| Ikon/kant: kant på side | #6A6F76 | #0B0D11 | 3,84:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #6A6F76 | #111418 | 3,65:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #6A6F76 | #06080B | 3,96:1 | 3:1 | OK |
| Ikon/kant: kant på valgt | #6A6F76 | #13332D | 2,70:1 | 3:1 | **Under** |
| Ikon/kant: tekst-dempet på side | #ADB1B7 | #0B0D11 | 9,03:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #ADB1B7 | #111418 | 8,57:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #ADB1B7 | #06080B | 9,31:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på valgt | #ADB1B7 | #13332D | 6,33:1 | 3:1 | OK |
| Statuspille ny: fg på bg | #B5D3FF | #152946 | 9,55:1 | 4,5:1 | OK |
| Statuspille pagar: fg på bg | #D0C9FF | #292344 | 9,51:1 | 4,5:1 | OK |
| Statuspille venter: fg på bg | #CAD2DC | #242931 | 9,58:1 | 4,5:1 | OK |
| Statuspille sannsynlig: fg på bg | #F3B9FC | #361E3A | 9,37:1 | 4,5:1 | OK |
| Statuspille ferdig: fg på bg | #AAE39E | #173012 | 9,67:1 | 4,5:1 | OK |
| Statuspille advarsel: fg på bg | #FCC959 | #3D2A00 | 8,92:1 | 4,5:1 | OK |
| Statuspille feil: fg på bg | #FFBFB6 | #421C18 | 9,48:1 | 4,5:1 | OK |

## Grunn, lys, økt kontrast

Status: besluttet.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #040608 | #F6F8FB | 19,08:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #040608 | #FBFDFF | 19,90:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #040608 | #EFF1F4 | 17,94:1 | 4,5:1 | OK |
| Tekst: tekst på valgt | #040608 | #E0F4EE | 17,73:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #2A2E33 | #F6F8FB | 12,84:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #2A2E33 | #FBFDFF | 13,40:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #2A2E33 | #EFF1F4 | 12,07:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på valgt | #2A2E33 | #E0F4EE | 11,93:1 | 4,5:1 | OK |
| Tekst: tekst-svak på side | #43484E | #F6F8FB | 8,67:1 | 4,5:1 | OK |
| Tekst: tekst-svak på kort | #43484E | #FBFDFF | 9,05:1 | 4,5:1 | OK |
| Tekst: tekst-svak på senket | #43484E | #EFF1F4 | 8,16:1 | 4,5:1 | OK |
| Tekst: tekst-svak på valgt | #43484E | #E0F4EE | 8,06:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på side | #004E42 | #F6F8FB | 9,10:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #004E42 | #FBFDFF | 9,50:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #004E42 | #EFF1F4 | 8,56:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på valgt | #004E42 | #E0F4EE | 8,46:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #FFFFFF | #006a5b | 6,54:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #006a5b | #F6F8FB | 6,14:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #006a5b | #FBFDFF | 6,41:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #006a5b | #EFF1F4 | 5,78:1 | 3:1 | OK |
| Ikon/kant: aksent på valgt | #006a5b | #E0F4EE | 5,71:1 | 3:1 | OK |
| Ikon/kant: kant på side | #494E54 | #F6F8FB | 7,89:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #494E54 | #FBFDFF | 8,23:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #494E54 | #EFF1F4 | 7,42:1 | 3:1 | OK |
| Ikon/kant: kant på valgt | #494E54 | #E0F4EE | 7,33:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på side | #2A2E33 | #F6F8FB | 12,84:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #2A2E33 | #FBFDFF | 13,40:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #2A2E33 | #EFF1F4 | 12,07:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på valgt | #2A2E33 | #E0F4EE | 11,93:1 | 3:1 | OK |
| Statuspille ny: fg på bg | #003882 | #F2F7FF | 10,34:1 | 4,5:1 | OK |
| Statuspille pagar: fg på bg | #402584 | #F6F6FF | 10,76:1 | 4,5:1 | OK |
| Statuspille venter: fg på bg | #383E46 | #F1F7FF | 10,02:1 | 4,5:1 | OK |
| Statuspille sannsynlig: fg på bg | #5F136A | #FEF3FF | 10,89:1 | 4,5:1 | OK |
| Statuspille ferdig: fg på bg | #104B00 | #E9FEE5 | 9,75:1 | 4,5:1 | OK |
| Statuspille advarsel: fg på bg | #503900 | #FFF6E4 | 10,15:1 | 4,5:1 | OK |
| Statuspille feil: fg på bg | #780007 | #FFF4F2 | 10,81:1 | 4,5:1 | OK |

## Grunn, mørk, økt kontrast

Status: besluttet.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #FCFDFF | #0B0D11 | 19,11:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #FCFDFF | #111418 | 18,15:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #FCFDFF | #06080B | 19,70:1 | 4,5:1 | OK |
| Tekst: tekst på valgt | #FCFDFF | #13332D | 13,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #DBDEE2 | #0B0D11 | 14,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #DBDEE2 | #111418 | 13,68:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #DBDEE2 | #06080B | 14,86:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på valgt | #DBDEE2 | #13332D | 10,11:1 | 4,5:1 | OK |
| Tekst: tekst-svak på side | #C0C4CA | #0B0D11 | 11,10:1 | 4,5:1 | OK |
| Tekst: tekst-svak på kort | #C0C4CA | #111418 | 10,54:1 | 4,5:1 | OK |
| Tekst: tekst-svak på senket | #C0C4CA | #06080B | 11,45:1 | 4,5:1 | OK |
| Tekst: tekst-svak på valgt | #C0C4CA | #13332D | 7,79:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på side | #B4ECDE | #0B0D11 | 14,81:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #B4ECDE | #111418 | 14,07:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #B4ECDE | #06080B | 15,27:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på valgt | #B4ECDE | #13332D | 10,39:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #0D1013 | #68CDB7 | 10,00:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #68CDB7 | #0B0D11 | 10,19:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #68CDB7 | #111418 | 9,68:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #68CDB7 | #06080B | 10,51:1 | 3:1 | OK |
| Ikon/kant: aksent på valgt | #68CDB7 | #13332D | 7,15:1 | 3:1 | OK |
| Ikon/kant: kant på side | #A6ABB1 | #0B0D11 | 8,41:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #A6ABB1 | #111418 | 7,99:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #A6ABB1 | #06080B | 8,67:1 | 3:1 | OK |
| Ikon/kant: kant på valgt | #A6ABB1 | #13332D | 5,90:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på side | #DBDEE2 | #0B0D11 | 14,41:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #DBDEE2 | #111418 | 13,68:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #DBDEE2 | #06080B | 14,86:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på valgt | #DBDEE2 | #13332D | 10,11:1 | 3:1 | OK |
| Statuspille ny: fg på bg | #E0ECFF | #071A36 | 14,55:1 | 4,5:1 | OK |
| Statuspille pagar: fg på bg | #EAE8FF | #1B1434 | 14,62:1 | 4,5:1 | OK |
| Statuspille venter: fg på bg | #E4ECF6 | #161B22 | 14,52:1 | 4,5:1 | OK |
| Statuspille sannsynlig: fg på bg | #FBE1FF | #270F2B | 14,56:1 | 4,5:1 | OK |
| Statuspille ferdig: fg på bg | #C4FEB7 | #092104 | 14,79:1 | 4,5:1 | OK |
| Statuspille advarsel: fg på bg | #FFE9BC | #251800 | 14,58:1 | 4,5:1 | OK |
| Statuspille feil: fg på bg | #FFE4E0 | #310D0A | 14,61:1 | 4,5:1 | OK |

## PC (lag a), lys

Status: foreslått.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #1A1D22 | #ECEFF3 | 14,65:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #1A1D22 | #FFFFFF | 16,90:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #1A1D22 | #F3F5F8 | 15,47:1 | 4,5:1 | OK |
| Tekst: tekst på valgt | #1A1D22 | #E0F4EE | 14,76:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #51565C | #ECEFF3 | 6,42:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #51565C | #F3F5F8 | 6,78:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på valgt | #51565C | #E0F4EE | 6,47:1 | 4,5:1 | OK |
| Tekst: tekst-svak på side | #62686F | #ECEFF3 | 4,88:1 | 4,5:1 | OK |
| Tekst: tekst-svak på kort | #62686F | #FFFFFF | 5,63:1 | 4,5:1 | OK |
| Tekst: tekst-svak på senket | #62686F | #F3F5F8 | 5,16:1 | 4,5:1 | OK |
| Tekst: tekst-svak på valgt | #62686F | #E0F4EE | 4,92:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på side | #016d5e | #ECEFF3 | 5,43:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #016d5e | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #016d5e | #F3F5F8 | 5,74:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på valgt | #016d5e | #E0F4EE | 5,48:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #068472 | #ECEFF3 | 4,00:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #068472 | #FFFFFF | 4,61:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #068472 | #F3F5F8 | 4,22:1 | 3:1 | OK |
| Ikon/kant: aksent på valgt | #068472 | #E0F4EE | 4,03:1 | 3:1 | OK |
| Ikon/kant: kant på side | #7B8188 | #ECEFF3 | 3,41:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #7B8188 | #F3F5F8 | 3,60:1 | 3:1 | OK |
| Ikon/kant: kant på valgt | #7B8188 | #E0F4EE | 3,44:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på side | #51565C | #ECEFF3 | 6,42:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #51565C | #F3F5F8 | 6,78:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på valgt | #51565C | #E0F4EE | 6,47:1 | 3:1 | OK |

## Nettleser under 1024 px (lag b), lys

Status: foreslått.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #1A1D22 | #ECEFF3 | 14,65:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #1A1D22 | #FFFFFF | 16,90:1 | 4,5:1 | OK |
| Tekst: tekst på fanelinje | #1A1D22 | #FFFFFF | 16,90:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #1A1D22 | #F3F5F8 | 15,47:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #51565C | #ECEFF3 | 6,42:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på fanelinje | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #51565C | #F3F5F8 | 6,78:1 | 4,5:1 | OK |
| Tekst: tekst-svak på side | #62686F | #ECEFF3 | 4,88:1 | 4,5:1 | OK |
| Tekst: tekst-svak på kort | #62686F | #FFFFFF | 5,63:1 | 4,5:1 | OK |
| Tekst: tekst-svak på fanelinje | #62686F | #FFFFFF | 5,63:1 | 4,5:1 | OK |
| Tekst: tekst-svak på senket | #62686F | #F3F5F8 | 5,16:1 | 4,5:1 | OK |
| Tekst: aksent-tekst (aktiv fane) på side | #016d5e | #ECEFF3 | 5,43:1 | 4,5:1 | OK |
| Tekst: aksent-tekst (aktiv fane) på kort | #016d5e | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| Tekst: aksent-tekst (aktiv fane) på fanelinje | #016d5e | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| Tekst: aksent-tekst (aktiv fane) på senket | #016d5e | #F3F5F8 | 5,74:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #068472 | #ECEFF3 | 4,00:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #068472 | #FFFFFF | 4,61:1 | 3:1 | OK |
| Ikon/kant: aksent på fanelinje | #068472 | #FFFFFF | 4,61:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #068472 | #F3F5F8 | 4,22:1 | 3:1 | OK |
| Ikon/kant: kant på side | #7B8188 | #ECEFF3 | 3,41:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |
| Ikon/kant: kant på fanelinje | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #7B8188 | #F3F5F8 | 3,60:1 | 3:1 | OK |
| Ikon/kant: ikon inaktiv fane på side | #51565C | #ECEFF3 | 6,42:1 | 3:1 | OK |
| Ikon/kant: ikon inaktiv fane på kort | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| Ikon/kant: ikon inaktiv fane på fanelinje | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| Ikon/kant: ikon inaktiv fane på senket | #51565C | #F3F5F8 | 6,78:1 | 3:1 | OK |

## iPhone/iPad (lag c), lys

Status: foreslått.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: label på grouped | #000000 | #F2F2F7 | 18,82:1 | 4,5:1 | OK |
| Tekst: label på celle | #000000 | #FFFFFF | 21,00:1 | 4,5:1 | OK |
| Tekst: label på glass | #000000 | #FBFBFD | 20,32:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på grouped | #51565C | #F2F2F7 | 6,64:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på celle | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på glass | #51565C | #FBFBFD | 7,17:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på grouped | #016D5E | #F2F2F7 | 5,62:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på celle | #016D5E | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på glass | #016D5E | #FBFBFD | 6,06:1 | 4,5:1 | OK |
| Tekst: secondaryLabel (system, brukes ikke) på grouped | #8A8A8E | #F2F2F7 | 3,08:1 | 4,5:1 | **Under** |
| Tekst: secondaryLabel (system, brukes ikke) på celle | #8A8A8E | #FFFFFF | 3,44:1 | 4,5:1 | **Under** |
| Tekst: secondaryLabel (system, brukes ikke) på glass | #8A8A8E | #FBFBFD | 3,33:1 | 4,5:1 | **Under** |
| Tekst: paa-aksent på aksent (primærknapp) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| Ikon/kant: aksent på grouped | #068472 | #F2F2F7 | 4,14:1 | 3:1 | OK |
| Ikon/kant: aksent på celle | #068472 | #FFFFFF | 4,61:1 | 3:1 | OK |
| Ikon/kant: aksent på glass | #068472 | #FBFBFD | 4,46:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på grouped | #51565C | #F2F2F7 | 6,64:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på celle | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på glass | #51565C | #FBFBFD | 7,17:1 | 3:1 | OK |
| Valgt rad i sidefelt: hvit på sidefelt-valgt | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| Aksent som tekst på grouped (brukes ikke) | #068472 | #F2F2F7 | 4,14:1 | 4,5:1 | **Under** |

## iPhone/iPad (lag c), mørk

Status: foreslått.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: label på grouped | #FFFFFF | #000000 | 21,00:1 | 4,5:1 | OK |
| Tekst: label på celle | #FFFFFF | #1C1C1E | 17,01:1 | 4,5:1 | OK |
| Tekst: label på senket | #FFFFFF | #2C2C2E | 13,94:1 | 4,5:1 | OK |
| Tekst: label på glass | #FFFFFF | #141416 | 18,40:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på grouped | #ADB1B7 | #000000 | 9,75:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på celle | #ADB1B7 | #1C1C1E | 7,90:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #ADB1B7 | #2C2C2E | 6,47:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på glass | #ADB1B7 | #141416 | 8,54:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på grouped | #54B9A5 | #000000 | 8,86:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på celle | #54B9A5 | #1C1C1E | 7,18:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #54B9A5 | #2C2C2E | 5,88:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på glass | #54B9A5 | #141416 | 7,76:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #0D1013 | #54B9A5 | 8,05:1 | 4,5:1 | OK |
| Ikon/kant: aksent på grouped | #54B9A5 | #000000 | 8,86:1 | 3:1 | OK |
| Ikon/kant: aksent på celle | #54B9A5 | #1C1C1E | 7,18:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #54B9A5 | #2C2C2E | 5,88:1 | 3:1 | OK |
| Ikon/kant: aksent på glass | #54B9A5 | #141416 | 7,76:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på grouped | #ADB1B7 | #000000 | 9,75:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på celle | #ADB1B7 | #1C1C1E | 7,90:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #ADB1B7 | #2C2C2E | 6,47:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på glass | #ADB1B7 | #141416 | 8,54:1 | 3:1 | OK |
| Valgt rad i sidefelt: hvit på sidefelt-valgt | #FFFFFF | #163F37 | 11,66:1 | 4,5:1 | OK |
| Systemstandard: hvit på aksent (brukes ikke) | #FFFFFF | #54B9A5 | 2,37:1 | 4,5:1 | **Under** |

## Montørapp (lag d), lys

Status: foreslått.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #1A1D22 | #F2F2F7 | 15,14:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #1A1D22 | #FFFFFF | 16,90:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #1A1D22 | #E9E9EE | 13,96:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #51565C | #F2F2F7 | 6,64:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #51565C | #E9E9EE | 6,12:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på side | #016D5E | #F2F2F7 | 5,62:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #016D5E | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #016D5E | #E9E9EE | 5,18:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #068472 | #F2F2F7 | 4,14:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #068472 | #FFFFFF | 4,61:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #068472 | #E9E9EE | 3,81:1 | 3:1 | OK |
| Ikon/kant: kant på side | #7B8188 | #F2F2F7 | 3,53:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #7B8188 | #E9E9EE | 3,25:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på side | #51565C | #F2F2F7 | 6,64:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #51565C | #E9E9EE | 6,12:1 | 3:1 | OK |

## Montørapp (lag d), mørk

Status: foreslått.

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| Tekst: tekst på side | #EAEDF0 | #000000 | 17,87:1 | 4,5:1 | OK |
| Tekst: tekst på kort | #EAEDF0 | #1C1C1E | 14,48:1 | 4,5:1 | OK |
| Tekst: tekst på senket | #EAEDF0 | #2C2C2E | 11,86:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på side | #ADB1B7 | #000000 | 9,75:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på kort | #ADB1B7 | #1C1C1E | 7,90:1 | 4,5:1 | OK |
| Tekst: tekst-dempet på senket | #ADB1B7 | #2C2C2E | 6,47:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på side | #8ACDBE | #000000 | 11,56:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på kort | #8ACDBE | #1C1C1E | 9,36:1 | 4,5:1 | OK |
| Tekst: aksent-tekst på senket | #8ACDBE | #2C2C2E | 7,67:1 | 4,5:1 | OK |
| Tekst: paa-aksent på aksent (primærknapp) | #0D1013 | #54B9A5 | 8,05:1 | 4,5:1 | OK |
| Ikon/kant: aksent på side | #54B9A5 | #000000 | 8,86:1 | 3:1 | OK |
| Ikon/kant: aksent på kort | #54B9A5 | #1C1C1E | 7,18:1 | 3:1 | OK |
| Ikon/kant: aksent på senket | #54B9A5 | #2C2C2E | 5,88:1 | 3:1 | OK |
| Ikon/kant: kant på side | #767B82 | #000000 | 4,93:1 | 3:1 | OK |
| Ikon/kant: kant på kort | #767B82 | #1C1C1E | 3,99:1 | 3:1 | OK |
| Ikon/kant: kant på senket | #767B82 | #2C2C2E | 3,27:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på side | #ADB1B7 | #000000 | 9,75:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på kort | #ADB1B7 | #1C1C1E | 7,90:1 | 3:1 | OK |
| Ikon/kant: tekst-dempet på senket | #ADB1B7 | #2C2C2E | 6,47:1 | 3:1 | OK |
