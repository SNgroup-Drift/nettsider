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
