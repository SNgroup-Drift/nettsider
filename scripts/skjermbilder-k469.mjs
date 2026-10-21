#!/usr/bin/env node
/**
 * K-469: skjermbilder av Hengsel Admin etter fase A (Støtte, Oppstart, Fakturering, Tall og Drift på kitet fra N-4, D-12 del B), lokalt med
 * eksempeldata (fase A, B og C), uten Cloudflare. 1440 px av alle nye sider, og 390 px av SB1, SB2 og SO2, som rolle eier og rolle support.
 * Lagres i claude/k469-skjermbilder/. Sjekker konsollfeil, mislykkede forespørsler, statuskode og sidelengs rulling.
 *   npm run build -w sites/admin && node scripts/skjermbilder-k469.mjs          (bare noen: BARE=sb1,so2 node scripts/skjermbilder-k469.mjs)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { lagTestdatabase } from "./lib/d1-node.mjs";
import { leggInnEksempeldataC } from "./lib/admin-eksempeldata-c.mjs";
import { leggInnEksempeldataB, SUPPORTBRUKER } from "./lib/admin-eksempeldata-b.mjs";
import { startAdminLokalt } from "./lib/admin-lokal.mjs";

const rot = resolve(import.meta.dirname, "..");
const ut = resolve(process.env.UT ?? join(rot, "claude", "k469-skjermbilder"));
await mkdir(ut, { recursive: true });

const env = { DB: await lagTestdatabase() };
const ider = await leggInnEksempeldataB(env, await leggInnEksempeldataC(env));
const dist = join(rot, "sites", "admin", "dist");
const eier = await startAdminLokalt({ dist, env });
const support = await startAdminLokalt({ dist, env, bruker: SUPPORTBRUKER });
const ukjent = await startAdminLokalt({ dist, env, bruker: { epost: "navn@eksempel.no", navn: "Ukjent" } });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
let feil = 0;
const sier = (ok, tekst) => { console.log(`${ok ? "✓" : "✗"} ${tekst}`); if (!ok) feil++; };
const BEGGE = [1440, 390];
const bare = (process.env.BARE ?? "").split(",").filter(Boolean);

/** [navn, sti, { vent, bredder, rolle, status }] */
const SKJERMER = [
  ["26-009-oversikt-eier", "/", { vent: "#ov-kort .k-liste, #ov-kort .k-tom" }],
  ["26-011-sb1-saker-eier", "/stotte", { vent: "#saker tbody tr", bredder: BEGGE }],
  ["26-011-sb1-saker-support", "/stotte", { vent: "#saker tbody tr", rolle: "support", bredder: BEGGE }],
  ["sb2-sak-eier", "/support/saker/H-1047", { vent: ".melding", bredder: BEGGE }],
  ["sb2-sak-support", "/support/saker/H-1047", { vent: ".melding", rolle: "support", bredder: BEGGE }],
  ["sb3-timer-eier", "/support/timer", { vent: "#timer tbody tr" }],
  ["sb3-timer-support", "/support/timer", { vent: "#timer tbody tr", rolle: "support" }],
  ["so1-oppstart", "/oppstart", { vent: "#oppstarter tbody tr" }],
  ["so2-oppstart-kunde", `/oppstart/${ider.oppstart?.nordli}`, { vent: "#sjekkliste tbody tr", bredder: BEGGE }],
  ["26-012-sc2-fakturakjoring", "/fakturering", { vent: "#fakturaer" }],
  ["sc1-abonnement", `/fakturering/abonnement?id=${ider.abo?.granlund}`, { vent: "#abonnement" }],
  ["sc3-kpi", "/fakturering/kpi", { vent: "#kpi" }],
  ["sc4-utestaende", "/fakturering/utestaende", { vent: "#utestaende" }],
  ["st1-tall", "/tall", { vent: "#tall-inntekt" }],
  ["sd1-status", "/drift/status", { vent: "#miljoer" }],
  ["sd2-lenker", "/drift/lenker", { vent: "#lenker" }],
  ["sd2-kontoer", "/drift/kontoer", { vent: "#kontoer" }],
  ["sd2-frister", "/drift/frister", { vent: "#frister" }],
  ["sd2-rutiner", "/drift/rutiner", { vent: "#rutiner" }],
  ["kunder-support", "/kunder", { vent: "[data-k-tabell] tbody tr", rolle: "support" }],
  ["ingen-tilgang-support", "/fakturering", { vent: ".ingen-tilgang", rolle: "support", status: 403 }],
  ["26-001-ingen-tilgang", "/", { vent: "[data-steg=ingen]", rolle: "ukjent", status: 403 }],
];

for (const [navn, sti, valg] of SKJERMER) {
  if (bare.length && !bare.some((b) => navn.includes(b))) continue;
  const base = { support: support.base, ukjent: ukjent.base }[valg.rolle] ?? eier.base;
  for (const b of valg.bredder ?? [1440]) {
    const ctx = await browser.newContext({ viewport: { width: b, height: b < 500 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "nb-NO", timezoneId: "Europe/Oslo" });
    const page = await ctx.newPage();
    const problemer = [];
    page.on("console", (m) => m.type() === "error" && !(valg.status && /403/.test(m.text())) && problemer.push(`konsoll: ${m.text().slice(0, 200)}`));
    page.on("pageerror", (e) => problemer.push(`sidefeil: ${e.message.slice(0, 200)}`));
    page.on("requestfailed", (r) => problemer.push(`mislyktes: ${r.url().replace(base, "")}`));
    try {
      const r = await page.goto(base + sti, { waitUntil: "networkidle" });
      if (r.status() !== (valg.status ?? 200)) problemer.push(`status ${r.status()}, ventet ${valg.status ?? 200}`);
      await page.waitForSelector(valg.vent, { timeout: 15000, state: "attached" });
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
await eier.stopp(); await support.stopp(); await ukjent.stopp();
console.log(feil ? `\n${feil} feil` : "\nAlt grønt");
process.exit(feil ? 1 : 0);
