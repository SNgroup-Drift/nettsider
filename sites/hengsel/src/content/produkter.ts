/**
 * N-9 (Eirik 18.10, svar B på logoer-produkter-1810): produktlogoene på hengsel.no. Logoene er designsystemets (ds/produktlogo, aksent, lys),
 * byte for byte; CRM, Ute og Admin kommer fra PRODUKTLOGO, Levering og Hengsel-symbolet importeres direkte fra samme mappe (PRODUKTLOGO har dem ikke ennå).
 * Kundeportal og Telefon har ingen logo før Design 2.13: de vises som Hengsel-symbolet + tekstnavnet. Tekstene i flisene er Eiriks (18.10).
 */
import { PRODUKTLOGO } from "@sngroup/hengsel-tokens/produktlogo";
import levering from "@sngroup/hengsel-tokens/ds/produktlogo/logo-levering-lys.svg?url";
import symbol from "@sngroup/hengsel-tokens/ds/produktlogo/merke-hengsel-lys.svg?url";

export type ProduktNokkel = "crm" | "ute" | "admin" | "levering" | "kundeportal" | "telefon";
export type Logo = { src: string; width: number; height: number };

/** Hengsel-symbolet (aksent, lys), 86,4 × 108 */
export const SYMBOL: Logo = { src: symbol, width: 86.4, height: 108 };

export const PRODUKTER: Record<ProduktNokkel, { navn: string; logo?: Logo }> = {
  crm: { navn: "Hengsel CRM", logo: PRODUKTLOGO.crm },
  ute: { navn: "Hengsel Ute", logo: PRODUKTLOGO.ute },
  admin: { navn: "Hengsel Admin", logo: PRODUKTLOGO.admin },
  levering: { navn: "Hengsel Levering", logo: { src: levering, width: 763, height: 100 } },
  kundeportal: { navn: "Kundeportal" },
  telefon: { navn: "Hengsel på telefon" },
};

/** «Produktene» på forsiden: seks fliser. `href` mangler for Levering (ingen side ennå); Admin har ingen side på hengsel.no og lenker til /for-butikkleder. */
export const PRODUKTENE = {
  tittel: "Produktene",
  tekst: "Seks produkter i samme Hengsel.",
  fliser: [
    { nokkel: "crm", href: "/crm", tekst: "Salg, tilbud, ordre, bestilling og montasjeplan for butikken – på PC, iPad og telefon. For selgere, ledere og montasjeleder." },
    { nokkel: "ute", href: "/ute", tekst: "Appen for montører, utkjørere og montørfirmaer ute hos kunden – iPhone, iPad og Android, én app." },
    { nokkel: "kundeportal", href: "/kundeportal", tekst: "Kundens egen side med tilbud, tegninger, leveringstid, tilvalg og meldinger til selgeren – i butikkens eget uttrykk." },
    { nokkel: "telefon", href: "/telefon", tekst: "Hengsel i nettleseren på telefonen, og Ute for dem som er ute – samme ordre overalt." },
    { nokkel: "admin", href: "/for-butikkleder", tekst: "Kjedens og butikkens innstillinger: merkevare, brukere, roller og datakilde." },
    { nokkel: "levering", href: undefined, tekst: "Utkjøring og levering fra lager til kunde, med varsel til kunden dagen før." },
  ] as { nokkel: ProduktNokkel; href?: string; tekst: string }[],
};
