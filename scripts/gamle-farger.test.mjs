/**
 * K-212 runde 2: søket i design/handoff/…/MIGRERING.md («Søk etter») som test. Ingen av de 31 gamle fargekodene (brevann-paletten), de gamle P3-verdiene, den gamle stiftfargen,
 * rgba(0, 126, 146, …) eller ordet «brevann» skal finnes i kode, CSS, SVG eller fargesett under sites/ og packages/ (kilde, ikke bygd). Og P3-blokken i den delte token-fila skal være furu.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const HOPP = new Set(["node_modules", "dist", ".astro", ".wrangler", ".git"]);
const TEKST = /\.(css|astro|ts|tsx|js|mjs|html|json|svg|webmanifest|xml|swift|md|txt)$/;
const alle = (dir) => readdirSync(dir).flatMap((e) => (HOPP.has(e) ? [] : statSync(join(dir, e)).isDirectory() ? alle(join(dir, e)) : [join(dir, e)]));

const GAMLE = "DCF4F9 007E92 007082 006879 B2E6F2 006E30 DEF8E2 9AD5A5 03333C 00B3CF 27C2DE 74CDE1 08272E 003E49 9CE6AB 0F3118 2E663C 006575 005664 004B58 9DDCEB 004B1E E5FFE9 298646 30C7E3 43D4F0 A3ECFD 004A56 BAFFC7 00220A 6FA87B".split(" ");
const GAMLE_P3_OG_STIFT = ["177E97", "4FB0CC", "008094", "24B7D2"];
const MONSTRE = [
  ["gammel fargekode", new RegExp(`#(?:${[...GAMLE, ...GAMLE_P3_OG_STIFT].join("|")})(?![0-9a-fA-F])`, "i")],
  ["gammel P3-verdi", /color\(display-p3 0?\.1494 0?\.4916 0?\.5815\)/],
  ["rgba med brevann", /rgba\(0,\s*126,\s*146/],
  ["ordet brevann", /brevann/i],
];

test("ingen gamle fargekoder, gamle P3-verdier, brevann-rgba eller ordet «brevann» i sites/ og packages/", () => {
  const treff = [];
  for (const mappe of ["sites", "packages"]) {
    for (const f of alle(join(rot, mappe)).filter((x) => TEKST.test(x))) {
      const t = readFileSync(f, "utf8");
      for (const [navn, re] of MONSTRE) { const m = re.exec(t); if (m) treff.push(`${relative(rot, f)}: ${navn} «${m[0]}»`); }
    }
  }
  assert.deepEqual(treff, []);
});

test("selvtest: mønstrene finner det de skal", () => {
  for (const t of ["a{color:#007E92}", "fill=\"#24b7d2\"", "color(display-p3 0.1494 0.4916 0.5815)", "rgba(0,126,146,.5)", "rgba(0, 126, 146, 0.1)", "--brevann: 1", "Brevann"]) assert.ok(MONSTRE.some(([, re]) => re.test(t)), t);
  for (const t of ["a{color:#068472}", "#54B9A5", "color(display-p3 0.2275 0.5098 0.4471)", "#007E9211x"]) assert.ok(!MONSTRE.some(([, re]) => re.test(t)), t);
});

test("P3-blokken i den delte token-fila er furu (aksent color(display-p3 0.2275 0.5098 0.4471)) og stemmer med pakkens besluttede P3-blokk", () => {
  const css = readFileSync(join(rot, "packages", "hengsel-tokens", "tokens.css"), "utf8");
  const blokk = /@media \(color-gamut: p3\) \{\s*:root \{([^}]*)\}/.exec(css);
  assert.ok(blokk, "tokens.css mangler @media (color-gamut: p3)");
  assert.match(blokk[1], /--aksent: color\(display-p3 0\.2275 0\.5098 0\.4471\);/);
  const vars = (t) => Object.fromEntries([...t.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().replace(/\s+/g, " ")]));
  const pakke = join(rot, "design", "handoff", "design_handoff_hengsel_furu_v2", "tokens", "hengsel-palett.css");
  const kilde = readFileSync(pakke, "utf8");
  const start = kilde.indexOf("@media (color-gamut: p3) {");
  const p3 = vars(kilde.slice(start, kilde.indexOf("/* ── Grunnpalett, mørk", start)));
  assert.deepEqual(vars(blokk[1]), p3, "P3-blokken avviker fra pakkens (BESLUTTET) blokk");
});
