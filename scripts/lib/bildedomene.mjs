/**
 * K-233: bildedomenet for skjermbildebiblioteket (K-228 i hengsel-crm) og lista over kjente mangler. Selve oppskriften (BILDEDOMENE, manifestet,
 * plassholderen) ligger i packages/hengsel-tokens/skjermbilder.mjs og brukes av sidene; skriptene og testene importerer herfra.
 */
export { BILDEDOMENE, LOKALE_BILDER, MANIFEST_FIL, PLASSHOLDER, TEMAER, bildeUrl, erLokal, finnes, lesManifest, lokalUrl, oppdaterManifest, plassholderHtml, skjermbilde, skjermbildeNokkel } from "../../packages/hengsel-tokens/skjermbilder.mjs";

/**
 * Kjente mangler (claude/k228-rapport.md i hengsel-crm, punkt 6; de 47 stiene i claude/k228/kjente-mangler.json som skal komme i biblioteket, uten de
 * mørke CRM-utgavene og uten nettsidenes egne bilder i LOKALE_BILDER): sider som fortsatt får vise «Skjermbilde kommer» for disse bildene. Nøkkelen
 * er stien i biblioteket uten tema, -lys/-mork, @1x og .webp (skjermbildeNokkel). Fjern linjer etter hvert som bildene kommer i manifestet;
 * scripts/skjermbilder-bibliotek.test.mjs sier fra om en nøkkel her finnes. I Sigdal-utgavene godtas også LOKALE_BILDER som plassholder (K-223).
 */
export const KJENTE_MANGLER = [
  // Kundeportalen: tilbud og levering i portalen tas ikke i Visning ennå; rommene uten app-skjermbilde
  "vis/skjermbilder/portal-tilbud", "vis/skjermbilder/portal-levering",
  "vis/rom-kunde", "vis/forsta-kunde", "vis/flate-kunden",
  // Tilvalgslista (d4) trenger et tilvalgstilbud på en leilighet i seed (K-316-funn)
  "vis/skjermbilder/d4-lag-tilvalgsliste",
  // «Mål og skisser» er ikke en fane på ordresiden i CRM Demo (C01 avklares)
  "vis/skjermbilder/crm-mal-skisser", "vis/skjermbilder/mb-crm-mal-skisser",
  // 17.10 (K-316 kjøring 18, 458 filer i biblioteket): kundeportal-k03/k06/k08/pc, portal-montering, portal-fdv, d2a-signer-med-bankid,
  // d11-min-side-nytt, rom-minside, d1-lag-pdf-og-send, dok-d1…d11 og d12-e-postvarsel er i biblioteket og tatt ut av lista.
  // N-8: tas av K-228b (390 px) i hengsel-crm
  "telefon/crm-min-dag", "telefon/crm-kunder", "telefon/crm-ordre", "telefon/crm-saker", "telefon/crm-mer", "telefon/portal-tilbud", "telefon/portal-levering",
  "vis/skjermbilder/crm-tilbud-telefon", "vis/skjermbilder/crm-tilbud-kunde-telefon", "vis/skjermbilder/crm-ordre-kontrollmal-telefon", "vis/skjermbilder/crm-montasje-telefon", "vis/skjermbilder/crm-etterkalkyle-telefon",
  // Rommene uten app-skjermbilde (rommet selv i Studio Display) og dokumentforsiden er nettsidenes egne bilder: LOKALE_BILDER, aldri i biblioteket
];
