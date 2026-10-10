#!/usr/bin/env node
/**
 * Nettlesersjekker og skjermbilder for Visningsrommet (sites/vis, K-110) med Playwright (Chromium).
 *
 *  - Alle sider (og 404) på 390, 1280 og 1440 px, lys og mørk: ingen konsollfeil (CSP fra _headers gjelder),
 *    ingen vannrett rulling, ingen forespørsler til andre verter, og Newsreader og Inter lastes fra /fonts/.
 *  - Skjermbilder av forsiden, /system/, /reise/, /sv/ og 404 på mobil (390) og PC (1440) til docs/skjermbilder/vis-*.png.
 *  - Romkortbildene på forsiden for rom uten skjermbilde fra designfilene: rommet på 1920 × 1080 (lys, øverst) i Studio Display-rammen
 *    som webp til sites/vis/src/img/rom-*.webp. Bildene ligger i repoet og følger med i neste bygg (ingen bilder fra hengsel.no).
 *
 * Kjør etter `npm run build`: node scripts/skjermbilder-vis.mjs
 * Chromium: PLAYWRIGHT_BROWSERS_PATH, eller CHROMIUM_PATH for en bestemt fil.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";
import { enhet, tilWebp } from "./lib/rammer.mjs";

const rot = resolve(import.meta.dirname, "..");
const dist = join(rot, "sites", "vis", "dist");
const ut = join(rot, "docs", "skjermbilder");
await mkdir(ut, { recursive: true });

async function sider(dir, pre = "") {
  const liste = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory() && e.name !== "fonts" && e.name !== "assets") liste.push(...(await sider(join(dir, e.name), `${pre}/${e.name}`)));
    else if (e.name === "index.html") liste.push(`${pre}/`);
  }
  return liste;
}
const alle = [...(await sider(dist)).sort(), "/finnes-ikke"];
const bilder = { "/": "forside", "/system/": "system", "/reise/": "reise", "/sv/": "sv", "/finnes-ikke": "404" };

const server = await startServer(dist);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;

const visninger = [
  { navn: "mobil", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { navn: "1280", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, bareSjekk: true },
  { navn: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
];
for (const v of visninger) {
  for (const modus of ["light", "dark"]) {
    const { navn: _n, bareSjekk, ...oppsett } = v;
    const ctx = await browser.newContext({ ...oppsett, colorScheme: modus, reducedMotion: "reduce" });
    for (const sti of alle) {
      const page = await ctx.newPage();
      const konsoll = [];
      const eksterne = new Set();
      // På 404-siden logger Chromium selve 404-svaret som en feil; det er forventet
      page.on("console", (m) => m.type() === "error" && !(sti === "/finnes-ikke" && /status of 404/.test(m.text()) && m.location().url === base + sti) && konsoll.push(m.text()));
      page.on("pageerror", (e) => konsoll.push(e.message));
      page.on("request", (r) => !r.url().startsWith(base) && !r.url().startsWith("data:") && eksterne.add(new URL(r.url()).host));
      const svar = await page.goto(base + sti, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
        lastet: [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")))].sort(),
        brukt: [...new Set([...document.querySelectorAll("body *")].map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/["']/g, "").trim()))],
      }));
      const forventet = ["Inter", "Newsreader"].filter((f) => r.brukt.includes(f));
      const mangler = forventet.filter((f) => !r.lastet.includes(f));
      const status = sti === "/finnes-ikke" ? 404 : 200;
      const ok = svar.status() === status && r.sw <= r.cw && !konsoll.length && !eksterne.size && !mangler.length;
      if (!ok) feil++;
      console.log(
        `${ok ? "✓" : "✗"} ${sti} (${v.viewport.width} px, ${modus === "light" ? "lys" : "mørk"}): ${svar.status()}, bredde ${r.sw}/${r.cw}, skrifter ${r.lastet.join(" + ") || "ingen"}` +
          `${konsoll.length ? `, konsoll: ${konsoll.join(" | ")}` : ""}${eksterne.size ? `, eksterne: ${[...eksterne].join(", ")}` : ""}${mangler.length ? `, ikke lastet: ${mangler.join(", ")}` : ""}`,
      );
      if (bilder[sti] && !bareSjekk) {
        const fil = `vis-${bilder[sti]}-${v.navn}-${modus === "light" ? "lys" : "mork"}.png`;
        await page.screenshot({ path: join(ut, fil), fullPage: sti !== "/reise/" });
      }
      await page.close();
    }
    await ctx.close();
  }
}
// Romkortbildene for rom uten skjermbilde fra designfilene: rommet selv på 1920 × 1080 (lys, øverst) i Studio Display-rammen
// (scripts/lib/rammer.mjs), webp med gjennomsiktig bunn i src/img. Rommene med skjermbilder lages av scripts/rammer-vis.mjs.
const rom = ["opplaering", "levprov", "kontroll", "montasjeplan", "prosjekt", "hvitevarer", "gevinst", "leverandor", "leder", "veikart", "sv", "system"];
{
  const img = join(rot, "sites", "vis", "src", "img");
  await mkdir(img, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  for (const r of rom) {
    const page = await ctx.newPage();
    await page.goto(`${base}/${r}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const png = await page.screenshot({ fullPage: false });
    await tilWebp(await enhet("pc", png), join(img, `rom-${r}.webp`), { bredde: 960 });
    await page.close();
  }
  await ctx.close();
  console.log(`\n${rom.length} romkortbilder i sites/vis/src/img/`);
}
await browser.close();
server.close();
console.log(`\n${alle.length} sider × ${visninger.length * 2} visninger, ${feil} feil.`);
process.exit(feil ? 1 : 0);
