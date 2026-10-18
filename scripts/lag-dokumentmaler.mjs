#!/usr/bin/env node
/**
 * N-7b: gjør eksempel.html i de pinnede dokumentmalene (28 stk, packages/hengsel-tokens/ds/dokumentmaler) trygge for CSP-en på design.hengsel.no
 * (script-src 'self', style-src 'self' + hasher, ingen style=""). Kjøres i `npm run build -w sites/design` rett etter kopier-ds.mjs og virker bare på kopien i
 * sites/design/public/ds/dokumentmaler (generert, ligger ikke i git); kildefilene i pin-mappa røres aldri.
 *   - det innebygde temaskriptet (?tema=…, ?liten=1) flyttes til felles/tema.js, samme kode
 *   - style="…" blir data-s="n", og reglene ligger i felles/eksempel-stiler.css (med !important, som en innebygd stil)
 *   - <title> får malens navn (kilden har «undefined»), og siden får favicon og noindex
 */
import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const mappe = join(rot, "sites", "design", "public", "ds", "dokumentmaler");
const mapper = (await readdir(mappe)).filter((m) => /^\d\d-/.test(m)).sort();
const stiler = new Map();
let skript = null;
let antall = 0;
for (const m of mapper) {
  const fil = join(mappe, m, "eksempel.html");
  if (!existsSync(fil)) continue; // N-7c: mal 29 er levert uten eksempel.html (kommer i 2.10c)
  antall++;
  let html = await readFile(fil, "utf8");
  const navn = JSON.parse(await readFile(join(mappe, m, "felter.json"), "utf8")).dokument ?? m;
  html = html.replace(/<script>([\s\S]*?)<\/script>/, (_, kode) => { skript ??= kode; return '<script src="../felles/tema.js"></script>'; });
  html = html.replace(/ style="([^"]*)"/g, (_, s) => {
    const v = s.replaceAll("&quot;", '"').replaceAll("&amp;", "&");
    if (!stiler.has(v)) stiler.set(v, stiler.size + 1);
    return ` data-s="${stiler.get(v)}"`;
  });
  html = html.replace("<title>undefined</title>", `<title>${navn.replace(/&/g, "&amp;").replace(/</g, "&lt;")} – eksempel · Hengsel dokumentmal</title>`)
    .replace('<link rel="stylesheet" href="../felles/fonter.css">', '<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex, nofollow">\n<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" href="/favicon-flis.svg" type="image/svg+xml">\n<link rel="stylesheet" href="../felles/fonter.css">\n<link rel="stylesheet" href="../felles/eksempel-stiler.css">');
  if (/<script(?![^>]*\bsrc=)/.test(html) || / style="/.test(html)) throw new Error(`${m}: eksempel.html har fortsatt innebygd skript eller stil`);
  await writeFile(fil, html);
}
if (!skript) throw new Error("fant ikke temaskriptet i eksempel.html (ny versjon av malene?)");
await writeFile(join(mappe, "felles", "tema.js"), `${skript}\n`);
await writeFile(join(mappe, "felles", "eksempel-stiler.css"), `/* GENERERT av scripts/lag-dokumentmaler.mjs: style="…" fra eksempel.html (CSP-en tillater ikke innebygde stiler) */\n${[...stiler].map(([s, n]) => `[data-s="${n}"]{${s.split(";").map((d) => d.trim()).filter(Boolean).map((d) => `${d} !important`).join(";")}}`).join("\n")}\n`);
console.log(`✓ ${antall} eksempel.html gjort CSP-trygge (${stiler.size} stiler flyttet til felles/eksempel-stiler.css)`);
