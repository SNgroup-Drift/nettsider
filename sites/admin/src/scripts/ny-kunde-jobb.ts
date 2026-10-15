/**
 * Opprett kunde, fremdrift (K-272, S-65): hvert steg med grønt/rødt/pågår, tid og logg (renset i Action-en og i Workeren), «Prøv igjen herfra»
 * på hvert steg, «Fjern testkunde» (bare kunder merket test, kunde-id skrives som bekreftelse), historikk (hvem og når) og, når alt er ferdig,
 * sjekklisten for kunden (DNS-post, e-postkobling, første innlogging) som kan kopieres. Siden henter på nytt hvert 4. sekund mens jobben pågår.
 */
import { api, ApiFeil, html, raw, q, qa, sett, skjelett, feilbanner, ikon, esc, tid, pille, toast, idFraSti, skjemaDialog } from "../lib/dom";

const rot = q("#side")!;
const id = idFraSti();
let d: any = null;
let timer: ReturnType<typeof setInterval> | null = null;
const PAGAR = ["ny", "kjorer", "fjerner"];
const STATUS_PILLE: Record<string, string> = { ny: "demo", kjorer: "demo", fjerner: "demo", feil: "feil", ferdig: "aktiv", fjernet: "utkast" };
const IKON: Record<string, string> = { ok: "hake", feil: "stoppet", kjorer: "pil-hoyre", venter: "frist" };
const sek = (n: number | null) => (n === null || n === undefined ? "" : n >= 60 ? `${Math.floor(n / 60)} min ${n % 60} s` : `${n} s`);

function stegRad(s: any, j: any) {
  const kanProve = !PAGAR.includes(j.status) && j.status !== "fjernet" && (s.status === "feil" || s.status === "ok");
  return html`<li class="jobb-steg" data-status="${s.status}">
    <span class="steg-ikon" data-status="${s.status}" aria-hidden="true">${raw(IKON[s.status] ? ikon(IKON[s.status], 18) : "")}</span>
    <div class="steg-tekst"><b>${s.nr}. ${s.navn}</b>
      <span class="meta">${s.status_navn}${s.sekunder !== null && s.sekunder !== undefined ? ` · ${sek(s.sekunder)}` : ""}${s.forsok ? ` · forsøk ${s.forsok + 1}` : ""}</span>
      ${s.feil ? html`<p class="steg-feil" role="alert">${s.feil}</p>` : ""}
      ${s.resultat && Object.keys(s.resultat).length ? html`<span class="meta">${Object.entries(s.resultat).filter(([k]) => !["hemmeligheter"].includes(k)).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · ")}</span>` : ""}
      ${s.logg ? html`<details class="steg-logg"><summary>Vis logg</summary><pre>${s.logg}</pre></details>` : ""}</div>
    ${kanProve ? html`<button class="knapp liten" type="button" data-prov="${s.kode}" data-nr="${s.nr}">${raw(ikon("pil-hoyre", 16))}${s.status === "ok" ? "Kjør på nytt herfra" : "Prøv igjen herfra"}</button>` : ""}</li>`;
}

function sjekkBoks(tittel: string, punkter: any[]) {
  return html`<section class="kort" aria-label="${tittel}"><h3 class="korthode">${tittel}</h3><ol class="sjekk-liste">${punkter.map((p) => html`<li><b>${p.tittel}</b><span>${p.tekst}</span>${p.kopi ? html`<code>${p.kopi}</code>` : ""}</li>`)}</ol></section>`;
}

function vis() {
  const j = d.jobb;
  const ferdigAntall = d.steg.filter((s: any) => s.status === "ok").length;
  sett(rot, html`<div class="oppstart-topplinje"><a class="tilbake" href="/oppstart/opprett-kunde">${raw(ikon("pil-venstre", 16))}Opprett kunde</a></div>
    <header class="sidehode"><div><h1>${j.navn}</h1><p class="under">${j.kunde_id}${j.test ? " · testkunde" : ""}${j.torrkjoring ? " · tørrkjøring" : ""} · startet ${tid(j.opprettet)} av ${j.startet_av} · gren ${j.git_ref}</p></div>
      <div class="handlinger">${pille(STATUS_PILLE[j.status], j.status_navn)}${j.run_url ? html`<a class="knapp" href="${j.run_url}" target="_blank" rel="noopener">${raw(ikon("lenke", 18))}Action-kjøringen</a>` : ""}${d.kan_fjernes ? html`<button class="knapp" type="button" id="fjern">Fjern testkunde</button>` : ""}</div></header>
    <div id="melding"></div>
    ${j.status === "feil" ? html`<div class="banner" role="alert">${raw(ikon("stoppet", 20))}<div><b>Oppsettet stoppet.</b> Se steget markert rødt. Alt tåler å kjøres på nytt: velg «Prøv igjen herfra» på steget.</div></div>` : ""}
    ${j.status === "ny" ? html`<div class="banner info">${raw(ikon("frist", 20))}<div><b>Venter på at Action-en starter.</b> Første rapport kommer vanligvis innen et halvt minutt.</div></div>` : ""}
    <section class="kort uten-pad" aria-labelledby="h-steg"><h2 id="h-steg" class="korthode">Steg <span class="mer">${ferdigAntall} av ${d.steg.length} ferdig</span></h2>
      <ol class="jobb-steg-liste">${d.steg.map((s: any) => stegRad(s, j))}</ol></section>
    ${d.pr_url ? html`<p class="meta">Kundelista: <a href="${d.pr_url}" target="_blank" rel="noopener">${d.pr_url}</a></p>` : ""}
    ${d.sjekkliste ? html`<div class="sjekk-hode"><h2>Sjekkliste</h2><button class="knapp" type="button" id="kopier">${raw(ikon("tilbud", 18))}Kopier sjekklisten til kunden</button></div>
      <div class="sjekk-grid">${sjekkBoks("For kunden", d.sjekkliste.kunde)}${sjekkBoks("For Eirik", d.sjekkliste.intern)}</div>` : ""}
    <section class="kort uten-pad" aria-labelledby="h-hist"><h2 id="h-hist" class="korthode">Historikk <span class="mer">hvem og når</span></h2>
      <div class="tabellramme"><table class="tabell"><thead><tr><th>Tid</th><th>Hvem</th><th>Hva</th></tr></thead><tbody>
      ${d.historikk.map((h: any) => html`<tr><td>${tid(h.tid)}</td><td>${h.hvem}</td><td>${h.handling}${h.detalj ? html`<span class="meta blokk">${h.detalj}</span>` : ""}</td></tr>`)}</tbody></table></div></section>`);
  koble();
}

function visFeil(e: unknown) {
  const f = e instanceof ApiFeil ? e : new ApiFeil(0, "ADM-504", "Noe gikk galt.");
  sett(q("#melding", rot), `<div class="banner" role="alert">${ikon("stoppet", 18)}<div><b>Det gikk ikke.</b> ${esc(f.message)} <span class="feilkode">Feilkode ${esc(f.kode)}.</span></div></div>`);
}

function koble() {
  qa<HTMLButtonElement>("[data-prov]", rot).forEach((b) => b.addEventListener("click", async () => {
    b.disabled = true;
    try { await api("POST", `/api/ny-kunde/${id}/prov-igjen`, { fra_steg: b.dataset.prov }); toast("Startet på nytt"); await last(); } catch (e) { visFeil(e); b.disabled = false; }
  }));
  q("#kopier", rot)?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(d.sjekkliste_tekst ?? ""); toast("Sjekklisten er kopiert"); } catch { visFeil(new ApiFeil(0, "ADM-000", "Kunne ikke kopiere. Marker teksten for hånd.")); }
  });
  q("#fjern", rot)?.addEventListener("click", async () => {
    const kid = d.jobb.kunde_id;
    const r = await skjemaDialog({ tittel: "Fjern testkunde", knapp: "Fjern for godt",
      innhold: `<p>Sletter Supabase-prosjektet, Pages-prosjektet, GitHub-miljøet og raden i kundelista for <b>${esc(kid)}</b>. Kan ikke angres.</p><div class="felt"><label for="f-bekreft"><span>Skriv <b>${esc(kid)}</b> for å bekrefte</span></label><input id="f-bekreft" name="bekreft" autocomplete="off" /></div>`,
      send: async (x) => { await api("POST", `/api/ny-kunde/${id}/fjern`, { bekreft: x.bekreft }); } });
    if (r) { toast("Nedrigging startet"); await last(); }
  });
}

async function last() {
  try {
    d = await api("GET", `/api/ny-kunde/${id}`);
    vis();
    const pagar = PAGAR.includes(d.jobb.status);
    if (pagar && !timer) timer = setInterval(() => { if (!document.hidden) void oppdater(); }, 4000);
    if (!pagar && timer) { clearInterval(timer); timer = null; }
  } catch (e) { sett(rot, html`<header class="sidehode"><div><h1>Oppsett av kunde</h1></div></header>${raw(feilbanner(e, "Kunne ikke hente jobben."))}`); q("#prov-igjen", rot)?.addEventListener("click", last); }
}
/** Stille oppdatering: åpne logger og rullingen beholdes ved å bare bytte innholdet når noe har endret seg */
async function oppdater() {
  try {
    const ny = await api("GET", `/api/ny-kunde/${id}`);
    if (JSON.stringify([ny.jobb, ny.steg, ny.historikk]) !== JSON.stringify([d.jobb, d.steg, d.historikk])) {
      const apne = qa<HTMLDetailsElement>("details[open]", rot).length;
      d = ny;
      if (!apne) vis();
      if (!PAGAR.includes(ny.jobb.status) && timer) { clearInterval(timer); timer = null; if (apne) vis(); }
    }
  } catch { /* neste runde */ }
}
sett(rot, raw(skjelett(3, "rad")));
void last();
