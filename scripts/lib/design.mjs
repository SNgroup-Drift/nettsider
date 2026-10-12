/**
 * Gjengir skjermer fra designfasiten (*.dc.html, Design Components) med Playwright (Chromium) til webp.
 *
 * Designfilene henter React, react-dom og Babel fra unpkg og skrifter fra Google Fonts, som er stengt her. Biblioteket svarer på
 * de forespørslene med pakkene fra npm (NPM_DIR) og med Inter og Newsreader fra @fontsource-variable i repoet. TWK Lausanne og
 * Reckless ligger i designmappa (public/fonts) og lastes derfra. Sidene åpnes fra en lokal server, ikke rett fra disk.
 *
 * Mørk utgave: designets egne regler (07 Lys og mørk) gir fargeparene. Bare skjermer som følger temaet (CRM, Ute) får mørk utgave;
 * kundeportal, PDF og e-post er alltid lyse. fargene byttes i nettleseren etter at siden er tegnet, så innholdet er det samme.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..", "..");
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".woff2": "font/woff2", ".otf": "font/otf", ".svg": "image/svg+xml", ".json": "application/json", ".md": "text/plain",
};
const LOKALT = {
  "react@18.3.1/umd/react.production.min.js": "react/umd/react.production.min.js",
  "react-dom@18.3.1/umd/react-dom.production.min.js": "react-dom/umd/react-dom.production.min.js",
  "@babel/standalone@7.29.0/babel.min.js": "@babel/standalone/babel.min.js",
};
/** Lys → mørk, fra eksemplet «07.1 Eksempel: Fakturaer › Inngående» i 07 Lys og mørk (samme skjerm i begge utgaver) */
export const MORK_KART = {
  "rgb(49, 38, 29)": "rgb(242, 233, 219)", // tekst
  "rgb(242, 233, 219)": "rgb(31, 25, 20)", // flaten
  "rgb(251, 249, 246)": "rgb(42, 34, 28)", // kort
  "rgb(228, 212, 196)": "rgba(242, 233, 219, 0.14)", // valgt rad, linjer
  "rgb(195, 181, 167)": "rgb(0, 0, 0)", // ytterkant
  "rgba(49, 38, 29, 0.72)": "rgba(242, 233, 219, 0.72)", // dempet tekst
  "rgba(49, 38, 29, 0.32)": "rgba(242, 233, 219, 0.32)",
};

export function filserver(rotMappe, mounts = {}) {
  const server = createServer(async (q, r) => {
    const sti = decodeURIComponent(q.url.split("?")[0]);
    let fil = null;
    for (const [pre, mappe] of Object.entries(mounts)) if (sti.startsWith(pre)) fil = join(mappe, sti.slice(pre.length));
    fil ??= join(rotMappe, sti);
    try {
      let d = await readFile(fil);
      // 40 E-post fra appen har «<kundeportal@…>» uten escape i teksten, og React stopper. Rettes i svaret, ikke i designfila.
      if (fil.endsWith(".dc.html")) d = Buffer.from(d.toString("utf8").replace(/<([a-z]+@[^>\s]*)>/g, "&lt;$1&gt;"));
      r.writeHead(200, { "content-type": MIME[extname(fil)] ?? "application/octet-stream" });
      r.end(d);
    } catch {
      r.writeHead(404);
      r.end();
    }
  });
  return new Promise((res) => server.listen(0, "127.0.0.1", () => res(server)));
}

const fontCss = (base) => `
@font-face{font-family:'Inter';src:url(${base}/__fonts/inter/files/inter-latin-wght-normal.woff2) format('woff2');font-weight:100 900;font-style:normal}
@font-face{font-family:'Newsreader';src:url(${base}/__fonts/newsreader/files/newsreader-latin-wght-normal.woff2) format('woff2');font-weight:200 800;font-style:normal}
@font-face{font-family:'Newsreader';src:url(${base}/__fonts/newsreader/files/newsreader-latin-wght-italic.woff2) format('woff2');font-weight:200 800;font-style:italic}`;

/** Åpner designmappa (rotMappe) i Chromium. Gir { apne(fil, skala), lukk() } */
export async function startDesign({ designRot, npmDir = process.env.NPM_DIR, chromiumSti = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" }) {
  if (!npmDir) throw new Error("Sett NPM_DIR til en mappe med node_modules for react@18.3.1, react-dom@18.3.1 og @babel/standalone@7.29.0.");
  const server = await filserver(designRot, {
    "/__fonts/inter/": join(rot, "node_modules", "@fontsource-variable", "inter"),
    "/__fonts/newsreader/": join(rot, "node_modules", "@fontsource-variable", "newsreader"),
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const nettleser = await chromium.launch({ executablePath: chromiumSti });
  const sider = new Map();

  async function side(skala) {
    if (sider.has(skala)) return sider.get(skala);
    const ctx = await nettleser.newContext({ viewport: { width: 1700, height: 1200 }, deviceScaleFactor: skala, reducedMotion: "reduce" });
    await ctx.route("https://unpkg.com/**", (r) => {
      const f = LOKALT[r.request().url().replace("https://unpkg.com/", "")];
      return f ? r.fulfill({ path: join(npmDir, "node_modules", f), contentType: "text/javascript" }) : r.abort();
    });
    await ctx.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: fontCss(base) }));
    await ctx.route(/fonts\.gstatic\.com/, (r) => r.abort());
    sider.set(skala, ctx);
    return ctx;
  }

  return {
    base,
    /** Åpner fila (sti fra designRot) og venter til skriftene og React er ferdige. */
    async apne(fil, skala = 2) {
      const ctx = await side(skala);
      const page = await ctx.newPage();
      const feil = [];
      page.on("pageerror", (e) => feil.push(e.message));
      await page.goto(`${base}/${fil.split("/").map(encodeURIComponent).join("/")}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1200);
      return { page, feil };
    },
    async lukk() {
      await nettleser.close();
      server.close();
    },
  };
}

/**
 * Finner rammene (div med fast px-bredde og -høyde, eller fast bredde uten høyde) og merker dem data-r="<n>".
 * Gir [{ n, skjerm (label), nr (nr i skjermen), b, h, auto }]. data-eksport-rammer gis som skjerm «eksport:<navn>».
 */
export async function finnRammer(page) {
  return page.evaluate(() => {
    const BREDDER = [1440, 1180, 900, 820, 800, 794, 390, 360];
    const px = (v) => (/^\d+px$/.test(v) ? parseInt(v) : null);
    const ytterst = (a) => a.filter((d) => !a.some((o) => o !== d && o.contains(d)));
    const ut = [];
    let n = 0;
    for (const e of document.querySelectorAll("[data-eksport]")) {
      const d = e.firstElementChild;
      d.setAttribute("data-r", n);
      ut.push({ n: n++, skjerm: `eksport:${e.dataset.eksport}`, nr: 0, b: px(d.style.width), h: px(d.style.height), auto: false });
    }
    // innerste skjermer først: en gruppe («A07 Mer-sidene») som inneholder skjermer med egen label gir rammene til de innerste
    const dybde = (e) => { let d = 0; for (let p = e; p; p = p.parentElement) d++; return d; };
    const skjermer = [...document.querySelectorAll("[data-screen-label]")].sort((a, b) => dybde(b) - dybde(a));
    for (const s of skjermer) {
      const label = s.getAttribute("data-screen-label");
      const divs = [...s.querySelectorAll("div")].filter((d) => !d.hasAttribute("data-r"));
      const fast = ytterst(divs.filter((d) => BREDDER.includes(px(d.style.width)) && px(d.style.height)));
      const auto = fast.length ? [] : ytterst(divs.filter((d) => BREDDER.includes(px(d.style.width)) && !d.style.height));
      [...fast, ...auto].forEach((d, nr) => {
        d.setAttribute("data-r", n);
        ut.push({ n: n++, skjerm: label, nr, b: px(d.style.width), h: px(d.style.height) ?? Math.round(d.getBoundingClientRect().height), auto: !d.style.height });
      });
    }
    return ut;
  });
}

/** Bytter fargene til de mørke rollene i rammen (bare der fargen er en av MORK_KART). Gjør ingenting med bilder og piller med egne farger. */
export async function lagMork(page, n) {
  await page.evaluate(
    ([n, kart]) => {
      const rot = document.querySelector(`[data-r="${n}"]`);
      const alle = [rot, ...rot.querySelectorAll("*")];
      // først les alle verdier, så skriv (så ikke arvede farger leses etter at de er byttet)
      const jobb = alle.map((e) => {
        const c = getComputedStyle(e);
        const sett = {};
        for (const [egenskap, css] of [["backgroundColor", "background-color"], ["color", "color"], ["borderTopColor", "border-top-color"], ["borderRightColor", "border-right-color"], ["borderBottomColor", "border-bottom-color"], ["borderLeftColor", "border-left-color"], ["fill", "fill"], ["stroke", "stroke"]]) {
          const v = c.getPropertyValue(css);
          if (kart[v]) sett[egenskap] = kart[v];
        }
        return [e, sett];
      });
      for (const [e, sett] of jobb) Object.assign(e.style, sett);
      // merket: -lys.svg på lys flate, -mork.svg på mørk (07 Lys og mørk, «Bilder og logo»)
      for (const img of rot.querySelectorAll("img")) {
        const s = img.getAttribute("src") ?? "";
        if (/-lys(-2x)?\.(svg|png)$/.test(s)) img.setAttribute("src", s.replace(/-lys(-2x)?\./, "-mork$1."));
      }
    },
    [n, MORK_KART],
  );
}

/** Tar PNG av rammen (element-skjermbilde). */
export async function taRamme(page, n) {
  return page.locator(`[data-r="${n}"]`).screenshot({ type: "png" });
}

/** webp, lagret med fast kvalitet. Bredde i px (valgfritt). */
export async function lagreWebp(png, ut, { bredde } = {}) {
  let p = sharp(png);
  if (bredde) p = p.resize({ width: bredde, fit: "inside", kernel: "lanczos3" });
  return p.webp({ quality: 84, effort: 5 }).toFile(ut);
}

/**
 * Navn som ikke skal stå i skjermbildene (ekte merker, leverandører og firmaer). Byttes til nøytrale navn i rammen før bildet tas.
 * Rekkefølgen teller: de lengste først.
 */
export const ERSTATT = [
  [/Studio Sigdal Innlandet/gi, "Butikknavn Hamar"],
  [/Studio Sigdal/gi, "Butikknavn"],
  [/\bSigdal(?:-| )kampanje(r)?/gi, "Kampanje$1 fra Hovedleverandør A"],
  [/\bSigdal\b/gi, "Hovedleverandør A"],
  [/\bNobia\b/gi, "Hovedleverandør B"],
  [/\bHTH\b/g, "Hovedleverandør C"],
  [/\bElkjøp Proff\b/gi, "Hvitevareleverandør"],
  [/\bElkjøp\b/gi, "Hvitevareleverandør"],
  [/\bBosch(?= tilkoblet| laser)/gi, "Lasermåler"],
  [/\bBosch GLM[\w -]*?CG\b/gi, "Lasermåler A"],
  [/\bLeica DISTO D2\b/gi, "Lasermåler B"],
  [/\bHilti PD-S\b/gi, "Lasermåler C"],
  [/\bBosch(?: ?\/ ?Merke| ?«[^»]*»)?/gi, "Hvitevaremerke X"],
  [/\bSiemens\b/gi, "Hvitevaremerke X"],
  [/\bElectrolux\b/gi, "Hvitevaremerke Y"],
  [/\bAEG\b/g, "Hvitevaremerke Z"],
  [/\bScala\b/g, "Serie A"],
  [/\bSteni\b/g, "Leverandør C"],
  [/Montasjefirma Innlandet/g, "Montasjefirma Nord"],
  [/Fjellmontasje AS/g, "Montasjefirma B AS"],
  [/\b(Eva|Per|Ola|Nils|Lise|Hans|Pål) (Berg|Dahl|Hammer|Lie|Moen|Hansen|Prøvesen)\b/g, "$1 Nordmann"],
  [/\bHansen\b/g, "Nordmann"],
  [/\b(?:Aqualine|Tapwell|Grohe|Hansgrohe|Oras|Gessi|Vola|Quooker|Franke|Blanco)\b/gi, "Armaturleverandør"],
  [/\b(?:Miele|Gorenje|Samsung|Whirlpool|Smeg|Asko|Husqvarna|Liebherr|Beko|Bauknecht)\b/gi, "Hvitevaremerke Z"],
  [/\b(?:Kvik|Norema|Marbodal|Uno Form|Invita|Ikea|Jysk|Bauhaus|Byggmakker|Montér|Maxbo)\b/gi, "Hovedleverandør C"],
  [/\bThermocold\b/gi, "Hvitevaremerke Y"],
  [/\bMerke iQ(\d+)/g, "Merke $1"],
  [/\biQ(\d+)/g, "Serie $1"],
  [/siemens_2026-10\.xlsx/gi, "prisliste_2026-10.xlsx"],
];
/** Ord som aldri skal finnes igjen i bildene (kontrolleres etter erstatning). Ekte personnavn legges inn her når de dukker opp. */
export const FORBUDT = /sigdal|\bhth\b|bosch|siemens|nobia|elkjøp|elkjop|electrolux|\baeg\b|aqualine|tapwell|grohe|miele|gorenje|samsung|whirlpool|smeg|\basko\b|husqvarna|liebherr|marbodal|norema|\bkvik\b|bauhaus|maxbo|thermocold|iq700|innlandet\s*as|kjøkkenhuset|norema|ikea|jysk|bjørn|byggmakker|obs\b|obos/i;

/** Byter navn, versjon og klokke i rammen. Gir teksten som er igjen (til kontroll mot FORBUDT). */
export async function forbered(page, n, { versjon, skjulKlokke = false, mork = false } = {}) {
  const regler = ERSTATT.map(([re, til]) => [re.source, re.flags, til]);
  const tekst = await page.evaluate(
    ([n, regler, versjon, skjulKlokke]) => {
      const rot = document.querySelector(`[data-r="${n}"]`);
      const re = regler.map(([k, f, t]) => [new RegExp(k, f), t]);
      const bytt = (s) => {
        let ut = s;
        for (const [r, t] of re) ut = ut.replace(r, t);
        if (versjon) ut = ut.replace(/\bv\. ?\d+(?:\.\d+)+/g, `v. ${versjon}`);
        // modellnummer av ekte hvitevarer (bokstaver, tall, bokstaver) → nøytralt «Modell NNN»
        ut = ut.replace(/\b[A-Z]{1,3}\d{2,4}[A-Z]{1,3}\d{0,3}[A-Z0-9]*\b/g, (m) => `Modell ${100 + ([...m].reduce((a, c) => a + c.charCodeAt(0), 0) % 900)}`);
        return ut;
      };
      const tw = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT);
      const noder = [];
      while (tw.nextNode()) noder.push(tw.currentNode);
      for (const t of noder) {
        const ny = bytt(t.nodeValue);
        if (ny !== t.nodeValue) t.nodeValue = ny;
      }
      for (const e of rot.querySelectorAll("[placeholder],[title],[aria-label],[alt]"))
        for (const a of ["placeholder", "title", "aria-label", "alt"]) if (e.hasAttribute(a)) e.setAttribute(a, bytt(e.getAttribute(a)));
      // kundens egen logo (bildefil med navn, ikke Hengsel-merket) → butikknavn som tekst
      for (const img of rot.querySelectorAll("img")) {
        const src = img.getAttribute("src") ?? "";
        const kunde = /sigdal|kundelogo|\/uploads\/|bilder\/logo/i.test(src) || /sigdal/i.test(img.getAttribute("alt") ?? "");
        if (kunde && !/hengsel|crm-aksent|levert-av|sendt-med|ute-aksent/i.test(src)) {
          const h = img.getBoundingClientRect().height;
          const s = document.createElement("span");
          s.textContent = "Butikknavn Hamar";
          s.style.cssText = `font:600 ${h && h < 30 ? Math.max(8, Math.round(h * 0.8)) : 18}px/1.15 Inter,system-ui,sans-serif;letter-spacing:-0.01em;white-space:nowrap`;
          img.replaceWith(s);
        }
      }
      if (skjulKlokke) {
        // statuslinja (09:41) tegnes av telefonrammen, ikke av skjermbildet: samme regel som i Enhet (bare én gang)
        for (const t of noder) if (/^\s*\d{1,2}:\d{2}\s*$/.test(t.nodeValue) && t.parentElement.getBoundingClientRect().top - rot.getBoundingClientRect().top < 70) t.parentElement.style.visibility = "hidden";
        const rad = rot.querySelector(":scope > div:first-child");
        if (rad && rad.getBoundingClientRect().height <= 50 && /^\s*\d{1,2}:\d{2}\s*$/.test(rad.innerText.trim())) for (const e of rad.querySelectorAll("*")) e.style.visibility = "hidden";
      }
      return rot.innerText;
    },
    [n, regler, versjon, skjulKlokke],
  );
  if (mork) await lagMork(page, n);
  return tekst;
}

/**
 * Tar rammens innhold (uten tegnet kant og avrunding rundt telefonen/iPaden) som PNG. Rammer med fast kant (border) klippes til innsiden.
 * For vindu-rammer (PC) tas hele elementet med gjennomsiktige hjørner.
 */
export async function taInnhold(page, n, { innvendig = false } = {}) {
  const info = await page.evaluate(
    ([n, innvendig]) => {
      const e = document.querySelector(`[data-r="${n}"]`);
      for (let p = e.parentElement; p; p = p.parentElement) p.style.background = "transparent";
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
      e.scrollIntoView({ block: "start", inline: "start" });
      const r = e.getBoundingClientRect();
      const c = getComputedStyle(e);
      const bl = innvendig ? parseFloat(c.borderLeftWidth) : 0;
      const bt = innvendig ? parseFloat(c.borderTopWidth) : 0;
      if (innvendig) {
        e.style.borderRadius = "0";
        e.style.border = `${c.borderTopWidth} solid transparent`;
      }
      return { x: r.x + scrollX + bl, y: r.y + scrollY + bt, w: innvendig ? e.clientWidth : r.width, h: innvendig ? e.clientHeight : r.height };
    },
    [n, innvendig],
  );
  return page.screenshot({ type: "png", fullPage: true, omitBackground: true, clip: { x: info.x, y: info.y, width: info.w, height: info.h } });
}
