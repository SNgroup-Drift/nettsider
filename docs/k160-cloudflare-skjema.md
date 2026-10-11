# K-160: Cloudflare for demoskjemaet (hengsel.no/priser-og-demo)

Skjemaet «Be om demo» sender e-post til **hei@hengsel.no** fra **demo@hengsel.no** med en Cloudflare-binding (`send_email`).
Bindingen står allerede i `sites/hengsel/wrangler.jsonc` (`DEMO_EPOST`), så koden trenger ingen endring. Det som gjenstår er tre
ting i Cloudflare-dashbordet, på samme konto som hengsel.no. Ingen nøkler eller hemmeligheter skal inn noe sted.

## Trinn for trinn

1. **Slå på Email Routing for hengsel.no.** Logg inn på dash.cloudflare.com og velg kontoen. Gå til **Compute › Email Service ›
   Email Routing**, velg domenet `hengsel.no` og slå det på (Enable / Onboard domain). Cloudflare foreslår DNS-poster (MX og SPF)
   og legger dem inn for deg; godta. Sonen må bruke Cloudflare DNS (det gjør hengsel.no).
   - Har hengsel.no allerede e-post hos en annen leverandør? Email Routing bytter MX-postene. Sjekk dagens MX under DNS før du slår
     det på, og si fra hvis det står noe der, så går vi gjennom det først.
2. **Verifiser hei@hengsel.no som destinasjon.** Under **Email Routing › Destination addresses**, legg inn `hei@hengsel.no` (eller
   den ekte postkassen som tar imot post til den adressen) og send. Cloudflare sender en e-post med knappen **Verify email
   address**; åpne den og trykk. Adressen skal stå som *Verified*. Bindingen kan bare sende til verifiserte destinasjoner, og
   `destination_address` i `wrangler.jsonc` låser den til nettopp denne adressen.
3. **La avsenderen demo@hengsel.no brukes.** Avsenderadressen må ligge på et domene i kontoen der Email Routing / Email Service er
   slått på (trinn 1 dekker `@hengsel.no`). `demo@hengsel.no` trenger ikke å finnes som postkasse og trenger ingen routing-regel.
   Viser dashbordet også **Email Sending** (Email Service): velg **Onboard Domain**, hengsel.no, og godta postene som legges inn
   (underdomenet `cf-bounce` med MX, SPF, DKIM og DMARC). Det gir best levering, og er påkrevd hvis Cloudflare avviser sendingen uten.
4. **Publiser nettstedet** som vanlig. `send_email`-bindingen følger med fra `wrangler.jsonc`; det er ingenting å legge inn under
   Settings › Bindings for hånd.

## Slik tester du

1. Åpne https://hengsel.no/priser-og-demo, fyll inn navn og en e-postadresse du har tilgang til, og trykk **Send forespørsel**.
   Det kan ta noen sekunder (skjemaet venter ut robotsperren på 3 sekunder).
2. Du skal få **«Takk, <fornavn>.»**, og det skal komme en e-post til hei@hengsel.no med emnet «Demo av Hengsel – <butikk>» og
   innholdet fra skjemaet. Trykk **Svar**: svaret skal gå til adressen du skrev inn (`Reply-To`).
3. Kommer den ikke: sjekk søppelpost, og under **Compute › Email Service** at domenet er aktivt og destinasjonen verifisert.
   Feilkoder fra sendingen havner i Workers-loggen (`npx wrangler tail -c sites/hengsel/wrangler.jsonc`). Loggen inneholder aldri
   navn, e-post eller tekst fra skjemaet, bare en feilkode.
4. Kontroll uten nettleser (`t` må være minst 3 sekunder gammelt):
   ```sh
   curl -s -X POST https://hengsel.no/api/demo -H 'Content-Type: application/json' -H 'Origin: https://hengsel.no' \
     -d "{\"navn\":\"Test\",\"epost\":\"deg@eksempel.no\",\"avdelinger\":\"1\",\"t\":\"$(( $(date +%s%3N) - 10000 ))\"}"
   ```
   `{"ok":true}` betyr at e-posten er levert til Cloudflare. `{"ok":false,"reserve":"mailto"}` (status 503) betyr at noe i oppsettet
   over mangler.

## Hva skjer hvis det ikke er slått på

Ingenting går tapt, og siden ser ikke ødelagt ut. Når Cloudflare ikke kan sende (Email Routing av, avsender ikke på sonen,
destinasjon ikke verifisert, bindingen mangler), svarer `/api/demo` med 503, og siden viser **«Forespørselen ble ikke sendt.»** med
knappen **«Send den som e-post i stedet»** (`mailto:hei@hengsel.no` med emne og alt besøkende skrev, ferdig utfylt) og «Du kan også
ringe +47 454 10 001.». Samme reserve vises hvis nettleseren ikke når Workeren. Uten JavaScript er knappen deaktivert og siden viser
e-postlenken. Forespørslene kommer da bare inn hvis besøkende selv sender e-posten, så slå på trinn 1 til 3 før lansering.

## Kilder

Cloudflare Email Service: *Send bindings* (`destination_address` begrenser bindingen til én adresse; avsender må tilhøre et domene i
kontoen), *Email Routing addresses* (verifisering av destinasjoner; sending til verifiserte adresser er gratis og teller ikke mot
kvote), *Workers API* (legacy `EmailMessage` med rå MIME).
