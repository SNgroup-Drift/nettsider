/**
 * K-202: mørk modus i en ekte nettleser. Maskinen står i mørk modus (Playwright colorScheme: 'dark'), og forsiden og to undersider av
 * hver Hengsel-side (hengsel, vis, admin, design) lastes fra dist. Testen feiler hvis computed color-scheme på <html> ikke er «light»,
 * eller hvis body-bakgrunnen ikke er --flate-side (lest fra den delte token-fila, ikke skrevet inn her).
 * Kjør `npm run build` først. Chromium: CHROMIUM_PATH hvis Playwrights egen ikke finnes. Feiler hvis dist mangler.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
export const SIDER = {
  hengsel: ["/", "/crm", "/priser-og-demo"],
  vis: ["/", "/crm/", "/dokumenter/"],
  admin: ["/", "/kunder"],
  design: ["/", "/farger", "/komponenter"],
};

// N-7: Hengsel-sidene har data-produkt på html (designsystem 2.5): nettsider for hengsel, vis og design, admin for admin. Bakgrunnen er da grunn i produktpaletten.
const produktJson = JSON.parse(readFileSync(join(rot, "packages", "hengsel-tokens", "ds", "tokens", "hengsel.tokens.json"), "utf8")).produkt;
const FORVENTET_PRODUKT = { hengsel: "nettsider", vis: "nettsider", design: "nettsider", admin: "admin" };
const tilRgb = (h) => `rgb(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ")})`;

const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const servere = [];
after(async () => { await nettleser.close(); for (const s of servere) s.close(); });

for (const [side, stier] of Object.entries(SIDER)) {
  const dist = join(rot, "sites", side, "dist");
  test(`mørk maskin: ${side} er lys og har --flate-side som bakgrunn`, async () => {
    assert.ok(existsSync(dist), `${side}: dist mangler, kjør npm run build først (testen hoppes ikke over)`);
    const server = await startServer(dist);
    servere.push(server);
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const sti of stier) {
      const ctx = await nettleser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
      const p = await ctx.newPage();
      const svar = await p.goto(base + sti, { waitUntil: "load" });
      assert.equal(svar.status(), 200, `${side}${sti} ga ${svar.status()}`);
      assert.equal(await p.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches), true, "nettleseren er ikke i mørk modus");
      const r = await p.evaluate(() => ({ produkt: document.documentElement.dataset.produkt, cs: getComputedStyle(document.documentElement).colorScheme, bg: getComputedStyle(document.body).backgroundColor }));
      await ctx.close();
      assert.equal(r.cs, "light", `${side}${sti}: color-scheme på html er «${r.cs}», skal være light`);
      assert.equal(r.produkt, FORVENTET_PRODUKT[side], `${side}${sti}: data-produkt på html er «${r.produkt}», skal være «${FORVENTET_PRODUKT[side]}»`);
      const grunn = produktJson[FORVENTET_PRODUKT[side]].lys.grunn;
      assert.equal(r.bg, tilRgb(grunn), `${side}${sti}: body-bakgrunn er ${r.bg}, skal være --flate-side i produktpaletten ${r.produkt} (${grunn})`);
    }
  });
}
