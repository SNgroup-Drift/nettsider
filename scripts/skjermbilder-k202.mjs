#!/usr/bin/env node
/**
 * K-202: skjermbilder med maskinen i mørk modus (colorScheme: dark), 390 og 1440 px, forsiden til hver Hengsel-side, og axe-kontroll (0 kontrastbrudd).
 *   node scripts/skjermbilder-k202.mjs <før|etter>   → claude/k202-skjermbilder/<side>-<bredde>-<før|etter>.png
 * Kjør etter `npm run build`. Chromium: CHROMIUM_PATH.
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const etikett = process.argv[2] ?? "etter";
const rot = resolve(import.meta.dirname, ".."); // K202_BYGG: bygg fra et annet uttrekk (f.eks. main) for «før»-bilder
const bygg = process.env.K202_BYGG ?? rot;
const ut = join(rot, "claude", "k202-skjermbilder");
await mkdir(ut, { recursive: true });
const axeKilde = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let kontrastbrudd = 0;
for (const side of ["hengsel", "vis", "admin", "design"]) {
  const server = await startServer(join(bygg, "sites", side, "dist"));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const bredde of [390, 1440]) {
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: "dark", bypassCSP: true, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const info = await p.evaluate(() => ({ cs: getComputedStyle(document.documentElement).colorScheme, bg: getComputedStyle(document.body).backgroundColor }));
    await p.screenshot({ path: join(ut, `${side}-${bredde}-${etikett}.png`), fullPage: false });
    await p.addScriptTag({ content: axeKilde });
    const r = await p.evaluate(() => axe.run(document, { runOnly: ["color-contrast"] }));
    kontrastbrudd += r.violations.length;
    console.log(`${side} ${bredde}px ${etikett}: color-scheme=${info.cs} body=${info.bg} kontrastbrudd=${r.violations.length}`);
    await ctx.close();
  }
  server.close();
}
await nettleser.close();
console.log(`Kontrastbrudd totalt: ${kontrastbrudd}`);
process.exit(kontrastbrudd ? 1 : 0);
