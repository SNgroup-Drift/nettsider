/**
 * POST /api/demo: demoskjemaet på /priser-og-demo (K-160). Kjører bare for denne stien (assets.run_worker_first i wrangler.jsonc).
 *
 * - Bare POST (andre metoder: 405 med Allow: POST). Origin-hodet må være nettstedets egen adresse (ellers 403).
 * - Body maks 8 KB (413), JSON eller application/x-www-form-urlencoded (ellers 415).
 * - Honeypot: er det skjulte feltet «nettsted» utfylt, svarer ruten 200 {ok:true}, men sender ingenting.
 * - Tidssjekk: feltet «t» (millisekunder siden 1970, satt av skriptet når skjemaet ble vist) må være mellom 3 sekunder og 24 timer gammelt.
 * - Validering: navn 1–120 tegn, e-post (enkel sjekk) eller telefon (6–20 siffer), minst én av dem, butikk maks 120, «Hva vil dere se?»
 *   maks 1000, antall avdelinger fra en fast liste. Kontrolltegn og linjeskift avvises i alle felt som kan havne i e-posthoder.
 * - Svar: 200 {ok:true} (uten binding: {ok:true, levert:false, reserve:"mailto"}) · 400 {ok:false, feil:{felt:melding}} · 403 · 405 · 413 · 415 · 503 {ok:false, reserve:"mailto"}.
 * - E-post: Cloudflare-bindingen DEMO_EPOST (send_email, destination_address hei@hengsel.no) med rå MIME bygd her. Bindingen er
 *   valgfri (K-160, Eirik 11.10): mangler den, valideres forespørselen som vanlig og ruten svarer 200 {ok:true, levert:false, reserve:"mailto"},
 *   og siden viser mailto-lenken til hei@hengsel.no uten feilmelding. Slås e-posten på senere (send_email-blokken tilbake i wrangler.jsonc,
 *   se docs/k160-cloudflare-skjema.md), sendes e-posten uten kodeendring. Kastes det en feil ved sending, svarer ruten 503 {reserve:"mailto"}.
 * - Ingenting lagres, og det logges ingen persondata (bare feilkoden fra Cloudflare).
 * - Lead til Hengsel Admin (K-240): er variabelen LEAD_URL satt (f.eks. https://admin.hengsel.no/api/lead; AV som standard), sendes de samme
 *   feltene server til server dit etter at de er validert, med Origin = nettstedets egen adresse og, når hemmeligheten LEAD_NOKKEL er satt,
 *   «Authorization: Bearer …». Feiler leveringen, logges bare statuskoden; svaret til nettleseren påvirkes ikke.
 *
 * Importerer ingenting fra cloudflare:email på toppnivå, så filen kan testes i Node (scripts/demo.test.mjs).
 */

export interface DemoEnv {
  DEMO_EPOST?: { send(melding: unknown): Promise<unknown> };
  /** K-240: adressen til POST /api/lead i Hengsel Admin. Tom eller uten verdi = leaden sendes ikke (standard). */
  LEAD_URL?: string;
  /** K-240: valgfri delt hemmelighet (wrangler secret), sendes som Bearer når den er satt. */
  LEAD_NOKKEL?: string;
}

export const AVSENDER = "demo@hengsel.no";
export const MOTTAKER = "hei@hengsel.no";
export const MAKS_BODY = 8 * 1024; // byte
export const MIN_ALDER = 3_000; // ms
export const MAKS_ALDER = 24 * 60 * 60 * 1000; // ms
const MAKS_FREMTID = 60_000; // ms: litt slingringsmonn for klokkeavvik
export const AVDELINGER: Record<string, string> = { "1": "1", "2-3": "2–3", "4+": "4 eller flere" };
const GRENSER = { navn: 120, butikk: 120, epost: 254, melding: 1000 } as const;

export type Felt = { navn: string; butikk: string; epost: string; tlf: string; avdelinger: string; melding: string };
export type Feil = Record<string, string>;

const JSON_HODER = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

function json(status: number, data: unknown, ekstra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HODER, ...ekstra } });
}

export async function handterDemo(
  req: Request,
  env: DemoEnv,
  na: number = Date.now(),
  lagMelding: (fra: string, til: string, raw: string) => Promise<unknown> = standardMelding,
  hent: typeof fetch = fetch,
): Promise<Response> {
  if (req.method.toUpperCase() !== "POST") {
    return json(405, { ok: false, feil: { skjema: "Metoden er ikke tillatt." } }, { Allow: "POST" });
  }
  const url = new URL(req.url);
  if (req.headers.get("Origin") !== url.origin) {
    return json(403, { ok: false, feil: { skjema: "Forespørselen kom fra en annen adresse." } });
  }
  const lengde = Number(req.headers.get("Content-Length") ?? "0");
  if (lengde > MAKS_BODY) return json(413, { ok: false, feil: { skjema: "Forespørselen er for stor." } });
  const type = (req.headers.get("Content-Type") ?? "").toLowerCase();
  const erJson = type.startsWith("application/json");
  if (!erJson && !type.startsWith("application/x-www-form-urlencoded")) {
    return json(415, { ok: false, feil: { skjema: "Ukjent innholdstype." } });
  }
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.byteLength > MAKS_BODY) return json(413, { ok: false, feil: { skjema: "Forespørselen er for stor." } });
  const rå = lesBody(new TextDecoder().decode(bytes), erJson);
  if (!rå) return json(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } });

  // Honeypot: roboter fyller det skjulte feltet. De får samme svar som om det gikk bra.
  if ((rå.nettsted ?? "") !== "") return json(200, { ok: true });

  const t = Number(rå.t);
  if (!rå.t || !Number.isFinite(t)) return json(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } });
  const alder = na - t;
  if (alder < MIN_ALDER || alder > MAKS_ALDER || alder < -MAKS_FREMTID) {
    return json(400, { ok: false, feil: { skjema: "Forespørselen kunne ikke leses." } });
  }

  const { felt, feil } = valider(rå);
  if (!felt) return json(400, { ok: false, feil });

  // K-240: leaden til Hengsel Admin, bare når LEAD_URL er satt. Feil her stopper aldri svaret til nettleseren.
  await sendLead(env, felt, rå.t, url.origin, hent);

  const bind = env.DEMO_EPOST;
  // Uten e-postbinding (ikke slått på ennå): ingen feil, siden viser mailto-lenken
  if (!bind) return json(200, { ok: true, levert: false, reserve: "mailto" });
  try {
    const raw = byggMime(felt, new Date(na), crypto.randomUUID());
    await bind.send(await lagMelding(AVSENDER, MOTTAKER, raw));
  } catch (e) {
    // Ingen persondata i loggen: bare feilkoden, ikke meldingen eller feltene
    console.error("demo: sending feilet", (e as { code?: string })?.code ?? (e as Error)?.name ?? "ukjent");
    return json(503, { ok: false, reserve: "mailto" });
  }
  return json(200, { ok: true });
}

/** K-240: POST til Hengsel Admin (/api/lead) med de validerte feltene. Returnerer true når Admin svarte ok. */
export async function sendLead(env: DemoEnv, f: Felt, t: string, origin: string, hent: typeof fetch = fetch): Promise<boolean> {
  const adresse = (env.LEAD_URL ?? "").trim();
  if (!/^https:\/\/[^\s/]+\/api\/lead$/.test(adresse)) return false;
  const hoder: Record<string, string> = { "Content-Type": "application/json", Origin: origin, Accept: "application/json" };
  if (env.LEAD_NOKKEL) hoder.Authorization = `Bearer ${env.LEAD_NOKKEL}`;
  try {
    const r = await hent(adresse, { method: "POST", headers: hoder, body: JSON.stringify({ navn: f.navn, butikk: f.butikk, epost: f.epost, tlf: f.tlf, avdelinger: f.avdelinger, melding: f.melding, nettsted: "", t }) });
    if (!r.ok) console.error("demo: lead ikke levert", r.status);
    return r.ok;
  } catch (e) {
    console.error("demo: lead feilet", (e as Error)?.name ?? "ukjent");
    return false;
  }
}

async function standardMelding(fra: string, til: string, raw: string): Promise<unknown> {
  const { EmailMessage } = await import("cloudflare:email");
  return new EmailMessage(fra, til, raw);
}

function lesBody(tekst: string, erJson: boolean): Record<string, string> | null {
  let ut: Record<string, unknown>;
  if (erJson) {
    try {
      const v = JSON.parse(tekst);
      if (!v || typeof v !== "object" || Array.isArray(v)) return null;
      ut = v as Record<string, unknown>;
    } catch {
      return null;
    }
  } else {
    ut = Object.fromEntries(new URLSearchParams(tekst));
  }
  const rent: Record<string, string> = {};
  for (const [k, v] of Object.entries(ut)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "number" && k === "t") { rent[k] = String(v); continue; }
    if (typeof v !== "string") return null;
    rent[k] = v;
  }
  return rent;
}

// Kontrolltegn (U+0000–U+001F, U+007F–U+009F) og Unicode-linjeskift
// eslint-disable-next-line no-control-regex
const KONTROLL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
// I «Hva vil dere se?» er linjeskift og tabulator lov (det står bare i kroppen), andre kontrolltegn er det ikke
// eslint-disable-next-line no-control-regex
const KONTROLL_UTEN_LINJESKIFT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/;
const EPOST_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function valider(rå: Record<string, string>): { felt: Felt | null; feil: Feil } {
  const feil: Feil = {};
  const navn = (rå.navn ?? "").trim();
  const butikk = (rå.butikk ?? "").trim();
  const epost = (rå.epost ?? "").trim();
  const tlf = (rå.tlf ?? "").trim();
  const avdelinger = (rå.avdelinger ?? "").trim();
  const melding = (rå.melding ?? "").replace(/\r\n?/g, "\n").trim();

  if (!navn) feil.navn = "Fyll inn navn.";
  else if (navn.length > GRENSER.navn) feil.navn = "Navnet er for langt.";
  else if (KONTROLL.test(navn)) feil.navn = "Navnet har ugyldige tegn.";

  if (butikk.length > GRENSER.butikk) feil.butikk = "Butikknavnet er for langt.";
  else if (KONTROLL.test(butikk)) feil.butikk = "Butikknavnet har ugyldige tegn.";

  if (epost && (epost.length > GRENSER.epost || !EPOST_RE.test(epost))) feil.epost = "Skriv en gyldig e-postadresse.";
  if (tlf) {
    const siffer = tlf.replace(/[\s().-]/g, "");
    if (KONTROLL.test(tlf) || !/^\+?\d{6,20}$/.test(siffer)) feil.tlf = "Skriv et gyldig telefonnummer.";
  }
  if (!epost && !tlf) {
    feil.epost = feil.epost ?? "Fyll inn e-post eller telefon.";
    feil.tlf = feil.tlf ?? "Fyll inn e-post eller telefon.";
  }

  if (avdelinger && !(avdelinger in AVDELINGER)) feil.avdelinger = "Velg et av alternativene.";
  if (melding.length > GRENSER.melding) feil.melding = "Teksten er for lang.";
  else if (KONTROLL_UTEN_LINJESKIFT.test(melding)) feil.melding = "Teksten har ugyldige tegn.";

  if (Object.keys(feil).length) return { felt: null, feil };
  return { felt: { navn, butikk, epost, tlf, avdelinger, melding }, feil };
}

// ---- MIME ----

const enc = new TextEncoder();

function base64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** RFC 2047: «=?UTF-8?B?…?=». Hvert ord er maks 75 tegn og deles aldri midt i et tegn. Ren ASCII uten spesialtegn står uendret. */
export function kodeEmne(emne: string): string {
  if (/^[\x20-\x7e]*$/.test(emne) && !emne.includes("=?")) return emne;
  const ord: string[] = [];
  let del = "";
  for (const tegn of emne) {
    if (enc.encode(del + tegn).length > 45) { ord.push(del); del = ""; } // 45 byte gir 60 base64-tegn + 12 = 72
    del += tegn;
  }
  if (del) ord.push(del);
  return ord.map((o) => `=?UTF-8?B?${base64(enc.encode(o))}?=`).join("\r\n ");
}

export function emne(f: Felt): string {
  return `Demo av Hengsel – ${f.butikk || f.navn}`;
}

export function epostTekst(f: Felt): string {
  const rader = [
    `Navn: ${f.navn}`,
    `Butikk: ${f.butikk}`,
    `E-post: ${f.epost}`,
    `Telefon: ${f.tlf}`,
    `Antall avdelinger: ${f.avdelinger ? AVDELINGER[f.avdelinger] : ""}`,
    "",
    "Hva vil dere se?",
    f.melding,
    "",
    "Sendt fra hengsel.no/priser-og-demo",
  ];
  return rader.join("\r\n");
}

/** Rå MIME (RFC 5322) med tekst/plain i UTF-8 som base64. Reply-To settes bare når e-post er oppgitt. */
export function byggMime(f: Felt, dato: Date, id: string): string {
  const hoder = [
    `From: Hengsel nettside <${AVSENDER}>`,
    `To: ${MOTTAKER}`,
    ...(f.epost ? [`Reply-To: ${f.epost}`] : []),
    `Subject: ${kodeEmne(emne(f))}`,
    `Date: ${rfcDato(dato)}`,
    `Message-ID: <${id}@hengsel.no>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  const kropp = (base64(enc.encode(epostTekst(f))).match(/.{1,76}/g) ?? []).join("\r\n");
  return `${hoder.join("\r\n")}\r\n\r\n${kropp}\r\n`;
}

const DAGER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MANEDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function rfcDato(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${DAGER[d.getUTCDay()]}, ${p(d.getUTCDate())} ${MANEDER[d.getUTCMonth()]} ${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} +0000`;
}
