/**
 * K-233: bildedomenet for skjermbildebiblioteket (K-228 i hengsel-crm) og lista over kjente mangler. Selve oppskriften (BILDEDOMENE, manifestet,
 * plassholderen) ligger i packages/hengsel-tokens/skjermbilder.mjs og brukes av sidene; skriptene og testene importerer herfra.
 */
export { BILDEDOMENE, MANIFEST_FIL, PLASSHOLDER, TEMAER, bildeUrl, finnes, lesManifest, oppdaterManifest, plassholderHtml, skjermbilde, skjermbildeNokkel } from "../../packages/hengsel-tokens/skjermbilder.mjs";

/**
 * Kjente mangler (claude/k228-rapport.md i hengsel-crm, punkt 6, samme 61 stier som claude/k228/kjente-mangler.json uten de mørke CRM-utgavene):
 * sider som fortsatt får vise «Skjermbilde kommer» for disse bildene. Nøkkelen er stien i biblioteket uten tema, -lys/-mork, @1x og .webp
 * (skjermbildeNokkel). Fjern linjer etter hvert som bildene kommer i manifestet; scripts/skjermbilder-bibliotek.test.mjs sier fra om en nøkkel her finnes.
 */
export const KJENTE_MANGLER = [
  // Kundeportalen: inngang med engangskode på e-post/SMS (ikke automatisert ennå), og komposisjonene som bygger på den
  "vis/skjermbilder/kundeportal-k03", "vis/skjermbilder/kundeportal-k06", "vis/skjermbilder/kundeportal-k08", "vis/skjermbilder/kundeportal-pc",
  "vis/skjermbilder/portal-tilbud", "vis/skjermbilder/portal-levering", "vis/skjermbilder/portal-montering", "vis/skjermbilder/portal-fdv",
  "vis/skjermbilder/d2a-signer-med-bankid", "vis/skjermbilder/d11-min-side-nytt",
  "vis/rom-kunde", "vis/rom-minside", "vis/forsta-kunde", "vis/flate-kunden",
  // PDF-sidene og A4-arkene: PDF-visningen tegnes ikke i headless Chromium, og arkene er PDF-er; dokumentforsiden er en PDF-gjengivelse
  "vis/skjermbilder/d1-lag-pdf-og-send", "vis/skjermbilder/d4-lag-tilvalgsliste",
  ...["d1", "d2a", "d2b", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "d11"].map((d) => `vis/skjermbilder/dok-${d}`),
  "dok-forside",
  // iOS-appen (tas på Mac, kilde xcode) til første opplasting
  "app/idag", "app/jobben", "app/ks", "app/punkter", "app/avvik", "app/ferdig", "app/uten-nett", "app/ipad-idag", "app/ipad-bildeverktoy-laser",
  // Hengsel Ute, k119-flyten (bildeverktøy, punkter, laser, typeskilt) stopper i montørappens test; rettes der
  "vis/skjermbilder/ute-ks-kamera", "vis/skjermbilder/ute-punkter", "vis/skjermbilder/ute-punktkort", "vis/skjermbilder/ute-typeskilt",
  "vis/skjermbilder/ute-laser", "vis/skjermbilder/ute-ipad-bildeverktoy", "vis/rom-tegning",
  // «Mål og skisser» er ikke en fane på ordresiden i CRM Demo (C01 avklares)
  "vis/skjermbilder/crm-mal-skisser", "vis/skjermbilder/mb-crm-mal-skisser",
  // E-postvarselet er ikke en skjerm (gjengis fra emailTemplate.ts senere)
  "vis/skjermbilder/d12-e-postvarsel",
  // Rommene uten app-skjermbilde: rommet selv i Studio Display (nettsidenes scripts/skjermbilder-vis.mjs) til de er lastet opp i biblioteket
  ...["dokumenter", "gevinst", "hvitevarer", "kontroll", "leder", "leverandor", "levprov", "montasjeplan", "opplaering", "prosjekt", "sv", "system", "veikart"].map((r) => `vis/rom-${r}`),
];
