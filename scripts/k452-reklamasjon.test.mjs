/**
 * K-452: «Meld reklamasjon» for Hamar, Lillehammer og Gjøvik står i bunnen på alle sidene i Sigdal-utgaven (/kunde/sigdal) og lenker til
 * skjemaet i appen (https://app.hengsel.no/#/nettside/<butikk>/reklamasjon, 21-505 i hengsel-crm). Visningsrommet har sin egen ramme. Hengsel-sidene har ikke lenkene. Kjør `npm run build` først.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const dist = join(resolve(import.meta.dirname, ".."), "sites", "hengsel", "dist");
const alle = (dir) => readdirSync(dir).flatMap((e) => { const s = join(dir, e); return statSync(s).isDirectory() ? alle(s) : [s]; });
const BUTIKKER = [["Hamar", "hamar"], ["Lillehammer", "lillehammer"], ["Gjøvik", "gjovik"]];
// Sidene med Hengsel-bunnen (Bunn.astro); Visningsrommet under /kunde/sigdal/vis har sin egen ramme
const sigdal = [join(dist, "kunde", "sigdal.html"), ...alle(join(dist, "kunde", "sigdal")).filter((f) => f.endsWith(".html"))]
  .filter((f) => readFileSync(f, "utf8").includes('<footer class="bunn'));

test("K-452: hver side i Sigdal-utgaven har «Meld reklamasjon» for de tre butikkene, til skjemaet i appen", () => {
  assert.ok(sigdal.length > 3, "fant ikke de bygde sidene under /kunde/sigdal");
  for (const f of sigdal) {
    const t = readFileSync(f, "utf8");
    for (const [navn, kode] of BUTIKKER) {
      assert.ok(t.includes(`href="https://app.hengsel.no/#/nettside/${kode}/reklamasjon"`), `${relative(dist, f)}: mangler lenken for ${navn}`);
      assert.ok(t.includes(`Meld reklamasjon · ${navn}`), `${relative(dist, f)}: mangler teksten for ${navn}`);
    }
  }
});

test("K-452: Hengsel-sidene har ikke reklamasjonslenkene", () => {
  for (const f of alle(dist).filter((x) => x.endsWith(".html") && !relative(dist, x).startsWith(join("kunde", "sigdal")))) {
    assert.ok(!readFileSync(f, "utf8").includes("/#/nettside/"), `${relative(dist, f)}: har reklamasjonslenke`);
  }
});
