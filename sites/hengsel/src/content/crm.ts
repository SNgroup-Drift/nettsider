// CRM-skjermene i demoen (CrmSkjerm.astro) og teksten på /crm. Fasit: docs/design/hengsel-no-2.0 (CrmSkjerm.dc.html, CRM.dc.html), ordrett fra LES-MEG.md.
// Alle navn og tall er oppdiktet demodata (Butikknavn, Kari Nordmann, Leverandør A).

export type Skjerm = "minDag" | "ordre" | "tilbud" | "montasje";
export type CrmEnhet = "pc" | "ipad" | "telefon";
export type Tone = "info" | "bad" | "warn" | "ok" | "neutral";

/** Naturlig størrelse på skjermen per enhet (bredde, høyde). iPad er 24 px lavere enn rammen: Enhet flytter den ned under statuslinja. */
export const CRM_MAAL: Record<CrmEnhet, [number, number]> = { pc: [1440, 810], ipad: [1180, 796], telefon: [402, 874] };

export const CRM_MENY: [string, string][] = [["Min dag", "7"], ["Samtaler", "3"], ["Salgstavle", ""], ["Kunder", ""], ["Tilbud", ""], ["Ordre", ""], ["Saker", "1"], ["Montasje", ""], ["Resultater", ""]];
export const CRM_AKTIV_MENY: Record<Skjerm, string> = { minDag: "Min dag", ordre: "Ordre", tilbud: "Tilbud", montasje: "Montasje" };
export const CRM_BRUKER = ["Kristine B.", "Selger · Butikknavn"] as const;

export const MINDAG_META = { pc: "mandag 12. oktober · uke 42 · Butikknavn · 6 ting venter på deg", telefon: "mandag 12. oktober · 6 ting venter" };
/** tittel, undertekst, pille, tone, haster (raden som åpner ordren) */
export const MINDAG_RADER: [string, string, string, Tone, boolean][] = [
  ["Kari skrev i kundeportalen", "Tilbud v3 · «Kan oppvaskmaskinen flyttes nærmere vasken?» · 07.42", "Melding", "info", false],
  ["Kontroller OB – avvik på benkeplate", "Ordre O-2417 · Leverandør A · 20 mm i stedet for 30 mm", "Avvik", "bad", true],
  ["Ring Kari – tilbudet åpnet 3 ganger", "Tilbud HA-T-2231 v3 · 257 700 kr · 6 dager i fasen", "Oppfølging", "warn", false],
  ["Møte kl. 14.00 · befaring hos Ola", "Eksempelveien 4 · kjøkken", "Møte", "neutral", false],
  ["Bekreft endringsfrist", "Ordre O-2417 · fredag 16. oktober", "Frist", "warn", false],
  ["Sak R-2026-0163 venter på svar", "Kari Nordmann · servicenummer mangler · 3 dager", "Sak", "neutral", false],
];
export const MINDAG_AVVIK = {
  tittel: "Kontroller OB – avvik på benkeplate", pille: "Avvik", under: "Ordre O-2417 · Kari Nordmann · OB mottatt i dag 06.12",
  felt: [["I ordren", "Benkeplate 30 mm"], ["I OB", "Benkeplate 20 mm"], ["Leverandør", "Leverandør A"], ["Levering", "uke 46"]] as [string, string][],
  knapp: "Åpne ordren", eller: "eller trykk på raden",
};
export const MINDAG_TALL: [string, string][] = [["1,31 mill", "av 1,40 mill i oktober · 94 %"], ["35 %", "dekningsgrad · mål 34 %"], ["42 %", "tilbud til ordre"], ["14", "åpne tilbud · 2,1 mill"]];

export const ORDRE = {
  brodsmule: "Kunder › Kari Nordmann › Ordre O-2417", tittel: "Kjøkken – Kari Nordmann", under: "Ordre O-2417 · montering uke 47 · Montasjefirma A",
  avvikTittel: "Avvik i ordrebekreftelsen.", avvikTekst: "Benkeplate 20 mm i OB, 30 mm i ordren · Leverandør A",
  obTittel: "Ordrebekreftelse fra Leverandør A", kolonner: ["Linje", "Ordre", "OB", "Status"],
  linjer: [["Benkeplate", "30 mm", "20 mm", "Avvik", "bad"], ["Skap", "23 stk", "23 stk", "OK", "ok"], ["Hvitevarer", "4 stk", "4 stk", "OK", "ok"], ["Levering", "uke 46", "uke 46", "OK", "ok"]] as [string, string, string, string, Tone][],
  be: "Be om ny OB", godta: "Godta OB", loggTittel: "Siste på ordren",
  logg: [["06.12", "OB mottatt fra Leverandør A"], ["06.12", "Hengsel fant 1 avvik mot ordren"], ["fre.", "Bestilling sendt · 41 linjer"], ["tor.", "Kari signerte kjøpsavtalen"]] as [string, string][],
};

export const TILBUD = {
  brodsmule: "Kunder › Kari Nordmann › Tilbud", tittel: "Kjøkken – Kari Nordmann", under: "HA-T-2231 · versjon 3 · 257 700 kr · gjelder til 15. oktober",
  kort: "Hent fra CET", pille: "Ny tegning", tegning: "Tegning 5971 · R09 · lagret i CET i dag 08.14",
  felt: [["Skap", "23"], ["Artikler", "41"], ["Tegninger", "3 ark"]] as [string, string][],
  endret: "Endret fra versjon 3",
  diff: [["+", "Benkeplate 30 mm (var 20 mm)", "+ 6 200 kr"], ["~", "Overskap 60 cm flyttet til venstre vegg", "0 kr"], ["–", "Sokkel 2 400 mm erstattet av 2 × 1 200 mm", "0 kr"]] as [string, string, string][],
  prisEtikett: "Ny pris inkl. mva", pris: "263 900 kr", importer: "Importer som versjon 4", avbryt: "Avbryt",
};

export const MONTASJE = {
  meta: "Uke 47 · 16.–20. november · 6 monteringer · 1 uten montør", tittel: "Montasjeplan", kolonne: "Firma og montør",
  dager: ["Man 16.", "Tir 17.", "Ons 18.", "Tor 19.", "Fre 20."],
  /** navn, firma, fem dager: [tekst, status, tone] eller null. tone «ny» = fremhevet (beige) */
  rader: [
    ["Montør En", "Montasjefirma A", [null, ["Kari Nordmann · Kjøkken", "Ny · bekreftet", "ny"], ["Kari Nordmann · Kjøkken", "Dag 2", "ny"], ["Ola Nordmann · Bad", "Bekreftet", ""], null]],
    ["Montør To", "Montasjefirma A", [["Per Nordmann · Kjøkken", "Bekreftet", ""], ["Per Nordmann · Kjøkken", "Dag 2", ""], null, ["Lise Nordmann · Garderobe", "Venter svar", "warn"], null]],
    ["Montør Tre", "Montasjefirma B", [["Butikknavn · Utstilling", "Bekreftet", ""], null, ["Nina Nordmann · Kjøkken", "Bekreftet", ""], ["Nina Nordmann · Kjøkken", "Dag 2", ""], null]],
    ["Uten montør", "Venter på firma", [null, null, null, null, ["Tor Nordmann · Kjøkken", "Mangler montør", "bad"]]],
  ] as [string, string, ([string, string, string] | null)[]][],
  liste: [
    ["Kari Nordmann · Kjøkken", "Tir 17. og ons 18. · Montør En", "Ny", "info"],
    ["Per Nordmann · Kjøkken", "Man 16. og tir 17. · Montør To", "Bekreftet", "ok"],
    ["Lise Nordmann · Garderobe", "Tor 19. · Montør To", "Venter svar", "warn"],
    ["Tor Nordmann · Kjøkken", "Fre 20. · uten montør", "Mangler", "bad"],
  ] as [string, string, string, Tone][],
  ok: "Ny OB bekreftet.", okTekst: "Benkeplate 30 mm leveres uke 46 · Kari Nordmann er satt opp tirsdag og onsdag.",
};
export const TELEFON_FANER = ["Min dag", "Kunder", "Ordre", "Mer"];
export const CRM_ALT = "Hengsel CRM";

// ---- /crm ----
export const CRM_SIDE = {
  eyebrow: "Hengsel CRM", h1: "Hele butikken på én skjerm.",
  lede: "Klikk deg gjennom en vanlig morgen: et avvik i ordrebekreftelsen, en ny tegning fra CET og montasjeplanen etterpå.",
  stegAria: "Steg i demoen", enhetAria: "Enhet", neste: "Neste: ", start: "Start på nytt",
  modulerEyebrow: "I CRM", modulerH2: "Samme kundekort for selger, kontor og leder.",
  demo: "Be om demo", reise: "Se hele ordrens reise →",
};
/** nøkkel, fanetekst, bildetekst (fet), bildetekst (under) */
export const CRM_STEG: [Skjerm, string, string, string][] = [
  ["minDag", "Min dag", "Min dag viser det som venter på deg, sortert etter hva som haster.", "Avviket i ordrebekreftelsen ligger øverst. Trykk på raden for å åpne ordren."],
  ["ordre", "Avvik", "Hengsel sammenligner ordrebekreftelsen med ordren, linje for linje.", "Benkeplaten er 20 mm i OB og 30 mm i ordren. Trykk «Be om ny OB»."],
  ["tilbud", "Import fra CET", "Ny tegning fra CET.", "Hengsel viser hva som er endret fra forrige versjon og hva det gjør med prisen, før du importerer."],
  ["montasje", "Montasjeplan", "Klar for montering.", "Ny OB er bekreftet, og jobben ligger i montasjeplanen. Montøren får den i Hengsel Ute."],
];
export const CRM_ENHETER: [CrmEnhet, string][] = [["pc", "PC"], ["ipad", "iPad"], ["telefon", "Telefon"]];
export const CRM_MODULER: [string, string][] = [
  ["Min dag", "Det som venter på deg i dag: meldinger, avvik, frister og oppfølging."],
  ["Samtaler og salgstavle", "Henvendelser og tilbud i faser, med påminnelse når kunden ikke svarer."],
  ["Kundekort", "Tilbud, ordre, bestilling, montering, saker og faktura på samme kundekort."],
  ["Tilbud", "Import fra CET, prisgrupper, monteringskalkyle og e-signering."],
  ["Ordre og bestilling", "Bestilling med ordrebekreftelse og lager."],
  ["Montasje", "Montasjeplan og kontrollmål."],
  ["Saker", "Reklamasjoner, avvik, hvitevaresaker og restpunkter."],
  ["Leder og resultater", "Leder-tavle med frister og tall."],
  ["Økonomi", "Økonomi med faktura og PowerOffice."],
];
