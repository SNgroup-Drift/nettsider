/**
 * K-259: Hengsel Admin fase B (Support, Oppstart, rollen Support). Kjøres av npm test. Ingen nettverk, ingen hemmeligheter.
 *  1. Migreringen 0002: tabellene, rollen support i bruker (CHECK), innstillingene merket eksempel, ingen eksempeldata.
 *  2. Tilgang: eier skriver alt; support leser og skriver saker og timer, ser timer uten beløp, får ADM-403 på alt annet og «Ingen tilgang»
 *     (403) på andre sider; ukjente og stengte supportpersoner får 403.
 *  3. Svarfrist i arbeidstid, snart/forfalt, og frist-stopp ved «venter på kunde» (klokka står og starter igjen med det som var igjen).
 *  4. Kvart-time-avrunding (påbegynte 15 min) i tidtaker og manuell føring.
 *  5. Vernet på POST /api/hjelp: metode, Origin-lista, nøkkel, honeypot, tid, lengder, innholdstype, størrelse og bildetype.
 *  6. Internt notat kommer aldri i kundevisningen eller e-postutkastet.
 *  7. Oppstart: status beregnes fra de ni punktene; punkt 1 følger avtalen. Eksempeldataene gjennom API-et.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldata, lagApi } from "./lib/admin-eksempeldata.mjs";
import { leggInnEksempeldataB, SUPPORTBRUKER } from "./lib/admin-eksempeldata-b.mjs";
import { handterHjelp, originTillatt, bildetype, MAKS_BILDE } from "../sites/admin/worker/hjelp.js";
import { kanSe, kanSkrive, supportFraDb } from "../sites/admin/worker/tilgang.js";
import { nullstillBuffer } from "../sites/admin/worker/access.js";
import { stiTilFil } from "../sites/admin/worker/ruter.js";
import worker from "../sites/admin/worker/index.js";
import * as S from "../sites/admin/src/lib/support.js";
import { menyNaa, omradeFor } from "../sites/admin/src/lib/meny.ts";

const rot = resolve(import.meta.dirname, "..");
const iso = (s) => new Date(s).toISOString();

// ── 1. Migreringen ───────────────────────────────────────────────────────────────────────────────────────────────────────────
test("migrering 0002: tabellene for saker, meldinger, tidsføring, oppstart og opplæring, rollen support og innstillingene (eksempel)", async () => {
  const db = await lagTestdatabase();
  const tabeller = (await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()).results.map((r) => r.name);
  for (const t of ["sak", "melding", "tidsforing", "tidtaker", "oppstart", "oppstartspunkt", "opplaeringsokt", "bruker"]) assert.ok(tabeller.includes(t), t);
  assert.equal(await db.prepare("SELECT rolle FROM bruker WHERE epost = 'es@sngroup.no'").first("rolle"), "eier", "eieren fra 0001 er beholdt");
  await db.prepare("INSERT INTO bruker (id, epost, navn, rolle, opprettet, endret) VALUES ('01K7JX0000000000000000SUP1', 's@eksempel.no', 'S', 'support', 'x', 'x')").run();
  await assert.rejects(db.prepare("INSERT INTO bruker (id, epost, navn, rolle, opprettet, endret) VALUES ('01K7JX0000000000000000SUP2', 't@eksempel.no', 'T', 'admin', 'x', 'x')").run(), /CHECK/);
  const inn = Object.fromEntries((await db.prepare("SELECT nokkel, verdi, eksempel FROM innstilling").all()).results.map((r) => [r.nokkel, r]));
  assert.equal(inn.support_timepris_ore.eksempel, 1); assert.equal(JSON.parse(inn.support_timepris_ore.verdi), 115000, "1 150 kr");
  assert.equal(inn.support_foring_min.eksempel, 1); assert.equal(JSON.parse(inn.support_foring_min.verdi), 15);
  assert.equal(inn.supportniva.eksempel, 1); assert.equal(JSON.parse(inn.supportniva.verdi).frister.hoy.min, 240);
  assert.equal(inn.svarmaler.eksempel, 1); assert.equal(JSON.parse(inn.svarmaler.verdi).length, 4);
  assert.equal(JSON.parse(inn.oppstart_punkter.verdi).length, 9);
  // Intern melding kan ikke ha utsendelse (sendes aldri)
  await db.prepare("INSERT INTO sak (id, nr_tall, emne, kilde, prioritet, svarfrist, sist_aktivitet, opprettet, endret) VALUES ('01K7JX0000000000000000SAK1', 1001, 'x', 'epost', 'normal', 'x', 'x', 'x', 'x')").run();
  await assert.rejects(db.prepare("INSERT INTO melding (id, sak_id, type, hvem, tid, tekst, utsendelse, opprettet, endret) VALUES ('01K7JX0000000000000000MEL1', '01K7JX0000000000000000SAK1', 'intern', 'E', 'x', 'x', 'sendt', 'x', 'x')").run(), /CHECK/);
  const sql = readFileSync(join(rot, "sites/admin/migrations/0002_fase_b.sql"), "utf8");
  assert.doesNotMatch(sql, /Nordli|Granlund|Strand Interiør|Eva Strand|H-1047/, "eksempeldata hører ikke hjemme i migreringen");
});

// ── 2. Tilgang ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const TEAM = "test.cloudflareaccess.com", AUD = "b".repeat(64);
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
    globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }), { headers: { "Content-Type": "application/json" } });
    try { await fn(); } finally { globalThis.fetch = originalFetch; }
  };
}
const assets = { fetch: async (r) => new Response(`<h1>${new URL(r.url).pathname}</h1>`, { headers: { "Content-Type": "text/html" } }) };
const be = (sti, tok, metode = "GET", kropp) => new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: { ...(tok ? { "Cf-Access-Jwt-Assertion": tok } : {}), ...(kropp ? { "Content-Type": "application/json" } : {}) }, body: kropp ? JSON.stringify(kropp) : undefined });

let felles = null;
async function eksempel() {
  if (felles) return felles;
  const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ASSETS: assets, DB: await lagTestdatabase() };
  const ider = await leggInnEksempeldataB(env, await leggInnEksempeldata(env));
  felles = { env, ider };
  return felles;
}

test("tilgang (ren funksjon): support ser Støtte og Kunder (K-469) og skriver bare saker og tidsføring", () => {
  const sup = { rolle: "support", navn: "S" };
  for (const s of ["/support/saker", "/support/saker/H-1047", "/support/timer", "/stotte", "/kunder", "/kunder/01K7JX0000000000000000ABCD", "/api/eiere", "/api/eiere/01K7JX0000000000000000ABCD", "/ingen-tilgang", "/api/saker", "/api/saker/H-1047/meldinger", "/api/timer", "/api/tidsforing/01K7JX0000000000000000ABCD", "/api/meg", "/api/meny-tall", "/_astro/x.js"]) assert.equal(kanSe(sup, s), true, s);
  for (const s of ["/", "/salg/eiere", "/api/eiere/01K7JX0000000000000000ABCD/butikker", "/oppstart", "/fakturering/kjoring", "/drift", "/innstillinger/support", "/api/oversikt", "/api/oppstart", "/api/support/innstillinger", "/api/brukere", "/api/oversikt/saker", "/support/../kunder", "/api/saker/../eiere"]) assert.equal(kanSe(sup, s), false, s);
  assert.equal(kanSkrive(sup, "/api/saker/H-1047/meldinger"), true);
  assert.equal(kanSkrive(sup, "/api/tidsforing/01K7JX0000000000000000ABCD"), true);
  assert.equal(kanSkrive(sup, "/api/eiere"), false); assert.equal(kanSkrive(sup, "/api/oppstart"), false); assert.equal(kanSkrive(sup), false);
  assert.equal(kanSkrive({ rolle: "eier" }, "/api/oppstart"), true);
  // Menyen: support ser Kunder og Støtte (K-469); alle punktene for fase B og C og Drift er på for eier
  assert.deepEqual(menyNaa("support").flatMap((g) => g.punkter.map((p) => p.id)), ["kunder", "saker", "timer"]);
  const alle = menyNaa("eier").flatMap((g) => g.punkter.map((p) => p.id));
  for (const id of ["saker", "timer", "oppstart", "abonnement", "kjoring", "kpi", "utestaende", "tall", "drift", "drift-lenker", "drift-kontoer", "drift-frister", "drift-rutiner"]) assert.ok(alle.includes(id), id);
  assert.equal(omradeFor("/fakturering/kjoring"), "Fakturering"); assert.equal(omradeFor("/oppstart/01K7JX0000000000000000ABCD"), "Oppstart"); assert.equal(omradeFor("/"), "Salg"); // N-4: Oversikt er slått sammen med tavla i Salg (26-009)
  assert.equal(stiTilFil("/support/saker/H-1047"), "/support/sak"); assert.equal(stiTilFil("/oppstart/01K7JX0000000000000000ABCD"), "/oppstart/kunde");
});

test("tilgang gjennom Workeren: eier alt; support saker, timer og kunder (uten beløp), ADM-403 og «Ingen tilgang» ellers", { timeout: 60_000 }, medNokler(async () => {
  const { env } = await eksempel();
  const eier = await token(), sup = await token(SUPPORTBRUKER.epost);
  const status = async (sti, tok, metode, kropp) => (await worker.fetch(be(sti, tok, metode, kropp), env)).status;
  // Eier
  for (const s of ["/api/saker", "/api/saker/H-1047", "/api/timer", "/api/oppstart", "/api/oversikt/saker", "/api/support/innstillinger"]) assert.equal(await status(s, eier), 200, s);
  const te = await (await worker.fetch(be("/api/timer", eier), env)).json();
  assert.equal(te.timepris_ore, 115000); assert.ok(te.kunder.find((k) => k.navn === "Aune Kjøkken AS").belop_ore > 0, "eier ser beløpet");
  // Support leser og skriver saker og timer
  assert.equal((await supportFraDb(env.DB, SUPPORTBRUKER.epost)).rolle, "support");
  assert.equal(await status("/api/saker", sup), 200);
  assert.equal(await status("/api/saker/H-1043/meldinger", sup, "POST", { type: "intern", tekst: "Sjekket med Code." }), 200);
  assert.equal(await status("/api/saker/H-1043/tid", sup, "POST", { minutter: 10, tekst: "Telefon" }), 200);
  assert.equal(await status("/api/saker/H-1043", sup, "PATCH", { status: "venter" }), 200);
  const ts = await (await worker.fetch(be("/api/timer", sup), env)).json();
  assert.equal(ts.timepris_ore, null); assert.equal(ts.vis_belop, false);
  assert.ok(ts.kunder.every((k) => k.belop_ore === null), "support ser ikke beløp");
  assert.doesNotMatch(JSON.stringify(ts), /1150|115000|1 150/);
  const meg = await (await worker.fetch(be("/api/meg", sup), env)).json();
  assert.equal(meg.rolle, "support");
  // … og får ADM-403 på alt annet
  // K-469: support ser kundene, men ingen beløp (felt som slutter på _ore er null)
  const ke = await (await worker.fetch(be("/api/eiere", sup), env)).json();
  assert.ok(ke.eiere.length > 0 && ke.eiere.every((e) => e.verdi_ore === null), "support ser kundene uten beløp");
  const ee = await (await worker.fetch(be("/api/eiere", eier), env)).json();
  assert.ok(ee.eiere.some((e) => e.verdi_ore > 0), "eier ser beløpene");
  for (const [s, m, k] of [["/api/oppstart"], ["/api/oversikt"], ["/api/avtaler"], ["/api/support/innstillinger"], ["/api/brukere"], ["/api/oversikt/saker"], ["/api/eiere", "POST", { navn: "x" }], ["/api/oppstart", "POST", { avtale_nr: "A-2026-001" }], ["/api/support/innstillinger", "PATCH", { foring_min: 5 }]]) {
    const r = await worker.fetch(be(s, sup, m, k), env);
    assert.equal(r.status, 403, `${m ?? "GET"} ${s}`); assert.equal((await r.json()).kode, "ADM-403");
  }
  // Sider: Support-sidene vises, andre gir «Ingen tilgang» med 403
  assert.equal(await status("/support/saker", sup), 200);
  assert.equal(await status("/support/saker/H-1047", sup), 200);
  const nei = await worker.fetch(be("/fakturering/kjoring", sup), env);
  assert.equal(nei.status, 403); assert.match(await nei.text(), /ingen-tilgang/);
  assert.equal(await status("/", sup), 403);
  // Ukjent adresse og stengt supportperson
  assert.equal(await status("/api/saker", await token("ukjent@eksempel.no")), 403);
  await env.DB.prepare("UPDATE bruker SET aktiv = 0 WHERE epost = ?").bind(SUPPORTBRUKER.epost).run();
  assert.equal(await status("/api/saker", sup), 403, "stengt supportperson");
  await env.DB.prepare("UPDATE bruker SET aktiv = 1 WHERE epost = ?").bind(SUPPORTBRUKER.epost).run();
  assert.equal(await status("/api/saker"), 401, "uten Access");
  // Databasen kan aldri gi rollen eier
  await env.DB.prepare("INSERT INTO bruker (id, epost, navn, rolle, opprettet, endret) VALUES ('01K7JX0000000000000000EIE2', 'ny-eier@eksempel.no', 'X', 'eier', 'x', 'x')").run();
  assert.equal(await status("/api/eiere", await token("ny-eier@eksempel.no")), 403);
}));

// ── 3. Svarfrist ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("svarfrist: arbeidstid hverdager 08–16 (norsk tid), helg og sommertid, frister per prioritet", () => {
  // Onsdag 14.10.2026 kl. 08:05 norsk tid (06:05Z) + 4 t = 12:05 (10:05Z)
  assert.equal(S.beregnSvarfrist("2026-10-14T06:05:00Z", "hoy"), iso("2026-10-14T10:05:00Z"));
  // 15:00 + 4 t = torsdag 11:00
  assert.equal(S.beregnSvarfrist("2026-10-14T13:00:00Z", "hoy"), iso("2026-10-15T09:00:00Z"));
  // Fredag 15:00 + 1 virkedag = mandag 15:00
  assert.equal(S.beregnSvarfrist("2026-10-16T13:00:00Z", "normal"), iso("2026-10-19T13:00:00Z"));
  // Lørdag: kritisk 1 t fra mandag 08:00 (vintertid fra 25.10: UTC+1)
  assert.equal(S.beregnSvarfrist("2026-10-24T10:00:00Z", "kritisk"), iso("2026-10-26T08:00:00Z"));
  // Fredag før sommertid slutter, 3 virkedager = 24 t arbeidstid → onsdag 15:00 CET
  assert.equal(S.beregnSvarfrist("2026-10-23T13:00:00Z", "lav"), iso("2026-10-28T14:00:00Z"));
  // Natt: kl. 23 + 4 t = neste dag 12:00
  assert.equal(S.beregnSvarfrist("2026-10-14T21:00:00Z", "hoy"), iso("2026-10-15T10:00:00Z"));
  assert.equal(S.arbeidsminutterMellom("2026-10-16T13:00:00Z", "2026-10-19T07:00:00Z"), 120, "fredag 15–16, ingenting i helga, mandag 08–09");
  assert.equal(S.varighet(105), "1 t 45 min"); assert.equal(S.varighet(42), "42 min"); assert.equal(S.varighet(720), "1 d 4 t");
  // Annen arbeidstid fra innstillingene
  const nivaa = { ...S.STANDARD_SUPPORTNIVA, arbeidstid: { fra: "09:00", til: "15:00", dager: [1, 2, 3, 4, 5] } };
  assert.equal(S.beregnSvarfrist("2026-10-14T06:05:00Z", "normal", nivaa), iso("2026-10-14T13:00:00Z"), "1 virkedag = 6 t: fra 09:00 (arbeidstiden starter) til 15:00");
});

test("svarfrist: snart (≤ 25 % igjen), forfalt, og sortering forfalt først, så snart, så resten", () => {
  const naa = "2026-10-14T08:20:00Z";
  const f = (prioritet, svarfrist, status = "aapen") => S.fristTilstand({ status, prioritet, svarfrist }, naa);
  assert.deepEqual([f("hoy", "2026-10-14T10:05:00Z").tilstand, f("hoy", "2026-10-14T10:05:00Z").tekst], ["ok", "1 t 45 min igjen"]);
  assert.equal(f("hoy", "2026-10-14T09:20:00Z").tilstand, "snart", "60 av 240 min = 25 %");
  assert.equal(f("hoy", "2026-10-14T09:21:00Z").tilstand, "ok");
  assert.deepEqual([f("kritisk", "2026-10-14T08:10:00Z").tilstand, f("kritisk", "2026-10-14T08:10:00Z").tekst], ["forfalt", "Forfalt 10 min"]);
  assert.equal(f("normal", "x", "venter").tilstand, "pause");
  const saker = [["a", "ok", 300], ["b", "forfalt", -10], ["c", "snart", 20], ["d", "forfalt", -50], ["e", "pause", 100]].map(([nr, tilstand, igjen_min]) => ({ nr, svarfrist: "", frist: { tilstand, igjen_min } }));
  assert.deepEqual(S.sorterSaker(saker).map((s) => s.nr), ["d", "b", "c", "a", "e"]);
});

test("frist-stopp: «venter på kunde» stopper klokka, og den starter igjen med det som var igjen", () => {
  const sak = { status: "aapen", prioritet: "hoy", svarfrist: iso("2026-10-14T12:00:00Z") };
  // Mandag-fredag: 10:00Z → 12:00Z = 120 min igjen når kunden blir spurt
  const venter = S.byttStatus(sak, "venter", iso("2026-10-14T10:00:00Z"));
  assert.equal(venter.status, "venter"); assert.equal(venter.frist_igjen_min, 120); assert.equal(venter.frist_stoppet, iso("2026-10-14T10:00:00Z"));
  assert.equal(S.fristTilstand({ ...sak, ...venter }, iso("2026-10-20T10:00:00Z")).tilstand, "pause", "aldri forfalt mens den venter");
  // Kunden svarer neste dag 07:00Z (09:00 norsk): fristen blir 09:00 + 120 min = 11:00 norsk
  const igjen = S.byttStatus({ ...sak, ...venter }, "aapen", iso("2026-10-15T07:00:00Z"));
  assert.equal(igjen.svarfrist, iso("2026-10-15T09:00:00Z")); assert.equal(igjen.frist_stoppet, null); assert.equal(igjen.frist_igjen_min, null);
  // Løst og gjenåpnet: ny frist fra nå
  const lost = S.byttStatus(sak, "lost", iso("2026-10-14T11:00:00Z"));
  assert.equal(lost.lost_tid, iso("2026-10-14T11:00:00Z"));
  assert.equal(S.byttStatus({ ...sak, ...lost }, "aapen", iso("2026-10-16T06:00:00Z")).svarfrist, iso("2026-10-16T10:00:00Z"));
});

test("frist-stopp gjennom API-et: kundens svar på en ventende sak starter klokka igjen", { timeout: 60_000 }, async () => {
  const { env } = await eksempel();
  const api = lagApi(env);
  const for_ = (await api("GET", "/api/saker/H-1045")).sak;
  assert.equal(for_.status, "venter"); assert.equal(for_.frist.tilstand, "pause");
  const r = await api("POST", "/api/saker/H-1045/meldinger", { type: "kunde", tekst: "Her er lista som CSV." });
  assert.equal(r.status, "aapen");
  const etter = (await api("GET", "/api/saker/H-1045")).sak;
  assert.notEqual(etter.frist.tilstand, "pause"); assert.equal(etter.frist_igjen_min, null);
  // Svar fra Ny gjør saken Åpen
  assert.equal((await api("POST", "/api/saker/H-1048/meldinger", { type: "svar", tekst: "Vi ser på det nå." })).status, "aapen");
  // Prioritet bytter frist fra opprettet
  const p = await api("PATCH", "/api/saker/H-1043", { prioritet: "kritisk" });
  assert.equal(p.sak.prioritet, "kritisk");
  await assert.rejects(api("PATCH", "/api/saker/H-1043", { status: "lukket" }), /ADM-400/);
  await assert.rejects(api("GET", "/api/saker/H-9999"), /404/);
});

// ── 4. Kvart-time-avrunding ──────────────────────────────────────────────────────────────────────────────────────────────────
test("tidsføring: påbegynte 15 minutter i tidtaker og manuell føring", { timeout: 60_000 }, async () => {
  assert.deepEqual([1, 14, 15, 15.2, 16, 30, 31, 0, -5].map((m) => S.avrundKvarter(m)), [15, 15, 15, 30, 30, 30, 45, 0, 0]);
  assert.equal(S.tidtakerMinutter("2026-10-14T08:00:00Z", "2026-10-14T08:18:24Z"), 30, "18 min 24 s → 30");
  assert.equal(S.tidtakerMinutter("2026-10-14T08:00:00Z", "2026-10-14T08:15:00Z"), 15);
  assert.equal(S.tidtakerMinutter("2026-10-14T08:00:00Z", "2026-10-14T08:15:01Z"), 30);
  assert.equal(S.avrundKvarter(7, 10), 10, "enheten kommer fra innstillingen");
  const { env } = await eksempel();
  const api = lagApi(env);
  assert.equal((await api("POST", "/api/saker/H-1046/tid", { minutter: 7, tekst: "Kort svar" })).minutter, 15);
  assert.equal((await api("POST", "/api/saker/H-1046/tid", { minutter: 16, tekst: "Gjennomgang" })).minutter, 30);
  await assert.rejects(api("POST", "/api/saker/H-1046/tid", { minutter: 0, tekst: "x" }), /ADM-400/);
  await assert.rejects(api("POST", "/api/saker/H-1046/tid", { minutter: 10 }), /tekst/);
  // Tidtakeren: start, stopp etter 1 sekund gir 15 min
  await api("POST", "/api/saker/H-1046/tidtaker");
  const s = await api("POST", "/api/saker/H-1046/tidtaker/stopp", { tekst: "Telefon" });
  assert.equal(s.minutter, 15);
  await assert.rejects(api("POST", "/api/saker/H-1046/tidtaker/stopp", {}), /409/, "tidtakeren går ikke lenger");
  // Fakturerte føringer kan ikke slettes; support kan bare slette egne
  const sak = await api("GET", "/api/saker/H-1046");
  const id = sak.tid.at(-1).id;
  await env.DB.prepare("UPDATE tidsforing SET fakturert_i = 'K-2026-11' WHERE id = ?").bind(id).run();
  await assert.rejects(api("DELETE", `/api/tidsforing/${id}`), /409/);
  const annen = sak.tid.find((t) => t.hvem_epost === "es@sngroup.no" && !t.fakturert_i);
  await assert.rejects(lagApi(env, SUPPORTBRUKER)("DELETE", `/api/tidsforing/${annen.id}`), /403/);
});

test("timer per kunde: inkludert fra pakkene (1/2/3 t per butikk), under, på grensen (≥ 90 %) og over", { timeout: 60_000 }, async () => {
  assert.deepEqual(S.timerStatus({ inkludert_min: 660, brukt_min: 270, timepris_ore: 115000 }), { status: "under", over_min: 0, igjen_min: 390, belop_ore: 0 });
  assert.equal(S.timerStatus({ inkludert_min: 240, brukt_min: 225 }).status, "grense", "3,75 av 4 t");
  assert.deepEqual(S.timerStatus({ inkludert_min: 180, brukt_min: 270, timepris_ore: 115000 }), { status: "over", over_min: 90, igjen_min: 0, belop_ore: 172500 }, "1,5 t × 1 150 kr = 1 725 kr");
  const env = { DB: await lagTestdatabase() };
  await leggInnEksempeldataB(env, await leggInnEksempeldata(env));
  const t = await lagApi(env)("GET", "/api/timer");
  const k = Object.fromEntries(t.kunder.map((x) => [x.navn, x]));
  assert.equal(k["Granlund Innredning AS"].inkludert_min, 660, "2 × Komplett, 2 × Butikk, 1 × Start = 11 t");
  assert.equal(k["Granlund Innredning AS"].pakker, "2 × Komplett, 2 × Butikk, 1 × Start");
  assert.equal(k["Strand Interiør AS"].status, "grense"); assert.equal(k["Aune Kjøkken AS"].status, "over"); assert.equal(k["Aune Kjøkken AS"].belop_ore, 172500);
  assert.equal(k["Vestby Kjøkken AS"].status, "under");
});

// ── 5. «Hjelp»-vernet ────────────────────────────────────────────────────────────────────────────────────────────────────────
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 73, 72, 68, 82]);
const gyldig = () => ({ emne: "Logoen mangler på tilbud-PDF", tekst: "Logoen kommer ikke med i PDF-en.", prioritet: "hoy", app: "crm", side: "Tilbud › T-2026-118", adresse: "strand.hengsel.no/tilbud/T-2026-118", versjon: "Hengsel CRM 2.0.4", enhet: "Chrome 129 · Windows 11", bruker: "Eva Strand", bruker_epost: "eva@strandinterior.no", t: String(Date.now() - 10_000), nettsted: "" });
function hjelpReq(kropp = gyldig(), { metode = "POST", origin = "https://strand.hengsel.no", type = "json", ekstra = {}, fil = null } = {}) {
  const h = { ...(origin === null ? {} : { Origin: origin }), ...ekstra };
  let body;
  if (metode === "GET" || metode === "OPTIONS") body = undefined;
  else if (type === "skjema") { body = new FormData(); for (const [k, v] of Object.entries(kropp)) body.append(k, v); if (fil) body.append("skjermbilde", new File([fil.data], fil.navn, { type: fil.type ?? "image/png" })); }
  else if (typeof kropp === "string") { h["Content-Type"] = type === "json" ? "application/json" : type; body = kropp; }
  else { h["Content-Type"] = type === "json" ? "application/json" : type; body = JSON.stringify(kropp); }
  return new Request("https://admin.hengsel.no/api/hjelp", { method: metode, headers: h, body });
}
function lagR2() { const lager = new Map(); return { lager, put: async (k, v, o) => { lager.set(k, { v, o }); }, get: async (k) => (lager.has(k) ? { body: lager.get(k).v } : null) }; }

test("hjelp: gyldig «Hjelp» fra CRM lager sak med kilde hjelp-crm, kobles til kundemiljøet, og skjermbildet går til R2", { timeout: 60_000 }, async () => {
  const env0 = { DB: await lagTestdatabase() };
  await leggInnEksempeldata(env0);
  const env = { ...env0, SKJERMBILDER: lagR2() };
  const r = await worker.fetch(hjelpReq(gyldig(), { type: "skjema", fil: { data: new Uint8Array([...PNG, ...new Uint8Array(500)]), navn: "skjermbilde-tilbud-pdf.png" } }), env);
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), "https://strand.hengsel.no");
  const d = await r.json();
  assert.match(d.nr, /^H-1\d{3}$/); assert.match(d.kvittering, /vi svarer innen 4 timer/);
  const sak = await env.DB.prepare("SELECT s.*, e.navn AS eier_navn, k.navn AS k_navn FROM sak s LEFT JOIN eier e ON e.id = s.eier_id LEFT JOIN kontakt k ON k.id = s.kontakt_id WHERE s.nr_tall = ?").bind(Number(d.nr.slice(2))).first();
  assert.equal(sak.kilde, "hjelp-crm"); assert.equal(sak.prioritet, "hoy"); assert.equal(sak.status, "ny");
  assert.equal(sak.eier_navn, "Strand Interiør AS", "koblet med miljo_adresse"); assert.equal(sak.k_navn, "Eva Strand", "koblet med e-posten");
  assert.equal(sak.hjelp_side, "Tilbud › T-2026-118"); assert.equal(sak.hjelp_versjon, "Hengsel CRM 2.0.4");
  assert.equal(sak.skjermbilde_type, "image/png"); assert.ok(env.SKJERMBILDER.lager.has(sak.skjermbilde_nokkel));
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM melding WHERE sak_id = ? AND type = 'kunde'").bind(sak.id).first("n"), 1);
  // Ute (JSON, uten bilde) gir hjelp-ute; uten R2 lagres saken med en intern merknad om bildet
  const ute = await (await worker.fetch(hjelpReq({ ...gyldig(), app: "ute", prioritet: "kritisk", adresse: "", emne: "Får ikke åpnet dagens oppdrag" }, { origin: "https://granlund.hengsel.no" }), env)).json();
  assert.equal((await env.DB.prepare("SELECT kilde FROM sak WHERE nr_tall = ?").bind(Number(ute.nr.slice(2))).first("kilde")), "hjelp-ute");
  const utenR2 = await worker.fetch(hjelpReq(gyldig(), { type: "skjema", fil: { data: PNG, navn: "a.png" } }), env0);
  const nr = Number((await utenR2.json()).nr.slice(2));
  const s2 = await env0.DB.prepare("SELECT id, skjermbilde_nokkel FROM sak WHERE nr_tall = ?").bind(nr).first();
  assert.equal(s2.skjermbilde_nokkel, null);
  assert.match(await env0.DB.prepare("SELECT tekst FROM melding WHERE sak_id = ? AND type = 'intern'").bind(s2.id).first("tekst"), /ikke lagret/);
  // Løpenummeret øker
  assert.equal(nr, Number(ute.nr.slice(2)) + 1);
});

test("hjelp: vernet (metode, Origin-lista, nøkkel, honeypot, tid, lengder, innholdstype, størrelse, bildetype)", { timeout: 60_000 }, async () => {
  const env = { DB: await lagTestdatabase() };
  const antall = async () => env.DB.prepare("SELECT COUNT(*) AS n FROM sak").first("n");
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { metode: "GET" }), env)).status, 405);
  for (const o of ["https://eksempel.no", "http://strand.hengsel.no", "https://hengsel.no", "https://strand.hengsel.no.eksempel.no", "https://strand.hengsel.no:8443", "null", ""]) assert.equal((await worker.fetch(hjelpReq(gyldig(), { origin: o }), env)).status, 403, o);
  assert.equal(originTillatt("https://a.b.hengsel.no", ["https://*.hengsel.no"]), true);
  assert.equal(originTillatt("https://xhengsel.no", ["https://*.hengsel.no"]), false);
  assert.equal(originTillatt("https://crm.kunde.no", ["https://crm.kunde.no"]), true);
  // Uten Origin (Ute som app): bare med HJELP_NOKKEL
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { origin: null }), env)).status, 403);
  const medN = { ...env, HJELP_NOKKEL: "testnokkel" };
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { origin: null }), medN)).status, 403);
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { origin: null, ekstra: { Authorization: "Bearer feil" } }), medN)).status, 403);
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { origin: null, ekstra: { Authorization: "Bearer testnokkel" } }), medN)).status, 200);
  assert.equal((await worker.fetch(hjelpReq(gyldig()), medN)).status, 403, "med nøkkel satt kreves den også fra nettleseren");
  // CORS-forhåndssjekk
  const opt = await worker.fetch(hjelpReq(gyldig(), { metode: "OPTIONS" }), env);
  assert.equal(opt.status, 204); assert.equal(opt.headers.get("Access-Control-Allow-Origin"), "https://strand.hengsel.no");
  // Honeypot: 200, men ingenting lagres
  const for_ = await antall();
  const hp = await worker.fetch(hjelpReq({ ...gyldig(), nettsted: "https://spam.example" }), env);
  assert.equal(hp.status, 200); assert.equal(await antall(), for_);
  // Tid
  for (const t of ["", "abc", String(Date.now() - 1000), String(Date.now() - 25 * 3600 * 1000), String(Date.now() + 3600 * 1000)]) assert.equal((await worker.fetch(hjelpReq({ ...gyldig(), t }), env)).status, 400, `t=${t}`);
  // Lengder, påkrevde felt, kontrolltegn og ugyldige valg
  for (const k of [{ emne: "" }, { emne: "x".repeat(151) }, { tekst: "" }, { tekst: "x".repeat(4001) }, { side: "x".repeat(301) }, { emne: "a\u0000b" }, { prioritet: "haster" }, { app: "excel" }, { bruker_epost: "ikke-epost" }]) {
    const r = await worker.fetch(hjelpReq({ ...gyldig(), ...k }), env);
    assert.equal(r.status, 400, JSON.stringify(k)); assert.ok(Object.keys((await r.json()).feil).length);
  }
  // Innholdstype og ødelagt JSON
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { type: "text/plain" }), env)).status, 415);
  assert.equal((await worker.fetch(hjelpReq("{ikke json", {}), env)).status, 400);
  // Størrelse og bildetype (filnavnet .png hjelper ikke når innholdet ikke er et bilde)
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { type: "skjema", fil: { data: new Uint8Array(MAKS_BILDE + 10).fill(1), navn: "stor.png" } }), env)).status, 413);
  assert.equal((await worker.fetch(hjelpReq(gyldig(), { type: "skjema", fil: { data: new TextEncoder().encode("<svg onload=alert(1)>"), navn: "x.png" } }), env)).status, 415);
  assert.equal(bildetype(PNG), "png"); assert.equal(bildetype(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "jpg"); assert.equal(bildetype(new TextEncoder().encode("GIF89a")), null);
  assert.equal((await handterHjelp(hjelpReq(), { ...env, DB: undefined })).status, 503);
  assert.equal(await antall(), for_, "ingen av de avviste ble lagret");
});

// ── 6. Internt notat i kundevisningen ────────────────────────────────────────────────────────────────────────────────────────
test("internt notat kommer aldri i kundevisningen eller e-postutkastet; statusnavnene er kundens", { timeout: 60_000 }, async () => {
  const meldinger = [{ type: "kunde", hvem: "Eva", tid: "1", tekst: "Hei" }, { type: "intern", hvem: "Eirik", tid: "2", tekst: "HEMMELIG NOTAT" }, { type: "svar", hvem: "Eirik", tid: "3", tekst: "Vi ser på det" }];
  const kv = S.kundeVisning({ nr: "H-1", emne: "x", status: "venter", opprettet: "" }, meldinger);
  assert.equal(kv.status, "Venter på deg"); assert.equal(kv.meldinger.length, 2);
  assert.doesNotMatch(JSON.stringify(kv), /HEMMELIG|intern/);
  assert.deepEqual(Object.values(S.KUNDESTATUS), ["Ny", "Under arbeid", "Venter på deg", "Løst"]);
  const { env } = await eksempel();
  const api = lagApi(env);
  await api("POST", "/api/saker/H-1047/meldinger", { type: "intern", tekst: "Dette er et internt notat som kunden aldri skal se." });
  const svar = await api("POST", "/api/saker/H-1047/meldinger", { type: "svar", tekst: "Hei Eva. Tilbudene må lages på nytt." });
  assert.equal(svar.epost.sendes, false); assert.equal(svar.epost.status, "utkast");
  assert.equal(svar.epost.til, "eva@strandinterior.no"); assert.match(svar.epost.emne, /^Re: \[H-1047\]/);
  assert.match(svar.epost.tekst, /Tilbudene må lages på nytt/);
  assert.doesNotMatch(svar.epost.tekst, /internt notat|PDF-motoren støtter kanskje ikke SVG/, "interne notater er ikke med");
  const vis = await api("GET", `/api/saker/H-1047/epost-utkast/${svar.id}`);
  assert.doesNotMatch(JSON.stringify(vis), /internt notat som kunden aldri/);
  // Svaret er lagret som utkast; ingenting er sendt
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM melding WHERE utsendelse = 'sendt'").first("n"), 0);
  const intern = (await api("GET", "/api/saker/H-1047")).meldinger.find((m) => m.type === "intern");
  await assert.rejects(api("GET", `/api/saker/H-1047/epost-utkast/${intern.id}`), /409/, "interne notater har ingen e-post");
});

// ── 7. Oppstart og eksempeldataene ───────────────────────────────────────────────────────────────────────────────────────────
test("oppstart: status beregnes fra de ni punktene, punkt 1 følger avtalen, og eksempeldataene gir listene i SO2 og SA1", { timeout: 60_000 }, async () => {
  const p = (status) => S.OPPSTARTSPUNKTER.map((x) => ({ ...x, status }));
  assert.equal(S.oppstartStatus(p("ikke")).status, "ikke");
  assert.equal(S.oppstartStatus(p("ferdig")).status, "ferdig");
  const blandet = p("ikke"); blandet[1].status = "ferdig"; blandet[2].status = "stopper";
  const st = S.oppstartStatus(blandet);
  assert.equal(st.status, "stopper"); assert.equal(st.ferdig, 1); assert.equal(st.neste.punkt, "Avtale signert"); assert.equal(st.stopper[0].punkt, "Microsoft-godkjenning hos kunden");
  const { env, ider } = await eksempel();
  const api = lagApi(env);
  const o = await api("GET", "/api/oppstart");
  assert.deepEqual(o.i_gang.map((x) => [x.eier_navn, x.status, x.ferdig, x.av]), [["Nordli Kjøkken AS", "stopper", 2, 9], ["Elvetangen Kjøkkensenter AS", "ikke", 0, 9]]);
  assert.equal(o.fullfort.length, 2);
  const nordli = await api("GET", `/api/oppstart/${ider.oppstart.nordli}`);
  assert.equal(nordli.punkter.length, 9); assert.equal(nordli.punkter[6].okter.length, 2);
  // Punkt 1 følger avtalen: når kunden og leverandøren har signert, er punktet ferdig
  await api("POST", `/api/avtaler/${ider.avtaleNordli}/signert`, { rekkefolge: 1 });
  await api("POST", `/api/avtaler/${ider.avtaleNordli}/signert`, { rekkefolge: 2 });
  const etter = await api("GET", `/api/oppstart/${ider.oppstart.nordli}`);
  assert.equal(etter.punkter[0].status, "ferdig"); assert.equal(etter.punkter[0].fra_avtale, true); assert.equal(etter.oppstart.ferdig, 3);
  // Statusbytte og påminnelse (logges, sendes ikke)
  await api("PATCH", `/api/oppstartspunkt/${etter.punkter[2].id}`, { status: "ferdig" });
  assert.equal((await api("GET", `/api/oppstart/${ider.oppstart.nordli}`)).oppstart.status, "igang");
  await assert.rejects(api("PATCH", `/api/oppstartspunkt/${etter.punkter[2].id}`, { status: "kanskje" }), /ADM-400/);
  await assert.rejects(api("POST", "/api/oppstart", { avtale_nr: ider.avtaleNordli }), /409/, "én oppstart per avtale");
  // SA1 og menyen
  const ov = await api("GET", "/api/oversikt/saker");
  assert.equal(ov.saker.length, 4); assert.equal(ov.saker[0].frist.tilstand, "forfalt");
  const meny = await api("GET", "/api/meny-tall");
  assert.ok(meny.saker >= 5); assert.equal(meny.oppstart, 2);
  assert.deepEqual(Object.keys(await lagApi(env, SUPPORTBRUKER)("GET", "/api/meny-tall")).sort(), ["ok", "saker"]);
  // Saklista: filter og antall
  const l = await api("GET", "/api/saker?kilde=hjelp-crm");
  assert.ok(l.saker.every((s) => s.kilde === "hjelp-crm")); assert.equal(l.antall.kilde["hjelp-ute"], 1);
  assert.equal((await api("GET", "/api/saker?status=lost")).saker.length, 3);
  assert.equal((await api("GET", "/api/saker?sok=logoen")).saker[0].nr, "H-1047");
  await assert.rejects(api("GET", "/api/saker?status=alt"), /ADM-400/);
  // Ny sak fra telefon
  const ny = await api("POST", "/api/saker", { emne: "Spørsmål om faktura", kilde: "telefon", prioritet: "lav", eier_id: ider.vestby, tekst: "Ringte om fakturaen." });
  const nySak = await api("GET", `/api/saker/${ny.nr}`);
  assert.equal(nySak.sak.kilde, "telefon"); assert.equal(nySak.hjelp, null); assert.equal(nySak.meldinger[0].kanal, "Telefon");
  await assert.rejects(api("POST", "/api/saker", { emne: "x", kilde: "hjelp-crm" }), /ADM-400/, "hjelp-saker kommer bare fra /api/hjelp");
});
