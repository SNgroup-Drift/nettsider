// /telefon (N-8, Eirik 18.10): «Hengsel på telefon». Alle bildene er stier i skjermbildebiblioteket (bilder.hengsel.no, K-233), aldri lokale filer.
// Nøklene telefon/* tas av K-228b (390 px, tema hengsel, lys) i hengsel-crm og står i KJENTE_MANGLER (scripts/lib/bildedomene.mjs) til de er i manifestet.
// Format for bilder: [sti i biblioteket, navn, alt-tekst].
export type Bilde = readonly [sti: string, navn: string, alt: string];

export const HERO = {
  tittel: "Hengsel på telefon.",
  ingress: "Hele løsningen virker på telefon: i nettleseren uten installasjon, eller i Hengsel Ute, én app for iPhone, iPad og Android.",
  prov: "Prøv i nettleseren",
  kontakt: "Be om demo",
} as const;

/** Toppen: tre telefoner side om side med én setning under hver */
export const TOPP = {
  nettleser: { navn: "CRM i nettleseren", tekst: "Samme CRM som på kontoret, uten installasjon.", bilde: "telefon/crm-min-dag.webp", alt: "Hengsel CRM i nettleseren på iPhone: Min dag" },
  iphone: { navn: "Hengsel Ute på iPhone", tekst: "Montørappen med kø uten dekning, kamera og Face ID.", bilde: "app/idag-lys.webp", alt: "Hengsel Ute på iPhone: I dag med neste jobb" },
  android: { navn: "Hengsel Ute på Android", tekst: "Samme app og samme skjermer på Android.", bilde: "vis/skjermbilder/ute-i-dag.webp", alt: "Hengsel Ute på Android: I dag med neste jobb" },
} as const;

/** «Alt i nettleseren» */
export const NETTLESER = {
  tittel: "Alt i nettleseren",
  tekst: "CRM-et og kundeportalen virker i nettleseren på telefonen. Samme data, samme innlogging og ingen installasjon: åpne adressen, logg inn og jobb videre der du slapp på kontoret.",
  crmTittel: "CRM-et på telefon",
  crmTekst: "Min dag, Kunder, Ordre og Saker ligger i bunnmenyen, og Mer-arket åpner resten.",
  crm: [
    ["telefon/crm-min-dag.webp", "Min dag", "Hengsel CRM i nettleseren på iPhone: Min dag"],
    ["telefon/crm-kunder.webp", "Kunder", "Hengsel CRM i nettleseren på iPhone: kunder"],
    ["telefon/crm-ordre.webp", "Ordre", "Hengsel CRM i nettleseren på iPhone: ordre"],
    ["telefon/crm-saker.webp", "Saker", "Hengsel CRM i nettleseren på iPhone: saker"],
    ["telefon/crm-mer.webp", "Mer-arket", "Hengsel CRM i nettleseren på iPhone: Mer-arket"],
  ] as const satisfies readonly Bilde[],
  portalTittel: "Kundeportalen på telefon",
  portalTekst: "Kunden ser tilbudet og leveringen på sin egen telefon, med samme innlogging som på PC.",
  portal: [
    ["telefon/portal-tilbud.webp", "Tilbud", "Kundeportalen i nettleseren på iPhone: tilbudet"],
    ["telefon/portal-levering.webp", "Levering", "Kundeportalen i nettleseren på iPhone: leveringen"],
  ] as const satisfies readonly Bilde[],
} as const;

/** «Appen gjør mer»: ja, nei eller delvis per kolonne (Nettleser · Hengsel Ute) */
export type Svar = "ja" | "nei" | "delvis";
export const APP_MOT_WEB = {
  tittel: "Appen gjør mer",
  tekst: "Nettleseren holder for kontoret og for kunden. Montøren på jobb trenger appen.",
  kolonner: ["", "Nettleser", "Hengsel Ute"],
  rader: [
    ["Virker uten dekning (offline-kø)", "nei", "ja"],
    ["Kamera og laser/mål", "delvis", "ja"],
    ["Bilder rett på jobben", "delvis", "ja"],
    ["Varsler", "delvis", "ja"],
    ["GPS og utkjøring", "delvis", "ja"],
    ["Face ID og Touch ID", "nei", "ja"],
    ["Hjemskjerm", "delvis", "ja"],
    ["iPad med sidefelt", "delvis", "ja"],
    ["Oppdateres selv", "ja", "delvis"],
  ] as const satisfies readonly (readonly [string, Svar, Svar])[],
  merknad: "Delvis: nettleseren klarer det i noen tilfeller, men ikke like pålitelig. Hengsel Ute oppdateres automatisk når telefonen er satt opp til det.",
} as const;

/** «Hengsel Ute»: ni skjermer (iPhone, lys og mørk), og bildeverktøyet på iPad liggende. Navnene i biblioteket er vis/skjermbilder/ute-*[-mork]. */
export const UTE = {
  tittel: "Hengsel Ute",
  tekst: "Montørappen for iPhone og iPad: jobben, tegningene, målene og egenkontrollen i lomma.",
  skjermer: [
    ["ute-i-dag", "I dag", "Hengsel Ute: I dag"],
    ["ute-jobb-under", "Jobben", "Hengsel Ute: jobben under arbeid"],
    ["ute-laser", "Laser", "Hengsel Ute: lasermåling"],
    ["ute-ks", "KS", "Hengsel Ute: egenkontroll"],
    ["ute-ks-kamera", "Kamera", "Hengsel Ute: bilde til egenkontrollen"],
    ["ute-avvik", "Avvik", "Hengsel Ute: avvik"],
    ["ute-punkter", "Punkter", "Hengsel Ute: punktlista"],
    ["ute-punktkort", "Punktkort", "Hengsel Ute: punktkortet"],
    ["ute-ferdig", "Ferdig", "Hengsel Ute: klar for ferdigmelding"],
  ] as const,
  ipadTittel: "Bildeverktøyet på iPad",
  ipadTekst: "Tegn pil og mål rett på bildet av jobben, på iPad liggende.",
  ipad: ["vis/skjermbilder/ute-ipad-bildeverktoy", "Bildeverktøyet", "Hengsel Ute på iPad: bildeverktøyet"],
  morkTittel: "Mørk modus i Hengsel Ute",
  morkTekst: "Hengsel Ute finnes i lys og mørk utgave. Nettsiden her er bare lys.",
} as const;

/** «Android» */
export const ANDROID = {
  tittel: "Android",
  tekst: "Samme app, samme skjermer. På Android brukes Expo-appen, og den har de samme skjermene som på iPhone.",
  plassholder: "Kommer i App Store og Google Play",
  skjermer: [
    ["ute-i-dag", "I dag", "Hengsel Ute på Android: I dag"],
    ["ute-jobb-under", "Jobben", "Hengsel Ute på Android: jobben under arbeid"],
    ["ute-ks", "KS", "Hengsel Ute på Android: egenkontroll"],
    ["ute-avvik", "Avvik", "Hengsel Ute på Android: avvik"],
    ["ute-ferdig", "Ferdig", "Hengsel Ute på Android: klar for ferdigmelding"],
  ] as const,
} as const;

/** Avslutning */
export const AVSLUTNING = {
  tittel: "Prøv i nettleseren nå",
  tekst: "Demoen har eksempeldata og virker på telefonen din. Åpne den, logg inn som selger eller montør og se hvordan det føles i hånden.",
  prov: "Prøv i nettleseren nå",
  kontakt: "Ta kontakt",
} as const;

/** Seksjonen «På telefon» på produktsidene */
export const PAA_TELEFON = {
  crm: { tekst: "CRM-et virker i nettleseren på telefonen: Min dag, kunder, ordre og saker, med samme innlogging som på kontoret.", bilde: "vis/skjermbilder/crm-tlf-min-dag.webp", alt: "Hengsel CRM på iPhone: Min dag" },
  ute: { tekst: "Hengsel Ute er én app for iPhone, iPad og Android. Jobben virker uten dekning, og kameraet og lasermåleren er med.", bilde: "app/idag-lys.webp", alt: "Hengsel Ute på iPhone: I dag med neste jobb" },
  portal: { tekst: "Kundeportalen virker i nettleseren på kundens telefon: tilbudet, valgene og leveringen, uten at kunden installerer noe.", bilde: "vis/skjermbilder/kundeportal-k03.webp", alt: "Kundeportalen på iPhone: tilbudet" },
} as const;
