// hengsel.no – teksten på forsiden. Fasit: W1 i docs/design/hengsel/60 hengsel.no.dc.html (pakke v8, 11.10.2026), ordrett.
// Bildene er fra Apple-pakkene (docs/bilder.md), ikke fra fil 60 (gamle forhåndsvisninger).

// Innloggingsadressen («Logg inn» i menyen) settes med miljøvariabelen LOGIN ved bygging, se astro.config.mjs. Tom = skjult.
export const TEL = "+47 454 10 001";
/** tel:-lenken: nummeret uten mellomrom */
export const TEL_HREF = `tel:${TEL.replace(/\s/g, "")}`;
export const EPOST = "hei@hengsel.no";

/** Knappene i Hengsel Ute-delen. En verdi som begynner med «TODO_» vises som deaktivert knapp («Lenke kommer») til Eirik fyller den inn. */
export const APPLENKER = {
  appStore: "TODO_APPSTORE_TESTFLIGHT",
  googlePlay: "TODO_GOOGLE_PLAY",
  /** «Bli tester»: /apptest ligger bak passord og lenkes ikke fra forsiden, så testere ber om tilgang på e-post */
  bliTester: "mailto:test@hengsel.no?subject=Bli%20tester",
} as const;
export const erTodo = (verdi: string) => verdi.startsWith("TODO_");

/** Tre løfter: tittel, setning */
export const LOFTER: [string, string][] = [
  ["Ett sted for kunden.", "Tilbud, ordre, bestilling, montering, saker og faktura på samme kundekort."],
  ["Montøren slipper papir.", "Jobben, tegningene, målene og KS-sjekklista ligger i lomma."],
  ["Kunden følger med selv.", "Kundeportal med tilvalg, leveringsdag, punkter og dokumenter."],
];

/** Slik går en jobb gjennom Hengsel, sju steg: tittel, setning */
export const STEG: [string, string][] = [
  ["Befaring", "Mål og bilder hos kunden, rett inn på kundekortet."],
  ["Tilbud", "Import fra CET, egen PDF og e-signering."],
  ["Ordre og bestilling", "Bestilling til leverandør med ordrebekreftelse."],
  ["Levering", "Kolli på lager, utkjøring med signatur."],
  ["Montering", "Plan, KS-sjekkliste og laser i Hengsel Ute."],
  ["Punkter og saker", "Ett nummersystem fra montør til kontor til kunde."],
  ["Ferdig og faktura", "Kundens signatur, faktura til PowerOffice."],
];

/** Hengsel Ute: tittel, setning, bilde, alt */
export const UTE: [string, string, string, string][] = [
  ["I dag", "Neste jobb, På vei, og det du må vite før du starter.", "ute-i-dag", "Hengsel Ute: I dag med neste jobb, adresse og åpne restpunkter"],
  ["Jobben", "Tegning, mål, bilder og restpunkter i faner.", "ute-jobb-under", "Hengsel Ute: jobben med tegning, mål, bilder og restpunkter"],
  ["Laser", "Målene rett inn i bildet.", "ute-laser", "Hengsel Ute: Bosch-laseren kobles til og måler rett inn i bildet"],
  ["Kvalitetssjekk", "Punkt for punkt. OK med bilde åpner kameraet.", "ute-ks", "Hengsel Ute: KS-sjekkliste, punkt som krever bilde («Ta bilde først»)"],
  ["Meld avvik", "Bilde med pil, og om det trengs ny vare.", "ute-avvik", "Hengsel Ute: meld avvik med bilde og valg om ny vare"],
  ["Punkter hos kunden", "Ett nummersystem, samme nummer i CRM og portal.", "ute-punkter", "Hengsel Ute: punktlisten på kunden med nummer og status"],
  ["Før og etter", "Punktkortet dokumenterer at det er løst.", "ute-punktkort", "Hengsel Ute: punktkort med før- og etterbilde"],
  ["Ferdig montert", "Klar for ferdigmelding.", "ute-ferdig", "Hengsel Ute: klar for ferdigmelding"],
  ["Typeskilt", "Hvitevaren fotograferes og legges på kunden.", "ute-typeskilt", "Hengsel Ute: hvitevarer skannet fra typeskilt"],
];
export const UTE_IPAD_ALT = "Hengsel Ute på iPad: bildeverktøyet med punkter på bildet og punktliste til høyre";

/** For kontoret, fire punkter (hvert viser sin skjerm): tekst, bilde, alt */
export const KONTOR: [string, string, string][] = [
  ["Leder-tavle med frister og tall", "crm-resultater", "Hengsel CRM: Leder-tavlen med tall, forskudd, team og resultatkort"],
  ["Montasjeplan og kontrollmål", "crm-montasje", "Hengsel CRM: montasjeplanen for uke 42 per montør og montasjefirma, med ikke planlagte ordrer"],
  ["Bestilling med ordrebekreftelse og lager", "crm-bestilling", "Hengsel CRM: bestilling med leverandørfakturaer som ikke er koblet til ordre"],
  ["Økonomi med faktura og PowerOffice", "crm-etterkalkyle", "Hengsel CRM: økonomi og etterkalkyle på en ordre"],
];

export const PORTAL_BILDE = "portal-tilbud";
export const PORTAL_ALT = "Kundeportalen på telefon: tilbudet med bilde, pris og knappen «Aksepter tilbudet»";

export const INTEGRASJONER = "Nobia og CET-import · PowerOffice Go · Penneo e-signering · Bosch laser · SMS og e-post · Feilovervåking";
export const TRYGGHET = "Data lagres i EU. Roller og butikktilgang styrer hvem som ser hva. Logg på alle endringer. Daglig sikkerhetskopi.";
