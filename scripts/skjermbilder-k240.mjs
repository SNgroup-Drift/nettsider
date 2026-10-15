#!/usr/bin/env node
/**
 * K-240: skjermbilder av Hengsel Admin fase A med eksempeldata, lokalt (uten Cloudflare): 1440 og 390 px, alle skjermene SA1–SA9 og tilstandene
 * tom, laster, feil og ingen treff. Lagres i claude/k240/ (bare disse). Sjekker også konsollfeil, mislykkede forespørsler, CSP-brudd og sidelengs rulling.
 *   npm run build -w sites/admin && node scripts/skjermbilder-k240.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldata } from "./lib/admin-eksempeldata.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "k240"));
await mkdir(ut, { recursive: true });

const env = { DB: await lagTestdatabase() };
const ider = await leggInnEksempeldata(env);
const { base, stopp } = await startAdminLokalt({ dist: join(rot, "sites", "admin", "dist"), env });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };

/** [navn, sti, { vent, bredder, handling, laster }] */
const SKJERMER = [
  ["sa1-oversikt", "/", { vent: ".tall .kort" }],
  ["sa2-tavle", "/salg/tavle", { vent: ".tavlekort" }],
  ["sa2-tavle-tapt-dialog", "/salg/tavle", { vent: ".tavlekort", bredder: [1440], handling: async (p) => {
    // Dra et kort fra Forhandling til Tapt: dialogen «Marker … som tapt» krever grunn
    await p.dragAndDrop('.tavle .kolonne[data-kolonne="forhandling"] .tavlekort >> nth=0', '.tavle .kolonne[data-kolonne="tapt"]');
    await p.waitForSelector("dialog[open]"); await p.check('dialog[open] input[value="For dyrt"]'); } }],
  ["sa3-eiere", "/salg/eiere", { vent: ".tabell tbody tr" }],
  ["sa3-eiere-import", "/salg/eiere?import=1", { vent: "dialog[open]", bredder: [1440], handling: async (p) => {
    const { lagXlsxEksempel } = await import("./lib/admin-xlsx-eksempel.mjs");
    await p.setInputFiles("dialog[open] input[type=file]", { name: "kjedeliste-sigdal-okt.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: lagXlsxEksempel() });
    await p.click("dialog[open] [data-send]"); await p.waitForSelector("#forhandsvisning table"); } }],
  ["sa3-kunder", "/kunder", { vent: ".tabell tbody tr" }],
  ["sa4-eierkort-prospekt", `/salg/eiere/${ider.nordli}`, { vent: ".tidslinje" }],
  ["sa4-eierkort-kunde", `/kunder/${ider.granlund}`, { vent: ".tidslinje" }],
  ["sa4-eierkort-lead", `/salg/eiere/${ider.haugen}`, { vent: ".banner.info" }],
  ["sa5-prisberegner", `/salg/prisberegner?eier=${ider.nordli}`, { vent: ".butikklinje", bredder: [1440] }],
  ["sa7-avtaler", "/avtaler", { vent: ".tabell tbody tr" }],
  ["sa7-avtale-signering", `/avtaler/${ider.avtaleNordli}`, { vent: ".signatarer" }],
  ["sa7-avtale-signert", `/avtaler/${ider.avtaleGranlund}`, { vent: ".signatarer", bredder: [1440] }],
  ["sa8-ny-aktivitet", `/salg/eiere/${ider.nordli}`, { vent: ".tidslinje", handling: async (p) => { await p.click("#ny-akt"); await p.waitForSelector("#dlg-aktivitet[open]"); await p.fill("#dlg-aktivitet [name=tittel]", "Ringte Kari om tilbudet"); } }],
  ["sa9-prisliste", "/innstillinger/prisliste", { vent: ".versjoner", bredder: [1440] }],
  ["sa9-leverandor", "/innstillinger/leverandor", { vent: "#skjema", bredder: [1440] }],
  ["drift", "/drift", { vent: ".lenkeliste", bredder: [1440] }],
  ["tilstand-tavle-tom", "/salg/tavle?tilstand=tom", { vent: ".tom" }],
  ["tilstand-tavle-laster", "/salg/tavle?tilstand=laster", { vent: ".skjelett", laster: true }],
  ["tilstand-tavle-feil", "/salg/tavle?tilstand=feil", { vent: ".banner" }],
  ["tilstand-eiere-ingen-treff", "/salg/eiere?sok=Bergen", { vent: ".tom" }],
  ["tilstand-eierkort-feil", `/salg/eiere/${ider.nordli}?tilstand=feil`, { vent: ".tom" }],
  ["tilstand-eierkort-laster", `/salg/eiere/${ider.nordli}?tilstand=laster`, { vent: ".skjelett", laster: true, bredder: [390] }],
  ["telefon-mer-skuff", "/", { vent: ".tall .kort", bredder: [390], handling: async (p) => { await p.click("#fane-mer"); await p.waitForTimeout(300); } }],
];

for (const [navn, sti, valg] of SKJERMER) {
  for (const b of valg.bredder ?? [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: b, height: b < 500 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "nb-NO", timezoneId: "Europe/Oslo" });
    const page = await ctx.newPage();
    const problemer = [];
    page.on("console", (m) => m.type() === "error" && problemer.push(`konsoll: ${m.text().slice(0, 200)}`));
    page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 200)}`));
    page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(base, "")}`));
    try {
      await page.goto(base + sti, { waitUntil: valg.laster ? "load" : "networkidle" });
      await page.waitForSelector(valg.vent, { timeout: 15000, state: "attached" });
      if (valg.handling) await valg.handling(page);
      await page.waitForTimeout(250);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) problemer.push(`sidelengs rulling: ${overflow}px`);
      await page.screenshot({ path: join(ut, `${navn}-${b}.png`), fullPage: true });
    } catch (e) { problemer.push(`feilet: ${e.message.split("\n")[0].slice(0, 200)}`); }
    sier(!problemer.length, `${navn} ${b}${problemer.length ? "\n    " + problemer.join("\n    ") : ""}`);
    await ctx.close();
  }
}

// Tilbudet som PDF (SA6): fila lagres som den er, siden Chromium ikke tegner PDF uten visning
{
  const r = await fetch(`${base}/salg/tilbud/${ider.tilbudNordli.nr}/${ider.tilbudNordli.versjon}.pdf`);
  const pdf = Buffer.from(await r.arrayBuffer());
  const ok = r.status === 200 && pdf.subarray(0, 5).toString("latin1") === "%PDF-";
  if (ok) await writeFile(join(ut, "sa6-tilbud-pdf.pdf"), pdf);
  sier(ok, `sa6-tilbud-pdf.pdf (${pdf.length} byte)`);
}

await browser.close();
await stopp();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
