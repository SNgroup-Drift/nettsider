/**
 * Rapportene fra GitHub Action «Ny kunde» / «Fjern testkunde» (K-272): POST /api/oppstart/rapport. Ligger utenfor Cloudflare Access (Action-en har
 * ikke en Access-innlogging), så vernet er her: HMAC-SHA256 over «<tid>.<kropp>» med Worker-hemmeligheten NY_KUNDE_RAPPORTNOKKEL (samme verdi
 * som ADMIN_RAPPORT_NOKKEL i GitHub-miljøet «ny-kunde»), tidsvindu på 5 minutter, størrelse maks 64 KB, bare kjente jobber og steg, og ingen
 * hemmelighet lagres (loggen renses her også, selv om Action-en har renset den). Husk å la Access-appen ha en Bypass-policy for akkurat
 * stien /api/oppstart/rapport (se claude/k272-rapport.md i hengsel-crm); alt annet på admin.hengsel.no er fortsatt bak Access.
 */
import { ApiFeil, naa, ER_ULID, json } from "./db.js";
import { STEG } from "../src/lib/ny-kunde.js";

export const MAKS_KROPP = 64 * 1024;
export const VINDU_SEKUNDER = 300;
const MAKS_LOGG = 12_000;
const RUN_URL = /^https:\/\/github\.com\/SNgroup-Drift\/hengsel-crm\/actions\/runs\/\d{1,20}$/;
const MONSTRE = [
  /sb_(?:secret|publishable)_[A-Za-z0-9_-]{8,}/g, /sbp_[a-f0-9]{20,}/g, /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g,
  /gh[pousr]_[A-Za-z0-9]{20,}/g, /github_pat_[A-Za-z0-9_]{20,}/g, /whsec_[A-Za-z0-9+/=]{16,}/g, /(postgres(?:ql)?:\/\/[^:\s/]+:)[^@\s]+@/g, /(Bearer\s+)[A-Za-z0-9._~+/=-]{12,}/gi,
];
/** Fjerner kjente nøkkelformer fra tekst som skal lagres */
export function rens(t) {
  let s = String(t ?? "");
  for (const m of MONSTRE) s = s.replace(m, (_, p1) => (typeof p1 === "string" ? `${p1}***${m.source.includes("@") ? "@" : ""}` : "***"));
  return s;
}

const hex = (s) => { const b = new Uint8Array(s.length / 2); for (let i = 0; i < b.length; i++) b[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16); return b; };

/** Sjekker signaturen med konstanttid-sammenligning (crypto.subtle.verify). `naaMs` kan overstyres i testene. */
export async function sjekkSignatur(nokkel, tid, kropp, signatur, naaMs = Date.now()) {
  if (!nokkel || nokkel.length < 32) return false;
  if (!/^\d{9,12}$/.test(tid ?? "") || !/^[0-9a-f]{64}$/.test(signatur ?? "")) return false;
  if (Math.abs(naaMs / 1000 - Number(tid)) > VINDU_SEKUNDER) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(nokkel), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, hex(signatur), new TextEncoder().encode(`${tid}.${kropp}`));
}

const STEGKODER = STEG.map((s) => s.kode);
const trunk = (s, n) => (typeof s === "string" ? (s.length > n ? s.slice(-n) : s) : null);
const OFFENTLIG = ["pages_adresse", "domene", "supabase_ref", "test", "pr_url", "pr", "gren", "miljo", "site_url", "pages", "dns", "domenestatus", "funksjoner", "bokter", "cron", "innlogging", "rls", "transaksjon", "side", "admin", "invitasjon", "laget", "revet", "hemmeligheter"];
const rensResultat = (r) => {
  if (!r || typeof r !== "object") return null;
  const ut = {};
  for (const k of OFFENTLIG) if (k in r && (typeof r[k] === "string" || typeof r[k] === "number" || typeof r[k] === "boolean" || Array.isArray(r[k]) || r[k] === null)) ut[k] = typeof r[k] === "string" ? rens(r[k]).slice(0, 300) : Array.isArray(r[k]) ? r[k].slice(0, 30).map((x) => rens(String(x)).slice(0, 200)) : r[k];
  return JSON.stringify(ut);
};

export async function handterRapport(req, env) {
  try {
    if (req.method !== "POST") return json(405, { ok: false, kode: "ADM-405", melding: "Bare POST." });
    if (!env.DB) throw new ApiFeil(503, "ADM-504", "Databasen er ikke koblet til.");
    if (!env.NY_KUNDE_RAPPORTNOKKEL) return json(503, { ok: false, kode: "ADM-503", melding: "Rapportering er ikke koblet til." });
    const lengde = Number(req.headers.get("Content-Length") ?? 0);
    if (lengde > MAKS_KROPP) return json(413, { ok: false, kode: "ADM-413", melding: "For stor." });
    const kropp = await req.text();
    if (kropp.length > MAKS_KROPP) return json(413, { ok: false, kode: "ADM-413", melding: "For stor." });
    const ok = await sjekkSignatur(env.NY_KUNDE_RAPPORTNOKKEL, req.headers.get("X-Rapport-Tid"), kropp, req.headers.get("X-Rapport-Signatur"), env.NAA_MS ? Number(env.NAA_MS) : Date.now());
    if (!ok) return json(401, { ok: false, kode: "ADM-401", melding: "Ugyldig signatur." });
    let h;
    try { h = JSON.parse(kropp); } catch { return json(400, { ok: false, kode: "ADM-400", melding: "Ugyldig JSON." }); }
    if (!h || typeof h !== "object" || !ER_ULID.test(String(h.jobb_id ?? ""))) return json(400, { ok: false, kode: "ADM-400", melding: "Ugyldig jobb." });
    const db = env.DB;
    const jobb = await db.prepare("SELECT * FROM ny_kunde_jobb WHERE id = ?").bind(h.jobb_id).first();
    if (!jobb) return json(404, { ok: false, kode: "ADM-404", melding: "Ukjent jobb." });
    const t = naa();
    const hvem = `Action${h.run_id && /^\d{1,20}$/.test(String(h.run_id)) ? ` #${h.run_id}` : ""}`;
    const runUrl = typeof h.run_url === "string" && RUN_URL.test(h.run_url) ? h.run_url : null;

    if (h.jobb === "ferdig" || h.jobb === "fjernet") {
      const nyStatus = h.jobb === "fjernet" ? (h.status === "ok" ? "fjernet" : "feil") : h.status === "ok" ? "ferdig" : "feil";
      await db.prepare("UPDATE ny_kunde_jobb SET status = ?, resultat = COALESCE(?, resultat), run_url = COALESCE(?, run_url), run_id = COALESCE(?, run_id), ferdig_tid = ?, endret = ? WHERE id = ?")
        .bind(nyStatus, h.resultat ? rensResultat(h.resultat) : null, runUrl, h.run_id ? String(h.run_id).slice(0, 20) : null, nyStatus === "feil" ? null : t, t, jobb.id).run();
      await db.prepare("INSERT INTO ny_kunde_logg (jobb_id, tid, hvem, handling, detalj) VALUES (?, ?, ?, ?, ?)").bind(jobb.id, t, hvem, `jobb ${h.jobb}: ${h.status === "ok" ? "ok" : "feil"}`, null).run();
      return json(200, { ok: true });
    }

    if (h.steg === "nedrigging") {
      const feil = typeof h.feil === "string" ? rens(h.feil).slice(0, 500) : null;
      await db.prepare("INSERT INTO ny_kunde_logg (jobb_id, tid, hvem, handling, detalj) VALUES (?, ?, ?, ?, ?)").bind(jobb.id, t, hvem, `nedrigging: ${h.status}`, trunk(rens(h.logg ?? feil ?? ""), MAKS_LOGG) || null).run();
      if (h.status === "feil") await db.prepare("UPDATE ny_kunde_jobb SET status = 'feil', run_url = COALESCE(?, run_url), endret = ? WHERE id = ?").bind(runUrl, t, jobb.id).run();
      else if (runUrl) await db.prepare("UPDATE ny_kunde_jobb SET run_url = ?, endret = ? WHERE id = ?").bind(runUrl, t, jobb.id).run();
      return json(200, { ok: true });
    }

    if (!STEGKODER.includes(h.steg) || !["kjorer", "ok", "feil"].includes(h.status)) return json(400, { ok: false, kode: "ADM-400", melding: "Ugyldig steg." });
    const sekunder = Number.isInteger(h.sekunder) && h.sekunder >= 0 && h.sekunder < 86_400 ? h.sekunder : null;
    const feil = h.status === "feil" ? rens(h.feil ?? "Feilet.").slice(0, 600) : null;
    await db.batch([
      h.status === "kjorer"
        ? db.prepare("UPDATE ny_kunde_steg SET status = 'kjorer', startet = ?, ferdig = NULL, sekunder = NULL, feil = NULL, endret = ? WHERE jobb_id = ? AND kode = ?").bind(t, t, jobb.id, h.steg)
        : db.prepare("UPDATE ny_kunde_steg SET status = ?, ferdig = ?, sekunder = ?, feil = ?, logg = ?, resultat = ?, endret = ? WHERE jobb_id = ? AND kode = ?").bind(h.status, t, sekunder, feil, trunk(rens(h.logg ?? ""), MAKS_LOGG), rensResultat(h.resultat), t, jobb.id, h.steg),
      db.prepare("UPDATE ny_kunde_jobb SET status = ?, gjeldende_steg = ?, run_url = COALESCE(?, run_url), run_id = COALESCE(?, run_id), endret = ? WHERE id = ?")
        .bind(h.status === "feil" ? "feil" : "kjorer", h.steg, runUrl, h.run_id ? String(h.run_id).slice(0, 20) : null, t, jobb.id),
      db.prepare("INSERT INTO ny_kunde_logg (jobb_id, tid, hvem, handling, detalj) VALUES (?, ?, ?, ?, ?)").bind(jobb.id, t, hvem, `${h.steg}: ${h.status}`, feil),
    ]);
    return json(200, { ok: true });
  } catch (e) {
    if (e instanceof ApiFeil) return json(e.status, { ok: false, kode: e.kode, melding: e.message });
    console.error("rapport:", e && e.message);
    return json(503, { ok: false, kode: "ADM-504", melding: "Databasen svarte ikke." });
  }
}
