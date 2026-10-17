/**
 * 26-007 Excel-import (N-4): egen side for importen som før lå i en dialog på Eiere og butikker. Velg fil (.xlsx eller .csv) → forhåndsvisning
 * (POST /api/import/forhandsvis) med fanene Nye · Oppdateres · Mangler org.nr. (· Hoppes over) og Tabell kompakt «Forhåndsvisning: <fil>»,
 * «6 rader · Velg en annen fil» og søk i tittelfeltet → «Importer N rader» i topplinja (POST /api/import). Ingenting lagres før det. Rad 2: Tekst
 * «Slik virker importen».
 */
import { api, html, raw, orgnr, sett, q, feilbanner, toast, esc } from "../lib/dom";
import { rad, flis, kpille, sokFelt, tabell, tabellHoyde, tom, settFaner, kobleKit, laster } from "../lib/kit";

const rot = q("#side")!;
const knapp = q<HTMLButtonElement>("#importer");
const RES: Record<string, string> = { ny: "Ny", oppdateres: "Oppdateres", mangler_orgnr: "Mangler org.nr.", hoppes: "Hoppes over" };
let fv: any = null;
let fane = "alle";
let lasterFil = "";
let feil: unknown = null;

const filvelger = raw(`<input type="file" id="fil" class="visuelt-skjult" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" />`);
const forklaring = () => rad(120, [flis({ id: "slik", tittel: "Slik virker importen", innhold: html`<div class="k-brod"><p>Rader matches på org.nr. Rader uten org.nr. importeres som prospekt og merkes for oppfølging. Tomme felt fylles hos eiere som finnes; utfylte felt overskrives ikke. Ingenting lagres før «${fv ? `Importer ${antallInn()} rader` : "Importer"}».</p></div>` })]);
const antallInn = () => (fv ? fv.telling.ny + fv.telling.oppdateres + fv.telling.mangler_orgnr : 0);

function vis() {
  const n = antallInn();
  if (knapp) { knapp.disabled = !fv || n === 0; knapp.textContent = fv ? `Importer ${n} rader` : "Importer"; }
  settFaner(fv ? [
    { id: "ny", navn: "Nye", antall: fv.telling.ny }, { id: "oppdateres", navn: "Oppdateres", antall: fv.telling.oppdateres }, { id: "mangler_orgnr", navn: "Mangler org.nr.", antall: fv.telling.mangler_orgnr },
    ...(fv.telling.hoppes ? [{ id: "hoppes", navn: "Hoppes over", antall: fv.telling.hoppes }] : []), { id: "alle", navn: "Alle", antall: fv.antall },
  ] : [], fane, (id) => { fane = id; vis(); });
  const rader = fv ? fv.rader.filter((r: any) => fane === "alle" || r.resultat === fane) : [];
  const innhold = feil ? html`${raw(feilbanner(feil, "Kunne ikke lese fila."))}${filvelger}`
    : lasterFil ? html`${laster()}<p class="k-tom">Leser ${lasterFil} …</p>`
    : !fv ? html`${tom("Velg en fil", "Excel (.xlsx) eller CSV, én rad per eier, første rad er overskrifter. Kolonner: Eier · Org.nr. · Adresse · Postnr. · Sted · Fylke · Kjede · Antall butikker · Butikker (skilt med semikolon) · Kontakt · Kontakt e-post · Kontakt telefon · Kilde.", raw(`<label class="knapp primar" for="fil">Velg fil</label>`))}${filvelger}`
    : html`${tabell({ kompakt: rader.length <= 9, kolonner: [{ navn: "Rad", klasse: "smal" }, { navn: "Eier (kolonne A)", midt: true }, { navn: "Org.nr. (B)", h: true, midt: true }, { navn: "Butikker", h: true, midt: true, klasse: "smal" }, { navn: "Status", klasse: "statuskol" }],
        rader: rader.map((r: any) => html`<tr title="${r.merknad}"><th scope="row">${r.radnr ?? ""}</th><td class="midt">${r.navn || "(tom)"}</td><td class="h midt">${r.orgnr ? orgnr(r.orgnr) : r.orgnr_tekst || "–"}</td><td class="h midt">${r.antall_butikker}</td><td>${kpille(RES[r.resultat], r.resultat)}</td></tr>`) })}${filvelger}`;
  const verktoy = fv ? html`<span class="k-hjelp">${fv.antall} rader ·</span> <label class="k-lenkeknapp" for="fil">Velg en annen fil</label>${sokFelt("forhåndsvisningen")}` : "";
  sett(rot, html`${rad(fv ? tabellHoyde(rader.length) : 320, [flis({ id: "forhandsvisning", tittel: fv ? `Forhåndsvisning: ${fv.filnavn}` : "Forhåndsvisning", teller: fv ? rader.length : "", verktoy, innhold })])}${forklaring()}`);
  kobleKit(rot);
  q<HTMLInputElement>("#fil")?.addEventListener("change", (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) les(f); });
  q("#prov-igjen")?.addEventListener("click", () => { feil = null; vis(); });
}

async function les(fil: File) {
  feil = null; lasterFil = fil.name; vis();
  try { fv = await api("POST", "/api/import/forhandsvis", undefined, { fil, utenTilstand: true }); fane = fv.telling.ny ? "ny" : "alle"; }
  catch (e) { feil = e; fv = null; }
  lasterFil = ""; vis();
}

knapp?.addEventListener("click", async () => {
  if (!fv) return;
  knapp.disabled = true;
  try {
    const res: any = await api("POST", "/api/import", { rader: fv.raa });
    toast(`${res.importert + res.oppdatert} rader importert.${res.mangler_orgnr ? ` ${res.mangler_orgnr} må få org.nr.` : ""}${res.oppdatert ? ` ${res.oppdatert} oppdatert.` : ""}`, { href: "/salg/eiere", tekst: "Til Eiere og butikker" });
    fv = null; fane = "alle"; vis();
  } catch (e: any) { toast(e.message); knapp.disabled = false; }
});
vis();
void esc;
