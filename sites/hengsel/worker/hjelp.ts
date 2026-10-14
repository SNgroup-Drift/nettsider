/**
 * Worker-delen for hengsel.no/hjelp (K-226): brukerveiledningen bak Cloudflare Access (e-postkode, samme opplegg som /sigdal, K-223).
 * Kjører for /hjelp, /hjelp/* og /hjelp.html (assets.run_worker_first i wrangler.jsonc). Resten av hengsel.no er statiske filer uten kode.
 * Sjekken ligger i worker/access.ts, delt med /sigdal. Uten gyldig Cf-Access-Jwt-Assertion svarer /hjelp og alt under 403.
 */
import { merkBeskyttet, vakt, type AccessEnv } from "./access.ts";

export type HjelpEnv = AccessEnv & { ASSETS: { fetch(req: Request | string | URL, init?: RequestInit): Promise<Response> } };

export const erHjelp = (sti: string): boolean => sti === "/hjelp" || sti === "/hjelp.html" || sti.startsWith("/hjelp/");

export async function handterHjelp(req: Request, env: HjelpEnv, valg: { hent?: typeof fetch; na?: number } = {}): Promise<Response> {
  const avvist = await vakt(req, env, valg);
  if (avvist) return avvist;
  return merkBeskyttet(await env.ASSETS.fetch(req));
}
