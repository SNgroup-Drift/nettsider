/**
 * Inngangen til Workeren for hengsel.no (wrangler.jsonc: main). Bare disse stiene går gjennom kode (assets.run_worker_first):
 * /kunde og alt under (kundeområdet bak Cloudflare Access: hjelp, apptest, dokumenter og kundens egen utgave, worker/kunde.ts, K-229),
 * /api/demo (demoskjemaet, worker/demo.ts) og /apptest og alt under (passordet, worker/apptest.ts, K-107). Resten er statiske filer; gamle adresser
 * (/hjelp, /dokumenter, /sigdal) videresendes av public/_redirects.
 *
 * /apptest: passordet gjelder til Access står foran /kunde. Da settes variabelen APPTEST_VIDERE til «1» (vanlig variabel, ikke hemmelighet), og
 * /apptest og alt under videresendes med 301 til /kunde/apptest. Slik står ingen testere uten tilgang mens Access settes opp.
 */
import apptest from "./apptest";
import { handterDemo, type DemoEnv } from "./demo";
import { ER_KUNDE, handterKunde, type KundeEnv } from "./kunde";

type Env = Parameters<typeof apptest.fetch>[1] & DemoEnv & KundeEnv & { APPTEST_VIDERE?: string };

const ER_APPTEST = (sti: string) => sti === "/apptest" || sti.startsWith("/apptest/");

/** /apptest → /kunde/apptest, /apptest/<fil> → /kunde/apptest/<fil>; passordsiden finnes ikke i kundeområdet */
export function apptestTilKunde(sti: string): string {
  if (sti === "/apptest/passord" || sti === "/apptest/passord.html") return "/kunde/apptest";
  return `/kunde${sti}`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname, search } = new URL(req.url);
    if (ER_KUNDE(pathname)) return handterKunde(req, env);
    if (pathname === "/api/demo") return merkDemo(await handterDemo(req, env));
    if (ER_APPTEST(pathname) && env.APPTEST_VIDERE === "1") {
      return new Response(null, { status: 301, headers: { Location: apptestTilKunde(pathname) + search, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
    }
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
