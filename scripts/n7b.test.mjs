/**
 * N-7b (designsystem 2.10): tokens, Teller og dokumentmalene på design.hengsel.no.
 *  a) den delte token-fila har Teller-tokenene, --flate-meny, --radius-rad, --skrift-mono og P3-/økt-kontrast-blokker per produkt, uten kundetema-velgere
 *  b) Admin tegner menytellerne og bjella med --teller-* (ikke egen pille)
 *  c) design.hengsel.no/dokumentmaler lister alle malene i den pinnede mappa (nummer, navn, familie, sider, forhåndsvisning, eksempel.html), uten Sigdal,
 *     med --skrift-mono på adresselinjen, og eksemplene følger CSP-en (ingen innebygd skript eller stil)
 * Kjør `npm run build` først (dist må finnes).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const css = readFileSync(join(pakke, "tokens.css"), "utf8");
const dm = join(pakke, "ds", "dokumentmaler");
const dist = join(rot, "sites", "design", "dist");
const les = (...s) => readFileSync(join(...s), "utf8");

test("a) tokens.css har Teller, --flate-meny, --radius-rad, --skrift-mono og produktblokker med P3 og økt kontrast", () => {
  for (const t of ["--teller-meny", "--teller-fane", "--teller-flis", "--teller-merke", "--teller-bg", "--teller-kant", "--teller-tekst", "--teller-haster-tekst", "--flate-meny", "--radius-rad", "--radius-liten", "--skrift-mono"]) assert.ok(new RegExp(`${t}:`).test(css), `${t} mangler`);
  assert.ok(!/data-kundetema|data-plattform|data-tema/.test(css), "kundetema- og plattformvelgere hører ikke hjemme i den delte fila");
  for (const p of ["nettsider", "crm", "admin"]) {
    assert.ok(new RegExp(`@media \\(prefers-contrast: more\\) \\{[^@]*\\[data-produkt="${p}"\\]`).test(css), `${p}: økt kontrast mangler`);
    assert.ok(new RegExp(`@media \\(color-gamut: p3\\) \\{[^@]*\\[data-produkt="${p}"\\]`).test(css) || p === "nettsider", `${p}: P3 mangler`);
  }
  const json = JSON.parse(les(pakke, "ds", "tokens", "hengsel.tokens.json"));
  assert.equal(json.versjon, "2.10.0");
  assert.equal(JSON.parse(les(pakke, "designsystem.pin.json")).versjon, "2.10.0");
  assert.equal(JSON.parse(les(pakke, "ds", "ikoner-2-5", "ikoner.json")).ikoner.length, 75);
});

test("b) Admin: menytellerne og bjella bruker --teller-*", () => {
  const skall = les(rot, "sites", "admin", "src", "styles", "skall.css");
  assert.match(skall, /\.meny \.tall:not\(:empty\) \{[^}]*var\(--teller-bg\)[^}]*var\(--teller-tekst\)/);
  assert.match(skall, /\.bjelle-tall \{[^}]*var\(--teller-bg\)/);
  assert.match(skall, /\.meny \.tall\.feil \{ color: var\(--teller-haster-tekst\)/);
  assert.ok(!/\.(meny \.tall|bjelle-tall)[^{]*\{[^}]*(background: var\(--aksent\)|var\(--status-feil-fg\); color)/.test(skall), "egen pille i aksent eller feil er igjen");
});

test("c) /dokumentmaler: alle malene fra pin-mappa, generert, uten Sigdal", () => {
  assert.ok(existsSync(join(dist, "dokumentmaler.html")), "kjør npm run build først");
  const h = les(dist, "dokumentmaler.html");
  const mapper = readdirSync(dm).filter((m) => /^\d\d-/.test(m)).sort();
  assert.equal(mapper.length, 28);
  const readme = les(dm, "README.md");
  for (const m of mapper) {
    const felt = JSON.parse(les(dm, m, "felter.json"));
    const rad = readme.split("\n").find((l) => l.includes(`\`${m}/\``));
    assert.ok(rad, `${m} står ikke i README-tabellen`);
    const [, nr, , navn, familie, sider] = rad.split("|").map((c) => c.trim());
    assert.ok(h.includes(`Mal ${nr}`), `${m}: nummer ${nr}`);
    assert.ok(h.includes(felt.dokument.replace(/&/g, "&amp;")), `${m}: navnet «${felt.dokument}» vises ikke`);
    assert.ok(h.includes(`/ds/dokumentmaler/${m}/eksempel.html`), `${m}: lenke til eksempel.html`);
    assert.ok(h.includes(`/ds/dokumentmaler/${m}/felter.json`), `${m}: lenke til felter.json`);
    assert.ok(h.includes(`/dokumentmaler/${m}.png`) && existsSync(join(dist, "dokumentmaler", `${m}.png`)), `${m}: forhåndsvisning mangler`);
    for (const f of ["eksempel.html", "felter.json", "mal.css"]) assert.ok(existsSync(join(dist, "ds", "dokumentmaler", m, f)), `${m}/${f} mangler i dist`);
    assert.equal(readdirSync(dm + "/" + m).filter((f) => /^side-\d+\.png$/.test(f)).length, Number(sider), `${m}: sider i README (${sider}) og antall side-N.png`);
    assert.ok(new RegExp(`<dt>Sider</dt><dd>${sider}</dd>`).test(h) || h.includes(`<dd>${sider}</dd>`), `${m}: antall sider`);
  }
  assert.ok(!/side-\d+\.png/.test(h), "pakkens side-N.png (kundetema) skal ikke vises");
  assert.ok(!existsSync(join(dist, "ds", "dokumentmaler", "01-tilbud", "side-1.png")), "side-N.png (kundetemaet) skal ikke ligge i dist");
  assert.ok(!/sigdal/i.test(h), "ingen Sigdal på siden");
  assert.match(h, /class="mono"[^>]*>Furuvegen 12/, "adresselinjen er satt i --skrift-mono");
  assert.match(les(rot, "sites", "design", "src", "styles", "design.css"), /\.mono \{[^}]*var\(--skrift-mono\)/);
});

test("c2) eksempel.html følger CSP-en: ingen innebygd skript eller stil, med favicon og noindex, uten Sigdal", () => {
  for (const m of readdirSync(dm).filter((x) => /^\d\d-/.test(x))) {
    const t = les(dist, "ds", "dokumentmaler", m, "eksempel.html");
    assert.ok(!/<script(?![^>]*\bsrc=)/.test(t) && !/ style="/.test(t), `${m}: innebygd skript eller stil`);
    assert.ok(t.includes('href="/favicon.ico"') && t.includes('name="robots" content="noindex'), `${m}: favicon og noindex`);
    assert.ok(!t.includes("<title>undefined"), `${m}: tittel`);
    assert.ok(!/sigdal|lausanne|newsreader/i.test(t), `${m}: Sigdal`);
  }
  assert.ok(!/sigdal|lausanne|newsreader/i.test(les(dist, "ds", "dokumentmaler", "tema", "hengsel.css")));
  assert.ok(existsSync(join(dist, "ds", "dokumentmaler", "felles", "tema.js")));
  assert.match(les(dist, "_headers"), /script-src 'self';/);
});
