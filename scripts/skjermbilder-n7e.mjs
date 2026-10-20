#!/usr/bin/env node
/**
 * N-7e: skjermbilder (1440 og 390) av kortet Statusrad på design.hengsel.no/komponenter (lys og mørk side om side) og, hvis sites/hengsel/dist har
 * /statusprove (en midlertidig prøveside som bruker statusradene i kitet; ligger ikke i repoet, ingen side på hengsel.no har statusrader ennå), av Tabellflis og Listeflis med status.
 * Kjør etter `npm run build`. Bibliotekbildene lastes ikke (bilder.hengsel.no nås ikke fra sandkassen).
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "n7e-skjermbilder");
await mkdir(ut, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ds = await startServer(join(rot, "sites", "design", "dist"));
const D = `http://127.0.0.1:${ds.address().port}`;
const medHengsel = existsSync(join(rot, "sites", "hengsel", "dist", "statusprove.html"));
const hs = medHengsel ? await startServer(join(rot, "sites", "hengsel", "dist")) : null;
const H = hs && `http://127.0.0.1:${hs.address().port}`;
let feil = 0;
const meld = (ok, t) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${t}`); };

async function ta(url, bredde, velger, fil) {
  const ctx = await browser.newContext({ viewport: { width: bredde, height: bredde > 800 ? 900 : 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const konsoll = [];
  p.on("console", (m) => { if (m.type() === "error" && !/bilder\.hengsel\.no|ERR_|Failed to load resource/.test(m.text())) konsoll.push(m.text()); });
  p.on("pageerror", (e) => konsoll.push(String(e)));
  await p.route(/bilder\.hengsel\.no/, (r) => r.abort());
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(400);
  meld(!(await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)), `${fil}: ingen vannrett rulling`);
  meld(konsoll.length === 0, `${fil}: ingen konsollfeil${konsoll.length ? " " + konsoll.join(" | ") : ""}`);
  const el = p.locator(velger).first();
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: join(ut, fil) });
  await ctx.close();
}
for (const b of [1440, 390]) {
  await ta(`${D}/komponenter`, b, "#statusrad", `design-komponenter-statusrad-${b}.png`);
  await ta(`${D}/komponenter`, b, "#ikoner .ikon-gruppe:nth-of-type(3)", `design-komponenter-ikoner-status-${b}.png`).catch(() => {});
  if (H) {
    await ta(`${H}/statusprove`, b, "#prove", `hengsel-tabellflis-status-${b}.png`);
    await ta(`${H}/statusprove`, b, "#prove-liste", `hengsel-listeflis-status-${b}.png`);
  }
}
await browser.close(); ds.close(); hs?.close();
process.exit(feil ? 1 : 0);
