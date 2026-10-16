/**
 * K-223 + K-226 + K-229: Access-vakten foran hengsel.no/kunde (hjelp, apptest, dokumenter og kundens egen utgave). Sjekken er den delte i worker/access.ts,
 * med signaturkontroll mot ACCESS_TEAM_DOMAIN og ACCESS_AUD. Importerer worker/*.ts direkte (Node 22.18+ fjerner typene), og Cloudflares nøkler etterlignes.
 * Til slutt kall mot ekte `wrangler dev` (uten Access-oppsett): alle stier under /kunde gir 403, gamle adresser videresendes med 301, og /apptest
 * beholder passordet til APPTEST_VIDERE settes. Kjør `npm run build` først.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { nullstillBuffer } from "../sites/hengsel/worker/access.ts";
import { ER_KUNDE, handterKunde } from "../sites/hengsel/worker/kunde.ts";
import { startHengsel } from "./lib-wrangler.mjs";

const rot = join(import.meta.dirname, "..");
const TEAM = "test.cloudflareaccess.com";
const AUD = "a".repeat(64);
const b64 = (d) => Buffer.from(d).toString("base64url");
const par = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", par.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
async function token(krav = {}) {
  const na = Math.floor(Date.now() / 1000);
  const h = b64(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
  const p = b64(JSON.stringify({ iss: `https://${TEAM}`, aud: [AUD], email: "kunde@eksempel.no", iat: na, nbf: na - 5, exp: na + 3600, ...krav }));
  return `${h}.${p}.${b64(Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", par.privateKey, new TextEncoder().encode(`${h}.${p}`))))}`;
}
const hent = async () => new Response(JSON.stringify({ keys: [jwk] }), { headers: { "Content-Type": "application/json" } });
const filer = { "/kunde": ["<h1>kunde</h1>", "text/html"], "/kunde/hjelp": ["<h1>hjelp</h1>", "text/html"], "/kunde/dokumenter": ["<h1>dok</h1>", "text/html"], "/kunde/apptest": ['<span data-demopassord="x">••••</span>', "text/html"], "/kunde/sigdal/vis/crm/": ["<h1>rom</h1>", "text/html"], "/kunde/sigdal/crm": ["<h1>crm</h1>", "text/html"], "/kunde/sigdal/apptest": ['<span data-demopassord="x">••••</span>', "text/html"], "/kunde/sigdal/img/app/idag-lys.webp": ["x", "image/webp"] };
const env = (ekstra = {}) => ({
  ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD,
  ASSETS: { fetch: async (r) => { const [t, ty] = filer[new URL(r.url).pathname] ?? ["404", "text/html"]; return new Response(t, { headers: { "Content-Type": ty, ETag: '"x"', "Content-Security-Policy": "default-src 'self'; style-src 'self' 'sha256-x'" } }); } },
  ...ekstra,
});
const be = (sti, tok, metode = "GET") => new Request(`https://hengsel.no${sti}`, { method: metode, headers: tok ? { "Cf-Access-Jwt-Assertion": tok } : {} });
const kjor = (req, e = env()) => { nullstillBuffer(); return handterKunde(req, e, { hent }); };
const merkene = (r) => {
  assert.equal(r.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(r.headers.get("Cache-Control"), "private, no-store");
};

test("rutingen: bare /kunde og under", () => {
  assert.ok(ER_KUNDE("/kunde") && ER_KUNDE("/kunde/") && ER_KUNDE("/kunde/hjelp") && ER_KUNDE("/kunde/sigdal") && ER_KUNDE("/kunde/sigdal/vis/crm/"));
  assert.ok(!ER_KUNDE("/kundeservice") && !ER_KUNDE("/") && !ER_KUNDE("/hjelp") && !ER_KUNDE("/sigdal") && !ER_KUNDE("/apptest"));
  const w = JSON.parse(readFileSync(join(rot, "sites/hengsel/wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  for (const sti of ["/kunde", "/kunde/*", "/apptest", "/apptest/*", "/api/demo"]) assert.ok(w.assets.run_worker_first.includes(sti), sti);
  assert.match(readFileSync(join(rot, "sites/hengsel/worker/index.ts"), "utf8"), /ER_KUNDE\(pathname\)\) return handterKunde\(req, env\)/);
});

test("den enkle header-sjekken og testmodus er borte: /kunde bruker den delte Access-sjekken", () => {
  const kode = readFileSync(join(rot, "sites/hengsel/worker/kunde.ts"), "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  assert.match(kode, /vakt\(req, env/);
  assert.doesNotMatch(kode, /\b(?:TEST|BYPASS|OMGA|SKIP_ACCESS|localhost|127\.0\.0\.1)\w*/i);
  assert.doesNotMatch(kode, /headers\.get\("Cf-Access-Jwt-Assertion"\)/);
});

test("uten token: 403 på alle stier og metoder under /kunde, med noindex og no-store", async () => {
  for (const sti of Object.keys(filer).concat("/kunde/sigdal", "/kunde/sigdal/finnes-ikke", "/kunde/", "/kunde/hjelp/noe")) {
    for (const metode of ["GET", "HEAD", "POST"]) {
      const r = await kjor(be(sti, null, metode));
      assert.equal(r.status, 403, `${metode} ${sti}`);
      merkene(r);
      assert.doesNotMatch(await r.text(), /<h1>/);
    }
  }
});

test("mangler ACCESS_TEAM_DOMAIN eller ACCESS_AUD: 403 også med token (ikke åpent), for alle sidene under /kunde", async () => {
  for (const e of [env({ ACCESS_TEAM_DOMAIN: "" }), env({ ACCESS_AUD: "" }), env({ ACCESS_TEAM_DOMAIN: undefined, ACCESS_AUD: undefined })]) {
    for (const [navn, handter, sti] of [["sigdal", handterKunde, "/kunde/sigdal/crm"], ["hjelp", handterKunde, "/kunde/hjelp"], ["forside", handterKunde, "/kunde"]]) {
      for (const tok of [null, await token()]) {
        nullstillBuffer();
        const r = await handter(be(sti, tok), e, { hent });
        assert.equal(r.status, 403, `${navn} ${tok ? "med" : "uten"} token`);
        merkene(r);
        assert.doesNotMatch(await r.text(), /<h1>/);
      }
    }
  }
});

test("ugyldige tokens gir 403: feil signatur, feil app, feil utsteder, utløpt, uten e-post", async () => {
  const annet = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const [h, p] = (await token()).split(".");
  const feilSig = `${h}.${p}.${b64(Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", annet.privateKey, new TextEncoder().encode(`${h}.${p}`))))}`;
  const na = Math.floor(Date.now() / 1000);
  for (const [navn, tok] of [["feil signatur", feilSig], ["feil app", await token({ aud: ["b".repeat(64)] })], ["feil utsteder", await token({ iss: "https://annet.cloudflareaccess.com" })], ["utløpt", await token({ exp: na - 10 })], ["uten e-post", await token({ email: "" })], ["tull", "a.b.c"]]) {
    const r = await kjor(be("/kunde/sigdal/crm", tok));
    assert.equal(r.status, 403, navn);
    merkene(r);
  }
});

test("gyldig token: 200 med noindex og no-store; ETag fjernes; vis har egen CSP, resten bruker CSP-en fra _headers", async () => {
  const tok = await token();
  for (const sti of Object.keys(filer)) {
    const r = await kjor(be(sti, tok));
    assert.equal(r.status, 200, sti);
    merkene(r);
    assert.equal(r.headers.get("ETag"), null);
    if (sti.startsWith("/kunde/sigdal/vis/")) assert.match(r.headers.get("Content-Security-Policy"), /style-src 'self' 'unsafe-inline'/);
    else assert.doesNotMatch(r.headers.get("Content-Security-Policy"), /unsafe-inline/);
  }
  const post = await kjor(be("/kunde/sigdal/crm", tok, "POST"));
  assert.equal(post.status, 405);
});

test("/kunde/apptest og /kunde/sigdal/apptest: demopassordet står aldri i HTML-en, heller ikke med gyldig token og hemmelighet", async () => {
  for (const sti of ["/kunde/apptest", "/kunde/sigdal/apptest"]) {
    for (const DEMO_PASSORD of [undefined, "hemmelig-demopassord"]) {
      const r = await kjor(be(sti, await token()), env({ DEMO_PASSORD }));
      assert.equal(r.status, 200, sti);
      const tekst = await r.text();
      assert.match(tekst, /••••/, `${sti}: plassholderen står igjen`);
      assert.doesNotMatch(tekst, /hemmelig-demopassord/, `${sti}: passordet er satt inn i HTML-en`);
    }
    assert.equal((await kjor(be(sti, null), env({ DEMO_PASSORD: "hemmelig-demopassord" }))).status, 403, `${sti} uten token`);
  }
});

// Ekte wrangler dev uten ACCESS_*: alt under /kunde gir 403, også med en tilfeldig header
let vert;
let vert2;
after(async () => { await vert?.stopp(); await vert2?.stopp(); });
test("wrangler dev uten Access-oppsett: 403 på alle stier under /kunde; Hengsel-sidene er åpne", async () => {
  assert.ok(existsSync(join(rot, "sites/hengsel/dist/kunde/sigdal/tema.css")), "kjør npm run build først");
  vert = await startHengsel();
  for (const sti of ["/kunde", "/kunde/", "/kunde/hjelp", "/kunde/apptest", "/kunde/dokumenter", "/kunde/sigdal", "/kunde/sigdal/crm", "/kunde/sigdal/vis/", "/kunde/sigdal/vis/forsta/", "/kunde/sigdal/tema.css", "/kunde/sigdal/img/app/idag-lys.webp", "/kunde/sigdal/finnes-ikke", "/kunde/finnes-ikke"]) {
    for (const hoder of [{}, { "Cf-Access-Jwt-Assertion": "x.y.z" }]) {
      const r = await fetch(vert.base + sti, { headers: hoder, redirect: "manual" });
      assert.equal(r.status, 403, `${sti} ${JSON.stringify(hoder)}`);
      assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
      assert.equal(r.headers.get("cache-control"), "private, no-store");
      await r.body?.cancel();
    }
  }
  for (const sti of ["/", "/crm", "/ute", "/kundeportal", "/integrasjoner", "/priser-og-demo"]) {
    const r = await fetch(vert.base + sti);
    assert.equal(r.status, 200, sti);
    assert.equal(r.headers.get("x-robots-tag"), null);
    assert.ok(!(await r.text()).includes("data-kunde"));
  }
});

// Gamle adresser videresendes med 301 til de nye, også undersider (public/_redirects), uten at noe innhold vises
const GAMLE = [
  ["/hjelp", "/kunde/hjelp"], ["/hjelp/", "/kunde/hjelp/"], ["/hjelp.html", "/kunde/hjelp"], ["/hjelp/noe/mer", "/kunde/hjelp/noe/mer"],
  ["/dokumenter", "/kunde/dokumenter"], ["/dokumenter/", "/kunde/dokumenter/"], ["/dokumenter.html", "/kunde/dokumenter"],
  ["/sigdal", "/kunde/sigdal"], ["/sigdal/", "/kunde/sigdal/"], ["/sigdal/crm", "/kunde/sigdal/crm"], ["/sigdal/vis/", "/kunde/sigdal/vis/"], ["/sigdal/vis/forsta/", "/kunde/sigdal/vis/forsta/"],
  ["/sigdal/img/vis/hero.webp", "/kunde/sigdal/img/vis/hero.webp"], ["/sigdal/tema.css", "/kunde/sigdal/tema.css"],
  ["/slik-virker-det", "/"],
];
test("gamle adresser videresendes med 301 til de nye, også undersider", async () => {
  vert ??= await startHengsel();
  for (const [fra, til] of GAMLE) {
    const r = await fetch(vert.base + fra + "?x=1", { redirect: "manual" });
    assert.equal(r.status, 301, fra);
    assert.equal(new URL(r.headers.get("location"), vert.base).pathname, til, fra);
    await r.body?.cancel();
  }
});

// /apptest: passordet gjelder til APPTEST_VIDERE settes; da sendes /apptest og alt under til /kunde/apptest
test("/apptest beholder passordet uten APPTEST_VIDERE, og videresendes (301) til /kunde/apptest med APPTEST_VIDERE=1", async () => {
  vert ??= await startHengsel();
  const uten = await fetch(vert.base + "/apptest", { redirect: "manual" });
  assert.equal(uten.status, 503, "uten passordoppsett er /apptest låst (som før)");
  await uten.body?.cancel();
  vert2 = await startHengsel({ vars: { APPTEST_VIDERE: "1" } });
  for (const [fra, til] of [["/apptest", "/kunde/apptest"], ["/apptest/", "/kunde/apptest/"], ["/apptest/passord", "/kunde/apptest"], ["/apptest/Logg_inn_i_demoen.pdf", "/kunde/apptest/Logg_inn_i_demoen.pdf"]]) {
    const r = await fetch(vert2.base + fra + "?a=1", { redirect: "manual" });
    assert.equal(r.status, 301, fra);
    assert.equal(new URL(r.headers.get("location"), vert2.base).pathname, til, fra);
    assert.equal(new URL(r.headers.get("location"), vert2.base).search, "?a=1");
    await r.body?.cancel();
  }
  const post = await fetch(vert2.base + "/kunde/apptest", { redirect: "manual" });
  assert.equal(post.status, 403, "målet står bak Access");
  await post.body?.cancel();
});
