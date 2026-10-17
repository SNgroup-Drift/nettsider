/** N-5: mønstersidene på design.hengsel.no (/monstre), i sidekartets rekkefølge (S-68, 29-001–29-006). Fasit: docs/sidekart/29-00n.md i hengsel-crm. */
export const MONSTRE = [
  { nr: "29-001", sti: "tilstander", tittel: "Tom-, laste- og feiltilstander", kort: "Tilstander", undertekst: "Samme fire tilstander på alle flater. Teksten sier hva som skjedde og hva du kan gjøre." },
  { nr: "29-002", sti: "dialoger", tittel: "Dialoger og skuffer", kort: "Dialoger", undertekst: "Dialog for korte skjema og bekreftelser, skuff for detaljer ved siden av lista, ark for valg på telefon." },
  { nr: "29-003", sti: "tabell", tittel: "Tabell", kort: "Tabell", undertekst: "Verktøylinje øverst, overskrift 36 px, rader 44 px, sidevelger nederst. Tall og beløp høyrejustert med tabulære tall. Status som pille i siste kolonne." },
  { nr: "29-004", sti: "flisklasser", tittel: "Flisklasser (alle)", kort: "Flisklasser", undertekst: "Alle flisklassene fra regel 2c og radhøydene fra 2d: 120, 320, 480 og 640 px." },
  { nr: "29-005", sti: "ikoner-og-piller", tittel: "Ikoner og piller", kort: "Ikoner og piller", undertekst: "Statuspillen har sju nøkler og tegnes med tokens. Ikonene er 20 px med strek 1,6 (18 px i menyen, 16 px i knapper)." },
  { nr: "29-006", sti: "tall", tittel: "Datoer, beløp og tall", kort: "Datoer og tall", undertekst: "Norsk skrivemåte overalt. Tall, datoer og beløp i tabeller er høyrejustert med tabulære tall, så sifrene står under hverandre." },
] as const;
export type Monster = (typeof MONSTRE)[number];
export const monster = (sti: Monster["sti"]) => MONSTRE.find((m) => m.sti === sti)!;
