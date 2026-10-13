/**
 * design.hengsel.no: stilene til sidene og komponentene kommer med i dist og gjelder på alle skjermbredder.
 *
 * Bakgrunn: en `@media`-blokk i src/styles/design.css manglet sin avsluttende `}` (K-192), så alle reglene etter den havnet inne i mediesøket og gjaldt
 * bare på telefonbredde. Bygget var grønt, og siden så uten stil ut på PC (fargeprøver som tekst, kort som understrekede lenker, bunnteksten flyter sammen).
 *
 * Testen laster alle åtte sidene i sites/design/dist i en ekte nettleser (Chromium, med _headers/CSP som på Cloudflare) i 1440 og 390 px og sjekker:
 *  - kilden: design.css har like mange { som }, og alle <style>-blokker i dist er balanserte
 *  - hver CSS-klasse siden bruker finnes i en regel (ingen klasser uten stil), og kjernereglene (.meny, .bunn, .hode, .sek …) står på øverste nivå, ikke inni en @media
 *  - computed style: fargeprøvene på /farger har bakgrunnsfarge og høyde, kortene på forsiden er uten understrek og er rutenett, bunnen er rutenett, menyen er sticky
 *  - hver <style>-blokk har sin sha256 i CSP-en i dist/_headers (ellers blokkerer nettleseren blokken)
 * Kjør `npm run build` først. Chromium: CHROMIUM_PATH hvis Playwrights egen ikke finnes. Feiler hvis dist mangler.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const dist = join(rot, "sites", "design", "dist");
const SIDER = [["/", "forside"], ["/merke", "merke"], ["/farger", "farger"], ["/skrift", "skrift"], ["/komponenter", "komponenter"], ["/skjermer", "skjermer"], ["/last-ned", "last-ned"], ["/finnes-ikke", "404"]];
/** Klasser som bare er markører (ingen egen regel) */
const UTEN_REGEL = [];
/** Reglene som MÅ stå på øverste nivå: de gjelder på alle bredder */
const KJERNE = [".meny", ".bunn", ".hode", ".wrap", ".side", ".sek", ".kort", ".skip", ".pille", ".knapp"];

const bygd = () => assert.ok(existsSync(join(dist, "index.html")), "sites/design/dist mangler: kjør npm run build først (testen hoppes ikke over)");
const balanse = (css) => { let d = 0; for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, "")) { if (ch === "{") d++; else if (ch === "}") d--; if (d < 0) return -1; } return d; };

test("kilden: design.css har balanserte klammer, og alle <style>-blokker i dist er balanserte med riktig CSP-hash", () => {
  assert.equal(balanse(readFileSync(join(rot, "sites", "design", "src", "styles", "design.css"), "utf8")), 0, "design.css: en { mangler sin } (eller omvendt), så reglene etter havner inni forrige blokk");
  bygd();
  const hoder = readFileSync(join(dist, "_headers"), "utf8");
  const csp = /Content-Security-Policy: ([^\n]+)/.exec(hoder)[1];
  for (const f of readdirSync(dist).filter((f) => f.endsWith(".html"))) {
    const html = readFileSync(join(dist, f), "utf8");
    const blokker = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
    assert.ok(blokker.length >= 1, `${f}: ingen <style>-blokker`);
    for (const [i, b] of blokker.entries()) {
      assert.equal(balanse(b), 0, `${f}: <style>-blokk ${i + 1} er ikke balansert`);
      assert.ok(csp.includes(`'sha256-${createHash("sha256").update(b).digest("base64")}'`), `${f}: <style>-blokk ${i + 1} mangler hashen i CSP-en (blokkeres av nettleseren)`);
    }
  }
});

const server = existsSync(dist) ? await startServer(dist) : null;
const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
after(async () => { await nettleser.close(); server?.close(); });

for (const bredde of [1440, 390]) {
  test(`${bredde} px: hver side har stilene til komponentene og sidene`, async () => {
    bygd();
    const base = `http://127.0.0.1:${server.address().port}`;
    const feil = [];
    for (const [sti, navn] of SIDER) {
      const ctx = await nettleser.newContext({ viewport: { width: bredde, height: 900 }, reducedMotion: "reduce" });
      const p = await ctx.newPage();
      const csp = [];
      p.on("console", (m) => { if (/content security policy/i.test(m.text())) csp.push(m.text().slice(0, 160)); });
      await p.goto(base + sti, { waitUntil: "networkidle" });
      const r = await p.evaluate(({ KJERNE, UTEN_REGEL }) => {
        const topp = []; // selektorer på øverste nivå
        const alle = []; // selektorer også inni @media, @supports
        const gaa = (regler, nivaa) => { for (const x of regler) { if (x.selectorText) { (nivaa === 0 ? topp : alle).push(x.selectorText); alle.push(x.selectorText); } else if (x.cssRules) gaa(x.cssRules, nivaa + 1); } };
        for (const ark of document.styleSheets) gaa(ark.cssRules, 0);
        const sel = alle.join(" ");
        const klasser = [...new Set([...document.querySelectorAll("[class]")].flatMap((e) => [...e.classList]))];
        const utenRegel = klasser.filter((k) => !UTEN_REGEL.includes(k) && !new RegExp(`\\.${k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\\w-])`).test(sel));
        const bruktKjerne = KJERNE.filter((k) => document.querySelector(k));
        const ikkeTopp = bruktKjerne.filter((k) => !topp.some((s) => s.split(",").some((d) => d.trim() === k || d.trim().startsWith(`${k}:`) || d.trim().startsWith(`${k} `) || d.trim().startsWith(`${k}.`))));
        const cs = (el) => (el ? getComputedStyle(el) : null);
        const sv = cs(document.querySelector(".sv.stor"));
        const kort = cs(document.querySelector("a.kort.lenke"));
        return {
          ark: document.styleSheets.length, utenRegel, ikkeTopp,
          sv: sv && { bg: sv.backgroundColor, h: sv.height },
          kort: kort && { understrek: kort.textDecorationLine, display: kort.display },
          bunn: cs(document.querySelector(".bunn")).display,
          meny: cs(document.querySelector(".meny")).position,
          body: cs(document.body).backgroundColor,
        };
      }, { KJERNE, UTEN_REGEL });
      await ctx.close();
      if (csp.length) feil.push(`${navn}: CSP-brudd: ${csp[0]}`);
      if (r.utenRegel.length) feil.push(`${navn}: klasser uten stilregel: ${r.utenRegel.join(", ")}`);
      if (r.ikkeTopp.length) feil.push(`${navn}: reglene for ${r.ikkeTopp.join(", ")} står ikke på øverste nivå (inni en @media?)`);
      if (r.bunn !== "grid") feil.push(`${navn}: .bunn er display:${r.bunn}, skal være grid`);
      if (r.meny !== "sticky") feil.push(`${navn}: .meny er position:${r.meny}, skal være sticky`);
      if (r.sv && (r.sv.bg === "rgba(0, 0, 0, 0)" || r.sv.h !== "64px")) feil.push(`${navn}: fargeprøvene (.sv.stor) mangler stil: bakgrunn ${r.sv.bg}, høyde ${r.sv.h}`);
      if (r.kort && (r.kort.understrek !== "none" || r.kort.display !== "grid")) feil.push(`${navn}: kortene (.kort.lenke) mangler stil: text-decoration ${r.kort.understrek}, display ${r.kort.display}`);
    }
    assert.deepEqual(feil, []);
  });
}
