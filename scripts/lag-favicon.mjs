#!/usr/bin/env node
/**
 * K-212, forenklet i K-231: apple-touch-icon (180), app-ikon i manifestet (192, 512) og delingsbildet (og:image) til design.hengsel.no.
 *
 *   node scripts/lag-favicon.mjs
 *
 * apple-touch-icon (180), 192 og 512 er filene fra palettpakke v2 (ds/assets/favicon: apple-touch-icon-180.png, icon-192.png, icon-512.png; merket på hvit flate), kopiert til sidene.
 * Faviconen (ico, SVG og PNG 16, 32 og 48 med hvit flis) og delingsbildene til hengsel.no, vis og apptest kommer fra merkepakke v2 og legges inn av scripts/hent-merkepakke.mjs;
 * de lages ikke lenger her (den gamle avrundede flisen på 32 px og de rendrede og.png-ene for hengsel.no og vis er erstattet).
 * Det eneste som fortsatt rendres her er delingsbildet for design.hengsel.no («Designfasit»; pakken har ikke noe for design). Det tegnes i Chromium (Playwright) av det pinnede
 * ordmerket og Schibsted Grotesk (pinnet woff2), med rollene fra pinnet hengsel.tokens.json, aldri egne farger.
 */
import { copyFile, readFile, writeFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const json = JSON.parse(await readFile(join(pakke, "ds", "tokens", "hengsel.tokens.json"), "utf8"));
const FLATE_SIDE = json.farge["flate-side"].lys;
const TEKST = json.farge["tekst"].lys;
const DEMPET = json.farge["tekst-dempet"].lys;
const LINJE = json.farge["linje"].lys;
const logo = (n) => readFile(join(pakke, "ds", "assets", "logo", n), "utf8");
const dataUrl = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const ordmerke = dataUrl(await logo("logo-hengsel-lys.svg"));
const font = (await readFile(join(pakke, "ds", "assets", "fonts", "schibsted-grotesk-latin-wght-normal.woff2"))).toString("base64");
const fontFace = `@font-face{font-family:'Schibsted Grotesk';font-weight:400 800;src:url(data:font/woff2;base64,${font}) format('woff2')}`;

const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const side = await nettleser.newPage({ deviceScaleFactor: 1 });

async function delingsbilde(html) {
  await side.setViewportSize({ width: 1200, height: 630 });
  await side.setContent(`<style>${fontFace}body{margin:0;width:1200px;height:630px;background:${FLATE_SIDE};font-family:'Schibsted Grotesk',sans-serif;color:${TEKST};position:relative;overflow:hidden}</style>${html}`);
  await side.waitForFunction(() => document.images[0]?.complete !== false);
  await side.evaluate(() => document.fonts.ready);
  return side.screenshot({ type: "png" });
}
const designBilde = await delingsbilde(`<img src="${ordmerke}" style="position:absolute;left:80px;top:72px;height:60px"><div style="position:absolute;left:80px;top:215px;font-size:112px;font-weight:700;letter-spacing:-3px;line-height:1">Designfasit</div><div style="position:absolute;left:80px;top:360px;font-size:32px;color:${DEMPET}">Merket, farger, skrift, komponenter og skjermer.</div><div style="position:absolute;left:80px;right:80px;top:505px;border-top:1px solid ${LINJE}"></div><div style="position:absolute;left:80px;top:525px;font-size:28px;font-weight:500">design.hengsel.no</div>`);

const mapper = { hengsel: "sites/hengsel/public", admin: "sites/admin/public", design: "sites/design/public", vis: "sites/vis/src" };
const PAKKE = { 180: "apple-touch-icon-180.png", 192: "icon-192.png", 512: "icon-512.png" };
const sett = { hengsel: [180, 192, 512], admin: [180], design: [180, 192], vis: [180] };
for (const [s, m] of Object.entries(mapper)) {
  for (const n of sett[s]) {
    await copyFile(join(pakke, "ds", "assets", "favicon", PAKKE[n]), join(rot, m, `favicon-${n}.png`));
  }
  await rm(join(rot, m, "favicon.svg"), { force: true });
}
await writeFile(join(rot, mapper.design, "og.png"), designBilde);
await nettleser.close();
console.log("✓ apple-touch (180), 192 og 512 (hengsel, admin, design, vis) og og.png for design");
