// Dokumentdata (packages/hengsel-dokumenter/src): felles for hengsel.no og Visningsrommet. node --test scripts/dokumenter.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DOKUMENTER, LAGES_STEG } from "../packages/hengsel-dokumenter/src/data.js";
import { LAGES } from "../packages/hengsel-dokumenter/src/lages.js";
import { renderA4Side } from "../packages/hengsel-dokumenter/src/render.js";

const rot = join(import.meta.dirname, "..");

test("ni dokumenter med unike id-er, fem «Slik lages det»-tekster og minst én side", () => {
  assert.equal(DOKUMENTER.length, 9);
  assert.equal(new Set(DOKUMENTER.map((d) => d.id)).size, 9);
  for (const d of DOKUMENTER) {
    assert.equal(d.lages.length, LAGES_STEG.length, d.id);
    assert.ok(d.sider.length >= 2, `${d.id} har bare én side`);
  }
});

test("hvert dokument har 3–5 steg med skjermbilde som finnes, alt-tekst, og hva som skjer etterpå", () => {
  for (const d of DOKUMENTER) {
    const l = LAGES[d.id];
    assert.ok(l, `mangler LAGES.${d.id}`);
    assert.ok(l.steg.length >= 3 && l.steg.length <= 5, `${d.id}: ${l.steg.length} steg`);
    for (const s of l.steg) {
      assert.ok(existsSync(join(rot, "sites", "vis", "src", "skjermbilder", `${s.bilde}.webp`)), `${d.id}: ${s.bilde}.webp finnes ikke`);
      assert.ok(s.alt.length > 10 && s.t && s.s, `${d.id}: steg uten tekst eller alt`);
    }
    assert.ok(l.etterpa.some(([t]) => t === "pdf"), `${d.id}: etterpå må nevne PDF`);
    assert.ok(l.rom.length > 0);
  }
  assert.deepEqual(Object.keys(LAGES).sort(), DOKUMENTER.map((d) => d.id).sort());
});

test("nøytrale demonavn: ingen merkenavn i dokumentene eller i «Slik lages det»", () => {
  const alt = JSON.stringify([DOKUMENTER, LAGES]);
  for (const merke of ["Sigdal", "HTH", "Bosch", "Siemens", "Nobia", "Kjøkkenstudio"]) assert.ok(!alt.includes(merke), `«${merke}» står i dokumentdataene`);
});

test("hver side gjengis med «Din logo», Hengsel-logoen i bunnlinjen og sidetall, og tekst escapes", () => {
  for (const d of DOKUMENTER) {
    d.sider.forEach((s, i) => {
      const html = renderA4Side(s, { fot: d.fot, nr: i + 1, total: d.sider.length, ligg: d.ligg });
      assert.match(html, /Din logo/);
      assert.match(html, new RegExp(`Side ${i + 1} av ${d.sider.length}`));
      assert.ok(!/by Hengsel/.test(html), `${d.id} side ${i + 1}: «by Hengsel» er byttet ut med logoen`);
      assert.equal((html.match(/<img class="a4-hengsel" src="\/logo\/hengsel-lys\.svg" alt="Hengsel"/g) ?? []).length, 1, `${d.id} side ${i + 1}: Hengsel-logoen skal stå én gang, i bunnlinjen`);
      assert.equal((html.match(/Din logo/g) ?? []).length, 1, `${d.id} side ${i + 1}: «Din logo» skal stå én gang`);
      assert.equal((html.match(/hengsel[^"]*\.(svg|webp|png)/gi) ?? []).length, 1, `${d.id} side ${i + 1}: bare én Hengsel-logo som bilde (aldri to Hengsel-logoer)`);
    });
  }
  const html = renderA4Side({ navn: "x", tittel: "<b>&", blokker: [] }, { fot: "<i>", nr: 1, total: 1 });
  assert.ok(!html.includes("<b>&") && !html.includes("<i>"));
});
