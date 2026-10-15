/** SA5 Prisberegner: regner lokalt med beregn() fra src/lib/pris.js og gjeldende prisliste. «Lag tilbud» lagrer en ny versjon på muligheten med prislisteversjonen og åpner PDF-en. */
import { api, html, raw, kr, flertall, ikon, sett, q, qa, feilbanner, skjelett, toast, esc, orgnr } from "../lib/dom";
import { beregn } from "../lib/pris.js";

const rot = q("#side")!;
const eierId = new URLSearchParams(location.search).get("eier");
let pl: any = null, linjenavn: Record<string, string> = {}, eier: any = null, kontakter: any[] = [];
let linje = "hengsel";
let butikker: { navn: string; pakke: string; brukere: number; montorer: number }[] = [];
let tillegg: string[] = [];
let kontaktId = "";

const PAKKER = ["start", "butikk", "komplett"];
const hode = () => html`<header class="sidehode"><div><h1>Prisberegner</h1><p class="under">${pl ? html`${pl.eksempel ? raw(`<span class="eksempel-merke">Eksempel – prislisten er ikke låst</span> `) : ""}Prisliste ${pl.versjon}${pl.gjelder_fra ? `, gjelder fra ${pl.gjelder_fra.split("-").reverse().join(".")}` : ""}${eier ? ` · Eier: ${eier.navn}` : " · Ingen eier valgt"}` : "Henter prislisten …"}</p></div>
  <div class="handlinger"><div class="segment" role="group" aria-label="Produktlinje">${Object.entries(linjenavn).map(([id, navn]) => html`<button type="button" data-linje="${id}" aria-pressed="${linje === id}">${navn}</button>`)}</div></div></header>`;

function vis() {
  if (!pl) return;
  const r = beregn(pl, linje, butikker, { tillegg });
  const P = pl.pakker[linje];
  const n = butikker.length;
  const trinnTekst = r.rabatt_prosent ? `${n} butikker gir ${r.rabatt_prosent} % kjederabatt` : `${flertall(n, "butikk", "butikker")} · ingen kjederabatt`;
  const uteTekst = r.ute.modell === "firma" ? `${r.ute.antall} montører · firmapris for opptil ${r.ute.firma_maks} montører` : r.ute.modell === "montor" ? `${r.ute.antall} montører × ${kr(r.ute.montor_ore)}${r.ute.antall > r.ute.firma_maks ? ` · over ${r.ute.firma_maks}, firmapris gjelder ikke` : ` · billigere enn firmapris ${kr(r.ute.firma_ore)}`}` : "Ingen montører";
  const etab: Record<string, number> = {};
  for (const x of r.rader) etab[x.pakke] = (etab[x.pakke] ?? 0) + 1;
  const neste = r.neste_trinn ? `${r.neste_trinn.prosent} % fra ${r.neste_trinn.fra_butikker} butikker hos samme eier. ${r.neste_trinn.fra_butikker - n} til gir ${r.rabatt_prosent ? `${r.neste_trinn.prosent} %` : "rabatt"}.` : "";
  sett(rot, html`${raw(hode())}
    <div class="to-kolonner">
      <div class="rutenett en-kolonne" >
        <section class="kort"><h2>Butikker <span class="mer">${flertall(n, "butikk", "butikker")} · pakke per butikk</span></h2>
          ${butikker.map((b, i) => { const p = P[b.pakke]; const x = r.rader[i]; return html`<div class="butikklinje" data-i="${i}">
            <div class="navn"><input type="text" value="${b.navn}" aria-label="Butikknavn" data-navn="${i}" /><span class="inkludert">${p.inkl_brukere} brukere og ${p.support_timer} t support/mnd inkludert</span></div>
            <button class="knapp tekst ikon-knapp" type="button" data-fjern="${i}" aria-label="Fjern butikken">${raw(ikon("lukk", 18))}</button>
            <div class="oppsett"><div class="segment" role="group" aria-label="Pakke">${PAKKER.map((k) => html`<button type="button" data-pakke="${k}" data-i="${i}" aria-pressed="${b.pakke === k}">${P[k].navn} · ${kr(P[k].pris_ore).replace(" kr", "")}</button>`)}</div>
            <div class="teller">Ekstra brukere<div><button type="button" data-minus="brukere" data-i="${i}" aria-label="Færre brukere">–</button><output>${b.brukere}</output><button type="button" data-pluss="brukere" data-i="${i}" aria-label="Flere brukere">${raw(ikon("pluss", 14))}</button></div></div>
            <div class="teller">Montører<div><button type="button" data-minus="montorer" data-i="${i}" aria-label="Færre montører">–</button><output>${b.montorer}</output><button type="button" data-pluss="montorer" data-i="${i}" aria-label="Flere montører">${raw(ikon("pluss", 14))}</button></div></div>
            <div class="sum">${kr(x.sum_ore)}/mnd${x.antall_brukere ? html`<small>${kr(x.pakke_ore)} + ${x.antall_brukere} × ${kr(p.ekstra_bruker_ore)}</small>` : ""}</div></div></div>`; })}
          <button class="mt-12 knapp" type="button" id="legg-til" >${raw(ikon("pluss", 18))}Legg til butikk</button></section>
        <section class="kort"><h2>Gjelder hele eieren <span class="mer">${trinnTekst}</span></h2>
          <div class="liste"><div class="rad-flex">${raw(ikon("min-dag", 20))}<div class="tekst"><b>Hengsel Ute</b><span>${uteTekst}</span></div><b>${kr(r.ute.pris_ore)}</b></div></div>
          <p class="mt-10 mb-6 meta" >Tillegg per eier, uten rabatt</p>
          <div class="tilleggsvalg">${r.tillegg.map((t: any) => html`<button class="chip" type="button" data-tillegg="${t.kode}" aria-pressed="${t.valgt}" aria-disabled="${t.inkludert}"><span>${t.valgt ? raw(ikon("hake", 14)) : ""} ${t.navn}</span><span class="tall">${t.inkludert ? "Inkludert" : `${kr(t.pris_ore)}/mnd`}</span></button>`)}</div>
          <p class="mt-10 meta" >${raw(ikon("sendt", 14))} SMS, Penneo og AI viderefaktureres etter bruk: kostpris + ${pl.viderefakturering_prosent} %, uten rabatt.</p></section>
      </div>
      <div class="rutenett en-kolonne" >
        <section class="kort"><h2>Sum per måned</h2>
          <div class="sumlinjer">
            ${r.rader.map((x: any) => html`<div><span>${x.navn}<span class="under">${x.pakkeNavn}${x.antall_brukere ? ` + ${x.antall_brukere} ekstra ${x.antall_brukere > 1 ? "brukere" : "bruker"}` : ""}</span></span><span class="belop">${kr(x.sum_ore)}</span></div>`)}
            ${r.ute.modell !== "ingen" ? html`<div><span>Hengsel Ute<span class="under">${r.ute.modell === "firma" ? `Firmapris, ${r.ute.antall} montører` : `${r.ute.antall} × ${kr(r.ute.montor_ore)}`}</span></span><span class="belop">${kr(r.ute.pris_ore)}</span></div>` : ""}
            <div class="${r.rabatt_ore ? "rabatt" : ""}"><span>${r.rabatt_prosent ? `Kjederabatt ${r.rabatt_prosent} % av ${kr(r.grunnlag_ore)}` : "Kjederabatt"}<span class="under">Gjelder pakker, ekstra brukere og Ute over</span></span><span class="belop">${r.rabatt_ore ? `−${kr(r.rabatt_ore)}` : "0 kr"}</span></div>
            ${neste ? html`<div><span class="meta">${neste}</span></div>` : ""}
            ${r.tillegg.filter((t: any) => t.valgt).map((t: any) => html`<div><span>${t.navn}<span class="under">${t.grunn}</span></span><span class="belop">${kr(t.belop_ore)}</span></div>`)}
            <div class="sum-rad"><span>Per måned, uten mva</span><span class="belop">${kr(r.netto_ore)}</span></div>
            <div><span>Mva ${pl.mva_prosent} %</span><span class="belop">${kr(r.mva_ore)}</span></div>
            <div class="stor"><span>Per måned, med mva</span><span class="belop">${kr(r.inkl_ore)}</span></div>
            <div><span>Per år, uten mva</span><span class="belop">${kr(r.aar_ore)}</span></div>
            <div><span>Per år, med mva</span><span class="belop">${kr(r.aar_inkl_ore)}</span></div>
            <div><span class="meta">Snitt per butikk per måned</span><span class="belop meta">${kr(r.per_butikk_ore)}</span></div>
          </div></section>
        <section class="kort"><h2>Etablering, engangs, uten rabatt</h2>
          <div class="sumlinjer">${Object.entries(etab).map(([k, antall]) => html`<div><span>${antall} × ${P[k].navn} à ${kr(P[k].etablering_ore)}</span><span class="belop">${kr(antall * P[k].etablering_ore)}</span></div>`)}
            <div><span>Mva ${pl.mva_prosent} %</span><span class="belop">${kr(r.etablering_mva_ore)}</span></div>
            <div class="sum-rad"><span>Etablering med mva</span><span class="belop">${kr(r.etablering_inkl_ore)}</span></div></div>
          <p class="mt-10 meta" >Support inkludert første år: ${r.support_timer} t per måned til sammen. Binding ${pl.binding_mnd} måneder. Prisene justeres årlig etter KPI.</p></section>
        <section class="kort">
          ${eier ? html`<label class="mb-10 felt" ><span>Att. (kontakt i tilbudet)</span><select id="kontakt"><option value="">Første kontakt med signaturrett</option>${kontakter.map((k) => html`<option value="${k.id}" ${k.id === kontaktId ? "selected" : ""}>${k.navn}${k.rolle ? `, ${k.rolle}` : ""}</option>`)}</select></label>` : raw(`<p class="meta">Åpne prisberegneren fra et eierkort for å lage et tilbud. Her kan du regne fritt.</p>`)}
          <button class="knapp primar" type="button" id="lag-tilbud" ${!eier || !n ? "disabled" : ""}>${raw(ikon("tilbud", 18))}Lag tilbud</button>
          <p class="mt-8 meta" >Tilbudet lagres på muligheten som ny versjon, med prisliste ${pl.versjon}.${eier?.orgnr ? ` Til ${esc(eier.navn)}, org.nr. ${orgnr(eier.orgnr)}.` : ""}</p></section>
      </div>
    </div>`);
  koble();
}

function koble() {
  qa<HTMLButtonElement>("[data-linje]").forEach((b) => b.addEventListener("click", () => { linje = b.dataset.linje!; vis(); }));
  qa<HTMLButtonElement>("[data-pakke]").forEach((b) => b.addEventListener("click", () => { butikker[+b.dataset.i!].pakke = b.dataset.pakke!; vis(); }));
  qa<HTMLButtonElement>("[data-pluss]").forEach((b) => b.addEventListener("click", () => { const f = b.dataset.pluss as "brukere" | "montorer"; butikker[+b.dataset.i!][f]++; vis(); }));
  qa<HTMLButtonElement>("[data-minus]").forEach((b) => b.addEventListener("click", () => { const f = b.dataset.minus as "brukere" | "montorer"; butikker[+b.dataset.i!][f] = Math.max(0, butikker[+b.dataset.i!][f] - 1); vis(); }));
  qa<HTMLInputElement>("[data-navn]").forEach((i) => i.addEventListener("change", () => { butikker[+i.dataset.navn!].navn = i.value.trim() || `Butikk ${+i.dataset.navn! + 1}`; vis(); }));
  qa<HTMLButtonElement>("[data-fjern]").forEach((b) => b.addEventListener("click", () => { butikker.splice(+b.dataset.fjern!, 1); vis(); }));
  q("#legg-til")?.addEventListener("click", () => { butikker.push({ navn: `Ny butikk ${butikker.length + 1}`, pakke: "start", brukere: 0, montorer: 0 }); vis(); });
  qa<HTMLButtonElement>("[data-tillegg]").forEach((b) => b.addEventListener("click", () => { if (b.getAttribute("aria-disabled") === "true") return; const k = b.dataset.tillegg!; tillegg = tillegg.includes(k) ? tillegg.filter((x) => x !== k) : [...tillegg, k]; vis(); }));
  q<HTMLSelectElement>("#kontakt")?.addEventListener("change", (e) => { kontaktId = (e.target as HTMLSelectElement).value; });
  q<HTMLButtonElement>("#lag-tilbud")?.addEventListener("click", async (e) => {
    const b = e.currentTarget as HTMLButtonElement; b.disabled = true;
    try {
      const t = await api<{ nr: string; versjon: number; pdf: string }>("POST", "/api/tilbud", { eier_id: eierId, produktlinje: linje, butikker, tillegg, kontakt_id: kontaktId || undefined });
      toast(`Tilbud ${t.nr} v${t.versjon} er lagret på ${eier.navn}`, { href: t.pdf, tekst: "Åpne PDF" });
      window.open(t.pdf, "_blank", "noopener");
      setTimeout(() => { location.href = `/salg/eiere/${eierId}`; }, 2500);
    } catch (err: any) { toast(err.message); b.disabled = false; }
  });
  q("#prov-igjen")?.addEventListener("click", last);
}

async function last() {
  sett(rot, html`${raw(hode())}<div class="to-kolonner">${raw(skjelett(2))}</div>`);
  try {
    const g = await api<any>("GET", "/api/prisliste/gjeldende");
    pl = g.prisliste; linjenavn = g.linjenavn;
    if (eierId) {
      const d = await api<any>("GET", `/api/eiere/${eierId}`);
      eier = d.eier; kontakter = d.kontakter; linje = eier.produktlinje;
      const P = pl.pakker[linje];
      butikker = d.butikker.map((b: any) => { const pakke = b.pakke && P[b.pakke] ? b.pakke : "butikk"; return { navn: b.navn, pakke, brukere: b.brukere != null ? Math.max(0, b.brukere - P[pakke].inkl_brukere) : 0, montorer: b.montorer ?? 0 }; });
      if (!butikker.length) butikker = [{ navn: eier.navn, pakke: "butikk", brukere: 0, montorer: 0 }];
    } else if (!butikker.length) butikker = [{ navn: "Butikk 1", pakke: "butikk", brukere: 0, montorer: 0 }];
    vis();
  } catch (e) {
    sett(rot, html`${raw(hode())}${raw(feilbanner(e, "Prislisten kan ikke hentes. «Lag tilbud» er av til den er tilbake."))}<section class="kort"><button class="knapp primar" type="button" disabled>${raw(ikon("tilbud", 18))}Lag tilbud</button></section>`);
    q("#prov-igjen")?.addEventListener("click", last);
  }
}
last();
