#!/usr/bin/env node
/**
 * K-192: skjermbilder av de fire Hengsel-sidene (hengsel.no, vis., design., admin.) før og etter fargeryddingen, og axe-kontroll.
 *
 *   node scripts/skjermbilder-k192.mjs for       skjermbilder av dist slik den er bygd (lys og mørk maskininnstilling) til claude/k192-skjermbilder/
 *   node scripts/skjermbilder-k192.mjs etter     det samme etter; sjekker i tillegg at lys og mørk maskininnstilling gir PIKSELLIKE bilder
 *   node scripts/skjermbilder-k192.mjs axe       axe-core (kontrast og alt annet, WCAG 2.x A/AA + beste praksis) på ALLE sider i de fire sidene, 390 og 1440 px
 * Kjør etter `npm run build`. Chromium: CHROMIUM_PATH (Playwright finner ellers sin egen).
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const require = createRequire(import.meta.url);
const rot = resolve(import.meta.dirname, "..");
const modus = process.argv[2];
if (!["for", "etter", "axe"].includes(modus)) throw new Error("Bruk: for | etter | axe");
const ut = join(rot, "claude", "k192-skjermbilder");

export const SIDER = {
  hengsel: [["/", "forside"], ["/crm", "crm"], ["/priser-og-demo", "priser-og-demo"]],
  vis: [["/", "forside"], ["/crm/", "crm"], ["/dokumenter/", "dokumenter"]],
  design: [["/", "forside"], ["/farger", "farger"], ["/komponenter", "komponenter"]],
  admin: [["/", "forside"], ["/kunder", "kunder"], ["/kunder/sigdal-innlandet", "kunde"]],
};

const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const servere = {};
for (const s of Object.keys(SIDER)) servere[s] = await startServer(join(rot, "sites", s, "dist"));
const base = (s) => `http://127.0.0.1:${servere[s].address().port}`;
let feil = 0;
const meld = (ok, tekst) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${tekst}`); };

async function klargjor(side, url) {
  await side.goto(url, { waitUntil: "networkidle" });
  await side.evaluate(() => document.fonts.ready);
  await side.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
  await side.waitForLoadState("networkidle");
}

if (modus !== "axe") {
  await mkdir(ut, { recursive: true });
  for (const [s, sider] of Object.entries(SIDER)) for (const [sti, navn] of sider) for (const bredde of [390, 1440]) {
    const hash = {};
    for (const skjema of ["light", "dark"]) {
      const ctx = await nettleser.newContext({ viewport: { width: bredde, height: bredde === 390 ? 844 : 900 }, colorScheme: skjema, reducedMotion: "reduce", deviceScaleFactor: 1 });
      const side = await ctx.newPage();
      await klargjor(side, base(s) + sti);
      const png = await side.screenshot({ fullPage: true });
      hash[skjema] = createHash("sha256").update(png).digest("hex");
      const suffiks = skjema === "dark" && modus === "for" ? "-mork" : skjema === "dark" ? "-maskin-mork" : "";
      if (skjema === "light" || modus === "for") await sharp(png).extract({ left: 0, top: 0, width: bredde, height: Math.min(16000, (await sharp(png).metadata()).height) }).webp({ quality: 80 }).toFile(join(ut, `${s}-${navn}-${bredde}-${modus}${suffiks}.webp`));
      await ctx.close();
    }
    if (modus === "etter") meld(hash.light === hash.dark, `${s} ${navn} ${bredde} px: lys og mørk maskininnstilling gir pikselvis lik side`);
  }
} else {
  const alle = async (dir, pre = "") => (await Promise.all((await readdir(dir)).map(async (e) => ((await stat(join(dir, e))).isDirectory() ? alle(join(dir, e), `${pre}${e}/`) : [`${pre}${e}`])))).flat();
  const axeKilde = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
  let kontrastBrudd = 0, ovrige = 0, sjekket = 0;
  for (const s of Object.keys(SIDER)) {
    const dist = join(rot, "sites", s, "dist");
    const sider = (await alle(dist)).filter((f) => f.endsWith(".html") && !f.startsWith("ds/")).map((f) => "/" + f.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, ""));
    for (const sti of sider) for (const bredde of [390, 1440]) {
      const ctx = await nettleser.newContext({ viewport: { width: bredde, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
      const side = await ctx.newPage();
      await klargjor(side, base(s) + (sti === "" ? "/" : sti));
      await side.evaluate(axeKilde);
      const r = await side.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } })).violations.map((v) => ({ id: v.id, n: v.nodes.length, mål: v.nodes.slice(0, 2).map((n) => n.target.join(" ")) })));
      sjekket++;
      const k = r.filter((v) => v.id === "color-contrast"), o = r.filter((v) => v.id !== "color-contrast");
      kontrastBrudd += k.reduce((a, v) => a + v.n, 0); ovrige += o.reduce((a, v) => a + v.n, 0);
      if (k.length || o.length) console.log(`✗ ${s}${sti || "/"} ${bredde}px: ${JSON.stringify([...k, ...o])}`);
      await ctx.close();
    }
  }
  meld(kontrastBrudd === 0, `axe: ${sjekket} sidevisninger, ${kontrastBrudd} kontrastbrudd`);
  console.log(`(øvrige axe-brudd: ${ovrige})`);
}
await nettleser.close();
for (const s of Object.values(servere)) s.close();
console.log(feil ? `\n✗ ${feil} feil` : "\n✓ ferdig");
process.exit(feil ? 1 : 0);
