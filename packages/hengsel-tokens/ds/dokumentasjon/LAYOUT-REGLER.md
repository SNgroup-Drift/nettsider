# Layout-regler for Hengsel

Fastsatt av Eirik 16.10.2026 (S-67). Gjelder alt nytt i CRM, Hengsel Ute og kundeportalen. Tokens: `tokens/layout.css`. Komponenter: `Rutenett`, `Rad`, `Flis` (components/layout) og `Sidemeny` med bred/smal (components/navigation). Visuell side: `guidelines/layout-regler.html`.

Målet er ro og symmetri: lik størrelse = likt innhold, og hver rad går alltid opp. Modellen er Salesforce Lightning sitt 12-kolonners rutenett med faste kort – ikke SuperOffices frie dra-og-strekk-fliser.

Regnestykket bak breddene (1280 px innhold, 24 px mellomrom): 1/4 = 302 px, 1/3 = 411 px, 1/2 = 628 px. 302 px er for smalt til lister og skjema med 14 px tekst. Derfor er 1/3 minste bredde for innhold, og 1/4 finnes bare for tall.

## 1. Rutenett
- PC 1440: 12 kolonner, 24 px mellomrom, 32 px sidemarg. Innhold maks 1280 px, venstrestilt etter menyen.
- iPad 1024: 8 kolonner, 20 px mellomrom, 24 px marg.
- Telefon 390: 4 kolonner, 16 px mellomrom, 16 px marg. Alt i én kolonne.
- Avstander bare fra skalaen 4, 8, 12, 16, 24, 32, 48 px (tokens). Aldri frie tall.

## 2. Fliser (kort)
- Bredder: 1/3 (4 kol.), 1/2 (6 kol.), 1/1 (12 kol.) for alt innhold. 1/4 (3 kol.) bare for flisklassen Tall. Ingen andre brøker (ikke 1/5, 1/6). iPad: 1/2 og 1/1 (1/4-tall blir 2 × 2). Telefon: alltid 1/1.
- En flis er én ting: ett tall, én liste, ett skjema, ett steg. To ting = to fliser.
- Samme høyde på fliser i samme rad. Innholdet styrer radens høyde. Aldri tomt rom nederst i en flis.
- Oppbygging, alltid i denne rekkefølgen: tittel (evt. tall til høyre), innhold, handling nederst til høyre. Maks én hovedknapp per flis.
- Innvendig luft 24 px på PC, 16 px på telefon. Kantradius og skygge bare fra tokens (ett nivå).

## 2b. Symmetri – en rad går alltid opp
- En rad fyller alltid hele bredden. Lovlige rader på PC: [1/1], [1/2 + 1/2], [1/3 ×3], [1/4 ×4 – bare tall], [2/3 + 1/3] (bare når 1/3-flisen er et sammendrag av 2/3-flisen). Ingen andre. Aldri 1/4 og 1/3 i samme rad.
- Aldri rad med tomt felt. To 1/3 og luft er ikke lov – da 1/2 + 1/2, eller den siste blir 1/1.
- Tall (KPI): tre tall som 1/3 ×3, fire tall som 1/4 ×4. Fem finnes ikke; seks = to rader à tre.
- Alle fliser i en rad har samme høyde og toppkant; kolonnegrensene er like nedover hele siden.
- iPad: [1/1], [1/2 + 1/2] og tall 2 × 2. Telefon: bare [1/1]. Rekkefølgen er leserekkefølgen fra PC.
- Speilet oppsett: samme type side ser lik ut overalt. Kunde, tilbud og ordre har samme topp, samme første rad (tall) og samme plass for handlinger.

## 2c. Flisklasser – lik størrelse, likt innhold
Bredde 1/4 – bare dette:
- Tall: etikett 14 + ett tall 32 (tabulære sifre) + undertekst 12. Fast høyde 120 px.

Bredde 1/3 – bare disse:
- Tall (som over).
- Kortliste: tittel 16/600 + maks 5 rader 14 px (én linje, kuttes med …) + «Vis alle (n)». Fast høyde 320 px.
- Status: tittel + én pille + én setning. Fast høyde 120 px.

Bredde 1/2 – bare disse:
- Skjema: tittel + felt i én kolonne (etikett 12 over felt 14) + handling nederst til høyre.
- Liste: tittel + maks 8 rader 14 px, to kolonner (navn + verdi/status) + «Vis alle».
- Diagram: tittel + én graf + én forklaringslinje. Fast høyde 320 px.

Bredde 1/1 – bare disse:
- Tabell: tittel + verktøylinje (søk, filter, handling) + rader 14 px, maks 25, så sidevelger.
- Steg/tidslinje: tittel + vannrett rad av steg.
- Tekst: tittel + brødtekst 14/22 i maks 720 px bredde, aldri full bredde på tekst.
- Tavle (17.10): tittel + 2–6 like brede kolonner (kolonnenavn 14/600 og antall), maks 5 kort à 44 px per kolonne (14 px, én linje, kuttes med …) + «Vis alle (n)». Fast høyde 480 px. Telefon: én kolonne om gangen med kolonnevelger øverst.
- Uke (17.10): tittel + 5 eller 7 dager som like brede kolonner (dag og dato 14/600 og antall), maks 5 avtaler à 44 px per dag med klokkeslett først (14 px, én linje, kuttes med …) + «+n». Fast høyde 480 px. Telefon: én dag om gangen med dagvelger øverst.
- Plan (17.10): tittel + navnekolonne 200 px og 8 uker, rader 44 px (navn 14, kuttes med …), stolpe 24 px, maks 10 rader + «Vis alle (n)». Høyden følger radene, som tabell.
- Tegning (17.10): tittel + bildeflate som fyller flisen + én linje 14 under (kuttes med …). Fast høyde 480 px, også på telefon. Nål og kommentar bruker punktnummeret (14-3).

Felles for alle klasser:
- Skrift: flistittel 16/600, innhold 14/400, undertekst 12/400, stort tall 32/400. Ingen andre størrelser i fliser.
- Tekst som ikke får plass kuttes med … på én linje og vises hel i tooltip. Fliser vokser aldri i bredden.
- Tom, laster og feil har samme høyde som fylt flis, så raden ikke hopper.
- Tall høyrejustert, tekst venstre. Dato dd.mm.åååå, klokkeslett 07.30, beløp 1 234 kr.
- Telefon beholder høyde og skrift; bare bredden blir 1/1.
- Ny innholdstype legges til i designsystemet først, aldri i en skjerm.

## 2d. Loddrett fordeling (Eirik 17.10)
- Radhøyder bare fra skalaen 120, 320, 480 og 640 px på PC (`--rad-1` … `--rad-4`). Ingen andre høyder.
  - 120: Tall, Status, Steg, kort Tekst (maks 2 linjer).
  - 320: Kortliste, Liste, Diagram, Tekst til 11 linjer.
  - 480: Skjema (maks 4 felt), kort Tabell (til 6 rader), Tavle, Uke, Tegning, kort Plan (til 7 rader).
  - 640: full Tabell (til 10 rader), full Plan (til 10 rader).
  - Trenger flisen mer, går den til neste trinn eller får «Vis alle (n)» / sidevelger. Aldri fri vekst.
- Samme mellomrom loddrett som vannrett: 24 px PC, 20 iPad, 16 telefon. Aldri ekstra luft mellom rader.
- Hele raden har én høyde: høyeste klasse bestemmer, de andre fylles ut (innhold øverst, handling nederst). Ulike klasser i samme rad bare når de har samme høyde. Unntak: Tekst som hjelpetekst ved siden av et Skjema får skjemaets høyde (regel 3).
- Loddrett stabling bare i [2/3 + 1/3]: to fliser oppå hverandre er til sammen like høye som den høye (2 × 148 + 24 = 320).
- Første rad 24 px under topplinjen eller fanene, siste rad 48 px over bunnen. Lite innhold fylles ikke opp med luft.
- Inne i flisen: luft 16 px over og under, 24 px på sidene (16 på telefon). Tittelfelt 40 px, handlingsfelt 48 px (knapp, «Vis alle», sidevelger), listerader 40, tabellrader 44 (overskrift 36, verktøylinje 36 + 8), skjemafelt: etikett 16 + 8 + felt 40, 12 mellom felt.
- Tom, laster og feil har samme høyde som fylt flis.
- Telefon: én flis per rad, flisen beholder sin høyde fra skalaen.

## 3. Siden
- Topp: sidetittel, status/pille og handlingene for hele siden – alltid samme plass, aldri inne i fliser.
- Rekkefølge nedover: haster → det man jobber med nå → oversikt/historikk. Viktigst øverst til venstre.
- Maks 6 fliser over bretten på PC (to rader à tre, eller tallrad à fire + rad à tre). Mer går under, aldri trangere.
- Lister og tabeller alltid 1/1. Tall i én rad øverst: tre (1/3) eller fire (1/4).
- Skjemaer: 1/2 på PC (venstre), hjelpetekst/forhåndsvisning til høyre. Felt i én kolonne, aldri to ved siden av.

## 3b. Plassering av innhold (Eirik 17.10)
Bruk denne rekkefølgen, ikke skjønn:
1. Innholdet velger flisklasse: ett tall → Tall; ≤5 rader → Kortliste 1/3; ≤8 rader med to kolonner → Liste 1/2 (viser 5 på 320 px, resten under «Vis alle»); mer → Tabell 1/1; felt → Skjema 1/2; steg → Steg 1/1; ett diagram → Diagram 1/2. Passer ikke innholdet, del det i to fliser eller oppsummer. Tøy aldri flisen.
2. Plassering ovenfra: rad 1 = det brukeren må gjøre nå (haster, frister, tall), rad 2–3 = det hen jobber med, nederst = oversikt og historikk. Viktigst øverst til venstre.
3. Én rad = ett spørsmål. Fliser som leses sammen står i samme rad; fliser som ikke hører sammen, står aldri ved siden av hverandre for å fylle plass.
4. Rester: blir én flis til overs, slå den sammen med en nabo, løft den til 1/1 eller flytt den til neste rad. Aldri tomt felt, aldri luft.
5. Speilet: samme sidetype har samme første rad, samme fliser i samme rekkefølge og handlingene på samme sted. Malene står i `dokumentasjon/SIDEMALER.md`.
6. Lar noe seg ikke plassere etter 1–5, skrives det som spørsmål med forslag. Ingen ny flisklasse og ingen ny brøk.

## 4. Ordresiden og andre stegsider
- Stegene som vannrett rad øverst (ordrestegene erstatter «reisen»). Innholdet under er flisene for valgt steg, samme regler. Ingen trekkspill inne i fliser.

### 3c, tillegg – navn i stegraden (2.10b, 18.10.2026)
- Stegraden viser nummer og kort navn. Det korte navnet er høyst 14 tegn, nummeret ikke medregnet. Er hele navnet lengre, brukes en kort form i raden.
- Stegsiden (tittel, sidekart, brødsmule) bruker alltid hele navnet.
- Ordren har åtte steg. Navn i raden → sidens navn: 1 Kontrollmål (21-308), 2 Bestilling (21-303), 3 OB-kontroll (21-304), 4 Levering (21-305), 5 Varemottak (21-306), 6 Montering (21-307), 7 Ferdigmelding → Ferdigmelding og KS (21-310), 8 Faktura (21-311).
- Befaring er ikke et steg. Befaringer er hendelser i kortlista «Befaringer» på ordren og kundekortet, med detaljark 21-309.
- Ingen avkutting med «…» i stegraden. Får ikke navnet plass, skal det ha en kort form.

## 5. Telefon og iPad
- Samme fliser, samme rekkefølge, bare smalere. Ingenting fjernes; det mindre viktige kommer lenger ned.
- Handlinger som hovedknapp fast nederst på skjermen, ikke inne i flisen.

## 6. Ikke lov
- Fliser i fliser. Tekst uten flis mellom fliser. Ikoner som eneste forklaring. Hex-farger. Mer enn to skriftstørrelser i én flis. Andre brøker enn 1/4 (tall), 1/3, 1/2, 2/3 og 1/1.

## 7. Sidemenyen
- To bredder: bred 240 px (ikon + navn) og smal 64 px (bare ikon). Innholdet bruker resten.
- Automatisk: bred fra 1440 px og opp, smal 1024–1439 px (iPad liggende), skjult under 1024 px (telefon: meny bak knapp øverst til venstre, åpnes over innholdet).
- Manuelt: én knapp nederst i menyen («‹»/«›») veksler bred/smal. Valget huskes per bruker og enhet og overstyrer det automatiske til brukeren veksler tilbake.
- Smal modus: ikon 24 px sentrert, navnet som tooltip ved hold/fokus; hover i 300 ms åpner menyen midlertidig til 240 px over innholdet uten å flytte det.
- Aktivt punkt: fylt bakgrunn fra tokens, aldri bare farge på ikonet. Tellere (uleste, haster) som liten pille på ikonet i begge modus.
- Merket øverst: kundens logo i bred modus, bare merke/initial (32 px) i smal. Butikkvelgeren rett under, med butikkens initialer i smal modus.
- Samme rekkefølge og innhold i begge modus (11-011). Ingen punkter forsvinner.
- Innholdet reflyter når menyen bytter bredde: rutenettet regnes av tilgjengelig bredde, så 1/3-fliser blir 1/2 på iPad når menyen er smal, aldri smalere enn 320 px.

## 8. Topplinjen (over innholdet, høyre for sidemenyen)
- Én linje, fast høyde 56 px på PC og iPad, 48 px på telefon. Alltid synlig (fast øverst), aldri skjult ved scroll.
- Innhold fra venstre mot høyre, alltid i denne rekkefølgen og ingenting annet:
  1. Sidetittel (20/600) med brødsmule over i 12 px når siden har en forelder («Kunder › Kari Nordvik»). Status-pillen for siden står rett etter tittelen (f.eks. «Tilbud sendt»).
  2. Luft.
  3. Søk: ett felt (⌘K / Ctrl+K) som søker kunder, tilbud, ordre og dokumenter. 320 px på PC, ikon på telefon.
  4. Handlingene for hele siden: maks én hovedknapp + én sekundærknapp; flere legges under «⋯». Aldri i fliser.
  5. Varsler (bjelle med teller) og profil (initialer 32 px, meny med butikkbytte, innstillinger, logg ut).
- Butikkvelgeren står IKKE i toppen – den ligger i sidemenyen (regel 7). Toppen viser bare butikknavnet som dempet tekst etter tittelen når «Alle butikker» ikke er valgt.
- Demo-båndet («Demo – ingen ekte kunder») ligger over topplinjen, 28 px, og trekkes fra sidehøyden (K-303).
- Faner (når en side har flere visninger) står i en egen rad rett under topplinjen, 40 px, venstrestilt, maks 6 faner; flere går under «Mer». Fanene scroller med innholdet, toppen gjør ikke.
- Telefon: tittel og tilbake-pil til venstre, søk og «⋯» til høyre. Handlingene flyttes til fast knapp nederst (regel 5). Brødsmule utgår.
- Samme topplinje på alle sider. Ingen side lager sin egen.

## 9. Tetthet på PC – CRM og Admin (designsystem 2.2, radhøyde og komponentskala 2.3)
Gjelder innenfor `data-produkt="crm"` og `data-produkt="admin"` (sammen med `data-plattform="pc"`). Plattformlaget selv er uendret.

| Mål | Token | CRM/Admin | PC-laget før |
|---|---|---|---|
| Tabellrad kompakt / normal | `--rad-tett` / `--rad` | 36 / 40 px (avgjort 2.3) | 36 / 44 |
| Inndatafelt / knapp | `--hoyde-felt` (Felt, Velger; 2.4) / `--knapp-hoyde` | 36 / 36 px | 40 / 36 |
| Sidemenypunkt | `--sidemeny-rad` | 36 px | 34 |
| Ikon | `--ikon` / `--ikon-stor` | 16 / 20 px | 16 / 20 |
| Brødtekst | `--font-grunn` / `--linjehoyde` | 14/20 | 15/1,45 |
| Tabelltekst | `--font-tabell` / `--linjehoyde-tabell` | 13/18 | 14 |
| Tittel (regel 8) | `--font-sidetittel` | 20/600 | 28 |
| Radius felt og knapp / kort / tabellrad | `--radius-felt`, `--radius-knapp` / `--radius-kort` / `--radius-rad` | 6 / 10 / 0 px | 10 / 14 / – |

- Komponentene leser skriften fra komponentskalaen (`--skrift-*`, 2.3): brødtekst i komponenter `--skrift-brod` = 14/20, tabell `--skrift-tabell` = 13/18, tittel `--skrift-tittel` = 20, tallkort 24, detaljpanel 18. Utenfor CRM og Admin har skalaen de gamle verdiene (15, 14, 20, 28, 22).
- Felt og Velger leser høyden fra `--hoyde-felt` (2.4): 40 px utenfor CRM og Admin, 36 i CRM og Admin, 44 på touch. Knapp bruker `--knapp-hoyde` (Ute 36 på PC, nettsider 44, CRM/Admin 36).
- Bildene av flisklassene (`dokumentasjon/bilder/flis-*.png`) er tegnet i CRM-paletten (2.4), siden flisene er PC-regler.
- `Tabell` har `stripet`, `valgt` og hover innebygd (2.3), og `Sidemeny` tar `produkt` (ute | nettsider | crm | admin) for logo og prikk.
- Tabeller: annenhver rad `--rad-stripe`, hover `--rad-hover` (aksent 5 %), valgt `--rad-valgt` (aksent 12 %), skillelinje `--skillelinje-tabell` (svakere enn `--ramme`, så 20 rader ikke blir et rutenett), hode `--tabellhode` + `--tabellhode-tekst` 12/600, sumrad `--sumrad` med tekst 600.
- Topplinje og kort ligger på `--grunn-hevet`, sidemeny og tabellhode på `--grunn-senket`, siden på `--grunn`. Aksent aldri som bakgrunn større enn en knapp eller et menypunkt.
- Nettsidene (`data-produkt="nettsider"`) har egen luft: `--luft-s/m/l` 24/48/96 på PC, 16/32/56 under 768 px; knapp og felt 44 px.

## Slik er reglene bygd inn
| Regel | Hvor |
|---|---|
| 1 Rutenett, avstander | `tokens/layout.css` (`--rute-*`, `--rom-*`), `Rutenett` regner kolonner av tilgjengelig bredde (12 / 8 / 4) |
| 2, 2b Bredder og rader | `Rad` godtar bare de lovlige radene og skriver en advarsel i konsollen når en rad ikke går opp eller blander 1/4 og 1/3 |
| 2c Flisklasser | `Flis klasse="tall|kortliste|status|skjema|liste|diagram|tabell|steg|tekst|tavle|uke|plan|tegning"` setter bredde, fast høyde, luft og skrift |
| 8 Topplinjen | `Toppfelt` (navigation): tittel, brødsmule, status, butikknavn, søk ⌘K, maks to handlinger + «⋯», varsler, profil. `demo` gir båndet på 28 px. Kundens logo er flyttet til sidemenyen (regel 7) |
| 7 Sidemenyen | `Sidemeny modus="auto|bred|smal"`, knapp «‹/›» nederst, valget lagres i `localStorage` (`hengsel.sidemeny`) per enhet |

## Regel 10 – rader, kanter og rullefelt (2.8, 18.10.2026)

18.10.2026. Bakgrunn: i CRM › Kunder gikk radmarkeringen helt ut i flisens venstre kant, og til høyre stoppet den ujevnt under rullefeltet. Regelen gjelder alle produkter, på PC og telefon.

## 10.1 Radmarkering
Hover, valgt og stripe ligger innenfor flisens innerpadding. Avstanden er lik til venstre og høyre og tilsvarer overskriftens innrykk. Markeringen begynner 12 px til venstre for teksten i første kolonne og slutter 12 px til høyre for teksten i siste kolonne (`--rad-innrykk`). Radius 6 (`--radius-knapp` i CRM og Admin). Markeringen ligger aldri under rullefeltet.

## 10.2 Rullefelt
Rullefeltet ligger alltid utenfor innholdet (`scrollbar-gutter: stable`), er 8 px bredt (`--rullefelt`) og står i padding-sonen. Innholdet flytter seg ikke når rullefeltet kommer eller går. Rullefeltet ligger aldri over tekst, piller eller markering.

## 10.3 Første og siste rad
Første og siste rad har samme avstand til flisens topp og bunn som radene har seg imellom. Under siste rad er det ingen skillelinje. Paginering («Forrige · Side 1 av 2 · Neste») står på egen rad med samme innrykk.

## 10.4 Kolonner
Overskrift og celle står på samme x. Tall er høyrestilt med tabulære sifre, også i overskriften. En kolonne med både tall og tekst blir venstrestilt, så hold slike kolonner rene. Piller er 20 px høye og loddrett sentrert.

## 10.5 Samme innrykk i alle fliser
Tittel, innhold og verktøylinje begynner på samme linje (`--flis-pad-x`). Det gjelder tabell-, liste- og skjemafliser, både på PC og telefon.

## Tokens (tokens/tillegg-2-6.css)
`--rad-innrykk: 12px`, `--rullefelt: 8px` og `--flis-pad-x: 24px`. Telefon bruker 16 px og arver verdien fra `--flis-pad`.

## Komponenter som er rettet
Tabell, Listerad, Flis og Kort (`components/layout/`).

### Regel 10, tillegg (2.9, 18.10.2026)

**10.1** Markeringen har radius `--radius-rad` (6 px), også på iOS. Skillelinjen mellom radene går fra første kolonnes tekst til siste kolonnes tekst. Den går ikke helt ut til markeringens kant, så linje og markering ikke krysser hverandre i hjørnene.

**10.3 Paginering.** Når tabellen har flere rader enn den viser, får den en egen siderad: «1–10 av 23» til venstre, og «Forrige · Side 1 av 3 · Neste» til høyre. Raden er 48 px høy og har en linje over seg i samme innrykk som radene. På telefon står bare «Forrige · Side 1 av 3 · Neste». Under 10 rader uten flere sider er det ingen siderad.

**10.4 Datoer og tekst.**
- Dato og tid er tall. Skriv «17.10» eller «17.10 08.12», ikke «i dag», «i går», «man.» eller «uke 45». Da blir kolonnen høyrestilt med tabulære sifre. Relativ tid kan stå i undertekst.
- En kolonne er enten tall eller tekst. Forklaringer som «etter ferdigmelding» hører hjemme i tekstkolonnen.
- I sammenligningstabeller (bestilt mot OB) er kolonnene som sammenlignes høyrestilt, også når de har tekst.
- Tekst over 42 tegn brytes over inntil tre linjer og kuttes ikke. Raden får 8 px luft over og under.
