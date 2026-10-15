#!/usr/bin/env node
/**
 * K-238: skjermbilder (390 og 1280 px) av hengsel.no (forsiden, knappen med aksent) og sngroup.no/design (temaprøven) før og etter ny pin av
 * Hengsel-tokenene (K-234: aksent lys #05806F, tekst på aksent Off White #FBF9F6) og rettingen av temaprøven. Krever `npm run build` og Chromium.
 *
 *   node scripts/skjermbilder-k238.mjs for      → claude/k238/<side>-for-<bredde>.webp
 *   node scripts/skjermbilder-k238.mjs etter    → claude/k238/<side>-etter-<bredde>.webp
 *
 * Skriver også claude/k238/<for|etter>.json med --aksent og --paa-aksent slik nettleseren ser dem, og bakgrunn og tekstfarge på primærknappen
 * på hengsel.no. Sjekker konsollfeil (utenom 404 fra biblioteket) og horisontal rulling på 390 px.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import { startServer } from "./statisk-server.mjs";
import { BILDEDOMENE } from "./lib/bildedomene.mjs";

const rot = resolve(import.meta.dirname, "..");
const runde = process.argv[2];
if (!["for", "etter"].includes(runde)) { console.error("Bruk: node scripts/skjermbilder-k238.mjs for|etter"); process.exit(2); }
const ut = join(rot, "claude", "k238");
/** [side, sti, navn, velger for knappen som leses] */
const SIDER = [
  ["hengsel", "/", "hengsel-no-forside", ".knapper .btn.primary"],
  ["sngroup", "/design", "sngroup-no-design", ".tema-hengsel"],
];
await mkdir(ut, { recursive: true });
const tjenere = {};
for (const s of new Set(SIDER.map((x) => x[0]))) tjenere[s] = await startServer(join(rot, "sites", s, "dist"));
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const feil = [];
const verdier = {};
for (const [side, sti, navn, velger] of SIDER) {
  for (const bredde of [390, 1280]) {
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: "light" });
    // Biblioteket nås ikke fra Code-økta: bildene får 404 og plassholderne vises, som i K-233 uten stand-in
    await ctx.route(`${BILDEDOMENE}/**`, (route) => route.fulfill({ status: 404, body: "" }));
    const p = await ctx.newPage();
    p.on("console", (m) => { if (m.type() === "error" && !m.text().includes(BILDEDOMENE)) feil.push(`${navn} ${bredde}: ${m.text()}`); });
    p.on("pageerror", (e) => feil.push(`${navn} ${bredde}: ${e}`));
    await p.goto(`http://127.0.0.1:${tjenere[side].address().port}${sti}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    await p.waitForLoadState("networkidle");
    const info = await p.evaluate((velger) => {
      const e = document.querySelector(velger);
      const cs = e ? getComputedStyle(e) : null;
      const rotStil = getComputedStyle(document.documentElement);
      return {
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        aksent: (cs ?? rotStil).getPropertyValue("--aksent").trim(), paaAksent: (cs ?? rotStil).getPropertyValue("--paa-aksent").trim() || (cs ?? rotStil).getPropertyValue("--pa-aksent").trim(),
        knapp: e && velger.includes("btn") ? { bakgrunn: cs.backgroundColor, tekst: cs.color } : null,
      };
    }, velger);
    if (info.sw > info.cw) feil.push(`${navn} ${bredde}: horisontal rulling (${info.sw} > ${info.cw})`);
    verdier[`${navn}-${bredde}`] = info;
    const png = await p.screenshot({ fullPage: true });
    await sharp(png).webp({ quality: 80 }).toFile(join(ut, `${navn}-${runde}-${bredde}.webp`));
    console.log(`✓ ${navn} ${bredde} (${runde}): --aksent ${info.aksent || "(arvet)"}, --paa-aksent ${info.paaAksent || "(arvet)"}${info.knapp ? `, knapp ${info.knapp.bakgrunn} / ${info.knapp.tekst}` : ""}`);
    await ctx.close();
  }
}
await nettleser.close();
for (const t of Object.values(tjenere)) t.close();
await writeFile(join(ut, `${runde}.json`), JSON.stringify({ runde, dato: new Date().toISOString().slice(0, 10), verdier, feil }, null, 2) + "\n");
console.log(`Feil (${feil.length}): ${feil.join("; ") || "ingen"}`);
process.exit(feil.length ? 1 : 0);
