#!/usr/bin/env node
/**
 * Bygger Visningsrommet: kopierer src/ til dist/, legger de delte Hengsel-variablene og de pinnede skriftene i dist/assets/, skjermbildene
 * (fra sites/hengsel/public/img) og SN-logoen (fra sites/sngroup/public) i dist/img/, og setter inn Hengsel-logoen
 * (src/assets/logo) der det står <!--logo-hengsel N-->.
 *
 * Variabler og skrifter kommer fra packages/hengsel-tokens (tokens.css, fonts.css og ds/assets/fonts/*.woff2): Inter og Newsreader, selvhostet
 * (CSP: font-src 'self'). Ingen @fontsource, ingen Google Fonts.
 *
 * Ingen avhengigheter utover Node. Kjør fra rotmappen: npm run build -w sites/vis
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { a4Ark, a4Stil, dokumentvisningHtml } from "./dokumenter.mjs";
import sharp from "sharp";

const her = import.meta.dirname;
const src = join(her, "src");
const dist = process.env.VIS_DIST ?? join(her, "dist"); // VIS_DIST: bygg til en annen mappe (f.eks. for parallelle sjekker)
const require = createRequire(import.meta.url);

const tokens = join(her, "..", "..", "packages", "hengsel-tokens");
const palett = JSON.parse(await readFile(join(tokens, "ds", "tokens", "hengsel.tokens.json"), "utf8"));

await rm(dist, { recursive: true, force: true });
await cp(src, dist, { recursive: true });

// Delte Hengsel-variabler og pinnede skrifter (tokens.css, fonts.css + ds/assets/fonts/*.woff2). fonts.css bruker url('./ds/assets/fonts/…'),
// så skriftfilene legges i dist/assets/ds/assets/fonts/ ved siden av hengsel-fonts.css.
await mkdir(join(dist, "assets", "ds", "assets", "fonts"), { recursive: true });
await cp(join(tokens, "tokens.css"), join(dist, "assets", "hengsel-tokens.css"));
await cp(join(tokens, "fonts.css"), join(dist, "assets", "hengsel-fonts.css"));
let antall = 0;
for (const f of await readdir(join(tokens, "ds", "assets", "fonts"))) {
  if (!f.endsWith(".woff2")) continue;
  await cp(join(tokens, "ds", "assets", "fonts", f), join(dist, "assets", "ds", "assets", "fonts", f));
  antall++;
}

// Romkortbildene (src/img/rom-*.webp, lages av scripts/skjermbilder-vis.mjs) ligger i src/img og er alt kopiert.
// Andre skjermbilder hentes fra hengsel.no og SN-logoen fra sngroup.no, så de ikke ligger dobbelt i repoet.
const sites = join(her, "..");
// Dokumentene (K-161): CSS og skript deles med hengsel.no fra packages/hengsel-dokumenter/src. Forsidebildet på A4-arkene (1200 × 768) hentes
// fra hengsel.no, og selve arkene lages av de felles dataene (dokumenter.mjs), så det ikke finnes dokumentbilder å holde i synk.
const dokKilde = join(her, "..", "..", "packages", "hengsel-dokumenter", "src");
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

// Merket (merkepakken i brand/, fasit 12.10.2026) der det står <!--logo-hengsel 28--> (tallet er høyden i px). Skjemaet kan stå etter tallet:
// <!--logo-hengsel 24 crm--> (crm, hengsel-crm, levert-av). Uten skjema brukes «Hengsel» (symbol + navn). Utgaven er aksent, lys utgave (bare lys modus). SVG-ene er brukt som de er: aldri strekk, farger eller effekter.
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
    `<img src="/assets/logo/${l.fil}-lys.svg" alt="${l.alt}" width="${l.b}" height="108"></span>`;
}
let sider = 0;
async function settInnLogo(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const sti = join(dir, e.name);
    if (e.isDirectory()) await settInnLogo(sti);
    else if (e.name.endsWith(".html")) {
      const tekst = await readFile(sti, "utf8");
      const ny = tekst
        .replaceAll("%TEMAFARGE%", palett.palett["off-white"])
        .replace(/<!--logo-hengsel (\d+)(?: ([a-z-]+))?-->/g, (_, n, f) => hengselLogo(Number(n), f))
        .replace("<!--dokumentvisning-->", () => dokumentvisningHtml())
        .replace("<!--a4-stil-->", () => a4Stil())
        .replace(/<!--a4-ark:([a-z]+):(\d+):([^>]*?)-->/g, (_, id, side, tittel) => a4Ark(id, Number(side), tittel));
      if (ny !== tekst) { await writeFile(sti, ny); sider++; }
    }
  }
}
await settInnLogo(dist);

// Mål på bildene (width og height, så ingenting hopper): img/*.webp (romkort, flater, hero) og skjermbilder/<navn>.webp (2×).
// Settes inn i HTML (<img src="/img/…"> uten mål), i rom.js (kortene lages av skript) og i bilder.js (skjermene byttes av skript).
async function maal(mappe, filtrer) {
  const kart = {};
  for (const f of await readdir(join(dist, mappe))) {
    if (!f.endsWith(".webp") || !filtrer(f)) continue;
    const m = await sharp(join(dist, mappe, f)).metadata();
    kart[f.replace(/\.webp$/, "")] = [m.width, m.height];
  }
  return kart;
}
const imgMal = await maal("img", () => true);
const skjermMal = await maal("skjermbilder", (f) => !/(@1x|-mork)\.webp$/.test(f));
async function fyll(fil, markor, kart) {
  const sti = join(dist, fil);
  const tekst = await readFile(sti, "utf8");
  await writeFile(sti, tekst.replace(new RegExp(`/\\*${markor}\\*/\\{\\}/\\*${markor}-slutt\\*/`), `/*${markor}*/${JSON.stringify(kart)}/*${markor}-slutt*/`));
}
await fyll("assets/rom.js", "IMGMAL", imgMal);
await fyll("assets/bilder.js", "SKJERMMAL", skjermMal);
async function malIHtml(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const sti = join(dir, e.name);
    if (e.isDirectory()) await malIHtml(sti);
    else if (e.name.endsWith(".html")) {
      const tekst = await readFile(sti, "utf8");
      const ny = tekst.replace(/<img ([^>]*?)src="\/img\/([\w-]+)\.webp"([^>]*?)>/g, (m, a, navn, b) => {
        if (/\bwidth=/.test(m) || !imgMal[navn]) return m;
        return `<img ${a}src="/img/${navn}.webp" width="${imgMal[navn][0]}" height="${imgMal[navn][1]}"${b}>`;
      });
      if (ny !== tekst) await writeFile(sti, ny);
    }
  }
}
await malIHtml(dist);
console.log(`vis: src/ kopiert til dist/, ${antall} skriftfiler i dist/assets/ds/assets/fonts/, ${bilder.length} bilder i dist/img/, Hengsel-logoen på ${sider} sider`);
