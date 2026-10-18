#!/usr/bin/env node
/**
 * N-8: skjermbilder og nettlesersjekker av hengsel.no/telefon (1440 og 390), «På telefon» på produktsidene og Telefon-knappen i Ordrens reise
 * (vis.hengsel.no/reise) til claude/n8-skjermbilder/. Bibliotekbildene lastes ikke i sandkassen (bilder.hengsel.no nås ikke), så rammene viser
 * «Skjermbilde kommer» eller et tomt bilde; det er rammene, teksten og oppsettet som sjekkes. Kjør etter `npm run build`.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "claude", "n8-skjermbilder");
await mkdir(ut, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, t) => { if (!ok) feil++; console.log(`${ok ? "✓" : "✗"} ${t}`); };
const hs = await startServer(join(rot, "sites", "hengsel", "dist"));
const vs = await startServer(join(rot, "sites", "vis", "dist"));
const H = `http://127.0.0.1:${hs.address().port}`, V = `http://127.0.0.1:${vs.address().port}`;

async function side(base, sti, bredde, fil, { full = true, etter } = {}) {
  const ctx = await browser.newContext({ viewport: { width: bredde, height: bredde > 800 ? 900 : 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const konsoll = [];
  p.on("console", (m) => { if (m.type() === "error" && !/bilder\.hengsel\.no|ERR_|Failed to load resource/.test(m.text())) konsoll.push(m.text()); });
  p.on("pageerror", (e) => konsoll.push(String(e)));
  await p.route(/bilder\.hengsel\.no/, (r) => r.abort());
  await p.goto(base + sti, { waitUntil: "load" });
  await p.waitForTimeout(400);
  if (etter) await etter(p);
  const bredt = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const style = await p.evaluate(() => document.querySelectorAll("[style]").length);
  meld(!bredt, `${sti} ${bredde}: ingen vannrett rulling`);
  meld(konsoll.length === 0, `${sti} ${bredde}: ingen konsollfeil${konsoll.length ? " " + konsoll.join(" | ") : ""}`);
  if (fil) await p.screenshot({ path: join(ut, fil), fullPage: full });
  await ctx.close();
  return style;
}

await side(H, "/telefon", 1440, "telefon-1440.png");
await side(H, "/telefon", 390, "telefon-390.png");
await side(H, "/", 1440, "forside-1440.png", { full: false });
await side(H, "/ute", 390, "ute-390-pa-telefon.png", { etter: (p) => p.locator("#pa-telefon").scrollIntoViewIfNeeded() });
await side(H, "/kunde/sigdal/ute", 390, null).then(() => 0);
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.route(/bilder\.hengsel\.no/, (r) => r.abort());
  await p.goto(`${H}/kunde/sigdal/ute`);
  meld((await p.locator('a[href="/telefon"]').count()) === 0, "Sigdal-utgaven av /ute har ikke lenke til /telefon");
  await p.goto(`${H}/kunde/sigdal`);
  meld((await p.locator('a[href="/telefon"]').count()) === 0, "Sigdal-forsiden har ikke lenke til /telefon");
  await p.goto(`${H}/`);
  meld((await p.locator('a[href="/telefon"]').count()) === 3, "forsiden har «På telefon» i de tre produktkortene");
  await p.goto(`${H}/telefon`);
  // style-attributtene skala.ts setter via CSSOM er lov; det er HTML-en fra serveren som ikke skal ha dem (CSP style-src 'self')
  meld(!/\sstyle="/.test(await (await fetch(`${H}/telefon`)).text()), "/telefon har ingen style-attributter i HTML-en (CSP)");
  meld((await p.locator("svg#sb-signal, g#sb-signal").count()) === 1, "/telefon definerer statuslinjens symboler én gang");
  await ctx.close();
}
// Ordrens reise: Telefon-knappen bytter rammen
for (const [bredde, fil] of [[1280, "reise-telefon-1280.png"], [390, "reise-telefon-390.png"]]) {
  await side(V, "/reise/", bredde, fil, { full: false, etter: async (p) => {
    const pcSynlig = () => p.locator('[data-enhet="pc"]').isVisible();
    const tlfSynlig = () => p.locator('[data-enhet="tlf"]').isVisible();
    meld((await pcSynlig()) && !(await tlfSynlig()), `reise ${bredde}: Studio Display er standard`);
    await p.click("#telefon");
    meld(!(await pcSynlig()) && (await tlfSynlig()), `reise ${bredde}: Telefon bytter til iPhone-rammen`);
    meld((await p.getAttribute("#telefon", "aria-pressed")) === "true", `reise ${bredde}: knappen har aria-pressed`);
    await p.click("#next");
    await p.waitForTimeout(200);
    meld(await tlfSynlig(), `reise ${bredde}: telefonrammen blir stående ved neste scene`);
    await p.locator("#stage").scrollIntoViewIfNeeded();
  } });
}
await browser.close(); hs.close(); vs.close();
console.log(feil ? `\n${feil} feil` : "\nAlt ok");
process.exit(feil ? 1 : 0);
