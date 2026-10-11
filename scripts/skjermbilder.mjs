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

await browser.close();
for (const { s } of Object.values(servere)) s.close();
console.log(`\n${feil} feil.`);
process.exit(feil ? 1 : 0);
