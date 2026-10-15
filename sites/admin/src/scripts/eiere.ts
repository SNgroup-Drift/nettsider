/** SA3 Eiere og butikker / Kunder: søk (navn, sted, org.nr., butikkenes sted), filter på status, kjede og fylke, Excel-import med forhåndsvisning, Ny eier. */
import { api, ApiFeil, html, raw, kr, orgnr, dato, ikon, pille, kjede, sett, q, qa, feilbanner, skjelett, tilstand, toast, nyEierDialog, skjemaDialog, esc } from "../lib/dom";

const rot = q("#side")!;
const bareKunder = rot.dataset.kunder === "1";
const params = new URLSearchParams(location.search);
let sok = params.get("sok") ?? "";
let fStatus = "alle", fKjede = "alle", fFylke = "alle";
let data: any = null;
let sistHentet = "";
const tittel = bareKunder ? "Kunder" : "Eiere og butikker";
const toppsok = q<HTMLInputElement>("#sok");
if (toppsok && sok) toppsok.value = sok;

const hode = () => html`<header class="sidehode"><div><h1>${tittel}</h1><p class="under">${bareKunder ? "Eiere med signert avtale." : "Prospekter, kunder og tapte. Klikk på en rad for eierkortet."}</p></div>
  <div class="handlinger">${bareKunder ? "" : raw(`<button class="knapp" type="button" id="importer">${ikon("last-opp", 18)}Importer fra Excel</button><button class="knapp primar" type="button" id="ny-eier">${ikon("pluss", 18)}Ny eier</button>`)}</div></header>`;

const passer = (e: any, unntak = "") => {
  const q0 = sok.trim().toLowerCase();
  const st = unntak === "s" || fStatus === "alle" || (fStatus === "kunde" ? e.er_kunde : fStatus === "prospekt" ? !e.er_kunde && e.status !== "tapt" : e.status === fStatus);
  const kj = unntak === "k" || fKjede === "alle" || e.kjede === fKjede;
  const fy = unntak === "f" || fFylke === "alle" || e.fylke === fFylke;
  const tekst = `${e.navn} ${e.orgnr ?? ""} ${e.sted ?? ""} ${e.adresse ?? ""} ${e.butikksteder ?? ""} ${e.kontakt_navn ?? ""}`.toLowerCase();
  return st && kj && fy && (!q0 || tekst.includes(q0));
};

function vis(d: any, { tom = false, feil = null as unknown } = {}) {
  data = d;
  const basis = d.eiere;
  const chip = (felt: string, id: string, navn: string, ant: string | number, aktiv: string) => html`<button class="chip" type="button" data-felt="${felt}" data-id="${id}" aria-pressed="${aktiv === id}">${navn}${ant !== "" ? html`<span class="tall">${ant}</span>` : ""}</button>`;
  const statusValg = bareKunder ? [["alle", "Alle"]] : [["alle", "Alle"], ["prospekt", "Prospekt"], ["kunde", "Kunde"], ["tapt", "Tapt"]];
  const tell = (f: (e: any) => boolean, unntak: string) => basis.filter((e: any) => passer(e, unntak) && f(e)).length;
  const rader = basis.filter((e: any) => passer(e));
  const lenke = (e: any) => (bareKunder ? `/kunder/${e.id}` : `/salg/eiere/${e.id}`);
  sett(rot, html`${raw(hode())}
    ${feil ? raw(feilbanner(feil, `Kunne ikke hente ${tittel.toLowerCase()}.${sistHentet ? ` Sist oppdatert ${sistHentet}.` : ""}`)) : ""}
    <div class="kort">
      <div class="felt-rad sok-og-status felt-rad" >
        <label class="felt"><span>Søk</span><input class="inntast" id="lokalsok" type="search" value="${sok}" placeholder="Navn, sted, org.nr. eller butikkens sted" /></label>
        <div class="chips"><span class="navn">Status</span>${statusValg.map(([id, n]) => chip("status", id, n, tell((e) => id === "alle" || (id === "kunde" ? e.er_kunde : id === "prospekt" ? !e.er_kunde && e.status !== "tapt" : e.status === id), "s"), fStatus))}</div>
      </div>
      <div class="mt-10 chips" ><span class="navn">Kjede</span>${[["alle", "Alle"], ["sigdal", "Sigdal"], ["annen", "Uavhengig"]].map(([id, n]) => chip("kjede", id, n, tell((e) => id === "alle" || e.kjede === id, "k"), fKjede))}
        <span class="ml-10 navn" >Fylke</span>${[["alle", "Alle"], ...d.fylker.map((f: string) => [f, f])].map(([id, n]) => chip("fylke", id, n, "", fFylke))}</div>
    </div>
    <div class="kort tabellramme">
      ${tom ? raw(`<div class="tom">${ikon("utstillinger", 28)}<b>Ingen eiere ennå</b><span>Importer kjedelisten fra Excel, eller legg inn den første eieren. Du ser alltid en forhåndsvisning før noe lagres.</span><div class="handlinger"><button class="knapp" type="button" id="importer-tom">${ikon("last-opp", 18)}Importer fra Excel</button></div></div>`)
      : rader.length === 0 ? raw(`<div class="tom">${ikon("sok", 28)}<b>Ingen treff${sok ? ` på «${esc(sok)}»` : ""}</b><span>Søket ser på navn, sted, org.nr. og butikkenes sted. Prøv et annet ord, eller fjern et filter.</span><div class="handlinger"><button class="knapp" type="button" id="nullstill">Nullstill søk</button></div></div>`)
      : html`<table class="tabell"><thead><tr><th>Eier</th><th>Org.nr.</th><th class="hoyre">Butikker</th><th>Kjede</th><th>Fylke</th><th class="hoyre">Verdi per mnd</th><th>Status</th><th>Kontakt</th><th>Første kontakt</th></tr></thead>
        <tbody>${rader.map((e: any) => html`<tr data-lenke="${lenke(e)}"><td><a href="${lenke(e)}">${e.navn}</a>${e.lead_ny ? raw(` <span class="pille" data-status="ny">Ny</span>`) : ""}</td><td class="dempet">${orgnr(e.orgnr)}</td><td class="hoyre">${e.antall_butikker}</td><td>${kjede(e.kjede)}</td><td class="dempet">${e.fylke ?? "–"}</td><td class="hoyre">${e.status === "tapt" ? "–" : kr(e.verdi_ore)}</td><td>${pille(e.er_kunde ? "kunde" : e.status)}</td><td class="dempet">${e.kontakt_navn ?? "–"}</td><td class="dempet">${dato(e.forste_kontakt)}</td></tr>`)}</tbody></table>`}
    </div>`);
  koble();
}

function koble() {
  qa<HTMLButtonElement>(".chip[data-felt]").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.id!; if (b.dataset.felt === "status") fStatus = id; else if (b.dataset.felt === "kjede") fKjede = id; else fFylke = id; vis(data); }));
  const felt = q<HTMLInputElement>("#lokalsok");
  felt?.addEventListener("input", () => { sok = felt.value; const pos = felt.selectionStart; vis(data); const f2 = q<HTMLInputElement>("#lokalsok"); f2?.focus(); f2?.setSelectionRange(pos, pos); });
  q("#nullstill")?.addEventListener("click", () => { sok = ""; fStatus = fKjede = fFylke = "alle"; if (toppsok) toppsok.value = ""; vis(data); });
  qa<HTMLTableRowElement>("tr[data-lenke]").forEach((r) => r.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; location.href = r.dataset.lenke!; }));
  q("#ny-eier")?.addEventListener("click", async () => { const id = await nyEierDialog(); if (id) location.href = `/salg/eiere/${id}`; });
  q("#importer")?.addEventListener("click", importer); q("#importer-tom")?.addEventListener("click", importer);
  q("#prov-igjen")?.addEventListener("click", last);
}
if (toppsok) toppsok.addEventListener("input", () => { if (toppsok.dataset.modus === "eiere" && data) { sok = toppsok.value; vis(data); } });

/** Import fra Excel: fil → forhåndsvisning → «Importer N rader» */
async function importer() {
  let fv: any = null;
  const innhold = `<label class="felt"><span>Fil (.xlsx eller .csv, én rad per eier, første rad er overskrifter)</span><input name="fil" type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" required /></label>
    <p class="meta">Kolonner: Eier · Org.nr. · Adresse · Postnr. · Sted · Fylke · Kjede · Antall butikker · Butikker (skilt med semikolon) · Kontakt · Kontakt e-post · Kontakt telefon · Kilde. Rader uten org.nr. importeres som prospekt og merkes for oppfølging.</p>
    <div id="forhandsvisning"></div>`;
  await skjemaDialog({ tittel: "Importer fra Excel", innhold, knapp: "Importer", bred: true, send: async (_d, form) => {
    const fil = (form.elements.namedItem("fil") as HTMLInputElement).files?.[0];
    const boks = q("#forhandsvisning", form)!;
    const knapp = q<HTMLButtonElement>("[data-send]", form)!;
    if (!fv) {
      if (!fil) throw new ApiFeil(400, "ADM-400", "Velg en fil.", { fil: "Velg en fil." });
      boks.innerHTML = `<p class="meta">Leser ${esc(fil.name)} …</p>`;
      fv = await api("POST", "/api/import/forhandsvis", undefined, { fil });
      const RES: Record<string, [string, string]> = { ny: ["Ny", "signert"], oppdateres: ["Oppdateres", "utkast"], mangler_orgnr: ["Mangler org.nr.", "fornyes_snart"], hoppes: ["Hoppes over", "sagt_opp"] };
      boks.innerHTML = String(html`<p><b>${fv.filnavn}</b> · ${fv.antall} rader · forhåndsvisning før import</p>
        <div class="chips">${raw(`<span class="pille" data-status="signert">${fv.telling.ny} nye</span><span class="pille" data-status="utkast">${fv.telling.oppdateres} finnes, oppdateres</span><span class="pille" data-status="fornyes_snart">${fv.telling.mangler_orgnr} mangler org.nr.</span>${fv.telling.hoppes ? `<span class="pille" data-status="sagt_opp">${fv.telling.hoppes} hoppes over</span>` : ""}`)}</div>
        <div class="rull-40 tabellramme" ><table class="tabell"><thead><tr><th>Eier (kolonne A)</th><th>Org.nr. (B)</th><th class="hoyre">Butikker</th><th>Kjede</th><th>Fylke</th><th>Resultat</th></tr></thead>
        <tbody>${fv.rader.map((r: any) => html`<tr><td>${r.navn || raw(`<span class="dempet">(tom)</span>`)}</td><td class="dempet">${r.orgnr ? orgnr(r.orgnr) : r.orgnr_tekst || "–"}</td><td class="hoyre">${r.antall_butikker}</td><td>${r.kjede === "sigdal" ? "Sigdal" : "Annen"}</td><td class="dempet">${r.fylke || "–"}</td><td>${pille(RES[r.resultat][1], RES[r.resultat][0])}${r.merknad ? html` <span class="meta">${r.merknad}</span>` : ""}</td></tr>`)}</tbody></table></div>
        <p class="meta">Ingenting er lagret ennå. Tomme felt fylles hos eiere som finnes; utfylte felt overskrives ikke.</p>`);
      const n = fv.telling.ny + fv.telling.oppdateres + fv.telling.mangler_orgnr;
      knapp.textContent = `Importer ${n} rader`;
      if (n === 0) knapp.disabled = true;
      return false; // dialogen står: forhåndsvisningen vises til «Importer N rader» trykkes
    }
    const res: any = await api("POST", "/api/import", { rader: fv.raa });
    toast(`${res.importert + res.oppdatert} rader importert.${res.mangler_orgnr ? ` ${res.mangler_orgnr} må få org.nr.` : ""}${res.oppdatert ? ` ${res.oppdatert} oppdatert.` : ""}`);
    await last();
  } });
}

async function last() {
  const t = tilstand();
  if (t === "tom") return vis({ eiere: [], fylker: [] }, { tom: true });
  if (!data) sett(rot, html`${raw(hode())}<div class="kort">${raw(skjelett(6, "rad"))}</div>`);
  try { const d = await api("GET", `/api/eiere${bareKunder ? "?kunder=1" : ""}`); sistHentet = new Date().toLocaleString("nb-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", " kl."); vis(d, { tom: d.eiere.length === 0 && !sok }); }
  catch (e) { if (data) vis(data, { feil: e }); else { sett(rot, html`${raw(hode())}${raw(feilbanner(e, `Kunne ikke hente ${tittel.toLowerCase()}.`))}`); q("#prov-igjen")?.addEventListener("click", last); } }
}
last().then(() => { if (params.get("import") === "1" && !bareKunder) importer(); });
