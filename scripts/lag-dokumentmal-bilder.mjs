#!/usr/bin/env node
/**
 * N-7b: forhåndsvisning av side 1 for hver dokumentmal på design.hengsel.no, i Hengsel standard (tema/hengsel.css), til sites/design/public/dokumentmaler/<mappe>.png.
 * Pakkens egne side-N.png er tatt i kundetemaet (serif, varm brun; se dokumentmaler/README.md i designsystemet) og vises ikke her: design.hengsel.no har ingen kundeprofil.
 * Byttes ut mot side-1.png når Design leverer dem i Hengsel standard (2.10-delta). Krever Chromium (Playwright). Kjøres for hånd, ikke av bygget:
 *   npm run design:dokumentmal-bilder
 * Genererer fra kopien i sites/design/public/ds/dokumentmaler (lages av `node scripts/kopier-ds.mjs && node scripts/lag-dokumentmaler.mjs`, som denne kjører først).
 */
import { execFileSync } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const rot = resolve(import.meta.dirname, "..");
for (const s of ["kopier-ds.mjs", "lag-dokumentmaler.mjs"]) execFileSync(process.execPath, [join(rot, "scripts", s)], { stdio: "inherit" });
const kilde = join(rot, "sites", "design", "public", "ds", "dokumentmaler");
const ut = join(rot, "sites", "design", "public", "dokumentmaler");
await mkdir(ut, { recursive: true });
const mapper = (await readdir(kilde)).filter((m) => /^\d\d-/.test(m)).sort();
const exe = process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : undefined;
const nettleser = await chromium.launch(exe ? { executablePath: exe } : {});
const side = await nettleser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });
for (const m of mapper) {
  await side.goto(pathToFileURL(join(kilde, m, "eksempel.html")).href);
  await side.evaluate(() => document.fonts.ready);
  await side.locator("section.side, div.epost").first().screenshot({ path: join(ut, `${m}.png`), animations: "disabled" });
}
await nettleser.close();
console.log(`✓ ${mapper.length} forhåndsvisninger → sites/design/public/dokumentmaler`);
