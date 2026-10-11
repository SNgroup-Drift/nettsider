#!/usr/bin/env node
/**
 * Skjermbilder og nettlesersjekker med Playwright (Chromium).
 *
 *  - Skjermbilder av sngroup.no (/, /personvern, /design og 404) og hengsel.no (/, /personvern og 404) på desktop og mobil, lys og mørk,
 *    og byggem.no (/, /prosjekter, /kontakt, /personvern og 404) til docs/skjermbilder/ (filene starter med «hengsel-» og «byggem-»).
 *  - Alle sider på alle nettsteder: ingen vannrett rulling ved 360 px, ingen konsollfeil (CSP fra _headers gjelder).
 *  - Plantegningen: et klikk på et rom bytter tekst og åpner riktig rad.
 *  - hengsel.no 2.0 (K-160): de åtte sidene på 390 og 1440 px, lys og mørk, til claude/k160-skjermbilder/; på hver side: ingen konsollfeil, ingen style-attributter eller inline-skript, bilder med width/height, bare Newsreader og Inter, ingen eksterne forespørsler, ingenting lagres.
 *  - Hvilke skrifter som faktisk lastes.
 *
 * Kjør etter `npm run build`: npm run skjermbilder
 * Chromium: PLAYWRIGHT_BROWSERS_PATH, eller CHROMIUM_PATH for en bestemt fil.
 */
import { chromium } from "playwright";
import { mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "docs", "skjermbilder");
await mkdir(ut, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, tekst) => {
  if (!ok) feil++;
  console.log(`${ok ? "✓" : "✗"} ${tekst}`);
};

// De åtte sidene på hengsel.no 2.0 (K-160)
const HENGSEL_SIDER = [
  { sti: "/", fil: "forside" }, { sti: "/crm", fil: "crm" }, { sti: "/ute", fil: "ute" }, { sti: "/kundeportal", fil: "kundeportal" },
  { sti: "/slik-virker-det", fil: "slik-virker-det" }, { sti: "/dokumenter", fil: "dokumenter" }, { sti: "/integrasjoner", fil: "integrasjoner" },
  { sti: "/priser-og-demo", fil: "priser-og-demo" },
];
const servere = {};
for (const navn of await readdir(join(rot, "sites"))) {
  const s = await startServer(join(rot, "sites", navn, "dist"));
  servere[navn] = { s, base: `http://127.0.0.1:${s.address().port}` };
}

// 1. Skjermbilder av sngroup.no
const visninger = [
  { navn: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { navn: "mobil", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];
for (const side of [{ sti: "/", fil: "forside" }, { sti: "/personvern", fil: "personvern" }, { sti: "/design", fil: "design" }, { sti: "/finnes-ikke", fil: "404" }]) {
  for (const v of visninger) {
    for (const modus of ["light", "dark"]) {
      const ctx = await browser.newContext({ ...v, colorScheme: modus, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(servere.sngroup.base + side.sti, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const fil = `${side.fil}-${v.navn}-${modus === "light" ? "lys" : "mork"}.png`;
      await page.screenshot({ path: join(ut, fil), fullPage: true });
      console.log(`  bilde: docs/skjermbilder/${fil}`);
      await ctx.close();
    }
  }
}

// 1b. Skjermbilder av hengsel.no og byggem.no (filene starter med «hengsel-» og «byggem-»)
const andreSider = [
  ...[{ sti: "/", fil: "forside" }, { sti: "/prosjekter", fil: "prosjekter" }, { sti: "/kontakt", fil: "kontakt" }, { sti: "/personvern", fil: "personvern" }, { sti: "/finnes-ikke", fil: "404" }].map((s) => ({ ...s, nett: "byggem" })),
];
for (const side of andreSider) {
  for (const v of visninger) {
    for (const modus of ["light", "dark"]) {
      const ctx = await browser.newContext({ ...v, colorScheme: modus, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(servere[side.nett].base + side.sti, { waitUntil: "networkidle" });
      // Skjermbildene (loading="lazy") skal være lastet før helsidebildet: sett dem til eager, rull gjennom siden og vent til alle er ferdige
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; i.decoding = "sync"; });
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
      });
      await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 });
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      await page.evaluate(() => document.fonts.ready);
      const fil = `${side.nett}-${side.fil}-${v.navn}-${modus === "light" ? "lys" : "mork"}.png`;
      await page.screenshot({ path: join(ut, fil), fullPage: true });
      console.log(`  bilde: docs/skjermbilder/${fil}`);
      await ctx.close();
    }
  }
}

// 1c. hengsel.no 2.0 (K-160): de åtte sidene på 390 og 1440 px, lys og mørk, til claude/k160-skjermbilder/
const hengselUt = join(rot, "claude", "k160-skjermbilder");
await mkdir(hengselUt, { recursive: true });
for (const side of [...HENGSEL_SIDER, { sti: "/personvern", fil: "personvern" }, { sti: "/finnes-ikke", fil: "404" }]) {
  for (const [bredde, dsf] of [[390, 2], [1440, 1]]) {
    for (const modus of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, deviceScaleFactor: dsf, isMobile: bredde === 390, hasTouch: bredde === 390, colorScheme: modus, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(servere.hengsel.base + side.sti, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; i.decoding = "sync"; });
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
      });
      await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 });
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(600);
      await page.evaluate(() => document.fonts.ready);
      const fil = `${side.fil}-${bredde}-${modus === "light" ? "lys" : "mork"}.png`;
      await page.screenshot({ path: join(hengselUt, fil), fullPage: true });
      console.log(`  bilde: claude/k160-skjermbilder/${fil}`);
      await ctx.close();
    }
  }
}

// 1d. hengsel.no/apptest og passordsiden (K-172): 390 og 1440 px, lys og mørk, til claude/k172-skjermbilder/
const apptestUt = join(rot, "claude", "k172-skjermbilder");
await mkdir(apptestUt, { recursive: true });
for (const side of [{ sti: "/apptest", fil: "apptest" }, { sti: "/apptest/passord", fil: "apptest-passord" }]) {
  for (const [bredde, dsf] of [[390, 2], [1440, 1]]) {
    for (const modus of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, deviceScaleFactor: dsf, isMobile: bredde === 390, hasTouch: bredde === 390, colorScheme: modus, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(servere.hengsel.base + side.sti, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; i.decoding = "sync"; });
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
      });
      await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 });
      await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(600);
      await page.evaluate(() => document.fonts.ready);
      const fil = `${side.fil}-${bredde}-${modus === "light" ? "lys" : "mork"}.png`;
      await page.screenshot({ path: join(apptestUt, fil), fullPage: true });
      console.log(`  bilde: claude/k172-skjermbilder/${fil}`);
      await ctx.close();
    }
  }
}

// 2. 360 px uten vannrett rulling, og ingen konsollfeil, på alle sider
for (const [navn, { base }] of Object.entries(servere)) {
  if (navn === "vis") continue; // Visningsrommet har egne sjekker på 390 og 1280 px: scripts/skjermbilder-vis.mjs
  const sider = navn === "sngroup" ? ["/", "/personvern", "/design", "/404"] : navn === "byggem" ? ["/", "/prosjekter", "/kontakt", "/personvern", "/404"] : navn === "hengsel" ? [...HENGSEL_SIDER.map((x) => x.sti), "/personvern", "/404", "/apptest", "/apptest/passord"] : ["/", "/personvern", "/404"];
  for (const sti of sider) {
    for (const modus of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, colorScheme: modus, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      const konsoll = [];
      page.on("console", (m) => m.type() === "error" && konsoll.push(m.text()));
      page.on("pageerror", (e) => konsoll.push(e.message));
      await page.goto(base + sti, { waitUntil: "networkidle" });
      // body har overflow-x: clip, så vi ser også etter elementer som stikker ut (de ville blitt klippet)
      const { sw, cw, utenfor } = await page.evaluate(() => {
        const cw = document.documentElement.clientWidth;
        // Elementer inne i en egen rulleboks (overflow-x: auto/scroll, f.eks. stegrekka på hengsel.no) er med vilje bredere
        const iRulleboks = (el) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            if (/(auto|scroll)/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= cw + 1) return true;
          }
          return false;
        };
        const utenfor = [...document.body.querySelectorAll("*")]
          .filter((el) => !el.closest(".visually-hidden, .skip, .tabell") && el.getBoundingClientRect().right > cw + 1 && !iRulleboks(el))
          .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`);
        return { sw: document.documentElement.scrollWidth, cw, utenfor: [...new Set(utenfor)].slice(0, 5) };
      });
      const ok = sw <= cw && utenfor.length === 0 && konsoll.length === 0;
      meld(ok, `${navn}${sti} (${modus}, 360 px): bredde ${sw}/${cw}${utenfor.length ? `, stikker ut: ${utenfor.join(", ")}` : ""}${konsoll.length ? `, konsoll: ${konsoll.join(" | ")}` : ""}`);
      await ctx.close();
    }
  }
}

// 3. Plantegningen og raden henger sammen
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(servere.sngroup.base + "/", { waitUntil: "networkidle" });
  for (const id of ["hengsel", "byggem", "eiendom", "investeringer", "kjokken"]) {
    await page.click(`[data-sone="${id}"]`);
    const r = await page.evaluate((id) => ({
      info: !document.querySelector(`[data-info="${id}"]`).hidden,
      rad: document.querySelector(`#rad-${id}`).open,
      chip: document.querySelector(`[data-chip="${id}"]`).getAttribute("aria-pressed"),
    }), id);
    meld(r.info && r.rad && r.chip === "true", `plantegning: ${id} viser tekst, åpner rad og velger chip`);
  }
  await page.keyboard.press("Tab");
  await page.click('[data-chip="byggem"]');
  meld(await page.evaluate(() => document.querySelector('[data-sone="byggem"]').getAttribute("aria-pressed") === "true"), "chip velger rom");

  // 4. Skrifter som faktisk lastes
  await page.goto(servere.sngroup.base + "/", { waitUntil: "networkidle" });
  const skrifter = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.style} ${f.weight}`);
  });
  console.log(`\nSkrifter lastet på forsiden: ${[...new Set(skrifter)].join("; ")}`);
  const filer = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".woff2")).map((r) => r.name.split("/").pop()));
  console.log(`Skriftfiler hentet: ${filer.join(", ")}`);
  const eksterne = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => !r.name.startsWith(location.origin)).map((r) => r.name));
  meld(eksterne.length === 0, `ingen eksterne forespørsler${eksterne.length ? `: ${eksterne.join(", ")}` : ""}`);
  meld((await ctx.cookies()).length === 0, "ingen informasjonskapsler");
  await ctx.close();
}

// 5. hengsel.no 2.0: skrifter, eksterne forespørsler, lagring, bildemål og CSP-regler på alle åtte sidene
{
  const base = servere.hengsel.base;
  for (const side of HENGSEL_SIDER) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const konsoll = [];
    page.on("console", (m) => m.type() === "error" && konsoll.push(m.text()));
    page.on("pageerror", (e) => konsoll.push(e.message));
    await page.goto(base + side.sti, { waitUntil: "networkidle" });
    const kilde = await (await fetch(base + side.sti)).text();
    meld(!/\sstyle="/.test(kilde), `hengsel${side.sti}: ingen style-attributter i HTML (CSP style-src)`);
    meld(!/<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>/.test(kilde), `hengsel${side.sti}: ingen inline-skript`);
    meld(konsoll.length === 0, `hengsel${side.sti}: ingen konsollfeil (CSP gjelder)${konsoll.length ? `: ${konsoll.join(" | ")}` : ""}`);
    const mal = await page.evaluate(() => [...document.images].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).map((i) => i.getAttribute("src")));
    meld(mal.length === 0, `hengsel${side.sti}: alle bilder har width og height${mal.length ? `: ${mal.join(", ")}` : ""}`);
    const skrifter = await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")))]; });
    meld(skrifter.every((f) => /Newsreader|Inter/.test(f)), `hengsel${side.sti}: bare Newsreader og Inter lastet (${skrifter.join(", ")})`);
    const eksterne = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => !r.name.startsWith(location.origin)).map((r) => r.name));
    meld(eksterne.length === 0, `hengsel${side.sti}: ingen eksterne forespørsler${eksterne.length ? `: ${eksterne.join(", ")}` : ""}`);
    const lagret = await page.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage)));
    meld(lagret.length === 0 && (await ctx.cookies()).length === 0, `hengsel${side.sti}: ingenting lagres (localStorage, informasjonskapsler)`);
    await ctx.close();
  }
}

// 6. hengsel.no/apptest (K-172): CSP-regler, skrifter, eksterne forespørsler, CLS, kontrast, vannrett rulling, uten skript og telefongjenkjenning
{
  const base = servere.hengsel.base;
  for (const sti of ["/apptest", "/apptest/passord"]) {
    for (const modus of ["light", "dark"]) {
      for (const bredde of [390, 1440]) {
        const ctx = await browser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, isMobile: bredde === 390, hasTouch: bredde === 390, colorScheme: modus });
        const page = await ctx.newPage();
        const konsoll = [];
        page.on("console", (m) => m.type() === "error" && konsoll.push(m.text()));
        page.on("pageerror", (e) => konsoll.push(e.message));
        await page.addInitScript(() => {
          window.__cls = 0;
          new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
        });
        await page.goto(base + sti, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
        const etikett = `hengsel${sti} (${modus}, ${bredde} px)`;
        const kilde = await (await fetch(base + sti)).text();
        meld(!/\sstyle="/.test(kilde), `${etikett}: ingen style-attributter i HTML`);
        meld(!/<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>/.test(kilde), `${etikett}: ingen inline-skript`);
        meld(konsoll.length === 0, `${etikett}: ingen konsollfeil${konsoll.length ? `: ${konsoll.join(" | ")}` : ""}`);
        const skrifter = await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")))]; });
        meld(skrifter.every((f) => /Newsreader|Inter/.test(f)), `${etikett}: bare Newsreader og Inter lastet (${skrifter.join(", ")})`);
        const eksterne = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => !r.name.startsWith(location.origin)).map((r) => r.name));
        meld(eksterne.length === 0, `${etikett}: ingen eksterne forespørsler`);
        const bredder = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        meld(bredder[0] <= bredder[1], `${etikett}: ingen vannrett rulling (${bredder[0]}/${bredder[1]})`);
        const cls = await page.evaluate(() => window.__cls);
        meld(cls === 0, `${etikett}: CLS ${cls}`);
        // Kontrast: tekst mot nærmeste bakgrunn som ikke er gjennomsiktig, minst 4,5:1 (3:1 for tekst fra 24 px, eller 18,66 px og fet)
        const lav = await page.evaluate(() => {
          const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
          const les = (c) => { const m = c.match(/[\d.]+/g)?.map(Number); return m ? { rgb: m.slice(0, 3), a: m[3] ?? 1 } : null; };
          const bg = (el) => { for (let e = el; e; e = e.parentElement) { const c = les(getComputedStyle(e).backgroundColor); if (c && c.a > 0.95) return c.rgb; } return [255, 255, 255]; };
          const ut = [];
          for (const el of document.body.querySelectorAll("*")) {
            if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || cs.visibility === "hidden" || cs.display === "none" || el.closest(".skjult, [hidden], .skip")) continue;
            if (Number(cs.opacity) < 1) continue;
            const f = les(cs.color);
            const a = lum(f.rgb), b = lum(bg(el));
            const k = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            const px = parseFloat(cs.fontSize), fet = Number(cs.fontWeight) >= 700;
            const krav = px >= 24 || (px >= 18.66 && fet) ? 3 : 4.5;
            if (k < krav) ut.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")} «${el.textContent.trim().slice(0, 24)}» ${k.toFixed(2)}`);
          }
          return ut.slice(0, 6);
        });
        meld(lav.length === 0, `${etikett}: kontrast minst 4,5:1${lav.length ? `: ${lav.join(" | ")}` : ""}`);
        await ctx.close();
      }
    }
  }
  // Uten skript: bildet står stille, alle tre veiene vises, rollene byttes med radioknapper
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(base + "/apptest", { waitUntil: "load" });
    const veier = await page.locator("[data-vei]").evaluateAll((l) => l.filter((e) => e.getBoundingClientRect().height > 0).length);
    meld(veier === 3, `hengsel/apptest uten skript: alle tre installeringsveiene vises (${veier})`);
    await page.locator('label[for="rolle-utkjorer"]').click();
    meld(await page.locator('[data-rolle="utkjorer"]').isVisible(), "hengsel/apptest uten skript: rollene byttes uten skript");
    meld((await page.locator("[data-fremdrift]").textContent()).trim() === "0 av 8", "hengsel/apptest uten skript: sjekklista står på 0 av 8");
    await ctx.close();
  }
  // Telefongjenkjenning, sjekkliste i localStorage, kopier og bildeveksling
  const UA = {
    iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
  };
  for (const [navn, ua, forventet] of [["iPhone", UA.iphone, "iphone"], ["Android", UA.android, "android"]]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: ua });
    const page = await ctx.newPage();
    await page.goto(base + "/apptest", { waitUntil: "networkidle" });
    const synlig = await page.locator("[data-vei]").evaluateAll((l) => l.filter((e) => e.getBoundingClientRect().height > 0).map((e) => e.dataset.vei));
    meld(synlig.length === 1 && synlig[0] === forventet, `hengsel/apptest: ${navn} viser én vei (${synlig.join(", ")}), de andre bak «Andre telefoner»`);
    await page.click("[data-andre]");
    meld((await page.locator("[data-vei]").evaluateAll((l) => l.filter((e) => e.getBoundingClientRect().height > 0).length)) === 3, `hengsel/apptest: «Andre telefoner» viser de to andre veiene (${navn})`);
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base + "/apptest", { waitUntil: "networkidle" });
    meld((await page.locator(".qr svg path").getAttribute("d"))?.length > 100 && (await page.locator(".qr").isVisible()), "hengsel/apptest: PC viser QR-koden (SVG laget ved bygging)");
    await page.locator("label.sjekk-punkt").nth(0).click();
    await page.locator("label.sjekk-punkt").nth(3).click();
    meld((await page.locator("[data-fremdrift]").textContent()).trim() === "2 av 8", "hengsel/apptest: avkrysning gir «2 av 8»");
    const lagret = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    meld(Object.keys(lagret).length === 1 && Object.keys(lagret)[0].startsWith("hengsel-apptest-sjekk-") && lagret[Object.keys(lagret)[0]] === "[0,3]", `hengsel/apptest: sjekklista lagres under ${Object.keys(lagret)[0]}`);
    await page.reload({ waitUntil: "networkidle" });
    meld((await page.locator("[data-fremdrift]").textContent()).trim() === "2 av 8", "hengsel/apptest: avkrysningene huskes etter ny innlasting");
    // Bildeveksling: prikken bytter bilde
    await page.locator("[data-prikk]").nth(2).click();
    meld(await page.locator("[data-slide]").nth(2).evaluate((e) => e.classList.contains("on")), "hengsel/apptest: prikkene bytter bilde");
    await ctx.close();
  }
}

await browser.close();
for (const { s } of Object.values(servere)) s.close();
console.log(`\n${feil} feil.`);
process.exit(feil ? 1 : 0);
