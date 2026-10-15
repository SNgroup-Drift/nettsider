#!/usr/bin/env node
/**
 * K-259: skjermbilder av Hengsel Admin fase B med eksempeldata, lokalt (uten Cloudflare): SB1 Saker, SB2 Sak, SB3 Timer, SO1 og SO2 Oppstart,
 * SA1 Oversikt med de nye kortene, Innstillinger › Support og «Ingen tilgang». 1440 px (og 390 px for SB1, SB2 og SO2 som er tegnet på
 * telefon), som rolle eier og rolle support, pluss tilstandene tom, laster og feil. Lagres i claude/k259/. Sjekker konsollfeil, mislykkede
 * forespørsler og sidelengs rulling.
 *   npm run build -w sites/admin && node scripts/skjermbilder-k259.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldata } from "./lib/admin-eksempeldata.mjs";
import { leggInnEksempeldataB, SUPPORTBRUKER } from "./lib/admin-eksempeldata-b.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "k259"));
await mkdir(ut, { recursive: true });

const env = { DB: await lagTestdatabase() };
const ider = await leggInnEksempeldataB(env, await leggInnEksempeldata(env));
const dist = join(rot, "sites", "admin", "dist");
const eier = await startAdminLokalt({ dist, env });
const support = await startAdminLokalt({ dist, env, bruker: SUPPORTBRUKER });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };
const BEGGE = [1440, 390];

/** [navn, sti, { vent, bredder, rolle, handling, laster, forventet403 }] */
const SKJERMER = [
  ["sa1-oversikt-eier", "/", { vent: "#fase-bc .kort" }],
  ["sb1-saker-eier", "/support/saker", { vent: ".saktabell tbody tr", bredder: BEGGE }],
  ["sb1-saker-filter-hoy", "/support/saker?prioritet=hoy", { vent: ".saktabell tbody tr" }],
  ["sb2-sak-eier", "/support/saker/H-1047", { vent: ".melding", bredder: BEGGE }],
  ["sb2-sak-internt-notat", "/support/saker/H-1047", { vent: ".melding", handling: async (p) => { await p.click('.skriv-topp [data-modus="intern"]'); await p.fill("#skrivfelt", "Code bekrefter: SVG med innebygd font støttes ikke ennå."); } }],
  ["sb2-sak-epostutkast", "/support/saker/H-1047", { vent: ".melding", handling: async (p) => { await p.click("[data-epost]"); await p.waitForSelector("dialog[open] .epost-tekst"); } }],
  ["sb2-sak-epost-uten-hjelp", "/support/saker/H-1046", { vent: ".melding" }],
  ["sb3-timer-eier", "/support/timer", { vent: ".timetabell tbody tr" }],
  ["so2-oppstart", "/oppstart", { vent: ".oppstarttabell tbody tr", bredder: BEGGE }],
  ["so1-oppstart-kunde", `/oppstart/${ider.oppstart.nordli}`, { vent: ".sjekkliste tbody tr" }],
  ["so1-oppstart-statusmeny", `/oppstart/${ider.oppstart.nordli}`, { vent: ".sjekkliste tbody tr", handling: async (p) => { await p.click(".sjekkliste [data-punkt] >> nth=4"); await p.waitForSelector(".statusmeny"); } }],
  ["innstillinger-support", "/innstillinger/support", { vent: "#skjema" }],
  ["ny-sak-dialog", "/support/saker", { vent: ".saktabell tbody tr", handling: async (p) => { await p.click(".toppfelt [data-ny-sak] >> visible=true"); await p.waitForSelector("dialog[open] [name=emne]"); await p.fill("dialog[open] [name=emne]", "Spørsmål om faktura"); } }],
  // Rollen support
  ["sb1-saker-support", "/support/saker", { vent: ".saktabell tbody tr", rolle: "support", bredder: BEGGE }],
  ["sb2-sak-support", "/support/saker/H-1047", { vent: ".melding", rolle: "support", bredder: BEGGE }],
  ["sb3-timer-support", "/support/timer", { vent: ".timetabell tbody tr", rolle: "support" }],
  ["ingen-tilgang-support", "/fakturering/kjoring", { vent: ".ingen-tilgang", rolle: "support", forventet403: true, bredder: BEGGE }],
  // Tilstander
  ["tilstand-saker-tom", "/support/saker?tilstand=tom", { vent: ".tom" }],
  ["tilstand-saker-laster", "/support/saker?tilstand=laster", { vent: ".skjelett", laster: true }],
  ["tilstand-saker-feil", "/support/saker?tilstand=feil", { vent: ".banner" }],
  ["tilstand-saker-ingen-treff", "/support/saker?sok=finnesikke", { vent: ".tom" }],
  ["tilstand-sak-tom", "/support/saker/H-1048?tilstand=tom", { vent: ".traad .tom" }],
  ["tilstand-sak-laster", "/support/saker/H-1047?tilstand=laster", { vent: ".skjelett", laster: true }],
  ["tilstand-sak-feil", "/support/saker/H-1047?tilstand=feil", { vent: "#skriv-feil .banner" }],
  ["tilstand-oppstart-kunde-tom", `/oppstart/${ider.oppstart.nordli}?tilstand=tom`, { vent: ".tom" }],
  ["tilstand-oppstart-kunde-feil", `/oppstart/${ider.oppstart.nordli}?tilstand=feil`, { vent: "#lagre-feil .banner" }],
  ["tilstand-oppstart-laster", "/oppstart?tilstand=laster", { vent: ".skjelett", laster: true }],
];

for (const [navn, sti, valg] of SKJERMER) {
  const base = valg.rolle === "support" ? support.base : eier.base;
  for (const b of valg.bredder ?? [1440]) {
    const ctx = await browser.newContext({ viewport: { width: b, height: b < 500 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "nb-NO", timezoneId: "Europe/Oslo" });
    const page = await ctx.newPage();
    const problemer = [];
    page.on("console", (m) => m.type() === "error" && !(valg.forventet403 && /403/.test(m.text())) && !/fakturakjoring\/neste|404/.test(m.text()) && problemer.push(`konsoll: ${m.text().slice(0, 200)}`));
    page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 200)}`));
    page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(base, "")}`));
    try {
      const r = await page.goto(base + sti, { waitUntil: valg.laster ? "load" : "networkidle" });
      if (valg.forventet403 && r.status() !== 403) problemer.push(`forventet 403, fikk ${r.status()}`);
      await page.waitForSelector(valg.vent, { timeout: 15000, state: "attached" });
      if (valg.handling) await valg.handling(page);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) problemer.push(`sidelengs rulling: ${overflow}px`);
      await page.screenshot({ path: join(ut, `${navn}-${b}.png`), fullPage: true });
    } catch (e) { problemer.push(`feilet: ${e.message.split("\n")[0].slice(0, 200)}`); }
    sier(!problemer.length, `${navn} ${b}${problemer.length ? "\n    " + problemer.join("\n    ") : ""}`);
    await ctx.close();
  }
}

await browser.close();
await eier.stopp(); await support.stopp();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
