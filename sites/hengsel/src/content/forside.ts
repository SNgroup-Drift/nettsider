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
  /** Komposisjonen øverst (N-3c): Studio Display med Min dag (CrmSkjerm) og iPhone med Hengsel Ute */
  altIphone: "Hengsel Ute på iPhone: I dag med neste jobb",
};

/** Rad 1 (120): Status 1/3 ×3 – tittel, pille, tone, setning */
export const STATUS: [string, string, Tone, string][] = [
  ["Ett sted for kunden.", "CRM", "ny", "Tilbud, ordre, montering og faktura på samme kundekort."],
  ["Montøren slipper papir.", "Hengsel Ute", "pagar", "Jobben, tegningene og KS-sjekklista i lomma."],
  ["Kunden følger med selv.", "Kundeportal", "ferdig", "Tilvalg, leveringsdag, punkter og dokumenter."],
];

/** «En dag i butikken»: seks rader (oppdiktet dag, S-68). Ny forside: klikkbar tidslinje (components/Tidslinje.astro) med setningene i mer. */
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
  /** Ny forside (prøveside): én kort setning per rad i tidslinjen, i samme rekkefølge som rader. Utkast til tekst. */
  mer: [
    "En kunde fyller ut skjemaet på nettsiden. Henvendelsen havner rett i innboksen, med navn og telefon klart.",
    "Selgeren åpner CET-tegningen sammen med kunden. Ønskene noteres på kundekortet, ikke på en lapp.",
    "Tilbudet går ut i kundeportalen. Kunden leser i ro og mak hjemme og signerer med BankID.",
    "Ja fra kunden blir ordre med ett trykk. Bestillingen til leverandøren lages fra de samme linjene.",
    "Montøren får jobben i Hengsel Ute, med tegninger, mål og KS-sjekkliste. Ingen papirmappe i bilen.",
    "Før du går hjem: dagens salg, åpne tilbud og hva som haster i morgen. Ett blikk, ferdig.",
  ],
};

/**
 * Ny forside (prøveside): ordrerekka. Teksten til hvert steg i «Fra tilbud til ferdig montert», nøkkel = stegnavnet i FORSIDE_FLYT
 * (content/simuleringer.ts). Et steg uten bilde i biblioteket hoppes over sammen med teksten. Utkast til tekst.
 */
export const ORDREREKKE = {
  tittel: "Fra tilbud til ferdig montert",
  ingress: "Én ordre går hele veien. Trykk på et steg, eller la rekka gå av seg selv.",
  steg: {
    Tilbud: { kort: "Kunden får et ryddig tilbud", tekst: "Lag tilbudet fra tegningen og send det rett til kundeportalen. Kunden signerer med BankID, og du ser når det er lest." },
    Ordre: { kort: "Ja blir ordre med ett trykk", tekst: "Signert tilbud blir ordre uten å skrive noe på nytt. Kontrollmålene ligger på ordren, så alle jobber med de samme tallene." },
    Bestilling: { kort: "Bestill fra de samme linjene", tekst: "Bestillingen til leverandøren lages fra ordrelinjene. Ordrebekreftelsen sjekkes mot det du bestilte." },
    Montasje: { kort: "Montøren har alt i lomma", tekst: "Jobben planlegges i kalenderen og havner i Hengsel Ute. Tegninger, sjekkliste og bilder følger med ut til kunden." },
    Etterkalkyle: { kort: "Se hva jobben faktisk ga", tekst: "Når kjøkkenet står, ser du timer, innkjøp og dekningsbidrag mot tilbudet. Neste tilbud blir litt bedre." },
  } as Record<string, { kort: string; tekst: string }>,
};

/** Ny forside (prøveside): priskalkulatoren. Tallene er eksempler (content/kalkulator.ts), aldri ekte priser. */
export const KALKULATOR = {
  tittel: "Hva koster det?",
  ingress: "Skru på tallene og se hvordan prisen bygges opp. Alle beløp er eksempler, ikke prisene våre.",
  merknad: "Eksempeltall. Ekte priser får du i et tilbud.",
  felt: {
    butikker: { navn: "Butikker", hjelp: "Hver butikk har sin egen pakke", min: 1, max: 20, start: 1 },
    brukere: { navn: "Brukere per butikk", hjelp: "Selgere, kontor og ledere", min: 1, max: 30, start: 5 },
    montorer: { navn: "Montører med Hengsel Ute", hjelp: "Til sammen, for alle butikkene", min: 0, max: 50, start: 2 },
  },
};

/**
 * Ny forside (prøveside): plassholdere der Eirik har materiale. Vises bare på hengsel.no (ikke i kundeutgavene) og er merket «Plassholder».
 */
export const PLASSHOLDERE = {
  film: { tittel: "Film", hva: "Film: «En dag i butikken»", tekst: "Filmen legges i biblioteket på bilder.hengsel.no og vises her." },
  sitat: { tittel: "Fra butikkene", hva: "Tekst: sitat fra en kunde", tekst: "Et kort sitat fra en butikk som bruker Hengsel, med navn og butikk." },
  bilde: { tittel: "I butikken", hva: "Bilde: fra en ekte butikk", tekst: "Et foto fra butikken eller fra en montasje, ikke et skjermbilde." },
};

/** Rad 3 (320): Liste 1/2 og Tekst 1/2 */
export const BYGGET_FOR = { tittel: "Bygget for", rader: ["Kjøkkenbutikk", "Interiørstudio", "Kjede", "Montasjefirma", "Leverandør"] };
/** Filmen «En dag i butikken» skal lenkes fra bilder.hengsel.no, men finnes ikke der ennå (N-3-rapporten) */
export const FILM = { tittel: "Film", tekst: "Filmen «En dag i butikken» kommer." };
