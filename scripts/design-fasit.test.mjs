/**
 * K-182: design.hengsel.no genereres fra Hengsel-designsystemets tokens, og siden og tokens er like.
 * Krever `npm run build` først (leser sites/design/dist). Sjekker:
 *  - pinnet commit: hver fil i public/ds har sha256 som i designsystem.pin.json, og ingen filer mangler eller er lagt til
 *  - tokens.css (generert i designsystemet) har samme verdier som hengsel.tokens.json i lys og mørk, og tokens.ts samme roller
 *  - den bygde siden viser hver rolle, hver statustone og hver skriftstørrelse fra JSON med riktig verdi, alle 32 logoene, alle komponentene og alle nedlastingene
 *  - alle kontrastpar på siden er godkjent
 *  - ingen ekte navn (K-151: FORBUDT), ingen gammel H-logo, ingenting av «by Hengsel», Lausanne eller Reckless på sidene
 *  - noindex, streng CSP, favicon, og:image
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { FORBUDT } from "./lib/design.mjs";

const rot = resolve(import.meta.dirname, "..");
const side = join(rot, "sites", "design");
const ds = join(side, "public", "ds");
const dist = join(side, "dist");
const les = (...s) => readFileSync(join(...s), "utf8");
const json = JSON.parse(les(ds, "tokens", "hengsel.tokens.json"));
const pin = JSON.parse(les(side, "designsystem.pin.json"));
const uten$ = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));
const alle = (dir, pre = "") => readdirSync(dir).flatMap((e) => (statSync(join(dir, e)).isDirectory() ? alle(join(dir, e), `${pre}${e}/`) : [`${pre}${e}`]));
const bygd = () => {
  assert.ok(existsSync(join(dist, "index.html")), "sites/design/dist mangler: kjør npm run build først");
};
const html = (navn) => { bygd(); return les(dist, `${navn}.html`); };
const tekst = (h) => h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const hex = (v) => v.toUpperCase();

test("pinnet commit: filene i public/ds er uendret", () => {
  assert.match(pin.commit, /^[0-9a-f]{40}$/);
  const filer = alle(ds);
  assert.deepEqual(filer.sort(), Object.keys(pin.filer).sort(), "filsettet avviker fra pin-fila (kjør scripts/hent-designsystem.mjs)");
  for (const f of filer) assert.equal(createHash("sha256").update(readFileSync(join(ds, f))).digest("hex"), pin.filer[f], `${f} er endret etter pinning`);
  assert.equal(json.versjon, pin.versjon);
});

/** :root-blokken (lys) og mørk-blokken (@media prefers-color-scheme: dark) i tokens.css som {navn: verdi} */
function cssBlokker(css) {
  const vars = (t) => Object.fromEntries([...t.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const lys = css.slice(css.indexOf(":root {"), css.indexOf("/* nettbrett */"));
  const m = css.indexOf("@media (prefers-color-scheme: dark)");
  const mork = css.slice(m, css.indexOf(':root[data-theme="dark"]'));
  return { lys: vars(lys), mork: vars(mork) };
}

test("tokens.css har samme verdier som hengsel.tokens.json, lys og mørk", () => {
  const { lys, mork } = cssBlokker(les(ds, "tokens", "tokens.css"));
  for (const [navn, v] of uten$(json.farge)) {
    assert.equal(lys[`--${navn}`], v.lys, `--${navn} lys`);
    assert.equal(mork[`--${navn}`] ?? v.lys, v.mork ?? v.lys, `--${navn} mørk`);
  }
  for (const [navn, v] of uten$(json.status)) {
    for (const k of ["fg", "bg", "kant"]) {
      assert.equal(lys[`--status-${navn}-${k}`], v.lys[k], `--status-${navn}-${k} lys`);
      assert.equal(mork[`--status-${navn}-${k}`], v.mork[k], `--status-${navn}-${k} mørk`);
    }
  }
  for (const [navn, h] of uten$(json.palett)) assert.equal(lys[`--${navn}`], h, `--${navn}`);
  for (const [navn, [px, lh]] of uten$(json.skrift.storrelse)) { assert.equal(lys[`--skrift-${navn}`], `${px}px`); assert.equal(lys[`--skrift-${navn}-lh`], `${lh}px`); }
});

test("tokens.ts har samme roller og statustoner som JSON", () => {
  const ts = les(ds, "tokens", "tokens.ts");
  const ut = (navn) => JSON.parse(new RegExp(`export const ${navn} = (\\{[\\s\\S]*?\\n\\}) as const;`).exec(ts)[1]);
  const roller = ut("roller");
  for (const [navn, v] of uten$(json.farge)) assert.deepEqual(roller[navn], { lys: v.lys, mork: v.mork ?? v.lys }, `tokens.ts ${navn}`);
  const status = ut("status");
  for (const [navn, v] of uten$(json.status)) assert.deepEqual(status[navn], { lys: v.lys, mork: v.mork ?? v.lys }, `tokens.ts status ${navn}`);
});

test("/farger viser hver rolle, statustone og palettfarge med verdiene fra JSON", () => {
  const h = html("farger");
  const t = tekst(h);
  for (const [navn, v] of uten$(json.farge)) {
    assert.ok(t.includes(`--${navn}`), `rolle --${navn} mangler`);
    assert.ok(t.includes(v.lys) && t.includes(v.mork ?? v.lys), `verdiene til --${navn} mangler`);
  }
  for (const [navn, v] of uten$(json.status)) {
    assert.match(h, new RegExp(`data-tone="${navn}"`), `tone ${navn} mangler`);
    for (const m of ["lys", "mork"]) for (const k of ["fg", "bg", "kant"]) assert.ok(t.includes(v[m][k]), `${navn} ${m} ${k} ${v[m][k]} mangler`);
    assert.ok(h.includes(`t-${navn}-lys`) && h.includes(`t-${navn}-mork`), `pille for ${navn} i begge utgaver mangler`);
  }
  for (const [navn, farge] of uten$(json.palett)) assert.ok(t.includes(navn) && t.includes(hex(farge)), `palettfarge ${navn}`);
  // CSS-klassene har verdiene fra JSON
  for (const [navn, v] of uten$(json.farge)) assert.ok(h.includes(`.f-${navn}-lys{background:${v.lys}}`) && h.includes(`.f-${navn}-mork{background:${v.mork ?? v.lys}}`), `CSS for ${navn}`);
  assert.ok(!/✗/.test(t), "et kontrastpar er under kravet (✗)");
  assert.ok(t.includes("minst 3:1 mot mørk flate") && t.includes("ikke til liten brødtekst i mørk modus"), "regelen for kundens aksent mangler");
  for (const [navn] of uten$(json.status)) assert.ok(uten$(json.status).length === 7 && navn, "sju statustoner");
});

test("/skrift viser skalaen og skriftene fra JSON", () => {
  const h = html("skrift");
  const t = tekst(h);
  for (const [navn, [px, lh]] of uten$(json.skrift.storrelse)) assert.ok(t.includes(`--skrift-${navn}`) && t.includes(`${px} / ${lh} px`), `skala ${navn}`);
  for (const f of json.kundetema.friListe) assert.ok(h.includes(`data-fri-skrift="${f.navn}"`), `fri skrift ${f.navn}`);
  for (const k of ["SF Pro", "Inter", "Newsreader"]) assert.ok(t.includes(k));
  assert.ok(existsSync(join(ds, "assets", "fonts", "inter-latin-400-normal.woff2")) && existsSync(join(ds, "assets", "fonts", "LICENSE-Inter.txt")));
});

test("/merke viser alle 32 logoene, og filene finnes", () => {
  const h = html("merke");
  const filer = readdirSync(join(ds, "assets", "logo")).filter((f) => f.endsWith(".svg"));
  assert.equal(filer.length, 32);
  // 8 former × aksent/ensfarget × lys/mørk, som 4 fliser per form på siden
  for (const f of filer) assert.ok(h.includes(`/ds/assets/logo/${f}`), `${f} vises ikke på /merke`);
  assert.ok(existsSync(join(side, "public", "merke", "app-ikon", "crm.svg")));
});

test("/komponenter har alle komponentene i lys og mørk med brukes til og ikke til", () => {
  const h = html("komponenter");
  for (const id of ["knapper", "piller", "kort", "varsel", "faner", "tabell", "skjema", "tom-tilstand", "sheet-dialog"]) {
    const m = new RegExp(`data-komponent="${id}"[\\s\\S]*?</section>`).exec(h);
    assert.ok(m, `komponent ${id} mangler`);
    assert.ok(m[0].includes("tema-lys") && m[0].includes("tema-mork") && m[0].includes("Brukes til") && m[0].includes("Brukes ikke til"), `${id}: lys, mørk og bruk mangler`);
  }
});

test("/skjermer og /last-ned peker på filer som finnes", () => {
  for (const s of ["crm-min-dag", "crm-tilbud", "crm-ordre-kontrollmal", "crm-samtaler", "portal-tilbud", "ute-i-dag", "hengsel-no-forside"]) {
    for (const f of [`${s}.webp`, `${s}@1x.webp`]) assert.ok(existsSync(join(dist, "skjermer", f)), `skjermbilde ${f} mangler`);
  }
  const l = html("last-ned");
  for (const f of ["hengsel.tokens.json", "tokens.css", "tokens.ts", "fonts.css"]) assert.ok(l.includes(`/ds/tokens/${f}`) && existsSync(join(dist, "ds", "tokens", f)), `${f}`);
  assert.ok(l.includes("/last-ned/hengsel-logopakke.zip") && existsSync(join(dist, "last-ned", "hengsel-logopakke.zip")));
  const zip = readFileSync(join(dist, "last-ned", "hengsel-logopakke.zip"));
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal([...zip.toString("latin1").matchAll(/logo\/[\w-]+\.svg/g)].length / 2, 32, "zip-fila skal ha 32 logoer");
});

test("ingen ekte navn, ingen gammel H-logo, ingen «by Hengsel», Sigdal, Innlandet, Lausanne eller Reckless på sidene eller i nedlastingene", () => {
  bygd();
  const GAMMELT = /by Hengsel|Sigdal|innlandet|\bengsel\b|H-merke|h-merke|hengsel-merke-liten|v2-h-merke|Lausanne|Reckless|Gjennom linsa/i;
  const treff = [];
  for (const f of alle(dist).filter((f) => /\.(html|css|js|txt|svg|webmanifest)$/.test(f))) {
    const t = les(dist, f);
    const sjekk = f.endsWith(".html") ? tekst(t) + " " + [...t.matchAll(/(?:alt|title|aria-label)="([^"]*)"/g)].map((m) => m[1]).join(" ") : t;
    if ((FORBUDT.test(sjekk) || GAMMELT.test(sjekk))) treff.push(`${f}: ${(sjekk.match(FORBUDT) ?? sjekk.match(GAMMELT))[0]}`);
  }
  assert.deepEqual(treff, []);
  // Ingen unntak: heller ikke nedlastingene (hengsel.tokens.json og tokens.ts, som er designsystemets filer) har ekte kundenavn eller Sigdal-skrifter (K-190)
  for (const f of ["ds/tokens/hengsel.tokens.json", "ds/tokens/tokens.ts", "ds/tokens/tokens.css"]) {
    const t = les(dist, f);
    assert.ok(!/sigdal|innlandet|lausanne|reckless/i.test(t), `${f} har et forbudt navn`);
  }
  // Skjermbildene er lagd av scripts/fiktive-skjermer.mjs, som feiler på FORBUDT i teksten før bildet tas
});

test("noindex, streng CSP, favicon og og:image med merket v3", () => {
  bygd();
  const hoder = les(dist, "_headers");
  assert.ok(/X-Robots-Tag: noindex, nofollow/.test(hoder));
  const csp = /Content-Security-Policy: ([^\n]+)/.exec(hoder)[1];
  assert.ok(/script-src 'self';/.test(csp) && !/unsafe-inline|unsafe-eval/.test(csp) && /frame-ancestors 'none'/.test(csp) && /style-src 'self' 'sha256-/.test(csp));
  for (const navn of ["index", "merke", "farger", "skrift", "komponenter", "skjermer", "last-ned", "404"]) {
    const h = html(navn);
    assert.match(h, /<meta name="robots" content="noindex, nofollow"/, `${navn}: noindex`);
    assert.match(h, /<link rel="icon" href="\/favicon.svg"/, `${navn}: favicon`);
    assert.match(h, /<meta property="og:image" content="https:\/\/design\.hengsel\.no\/og\.png"/, `${navn}: og:image`);
    assert.ok(!/ style="/.test(h) && !/<script(?![^>]*\bsrc=)[^>]*>/.test(h), `${navn}: ingen style-attributter eller inline-skript`);
  }
  for (const f of ["favicon.svg", "favicon-32.png", "favicon-180.png", "og.png"]) assert.ok(existsSync(join(dist, f)), f);
  assert.ok(!existsSync(join(dist, "sitemap.txt")), "ingen sitemap");
});
