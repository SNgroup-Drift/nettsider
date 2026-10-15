/**
 * Små hjelpere for D1 og tid (K-240). Ingen SQL-strenger bygges fra brukerinput; alt bindes.
 * Datoer er ISO (2026-10-14) i norsk tid, tidspunkter er ISO med Z.
 */

export class ApiFeil extends Error {
  /** @param {number} status @param {string} kode f.eks. ADM-404 @param {string} melding @param {Record<string,string>} [felt] */
  constructor(status, kode, melding, felt) {
    super(melding);
    this.status = status;
    this.kode = kode;
    this.felt = felt;
  }
}

export const naa = (d = new Date()) => d.toISOString();

/** Dagens dato i Norge som ÅÅÅÅ-MM-DD */
export function idagOslo(d = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(d);
}

/** Legger til dager på en ISO-dato (ren kalender, uten tidssone) */
export function pluss(dato, dager) {
  const [y, m, d] = dato.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dager)).toISOString().slice(0, 10);
}
/** Legger til måneder på en ISO-dato */
export function plussMnd(dato, mnd) {
  const [y, m, d] = dato.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + mnd, d)).toISOString().slice(0, 10);
}
/** Første dag i neste måned */
export function forsteINesteMnd(dato) {
  const [y, m] = dato.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
}
/** Dager fra a til b (b − a), hele kalenderdøgn */
export function dagerMellom(a, b) {
  const t = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((t(b) - t(a)) / 86_400_000);
}

const ULID_TEGN = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
/** ULID: 10 tegn tid + 16 tegn tilfeldig, Crockford base32 */
export function ulid(tid = Date.now()) {
  let t = "";
  let n = tid;
  for (let i = 0; i < 10; i++) { t = ULID_TEGN[n % 32] + t; n = Math.floor(n / 32); }
  const r = new Uint8Array(16);
  crypto.getRandomValues(r);
  let s = "";
  for (const b of r) s += ULID_TEGN[b % 32];
  return t + s;
}
export const ER_ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/** Innstilling som JSON-verdi, eller standardverdien */
export async function innstilling(db, nokkel, standard = null) {
  const rad = await db.prepare("SELECT verdi, eksempel FROM innstilling WHERE nokkel = ?").bind(nokkel).first();
  if (!rad) return { verdi: standard, eksempel: false, finnes: false };
  try { return { verdi: JSON.parse(rad.verdi), eksempel: rad.eksempel === 1, finnes: true }; }
  catch { return { verdi: standard, eksempel: rad.eksempel === 1, finnes: true }; }
}

export async function settInnstilling(db, nokkel, verdi, eksempel = 0) {
  const t = naa();
  await db.prepare("INSERT INTO innstilling (nokkel, verdi, eksempel, opprettet, endret) VALUES (?, ?, ?, ?, ?) ON CONFLICT(nokkel) DO UPDATE SET verdi = excluded.verdi, eksempel = excluded.eksempel, endret = excluded.endret")
    .bind(nokkel, JSON.stringify(verdi), eksempel ? 1 : 0, t, t).run();
}

/** Neste løpenummer: T-2026-031 / A-2026-019 */
export async function nesteNr(db, type, aar) {
  const rad = await db.prepare("INSERT INTO lopenummer (type, aar, neste) VALUES (?, ?, 2) ON CONFLICT(type, aar) DO UPDATE SET neste = neste + 1 RETURNING neste").bind(type, aar).first();
  const n = Number(rad.neste) - 1;
  return `${type}-${aar}-${String(n).padStart(3, "0")}`;
}

/** Alle radene i en prisliste */
export async function prislisteMedRader(db, id) {
  const pl = await db.prepare("SELECT * FROM prisliste WHERE id = ?").bind(id).first();
  if (!pl) return null;
  const rader = (await db.prepare("SELECT * FROM prislisterad WHERE prisliste_id = ? ORDER BY type, produktlinje, kode").bind(id).all()).results;
  return { pl, rader };
}

/** Den aktive prislisten, ellers det nyeste utkastet (merket eksempel til den er publisert). null når ingen finnes. */
export async function gjeldendePrislisteRad(db) {
  const aktiv = await db.prepare("SELECT * FROM prisliste WHERE status = 'aktiv' ORDER BY gjelder_fra DESC LIMIT 1").first();
  if (aktiv) return aktiv;
  return db.prepare("SELECT * FROM prisliste WHERE status = 'utkast' ORDER BY gjelder_fra DESC, versjon DESC LIMIT 1").first();
}

export function json(status, data, ekstra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow, noarchive", ...ekstra },
  });
}
