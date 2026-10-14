#!/usr/bin/env node
/**
 * K-229 tillegg 1: skjermbilder (390 og 1280 px) av Visningsrommets forside og de nye menysidene, i Hengsel-utgaven (vis) og Sigdal-utgaven (/sigdal/vis/).
 * Statisk server fra dist (uten Worker og Access). Kjør `npm run build` først. Resultat: claude/k229-skjermbilder/*.png
 *   node scripts/skjermbilder-vis-sider.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "k229-skjermbilder");
await mkdir(ut, { recursive: true });
const UTGAVER = [
  { navn: "vis", dist: join(rot, "sites", "vis", "dist"), base: "", sider: [["forside", "/"], ["forsta", "/forsta/"], ["prov", "/prov/"], ["dokumenter", "/dokumenter/"], ["presenter", "/presenter/"]] },
  { navn: "sigdal", dist: join(rot, "sites", "hengsel", "dist"), base: "/sigdal/vis", sider: [["forside", "/sigdal/vis/"], ["forsta", "/sigdal/vis/forsta/"], ["presenter", "/sigdal/vis/presenter/"]] },
];
const visninger = [{ navn: "390", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { navn: "1280", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }];
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, t) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${t}`); };
try {
  for (const u of UTGAVER) {
    const server = await startServer(u.dist);
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const v of visninger) {
      for (const [navn, sti] of u.sider) {
        const ctx = await browser.newContext({ ...v, colorScheme: "light", reducedMotion: "reduce" });
        const page = await ctx.newPage();
        const konsoll = [];
        // Rommene har inline stil og får egen CSP av Workeren; den statiske serveren gir den strenge CSP-en, så den meldingen er forventet
        page.on("console", (m) => { if (m.type() === "error" && !/inline style because it violates/.test(m.text())) konsoll.push(m.text()); });
        page.on("pageerror", (e) => konsoll.push(String(e)));
        page.on("response", (r) => { if (r.status() >= 400) konsoll.push(`${r.status()} ${r.url()}`); });
        await page.goto(base + sti, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const bredde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        const h1 = await page.evaluate(() => document.querySelectorAll("h1").length);
        meld(bredde <= 0, `${u.navn} ${navn} ${v.navn}: ingen vannrett rulling`);
        meld(h1 === 1, `${u.navn} ${navn} ${v.navn}: én h1 (${h1})`);
        meld(konsoll.length === 0, `${u.navn} ${navn} ${v.navn}: ingen konsollfeil eller 4xx${konsoll.length ? ": " + konsoll.slice(0, 3).join(" | ") : ""}`);
        await page.screenshot({ path: join(ut, `${u.navn}-${navn}-${v.navn}.png`), fullPage: true });
        await ctx.close();
      }
    }
    server.close();
  }
} finally { await browser.close(); }
if (feil) { console.error(`${feil} sjekker feilet`); process.exit(1); }
