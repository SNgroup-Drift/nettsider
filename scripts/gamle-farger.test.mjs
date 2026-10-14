/**
 * K-231 (nederst): gamle logoer og merkefiler kommer ikke tilbake: gammel favicon (avrundet flis fra runde 1), gammelt «levert av» (det blå, og «Hengsel Levering» som erstatning),
 * det blå merket fra merkepakke v3 (brand/hengsel-merke), gammel motion og gammelt delingsbilde. Se kommentaren over den siste delen.
 * K-212 runde 2: søket i design/handoff/…/MIGRERING.md («Søk etter») som test. Ingen av de 31 gamle fargekodene (brevann-paletten), de gamle P3-verdiene, den gamle stiftfargen,
 * rgba(0, 126, 146, …) eller ordet «brevann» skal finnes i kode, CSS, SVG eller fargesett under sites/ og packages/ (kilde, ikke bygd). Og P3-blokken i den delte token-fila skal være furu.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

// ── K-231: gamle logoer, favicon og blå merkefiler ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// 1. sha256 for hver fil i det gamle merket (brand/hengsel-merke, merkepakke v3 med blå aksent), gammel favicon-flis, gammelt «levert av», gammel Ute-motion, gamle delingsbilder
//    og Sigdal-logoen med tekst under. Ingen fil i sites/, packages/ eller scripts/ har samme innhold som en av dem, uansett navn eller mappe. Filer som også er i palettpakke v2 eller merkepakke v2 (lovlige) er tatt ut av lista.
const GAMLE_FILER = JSON.parse(readFileSync(join(rot, "scripts", "gamle-merkefiler.json"), "utf8"));
const HOPP_ALLE = new Set(["node_modules", "dist", ".astro", ".wrangler", ".git", ".harnesskit"]);
const alleFiler = (dir) => readdirSync(dir).flatMap((e) => (HOPP_ALLE.has(e) ? [] : statSync(join(dir, e)).isDirectory() ? alleFiler(join(dir, e)) : [join(dir, e)]));

test("ingen fil i repoet er lik en gammel merkefil (blå merke v3, gammel favicon-flis, gammelt «levert av», gammel motion eller gammelt delingsbilde) i sites/, packages/ og scripts/", () => {
  assert.ok(Object.keys(GAMLE_FILER).length >= 90, "scripts/gamle-merkefiler.json er for kort");
  const treff = [];
  // sites/ og packages/ (kode, bilder og pinnede filer) og brand/ (som er slettet). design/ og docs/ er kildepakker og dagsatte leveranser fra Design (arkiv): de er ikke i bruk.
  for (const f of ["sites", "packages", "brand", "scripts"].filter((m) => existsSync(join(rot, m))).flatMap((m) => alleFiler(join(rot, m)))) {
    if (relative(rot, f) === "scripts/gamle-merkefiler.json") continue;
    const gammel = GAMLE_FILER[createHash("sha256").update(readFileSync(f)).digest("hex")];
    if (gammel) treff.push(`${relative(rot, f)} er lik gamle ${gammel}`);
  }
  assert.deepEqual(treff, []);
});

test("brand/hengsel-merke (det blå merket) er slettet, og gamle favicon- og delingsfiler finnes ikke på sidene", () => {
  assert.ok(!existsSync(join(rot, "brand")), "brand/ (merkepakke v3, blå) skal ikke finnes: merkepakke v2 ligger i design/handoff/hengsel_merke_v2");
  for (const site of ["hengsel", "admin", "design", "vis"]) {
    for (const mappe of ["public", "src"]) {
      for (const f of ["favicon-32.png", "favicon.svg"]) assert.ok(!existsSync(join(rot, "sites", site, mappe, f)), `sites/${site}/${mappe}/${f}: gammel favicon (avrundet flis eller gjennomsiktig SVG)`);
    }
  }
  for (const f of ["sites/hengsel/public/og.png", "sites/vis/src/og.png", "sites/hengsel/public/media/ute-motion-1080x1080-plakat.webp", "sites/hengsel/public/logo/hengsel-levering-aksent-lys.svg", "sites/vis/src/assets/logo/hengsel-levering-aksent-lys.svg"]) assert.ok(!existsSync(join(rot, f)), `${f} er gammel`);
  assert.ok(!readdirSync(join(rot, "sites", "hengsel", "public", "kunde", "sigdal", "logo")).some((f) => /^sigdal-logo-.*\.png$/.test(f)), "Sigdal-logoen alene (PNG; vektorlogoene sigdal-logo*.svg er lov, men ikke i bruk i toppen) (med «levert av» som tekst under) er erstattet av sigdal-crm-levert-av-hengsel-*");
});

const GAMLE_NAVN = [
  ["gammel favicon (favicon-32.png)", /favicon-32\.png/],
  ["gammelt «levert av» (blå merkepakke v3)", /levert-av-aksent|sendt-med-aksent/],
  ["«Hengsel Levering» brukt som «levert av» (K-212 runde 2)", /hengsel-levering-aksent/],
  ["det blå merket (brand/hengsel-merke)", /brand\/hengsel-merke/],
  ["gammel Ute-motion (webp-plakat)", /ute-motion-\d+x\d+-plakat\.webp/],
  ["Sigdal-logoen med tekst under", /sigdal-logo-(?:warm-black|off-white)/],
];
test("ingen kode eller CSS i sites/ og packages/ peker på gammel favicon, gammelt «levert av», det blå merket, gammel motion eller Sigdal-logoen alene", () => {
  const treff = [];
  for (const mappe of ["sites", "packages"]) {
    for (const f of alle(join(rot, mappe)).filter((x) => TEKST.test(x) && !relative(rot, x).startsWith("packages/hengsel-tokens/ds/") && !relative(rot, x).startsWith("sites/design/public/ds/") && !relative(rot, x).endsWith("designsystem.pin.json"))) {
      const t = readFileSync(f, "utf8");
      for (const [navn, re] of GAMLE_NAVN) { const m = re.exec(t); if (m) treff.push(`${relative(rot, f)}: ${navn} «${m[0]}»`); }
      // Hengsel-sidene (hengsel.no og vis) bruker delingsbildene fra merkepakke v2: og-hengsel-no, og-apptest og og-vis-hengsel-no, ikke den gamle og.png
      if (/^sites\/(?:hengsel|vis)\//.test(relative(rot, f)) && /(?<![\w.-])\/?og\.png/.test(t)) treff.push(`${relative(rot, f)}: gammel og.png`);
    }
  }
  assert.deepEqual(treff, []);
});

test("det blå merket (Deep Blue #5074A9 på stiften) finnes ikke i noen SVG på Hengsel-sidene, bare i Sigdal-filene som kundefarge", () => {
  const treff = [];
  for (const f of alle(join(rot, "sites")).filter((x) => x.endsWith(".svg"))) {
    const rel = relative(rot, f);
    if (/^sites\/hengsel\/public\/sigdal\//.test(rel) || /^sites\/design\/public\/merke\/sigdal-/.test(rel) || rel.startsWith("sites/design/public/ds/")) continue;
    if (/#5074A9|#9CA9BD/i.test(readFileSync(f, "utf8"))) treff.push(rel);
  }
  assert.deepEqual(treff, []);
});

test("selvtest: gamle navn og blå merkefiler fanges", () => {
  for (const t of ["href=\"/favicon-32.png\"", "levert-av-aksent-lys.svg", "sendt-med-aksent-mork.svg", "hengsel-levering-aksent-lys.svg", "brand/hengsel-merke/svg", "ute-motion-1080x1080-plakat.webp", "sigdal-logo-warm-black.png"]) assert.ok(GAMLE_NAVN.some(([, re]) => re.test(t)), t);
  for (const t of ["levert-av-hengsel-lys.svg", "favicon-flis-32.png", "favicon.ico", "sigdal-crm-levert-av-hengsel-warm-black.svg", "ute-motion-1080x1920-plakat.png"]) assert.ok(!GAMLE_NAVN.some(([, re]) => re.test(t)), t);
});
