#!/usr/bin/env node
/**
 * Sjekker at alle interne lenker på de bygde sidene svarer 200.
 *
 * Starter en liten statisk server per nettsted (sites/*\/dist) som løser stier slik Cloudflare Workers gjør med html_handling «auto-trailing-slash»
 * (/ → index.html, /personvern → personvern.html), finner alle href/src i HTML og CSS, og ber om hver av dem.
 * Lenker til #id sjekkes også mot id-ene på målsiden. Eksterne lenker, mailto: og tel: hoppes over.
 * Til slutt sjekkes at dist/404.html finnes, og at en ukjent side svarer 404 med den siden.
 * Skjermbilder som byttes inn av skript (data-bilde og JSON i siden, f.eks. fanene på hengsel.no) sjekkes også,
 * og alle filene i dist/img må svare 200. For Visningsrommet (vis) sjekkes også rommene i arrayet C på forsiden.
 *
 * Kjør etter `npm run build`: npm test
 */
import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { startServer } from "./statisk-server.mjs";

const rot = resolve(import.meta.dirname, "..");
async function htmlFiler(dir, pre = "") {
  const ut = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) ut.push(...(await htmlFiler(join(dir, e.name), `${pre}/${e.name}`)));
    else if (e.name.endsWith(".html") && e.name !== "404.html") {
      ut.push(e.name === "index.html" ? `${pre}/` : `${pre}/${e.name.replace(/\.html$/, "")}`);
    }
  }
  return ut;
}

// /cdn-cgi/ (f.eks. utlogging fra Cloudflare Access i Visningsrommet) serveres av Cloudflare, ikke fra dist
const intern = (u) => !/^(https?:|mailto:|tel:|data:|\/\/|\/cdn-cgi\/)/i.test(u) && u !== "";

let feil = 0;
let sjekket = 0;
const nettsteder = (await readdir(join(rot, "sites"))).sort();

for (const navn of nettsteder) {
  const dist = join(rot, "sites", navn, "dist");
  try {
    await stat(dist);
  } catch {
    console.error(`✗ ${navn}: fant ikke ${dist}. Kjør npm run build først.`);
    feil++;
    continue;
  }
  const server = await startServer(dist);
  const base = `http://127.0.0.1:${server.address().port}`;
  const sider = await htmlFiler(dist);
  const ko = [...sider];
  const sett = new Set(ko);
  const idCache = new Map();
  const mangler = [];

  const hentIder = async (side) => {
    if (!idCache.has(side)) {
      const r = await fetch(new URL(side, base));
      const html = r.ok ? await r.text() : "";
      idCache.set(side, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    }
    return idCache.get(side);
  };

  while (ko.length) {
    const side = ko.shift();
    const r = await fetch(new URL(side, base));
    sjekket++;
    if (r.status !== 200) {
      mangler.push(`${side} → ${r.status}`);
      continue;
    }
    const type = r.headers.get("content-type") ?? "";
    const js = type.includes("javascript");
    if (!type.includes("html") && !type.includes("css") && !js) continue;
    const tekst = await r.text();
    // href/src i HTML, og url(...) i CSS (også inline <style>, der skriftene ligger)
    const lenker = [
      ...(type.includes("html") ? [...tekst.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]) : []),
      ...[...tekst.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/["']/g, "")),
      // Rommene i Visningsrommet (vis): kortene lages av skript (side.js) fra arrayet C, med adressen i u:'/rom/'
      // og skjermbildet i b:'/img/navn.webp'
      ...(type.includes("html") || js ? [...tekst.matchAll(/\b[ub]:'(\/[^']*)'/g)].map((m) => m[1]) : []),
    ].filter((l) => !l.includes("'+")); // href="'+c.u+'" er en mal i skriptet, ikke en lenke
    for (const lenke of lenker) {
      if (!intern(lenke)) continue;
      const url = new URL(lenke, new URL(side, base));
      if (url.hash && url.pathname === new URL(side, base).pathname && lenke.startsWith("#")) {
        const ider = await hentIder(side);
        if (!ider.has(url.hash.slice(1))) mangler.push(`${side}: ${lenke} → mangler id`);
        continue;
      }
      if (url.hash) {
        const ider = await hentIder(url.pathname);
        if (!ider.has(decodeURIComponent(url.hash.slice(1)))) mangler.push(`${side}: ${lenke} → mangler id`);
      }
      if (!sett.has(url.pathname)) {
        sett.add(url.pathname);
        ko.push(url.pathname);
      }
    }
  }
  // Skjermbilder som skriptene bytter inn: data-bilde="navn" og "bilde":"navn" i siden. Et par vises som navn-a og navn-b.
  const bilder = new Set();
  for (const side of sider) {
    const html = await (await fetch(new URL(side, base))).text();
    for (const m of html.matchAll(/data-bilde="([\w-]+)"|"bilde":"([\w-]+)"/g)) bilder.add(m[1] ?? m[2]);
  }
  for (const b of bilder) {
    const enkel = await fetch(new URL(`/img/${b}.webp`, base));
    sjekket++;
    if (enkel.status === 200) continue;
    for (const del of ["a", "b"]) {
      const r = await fetch(new URL(`/img/${b}-${del}.webp`, base));
      sjekket++;
      if (r.status !== 200) mangler.push(`skjermbilde ${b} (${b}.webp eller ${b}-${del}.webp) → ${r.status}`);
    }
  }
  let antallBilder = 0;
  try {
    for (const f of (await readdir(join(dist, "img"))).filter((f) => !f.startsWith("."))) {
      const r = await fetch(new URL(`/img/${f}`, base));
      sjekket++;
      antallBilder++;
      if (r.status !== 200) mangler.push(`/img/${f} → ${r.status}`);
    }
  } catch {}

  // 404-siden: Workers serverer dist/404.html med status 404 for ukjente stier (not_found_handling)
  try {
    await stat(join(dist, "404.html"));
    const r = await fetch(new URL("/finnes-ikke-k87", base));
    sjekket++;
    const html = await r.text();
    if (r.status !== 404 || !html.includes("<html")) mangler.push(`/finnes-ikke-k87 → ${r.status}, forventet 404 med 404.html`);
  } catch {
    mangler.push("dist/404.html mangler");
  }
  // /apptest (hengsel.no, testsiden): «Bli tester» og «App Store» lenker dit (hengsel.no 2.0, K-160), men den står ikke i sitemap og har noindex,nofollow
  for (const side of sider) {
    const html = await (await fetch(new URL(side, base))).text();
    if (side.startsWith("/apptest")) {
      if (!/<meta name="robots" content="noindex,\s?nofollow">/.test(html)) mangler.push(`${side}: mangler robots noindex,nofollow`);
    }
  }
  try {
    const sitemap = await (await fetch(new URL("/sitemap.txt", base))).text();
    if (sitemap.includes("/apptest")) mangler.push("sitemap.txt: inneholder /apptest");
  } catch {}

  server.close();
  if (mangler.length) {
    feil += mangler.length;
    console.error(`✗ ${navn}: ${mangler.length} feil`);
    for (const m of mangler) console.error(`    ${m}`);
  } else {
    console.log(`✓ ${navn}: ${sett.size} interne adresser svarer 200 (${sider.join(", ")})${antallBilder ? `, ${antallBilder} bilder i img/ svarer 200 (${bilder.size} skjermbilder brukt av fanene)` : ""}, og ukjente sider får 404.html`);
  }
}

console.log(`\n${sjekket} forespørsler, ${feil} feil.`);
process.exit(feil ? 1 : 0);
