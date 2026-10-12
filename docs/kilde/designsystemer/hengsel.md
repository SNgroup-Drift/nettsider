# Hengsel Design System – utdrag for hengsel.no (07.10.2026)

Kilde: Eiriks «Hengsel Design System» i Claude Design (publisert), https://claude.ai/design/p/5a9d09c6-be10-4ae1-a516-a0a32d786c17. Code kan ikke åpne Design-prosjektet. Dette er verdiene fra README-en der. Finnes `docs/design/hengsel/` (eksport av prosjektet), er den fasit, og denne fila er bare en oppsummering.

## Farger (bare disse)
- Warm Black #31261D – tekst og titler
- Off White #FBF9F6 – papir/kort (aldri ren hvit)
- Beige 4 #F8F2EC – fliser inne i kort, hover på rader
- Beige 3 #F2E9DB – appflate, seksjonsbånd
- Beige 2 #E4D4C4 – linjer, kortramme
- Beige 1 #C3B5A7 – sand, skapdørene i merket
- Deep Blue #5074A9 – sparsom aksent: primærknapp, lenker, fokus, valgt rad
- Dusty Blue #9CA9BD – aksent i mørk modus
- Status bare i piller og varsler, alltid med tekst: ok #3F7A52, varsel #8A5D14, feil #8E3522
- Mørk modus: app #1B1713, kort #26201A, tekst #F1E9DE, aksent Dusty Blue
- Aldri ren hvit, rosa/magenta eller lilla. Ingen gradienter, mønstre eller teksturer.

## Typografi
- Titler og store tall: Reckless Neue Regular 400 (reserve Newsreader 400, så Georgia). Serif aldri under 1,45 rem og aldri bare versaler.
- Tekst, knapper, etiketter: TWK Lausanne 350 (reserve Inter 400). Underoverskrifter Lausanne 650 (Inter 600), aldri på store overskrifter.
- Brødtekst 17 px / 1,6, maks 62 tegn. Positiv sperring 0,06 em bare på eyebrow (versaler). Tabular-nums i tall.
- LISENS: Reckless og TWK Lausanne er kjøpte skrifter. Til weblisensen er bekreftet, bruker nettsiden reserveskriftene Newsreader og Inter (selvhostet via @fontsource).

## Form
- Kort: Off White på Beige 3, 1 px Beige 2-ramme, radius 14, luft 20/22 px. Svevekort: ingen ramme, myk varm skygge. Ikke kort på kort.
- Radier: 8, 10 (felt, fliser), 14 (kort), 20 (store flater), pille (knapper, piller, faner).
- Knapper: pille, minst 44 px. Primær Deep Blue, sekundær omriss Warm Black, mørk Warm Black fylt, ghost.
- Hover: sekundær fylles Warm Black med Off White tekst; primær/mørk 88 % opasitet. Trykk: 1 px ned. Disabled 45 %.
- Fokus: 2 px bakgrunnsring + 2 px Deep Blue-ring. Felt: Deep Blue-kant og 3 px svak blå glorie.
- Animasjon: 160 ms, cubic-bezier(.2,.7,.2,1), bare farge. Ingen blur, ingen parallakse.
- Avstand: 4 px-skala 4 8 12 16 24 32 48 64 96. Innhold maks 1180 px. Seksjonsbånd veksler Off White og Beige 3.
- Ikoner: linjeikoner 1,5 px (Lucide-stil), alltid med tekst. På nettsiden: inline SVG, ikke CDN.

## Logo (merket byttet 12.10.2026, K-174)
- Merket (fasit 12.10.2026): merkepakken ligger i `brand/` (`svg/`, `favicon/`, `pwa/`, `app-ikon/`), med regler og plasseringer i README-en der. All tekst i SVG-ene er konturert. Det gamle H-merket (v2) er byttet ut.
- Regler: kunden først, Hengsel nederst og lite; aldri strekk, roter, skygge, glød, kontur eller andre farger. Se README-en i `brand/` (punkt 3–5) for hele settet.

## Tekst
- Norsk bokmål. Nettsiden snakker til butikken med «dere» og om seg selv med «vi».
- Setningsstil. Midtprikk « · » i metalinjer. Norsk tallformat. Ingen emoji.
- Bare oppdiktede navn og nøytrale butikker i skjermbilder. Merk demoskjermer «Demo – ingen ekte kunder».
