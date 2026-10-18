#!/usr/bin/env node
/**
 * N-10: skjermbilder (1440 og 390) av forsidens fire-enheter-flis, /crm-toppen og /kundeportal-toppen til claude/n10-skjermbilder/, med sjekk av at
 * MacBook-rammen står der den skal, ingen vannrett rulling, ingen style-attributter og ingen konsollfeil. Bibliotekbildene lastes ikke i sandkassen
 * (bilder.hengsel.no nås ikke), så bibliotekrammene viser «Skjermbilde kommer»; rammene, oppsettet og de tegnede skjermene (CrmSkjerm, PortalSkjerm) sjekkes.
 * Kjør etter `npm run build`.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "n10-skjermbilder");
await mkdir(ut, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, t) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${t}`); };
const hs = await startServer(join(rot, "sites", "hengsel", "dist"));
const H = `http://127.0.0.1:${hs.address().port}`;

async function side(sti, bredde, fil, velger) {
  const ctx = await browser.newContext({ viewport: { width: bredde, height: bredde > 800 ? 900 : 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const konsoll = [];
  p.on("console", (m) => { if (m.type() === "error" && !/bilder\.hengsel\.no|ERR_|Failed to load resource/.test(m.text())) konsoll.push(m.text()); });
  p.on("pageerror", (e) => konsoll.push(String(e)));
  await p.route(/bilder\.hengsel\.no/, (r) => r.abort());
  await p.goto(H + sti, { waitUntil: "load" });
  await p.waitForTimeout(500);
  const bredt = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const style = await p.evaluate(() => document.querySelectorAll("[style]:not([data-skala])").length);
  meld(!bredt, `${sti} ${bredde}: ingen vannrett rulling`);
  meld(style === 0, `${sti} ${bredde}: ingen style-attributter utenom skaleringen (${style})`);
  meld(konsoll.length === 0, `${sti} ${bredde}: ingen konsollfeil${konsoll.length ? " " + konsoll.join(" | ") : ""}`);
  const mac = await p.$$eval(".enhet.macbook", (els) => els.map((e) => {
    const r = e.querySelector(".ramme").getBoundingClientRect(), s = e.querySelector(".skjerm").getBoundingClientRect();
    return { bredde: Math.round(r.width), hull: +(s.width / s.height).toFixed(3), bezel: !!e.querySelector("img.bezel"), status: !!e.querySelector(".status") };
  }));
  meld(mac.length > 0 && mac.every((m) => m.bezel && !m.status && Math.abs(m.hull - 1.6) < 0.01), `${sti} ${bredde}: MacBook ${JSON.stringify(mac)} (bezel, hull 16:10, ingen statuslinje)`);
  const el = await p.$(velger);
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await el.screenshot({ path: join(ut, fil) });
  await ctx.close();
}

for (const b of [1440, 390]) {
  await side("/", b, `forside-fire-enheter-${b}.png`, "#tre-enheter");
  await side("/crm", b, `crm-topp-${b}.png`, ".sidetopp");
  await side("/kundeportal", b, `kundeportal-topp-${b}.png`, ".sidetopp");
}
hs.close();
await browser.close();
console.log(feil ? `\n${feil} feil` : "\nAlt i orden");
process.exit(feil ? 1 : 0);
