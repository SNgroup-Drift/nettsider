/** SC3 KPI-justering (K-260): prosent for hånd, varsel X dager før (eksempel 30), ny pris per kunde (hele kroner) og e-postutkast. Ingenting sendes. */
import { api, html, raw, sett, q, qa, kr, dato, ikon, pille, toast, esc } from "../lib/dom";
import { rot, sidehode, lagLaster, tom, eksempel } from "../lib/fase-c";

const STATUS: Record<string, string> = { utkast_klart: "Utkast klart", senere: "Senere", varslet: "Varslet", mangler_prosent: "Mangler KPI" };
let valgt = "";
const aar = () => new Date().getFullYear();
const hode = (d?: any) => sidehode(`KPI-justering ${d?.justering?.aar ?? aar()}`, "Årlig, på avtalens årsdag. Prosenten legges inn for hånd. E-posten til kunden sendes ikke automatisk.");

const laster = lagLaster<any>({
  omraade: "Fakturering", feiltekst: "Kunne ikke hente KPI-justeringen.", hode: () => hode(),
  tomData: () => ({ justering: null, rader: [], neste_abonnement_id: null, klar_dager: 14 }),
  hent: () => api("GET", "/api/kpi"), vis,
});

function vis(d: any) {
  if (!valgt || !d.rader.some((r: any) => r.abonnement_id === valgt)) valgt = d.neste_abonnement_id ?? d.rader.find((r: any) => r.epost)?.abonnement_id ?? "";
  const j = d.justering;
  const r = d.rader.find((x: any) => x.abonnement_id === valgt);
  const prosent = j ? String(j.prosent).replace(".", ",") : "";
  sett(rot(), html`${hode(d)}
    <form class="kort kpi-felt" id="kpi-skjema" novalidate>
      <label class="felt"><span>KPI siste 12 måneder (%)</span><input name="prosent" type="text" inputmode="decimal" value="${prosent}" placeholder="3,1" required /></label>
      <label class="felt"><span>Varsel til kunden, dager før ${j?.eksempel !== false ? eksempel() : ""}</span><input name="varsel_dager" type="number" min="1" max="365" value="${j?.varsel_dager ?? 30}" /></label>
      <label class="felt"><span>Kilde</span><input name="kilde" type="text" maxlength="120" value="${j?.kilde ?? "SSB, lagt inn for hånd"}" /></label>
      <button class="knapp primar" type="submit">Lagre</button>
      <span class="meta">Ny pris = pris i dag × (1 + KPI), avrundet til hele kroner. Gjelder pakker, brukere, Ute og tillegg. Viderefakturering justeres ikke.</span>
    </form>
    ${!d.rader.length ? html`<div class="kort">${tom("prisavvik", "Ingen abonnementer å justere", "KPI-justeringen gjelder aktive abonnementer, på avtalens årsdag.")}</div>`
    : html`<div class="bred-smal">
      <section class="kort flat"><div class="korthode"><h2>Nye priser per kunde</h2><span class="meta">Per måned uten mva</span></div>
        <div class="tabellramme"><table class="tabell"><thead><tr><th>Kunde</th><th>KPI-dato</th><th>Varsles</th><th class="hoyre">I dag</th><th class="hoyre">Ny pris</th><th class="hoyre">Endring</th><th>Status</th></tr></thead>
        <tbody>${d.rader.map((x: any) => html`<tr data-velg="${x.abonnement_id}" aria-selected="${x.abonnement_id === valgt}" tabindex="0"><td><b>${x.eier_navn}</b></td><td>${dato(x.kpi_dato)}</td><td class="dempet">${x.varseldato ? dato(x.varseldato) : "–"}</td><td class="hoyre dempet">${kr(x.pris_ore)}</td><td class="hoyre"><b>${x.ny_pris_ore === null ? "–" : kr(x.ny_pris_ore)}</b></td><td class="hoyre dempet">${x.endring_ore === null ? "–" : `+${kr(x.endring_ore)}`}</td><td>${pille(x.status, x.status === "varslet" ? `Varslet ${dato(x.varslet)}` : STATUS[x.status])}</td></tr>`)}</tbody></table></div>
        <div class="rad-linje dempet">«Utkast klart» når varseldatoen er innen ${d.klar_dager} dager.</div></section>
      <section class="kort flat" aria-labelledby="h-epost"><div class="korthode"><h2 id="h-epost">Utkast til e-post</h2>${pille("eksempel", "Sendes ikke automatisk")}</div>
        ${r?.epost ? html`<div class="epost-hode"><span>Til</span><span>${r.til ? `${r.til.navn} <${r.til.epost ?? "mangler e-post"}>` : "Ingen kontakt"}</span><span>Emne</span><b>${r.epost.emne}</b></div>
          <div class="epost" id="epost-tekst">${r.epost.tekst}</div>
          <div class="rad-linje"><span></span><span class="rad-flex">${r.status !== "varslet" ? raw(`<button class="knapp" type="button" id="merk">Merk som varslet</button>`) : ""}<button class="knapp primar" type="button" id="kopier">${raw(ikon("tilbud", 18))}Kopier e-posten</button></span></div>`
        : tom("prisavvik", j ? "Velg en kunde" : "Legg inn KPI-prosenten", j ? "Klikk en rad for å se e-posten." : "Når prosenten er lagt inn, lages et utkast per kunde.")}
      </section></div>`}`);
  q<HTMLFormElement>("#kpi-skjema")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    try { await api("PUT", `/api/kpi/${j?.aar ?? aar()}`, { prosent: f.get("prosent"), varsel_dager: f.get("varsel_dager"), kilde: f.get("kilde"), eksempel: j ? (j.eksempel ? 1 : 0) : 1 }); toast("KPI-prosenten er lagret"); laster.last(); }
    catch (err: any) { toast(err?.message ?? "Kunne ikke lagre"); }
  });
  qa<HTMLTableRowElement>("tr[data-velg]").forEach((tr) => { const v = () => { valgt = tr.dataset.velg!; vis(d); }; tr.addEventListener("click", v); tr.addEventListener("keydown", (e) => { if (e.key === "Enter") v(); }); });
  q("#kopier")?.addEventListener("click", async () => {
    const tekst = `Til: ${r.til?.epost ?? ""}\nEmne: ${r.epost.emne}\n\n${r.epost.tekst}`;
    try { await navigator.clipboard.writeText(tekst); toast("E-posten er kopiert. Lim den inn i e-postprogrammet."); } catch { toast("Kunne ikke kopiere. Merk teksten og kopier selv."); }
  });
  q("#merk")?.addEventListener("click", async () => {
    await api("POST", `/api/kpi/${j.aar}/varslet`, { abonnement_id: r.abonnement_id });
    toast(`${r.eier_navn} er merket som varslet. Ny pris gjelder fra ${dato(r.kpi_dato)}.`); laster.last();
  });
  void esc;
}
laster.last();
