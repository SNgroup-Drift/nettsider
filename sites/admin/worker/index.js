/**
 * Worker-skriptet for admin.hengsel.no (K-184, K-240). Kjører for ALLE forespørsler (assets.run_worker_first = true).
 *
 * - /api/lead (POST fra hengsel.no), /api/hjelp («Hjelp» fra Hengsel CRM og Ute, K-259) og /api/oppstart/rapport (GitHub Action «Ny kunde», K-272):
 *   unntatt Access, eget vern i worker/lead.js, worker/hjelp.js og worker/ny-kunde-rapport.js. Alt annet:
 * - Mangler ACCESS_TEAM_DOMAIN eller ACCESS_AUD: 503, ingenting vises (Access er ikke koblet til).
 * - Mangler Cf-Access-Jwt-Assertion eller tokenet er ugyldig: 401 (ADM-401).
 * - Gyldig token, men e-postadressen står ikke i worker/tilgang.js (eller som aktiv supportperson i D1), eller stien er utenfor rollen: 403
 *   (ADM-403). Rollen support får siden «Ingen tilgang» (60-207) med status 403 når den åpner en side utenfor Support.
 * - /api/*: JSON-API-et i worker/api.js mot D1 (binding DB). POST/PATCH/PUT/DELETE bare for rollen eier (ADM-403 ellers).
 * - /salg/tilbud/:nr/:versjon.pdf: tilbudet som PDF fra databasen.
 * - Sider med id i adressen (/salg/eiere/:id, /kunder/:id, /avtaler/:nr) serveres fra én statisk fil (worker/ruter.js).
 * - Ellers serveres de statiske filene, med Cache-Control: private, no-store og X-Robots-Tag: noindex.
 * Alle svar får noindex. Ingen innlogging, informasjonskapsler eller hemmeligheter i denne koden.
 */
import { sjekkAccess } from "./access.js";
import { rolleFor, kanSe, kanSkrive, supportFraDb } from "./tilgang.js";
import { handterApi, tilbudPdf } from "./api.js";
import { handterLead } from "./lead.js";
import { handterHjelp } from "./hjelp.js";
import { handterRapport } from "./ny-kunde-rapport.js";
import { SKJERMBILDE, skjermbilde } from "./api-support.js";
import { stiTilFil, TILBUD_PDF } from "./ruter.js";
import { json } from "./db.js";

const MERKE = { "X-Robots-Tag": "noindex, nofollow, noarchive", "Cache-Control": "private, no-store" };
const LOGO = "/logo/logo-hengsel-lys.svg";

function avvis(status, tekst) {
  return new Response(`${tekst}\n`, { status, headers: { "Content-Type": "text/plain; charset=utf-8", ...MERKE } });
}
function merk(svar) {
  const ny = new Response(svar.body, svar);
  for (const [k, v] of Object.entries(MERKE)) ny.headers.set(k, v);
  ny.headers.set("X-Content-Type-Options", "nosniff");
  ny.headers.set("X-Frame-Options", "DENY");
  ny.headers.set("Referrer-Policy", "no-referrer");
  return ny;
}

/** Hengsel-logoen (pinnet SVG i public/logo) til PDF-en, uten metadata */
async function hentLogo(env, origin) {
  try {
    const r = await env.ASSETS.fetch(new Request(`${origin}${LOGO}`));
    if (!r.ok) return null;
    return (await r.text()).replace(/<metadata>[\s\S]*?<\/metadata>/, "");
  } catch { return null; }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const sti = url.pathname;
    const erApi = sti === "/api" || sti.startsWith("/api/");

    // Lead fra «Be om demo»: eget vern, uten Access (hengsel.no kaller server til server)
    if (sti === "/api/lead") return merk(await handterLead(req, env));
    if (sti === "/api/hjelp") return merk(await handterHjelp(req, env));
    // Rapporter fra GitHub Action «Ny kunde» (K-272): signert, eget vern i worker/ny-kunde-rapport.js
    if (sti === "/api/oppstart/rapport") return merk(await handterRapport(req, env));

    const team = (env.ACCESS_TEAM_DOMAIN ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const aud = (env.ACCESS_AUD ?? "").trim();
    if (!team || !aud) return erApi ? merk(json(503, { ok: false, kode: "ADM-503", melding: "Cloudflare Access er ikke koblet til." })) : avvis(503, "Siden er låst. Cloudflare Access er ikke koblet til ennå.");

    const sjekk = await sjekkAccess(req.headers.get("Cf-Access-Jwt-Assertion"), { team, aud });
    if (!sjekk.ok) return erApi ? merk(json(401, { ok: false, kode: "ADM-401", melding: "Ikke innlogget." })) : avvis(401, "Ikke innlogget via Cloudflare Access.");

    const rolle = rolleFor(sjekk.epost) ?? (await supportFraDb(env.DB, sjekk.epost));
    if (!kanSe(rolle, sti)) {
      if (erApi) return merk(json(403, { ok: false, kode: "ADM-403", melding: "Ingen tilgang." }));
      if (rolle?.rolle === "support" && (req.method === "GET" || req.method === "HEAD")) {
        const side = await env.ASSETS.fetch(new Request(`${url.origin}/ingen-tilgang`, { method: req.method, headers: req.headers }));
        return merk(new Response(side.body, { status: 403, headers: side.headers }));
      }
      return avvis(403, "Ingen tilgang.");
    }

    if (erApi) {
      const leser = req.method === "GET" || req.method === "HEAD";
      if (!leser && !kanSkrive(rolle, sti)) return merk(json(403, { ok: false, kode: "ADM-403", melding: rolle?.rolle === "support" ? "Ingen tilgang." : "Bare eier kan endre." }));
      const bilde = SKJERMBILDE.exec(sti);
      if (bilde && leser) return merk(await skjermbilde(env, bilde[1]));
      const bruker = { epost: sjekk.epost, navn: rolle.navn ?? sjekk.epost, rolle: rolle.rolle ?? "leser" };
      return merk(await handterApi(req, env, { bruker, hentLogo: () => hentLogo(env, url.origin) }));
    }
    if (req.method !== "GET" && req.method !== "HEAD") return avvis(405, "Metoden er ikke tillatt.");

    const pdf = TILBUD_PDF.exec(sti);
    if (pdf) return merk(await tilbudPdf(env, pdf[1], Number(pdf[2]), { hentLogo: () => hentLogo(env, url.origin) }));

    const fil = stiTilFil(sti);
    const svar = await env.ASSETS.fetch(fil === sti ? req : new Request(`${url.origin}${fil}`, { method: req.method, headers: req.headers }));
    const hoder = new Headers(svar.headers);
    for (const [k, v] of Object.entries(MERKE)) hoder.set(k, v);
    // Immutable hash-filer under /_astro og /fonts beholder sin lange (private) cache fra _headers
    if (/^\/(?:_astro|fonts)\//.test(sti) && svar.headers.get("Cache-Control")) hoder.set("Cache-Control", svar.headers.get("Cache-Control"));
    return new Response(svar.body, { status: svar.status, statusText: svar.statusText, headers: hoder });
  },
};
