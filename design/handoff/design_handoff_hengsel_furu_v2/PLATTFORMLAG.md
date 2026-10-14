# Plattformlag

14.10.2026. Fire lag oppå grunnpaletten. Alt ligger i `tokens/hengsel-palett.css` og `tokens/hengsel-palett.tokens.json` (`plattform`). Grunnpaletten er ikke endret. Full kontrastkontroll står i `KONTROLL.md`. Hvert lag overstyrer bare det som står under. Alle kontrasttall er regnet ut i sRGB etter WCAG 2.

Krav: tekst 4,5:1. Kanter og ikoner som må sees: 3:1. `linje` og `ramme` er bare visuelle og har ikke krav.

## a) PC: CRM og admin i nettleser, fra 1024 px

**Status: foreslått.** Logoplassering er besluttet 14.10: Hengsel-logo med versjon nederst til venstre, kundens logo øverst til høyre.

Fil: `tokens/hengsel-palett.css`, velger `[data-plattform="pc"]` på `<html>`. Bare lys.

### Overstyrer fra grunnpaletten

| Token | Grunn | PC | Hvorfor |
|---|---|---|---|
| `--flate-side` | #F6F8FB | #ECEFF3 | Side mot kort 1,15:1 i stedet for 1,04:1 |
| `--flate-kort` | #FBFDFF | #FFFFFF | |
| `--flate-senket` | #EFF1F4 | #F3F5F8 | Tabellhode og hover inne i hvite kort |
| `--linje` | #D7DADE | #E3E6EA | Skillelinjer inne i kort, lysere enn rammen |
| `--tekst-svak` | #686E75 | #62686F | 4,47:1 ble 4,88:1 på ny side |

### Nye tokens

| Token | Verdi |
|---|---|
| `--ramme` | #CDD1D6, kant rundt kort, sidemeny og tabeller |
| `--flate-hover` | #F3F5F8 |
| `--skygge-kort` | 0 1px 2px rgba(26,29,34,.06) |
| `--skygge-flytende` | 0 0 0 1px rgba(26,29,34,.08), 0 16px 40px -12px rgba(26,29,34,.28). Dialog, meny, toast |
| `--sidemeny-flate` | #FFFFFF, med `--ramme` til høyre |
| `--sidemeny-bredde` / `--sidemeny-rad` | 248 px / 34 px |
| `--sidemeny-aktiv-flate` / `-tekst` | `--aksent-svak` / `--aksent-tekst` |
| `--toppfelt-hoyde` / `--toppfelt-flate` | 60 px / rgba(236,239,243,.9) med blur 8 px |
| `--kundelogo-maks` | 28 px |
| Skrift | grunn 15, tabell 14, meta 13, pille 12, korttittel 16, sidetittel 28 px. Linjehøyde 1,45 |
| `--rad` | 44 px (normal) |
| `--felt-hoyde` / `--knapp-hoyde` | 36 px |
| `--trykk-min` | 32 px (mus) |
| Avstand | 4, 8, 12, 16, 20, 24, 32. Side 28, mellom kort 16, i kort 18 |
| `--innhold-maks` | 1440 px |
| Radius | kort 14, felt og knapp 10, pille 999 |

### Tetthet for tabeller

`data-tetthet` på tabellen eller `<html>`. Brukeren velger i tabellens verktøylinje.

| | Radhøyde | Skrift | Cellepadding |
|---|---|---|---|
| Tett | 36 px | 13 px | 12 px |
| Normal | 44 px | 14 px | 16 px |
| Luftig | 52 px | 15 px | 18 px |

### Kontroll

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| tekst på side | #1A1D22 | #ECEFF3 | 14,65:1 | 4,5:1 | OK |
| tekst på kort | #1A1D22 | #FFFFFF | 16,90:1 | 4,5:1 | OK |
| tekst-dempet på side | #51565C | #ECEFF3 | 6,42:1 | 4,5:1 | OK |
| tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| tekst-dempet på senket/hover | #51565C | #F3F5F8 | 6,78:1 | 4,5:1 | OK |
| tekst-svak på side | #62686F | #ECEFF3 | 4,88:1 | 4,5:1 | OK |
| tekst-svak på kort | #62686F | #FFFFFF | 5,63:1 | 4,5:1 | OK |
| tekst-svak på senket/hover | #62686F | #F3F5F8 | 5,16:1 | 4,5:1 | OK |
| tekst-svak på flate-valgt | #62686F | #E0F4EE | 4,92:1 | 4,5:1 | OK |
| aksent-tekst på kort (lenke) | #016D5E | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| aksent-tekst på sidemeny aktiv | #016D5E | #E0F4EE | 5,48:1 | 4,5:1 | OK |
| paa-aksent på aksent (primærknapp) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| aksent på kort (ikon, fokusring) | #068472 | #FFFFFF | 4,61:1 | 3:1 | OK |
| kant på kort (felt, sekundærknapp) | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |
| kant på side | #7B8188 | #ECEFF3 | 3,41:1 | 3:1 | OK |
| ikon tekst-dempet på kort | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| tekst på toppfelt (side 90 %) | #1A1D22 | #EEF1F4 | 14,91:1 | 4,5:1 | OK |

## b) Nettbrett og mobil i nettleser, under 1024 px

**Status: foreslått.**

Samme fil. Slår inn med `@media (max-width: 1023.98px)`. Farger som PC.

| Token | PC | Under 1024 | Under 768 |
|---|---|---|---|
| Sidemeny | 248 px fast | Skuff, 300 px, bak menyknapp | Bunnfaner + «Mer» |
| `--toppfelt-hoyde` | 60 | 56 | 56 |
| `--kundelogo-maks` | 28 | 24 | 24 |
| `--font-grunn` | 15 | 16 (hindrer zoom i felt på iOS) | 16 |
| `--font-meta` / `--font-tabell` | 13 / 14 | 14 / 15 | 14 / 15 |
| `--font-sidetittel` | 28 | 24 | 22 |
| `--rad` | 44 | 56, tabeller blir lister | 56 |
| `--felt-hoyde` / `--knapp-hoyde` / `--trykk-min` | 36 / 36 / 32 | 44 / 44 / 44 | 44 |
| `--sidemeny-rad` | 34 | 44 | 44 |
| `--rom-side` / `--rom-kort` / `--kort-pad` | 28 / 16 / 18 | 20 / 12 / 16 | 16 / 12 / 16 |
| `--radius-kort` | 14 | 12 | 12 |
| `--fanelinje-hoyde` | – | – | 64 px + safe area |
| Tetthet | tett, normal, luftig | bare normal og luftig | bare normal og luftig |

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| tekst-svak på side | #62686F | #ECEFF3 | 4,88:1 | 4,5:1 | OK |
| tekst-dempet på fanelinje (kort) | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| aktiv fane aksent-tekst på kort | #016D5E | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| kant på kort | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |

## c) iPhone og iPad (SwiftUI, Hengsel 2.0)

**Status: foreslått.** Prinsippet (systemflater, systemkomponenter, Liquid Glass) er besluttet.

Filer: `tokens/swift/HengselTokens.swift` (`Plattform`) og `tokens/swift/Hengsel.xcassets` (`TekstDempet`, `AksentTekst`, `SidefeltValgt`). Lys og mørk følger systemet.

| Rolle | iOS | Lys | Mørk |
|---|---|---|---|
| flate-side | `systemGroupedBackground` | #F2F2F7 | #000000 |
| flate-kort | `secondarySystemGroupedBackground` | #FFFFFF | #1C1C1E |
| flate-senket | `tertiarySystemGroupedBackground` | #F2F2F7 | #2C2C2E |
| linje | `separator` | system | system |
| tekst | `label` | system | system |
| tekst-dempet og tekst-svak | `Plattform.tekstDempet` | #51565C | #ADB1B7 |
| Glass | Liquid Glass: fanelinje, verktøylinje, sidefelt, ark, `.buttonStyle(.glass)` | system | system |
| aksent (tint) | `Plattform.aksent` | #068472 | #54B9A5 |
| tekstknapp på grå flate eller glass | `Plattform.aksentTekst` | #016D5E | #54B9A5 (tint) |
| primærknapp | `.glassProminent` tint aksent | hvit tekst | #0D1013 |
| valgt rad i sidefelt (iPad) | `Plattform.sidefeltValgt` | #068472, hvit tekst | #163F37, label |
| statuspiller | `StatusPille` | som grunnpaletten | som grunnpaletten |

Hengsel-fargene brukes bare til tint, statuspiller, valgt rad og merket. Ingen egne bakgrunner.

**iPad med sidefelt:** `NavigationSplitView`, sidefelt 320 pt med `.listStyle(.sidebar)` (glass på iOS 26). Innholdet er en `insetGrouped`-liste eller to kolonner med kort når bredden er over 900 pt.

### Kontroll, lys

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| label på grouped background | #000000 | #F2F2F7 | 18,82:1 | 4,5:1 | OK |
| label på celle | #000000 | #FFFFFF | 21,00:1 | 4,5:1 | OK |
| secondaryLabel på celle (system) | #8A8A8E | #FFFFFF | 3,44:1 | 4,5:1 | **Under krav** |
| secondaryLabel på grouped background | #85858B | #F2F2F7 | 3,29:1 | 4,5:1 | **Under krav** |
| tertiaryLabel på celle (system) | #C5C5C7 | #FFFFFF | 1,72:1 | 4,5:1 | **Under krav** |
| TekstDempet (Hengsel) på celle | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| TekstDempet på grouped background | #51565C | #F2F2F7 | 6,64:1 | 4,5:1 | OK |
| aksent (tint) på celle | #068472 | #FFFFFF | 4,61:1 | 4,5:1 | OK |
| aksent på grouped background | #068472 | #F2F2F7 | 4,14:1 | 4,5:1 | **Under krav** |
| aksent på glass (fanelinje) | #068472 | #FBFBFD | 4,46:1 | 4,5:1 | **Under krav** |
| paa-aksent på aksent | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| sidefelt valgt: hvit på aksent | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
| AksentTekst på grouped background | #016D5E | #F2F2F7 | 5,62:1 | 4,5:1 | OK |
| AksentTekst på glass | #016D5E | #FBFBFD | 6,06:1 | 4,5:1 | OK |
| AksentTekst på celle | #016D5E | #FFFFFF | 6,27:1 | 4,5:1 | OK |

### Kontroll, mørk

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| label på grouped background | #FFFFFF | #000000 | 21,00:1 | 4,5:1 | OK |
| label på celle | #FFFFFF | #1C1C1E | 17,01:1 | 4,5:1 | OK |
| secondaryLabel på celle (system) | #98989F | #1C1C1E | 5,94:1 | 4,5:1 | OK |
| secondaryLabel på grouped background | #8D8D93 | #000000 | 6,36:1 | 4,5:1 | OK |
| TekstDempet (Hengsel) på celle | #ADB1B7 | #1C1C1E | 7,90:1 | 4,5:1 | OK |
| TekstDempet på grouped background | #ADB1B7 | #000000 | 9,75:1 | 4,5:1 | OK |
| aksent (tint) på celle | #54B9A5 | #1C1C1E | 7,18:1 | 4,5:1 | OK |
| aksent på grouped background | #54B9A5 | #000000 | 8,86:1 | 4,5:1 | OK |
| aksent på glass (fanelinje) | #54B9A5 | #141416 | 7,76:1 | 4,5:1 | OK |
| paa-aksent på aksent | #0D1013 | #54B9A5 | 8,05:1 | 4,5:1 | OK |
| sidefelt valgt: hvit på aksent (systemstandard) | #FFFFFF | #54B9A5 | 2,37:1 | 4,5:1 | **Under krav** |
| sidefelt valgt: label på aksent-valgt (Hengsel) | #FFFFFF | #163F37 | 11,66:1 | 4,5:1 | OK |

Under krav er systemverdier. Derfor finnes `tekstDempet`, `aksentTekst` og `sidefeltValgt`. Glass er regnet som 72 % flate over grouped background (#FBFBFD lys, #141416 mørk). Ekte glass varierer med innholdet bak, så sjekk på enhet.

## d) Montørappen (Expo / React Native)

**Status: foreslått.**

Fil: `tokens/rn/hengsel-tokens.ts` (`montorapp`). Samme roller som iPhone, men med faste hex-verdier og uten glass. Fanelinje og verktøylinje er hele flater (`flate-kort`) med `linje` øverst eller nederst. Systemskrift. Statusfarger fra `grunn` i samme fil.

| Rolle | Lys | Mørk |
|---|---|---|
| flateSide | #F2F2F7 | #000000 |
| flateKort | #FFFFFF | #1C1C1E |
| flateSenket | #E9E9EE | #2C2C2E |
| linje | #D1D1D6 | #38383A |
| kant | #7B8188 | #767B82 (grunnens #6A6F76 har 2,75:1 på flateSenket) |
| tekst | #1A1D22 | #EAEDF0 |
| tekstDempet | #51565C | #ADB1B7 |
| aksent | #068472 | #54B9A5 |
| aksentTekst (aktiv fane, tekstknapper) | #016D5E | #8ACDBE |
| paaAksent | #FFFFFF | #0D1013 |

| Par | Forgrunn | Bakgrunn | Kontrast | Krav | Resultat |
|---|---|---|---|---|---|
| tekst på side (lys) | #1A1D22 | #F2F2F7 | 15,14:1 | 4,5:1 | OK |
| tekst-dempet på kort (lys) | #51565C | #FFFFFF | 7,41:1 | 4,5:1 | OK |
| aktiv fane aksent-tekst på fanelinje (lys) | #016D5E | #FFFFFF | 6,27:1 | 4,5:1 | OK |
| ikon inaktiv fane (lys) | #51565C | #FFFFFF | 7,41:1 | 3:1 | OK |
| kant (lys) | #7B8188 | #FFFFFF | 3,93:1 | 3:1 | OK |
| tekst på side (mørk) | #EAEDF0 | #000000 | 17,87:1 | 4,5:1 | OK |
| tekst-dempet på kort (mørk) | #ADB1B7 | #1C1C1E | 7,90:1 | 4,5:1 | OK |
| aktiv fane aksent på fanelinje (mørk) | #54B9A5 | #1C1C1E | 7,18:1 | 4,5:1 | OK |
| ikon inaktiv fane (mørk) | #ADB1B7 | #1C1C1E | 7,90:1 | 3:1 | OK |
| kant (mørk) | #767B82 | #1C1C1E | 3,99:1 | 3:1 | OK |
| paa-aksent på aksent (mørk) | #0D1013 | #54B9A5 | 8,05:1 | 4,5:1 | OK |
| paa-aksent på aksent (lys) | #FFFFFF | #068472 | 4,61:1 | 4,5:1 | OK |
