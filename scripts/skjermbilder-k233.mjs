#!/usr/bin/env node
/**
 * K-233: skjermbilder (390 og 1280 px) etter at app-skjermbildene hentes fra biblioteket på bilder.hengsel.no: hengsel.no (forsiden), /kunde/sigdal,
 * Visningsrommet (forsiden, /rom/ med romkortene og rommet /crm/) og sngroup.no. Krever `npm run build` (leser sites/<side>/dist) og Chromium.
 *
 *   node scripts/skjermbilder-k233.mjs
 *
 * Uten --ekte svares forespørsler til BILDEDOMENE med sist kjente lokale kopi fra git (origin/main, filene K-233 fjernet) som stand-in, bare når
 * stien finnes i manifestet; alt annet får 404, så plassholderne vises som i drift (for økter der biblioteket ikke nås). Med --ekte hentes bildene
 * fra biblioteket, og hvert bilde må laste. LES-MEG.md i claude/k233/ sier hva som ble brukt, og antall ekte bilder og plassholdere per side.
 * Sjekker også: ingen konsollfeil (utenom 404 fra biblioteket), ingen horisontal rulling på 390 px.
 */
import { execFileSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import { startServer } from "./statisk-server.mjs";
import { BILDEDOMENE, finnes } from "./lib/bildedomene.mjs";

const rot = resolve(import.meta.dirname, "..");
const ekte = process.argv.includes("--ekte");
const ut = join(rot, "claude", "k233");
/** [side, sti, navn] */
const SIDER = [
  ["hengsel", "/", "hengsel-no-forside"],
  ["hengsel", "/kunde/sigdal", "hengsel-no-kunde-sigdal"],
  ["vis", "/", "vis-forside"],
  ["vis", "/rom/", "vis-alle-rom"],
  ["vis", "/crm/", "vis-rom-crm"],
  ["sngroup", "/", "sngroup-no-forside"],
];
/** Sti i biblioteket (uten tema) → fil i repoet før K-233 (origin/main) */
const GAMMEL = (tema, sti) => {
  if (tema === "sigdal") return `sites/hengsel/public/kunde/sigdal/img/${sti}`;
  if (sti.startsWith("vis/skjermbilder/")) return `sites/vis/src/skjermbilder/${sti.slice(17)}`;
  if (sti.startsWith("vis/")) return `sites/vis/src/img/${sti.slice(4)}`;
  if (sti.startsWith("app/") || sti.startsWith("apptest/")) return `sites/hengsel/public/img/${sti}`;
  if (sti === "dok-forside.webp") return "sites/hengsel/public/img/dok-forside.webp";
  return null;
};
const standIn = new Map();
function gammelFil(tema, sti) {
  const nokkel = `${tema}/${sti}`;
  if (!standIn.has(nokkel)) {
    const fil = GAMMEL(tema, sti);
    let buf = null;
    if (fil) { try { buf = execFileSync("git", ["show", `origin/main:${fil}`], { cwd: rot, maxBuffer: 64 * 1024 * 1024 }); } catch { buf = null; } }
    standIn.set(nokkel, buf);
  }
  return standIn.get(nokkel);
}

await rm(ut, { recursive: true, force: true });
await mkdir(ut, { recursive: true });
const tjenere = {};
for (const s of new Set(SIDER.map((x) => x[0]))) tjenere[s] = await startServer(join(rot, "sites", s, "dist"));
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const feil = [];
const brukt = { standIn: new Set(), plassholder: new Set(), ikke: new Set() };
const perSide = [];
for (const [side, sti, navn] of SIDER) {
  for (const bredde of [390, 1280]) {
    const ctx = await nettleser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: "light", bypassCSP: side === "vis" });
    if (!ekte) await ctx.route(`${BILDEDOMENE}/**`, async (route) => {
      const adresse = route.request().url();
      const rest = adresse.slice(BILDEDOMENE.length + 1);
      const [tema, ...deler] = rest.split("/");
      const bildeSti = deler.join("/");
      const buf = finnes(tema, bildeSti) ? gammelFil(tema, bildeSti) : null;
      if (buf) { brukt.standIn.add(rest); await route.fulfill({ status: 200, contentType: "image/webp", body: buf }); }
      else { brukt.ikke.add(rest); await route.fulfill({ status: 404, body: "" }); }
    });
    const p = await ctx.newPage();
    p.on("console", (m) => { if (m.type() === "error" && !m.text().includes(BILDEDOMENE)) feil.push(`${navn} ${bredde}: ${m.text()}`); });
    p.on("pageerror", (e) => feil.push(`${navn} ${bredde}: ${e}`));
    await p.goto(`http://127.0.0.1:${tjenere[side].address().port}${sti}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    await p.waitForLoadState("networkidle");
    const info = await p.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      plassholdere: [...document.querySelectorAll("[data-skjermbilde]")].filter((e) => !e.hidden).map((e) => e.dataset.skjermbilde),
      bilder: [...document.images].filter((i) => i.src.startsWith("https://bilder.hengsel.no")).map((i) => [i.src.split("/v1/")[1], i.complete && i.naturalWidth > 0]),
      lokale: [...document.images].filter((i) => /\/img\/(rom-|dok-forside)/.test(i.src)).map((i) => [i.src.split("/img/")[1], i.complete && i.naturalWidth > 0]),
    }));
    if (info.sw > info.cw) feil.push(`${navn} ${bredde}: horisontal rulling (${info.sw} > ${info.cw})`);
    for (const k of info.plassholdere) brukt.plassholder.add(k);
    for (const [b, ok] of [...info.bilder, ...info.lokale]) if (!ok) feil.push(`${navn} ${bredde}: bildet ${b} lastet ikke`);
    const png = await p.screenshot({ fullPage: true });
    await sharp(png).webp({ quality: 80 }).toFile(join(ut, `${navn}-${bredde}.webp`));
    const l = `${navn} ${bredde}: ${info.bilder.length} bilder fra biblioteket${ekte ? "" : " (stand-in fra git)"}, ${info.lokale.length} egne bilder lokalt, ${info.plassholdere.length} plassholdere${info.plassholdere.length ? ` (${info.plassholdere.join(", ")})` : ""}`;
    perSide.push(l);
    console.log(`✓ ${l}`);
    await ctx.close();
  }
}
await nettleser.close();
for (const t of Object.values(tjenere)) t.close();
const notat = `# K-233: skjermbilder (${new Date().toISOString().slice(0, 10)})

390 og 1280 px av hengsel.no (forsiden), hengsel.no/kunde/sigdal, vis.hengsel.no (forsiden, /rom/ og /crm/) og sngroup.no, tatt av scripts/skjermbilder-k233.mjs mot de bygde sidene.
Nettsidenes egne bilder (romkortene for rom uten app-skjermbilde og dokumentforsiden) ligger lokalt og vises som i drift.

${ekte ? "Bildene er hentet fra biblioteket (bilder.hengsel.no), ingen stand-in." : `Biblioteket (bilder.hengsel.no) nås ikke fra denne økta. Adressene i biblioteket som står i manifestet
ble derfor svart med sist kjente lokale kopi fra git (origin/main, filene K-233 fjernet) som stand-in; alt annet fikk 404, så plassholderne
«Skjermbilde kommer» vises som i drift.`}

Per side (bilder fra biblioteket, egne bilder lokalt, plassholdere):
${perSide.map((l) => `- ${l}`).join("\n")}

Stand-in (${brukt.standIn.size}): ${[...brukt.standIn].sort().join(", ") || "ingen"}
Plassholdere vist (${brukt.plassholder.size}): ${[...brukt.plassholder].sort().join(", ") || "ingen"}
Adresser uten stand-in, 404 (${brukt.ikke.size}): ${[...brukt.ikke].sort().join(", ") || "ingen"}
Feil (${feil.length}): ${feil.join("; ") || "ingen"}
`;
await writeFile(join(ut, "LES-MEG.md"), notat);
console.log(notat);
process.exit(feil.length ? 1 : 0);
