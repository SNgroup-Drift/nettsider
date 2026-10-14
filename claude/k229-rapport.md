# K-229 · Nettsidene ryddes (14.10.2026)

Gren `claude/k229-nettsider-struktur` (fra `origin/main` etter K-223 og K-226), PR mot `main`, sak S-61. Eirik fletter selv. Ingen nøkler eller passord i repoet.
Inkluderer **tillegg 1** (Visningsrommet: én side per menyfane).

**Sjekk:** `npm run build` grønn. `npm test`: 145 tester, 144 grønne, 0 røde, 1 hoppet over av testen selv (som før). Lenkesjekken: 827 forespørsler, 0 feil.
Skjermbilder i 390 og 1280 px: `claude/k229-skjermbilder/` (hengsel.no forside, `/kunde`, `/kunde/hjelp`, sngroup.no, vis forside, de nye menysidene og rommet `/crm/`, og Sigdal-utgaven av vis). Lag på nytt: `node scripts/skjermbilder-vis-sider.mjs` (etter `npm run build`).

## 1. Kartlegging: sider, menyer og lenker, med ny adresse

| Gammel adresse | Ny adresse | Hvordan |
|---|---|---|
| `hengsel.no/hjelp` (og `/hjelp.html`, `/hjelp/*`) | `/kunde/hjelp` | 301 (`public/_redirects`) |
| `hengsel.no/dokumenter` (og `/dokumenter.html`, `/dokumenter/*`) | `/kunde/dokumenter` | 301. Var åpen, nå bak Access |
| `hengsel.no/sigdal` og alt under (`/sigdal/crm`, `/sigdal/vis/…`, `/sigdal/img/…`, `/sigdal/tema.css`) | `/kunde/sigdal/…` | 301 med splat, også undersider og bilder |
| `hengsel.no/apptest` (passord) | `/kunde/apptest` | **Se punkt 2: flyttes av Workeren når Eirik slår det på**, ikke før |
| `hengsel.no/slik-virker-det` | `/` (forsiden) | 301. Historien hører hjemme i vis (`/reise/`). Kilden er beholdt for Sigdal-utgaven |
| `hengsel.no/jobb` (gammel omdirigering) | `/` | Var `/slik-virker-det`. Lenkesjekken fanget at målet ble borte |
| vis: `/#forsta`, `/#prov`, `/#dokumenter`, `/#presenter` | `/forsta/`, `/prov/`, `/dokumenter/`, `/presenter/` | Lite skript på forsiden (også i Sigdal-utgaven). `?rolle=` følger med |

Hvor de gamle adressene var brukt i repoet, og hva som er gjort:
- **Meny og bunn på hengsel.no** (`content/nav.ts`): «Slik virker det» og «Dokumenter» er tatt ut. Forsidens «Se nærmere på» har fem kort i stedet for sju. `crm.astro` lenket til `/slik-virker-det`: lenken er fjernet.
- **Sitemap** (`public/sitemap.txt`): `/dokumenter` og `/slik-virker-det` er tatt ut. `/kunde`, `/hjelp`, `/sigdal` står ikke der (testet).
- **Ankre på gamle forsider:** `scripts/gamle-ankere.ts` (`#jobb` → `/`).
- **Sigdal-utgaven** (`packages/kundetema-sigdal/profil.json`, `src/kunde.ts`): rotstien er nå `/kunde/sigdal`; Sigdals egen meny peker fortsatt til `/kunde/sigdal/slik-virker-det`, `/dokumenter` osv. (den egne utgaven har alle sidene).
- **Visningsrommet:** menyen og «‹ Prøv selv» på gruppesidene (`/butikken/`, `/montoren/`, `/kunden/`, `/leverandoren/`, `/rom/`) peker til de nye sidene. `/dokumenter/#fdv` og lignende er uendret.
- **Dokumenter i vis** nevner «hengsel.no/dokumenter» i en bunntekst (`sites/vis/src/dokumenter/index.html`, `sites/vis/README.md`). Teksten er ikke endret (ingen ny påstand), men adressen er nå `/kunde/dokumenter`. **Eirik: si fra om den skal endres.**
- **`/apptest` brukes fortsatt av:** «Bli tester» og «App Store» på `/ute` (`content/ute.ts`, `content/nav.ts`), «Hent Hengsel-appen» på `/app/lenke` og `/app/apne` (universal links, K-170), QR-koden på `/apptest`, EAS-/GitHub-arbeidsflyten `.github/workflows/apptest-versjon.yml`. De virker uendret så lenge `/apptest` lever, og følger 301 når den slås på.
- **Må sjekkes utenfor dette repoet (jeg har ikke tilgang):** lenker fra CRM-et (`innlandet-crm-sync`, f.eks. Hjelp-menyen og app-lenkene), e-postmaler og utsendte invitasjoner som peker på `/apptest`, `/dokumenter`, `/sigdal` eller `/hjelp`, trykte QR-koder til `/apptest`, og Cloudflare Access-appene. Alle slike lenker virker via 301, men bør oppdateres til de nye adressene.

## 2. Kundeområdet `/kunde`

- Forside `/kunde` med fire kort: **Hjelp** (`/kunde/hjelp`), **Test appen** (`/kunde/apptest`), **Dokumenter** (`/kunde/dokumenter`) og **Din utgave** (`/kunde/sigdal`). Tekstene er hentet fra sidene de lenker til. Egen topplinje med logo og de tre delene (`aria-current` på aktiv).
- **Worker:** `worker/kunde.ts` gjør Access-sjekken fra K-223/K-226 (`worker/access.ts`, signaturkontroll) for hele `/kunde/*`. 403 uten gyldig token, og også når `ACCESS_TEAM_DOMAIN` eller `ACCESS_AUD` mangler. `noindex, nofollow` og `private, no-store` på alle svar. `worker/hjelp.ts` og `worker/sigdal.ts` er slått sammen i `kunde.ts`. `run_worker_first`: `["/apptest", "/apptest/*", "/api/demo", "/kunde", "/kunde/*"]`.
- **Sigdal flyttet fysisk** til `/kunde/sigdal` (sider, `tema.css`, plassholderne i `public/kunde/sigdal/img/`, Visningsrommet i Sigdal-utgave i `/kunde/sigdal/vis/`). Ingen innhold ligger lenger under `/sigdal`.
- `/kunde/apptest` er samme side som `/apptest`, uten eget passord (Access er innloggingen). Demopassordet (`DEMO_PASSORD`) settes inn for innloggede, som i Sigdal-utgaven. PDF-en med demobrukerne er kopiert dit ved bygging.
- `/kunde/dokumenter` har egen topplinje (ikke den åpne menyen). Sigdal-utgaven av dokumentene bruker samme innhold (`components/dokumenter/DokumenterInnhold.astro`).

### Apptest-passordet: når det kan fjernes
Passordet er **beholdt og uendret** til Access står foran `/kunde`. Slik går overgangen uten at testere står uten tilgang:
1. Eirik setter opp Access på `/kunde*` (punkt 7) og prøver `https://hengsel.no/kunde/apptest` i et privat vindu.
2. Eirik legger inn den vanlige variabelen **`APPTEST_VIDERE` = `1`** på Workeren `hengsel` (Settings → Variables and Secrets; ikke hemmelighet). Da sender Workeren `/apptest` og alt under med 301 til `/kunde/apptest` (`/apptest/passord` til `/kunde/apptest`, PDF-en til `/kunde/apptest/…`). Testet mot ekte `wrangler dev` (`scripts/kunde-worker.test.mjs`).
3. **Passordet kan fjernes** (slett hemmelighetene `APPTEST_PASSORD` og `APPTEST_NOKKEL`) når `/kunde/apptest` er prøvd med innlogging og videresendingen virker. Koden for passordsiden (`worker/apptest.ts`, `pages/apptest/passord.astro`) kan fjernes i en egen PR etterpå (jeg har ikke rørt den).

## 3. Videresendinger (301) og lenkesjekken
Se tabellen i punkt 1. Regler i `sites/hengsel/public/_redirects` (kjøres av Cloudflare før noe kode), uten å vise innhold, så de krever ikke innlogging. Alle prøvd mot ekte `wrangler dev`, også undersider og spørrestreng (`scripts/kunde-worker.test.mjs`).
**Lenkesjekken (`npm test`) fanger nå:** hvert 301-mål finnes; ingen side i `dist` ligger bak en omdirigering; åpne sider lenker ikke til `/kunde`; ingen side lenker til gamle adresser (`/hjelp`, `/sigdal`); `/kunde/*` har noindex og står ikke i sitemap. Den fanget allerede én ekte brutt omdirigering (`/jobb`).

## 4. hengsel.no kortet ned
Etter oppskriften (produktet, moduler, priser og demo, kontakt). Ingen nye påstander om hva løsningen kan; bare tekst som sto der fra før.
- **Forsiden:** «Prøv selv» er primærknapp og går til `https://demo.hengsel.no` (adressen står i `content/forside.ts`, `PROV_SELV`); «Be om demo» er sekundær. «Ordrens reise» (åtte steg) er fjernet. iPad-bildet i heroen er fjernet (Studio Display og iPhone er igjen). Kortene «Slik virker det» og «Dokumenter» er fjernet.
- **`/ute`:** iPad-seksjonen (bilde og tekst) er fjernet.
- **Flyttet ut av åpen side:** `/dokumenter` (til `/kunde`), `/slik-virker-det` (til vis; sida er beholdt som kilde for Sigdal-utgaven).
- **Skjermbilder:** forsiden har to rammer mindre (iPad), `/ute` ett bilde mindre. `/crm` og `/kundeportal` bruker skjermer tegnet i HTML, ikke bildefiler, og er uendret. Resten av bildene (iPhone-skjermene på `/ute`, forsidens Studio Display og iPhone) står til biblioteket fra K-228 finnes; det finnes ikke i repoet ennå. Bildefilene i `public/img` er ikke slettet.
- **Åpent for Eirik:** `/crm` er en klikkbar demo i fire steg som nå overlapper med demo.hengsel.no. Jeg har ikke fjernet den uten din avgjørelse. `/integrasjoner` og `/kundeportal` er beholdt som «moduler».

## 5. vis: «Prøv i demoen» og én side per menyfane (tillegg 1)
**Menysidene:** `/forsta/`, `/prov/`, `/dokumenter/` og `/presenter/` er egne sider; forsiden er en kort inngang med rollevelger («Jeg er») og fire kort med overskriftene og ingressene fra de gamle seksjonene. Menyen markerer aktiv side med `aria-current="page"` (på PC og i ≡-menyen); rommene under Prøv markerer Prøv med `aria-current="true"`. Menyen og bunnen lages av `<!--meny …-->` og `<!--bunn-->` i `sites/vis/bygg.mjs`, så alle sidene og Sigdal-utgaven (`/kunde/sigdal/vis/forsta/` osv., Sigdal-tema, bak Access) får det samme. `/dokumenter/` viser alle ni dokumenter fra før; de fem A4-arkene på den gamle forsiden er det samme innholdet i miniatyr og er ikke gjentatt. Test: `scripts/vis-meny.test.mjs`.

**«Prøv i demoen»** står i de fem rommene som bare viser skjermer (skjermbilder i enhetsrammer, ingen simulering):

| Rom | Lenke (nå) |
|---|---|
| `/crm/` Prøv CRM selv | `https://demo.hengsel.no/` |
| `/montor/` Montørappen Hengsel Ute | `https://demo.hengsel.no/` |
| `/firmaleder/` Firmaleder i Hengsel | `https://demo.hengsel.no/` |
| `/minside/` Kundens Min side | `https://demo.hengsel.no/` |
| `/tegning/` Tegningen i Hengsel | `https://demo.hengsel.no/` |

**To ting jeg ikke kunne avgjøre selv:**
- **Riktig sted i demoen:** demo.hengsel.no har ingen kjent rute per rom (siden står som «kommer», K-180/K-181). Alle lenkene går derfor til forsiden i demoen. Stedene står i `sites/vis/demo-lenker.json` (én sti per rom); bytt stien der, så følger bygget med. Send meg rutene, så gjør jeg det.
- **«I stedet for egne skjermbilder»:** jeg har **lagt til lenken og beholdt skjermbildene**, siden demoen ikke er oppe ennå og rommene ellers ville blitt tomme. Når demoen svarer og stedene er satt, tar vi bort skjermbildene i de fem rommene (egen PR). Rommene som viser mer enn skjermer (`/reise/`, `/kunde/`, `/kontroll/`, `/montasjeplan/`, `/leder/`, `/system/` m.fl.) har ikke lenken (testet).
- **Sigdal-utgaven** får ikke demolenken (den lenker ellers ikke ut av `/kunde/sigdal`, og demoen er Hengsels).

## 6. sngroup.no
Hengsel-rommet er ett kort: logo, «App for montører», den samme teksten som før (uten «Bla gjennom skjermene til høyre» og punktlista), «Se hengsel.no» → `https://hengsel.no`, og personvernlenken (beholdt, den hører til appen). `HengselEnheter.astro`, `Enhet.astro` og alle skjermbilder og enhetsrammer (`public/skjermbilder`, `public/enheter`) er fjernet fra sngroup.no (testet: ingen skjermbilder i dist). Plantegningen og raden «Hengsel» under Virksomheter er uendret.

## 7. Eirik: endre Access til `/kunde*` i Cloudflare
Nå står (etter K-223 og K-226) Access-appen «Hengsel kunde» foran `hengsel.no/sigdal*` og `hengsel.no/hjelp*` (én app, eller to).
1. Zero Trust → **Access → Applications** → åpne appen(e) for `hengsel.no/sigdal*` og `hengsel.no/hjelp*`.
2. Bruk **én** app: på appen du beholder, endre Public hostname til domain `hengsel.no`, path **`kunde*`** (dekker `/kunde` og `/kunde/…`). Fjern de gamle stiene `sigdal*` og `hjelp*`. Er det to apper: slett den andre etter at `kunde*` er på plass.
3. Policy uendret: One-time PIN (e-postkode), Allow for `@studiosigdal-innlandet.no`, `@sngroup.no` og enkeltadresser.
4. **Hold AUD-taggen uendret** (rediger appen, ikke lag ny), så trenger ikke `ACCESS_AUD` på Workeren å byttes. Lager du en ny app, legg den nye AUD-en til `ACCESS_AUD` (flere skilles med komma) før du sletter den gamle.
5. Test i privat vindu: `https://hengsel.no/kunde` skal be om e-post og kode; så `/kunde/hjelp`, `/kunde/dokumenter`, `/kunde/sigdal`, `/kunde/sigdal/vis/forsta/`. Gamle adresser (`/hjelp`, `/sigdal`, `/dokumenter`) skal gi 301 til de nye. `https://hengsel.no/` og `/crm` skal fortsatt være åpne.
6. Til slutt (punkt 2 over): sett `APPTEST_VIDERE=1` og prøv `/apptest`.
7. **Rekkefølge:** flett PR-en, endre Access samme dag. Mellom flettingen og Access-endringen svarer `/kunde/*` 403 (det er meningen), og `/hjelp` og `/sigdal` videresendes dit. Passordet på `/apptest` virker hele tiden.
8. Legg `sites/vis/*` og `packages/kundetema-sigdal/*` til i Build watch paths for Workeren `hengsel` (Sigdal-vis bygges fra vis-kildene); se `docs/hosting.md`.

## Andre merknader og risiko
- **Alle som kommer inn via Access ser hele `/kunde`, inkludert Sigdal-utgaven** (én innlogging, som bestemt). Kommer det flere kunder: lag egne Access-apper per `kunde/<kunde>*` (policy per kunde) i stedet for én for hele `kunde*`.
- `/kunde/sigdal`-sidene bruker fortsatt plassholdere («Skjermbilde kommer», K-223); Sigdal-logoen er som før.
- Workers Builds på PR-en: se PR-en (status sjekket etter push, se under).
- Hawkscan er ikke kjørt (ingen `HAWK_API_KEY`; nettstedene er statiske, og Access-koden er testet mot ekte `wrangler dev`).

**Filer som er endret mest:** `sites/hengsel/worker/{kunde,index}.ts`, `sites/hengsel/wrangler.jsonc`, `sites/hengsel/public/{_redirects,_headers,sitemap.txt}`, `sites/hengsel/src/pages/kunde/**`, `sites/hengsel/src/components/{KundeHode,dokumenter/DokumenterInnhold}.astro`, `sites/vis/{bygg.mjs,bunn.html,demo-lenker.json}`, `sites/vis/src/{forside.js,index.html,forsta,prov,presenter}`, `sites/sngroup/src/pages/index.astro`, `scripts/{kunde-worker,vis-meny,nettsider-struktur}.test.mjs`, `scripts/sjekk-lenker.mjs`, `docs/hosting.md`.
