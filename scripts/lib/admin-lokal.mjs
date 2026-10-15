/**
 * K-240: lokal server for Hengsel Admin uten Cloudflare: de bygde sidene fra sites/admin/dist, API-et fra worker/api.js mot en node:sqlite-database
 * (D1-etterligning, scripts/lib/d1-node.mjs) og de samme rutene som Workeren (worker/ruter.js). Access-sjekken hoppes over her, og brukeren er
 * eier, eller (K-259) rollen support med samme sti-sperre som Workeren (worker/tilgang.js, «Ingen tilgang» med 403). Bare til skjermbilder og lokal prøving; produksjonen går alltid gjennom worker/index.js. Hodene fra dist/_headers (CSP) gjelder også her.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { finnFil } from "../statisk-server.mjs";
import { handterApi, tilbudPdf } from "../../sites/admin/worker/api.js";
import { handterLead } from "../../sites/admin/worker/lead.js";
import { stiTilFil, TILBUD_PDF } from "../../sites/admin/worker/ruter.js";
import { kanSe, kanSkrive } from "../../sites/admin/worker/tilgang.js";
import { BRUKER } from "./admin-eksempeldata.mjs";

const TYPER = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".ico": "image/x-icon", ".png": "image/png", ".json": "application/json" };

async function lesHoder(dist) {
  const hoder = {};
  try {
    let iBlokk = false;
    for (const linje of (await readFile(join(dist, "_headers"), "utf8")).split("\n")) {
      if (/^\S/.test(linje) && !linje.startsWith("#")) iBlokk = linje.trim() === "/*";
      else if (iBlokk && /^\s+\S/.test(linje)) { const i = linje.indexOf(":"); hoder[linje.slice(0, i).trim()] = linje.slice(i + 1).trim(); }
    }
  } catch {}
  delete hoder["Strict-Transport-Security"];
  if (hoder["Content-Security-Policy"]) hoder["Content-Security-Policy"] = hoder["Content-Security-Policy"].replace(/;\s*upgrade-insecure-requests/, "");
  return hoder;
}

/** @param {{ dist: string, env: { DB: any, [k: string]: any }, bruker?: object }} valg */
export async function startAdminLokalt({ dist, env, bruker = BRUKER }) {
  const hoder = await lesHoder(dist);
  const logo = (await readFile(join(dist, "logo", "logo-hengsel-lys.svg"), "utf8")).replace(/<metadata>[\s\S]*?<\/metadata>/, "");
  const hentLogo = async () => logo;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "127.0.0.1"}`);
    const sti = url.pathname;
    const erApi = sti === "/api" || sti.startsWith("/api/");
    const pdf = TILBUD_PDF.exec(sti);
    const rolle = bruker.rolle === "support" ? { rolle: "support", navn: bruker.navn } : null;
    if (rolle && !/^\/(?:_astro|fonts|logo)\//.test(sti) && !/^\/favicon/.test(sti) && (!kanSe(rolle, sti) || (erApi && !["GET", "HEAD"].includes(req.method) && !kanSkrive(rolle, sti)))) {
      if (erApi) { res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" }); res.end(JSON.stringify({ ok: false, kode: "ADM-403", melding: "Ingen tilgang." })); return; }
      const side = await finnFil(dist, "/ingen-tilgang.html");
      res.writeHead(403, { "Content-Type": TYPER[".html"], "Cache-Control": "no-store", ...hoder });
      res.end(await readFile(side));
      return;
    }
    if (erApi || pdf) {
      const deler = [];
      for await (const d of req) deler.push(d);
      const body = Buffer.concat(deler);
      const request = new Request(url.href, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : body, duplex: "half" });
      const svar = sti === "/api/lead" ? await handterLead(request, env) : pdf ? await tilbudPdf(env, pdf[1], Number(pdf[2]), { hentLogo }) : await handterApi(request, env, { bruker, hentLogo });
      res.writeHead(svar.status, Object.fromEntries(svar.headers));
      res.end(Buffer.from(await svar.arrayBuffer()));
      return;
    }
    let fil = await finnFil(dist, stiTilFil(sti));
    let status = 200;
    if (!fil) { fil = await finnFil(dist, "/404.html"); status = 404; }
    if (!fil) { res.writeHead(404).end(); return; }
    const data = await readFile(fil);
    res.writeHead(status, { "Content-Type": TYPER[extname(fil)] ?? "application/octet-stream", "Cache-Control": "no-store", ...(fil.endsWith(".html") ? hoder : {}) });
    res.end(data);
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  return { server, base: `http://127.0.0.1:${server.address().port}`, stopp: () => new Promise((ok) => server.close(ok)) };
}
