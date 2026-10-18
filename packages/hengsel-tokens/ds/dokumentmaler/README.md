# Dokumentmaler – i Hengsel designsystem 2.10.0 (K-371b)

**Status i repoet (18.10.2026):** Malene er fasit for CRM-ets PDF- og e-postgeneratorer (tilbud, kjøpsavtale, faktura, e-postene E1–E10 og resten av de 28). Generatorene kobles til malene i en egen K; til da er dette bare designfilene. Innholdet er Designs 2.10 (rent Hengsel, uten kundetema) uendret. `eksempel.html` og `side-N.png` viser Hengsel standard. Bare `#B54F00` (Hengsel-merket) er hex i `mal.html`, `mal.css` og `eksempel.html` (kontrollert med grep). Kundens verdier ligger i databasen og settes i Admin (K-357). Listen over de 28 står også i `../maler.md`.

---

# Dokumentmaler – eksport til Hengsel designsystem 2.0

Eksportert 18.10.2026 fra prosjektet CRM_v4. Alle dokumentene som er tegnet i prosjektet, laget som maler der kundens logo, farger, skrift og hjørner kommer inn som variabler fra kundetemaet. Ingenting kundespesifikt ligger i malene. Kundens verdier settes i Admin (21-914 Merkevare) og lagres i databasen. Eneste eksempel er Hengsel standard i `kundetema-hengsel-standard.json`.

Alle navn, adresser, numre og beløp i eksemplene er oppdiktet.

## Innhold

```
README.md
kundetema.schema.json          variablene malene bruker (--kt-* og {{kunde.*}})
kundetema-hengsel-standard.json  Hengsels nøytrale standardverdier (forslag), for testing
tema/hengsel.css               Hengsel standard som CSS, bare for eksempel.html
felles/fonter.css + fonter/    Schibsted Grotesk, bare for eksemplene
felles/hengsel-merke-oransje.svg  Hengsel-merket i #B54F00 til bunnlinja
NN-navn/
  mal.html       malen med flettefelt
  mal.css        felles A4-oppsett (likt i alle mapper). Ingen hex ut over #B54F00
  eksempel.html  samme mal fylt med demodata. ?tema=hengsel bytter tema
  felter.json    alle flettefelt, hvilke sider de står på, og eksempelverdi
  side-1.png …   forhåndsvisning per side (Hengsel standard)
```

## Dokumentene (29 maler, 55 sider)

| Nr | Mappe | Dokument | Familie | Sider | Brukes i | Varianter | Kilde |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | `01-tilbud/` | Tilbud | salg | 5 | CRM-PDF, vedlegg i e-post (E2), Min side | Med eller uten forsidebilde (vis.bilde). Godkjent / ikke godkjent (tilbud.status, kilde fil 10 T05.5–T05.6) | Fil 43 TP1–TP5 |
| 02 | `02-tilvalgsliste/` | Tilvalgsliste | salg | 2 | CRM-PDF, Min side (prosjektkjøper), vedlegg i tilvalgs-e-post | Med tilvalg / uten endringer (bekreftet standard). Med eller uten BankID (prosjekt.bankid) | Fil 44 TV1–TV2 |
| 03 | `03-anbud/` | Anbud | salg | 8 | CRM-PDF, prosjektportal | Proff. Med eller uten bilder (vis.bilde) | Fil 44 AN1–AN8 |
| 04 | `04-mal-og-skisser/` | Mål og skisser-rapport | montasje | 6 | CRM-PDF (K-103), Ordre › Dokumenter | Bilde og mål på hver sin side (side 3 og 4) eller på samme side (side 5) når det får plass. Sidetallet følger antall arbeidsområder og bilder | Fil 32 PF1–PF6 |
| 05 | `05-kjopsavtale/` | Kjøpsavtale | avtale | 4 | CRM-PDF til Penneo (K-104), Min side, e-post etter signering | Privat. Med eller uten forsidebilde (vis.bilde). Én eller to kjøpere på signeringssiden | Fil 41 KA1–KA4 |
| 06 | `06-rammeavtale-proff/` | Rammeavtale (kundeavtale proff) | avtale | 3 | CRM-PDF til Penneo (M01.5–M01.6) | Proff. Med eller uten forsidebilde (vis.bilde) og illustrasjon (vis.illustrasjon) | Fil 20 M01.5 |
| 07 | `07-bestilling-utkjoring/` | Bestilling av utkjøring | logistikk | 1 | PDF vedlagt e-post til utkjører (M03.10), utskrift | Ingen | Fil 20 M03.10 |
| 08 | `08-innbaering-og-levering/` | Instruks for innbæring og levering | logistikk | 1 | Vedlegg til kjøpsavtalen (vedlegg 3), vedlegg i E6, Min side | Ingen | Fil 51 PDF-A |
| 09 | `09-kolli-etiketter-a4/` | Kolli-etiketter, A4 3 × 8 | logistikk | 1 | Utskrift på vanlig skriver (LG7.1, LC5) | Startposisjon: brukte posisjoner før startnummer står tomme (etiketter med tom:true) | Fil 36 LG7.1 og fil 47 LC5 |
| 10 | `10-montasjeplan/` | Montasjeplan (utskrift) | montasje | 1 | Utskrift og PDF fra Mer › Montasje (D8) | Liggende eller stående. Med eller uten adresse og telefon, kollistatus og interne notater (vis.*). Én side per montør | Fil 65 D8 og fil 63 |
| 11 | `11-montorens-oppdrag/` | Montørens oppdrag | montasje | 1 | PDF fra Ordre › Montasje › «Skriv ut oppdrag», Dokumenter, Hengsel Ute | Ingen. Priser og innpris står aldri her | Fil 51 PDF-B |
| 12 | `12-monteringsrapport/` | Monteringsrapport | montasje | 1 | CRM-PDF (D5), Min side, leveringspakke del 2 | Med eller uten bilder (vis.bilder). Med eller uten restpunkt | Fil 36 LG8 |
| 13 | `13-punktrapport/` | Punktrapport | montasje | 2 | CRM-PDF (R-PDF, D6) og Hengsel Ute. Lagres i Dokumenter og leveringspakke del 2 | Omfang: alle faser, KS, befaring, montering, reklamasjon eller bare åpne. Mottaker: kunde (uten saksnummer og interne kommentarer), intern, entreprenør. Samme mal som KS-rapport | Fil 50 R-PDF |
| 14 | `14-leveringspakke-del-2/` | Leveringspakke del 2 (FDV, garanti, vedlikehold) | montasje | 4 | CRM-PDF etter ferdig montering (D7), Min side «Ditt nye kjøkken» | Bare overflatene og produktene kunden har (fra ordrelinjene). Antall dokumenter varierer | Fil 48 LP3, K14.1–K14.3 |
| 15 | `15-ordrebekreftelse/` | Ordrebekreftelse **(NY)** | økonomi | 1 | CRM-PDF ved «Send ordrebekreftelse» (D3), e-post, SMS-lenke, Min side | Privat / proff (proff viser org.nr og eks. mva) | NY. Tegnet etter fil 65 D3 og fil 41 KA2. Ikke tegnet som dokument før |
| 16 | `16-faktura/` | Faktura **(NY)** | økonomi | 1 | CRM-PDF fra «Lag faktura» (D9) før «Send til regnskap», e-post og Min side. Erstatter ikke PowerOffice-malen | Forskudd / sluttfaktura / kreditnota (faktura.type). Privat / proff | NY. Tegnet etter fil 65 D9. PowerOffice-mal finnes ikke i prosjektet |
| 28 | `28-etikett-62x100/` | Kolli-etikett 62 × 100 mm | annet | 1 | Etikettskriver (LG7) | Ingen | Fil 36 LG7 |
| 29 | `29-e11-hvordan-gikk-det/` | E-post: Hvordan gikk det? (E11) | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 52 E11 |
| 17 | `17-e1-engangskode/` | E-post: Engangskode | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 40 E1 |
| 18 | `18-e2-tilbudet-er-klart/` | E-post: Tilbudet er klart | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 40 E2 |
| 19 | `19-e3-nytt-svar/` | E-post: Nytt svar på Min side | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 40 E3 |
| 20 | `20-e6-leveringstid-bekreftet/` | E-post: Leveringstid bekreftet | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 51 E6 |
| 21 | `21-e7-montering-i-morgen/` | E-post: Montering i morgen | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 51 E7 |
| 22 | `22-e8-utkjorer-pa-vei/` | E-post: Utkjører på vei | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 51 E8 |
| 23 | `23-e9-ferdig-montert/` | E-post: Ferdig montert | kundeportal/e-post | 1 | E-post fra appen (kunde) | Ingen | Fil 51 E9 |
| 24 | `24-e4-kunden-har-sendt-tilvalg/` | E-post: Kunden har sendt tilvalg | kundeportal/e-post | 1 | E-post fra appen (ansatt) | Ingen | Fil 40 E4 |
| 25 | `25-e4-1-tilvalg-uten-endringer/` | E-post: Tilvalg uten endringer | kundeportal/e-post | 1 | E-post fra appen (ansatt) | Ingen | Fil 40 E4.1 |
| 26 | `26-e5-kunden-har-skrevet/` | E-post: Kunden har skrevet | kundeportal/e-post | 1 | E-post fra appen (ansatt) | Ingen | Fil 40 E5 |
| 27 | `27-e10-bestilling-til-leverandor/` | E-post: Bestilling til leverandør | annet | 1 | E-post fra appen (leverandør) | Ingen | Fil 51 E10 |

Faktura og ordrebekreftelse fantes ikke som tegnede dokumenter (bare CRM-skjermene D3 og D9 i fil 65). De er tegnet på nytt med CRM-felt, som avtalt 18.10. Det finnes ingen PowerOffice-mal i prosjektet, så det er ingen PowerOffice-felt ({InvoiceNo} osv.) i pakken.

## Kundetema

Malene leser bare disse ti variablene og fem plassene:

- `--kt-bakgrunn`, `--kt-flate`, `--kt-felt`, `--kt-tekst`, `--kt-aksent`, `--kt-lenke`, `--kt-kant`, `--kt-skrift-overskrift`, `--kt-skrift-tekst`, `--kt-hjorner` (kantet 6 · myk 12 · rund 999)
- `{{kunde.navn}}`, `{{kunde.kortnavn}}`, `{{kunde.logo_lys}}`, `{{kunde.logo_mork}}`, `{{kunde.favicon}}`

Utledet i `mal.css`: dempet tekst (tekst 74 % mot bakgrunn), delelinjer (kant 24 % mot bakgrunn), tekst på aksent (= bakgrunn), og tre radier: kort = min(hjørner, 14 px), liten = min(hjørner, 6 px), knapp og pille = hjørner.

Temaet settes inn i `<style id="kundetema">` øverst i `mal.html` som `:root { --kt-…: … }`.

`{{kunde.*}}` er Hengsels kunde (butikken eller kjeden). `{{butikk.*}}` er avdelingen som sender dokumentet (adresse, org.nr, telefon, fra I16). `{{kjoper.*}}` er sluttkunden. `{{leverandor.navn}}` er produsenten, som før stod med navn i teksten.

## Felles mål

- **Ark:** A4 stående, 210 × 297 mm. Montasjeplan A4 liggende (navngitt side `liggende`). Etikett 62 × 100 mm (navngitt side `etikett`).
- **@page:** `size: A4; margin: 0`. Bakgrunnen dekker hele arket (full-bleed). Margene ligger i arket: 16 mm sider, 12 mm topp, 9 mm bunn.
- **Topptekst (gjentas):** logofelt til venstre, 12 mm høyt og maks 48 mm bredt, `object-fit: contain`, venstrestilt. Dokumentnavn og nummer til høyre, 9,5/8,5 pt. Linje under.
- **Bunntekst (gjentas):** «Levert av Hengsel» med merket (3,6 mm, #B54F00) til venstre, dokumentreferanse i midten, «Side x av y» til høyre, 7,5 pt. Linje over.
- **Gjentakelse:** hvert ark er én `<section class="side">` med en ytre tabell (`thead` = topptekst, `tfoot` = bunntekst). Blir innholdet lengre enn ett ark, gjentar nettleseren topp- og bunntekst og tabellhodet på neste side. `tr { break-inside: avoid }`.
- **Kolonner:** to kolonner 1fr + 1fr med 8 mm mellomrom, tre med 5 mm, fire med 4 mm. Nøkkel–verdi: 40 mm etikett + resten.
- **Skrift:** brødtekst 9,5 pt / 1,4. Tabeller 9 pt, tabellhode 8 pt. Ingress 11 pt. h3 10 pt halvfet. Overskrifter i `--kt-skrift-overskrift`: h1 24 pt (forside 34 pt), h2 16 pt, store tall 26 pt. Serif aldri under 16 pt. Beløp i `--kt-skrift-tekst`, 24 pt halvfet. Tabulære tall overalt.
- **Sum:** «Totalt», «Beløp å betale» og tilsvarende står alltid i betalingsboksen (`--kt-flate`) i 24 pt, det største tallet på siden.
- **E-post:** 600 px bredt kort på `--kt-flate`, kort i `--kt-bakgrunn`, logo 32 px høy, h1 28 px, tekst 15 px. Knapp i `--kt-aksent`.

## Kontrast

Regnet med verdiene i Hengsel standard (dempet tekst og delelinjer er regnet etter blandingen i `mal.css`). Den holder kravene.

| Test | Krav | Hengsel standard |
| --- | --- | --- |
| Tekst på bakgrunn | 4.5:1 | | 16,7:1 |
| Tekst på flate (betalingsboks) | 4.5:1 | | 14,76:1 |
| Tekst på felt (kort) | 4.5:1 | | 15,58:1 |
| Dempet tekst på bakgrunn | 4.5:1 | | 7,99:1 |
| Dempet tekst på felt | 4.5:1 | | 7,45:1 |
| Tekst på aksent (knapp, pille) | 4.5:1 | | 7:1 |
| Lenke på bakgrunn | 4.5:1 | | 7:1 |
| Lenke på felt | 4.5:1 | | 6,53:1 |
| Kant på bakgrunn | 3:1 | | 5,05:1 |
| Kant på flate | 3:1 | | 4,46:1 |
| Kant på felt | 3:1 | | 4,71:1 |

Delelinjene mellom tabellrader er pynt (24 % av kanten) og har ikke krav. Kanter med betydning (tabellhode, sumlinje, skrivefelt, avkrysning, piller) bruker `--kt-kant` fullt ut.

## Endret fra kildene

- Skrift og farger er erstattet med `--kt-*`. Butikkens navn og logo er `{{kunde.*}}` og `{{butikk.*}}`.
- Produsentnavnet i teksten er byttet med `{{leverandor.navn}}`, også i de juridiske tekstene (kjøpsavtale punkt 6, rammeavtale punkt 3, 5 og 6, tilbud «Greit å vite», anbud «Om oss»). Resten av de juridiske tekstene er ordrett. «Vilkår for privatkunder, versjon 2026.2» er `{{vilkar.versjon}}`.
- Sidetall står som «Side x av y» i alle maler (anbudet hadde «1 / 8», rammeavtalen «2 / 3»).
- Rammeavtalen: kunden «Lena Bygg AS» er `{{proffkunde.*}}`.
- Bestilling av utkjøring: merkingen «SIG-…» i eksemplet er byttet til «LA-…».
- Hengsel-merket i bunnlinja er nytt i alle maler. Kildene hadde butikkens adresse i bunnlinja, og den står fortsatt i midten.
- Montørens oppdrag, Innbæring og levering og Punktrapport hadde egen bunnlinje med adresse. Den er flyttet til den felles bunnlinja.
- Tilbudets forside: totalbeløpet står i betalingsboksen.
- Ordrebekreftelse (15) og faktura (16) er nye, tegnet etter fil 65 D3 og D9.

## Ikke gjort variabelt (og hvorfor)

1. **Hengsel-oransje #B54F00** i bunnlinja. Fast etter bestillingen, uavhengig av kundetema.
2. **«Side x av y».** x telles med en CSS-teller per ark. y er feltet `{{dok.sider}}`, fordi CSS ikke kan telle totalen utenfor `@page`-margbokser, og de krever marger som bryter full-bleed. Blir ett ark lengre enn én side ved utskrift, teller x arket, ikke den trykte siden. Hengsel 2.0 bør dele lange lister i flere ark eller telle sidene i PDF-motoren.
3. **Etiketter (09 og 28).** Ingen topptekst, bunntekst eller Hengsel-bunnlinje. Etikettarkets mål (70 × 37,1 mm, 3 × 8) og etikettskriverens 62 × 100 mm er faste.
4. **Arkmål og marger** er faste i mm (A4, 16/12/9 mm). De er ikke en del av kundetemaet.
5. **E-post:** CSS-variabler, `color-mix()` og `min()` virker ikke i mange e-postprogrammer. Malen bruker `--kt-*`, men Hengsel 2.0 må sette inn ferdige verdier og legge stilene inline før sending. Logoen må ligge på en offentlig adresse.
6. **`color-mix(in oklab, …)`** for dempet tekst og linjer krever en moderne PDF-motor (Chrome 111 eller nyere). Eldre motorer trenger ferdig utregnede verdier.
7. **Mørk logo.** Malene bruker `{{kunde.logo_lys}}`. Hengsel 2.0 velger `{{kunde.logo_mork}}` når `--kt-bakgrunn` er mørk. Det kan ikke avgjøres i CSS.
8. **Tekst på aksent** er bakgrunnsfargen. Er aksenten lys, blir kontrasten for svak. Temaet må da ha mørk bakgrunn eller mørk aksent. Det må sjekkes når temaet lagres, for schemaet kan ikke regne kontrast.
9. **Bilder.** Forsidebilde, tegninger, KS-bilder og QR-koder er flettefelt. Det er ingen merkevarebilder i pakken, og eksemplene viser en tom plass med bildetekst.
10. **Skrift** i eksemplene er Schibsted Grotesk. Andre skrifter fra kundetemaet lastes som egen fontfil (`@font-face`).

## Flettefelt

- CRM-feltform `{{objekt.felt}}`. Lister: `{{#liste}}…{{/liste}}`. Varianter: `{{#vis.bilde}}…{{/vis.bilde}}`, og `{{^x}}…{{/x}}` for «hvis ikke».
- Kildene hadde ingen flettefelt. Alle felt er laget ut fra innholdet og merket `NY` i `felter.json` (`kunde.*` er merket `kundetema`).
- Ingen PowerOffice-felt, fordi PowerOffice-malene ikke finnes i prosjektet.
