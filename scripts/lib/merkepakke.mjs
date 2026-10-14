/**
 * K-231: hva som hentes fra merkepakke v2 (design/handoff/hengsel_merke_v2) og hvor det legges. Brukes av scripts/hent-merkepakke.mjs og scripts/merkepakke.test.mjs.
 */
// 1. Til designsystemmappa. [mappe i pakken, mål under ds/assets, mønster for filsti relativt til mappa]
export const TIL_DS = [
  ["5-logoer-ikoner", "logo", /^(levert-av|sendt-med)-hengsel-[a-z]+\.svg$/],
  ["5-logoer-ikoner", "logo/png", /^(levert-av|sendt-med)-hengsel-[a-z]+(-\dx)?\.png$/],
  ["5-logoer-ikoner", "favicon", /^(favicon-flis(-\d+)?\.(png|svg)|favicon\.ico)$/],
  ["5-logoer-ikoner/ikoner", "ikoner", /./],
  ["1-motion", "motion", /./],
  ["2-deling", "deling", /./],
  ["3-butikk", "butikk", /./],
  ["4-pwa-appikon/pwa", "pwa", /./],
  ["4-pwa-appikon/expo", "app-ikon/expo", /./],
  ["4-pwa-appikon/android", "app-ikon/android", /./],
];

// 2. Utplassering til sidene: [fil i pakken, mål]. Fra pakken, aldri fra ds, så kilden er entydig.
const P5 = "5-logoer-ikoner/", P1 = "1-motion/", P2 = "2-deling/", P6 = "6-sigdal/";
const FLIS = ["favicon.ico", "favicon-flis.svg", "favicon-flis-16.png", "favicon-flis-32.png", "favicon-flis-48.png"];
export const UTPLASSERT = [
  // Favicon med hvit flis på alle Hengsel-sidene (vis bygger fra src/ til dist/)
  ...["sites/hengsel/public", "sites/vis/src", "sites/design/public", "sites/admin/public"].flatMap((m) => FLIS.map((f) => [P5 + f, `${m}/${f}`])),
  // Motion på hengsel.no (Ute): 1080 × 1080 og 1080 × 1920, MP4, WebM og plakat
  ...["1080x1080", "1080x1920"].flatMap((s) => ["-plakat.png", ".mp4", ".webm"].map((e) => [`${P1}ute-motion-${s}${e}`, `sites/hengsel/public/media/ute-motion-${s}${e}`])),
  // Delingsbilder (og:image)
  [`${P2}og-hengsel-no.png`, "sites/hengsel/public/og-hengsel-no.png"],
  [`${P2}og-apptest.png`, "sites/hengsel/public/og-apptest.png"],
  [`${P2}og-kunde.png`, "sites/hengsel/public/og-kunde.png"],
  [`${P2}og-vis-hengsel-no.png`, "sites/vis/src/og-vis-hengsel-no.png"],
  // «Levert av Hengsel» (lys) i kundeportal-mocken (hengsel.no) og Visningsrommet
  [`${P5}levert-av-hengsel-lys.svg`, "sites/hengsel/public/logo/levert-av-hengsel-lys.svg"],
  [`${P5}levert-av-hengsel-lys.svg`, "sites/vis/src/assets/logo/levert-av-hengsel-lys.svg"],
  // Sigdal: «Sigdal CRM · levert av Hengsel» (hele merket i én farge) på hengsel.no/sigdal og som kundemerke-eksempel på design.hengsel.no.
  // PNG, ikke SVG: SVG-ene i pakken har et tomt <image> (selve Sigdal-logoen er ikke lagt inn), så de gjengir bare «CRM · levert av Hengsel». PNG-ene er riktige.
  ...["warm-black", "off-white"].flatMap((v) => ["", "-2x", "-3x"].map((x) => [`${P6}sigdal-crm-levert-av-hengsel-${v}${x}.png`, `sites/hengsel/public/sigdal/logo/sigdal-crm-levert-av-hengsel-${v}${x}.png`])),
  ...["warm-black", "off-white"].flatMap((v) => ["", "-2x"].map((x) => [`${P6}sigdal-crm-levert-av-hengsel-${v}${x}.png`, `sites/design/public/merke/sigdal-crm-levert-av-hengsel-${v}${x}.png`])),
];
