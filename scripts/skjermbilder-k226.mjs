#!/usr/bin/env node
/**
 * K-226: skjermbilder (390 og 1280 px, hele siden) og nettlesersjekker av hengsel.no/hjelp. Krever `npm run build` (leser sites/hengsel/dist) og Chromium.
 *
 *   node scripts/skjermbilder-k226.mjs
 *
 * Access-sjekken omgås bare her, i testmodus: siden hentes fra dist med den statiske testserveren og går ikke gjennom Workeren. Worker-koden har ingen
 * omgåelse (scripts/hjelp.test.mjs passer på det); sjekken av Workeren er testet med genererte nøkler og med `wrangler dev`.
 * Skriver PNG til claude/k226-skjermbilder/ (gjøres om til webp etterpå) og en JSON-rapport med sjekkene: ingen sideveis rulling, skriften lastet,
 * lys modus (også når maskinen står i mørk), ingen konsollfeil, rollevelgeren fester seg øverst, plassholder og copyright finnes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "k226-skjermbilder");
await mkdir(ut, { recursive: true });
const server = await startServer(join(rot, "sites", "hengsel", "dist"));
const base = `http://127.0.0.1:${server.address().port}`;
const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const rapport = [];
let feil = 0;
for (const bredde of [390, 1280]) {
  for (const mork of [false, true]) {
    if (mork && bredde === 1280) continue;
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, colorScheme: mork ? "dark" : "light", deviceScaleFactor: 1 });
    const side = await ctx.newPage();
    const konsoll = [];
    side.on("console", (m) => m.type() === "error" && konsoll.push(m.text()));
    side.on("pageerror", (e) => konsoll.push(String(e)));
    await side.goto(`${base}/hjelp`, { waitUntil: "networkidle" });
    await side.evaluate(() => document.fonts.ready);
    const m = await side.evaluate(() => {
      const nav = document.querySelector("nav.roller");
      const bunn = document.querySelector("footer.hjelpebunn");
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
        bakgrunn: getComputedStyle(document.body).backgroundColor,
        skrift: getComputedStyle(document.body).fontFamily.split(",")[0],
        skriftLastet: document.fonts.check('16px "Schibsted Grotesk"'),
        navSticky: getComputedStyle(nav).position,
        plassholdere: document.querySelectorAll(".plassholder").length,
        copyright: bunn?.textContent?.trim() ?? "",
        kapitler: document.querySelectorAll("section.kap").length,
      };
    });
    // Rollevelgeren: klikk på «Montør (Ute)» og sjekk at kapittelet er i vinduet
    await side.click('nav.roller a[href="#montor"]');
    await side.waitForTimeout(1500);
    m.ankerTilMontor = await side.evaluate(() => { const r = document.getElementById("montor").getBoundingClientRect(); return r.top >= 0 && r.top < 120; });
    await side.evaluate(() => window.scrollTo(0, 0));
    const navn = `hjelp-${bredde}${mork ? "-maskin-mork" : ""}`;
    // Skjermen først (rollevelgeren står fast øverst), så hele siden. Ved helside-opptak blir en fast rollevelger liggende utenfor bildet, så den settes til vanlig flyt bare der.
    await side.screenshot({ path: join(ut, `${navn}-skjerm.png`) });
    await side.evaluate(() => { document.querySelector("nav.roller").style.position = "static"; });
    await side.screenshot({ path: join(ut, `${navn}.png`), fullPage: true });
    const ok = m.overflow <= 0 && m.colorScheme === "light" && m.skriftLastet && m.navSticky === "sticky" && m.plassholdere > 0 && m.copyright.startsWith("© 2026 ES-Holding AS.") && m.ankerTilMontor && !konsoll.length && m.kapitler === 7;
    if (!ok) feil++;
    rapport.push({ navn, ok, ...m, konsoll });
    await ctx.close();
  }
}
await nettleser.close();
server.close();
await writeFile(join(ut, "sjekker.json"), JSON.stringify(rapport, null, 2) + "\n");
console.log(rapport.map((r) => `${r.ok ? "✓" : "✗"} ${r.navn}: overflow ${r.overflow}, ${r.colorScheme}, ${r.skrift}, bunn ${r.bakgrunn}, ${r.plassholdere} plassholdere, anker ${r.ankerTilMontor}${r.konsoll.length ? `, konsoll ${r.konsoll}` : ""}`).join("\n"));
process.exit(feil ? 1 : 0);
