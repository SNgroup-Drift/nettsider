/**
 * K-223: kundetema. /sigdal bruker bare Sigdal-temaet (packages/kundetema-sigdal), og Hengsel-sidene bare Hengsel-temaet. Kjør `npm run build` først.
 *  a) Sigdal-paletten er den som er bestilt: bare de åtte fargene, aldri #FFFFFF og ingen rosa/magenta
 *  b) hver farge-rolle i den delte Hengsel-fila er byttet ut i Sigdal-temaet (ingen Hengsel-farge kan slå gjennom via en variabel)
 *  c) bygde sider: alle under /sigdal har data-kunde, laster /sigdal/tema.css og har noindex; ingen Hengsel-side har noe av det, og ingen Hengsel-side har Sigdal-skriften
 *  d) kundeutgaven har ingen Hengsel-logoer, ingen lenker ut av /sigdal (unntatt hengsel.no/personvern, mailto og tel) og ingen Hengsel-skjermbilder
 *  e) hver tekstserstatning i profil.json treffer minst én gang i de bygde Hengsel-sidene
 *  f) i en ekte nettleser: ingen element på /sigdal har en Hengsel-farge, og ingen element på Hengsel-sidene har en Sigdal-farge
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const dist = join(rot, "sites", "hengsel", "dist");
const les = (...s) => readFileSync(join(...s), "utf8");
const alle = (dir) => readdirSync(dir).flatMap((e) => { const s = join(dir, e); return statSync(s).isDirectory() ? alle(s) : [s]; });
const profil = JSON.parse(les(rot, "packages", "kundetema-sigdal", "profil.json"));
const temaCss = les(rot, "packages", "kundetema-sigdal", "tokens.css");
const temaUtenKommentar = temaCss.replace(/\/\*[\s\S]*?\*\//g, "");
const deltCss = les(rot, "packages", "hengsel-tokens", "tokens.css");
const hex = (t) => [...t.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map((m) => m[0].toLowerCase());
const tilRgb = (h) => `rgb(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ")})`;

const PALETT = { "warm-black": "#31261d", "off-white": "#fbf9f6", "beige-4": "#f8f2ec", "beige-3": "#f2e9db", "beige-2": "#e4d4c4", "beige-1": "#c3b5a7", "deep-blue": "#5074a9", "dusty-blue": "#9ca9bd" };

test("a) Sigdal-paletten er den bestilte, bare lys modus, aldri #FFFFFF og ingen rosa/magenta", () => {
  for (const [navn, verdi] of Object.entries(PALETT)) {
    const m = new RegExp(`--sigdal-${navn}:\\s*(#[0-9A-Fa-f]{6})`).exec(temaCss);
    assert.ok(m, `--sigdal-${navn} mangler`);
    assert.equal(m[1].toLowerCase(), verdi, `--sigdal-${navn}`);
  }
  assert.deepEqual([...new Set(hex(temaUtenKommentar))].sort(), Object.values(PALETT).sort(), "temaet skal ha bare de åtte fargene som hex");
  assert.ok(!/#fff(?:fff)?\b/i.test(temaUtenKommentar), "aldri #FFFFFF");
  assert.ok(!/(prefers-color-scheme|data-theme|color-scheme:\s*dark)/.test(temaCss), "bare lys modus");
  assert.match(temaCss, /Newsreader Variable/);
  assert.match(temaCss, /Inter Variable/);
  assert.match(temaCss, /--sigdal-vekt-underoverskrift:\s*650/);
});

test("b) hver farge-rolle i den delte Hengsel-fila er byttet ut i Sigdal-temaet", () => {
  const blokk = deltCss.slice(deltCss.indexOf(":root {"), deltCss.indexOf("/* nettbrett */"));
  const erFarge = (v) => /#[0-9A-Fa-f]{3,8}\b|rgba?\(|color\(/.test(v);
  const roller = [...blokk.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].filter(([, n, v]) => erFarge(v) && !n.startsWith("--kunde-eksempel-")).map((m) => m[1]);
  assert.ok(roller.length > 50, `fant bare ${roller.length} farge-roller`);
  const mangler = roller.filter((n) => !new RegExp(`${n}:\\s`).test(temaCss));
  assert.deepEqual(mangler, [], "disse Hengsel-rollene er ikke byttet ut i packages/kundetema-sigdal/tokens.css");
});

test("c) bygde sider: /sigdal har temaet, Hengsel-sidene har det ikke", () => {
  assert.ok(existsSync(join(dist, "sigdal", "tema.css")), "kjør npm run build først");
  const sider = alle(dist).filter((f) => f.endsWith(".html"));
  const sigdal = sider.filter((f) => relative(dist, f).startsWith("sigdal"));
  const hengsel = sider.filter((f) => !relative(dist, f).startsWith("sigdal"));
  assert.ok(sigdal.length >= 8 + 25, `fant ${sigdal.length} Sigdal-sider (8 sider og Visningsrommet)`);
  for (const f of sigdal) {
    const t = readFileSync(f, "utf8");
    const r = relative(dist, f);
    assert.match(t, /<html[^>]* data-kunde="sigdal"/, `${r}: data-kunde`);
    assert.ok(t.includes('href="/sigdal/tema.css"'), `${r}: laster ikke /sigdal/tema.css`);
    assert.match(t, /<meta name="robots" content="noindex,\s?nofollow">/, `${r}: noindex,nofollow`);
  }
  for (const f of hengsel) {
    const t = readFileSync(f, "utf8");
    const r = relative(dist, f);
    assert.ok(!t.includes("data-kunde") && !t.includes("/sigdal/tema.css") && !/Newsreader|Inter Variable/.test(t), `${r}: har kundetema eller Sigdal-skrift`);
    assert.ok(!hex(t.replace(/<script[\s\S]*?<\/script>/g, "")).some((h) => Object.values(PALETT).includes(h) && !hex(deltCss).includes(h)), `${r}: har Sigdal-farger`);
  }
  // Sigdal-skriftene og -fargene finnes bare i tema.css (og skriftfilene), ikke i noen Hengsel-CSS
  for (const f of alle(dist).filter((x) => x.endsWith(".css") && !relative(dist, x).startsWith("sigdal"))) {
    assert.ok(!/Newsreader|Inter Variable/.test(readFileSync(f, "utf8")), `${relative(dist, f)}: Sigdal-skrift i Hengsel-CSS`);
  }
  assert.ok(!existsSync(join(dist, "sitemap.txt")) || !/\/sigdal(?:\/|\s|$)/m.test(les(dist, "sitemap.txt")), "sitemap");
});

test("d) kundeutgaven har ingen Hengsel-logoer, ingen lenker ut av /sigdal og ingen Hengsel-skjermbilder", () => {
  const sigdal = alle(join(dist, "sigdal")).filter((f) => f.endsWith(".html"));
  for (const f of sigdal) {
    const t = readFileSync(f, "utf8");
    const r = relative(dist, f);
    assert.ok(!/\/logo\/hengsel-|\/assets\/logo\//.test(t), `${r}: Hengsel-logo`);
    assert.ok(!/Hengsel CRM|Butikknavn/.test(t), `${r}: «Hengsel CRM» eller «Butikknavn» står igjen`);
    // Studio Display-rammen (Apples ramme, ingen Hengsel-farger) er den eneste filen som hentes fra /img
    const utenRamme = t.replace(/\/img\/ramme-studio-display\.webp/g, "");
    assert.ok(!/(?:src|srcset|poster)="\/(?:img|skjermbilder)\//.test(utenRamme) && !/,\s\/(?:img|skjermbilder)\//.test(utenRamme), `${r}: skjermbilde utenfor /sigdal/img`);
    for (const m of t.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const u = m[1];
      if (/^(#|mailto:|tel:|https:\/\/hengsel\.no\/personvern$)/.test(u)) continue;
      if (/^https:\/\/(?!(?:www\.|vis\.)?hengsel\.no)/.test(u)) continue; // eksterne tjenester (TestFlight, Google Play …)
      if (u === "/img/ramme-studio-display.webp" || u.startsWith("/_astro/") || /^\/favicon[-.]/.test(u) || u.startsWith("/cdn-cgi/")) continue;
      assert.ok(u.startsWith("/sigdal"), `${r}: lenke ut av /sigdal: ${u}`);
    }
  }
});

test("e) hver tekstserstatning i profil.json treffer i de bygde Hengsel-sidene", () => {
  const kilde = [...profil.sider, "/priser-og-demo"].map((s) => join(dist, s === "/" ? "index.html" : `${s.slice(1)}.html`)).filter(existsSync).map((f) => readFileSync(f, "utf8")).join("\n");
  const visTekst = alle(join(rot, "sites", "vis", "src")).filter((f) => /\.(html|js)$/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n") + les(rot, "packages", "hengsel-dokumenter", "src", "render.js");
  const ingen = profil.tekst.map(([fra]) => fra).filter((fra) => !kilde.includes(fra) && !visTekst.includes(fra));
  assert.deepEqual(ingen, [], "erstatninger som ikke treffer noe (fjern dem eller rett teksten)");
});

// f) nettleser
const FARGEEGENSKAPER = ["color", "backgroundColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor", "fill", "stroke"];
const farger = async (page) => page.evaluate((egenskaper) => {
  const ut = new Set();
  for (const e of document.querySelectorAll("body, body *")) {
    const cs = getComputedStyle(e);
    for (const p of egenskaper) { const v = cs[p]; if (v && /^rgb/.test(v)) ut.add(v.replace(/rgba\((\d+), (\d+), (\d+), 1\)/, "rgb($1, $2, $3)")); }
  }
  return [...ut];
}, FARGEEGENSKAPER);

test("f) i nettleseren: /sigdal har ingen Hengsel-farger, og Hengsel-sidene ingen Sigdal-farger", async () => {
  assert.ok(existsSync(dist), "kjør npm run build først");
  const blokk = deltCss.slice(deltCss.indexOf(":root {"), deltCss.indexOf("/* nettbrett */"));
  const hengselFarger = new Set(hex(blokk.replace(/--kunde-eksempel-[^;]+;/g, "")).map(tilRgb));
  const sigdalFarger = new Set(Object.values(PALETT).map(tilRgb));
  for (const s of sigdalFarger) hengselFarger.delete(s);
  for (const h of hengselFarger) assert.ok(!sigdalFarger.has(h));
  const server = await startServer(dist);
  const base = `http://127.0.0.1:${server.address().port}`;
  const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    const sjekk = async (sti, ikkeLov, hva) => {
      const ctx = await nettleser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(base + sti, { waitUntil: "networkidle" });
      const funnet = (await farger(page)).filter((c) => ikkeLov.has(c));
      await ctx.close();
      assert.deepEqual(funnet, [], `${sti}: ${hva}`);
    };
    for (const sti of ["/sigdal", "/sigdal/crm", "/sigdal/ute", "/sigdal/kundeportal", "/sigdal/slik-virker-det", "/sigdal/dokumenter", "/sigdal/integrasjoner", "/sigdal/apptest", "/sigdal/vis/", "/sigdal/vis/crm/", "/sigdal/vis/minside/"]) await sjekk(sti, hengselFarger, "Hengsel-farge på Sigdal-siden");
    for (const sti of ["/", "/crm", "/kundeportal", "/ute"]) await sjekk(sti, sigdalFarger, "Sigdal-farge på Hengsel-siden");
  } finally {
    await nettleser.close();
    server.close();
  }
});
