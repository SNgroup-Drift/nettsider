# N-7 – Nettsidene på designsystem 2.5

Gren `claude/n7-design-2-5-xebqv1` (dagøkt 18.10.2026, startet kl. 15.35; K-371 kom i demo kl. 16.06 norsk tid, og jeg ventet på den). Skrevet av Code.

## Kort

- **Pin = K-371-commiten:** `7419b949097b2883b9bbfff2ad4bede001a46861` («demo: flett claude/k371-ds-2-5», rapporten i hengsel-crm: `claude/k371-rapport.md` på grenen `claude/k371-ds-2-5`, avsnittet «Nettsider-pinnen»). `designsystem.pin.json` har versjon **2.5.0**. `npm run design:hent -- --kilde <hengsel-crm> --commit 7419b949…` er kjørt; ingen fil i `ds/` eller `tokens.css` er redigert for hånd.
- **Produktpalettene i `tokens.css`:** `[data-produkt="ute|nettsider|crm|admin"]` (bare lyse) og `--nivaa-haster-*`, `--nivaa-snart-*`, `--nivaa-stripe`. Generatoren `scripts/lag-hengsel-tokens.mjs` skriver dem fra `produkt` og `nivaa` i pinnet JSON (den delte fila er bare lys, så pakkens egen `tokens.css` med mørke Ute-blokker kunne ikke brukes som den er).
- **Hver Hengsel-side har riktig `data-produkt` og riktig logo,** design.hengsel.no viser de fire palettene og de 72 ikonene fra pakken.
- **Ingen avvik funnet ved gjennomgangen mot hengsel-regler.md** (se under). `npm test` grønn: 226 tester, 225 bestått, 0 feilet, 1 hoppet over (nye: `produktpaletter.test.mjs` med 3 tester og 1 i `design-fasit.test.mjs`).
- Alle sidene bygger (`npm run build`).

## Hva som endret seg synlig, per side

| Side | Før | Nå |
|---|---|---|
| **hengsel.no** (alle sider) | blågrå Ute-palett med grønn aksent og grønn prikk i merket | `data-produkt="nettsider"` på `html`: varm bunn (#FAF6F2), oransje aksent (knapper, lenker, fokus), **oransje prikk** i merket (meny, bunn, hjelp, apptest) |
| hengsel.no /crm og /kundeportal | som over | flaten under toppen er `crm` (blå aksent, grågrønn nøytral bunn); CRM-skjermene (`CrmSkjerm`, forsiden og andre) er `crm` med **blått CRM-merke** (`logo-crm`) |
| hengsel.no /ute | som over | flaten under toppen er `ute` (grønn aksent og kald bunn som før) |
| hengsel.no /kunde/sigdal | Sigdal-tema | uendret (kundeutgaver får ingen produktpalett; testet) |
| **vis.hengsel.no** (33 sider) | grønn Ute-palett, grønt merke | `nettsider` på `html`, oransje merke; skjermrammene med `crm-`, `kundeportal-` og `portal-`-bilder er `crm` (blått CRM-merke i rommene), rammene med `ute-`-bilder er `ute` |
| **design.hengsel.no** | grønn, 53 ikoner | `nettsider` (oransje meny og bunn med oransje merke); **/farger** har ny seksjon «Produktpaletter» med alle fire (prikk, knapp, lenke, 14 roller med hex fra JSON og kontrast); **/komponenter** viser **72 ikoner** fra `ikoner.json` (68 fra Design 2.5, 19 av dem nye, + 4 egne) med ny gruppe «Haster og synlighet» (12 px-nivåikoner i nedlastingen); **/merke** har «Produktlogoer 2.5» med de fire logoene |
| **admin.hengsel.no** (alle sider + innlogging) | grønn | `data-produkt="admin"` på `html`: lilla aksent (#7233AC), nøytral CRM/Admin-bunn (#F1F1EF); lilla Admin-logo på innloggingssiden |
| sngroup.no og byggem.no | – | **ikke rørt** (SN Groups palett) |
| demo.hengsel.no | – | ligger ikke i dette repoet (er hengsel-crm-appen), ikke rørt |

## Valg jeg tok (uten å spørre)

1. **Logoene fra Designs 2.5-kilde, ikke fra `assets/logo`.** Pakken K-371 pinnet (`assets/logo`, palettpakke v2) har fortsatt eldre produktfarger: Hengsel grønn prikk, Ute oransje, Admin grå. Det strider mot oppgaven (Hengsel oransje, Ute grønn, Admin lilla), og K-371 har det som åpent spørsmål 2. De riktige filene ligger i `claude-design/2-5/assets/logo/` (commiten, uendret fra Design). `hent-designsystem.mjs` har fått en liste `EKSTRA` som henter dem byte for byte til `ds/produktlogo` (sha256 i pin-fila), og samme for ikonsettet (`ikoner/` → `ds/ikoner-2-5`, ikke i HENTES før). `ds/assets/logo` og merke-/palettpakken er ikke endret, og de gamle utplasserte `public/logo/*` ligger der men brukes ikke lenger av sidene (merkepakke-testen er grønn). Logoene brukes som `<img>` via `packages/hengsel-tokens/src/produktlogo.ts` (Vite `?url`, i vis kopiert av `bygg.mjs`). Admins tilbud-PDF (Worker) bruker fortsatt `public/logo/logo-hengsel-lys.svg`: det er Hengsels merke på et kundedokument, ikke Admin-skjermen.
2. **`data-produkt` på `html` (sidenivå) og på flater**, ikke bare på innpakninger. K-371 anbefalte innpakning, men blokkene virker også på `html` (de står etter `:root` og P3-/kontrast-blokkene, så produktet vinner). Konsekvens: på nettsider/admin vinner produktets `flate-side` over grunnpalettens, og P3/økt kontrast for aksent gjelder ikke på disse sidene (produktpalettene har dem ikke i 2.5).
3. **Mørk-modus-testen** (`mork-modus-nettleser.test.mjs`) forventer nå produktets `grunn` (nettsider #FAF6F2, admin #F1F1EF) i stedet for grunnpalettens, og sjekker `data-produkt` per side. Ellers uendret: maskinens mørke innstilling gjør fortsatt ingen side mørk.
4. **72 ikoner, ikke 68, på design.hengsel.no:** `ikoner.json` i pakken har 72 (68 fra Design + de 4 egne fra K-230). 68 er Designs tall; jeg viser alle og sier fordelingen i teksten. Den gamle ikonmappa (palettpakke, 49 + 4) er ikke lenger kilde for design-siden (ligger fortsatt i `ds/assets/ikoner` for pakken).
5. **/ute, /crm og /kundeportal:** bare flaten under toppen (`Innhold`) og skjermene tar produktet, ikke tittelen i toppen, så menyen og siden henger sammen som nettside.

## Gjennomgang mot hengsel-regler.md (mål 3)

`node scripts/hengsel-regler.mjs` og testene `hengsel-regler`, `gamle-farger`, `mork-modus-nettleser`, `design-fasit`: ingen hex/rgb/hsl i hengsel, vis, design, admin eller dokumentpakken, ingen `prefers-color-scheme`, `data-theme` eller `.dark`, `color-scheme: light` på alle sider, skriften er bare Schibsted Grotesk fra `ds/assets/fonts` (ingen Google Fonts, Inter og Newsreader bare i kundetemaet). Jeg fant ingen avvik å rette. Dette er bekreftet av skanner og tester, ikke en visuell gjennomgang av hver side.

## Åpent for Eirik (følger av K-371 og dette arbeidet)

1. **Logoene i `ds/assets/logo` (palettpakke v2)** har eldre produktfarger. Når Design/K-371 bestemmer det, kan `EKSTRA` for `produktlogo` fjernes og sidene peke på `assets/logo`. Siden /merke viser nå begge (de gamle under «Alle former»), med en merknad.
2. **Status «ny»** (K-371, åpent 1): grunnpaletten har fortsatt blå «ny», Design har nøytral gråblå. Ikke endret her (farger endres bare i designsystemet).
3. **Økt kontrast og P3 for nettsider/CRM/Admin** finnes ikke i produktpalettene i 2.5: Hengsel-sidene mister P3 og økt kontrast for aksentfargen (grunnpaletten hadde det for furu). Kommer når Design tar det inn.
4. Admin-sidemenyen har en «H» i tekst (`merke-init`), ikke merkefila; den er ikke byttet mot logoen.

## Kontroll og begrensninger

- Skjermbilder av forsidene (1440 og 390) i `claude/n7-skjermbilder/`: hengsel.no, vis., design. (forside, /farger, /komponenter), admin (innlogging, fordi `/` trenger API-et bak Access) og hengsel.no /ute og /crm. Laget lokalt med Playwright mot de bygde sidene. **Bilder fra biblioteket (bilder.hengsel.no) vises ikke i skjermbildene** (sandkassen når ikke nettet; manifestkopien i repoet brukes og sidene bygger), så enhetsrammene står uten app-bilde.
- HawkScan er ikke kjørt: ingen API-nøkkel i økta, og endringen er statiske sider.
- Ingen nøkler, passord eller tokens i repo eller rapport. Ingen bilder inn i repoet utenom skjermbildene i `claude/n7-skjermbilder/` (nettsidenes egne kontrollbilder, ikke app-skjermbilder fra biblioteket).
- Ingen endring i sngroup.no, byggem.no eller `docs/hosting.md`.

N-7 KLAR
