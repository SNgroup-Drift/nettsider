# Ikoner

14.10.2026. Strekikoner på 20 px rutenett. Én SVG per ikon i tre størrelser: `16/`, `20/` og `24/`. Fargen er `currentColor`, så den kommer fra tokens (`color: var(--tekst-dempet)` osv.).

- Strek: 1,5 px ved 16, 1,6 px ved 20, 1,75 px ved 24 (samme geometri, justert strek).
- Runde ender og hjørner. Levende flate 2–18 i 20-rutenettet.
- Aktiv tilstand: samme ikon i `--aksent-tekst`. Ikke fylte varianter.
- iOS: bruk SF Symbol i tabellen. «Egen» betyr at SF Symbols ikke har et godt treff, og at SVG-en skal legges inn som eget symbol (eksporter fra 20/ til SF Symbols-mal).

## Meny

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `min-dag.svg` | Min dag | `sun.max` |  | Menypunkt «Min dag» i sidemeny, skuff og «Mer» |
| `samtaler.svg` | Samtaler | `bubble.left.and.bubble.right` |  | Menypunkt «Samtaler» i sidemeny, skuff og «Mer» |
| `innkommende.svg` | Innkommende | `tray.and.arrow.down` |  | Menypunkt «Innkommende» i sidemeny, skuff og «Mer» |
| `salgstavle.svg` | Salgstavle | `rectangle.split.3x1` |  | Menypunkt «Salgstavle» i sidemeny, skuff og «Mer» |
| `kunder.svg` | Kunder | `person.2` |  | Menypunkt «Kunder» i sidemeny, skuff og «Mer» |
| `tilbud.svg` | Tilbud | `doc.text` |  | Menypunkt «Tilbud» i sidemeny, skuff og «Mer» |
| `ordre.svg` | Ordre | `list.clipboard` |  | Menypunkt «Ordre» i sidemeny, skuff og «Mer» |
| `prosjekter.svg` | Prosjekter | `folder` |  | Menypunkt «Prosjekter» i sidemeny, skuff og «Mer» |
| `montasje.svg` | Montasje | `wrench.and.screwdriver` |  | Menypunkt «Montasje» i sidemeny, skuff og «Mer» |
| `prosjektplan.svg` | Prosjektplan | `calendar.day.timeline.left` |  | Menypunkt «Prosjektplan» i sidemeny, skuff og «Mer» |
| `saker.svg` | Saker | `ticket` |  | Menypunkt «Saker» i sidemeny, skuff og «Mer» |
| `bestilling.svg` | Bestilling | `cart` |  | Menypunkt «Bestilling» i sidemeny, skuff og «Mer» |
| `resultater.svg` | Resultater | `chart.line.uptrend.xyaxis` |  | Menypunkt «Resultater» i sidemeny, skuff og «Mer» |
| `fakturaer.svg` | Fakturaer | `receipt` |  | Menypunkt «Fakturaer» i sidemeny, skuff og «Mer» |
| `rapporter.svg` | Rapporter | `chart.bar.doc.horizontal` |  | Menypunkt «Rapporter» i sidemeny, skuff og «Mer» |
| `salgsbanken.svg` | Salgsbanken | `archivebox` |  | Menypunkt «Salgsbanken» i sidemeny, skuff og «Mer» |
| `leder.svg` | Leder | `briefcase` |  | Menypunkt «Leder» i sidemeny, skuff og «Mer» |
| `mitt-team.svg` | Mitt team | `person.3` |  | Menypunkt «Mitt team» i sidemeny, skuff og «Mer» |
| `etterkalkyler.svg` | Etterkalkyler | `plus.forwardslash.minus` |  | Menypunkt «Etterkalkyler» i sidemeny, skuff og «Mer» |
| `utstillinger.svg` | Utstillinger | `storefront` |  | Menypunkt «Utstillinger» i sidemeny, skuff og «Mer» |
| `forskudd-leverandor.svg` | Forskudd til leverandør | `banknote` | Ja, nærmeste: `banknote` | Menypunkt «Forskudd til leverandør» i sidemeny, skuff og «Mer» |
| `unoterte-leverandor.svg` | Unoterte til leverandør | `doc.badge.ellipsis` | Ja, nærmeste: `doc.badge.ellipsis` | Menypunkt «Unoterte til leverandør» i sidemeny, skuff og «Mer» |
| `lager.svg` | Lager | `shippingbox` |  | Menypunkt «Lager» i sidemeny, skuff og «Mer» |
| `innstillinger.svg` | Innstillinger | `slider.horizontal.3` |  | Menypunkt «Innstillinger» i sidemeny, skuff og «Mer» |
| `mer.svg` | Mer | `ellipsis` |  | Menypunkt «Mer» i sidemeny, skuff og «Mer» |

## Verktøy

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `varsler.svg` | Varsler | `bell` |  | Varselknapp i toppfeltet |
| `sok.svg` | Søk | `magnifyingglass` |  | Søkefelt og søkeknapp i toppfeltet |
| `kalender.svg` | Kalender | `calendar` |  | Kalenderknapp i toppfeltet og «Book tegnetime» |
| `oversikt.svg` | Oversikt | `square.grid.2x2` |  | Oversikt og dashbord |

## Trenger handling og saker

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `prisavvik.svg` | Prisavvik / advarsel | `exclamationmark.triangle` |  | «Trenger handling», saker og historikk: prisavvik / advarsel |
| `frist.svg` | Utløper / frist | `hourglass` |  | «Trenger handling», saker og historikk: utløper / frist |
| `stoppet.svg` | Stoppet | `nosign` |  | «Trenger handling», saker og historikk: stoppet |
| `mangler-montor.svg` | Mangler montør | `person.fill.questionmark` |  | «Trenger handling», saker og historikk: mangler montør |
| `endringsfrist.svg` | Endringsfrist | `calendar.badge.exclamationmark` |  | «Trenger handling», saker og historikk: endringsfrist |
| `kontrollmal.svg` | Kontrollmål | `ruler` |  | «Trenger handling», saker og historikk: kontrollmål |
| `reklamasjon.svg` | Reklamasjon | `arrow.uturn.backward` |  | «Trenger handling», saker og historikk: reklamasjon |
| `levering.svg` | Levering | `truck.box` |  | «Trenger handling», saker og historikk: levering |
| `montering.svg` | Montering | `hammer` |  | «Trenger handling», saker og historikk: montering |
| `signert.svg` | Signert | `signature` |  | «Trenger handling», saker og historikk: signert |
| `sendt.svg` | Sendt | `paperplane` |  | «Trenger handling», saker og historikk: sendt |

## Hjelpeikoner

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `pil-hoyre.svg` | Pil høyre | `chevron.right` |  | Rad som åpner noe, brødsmuler |
| `pil-venstre.svg` | Pil venstre | `chevron.left` |  | Tilbake |
| `pluss.svg` | Legg til | `plus` |  | Ny, legg til |
| `lukk.svg` | Lukk | `xmark` |  | Lukk dialog, ark og skuff |
| `hake.svg` | Hake | `checkmark` |  | Fullført, avkrysset, bekreftelse |
| `telefon.svg` | Ring | `phone` |  | Ring kunden |
| `naviger.svg` | Naviger | `location` |  | Adresse, naviger, kart |
| `kamera.svg` | Kamera | `camera` |  | Ta bilde (avvik) |
| `filter.svg` | Filter | `line.3.horizontal.decrease` |  | Filter i tabeller og lister |


Oversikt: `ikoner_oversikt.dc.html` (åpnes i nettleser).
