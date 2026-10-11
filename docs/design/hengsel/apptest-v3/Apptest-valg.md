# hengsel.no/apptest – valg

Filer: `Apptest.dc.html` (siden), `Apptest-passord.dc.html` (passordsiden). Se alle tilstandene i `Oversikt.dc.html` under /apptest: telefon 390 først, så PC 1440, lys og mørk, med knappene iPhone, Android (Play), Android uten Play og Ingen kjente feil.

## Tilstander (adresse eller Tweaks)
- `?tema=lys|mork`. Uten parameter følger siden systemvalget.
- `?enhet=iphone|android|apk|pc`. Uten parameter: iPhone/iPad fra userAgent (iPad som «Macintosh» med berøring), Android → Google Play, ellers PC. Under 760 px vises telefonvisningen også på PC.
- `?feil=tom` gir «Ingen kjente feil akkurat nå».
- Passordsiden: `?feil=1` viser feilmeldingen.

## Valg
- Flatene er Beige 4 med bånd i Beige 3, og kortene er Off White. Deep Blue brukes bare på hovedknappene og lenkene. Stegnummer, avkrysning, prikker og tidslinjen er i Warm Black.
- Siden har ingen hovedmeny, bare logo og «Meld feil» øverst, siden den ikke skal lenkes fra menyen. Bunnen er felles `Bunn`.
- Bildene i heroen glir over i hverandre på 0,7 s hvert 4. sekund. Ved prefers-reduced-motion står bildet stille, og prikkene virker fortsatt.
- App-ikonet er `hengsel.no/logo/hengsel-app-ikon-lys.svg` på en Beige 3-flis, med «Hengsel» under, og er likt i lys og mørk modus.
- Installer: telefonen viser én vei med tre steg og en stor knapp. «Andre telefoner» viser de to andre veiene med omriss-knapp. PC viser QR-koden og alle tre veiene i fire kort.
- Roller: chips øverst og ett kort med punkter, demobruker og telefon. Det er en «Kopier»-knapp for både brukernavn og passord. Passordet står i `<span data-demopassord="{rolle}">`, og serveren fyller inn verdien.
- Sjekklisten har 8 punkter. Den lagres i localStorage under `hengsel-apptest-sjekk-{versjon}`, så hver ny versjon starter tom. I designet er 4 av 8 krysset av når ingenting er lagret. Code skal starte på 0.
- Tidslinjen og spørsmål og svar bruker `<details>`, så de virker uten skript. Uten skript skal installer-delen vise alle tre veiene.
- Svarene i spørsmål og svar er skrevet av meg på 1–2 setninger. Sjekk at «90 dager» (TestFlight) og «Meg › Logg ut» stemmer.

## Må fylles inn av Code eller deg
- Lenkene `#testflight`, `#play`, `#apk` og `#demobrukere.pdf`.
- Versjon og dato (nå 0.9.3 (48) · 11. oktober 2026), byggene i tidslinjen og kjente feil. Innholdet nå er eksempel, hentet fra funksjonene i iOS-tekstene. De to kjente feilene er oppdiktet.
- Demobrukerne (nå `montor@`, `firmaleder@`, `utkjorer@` og `lager@demo.hengsel.no`). Utkjøreren logger inn med engangskode i appen. Si fra om demobrukeren skal ha passord.
- Skjermbilder: montør bruker «Meld avvik». Firmaleder (Forespørsler), utkjører (Rute for dagen) og lager (Mottak) har plassholder i rammen, fordi det ikke finnes skjermbilder av dem.
- QR-koden i designet er en plassholder. Den ekte lages ved bygging som SVG.
- E-post for feil og passord: hei@hengsel.no, som på resten av nettstedet.
