/**
 * API for Support i Hengsel Admin fase B (K-259, 60-211 SB1–SB3). Rutene monteres i worker/api.js med monter(rute) og ligger bak samme
 * Access-sjekk. Tilgang (worker/tilgang.js): eier leser og skriver alt; rollen support leser og skriver /api/saker*, /api/timer* og
 * /api/tidsforing*, ser timer UTEN beløp, og får ADM-403 på alt annet (også /api/support/* og /api/brukere).
 *
 * Ruter (GET hvis ikke annet er sagt):
 *   /api/saker (POST ny sak) · /api/saker/valg · /api/saker/H-nnnn (PATCH status, prioritet, kunde) · /api/saker/H-nnnn/meldinger (POST)
 *   /api/saker/H-nnnn/epost-utkast/:melding · /api/saker/H-nnnn/skjermbilde (bilde, via index.js) · /api/saker/H-nnnn/tidtaker (POST start, DELETE avbryt)
 *   /api/saker/H-nnnn/tidtaker/stopp (POST) · /api/saker/H-nnnn/tid (POST manuell) · /api/tidsforing/:id (DELETE) · /api/timer?mnd=ÅÅÅÅ-MM
 *   /api/meny-tall · /api/oversikt/saker · /api/support/innstillinger (PATCH) · /api/brukere (POST) · /api/brukere/:id (PATCH)
 *
 * E-post: svar til kunden lagres som UTKAST (melding.utsendelse = 'utkast') med forhåndsvisning. Ingenting sendes før e-postløsningen er
 * bestemt (se claude/k259-rapport.md). Internt notat kommer aldri i utkastet (kundeVisning i src/lib/support.js).
 */
import { ApiFeil, naa, idagOslo, ulid, innstilling, settInnstilling, plussMnd, pluss, gjeldendePrislisteRad, prislisteMedRader } from "./db.js";
import * as V from "./valider.js";
import { normaliserPrisliste } from "../src/lib/pris.js";
import {
  PRIORITETER, PRIORITETSNAVN, STATUSER, STATUSNAVN, KILDER, KILDENAVN, MELDINGSTYPER, KUNDESTATUS, STANDARD_SUPPORTNIVA,
  beregnSvarfrist, byttStatus, fristTilstand, fristFor, sorterSaker, avrundKvarter, tidtakerMinutter, timerStatus, fyllMal, kundeVisning,
  arbeidsminutterMellom, osloDeler,
} from "../src/lib/support.js";

const NR = "H-(\\d{1,7})";
const ULID = "([0-9A-HJKMNP-TV-Z]{26})";
const alle = async (st) => (await st.all()).results;
const ikkeFunnet = (m = "Finnes ikke.") => new ApiFeil(404, "ADM-404", m);
const konflikt = (m) => new ApiFeil(409, "ADM-409", m);
export const nrTekst = (n) => `H-${n}`;
const erEier = (bruker) => bruker?.rolle === "eier";
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
const klokke = (iso) => { const p = osloDeler(iso); return `${String(p.h).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`; };

// ── Innstillinger ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function hentSupportniva(db) {
  const i = await innstilling(db, "supportniva", STANDARD_SUPPORTNIVA);
  const v = i.verdi && typeof i.verdi === "object" && i.verdi.frister ? i.verdi : STANDARD_SUPPORTNIVA;
  return { verdi: v, eksempel: i.eksempel };
}
async function tall(db, nokkel, standard) {
  const i = await innstilling(db, nokkel, standard);
  const n = Number(i.verdi);
  return { verdi: Number.isFinite(n) && n >= 0 ? n : standard, eksempel: i.eksempel };
}
const foringMin = async (db) => { const f = (await tall(db, "support_foring_min", 15)).verdi; return f >= 1 && f <= 60 ? f : 15; };

// ── Opprette sak (brukes av «Ny sak» og av POST /api/hjelp i worker/hjelp.js) ──────────────────────────────────────────────────
/**
 * Lager saken med neste løpenummer (H-1001, H-1002 …) i samme transaksjon som første melding.
 * @param {object} f  emne, tekst, prioritet, kilde, eier_id, butikk_id, kontakt_id, kontakt_navn, kontakt_epost, hvem, hjelp {side, adresse, versjon, enhet, bruker}, skjermbilde {nokkel,type,navn,bytes}, merknad, opprettet_av
 */
export async function lagSak(db, f, nivaa, d = new Date()) {
  const t = naa(d);
  const id = f.id ?? ulid(d.getTime());
  const svarfrist = beregnSvarfrist(t, f.prioritet, nivaa.verdi);
  const h = f.hjelp ?? {};
  const s = f.skjermbilde ?? {};
  const st = [
    db.prepare(`INSERT INTO sak (id, nr_tall, emne, eier_id, butikk_id, kontakt_id, kontakt_navn, kontakt_epost, kilde, prioritet, status, svarfrist, sist_aktivitet,
      hjelp_side, hjelp_adresse, hjelp_versjon, hjelp_enhet, hjelp_bruker, skjermbilde_nokkel, skjermbilde_type, skjermbilde_navn, skjermbilde_bytes, opprettet_av, opprettet, endret)
      VALUES (?, (SELECT COALESCE(MAX(nr_tall), 1000) + 1 FROM sak), ?, ?, ?, ?, ?, ?, ?, ?, 'ny', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, f.emne, f.eier_id ?? null, f.butikk_id ?? null, f.kontakt_id ?? null, f.kontakt_navn ?? null, f.kontakt_epost ?? null, f.kilde, f.prioritet, svarfrist, t,
        h.side ?? null, h.adresse ?? null, h.versjon ?? null, h.enhet ?? null, h.bruker ?? null, s.nokkel ?? null, s.type ?? null, s.navn ?? null, s.bytes ?? null, f.opprettet_av ?? null, t, t),
  ];
  const kanal = f.kilde === "hjelp-crm" ? "Sendt med «Hjelp» i CRM" : f.kilde === "hjelp-ute" ? "Sendt med «Hjelp» i Ute" : f.kilde === "telefon" ? "Telefon" : "E-post";
  if (f.tekst) st.push(db.prepare("INSERT INTO melding (id, sak_id, type, hvem, tid, kanal, tekst, opprettet, endret) VALUES (?, ?, 'kunde', ?, ?, ?, ?, ?, ?)").bind(ulid(d.getTime()), id, f.hvem || f.kontakt_navn || "Kunden", t, kanal, f.tekst, t, t));
  if (f.merknad) st.push(db.prepare("INSERT INTO melding (id, sak_id, type, hvem, tid, kanal, tekst, opprettet, endret) VALUES (?, ?, 'intern', 'Admin', ?, NULL, ?, ?, ?)").bind(ulid(d.getTime()), id, t, f.merknad, t, t));
  await db.batch(st);
  const nr = await db.prepare("SELECT nr_tall FROM sak WHERE id = ?").bind(id).first("nr_tall");
  return { id, nr: nrTekst(nr), svarfrist };
}

// ── Visning ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const SAK_SQL = `SELECT s.*, e.navn AS eier_navn, b.navn AS butikk_navn, k.navn AS k_navn, k.rolle AS k_rolle, k.telefon AS k_telefon, k.epost AS k_epost
  FROM sak s LEFT JOIN eier e ON e.id = s.eier_id LEFT JOIN butikk b ON b.id = s.butikk_id LEFT JOIN kontakt k ON k.id = s.kontakt_id`;

function visSak(r, naaIso, nivaa) {
  return {
    id: r.id, nr: nrTekst(r.nr_tall), emne: r.emne, eier_id: r.eier_id, eier_navn: r.eier_navn ?? null, butikk_id: r.butikk_id, butikk_navn: r.butikk_navn ?? null,
    kontakt_id: r.kontakt_id, kontakt_navn: r.k_navn ?? r.kontakt_navn ?? null, kilde: r.kilde, kilde_navn: KILDENAVN[r.kilde], prioritet: r.prioritet,
    prioritet_navn: PRIORITETSNAVN[r.prioritet], status: r.status, status_navn: STATUSNAVN[r.status], opprettet: r.opprettet, svarfrist: r.svarfrist,
    frist_igjen_min: r.frist_igjen_min, lost_tid: r.lost_tid, sist_aktivitet: r.sist_aktivitet, frist: fristTilstand(r, naaIso, nivaa),
  };
}

async function hentSakRad(db, nr) {
  const r = await db.prepare(`${SAK_SQL} WHERE s.nr_tall = ?`).bind(Number(nr)).first();
  if (!r) throw ikkeFunnet("Saken finnes ikke.");
  return r;
}

const APNE = ["ny", "aapen", "venter"];
function filtrer(saker, { status, prioritet, kilde, eier, sok }) {
  const q = (sok ?? "").toLowerCase();
  return saker.filter((s) => (!status || status === "alle" || (status === "apne" ? APNE.includes(s.status) : s.status === status))
    && (!prioritet || prioritet === "alle" || s.prioritet === prioritet)
    && (!kilde || kilde === "alle" || s.kilde === kilde)
    && (!eier || s.eier_id === eier)
    && (!q || [s.nr, s.emne, s.kontakt_navn, s.eier_navn, s.butikk_navn].some((x) => x && x.toLowerCase().includes(q))));
}

/** Fornavn til svarmalene */
const fornavn = (navn) => (navn ? String(navn).trim().split(/\s+/)[0] : "");

/** Butikkene til en eier som «2 × Butikk, 1 × Start», og inkluderte supportminutter per måned fra gjeldende prisliste */
async function pakkerOgInkludert(db, eier) {
  const butikker = await alle(db.prepare("SELECT pakke FROM butikk WHERE eier_id = ? ORDER BY rekkefolge").bind(eier.id));
  const rad = await gjeldendePrislisteRad(db);
  let pl = null;
  if (rad) { const { pl: p, rader } = await prislisteMedRader(db, rad.id); pl = normaliserPrisliste(p, rader); }
  const pakker = pl?.pakker?.[eier.produktlinje] ?? pl?.pakker?.hengsel ?? {};
  const telling = {};
  let inkl = 0;
  for (const b of butikker) {
    const k = b.pakke ?? "butikk";
    telling[k] = (telling[k] ?? 0) + 1;
    inkl += Number(pakker[k]?.support_timer ?? 0) * 60;
  }
  const navn = { komplett: "Komplett", butikk: "Butikk", start: "Start" };
  const tekst = ["komplett", "butikk", "start"].filter((k) => telling[k]).map((k) => `${telling[k]} × ${pakker[k]?.navn ?? navn[k]}`).join(", ");
  return { tekst, inkludert_min: inkl, butikker: butikker.length };
}

async function bruktIMnd(db, eierId, mnd) {
  return Number(await db.prepare("SELECT COALESCE(SUM(minutter), 0) AS m FROM tidsforing WHERE eier_id = ? AND substr(dato, 1, 7) = ?").bind(eierId, mnd).first("m"));
}

/** Avtaleår for SB3: «År 1 til 28.02.2027» eller «År 2 fra 15.11.2025 …» (60-212 spørsmål 1: samme timer så lenge avtalen løper) */
function avtaleAar(start, mnd) {
  if (!start) return { aar: null, tekst: "" };
  const d = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
  const slutt1 = pluss(plussMnd(start, 12), -1);
  if (`${mnd}-01` <= slutt1) return { aar: 1, tekst: `År 1 til ${d(slutt1)}` };
  const aar = Math.floor((Number(mnd.slice(0, 4)) * 12 + Number(mnd.slice(5, 7)) - (Number(start.slice(0, 4)) * 12 + Number(start.slice(5, 7)))) / 12) + 1;
  return { aar, tekst: `År ${aar} fra ${d(plussMnd(start, 12 * (aar - 1)))}. Regnet som år 1 til regelen er avklart` };
}

async function lesSakFelt(b, db, { ny = false } = {}) {
  const ut = {};
  if (ny || b.emne !== undefined) ut.emne = V.tekst(b.emne, "emne", { maks: 150, pakrevd: true });
  if (ny || b.prioritet !== undefined) ut.prioritet = V.valg(b.prioritet, "prioritet", PRIORITETER, { pakrevd: ny, standard: "normal" }) ?? "normal";
  if (b.eier_id !== undefined) ut.eier_id = b.eier_id ? V.id(b.eier_id, "eier_id") : null;
  if (b.butikk_id !== undefined) ut.butikk_id = b.butikk_id ? V.id(b.butikk_id, "butikk_id") : null;
  if (b.kontakt_id !== undefined) ut.kontakt_id = b.kontakt_id ? V.id(b.kontakt_id, "kontakt_id") : null;
  if (ut.eier_id && !(await db.prepare("SELECT 1 FROM eier WHERE id = ?").bind(ut.eier_id).first())) throw V.feil("eier_id", "Kunden finnes ikke.");
  if (ut.butikk_id && !(await db.prepare("SELECT 1 FROM butikk WHERE id = ? AND (? IS NULL OR eier_id = ?)").bind(ut.butikk_id, ut.eier_id ?? null, ut.eier_id ?? null).first())) throw V.feil("butikk_id", "Butikken hører ikke til kunden.");
  if (ut.kontakt_id && !(await db.prepare("SELECT 1 FROM kontakt WHERE id = ? AND (? IS NULL OR eier_id = ?)").bind(ut.kontakt_id, ut.eier_id ?? null, ut.eier_id ?? null).first())) throw V.feil("kontakt_id", "Kontakten hører ikke til kunden.");
  return ut;
}

// ── Rutene ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function monter(rute) {
  // SB1 Saker: liste med filter og sortering, antall per valg
  rute("GET", "/api/saker", async ({ db, url }) => {
    const nivaa = await hentSupportniva(db);
    const n = naa();
    const rader = await alle(db.prepare(`${SAK_SQL} ORDER BY s.nr_tall DESC`));
    const saker = rader.map((r) => visSak(r, n, nivaa.verdi));
    const f = {
      status: V.valg(url.searchParams.get("status") || undefined, "status", ["apne", "alle", ...STATUSER], { standard: "apne" }),
      prioritet: V.valg(url.searchParams.get("prioritet") || undefined, "prioritet", ["alle", ...PRIORITETER], { standard: "alle" }),
      kilde: V.valg(url.searchParams.get("kilde") || undefined, "kilde", ["alle", ...KILDER], { standard: "alle" }),
      eier: url.searchParams.get("eier") ? V.id(url.searchParams.get("eier"), "eier") : null,
      sok: V.tekst(url.searchParams.get("sok") ?? "", "sok", { maks: 100 }) ?? "",
    };
    const tell = (liste, felt, verdier) => Object.fromEntries(verdier.map((v) => [v, liste.filter((s) => (v === "apne" ? APNE.includes(s.status) : v === "alle" ? true : s[felt] === v)).length]));
    const antall = {
      status: tell(filtrer(saker, { ...f, status: "alle" }), "status", ["apne", ...STATUSER]),
      prioritet: tell(filtrer(saker, { ...f, prioritet: "alle" }), "prioritet", ["alle", ...PRIORITETER]),
      kilde: tell(filtrer(saker, { ...f, kilde: "alle" }), "kilde", ["alle", ...KILDER]),
    };
    const apne = saker.filter((s) => APNE.includes(s.status));
    const kunder = [...new Map(saker.filter((s) => s.eier_id).map((s) => [s.eier_id, { id: s.eier_id, navn: s.eier_navn }])).values()].sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
    return { naa: n, filter: f, saker: sorterSaker(filtrer(saker, f)), antall, apne: apne.length, forfalt: apne.filter((s) => s.frist.tilstand === "forfalt").length, kunder, supportniva_eksempel: nivaa.eksempel, totalt: saker.length };
  });

  // Valg til «Ny sak»: kunder med butikker og kontakter
  rute("GET", "/api/saker/valg", async ({ db }) => {
    const eiere = await alle(db.prepare("SELECT id, navn, er_kunde FROM eier ORDER BY er_kunde DESC, navn"));
    const butikker = await alle(db.prepare("SELECT id, eier_id, navn FROM butikk ORDER BY rekkefolge, navn"));
    const kontakter = await alle(db.prepare("SELECT id, eier_id, navn, rolle FROM kontakt ORDER BY primaer DESC, navn"));
    return { eiere: eiere.map((e) => ({ ...e, er_kunde: !!e.er_kunde, butikker: butikker.filter((b) => b.eier_id === e.id), kontakter: kontakter.filter((k) => k.eier_id === e.id) })), prioriteter: PRIORITETER, kilder: ["epost", "telefon"] };
  });

  // «Ny sak» fra e-post eller telefon
  rute("POST", "/api/saker", async ({ req, db, bruker }) => {
    const b = await V.lesJson(req);
    const f = await lesSakFelt(b, db, { ny: true });
    const kilde = V.valg(b.kilde, "kilde", ["epost", "telefon"], { standard: "epost" });
    const tekst = V.tekst(b.tekst, "tekst", { maks: 8000, linjeskift: true });
    const kontakt_navn = V.tekst(b.kontakt_navn, "kontakt_navn", { maks: 120 });
    const kontakt_epost = V.epost(b.kontakt_epost, "kontakt_epost");
    let hvem = kontakt_navn;
    if (!hvem && f.kontakt_id) hvem = (await db.prepare("SELECT navn FROM kontakt WHERE id = ?").bind(f.kontakt_id).first("navn")) ?? null;
    const nivaa = await hentSupportniva(db);
    const sak = await lagSak(db, { ...f, kilde, tekst, kontakt_navn, kontakt_epost, hvem: hvem ?? "Kunden", opprettet_av: bruker.navn }, nivaa);
    return sak;
  });

  // SB2 Sak
  rute("GET", `/api/saker/${NR}`, async ({ db, p, bruker }) => {
    const r = await hentSakRad(db, p[0]);
    const nivaa = await hentSupportniva(db);
    const n = naa();
    const sak = visSak(r, n, nivaa.verdi);
    const meldinger = await alle(db.prepare("SELECT id, type, hvem, tid, kanal, tekst, utsendelse FROM melding WHERE sak_id = ? ORDER BY tid, opprettet").bind(r.id));
    const tid = await alle(db.prepare("SELECT id, dato, fra, til, minutter, hvem, hvem_epost, tekst, maate, fakturert_i FROM tidsforing WHERE sak_id = ? ORDER BY dato, fra, opprettet").bind(r.id));
    const tidtaker = await db.prepare("SELECT startet FROM tidtaker WHERE sak_id = ? AND hvem_epost = ?").bind(r.id, bruker.epost ?? "").first();
    const f = fristFor(r.prioritet, nivaa.verdi);
    let eier = null, timerMnd = null;
    if (r.eier_id) {
      const e = await db.prepare("SELECT id, navn, produktlinje FROM eier WHERE id = ?").bind(r.eier_id).first();
      const pk = await pakkerOgInkludert(db, e);
      const mnd = idagOslo().slice(0, 7);
      const brukt = await bruktIMnd(db, e.id, mnd);
      eier = { id: e.id, navn: e.navn, pakker: pk.tekst };
      timerMnd = { mnd, mnd_navn: MND[Number(mnd.slice(5, 7)) - 1], inkludert_min: pk.inkludert_min, brukt_min: brukt, ...timerStatus({ inkludert_min: pk.inkludert_min, brukt_min: brukt }) };
    }
    const maler = (await innstilling(db, "svarmaler", [])).verdi ?? [];
    const lenke = (await innstilling(db, "brukerveiledning_url", "")).verdi ?? "";
    const navn = r.k_navn ?? r.kontakt_navn;
    return {
      naa: n, sak,
      frist_tekst: `Svarfrist for ${PRIORITETSNAVN[r.prioritet].toLowerCase()}: ${f.tekst}${nivaa.eksempel ? " (eksempel)" : ""}`,
      kontakt: { navn, rolle: r.k_rolle ?? null, telefon: r.k_telefon ?? null, epost: r.k_epost ?? r.kontakt_epost ?? null },
      eier, butikk_navn: r.butikk_navn ?? null,
      hjelp: r.kilde.startsWith("hjelp") ? { side: r.hjelp_side, adresse: r.hjelp_adresse, versjon: r.hjelp_versjon, enhet: r.hjelp_enhet, bruker: r.hjelp_bruker,
        skjermbilde: r.skjermbilde_nokkel ? { navn: r.skjermbilde_navn, bytes: r.skjermbilde_bytes, url: `/api/saker/${nrTekst(r.nr_tall)}/skjermbilde` } : null } : null,
      meldinger, tid, sum_min: tid.reduce((s, x) => s + Number(x.minutter), 0), tidtaker: tidtaker ? { startet: tidtaker.startet } : null,
      timer_mnd: timerMnd, foring_min: await foringMin(db), brukerveiledning_url: lenke,
      svarmaler: Array.isArray(maler) ? maler.map((m) => ({ navn: m.navn, tekst: fyllMal(m.tekst, { fornavn: fornavn(navn), svarfrist: f.tekst, lenke }) })) : [],
      statuser: STATUSER.map((s) => ({ id: s, navn: STATUSNAVN[s] })), kan_apne_kunde: erEier(bruker),
    };
  });

  // Statusbytte (frist-stopp ved «venter på kunde»), prioritet, emne og kunde
  rute("PATCH", `/api/saker/${NR}`, async ({ req, db, p }) => {
    const r = await hentSakRad(db, p[0]);
    const b = await V.lesJson(req);
    const nivaa = await hentSupportniva(db);
    const f = await lesSakFelt(b, db);
    const n = naa();
    let sak = { ...r };
    if (f.prioritet && f.prioritet !== r.prioritet) {
      sak.prioritet = f.prioritet;
      sak.svarfrist = beregnSvarfrist(r.opprettet, f.prioritet, nivaa.verdi);
      if (r.status === "venter" && r.frist_stoppet) sak.frist_igjen_min = arbeidsminutterMellom(r.frist_stoppet, sak.svarfrist, nivaa.verdi.arbeidstid);
    }
    if (b.status !== undefined) {
      const ny = V.valg(b.status, "status", STATUSER, { pakrevd: true });
      sak = { ...sak, ...byttStatus(sak, ny, n, nivaa.verdi) };
    }
    const emne = f.emne ?? r.emne;
    await db.prepare(`UPDATE sak SET emne = ?, prioritet = ?, status = ?, svarfrist = ?, frist_stoppet = ?, frist_igjen_min = ?, lost_tid = ?,
      eier_id = ?, butikk_id = ?, kontakt_id = ?, sist_aktivitet = ?, endret = ? WHERE id = ?`)
      .bind(emne, sak.prioritet, sak.status, sak.svarfrist, sak.frist_stoppet ?? null, sak.frist_igjen_min ?? null, sak.lost_tid ?? null,
        f.eier_id !== undefined ? f.eier_id : r.eier_id, f.butikk_id !== undefined ? f.butikk_id : r.butikk_id, f.kontakt_id !== undefined ? f.kontakt_id : r.kontakt_id, n, n, r.id).run();
    const ny = await hentSakRad(db, p[0]);
    return { sak: visSak(ny, n, nivaa.verdi) };
  });

  // Ny melding: svar til kunden (lagres som e-postutkast), internt notat, eller kundens svar registrert for hånd
  rute("POST", `/api/saker/${NR}/meldinger`, async ({ req, db, p, bruker }) => {
    const r = await hentSakRad(db, p[0]);
    const b = await V.lesJson(req);
    const type = V.valg(b.type, "type", MELDINGSTYPER, { pakrevd: true });
    const tekst = V.tekst(b.tekst, "tekst", { maks: 8000, pakrevd: true, linjeskift: true });
    const nivaa = await hentSupportniva(db);
    const n = naa();
    const id = ulid();
    const hvem = type === "kunde" ? (V.tekst(b.hvem, "hvem", { maks: 120 }) ?? r.k_navn ?? r.kontakt_navn ?? "Kunden") : bruker.navn;
    const kanal = type === "svar" ? "E-post (utkast, ikke sendt)" : type === "kunde" ? (V.valg(b.kanal, "kanal", ["E-post", "Telefon"], { standard: "E-post" })) : null;
    // Svar fra Ny gjør saken Åpen. Kundens svar på en sak som venter eller er løst starter klokka igjen.
    let status = r.status;
    if (type === "svar" && r.status === "ny") status = "aapen";
    if (type === "kunde" && (r.status === "venter" || r.status === "lost")) status = "aapen";
    const sak = status !== r.status ? byttStatus(r, status, n, nivaa.verdi) : { status: r.status, svarfrist: r.svarfrist, frist_stoppet: r.frist_stoppet, frist_igjen_min: r.frist_igjen_min, lost_tid: r.lost_tid };
    await db.batch([
      db.prepare("INSERT INTO melding (id, sak_id, type, hvem, tid, kanal, tekst, utsendelse, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, r.id, type, hvem, n, kanal, tekst, type === "svar" ? "utkast" : null, n, n),
      db.prepare("UPDATE sak SET status = ?, svarfrist = ?, frist_stoppet = ?, frist_igjen_min = ?, lost_tid = ?, sist_aktivitet = ?, endret = ? WHERE id = ?")
        .bind(sak.status, sak.svarfrist, sak.frist_stoppet ?? null, sak.frist_igjen_min ?? null, sak.lost_tid ?? null, n, n, r.id),
    ]);
    return { id, status: sak.status, epost: type === "svar" ? await epostUtkast(db, r.nr_tall, id) : null };
  });

  // Forhåndsvisning av e-posten til kunden (utkast, sendes ikke)
  rute("GET", `/api/saker/${NR}/epost-utkast/${ULID}`, async ({ db, p }) => ({ epost: await epostUtkast(db, p[0], p[1]) }));

  // Tidtaker: start, avbryt, stopp og før
  rute("POST", `/api/saker/${NR}/tidtaker`, async ({ db, p, bruker }) => {
    const r = await hentSakRad(db, p[0]);
    const n = naa();
    await db.prepare("INSERT INTO tidtaker (sak_id, hvem_epost, startet) VALUES (?, ?, ?) ON CONFLICT(sak_id, hvem_epost) DO NOTHING").bind(r.id, bruker.epost ?? "", n).run();
    return { startet: await db.prepare("SELECT startet FROM tidtaker WHERE sak_id = ? AND hvem_epost = ?").bind(r.id, bruker.epost ?? "").first("startet") };
  });
  rute("DELETE", `/api/saker/${NR}/tidtaker`, async ({ db, p, bruker }) => {
    const r = await hentSakRad(db, p[0]);
    await db.prepare("DELETE FROM tidtaker WHERE sak_id = ? AND hvem_epost = ?").bind(r.id, bruker.epost ?? "").run();
    return {};
  });
  rute("POST", `/api/saker/${NR}/tidtaker/stopp`, async ({ req, db, p, bruker }) => {
    const r = await hentSakRad(db, p[0]);
    const b = await V.lesJson(req);
    const tekst = V.tekst(b.tekst, "tekst", { maks: 300 });
    const t = await db.prepare("SELECT startet FROM tidtaker WHERE sak_id = ? AND hvem_epost = ?").bind(r.id, bruker.epost ?? "").first();
    if (!t) throw konflikt("Tidtakeren går ikke.");
    const n = naa();
    const minutter = Math.min(1440, tidtakerMinutter(t.startet, n, await foringMin(db)) || (await foringMin(db)));
    const id = ulid();
    await db.batch([
      db.prepare("DELETE FROM tidtaker WHERE sak_id = ? AND hvem_epost = ?").bind(r.id, bruker.epost ?? ""),
      db.prepare("INSERT INTO tidsforing (id, sak_id, eier_id, dato, fra, til, minutter, hvem, hvem_epost, tekst, maate, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'tidtaker', ?, ?)")
        .bind(id, r.id, r.eier_id, idagOslo(new Date(t.startet)), klokke(t.startet), klokke(n), minutter, bruker.navn, bruker.epost ?? null, tekst, n, n),
      db.prepare("UPDATE sak SET sist_aktivitet = ?, endret = ? WHERE id = ?").bind(n, n, r.id),
    ]);
    return { id, minutter };
  });
  rute("POST", `/api/saker/${NR}/tid`, async ({ req, db, p, bruker }) => {
    const r = await hentSakRad(db, p[0]);
    const b = await V.lesJson(req);
    const ra = V.heltall(b.minutter, "minutter", { min: 1, maks: 1440, pakrevd: true });
    const tekst = V.tekst(b.tekst, "tekst", { maks: 300, pakrevd: true });
    const dato = V.dato(b.dato, "dato") ?? idagOslo();
    const minutter = avrundKvarter(ra, await foringMin(db));
    const n = naa();
    const id = ulid();
    await db.batch([
      db.prepare("INSERT INTO tidsforing (id, sak_id, eier_id, dato, minutter, hvem, hvem_epost, tekst, maate, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manuell', ?, ?)")
        .bind(id, r.id, r.eier_id, dato, minutter, bruker.navn, bruker.epost ?? null, tekst, n, n),
      db.prepare("UPDATE sak SET sist_aktivitet = ?, endret = ? WHERE id = ?").bind(n, n, r.id),
    ]);
    return { id, minutter };
  });
  rute("DELETE", `/api/tidsforing/${ULID}`, async ({ db, p, bruker }) => {
    const t = await db.prepare("SELECT * FROM tidsforing WHERE id = ?").bind(p[0]).first();
    if (!t) throw ikkeFunnet("Føringen finnes ikke.");
    if (t.fakturert_i) throw konflikt("Føringen er fakturert og kan ikke slettes.");
    if (!erEier(bruker) && t.hvem_epost !== bruker.epost) throw new ApiFeil(403, "ADM-403", "Du kan bare slette egne føringer.");
    await db.prepare("DELETE FROM tidsforing WHERE id = ?").bind(p[0]).run();
    return {};
  });

  // SB3 Timer per kunde og måned. Support-rollen får ikke beløp.
  rute("GET", "/api/timer", async ({ db, url, bruker }) => {
    const mnd = url.searchParams.get("mnd") || idagOslo().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mnd)) throw V.feil("mnd", "Må være en måned (ÅÅÅÅ-MM).");
    const timepris = await tall(db, "support_timepris_ore", 115000);
    const visBelop = erEier(bruker);
    const kunder = await alle(db.prepare(`SELECT e.id, e.navn, e.produktlinje, MIN(a.start) AS start FROM eier e JOIN avtale a ON a.eier_id = e.id
      WHERE e.er_kunde = 1 AND a.status IN ('signert', 'sagt_opp') GROUP BY e.id ORDER BY e.navn`));
    const neste = plussMnd(`${mnd}-01`, 1);
    const rader = [];
    for (const k of kunder) {
      const pk = await pakkerOgInkludert(db, k);
      const brukt = await bruktIMnd(db, k.id, mnd);
      const saker = Number(await db.prepare("SELECT COUNT(DISTINCT sak_id) AS n FROM tidsforing WHERE eier_id = ? AND substr(dato, 1, 7) = ?").bind(k.id, mnd).first("n"));
      const st = timerStatus({ inkludert_min: pk.inkludert_min, brukt_min: brukt, timepris_ore: visBelop ? timepris.verdi : null });
      rader.push({ eier_id: k.id, navn: k.navn, pakker: pk.tekst, inkludert_min: pk.inkludert_min, brukt_min: brukt, saker, avtaleaar: avtaleAar(k.start, mnd), ...st });
    }
    return {
      mnd, mnd_navn: `${MND[Number(mnd.slice(5, 7)) - 1]} ${mnd.slice(0, 4)}`, faktura_mnd: MND[Number(neste.slice(5, 7)) - 1], forrige: plussMnd(`${mnd}-01`, -1).slice(0, 7), neste: neste.slice(0, 7),
      timepris_ore: visBelop ? timepris.verdi : null, timepris_eksempel: timepris.eksempel, vis_belop: visBelop, foring_min: await foringMin(db), kunder: rader,
    };
  });

  // Tallene i sidemenyen (åpne saker, oppstarter i gang). Support får bare saker.
  rute("GET", "/api/meny-tall", async ({ db, bruker }) => {
    const saker = Number(await db.prepare("SELECT COUNT(*) AS n FROM sak WHERE status IN ('ny','aapen','venter')").first("n"));
    if (!erEier(bruker)) return { saker };
    const oppstart = Number(await db.prepare("SELECT COUNT(*) AS n FROM oppstart o WHERE (SELECT COUNT(*) FROM oppstartspunkt p WHERE p.oppstart_id = o.id AND p.status = 'ferdig') < (SELECT COUNT(*) FROM oppstartspunkt p WHERE p.oppstart_id = o.id) OR NOT EXISTS (SELECT 1 FROM oppstartspunkt p WHERE p.oppstart_id = o.id)").first("n"));
    return { saker, oppstart };
  });

  // SA1-kortet «Åpne saker og frister»: de fire nærmeste, forfalt først
  rute("GET", "/api/oversikt/saker", async ({ db }) => {
    const nivaa = await hentSupportniva(db);
    const n = naa();
    const saker = (await alle(db.prepare(`${SAK_SQL} WHERE s.status IN ('ny','aapen','venter')`))).map((r) => visSak(r, n, nivaa.verdi));
    return { apne: saker.length, forfalt: saker.filter((s) => s.frist.tilstand === "forfalt").length, saker: sorterSaker(saker).slice(0, 4) };
  });

  // Innstillinger › Support: supportnivå, timepris, føres i, svarmaler, brukerveiledning, Origin-lista for «Hjelp»
  rute("GET", "/api/support/innstillinger", async ({ db }) => {
    const nivaa = await hentSupportniva(db);
    const pris = await tall(db, "support_timepris_ore", 115000);
    const foring = await tall(db, "support_foring_min", 15);
    const maler = await innstilling(db, "svarmaler", []);
    const lenke = await innstilling(db, "brukerveiledning_url", "");
    const origins = await innstilling(db, "hjelp_origins", ["https://*.hengsel.no"]);
    return { supportniva: nivaa.verdi, supportniva_eksempel: nivaa.eksempel, timepris_ore: pris.verdi, timepris_eksempel: pris.eksempel, foring_min: foring.verdi, foring_eksempel: foring.eksempel,
      svarmaler: maler.verdi ?? [], svarmaler_eksempel: maler.eksempel, brukerveiledning_url: lenke.verdi ?? "", hjelp_origins: origins.verdi ?? [] };
  });
  rute("PATCH", "/api/support/innstillinger", async ({ req, db }) => {
    const b = await V.lesJson(req);
    const eksempel = V.flagg(b.eksempel, "eksempel", { standard: 0 });
    if (b.supportniva !== undefined) {
      const s = b.supportniva;
      if (!s || typeof s !== "object") throw V.feil("supportniva", "Må være et objekt.");
      const frister = {};
      for (const pr of PRIORITETER) {
        const f = s.frister?.[pr] ?? {};
        const tekst = V.tekst(f.tekst, `frister.${pr}.tekst`, { maks: 40, pakrevd: true });
        if (f.min != null && f.min !== "") frister[pr] = { min: V.heltall(f.min, `frister.${pr}.min`, { min: 1, maks: 100_000 }), tekst };
        else frister[pr] = { virkedager: V.heltall(f.virkedager, `frister.${pr}.virkedager`, { min: 1, maks: 60, pakrevd: true }), tekst };
      }
      const a = s.arbeidstid ?? {};
      const kl = (v, navn) => { if (typeof v !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw V.feil(navn, "Skriv tid som TT:MM."); return v; };
      const fra = kl(a.fra, "arbeidstid.fra"), til = kl(a.til, "arbeidstid.til");
      if (til <= fra) throw V.feil("arbeidstid.til", "Må være etter starten.");
      const dager = V.liste(a.dager, "arbeidstid.dager", { maks: 7 }).map((d) => V.heltall(d, "arbeidstid.dager", { min: 1, maks: 7 }));
      if (!dager.length) throw V.feil("arbeidstid.dager", "Velg minst én dag.");
      await settInnstilling(db, "supportniva", { frister, arbeidstid: { fra, til, dager: [...new Set(dager)].sort() } }, eksempel);
    }
    if (b.timepris_ore !== undefined) await settInnstilling(db, "support_timepris_ore", V.heltall(b.timepris_ore, "timepris_ore", { min: 0, maks: 10_000_000, pakrevd: true }), eksempel);
    if (b.foring_min !== undefined) await settInnstilling(db, "support_foring_min", V.heltall(b.foring_min, "foring_min", { min: 1, maks: 60, pakrevd: true }), eksempel);
    if (b.svarmaler !== undefined) {
      const m = V.liste(b.svarmaler, "svarmaler", { maks: 30 }).map((x, i) => ({ navn: V.tekst(x?.navn, `svarmaler.${i}.navn`, { maks: 60, pakrevd: true }), tekst: V.tekst(x?.tekst, `svarmaler.${i}.tekst`, { maks: 2000, pakrevd: true, linjeskift: true }) }));
      await settInnstilling(db, "svarmaler", m, eksempel);
    }
    if (b.brukerveiledning_url !== undefined) {
      const u = V.tekst(b.brukerveiledning_url, "brukerveiledning_url", { maks: 300 }) ?? "";
      if (u && !/^https:\/\/[^\s]+$/.test(u)) throw V.feil("brukerveiledning_url", "Må starte med https://.");
      await settInnstilling(db, "brukerveiledning_url", u, eksempel);
    }
    if (b.hjelp_origins !== undefined) {
      const o = V.liste(b.hjelp_origins, "hjelp_origins", { maks: 50 }).map((x, i) => { const s = V.tekst(x, `hjelp_origins.${i}`, { maks: 200, pakrevd: true }); if (!/^https:\/\/(\*\.)?[a-z0-9.-]+$/i.test(s)) throw V.feil("hjelp_origins", `Ugyldig adresse: ${s}`); return s.toLowerCase(); });
      await settInnstilling(db, "hjelp_origins", o, 0);
    }
    return {};
  });

  // Brukere og roller: supportpersoner (rollen eier står i worker/tilgang.js og kan ikke gis herfra)
  rute("GET", "/api/brukere", async ({ db }) => ({ brukere: await alle(db.prepare("SELECT id, epost, navn, rolle, aktiv, sist_innlogget FROM bruker ORDER BY rolle, navn")) }));
  rute("POST", "/api/brukere", async ({ req, db }) => {
    const b = await V.lesJson(req);
    const epost = V.epost(b.epost, "epost", { pakrevd: true });
    const navn = V.tekst(b.navn, "navn", { maks: 120, pakrevd: true });
    if (await db.prepare("SELECT 1 FROM bruker WHERE epost = ?").bind(epost).first()) throw konflikt("Adressen finnes allerede.");
    const id = ulid(), n = naa();
    await db.prepare("INSERT INTO bruker (id, epost, navn, rolle, aktiv, opprettet, endret) VALUES (?, ?, ?, 'support', 1, ?, ?)").bind(id, epost, navn, n, n).run();
    return { id };
  });
  rute("PATCH", `/api/brukere/${ULID}`, async ({ req, db, p }) => {
    const b = await V.lesJson(req);
    const u = await db.prepare("SELECT * FROM bruker WHERE id = ?").bind(p[0]).first();
    if (!u) throw ikkeFunnet("Brukeren finnes ikke.");
    if (u.rolle !== "support") throw konflikt("Bare supportpersoner endres her.");
    await db.prepare("UPDATE bruker SET navn = ?, aktiv = ?, endret = ? WHERE id = ?").bind(V.tekst(b.navn, "navn", { maks: 120 }) ?? u.navn, V.flagg(b.aktiv, "aktiv", { standard: u.aktiv }), naa(), u.id).run();
    return {};
  });
}

/** GET /api/saker/H-nnnn/skjermbilde: skjermbildet fra «Hjelp» (R2), kalt fra worker/index.js etter Access-sjekken (svaret er et bilde,
 * ikke JSON). Bare bildetypene som ble godtatt ved mottak; sandbox-CSP og nosniff. */
export const SKJERMBILDE = /^\/api\/saker\/H-(\d{1,7})\/skjermbilde$/;
export async function skjermbilde(env, nr) {
  const feil = (status, kode, melding) => new Response(JSON.stringify({ ok: false, kode, melding }), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store" } });
  if (!env.DB) return feil(503, "ADM-504", "Databasen er ikke koblet til.");
  const r = await env.DB.prepare("SELECT skjermbilde_nokkel, skjermbilde_type FROM sak WHERE nr_tall = ?").bind(Number(nr)).first();
  if (!r || !r.skjermbilde_nokkel) return feil(404, "ADM-404", "Saken har ikke skjermbilde.");
  if (!env.SKJERMBILDER) return feil(503, "ADM-504", "Lagringen for skjermbilder er ikke koblet til.");
  const o = await env.SKJERMBILDER.get(r.skjermbilde_nokkel);
  if (!o) return feil(404, "ADM-404", "Skjermbildet finnes ikke lenger.");
  const type = ["image/png", "image/jpeg", "image/webp"].includes(r.skjermbilde_type) ? r.skjermbilde_type : "application/octet-stream";
  return new Response(o.body, { headers: { "Content-Type": type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox", "Content-Disposition": "inline" } });
}

/** E-postutkastet for et svar: til kontakten, med tråden slik kunden ser den (uten interne notater). Sendes ikke. */
export async function epostUtkast(db, nr, meldingId) {
  const r = await hentSakRad(db, nr);
  const m = await db.prepare("SELECT * FROM melding WHERE id = ? AND sak_id = ?").bind(meldingId, r.id).first();
  if (!m) throw ikkeFunnet("Meldingen finnes ikke.");
  if (m.type !== "svar") throw konflikt("Bare svar til kunden har e-post.");
  const alleM = await alle(db.prepare("SELECT type, hvem, tid, tekst FROM melding WHERE sak_id = ? AND tid <= ? ORDER BY tid, opprettet").bind(r.id, m.tid));
  const kv = kundeVisning({ nr: nrTekst(r.nr_tall), emne: r.emne, status: r.status, opprettet: r.opprettet }, alleM);
  const tidligere = kv.meldinger.slice(0, -1).reverse().map((x) => `${x.fra}, ${x.tid.slice(8, 10)}.${x.tid.slice(5, 7)}:\n> ${x.tekst.replace(/\n/g, "\n> ")}`).join("\n\n");
  const til = r.k_epost ?? r.kontakt_epost ?? null;
  return {
    status: "utkast", sendes: false, til, mangler_adresse: !til,
    emne: `Re: [${kv.nr}] ${kv.emne}`,
    tekst: `${m.tekst}\n\nSak ${kv.nr} · Status: ${KUNDESTATUS[r.status]}\nDu finner saken under «Mine saker» i Hengsel.${tidligere ? `\n\n${tidligere}` : ""}`,
  };
}
