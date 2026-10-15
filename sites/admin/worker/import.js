/**
 * Import fra Excel (K-240, 60-213 punkt h). Én rad per eier, første rad er overskrifter. .xlsx (zip med XML) og .csv leses her, uten
 * avhengigheter: zip-katalogen leses for hånd og deflate pakkes ut med DecompressionStream (finnes i Workers og Node 18+).
 * Kolonner A–M: Eier, Org.nr., Adresse, Postnr., Sted, Fylke, Kjede, Antall butikker, Butikker (semikolon), Kontakt, Kontakt e-post,
 * Kontakt telefon, Kilde. Overskriftene gjenkjennes på navn; ukjente overskrifter leses etter plassering.
 *
 * Forhåndsvisning: org.nr. renses (bare siffer) og sammenlignes med eier.orgnr. Treff = «oppdateres» (tomme felt fylles, utfylte
 * overskrives ikke). Uten org.nr. = «mangler_orgnr» (importeres som prospekt med neste steg «Skaff org.nr.»). Ingenting lagres før
 * importer() kalles med de samme radene.
 */
import { ApiFeil, naa, idagOslo, ulid } from "./db.js";
import { KONTROLL, EPOST_RE } from "./valider.js";

export const MAKS_FIL = 2 * 1024 * 1024;
export const MAKS_RADER = 2000;
export const KOLONNER = ["navn", "orgnr", "adresse", "postnr", "sted", "fylke", "kjede", "antall_butikker", "butikker", "kontakt", "kontakt_epost", "kontakt_telefon", "kilde"];
const OVERSKRIFTER = {
  eier: "navn", eiernavn: "navn", navn: "navn", selskap: "navn", firma: "navn",
  orgnr: "orgnr", organisasjonsnummer: "orgnr", orgnummer: "orgnr",
  adresse: "adresse", gateadresse: "adresse", postnr: "postnr", postnummer: "postnr", sted: "sted", poststed: "sted", by: "sted", fylke: "fylke",
  kjede: "kjede", antallbutikker: "antall_butikker", antall: "antall_butikker", butikker: "butikker", utsalg: "butikker",
  kontakt: "kontakt", kontaktperson: "kontakt", kontaktnavn: "kontakt",
  kontaktepost: "kontakt_epost", epost: "kontakt_epost", email: "kontakt_epost", kontaktemail: "kontakt_epost",
  kontakttelefon: "kontakt_telefon", telefon: "kontakt_telefon", tlf: "kontakt_telefon", mobil: "kontakt_telefon",
  kilde: "kilde",
};

// ── Zip og xlsx ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────

async function inflate(bytes) {
  const ds = new DecompressionStream("deflate-raw");
  const w = ds.writable.getWriter();
  w.write(bytes);
  w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}

/** Filene i en zip: Map<navn, Uint8Array>. Bare lager (0) og deflate (8). */
export async function lesZip(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new ApiFeil(400, "ADM-400", "Fila er ikke en gyldig .xlsx.");
  const antall = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const filer = new Map();
  const dec = new TextDecoder();
  for (let i = 0; i < antall; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new ApiFeil(400, "ADM-400", "Fila er ikke en gyldig .xlsx.");
    const metode = dv.getUint16(p + 10, true);
    const pakket = dv.getUint32(p + 20, true);
    const navnLen = dv.getUint16(p + 28, true), ekstraLen = dv.getUint16(p + 30, true), komLen = dv.getUint16(p + 32, true);
    const lokal = dv.getUint32(p + 42, true);
    const navn = dec.decode(u8.subarray(p + 46, p + 46 + navnLen));
    p += 46 + navnLen + ekstraLen + komLen;
    if (dv.getUint32(lokal, true) !== 0x04034b50) continue;
    const ln = dv.getUint16(lokal + 26, true), le = dv.getUint16(lokal + 28, true);
    const start = lokal + 30 + ln + le;
    const data = u8.subarray(start, start + pakket);
    if (metode === 0) filer.set(navn, data);
    else if (metode === 8) filer.set(navn, await inflate(data));
  }
  return filer;
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
export const avXml = (s) => s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-z]+);/g, (m, k) => k[0] === "#" ? String.fromCodePoint(k[1] === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)) : (ENT[k] ?? m));

function kolonneIndeks(bokstaver) {
  let n = 0;
  for (const c of bokstaver) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

/** Første arket i en .xlsx som rader av strenger */
export async function lesXlsx(buf) {
  const filer = await lesZip(buf);
  const dec = new TextDecoder();
  const tekst = (n) => (filer.has(n) ? dec.decode(filer.get(n)) : null);
  const workbook = tekst("xl/workbook.xml");
  if (!workbook) throw new ApiFeil(400, "ADM-400", "Fila er ikke en gyldig .xlsx.");
  const forsteArk = /<sheet\b[^>]*\br:id="([^"]+)"/.exec(workbook) ?? /<sheet\b[^>]*\bid="([^"]+)"/.exec(workbook);
  let arkSti = "xl/worksheets/sheet1.xml";
  const rels = tekst("xl/_rels/workbook.xml.rels");
  if (forsteArk && rels) {
    const re = new RegExp(`<Relationship\\b[^>]*\\bId="${forsteArk[1]}"[^>]*\\bTarget="([^"]+)"`);
    const m = re.exec(rels) ?? new RegExp(`<Relationship\\b[^>]*\\bTarget="([^"]+)"[^>]*\\bId="${forsteArk[1]}"`).exec(rels);
    if (m) arkSti = m[1].startsWith("/") ? m[1].slice(1) : `xl/${m[1]}`;
  }
  const ark = tekst(arkSti);
  if (!ark) throw new ApiFeil(400, "ADM-400", "Fant ikke arket i .xlsx-fila.");
  const delte = [];
  const ss = tekst("xl/sharedStrings.xml");
  if (ss) for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) delte.push(avXml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")));
  const rader = [];
  for (const r of ark.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const celler = [];
    for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attr = c[1];
      const ref = /\br="([A-Z]+)\d+"/.exec(attr);
      if (!ref) continue;
      const type = /\bt="([^"]+)"/.exec(attr)?.[1] ?? "n";
      const indre = c[2] ?? "";
      let verdi = "";
      if (type === "s") { const v = /<v>([\s\S]*?)<\/v>/.exec(indre); verdi = v ? delte[Number(v[1])] ?? "" : ""; }
      else if (type === "inlineStr") verdi = avXml([...indre.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""));
      else { const v = /<v>([\s\S]*?)<\/v>/.exec(indre); verdi = v ? avXml(v[1]) : ""; if (type === "b") verdi = verdi === "1" ? "ja" : "nei"; }
      celler[kolonneIndeks(ref[1])] = String(verdi).trim();
    }
    if (celler.some((v) => v)) rader.push(Array.from(celler, (v) => v ?? ""));
    if (rader.length > MAKS_RADER + 1) throw new ApiFeil(400, "ADM-400", `Maks ${MAKS_RADER} rader per import.`);
  }
  return rader;
}

/** CSV med ; , eller tabulator, anførselstegn og BOM */
export function lesCsv(tekst) {
  const t = tekst.replace(/^﻿/, "");
  const forste = t.split(/\r?\n/)[0] ?? "";
  const skille = [";", ",", "\t"].map((s) => [s, (forste.match(new RegExp(s === "\t" ? "\t" : `\\${s}`, "g")) ?? []).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rader = [];
  let rad = [], felt = "", i = 0, iAnf = false;
  while (i < t.length) {
    const c = t[i];
    if (iAnf) {
      if (c === '"') { if (t[i + 1] === '"') { felt += '"'; i += 2; continue; } iAnf = false; i++; continue; }
      felt += c; i++; continue;
    }
    if (c === '"') { iAnf = true; i++; continue; }
    if (c === skille) { rad.push(felt.trim()); felt = ""; i++; continue; }
    if (c === "\n" || c === "\r") { rad.push(felt.trim()); felt = ""; if (rad.some((v) => v)) rader.push(rad); rad = []; if (c === "\r" && t[i + 1] === "\n") i++; i++; continue; }
    felt += c; i++;
  }
  rad.push(felt.trim());
  if (rad.some((v) => v)) rader.push(rad);
  if (rader.length > MAKS_RADER + 1) throw new ApiFeil(400, "ADM-400", `Maks ${MAKS_RADER} rader per import.`);
  return rader;
}

/** Leser fila ut fra innholdet: zip-signatur = .xlsx, ellers tekst = .csv */
export async function lesFil(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (u8.byteLength > MAKS_FIL) throw new ApiFeil(413, "ADM-413", "Fila er for stor (maks 2 MB).");
  if (u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x03 && u8[3] === 0x04) return lesXlsx(u8);
  return lesCsv(new TextDecoder("utf-8", { fatal: false }).decode(u8));
}

// ── Tolking ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const normOverskrift = (s) => s.toLowerCase().replace(/[\s.\-_()/]/g, "").replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a");

/** Rader av strenger → objekter med feltene i KOLONNER. Første rad er overskrifter når minst to kjennes igjen. */
export function tolkRader(rader) {
  if (!rader.length) return [];
  const forste = rader[0].map((s) => OVERSKRIFTER[normOverskrift(String(s ?? ""))] ?? null);
  const harOverskrift = forste.filter(Boolean).length >= 2;
  const plass = harOverskrift ? forste : KOLONNER;
  const data = harOverskrift ? rader.slice(1) : rader;
  return data.map((rad, i) => {
    const o = { radnr: i + 1 + (harOverskrift ? 1 : 0) };
    for (const k of KOLONNER) o[k] = "";
    rad.forEach((v, j) => { const k = plass[j]; if (k && v != null && String(v).trim()) o[k] = String(v).trim(); });
    return o;
  });
}

export const KILDER = { be_om_demo: "Be om demo", sigdal_kjedemote: "Sigdal-kjedemøte", anbefaling: "Anbefaling", messe: "Messe", import: "Import", annet: "Annet" };
export function tolkKilde(s) {
  const t = (s ?? "").toLowerCase();
  if (!t) return "import";
  if (t.includes("kjedem")) return "sigdal_kjedemote";
  if (t.includes("anbefal")) return "anbefaling";
  if (t.includes("messe")) return "messe";
  if (t.includes("demo")) return "be_om_demo";
  if (t.includes("import")) return "import";
  return "annet";
}
const tolkKjede = (s) => (/sigdal/i.test(s ?? "") ? "sigdal" : "annen");
const rens = (s, maks) => { const t = String(s ?? "").replace(/\s+/g, " ").trim(); return KONTROLL.test(t) ? "" : t.slice(0, maks); };

/**
 * Forhåndsvisning: hver rad får resultat «ny», «oppdateres», «mangler_orgnr» eller «hoppes» (uten eiernavn eller dublett i fila).
 * Returnerer { antall, telling, rader }.
 */
export async function forhandsvis(db, raaRader) {
  const rader = tolkRader(raaRader);
  const sett = new Set();
  const ut = [];
  for (const r of rader) {
    const navn = rens(r.navn, 120);
    const orgnr = String(r.orgnr ?? "").replace(/\D/g, "");
    const butikker = rens(r.butikker, 1000).split(";").map((b) => b.trim()).filter(Boolean).slice(0, 50);
    const antall = Math.max(1, Math.min(200, parseInt(r.antall_butikker, 10) || butikker.length || 1));
    const rad = {
      radnr: r.radnr, navn, orgnr: orgnr.length === 9 ? orgnr : "", orgnr_tekst: rens(r.orgnr, 20),
      adresse: rens(r.adresse, 200), postnr: rens(r.postnr, 10), sted: rens(r.sted, 100), fylke: rens(r.fylke, 60),
      kjede: tolkKjede(r.kjede), antall_butikker: antall, butikker,
      kontakt: rens(r.kontakt, 120), kontakt_epost: rens(r.kontakt_epost, 254).toLowerCase(), kontakt_telefon: rens(r.kontakt_telefon, 30),
      kilde: tolkKilde(r.kilde), resultat: "ny", eier_id: null, merknad: "",
    };
    if (rad.kontakt_epost && !EPOST_RE.test(rad.kontakt_epost)) { rad.merknad = "E-posten ser feil ut og tas ikke med."; rad.kontakt_epost = ""; }
    if (!navn) { rad.resultat = "hoppes"; rad.merknad = "Mangler eiernavn (kolonne A)."; ut.push(rad); continue; }
    if (orgnr && orgnr.length !== 9) { rad.resultat = "hoppes"; rad.merknad = `Org.nr. «${rad.orgnr_tekst}» har ikke 9 siffer.`; ut.push(rad); continue; }
    if (!orgnr) rad.resultat = "mangler_orgnr";
    else {
      if (sett.has(orgnr)) { rad.resultat = "hoppes"; rad.merknad = "Samme org.nr. står tidligere i fila."; ut.push(rad); continue; }
      sett.add(orgnr);
      const finnes = await db.prepare("SELECT id, navn FROM eier WHERE orgnr = ?").bind(orgnr).first();
      if (finnes) { rad.resultat = "oppdateres"; rad.eier_id = finnes.id; rad.merknad = `Finnes som «${finnes.navn}». Tomme felt fylles, utfylte overskrives ikke.`; }
    }
    ut.push(rad);
  }
  const telling = { ny: 0, oppdateres: 0, mangler_orgnr: 0, hoppes: 0 };
  for (const r of ut) telling[r.resultat]++;
  return { antall: ut.length, telling, rader: ut };
}

/** Importerer radene fra forhåndsvisningen (valideres på nytt). Returnerer { importert, oppdatert, mangler_orgnr, hoppet }. */
export async function importer(db, raaRader, hvem = "Import", d = new Date()) {
  const { rader } = await forhandsvis(db, raaRader);
  const t = naa(d);
  const idag = idagOslo(d);
  const ut = { importert: 0, oppdatert: 0, mangler_orgnr: 0, hoppet: 0 };
  for (const r of rader) {
    if (r.resultat === "hoppes") { ut.hoppet++; continue; }
    if (r.resultat === "oppdateres") {
      const e = await db.prepare("SELECT * FROM eier WHERE id = ?").bind(r.eier_id).first();
      if (!e) { ut.hoppet++; continue; }
      const st = [];
      st.push(db.prepare("UPDATE eier SET adresse = COALESCE(adresse, ?), postnr = COALESCE(postnr, ?), sted = COALESCE(sted, ?), fylke = COALESCE(fylke, ?), endret = ? WHERE id = ?")
        .bind(r.adresse || null, r.postnr || null, r.sted || null, r.fylke || null, t, e.id));
      const harButikker = await db.prepare("SELECT COUNT(*) AS n FROM butikk WHERE eier_id = ?").bind(e.id).first("n");
      if (!harButikker) st.push(...butikkSetninger(db, e.id, r, t));
      if (r.kontakt) {
        const harKontakt = await db.prepare("SELECT COUNT(*) AS n FROM kontakt WHERE eier_id = ? AND (lower(navn) = lower(?) OR (epost IS NOT NULL AND epost = ?))").bind(e.id, r.kontakt, r.kontakt_epost || "").first("n");
        if (!harKontakt) st.push(db.prepare("INSERT INTO kontakt (id, eier_id, navn, epost, telefon, signaturrett, primaer, opprettet, endret) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)").bind(ulid(d.getTime()), e.id, r.kontakt, r.kontakt_epost || null, r.kontakt_telefon || null, t, t));
      }
      st.push(db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)").bind(ulid(d.getTime()), e.id, idag, "Oppdatert fra Excel-import", `Rad ${r.radnr}.`, hvem, t, t));
      await db.batch(st);
      ut.oppdatert++;
      continue;
    }
    const eierId = ulid(d.getTime());
    const manglerOrg = r.resultat === "mangler_orgnr";
    const st = [
      db.prepare(`INSERT INTO eier (id, navn, orgnr, adresse, postnr, sted, fylke, kjede, produktlinje, status, er_kunde, kilde, neste_tekst, neste_dato, lead_ny, opprettet, endret)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ny', 0, ?, ?, ?, 0, ?, ?)`)
        .bind(eierId, r.navn, r.orgnr || null, r.adresse || null, r.postnr || null, r.sted || null, r.fylke || null, r.kjede, r.kjede === "sigdal" ? "sigdal" : "hengsel", r.kilde,
          manglerOrg ? "Skaff org.nr. og ta første kontakt" : "Ta første kontakt", idag, t, t),
      ...butikkSetninger(db, eierId, r, t),
      db.prepare("INSERT INTO mulighet (id, eier_id, produktlinje, fase, antall_butikker, aapnet, opprettet, endret) VALUES (?, ?, ?, 'ny', ?, ?, ?, ?)").bind(ulid(d.getTime()), eierId, r.kjede === "sigdal" ? "sigdal" : "hengsel", r.antall_butikker, idag, t, t),
      db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, neste_tekst, neste_dato, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(ulid(d.getTime()), eierId, idag, "Importert fra Excel", `Rad ${r.radnr}. Kilde: ${KILDER[r.kilde]}.${manglerOrg ? " Mangler org.nr." : ""}`, hvem, manglerOrg ? "Skaff org.nr. og ta første kontakt" : "Ta første kontakt", idag, t, t),
    ];
    if (r.kontakt) st.push(db.prepare("INSERT INTO kontakt (id, eier_id, navn, epost, telefon, signaturrett, primaer, opprettet, endret) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)").bind(ulid(d.getTime()), eierId, r.kontakt, r.kontakt_epost || null, r.kontakt_telefon || null, t, t));
    await db.batch(st);
    ut.importert++;
    if (manglerOrg) ut.mangler_orgnr++;
  }
  return ut;
}

function butikkSetninger(db, eierId, r, t) {
  const navn = r.butikker.length ? r.butikker : Array.from({ length: r.antall_butikker }, (_, i) => (r.antall_butikker === 1 ? r.navn : `${r.navn} ${i + 1}`));
  return navn.map((n, i) => db.prepare("INSERT INTO butikk (id, eier_id, navn, sted, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(ulid(), eierId, n.slice(0, 120), i === 0 ? r.sted || null : null, i + 1, t, t));
}

/** Leser fila fra multipart/form-data (feltet «fil») eller rå kropp */
export async function lesOpplasting(req) {
  const type = (req.headers.get("Content-Type") ?? "").toLowerCase();
  if (Number(req.headers.get("Content-Length") ?? "0") > MAKS_FIL + 4096) throw new ApiFeil(413, "ADM-413", "Fila er for stor (maks 2 MB).");
  let navn = "fil";
  let data;
  if (type.startsWith("multipart/form-data")) {
    const fd = await req.formData();
    const fil = fd.get("fil");
    if (!fil || typeof fil === "string") throw new ApiFeil(400, "ADM-400", "Mangler fila (feltet «fil»).");
    navn = fil.name || navn;
    data = new Uint8Array(await fil.arrayBuffer());
  } else {
    navn = decodeURIComponent(req.headers.get("X-Filnavn") ?? navn);
    data = new Uint8Array(await req.arrayBuffer());
  }
  if (data.byteLength > MAKS_FIL) throw new ApiFeil(413, "ADM-413", "Fila er for stor (maks 2 MB).");
  if (!/\.(xlsx|csv)$/i.test(navn)) throw new ApiFeil(415, "ADM-415", "Fila må være .xlsx eller .csv.");
  return { navn: navn.replace(/[^\w.\- æøåÆØÅ()]/g, "").slice(0, 120), rader: await lesFil(data) };
}
