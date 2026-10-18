# Ikoner

14.10.2026 (utvidet 18.10.2026, 2.5: K-371). Strekikoner på 20 px rutenett. Én SVG per ikon i tre størrelser: `16/`, `20/` og `24/`. Fargen er `currentColor`, så den kommer fra tokens (`color: var(--tekst-dempet)` osv.).

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

## Tillegg 14.10.2026 (K-230, merkepakke v2)

Fire ikoner lagt til i `ikoner.json` (gruppe «meny») fra `hengsel_merke_v2/5-logoer-ikoner/ikoner/`. Kilde: `ikoner-tillegg.json` (ligger ved). Formen er forslag; resten av lista fra K-220/K-222 er ikke mottatt.

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `montasjeplan.svg` | Montasjeplan | `calendar.badge.clock` |  | Menypunkt «Montasjeplan» |
| `innboks.svg` | Innboks | `tray` |  | Menypunkt «Innboks» |
| `profil.svg` | Profil | `person.crop.circle` |  | Menypunkt «Profil», brukermeny |
| `hjelp.svg` | Hjelp | `questionmark.circle` |  | Menypunkt «Hjelp», hjelpeknapp |

## Nye i 2.5: hastenivå

Tre nivåikoner i samme familie (sirkel 7,25 + tegn), så de skiller seg fra statusikonene «Prisavvik» (trekant) og «Frist» (timeglass). Finnes i 12, 16, 20 og 24 px. 12 px brukes inne i Statuspille (strek 2,5 i rutenettet = 1,5 px). Ikonet står aldri alene: ordet «Haster», «Snart» eller «Venter» står alltid ved siden av. Se `dokumentasjon/HASTER.md`.

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `nivaa-haster.svg` | Haster | `exclamationmark.circle` |  | Nivå «Haster» (må gjøres nå): i pillen, prioritetsfeltet og stegraden. Alltid sammen med ordet. |
| `nivaa-snart.svg` | Snart | `clock` |  | Nivå «Snart» (frist om få dager): i pillen og prioritetsfeltet. Alltid sammen med ordet. |
| `nivaa-venter.svg` | Venter | `pause.circle` |  | Venter på svar fra andre (kunde, leverandør). Brukes på nivå «Snart» når grunnen er venting. |

## Nye i 2.5: små ikoner

De 14 ikonene Code manglet. «Sortering opp/ned» er tre filer: `sorter` (kan sorteres), `sorter-opp` og `sorter-ned`. `chevron-hoyre-liten` er tegnet for 16 px (kortere armer enn `pil-hoyre`).

| Fil | Navn | SF Symbol | Egen | Bruk |
|---|---|---|---|---|
| `chevron-ned.svg` | Chevron ned | `chevron.down` |  | Åpne nedtrekk, velger, utvid rad |
| `chevron-hoyre-liten.svg` | Chevron høyre (liten) | `chevron.right` |  | Brødsmuler, lenkerader og «vis mer» i 16 px |
| `sorter.svg` | Sorter | `arrow.up.arrow.down` |  | Kolonne som kan sorteres (ikke sortert nå) |
| `sorter-opp.svg` | Sortert stigende | `arrow.up` |  | Kolonne sortert stigende (A–Å, eldst først) |
| `sorter-ned.svg` | Sortert synkende | `arrow.down` |  | Kolonne sortert synkende (Å–A, nyest først) |
| `kopier.svg` | Kopier | `doc.on.doc` |  | Kopier ordrenummer, lenke eller tekst |
| `e-post.svg` | E-post | `envelope` |  | Send e-post, e-postadresse i kontaktfelt |
| `ekstern-lenke.svg` | Ekstern lenke | `arrow.up.right.square` |  | Lenke som åpner noe utenfor Hengsel (ny fane) |
| `legg-til-bilde.svg` | Legg til bilde | `photo.badge.plus` |  | Last opp bilde (montasje, reklamasjon, befaring) |
| `laster.svg` | Laster | `progress.indicator` |  | Venter på svar fra server. Roterer bare når prefers-reduced-motion ikke er satt; ellers står den stille med teksten «Laster …» |
| `oye.svg` | Vis | `eye` |  | Vis passord, forhåndsvis, «sett av kunden» |
| `flagg.svg` | Flagg | `flag` |  | Merk for oppfølging (eget valg, ikke et hastenivå) |
| `melding.svg` | Melding | `message` |  | Melding, kommentar, intern notat |
| `logg-ut.svg` | Logg ut | `rectangle.portrait.and.arrow.right` |  | Logg ut (brukermeny) |
| `bok.svg` | Håndbok | `book` |  | Håndbok, rutiner, hjelpeartikler |
| `kompass.svg` | Kompass | `safari` |  | Veibeskrivelse, «finn fram», kart over butikker |
