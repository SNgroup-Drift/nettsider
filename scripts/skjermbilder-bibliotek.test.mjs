// K-233 (oppskriften fra K-228 i hengsel-crm, claude/k228/nettsider/skjermbilder-bibliotek.test.mjs): alle app-skjermbilder på Hengsel-sidene kommer fra
// biblioteket på bilder.hengsel.no. Kjør `npm run build` først (test 3–5 leser dist).
//
// 1. Ingen app-skjermbilder fra andre steder enn biblioteket (BILDEDOMENE i packages/hengsel-tokens/skjermbilder.mjs, scripts/lib/bildedomene.mjs):
//    kildefilene under sites/*/src må ikke peke på lokale app-skjermbilder (img/app, img/apptest, skjermbilder/, skjermer/, img/rom-*, img/flate-*,
//    img/hero*, img/forsta-*), og mappene med de gamle bildene skal være tomme (også plassholderne under sites/hengsel/public/kunde/sigdal/img).
//    Unntaket er nettsidenes egne bilder i LOKALE_BILDER (K-228 punkt 6, rettelsen 14.10): de 13 romkortene for rom uten app-skjermbilde
//    (sites/vis/src/img/rom-*.webp) og dokumentforsiden (sites/hengsel/public/img/dok-forside.webp) ligger i repoet, lenkes lokalt og kommer aldri i biblioteket.
// 2. Ingen app-skjermbilde har den gamle paletten: SVG/CSS/HTML/TS på Hengsel-sidene uten #5074A9 (de 31 gamle kodene dekkes av gamle-farger.test.mjs);
//    selve bildene sjekkes i workflowen i hengsel-crm (de hentes ikke her). sngroup.no har SN Groups palett og er ikke en Hengsel-side (CLAUDE.md).
// 3. Ingen side viser «Skjermbilde kommer» etter bygging, unntatt KJENTE_MANGLER (K-228-rapporten punkt 6) og, bare i Sigdal-utgavene
//    (/kunde/sigdal), LOKALE_BILDER (de finnes bare i Hengsel-utgave, K-223). Plassholderen er merket
//    <figure data-skjermbilde="<nøkkel>">. Kortene i Visningsrommet (rom.js) og skjermene i rammene (bilder.js) lages av skript: der sjekkes
//    tabellene bygg.mjs har fylt (null = plassholder).
// 4. Hver bibliotekadresse i dist (HTML og skript) står i manifestet, og KJENTE_MANGLER har bare stier som faktisk mangler der (rydd lista når bildene kommer).
// 5. Manifestkopien i repoet er gyldig og har begge temaer (Hengsel og Sigdal har samme stier, Sigdal uten hjelp/).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { BILDEDOMENE, KJENTE_MANGLER, LOKALE_BILDER, MANIFEST_FIL, TEMAER, lesManifest, skjermbildeNokkel } from "./lib/bildedomene.mjs";

export { BILDEDOMENE, KJENTE_MANGLER, LOKALE_BILDER };

const rot = resolve(import.meta.dirname, "..");
const HENGSEL_SIDER = ["hengsel", "vis", "design"];
const SIDER = [...HENGSEL_SIDER, "sngroup"];

const filer = (dir, filter) => {
  if (!existsSync(dir)) return [];
  const ut = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\/dist$|\/fasit$|\.astro$/.test(p)) ut.push(...filer(p, filter)); }
    else if (filter(p)) ut.push(p);
  }
  return ut;
};
const kilde = (f) => /\.(ts|mjs|js|html|css|md|astro)$/.test(f);
const ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ADRESSE = new RegExp(`${ESC(BILDEDOMENE)}/([\\w@./-]+\\.webp)`, "g");

test("1. ingen app-skjermbilder fra andre steder enn biblioteket", () => {
  const lokale = new Set(Object.values(LOKALE_BILDER));
  const lokaleMonster = /(["'`(])\/?(img\/app\/|img\/apptest\/|img\/dok-forside|skjermbilder\/(?!_)|skjermer\/|img\/(rom|flate|forsta|hero)[-.])/;
  const brudd = [];
  for (const side of SIDER) {
    for (const f of filer(join(rot, "sites", side, "src"), kilde)) {
      const t = readFileSync(f, "utf8");
      t.split("\n").forEach((linje, i) => { if (lokaleMonster.test(linje) && !linje.includes(BILDEDOMENE) && !linje.includes("BILDEDOMENE") && !linje.includes("LOKALE_BILDER")) brudd.push(`${f.slice(rot.length + 1)}:${i + 1}`); });
    }
    for (const mappe of ["public/img/app", "public/img/apptest", "public/skjermbilder", "public/skjermer", "public/sigdal/img", "public/kunde/sigdal/img", "src/skjermbilder", "src/img"]) {
      const bilder = filer(join(rot, "sites", side, mappe), (p) => /\.(webp|png|jpg)$/.test(p)).filter((p) => !lokale.has(p.slice(rot.length + 1)));
      if (bilder.length) brudd.push(`${side}/${mappe}: ${bilder.length} lokale bilder (${bilder.map((b) => b.split("/").pop()).join(", ")})`);
    }
  }
  assert.deepEqual(brudd, [], "app-skjermbilder skal hentes fra biblioteket");
  // Nettsidenes egne bilder ligger der lista sier
  for (const [nokkel, fil] of Object.entries(LOKALE_BILDER)) assert.ok(existsSync(join(rot, fil)), `${nokkel}: ${fil} mangler (lages av scripts/skjermbilder-vis.mjs)`);
  assert.equal(Object.keys(LOKALE_BILDER).length, 14);
  for (const s of ["rammer-vis.mjs", "lag-sigdal-plassholdere.mjs"]) assert.ok(!existsSync(join(rot, "scripts", s)), `scripts/${s} er pensjonert (K-233)`);
});

test("2. ingen gammel palett (#5074A9) på Hengsel-sidene", () => {
  const treff = [];
  for (const side of HENGSEL_SIDER) for (const f of filer(join(rot, "sites", side), (p) => /\.(svg|css|html|ts|mjs|js|astro)$/.test(p))) {
    if (/#5074A9/i.test(readFileSync(f, "utf8"))) treff.push(f.slice(rot.length + 1));
  }
  assert.deepEqual(treff, []);
});

const distMapper = () => SIDER.map((s) => join(rot, "sites", s, "dist")).filter(existsSync);

test("3. «Skjermbilde kommer» vises bare for kjente mangler (etter npm run build)", () => {
  const dist = distMapper();
  assert.ok(dist.length, "ingen dist: kjør npm run build først");
  const brudd = [];
  const sett = new Set();
  // Under /kunde/sigdal godtas også nettsidenes egne bilder som plassholder (de finnes bare i Hengsel-utgave)
  const lov = (fil, nokkel) => KJENTE_MANGLER.includes(nokkel) || (fil.includes("/kunde/sigdal") && Object.hasOwn(LOKALE_BILDER, nokkel));
  for (const d of dist) {
    for (const f of filer(d, (p) => p.endsWith(".html"))) {
      const html = readFileSync(f, "utf8");
      const re = /data-skjermbilde="([^"]+)"[^>]*>(?:(?!<\/figure>).)*Skjermbilde kommer/gs;
      let m;
      while ((m = re.exec(html))) { sett.add(m[1]); if (!lov(f, m[1])) brudd.push(`${f.slice(rot.length + 1)}: ${m[1]}`); }
      // Hengsel-utgavene lenker nettsidenes egne bilder lokalt, aldri fra biblioteket
      for (const nokkel of Object.keys(LOKALE_BILDER)) if (html.includes(`${BILDEDOMENE}/hengsel/${nokkel}.webp`) || html.includes(`${BILDEDOMENE}/sigdal/${nokkel}.webp`)) brudd.push(`${f.slice(rot.length + 1)}: ${nokkel} er nettsidenes eget bilde og skal ikke lenkes fra biblioteket`);
      if (!/data-skjermbilde=/.test(html) && html.includes(">Skjermbilde kommer<")) brudd.push(`${f.slice(rot.length + 1)}: plassholder uten data-skjermbilde (merk <figure data-skjermbilde="<nøkkel>">)`);
    }
    // Tabellene bygg.mjs fyller i Visningsrommet: rom.js BILDER (romkortene) og bilder.js SKJERM (skjermene i rammene); null = plassholder
    for (const [fil, markor, pre] of [["assets/rom.js", "BILDER", "vis/"], ["assets/bilder.js", "SKJERM", "vis/skjermbilder/"]]) {
      for (const js of [join(d, fil), join(d, "kunde", "sigdal", "vis", fil)].filter(existsSync)) {
        const t = readFileSync(js, "utf8");
        const m = new RegExp(`/\\*${markor}\\*/(\\{.*?\\})/\\*${markor}-slutt\\*/`).exec(t);
        assert.ok(m, `${js.slice(rot.length + 1)}: tabellen ${markor} er ikke fylt av bygg.mjs`);
        for (const [navn, verdi] of Object.entries(JSON.parse(m[1]))) {
          if (verdi === null) { sett.add(`${pre}${navn}`); if (!lov(js, `${pre}${navn}`)) brudd.push(`${js.slice(rot.length + 1)}: ${pre}${navn}`); }
          else if (Object.hasOwn(LOKALE_BILDER, `${pre}${navn}`) && !String(verdi.u).startsWith("/img/")) brudd.push(`${js.slice(rot.length + 1)}: ${pre}${navn} skal lenkes lokalt (/img/), ikke ${verdi.u}`);
        }
      }
    }
  }
  assert.deepEqual(brudd, [], "bilder som mangler i manifestet og ikke står i KJENTE_MANGLER");
  console.log(`  ${sett.size} plassholdernøkler i bruk (alle i KJENTE_MANGLER, eller LOKALE_BILDER under /kunde/sigdal)`);
});

test("4. bibliotekadressene i dist står i manifestet, og KJENTE_MANGLER har bare stier som mangler der", () => {
  const manifest = lesManifest();
  const dist = distMapper();
  assert.ok(dist.length, "ingen dist: kjør npm run build først");
  const brudd = [];
  const adresser = new Set();
  for (const d of dist) for (const f of filer(d, (p) => /\.(html|js)$/.test(p))) {
    for (const m of readFileSync(f, "utf8").matchAll(ADRESSE)) {
      adresser.add(m[1]);
      if (!Object.hasOwn(manifest.filer, m[1])) brudd.push(`${f.slice(rot.length + 1)}: ${m[0]}`);
    }
  }
  assert.deepEqual(brudd, [], "adresser i biblioteket som ikke står i manifestet");
  assert.ok(adresser.size > 100, `bare ${adresser.size} bibliotekadresser i dist`);
  const nokler = new Set(Object.keys(manifest.filer).map((k) => skjermbildeNokkel(k.replace(/^[a-z]+\//, ""))));
  assert.deepEqual(KJENTE_MANGLER.filter((k) => nokler.has(k)), [], "nøkler i KJENTE_MANGLER som nå finnes i manifestet: fjern dem fra lista i scripts/lib/bildedomene.mjs");
  assert.deepEqual(Object.keys(LOKALE_BILDER).filter((k) => nokler.has(k)), [], "nettsidenes egne bilder (LOKALE_BILDER) skal ikke ligge i biblioteket");
  assert.deepEqual(KJENTE_MANGLER.filter((k) => Object.hasOwn(LOKALE_BILDER, k)), [], "en nøkkel kan ikke stå både i KJENTE_MANGLER og LOKALE_BILDER");
  assert.equal(new Set(KJENTE_MANGLER).size, KJENTE_MANGLER.length, "KJENTE_MANGLER har dubletter");
  for (const k of KJENTE_MANGLER) assert.match(k, /^(app|apptest|hjelp|telefon|vis)\/[\w/-]+$/, k);
});

test("5. manifestkopien i repoet er gyldig og har begge temaer", () => {
  const m = lesManifest();
  assert.equal(m.versjon, 1);
  assert.ok(MANIFEST_FIL.endsWith("skjermbilder-manifest.json") && existsSync(MANIFEST_FIL));
  for (const tema of TEMAER) assert.ok(Object.keys(m.filer).some((k) => k.startsWith(`${tema}/`)), `ingen ${tema}-bilder i manifestet`);
  for (const [sti, f] of Object.entries(m.filer)) {
    assert.match(sti, /^(hengsel|sigdal)\/(app|apptest|hjelp|telefon|dok-forside\.webp|vis\/)/, sti);
    assert.match(f.sha256, /^[0-9a-f]{64}$/, sti);
    assert.ok(f.bredde > 0 && f.hoyde > 0 && f.bytes > 0, sti);
  }
  // Hengsel og Sigdal har de samme stiene (utenom hjelp/, som bare finnes i Hengsel-utgave)
  const per = Object.fromEntries(TEMAER.map((t) => [t, new Set(Object.keys(m.filer).filter((k) => k.startsWith(`${t}/`)).map((k) => k.slice(t.length + 1)))]));
  assert.deepEqual([...per.sigdal].filter((k) => !per.hengsel.has(k)), [], "Sigdal-bilder uten Hengsel-motstykke");
  assert.deepEqual([...per.hengsel].filter((k) => !per.sigdal.has(k) && !k.startsWith("hjelp/")), [], "Hengsel-bilder (utenom hjelp/) uten Sigdal-motstykke");
});
