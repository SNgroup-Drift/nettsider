// Menyen og bunnen på hengsel.no 2.0. Fasit: docs/design/hengsel/Meny.dc.html og Bunn.dc.html. Tekst ordrett fra LES-MEG.md.
export const LOGG_INN = "https://vis.hengsel.no";
export const APPTEST = "https://hengsel.no/apptest";

/** nøkkel, tekst, adresse. Nøkkelen settes som `aktiv` på siden, så menypunktet får aria-current="page". */
export const MENY = [
  ["crm", "CRM", "/crm"],
  ["ute", "Hengsel Ute", "/ute"],
  ["portal", "Kundeportal", "/kundeportal"],
  ["slik", "Slik virker det", "/slik-virker-det"],
  ["dok", "Dokumenter", "/dokumenter"],
  ["int", "Integrasjoner", "/integrasjoner"],
  ["pris", "Priser og demo", "/priser-og-demo"],
] as const;
export type MenyNokkel = (typeof MENY)[number][0];

export const BUNN_PRODUKT = [["CRM", "/crm"], ["Hengsel Ute", "/ute"], ["Kundeportal", "/kundeportal"], ["Dokumenter", "/dokumenter"]] as const;
export const BUNN_MER = [["Slik virker det", "/slik-virker-det"], ["Integrasjoner og sikkerhet", "/integrasjoner"], ["Priser og demo", "/priser-og-demo"], ["Logg inn", LOGG_INN]] as const;
