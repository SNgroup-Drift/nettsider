/**
 * Liten statisk server for bygde nettsteder. Løser stier slik Cloudflare Workers gjør med html_handling «auto-trailing-slash»:
 * / → index.html, /personvern → personvern.html. Ukjente stier får 404.html med status 404, som
 * not_found_handling «404-page» i wrangler.jsonc. Brukes av sjekk-lenker.mjs og skjermbilder.mjs.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { gzipSync } from "node:zlib";

const typer = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".txt": "text/plain", ".ico": "image/x-icon", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".webm": "video/webm", ".json": "application/json", ".webmanifest": "application/manifest+json", ".pdf": "application/pdf",
};

export async function finnFil(dist, sti) {
  const ren = decodeURIComponent(sti.split("?")[0].split("#")[0]);
  const kandidater = ren.endsWith("/") ? [join(ren, "index.html")] : [ren, `${ren}.html`, join(ren, "index.html")];
  for (const k of kandidater) {
    const full = join(dist, k);
    if (!full.startsWith(dist)) return null;
    try {
      if ((await stat(full)).isFile()) return full;
    } catch {}
  }
  return null;
}

/** Leser hodene under «/*» i dist/_headers, så CSP-en gjelder også lokalt. */
async function lesHoder(dist) {
  const hoder = {};
  try {
    let iBlokk = false;
    for (const linje of (await readFile(join(dist, "_headers"), "utf8")).split("\n")) {
      if (/^\S/.test(linje) && !linje.startsWith("#")) iBlokk = linje.trim() === "/*";
      else if (iBlokk && /^\s+\S/.test(linje)) {
        const i = linje.indexOf(":");
        hoder[linje.slice(0, i).trim()] = linje.slice(i + 1).trim();
      }
    }
  } catch {}
  // Lokalt kjører vi http, så HSTS og oppgradering til https passer ikke her
  delete hoder["Strict-Transport-Security"];
  if (hoder["Content-Security-Policy"]) {
    hoder["Content-Security-Policy"] = hoder["Content-Security-Policy"].replace(/;\s*upgrade-insecure-requests/, "");
  }
  return hoder;
}

export async function startServer(dist) {
  const hoder = await lesHoder(dist);
  const server = createServer(async (req, res) => {
    let fil = await finnFil(dist, req.url ?? "/");
    let status = 200;
    if (!fil) {
      // Som Workers med not_found_handling «404-page»: dist/404.html med status 404
      fil = await finnFil(dist, "/404.html");
      status = 404;
      if (!fil) {
        res.writeHead(404).end();
        return;
      }
    }
    const type = typer[extname(fil)] ?? "application/octet-stream";
    let innhold = await readFile(fil);
    const ekstra = fil.includes("/_astro/") ? { "cache-control": "public, max-age=31536000, immutable" } : {};
    // Komprimer tekst slik Cloudflare gjør
    if (/text|svg/.test(type) && /gzip/.test(req.headers["accept-encoding"] ?? "")) {
      innhold = gzipSync(innhold);
      ekstra["content-encoding"] = "gzip";
    }
    res.writeHead(status, { ...hoder, ...ekstra, "content-type": type });
    res.end(innhold);
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

