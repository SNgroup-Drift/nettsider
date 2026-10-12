#!/usr/bin/env node
/**
 * K-182: sammenlikner verdiene i repoet med Hengsel-designsystemet (sites/design/public/ds/tokens/hengsel.tokens.json, pinnet).
 *   node scripts/tokens-avvik.mjs            skriver tabellen over avvik (til rapporten), exit 0
 *   node scripts/tokens-avvik.mjs --sjekk    exit 1 ved avvik i det som SKAL være likt (brukes av tokens-avvik.test.mjs)
 *
 * Det som skal være likt (ren variabelbytting, rettet i K-182): mørk sidebakgrunn (flate-side mørk) i packages/design, sngroup.no, hengsel.no, admin.hengsel.no og Visningsrommet,
 * og de åtte merkevarefargene i hengsel.no. Resten av forskjellene mellom hengsel.no og designsystemet er følgesaker (egne verdier som krever mer enn et variabelbytte),
 * og listes bare.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const les = (...s) => readFileSync(join(rot, ...s), "utf8");
const ds = JSON.parse(les("sites", "design", "public", "ds", "tokens", "hengsel.tokens.json"));
const MORK = ds.farge["flate-side"].mork.toLowerCase();
const norm = (h) => h.trim().toLowerCase();

/** Variabelverdier (--navn: verdi) i en CSS-tekst, i rekkefølge (alle blokker). */
export const cssVars = (tekst) => [...tekst.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)].map((m) => [m[1], m[2].trim()]);

export function sjekk() {
  const feil = [];
  const forvent = (hva, funnet) => { if (norm(funnet) !== MORK) feil.push(`${hva}: ${funnet} (forventet ${MORK}, flate-side mørk i designsystemet)`); };
  forvent("packages/design tokens.css --natt", cssVars(les("packages", "design", "src", "styles", "tokens.css")).find(([n]) => n === "--natt")[1]);
  forvent("packages/design BaseLayout temafarge (mørk)", /temafarge\s*=\s*\["#[0-9a-f]{6}",\s*"(#[0-9a-f]{6})"\]/i.exec(les("packages", "design", "src", "components", "BaseLayout.astro"))[1]);
  forvent("packages/design dokumentvisning.css (lysboks)", /dialog\.lys\s*\{[^}]*background:\s*(#[0-9a-f]{6})/i.exec(les("packages", "design", "src", "dokumenter", "dokumentvisning.css"))[1]);
  const hv = cssVars(les("sites", "hengsel", "src", "styles", "tokens.css"));
  for (const [n, v] of hv.filter(([n]) => n === "--bakgrunn").slice(1)) forvent("sites/hengsel tokens.css mørk --bakgrunn", v);
  forvent("sites/hengsel Side.astro temafarge (mørk)", /temafarge=\{\["#[0-9a-f]{6}",\s*"(#[0-9a-f]{6})"\]\}/i.exec(les("sites", "hengsel", "src", "layouts", "Side.astro"))[1]);
  forvent("sites/hengsel hengsel.css --surface-app (mørk)", /--surface-app:\s*(#[0-9a-f]{6})/gi.exec(les("sites", "hengsel", "src", "styles", "hengsel.css").split("prefers-color-scheme: dark")[1])[1]);
  forvent("sites/vis vis.css --bg (mørk)", [...les("sites", "vis", "src", "assets", "vis.css").matchAll(/--bg:\s*(#[0-9a-f]{6})/gi)].pop()[1]);
  const ad = cssVars(les("sites", "admin", "src", "styles", "profil.css"));
  for (const [n, v] of ad.filter(([n]) => n === "--bakgrunn").slice(1)) forvent("sites/admin profil.css mørk --bakgrunn", v);
  forvent("sites/admin Side.astro temafarge (mørk)", /temafarge=\{\["#[0-9a-f]{6}",\s*"(#[0-9a-f]{6})"\]\}/i.exec(les("sites", "admin", "src", "layouts", "Side.astro"))[1]);
  // De åtte merkevarefargene på hengsel.no
  for (const [navn, hex] of Object.entries(ds.palett).filter(([k]) => !k.startsWith("$") && k !== "aksent-mork")) {
    const v = hv.find(([n]) => n === `--${navn}`);
    if (!v) feil.push(`sites/hengsel tokens.css mangler --${navn}`);
    else if (norm(v[1]) !== norm(hex)) feil.push(`sites/hengsel tokens.css --${navn}: ${v[1]} (designsystemet: ${hex})`);
  }
  // Gamle mørke bakgrunner skal ikke finnes i kode som tegner flater (enhetsrammer er maskinvare, ikke flate, og er følgesak)
  const GAMMEL = /#1b1713|#1e1916/i;
  const ENHETSRAMME = /ramme|lysboks|\.ipad|\.iphone|\.phone|bezel/i;
  const gaa = (dir) => {
    for (const e of readdirSync(dir)) {
      if (["node_modules", "dist", ".astro", "fasit", "kilde"].includes(e)) continue;
      const sti = join(dir, e);
      if (statSync(sti).isDirectory()) gaa(sti);
      else if (/\.(css|astro|ts|js|mjs|html)$/.test(e)) {
        les(relative(rot, sti)).split("\n").forEach((linje, i) => { if (GAMMEL.test(linje) && !ENHETSRAMME.test(linje)) feil.push(`${relative(rot, sti)}:${i + 1}: gammel mørk bakgrunn: ${linje.trim().slice(0, 100)}`); });
      }
    }
  };
  for (const d of ["packages/design/src", "sites/sngroup/src", "sites/hengsel/src", "sites/admin/src", "sites/byggem/src", "sites/design/src", "sites/vis/src/assets"]) gaa(join(rot, d));
  return feil;
}

/** Forskjellene som er følgesaker: hengsel.no sine mørke roller mot nærmeste rolle i designsystemet. */
export function avvikTabell() {
  const hv = cssVars(les("sites", "hengsel", "src", "styles", "tokens.css"));
  const mork = (navn) => hv.filter(([n]) => n === navn).pop()?.[1];
  const lys = (navn) => hv.find(([n]) => n === navn)?.[1];
  const KART = [
    ["--bakgrunn", "flate-side"], ["--kort", "flate-kort"], ["--flate-myk", "flate-senket"], ["--flate-sterk", "flate-valgt"], ["--linje", "linje"],
    ["--tekst", "tekst"], ["--tekst-dempet", "tekst-dempet"], ["--tekst-svak", "tekst-svak"], ["--aksent", "aksent"], ["--pa-aksent", "paa-aksent"],
    ["--ok", "status:ok:fg"], ["--feil", "status:feil:fg"],
  ];
  const dsVerdi = (r, m) => { const [a, b, c] = r.split(":"); return a === "status" ? ds.status[b][m][c] : (ds.farge[r][m] ?? ds.farge[r].lys); };
  const rader = [];
  for (const [v, r] of KART) for (const m of ["lys", "mork"]) {
    const h = m === "lys" ? lys(v) : mork(v);
    if (!h || h.startsWith("var(")) continue;
    const d = dsVerdi(r, m);
    if (norm(h) !== norm(d)) rader.push(`| hengsel.no \`${v}\` (${m}) | \`${h}\` | designsystemet \`${r.replace(/:/g, " ")}\` (${m}) | \`${d}\` |`);
  }
  return rader;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--sjekk")) {
    const f = sjekk();
    for (const x of f) console.error(`✗ ${x}`);
    console.log(f.length ? `\n✗ ${f.length} avvik` : "✓ ingen avvik i det som skal være likt");
    process.exit(f.length ? 1 : 0);
  }
  console.log("| Hva | Verdi i repoet | Nærmeste rolle | Verdi i designsystemet |\n|---|---|---|---|");
  console.log(avvikTabell().join("\n"));
}
