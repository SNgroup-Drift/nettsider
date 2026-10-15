/**
 * Felles for sidene i fase C og Drift (K-260): lasting med tilstandene tom, laster og feil (?tilstand= i adressen), «Ingen tilgang» (ADM-403)
 * for andre roller enn eier, sidehode og små SVG-diagrammer (ingen style-attributter, CSP uten inline-stiler).
 */
import { api, html, raw, sett, q, feilbanner, skjelett, tilstand, ikon, esc, ApiFeil, kr, type Raa } from "./dom";

export const rot = () => q("#side")!;

export const sidehode = (tittel: string, under: string, handlinger: string | Raa = "") =>
  html`<header class="sidehode"><div><h1>${tittel}</h1><p class="under">${under}</p></div>${handlinger ? html`<div class="handlinger">${raw(String(handlinger))}</div>` : ""}</header>`;

/** «Du har ikke tilgang til …» med feilkode ADM-403, «Til saker» og «Spør Eirik om tilgang» (60-211) */
export const ingenTilgang = (omraade: string) => html`<div class="kort ikke-tilgang" role="alert">${raw(ikon("stoppet", 28))}<h1>Du har ikke tilgang til ${omraade}</h1>
  <p class="meta">Rollen din ser Kunder og Support. Feilkode ADM-403.</p>
  <div class="handlinger"><a class="knapp primar" href="/support/saker">Til saker</a><a class="knapp" href="mailto:es@sngroup.no?subject=${encodeURIComponent(`Tilgang til ${omraade} i Hengsel Admin`)}">Spør Eirik om tilgang</a></div></div>`;

export const eksempel = (tekst = "Eksempel") => raw(`<span class="pille" data-status="eksempel">${esc(tekst)}</span>`);
export const tom = (ikonNavn: string, tittel: string, tekst: string, handling = "") => raw(`<div class="tom">${ikon(ikonNavn, 28)}<b>${esc(tittel)}</b><span>${esc(tekst)}</span>${handling ? `<div class="handlinger">${handling}</div>` : ""}</div>`);

interface Last<T> { hode: () => Raa; hent: () => Promise<T>; vis: (d: T, valg: { feil?: unknown }) => void; tomData?: () => T; omraade: string; skjelettN?: number; skjelettKlasse?: string; feiltekst: string }

/** Laster en side: ?tilstand=tom|laster|feil viser tilstandene, 403 viser «Ingen tilgang», andre feil et banner med «Prøv igjen». */
export function lagLaster<T>(o: Last<T>) {
  let siste: T | null = null;
  async function last() {
    const t = tilstand();
    if (t === "tom" && o.tomData) { siste = o.tomData(); o.vis(siste, {}); return; }
    if (!siste) sett(rot(), html`${o.hode()}<div class="stabel">${raw(skjelett(o.skjelettN ?? 4, o.skjelettKlasse ?? "kortet"))}</div>`);
    try { siste = await o.hent(); o.vis(siste, {}); }
    catch (e) {
      if (e instanceof ApiFeil && e.status === 403) { sett(rot(), ingenTilgang(o.omraade)); return; }
      if (siste) o.vis(siste, { feil: e });
      else { sett(rot(), html`${o.hode()}${raw(feilbanner(e, o.feiltekst))}`); q("#prov-igjen")?.addEventListener("click", last); }
    }
  }
  return { last, siste: () => siste };
}

/** Søylediagram som SVG: verdier med etikett over og navn under. merk = indeks som tegnes mørkere. */
export function soyler(rader: { navn: string; verdi: number; etikett?: string; svak?: boolean }[], { hoyde = 160, merk = -1 } = {}) {
  const b = 640, n = rader.length || 1, gap = 8, w = (b - gap * (n - 1)) / n, max = Math.max(1, ...rader.map((r) => r.verdi));
  const topp = 18, bunn = 18, h = hoyde - topp - bunn;
  const deler = rader.map((r, i) => {
    const x = i * (w + gap), sh = Math.max(r.verdi > 0 ? 2 : 0, (r.verdi / max) * h), y = topp + h - sh;
    return `<rect class="soyle${r.svak ? " svak" : ""}${i === merk ? " denne" : ""}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${sh.toFixed(1)}" rx="4"></rect>`
      + `<text class="verdi" x="${(x + w / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle">${esc(r.etikett ?? String(r.verdi))}</text>`
      + `<text x="${(x + w / 2).toFixed(1)}" y="${hoyde - 3}" text-anchor="middle">${esc(r.navn)}</text>`;
  }).join("");
  return raw(`<svg viewBox="0 0 ${b} ${hoyde}" role="img" aria-label="${esc(rader.map((r) => `${r.navn}: ${r.etikett ?? r.verdi}`).join(", "))}">${deler}</svg>`);
}

/** To søyler per gruppe (f.eks. kunder og butikker per måned) */
export function parSoyler(rader: { navn: string; a: number; b: number }[], { hoyde = 150 } = {}) {
  const B = 640, n = rader.length || 1, gap = 10, w = (B - gap * (n - 1)) / n, sw = (w - 3) / 2, max = Math.max(1, ...rader.flatMap((r) => [r.a, r.b]));
  const topp = 16, bunn = 18, h = hoyde - topp - bunn;
  const s = (v: number, x: number, kl: string) => { const sh = Math.max(v > 0 ? 2 : 0, (v / max) * h), y = topp + h - sh; return `<rect class="soyle${kl}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" rx="3"></rect><text class="verdi" x="${(x + sw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle">${v}</text>`; };
  const deler = rader.map((r, i) => { const x = i * (w + gap); return s(r.a, x, "") + s(r.b, x + sw + 3, " svak") + `<text x="${(x + w / 2).toFixed(1)}" y="${hoyde - 3}" text-anchor="middle">${esc(r.navn)}</text>`; }).join("");
  return raw(`<svg viewBox="0 0 ${B} ${hoyde}" role="img" aria-label="${esc(rader.map((r) => `${r.navn}: ${r.a} og ${r.b}`).join(", "))}">${deler}</svg>`);
}

/** Stolpe for brukt mot inkludert (timer), med merke for inkludert */
export function stolpe(brukt: number, inkl: number) {
  const max = Math.max(brukt, inkl, 0.01) * 1.1, W = 200;
  const tilst = brukt > inkl ? "over" : brukt >= inkl * 0.9 ? "grense" : "";
  return raw(`<svg class="stolpe" viewBox="0 0 ${W} 10" preserveAspectRatio="none" aria-hidden="true"><rect class="spor" x="0" y="0" width="${W}" height="10" rx="5"></rect><rect class="fyll ${tilst}" x="0" y="0" width="${((brukt / max) * W).toFixed(1)}" height="10" rx="5"></rect><line class="merke" x1="${((inkl / max) * W).toFixed(1)}" x2="${((inkl / max) * W).toFixed(1)}" y1="0" y2="10"></line></svg>`);
}

export const tusen = (ore: number) => `${Math.round(ore / 100000).toLocaleString("nb-NO").replace(/[  ]/g, " ")}`;
export const timer = (t: number | null) => (t === null ? "–" : `${String(Math.round(t * 100) / 100).replace(".", ",")} t`);
export { api, html, raw, sett, q, ikon, kr, esc, ApiFeil };
