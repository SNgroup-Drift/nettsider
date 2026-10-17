#!/usr/bin/env node
/**
 * K-240, N-4: skjermbilder av Hengsel Admin med eksempeldata, lokalt (uten Cloudflare): 1440 og 390 px, sidene i sidekartet 26-001–26-013 og tilstandene
 * tom, laster, feil og ingen treff. Lagres i claude/n4-skjermbilder/ (UT=… for en annen mappe). Sjekker også konsollfeil, mislykkede forespørsler, CSP-brudd og sidelengs rulling.
 *   npm run build -w sites/admin && node scripts/skjermbilder-k240.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldata } from "./lib/admin-eksempeldata.mjs";
import { leggInnEksempeldataB } from "./lib/admin-eksempeldata-b.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "n4-skjermbilder"));
await mkdir(ut, { recursive: true });

const env = { DB: await lagTestdatabase() };
const ider = await leggInnEksempeldata(env);
await leggInnEksempeldataB(env, ider); // N-4: sakene fra «Hjelp» til 26-008 Tilbakemeldinger
const { base, stopp } = await startAdminLokalt({ dist: join(rot, "sites", "admin", "dist"), env });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };

/** [navn, sti, { vent, bredder, handling, laster }]. N-4: sidene i sidekartet 26-001–26-013 (1440 og 390 der fasiten har Telefon 390) og tilstandene. */
const SKJERMER = [
  ["26-001-innlogging", "/logg-inn", { vent: ".innlogging-flate .kort" }],
  ["26-002-eiere", "/salg/eiere", { vent: ".k-tabell tbody tr[data-lenke]" }],
  ["26-002-kunder", "/kunder", { vent: ".k-tabell tbody tr[data-lenke]", bredder: [1440] }],
  ["26-003-prisliste", "/innstillinger/prisliste", { vent: "#pakker .k-tabell", bredder: [1440] }],
  ["26-004-avtaler", "/avtaler", { vent: ".k-tabell tbody tr[data-lenke]", bredder: [1440] }],
  ["26-004-dokumenter", "/avtaler?status=dokumenter", { vent: "#dokumenter", bredder: [1440] }],
  ["26-004-avtale-signering", `/avtaler/${ider.avtaleNordli}`, { vent: ".signatarer", bredder: [1440] }],
  ["26-005-prisberegner", `/salg/prisberegner?eier=${ider.nordli}`, { vent: "#pakke-per-butikk .k-tabell", bredder: [1440] }],
  ["26-005-hele-eieren", `/salg/prisberegner?eier=${ider.nordli}`, { vent: "#pakke-per-butikk .k-tabell", bredder: [1440], handling: async (p) => { await p.click('[data-k-fane="eier"]'); await p.waitForSelector("#gjelder"); } }],
  ["26-005-sum", `/salg/prisberegner?eier=${ider.nordli}`, { vent: "#pakke-per-butikk .k-tabell", bredder: [1440], handling: async (p) => { await p.click('[data-k-fane="sum"]'); await p.waitForSelector("#sum"); } }],
  ["26-007-import", "/salg/import", { vent: "#forhandsvisning", bredder: [1440], handling: async (p) => {
    const { lagXlsxEksempel } = await import("./lib/admin-xlsx-eksempel.mjs");
    await p.setInputFiles("#fil", { name: "kjedeliste-sigdal-okt.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: lagXlsxEksempel() });
    await p.waitForSelector("#forhandsvisning .k-tabell"); } }],
  ["26-008-tilbakemeldinger", "/innstillinger/tilbakemeldinger", { vent: "#tilbakemeldinger .k-finnhold > :not(.k-skjelett)", bredder: [1440] }],
  ["26-009-salg", "/", { vent: ".k-tavlekort" }],
  ["26-009-salg-liste", "/", { vent: ".k-tavlekort", bredder: [1440], handling: async (p) => { await p.click('[data-k-fane="liste"]'); await p.waitForSelector("#salgsliste"); } }],
  ["26-009-tavle-tapt-dialog", "/salg/tavle", { vent: ".k-tavlekort", bredder: [1440], handling: async (p) => {
    // Dra et kort fra Forhandling til Tapt (slippfeltet vises mens kortet dras): dialogen «Marker … som tapt» krever grunn
    const kort = p.locator('.k-kolonne[data-kolonne="forhandling"] .k-tavlekort').first();
    const k = await kort.boundingBox();
    await p.mouse.move(k.x + 20, k.y + 20); await p.mouse.down(); await p.mouse.move(k.x + 40, k.y + 40, { steps: 4 });
    await p.waitForSelector(".k-tapt-slipp:not([hidden])");
    const m = await p.locator(".k-tapt-slipp").boundingBox();
    await p.mouse.move(m.x + 20, m.y + 20, { steps: 6 }); await p.mouse.up();
    await p.waitForSelector("dialog[open]"); await p.check('dialog[open] input[value="For dyrt"]'); } }],
  ["26-010-leverandor", "/innstillinger/leverandor", { vent: "#skjema-leverandor", bredder: [1440] }],
  ["26-011-stotte", "/stotte", { vent: ".k-tekstflis", bredder: [1440] }],
  ["26-012-fakturering", "/fakturering", { vent: ".k-tekstflis", bredder: [1440] }],
  ["26-013-eierkort", `/salg/eiere/${ider.nordli}`, { vent: "#kontakter .k-liste" }],
  ["26-013-eierkort-kunde", `/kunder/${ider.granlund}`, { vent: "#miljo", bredder: [1440] }],
  ["26-013-eierkort-lead", `/salg/eiere/${ider.haugen}`, { vent: ".banner.info", bredder: [1440] }],
  ["26-013-tidslinje", `/salg/eiere/${ider.nordli}#tidslinje`, { vent: ".tidslinje", bredder: [1440] }],
  ["ny-aktivitet", `/salg/eiere/${ider.nordli}`, { vent: "#kontakter .k-liste", bredder: [1440], handling: async (p) => { await p.click("#ny-akt"); await p.waitForSelector("#dlg-aktivitet[open]"); await p.fill("#dlg-aktivitet [name=tittel]", "Ringte Kari om tilbudet"); } }],
  ["fase-b-saker", "/support/saker", { vent: "main", bredder: [1440] }],
  ["drift", "/drift/status", { vent: "main", bredder: [1440] }],
  ["tilstand-salg-tom", "/?tilstand=tom", { vent: ".k-tom", bredder: [1440] }],
  ["tilstand-salg-laster", "/?tilstand=laster", { vent: ".k-skjelett", laster: true, bredder: [1440] }],
  ["tilstand-salg-feil", "/?tilstand=feil", { vent: ".banner", bredder: [1440] }],
  ["tilstand-eiere-ingen-treff", "/salg/eiere?sok=Bergen", { vent: ".k-tom", bredder: [1440] }],
  ["tilstand-eierkort-feil", `/salg/eiere/${ider.nordli}?tilstand=feil`, { vent: ".k-tom", bredder: [1440] }],
  ["telefon-mer-skuff", "/", { vent: ".k-tavlekort", bredder: [390], handling: async (p) => { await p.click("#fane-mer"); await p.waitForTimeout(300); } }],
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
  if (ok) await writeFile(join(ut, "26-006-tilbud.pdf"), pdf);
  sier(ok, `26-006-tilbud.pdf (${pdf.length} byte)`);
}

await browser.close();
await stopp();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
