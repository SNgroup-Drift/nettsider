/**
 * Worker-skriptet for hengsel.no (K-107). Kjører BARE for /apptest og alt under (assets.run_worker_first i
 * wrangler.jsonc). Resten av hengsel.no serveres som statiske filer uten kode.
 *
 * - Uten gyldig informasjonskapsel: passordsiden (dist/apptest/passord.html), 200 for /apptest.
 * - POST /apptest med riktig passord: 303 til /apptest og informasjonskapsel med HMAC-signatur. Feil passord: 401.
 * - Mangler hemmelighetene APPTEST_PASSORD eller APPTEST_NOKKEL: 503, siden er låst.
 * - Innloggede får demopassordet (hemmeligheten DEMO_PASSORD) satt inn i /apptest (K-114). Mangler den, står siden uten.
 * - Signaturnøkkelen avhenger av både APPTEST_NOKKEL og APPTEST_PASSORD, så et nytt passord gjør gamle
 *   informasjonskapsler ugyldige.
 * - Alle svar får X-Robots-Tag: noindex, nofollow og Cache-Control: private, no-store.
 */

interface Env {
  ASSETS: { fetch(req: Request | string | URL, init?: RequestInit): Promise<Response> };
  APPTEST_PASSORD?: string;
  APPTEST_NOKKEL?: string;
  /** K-114: felles passord for demobrukerne. Settes inn på /apptest for innloggede. Hemmelighet, aldri i repoet. */
  DEMO_PASSORD?: string;
}

const KAKE = "hengsel_apptest";
const VARIGHET = 30 * 24 * 60 * 60; // 30 dager i sekunder
const MAKS_SKJEMA = 4096; // byte

const enc = new TextEncoder();

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    // Bare /apptest og /apptest/* skal hit (run_worker_first). Alt annet sendes rett videre til de statiske filene.
    if (url.pathname !== "/apptest" && !url.pathname.startsWith("/apptest/")) return env.ASSETS.fetch(req);
    return merk(await apptest(req, env, url));
  },
};

async function apptest(req: Request, env: Env, url: URL): Promise<Response> {
  if (!env.APPTEST_PASSORD || !env.APPTEST_NOKKEL) {
    return new Response("Siden er låst. Passordet er ikke satt opp ennå.\n", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const nokkel = await signaturnokkel(env.APPTEST_NOKKEL, env.APPTEST_PASSORD);
  const metode = req.method.toUpperCase();

  if (metode === "POST") {
    if (url.pathname !== "/apptest") return tekst(405, "Metoden er ikke tillatt.", { Allow: "GET, HEAD" });
    const passord = await lesPassord(req);
    if (passord !== null && (await likePassord(passord, env.APPTEST_PASSORD))) {
      const utloper = Math.floor(Date.now() / 1000) + VARIGHET;
      const verdi = `${utloper}.${await signer(nokkel, utloper)}`;
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/apptest",
          "Set-Cookie": `${KAKE}=${verdi}; Max-Age=${VARIGHET}; Path=/apptest; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return passordside(req, env, 401, true);
  }

  if (metode !== "GET" && metode !== "HEAD") return tekst(405, "Metoden er ikke tillatt.", { Allow: "GET, HEAD, POST" });

  if (!(await gyldigKake(req, nokkel))) {
    return passordside(req, env, url.pathname === "/apptest" ? 200 : 401, false);
  }
  // Passordsiden selv er bare for Workeren; innlogget sendes man til siden.
  if (url.pathname === "/apptest/passord" || url.pathname === "/apptest/passord.html") {
    return new Response(null, { status: 303, headers: { Location: "/apptest" } });
  }
  return medDemopassord(await env.ASSETS.fetch(req), env.DEMO_PASSORD);
}

/**
 * K-114: demopassordet settes inn i HTML-en for innloggede (bare bak passordet til /apptest). Hver rolle har sin egen
 * <span data-demopassord="{rolle}"> (alle viser det samme felles passordet) og en «Kopier»-knapp med [data-demopassord-knapp].
 * Uten hemmeligheten står spanen med «••••••••», knappene er skjult og «Passordet får du av den som inviterte deg» vises.
 * Passordet er aldri i de statiske filene.
 */
function medDemopassord(svar: Response, passord: string | undefined): Response {
  if (!passord || !(svar.headers.get("Content-Type") ?? "").startsWith("text/html")) return svar;
  return new HTMLRewriter()
    .on("[data-demopassord]", { element: (el) => el.setInnerContent(passord) })
    .on("[data-demopassord-knapp]", { element: (el) => el.removeAttribute("hidden") })
    .on("[data-uten-demopassord]", { element: (el) => el.remove() })
    .transform(svar);
}

/** Passordsiden fra de statiske filene. Ved feil passord vises feilmeldingen og feltet merkes som ugyldig. */
async function passordside(req: Request, env: Env, status: number, feil: boolean): Promise<Response> {
  const side = await env.ASSETS.fetch(new Request(new URL("/apptest/passord", req.url), { method: "GET" }));
  let svar = new Response(side.body, { status, headers: side.headers });
  if (feil) {
    svar = new HTMLRewriter()
      .on("[data-feil]", { element: (el) => el.removeAttribute("hidden") })
      .on("#passord", { element: (el) => el.setAttribute("aria-invalid", "true") })
      .transform(svar);
  }
  if (req.method.toUpperCase() === "HEAD") return new Response(null, { status, headers: svar.headers });
  return svar;
}

/** Samme hoder som public/_headers. Svar som Workeren lager selv (303, 405, 503) får dem herfra. */
const SIKKERHET: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

/**
 * Felles hoder på alle svar fra /apptest. Sikkerhetshodene fra _headers (med CSP-hashene) følger med svarene fra ASSETS;
 * de som mangler, legges til her. Workerens egne svar (303, tekst) får en streng CSP uten noen kilder.
 */
function merk(svar: Response): Response {
  const ny = new Response(svar.body, svar);
  for (const [navn, verdi] of Object.entries(SIKKERHET)) if (!ny.headers.has(navn)) ny.headers.set(navn, verdi);
  const egetSvar = !svar.body || (svar.headers.get("Content-Type") ?? "").startsWith("text/plain");
  if (egetSvar && !ny.headers.has("Content-Security-Policy")) {
    ny.headers.set("Content-Security-Policy", "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  }
  ny.headers.set("X-Robots-Tag", "noindex, nofollow");
  ny.headers.set("Cache-Control", "private, no-store");
  ny.headers.delete("ETag");
  ny.headers.append("Vary", "Cookie");
  return ny;
}

function tekst(status: number, melding: string, hoder: Record<string, string> = {}): Response {
  return new Response(`${melding}\n`, { status, headers: { "Content-Type": "text/plain; charset=utf-8", ...hoder } });
}

async function lesPassord(req: Request): Promise<string | null> {
  const type = req.headers.get("Content-Type") ?? "";
  if (!type.startsWith("application/x-www-form-urlencoded")) return null;
  const lengde = Number(req.headers.get("Content-Length") ?? "0");
  if (lengde > MAKS_SKJEMA) return null;
  const kropp = await req.text();
  if (kropp.length > MAKS_SKJEMA) return null;
  return new URLSearchParams(kropp).get("passord");
}

/** Nøkkelen for signaturen: HMAC(APPTEST_NOKKEL, APPTEST_PASSORD). Nytt passord eller ny nøkkel gir ny signatur. */
async function signaturnokkel(hemmelighet: string, passord: string): Promise<CryptoKey> {
  const grunn = await crypto.subtle.importKey("raw", enc.encode(hemmelighet), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const avledet = await crypto.subtle.sign("HMAC", grunn, enc.encode(`apptest-v1:${passord}`));
  return crypto.subtle.importKey("raw", avledet, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signer(nokkel: CryptoKey, utloper: number): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", nokkel, enc.encode(`apptest:${utloper}`));
  return base64url(new Uint8Array(sig));
}

async function gyldigKake(req: Request, nokkel: CryptoKey): Promise<boolean> {
  const verdi = lesKake(req.headers.get("Cookie") ?? "", KAKE);
  const m = verdi?.match(/^(\d{1,12})\.([A-Za-z0-9_-]{43})$/);
  if (!m) return false;
  const utloper = Number(m[1]);
  if (utloper < Date.now() / 1000) return false;
  const sig = fraBase64url(m[2]);
  if (!sig) return false;
  // crypto.subtle.verify sammenligner i konstant tid
  return crypto.subtle.verify("HMAC", nokkel, sig, enc.encode(`apptest:${utloper}`));
}

/** Sammenligner passord i konstant tid: begge hashes først, så lengden ikke lekker. */
async function likePassord(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  return (crypto.subtle as SubtleCrypto & { timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean }).timingSafeEqual(ha, hb);
}

function lesKake(hode: string, navn: string): string | null {
  for (const del of hode.split(";")) {
    const i = del.indexOf("=");
    if (i > 0 && del.slice(0, i).trim() === navn) return del.slice(i + 1).trim();
  }
  return null;
}

function base64url(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fraBase64url(s: string): Uint8Array | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}
