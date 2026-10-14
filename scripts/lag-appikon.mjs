#!/usr/bin/env node
/**
 * K-212 runde 2: PNG-er av app-ikonet Hengsel Ute fra Icon Composer-pakken i palettpakke v2 (packages/hengsel-tokens/ds/assets/app-ikon/hengsel_ute.icon).
 * Gjengivelsen er flat: bakgrunnsfargen fra icon.json (lys og mørk) og de tre lagene (venstre blad, høyre blad, stift) oppå hverandre, uten glass og lys fra Icon Composer.
 * Det er en forhåndsvisning til nettsidene; det ekte ikonet er .icon-pakken (iOS 26). Rendringen skjer i Chromium (Playwright).
 *
 *   node scripts/lag-appikon.mjs
 *
 * Skriver sites/design/public/merke/app-ikon/{ute,ute-mork,web}.png (240 px; web = apple-touch fra pakken) og sites/hengsel/public/ikon-ute-192.png (appflisen på /apptest/passord).
 * Fargene leses fra icon.json (srgb:r,g,b,a), aldri skrevet som egne verdier her.
 */
import { copyFile, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const rot = resolve(import.meta.dirname, "..");
const ds = join(rot, "packages", "hengsel-tokens", "ds", "assets");
const pakke = join(ds, "app-ikon", "hengsel_ute.icon");
const ikon = JSON.parse(await readFile(join(pakke, "icon.json"), "utf8"));
const srgb = (v) => { const [r, g, b] = Object.values(v)[0].replace("srgb:", "").split(",").map((x) => Math.round(parseFloat(x) * 255)); return `rgb(${r} ${g} ${b})`; };
const flate = { lys: srgb(ikon.fill), mork: srgb(ikon["fill-specializations"].find((f) => f.appearance === "dark").value) };
const lag = { lys: ["1-blad-venstre.svg", "2-blad-hoyre.svg", "3-stift.svg"], mork: ["1-blad-venstre-mork.svg", "2-blad-hoyre-mork.svg", "3-stift-mork.svg"] };
const dataUrl = async (f) => `data:image/svg+xml;base64,${(await readFile(join(pakke, "Assets", f))).toString("base64")}`;

const nettleser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const side = await nettleser.newPage({ deviceScaleFactor: 1 });
async function tegn(modus, n) {
  const bilder = await Promise.all(lag[modus].map(dataUrl));
  await side.setViewportSize({ width: n, height: n });
  await side.setContent(`<body style="margin:0;width:${n}px;height:${n}px;background:${flate[modus]};position:relative;overflow:hidden">${bilder.map((b) => `<img src="${b}" style="position:absolute;inset:0;width:${n}px;height:${n}px">`).join("")}</body>`);
  await side.waitForFunction(() => [...document.images].every((i) => i.complete));
  return side.screenshot({ type: "png" });
}
const ut = join(rot, "sites", "design", "public", "merke", "app-ikon");
await writeFile(join(ut, "ute.png"), await tegn("lys", 240));
await writeFile(join(ut, "ute-mork.png"), await tegn("mork", 240));
await copyFile(join(ds, "favicon", "apple-touch-icon-180.png"), join(ut, "web.png"));
await rm(join(ut, "crm.png"), { force: true });
await rm(join(ut, "ute-tonet.png"), { force: true });
await writeFile(join(rot, "sites", "hengsel", "public", "ikon-ute-192.png"), await tegn("lys", 192));
await nettleser.close();
console.log("✓ app-ikon: design/merke/app-ikon/{ute,ute-mork,web}.png og hengsel/ikon-ute-192.png");
