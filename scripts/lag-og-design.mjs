#!/usr/bin/env node
/**
 * K-182: delingsbildet (og:image, 1200 × 630) for design.hengsel.no: Hengsel-merket v3 og «Designfasit». Tegnes av Chromium fra designsystemets
 * skrifter, logoer og tokens (sites/design/dist må være bygd). Skriver sites/design/public/og.png.
 */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const dist = join(rot, "sites", "design", "dist");
const t = JSON.parse(await readFile(join(rot, "packages", "hengsel-tokens", "ds", "tokens", "hengsel.tokens.json"), "utf8"));
const server = await startServer(dist);
const base = `http://127.0.0.1:${server.address().port}`;
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await nettleser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, bypassCSP: true });
const side = await ctx.newPage();
await side.goto(`${base}/404`, { waitUntil: "networkidle" });
const f = t.farge;
await side.evaluate(([flate, tekst, dempet, aksent, kort, linje]) => {
  document.documentElement.setAttribute("data-theme", "light");
  document.body.innerHTML = `
    <div style="width:1200px;height:630px;box-sizing:border-box;background:${flate};color:${tekst};padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;font-family:Inter,system-ui,sans-serif">
      <img src="/ds/assets/logo/logo-hengsel-lys.svg" alt="" style="height:64px;width:auto;align-self:flex-start">
      <div>
        <div style="font:400 112px/1.02 Newsreader,Georgia,serif;letter-spacing:-0.015em">Designfasit</div>
        <div style="font:400 34px/1.35 Inter,system-ui,sans-serif;color:${dempet};margin-top:24px;max-width:860px">Merket, farger, skrift, komponenter og skjermer.</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${linje};padding-top:24px;font:500 28px/1 Inter,system-ui,sans-serif">
        <span>design.hengsel.no</span><span style="color:${aksent}"></span>
      </div>
    </div>`;
  document.body.style.margin = "0";
}, [f["flate-side"].lys, f.tekst.lys, "#5E564C", f.aksent.lys, f["flate-kort"].lys, f.linje.lys]);
await side.evaluate(() => document.fonts.ready);
await side.waitForTimeout(300);
await writeFile(join(rot, "sites", "design", "public", "og.png"), await side.screenshot());
await nettleser.close();
server.close();
console.log("✓ og.png 1200 × 630");
