/**
 * N-7e (designsystem 2.13, K-388): Statusrad (ikonkolonne + radfarge) og fem nye ikoner.
 *  a) pinnen er K-388-commiten 40ea84f39 (tokens uendret, 2.12.0), og tokens.css/tokens-mork-prover.css er generert fra den
 *  b) status-ikon.json (versjon 2.13) finnes i pakken og er pinnet med sha256; alle ikonene i kartet finnes i 12/16/20/24 px, og hver farge har status-tokens
 *  c) de fem statusikonene (status-ny, -pagar, -sannsynlig, -ferdig, -ingen) er nye i 2.13 med sha256, 12 px av prisavvik og stoppet er kommet til
 *  d) delt stil og kit: statusrad.css har bare variabler og dekker alle nøklene i kartet; Tabellflis og Listeflis bruker den, Statusflis er uendret
 *  e) design.hengsel.no/komponenter har kortet «Statusrad» (krever npm run build)
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const les = (...s) => readFileSync(join(...s), "utf8");
const pin = JSON.parse(les(pakke, "designsystem.pin.json"));
const kart = JSON.parse(les(pakke, "ds", "ikoner-2-5", "status-ikon.json"));
const ikonerJson = JSON.parse(les(pakke, "ds", "ikoner-2-5", "ikoner.json"));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const NYE = ["status-ny", "status-pagar", "status-sannsynlig", "status-ferdig", "status-ingen"];

export const PIN_COMMIT = "40ea84f39aee4e3e4caa9d6e16d37a85fe2cd7ff";

test("a) pinnen er K-388-commiten, tokens er uendret (2.12.0), og de genererte filene følger pinnen", () => {
  assert.equal(pin.commit, PIN_COMMIT);
  assert.equal(pin.repo, "SNgroup-Drift/hengsel-crm");
  assert.equal(pin.versjon, "2.12.0", "K-388 endret ikke tokens");
  for (const f of ["tokens.css", "tokens-mork-prover.css"]) assert.match(les(pakke, f), new RegExp(`designsystem 2\\.12\\.0, commit ${PIN_COMMIT.slice(0, 8)}\\)`), `${f}: toppkommentaren skal ha pin-commiten`);
});

test("b) status-ikon.json (2.13) er i pakken og pinnet, alle ikonene finnes i 12/16/20/24 px, og hver farge har status-tokens", () => {
  assert.equal(kart.versjon, "2.13");
  assert.equal(pin.filer["ikoner-2-5/status-ikon.json"], sha(readFileSync(join(pakke, "ds", "ikoner-2-5", "status-ikon.json"))), "status-ikon.json er ikke pinnet med riktig sha256");
  const nokler = Object.keys(kart.ikon);
  assert.deepEqual(nokler, ["ny", "pagar", "venter", "sannsynlig", "ferdig", "advarsel", "feil", "haster", "snart", "snart-venter", "ingen"]);
  assert.deepEqual(Object.keys(kart.farge), nokler, "ikon og farge skal ha de samme nøklene");
  const css = les(pakke, "tokens.css");
  for (const [n, ikon] of Object.entries(kart.ikon)) {
    for (const m of ["12", "16", "20", "24"]) {
      const sti = join(pakke, "ds", "ikoner-2-5", m, `${ikon}.svg`);
      assert.ok(existsSync(sti), `${n}: ${m}/${ikon}.svg mangler`);
      assert.ok(!/stroke="#|fill="#/.test(readFileSync(sti, "utf8")), `${m}/${ikon}.svg skal bruke currentColor`);
    }
    const f = kart.farge[n];
    if (f) for (const d of ["fg", "bg", "kant"]) assert.ok(css.includes(`--status-${f}-${d}:`), `${n}: --status-${f}-${d} mangler i tokens.css`);
  }
  assert.equal(kart.farge.ingen, null, "«ingen» har ingen statusfarge (tekst-svak)");
  assert.deepEqual(kart.nivaa, { 1: "haster", 2: "snart", 3: "snart-venter" });
});

test("c) fem nye statusikoner (ny 2.13) med sha256 i pin-fila, og 12 px av prisavvik og stoppet", () => {
  assert.equal(ikonerJson.ikoner.length, 82);
  assert.deepEqual(ikonerJson.ikoner.filter((i) => i.ny === "2.13").map((i) => i.fil), NYE);
  for (const navn of NYE) {
    const i = ikonerJson.ikoner.find((x) => x.fil === navn);
    assert.equal(i.gruppe, "status");
    for (const m of ["12", "16", "20", "24"]) {
      const svg = readFileSync(join(pakke, "ds", "ikoner-2-5", m, `${navn}.svg`));
      assert.equal(pin.filer[`ikoner-2-5/${m}/${navn}.svg`], sha(svg), `${m}/${navn}.svg er ikke pinnet`);
    }
  }
  for (const navn of ["prisavvik", "stoppet"]) {
    assert.ok(existsSync(join(pakke, "ds", "ikoner-2-5", "12", `${navn}.svg`)), `12/${navn}.svg mangler`);
    assert.equal(ikonerJson.ikoner.find((x) => x.fil === navn).filer["12"], `12/${navn}.svg`);
  }
});

test("d) statusrad.css har bare variabler og dekker alle nøklene; Tabellflis og Listeflis bruker den, Statusflis er uendret", () => {
  const css = les(pakke, "src", "statusrad.css");
  assert.ok(!/#[0-9a-fA-F]{3,8}\b|(?<![\w-])(rgba?|hsla?|oklch|oklab)\(/.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "statusrad.css skal ikke ha fargeverdier");
  for (const n of Object.keys(kart.ikon)) assert.ok(css.includes(`[data-status="${n}"]`), `statusrad.css mangler data-status="${n}"`);
  assert.ok(css.includes("--status-feil-bg") && css.includes("var(--tekst-svak)") && css.includes("inset 3px 0 0 var(--rad-kant"), "radfarge, ingen og valgt kant mangler");
  assert.ok(!/prefers-color-scheme|data-theme|\.dark/.test(css), "bare lys modus");
  const ts = les(pakke, "src", "statusrad.ts");
  assert.ok(ts.includes("status-ikon.json") && ts.includes("statusSvg"), "statusrad.ts skal lese kartet");
  const pkg = JSON.parse(les(pakke, "package.json"));
  assert.equal(pkg.exports["./statusrad"], "./src/statusrad.ts");
  assert.equal(pkg.exports["./statusrad.css"], "./src/statusrad.css");
  const kit = join(rot, "sites", "hengsel", "src", "components", "kit");
  for (const f of ["Tabellflis.astro", "Listeflis.astro"]) {
    const k = les(kit, f);
    assert.ok(k.includes("@sngroup/hengsel-tokens/statusrad") && k.includes("data-status") && k.includes("rad-ikon") && k.includes('"ingen"'), `${f} skal følge statusregelen (ikon, data-status, «ingen»)`);
    assert.ok(k.includes("medStatus"), `${f}: uten status skal raden være som før`);
  }
  assert.ok(!les(kit, "Statusflis.astro").includes("statusrad"), "Statusflis har ingen rader og er uendret");
});

test("e) design.hengsel.no/komponenter har kortet Statusrad med ikon og radfarge for haster, venter og ingen status", () => {
  const dist = join(rot, "sites", "design", "dist");
  assert.ok(existsSync(dist), "design: dist mangler, kjør npm run build først");
  const h = les(dist, "komponenter.html");
  const i = h.indexOf('id="statusrad"');
  assert.ok(i > 0, "kortet Statusrad mangler");
  const kort = h.slice(i, h.indexOf("</section>", i));
  for (const s of ["haster", "snart-venter", "ingen"]) assert.ok(kort.includes(`data-status="${s}"`), `kortet mangler rader med data-status="${s}"`);
  assert.ok(/class="rad-ikon"/.test(kort) && kort.includes('aria-selected="true"') && kort.includes("status-ikon.json"), "ikonkolonne, valgt rad og kartet skal vises");
  assert.ok((kort.match(/class="statusrad-skjult"/g) ?? []).length >= 2, "tabellhodet skal ha den tomme ikonkolonnen");
  assert.ok(!/stroke="#|fill="#/.test(kort), "ikonene skal bruke currentColor");
  for (const navn of ["Status ny", "Status pågår", "Status sannsynlig", "Status ferdig", "Ingen status"]) assert.ok(h.includes(navn), `ikonet ${navn} vises ikke på /komponenter`);
  assert.match(h, /29 av dem nye i 2\.11, 2\.13, 2\.5 og 2\.6/, "ikonteksten skal nevne 2.13");
});
