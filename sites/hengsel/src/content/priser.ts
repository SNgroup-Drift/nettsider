// /priser-og-demo: tekst og data. Fasit: docs/design/hengsel-no-2.0/Priser-og-demo.dc.html og LES-MEG.md, ordrett.
// Ingen priser noe sted (Eirik): «Pris etter antall butikker og brukere. Be om tilbud.»
import { TEL, EPOST } from "./forside";

export const SIDE = {
  tittel: "Priser og demo – Hengsel",
  beskrivelse: "Hele løsningen, fra første dag. Pris etter antall butikker og brukere. Be om tilbud.",
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
  felt: {
    navn: { l: "Navn", ph: "Kari Nordmann" },
    butikk: { l: "Butikk", ph: "Butikknavn" },
    epost: { l: "E-post", ph: "kari@butikknavn.no" },
    tlf: { l: "Telefon", ph: "900 00 000" },
    melding: { l: "Hva vil dere se?", ph: "For eksempel montasjeplan og kundeportal" },
  },
  avdelinger: {
    l: "Antall avdelinger",
    /** verdi (sendes til /api/demo), tekst. Valget fra designet er «2–3». */
    valg: [["1", "1"], ["2-3", "2–3"], ["4+", "4 eller flere"]] as [string, string][],
    standard: "2-3",
  },
  send: "Send forespørsel",
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
  utenSkript: "Skjemaet trenger JavaScript for å kunne sendes.",
  utenSkriptLenke: "Send e-post i stedet",
} as const;

export const MAILTO = `mailto:${EPOST}`;
