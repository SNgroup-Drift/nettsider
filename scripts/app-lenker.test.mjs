// Vakt for app-lenkene på hengsel.no (K-170): apple-app-site-association og siden «Åpne i Hengsel Ute».
// Leser kildene i sites/hengsel/public og, når nettstedet er bygget, dist/ (kjør `npm run build` først for å få med bygget).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
  assert.match(r, /^\/app\/jobb\/\*\s+\/app\/lenke\s+200$/m);
  assert.match(r, /^\/app\/foresporsel\/\*\s+\/app\/lenke\s+200$/m);
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

// K-200: /app/jobb/<id> på PC sendes videre til jobben i CRM-et
import { CRM_ADRESSE, RUTER, crmAdresse, erTelefon, lesLenke } from "../sites/hengsel/src/content/crm-lenke.mjs";

const UUID = "3f0c1a2b-1111-4222-8333-444455556666";

test("K-200: gyldig id gir riktig CRM-adresse", () => {
  assert.equal(CRM_ADRESSE, "https://crm.studiosigdal-innlandet.no");
  assert.equal(crmAdresse("jobb", UUID), `https://crm.studiosigdal-innlandet.no/#/orders/${UUID}`);
  assert.equal(crmAdresse("jobb", "123"), "https://crm.studiosigdal-innlandet.no/#/orders/123");
  assert.deepEqual(lesLenke(`/app/jobb/${UUID}`), { type: "jobb", id: UUID });
  assert.deepEqual(lesLenke("/app/jobb/123/"), { type: "jobb", id: "123" });
});

test("K-200: ugyldig id gir ingen videresending", () => {
  for (const id of ["", "a b", "a/b", "..", "../x", "a.b", "a?b=c", "a#b", "a%2Fb", "//evil.example", "https:evil", "x".repeat(65), "<script>", "æøå", "a\nb"]) {
    assert.equal(crmAdresse("jobb", id), null, JSON.stringify(id));
  }
  for (const sti of ["/app/jobb/", "/app/jobb", "/app/jobb/a/b", "/app/jobb/a%2Fb", "/app/jobb//evil.example", "/app/jobb/..", "/app/annet/123", "/app/jobb/a.b", "/x/app/jobb/123"]) {
    assert.equal(lesLenke(sti), null, sti);
  }
  assert.equal(crmAdresse("ukjent", "123"), null);
  assert.equal(crmAdresse("__proto__", "123"), null);
  assert.equal(crmAdresse("jobb", undefined), null);
});

test("K-200: verten er alltid CRM_ADRESSE, uansett id", () => {
  for (const id of [UUID, "123", "a-b_c", "A".repeat(64)]) {
    const u = new URL(crmAdresse("jobb", id));
    assert.equal(u.origin, CRM_ADRESSE);
    assert.equal(u.pathname, "/");
    assert.equal(u.hash, `#/orders/${id}`);
  }
});

test("K-200: forespørsel har ingen CRM-rute ennå, så ingen videresending", () => {
  assert.equal(RUTER.foresporsel, null);
  assert.deepEqual(lesLenke("/app/foresporsel/abc"), { type: "foresporsel", id: "abc" });
  assert.equal(crmAdresse("foresporsel", "abc"), null);
});

test("K-200: PC og telefon skilles", () => {
  assert.equal(erTelefon("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15", 5), true);
  assert.equal(erTelefon("Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/130 Mobile", 5), true);
  assert.equal(erTelefon("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15", 5), true); // iPadOS
  assert.equal(erTelefon("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15", 0), false);
  assert.equal(erTelefon("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36", 0), false);
});

test("K-200: CRM-adressen står bare i crm-lenke.mjs", () => {
  const funn = [];
  const gå = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const f = join(dir, e.name);
      if (e.isDirectory()) { if (!["node_modules", "dist", ".astro"].includes(e.name)) gå(f); }
      else if (/\.(astro|ts|mjs|js|html|json|txt|css)$/.test(e.name) && /studiosigdal-innlandet\.no/.test(readFileSync(f, "utf8"))) funn.push(f);
    }
  };
  gå(join(site, "src"));
  gå(join(site, "public"));
  assert.deepEqual(funn.map((f) => f.slice(site.length + 1)), ["src/content/crm-lenke.mjs"]);
});

test("K-200: siden /app/lenke: noindex, ingen inline-skript, ingen fargeverdier, lenke til appen", { skip: !existsSync(join(site, "dist", "app", "lenke.html")) && "ikke bygget" }, () => {
  const html = readFileSync(join(site, "dist", "app", "lenke.html"), "utf8");
  assert.match(html, /<meta name="robots" content="noindex,\s?nofollow">/);
  assert.match(html, /Åpne jobben i CRM-et/);
  assert.match(html, /Hent Hengsel-appen/);
  assert.match(html, /href="\/apptest"/);
  assert.ok(!/<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>/.test(html), "ingen inline-skript (CSP)");
  assert.ok(!html.includes("studiosigdal-innlandet.no"), "CRM-adressen skal bare komme fra skriptet, ikke stå i HTML-en");
  const kilde = readFileSync(join(site, "src", "pages", "app", "lenke.astro"), "utf8") + readFileSync(join(site, "src", "scripts", "app-lenke.ts"), "utf8");
  assert.ok(!/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch|color-mix)a?\(\s*\d/.test(kilde), "ingen fargeverdier utenfor token-fila");
  assert.ok(!html.includes("prefers-color-scheme"));
});
