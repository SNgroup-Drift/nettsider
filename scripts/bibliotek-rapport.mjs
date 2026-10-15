#!/usr/bin/env node
/**
 * K-233: kort rapport etter `npm run build`: per side antall bilder fra biblioteket (bilder.hengsel.no), nettsidenes egne bilder (LOKALE_BILDER, /img/…)
 * og plassholdere («Skjermbilde kommer»), lest fra de bygde sidene (HTML) og tabellene bygg.mjs fyller i vis (rom.js BILDER, bilder.js SKJERM).
 *
 *   node scripts/bibliotek-rapport.mjs [utfil]     standard claude/k233/bibliotek-rapport.md
 *
 * Fila skrives ALLTID (K-238): mangler byggene, eller stopper skriptet på en feil, står det i fila (exit 1), så jobbsammendraget i Actions aldri er tomt.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { BILDEDOMENE, LOKALE_BILDER, lesManifest } from "./lib/bildedomene.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.argv[2] ?? join(rot, "claude", "k233", "bibliotek-rapport.md"));
const filer = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filer(join(d, e.name)) : [join(d, e.name)]));
const ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ADRESSE = new RegExp(`${ESC(BILDEDOMENE)}/([\\w@./-]+\\.webp)`, "g");
function lagRapport() {
  const m = lesManifest();
  const rader = [];
  let sumB = 0, sumL = 0, sumP = 0;
  for (const side of ["hengsel", "vis", "design"]) {
    const dist = join(rot, "sites", side, "dist");
    if (!existsSync(dist)) continue;
    for (const f of filer(dist).filter((p) => p.endsWith(".html") && !p.endsWith("404.html")).sort()) {
      const html = readFileSync(f, "utf8");
      const bib = new Set([...html.matchAll(ADRESSE)].map((x) => x[1].replace(/@1x\.webp$/, ".webp")));
      const lokale = new Set([...html.matchAll(/\/img\/(rom-[a-z]+|dok-forside)\.webp/g)].map((x) => x[1]));
      const plass = new Set([...html.matchAll(/data-skjermbilde="([^"]+)"[^>]*>(?:(?!<\/figure>).)*Skjermbilde kommer/gs)].map((x) => x[1]));
      // Rommene i vis: kortene lages av skript fra BILDER i rom.js (samme tabell for alle sider i samme utgave)
      const romJs = f.includes("/kunde/sigdal/vis/") ? join(dirname(f).split("/kunde/sigdal/vis/")[0], "kunde", "sigdal", "vis", "assets", "rom.js") : join(dist, "assets", "rom.js");
      if (side !== "design" && /\/rom\/index\.html$/.test(f) && existsSync(romJs)) {
        const tab = /\/\*BILDER\*\/(\{.*?\})\/\*BILDER-slutt\*\//.exec(readFileSync(romJs, "utf8"));
        if (tab) for (const [navn, v] of Object.entries(JSON.parse(tab[1]))) {
          if (v === null) plass.add(`vis/${navn}`);
          else if (String(v.u).startsWith("/img/")) lokale.add(navn);
          else bib.add(`${v.u.split("/v1/")[1]}`);
        }
      }
      const sti = f.slice(dist.length).replace(/index\.html$/, "").replace(/\.html$/, "") || "/";
      if (!bib.size && !lokale.size && !plass.size) continue;
      const ikkeIManifest = [...bib].filter((b) => !Object.hasOwn(m.filer, b));
      rader.push(`| ${side} | ${sti} | ${bib.size} | ${lokale.size} | ${plass.size}${plass.size ? ` (${[...plass].sort().join(", ")})` : ""} |${ikkeIManifest.length ? ` ikke i manifestet: ${ikkeIManifest.join(", ")}` : ""}`);
      sumB += bib.size; sumL += lokale.size; sumP += plass.size;
    }
  }
  if (!rader.length) throw new Error("ingen bygde sider med bilder funnet: kjør npm run build først");
  return `# Bilder per side etter bygging (${new Date().toISOString().slice(0, 16).replace("T", " ")})

Manifest: ${Object.keys(m.filer).length} filer, laget ${m.laget}. Nettsidenes egne bilder (LOKALE_BILDER): ${Object.keys(LOKALE_BILDER).length}.
Tallene er distinkte bilder per bygd side (1× og 2× av samme bilde telles én gang; romkortene fra rom.js telles på /rom/).

| Side | Sti | Fra biblioteket | Egne (lokalt) | Plassholdere |
|---|---|---|---|---|
${rader.join("\n")}

Sum: ${sumB} bibliotekbilder, ${sumL} egne bilder, ${sumP} plassholdere (summert over sidene, samme bilde kan telle på flere sider).
`;
}

let tekst, kode = 0;
try {
  tekst = lagRapport();
} catch (e) {
  kode = 1;
  tekst = `# Bilder per side etter bygging (${new Date().toISOString().slice(0, 16).replace("T", " ")})\n\n✗ Rapporten kunne ikke lages: ${e?.message ?? e}\n`;
}
mkdirSync(dirname(ut), { recursive: true });
writeFileSync(ut, tekst);
console.log(tekst);
process.exit(kode);
