#!/usr/bin/env node
/**
 * K-272: skjermbilder av «Opprett kunde» i Hengsel Admin, lokalt uten Cloudflare og uten GitHub: veiviseren (fire steg og oppsummering), fremdriften
 * mens Action-en kjører, et steg som feiler med «Prøv igjen herfra», alt ferdig med sjekklisten, og «Fjern testkunde». Action-en er simulert: kallet til
 * GitHub tas av en falsk fetch, og rapportene sendes til samme handterRapport som den ekte Action-en bruker (signert). 1440 px, og 390 px for
 * oppsummering og ferdig. Lagres i claude/k272-skjermbilder/. Sjekker konsollfeil, mislykkede forespørsler og sidelengs rulling.
 *   npm run build -w sites/admin && node scripts/skjermbilder-k272.mjs
 */
import { chromium } from "playwright";
import { createHmac } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";
import { handterRapport } from "../sites/admin/worker/ny-kunde-rapport.js";
import { gyldigOrgnr } from "../sites/admin/src/lib/ny-kunde.js";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "k272-skjermbilder"));
await mkdir(ut, { recursive: true });
const NOKKEL = "s".repeat(48);
const env = { DB: await lagTestdatabase(), GITHUB_DISPATCH_TOKEN: "ikke-et-ekte-token-bare-til-skjermbilder", NY_KUNDE_RAPPORTNOKKEL: NOKKEL };
const orgnr = [...Array(10).keys()].map((k) => `92345678${k}`).find(gyldigOrgnr);
const kall = [];
globalThis.fetch = async (url, init) => { kall.push({ url: String(url), body: JSON.parse(init.body) }); return new Response(null, { status: 204 }); };
const lokal = await startAdminLokalt({ dist: join(rot, "sites", "admin", "dist"), env });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };

async function rapporter(h) {
  const kropp = JSON.stringify({ run_id: "4711", run_url: "https://github.com/SNgroup-Drift/hengsel-crm/actions/runs/4711", ...h });
  const tid = String(Math.floor(Date.now() / 1000));
  const r = await handterRapport(new Request("https://admin.hengsel.no/api/oppstart/rapport", { method: "POST", headers: { "X-Rapport-Tid": tid, "X-Rapport-Signatur": createHmac("sha256", NOKKEL).update(`${tid}.${kropp}`).digest("hex") }, body: kropp }), env);
  if (r.status !== 200) throw new Error(`rapport ${r.status}`);
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", locale: "nb-NO", timezoneId: "Europe/Oslo" });
const page = await ctx.newPage();
const problemer = [];
page.on("console", (m) => m.type() === "error" && problemer.push(`konsoll: ${m.text().slice(0, 200)}`));
page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 200)}`));
page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(lokal.base, "")}`));
const bilde = async (navn, p = page) => { await p.waitForTimeout(250); await p.screenshot({ path: join(ut, `${navn}.png`), fullPage: true }); sier(true, navn); };
const fyll = async (navn, v) => page.fill(`[name=${navn}]`, v);

try {
  await page.goto(`${lokal.base}/oppstart/opprett-kunde`, { waitUntil: "networkidle" });
  await page.waitForSelector("#veiviser");
  await fyll("id", "testkunde-k272"); await fyll("navn", "Testkunde K-272 AS"); await fyll("orgnr", orgnr); await page.check("[name=test]");
  await bilde("1-veiviser-kunde-1440");
  await page.click("#veiviser [type=submit]");
  await page.waitForSelector("[name=butikker]");
  await fyll("butikker", "Testkjøkken Oslo\nTestkjøkken Bergen"); await fyll("merker", "Sigdal\nHengsel furu");
  await bilde("2-veiviser-butikker-og-merker-1440");
  await page.click("#veiviser [type=submit]");
  await page.waitForSelector("[name=tema]");
  await bilde("3-veiviser-domene-og-tema-1440");
  await page.click("#veiviser [type=submit]");
  await page.waitForSelector("[name=admin_epost]");
  await fyll("admin_epost", "es@sngroup.no"); await fyll("admin_navn", "Eirik");
  await bilde("4-veiviser-administrator-1440");
  await page.click("#veiviser [type=submit]");
  await page.waitForSelector("#start");
  await bilde("5-oppsummering-1440");
  await page.setViewportSize({ width: 390, height: 844 }); await bilde("5-oppsummering-390"); await page.setViewportSize({ width: 1440, height: 900 });
  await page.check("[name=bekreftet]");
  await page.click("#start-knapp");
  await page.waitForURL(/\/oppstart\/ny-kunde\/[0-9A-Z]{26}/);
  const id = page.url().split("/").pop();
  sier(kall.length === 1 && kall[0].url.endsWith("/workflows/ny-kunde.yml/dispatches") && kall[0].body.inputs.jobb_id === id, "Action-en ble startet med jobb-id-en");
  await page.waitForSelector(".jobb-steg");
  await bilde("6-fremdrift-venter-pa-action-1440");
  const ok = (steg, sekunder, resultat = {}, logg = "") => rapporter({ jobb_id: id, steg, status: "ok", sekunder, resultat, logg });
  await ok("miljo", 9, { miljo: "kunde-testkunde-k272", hemmeligheter: ["SUPABASE_ACCESS_TOKEN", "SUPABASE_DB_PASSWORD", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"] }, "Laget miljøet kunde-testkunde-k272 (tillatt gren: bare main).\nHemmeligheter i kunde-testkunde-k272: SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID. Verdiene vises ikke.");
  await rapporter({ jobb_id: id, steg: "supabase", status: "feil", sekunder: 4, feil: "Supabase-organisasjonen har planen «free», ikke Pro. Oppgrader organisasjonen før en kunde opprettes.", logg: "Organisasjon SN Group: plan free." });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector("[data-prov]");
  await bilde("7-fremdrift-steg-feilet-prov-igjen-1440");
  kall.length = 0;
  await page.click('[data-prov="supabase"]');
  await page.waitForSelector(".banner.info");
  sier(kall.length === 1 && kall[0].body.inputs.fra_steg === "supabase", "«Prøv igjen herfra» startet Action-en fra steg 2");
  await ok("supabase", 212, { supabase_ref: "abcdefghijklmnopqrst" }, "Region: eu-central-1 (samme som produksjon).\nLaget Supabase-prosjektet hengsel-testkunde-k272.\nProsjektet er klart (ACTIVE_HEALTHY).");
  await ok("kundelista", 8, { gren: "claude/ny-kunde/testkunde-k272", pr: 41, pr_url: "https://github.com/SNgroup-Drift/hengsel-crm/pull/41" }, "Åpnet PR #41");
  await ok("database", 96, { bokter: 14, cron: 9 }, "Migreringer kjørt. Skjema hengsel og auth-hook finnes.");
  await rapporter({ jobb_id: id, steg: "funksjoner", status: "kjorer" });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".jobb-steg");
  await bilde("8-fremdrift-pagar-1440");
  await ok("funksjoner", 140, { funksjoner: 112 }); await ok("auth", 3); await ok("cloudflare", 190, { pages: "hengsel-testkunde-k272.pages.dev", dns: "automatisk" }); await ok("seed", 7, { admin: "es@sngroup.no", invitasjon: "invitert" }); await ok("royktest", 38, { innlogging: "ok", rls: "skjemaet hengsel er ikke eksponert i API-et ennå (K-247)", transaksjon: "ok" });
  await rapporter({ jobb_id: id, jobb: "ferdig", status: "ok", resultat: { pages_adresse: "hengsel-testkunde-k272.pages.dev", domene: "testkunde-k272.app.hengsel.no", test: true } });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".sjekk-grid");
  await bilde("9-ferdig-med-sjekkliste-1440");
  await page.click("#fjern"); await page.waitForSelector("dialog[open] [name=bekreft]");
  await bilde("10-fjern-testkunde-bekreftelse-1440");
  await page.keyboard.press("Escape");
  const mobil = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", locale: "nb-NO", timezoneId: "Europe/Oslo" });
  const mp = await mobil.newPage();
  await mp.goto(`${lokal.base}/oppstart/ny-kunde/${id}`, { waitUntil: "networkidle" }); await mp.waitForSelector(".sjekk-grid");
  const over = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  sier(over <= 0, `ingen sidelengs rulling på telefon (${over}px)`);
  await bilde("9-ferdig-med-sjekkliste-390", mp);
  await mobil.close();
  await page.goto(`${lokal.base}/oppstart/opprett-kunde`, { waitUntil: "networkidle" }); await page.waitForSelector("#tidligere table");
  await bilde("11-tidligere-oppsett-1440");
} catch (e) { problemer.push(`feilet: ${e.message.split("\n")[0].slice(0, 300)}`); }
sier(!problemer.length, `ingen konsollfeil eller mislykkede forespørsler${problemer.length ? "\n    " + problemer.join("\n    ") : ""}`);
await browser.close(); await lokal.stopp();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
