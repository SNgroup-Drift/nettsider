#!/usr/bin/env node
/**
 * N-7b: skjermbilder (1440 og 390) av forsidene og design.hengsel.no til claude/n7b-skjermbilder/, mot de bygde sidene (npm run build først).
 * Kontrollbilder av nettsidene selv. Bilder fra biblioteket (bilder.hengsel.no) vises ikke når nettet ikke nås; enhetsrammene står da uten app-bilde.
 */
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "n7b-skjermbilder");
await mkdir(ut, { recursive: true });
const SIDER = [
  ["hengsel-no", "hengsel", "/"],
  ["hengsel-crm", "hengsel", "/crm"],
  ["vis-hengsel-no", "vis", "/"],
  ["design-forside", "design", "/"],
  ["design-dokumentmaler", "design", "/dokumentmaler"],
  ["design-farger", "design", "/farger"],
  ["design-komponenter", "design", "/komponenter"],
  ["admin-logg-inn", "admin", "/logg-inn"],
];
const exe = process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : undefined;
const nettleser = await chromium.launch(exe ? { executablePath: exe } : {});
const servere = {};
for (const [, s] of SIDER) if (!servere[s]) { const v = await startServer(join(rot, "sites", s, "dist")); servere[s] = { v, base: `http://127.0.0.1:${v.address().port}` }; }
for (const [navn, s, sti] of SIDER) {
  for (const b of [1440, 390]) {
    const side = await nettleser.newPage({ viewport: { width: b, height: b === 1440 ? 900 : 844 } });
    await side.goto(`${servere[s].base}${sti}`, { waitUntil: "load" });
    await side.evaluate(async () => { for (const i of document.images) i.loading = "eager"; await Promise.all([...document.images].map((i) => i.complete || new Promise((r) => { i.onload = i.onerror = r; }))); });
    await side.waitForTimeout(500);
    await side.screenshot({ path: join(ut, `${navn}-${b}.png`), fullPage: true });
    await side.close();
  }
}
await nettleser.close();
for (const s of Object.values(servere)) s.v.close();
console.log(`✓ ${SIDER.length * 2} skjermbilder → claude/n7b-skjermbilder`);
