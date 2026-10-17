/**
 * N-6 (Eirik 18.10): bildeseriene i simuleringene på hengsel.no (Simulering.astro, TreEnheter.astro). Alle bildene er stier i skjermbildebiblioteket
 * (bilder.hengsel.no, packages/hengsel-tokens/skjermbilder.mjs, K-233), aldri lokale filer. Et steg uten bilde i manifestet hoppes over.
 * scripts/simuleringer.test.mjs leser denne fila og feiler hvis en sti ikke finnes i manifestet.
 * Format: [sti i biblioteket, navn på steget (stegmerket), alt-tekst].
 */
export type Steg = readonly [bilde: string, navn: string, alt: string];

/** Forsiden: «Fra tilbud til ferdig montert» (Studio Display) */
export const FORSIDE_FLYT: Steg[] = [
  ["vis/skjermbilder/crm-tilbud.webp", "Tilbud", "Hengsel CRM: tilbudet til kunden"],
  ["vis/skjermbilder/crm-ordre-kontrollmal.webp", "Ordre", "Hengsel CRM: ordren med kontrollmål"],
  ["vis/skjermbilder/crm-bestilling.webp", "Bestilling", "Hengsel CRM: bestilling hos leverandør"],
  ["vis/skjermbilder/crm-montasje.webp", "Montasje", "Hengsel CRM: montasjeplan"],
  ["vis/skjermbilder/crm-etterkalkyle.webp", "Etterkalkyle", "Hengsel CRM: etterkalkyle på ferdig montert jobb"],
];

/** «Tre enheter»: samme flyt på Studio Display, iPad og iPhone (forsiden og slik virker det) */
export const TRE_STEG = ["Min dag", "Ordre", "Kontrollmål"] as const;
export const TRE_ENHETER = {
  display: [
    ["vis/skjermbilder/crm-min-dag.webp", "Min dag", "Hengsel CRM på Studio Display: Min dag"],
    ["vis/skjermbilder/crm-ordre-kontrollmal.webp", "Ordre", "Hengsel CRM på Studio Display: ordren"],
    ["vis/skjermbilder/crm-montasje.webp", "Kontrollmål", "Hengsel CRM på Studio Display: montasje og kontrollmål"],
  ],
  ipad: [
    ["vis/skjermbilder/crm-ipad-min-dag.webp", "Min dag", "Hengsel CRM på iPad: Min dag"],
    ["vis/skjermbilder/crm-ipad-kontrollmal.webp", "Ordre", "Hengsel CRM på iPad: kontrollmål på ordren"],
    ["vis/skjermbilder/crm-ipad-belastninger.webp", "Kontrollmål", "Hengsel CRM på iPad: belastninger"],
  ],
  iphone: [
    ["vis/skjermbilder/crm-tlf-min-dag.webp", "Min dag", "Hengsel CRM på iPhone: Min dag"],
    ["vis/skjermbilder/crm-tlf-ordre.webp", "Ordre", "Hengsel CRM på iPhone: ordren"],
    ["vis/skjermbilder/crm-tlf-kontrollmal.webp", "Kontrollmål", "Hengsel CRM på iPhone: kontrollmål"],
  ],
} as const satisfies Record<string, readonly Steg[]>;

/** /crm */
export const CRM_DISPLAY: Steg[] = [
  ["vis/skjermbilder/crm-min-dag.webp", "Min dag", "Hengsel CRM: Min dag"],
  ["vis/skjermbilder/crm-salgstavla.webp", "Salgstavla", "Hengsel CRM: salgstavla"],
  ["vis/skjermbilder/crm-tilbud-kunde.webp", "Tilbud", "Hengsel CRM: tilbudet på kundekortet"],
  ["vis/skjermbilder/crm-saker.webp", "Saker", "Hengsel CRM: saker"],
  ["vis/skjermbilder/crm-resultater.webp", "Resultater", "Hengsel CRM: resultater"],
];
export const CRM_IPAD: Steg[] = [
  ["vis/skjermbilder/crm-ipad-min-dag.webp", "Min dag", "Hengsel CRM på iPad: Min dag"],
  ["vis/skjermbilder/crm-ipad-leder.webp", "Leder", "Hengsel CRM på iPad: ledervisning"],
  ["vis/skjermbilder/crm-ipad-kontrollmal.webp", "Kontrollmål", "Hengsel CRM på iPad: kontrollmål"],
  ["vis/skjermbilder/crm-ipad-belastninger.webp", "Belastninger", "Hengsel CRM på iPad: belastninger"],
];
export const CRM_IPHONE: Steg[] = [
  ["vis/skjermbilder/crm-tlf-min-dag.webp", "Min dag", "Hengsel CRM på iPhone: Min dag"],
  ["vis/skjermbilder/crm-tlf-kundekort.webp", "Kundekort", "Hengsel CRM på iPhone: kundekort"],
  ["vis/skjermbilder/crm-tlf-ordre.webp", "Ordre", "Hengsel CRM på iPhone: ordre"],
  ["vis/skjermbilder/crm-tlf-kontrollmal.webp", "Kontrollmål", "Hengsel CRM på iPhone: kontrollmål"],
];

/** /ute */
export const UTE_IPHONE: Steg[] = [
  ["vis/skjermbilder/ute-i-dag.webp", "I dag", "Hengsel Ute: I dag"],
  ["vis/skjermbilder/ute-jobb-under.webp", "Jobben", "Hengsel Ute: jobben under arbeid"],
  ["vis/skjermbilder/ute-ks.webp", "KS", "Hengsel Ute: egenkontroll"],
  ["vis/skjermbilder/ute-ks-kamera.webp", "Kamera", "Hengsel Ute: bilde til egenkontrollen"],
  ["vis/skjermbilder/ute-avvik.webp", "Avvik", "Hengsel Ute: avvik"],
  ["vis/skjermbilder/ute-ferdig.webp", "Ferdig", "Hengsel Ute: klar for ferdigmelding"],
];
export const UTE_IPAD: Steg[] = [
  ["vis/skjermbilder/ute-ipad-bildeverktoy.webp", "Bildeverktøy", "Hengsel Ute på iPad: bildeverktøyet"],
  ["vis/skjermbilder/ipad-bildeverktoy-laser.webp", "Laser", "Hengsel Ute på iPad: bildeverktøyet med lasermåling"],
];
/** «uten nett»: stillramme (app/ er iOS-bildene fra simulatoren) */
export const UTE_UTEN_NETT = { bilde: "app/uten-nett-lys.webp", alt: "Hengsel Ute uten nett: jobben virker og synkroniserer når dekningen er tilbake" } as const;

/** /kundeportal (iPhone-bildene k03–k08 og portal-* er telefonformat; d2a–d11 er PC-format og står på Studio Display) */
export const PORTAL_IPHONE: Steg[] = [
  ["vis/skjermbilder/kundeportal-k03.webp", "Tilbud", "Kundeportalen på iPhone: tilbudet"],
  ["vis/skjermbilder/kundeportal-k06.webp", "Valg", "Kundeportalen på iPhone: kundens valg"],
  ["vis/skjermbilder/kundeportal-k08.webp", "Bestilt", "Kundeportalen på iPhone: bestillingen"],
  ["vis/skjermbilder/portal-montering.webp", "Montering", "Kundeportalen på iPhone: monteringen"],
  ["vis/skjermbilder/portal-fdv.webp", "FDV", "Kundeportalen på iPhone: FDV-dokumentene"],
];
export const PORTAL_DISPLAY: Steg[] = [
  ["vis/skjermbilder/kundeportal-pc.webp", "Portalen", "Kundeportalen på Studio Display"],
  ["vis/skjermbilder/d2a-signer-med-bankid.webp", "Signer", "Kunden signerer med BankID"],
  ["vis/skjermbilder/d2b-signert.webp", "Signert", "Tilbudet er signert"],
  ["vis/skjermbilder/d10-sendt-til-kunden.webp", "Sendt", "Dokumentet er sendt til kunden"],
  ["vis/skjermbilder/d11-min-side-nytt.webp", "Min side", "Kundens Min side med nytt dokument"],
];

/** /for-butikkleder */
export const LEDER_DISPLAY: Steg[] = [
  ["vis/skjermbilder/crm-resultater.webp", "Resultater", "Hengsel CRM: resultater"],
  ["vis/skjermbilder/crm-salgstavla.webp", "Salgstavla", "Hengsel CRM: salgstavla"],
  ["vis/skjermbilder/crm-moduler.webp", "Moduler", "Hengsel CRM: moduler"],
  ["vis/skjermbilder/crm-samtaler.webp", "Samtaler", "Hengsel CRM: samtaler"],
];
export const LEDER_IPAD: Steg[] = [
  ["vis/skjermbilder/crm-ipad-leder.webp", "Leder", "Hengsel CRM på iPad: ledervisning"],
  ["vis/skjermbilder/crm-ipad-innstillinger.webp", "Innstillinger", "Hengsel CRM på iPad: innstillinger"],
];

/** slik virker det (Sigdal-utgaven): dokumentflyten */
export const DOKUMENTFLYT: Steg[] = [
  ["vis/skjermbilder/d1-lag-pdf-og-send.webp", "Tilbud", "Lag PDF og send tilbudet"],
  ["vis/skjermbilder/d3-send-ordrebekreftelse.webp", "Ordrebekreftelse", "Send ordrebekreftelse"],
  ["vis/skjermbilder/d5-lag-monteringsrapport.webp", "Monteringsrapport", "Lag monteringsrapport"],
  ["vis/skjermbilder/d7-lag-leveringspakke-fdv.webp", "Leveringspakke", "Lag leveringspakke med FDV"],
  ["vis/skjermbilder/d9-lag-faktura.webp", "Faktura", "Lag faktura"],
];

/** Stillrammer: PC og iPhone side om side (priser-og-demo og kunder) */
export const STILL_PRISER = {
  display: { bilde: "vis/skjermbilder/crm-tilbud.webp", alt: "Hengsel CRM: tilbudet til kunden" },
  iphone: { bilde: "vis/skjermbilder/crm-tlf-ordre.webp", alt: "Hengsel CRM på iPhone: ordren" },
} as const;
export const STILL_KUNDER = {
  display: { bilde: "vis/skjermbilder/crm-salgstavla.webp", alt: "Hengsel CRM: salgstavla" },
  iphone: { bilde: "vis/skjermbilder/crm-tlf-min-dag.webp", alt: "Hengsel CRM på iPhone: Min dag" },
} as const;
