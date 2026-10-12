#!/usr/bin/env node
/**
 * K-177: fiktive skjermer med det nye merket til alle nettsidene.
 *
 * Gjengir skjermer fra designfasiten (Playwright, bare Chromium) til webp. Ingen ekte skjermbilder fra CRM eller apper.
 *  - CRM sju skjermer (eksport/), 10 Tilbud, 15 Kundeportalen, 18 Kontrollmål, 04 Leder, 30 Telefon og iPad, 32 Mål og skisser:
 *    fra innlandet-crm-sync, gren claude/hengsel-merke-v3, docs/design/v4/crm/ (CRM_DESIGN).
 *  - Hengsel Ute (iOS): docs/design/hengsel/hengsel.no/ios/ med «Din logo» på «I dag», uten statuslinje og Dynamic Island
 *    (rammene på nettsidene tegner dem én gang).
 *
 * Alle navn og tall er oppdiktede. Teksten går gjennom ERSTATT før skjermbildet tas, og versjonen nederst i CRM-menyen leses fra
 * sites/hengsel/src/apptest-lenker.ts (ikke «v. 1.4.0» fra designet).
 *
 * Bruk (fra rota):
 *   NPM_DIR=/sti/med/node_modules-mappe CRM_DESIGN=/sti/til/docs/design/v4/crm node scripts/fiktive-skjermer.mjs [--tekst] [mål]
 *   NPM_DIR må inneholde node_modules med react@18.3.1, react-dom@18.3.1 og @babel/standalone@7.29.0 (designfilene henter dem fra unpkg).
 *   --tekst: skriv bare ut all tekst i rammene (for revisjon av navn), ingen bilder.
 *   [mål]: bare disse utfilene (navn uten .webp), f.eks. crm-min-dag.
 * Resultat: sites/vis/src/skjermbilder/<navn>.webp (2× for PC og iPad, 3× for telefon) og claude/k177-skjermer/<navn>@1x.webp (1×).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright";

const rot = path.resolve(import.meta.dirname, "..");
const NPM = path.join(process.env.NPM_DIR ?? "", "node_modules");
const CRM = process.env.CRM_DESIGN ?? path.resolve(rot, "..", "innlandet-crm-sync", "docs", "design", "v4", "crm");
const IOS = path.join(rot, "docs", "design", "hengsel", "hengsel.no", "ios");
const UT = path.join(rot, "sites", "vis", "src", "skjermbilder");
const UT1X = path.join(rot, "claude", "k177-skjermer");
const tekstModus = process.argv.includes("--tekst");
const bare = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const VERSJON = /versjon:\s*"([^"]+)"/.exec(fs.readFileSync(path.join(rot, "sites/hengsel/src/apptest-lenker.ts"), "utf8"))[1];

/** Tekst som byttes i rammene før skjermbildet tas. [mønster, erstatning]. Alt er oppdiktet. */
const ERSTATT = [
  [/v\. \d+\.\d+\.\d+/g, `v. ${VERSJON}`],
  [/(?<!Hoved)Leverandør ([A-Z])\b/g, "Hovedleverandør $1"],
];
import { ERSTATT_NAVN } from "./lib/fiktive-navn.mjs";
ERSTATT.push(...ERSTATT_NAVN);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".otf": "font/otf", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const serve = (dir) => new Promise((ok) => {
  const s = http.createServer((q, res) => {
    const p = path.join(dir, decodeURIComponent(q.url.split("?")[0]));
    fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" }); res.end(d); } });
  });
  s.listen(0, "127.0.0.1", () => ok(s));
});
const LOKALT = {
  "react@18.3.1/umd/react.production.min.js": "react/umd/react.production.min.js",
  "react-dom@18.3.1/umd/react-dom.production.min.js": "react-dom/umd/react-dom.production.min.js",
  "@babel/standalone@7.29.0/babel.min.js": "@babel/standalone/babel.min.js",
};

// ── Hva som lages ────────────────────────────────────────────────────────────────────────────────────────────────
// [utnavn, designfil, skjermkode (starten av data-screen-label, eller eksport:<navn>), nr. ramme i skjermen, skala, klipp-høyde]
const PC = 2, TLF = 3;
const APPTEST = path.join(rot, "sites", "hengsel", "public", "img", "apptest");
const CRM_JOBBER = [
  ["crm-min-dag", "eksport/CRM sju skjermer.dc.html", "eksport:crm-min-dag", 0, PC],
  ["crm-bestilling", "eksport/CRM sju skjermer.dc.html", "eksport:crm-bestilling", 0, PC],
  ["crm-etterkalkyle", "eksport/CRM sju skjermer.dc.html", "eksport:crm-etterkalkyle", 0, PC],
  ["crm-montasje", "eksport/CRM sju skjermer.dc.html", "eksport:crm-montasje", 0, PC],
  ["crm-saker", "eksport/CRM sju skjermer.dc.html", "eksport:crm-saker", 0, PC],
  ["crm-salgstavla", "eksport/CRM sju skjermer.dc.html", "eksport:crm-salgstavla", 0, PC],
  ["crm-resultater", "eksport/CRM sju skjermer.dc.html", "eksport:crm-resultater", 0, PC],
  ["crm-tilbud", "10 Tilbud.dc.html", "T14 ", 0, PC],
  ["crm-mal-skisser", "10 Tilbud.dc.html", "T04.1 ", 0, PC],
  ["crm-ordre-kontrollmal", "18 Kontrollmal befaring belastninger.dc.html", "H3.1 ", 0, PC],
  ["crm-moduler", "04 Innstillinger Leder.dc.html", "I18L ", 1, PC],
  ["crm-tilbud-kunde", "15 Kundeportalen.dc.html", "KP1 ", 0, PC, 900],
  ["kundeportal-pc", "15 Kundeportalen.dc.html", "KP3 ", 0, PC],
  ["crm-ipad-leder", "30 Telefon og iPad.dc.html", "A05 ", 0, PC],
  ["crm-ipad-belastninger", "18 Kontrollmal befaring belastninger.dc.html", "H3.12 ", 0, PC],
  ["crm-ipad-kontrollmal", "18 Kontrollmal befaring belastninger.dc.html", "H3.5 ", 0, PC],
  ["crm-ipad-innstillinger", "30 Telefon og iPad.dc.html", "A08.5 ", 0, PC],
  ["crm-tlf-min-dag", "30 Telefon og iPad.dc.html", "A10.1 ", 0, TLF],
  ["crm-tlf-kundekort", "30 Telefon og iPad.dc.html", "A01 ", 0, TLF],
  ["crm-tlf-ordre", "30 Telefon og iPad.dc.html", "A03 ", 0, TLF],
  ["kundeportal-k03", "15 Kundeportalen.dc.html", "K03 ", 0, TLF],
  ["portal-tilbud", "15 Kundeportalen.dc.html", "K04 ", 0, TLF],
  ["kundeportal-k06", "15 Kundeportalen.dc.html", "K06 ", 0, TLF],
  ["kundeportal-k08", "15 Kundeportalen.dc.html", "K08 ", 0, TLF],
  ["portal-levering", "15 Kundeportalen.dc.html", "K10 ", 0, TLF],
  ["portal-montering", "15 Kundeportalen.dc.html", "K12 ", 0, TLF],
  ["portal-fdv", "15 Kundeportalen.dc.html", "K14 ", 0, TLF],
  ["ute-laser", "32 Mal og skisser.dc.html", "P14 ", 0, TLF],
  // «Slik lages det» (D1–D12) fra 65 Dokumenter slik lages det, lys. 1440 × 810 (16:9) som Studio Display-rammen på Visningsrommet
  ["dok-d1", "65 Dokumenter slik lages det.dc.html", "D1 ", 0, PC],
  ["dok-d2a", "65 Dokumenter slik lages det.dc.html", "D2a ", 0, PC],
  ["dok-d2b", "65 Dokumenter slik lages det.dc.html", "D2b ", 0, PC],
  ["dok-d3", "65 Dokumenter slik lages det.dc.html", "D3 ", 0, PC],
  ["dok-d4", "65 Dokumenter slik lages det.dc.html", "D4 ", 0, PC],
  ["dok-d5", "65 Dokumenter slik lages det.dc.html", "D5 ", 0, PC],
  ["dok-d6", "65 Dokumenter slik lages det.dc.html", "D6 ", 0, PC],
  ["dok-d7", "65 Dokumenter slik lages det.dc.html", "D7 ", 0, PC],
  ["dok-d8", "65 Dokumenter slik lages det.dc.html", "D8 ", 0, PC],
  ["dok-d9", "65 Dokumenter slik lages det.dc.html", "D9 ", 0, PC],
  ["dok-d10", "65 Dokumenter slik lages det.dc.html", "D10 ", 0, PC],
  ["dok-d11", "65 Dokumenter slik lages det.dc.html", "D11 ", 0, PC],
  // /apptest på hengsel.no: telefonrammen på siden tegner statuslinje og Dynamic Island, så skjermene er uten (2×)
  ["foresporsler-lys", "18 Kontrollmal befaring belastninger.dc.html", "H3.13 ", 0, 2, 0, APPTEST],
  ["ruten-lys", "31 Utkjorer-app.dc.html", "U02.2 ", 0, 2, 0, APPTEST],
  ["mottak-lys", "31 Utkjorer-app.dc.html", "U04.2 ", 0, 2, 0, APPTEST],
];
// Hengsel Ute (iOS): [utnavn, iOS-fil, «Din logo» på toppen, bredde, høyde, skala]
const IOS_JOBBER = [
  ["ute-i-dag", "ios/idag-lys", true, 402, 874, TLF],
  ["ute-jobb-under", "ios/jobben-lys", false, 402, 874, TLF],
  ["ute-ks", "ios/ks-lys", false, 402, 874, TLF],
  ["ute-ks-kamera", "ios/bilde-mal", false, 402, 874, TLF],
  ["ute-avvik", "ios/avvik-lys", false, 402, 874, TLF],
  ["ute-punkter", "ios/punkter-lys", false, 402, 874, TLF],
  ["ute-ferdig", "ios/ferdig-lys", false, 402, 874, TLF],
  ["ute-ipad-bildeverktoy", "img/ute-ipad-bildeverktoy", false, 1180, 820, PC],
];
// MacBook-varianter (16:10) lages av PC-bildene
const MB = { "mb-crm-tilbud-kunde": "crm-tilbud-kunde", "mb-crm-ordre-kontrollmal": "crm-ordre-kontrollmal" };

async function nettleser() {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
  return b;
}
async function apne(b, server, fil, skala) {
  const page = await b.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: skala });
  await page.route("https://unpkg.com/**", (r) => {
    const f = LOKALT[r.request().url().replace("https://unpkg.com/", "")];
    return f ? r.fulfill({ path: path.join(NPM, f), contentType: "text/javascript" }) : r.abort();
  });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  page.on("pageerror", (e) => console.warn("  feil på siden:", e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${fil.split("/").map(encodeURIComponent).join("/")}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  await page.evaluate((erstatt) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      let t = n.nodeValue;
      for (const [re, til] of erstatt) t = t.replace(new RegExp(re.source, re.flags), til);
      if (t !== n.nodeValue) n.nodeValue = t;
    }
  }, ERSTATT.map(([re, til]) => [{ source: re.source, flags: re.flags }, til]).map(([r, t]) => [r, t]));
  return page;
}

/** Merker rammen: eksport:<navn> eller skjermen med denne koden og n-te ramme med fast bredde */
async function merk(page, kode, n) {
  return page.evaluate(([kode, n]) => {
    document.querySelectorAll("[data-valgt]").forEach((e) => e.removeAttribute("data-valgt"));
    if (kode.startsWith("eksport:")) {
      const e = document.querySelector(`[data-eksport="${kode.slice(8)}"] > div`) ?? document.querySelector(`[data-eksport="${kode.slice(8)}"]`);
      e.setAttribute("data-valgt", "1");
      return true;
    }
    const s = [...document.querySelectorAll("[data-screen-label]")].find((e) => e.getAttribute("data-screen-label").startsWith(kode));
    if (!s) return false;
    const px = (v) => (/^\d+px$/.test(v) ? parseInt(v) : null);
    const ok = [...s.querySelectorAll("div")].filter((d) => [1440, 1180, 820, 800, 390, 360].includes(px(d.style.width)));
    const ytre = ok.filter((d) => !ok.some((o) => o !== d && o.contains(d)));
    const e = ytre[n];
    if (!e) return false;
    e.setAttribute("data-valgt", "1");
    // Merkelappene i designet («Klikk 3») hører ikke hjemme i skjermbildet
    [...e.querySelectorAll("span, div")].filter((x) => /^Klikk\s*\.?\d/.test((x.textContent ?? "").trim()) && x.children.length === 0).forEach((x) => (x.style.visibility = "hidden"));
    if (px(e.style.width) !== 1440) {
      // Telefon og nettbrett: designet tegner egen ramme og statuslinje. Rammen på nettsiden tegner begge, så de tas bort her.
      e.style.border = "0"; e.style.borderRadius = "0"; e.style.boxShadow = "none";
      const klokke = [...e.querySelectorAll("span, div")].find((x) => /^0?9:41/.test((x.firstChild?.nodeValue ?? "").trim()));
      const rad = klokke?.parentElement;
      if (rad && e.contains(rad) && rad !== e) rad.style.visibility = "hidden";
    }
    return true;
  }, [kode, n]);
}

async function tilWebp(buf, ut, kvalitet = 84) {
  fs.mkdirSync(path.dirname(ut), { recursive: true });
  await sharp(buf).webp({ quality: kvalitet, effort: 5 }).toFile(ut);
}
const ut1x = (navn, buf, w) => sharp(buf).resize({ width: w }).webp({ quality: 82, effort: 5 }).toFile((fs.mkdirSync(UT1X, { recursive: true }), path.join(UT1X, `${navn}@1x.webp`)));

const server = await serve(CRM);
const b = await nettleser();
const ønsket = (navn) => !bare.length || bare.includes(navn);

// CRM-ark: grupper per fil og skala
const perFil = new Map();
for (const j of CRM_JOBBER) if (ønsket(j[0]) || tekstModus) (perFil.get(j[1] + "@" + j[4]) ?? perFil.set(j[1] + "@" + j[4], []).get(j[1] + "@" + j[4])).push(j);
const tekster = [];
for (const [nokkel, jobber] of perFil) {
  const [fil, skala] = [nokkel.split("@")[0], +nokkel.split("@")[1]];
  const page = await apne(b, server, fil, skala);
  for (const [navn, , kode, n, , klipp, mappe = UT] of jobber) {
    if (!(await merk(page, kode, n))) { console.warn(`  ✗ ${navn}: fant ikke ${kode} #${n} i ${fil}`); continue; }
    const loc = page.locator("[data-valgt]");
    if (tekstModus) { tekster.push(`## ${navn}\n` + (await loc.innerText()).replace(/\n+/g, " · ")); continue; }
    let buf;
    if (klipp) {
      const bb = await loc.boundingBox();
      buf = await page.screenshot({ clip: { x: bb.x, y: bb.y, width: bb.width, height: klipp }, fullPage: true });
    } else buf = await loc.screenshot();
    await tilWebp(buf, path.join(mappe, `${navn}.webp`));
    const m = await sharp(buf).metadata();
    await ut1x(navn, buf, Math.round(m.width / skala));
    console.log(`✓ ${navn}.webp ${m.width}×${m.height} (${fil}, ${kode.trim()})`);
    if (MB[navn.replace("crm-", "mb-crm-")] !== undefined || Object.values(MB).includes(navn)) {
      const mb = Object.entries(MB).find(([, v]) => v === navn)[0];
      await tilWebp(await sharp(buf).resize({ width: 2880, height: 1800, fit: "cover", position: "top" }).png().toBuffer(), path.join(UT, `${mb}.webp`));
    }
  }
  await page.close();
}

// iOS-skjermene: bildet fra designet + «Din logo», uten statuslinje og Dynamic Island
{
  const s = await serve(path.join(rot, "docs", "design", "hengsel"));
  for (const [navn, fil, logo, w, h, skala] of IOS_JOBBER) {
    if (!ønsket(navn) || tekstModus) continue;
    const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: skala });
    const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;width:${w}px;height:${h}px;position:relative;overflow:hidden;background:#F2E9DB;font-family:Inter,system-ui,sans-serif">
      <img src="/hengsel.no/${fil}.png" style="display:block;width:${w}px;height:${h}px">
      ${logo ? `<span style="position:absolute;right:16px;top:56px;height:30px;padding:0 14px;border:1.5px dashed #C3B5A7;border-radius:6px;display:flex;align-items:center;font-size:13px;font-weight:600;letter-spacing:.02em;color:#31261D;box-sizing:border-box">Din logo</span>` : ""}`;
    await page.setContent(html.replace('src="/hengsel.no', `src="http://127.0.0.1:${s.address().port}/hengsel.no`), { waitUntil: "networkidle" });
    const buf = await page.screenshot();
    await tilWebp(buf, path.join(UT, `${navn}.webp`));
    await ut1x(navn, buf, w);
    console.log(`✓ ${navn}.webp ${w * skala}×${h * skala} (${fil})`);
    await page.close();
  }
  s.close();
}
if (tekstModus) fs.writeFileSync(path.join(UT1X, "tekst.md"), tekster.join("\n\n"));
await b.close();
server.close();
