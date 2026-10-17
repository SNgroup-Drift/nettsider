// Kundeportalen på hengsel.no 2.0. Fasit: docs/design/hengsel/Kundeportal.dc.html og PortalSkjerm.dc.html.
// Tekst ordrett fra LES-MEG.md («/kundeportal» og «Felles: kundeportalen på telefon og PC»). Alt er oppdiktet demoinnhold.

export type Steg = "tilbud" | "tilvalg" | "levering" | "montering" | "fdv";

/** Siden: fast tekst */
export const SIDE = {
  tittel: "Kundeportalen – Hengsel",
  beskrivelse: "Fra tilbudet til FDV-permen, på telefonen eller PC-en. Kunden får en SMS når noe er nytt, og svarer i portalen i stedet for på e-post og telefon.",
  eyebrow: "Kundeportalen",
  h1: "Kunden følger med selv.",
  lede: "Fra tilbudet til FDV-permen, på telefonen eller PC-en. Kunden får en SMS når noe er nytt, og svarer i portalen i stedet for på e-post og telefon.",
};

/** Stegene: fanenavn, beskrivelse (telefonvisning og tekst under PC-skjermen) og SMS-en som glir inn */
export const STEG: { id: Steg; t: string; s: string; sms: string }[] = [
  { id: "tilbud", t: "Tilbud og aksept", s: "Tegning, pris og betalingsplan. Kunden aksepterer og signerer med BankID.", sms: "Hei Kari. Tilbudet på kjøkkenet er klart. Du finner det i kundeportalen." },
  { id: "tilvalg", t: "Tilvalg", s: "Oppgraderinger med pris, frem til endringsfristen.", sms: "Endringsfrist fredag 16. oktober. Velg tilvalg i kundeportalen før fristen." },
  { id: "levering", t: "Levering", s: "Leveringsdag, tidsrom og hva som må være klart.", sms: "Kjøkkenet leveres tirsdag 17. november mellom 07.00 og 09.00." },
  { id: "montering", t: "Montering", s: "Hvem som monterer, hvor langt de har kommet, og punktene.", sms: "Montør En er på vei og er fremme ca. 07.30." },
  { id: "fdv", t: "FDV", s: "Dokumenter, garantier og ferdigmelding etter montering.", sms: "Kjøkkenet er ferdig montert. FDV og garantier ligger i kundeportalen." },
];

/** «På samme ordre» */
export const SELGER = {
  eyebrow: "På samme ordre",
  h2: "Det kunden gjør, ser selgeren med en gang.",
  kort: [
    { t: "Melding", s: "Spørsmål fra kunden kommer inn i Min dag og på kundekortet." },
    { t: "Aksept og signatur", s: "Tilbudet blir ordre når kunden signerer i kundeportalen." },
    { t: "Tilvalg", s: "Valgene oppdaterer ordren og prisen før endringsfristen." },
    { t: "Punkter", s: "Samme nummer i CRM, Hengsel Ute og kundeportalen." },
  ],
};
