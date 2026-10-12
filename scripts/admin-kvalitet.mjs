#!/usr/bin/env node
/**
 * K-184: kvalitetskontroll av sites/admin (admin.hengsel.no). Kjør etter `npm run build -w sites/admin`.
 *
 *   AXE_PATH=/sti/til/axe.min.js UT=claude/k184-skjermbilder node scripts/admin-kvalitet.mjs
 *
 * For hver side, bredde (390 og 1440) og tema (lys og mørk): axe-core (alle regler, brudd skrives ut, kontrast er et krav),
 * ingen konsollfeil (CSP-brudd vises der; serveren bruker dist/_headers), ingen sidelengs rulling, og et skjermbilde i UT.
 * Prøver også søkefeltet og fristfargene.
 */
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = process.env.UT ? resolve(process.env.UT) : null;
const axe = process.env.AXE_PATH ? await readFile(process.env.AXE_PATH, "utf8") : null;
if (ut) await mkdir(ut, { recursive: true });

const SIDER = ["/", "/kunder", "/kunder/sigdal-innlandet", "/kunder/eksempel-kjokken", "/finnes-ikke"];
const BREDDER = [390, 768, 1440];
const server = await startServer(join(rot, "sites", "admin", "dist"));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };

for (const sti of SIDER) {
  for (const b of BREDDER) {
    for (const tema of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: b, height: b < 500 ? 844 : 900 }, colorScheme: tema });
      const page = await ctx.newPage();
      const problemer = [];
      page.on("console", (m) => m.type() === "error" && !(sti === "/finnes-ikke" && /404/.test(m.text())) && problemer.push(`konsoll: ${m.text().slice(0, 160)}`));
      page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 160)}`));
      page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(base, "")}`));
      await page.goto(base + sti, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) problemer.push(`sidelengs rulling: ${overflow}px`);
      let kontrast = "";
      if (axe) {
        await page.evaluate(axe);
        const r = await page.evaluate(() => axe.run(document, { resultTypes: ["violations"] }));
        const kon = r.violations.filter((v) => v.id === "color-contrast");
        kontrast = `axe ${r.violations.length} brudd, kontrast ${kon.reduce((n, v) => n + v.nodes.length, 0)}`;
        for (const v of r.violations) problemer.push(`axe ${v.id}: ${v.nodes.length} (${v.nodes[0].target.join(" ")}) ${v.nodes[0].failureSummary?.split("\n")[1] ?? ""}`.slice(0, 260));
      }
      if (ut && sti !== "/finnes-ikke" && b !== 768) await page.screenshot({ path: join(ut, `${sti === "/" ? "plattform" : sti.slice(1).replace(/\//g, "-")}-${b}-${tema === "light" ? "lys" : "mork"}.png`), fullPage: true });
      sier(!problemer.length, `${sti} ${b} ${tema} ${kontrast}${problemer.length ? "\n    " + problemer.join("\n    ") : ""}`);
      await ctx.close();
    }
  }
}

// Søket og fristfargene
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const synlige = () => page.evaluate(() => [...document.querySelectorAll("[data-sok]:not([data-sok-nav])")].filter((e) => !e.hidden && e.offsetParent !== null).length);
  const alle = await synlige();
  await page.fill("#sok", "supabase");
  const treff = await synlige();
  sier(treff > 0 && treff < alle, `søk «supabase»: ${treff} av ${alle} synlige`);
  await page.fill("#sok", "sigdal");
  sier((await page.textContent("#treff")).includes("treff"), `søk «sigdal» finner kundens lenker og viser tellingen`);
  await page.fill("#sok", "xqzxqz");
  sier((await page.textContent("#treff")).trim() === "Ingen treff" && (await synlige()) === 0, "søk uten treff skjuler alt og sier «Ingen treff»");
  await page.fill("#sok", "");
  sier((await synlige()) === alle, "tomt søkefelt viser alt igjen");
  const niv = await page.evaluate(() => [...document.querySelectorAll(".frist")].map((e) => e.dataset.niva));
  sier(niv.every((n) => ["rod", "gul", "gronn", "ukjent"].includes(n)) && niv.includes("ukjent"), `fristene har farge (${[...new Set(niv)].join(", ")})`);
}

await browser.close();
server.close();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
