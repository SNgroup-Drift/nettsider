/**
 * K-231: merkepakke v2 (design/handoff/hengsel_merke_v2) er pinnet med sha256 og brukt riktig på sidene.
 *  a) hver utplassert fil (favicon, motion, delingsbilder, «levert av», Sigdal-merket) er byte-lik kilden i pakken og pinnen, og hver fil i ds fra pakken er lik pakkefila
 *  b) og:image: hver bygd side på hengsel.no, vis og design peker på et delingsbilde som finnes, er PNG, 1200 × 630, under 1 MB, med riktig bilde for riktig side
 *  c) favicon med hvit flis (ico og SVG) på alle fire Hengsel-sidene, motion i 1080 × 1080 og 1080 × 1920 på hengsel.no, «Levert av Hengsel» i vis-rommene
 *     (N-3: /ute, /apptest og /kundeportal følger sidekartet 25-003, 25-012 og 25-004 og har ikke lenger motion eller portal-mocken; sider som bruker dem, sjekkes)
 *  d) /kunde/sigdal har «Sigdal CRM · levert av Hengsel» i toppen (Warm Black), og Off White-utgaven finnes for mørke flater
 * Kjør npm run build først (manglende dist er feil).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { TIL_DS, UTPLASSERT } from "./lib/merkepakke.mjs";

const rot = resolve(import.meta.dirname, "..");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const les = (...s) => readFileSync(join(rot, ...s));
const alle = (dir) => readdirSync(dir).flatMap((e) => (statSync(join(dir, e)).isDirectory() ? alle(join(dir, e)) : [join(dir, e)]));
const pin = JSON.parse(les("packages", "hengsel-tokens", "designsystem.pin.json").toString("utf8"));
const pakke = join(rot, "design", "handoff", "hengsel_merke_v2");
const ds = join(rot, "packages", "hengsel-tokens", "ds");
const dist = (site) => { const d = join(rot, "sites", site, "dist"); assert.ok(existsSync(d), `sites/${site}/dist mangler: kjør npm run build først`); return d; };

/** Bredde og høyde fra PNG-hodet (IHDR) */
function png(buf) {
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "ikke PNG");
  return { b: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

test("a) pin: hver utplassert fil er uendret, lik pakkefila og pinnet (sha256)", () => {
  const m = pin.merkepakke;
  assert.ok(m, "designsystem.pin.json mangler merkepakke (node scripts/hent-merkepakke.mjs)");
  assert.equal(m.navn, "hengsel_merke_v2");
  assert.deepEqual(Object.keys(m.utplassert).sort(), UTPLASSERT.map(([, til]) => til).sort(), "utplasseringen i pin-fila avviker fra scripts/lib/merkepakke.mjs");
  for (const [til, { fra, sha256 }] of Object.entries(m.utplassert)) {
    assert.ok(existsSync(join(rot, til)), `${til} mangler`);
    assert.equal(sha(les(til)), sha256, `${til} er endret etter pinning (ikke rediger utplasserte filer for hånd)`);
    assert.equal(sha(les(fra)), sha256, `${til} er ikke lik kilden ${fra}`);
  }
  // Filene i ds fra pakken er lik pakkefila
  let n = 0;
  for (const [fraMappe, tilMappe, monster] of TIL_DS) {
    for (const f of alle(join(pakke, fraMappe)).map((x) => relative(join(pakke, fraMappe), x).split("\\").join("/"))) {
      if (fraMappe === "5-logoer-ikoner" && f.includes("/")) continue;
      if (!monster.test(f)) continue;
      assert.equal(sha(readFileSync(join(pakke, fraMappe, f))), sha(readFileSync(join(ds, "assets", tilMappe, f))), `ds/assets/${tilMappe}/${f} er ikke lik pakkefila`);
      n++;
    }
  }
  assert.ok(n >= 140, `forventet minst 140 filer fra pakken i ds, fant ${n}`);
});

test("b) og:image: hver bygd side peker på et delingsbilde som finnes (PNG, 1200 × 630, under 1 MB), med riktig bilde per side", () => {
  const FORVENTET = [
    ["hengsel", "https://hengsel.no", (rel) => (rel === "apptest.html" || rel === "kunde/apptest.html" ? "og-apptest.png" : "og-hengsel-no.png")],
    ["vis", "https://vis.hengsel.no", () => "og-vis-hengsel-no.png"],
    ["design", "https://design.hengsel.no", () => "og.png"],
  ];
  for (const [site, origin, riktig] of FORVENTET) {
    const d = dist(site);
    let antall = 0;
    for (const f of alle(d).filter((x) => x.endsWith(".html"))) {
      const rel = relative(d, f).split("\\").join("/");
      const t = readFileSync(f, "utf8");
      const m = [...t.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map((x) => x[1]);
      if (rel.startsWith("kunde/sigdal")) { assert.deepEqual(m, [], `${site}/${rel}: kundeutgaven skal ikke ha og:image`); continue; }
      assert.equal(m.length, 1, `${site}/${rel}: skal ha nøyaktig én og:image, har ${m.length}`);
      const url = new URL(m[0]);
      assert.equal(url.origin, origin, `${site}/${rel}: og:image skal være absolutt på ${origin}, var ${m[0]}`);
      assert.equal(url.pathname, "/" + riktig(rel), `${site}/${rel}: feil delingsbilde ${url.pathname}`);
      const fil = join(d, url.pathname);
      assert.ok(existsSync(fil), `${site}/${rel}: ${url.pathname} finnes ikke i dist`);
      const buf = readFileSync(fil);
      assert.deepEqual(png(buf), { b: 1200, h: 630 }, `${site}: ${url.pathname} skal være 1200 × 630`);
      assert.ok(buf.length < 1_000_000, `${site}: ${url.pathname} er over 1 MB`);
      if (/og:image:width/.test(t)) assert.match(t, /og:image:width" content="1200"[\s\S]*og:image:height" content="630"/, `${site}/${rel}: og:image:width/height`);
      assert.match(t, /<meta name="twitter:card" content="summary_large_image"/, `${site}/${rel}: twitter:card`);
      antall++;
    }
    assert.ok(antall >= 3, `${site}: fant bare ${antall} sider med og:image`);
  }
  // Kundeområdets bilde (K-229) finnes og er gyldig, selv om siden ikke finnes ennå
  const kunde = readFileSync(join(dist("hengsel"), "og-kunde.png"));
  assert.deepEqual(png(kunde), { b: 1200, h: 630 });
  // Hvert delingsbilde i pakken er lik det som brukes
  for (const [f, til] of [["og-hengsel-no.png", "sites/hengsel/dist/og-hengsel-no.png"], ["og-apptest.png", "sites/hengsel/dist/og-apptest.png"], ["og-vis-hengsel-no.png", "sites/vis/dist/og-vis-hengsel-no.png"]]) {
    assert.equal(sha(readFileSync(join(pakke, "2-deling", f))), sha(readFileSync(join(rot, til))), `${til} er ikke delingsbildet fra pakken`);
  }
});

test("c) favicon med hvit flis på alle fire Hengsel-sidene, og ingen gammel flis", () => {
  for (const site of ["hengsel", "vis", "design", "admin"]) {
    const d = dist(site);
    for (const f of ["favicon.ico", "favicon-flis.svg", "favicon-flis-16.png", "favicon-flis-32.png", "favicon-flis-48.png"]) {
      assert.ok(existsSync(join(d, f)), `${site}: ${f} mangler`);
      assert.equal(sha(readFileSync(join(d, f))), sha(readFileSync(join(pakke, "5-logoer-ikoner", f))), `${site}: ${f} er ikke filen fra pakken`);
    }
    assert.ok(!existsSync(join(d, "favicon-32.png")) && !existsSync(join(d, "favicon.svg")), `${site}: gammel favicon (avrundet flis fra runde 1 eller gjennomsiktig SVG)`);
    const ico = readFileSync(join(d, "favicon.ico"));
    assert.equal(ico.readUInt16LE(2), 1, "favicon.ico er ikke en ICO");
    const storrelser = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + i * 16] || 256).sort((a, b) => a - b);
    assert.deepEqual(storrelser, [16, 32, 48], `${site}: favicon.ico skal ha 16, 32 og 48`);
    for (const f of alle(d).filter((x) => x.endsWith(".html") && !relative(d, x).startsWith("kunde/sigdal/") && !/(^|\/)fasit\//.test(relative(d, x)))) {
      const t = readFileSync(f, "utf8");
      const rel = relative(d, f);
      assert.match(t, /<link rel="icon" href="\/favicon\.ico" sizes="any"\s*\/?>/, `${site}/${rel}: favicon.ico`);
      assert.match(t, /<link rel="icon" href="\/favicon-flis\.svg" type="image\/svg\+xml"\s*\/?>/, `${site}/${rel}: favicon-flis.svg`);
      assert.ok(!/favicon-32\.png|favicon\.svg/.test(t), `${site}/${rel}: gammel favicon`);
    }
  }
});

test("c) motion i 1080 × 1080 og 1080 × 1920 (MP4, WebM og plakat) fra pakken på hengsel.no, UteMotion peker på dem", () => {
  const d = dist("hengsel");
  for (const s of ["1080x1080", "1080x1920"]) {
    for (const e of [".mp4", ".webm", "-plakat.png"]) {
      const f = `media/ute-motion-${s}${e}`;
      assert.equal(sha(readFileSync(join(d, f))), sha(readFileSync(join(pakke, "1-motion", `ute-motion-${s}${e}`))), `${f} er ikke filen fra pakken`);
    }
    const [b, h] = s.split("x").map(Number);
    assert.deepEqual(png(readFileSync(join(d, `media/ute-motion-${s}-plakat.png`))), { b, h });
  }
  assert.ok(!existsSync(join(d, "media", "ute-motion-1080x1080-plakat.webp")), "gammel webp-plakat");
  // N-3: sidekartet (25-003, 25-012) har ikke motion på /ute og /apptest; sider som bruker UteMotion, peker på filene fra pakken
  for (const f of alle(d).filter((x) => x.endsWith(".html"))) {
    const t = readFileSync(f, "utf8");
    for (const m of t.matchAll(/<video[^>]*data-webm="[^"]*"[^>]*>/g)) {
      assert.match(m[0], /poster="\/media\/ute-motion-(1080x1080|1080x1920)-plakat\.png"/, `${relative(d, f)}: plakat`);
      assert.match(m[0], /data-webm="\/media\/ute-motion-(1080x1080|1080x1920)\.webm" data-mp4="\/media\/ute-motion-\1\.mp4"/, `${relative(d, f)}: kilder`);
    }
  }
  const komp = readFileSync(join(rot, "sites", "hengsel", "src", "components", "UteMotion.astro"), "utf8");
  assert.ok(/1080x1920/.test(komp) && /staende/.test(komp), "UteMotion skal støtte det stående formatet (1080 × 1920)");
});

test("c) «Levert av Hengsel» (lys) i alle vis-rommene og der hengsel.no bruker det, ikke «Hengsel Levering»", () => {
  const lys = sha(readFileSync(join(pakke, "5-logoer-ikoner", "levert-av-hengsel-lys.svg")));
  assert.equal(sha(readFileSync(join(dist("hengsel"), "logo", "levert-av-hengsel-lys.svg"))), lys);
  assert.equal(sha(readFileSync(join(dist("vis"), "assets", "logo", "levert-av-hengsel-lys.svg"))), lys);
  // N-3: /kundeportal følger sidekartet 25-004 (to tabeller) og har ikke portal-mocken lenger; der hengsel.no viser merket, er det riktig fil og tekst
  for (const f of alle(dist("hengsel")).filter((x) => x.endsWith(".html"))) {
    const t = readFileSync(f, "utf8");
    assert.ok(!/Hengsel Levering|hengsel-levering/.test(t), `${relative(dist("hengsel"), f)}: erstatningen «Hengsel Levering» fra K-212 runde 2`);
    for (const m of t.matchAll(/<img[^>]*src="\/logo\/levert-av-hengsel[^>]*>/g)) assert.match(m[0], /src="\/logo\/levert-av-hengsel-lys\.svg" alt="Levert av Hengsel"/, relative(dist("hengsel"), f));
  }
  const vis = dist("vis");
  let rom = 0;
  for (const f of alle(vis).filter((x) => x.endsWith(".html"))) {
    const t = readFileSync(f, "utf8");
    assert.ok(!/Hengsel Levering|hengsel-levering/.test(t), `${relative(vis, f)}: «Hengsel Levering»`);
    if (/class="levert"/.test(t)) { assert.match(t, /<img src="\/assets\/logo\/levert-av-hengsel-lys\.svg" alt="Levert av Hengsel" width="254" height="40">/, `${relative(vis, f)}: Levert av Hengsel`); rom++; }
  }
  assert.ok(rom >= 6, `forventet «Levert av» i minst seks vis-sider, fant ${rom}`);
});

test("d) /kunde/sigdal: «Sigdal CRM · levert av Hengsel» (Warm Black) i toppen i stedet for Sigdal-logoen med tekst under, Off White-utgaven finnes for mørke flater", () => {
  const d = dist("hengsel");
  const warm = "/kunde/sigdal/logo/sigdal-crm-levert-av-hengsel-warm-black";
  for (const side of ["kunde/sigdal.html", "kunde/sigdal/crm.html", "kunde/sigdal/ute.html"]) {
    const t = readFileSync(join(d, side), "utf8");
    const topp = /<header class="meny"[\s\S]*?<\/header>/.exec(t)?.[0] ?? "";
    assert.ok(topp.includes(`src="${warm}-2x.png"`) && topp.includes(`${warm}-3x.png 3x`) && topp.includes('alt="Sigdal CRM · levert av Hengsel"'), `${side}: merket skal stå i toppen`);
    assert.ok(!/kundelogo-levert|kundelogo-bilde|sigdal-logo-/.test(topp), `${side}: gammel Sigdal-logo med «levert av» som tekst under står i toppen`);
  }
  // PNG-ene er filene fra pakken, i Warm Black og Off White, i 1×, 2× og 3×. (SVG-ene i pakken har et tomt <image>: selve Sigdal-logoen mangler, så de brukes ikke.)
  for (const v of ["warm-black", "off-white"]) {
    for (const x of ["", "-2x", "-3x"]) {
      const f = `sigdal-crm-levert-av-hengsel-${v}${x}.png`;
      assert.equal(sha(readFileSync(join(d, "kunde", "sigdal", "logo", f))), sha(readFileSync(join(pakke, "6-sigdal", f))), `${f} er ikke filen fra pakken`);
    }
    assert.deepEqual(png(readFileSync(join(d, "kunde", "sigdal", "logo", `sigdal-crm-levert-av-hengsel-${v}.png`))), { b: 416, h: 48 });
    assert.ok(!existsSync(join(d, "kunde", "sigdal", "logo", `sigdal-crm-levert-av-hengsel-${v}.svg`)), "SVG-en uten Sigdal-logo skal ikke brukes");
  }
  const tomt = readFileSync(join(pakke, "6-sigdal", "sigdal-crm-levert-av-hengsel-warm-black.svg"), "utf8");
  if (/<image[^>]*><\/image>/.test(tomt) && !/href=/.test(/<image[^>]*>/.exec(tomt)[0])) console.log("merknad: Sigdal-SVG-en i pakken har et tomt <image> (PNG brukes i stedet)");
  // Visningsrommet i Sigdal-utgave har samme merke i toppfeltet
  const vis = readFileSync(join(d, "kunde", "sigdal", "vis", "index.html"), "utf8");
  assert.ok(vis.includes(`src="${warm}-2x.png"`), "Visningsrommet i Sigdal-utgave: merket i toppfeltet");
  assert.ok(!/sigdal-logo-warm-black/.test(vis));
  // Off White på mørk flate: KundeLogo tar flate="mork"
  assert.match(readFileSync(join(rot, "sites", "hengsel", "src", "components", "KundeLogo.astro"), "utf8"), /flate === "mork" \? "off-white" : "warm-black"/);
});
