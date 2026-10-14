#!/usr/bin/env node
/**
 * K-192: sjekker reglene i docs/design/hengsel-regler.md for de fire Hengsel-sidene (hengsel.no, vis., design., admin.) og Hengsel-pakkene.
 *   node scripts/hengsel-regler.mjs            skriver alle brudd, exit 1 ved brudd
 *   node scripts/hengsel-regler.mjs sites/vis  bare ett område
 * Regel 2: ingen fargeverdi (hex, rgb/hsl/..., navngitt farge, Tailwind-fargeklasse) i noen fil utenfor den delte fila packages/hengsel-tokens/tokens.css.
 * Regel 4: ingen mørk modus (prefers-color-scheme, data-theme, .dark, color-scheme: dark, mørk-bryter, mørk theme-color).
 * Brukes av scripts/hengsel-regler.test.mjs.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export const rot = resolve(import.meta.dirname, "..");
export const OMRADER = ["sites/hengsel", "sites/vis", "sites/design", "sites/admin", "packages/hengsel-dokumenter", "packages/hengsel-tokens/src"];
const HOPP_MAPPER = new Set(["node_modules", "dist", ".astro", ".wrangler"]);
/** Mapper som er utenfor reglene, med grunn: public/ds er en kopi av den pinnede designsystemmappa (nedlastinger til appene og CRM-et, sha256-pinnet);
 *  fasit er den frittstående designfila fra Claude Design, bare til sammenlikning, den bygges ikke inn i noen side. */
const HOPP_STIER = ["sites/design/public/ds", "sites/vis/fasit"];
const TEKST = /\.(css|astro|ts|tsx|js|mjs|html|json|svg|webmanifest)$/;

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const alle = (dir) => readdirSync(dir).flatMap((e) => { const s = join(dir, e); return statSync(s).isDirectory() ? alle(s) : [s]; });

/** sha256 for merkefiler som er lov å ha fargeverdier: SVG-ene i den pinnede designsystemmappa (logoer, favicon, delingsbilder, butikkmaler, app-ikon) og i merkepakke v2
 *  (design/handoff/hengsel_merke_v2, også Sigdal-merket). De brukes som <img> og favicon og kan ikke bruke CSS-variabler; en kopi er lov bare når den er byte-identisk (K-231). */
export function merkefilSha() {
  const s = new Set();
  for (const mappe of ["packages/hengsel-tokens/ds/assets", "design/handoff/hengsel_merke_v2"]) for (const f of alle(join(rot, mappe))) if (f.endsWith(".svg")) s.add(sha(readFileSync(f)));
  return s;
}

/** K-223: Sigdal-paletten (hex fra packages/kundetema-sigdal/tokens.css), små bokstaver */
export function sigdalHex() {
  return new Set([...readFileSync(join(rot, "packages/kundetema-sigdal/tokens.css"), "utf8").matchAll(/--sigdal-[a-z0-9-]+:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => m[1].toLowerCase()));
}

/** K-223: kundens egen logofil (sites/hengsel/public/<kunde>/logo/*.svg) er lov å ha fargeverdier hvis alle er fra kundens palett (Warm Black for Sigdal) */
export function erKundelogo(fil, tekst) {
  if (!/sites\/hengsel\/public\/sigdal\/logo\/[^/]+\.svg$/.test(fil.split("\\").join("/"))) return false;
  const lov = sigdalHex();
  return [...tekst.matchAll(/#[0-9A-Fa-f]{6}\b/g)].every((m) => lov.has(m[0].toLowerCase()));
}

export function filer(omrader = OMRADER) {
  const ut = [];
  const gaa = (dir) => {
    for (const e of readdirSync(dir)) {
      if (HOPP_MAPPER.has(e)) continue;
      const s = join(dir, e);
      const rel = relative(rot, s);
      if (HOPP_STIER.some((h) => rel === h || rel.startsWith(h + "/"))) continue;
      if (statSync(s).isDirectory()) gaa(s);
      else if (TEKST.test(e)) ut.push(s);
    }
  };
  for (const o of omrader) { try { gaa(join(rot, o)); } catch {} }
  return ut;
}

const NAVN = "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgrey|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen";
const FARGEEGENSKAP = "(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|outline(?:-color)?|fill|stroke|stop-color|flood-color|lighting-color|caret-color|accent-color|text-decoration-color|column-rule-color|box-shadow|text-shadow)";

/** Mønstre for fargeverdier. Hver har et navn (for meldingen) og et regex. */
export const FARGEMONSTRE = [
  ["hex", /(?<![\w&#/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g],
  ["farge-funksjon", /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g],
  ["navngitt farge", new RegExp(`(?<![\\w-])${FARGEEGENSKAP}\\s*:[^;{}]*?(?<![\\w-])(?:${NAVN})(?![\\w-])`, "gi")],
  ["navngitt farge i attributt", new RegExp(`(?<![\\w-])(?:fill|stroke|stop-color|flood-color)=["'](?:${NAVN})["']`, "gi")],
  ["Tailwind-farge", /(?<![\w-])(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|accent|caret|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?(?![\w-])/g],
];

/** Mønstre for mørk modus og mørk-bryter. */
export const MORKMONSTRE = [
  ["prefers-color-scheme", /prefers-color-scheme/g],
  ["data-theme", /data-theme/g],
  ["color-scheme: dark", /color-scheme\s*[:=]\s*["']?[^;"'}]*\bdark\b/gi],
  ["matchMedia mot fargeskjema", /matchMedia\([^)]*color-scheme/g],
  [".dark-klasse", /(?:\.|classList\.(?:add|toggle|remove)\(["'])dark\b|class=["'][^"']*\bdark\b|(?<![\w-])dark:/g],
  ["mørk-bryter", /data-valg=|data-alltid-lys|aria-label=["'](?:Utgave|Tema|Fargetema|Mørk modus)["']|(?:tema|theme)[-_]?(?:bryter|toggle|switch|velger)|\b(?:tema|theme)[-_]?(?:bryter|toggle)\b/gi],
  ["lagret tema", /(?:localStorage|sessionStorage)[^;\n]*(?:theme|tema|dark|mork)/gi],
  ["mørk utgave valgt via media", /<source[^>]*media=["'][^"']*dark/gi],
];

/** Finner brudd i én tekst. Returnerer [{type, tekst, linje}] */
export function finnBrudd(tekst, { farger = true, mork = true } = {}) {
  const brudd = [];
  const bruk = (monstre, kategori) => {
    for (const [navn, re] of monstre) {
      re.lastIndex = 0;
      for (const m of tekst.matchAll(re)) {
        const linje = tekst.slice(0, m.index).split("\n").length;
        brudd.push({ type: `${kategori}: ${navn}`, tekst: m[0].slice(0, 60), linje });
      }
    }
  };
  if (farger) bruk(FARGEMONSTRE, "farge");
  if (mork) bruk(MORKMONSTRE, "mørk modus");
  return brudd;
}

/** Alle brudd i områdene (filer med fargeverdier som er byte-identiske med en merkefil hoppes over for farger). */
export function skann(omrader = OMRADER) {
  const merke = merkefilSha();
  const ut = [];
  for (const f of filer(omrader)) {
    const buf = readFileSync(f);
    const erMerkefil = f.endsWith(".svg") && (merke.has(sha(buf)) || erKundelogo(f, buf.toString("utf8")));
    for (const b of finnBrudd(buf.toString("utf8"), { farger: !erMerkefil, mork: true })) ut.push({ fil: relative(rot, f), ...b });
  }
  return ut;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const omr = process.argv.slice(2);
  const brudd = skann(omr.length ? omr : OMRADER);
  for (const b of brudd) console.error(`✗ ${b.fil}:${b.linje}  ${b.type}  «${b.tekst}»`);
  console.log(brudd.length ? `\n✗ ${brudd.length} brudd på Hengsel-reglene (docs/design/hengsel-regler.md)` : "✓ ingen fargeverdier utenfor den delte fila, og ingen mørk modus");
  process.exit(brudd.length ? 1 : 0);
}
