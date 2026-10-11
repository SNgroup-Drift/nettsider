# K-160 · hengsel.no 2.0 – rapport

Gren: `claude/k160-hengselno-2` → PR mot `main` (ikke flettet; Eirik fletter). Skjermbilder: `claude/k160-skjermbilder/` (40 filer: åtte sider + personvern + 404, 390 og 1440, lys og mørk).

## 1. Hva som er bygd

Felles (alle sider): `layouts/Side.astro` med fast meny (`Meny.astro`), ny bunn (`Bunn.astro`), enhetsrammer (`Enhet.astro`: Studio Display, iPad, iPhone med iOS-statuslinje). Tekster i `src/content/`, lite vanlig TypeScript i `src/scripts/` (ingen rammeverk), ingen `style`-attributter og ingen inline-skript (CSP uendret, `csp-hasher.mjs` kjører som før).

| Side | Bygd | Fil(er) |
|---|---|---|
| Felles | Meny (≡ under 1180 px, «Be om demo» alltid synlig, «Logg inn» → vis.hengsel.no), bunn, Enhet-rammer, Newsreader/Inter, beige piller | `layouts/Side.astro`, `components/Meny|Bunn|Enhet|Skjermbilde.astro`, `styles/tokens.css`, `hengsel.css` |
| `/` | Hero med Studio Display (CRM-skjerm i HTML), iPad og iPhone, tre løfter, Ordrens reise, «Se nærmere på» (7 kort), demo-seksjon | `pages/index.astro`, `content/forside.ts` |
| `/crm` | Klikkbar demo i fire steg i Studio Display-ramme, bryter PC · iPad · Telefon | `pages/crm.astro`, `components/CrmSkjerm.astro`, `content/crm.ts`, `scripts/crm.ts` |
| `/ute` | Seks steg i iPhone-ramme, bildeverktøyet på iPad, «Virker uten dekning», Bli tester/App Store → /apptest | `pages/ute.astro`, `content/ute.ts`, `scripts/ute.ts` |
| `/kundeportal` | Fem steg, telefon og PC, SMS-varsel, «Vis SMS-en igjen» | `pages/kundeportal.astro`, `components/PortalSkjerm.astro`, `content/kundeportal.ts`, `scripts/kundeportal.ts` |
| `/slik-virker-det` | Ordrens reise i åtte scener med «Selgeren ser» og «Bak kulissene» | `pages/slik-virker-det.astro`, `content/slikvirker.ts`, `scripts/slik.ts` |
| `/dokumenter` | Ni hele A4-dokumenter (30 sider), «Slik lages det», bla-knapper, lysboks. Gjenbrukbar komponent, data i én fil | `pages/dokumenter.astro`, `components/dokumenter/*`, `content/dokumenter-data.ts`, `scripts/dokumentvisning.ts`, `docs/dokumentvisning.md` |
| `/integrasjoner` | Systemkart (radiogruppe) med detaljpanel, sikkerhet | `pages/integrasjoner.astro`, `content/integrasjoner.ts`, `scripts/integrasjoner.ts` |
| `/priser-og-demo` | Dette inngår, oppstart, demoskjema, ring eller skriv. Ingen priser. | `pages/priser-og-demo.astro`, `content/priser.ts`, `scripts/demo.ts`, `worker/demo.ts`, `worker/index.ts` |
| `/personvern`, `/apptest`, 404 | Uendret innhold, ny meny og bunn. /apptest og passordsiden bruker nå `Side` (følger lys/mørk), `robots noindex,nofollow` beholdt. | |

Øvrig:
- `_redirects`: stiene /produkt, /kontoret, /kundeportalen, /jobb, /priser, /kontakt, /demo, /om. **Ankere (#…) sendes aldri til tjeneren, så `_redirects` kan ikke omdirigere dem.** Derfor sender `scripts/gamle-ankere.ts` (på forsiden) gamle lenker som `hengsel.no/#kontakt` videre til riktig side.
- `sitemap.txt` har alle åtte sider + personvern (ikke /apptest).
- Oppryddet: Sigdals skrifter slettet (`docs/design/hengsel/fonts/`, `…/_ds/…/fonts/`, `sites/hengsel/public/fonts/`), navnene fjernet fra `fonts.css`/`typography.css`/readme i designsystemkopiene og fra koden. `git ls-files | grep -i 'reckless\|lausanne'` gir ingenting. Gamle forside-filer slettet (`faner.ts`, `lysboks.ts`, `plantegning.ts`, `kontakt.ts`, `PlantegningEntre.astro`, doble «… 2.ts»-filer).
- `scripts/sjekk-lenker.mjs`: tillater nå lenker til /apptest (kravet i designet), sjekker bilder i undermapper. `scripts/skjermbilder.mjs`: de åtte sidene på 390/1440, lys og mørk, + sjekker per side (konsoll, style-attributter, inline-skript, bildemål, bare Newsreader/Inter, eksterne forespørsler, lagring).

## 2. Avvik fra designet (med begrunnelse)

- **Menyen bytter til ≡ ved 1180 px, ikke 900 px** (oppgaven sier 900; designet og LES-MEG sier 1180). Sju lenker + «Logg inn» + «Be om demo» får ikke plass mellom 900 og 1180 px.
- Lyseblå er byttet med beige overalt (piller, merker, valgte felt, info-bannere, CrmSkjerm-feltet). Status-merker beholder grønn/gul/rød. Info-merket i /slik-virker-det er Beige 2 (Beige 3 forsvant mot den valgte raden).
- /crm starter på Telefon-rammen på skjermer under 700 px (PC-rammen blir uleselig på 358 px). Bryterknappene er 44 px (designet 36) pga. tapp-målet.
- /dokumenter: på telefon vises A4-arket 680 px bredt (liggende 960) og kan rulles, pluss lysboks. Papiret er alltid lyst, også i mørk modus. Stegsirklene i «Tilvalg for kjøperne» er Warm Black (ikke Deep Blue).
- /kundeportal: fanene er én tablist som endrer utseende (liste på telefon, piller på PC).
- /ute bruker `ipad-bildeverktoy-laser.webp` («Lasermåler» i bildet) i stedet for designets PNG. Ute-logoen er `<picture>` av SVG-ene og får Inter i «engsel» (ingen webfont i SVG-bilde).
- /priser-og-demo: sju punkter under «Dette inngår» (som LES-MEG; oppgaven nevnte ikke antall). Noen små feiltekster står ikke i LES-MEG: «Skriv en gyldig e-postadresse.», «Skriv et gyldig telefonnummer.», «Forespørselen ble ikke sendt.», «Send den som e-post i stedet» og tekst for uten-JS.
- Uten JavaScript kan demoskjemaet ikke sendes (tidsfeltet `t` settes av skriptet); da vises mailto-lenke. Uten JS vises ellers første tilstand på alle interaktive sider (på /slik-virker-det alle åtte scener som liste).
- iPad-rammen og iPhone-rammen er tegnet i CSS som i designet; Studio Display bruker bezelfilen.
- Ikke gjort: skjermlesertest og ekte Safari/iOS-test (bare Chromium/Playwright).
- `public/apptest/Logg_inn_i_demoen.pdf` (uendret, del av /apptest) inneholder fortsatt merkenavn fra demodata; /apptest skulle beholdes som den er.

## 3. Lighthouse (mobil, standardinnstilling, lokal statisk server, Chromium)

| Side | Ytelse | Tilgjengelighet | Beste praksis | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| / | 97 | 100 | 100 | 100 | 2,4 s | 0 | 110 ms |
| /crm | 99 | 100 | 100 | 100 | 2,0 s | 0 | 80 ms |
| /ute | 99 | 100 | 100 | 100 | 2,0 s | 0 | 40 ms |
| /kundeportal | 99 | 100 | 100 | 100 | 1,8 s | 0 | 0 ms |
| /slik-virker-det | 100 | 100 | 100 | 100 | 1,7 s | 0 | 0 ms |
| /dokumenter | 99 | 100 | 100 | 100 | 1,8 s | 0 | 0 ms |
| /integrasjoner | 99 | 100 | 100 | 100 | 1,8 s | 0 | 0 ms |
| /priser-og-demo | 99 | 100 | 100 | 100 | 1,8 s | 0 | 0 ms |

(/slik-virker-det hadde CLS 0,31 før scenene ble skjult i CSS med `@media (scripting: enabled)`; rettet.) Målt lokalt uten Cloudflare-komprimering; produksjon er normalt like bra eller bedre.

## 4. Tester

`npm run build` (alle nettsteder) OK · `npm test`: 32/32 node-tester og lenkesjekk 308 forespørsler, 0 feil · `node scripts/skjermbilder.mjs`: 0 feil · `wrangler deploy --dry-run` OK med `send_email`-binding.

## 5. Hva Eirik må slå på i Cloudflare (skjemaet)

Detaljer og testtrinn: `docs/k160-cloudflare-skjema.md`. Kort:
1. **Email Routing på hengsel.no-sonen** (dashbordet: Compute › Email Service › Email Routing → hengsel.no → slå på; godta MX/SPF-postene). Sjekk først om hengsel.no allerede har e-post et annet sted – Email Routing bytter MX.
2. **Verifiser `hei@hengsel.no` som destinasjon** (Destination addresses; trykk «Verify email address» i e-posten Cloudflare sender). Bindingen `DEMO_EPOST` er låst til denne adressen.
3. **Avsender `demo@hengsel.no`** må ligge på sonen (dekket av trinn 1; postkasse trengs ikke). Vises «Email Sending»: «Onboard Domain» for hengsel.no (anbefalt for levering).
4. Ingen nøkler eller secrets. Bindingen står i `wrangler.jsonc`. **Risiko:** hvis Workers Builds avviser deploy fordi destinasjonen ikke er verifisert ennå, gjør trinn 1–2 før PR-en flettes (eller fjern `send_email`-blokken midlertidig; da svarer ruten 503 og siden viser mailto-reserven).
Før dette er på, viser siden «Forespørselen ble ikke sendt.» med mailto-lenke og telefonnummer.

## 6. Appbilder som skal byttes etter K-159

Alle ligger i `sites/hengsel/public/img/app/` med faste filnavn (ren filerstatning, samme filnavn; iPhone 402×874 – bytt gjerne til 2×/3×, `width`/`height` i markupen følger `content/ute.ts`/`index.astro`, så oppgi nye mål der om størrelsen endres). Kilde i dag: designet, runde 1–7.

| Fil (lys og mørk) | Brukes på | Skjerm |
|---|---|---|
| `idag-lys/-mork.webp` | /, /ute | I dag (iPhone) |
| `ipad-idag-lys/-mork.webp` | / | I dag (iPad, jobben til Kari Nordmann) |
| `jobben-lys/-mork.webp` | /ute | Jobben |
| `ks-lys/-mork.webp` | /ute | KS-sjekkliste |
| `avvik-lys/-mork.webp` | /ute | Meld avvik |
| `punkter-lys/-mork.webp` | /ute | Punktlista |
| `ferdig-lys/-mork.webp` | /ute | Ferdig montert |
| `uten-nett-lys/-mork.webp` | /ute | I dag uten nett |
| `ipad-bildeverktoy-laser.webp` (2360×1640, ett bilde) | /ute | Bildeverktøyet på iPad, «Lasermåler» |

Statuslinje («9:41») og «Din logo / by Hengsel» tegnes av `Enhet.astro` over bildene; ekte skjermbilder har egen statuslinje – sett `statusFarge`/fjern overlegget (`utenLogo`) når de byttes. Dokumentforsiden `public/img/dok-forside.webp` er beskåret fra repoets dok-tilbud. CRM- og portalskjermene er HTML (ingen bildebytte). Gamle bilder i `public/img/` (ute-*.webp, crm-*.webp osv.) brukes fortsatt av /apptest.

## 7. Åpne punkter / til K-161
- K-161 (Visningsrommet) kan bruke dokumentvisningen: se `docs/dokumentvisning.md` (tre veier; enkleste er fragment bygget av sites/hengsel).
- Skjermlesertest og ekte enheter gjenstår.
