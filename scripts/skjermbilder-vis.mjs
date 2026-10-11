#!/usr/bin/env node
/**
 * Nettlesersjekker og skjermbilder for Visningsrommet (sites/vis, K-110) med Playwright (Chromium).
 *
 *  - Alle sider (og 404) på 390, 1280 og 1440 px, lys og mørk: ingen konsollfeil (CSP fra _headers gjelder),
 *    ingen vannrett rulling, ingen forespørsler til andre verter, og Newsreader og Inter lastes fra /fonts/.
 *  - Skjermbilder av forsiden, /system/, /reise/, /sv/ og 404 på mobil (390) og PC (1440) til docs/skjermbilder/vis-*.png.
 *  - /dokumenter/ (K-161): skjermbilder av oversikten og tre dokumenter (tilbud, kjøpsavtale, monteringsrapport) på 390 og 1280 px, lys og mørk,
 *    til claude/k161-skjermbilder/. Sjekker i tillegg bla med piler og sveip, lazy-lasting av sidene, bredde og høyde på bilder, alt-tekster,
 *    CLS og kontrast (minst 4,5:1, 3:1 for stor tekst) på selve siden.
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

// /dokumenter/ (K-161): skjermbilder, bla med tastatur og sveip, lazy-lasting, CLS, alt-tekster og kontrast
{
  const mappe = join(rot, "claude", "k161-skjermbilder");
  await mkdir(mappe, { recursive: true });
  const kontrollert = (ok, tekst) => {
    if (!ok) feil++;
    console.log(`${ok ? "✓" : "✗"} /dokumenter/: ${tekst}`);
  };
  const dokumenter = [["oversikt", ""], ["tilbud", "#tilbud"], ["kjopsavtale", "#kjopsavtale"], ["montering", "#montering"]];
  for (const [w, mobil] of [[390, true], [1280, false]]) {
    for (const modus of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: mobil ? 844 : 800 }, deviceScaleFactor: mobil ? 2 : 1, isMobile: mobil, hasTouch: mobil, colorScheme: modus, reducedMotion: "reduce" });
      const side = await ctx.newPage();
      const konsoll = [];
      side.on("console", (m) => m.type() === "error" && konsoll.push(m.text()));
      side.on("pageerror", (e) => konsoll.push(e.message));
      await side.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: "layout-shift", buffered: true });
      });
      const navn = `${w}, ${modus === "light" ? "lys" : "mørk"}`;
      for (const [id, hash] of dokumenter) {
        await side.goto(`${base}/dokumenter/${hash}`, { waitUntil: "networkidle" });
        await side.evaluate(() => document.fonts.ready);
        if (hash) {
          const synlig = await side.evaluate(() => [...document.querySelectorAll("[data-panel]")].filter((p) => p.checkVisibility()).map((p) => p.dataset.panel));
          kontrollert(synlig.length === 1 && synlig[0] === id, `${navn}: ${hash} viser bare dokumentet «${id}» (synlig: ${synlig.join(", ") || "ingen"})`);
        }
        if (id === "oversikt") {
          // Lazy-lasting: bare første dokument ligger i DOM-en, og bare første side har lastet bilde
          const n = await side.evaluate(() => ({ ark: document.querySelectorAll(".a4").length, sider: document.querySelectorAll("[data-panel]:not([hidden]) [data-side]").length, template: document.querySelectorAll("[data-panel] > template").length }));
          kontrollert(n.template === 8 && n.ark === n.sider, `${navn}: bare første dokument i DOM (${n.ark} A4-sider, 8 dokumenter i <template>)`);
          // Alle bilder har bredde og høyde, alle bilder har alt, ingen tomme knapper uten navn
          const bm = await side.evaluate(() => ({
            utenMal: [...document.images].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).map((i) => i.src),
            utenAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src),
            knapperUtenNavn: [...document.querySelectorAll("button")].filter((b) => !(b.textContent.trim() || b.getAttribute("aria-label"))).length,
          }));
          kontrollert(!bm.utenMal.length && !bm.utenAlt.length && !bm.knapperUtenNavn, `${navn}: bilder har bredde, høyde og alt (${bm.utenMal.length + bm.utenAlt.length} avvik), knapper har navn (${bm.knapperUtenNavn} uten)`);
          // Tastatur: → på arket blar; Home/End i fanelisten; sveip på telefon
          const teller = side.locator("[data-panel]:not([hidden]) [data-teller]");
          await side.locator("[data-panel]:not([hidden]) [data-ark]").focus();
          await side.keyboard.press("ArrowRight");
          const etter = await teller.textContent();
          await side.keyboard.press("ArrowLeft");
          kontrollert(/^Side 2 av/.test(etter) && /^Side 1 av/.test(await teller.textContent()), `${navn}: ← og → blar («${etter}» og tilbake)`);
          if (mobil) {
            await side.evaluate(() => {
              const ark = document.querySelector("[data-panel]:not([hidden]) [data-ark]");
              const t = (type, x) => ark.dispatchEvent(new TouchEvent(type, { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: ark, clientX: x, clientY: 300 })], touches: type === "touchend" ? [] : [new Touch({ identifier: 1, target: ark, clientX: x, clientY: 300 })] }));
              t("touchstart", 300); t("touchend", 120);
            });
            kontrollert(/^Side 2 av/.test(await teller.textContent()), `${navn}: sveip til venstre går til side 2`);
            await side.keyboard.press("ArrowLeft");
          }
          // Lysboks: åpnes fra knappen, viser arket, → blar, Esc lukker og fokus går tilbake til knappen
          const lysKnapp = side.locator("[data-panel]:not([hidden]) .dv-lys-knapp");
          await lysKnapp.click();
          const apen = await side.evaluate(() => ({ open: document.querySelector("dialog.lys").open, ark: document.querySelectorAll("dialog.lys .a4").length }));
          await side.keyboard.press("ArrowRight");
          const lysTeller = await side.locator("[data-lys-teller]").textContent();
          await side.keyboard.press("Escape");
          const lukket = await side.evaluate(() => ({ open: document.querySelector("dialog.lys").open, fokus: document.activeElement?.className }));
          kontrollert(apen.open && apen.ark === 1 && /^Side 2 av/.test(lysTeller) && !lukket.open && /dv-lys-knapp/.test(lukket.fokus), `${navn}: lysboks åpner, blar («${lysTeller}»), Esc lukker og fokus går tilbake`);
          // Kontrast på siden (A4-papiret og bildene utenom): tekst minst 4,5:1, stor tekst 3:1
          const lavt = await side.evaluate(() => {
            const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
            const rgba = (s) => { const m = s.match(/[\d.]+/g).map(Number); return { c: m.slice(0, 3), a: m[3] ?? 1 }; };
            const bakgrunn = (el) => {
              let lag = [];
              for (let e = el; e; e = e.parentElement) { const b = rgba(getComputedStyle(e).backgroundColor); if (b.a > 0) { lag.push(b); if (b.a === 1) break; } }
              let c = [255, 255, 255];
              for (const b of lag.reverse()) c = c.map((v, i) => v * (1 - b.a) + b.c[i] * b.a);
              return c;
            };
            const ut = [];
            for (const el of document.querySelectorAll("body *")) {
              if (el.closest(".a4, dialog, [hidden], template") || getComputedStyle(el).visibility === "hidden") continue;
              const harTekst = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
              if (!harTekst) continue;
              const cs = getComputedStyle(el);
              const f = rgba(cs.color); const bg = bakgrunn(el);
              const fg = f.c.map((v, i) => v * f.a + bg[i] * (1 - f.a));
              const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
              const k = (a + 0.05) / (b + 0.05);
              const stor = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
              const disabled = el.closest("button:disabled");
              if (!disabled && k < (stor ? 3 : 4.5)) ut.push(`${el.tagName.toLowerCase()}.${el.className} «${el.textContent.trim().slice(0, 30)}» ${k.toFixed(2)}`);
            }
            return ut;
          });
          kontrollert(!lavt.length, `${navn}: kontrast minst 4,5:1${lavt.length ? ` (${[...new Set(lavt)].slice(0, 6).join("; ")})` : ""}`);
        }
        // Rull gjennom siden så de lazy bildene lastes, og ta skjermbilde av hele siden
        const h = await side.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 600) { await side.evaluate((y) => scrollTo(0, y), y); await side.waitForTimeout(120); }
        await side.waitForLoadState("networkidle");
        await side.evaluate(() => scrollTo(0, 0));
        await side.screenshot({ path: join(mappe, `dokumenter-${id}-${w}-${modus === "light" ? "lys" : "mork"}.png`), fullPage: true });
      }
      const cls = await side.evaluate(() => window.__cls);
      const sw = await side.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      kontrollert(cls < 0.02 && !konsoll.length && sw[0] <= sw[1], `${navn}: CLS ${cls.toFixed(3)}, konsollfeil ${konsoll.length}, bredde ${sw[0]}/${sw[1]}${konsoll.length ? ` (${konsoll.join(" | ")})` : ""}`);
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
console.log(`\n${alle.length} sider × ${visninger.length * 2} visninger, ${feil} feil.`);
process.exit(feil ? 1 : 0);
