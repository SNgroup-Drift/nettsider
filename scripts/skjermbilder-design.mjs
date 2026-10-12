#!/usr/bin/env node
/**
 * K-182: skjermbilder og nettlesersjekker av design.hengsel.no (sites/design/dist) med Playwright (Chromium) og axe-core.
 *
 * For alle sider, i 390 og 1440 px, lys og mørk:
 *  - skjermbilde (hele siden, webp) til claude/k182-skjermbilder/<side>-<bredde>-<lys|mork>.webp
 *  - ingen konsollfeil og ingen CSP-brudd, ingen forespørsler utenfor siden selv
 *  - ingen style-attributter og ingen inline-skript, alle <img> har width og height
 *  - ingen vannrett rulling (også ved 360 px)
 *  - axe-core: 0 brudd på kontrast (color-contrast) og 0 brudd totalt (WCAG 2.x A/AA og beste praksis)
 * Kjør etter `npm run build`: node scripts/skjermbilder-design.mjs   (Chromium: CHROMIUM_PATH). Bruk --uten-bilder for bare sjekkene.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const require = createRequire(import.meta.url);
const axeKilde = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const rot = resolve(import.meta.dirname, "..");
const utMappe = join(rot, "claude", "k182-skjermbilder");
const utenBilder = process.argv.includes("--uten-bilder");
if (!utenBilder) await mkdir(utMappe, { recursive: true });

const SIDER = [["/", "forside"], ["/merke", "merke"], ["/farger", "farger"], ["/skrift", "skrift"], ["/komponenter", "komponenter"], ["/skjermer", "skjermer"], ["/last-ned", "last-ned"], ["/finnes-ikke", "404"]];
const server = await startServer(join(rot, "sites", "design", "dist"));
const base = `http://127.0.0.1:${server.address().port}`;
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, tekst) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${tekst}`); };

for (const [sti, navn] of SIDER) {
  for (const bredde of [390, 1440]) {
    for (const tema of ["light", "dark"]) {
      const ctx = await nettleser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, colorScheme: tema, reducedMotion: "reduce", deviceScaleFactor: 1 });
      const side = await ctx.newPage();
      const konsoll = [];
      const eksterne = [];
      side.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !(navn === "404" && /status of 404/.test(m.text()))) konsoll.push(m.text()); });
      side.on("pageerror", (e) => konsoll.push(String(e)));
      side.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:")) eksterne.push(r.url()); });
      await side.goto(base + sti, { waitUntil: "networkidle" });
      await side.evaluate(() => document.fonts.ready);
      // lazy-bilder: rull gjennom siden så alle lastes før skjermbilde og kontroll
      await side.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
      await side.waitForLoadState("networkidle");
      const etikett = `${navn} ${bredde} px ${tema === "light" ? "lys" : "mørk"}`;
      const info = await side.evaluate(() => ({
        stilAttr: document.querySelectorAll("[style]").length,
        inlineSkript: [...document.scripts].filter((s) => !s.src && !/json/.test(s.type)).length,
        utenMal: [...document.images].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).map((i) => i.src),
        bredde: document.documentElement.scrollWidth, vindu: window.innerWidth,
        brutte: [...document.images].filter((i) => i.offsetParent !== null && (!i.complete || i.naturalWidth === 0)).map((i) => i.src),
      }));
      await side.evaluate(axeKilde); // via CDP: siden beholder CSP-en (script-src self)
      const axe = await side.evaluate(async () => {
        const r = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } });
        return r.violations.map((v) => ({ id: v.id, n: v.nodes.length, hjelp: v.help, mål: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
      });
      const kontrast = axe.find((v) => v.id === "color-contrast");
      meld(!kontrast, `${etikett}: 0 kontrastbrudd (axe)${kontrast ? ` – ${kontrast.n} brudd, f.eks. ${kontrast.mål.join(" | ")}` : ""}`);
      const andre = axe.filter((v) => v.id !== "color-contrast");
      meld(!andre.length, `${etikett}: 0 øvrige axe-brudd${andre.length ? ` – ${andre.map((v) => `${v.id} (${v.n}): ${v.mål.join(" | ")}`).join("; ")}` : ""}`);
      meld(!konsoll.length, `${etikett}: ingen konsollfeil eller CSP-brudd${konsoll.length ? ` – ${konsoll[0]}` : ""}`);
      meld(!eksterne.length, `${etikett}: ingen eksterne forespørsler${eksterne.length ? ` – ${eksterne[0]}` : ""}`);
      meld(info.stilAttr === 0 && info.inlineSkript === 0, `${etikett}: ingen style-attributter eller inline-skript`);
      meld(!info.utenMal.length, `${etikett}: alle bilder har width og height${info.utenMal.length ? ` – ${info.utenMal[0]}` : ""}`);
      meld(!info.brutte.length, `${etikett}: alle synlige bilder lastet${info.brutte.length ? ` – ${info.brutte[0]}` : ""}`);
      meld(info.bredde <= info.vindu, `${etikett}: ingen vannrett rulling (${info.bredde} ≤ ${info.vindu})`);
      if (!utenBilder) {
        const png = await side.screenshot({ fullPage: true });
        await sharp(png).webp({ quality: 78, effort: 4 }).toFile(join(utMappe, `${navn}-${bredde}-${tema === "light" ? "lys" : "mork"}.webp`));
      }
      await ctx.close();
    }
  }
}
// 360 px: ingen vannrett rulling på noen side
{
  const ctx = await nettleser.newContext({ viewport: { width: 360, height: 800 } });
  const side = await ctx.newPage();
  for (const [sti, navn] of SIDER) {
    await side.goto(base + sti, { waitUntil: "networkidle" });
    const [b, v] = await side.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    meld(b <= v, `${navn} 360 px: ingen vannrett rulling (${b} ≤ ${v})`);
  }
  await ctx.close();
}
await nettleser.close();
server.close();
console.log(`\n${feil ? `✗ ${feil} feil` : "✓ alle sjekker grønne"}`);
process.exit(feil ? 1 : 0);
