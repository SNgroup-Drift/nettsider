/**
 * K-192: reglene i docs/design/hengsel-regler.md som tester. Rødt bygg ved:
 *  a) en fargeverdi i en fil under hengsel.no, vis., design., admin. (eller Hengsel-pakkene) utenfor den delte fila packages/hengsel-tokens/tokens.css
 *  b) en delt token-fil (tokens.css, fonts.css) som avviker fra den pinnede hengsel.tokens.json, eller en pinnet fil som er endret, eller mer enn én pin
 *  c) prefers-color-scheme, data-theme, .dark, color-scheme: dark eller en mørk-bryter på en Hengsel-side (kilde og bygd)
 * Kjør `npm run build` først (bygde sider sjekkes også).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { OMRADER, erKundelogo, finnBrudd, merkefilSha, rot, sigdalHex, skann } from "./hengsel-regler.mjs";
import { lagFontsCss, lagMorkProverCss, lagTokensCss } from "./lag-hengsel-tokens.mjs";

const pakke = join(rot, "packages", "hengsel-tokens");
const les = (...s) => readFileSync(join(...s), "utf8");
const alle = (dir) => readdirSync(dir).flatMap((e) => { const s = join(dir, e); return statSync(s).isDirectory() ? alle(s) : [s]; });
const SIDER = ["hengsel", "vis", "design", "admin"];

test("a) ingen fargeverdi utenfor den delte token-fila (kilde)", () => {
  const brudd = skann(OMRADER).filter((b) => b.type.startsWith("farge"));
  assert.deepEqual(brudd.map((b) => `${b.fil}:${b.linje} ${b.type} «${b.tekst}»`), []);
});

test("a) skanneren finner hex, rgb, hsl, navngitt farge og Tailwind-farge (selvtest)", () => {
  for (const eksempel of ["a { color: #abc; }", "a { color: #AABBCC; }", "a { background: #aabbccdd; }", "a { color: rgb(1 2 3); }", "a { color: rgba(1,2,3,.5); }", "a { color: hsl(10 20% 30%); }", "a { border: 1px solid red; }", "a { background: white; }", '<rect fill="black">', '<div class="bg-slate-100">', "x = 'color(srgb 1 0 0)'"]) {
    assert.ok(finnBrudd(eksempel, { mork: false }).length > 0, `skulle funnet farge i: ${eksempel}`);
  }
  for (const ok of ["a { color: var(--tekst); }", "a { background: color-mix(in srgb, var(--tekst) 10%, transparent); }", "a { border-color: currentColor; }", '<a href="#innhold">', "&#39;", "a { fill: none; }", "a { color: inherit; background: transparent }"]) {
    assert.deepEqual(finnBrudd(ok), [], `skulle ikke funnet noe i: ${ok}`);
  }
});

test("a) filer med fargeverdier som ikke er pinnede logoer eller merkepakken v3 finnes ikke (SVG)", () => {
  const merke = merkefilSha();
  for (const s of SIDER) for (const f of alle(join(rot, "sites", s)).filter((x) => x.endsWith(".svg") && !/node_modules|\/dist\/|public\/ds\/|\/fasit\//.test(x))) {
    const t = readFileSync(f);
    if (finnBrudd(t.toString("utf8"), { mork: false }).length) assert.ok(merke.has(createHash("sha256").update(t).digest("hex")) || erKundelogo(f, t.toString("utf8")), `${relative(rot, f)} har fargeverdier og er ikke en pinnet logo eller en fil fra merkepakke v2 (design/handoff/hengsel_merke_v2)`);
  }
});

test("a) bygde sider: hver fargeverdi i CSS/HTML/JS finnes i den delte fila", () => {
  const delt = les(pakke, "tokens.css") + les(pakke, "tokens-mork-prover.css"); // K-202: de mørke fargeprøvene (bare design.) ligger i egen fil
  const tillatt = new Set([...delt.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase()));
  // Bygget CSS er minifisert: rgba(r, g, b, a) skrives som #rrggbbaa, og #rrggbb kan bli #rgb
  for (const m of delt.matchAll(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g)) tillatt.add("#" + [m[1], m[2], m[3], Math.round(m[4] * 255)].map((n) => Number(n).toString(16).padStart(2, "0")).join(""));
  for (const m of delt.matchAll(/rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/g)) tillatt.add("#" + [m[1], m[2], m[3], Math.round(m[4] * 255)].map((n) => Number(n).toString(16).padStart(2, "0")).join(""));
  for (const h of [...tillatt]) if (/^#(.)\1(.)\2(.)\3$/.test(h)) tillatt.add(`#${h[1]}${h[3]}${h[5]}`);
  for (const s of SIDER) {
    const dist = join(rot, "sites", s, "dist");
    if (!existsSync(dist)) continue; // bygget finnes ikke lokalt
    for (const f of alle(dist).filter((x) => /\.(css|html|js)$/.test(x) && !/\/ds\//.test(x))) {
      let t = readFileSync(f, "utf8");
      // Tekst på siden (design. viser verdiene fra JSON som tekst, inkl. «aldri #FFFFFF») er innhold, ikke styling: sjekk bare tagger, attributter og <style>
      if (f.endsWith(".html")) t = t.replace(/<script[\s\S]*?<\/script>/g, "").replace(/(<\/style>|>)[^<]*(?=<)/g, "$1");
      // K-223: bare sidene under /kunde/sigdal (og /kunde/sigdal/tema.css) kan ha Sigdal-fargene; Hengsel-sidene bare Hengsel-fargene
      const underSigdal = relative(dist, f).startsWith("kunde/sigdal");
      for (const m of t.matchAll(/(?<![\w&#/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/g)) {
        // Verdier fra pinnet JSON vises som tekst (design.) eller er theme-color; de må uansett finnes i den delte fila
        assert.ok(tillatt.has(m[0].toLowerCase()) || (underSigdal && sigdalHex().has(m[0].toLowerCase())), `${relative(rot, f)}: ${m[0]} finnes ikke i den delte token-fila`);
      }
    }
  }
});

test("b) den delte fila samsvarer med pinnet hengsel.tokens.json", () => {
  assert.equal(les(pakke, "tokens.css"), lagTokensCss(), "tokens.css avviker fra det som genereres: kjør node scripts/lag-hengsel-tokens.mjs");
  assert.equal(les(pakke, "tokens-mork-prover.css"), lagMorkProverCss(), "tokens-mork-prover.css avviker fra det som genereres: kjør node scripts/lag-hengsel-tokens.mjs");
  assert.equal(les(pakke, "fonts.css"), lagFontsCss(), "fonts.css avviker: kjør node scripts/lag-hengsel-tokens.mjs");
});

test("b) den delte fila har samme lyse verdier som designsystemets egen tokens.css (pinnet)", () => {
  const vars = (t) => Object.fromEntries([...t.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const pin = les(pakke, "ds", "tokens", "tokens.css");
  const ds = vars(pin.slice(pin.indexOf(":root {"), pin.indexOf("/* nettbrett */")));
  const delt = les(pakke, "tokens.css");
  const mine = vars(delt.slice(delt.indexOf(":root {"), delt.indexOf("/* nettbrett */")));
  // K-212: designsystemets tokens.css har også --*-hsl, --*-rgb og --skala-* (følgevariabler for CRM-et, tailwind/shadcn; trinnskalaen som rgb-tripler). Nettsidene bruker dem ikke og de er ikke med i den delte fila.
  for (const [navn, verdi] of Object.entries(ds).filter(([n]) => !/-(hsl|rgb)$|^--skala-/.test(n))) assert.equal(mine[navn], verdi, navn);
});

test("b) mørke verdier: tokens-mork-prover.css har nøyaktig de mørke verdiene i hengsel.tokens.json, og bare under .mork-prover", () => {
  const json = JSON.parse(les(pakke, "ds", "tokens", "hengsel.tokens.json"));
  const fil = les(pakke, "tokens-mork-prover.css");
  const vars = Object.fromEntries([...fil.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const uten$ = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));
  for (const [n, r] of uten$(json.farge)) assert.equal(vars[`--mork-${n}`], r.mork ?? r.lys, `--mork-${n}`);
  for (const [n, s] of uten$(json.status)) for (const d of ["fg", "bg", "kant"]) assert.equal(vars[`--mork-status-${n}-${d}`], (s.mork ?? s.lys)[d], `--mork-status-${n}-${d}`);
  assert.ok(/^\.mork-prover \{/m.test(fil), "variablene skal ligge under .mork-prover");
  assert.ok(!/:root|html|body|@media|data-theme/.test(fil.replace(/\/\*[\s\S]*?\*\//g, "")), "tokens-mork-prover.css skal ikke røre :root, html, body eller bruke @media");
  // ... og er ikke importert av noen annen Hengsel-side enn design.
  for (const f of alle(join(rot, "sites")).filter((x) => /\.(astro|html|css|mjs|js|ts)$/.test(x) && !/node_modules|\/dist\/|public\/ds\//.test(x))) {
    if (/tokens-mork-prover/.test(readFileSync(f, "utf8"))) assert.ok(relative(rot, f).startsWith("sites/design/"), `${relative(rot, f)} importerer mørk-prøvefila, men bare design.hengsel.no skal gjøre det`);
  }
});

test("b) pinnede filer er uendret, og det finnes bare én pin", () => {
  const pin = JSON.parse(les(pakke, "designsystem.pin.json"));
  assert.match(pin.commit, /^[0-9a-f]{40}$/);
  const ds = join(pakke, "ds");
  const filer = alle(ds).map((f) => relative(ds, f)).sort();
  assert.deepEqual(filer, Object.keys(pin.filer).sort(), "filsettet avviker fra pin-fila (scripts/hent-designsystem.mjs)");
  for (const f of filer) assert.equal(createHash("sha256").update(readFileSync(join(ds, f))).digest("hex"), pin.filer[f], `${f} er endret etter pinning`);
  const pins = alle(rot).filter((f) => !/node_modules|\/dist\/|\.git\//.test(f) && f.endsWith("designsystem.pin.json"));
  assert.deepEqual(pins.map((f) => relative(rot, f)), ["packages/hengsel-tokens/designsystem.pin.json"], "det skal bare finnes én designsystem.pin.json");
  assert.ok(!existsSync(join(rot, "sites", "design", "designsystem.pin.json")));
});

test("c) ingen mørk modus eller mørk-bryter i kilden", () => {
  const brudd = skann(OMRADER).filter((b) => b.type.startsWith("mørk"));
  assert.deepEqual(brudd.map((b) => `${b.fil}:${b.linje} ${b.type} «${b.tekst}»`), []);
});

test("c) den ferdige delte token-fila (tokens.css, fonts.css, grunn.css, Hode.astro) har ingen mørk modus og er light på :root", () => {
  for (const f of ["tokens.css", "fonts.css", join("src", "grunn.css"), join("src", "Hode.astro")]) {
    assert.deepEqual(finnBrudd(les(pakke, f), { farger: false }).map((b) => `${b.type} «${b.tekst}»`), [], `packages/hengsel-tokens/${f} har mørk modus`);
  }
  const tokens = les(pakke, "tokens.css");
  assert.ok(!/@media[^{]*color-scheme/.test(tokens) && !/\[data-theme/.test(tokens) && !/--mork-/.test(tokens), "tokens.css skal være bare lys, uten mørke prøver");
  assert.match(tokens, /:root\s*\{[\s\S]*color-scheme:\s*light;/, "tokens.css mangler color-scheme: light på :root");
});

test("c) mørk-prøvefila har ingen prefers-color-scheme og setter ikke color-scheme", () => {
  assert.deepEqual(finnBrudd(les(pakke, "tokens-mork-prover.css"), { farger: false }), []);
});

test("c) skanneren finner mørk modus (selvtest)", () => {
  for (const eksempel of ["@media (prefers-color-scheme: dark) { a { color: red } }", '<html data-theme="dark">', "a { color-scheme: dark; }", ":root.dark { }", 'matchMedia("(prefers-color-scheme: dark)")', '<button data-valg="dark">', "localStorage.setItem('theme', x)", '<source media="(prefers-color-scheme: dark)" srcset="a">', "dark:bg-black"]) {
    assert.ok(finnBrudd(eksempel, { farger: false }).length > 0, `skulle funnet mørk modus i: ${eksempel}`);
  }
  assert.deepEqual(finnBrudd("html { color-scheme: light; }", { farger: false }), []);
});

test("c) bygde sider: color-scheme er light, og ingen mørk modus i bygd CSS/HTML/JS", () => {
  for (const s of SIDER) {
    const dist = join(rot, "sites", s, "dist");
    assert.ok(existsSync(dist), `${s}: dist mangler, kjør npm run build først (K-202: bygde sider hoppes ikke over)`);
    let lys = false;
    for (const f of alle(dist).filter((x) => /\.(css|html|js)$/.test(x) && !/\/ds\//.test(x))) {
      const t = readFileSync(f, "utf8");
      assert.deepEqual(finnBrudd(t, { farger: false }).map((b) => b.type), [], `${relative(rot, f)} har mørk modus`);
      if (/color-scheme\s*:\s*light/.test(t)) lys = true;
    }
    assert.ok(lys, `${s}: color-scheme: light mangler i bygget`);
  }
});

test("regelen er skrevet og vist til fra README og CLAUDE.md", () => {
  assert.ok(existsSync(join(rot, "docs", "design", "hengsel-regler.md")));
  for (const f of ["README.md", "CLAUDE.md"]) assert.match(les(rot, f), /docs\/design\/hengsel-regler\.md/, `${f} viser ikke til regelen`);
});
