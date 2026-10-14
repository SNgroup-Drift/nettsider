#!/usr/bin/env node
/**
 * K-177: fiktive demo-skjermer fra designfasiten, med det nye Hengsel-merket, som webp i lys og mørk, 1× og 2×.
 *
 * Kilde: innlandet-crm-sync, gren claude/hengsel-merke-v3, docs/design/v4/{crm,hengsel} (*.dc.html). Ingenting er tatt fra kjørende CRM eller apper.
 * Skjermene gjengis med Playwright (bare Chromium) fra designfilene, ikke fra bilder av dem. Navn på leverandører og merker byttes til
 * nøytrale navn før bildet tas (lib/design.mjs, ERSTATT), og kontrolleres mot FORBUDT. Versjonen nederst i CRM-menyen leses fra
 * sites/hengsel/src/apptest-lenker.ts, så den er den samme overalt.
 *
 * Filnavn (i sites/vis/src/skjermbilder):
 *   <navn>.webp            lys, 2×          <navn>@1x.webp         lys, 1×
 *   <navn>-mork.webp       mørk, 2×         <navn>-mork@1x.webp    mørk, 1×       (bare der skjermen følger temaet)
 *   PC-skjermer er 1440 × 900 i designet. Studio Display-rammen er 16:9, så <navn>.webp er vinduet skalert til 90 % og midtstilt på 16:9
 *   (hele menyen med merket nederst er med). mb-<navn>.webp er hele 16:10 (MacBook-rammen).
 *
 * K-182: SKJERMER_UT=/sti skriver bare de valgte skjermene dit (ingen endring i Visningsrommet, sngroup.no eller kartet).
 * Kjør: NPM_DIR=/sti/til/mappe-med-react-og-babel DESIGN=/sti/til/docs/design/v4 node scripts/fiktive-skjermer.mjs [navn …]
 *   NPM_DIR: mappe med node_modules for react@18.3.1, react-dom@18.3.1 og @babel/standalone@7.29.0 (designfilene henter dem fra unpkg).
 */
import sharp from "sharp";
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { FORBUDT, finnRammer, forbered, startDesign, taInnhold } from "./lib/design.mjs";

const rot = resolve(import.meta.dirname, "..");
const DESIGN = process.env.DESIGN ?? "/home/user/innlandet-crm-sync/docs/design/v4";
// SKJERMER_UT: skriv til en annen mappe (K-182: sites/design/public/skjermer) uten å røre Visningsrommet, sngroup.no og kartet deres
const UT_EGEN = process.env.SKJERMER_UT ? resolve(process.env.SKJERMER_UT) : null;
// K-233: app-skjermbildene kommer fra biblioteket på bilder.hengsel.no (tatt fra demoen av K-228 i hengsel-crm), og sidene bruker ikke de fiktive
// skjermene fra designfilene lenger. Skriptet må ikke skrive inn i sites/ (scripts/skjermbilder-bibliotek.test.mjs krever tomme bildemapper):
// kjør bare med SKJERMER_UT=<mappe utenfor sites/> når du trenger skjermene til noe annet.
if (!UT_EGEN || UT_EGEN.startsWith(join(rot, "sites"))) {
  console.error("fiktive-skjermer.mjs: skjermbildene kommer fra biblioteket (K-233). Sett SKJERMER_UT=<mappe utenfor sites/> for å lage de fiktive skjermene til eget bruk.");
  process.exit(1);
}
const UT = UT_EGEN;
const versjon = (await readFile(join(rot, "sites", "hengsel", "src", "apptest-lenker.ts"), "utf8")).match(/versjon: "([^"]+)"/)[1];

const E = "crm/eksport/CRM sju skjermer.dc.html";
// type: pc (CRM-vindu 1440 × 900), pc169 (1440 × 810, allerede 16:9), ipad (1180 × 820), tlf (390 × 844), side (portal på PC, hel side)
// mork: "kart" = fargene byttes etter 07 Lys og mørk, "<eksportnavn>" = designet har egen mørk ramme, uten = alltid lys (portal, PDF, e-post)
const pc = (navn, fil, skjerm, nr = 0, o = {}) => ({ navn, fil, skjerm, nr, type: "pc", mork: "kart", ...o });
const ipad = (navn, fil, skjerm, nr = 0, o = {}) => ({ navn, fil, skjerm, nr, type: "ipad", mork: "kart", ...o });
const tlf = (navn, fil, skjerm, nr = 0, o = {}) => ({ navn, fil, skjerm, nr, type: "tlf", mork: "kart", ...o });
const portal = (navn, skjerm) => ({ navn, fil: "crm/15 Kundeportalen.dc.html", skjerm, nr: 0, type: "tlf", mork: false, klokke: true });
const ute = (navn, skjerm, o = {}) => ({ navn, fil: "hengsel/36 Hengsel montor v2.dc.html", skjerm, nr: 0, type: "tlf", mork: "kart", ute: true, ...o });
/** hengsel.no: rollebildene på /apptest (public/img/apptest/<navn>-lys|mork[@1x].webp) og iPad-bildet på /ute */
const HENGSEL = join(rot, "sites", "hengsel", "public", "img");
const rolle = (navn, fil, skjerm, o = {}) => ({ navn, fil, skjerm, nr: 0, type: "tlf", mork: "kart", klokke: true, ute: true, ut: { dir: join(HENGSEL, "apptest"), tema: true }, ...o });
const doc = (id, label, mork) => ({
  navn: id, fil: "crm/65 Dokumenter slik lages det.dc.html", skjerm: `eksport:${id}-lys`, nr: 0, type: "pc169", mork: mork ? `eksport:${id}-mork` : false,
});

/** Skjermene sngroup.no viser i Hengsel-delen (sites/sngroup/public/skjermbilder) */
export const SNGROUP = ["crm-tilbud", "ute-i-dag", "ute-jobb-under", "ute-ks", "portal-tilbud"];

export const SKJERMER = [
  // CRM på PC (CRM sju skjermer, 10 Tilbud, 18, 50, 32)
  pc("crm-min-dag", E, "eksport:crm-min-dag"),
  pc("crm-bestilling", E, "eksport:crm-bestilling"),
  pc("crm-etterkalkyle", E, "eksport:crm-etterkalkyle"),
  pc("crm-montasje", E, "eksport:crm-montasje"),
  pc("crm-saker", E, "eksport:crm-saker"),
  pc("crm-salgstavla", E, "eksport:crm-salgstavla"),
  pc("crm-resultater", E, "eksport:crm-resultater"),
  pc("crm-tilbud", "crm/10 Tilbud.dc.html", "T01.1 Tilbudslista", 0, { mb: false }),
  pc("crm-samtaler", "crm/10 Tilbud.dc.html", "T07.1 Logg samtale", 0, { mb: false }),
  pc("crm-tilbud-kunde", "crm/10 Tilbud.dc.html", "T08.1 Tilbud og kunde", 0, { mb: true }),
  pc("crm-ordre-kontrollmal", "crm/18 Kontrollmal befaring belastninger.dc.html", "H3.1 Ordre › Kontrollmål", 0, { mb: true }),
  pc("crm-moduler", "crm/50 Moduler og punktrapport.dc.html", "I31 Moduler (superadmin)", 0, { mb: true }),
  pc("crm-mal-skisser", "hengsel/32 Mal og skisser.dc.html", "C01 Ordre › Mål og skisser", 0, { mb: true }),
  // CRM på iPad (1180 × 820) og telefon
  ipad("crm-ipad-min-dag", E, "eksport:crm-min-dag-800"),
  ipad("crm-ipad-leder", "crm/17 Besluttet 07.10.dc.html", "B4.4 Leder på iPad og telefon"),
  ipad("crm-ipad-kontrollmal", "crm/18 Kontrollmal befaring belastninger.dc.html", "H3.5 Utfylling på iPad og telefon"),
  ipad("crm-ipad-belastninger", "crm/18 Kontrollmal befaring belastninger.dc.html", "H3.12 Belastninger på iPad"),
  ipad("crm-ipad-innstillinger", "crm/17 Besluttet 07.10.dc.html", "B5.3 Innstillinger på iPad og telefon"),
  tlf("crm-tlf-min-dag", "crm/16 Inngaende faktura.dc.html", "OP4 Min dag på telefon", 0, { klokke: true }),
  tlf("crm-tlf-ordre", "crm/16 Inngaende faktura.dc.html", "EK3 Etterkalkyle på telefon", 0, { klokke: true }),
  tlf("crm-tlf-kundekort", "crm/18 Kontrollmal befaring belastninger.dc.html", "H3.9 Befaring på iPad og telefon", 1, { klokke: true }),
  tlf("crm-tlf-leder", "crm/17 Besluttet 07.10.dc.html", "B4.4 Leder på iPad og telefon", 1, { klokke: true }),
  tlf("crm-tlf-kontrollmal", "crm/18 Kontrollmal befaring belastninger.dc.html", "H3.5 Utfylling på iPad og telefon", 1, { klokke: true }),
  tlf("crm-tlf-innstillinger", "crm/17 Besluttet 07.10.dc.html", "B5.3 Innstillinger på iPad og telefon", 1, { klokke: true }),
  tlf("crm-meny-apen", "crm/30 Telefon og iPad.dc.html", "A10.1 Menyen åpen, lys", 0, { klokke: true, mork: "A10.2 Menyen åpen, mørk" }),
  // Kundeportalen (alltid lys, 07 Lys og mørk)
  portal("kundeportal-k03", "K03 Mine kjøp"),
  portal("portal-tilbud", "K04 Tilbudet"),
  portal("kundeportal-k06", "K06 Oppgraderinger"),
  portal("kundeportal-k08", "K08 Kjøpsavtalen"),
  portal("portal-levering", "K10 Bekreft leveringsdag"),
  portal("portal-montering", "K12 Bekreft montering"),
  portal("portal-fdv", "K14 Ditt nye kjøkken"),
  { navn: "kundeportal-pc", fil: "crm/15 Kundeportalen.dc.html", skjerm: "KP1 Mitt kjøkken", nr: 0, type: "side", mork: false },
  // Hengsel Ute (iPhone og iPad)
  ute("ute-i-dag", "MV1.3 Meld ferdig montert", { mork: "MV1 M I dag · mørk" }),
  ute("ute-jobb-under", "MV4.1 Jobb · Under", { mork: "MV4.1 M Jobb · mørk" }),
  ute("ute-ks", "MV16.1 KS · kamera avbrutt"),
  ute("ute-ks-kamera", "MV16 KS · OK åpner kameraet"),
  ute("ute-avvik", "MV17 Meld avvik · arket"),
  ute("ute-punkter", "MV14 Punktliste · kunde"),
  ute("ute-punktkort", "MV15 Løse et punkt"),
  ute("ute-ferdig", "MV5.3 Oppsummering"),
  ute("ute-typeskilt", "MV19.8 Hvitevarer · lagret"),
  ute("ute-laser", "MV13.1 Laser · søker og funnet"),
  { navn: "ute-ipad-bildeverktoy", fil: "hengsel/36 Hengsel montor v2.dc.html", skjerm: "MV18 Bildeverktøy på iPad 1180", nr: 0, type: "ipad", mork: "kart", ute: true },
  // hengsel.no /apptest (rollene uten skjermbilde i designet) og /ute (iPad)
  rolle("foresporsler", "crm/18 Kontrollmal befaring belastninger.dc.html", "H3.13 Firmaleder i Hengsel: Godta eller Bestrid", { }),
  rolle("ruten", "hengsel/31 Utkjorer-app.dc.html", "U02.2 Rute for dagen"),
  rolle("mottak", "hengsel/36 Hengsel montor v2.dc.html", "LG1 Mottak"),
  { navn: "ipad-bildeverktoy-laser", fil: "hengsel/36 Hengsel montor v2.dc.html", skjerm: "MV18 Bildeverktøy på iPad 1180", nr: 0, type: "ipad", mork: false, ute: true, ut: { dir: join(HENGSEL, "app"), tema: false }, bare2x: true },
  // «Slik lages det» (65 Dokumenter slik lages det, D1–D12; Studio Display 16:9)
  doc("d1-lag-pdf-og-send", "D1", true),
  doc("d2a-signer-med-bankid", "D2a", false),
  doc("d2b-signert", "D2b", true),
  doc("d3-send-ordrebekreftelse", "D3", true),
  doc("d4-lag-tilvalgsliste", "D4", true),
  doc("d5-lag-monteringsrapport", "D5", true),
  doc("d6-lag-punktrapport", "D6", true),
  doc("d7-lag-leveringspakke-fdv", "D7", true),
  doc("d8-skriv-ut-plan", "D8", true),
  doc("d9-lag-faktura", "D9", true),
  doc("d10-sendt-til-kunden", "D10", true),
  doc("d11-min-side-nytt", "D11", false),
  doc("d12-e-postvarsel", "D12", false),
];

/** Utkast: «Din logo» der det gamle merket (app-ikon + «Hengsel UTE») sto i app-toppen, og ingen egen statuslinje/island (rammen har dem). */
async function uteRydd(page, n) {
  await page.evaluate((n) => {
    const rot = document.querySelector(`[data-r="${n}"]`);
    for (const img of rot.querySelectorAll('img[src*="hengsel-app-ikon"]')) {
      const boks = img.parentElement;
      boks.innerHTML = "";
      const s = document.createElement("span");
      s.textContent = "Din logo";
      s.style.cssText = "border:1.5px dashed currentColor;border-radius:6px;padding:4px 12px;font:600 14px/1.2 Inter,system-ui,sans-serif;opacity:.72;white-space:nowrap";
      boks.appendChild(s);
    }
    // statuslinjen (klokke, island, batteri) tegnes av telefonrammen: den første raden i skjermen gjøres usynlig
    const rad = rot.querySelector(":scope > div:first-child");
    if (rad && /\d{1,2}:\d{2}/.test(rad.textContent) && rad.getBoundingClientRect().height <= 60) for (const e of rad.querySelectorAll("*")) e.style.visibility = "hidden";
  }, n);
}

async function lagre(png, sti, { bredde, hoyde, pad } = {}) {
  let p = sharp(png);
  if (bredde || hoyde) p = p.resize({ width: bredde, height: hoyde, fit: "fill", kernel: "lanczos3" });
  await p.webp({ quality: 84, effort: 5 }).toFile(sti);
}

/** PC-vinduet (16:10) skalert til 90 % og midtstilt på en 16:9-flate i samme farge som skjermen, så hele vinduet vises i Studio Display-rammen. */
async function pc169(png, mork) {
  const m = await sharp(png).metadata();
  const h = Math.round((m.width * 9) / 16);
  const vinduH = h;
  const vinduW = Math.round((m.width * h) / m.height);
  const vindu = await sharp(png).resize(vinduW, vinduH, { kernel: "lanczos3" }).png().toBuffer();
  const flate = mork ? { r: 31, g: 25, b: 20 } : { r: 242, g: 233, b: 219 };
  return sharp({ create: { width: m.width, height: h, channels: 4, background: flate } })
    .composite([{ input: vindu, left: Math.round((m.width - vinduW) / 2), top: 0 }])
    .png()
    .toBuffer();
}

export async function lagAlle(valgte = []) {
  await mkdir(UT, { recursive: true });
  const design = await startDesign({ designRot: DESIGN });
  const liste = SKJERMER.filter((s) => !valgte.length || valgte.includes(s.navn));
  const perFil = new Map();
  for (const s of liste) perFil.set(s.fil, [...(perFil.get(s.fil) ?? []), s]);
  const utfall = [];
  const feil = [];
  const tekster = {};
  for (const [fil, spec] of perFil) {
    for (const skala of [2, 1]) {
      const { page, feil: sidefeil } = await design.apne(fil, skala);
      if (sidefeil.length) console.warn(`  ${fil}: ${sidefeil[0]}`);
      const rammer = await finnRammer(page);
      for (const s of spec) {
        const r = rammer.filter((x) => x.skjerm === s.skjerm)[s.nr];
        if (!r) {
          feil.push(`${s.navn}: fant ikke ${s.skjerm} nr ${s.nr} i ${fil}`);
          continue;
        }
        const varianter = s.mork ? ["lys", "mork"] : ["lys"];
        for (const v of varianter) {
          let nr = r.n;
          if (v === "mork" && s.mork !== "kart") {
            const mr = rammer.filter((x) => x.skjerm === (s.mork.startsWith("eksport:") ? s.mork : s.mork))[0];
            if (!mr) {
              feil.push(`${s.navn}: fant ikke mørk ramme ${s.mork}`);
              continue;
            }
            nr = mr.n;
          }
          const tekst = await forbered(page, nr, { versjon, skjulKlokke: !!s.klokke, mork: v === "mork" && s.mork === "kart" });
          if (s.ute) await uteRydd(page, nr);
          tekster[`${s.navn}/${v}`] = tekst;
          if (FORBUDT.test(tekst)) feil.push(`${s.navn} (${v}): forbudt ord igjen: ${tekst.match(FORBUDT)[0]}`);
          const png = await taInnhold(page, nr, { innvendig: s.type === "tlf" || s.type === "ipad" });
          const mork = v === "mork";
          if (s.bare2x && skala === 1) continue;
          const sti = (navn) => (s.ut ? join(s.ut.dir, `${navn}${s.ut.tema ? (mork ? "-mork" : "-lys") : ""}${skala === 1 ? "@1x" : ""}.webp`) : join(UT, `${navn}${mork ? "-mork" : ""}${skala === 1 ? "@1x" : ""}.webp`));
          const m = await sharp(png).metadata();
          if (s.type === "pc") {
            await lagre(await pc169(png, mork), sti(s.navn));
            if (s.mb !== false) await lagre(png, sti(`mb-${s.navn}`));
          } else {
            await lagre(png, sti(s.navn));
          }
          utfall.push({ navn: s.navn, tema: v, skala, b: m.width, h: m.height, fil, skjerm: s.skjerm });
        }
      }
      await page.close();
    }
  }
  await design.lukk();
  if (process.env.TEKST) await writeFile(process.env.TEKST, JSON.stringify(tekster, null, 1));
  if (UT_EGEN) {
    console.log(`${utfall.length} bilder i ${UT}`);
    if (feil.length) {
      console.error(feil.join("\n"));
      process.exitCode = 1;
    }
    return;
  }
  // delkjøring: behold oppføringene for skjermer som ikke ble tatt på nytt
  let kart = { versjon, skjermer: utfall };
  if (valgte.length) {
    const gammel = JSON.parse(await readFile(join(UT, "_kart.json"), "utf8").catch(() => '{"skjermer":[]}'));
    kart = { versjon, skjermer: [...gammel.skjermer.filter((x) => !valgte.includes(x.navn)), ...utfall] };
  }
  await writeFile(join(UT, "_kart.json"), JSON.stringify(kart, null, 1));
  // vis/assets/bilder.js får listen over skjermer med mørk utgave
  const mork = [...new Set(kart.skjermer.filter((x) => x.tema === "mork").map((x) => x.navn))].sort();
  const bilderJs = join(rot, "sites", "vis", "src", "assets", "bilder.js");
  const js = await readFile(bilderJs, "utf8");
  await writeFile(bilderJs, js.replace(/\/\*MORK\*\/var MORK=\[[^\]]*\];\/\*MORK-slutt\*\//, `/*MORK*/var MORK=${JSON.stringify(mork)};/*MORK-slutt*/`));
  // sngroup.no: familieseksjonen (Hengsel) bruker de samme skjermene som Visningsrommet
  const sn = join(rot, "sites", "sngroup", "public", "skjermbilder");
  await mkdir(sn, { recursive: true });
  for (const f of await readdir(UT)) {
    const b = f.replace(/(@1x)?\.webp$/, "").replace(/-mork$/, "");
    if (SNGROUP.includes(b) && f.endsWith(".webp")) await copyFile(join(UT, f), join(sn, f));
  }
  console.log(`${utfall.length} bilder`);
  if (feil.length) {
    console.error(feil.join("\n"));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) await lagAlle(process.argv.slice(2));
