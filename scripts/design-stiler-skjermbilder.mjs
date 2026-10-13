#!/usr/bin/env node
/**
 * design.hengsel.no: skjermbilder av forsiden, /farger, /komponenter og /merke i 390 og 1440 px, til docs/skjermbilder/design-<side>-<bredde>-<fase>.png.
 *   node scripts/design-stiler-skjermbilder.mjs for      (fase «for»: før rettingen)
 *   node scripts/design-stiler-skjermbilder.mjs etter    (fase «etter»)
 * Krever bygd sites/design/dist. Siden serveres med _headers (CSP), som på Cloudflare. Chromium: CHROMIUM_PATH.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const fase = process.argv[2];
if (!["for", "etter"].includes(fase)) throw new Error("Bruk: node scripts/design-stiler-skjermbilder.mjs for|etter");
const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "docs", "skjermbilder");
await mkdir(ut, { recursive: true });
const server = await startServer(join(rot, "sites", "design", "dist"));
const base = `http://127.0.0.1:${server.address().port}`;
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [sti, navn] of [["/", "forside"], ["/farger", "farger"], ["/komponenter", "komponenter"], ["/merke", "merke"]]) {
  for (const bredde of [390, 1440]) {
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, reducedMotion: "reduce" });
    const side = await ctx.newPage();
    await side.goto(base + sti, { waitUntil: "networkidle" });
    await side.evaluate(() => document.fonts.ready);
    await side.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    await side.waitForLoadState("networkidle");
    await side.screenshot({ path: join(ut, `design-${navn}-${bredde}-${fase}.png`), fullPage: true });
    await ctx.close();
  }
}
await nettleser.close();
server.close();
console.log(`✓ 8 skjermbilder (${fase}) i docs/skjermbilder/design-*-${fase}.png`);
