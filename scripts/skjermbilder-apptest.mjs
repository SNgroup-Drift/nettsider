#!/usr/bin/env node
/**
 * Skjermbilder og nettlesersjekker for hengsel.no/apptest (K-107), mot Workeren med passordet (wrangler dev).
 *
 *  - apptest-passord-*: passordsiden, og passordsiden etter feil passord (390 og 1440, lys og mørk).
 *  - apptest-mobil / apptest-desktop: siden etter innlogging. Mobil (390), PC (1440).
 *  - Sjekker: informasjonskapselen, ingen vannrett rulling ved 360 px, ingen konsollfeil (CSP), og axe (WCAG 2 A/AA)
 *    uten brudd. Demopassordet (DEMO_PASSORD i .dev.vars) settes inn av Workeren, og Kopier virker.
 *
 * Kjør etter `npm run build -w sites/hengsel`, med wrangler dev i gang og en lokal sites/hengsel/.dev.vars (sjekkes ikke inn):
 *   npx wrangler dev -c sites/hengsel/wrangler.jsonc
 *   node scripts/skjermbilder-apptest.mjs            # BASE=http://localhost:8787 som standard
 * axe-core leses fra AXE_PATH (axe.min.js) hvis satt; ellers hoppes axe over.
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const ut = join(rot, "docs", "skjermbilder");
await mkdir(ut, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:8787";
const vars = await readFile(join(rot, "sites", "hengsel", ".dev.vars"), "utf8").catch(() => "");
const PASSORD = process.env.APPTEST_PASSORD ?? vars.match(/^APPTEST_PASSORD=(.*)$/m)?.[1]?.trim();
if (!PASSORD) {
  console.error("✗ fant ikke APPTEST_PASSORD (miljøvariabel eller sites/hengsel/.dev.vars)");
  process.exit(1);
}
const DEMO = process.env.DEMO_PASSORD ?? vars.match(/^DEMO_PASSORD=(.*)$/m)?.[1]?.trim();
const axe = process.env.AXE_PATH ? await readFile(process.env.AXE_PATH, "utf8") : null;

const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
};
const visninger = [
  { navn: "mobil", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA.iphone },
  { navn: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let feil = 0;
const meld = (ok, tekst) => {
  if (!ok) feil++;
  console.log(`${ok ? "✓" : "✗"} ${tekst}`);
};

async function loggInn(page) {
  await page.goto(`${BASE}/apptest`, { waitUntil: "networkidle" });
  await page.fill("#passord", PASSORD);
  await Promise.all([page.waitForURL(`${BASE}/apptest`), page.click("button[type=submit]")]);
  await page.waitForLoadState("networkidle");
}

async function sjekkAxe(page, navn) {
  if (!axe) return;
  // Via evaluate (CDP), så CSP-en ikke stopper axe
  await page.evaluate(axe);
  const brudd = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
    return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
  });
  meld(brudd.length === 0, `axe ${navn}${brudd.length ? `: ${brudd.join(", ")}` : ""}`);
}

const modi = [["light", "lys"], ["dark", "mork"]];
for (const [v, [farge, modus]] of visninger.flatMap((v) => modi.map((m) => [v, m]))) {
  const sfx = `${v.navn}-${modus}`;
  const ctx = await browser.newContext({ ...v, colorScheme: farge, reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const konsoll = [];
  page.on("console", (x) => x.type() === "error" && !/401/.test(x.text()) && konsoll.push(x.text()));
  page.on("pageerror", (e) => konsoll.push(e.message));

  // Passordsiden
  await page.goto(`${BASE}/apptest`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(ut, `apptest-passord-${sfx}.png`), fullPage: true });
  await sjekkAxe(page, `passordsiden (${sfx})`);
  // Feil passord
  await page.fill("#passord", "feil-passord");
  await Promise.all([page.waitForLoadState("networkidle"), page.click("button[type=submit]")]);
  meld(await page.isVisible("[data-feil]"), `feil passord viser feilmeldingen (${sfx})`);
  meld((await page.textContent("[data-feil]")).trim() === "Feil passord. Prøv igjen, eller spør Eirik.", `feilmeldingen har riktig tekst (${sfx})`);
  if (v.navn === "mobil") await page.screenshot({ path: join(ut, `apptest-passord-feil-${sfx}.png`), fullPage: true });
  await sjekkAxe(page, `passordsiden med feil (${sfx})`);

  // Siden etter innlogging
  await loggInn(page);
  await page.evaluate(() => document.fonts.ready);
  // Telefonbildene (loading="lazy") skal være lastet før helsidebildet: eager, rull gjennom siden, vent på lasting og dekoding
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; i.decoding = "sync"; });
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 });
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  await page.waitForTimeout(800);
  const fil = `apptest-${sfx}.png`;
  await page.screenshot({ path: join(ut, fil), fullPage: true });
  console.log(`  bilde: docs/skjermbilder/${fil}`);
  meld(await page.isVisible("h1:has-text('Test Hengsel Ute')"), `/apptest vises etter innlogging (${sfx})`);
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  meld(sw <= cw, `/apptest (${sfx}): bredde ${sw}/${cw}`);
  // Demobrukerne (K-114): passordet settes inn av Workeren fra DEMO_PASSORD. Verdien skrives aldri ut.
  const demoSynlig = await page.isVisible("[data-demopassord]");
  if (DEMO) {
    meld(demoSynlig && (await page.textContent("[data-demopassord-verdi]")) === DEMO, `demopassordet står på siden etter innlogging (${sfx})`);
    meld(!(await page.locator("[data-uten-demopassord]").count()), `«Passordet får du av den som inviterte deg» er fjernet (${sfx})`);
    await page.click("[data-kopier]");
    await page.waitForFunction(() => document.querySelector("[data-kopier]")?.textContent === "Kopiert", null, { timeout: 5000 }).catch(() => {});
    meld((await page.textContent("[data-kopier]")) === "Kopiert" && (await page.evaluate(() => navigator.clipboard.readText())) === DEMO, `Kopier legger demopassordet på utklippstavlen (${sfx})`);
  } else {
    meld(!demoSynlig && (await page.isVisible("[data-uten-demopassord]")), `uten DEMO_PASSORD står «Passordet får du av den som inviterte deg» (${sfx})`);
  }
  const pdf = await page.request.get(`${BASE}/apptest/Logg_inn_i_demoen.pdf`);
  meld(pdf.status() === 200 && (pdf.headers()["content-type"] ?? "").includes("pdf"), `PDF-en er tilgjengelig etter innlogging (${sfx})`);
  await sjekkAxe(page, `/apptest (${sfx})`);
  meld(konsoll.length === 0, `ingen konsollfeil (${sfx})${konsoll.length ? `: ${konsoll.join(" | ")}` : ""}`);
  const kaker = await ctx.cookies();
  const k = kaker.find((c) => c.name === "hengsel_apptest");
  meld(kaker.length === 1 && k?.httpOnly && k.secure && k.sameSite === "Lax" && k.path === "/apptest", `bare én informasjonskapsel, HttpOnly, Secure, SameSite=Lax, Path=/apptest (${sfx})`);
  await ctx.close();
}

// 360 px: ingen vannrett rulling på passordsiden
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/apptest`, { waitUntil: "networkidle" });
  const b = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  meld(b.sw <= b.cw, `passordsiden (360 px): bredde ${b.sw}/${b.cw}`);
  await ctx.close();
}

await browser.close();
console.log(`${feil} feil.`);
process.exit(feil ? 1 : 0);
