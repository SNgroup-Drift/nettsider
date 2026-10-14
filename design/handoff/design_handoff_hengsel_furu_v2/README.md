# Overlevering: Hengsel furu v2

14.10.2026. Komplett pakke for palett, plattformlag, ikoner, logoer og skjermer. Erstatter `design_handoff_hengsel_furu` og `design_handoff_hengsel_plattform`.

## Til Claude Code

Filene i `skjermer/`, `designsystem/` og `ikoner/` er **designreferanser i HTML**, ikke produksjonskode. Bygg dem i kodebasens rammeverk (React + Tailwind for CRM og admin, SwiftUI for Hengsel 2.0, Expo for montørappen). Tokens, ikoner og logoer kan brukes direkte. Start med `MIGRERING.md`.

`.dc.html` åpnes i nettleseren når `support.js` ligger i samme mappe. Eksempeldata står i `renderVals()` nederst i hver fil. Alle navn og data er oppdiktet.

## Innhold

| Mappe / fil | Hva |
|---|---|
| `MIGRERING.md` | Rekkefølge for CRM (React/Tailwind), SwiftUI og Expo. Endrede tokens, 31 gamle fargekoder, filer som byttes, plattformlag og ikoner |
| `KONTROLL.md` | Kontrast for 284 tekst-, ikon- og kantpar i alle lag, lys og mørk. Søk etter gamle farger |
| `PLATTFORMLAG.md` | Hva hvert plattformlag overstyrer, med begrunnelse |
| `tokens/hengsel-palett.tokens.json` | Kilden. Grunnpalett, P3, økt kontrast, iOS, skala, merke, `k206` og `plattform` (pc, nettleser-under-1024, ios, montorapp), med `status` |
| `tokens/hengsel-palett.css` | Generert fra JSON. Grunn, P3, økt kontrast, K-206, lag a og b, tetthet. Hver blokk merket BESLUTTET eller FORESLÅTT |
| `tokens/tailwind/hengsel-preset.js` | Tailwind-preset mot CSS-variablene |
| `tokens/swift/HengselTokens.swift` | Generert fra JSON. `HengselTokens` (grunn, lys/mørk/økt kontrast) og `Plattform` (iPhone/iPad) |
| `tokens/swift/Hengsel.xcassets` | 30 fargesett i Display P3 med lys, mørk og økt kontrast |
| `tokens/rn/hengsel-tokens.ts` | Generert fra JSON. `grunn` og `montorapp`, med `useHengselTema()` |
| `tokens/android/` | Fargeressurser lys og mørk |
| `ikoner/16`, `20`, `24` | 49 SVG-er med currentColor |
| `ikoner/ikoner.json` | Navn, fil, gruppe, SF Symbol, egen, bruk |
| `ikoner/ikoner_oversikt.dc.html` | Oversiktsskjerm: ikon i fire størrelser, SF Symbol og bruk |
| `ikoner/hengsel-ikoner.svg`, `.js`, `IKONER.md` | Sprite, data for skjermene og tabell |
| `designsystem/logo/` | Hengsel, CRM, Ute, Admin og Levering. Logo og merke i lys, mørk, hvit og blekk. Hengsel også glass og tonet, og ordmerket alene |
| `designsystem/favicon/` | favicon.svg og PNG i 16, 32, 180, 192 og 512 |
| `designsystem/app-ikon/hengsel_ute.icon` | Icon Composer-pakke, lys og mørk |
| `designsystem/komponenter.dc.html` | Komponenter side ved side: PC, mobil, iOS lys/mørk, montørapp lys/mørk |
| `skjermer/crm_pc.dc.html` | CRM PC: Min dag, Ordre, ordre H-24117, prosjekt Bryn Hage med leiligheter |
| `skjermer/crm_mobil.dc.html` | CRM mobil i nettleser: Min dag og «Mer» |
| `skjermer/ios.dc.html` | iPhone I dag og Jobben, iPad Jobben med sidefelt. Lys og mørk |
| `skjermer/png/` | 16 PNG-er, én per skjerm og modus |

### PNG-er

| Fil | Skjerm |
|---|---|
| `crm_pc_min_dag.png`, `crm_pc_ordre.png`, `crm_pc_ordre_h24117.png`, `crm_pc_prosjekt_bryn_hage.png` | CRM PC, 1440 px, lys |
| `crm_mobil_min_dag.png`, `crm_mobil_mer.png` | CRM mobil i nettleser, 390 px, lys |
| `iphone_i_dag_lys.png`, `iphone_i_dag_mork.png`, `iphone_jobben_lys.png`, `iphone_jobben_mork.png` | iPhone, 393 × 852 |
| `ipad_jobben_lys.png`, `ipad_jobben_mork.png` | iPad, 1180 × 820 |

PNG-ene er tatt i 1× fra nettleseren. På iPhone og iPad står Inter i stedet for SF Pro, fordi SF Pro ikke finnes utenfor Apple-enheter. På Mac og iOS viser `.dc.html` ekte systemskrift. Glass er etterlignet.

## Besluttet

- Palett furu. Aksent lys #068472, mørk #54B9A5. Grunnpaletten i lys, mørk, økt kontrast og P3.
- Ferdig-status på hue 140.
- Skrift: Schibsted Grotesk i CRM, admin og på nett. SF Pro (system) på iOS.
- Modus: CRM, admin, nettsider og kundeportal er bare lyse. Bare appene har mørk modus.
- iOS-appen (Hengsel 2.0, SwiftUI) bruker Liquid Glass og systemkomponenter med Hengsel-tokens.
- Nytt merke med smalere høyre blad. Stiften i furu på Hengsel-merket, produktfarge på produktmerkene.
- **Logoer i CRM (14.10):** Hengsel-logoen med versjon står nederst til venstre. Kundens logo står øverst til høyre, maks 28 px høy. Ingen andre kundefarger.
- Kundetemaet Sigdal for sluttkunden er ikke endret.

## Foreslått

- **K-206 (a):** `--ramme` #CBCFD4 / #3D4248, `--overlegg`, `--alltid-mork`, `--paa-alltid-mork`.
- **K-206 (b):** mørk `tekst-svak` #90969D (ligger utkommentert).
- **Lag a, PC:** side #ECEFF3, kort #FFFFFF med ramme #CDD1D6 og svak skygge, sidemeny 248 px, grunnskrift 15 px, rad 44 px, tetthet tett/normal/luftig, maks bredde 1440 px.
- **Lag b, under 1024 px:** skuff, bunnfaner + «Mer» under 768 px, grunnskrift 16 px, trykkflater 44 px, rader 56 px.
- **Lag c, iPhone/iPad:** systemflater, `tekstDempet`, `aksentTekst`, `sidefeltValgt`.
- **Lag d, montørappen:** som c uten glass. Kant i mørk #767B82.
- **Ikonsettet** (49 ikoner) og SF Symbol-koblingen.
- **Monokrome produktlogoer:** hvit og blekk for CRM, Ute, Admin og Levering er laget ved å fargelegge lys-utgaven i én farge.
- **Favicon:** merket på hvit bakgrunn for apple-touch og manifest.
- Layout og nye funksjoner i skjermene (kalender, montasjeplan, kundemøte på iPad, prosjekt med leiligheter).

## Venter på Eirik

1. **K-206 (a):** bekreft ramme, overlegg og alltid-mork. Grunnen bruker #CBCFD4 og PC-laget #CDD1D6. Én verdi bør gjelde.
2. **K-206 (b):** bekreft mørk `tekst-svak` #90969D (i dag 3,98:1 på flate-valgt).
3. **Mørk kant på flate-valgt:** grunnens `kant` #6A6F76 har 2,70:1 på #13332D, for eksempel en avkrysningsboks i en valgt rad. Forslag #767B82 (3,20:1). Grunnpaletten er besluttet, så den er ikke endret.
4. **Plattformlag a og b:** godkjenn verdiene, eller si hva som skal justeres.
5. **Sidemenyen:** 25 punkter i dagens rekkefølge, uten grupper. På skjermer lavere enn ca. 950 px må menyen rulles. Skal den grupperes?
6. **Oversikt og Min dag:** oversikten ligger under «Min dag». Er «Oversikt» et eget menypunkt?
7. **Bunnfaner på mobil:** foreslått Min dag, Kunder, Ordre og Saker + «Mer».
8. **Nettbrett i nettleser (768–1023 px):** skuff (levert) eller smal ikonstripe?
9. **Sekundærtekst på iOS:** Hengsel `tekstDempet` (7,41:1) i stedet for systemets `secondaryLabel` (3,44:1). Godta avviket fra systemet?
10. **Tint på iOS:** `aksentTekst` på tekstknapper på grå flate (levert), eller `aksentTekst` som global tint?
11. **Valgt rad i iPad-sidefelt, mørk:** #163F37 i stedet for systemets fylte aksent.
12. **Ikonbetydning:** Salgsbanken, Leder, Etterkalkyler, Forskudd til leverandør og Unoterte til leverandør bygger på antatt betydning.
13. **Egne SF-symboler:** Forskudd til leverandør og Unoterte til leverandør. Lage egne, eller bruke `banknote` og `doc.badge.ellipsis`?
14. **Versjonsnummer ved Hengsel-logoen:** format (vist som «2.0.0»), og hvor det hentes fra.
15. **Kundens logo:** filformat, hvem laster opp, og hva som skjer med brede eller høye logoer innenfor 28 px.
16. **Tetthet:** lagres per bruker, eller per tabell?
17. **Montørappen:** bare iPhone, eller også Android?
18. **Monokrome produktlogoer og favicon:** godkjenn, eller send egne utgaver.
