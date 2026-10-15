#!/usr/bin/env node
/**
 * Kontroll av karusellprikkene på hengsel.no/kunde/apptest og slide-prikkene på vis.hengsel.no/leverandor (apptest-prikker).
 * Serverer de bygde dist-mappene, tar skjermbilder i 390 og 1440 med prikk 1 og prikk 3 valgt, måler trykkflate og farger,
 * og kjører axe (WCAG 2 A/AA). Kjør etter `npm run build`:  node scripts/apptest-prikker-kontroll.mjs
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const UT = join(rot, "docs", "apptest-prikker");
await mkdir(UT, { recursive: true });
const axe = await readFile(join(rot, "node_modules", "axe-core", "axe.min.js"), "utf8");
const typer = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg" };

function server(mappe) {
  return new Promise((ok) => {
    const s = createServer(async (req, res) => {
      const sti = decodeURIComponent(new URL(req.url, "http://x").pathname);
      for (const k of [sti, sti + ".html", join(sti, "index.html")]) {
        try {
          const data = await readFile(join(mappe, k));
          res.writeHead(200, { "content-type": typer[extname(k)] ?? "application/octet-stream" });
          return res.end(data);
        } catch {}
      }
      res.writeHead(404).end("ikke funnet");
    }).listen(0, () => ok(s));
  });
}

let feil = 0;
const meld = (ok, t) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${t}`); };
const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const kontrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);

const hengsel = await server(join(rot, "sites", "hengsel", "dist"));
const vis = await server(join(rot, "sites", "vis", "dist"));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function axeSjekk(page, navn) {
  await page.evaluate(axe);
  const v = await page.evaluate(() => axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }, resultTypes: ["violations"] }).then((r) => r.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(" ")).join(" | ")}`)));
  meld(v.length === 0, `axe ${navn}: ${v.length ? v.join("; ") : "ingen brudd"}`);
}

for (const [b, w, h] of [["390", 390, 844], ["1440", 1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${hengsel.address().port}/kunde/apptest`, { waitUntil: "load" });
  await page.waitForSelector("html.js .prikk");
  const bakgrunn = await page.evaluate(() => getComputedStyle(document.querySelector(".prikker").closest(".a-side")).backgroundColor);
  for (const n of [0, 2]) {
    await page.click(`.prikk >> nth=${n}`);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => [...document.querySelectorAll(".prikk")].map((p) => {
      const r = p.getBoundingClientRect(), s = p.querySelector("span"), sr = s.getBoundingClientRect();
      return { valgt: p.getAttribute("aria-selected"), w: r.width, h: r.height, sw: sr.width, sh: sr.height, bg: getComputedStyle(s).backgroundColor };
    }));
    m.forEach((p, k) => {
      const ok = p.w >= 24 && p.h >= 24 && kontrast(rgb(p.bg), rgb(bakgrunn)) >= 3 && (p.valgt === "true") === (k === n);
      meld(ok, `${b}px, prikk ${n + 1} valgt: prikk ${k + 1} knapp ${p.w}×${p.h}, prikk ${p.sw}×${p.sh}, ${p.bg} mot ${bakgrunn} = ${kontrast(rgb(p.bg), rgb(bakgrunn)).toFixed(2)}:1${p.valgt === "true" ? " (valgt)" : ""}`);
    });
    await page.locator(".hero-bilder").screenshot({ path: join(UT, `apptest-prikker-${b}-prikk${n + 1}.png`) });
  }
  // fokus og hover
  await page.locator(".prikk >> nth=0").focus();
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);
  const fokus = await page.evaluate(() => { const p = document.activeElement; const c = getComputedStyle(p); return { o: c.outlineStyle + " " + c.outlineWidth + " " + c.outlineColor, s: getComputedStyle(p.querySelector("span")).backgroundColor }; });
  meld(/solid 2px rgb\(5, 128, 111\)/.test(fokus.o), `${b}px fokus: ring ${fokus.o}, prikk ${fokus.s}`);
  await page.locator(".prikk >> nth=3").hover();
  await page.waitForTimeout(300);
  const hov = await page.evaluate(() => getComputedStyle(document.querySelectorAll(".prikk")[3].querySelector("span")).backgroundColor);
  meld(hov === "rgb(104, 110, 117)", `${b}px hover: ${hov} (--tekst-svak)`);
  await page.locator(".hero-bilder").screenshot({ path: join(UT, `apptest-prikker-${b}-fokus.png`) });
  await axeSjekk(page, `/kunde/apptest ${b}`);
  await ctx.close();
}

// vis /leverandor
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${vis.address().port}/leverandor/`, { waitUntil: "load" });
  await page.waitForSelector(".dots button");
  const r = await page.evaluate(() => [...document.querySelectorAll(".dots button")].map((b) => { const bb = b.getBoundingClientRect(), c = getComputedStyle(b, "::before"); return { on: b.classList.contains("on"), w: bb.width, h: bb.height, bg: c.backgroundColor, bw: c.width }; }));
  const bak = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  r.forEach((p, k) => meld(p.w >= 24 && p.h >= 24 && kontrast(rgb(p.bg), rgb(bak)) >= 3, `vis /leverandor prikk ${k + 1}${p.on ? " (valgt)" : ""}: knapp ${p.w}×${p.h}, prikk ${p.bw}, ${p.bg} mot ${bak} = ${kontrast(rgb(p.bg), rgb(bak)).toFixed(2)}:1`));
  await page.locator(".bar").screenshot({ path: join(UT, "vis-leverandor-prikker.png") });
  await axeSjekk(page, "vis /leverandor 1440");
  await ctx.close();
}
await browser.close();
hengsel.close(); vis.close();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
