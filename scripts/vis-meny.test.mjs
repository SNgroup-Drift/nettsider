/**
 * K-229 tillegg 1: Visningsrommet har én side per menyfane, både vis.hengsel.no og Sigdal-utgaven (/kunde/sigdal/vis/). Kjør `npm run build` først.
 *  a) /forsta/, /prov/, /dokumenter/ og /presenter/ finnes, og menyen på hver av dem lenker til de fire sidene (ikke til ankre)
 *  b) aktiv side har aria-current="page" (på rommene under Prøv står aria-current="true" på Prøv); ingen sider har ankerlenker (#forsta osv.) i menyen
 *  c) forsiden er en kort inngang: rollevelgeren og fire kort til sidene, ingen romkort
 *  d) Sigdal-utgaven har de samme sidene og lenkene med /kunde/sigdal/vis som rot, og laster Sigdal-temaet
 *  e) i en ekte nettleser: gamle ankerlenker (/#forsta, /#prov, /#dokumenter, /#presenter) sendes til den nye siden, i begge utgavene, og ≡-menyen på 390 px viser aktiv side
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
const UTGAVER = [
  { navn: "vis", dist: join(rot, "sites", "vis", "dist"), base: "" },
  { navn: "Sigdal", dist: join(rot, "sites", "hengsel", "dist", "kunde", "sigdal", "vis"), base: "/kunde/sigdal/vis" },
];
const SIDER = [["forsta", "Forstå"], ["prov", "Prøv"], ["dokumenter", "Dokumenter"], ["presenter", "Presenter"]];
const GRUPPER = ["butikken", "montoren", "kunden", "leverandoren"];
const side = (u, sti) => readFileSync(join(u.dist, sti, "index.html"), "utf8");
const meny = (html) => /<nav class="meny"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? "";

for (const u of UTGAVER) {
  test(`a) ${u.navn}: de fire sidene finnes og menyen lenker til dem`, () => {
    for (const [id] of SIDER) assert.ok(existsSync(join(u.dist, id, "index.html")), `${u.navn}: /${id}/ mangler`);
    for (const sti of ["", ...SIDER.map(([id]) => id), ...GRUPPER, "rom"]) {
      const m = meny(sti === "" ? readFileSync(join(u.dist, "index.html"), "utf8") : side(u, sti));
      for (const [id, navn] of SIDER) assert.match(m, new RegExp(`<a href="${u.base}/${id}/"[^>]*>${navn}</a>`), `${u.navn}: /${sti}/ mangler menylenken til ${id}`);
      assert.ok(!/href="[^"]*#/.test(m), `${u.navn}: /${sti}/ har fortsatt ankerlenker i menyen`);
    }
  });

  test(`b) ${u.navn}: aktiv side markeres med aria-current`, () => {
    for (const [id, navn] of SIDER) {
      const m = meny(side(u, id));
      assert.match(m, new RegExp(`<a href="${u.base}/${id}/" aria-current="page">${navn}</a>`), `${u.navn}: /${id}/ markerer ikke seg selv`);
      assert.equal((m.match(/aria-current/g) ?? []).length, 1, `${u.navn}: /${id}/ har mer enn én aktiv`);
    }
    for (const g of GRUPPER) assert.match(meny(side(u, g)), /aria-current="true">Prøv</, `${u.navn}: /${g}/ hører til Prøv`);
    assert.ok(!/aria-current/.test(meny(readFileSync(join(u.dist, "index.html"), "utf8"))), `${u.navn}: forsiden har ingen aktiv fane`);
  });

  test(`c) ${u.navn}: forsiden er en kort inngang med rollevelger og fire kort`, () => {
    const h = readFileSync(join(u.dist, "index.html"), "utf8");
    assert.match(h, /id="roles"/);
    const kort = [...h.matchAll(/class="card sidekort" href="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(kort, SIDER.map(([id]) => `${u.base}/${id}/`));
    assert.ok(!/class="card rom"|class="card gruppe-kort"|class="ark-rad"/.test(h), "romkort, gruppekort og A4-ark hører til menysidene");
    for (const [id] of SIDER) assert.ok(!new RegExp(`id="${id}"`).test(h), `forsiden skal ikke lenger ha seksjonen #${id}`);
  });
}

test("d) Sigdal-utgaven laster Sigdal-temaet og har ingen lenker ut av /kunde/sigdal/vis", () => {
  const u = UTGAVER[1];
  for (const [id] of SIDER) {
    const h = side(u, id);
    assert.match(h, /href="\/kunde\/sigdal\/tema\.css"/, `/kunde/sigdal/vis/${id}/ mangler Sigdal-temaet`);
    assert.match(h, /data-kunde="sigdal"/);
    assert.ok(!/href="\/(?!sigdal\/)(forsta|prov|dokumenter|presenter)\//.test(h), `/kunde/sigdal/vis/${id}/ lenker til Hengsel-utgaven`);
  }
});

const servere = [];
after(() => Promise.all(servere.map((s) => s.close())));
test("e) i nettleseren: gamle ankerlenker sendes til den nye siden, og ≡-menyen viser aktiv side", async () => {
  const nettleser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    const hvor = { vis: join(rot, "sites", "vis", "dist"), Sigdal: join(rot, "sites", "hengsel", "dist") };
    for (const u of UTGAVER) {
      const server = await startServer(hvor[u.navn]);
      servere.push(server);
      const url = `http://127.0.0.1:${server.address().port}`;
      for (const [id] of SIDER) {
        const ctx = await nettleser.newContext({ viewport: { width: 1280, height: 800 } });
        const p = await ctx.newPage();
        await p.goto(`${url}${u.base}/#${id}`, { waitUntil: "load" });
        await p.waitForURL(`${url}${u.base}/${id}/`, { timeout: 5000 });
        assert.equal(new URL(p.url()).pathname, `${u.base}/${id}/`, `${u.navn}: /#${id}`);
        await ctx.close();
      }
      // rollen følger med når ankeret har en spørring
      const c2 = await nettleser.newContext({ viewport: { width: 1280, height: 800 } });
      const p2 = await c2.newPage();
      await p2.goto(`${url}${u.base}/?rolle=montor#prov`, { waitUntil: "load" });
      await p2.waitForURL(`${url}${u.base}/prov/?rolle=montor`, { timeout: 5000 });
      await c2.close();
      // 390 px: ≡-menyen åpner, og den aktive siden er markert
      const mob = await nettleser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const pm = await mob.newPage();
      await pm.goto(`${url}${u.base}/forsta/`, { waitUntil: "load" });
      assert.ok(!(await pm.locator("#meny").isVisible()), `${u.navn}: menyen er lukket på mobil`);
      await pm.locator("#menyknapp").click();
      assert.ok(await pm.locator("#meny").isVisible(), `${u.navn}: ≡ åpner menyen`);
      assert.equal(await pm.locator('#meny a[aria-current="page"]').innerText(), "Forstå");
      await pm.goto(`${url}${u.base}/dokumenter/`, { waitUntil: "load" });
      await pm.locator("#menyknapp").click();
      assert.equal(await pm.locator('#meny a[aria-current="page"]').innerText(), "Dokumenter", `${u.navn}: ≡-menyen virker på /dokumenter/`);
      await mob.close();
    }
  } finally {
    await nettleser.close();
  }
});
