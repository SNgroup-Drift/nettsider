/**
 * hengsel.no/sigdal og alt under (K-223): kundeutgaven for Sigdal. Cloudflare Access står foran /sigdal* og slipper bare inviterte inn
 * (settes opp i Zero Trust, se claude/k223-rapport.md). Koden her lager ingen egen innlogging. Den sørger for at siden aldri er åpen hvis
 * Access mangler: uten Cf-Access-Jwt-Assertion-headeren, som Access legger på forespørsler det har sluppet inn, svarer Workeren 403.
 *
 * - Alle svar: X-Robots-Tag noindex, nofollow og Cache-Control private, no-store.
 * - Testmodus: SIGDAL_TESTMODUS=1 (bare `wrangler dev --var SIGDAL_TESTMODUS:1`, aldri i wrangler.jsonc) slipper forespørsler uten header inn,
 *   og bare når adressen er localhost eller 127.0.0.1. På hengsel.no virker den ikke selv om variabelen skulle bli satt.
 * - /sigdal/apptest: innholdet fra /apptest uten eget passord (Access er innloggingen). Innloggede får demopassordet satt inn som på /apptest.
 *   PDF-en med demobrukerne er kopiert til /sigdal/apptest/ ved bygging (scripts/bygg-sigdal-vis.mjs).
 * - /sigdal/vis/*: Visningsrommet i Sigdal-utgave. Rommene har inline stil, så de får en egen CSP (som vis.hengsel.no).
 * Header-sjekken er et sikkerhetsnett, ikke autentisering: den kontrollerer ikke signaturen i JWT-en. Se rapporten.
 */
import { SIKKERHET, medDemopassord } from "./apptest";

export interface SigdalEnv {
  ASSETS: { fetch(req: Request | string | URL, init?: RequestInit): Promise<Response> };
  DEMO_PASSORD?: string;
  /** Bare lokalt: slipper inn uten Access-header (se over) */
  SIGDAL_TESTMODUS?: string;
}

export const ER_SIGDAL = (sti: string) => sti === "/sigdal" || sti.startsWith("/sigdal/");

/** Samme CSP som vis.hengsel.no (sites/vis/src/_headers): rommene bruker inline stil, men ingen inline-skript. */
const VIS_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

export function harAccess(req: Request, env: SigdalEnv): boolean {
  if (req.headers.get("Cf-Access-Jwt-Assertion")) return true;
  const { hostname } = new URL(req.url);
  return env.SIGDAL_TESTMODUS === "1" && (hostname === "localhost" || hostname === "127.0.0.1");
}

export async function handterSigdal(req: Request, env: SigdalEnv): Promise<Response> {
  const url = new URL(req.url);
  if (!harAccess(req, env)) {
    return merk(new Response("Ingen tilgang. Siden krever innlogging via Cloudflare Access.\n", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }), url);
  }
  const metode = req.method.toUpperCase();
  if (metode !== "GET" && metode !== "HEAD") {
    return merk(new Response("Metoden er ikke tillatt.\n", { status: 405, headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" } }), url);
  }
  const svar = await env.ASSETS.fetch(req);
  return merk(url.pathname === "/sigdal/apptest" ? medDemopassord(svar, env.DEMO_PASSORD) : svar, url);
}

/** Felles hoder på alle svar fra /sigdal */
function merk(svar: Response, url: URL): Response {
  const ny = new Response(svar.body, svar);
  for (const [navn, verdi] of Object.entries(SIKKERHET)) if (!ny.headers.has(navn)) ny.headers.set(navn, verdi);
  if (!svar.body || (svar.headers.get("Content-Type") ?? "").startsWith("text/plain")) {
    if (!ny.headers.has("Content-Security-Policy")) ny.headers.set("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  }
  if (url.pathname.startsWith("/sigdal/vis/") && (ny.headers.get("Content-Type") ?? "").startsWith("text/html")) ny.headers.set("Content-Security-Policy", VIS_CSP);
  ny.headers.set("X-Robots-Tag", "noindex, nofollow");
  ny.headers.set("Cache-Control", "private, no-store");
  ny.headers.delete("ETag");
  ny.headers.append("Vary", "Cf-Access-Jwt-Assertion");
  return ny;
}
