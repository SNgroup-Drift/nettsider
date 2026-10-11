// Kundeportalen på hengsel.no 2.0. Fasit: docs/design/hengsel-no-2.0/Kundeportal.dc.html og PortalSkjerm.dc.html.
// Tekst ordrett fra LES-MEG.md («/kundeportal» og «Felles: kundeportalen på telefon og PC»). Alt er oppdiktet demoinnhold.

export type Steg = "tilbud" | "tilvalg" | "levering" | "montering" | "fdv";

/** Siden: fast tekst */
export const SIDE = {
  tittel: "Kundeportalen – Hengsel",
  beskrivelse: "Fra tilbudet til FDV-permen, på telefonen eller PC-en. Kunden får en SMS når noe er nytt, og svarer i portalen i stedet for på e-post og telefon.",
  eyebrow: "Kundeportalen",
  h1: "Kunden følger med selv.",
  lede: "Fra tilbudet til FDV-permen, på telefonen eller PC-en. Kunden får en SMS når noe er nytt, og svarer i portalen i stedet for på e-post og telefon.",
  visSms: "Vis SMS-en igjen",
  fanerEtikett: "Kundens reise",
  enhetEtikett: "Enhet",
  enheter: [["telefon", "Telefon"], ["pc", "PC"]] as const,
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

/** Selve portalskjermen (PortalSkjerm) */
export const PORTAL = {
  butikk: "Butikknavn",
  kunde: { init: "KN", navn: "Kari Nordmann", firma: "Kjøkken Nordmann" },
  selger: { init: "KB", navn: "Kristine B.", linje: "Butikknavn · 900 00 001", tittel: "Selgeren din", skriv: "Skriv til Kristine", skrivFelt: "Skriv til Kristine …", fra: "Kari" },
  levertMed: "Levert med",
  ordrelinje: "Kjøkken Nordmann · Ordre O-2417 · Oppdiktet allé 8, 2850 Lena",
  eksempel: "Eksempel",
  smsAvsender: "SMS · Butikknavn",
  smsNaa: "nå",
  /** Menyen på PC: navn, antall, hvilket steg som er aktivt */
  meny: [
    { l: "Oversikt", n: "", steg: [] as Steg[] },
    { l: "Tilbud og avtale", n: "", steg: ["tilbud"] as Steg[] },
    { l: "Tilvalg", n: "", steg: ["tilvalg"] as Steg[] },
    { l: "Levering og montering", n: "", steg: ["levering", "montering"] as Steg[] },
    { l: "Dokumenter", n: "5", steg: ["fdv"] as Steg[] },
    { l: "Meldinger", n: "1", steg: [] as Steg[] },
  ],
  pcTittel: {
    tilbud: "Hei Kari, her er tilbudet ditt.",
    tilvalg: "Velg tilvalg før fristen.",
    levering: "Kjøkkenet er på vei.",
    montering: "Montøren er i gang.",
    fdv: "Hei Kari, her er kjøkkenet ditt.",
  } satisfies Record<Steg, string>,
  melding: {
    tilbud: { t: "Kan oppvaskmaskinen flyttes nærmere vasken?", tid: "i dag 07.42" },
    tilvalg: { t: "Takk for hjelpen med tilvalgene.", tid: "fredag 09.30" },
    levering: { t: "Takk for hjelpen med tilvalgene.", tid: "fredag 09.30" },
    montering: { t: "Takk for i dag. Sokkelen ved vinduet ser litt kort ut.", tid: "i går 16.10" },
    fdv: { t: "Takk for hjelpen med tilvalgene.", tid: "fredag 09.30" },
  } satisfies Record<Steg, { t: string; tid: string }>,

  tilbud: {
    bilde: "Bilde fra tegningen",
    navn: "Kjøkken Nordmann",
    versjon: "Tilbud v3 · gyldig til 15.10.2026",
    total: ["Totalt inkl. mva", "257 700 kr"],
    rader: [["Tegningen", "3 ark"], ["Prisgrupper", "4"], ["Dokumenter", "Tilbud, vilkår"], ["Betalingsplan", "30 / 60 / 10 %"]],
    aksepter: "Aksepter tilbudet",
    notat: "Etterpå lager vi kjøpsavtalen. Den signeres med BankID i Penneo.",
    pris: "Pris",
  },
  tilvalg: {
    tittel: "Tilvalg",
    frist: "Frist fre. 16.10",
    ingress: "Velg før endringsfristen. Selgeren ser valgene dine med en gang.",
    valg: [
      { l: "Benkeplate 30 mm", s: "i stedet for 20 mm", p: "+ 6 200 kr", på: true },
      { l: "LED under overskap", s: "4 lister med dimmer", p: "+ 2 900 kr", på: true },
      { l: "Skuffeinnredning i eik", s: "3 skuffer", p: "+ 3 400 kr", på: false },
      { l: "Håndtak i messing", s: "23 stk", p: "+ 1 800 kr", på: false },
    ],
    nyTotal: ["Ny total", "266 800 kr"],
    send: "Send tilvalg",
    valgt: "Valgt",
    valgtRader: [["Tilbud v3", "257 700 kr"], ["2 tilvalg", "+ 9 100 kr"]],
  },
  levering: {
    tittel: "Levering",
    reise: [
      ["Bestilt", "fredag 9. oktober"],
      ["Ordrebekreftelse mottatt", "mandag 12. oktober"],
      ["Levering", "tirsdag 17. november · 07.00–09.00"],
      ["Montering", "17.–19. november · Montør En"],
      ["Ferdig montert", "kundens signatur og FDV"],
    ],
    for: "Før levering",
    forTekst: "Ryddig vei inn og plass til 14 kolli i garasje eller gang.",
    fliser: [["Levering", "tir. 17. november"], ["Tid", "07.00–09.00"], ["Kolli", "14"], ["Montering", "17.–19. november"]],
  },
  montering: {
    tittel: "Montering",
    under: "Montør En · dag 2 av 3 · ferdig torsdag 19. november",
    ks: "KS 8 av 12 punkter",
    punkterTittel: "Punkter på kjøkkenet",
    punkter: [
      { nr: "14-3", t: "Sokkel mangler 40 mm mot vegg", s: "Montering · bilde fra montøren", pille: "Åpen", tone: "warn" },
      { nr: "14-6", t: "Fuge mangler bak komfyr", s: "KS · i dag", pille: "Åpen", tone: "warn" },
      { nr: "14-5", t: "Sokkel mot vegg, 40 mm", s: "Montering · løst i går", pille: "Løst", tone: "ok" },
    ] as { nr: string; t: string; s: string; pille: string; tone: "warn" | "ok" }[],
    notat: "Punktene har samme nummer hos montøren og i butikken.",
    fliser: [["Montør", "Montør En"], ["Dag", "2 av 3"], ["Åpne punkter", "2"], ["Ferdig", "tor. 19. november"]],
  },
  fdv: {
    tittel: "Kjøkkenet ditt",
    under: "Ferdig montert torsdag 19. november",
    ok: ["Alle punkter er løst.", "3 av 3 lukket etter montering."],
    dokTittel: "Dokumenter",
    dok: [
      ["FDV-dokumentasjon", "PDF · 24 sider"],
      ["Garantibevis", "Innredning og hvitevarer"],
      ["Vedlikehold av benkeplate", "PDF · 2 sider"],
      ["Hvitevarer", "4 bruksanvisninger"],
      ["Ferdigmelding", "Signert 19. november"],
    ],
    apne: "Åpne",
    fliser: [["Ferdig montert", "19. november"], ["KS", "12 av 12"], ["Punkter", "0 åpne"], ["Garanti", "5 år"]],
    oppsummert: "Oppsummert",
  },
};
