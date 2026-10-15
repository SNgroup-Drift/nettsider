/**
 * Validering av input på serveren (K-240). Alt som kommer inn via /api valideres her før det lagres.
 * Hver funksjon kaster ApiFeil 400 ADM-400 med feltnavn, så svaret kan vise feilen ved riktig felt.
 */
import { ApiFeil, ER_ULID } from "./db.js";

// eslint-disable-next-line no-control-regex
export const KONTROLL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/;
export const EPOST_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
export const MAKS_BODY = 256 * 1024;

export function feil(felt, melding) {
  return new ApiFeil(400, "ADM-400", melding, { [felt]: melding });
}

/** Tekstfelt: trimmes, kontrolltegn avvises, lengde sjekkes. Tomt gir null når ikke påkrevd. */
export function tekst(v, navn, { maks = 200, pakrevd = false, linjeskift = false } = {}) {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") throw feil(navn, "Må være tekst.");
  const s = (linjeskift ? v.replace(/\r\n?/g, "\n") : v.replace(/\s+/g, " ")).trim();
  if (!s) { if (pakrevd) throw feil(navn, "Må fylles ut."); return null; }
  if (s.length > maks) throw feil(navn, `For langt (maks ${maks} tegn).`);
  if (KONTROLL.test(s) || (!linjeskift && /[\n\t]/.test(s))) throw feil(navn, "Har ugyldige tegn.");
  return s;
}

export function valg(v, navn, liste, { pakrevd = false, standard = null } = {}) {
  if (v === undefined || v === null || v === "") { if (pakrevd) throw feil(navn, "Må velges."); return standard; }
  if (typeof v !== "string" || !liste.includes(v)) throw feil(navn, `Må være en av: ${liste.join(", ")}.`);
  return v;
}

export function heltall(v, navn, { min = 0, maks = 1_000_000, pakrevd = false, standard = null } = {}) {
  if (v === undefined || v === null || v === "") { if (pakrevd) throw feil(navn, "Må fylles ut."); return standard; }
  const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, ""));
  if (!Number.isInteger(n) || n < min || n > maks) throw feil(navn, `Må være et heltall mellom ${min} og ${maks}.`);
  return n;
}

export function flagg(v, navn, { standard = 0 } = {}) {
  if (v === undefined || v === null || v === "") return standard;
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  throw feil(navn, "Må være ja eller nei.");
}

const DATO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function dato(v, navn, { pakrevd = false } = {}) {
  if (v === undefined || v === null || v === "") { if (pakrevd) throw feil(navn, "Må fylles ut."); return null; }
  const m = typeof v === "string" ? DATO_RE.exec(v) : null;
  if (!m) throw feil(navn, "Må være en dato (ÅÅÅÅ-MM-DD).");
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) throw feil(navn, "Datoen finnes ikke.");
  return v;
}

/** Org.nr.: bare siffer, 9 stk. Tomt gir null. */
export function orgnr(v, navn = "orgnr", { pakrevd = false } = {}) {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string" && typeof v !== "number") throw feil(navn, "Må være tekst.");
  const s = String(v).replace(/\D/g, "");
  if (!s) { if (pakrevd) throw feil(navn, "Må fylles ut."); return null; }
  if (s.length !== 9) throw feil(navn, "Org.nr. må ha 9 siffer.");
  return s;
}

export function epost(v, navn = "epost", { pakrevd = false } = {}) {
  const s = tekst(v, navn, { maks: 254, pakrevd });
  if (s && !EPOST_RE.test(s)) throw feil(navn, "Skriv en gyldig e-postadresse.");
  return s ? s.toLowerCase() : null;
}

export function telefon(v, navn = "telefon", { pakrevd = false } = {}) {
  const s = tekst(v, navn, { maks: 30, pakrevd });
  if (s && !/^\+?\d{6,20}$/.test(s.replace(/[\s().-]/g, ""))) throw feil(navn, "Skriv et gyldig telefonnummer.");
  return s;
}

export function id(v, navn = "id") {
  if (typeof v !== "string" || !ER_ULID.test(v)) throw feil(navn, "Ugyldig id.");
  return v;
}

export function liste(v, navn, { maks = 200 } = {}) {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw feil(navn, "Må være en liste.");
  if (v.length > maks) throw feil(navn, `For mange (maks ${maks}).`);
  return v;
}

/** JSON-kroppen i en forespørsel, maks 256 KB, må være et objekt */
export async function lesJson(req) {
  const lengde = Number(req.headers.get("Content-Length") ?? "0");
  if (lengde > MAKS_BODY) throw new ApiFeil(413, "ADM-413", "Forespørselen er for stor.");
  const type = (req.headers.get("Content-Type") ?? "").toLowerCase();
  if (!type.startsWith("application/json")) throw new ApiFeil(415, "ADM-415", "Send JSON.");
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.byteLength > MAKS_BODY) throw new ApiFeil(413, "ADM-413", "Forespørselen er for stor.");
  let v;
  try { v = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new ApiFeil(400, "ADM-400", "Kunne ikke lese JSON."); }
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new ApiFeil(400, "ADM-400", "Kroppen må være et objekt.");
  return v;
}
