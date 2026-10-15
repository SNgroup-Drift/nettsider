/**
 * JSON-API-et til Hengsel Admin fase A (K-240, 60-213). Alle ruter ligger bak Access-sjekken i index.js; bare rollen eier får skrive
 * (POST, PATCH, PUT, DELETE), sjekket i index.js før denne fila kalles. All input valideres her (worker/valider.js) før den lagres i D1.
 * Svar: 200 { ...data } · 400 { ok:false, kode:"ADM-400", feil:{felt:melding} } · 404 ADM-404 · 409 ADM-409 · 503 ADM-504 (databasen svarte ikke).
 *
 * Ruter (GET hvis ikke annet er sagt):
 *   /api/oversikt · /api/tavle · /api/eiere (POST) · /api/eiere/:id (PATCH, DELETE) · /api/eiere/:id/butikker (POST) · /api/butikker/:id (PATCH, DELETE)
 *   /api/eiere/:id/kontakter (POST) · /api/kontakter/:id (PATCH, DELETE) · /api/eiere/:id/muligheter (POST) · /api/muligheter/:id (PATCH)
 *   /api/aktiviteter (POST) · /api/tilbud (POST) · /api/tilbud/:id (PATCH) · /api/avtaler (POST) · /api/avtaler/:nr (PATCH) · /api/avtaler/:nr/send (POST)
 *   /api/avtaler/:nr/signert (POST) · /api/avtaler/:nr/paaminnelse (POST) · /api/prisliste (POST) · /api/prisliste/gjeldende · /api/prisliste/:id (PATCH, DELETE)
 *   /api/prisliste/:id/publiser (POST) · /api/leverandor (PUT) · /api/innstillinger (PATCH) · /api/import/forhandsvis (POST, fil) · /api/import (POST)
 * Tilbudet som PDF: GET /salg/tilbud/:nr/:versjon.pdf (tilbudPdf, kalles fra index.js).
 */
import { ApiFeil, naa, idagOslo, pluss, plussMnd, forsteINesteMnd, dagerMellom, ulid, innstilling, settInnstilling, nesteNr, prislisteMedRader, gjeldendePrislisteRad, json } from "./db.js";
import * as V from "./valider.js";
import { normaliserPrisliste, beregn } from "../src/lib/pris.js";
import { lesOpplasting, forhandsvis, importer, KILDER } from "./import.js";
import { lagTilbudPdf } from "./pdf.js";
import * as penneo from "./penneo.js";
import tokens from "@sngroup/hengsel-tokens/tokens.json" with { type: "json" };
import { RUTER_FAKTURERING } from "./api-fakturering.js"; // K-260 fase C
import { RUTER_DRIFT } from "./api-drift.js"; // K-260 Drift

export const STATUSER = ["ny", "demo", "tilbud", "forhandling", "signert", "tapt"];
export const APNE = ["ny", "demo", "tilbud", "forhandling"];
export const KOLONNER = [["ny", "Ny"], ["demo", "Demo avtalt"], ["tilbud", "Tilbud sendt"], ["forhandling", "Forhandling"], ["signert", "Signert"], ["tapt", "Tapt"]];
export const TAP_GRUNNER = ["Valgte annen leverandør", "For dyrt", "Ikke riktig tidspunkt", "Mangler funksjon", "Svarer ikke"];
export const AKTIVITETSTYPER = ["samtale", "mote", "demo", "epost", "notat"];
export const PAKKER = ["start", "butikk", "komplett"];
export const LINJER = ["sigdal", "hengsel"];
export const LINJENAVN = { sigdal: "Sigdal CRM", hengsel: "Hengsel" };
export const KILDE_KODER = Object.keys(KILDER);

/** Fargene til PDF-en, fra den pinnede hengsel.tokens.json (aldri hex i koden) */
export const PDF_FARGER = {
  tekst: tokens.farge.tekst.lys, tekstDempet: tokens.farge["tekst-dempet"].lys, aksent: tokens.farge.aksent.lys, linje: tokens.farge.linje.lys,
  ramme: tokens.farge.ramme.lys, flateSenket: tokens.farge["flate-senket"].lys, varselFlate: tokens.farge["varsel-flate"].lys,
  varselTekst: tokens.farge["varsel-tekst"].lys, ferdig: tokens.status.ferdig.lys.fg,
};

const RUTER = [];
const rute = (metode, monster, fn) => RUTER.push({ metode, re: new RegExp(`^${monster}$`), fn });
const ULID = "([0-9A-HJKMNP-TV-Z]{26})";
const AVTALE = "(A-\\d{4}-\\d{3,})";

export async function handterApi(req, env, ctx = {}) {
  try {
    if (!env.DB) throw new ApiFeil(503, "ADM-504", "Databasen er ikke koblet til.");
    const url = new URL(req.url);
    const sti = url.pathname.replace(/\/+$/, "");
    const metode = req.method === "HEAD" ? "GET" : req.method;
    for (const r of RUTER) {
      if (r.metode !== metode) continue;
      const m = r.re.exec(sti);
      if (!m) continue;
      const data = await r.fn({ req, env, db: env.DB, url, p: m.slice(1), bruker: ctx.bruker ?? { epost: "", navn: "Admin", rolle: "leser" }, hentLogo: ctx.hentLogo });
      return json(200, { ok: true, ...data });
    }
    throw new ApiFeil(404, "ADM-404", "Finnes ikke.");
  } catch (e) {
    if (e instanceof ApiFeil) return json(e.status, { ok: false, kode: e.kode, melding: e.message, feil: e.felt ?? {} });
    console.error("api:", e && e.message);
    return json(503, { ok: false, kode: "ADM-504", melding: "Databasen svarte ikke.", feil: {} });
  }
}

// ── Felles ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const alle = async (st) => (await st.all()).results;
const ikkeFunnet = (hva = "Finnes ikke.") => new ApiFeil(404, "ADM-404", hva);
const konflikt = (m) => new ApiFeil(409, "ADM-409", m);

async function hentEier(db, id) {
  const e = await db.prepare("SELECT * FROM eier WHERE id = ?").bind(id).first();
  if (!e) throw ikkeFunnet("Eieren finnes ikke.");
  return e;
}

/** Gjeldende prisliste, normalisert, eller null */
async function gjeldende(db) {
  const rad = await gjeldendePrislisteRad(db);
  if (!rad) return null;
  const { pl, rader } = await prislisteMedRader(db, rad.id);
  return normaliserPrisliste(pl, rader);
}

/** Prisliste-innstillinger: fornyes snart og gyldighet */
async function tallInnstilling(db, nokkel, standard) {
  const v = Number((await innstilling(db, nokkel, standard)).verdi);
  return Number.isFinite(v) && v >= 0 ? v : standard;
}

/** Standard oppsett for en eier i prisberegneren: pakke per butikk (foreslått eller Butikk), ekstra brukere og montører */
export function standardOppsett(butikker, pl, linje) {
  const pakker = pl.pakker[linje] ?? pl.pakker.hengsel;
  return butikker.map((b) => {
    const pakke = b.pakke && pakker[b.pakke] ? b.pakke : "butikk";
    const inkl = pakker[pakke]?.inkl_brukere ?? 0;
    return { navn: b.navn, pakke, brukere: b.brukere != null ? Math.max(0, Number(b.brukere) - inkl) : 0, montorer: Number(b.montorer ?? 0) };
  });
}

/** Verdi per måned uten mva for hver eier: siste tilbud, ellers standard oppsett med gjeldende prisliste. Map<eier_id, øre|null> */
async function verdier(db, eiere, pl) {
  const ut = new Map();
  if (!eiere.length) return ut;
  const ider = eiere.map((e) => e.id);
  const sp = ider.map(() => "?").join(",");
  const butikker = await alle(db.prepare(`SELECT * FROM butikk WHERE eier_id IN (${sp}) ORDER BY rekkefolge`).bind(...ider));
  const tilbud = await alle(db.prepare(`SELECT eier_id, sum_mnd_ore, versjon, dato FROM tilbud WHERE eier_id IN (${sp}) AND status != 'erstattet' ORDER BY dato DESC, versjon DESC`).bind(...ider));
  const sisteTilbud = new Map();
  for (const t of tilbud) if (!sisteTilbud.has(t.eier_id)) sisteTilbud.set(t.eier_id, t);
  for (const e of eiere) {
    if (sisteTilbud.has(e.id)) { ut.set(e.id, Number(sisteTilbud.get(e.id).sum_mnd_ore)); continue; }
    const b = butikker.filter((x) => x.eier_id === e.id);
    if (!pl || !b.length) { ut.set(e.id, null); continue; }
    try { ut.set(e.id, beregn(pl, e.produktlinje, standardOppsett(b, pl, e.produktlinje)).netto_ore); } catch { ut.set(e.id, null); }
  }
  return ut;
}

async function loggAktivitet(db, { eier_id, type = "notat", tittel, tekst = null, hvem, kontakt_id = null, mulighet_id = null, neste_tekst = null, neste_dato = null }, d = new Date()) {
  const t = naa(d);
  await db.prepare("INSERT INTO aktivitet (id, eier_id, kontakt_id, mulighet_id, type, dato, tittel, tekst, hvem, neste_tekst, neste_dato, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ulid(d.getTime()), eier_id, kontakt_id, mulighet_id, type, idagOslo(d), tittel, tekst, hvem, neste_tekst, neste_dato, t, t).run();
}

// ── Hvem er jeg (til sidemenyen) ──
rute("GET", "/api/meg", async ({ bruker, env }) => ({ navn: bruker.navn, epost: bruker.epost, rolle: bruker.rolle, penneo_koblet: penneo.erKoblet(env) }));

// ── SA1 Oversikt ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/oversikt", async ({ db }) => {
  const idag = idagOslo();
  const fornyesDager = await tallInnstilling(db, "fornyes_snart_dager", 90);
  const pl = await gjeldende(db);
  const kunder = await alle(db.prepare("SELECT id, navn FROM eier WHERE er_kunde = 1"));
  const butikkerHosKunder = await db.prepare("SELECT COUNT(*) AS n FROM butikk b JOIN eier e ON e.id = b.eier_id WHERE e.er_kunde = 1").first("n");
  const avtaler = await alle(db.prepare("SELECT a.*, e.navn AS eier_navn FROM avtale a JOIN eier e ON e.id = a.eier_id WHERE a.status IN ('signert', 'sagt_opp')"));
  const inntekt = avtaler.filter((a) => a.status === "signert" || (a.status === "sagt_opp" && a.opphorer && a.opphorer >= idag)).reduce((s, a) => s + Number(a.per_mnd_ore), 0);
  const fornyes = avtaler.filter((a) => a.status === "signert" && a.fornyes && a.fornyes >= idag && dagerMellom(idag, a.fornyes) <= fornyesDager).sort((a, b) => a.fornyes.localeCompare(b.fornyes));
  const sagtOpp = avtaler.filter((a) => a.status === "sagt_opp" && (!a.opphorer || a.opphorer >= idag));
  const apne = await alle(db.prepare("SELECT * FROM eier WHERE status IN ('ny','demo','tilbud','forhandling')"));
  const v = await verdier(db, apne, pl);
  const nesteSteg = await alle(db.prepare("SELECT id, navn, neste_tekst, neste_dato, status FROM eier WHERE neste_dato IS NOT NULL AND neste_dato <= ? AND status IN ('ny','demo','tilbud','forhandling','signert') ORDER BY neste_dato, navn").bind(idag));
  const leads = await alle(db.prepare("SELECT e.id, e.navn, e.fylke, e.lead_tid, e.lead_ny, e.lead_butikker, (SELECT COUNT(*) FROM butikk b WHERE b.eier_id = e.id) AS antall_butikker, (SELECT navn FROM kontakt k WHERE k.eier_id = e.id ORDER BY primaer DESC, opprettet LIMIT 1) AS kontakt_navn FROM eier e WHERE e.kilde = 'be_om_demo' AND e.status = 'ny' ORDER BY e.lead_tid DESC, e.opprettet DESC"));
  return {
    idag, fornyes_snart_dager: fornyesDager,
    tall: {
      aktive_kunder: kunder.length, butikker_hos_kunder: Number(butikkerHosKunder ?? 0), inntekt_mnd_ore: inntekt,
      apne_muligheter: apne.length, apen_verdi_ore: apne.reduce((s, e) => s + (v.get(e.id) ?? 0), 0), fornyes_snart: fornyes.length,
    },
    sagt_opp: sagtOpp.map((a) => ({ nr: a.nr, eier_navn: a.eier_navn, opphorer: a.opphorer })),
    fornyes: fornyes.map((a) => ({ nr: a.nr, eier_navn: a.eier_navn, fornyes: a.fornyes })),
    neste_steg: nesteSteg.map((e) => ({ eier_id: e.id, eier_navn: e.navn, tekst: e.neste_tekst, dato: e.neste_dato, forfalt: e.neste_dato < idag })),
    leads,
    prisliste: pl ? { versjon: pl.versjon, eksempel: pl.eksempel, status: pl.status } : null,
  };
});

// ── SA2 Tavle ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/tavle", async ({ db, url }) => {
  const linje = V.valg(url.searchParams.get("linje"), "linje", LINJER);
  const idag = idagOslo();
  const pl = await gjeldende(db);
  const eiere = await alle(linje ? db.prepare("SELECT * FROM eier WHERE produktlinje = ? ORDER BY neste_dato IS NULL, neste_dato, navn").bind(linje) : db.prepare("SELECT * FROM eier ORDER BY neste_dato IS NULL, neste_dato, navn"));
  const v = await verdier(db, eiere, pl);
  const antallButikker = new Map((await alle(db.prepare("SELECT eier_id, COUNT(*) AS n FROM butikk GROUP BY eier_id"))).map((r) => [r.eier_id, Number(r.n)]));
  const kort = (e) => ({ id: e.id, navn: e.navn, kjede: e.kjede, produktlinje: e.produktlinje, antall_butikker: antallButikker.get(e.id) ?? 0, verdi_ore: v.get(e.id), neste_tekst: e.neste_tekst, neste_dato: e.neste_dato, forfalt: !!e.neste_dato && e.neste_dato < idag, i_dag: e.neste_dato === idag, tap_grunn: e.tap_grunn, er_kunde: e.er_kunde === 1, lead_ny: e.lead_ny === 1 });
  const kolonner = KOLONNER.map(([id, navn]) => {
    const liste = eiere.filter((e) => e.status === id);
    return { id, navn, antall: liste.length, sum_ore: liste.reduce((s, e) => s + (v.get(e.id) ?? 0), 0), kort: liste.map(kort) };
  });
  const apne = eiere.filter((e) => APNE.includes(e.status));
  return { idag, kolonner, apen_verdi_ore: apne.reduce((s, e) => s + (v.get(e.id) ?? 0), 0), apne: apne.length, tap_grunner: TAP_GRUNNER, prisliste: pl ? { versjon: pl.versjon, eksempel: pl.eksempel } : null };
});

// ── SA3 Eiere og butikker, Kunder ─────────────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/eiere", async ({ db, url }) => {
  const bareKunder = url.searchParams.get("kunder") === "1";
  const idag = idagOslo();
  const pl = await gjeldende(db);
  const eiere = await alle(db.prepare(`SELECT e.*, (SELECT COUNT(*) FROM butikk b WHERE b.eier_id = e.id) AS antall_butikker,
      (SELECT group_concat(b.sted, ' ') FROM butikk b WHERE b.eier_id = e.id) AS butikksteder,
      (SELECT navn FROM kontakt k WHERE k.eier_id = e.id ORDER BY primaer DESC, opprettet LIMIT 1) AS kontakt_navn,
      (SELECT MIN(dato) FROM aktivitet a WHERE a.eier_id = e.id) AS forste_kontakt
    FROM eier e ${bareKunder ? "WHERE e.er_kunde = 1" : ""} ORDER BY e.navn`));
  const v = await verdier(db, eiere, pl);
  return {
    idag, bare_kunder: bareKunder,
    eiere: eiere.map((e) => ({ id: e.id, navn: e.navn, orgnr: e.orgnr, adresse: e.adresse, postnr: e.postnr, sted: e.sted, fylke: e.fylke, kjede: e.kjede, produktlinje: e.produktlinje, status: e.status, er_kunde: e.er_kunde === 1, kilde: e.kilde, antall_butikker: Number(e.antall_butikker), butikksteder: e.butikksteder ?? "", kontakt_navn: e.kontakt_navn, forste_kontakt: e.forste_kontakt, verdi_ore: e.status === "tapt" ? null : v.get(e.id), lead_ny: e.lead_ny === 1 })),
    fylker: [...new Set(eiere.map((e) => e.fylke).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nb")),
    prisliste: pl ? { versjon: pl.versjon, eksempel: pl.eksempel } : null,
  };
});

function lesEierFelt(b, { pakrevd = false } = {}) {
  const ut = {};
  const sett = (k, v) => { if (b[k] !== undefined) ut[k] = v; };
  if (pakrevd || b.navn !== undefined) ut.navn = V.tekst(b.navn, "navn", { maks: 120, pakrevd: true });
  sett("orgnr", V.orgnr(b.orgnr));
  sett("adresse", V.tekst(b.adresse, "adresse", { maks: 200 }));
  sett("postnr", V.tekst(b.postnr, "postnr", { maks: 10 }));
  sett("sted", V.tekst(b.sted, "sted", { maks: 100 }));
  sett("fylke", V.tekst(b.fylke, "fylke", { maks: 60 }));
  sett("kjede", V.valg(b.kjede, "kjede", ["sigdal", "annen"], { standard: "annen" }));
  sett("produktlinje", V.valg(b.produktlinje, "produktlinje", LINJER, { standard: "hengsel" }));
  sett("kilde", V.valg(b.kilde, "kilde", KILDE_KODER));
  sett("neste_tekst", V.tekst(b.neste_tekst, "neste_tekst", { maks: 200 }));
  sett("neste_dato", V.dato(b.neste_dato, "neste_dato"));
  sett("miljo_adresse", V.tekst(b.miljo_adresse, "miljo_adresse", { maks: 200 }));
  sett("miljo_database", V.tekst(b.miljo_database, "miljo_database", { maks: 200 }));
  sett("miljo_tema", V.tekst(b.miljo_tema, "miljo_tema", { maks: 60 }));
  sett("lead_ny", V.flagg(b.lead_ny, "lead_ny"));
  return ut;
}
function lesButikkFelt(b, { pakrevd = false } = {}) {
  const ut = {};
  if (pakrevd || b.navn !== undefined) ut.navn = V.tekst(b.navn, "navn", { maks: 120, pakrevd: true });
  if (b.sted !== undefined) ut.sted = V.tekst(b.sted, "sted", { maks: 100 });
  if (b.pakke !== undefined) ut.pakke = V.valg(b.pakke, "pakke", PAKKER);
  if (b.brukere !== undefined) ut.brukere = V.heltall(b.brukere, "brukere", { maks: 10000 });
  if (b.montorer !== undefined) ut.montorer = V.heltall(b.montorer, "montorer", { maks: 10000 });
  if (b.rekkefolge !== undefined) ut.rekkefolge = V.heltall(b.rekkefolge, "rekkefolge", { maks: 10000 });
  return ut;
}
function lesKontaktFelt(b, { pakrevd = false } = {}) {
  const ut = {};
  if (pakrevd || b.navn !== undefined) ut.navn = V.tekst(b.navn, "navn", { maks: 120, pakrevd: true });
  if (b.rolle !== undefined) ut.rolle = V.tekst(b.rolle, "rolle", { maks: 100 });
  if (b.telefon !== undefined) ut.telefon = V.telefon(b.telefon, "telefon");
  if (b.epost !== undefined) ut.epost = V.epost(b.epost, "epost");
  if (b.signaturrett !== undefined) ut.signaturrett = V.flagg(b.signaturrett, "signaturrett");
  if (b.primaer !== undefined) ut.primaer = V.flagg(b.primaer, "primaer");
  return ut;
}
const oppdater = (db, tabell, id, felt, t) => {
  const nokler = Object.keys(felt);
  return db.prepare(`UPDATE ${tabell} SET ${nokler.map((k) => `${k} = ?`).join(", ")}${nokler.length ? ", " : ""}endret = ? WHERE id = ?`).bind(...nokler.map((k) => felt[k]), t, id);
};

rute("POST", "/api/eiere", async ({ req, db, bruker }) => {
  const b = await V.lesJson(req);
  const felt = lesEierFelt(b, { pakrevd: true });
  const t = naa(), idag = idagOslo();
  if (felt.orgnr && (await db.prepare("SELECT id FROM eier WHERE orgnr = ?").bind(felt.orgnr).first())) throw V.feil("orgnr", "En eier med dette org.nr. finnes fra før.");
  const id = ulid();
  const status = V.valg(b.status, "status", STATUSER, { standard: "ny" });
  const butikker = V.liste(b.butikker, "butikker", { maks: 200 }).map((x, i) => ({ ...lesButikkFelt(x, { pakrevd: true }), rekkefolge: i + 1 }));
  const kontakter = V.liste(b.kontakter, "kontakter", { maks: 50 }).map((x) => lesKontaktFelt(x, { pakrevd: true }));
  const st = [
    db.prepare("INSERT INTO eier (id, navn, orgnr, adresse, postnr, sted, fylke, kjede, produktlinje, status, er_kunde, kilde, neste_tekst, neste_dato, lead_ny, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 0, ?, ?)")
      .bind(id, felt.navn, felt.orgnr ?? null, felt.adresse ?? null, felt.postnr ?? null, felt.sted ?? null, felt.fylke ?? null, felt.kjede ?? "annen", felt.produktlinje ?? "hengsel", status, felt.kilde ?? "annet", felt.neste_tekst ?? (APNE.includes(status) ? "Ta første kontakt" : null), felt.neste_dato ?? (APNE.includes(status) ? idag : null), t, t),
    ...butikker.map((x) => db.prepare("INSERT INTO butikk (id, eier_id, navn, sted, pakke, brukere, montorer, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(ulid(), id, x.navn, x.sted ?? null, x.pakke ?? null, x.brukere ?? null, x.montorer ?? null, x.rekkefolge, t, t)),
    ...kontakter.map((x, i) => db.prepare("INSERT INTO kontakt (id, eier_id, navn, rolle, telefon, epost, signaturrett, primaer, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(ulid(), id, x.navn, x.rolle ?? null, x.telefon ?? null, x.epost ?? null, x.signaturrett ?? 0, x.primaer ?? (i === 0 ? 1 : 0), t, t)),
  ];
  if (butikker.length === 0) st.push(db.prepare("INSERT INTO butikk (id, eier_id, navn, sted, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, 1, ?, ?)").bind(ulid(), id, felt.navn, felt.sted ?? null, t, t));
  if (APNE.includes(status)) st.push(db.prepare("INSERT INTO mulighet (id, eier_id, produktlinje, fase, antall_butikker, aapnet, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(ulid(), id, felt.produktlinje ?? "hengsel", status, Math.max(1, butikker.length), idag, t, t));
  st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, 'Registrert', ?, ?, ?, ?)").bind(ulid(), id, idag, `Kilde: ${KILDER[felt.kilde ?? "annet"]}.`, bruker.navn, t, t));
  await db.batch(st);
  return { id };
});

rute("GET", `/api/eiere/${ULID}`, async ({ db, p, bruker }) => {
  const e = await hentEier(db, p[0]);
  const idag = idagOslo();
  const pl = await gjeldende(db);
  const butikker = await alle(db.prepare("SELECT * FROM butikk WHERE eier_id = ? ORDER BY rekkefolge, navn").bind(e.id));
  const kontakter = await alle(db.prepare("SELECT * FROM kontakt WHERE eier_id = ? ORDER BY primaer DESC, opprettet").bind(e.id));
  const muligheter = await alle(db.prepare("SELECT * FROM mulighet WHERE eier_id = ? ORDER BY lukket IS NOT NULL, aapnet DESC").bind(e.id));
  const tilbud = await alle(db.prepare("SELECT id, nr, versjon, dato, gyldig_til, status, sum_mnd_ore, mva_mnd_ore, produktlinje, prisliste_id, (SELECT versjon FROM prisliste pl WHERE pl.id = tilbud.prisliste_id) AS prisliste_versjon FROM tilbud WHERE eier_id = ? ORDER BY nr DESC, versjon DESC").bind(e.id));
  const avtaler = await alle(db.prepare("SELECT nr, status, per_mnd_ore, start, fornyes, opphorer FROM avtale WHERE eier_id = ? ORDER BY opprettet DESC").bind(e.id));
  const aktiviteter = await alle(db.prepare("SELECT a.*, k.navn AS kontakt_navn FROM aktivitet a LEFT JOIN kontakt k ON k.id = a.kontakt_id WHERE a.eier_id = ? ORDER BY a.dato DESC, a.opprettet DESC").bind(e.id));
  const v = (await verdier(db, [e], pl)).get(e.id);
  const fornyesDager = await tallInnstilling(db, "fornyes_snart_dager", 90);
  // Eierkortet er åpnet: «Ny»-merket fjernes (bare for eier, som er den eneste som kan skrive)
  if (e.lead_ny === 1 && bruker.rolle === "eier") await db.prepare("UPDATE eier SET lead_ny = 0, endret = ? WHERE id = ?").bind(naa(), e.id).run();
  // Pris per butikk med standard oppsett
  let perButikk = [];
  if (pl && butikker.length) {
    try {
      const r = beregn(pl, e.produktlinje, standardOppsett(butikker, pl, e.produktlinje));
      perButikk = r.rader.map((x) => ({ navn: x.navn, pakke: x.pakke, pakke_navn: x.pakkeNavn, sum_ore: x.sum_ore, moduler: x.moduler, inkl_brukere: x.inkl_brukere }));
    } catch { perButikk = []; }
  }
  return {
    idag, eier: { ...e, er_kunde: e.er_kunde === 1, lead_ny: e.lead_ny === 1 }, butikker, kontakter, muligheter, tilbud, aktiviteter, verdi_ore: v, per_butikk: perButikk,
    avtaler: avtaler.map((a) => ({ ...a, visning: avtaleVisning(a, idag, fornyesDager) })),
    prisliste: pl ? { versjon: pl.versjon, eksempel: pl.eksempel, pakker: Object.fromEntries(Object.entries(pl.pakker[e.produktlinje] ?? {}).map(([k, x]) => [k, { navn: x.navn, moduler: x.moduler }])) } : null,
    linje_navn: LINJENAVN[e.produktlinje], tap_grunner: TAP_GRUNNER, forfalt: !!e.neste_dato && e.neste_dato < idag, i_dag: e.neste_dato === idag,
  };
});

rute("PATCH", `/api/eiere/${ULID}`, async ({ req, db, p, bruker }) => {
  const e = await hentEier(db, p[0]);
  const b = await V.lesJson(req);
  const felt = lesEierFelt(b);
  const t = naa(), idag = idagOslo();
  if (felt.orgnr && felt.orgnr !== e.orgnr && (await db.prepare("SELECT id FROM eier WHERE orgnr = ? AND id != ?").bind(felt.orgnr, e.id).first())) throw V.feil("orgnr", "En annen eier har dette org.nr.");
  const st = [];
  let flyttet = null;
  if (b.status !== undefined) {
    const ny = V.valg(b.status, "status", STATUSER, { pakrevd: true });
    if (ny !== e.status) {
      if (e.status === "signert" && e.er_kunde === 1) throw konflikt("En signert kunde flyttes ikke på tavla. Avtalen styrer statusen.");
      if (ny === "tapt") {
        felt.tap_grunn = V.valg(b.tap_grunn, "tap_grunn", TAP_GRUNNER, { pakrevd: true });
        felt.tap_merknad = V.tekst(b.tap_merknad, "tap_merknad", { maks: 500 });
      } else if (e.status === "tapt") { felt.tap_grunn = null; felt.tap_merknad = null; }
      felt.status = ny;
      flyttet = KOLONNER.find(([id]) => id === ny)[1];
      const mulighet = await db.prepare("SELECT id FROM mulighet WHERE eier_id = ? AND lukket IS NULL ORDER BY aapnet DESC LIMIT 1").bind(e.id).first();
      if (mulighet) st.push(db.prepare("UPDATE mulighet SET fase = ?, lukket = ?, endret = ? WHERE id = ?").bind(ny, ny === "tapt" || ny === "signert" ? idag : null, t, mulighet.id));
      else if (APNE.includes(ny)) st.push(db.prepare("INSERT INTO mulighet (id, eier_id, produktlinje, fase, antall_butikker, aapnet, opprettet, endret) VALUES (?, ?, ?, ?, (SELECT MAX(1, COUNT(*)) FROM butikk WHERE eier_id = ?), ?, ?, ?)").bind(ulid(), e.id, e.produktlinje, ny, e.id, idag, t, t));
      if (ny === "tapt") { felt.neste_tekst = null; felt.neste_dato = null; }
    }
  }
  if (Object.keys(felt).length) st.push(oppdater(db, "eier", e.id, felt, t));
  if (flyttet) st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(), e.id, idag, `Flyttet til ${flyttet}`, felt.tap_grunn ? `Grunn: ${felt.tap_grunn}.${felt.tap_merknad ? ` ${felt.tap_merknad}` : ""}` : null, bruker.navn, t, t));
  if (st.length) await db.batch(st);
  return { id: e.id, status: felt.status ?? e.status };
});

rute("DELETE", `/api/eiere/${ULID}`, async ({ db, p }) => {
  const e = await hentEier(db, p[0]);
  const n = await db.prepare("SELECT (SELECT COUNT(*) FROM tilbud WHERE eier_id = ?) + (SELECT COUNT(*) FROM avtale WHERE eier_id = ?) AS n").bind(e.id, e.id).first("n");
  if (Number(n) > 0) throw konflikt("Eieren har tilbud eller avtaler og kan ikke slettes.");
  await db.prepare("DELETE FROM eier WHERE id = ?").bind(e.id).run();
  return { slettet: e.id };
});

rute("POST", `/api/eiere/${ULID}/butikker`, async ({ req, db, p }) => {
  const e = await hentEier(db, p[0]);
  const f = lesButikkFelt(await V.lesJson(req), { pakrevd: true });
  const t = naa(), id = ulid();
  const neste = Number(await db.prepare("SELECT COALESCE(MAX(rekkefolge), 0) + 1 AS n FROM butikk WHERE eier_id = ?").bind(e.id).first("n"));
  await db.prepare("INSERT INTO butikk (id, eier_id, navn, sted, pakke, brukere, montorer, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, e.id, f.navn, f.sted ?? null, f.pakke ?? null, f.brukere ?? null, f.montorer ?? null, f.rekkefolge ?? neste, t, t).run();
  await db.prepare("UPDATE mulighet SET antall_butikker = (SELECT COUNT(*) FROM butikk WHERE eier_id = ?), endret = ? WHERE eier_id = ? AND lukket IS NULL").bind(e.id, t, e.id).run();
  return { id };
});
rute("PATCH", `/api/butikker/${ULID}`, async ({ req, db, p }) => {
  const b = await db.prepare("SELECT id FROM butikk WHERE id = ?").bind(p[0]).first();
  if (!b) throw ikkeFunnet();
  const f = lesButikkFelt(await V.lesJson(req));
  if (Object.keys(f).length) await oppdater(db, "butikk", b.id, f, naa()).run();
  return { id: b.id };
});
rute("DELETE", `/api/butikker/${ULID}`, async ({ db, p }) => {
  const b = await db.prepare("SELECT id, eier_id FROM butikk WHERE id = ?").bind(p[0]).first();
  if (!b) throw ikkeFunnet();
  await db.prepare("DELETE FROM butikk WHERE id = ?").bind(b.id).run();
  await db.prepare("UPDATE mulighet SET antall_butikker = (SELECT MAX(1, COUNT(*)) FROM butikk WHERE eier_id = ?), endret = ? WHERE eier_id = ? AND lukket IS NULL").bind(b.eier_id, naa(), b.eier_id).run();
  return { slettet: b.id };
});

rute("POST", `/api/eiere/${ULID}/kontakter`, async ({ req, db, p }) => {
  const e = await hentEier(db, p[0]);
  const f = lesKontaktFelt(await V.lesJson(req), { pakrevd: true });
  const t = naa(), id = ulid();
  const antall = Number(await db.prepare("SELECT COUNT(*) AS n FROM kontakt WHERE eier_id = ?").bind(e.id).first("n"));
  await db.prepare("INSERT INTO kontakt (id, eier_id, navn, rolle, telefon, epost, signaturrett, primaer, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, e.id, f.navn, f.rolle ?? null, f.telefon ?? null, f.epost ?? null, f.signaturrett ?? 0, f.primaer ?? (antall === 0 ? 1 : 0), t, t).run();
  return { id };
});
rute("PATCH", `/api/kontakter/${ULID}`, async ({ req, db, p }) => {
  const k = await db.prepare("SELECT id FROM kontakt WHERE id = ?").bind(p[0]).first();
  if (!k) throw ikkeFunnet();
  const f = lesKontaktFelt(await V.lesJson(req));
  if (Object.keys(f).length) await oppdater(db, "kontakt", k.id, f, naa()).run();
  return { id: k.id };
});
rute("DELETE", `/api/kontakter/${ULID}`, async ({ db, p }) => {
  const k = await db.prepare("SELECT id FROM kontakt WHERE id = ?").bind(p[0]).first();
  if (!k) throw ikkeFunnet();
  await db.prepare("DELETE FROM kontakt WHERE id = ?").bind(k.id).run();
  return { slettet: k.id };
});

rute("POST", `/api/eiere/${ULID}/muligheter`, async ({ req, db, p }) => {
  const e = await hentEier(db, p[0]);
  const b = await V.lesJson(req);
  const apen = await db.prepare("SELECT id FROM mulighet WHERE eier_id = ? AND lukket IS NULL").bind(e.id).first();
  if (apen) throw konflikt("Eieren har allerede en åpen mulighet (én per eier i fase A).");
  const t = naa(), idag = idagOslo(), id = ulid();
  const linje = V.valg(b.produktlinje, "produktlinje", LINJER, { standard: e.produktlinje });
  const antall = V.heltall(b.antall_butikker, "antall_butikker", { min: 1, maks: 1000, standard: null }) ?? Math.max(1, Number(await db.prepare("SELECT COUNT(*) AS n FROM butikk WHERE eier_id = ?").bind(e.id).first("n")));
  const fase = APNE.includes(e.status) ? e.status : "ny";
  await db.batch([
    db.prepare("INSERT INTO mulighet (id, eier_id, produktlinje, fase, antall_butikker, aapnet, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, e.id, linje, fase, antall, idag, t, t),
    db.prepare("UPDATE eier SET status = ?, tap_grunn = NULL, tap_merknad = NULL, neste_tekst = COALESCE(neste_tekst, 'Ta kontakt'), neste_dato = COALESCE(neste_dato, ?), endret = ? WHERE id = ?").bind(fase, idag, t, e.id),
  ]);
  return { id };
});
rute("PATCH", `/api/muligheter/${ULID}`, async ({ req, db, p }) => {
  const m = await db.prepare("SELECT * FROM mulighet WHERE id = ?").bind(p[0]).first();
  if (!m) throw ikkeFunnet();
  const b = await V.lesJson(req);
  const f = {};
  if (b.produktlinje !== undefined) f.produktlinje = V.valg(b.produktlinje, "produktlinje", LINJER, { pakrevd: true });
  if (b.antall_butikker !== undefined) f.antall_butikker = V.heltall(b.antall_butikker, "antall_butikker", { min: 1, maks: 1000, pakrevd: true });
  if (b.verdi_mnd_ore !== undefined) f.verdi_mnd_ore = V.heltall(b.verdi_mnd_ore, "verdi_mnd_ore", { maks: 1e12 });
  if (Object.keys(f).length) await oppdater(db, "mulighet", m.id, f, naa()).run();
  return { id: m.id };
});

// ── SA8 Ny aktivitet ──────────────────────────────────────────────────────────────────────────────────────────────────────────
rute("POST", "/api/aktiviteter", async ({ req, db, bruker }) => {
  const b = await V.lesJson(req);
  const e = await hentEier(db, V.id(b.eier_id, "eier_id"));
  const type = V.valg(b.type, "type", AKTIVITETSTYPER, { pakrevd: true });
  const tittel = V.tekst(b.tittel, "tittel", { maks: 200, pakrevd: true });
  const tekst = V.tekst(b.tekst, "tekst", { maks: 4000, linjeskift: true });
  const dato = V.dato(b.dato, "dato") ?? idagOslo();
  const nesteTekst = V.tekst(b.neste_tekst, "neste_tekst", { maks: 200 });
  const nesteDato = V.dato(b.neste_dato, "neste_dato");
  if (nesteTekst && !nesteDato) throw V.feil("neste_dato", "Sett en dato for neste steg.");
  if (nesteDato && !nesteTekst) throw V.feil("neste_tekst", "Skriv hva neste steg er.");
  let kontaktId = null;
  if (b.kontakt_id) { kontaktId = V.id(b.kontakt_id, "kontakt_id"); if (!(await db.prepare("SELECT id FROM kontakt WHERE id = ? AND eier_id = ?").bind(kontaktId, e.id).first())) throw V.feil("kontakt_id", "Kontakten hører ikke til eieren."); }
  const mulighet = await db.prepare("SELECT id FROM mulighet WHERE eier_id = ? AND lukket IS NULL ORDER BY aapnet DESC LIMIT 1").bind(e.id).first();
  const t = naa(), id = ulid();
  const st = [db.prepare("INSERT INTO aktivitet (id, eier_id, kontakt_id, mulighet_id, type, dato, tittel, tekst, hvem, neste_tekst, neste_dato, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, e.id, kontaktId, mulighet ? mulighet.id : null, type, dato, tittel, tekst, bruker.navn, nesteTekst, nesteDato, t, t)];
  // Lagring setter eier.neste_* (60-213 punkt d)
  if (nesteTekst) st.push(db.prepare("UPDATE eier SET neste_tekst = ?, neste_dato = ?, endret = ? WHERE id = ?").bind(nesteTekst, nesteDato, t, e.id));
  await db.batch(st);
  return { id };
});

// ── SA5/SA6 Tilbud ────────────────────────────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/prisliste/gjeldende", async ({ db }) => {
  const pl = await gjeldende(db);
  if (!pl) throw new ApiFeil(404, "ADM-404", "Ingen prisliste finnes. Lag en under Innstillinger › Prisliste.");
  return { prisliste: pl, linjenavn: LINJENAVN, tilbud_gyldig_dager: await tallInnstilling(db, "tilbud_gyldig_dager", 14) };
});

/** Leser og regner et tilbud fra kroppen: { eier_id, produktlinje, butikker, tillegg, kontakt_id } */
async function lesTilbudGrunnlag(db, b) {
  const e = await hentEier(db, V.id(b.eier_id, "eier_id"));
  const pl = await gjeldende(db);
  if (!pl) throw new ApiFeil(409, "ADM-409", "Ingen prisliste finnes.");
  const linje = V.valg(b.produktlinje, "produktlinje", LINJER, { standard: e.produktlinje });
  const butikker = V.liste(b.butikker, "butikker", { maks: 200 }).map((x, i) => ({
    navn: V.tekst(x.navn, `butikker.${i}.navn`, { maks: 120, pakrevd: true }), pakke: V.valg(x.pakke, `butikker.${i}.pakke`, PAKKER, { pakrevd: true }),
    brukere: V.heltall(x.brukere, `butikker.${i}.brukere`, { maks: 10000, standard: 0 }), montorer: V.heltall(x.montorer, `butikker.${i}.montorer`, { maks: 10000, standard: 0 }),
  }));
  if (!butikker.length) throw V.feil("butikker", "Legg til minst én butikk.");
  const tillegg = V.liste(b.tillegg, "tillegg", { maks: 20 }).map((k) => V.valg(k, "tillegg", pl.tillegg.map((t) => t.kode), { pakrevd: true }));
  let kontakt = null;
  if (b.kontakt_id) kontakt = await db.prepare("SELECT * FROM kontakt WHERE id = ? AND eier_id = ?").bind(V.id(b.kontakt_id, "kontakt_id"), e.id).first();
  if (!kontakt) kontakt = await db.prepare("SELECT * FROM kontakt WHERE eier_id = ? ORDER BY signaturrett DESC, primaer DESC, opprettet LIMIT 1").bind(e.id).first();
  return { e, pl, linje, butikker, tillegg, kontakt, resultat: beregn(pl, linje, butikker, { tillegg }) };
}

rute("POST", "/api/tilbud/beregn", async ({ req, db }) => {
  const { resultat, pl } = await lesTilbudGrunnlag(db, await V.lesJson(req));
  return { resultat, prisliste: { versjon: pl.versjon, eksempel: pl.eksempel } };
});

rute("POST", "/api/tilbud", async ({ req, db, bruker }) => {
  const b = await V.lesJson(req);
  const { e, pl, linje, butikker, tillegg, kontakt, resultat: r } = await lesTilbudGrunnlag(db, b);
  const t = naa(), idag = idagOslo();
  const gyldig = await tallInnstilling(db, "tilbud_gyldig_dager", 14);
  const lev = (await innstilling(db, "leverandor", {})).verdi ?? {};
  let mulighet = await db.prepare("SELECT * FROM mulighet WHERE eier_id = ? AND lukket IS NULL ORDER BY aapnet DESC LIMIT 1").bind(e.id).first();
  const st = [];
  if (!mulighet) {
    const fase = APNE.includes(e.status) ? e.status : "tilbud";
    mulighet = { id: ulid(), fase };
    st.push(db.prepare("INSERT INTO mulighet (id, eier_id, produktlinje, fase, antall_butikker, aapnet, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(mulighet.id, e.id, linje, fase, butikker.length, idag, t, t));
    if (!APNE.includes(e.status)) st.push(db.prepare("UPDATE eier SET status = 'tilbud', tap_grunn = NULL, tap_merknad = NULL, endret = ? WHERE id = ?").bind(t, e.id));
  }
  const forrige = await db.prepare("SELECT id, nr, versjon FROM tilbud WHERE mulighet_id = ? ORDER BY versjon DESC LIMIT 1").bind(mulighet.id).first();
  const nr = forrige ? forrige.nr : await nesteNr(db, "T", Number(idag.slice(0, 4)));
  const versjon = forrige ? Number(forrige.versjon) + 1 : 1;
  const id = ulid();
  st.push(db.prepare(`INSERT INTO tilbud (id, nr, versjon, mulighet_id, eier_id, kontakt_id, prisliste_id, produktlinje, dato, gyldig_til, status, erstatter_id, leverandor_json, sum_mnd_ore, mva_mnd_ore, rabatt_prosent, rabatt_ore, etablering_ore, opprettet, endret)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'utkast', ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, nr, versjon, mulighet.id, e.id, kontakt ? kontakt.id : null, pl.id, linje, idag, pluss(idag, gyldig), forrige ? forrige.id : null, JSON.stringify(lev), r.netto_ore, r.mva_ore, r.rabatt_prosent, r.rabatt_ore, r.etablering_ore, t, t));
  for (const l of r.linjer) st.push(db.prepare("INSERT INTO tilbudslinje (id, tilbud_id, rekkefolge, type, butikk_navn, pakke, antall, enhetspris_ore, belop_ore, rabatterbar, tekst, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ulid(), id, l.rekkefolge, l.type, l.butikk_navn, l.pakke, l.antall, l.enhetspris_ore, l.belop_ore, l.rabatterbar, l.tekst, t, t));
  if (forrige) st.push(db.prepare("UPDATE tilbud SET status = 'erstattet', endret = ? WHERE mulighet_id = ? AND id != ? AND status IN ('utkast', 'sendt')").bind(t, mulighet.id, id));
  st.push(db.prepare("UPDATE mulighet SET verdi_mnd_ore = ?, produktlinje = ?, antall_butikker = ?, endret = ? WHERE id = ?").bind(r.netto_ore, linje, butikker.length, t, mulighet.id));
  st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, kontakt_id, mulighet_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, ?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(), e.id, kontakt ? kontakt.id : null, mulighet.id, idag, `Tilbud ${nr} v${versjon} laget`, `${LINJENAVN[linje]}, ${butikker.length} ${butikker.length === 1 ? "butikk" : "butikker"}, prisliste ${pl.versjon}.`, bruker.navn, t, t));
  await db.batch(st);
  return { id, nr, versjon, pdf: `/salg/tilbud/${nr}/${versjon}.pdf`, sum_mnd_ore: r.netto_ore, prisliste: pl.versjon };
});

/** Tilbud som kan bli avtale: sendt eller utkast, siste versjon, uten avtale fra før */
rute("GET", "/api/tilbud", async ({ db, url }) => {
  const utenAvtale = url.searchParams.get("uten_avtale") === "1";
  const tilbud = await alle(db.prepare(`SELECT t.id, t.nr, t.versjon, t.dato, t.status, t.sum_mnd_ore, t.produktlinje, e.navn AS eier_navn, e.id AS eier_id, (SELECT nr FROM avtale a WHERE a.tilbud_id = t.id) AS avtale_nr
    FROM tilbud t JOIN eier e ON e.id = t.eier_id WHERE t.status IN ('utkast', 'sendt') ${utenAvtale ? "AND NOT EXISTS (SELECT 1 FROM avtale a WHERE a.tilbud_id = t.id)" : ""} ORDER BY t.dato DESC, t.nr DESC`));
  return { tilbud: tilbud.map((t) => ({ ...t, sum_mnd_ore: Number(t.sum_mnd_ore) })) };
});

rute("GET", `/api/tilbud/${ULID}`, async ({ db, p }) => {
  const t = await db.prepare("SELECT * FROM tilbud WHERE id = ?").bind(p[0]).first();
  if (!t) throw ikkeFunnet();
  const linjer = await alle(db.prepare("SELECT * FROM tilbudslinje WHERE tilbud_id = ? ORDER BY rekkefolge").bind(t.id));
  return { tilbud: { ...t, leverandor: JSON.parse(t.leverandor_json) }, linjer, pdf: `/salg/tilbud/${t.nr}/${t.versjon}.pdf` };
});

rute("PATCH", `/api/tilbud/${ULID}`, async ({ req, db, p, bruker }) => {
  const t = await db.prepare("SELECT * FROM tilbud WHERE id = ?").bind(p[0]).first();
  if (!t) throw ikkeFunnet();
  const b = await V.lesJson(req);
  const status = V.valg(b.status, "status", ["utkast", "sendt"], { pakrevd: true });
  if (t.status === "erstattet" || t.status === "akseptert") throw konflikt(`Tilbudet er ${t.status} og kan ikke endres.`);
  const tid = naa();
  const st = [db.prepare("UPDATE tilbud SET status = ?, endret = ? WHERE id = ?").bind(status, tid, t.id)];
  if (status === "sendt" && t.status !== "sendt") st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, kontakt_id, mulighet_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, ?, ?, 'epost', ?, ?, ?, ?, ?, ?)").bind(ulid(), t.eier_id, t.kontakt_id, t.mulighet_id, idagOslo(), `Tilbud ${t.nr} v${t.versjon} sendt`, null, bruker.navn, tid, tid));
  await db.batch(st);
  return { id: t.id, status };
});

/** GET /salg/tilbud/:nr/:versjon.pdf */
export async function tilbudPdf(env, nr, versjon, { hentLogo } = {}) {
  try {
    if (!env.DB) throw new ApiFeil(503, "ADM-504", "Databasen er ikke koblet til.");
    const db = env.DB;
    const t = await db.prepare("SELECT * FROM tilbud WHERE nr = ? AND versjon = ?").bind(nr, versjon).first();
    if (!t) throw ikkeFunnet("Tilbudet finnes ikke.");
    const linjer = await alle(db.prepare("SELECT * FROM tilbudslinje WHERE tilbud_id = ? ORDER BY rekkefolge").bind(t.id));
    const eier = await db.prepare("SELECT * FROM eier WHERE id = ?").bind(t.eier_id).first();
    const kontakt = t.kontakt_id ? await db.prepare("SELECT * FROM kontakt WHERE id = ?").bind(t.kontakt_id).first() : null;
    const plr = await prislisteMedRader(db, t.prisliste_id);
    const pl = normaliserPrisliste(plr.pl, plr.rader);
    const maler = await alle(db.prepare("SELECT navn, versjon FROM avtalemal WHERE status = 'aktiv' ORDER BY opprettet"));
    const erstatter = t.erstatter_id ? await db.prepare("SELECT versjon, dato FROM tilbud WHERE id = ?").bind(t.erstatter_id).first() : null;
    const lev = JSON.parse(t.leverandor_json);
    const levInnst = await innstilling(db, "leverandor", {});
    const pakker = pl.pakker[t.produktlinje] ?? {};
    const support = linjer.filter((l) => l.type === "pakke").reduce((s, l) => s + (pakker[l.pakke]?.support_timer ?? 0), 0);
    const mva = pl.mva_prosent;
    const aar = Number(t.sum_mnd_ore) * 12;
    const data = {
      tilbud: { ...t, sum_mnd_ore: Number(t.sum_mnd_ore), mva_mnd_ore: Number(t.mva_mnd_ore) }, linjer, eier, kontakt, leverandor: lev, prisliste: pl,
      avtalemaler: maler, erstatter, support_timer: support, linjeNavn: LINJENAVN[t.produktlinje], linjeMerknad: Object.values(pakker)[0]?.merknad ?? "",
      antall_butikker: linjer.filter((l) => l.type === "pakke").length, pakkeNavn: Object.fromEntries(Object.entries(pakker).map(([k, v]) => [k, v.navn])),
      aar_ore: aar, aar_mva_ore: Math.round((aar * mva) / 100), etablering_mva_ore: Math.round((Number(t.etablering_ore) * mva) / 100), etablering_inkl_ore: Number(t.etablering_ore) + Math.round((Number(t.etablering_ore) * mva) / 100),
      eksempel: pl.eksempel || levInnst.eksempel, farger: PDF_FARGER, logoSvg: hentLogo ? await hentLogo() : null,
    };
    const bytes = lagTilbudPdf(data);
    return new Response(bytes, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="tilbud-${nr}-v${versjon}.pdf"`, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive", "X-Content-Type-Options": "nosniff" } });
  } catch (e) {
    if (e instanceof ApiFeil) return new Response(`${e.kode}: ${e.message}\n`, { status: e.status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" } });
    console.error("pdf:", e && e.message);
    return new Response("ADM-504: Kunne ikke lage PDF.\n", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" } });
  }
}

// ── SA7 Avtaler ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
function avtaleVisning(a, idag, fornyesDager) {
  if (a.status === "signert" && a.fornyes && a.fornyes >= idag && dagerMellom(idag, a.fornyes) <= fornyesDager) return "fornyes_snart";
  return a.status;
}

rute("GET", "/api/avtaler", async ({ db, env }) => {
  const idag = idagOslo();
  const fornyesDager = await tallInnstilling(db, "fornyes_snart_dager", 90);
  const avtaler = await alle(db.prepare("SELECT a.*, e.navn AS eier_navn FROM avtale a JOIN eier e ON e.id = a.eier_id ORDER BY a.opprettet DESC"));
  return { idag, fornyes_snart_dager: fornyesDager, penneo_koblet: penneo.erKoblet(env), avtaler: avtaler.map((a) => ({ nr: a.nr, eier_id: a.eier_id, eier_navn: a.eier_navn, status: a.status, visning: avtaleVisning(a, idag, fornyesDager), per_mnd_ore: Number(a.per_mnd_ore), start: a.start, fornyes: a.fornyes, opphorer: a.opphorer, binding_mnd: a.binding_mnd, oppsigelse_mnd: a.oppsigelse_mnd })) };
});

async function hentAvtale(db, nr) {
  const a = await db.prepare("SELECT a.*, e.navn AS eier_navn, e.produktlinje FROM avtale a JOIN eier e ON e.id = a.eier_id WHERE a.nr = ?").bind(nr).first();
  if (!a) throw ikkeFunnet("Avtalen finnes ikke.");
  return a;
}

rute("GET", `/api/avtaler/${AVTALE}`, async ({ db, p, env }) => {
  const a = await hentAvtale(db, p[0]);
  const idag = idagOslo();
  const fornyesDager = await tallInnstilling(db, "fornyes_snart_dager", 90);
  const signatarer = await alle(db.prepare("SELECT * FROM signatar WHERE avtale_id = ? ORDER BY rekkefolge").bind(a.id));
  const dokumenter = await alle(db.prepare("SELECT d.rekkefolge, m.navn, m.versjon, m.gjelder_fra, m.eksempel FROM avtaledokument d JOIN avtalemal m ON m.id = d.avtalemal_id WHERE d.avtale_id = ? ORDER BY d.rekkefolge").bind(a.id));
  const tilbud = a.tilbud_id ? await db.prepare("SELECT id, nr, versjon, dato, status FROM tilbud WHERE id = ?").bind(a.tilbud_id).first() : null;
  const pl = await db.prepare("SELECT versjon, status, eksempel FROM prisliste WHERE id = ?").bind(a.prisliste_id).first();
  return {
    idag, penneo_koblet: penneo.erKoblet(env),
    avtale: { ...a, leverandor: JSON.parse(a.leverandor_json), per_mnd_ore: Number(a.per_mnd_ore), visning: avtaleVisning(a, idag, fornyesDager), linje_navn: LINJENAVN[a.produktlinje] },
    signatarer, dokumenter, tilbud, prisliste: pl, ventetekst: penneo.ventetekst(signatarer), neste_signatar: penneo.nesteSomVenter(signatarer)?.rekkefolge ?? null,
    pdf: tilbud ? `/salg/tilbud/${tilbud.nr}/${tilbud.versjon}.pdf` : null,
  };
});

rute("POST", "/api/avtaler", async ({ req, db, bruker }) => {
  const b = await V.lesJson(req);
  const t = await db.prepare("SELECT * FROM tilbud WHERE id = ?").bind(V.id(b.tilbud_id, "tilbud_id")).first();
  if (!t) throw ikkeFunnet("Tilbudet finnes ikke.");
  if (t.status === "erstattet") throw konflikt("Tilbudet er erstattet av en nyere versjon.");
  const finnes = await db.prepare("SELECT nr FROM avtale WHERE tilbud_id = ?").bind(t.id).first();
  if (finnes) throw konflikt(`Avtale ${finnes.nr} er allerede laget fra dette tilbudet.`);
  const e = await hentEier(db, t.eier_id);
  const pl = await db.prepare("SELECT * FROM prisliste WHERE id = ?").bind(t.prisliste_id).first();
  const lev = (await innstilling(db, "leverandor", {})).verdi ?? {};
  const kunde = await db.prepare("SELECT * FROM kontakt WHERE eier_id = ? ORDER BY signaturrett DESC, primaer DESC, opprettet LIMIT 1").bind(e.id).first();
  if (!kunde) throw konflikt("Eieren har ingen kontakt som kan signere. Legg til en kontakt med signaturrett.");
  const maler = await alle(db.prepare("SELECT id FROM avtalemal WHERE status = 'aktiv' ORDER BY opprettet"));
  const tid = naa(), idag = idagOslo();
  const start = V.dato(b.start, "start") ?? forsteINesteMnd(idag);
  const nr = await nesteNr(db, "A", Number(idag.slice(0, 4)));
  const id = ulid();
  const st = [
    db.prepare("INSERT INTO avtale (id, nr, eier_id, tilbud_id, status, leverandor_json, binding_mnd, oppsigelse_mnd, start, fornyes, prisjustering, per_mnd_ore, prisliste_id, opprettet, endret) VALUES (?, ?, ?, ?, 'utkast', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, nr, e.id, t.id, JSON.stringify(lev), pl.binding_mnd, pl.oppsigelse_mnd ?? 3, start, plussMnd(start, Number(pl.binding_mnd)), pl.prisjustering, t.sum_mnd_ore, pl.id, tid, tid),
    db.prepare("INSERT INTO signatar (id, avtale_id, rekkefolge, part, navn, epost, rolle, status, opprettet, endret) VALUES (?, ?, 1, 'kunde', ?, ?, ?, 'ikke_sendt', ?, ?)").bind(ulid(), id, kunde.navn, kunde.epost ?? "", `${e.navn} · signaturrett`, tid, tid),
    db.prepare("INSERT INTO signatar (id, avtale_id, rekkefolge, part, navn, epost, rolle, status, opprettet, endret) VALUES (?, ?, 2, 'leverandor', ?, ?, ?, 'ikke_sendt', ?, ?)").bind(ulid(), id, lev.signatar || "Leverandøren", lev.signatar_epost || "", `${lev.navn || "Leverandør"} · ${lev.signatar_rolle || "leverandør"}`, tid, tid),
    ...maler.map((m, i) => db.prepare("INSERT INTO avtaledokument (id, avtale_id, avtalemal_id, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?)").bind(ulid(), id, m.id, i + 1, tid, tid)),
    db.prepare("INSERT INTO aktivitet (id, eier_id, mulighet_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(), e.id, t.mulighet_id, idag, `Avtale ${nr} laget fra tilbud ${t.nr} v${t.versjon}`, null, bruker.navn, tid, tid),
  ];
  await db.batch(st);
  return { nr, id };
});

rute("POST", `/api/avtaler/${AVTALE}/send`, async ({ db, p, env, bruker }) => {
  const a = await hentAvtale(db, p[0]);
  if (a.status !== "utkast") throw konflikt("Bare et utkast kan sendes til signering.");
  const signatarer = await alle(db.prepare("SELECT * FROM signatar WHERE avtale_id = ? ORDER BY rekkefolge").bind(a.id));
  const tid = naa();
  const nye = penneo.startSignering(signatarer, tid);
  let penneoSak = null;
  if (penneo.erKoblet(env)) {
    const dok = await alle(db.prepare("SELECT m.navn, m.versjon FROM avtaledokument d JOIN avtalemal m ON m.id = d.avtalemal_id WHERE d.avtale_id = ? ORDER BY d.rekkefolge").bind(a.id));
    try { penneoSak = await new penneo.PenneoKlient(env).opprettSak({ avtale: a, signatarer: nye, dokumenter: dok }); }
    catch (e) { throw new ApiFeil(502, "ADM-502", `Penneo svarte ikke: ${e.message}`); }
  }
  const st = nye.map((s) => db.prepare("UPDATE signatar SET status = ?, sendt = ?, signert = NULL, penneo_id = ?, endret = ? WHERE id = ?").bind(s.status, s.sendt, penneoSak ? penneoSak.signatarIder[s.rekkefolge] ?? null : null, tid, s.id));
  st.push(db.prepare("UPDATE avtale SET status = 'signering', penneo_sak_id = ?, endret = ? WHERE id = ?").bind(penneoSak ? penneoSak.sakId : null, tid, a.id));
  st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'epost', ?, ?, ?, ?, ?, ?)").bind(ulid(), a.eier_id, idagOslo(), `Avtale ${a.nr} sendt til signering`, penneoSak ? "Via Penneo. Kunden signerer først." : "Penneo er ikke koblet til. Kunden signerer først, og signeringen registreres for hånd.", bruker.navn, tid, tid));
  await db.batch(st);
  return { nr: a.nr, status: "signering", penneo: !!penneoSak };
});

rute("POST", `/api/avtaler/${AVTALE}/signert`, async ({ req, db, p, bruker }) => {
  const a = await hentAvtale(db, p[0]);
  if (a.status !== "signering") throw konflikt("Avtalen er ikke til signering.");
  const b = await V.lesJson(req);
  const rekkefolge = V.heltall(b.rekkefolge, "rekkefolge", { min: 1, maks: 9, pakrevd: true });
  const signatarer = await alle(db.prepare("SELECT * FROM signatar WHERE avtale_id = ? ORDER BY rekkefolge").bind(a.id));
  const tid = naa(), idag = idagOslo();
  let res;
  try { res = penneo.registrerSignert(signatarer, rekkefolge, tid); } catch (e) { throw konflikt(e.message); }
  const st = res.signatarer.map((s) => db.prepare("UPDATE signatar SET status = ?, sendt = ?, signert = ?, endret = ? WHERE id = ?").bind(s.status, s.sendt ?? null, s.signert ?? null, tid, s.id));
  const hvem = res.signatarer.find((s) => s.rekkefolge === rekkefolge);
  if (res.alleSignert) {
    // Når begge har signert: avtale = signert, tilbudet = akseptert, eier og mulighet = signert, eier.er_kunde = 1 (60-213 punkt g)
    const start = a.start ?? forsteINesteMnd(idag);
    st.push(db.prepare("UPDATE avtale SET status = 'signert', signert_tid = ?, start = ?, fornyes = ?, endret = ? WHERE id = ?").bind(tid, start, plussMnd(start, Number(a.binding_mnd)), tid, a.id));
    if (a.tilbud_id) st.push(db.prepare("UPDATE tilbud SET status = 'akseptert', endret = ? WHERE id = ?").bind(tid, a.tilbud_id));
    st.push(db.prepare("UPDATE eier SET status = 'signert', er_kunde = 1, tap_grunn = NULL, tap_merknad = NULL, neste_tekst = NULL, neste_dato = NULL, endret = ? WHERE id = ?").bind(tid, a.eier_id));
    st.push(db.prepare("UPDATE mulighet SET fase = 'signert', lukket = ?, endret = ? WHERE eier_id = ? AND lukket IS NULL").bind(idag, tid, a.eier_id));
    st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(), a.eier_id, idag, `Avtale ${a.nr} signert av begge`, "Eieren er nå kunde.", bruker.navn, tid, tid));
  } else {
    st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(), a.eier_id, idag, `${hvem.navn} har signert ${a.nr}`, "Venter på leverandøren.", bruker.navn, tid, tid));
  }
  await db.batch(st);
  return { nr: a.nr, status: res.alleSignert ? "signert" : "signering", alle_signert: res.alleSignert };
});

rute("POST", `/api/avtaler/${AVTALE}/paaminnelse`, async ({ db, p, env, bruker }) => {
  const a = await hentAvtale(db, p[0]);
  if (a.status !== "signering") throw konflikt("Avtalen er ikke til signering.");
  const signatarer = await alle(db.prepare("SELECT * FROM signatar WHERE avtale_id = ? ORDER BY rekkefolge").bind(a.id));
  const venter = penneo.nesteSomVenter(signatarer);
  if (!venter) throw konflikt("Ingen venter på å signere.");
  let levert = false;
  if (penneo.erKoblet(env) && a.penneo_sak_id && venter.penneo_id) {
    try { await new penneo.PenneoKlient(env).sendPaaminnelse(a.penneo_sak_id, venter.penneo_id); levert = true; } catch (e) { throw new ApiFeil(502, "ADM-502", `Penneo svarte ikke: ${e.message}`); }
  }
  const tid = naa();
  await db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'epost', ?, ?, ?, ?, ?, ?)").bind(ulid(), a.eier_id, idagOslo(), `Påminnelse om ${a.nr} til ${venter.navn}`, levert ? "Sendt via Penneo." : "Penneo er ikke koblet til. Påminnelsen må sendes for hånd.", bruker.navn, tid, tid).run();
  return { nr: a.nr, til: venter.navn, levert, melding: levert ? "Påminnelse sendt." : "Penneo er ikke koblet til. Send påminnelsen for hånd." };
});

rute("PATCH", `/api/avtaler/${AVTALE}`, async ({ req, db, p, bruker }) => {
  const a = await hentAvtale(db, p[0]);
  const b = await V.lesJson(req);
  const f = {};
  if (b.status !== undefined) {
    const ny = V.valg(b.status, "status", ["sagt_opp"], { pakrevd: true });
    if (a.status !== "signert") throw konflikt("Bare en signert avtale kan sies opp.");
    f.status = ny;
    f.opphorer = V.dato(b.opphorer, "opphorer") ?? a.fornyes ?? plussMnd(idagOslo(), Number(a.oppsigelse_mnd));
  }
  if (b.start !== undefined && a.status === "utkast") { f.start = V.dato(b.start, "start", { pakrevd: true }); f.fornyes = plussMnd(f.start, Number(a.binding_mnd)); }
  if (b.signert_pdf_nokkel !== undefined) f.signert_pdf_nokkel = V.tekst(b.signert_pdf_nokkel, "signert_pdf_nokkel", { maks: 300 });
  const tid = naa();
  const st = [];
  if (Object.keys(f).length) st.push(oppdater(db, "avtale", a.id, f, tid));
  if (f.status === "sagt_opp") st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(), a.eier_id, idagOslo(), `Avtale ${a.nr} sagt opp`, `Opphører ${f.opphorer}.`, bruker.navn, tid, tid));
  if (st.length) await db.batch(st);
  return { nr: a.nr, ...f };
});

// ── SA9 Prisliste og leverandør ───────────────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/prisliste", async ({ db }) => {
  const versjoner = await alle(db.prepare("SELECT p.*, (SELECT COUNT(*) FROM tilbud t WHERE t.prisliste_id = p.id) AS antall_tilbud FROM prisliste p ORDER BY gjelder_fra DESC, versjon DESC"));
  const gj = await gjeldende(db);
  return { versjoner: versjoner.map((p) => ({ ...p, eksempel: p.eksempel === 1, antall_tilbud: Number(p.antall_tilbud) })), gjeldende: gj, linjenavn: LINJENAVN };
});

rute("GET", `/api/prisliste/${ULID}`, async ({ db, p }) => {
  const r = await prislisteMedRader(db, p[0]);
  if (!r) throw ikkeFunnet();
  const antallTilbud = Number(await db.prepare("SELECT COUNT(*) AS n FROM tilbud WHERE prisliste_id = ?").bind(p[0]).first("n"));
  return { prisliste: normaliserPrisliste(r.pl, r.rader), rader: r.rader, antall_tilbud: antallTilbud, linjenavn: LINJENAVN };
});

rute("POST", "/api/prisliste", async ({ req, db }) => {
  const b = await V.lesJson(req);
  const versjon = V.tekst(b.versjon, "versjon", { maks: 20, pakrevd: true });
  if (!/^\d{4}\.\d{1,2}$/.test(versjon)) throw V.feil("versjon", "Skriv versjon som 2027.1.");
  if (await db.prepare("SELECT id FROM prisliste WHERE versjon = ?").bind(versjon).first()) throw V.feil("versjon", "Versjonen finnes fra før.");
  const gjelderFra = V.dato(b.gjelder_fra, "gjelder_fra", { pakrevd: true });
  const kilde = b.kopier_fra ? await prislisteMedRader(db, V.id(b.kopier_fra, "kopier_fra")) : (async () => { const g = await gjeldendePrislisteRad(db); return g ? prislisteMedRader(db, g.id) : null; })();
  const k = await kilde;
  const t = naa(), id = ulid();
  const st = [db.prepare("INSERT INTO prisliste (id, versjon, gjelder_fra, status, binding_mnd, oppsigelse_mnd, prisjustering, viderefakturering_prosent, mva_prosent, rabatt_gjelder, eksempel, opprettet, endret) VALUES (?, ?, ?, 'utkast', ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, versjon, gjelderFra, k?.pl.binding_mnd ?? 12, k?.pl.oppsigelse_mnd ?? 3, k?.pl.prisjustering ?? "kpi", k?.pl.viderefakturering_prosent ?? 15, k?.pl.mva_prosent ?? 25, k?.pl.rabatt_gjelder ?? '["pakke","ekstra_brukere","ute"]', k ? k.pl.eksempel : 1, t, t)];
  for (const r of k?.rader ?? []) st.push(db.prepare("INSERT INTO prislisterad (id, prisliste_id, type, produktlinje, kode, navn, pris_ore, inkl_brukere, ekstra_bruker_ore, support_timer, etablering_ore, moduler, maks_antall, inkludert_regel, merknad, fra_butikker, prosent, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ulid(), id, r.type, r.produktlinje, r.kode, r.navn, r.pris_ore, r.inkl_brukere, r.ekstra_bruker_ore, r.support_timer, r.etablering_ore, r.moduler, r.maks_antall, r.inkludert_regel, r.merknad, r.fra_butikker, r.prosent, t, t));
  await db.batch(st);
  return { id, versjon };
});

rute("PATCH", `/api/prisliste/${ULID}`, async ({ req, db, p }) => {
  const pl = await db.prepare("SELECT * FROM prisliste WHERE id = ?").bind(p[0]).first();
  if (!pl) throw ikkeFunnet();
  if (pl.status !== "utkast") throw konflikt("Bare et utkast kan endres. Aktiv og arkivert er låst; lag en ny versjon.");
  const b = await V.lesJson(req);
  const f = {};
  if (b.versjon !== undefined) { f.versjon = V.tekst(b.versjon, "versjon", { maks: 20, pakrevd: true }); if (!/^\d{4}\.\d{1,2}$/.test(f.versjon)) throw V.feil("versjon", "Skriv versjon som 2027.1."); }
  if (b.gjelder_fra !== undefined) f.gjelder_fra = V.dato(b.gjelder_fra, "gjelder_fra", { pakrevd: true });
  if (b.binding_mnd !== undefined) f.binding_mnd = V.heltall(b.binding_mnd, "binding_mnd", { min: 1, maks: 120, pakrevd: true });
  if (b.oppsigelse_mnd !== undefined) f.oppsigelse_mnd = V.heltall(b.oppsigelse_mnd, "oppsigelse_mnd", { min: 0, maks: 24, pakrevd: true });
  if (b.viderefakturering_prosent !== undefined) f.viderefakturering_prosent = prosent(b.viderefakturering_prosent, "viderefakturering_prosent");
  if (b.mva_prosent !== undefined) f.mva_prosent = prosent(b.mva_prosent, "mva_prosent");
  if (b.eksempel !== undefined) f.eksempel = V.flagg(b.eksempel, "eksempel");
  const t = naa();
  const st = [];
  if (Object.keys(f).length) st.push(oppdater(db, "prisliste", pl.id, f, t));
  for (const r of V.liste(b.rader, "rader", { maks: 100 })) {
    const rad = await db.prepare("SELECT id, type FROM prislisterad WHERE id = ? AND prisliste_id = ?").bind(V.id(r.id, "rader.id"), pl.id).first();
    if (!rad) throw V.feil("rader", "Raden hører ikke til prislisten.");
    const g = {};
    for (const k of ["pris_ore", "ekstra_bruker_ore", "etablering_ore"]) if (r[k] !== undefined) g[k] = V.heltall(r[k], k, { maks: 1e9 });
    for (const k of ["inkl_brukere", "support_timer", "maks_antall", "fra_butikker"]) if (r[k] !== undefined) g[k] = V.heltall(r[k], k, { maks: 100000 });
    if (r.prosent !== undefined) g.prosent = prosent(r.prosent, "prosent");
    if (r.navn !== undefined) g.navn = V.tekst(r.navn, "navn", { maks: 100, pakrevd: true });
    if (r.merknad !== undefined) g.merknad = V.tekst(r.merknad, "merknad", { maks: 300 });
    if (Object.keys(g).length) st.push(oppdater(db, "prislisterad", rad.id, g, t));
  }
  if (st.length) await db.batch(st);
  return { id: pl.id };
});
function prosent(v, navn) {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 100) throw V.feil(navn, "Må være en prosent mellom 0 og 100.");
  return Math.round(n * 100) / 100;
}

rute("POST", `/api/prisliste/${ULID}/publiser`, async ({ db, p }) => {
  const pl = await db.prepare("SELECT * FROM prisliste WHERE id = ?").bind(p[0]).first();
  if (!pl) throw ikkeFunnet();
  if (pl.status !== "utkast") throw konflikt("Bare et utkast kan publiseres.");
  const t = naa();
  // Bare én aktiv om gangen: den gamle arkiveres. Publisering betyr at verdiene er bekreftet, så eksempel-merket fjernes.
  await db.batch([
    db.prepare("UPDATE prisliste SET status = 'arkivert', endret = ? WHERE status = 'aktiv'").bind(t),
    db.prepare("UPDATE prisliste SET status = 'aktiv', publisert = ?, eksempel = 0, endret = ? WHERE id = ?").bind(t, t, pl.id),
  ]);
  return { id: pl.id, status: "aktiv" };
});

rute("DELETE", `/api/prisliste/${ULID}`, async ({ db, p }) => {
  const pl = await db.prepare("SELECT * FROM prisliste WHERE id = ?").bind(p[0]).first();
  if (!pl) throw ikkeFunnet();
  if (pl.status !== "utkast") throw konflikt("Bare et utkast kan slettes.");
  if (Number(await db.prepare("SELECT COUNT(*) AS n FROM tilbud WHERE prisliste_id = ?").bind(pl.id).first("n")) > 0) throw konflikt("Tilbud bruker denne versjonen.");
  await db.prepare("DELETE FROM prisliste WHERE id = ?").bind(pl.id).run();
  return { slettet: pl.id };
});

const LEV_FELT = ["navn", "orgnr", "adresse", "epost", "signatar", "signatar_rolle", "signatar_epost"];
rute("GET", "/api/leverandor", async ({ db }) => {
  const l = await innstilling(db, "leverandor", {});
  return { leverandor: Object.fromEntries(LEV_FELT.map((k) => [k, l.verdi?.[k] ?? ""])), eksempel: l.eksempel };
});
rute("PUT", "/api/leverandor", async ({ req, db }) => {
  const b = await V.lesJson(req);
  const lev = {
    navn: V.tekst(b.navn, "navn", { maks: 120, pakrevd: true }) ?? "", orgnr: V.orgnr(b.orgnr) ?? "", adresse: V.tekst(b.adresse, "adresse", { maks: 200 }) ?? "", epost: V.epost(b.epost, "epost") ?? "",
    signatar: V.tekst(b.signatar, "signatar", { maks: 120 }) ?? "", signatar_rolle: V.tekst(b.signatar_rolle, "signatar_rolle", { maks: 100 }) ?? "", signatar_epost: V.epost(b.signatar_epost, "signatar_epost") ?? "",
  };
  await settInnstilling(db, "leverandor", lev, V.flagg(b.eksempel, "eksempel", { standard: 0 }));
  return { leverandor: lev };
});

rute("GET", "/api/innstillinger", async ({ db }) => ({
  fornyes_snart_dager: await tallInnstilling(db, "fornyes_snart_dager", 90),
  tilbud_gyldig_dager: await tallInnstilling(db, "tilbud_gyldig_dager", 14),
}));
rute("PATCH", "/api/innstillinger", async ({ req, db }) => {
  const b = await V.lesJson(req);
  if (b.fornyes_snart_dager !== undefined) await settInnstilling(db, "fornyes_snart_dager", V.heltall(b.fornyes_snart_dager, "fornyes_snart_dager", { min: 0, maks: 365, pakrevd: true }));
  if (b.tilbud_gyldig_dager !== undefined) await settInnstilling(db, "tilbud_gyldig_dager", V.heltall(b.tilbud_gyldig_dager, "tilbud_gyldig_dager", { min: 1, maks: 365, pakrevd: true }));
  return { fornyes_snart_dager: await tallInnstilling(db, "fornyes_snart_dager", 90), tilbud_gyldig_dager: await tallInnstilling(db, "tilbud_gyldig_dager", 14) };
});

// ── SA3 Import fra Excel ──────────────────────────────────────────────────────────────────────────────────────────────────────
rute("POST", "/api/import/forhandsvis", async ({ req, db }) => {
  const { navn, rader } = await lesOpplasting(req);
  const fv = await forhandsvis(db, rader);
  return { filnavn: navn, raa: rader, ...fv };
});
rute("POST", "/api/import", async ({ req, db, bruker }) => {
  const b = await V.lesJson(req);
  const rader = V.liste(b.rader, "rader", { maks: 2001 });
  if (!rader.every((r) => Array.isArray(r) && r.every((c) => typeof c === "string" && c.length <= 1000))) throw V.feil("rader", "Radene må være tekst.");
  return importer(db, rader, bruker.navn);
});

RUTER.push(...RUTER_FAKTURERING, ...RUTER_DRIFT); // K-260

export { RUTER };
