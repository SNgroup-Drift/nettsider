#!/usr/bin/env node
/**
 * K-212 runde 2: skjermbilder (390 og 1280 px, hele siden) og nettlesersjekker av Hengsel-sidene etter palettpakke v2. Krever `npm run build` (leser sites/<side>/dist) og Chromium.
 *
 *   node scripts/skjermbilder-k212-runde2.mjs
 *

 * Etterpå ble PNG-ene gjort om til webp (Pillow, kvalitet 80, method 6) og PNG-ene slettet, for å holde repoet lite.
 * Sidene: hengsel.no (forsiden, /apptest, /dokumenter, /crm, /kundeportal), design.hengsel.no (forsiden, /merke, /komponenter), admin, og tre vis-rom (forsiden, crm, montoren).
 * Skriver webp til claude/k212-runde2-skjermbilder/ og en JSON-rapport med sjekkene: aksent (computed), P3-aksent med emulert `color-gamut: p3` (CDP), ingen overflow på 390 px,
 * alle bilder lastet (logoer og favicon), ingen konsollfeil. Selve skjermen er sRGB: P3 vises som det Chromium gjengir i sRGB; sjekken er at variabelen er furu-verdien i P3.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "k212-runde2-skjermbilder");
const SIDER = [
  ["hengsel", "/", "hengsel-no-forside"], ["hengsel", "/apptest", "hengsel-no-apptest"], ["hengsel", "/dokumenter", "hengsel-no-dokumenter"],
  ["hengsel", "/crm", "hengsel-no-crm"], ["hengsel", "/kundeportal", "hengsel-no-kundeportal"],
  ["design", "/", "design-forside"], ["design", "/merke", "design-merke"], ["design", "/komponenter", "design-komponenter"],
  ["admin", "/", "admin-forside"],
  ["vis", "/", "vis-forside"], ["vis", "/crm/", "vis-crm"], ["vis", "/montoren/", "vis-montoren"],
];
const BREDDER = [390, 1280];
const AKSENT_P3 = "color(display-p3 0.2196 0.4941 0.4353)"; // K-238: K-234-aksenten #387E6F i P3 (var furu 0.2275 0.5098 0.4471)
/** Bygget CSS er minifisert (.2275 i stedet for 0.2275): sammenlikn tallene, ikke teksten. */
const p3tall = (v) => (v.match(/[\d.]+/g) ?? []).map(Number).join(" ");

await rm(ut, { recursive: true, force: true });
await mkdir(ut, { recursive: true });
const tjenere = {};
for (const s of new Set(SIDER.map((x) => x[0]))) tjenere[s] = await startServer(join(rot, "sites", s, "dist"));
const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const rapport = [];
for (const [side, sti, navn] of SIDER) {
  for (const bredde of BREDDER) {
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: 900 }, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
    const p = await ctx.newPage();
    const konsoll = [];
    p.on("console", (m) => { if (m.type() === "error") konsoll.push(m.text()); });
    p.on("pageerror", (e) => konsoll.push(String(e)));
    const base = `http://127.0.0.1:${tjenere[side].address().port}`;
    await p.goto(base + sti, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    // lazy bilder lastes når de rulles forbi
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(300);
    const sjekk = await p.evaluate(() => {
      const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      return {
        aksent: css("--aksent"), flateValgt: css("--flate-valgt"), colorScheme: getComputedStyle(document.documentElement).colorScheme,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bilderUtenInnhold: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")),
        logoer: [...document.images].map((i) => i.getAttribute("src")).filter((s) => /logo|favicon|ikon/.test(s ?? "")),
        tittel: document.title,
      };
    });
    // P3: emulert color-gamut via CDP, med måling av variabelen og et bilde
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "color-gamut", value: "p3" }] });
    const p3 = await p.evaluate(() => ({ ma: matchMedia("(color-gamut: p3)").matches, aksent: getComputedStyle(document.documentElement).getPropertyValue("--aksent").trim() }));
    await cdp.send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "color-gamut", value: "srgb" }] });
    const fil = `${navn}-${bredde}.png`;
    await p.screenshot({ path: join(ut, fil), fullPage: true });
    rapport.push({ side, sti, bredde, fil, ...sjekk, p3, konsoll });
    await ctx.close();
  }
}
// P3-bilde av hengsel.no (emulert color-gamut: p3) ved siden av sRGB
for (const bredde of BREDDER) {
  const ctx = await nettleser.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: "light" });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${tjenere.hengsel.address().port}/`, { waitUntil: "networkidle" });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "color-gamut", value: "p3" }] });
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(ut, `hengsel-no-forside-p3-emulert-${bredde}.png`), fullPage: false });
  await ctx.close();
}
await nettleser.close();
for (const t of Object.values(tjenere)) t.close();
await writeFile(join(ut, "sjekker.json"), JSON.stringify({ aksentP3Forventet: AKSENT_P3, rapport }, null, 2) + "\n");
const feil = rapport.flatMap((r) => [
  ...(r.aksent !== "#05806F" ? [`${r.side}${r.sti} ${r.bredde}: --aksent er «${r.aksent}»`] : []),
  ...(p3tall(r.p3.aksent) !== p3tall(AKSENT_P3) || !r.p3.aksent.startsWith("color(display-p3") ? [`${r.side}${r.sti} ${r.bredde}: P3-aksent er «${r.p3.aksent}» (ma=${r.p3.ma})`] : []),
  ...(r.bredde === 390 && r.overflow > 0 ? [`${r.side}${r.sti}: horisontal overflow ${r.overflow} px på 390`] : []),
  ...r.bilderUtenInnhold.map((b) => `${r.side}${r.sti} ${r.bredde}: bildet ${b} lastet ikke`),
  ...r.konsoll.map((k) => `${r.side}${r.sti} ${r.bredde}: konsollfeil ${k.slice(0, 100)}`),
]);
console.log(`✓ ${rapport.length} skjermbilder i claude/k212-runde2-skjermbilder/`);
if (feil.length) { console.error(feil.map((f) => "✗ " + f).join("\n")); process.exit(1); }
console.log("✓ aksent #05806F (K-234) og P3-aksent på alle sider, ingen overflow på 390, alle bilder lastet, ingen konsollfeil");
