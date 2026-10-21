/**
 * K-469: Hengsel Admin – Støtte, Oppstart, Fakturering, Tall og Drift på kitet fra N-4 (60-211), 26-001 etter D-12 del B. Kjøres av npm test.
 * Ingen nettverk, ingen hemmeligheter, ingen D1 remote. Resten av «Ferdig når» (svarfrist, frist-stopp, kvarter, /api/hjelp, internt notat,
 * fakturakjøringen, 15 % påslag, KPI, PowerOffice) står i admin-fase-b og admin-fase-c; her kontrolleres de på nytt i kort form, sammen med
 * det K-469 la til:
 *  1. Migreringene 0001–0003 kjører lokalt i rekkefølge; K-469 legger ikke til noen.
 *  2. Tilgang: eier alt; support Støtte og Kunder (GET /api/eiere uten beløp), ADM-403 ellers; gyldig Access uten rolle får 26-001 «Ingen tilgang»
 *     (403) med adressen på sider og ADM-403 på API-et. Filene til innloggingssiden (CSS, fonter, logo, favicon) vises uten Access.
 *  3. Menyen: Støtte og Fakturering er ekte sider og står i menyen (svar fra Eirik); /stotte og /fakturering er ikke «Kommer».
 *  4. Reglene i kort form: frist-stopp ved «Venter på kunde», kvarter, internt notat, 15 % påslag, KPI og PowerOffice av uten nøkler.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldata } from "./lib/admin-eksempeldata.mjs";
import { leggInnEksempeldataB, SUPPORTBRUKER } from "./lib/admin-eksempeldata-b.mjs";
import { utenInnlogging, kanSe } from "../sites/admin/worker/tilgang.js";
import { utenBelop } from "../sites/admin/worker/belop.js";
import { nullstillBuffer } from "../sites/admin/worker/access.js";
import { erKoblet } from "../sites/admin/worker/poweroffice.js";
import worker from "../sites/admin/worker/index.js";
import * as S from "../sites/admin/src/lib/support.js";
import { viderefakturering } from "../sites/admin/src/lib/pris.js";
import { kpiNyPris } from "../sites/admin/src/lib/fakturering.js";
import { MENY, menyNaa } from "../sites/admin/src/lib/meny.ts";

const rot = resolve(import.meta.dirname, "..");
const admin = join(rot, "sites", "admin");

// ── 1. Migreringene ─────────────────────────────────────────────────────────────────────────────────────────────────────────
test("migreringene 0001–0003 kjører lokalt i rekkefølge; K-469 trenger ingen ny, og Oppstart kan kobles til K-272 uten 0004", async () => {
  const filer = readdirSync(join(admin, "migrations")).filter((f) => f.endsWith(".sql")).sort();
  assert.deepEqual(filer, ["0001_fase_a.sql", "0002_fase_b.sql", "0003_fase_c.sql"]);
  const db = await lagTestdatabase();
  const tabeller = (await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()).results.map((r) => r.name);
  for (const t of ["eier", "avtale", "bruker", "sak", "melding", "tidsforing", "oppstart", "abonnement", "fakturakjoring", "faktura", "kpi_justering", "konto", "frist", "rutine"]) assert.ok(tabeller.includes(t), t);
  // Oppstart kan kobles til K-272 senere uten migrering 0004: oppstart har avtale_id og eier_id
  const kol = (await db.prepare("SELECT name FROM pragma_table_info('oppstart')").all()).results.map((r) => r.name);
  for (const k of ["eier_id", "avtale_id"]) assert.ok(kol.includes(k), `oppstart.${k}`);
});

// ── 2. Tilgang ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TEAM = "test.cloudflareaccess.com", AUD = "c".repeat(64);
const b64 = (d) => Buffer.from(d).toString("base64url");
const par = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwk = { ...(await crypto.subtle.exportKey("jwk", par.publicKey)), kid: "k1", alg: "RS256", use: "sig" };
async function token(email = "es@sngroup.no") {
  const na = Math.floor(Date.now() / 1000);
  const h = b64(JSON.stringify({ alg: "RS256", kid: "k1", typ: "JWT" }));
  const p = b64(JSON.stringify({ iss: `https://${TEAM}`, aud: [AUD], email, iat: na, nbf: na - 5, exp: na + 3600 }));
  return `${h}.${p}.${b64(Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", par.privateKey, new TextEncoder().encode(`${h}.${p}`))))}`;
}
const INGEN = '<main data-steg="ingen"><p><span id="ingen-epost">Denne e-postadressen</span> har ikke tilgang til Hengsel Admin.</p></main>';
const assets = { fetch: async (r) => { const sti = new URL(r.url).pathname; return new Response(sti === "/logg-inn-ingen" ? INGEN : `<h1>${sti}</h1>`, { headers: { "Content-Type": "text/html" } }); } };
const be = (sti, tok, metode = "GET", kropp) => new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: { ...(tok ? { "Cf-Access-Jwt-Assertion": tok } : {}), ...(kropp ? { "Content-Type": "application/json" } : {}) }, body: kropp ? JSON.stringify(kropp) : undefined });

test("tilgang: eier alt, support Støtte og Kunder uten beløp, ingen rolle får «Ingen tilgang» (26-001) og ADM-403", { timeout: 60_000 }, async () => {
  nullstillBuffer();
  const ekte = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }), { headers: { "Content-Type": "application/json" } });
  try {
    const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ASSETS: assets, DB: await lagTestdatabase() };
    await leggInnEksempeldataB(env, await leggInnEksempeldata(env));
    const eier = await token(), sup = await token(SUPPORTBRUKER.epost), ingen = await token("navn@eksempel.no");
    const kall = (sti, tok, m, k) => worker.fetch(be(sti, tok, m, k), env);
    // Eier: alle de nye sidene og API-ene
    for (const s of ["/stotte", "/support/timer", "/oppstart", "/fakturering", "/fakturering/kpi", "/tall", "/drift/status", "/drift/lenker", "/api/saker", "/api/eiere", "/api/oversikt/saker", "/api/oversikt/oppstart", "/api/oversikt/fakturering"]) assert.equal((await kall(s, eier)).status, 200, `eier ${s}`);
    // Support: Støtte og Kunder
    for (const s of ["/stotte", "/support/saker/H-1047", "/support/timer", "/kunder", "/api/saker", "/api/timer", "/api/eiere"]) assert.equal((await kall(s, sup)).status, 200, `support ${s}`);
    const kunder = await (await kall("/api/eiere", sup)).json();
    assert.ok(kunder.eiere.length > 0);
    assert.doesNotMatch(JSON.stringify(kunder), /"\w+_ore":\d/, "ingen beløp til support");
    // … og ADM-403 på resten, også GET
    for (const [s, m, k] of [["/api/oversikt/fakturering"], ["/api/fakturering/kjoring"], ["/api/tall"], ["/api/drift/kontoer"], ["/api/oppstart"], ["/api/eiere", "POST", { navn: "x" }]]) {
      const r = await kall(s, sup, m, k);
      assert.equal(r.status, 403, `support ${m ?? "GET"} ${s}`); assert.equal((await r.json()).kode, "ADM-403");
    }
    const side = await kall("/fakturering", sup);
    assert.equal(side.status, 403); assert.match(await side.text(), /ingen-tilgang/);
    // Ingen rolle: 26-001 «Ingen tilgang» med adressen (escapet), og ADM-403 på API-et
    const nei = await kall("/", ingen);
    assert.equal(nei.status, 403);
    const tekst = await nei.text();
    assert.match(tekst, /data-steg="ingen"/); assert.match(tekst, /navn@eksempel\.no/); assert.doesNotMatch(tekst, /Denne e-postadressen/);
    const rart = await kall("/", await token('a"<b>@eksempel.no'));
    assert.doesNotMatch(await rart.text(), /<b>@/, "adressen escapes");
    const api = await kall("/api/saker", ingen);
    assert.equal(api.status, 403); assert.equal((await api.json()).kode, "ADM-403");
    // Filene til innloggingssiden vises uten Access; alt annet krever Access
    assert.equal((await kall("/logo/merke-admin-lys.svg")).status, 200);
    assert.equal((await kall("/_astro/logg-inn.Ab12.css")).status, 200);
    assert.equal((await kall("/_astro/app.Ab12.js")).status, 401, "skript krever Access");
    assert.equal((await kall("/stotte")).status, 401);
  } finally { globalThis.fetch = ekte; }
});

test("utenInnlogging og utenBelop (rene funksjoner)", () => {
  for (const s of ["/_astro/logg-inn.Ab12.css", "/fonts/inter/inter-400.woff2", "/logo/merke-admin-lys.svg", "/favicon-flis.svg"]) assert.equal(utenInnlogging(s), true, s);
  for (const s of ["/", "/stotte", "/_astro/app.js", "/api/eiere", "/logo/../api/eiere", "/logg-inn-ingen", "/favicon.js"]) assert.equal(utenInnlogging(s), false, s);
  assert.deepEqual(utenBelop({ eiere: [{ navn: "Aune", verdi_ore: 813400, butikker: [{ per_mnd_ore: 1, navn: "B" }] }], antall: 3 }),
    { eiere: [{ navn: "Aune", verdi_ore: null, butikker: [{ per_mnd_ore: null, navn: "B" }] }], antall: 3 });
  const sup = { rolle: "support" };
  for (const s of ["/stotte", "/kunder", "/api/eiere"]) assert.equal(kanSe(sup, s), true, s);
  for (const s of ["/fakturering", "/oppstart", "/tall", "/drift/status", "/api/oversikt/fakturering"]) assert.equal(kanSe(sup, s), false, s);
});

// ── 3. Menyen og sidene ─────────────────────────────────────────────────────────────────────────────────────────────────────
test("menyen: Støtte, Oppstart, Fakturering, Tall og Drift for eier; support ser Kunder, Saker og Timer; Støtte og Fakturering er ikke «Kommer»", () => {
  const eier = menyNaa("eier");
  const grupper = eier.map((g) => g.navn ?? g.punkter[0].navn);
  for (const n of ["Støtte", "Oppstart", "Fakturering", "Tall", "Drift"]) assert.ok(grupper.includes(n), n);
  assert.equal(grupper.at(-1), "Innstillinger");
  assert.deepEqual(menyNaa("support").flatMap((g) => g.punkter.map((p) => p.sti)), ["/kunder", "/stotte", "/support/timer"]);
  const stier = MENY.flatMap((g) => g.punkter.map((p) => p.sti));
  for (const s of ["/stotte", "/fakturering", "/oppstart", "/tall", "/drift/status"]) assert.ok(stier.includes(s), s);
  for (const f of ["stotte.astro", "fakturering/index.astro"]) assert.doesNotMatch(readFileSync(join(admin, "src/pages", f), "utf8"), /KommerSide/, f);
  // 26-001 etter D-12 del B: Admin-logoen og begge stegene
  const inn = readFileSync(join(admin, "src/components/sider/Innlogging.astro"), "utf8");
  for (const t of ["Logg inn", "Send kode", "Ingen tilgang", "Prøv en annen e-post", "ingen-epost"]) assert.ok(inn.includes(t), t);
});

// ── 4. Reglene i kort form ──────────────────────────────────────────────────────────────────────────────────────────────────
test("reglene: frist-stopp ved «Venter på kunde», kvarter, internt notat, 15 % påslag, KPI og PowerOffice av uten nøkler", () => {
  const opprettet = "2026-10-20T07:00:00.000Z"; // tirsdag 09.00 norsk tid
  const sak = { status: "aapen", prioritet: "normal", svarfrist: S.beregnSvarfrist(opprettet, "normal") };
  const venter = { ...sak, ...S.byttStatus(sak, "venter", "2026-10-20T08:00:00.000Z") };
  assert.equal(S.fristTilstand(venter, "2026-10-30T08:00:00.000Z").tilstand, "pause", "klokka står mens saken venter på kunden");
  const igjen = venter.frist_igjen_min;
  const tilbake = { ...venter, ...S.byttStatus(venter, "aapen", "2026-10-26T07:00:00.000Z") };
  assert.equal(S.arbeidsminutterMellom("2026-10-26T07:00:00.000Z", tilbake.svarfrist), igjen, "starter igjen med det som var igjen");
  assert.deepEqual([1, 15, 16, 30, 31, 0].map((m) => S.avrundKvarter(m)), [15, 15, 30, 30, 45, 0]);
  const kv = S.kundeVisning({ nr: "H-1", emne: "x", status: "aapen" }, [{ type: "kunde", hvem: "K", tekst: "Hei" }, { type: "intern", hvem: "E", tekst: "HEMMELIG NOTAT" }, { type: "svar", tekst: "Svar" }]);
  assert.doesNotMatch(JSON.stringify(kv), /HEMMELIG NOTAT/);
  assert.equal(viderefakturering({ viderefakturering_prosent: 15 }, 41200), 47380, "412 kr + 15 % = 473,80 kr");
  assert.equal(kpiNyPris(813400, 3.1), 838600, "8 134 kr + 3,1 % = 8 386 kr");
  assert.equal(erKoblet({}), false); assert.equal(erKoblet({ POWEROFFICE_APP_KEY: "", POWEROFFICE_CLIENT_KEY: "x", POWEROFFICE_SUBSCRIPTION_KEY: "x" }), false);
  assert.match(readFileSync(join(admin, "src/scripts/kjoring.ts"), "utf8"), /disabled title="PowerOffice er ikke koblet til"/);
});
