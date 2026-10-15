/**
 * POST /api/lead: «Be om demo» fra hengsel.no (K-240, 60-213 punkt a SA8 og k.5). Ruten er unntatt Access-sjekken i Workeren, men har samme
 * vern som /api/demo i sites/hengsel/worker/demo.ts: bare POST, Origin må være hengsel.no (LEAD_ORIGIN, standard https://hengsel.no),
 * maks 8 KB, honeypot «nettsted», tidsfeltet «t» (3 sekunder til 24 timer gammelt), lengdegrenser og kontrolltegn.
 * Valgfritt ekstra lag: er hemmeligheten LEAD_NOKKEL satt i Workeren, må forespørselen ha «Authorization: Bearer <nøkkel>» (hengsel-Workeren
 * sender den når den har samme hemmelighet). Ingen nøkler i koden.
 *
 * Et lead blir en eier med status Ny og kilde «be_om_demo», en kontakt, én butikk og én åpen mulighet, merket «Ny» i Oversikt (lead_ny)
 * og med neste steg «Ta kontakt innen 24 timer». Finnes kontakten fra før (samme e-post eller telefon), legges leadet som en aktivitet på
 * eieren i stedet for en ny eier.
 */
import { naa, idagOslo, ulid, json } from "./db.js";
import { KONTROLL, EPOST_RE } from "./valider.js";

export const MAKS_BODY = 8 * 1024;
export const MIN_ALDER = 3_000;
export const MAKS_ALDER = 24 * 60 * 60 * 1000;
const MAKS_FREMTID = 60_000;
export const AVDELINGER = { "1": { tekst: "1", antall: 1 }, "2-3": { tekst: "2–3", antall: 2 }, "4+": { tekst: "4 eller flere", antall: 4 } };
const GRENSER = { navn: 120, butikk: 120, epost: 254, melding: 1000 };
export const STANDARD_ORIGIN = "https://hengsel.no";
export const NESTE_STEG = "Ta kontakt innen 24 timer";
export const KANAL = "hengsel.no/priser-og-demo";

const svar = (status, data) => json(status, data, { "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'" });

export async function handterLead(req, env, na = Date.now()) {
  if (req.method.toUpperCase() !== "POST") return svar(405, { ok: false, feil: { skjema: "Metoden er ikke tillatt." } });
  const tillatt = (env.LEAD_ORIGIN ?? STANDARD_ORIGIN).trim().replace(/\/+$/, "");
  if (req.headers.get("Origin") !== tillatt) return svar(403, { ok: false, feil: { skjema: "Forespørselen kom fra en annen adresse." } });
  if (typeof env.LEAD_NOKKEL === "string" && env.LEAD_NOKKEL) {
    const auth = req.headers.get("Authorization") ?? "";
    if (!likeStrenger(auth, `Bearer ${env.LEAD_NOKKEL}`)) return svar(403, { ok: false, feil: { skjema: "Mangler nøkkel." } });
  }
  if (!env.DB) return svar(503, { ok: false, kode: "ADM-504", feil: { skjema: "Databasen er ikke koblet til." } });
  const lengde = Number(req.headers.get("Content-Length") ?? "0");
  if (lengde > MAKS_BODY) return svar(413, { ok: false, feil: { skjema: "Forespørselen er for stor." } });
  const type = (req.headers.get("Content-Type") ?? "").toLowerCase();
  const erJson = type.startsWith("application/json");
  if (!erJson && !type.startsWith("application/x-www-form-urlencoded")) return svar(415, { ok: false, feil: { skjema: "Ukjent innholdstype." } });
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.byteLength > MAKS_BODY) return svar(413, { ok: false, feil: { skjema: "Forespørselen er for stor." } });
  const rå = lesBody(new TextDecoder().decode(bytes), erJson);
  if (!rå) return svar(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } });
  // Honeypot: roboter fyller det skjulte feltet. De får samme svar som om det gikk bra.
  if ((rå.nettsted ?? "") !== "") return svar(200, { ok: true });
  const t = Number(rå.t);
  if (!rå.t || !Number.isFinite(t)) return svar(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } });
  const alder = na - t;
  if (alder < MIN_ALDER || alder > MAKS_ALDER || alder < -MAKS_FREMTID) return svar(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } });
  const { felt, feil } = valider(rå);
  if (!felt) return svar(400, { ok: false, feil });
  try {
    await lagreLead(env.DB, felt, new Date(na));
  } catch (e) {
    console.error("lead: lagring feilet", (e && e.name) || "ukjent");
    return svar(503, { ok: false, kode: "ADM-504", feil: { skjema: "Kunne ikke lagre." } });
  }
  return svar(200, { ok: true });
}

function likeStrenger(a, b) {
  if (a.length !== b.length) return false;
  let ulik = 0;
  for (let i = 0; i < a.length; i++) ulik |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ulik === 0;
}

function lesBody(tekst, erJson) {
  let ut;
  if (erJson) {
    try { const v = JSON.parse(tekst); if (!v || typeof v !== "object" || Array.isArray(v)) return null; ut = v; } catch { return null; }
  } else ut = Object.fromEntries(new URLSearchParams(tekst));
  const rent = {};
  for (const [k, v] of Object.entries(ut)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "number" && k === "t") { rent[k] = String(v); continue; }
    if (typeof v !== "string") return null;
    rent[k] = v;
  }
  return rent;
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

/** Lagrer leadet i D1. Eksportert for testene. Returnerer { eier_id, ny } */
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
    const eierId = eksisterende.eier_id;
    await db.batch([
      db.prepare("UPDATE eier SET lead_ny = 1, lead_tid = ?, lead_kanal = ?, lead_melding = COALESCE(?, lead_melding), lead_butikker = COALESCE(?, lead_butikker), endret = ? WHERE id = ?").bind(t, KANAL, melding, avd ? avd.tekst : null, t, eierId),
      db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(d.getTime()), eierId, idag, "Nytt lead fra «Be om demo»", melding, KANAL, t, t),
    ]);
    return { eier_id: eierId, ny: false };
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
  return { eier_id: eierId, ny: true };
}
