# Hengsel – designsystem

Hengsel er et system for kjøkken- og interiørbutikker. Salg, tilbud, bestilling, montasje og kundeportal ligger på samme ordre og samme kundekort, og montørene har en egen app («Hengsel»). Systemet er bygget i en kjøkkenbutikk med tre avdelinger. Nettsiden er hengsel.no.

Uttrykket er varmt, rolig, nordisk og samtidig. Farger og typografi er hentet fra Sigdal-profilen, men Hengsel har eget merke og bruker **aldri** sigdal-logoen eller Sigdal-produktnavn.

## Kilder
- Pakken `hengsel-designsystem/` (lokal mappe): `README.md` (fasit for uttrykk, farger, typografi, komponenter og flater), `tokens.css` (fasit for alle verdier), `components.html`, `assets/` og `referanser/`. Kopier ligger i `uploads/`.
- Nettsiden https://www.hengsel.no – tekst til nettside-kitet er hentet derfra.
- `referanser/` er skjermbilder av dagens løsning, brukt for oppsett og tetthet – ikke fasit for stil. Der referansene avviker fra README (f.eks. lilla piller, blå «På vei»-knapp), følger systemet README.

## Produkter / flater
1. **CRM på PC (1440)** – Min dag, samtaler, salgstavle, kundekort, tilbud, ordre, bestilling, montasje, saker, leder og resultater.
2. **CRM på iPad (1180 liggende)** – Min dag og ordre.
3. **Montørappen «Hengsel»** (telefon 390, iPad) – I dag, jobb (info, varer, dokumenter, bilder), KS, avvik, ferdig montert med signatur.
4. **Kundeportalen** (telefon og PC) – avtale, signering, tillegg til godkjenning.
5. **Nettsiden hengsel.no.**

---

## CONTENT FUNDAMENTALS
- **Språk:** norsk bokmål, alltid. Rett på sak og informativt, avslappet. Ikke byråkratisk, ikke markedsføringstungt.
- **Person:** systemet snakker til brukeren med «du/deg» («8 ting venter på deg», «Venter på deg»). Nettsiden snakker til butikken med «dere» og om seg selv med «vi» («Vi går gjennom stegene sammen med dere»).
- **Hilsen:** personlig og kort på startskjermer – «God morgen, Kristine.», «God morgen, Tor.», «Hei Kari, her er kjøkkenet ditt.» Punktum i titler som er hele setninger.
- **Store/små bokstaver:** setningsstil overalt («Ny aktivitet», «Ferdig montert»). Versaler bare i eyebrow-etiketter («NESTE · 08.00», «KS UNDER MONTERING»).
- **Metalinjer:** ledd skilles med midtprikk « · »: «Ordre O-2417 · Hamar · montering uke 42», «20,8 t · 49,6 enheter».
- **Knapper:** verb eller kort handling – «Svar», «Utsett», «Send avvik», «Godta OB», «Be om ny OB», «Ferdig – neste», «På vei».
- **Varsler:** fet innledning + kort fakta: «**Mangler noe.** Kjøleskap kommer uke 46 · benkeplate ikke bekreftet.»
- **Tall:** norsk format – mellomrom som tusenskille, komma som desimal, «kr» etter: «257 700 kr», «1,31 mill», «35 %». Datoer: «mandag 5. oktober», «28.–30. oktober», «uke 44». Klokkeslett med punktum: «08.00».
- **Domeneord:** OB (ordrebekreftelse), KS (kvalitetssikring), kontrollmål, endringsfrist, restpunkt, tilleggsarbeid, etterkalkyle, typeskilt.
- **Emoji:** brukes ikke. Unicode brukes bare som tegn i tekst: «·», «›», «→», «–», «…».
- **Eksempeldata:** bare oppdiktede navn (Kari og Ola Nordmann, Tor, Nina, Kristine) og nøytrale butikker (Hamar, Gjøvik, Lillehammer, «Kjøkkenstudio Hamar»). Aldri ekte kunder, beløp, kjedenavn eller sigdal-logo. Merk demoskjermer «Demo – ingen ekte kunder».

## VISUAL FOUNDATIONS
- **Farger:** bare åtte – Warm Black #31261D, Off White #FBF9F6, Beige 4 #F8F2EC, Beige 3 #F2E9DB, Beige 2 #E4D4C4, Beige 1 #C3B5A7, Deep Blue #5074A9, Dusty Blue #9CA9BD. Status ok #3F7A52, varsel #8A5D14, feil #8E3522 brukes bare i piller og varsler, alltid med tekst. Aldri ren hvit, aldri rosa/magenta, ingen lilla.
- **Fargevekt:** flatene er papir og sand. Deep Blue er sparsom aksent: primærknapp, lenker, fokus, valgt rad. Farge gir dybde, ikke lekenhet.
- **Mørk modus:** flater #1B1713 (app) og #26201A (kort), tekst #F1E9DE, aksent Dusty Blue, myke statusfarger. Settes med `data-theme="dark"` på `<html>` eller et hvilket som helst element. For å følge systemvalget: sett `data-theme` fra `matchMedia('(prefers-color-scheme: dark)')` i JS.
- **Typografi:** titler og store tall i Newsreader 400 (reserve Georgia). Tekst i Inter 400, knapper, etiketter og eyebrow i Inter 500. Underoverskrifter i Inter 600 – aldri på store overskrifter. Serif aldri under 1,45 rem og aldri bare versaler. Positiv sperring (0,06 em) bare på eyebrow. Tabular-nums i tabeller og nøkkeltall. Brødtekst 17 px / 1,6, maks 62 tegn.
- **Bakgrunner:** ensfargede flater. Ingen gradienter, mønstre, teksturer eller illustrasjoner. Seksjonsbånd veksler mellom Off White og Beige 3. Bilder er interiørfoto av kjøkken – varme, lyse, naturlig lys, rolige farger – vist i kort med avrundede hjørner.
- **Kort:** Off White på Beige 3, 1 px Beige 2-ramme, radius 14 px, luft 20/22 px. Svevekort har ingen ramme og myk, varm skygge (`--shadow`). Ikke kort på kort; inne i kort brukes Beige 4-fliser (radius 10) for nøkkel/verdi.
- **Radier:** 8 (små), 10 (felt, fliser), 14 (kort), 20 (store flater), pille (knapper, piller, faner).
- **Linjer:** 1 px Beige 2. Venstrestrek på 3 px (inset) markerer valgt rad (Deep Blue) og varsler (statusfarge).
- **Skygger:** bare `--shadow` på svevekort og demo-kontroller. Ingen indre skygger.
- **Knapper:** pilleform, minst 44 px (56 px i montørappen). Primær Deep Blue, sekundær omriss i Warm Black, mørk Warm Black fylt, ghost uten ramme.
- **Hover:** sekundær fylles med Warm Black og får Off White tekst; primær/mørk dempes til 88 % opasitet; rader og menypunkter får Beige 4. **Trykk:** knapper flyttes 1 px ned. **Disabled:** 45 % opasitet.
- **Fokus:** 2 px bakgrunnsring + 2 px Deep Blue-ring (`--focus`). Felt får Deep Blue-kant og 3 px svak blå glorie.
- **Animasjon:** nesten ingen. Korte overganger (160 ms, `cubic-bezier(.2,.7,.2,1)`) på farge, bryter og fremdriftsstolpe. Ingen sprett, ingen parallakse.
- **Gjennomsiktighet og blur:** brukes ikke.
- **Layout:** CRM har fast sidemeny til venstre (248–256 px PC, 220 px iPad) og innhold som scroller. Min dag: arbeidsliste til venstre, valgt rad åpnes i panel til høyre. Montørappen: festet handlingsfelt eller fanelinje nederst. Innholdsbredde maks 1180 px.
- **Avstand:** 4 px-skala – 4, 8, 12, 16, 24, 32, 48, 64, 96.

## ICONOGRAPHY
- Linjeikoner med **1,5 px strek** i Warm Black eller muted; Deep Blue for handlingsikoner (legg til, ring, melding, veibeskrivelse).
- Pakken inneholder ingen ikonfiler. Referansene ser ut som **Lucide** (clipboard, circle-plus, user, message-circle, phone, navigation, triangle-alert, circle-check, camera). Systemet laster derfor Lucide 0.460.0 fra CDN via `Icon`-komponenten, med streken låst til 1,5 px. **Dette er en erstatning – bekreft settet.**
- Ikoner står alltid sammen med tekst, unntatt i runde ikonknapper med `label`.
- Ingen emoji, ingen ikonfont, ingen PNG-ikoner. Unicode «›» og «→» brukes som tekstpiler.
- Merket: se «Logo og kundens logo» under.

## Logo og kundens logo
Fasit: `guidelines/hengsel-merke.md` (besluttet 06.10.2026). Hengsel er CRM-systemet og avsender i bakgrunnen; **kundens logo står alltid først og størst**.
- **Logoen** = tre deler som alltid står samlet: H-merket bygget av kjøkkenet i app-ikonet (vater = venstre stamme, høyskap = høyre stamme, benkeplate = tverrstrek, overskap/komfyr/underskap i mellom), «engsel» i Inter 400, og produktnavn «CRM» eller «UTE» under ordet (høyrestilt, Inter 600, versaler) med en Deep Blue hake over. «by» brukes ikke.
- **Komponent:** `Brand` (`size` = px på «engsel»; `product` = 'CRM' | 'UTE'; `crm={false}` uten produktnavn; `markOnly` for bare merket). Tokens: `--mark-cab`, `--mark-level`, `--mark-grip`, `--mark-check`, `--mark-word`, `--mark-crm` – følger `data-theme`; `data-surface="blue"` på blå flater. Flate → variant: blå → -bla (primær), hvit/beige → -lys (blå skap), Warm Black → -mork. Retningslinjer: `guidelines/Logo-utforsking.html`.
- **Størrelser:** stor 40–48 px, sidemeny 20 px (under kundelogo) eller 28 px alene, minimum 16 px (produktnavn og hake har minimum 7 px og følger alltid med); under det merket alene som app-ikon. Luft rundt = høyden på merket.
- **Plassering:** sidemeny = kundelogo 30 px høy (maks 180 bred) + Hengsel under. Telefon = bare kundelogo i toppfeltet (22–24 px), Hengsel nederst i menyen. Innlogging = kundelogo i midten, Hengsel nederst. Kundeportal = kundelogo øverst, «Levert med» + Hengsel i bunnteksten. PDF = Hengsel liten i bunnlinjen. Utkjører-appen = Hengsel i Profil.
- **Kundens logo:** `CustomerLogo` (`src`, `srcDark`, `name`). Lastes opp i Innstillinger › Firma og brukere › Logo (I31), vises i original farge og proporsjon. Navn og logo hentes fra kunden (I31) og butikken (I16) – aldri fast i løsningen. UI-kitene bruker «Kjøkkenstudio Hamar» som navn-plassholder.
- **Ikke:** haken inne i merket, serif i ordet, merket skilt fra «engsel», Hengsel større enn kundens logo, andre farger, effekter, strekk eller rotasjon.
- **Filer (endelige, 09.10.2026):** `assets/logo/` – `hengsel-crm-logo-lys/-mork/-bla.svg`, `hengsel-ute-logo-lys/-mork/-bla.svg`, `hengsel-logo-lys/-mork/-bla.svg` (uten produktnavn), `hengsel-merke-lys/-mork/-bla.svg`, `hengsel-app-ikon-lys/-mork/-android/-mono.svg`. Teksten er konturer – filene kan brukes rett ut. Forrige merke ligger i `assets/arkiv/v1-dorer/`. Utforskingen ligger i `guidelines/Logo-utforsking.html`.

## Fonter
- Begge skriftene lastes fra Google Fonts i `tokens/fonts.css`. Ingen skriftfiler ligger i pakken.
- **Titler:** Newsreader 400 (`--f-display`).
- **Tekst:** Inter 400 (`--w-body`), 500 for knapper, etiketter og eyebrow (`--w-medium`), 600 for underoverskrifter (`--w-strong`).
- Sigdals lisensierte skrifter (Reckless, TWK Lausanne) brukes ikke i Hengsel.

---

## Indeks
- `styles.css` – inngang; bare `@import`.
- `tokens/` – `fonts.css`, `colors.css` (merkevare, roller, status, lys/mørk), `typography.css`, `spacing.css` (radier, skala, skygge, fokus), `base.css` (fasit-klassene fra tokens.css: `.btn`, `.card`, `.pill`, `.tabs`, `.input`, `.row` …), `components.css` (utvidede `h-*`-klasser).
- `guidelines/` – grunnkort for Colors, Type, Spacing og Brand.
- `assets/` – merket, app-ikonet og `referanser/` (skjermbilder fra hengsel.no).
- `components/` – React-komponenter (se under).
- `ui_kits/` – `crm/`, `montorapp/`, `kundeportal/`, `nettside/`, og `_shared/SignaturePad.jsx`.
- `SKILL.md` – for bruk som Agent Skill.

## Components
- `components/actions/` – **Button**, **IconButton**
- `components/status/` – **Pill**, **Alert**
- `components/layout/` – **Card**, **Stat** (nøkkeltall), **ListRow**
- `components/forms/` – **Field** (input, textarea, select), **Switch**, **Stepper**
- `components/navigation/` – **SegmentedTabs** (segment, chips, soft), **Sidebar**, **Topbar**, **PageHeader**
- `components/devices/` – **PhoneFrame** (telefon 390), **TabletFrame** (iPad 1180)
- `components/brand/` – **Brand**, **CustomerLogo**, **Icon**

### Intentional additions
Utover listen i oppdraget (knapper, piller, segmentfaner, kort, listerader, skjemafelt, nøkkeltall, toppfelt, sidemeny, telefon- og iPad-oppsett):
- **Alert** – README sier statusfarger brukes i «piller og varsler»; varslene finnes på ordre og i montørappen.
- **IconButton** – «…»-meny og ring/melding i montørappen.
- **Switch**, **Stepper** – avviksskjemaet i montørappen («Trengs ny vare?», Antall).
- **PageHeader** – sidehodet i CRM (metalinje, serif-tittel, handlinger).
- **Brand**, **CustomerLogo**, **Icon** – Hengsel-logoen, kundens logo (med navn-plassholder) og Lucide-innpakning med 1,5 px strek.

## UI kits
- `ui_kits/crm/` – Min dag og Ordre, PC og iPad, lys og mørk. Andre menypunkter er bevisst tomme (ingen referanse).
- `ui_kits/montorapp/` – I dag → jobb (Info/Varer/Dokumenter/Bilder) → KS → avvik → ferdig montert med signatur. Telefon og iPad.
- `ui_kits/kundeportal/` – tilbud med tilvalg, signering, tillegg til godkjenning og reisen. PC og telefon.
- `ui_kits/nettside/` – hengsel.no forside med tekst fra nettsiden.
