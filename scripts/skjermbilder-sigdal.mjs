#!/usr/bin/env node
/**
 * K-223: skjermbilder og nettlesersjekker av hengsel.no/sigdal (390 og 1280 px): forsiden, /sigdal/crm og ett vis-rom (/sigdal/vis/crm/).
 * Sidene serveres som statiske filer fra dist (samme filer og _headers som Workeren henter fra), uten Worker og dermed uten Access-sjekken. Det finnes ingen
 * testmodus eller omgåelse i Worker-koden; Access-sjekken testes i scripts/sigdal-worker.test.mjs. Kjør `npm run build` først. Resultat: claude/k223-skjermbilder/*.png
 *   node scripts/skjermbilder-sigdal.mjs [sti …]   (standard: de tre sidene)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "k223-skjermbilder");
await mkdir(ut, { recursive: true });
const SIDER = process.argv.length > 2 ? process.argv.slice(2) : [["sigdal-forside", "/sigdal"], ["sigdal-crm", "/sigdal/crm"], ["sigdal-vis-crm", "/sigdal/vis/crm/"]].map((x) => x);
const sider = SIDER.map((s) => (Array.isArray(s) ? s : [s.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "forside", s]));
const visninger = [{ navn: "390", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { navn: "1280", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }];

const server = await startServer(join(rot, "sites", "hengsel", "dist"));
const hengsel = { base: `http://127.0.0.1:${server.address().port}`, stopp: async () => server.close() };
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, tekst) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${tekst}`); };
try {
  for (const v of visninger) {
    for (const [navn, sti] of sider) {
      const ctx = await browser.newContext({ ...v, colorScheme: "light", reducedMotion: "reduce" });
      const page = await ctx.newPage();
      const konsoll = [];
      // Vis-rommene har inline stil og får egen CSP av Workeren (worker/sigdal.ts); den statiske serveren her gir dem den strenge CSP-en, så den meldingen er forventet der
      const forventet = (t) => sti.startsWith("/sigdal/vis/") && /inline style because it violates/.test(t);
      page.on("console", (m) => { if (m.type() === "error" && !forventet(m.text())) konsoll.push(m.text()); });
      page.on("pageerror", (e) => konsoll.push(String(e)));
      page.on("requestfailed", (r) => konsoll.push(`feilet: ${r.url()}`));
      page.on("response", (r) => { if (r.status() >= 400) konsoll.push(`${r.status()} ${r.url()}`); });
      await page.goto(hengsel.base + sti, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // Skriftene og fargene som faktisk brukes
      const info = await page.evaluate(() => {
        const cs = (e) => getComputedStyle(e);
        const h = document.querySelector("h1, h2");
        return {
          kunde: document.documentElement.dataset.kunde,
          body: cs(document.body).backgroundColor,
          tekst: cs(document.body).color,
          bodyFont: cs(document.body).fontFamily.split(",")[0],
          hFont: h ? cs(h).fontFamily.split(",")[0] : null,
          newsreader: document.fonts.check("500 32px 'Newsreader Variable'"),
          inter: document.fonts.check("400 16px 'Inter Variable'"),
          bredde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      meld(info.kunde === "sigdal", `${navn} ${v.navn}: data-kunde=sigdal`);
      meld(info.body === "rgb(251, 249, 246)", `${navn} ${v.navn}: bakgrunn Off White (${info.body})`);
      meld(info.tekst === "rgb(49, 38, 29)", `${navn} ${v.navn}: tekst Warm Black (${info.tekst})`);
      meld(info.bredde <= 0, `${navn} ${v.navn}: ingen vannrett rulling`);
      meld(info.newsreader && info.inter, `${navn} ${v.navn}: Newsreader og Inter lastet`);
      meld(konsoll.length === 0, `${navn} ${v.navn}: ingen konsollfeil eller 4xx${konsoll.length ? ": " + konsoll.slice(0, 4).join(" | ") : ""}`);
      await page.screenshot({ path: join(ut, `${navn}-${v.navn}.png`), fullPage: true });
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  await hengsel.stopp();
}
console.log(feil ? `\n✗ ${feil} feil` : `\n✓ skjermbilder i ${ut}`);
process.exit(feil ? 1 : 0);
