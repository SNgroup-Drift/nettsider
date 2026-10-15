/**
 * POST /api/hjelp: «Hjelp» fra Hengsel CRM og Hengsel Ute (K-259, 60-209 SB4). Lager en sak med kilde hjelp-crm eller hjelp-ute.
 * Ruten er unntatt Access-sjekken i Workeren (kundene er ikke innlogget i Admin), men har samme vern som /api/lead:
 *  - bare POST (og OPTIONS for CORS-forhåndssjekk), Origin må stå i innstillingen «hjelp_origins» (standard https://*.hengsel.no, der «*.»
 *    betyr alle underdomener = kundemiljøene). Uten Origin (Ute som app) slippes forespørselen bare inn når HJELP_NOKKEL er satt og stemmer.
 *  - honeypot «nettsted», tidsfeltet «t» (3 sekunder til 24 timer gammelt), lengdegrenser og kontrolltegn, innholdstype (JSON eller
 *    multipart/form-data), maks 2 MB skjermbilde + 64 KB tekst.
 *  - valgfritt ekstra lag: er hemmeligheten HJELP_NOKKEL satt, må forespørselen ha «Authorization: Bearer <nøkkel>». Ingen nøkler i koden.
 *
 * Skjermbilde (valgfritt, ≤ 2 MB, PNG/JPEG/WebP sjekket på de første bytene, ikke bare filnavnet) lagres i R2 (binding SKJERMBILDER),
 * aldri i D1: D1 har maks 2 000 000 byte per rad (mindre enn 2 MiB), og bilder i databasen gjør sikkerhetskopier og eksport tunge.
 * Er R2 ikke koblet til, lagres saken uten bilde og saken får en merknad.
 *
 * Svar: { ok, nr, prioritet, svarfrist, svarfrist_tekst, kvittering } til kvitteringen «Saken er sendt» i CRM/Ute.
 */
import { ulid, json, innstilling } from "./db.js";
import { KONTROLL, EPOST_RE } from "./valider.js";
import { lagSak, hentSupportniva } from "./api-support.js";
import { PRIORITETER, PRIORITETSNAVN, fristFor } from "../src/lib/support.js";

export const MAKS_BILDE = 2 * 1024 * 1024;
export const MAKS_BODY = MAKS_BILDE + 64 * 1024;
export const MIN_ALDER = 3_000;
export const MAKS_ALDER = 24 * 60 * 60 * 1000;
const MAKS_FREMTID = 60_000;
export const GRENSER = { emne: 150, tekst: 4000, side: 300, adresse: 500, versjon: 80, enhet: 200, bruker: 200, bruker_epost: 254 };
export const STANDARD_ORIGINS = ["https://*.hengsel.no"];
const BILDETYPER = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

const hoder = (origin) => ({
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  ...(origin ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Max-Age": "600", Vary: "Origin" } : {}),
});
const svar = (status, data, origin) => json(status, data, hoder(origin));

/** Står Origin i lista? «https://*.hengsel.no» gjelder underdomener (ikke hengsel.no selv og ikke hengsel.no.annet.no). */
export function originTillatt(origin, liste) {
  if (!origin || typeof origin !== "string") return false;
  let u;
  try { u = new URL(origin); } catch { return false; }
  if (u.origin !== origin) return false;
  return liste.some((m) => {
    if (typeof m !== "string") return false;
    const s = m.trim().replace(/\/+$/, "");
    if (!s.includes("*")) return s === origin;
    const x = /^(https?):\/\/\*\.([a-z0-9.-]+)$/i.exec(s);
    return !!x && u.protocol === `${x[1].toLowerCase()}:` && u.hostname.endsWith(`.${x[2].toLowerCase()}`) && !u.port;
  });
}

function likeStrenger(a, b) {
  if (a.length !== b.length) return false;
  let ulik = 0;
  for (let i = 0; i < a.length; i++) ulik |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return ulik === 0;
}

/** Bildetype fra de første bytene. null når det ikke er PNG, JPEG eller WebP. */
export function bildetype(b) {
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}

// eslint-disable-next-line no-control-regex
const KONTROLL_LINJE = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;

/** Feltene fra «Hjelp». Returnerer { felt } eller { feil } */
export function validerHjelp(r) {
  const feil = {};
  const linje = (navn, pakrevd = false) => {
    const v = typeof r[navn] === "string" ? r[navn].replace(/\s+/g, " ").trim() : "";
    if (!v) { if (pakrevd) feil[navn] = "Må fylles ut."; return null; }
    if (v.length > GRENSER[navn]) { feil[navn] = "For langt."; return null; }
    if (KONTROLL_LINJE.test(v)) { feil[navn] = "Har ugyldige tegn."; return null; }
    return v;
  };
  const emne = linje("emne", true);
  const tekst = typeof r.tekst === "string" ? r.tekst.replace(/\r\n?/g, "\n").trim() : "";
  if (!tekst) feil.tekst = "Skriv hva som skjedde.";
  else if (tekst.length > GRENSER.tekst) feil.tekst = "Teksten er for lang.";
  else if (KONTROLL.test(tekst)) feil.tekst = "Teksten har ugyldige tegn.";
  const prioritet = r.prioritet ? String(r.prioritet) : "normal";
  if (!PRIORITETER.includes(prioritet)) feil.prioritet = "Velg Kritisk, Høy, Normal eller Lav.";
  const app = r.app ? String(r.app) : "crm";
  if (!["crm", "ute"].includes(app)) feil.app = "Ukjent app.";
  const bruker_epost = linje("bruker_epost");
  if (bruker_epost && !EPOST_RE.test(bruker_epost)) feil.bruker_epost = "Ugyldig e-postadresse.";
  const felt = { emne, tekst, prioritet, kilde: app === "ute" ? "hjelp-ute" : "hjelp-crm", side: linje("side"), adresse: linje("adresse"), versjon: linje("versjon"), enhet: linje("enhet"), bruker: linje("bruker"), bruker_epost: bruker_epost ? bruker_epost.toLowerCase() : null };
  return Object.keys(feil).length ? { feil } : { felt };
}

/** Hvilken eier (kundemiljø) kom saken fra? Vertsnavnet i adressen eller Origin mot eier.miljo_adresse. */
async function finnEier(db, adresse, origin) {
  const verter = [];
  for (const s of [adresse, origin]) {
    if (!s) continue;
    try { verter.push(new URL(/^https?:\/\//.test(s) ? s : `https://${s}`).hostname.toLowerCase()); } catch { /* hopper over */ }
  }
  for (const v of verter) {
    const e = await db.prepare("SELECT id FROM eier WHERE lower(miljo_adresse) = ? OR lower(miljo_adresse) LIKE ? LIMIT 1").bind(v, `${v}/%`).first();
    if (e) return e.id;
  }
  return null;
}

export async function handterHjelp(req, env, na = Date.now()) {
  const origin = req.headers.get("Origin");
  const metode = req.method.toUpperCase();
  if (metode !== "POST" && metode !== "OPTIONS") return svar(405, { ok: false, feil: { skjema: "Metoden er ikke tillatt." } });
  const nokkel = typeof env.HJELP_NOKKEL === "string" && env.HJELP_NOKKEL ? env.HJELP_NOKKEL : "";
  if (!env.DB) return svar(503, { ok: false, kode: "ADM-504", feil: { skjema: "Databasen er ikke koblet til." } });
  let liste = STANDARD_ORIGINS;
  try { const v = (await innstilling(env.DB, "hjelp_origins", STANDARD_ORIGINS)).verdi; if (Array.isArray(v)) liste = v; } catch { /* standard */ }
  const tillatt = originTillatt(origin, liste);
  if (origin !== null && !tillatt) return svar(403, { ok: false, feil: { skjema: "Forespørselen kom fra en annen adresse." } });
  const ekko = tillatt ? origin : null;
  if (metode === "OPTIONS") return new Response(null, { status: 204, headers: hoder(ekko) });
  // Uten Origin (app) kreves nøkkelen. Med nøkkel satt kreves den alltid.
  if (origin === null && !nokkel) return svar(403, { ok: false, feil: { skjema: "Forespørselen kom fra en annen adresse." } });
  if (nokkel && !likeStrenger(req.headers.get("Authorization") ?? "", `Bearer ${nokkel}`)) return svar(403, { ok: false, feil: { skjema: "Mangler nøkkel." } }, ekko);

  const lengde = Number(req.headers.get("Content-Length") ?? "0");
  if (lengde > MAKS_BODY) return svar(413, { ok: false, feil: { skjermbilde: "Skjermbildet er for stort (maks 2 MB)." } }, ekko);
  const type = (req.headers.get("Content-Type") ?? "").toLowerCase();
  const erJson = type.startsWith("application/json");
  const erSkjema = type.startsWith("multipart/form-data");
  if (!erJson && !erSkjema) return svar(415, { ok: false, feil: { skjema: "Ukjent innholdstype." } }, ekko);
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.byteLength > MAKS_BODY) return svar(413, { ok: false, feil: { skjermbilde: "Skjermbildet er for stort (maks 2 MB)." } }, ekko);

  const ra = {};
  let fil = null;
  try {
    if (erJson) {
      const v = JSON.parse(new TextDecoder().decode(bytes));
      if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
      for (const [k, x] of Object.entries(v)) { if (typeof x === "string") ra[k] = x; else if (typeof x === "number" && k === "t") ra[k] = String(x); else if (x !== null && x !== undefined) throw new Error(); }
    } else {
      const fd = await new Request("https://hjelp.invalid/", { method: "POST", headers: { "Content-Type": req.headers.get("Content-Type") }, body: bytes }).formData();
      for (const [k, x] of fd.entries()) {
        if (k === "skjermbilde" && typeof x === "object" && x !== null) { if (x.size > 0) fil = x; }
        else if (typeof x === "string") ra[k] = x;
      }
    }
  } catch { return svar(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } }, ekko); }

  // Honeypot: roboter fyller det skjulte feltet. De får samme svar som om det gikk bra, og ingenting lagres.
  if ((ra.nettsted ?? "") !== "") return svar(200, { ok: true }, ekko);
  const t = Number(ra.t);
  if (!ra.t || !Number.isFinite(t)) return svar(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } }, ekko);
  const alder = na - t;
  if (alder < MIN_ALDER || alder > MAKS_ALDER || alder < -MAKS_FREMTID) return svar(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } }, ekko);
  const v = validerHjelp(ra);
  if (v.feil) return svar(400, { ok: false, feil: v.feil }, ekko);

  let bilde = null;
  if (fil) {
    if (fil.size > MAKS_BILDE) return svar(413, { ok: false, feil: { skjermbilde: "Skjermbildet er for stort (maks 2 MB)." } }, ekko);
    const b = new Uint8Array(await fil.arrayBuffer());
    const bt = bildetype(b);
    if (!bt) return svar(415, { ok: false, feil: { skjermbilde: "Skjermbildet må være PNG, JPEG eller WebP." } }, ekko);
    const navn = (typeof fil.name === "string" ? fil.name : "").replace(/[^\w.\-æøåÆØÅ ]/g, "").slice(0, 120) || `skjermbilde.${bt}`;
    bilde = { bytes: b, type: BILDETYPER[bt], ext: bt, navn };
  }

  const d = new Date(na);
  try {
    const nivaa = await hentSupportniva(env.DB);
    const eierId = await finnEier(env.DB, v.felt.adresse, origin);
    let kontaktId = null;
    if (eierId && v.felt.bruker_epost) kontaktId = (await env.DB.prepare("SELECT id FROM kontakt WHERE eier_id = ? AND lower(epost) = ? LIMIT 1").bind(eierId, v.felt.bruker_epost).first())?.id ?? null;
    const sakId = ulid(na);
    let skjermbilde = null, merknad = null;
    if (bilde) {
      if (env.SKJERMBILDER && typeof env.SKJERMBILDER.put === "function") {
        const nokkelR2 = `saker/${sakId}/${ulid(na)}.${bilde.ext}`;
        await env.SKJERMBILDER.put(nokkelR2, bilde.bytes, { httpMetadata: { contentType: bilde.type } });
        skjermbilde = { nokkel: nokkelR2, type: bilde.type, navn: bilde.navn, bytes: bilde.bytes.byteLength };
      } else merknad = `Skjermbildet «${bilde.navn}» kom med, men ble ikke lagret: lagringen for skjermbilder (R2) er ikke koblet til ennå.`;
    }
    const sak = await lagSak(env.DB, {
      id: sakId, emne: v.felt.emne, tekst: v.felt.tekst, prioritet: v.felt.prioritet, kilde: v.felt.kilde, eier_id: eierId, kontakt_id: kontaktId,
      kontakt_navn: v.felt.bruker ?? null, kontakt_epost: v.felt.bruker_epost, hvem: v.felt.bruker ?? v.felt.bruker_epost ?? "Kunden",
      hjelp: { side: v.felt.side, adresse: v.felt.adresse, versjon: v.felt.versjon, enhet: v.felt.enhet, bruker: [v.felt.bruker, v.felt.bruker_epost].filter(Boolean).join(" · ") || null },
      skjermbilde, merknad, opprettet_av: "hjelp",
    }, nivaa, d);
    const f = fristFor(v.felt.prioritet, nivaa.verdi);
    const hvor = v.felt.kilde === "hjelp-ute" ? "Du får svar som varsel i appen." : "Du får svar på e-post og under «Mine saker».";
    return svar(200, {
      ok: true, nr: sak.nr, prioritet: v.felt.prioritet, svarfrist: sak.svarfrist, svarfrist_tekst: f.tekst,
      kvittering: `Saksnummer ${sak.nr}. ${PRIORITETSNAVN[v.felt.prioritet]} prioritet: vi svarer innen ${f.tekst} på hverdager. ${hvor}`,
    }, ekko);
  } catch (e) {
    console.error("hjelp: lagring feilet", (e && e.name) || "ukjent");
    return svar(503, { ok: false, kode: "ADM-504", feil: { skjema: "Kunne ikke lagre saken." } }, ekko);
  }
}

