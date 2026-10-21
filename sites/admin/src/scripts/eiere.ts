/**
 * 26-002 Kunder, eiere og butikker (N-4): fanene Alle · Aktive kunder · Butikker hos kunder · Åpne muligheter med antall (regel 2e), og Tabell 1/1
 * (640) med søk og filter-nedtrekk (Status, Kjede, Fylke) i verktøylinja, «Importer fra Excel», sumraden «Inntekt per måned» og sidevelger (10 per side).
 * /kunder åpner fanen Aktive kunder. Samme API som før (GET /api/eiere). Excel-importen er egen side (26-007, /salg/import).
 */
import { api, html, raw, kr, orgnr, sett, q, qa, feilbanner, tilstand, nyEierDialog, esc } from "../lib/dom";
import { rad, flis, kpille, velger, tabell, tom, laster, sidevelger, settFaner, kobleKit } from "../lib/kit";

const rot = q("#side")!;
const params = new URLSearchParams(location.search);
if (params.get("import") === "1") location.replace("/salg/import");
const paKunder = rot.dataset.kunder === "1";
let fane = paKunder ? "kunder" : "alle";
let sok = params.get("sok") ?? "";
let fStatus = "alle", fKjede = "alle", fFylke = "alle";
let side = 1;
const PER_SIDE = 10;
let data: any = null;
const toppsok = q<HTMLInputElement>("#sok");
if (toppsok && sok) toppsok.value = sok;

const STATUSNAVN: Record<string, string> = { ny: "Ny", demo: "Demo avtalt", tilbud: "Tilbud sendt", forhandling: "Forhandling", signert: "Signert", tapt: "Tapt" };
const iFane = (e: any, f = fane) => f === "alle" || (f === "kunder" || f === "butikker" ? e.er_kunde : !e.er_kunde && e.status !== "tapt");
const lenke = (e: any) => (paKunder ? `/kunder/${e.id}` : `/salg/eiere/${e.id}`);
const passer = (e: any) => {
  const s = sok.trim().toLowerCase();
  const st = fStatus === "alle" || (fStatus === "kunde" ? e.er_kunde : fStatus === "prospekt" ? !e.er_kunde && e.status !== "tapt" : e.status === fStatus);
  const tekst = `${e.navn} ${e.orgnr ?? ""} ${e.sted ?? ""} ${e.adresse ?? ""} ${e.butikksteder ?? ""} ${e.kontakt_navn ?? ""}`.toLowerCase();
  return iFane(e) && st && (fKjede === "alle" || e.kjede === fKjede) && (fFylke === "alle" || e.fylke === fFylke) && (!s || tekst.includes(s));
};

function vis({ tomt = false, feil = null as unknown } = {}) {
  const alle = data?.eiere ?? [];
  const kunder = alle.filter((e: any) => e.er_kunde);
  settFaner([
    { id: "alle", navn: "Alle", antall: data ? alle.length : undefined },
    { id: "kunder", navn: "Aktive kunder", antall: data ? kunder.length : undefined },
    { id: "butikker", navn: "Butikker hos kunder", antall: data ? kunder.reduce((s: number, e: any) => s + e.antall_butikker, 0) : undefined },
    { id: "muligheter", navn: "Åpne muligheter", antall: data ? alle.filter((e: any) => iFane(e, "muligheter")).length : undefined },
  ], fane, (id) => { fane = id; side = 1; vis(); });
  let rader = alle.filter(passer);
  if (fane === "butikker") rader = [...rader].sort((a: any, b: any) => b.antall_butikker - a.antall_butikker || a.navn.localeCompare(b.navn, "nb"));
  const sider = Math.max(1, Math.ceil(rader.length / PER_SIDE));
  if (side > sider) side = sider;
  const synlige = rader.slice((side - 1) * PER_SIDE, side * PER_SIDE);
  const inntekt = kunder.reduce((s: number, e: any) => s + (e.verdi_ore ?? 0), 0);
  // K-469: rollen support får eierne uten beløp (verdi_ore er null); da vises verken kolonnen, sumraden eller inntekten
  const medBelop = !(alle as any[]).length || (alle as any[]).some((e: any) => e.verdi_ore !== null);
  const verktoylinje = html`<div class="k-verktoylinje">
    <label class="k-sok-felt bred">${raw(`<svg class="ikon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.875" stroke-linecap="round" aria-hidden="true"><circle cx="8.75" cy="8.75" r="5.25"></circle><path d="M12.6 12.6L17 17"></path></svg>`)}<input id="lokalsok" type="search" placeholder="Søk på navn, sted eller org.nr." aria-label="Søk på navn, sted eller org.nr." value="${sok}" autocomplete="off" /></label>
    ${velger("f-status", "Status", [["alle", "Status: Alle"], ["prospekt", "Prospekt"], ["kunde", "Kunde"], ["tapt", "Tapt"]], fStatus)}
    ${velger("f-kjede", "Kjede", [["alle", "Kjede: Alle"], ["sigdal", "Sigdal"], ["annen", "Uavhengig"]], fKjede)}
    ${velger("f-fylke", "Fylke", [["alle", "Fylke: Alle"], ...(data?.fylker ?? []).map((f: string) => [f, f] as [string, string])], fFylke)}
    ${paKunder ? "" : raw(`<a class="k-lenkeknapp" href="/salg/import">Importer fra Excel</a>`)}</div>`;
  const innhold = feil && !data ? raw(feilbanner(feil, "Kunne ikke hente eierne."))
    : !data ? laster()
    : tomt ? tom("Ingen eiere ennå", "Importer kjedelisten fra Excel, eller legg inn den første eieren. Du ser alltid en forhåndsvisning før noe lagres.", raw(`<a class="knapp" href="/salg/import">Importer fra Excel</a>`))
    : html`${verktoylinje}${feil ? raw(feilbanner(feil, "Kunne ikke oppdatere listen. Viser sist hentede.")) : ""}
      ${rader.length === 0 ? tom(`Ingen treff${sok ? ` på «${sok}»` : ""}`, "Søket ser på navn, sted, org.nr. og butikkenes sted. Prøv et annet ord, eller fjern et filter.", raw(`<button class="knapp" type="button" id="nullstill">Nullstill søk</button>`))
      : html`${tabell({ kolonner: [{ navn: "Eier" }, { navn: "Org.nr.", h: true, midt: true }, { navn: "Butikker", h: true, midt: true, klasse: "smal" }, { navn: "Kjede", midt: true }, { navn: "Fylke", midt: true }, ...(medBelop ? [{ navn: "Verdi per mnd", h: true, midt: true }] : []), { navn: "Status", klasse: "statuskol" }],
          rader: synlige.map((e: any) => html`<tr data-lenke="${lenke(e)}"><th scope="row"><a href="${lenke(e)}">${e.navn}</a>${e.lead_ny ? raw(` ${kpille("Ny lead", "ny")}`) : ""}</th><td class="h midt">${orgnr(e.orgnr)}</td><td class="h midt">${e.antall_butikker}</td><td class="midt">${e.kjede === "sigdal" ? "Sigdal" : "Uavhengig"}</td><td class="midt">${e.fylke ?? "–"}</td>${medBelop ? html`<td class="h midt">${e.status === "tapt" ? "–" : kr(e.verdi_ore)}</td>` : ""}<td>${kpille(e.er_kunde ? "Kunde" : STATUSNAVN[e.status] ?? e.status, e.er_kunde ? "kunde" : e.status)}</td></tr>`),
          sumrad: fane === "muligheter" || !medBelop ? "" : html`<tr class="k-sumrad"><th scope="row">Inntekt per måned</th><td class="midt"></td><td class="midt"></td><td class="midt"></td><td class="midt"></td><td class="h midt">${kr(inntekt)}</td><td></td></tr>` })}
        ${sidevelger(side, rader.length, PER_SIDE)}`}`;
  sett(rot, rad(640, [flis({ id: "eiere", tittel: paKunder ? "Kunder" : "Eiere og butikker", teller: data ? rader.length : "", tittelverdi: data && medBelop ? html`· Inntekt per måned <b>${kr(inntekt)}</b>` : "", innhold, klasse: "eiere-flis" })]));
  koble();
}

function koble() {
  kobleKit(rot);
  const felt = q<HTMLInputElement>("#lokalsok");
  felt?.addEventListener("input", () => { sok = felt.value; side = 1; const pos = felt.selectionStart; vis(); const f2 = q<HTMLInputElement>("#lokalsok"); f2?.focus(); f2?.setSelectionRange(pos, pos); });
  for (const [id, sett2] of [["#f-status", (v: string) => (fStatus = v)], ["#f-kjede", (v: string) => (fKjede = v)], ["#f-fylke", (v: string) => (fFylke = v)]] as const)
    q<HTMLSelectElement>(id)?.addEventListener("change", (e) => { sett2((e.target as HTMLSelectElement).value); side = 1; vis(); });
  qa<HTMLButtonElement>("[data-k-side]").forEach((b) => b.addEventListener("click", () => { side = +b.dataset.kSide!; vis(); }));
  q("#nullstill")?.addEventListener("click", () => { sok = ""; fStatus = fKjede = fFylke = "alle"; if (toppsok) toppsok.value = ""; vis(); });
  q("#prov-igjen")?.addEventListener("click", last);
}
if (toppsok) toppsok.addEventListener("input", () => { if (toppsok.dataset.modus === "eiere" && data) { sok = toppsok.value; side = 1; vis(); } });
q("#ny-eier")?.addEventListener("click", async () => { const id = await nyEierDialog(); if (id) location.href = `/salg/eiere/${id}`; });

async function last() {
  if (tilstand() === "tom") { data = { eiere: [], fylker: [] }; return vis({ tomt: true }); }
  if (!data) vis();
  try { data = await api("GET", "/api/eiere"); vis({ tomt: data.eiere.length === 0 && !sok }); }
  catch (e) { vis({ feil: e }); }
}
last();
void esc;
