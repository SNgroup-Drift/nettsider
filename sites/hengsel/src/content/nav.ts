// Menyen og bunnen på hengsel.no. Fasit for menyen: sidekartet 25-001–25-012 (S-68, «Rammen»): CRM, Hengsel Ute, Kundeportal, Integrasjoner, Priser og
// «Be om demo», pluss sidene merket KOMMER (25-008–25-010), som skal lenkes fra menyen (N-3). Bunnen: docs/design/hengsel/Bunn.dc.html.
export const LOGG_INN = "https://vis.hengsel.no";
export const APPTEST = "https://hengsel.no/apptest";

/** nøkkel, tekst, adresse. Nøkkelen settes som `aktiv` på siden, så menypunktet får aria-current="page". */
export const MENY = [
  ["crm", "CRM", "/crm"],
  ["ute", "Hengsel Ute", "/ute"],
  ["portal", "Kundeportal", "/kundeportal"],
  ["int", "Integrasjoner", "/integrasjoner"],
  ["pris", "Priser", "/priser-og-demo"],
  ["leder", "For butikkleder", "/for-butikkleder"],
  ["kunder", "Kunder", "/kunder"],
  ["om", "Om oss", "/om-oss"],
] as const;
/** Hengsels meny, pluss «slik» og «dok», som bare kundeutgavene (kunde.ts) har: Slik virker det og Dokumenter ligger ikke lenger på hengsel.no (K-229). */
export type MenyNokkel = (typeof MENY)[number][0] | "slik" | "dok";

export const BUNN_PRODUKT = [["CRM", "/crm"], ["Hengsel Ute", "/ute"], ["Kundeportal", "/kundeportal"]] as const;
export const BUNN_MER = [["Integrasjoner og sikkerhet", "/integrasjoner"], ["Priser og demo", "/priser-og-demo"], ["For butikkleder", "/for-butikkleder"], ["Kunder og referanser", "/kunder"], ["Om oss", "/om-oss"], ["Logg inn", LOGG_INN]] as const;
