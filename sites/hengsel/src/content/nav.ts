// Menyen og bunnen på hengsel.no. Fasit for menyen: sidekartet 25-001–25-012 (S-68, «Rammen»): CRM, Hengsel Ute, Kundeportal, Integrasjoner, Priser og
// «Be om demo». Sidene merket KOMMER (25-008 /for-butikkleder, 25-009 /kunder, 25-010 /om-oss) lenkes ikke fra menyen eller bunnen før teksten er på plass
// (Eirik 17.10, svar A, N-3b); de finnes på adressene sine med noindex. Bunnen: docs/design/hengsel/Bunn.dc.html.
export const LOGG_INN = "https://vis.hengsel.no";
export const APPTEST = "https://hengsel.no/apptest";

/** nøkkel, tekst, adresse. Nøkkelen settes som `aktiv` på siden, så menypunktet får aria-current="page". */
export const MENY = [
  ["crm", "CRM", "/crm"],
  ["ute", "Hengsel Ute", "/ute"],
  ["portal", "Kundeportal", "/kundeportal"],
  ["int", "Integrasjoner", "/integrasjoner"],
  ["pris", "Priser", "/priser-og-demo"],
] as const;
/** Hengsels meny, pluss «slik» og «dok», som bare kundeutgavene (kunde.ts) har: Slik virker det og Dokumenter ligger ikke lenger på hengsel.no (K-229).
 *  «leder», «kunder» og «om» er KOMMER-sidene (25-008–25-010): ikke i menyen før teksten finnes (N-3b), men nøkkelen settes som `aktiv` på sidene. */
export type MenyNokkel = (typeof MENY)[number][0] | "slik" | "dok" | "leder" | "kunder" | "om";

export const BUNN_PRODUKT = [["CRM", "/crm"], ["Hengsel Ute", "/ute"], ["Kundeportal", "/kundeportal"]] as const;
export const BUNN_MER = [["Integrasjoner og sikkerhet", "/integrasjoner"], ["Priser og demo", "/priser-og-demo"], ["Logg inn", LOGG_INN]] as const;
