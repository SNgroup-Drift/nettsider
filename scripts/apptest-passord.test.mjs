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
  assert.equal(w.main, "./worker/index.ts");
  assert.deepEqual(w.assets.run_worker_first, ["/apptest", "/apptest/*", "/api/demo", "/hjelp", "/hjelp.html", "/hjelp/*"]);
  assert.match(les("worker/index.ts"), /import apptest from "\.\/apptest"/);
});

test("Workeren låser siden uten hemmelighet og setter inn demopassordet med samme merker som siden", () => {
  const worker = les("worker/apptest.ts");
  const side = les("src/pages/apptest.astro");
  assert.match(worker, /status: 503/);
  assert.match(worker, /DEMO_PASSORD/);
  for (const merke of ["data-demopassord", "data-demopassord-knapp", "data-uten-demopassord"]) {
    assert.ok(worker.includes(`[${merke}]`), `Workeren mangler ${merke}`);
    assert.ok(side.includes(merke), `apptest.astro mangler ${merke}`);
  }
  // Demopassordet står aldri i siden: hver rolle har en span med bare prikker, og Workeren fyller den inn
  assert.match(side, /<span[^>]*data-demopassord=\{r\.id\}>••••••••<\/span>/);
  assert.match(side, /data-demopassord-knapp hidden/);
});

test("passordsiden har teksten fra bestillingen", () => {
  const s = les("src/pages/apptest/passord.astro");
  for (const tekst of ["Siden er for dem som er invitert til å teste appen. Skriv inn passordet du har fått.", "Feil passord.</b> Sjekk e-posten eller SMS-en med invitasjonen og prøv igjen.", ">Åpne</button>", 'autocomplete="current-password"', 'type="password"', 'action="/apptest"', "data-feil hidden", 'id="passord"']) {
    assert.ok(s.includes(tekst), `passord.astro mangler ${tekst}`);
  }
});
