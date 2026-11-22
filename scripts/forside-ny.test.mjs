/**
 * Ny forside på hengsel.no (prøveside): priskalkulatoren og tidslinjen.
 *  a) kalkulatoren regner med den felles prisberegningen (packages/pris) og eksempelprislisten, og tallene er runde plassholdere
 *  b) kalkulatoren viser aldri ekte priser: eksempelprislisten er merket eksempel, og ingen pris fra en ekte prisliste (D1/Admin) står i koden
 *  c) tidslinjen har trinn i fast rekkefølge, og siden har ingen eksterne skript
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const rot = resolve(import.meta.dirname, "..");
const hengsel = join(rot, "sites", "hengsel", "src");
const { EKSEMPEL_PRISLISTE, oppstilling, RADER } = await import(join(hengsel, "content", "kalkulator.ts"));
const felles = await import(join(rot, "packages", "pris", "src", "pris.js"));
const admin = await import(join(rot, "sites", "admin", "src", "lib", "pris.js"));

test("Admin og nettsiden bruker samme prisberegning", () => {
  assert.equal(admin.beregn, felles.beregn);
  assert.equal(admin.normaliserPrisliste, felles.normaliserPrisliste);
});

test("kalkulatoren: 1 butikk, 3 brukere, 0 montører", () => {
  const o = oppstilling({ butikker: 1, brukere: 3, montorer: 0 });
  assert.deepEqual(Object.keys(o.rader), [...RADER]);
  assert.equal(o.rader.pakker.belop, "1 000 kr");
  assert.equal(o.rader.brukere.vis, false);
  assert.equal(o.rader.ute.vis, false);
  assert.equal(o.rader.rabatt.vis, false);
  assert.equal(o.rader.maned.belop, "1 000 kr");
  assert.equal(o.rader.aar.belop, "12 000 kr");
  assert.equal(o.rader.etablering.belop, "5 000 kr");
  assert.match(o.mva, /1 250 kr/);
});

test("kalkulatoren: ekstra brukere, Ute og kjederabatt", () => {
  const o = oppstilling({ butikker: 3, brukere: 5, montorer: 2 });
  assert.equal(o.rader.pakker.belop, "3 000 kr");
  assert.equal(o.rader.brukere.vis, true);
  assert.equal(o.rader.brukere.belop, "600 kr"); // 3 butikker × 2 ekstra × 100 kr
  assert.equal(o.rader.ute.belop, "200 kr"); // 2 montører × 100 kr er billigere enn firmapris
  assert.equal(o.rader.rabatt.vis, true);
  assert.equal(o.rader.rabatt.belop, "−190 kr"); // 5 % av 3 800 kr
  assert.equal(o.rader.maned.belop, "3 610 kr");
});

test("kalkulatoren: firmapris når den er billigere enn montørprisen", () => {
  const o = oppstilling({ butikker: 1, brukere: 3, montorer: 8 });
  assert.equal(o.rader.ute.belop, "500 kr");
  assert.match(o.rader.ute.tekst, /Firmapris/);
});

test("kalkulatoren viser aldri ekte priser: bare eksempelprislisten, med runde tall", () => {
  assert.equal(EKSEMPEL_PRISLISTE.eksempel, true);
  assert.equal(EKSEMPEL_PRISLISTE.versjon, "eksempel");
  const tall = [];
  for (const p of Object.values(EKSEMPEL_PRISLISTE.pakker.hengsel)) tall.push(p.pris_ore, p.ekstra_bruker_ore, p.etablering_ore);
  tall.push(EKSEMPEL_PRISLISTE.ute.montor_ore, EKSEMPEL_PRISLISTE.ute.firma_ore);
  for (const t of tall) assert.equal(t % 10000, 0, `${t} øre er ikke et rundt eksempeltall`);
  // Ingen import fra Admins prislistedata (D1) eller fra Workeren
  const kilde = readFileSync(join(hengsel, "content", "kalkulator.ts"), "utf8");
  const uKommentar = kilde.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const importer = [...uKommentar.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  assert.deepEqual(importer, ["../../../../packages/pris/src/pris.js"], "kalkulatoren skal bare importere den felles prisberegningen");
  assert.ok(!/fetch\(|D1|prisliste\.json/.test(uKommentar), "kalkulatoren skal ikke lese ekte prisdata");
  assert.match(kilde, /EKSEMPEL/);
});

test("tidslinjen og forsiden: ingen eksterne skript", () => {
  for (const f of ["Tidslinje.astro", "Priskalkulator.astro", "Ordrerekke.astro", "Plassholder.astro"]) {
    const s = readFileSync(join(hengsel, "components", f), "utf8");
    assert.ok(!/<script[^>]+src=["']https?:/i.test(s), `${f} laster eksternt skript`);
  }
  for (const f of readdirSync(join(hengsel, "scripts")).filter((x) => /tidslinje|priskalkulator|ordrerekke/.test(x))) {
    const s = readFileSync(join(hengsel, "scripts", f), "utf8");
    assert.ok(!/https?:\/\//.test(s.replace(/\/\*[\s\S]*?\*\//g, "")), `${f} har ekstern adresse`);
  }
});
