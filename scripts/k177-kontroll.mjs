#!/usr/bin/env node
/**
 * K-177: skjermbilder og målinger av alle nettsidene (hengsel.no, vis.hengsel.no, sngroup.no, byggem.no) på 390 og 1440 px, lys og mørk.
 *
 * Bruk: AXE_DIR=/sti/med/node_modules node scripts/k177-kontroll.mjs <rot> <mappe> [--mal]
 *   <rot>:   rota av et bygg (mappa med sites/*\/dist), f.eks. . for etter og en worktree av main for før
 *   <mappe>: hvor skjermbildene havner (webp), f.eks. claude/k177-skjermbilder/etter
 *   --mal:   i tillegg axe-kontrast (color-contrast), CLS og vannrett rulling per side; skriver tabellen til <mappe>/maling.md
 * AXE_DIR: mappe med node_modules/axe-core (installeres utenfor repoet).
 */
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { startServer } from "./statisk-server.mjs";

const [rot, ut] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const mal = process.argv.includes("--mal");
fs.mkdirSync(ut, { recursive: true });
const axeKilde = mal ? fs.readFileSync(createRequire(path.join(process.env.AXE_DIR, "x.js")).resolve("axe-core/axe.min.js"), "utf8") : "";

const sider = (dir, pre = "") => {
  const r = [];
  const gå = (d, sti) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory() && !["_astro", "fonts", "assets", "img", "skjermbilder", "enheter", "media", "logo", "fasit"].includes(e.name)) gå(path.join(d, e.name), `${sti}${e.name}/`);
      else if (e.name === "index.html") r.push(sti === "" ? "/" : sti);
      else if (e.name.endsWith(".html") && e.name !== "404.html") r.push(`${sti}${e.name.replace(/\.html$/, "")}`);
    }
  };
  gå(dir, "/");
  return [...new Set(r.map((s) => (s === "//" ? "/" : s.replace(/^\/\//, "/"))))].sort();
};

const nett = [
  ["hengsel", ["/", "/crm", "/ute", "/kundeportal", "/slik-virker-det", "/dokumenter", "/integrasjoner", "/priser-og-demo", "/apptest"]],
  ["vis", null],
  ["sngroup", ["/"]],
  ["byggem", ["/"]],
];
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const rader = [];
for (const [navn, liste] of nett) {
  const dist = path.join(rot, "sites", navn, "dist");
  if (!fs.existsSync(dist)) continue;
  const s = await startServer(dist);
  const base = `http://127.0.0.1:${s.address().port}`;
  for (const sti of liste ?? sider(dist)) {
    for (const bredde of [390, 1440]) {
      for (const tema of ["light", "dark"]) {
        const ctx = await b.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: tema, reducedMotion: "reduce", deviceScaleFactor: 1, bypassCSP: mal });
        const page = await ctx.newPage();
        await page.addInitScript(() => {
          window.__cls = 0;
          new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: "layout-shift", buffered: true });
        });
        const svar = await page.goto(base + sti, { waitUntil: "networkidle" }).catch(() => null);
        if (!svar || svar.status() !== 200) { rader.push(`| ${navn}${sti} | ${bredde} | ${tema} | status ${svar?.status()} |  |  |  |`); await ctx.close(); continue; }
        await page.waitForTimeout(500);
        const clsLast = await page.evaluate(() => window.__cls); // som Lighthouse: bare lasting, uten rulling
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(300);
        const fil = `${navn}${sti === "/" ? "-forside" : sti.replace(/\//g, "-")}-${bredde}-${tema === "light" ? "lys" : "mork"}.webp`;
        const png = await page.screenshot({ fullPage: true });
        const m = await sharp(png).metadata();
        await sharp(png).resize({ width: bredde, height: Math.min(m.height, 7000), fit: "cover", position: "top" }).webp({ quality: 62, effort: 4 }).toFile(path.join(ut, fil));
        if (mal) {
          await page.addScriptTag({ content: axeKilde });
          const r = await page.evaluate(async () => {
            const a = await window.axe.run(document, { runOnly: ["color-contrast"] });
            return { brudd: a.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ") + ": " + (n.any[0]?.message ?? ""))), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
          });
          rader.push(`| ${navn}${sti} | ${bredde} | ${tema === "light" ? "lys" : "mørk"} | ${r.brudd.length} | ${clsLast.toFixed(3)} | ${r.overflow ? "ja" : "nei"} | ${r.brudd.slice(0, 2).join("; ").replace(/\|/g, "/")} |`);
        }
        await ctx.close();
      }
    }
  }
  s.close();
  console.log(`${navn}: ferdig`);
}
if (mal) fs.writeFileSync(path.join(ut, "maling.md"), ["| Side | Bredde | Tema | axe-kontrast (brudd) | CLS | Vannrett rulling | Eksempler |", "|---|---|---|---|---|---|---|", ...rader, ""].join("\n"));
await b.close();
