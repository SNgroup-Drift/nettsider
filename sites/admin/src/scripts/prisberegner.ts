/**
 * 26-005 Pakke per butikk og prisberegner (N-4). Regner lokalt med beregn() fra src/lib/pris.js og gjeldende prisliste, som før.
 * Faner Per butikk · Hele eieren · Sum per måned · Etablering. Per butikk: Tabell «Pakke per butikk» (høyden følger antall butikker) med
 * «Produktlinje ▾» og «Legg til butikk» i tittelfeltet; pakke, ekstra brukere og montører endres i raden, «Fjern» per rad.
 * «Lag tilbud» i topplinja lagrer en ny versjon på muligheten (POST /api/tilbud) og åpner PDF-en (26-006).
 */
import { api, html, raw, kr, sett, q, qa, feilbanner, toast, esc, orgnr, ikon } from "../lib/dom";
import { beregn } from "../lib/pris.js";
import { rad, flis, tabell, tabellHoyde, velger, settFaner, settTittel, kobleKit, laster, liste, type ListeRad } from "../lib/kit";

const rot = q("#side")!;
const eierId = new URLSearchParams(location.search).get("eier");
let pl: any = null, linjenavn: Record<string, string> = {}, eier: any = null, kontakter: any[] = [];
let linje = "hengsel";
let butikker: { navn: string; pakke: string; brukere: number; montorer: number }[] = [];
let tillegg: string[] = [];
let kontaktId = "";
let fane = "butikk";
const PAKKER = ["start", "butikk", "komplett"];
const lagKnapp = q<HTMLButtonElement>("#lag-tilbud");

const faner = () => settFaner([{ id: "butikk", navn: "Per butikk" }, { id: "eier", navn: "Hele eieren" }, { id: "sum", navn: "Sum per måned" }, { id: "etablering", navn: "Etablering" }], fane, (f) => { fane = f; vis(); });

function perButikk(r: any) {
  const P = pl.pakker[linje];
  const rader = butikker.map((b, i) => { const p = P[b.pakke]; const x = r.rader[i]; return html`<tr>
    <th scope="row"><input class="k-navnfelt" type="text" value="${b.navn}" aria-label="Butikknavn" data-navn="${i}" /></th>
    <td><label class="k-velger"><span class="visuelt-skjult">Pakke</span><select data-pakke="${i}">${PAKKER.map((k) => html`<option value="${k}" ${raw(b.pakke === k ? "selected" : "")}>${P[k].navn}</option>`)}</select></label></td>
    <td class="h midt">${p.inkl_brukere + b.brukere}</td>
    <td class="h midt"><input class="tallfelt" type="number" min="0" max="999" value="${b.brukere}" data-felt="brukere" data-i="${i}" aria-label="Ekstra brukere" /></td>
    <td class="h midt"><input class="tallfelt" type="number" min="0" max="999" value="${b.montorer}" data-felt="montorer" data-i="${i}" aria-label="Montører" /></td>
    <td class="h midt">${p.support_timer} t</td>
    <td class="h">${kr(x.sum_ore)}</td>
    <td class="h smalest"><button class="knapp tekst ikon-knapp" type="button" data-fjern="${i}" aria-label="Fjern ${b.navn}" ${raw(butikker.length < 2 ? "disabled" : "")}>${raw(ikon("lukk", 16))}</button></td></tr>`; });
  const verktoy = html`${velger("produktlinje", "Produktlinje", Object.entries(linjenavn).map(([id, n]) => [id, `Produktlinje: ${n}`] as [string, string]), linje)}<button class="k-lenkeknapp" type="button" id="legg-til">Legg til butikk</button>`;
  return rad(tabellHoyde(rader.length), [flis({ id: "pakke-per-butikk", tittel: "Pakke per butikk", teller: butikker.length, verktoy,
    innhold: tabell({ kompakt: rader.length <= 9, kolonner: [{ navn: "Butikk" }, { navn: "Pakke", klasse: "pakkekol" }, { navn: "Brukere", h: true, midt: true }, { navn: "Ekstra brukere", h: true, midt: true }, { navn: "Montører", h: true, midt: true }, { navn: "Support", h: true, midt: true }, { navn: "Pakke + brukere", h: true }, { navn: "", klasse: "smalest" }], rader }) })]);
}

function heleEieren(r: any) {
  const n = butikker.length;
  const uteTekst = r.ute.modell === "firma" ? `${r.ute.antall} montører · firmapris for opptil ${r.ute.firma_maks}` : r.ute.modell === "montor" ? `${r.ute.antall} montører × ${kr(r.ute.montor_ore)}${r.ute.antall > r.ute.firma_maks ? ` · over ${r.ute.firma_maks}, firmapris gjelder ikke` : ` · billigere enn firmapris ${kr(r.ute.firma_ore)}`}` : "Ingen montører";
  const neste = r.neste_trinn ? `${r.neste_trinn.prosent} % fra ${r.neste_trinn.fra_butikker} butikker (${r.neste_trinn.fra_butikker - n} til)` : "";
  const gjelder: ListeRad[] = [
    { venstre: html`<b>Hengsel Ute</b> <span>${uteTekst}</span>`, hoyre: html`<b>${kr(r.ute.pris_ore)}</b>` },
    { venstre: html`<b>Kjederabatt${r.rabatt_prosent ? ` ${r.rabatt_prosent} %` : ""}</b> <span>${r.rabatt_prosent ? `av ${kr(r.grunnlag_ore)}` : `${n} ${n === 1 ? "butikk" : "butikker"}, ingen rabatt`}${neste ? ` · neste: ${neste}` : ""}</span>`, hoyre: html`<b>${r.rabatt_ore ? `−${kr(r.rabatt_ore)}` : "0 kr"}</b>` },
    { venstre: html`<b>Viderefakturert</b> <span>SMS, Penneo og AI etter bruk: kostpris + ${pl.viderefakturering_prosent} %, uten rabatt</span>` },
  ];
  const l = liste("gjelder", "Gjelder hele eieren", gjelder);
  const tilleggRader = r.tillegg.map((t: any) => html`<li><label class="k-celle k-avkryss"><input type="checkbox" data-tillegg="${t.kode}" ${raw(t.valgt ? "checked" : "")} ${raw(t.inkludert ? "disabled" : "")} /> <b>${t.navn}</b> <span>${t.grunn ?? ""}</span></label><span class="k-hoyre">${t.inkludert ? "Inkludert" : `${kr(t.pris_ore)}/mnd`}</span></li>`);
  const kontakt = eier ? html`<label class="felt k-att"><span>Att. (kontakt i tilbudet)</span><select id="kontakt"><option value="">Første kontakt med signaturrett</option>${kontakter.map((k) => html`<option value="${k.id}" ${raw(k.id === kontaktId ? "selected" : "")}>${k.navn}${k.rolle ? `, ${k.rolle}` : ""}</option>`)}</select></label>` : "";
  return rad(320, [
    flis({ id: "gjelder", bredde: "1/2", tittel: "Gjelder hele eieren", teller: gjelder.length, tellerHoyre: true, innhold: l.innhold }),
    flis({ id: "tillegg", bredde: "1/2", tittel: "Tillegg per eier, uten rabatt", teller: r.tillegg.length, tellerHoyre: true, innhold: html`<ul class="k-liste">${tilleggRader}</ul>${kontakt}` }),
  ]);
}

function sumPerManed(r: any) {
  const linjer: [string, string, string, string?][] = [
    ...r.rader.map((x: any) => [x.navn, `${x.pakkeNavn}${x.antall_brukere ? ` + ${x.antall_brukere} ekstra ${x.antall_brukere > 1 ? "brukere" : "bruker"}` : ""}`, kr(x.sum_ore)] as [string, string, string]),
    ...(r.ute.modell !== "ingen" ? [["Hengsel Ute", r.ute.modell === "firma" ? `Firmapris, ${r.ute.antall} montører` : `${r.ute.antall} × ${kr(r.ute.montor_ore)}`, kr(r.ute.pris_ore)] as [string, string, string]] : []),
    [r.rabatt_prosent ? `Kjederabatt ${r.rabatt_prosent} %` : "Kjederabatt", "Gjelder pakker, ekstra brukere og Ute", r.rabatt_ore ? `−${kr(r.rabatt_ore)}` : "0 kr"],
    ...r.tillegg.filter((t: any) => t.valgt).map((t: any) => [t.navn, t.grunn ?? "Tillegg, uten rabatt", kr(t.belop_ore)] as [string, string, string]),
    [`Mva ${pl.mva_prosent} %`, "", kr(r.mva_ore)],
    ["Per måned, med mva", "", kr(r.inkl_ore), "sum"],
    ["Per år, uten mva", "", kr(r.aar_ore)],
    ["Per år, med mva", "", kr(r.aar_inkl_ore)],
  ];
  const rader = linjer.map(([a, b, c, s]) => html`<tr ${raw(s ? 'class="k-sumrad"' : "")}><th scope="row">${a}</th><td class="midt dempet">${b}</td><td class="h">${c}</td></tr>`);
  return rad(tabellHoyde(rader.length + 1), [flis({ id: "sum", tittel: "Sum per måned", tittelverdi: html`uten mva <b>${kr(r.netto_ore)}</b>`,
    innhold: tabell({ kompakt: true, kolonner: [{ navn: "Linje" }, { navn: "Grunnlag", midt: true }, { navn: "Beløp", h: true }], rader, sumrad: html`<tr class="k-sumrad"><th scope="row">Per måned, uten mva</th><td class="midt dempet">snitt per butikk ${kr(r.per_butikk_ore)}</td><td class="h">${kr(r.netto_ore)}</td></tr>` }) })]);
}

function etablering(r: any) {
  const P = pl.pakker[linje];
  const etab: Record<string, number> = {};
  for (const x of r.rader) etab[x.pakke] = (etab[x.pakke] ?? 0) + 1;
  const rader = [...Object.entries(etab).map(([k, antall]) => html`<tr><th scope="row">${antall} × ${P[k].navn}</th><td class="midt dempet">à ${kr(P[k].etablering_ore)}</td><td class="h">${kr(antall * P[k].etablering_ore)}</td></tr>`),
    html`<tr><th scope="row">Mva ${pl.mva_prosent} %</th><td class="midt"></td><td class="h">${kr(r.etablering_mva_ore)}</td></tr>`];
  return rad(320, [
    flis({ id: "etablering", bredde: "1/2", tittel: "Etablering, engangs, uten rabatt", innhold: tabell({ kompakt: true, kolonner: [{ navn: "Pakke" }, { navn: "Pris", midt: true }, { navn: "Beløp", h: true }], rader, sumrad: html`<tr class="k-sumrad"><th scope="row">Etablering med mva</th><td class="midt"></td><td class="h">${kr(r.etablering_inkl_ore)}</td></tr>` }) }),
    flis({ id: "vilkar", bredde: "1/2", tittel: "Support og vilkår", innhold: html`<div class="k-brod"><p>Support inkludert første år: ${r.support_timer} t per måned til sammen.</p><p>Binding ${pl.binding_mnd} måneder. Prisene justeres årlig etter KPI.</p>${eier ? html`<p>Tilbudet lagres på muligheten som ny versjon, med prisliste ${pl.versjon}.${eier.orgnr ? ` Til ${eier.navn}, org.nr. ${orgnr(eier.orgnr)}.` : ""}</p>` : raw(`<p>Åpne prisberegneren fra et eierkort for å lage et tilbud. Her kan du regne fritt.</p>`)}</div>` }),
  ]);
}

function vis() {
  if (!pl) return;
  faner();
  const r = beregn(pl, linje, butikker, { tillegg });
  if (lagKnapp) lagKnapp.disabled = !eier || !butikker.length;
  sett(rot, fane === "eier" ? heleEieren(r) : fane === "sum" ? sumPerManed(r) : fane === "etablering" ? etablering(r) : perButikk(r));
  koble();
}

function koble() {
  kobleKit(rot);
  q<HTMLSelectElement>("#produktlinje")?.addEventListener("change", (e) => { linje = (e.target as HTMLSelectElement).value; vis(); });
  qa<HTMLSelectElement>("[data-pakke]").forEach((s) => s.addEventListener("change", () => { butikker[+s.dataset.pakke!].pakke = s.value; vis(); }));
  qa<HTMLInputElement>("[data-felt]").forEach((i) => i.addEventListener("change", () => { const f = i.dataset.felt as "brukere" | "montorer"; butikker[+i.dataset.i!][f] = Math.max(0, Math.min(999, Math.round(Number(i.value) || 0))); vis(); }));
  qa<HTMLInputElement>("[data-navn]").forEach((i) => i.addEventListener("change", () => { butikker[+i.dataset.navn!].navn = i.value.trim() || `Butikk ${+i.dataset.navn! + 1}`; vis(); }));
  qa<HTMLButtonElement>("[data-fjern]").forEach((b) => b.addEventListener("click", () => { butikker.splice(+b.dataset.fjern!, 1); vis(); }));
  q("#legg-til")?.addEventListener("click", () => { butikker.push({ navn: `Ny butikk ${butikker.length + 1}`, pakke: "start", brukere: 0, montorer: 0 }); vis(); });
  qa<HTMLInputElement>("[data-tillegg]").forEach((b) => b.addEventListener("change", () => { const k = b.dataset.tillegg!; tillegg = b.checked ? [...new Set([...tillegg, k])] : tillegg.filter((x) => x !== k); vis(); }));
  q<HTMLSelectElement>("#kontakt")?.addEventListener("change", (e) => { kontaktId = (e.target as HTMLSelectElement).value; });
  q("#prov-igjen")?.addEventListener("click", last);
}

lagKnapp?.addEventListener("click", async () => {
  if (!eier) return;
  lagKnapp.disabled = true;
  try {
    const t = await api<{ nr: string; versjon: number; pdf: string }>("POST", "/api/tilbud", { eier_id: eierId, produktlinje: linje, butikker, tillegg, kontakt_id: kontaktId || undefined });
    toast(`Tilbud ${t.nr} v${t.versjon} er lagret på ${eier.navn}`, { href: t.pdf, tekst: "Åpne PDF" });
    window.open(t.pdf, "_blank", "noopener");
    setTimeout(() => { location.href = `/salg/eiere/${eierId}`; }, 2500);
  } catch (err: any) { toast(err.message); lagKnapp.disabled = false; }
});

async function last() {
  faner();
  sett(rot, rad(320, [flis({ tittel: "Pakke per butikk", innhold: laster() })]));
  if (lagKnapp) lagKnapp.disabled = true;
  try {
    const g = await api<any>("GET", "/api/prisliste/gjeldende");
    pl = g.prisliste; linjenavn = g.linjenavn;
    if (eierId) {
      const d = await api<any>("GET", `/api/eiere/${eierId}`);
      eier = d.eier; kontakter = d.kontakter; linje = eier.produktlinje;
      settTittel("Prisberegner", `Eiere og butikker › ${eier.navn}`);
      const P = pl.pakker[linje];
      butikker = d.butikker.map((b: any) => { const pakke = b.pakke && P[b.pakke] ? b.pakke : "butikk"; return { navn: b.navn, pakke, brukere: b.brukere != null ? Math.max(0, b.brukere - P[pakke].inkl_brukere) : 0, montorer: b.montorer ?? 0 }; });
      if (!butikker.length) butikker = [{ navn: eier.navn, pakke: "butikk", brukere: 0, montorer: 0 }];
    } else if (!butikker.length) butikker = [{ navn: "Butikk 1", pakke: "butikk", brukere: 0, montorer: 0 }];
    vis();
  } catch (e) {
    sett(rot, rad(320, [flis({ tittel: "Pakke per butikk", innhold: raw(feilbanner(e, "Prislisten kan ikke hentes. «Lag tilbud» er av til den er tilbake.")) })]));
    q("#prov-igjen")?.addEventListener("click", last);
  }
}
last();
void esc;
