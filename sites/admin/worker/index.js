/**
 * Worker-skriptet for admin.hengsel.no (K-184). Kjører for ALLE forespørsler (assets.run_worker_first = true).
 *
 * - Mangler ACCESS_TEAM_DOMAIN eller ACCESS_AUD: 503, ingenting vises (Access er ikke koblet til).
 * - Mangler Cf-Access-Jwt-Assertion eller tokenet er ugyldig: 401.
 * - Gyldig token, men e-postadressen står ikke i worker/tilgang.js, eller stien er utenfor rollen: 403.
 * - Ellers serveres de statiske filene, med Cache-Control: private, no-store og X-Robots-Tag: noindex.
 * Alle svar får noindex. Ingen innlogging, informasjonskapsler eller hemmeligheter i denne koden.
 */
import { sjekkAccess } from "./access.js";
import { rolleFor, kanSe } from "./tilgang.js";

const MERKE = { "X-Robots-Tag": "noindex, nofollow, noarchive", "Cache-Control": "private, no-store" };

function avvis(status, tekst) {
  return new Response(`${tekst}\n`, { status, headers: { "Content-Type": "text/plain; charset=utf-8", ...MERKE } });
}

export default {
  async fetch(req, env) {
    const team = (env.ACCESS_TEAM_DOMAIN ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const aud = (env.ACCESS_AUD ?? "").trim();
    if (!team || !aud) return avvis(503, "Siden er låst. Cloudflare Access er ikke koblet til ennå.");
    if (req.method !== "GET" && req.method !== "HEAD") return avvis(405, "Metoden er ikke tillatt.");

    const sjekk = await sjekkAccess(req.headers.get("Cf-Access-Jwt-Assertion"), { team, aud });
    if (!sjekk.ok) return avvis(401, "Ikke innlogget via Cloudflare Access.");

    const rolle = rolleFor(sjekk.epost);
    const sti = new URL(req.url).pathname;
    if (!kanSe(rolle, sti)) return avvis(403, "Ingen tilgang.");

    const svar = await env.ASSETS.fetch(req);
    const hoder = new Headers(svar.headers);
    for (const [k, v] of Object.entries(MERKE)) hoder.set(k, v);
    // Immutable hash-filer under /_astro og /fonts beholder sin lange (private) cache fra _headers
    if (/^\/(?:_astro|fonts)\//.test(sti) && svar.headers.get("Cache-Control")) hoder.set("Cache-Control", svar.headers.get("Cache-Control"));
    return new Response(svar.body, { status: svar.status, statusText: svar.statusText, headers: hoder });
  },
};
