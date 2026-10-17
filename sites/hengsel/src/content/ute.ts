// /ute: tekstene ordrett fra docs/design/hengsel/LES-MEG.md («/ute · Ute.dc.html»).
// N-3: siden følger sidekartet 25-003 (STATUS, GJENNOM_DAGEN, TEGNING); BLI_TESTER er toppen på /apptest (25-012).
// Appbildene hentes fra skjermbildebiblioteket på bilder.hengsel.no (K-233): stien under app/ uten tema, se packages/hengsel-tokens/skjermbilder.mjs.
import type { Tone } from "../components/kit/Pille.astro";

export const APPTEST_URL = "https://hengsel.no/apptest";

export const HERO = {
  tittel: "Montøren slipper papir.",
  ingress: "Montørappen for iPhone og iPad. Jobben, tegningene, målene og KS-sjekklista ligger i lomma.",
  /** Rammen øverst (N-3c): I dag på iPhone, fra biblioteket */
  bilde: "app/idag-lys.webp",
  alt: "Hengsel Ute: I dag med neste jobb, adresse og knappen Jeg er på vei",
} as const;

/** Rad 1 (120): Status 1/3 ×3 – tittel, pille, tone, setning (sidekartet 25-003) */
export const STATUS: [string, string, Tone, string][] = [
  ["Uten dekning", "Klar uten nett", "ferdig", "Køen sendes når nettet er tilbake."],
  ["KS", "Punkt for punkt", "pagar", "OK med bilde åpner kameraet."],
  ["Punkter", "14-3", "advarsel", "Samme nummer i CRM, Ute og portal."],
];
/** Rad 2 (480): Tabell med stegene i STEG */
export const GJENNOM_DAGEN = { tittel: "Gjennom dagen", kolonner: ["Steg", "Hva"] };
/** Rad 3: Tegning 1/2 med I dag-skjermbildet fra biblioteket */
export const TEGNING = { tittel: "Hengsel Ute, I dag", bilde: "app/idag-lys.webp", alt: "Hengsel Ute: I dag med neste jobb, adresse og knappen Jeg er på vei" };

/** Steg i appen (tabellen «Gjennom dagen»): nøkkel, tittel, setning, alt-tekst */
export const STEG = [
  { nokkel: "idag", tittel: "I dag", tekst: "Neste jobb, På vei, og det du må vite før du starter.", alt: "Hengsel Ute: I dag med neste jobb, adresse og knappen Jeg er på vei" },
  { nokkel: "jobben", tittel: "Jobben", tekst: "Tegning, mål, bilder og restpunkter samlet før, under og etter.", alt: "Hengsel Ute: jobben med Noe mangler, Før og Under" },
  { nokkel: "ks", tittel: "KS", tekst: "Punkt for punkt. OK med bilde åpner kameraet.", alt: "Hengsel Ute: KS-sjekkliste punkt for punkt" },
  { nokkel: "avvik", tittel: "Avvik", tekst: "Bilde med pil, og om det trengs ny vare.", alt: "Hengsel Ute: meld avvik med bilde" },
  { nokkel: "punkter", tittel: "Punkter", tekst: "Ett nummersystem, samme nummer i CRM og portal.", alt: "Hengsel Ute: punktlista på kunden med nummer og status" },
  { nokkel: "ferdig", tittel: "Ferdig", tekst: "Ferdig montert, eller det som gjenstår med dato.", alt: "Hengsel Ute: meld ferdig montert" },
] as const;

export const UTEN_NETT = {
  eyebrow: "Virker uten dekning",
  tittel: "Kjelleren, hytta og nybygget uten nett.",
  tekst: "Alt montøren sender inn, legges først i en kø på telefonen og vises med en gang som om det var sendt. Når nettet kommer tilbake, sendes køen av seg selv.",
} as const;

export const BLI_TESTER = {
  tittel: "Bli tester",
  tekst: "Hengsel Ute er i test på iPhone, iPad og Android. Testsiden har lenkene og forteller hvordan du melder feil.",
  knapp: "Bli tester",
  appStore: "App Store",
} as const;
