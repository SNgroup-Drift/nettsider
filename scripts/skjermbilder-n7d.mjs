#!/usr/bin/env node
/**
 * N-7d: skjermbilder (1440 og 390) av design.hengsel.no/farger (hele siden, pluss statustonene og produktpalettene som egne utsnitt) og /komponenter (ikonene)
 * til claude/n7d-skjermbilder/, mot de bygde sidene (npm run build først). Kontrollbilder av nettsidene selv; ingen app-skjermbilder.
 */
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "n7d-skjermbilder");
await mkdir(ut, { recursive: true });
const SIDER = [
  ["design-farger", "design", "/farger", ["#status", "#produktpaletter"]],
  ["design-komponenter", "design", "/komponenter", ["#ikoner"]],
];
const exe = process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : undefined;
const nettleser = await chromium.launch(exe ? { executablePath: exe } : {});
const server = await startServer(join(rot, "sites", "design", "dist"));
const base = `http://127.0.0.1:${server.address().port}`;
let antall = 0;
for (const [navn, , sti, utsnitt] of SIDER) {
  for (const b of [1440, 390]) {
    const side = await nettleser.newPage({ viewport: { width: b, height: b === 1440 ? 900 : 844 } });
    await side.goto(`${base}${sti}`, { waitUntil: "load" });
    await side.evaluate(() => { for (const i of document.querySelectorAll("img")) i.loading = "eager"; });
    await side.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 });
    await side.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await side.waitForTimeout(1500);
    if (sti === "/farger") console.log(navn, b, "status-piller:", await side.locator("#status .pille").count(), "piller i produktkortene:", await side.locator(".produkt-status .pille").count());
    await side.screenshot({ path: join(ut, `${navn}-${b}.png`), fullPage: true });
    antall++;
    for (const u of utsnitt) {
      await side.locator(u).screenshot({ path: join(ut, `${navn}${u.replace("#", "-")}-${b}.png`) });
      antall++;
    }
    await side.close();
  }
}
await nettleser.close();
server.close();
console.log(`✓ ${antall} skjermbilder → claude/n7d-skjermbilder`);
