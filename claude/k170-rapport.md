# K-170 · hengsel.no: appbilder og fil for app-lenker (S-28)

Gren `claude/k170-hengselno-appbilder`, laget fra `origin/main` (PR #49 / K-174 er flettet). Leste `innlandet-crm-sync` (grenene `claude/k176-hengsel-merke-ios` og `demo`), skrev ikke dit. Ingen passord eller nøkler i filer eller chat.

## Kort fortalt
- **Ingen bilder byttet (0 av maks 5).** Ingen K-176-skjerm er klart bedre enn designskjermene fra K-177. Se tabellen under.
- **apple-app-site-association** ligger i `sites/hengsel/public/.well-known/` (uten filendelse) med appID `XZH4APZ727.no.hengsel.montor`, servert som `application/json` uten omdirigering.
- **`/app/jobb/*` og `/app/foresporsel/*`** viser «Åpne i Hengsel Ute» (noindex,nofollow, lenke til `/apptest`).
- **App-navnet** er rettet til «Hengsel Ute» i løpende tekst på `/apptest` og to andre steder. «Ute» står alene bare under ikonet.
- `npm run build` OK · `npm test` 47/47 + lenkesjekk 587 forespørsler, 0 feil · `scripts/skjermbilder.mjs` 0 feil · Lighthouse mobil 98–100, CLS 0.

## Avvik fra oppgaven (les først)
1. **Fila fra K-168 finnes ikke.** `hengsel-ios/docs/aasa/` finnes ikke på `demo` eller på K-176-grenen (K-168 er ikke flettet, jf. K-176-rapporten). Det eneste som fantes er `docs/hengsel-lenker/apple-app-site-association` fra K-112 på `demo`, og den har plassholderen `TEAMID` og stien `/app/*`. Jeg skrev derfor fila selv: appID = `DEVELOPMENT_TEAM` (XZH4APZ727, i `hengsel-ios/project.yml`) + `PRODUCT_BUNDLE_IDENTIFIER` (`no.hengsel.montor`), og to stier, `/app/jobb/*` og `/app/foresporsel/*`. **Kontroller at K-168 sin fil, når den kommer, har samme appID og stier.** Entitlementen `applinks:hengsel.no` står allerede i `Hengsel.entitlements`.
2. **K-176-skjermbildene ligger ikke i `hengsel-ios/docs/skjermbilder/k176/`**, men i `claude/k176/skjermbilder/` (10 filer, se under).
3. **Stien er `/app/foresporsel/*` (entall)**, som i oppgaven. K-112-dokumentet nevner `/app/foresporsler` (flertall); den lenka dekkes ikke av fila nå. Si fra hvis den også skal med.

## 1. Bilder: byttet eller beholdt
Alle K-176-skjermene er tatt i Demo-miljøet i iPhone 17 Pro-simulatoren. De viser det nye merket og ingen merkenavn, men har det som en markedsføringsskjerm ikke bør ha: oransje «Demo – ingen ekte kunder»-felt, simulatorens 09:41-statuslinje og island (dobbelt med rammen på nettsiden), og skjermer uten salgsverdi (innlogging, Meg, hjemskjerm). Ingen av dem erstatter en skjerm som vises på nettsidene i dag.

| K-176-skjerm | Sammenlignet med (brukes på) | Valg | Begrunnelse |
|---|---|---|---|
| `innlogging-demo-lys` / `-mork` | Ingen innloggingsskjerm vises på nettsidene | Beholdt (ikke brukt) | Demo-banner og «Brukernavn eller e-post»; ingen designskjerm å sammenligne med |
| `innlogging-ekte-lys` / `-mork` | Som over | Beholdt (ikke brukt) | Tom «Din logo»-boks; svakere enn designet |
| `meg-lys` / `-mork` | Ingen Meg-skjerm på nettsidene | Beholdt (ikke brukt) | Demo-banner, avkuttet topp, ikke en salgsskjerm |
| `hjemskjerm-standard`, `-mørkt`, `-klart`, `-tonet` | Appikonet vises som ikon-flis (`ApptestIkon`, `brand/hengsel-merke/app-ikon`) | Beholdt | Simulatorens bakgrunn og ikonrutenett; merkepakkens ikon er renere. Kan brukes på nytt når et ekte ikonbilde fra enhet foreligger |

Skjermene som faktisk er i bruk (`img/app/*`, `/apptest` heroskjermene, firmaleder/utkjører/lager, iPad bildeverktøy) er uendret fra K-177: fiktive designskjermer med nytt merke, uten statuslinje og «Din logo». Tabellen over hvert bilde fra K-177 står i `claude/k177-rapport.md`.

## 2. App-lenker
| Del | Hva | Filer |
|---|---|---|
| AASA | appID `XZH4APZ727.no.hengsel.montor`, stier `/app/jobb/*`, `/app/foresporsel/*` | `sites/hengsel/public/.well-known/apple-app-site-association` |
| Headers | `Content-Type: application/json` og `Cache-Control: public, max-age=3600` på fila; `X-Robots-Tag: noindex, nofollow` og `no-store` på `/app/*` | `sites/hengsel/public/_headers` |
| Ingen omdirigering | `_redirects` har ingen regel for `/.well-known/*` (testet) | `sites/hengsel/public/_redirects` |
| Fallback-side | `/app/jobb/*` og `/app/foresporsel/*` skrives om (status 200, ikke omdirigering) til én statisk side, `/app/apne` («Åpne i Hengsel Ute», knapp «Hent Hengsel Ute» → `/apptest`). Adressen står uendret, så iOS kan åpne appen fra den. Ingen skript, robots `noindex,nofollow`, ikke i sitemap | `sites/hengsel/src/pages/app/apne.astro` |
| Test | `scripts/app-lenker.test.mjs` (med i `npm test`): fila finnes i kilden og i `dist/` uten filendelse, riktig appID og stier, ingen `TEAMID`, `_headers` setter `application/json`, `_redirects` skriver om og rører ikke `/.well-known`, siden har noindex, h1, lenke til `/apptest`, ingen skript og står ikke i sitemap | |

Sjekket med `wrangler dev --local` (samme motor som Cloudflare): `/.well-known/apple-app-site-association` → 200 `application/json`; `/app/jobb/abc123` og `/app/foresporsel/9` → 200 med siden og `x-robots-tag: noindex, nofollow`; `/app/finnes-ikke` → 404.

### Hva som gjenstår for app-lenkene
1. **Serveren må sende lenkene.** CRM-et sender i dag `<CRM>/#/orders/<id>`, `#/montor/<nøkkel>` og `#/utkjoring/<nøkkel>`. Ingen av dem går til hengsel.no, og det etter `#` sendes ikke til telefonen. For at SMS og e-post skal åpne jobben i appen, må CRM-et sende `https://hengsel.no/app/jobb/<ordre-id>` (og `…/app/foresporsel/<id>` for forespørsler). Egen økt.
2. **Etter flett og utrulling:** `curl -sI https://hengsel.no/.well-known/apple-app-site-association` skal gi 200 og `application/json` direkte på `hengsel.no` (ikke `www`). Apple henter fila via sin CDN når appen installeres eller oppdateres, og det kan ta opptil et døgn. Installer bygget på nytt hvis lenken ikke åpner appen.
3. **Bygget må ha `applinks:hengsel.no`** (står i entitlements) og et Apple-team-ID som stemmer med `XZH4APZ727`.
4. **Android** (`assetlinks.json`, App Links) er ikke en del av K-170. Fingeravtrykkene mangler fortsatt (se `docs/hengsel-lenker/LES-MEG.md` i innlandet-crm-sync).
5. Fallback-siden sier ikke «åpne» automatisk: appen åpnes av iOS når lenken trykkes (ikke fra en side som allerede er lastet i Safari). Brukeren får beskjed om å trykke lenken igjen. Vil dere ha en egen «Åpne»-knapp, trengs et app-skjema (`hengsel://`), som appen ikke har i dag.

## 2b. App-navnet: «Ute» under ikonet, «Hengsel Ute» i tekst
- Sjekket `/apptest` og resten av hengsel.no. Under ikonet står «Ute» (`ApptestIkon.astro`, uendret). Butikkene og menyen sier «Hengsel Ute» (`nav.ts`, `ute.ts`, `integrasjoner.ts`, uendret).
- **Rettet** (løpende tekst, tittel, alt-tekster, kommentar): `/apptest` (tittel «Test Hengsel Ute», h1, beskrivelse, trinnene «Åpne Hengsel Ute», «Installer Hengsel Ute fra Google Play», fire alt-tekster i `apptest.astro`, fire i `apptest-innhold.ts`), `/slik-virker-det` («jobben i Ute» → «jobben i Hengsel Ute», to steder), `/personvern` («Montørappen Hengsel» → «Montørappen Hengsel Ute», overskrift og tekst).
- **Ikke endret:** `manifest.webmanifest` («Hengsel»; det er nettsiden som app på hjemskjermen, ikke montørappen) og bunnlinjens «Hengsel · ES-HOLDING AS» (firmanavnet).
- Delingsbildet `og-apptest.png` er ikke åpnet på nytt; sjekk at det ikke sier «Hengsel» alene hvis det inneholder tekst.

## 3. Kvalitet
| Sjekk | Resultat |
|---|---|
| `npm run build` | OK (alle fire nettsteder) |
| `npm test` | 47 av 47 (tidligere 42 + 5 nye) |
| Lenkesjekk | 587 forespørsler, 0 feil (hengsel: 63 interne adresser, `/app/apne` med) |
| `scripts/skjermbilder.mjs` | 0 feil; ingen konsollfeil, ingen vannrett rulling |
| Lighthouse mobil (wrangler dev, 3 kjøringer per side) | `/`: ytelse 98, tilgjengelighet 100, beste praksis 100, SEO 100, LCP 2,2–2,4 s, CLS 0, TBT 0–60 ms · `/crm`: 99/100/100/100, LCP 2,0–2,1 s, CLS 0 · `/ute`: 99/100/100/100, LCP 2,1 s, CLS 0 · `/app/apne`: 100/100/100/**69** (SEO 69 bare fordi siden med vilje er noindex), LCP 1,5 s, CLS 0 |

Skjermbilder (390 og 1440 px, lys og mørk) for `/`, `/crm`, `/ute` og `/kundeportal` ligger i `claude/k170-skjermbilder/` (`forside-`, `crm-`, `ute-`, `kundeportal-`), sammen med den nye siden (`app-apne-…`) og før/etter for `/apptest` (`apptest-…-for/-etter.png`).

**Før/etter:** forsiden og `/crm` er visuelt uendret (ingen bilder byttet, bare tekst på andre sider). `/apptest` endrer overskrift til «Test Hengsel Ute».

## Flett
PR mot `main`. Eirik fletter. Etter utrulling: curl-sjekken under «Hva som gjenstår», punkt 2.

**K-170 KLAR.**
