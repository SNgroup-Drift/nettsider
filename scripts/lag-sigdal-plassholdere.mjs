#!/usr/bin/env node
/**
 * K-223: lager plassholderne «Skjermbilde kommer» for Sigdal-utgaven (hengsel.no/kunde/sigdal): én fil per skjermbilde på Hengsel-sidene og i
 * Visningsrommet, med samme filnavn og samme mål, i Sigdal-stil (Beige 3 flate, Warm Black tekst, fargene leses fra packages/kundetema-sigdal/tokens.css).
 * Ingen Hengsel-grønne skjermbilder vises under /kunde/sigdal. Når Design leverer Sigdal-utgavene, legges de over filene i sites/hengsel/public/kunde/sigdal/img/
 * med samme navn. Skriptet skriver også claude/k223-plassholdere.md (lista over filene).
 *
 *   node scripts/lag-sigdal-plassholdere.mjs           lager filene som mangler
 *   node scripts/lag-sigdal-plassholdere.mjs --alle    lager alle på nytt (overskriver, også leverte skjermbilder: bruk med omhu)
 *   node scripts/lag-sigdal-plassholdere.mjs --sjekk   exit 1 hvis en plassholder mangler
 *
 * Kilde → plassholder:
 *   sites/hengsel/public/img/{app,apptest}/*.webp, img/dok-forside.webp  → sites/hengsel/public/kunde/sigdal/img/…
 *   sites/vis/src/img/*.webp (hero, romkort, flater)                      → sites/hengsel/public/kunde/sigdal/img/vis/*.webp
 *   sites/vis/src/skjermbilder/*.webp (uten -mork: Sigdal er bare lys)    → sites/hengsel/public/kunde/sigdal/img/vis/skjermbilder/*.webp
 * Enhetsrammene (ramme-studio-display.webp, assets/rammer/*) er Apples rammer uten Hengsel-farger og beholdes.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import sharp from "sharp";

const rot = join(import.meta.dirname, "..");
const ut = join(rot, "sites", "hengsel", "public", "kunde", "sigdal", "img");
const tokens = readFileSync(join(rot, "packages", "kundetema-sigdal", "tokens.css"), "utf8");
const farge = (navn) => {
  const m = new RegExp(`--sigdal-${navn}:\\s*(#[0-9A-Fa-f]{6})`).exec(tokens);
  if (!m) throw new Error(`fant ikke --sigdal-${navn} i kundetema-sigdal/tokens.css`);
  return m[1];
};
const FLATE = farge("beige-3"), KANT = farge("beige-2"), TEKST = farge("warm-black"), SVAK = farge("beige-1");

const KILDER = [
  { mappe: join(rot, "sites/hengsel/public/img/app"), til: "app" },
  { mappe: join(rot, "sites/hengsel/public/img/apptest"), til: "apptest" },
  { mappe: join(rot, "sites/hengsel/public/img"), til: "", bare: ["dok-forside.webp"] },
  { mappe: join(rot, "sites/vis/src/img"), til: "vis", unntatt: (f) => f.startsWith("sn-logo") },
  { mappe: join(rot, "sites/vis/src/skjermbilder"), til: "vis/skjermbilder", unntatt: (f) => /-mork(@1x)?\.webp$/.test(f) },
];

export function kilderMedMal() {
  const liste = [];
  for (const k of KILDER) {
    for (const f of readdirSync(k.mappe).filter((x) => x.endsWith(".webp")).sort()) {
      if (k.bare && !k.bare.includes(f)) continue;
      if (k.unntatt?.(f)) continue;
      liste.push({ fil: join(k.mappe, f), mal: join(ut, k.til, f), rel: relative(join(rot, "sites/hengsel/public"), join(ut, k.til, f)) });
    }
  }
  return liste;
}

function svg(w, h) {
  const s = Math.min(w, h);
  const pt = Math.max(14, Math.round(s * 0.05));
  const strek = Math.max(2, Math.round(s * 0.004));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="${FLATE}"/>
<rect x="${strek / 2}" y="${strek / 2}" width="${w - strek}" height="${h - strek}" fill="none" stroke="${KANT}" stroke-width="${strek}"/>
<line x1="${w * 0.42}" y1="${h / 2 + pt * 1.1}" x2="${w * 0.58}" y2="${h / 2 + pt * 1.1}" stroke="${SVAK}" stroke-width="${strek}"/>
<text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-weight="500" font-size="${pt}" fill="${TEKST}">Skjermbilde kommer</text>
</svg>`;
}

const [, , ...argv] = process.argv;
if (import.meta.url === `file://${process.argv[1]}`) {
  const alle = argv.includes("--alle");
  const sjekk = argv.includes("--sjekk");
  const filer = kilderMedMal();
  const mangler = filer.filter((f) => !existsSync(f.mal));
  if (sjekk) {
    for (const f of mangler) console.error(`✗ mangler ${f.rel}`);
    console.log(mangler.length ? `✗ ${mangler.length} plassholdere mangler` : `✓ ${filer.length} plassholdere finnes`);
    process.exit(mangler.length ? 1 : 0);
  }
  const cache = new Map();
  let laget = 0;
  for (const f of alle ? filer : mangler) {
    const { width: w, height: h } = await sharp(f.fil).metadata();
    const noekkel = `${w}x${h}`;
    if (!cache.has(noekkel)) cache.set(noekkel, await sharp(Buffer.from(svg(w, h))).webp({ quality: 80, effort: 6 }).toBuffer());
    mkdirSync(dirname(f.mal), { recursive: true });
    writeFileSync(f.mal, cache.get(noekkel));
    laget++;
  }
  // Lista (claude/k223-plassholdere.md)
  const rader = filer.map((f) => `| \`/${f.rel.replace(/^sigdal\//, "sigdal/")}\` | ${relative(rot, f.fil)} |`);
  const md = `# K-223 · Plassholdere for Sigdal-skjermbilder (${filer.length} filer)\n\nGenerert av \`node scripts/lag-sigdal-plassholdere.mjs\`. Hver fil er en nøytral flate med teksten «Skjermbilde kommer» i Sigdal-stil, med samme navn og mål som originalen. Design leverer Sigdal-utgavene med samme filnavn under \`sites/hengsel/public/kunde/sigdal/img/\`; da erstatter de plassholderne (kjør aldri skriptet med \`--alle\` etter at ekte bilder er lagt inn).\n\n| Plassholder (adresse) | Tilsvarer (Hengsel-skjermbildet) |\n|---|---|\n${rader.join("\n")}\n`;
  writeFileSync(join(rot, "claude", "k223-plassholdere.md"), md);
  console.log(`✓ ${laget} plassholdere laget (${cache.size} ulike størrelser), ${filer.length} totalt. Lista: claude/k223-plassholdere.md`);
}
