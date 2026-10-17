Flis (kort) etter layout-reglene. Én ting per flis. Ikke fliser i fliser.
```jsx
<Flis klasse="tall" bredde="1/4" etikett="Trenger deg" tall="4" under="2 haster" />
<Flis klasse="kortliste" bredde="1/3" tittel="Kontrollmål som skal planlegges" tall="4" handling={<Knapp variant="tekst">Vis alle (4)</Knapp>}>…maks 5 rader…</Flis>
```
- Skrift: tittel 16/600, innhold 14, undertekst 12, tall 32/400. Luft 24 (16 på telefon).
- Status (120 px): pillen og setningen står på samme linje; setningen kuttes med … og vises hel i tooltip.
- Tavle (1/1, 480 px): 2–6 like brede kolonner, kolonnenavn 14/600 med antall, maks 5 kort à 44 px (14 px, én linje, kuttes med …), så «Vis alle (n)». Telefon: én kolonne, velger over.
- Uke (1/1, 480 px): 5 eller 7 dager som kolonner, dag og dato 14/600, maks 5 avtaler à 44 px med klokkeslett først (07.30), så «+n». Telefon: én dag, dagvelger over.
- Plan (1/1, høyden følger radene): navnekolonne 200 px + 8 uker, rader 44 px, stolpe 24 px, maks 10 rader, så «Vis alle (n)».
- Tegning (1/1, 480 px): bildeflaten fyller flisen, én linje 14 under (kuttes). Nål og kommentar har punktnummeret (14-3).
```jsx
<Flis klasse="tavle" bredde="1/1" tittel="Salgstavle" tall="9">…kolonner…</Flis>
<Flis klasse="tegning" bredde="1/1" tittel="Plan og oppriss">…bilde…</Flis>
```
- Høyder (2d, 17.10): bare 120, 320, 480 eller 640 px (`--rad-1`–`--rad-4`). Hele raden får høyden til den høyeste flisen. Tittelfelt 40, handlingsfelt 48, listerad 40, tabellrad 44. Mer innhold → neste trinn, «Vis alle» eller sidevelger.
