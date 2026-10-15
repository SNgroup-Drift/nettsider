/** Skjermene: app-skjermbildene kommer fra biblioteket på bilder.hengsel.no (K-233: tatt fra demoen med fiktive data, vis/skjermbilder/<fil>.webp, målene fra manifestet);
 *  hengsel.no-forsiden (kilde «nettside») lages av scripts/skjermer-hengsel-no.mjs til public/nettsider. Navn, tall og bilder er oppdiktet. Bredde × høyde (1×) brukes bare for kilde «nettside». */
export type Skjerm = { fil: string; tittel: string; alt: string; b: number; h: number; mork: boolean; kilde?: "nettside" };
export const CRM: Skjerm[] = [
  { fil: "crm-min-dag", tittel: "Min dag", alt: "CRM, Min dag: dagens oppgaver og samtaler for en selger", b: 1440, h: 810, mork: true },
  { fil: "crm-tilbud", tittel: "Tilbud", alt: "CRM, Tilbud: lista over tilbud med status", b: 1440, h: 810, mork: true },
  { fil: "crm-ordre-kontrollmal", tittel: "Ordre", alt: "CRM, Ordre: kontrollmål på en ordre", b: 1440, h: 810, mork: true },
  { fil: "crm-samtaler", tittel: "Samtaler", alt: "CRM, Samtaler: dialogen «Logg samtale» på et tilbud", b: 1440, h: 810, mork: true },
];
export const PORTAL: Skjerm[] = [
  { fil: "portal-tilbud", tittel: "Kundeportalen, tilbudet (telefon)", alt: "Kundeportalen på telefon: kunden ser tilbudet sitt", b: 390, h: 844, mork: false },
  { fil: "kundeportal-pc", tittel: "Kundeportalen, Mitt kjøkken (PC)", alt: "Kundeportalen på PC: kundens oversikt over kjøkkenet", b: 1442, h: 2095, mork: false },
];
export const UTE: Skjerm[] = [
  { fil: "ute-i-dag", tittel: "Hengsel Ute, I dag", alt: "Hengsel Ute på iPhone: dagens jobber for montøren", b: 388, h: 842, mork: true },
  { fil: "ute-jobb-under", tittel: "Hengsel Ute, Jobben", alt: "Hengsel Ute på iPhone: en jobb med tegninger og mål", b: 388, h: 842, mork: true },
  { fil: "ute-ks", tittel: "Hengsel Ute, KS", alt: "Hengsel Ute på iPhone: KS-sjekklisten", b: 388, h: 842, mork: true },
];
export const NETT: Skjerm[] = [
  { fil: "hengsel-no-forside", tittel: "hengsel.no, forsiden", alt: "hengsel.no: forsiden med merket v3 og fiktive skjermer", b: 1440, h: 900, mork: true, kilde: "nettside" },
];
