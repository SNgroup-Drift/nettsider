/**
 * N-9 (Eirik 18.10, svar B på logoer-produkter-1810): produktlogoene på hengsel.no.
 *  a) /crm, /ute, /kundeportal og /telefon har `produkt=` på Sidetopp, og den bygde toppen viser produktlogoen (34 px): logo for crm og ute,
 *     Hengsel-symbol + tekstnavn for kundeportal og telefon; logoen er pyntet (alt="") bare når tittelen sier navnet
 *  b) forsiden har seks produktfliser med de seks navnene, hver med logo (eller symbol + tekstnavn), og lenkene går til sider som finnes
 *     (sjekk-lenker.mjs sjekker at de svarer 200); Admin lenker til /for-butikkleder, Levering har ingen lenke
 *  c) design.hengsel.no/merke har Kundeportal, Telefon og TV i FORMER og plasseringene for sidetoppen og forsiden
 * Kjør `npm run build` først (dist må finnes).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const rot = resolve(import.meta.dirname, "..");
const side = join(rot, "sites", "hengsel", "src", "pages");
const dist = join(rot, "sites", "hengsel", "dist");
const les = (...s) => readFileSync(join(...s), "utf8");
const bygd = (navn) => {
  assert.ok(existsSync(join(dist, `${navn}.html`)), `kjør npm run build først (${navn}.html)`);
  return les(dist, `${navn}.html`);
};
const PRODUKTSIDER = { crm: "Hengsel CRM", ute: "Hengsel Ute", kundeportal: "Kundeportal", telefon: "Hengsel på telefon" };
const MED_LOGO = ["crm", "ute"];
const NAVN = ["Hengsel CRM", "Hengsel Ute", "Kundeportal", "Hengsel på telefon", "Hengsel Admin", "Hengsel Levering"];

test("a) hver produktside har produkt= på Sidetopp og viser produktlogoen i toppen", () => {
  for (const [s, navn] of Object.entries(PRODUKTSIDER)) {
    assert.match(les(side, `${s}.astro`), new RegExp(`<Sidetopp[^>]*\\sprodukt="${s}"`), `${s}.astro: Sidetopp mangler produkt="${s}"`);
    const h = bygd(s);
    const topp = /<div class="sidetopp[\s\S]*?<h1/.exec(h)?.[0];
    assert.ok(topp, `${s}: ingen topp`);
    const logo = new RegExp(`<span class="produktlogo h34" data-produktlogo="${s}"[^>]*>([\\s\\S]*?)</span>(</span>)?</div>`).exec(topp)?.[1];
    assert.ok(logo, `${s}: produktlogoen (34 px) står ikke i toppen`);
    if (MED_LOGO.includes(s)) {
      assert.match(logo, new RegExp(`src="/_astro/logo-${s}-lys\\.[^"]+\\.svg" alt="${navn}"`), `${s}: logoen skal være produktets, med alt = produktnavnet`);
    } else {
      assert.match(logo, /src="\/_astro\/merke-hengsel-lys\.[^"]+\.svg" alt=""/, `${s}: Hengsel-symbolet (aksent, lys), pyntet`);
      assert.ok(logo.includes(`>${navn}`), `${s}: tekstnavnet «${navn}» mangler`);
    }
  }
});

test("a2) sider uten produkt= er uendret: ingen produktlogo i toppen", () => {
  for (const s of ["om-oss", "priser-og-demo", "personvern"]) assert.ok(!bygd(s).includes('data-produktlogo="'), `${s}: skal ikke ha produktlogo`);
  assert.ok(!/<Sidetopp[^>]*\sprodukt=/.test(les(side, "for-butikkleder.astro")));
});

test("b) forsiden har «Produktene» med seks produktfliser, logo eller symbol + tekstnavn, og lenker til sider som finnes", () => {
  const h = bygd("index");
  const fliser = [...h.matchAll(/<section class="flis [^"]*produktflis[^"]*"[^>]*id="produkt-([a-z]+)"[\s\S]*?<\/section>/g)];
  assert.equal(fliser.length, 6, "seks produktfliser");
  const navn = fliser.map((m) => /<h2[^>]*>([^<]+)</.exec(m[0])?.[1]);
  assert.deepEqual(navn, NAVN, "navnene, i rekkefølge");
  const iRekkefolge = h.indexOf("tre-enheter");
  assert.ok(iRekkefolge > 0 && h.indexOf('id="produkt-crm"') > iRekkefolge, "Produktene står etter «Samme ordre på alle enheter»");
  const lenker = {};
  for (const [flis, nokkel] of fliser) {
    assert.match(flis, new RegExp(`<span class="produktlogo h24" data-produktlogo="${nokkel}"`), `${nokkel}: produktlogo 24 px`);
    assert.ok(/<p class="setning[^>]*>[^<]{20,}/.test(flis), `${nokkel}: setning`);
    lenker[nokkel] = /<a [^>]*class="lenke[^"]*"[^>]*href="([^"]+)"|<a [^>]*href="([^"]+)"[^>]*class="lenke/.exec(flis);
    lenker[nokkel] = lenker[nokkel] ? lenker[nokkel][1] ?? lenker[nokkel][2] : undefined;
  }
  assert.deepEqual(lenker, { crm: "/crm", ute: "/ute", kundeportal: "/kundeportal", telefon: "/telefon", admin: "/for-butikkleder", levering: undefined });
  for (const href of Object.values(lenker).filter(Boolean)) assert.ok(existsSync(join(dist, `${href.slice(1)}.html`)), `${href} finnes ikke i dist`);
  for (const nokkel of ["kundeportal", "telefon"]) assert.match(fliser.find((m) => m[1] === nokkel)[0], /merke-hengsel-lys\.[^"]+\.svg" alt=""/, `${nokkel}: symbol`);
  assert.ok(!/produktflis[^>]*id="produkt-tv"/.test(h) && !/>TV</.test(fliser.map((m) => m[0]).join("")), "TV står ikke på hengsel.no");
});

test("c) design.hengsel.no/merke: Kundeportal, Telefon og TV i FORMER og plasseringene for sidetoppen og forsiden", () => {
  const kilde = les(rot, "sites", "design", "src", "pages", "merke.astro");
  for (const n of ["Kundeportal", "Telefon", "TV"]) assert.match(kilde, new RegExp(`navn: "${n}", bruk: "Logo kommer \\(Design 2\\.13\\) – til da Hengsel-symbol \\+ tekstnavn`));
  assert.match(kilde, /\/crm, \/ute, \/kundeportal og \/telefon \(N-9\)[^\]]*34 px/);
  assert.match(kilde, /«Produktene» \(N-9\)[^\]]*24 px/);
  const h = les(rot, "sites", "design", "dist", "merke.html");
  for (const n of ["Kundeportal", "Telefon", "TV"]) assert.ok(h.includes(`>${n}</div>`), `${n} vises på /merke`);
  assert.ok(h.includes("Logo kommer (Design 2.13)"));
});
