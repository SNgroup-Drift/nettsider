#!/usr/bin/env node
/**
 * K-256: skjermbilder av salgstavla og en toast i Hengsel Admin, 1440 og 390 px, med eksempeldata lokalt (som skjermbilder-k240.mjs).
 * Viser flate-kolonne (flaten bak kolonnene) og aksent-paa-mork (hakeikonet i toasten).
 *   npm run build -w sites/admin && UT=claude/k256/etter node scripts/skjermbilder-k256.mjs
 * Skriver også de beregnede fargene (kolonneflaten og toast-ikonet) til farger.json i UT.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldata } from "./lib/admin-eksempeldata.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "k256"));
await mkdir(ut, { recursive: true });

const env = { DB: await lagTestdatabase() };
await leggInnEksempeldata(env);
const { base, stopp } = await startAdminLokalt({ dist: join(rot, "sites", "admin", "dist"), env });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const farger = {};
try {
  for (const bredde of [1440, 390]) {
    const p = await browser.newPage({ viewport: { width: bredde, height: 900 } });
    await p.goto(`${base}/salg/tavle`); await p.waitForSelector(".tavlekort", { state: "attached" }); await p.waitForTimeout(300);
    await p.screenshot({ path: join(ut, `tavle-${bredde}.png`), fullPage: false });
    farger[`kolonne-${bredde}`] = await p.$eval(".tavle .kolonne", (e) => getComputedStyle(e).backgroundColor);
    await p.close();
  }
  // Toasten: flytt et kort fra Ny til Demo avtalt i 1440 px, og ta samme toast i 390 px før den forsvinner (4 s)
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${base}/salg/tavle`); await p.waitForSelector(".tavlekort");
  await p.dragAndDrop('.tavle .kolonne[data-kolonne="ny"] .tavlekort >> nth=0', '.tavle .kolonne[data-kolonne="demo"]');
  await p.waitForSelector("#toast:not([hidden])"); await p.waitForTimeout(200);
  farger.toastIkon = await p.$eval("#toast svg", (e) => getComputedStyle(e).color);
  farger.toastFlate = await p.$eval("#toast", (e) => getComputedStyle(e).backgroundColor);
  await p.screenshot({ path: join(ut, "toast-1440.png") });
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(200);
  await p.screenshot({ path: join(ut, "toast-390.png") });
  await p.close();
} finally {
  await browser.close(); await stopp();
}
await writeFile(join(ut, "farger.json"), JSON.stringify(farger, null, 2) + "\n");
console.log(farger);
