/**
 * N-4: flis-kitet i nettleseren. Sidene i Hengsel Admin tegnes fra /api, så komponentene i src/components/kit/ (kopiert fra N-3) finnes også som
 * små byggere her, med samme markup og de globale klassene i src/styles/kit.css. Regel-layout-hengsel.md: rad = én høyde fra 120/320/480/640,
 * flisbredder 1/4 (bare tall), 1/3, 1/2, 2/3, 1/1; tittel 16/600 med teller, handling nederst til høyre; faner med antall under topplinja (2e).
 */
import { html, raw, esc, q, qa, ikon, type Raa } from "./dom";

export type Bredde = "1/4" | "1/3" | "1/2" | "2/3" | "1/1";
export type Hoyde = 120 | 320 | 480 | 640 | "auto";
export type Tone = "ny" | "pagar" | "sannsynlig" | "ferdig" | "advarsel" | "feil" | "venter" | "aksent";
const BREDDE: Record<Bredde, string> = { "1/4": "k-b14", "1/3": "k-b13", "1/2": "k-b12", "2/3": "k-b23", "1/1": "k-b11" };

/** Trinnet i høydeskalaen for en tabell med n rader (regel 2d): ≤5 = 320, ≤9 = 480, ellers 640 med sidevelger */
export const tabellHoyde = (n: number): Hoyde => (n <= 5 ? 320 : n <= 9 ? 480 : 640);

/** Tonen til statusene i Admin (samme farge betyr det samme overalt, regel 9) */
export const TONE: Record<string, Tone> = {
  ny: "ny", demo: "pagar", tilbud: "sannsynlig", forhandling: "aksent", signert: "ferdig", kunde: "ferdig", tapt: "venter",
  utkast: "advarsel", signering: "pagar", fornyes_snart: "advarsel", sagt_opp: "feil", aktiv: "ferdig", arkivert: "venter",
  sendt: "pagar", erstattet: "venter", akseptert: "ferdig", ikke_sendt: "venter", venter: "venter", eksempel: "advarsel",
  forfalt: "feil", i_dag: "ny", oppdateres: "ny", mangler_orgnr: "advarsel", hoppes: "venter", under_arbeid: "pagar", lost: "ferdig",
};

export const kpille = (tekst: string, tone: Tone | string = "venter") => html`<span class="k-pille" data-tone="${TONE[tone] ?? tone}">${tekst}</span>`;

export const rad = (hoyde: Hoyde, fliser: (Raa | string)[], id?: string) => html`<div class="k-rad" data-hoyde="${hoyde}" ${raw(id ? `id="${esc(id)}"` : "")}>${fliser.map((f) => raw(String(f)))}</div>`;

export interface FlisValg {
  bredde?: Bredde; tittel?: string; teller?: number | string; tellerHoyre?: boolean; tittelHref?: string;
  /** Verdi helt til høyre i tittelfeltet («Inntekt per måned 37 569 kr») */
  tittelverdi?: Raa | string;
  verktoy?: Raa | string; innhold: Raa | string; handling?: Raa | string; id?: string; klasse?: string;
}
export function flis(f: FlisValg): Raa {
  const tittelId = f.id ? `${f.id}-tittel` : "";
  const teller = f.teller !== undefined && f.teller !== "" ? html`<span class="k-teller${f.tellerHoyre ? " hoyre" : ""}">${f.teller}</span>` : "";
  return html`<section class="k-flis ${BREDDE[f.bredde ?? "1/1"]} ${f.klasse ?? ""}" ${raw(f.id ? `id="${esc(f.id)}" aria-labelledby="${esc(tittelId)}"` : "")}>
    ${f.tittel ? html`<div class="k-topp${f.verktoy ? " med-verktoy" : ""}"><h2 class="k-ftittel" ${raw(tittelId ? `id="${esc(tittelId)}"` : "")}>${f.tittelHref ? html`<a href="${f.tittelHref}">${f.tittel}</a>` : f.tittel}${!f.tellerHoyre ? teller : ""}</h2>${f.tellerHoyre ? teller : ""}${f.tittelverdi ? html`<span class="k-tittelverdi">${raw(String(f.tittelverdi))}</span>` : ""}${f.verktoy ? html`<div class="k-verktoy">${raw(String(f.verktoy))}</div>` : ""}</div>` : ""}
    <div class="k-finnhold">${raw(String(f.innhold))}</div>
    ${f.handling ? html`<div class="k-fhandling">${raw(String(f.handling))}</div>` : ""}</section>`;
}

/** Tall-flisen (1/4 på oversiktssider, 120 px): etikett, stort tall, undertekst */
export const tallflis = ({ etikett, tall, under = "", tone, href, bredde = "1/4" }: { etikett: string; tall: string; under?: string; tone?: Tone; href?: string; bredde?: Bredde }) => {
  const indre = html`<span class="k-etikett">${etikett}</span><span class="k-tall" ${raw(tone ? `data-tone="${tone}"` : "")}>${tall}</span><span class="k-under" title="${under}">${under}</span>`;
  return href ? html`<a class="k-flis k-tallflis ${BREDDE[bredde]}" href="${href}">${indre}</a>` : html`<div class="k-flis k-tallflis ${BREDDE[bredde]}">${indre}</div>`;
};

/** Søk i tittelfeltet (Tabell kompakt). Filtrerer radene i flisen (kobleKit), eller sendes til siden med data-sok */
export const sokFelt = (hva: string, id = "", verdi = "") => {
  const etikett = `Søk i ${hva}`;
  return html`<div class="k-sok" data-k-sok><button type="button" class="k-sok-knapp" aria-label="${etikett}" aria-expanded="false" data-k-sok-knapp>${raw(ikon("sok", 18))}</button>
    <label class="k-sok-felt">${raw(ikon("sok", 16))}<input type="search" placeholder="Søk" aria-label="${etikett}" autocomplete="off" value="${verdi}" ${raw(id ? `id="${esc(id)}"` : "data-k-sok-felt")} /></label></div>`;
};

/** Filter-nedtrekk i verktøylinja («Status ▾»): et vanlig select uten ramme */
export const velger = (id: string, etikett: string, valg: [string, string][], valgt: string) => html`<label class="k-velger"><span class="visuelt-skjult">${etikett}</span><select id="${id}">${valg.map(([v, t]) => html`<option value="${v}" ${raw(v === valgt ? "selected" : "")}>${t}</option>`)}</select></label>`;

export interface Kolonne { navn: string; h?: boolean; midt?: boolean; klasse?: string }
/** Tabell (44 px rader) eller Tabell kompakt (40 px). rader er ferdige <tr>-er; første celle bør være <th scope="row"> */
export const tabell = ({ kolonner, rader, kompakt = false, sumrad, ingen = "Ingen treff." }: { kolonner: Kolonne[]; rader: (Raa | string)[]; kompakt?: boolean; sumrad?: Raa | string; ingen?: string }) => html`<div class="k-tabellramme"><table class="k-tabell${kompakt ? " kompakt" : ""}" data-k-tabell>
  <thead><tr>${kolonner.map((k) => html`<th scope="col" class="${[k.h ? "h" : "", k.midt ? "midt" : "", k.klasse ?? ""].join(" ").trim()}">${k.navn}</th>`)}</tr></thead>
  <tbody>${rader.map((r) => raw(String(r)))}<tr class="ingen" data-k-ingen ${raw(rader.length ? "hidden" : "")}><td colspan="${kolonner.length}">${ingen}</td></tr></tbody>
  ${sumrad ? html`<tfoot>${raw(String(sumrad))}</tfoot>` : ""}</table></div>`;

/** Kortliste/Liste: maks n rader på 40 px; resten bak «Vis alle (n)» (dialog). Hver rad: venstre (navn + dempet tekst) og høyre (verdi/pille/knapp) */
export interface ListeRad { venstre: Raa | string; hoyre?: Raa | string }
const somTekst = (m: Raa | string) => String(m).replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
export const listeRad = (r: ListeRad) => html`<li><span class="k-celle" title="${somTekst(r.venstre)}">${raw(String(r.venstre))}</span>${r.hoyre ? html`<span class="k-hoyre">${raw(String(r.hoyre))}</span>` : ""}</li>`;
export function liste(id: string, tittel: string, rader: ListeRad[], { maks = 5, tom = "Ingen ennå." } = {}): { innhold: Raa; handling: Raa | "" } {
  if (!rader.length) return { innhold: html`<p class="k-tom">${tom}</p>`, handling: "" };
  const innhold = html`<ul class="k-liste">${rader.slice(0, maks).map(listeRad)}</ul>
    <dialog class="k-alle" id="${id}-alle" aria-labelledby="${id}-alle-t"><h2 id="${id}-alle-t" class="k-dialog-tittel">${tittel}<button class="lukk" type="button" data-k-lukk aria-label="Lukk">${raw(ikon("lukk", 20))}</button></h2><ul class="k-dialog-liste">${rader.map(listeRad)}</ul></dialog>`;
  return { innhold, handling: html`<button type="button" class="k-vis-alle" aria-haspopup="dialog" aria-controls="${id}-alle" data-k-dialog="${id}-alle">Vis alle (${rader.length})</button>` };
}

/** Tom/laster/feil inne i en flis */
export const tom = (tittel: string, tekst = "", handlinger: Raa | string = "") => html`<div class="k-tom"><b>${tittel}</b>${tekst ? html`<span>${tekst}</span>` : ""}${handlinger ? html`<div class="handlinger">${raw(String(handlinger))}</div>` : ""}</div>`;
export const laster = () => raw(`<div class="k-skjelett" aria-hidden="true"></div>`);

/** Sidevelger under en full tabell (640): «1–10 av 38» og sideknappene */
export function sidevelger(side: number, antall: number, perSide: number): Raa {
  const sider = Math.max(1, Math.ceil(antall / perSide));
  const fra = antall ? (side - 1) * perSide + 1 : 0, til = Math.min(antall, side * perSide);
  return html`<div class="k-bunnfelt"><span>${fra}–${til} av ${antall}</span><nav class="k-sidevelger" aria-label="Sider">
    <button type="button" data-k-side="${side - 1}" ${raw(side <= 1 ? "disabled" : "")} aria-label="Forrige side">‹</button>
    ${Array.from({ length: Math.min(sider, 9) }, (_, i) => i + 1).map((n) => html`<button type="button" data-k-side="${n}" ${raw(n === side ? 'aria-current="page"' : "")}>${n}</button>`)}
    <button type="button" data-k-side="${side + 1}" ${raw(side >= sider ? "disabled" : "")} aria-label="Neste side">›</button></nav></div>`;
}

export interface Fane { id: string; navn: string; antall?: number | string; href?: string }
/** Fanene under topplinja (regel 8 og 2e). Tegnes i #faner. valgt kan være id-en til en fane; ved(id) kalles når en fane trykkes. */
export function settFaner(faner: Fane[], valgt: string, ved?: (id: string) => void) {
  const nav = q("#faner");
  if (!nav) return;
  nav.hidden = !faner.length;
  nav.innerHTML = String(html`${faner.map((f) => f.href
    ? html`<a class="k-fane" href="${f.href}" ${raw(f.id === valgt ? 'aria-current="page"' : "")}>${f.navn}${f.antall !== undefined ? html` <span class="antall">${f.antall}</span>` : ""}</a>`
    : html`<button class="k-fane" type="button" role="tab" data-k-fane="${f.id}" aria-selected="${f.id === valgt}">${f.navn}${f.antall !== undefined ? html` <span class="antall">${f.antall}</span>` : ""}</button>`)}`);
  nav.setAttribute("role", faner.some((f) => !f.href) ? "tablist" : "navigation");
  if (ved) qa<HTMLButtonElement>("[data-k-fane]", nav).forEach((b) => b.addEventListener("click", () => ved(b.dataset.kFane!)));
}

/** Statuspillen i topplinja (tittelen, så pillen) */
export function settSidepille(tekst: string, tone: Tone | string = "venter") {
  const p = q("#sidepille");
  if (!p) return;
  p.hidden = !tekst;
  p.textContent = tekst;
  p.dataset.tone = TONE[tone] ?? tone;
}
/** Sidetittel og brødsmule i topplinja (eierkortet setter eierens navn) */
export function settTittel(tittel: string, forelder?: string) {
  const t = q("#sidetittel"); if (t) t.textContent = tittel;
  const f = q("#forelder"); if (f && forelder !== undefined) { f.textContent = forelder; f.hidden = !forelder; }
  document.title = `${tittel} · Hengsel Admin`;
}

/** Kobler søk i tittelfeltet, «Vis alle»-dialogene og lukk-knappene etter at en side er tegnet */
export function kobleKit(rot: ParentNode = document) {
  for (const sok of qa("[data-k-sok]", rot)) {
    const flis = sok.closest(".k-flis");
    const felt = q<HTMLInputElement>("input", sok);
    const knapp = q<HTMLButtonElement>("[data-k-sok-knapp]", sok);
    if (!flis || !felt || !knapp) continue;
    knapp.addEventListener("click", () => { sok.setAttribute("data-apen", ""); knapp.setAttribute("aria-expanded", "true"); felt.focus(); });
    felt.addEventListener("blur", () => { if (!felt.value) { sok.removeAttribute("data-apen"); knapp.setAttribute("aria-expanded", "false"); } });
    if (!felt.hasAttribute("data-k-sok-felt")) continue; // siden filtrerer selv (eget id)
    const tabell = q<HTMLTableElement>("[data-k-tabell]", flis);
    felt.addEventListener("input", () => {
      const s = felt.value.trim().toLocaleLowerCase("nb");
      let treff = 0;
      for (const r of qa<HTMLTableRowElement>("tbody tr:not([data-k-ingen])", tabell ?? flis)) { const ja = !s || (r.textContent ?? "").toLocaleLowerCase("nb").includes(s); r.hidden = !ja; if (ja) treff++; }
      const ingen = tabell ? q("[data-k-ingen]", tabell) : null; if (ingen) ingen.hidden = treff > 0;
    });
  }
  for (const k of qa<HTMLButtonElement>("[data-k-dialog]", rot)) {
    const d = document.getElementById(k.dataset.kDialog ?? "") as HTMLDialogElement | null;
    if (!d) continue;
    k.addEventListener("click", () => d.showModal());
    q("[data-k-lukk]", d)?.addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  }
  for (const r of qa<HTMLTableRowElement>("tr[data-lenke]", rot)) r.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a, button, input, select, label")) return; location.href = r.dataset.lenke!; });
}
