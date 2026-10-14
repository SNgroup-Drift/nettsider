/**
 * K-223: Worker-sjekken foran hengsel.no/sigdal, mot ekte `wrangler dev` (Worker + de bygde filene). Kjør `npm run build` først.
 *  - uten Cf-Access-Jwt-Assertion: 403 på alle stier under /sigdal (så siden ikke er åpen hvis Access mangler)
 *  - alle svar under /sigdal: X-Robots-Tag noindex, nofollow og Cache-Control private, no-store (også 403)
 *  - testmodus (SIGDAL_TESTMODUS=1) slipper bare inn på localhost/127.0.0.1, aldri på hengsel.no
 *  - Hengsel-sidene ellers er upåvirket (åpne, ikke noindex)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import http from "node:http";
import { join } from "node:path";
import { startHengsel } from "./lib-wrangler.mjs";

const dist = join(import.meta.dirname, "..", "sites", "hengsel", "dist");
const STIER = ["/sigdal", "/sigdal/crm", "/sigdal/ute", "/sigdal/apptest", "/sigdal/vis/", "/sigdal/vis/crm/", "/sigdal/tema.css", "/sigdal/img/app/idag-lys.webp", "/sigdal/img/vis/hero.webp", "/sigdal/finnes-ikke"];
let last, test_;
before(async () => {
  assert.ok(existsSync(join(dist, "sigdal", "tema.css")), "kjør npm run build først (sites/hengsel/dist/sigdal mangler)");
  // Etter hverandre: to wrangler dev samtidig deler tilstandsmappa (.wrangler) og kan låse hverandre
  last = await startHengsel();
  test_ = await startHengsel({ vars: { SIGDAL_TESTMODUS: "1" } });
});
after(async () => { await Promise.all([last?.stopp(), test_?.stopp()]); });

const hent = (base, sti, hoder = {}) => fetch(base + sti, { headers: hoder, redirect: "manual" });
const lukk = (r) => r.body?.cancel();

test("uten Access-header: 403 på alle stier under /sigdal, med noindex og no-store", async () => {
  for (const sti of STIER) {
    const r = await hent(last.base, sti);
    assert.equal(r.status, 403, `${sti} skulle gi 403 uten Cf-Access-Jwt-Assertion, ga ${r.status}`);
    assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow", `${sti}: X-Robots-Tag`);
    assert.equal(r.headers.get("cache-control"), "private, no-store", `${sti}: Cache-Control`);
    lukk(r);
  }
});

test("med Access-header: 200, og alle svar har noindex og no-store", async () => {
  for (const sti of STIER.filter((s) => s !== "/sigdal/finnes-ikke")) {
    const r = await hent(last.base, sti, { "Cf-Access-Jwt-Assertion": "x" });
    assert.equal(r.status, 200, `${sti} ga ${r.status}`);
    assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow", `${sti}: X-Robots-Tag`);
    assert.equal(r.headers.get("cache-control"), "private, no-store", `${sti}: Cache-Control`);
    lukk(r);
  }
  const ukjent = await hent(last.base, "/sigdal/finnes-ikke", { "Cf-Access-Jwt-Assertion": "x" });
  assert.equal(ukjent.status, 404);
  assert.equal(ukjent.headers.get("x-robots-tag"), "noindex, nofollow");
  lukk(ukjent);
});

test("Visningsrommet under /sigdal/vis/ har egen CSP (inline stil), resten bruker CSP-en med stilhashene", async () => {
  const vis = await hent(last.base, "/sigdal/vis/crm/", { "Cf-Access-Jwt-Assertion": "x" });
  assert.match(vis.headers.get("content-security-policy"), /style-src 'self' 'unsafe-inline'/);
  assert.match(vis.headers.get("content-security-policy"), /script-src 'self'/);
  lukk(vis);
  const side = await hent(last.base, "/sigdal", { "Cf-Access-Jwt-Assertion": "x" });
  assert.doesNotMatch(side.headers.get("content-security-policy"), /unsafe-inline/);
  lukk(side);
});

test("bare GET og HEAD", async () => {
  const r = await fetch(last.base + "/sigdal", { method: "POST", headers: { "Cf-Access-Jwt-Assertion": "x" } });
  assert.equal(r.status, 405);
  lukk(r);
});

test("testmodus slipper inn på localhost, men aldri på hengsel.no", async () => {
  const lokal = await hent(test_.base, "/sigdal/crm");
  assert.equal(lokal.status, 200, "testmodus på localhost");
  lukk(lokal);
  // Samme Worker, men adressen er hengsel.no (Host-headeren styrer URL-en Workeren ser; fetch tillater ikke å sette den, så node:http)
  const ute = await new Promise((ok, feil) => {
    const { port } = new URL(test_.base);
    http.get({ host: "127.0.0.1", port, path: "/sigdal/crm", headers: { Host: "hengsel.no" } }, (r) => { r.resume(); ok(r); }).on("error", feil);
  });
  assert.equal(ute.statusCode, 403, "testmodus må ikke virke på hengsel.no");
});

test("Hengsel-sidene er upåvirket: åpne og uten noindex-header", async () => {
  for (const sti of ["/", "/crm", "/priser-og-demo"]) {
    const r = await hent(last.base, sti);
    assert.equal(r.status, 200, sti);
    assert.equal(r.headers.get("x-robots-tag"), null, `${sti} skal ikke ha X-Robots-Tag`);
    const html = await r.text();
    assert.ok(!html.includes("data-kunde"), `${sti} har data-kunde`);
  }
});
