/**
 * Inngangen til Workeren for hengsel.no (wrangler.jsonc: main). Bare disse stiene går gjennom kode (assets.run_worker_first):
 * /api/demo (demoskjemaet, worker/demo.ts), /apptest og alt under (passordet, worker/apptest.ts), /hjelp og alt under (brukerveiledningen,
 * worker/hjelp.ts, K-226) og /sigdal og alt under (kundeutgaven for Sigdal, worker/sigdal.ts, K-223). /hjelp og /sigdal står bak Cloudflare Access
 * og bruker samme sjekk (worker/access.ts). Resten er statiske filer.
 */
import apptest from "./apptest";
import { handterDemo, type DemoEnv } from "./demo";
import { erHjelp, handterHjelp, type HjelpEnv } from "./hjelp";
import { ER_SIGDAL, handterSigdal, type SigdalEnv } from "./sigdal";

type Env = Parameters<typeof apptest.fetch>[1] & DemoEnv & HjelpEnv & SigdalEnv;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (erHjelp(pathname)) return handterHjelp(req, env);
    if (pathname === "/api/demo") return merkDemo(await handterDemo(req, env));
    if (ER_SIGDAL(pathname)) return handterSigdal(req, env);
    return apptest.fetch(req, env);
  },
};

/** Samme sikkerhetshoder som public/_headers, siden svar fra Workeren selv ikke går gjennom _headers. */
function merkDemo(svar: Response): Response {
  const ny = new Response(svar.body, svar);
  ny.headers.set("Strict-Transport-Security", "max-age=31536000");
  ny.headers.set("X-Frame-Options", "DENY");
  ny.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  ny.headers.set("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  return ny;
}
