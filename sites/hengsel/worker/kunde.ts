/**
 * hengsel.no/kunde og alt under (K-229): kundeområdet bak én Cloudflare Access-innlogging (e-postkode). Koden lager ingen egen innlogging.
 * Det samler det som før lå på hver sin adresse: /kunde/hjelp (K-226), /kunde/apptest, /kunde/dokumenter og kundens egen utgave, /kunde/sigdal (K-223).
 * Access-sjekken er den delte i worker/access.ts: signatur, utsteder, Access-app (aud), utløp og e-post kontrolleres mot ACCESS_TEAM_DOMAIN og
 * ACCESS_AUD. Uten gyldig Cf-Access-Jwt-Assertion, eller når variablene mangler, svarer alle stier under /kunde 403. Ingen testmodus og ingen omgåelse.
 *
 * - Alle svar: X-Robots-Tag noindex, nofollow og Cache-Control private, no-store (også 403).
 * - /kunde/apptest og /kunde/sigdal/apptest: innholdet fra /apptest uten eget passord (Access er innloggingen). Innloggede får demopassordet satt inn som på /apptest.
 *   PDF-en med demobrukerne er kopiert til begge ved bygging (scripts/bygg-sigdal-vis.mjs).
 * - /kunde/sigdal/vis/*: Visningsrommet i Sigdal-utgave. Rommene har inline stil, så HTML-sidene får en egen CSP (som vis.hengsel.no).
 * Gamle adresser (/hjelp, /dokumenter, /sigdal og under) videresendes med 301 av public/_redirects, før noe kode kjører og uten å vise innhold.
 */
import { merkBeskyttet, vakt, type AccessEnv } from "./access.ts";
import { SIKKERHET, medDemopassord } from "./apptest.ts";

export type KundeEnv = AccessEnv & {
  ASSETS: { fetch(req: Request | string | URL, init?: RequestInit): Promise<Response> };
  DEMO_PASSORD?: string;
};

export const ER_KUNDE = (sti: string) => sti === "/kunde" || sti.startsWith("/kunde/");

/** Sidene som viser demopassordet (bare for innloggede) */
const MED_DEMOPASSORD = new Set(["/kunde/apptest", "/kunde/sigdal/apptest"]);

/** Samme CSP som vis.hengsel.no (sites/vis/src/_headers): rommene bruker inline stil, men ingen inline-skript; skjermbildene kommer fra bilder.hengsel.no (K-233). */
const VIS_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https://bilder.hengsel.no; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

export async function handterKunde(req: Request, env: KundeEnv, valg: { hent?: typeof fetch; na?: number } = {}): Promise<Response> {
  const avvist = await vakt(req, env, valg);
  if (avvist) return avvist;
  const { pathname } = new URL(req.url);
  const svar = await env.ASSETS.fetch(req);
  const ny = merkBeskyttet(MED_DEMOPASSORD.has(pathname.replace(/\/$/, "")) ? medDemopassord(svar, env.DEMO_PASSORD) : svar);
  for (const [navn, verdi] of Object.entries(SIKKERHET)) if (!ny.headers.has(navn)) ny.headers.set(navn, verdi);
  if (pathname.startsWith("/kunde/sigdal/vis/") && (ny.headers.get("Content-Type") ?? "").startsWith("text/html")) ny.headers.set("Content-Security-Policy", VIS_CSP);
  return ny;
}
