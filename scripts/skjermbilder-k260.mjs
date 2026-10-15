#!/usr/bin/env node
/**
 * K-260: skjermbilder av Hengsel Admin fase C og Drift med eksempeldata, lokalt (uten Cloudflare), 1440 px: SC1–SC4, ST1, SD1–SD2, Innstillinger,
 * tilstandene tom, laster og feil, og «Ingen tilgang» (ADM-403) for supportrollen. Lagres i claude/k260/. Sjekker også konsollfeil,
 * mislykkede forespørsler, CSP-brudd og sidelengs rulling. Statussidene (Cloudflare, Supabase) hentes ikke her (DRIFT_STATUSSIDER=av).
 *   npm run build -w sites/admin && node scripts/skjermbilder-k260.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldataC } from "./lib/admin-eksempeldata-c.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "k260"));
await mkdir(ut, { recursive: true });

const env = { DB: await lagTestdatabase(), DRIFT_STATUSSIDER: "av" };
const ider = await leggInnEksempeldataC(env);
const dist = join(rot, "sites", "admin", "dist");
const eier = await startAdminLokalt({ dist, env });
const support = await startAdminLokalt({ dist, env, bruker: { epost: "support@eksempel.no", navn: "Supportperson", rolle: "support" } });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };

/** [navn, sti, { vent, handling, laster, base }] */
const SKJERMER = [
  ["sc1-abonnement", `/fakturering/abonnement?id=${ider.abo.granlund}`, { vent: ".fakta" }],
  ["sc1-abonnement-aune", `/fakturering/abonnement?id=${ider.abo.aune}`, { vent: ".fakta" }],
  ["sc1-abonnement-ny-endring", `/fakturering/abonnement?id=${ider.abo.granlund}`, { vent: ".fakta", handling: async (p) => { await p.click("#ny-endring"); await p.waitForSelector("dialog[open]"); } }],
  ["sc2-fakturakjoring", "/fakturering/kjoring", { vent: ".faktura" }],
  ["sc2-fakturakjoring-kostpris", "/fakturering/kjoring", { vent: ".faktura", handling: async (p) => { await p.click("[data-kostpris] >> nth=0"); await p.waitForSelector("dialog[open]"); await p.fill("dialog[open] [name=tekst]", "SMS, oktober"); await p.fill("dialog[open] [name=kostpris]", "64,00"); } }],
  ["sc3-kpi", "/fakturering/kpi", { vent: ".epost" }],
  ["sc4-utestaende", "/fakturering/utestaende", { vent: ".tom" }],
  ["st1-tall", "/tall", { vent: ".diagram svg" }],
  ["sd1-status", "/drift/status", { vent: ".tabell tbody tr" }],
  ["sd2-lenker", "/drift/lenker", { vent: ".lenkekort" }],
  ["sd2-kontoer", "/drift/kontoer", { vent: ".tabell tbody tr" }],
  ["sd2-frister", "/drift/frister", { vent: ".tabell tbody tr" }],
  ["sd2-rutiner", "/drift/rutiner", { vent: ".rutinegruppe" }],
  ["innstillinger-varsler", "/innstillinger/varsler", { vent: ".bryter" }],
  ["innstillinger-kundemiljoer", "/innstillinger/kundemiljoer", { vent: "#miljoer" }],
  ["innstillinger-avtalemaler", "/innstillinger/avtalemaler", { vent: ".tabell tbody tr" }],
  ["innstillinger-brukere", "/innstillinger/brukere", { vent: ".tabell" }],
  ["tilstand-kjoring-tom", "/fakturering/kjoring?tilstand=tom", { vent: ".tom" }],
  ["tilstand-kjoring-laster", "/fakturering/kjoring?tilstand=laster", { vent: ".skjelett", laster: true }],
  ["tilstand-kjoring-feil", "/fakturering/kjoring?tilstand=feil", { vent: ".banner" }],
  ["tilstand-abonnement-tom", "/fakturering/abonnement?tilstand=tom", { vent: ".tom" }],
  ["tilstand-abonnement-feil", "/fakturering/abonnement?tilstand=feil", { vent: ".banner" }],
  ["tilstand-tall-tom", "/tall?tilstand=tom", { vent: ".tom" }],
  ["tilstand-tall-laster", "/tall?tilstand=laster", { vent: ".skjelett", laster: true }],
  ["tilstand-tall-feil", "/tall?tilstand=feil", { vent: ".banner" }],
  ["support-ingen-tilgang-fakturering", "/fakturering/kjoring", { vent: ".ikke-tilgang", base: support.base }],
  ["support-ingen-tilgang-drift", "/drift/status", { vent: ".ikke-tilgang", base: support.base }],
];

for (const [navn, sti, valg] of SKJERMER) {
  const base = valg.base ?? eier.base;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "nb-NO", timezoneId: "Europe/Oslo" });
  const page = await ctx.newPage();
  const problemer = [];
  // 403 fra API-et er forventet for supportrollen
  page.on("console", (m) => m.type() === "error" && !(valg.base && /403/.test(m.text())) && problemer.push(`konsoll: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 200)}`));
  page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(base, "")}`));
  try {
    await page.goto(base + sti, { waitUntil: valg.laster ? "load" : "networkidle" });
    await page.waitForSelector(valg.vent, { timeout: 15000, state: "attached" });
    if (valg.handling) await valg.handling(page);
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) problemer.push(`sidelengs rulling: ${overflow}px`);
    await page.screenshot({ path: join(ut, `${navn}-1440.png`), fullPage: true });
  } catch (e) { problemer.push(`feilet: ${e.message.split("\n")[0].slice(0, 200)}`); }
  sier(!problemer.length, `${navn}${problemer.length ? "\n    " + problemer.join("\n    ") : ""}`);
  await ctx.close();
}

await browser.close();
await eier.stopp(); await support.stopp();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
