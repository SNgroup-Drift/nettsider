/**
 * N-7 (designsystem 2.5): produktpaletter og produktlogoer på Hengsel-sidene.
 *  a) den delte token-fila har [data-produkt]-blokkene (ute, nettsider, crm, admin) og --nivaa-*-aliasene, med verdiene fra pinnet hengsel.tokens.json
 *  b) hver side har riktig data-produkt: hengsel, vis og design = nettsider (CRM-skjermene crm, Ute-skjermene ute), admin = admin
 *  c) riktig logo: prikken i filene fra pakken (ds/produktlogo) er produktets prikk, og sidene bruker nettopp de filene
 * Kjør `npm run build` først (dist må finnes).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const json = JSON.parse(readFileSync(join(pakke, "ds", "tokens", "hengsel.tokens.json"), "utf8"));
const css = readFileSync(join(pakke, "tokens.css"), "utf8");
const pin = JSON.parse(readFileSync(join(pakke, "designsystem.pin.json"), "utf8"));
const dist = (s) => join(rot, "sites", s, "dist");
const side = (s, f) => { assert.ok(existsSync(dist(s)), `${s}: dist mangler, kjør npm run build først`); return readFileSync(join(dist(s), f), "utf8"); };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const PRODUKTER = ["ute", "nettsider", "crm", "admin"];
const ROLLER = { aksent: "aksent", "aksent-trykk": "aksent-trykk", "aksent-tekst": "aksent-tekst", "aksent-svak": "aksent-svak", "aksent-valgt": "aksent-valgt", "paa-aksent": "paa-aksent", "flate-valgt": "flate-valgt", prikk: "merke-stift", grunn: "flate-side", "grunn-hevet": "flate-kort", "grunn-senket": "flate-senket", tekst: "tekst", "tekst-dempet": "tekst-dempet", "tekst-svak": "tekst-svak" };

test("a) tokens.css har produktblokkene og nivå-aliasene fra pinnet JSON, bare lyse", () => {
  assert.equal(json.versjon, "2.5.0");
  assert.equal(pin.versjon, "2.5.0");
  for (const p of PRODUKTER) {
    const m = css.match(new RegExp(`\\n\\[data-produkt="${p}"\\] \\{([^}]*)\\}`));
    assert.ok(m, `blokken [data-produkt="${p}"] mangler i tokens.css`);
    for (const [rolle, v] of Object.entries(ROLLER)) assert.ok(m[1].includes(`--${v}: ${json.produkt[p].lys[rolle]};`), `${p}: --${v} er ikke ${json.produkt[p].lys[rolle]}`);
    assert.ok(m[1].includes("color-scheme: light;"), `${p}: color-scheme skal være light`);
  }
  assert.ok(/\[data-produkt\] \{[^}]*--nivaa-haster-fg: var\(--status-feil-fg\);[^}]*--nivaa-snart-bg: var\(--status-advarsel-bg\);[^}]*--nivaa-stripe: 3px;/.test(css), "nivå-aliasene (haster = feil, snart = advarsel, stripe 3 px) mangler");
  assert.ok(!/\[data-produkt[^\]]*\][^{]*\{[^}]*--mork-/.test(css) && !/prefers-color-scheme/.test(css), "produktblokkene skal ikke ha mørke verdier");
});

test("b) data-produkt på rot-elementet per side, og på CRM- og Ute-skjermene", () => {
  const html = (t) => t.match(/<html[^>]*>/)[0];
  assert.match(html(side("hengsel", "index.html")), /data-produkt="nettsider"/);
  assert.match(html(side("hengsel", "crm.html")), /data-produkt="nettsider"/);
  assert.match(html(side("design", "index.html")), /data-produkt="nettsider"/);
  assert.match(html(side("vis", "index.html")), /data-produkt="nettsider"/);
  assert.match(html(side("admin", "index.html")), /data-produkt="admin"/);
  assert.match(html(side("admin", "logg-inn.html")), /data-produkt="admin"/);
  assert.match(side("hengsel", "index.html"), /<div class="crm [^"]*" data-produkt="crm"/, "CRM-skjermene på forsiden skal ha data-produkt=crm");
  assert.match(side("hengsel", "ute.html"), /data-produkt="ute"/, "Ute-flaten på /ute skal ha data-produkt=ute");
  assert.match(side("hengsel", "crm.html"), /class="innhold[^"]*" data-produkt="crm"/);
  assert.match(side("vis", "crm/index.html"), /data-produkt="crm" [^>]*data-bilder="crm-/, "CRM-rammene i Visningsrommet skal ha data-produkt=crm");
  assert.match(side("vis", "montor/index.html"), /data-produkt="ute" [^>]*data-bilder="ute-/, "Ute-rammene i Visningsrommet skal ha data-produkt=ute");
  // Kundeutgaven (K-223) har kundens tema, ikke Hengsels produktpaletter
  assert.ok(!/data-produkt="/.test(side("hengsel", "kunde/sigdal.html")), "Sigdal-utgaven skal ikke ha data-produkt");
  assert.ok(!/data-produkt="/.test(side("hengsel", "kunde/sigdal/ute.html")), "Sigdal-utgaven av /ute skal ikke ha data-produkt");
  // Det finnes bare fire produkter, og aldri på noe annet enn de fire
  for (const s of ["hengsel", "design", "admin", "vis"]) {
    const alle = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === "_astro" || e.name === "ds" ? [] : alle(join(d, e.name))) : e.name.endsWith(".html") ? [join(d, e.name)] : []);
    for (const f of alle(dist(s))) for (const m of readFileSync(f, "utf8").matchAll(/data-produkt="([^"]*)"/g)) assert.ok(PRODUKTER.includes(m[1]) || m[1].includes(" | "), `${f}: ukjent produkt «${m[1]}»`); // «ute | nettsider | …» er forklaringsteksten på /farger
  }
});

test("c) produktlogoene: riktig prikk, byte for byte fra pakken, brukt av riktig side", () => {
  const logo = (n) => readFileSync(join(pakke, "ds", "produktlogo", `logo-${n}-lys.svg`));
  const forventet = { hengsel: "nettsider", crm: "crm", ute: "ute", admin: "admin" };
  for (const [fil, p] of Object.entries(forventet)) {
    const f = logo(fil);
    assert.ok(f.toString().toLowerCase().includes(json.produkt[p].lys.prikk.toLowerCase()), `logo-${fil}-lys.svg har ikke prikken til ${p} (${json.produkt[p].lys.prikk})`);
    assert.equal(sha(f), pin.filer[`produktlogo/logo-${fil}-lys.svg`], `logo-${fil}-lys.svg er endret etter pinning`);
  }
  const bruk = (s, f, n) => { const m = side(s, f).match(new RegExp(`/_astro/logo-${n}-lys\\.[\\w-]+\\.svg`)); assert.ok(m, `${s}/${f}: logo-${n}-lys.svg mangler`); assert.equal(sha(readFileSync(join(dist(s), m[0]))), sha(logo(n)), `${s}/${f}: logoen er ikke filen fra pakken`); };
  bruk("hengsel", "index.html", "hengsel");
  bruk("hengsel", "index.html", "crm");
  bruk("admin", "logg-inn.html", "admin");
  assert.ok(!/hengsel-aksent-lys|hengsel-crm-aksent-lys/.test(side("hengsel", "index.html")), "gamle grønne logoer (hengsel-aksent-lys) står på forsiden");
  const vis = side("vis", "crm/index.html");
  assert.ok(/\/assets\/logo\/logo-hengsel-lys\.svg/.test(vis) && /\/assets\/logo\/logo-crm-lys\.svg/.test(side("vis", "prov/index.html") + side("vis", "levprov/index.html") + side("vis", "montor/index.html") + side("vis", "butikken/index.html")) && !/hengsel-aksent-lys|hengsel-crm-aksent-lys/.test(vis), "Visningsrommet skal bruke produktlogoene");
  for (const n of ["hengsel", "crm"]) assert.equal(sha(readFileSync(join(dist("vis"), "assets", "logo", `logo-${n}-lys.svg`))), sha(logo(n)));
  // design.hengsel.no viser alle fire palettene og alle 72 ikonene fra pakken
  const farger = side("design", "farger.html");
  for (const p of PRODUKTER) assert.ok(farger.includes(`id="produkt-${p}"`), `palettkortet ${p} mangler på /farger`);
});
