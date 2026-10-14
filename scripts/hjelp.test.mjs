// Vakt for hengsel.no/hjelp (K-226): Access-sjekken i Workeren, merkene på svarene, wrangler-oppsettet, datafila og den bygde siden.
// Importerer worker/*.ts direkte (Node 22.18+ fjerner typene selv). Ingen hemmeligheter: nøklene lages i testen, og Cloudflare etterlignes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { nullstillBuffer, sjekkAccess } from "../sites/hengsel/worker/access.ts";
import { erHjelp, handterHjelp } from "../sites/hengsel/worker/hjelp.ts";
import { HJELP, HJELP_OPPGAVER, HJELP_ROLLER } from "../sites/hengsel/src/data/hjelp.ts";

const rot = join(import.meta.dirname, "..");
const les = (sti) => readFileSync(join(rot, sti), "utf8");
const COPYRIGHT = "© 2026 ES-Holding AS. Alle rettigheter forbeholdt. Hengsel og innholdet i denne veiledningen (tekst, skjermbilder og oppbygging) kan ikke kopieres, deles eller brukes utenfor egen virksomhet uten skriftlig samtykke.";

// ── Oppsett ──────────────────────────────────────────────────────────────────────────────────────────────────────────
test("wrangler.jsonc sender /hjelp, /hjelp.html og /hjelp/* gjennom Workeren først, og Workeren ruter dit", () => {
  const w = JSON.parse(les("sites/hengsel/wrangler.jsonc").replace(/^\s*\/\/.*$/gm, ""));
  for (const sti of ["/hjelp", "/hjelp.html", "/hjelp/*"]) assert.ok(w.assets.run_worker_first.includes(sti), sti);
  assert.equal(w.keep_vars, true, "keep_vars sørger for at utrulling ikke overskriver ACCESS_TEAM_DOMAIN og ACCESS_AUD");
  assert.match(les("sites/hengsel/worker/index.ts"), /erHjelp\(pathname\)\) return handterHjelp\(req, env\)/);
  assert.ok(erHjelp("/hjelp") && erHjelp("/hjelp/") && erHjelp("/hjelp/x/y") && erHjelp("/hjelp.html"));
  assert.ok(!erHjelp("/hjelpesenter") && !erHjelp("/hjelpe") && !erHjelp("/") && !erHjelp("/apptest"));
});

test("ingen testmodus eller omgåelse av Access-sjekken i Worker-koden", () => {
  for (const f of ["access.ts", "hjelp.ts", "index.ts"]) {
    const kode = les(`sites/hengsel/worker/${f}`).replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
    assert.doesNotMatch(kode, /\b(?:TEST|BYPASS|OMGA|SKIP_ACCESS|localhost|127\.0\.0\.1)\w*/i, f);
  }
});

// ── Workeren ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const TEAM = "test.cloudflareaccess.com";
const AUD = "a".repeat(64);
const AUD2 = "b".repeat(64);
const b64 = (data) => Buffer.from(data).toString("base64url");
const ny = () => crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const par = await ny();
const annetPar = await ny();
const jwk = { ...(await crypto.subtle.exportKey("jwk", par.publicKey)), kid: "k1", alg: "RS256", use: "sig" };

async function lagToken({ krav = {}, hode = {}, nokkel = par.privateKey } = {}) {
  const na = Math.floor(Date.now() / 1000);
  const h = b64(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT", ...hode }));
  const p = b64(JSON.stringify({ iss: `https://${TEAM}`, aud: [AUD], email: "kunde@eksempel.no", iat: na, nbf: na - 5, exp: na + 3600, ...krav }));
  const sig = Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", nokkel, new TextEncoder().encode(`${h}.${p}`)));
  return `${h}.${p}.${b64(sig)}`;
}
const hent = async (url) => {
  assert.equal(String(url), `https://${TEAM}/cdn-cgi/access/certs`);
  return new Response(JSON.stringify({ keys: [jwk] }), { headers: { "Content-Type": "application/json" } });
};
const env = (ekstra = {}) => ({ ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ASSETS: { fetch: async () => new Response("<h1>hjelp</h1>", { headers: { "Content-Type": "text/html", ETag: '"x"' } }) }, ...ekstra });
const be = (sti, token, metode = "GET") => new Request(`https://hengsel.no${sti}`, { method: metode, headers: token ? { "Cf-Access-Jwt-Assertion": token } : {} });
const kjor = (req, e = env()) => { nullstillBuffer(); return handterHjelp(req, e, { hent }); };
const merkene = (r) => {
  assert.equal(r.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(r.headers.get("Cache-Control"), "private, no-store");
};

test("uten Cf-Access-Jwt-Assertion gir /hjelp og alt under 403, med noindex og no-store", async () => {
  for (const sti of ["/hjelp", "/hjelp/", "/hjelp/noe", "/hjelp/a/b.html", "/hjelp.html"]) {
    for (const metode of ["GET", "HEAD", "POST"]) {
      const r = await kjor(be(sti, null, metode));
      assert.equal(r.status, 403, `${metode} ${sti}`);
      merkene(r);
      assert.doesNotMatch(await r.text(), /<h1>hjelp<\/h1>/);
    }
  }
});

test("403 også når Access ikke er koblet til ennå (header mangler), og 503 med gyldig-utseende token uten oppsett", async () => {
  for (const e of [env({ ACCESS_TEAM_DOMAIN: "" }), env({ ACCESS_AUD: "" }), env({ ACCESS_TEAM_DOMAIN: undefined, ACCESS_AUD: undefined })]) {
    assert.equal((await kjor(be("/hjelp"), e)).status, 403);
    const r = await kjor(be("/hjelp", await lagToken()), e);
    assert.equal(r.status, 503);
    merkene(r);
    assert.doesNotMatch(await r.text(), /<h1>hjelp<\/h1>/);
  }
});

test("gyldig token: siden serveres med noindex, private og no-store, og ETag fjernes", async () => {
  for (const sti of ["/hjelp", "/hjelp/"]) {
    const r = await kjor(be(sti, await lagToken()));
    assert.equal(r.status, 200);
    assert.equal(await r.text(), "<h1>hjelp</h1>");
    merkene(r);
    assert.equal(r.headers.get("ETag"), null);
    assert.match(r.headers.get("Vary") ?? "", /Cf-Access-Jwt-Assertion/);
  }
  assert.equal((await kjor(be("/hjelp", await lagToken(), "HEAD"))).status, 200);
});

test("gyldig token, men annen metode enn GET og HEAD: 405", async () => {
  const r = await kjor(be("/hjelp", await lagToken(), "POST"));
  assert.equal(r.status, 405);
  merkene(r);
});

test("ugyldige tokens gir 403: feil signatur, endret innhold, feil app, feil utsteder, utløpt, ikke gyldig ennå, alg none, uten e-post, rot", async () => {
  const gyldig = await lagToken();
  const [h, p, s] = gyldig.split(".");
  const na = Math.floor(Date.now() / 1000);
  const tilfeller = {
    "signert med en annen nøkkel": await lagToken({ nokkel: annetPar.privateKey }),
    "endret innhold": `${h}.${b64(JSON.stringify({ ...JSON.parse(Buffer.from(p, "base64url")), email: "annen@eksempel.no" }))}.${s}`,
    "feil Access-app (aud)": await lagToken({ krav: { aud: ["c".repeat(64)] } }),
    "feil utsteder": await lagToken({ krav: { iss: "https://annet.cloudflareaccess.com" } }),
    "utløpt": await lagToken({ krav: { exp: na - 10 } }),
    "ikke gyldig ennå": await lagToken({ krav: { nbf: na + 3600 } }),
    "alg none": await lagToken({ hode: { alg: "none" } }),
    "ukjent nøkkel (kid)": await lagToken({ hode: { kid: "ukjent" } }),
    "uten e-post": await lagToken({ krav: { email: undefined } }),
    "rot": "ikke.et.token",
    "tom del": "a.b",
  };
  for (const [navn, token] of Object.entries(tilfeller)) {
    const r = await kjor(be("/hjelp", token));
    assert.equal(r.status, 403, navn);
    merkene(r);
  }
});

test("ACCESS_AUD kan ha flere apper skilt med komma (én for /sigdal og én for /hjelp), og e-posten returneres med små bokstaver", async () => {
  const e = env({ ACCESS_AUD: ` ${AUD2} , ${AUD} ` });
  assert.equal((await kjor(be("/hjelp", await lagToken({ krav: { aud: [AUD2] } })), e)).status, 200);
  assert.equal((await kjor(be("/hjelp", await lagToken()), e)).status, 200);
  assert.equal((await kjor(be("/hjelp", await lagToken({ krav: { aud: ["c".repeat(64)] } })), e)).status, 403);
  nullstillBuffer();
  const sjekk = await sjekkAccess(await lagToken({ krav: { email: "Kunde@Eksempel.NO" } }), { team: TEAM, aud: [AUD] }, { hent });
  assert.deepEqual(sjekk, { ok: true, epost: "kunde@eksempel.no" });
});

// ── Innholdet ─────────────────────────────────────────────────────────────────────────────────────────────────────────
test("datafila har samme oppbygging som Hjelp i CRM-et (kapittel, rolle, tittel, menyvei, steg, skjermbilde)", () => {
  const ider = HJELP_ROLLER.map((r) => r.id);
  assert.deepEqual(ider, ["kom-i-gang", "selger", "prosjektleder", "montasjeleder", "leder", "montor", "kunde"]);
  for (const o of HJELP_OPPGAVER) {
    assert.ok(ider.includes(o.rolle), o.tittel);
    assert.equal(o.kapittel, HJELP_ROLLER.find((r) => r.id === o.rolle).kapittel, o.tittel);
    assert.ok(o.tittel && (o.tekst || o.steg?.length), `${o.tittel}: mangler tekst eller steg`);
    if (o.skjermbilde) assert.ok(o.skjermbilde.navn);
  }
  for (const r of HJELP_ROLLER) assert.ok(HJELP_OPPGAVER.some((o) => o.rolle === r.id), r.id);
  assert.equal(HJELP.copyright, COPYRIGHT);
  assert.equal(HJELP.plassholder, "Skjermbilde kommer");
});

test("alle oppgavene i kildeteksten (docs/hjelp/hengsel-brukerveiledning.html) finnes i datafila", () => {
  const kilde = les("docs/hjelp/hengsel-brukerveiledning.html");
  const h3 = [...kilde.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.ok(h3.length >= 25, `fant bare ${h3.length} oppgaver i kilden`);
  const titler = HJELP_OPPGAVER.map((o) => o.tittel);
  for (const t of h3) assert.ok(titler.includes(t), `mangler «${t}»`);
  assert.equal(titler.length, h3.length);
  // Hvert steg i kilden står ordrett i datafila
  const steg = [...kilde.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1]);
  const alle = new Set(HJELP_OPPGAVER.flatMap((o) => o.steg ?? []));
  for (const s of steg) assert.ok(alle.has(s), `mangler steget «${s}»`);
  assert.equal(steg.length, alle.size);
  // Antall skjermbilder
  assert.equal([...kilde.matchAll(/class="bilde"/g)].length, HJELP_OPPGAVER.filter((o) => o.skjermbilde).length);
});

// ── Den bygde siden ───────────────────────────────────────────────────────────────────────────────────────────────────
test("dist/hjelp.html: noindex, copyright, rollevelger, plassholdere og ikke i sitemap eller menyen", () => {
  const dist = join(rot, "sites", "hengsel", "dist");
  assert.ok(existsSync(join(dist, "hjelp.html")), "dist/hjelp.html mangler, kjør npm run build først");
  const html = readFileSync(join(dist, "hjelp.html"), "utf8");
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.ok(html.includes(COPYRIGHT), "copyright-linjen mangler");
  assert.ok(html.indexOf(COPYRIGHT) > html.lastIndexOf("</main>"), "copyright-linjen skal stå under innholdet");
  assert.equal(html.split(COPYRIGHT).length - 1, 1);
  for (const r of HJELP_ROLLER) {
    assert.ok(html.includes(`href="#${r.id}"`), `rollevelger: ${r.id}`);
    assert.ok(html.includes(`id="${r.id}"`), `kapittel: ${r.id}`);
  }
  const plassholdere = HJELP_OPPGAVER.filter((o) => o.skjermbilde && !o.skjermbilde.fil).length;
  assert.equal(html.split(">Skjermbilde kommer<").length - 1, plassholdere);
  assert.doesNotMatch(html, /<script/);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
  for (const sti of ["index.html", "crm.html", "personvern.html", "priser-og-demo.html"]) assert.doesNotMatch(readFileSync(join(dist, sti), "utf8"), /href="\/hjelp/, sti);
  assert.doesNotMatch(readFileSync(join(dist, "sitemap.txt"), "utf8"), /hjelp/);
  assert.doesNotMatch(readFileSync(join(dist, "robots.txt"), "utf8"), /hjelp/);
  const headers = readFileSync(join(dist, "_headers"), "utf8");
  assert.match(headers, /\/hjelp\n\s+X-Robots-Tag: noindex, nofollow\n\s+Cache-Control: private, no-store/);
  assert.match(headers, /\/hjelp\/\*\n\s+X-Robots-Tag: noindex, nofollow\n\s+Cache-Control: private, no-store/);
});
