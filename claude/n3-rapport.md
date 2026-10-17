# N-3 · hengsel.no etter sidekartet 25-001–25-012 (S-68)

Gren `claude/n3-hengsel-sidekart` fra `origin/main`. PR mot `main`: SNgroup-Drift/nettsider#83 (flettes av Eirik).
Fasit: `docs/sidekart/25-0nn.md`, bildene `25-0nn.webp` / `25-0nn-tlf.webp` og `regel-layout-hengsel.md` på grenen `claude/s68-sidekart-docs` i hengsel-crm
(sidekartet var ikke flettet til demo da økta startet).

## Kort

- De 12 sidene finnes og er bygd med nettside-kitet: samme flater, kort, statuspiller, knapper og skrift som CRM-flisene, bare tokens og bare lys modus.
- Menyen lenker til alle sidene: CRM, Hengsel Ute, Kundeportal, Integrasjoner, Priser, For butikkleder, Kunder og Om oss, pluss «Be om demo».
  Personvern står i bunnen, og «Bli tester» (/apptest) lenkes som før fra appen og testerinvitasjonen.
- `npm test`: 203 av 203 grønne, og lenkesjekken har 0 feil i 749 forespørsler. `npm run build` er grønt for alle nettstedene, også Sigdal-utgaven
  (`/kunde/sigdal`, `/kunde/sigdal/crm` osv. får kitet av seg selv, og Sigdal-menyen er uendret).
- Ingen hex, ingen mørk modus og ingen lokale app-skjermbilder: hengsel-reglene og bibliotekstesten er grønne. Ingen nye avhengigheter og ingen nye nøkler i `KJENTE_MANGLER`.
- Skjermbilder på 1440 og 390 ligger i `claude/n3-skjermbilder/` (24 sider pluss `samspill-tlf-rad-apnet.png`).
  bilder.hengsel.no kan ikke nås fra økta. Derfor viser iPhone-rammen på /ute alt-teksten i bildene. På nettet hentes bildet fra biblioteket (`app/idag-lys.webp` står i manifestet).

## Kitet (`sites/hengsel/src/components/kit/`)

| Komponent | Hva |
|---|---|
| `Sidetopp` | Tittel 48 px (32 på telefon) med ingress. Sidens handlinger og status-pille står i toppen, aldri i fliser (regel 3) |
| `Innhold`, `Rad` | Rammen er 1440 px med 32 px marg og innhold på maks 1280 px. Raden har 12 kolonner og 24 px mellomrom, og høyden er 120, 320, 480 eller 640 (2b/2d). Telefon: 1/1, 16 px og samme høyder |
| `Flis` | Grunnflisen: tittel 16/600 med teller, innhold, og handling nederst til høyre. 24 px luft (16 på telefon). Breddene er 1/3, 1/2 og 1/1 |
| `Statusflis`, `Pille` | Tittel, pille og én setning med … og tooltip. Pillene bruker statustokenene (ny, pågår, ferdig, advarsel) |
| `Tabellflis` (+ `Sok`) | Tabell kompakt med søk i tittelfeltet, uten bunnfelt og med 40 px rader. Høyden følger `tabellHoyde(n)` (≤5 = 320, ≤9 = 480). Telefon: søkeikon, første og siste kolonne, og raden åpner resten |
| `Listeflis` | Kortliste/Liste: maks 5 rader og «Vis alle (n)», som åpner en dialog |
| `Tekstflis` | Tekst 14/22 i maks 720 px. `kommer` gir «Tekst kommer.» |
| `KommerSide` | Malen for 25-008–25-010 |

`scripts/kit.ts` styrer søket, radene som åpnes og dialogen. Uten skriptet står det som åpnes åpent på telefon.
Sjekket i Chromium: søket filtrerer og viser «Ingen treff.», og CET-raden åpner om-teksten. Åpne-knappen er av på PC der den bare gjelder telefon, «Vis alle» åpner dialogen, og raden åpnes på telefon.

## Per side

| Side | Gjort | Avvik fra sidekartet, med grunn |
|---|---|---|
| 25-001 Forside | Rad 1 Status 1/3 ×3, rad 2 «En dag i butikken» (6 rader, 480), rad 3 «Bygget for» (Liste 1/2) + «Film» (Tekst 1/2) | «Prøv selv» (demo.hengsel.no) og «Be om demo» står i toppen. «Prøv selv» er avgjort i K-229 og kreves av `nettsider-struktur.test.mjs`; regel 3 legger sidens handlinger i toppen. **Filmen finnes ikke** i biblioteket, så flisen sier «Filmen «En dag i butikken» kommer.». Det kom ingen nøkkel i `KJENTE_MANGLER`, fordi lista bare tar `app|apptest|hjelp|vis` og manifestet bare har webp. «Vis alle (5)» åpner en dialog, selv om alle fem allerede står i lista. Tatt bort: heroen med Studio Display, løftene, «Se nærmere på» og demoblokken |
| 25-002 CRM | Rad 1 «Før og med Hengsel» (5, 320) og rad 2 «Samme kundekort …» (9, 480) | I rad 3 står «Hengsel sammenligner ordrebekreftelsen med ordren …» i stedet for «OB-en». Det er lettere å lese, og Sigdal-profilen treffer. Den klikkbare CRM-demoen er tatt bort (`CrmSkjerm`, `scripts/crm.ts`). Ingressen «Klikk deg gjennom en vanlig morgen …» står som i tegningen, men siden har ikke noe å klikke seg gjennom lenger (se under) |
| 25-003 Hengsel Ute | Rad 1 Status ×3, rad 2 «Gjennom dagen» (6, 480), rad 3 «Virker uten dekning» + Tegning «Hengsel Ute, I dag» (iPhone-ramme, `app/idag-lys.webp` fra biblioteket) | Undertekstene «tegning» og «Skjermbilde fra bilder.hengsel.no.» fra tegningen er utelatt, fordi de er notater til den som bygger. Tatt bort: stegvelgeren, iPad-bildeverktøyet, uten-nett-bildet, motion og «Bli tester» |
| 25-004 Kundeportal | Rad 1 «Fra tilbud til FDV» (5, 320) og rad 2 «Det kunden gjør …» (4, 320) | Portal-mocken (`PortalSkjerm`, SMS og bryter) er tatt bort |
| 25-005 Integrasjoner | Rad 1 «Koblinger» (8, 480) og rad 2 «Kundens data, trygt lagret.» (320) | Kolonnene heter «Inn i Hengsel» og «Ut fra Hengsel» (tegningen: «Inn»/«Ut»), og Inn-verdiene er fra `integrasjoner.ts`, der tegningen har «–» på de fleste. Teksten i repoet er avgjort. Raden åpner om-teksten, som ingressen («Velg en kobling …») lover. **Sikkerhet har 5 rader** (tegningen: 4): eierlinja med kontakt for databehandleravtale er beholdt, og flisen er fortsatt 320. Systemkartet er tatt bort |
| 25-006 Priser | Rad 1 «Dette inngår» (7, 480) og rad 2 «Oppstart» (4, 320) | «Eksempel»-merket på Oppstart er tatt bort. Metabeskrivelsen er nå «Hva som inngår, hvordan oppstarten går …» |
| 25-007 Demo | Egen topp `#demo` og rad 1 (480) med Skjema 1/2 (Navn, Firma, Telefon, E-post, «Be om demo») + Tekst 1/2 «Kontakt» | «Hva vil dere se?» og «Antall avdelinger» er tatt ut, så skjemaet har fire felt (maks fire på 480). Workeren godtar tomme felt; demo-testene er grønne. «Firma» sendes som `butikk`. Feil, takk og e-postreserven står inne i flisen. `scripts/demo.ts` tåler at feltene mangler |
| 25-008 For butikkleder | KOMMER: toppen og Tekst 1/3 ×3 «Seksjon 1–3» med «Tekst kommer.» | noindex og ikke i sitemap. **Ingressen er tegningens: «Venter på tekst fra Eirik. …»** |
| 25-009 Kunder og referanser | KOMMER: «Referanse 1–3» med «Tekst kommer.» | Som over: ingressen «Venter på tekst og tillatelse fra kundene.» |
| 25-010 Om oss | KOMMER: «Hvem vi er» og «Kontakt» (1/2 + 1/2) med teksten fra tegningen | Som over: ingressen «Venter på tekst fra Eirik.» |
| 25-011 Personvern og vilkår | Toppen og rad 1 Tekst 1/1 «Personvern» (120) | Personvernerklæringen for nettsiden (godkjent 07.10 og 09.10) står under, én Tekst 1/1 per avsnitt med høyde etter innholdet. Den er lengre enn 120 og skal stå hel. Det finnes ingen vilkårstekst, og det er ikke funnet på noen |
| 25-012 Bli tester | /apptest: vanlig meny (var egen topp), toppen «Bli tester» med testversjonen som pille, og rad 1 Tekst 1/3 ×3 (TestFlight-lenke, Google Play intern test, Meld feil) | **Resten av /apptest er som før** (installering med QR, roller med demobruker, sjekkliste, bygg, kjente feil, spørsmål og meld feil). Det er ikke i kitet ennå: innholdet er avgjort og testet (`apptest-innhold`, `apptest-passord`), og sidekartet sier «mitt forslag». Bildevekslingen og motion i toppen er tatt bort. Passordet og Workeren er urørt |

Felles avvik:
- Menyen viser merket, ikke ordet «Hengsel». Den har de tre KOMMER-sidene (K-teksten), og «Logg inn» er flyttet til bunnen og menypanelet. Under 1180 px er menyen ≡.
- Bunnen er beholdt (Bunn.dc.html med firmainfo-linja) i stedet for tegningens ene linje, og de nye sidene står under «Mer».
- Under 960 px står alt som 1/1. Det finnes ingen egen iPad-utgave, fordi sidekartet bare har PC 1440 og Telefon 390.
- Tabell kompakt har 36 px tabellhode og 12 px luft nederst, så 9 rader går opp i 480. Rader kan vokse hvis nettleseren forstørrer teksten, men innholdet passer i høyden.

## Utenfor «Gjelder», med grunn

- `scripts/kit.ts` og `scripts/demo.ts` (brukes direkte av sidene). `styles/hengsel.css` har fått `--ramme`, `--marg` og `.k-ramme`. `Meny.astro` og `Bunn.astro` har ny bredde og nye lenker.
- Fjernet fordi de ikke brukes lenger: `CrmSkjerm.astro`, `PortalSkjerm.astro`, `PrivacyPage.astro`, `scripts/crm.ts`, `ute.ts`, `kundeportal.ts`, `integrasjoner.ts`
  og dataene til demoene i `content/`. `UteMotion.astro` er beholdt (merkepakke-testen krever komponenten).
- **To tester er tilpasset** fordi sidekartet tar bort det de voktet:
  - `merkepakke.test.mjs` c): før kravet motion på /ute og /apptest og «Levert av Hengsel» i portal-mocken. Nå sjekker testen at alle sider som bruker dem, har riktige filer. Filene i `public/` er urørt.
  - `kundetema.test.mjs` e): tre erstatninger i `packages/kundetema-sigdal/profil.json` treffer ikke lenger: «Vil dere se Hengsel i bruk?», «Vi viser løsningen … be om demo.» og «Hengsel fant 1 avvik mot ordren». N-3 får ikke røre `packages/`, så de står i `UTGATT_N3` i testen. Testen feiler når de fjernes fra profilen, til lista tømmes. Alle de andre erstatningene treffer fortsatt.

## Nye nøkler i KJENTE_MANGLER

Ingen. Det eneste som mangler, er filmen «En dag i butikken» (25-001). Den er en film og ikke et webp-skjermbilde, så den passer ikke i lista (se 25-001).

## Hva Eirik bør se på

1. **KOMMER-sidene står i menyen med ingressene fra tegningen** («Venter på tekst fra Eirik …»). Bytt tekstene, eller ta sidene ut av menyen, før dette går til prod.
2. **/crm-ingressen** «Klikk deg gjennom en vanlig morgen …» viser til den klikkbare demoen, som ikke står på siden lenger. Velg en ny ingress, eller en «Prøv selv»-knapp i toppen som på forsiden.
3. **Filmen** «En dag i butikken» må lages og legges i biblioteket. Flisen sier «kommer» til da.
4. **Sigdal-profilen**: fjern de tre erstatningene i `UTGATT_N3` fra `profil.json` i en egen sak, og deretter fra lista i testen.
5. Personvernerklæringen sier at skjemaet «lagrer ingenting … fyller ut en e-post i ditt eget e-postprogram». Skjemaet sender til `/api/demo`, og slik har det vært også før N-3. Teksten er ikke endret.
6. /apptest under toppen er ikke i kitet ennå. Den bør tegnes om i Design hvis den skal følge 25-012 helt.
7. Motion for Hengsel Ute og «Levert av Hengsel»-merket brukes ikke lenger på hengsel.no (filene ligger der fortsatt).

N-3 KLAR
