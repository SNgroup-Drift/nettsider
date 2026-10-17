// hengsel.no – forsiden. Fasit: sidekartet 25-001 (S-68, hengsel-crm docs/sidekart/25-001.md og bildene). Ingressen og «Prøv selv» er fra K-160/K-229.
import type { Tone } from "../components/kit/Pille.astro";

export const TEL = "+47 454 10 001";
/** tel:-lenken: nummeret uten mellomrom */
export const TEL_HREF = `tel:${TEL.replace(/\s/g, "")}`;
export const EPOST = "hei@hengsel.no";

/** Demoen (K-229). Hengsel-sidene sender til den med «Prøv selv». */
export const PROV_SELV = "https://demo.hengsel.no";

export const HERO = {
  h1: "Fra første tegning til ferdig kjøkken.",
  lede: "Hengsel er løsningen for kjøkken- og interiørbutikker. Salg, tilbud, bestilling, montasje og kundeportal ligger på samme ordre og samme kundekort.",
  demo: "Be om demo",
  /** Knappen til demoen (K-229): det finnes nå en ekte demo. Adressen står i PROV_SELV. */
  prov: "Prøv selv",
};

/** Rad 1 (120): Status 1/3 ×3 – tittel, pille, tone, setning */
export const STATUS: [string, string, Tone, string][] = [
  ["Ett sted for kunden.", "CRM", "ny", "Tilbud, ordre, montering og faktura på samme kundekort."],
  ["Montøren slipper papir.", "Hengsel Ute", "pagar", "Jobben, tegningene og KS-sjekklista i lomma."],
  ["Kunden følger med selv.", "Kundeportal", "ferdig", "Tilvalg, leveringsdag, punkter og dokumenter."],
];

/** Rad 2 (480): Tabell 1/1, seks rader. Eksempeldata (oppdiktet dag, S-68). */
export const EN_DAG = {
  tittel: "En dag i butikken",
  kolonner: ["Kl.", "Hva", "Hvor"],
  rader: [
    ["08.15", "Henvendelsen kommer inn", "Innkommende"],
    ["09.00", "Kundemøte med CET-tegning", "Tilbud"],
    ["11.30", "Tilbud sendt med BankID", "Kundeportal"],
    ["13.00", "Kontrakt signert, bestilling til leverandør", "Bestilling"],
    ["14.30", "Montering planlagt i Hengsel Ute", "Hengsel Ute"],
    ["16.00", "Tall og oppfølging", "Resultater"],
  ],
};

/** Rad 3 (320): Liste 1/2 og Tekst 1/2 */
export const BYGGET_FOR = { tittel: "Bygget for", rader: ["Kjøkkenbutikk", "Interiørstudio", "Kjede", "Montasjefirma", "Leverandør"] };
/** Filmen «En dag i butikken» skal lenkes fra bilder.hengsel.no, men finnes ikke der ennå (N-3-rapporten) */
export const FILM = { tittel: "Film", tekst: "Filmen «En dag i butikken» kommer." };
