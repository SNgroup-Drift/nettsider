/**
 * Lead fra «Be om demo» på hengsel.no (K-240, 60-213 punkt a SA8 og k.5).
 *
 * Leaden kommer ikke lenger over HTTP. hengsel-Workeren kaller Admin gjennom en service binding (ADMIN_LEAD i sites/hengsel/wrangler.jsonc)
 * mot det navngitte inngangspunktet LeadInngang (worker/inngang.js, eksportert fra worker/main.js). Et slikt kall kan bare komme fra en
 * Worker i samme Cloudflare-konto som har bindingen, aldri fra internett. Den gamle ruten POST /api/lead er fjernet: stien går nå gjennom
 * Access-sjekken som alt annet (401 uten gyldig token). Honeypot, tidssjekk og Origin gjøres i /api/demo på hengsel.no før kallet.
 *
 * mottaLead(env, inn) sjekker likevel alt den får: et vanlig objekt med bare strengverdier, maks 8 KB som JSON, og de samme feltreglene som
 * valider() i sites/hengsel/worker/demo.ts. Svaret er et vanlig objekt: { ok: true, ny, dublett } eller { ok: false, kode, feil? }.
 *
 * Et lead blir en eier med status Ny og kilde «be_om_demo», en kontakt, én butikk og én åpen mulighet, merket «Ny» i Oversikt (lead_ny)
 * og med neste steg «Ta kontakt innen 24 timer». Finnes kontakten fra før (samme e-post eller telefon), endres verken kontakten eller
 * eierens felt: leadet legges bare som en aktivitet på eieren, og eieren merkes «Ny». Samme melding fra samme eier innen 24 timer lagres
 * ikke på nytt (dublett).
 */
import { naa, idagOslo, ulid } from "./db.js";
import { KONTROLL, EPOST_RE } from "./valider.js";

export const MAKS_BODY = 8 * 1024;
export const AVDELINGER = { "1": { tekst: "1", antall: 1 }, "2-3": { tekst: "2–3", antall: 2 }, "4+": { tekst: "4 eller flere", antall: 4 } };
const GRENSER = { navn: 120, butikk: 120, epost: 254, melding: 1000 };
export const NESTE_STEG = "Ta kontakt innen 24 timer";
export const KANAL = "hengsel.no/priser-og-demo";
export const DUBLETT_VINDU = 24 * 60 * 60 * 1000;
const FELT = ["navn", "butikk", "epost", "tlf", "avdelinger", "melding"];

/**
 * Tar imot et lead fra LeadInngang. Kaster aldri: feil blir { ok: false, kode }.
 * Koder: LEAD-400 (ikke et objekt eller feil type), LEAD-413 (for stort), LEAD-422 (feltfeil, med feil), ADM-504 (databasen).
 */
export async function mottaLead(env, inn, na = Date.now()) {
  if (!inn || typeof inn !== "object" || Array.isArray(inn) || Object.getPrototypeOf(inn) !== Object.prototype) return { ok: false, kode: "LEAD-400" };
  let tekst;
  try { tekst = JSON.stringify(inn); } catch { return { ok: false, kode: "LEAD-400" }; }
  if (new TextEncoder().encode(tekst).byteLength > MAKS_BODY) return { ok: false, kode: "LEAD-413" };
  const rå = {};
  for (const [k, v] of Object.entries(inn)) {
    if (v === undefined || v === null) continue;
    if (typeof v !== "string") return { ok: false, kode: "LEAD-400" };
    if (FELT.includes(k)) rå[k] = v;
  }
  const { felt, feil } = valider(rå);
  if (!felt) return { ok: false, kode: "LEAD-422", feil };
  if (!env?.DB) return { ok: false, kode: "ADM-504" };
  try {
    const r = await lagreLead(env.DB, felt, new Date(na));
    return { ok: true, ny: r.ny, dublett: r.dublett };
  } catch (e) {
    console.error("lead: lagring feilet", (e && e.name) || "ukjent");
    return { ok: false, kode: "ADM-504" };
  }
}

// eslint-disable-next-line no-control-regex
const KONTROLL_ALLE = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;

/** Samme regler som valider() i sites/hengsel/worker/demo.ts */
export function valider(rå) {
  const feil = {};
  const navn = (rå.navn ?? "").trim();
  const butikk = (rå.butikk ?? "").trim();
  const epost = (rå.epost ?? "").trim();
  const tlf = (rå.tlf ?? "").trim();
  const avdelinger = (rå.avdelinger ?? "").trim();
  const melding = (rå.melding ?? "").replace(/\r\n?/g, "\n").trim();
  if (!navn) feil.navn = "Fyll inn navn.";
  else if (navn.length > GRENSER.navn) feil.navn = "Navnet er for langt.";
  else if (KONTROLL_ALLE.test(navn)) feil.navn = "Navnet har ugyldige tegn.";
  if (butikk.length > GRENSER.butikk) feil.butikk = "Butikknavnet er for langt.";
  else if (KONTROLL_ALLE.test(butikk)) feil.butikk = "Butikknavnet har ugyldige tegn.";
  if (epost && (epost.length > GRENSER.epost || !EPOST_RE.test(epost))) feil.epost = "Skriv en gyldig e-postadresse.";
  if (tlf) {
    const siffer = tlf.replace(/[\s().-]/g, "");
    if (KONTROLL_ALLE.test(tlf) || !/^\+?\d{6,20}$/.test(siffer)) feil.tlf = "Skriv et gyldig telefonnummer.";
  }
  if (!epost && !tlf) { feil.epost = feil.epost ?? "Fyll inn e-post eller telefon."; feil.tlf = feil.tlf ?? "Fyll inn e-post eller telefon."; }
  if (avdelinger && !(avdelinger in AVDELINGER)) feil.avdelinger = "Velg et av alternativene.";
  if (melding.length > GRENSER.melding) feil.melding = "Teksten er for lang.";
  else if (KONTROLL.test(melding)) feil.melding = "Teksten har ugyldige tegn.";
  if (Object.keys(feil).length) return { felt: null, feil };
  return { felt: { navn, butikk, epost: epost.toLowerCase(), tlf, avdelinger, melding }, feil };
}

/** Lagrer leadet i D1. Eksportert for testene og eksempeldataene. Returnerer { eier_id, ny, dublett } */
export async function lagreLead(db, f, d = new Date()) {
  const t = naa(d);
  const idag = idagOslo(d);
  const avd = f.avdelinger ? AVDELINGER[f.avdelinger] : null;
  // Finnes kontakten fra før? Da blir leadet en aktivitet på eieren, ikke en ny eier.
  let eksisterende = null;
  if (f.epost) eksisterende = await db.prepare("SELECT eier_id FROM kontakt WHERE epost = ? ORDER BY opprettet LIMIT 1").bind(f.epost).first();
  if (!eksisterende && f.tlf) eksisterende = await db.prepare("SELECT eier_id FROM kontakt WHERE replace(replace(replace(telefon, ' ', ''), '-', ''), '+47', '') = ? LIMIT 1").bind(f.tlf.replace(/[\s().-]/g, "").replace(/^\+47/, "")).first();
  const melding = f.melding || null;
  if (eksisterende) {
    // Tiltak 5: kontakten og eierens felt (lead_melding, lead_butikker, lead_tid, navn …) endres ikke. Bare en aktivitet og «Ny»-merket.
    const eierId = eksisterende.eier_id;
    const fra = naa(new Date(d.getTime() - DUBLETT_VINDU));
    const dublett = await db.prepare("SELECT id FROM aktivitet WHERE eier_id = ? AND hvem = ? AND COALESCE(tekst, '') = ? AND opprettet >= ? LIMIT 1").bind(eierId, KANAL, melding ?? "", fra).first();
    if (dublett) return { eier_id: eierId, ny: false, dublett: true };
    await db.batch([
      db.prepare("UPDATE eier SET lead_ny = 1, endret = ? WHERE id = ?").bind(t, eierId),
      db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(d.getTime()), eierId, idag, "Nytt lead fra «Be om demo»", melding, KANAL, t, t),
    ]);
    return { eier_id: eierId, ny: false, dublett: false };
  }
  const eierId = ulid(d.getTime());
  const navnEier = f.butikk || f.navn;
  const kontaktId = ulid(d.getTime());
  const butikkId = ulid(d.getTime());
  const mulighetId = ulid(d.getTime());
  await db.batch([
    db.prepare(`INSERT INTO eier (id, navn, kjede, produktlinje, status, er_kunde, kilde, neste_tekst, neste_dato, lead_tid, lead_kanal, lead_melding, lead_butikker, lead_ny, opprettet, endret)
      VALUES (?, ?, 'annen', 'hengsel', 'ny', 0, 'be_om_demo', ?, ?, ?, ?, ?, ?, 1, ?, ?)`).bind(eierId, navnEier, NESTE_STEG, idag, t, KANAL, melding, avd ? avd.tekst : null, t, t),
    db.prepare("INSERT INTO kontakt (id, eier_id, navn, telefon, epost, signaturrett, primaer, opprettet, endret) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)").bind(kontaktId, eierId, f.navn, f.tlf || null, f.epost || null, t, t),
    db.prepare("INSERT INTO butikk (id, eier_id, navn, rekkefolge, opprettet, endret) VALUES (?, ?, ?, 1, ?, ?)").bind(butikkId, eierId, navnEier, t, t),
    db.prepare("INSERT INTO mulighet (id, eier_id, produktlinje, fase, antall_butikker, aapnet, opprettet, endret) VALUES (?, ?, 'hengsel', 'ny', ?, ?, ?, ?)").bind(mulighetId, eierId, avd ? avd.antall : 1, idag, t, t),
    db.prepare("INSERT INTO aktivitet (id, eier_id, kontakt_id, mulighet_id, type, dato, tittel, tekst, hvem, neste_tekst, neste_dato, opprettet, endret) VALUES (?, ?, ?, ?, 'notat', ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(ulid(d.getTime()), eierId, kontaktId, mulighetId, idag, "Lead fra «Be om demo»", melding, KANAL, NESTE_STEG, idag, t, t),
  ]);
  return { eier_id: eierId, ny: true, dublett: false };
}
