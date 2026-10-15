/**
 * K-240: Hengsel Admin fase A. Kjøres av npm test. Ingen nettverk, ingen hemmeligheter.
 *  1. Prisberegningen gir nøyaktig de tre regneeksemplene i 60-213 punkt e (og kontrolltallet fra 60-203), alle linjene.
 *  2. Migreringene: kjører i node:sqlite (D1-etterligning) og med ekte `wrangler d1 migrations apply --local`; prisliste 2026.2 er utkast med eksempel=1.
 *  3. API-tilgang: 401 uten Access, 403 for ukjent adresse, bare rollen eier kan skrive, lesere får 403 på POST.
 *  4. Lead-vernet på /api/lead: metode, Origin, honeypot, tidssjekk, lengdegrenser; gyldig lead blir eier + kontakt med status Ny.
 *  5. Excel-import: .xlsx og .csv leses, dubletter på org.nr. gir «oppdateres», rader uten org.nr. merkes, ingenting lagres før import.
 *  6. Tilbud-PDF lages fra et lagret tilbud (gyldig PDF, riktige beløp i innholdet).
 *  7. Hele eksempeldataene kan legges inn gjennom API-et, og Oversikt, Tavle og Avtaler regner riktig.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { lagTestdatabase, kjorMigreringer, lagD1 } from "./lib/d1-node.mjs";
import { leggInnEksempeldata, lagApi, BRUKER } from "./lib/admin-eksempeldata.mjs";
import { normaliserPrisliste, beregn, kr } from "../sites/admin/src/lib/pris.js";
import { handterApi, tilbudPdf } from "../sites/admin/worker/api.js";
import { handterLead } from "../sites/admin/worker/lead.js";
import { lesCsv, lesXlsx, forhandsvis, importer, tolkRader } from "../sites/admin/worker/import.js";
import { startSignering, registrerSignert, erKoblet } from "../sites/admin/worker/penneo.js";
import { stiTilFil } from "../sites/admin/worker/ruter.js";
import { idagOslo, pluss, plussMnd } from "../sites/admin/worker/db.js";
import { ROLLER } from "../sites/admin/worker/tilgang.js";
import { nullstillBuffer } from "../sites/admin/worker/access.js";
import worker from "../sites/admin/worker/index.js";

const rot = resolve(import.meta.dirname, "..");
const logoSvg = readFileSync(join(rot, "sites/admin/public/logo/logo-hengsel-lys.svg"), "utf8").replace(/<metadata>[\s\S]*?<\/metadata>/, "");

async function prisliste(db) {
  const pl = await db.prepare("SELECT * FROM prisliste WHERE versjon = ?").bind("2026.2").first();
  const rader = (await db.prepare("SELECT * FROM prislisterad WHERE prisliste_id = ?").bind(pl.id).all()).results;
  return normaliserPrisliste(pl, rader);
}
const linjeBelop = (r) => r.linjer.map((l) => `${l.type}:${kr(l.belop_ore)}`);

// ── 1. Prisberegningen ───────────────────────────────────────────────────────────────────────────────────────────────────────
test("prisberegning: eksempel 1, én butikk, Hengsel Start = 2 140 kr", async () => {
  const P = await prisliste(await lagTestdatabase());
  const r = beregn(P, "hengsel", [{ navn: "Butikk 1", pakke: "start", montorer: 1 }]);
  assert.equal(kr(r.netto_ore), "2 140 kr"); assert.equal(kr(r.mva_ore), "535 kr"); assert.equal(kr(r.inkl_ore), "2 675 kr");
  assert.deepEqual([r.aar_ore, r.aar_mva_ore, r.aar_inkl_ore].map(kr), ["25 680 kr", "6 420 kr", "32 100 kr"]);
  assert.deepEqual([r.etablering_ore, r.etablering_mva_ore, r.etablering_inkl_ore].map(kr), ["15 000 kr", "3 750 kr", "18 750 kr"]);
  assert.equal(r.rabatt_ore, 0); assert.equal(r.ute.modell, "montor"); assert.equal(kr(r.ute.pris_ore), "150 kr");
  assert.equal(r.tillegg.find((t) => t.kode === "backup").inkludert, false);
  assert.deepEqual(linjeBelop(r), ["pakke:1 990 kr", "ute:150 kr", "etablering:15 000 kr", "viderefakturering:0 kr"]);
  assert.equal(r.versjon, "2026.2"); assert.equal(r.support_timer, 1);
});

test("prisberegning: eksempel 2, tre butikker Sigdal CRM med ulik pakke (15 %) = 14 789 kr", async () => {
  const P = await prisliste(await lagTestdatabase());
  const r = beregn(P, "sigdal", [{ navn: "A", pakke: "komplett", brukere: 2, montorer: 2 }, { navn: "B", pakke: "butikk", brukere: 1, montorer: 2 }, { navn: "C", pakke: "start", montorer: 1 }], { tillegg: ["domene"] });
  assert.deepEqual(r.rader.map((x) => kr(x.sum_ore)), ["8 090 kr", "5 440 kr", "2 990 kr"]);
  assert.equal(kr(r.ute.pris_ore), "750 kr"); assert.equal(kr(r.grunnlag_ore), "17 270 kr");
  assert.equal(r.rabatt_prosent, 15); assert.equal(kr(r.rabatt_ore), "2 591 kr", "2 590,50 avrundet opp");
  assert.equal(r.tillegg.find((t) => t.kode === "backup").inkludert, true); assert.equal(kr(r.tillegg_ore), "110 kr");
  assert.equal(kr(r.netto_ore), "14 789 kr"); assert.equal(kr(r.mva_ore), "3 697,25 kr"); assert.equal(kr(r.inkl_ore), "18 486,25 kr");
  assert.deepEqual([r.aar_ore, r.aar_mva_ore, r.aar_inkl_ore].map(kr), ["177 468 kr", "44 367 kr", "221 835 kr"]);
  assert.deepEqual([r.etablering_ore, r.etablering_mva_ore, r.etablering_inkl_ore].map(kr), ["79 000 kr", "19 750 kr", "98 750 kr"]);
  assert.equal(r.support_timer, 6);
  assert.deepEqual(linjeBelop(r), ["pakke:6 990 kr", "ekstra_brukere:1 100 kr", "pakke:4 990 kr", "ekstra_brukere:450 kr", "pakke:2 990 kr", "ute:750 kr", "rabatt:−2 591 kr", "tillegg:0 kr", "tillegg:110 kr", "etablering:39 000 kr", "etablering:25 000 kr", "etablering:15 000 kr", "viderefakturering:0 kr"]);
});

test("prisberegning: eksempel 3, elleve butikker Hengsel med Ute og tillegg (25 %) = 36 815 kr", async () => {
  const P = await prisliste(await lagTestdatabase());
  const butikker = [{ navn: "1", pakke: "komplett", brukere: 3, montorer: 2 }, { navn: "2", pakke: "komplett", brukere: 3, montorer: 2 }, { navn: "3", pakke: "butikk", brukere: 1, montorer: 2 }, ...[4, 5, 6, 7, 8].map((i) => ({ navn: String(i), pakke: "butikk", montorer: 2 })), ...[9, 10, 11].map((i) => ({ navn: String(i), pakke: "start", montorer: 2 }))];
  const r = beregn(P, "hengsel", butikker, { tillegg: ["domene"] });
  assert.equal(r.ute.antall, 22); assert.equal(r.ute.modell, "montor"); assert.equal(kr(r.ute.pris_ore), "3 300 kr");
  assert.equal(kr(r.grunnlag_ore), "48 940 kr"); assert.equal(r.rabatt_prosent, 25); assert.equal(kr(r.rabatt_ore), "12 235 kr");
  assert.equal(kr(r.netto_ore), "36 815 kr"); assert.equal(kr(r.mva_ore), "9 203,75 kr"); assert.equal(kr(r.inkl_ore), "46 018,75 kr");
  assert.deepEqual([r.aar_ore, r.aar_mva_ore, r.aar_inkl_ore].map(kr), ["441 780 kr", "110 445 kr", "552 225 kr"]);
  assert.deepEqual([r.etablering_ore, r.etablering_mva_ore, r.etablering_inkl_ore].map(kr), ["273 000 kr", "68 250 kr", "341 250 kr"]);
  const { viderefakturering } = await import("../sites/admin/src/lib/pris.js");
  assert.equal(kr(viderefakturering(P, 40000)), "460 kr", "SMS med kostpris 400 kr");
});

test("prisberegning: kontrolltallet fra 60-203 (3 × Butikk Sigdal + 4 montører) = 13 234 kr, og firmapris når den er billigst", async () => {
  const P = await prisliste(await lagTestdatabase());
  const r = beregn(P, "sigdal", [{ navn: "Hamar", pakke: "butikk", montorer: 2 }, { navn: "Gjøvik", pakke: "butikk", montorer: 1 }, { navn: "Lillehammer", pakke: "butikk", montorer: 1 }]);
  assert.equal(kr(r.rabatt_ore), "2 336 kr"); assert.equal(kr(r.netto_ore), "13 234 kr"); assert.equal(kr(r.mva_ore), "3 308,50 kr"); assert.equal(kr(r.inkl_ore), "16 542,50 kr");
  assert.equal(kr(r.etablering_ore), "75 000 kr"); assert.equal(kr(r.etablering_inkl_ore), "93 750 kr");
  const f = beregn(P, "hengsel", [{ navn: "A", pakke: "butikk", montorer: 8 }]);
  assert.equal(f.ute.modell, "firma"); assert.equal(kr(f.ute.pris_ore), "990 kr");
  const g = beregn(P, "hengsel", [{ navn: "A", pakke: "butikk", montorer: 9 }]);
  assert.equal(g.ute.modell, "montor"); assert.equal(kr(g.ute.pris_ore), "1 350 kr", "over 8 montører gjelder ikke firmapris");
  assert.equal(beregn(P, "hengsel", [{ navn: "A", pakke: "butikk", montorer: 0 }]).ute.modell, "ingen");
  assert.throws(() => beregn(P, "hengsel", [{ navn: "A", pakke: "gull" }]));
});

// ── 2. Migreringene ──────────────────────────────────────────────────────────────────────────────────────────────────────────
test("migreringene lager tabellene, prisliste 2026.2 som utkast med eksempel=1, og innstillingene fra punkt k", async () => {
  const db = await lagTestdatabase();
  const tabeller = (await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all()).results.map((r) => r.name);
  for (const t of ["eier", "butikk", "kontakt", "mulighet", "aktivitet", "tilbud", "tilbudslinje", "avtale", "avtaledokument", "avtalemal", "signatar", "prisliste", "prislisterad", "innstilling", "bruker"]) assert.ok(tabeller.includes(t), t);
  const pl = await db.prepare("SELECT * FROM prisliste WHERE versjon = '2026.2'").first();
  assert.equal(pl.status, "utkast"); assert.equal(pl.eksempel, 1);
  assert.equal(await db.prepare("SELECT COUNT(*) AS n FROM prislisterad WHERE prisliste_id = ?").bind(pl.id).first("n"), 12);
  assert.equal(JSON.parse((await db.prepare("SELECT verdi FROM innstilling WHERE nokkel = 'fornyes_snart_dager'").first()).verdi), 90);
  assert.equal(JSON.parse((await db.prepare("SELECT verdi FROM innstilling WHERE nokkel = 'tilbud_gyldig_dager'").first()).verdi), 14);
  const lev = await db.prepare("SELECT * FROM innstilling WHERE nokkel = 'leverandor'").first();
  assert.equal(lev.eksempel, 1); assert.equal(JSON.parse(lev.verdi).navn, "ES-Holding AS");
  // Bare én aktiv om gangen, og org.nr. er unikt
  await db.prepare("UPDATE prisliste SET status = 'aktiv' WHERE versjon = '2026.2'").run();
  await assert.rejects(db.prepare("INSERT INTO prisliste (id, versjon, gjelder_fra, status, opprettet, endret) VALUES ('01K7JX0000000000000000TEST', '2027.1', '2027-01-01', 'aktiv', 'x', 'x')").run());
  assert.doesNotMatch(readFileSync(join(rot, "sites/admin/migrations/0001_fase_a.sql"), "utf8"), /Nordli|Granlund|Fjordhuset|923 ?456 ?781/, "eksempeldata hører ikke hjemme i migreringen");
});

test("`wrangler d1 migrations apply --local` kjører migreringene mot sites/admin/wrangler.jsonc", { timeout: 180_000 }, () => {
  const tmp = mkdtempSync(join(tmpdir(), "k240-d1-"));
  try {
    const ut = execFileSync("npx", ["wrangler", "d1", "migrations", "apply", "hengsel-admin", "--local", "-c", "sites/admin/wrangler.jsonc", "--persist-to", tmp], { cwd: rot, env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" }, encoding: "utf8", timeout: 170_000 });
    assert.match(ut, /0001_fase_a\.sql/);
    assert.match(ut, /✅/);
    assert.doesNotMatch(ut, /❌|error/i);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

// ── 3. API-tilgang ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const TEAM = "test.cloudflareaccess.com", AUD = "a".repeat(64);
const b64 = (d) => Buffer.from(d).toString("base64url");
const par = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", par.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
async function token(email = "es@sngroup.no") {
  const na = Math.floor(Date.now() / 1000);
  const h = b64(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
  const p = b64(JSON.stringify({ iss: `https://${TEAM}`, aud: [AUD], email, iat: na, nbf: na - 5, exp: na + 3600 }));
  return `${h}.${p}.${b64(Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", par.privateKey, new TextEncoder().encode(`${h}.${p}`))))}`;
}
const originalFetch = globalThis.fetch;
function medNokler(fn) {
  return async () => {
    nullstillBuffer();
    globalThis.fetch = async (url) => { assert.equal(String(url), `https://${TEAM}/cdn-cgi/access/certs`); return new Response(JSON.stringify({ keys: [jwk] }), { headers: { "Content-Type": "application/json" } }); };
    try { await fn(); } finally { globalThis.fetch = originalFetch; }
  };
}
const assets = { fetch: async (r) => new URL(r.url).pathname === "/logo/logo-hengsel-lys.svg" ? new Response(logoSvg, { headers: { "Content-Type": "image/svg+xml" } }) : new Response(`<h1>${new URL(r.url).pathname}</h1>`, { headers: { "Content-Type": "text/html" } }) };
const envMed = async (ekstra = {}) => ({ ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ASSETS: assets, DB: await lagTestdatabase(), ...ekstra });
const be = (sti, tok, metode = "GET", kropp) => new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: { ...(tok ? { "Cf-Access-Jwt-Assertion": tok } : {}), ...(kropp ? { "Content-Type": "application/json" } : {}) }, body: kropp ? JSON.stringify(kropp) : undefined });

test("API: 401 uten Access-token, 403 for en adresse som ikke står i tilgang.js, 200 for eier", medNokler(async () => {
  const env = await envMed();
  const r401 = await worker.fetch(be("/api/oversikt"), env);
  assert.equal(r401.status, 401); assert.equal((await r401.json()).kode, "ADM-401"); assert.match(r401.headers.get("Cache-Control"), /no-store/);
  const r403 = await worker.fetch(be("/api/oversikt", await token("ukjent@eksempel.no")), env);
  assert.equal(r403.status, 403); assert.equal((await r403.json()).kode, "ADM-403");
  const r200 = await worker.fetch(be("/api/oversikt", await token()), env);
  assert.equal(r200.status, 200); const d = await r200.json(); assert.equal(d.ok, true); assert.equal(d.tall.aktive_kunder, 0);
  assert.equal((await worker.fetch(be("/api/finnes-ikke", await token()), env)).status, 404);
  // Sider uten Access får fortsatt 401; sider med id i adressen serveres fra én fil
  assert.equal((await worker.fetch(be("/salg/tavle"), env)).status, 401);
  const side = await worker.fetch(be("/salg/eiere/01K7JX0000000000000000ABCD", await token()), env);
  assert.equal(await side.text(), "<h1>/salg/eierkort</h1>");
  assert.equal(stiTilFil("/avtaler/A-2026-019"), "/avtaler/avtale"); assert.equal(stiTilFil("/kunder"), "/kunder"); assert.equal(stiTilFil("/salg/eiere/kort"), "/salg/eiere/kort");
}));

test("API: bare rollen eier skriver; en leser med alle: true får 403 på POST, PATCH og DELETE", medNokler(async () => {
  const env = await envMed();
  ROLLER["leser@eksempel.no"] = { alle: true, navn: "Leser" };
  try {
    const les = await worker.fetch(be("/api/eiere", await token("leser@eksempel.no")), env);
    assert.equal(les.status, 200);
    for (const [m, sti] of [["POST", "/api/eiere"], ["PATCH", "/api/eiere/01K7JX0000000000000000ABCD"], ["DELETE", "/api/eiere/01K7JX0000000000000000ABCD"], ["POST", "/api/aktiviteter"], ["PUT", "/api/leverandor"]]) {
      const r = await worker.fetch(be(sti, await token("leser@eksempel.no"), m, { navn: "x" }), env);
      assert.equal(r.status, 403, `${m} ${sti}`); assert.equal((await r.json()).kode, "ADM-403");
    }
    const ok = await worker.fetch(be("/api/eiere", await token(), "POST", { navn: "Test Kjøkken AS", orgnr: "999 888 777", kjede: "sigdal" }), env);
    assert.equal(ok.status, 200);
    const { id } = await ok.json();
    const kort = await (await worker.fetch(be(`/api/eiere/${id}`, await token()), env)).json();
    assert.equal(kort.eier.navn, "Test Kjøkken AS"); assert.equal(kort.eier.orgnr, "999888777"); assert.equal(kort.eier.status, "ny"); assert.equal(kort.butikker.length, 1);
    const feil = await worker.fetch(be("/api/eiere", await token(), "POST", { navn: "", orgnr: "12" }), env);
    assert.equal(feil.status, 400); const fd = await feil.json(); assert.equal(fd.kode, "ADM-400"); assert.ok(fd.feil.navn);
    const dub = await worker.fetch(be("/api/eiere", await token(), "POST", { navn: "Dublett AS", orgnr: "999888777" }), env);
    assert.equal(dub.status, 400); assert.ok((await dub.json()).feil.orgnr);
    assert.equal((await worker.fetch(be("/api/eiere", await token(), "POST", { navn: "x" }), { ...env, DB: undefined })).status, 503, "uten DB: ADM-504");
  } finally { delete ROLLER["leser@eksempel.no"]; }
}));

test("API: uten ACCESS-oppsett 503, og andre metoder enn GET/HEAD utenfor /api gir 405", medNokler(async () => {
  const env = await envMed();
  assert.equal((await worker.fetch(be("/api/oversikt", await token()), { ...env, ACCESS_AUD: "" })).status, 503);
  assert.equal((await worker.fetch(be("/salg/tavle", await token(), "POST"), env)).status, 405);
}));

// ── 4. Lead-vernet ───────────────────────────────────────────────────────────────────────────────────────────────────────────
const gyldigLead = { navn: "Silje Haugen", butikk: "Haugen Kjøkken & Bad AS", epost: "silje@haugenkjokken.no", tlf: "", avdelinger: "1", melding: "Vi er tre selgere og to montører.", nettsted: "" };
function leadReq(kropp = gyldigLead, { metode = "POST", origin = "https://hengsel.no", type = "json", ekstra = {} } = {}) {
  const hoder = { ...(origin ? { Origin: origin } : {}), ...ekstra };
  // Tidsfeltet settes her (20 sekunder gammelt) så testen virker uansett klokke
  if (kropp && typeof kropp === "object" && kropp.t === undefined) kropp = { ...kropp, t: String(Date.now() - 20_000) };
  let body;
  if (type === "json") { hoder["Content-Type"] = "application/json"; body = typeof kropp === "string" ? kropp : JSON.stringify(kropp); }
  else if (type === "form") { hoder["Content-Type"] = "application/x-www-form-urlencoded"; body = new URLSearchParams(kropp).toString(); }
  else { hoder["Content-Type"] = type; body = "x"; }
  return new Request("https://admin.hengsel.no/api/lead", { method: metode, headers: hoder, body: metode === "GET" ? undefined : body });
}

test("lead: gyldig forespørsel fra hengsel.no lager eier med status Ny, kontakt, butikk og mulighet, merket Ny i Oversikt", async () => {
  const env = await envMed();
  const r = await worker.fetch(leadReq(), env);
  assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true });
  const e = await env.DB.prepare("SELECT * FROM eier").first();
  assert.equal(e.navn, "Haugen Kjøkken & Bad AS"); assert.equal(e.status, "ny"); assert.equal(e.kilde, "be_om_demo"); assert.equal(e.lead_ny, 1);
  assert.equal(e.neste_tekst, "Ta kontakt innen 24 timer"); assert.equal(e.lead_melding, gyldigLead.melding);
  const k = await env.DB.prepare("SELECT * FROM kontakt WHERE eier_id = ?").bind(e.id).first();
  assert.equal(k.navn, "Silje Haugen"); assert.equal(k.epost, "silje@haugenkjokken.no");
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM mulighet WHERE eier_id = ? AND fase = 'ny'").bind(e.id).first("n"), 1);
  // Samme kontakt igjen: ingen ny eier, men en aktivitet og Ny-merke
  await worker.fetch(leadReq({ ...gyldigLead, melding: "Hei igjen" }), env);
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM eier").first("n"), 1);
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM aktivitet WHERE eier_id = ?").bind(e.id).first("n"), 2);
  // Vises i Oversikt som lead
  const api = lagApi(env);
  const ov = await api("GET", "/api/oversikt");
  assert.equal(ov.leads.length, 1); assert.equal(ov.leads[0].navn, "Haugen Kjøkken & Bad AS");
  // Skjemaformat virker også
  assert.equal((await worker.fetch(leadReq({ ...gyldigLead, epost: "annen@eksempel.no" }, { type: "form" }), env)).status, 200);
});

test("lead: vernet er som /api/demo: metode, Origin, honeypot, tidssjekk, lengdegrenser, innholdstype, og valgfri LEAD_NOKKEL", async () => {
  const env = await envMed();
  const antall = async () => Number(await env.DB.prepare("SELECT COUNT(*) AS n FROM eier").first("n"));
  assert.equal((await worker.fetch(leadReq(gyldigLead, { metode: "GET" }), env)).status, 405);
  for (const origin of ["https://eksempel.no", "http://hengsel.no", "https://hengsel.no.eksempel.no", "null", ""]) assert.equal((await worker.fetch(leadReq(gyldigLead, { origin }), env)).status, 403, origin);
  const hp = await worker.fetch(leadReq({ ...gyldigLead, nettsted: "https://spam.example" }), env);
  assert.equal(hp.status, 200); assert.equal(await antall(), 0, "honeypot lagrer ingenting");
  const uten = { ...gyldigLead, t: "" };
  for (const k of [uten, { ...gyldigLead, t: "abc" }, { ...gyldigLead, t: String(Date.now() - 1000) }, { ...gyldigLead, t: String(Date.now() - 25 * 3600 * 1000) }, { ...gyldigLead, t: String(Date.now() + 3600 * 1000) }]) assert.equal((await worker.fetch(leadReq(k), env)).status, 400, JSON.stringify(k.t));
  for (const k of [{ ...gyldigLead, navn: "" }, { ...gyldigLead, navn: "x".repeat(121) }, { ...gyldigLead, epost: "", tlf: "" }, { ...gyldigLead, epost: "ikke-epost" }, { ...gyldigLead, melding: "x".repeat(1001) }, { ...gyldigLead, avdelinger: "99" }, { ...gyldigLead, navn: "a\u0000b" }]) {
    const r = await worker.fetch(leadReq(k), env);
    assert.equal(r.status, 400); assert.equal((await r.json()).ok, false);
  }
  assert.equal((await worker.fetch(leadReq(gyldigLead, { type: "text/plain" }), env)).status, 415);
  assert.equal((await worker.fetch(leadReq("x".repeat(9000)), env)).status, 413);
  assert.equal(await antall(), 0);
  // LEAD_NOKKEL satt: uten riktig Bearer 403, med 200. LEAD_ORIGIN kan endres.
  const envN = { ...env, LEAD_NOKKEL: "testnokkel", LEAD_ORIGIN: "https://demo.hengsel.no" };
  const ok = { ...gyldigLead };
  assert.equal((await worker.fetch(leadReq(ok, { origin: "https://demo.hengsel.no" }), envN)).status, 403);
  assert.equal((await worker.fetch(leadReq(ok, { origin: "https://demo.hengsel.no", ekstra: { Authorization: "Bearer feil" } }), envN)).status, 403);
  assert.equal((await worker.fetch(leadReq(ok, { origin: "https://demo.hengsel.no", ekstra: { Authorization: "Bearer testnokkel" } }), envN)).status, 200);
  assert.equal(await antall(), 1);
  // Uten database: 503 ADM-504, ikke 200
  const r = await handterLead(leadReq(ok), { DB: undefined }, Date.now());
  assert.equal(r.status, 503);
});

// ── 5. Excel-import ──────────────────────────────────────────────────────────────────────────────────────────────────────────
import { lagXlsx } from "./lib/admin-xlsx-eksempel.mjs";
const RADER = [
  ["Eier", "Org.nr.", "Adresse", "Postnr.", "Sted", "Fylke", "Kjede", "Antall butikker", "Butikker", "Kontakt", "Kontakt e-post", "Kontakt telefon", "Kilde"],
  ["Lunde Kjøkken AS", "930 221 467", "Storgata 1", "2317", "Hamar", "Innlandet", "Sigdal", "2", "Lunde Hamar; Lunde Gjøvik", "Ola Lunde", "ola@lunde.no", "900 00 000", "Sigdal-kjedemøte"],
  ["Brekke Interiør AS", "921 774 038", "", "", "Bergen", "Vestland", "Sigdal", "1", "", "Eli Brekke", "eli@brekke.no", "", ""],
  ["Nordli Kjøkken AS", "923456781", "", "", "Hamar", "Innlandet", "Sigdal", "3", "", "Kari Nordli", "kari@nordli-kjokken.no", "", "Sigdal-kjedemøte"],
  ["Sandvik Kjøkken AS", "928 330 115", "", "", "Stavanger", "Rogaland", "Sigdal", "1", "", "", "", "", ""],
  ["Tveit Innredning", "", "", "", "Arendal", "Agder", "Sigdal", "1", "", "Jan Tveit", "", "", ""],
  ["Holm & Sønn Kjøkken AS", "917 552 904", "", "", "Moss", "Østfold", "Sigdal", "4", "", "", "", "", ""],
  ["Holm & Sønn Kjøkken AS", "917552904", "", "", "Moss", "Østfold", "Sigdal", "4", "", "", "", "", ""],
];

test("import: .xlsx og .csv leses likt, overskriftene kjennes igjen, ø og & overlever", async () => {
  const x = await lesXlsx(lagXlsx(RADER));
  assert.equal(x.length, RADER.length); assert.equal(x[1][0], "Lunde Kjøkken AS"); assert.equal(x[6][0], "Holm & Sønn Kjøkken AS"); assert.equal(x[1][7], "2");
  const csv = lesCsv("﻿" + RADER.map((r) => r.map((v) => (/[;"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(";")).join("\r\n"));
  assert.deepEqual(csv, RADER);
  assert.deepEqual(lesCsv("Eier,Org.nr.\n\"Lunde, Kjøkken\",930221467")[1], ["Lunde, Kjøkken", "930221467"]);
  const t = tolkRader(x);
  assert.equal(t[0].navn, "Lunde Kjøkken AS"); assert.equal(t[0].kontakt_epost, "ola@lunde.no"); assert.equal(t[0].butikker, "Lunde Hamar; Lunde Gjøvik"); assert.equal(t[0].kilde, "Sigdal-kjedemøte");
  // Uten overskrifter: etter plassering
  assert.equal(tolkRader([["Firma AS", "930221467", "", "", "Oslo"]])[0].sted, "Oslo");
});

test("import: forhåndsvisning teller nye, oppdateres (dublett på org.nr.) og mangler org.nr.; ingenting lagres før import", async () => {
  const env = await envMed();
  const api = lagApi(env);
  await api("POST", "/api/eiere", { navn: "Nordli Kjøkken AS", orgnr: "923 456 781", kjede: "sigdal", produktlinje: "sigdal", status: "forhandling", sted: "Hamar" });
  const fv = await api("POST", "/api/import/forhandsvis", undefined, { fil: { navn: "kjedeliste-sigdal-okt.xlsx", data: lagXlsx(RADER) } });
  assert.equal(fv.filnavn, "kjedeliste-sigdal-okt.xlsx"); assert.equal(fv.antall, 7);
  assert.deepEqual(fv.telling, { ny: 4, oppdateres: 1, mangler_orgnr: 1, hoppes: 1 });
  const nordli = fv.rader.find((r) => r.navn === "Nordli Kjøkken AS");
  assert.equal(nordli.resultat, "oppdateres"); assert.ok(nordli.eier_id);
  assert.equal(fv.rader.find((r) => r.navn === "Tveit Innredning").resultat, "mangler_orgnr");
  assert.equal(fv.rader.filter((r) => r.navn.startsWith("Holm"))[1].resultat, "hoppes", "samme org.nr. to ganger i fila");
  assert.equal(fv.rader[0].orgnr, "930221467"); assert.deepEqual(fv.rader[0].butikker, ["Lunde Hamar", "Lunde Gjøvik"]); assert.equal(fv.rader[0].kilde, "sigdal_kjedemote");
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM eier").first("n"), 1, "forhåndsvisning lagrer ingenting");
  // Importer
  const { ok, ...res } = await api("POST", "/api/import", { rader: fv.raa });
  assert.deepEqual(res, { importert: 5, oppdatert: 1, mangler_orgnr: 1, hoppet: 1 });
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM eier").first("n"), 6);
  const lunde = await env.DB.prepare("SELECT * FROM eier WHERE orgnr = '930221467'").first();
  assert.equal(lunde.status, "ny"); assert.equal(lunde.kilde, "sigdal_kjedemote"); assert.equal(lunde.kjede, "sigdal"); assert.equal(lunde.produktlinje, "sigdal");
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM butikk WHERE eier_id = ?").bind(lunde.id).first("n"), 2);
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM butikk WHERE eier_id = (SELECT id FROM eier WHERE orgnr = '917552904')").first("n"), 4, "antall butikker uten navn");
  const n2 = await env.DB.prepare("SELECT * FROM eier WHERE orgnr = '923456781'").first();
  assert.equal(n2.status, "forhandling", "utfylte felt overskrives ikke"); assert.equal(n2.sted, "Hamar");
  const tveit = await env.DB.prepare("SELECT * FROM eier WHERE navn = 'Tveit Innredning'").first();
  assert.equal(tveit.orgnr, null); assert.match(tveit.neste_tekst, /org\.nr/);
  // Direkte i modulen: csv med samme innhold gir samme forhåndsvisning
  const fv2 = await forhandsvis(env.DB, lesCsv(RADER.map((r) => r.join(";")).join("\n")));
  assert.equal(fv2.telling.oppdateres, 5, "alle med org.nr. finnes nå");
  assert.equal(typeof importer, "function");
  // Feil filtype avvises
  await assert.rejects(api("POST", "/api/import/forhandsvis", undefined, { fil: { navn: "liste.pdf", data: Buffer.from("x") } }), /415/);
});

// ── 6. Tilbud-PDF ────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("tilbud: lagres med prislisteversjon og linjer, får løpenummer og versjon, og PDF-en lages med riktige beløp", medNokler(async () => {
  const env = await envMed();
  const api = lagApi(env);
  const eier = await api("POST", "/api/eiere", { navn: "Nordli Kjøkken AS", orgnr: "923456781", adresse: "Strandgata 14", postnr: "2317", sted: "Hamar", kjede: "sigdal", produktlinje: "sigdal", status: "forhandling",
    butikker: [{ navn: "Nordli Kjøkken Hamar", sted: "Hamar", montorer: 2 }, { navn: "Nordli Kjøkken Gjøvik", montorer: 1 }, { navn: "Nordli Kjøkken Lillehammer", montorer: 1 }], kontakter: [{ navn: "Kari Nordli", rolle: "daglig leder", epost: "kari@nordli-kjokken.no", signaturrett: 1 }] });
  const kort = await api("GET", `/api/eiere/${eier.id}`);
  const butikker = kort.butikker.map((x) => ({ navn: x.navn, pakke: "butikk", brukere: 0, montorer: x.montorer }));
  const beregnet = await api("POST", "/api/tilbud/beregn", { eier_id: eier.id, produktlinje: "sigdal", butikker, tillegg: [] });
  assert.equal(kr(beregnet.resultat.netto_ore), "13 234 kr");
  const t1 = await api("POST", "/api/tilbud", { eier_id: eier.id, produktlinje: "sigdal", butikker: butikker.map((x) => ({ ...x, pakke: "komplett" })), tillegg: [] });
  const t2 = await api("POST", "/api/tilbud", { eier_id: eier.id, produktlinje: "sigdal", butikker, tillegg: [] });
  assert.equal(t1.nr, t2.nr); assert.equal(t1.versjon, 1); assert.equal(t2.versjon, 2); assert.match(t2.nr, /^T-\d{4}-001$/);
  assert.equal(t2.pdf, `/salg/tilbud/${t2.nr}/2.pdf`); assert.equal(kr(t2.sum_mnd_ore), "13 234 kr"); assert.equal(t2.prisliste, "2026.2");
  const lagret = await api("GET", `/api/tilbud/${t2.id}`);
  assert.equal(lagret.tilbud.status, "utkast"); assert.equal(lagret.tilbud.erstatter_id, t1.id); assert.equal((await api("GET", `/api/tilbud/${t1.id}`)).tilbud.status, "erstattet");
  assert.equal(lagret.linjer.filter((l) => l.type === "pakke").length, 3); assert.equal(lagret.linjer.find((l) => l.type === "rabatt").belop_ore, -233600);
  assert.equal(pluss(lagret.tilbud.dato, 14), lagret.tilbud.gyldig_til, "gyldig 14 dager (innstilling)");
  assert.equal(lagret.tilbud.leverandor.navn, "ES-Holding AS");
  // PDF gjennom Workeren (bak Access)
  const r = await worker.fetch(be(`/salg/tilbud/${t2.nr}/2.pdf`, await token()), env);
  assert.equal(r.status, 200); assert.equal(r.headers.get("Content-Type"), "application/pdf");
  const bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString("latin1"), "%PDF-"); assert.match(bytes.subarray(-40).toString("latin1"), /%%EOF/);
  const tekst = bytes.toString("latin1");
  for (const s of ["13 234 kr", "3 308,50 kr", "16 542,50 kr", "158 808 kr", "198 510 kr", "75 000 kr", "93 750 kr", "2 336 kr", "15 570 kr", "Nordli Kj\xf8kken Hamar", `${t2.nr} v2`, "prisliste 2026.2", "Eksempel", "erstatter versjon 1", "Sigdal CRM for tre butikker", "/Helvetica-Bold", "Bindingstid 12 m\xe5neder", "Oppsigelsesfrist 3 m\xe5neder", "6 timer per m\xe5ned", "kundeavtale", "v3.1", "supportniv\xe5 Standard", "v1.2"]) assert.ok(tekst.includes(s), `PDF-en mangler «${s}»`);
  assert.ok(tekst.includes(" c\n") || tekst.includes(" c "), "logoen er tegnet med kurver");
  assert.equal((await worker.fetch(be(`/salg/tilbud/T-2026-999/1.pdf`, await token()), env)).status, 404);
  assert.equal((await worker.fetch(be(`/salg/tilbud/${t2.nr}/2.pdf`), env)).status, 401, "PDF-en ligger bak Access");
  assert.equal((await tilbudPdf({ DB: undefined }, t2.nr, 2)).status, 503);
}));

// ── 7. Eksempeldata, avtaler og Penneo-rekkefølgen ───────────────────────────────────────────────────────────────────────────
test("penneo: rekkefølgen kunde → leverandør, bare den som venter kan signere, og integrasjonen er av uten PENNEO_API_KEY", () => {
  const s0 = [{ rekkefolge: 2, part: "leverandor", status: "ikke_sendt" }, { rekkefolge: 1, part: "kunde", status: "ikke_sendt" }];
  const s1 = startSignering(s0, "T1");
  assert.deepEqual(s1.map((s) => [s.rekkefolge, s.status, s.sendt]), [[1, "venter", "T1"], [2, "ikke_sendt", null]]);
  assert.throws(() => registrerSignert(s1, 2, "T2"), /først|ikke sendt/i, "leverandøren kan ikke signere før kunden");
  const s2 = registrerSignert(s1, 1, "T2");
  assert.equal(s2.alleSignert, false);
  assert.deepEqual(s2.signatarer.map((s) => [s.rekkefolge, s.status, s.sendt]), [[1, "signert", "T1"], [2, "venter", "T2"]]);
  assert.throws(() => registrerSignert(s2.signatarer, 1, "T3"), /allerede/);
  const s3 = registrerSignert(s2.signatarer, 2, "T3");
  assert.equal(s3.alleSignert, true);
  assert.equal(erKoblet({}), false); assert.equal(erKoblet({ PENNEO_API_KEY: "" }), false); assert.equal(erKoblet({ PENNEO_API_KEY: "x" }), true);
});

test("eksempeldata gjennom API-et: Oversikt, Tavle, Eiere, Avtaler og eierkortet regner riktig", { timeout: 60_000 }, async () => {
  const env = await envMed();
  const idag = idagOslo();
  const ider = await leggInnEksempeldata(env, { idag });
  const api = lagApi(env);
  const ov = await api("GET", "/api/oversikt");
  assert.equal(ov.tall.aktive_kunder, 5); assert.equal(ov.tall.butikker_hos_kunder, 12);
  assert.equal(ov.tall.fornyes_snart, 2, "Vestby og Aune fornyes innen 90 dager"); assert.equal(ov.sagt_opp.length, 1);
  assert.ok(ov.tall.inntekt_mnd_ore > 0); assert.equal(ov.tall.apne_muligheter, 8, "7 prospekter og leadet");
  assert.ok(ov.neste_steg.some((n) => n.eier_navn === "Nordli Kjøkken AS" && n.forfalt)); assert.ok(ov.neste_steg.some((n) => n.eier_navn === "Solsiden Interiør AS" && !n.forfalt));
  assert.equal(ov.leads.length, 2); assert.ok(ov.leads.some((l) => l.navn === "Haugen Kjøkken & Bad AS" && l.lead_ny === 1));
  const tavle = await api("GET", "/api/tavle");
  const kol = Object.fromEntries(tavle.kolonner.map((k) => [k.id, k]));
  assert.equal(kol.ny.antall, 2); assert.equal(kol.demo.antall, 2); assert.equal(kol.tilbud.antall, 2); assert.equal(kol.forhandling.antall, 2); assert.equal(kol.signert.antall, 5); assert.equal(kol.tapt.antall, 1);
  assert.equal(kol.tapt.kort[0].tap_grunn, "Valgte annen leverandør");
  assert.equal(kr(kol.forhandling.kort.find((k) => k.navn === "Nordli Kjøkken AS").verdi_ore), "13 234 kr", "verdi fra siste tilbud");
  assert.equal((await api("GET", "/api/tavle?linje=sigdal")).kolonner.find((k) => k.id === "signert").antall, 3);
  const eiere = await api("GET", "/api/eiere");
  assert.equal(eiere.eiere.length, 14); assert.equal((await api("GET", "/api/eiere?kunder=1")).eiere.length, 5);
  const av = await api("GET", "/api/avtaler");
  assert.equal(av.avtaler.length, 7); assert.equal(av.penneo_koblet, false);
  assert.deepEqual(av.avtaler.filter((a) => a.visning === "fornyes_snart").map((a) => a.eier_navn).sort(), ["Aune Kjøkken AS", "Vestby Kjøkken AS"]);
  const nordli = await api("GET", `/api/avtaler/${ider.avtaleNordli}`);
  assert.equal(nordli.avtale.status, "signering"); assert.deepEqual(nordli.signatarer.map((s) => s.status), ["venter", "ikke_sendt"]); assert.equal(nordli.ventetekst, "Venter på kunden."); assert.equal(nordli.dokumenter.length, 3);
  const paa = await api("POST", `/api/avtaler/${ider.avtaleNordli}/paaminnelse`);
  assert.equal(paa.levert, false); assert.match(paa.melding, /Penneo er ikke koblet til/);
  const gran = await api("GET", `/api/avtaler/${ider.avtaleGranlund}`);
  assert.equal(gran.avtale.status, "signert"); assert.equal(gran.avtale.fornyes, plussMnd(gran.avtale.start, 12));
  const kort = await api("GET", `/api/eiere/${ider.granlund}`);
  assert.equal(kort.eier.er_kunde, true); assert.equal(kort.eier.status, "signert"); assert.equal(kort.tilbud[0].status, "akseptert"); assert.equal(kort.avtaler[0].status, "signert"); assert.equal(kort.butikker.length, 5);
  const haugen = await api("GET", `/api/eiere/${ider.haugen}`);
  assert.equal(haugen.eier.lead_ny, true, "første visning"); assert.equal((await api("GET", `/api/eiere/${ider.haugen}`)).eier.lead_ny, false, "merket fjernes når kortet er åpnet");
  // Tapt krever grunn; en signert kunde flyttes ikke
  await assert.rejects(api("PATCH", `/api/eiere/${ider.moen}`, { status: "tapt" }), /tap_grunn/);
  await assert.rejects(api("PATCH", `/api/eiere/${ider.granlund}`, { status: "ny" }), /409/);
  await api("PATCH", `/api/eiere/${ider.moen}`, { status: "tilbud" });
  const moen = await api("GET", `/api/eiere/${ider.moen}`);
  assert.equal(moen.eier.status, "tilbud"); assert.equal(moen.aktiviteter[0].tittel, "Flyttet til Tilbud sendt"); assert.equal(moen.muligheter[0].fase, "tilbud");
  // Prislisten: bare utkast kan endres, publisering låser og fjerner eksempel-merket
  const pl = await api("GET", "/api/prisliste");
  assert.equal(pl.versjoner.length, 1); assert.equal(pl.versjoner[0].antall_tilbud, 9); assert.equal(pl.gjeldende.eksempel, true);
  const ny = await api("POST", "/api/prisliste", { versjon: "2027.1", gjelder_fra: "2027-01-01" });
  await api("PATCH", `/api/prisliste/${ny.id}`, { rader: [{ id: (await api("GET", `/api/prisliste/${ny.id}`)).rader.find((r) => r.type === "pakke" && r.kode === "start" && r.produktlinje === "hengsel").id, pris_ore: 209000 }] });
  await api("POST", `/api/prisliste/${pl.versjoner[0].id}/publiser`);
  const etter = await api("GET", "/api/prisliste");
  assert.equal(etter.versjoner.find((v) => v.versjon === "2026.2").status, "aktiv"); assert.equal(etter.gjeldende.eksempel, false);
  await assert.rejects(api("PATCH", `/api/prisliste/${pl.versjoner[0].id}`, { mva_prosent: 20 }), /409/);
  await api("POST", `/api/prisliste/${ny.id}/publiser`);
  const sist = await api("GET", "/api/prisliste");
  assert.equal(sist.versjoner.find((v) => v.versjon === "2026.2").status, "arkivert"); assert.equal(sist.gjeldende.versjon, "2027.1"); assert.equal(sist.gjeldende.pakker.hengsel.start.pris_ore, 209000);
  assert.equal((await api("GET", `/api/tilbud/${ider.tilbudNordli.id}`)).tilbud.prisliste_id, pl.versjoner[0].id, "tilbudet husker versjonen det ble laget med");
  assert.ok(typeof kjorMigreringer === "function" && typeof lagD1 === "function" && BRUKER.rolle === "eier");
});
