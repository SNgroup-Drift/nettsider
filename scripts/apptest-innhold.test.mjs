// Vakt for innholdet på hengsel.no/apptest (K-172): byggene, sjekklista og det som ikke skal stå i filene.
// Leser sites/hengsel/src/apptest-innhold.ts som tekst (ingen TypeScript-kjøring). Ingen passord leses eller skrives her.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = join(import.meta.dirname, "..", "sites", "hengsel", "src");
const innhold = readFileSync(join(src, "apptest-innhold.ts"), "utf8");
const side = readFileSync(join(src, "pages", "apptest.astro"), "utf8");

const blokk = (navn) => innhold.slice(innhold.indexOf(`export const ${navn}`));

test("byggene står med det nyeste først og har gyldige datoer", () => {
  const bygg = [...blokk("BYGG").slice(0, blokk("BYGG").indexOf("export interface KjentFeil")).matchAll(/bygg: (\d+),\s+versjon: "(\d+\.\d+\.\d+)",[\s\S]*?dato: "(\d{4}-\d{2}-\d{2})"/g)];
  assert.ok(bygg.length >= 3, "bygg 11, 12 og 13 skal stå i lista");
  const nr = bygg.map((m) => Number(m[1]));
  assert.deepEqual(nr, [...nr].sort((a, b) => b - a), "byggene skal stå med det nyeste først");
  const datoer = bygg.map((m) => m[3]);
  assert.deepEqual(datoer, [...datoer].sort().reverse(), "datoene skal ikke stige nedover lista");
  for (const d of datoer) assert.ok(!Number.isNaN(Date.parse(d)), `ugyldig dato ${d}`);
});

test("sjekklista har åtte punkter og starter på 0 av 8", () => {
  const liste = blokk("SJEKKLISTE").slice(0, blokk("SJEKKLISTE").indexOf("];"));
  assert.equal([...liste.matchAll(/^\s+"[^"]+",$/gm)].length, 8);
  assert.match(side, /0 av \{SJEKKLISTE\.length\}/);
  assert.match(side, /<input type="checkbox" id=\{`sjekk-\$\{i\}`\} \/>/, "ingen avkrysning er forhåndsvalgt");
});

test("kjente feil starter tom, og siden viser «Ingen kjente feil akkurat nå» når lista er tom", () => {
  assert.match(innhold, /export const KJENTE_FEIL: KjentFeil\[\] = \[\];/);
  assert.ok(side.includes("Ingen kjente feil akkurat nå"));
});

test("demobrukerne er fra K-114-lista, og ingen passord står i innholdet", () => {
  for (const b of ["montor1@demo.invalid", "firmaleder1@demo.invalid", "utkjorer@demo.invalid", "selger1@demo.invalid"]) assert.ok(innhold.includes(b), `mangler ${b}`);
  assert.ok(!/passord\s*[:=]\s*["'][^"']+["']/i.test(innhold), "innholdet skal ikke ha passord");
});

test("spørsmål og svar om TestFlight og utlogging stemmer med bestillingen", () => {
  assert.ok(innhold.includes("Testversjoner i TestFlight varer i 90 dager."));
  assert.ok(innhold.includes("Gå til Meg og trykk «Logg ut»."));
});

test("siden har ingen style-attributter, inline-skript eller eksterne kilder", () => {
  assert.ok(!/\sstyle=/.test(side), "style-attributt i apptest.astro");
  assert.ok(!/<script[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/.test(side.replace(/<script>\s*import "..\/scripts\/apptest";\s*<\/script>/, "")), "inline-skript");
  assert.ok(!/https?:\/\/(fonts|cdn|unpkg|cdnjs)/.test(side + innhold), "ekstern kilde");
});
