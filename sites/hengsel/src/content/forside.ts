// hengsel.no 2.0 – forsiden. Fasit: docs/design/hengsel/Forside.dc.html, tekstene ordrett fra LES-MEG.md (/ (forside)).

export const TEL = "+47 454 10 001";
/** tel:-lenken: nummeret uten mellomrom */
export const TEL_HREF = `tel:${TEL.replace(/\s/g, "")}`;
export const EPOST = "hei@hengsel.no";

export const HERO = {
  eyebrow: "CRM · montørapp · kundeportal",
  h1: "Fra første tegning til ferdig kjøkken.",
  lede: "Hengsel er løsningen for kjøkken- og interiørbutikker. Salg, tilbud, bestilling, montasje og kundeportal ligger på samme ordre og samme kundekort.",
  demo: "Be om demo",
  slik: "Slik virker det",
  altIpad: "Hengsel Ute på iPad: I dag med jobben til Kari Nordmann",
  altIphone: "Hengsel Ute på iPhone: I dag med neste jobb",
};

/** Tre løfter: nummer, tittel, setning */
export const LOFTER: [string, string, string][] = [
  ["01", "Ett sted for kunden.", "Tilbud, ordre, bestilling, montering, saker og faktura på samme kundekort."],
  ["02", "Montøren slipper papir.", "Jobben, tegningene, målene og KS-sjekklista ligger i lomma."],
  ["03", "Kunden følger med selv.", "Kundeportal med tilvalg, leveringsdag, punkter og dokumenter."],
];

export const REISE = {
  eyebrow: "Ordrens reise",
  h2: "Én ordre fra befaring til faktura.",
  lenke: "Se hele reisen i åtte scener →",
  /** Åtte steg: tittel, setning */
  steg: [
    ["Befaring", "Mål og bilder hos kunden, rett inn på kundekortet."],
    ["Tilbud", "Import fra CET, egen PDF og e-signering."],
    ["Aksept", "Kunden aksepterer og velger tilvalg i portalen."],
    ["Bestilling", "Bestilling til leverandør med ordrebekreftelse."],
    ["Levering", "Kolli på lager, utkjøring med signatur."],
    ["Montering", "Plan, KS-sjekkliste og laser i Hengsel Ute."],
    ["Punkter", "Ett nummersystem fra montør til kontor til kunde."],
    ["Ferdig og faktura", "Kundens signatur, faktura til PowerOffice."],
  ] as [string, string][],
};

export const NARMERE = {
  h2: "Se nærmere på",
  /** Sju kort: tittel, setning, lenketekst, adresse */
  kort: [
    ["CRM", "Min dag, kundekort, tilbud, ordre, bestilling og montasjeplan. På PC, iPad og telefon.", "Prøv demoen", "/crm"],
    ["Hengsel Ute", "Montørappen for iPhone og iPad. Jobben, KS, avvik og punkter, også uten dekning.", "Se appen", "/ute"],
    ["Kundeportal", "Kunden aksepterer tilbudet, velger tilvalg og følger leveringen selv.", "Se kundens side", "/kundeportal"],
    ["Slik virker det", "Ordrens reise i åtte scener, med det selgeren ser og det som skjer bak kulissene.", "Følg ordren", "/slik-virker-det"],
    ["Dokumenter", "Tilbud, kjøpsavtale, arbeidsordre, KS-rapport og ferdigmelding, laget rett fra ordren.", "Bla i dokumentene", "/dokumenter"],
    ["Integrasjoner", "CET, PowerOffice, Penneo, Tradeplace og lasermåler via Bluetooth. Data lagres i EU.", "Se systemkartet", "/integrasjoner"],
    ["Priser og demo", "Hva som inngår, hvordan oppstarten går, og hvordan dere får en demo.", "Be om demo", "/priser-og-demo"],
  ] as [string, string, string, string][],
};

export const DEMO = {
  h2: "Vil dere se Hengsel i bruk?",
  tekst: "Vi viser løsningen med en ordre fra start til slutt. Ring oss eller be om demo.",
  knapp: "Be om demo",
};
