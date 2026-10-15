/**
 * K-260: Hengsel Admin fase C og Drift. Kjøres av npm test. Ingen nettverk, ingen hemmeligheter.
 *  1. Migreringen 0003: tabellene finnes, kjører rett etter 0001 (uten 0002), kjederabatt lagres ikke, ingen eksempeldata.
 *  2. Fakturakjøringen gir riktige linjer og summer: abonnementet = AdminData.beregn for eksempelkundene i admin-data-bc.js, etablering,
 *     timer ut over inkludert fra tidsføringen (fase B), viderefakturering med 15 % påslag, «Endret:» mot forrige måned.
 *  3. KPI: ny pris i hele kroner, varslet kunde får ny pris fra KPI-datoen, e-posten er bare et utkast.
 *  4. Tilgang: supportrollen (og alle andre enn eier) får ADM-403 på Fakturering, Tall og Drift, også på GET.
 *  5. PowerOffice er av uten nøkler: «Send» gir 409 og kaller aldri ut, Utestående er tom. Med nøkler og et stubbet API: Sendt og Feil.
 *  6. Drift: aldri hemmeligheter i kontoer/frister/rutiner, 1Password-lenke valideres, avkryssing per periode.
 *  7. SA1-kortet: GET /api/oversikt/fakturering har den avtalte formen.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";
import { lagTestdatabase, lagD1, MIGRERINGER } from "./lib/d1-node.mjs";
import { lagApi } from "./lib/admin-eksempeldata.mjs";
import { leggInnEksempeldataC } from "./lib/admin-eksempeldata-c.mjs";
import { handterApi } from "../sites/admin/worker/api.js";
import { lagreUtkast, byggKjoring, sendKjoring, hentUtestaende } from "../sites/admin/worker/api-fakturering.js";
import { erKoblet, PowerOfficeKlient } from "../sites/admin/worker/poweroffice.js";
import { periode, utenHemmelighet, hvelvUrl } from "../sites/admin/worker/api-drift.js";
import { normaliserPrisliste, viderefakturering } from "../sites/admin/src/lib/pris.js";
import * as F from "../sites/admin/src/lib/fakturering.js";
import { idagOslo, pluss, plussMnd } from "../sites/admin/worker/db.js";

const rot = resolve(import.meta.dirname, "..");
const ASSETS = join(rot, "docs/design/admin-fase-a/assets");
/** Designets eksempeldata (AdminData fra fase A og AdminBC fra fase B/C), lest som i nettleseren */
function designdata() {
  const window = {};
  vm.runInNewContext(readFileSync(join(ASSETS, "admin-data.js"), "utf8") + readFileSync(join(ASSETS, "admin-data-bc.js"), "utf8"), { window });
  return { AD: window.AdminData, BC: window.AdminBC };
}
const { AD, BC } = designdata();
const eierAD = (id) => AD.eiere.find((e) => e.id === id);
const faktBC = (id) => BC.kjoring.fakturaer.find((f) => f.eier === id);
const ore = (kr) => Math.round(kr * 100);

const SUPPORT = { epost: "support@eksempel.no", navn: "Supportperson", rolle: "support" };
async function kall(env, metode, sti, bruker, kropp) {
  const r = await handterApi(new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: kropp ? { "Content-Type": "application/json" } : {}, body: kropp ? JSON.stringify(kropp) : undefined }), env, { bruker });
  return { status: r.status, data: await r.json() };
}

// Én felles database med eksempeldata uten endringer og uten simulerte statuser (til sammenligning med designet)
const idag = idagOslo();
const neste = F.leggTilMnd(F.maanedFor(idag), 1);
const envA = { DB: await lagTestdatabase(), DRIFT_STATUSSIDER: "av" };
const iderA = await leggInnEksempeldataC(envA, { endringer: false, statuser: false });
const apiA = lagApi(envA);

// ── 1. Migreringen ───────────────────────────────────────────────────────────────────────────────────────────────────────────
test("migrering 0003: tabellene for abonnement, fakturakjøring, KPI, konto, frist og rutine; kjører rett etter 0001; ingen eksempeldata", async () => {
  const db = await lagTestdatabase();
  const tabeller = (await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()).results.map((r) => r.name);
  for (const t of ["abonnement", "abonnementslinje", "abonnementsendring", "fakturakjoring", "faktura", "fakturalinje", "kpi_justering", "kpi_justering_kunde", "konto", "frist", "rutine", "rutinepunkt", "rutineavkryssing"]) assert.ok(tabeller.includes(t), t);
  // Kjederabatten regnes ut og lagres ikke
  const abo = (await db.prepare("SELECT name FROM pragma_table_info('abonnement')").all()).results.map((r) => r.name);
  const linje = (await db.prepare("SELECT name FROM pragma_table_info('abonnementslinje')").all()).results.map((r) => r.name);
  assert.ok(![...abo, ...linje].some((k) => /rabatt/.test(k)), "kjederabatt lagres ikke på abonnementet");
  // 0003 avhenger bare av 0001 (0002 er fase B, K-259)
  const d = lagD1();
  for (const f of readdirSync(MIGRERINGER).filter((f) => /^000[13]_/.test(f)).sort()) await d.exec(readFileSync(join(MIGRERINGER, f), "utf8"));
  assert.equal(JSON.parse((await d.prepare("SELECT verdi FROM innstilling WHERE nokkel = 'internkost_time_ore'").first()).verdi), 65000);
  const sql = readFileSync(join(MIGRERINGER, "0003_fase_c.sql"), "utf8");
  assert.doesNotMatch(sql, /Nordli|Granlund|Aune|Vestby|Strand|Hovde|1password\.com\/open/, "eksempeldata hører ikke hjemme i migreringen");
  assert.doesNotMatch(sql, /POWEROFFICE_\w+\s*=|api[_-]?key\s*=/i, "ingen nøkler");
});

// ── 2. Fakturakjøringen ──────────────────────────────────────────────────────────────────────────────────────────────────────
test("abonnement fra signert avtale: linjene gir samme pris som avtalen, og kan ikke lages fra en avtale som ikke er signert", async () => {
  const liste = await apiA("GET", "/api/abonnement");
  assert.equal(liste.abonnementer.length, 6);
  for (const a of liste.abonnementer) {
    const av = (await apiA("GET", "/api/avtaler")).avtaler.find((x) => x.nr === a.avtale_nr);
    assert.equal(a.per_mnd_ore, av.per_mnd_ore, `${a.eier_navn}: abonnementet = avtalens pris`);
  }
  const elv = (await apiA("GET", "/api/avtaler")).avtaler.find((x) => x.status === "utkast");
  await assert.rejects(apiA("POST", "/api/abonnement", { avtale_nr: elv.nr }), /409/);
  await assert.rejects(apiA("POST", "/api/abonnement", { avtale_nr: iderA.avtaleGranlund }), /409/);
});

test("fakturakjøring: abonnementslinjen = AdminData.beregn for eksempelkundene i admin-data-bc.js, og summer med mva", async () => {
  const k = await apiA("GET", `/api/fakturakjoring/${neste}`);
  for (const id of ["granlund", "strand", "aune", "vestby", "nordli"]) {
    const f = k.fakturaer.find((x) => x.eier_id === iderA[id]);
    const forventet = AD.verdi(eierAD(id)).netto;
    assert.equal(f.fast_ore, ore(forventet), `${id}: abonnement = AdminData.beregn (${forventet} kr)`);
    assert.equal(f.fast_ore, ore(faktBC(id).fast), `${id}: abonnement = fast i admin-data-bc.js`);
    const abo = f.linjer.find((l) => l.type === "abonnement");
    assert.equal(abo.belop_ore, f.fast_ore);
    assert.equal(abo.rabatt_ore, ore(AD.verdi(eierAD(id)).rabatt), `${id}: kjederabatten er regnet ut`);
    assert.equal(f.sum_ore, f.linjer.reduce((s, l) => s + l.belop_ore, 0));
    assert.equal(f.mva_ore, Math.round(f.sum_ore * 0.25));
  }
  assert.equal(k.sum_ore, k.fakturaer.reduce((s, f) => s + f.sum_ore, 0));
  assert.equal(k.inkl_ore, k.sum_ore + k.mva_ore);
});

test("fakturakjøring: etablering første måned (Nordli 3 × Butikk = 75 000 kr, uten rabatt), timer ut over inkludert (Aune 1,5 t × 1 150 kr = 1 725 kr)", async () => {
  const k = await apiA("GET", `/api/fakturakjoring/${neste}`);
  const nordli = k.fakturaer.find((f) => f.eier_id === iderA.nordli);
  const etab = nordli.linjer.find((l) => l.type === "etablering");
  assert.equal(etab.belop_ore, ore(faktBC("nordli").engang[0].belop));
  assert.equal(etab.belop_ore, ore(AD.verdi(eierAD("nordli")).etablering));
  assert.ok(nordli.endret.some((e) => /^Ny kunde fra/.test(e)));
  const aune = k.fakturaer.find((f) => f.eier_id === iderA.aune);
  const timer = aune.linjer.find((l) => l.type === "timer");
  assert.equal(timer.belop_ore, ore(faktBC("aune").engang.find((x) => x.type === "timer").belop));
  assert.equal(timer.antall, 1.5);
  assert.match(timer.tekst, /1,5 t ut over 3 t inkludert × 1 150 kr/);
  // Granlund har 4,5 t av 11 inkludert: ingen timelinje. Etablering kommer bare én gang.
  assert.ok(!k.fakturaer.find((f) => f.eier_id === iderA.granlund).linjer.some((l) => l.type === "timer"));
  await lagreUtkast(envA.DB, neste);
  const etter = (await byggKjoring(envA.DB, F.leggTilMnd(neste, 1))).liste.find((x) => x.abo.eier_id === iderA.nordli);
  assert.ok(!etter.res.linjer.some((l) => l.type === "etablering"), "etablering faktureres ikke to ganger");
});

test("viderefakturering: kostpris + 15 % påslag, uten rabatt (samme beløp som admin-data-bc.js)", async () => {
  const pl = await (async () => { const p = await envA.DB.prepare("SELECT * FROM prisliste WHERE versjon = '2026.2'").first(); return normaliserPrisliste(p, (await envA.DB.prepare("SELECT * FROM prislisterad WHERE prisliste_id = ?").bind(p.id).all()).results); })();
  assert.equal(pl.viderefakturering_prosent, 15);
  for (const [kost, belop] of [[412, 473.80], [286, 328.90], [98, 112.70], [64, 73.60]]) assert.equal(viderefakturering(pl, ore(kost)), ore(belop), `${kost} kr + 15 %`);
  const k = await apiA("GET", `/api/fakturakjoring/${neste}`);
  const g = k.fakturaer.find((f) => f.eier_id === iderA.granlund);
  const sms = g.linjer.find((l) => l.type === "viderefakturert" && /^SMS/.test(l.tekst));
  assert.equal(sms.belop_ore, ore(faktBC("granlund").engang[0].belop));
  assert.equal(sms.kostpris_ore, 41200); assert.equal(sms.paaslag_prosent, 15); assert.equal(sms.rabatt_ore, 0);
  assert.match(sms.tekst, /kostpris 412,00 \+ 15 %/);
  // Manuelle linjer overlever et nytt utkast, og kan slettes; abonnementslinjen kan ikke
  await apiA("POST", `/api/fakturakjoring/${neste}/utkast`);
  const etter = (await apiA("GET", `/api/fakturakjoring/${neste}`)).fakturaer.find((f) => f.eier_id === iderA.granlund);
  assert.equal(etter.linjer.filter((l) => l.type === "viderefakturert").length, 2);
  const aboLinje = (await envA.DB.prepare("SELECT fl.id FROM fakturalinje fl JOIN faktura f ON f.id = fl.faktura_id WHERE f.eier_id = ? AND fl.type = 'abonnement'").bind(iderA.granlund).first()).id;
  await assert.rejects(apiA("DELETE", `/api/fakturalinjer/${aboLinje}`), /409/);
});

test("abonnementsendring: Start → Butikk fra den 1. gir ny pris og «Endret:» med +1 700 kr (15 % rabatt), og ingenting før datoen", async () => {
  const env = { DB: await lagTestdatabase() };
  const ider = await leggInnEksempeldataC(env, { endringer: true, statuser: false });
  const api = lagApi(env);
  const k = await api("GET", `/api/fakturakjoring/${neste}`);
  const g = k.fakturaer.find((f) => f.eier_id === ider.granlund);
  assert.equal(g.fast_ore, ore(29860 + 1700));
  assert.deepEqual(g.endret, [`Granlund Jevnaker: Start → Butikk fra 01.${neste.slice(5)} (+1 700 kr)`]);
  const naa = await api("GET", `/api/abonnement/${ider.abo.granlund}`);
  assert.equal(naa.pris.pris_ore, ore(29860), "endringen gjelder ikke før datoen");
  assert.equal(naa.endringer[0].framtidig, true);
  await assert.rejects(api("POST", `/api/abonnement/${ider.abo.granlund}/endringer`, { type: "pakke", linje_id: naa.linjer[0].id, pakke: "komplett", gjelder_fra: "2020-01-01" }), /400/);
});

// ── 3. KPI ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("KPI: ny pris = pris i dag × (1 + KPI) i hele kroner; varslet kunde får ny pris fra KPI-datoen; e-posten sendes ikke", async () => {
  assert.equal(F.kpiNyPris(813400, 3.1), 838600);
  assert.equal(F.kpiNyPris(529000, "3.1"), 545400);
  const kpi = await apiA("GET", "/api/kpi");
  assert.equal(kpi.justering.prosent, 3.1); assert.equal(kpi.justering.varsel_dager, 30); assert.equal(kpi.justering.eksempel, true);
  const aune = kpi.rader.find((r) => r.eier_id === iderA.aune);
  assert.equal(aune.pris_ore, 813400); assert.equal(aune.ny_pris_ore, 838600); assert.equal(aune.endring_ore, 25200);
  assert.equal(aune.varseldato, pluss(aune.kpi_dato, -30));
  assert.equal(aune.status, "utkast_klart");
  assert.match(aune.epost.tekst, /3,1 %/); assert.match(aune.epost.tekst, /8 386 kr/); assert.match(aune.epost.emne, /Prisjustering/);
  // Før varsling: prisen på KPI-datoen er uendret
  const kpiMnd = F.leggTilMnd(F.maanedFor(aune.kpi_dato), 1);
  const for_ = (await byggKjoring(envA.DB, kpiMnd)).liste.find((x) => x.abo.eier_id === iderA.aune);
  assert.equal(for_.res.fast_ore, 813400);
  await apiA("POST", `/api/kpi/${kpi.justering.aar}/varslet`, { abonnement_id: aune.abonnement_id });
  const etter = (await byggKjoring(envA.DB, kpiMnd)).liste.find((x) => x.abo.eier_id === iderA.aune);
  assert.equal(etter.res.fast_ore, 838600, "ny pris fra KPI-datoen");
  assert.ok(etter.res.endret.some((e) => /KPI/.test(e)) || etter.res.diff_ore === 25200);
  const igjen = await apiA("GET", "/api/kpi");
  assert.equal(igjen.rader.find((r) => r.abonnement_id === aune.abonnement_id && r.status === "varslet").varslet, idag);
  const abo = await apiA("GET", `/api/abonnement/${aune.abonnement_id}`);
  assert.equal(abo.abonnement.neste_kpi_dato, plussMnd(aune.kpi_dato, 12), "neste KPI-dato flyttes ett år");
  await assert.rejects(apiA("PUT", "/api/kpi/2026", { prosent: "mye" }), /400/);
});

// ── 4. Tilgang ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("tilgang: supportrollen får ADM-403 på Fakturering (også GET), Tall, Drift og Innstillinger; eier får 200", async () => {
  for (const [metode, sti, kropp] of [["GET", "/api/abonnement"], ["GET", `/api/abonnement/${iderA.abo.granlund}`], ["GET", "/api/fakturakjoring"], ["GET", `/api/fakturakjoring/${neste}`], ["POST", `/api/fakturakjoring/${neste}/send`, {}], ["GET", "/api/kpi"], ["GET", "/api/utestaende"], ["GET", "/api/oversikt/fakturering"], ["GET", "/api/tall"]]) {
    const r = await kall(envA, metode, sti, SUPPORT, kropp);
    assert.equal(r.status, 403, `${metode} ${sti}`);
    assert.equal(r.data.kode, "ADM-403");
    assert.match(r.data.melding, /Du har ikke tilgang til (Fakturering|Tall)/);
  }
  for (const sti of ["/api/drift/status", "/api/drift/kontoer", "/api/drift/frister", "/api/drift/rutiner"]) assert.equal((await kall(envA, "GET", sti, SUPPORT)).data.melding, "Du har ikke tilgang til Drift.");
  assert.equal((await kall(envA, "GET", "/api/innstillinger/varsler", SUPPORT)).status, 403);
  assert.equal((await kall(envA, "GET", "/api/fakturakjoring", { navn: "Leser", rolle: "leser" })).status, 403);
  assert.equal((await kall(envA, "GET", "/api/fakturakjoring", { navn: "Eirik", rolle: "eier" })).status, 200);
});

// ── 5. PowerOffice ───────────────────────────────────────────────────────────────────────────────────────────────────────────
test("PowerOffice av uten nøkler: «Send» gir 409 og kaller aldri ut, Utestående er tom, klienten kan ikke lages", async () => {
  const original = globalThis.fetch;
  let kalt = 0;
  globalThis.fetch = async () => { kalt++; throw new Error("ingen nettverk i testen"); };
  try {
    assert.equal(erKoblet({}), false);
    assert.equal(erKoblet({ POWEROFFICE_APP_KEY: "a", POWEROFFICE_CLIENT_KEY: "b" }), false, "alle tre må være satt");
    assert.throws(() => new PowerOfficeKlient({}), /ikke koblet/);
    const r = await kall(envA, "POST", `/api/fakturakjoring/${neste}/send`, { navn: "Eirik", rolle: "eier" }, {});
    assert.equal(r.status, 409); assert.match(r.data.melding, /PowerOffice er ikke koblet til\. Ingenting er sendt\./);
    const k = await apiA("GET", `/api/fakturakjoring/${neste}`);
    assert.equal(k.poweroffice_koblet, false); assert.equal(k.sendt, 0);
    const u = await apiA("GET", "/api/utestaende");
    assert.deepEqual({ koblet: u.koblet, rader: u.rader, hentet: u.hentet }, { koblet: false, rader: [], hentet: null });
    assert.equal(kalt, 0, "PowerOffice kalles aldri uten nøkler");
  } finally { globalThis.fetch = original; }
  for (const f of ["sites/admin/worker/poweroffice.js", "sites/admin/wrangler.jsonc", "scripts/lib/admin-eksempeldata-c.mjs"]) assert.doesNotMatch(readFileSync(join(rot, f), "utf8"), /POWEROFFICE_\w+\s*[:=]\s*["'][^"']+["']/, `${f}: ingen nøkler`);
});

test("PowerOffice med nøkler (stubbet API, ingen nettverk): Klar blir Sendt, ukjent kunde blir Feil, sendte fakturaer er låst", async () => {
  const env = { DB: await lagTestdatabase(), POWEROFFICE_APP_KEY: "test-app", POWEROFFICE_CLIENT_KEY: "test-klient", POWEROFFICE_SUBSCRIPTION_KEY: "test-abo" };
  const ider = await leggInnEksempeldataC(env, { endringer: false, statuser: false });
  const kall_ = [];
  const hent = async (url, init) => {
    const u = new URL(url); kall_.push(`${init.method} ${u.pathname}`);
    assert.equal(new Headers(init.headers).get("Ocp-Apim-Subscription-Key"), "test-abo");
    if (u.pathname === "/OAuth/Token") { assert.equal(new Headers(init.headers).get("Authorization"), `Basic ${btoa("test-app:test-klient")}`); return Response.json({ access_token: "t", expires_in: 1200 }); }
    assert.equal(new Headers(init.headers).get("Authorization"), "Bearer t");
    if (u.pathname === "/v2/Customers") return Response.json(u.searchParams.get("organizationNumbers") === "923456781" ? [] : [{ Id: 77 }]);
    if (u.pathname === "/v2/SalesOrders/Complete") return Response.json({ Id: `SO-${kall_.length}` });
    return new Response("nei", { status: 404 });
  };
  await sendKjoring(env.DB, env, neste, { hent });
  const k = await lagApi(env)("GET", `/api/fakturakjoring/${neste}`);
  assert.equal(k.fakturaer.find((f) => f.eier_id === ider.nordli).status, "feil");
  assert.match(k.fakturaer.find((f) => f.eier_id === ider.nordli).feilmelding, /kunden finnes ikke/);
  assert.equal(k.sendt, 5); assert.equal(k.status, "delvis_sendt");
  // Tidsføringen som ble fakturert, merkes med kjøringen
  assert.equal(await env.DB.prepare("SELECT COUNT(*) AS n FROM tidsforing WHERE eier_id = ? AND fakturert_kjoring_id IS NOT NULL").bind(ider.aune).first("n"), 1);
  await assert.rejects(lagApi(env)("POST", `/api/fakturakjoring/${neste}/viderefakturering`, { eier_id: ider.granlund, tekst: "SMS", kostpris_ore: 100 }), /409/);
  // PowerOffice svarer ikke på innloggingen: ingenting sendes
  await assert.rejects(sendKjoring(env.DB, env, neste, { hent: async () => new Response("", { status: 503 }) }), /ingen fakturaer er klare|svarte ikke/i);
  // Utestående leses og lagres ikke
  const u = await hentUtestaende(env.DB, env, async (url) => new URL(url).pathname === "/OAuth/Token" ? Response.json({ access_token: "t" })
    : Response.json([{ DocumentNo: "10219", CustomerOrganizationNumber: "911336904", Amount: 7487.5, VoucherDate: "2026-09-01", DueDate: plussMnd(idag, -1) }]));
  assert.equal(u.koblet, true); assert.equal(u.rader[0].eier_id, ider.aune); assert.equal(u.forfalt_ore, 748750); assert.ok(u.rader[0].dager_over > 25);
});

// ── 6. Drift ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("drift: aldri passord eller nøkler, 1Password-lenken må gå til 1Password, avkryssing per periode", async () => {
  assert.throws(() => utenHemmelighet("passord: hemmelig123", "merknad"), /aldri passord/);
  assert.throws(() => utenHemmelighet("sk_live_" + "x".repeat(40), "merknad"), /aldri passord/);
  assert.equal(utenHemmelighet("Viderefaktureres", "merknad"), "Viderefaktureres");
  assert.throws(() => hvelvUrl("https://evil.example/1password.com"), /1Password/);
  assert.throws(() => hvelvUrl("http://start.1password.com/x"), /1Password/);
  assert.match(hvelvUrl("https://start.1password.com/open/i?v=abc"), /^https:\/\/start\.1password\.com/);
  await assert.rejects(apiA("POST", "/api/drift/kontoer", { tjeneste: "Test", merknad: "password=abc" }), /400/);
  assert.equal(periode("maaned", "2026-10-14"), "2026-10");
  assert.equal(periode("kvartal", "2026-10-14"), "2026-K4");
  assert.equal(periode("uke", "2026-10-14"), "2026-U42");
  assert.equal(periode("uke", "2027-01-01"), "2026-U53");
  const r = (await apiA("GET", "/api/drift/rutiner")).rutiner.find((x) => x.gruppe === "maaned");
  assert.equal(r.ferdige, 2); assert.equal(r.antall, 4);
  const punkt = r.punkter.find((p) => !p.ok);
  await apiA("PUT", `/api/drift/rutinepunkter/${punkt.id}/avkryssing`, { ok: 1 });
  assert.equal((await apiA("GET", "/api/drift/rutiner")).rutiner.find((x) => x.gruppe === "maaned").ferdige, 3);
  const nesteMnd = (await apiA("GET", `/api/drift/rutiner?dato=${F.forsteIMnd(neste)}`)).rutiner.find((x) => x.gruppe === "maaned");
  assert.equal(nesteMnd.ferdige, 0, "ny periode starter uten kryss");
  const kontoer = await apiA("GET", "/api/drift/kontoer");
  assert.equal(kontoer.sum_mnd_ore, 265000 + 42000 + 1800 + 1800 + 14000 + 59000);
  assert.ok(kontoer.kontoer.find((k) => k.tjeneste === "Domene sigdal-crm.no").snart);
  const frister = await apiA("GET", "/api/drift/frister");
  assert.equal(frister.frister.find((f) => /KPI-varsel/.test(f.tekst)).niva, "snart", "2 dager: gul");
  assert.equal(frister.frister.find((f) => /sigdal-crm/.test(f.tekst)).niva, "ok", "8 dager: over 7");
  const status = await apiA("GET", "/api/drift/status");
  assert.equal(status.miljoer.length, 6); assert.ok(status.miljoer.every((m) => m.koblet === false && m.versjon === null));
  assert.ok(status.plattform.every((p) => p.indikator === "av"), "statussidene hentes ikke i testene");
});

// ── 7. SA1-kortet ────────────────────────────────────────────────────────────────────────────────────────────────────────────
test("SA1: GET /api/oversikt/fakturering gir dato, antall, sum uten mva, klar, sendt og feil for neste kjøring", async () => {
  const o = await apiA("GET", "/api/oversikt/fakturering");
  const k = await apiA("GET", `/api/fakturakjoring/${neste}`);
  assert.equal(o.maaned, neste); assert.equal(o.dato, F.forsteIMnd(neste));
  assert.equal(o.antall, k.antall); assert.equal(o.sum_uten_mva_ore, k.sum_ore);
  for (const s of ["klar", "sendt", "feil"]) assert.equal(typeof o[s], "number");
  assert.equal(o.klar + o.sendt + o.feil, o.antall);
  assert.equal(o.href, "/fakturering/kjoring");
});

test("tall: MRR, kunder og butikker regnes fra abonnementene; salgstrakt fra tavla", async () => {
  const t = await apiA("GET", "/api/tall");
  const k = await apiA("GET", `/api/fakturakjoring/${F.maanedFor(idag)}`);
  assert.equal(t.tall.inntekt_mnd_ore, k.fakturaer.reduce((s, f) => s + f.fast_ore, 0));
  assert.equal(t.tall.kunder, k.antall);
  assert.equal(t.mnd.length, 12);
  assert.equal(t.trakt[0].steg, "ny"); assert.ok(t.trakt.every((s, i) => i === 0 || s.antall <= t.trakt[i - 1].antall));
  assert.deepEqual(t.tapt, [{ grunn: "Valgte annen leverandør", antall: 1 }]);
});
