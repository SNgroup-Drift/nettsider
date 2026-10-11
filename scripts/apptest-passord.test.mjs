// Vakt for passordet foran hengsel.no/apptest (K-107) og demopassordet (K-114): konfigurasjonen og merkene må henge sammen.
// Kjøres av npm test. Ingen passord eller hemmeligheter leses eller skrives her.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const rot = join(import.meta.dirname, "..", "sites", "hengsel");
const les = (sti) => readFileSync(join(rot, sti), "utf8");
const utenKommentarer = (jsonc) => jsonc.replace(/^\s*\/\/.*$/gm, "");

test("wrangler.jsonc sender /apptest gjennom Workeren først", () => {
  const w = JSON.parse(utenKommentarer(les("wrangler.jsonc")));
  assert.equal(w.main, "./worker/apptest.ts");
  assert.deepEqual(w.assets.run_worker_first, ["/apptest", "/apptest/*"]);
});

test("Workeren låser siden uten hemmelighet og setter inn demopassordet med samme merker som siden", () => {
  const worker = les("worker/apptest.ts");
  const side = les("src/pages/apptest.astro");
  assert.match(worker, /status: 503/);
  assert.match(worker, /DEMO_PASSORD/);
  for (const merke of ["data-demopassord-verdi", "data-demopassord", "data-uten-demopassord"]) {
    assert.ok(worker.includes(`[${merke}]`), `Workeren mangler ${merke}`);
    assert.ok(side.includes(merke), `apptest.astro mangler ${merke}`);
  }
  // Demopassordet står aldri i siden: verdien er tom i det som bygges
  assert.match(side, /<code data-demopassord-verdi><\/code>/);
});

test("passordsiden har teksten fra bestillingen", () => {
  const s = les("src/pages/apptest/passord.astro");
  for (const tekst of ["Skriv passordet du fikk sammen med lenken.", "Feil passord. Prøv igjen, eller spør Eirik.", ">Åpne</button>", 'autocomplete="current-password"', 'type="password"']) {
    assert.ok(s.includes(tekst), `passord.astro mangler ${tekst}`);
  }
});
