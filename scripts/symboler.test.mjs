/**
 * N-6b (Eirik 18.10): statuslinjens symboldefinisjoner (id-ene sb-* i <defs> i Enhet.astro, propen `symboler`) skal stå nøyaktig én gang per side.
 * Flere rammer på samme side gir ellers samme id flere ganger (ugyldig HTML, og <use href="#sb-…"> kan peke på feil kopi); ingen definisjon gir tomme
 * statuslinjer. Regelen: bare den første rammen på siden tegner symbolene, alle andre har symboler={false} (regel 11 i docs/design/hengsel-regler.md).
 * 1. kilden: Enhet.astro definerer id-ene, og ingen side under src/pages eller src/sider har mer enn én <Enhet> uten `symboler=`.
 * 2. bygget: hver side i sites/hengsel/dist definerer hver sb-id høyst én gang, og én gang når siden bruker den. Kjør `npm run build` først.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const hengsel = join(rot, "sites", "hengsel");
const les = (...d) => readFileSync(join(hengsel, ...d), "utf8");

/** Alle filer med endelsen under mappa, rekursivt */
function filer(mappe, endelse) {
  if (!existsSync(mappe)) return [];
  const ut = [];
  for (const navn of readdirSync(mappe)) {
    const sti = join(mappe, navn);
    if (statSync(sti).isDirectory()) ut.push(...filer(sti, endelse));
    else if (sti.endsWith(endelse)) ut.push(sti);
  }
  return ut;
}
const antall = (tekst, del) => tekst.split(del).length - 1;

/** id-ene Enhet.astro definerer (sb-signal, sb-wifi, sb-batteri …) */
const IDER = [...les("src/components/Enhet.astro").matchAll(/<g id="(sb-[\w-]+)"/g)].map((m) => m[1]);

test("1. kilden: Enhet.astro definerer symbolene, og hver side har høyst én ramme som tegner dem", () => {
  assert.ok(IDER.length >= 3, `fant bare ${IDER.length} sb-id-er i Enhet.astro`);
  assert.match(les("src/components/Enhet.astro"), /\{symboler && <svg/, "Enhet.astro: symbolene styres ikke av propen symboler");
  const feil = [];
  for (const sti of [...filer(join(hengsel, "src", "pages"), ".astro"), ...filer(join(hengsel, "src", "sider"), ".astro")]) {
    const tekst = readFileSync(sti, "utf8");
    const utenProp = [...tekst.matchAll(/<Enhet\b[^>]*>/g)].filter((m) => !/\bsymboler=/.test(m[0]));
    if (utenProp.length > 1) feil.push(`${relative(hengsel, sti)}: ${utenProp.length} rammer uten symboler= (bare den første skal tegne symbolene)`);
  }
  assert.deepEqual(feil, [], "sider med mer enn én <Enhet> uten symboler={false}");
});

test("2. bygget: hver side definerer hver sb-id høyst én gang, og én gang når den brukes", () => {
  const dist = join(hengsel, "dist");
  const sider = filer(dist, ".html");
  assert.ok(sider.length > 0, "sites/hengsel/dist mangler: kjør npm run build først");
  const feil = [];
  let medSymboler = 0;
  for (const sti of sider) {
    const html = readFileSync(sti, "utf8");
    const fil = relative(dist, sti);
    for (const id of IDER) {
      const def = antall(html, `id="${id}"`);
      const bruk = antall(html, `href="#${id}"`);
      if (def > 1) feil.push(`${fil}: ${id} er definert ${def} ganger`);
      if (bruk > 0 && def === 0) feil.push(`${fil}: ${id} brukes (${bruk}) men er ikke definert`);
      if (def === 1) medSymboler++;
    }
  }
  assert.deepEqual(feil, [], "symboldefinisjoner som står flere ganger eller mangler");
  assert.ok(medSymboler > 0, "ingen bygd side definerer symbolene (feil i testen eller i Enhet.astro?)");
});
