// Vakt for app-lenkene på hengsel.no (K-170): apple-app-site-association og siden «Åpne i Hengsel Ute».
// Leser kildene i sites/hengsel/public og, når nettstedet er bygget, dist/ (kjør `npm run build` først for å få med bygget).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const site = join(import.meta.dirname, "..", "sites", "hengsel");
const APP_ID = "XZH4APZ727.no.hengsel.montor"; // DEVELOPMENT_TEAM + PRODUCT_BUNDLE_IDENTIFIER i hengsel-ios/project.yml
const lagt = (rot) => join(site, rot, ".well-known", "apple-app-site-association");

for (const rot of ["public", "dist"]) {
  const finnes = existsSync(lagt(rot));
  test(`${rot}: apple-app-site-association finnes, uten filendelse, med riktig appID`, { skip: rot === "dist" && !existsSync(join(site, "dist")) && "ikke bygget" }, () => {
    assert.ok(finnes, `${lagt(rot)} mangler`);
    const aasa = JSON.parse(readFileSync(lagt(rot), "utf8"));
    const d = aasa.applinks.details;
    assert.equal(d.length, 1);
    assert.deepEqual(d[0].appIDs, [APP_ID]);
    assert.deepEqual(d[0].components.map((c) => c["/"]), ["/app/jobb/*", "/app/foresporsel/*"]);
    assert.ok(!JSON.stringify(aasa).includes("TEAMID"), "plassholderen TEAMID skal ikke stå igjen");
  });
}

test("_headers: AASA serveres som application/json", () => {
  const h = readFileSync(join(site, "public", "_headers"), "utf8");
  assert.match(h, /^\/\.well-known\/apple-app-site-association\n\s+Content-Type: application\/json$/m);
});

test("_redirects: app-stiene skrives om (200), /.well-known omdirigeres ikke", () => {
  const r = readFileSync(join(site, "public", "_redirects"), "utf8");
  assert.match(r, /^\/app\/jobb\/\*\s+\/app\/apne\s+200$/m);
  assert.match(r, /^\/app\/foresporsel\/\*\s+\/app\/apne\s+200$/m);
  assert.ok(!/\.well-known/.test(r.replace(/^#.*$/gm, "")), "ingen regel for /.well-known");
});

test("siden «Åpne i Hengsel Ute»: noindex, lenke til /apptest, ingen skript", { skip: !existsSync(join(site, "dist", "app", "apne.html")) && "ikke bygget" }, () => {
  const html = readFileSync(join(site, "dist", "app", "apne.html"), "utf8");
  assert.match(html, /<meta name="robots" content="noindex,\s?nofollow">/);
  assert.match(html, /<h1[^>]*>Åpne i Hengsel Ute<\/h1>/);
  assert.match(html, /href="\/apptest"/);
  assert.ok(!/<script/.test(html));
  assert.ok(!readFileSync(join(site, "public", "sitemap.txt"), "utf8").includes("/app/"), "siden skal ikke stå i sitemap");
});
