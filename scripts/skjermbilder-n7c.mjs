#!/usr/bin/env node
/**
 * N-7c: skjermbilder (1440 og 390) av design.hengsel.no/dokumentmaler (29 kort) og hengsel.no/telefon til claude/n7c-skjermbilder/, mot de bygde sidene (npm run build først).
 * Kontrollbilder av nettsidene selv. Bilder fra biblioteket (bilder.hengsel.no) vises ikke når nettet ikke nås; enhetsrammene står da uten app-bilde.
 */
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "n7c-skjermbilder");
await mkdir(ut, { recursive: true });
const SIDER = [
  ["design-dokumentmaler", "design", "/dokumentmaler"],
  ["hengsel-telefon", "hengsel", "/telefon"],
];
const exe = process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : undefined;
const nettleser = await chromium.launch(exe ? { executablePath: exe } : {});
const servere = {};
for (const [, s] of SIDER) if (!servere[s]) { const v = await startServer(join(rot, "sites", s, "dist")); servere[s] = { v, base: `http://127.0.0.1:${v.address().port}` }; }
for (const [navn, s, sti] of SIDER) {
  for (const b of [1440, 390]) {
    const side = await nettleser.newPage({ viewport: { width: b, height: b === 1440 ? 900 : 844 } });
    await side.goto(`${servere[s].base}${sti}`, { waitUntil: "load" });
    await side.evaluate(() => { for (const i of document.querySelectorAll('img')) i.loading = 'eager'; });
    await side.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 });
    await side.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await side.waitForTimeout(2500);
    console.log(navn, b, 'kort:', await side.locator('article.mal').count(), 'bilder uten mål:', await side.locator('img:not([width]):not([height])').count());
    await side.screenshot({ path: join(ut, `${navn}-${b}.png`), fullPage: true });
    await side.close();
  }
}
await nettleser.close();
for (const s of Object.values(servere)) s.v.close();
console.log(`✓ ${SIDER.length * 2} skjermbilder → claude/n7c-skjermbilder`);
