/**
 * Sjekk av Cloudflare Access-tokenet (header Cf-Access-Jwt-Assertion). K-184.
 *
 * Tokenet er en JWT signert med RS256 av teamets nøkler (https://<team>.cloudflareaccess.com/cdn-cgi/access/certs).
 * Vi sjekker signatur, utsteder (iss), målgruppe (aud = Access-appen), utløp (exp), tidligst-gyldig (nbf) og at e-postadressen finnes.
 * Alt som mangler eller ikke stemmer, avvises. Ingen unntak for «lokal utvikling»: uten gyldig token vises ingenting.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
function json(s) {
  return JSON.parse(dec.decode(b64url(s)));
}

let cache = { team: "", til: 0, nokler: /** @type {any[]} */ ([]) };

/** Nøklene til teamet, hentet fra Cloudflare og husket i 10 minutter i denne isolaten. */
async function nokler(team, hent = fetch) {
  const na = Date.now();
  if (cache.team === team && cache.til > na) return cache.nokler;
  const r = await hent(`https://${team}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`certs ${r.status}`);
  const { keys } = await r.json();
  if (!Array.isArray(keys) || !keys.length) throw new Error("ingen nøkler");
  cache = { team, til: na + 10 * 60 * 1000, nokler: keys };
  return keys;
}

export function nullstillBuffer() {
  cache = { team: "", til: 0, nokler: [] };
}

/**
 * @param {string | null} token
 * @param {{ team: string, aud: string }} konfig  team = «<navn>.cloudflareaccess.com», aud = Application Audience (AUD) Tag
 * @param {{ hent?: typeof fetch, na?: number }} [valg]
 * @returns {Promise<{ ok: true, epost: string } | { ok: false, grunn: string }>}
 */
export async function sjekkAccess(token, konfig, valg = {}) {
  if (!token) return { ok: false, grunn: "mangler token" };
  const deler = token.split(".");
  if (deler.length !== 3) return { ok: false, grunn: "ugyldig token" };
  try {
    const hode = json(deler[0]);
    const krav = json(deler[1]);
    if (hode.alg !== "RS256") return { ok: false, grunn: "feil algoritme" };
    const jwk = (await nokler(konfig.team, valg.hent)).find((k) => k.kid === hode.kid);
    if (!jwk) return { ok: false, grunn: "ukjent nøkkel" };
    const nokkel = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const gyldig = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", nokkel, b64url(deler[2]), enc.encode(`${deler[0]}.${deler[1]}`));
    if (!gyldig) return { ok: false, grunn: "feil signatur" };
    const na = Math.floor((valg.na ?? Date.now()) / 1000);
    if (krav.iss !== `https://${konfig.team}`) return { ok: false, grunn: "feil utsteder" };
    const aud = Array.isArray(krav.aud) ? krav.aud : [krav.aud];
    if (!konfig.aud || !aud.includes(konfig.aud)) return { ok: false, grunn: "feil Access-app" };
    if (typeof krav.exp !== "number" || krav.exp <= na) return { ok: false, grunn: "utløpt" };
    if (typeof krav.nbf === "number" && krav.nbf > na + 60) return { ok: false, grunn: "ikke gyldig ennå" };
    if (typeof krav.email !== "string" || !krav.email) return { ok: false, grunn: "mangler e-post" };
    return { ok: true, epost: krav.email.toLowerCase() };
  } catch {
    return { ok: false, grunn: "kunne ikke sjekkes" };
  }
}
