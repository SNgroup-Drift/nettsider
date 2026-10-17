/**
 * 26-003 Prisliste (versjonert), N-4: versjonene som faner («Versjon 2026.2 (utkast)»), statusen som pille i topplinja, «Publiser utkastet» og
 * «Ny versjon» i topplinja. Rad 1: Tabell «Produktlinjer og pakker (per butikk per måned)», rad 2: Tabell «Hengsel Ute og tillegg», rad 3: Tekst
 * «Kjederabatt og vilkår», rad 4: Moduler per pakke og Innstillingene (fornyes snart, tilbud gyldig). Fasitens «Support etter første år (forslag)» er tatt ut
 * (N-4b, Eirik 17.10): vilkårene i tilbud-PDF-en gjelder.
 * Bare utkast kan endres («Lagre utkast»); aktiv og arkivert er låst. Samme API som før (GET/POST/PATCH /api/prisliste, /api/innstillinger).
 */
import { api, html, raw, kr, dato, sett, q, qa, feilbanner, toast, skjemaDialog, PRISLISTESTATUS, ikon } from "../lib/dom";
import { rad, flis, tabell, tabellHoyde, settFaner, settSidepille, kobleKit, laster, tom, liste } from "../lib/kit";

const rot = q("#side")!;
let lst: any = null, valgtId = "", valgt: any = null, innst: any = null;
const krInput = (ore: number) => (ore / 100).toString();
const publiserKnapp = q<HTMLButtonElement>("#publiser");

function vis() {
  const pl = valgt.prisliste, rader = valgt.rader, laast = pl.status !== "utkast";
  settFaner(lst.versjoner.map((v: any) => ({ id: v.id, navn: `Versjon ${v.versjon} (${PRISLISTESTATUS[v.status].toLowerCase()})` })), valgtId, (id) => { valgtId = id; last(); });
  settSidepille(PRISLISTESTATUS[pl.status], pl.status);
  if (publiserKnapp) { publiserKnapp.hidden = laast; publiserKnapp.textContent = "Publiser utkastet"; }
  const radId = (type: string, linje: string | null, kode: string) => rader.find((r: any) => r.type === type && (linje === null || r.produktlinje === linje) && r.kode === kode)?.id ?? "";
  const felt = (id: string, navn: string, verdi: number | string, { erKr = true, klasse = "prisfelt" } = {}) => laast
    ? (erKr ? kr(Number(verdi) * 100) : String(verdi))
    : html`<input class="${klasse}" type="number" ${raw(erKr ? 'step="1" min="0"' : 'min="0" step="0.5"')} name="${id}:${navn}" value="${verdi}" aria-label="${navn}" />${erKr ? " kr" : ""}`;
  const plFelt = (navn: string, verdi: number | string, ekstra = "") => laast ? String(verdi) : html`<input class="tallfelt" type="number" min="0" ${raw(ekstra)} name="pl:${navn}" value="${verdi}" aria-label="${navn}" />`;

  const pakkerader = Object.entries(pl.pakker).flatMap(([linje, pakker]: [string, any]) => (Object.values(pakker) as any[]).sort((a, b) => a.pris_ore - b.pris_ore).map((p: any) => { const id = radId("pakke", linje, p.kode); return html`<tr><th scope="row">${valgt.linjenavn[linje]}</th><td class="midt">${p.navn}</td><td class="h">${felt(id, "pris_ore", krInput(p.pris_ore))}</td><td class="h midt">${felt(id, "inkl_brukere", p.inkl_brukere, { erKr: false, klasse: "tallfelt" })}</td><td class="h midt">${felt(id, "ekstra_bruker_ore", krInput(p.ekstra_bruker_ore))}</td><td class="h midt">${felt(id, "support_timer", p.support_timer, { erKr: false, klasse: "tallfelt" })} t</td><td class="h">${felt(id, "etablering_ore", krInput(p.etablering_ore))}</td></tr>`; }));
  const uterader = [
    html`<tr><th scope="row">Hengsel Ute, montørpris</th><td class="h">${felt(radId("ute", null, "montor"), "pris_ore", krInput(pl.ute.montor_ore))}</td><td>per montør per måned</td></tr>`,
    html`<tr><th scope="row">Hengsel Ute, firmapris</th><td class="h">${felt(radId("ute", null, "firma"), "pris_ore", krInput(pl.ute.firma_ore))}</td><td>opptil ${felt(radId("ute", null, "firma"), "maks_antall", pl.ute.firma_maks, { erKr: false, klasse: "tallfelt" })} montører, per eier</td></tr>`,
    ...pl.tillegg.map((t: any) => html`<tr><th scope="row">${t.navn}</th><td class="h">${felt(radId("tillegg", null, t.kode), "pris_ore", krInput(t.pris_ore))}</td><td>${t.merknad}</td></tr>`),
  ];
  const trinn = pl.rabattrinn.map((t: any) => html`${felt(radId("rabattrinn", null, `trinn-${t.fra_butikker}`), "prosent", t.prosent, { erKr: false, klasse: "tallfelt" })} % fra ${felt(radId("rabattrinn", null, `trinn-${t.fra_butikker}`), "fra_butikker", t.fra_butikker, { erKr: false, klasse: "tallfelt" })} butikker`);
  const vilkar = html`<div class="k-brod k-vilkar">
    <p>${trinn.map((t: any, i: number) => html`${i ? ", " : ""}${t}`)}. Gjelder pakker, ekstra brukere og montører; ikke etablering, tillegg eller viderefakturert SMS, Penneo og AI (kostpris + ${plFelt("viderefakturering_prosent", pl.viderefakturering_prosent, 'max="100" step="0.5"')} %).</p>
    <p>Binding ${plFelt("binding_mnd", pl.binding_mnd, 'min="1"')} måneder, oppsigelse ${plFelt("oppsigelse_mnd", pl.oppsigelse_mnd)} måneder, KPI-justering årlig, mva ${plFelt("mva_prosent", pl.mva_prosent, 'max="100"')} %.</p>
    <p>Gjelder fra ${laast ? dato(pl.gjelder_fra) : html`<input type="date" name="pl:gjelder_fra" value="${pl.gjelder_fra}" class="datofelt inntast" aria-label="Gjelder fra" />`}${pl.publisert ? ` · publisert ${dato(pl.publisert)}` : ""}. ${laast ? (pl.eksempel ? "Merket «Eksempel» på tilbud." : "") : html`<label class="k-avkryss k-inline"><input type="checkbox" name="pl:eksempel" value="1" ${raw(pl.eksempel ? "checked" : "")} /> Merket «Eksempel» på tilbud</label>`}</p></div>`;
  const pakkeH = Object.values(pl.pakker.hengsel ?? {}) as any[];
  const moduler = [...new Set(pakkeH.flatMap((p: any) => p.moduler))].map((m) => ({ venstre: html`<b>${m}</b> <span>${pakkeH.filter((p: any) => p.moduler.includes(m)).map((p: any) => p.navn).join(", ")}</span>` }));
  const ml = liste("moduler", "Moduler per pakke (Hengsel)", moduler);
  sett(rot, html`<form id="skjema" class="k-rader" novalidate>
    ${rad(tabellHoyde(pakkerader.length), [flis({ id: "pakker", tittel: "Produktlinjer og pakker (per butikk per måned)", teller: pakkerader.length, verktoy: raw(`<span class="k-hjelp" title="Support er timer per måned, første år. Etablering er engangs per butikk. Hengsel-linjen har samme brukere, support og etablering.">Support er timer per måned, første år. Etablering er engangs per butikk.</span>`),
      innhold: tabell({ kompakt: true, kolonner: [{ navn: "Linje" }, { navn: "Pakke", midt: true }, { navn: "Pris", h: true }, { navn: "Brukere inkl.", h: true, midt: true }, { navn: "Ekstra bruker", h: true, midt: true }, { navn: "Support", h: true, midt: true }, { navn: "Etablering", h: true }], rader: pakkerader }),
      handling: laast ? "" : raw(`<button class="knapp" type="button" id="lagre">${ikon("hake", 18)}Lagre utkast</button>`) })])}
    ${rad(tabellHoyde(uterader.length), [flis({ id: "ute", tittel: "Hengsel Ute og tillegg", teller: uterader.length, innhold: tabell({ kompakt: true, kolonner: [{ navn: "Hva" }, { navn: "Pris", h: true, klasse: "prisk" }, { navn: "Gjelder" }], rader: uterader }) })])}
    ${rad(320, [flis({ id: "vilkar", tittel: "Kjederabatt og vilkår", innhold: vilkar })])}
    ${rad(320, [flis({ id: "moduler", bredde: "1/2", tittel: "Moduler per pakke (Hengsel)", teller: moduler.length, tellerHoyre: true, innhold: ml.innhold, handling: ml.handling }),
      flis({ id: "innstillinger", bredde: "1/2", tittel: "Innstillinger", innhold: html`<div class="k-skjema"><label class="felt"><span>«Fornyes snart» vises når fornyelsesdatoen er innen (dager)</span><input type="number" min="0" max="365" name="innst:fornyes_snart_dager" value="${innst.fornyes_snart_dager}" /></label><label class="felt"><span>Tilbud er gyldig i (dager)</span><input type="number" min="1" max="365" name="innst:tilbud_gyldig_dager" value="${innst.tilbud_gyldig_dager}" /></label></div>`,
        handling: raw(`<button class="knapp primar" type="button" id="lagre-innst">Lagre innstillingene</button>`) })])}
  </form>`);
  koble(pl);
}

function koble(pl: any) {
  kobleKit(rot);
  q("#lagre")?.addEventListener("click", async () => {
    const f = q<HTMLFormElement>("#skjema")!;
    const perRad: Record<string, Record<string, unknown>> = {};
    const plFelt: Record<string, unknown> = {};
    for (const el of qa<HTMLInputElement>("input[name]", f)) {
      const [id, navn] = el.name.split(":");
      if (id === "innst") continue;
      const v: unknown = el.type === "checkbox" ? (el.checked ? 1 : 0) : navn.endsWith("_ore") ? Math.round(Number(el.value) * 100) : el.type === "number" ? Number(el.value) : el.value;
      if (id === "pl") plFelt[navn] = v; else (perRad[id] ??= {})[navn] = v;
    }
    try { await api("PATCH", `/api/prisliste/${pl.id}`, { ...plFelt, rader: Object.entries(perRad).map(([id, felt]) => ({ id, ...felt })) }); toast("Utkastet er lagret"); last(); }
    catch (e: any) { toast(`Lagring av utkast feilet: ${e.message}`); }
  });
  q("#lagre-innst")?.addEventListener("click", async () => { const f = q<HTMLFormElement>("#skjema")!; try { await api("PATCH", "/api/innstillinger", { fornyes_snart_dager: (f.elements.namedItem("innst:fornyes_snart_dager") as HTMLInputElement).value, tilbud_gyldig_dager: (f.elements.namedItem("innst:tilbud_gyldig_dager") as HTMLInputElement).value }); toast("Innstillingene er lagret"); last(); } catch (e: any) { toast(e.message); } });
  q("#prov-igjen")?.addEventListener("click", last);
}

async function nyVersjon() {
  const fra = valgt?.prisliste;
  const r = await skjemaDialog({ tittel: "Ny versjon", knapp: "Lag utkast", innhold: `<div class="felt-rad"><label class="felt"><span>Versjon (f.eks. 2027.1)</span><input name="versjon" type="text" required /></label><label class="felt"><span>Gjelder fra</span><input name="gjelder_fra" type="date" required /></label></div>${fra ? `<p class="meta">Utkastet kopierer prisene fra versjon ${fra.versjon}. Endre dem, og publiser når de er bekreftet.</p>` : ""}`,
    send: async (d) => { valgtId = (await api<{ id: string }>("POST", "/api/prisliste", { versjon: d.versjon, gjelder_fra: d.gjelder_fra, kopier_fra: fra?.id })).id; } });
  if (r) { toast("Utkastet er laget"); last(); }
}
q("#ny-versjon")?.addEventListener("click", nyVersjon);
publiserKnapp?.addEventListener("click", async () => {
  const pl = valgt?.prisliste; if (!pl || pl.status !== "utkast") return;
  if (!confirm(`Publisere ${pl.versjon}? Den aktive versjonen arkiveres, og eksempel-merket fjernes.`)) return;
  try { await api("POST", `/api/prisliste/${pl.id}/publiser`); toast(`Prisliste ${pl.versjon} er aktiv`); last(); } catch (e: any) { toast(e.message); }
});

async function last() {
  if (!lst) sett(rot, rad(480, [flis({ tittel: "Produktlinjer og pakker (per butikk per måned)", innhold: laster() })]));
  try {
    lst = await api("GET", "/api/prisliste");
    innst = await api("GET", "/api/innstillinger");
    if (!valgtId) valgtId = lst.versjoner.find((v: any) => v.status === "utkast")?.id ?? (lst.gjeldende ? lst.versjoner.find((v: any) => v.versjon === lst.gjeldende.versjon)?.id : undefined) ?? lst.versjoner[0]?.id;
    if (!valgtId) { settFaner([], ""); sett(rot, rad(320, [flis({ tittel: "Prisliste", innhold: tom("Ingen prisliste", "Lag den første versjonen med «Ny versjon».") })])); return; }
    valgt = await api("GET", `/api/prisliste/${valgtId}`);
    vis();
  } catch (e) { sett(rot, rad(320, [flis({ tittel: "Prisliste", innhold: raw(feilbanner(e, "Kunne ikke hente prislisten.")) })])); q("#prov-igjen")?.addEventListener("click", last); }
}
last();
