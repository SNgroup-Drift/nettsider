/**
 * hengsel.no/sigdal og alt under (K-223): kundeutgaven for Sigdal bak Cloudflare Access. Koden lager ingen egen innlogging.
 * Access-sjekken er den delte i worker/access.ts (samme som /hjelp, K-226): signatur, utsteder, Access-app (aud), utløp og e-post kontrolleres mot
 * ACCESS_TEAM_DOMAIN og ACCESS_AUD. Uten gyldig Cf-Access-Jwt-Assertion, eller når variablene mangler, svarer alle stier under /sigdal 403.
 * Ingen testmodus og ingen omgåelse.
 *
 * - Alle svar: X-Robots-Tag noindex, nofollow og Cache-Control private, no-store (også 403).
 * - /sigdal/apptest: innholdet fra /apptest uten eget passord (Access er innloggingen). Innloggede får demopassordet satt inn som på /apptest.
 *   PDF-en med demobrukerne er kopiert til /sigdal/apptest/ ved bygging (scripts/bygg-sigdal-vis.mjs).
 * - /sigdal/vis/*: Visningsrommet i Sigdal-utgave. Rommene har inline stil, så HTML-sidene får en egen CSP (som vis.hengsel.no).
 */
import { merkBeskyttet, vakt, type AccessEnv } from "./access.ts";
import { SIKKERHET, medDemopassord } from "./apptest.ts";

export type SigdalEnv = AccessEnv & {
  ASSETS: { fetch(req: Request | string | URL, init?: RequestInit): Promise<Response> };
  DEMO_PASSORD?: string;
};

export const ER_SIGDAL = (sti: string) => sti === "/sigdal" || sti.startsWith("/sigdal/");

/** Samme CSP som vis.hengsel.no (sites/vis/src/_headers): rommene bruker inline stil, men ingen inline-skript. */
const VIS_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

export async function handterSigdal(req: Request, env: SigdalEnv, valg: { hent?: typeof fetch; na?: number } = {}): Promise<Response> {
  const avvist = await vakt(req, env, valg);
  if (avvist) return avvist;
  const { pathname } = new URL(req.url);
  const svar = await env.ASSETS.fetch(req);
  const ny = merkBeskyttet(pathname === "/sigdal/apptest" ? medDemopassord(svar, env.DEMO_PASSORD) : svar);
  for (const [navn, verdi] of Object.entries(SIKKERHET)) if (!ny.headers.has(navn)) ny.headers.set(navn, verdi);
  if (pathname.startsWith("/sigdal/vis/") && (ny.headers.get("Content-Type") ?? "").startsWith("text/html")) ny.headers.set("Content-Security-Policy", VIS_CSP);
  return ny;
}
