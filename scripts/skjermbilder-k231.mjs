#!/usr/bin/env node
/**
 * K-231: skjermbilder (390 og 1280 px) etter merkepakke v2: hengsel.no/ute og /apptest (motion), /sigdal (toppen med «Sigdal CRM · levert av Hengsel»),
 * hengsel.no/kundeportal («Levert av Hengsel»), design.hengsel.no/merke og /last-ned. Krever `npm run build` (leser sites/<side>/dist) og Chromium.
 *
 *   node scripts/skjermbilder-k231.mjs
 *
 * Motion-skjermbildene tas etter 3 sekunder med avspilling (WebM). Skriver webp (sharp, kvalitet 80) til claude/k231-skjermbilder/.
 * Sjekker også: ingen konsollfeil, ingen horisontal rulling på 390 px, alle bilder og video lastet.
 */
import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "k231-skjermbilder");
/** [side, sti, navn, utsnitt]: utsnitt «topp» tar bare det første skjermbildet (760 px), «motion» ruller til videoen og venter på avspilling, ellers hele siden */
const SIDER = [
  ["hengsel", "/ute", "hengsel-no-ute-motion", "motion"],
  ["hengsel", "/apptest", "hengsel-no-apptest-motion", "motion"],
  ["hengsel", "/kunde/sigdal", "sigdal-topp", "topp"],
  ["hengsel", "/kunde/sigdal/crm", "sigdal-crm-topp", "topp"],
  ["hengsel", "/kunde/sigdal/vis/", "sigdal-vis-topp", "topp"],
  ["hengsel", "/kundeportal", "hengsel-no-kundeportal", "hel"],
  ["design", "/merke", "design-merke", "hel"],
  ["design", "/last-ned", "design-last-ned", "hel"],
];
await rm(ut, { recursive: true, force: true });
await mkdir(ut, { recursive: true });
const tjenere = {};
for (const s of new Set(SIDER.map((x) => x[0]))) tjenere[s] = await startServer(join(rot, "sites", s, "dist"));
const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const feil = [];
for (const [side, sti, navn, utsnitt] of SIDER) {
  for (const bredde of [390, 1280]) {
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: utsnitt === "hel" ? 900 : 760 }, deviceScaleFactor: 1, colorScheme: "light", bypassCSP: sti.startsWith("/kunde/sigdal/vis") });  // Visningsrommet i Sigdal-utgave har inline stil og får egen CSP i Worker-en, ikke den lokale serverens
    const p = await ctx.newPage();
    p.on("console", (m) => { if (m.type() === "error") feil.push(`${navn} ${bredde}: ${m.text()}`); });
    p.on("pageerror", (e) => feil.push(`${navn} ${bredde}: ${e}`));
    await p.goto(`http://127.0.0.1:${tjenere[side].address().port}${sti}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    if (utsnitt === "motion") {
      await p.locator("video").first().scrollIntoViewIfNeeded();
      await p.waitForTimeout(3000);
      const v = await p.evaluate(() => { const e = document.querySelector("video"); return { t: e.currentTime, pauset: e.paused, kilde: e.currentSrc, w: e.videoWidth, h: e.videoHeight }; });
      if (!(v.t > 0.5) || v.pauset) feil.push(`${navn} ${bredde}: videoen spilles ikke (${JSON.stringify(v)})`);
      console.log(`${navn} ${bredde}: video ${v.kilde.split("/").pop()} ${v.w}×${v.h}, t=${v.t.toFixed(1)} s`);
    }
    // Ingen horisontal rulling og alle bilder lastet
    const sjekk = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth + 1, ikkeLastet: [...document.images].filter((i) => i.currentSrc && !i.complete || (i.complete && i.naturalWidth === 0 && i.currentSrc)).map((i) => i.currentSrc) }));
    if (bredde === 390 && sjekk.overflow) feil.push(`${navn}: horisontal rulling på 390 px`);
    if (sjekk.ikkeLastet.length) feil.push(`${navn} ${bredde}: bilder ikke lastet: ${sjekk.ikkeLastet.join(", ")}`);
    if (utsnitt !== "motion") await p.waitForTimeout(500);
    if (utsnitt === "motion") await p.evaluate(() => document.querySelector("video").scrollIntoView({ block: "center" }));
    const png = await p.screenshot({ fullPage: utsnitt === "hel", animations: "allow" });
    // webp tåler høyst 16383 px: lengre sider kuttes (de øverste 16000 px)
    const m = await sharp(png).metadata();
    await (m.height > 16000 ? sharp(png).extract({ left: 0, top: 0, width: m.width, height: 16000 }) : sharp(png)).webp({ quality: 80 }).toFile(join(ut, `${navn}-${bredde}.webp`));
    await ctx.close();
  }
}
await nettleser.close();
for (const s of Object.values(tjenere)) s.close();
if (feil.length) { console.error(feil.join("\n")); process.exit(1); }
console.log("✓ skjermbilder i claude/k231-skjermbilder/, ingen konsollfeil, ingen horisontal rulling på 390 px");
