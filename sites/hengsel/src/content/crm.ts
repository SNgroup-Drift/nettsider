// /crm: tekstene. Fasit: sidekartet 25-002 (S-68). Tittel, ingress og modulene er fra LES-MEG.md (/crm, K-160). N-3 tok bort den klikkbare
// demoen (CrmSkjerm og dataene til den); demoen finnes på demo.hengsel.no.

export const CRM_SIDE = {
  eyebrow: "Hengsel CRM", h1: "Hele butikken på én skjerm.",
  lede: "Klikk deg gjennom en vanlig morgen: et avvik i ordrebekreftelsen, en ny tegning fra CET og montasjeplanen etterpå.",
  modulerEyebrow: "I CRM", modulerH2: "Samme kundekort for selger, kontor og leder.",
};
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

// ---- /crm etter sidekartet 25-002 (S-68, N-3): to tabeller. Den klikkbare demoen (CRM_STEG, CrmSkjerm) står ikke på siden lenger. ----
/** Rad 1 (320): Tabell «Før og med Hengsel», fem rader: i dag, med Hengsel */
export const FOR_OG_MED = {
  tittel: "Før og med Hengsel",
  kolonner: ["I dag", "Med Hengsel"],
  rader: [
    ["Leads ligger i e-post, på lapper og i telefonen.", "Alle henvendelser kommer inn i Min dag hos riktig selger."],
    ["Tegningen fra CET skrives inn i tilbudet for hånd.", "Tegning, artikler og pris hentes fra CET."],
    ["Ordrebekreftelsen sjekkes linje for linje på papir.", "Hengsel sammenligner ordrebekreftelsen med ordren og viser avvikene."],
    ["Montasjeplanen ligger i et eget regneark.", "Kapasitet per firma og uke, og montøren får jobben i Hengsel Ute."],
    ["Kunden ringer for å høre hvor langt det har kommet.", "Kunden følger tilbud, levering og montering selv i kundeportalen."],
  ],
};
/** Rad 2 (480): Tabell med modulene (CRM_MODULER), ni rader */
export const MODULER_KOLONNER = ["Hva", "Innhold"];
