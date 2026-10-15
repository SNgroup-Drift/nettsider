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
  assert.deepEqual(w.assets.run_worker_first, ["/apptest", "/apptest/*", "/api/demo", "/kunde", "/kunde/*"]);
  assert.match(les("worker/index.ts"), /import apptest from "\.\/apptest"/);
});

test("Workeren låser siden uten hemmelighet og setter inn demopassordet med samme merker som siden", () => {
  const worker = les("worker/apptest.ts");
  const side = les("src/pages/apptest.astro");
  assert.match(worker, /status: 503/);
  assert.match(worker, /DEMO_PASSORD/);
  for (const merke of ["data-demopassord", "data-demopassord-verdi", "data-demopassord-knapp", "data-uten-demopassord"]) {
    assert.ok(worker.includes(`[${merke}]`), `Workeren mangler ${merke}`);
    assert.ok(side.includes(merke), `apptest.astro mangler ${merke}`);
  }
  // Demopassordet står aldri i siden: hver rolle har en span med bare prikker, og Workeren fyller den inn
  assert.match(side, /<span[^>]*data-demopassord=\{r\.id\}>••••••••<\/span>/);
  assert.match(side, /data-demopassord-knapp hidden/);
});

test("passordsiden har teksten fra bestillingen", () => {
  const s = les("src/pages/apptest/passord.astro");
  for (const tekst of ["Skriv passordet du fikk sammen med lenken.", "Feil passord.</b> Prøv igjen, eller spør Eirik.", ">Åpne</button>", 'autocomplete="current-password"', 'type="password"', 'action="/apptest"', "data-feil hidden", 'id="passord"']) {
    assert.ok(s.includes(tekst), `passord.astro mangler ${tekst}`);
  }
});

test("«Prøv med demobrukerne» står etter installeringskortene, med PDF og begge brukerlistene, og uten passord i koden", () => {
  const side = les("src/pages/apptest.astro");
  const i = side.indexOf('id="installer"');
  const d = side.indexOf("Prøv med demobrukerne");
  const r = side.indexOf('aria-labelledby="roller-tittel"');
  assert.ok(i > 0 && d > i && r > d, "demodelen skal stå etter installeringskortene og før rollene");
  for (const tekst of ["I appen", "I CRM-et", "Last ned oversikten (PDF)", "/apptest/Logg_inn_i_demoen.pdf", "@demo.invalid", "Passordet får du av den som inviterte deg."]) {
    assert.ok(side.includes(tekst), `apptest.astro mangler ${tekst}`);
  }
  assert.match(side, /<code[^>]*data-demopassord-verdi>••••••••<\/code>/);
  assert.match(les("worker/apptest.ts"), /\[data-demopassord-verdi\]/);
});
