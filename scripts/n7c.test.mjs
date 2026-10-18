/**
 * N-7c (designsystem 2.10 etter K-371c, pin 12c2c245): nettsidene på designsystemet slik K-371c etterlater det.
 *  a) /dokumentmaler viser alle 29 malene med Designs side-N.png (55 bilder) i stedet for egne forhåndsvisninger, med bredde og høyde (ingen CLS), og alle sidene i en <details>
 *  b) mal 29-e11 er foreløpig (ingen eksempel.html, felter.json eller README-rad) og står i FORELOPIG; testen sier fra når den er komplett, så oppføringen kan fjernes
 *  c) LAYOUT-REGLER 3c (korte stegnavn, Befaring som hendelse) vises på siden; «Nye i 2.10b» i felter.md vises hvis avsnittet finnes i pinnen
 *  d) tokens.css er generert fra pinnet JSON og pinnen er 12c2c245 eller nyere i demo (versjon 2.10.0)
 *  e) /telefon (N-8): sitemap, hovedmenyen (etter Kundeportal) og enhetsrammer-testen; nøklene telefon/* og vis/skjermbilder/*-telefon i KJENTE_MANGLER sier fra når manifestet har dem
 * Kjør `npm run build` først (dist må finnes).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";
import { KJENTE_MANGLER, lesManifest, skjermbildeNokkel } from "./lib/bildedomene.mjs";
import { SIDER_MED_RAMMER } from "./enhetsrammer.test.mjs";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const dm = join(pakke, "ds", "dokumentmaler");
const dist = join(rot, "sites", "design", "dist");
const les = (...s) => readFileSync(join(...s), "utf8");
const mapper = readdirSync(dm).filter((m) => /^\d\d-/.test(m)).sort();
const FORELOPIG = ["29-e11-hvordan-gikk-det"];

test("a) /dokumentmaler: 29 maler og Designs 55 side-N.png, med mål, alle sider i <details>, ingen egne forhåndsvisninger", () => {
  assert.ok(existsSync(join(dist, "dokumentmaler.html")), "kjør npm run build først");
  const h = les(dist, "dokumentmaler.html");
  assert.equal(mapper.length, 29);
  const bilder = mapper.flatMap((m) => readdirSync(join(dm, m)).filter((f) => /^side-\d+\.png$/.test(f)).map((f) => ({ m, f })));
  assert.equal(bilder.length, 55);
  for (const { m, f } of bilder) {
    const png = readFileSync(join(dm, m, f));
    const tag = new RegExp(`<img[^>]*src="/ds/dokumentmaler/${m}/${f}"[^>]*>`).exec(h)?.[0];
    assert.ok(tag, `${m}/${f}: bildet vises ikke`);
    assert.ok(tag.includes(`width="${png.readUInt32BE(16)}"`) && tag.includes(`height="${png.readUInt32BE(20)}"`), `${m}/${f}: bredde og høyde fra bildet`);
    assert.ok(existsSync(join(dist, "ds", "dokumentmaler", m, f)), `${m}/${f} mangler i dist`);
  }
  assert.equal((h.match(/Alle \d+ sider/g) ?? []).length, mapper.filter((m) => readdirSync(join(dm, m)).filter((f) => /^side-\d+\.png$/.test(f)).length > 1).length);
  assert.ok(!/href="\/dokumentmaler\/|src="\/dokumentmaler\//.test(h), "N-7bs egne forhåndsvisninger er borte");
  assert.ok(!existsSync(join(dist, "dokumentmaler")), "mappa dokumentmaler/ med egne PNG-er skal ikke finnes i dist");
  assert.ok(!/sigdal/i.test(h), "ingen Sigdal på siden");
  assert.match(h, /Mal 29/);
  assert.match(h, /E-post: Hvordan gikk det/);
  for (const nr of ["17", "18", "27"]) assert.match(h, new RegExp(`Mal ${nr}`), `e-postmal ${nr}`);
});

test("b) mal 29 er foreløpig: uten eksempel og flettefelt, og testen sier fra når Design har levert resten", () => {
  const h = les(dist, "dokumentmaler.html");
  for (const m of FORELOPIG) {
    const komplett = ["eksempel.html", "felter.json"].every((f) => existsSync(join(dm, m, f))) && les(dm, "README.md").includes(`\`${m}/\``);
    assert.equal(komplett, false, `${m} er nå komplett (eksempel.html, felter.json og README-rad): fjern den fra FORELOPIG i sites/design/src/lib/dokumentmaler.ts og i denne testen`);
    assert.ok(h.includes("Levert uten eksempel og flettefelt"), `${m}: merknaden mangler`);
    assert.ok(!h.includes(`/ds/dokumentmaler/${m}/eksempel.html`) && !h.includes(`/ds/dokumentmaler/${m}/felter.json`), `${m}: lenker til filer som ikke finnes`);
  }
  assert.deepEqual(mapper.filter((m) => !les(dm, "README.md").includes(`\`${m}/\``)), FORELOPIG, "maler uten README-rad er bare de foreløpige");
});

test("c) dokumentasjonen: LAYOUT-REGLER 3c (stegnavn, Befaring) vises, og «Nye i 2.10b» vises hvis den finnes i felter.md", () => {
  const h = les(dist, "dokumentmaler.html");
  const regler = les(pakke, "ds", "dokumentasjon", "LAYOUT-REGLER.md");
  assert.match(regler, /### 3c/);
  assert.match(h, /id="dokumentasjon"/);
  assert.match(h, /3c, tillegg/);
  assert.match(h, /høyst 14 tegn/);
  assert.match(h, /Befaring er ikke et steg/);
  assert.match(h, /Ferdigmelding og KS/);
  const innhold = /<main[\s\S]*<\/main>/.exec(h)?.[0] ?? "";
  assert.ok(innhold.length > 1000 && !/sigdal/i.test(innhold) && !/#[0-9a-f]{6}\b|rgb\(|hsl\(/i.test(innhold), "ingen Sigdal eller fargeverdi i innholdet");
  const felter = les(dm, "felter.md");
  if (/^#{2,4} .*Nye i 2\.10b/m.test(felter)) assert.match(h, /Nye i 2\.10b/);
  else assert.match(h, /har ikke et eget avsnitt «Nye i 2\.10b»/, "avsnittet finnes ikke i pinnen, og siden skal si det");
});

test("d) pinnen: 2.10.0 på K-371c-flettecommiten, og tokens.css er den delte fila", () => {
  const pin = JSON.parse(les(pakke, "designsystem.pin.json"));
  assert.equal(pin.versjon, "2.10.0");
  assert.match(pin.commit, /^12c2c2450a400ee8a999975f71a14daa60cf6983$/);
  assert.match(les(pakke, "tokens.css"), /designsystem 2\.10\.0, commit 12c2c245\)/);
  assert.ok(existsSync(join(dm, "29-e11-hvordan-gikk-det", "side-1.png")));
});

test("e) /telefon: i sitemap, i hovedmenyen etter Kundeportal og i enhetsrammer-testen", () => {
  assert.match(les(rot, "sites", "hengsel", "public", "sitemap.txt"), /^https:\/\/hengsel\.no\/telefon$/m);
  assert.ok(Object.hasOwn(SIDER_MED_RAMMER, "telefon.astro"), "enhetsrammer.test.mjs kjenner ikke /telefon");
  const nav = les(rot, "sites", "hengsel", "src", "content", "nav.ts");
  assert.match(nav, /\["portal", "Kundeportal", "\/kundeportal"\],\s*\["telefon", "Telefon", "\/telefon"\]/);
  const h = les(rot, "sites", "hengsel", "dist", "index.html");
  const meny = /<nav class="lenker"[\s\S]*?<\/nav>/.exec(h)?.[0] ?? "";
  assert.match(meny, /Kundeportal[\s\S]*href="\/telefon"[^>]*>Telefon</);
  const tel = les(rot, "sites", "hengsel", "dist", "telefon.html");
  assert.match(/<nav class="lenker"[\s\S]*?<\/nav>/.exec(tel)?.[0] ?? "", /href="\/telefon"[^>]*aria-current="page"/);
  assert.ok(!/href="\/telefon"/.test(/<nav class="lenker"[\s\S]*?<\/nav>/.exec(les(rot, "sites", "hengsel", "dist", "kunde", "sigdal.html"))?.[0] ?? ""), "Sigdal-utgaven har ingen /telefon");
});

test("f) KJENTE_MANGLER for /telefon: nøklene står der til K-228b har kjørt, og testen sier fra når manifestet har dem", () => {
  const nokler = new Set(Object.keys(lesManifest().filer).map((k) => skjermbildeNokkel(k.replace(/^[a-z]+\//, ""))));
  const telefon = KJENTE_MANGLER.filter((k) => /^telefon\//.test(k) || /^vis\/skjermbilder\/.+-telefon$/.test(k));
  assert.equal(telefon.length, 12, "de tolv N-8-nøklene (7 telefon/* og 5 vis/skjermbilder/*-telefon)");
  const ferdige = telefon.filter((k) => nokler.has(k));
  assert.deepEqual(ferdige, [], `K-228b har lagt disse i biblioteket: fjern dem fra KJENTE_MANGLER i scripts/lib/bildedomene.mjs (og «Skjermbilde kommer» faller bort): ${ferdige.join(", ")}`);
});
