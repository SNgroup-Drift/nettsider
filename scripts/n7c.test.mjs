/**
 * N-7c (designsystem 2.10 etter K-371c andre runde, pin 3ad8cd78): nettsidene på designsystemet slik K-371c etterlater det.
 *  a) /dokumentmaler viser alle 29 malene med Designs side-N.png (55 bilder) i stedet for egne forhåndsvisninger, med bredde og høyde (ingen CLS), og alle sidene i en <details>
 *  b) mal 29-e11 er komplett (eksempel.html, felter.json, README-rad, side-1.png): ingen foreløpige maler, og 29 har eksempel- og flettefeltlenker
 *  c) LAYOUT-REGLER 3c og «Nye i 2.10» og «Nye i 2.10b» fra felter.md vises på siden; 18-e2 og 27-e10 har fritekst, merknad og testmodus-stripe i eksempel.html, og alle e-postmalene 17–29 har signatur
 *  d) tokens.css er generert fra pinnet JSON, og pinnen er K-371c-flettecommiten 3ad8cd78 (versjon 2.10.0)
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

test("b) mal 29 er komplett og ingen mal er foreløpig", () => {
  const h = les(dist, "dokumentmaler.html");
  const readme = les(dm, "README.md");
  assert.deepEqual(mapper.filter((m) => !readme.includes(`\`${m}/\``)), [], "alle malene har README-rad");
  const m = "29-e11-hvordan-gikk-det";
  for (const f of ["eksempel.html", "felter.json", "mal.html", "mal.css", "side-1.png"]) assert.ok(existsSync(join(dm, m, f)), `${m}/${f}`);
  assert.ok(h.includes(`/ds/dokumentmaler/${m}/eksempel.html`) && h.includes(`/ds/dokumentmaler/${m}/felter.json`), "29: lenker til eksempel og flettefelt");
  assert.ok(!h.includes("foreløpig") && !h.includes("Levert uten eksempel"), "ingen foreløpige maler");
  assert.equal(JSON.parse(les(rot, "sites", "design", "dist", "ds", "dokumentmaler", m, "felter.json")).dokument.length > 0, true);
  assert.match(h, /Hvordan gikk det/);
});

test("c) dokumentasjonen og e-postfeltene: 3c, «Nye i 2.10» og «Nye i 2.10b» vises; fritekst, merknad, testmodus og signatur står i eksemplene", () => {
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
  assert.match(felter, /^## Nye i 2\.10b/m, "felter.md i pinnen har «Nye i 2.10b»");
  assert.match(h, /Nye i 2\.10b/);
  assert.match(h, /Nye i 2\.10 \(29 E11/);
  for (const f of ["selger.fritekst", "selger.tittel", "bestilling.merknad", "testmodus", "portal.lenke_fornoyd"]) assert.ok(h.includes(f), `${f} vises i felttabellen`);
  assert.match(h, /Testbestilling – ikke send videre/);
  assert.match(h, /epost-signatur/);
  const e18 = les(dist, "ds", "dokumentmaler", "18-e2-tilbudet-er-klart", "eksempel.html");
  const e27 = les(dist, "ds", "dokumentmaler", "27-e10-bestilling-til-leverandor", "eksempel.html");
  assert.match(e18, /class="fritekst"/, "18-e2: fritekst");
  assert.match(e27, /class="fritekst"|class="merknad"|merknad/i, "27-e10: merknad");
  assert.match(e27, /class="testmodus"/, "27-e10: testmodus-stripe");
  for (const m of mapper.filter((x) => Number(x.slice(0, 2)) >= 17 && Number(x.slice(0, 2)) <= 27)) {
    assert.match(les(dist, "ds", "dokumentmaler", m, "eksempel.html"), /epost-signatur/, `${m}: signatur`);
  }
});

test("d) pinnen: tokens.css er generert fra den pinnede JSON-en (versjon og commit i toppkommentaren), og mal 29 er komplett", () => {
  // N-7d: pinnen er ikke lenger 3ad8cd78 (2.10.0); den gjeldende pinnen sjekkes i scripts/n7d.test.mjs. Her bare at fila følger pin-fila.
  const pin = JSON.parse(les(pakke, "designsystem.pin.json"));
  assert.equal(pin.versjon, JSON.parse(les(pakke, "ds", "tokens", "hengsel.tokens.json")).versjon);
  assert.match(les(pakke, "tokens.css"), new RegExp(`designsystem ${pin.versjon.replace(/\./g, "\\.")}, commit ${pin.commit.slice(0, 8)}\\)`));
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
