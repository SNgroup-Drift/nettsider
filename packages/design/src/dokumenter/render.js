/**
 * Gjengiver A4-sidene til HTML-tekst (ren JS, ingen Astro eller DOM). Brukes av hengsel.no (A4Side.astro, set:html) og av
 * Visningsrommet (sites/vis/bygg.mjs), så markeringen finnes ett sted. Klassene er kontrakten mot a4.css.
 *
 * Alle tekster escapes. Merket øverst er «Din logo | Butikknavn Hamar», og «by Hengsel» står i bunnlinjen (aldri to Hengsel-logoer).
 * Papiret er alltid lyst. Forsidebildet hentes fra `bildeSti` (standard /img/dok-forside.webp, 1200 × 768).
 */
import { hhKlasse, malKlasse } from "./a4-stil.js";

/** @param {unknown} s */
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const faseKlasse = (f) => ({ Befaring: "befaring", KS: "ks", Reklamasjon: "reklamasjon" })[f] ?? "";
const statusKlasse = (s) => (s === "Løst" || s === "OK" ? "ok" : s === "Utgått" || s === "Åpen" ? "gul" : "");
const span = (t, k) => `<span${k ? ` class="${k}"` : ""}>${esc(t)}</span>`;

const merke = `<div class="a4-merke"><span class="a4-dinlogo">Din logo</span><span class="a4-skille"></span><span class="a4-butikk"><span>Butikknavn</span><b>Hamar</b></span></div>`;

function blokk(b) {
  switch (b.type) {
    case "h":
      return span(b.t, "a4-disp a4-h");
    case "kv":
      return `<div class="a4-kv a4-kv-${b.kol}">${b.kv.map((k) => `<div class="a4-kvk">${span(k.k)}${span(k.v)}</div>`).join("")}</div>`;
    case "linjer":
      return `<div class="a4-kol">${b.rader.map((r) => `<div class="a4-lin">${span(r.l)}${span(r.v)}</div>`).join("")}${b.sum ? `<div class="a4-sum">${span(b.sum.l)}${span(b.sum.v)}</div>` : ""}</div>`;
    case "tabell":
      return `<div class="a4-kol" role="table"><div class="a4-tr hode ${malKlasse(b.mal)}" role="row">${b.kol.map((c) => `<span role="columnheader">${esc(c)}</span>`).join("")}</div>${b.rader
        .map((r) => `<div class="a4-tr ${malKlasse(b.mal)}" role="row">${r.c.map((c) => `<span role="cell">${esc(c)}</span>`).join("")}</div>`)
        .join("")}${b.sum ? `<div class="a4-sum liten">${span(b.sum.l)}${span(b.sum.v)}</div>` : ""}</div>`;
    case "boks":
      return `<div class="a4-boks">${b.t ? `<b>${esc(b.t)}</b>` : ""}${b.linjer.map((l) => span(l)).join("")}</div>`;
    case "tekst":
      return span(b.t, "a4-tekst");
    case "klausuler":
      return `<div class="a4-kol">${b.rader.map((k) => `<div class="a4-kl">${span(k.nr, "a4-disp")}<span><b>${esc(k.t)}</b>${span(k.s)}</span></div>`).join("")}</div>`;
    case "bilder":
      return `<div class="a4-bilder a4-n${b.rader.length}">${b.rader.map((x) => `<div class="a4-bild"><div class="a4-plass ${hhKlasse(b.hh)}"></div>${span(x)}</div>`).join("")}</div>`;
    case "bilde":
      return `<div class="a4-plass stor ${hhKlasse(b.hh)}">${span(b.t)}</div>`;
    case "sign":
      return `<div class="a4-sign">${b.rader.map((g) => `<div>${span(g.navn, "a4-sign-navn")}${span(g.rolle, "a4-sign-rolle")}</div>`).join("")}</div>`;
    case "signbokser":
      return `<div class="a4-sb">${b.rader.map((g) => `<div><b>${esc(g.t)}</b>${span(g.s)}</div>`).join("")}</div>`;
    case "stats":
      return `<div class="a4-stats">${b.rader.map((s) => `<div class="a4-stat">${span(s.k)}${span(s.v, "a4-disp")}</div>`).join("")}</div>`;
    case "ks":
      return `<div class="a4-kol">${b.rader.map((k) => `<div class="a4-ks">${span(k.p)}${span(k.m)}<span><span class="a4-prikk${k.avvik ? " avvik" : ""}"></span>${esc(k.s)}</span></div>`).join("")}</div>`;
    case "punkter":
      return `<div class="a4-kol" role="table"><div class="a4-pk hode" role="row"><span role="columnheader">Ref.</span><span role="columnheader"></span><span role="columnheader">Punkt</span><span role="columnheader">Status</span><span role="columnheader">Sist endret</span></div>${b.rader
        .map(
          (p) =>
            `<div class="a4-pk rad" role="row"><span class="a4-pk-ref" role="cell"><b>${esc(p.ref)}</b><span class="a4-fase ${faseKlasse(p.fase)}">${esc(p.fase)}</span></span><span class="a4-pk-bilde" role="cell"></span><span role="cell">${esc(p.t)}</span><b class="a4-pk-s ${statusKlasse(p.s)}" role="cell">${esc(p.s)}</b><span class="a4-pk-sist" role="cell">${esc(p.sist)}</span></div>`,
        )
        .join("")}</div>`;
    case "plan":
      return `<div class="a4-kol" role="table"><div class="a4-pl hode" role="row"><span role="columnheader">Montør og firma</span>${b.dager.map((d) => `<span role="columnheader">${esc(d)}</span>`).join("")}</div>${b.rader
        .map(
          (r) =>
            `<div class="a4-pl rad" role="row"><span class="a4-pl-m" role="rowheader">${span(r.navn)}${span(r.firma)}</span>${r.celler
              .map((c) => `<span class="a4-celle ${c.tone}" role="cell">${c.tone !== "tom" ? span(c.t) + span(c.s) : ""}</span>`)
              .join("")}</div>`,
        )
        .join("")}</div>`;
    default:
      return "";
  }
}

/**
 * Én A4-side som HTML.
 * @param {import("./data").DokSide} side
 * @param {{ fot: string, nr: number, total: number, ligg?: boolean, forst?: boolean, klasse?: string, bildeSti?: string }} o
 */
export function renderA4Side(side, { fot, nr, total, ligg = false, forst = false, klasse = "", bildeSti = "/img/dok-forside.webp" }) {
  const fs = side.forside;
  const td = side.todelt;
  let inn = "";
  if (fs) {
    inn += `<div class="a4-foto"><img src="${esc(bildeSti)}" alt="" width="1200" height="768" loading="${forst ? "eager" : "lazy"}"${forst ? ' fetchpriority="high"' : ""} decoding="async">` +
      `<div class="a4-plate a4-merke"><span class="a4-dinlogo">Din logo</span><span class="a4-skille"></span><span class="a4-butikk"><span>Butikknavn</span><b>Hamar</b></span></div>` +
      `<span class="a4-bildetekst">Illustrasjon laget fra tegningen. Endelig utseende kan avvike.</span></div>`;
    inn += `<div class="a4-fs">${span(fs.eyebrow, "a4-eb")}${span(fs.tittel, "a4-disp a4-fs-tittel")}${span(fs.under, "a4-fs-under")}`;
    if (fs.meta) inn += `<div class="a4-meta">${fs.meta.map(([k, v]) => `<div class="a4-mk">${span(k)}${span(v)}</div>`).join("")}</div>`;
    if (fs.pris) inn += `<div class="a4-pris">${span(fs.pris, "a4-disp")}${span(fs.prisTekst)}</div>`;
    if (fs.fliser) {
      inn += `<div class="a4-fliser">${fs.fliser.map(([t, s], i) => `<div class="a4-flis">${span(String(i + 1), "a4-disp")}<b>${esc(t)}</b>${span(s)}</div>`).join("")}</div>${span(fs.tekst, "a4-fs-tekst")}`;
    }
    inn += `</div>`;
  } else {
    inn += `<div class="a4-sd"><div class="a4-topp">${merke}<span class="a4-hoyre">${(side.hoyre ?? []).map((r) => span(r)).join("")}</span></div>`;
    if (side.eyebrow && !td) inn += span(side.eyebrow, "a4-eb");
    if (td) {
      inn += `<div class="a4-todelt"><div class="a4-todelt-v">${span(td.eyebrow, "a4-eb")}${span(td.t, "a4-disp a4-tittel")}${span(td.s)}</div><div class="a4-todelt-h">${td.steg
        .map(([t, s], i) => `<div class="a4-steg"><span class="a4-steg-n">${i + 1}</span><span class="a4-steg-t"><b>${esc(t)}</b>${span(s)}</span></div>`)
        .join("")}</div></div>`;
    }
    if (side.tittel) inn += span(side.tittel, "a4-disp a4-tittel");
    if (side.ingress) inn += span(side.ingress, "a4-ingress");
    inn += (side.blokker ?? []).map(blokk).join("");
    inn += `</div>`;
  }
  inn += `<div class="a4-fot">${span(fot)}<span><span>by Hengsel</span><span class="a4-tab">Side ${nr} av ${total}</span></span></div>`;
  return `<div class="a4${ligg ? " ligg" : ""}${klasse ? " " + esc(klasse) : ""}" role="group" aria-label="Side ${nr} av ${total}" data-a4><div class="a4-ark">${inn}</div></div>`;
}
