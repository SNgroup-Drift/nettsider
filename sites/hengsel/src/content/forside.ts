// hengsel.no 2.0 – forsiden. Fasit: docs/design/hengsel/Forside.dc.html, tekstene ordrett fra LES-MEG.md (/ (forside)).

export const TEL = "+47 454 10 001";
/** tel:-lenken: nummeret uten mellomrom */
export const TEL_HREF = `tel:${TEL.replace(/\s/g, "")}`;
export const EPOST = "hei@hengsel.no";

/** Demoen (K-229). Hengsel-sidene sender til den med «Prøv selv». */
export const PROV_SELV = "https://demo.hengsel.no";

export const HERO = {
  eyebrow: "CRM · montørapp · kundeportal",
  h1: "Fra første tegning til ferdig kjøkken.",
  lede: "Hengsel er løsningen for kjøkken- og interiørbutikker. Salg, tilbud, bestilling, montasje og kundeportal ligger på samme ordre og samme kundekort.",
  demo: "Be om demo",
  /** Knappen til demoen (K-229): det finnes nå en ekte demo. Adressen står i PROV_SELV. */
  prov: "Prøv selv",
  altIpad: "Hengsel Ute på iPad: I dag med jobben til Kari Nordmann",
  altIphone: "Hengsel Ute på iPhone: I dag med neste jobb",
};

/** Tre løfter: nummer, tittel, setning */
export const LOFTER: [string, string, string][] = [
  ["01", "Ett sted for kunden.", "Tilbud, ordre, bestilling, montering, saker og faktura på samme kundekort."],
  ["02", "Montøren slipper papir.", "Jobben, tegningene, målene og KS-sjekklista ligger i lomma."],
  ["03", "Kunden følger med selv.", "Kundeportal med tilvalg, leveringsdag, punkter og dokumenter."],
];

export const NARMERE = {
  h2: "Se nærmere på",
  /** Fem kort: tittel, setning, lenketekst, adresse */
  kort: [
    ["CRM", "Min dag, kundekort, tilbud, ordre, bestilling og montasjeplan. På PC, iPad og telefon.", "Prøv demoen", "/crm"],
    ["Hengsel Ute", "Montørappen for iPhone og iPad. Jobben, KS, avvik og punkter, også uten dekning.", "Se appen", "/ute"],
    ["Kundeportal", "Kunden aksepterer tilbudet, velger tilvalg og følger leveringen selv.", "Se kundens side", "/kundeportal"],
    ["Integrasjoner", "CET, PowerOffice, Penneo, Tradeplace og lasermåler via Bluetooth. Data lagres i EU.", "Se systemkartet", "/integrasjoner"],
    ["Priser og demo", "Hva som inngår, hvordan oppstarten går, og hvordan dere får en demo.", "Be om demo", "/priser-og-demo"],
  ] as [string, string, string, string][],
};

export const DEMO = {
  h2: "Vil dere se Hengsel i bruk?",
  tekst: "Vi viser løsningen med en ordre fra start til slutt. Ring oss eller be om demo.",
  knapp: "Be om demo",
};
