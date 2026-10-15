/** SA2 Salgstavle: kolonner, kort, dra og slipp (PC), «Tapt» med grunn, filter på produktlinje. Telefon: liste gruppert på status. */
import { api, html, raw, kr, flertall, ikon, neste, kjede, sett, q, qa, feilbanner, skjelett, tilstand, toast, taptDialog, nyEierDialog } from "../lib/dom";

const rot = q("#side")!;
let linje = new URLSearchParams(location.search).get("linje") ?? "";
let data: any = null;
let dras: string | null = null;

const hode = (apen: string) => html`<header class="sidehode"><div><h1>Salgstavle</h1><p class="under">Åpen verdi <b>${apen}</b> per måned</p></div>
  <div class="handlinger"><div class="segment" role="group" aria-label="Produktlinje">${[["", "Alle"], ["sigdal", "Sigdal CRM"], ["hengsel", "Hengsel"]].map(([id, navn]) => html`<button type="button" data-linje="${id}" aria-pressed="${linje === id}">${navn}</button>`)}</div>
  <button class="knapp primar" type="button" id="ny-eier">${raw(ikon("pluss", 18))}Ny mulighet</button></div></header>`;

const kort = (c: any, idag: string) => html`<a class="tavlekort" href="/salg/eiere/${c.id}" draggable="${!c.er_kunde}" data-id="${c.id}" data-navn="${c.navn}">
  <div class="topp"><b>${c.navn}</b>${raw(ikon("dra", 16))}</div>
  <div class="meta">${kjede(c.kjede)}<span>${raw(ikon("utstillinger", 14))} ${flertall(c.antall_butikker, "butikk", "butikker")}</span></div>
  <div class="verdi">${kr(c.verdi_ore)} <span>per mnd</span></div>
  ${c.tap_grunn ? html`<div class="grunn">Grunn: ${c.tap_grunn}</div>` : c.neste_tekst ? neste(c.neste_tekst, c.neste_dato, idag) : ""}</a>`;

function vis(d: any, { tom = false, feil = null as unknown }: { tom?: boolean; feil?: unknown } = {}) {
  data = d;
  const kol = d.kolonner;
  sett(rot, html`${raw(hode(kr(d.apen_verdi_ore)))}
    ${feil ? raw(feilbanner(feil, "Kunne ikke hente salgstavla.")) : ""}
    <div class="tavle" role="list">${kol.map((k: any) => html`<section class="kolonne" data-kolonne="${k.id}" aria-label="${k.navn}">
      <div class="kolonne-hode"><b>${k.navn}</b><span class="antall">${k.antall}</span>${k.antall ? html`<span class="sum">${kr(k.sum_ore)}</span>` : ""}</div>
      ${k.kort.length ? raw(k.kort.map((c: any) => kort(c, d.idag)).join("")) : raw(`<div class="tomt">${tom ? "Tomt" : "Dra et kort hit"}</div>`)}</section>`)}</div>
    <div class="tavle-liste">${kol.filter((k: any) => k.kort.length || tom).map((k: any) => html`<section class="kolonne" aria-label="${k.navn}"><div class="kolonne-hode"><b>${k.navn}</b><span class="antall">${k.antall}</span><span class="sum">${k.antall ? kr(k.sum_ore) : ""}</span></div>${raw(k.kort.map((c: any) => kort(c, d.idag)).join(""))}</section>`)}
      <p class="meta">Status endres fra eierkortet. Dra og slipp finnes bare på PC.</p></div>
    ${tom ? raw(`<div class="kort tom">${ikon("salgstavle", 28)}<b>Ingen muligheter ennå</b><span>Legg inn den første eieren, eller importer listen fra Excel. Leads fra «Be om demo» havner i «Ny» av seg selv.</span><div class="handlinger"><a class="knapp" href="/salg/eiere?import=1">${ikon("last-opp", 18)}Importer fra Excel</a><button class="knapp primar" type="button" id="ny-eier-tom">${ikon("pluss", 18)}Ny eier</button></div></div>`) : ""}`);
  koble();
}

function koble() {
  qa("[data-linje]").forEach((b) => b.addEventListener("click", () => { linje = b.dataset.linje ?? ""; history.replaceState(null, "", linje ? `?linje=${linje}` : location.pathname); last(); }));
  const ny = async () => { const id = await nyEierDialog(); if (id) location.href = `/salg/eiere/${id}`; };
  q("#ny-eier")?.addEventListener("click", ny); q("#ny-eier-tom")?.addEventListener("click", ny);
  q("#prov-igjen")?.addEventListener("click", last);
  // Dra og slipp (bare PC: kortene i .tavle)
  qa<HTMLAnchorElement>(".tavle .tavlekort").forEach((k) => {
    k.addEventListener("dragstart", (e) => { if (k.draggable === false) { e.preventDefault(); return; } dras = k.dataset.id!; k.classList.add("dras"); e.dataTransfer!.effectAllowed = "move"; e.dataTransfer!.setData("text/plain", dras); });
    k.addEventListener("dragend", () => { k.classList.remove("dras"); qa(".kolonne.slipp").forEach((c) => c.classList.remove("slipp")); dras = null; });
    k.addEventListener("click", (e) => { if (dras) e.preventDefault(); });
  });
  qa(".tavle .kolonne").forEach((c) => {
    c.addEventListener("dragover", (e) => { if (!dras) return; e.preventDefault(); e.dataTransfer!.dropEffect = "move"; c.classList.add("slipp"); });
    c.addEventListener("dragleave", () => c.classList.remove("slipp"));
    c.addEventListener("drop", async (e) => {
      e.preventDefault(); c.classList.remove("slipp");
      const id = dras ?? e.dataTransfer?.getData("text/plain"); dras = null;
      const mal = c.dataset.kolonne!;
      if (!id || !data) return;
      const alleKort = data.kolonner.flatMap((k: any) => k.kort.map((x: any) => ({ ...x, kolonne: k.id })));
      const k = alleKort.find((x: any) => x.id === id);
      if (!k || k.kolonne === mal) return;
      await flytt(k, mal);
    });
  });
}

async function flytt(k: any, mal: string) {
  const navn = data.kolonner.find((x: any) => x.id === mal)?.navn ?? mal;
  let kropp: Record<string, unknown> = { status: mal };
  if (mal === "tapt") { const g = await taptDialog(k.navn, data.tap_grunner); if (!g) return; kropp = { status: "tapt", ...g }; }
  try {
    await api("PATCH", `/api/eiere/${k.id}`, kropp);
    toast(mal === "tapt" ? `${k.navn} er markert som tapt` : `${k.navn} er flyttet til ${navn}`);
    await last();
  } catch (e: any) { toast(`Kunne ikke flytte: ${e.message ?? e}`); }
}

async function last() {
  const t = tilstand();
  const tomme = { idag: "", apen_verdi_ore: 0, apne: 0, tap_grunner: [], kolonner: [["ny", "Ny"], ["demo", "Demo avtalt"], ["tilbud", "Tilbud sendt"], ["forhandling", "Forhandling"], ["signert", "Signert"], ["tapt", "Tapt"]].map(([id, navn]) => ({ id, navn, antall: 0, sum_ore: 0, kort: [] })) };
  if (t === "tom") return vis(tomme, { tom: true });
  if (!data) sett(rot, html`${raw(hode("–"))}<div class="tavle">${tomme.kolonner.map((k) => html`<section class="kolonne"><div class="kolonne-hode"><b>${k.navn}</b></div>${raw(skjelett(k.id === "tapt" ? 1 : 2))}</section>`)}</div><div class="tavle-liste">${raw(skjelett(4))}</div>`);
  try { vis(await api("GET", `/api/tavle${linje ? `?linje=${linje}` : ""}`)); }
  catch (e) { if (data) vis(data, { feil: e }); else { sett(rot, html`${raw(hode("–"))}${raw(feilbanner(e, "Kunne ikke hente salgstavla."))}`); q("#prov-igjen")?.addEventListener("click", last); } }
}
last();
document.addEventListener("aktivitet-lagret", last);
