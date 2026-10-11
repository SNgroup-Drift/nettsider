# K-172 · hengsel.no/apptest v3 etter Claude Design · S-56

Gren `claude/k172-apptest-v3`, laget fra `origin/claude/design-apptest-v3` (main + designeksporten `aa14a7e`). PR mot main tar med begge. **Ikke flettet.**
Fasit: `docs/design/hengsel/apptest-v3/` (`Apptest.dc.html`, `Apptest-passord.dc.html`, `Apptest-valg.md`, `Oversikt.dc.html`).
Ingen passord eller nøkler i noen fil eller i denne rapporten.

## Hva som er bygd

- **`/apptest`** (`sites/hengsel/src/pages/apptest.astro`) bygd på nytt etter designet: sidehode med bare logo og «Meld feil», hero med bildeveksling (4 s, 0,7 s overgang) og app-ikon på Beige 3-flis, Installer (telefon: én vei med tre steg og stor knapp, «Andre telefoner» viser de to andre; PC: QR-koden og alle tre veiene i fire kort), roller med chips, ett kort med punkter, demobruker, passord og telefon, sjekkliste (0 av 8) med fremdrift, tidslinjen «Hva er nytt» med `<details>`, «Kjente feil», «Meld feil», «Spørsmål og svar» og felles `Bunn`.
- **`/apptest/passord`** (`pages/apptest/passord.astro`) bygd på nytt etter `Apptest-passord.dc.html`.
- Flater Beige 4, bånd Beige 3, kort Off White. Deep Blue bare på hovedknapper og lenker. Stegnummer, avkrysning, prikker og tidslinje i Warm Black. Mørk modus følger systemet.
- **Komponenter og tokens fra hengsel.no 2.0:** `Side` (nytt valg `utenMeny`, så siden ikke har hovedmeny), `Enhet` (iPhone-rammen; nytt valg `utenStatus`, fordi de nye skjermbildene har sin egen statuslinje), `Bunn`, `.btn`, `.pille`, `.h-innhold`, `tokens.css`/`hengsel.css`. Nye: `ApptestHode`, `ApptestIkon`.
- **Bevart:** passord-Workeren (`worker/apptest.ts`, K-107), `noindex,nofollow`, ikke i sitemap og ikke i menyen (`sjekk-lenker.mjs` passer på det), og `data-demopassord`-merkene.
- **QR-koden** lages ved bygging som SVG av `https://hengsel.no/apptest` (`src/apptest-qr.ts`, pakken `qrcode-generator`, bare i bygget). Ingen eksterne kall.
- **Skript** (`src/scripts/apptest.ts`, ca. 130 linjer, bundlet som egen fil, ingen inline-skript og ingen style-attributter): bildeveksling, telefongjenkjenning, kopier og sjekkliste i `localStorage` (`hengsel-apptest-sjekk-{versjon}`). Siden virker uten skript (se «Kvalitet»). Gamle `kopier.ts` er fjernet.
- **CSP:** CSS ligger inline som før, og `scripts/csp-hasher.mjs` kjøres av `npm run build` og la inn stilhashene (2 stk.). Hasheren stopper bygget ved inline-skript.

## Innhold

- **Lenker, versjon og dato** kommer fra `src/apptest-lenker.ts` (nå **1.7.0**, 10. oktober 2026). TestFlight og APK som begynner med `TODO_` gir den deaktiverte knappen «Lenke kommer». Google Play: `https://play.google.com/apps/internaltest/4701475978909247435`. PDF: `/apptest/Logg_inn_i_demoen.pdf`.
- **Tidslinje og kjente feil** ligger i `src/apptest-innhold.ts` (nytt bygg = ett objekt øverst i `BYGG`; instruksjonen står øverst i filen). Bygg 11, 12 og 13 fra `claude/hengsel-bygg-11.md`, `-12.md`, `-13.md`, `claude/k148-rapport.md` og dagens «Hva er nytt». **Kjente feil starter tom** («Ingen kjente feil akkurat nå»).
- **Demobrukere** fra lista på dagens side (K-114): `montor1`, `firmaleder1`, `utkjorer`, `selger1`, alle med `@demo.invalid`.
- **Skjermbilder** fra den nye SwiftUI-appen (se under), lys og mørk, i iPhone-rammen. Bare demodata.

## Skjermbilder (punkt 3)

Hentet fra `innlandet-crm-sync`, grenen `claude/k159-hengsel-ios-runde7` (nyeste; inneholder `k153/` og `k154/` fra `…runde345`), mappen `hengsel-ios/docs/skjermbilder/`. Laget som webp i 2× (600 × 1305 px, kvalitet 80) i `sites/hengsel/public/img/apptest/{navn}-{lys|mork}.webp`.

| Bilde | Kilde | Brukt i |
|---|---|---|
| I dag | `k153/iphone-HI2.1-idag` | hero |
| Jobben | `k153/iphone-HI2.2-jobben-under` | hero |
| KS | `k153/iphone-HI2.4-ks` | hero |
| Ferdig montert | `k153/iphone-HI2.5-ferdig` | hero og rollen Montør |
| Forespørsler | `k154/iphone-HI4.2-foresporsler` | Firmaleder |
| Ruten | `k154/iphone-HI4.4-utkjorer-ruten` | Utkjører |
| Mottak | `k154/iphone-HI4.5-lager-mottak` | Ansatt eller lager |

**Alle sju fantes, så ingen plassholder er beholdt.** Merknader om bildene (jeg har ikke endret dem):
- **KS** viser en uoversatt nøkkel, «`sjekk.avBesvart`», under lista. Den bør rettes i appen og bildet tas på nytt.
- **Forespørsler** har «Butikknavn» som kundenavn i det andre kortet. Det er et plassholdernavn, ikke et merkenavn, men det ser uferdig ut.
- Bildene Forespørsler, Ruten og Mottak er levert i 689 × 1500 px og skalert opp til 600 px bredde (liten forskjell). De har ikke klokke i statuslinjen, bare Dynamic Island.
- Rammen i `Enhet` tegnes i CSS, ikke med Apples bezel som på forsiden. Det er samme ramme som på /ute.

## Avvik fra designet

1. **Skrifter:** designet laster Inter og Newsreader fra Google Fonts. Siden bruker de selvhostede variabelskriftene fra `@sngroup/design/fonts.css`, som resten av nettstedet.
2. **Ingen React, `support.js` eller `_ds_bundle.js`.** Knapper, piller og chips er hengsel.no 2.0-klassene.
3. **Rollene byttes med radioknapper (CSS), ikke skript.** Da virker de uten skript og gir ingen layoutskift. Chips ser ut som i designet.
4. **Fremdrift** bruker `<progress>` i stedet for en `div` med bredde (uten style-attributt).
5. **`?tema=lys|mork` og `?feil=tom` er ikke bygd.** Tema følger systemet (Playwright emulerer det for skjermbildene), og kjente feil styres av datafilen. `?enhet=iphone|android|apk|pc` er med.
6. **Lenkefarge:** Deep Blue (`#5074A9`) gir bare 4,28:1 mot Beige 4 og 3,96:1 mot Beige 3. På flatene og båndene brukes derfor `#46699D` (4,6–5,0:1) i lys modus. Hovedknappene har uendret Deep Blue.
7. **Dark mode:** Beige 4 og Beige 3 er begge `#2F2820` i mørk modus i designsystemet, som i designet. Kortene (`#26201A`) skiller seg fra flaten, men båndene synes ikke.
8. **Passordsiden:** feilteksten, ingressen og hjelpeteksten er som i designet, ikke som den gamle siden (testen er oppdatert).
9. **Støtte for demopassord i Workeren:** Designet har ett passord per rolle (`<span data-demopassord="{rolle}">`). Workeren setter nå det felles demopassordet inn i alle spanene, viser «Kopier»-knappene (`data-demopassord-knapp`) og fjerner `data-uten-demopassord`. `data-demopassord-verdi` finnes ikke lenger. Uten hemmeligheten står «••••••••», Kopier er skjult og «Passordet får du av den som inviterte deg» vises.
10. **E-post for feil og passord** er `hei@hengsel.no` (som på resten av nettstedet), ikke `test@hengsel.no` fra `apptest-lenker.ts` (feltet `epost` brukes ikke lenger).

## Innhold som må bekreftes

1. **Versjonen på siden er 1.7.0, men tidslinjen har bygg 13 = 1.8.0 øverst.** Overskriften, «Sjekkliste for …» og lagringsnøkkelen leser versjonen fra `apptest-lenker.ts`, som GitHub-workflowen `apptest-versjon.yml` skriver (APK-lenken står på bygg 24). Når workflowen har kjørt for 1.8.0 (APK 28), blir alt likt. Jeg har ikke redigert blokken for hånd.
   - Workflowen skriver fortsatt `nytt` i `apptest-lenker.ts`. Siden bruker ikke det feltet lenger. Tidslinjen vedlikeholdes for hånd i `apptest-innhold.ts`.
2. **Utkjører og engangskode.** Appen bruker engangskode på e-post for faste utkjørere i drift, men demobrukeren `utkjorer@demo.invalid` logger inn med brukernavn og passord (K-114: «engangskode kan ikke gå til @demo.invalid»; PDF-en sier det samme). Første punkt for utkjører står derfor slik: «Velg «Demo» på innloggingen og logg inn med demobrukeren. I drift logger utkjørere inn med engangskode på e-post.» Si fra hvis demobrukeren heller skal ha engangskode.
3. **Ingen lagerbruker i demoen.** Lista fra K-114 har ingen bruker med rolle lager. Kortet «Ansatt eller lager» viser `selger1@demo.invalid` med merknaden «Demoen har ingen egen lagerbruker. selger1 viser ansattmodus.» Punktene (kontrollmål, Mottak, Ut) er fra designet. Mottak-bildet viser lagerrollen. Trenger vi en `lager1`-bruker?
4. **Sjekklista har åtte punkter, men K-148-rapporten har seks** (K148-1 til -6). Jeg tok med Bluetooth-teksten (K162-7, fra `hengsel-bygg-13.md`) og ikonene (K145, fra `hengsel-bygg-12-testsjekkliste.md`) for å få åtte. K148-6 (skanner og DXF) er skrevet som «Test skanner og DXF på en ekte telefon». K148-5 (varsler til kunden) er skrevet uten e-post siden PDF-en sier at ingenting sendes ut fra demoen.
5. **Bygg 13:** TestFlight-innsendingen og Play-innsendingen er ikke bekreftet (rapporten sier det). Migreringene `20271220110000` og `20271220120000` og edge-funksjonen `kundevarsel-ko` må være ute før «Lastet» og kundevarslene virker, og tidslinjen nevner varslene.
6. **Byggnumre i tidslinjen:** iOS 16/17/18, Play (AAB) 23/25/27 og APK 24/26/28.
7. **Spørsmål og svar** (svarene fra designet er sjekket):
   - «90 dager» for TestFlight stemmer (Apples regel). Utløpet «10.11.2026» i byggrapportene gjelder EAS-filene, ikke TestFlight.
   - «Gå til Meg og trykk «Logg ut»»: «Logg ut» finnes som handling i appen (`03_hengsel_sf_symbols.md`). Jeg har skrevet bort «nederst» fra designet, fordi jeg ikke fant plasseringen i kildene.
   - «Jeg kommer ikke inn»: la til «Velg «Demo» nederst på innloggingen» og «skriv hele adressen» (fra PDF-en, K-114).
   - «Hvordan får jeg tilbake ekte data?»: **usikkert.** Svaret er fra designet. Appen har en Demo/Ekte-bryter (R4.3), men jeg fant ikke hvor den står. Bekreft.
   - «Android sier ukjent kilde» er Androids vanlige flyt og ikke sjekket mot en telefon.
8. **App-navnet:** designet sier «Hengsel» (Åpne Hengsel). `app.json` og App Store Connect sier «Hengsel Ute». Hvilket navn står under ikonet?
9. **PDF-en** (`Logg_inn_i_demoen.pdf`) er ikke endret. Den nevner «Sigdal CRM» og passordet fylles inn av den som deler den.

## Kvalitet

- `npm run build` ✓. `npm test` ✓ (42 tester, `apptest-innhold.test.mjs` er ny) og lenkesjekken ✓.
- `node scripts/skjermbilder.mjs`: 0 feil. Nytt avsnitt for /apptest og passordsiden (390 og 1440 px, lys og mørk): ingen style-attributter eller inline-skript, ingen konsollfeil, bare Newsreader og Inter, ingen eksterne forespørsler, ingen vannrett rulling, **CLS 0**, **kontrast ≥ 4,5:1** på all tekst (3:1 for stor tekst). Uten skript: alle tre veiene vises, rollene byttes og sjekklista står på 0 av 8. Med skript: iPhone og Android får én vei og «Andre telefoner» viser resten, PC viser QR, sjekklista huskes etter ny innlasting, prikkene bytter bilde. Skjermbildene ligger i `claude/k172-skjermbilder/`.
- `scripts/skjermbilder-apptest.mjs` (mot Workeren i `wrangler dev` med tilfeldige testverdier som ble slettet etterpå): 0 feil, inkludert at passordet settes inn i alle fire rollene, at Kopier virker og at passordsiden viser feilen etter feil passord.
- **Lighthouse mobil** (tre kjøringer per side, simulert 4G): /apptest ytelse **97**, tilgjengelighet 100, beste praksis 100, CLS 0. Passordsiden 100/100/100. **SEO er 69 på begge, og det er med vilje:** `noindex,nofollow` er et krav (`is-crawlable`).
- Ikke gjort: sjekk på ekte iPhone/Android, og med VoiceOver/TalkBack.

## Skrifter som faktisk er brukt

**Newsreader Variable** (overskrifter, 400) og **Inter Variable** (tekst, 400–600), selvhostet fra `@fontsource-variable` via `@sngroup/design/fonts.css`. Ingen andre skrifter lastes (målt i nettleseren på begge sidene). Statuslinjen i telefonrammene bruker systemskrift (`-apple-system`, ellers Inter) som resten av `Enhet`. Ingen skrifter fra CDN.
