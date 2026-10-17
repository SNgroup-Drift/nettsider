/**
 * N-6 (Eirik 18.10): flere bilder og simuleringer på hengsel.no (regel 11 i docs/design/hengsel-regler.md).
 * 1. Hver side i lista har minst én simulering eller stillramme utover toppen (kilde og bygget).
 * 2. Alle bildenøklene i content/simuleringer.ts finnes i manifestet (ellers rødt), i begge temaer.
 * 3. Bildene i simuleringene har bredde og høyde (ingen CLS), og bare det første kan være eager (resten lazy).
 * 4. Skriptet og komponentene er uten style= (CSP style-src 'self') og uten fargeverdier (hex/rgb/hsl, dekket av hengsel-regler.test.mjs, sjekkes her også).
 * Kjør `npm run build` først.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { finnes } from "../packages/hengsel-tokens/skjermbilder.mjs";

const rot = resolve(import.meta.dirname, "..");
const hengsel = join(rot, "sites", "hengsel");
const les = (...d) => readFileSync(join(hengsel, ...d), "utf8");

/** kilde → bygde filer. slik-virker-det er bare i Sigdal-utgaven (K-229). */
const SIDER = {
  "src/pages/index.astro": ["index.html"],
  "src/pages/crm.astro": ["crm.html"],
  "src/pages/ute.astro": ["ute.html"],
  "src/pages/kundeportal.astro": ["kundeportal.html"],
  "src/pages/for-butikkleder.astro": ["for-butikkleder.html"],
  "src/pages/kunder.astro": ["kunder.html"],
  "src/pages/priser-og-demo.astro": ["priser-og-demo.html"],
  "src/sider/slik-virker-det.astro": ["kunde/sigdal/slik-virker-det.html"],
};
const BRUKER = /<(?:Simulering|TreEnheter|Enhet)\b/;

test("1. kilden: hver side i lista har en simulering eller stillramme utover toppen", () => {
  for (const kilde of Object.keys(SIDER)) {
    const utenTopp = les(kilde).replace(/<Sidetopp[\s\S]*?<\/Sidetopp>/g, "");
    const tekst = utenTopp.replace(/^---[\s\S]*?---/, "");
    assert.match(tekst, BRUKER, `${kilde}: ingen Simulering, TreEnheter eller Enhet utenfor toppen`);
    assert.match(tekst, /<Simuleringsflis\b/, `${kilde}: simuleringen står ikke i en Simuleringsflis`);
  }
});

test("1b. bygget: simuleringen eller stillrammen står etter toppen, og bildene har mål", () => {
  for (const filer of Object.values(SIDER)) {
    for (const f of filer) {
      const sti = join(hengsel, "dist", f);
      assert.ok(existsSync(sti), `${f} mangler: kjør npm run build først`);
      const html = readFileSync(sti, "utf8");
      const start = html.search(/class="flis [^"]*\bsimflis\b/);
      assert.ok(start > 0, `${f}: ingen simuleringsflis i bygget`);
      const etter = html.slice(start);
      assert.match(etter, /data-enhet/, `${f}: ingen enhetsramme i simuleringsflisen`);
      const topp = html.indexOf('class="sidetopp');
      if (topp >= 0) assert.ok(start > topp, `${f}: simuleringen står før toppen`);
    }
  }
});

test("2. alle bildenøklene i simuleringene finnes i manifestet (Hengsel og Sigdal)", () => {
  const kilde = les("src/content/simuleringer.ts");
  const nokler = [...new Set([...kilde.matchAll(/"((?:vis\/skjermbilder|app)\/[\w@./-]+\.webp)"/g)].map((m) => m[1]))];
  assert.ok(nokler.length >= 40, `bare ${nokler.length} bildenøkler funnet i content/simuleringer.ts`);
  const mangler = [];
  for (const n of nokler) for (const tema of ["hengsel", "sigdal"]) if (!finnes(tema, n)) mangler.push(`${tema}/${n}`);
  assert.deepEqual(mangler, [], "bilder i simuleringene som ikke står i manifestet (skjermbilder-manifest.json)");
});

test("3. bildene i simuleringene har bredde og høyde, og bare første bilde i en serie kan være eager", () => {
  for (const filer of Object.values(SIDER)) {
    for (const f of filer) {
      const html = readFileSync(join(hengsel, "dist", f), "utf8");
      for (const m of html.matchAll(/<figure class="[^"]*\bsim\b[^"]*"[^>]*data-simulering[\s\S]*?<\/figure>/g)) {
        const bilder = m[0].match(/<img\b[^>]*class="innhold[^>]*>/g) ?? [];
        assert.ok(bilder.length >= 2 || /plassholder/.test(m[0]), `${f}: en simulering med færre enn to bilder`);
        bilder.forEach((img, i) => {
          assert.match(img, /\bwidth="\d+"/, `${f}: bilde uten width`);
          assert.match(img, /\bheight="\d+"/, `${f}: bilde uten height`);
          if (i > 0) assert.match(img, /loading="lazy"/, `${f}: bilde ${i + 1} i serien er ikke lazy`);
        });
      }
    }
  }
});

test("4. skript og komponenter: ingen style=, ingen fargeverdier, bare tokens", () => {
  for (const fil of ["src/scripts/simulering.ts", "src/components/Simulering.astro", "src/components/TreEnheter.astro", "src/components/Stegmerker.astro", "src/components/kit/Simuleringsflis.astro"]) {
    const t = les(fil);
    assert.doesNotMatch(t, /\bstyle\s*=/i, `${fil}: style-attributt (CSP style-src 'self')`);
    assert.doesNotMatch(t, /#[0-9a-f]{3,8}\b/i, `${fil}: hex-farge`);
    assert.doesNotMatch(t, /\b(?:rgba?|hsla?|oklch|lab|lch)\(/i, `${fil}: fargefunksjon (bruk tokens)`);
    assert.doesNotMatch(t, /prefers-color-scheme|data-theme|\.dark\b/, `${fil}: mørk modus`);
  }
  const skript = les("src/scripts/simulering.ts");
  assert.match(skript, /IntersectionObserver/, "simulering.ts: går bare når rammen er synlig");
  assert.match(skript, /prefers-reduced-motion/, "simulering.ts: stopper ved prefers-reduced-motion");
  assert.match(les("src/components/Simulering.astro"), /prefers-reduced-motion/, "Simulering.astro: ingen overgang ved prefers-reduced-motion");
});
