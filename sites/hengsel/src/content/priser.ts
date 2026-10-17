// /priser-og-demo: tekst og data. Fasit: sidekartet 25-006 (Priser) og 25-007 (Demo, skjema) fra S-68; tekstene fra LES-MEG.md der sidekartet ikke sier noe annet.
// Ingen priser noe sted (Eirik): «Pris etter antall butikker og brukere. Be om tilbud.»
import { TEL, EPOST } from "./forside";

export const SIDE = {
  tittel: "Priser og demo – Hengsel",
  beskrivelse: "Hva som inngår, hvordan oppstarten går, og hvordan dere får en demo.",
  eyebrow: "Priser og demo",
  h1: "Hele løsningen, fra første dag.",
  lede: "Pris etter antall butikker og brukere. Be om tilbud.",
} as const;

/** «Dette inngår»: tittel, beskrivelse (syv punkter i designet) */
export const INNGAR: [string, string][] = [
  ["CRM på PC, iPad og telefon", "Min dag, kundekort, tilbud, ordre, bestilling, montasje, saker og resultater."],
  ["Hengsel Ute", "Montørappen for iPhone, iPad og Android, også for utkjører og lager."],
  ["Kundeportal", "Tilbud, aksept, tilvalg, levering og FDV."],
  ["Dokumenter", "Tilbud, kjøpsavtale, arbeidsordre, KS-rapport og ferdigmelding med butikkens logo."],
  ["Koblinger", "CET, PowerOffice Go, Penneo, Tradeplace, lasermåler via Bluetooth, SMS og e-post."],
  ["Drift og sikkerhet", "Data lagres i EU. Logg på alle endringer. Daglig sikkerhetskopi."],
  ["Oppdateringer og hjelp", "Nye versjoner, og hjelp på telefon og e-post."],
];

export const OPPSTART = {
  eyebrow: "Oppstart",
  merke: "Eksempel",
  ingress: "Vi går gjennom stegene sammen med dere.",
  steg: [
    ["Demo", "Vi viser løsningen med en ordre fra start til slutt."],
    ["Oppsett", "Butikker, brukere, roller, logo, prislister og maler for dokumentene."],
    ["Opplæring", "Selgere, kontor og montører, hver med sin del av løsningen."],
    ["I drift", "Vi følger opp de første ukene og justerer oppsettet med dere."],
  ] as [string, string][],
};

export const DEMO = {
  h2: "Be om demo",
  ingress: "Vi viser Hengsel med en ordre fra start til slutt, og svarer på det dere lurer på.",
  kontakt: { eyebrow: "Ring eller skriv", tel: TEL, epost: EPOST },
  /** Fire felt i sidekartets rekkefølge (25-007: maks fire felt i et skjema på 480). «Hva vil dere se?» og antall avdelinger er tatt ut (N-3). */
  felt: {
    navn: { l: "Navn", ph: "Kari Nordmann" },
    butikk: { l: "Firma", ph: "Butikknavn" },
    epost: { l: "E-post", ph: "kari@butikknavn.no" },
    tlf: { l: "Telefon", ph: "900 00 000" },
  },
  send: "Be om demo",
  ring: `Du kan også ringe ${TEL}.`,
  feilTittel: "Mangler noe.",
  feilTekst: "Fyll inn navn og e-post eller telefon.",
  takk: (fornavn: string) => `Takk, ${fornavn}.`,
  takkReserveNavn: "for forespørselen",
  takkTekst: "Vi har fått forespørselen og tar kontakt for å avtale tid.",
  ny: "Ny forespørsel",
  // Ikke i LES-MEG (nødvendige for tilgjengelighet og reserve): korte feilmeldinger per felt og reserveteksten
  feltFeil: { epost: "Skriv en gyldig e-postadresse.", tlf: "Skriv et gyldig telefonnummer." },
  reserve: { tittel: "Forespørselen ble ikke sendt.", lenke: "Send den som e-post i stedet", emne: "Demo av Hengsel" },
  // Vises når e-postsending ikke er slått på: ingen feilmelding, bare lenken til e-post
  reserveNoytral: { tittel: "Send forespørselen på e-post til hei@hengsel.no.", lenke: "Åpne e-post" },
  utenSkript: "Skjemaet trenger JavaScript for å kunne sendes.",
  utenSkriptLenke: "Send e-post i stedet",
} as const;

/** 25-007: Tekst 1/2 «Kontakt» ved siden av skjemaet */
export const KONTAKT = { tittel: "Kontakt", adresse: "Enromvegen 173, 7026 Trondheim.", demodata: "Skjermbildene viser demodata. Navn og tall er ikke ekte." } as const;

export const MAILTO = `mailto:${EPOST}`;
