#!/usr/bin/env node
/**
 * K-192: genererer den DELTE Hengsel-token-fila fra hengsel.tokens.json (pinnet, se packages/hengsel-tokens/designsystem.pin.json).
 *
 *   node scripts/lag-hengsel-tokens.mjs            skriver packages/hengsel-tokens/tokens.css og fonts.css
 *   node scripts/lag-hengsel-tokens.mjs --sjekk    exit 1 hvis filene på disk avviker fra det som genereres (brukes av hengsel-regler.test.mjs)
 *
 * tokens.css er den ENESTE fila i nettsidene som har fargeverdier. hengsel.no, vis., design. og admin. importerer den og bruker bare variablene.
 * Lys er det eneste temaet. De mørke verdiene finnes som fargeprøver (--mork-*), for design.hengsel.no som viser dem til appene og CRM-et;
 * de gjør ikke noen side mørk. Kundeeksemplenes aksent (kundetema.eksempler) ligger her også (--kunde-*), slik at ingen side har en hex.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const json = JSON.parse(readFileSync(join(pakke, "ds", "tokens", "hengsel.tokens.json"), "utf8"));
const pin = JSON.parse(readFileSync(join(pakke, "designsystem.pin.json"), "utf8"));
const uten$ = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));
const skygge = (l) => (l.length ? l.map(([x, y, b, f]) => `${x ? x + "px" : "0"} ${y}px ${b}px ${f}`).join(", ") : "none");

export function lagTokensCss() {
  const u = [];
  const v = (navn, verdi) => u.push(`  --${navn}: ${verdi};`);
  const k = (tekst) => u.push(`\n  /* ${tekst} */`);
  k("Palett: de åtte merkevarefargene og lys aksent");
  for (const [n, h] of uten$(json.palett)) v(n, h);
  k("Roller, lys utgave (nettsidene har bare denne)");
  for (const [n, r] of uten$(json.farge)) v(n, r.lys);
  k("Statustoner, lys: fg = tekst og prikk, bg = flate, kant = ramme");
  for (const [n, s] of uten$(json.status)) for (const d of ["fg", "bg", "kant"]) v(`status-${n}-${d}`, s.lys[d]);
  k("Skygger");
  for (const [n, s] of uten$(json.skygge)) v(`skygge-${n}`, skygge(s.lys));
  k("Skrift: Inter (tekst) og Newsreader (overskrifter), selvhostet (fonts.css)");
  v("skrift-familie-hengsel-tekst", json.skrift.familie.hengsel.tekst);
  v("skrift-familie-hengsel-overskrift", json.skrift.familie.hengsel.overskrift);
  v("skrift-familie-ios-tekst", json.skrift.familie.ios.tekst === "system" ? "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" : json.skrift.familie.ios.tekst);
  v("skrift-familie-ios-tittel", json.skrift.familie.ios.tittel);
  for (const [n, vekt] of uten$(json.skrift.vekt)) v(`skrift-vekt-${n}`, vekt);
  for (const [n, [px, lh]] of uten$(json.skrift.storrelse)) { v(`skrift-${n}`, `${px}px`); v(`skrift-${n}-lh`, `${lh}px`); }
  k("Radius og avstand");
  for (const [n, r] of uten$(json.radius)) v(`radius-${n}`, `${r}px`);
  for (const [n, a] of uten$(json.avstand)) v(`avstand-${n}`, `${a}px`);
  k("Mørke fargeprøver (--mork-*): vises som prøver på design.hengsel.no til appene og CRM-et. Ingen side bruker dem som sitt eget tema");
  for (const [n, r] of uten$(json.farge)) v(`mork-${n}`, r.mork ?? r.lys);
  for (const [n, s] of uten$(json.status)) for (const d of ["fg", "bg", "kant"]) v(`mork-status-${n}-${d}`, (s.mork ?? s.lys)[d]);
  for (const [n, s] of uten$(json.skygge)) v(`mork-skygge-${n}`, skygge(s.mork));
  k("Kundens aksent, eksempler fra kundetema (bare det sluttkunden ser: minst 4,5:1 mot lys bakgrunn)");
  for (const [n, e] of uten$(json.kundetema.eksempler)) { v(`kunde-${n}-aksent`, e.aksent); v(`kunde-${n}-paa-aksent`, e.paaAksent); }
  u.push("\n  color-scheme: light;");

  const sm = json.skrift.storrelseSmal;
  const blokk = (kommentar, b) => `\n/* ${kommentar} */\n@media (max-width: ${b.maksBredde}px) {\n  :root {\n${uten$(b).filter(([n]) => n !== "maksBredde").flatMap(([n, [px, lh]]) => [`    --skrift-${n}: ${px}px;`, `    --skrift-${n}-lh: ${lh}px;`]).join("\n")}\n  }\n}\n`;
  return `/* GENERERT av scripts/lag-hengsel-tokens.mjs fra ds/tokens/hengsel.tokens.json (designsystem ${json.versjon}, commit ${pin.commit.slice(0, 8)}). Ikke rediger for hånd.
 *
 * Den DELTE Hengsel-fila: hengsel.no, vis., design. og admin. importerer denne og bruker bare variablene. Det finnes ingen fargeverdier i sidene.
 * Bare lys modus: ingen prefers-color-scheme, ingen tema-attributt, ingen mørk-bryter. Se docs/design/hengsel-regler.md.
 * Fargene endres i designsystemet (innlandet-crm-sync), og deretter pinnes ny commit med: npm run design:hent */

:root {${u.join("\n").replace(/^\n/, "\n")}
}
${blokk("nettbrett", sm.nettbrett)}${blokk("telefon", sm.telefon)}`;
}

export function lagFontsCss() {
  const kilde = readFileSync(join(pakke, "ds", "tokens", "fonts.css"), "utf8");
  return kilde.replace("GENERERT av scripts/design/lag-tokens.mjs fra tokens/hengsel.tokens.json. Ikke rediger for hånd.", "GENERERT av scripts/lag-hengsel-tokens.mjs fra ds/tokens/fonts.css (pinnet). Ikke rediger for hånd.")
    .replaceAll("url('../assets/fonts/", "url('./ds/assets/fonts/");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const filer = { "tokens.css": lagTokensCss(), "fonts.css": lagFontsCss() };
  if (process.argv.includes("--sjekk")) {
    let feil = 0;
    for (const [n, t] of Object.entries(filer)) { let d = ""; try { d = readFileSync(join(pakke, n), "utf8"); } catch {} if (d !== t) { console.error(`✗ packages/hengsel-tokens/${n} avviker fra det som genereres fra pinnet hengsel.tokens.json`); feil++; } }
    console.log(feil ? `\n✗ ${feil} avvik. Kjør: node scripts/lag-hengsel-tokens.mjs` : "✓ delt token-fil samsvarer med pinnet hengsel.tokens.json");
    process.exit(feil ? 1 : 0);
  }
  for (const [n, t] of Object.entries(filer)) writeFileSync(join(pakke, n), t);
  console.log(`✓ packages/hengsel-tokens/tokens.css (${filer["tokens.css"].split("\n").length} linjer) og fonts.css`);
}
