#!/usr/bin/env node
/**
 * Kontroll av bildeprikkene på hengsel.no/kunde/apptest (og samme mønster i vis.hengsel.no/leverandor/):
 * serverer de bygde mappene, tar skjermbilder i 390 og 1440 med prikk 1 og prikk 3 valgt, måler kontrast (ikke
 * valgt mot flaten, valgt mot flaten) og trykkflate (minst 24 × 24 px), fokusring og axe (WCAG 2 A/AA).
 * Kjør etter `npm run build`:  node scripts/skjermbilder-prikker.mjs
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, join, resolve, normalize } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "docs", "apptest-prikker");
await mkdir(ut, { recursive: true });
const axe = await readFile(join(rot, "node_modules", "axe-core", "axe.min.js"), "utf8");

const TYPER = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".avif": "image/avif", ".jpg": "image/jpeg" };
function server(mappe) {
  return new Promise((ok) => {
    const s = createServer(async (req, res) => {
      let sti = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
      const kandidater = [join(mappe, sti), join(mappe, sti.replace(/\/$/, "") + ".html"), join(mappe, sti, "index.html")];
      for (const k of kandidater) {
        try {
          const data = await readFile(k);
          res.writeHead(200, { "content-type": TYPER[extname(k)] ?? "application/octet-stream" });
          return res.end(data);
        } catch {}
      }
      res.writeHead(404).end("nei");
    }).listen(0, () => ok({ s, url: `http://localhost:${s.address().port}` }));
  });
}
const hengsel = await server(join(rot, "sites", "hengsel", "dist"));
const vis = await server(join(rot, "sites", "vis", "dist"));

const lum = (c) => {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const kontrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, tekst) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${tekst}`); };
const rad = [];


async function maal(page, knapp, prikkVelger) {
  return page.evaluate(([k, v]) => {
    const les = (c) => { const x = document.createElement("canvas").getContext("2d"); x.fillStyle = "#000"; x.fillStyle = c; x.fillRect(0, 0, 1, 1); return Array.from(x.getImageData(0, 0, 1, 1).data).slice(0, 3); };
    const flate = (el) => { for (let e = el; e; e = e.parentElement) { const b = getComputedStyle(e).backgroundColor; if (b && b !== "rgba(0, 0, 0, 0)" && b !== "transparent") return b; } return "rgb(255, 255, 255)"; };
    const knapper = Array.from(document.querySelectorAll(k));
    return knapper.map((kn) => {
      const boks = kn.getBoundingClientRect();
      const el = v === "::before" ? kn : kn.querySelector(v);
      const cs = v === "::before" ? getComputedStyle(kn, "::before") : getComputedStyle(el);
      return { bredde: boks.width, hoyde: boks.height, prikkBredde: parseFloat(cs.width), prikkHoyde: parseFloat(cs.height), bg: les(cs.backgroundColor), flate: les(flate(kn)), valgt: kn.getAttribute("aria-selected") === "true" || kn.classList.contains("on") };
    });
  }, [knapp, prikkVelger]);
}

async function sjekkAxe(page, navn) {
  await page.evaluate(axe);
  const brudd = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`));
  meld(brudd.length === 0, `${navn}: axe uten brudd${brudd.length ? " (" + brudd.join("; ") + ")" : ""}`);
}

const visninger = [
  { navn: "390", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { navn: "1440", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
];

for (const v of visninger) {
  const ctx = await browser.newContext({ ...v, reducedMotion: "reduce", colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(`${hengsel.url}/kunde/apptest`, { waitUntil: "networkidle" });
  const rader = await maal(page, ".prikk", "span");
  const ikkeValgt = rader.find((r) => !r.valgt);
  const valgt = rader.find((r) => r.valgt);
  meld(rader.length === 4, `apptest ${v.navn}: fire prikker`);
  meld(rader.every((r) => r.bredde >= 24 && r.hoyde >= 24), `apptest ${v.navn}: trykkflate ${rader.map((r) => `${r.bredde}×${r.hoyde}`).join(", ")} (minst 24 × 24)`);
  const kIkke = kontrast(ikkeValgt.bg, ikkeValgt.flate);
  const kValgt = kontrast(valgt.bg, valgt.flate);
  meld(kIkke >= 3, `apptest ${v.navn}: ikke valgt ${kIkke.toFixed(2)}:1 mot flaten (minst 3:1)`);
  meld(kValgt >= 3, `apptest ${v.navn}: valgt ${kValgt.toFixed(2)}:1 mot flaten (minst 3:1)`);
  meld(valgt.prikkBredde > ikkeValgt.prikkBredde, `apptest ${v.navn}: valgt prikk ${valgt.prikkBredde}×${valgt.prikkHoyde}, ikke valgt ${ikkeValgt.prikkBredde}×${ikkeValgt.prikkHoyde}`);
  rad.push(`| /kunde/apptest ${v.navn} | ${ikkeValgt.prikkBredde}×${ikkeValgt.prikkHoyde} | ${valgt.prikkBredde}×${valgt.prikkHoyde} | ${rader[0].bredde}×${rader[0].hoyde} | ${kIkke.toFixed(2)}:1 | ${kValgt.toFixed(2)}:1 |`);

  // Fokusring (tastatur)
  await page.focus(".prikk");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(150);
  const ring = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return { el: document.activeElement.outerHTML.slice(0, 80), stil: cs.outlineStyle, bredde: cs.outlineWidth, farge: cs.outlineColor }; });
  meld(ring.stil === "solid" && parseFloat(ring.bredde) >= 2, `apptest ${v.navn}: fokusring (${ring.el}) ${ring.bredde} ${ring.stil} ${ring.farge}`);

  for (const n of [1, 3]) {
    await page.click(`.prikk:nth-child(${n})`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.waitForTimeout(500);
    await page.locator(".hero-bilder").screenshot({ path: join(ut, `apptest-${v.navn}-prikk${n}.png`) });
  }
  await page.goto(`${hengsel.url}/kunde/apptest`, { waitUntil: "networkidle" });
  await sjekkAxe(page, `apptest ${v.navn}`);
  await ctx.close();
}

// vis.hengsel.no/leverandor: samme mønster, bare synlig over 820 px
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(`${vis.url}/leverandor/`, { waitUntil: "networkidle" });
  const rader = await maal(page, ".dots button", "::before");
  const ikkeValgt = rader.find((r) => !r.valgt);
  const valgt = rader.find((r) => r.valgt);
  meld(rader.length > 3, `vis leverandor 1440: ${rader.length} prikker`);
  meld(rader.every((r) => r.bredde >= 24 && r.hoyde >= 24), `vis leverandor 1440: trykkflate ${rader[0].bredde}×${rader[0].hoyde} (minst 24 × 24)`);
  const kIkke = kontrast(ikkeValgt.bg, ikkeValgt.flate);
  const kValgt = kontrast(valgt.bg, valgt.flate);
  meld(kIkke >= 3, `vis leverandor 1440: ikke valgt ${kIkke.toFixed(2)}:1 mot flaten (minst 3:1)`);
  meld(kValgt >= 3, `vis leverandor 1440: valgt ${kValgt.toFixed(2)}:1 mot flaten (minst 3:1)`);
  rad.push(`| vis /leverandor 1440 | ${ikkeValgt.prikkBredde}×${ikkeValgt.prikkHoyde} | ${valgt.prikkBredde}×${valgt.prikkHoyde} | ${rader[0].bredde}×${rader[0].hoyde} | ${kIkke.toFixed(2)}:1 | ${kValgt.toFixed(2)}:1 |`);
  await page.locator(".bar").screenshot({ path: join(ut, "vis-leverandor-1440.png") });
  await sjekkAxe(page, "vis leverandor 1440");
  await ctx.close();
}

console.log("\n| Side | Prikk (ikke valgt) | Prikk (valgt) | Trykkflate | Kontrast ikke valgt | Kontrast valgt |\n|---|---|---|---|---|---|\n" + rad.join("\n"));
await browser.close();
hengsel.s.close();
vis.s.close();
process.exit(feil ? 1 : 0);
