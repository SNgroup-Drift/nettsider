/**
 * Dagens forside hadde ankrene #produkt, #jobb, #ute, #kontoret, #kundeportalen, #integrasjoner, #priser, #kontakt og #om.
 * Etter hengsel.no 2.0 ligger innholdet på egne sider. Ankere sendes ikke til tjeneren (så _redirects kan ikke bruke dem),
 * derfor sender dette skriptet gamle lenker som hengsel.no/#kontakt videre til riktig side.
 */
const MAL: Record<string, string> = {
  produkt: "/crm",
  kontoret: "/crm",
  ute: "/ute",
  kundeportalen: "/kundeportal",
  jobb: "/", // /slik-virker-det finnes ikke lenger på hengsel.no (K-229)
  integrasjoner: "/integrasjoner",
  priser: "/priser-og-demo",
  kontakt: "/priser-og-demo#demo",
};
const mal = MAL[location.hash.slice(1)];
if (mal) location.replace(mal);
