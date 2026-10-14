#!/usr/bin/env node
/**
 * K-212: favicon, apple-touch-icon, app-ikon i manifestet (192 og 512) og delingsbilder (og:image) til Hengsel-sidene,
 * fra det nye merket (blekk på bladene, furu på stiften) i det pinnede designsystemet.
 *
 *   node scripts/lag-favicon.mjs
 *
 * Kilden er packages/hengsel-tokens/ds/assets/logo/hengsel-merke-lys.svg og logo-hengsel-lys.svg (ferdige SVG-filer, tegnes ikke om),
 * gjengitt i Chromium (Playwright). Flatene er rollene flate-senket og flate-side i pinnet hengsel.tokens.json, aldri egne farger.
 * Lager PNG-ene (ikke favicon.svg: den pinnede merkefila er gjennomsiktig og blir usynlig i mørke nettleserfaner).
 * Skriften i design.hengsel.no-bildet er Schibsted Grotesk (pinnet woff2).
 *
 * K-212 runde 2 (palettpakke v2): apple-touch-icon (180), 192 og 512 er filene fra pakken (ds/assets/favicon: apple-touch-icon-180.png, icon-192.png, icon-512.png; merket på hvit flate).
 * 32 px lages her som før (avrundet flis): pakkens favicon-32.png er gjennomsiktig med mørke blad og blir usynlig i mørke nettleserfaner (K-202). Merket er det samme (hengsel-merke-lys.svg).
 */
import { copyFile, readFile, writeFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const rot = resolve(import.meta.dirname, "..");
const pakke = join(rot, "packages", "hengsel-tokens");
const json = JSON.parse(await readFile(join(pakke, "ds", "tokens", "hengsel.tokens.json"), "utf8"));
const FLATE_IKON = json.farge["flate-senket"].lys;
const FLATE_SIDE = json.farge["flate-side"].lys;
const TEKST = json.farge["tekst"].lys;
const DEMPET = json.farge["tekst-dempet"].lys;
const LINJE = json.farge["linje"].lys;
const logo = (n) => readFile(join(pakke, "ds", "assets", "logo", n), "utf8");
const dataUrl = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const merke = dataUrl(await logo("hengsel-merke-lys.svg"));
const ordmerke = dataUrl(await logo("logo-hengsel-lys.svg"));
const font = (await readFile(join(pakke, "ds", "assets", "fonts", "schibsted-grotesk-latin-wght-normal.woff2"))).toString("base64");
const fontFace = `@font-face{font-family:'Schibsted Grotesk';font-weight:400 800;src:url(data:font/woff2;base64,${font}) format('woff2')}`;

const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const side = await nettleser.newPage({ deviceScaleFactor: 1 });

/** Merket (stående, 520,96 × 651,2) sentrert på en kvadratisk flate med luft; små størrelser har runde hjørner og gjennomsiktig utenfor. */
async function ikon(n, { luft = 0.2, rund = 0 } = {}) {
  await side.setViewportSize({ width: n, height: n });
  const h = n * (1 - 2 * luft);
  await side.setContent(`<body style="margin:0;width:${n}px;height:${n}px;background:${rund ? "transparent" : FLATE_IKON};display:flex;align-items:center;justify-content:center"><div style="width:${n}px;height:${n}px;background:${FLATE_IKON};border-radius:${rund * n}px;display:flex;align-items:center;justify-content:center"><img src="${merke}" style="height:${h}px;display:block"></div></body>`);
  await side.waitForFunction(() => document.images[0].complete);
  return side.screenshot({ type: "png", omitBackground: rund > 0 });
}
async function delingsbilde(html) {
  await side.setViewportSize({ width: 1200, height: 630 });
  await side.setContent(`<style>${fontFace}body{margin:0;width:1200px;height:630px;background:${FLATE_SIDE};font-family:'Schibsted Grotesk',sans-serif;color:${TEKST};position:relative;overflow:hidden}</style>${html}`);
  await side.waitForFunction(() => document.images[0]?.complete !== false);
  await side.evaluate(() => document.fonts.ready);
  return side.screenshot({ type: "png" });
}
const senteret = await delingsbilde(`<img src="${ordmerke}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:150px">`);
const designBilde = await delingsbilde(`<img src="${ordmerke}" style="position:absolute;left:80px;top:72px;height:60px"><div style="position:absolute;left:80px;top:215px;font-size:112px;font-weight:700;letter-spacing:-3px;line-height:1">Designfasit</div><div style="position:absolute;left:80px;top:360px;font-size:32px;color:${DEMPET}">Merket, farger, skrift, komponenter og skjermer.</div><div style="position:absolute;left:80px;right:80px;top:505px;border-top:1px solid ${LINJE}"></div><div style="position:absolute;left:80px;top:525px;font-size:28px;font-weight:500">design.hengsel.no</div>`);

const mapper = { hengsel: "sites/hengsel/public", admin: "sites/admin/public", design: "sites/design/public", vis: "sites/vis/src" };
const PAKKE = { 180: "apple-touch-icon-180.png", 192: "icon-192.png", 512: "icon-512.png" };
const sett = { hengsel: [32, 180, 192, 512], admin: [32, 180], design: [32, 180, 192], vis: [32, 180] };
for (const [s, m] of Object.entries(mapper)) {
  for (const n of sett[s]) {
    if (PAKKE[n]) await copyFile(join(pakke, "ds", "assets", "favicon", PAKKE[n]), join(rot, m, `favicon-${n}.png`));
    else await writeFile(join(rot, m, `favicon-${n}.png`), await ikon(n, { luft: n <= 48 ? 0.12 : 0.2, rund: n <= 48 ? 0.22 : 0 }));
  }
  await rm(join(rot, m, "favicon.svg"), { force: true });
}
await writeFile(join(rot, mapper.hengsel, "og.png"), senteret);
await writeFile(join(rot, mapper.hengsel, "og-apptest.png"), senteret);
await writeFile(join(rot, mapper.vis, "og.png"), senteret);
await writeFile(join(rot, mapper.design, "og.png"), designBilde);
await nettleser.close();
console.log("✓ favicon-*.png (hengsel, admin, design, vis), og.png og og-apptest.png");
