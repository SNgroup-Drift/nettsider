/**
 * N-3c (Eirik 17.10): hver hengsel.no-side i lista viser appen i enhetsrammer øverst (regel 10 i docs/design/hengsel-regler.md).
 * Sjekker kilden (siden bruker Enhet i sporet «komposisjon» i Sidetopp) og bygget (rammen står i toppen, før første rad i kitet, og øverste ramme
 * lastes med en gang). Lista er sidene som hadde rammer før N-3 (2a1a969). Kjør `npm run build` først.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const hengsel = join(rot, "sites", "hengsel");

/** side i src/pages → bygd fil(er) i dist (Sigdal-utgaven der den finnes) */
export const SIDER_MED_RAMMER = {
  "index.astro": ["index.html", "kunde/sigdal.html"],
  "crm.astro": ["crm.html", "kunde/sigdal/crm.html"],
  "ute.astro": ["ute.html", "kunde/sigdal/ute.html"],
  "kundeportal.astro": ["kundeportal.html", "kunde/sigdal/kundeportal.html"],
  "telefon.astro": ["telefon.html"], // N-7c: /telefon (N-8) finnes ikke i Sigdal-utgaven
  "apptest.astro": ["apptest.html", "kunde/apptest.html", "kunde/sigdal/apptest.html"],
};

test("kilden: sidene i lista bruker Enhet i sporet «komposisjon» i Sidetopp", () => {
  for (const side of Object.keys(SIDER_MED_RAMMER)) {
    const t = readFileSync(join(hengsel, "src", "pages", side), "utf8");
    assert.match(t, /import Enhet from "\.\.\/components\/Enhet\.astro"/, `${side}: importerer ikke Enhet`);
    const topp = /<Sidetopp[\s\S]*?<\/Sidetopp>/.exec(t)?.[0] ?? "";
    assert.match(topp, /slot="komposisjon"[\s\S]*<Enhet\b/, `${side}: mangler Enhet i sporet «komposisjon» i Sidetopp`);
  }
});

test("bygget: rammen står i toppen, før første rad, og øverste ramme lastes med en gang", () => {
  for (const [side, filer] of Object.entries(SIDER_MED_RAMMER)) {
    for (const f of filer) {
      const sti = join(hengsel, "dist", f);
      assert.ok(existsSync(sti), `${f} mangler: kjør npm run build først`);
      const html = readFileSync(sti, "utf8");
      const start = html.indexOf('class="sidetopp');
      const forsteRad = html.indexOf("data-hoyde=", start);
      assert.ok(start >= 0 && forsteRad > start, `${f} (${side}): finner ikke Sidetopp og rad 1`);
      const topp = html.slice(start, forsteRad);
      assert.match(topp, /class="komp"[\s\S]*data-enhet/, `${f} (${side}): ingen enhetsramme i toppen`);
      // Øverste ramme: HTML-skjerm (CrmSkjerm/PortalSkjerm) eller bilde med loading="eager"; aldri lazy som første bilde
      const forsteBilde = /<img\b[^>]*class="innhold[^"]*"[^>]*>/.exec(topp)?.[0];
      if (forsteBilde && !/class="(?:crm|portal)\b/.test(topp)) assert.match(forsteBilde, /loading="eager"/, `${f}: øverste bilde er ikke forst`);
      for (const img of topp.match(/<img\b[^>]*class="innhold[^>]*>/g) ?? []) assert.match(img, /\bwidth="\d+"[^>]*\bheight="\d+"|\bheight="\d+"[^>]*\bwidth="\d+"/, `${f}: bilde uten bredde og høyde (CLS)`);
    }
  }
});

// ── N-10 (Eirik 18.10): MacBook som fjerde enhetsramme ────────────────────────────────────────────────────────────────────────────────────────
const les = (...d) => readFileSync(join(hengsel, ...d), "utf8");

test("N-10 kilden: Enhet.astro kjenner macbook (andel, naturlig størrelse, ingen statuslinje)", () => {
  const e = les("src", "components", "Enhet.astro");
  assert.match(e, /type: "display" \| "macbook" \| "ipad" \| "iphone"/, "type-unionen mangler macbook");
  assert.match(e, /macbook: \[1440, 900\]/, "naturlig størrelse for macbook er ikke 1440 × 900 (16:10)");
  assert.match(e, /\.macbook \.skjerm \{[^}]*left: 12\.63%; top: 14\.19%; width: 74\.75%; height: 71\.63%/, "skjermhullet (andel av bezelen) er ikke 12.63 · 14.19 · 74.75 · 71.63");
  assert.match(e, /\/img\/ramme-macbook\.webp/, "bruker ikke bezelen ramme-macbook.webp");
  const blokk = /\{type === "macbook" && \([\s\S]*?\n  \)\}/.exec(e)?.[0] ?? "";
  assert.ok(blokk, "fant ikke macbook-blokken i Enhet.astro");
  assert.doesNotMatch(blokk, /class="status"|dinlogo/, "macbook skal ikke ha statuslinje eller «Din logo» (menylinja ligger i skjermbildet)");
  assert.match(blokk, /<slot \/>/, "macbook mangler slot for tegnet innhold");
  assert.match(blokk, /<Skjermbilde\b/, "macbook mangler bibliotekbilde (bilde=/src=)");
});

test("N-10: bezelen er MacBook-rammen med gjennomsiktig skjermhull 16:10, ikke et app-skjermbilde", () => {
  const sti = join(hengsel, "public", "img", "ramme-macbook.webp");
  assert.ok(existsSync(sti), "public/img/ramme-macbook.webp mangler");
  const b = readFileSync(sti);
  assert.equal(b.toString("ascii", 0, 4), "RIFF");
  assert.equal(b.toString("ascii", 8, 12), "WEBP");
  assert.equal(b.toString("ascii", 12, 16), "VP8X", "bezelen skal ha alfakanal (VP8X)");
  assert.ok((b[20] & 0x10) !== 0, "bezelen mangler alfa-flagget (gjennomsiktig skjermhull)");
  const bredde = 1 + b.readUIntLE(24, 3), hoyde = 1 + b.readUIntLE(27, 3);
  assert.deepEqual([bredde, hoyde], [2400, 1565], "bezelen skal være 2400 × 1565");
  const hull = [(0.7475 * bredde) / (0.7163 * hoyde)];
  assert.ok(Math.abs(hull[0] - 1.6) < 0.01, `skjermhullet er ikke 16:10 (${hull[0].toFixed(3)})`);
});

test("N-10: skala.ts skalerer macbook-hullet som de andre (data-skala med data-nw/data-nh)", () => {
  const e = les("src", "components", "Enhet.astro");
  const blokk = /\{type === "macbook" && \([\s\S]*?\n  \)\}/.exec(e)?.[0] ?? "";
  assert.match(blokk, /data-skala data-nw=\{nw\} data-nh=\{nh\}/);
  assert.match(les("src", "scripts", "skala.ts"), /\[data-skala\]/);
});

test("N-10 kilden: forsiden (TreEnheter), /crm og /kundeportal bruker macbook", () => {
  assert.match(les("src", "components", "TreEnheter.astro"), /<Simulering type="macbook"/, "TreEnheter: ingen MacBook");
  assert.match(les("src", "pages", "index.astro"), /<TreEnheter\b/, "forsiden: ikke TreEnheter");
  assert.match(les("src", "pages", "index.astro"), /butikklederen på MacBook/, "forsiden: teksten nevner ikke butikklederen på MacBook");
  assert.match(les("src", "content", "simuleringer.ts"), /TRE_ENHETER = \{[\s\S]*?macbook: \[/, "TRE_ENHETER mangler macbook");
  assert.match(les("src", "pages", "crm.astro"), /<Enhet type="macbook"/, "/crm: ingen MacBook");
  assert.match(les("src", "pages", "kundeportal.astro"), /<Enhet type="macbook"[^>]*>\s*<PortalSkjerm/, "/kundeportal: portalen er ikke på MacBook");
});

test("N-10 bygget: forsiden, /crm og /kundeportal viser macbook; /crm viser alle fire enhetene; /telefon og /ute er uendret", () => {
  const dist = (f) => {
    const sti = join(hengsel, "dist", f);
    assert.ok(existsSync(sti), `${f} mangler: kjør npm run build først`);
    return readFileSync(sti, "utf8");
  };
  const har = (html, type) => new RegExp(`class="[^"]*\\benhet\\b[^"]*\\b${type}\\b`).test(html);
  for (const f of ["index.html", "crm.html", "kundeportal.html"]) {
    const html = dist(f);
    assert.ok(har(html, "macbook"), `${f}: ingen macbook-ramme`);
    assert.match(html, /\/img\/ramme-macbook\.webp/, `${f}: bezelen er ikke lenket`);
  }
  const index = dist("index.html");
  for (const t of ["display", "macbook", "ipad", "iphone"]) assert.ok(har(index, t), `index.html: mangler ${t}`);
  const crm = dist("crm.html");
  for (const t of ["display", "macbook", "ipad", "iphone"]) assert.ok(har(crm, t), `crm.html: mangler ${t}`);
  for (const f of ["telefon.html", "ute.html"]) assert.ok(!har(dist(f), "macbook"), `${f} skal være uendret (ingen MacBook)`);
});
