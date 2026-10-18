/**
 * N-7d (designsystem 2.12, K-378): status «ny» gråblå i alle paletter (2.11), statuskanter ≥ 3:1 mot bg (≥ 4,5:1 i økt kontrast, 2.12) og ikonene datakilde og tv.
 *  a) pinnen er K-378-commiten (versjon 2.12.0), og tokens.css/tokens-mork-prover.css er generert fra den
 *  b) «ny» er gråblå: grunnpaletten (:root, P3, økt kontrast, mørke prøver) og CRM/Admin-blokkene har JSON-ens verdier; Ute og Nettsider arver :root
 *  c) alle statuskanter i pinnet JSON har minst 3:1 mot bg (lys og mørk, grunnpalett og CRM/Admin) og minst 4,5:1 i økt kontrast, og tokens.css har de samme kantene
 *  d) ikonene datakilde og tv (ny 2.11) ligger i ds/ikoner-2-5 i 12/16/20/24 px med sha256 i pin-fila
 *  e) design.hengsel.no: /farger viser status-pillene i hvert produktkort og kant/bg i tabellen; /komponenter viser Datakilde og TV-visning (krever npm run build)
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const les = (...s) => readFileSync(join(...s), "utf8");
const json = JSON.parse(les(pakke, "ds", "tokens", "hengsel.tokens.json"));
const pin = JSON.parse(les(pakke, "designsystem.pin.json"));
const css = les(pakke, "tokens.css");
const mork = les(pakke, "tokens-mork-prover.css");
const uten$ = (o) => Object.entries(o ?? {}).filter(([k]) => !k.startsWith("$"));
const STATUS = ["ny", "pagar", "venter", "sannsynlig", "ferdig", "advarsel", "feil"];

/** K-378 flettet til demo i hengsel-crm (pinnet med npm run design:hent). */
export const PIN_COMMIT = "bf31260cd262d0a0813cc25c516a202ca2ef239b";

// WCAG-kontrast (sRGB), samme regnestykke som design.hengsel.no bruker på /farger
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const kontrast = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const blokk = (velger) => { const m = css.match(new RegExp(`\\n${velger.replace(/[[\]().*+?]/g, "\\$&")} \\{([^}]*)\\}`)); assert.ok(m, `blokken ${velger} mangler i tokens.css`); return m[1]; };
const rot$ = () => { const m = css.match(/\n:root \{([^}]*)\}/); assert.ok(m, ":root mangler"); return m[1]; };

test("a) pinnen er K-378-commiten, versjon 2.12.0, og de genererte filene følger pinnen", () => {
  assert.equal(pin.commit, PIN_COMMIT);
  assert.equal(pin.versjon, "2.12.0");
  assert.equal(json.versjon, "2.12.0");
  assert.equal(pin.repo, "SNgroup-Drift/hengsel-crm");
  for (const f of [css, mork]) assert.match(f, new RegExp(`designsystem 2\\.12\\.0, commit ${PIN_COMMIT.slice(0, 8)}\\)`), "toppkommentaren skal ha versjon og pin-commit");
});

test("b) status «ny» er gråblå i alle paletter: :root, P3, økt kontrast, mørke prøver, CRM og Admin; Ute og Nettsider arver :root", () => {
  const ny = json.status.ny;
  assert.equal(ny.lys.fg, "#405B85", "2.11: ny.lys.fg skal være gråblå #405B85 (var #1A57AD)");
  const r = rot$();
  for (const d of ["fg", "bg", "kant"]) assert.ok(r.includes(`--status-ny-${d}: ${ny.lys[d]};`), `:root --status-ny-${d} er ikke ${ny.lys[d]}`);
  for (const d of ["fg", "bg", "kant"]) assert.ok(mork.includes(`--mork-status-ny-${d}: ${ny.mork[d]};`), `mørk prøve --mork-status-ny-${d} er ikke ${ny.mork[d]}`);
  const okt = css.match(/@media \(prefers-contrast: more\) \{\n  :root \{([^}]*)\}/);
  assert.ok(okt, "økt kontrast-blokken for :root mangler");
  for (const d of ["fg", "bg", "kant"]) assert.ok(okt[1].includes(`--status-ny-${d}: ${ny["lys-okt-kontrast"][d]};`), `økt kontrast --status-ny-${d} er ikke ${ny["lys-okt-kontrast"][d]}`);
  const p3 = css.match(/@media \(color-gamut: p3\) \{\n  :root \{([^}]*)\}/);
  assert.ok(p3, "P3-blokken for :root mangler");
  assert.match(p3[1], /--status-ny-fg: color\(display-p3 /, "P3 skal ha status-ny-fg som display-p3");
  for (const p of ["crm", "admin"]) {
    const b = blokk(`[data-produkt="${p}"]`);
    const s = json.produkt[p].status?.lys;
    assert.ok(s, `${p}: egne statusverdier mangler i JSON`);
    for (const t of STATUS) for (const d of ["fg", "bg", "kant"]) assert.ok(b.includes(`--status-${t}-${d}: ${s[t][d]};`), `${p}: --status-${t}-${d} er ikke ${s[t][d]}`);
    assert.equal(s.ny.fg, ny.lys.fg, `${p}: ny.fg skal være samme gråblå som grunnpaletten`);
  }
  for (const p of ["ute", "nettsider"]) {
    assert.ok(!/--status-/.test(blokk(`[data-produkt="${p}"]`)), `${p}: skal arve statusfargene fra :root, ikke ha egne`);
    assert.ok(!json.produkt[p].status, `${p}: JSON skal ikke ha egne statusfarger`);
  }
});

test("c) statuskanter: minst 3:1 mot bg (lys, mørk, CRM, Admin) og minst 4,5:1 i økt kontrast, i JSON og i tokens.css", () => {
  const sjekk = (navn, t, krav) => assert.ok(kontrast(t.kant, t.bg) >= krav, `${navn}: kant ${t.kant} mot bg ${t.bg} er ${kontrast(t.kant, t.bg).toFixed(2)}:1, krav ${krav}:1`);
  for (const [n, s] of uten$(json.status)) {
    sjekk(`${n} lys`, s.lys, 3);
    sjekk(`${n} mørk`, s.mork, 3);
    sjekk(`${n} lys økt kontrast`, s["lys-okt-kontrast"], 4.5);
    sjekk(`${n} mørk økt kontrast`, s["mork-okt-kontrast"], 4.5);
  }
  for (const p of ["crm", "admin"]) {
    for (const [n, t] of uten$(json.produkt[p].status.lys)) sjekk(`${p} ${n} lys`, t, 3);
    for (const [n, t] of uten$(json.produkt[p].status["lys-okt-kontrast"])) sjekk(`${p} ${n} lys økt kontrast`, t, 4.5);
  }
  // Variantene for iOS har samme kantregel
  for (const [v, s] of uten$(json.ios?.varianter ?? {})) for (const [n, t] of uten$(s.status ?? {})) if (t.lys) sjekk(`ios ${v} ${n} lys`, t.lys, 3);
  // tokens.css har de samme kantene som JSON (de gamle 2.10-kantene er borte)
  const r = rot$();
  for (const [n, s] of uten$(json.status)) assert.ok(r.includes(`--status-${n}-kant: ${s.lys.kant};`), `:root --status-${n}-kant er ikke ${s.lys.kant}`);
  for (const gammel of ["#A0C6FF", "#C3BBFB", "#BDC5CF", "#E0B1E7", "#A5D39B", "#E0C07F", "#F9AEA5"]) assert.ok(!r.includes(`-kant: ${gammel};`), `2.10-kanten ${gammel} står igjen i :root`);
  const okt = css.match(/@media \(prefers-contrast: more\) \{\n  :root \{([^}]*)\}/)[1];
  for (const [n, s] of uten$(json.status)) assert.ok(okt.includes(`--status-${n}-kant: ${s["lys-okt-kontrast"].kant};`), `økt kontrast --status-${n}-kant er ikke ${s["lys-okt-kontrast"].kant}`);
});

test("d) ikonene datakilde og tv (Designs 2.11) ligger i ds/ikoner-2-5 i fire størrelser, står i ikoner.json og er pinnet med sha256", () => {
  const kart = JSON.parse(les(pakke, "ds", "ikoner-2-5", "ikoner.json"));
  assert.equal(kart.ikoner.length, 77);
  for (const navn of ["datakilde", "tv"]) {
    const i = kart.ikoner.find((x) => x.fil === navn);
    assert.ok(i, `${navn} mangler i ikoner.json`);
    assert.equal(i.ny, "2.11");
    assert.equal(i.gruppe, "verktoy");
    for (const m of ["12", "16", "20", "24"]) {
      const sti = join(pakke, "ds", "ikoner-2-5", m, `${navn}.svg`);
      assert.ok(existsSync(sti), `${m}/${navn}.svg mangler`);
      const svg = readFileSync(sti);
      assert.ok(!/stroke="#|fill="#/.test(svg.toString()), `${m}/${navn}.svg skal bruke currentColor`);
      assert.equal(pin.filer[`ikoner-2-5/${m}/${navn}.svg`], createHash("sha256").update(svg).digest("hex"), `${m}/${navn}.svg er ikke pinnet`);
    }
  }
  assert.equal(kart.ikoner.find((x) => x.fil === "tv").navn, "TV-visning");
  assert.equal(kart.ikoner.find((x) => x.fil === "datakilde").navn, "Datakilde");
});

test("e) design.hengsel.no: status-pillene i hvert produktkort og kant/bg på /farger, Datakilde og TV-visning på /komponenter", () => {
  const dist = join(rot, "sites", "design", "dist");
  assert.ok(existsSync(dist), "design: dist mangler, kjør npm run build først");
  const farger = les(dist, "farger.html");
  for (const p of ["ute", "nettsider", "crm", "admin"]) {
    const i = farger.indexOf(`id="produkt-${p}"`);
    assert.ok(i >= 0, `produktkortet ${p} mangler`);
    const kort = farger.slice(i, farger.indexOf("</article>", i));
    for (const t of STATUS) assert.ok(kort.includes(`class="pille s-${t}"`), `${p}: pillen ${t} mangler i kortet`);
    assert.match(kort, /kant\/bg minst/, `${p}: kant/bg mangler i kortet`);
  }
  assert.match(farger, /Kant\/bg \(lys · økt\)/, "tabellen skal ha kant/bg-kolonnen");
  assert.ok(!/feil-tekst">\d,\d:1<\/span> · /.test(farger) && !/· <span class="feil-tekst"/.test(farger), "ingen statuskant under kravet på /farger");
  assert.match(farger, /«ny» er gråblå/, "teksten om 2.11 mangler");
  const komp = les(dist, "komponenter.html");
  for (const n of ["Datakilde", "TV-visning", "cylinder.split.1x2"]) assert.ok(komp.includes(n), `${n} vises ikke på /komponenter`);
  assert.match(komp, /ny i 2\.11/, "«ny i 2.11» mangler på /komponenter");
  assert.match(komp, /77 strekikoner fra designsystem 2\.12\.0/, "ikonteksten skal lese antall og versjon fra pakken");
  for (const m of ["12", "16", "20", "24"]) for (const n of ["datakilde", "tv"]) assert.ok(existsSync(join(dist, "ds", "ikoner-2-5", m, `${n}.svg`)), `${m}/${n}.svg mangler i dist`);
});
