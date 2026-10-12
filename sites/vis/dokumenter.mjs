/**
 * Dokumentene i Visningsrommet: lager HTML for /dokumenter/ og for arkene på forsiden av de felles dataene
 * (packages/design/src/dokumenter: data.js, lages.js, render.js). Brukes av bygg.mjs, som setter resultatet inn der markørene står:
 *   <!--dokumentvisning-->        hele visningen (velger, ark med bla-knapper, «Slik lages det»)
 *   <!--a4-stil-->                <style> med kolonnemaler og bildehøyder
 *   <!--a4-ark:id:side:tittel-->  ett lite A4-ark som lenke (forsiden)
 * Ingen egen tekst om dokumentene her: alt kommer fra datafilene, så et dokument endres bare ett sted.
 */
import { DOKUMENTER, LAGES_STEG } from "../../packages/design/src/dokumenter/data.js";
import { ETTERPA_TYPE, LAGES } from "../../packages/design/src/dokumenter/lages.js";
import { a4DynamiskCss } from "../../packages/design/src/dokumenter/a4-stil.js";
import { esc, renderA4Side } from "../../packages/design/src/dokumenter/render.js";
import { readFileSync } from "node:fs";

/** Skjermer med mørk utgave (sites/vis/src/skjermbilder/_kart.json, lages av scripts/fiktive-skjermer.mjs) */
const MORK = new Set(JSON.parse(readFileSync(new URL("./src/skjermbilder/_kart.json", import.meta.url), "utf8")).skjermer.filter((x) => x.tema === "mork").map((x) => x.navn));
/** <picture> med 1× og 2×, og mørk utgave når systemet er mørkt og skjermen følger temaet */
const skjermbilde = (navn, alt) =>
  `<picture>${MORK.has(navn) ? `<source media="(prefers-color-scheme: dark)" srcset="/skjermbilder/${navn}-mork@1x.webp 1x, /skjermbilder/${navn}-mork.webp 2x">` : ""}<img class="sk" src="/skjermbilder/${navn}.webp" srcset="/skjermbilder/${navn}@1x.webp 1x, /skjermbilder/${navn}.webp 2x" alt="${alt}" width="${BILDE.bredde}" height="${BILDE.hoyde}" loading="lazy" decoding="async"></picture>`;

/** Hengsel-logoen i bunnlinjen på arkene (hengsel-lys.svg, 3 mm) */
const LOGO_STI = "/assets/logo/hengsel-lys.svg";

const BILDE = { bredde: 2880, hoyde: 1620 };

export const a4Stil = () => `<style>${a4DynamiskCss(DOKUMENTER)}</style>`;

/** «Slik lages det»: 3–5 steg med skjermbilde i Studio Display-ramme, knappen som trykkes, og hva som skjer etterpå. */
function lagesHtml(dok) {
  const l = LAGES[dok.id];
  if (!l) throw new Error(`Mangler «Slik lages det» for ${dok.id} i lages.js`);
  if (l.steg.length < 3 || l.steg.length > 5) throw new Error(`${dok.id}: «Slik lages det» skal ha 3–5 steg, har ${l.steg.length}`);
  const steg = l.steg
    .map(
      (s, i) => `<li class="lages-steg">
  <div class="lages-tekst">
    <span class="lages-nr" aria-hidden="true">${i + 1}</span>
    <h4>${esc(s.t)}</h4>
    <p>${esc(s.s)}</p>
    ${s.knapp ? `<p class="lages-knapp"><span class="knapp-merke">Knappen</span> <span class="knapp-chip">${esc(s.knapp)}</span></p>` : ""}
  </div>
  <div class="pc-ramme"><div class="skjermkant"><div class="skjerm">${skjermbilde(s.bilde, esc(s.alt))}</div></div><span class="stang" aria-hidden="true"></span><span class="fot" aria-hidden="true"></span></div>
</li>`,
    )
    .join("\n");
  const etter = l.etterpa
    .map(([type, t]) => `<li><span class="chip chip-${type}">${esc(ETTERPA_TYPE[type])}</span><span>${esc(t)}</span></li>`)
    .join("");
  const rom = l.rom.map((r) => `<a href="${esc(r.u)}">${esc(r.t)} ›</a>`).join("");
  return `<section class="lages" aria-labelledby="lages-${dok.id}">
  <div class="lages-hode"><span class="eyebrow">Slik lages det</span><h3 id="lages-${dok.id}">${esc(dok.t)}: fra ordren til ferdig PDF</h3>
  <ol class="dv-steg lages-kort" aria-label="De fem delene av jobben">${dok.lages.map((t, i) => `<li><span class="dv-eb liten">${i + 1} · ${LAGES_STEG[i]}</span><span>${esc(t)}</span></li>`).join("")}</ol></div>
  <ol class="lages-liste">
${steg}
  </ol>
  <div class="etterpa"><span class="eyebrow">Etterpå</span><ul>${etter}</ul></div>
  <p class="lages-rom"><span>Se det i rommene:</span> ${rom}</p>
</section>`;
}

/** Ett dokument: ark med bla-knapper og innholdsliste, så «Slik lages det». */
function panelHtml(dok, forst) {
  const total = dok.sider.length;
  const sider = dok.sider
    .map((side, i) => `<div class="dv-side" data-side${i > 0 ? " hidden" : ""}>${renderA4Side(side, { fot: dok.fot, nr: i + 1, total, ligg: dok.ligg, forst: forst && i === 0, logoSti: LOGO_STI })}</div>`)
    .join("");
  const innhold = dok.sider
    .map((s, i) => `<li><button type="button" data-gaa="${i}"${i === 0 ? ' aria-current="page"' : ""}><span class="nr">Side ${i + 1}</span><span>${esc(s.navn)}</span></button></li>`)
    .join("");
  return `<div class="dv-vis">
  <div class="dv-ark-kol">
    <div class="dv-ark${dok.ligg ? " ligg" : ""}" data-ark tabindex="0" role="group" aria-label="${esc(dok.t)}: bla med piltastene eller sveip">
      ${sider}
      <button type="button" class="dv-zoom" data-apne aria-label="Åpne siden i lysboksen"></button>
    </div>
    <div class="dv-nav">
      <button type="button" class="dv-rund" data-forrige aria-label="Forrige side" disabled>‹</button>
      <span class="dv-teller" data-teller aria-live="polite">Side 1 av ${total}</span>
      <button type="button" class="dv-rund" data-neste aria-label="Neste side"${total < 2 ? " disabled" : ""}>›</button>
      <button type="button" class="dv-lys-knapp" data-apne>Åpne i lysboks</button>
    </div>
  </div>
  <div class="dv-info">
    <div class="dv-tittelrad"><h2 class="dv-tittel" data-dok-tittel>${esc(dok.t)}</h2><span class="eks">Eksempel</span></div>
    <p class="dv-under">${esc(dok.s)}</p>
    <p class="dv-sider">${total} sider${dok.ligg ? ", liggende A4" : ", stående A4"}. Bla med knappene, piltastene eller sveip.</p>
    <ol class="dv-innhold">${innhold}</ol>
  </div>
</div>
${lagesHtml(dok)}`;
}

/** Hele visningen. Første dokument ligger i DOM-en; de andre i <template> og settes inn når de velges (A4-sidene lastes først da). */
export function dokumentvisningHtml() {
  const faner = DOKUMENTER.map(
    (d, i) => `<button type="button" class="dv-fane" role="tab" id="dok-fane-${d.id}" aria-controls="${d.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-dok="${d.id}">${esc(d.t)}</button>`,
  ).join("");
  const paneler = DOKUMENTER.map(
    (d, i) => `<div class="dv-panel" role="tabpanel" id="${d.id}" aria-labelledby="dok-fane-${d.id}" data-panel="${d.id}"${i > 0 ? " hidden" : ""}>${i === 0 ? panelHtml(d, true) : `<template>${panelHtml(d, false)}</template>`}</div>`,
  ).join("\n");
  return `<div class="dv" data-dokvisning data-hash>
  <div class="dv-velger" role="tablist" aria-label="Dokumenter">${faner}</div>
${paneler}
  <dialog class="lys" data-lysboks aria-label="Dokument i lysboks">
    <div class="lys-topp"><span class="lys-tittel"><b data-lys-tittel></b><span class="lys-eks">Eksempel</span></span><span class="lys-teller" data-lys-teller></span><button type="button" class="lys-rund" data-lukk aria-label="Lukk">×</button></div>
    <div class="lys-scene"><button type="button" class="lys-rund stor" data-lys-forrige aria-label="Forrige side">‹</button><div class="lys-side" data-lys-side></div><button type="button" class="lys-rund stor" data-lys-neste aria-label="Neste side">›</button></div>
  </dialog>
</div>`;
}

/** Ett lite ark (en side av et dokument) som lenke til /dokumenter/#id. */
export function a4Ark(id, side, tittel) {
  const dok = DOKUMENTER.find((d) => d.id === id);
  if (!dok) throw new Error(`Ukjent dokument i a4-ark: ${id}`);
  const html = renderA4Side(dok.sider[side], { fot: dok.fot, nr: side + 1, total: dok.sider.length, ligg: dok.ligg, logoSti: LOGO_STI })
    .replace(/ role="group" aria-label="[^"]*"/, ' aria-hidden="true"');
  return `<a class="ark-lenke" href="/dokumenter/#${esc(id)}" aria-label="${esc(tittel)}, åpne dokumentet"><span class="ark${dok.ligg ? " ligg" : ""}">${html}</span><span>${esc(tittel)}</span></a>`;
}
