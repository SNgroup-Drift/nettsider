// N-2 (17.10.2026): fjerner nøkler fra KJENTE_MANGLER i scripts/lib/bildedomene.mjs når bildet har kommet i biblioteket
// (manifest-kopien packages/hengsel-tokens/skjermbilder-manifest.json, som Bibliotek-sjekk henter fra bilder.hengsel.no).
// Nøkkelen regnes som dekket når manifestet har hengsel/<nøkkel>[-lys|-mork][@1x].webp. Bare nøkler som står som strengliteraler
// fjernes; `...[...].map(...)`-linja for dok-* røres ikke (ryddes for hånd når PDF-arkene kommer; testen sier fra).
// Bruk: node scripts/rydd-kjente-mangler.mjs [--torr]   (exit 0 = ingenting å fjerne eller fjernet; skriver hva som ble fjernet)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { KJENTE_MANGLER, lesManifest, skjermbildeNokkel } from "./lib/bildedomene.mjs";

const torr = process.argv.includes("--torr");
const fil = resolve(import.meta.dirname, "lib/bildedomene.mjs");
const manifest = lesManifest();
const dekket = new Set();
for (const sti of Object.keys(manifest.filer)) {
  const [tema, ...rest] = sti.split("/");
  if (tema === "hengsel") dekket.add(skjermbildeNokkel(rest.join("/")));
}

const fjern = KJENTE_MANGLER.filter((n) => dekket.has(n));
if (fjern.length === 0) {
  console.log(`✓ kjente mangler: ingen av de ${KJENTE_MANGLER.length} nøklene finnes i manifestet (${Object.keys(manifest.filer).length} filer)`);
  process.exit(0);
}

let kilde = readFileSync(fil, "utf8");
const start = kilde.indexOf("export const KJENTE_MANGLER = [");
const slutt = kilde.indexOf("\n];", start);
if (start < 0 || slutt < 0) throw new Error("fant ikke KJENTE_MANGLER i bildedomene.mjs");
let blokk = kilde.slice(start, slutt);
const ikkeFjernet = [];
for (const n of fjern) {
  const for_ = blokk;
  // «"nøkkel", » eller «"nøkkel"» sist på linja (før kommentar/linjeslutt)
  blokk = blokk.replace(new RegExp(`"${n.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}",?[ \\t]*`), "");
  if (for_ === blokk) ikkeFjernet.push(n);
}
// Tomme linjer etter fjerning (bare innrykk) tas bort; hengende komma før kommentar beholdes av neste element
blokk = blokk.replace(/\n[ \t]+\n/g, "\n").replace(/\n[ \t]+(?=\n)/g, "");
kilde = kilde.slice(0, start) + blokk + kilde.slice(slutt);

console.log(`${torr ? "(tørr) " : ""}fjernet ${fjern.length - ikkeFjernet.length} nøkler fra KJENTE_MANGLER: ${fjern.filter((n) => !ikkeFjernet.includes(n)).join(", ")}`);
if (ikkeFjernet.length) console.log(`ikke funnet som strengliteral (rydd for hånd): ${ikkeFjernet.join(", ")}`);
if (!torr) writeFileSync(fil, kilde);
