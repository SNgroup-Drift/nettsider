#!/usr/bin/env node
/**
 * K-177 kvalitetssjekk: alle sidene på 390 og 1440 px, lys og mørk (Playwright, bare Chromium).
 * Per side og visning: ingen konsollfeil (CSP gjelder), ingen vannrett rulling, alle img har width og height, ingen mislykkede forespørsler,
 * CLS (layout-shift, etter at hele siden er rullet gjennom) og axe-core color-contrast (AXE_PATH = axe.min.js). Skjermbilder lagres i UT.
 *
 *   DIST_ROOT=/sti/til/repo (standard: dette repoet, med dist-mappene under sites)  UT=mappe  SIDER=hengsel,vis,sngroup,byggem  AXE_PATH=…/axe.min.js
 *   LAGRE=hengsel:/ute,vis:/crm/   bare disse sidene lagres som skjermbilde (webp), standard: alle
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = process.env.DIST_ROOT ?? resolve(import.meta.dirname, "..");
const ut = process.env.UT ? resolve(process.env.UT) : null;
const sider = (process.env.SIDER ?? "hengsel,vis,sngroup,byggem").split(",");
const lagre = process.env.LAGRE ? new Set(process.env.LAGRE.split(",")) : null;
const axe = process.env.AXE_PATH ? await readFile(process.env.AXE_PATH, "utf8") : null;
if (ut) await mkdir(ut, { recursive: true });

const HENGSEL = ["/", "/crm", "/ute", "/kundeportal", "/slik-virker-det", "/dokumenter", "/integrasjoner", "/priser-og-demo", "/apptest"];
async function visSider(dist, pre = "") {
  const l = [];
  for (const e of await readdir(dist, { withFileTypes: true })) {
    if (e.isDirectory() && !["fonts", "assets", "img", "skjermbilder"].includes(e.name)) l.push(...(await visSider(join(dist, e.name), `${pre}/${e.name}`)));
    else if (e.name === "index.html") l.push(`${pre}/`);
  }
  return l.sort();
}
const LISTE = {
  hengsel: async () => HENGSEL,
  vis: (d) => visSider(d),
  sngroup: async () => ["/"],
  byggem: async () => ["/"],
};
const visninger = [{ b: 390, h: 844 }, { b: 1440, h: 900 }];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const rapport = [];
for (const site of sider) {
  const dist = join(rot, "sites", site, "dist");
  const server = await startServer(dist);
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const sti of await LISTE[site](dist)) {
    for (const v of visninger) {
      for (const tema of ["light", "dark"]) {
        const ctx = await browser.newContext({ viewport: { width: v.b, height: v.h }, deviceScaleFactor: 1, colorScheme: tema, reducedMotion: "no-preference" });
        const page = await ctx.newPage();
        const problemer = [];
        page.on("console", (m) => m.type() === "error" && problemer.push(`konsoll: ${m.text().slice(0, 140)}`));
        page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 140)}`));
        page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(base, "")}`));
        page.on("response", (r) => r.status() >= 400 && r.request().resourceType() !== "document" && problemer.push(`${r.status()}: ${r.url().replace(base, "")}`));
        await page.addInitScript(() => {
          window.__cls = 0;
          window.__skift = [];
          new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__skift.push([+e.value.toFixed(4), (e.sources ?? []).map((s) => (s.node ? `${s.node.nodeName.toLowerCase()}${s.node.className && typeof s.node.className === "string" ? "." + s.node.className.split(" ")[0] : ""}` : "?")).join(",")]); } }).observe({ type: "layout-shift", buffered: true });
        });
        await page.goto(base + sti, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        // ruller gjennom hele siden så lazy-bilder og video lastes
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(500);
        const data = await page.evaluate(() => ({
          cls: window.__cls,
          skift: window.__skift,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          utenMal: [...document.images].filter((i) => !(i.getAttribute("width") && i.getAttribute("height")) && !i.closest("svg")).map((i) => i.currentSrc.split("/").slice(-2).join("/")),
          ødelagte: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc && !i.currentSrc.endsWith(".svg")).map((i) => i.currentSrc.split("/").slice(-2).join("/")),
        }));
        if (data.overflow > 0) problemer.push(`vannrett rulling ${data.overflow} px`);
        if (data.utenMal.length) problemer.push(`img uten width/height: ${data.utenMal.slice(0, 3).join(", ")}`);
        if (data.ødelagte.length) problemer.push(`bilder som ikke lastet: ${data.ødelagte.slice(0, 3).join(", ")}`);
        if (data.cls > 0.0001) problemer.push(`CLS ${data.cls.toFixed(4)} ${JSON.stringify(data.skift.slice(0, 3))}`);
        let kontrast = 0;
        if (axe) {
          await page.evaluate(axe);
          const r = await page.evaluate(() => axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] }, resultTypes: ["violations"] }));
          kontrast = r.violations.reduce((a, x) => a + x.nodes.length, 0);
          if (kontrast) problemer.push(`kontrast: ${r.violations[0].nodes.slice(0, 2).map((n) => n.target.join(" ") + " " + (n.any[0]?.message ?? "").slice(0, 80)).join(" | ")}`);
        }
        const navn = `${site}${sti === "/" ? "-forside" : sti.replace(/\/$/, "").replace(/\//g, "-")}-${v.b}-${tema === "light" ? "lys" : "mork"}`;
        if (ut && (!lagre || lagre.has(`${site}:${sti}`))) {
          const png = await page.screenshot({ fullPage: true, type: "png" });
          const m = await sharp(png).metadata();
          await sharp(png).extract({ left: 0, top: 0, width: m.width, height: Math.min(m.height, 5000) }).webp({ quality: 70, effort: 4 }).toFile(join(ut, `${navn}.webp`));
        }
        if (problemer.length) feil++;
        rapport.push({ site, sti, bredde: v.b, tema, cls: +data.cls.toFixed(4), kontrast, problemer });
        console.log(`${problemer.length ? "✗" : "✓"} ${site}${sti} ${v.b} ${tema} CLS ${data.cls.toFixed(3)}${axe ? ` kontrast ${kontrast}` : ""}${problemer.length ? `\n    ${problemer.join("\n    ")}` : ""}`);
        await ctx.close();
      }
    }
  }
  server.close();
}
await browser.close();
if (process.env.JSON) await writeFile(process.env.JSON, JSON.stringify(rapport, null, 1));
console.log(`\n${rapport.length} visninger, ${feil} med problemer.`);
process.exit(feil ? 1 : 0);
