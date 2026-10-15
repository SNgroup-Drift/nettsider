/**
 * K-272: Opprett kunde i Hengsel Admin (S-65). Kjøres av npm test. Ingen nettverk, ingen hemmeligheter: GitHub er simulert (globalThis.fetch).
 *  1. Migreringen 0004: tabellene, CHECK, én levende jobb per kunde, ingen kolonner for hemmeligheter.
 *  2. Kontrollen av kundens oppsett (samme vektorer som i hengsel-crm, scripts/ny-kunde/ny-kunde.test.mjs).
 *  3. API: bare es@sngroup.no starter; start gir jobb og steg i D1 og starter Action-en med riktige inndata; tokenet kommer aldri ut; feil ved start.
 *  4. Rapportene fra Action-en: signatur, tidsvindu, størrelse, rensing, steg og jobb, hele løypa til «ferdig» med sjekkliste.
 *  5. Prøv igjen fra steg X, og Fjern testkunde (bare test, bekreftelse med kunde-id).
 *  6. Meny, ruter og at rapport-stien er den eneste nye utenfor Access.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { handterApi } from "../sites/admin/worker/api.js";
import { handterRapport, sjekkSignatur, rens } from "../sites/admin/worker/ny-kunde-rapport.js";
import worker from "../sites/admin/worker/index.js";
import { gyldigOrgnr, normaliser, sjekkliste, sjekklisteTekst, tilAction, STEG } from "../sites/admin/src/lib/ny-kunde.js";
import { menyNaa, omradeFor } from "../sites/admin/src/lib/meny.ts";
import { stiTilFil } from "../sites/admin/worker/ruter.js";
import { kanSe } from "../sites/admin/worker/tilgang.js";

const rot = resolve(import.meta.dirname, "..");
const NOKKEL = "r".repeat(48);
const TOKEN = "github_pat_HEMMELIGTOKEN0123456789abcdef";
const orgnr = (() => { for (let k = 0; k < 10; k++) if (gyldigOrgnr(`92345678${k}`)) return `92345678${k}`; })();
const KUNDE = { id: "testkunde-k272", navn: "Testkunde K-272 AS", test: true, orgnr, butikker: ["Testkjøkken Oslo", "Testkjøkken Bergen"], merker: ["Sigdal", "Hengsel furu"], tema: "hengsel", domene: { type: "app" }, admin: { epost: "es@sngroup.no", navn: "Eirik" } };
const EIRIK = { epost: "es@sngroup.no", navn: "Eirik", rolle: "eier" };
const ANNEN_EIER = { epost: "annen@sngroup.no", navn: "Annen", rolle: "eier" };

async function nyEnv(ekstra = {}) { return { DB: await lagTestdatabase(), GITHUB_DISPATCH_TOKEN: TOKEN, NY_KUNDE_RAPPORTNOKKEL: NOKKEL, ...ekstra }; }

/** Simulert GitHub: tar imot dispatch og lagrer kallene. */
function medGitHub(fn, { status = 204 } = {}) {
  return async () => {
    const original = globalThis.fetch; const kall = [];
    globalThis.fetch = async (url, init) => { kall.push({ url: String(url), init, body: init?.body ? JSON.parse(init.body) : null }); return new Response(null, { status }); };
    try { await fn(kall); } finally { globalThis.fetch = original; }
  };
}
async function api(env, metode, sti, kropp, bruker = EIRIK) {
  const r = await handterApi(new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: kropp ? { "Content-Type": "application/json" } : {}, body: kropp ? JSON.stringify(kropp) : undefined }), env, { bruker });
  return { status: r.status, data: await r.json() };
}
const signert = (kropp, { nokkel = NOKKEL, tid = String(Math.floor(Date.now() / 1000)) } = {}) => {
  const tekst = typeof kropp === "string" ? kropp : JSON.stringify(kropp);
  return new Request("https://admin.hengsel.no/api/oppstart/rapport", { method: "POST", headers: { "Content-Type": "application/json", "X-Rapport-Tid": tid, "X-Rapport-Signatur": createHmac("sha256", nokkel).update(`${tid}.${tekst}`).digest("hex") }, body: tekst });
};
async function start(env, o = {}) { const r = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true, ...o }); assert.equal(r.status, 200, JSON.stringify(r.data)); return r.data.id; }

// ── 1 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("migrering 0004: tabeller, CHECK, én levende jobb per kunde og ingen kolonner for hemmeligheter", async () => {
  const db = await lagTestdatabase();
  const tabeller = (await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()).results.map((r) => r.name);
  for (const t of ["ny_kunde_jobb", "ny_kunde_steg", "ny_kunde_logg"]) assert.ok(tabeller.includes(t), t);
  const kolonner = (await db.prepare("SELECT m.name AS tabell, p.name AS kolonne FROM sqlite_master m, pragma_table_info(m.name) p WHERE m.name LIKE 'ny_kunde_%'").all()).results;
  assert.ok(!kolonner.some((k) => /passord|hemmelig|token|nokkel|secret/i.test(k.kolonne)), "ingen kolonne for hemmeligheter");
  const t = "2026-10-15T10:00:00.000Z";
  const ins = (id, kunde, status = "ny") => db.prepare("INSERT INTO ny_kunde_jobb (id, kunde_id, navn, innstilling, status, startet_av, opprettet, endret) VALUES (?, ?, 'N', '{}', ?, 'x', ?, ?)").bind(id, kunde, status, t, t).run();
  await ins("01K7JX0000000000000000AAA1", "a-kunde");
  await assert.rejects(ins("01K7JX0000000000000000AAA2", "a-kunde"), /UNIQUE/);
  await db.prepare("UPDATE ny_kunde_jobb SET status = 'fjernet' WHERE id = '01K7JX0000000000000000AAA1'").run();
  await ins("01K7JX0000000000000000AAA3", "a-kunde");
  await assert.rejects(ins("01K7JX0000000000000000AAA4", "b-kunde", "rar"), /CHECK/);
  const sql = readFileSync(join(rot, "sites/admin/migrations/0004_ny_kunde.sql"), "utf8");
  assert.ok(!/INSERT INTO/i.test(sql), "ingen eksempeldata i migreringen");
  assert.equal(readdirSync(join(rot, "sites/admin/migrations")).filter((f) => f.startsWith("0004")).length, 1, "bare én 0004");
});

// ── 2 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("kontroll av kundens oppsett: avledede navn og avvisning med norske meldinger per felt", () => {
  const { kunde, feil } = normaliser(KUNDE);
  assert.deepEqual(feil, {});
  assert.equal(kunde.supabase_navn, "hengsel-testkunde-k272"); assert.equal(kunde.github_miljo, "kunde-testkunde-k272"); assert.equal(kunde.domene.hoveddomene, "testkunde-k272.app.hengsel.no");
  assert.deepEqual(kunde.butikker.map((b) => b.kode), ["testkjokken_oslo", "testkjokken_bergen"]); assert.deepEqual(kunde.merker.map((m) => m.kode), ["sigdal", "hengsel_furu"]);
  const feilFor = (o, ids = ["finnes"]) => normaliser({ ...KUNDE, ...o }, { eksisterendeIder: ids }).feil;
  assert.match(feilFor({ id: "Ab" }).id, /Kunde-id/); assert.match(feilFor({ id: "innlandet" }).id, /reservert/); assert.match(feilFor({ id: "finnes" }).id, /finnes allerede/);
  assert.match(feilFor({ orgnr: "123456789" }).orgnr, /Org\.nr\./); assert.match(feilFor({ butikker: [] }).butikker, /butikk/); assert.match(feilFor({ merker: [] }).merker, /merke/);
  assert.match(feilFor({ tema: "rosa" }).tema, /Tema/); assert.match(feilFor({ domene: { type: "eget", verdi: "x.hengsel.no" } }).domene, /hengsel\.no/);
  assert.match(feilFor({ domene: { type: "eget", verdi: "crm.studiosigdal-innlandet.no" } }).domene, /eksisterende/); assert.match(feilFor({ domene: { type: "eget", verdi: "ikke domene" } }).domene, /vertsnavn/);
  assert.match(feilFor({ admin: { epost: "nei" } }).admin_epost, /e-post/); assert.match(feilFor({ kjede: { kode: "sigdal_innlandet" }, kjede_kode: "sigdal_innlandet" }).kjede_kode, /Innlandets/);
  assert.match(feilFor({ passord: "sb_secret_abcdefghijklmnop" }).generelt, /nøkkel/); assert.match(feilFor({ x: "ghp_abcdefghijklmnopqrstuvwxyz0123" }).generelt, /nøkkel/);
  assert.deepEqual(tilAction(kunde).domene, { type: "app" });
  assert.equal(tilAction(normaliser({ ...KUNDE, domene: { type: "eget", verdi: "CRM.Kunde.no" } }).kunde).domene.verdi, "crm.kunde.no");
});

// ── 3 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("start: jobb og ni steg i D1, Action startes med kunde-JSON, jobb-id og fra_steg, og tokenet står ingen steder", medGitHub(async (kall) => {
  const env = await nyEnv();
  const v = await api(env, "POST", "/api/ny-kunde/valider", KUNDE);
  assert.equal(v.status, 200); assert.equal(v.data.kunde.id, "testkunde-k272"); assert.ok(v.data.sjekkliste.kunde.length >= 3);
  const id = await start(env);
  assert.equal(kall.length, 1);
  assert.equal(kall[0].url, "https://api.github.com/repos/SNgroup-Drift/hengsel-crm/actions/workflows/ny-kunde.yml/dispatches");
  assert.equal(kall[0].init.headers.Authorization, `Bearer ${TOKEN}`);
  assert.equal(kall[0].body.ref, "main");
  assert.equal(kall[0].body.inputs.jobb_id, id); assert.equal(kall[0].body.inputs.fra_steg, "miljo"); assert.equal(kall[0].body.inputs.torrkjoring, "false");
  const sendt = JSON.parse(kall[0].body.inputs.kunde);
  assert.equal(sendt.id, "testkunde-k272"); assert.equal(sendt.test, true); assert.equal(sendt.admin.epost, "es@sngroup.no"); assert.ok(!("pages_prosjekt" in sendt), "avledede felt sendes ikke");
  const j = await env.DB.prepare("SELECT * FROM ny_kunde_jobb WHERE id = ?").bind(id).first();
  assert.equal(j.status, "ny"); assert.equal(j.startet_av, "es@sngroup.no"); assert.equal(j.test, 1);
  assert.equal((await env.DB.prepare("SELECT COUNT(*) AS n FROM ny_kunde_steg WHERE jobb_id = ?").bind(id).first("n")), 9);
  assert.equal((await env.DB.prepare("SELECT hvem FROM ny_kunde_logg WHERE jobb_id = ?").bind(id).first("hvem")), "es@sngroup.no", "hvem og når logges");
  const alt = JSON.stringify((await env.DB.prepare("SELECT * FROM ny_kunde_jobb").all()).results) + JSON.stringify((await env.DB.prepare("SELECT * FROM ny_kunde_logg").all()).results);
  assert.ok(!alt.includes(TOKEN) && !alt.includes(NOKKEL), "ingen hemmelighet i D1");
  const dup = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true });
  assert.equal(dup.status, 400); assert.match(dup.data.feil.id, /finnes allerede/);
  assert.equal(kall.length, 1, "ingen ny start ved duplikat");
}));

test("start: bare es@sngroup.no, må bekreftes, demo bare for testkunder, hemmeligheter må være lagt inn", medGitHub(async (kall) => {
  const env = await nyEnv();
  const annen = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true }, ANNEN_EIER); assert.equal(annen.status, 403);
  const support = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true }, { epost: "s@x.no", navn: "S", rolle: "support" }); assert.equal(support.status, 403);
  assert.equal((await api(env, "POST", "/api/ny-kunde", KUNDE)).status, 400, "uten bekreftelse");
  assert.equal((await api(env, "POST", "/api/ny-kunde", { ...KUNDE, test: false, ref: "demo", bekreftet: true })).status, 400, "ekte kunde fra demo");
  assert.equal(kall.length, 0);
  const uten = await nyEnv({ GITHUB_DISPATCH_TOKEN: undefined });
  const r = await api(uten, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true });
  assert.equal(r.status, 503); assert.match(r.data.melding, /GITHUB_DISPATCH_TOKEN/);
  assert.equal((await uten.DB.prepare("SELECT COUNT(*) AS n FROM ny_kunde_jobb").first("n")), 1, "jobben lages, og settes til feil, når GitHub avviser starten");
  const valg = await api(uten, "GET", "/api/ny-kunde/valg"); assert.equal(valg.data.kan_starte, false); assert.deepEqual(valg.data.mangler, ["GITHUB_DISPATCH_TOKEN"]);
  const demo = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, ref: "demo", bekreftet: true, id: "demo-test-1" });
  assert.equal(demo.status, 200); assert.equal(kall[0].body.ref, "demo");
}));

test("start: GitHub avviser (401/404): jobben settes til feil, meldingen nevner ikke tokenet", medGitHub(async () => {
  const env = await nyEnv();
  const r = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true });
  assert.equal(r.status, 502); assert.match(r.data.melding, /HTTP 401/); assert.ok(!JSON.stringify(r.data).includes(TOKEN));
  assert.equal((await env.DB.prepare("SELECT status FROM ny_kunde_jobb").first("status")), "feil");
  const retry = await api(env, "GET", "/api/ny-kunde"); assert.equal(retry.data.jobber[0].status, "feil");
}, { status: 401 }));

// ── 4 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("rapport: signatur, tidsvindu, størrelse og ukjent jobb", async () => {
  const env = await nyEnv(); const kropp = { jobb_id: "01K7JX0000000000000000AAA1", steg: "miljo", status: "kjorer" };
  assert.equal((await handterRapport(signert(kropp, { nokkel: "x".repeat(48) }), env)).status, 401);
  assert.equal((await handterRapport(signert(kropp, { tid: String(Math.floor(Date.now() / 1000) - 600) }), env)).status, 401, "for gammel (gjenbruk)");
  const feilKropp = signert(kropp); const ny = new Request(feilKropp.url, { method: "POST", headers: feilKropp.headers, body: JSON.stringify({ ...kropp, steg: "seed" }) });
  assert.equal((await handterRapport(ny, env)).status, 401, "kroppen er endret etter signering");
  assert.equal((await handterRapport(new Request("https://admin.hengsel.no/api/oppstart/rapport", { method: "POST", body: "{}" }), env)).status, 401);
  assert.equal((await handterRapport(signert(kropp), env)).status, 404, "ukjent jobb");
  assert.equal((await handterRapport(signert("x".repeat(70_000)), env)).status, 413);
  assert.equal((await handterRapport(signert("ikke json"), env)).status, 400);
  assert.equal((await handterRapport(signert(kropp), { ...env, NY_KUNDE_RAPPORTNOKKEL: undefined })).status, 503);
  assert.equal((await handterRapport(new Request("https://admin.hengsel.no/api/oppstart/rapport", { method: "GET" }), env)).status, 405);
  assert.equal(await sjekkSignatur("kort", "1", "x", "00"), false);
});

test("rapport: hele løypa fra «venter» til «ferdig» med sjekkliste, logg renset, feil og prøv igjen", medGitHub(async (kall) => {
  const env = await nyEnv(); const id = await start(env);
  const rap = async (h) => { const r = await handterRapport(signert({ jobb_id: id, run_id: "777", run_url: "https://github.com/SNgroup-Drift/hengsel-crm/actions/runs/777", ...h }), env); assert.equal(r.status, 200, await r.clone().text()); };
  const les = async () => (await api(env, "GET", `/api/ny-kunde/${id}`)).data;
  await rap({ steg: "miljo", status: "kjorer" });
  let d = await les(); assert.equal(d.jobb.status, "kjorer"); assert.equal(d.jobb.run_url, "https://github.com/SNgroup-Drift/hengsel-crm/actions/runs/777"); assert.equal(d.steg[0].status, "kjorer");
  await rap({ steg: "miljo", status: "ok", sekunder: 12, resultat: { miljo: "kunde-testkunde-k272", hemmeligheter: ["SUPABASE_DB_PASSWORD"], hemmelig_nokkel: "sb_secret_abcdefghijk" }, logg: "Laget miljøet\nsb_secret_abcdefghijklmnop og ghp_abcdefghijklmnopqrstuvwxyz0123\npostgres://bruker:passord123@db.x.supabase.co/postgres" });
  d = await les(); assert.equal(d.steg[0].status, "ok"); assert.equal(d.steg[0].sekunder, 12);
  assert.ok(!d.steg[0].logg.includes("abcdefghijklmnop") && !d.steg[0].logg.includes("passord123"), d.steg[0].logg); assert.match(d.steg[0].logg, /Laget miljøet/);
  assert.ok(!("hemmelig_nokkel" in d.steg[0].resultat), "bare kjente, offentlige felt i resultatet");
  await rap({ steg: "supabase", status: "feil", sekunder: 3, feil: "Supabase-organisasjonen har planen «free», ikke Pro.", logg: ["a", "b"].join("\n") });
  d = await les(); assert.equal(d.jobb.status, "feil"); assert.equal(d.jobb.gjeldende_steg, "supabase"); assert.match(d.steg[1].feil, /ikke Pro/); assert.equal(d.kan_fjernes, true);
  // Prøv igjen fra steg 2
  const p = await api(env, "POST", `/api/ny-kunde/${id}/prov-igjen`, { fra_steg: "supabase" });
  assert.equal(p.status, 200); assert.equal(kall.at(-1).body.inputs.fra_steg, "supabase"); assert.equal(kall.at(-1).body.inputs.jobb_id, id);
  d = await les(); assert.equal(d.jobb.status, "ny"); assert.equal(d.steg[0].status, "ok", "steg før X beholdes"); assert.equal(d.steg[1].status, "venter"); assert.equal(d.steg[1].forsok, 1); assert.equal(d.steg[1].feil, null);
  assert.equal((await api(env, "POST", `/api/ny-kunde/${id}/prov-igjen`, { fra_steg: "supabase" })).status, 409, "ikke mens jobben pågår");
  assert.equal((await api(env, "POST", `/api/ny-kunde/${id}/prov-igjen`, { fra_steg: "finnes-ikke" })).status, 400);
  for (const s of STEG.slice(1)) await rap({ steg: s.kode, status: "ok", sekunder: 5, resultat: s.kode === "kundelista" ? { gren: "claude/ny-kunde/testkunde-k272", pr: 12, pr_url: "https://github.com/SNgroup-Drift/hengsel-crm/pull/12" } : {} });
  await rap({ jobb: "ferdig", status: "ok", resultat: { pages_adresse: "hengsel-testkunde-k272.pages.dev", domene: "testkunde-k272.app.hengsel.no", supabase_ref: "abcdefghijklmnopqrst", test: true } });
  d = await les();
  assert.equal(d.jobb.status, "ferdig"); assert.equal(d.jobb.resultat.pages_adresse, "hengsel-testkunde-k272.pages.dev"); assert.equal(d.pr_url, "https://github.com/SNgroup-Drift/hengsel-crm/pull/12");
  assert.ok(d.steg.every((s) => s.status === "ok"));
  assert.ok(d.sjekkliste.kunde.some((p) => /DNS/.test(p.tittel))); assert.ok(d.sjekkliste.kunde.some((p) => /K-273/.test(p.tekst))); assert.ok(d.sjekkliste.kunde.some((p) => /første innlogging/i.test(p.tittel)));
  assert.match(d.sjekkliste_tekst, /Sjekkliste for Testkunde K-272 AS/);
  assert.ok(d.historikk.some((h) => h.hvem === "Action #777"), "Action-rapportene logges med kjøringen");
  assert.ok(d.historikk.some((h) => h.hvem === "es@sngroup.no" && h.handling === "prøv igjen"));
}));

test("rapport: nedrigging og andre steg-navn", medGitHub(async (kall) => {
  const env = await nyEnv(); const id = await start(env);
  await handterRapport(signert({ jobb_id: id, steg: "miljo", status: "ok", resultat: {} }), env);
  await handterRapport(signert({ jobb_id: id, jobb: "ferdig", status: "ok" }), env);
  assert.equal((await handterRapport(signert({ jobb_id: id, steg: "rare", status: "ok" }), env)).status, 400);
  assert.equal((await handterRapport(signert({ jobb_id: id, steg: "miljo", status: "rar" }), env)).status, 400);
  // Fjern testkunde
  assert.equal((await api(env, "POST", `/api/ny-kunde/${id}/fjern`, { bekreft: "feil" })).status, 400);
  assert.equal((await api(env, "POST", `/api/ny-kunde/${id}/fjern`, { bekreft: "testkunde-k272" }, ANNEN_EIER)).status, 403);
  const f = await api(env, "POST", `/api/ny-kunde/${id}/fjern`, { bekreft: "testkunde-k272" });
  assert.equal(f.status, 200); assert.equal(kall.at(-1).url.split("/workflows/")[1], "fjern-kunde.yml/dispatches");
  assert.deepEqual(kall.at(-1).body.inputs, { kunde_id: "testkunde-k272", bekreft: "testkunde-k272", jobb_id: id, torrkjoring: "false" });
  assert.equal((await api(env, "GET", `/api/ny-kunde/${id}`)).data.jobb.status, "fjerner");
  await handterRapport(signert({ jobb_id: id, steg: "nedrigging", status: "ok", logg: "Revet ned" }), env);
  await handterRapport(signert({ jobb_id: id, jobb: "fjernet", status: "ok" }), env);
  assert.equal((await api(env, "GET", `/api/ny-kunde/${id}`)).data.jobb.status, "fjernet");
  const igjen = await api(env, "POST", "/api/ny-kunde", { ...KUNDE, bekreftet: true });
  assert.equal(igjen.status, 200, "id-en kan brukes på nytt etter nedrigging");
}));

test("fjern: bare kunder merket test", medGitHub(async (kall) => {
  const env = await nyEnv(); const id = await start(env, { test: false, id: "ekte-kunde" });
  await handterRapport(signert({ jobb_id: id, jobb: "ferdig", status: "ok" }), env);
  const f = await api(env, "POST", `/api/ny-kunde/${id}/fjern`, { bekreft: "ekte-kunde" });
  assert.equal(f.status, 403); assert.match(f.data.melding, /test/);
  assert.equal(kall.filter((k) => k.url.includes("fjern-kunde")).length, 0);
  assert.equal((await api(env, "GET", `/api/ny-kunde/${id}`)).data.kan_fjernes, false);
}));

test("rens: nøkkelformer fjernes", () => {
  const ut = rens("sb_secret_abcdefghijkl ghp_abcdefghijklmnopqrstuvwxyz Bearer abcdefghijklmnop12 whsec_abcdefghijklmnopqrst postgres://u:pw@h/db");
  for (const d of ["abcdefghijkl", "ghp_", "abcdefghijklmnop12", "whsec_abcdef", ":pw@"]) assert.ok(!ut.includes(d), `${d} i ${ut}`);
});

test("sjekkliste: eget domene gir CNAME-posten, app-domene settes av oss, testkunde får nedriggingstips, ekte kunde PR-en", () => {
  const eget = sjekkliste({ navn: "K", test: false, innstilling: tilAction(normaliser({ ...KUNDE, test: false, domene: { type: "eget", verdi: "crm.kunde.no" } }).kunde), pr_url: "https://github.com/x/y/pull/3" });
  assert.match(eget.kunde[0].tittel, /crm\.kunde\.no/); assert.equal(eget.kunde[0].kopi, "CNAME crm.kunde.no → hengsel-testkunde-k272.pages.dev");
  assert.ok(eget.intern.some((p) => /Flett kundelista/.test(p.tittel) && p.tekst.includes("pull/3")));
  const app = sjekkliste({ navn: "K", test: true, innstilling: tilAction(normaliser(KUNDE).kunde) });
  assert.ok(app.intern.some((p) => /Testkunde/.test(p.tittel)));
  assert.match(sjekklisteTekst({ navn: "K", innstilling: tilAction(normaliser(KUNDE).kunde) }), /1\. DNS for testkunde-k272\.app\.hengsel\.no/);
});

// ── 6 ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("meny og ruter: Opprett kunde under Oppstart, fremdrift deler én fil, rapport-stien er utenfor Access, resten er låst", async () => {
  const alle = menyNaa("eier").flatMap((g) => g.punkter.map((p) => p.id)); assert.ok(alle.includes("opprett-kunde") && alle.includes("oppstart"));
  assert.deepEqual(menyNaa("support").flatMap((g) => g.punkter.map((p) => p.id)), ["saker", "timer"]);
  assert.equal(omradeFor("/oppstart/opprett-kunde"), "Opprett kunde");
  assert.equal(stiTilFil("/oppstart/ny-kunde/01K7JX0000000000000000ABCD"), "/oppstart/ny-kunde/jobb");
  assert.equal(kanSe({ rolle: "support" }, "/oppstart/opprett-kunde"), false); assert.equal(kanSe({ rolle: "support" }, "/api/ny-kunde"), false); assert.equal(kanSe({ alle: true, rolle: "eier" }, "/api/ny-kunde"), true);
  const env = { DB: await lagTestdatabase(), NY_KUNDE_RAPPORTNOKKEL: NOKKEL, ASSETS: { fetch: async () => new Response("x") } };
  // uten Access-oppsett svarer Workeren 503 på alt annet, men rapport-stien når egen kontroll
  assert.equal((await worker.fetch(new Request("https://admin.hengsel.no/api/ny-kunde", { method: "GET" }), env)).status, 503);
  assert.equal((await worker.fetch(new Request("https://admin.hengsel.no/api/oppstart/rapport", { method: "POST", body: "{}" }), env)).status, 401, "ugyldig signatur, ikke Access");
  const r = await worker.fetch(signert({ jobb_id: "01K7JX0000000000000000AAA1", steg: "miljo", status: "ok" }), env);
  assert.equal(r.status, 404); assert.equal(r.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
  // sidene finnes
  for (const f of ["opprett-kunde.astro", "ny-kunde/jobb.astro"]) assert.ok(readFileSync(join(rot, "sites/admin/src/pages/oppstart", f), "utf8").includes("<Side"), f);
});

test("ingen hemmeligheter i de nye filene, og ingen style-attributter eller hex-farger (CSP og designregler)", () => {
  const filer = ["sites/admin/worker/api-ny-kunde.js", "sites/admin/worker/ny-kunde-rapport.js", "sites/admin/src/lib/ny-kunde.js", "sites/admin/src/scripts/opprett-kunde.ts", "sites/admin/src/scripts/ny-kunde-jobb.ts", "sites/admin/src/styles/ny-kunde.css", "sites/admin/migrations/0004_ny_kunde.sql"];
  for (const f of filer) {
    const t = readFileSync(join(rot, f), "utf8");
    assert.ok(!/(sb_secret_[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|eyJ[A-Za-z0-9_-]{30,})/.test(t), `${f}: ser ut som en nøkkel`);
    assert.ok(!/\sstyle="/.test(t), `${f}: style-attributt`);
    if (f.endsWith(".css") || f.endsWith(".ts")) assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(t), `${f}: farge utenfor tokens`);
  }
});
