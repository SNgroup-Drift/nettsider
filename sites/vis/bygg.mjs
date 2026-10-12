#!/usr/bin/env node
/**
 * Bygger Visningsrommet: kopierer src/ til dist/, legger de selvhostede skriftene i dist/fonts/, skjermbildene
 * (fra sites/hengsel/public/img) og SN-logoen (fra sites/sngroup/public) i dist/img/, og setter inn Hengsel-logoen
 * (src/assets/logo) der det står <!--logo-hengsel N-->.
 *
 * Skriftene er de samme som i designpakken (packages/design/src/styles/fonts.css): Newsreader (vanlig og kursiv) og
 * Inter fra @fontsource-variable. dist/fonts/fonts.css får familienavnene «Newsreader» og «Inter», så stilene i sidene
 * virker uten endringer. Ingen Google Fonts.
 *
 * Ingen avhengigheter utover Node. Kjør fra rotmappen: npm run build -w sites/vis
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { a4Ark, a4Stil, dokumentvisningHtml } from "./dokumenter.mjs";

const her = import.meta.dirname;
const src = join(her, "src");
const dist = process.env.VIS_DIST ?? join(her, "dist"); // VIS_DIST: bygg til en annen mappe (f.eks. for parallelle sjekker)
const require = createRequire(import.meta.url);

const skrifter = [
  { pakke: "@fontsource-variable/newsreader", css: ["wght.css", "wght-italic.css"], fra: "Newsreader Variable", til: "Newsreader" },
  { pakke: "@fontsource-variable/inter", css: ["wght.css"], fra: "Inter Variable", til: "Inter" },
];

await rm(dist, { recursive: true, force: true });
await cp(src, dist, { recursive: true });

const fonts = join(dist, "fonts");
try {
  await stat(fonts);
  throw new Error("src/fonts finnes allerede; bygget legger skriftene der. Gi mappen et annet navn.");
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
await mkdir(fonts);

let css = "/* Selvhostede skrifter fra @fontsource-variable (samme som packages/design). Lages av bygg.mjs. */\n";
let antall = 0;
for (const s of skrifter) {
  const rotPakke = dirname(require.resolve(`${s.pakke}/package.json`));
  for (const fil of s.css) {
    let tekst = await readFile(join(rotPakke, fil), "utf8");
    for (const [, navn] of tekst.matchAll(/url\(\.\/files\/([^)]+)\)/g)) {
      await cp(join(rotPakke, "files", navn), join(fonts, navn));
      antall++;
    }
    tekst = tekst.replaceAll("url(./files/", "url(/fonts/").replaceAll(`'${s.fra}'`, `'${s.til}'`);
    css += `\n${tekst.trim()}\n`;
  }
}
await writeFile(join(fonts, "fonts.css"), css);

// Romkortbildene (src/img/rom-*.webp, lages av scripts/skjermbilder-vis.mjs) ligger i src/img og er alt kopiert.
// Andre skjermbilder hentes fra hengsel.no og SN-logoen fra sngroup.no, så de ikke ligger dobbelt i repoet.
const sites = join(her, "..");
// Dokumentene (K-161): CSS og skript deles med hengsel.no fra packages/design/src/dokumenter. Forsidebildet på A4-arkene (1200 × 768) hentes
// fra hengsel.no, og selve arkene lages av de felles dataene (dokumenter.mjs), så det ikke finnes dokumentbilder å holde i synk.
const dokKilde = join(her, "..", "..", "packages", "design", "src", "dokumenter");
await mkdir(join(dist, "assets", "dokumenter"), { recursive: true });
for (const fil of ["a4.css", "dokumentvisning.css", "dokumentvisning.js"]) await cp(join(dokKilde, fil), join(dist, "assets", "dokumenter", fil));
const img = join(dist, "img");
await mkdir(img, { recursive: true });
const forside = (await readFile(join(src, "index.html"), "utf8")) + (await readFile(join(src, "assets", "rom.js"), "utf8"));
const bilder = [...new Set([...forside.matchAll(/\/img\/([a-z0-9-]+\.(?:webp|svg))/g)].map((m) => m[1]))];
for (const navn of bilder) {
  if (navn.startsWith("sn-logo") || navn.startsWith("rom-")) continue;
  if (await stat(join(src, "img", navn)).catch(() => null)) continue;
  await cp(join(sites, "hengsel", "public", "img", navn), join(img, navn));
}
await mkdir(img, { recursive: true });
await cp(join(sites, "hengsel", "public", "img", "dok-forside.webp"), join(img, "dok-forside.webp"));
await cp(join(sites, "sngroup", "public", "logo.svg"), join(img, "sn-logo.svg"));
await cp(join(sites, "sngroup", "public", "logo-mork.svg"), join(img, "sn-logo-mork.svg"));

// Merket (merkepakken i brand/, fasit 12.10.2026) der det står <!--logo-hengsel 28--> (tallet er høyden i px). Skjemaet kan stå etter tallet:
// <!--logo-hengsel 24 crm--> (crm, hengsel-crm, levert-av). Uten skjema brukes «Hengsel» (symbol + navn). Utgaven er aksent: lys utgave på lys flate og
// mørk i mørk modus (byttes med CSS, .hlogo i vis.css). SVG-ene er brukt som de er: aldri strekk, farger eller effekter.
const LOGOER = {
  hengsel: { fil: "hengsel-aksent", alt: "Hengsel", b: 374 },
  crm: { fil: "crm-aksent", alt: "CRM", b: 270 },
  "hengsel-crm": { fil: "hengsel-crm-aksent", alt: "Hengsel CRM", b: 527 },
  "levert-av": { fil: "levert-av-aksent", alt: "Levert av Hengsel", b: 671 },
};
function hengselLogo(size, skjema = "hengsel") {
  const l = LOGOER[skjema];
  if (!l) throw new Error(`Ukjent logoskjema «${skjema}» i <!--logo-hengsel ${size} ${skjema}-->`);
  return `<span class="hlogo" style="--h:${size}px">` +
    `<img class="lys" src="/assets/logo/${l.fil}-lys.svg" alt="${l.alt}" width="${l.b}" height="108">` +
    `<img class="mork" src="/assets/logo/${l.fil}-mork.svg" alt="" width="${l.b}" height="108"></span>`;
}
let sider = 0;
async function settInnLogo(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const sti = join(dir, e.name);
    if (e.isDirectory()) await settInnLogo(sti);
    else if (e.name.endsWith(".html")) {
      const tekst = await readFile(sti, "utf8");
      const ny = tekst
        .replace(/<!--logo-hengsel (\d+)(?: ([a-z-]+))?-->/g, (_, n, f) => hengselLogo(Number(n), f))
        .replace("<!--dokumentvisning-->", () => dokumentvisningHtml())
        .replace("<!--a4-stil-->", () => a4Stil())
        .replace(/<!--a4-ark:([a-z]+):(\d+):([^>]*?)-->/g, (_, id, side, tittel) => a4Ark(id, Number(side), tittel));
      if (ny !== tekst) { await writeFile(sti, ny); sider++; }
    }
  }
}
await settInnLogo(dist);
console.log(`vis: src/ kopiert til dist/, ${antall} skriftfiler i dist/fonts/, ${bilder.length} bilder i dist/img/, Hengsel-logoen på ${sider} sider`);
