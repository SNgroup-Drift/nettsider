/**
 * K-223 + K-226: Access-vakten foran hengsel.no/sigdal. Sjekken er den delte i worker/access.ts (samme som /hjelp), med signaturkontroll mot
 * ACCESS_TEAM_DOMAIN og ACCESS_AUD. Importerer worker/*.ts direkte (Node 22.18+ fjerner typene), og Cloudflares nøkler etterlignes.
 * Til slutt et par kall mot ekte `wrangler dev` (uten Access-oppsett): alle stier under /sigdal gir 403. Kjør `npm run build` først.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { nullstillBuffer } from "../sites/hengsel/worker/access.ts";
import { ER_SIGDAL, handterSigdal } from "../sites/hengsel/worker/sigdal.ts";
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
const filer = { "/sigdal/vis/crm/": ["<h1>rom</h1>", "text/html"], "/sigdal/crm": ["<h1>crm</h1>", "text/html"], "/sigdal/apptest": ['<span data-demopassord="x">••••</span>', "text/html"], "/sigdal/img/app/idag-lys.webp": ["x", "image/webp"] };
const env = (ekstra = {}) => ({
  ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD,
  ASSETS: { fetch: async (r) => { const [t, ty] = filer[new URL(r.url).pathname] ?? ["404", "text/html"]; return new Response(t, { headers: { "Content-Type": ty, ETag: '"x"', "Content-Security-Policy": "default-src 'self'; style-src 'self' 'sha256-x'" } }); } },
  ...ekstra,
});
const be = (sti, tok, metode = "GET") => new Request(`https://hengsel.no${sti}`, { method: metode, headers: tok ? { "Cf-Access-Jwt-Assertion": tok } : {} });
const kjor = (req, e = env()) => { nullstillBuffer(); return handterSigdal(req, e, { hent }); };
const merkene = (r) => {
  assert.equal(r.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(r.headers.get("Cache-Control"), "private, no-store");
};

test("rutingen: bare /sigdal og under", () => {
  assert.ok(ER_SIGDAL("/sigdal") && ER_SIGDAL("/sigdal/") && ER_SIGDAL("/sigdal/vis/crm/"));
  assert.ok(!ER_SIGDAL("/sigdalen") && !ER_SIGDAL("/") && !ER_SIGDAL("/hjelp"));
  const w = JSON.parse(readFileSync(join(rot, "sites/hengsel/wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  for (const sti of ["/sigdal", "/sigdal/*", "/hjelp", "/hjelp.html", "/hjelp/*"]) assert.ok(w.assets.run_worker_first.includes(sti), sti);
  assert.match(readFileSync(join(rot, "sites/hengsel/worker/index.ts"), "utf8"), /ER_SIGDAL\(pathname\)\) return handterSigdal\(req, env\)/);
});

test("den enkle header-sjekken og testmodus er borte: /sigdal bruker den delte Access-sjekken", () => {
  const kode = readFileSync(join(rot, "sites/hengsel/worker/sigdal.ts"), "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  assert.match(kode, /vakt\(req, env/);
  assert.doesNotMatch(kode, /\b(?:TEST|BYPASS|OMGA|SKIP_ACCESS|localhost|127\.0\.0\.1)\w*/i);
  assert.doesNotMatch(kode, /headers\.get\("Cf-Access-Jwt-Assertion"\)/);
});

test("uten token: 403 på alle stier og metoder under /sigdal, med noindex og no-store", async () => {
  for (const sti of Object.keys(filer).concat("/sigdal", "/sigdal/finnes-ikke")) {
    for (const metode of ["GET", "HEAD", "POST"]) {
      const r = await kjor(be(sti, null, metode));
      assert.equal(r.status, 403, `${metode} ${sti}`);
      merkene(r);
      assert.doesNotMatch(await r.text(), /<h1>/);
    }
  }
});

test("mangler ACCESS_TEAM_DOMAIN eller ACCESS_AUD: 403 også med token (ikke åpent), for både /sigdal og /hjelp", async () => {
  const { handterHjelp } = await import("../sites/hengsel/worker/hjelp.ts");
  for (const e of [env({ ACCESS_TEAM_DOMAIN: "" }), env({ ACCESS_AUD: "" }), env({ ACCESS_TEAM_DOMAIN: undefined, ACCESS_AUD: undefined })]) {
    for (const [navn, handter, sti] of [["sigdal", handterSigdal, "/sigdal/crm"], ["hjelp", handterHjelp, "/hjelp"]]) {
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
    const r = await kjor(be("/sigdal/crm", tok));
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
    if (sti.startsWith("/sigdal/vis/")) assert.match(r.headers.get("Content-Security-Policy"), /style-src 'self' 'unsafe-inline'/);
    else assert.doesNotMatch(r.headers.get("Content-Security-Policy"), /unsafe-inline/);
  }
  const post = await kjor(be("/sigdal/crm", tok, "POST"));
  assert.equal(post.status, 405);
});

test("/sigdal/apptest: demopassordet settes inn bare med gyldig token og når hemmeligheten finnes", async () => {
  // HTMLRewriter finnes bare i Workers; uten hemmelighet returneres siden som den er
  const r = await kjor(be("/sigdal/apptest", await token()), env({ DEMO_PASSORD: undefined }));
  assert.equal(r.status, 200);
  assert.match(await r.text(), /••••/);
});

// Ekte wrangler dev uten ACCESS_*: alt under /sigdal gir 403, også med en tilfeldig header
let vert;
after(async () => { await vert?.stopp(); });
test("wrangler dev uten Access-oppsett: 403 på alle stier under /sigdal og /hjelp; Hengsel-sidene er åpne", async () => {
  assert.ok(existsSync(join(rot, "sites/hengsel/dist/sigdal/tema.css")), "kjør npm run build først");
  vert = await startHengsel();
  for (const sti of ["/sigdal", "/sigdal/crm", "/sigdal/vis/", "/sigdal/vis/crm/", "/sigdal/tema.css", "/sigdal/img/app/idag-lys.webp", "/sigdal/finnes-ikke", "/hjelp"]) {
    for (const hoder of [{}, { "Cf-Access-Jwt-Assertion": "x.y.z" }]) {
      const r = await fetch(vert.base + sti, { headers: hoder, redirect: "manual" });
      assert.equal(r.status, 403, `${sti} ${JSON.stringify(hoder)}`);
      assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
      assert.equal(r.headers.get("cache-control"), "private, no-store");
      await r.body?.cancel();
    }
  }
  for (const sti of ["/", "/crm"]) {
    const r = await fetch(vert.base + sti);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("x-robots-tag"), null);
    assert.ok(!(await r.text()).includes("data-kunde"));
  }
});
