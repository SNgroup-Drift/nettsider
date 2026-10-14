#!/usr/bin/env node
/**
 * Bygger Visningsrommet: kopierer src/ til dist/, legger de delte Hengsel-variablene og de pinnede skriftene i dist/assets/ og SN-logoen
 * (fra sites/sngroup/public) i dist/img/, setter inn Hengsel-logoen (src/assets/logo) der det står <!--logo-hengsel N-->, og lenker alle
 * app-skjermbildene fra biblioteket på bilder.hengsel.no (K-233): <img data-bibliotek="vis/hero.webp"> i HTML, b:'rom-reise' i assets/rom.js og
 * data-bilder="navn,…" i rommene får adresse og mål (width/height) fra manifest.json; bilder som ikke står i manifestet, blir plassholderen
 * «Skjermbilde kommer» (data-skjermbilde="<nøkkel>"). VIS_TEMA=sigdal gir Sigdal-utgaven (scripts/bygg-sigdal-vis.mjs); SKJERMBILDER_MANIFEST=kopi
 * hopper over hentingen av manifest.json og bruker kopien i repoet.
 *
 * Variabler og skrifter kommer fra packages/hengsel-tokens (tokens.css, fonts.css og ds/assets/fonts/*.woff2): Schibsted Grotesk, selvhostet
 * (CSP: font-src 'self'). Ingen @fontsource, ingen Google Fonts.
 *
 * Ingen avhengigheter utover Node. Kjør fra rotmappen: npm run build -w sites/vis
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { a4Ark, a4Stil, dokumentvisningHtml } from "./dokumenter.mjs";
import { PLASSHOLDER, TEMAER, lesManifest, oppdaterManifest, skjermbilde, skjermbildeNokkel } from "../../packages/hengsel-tokens/skjermbilder.mjs";

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
  if (f !== "schibsted-grotesk-latin-wght-normal.woff2") continue; // bare Hengsel-skriften (samme som fonts.css)
  await cp(join(tokens, "ds", "assets", "fonts", f), join(dist, "assets", "ds", "assets", "fonts", f));
  antall++;
}

// K-233: app-skjermbildene lenkes fra biblioteket (packages/hengsel-tokens/skjermbilder.mjs) i temaet VIS_TEMA. Ingen bilder lastes ned ved bygging;
// bare manifest.json leses, og bygget feiler ikke om biblioteket er nede (kopien i repoet brukes). SN-logoen hentes fra sngroup.no som før.
const tema = process.env.VIS_TEMA ?? "hengsel";
if (!TEMAER.includes(tema)) throw new Error(`VIS_TEMA må være ${TEMAER.join(" eller ")}, ikke «${tema}»`);
const manifest = process.env.SKJERMBILDER_MANIFEST === "kopi" ? lesManifest() : await oppdaterManifest();
const bilde = (sti, hd = false) => skjermbilde(tema, sti, { hd, manifest });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const plassholder = (sti, navn, klasse = "") =>
  `<figure class="${[klasse, "plassholder"].filter(Boolean).join(" ")}" data-skjermbilde="${esc(skjermbildeNokkel(sti))}" role="img" aria-label="${esc(PLASSHOLDER)}: ${esc(navn)}"><b>${PLASSHOLDER}</b><span>${esc(navn)}</span></figure>`;
const sites = join(her, "..");
// Dokumentene (K-161): CSS og skript deles med hengsel.no fra packages/hengsel-dokumenter/src. Forsidebildet på A4-arkene (1200 × 768) kommer fra
// biblioteket (dokumenter.mjs), og selve arkene lages av de felles dataene, så det ikke finnes dokumentbilder å holde i synk.
const dokKilde = join(her, "..", "..", "packages", "hengsel-dokumenter", "src");
await mkdir(join(dist, "assets", "dokumenter"), { recursive: true });
for (const fil of ["a4.css", "dokumentvisning.css", "dokumentvisning.js"]) await cp(join(dokKilde, fil), join(dist, "assets", "dokumenter", fil));
const img = join(dist, "img");
await mkdir(img, { recursive: true });
await cp(join(sites, "sngroup", "public", "logo.svg"), join(img, "sn-logo.svg"));

// Merket (palettpakke v2 og merkepakke v2) der det står <!--logo-hengsel 28--> (tallet er høyden i px). Skjemaet kan stå etter tallet:
// <!--logo-hengsel 24 crm--> (crm, hengsel-crm, levert-av). Uten skjema brukes «Hengsel» (symbol + navn). Utgaven er aksent, lys utgave (levert-av: levert-av-hengsel-lys fra merkepakke v2) (bare lys modus). SVG-ene er brukt som de er: aldri strekk, farger eller effekter.
const LOGOER = {
  hengsel: { fil: "hengsel-aksent", alt: "Hengsel", b: 422, h: 100 },
  crm: { fil: "hengsel-crm-aksent", alt: "Hengsel CRM", b: 622, h: 100 },
  "hengsel-crm": { fil: "hengsel-crm-aksent", alt: "Hengsel CRM", b: 622, h: 100 },
  "levert-av": { fil: "levert-av-hengsel", alt: "Levert av Hengsel", b: 254, h: 40 },
};
function hengselLogo(size, skjema = "hengsel") {
  const l = LOGOER[skjema];
  if (!l) throw new Error(`Ukjent logoskjema «${skjema}» i <!--logo-hengsel ${size} ${skjema}-->`);
  return `<span class="hlogo" style="--h:${size}px">` +
    `<img src="/assets/logo/${l.fil}-lys.svg" alt="${l.alt}" width="${l.b}" height="${l.h}"></span>`;
}
// Menyen øverst (K-229): Forstå, Prøv, Dokumenter og Presenter er egne sider. <!--meny prov--> setter aria-current="page" på den aktive.
// Gruppesidene (butikken, montoren, kunden, leverandoren) ligger under Prøv og bruker <!--meny prov-->; oversiktssiden /rom/ bruker <!--meny-->.
const MENY = [["forsta", "Forstå"], ["prov", "Prøv"], ["dokumenter", "Dokumenter"], ["presenter", "Presenter"]];
function menyHtml(aktiv, under) {
  const lenker = MENY.map(([id, navn]) => {
    const her = id === aktiv ? (under ? ' aria-current="true"' : ' aria-current="page"') : "";
    return `<a href="/${id}/"${her}>${navn}</a>`;
  });
  return lenker.join("") + `<a class="crm" href="/crm/">Logg inn på CRM</a>`;
}
// «Prøv i demoen» (K-229): rommene som bare viser skjermer har en lenke til riktig sted i demo.hengsel.no. Stedene står i demo-lenker.json.
const DEMO = JSON.parse(await readFile(join(her, "demo-lenker.json"), "utf8"));
function demoLenke(rom) {
  const sti = DEMO.rom[rom];
  if (typeof sti !== "string" || !sti.startsWith("/")) throw new Error(`demo-lenker.json: ${rom} har ingen sti`);
  return `<p class="demo-lenke"><a class="btn primary" href="${DEMO.adresse}${sti}" target="_blank" rel="noopener" data-demo="${rom}">${DEMO.tekst} ›</a></p>`;
}
// Bunnen (samme på alle sidene med toppfelt)
const BUNN = (await readFile(join(her, "bunn.html"), "utf8")).trim();
let sider = 0;
async function settInnLogo(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const sti = join(dir, e.name);
    if (e.isDirectory()) await settInnLogo(sti);
    else if (e.name.endsWith(".html")) {
      const tekst = await readFile(sti, "utf8");
      const ny = tekst
        .replace("<!--bunn-->", () => BUNN)
        .replace(/<!--prov-demo ([a-z]+)-->/, (_, rom) => demoLenke(rom))
        .replace(/<!--meny(?: ([a-z]+))?(?: (under))?-->/, (_, aktiv, under) => menyHtml(aktiv, under))
        .replaceAll("%TEMAFARGE%", palett.farge["flate-side"].lys)
        .replace(/<!--logo-hengsel (\d+)(?: ([a-z-]+))?-->/g, (_, n, f) => hengselLogo(Number(n), f))
        .replace("<!--dokumentvisning-->", () => dokumentvisningHtml())
        .replace("<!--a4-stil-->", () => a4Stil())
        .replace(/<!--a4-ark:([a-z]+):(\d+):([^>]*?)-->/g, (_, id, side, tittel) => a4Ark(id, Number(side), tittel));
      if (ny !== tekst) { await writeFile(sti, ny); sider++; }
    }
  }
}
await settInnLogo(dist);

// Bildene fra biblioteket, med mål fra manifest.json (width og height, så ingenting hopper):
//  - <img data-bibliotek="vis/<navn>.webp"> i HTML (hero, flater, Forstå-kortene) får src, width og height, eller blir plassholderen
//  - rom.js: kortene lages av skript; BILDER får adresse og mål per b:'rom-<navn>' (null = plassholder)
//  - bilder.js: skjermene i rammene (data-bilder) byttes av skript; SKJERM får 2×- og 1×-adresse og mål per navn (null = plassholder), og HTML-en får
//    en skjult plassholder per navn som mangler, så den bygde siden viser hvilke bilder som venter (scripts/skjermbilder-bibliotek.test.mjs)
async function fyll(fil, markor, kart) {
  const sti = join(dist, fil);
  const tekst = await readFile(sti, "utf8");
  const re = new RegExp(`/\\*${markor}\\*/\\{\\}/\\*${markor}-slutt\\*/`);
  if (!re.test(tekst)) throw new Error(`${fil}: fant ikke markøren /*${markor}*/{}/*${markor}-slutt*/`);
  await writeFile(sti, tekst.replace(re, `/*${markor}*/${JSON.stringify(kart)}/*${markor}-slutt*/`));
}
const romJs = await readFile(join(dist, "assets", "rom.js"), "utf8");
const romBilder = {};
for (const m of romJs.matchAll(/\bb:'([a-z0-9-]+)'/g)) {
  const b = bilde(`vis/${m[1]}.webp`);
  romBilder[m[1]] = b ? { u: b.url, b: b.bredde, h: b.hoyde } : null;
}
await fyll("assets/rom.js", "BILDER", romBilder);
const skjermer = {};
let plassholdere = 0;
let lenket = 0;
async function bilderIHtml(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const sti = join(dir, e.name);
    if (e.isDirectory()) await bilderIHtml(sti);
    else if (e.name.endsWith(".html")) {
      const tekst = await readFile(sti, "utf8");
      let ny = tekst.replace(/<img\b([^>]*?)\sdata-bibliotek="([^"]+)"([^>]*?)>/g, (m, a, navn, c) => {
        const alt = /\balt="([^"]*)"/.exec(m)?.[1] ?? "";
        const b = bilde(navn);
        if (!b) { plassholdere++; return plassholder(navn, alt, /\bclass="([^"]*)"/.exec(m)?.[1] ?? ""); }
        lenket++;
        return `<img${a} src="${b.url}" width="${b.bredde}" height="${b.hoyde}"${c}>`;
      });
      // Rammene: data-bilder="navn,…" med <div class="skjerm"> inni; en skjult plassholder per navn som mangler
      ny = ny.replace(/(<[a-z]+\b[^>]*\sdata-bilder="([^"]+)"[^>]*>)([\s\S]*?<div class="(?:[^"]*\s)?skjerm(?:\s[^"]*)?">)/g, (m, start, liste, resten) => {
        const mangler = [];
        for (const navn of liste.split(",").map((s) => s.trim()).filter(Boolean)) {
          if (!(navn in skjermer)) {
            const b = bilde(`vis/skjermbilder/${navn}.webp`, true);
            skjermer[navn] = b ? { u: b.url, u1: b.x1?.url, b: b.bredde, h: b.hoyde } : null;
          }
          if (!skjermer[navn]) mangler.push(navn);
        }
        plassholdere += mangler.length;
        lenket += liste.split(",").length - mangler.length;
        return start + resten + mangler.map((navn) => plassholder(`vis/skjermbilder/${navn}`, navn).replace("<figure ", "<figure hidden ")).join("");
      });
      if (ny !== tekst) await writeFile(sti, ny);
    }
  }
}
await bilderIHtml(dist);
await fyll("assets/bilder.js", "SKJERM", skjermer);
console.log(`vis (${tema}): src/ kopiert til dist/, ${antall} skriftfiler i dist/assets/ds/assets/fonts/, Hengsel-logoen på ${sider} sider, ${lenket + Object.keys(romBilder).length} bilder lenket fra biblioteket, ${plassholdere + Object.values(romBilder).filter((b) => !b).length} plassholdere`);
