/**
 * K-229: strukturen på nettsidene. Kjør `npm run build` først.
 *  a) sngroup.no: Hengsel er ett kort med lenke til hengsel.no, uten skjermbilder eller enhetsrammer
 *  b) hengsel.no: «Prøv selv» til demo.hengsel.no på forsiden; Dokumenter og Slik virker det er ikke lenger i åpne sider, meny, bunn eller sitemap
 *  c) /kunde: forsiden har de fire kortene, og alle sidene under /kunde har noindex og ingen lenker til gamle adresser
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const les = (...s) => readFileSync(join(rot, ...s), "utf8");
const hengsel = join(rot, "sites", "hengsel", "dist");
const alle = (dir) => readdirSync(dir).flatMap((e) => { const s = join(dir, e); return statSync(s).isDirectory() ? alle(s) : [s]; });

test("a) sngroup.no: Hengsel er ett kort med lenke til hengsel.no, uten skjermbilder", () => {
  const h = les("sites", "sngroup", "dist", "index.html");
  const seksjon = /<section id="hengsel"[\s\S]*?<\/section>/.exec(h)?.[0];
  assert.ok(seksjon, "mangler Hengsel-seksjonen");
  assert.equal((seksjon.match(/class="hg-kort"/g) ?? []).length, 1, "ett kort");
  assert.match(seksjon, /href="https:\/\/hengsel\.no"/);
  assert.doesNotMatch(seksjon, /skjermbilder\/|enheter\/|data-enheter|<picture|\.webp/, "ingen skjermbilder eller rammer i Hengsel-kortet");
  assert.doesNotMatch(h, /\/skjermbilder\/|\/enheter\/|data-enheter/, "ingen skjermbilder eller rammer på sngroup.no");
  assert.ok(!existsSync(join(rot, "sites", "sngroup", "dist", "skjermbilder")) && !existsSync(join(rot, "sites", "sngroup", "dist", "enheter")));
});

test("b) hengsel.no: Prøv selv til demoen, og Dokumenter og Slik virker det er ikke lenger åpne sider", () => {
  const forside = les("sites", "hengsel", "dist", "index.html");
  assert.match(forside, /<a class="btn primary"[^>]*href="https:\/\/demo\.hengsel\.no"[^>]*>Prøv selv<\/a>/);
  for (const side of alle(hengsel).filter((f) => f.endsWith(".html") && !/[\\/]kunde(\.html$|[\\/])/.test(f))) {
    const t = readFileSync(side, "utf8");
    assert.doesNotMatch(t, /href="\/(?:dokumenter|slik-virker-det)["#]/, `${side}: lenker til en side som er flyttet`);
  }
  for (const f of ["dokumenter.html", "slik-virker-det.html", "hjelp.html", "sigdal.html"]) assert.ok(!existsSync(join(hengsel, f)), `${f} skal ikke finnes lenger (videresendes av _redirects)`);
  const sitemap = les("sites", "hengsel", "dist", "sitemap.txt");
  assert.doesNotMatch(sitemap, /\/(?:dokumenter|slik-virker-det|kunde|hjelp|sigdal)(?:[/\s]|$)/m);
});

test("c) /kunde: fire kort, noindex og ingen gamle adresser", () => {
  const h = les("sites", "hengsel", "dist", "kunde.html");
  const kort = [...h.matchAll(/<li class="card[^"]*"[^>]*>[\s\S]*?<a href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(kort, ["/kunde/hjelp", "/kunde/apptest", "/kunde/dokumenter", "/kunde/sigdal"]);
  for (const f of ["kunde.html", ...alle(join(hengsel, "kunde")).filter((x) => x.endsWith(".html")).map((x) => x.slice(hengsel.length + 1))]) {
    const t = les("sites", "hengsel", "dist", f);
    assert.match(t, /<meta name="robots" content="noindex,\s?nofollow">/, `${f}: noindex`);
    assert.doesNotMatch(t, /href="\/(?:hjelp|sigdal|dokumenter)(?:[/"#])/, `${f}: gammel adresse`);
  }
  assert.match(les("sites", "hengsel", "dist", "kunde", "hjelp.html"), /href="\/kunde"/, "hjelp lenker tilbake til /kunde");
});
