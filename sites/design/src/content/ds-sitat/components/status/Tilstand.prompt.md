Tom, laster, feil og ingen tilgang. Brukes på Min dag, ordresiden og montasjeplanen.
```jsx
<Tilstand type="tom" tittel="Ingenting venter på deg i Hamar" tekst="Nye leads og ordre som venter på deg kommer hit." knapp="Ny kunde" />
<Tilstand type="laster" tekst="Henter Min dag for Hamar …" />
<Tilstand type="feil" tittel="Fikk ikke hentet Min dag" knapp="Prøv igjen" kode="Feilkode MD-503" />
<Tilstand type="ingen" tittel="Du har ikke tilgang til Lillehammer" knapp="Bytt til Hamar" />
```
- Si hva som skjedde og hva brukeren kan gjøre. Si at lagrede data ikke er borte når det stemmer.
- Hengsel Ute på iOS bruker systemets ContentUnavailableView med SF Symbol i stedet (avvik A7).
