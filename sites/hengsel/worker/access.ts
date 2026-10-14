/**
 * Delt sjekk av Cloudflare Access foran sider på hengsel.no som ikke skal være åpne (K-226 /hjelp; /kunde/sigdal, K-223, bruker den samme koden).
 *
 * Tokenet er en JWT (header Cf-Access-Jwt-Assertion) signert med RS256 av teamets nøkler (https://<team>.cloudflareaccess.com/cdn-cgi/access/certs).
 * Vi sjekker signatur, utsteder (iss), målgruppe (aud = Access-appen), utløp (exp), tidligst-gyldig (nbf) og at e-postadressen finnes.
 * Alt som mangler eller ikke stemmer, avvises. Ingen unntak for «lokal utvikling» og ingen testmodus i denne koden: uten gyldig token vises ingenting.
 * Hvem som slipper inn, bestemmes av regelen i Access-appen (e-postadressene Eirik inviterer), ikke av en liste i repoet.
 * Samme sjekk som i sites/admin/worker/access.js (K-184), skrevet om til TypeScript.
 */

export interface AccessEnv {
  /** «<team>.cloudflareaccess.com». Ikke en hemmelighet, men settes i dashbordet (Worker → Settings → Variables and Secrets), ikke i repoet. */
  ACCESS_TEAM_DOMAIN?: string;
  /** Application Audience (AUD) Tag for Access-appen. Flere kan skilles med komma (én app for /kunde/sigdal og én for /hjelp). */
  ACCESS_AUD?: string;
}

export type AccessSvar = { ok: true; epost: string } | { ok: false; grunn: string };

interface Jwk extends JsonWebKey { kid?: string }
interface Krav { iss?: string; aud?: string | string[]; exp?: number; nbf?: number; email?: string }

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
const json = (s: string) => JSON.parse(dec.decode(b64url(s)));

let cache: { team: string; til: number; nokler: Jwk[] } = { team: "", til: 0, nokler: [] };

/** Nøklene til teamet, hentet fra Cloudflare og husket i 10 minutter i denne isolaten. */
async function nokler(team: string, hent: typeof fetch): Promise<Jwk[]> {
  const na = Date.now();
  if (cache.team === team && cache.til > na) return cache.nokler;
  const r = await hent(`https://${team}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`certs ${r.status}`);
  const { keys } = (await r.json()) as { keys?: Jwk[] };
  if (!Array.isArray(keys) || !keys.length) throw new Error("ingen nøkler");
  cache = { team, til: na + 10 * 60 * 1000, nokler: keys };
  return keys;
}

export function nullstillBuffer(): void {
  cache = { team: "", til: 0, nokler: [] };
}

/** Leser Access-oppsettet fra miljøet. Tomt svar = Access er ikke koblet til (Workeren skal da låse siden). */
export function accessOppsett(env: AccessEnv): { team: string; aud: string[] } | null {
  const team = (env.ACCESS_TEAM_DOMAIN ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const aud = (env.ACCESS_AUD ?? "").split(",").map((a) => a.trim()).filter(Boolean);
  return team && aud.length ? { team, aud } : null;
}

export async function sjekkAccess(
  token: string | null,
  konfig: { team: string; aud: string[] },
  valg: { hent?: typeof fetch; na?: number } = {},
): Promise<AccessSvar> {
  if (!token) return { ok: false, grunn: "mangler token" };
  const deler = token.split(".");
  if (deler.length !== 3) return { ok: false, grunn: "ugyldig token" };
  try {
    const hode = json(deler[0]) as { alg?: string; kid?: string };
    const krav = json(deler[1]) as Krav;
    if (hode.alg !== "RS256") return { ok: false, grunn: "feil algoritme" };
    const jwk = (await nokler(konfig.team, valg.hent ?? fetch)).find((k) => k.kid === hode.kid);
    if (!jwk) return { ok: false, grunn: "ukjent nøkkel" };
    const nokkel = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const gyldig = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", nokkel, b64url(deler[2]), enc.encode(`${deler[0]}.${deler[1]}`));
    if (!gyldig) return { ok: false, grunn: "feil signatur" };
    const na = Math.floor((valg.na ?? Date.now()) / 1000);
    if (krav.iss !== `https://${konfig.team}`) return { ok: false, grunn: "feil utsteder" };
    const aud = Array.isArray(krav.aud) ? krav.aud : [krav.aud];
    if (!konfig.aud.length || !aud.some((a) => typeof a === "string" && konfig.aud.includes(a))) return { ok: false, grunn: "feil Access-app" };
    if (typeof krav.exp !== "number" || krav.exp <= na) return { ok: false, grunn: "utløpt" };
    if (typeof krav.nbf === "number" && krav.nbf > na + 60) return { ok: false, grunn: "ikke gyldig ennå" };
    if (typeof krav.email !== "string" || !krav.email) return { ok: false, grunn: "mangler e-post" };
    return { ok: true, epost: krav.email.toLowerCase() };
  } catch {
    return { ok: false, grunn: "kunne ikke sjekkes" };
  }
}

const MERKER = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "private, no-store" } as const;
/** Samme sikkerhetshoder som public/_headers, siden svar fra Workeren selv ikke går gjennom _headers. */
const SIKKERHET = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
} as const;

export function avvis(status: number, tekst: string, ekstra: Record<string, string> = {}): Response {
  return new Response(`${tekst}\n`, { status, headers: { "Content-Type": "text/plain; charset=utf-8", ...SIKKERHET, ...MERKER, ...ekstra } });
}

/**
 * Vakten for en beskyttet sti. Gir et avvisningssvar, eller null når forespørselen har gyldig Access-token.
 * - Mangler Cf-Access-Jwt-Assertion eller tokenet er ugyldig: 403.
 * - Mangler ACCESS_TEAM_DOMAIN eller ACCESS_AUD: 403 også med token (ikke åpent, og ikke noe sted å sjekke tokenet mot). Gjelder alle beskyttede stier (/hjelp og /kunde/sigdal).
 * - Annen metode enn GET og HEAD: 405.
 */
export async function vakt(req: Request, env: AccessEnv, valg: { hent?: typeof fetch; na?: number } = {}): Promise<Response | null> {
  const token = req.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return avvis(403, "Ingen tilgang. Siden krever innlogging via Cloudflare Access.");
  const oppsett = accessOppsett(env);
  if (!oppsett) return avvis(403, "Ingen tilgang. Siden krever innlogging via Cloudflare Access.");
  const sjekk = await sjekkAccess(token, oppsett, valg);
  if (!sjekk.ok) return avvis(403, "Ingen tilgang. Siden krever innlogging via Cloudflare Access.");
  if (req.method !== "GET" && req.method !== "HEAD") return avvis(405, "Metoden er ikke tillatt.", { Allow: "GET, HEAD" });
  return null;
}

/** Legger noindex og Cache-Control private, no-store på et svar fra de statiske filene. */
export function merkBeskyttet(svar: Response): Response {
  const ny = new Response(svar.body, svar);
  for (const [navn, verdi] of Object.entries(MERKER)) ny.headers.set(navn, verdi);
  ny.headers.delete("ETag");
  ny.headers.append("Vary", "Cf-Access-Jwt-Assertion");
  return ny;
}
