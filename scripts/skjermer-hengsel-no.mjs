#!/usr/bin/env node
/**
 * K-182: skjermbilde av forsiden på hengsel.no (bygd fra sites/hengsel, med fiktive skjermer og merket v3) til design.hengsel.no/skjermer.
 * Lys og mørk, 1440 × 900, 1× og 2× (webp). Kjør etter `npm run build`. Chromium: CHROMIUM_PATH eller PLAYWRIGHT_BROWSERS_PATH.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "sites", "design", "public", "skjermer");
const server = await startServer(join(rot, "sites", "hengsel", "dist"));
const base = `http://127.0.0.1:${server.address().port}`;
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [tema, suffiks] of [["light", ""], ["dark", "-mork"]]) {
  for (const skala of [2, 1]) {
    const ctx = await nettleser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: skala, colorScheme: tema, reducedMotion: "reduce" });
    const side = await ctx.newPage();
    await side.goto(`${base}/`, { waitUntil: "networkidle" });
    await side.evaluate(() => document.fonts.ready);
    const png = await side.screenshot();
    await sharp(png).webp({ quality: 84, effort: 5 }).toFile(join(ut, `hengsel-no-forside${suffiks}${skala === 1 ? "@1x" : ""}.webp`));
    await ctx.close();
  }
}
await nettleser.close();
server.close();
console.log("✓ hengsel-no-forside (lys og mørk, 1× og 2×)");
