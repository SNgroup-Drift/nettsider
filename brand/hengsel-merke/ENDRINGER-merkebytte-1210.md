# Merkebytte i bilder og illustrasjoner – 12.10.2026

Det gamle Hengsel-merket er byttet med det nye (to blader og en stift), etter `Logo-bruk.dc.html` og `hengsel-merke/README.md`. Merket er ikke tegnet på nytt: alt bruker filene i `hengsel.no/logo/l1/` (= `hengsel-merke/svg/`) og `hengsel-merke/app-ikon/`. Ingen SVG har `<metadata>`, og ingen PNG har caBX-blokk.

## Endret
| Fil | Hva er byttet | Brukes |
|---|---|---|
| `docs/design/hengsel/CrmSkjerm.dc.html` | «by Hengsel» under kundens logo er fjernet. `crm-aksent-lys/-mork` 16 px + «v. 4.2» 11 px står nederst i sidemenyen, under brukeren | CRM-skjermene på hengsel.no (forside, /crm, slik virker det) |
| `docs/design/hengsel/PortalSkjerm.dc.html` | «by Hengsel» under kundens logo er fjernet. `levert-av-aksent-lys/-mork` 14 px står nederst til høyre | Kundeportalen på hengsel.no (/kundeportal, forside) |
| `docs/design/hengsel/Enhet.dc.html` | «by Hengsel» under «Din logo» i toppfeltet er fjernet (begge plassene) | Alle telefon-, iPad- og PC-rammer, også på /apptest |
| `docs/design/hengsel/A4Side.dc.html` | «by Hengsel» i bunnlinja er byttet med `hengsel-lys.svg` 3 mm (11 px) | Dokumentmalene på /dokumenter |

## Nytt
| Fil | Innhold | Brukes |
|---|---|---|
| `hengsel-merke/og/og-hengsel-no-1200x630.png` | `hengsel-aksent-lys` midtstilt på Off White | `og:image` på hengsel.no |
| `hengsel-merke/og/og-vis-hengsel-no-1200x630.png` | samme | `og:image` på vis.hengsel.no |
| `hengsel-merke/og/og-apptest-1200x630.png` | samme | `og:image` på hengsel.no/apptest |
| `hengsel-merke/butikk/app-store/ikon-1024-uten-alfa.png` | Ute-ikonet, 1024, uten alfakanal | App Store Connect, bare hvis `.icon` ikke brukes |
| `hengsel-merke/butikk/app-store/ikon-og-navn-1290x2796.png` | Ikonet og `hengsel-ute-aksent-lys` på Beige 3 | Første eller siste bilde i App Store (6,9″) |
| `hengsel-merke/butikk/play/ikon-512.png` | Ute-ikonet, 512 | Google Play, appikon |
| `hengsel-merke/butikk/play/feature-graphic-1024x500.png` | Ikonet og `hengsel-ute-aksent-lys` på Beige 3 | Google Play, feature graphic |

## Allerede riktig (ikke endret)
- `Meny`, `Bunn`, `Ute`, `Apptest`, `Apptest-passord`, `Logo-bruk` og `Ute-ikon` bruker allerede det nye merket. Det gjelder også ikonet i «Bli tester», QR-kortet og favicon på alle sidene.

## Ikke med
- **Visningsrommet (vis.hengsel.no, D1–D12)** ligger ikke i dette prosjektet. Byttes etter de samme reglene: kundens logo øverst, `hengsel-lys` 3 mm i bunnlinja på dokumentene, `crm-aksent-*` 16 px nederst i sidemenyen på CRM-skjermene.
- **`hengsel.no/img/` og `hengsel.no/ios/`** er skjermbilder fra appene, og tas på nytt når merket er byttet i appene. Bildene som viser «by Hengsel» eller det gamle ikonet: `min-dag`, `kundekortet`, `kundeportalen`, `portal-tilbud`, `crm-*`, `ipad-*` og `ute-*`. Sjekk alle når de tas på nytt.
- **CRM på telefon:** merket står nederst i menyen ≡, som ikke er åpen i skjermene. Det er ikke lagt til.
- `og:image` må legges inn i `<head>` på hver side (`<meta property="og:image" content="/og-….png">`, 1200 × 630).
