/**
 * Drift og innstillinger i Hengsel Admin fase C (K-260, 60-211 SD1, SD2 og Innstillinger). Rutene registreres i worker/api.js (én linje).
 * Drift er bare til å lese for kundemiljøene: ingen utrulling, fletting eller endring av kundemiljøer fra Admin. Kontoer lenker til et
 * 1Password-hvelv og har aldri passord, nøkler eller koder (valideres her). Bare rollen eier, andre får ADM-403.
 *
 * Ruter:
 *   GET  /api/drift/status                     kundemiljøene (fra Innstillinger › Kundemiljøer) + offentlige statussider (Cloudflare, Supabase)
 *   GET|POST /api/drift/kontoer · PATCH|DELETE /api/drift/kontoer/:id
 *   GET|POST /api/drift/frister · PATCH|DELETE /api/drift/frister/:id
 *   GET|POST /api/drift/rutiner · POST /api/drift/rutiner/:id/punkter · DELETE /api/drift/rutinepunkter/:id · PUT /api/drift/rutinepunkter/:id/avkryssing {periode, ok}
 *   GET|PATCH /api/innstillinger/varsler · GET|PUT /api/innstillinger/kundemiljoer · GET /api/innstillinger/avtalemaler · GET /api/innstillinger/brukere
 */
import { ApiFeil, naa, idagOslo, pluss, dagerMellom, ulid, innstilling, settInnstilling } from "./db.js";
import * as V from "./valider.js";
import { kunEier } from "./api-fakturering.js";
import { ROLLER } from "./tilgang.js";

const ULID = "([0-9A-HJKMNP-TV-Z]{26})";
export const RUTER_DRIFT = [];
const rute = (metode, monster, fn, omraade = "Drift") => RUTER_DRIFT.push({ metode, re: new RegExp(`^${monster}$`), fn: async (a) => { kunEier(a.bruker, omraade); return fn(a); } });
const alle = async (st) => (await st.all()).results;
const ikkeFunnet = (m = "Finnes ikke.") => new ApiFeil(404, "ADM-404", m);

// ── Hemmeligheter skal aldri inn i Admin ──
const HEMMELIG = [/passord\s*[:=]/i, /password\s*[:=]/i, /\b(?:api[_-]?key|token|secret|hemmelighet)\s*[:=]/i, /\b[A-Za-z0-9+/_-]{32,}={0,2}\b/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
export function utenHemmelighet(v, navn) {
  if (v && HEMMELIG.some((re) => re.test(v))) throw V.feil(navn, "Skriv aldri passord, nøkler eller koder her. Lagre dem i 1Password og lenk til hvelvet.");
  return v;
}
/** Lenke til 1Password (hvelv eller element). Bare https til 1password.com / 1password.eu. */
export function hvelvUrl(v, navn = "hvelv_url") {
  const s = V.tekst(v, navn, { maks: 500 });
  if (!s) return null;
  let u;
  try { u = new URL(s); } catch { throw V.feil(navn, "Skriv en lenke til 1Password (https://…1password.com/…)."); }
  if (u.protocol !== "https:" || !/(^|\.)1password\.(com|eu|ca)$/.test(u.hostname) || u.username || u.password) throw V.feil(navn, "Lenken må gå til 1Password (https://…1password.com/…).");
  return u.toString();
}

// ── Perioder for rutinene ──
export function periode(gruppe, dato = idagOslo()) {
  const [y, m, d] = dato.split("-").map(Number);
  if (gruppe === "maaned") return `${y}-${String(m).padStart(2, "0")}`;
  if (gruppe === "kvartal") return `${y}-K${Math.ceil(m / 3)}`;
  // ISO-uke
  const t = new Date(Date.UTC(y, m - 1, d));
  const dag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dag);
  const aar = t.getUTCFullYear();
  const uke = Math.ceil(((t - Date.UTC(aar, 0, 1)) / 86_400_000 + 1) / 7);
  return `${aar}-U${String(uke).padStart(2, "0")}`;
}
export const PERIODE_RE = { maaned: /^\d{4}-(0[1-9]|1[0-2])$/, uke: /^\d{4}-U(0[1-9]|[1-4]\d|5[0-3])$/, kvartal: /^\d{4}-K[1-4]$/ };
const GRUPPENAVN = { maaned: "Hver måned", uke: "Hver uke", kvartal: "Hvert kvartal" };
const periodeNavn = (gruppe, p) => {
  if (gruppe === "maaned") { const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"]; return `${MND[Number(p.slice(5)) - 1]} ${p.slice(0, 4)}`; }
  if (gruppe === "uke") return `uke ${Number(p.slice(6))}, ${p.slice(0, 4)}`;
  return `${p.slice(5, 6) === "K" ? `${p.slice(6)}. kvartal` : p} ${p.slice(0, 4)}`;
};

// ── SD1 Status ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const STATUSSIDER = [
  { navn: "Cloudflare", tekst: "Workers, Pages, D1 og Access", url: "https://www.cloudflarestatus.com" },
  { navn: "Supabase", tekst: "Databasene til kundemiljøene", url: "https://status.supabase.com" },
];
/** Offentlig statusside (Atlassian Statuspage: /api/v2/status.json). Ingen nøkler. Svarer den ikke: «ukjent». */
export async function hentStatusside(s, hent = fetch) {
  try {
    const r = await hent(`${s.url}/api/v2/status.json`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(2500) });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    return { ...s, indikator: d?.status?.indicator ?? "ukjent", beskrivelse: d?.status?.description ?? "Ukjent", hentet: naa() };
  } catch {
    return { ...s, indikator: "ukjent", beskrivelse: "Statussiden svarte ikke", hentet: naa() };
  }
}

async function kundemiljoer(db) {
  const i = await innstilling(db, "kundemiljoer", []);
  const liste = Array.isArray(i.verdi) ? i.verdi : [];
  if (liste.length) return { kilde: "innstillinger", liste };
  const kunder = await alle(db.prepare("SELECT id, navn, miljo_adresse FROM eier WHERE er_kunde = 1 AND miljo_adresse IS NOT NULL ORDER BY navn"));
  return { kilde: "eierkort", liste: kunder.map((k) => ({ navn: k.navn, adresse: k.miljo_adresse, eier_id: k.id })) };
}

rute("GET", "/api/drift/status", async ({ db, env }) => {
  const { kilde, liste } = await kundemiljoer(db);
  const eiere = new Map((await alle(db.prepare("SELECT id, navn FROM eier"))).map((e) => [e.id, e.navn]));
  const plattform = env?.DRIFT_STATUSSIDER === "av" ? STATUSSIDER.map((s) => ({ ...s, indikator: "av", beskrivelse: "Ikke hentet", hentet: null })) : await Promise.all(STATUSSIDER.map((s) => hentStatusside(s)));
  return {
    kilde, plattform,
    // Fase C: tallene fra kundemiljøene (versjon, utrulling, feil, innlogging, brukere, sikkerhetskopi) er ikke koblet til. Ingen nøkler.
    miljoer: liste.map((m) => ({ navn: m.navn || eiere.get(m.eier_id) || m.adresse, eier_id: m.eier_id ?? null, adresse: m.adresse, koblet: false, versjon: null, siste_utrulling: null, feil_24t: null, siste_innlogging: null, brukere: null, sikkerhetskopi: null })),
  };
});

// ── SD2 Kontoer ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
function lesKonto(b, pakrevd = false) {
  const ut = {};
  if (pakrevd || b.tjeneste !== undefined) ut.tjeneste = utenHemmelighet(V.tekst(b.tjeneste, "tjeneste", { maks: 120, pakrevd: true }), "tjeneste");
  for (const [k, maks] of [["eier", 120], ["plan", 120], ["fornyes_tekst", 60], ["hvelv", 120], ["merknad", 300]]) if (b[k] !== undefined) ut[k] = utenHemmelighet(V.tekst(b[k], k, { maks }), k);
  if (b.kost_mnd_ore !== undefined) ut.kost_mnd_ore = V.heltall(b.kost_mnd_ore, "kost_mnd_ore", { maks: 100_000_000, standard: 0 });
  if (b.fornyes !== undefined) ut.fornyes = V.dato(b.fornyes, "fornyes");
  if (b.hvelv_url !== undefined) ut.hvelv_url = hvelvUrl(b.hvelv_url);
  return ut;
}
const oppdater = (db, tabell, id, felt, t) => { const k = Object.keys(felt); return db.prepare(`UPDATE ${tabell} SET ${k.map((x) => `${x} = ?`).join(", ")}${k.length ? ", " : ""}endret = ? WHERE id = ?`).bind(...k.map((x) => felt[x]), t, id); };
const FORNYES_SNART = 30;

rute("GET", "/api/drift/kontoer", async ({ db }) => {
  const idag = idagOslo();
  const kontoer = await alle(db.prepare("SELECT * FROM konto ORDER BY tjeneste"));
  return { idag, kontoer: kontoer.map((k) => ({ ...k, dager: k.fornyes ? dagerMellom(idag, k.fornyes) : null, snart: !!k.fornyes && dagerMellom(idag, k.fornyes) <= FORNYES_SNART })), sum_mnd_ore: kontoer.reduce((s, k) => s + Number(k.kost_mnd_ore), 0), snart_dager: FORNYES_SNART };
});
rute("POST", "/api/drift/kontoer", async ({ req, db }) => {
  const f = lesKonto(await V.lesJson(req), true);
  const t = naa(), id = ulid();
  await db.prepare("INSERT INTO konto (id, tjeneste, eier, plan, kost_mnd_ore, fornyes, fornyes_tekst, hvelv, hvelv_url, merknad, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, f.tjeneste, f.eier ?? null, f.plan ?? null, f.kost_mnd_ore ?? 0, f.fornyes ?? null, f.fornyes_tekst ?? null, f.hvelv ?? null, f.hvelv_url ?? null, f.merknad ?? null, t, t).run();
  return { id };
});
rute(`PATCH`, `/api/drift/kontoer/${ULID}`, async ({ req, db, p }) => {
  if (!(await db.prepare("SELECT id FROM konto WHERE id = ?").bind(p[0]).first())) throw ikkeFunnet();
  const f = lesKonto(await V.lesJson(req));
  if (Object.keys(f).length) await oppdater(db, "konto", p[0], f, naa()).run();
  return { id: p[0] };
});
rute("DELETE", `/api/drift/kontoer/${ULID}`, async ({ db, p }) => { await db.prepare("DELETE FROM konto WHERE id = ?").bind(p[0]).run(); return { slettet: p[0] }; });

// ── SD2 Frister ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const FRIST_GUL = 7;
function lesFrist(b, pakrevd = false) {
  const ut = {};
  if (pakrevd || b.tekst !== undefined) ut.tekst = utenHemmelighet(V.tekst(b.tekst, "tekst", { maks: 200, pakrevd: true }), "tekst");
  if (pakrevd || b.kategori !== undefined) ut.kategori = V.tekst(b.kategori, "kategori", { maks: 60, pakrevd: true });
  if (pakrevd || b.dato !== undefined) ut.dato = V.dato(b.dato, "dato", { pakrevd: true });
  if (b.varsel_dager !== undefined) ut.varsel_dager = V.heltall(b.varsel_dager, "varsel_dager", { min: 0, maks: 365, standard: 14 });
  return ut;
}
rute("GET", "/api/drift/frister", async ({ db }) => {
  const idag = idagOslo();
  const frister = (await alle(db.prepare("SELECT * FROM frist ORDER BY dato, tekst"))).map((f) => {
    const dager = dagerMellom(idag, f.dato);
    return { ...f, dager, varsel_dato: pluss(f.dato, -f.varsel_dager), niva: dager < 0 ? "forfalt" : dager <= FRIST_GUL ? "snart" : "ok" };
  });
  return { idag, frister, innen_14: frister.filter((f) => f.dager >= 0 && f.dager <= 14).length, kategorier: [...new Set(frister.map((f) => f.kategori))].sort((a, b) => a.localeCompare(b, "nb")) };
});
rute("POST", "/api/drift/frister", async ({ req, db }) => {
  const f = lesFrist(await V.lesJson(req), true);
  const t = naa(), id = ulid();
  await db.prepare("INSERT INTO frist (id, tekst, kategori, dato, varsel_dager, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, f.tekst, f.kategori, f.dato, f.varsel_dager ?? 14, t, t).run();
  return { id };
});
rute("PATCH", `/api/drift/frister/${ULID}`, async ({ req, db, p }) => {
  if (!(await db.prepare("SELECT id FROM frist WHERE id = ?").bind(p[0]).first())) throw ikkeFunnet();
  const f = lesFrist(await V.lesJson(req));
  if (Object.keys(f).length) await oppdater(db, "frist", p[0], f, naa()).run();
  return { id: p[0] };
});
rute("DELETE", `/api/drift/frister/${ULID}`, async ({ db, p }) => { await db.prepare("DELETE FROM frist WHERE id = ?").bind(p[0]).run(); return { slettet: p[0] }; });

// ── SD2 Rutiner med avkryssing per periode ────────────────────────────────────────────────────────────────────────────────────
rute("GET", "/api/drift/rutiner", async ({ db, url }) => {
  const idag = V.dato(url.searchParams.get("dato"), "dato") ?? idagOslo();
  const rutiner = await alle(db.prepare("SELECT * FROM rutine ORDER BY CASE gruppe WHEN 'maaned' THEN 1 WHEN 'uke' THEN 2 ELSE 3 END, rekkefolge, navn"));
  const punkter = await alle(db.prepare("SELECT * FROM rutinepunkt ORDER BY rekkefolge, opprettet"));
  const ut = [];
  for (const r of rutiner) {
    const per = periode(r.gruppe, idag);
    const kryss = await alle(db.prepare("SELECT a.rutinepunkt_id, a.hvem, a.tid FROM rutineavkryssing a JOIN rutinepunkt p ON p.id = a.rutinepunkt_id WHERE p.rutine_id = ? AND a.periode = ?").bind(r.id, per));
    const mine = punkter.filter((p) => p.rutine_id === r.id).map((p) => { const k = kryss.find((x) => x.rutinepunkt_id === p.id); return { id: p.id, tekst: p.tekst, ok: !!k, hvem: k?.hvem ?? null, tid: k?.tid ?? null }; });
    ut.push({ id: r.id, gruppe: r.gruppe, gruppe_navn: GRUPPENAVN[r.gruppe], navn: r.navn, periode: per, periode_navn: periodeNavn(r.gruppe, per), punkter: mine, ferdige: mine.filter((p) => p.ok).length, antall: mine.length });
  }
  return { idag, rutiner: ut };
});
rute("POST", "/api/drift/rutiner", async ({ req, db }) => {
  const b = await V.lesJson(req);
  const gruppe = V.valg(b.gruppe, "gruppe", ["maaned", "uke", "kvartal"], { pakrevd: true });
  const navn = V.tekst(b.navn, "navn", { maks: 120 }) ?? GRUPPENAVN[gruppe];
  const punkter = V.liste(b.punkter, "punkter", { maks: 50 }).map((p, i) => utenHemmelighet(V.tekst(p, `punkter.${i}`, { maks: 200, pakrevd: true }), `punkter.${i}`));
  const t = naa(), id = ulid();
  const n = Number(await db.prepare("SELECT COUNT(*) AS n FROM rutine").first("n"));
  await db.batch([
    db.prepare("INSERT INTO rutine (id, gruppe, navn, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?)").bind(id, gruppe, navn, n + 1, t, t),
    ...punkter.map((p, i) => db.prepare("INSERT INTO rutinepunkt (id, rutine_id, tekst, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?)").bind(ulid(), id, p, i + 1, t, t)),
  ]);
  return { id };
});
rute("POST", `/api/drift/rutiner/${ULID}/punkter`, async ({ req, db, p }) => {
  if (!(await db.prepare("SELECT id FROM rutine WHERE id = ?").bind(p[0]).first())) throw ikkeFunnet();
  const b = await V.lesJson(req);
  const tekst = utenHemmelighet(V.tekst(b.tekst, "tekst", { maks: 200, pakrevd: true }), "tekst");
  const n = Number(await db.prepare("SELECT COALESCE(MAX(rekkefolge), 0) AS n FROM rutinepunkt WHERE rutine_id = ?").bind(p[0]).first("n"));
  const t = naa(), id = ulid();
  await db.prepare("INSERT INTO rutinepunkt (id, rutine_id, tekst, rekkefolge, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?)").bind(id, p[0], tekst, n + 1, t, t).run();
  return { id };
});
rute("DELETE", `/api/drift/rutinepunkter/${ULID}`, async ({ db, p }) => { await db.prepare("DELETE FROM rutinepunkt WHERE id = ?").bind(p[0]).run(); return { slettet: p[0] }; });
rute("PUT", `/api/drift/rutinepunkter/${ULID}/avkryssing`, async ({ req, db, p, bruker }) => {
  const punkt = await db.prepare("SELECT p.id, r.gruppe FROM rutinepunkt p JOIN rutine r ON r.id = p.rutine_id WHERE p.id = ?").bind(p[0]).first();
  if (!punkt) throw ikkeFunnet();
  const b = await V.lesJson(req);
  const per = b.periode === undefined ? periode(punkt.gruppe) : String(b.periode);
  if (!PERIODE_RE[punkt.gruppe].test(per)) throw V.feil("periode", "Ugyldig periode for rutinen.");
  const ok = V.flagg(b.ok, "ok", { standard: 1 });
  if (ok) await db.prepare("INSERT INTO rutineavkryssing (rutinepunkt_id, periode, hvem, tid) VALUES (?, ?, ?, ?) ON CONFLICT(rutinepunkt_id, periode) DO NOTHING").bind(punkt.id, per, bruker.navn, naa()).run();
  else await db.prepare("DELETE FROM rutineavkryssing WHERE rutinepunkt_id = ? AND periode = ?").bind(punkt.id, per).run();
  return { id: punkt.id, periode: per, ok: !!ok };
});

// ── Innstillinger (fase C-delen; supportnivå, timepris og svarmaler eies av K-259) ─────────────────────────────────────────────
export const VARSLER = [
  { kode: "frister", navn: "Frister i Drift", tekst: "E-post og varsel i Admin etter fristens varsel" },
  { kode: "fornyelser", navn: "Avtaler som fornyes", tekst: "Når en avtale fornyes innen «fornyes snart»-dagene" },
  { kode: "kpi", navn: "KPI-justering", tekst: "Når et KPI-varsel skal sendes til kunden (dager før står på KPI-siden)" },
  { kode: "svarfrist", navn: "Svarfrist på saker", tekst: "Når en sak har 25 % av fristen igjen, og når den er forfalt" },
  { kode: "fakturakjoring", navn: "Fakturakjøring", tekst: "3 dager før den 1. i måneden" },
];
rute("GET", "/api/innstillinger/varsler", async ({ db }) => {
  const v = (await innstilling(db, "varsler", {})).verdi ?? {};
  return { varsler: VARSLER.map((x) => ({ ...x, paa: typeof v[x.kode] === "boolean" ? v[x.kode] : x.kode !== "fakturakjoring" })) };
}, "Innstillinger");
rute("PATCH", "/api/innstillinger/varsler", async ({ req, db }) => {
  const b = await V.lesJson(req);
  const naaV = (await innstilling(db, "varsler", {})).verdi ?? {};
  for (const x of VARSLER) if (b[x.kode] !== undefined) naaV[x.kode] = V.flagg(b[x.kode], x.kode) === 1;
  await settInnstilling(db, "varsler", naaV);
  return { varsler: naaV };
}, "Innstillinger");

rute("GET", "/api/innstillinger/kundemiljoer", async ({ db }) => {
  const i = await innstilling(db, "kundemiljoer", []);
  const kunder = await alle(db.prepare("SELECT id, navn, miljo_adresse FROM eier WHERE er_kunde = 1 ORDER BY navn"));
  return { kundemiljoer: Array.isArray(i.verdi) ? i.verdi : [], kunder };
}, "Innstillinger");
rute("PUT", "/api/innstillinger/kundemiljoer", async ({ req, db }) => {
  const b = await V.lesJson(req);
  const liste = V.liste(b.kundemiljoer, "kundemiljoer", { maks: 200 }).map((m, i) => {
    if (!m || typeof m !== "object") throw V.feil(`kundemiljoer.${i}`, "Må være et objekt.");
    const adresse = V.tekst(m.adresse, `kundemiljoer.${i}.adresse`, { maks: 200, pakrevd: true });
    if (!/^[a-z0-9.-]+\.[a-z]{2,}(\/[\w./-]*)?$/i.test(adresse)) throw V.feil(`kundemiljoer.${i}.adresse`, "Skriv adressen uten https://, f.eks. granlund.hengsel.no.");
    return { navn: V.tekst(m.navn, `kundemiljoer.${i}.navn`, { maks: 120 }) ?? "", adresse: adresse.toLowerCase(), eier_id: m.eier_id ? V.id(m.eier_id, `kundemiljoer.${i}.eier_id`) : null };
  });
  await settInnstilling(db, "kundemiljoer", liste);
  return { kundemiljoer: liste };
}, "Innstillinger");

rute("GET", "/api/innstillinger/avtalemaler", async ({ db }) => {
  const maler = await alle(db.prepare("SELECT m.id, m.navn, m.versjon, m.gjelder_fra, m.status, m.eksempel, (SELECT COUNT(*) FROM avtaledokument d WHERE d.avtalemal_id = m.id) AS brukt FROM avtalemal m ORDER BY m.navn, m.gjelder_fra DESC"));
  return { maler: maler.map((m) => ({ ...m, brukt: Number(m.brukt), eksempel: m.eksempel === 1 })) };
}, "Innstillinger");

/** Brukere og roller: brukertabellen og tilgangslista i worker/tilgang.js (bare e-postadresser, ingen hemmeligheter) */
rute("GET", "/api/innstillinger/brukere", async ({ db }) => {
  const brukere = await alle(db.prepare("SELECT navn, epost, rolle FROM bruker ORDER BY navn"));
  const fraTilgang = Object.entries(ROLLER).map(([epost, r]) => ({ navn: r.navn ?? epost, epost, rolle: r.rolle ?? (r.alle ? "leser" : "kunde-admin") }));
  const alleB = [...brukere, ...fraTilgang.filter((x) => !brukere.some((b) => b.epost === x.epost))];
  return {
    brukere: alleB,
    tilgang: [
      { omraade: "Oversikt, Salg, Avtaler", eier: "Se og endre", support: "Ingen tilgang" },
      { omraade: "Kunder", eier: "Se og endre", support: "Se kontakter, butikker, kundemiljø og saker" },
      { omraade: "Support (Saker og Timer)", eier: "Se og endre", support: "Se og endre, timer uten beløp" },
      { omraade: "Oppstart", eier: "Se og endre", support: "Ingen tilgang" },
      { omraade: "Fakturering og Tall", eier: "Se og endre", support: "Ingen tilgang (ADM-403)" },
      { omraade: "Drift og Innstillinger", eier: "Se og endre", support: "Ingen tilgang (ADM-403)" },
    ],
  };
}, "Innstillinger");
