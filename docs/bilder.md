# Skjermbilder og Apple-rammer på hengsel.no

Kilde: pakken «CRM_v4» (10.10.2026, INSTRUKS.md: «Skjermbilder i Apple-rammer»). Rammene er Apples Product Bezels med
gjennomsiktig skjermhull (`public/img/ramme-*.webp`); skjermbildet ligger under rammen og klippes med skjermens hjørner
(`src/components/Enhet.astro`). Rammen er ikke beskåret, vippet eller speilvendt, og har ingen skygge. Skjermbildene er
WebP (kvalitet 82) laget av PNG-ene i pakken, uten endringer i oppløsning.

## Hvor hvert bilde brukes

| Sted | Ramme | Bilde |
|---|---|---|
| Hero | Studio Display + iPhone 18 | `crm-tilbud` + `ute-i-dag` |
| Sju steg 1 Befaring / 5 Montering / 6 Punkter og saker | iPhone 18 | `ute-laser` / `ute-ks` / `ute-punkter` |
| Sju steg 2 Tilbud / 3 Ordre og bestilling / 4 Levering | Studio Display | `crm-tilbud` / `crm-bestilling` / `crm-ordre-kontrollmal` |
| Sju steg 7 Ferdig og faktura | iPhone 18 | `ute-ferdig` (gammelt, se «Mangler») |
| Hengsel Ute, åtte grep | iPhone 18 | `ute-i-dag`, `ute-laser`, `ute-jobb-under`, `ute-ks`, `ute-typeskilt` (gammelt), `ute-avvik`, `ute-punkter` + `ute-punktkort`, `ute-ferdig` (gammelt) |
| Merking på iPad | iPad liggende | `ute-ipad-bildeverktoy` |
| For kontoret (fire faner) | Studio Display | `crm-resultater` (Ledertavle), `crm-montasje`, `crm-bestilling`, `crm-etterkalkyle` |
| Kundeportalen | MacBook | `kundeportalen-pc` (gammelt, se «Mangler») |
| /apptest | iPhone 18 ×3 | `ute-i-dag`, `ute-ks`, `ute-laser` |

## Retusjering

`crm-tilbud.webp` er retusjert: to sorte klikkmerker fra prototypen («Klikk .2» over chippen «Forventet ordre» og «Klikk T02» i
første rad) er fjernet ved å fylle med bakgrunnsfargen, og kanten på chippen er gjenopprettet. Ingen andre piksler er endret.
Originalen ligger i pakken (`studio-display/crm-tilbud.png`). Bytt til en ren eksport når den finnes.

## Mangler i pakken (gamle bilder står igjen)

- `ute-ferdig`, `ute-typeskilt` (iPhone): gamle bilder (780 × 1512) vises hele i iPhone-rammen, med skjermens bakgrunn over og under.
- `kundeportalen-pc` (PC): det gamle bildet (Hengsel, «Butikknavn Hamar») står i MacBook-rammen. `portal-mitt-kjokken` i pakken har
  «sigdal | Studio Sigdal» i toppen, og `kundeportal-k03` har «Studio Sigdal Hamar» i bunnen; `kundeportal-k06` og `k08` er tomme.

## Valg

- iPad-bildene i pakken er 4:3 (2732 × 2048), skjermhullet i rammen er 1,44:1. Bildet vises hele (contain) i stedet for å beskjære
  de nederste 7 % (verktøylinja i `ute-ipad-bildeverktoy`). Det gir smale kanter på sidene i skjermens bakgrunnsfarge.
- Hero: telefonen står foran skjermens nedre høyre hjørne i 18 % av skjermens bredde (22 % under 700 px), omtrent 1,6 ganger så stor
  som i virkeligheten, så Ute-skjermen kan leses. Endres i `.hero-telefon` i `src/pages/index.astro`.
- Passer et bilde ikke formatet i hullet (mer enn 3 %), vises det hele (contain); ellers fyller det hullet fra toppen (cover).
- Navnene i pakken stemmer ikke alltid med innholdet: `crm-resultater` og `crm-salgstavla` er begge Leder-sider (Oversikt og Salg),
  `crm-saker` er «Belastninger til montasjefirma», `crm-montasje` er Mer › Montasje (kontrollmål), `crm-leder-start` er Innstillinger.
  Alt-tekstene i `src/content/forside.ts` beskriver det bildene faktisk viser.
- Ikke brukt (feil i bildene): `crm-leder-oversikt` (designmerkelappene «T3 · B4.1», «PC 1440», «Lys» øverst), `crm-mal-skisser`
  (Sigdal-logo), fire av iPad-bildene (`crm-ipad-belastninger`, `-innstillinger`, `-kontrollmal`, `-leder`; Sigdal-logo), `crm-tilbud-kunde` (klikkmerke).

## Sjekk

`npm test` (lenker, 25 bilder i `img/` svarer 200) og `node scripts/skjermbilder.mjs` (steg 2 og fane 2 viser de nye bildene,
lysboksen åpner i full størrelse, ingen eksterne forespørsler, ingen informasjonskapsler).
