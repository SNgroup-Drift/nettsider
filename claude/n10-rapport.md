# N-10 · MacBook som fjerde enhetsramme på hengsel.no

Dagøkt 18.10.2026 (Eirik, kl. 21.55). Gren `claude/n10-macbook-7n58k0` (økta fikk dette grennavnet), PR mot main. N-9-grenen (`claude/n9-produktlogoer`) fantes ikke da PR ble laget, så ingen fletting.

## Hvor bezelen kom fra
`sites/hengsel/public/img/ramme-macbook.webp` er Apples MacBook-bezel som lå på siden til K-177 (12.10), hentet fra git-historikken med
`git show f00dfaa^:sites/hengsel/public/img/ramme-macbook.webp` (siste commit før K-177 fjernet den). 2400 × 1565, gjennomsiktig skjermhull. Ingen ramme er tegnet på nytt.
Bezelen er ikke et app-skjermbilde. Rammen er verken beskåret, vippet, speilvendt eller gitt skygge.

Skjermhullet er målt i alfakanalen: 12,63 % · 14,19 % · 74,75 % × 71,63 % av rammen = 1794 × 1121 px (1,600, altså 16:10). Det stemmer med tallene i `sites/vis/src/assets/enhet.css`.

## Gjort
1. **`Enhet.astro` `type="macbook"`**: bezel, hull i prosent, hjørneradius 1 % / 1,4 %, naturlig størrelse 1440 × 900 (skalert av `scripts/skala.ts` som de andre), ingen statuslinje og ingen «Din logo». `bilde=`/`src=` (cover, topp) og `<slot>` virker. `CrmSkjerm` har ny `mac`-prop (1440 × 900); `PortalSkjerm` fyller høyden selv. `Simulering` og `Simuleringsflis` kjenner `macbook`.
2. **Forsiden, «Samme ordre på alle enheter»**: `TreEnheter` har fire enheter (Studio Display, MacBook, iPad, iPhone) i takt, med samme tre steg (Min dag → Ordre → Kontrollmål). Teksten på flisa: «Kontoret på Studio Display, butikklederen på MacBook, butikken på iPad og selgeren på iPhone ser den samme ordren.» På 390 stables de (under 640 px): display, MacBook, iPad, iPhone. `content/simuleringer.ts` har `TRE_ENHETER.macbook`. Samme komponent brukes i Sigdal-utgaven av «slik virker det».
3. **/crm**: toppen har Studio Display (Min dag) med MacBook (Montasjeplan) foran nede til venstre. Siden viser dermed alle fire (display og MacBook i toppen, iPad og iPhone i «Se Hengsel CRM i bruk»).
4. **/kundeportal**: toppen er portalen på MacBook (PortalSkjerm) med iPhone foran. `/telefon` og `/ute` er urørt.
5. **Enhetsvakten** (`scripts/enhetsrammer.test.mjs`): andel, naturlig størrelse, ingen statuslinje, at bezelen har alfa og er 2400 × 1565 med 16:10-hull, og at forsiden, /crm og /kundeportal bruker macbook (kilde og bygg; /crm har alle fire; /telefon og /ute har ingen).
6. **`docs/bilder.md`**: «ikke i bruk på siden nå» og tabellen «Hvor hvert bilde brukes» er oppdatert.

## Valg jeg tok
- Biblioteket har ingen `pc/`-nøkler i manifestet. MacBook bruker derfor de samme 16:9-bildene som Studio Display (`crm-min-dag`, `crm-ordre-kontrollmal`, `crm-montasje`) med `object-fit: cover; object-position: top`. Nederste del (ca. 10 %) beskjæres. Når `pc/`-bilder kommer i biblioteket, byttes stiene i `TRE_ENHETER.macbook`.
- Grennavnet er `claude/n10-macbook-7n58k0`, ikke `claude/n10-macbook`; økta er satt opp slik.
- `INSTRUKS.md` ligger ikke i repoet (finnes bare i historikken). Skjermhullet står i `Enhet.astro` og `docs/bilder.md`.
- /crm bruker «Montasje» på MacBook, ikke «Ordre»: Ordre-skjermen har teksten «Hengsel fant 1 avvik mot ordren», som `kundetema.test.mjs` (UTGATT_N3) gjør rødt i Sigdal-utgaven.
- `scripts/kundetema.test.mjs` fikk MacBook-bezelen ved siden av Studio Display-bezelen som tillatt fil fra `/img` i kundeutgaven (ellers rødt).
- `/kundeportal`-flisen «Se kundeportalen i bruk» beholder Studio Display for dokumentene; MacBook står i toppen.

## Kontroll
- `npm ci`, `npm run build`: alle sider bygger.
- `npm test`: 247 grønne, 1 hoppet over (var skipped fra før), 0 røde (inkl. `sjekk-lenker`).
- `node scripts/skjermbilder-n10.mjs` (1440 og 390): ingen vannrett rulling, ingen `style=`-attributter utenom skaleringen, ingen konsollfeil, MacBook-hull 1,6, bezel til stede, ingen statuslinje. Skjermbilder i `claude/n10-skjermbilder/`: `forside-fire-enheter-{1440,390}.png`, `crm-topp-{1440,390}.png`, `kundeportal-topp-{1440,390}.png`. Bilder.hengsel.no nås ikke fra sandkassen, så bibliotekrammene (flisa på forsiden) viser alt-teksten i stedet for skjermbildet; de tegnede skjermene på /crm og /kundeportal vises fullt ut. Se flisa med ekte bilder i forhåndsvisningen etter fletting.
- HawkScan hoppet over (som avtalt).
- Ingen ny pin av designsystemet, ingen farger endret, ingen hex i sidene, ingen app-skjermbilder i repoet, ingen nøkler.

N-10 KLAR
