/**
 * Fakturering og Tall i Hengsel Admin fase C (K-260, 60-211 SC1–SC4, ST1). Rutene registreres i worker/api.js (én linje) og ligger bak samme
 * Access-sjekk. Bare rollen eier ser og endrer noe her: andre roller (f.eks. support fra K-259) får 403 ADM-403 «Du har ikke tilgang til Fakturering»,
 * også på GET. Prisene regnes med beregn() i src/lib/pris.js og reglene i src/lib/fakturering.js. Ingen fakturaer eller e-post sendes uten at
 * PowerOffice er koblet til (worker/poweroffice.js); e-post om KPI er bare utkast.
 *
 * Ruter:
 *   GET  /api/abonnement · POST /api/abonnement {avtale_nr} · GET /api/abonnement/:id · POST /api/abonnement/:id/endringer
 *   GET  /api/fakturakjoring[/:maaned] · POST /api/fakturakjoring/:maaned/utkast · POST /api/fakturakjoring/:maaned/viderefakturering
 *   DELETE /api/fakturalinjer/:id · POST /api/fakturakjoring/:maaned/send {faktura_id?}
 *   GET  /api/oversikt/fakturering   (kortet «Neste fakturakjøring» i SA1, K-259: dato, antall, sum uten mva, klar, sendt, feil)
 *   GET  /api/kpi · PUT /api/kpi/:aar · POST /api/kpi/:aar/varslet {abonnement_id}
 *   GET  /api/utestaende   (lest fra PowerOffice, lagres ikke)
 *   GET  /api/tall
 */
import { ApiFeil, naa, idagOslo, pluss, plussMnd, ulid, innstilling, prislisteMedRader } from "./db.js";
import * as V from "./valider.js";
import { normaliserPrisliste } from "../src/lib/pris.js";
import * as F from "../src/lib/fakturering.js";
import * as po from "./poweroffice.js";

const ULID = "([0-9A-HJKMNP-TV-Z]{26})";
const MND = "(\\d{4}-(?:0[1-9]|1[0-2]))";
export const RUTER_FAKTURERING = [];
const rute = (metode, monster, fn) => RUTER_FAKTURERING.push({ metode, re: new RegExp(`^${monster}$`), fn: async (a) => { kunEier(a.bruker); return fn(a); } });

/** Bare eier. Support og andre roller får ADM-403 (60-211: «Du har ikke tilgang til Fakturering»). */
export function kunEier(bruker, omraade = "Fakturering") {
  if (!bruker || bruker.rolle !== "eier") throw new ApiFeil(403, "ADM-403", `Du har ikke tilgang til ${omraade}.`);
}

const alle = async (st) => (await st.all()).results;
const ikkeFunnet = (m = "Finnes ikke.") => new ApiFeil(404, "ADM-404", m);
const konflikt = (m) => new ApiFeil(409, "ADM-409", m);
export const ENDRINGSTYPER = { pakke: "Pakke", ekstra_brukere: "Brukere", montorer: "Montører", butikk_lagt_til: "Butikk", butikk_fjernet: "Butikk", tillegg: "Tillegg", start: "Start", opphor: "Opphør" };

async function finnesTabell(db, navn) {
  return !!(await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").bind(navn).first());
}
async function kolonner(db, tabell) {
  return new Set((await alle(db.prepare("SELECT name FROM pragma_table_info(?)").bind(tabell))).map((r) => r.name));
}

/** Normaliserte prislister, hentet én gang per kall */
function prislister(db) {
  const cache = new Map();
  return async (id) => {
    if (!cache.has(id)) { const r = await prislisteMedRader(db, id); cache.set(id, r ? normaliserPrisliste(r.pl, r.rader) : null); }
    return cache.get(id);
  };
}

/** Timepris for support. Eies av K-259 (Innstillinger › Timepris); 1 150 kr som eksempel til den er satt (60-211 Grunnregler). */
export async function timepris(db) {
  const i = await innstilling(db, "support_timepris_ore", null);
  const v = Number(i.verdi);
  return Number.isInteger(v) && v > 0 ? { ore: v, eksempel: i.eksempel } : { ore: 115000, eksempel: true };
}

/**
 * Minutter ført per eier i en periode, fra tidsføringen i fase B (K-259) når tabellen finnes. Avtalt form (claude/k260-rapport.md):
 * tidsforing(eier_id, dato ÅÅÅÅ-MM-DD, minutter, fakturert_kjoring_id NULL|id). null når tabellen ikke finnes ennå.
 */
/** Kolonnen som merker fakturert tid: «fakturert_i» i K-259 (0002), «fakturert_kjoring_id» i den minste utgaven fra K-260-testene. */
function fakturertKolonne(k) { return k.has("fakturert_i") ? "fakturert_i" : k.has("fakturert_kjoring_id") ? "fakturert_kjoring_id" : null; }

export async function minutterPerEier(db, fra, til, kjoringId = null) {
  if (!(await finnesTabell(db, "tidsforing"))) return null;
  const k = await kolonner(db, "tidsforing");
  if (!k.has("eier_id") || !k.has("dato") || !k.has("minutter")) return null;
  const fk = fakturertKolonne(k);
  const filter = fk ? ` AND (${fk} IS NULL OR ${fk} = ?)` : "";
  const st = db.prepare(`SELECT eier_id, SUM(minutter) AS min FROM tidsforing WHERE dato >= ? AND dato <= ?${filter} GROUP BY eier_id`);
  const rader = await alle(filter ? st.bind(fra, til, kjoringId ?? "") : st.bind(fra, til));
  return new Map(rader.map((r) => [r.eier_id, Number(r.min)]));
}

async function aboData(db, abo) {
  const [linjer, endringer, kpi] = await Promise.all([
    alle(db.prepare("SELECT * FROM abonnementslinje WHERE abonnement_id = ? ORDER BY rekkefolge, gjelder_fra").bind(abo.id)),
    alle(db.prepare("SELECT * FROM abonnementsendring WHERE abonnement_id = ? ORDER BY gjelder_fra DESC, opprettet DESC").bind(abo.id)),
    alle(db.prepare("SELECT kpi_dato, prosent, varslet FROM kpi_justering_kunde WHERE abonnement_id = ? AND varslet IS NOT NULL").bind(abo.id)),
  ]);
  return { linjer, endringer, kpi };
}

const ABO_SQL = "SELECT a.*, e.navn AS eier_navn, e.orgnr AS eier_orgnr, av.nr AS avtale_nr, pl.versjon AS prisliste_versjon, pl.eksempel AS prisliste_eksempel FROM abonnement a JOIN eier e ON e.id = a.eier_id JOIN avtale av ON av.id = a.avtale_id JOIN prisliste pl ON pl.id = a.prisliste_id";

// ── SC1 Abonnement ────────────────────────────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/abonnement", async ({ db }) => {
  const idag = idagOslo();
  const pl = prislister(db);
  const aboer = await alle(db.prepare(`${ABO_SQL} ORDER BY e.navn`));
  const liste = [];
  for (const a of aboer) {
    const d = await aboData(db, a);
    const p = F.prisPaa(a, d.linjer, await pl(a.prisliste_id), d.kpi, a.gjelder_fra > idag ? a.gjelder_fra : idag);
    liste.push({ id: a.id, eier_id: a.eier_id, eier_navn: a.eier_navn, avtale_nr: a.avtale_nr, status: a.status, gjelder_fra: a.gjelder_fra, opphorer: a.opphorer, per_mnd_ore: p?.pris_ore ?? null, butikker: p?.butikker.length ?? 0 });
  }
  const kanLages = await alle(db.prepare("SELECT av.nr, av.start, e.navn AS eier_navn FROM avtale av JOIN eier e ON e.id = av.eier_id WHERE av.status IN ('signert', 'sagt_opp') AND NOT EXISTS (SELECT 1 FROM abonnement a WHERE a.avtale_id = av.id) ORDER BY e.navn"));
  return { idag, abonnementer: liste, kan_lages: kanLages };
});

/** Linjene fra avtalens tilbud: pakke og ekstra brukere per butikk, montører fordelt som i butikkene, tillegg som ikke er inkludert. */
async function linjerFraAvtale(db, avtale, pl, produktlinje) {
  const butikker = await alle(db.prepare("SELECT * FROM butikk WHERE eier_id = ? ORDER BY rekkefolge, navn").bind(avtale.eier_id));
  const tl = avtale.tilbud_id ? await alle(db.prepare("SELECT * FROM tilbudslinje WHERE tilbud_id = ? ORDER BY rekkefolge").bind(avtale.tilbud_id)) : [];
  const navn = [...new Set(tl.filter((l) => l.type === "pakke").map((l) => l.butikk_navn))];
  const kilde = navn.length ? navn.map((n) => butikker.find((b) => b.navn === n) ?? { navn: n, montorer: 0, pakke: null }) : butikker;
  const uteAntall = tl.find((l) => l.type === "ute")?.antall ?? null;
  const montorSum = kilde.reduce((s, b) => s + Number(b.montorer ?? 0), 0);
  const inkl = (pk) => pl.pakker[produktlinje]?.[pk]?.inkl_brukere ?? 0;
  const rader = kilde.map((b, i) => {
    const pakkelinje = tl.find((l) => l.type === "pakke" && l.butikk_navn === b.navn);
    const ekstra = tl.find((l) => l.type === "ekstra_brukere" && l.butikk_navn === b.navn);
    const pakke = pakkelinje?.pakke ?? b.pakke ?? "butikk";
    return { butikk_navn: b.navn, pakke, ekstra_brukere: ekstra ? Number(ekstra.antall) : tl.length ? 0 : Math.max(0, Number(b.brukere ?? 0) - inkl(pakke)), montorer: Number(b.montorer ?? 0), rekkefolge: i + 1 };
  });
  // Montørene fra tilbudet: står det et annet antall enn i butikkene, legges forskjellen på første butikk
  if (uteAntall !== null && rader.length && Number(uteAntall) !== montorSum) rader[0].montorer = Math.max(0, rader[0].montorer + Number(uteAntall) - montorSum);
  const tillegg = pl.tillegg.filter((t) => tl.some((l) => l.type === "tillegg" && Number(l.belop_ore) > 0 && String(l.tekst ?? "").startsWith(t.navn))).map((t) => t.kode);
  return { rader, tillegg };
}

rute("POST", "/api/abonnement", async ({ req, db, bruker }) => {
  const b = await V.lesJson(req);
  const nr = V.tekst(b.avtale_nr, "avtale_nr", { maks: 20, pakrevd: true });
  const avtale = await db.prepare("SELECT av.*, e.produktlinje FROM avtale av JOIN eier e ON e.id = av.eier_id WHERE av.nr = ?").bind(nr).first();
  if (!avtale) throw ikkeFunnet("Avtalen finnes ikke.");
  if (!["signert", "sagt_opp"].includes(avtale.status)) throw konflikt("Abonnement lages fra en signert avtale.");
  if (!avtale.start) throw konflikt("Avtalen har ingen startdato.");
  if (await db.prepare("SELECT id FROM abonnement WHERE avtale_id = ? OR eier_id = ?").bind(avtale.id, avtale.eier_id).first()) throw konflikt("Eieren har allerede et abonnement.");
  const pl = await prislister(db)(avtale.prisliste_id);
  if (!pl) throw konflikt("Prislisten til avtalen finnes ikke.");
  const { rader, tillegg } = await linjerFraAvtale(db, avtale, pl, avtale.produktlinje);
  if (!rader.length) throw konflikt("Avtalen har ingen butikker.");
  const t = naa(), id = ulid();
  const st = [
    db.prepare("INSERT INTO abonnement (id, eier_id, avtale_id, prisliste_id, produktlinje, gjelder_fra, binding_til, neste_kpi_dato, opphorer, status, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, avtale.eier_id, avtale.id, avtale.prisliste_id, avtale.produktlinje, avtale.start, pluss(plussMnd(avtale.start, avtale.binding_mnd), -1), plussMnd(avtale.start, 12), avtale.opphorer ?? null, avtale.status === "sagt_opp" ? "sagt_opp" : "aktiv", t, t),
    ...rader.map((r) => db.prepare("INSERT INTO abonnementslinje (id, abonnement_id, type, butikk_navn, pakke, ekstra_brukere, montorer, rekkefolge, gjelder_fra, opprettet, endret) VALUES (?, ?, 'butikk', ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(ulid(), id, r.butikk_navn, r.pakke, r.ekstra_brukere, r.montorer, r.rekkefolge, avtale.start, t, t)),
    ...tillegg.map((k, i) => db.prepare("INSERT INTO abonnementslinje (id, abonnement_id, type, tillegg_kode, rekkefolge, gjelder_fra, opprettet, endret) VALUES (?, ?, 'tillegg', ?, ?, ?, ?, ?)").bind(ulid(), id, k, 100 + i, avtale.start, t, t)),
    db.prepare("INSERT INTO abonnementsendring (id, abonnement_id, gjelder_fra, type, tekst, hvem, opprettet, endret) VALUES (?, ?, ?, 'start', ?, ?, ?, ?)")
      .bind(ulid(), id, avtale.start, `Abonnement startet fra avtale ${avtale.nr}, prisliste ${pl.versjon}`, bruker.navn, t, t),
  ];
  await db.batch(st);
  return { id };
});

async function hentAbo(db, id) {
  const a = await db.prepare(`${ABO_SQL} WHERE a.id = ?`).bind(id).first();
  if (!a) throw ikkeFunnet("Abonnementet finnes ikke.");
  return a;
}

rute("GET", `/api/abonnement/${ULID}`, async ({ db, p, url }) => {
  const a = await hentAbo(db, p[0]);
  const idag = idagOslo();
  const dato = V.dato(url.searchParams.get("dato"), "dato") ?? (a.gjelder_fra > idag ? a.gjelder_fra : idag);
  const pl = await prislister(db)(a.prisliste_id);
  const d = await aboData(db, a);
  const pr = pl ? F.prisPaa(a, d.linjer, pl, d.kpi, dato) : null;
  const gjelder = F.linjerPaa(d.linjer, dato);
  const nesteFaktura = F.forsteIMnd(F.leggTilMnd(F.maanedFor(idag), 1));
  return {
    idag, dato,
    abonnement: { id: a.id, eier_id: a.eier_id, eier_navn: a.eier_navn, avtale_nr: a.avtale_nr, produktlinje: a.produktlinje, gjelder_fra: a.gjelder_fra, binding_til: a.binding_til, neste_kpi_dato: a.neste_kpi_dato, opphorer: a.opphorer, status: a.status,
      neste_faktura: a.opphorer && a.opphorer < nesteFaktura ? null : (a.gjelder_fra > nesteFaktura ? F.forsteIMnd(F.maanedFor(a.gjelder_fra)) : nesteFaktura) },
    prisliste: pl ? { versjon: pl.versjon, eksempel: pl.eksempel, mva_prosent: pl.mva_prosent, rabattrinn: pl.rabattrinn, tillegg: pl.tillegg.map((t) => ({ kode: t.kode, navn: t.navn, pris_ore: t.pris_ore })), pakker: Object.fromEntries(Object.entries(pl.pakker[a.produktlinje] ?? {}).map(([k, x]) => [k, { navn: x.navn, pris_ore: x.pris_ore, inkl_brukere: x.inkl_brukere, ekstra_bruker_ore: x.ekstra_bruker_ore }])) } : null,
    linjer: gjelder.map((l) => ({ id: l.id, type: l.type, butikk_navn: l.butikk_navn, pakke: l.pakke, ekstra_brukere: l.ekstra_brukere, montorer: l.montorer, tillegg_kode: l.tillegg_kode, gjelder_fra: l.gjelder_fra })),
    pris: pr ? { rader: pr.rader.map((r) => ({ navn: r.navn, pakke: r.pakke, pakke_navn: r.pakkeNavn, pakke_ore: r.pakke_ore, antall_brukere: r.antall_brukere, inkl_brukere: r.inkl_brukere, brukere_ore: r.brukere_ore, montorer: r.montorer, sum_ore: r.sum_ore })),
      ute: pr.ute, grunnlag_ore: pr.grunnlag_ore, rabatt_prosent: pr.rabatt_prosent, rabatt_ore: pr.rabatt_ore, neste_trinn: pr.neste_trinn, antall_butikker: pr.antall_butikker,
      tillegg: pr.tillegg.filter((t) => t.valgt), tillegg_ore: pr.tillegg_ore, netto_ore: pr.for_kpi_ore, kpi_faktor: pr.kpi_faktor, pris_ore: pr.pris_ore, mva_ore: Math.round((pr.pris_ore * pl.mva_prosent) / 100), inkl_ore: pr.pris_ore + Math.round((pr.pris_ore * pl.mva_prosent) / 100) } : null,
    endringer: d.endringer.map((e) => ({ id: e.id, gjelder_fra: e.gjelder_fra, type: e.type, type_navn: ENDRINGSTYPER[e.type] ?? e.type, tekst: e.tekst, hvem: e.hvem, opprettet: e.opprettet, framtidig: e.gjelder_fra > idag })),
    endringstyper: Object.entries(ENDRINGSTYPER).filter(([k]) => !["start", "opphor"].includes(k)).map(([k, v]) => ({ kode: k, navn: v })),
  };
});

const PAKKENAVN = { start: "Start", butikk: "Butikk", komplett: "Komplett" };
rute("POST", `/api/abonnement/${ULID}/endringer`, async ({ req, db, p, bruker }) => {
  const a = await hentAbo(db, p[0]);
  const b = await V.lesJson(req);
  const type = V.valg(b.type, "type", ["pakke", "ekstra_brukere", "montorer", "butikk_lagt_til", "butikk_fjernet", "tillegg"], { pakrevd: true });
  const fra = V.dato(b.gjelder_fra, "gjelder_fra", { pakrevd: true });
  if (fra < a.gjelder_fra) throw V.feil("gjelder_fra", "Kan ikke gjelde før abonnementet startet.");
  const fritekst = V.tekst(b.tekst, "tekst", { maks: 300 });
  const pl = await prislister(db)(a.prisliste_id);
  const d = await aboData(db, a);
  const gjelder = F.linjerPaa(d.linjer, fra);
  const t = naa(), dagFor = pluss(fra, -1);
  const st = [];
  const lukk = (l) => (l.gjelder_fra >= fra ? db.prepare("DELETE FROM abonnementslinje WHERE id = ?").bind(l.id) : db.prepare("UPDATE abonnementslinje SET gjelder_til = ?, endret = ? WHERE id = ?").bind(dagFor, t, l.id));
  const ny = (l) => db.prepare("INSERT INTO abonnementslinje (id, abonnement_id, type, butikk_navn, pakke, ekstra_brukere, montorer, tillegg_kode, rekkefolge, gjelder_fra, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ulid(), a.id, l.type, l.butikk_navn ?? null, l.pakke ?? null, l.ekstra_brukere ?? 0, l.montorer ?? 0, l.tillegg_kode ?? null, l.rekkefolge ?? 0, fra, t, t);
  let tekst;
  if (type === "butikk_lagt_til") {
    const navn = V.tekst(b.butikk_navn, "butikk_navn", { maks: 120, pakrevd: true });
    if (gjelder.some((l) => l.type === "butikk" && l.butikk_navn === navn)) throw V.feil("butikk_navn", "Butikken finnes i abonnementet.");
    const pakke = V.valg(b.pakke, "pakke", ["start", "butikk", "komplett"], { pakrevd: true });
    const l = { type: "butikk", butikk_navn: navn, pakke, ekstra_brukere: V.heltall(b.ekstra_brukere, "ekstra_brukere", { maks: 1000, standard: 0 }), montorer: V.heltall(b.montorer, "montorer", { maks: 1000, standard: 0 }), rekkefolge: Math.max(0, ...gjelder.filter((x) => x.type === "butikk").map((x) => x.rekkefolge)) + 1 };
    st.push(ny(l));
    tekst = `${navn} lagt til med ${PAKKENAVN[pakke]}`;
  } else if (type === "tillegg") {
    const kode = V.valg(b.tillegg_kode, "tillegg_kode", pl.tillegg.map((x) => x.kode), { pakrevd: true });
    const finnes = gjelder.find((l) => l.type === "tillegg" && l.tillegg_kode === kode);
    const navn = pl.tillegg.find((x) => x.kode === kode).navn;
    if (finnes) { st.push(lukk(finnes)); tekst = `${navn} fjernet`; }
    else { st.push(ny({ type: "tillegg", tillegg_kode: kode, rekkefolge: 100 })); tekst = `${navn} lagt til`; }
  } else {
    const linje = gjelder.find((l) => l.type === "butikk" && l.id === b.linje_id);
    if (!linje) throw V.feil("linje_id", "Velg en butikk i abonnementet.");
    const butikker = gjelder.filter((l) => l.type === "butikk");
    if (type === "butikk_fjernet") {
      if (butikker.length <= 1) throw konflikt("Abonnementet må ha minst én butikk. Si opp avtalen i stedet.");
      st.push(lukk(linje));
      const igjen = butikker.length - 1;
      const trinn = pl.rabattrinn.filter((x) => igjen >= x.fra_butikker).sort((x, y) => y.prosent - x.prosent)[0];
      tekst = `${linje.butikk_navn} fjernet${trinn ? `. Rabattrinn ${trinn.prosent} % gjelder fortsatt` : ""}`;
    } else {
      const ut = { ...linje };
      if (type === "pakke") { ut.pakke = V.valg(b.pakke, "pakke", ["start", "butikk", "komplett"], { pakrevd: true }); if (ut.pakke === linje.pakke) throw V.feil("pakke", "Butikken har denne pakken."); tekst = `${linje.butikk_navn}: ${PAKKENAVN[linje.pakke]} → ${PAKKENAVN[ut.pakke]}`; }
      if (type === "ekstra_brukere") {
        ut.ekstra_brukere = V.heltall(b.ekstra_brukere, "ekstra_brukere", { maks: 1000, pakrevd: true });
        const inkl = pl.pakker[a.produktlinje][linje.pakke].inkl_brukere;
        const diff = ut.ekstra_brukere - linje.ekstra_brukere;
        tekst = `${linje.butikk_navn}: ${Math.abs(diff)} ${diff >= 0 ? "ekstra" : "færre"} ${Math.abs(diff) === 1 ? "bruker" : "brukere"} (${inkl + linje.ekstra_brukere} → ${inkl + ut.ekstra_brukere})`;
      }
      if (type === "montorer") { ut.montorer = V.heltall(b.montorer, "montorer", { maks: 1000, pakrevd: true }); tekst = `${linje.butikk_navn}: montører ${linje.montorer} → ${ut.montorer}`; }
      st.push(lukk(linje), ny(ut));
    }
  }
  if (fritekst) tekst = `${tekst}. ${fritekst}`;
  st.push(db.prepare("INSERT INTO abonnementsendring (id, abonnement_id, gjelder_fra, type, tekst, hvem, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(ulid(), a.id, fra, type, tekst, bruker.navn, t, t));
  st.push(db.prepare("UPDATE abonnement SET endret = ? WHERE id = ?").bind(t, a.id));
  await db.batch(st);
  return { id: a.id, tekst };
});

// ── SC2 Fakturakjøring ────────────────────────────────────────────────────────────────────────────────────────────────────────
const nesteMaaned = (idag = idagOslo()) => F.leggTilMnd(F.maanedFor(idag), 1);

/** Regner ut fakturaene for måneden fra abonnementene (ingenting lagres). Lagrede manuelle linjer og statuser tas med. */
export async function byggKjoring(db, maaned) {
  const kjoring = await db.prepare("SELECT * FROM fakturakjoring WHERE maaned = ?").bind(maaned).first();
  const pl = prislister(db);
  const forrige = F.leggTilMnd(maaned, -1);
  const minutter = await minutterPerEier(db, F.forsteIMnd(forrige), F.sisteIMnd(forrige), kjoring?.id ?? null);
  const tp = await timepris(db);
  const aboer = await alle(db.prepare(`${ABO_SQL} ORDER BY e.navn`));
  const lagret = kjoring ? await alle(db.prepare("SELECT * FROM faktura WHERE kjoring_id = ?").bind(kjoring.id)) : [];
  const ut = [];
  for (const a of aboer) {
    if (!F.erMed(a, maaned)) continue;
    const fak = lagret.find((f) => f.eier_id === a.eier_id) ?? null;
    if (fak && fak.status === "sendt") {
      // Sendt er låst: vis det som ble sendt
      const linjer = await alle(db.prepare("SELECT * FROM fakturalinje WHERE faktura_id = ? ORDER BY rekkefolge").bind(fak.id));
      ut.push({ abo: a, fak, res: { linjer, endret: JSON.parse(fak.endringer || "[]"), sum_ore: fak.sum_ore, mva_ore: fak.mva_ore, inkl_ore: fak.sum_ore + fak.mva_ore, fast_ore: linjer.find((l) => l.type === "abonnement")?.belop_ore ?? 0 } });
      continue;
    }
    const prisliste = await pl(a.prisliste_id);
    if (!prisliste) continue;
    const d = await aboData(db, a);
    const etab = await db.prepare("SELECT 1 AS j FROM fakturalinje fl JOIN faktura f ON f.id = fl.faktura_id WHERE f.abonnement_id = ? AND fl.type = 'etablering' AND f.kjoring_id != ? LIMIT 1").bind(a.id, kjoring?.id ?? "").first();
    const manuelle = fak ? await alle(db.prepare("SELECT id, tekst, kostpris_ore FROM fakturalinje WHERE faktura_id = ? AND kilde = 'manuell' ORDER BY rekkefolge").bind(fak.id)) : [];
    const res = F.lagFaktura({
      abo: a, linjer: d.linjer, pl: prisliste, kpi: d.kpi, endringer: d.endringer, maaned, etableringFakturert: !!etab,
      minutterForrigeMnd: minutter ? minutter.get(a.eier_id) ?? 0 : null, timeprisOre: tp.ore,
      viderefakturert: manuelle.map((m) => ({ id: m.id, tekst: m.tekst.replace(/ \(kostpris .*$/, ""), kostpris_ore: Number(m.kostpris_ore) })),
    });
    if (res) ut.push({ abo: a, fak, res });
  }
  return { kjoring, liste: ut, timepris: tp, tidsforing: minutter !== null };
}

function visKjoring(maaned, b, env) {
  const fakturaer = b.liste.map(({ abo, fak, res }) => ({
    id: fak?.id ?? null, eier_id: abo.eier_id, eier_navn: abo.eier_navn, abonnement_id: abo.id, status: fak?.status ?? "klar", feilmelding: fak?.feilmelding ?? null, poweroffice_id: fak?.poweroffice_id ?? null,
    endret: res.endret, linjer: res.linjer.map((l) => ({ id: l.id ?? null, type: l.type, kilde: l.kilde, tekst: l.tekst, antall: l.antall, pris_ore: l.pris_ore, kostpris_ore: l.kostpris_ore, paaslag_prosent: l.paaslag_prosent, rabatt_ore: l.rabatt_ore, belop_ore: l.belop_ore })),
    fast_ore: res.fast_ore, sum_ore: res.sum_ore, mva_ore: res.mva_ore, inkl_ore: res.inkl_ore,
  }));
  const tell = (s) => fakturaer.filter((f) => f.status === s).length;
  const sum = fakturaer.reduce((s, f) => s + f.sum_ore, 0), mva = fakturaer.reduce((s, f) => s + f.mva_ore, 0);
  return {
    maaned, navn: F.maanedNavn(maaned), fakturadato: F.forsteIMnd(maaned), forrige_navn: F.maanedNavn(F.leggTilMnd(maaned, -1)),
    lagret: !!b.kjoring, status: b.kjoring?.status ?? "utkast", poweroffice_koblet: po.erKoblet(env), tidsforing: b.tidsforing, timepris: b.timepris,
    fakturaer, antall: fakturaer.length, klar: tell("klar"), sendt: tell("sendt"), feil: tell("feil"),
    sum_ore: sum, mva_ore: mva, inkl_ore: sum + mva, per_type: F.summerPerType(fakturaer),
  };
}

const lesMaaned = (s) => { if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(s ?? "")) throw V.feil("maaned", "Måned må være ÅÅÅÅ-MM."); return s; };

rute("GET", "/api/fakturakjoring", async ({ db, env, url }) => {
  const maaned = url.searchParams.get("maaned") ? lesMaaned(url.searchParams.get("maaned")) : nesteMaaned();
  const kjoringer = await alle(db.prepare("SELECT maaned, status FROM fakturakjoring ORDER BY maaned DESC LIMIT 24"));
  return { ...visKjoring(maaned, await byggKjoring(db, maaned), env), kjoringer };
});
rute("GET", `/api/fakturakjoring/${MND}`, async ({ db, env, p }) => {
  const kjoringer = await alle(db.prepare("SELECT maaned, status FROM fakturakjoring ORDER BY maaned DESC LIMIT 24"));
  return { ...visKjoring(p[0], await byggKjoring(db, p[0]), env), kjoringer };
});

/** Lagrer utkastet: fakturaer som ikke er sendt regnes på nytt; manuelle linjer (kostpriser) og status Feil beholdes. */
export async function lagreUtkast(db, maaned) {
  const t = naa();
  let k = await db.prepare("SELECT * FROM fakturakjoring WHERE maaned = ?").bind(maaned).first();
  if (!k) {
    k = { id: ulid(), maaned };
    await db.prepare("INSERT INTO fakturakjoring (id, maaned, fakturadato, status, opprettet, endret) VALUES (?, ?, ?, 'utkast', ?, ?)").bind(k.id, maaned, F.forsteIMnd(maaned), t, t).run();
  }
  const b = await byggKjoring(db, maaned);
  const st = [];
  const med = new Set();
  for (const { abo, fak, res } of b.liste) {
    med.add(abo.eier_id);
    if (fak?.status === "sendt") continue;
    const fid = fak?.id ?? ulid();
    if (!fak) st.push(db.prepare("INSERT INTO faktura (id, kjoring_id, eier_id, abonnement_id, status, endringer, sum_ore, mva_ore, opprettet, endret) VALUES (?, ?, ?, ?, 'klar', ?, ?, ?, ?, ?)").bind(fid, k.id, abo.eier_id, abo.id, JSON.stringify(res.endret), res.sum_ore, res.mva_ore, t, t));
    else st.push(db.prepare("UPDATE faktura SET endringer = ?, sum_ore = ?, mva_ore = ?, endret = ? WHERE id = ?").bind(JSON.stringify(res.endret), res.sum_ore, res.mva_ore, t, fid));
    st.push(db.prepare("DELETE FROM fakturalinje WHERE faktura_id = ? AND kilde = 'auto'").bind(fid));
    for (const l of res.linjer) {
      if (l.kilde === "manuell") { st.push(db.prepare("UPDATE fakturalinje SET rekkefolge = ?, tekst = ?, belop_ore = ?, pris_ore = ?, paaslag_prosent = ?, endret = ? WHERE id = ?").bind(l.rekkefolge, l.tekst, l.belop_ore, l.pris_ore, l.paaslag_prosent, t, l.id)); continue; }
      st.push(db.prepare("INSERT INTO fakturalinje (id, faktura_id, rekkefolge, type, kilde, tekst, antall, pris_ore, kostpris_ore, paaslag_prosent, rabatt_ore, belop_ore, opprettet, endret) VALUES (?, ?, ?, ?, 'auto', ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(ulid(), fid, l.rekkefolge, l.type, l.tekst, l.antall, l.pris_ore, l.kostpris_ore, l.paaslag_prosent, l.rabatt_ore, l.belop_ore, t, t));
    }
  }
  // Fakturaer for abonnementer som ikke lenger er med (og ikke er sendt) fjernes
  for (const f of await alle(db.prepare("SELECT id, eier_id, status FROM faktura WHERE kjoring_id = ?").bind(k.id))) if (!med.has(f.eier_id) && f.status !== "sendt") st.push(db.prepare("DELETE FROM faktura WHERE id = ?").bind(f.id));
  st.push(db.prepare("UPDATE fakturakjoring SET endret = ? WHERE id = ?").bind(t, k.id));
  if (st.length) await db.batch(st);
  return k.id;
}

rute("POST", `/api/fakturakjoring/${MND}/utkast`, async ({ db, env, p }) => {
  await lagreUtkast(db, p[0]);
  return visKjoring(p[0], await byggKjoring(db, p[0]), env);
});

rute("POST", `/api/fakturakjoring/${MND}/viderefakturering`, async ({ req, db, env, p }) => {
  const k = await db.prepare("SELECT * FROM fakturakjoring WHERE maaned = ?").bind(p[0]).first();
  if (!k) throw konflikt("Lag utkastet for måneden først.");
  const b = await V.lesJson(req);
  const eier = V.id(b.eier_id, "eier_id");
  const f = await db.prepare("SELECT * FROM faktura WHERE kjoring_id = ? AND eier_id = ?").bind(k.id, eier).first();
  if (!f) throw V.feil("eier_id", "Kunden har ingen faktura denne måneden.");
  if (f.status === "sendt") throw konflikt("Fakturaen er sendt og kan ikke endres.");
  const tekst = V.tekst(b.tekst, "tekst", { maks: 120, pakrevd: true });
  const kostpris = V.heltall(b.kostpris_ore, "kostpris_ore", { min: 1, maks: 100_000_000, pakrevd: true });
  const t = naa();
  await db.prepare("INSERT INTO fakturalinje (id, faktura_id, rekkefolge, type, kilde, tekst, antall, pris_ore, kostpris_ore, paaslag_prosent, rabatt_ore, belop_ore, opprettet, endret) VALUES (?, ?, 999, 'viderefakturert', 'manuell', ?, 1, 0, ?, NULL, 0, 0, ?, ?)")
    .bind(ulid(), f.id, tekst, kostpris, t, t).run();
  await lagreUtkast(db, p[0]);
  return visKjoring(p[0], await byggKjoring(db, p[0]), env);
});

rute("DELETE", `/api/fakturalinjer/${ULID}`, async ({ db, env, p }) => {
  const l = await db.prepare("SELECT fl.*, f.status, k.maaned FROM fakturalinje fl JOIN faktura f ON f.id = fl.faktura_id JOIN fakturakjoring k ON k.id = f.kjoring_id WHERE fl.id = ?").bind(p[0]).first();
  if (!l) throw ikkeFunnet();
  if (l.kilde !== "manuell") throw konflikt("Bare linjer lagt inn for hånd kan slettes. De andre regnes fra abonnementet.");
  if (l.status === "sendt") throw konflikt("Fakturaen er sendt og kan ikke endres.");
  await db.prepare("DELETE FROM fakturalinje WHERE id = ?").bind(l.id).run();
  await lagreUtkast(db, l.maaned);
  return visKjoring(l.maaned, await byggKjoring(db, l.maaned), env);
});

/**
 * Sender fakturaene med status Klar (eller én faktura, også Feil, med faktura_id) til PowerOffice. Uten nøklene: 409 og ingenting skjer.
 * Svarer ikke PowerOffice på innloggingen, sendes ingenting (502). Kunden finnes ikke i Go: fakturaen får Feil med forklaring.
 */
export async function sendKjoring(db, env, maaned, { fakturaId = null, hent = fetch } = {}) {
  if (!po.erKoblet(env)) throw konflikt(`${po.IKKE_KOBLET} Ingenting er sendt.`);
  const k = await db.prepare("SELECT * FROM fakturakjoring WHERE maaned = ?").bind(maaned).first();
  if (!k) throw konflikt("Lag utkastet for måneden først.");
  await lagreUtkast(db, maaned);
  const kandidater = await alle(fakturaId
    ? db.prepare("SELECT f.*, e.orgnr, e.navn AS eier_navn FROM faktura f JOIN eier e ON e.id = f.eier_id WHERE f.kjoring_id = ? AND f.id = ? AND f.status IN ('klar', 'feil')").bind(k.id, fakturaId)
    : db.prepare("SELECT f.*, e.orgnr, e.navn AS eier_navn FROM faktura f JOIN eier e ON e.id = f.eier_id WHERE f.kjoring_id = ? AND f.status = 'klar'").bind(k.id));
  if (!kandidater.length) throw konflikt("Ingen fakturaer er klare til å sendes.");
  const klient = new po.PowerOfficeKlient(env, hent);
  try { await klient.hentToken(); } catch (e) { throw new ApiFeil(502, "ADM-502", `PowerOffice svarte ikke. Ingenting er sendt. ${e?.message ?? ""}`.trim()); }
  const t = naa();
  const tidsKol = (await finnesTabell(db, "tidsforing")) ? fakturertKolonne(await kolonner(db, "tidsforing")) : null;
  const forrige = F.leggTilMnd(maaned, -1);
  for (const f of kandidater) {
    const linjer = await alle(db.prepare("SELECT * FROM fakturalinje WHERE faktura_id = ? ORDER BY rekkefolge").bind(f.id));
    try {
      const abo = await db.prepare("SELECT poweroffice_kunde_id FROM abonnement WHERE id = ?").bind(f.abonnement_id).first();
      let kundeId = abo?.poweroffice_kunde_id;
      if (!kundeId) {
        const kunde = await klient.finnKunde(f.orgnr);
        if (!kunde) throw new Error("PowerOffice: kunden finnes ikke. Opprett kunden i PowerOffice og prøv igjen.");
        kundeId = String(kunde.Id ?? kunde.id);
        await db.prepare("UPDATE abonnement SET poweroffice_kunde_id = ?, endret = ? WHERE id = ?").bind(kundeId, t, f.abonnement_id).run();
      }
      const id = await klient.lagSalgsordre({ kundeId, fakturadato: F.forsteIMnd(maaned), referanse: `Hengsel ${F.maanedNavn(maaned, false)}`, linjer });
      await db.prepare("UPDATE faktura SET status = 'sendt', feilmelding = NULL, poweroffice_id = ?, sendt = ?, endret = ? WHERE id = ?").bind(id, t, t, f.id).run();
      if (tidsKol && linjer.some((l) => l.type === "timer")) await db.prepare(`UPDATE tidsforing SET ${tidsKol} = ? WHERE eier_id = ? AND dato >= ? AND dato <= ? AND ${tidsKol} IS NULL`).bind(k.id, f.eier_id, F.forsteIMnd(forrige), F.sisteIMnd(forrige)).run();
    } catch (e) {
      await db.prepare("UPDATE faktura SET status = 'feil', feilmelding = ?, endret = ? WHERE id = ?").bind(String(e?.message ?? "PowerOffice svarte ikke.").slice(0, 300), t, f.id).run();
    }
  }
  const s = await alle(db.prepare("SELECT status, COUNT(*) AS n FROM faktura WHERE kjoring_id = ? GROUP BY status").bind(k.id));
  const n = Object.fromEntries(s.map((r) => [r.status, Number(r.n)]));
  const status = (n.sendt ?? 0) === 0 ? "utkast" : (n.klar ?? 0) + (n.feil ?? 0) === 0 ? "sendt" : "delvis_sendt";
  await db.prepare("UPDATE fakturakjoring SET status = ?, endret = ? WHERE id = ?").bind(status, t, k.id).run();
}

rute("POST", `/api/fakturakjoring/${MND}/send`, async ({ req, db, env, p }) => {
  const b = req.headers.get("Content-Type")?.startsWith("application/json") ? await V.lesJson(req) : {};
  await sendKjoring(db, env, p[0], { fakturaId: b.faktura_id ? V.id(b.faktura_id, "faktura_id") : null });
  return visKjoring(p[0], await byggKjoring(db, p[0]), env);
});

// ── SA1-kortet «Neste fakturakjøring» (leses av K-259) ──
rute("GET", "/api/oversikt/fakturering", async ({ db, env }) => {
  const maaned = nesteMaaned();
  const v = visKjoring(maaned, await byggKjoring(db, maaned), env);
  return { maaned, navn: v.navn, dato: v.fakturadato, antall: v.antall, sum_uten_mva_ore: v.sum_ore, klar: v.klar, sendt: v.sendt, feil: v.feil, lagret: v.lagret, href: "/fakturering/kjoring" };
});

// ── SC3 KPI ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const KPI_KLAR_DAGER = 14;
async function leverandorNavn(db) { const l = await innstilling(db, "leverandor", {}); return { navn: l.verdi?.navn || "Hengsel", eksempel: l.eksempel }; }

async function kpiRader(db, j) {
  const idag = idagOslo();
  const pl = prislister(db);
  const lev = await leverandorNavn(db);
  const aboer = await alle(db.prepare(`${ABO_SQL} WHERE a.status = 'aktiv' ORDER BY a.neste_kpi_dato, e.navn`));
  const varslede = j ? await alle(db.prepare("SELECT k.*, e.navn AS eier_navn, e.id AS eier_id FROM kpi_justering_kunde k JOIN abonnement a ON a.id = k.abonnement_id JOIN eier e ON e.id = a.eier_id WHERE k.kpi_justering_id = ? ORDER BY k.kpi_dato").bind(j.id)) : [];
  const rader = varslede.map((k) => ({ abonnement_id: k.abonnement_id, eier_id: k.eier_id, eier_navn: k.eier_navn, kpi_dato: k.kpi_dato, varseldato: k.varseldato, pris_ore: k.pris_ore, ny_pris_ore: k.ny_pris_ore, endring_ore: k.ny_pris_ore - k.pris_ore, status: "varslet", varslet: k.varslet, epost: { emne: k.epost_emne, tekst: k.epost_utkast } }));
  for (const a of aboer) {
    if (!a.neste_kpi_dato || rader.some((r) => r.abonnement_id === a.id)) continue;
    if (a.opphorer && a.opphorer < a.neste_kpi_dato) continue;
    const d = await aboData(db, a);
    const p = F.prisPaa(a, d.linjer, await pl(a.prisliste_id), d.kpi, a.gjelder_fra > idag ? a.gjelder_fra : idag);
    if (!p) continue;
    const ny = j ? F.kpiNyPris(p.pris_ore, j.prosent) : null;
    const varsel = j ? pluss(a.neste_kpi_dato, -j.varsel_dager) : null;
    const kontakt = await db.prepare("SELECT navn, epost FROM kontakt WHERE eier_id = ? ORDER BY signaturrett DESC, primaer DESC, opprettet LIMIT 1").bind(a.eier_id).first();
    rader.push({
      abonnement_id: a.id, eier_id: a.eier_id, eier_navn: a.eier_navn, kpi_dato: a.neste_kpi_dato, varseldato: varsel, pris_ore: p.pris_ore, ny_pris_ore: ny, endring_ore: ny === null ? null : ny - p.pris_ore,
      status: !j ? "mangler_prosent" : varsel <= pluss(idag, KPI_KLAR_DAGER) ? "utkast_klart" : "senere", varslet: null,
      til: kontakt ? { navn: kontakt.navn, epost: kontakt.epost } : null,
      epost: j ? F.kpiEpost({ fornavn: kontakt?.navn?.split(" ")[0], kunde: a.eier_navn, kpi_dato: a.neste_kpi_dato, prosent: j.prosent, pris_ore: p.pris_ore, ny_pris_ore: ny, leverandor: lev.navn }) : null,
    });
  }
  return rader;
}

rute("GET", "/api/kpi", async ({ db }) => {
  const j = await db.prepare("SELECT * FROM kpi_justering ORDER BY aar DESC LIMIT 1").first();
  const rader = await kpiRader(db, j);
  const neste = rader.find((r) => r.status === "utkast_klart") ?? null;
  return { idag: idagOslo(), justering: j ? { aar: j.aar, prosent: j.prosent, kilde: j.kilde, varsel_dager: j.varsel_dager, eksempel: j.eksempel === 1 } : null, rader, neste_abonnement_id: neste?.abonnement_id ?? null, klar_dager: KPI_KLAR_DAGER };
});

rute("PUT", "/api/kpi/(\\d{4})", async ({ req, db, p }) => {
  const aar = V.heltall(p[0], "aar", { min: 2020, maks: 2100, pakrevd: true });
  const b = await V.lesJson(req);
  const prosentTekst = String(b.prosent ?? "").replace(",", ".").trim();
  const prosent = Number(prosentTekst);
  if (!prosentTekst || !Number.isFinite(prosent) || prosent < -20 || prosent > 50) throw V.feil("prosent", "Skriv KPI-endringen i prosent, f.eks. 3,1.");
  const kilde = V.tekst(b.kilde, "kilde", { maks: 120 });
  const dager = V.heltall(b.varsel_dager, "varsel_dager", { min: 1, maks: 365, standard: 30 });
  const eksempel = V.flagg(b.eksempel, "eksempel", { standard: 0 });
  const t = naa();
  await db.prepare("INSERT INTO kpi_justering (id, aar, prosent, kilde, varsel_dager, eksempel, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(aar) DO UPDATE SET prosent = excluded.prosent, kilde = excluded.kilde, varsel_dager = excluded.varsel_dager, eksempel = excluded.eksempel, endret = excluded.endret")
    .bind(ulid(), aar, Math.round(prosent * 100) / 100, kilde, dager, eksempel, t, t).run();
  return { aar, prosent: Math.round(prosent * 100) / 100, varsel_dager: dager };
});

/** «Merk som varslet»: lagrer prisen, ny pris og e-postutkastet. Ny pris gjelder fra KPI-datoen. Ingenting sendes. */
rute("POST", "/api/kpi/(\\d{4})/varslet", async ({ req, db, p }) => {
  const j = await db.prepare("SELECT * FROM kpi_justering WHERE aar = ?").bind(Number(p[0])).first();
  if (!j) throw konflikt("Legg inn KPI-prosenten først.");
  const b = await V.lesJson(req);
  const aboId = V.id(b.abonnement_id, "abonnement_id");
  const rad = (await kpiRader(db, j)).find((r) => r.abonnement_id === aboId);
  if (!rad) throw ikkeFunnet("Abonnementet har ingen KPI-justering å varsle.");
  if (rad.status === "varslet") throw konflikt("Kunden er allerede varslet.");
  const t = naa(), idag = idagOslo();
  await db.batch([
    db.prepare("INSERT INTO kpi_justering_kunde (id, kpi_justering_id, abonnement_id, kpi_dato, prosent, pris_ore, ny_pris_ore, varseldato, epost_emne, epost_utkast, varslet, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(ulid(), j.id, aboId, rad.kpi_dato, j.prosent, rad.pris_ore, rad.ny_pris_ore, rad.varseldato, rad.epost.emne, rad.epost.tekst, idag, t, t),
    db.prepare("UPDATE abonnement SET neste_kpi_dato = ?, endret = ? WHERE id = ?").bind(plussMnd(rad.kpi_dato, 12), t, aboId),
  ]);
  return { varslet: idag, ny_pris_ore: rad.ny_pris_ore, kpi_dato: rad.kpi_dato };
});

// ── SC4 Utestående (lest fra PowerOffice, lagres ikke) ────────────────────────────────────────────────────────────────────────
export async function hentUtestaende(db, env, hent = fetch) {
  if (!po.erKoblet(env)) return { koblet: false, hentet: null, rader: [], sum_ore: 0, forfalt_ore: 0 };
  const idag = idagOslo();
  let poster;
  try { poster = await new po.PowerOfficeKlient(env, hent).apnePoster(idag); }
  catch (e) { throw new ApiFeil(502, "ADM-502", `PowerOffice svarte ikke. ${e?.message ?? ""}`.trim()); }
  const eiere = await alle(db.prepare("SELECT id, navn, orgnr FROM eier WHERE orgnr IS NOT NULL"));
  const rader = poster.map((r) => {
    const e = eiere.find((x) => x.orgnr && x.orgnr === String(r.kunde_orgnr ?? "").replace(/\D/g, ""));
    const dager = r.forfall ? Math.max(0, Math.round((Date.parse(idag) - Date.parse(r.forfall)) / 86_400_000)) : 0;
    return { ...r, eier_id: e?.id ?? null, eier_navn: e?.navn ?? r.kunde_navn, dager_over: dager };
  }).sort((a, b) => b.dager_over - a.dager_over || a.forfall.localeCompare(b.forfall));
  return { koblet: true, hentet: naa(), rader, sum_ore: rader.reduce((s, r) => s + r.belop_ore, 0), forfalt_ore: rader.filter((r) => r.dager_over > 0).reduce((s, r) => s + r.belop_ore, 0) };
}
rute("GET", "/api/utestaende", async ({ db, env }) => hentUtestaende(db, env));

// ── ST1 Tall (regnet fra egne tabeller) ───────────────────────────────────────────────────────────────────────────────────────
const STEG = [["ny", "Ny"], ["demo", "Demo avtalt"], ["tilbud", "Tilbud sendt"], ["forhandling", "Forhandling"], ["signert", "Signert"]];

export async function regnTall(db, idag = idagOslo()) {
  const pl = prislister(db);
  const aboer = await alle(db.prepare(ABO_SQL));
  const data = [];
  for (const a of aboer) data.push({ a, d: await aboData(db, a), pl: await pl(a.prisliste_id) });
  const denne = F.maanedFor(idag);
  const iMnd = (m) => {
    let inntekt = 0, kunder = 0, butikker = 0;
    for (const { a, d, pl: p } of data) {
      if (!p || !F.erMed(a, m)) continue;
      const dato = a.gjelder_fra > F.forsteIMnd(m) ? a.gjelder_fra : F.forsteIMnd(m);
      const r = F.prisPaa(a, d.linjer, p, d.kpi, dato);
      if (!r) continue;
      inntekt += r.pris_ore; kunder++; butikker += r.butikker.length;
    }
    return { maaned: m, navn: F.MND_NAVN[Number(m.slice(5)) - 1].slice(0, 3).replace(/^./, (c) => c.toUpperCase()), inntekt_ore: inntekt, kunder, butikker };
  };
  const mnd = Array.from({ length: 12 }, (_, i) => iMnd(F.leggTilMnd(denne, i - 11)));
  const aar = Number(denne.slice(0, 4));
  const sumAar = (y, til = 12) => Array.from({ length: til }, (_, i) => iMnd(`${y}-${String(i + 1).padStart(2, "0")}`).inntekt_ore).reduce((s, x) => s + x, 0);
  const hittil = sumAar(aar, Number(denne.slice(5)));
  const prognose = sumAar(aar);
  const naa_ = mnd[11];
  // Churn: abonnementer som er opphørt eller sagt opp siste 12 måneder
  const fra12 = plussMnd(idag, -12);
  const oppsagt = data.filter(({ a }) => a.opphorer && a.opphorer >= fra12);
  const kunder12 = Math.max(naa_.kunder, mnd[0].kunder, 1);
  // Saker (fase B) og timer når tabellene finnes
  let saker = null;
  if (await finnesTabell(db, "sak")) {
    const k = await kolonner(db, "sak");
    if (k.has("status")) saker = { apne: Number(await db.prepare("SELECT COUNT(*) AS n FROM sak WHERE status != 'lost'").first("n")), siste_30: k.has("opprettet") ? Number(await db.prepare("SELECT COUNT(*) AS n FROM sak WHERE opprettet >= ?").bind(pluss(idag, -30)).first("n")) : null };
  }
  const min = await minutterPerEier(db, F.forsteIMnd(denne), F.sisteIMnd(denne));
  const ik = await innstilling(db, "internkost_time_ore", 65000);
  const internkost = Number(ik.verdi) || 65000;
  const perKunde = [];
  for (const { a, d, pl: p } of data) {
    if (!p || !F.erMed(a, denne)) continue;
    const r = F.prisPaa(a, d.linjer, p, d.kpi, a.gjelder_fra > F.forsteIMnd(denne) ? a.gjelder_fra : F.forsteIMnd(denne));
    if (!r) continue;
    const t = min ? (min.get(a.eier_id) ?? 0) / 60 : null;
    const kost = t === null ? null : Math.round(t * internkost);
    perKunde.push({ eier_id: a.eier_id, eier_navn: a.eier_navn, inntekt_ore: r.pris_ore, inkl_timer: r.support_timer, timer: t, kost_ore: kost, bidrag_ore: kost === null ? null : r.pris_ore - kost, andel: kost === null || !r.pris_ore ? null : Math.round(((r.pris_ore - kost) / r.pris_ore) * 1000) / 10 });
  }
  perKunde.sort((x, y) => y.inntekt_ore - x.inntekt_ore);
  // Salgstrakt: hvor mange eiere som har nådd hvert steg (tapte telles i Ny)
  const status = await alle(db.prepare("SELECT status, COUNT(*) AS n FROM eier GROUP BY status"));
  const ant = Object.fromEntries(status.map((s) => [s.status, Number(s.n)]));
  const trakt = STEG.map(([id, navn], i) => ({ steg: id, navn, antall: STEG.slice(i).reduce((s, [x]) => s + (ant[x] ?? 0), 0) + (i === 0 ? ant.tapt ?? 0 : 0) }));
  trakt.forEach((t, i) => { t.overgang = i === 0 || !trakt[i - 1].antall ? null : Math.round((t.antall / trakt[i - 1].antall) * 100); });
  const tapt = (await alle(db.prepare("SELECT tap_grunn AS grunn, COUNT(*) AS antall FROM eier WHERE status = 'tapt' AND tap_grunn IS NOT NULL GROUP BY tap_grunn ORDER BY antall DESC, grunn"))).map((r) => ({ grunn: r.grunn, antall: Number(r.antall) }));
  const fornyes = await alle(db.prepare("SELECT av.nr, av.status, av.fornyes, av.opphorer, av.per_mnd_ore, e.id AS eier_id, e.navn AS eier_navn FROM avtale av JOIN eier e ON e.id = av.eier_id WHERE (av.status = 'signert' AND av.fornyes >= ? AND av.fornyes <= ?) OR (av.status = 'sagt_opp' AND av.opphorer >= ? AND av.opphorer <= ?) ORDER BY COALESCE(av.fornyes, av.opphorer)").bind(idag, pluss(idag, 90), idag, pluss(idag, 90)));
  return {
    idag, maaned: denne, navn: F.maanedNavn(denne),
    tall: { inntekt_mnd_ore: naa_.inntekt_ore, hittil_ore: hittil, kunder: naa_.kunder, butikker: naa_.butikker, churn: { oppsagt: oppsagt.length, prosent: Math.round((oppsagt.length / kunder12) * 1000) / 10 }, saker },
    mnd, aar: [{ aar: String(aar - 1), inntekt_ore: sumAar(aar - 1), merknad: "Hele året" }, { aar: String(aar), inntekt_ore: hittil, merknad: `Januar–${F.MND_NAVN[Number(denne.slice(5)) - 1]}` }, { aar: `${aar} prognose`, inntekt_ore: prognose, merknad: "Med kjente starter og opphør" }],
    per_kunde: perKunde, internkost_ore: internkost, internkost_eksempel: ik.eksempel, tidsforing: min !== null,
    trakt, tapt, fornyes: fornyes.map((f) => ({ ...f, dager: Math.round((Date.parse(f.status === "sagt_opp" ? f.opphorer : f.fornyes) - Date.parse(idag)) / 86_400_000) })),
  };
}
rute("GET", "/api/tall", async ({ db }) => regnTall(db));
