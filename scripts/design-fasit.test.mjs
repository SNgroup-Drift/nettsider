/**
 * K-182: design.hengsel.no genereres fra Hengsel-designsystemets tokens, og siden og tokens er like.
 * Krever `npm run build` først (leser sites/design/dist). Sjekker:
 *  - pinnet commit: hver fil i packages/hengsel-tokens/ds har sha256 som i designsystem.pin.json (den ene pinnen for alle Hengsel-sidene), og ingen filer mangler eller er lagt til
 *  - tokens.css (generert i designsystemet) har samme verdier som hengsel.tokens.json i lys og mørk, og tokens.ts samme roller
 *  - den bygde siden viser hver rolle, hver statustone og hver skriftstørrelse fra JSON med riktig verdi, logoene fra palettpakke v2, alle komponentene og alle nedlastingene
 *  - alle kontrastpar på siden er godkjent
 *  - ingen ekte navn (K-151: FORBUDT), ingen gammel H-logo, ingenting av «by Hengsel», Lausanne eller Reckless på sidene
 *  - noindex, streng CSP, favicon, og:image
 *  - N-5: mønstersidene 29-001–29-006 under /monstre finnes og følger sidekartet (radene og flisene), menyen har «Mønstre», sidene og kitet bruker bare
 *    tokens (ingen hex, ingen mørk modus), ingen ekte navn, og regelen under flisene er sitert ordrett fra designsystemet
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { FORBUDT } from "./lib/design.mjs";
import { BILDEDOMENE, finnes } from "./lib/bildedomene.mjs";

const rot = resolve(import.meta.dirname, "..");
const side = join(rot, "sites", "design");
const pakke = join(rot, "packages", "hengsel-tokens");
const ds = join(pakke, "ds");
const dist = join(side, "dist");
const les = (...s) => readFileSync(join(...s), "utf8");
const json = JSON.parse(les(ds, "tokens", "hengsel.tokens.json"));
const pin = JSON.parse(les(pakke, "designsystem.pin.json"));
const uten$ = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));
const alle = (dir, pre = "") => readdirSync(dir).flatMap((e) => (statSync(join(dir, e)).isDirectory() ? alle(join(dir, e), `${pre}${e}/`) : [`${pre}${e}`]));
const bygd = () => {
  assert.ok(existsSync(join(dist, "index.html")), "sites/design/dist mangler: kjør npm run build først");
};
const html = (navn) => { bygd(); return les(dist, `${navn}.html`); };
const tekst = (h) => h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const hex = (v) => v.toUpperCase();

test("pinnet commit: filene i packages/hengsel-tokens/ds er uendret", () => {
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
  for (const [navn, v] of uten$(json.farge)) assert.deepEqual({ lys: roller[navn].lys, mork: roller[navn].mork }, { lys: v.lys, mork: v.mork ?? v.lys }, `tokens.ts ${navn}`); // K-212: tokens.ts har også økt kontrast og P3
  const status = ut("status");
  for (const [navn, v] of uten$(json.status)) assert.deepEqual({ lys: status[navn].lys, mork: status[navn].mork }, { lys: v.lys, mork: v.mork ?? v.lys }, `tokens.ts status ${navn}`);
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
  for (const [navn, v] of uten$(json.farge)) assert.ok(h.includes(`.f-${navn}-lys{background:var(--${navn})}`) && h.includes(`.f-${navn}-mork{background:var(--mork-${navn})}`), `CSS for ${navn}`);
  assert.ok(!/✗/.test(t), "et kontrastpar er under kravet (✗)");
  assert.ok(t.includes("minst 3:1 mot mørk flate") && t.includes("ikke til liten brødtekst i mørk modus"), "regelen for kundens aksent mangler");
  for (const [navn] of uten$(json.status)) assert.ok(uten$(json.status).length === 7 && navn, "sju statustoner");
});

test("/skrift viser skalaen og skriftene fra JSON", () => {
  const h = html("skrift");
  const t = tekst(h);
  for (const [navn, [px, lh]] of uten$(json.skrift.storrelse)) assert.ok(t.includes(`--skrift-${navn}`) && t.includes(`${px} / ${lh} px`), `skala ${navn}`);
  for (const f of json.kundetema.friListe) assert.ok(h.includes(`data-fri-skrift="${f.navn}"`), `fri skrift ${f.navn}`);
  // K-212: Hengsel-skriften er Schibsted Grotesk. Inter og Newsreader står bare igjen som kundetemaets frie skrifter (friListe).
  for (const k of ["SF Pro", "Schibsted Grotesk"]) assert.ok(t.includes(k));
  assert.ok(existsSync(join(ds, "assets", "fonts", "schibsted-grotesk-latin-wght-normal.woff2")) && existsSync(join(ds, "assets", "fonts", "LICENSE-Schibsted-Grotesk.txt")));
});

test("/merke viser logoene fra palettpakke v2 (besluttede former og utgaver), og filene finnes", () => {
  const h = html("merke");
  // Palettpakke v2: symbol (merke-hengsel-*, merke-blekk/-hvit) og logo-{hengsel,crm,ute,admin,levering}-{lys,mork}, ensfarget (blekk/hvit) bare for Hengsel. De monokrome produktlogoene er foreslått og ikke i bruk.
  const filer = readdirSync(join(ds, "assets", "logo")).filter((f) => /^(logo-(hengsel|crm|ute|admin|levering)-(lys|mork)|merke-hengsel-(lys|mork)|merke-(blekk|hvit)|logo-hengsel-(blekk|hvit))\.svg$/.test(f));
  assert.equal(filer.length, 16);
  for (const f of filer) assert.ok(h.includes(`/ds/assets/logo/${f}`), `${f} vises ikke på /merke`);
  assert.ok(!readdirSync(join(ds, "assets", "logo")).some((f) => /^(logo|merke)-(crm|ute|admin|levering)-(hvit|blekk)\.svg$/.test(f)), "de monokrome produktlogoene er foreslått og skal ikke ligge i designsystemet");
  assert.ok(!/levert-av-aksent|sendt-med-aksent|hengsel-ute-aksent|crm-aksent|hengsel-levering-aksent/.test(h), "gamle logonavn (blå merkepakke v3: levert-av-aksent, sendt-med-aksent, …) står på /merke");
  // K-231: merkefamilien fra merkepakke v2, favicon med flis, de fire nye ikonene, butikkmaler og motion
  for (const f of ["levert-av-hengsel-lys", "levert-av-hengsel-mork", "levert-av-hengsel-blekk", "levert-av-hengsel-hvit", "sendt-med-hengsel-lys", "sendt-med-hengsel-mork"]) {
    assert.ok(h.includes(`/ds/assets/logo/${f}.svg`) && existsSync(join(dist, "ds", "assets", "logo", `${f}.svg`)), `${f}.svg vises ikke på /merke`);
    for (const x of ["", "-2x", "-3x"]) assert.ok(existsSync(join(dist, "ds", "assets", "logo", "png", `${f}${x}.png`)), `${f}${x}.png mangler`);
  }
  for (const f of ["favicon-flis.svg", "favicon-flis-16.png", "favicon-flis-32.png", "favicon-flis-48.png", "favicon.ico"]) assert.ok(existsSync(join(dist, "ds", "assets", "favicon", f)), `favicon ${f} mangler i ds`);
  assert.ok(h.includes("/ds/assets/favicon/favicon-flis-32.png") && /id="favicon"/.test(h), "favicon med flis skal vises");
  const t = tekst(h);
  for (const n of ["Montasjeplan", "Innboks", "Profil", "Hjelp"]) assert.ok(t.includes(n), `det nye ikonet ${n} vises ikke på /merke`);
  for (const f of ["app-store-iphone-6-9", "app-store-iphone-6-5", "app-store-ipad-13", "google-play-telefon", "google-play-nettbrett-10"]) assert.ok(h.includes(`/ds/assets/butikk/forhandsvisning/${f}.png`) && existsSync(join(dist, "ds", "assets", "butikk", "forhandsvisning", `${f}.png`)), `butikkmal ${f}`);
  for (const s of ["1080x1080", "1080x1920"]) for (const e of [".mp4", ".webm", "-plakat.png"]) assert.ok(h.includes(`/ds/assets/motion/ute-motion-${s}${e}`) && existsSync(join(dist, "ds", "assets", "motion", `ute-motion-${s}${e}`)), `motion ${s}${e}`);
  // Kundemerket (Sigdal som eksempel): Warm Black på lys og Off White på mørk flate
  for (const v of ["warm-black", "off-white"]) assert.ok(h.includes(`/merke/sigdal-crm-levert-av-hengsel-${v}-2x.png`) && existsSync(join(dist, "merke", `sigdal-crm-levert-av-hengsel-${v}-2x.png`)), `Sigdal-merket ${v}`);
  for (const f of ["ute", "ute-mork", "web"]) assert.ok(existsSync(join(side, "public", "merke", "app-ikon", `${f}.png`)), `app-ikon ${f}.png mangler`);
  for (const f of ["crm", "ute-tonet"]) assert.ok(!existsSync(join(side, "public", "merke", "app-ikon", `${f}.png`)), `gammelt app-ikon ${f}.png (brevann) skal ikke finnes`);
});

test("/komponenter viser alle 82 ikonene fra designsystem 2.12/2.13 (Designs 2.5–2.6, 2.11 og 2.13, og tre egne) med SF Symbol, og ikonfilene finnes i tre størrelser", () => {
  const h = html("komponenter");
  const ikoner = JSON.parse(les(ds, "ikoner-2-5", "ikoner.json")).ikoner;
  assert.equal(ikoner.length, 82); // N-7e: 77 + de fem statusikonene (Designs 2.13, K-388); N-7d: 75 + datakilde og tv (2.11, K-378)
  assert.equal(ikoner.filter((i) => i.ny).length, 29, "29 nye ikoner (19 i 2.5, tre i 2.6: lenke, dra, last-opp, to i 2.11: datakilde, tv, og fem i 2.13: status-ny, -pagar, -sannsynlig, -ferdig, -ingen)");
  assert.deepEqual(ikoner.filter((i) => i.ny === "2.11").map((i) => i.fil), ["datakilde", "tv"]);
  assert.deepEqual(ikoner.filter((i) => i.ny === "2.13").map((i) => i.fil), ["status-ny", "status-pagar", "status-sannsynlig", "status-ferdig", "status-ingen"]);
  assert.deepEqual(JSON.parse(les(ds, "ikoner-2-5", "ikoner-tillegg.json")).ikoner.map((i) => i.fil), ["montasjeplan", "innboks", "profil", "hjelp"]);
  const t = tekst(h);
  for (const i of ikoner) {
    assert.ok(t.includes(i.navn), `ikonet ${i.navn} vises ikke`);
    assert.ok(h.includes(`<code>${i.sf}</code>`), `SF Symbol ${i.sf} vises ikke`);
    for (const m of ["16", "20", "24"]) assert.ok(existsSync(join(dist, "ds", "ikoner-2-5", m, `${i.fil}.svg`)), `${m}/${i.fil}.svg mangler i dist`);
  }
  assert.ok(/foreslått/i.test(t.slice(t.indexOf(`${ikoner.length} strekikoner`))), "ikonenes status (foreslått) skal stå på siden");
  assert.ok((h.match(/class="ikon-svg"/g) ?? []).length >= ikoner.length * 2, "ikonene skal tegnes inline (currentColor), i lys og mørk");
  assert.ok(!/stroke="#|stroke="rgb/.test(h), "ikonene skal bruke currentColor, ikke egne farger");
});

test("/farger viser de fire produktpalettene (ute, nettsider, crm, admin) fra JSON, og html har data-produkt=nettsider", () => {
  const h = html("farger");
  for (const n of ["ute", "nettsider", "crm", "admin"]) {
    assert.ok(h.includes(`data-produkt="${n}"`), `produktpaletten ${n} vises ikke`);
    for (const [rolle, hex] of uten$(json.produkt[n].lys)) assert.ok(h.includes(hex), `${n}: ${rolle} ${hex} vises ikke`);
  }
  assert.match(h, /<html[^>]*data-produkt="nettsider"/, "design.hengsel.no er en nettside: data-produkt=nettsider");
});

test("/komponenter har alle komponentene i lys og mørk med brukes til og ikke til", () => {
  const h = html("komponenter");
  for (const id of ["knapper", "piller", "kort", "varsel", "faner", "tabell", "skjema", "tom-tilstand", "sheet-dialog"]) {
    const m = new RegExp(`data-komponent="${id}"[\\s\\S]*?</section>`).exec(h);
    assert.ok(m, `komponent ${id} mangler`);
    assert.ok(m[0].includes("prove-lys") && m[0].includes("prove-mork") && m[0].includes("Brukes til") && m[0].includes("Brukes ikke til"), `${id}: lys, mørk og bruk mangler`);
  }
});

test("/skjermer og /last-ned peker på filer som finnes", () => {
  // K-233: app-skjermbildene lenkes fra biblioteket (bilder.hengsel.no, vis/skjermbilder/<navn>.webp) når de står i manifestet, ellers plassholder; hengsel.no-forsiden ligger lokalt
  const s = html("skjermer");
  for (const navn of ["crm-min-dag", "crm-tilbud", "crm-ordre-kontrollmal", "crm-samtaler", "portal-tilbud", "kundeportal-pc", "ute-i-dag"]) {
    const sti = `vis/skjermbilder/${navn}.webp`;
    if (finnes("hengsel", sti)) assert.ok(s.includes(`${BILDEDOMENE}/hengsel/${sti}`) && s.includes(`${BILDEDOMENE}/hengsel/vis/skjermbilder/${navn}@1x.webp 1x`), `${navn}: lenkes ikke fra biblioteket (1× og 2×)`);
    else assert.ok(s.includes(`data-skjermbilde="vis/skjermbilder/${navn}"`), `${navn}: mangler i manifestet og har ingen plassholder`);
  }
  for (const f of ["hengsel-no-forside.webp", "hengsel-no-forside@1x.webp"]) assert.ok(existsSync(join(dist, "nettsider", f)) && s.includes(`/nettsider/${f}`), `hengsel.no-forsiden ${f}`);
  assert.ok(!existsSync(join(dist, "skjermer")) || readdirSync(join(dist, "skjermer")).length === 0, "dist/skjermer skal være tom: app-skjermbildene kommer fra biblioteket");
  const l = html("last-ned");
  for (const f of ["hengsel.tokens.json", "tokens.css", "tokens.ts", "fonts.css"]) assert.ok(l.includes(`/ds/tokens/${f}`) && existsSync(join(dist, "ds", "tokens", f)), `${f}`);
  assert.ok(l.includes("/last-ned/hengsel-logopakke.zip") && existsSync(join(dist, "last-ned", "hengsel-logopakke.zip")));
  const zip = readFileSync(join(dist, "last-ned", "hengsel-logopakke.zip"));
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal([...zip.toString("latin1").matchAll(/logo\/[\w-]+\.svg/g)].length / 2, readdirSync(join(ds, "assets", "logo")).filter((f) => f.endsWith(".svg")).length, "zip-fila skal ha alle logoene i designsystemet");
  assert.equal([...zip.toString("latin1").matchAll(/png\/[\w-]+\.png/g)].length / 2, 18, "zip-fila skal ha PNG-ene for levert av og sendt med");
  assert.equal([...zip.toString("latin1").matchAll(/favicon\/favicon[\w.-]*/g)].length / 2, 5, "zip-fila skal ha favicon med flis (ico, svg, 16, 32, 48)");
  for (const [f, antall] of [["hengsel-butikkmaler.zip", 14 + 1], ["hengsel-appikoner.zip", 75 + 1]]) {
    assert.ok(l.includes(`/last-ned/${f}`) && existsSync(join(dist, "last-ned", f)), `${f} mangler`);
    const z = readFileSync(join(dist, "last-ned", f));
    assert.equal(z.readUInt16LE(z.length - 22 + 10), antall, `${f}: antall filer`);
  }
  for (const f of ["ute-motion-1080x1080.mp4", "ute-motion-1080x1920.webm", "og-hengsel-no.png", "og-kunde.svg"]) assert.ok(l.includes(f) && existsSync(join(dist, "ds", "assets", f.startsWith("ute") ? "motion" : "deling", f)), `${f} på /last-ned`);
  assert.ok(l.includes("/last-ned/hengsel-ikoner.zip") && existsSync(join(dist, "last-ned", "hengsel-ikoner.zip")), "ikonpakken mangler");
  const ikonZip = readFileSync(join(dist, "last-ned", "hengsel-ikoner.zip"));
  const antallIkoner = JSON.parse(les(ds, "ikoner-2-5", "ikoner.json")).ikoner.length;
  assert.equal(ikonZip.readUInt16LE(ikonZip.length - 22 + 10), antallIkoner * 3 + readdirSync(join(ds, "ikoner-2-5", "12")).length + 5, "ikonpakken skal ha alle ikonene i 3 størrelser (de som har 12 px, i 12 px også), pluss LES-MEG, ikoner.json, ikoner-tillegg.json, sprite og tabell");
});

test("ingen ekte navn, ingen gammel H-logo, ingen «by Hengsel», Sigdal, Innlandet, Lausanne eller Reckless på sidene eller i nedlastingene", () => {
  bygd();
  const GAMMELT = /by Hengsel|innlandet|\bengsel\b|H-merke|h-merke|hengsel-merke-liten|v2-h-merke|Lausanne|Reckless|Gjennom linsa/i;
  const treff = [];
  for (const f of alle(dist).filter((f) => /\.(html|css|js|txt|svg|webmanifest)$/.test(f))) {
    const t = les(dist, f).replace(/<c2pa:manifest>[\s\S]*?<\/c2pa:manifest>/g, ""); // N-7e: c2pa-manifestet i ikonfilene er base64 uten tekst; et tilfeldig «maxbo» i det er ikke et navn
    const sjekk = f.endsWith(".html") ? tekst(t) + " " + [...t.matchAll(/(?:alt|title|aria-label)="([^"]*)"/g)].map((m) => m[1]).join(" ") : t;
    // K-231: Sigdal står bare i kundemerke-eksempelet på /merke (og i de to merkefilene), ingen andre steder
    const sigdalLov = f === "merke.html";
    const ren = sigdalLov ? sjekk.replace(/Sigdal/gi, "") : sjekk;
    if ((FORBUDT.test(ren) || GAMMELT.test(ren))) treff.push(`${f}: ${(ren.match(FORBUDT) ?? ren.match(GAMMELT))[0]}`);
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
  for (const navn of ["index", "merke", "farger", "skrift", "komponenter", "skjermer", "last-ned", "404", "monstre", ...MONSTRE.map((m) => `monstre/${m.sti}`)]) {
    const h = html(navn);
    assert.match(h, /<meta name="robots" content="noindex, nofollow"/, `${navn}: noindex`);
    assert.match(h, /<link rel="icon" href="\/favicon\.ico" sizes="any"\s*\/?>/, `${navn}: favicon.ico`);
    assert.match(h, /<link rel="icon" href="\/favicon-flis\.svg" type="image\/svg\+xml"/, `${navn}: favicon med flis (SVG)`);
    assert.ok(!/favicon-32\.png/.test(h), `${navn}: gammel favicon-32.png (avrundet flis fra runde 1)`);
    assert.match(h, /<meta property="og:image" content="https:\/\/design\.hengsel\.no\/og\.png"/, `${navn}: og:image`);
    assert.ok(!/ style="/.test(h) && !/<script(?![^>]*\bsrc=)[^>]*>/.test(h), `${navn}: ingen style-attributter eller inline-skript`);
  }
  for (const f of ["favicon.ico", "favicon-flis.svg", "favicon-flis-16.png", "favicon-flis-32.png", "favicon-flis-48.png", "favicon-180.png", "og.png"]) assert.ok(existsSync(join(dist, f)), f);
  assert.ok(!existsSync(join(dist, "favicon-32.png")), "gammel favicon-32.png skal ikke finnes");
  assert.ok(!existsSync(join(dist, "sitemap.txt")), "ingen sitemap");
});

// ── N-5: mønstersidene (sidekartet 29-001–29-006, S-68) ────────────────────────────────────────────────────────────────────────────────
/** Fasiten: radene (høyde) og flisene (bredde og tittel) fra docs/sidekart/29-00n.md i hengsel-crm. «auto» er regelflisene under mønsteret. */
const MONSTRE = [
  { nr: "29-001", sti: "tilstander", tittel: "Tom-, laste- og feiltilstander", rader: [
    [120, ["b13 Tom", "b13 Laster", "b13 Feil"]], [320, ["b11 Tekstene"]]] },
  { nr: "29-002", sti: "dialoger", tittel: "Dialoger og skuffer", rader: [
    [480, ["b12 Dialog: Ny kunde", "b12 Når dialog"]], [320, ["b11 Dialog, skuff og ark"]]] },
  { nr: "29-003", sti: "tabell", tittel: "Tabell", rader: [[640, ["b11 Kunder"]], [320, ["b11 Regler"]]] },
  { nr: "29-004", sti: "flisklasser", tittel: "Flisklasser (alle)", rader: [
    [120, ["b14", "b14", "b14", "b14"]], [120, ["b13 Status 1/3 · 120", "b13 Status 1/3 · 120", "b13 Status 1/3 · 120"]],
    [320, ["b13 Kortliste 1/3 · 320", "b13 Kortliste 1/3 · 320", "b13 Kortliste 1/3 · 320"]], [320, ["b12 Liste 1/2 · 320", "b12 Diagram 1/2 · 320"]],
    [480, ["b12 Skjema 1/2 · 480", "b12 Tekst 1/2 · følger raden"]], [320, ["b11 Tabell 1/1 · 320 (til 5 rader; 480 til 9)"]], [120, ["b11 Steg 1/1 · 120"]],
    [480, ["b11 Tavle 1/1 · 480"]], [480, ["b11 Uke 1/1 · 480"]], [480, ["b11 Plan 1/1 · 480 (til 7 rader)"]], [480, ["b11 Tegning 1/1 · 480"]]] },
  { nr: "29-005", sti: "ikoner-og-piller", tittel: "Ikoner og piller", rader: [
    [120, ["b13 ny", "b13 pagar", "b13 venter"]], [120, ["b13 advarsel", "b13 feil", "b13 ferdig"]], [480, ["b11 Ord og nøkkel"]]] },
  { nr: "29-006", sti: "tall", tittel: "Datoer, beløp og tall", rader: [
    [120, ["b14", "b14", "b14", "b14"]], [480, ["b11 Skrivemåte"]], [320, ["b11 Høyrejustert med tabulære tall"]]] },
];
const kit = join(side, "src", "components", "kit");
const monsterSider = join(side, "src", "pages", "monstre");
/** Radene på en bygd side: [høyde, ["<bredde> <tittel>", …]] for flisene rett under hver .k-rad (dialogene ligger inne i flisene) */
function rader(h) {
  const ut = [];
  const deler = h.split(/<div class="k-rad[^"]*"[^>]*data-hoyde="/).slice(1);
  for (const d of deler) {
    const hoyde = d.slice(0, d.indexOf('"'));
    const fliser = [...d.matchAll(/<section class="k-flis (b1[1-4])[^"]*"[^>]*>(?:\s*<div class="k-topp[^"]*"[^>]*>\s*<h2[^>]*>([^<]*))?/g)].map((m) => (m[2] ? `${m[1]} ${m[2].trim()}` : m[1]));
    ut.push([hoyde === "auto" ? "auto" : Number(hoyde), fliser]);
  }
  return ut;
}
/** Flisene i en rad står til neste rad begynner: tell bare flisene på øverste nivå (ingen fliser i fliser, regel 6) */
const toppfliser = (h) => rader(h).map(([hoyde, f]) => [hoyde, f]);

test("N-5: de seks mønstersidene finnes under /monstre, og menyen har «Mønstre»", () => {
  const nav = les(side, "src", "content", "nav.ts");
  assert.match(nav, /\["monstre", "Mønstre", "\/monstre"\]/, "menypunktet «Mønstre» mangler i nav.ts");
  for (const navn of ["index", "merke", "farger", "skrift", "komponenter", "skjermer", "last-ned", "monstre"]) {
    assert.ok(/<a href="\/monstre"[^>]*>Mønstre<\/a>/.test(html(navn)), `${navn}: menyen lenker ikke til /monstre`);
  }
  const oversikt = html("monstre");
  for (const m of MONSTRE) {
    assert.ok(existsSync(join(monsterSider, `${m.sti}.astro`)), `${m.nr}: sites/design/src/pages/monstre/${m.sti}.astro mangler`);
    const h = html(`monstre/${m.sti}`);
    assert.ok(oversikt.includes(`href="/monstre/${m.sti}"`), `${m.nr}: oversikten lenker ikke til siden`);
    assert.match(h, new RegExp(`<h1[^>]*>${m.tittel.replace(/[()]/g, "\\$&")}</h1>`), `${m.nr}: tittelen «${m.tittel}»`);
    assert.ok(tekst(h).includes(`Mønster ${m.nr}`), `${m.nr}: sidenummeret står ikke på siden`);
    assert.match(h, new RegExp(`<a href="/monstre/${m.sti}" aria-current="page"`), `${m.nr}: fanen er ikke valgt`);
    for (const a of MONSTRE) assert.ok(h.includes(`href="/monstre/${a.sti}"`), `${m.nr}: fanen til ${a.nr} mangler`);
    assert.match(h, /<a href="\/monstre" aria-current="page"/, `${m.nr}: «Mønstre» er ikke valgt i menyen`);
  }
});

test("N-5: mønstersidene følger sidekartet: radhøydene 120/320/480/640, lovlige rader (2b) og flisene i rekkefølge", () => {
  const SUM = { b14: 3, b13: 4, b12: 6, b11: 12 };
  for (const m of MONSTRE) {
    const r = toppfliser(html(`monstre/${m.sti}`));
    const monster = r.filter(([hoyde]) => hoyde !== "auto");
    assert.deepEqual(monster, m.rader, `${m.nr}: radene avviker fra sidekartet`);
    // Regelen står under mønsteret, i fliser (regel 6: ingen tekst uten flis), og ingen mønsterrad etter den
    const forsteAuto = r.findIndex(([hoyde]) => hoyde === "auto");
    assert.ok(forsteAuto === m.rader.length && r.slice(forsteAuto).every(([hoyde]) => hoyde === "auto"), `${m.nr}: regelen skal stå under mønsteret`);
    for (const [hoyde, f] of r) {
      assert.ok([120, 320, 480, 640, "auto"].includes(hoyde), `${m.nr}: radhøyde ${hoyde} er ikke i skalaen (2d)`);
      const b = f.map((x) => x.split(" ")[0]);
      assert.equal(b.reduce((s, x) => s + SUM[x], 0), 12, `${m.nr}: raden ${b.join(" + ")} fyller ikke bredden (2b)`);
      assert.ok(!(b.includes("b14") && b.includes("b13")), `${m.nr}: 1/4 og 1/3 i samme rad (2b)`);
    }
  }
});

test("N-5: kitet og mønstersidene bruker bare tokens: ingen hex, rgb/hsl eller mørk modus", () => {
  const kilder = [...readdirSync(kit).map((f) => join(kit, f)), ...readdirSync(monsterSider).map((f) => join(monsterSider, f)), join(side, "src", "lib", "ds-tekst.ts"), join(side, "src", "content", "monstre.ts")];
  for (const f of kilder) {
    const t = readFileSync(f, "utf8");
    assert.ok(!/(?<![\w&/-])#[0-9a-f]{3,8}\b(?![\w-])/i.test(t), `${f}: hex-farge`);
    assert.ok(!/\b(?:rgba?|hsla?|hwb|lab|lch|oklch|oklab)\(/i.test(t), `${f}: fargefunksjon utenfor tokens`);
    assert.ok(!/prefers-color-scheme|data-theme|\.dark\b|color-scheme:\s*dark/.test(t), `${f}: mørk modus`);
    // Hver farge i stilene er en token (var(--…)), color-mix av tokens, currentColor eller ingen farge
    for (const [, egenskap, verdi] of t.matchAll(/(?:^|[;{\s])((?:background|color|fill|stroke|border(?:-[a-z]+)?-color|outline-color|box-shadow))\s*:\s*([^;}]+)/g)) {
      if (/^\s*(?:none|transparent|inherit|currentColor|0)\s*$/.test(verdi)) continue;
      if (egenskap === "background" && /repeating-linear-gradient/.test(verdi)) { assert.ok(!/#|rgb|hsl/.test(verdi), `${f}: ${egenskap}`); continue; }
      assert.ok(/var\(--/.test(verdi), `${f}: ${egenskap}: ${verdi.trim()} er ikke en token`);
    }
  }
  for (const m of MONSTRE) {
    const h = html(`monstre/${m.sti}`);
    assert.match(h, /<meta name="color-scheme" content="light"/, `${m.nr}: color-scheme light`);
    assert.ok(!/ style="/.test(h), `${m.nr}: style-attributt`);
  }
});

test("N-5: mønstersidene har ingen ekte navn (K-151: FORBUDT)", () => {
  for (const m of [{ sti: "", nr: "oversikt" }, ...MONSTRE]) {
    const h = html(m.sti ? `monstre/${m.sti}` : "monstre");
    const t = tekst(h) + " " + [...h.matchAll(/(?:alt|title|aria-label)="([^"]*)"/g)].map((x) => x[1]).join(" ");
    assert.ok(!FORBUDT.test(t), `${m.nr}: ${t.match(FORBUDT)?.[0]}`);
  }
});

test("N-5: regelen under flisene er sitert ordrett fra designsystemet (pinnet kopi eller ds-sitat med sha256)", () => {
  const sitat = join(side, "src", "content", "ds-sitat");
  const kilde = JSON.parse(les(sitat, "kilde.json"));
  assert.match(kilde.commit, /^[0-9a-f]{40}$/);
  assert.equal(kilde.sti, "_ds/hengsel-designsystem");
  assert.deepEqual(alle(sitat).filter((f) => f.endsWith(".md")).sort(), Object.keys(kilde.filer).sort(), "ds-sitat har filer som ikke står i kilde.json, eller omvendt");
  for (const [f, sha] of Object.entries(kilde.filer)) assert.equal(createHash("sha256").update(readFileSync(join(sitat, f))).digest("hex"), sha, `ds-sitat/${f} er endret for hånd`);
  const ren = (s) => s.replace(/\*\*|`/g, "").replace(/\s+/g, " ");
  for (const m of MONSTRE) {
    const h = html(`monstre/${m.sti}`);
    const sitater = [...h.matchAll(/<blockquote[^>]*data-ds-fil="([^"]+)"[^>]*data-ds-fra="([^"]+)"[^>]*>([\s\S]*?)<\/blockquote>/g)];
    assert.ok(sitater.length >= 2, `${m.nr}: regelen fra designsystemet mangler under flisene`);
    for (const [, fil, fra, innhold] of sitater) {
      const pinnet = join(ds, fil);
      assert.equal(fra, existsSync(pinnet) ? "pinnet" : "sitat", `${m.nr}: ${fil} skal leses fra den pinnede kopien når den finnes`);
      const kildetekst = ren(readFileSync(existsSync(pinnet) ? pinnet : join(sitat, fil), "utf8"));
      const q = ren(tekst(innhold.replace(/<\/?(?:code|b)>/g, "")).trim());
      assert.ok(kildetekst.includes(q), `${m.nr}: «${q.slice(0, 80)}…» står ikke ordrett i ${fil}`);
    }
    assert.ok(tekst(h).includes(`commit ${kilde.commit.slice(0, 8)}`), `${m.nr}: kilden (commit) står ikke under regelen`);
  }
});
