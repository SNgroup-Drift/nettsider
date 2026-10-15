/** SA9 Prisliste: versjonskort, tabeller per produktlinje og pakke, Ute, tillegg, rabattrinn og vilkår. Utkast kan endres og publiseres; aktiv og arkivert er låst. Innstillingene fornyes_snart_dager og tilbud_gyldig_dager ligger nederst. */
import { api, html, raw, kr, dato, ikon, pille, sett, q, qa, feilbanner, skjelett, toast, skjemaDialog, PRISLISTESTATUS } from "../lib/dom";

const rot = q("#side")!;
let liste: any = null, valgtId = "", valgt: any = null, innst: any = null;
const krInput = (ore: number) => (ore / 100).toString();

function vis() {
  const pl = valgt.prisliste, rader = valgt.rader, laast = pl.status !== "utkast";
  const radId = (type: string, linje: string | null, kode: string) => rader.find((r: any) => r.type === type && (linje === null || r.produktlinje === linje) && r.kode === kode)?.id ?? "";
  const felt = (id: string, navn: string, verdi: number | string, { kr: erKr = true, klasse = "prisfelt" } = {}) => html`<input class="${klasse}" type="number" ${erKr ? 'step="1" min="0"' : 'min="0" step="0.5"'} name="${id}:${navn}" value="${verdi}" ${laast ? "disabled" : ""} aria-label="${navn}" />`;
  sett(rot, html`
    <header class="sidehode"><div><h1>Prisliste ${pl.eksempel ? raw(`<span class="eksempel-merke">Eksempel – prislisten er ikke låst</span>`) : ""}</h1><p class="under">Alle priser i tilbud og prisberegner kommer herfra. Bare utkast kan endres; «Publiser» tar utkastet i bruk og arkiverer den gamle.</p></div>
      <div class="handlinger"><button class="knapp" type="button" id="ny-versjon">${raw(ikon("pluss", 18))}Ny versjon</button>${!laast ? html`<button class="knapp" type="button" id="lagre">Lagre utkast</button><button class="knapp primar" type="button" id="publiser">Publiser ${pl.versjon}</button>` : ""}</div></header>
    <div class="versjoner">${liste.versjoner.map((v: any) => html`<button class="kort" type="button" data-versjon="${v.id}" aria-pressed="${v.id === valgtId}"><b>Versjon ${v.versjon} ${pille(v.status, PRISLISTESTATUS[v.status])}</b><span class="meta">Gjelder fra ${dato(v.gjelder_fra)}${v.publisert ? ` · publisert ${dato(v.publisert)}` : ""} · ${v.antall_tilbud} tilbud bruker den</span></button>`)}</div>
    <form id="skjema" novalidate>
    <div class="rutenett">
      <section class="hel-rad kort tabellramme" ><h2>Produktlinjer og pakker per butikk</h2>
        <table class="tabell"><thead><tr><th>Pakke</th><th class="hoyre">Pris per mnd</th><th class="hoyre">Brukere inkl.</th><th class="hoyre">Ekstra bruker</th><th class="hoyre">Support år 1</th><th class="hoyre">Etablering</th></tr></thead>
          <tbody>${Object.entries(pl.pakker).map(([linje, pakker]: [string, any]) => html`<tr><td colspan="6"><b>${valgt.linjenavn[linje]}</b> <span class="meta">${Object.values(pakker)[0]?.merknad ?? ""}</span></td></tr>${Object.values(pakker).map((p: any) => { const id = radId("pakke", linje, p.kode); return html`<tr><td>${p.navn}</td><td class="hoyre">${felt(id, "pris_ore", krInput(p.pris_ore))} kr</td><td class="hoyre">${felt(id, "inkl_brukere", p.inkl_brukere, { kr: false, klasse: "tallfelt" })}</td><td class="hoyre">${felt(id, "ekstra_bruker_ore", krInput(p.ekstra_bruker_ore))} kr</td><td class="hoyre">${felt(id, "support_timer", p.support_timer, { kr: false, klasse: "tallfelt" })} t/mnd</td><td class="hoyre">${felt(id, "etablering_ore", krInput(p.etablering_ore))} kr</td></tr>`; })}`)}</tbody></table>
        <p class="mt-8 meta" >Ekstra bruker per bruker per måned. Support er timer per måned, inkludert første år. Etablering er engangs per butikk, uten rabatt.</p></section>
      <section class="kort tabellramme"><h2>Moduler per pakke</h2>
        <table class="tabell"><thead><tr><th>Modul</th>${Object.values(pl.pakker.hengsel ?? {}).map((p: any) => html`<th>${p.navn}</th>`)}</tr></thead>
          <tbody>${[...new Set(Object.values(pl.pakker.hengsel ?? {}).flatMap((p: any) => p.moduler))].map((m) => html`<tr><td>${m}</td>${Object.values(pl.pakker.hengsel ?? {}).map((p: any) => html`<td>${p.moduler.includes(m) ? raw(ikon("hake", 16)) : raw(`<span class="dempet">–</span>`)}</td>`)}</tr>`)}</tbody></table></section>
      <section class="kort"><h2>Hengsel Ute <span class="mer">per eier</span></h2>
        <div class="sumlinjer"><div><span>Per montør per måned</span><span class="belop">${felt(radId("ute", null, "montor"), "pris_ore", krInput(pl.ute.montor_ore))} kr</span></div><div><span>Firmapris per måned<span class="under">for opptil ${felt(radId("ute", null, "firma"), "maks_antall", pl.ute.firma_maks, { kr: false, klasse: "tallfelt" })} montører</span></span><span class="belop">${felt(radId("ute", null, "firma"), "pris_ore", krInput(pl.ute.firma_ore))} kr</span></div></div>
        <p class="meta">Prisberegneren velger det billigste av montørpris × antall og firmapris. Rabatten gjelder.</p></section>
      <section class="kort"><h2>Tillegg <span class="mer">per eier, uten rabatt</span></h2>
        <div class="sumlinjer">${pl.tillegg.map((t: any) => html`<div><span>${t.navn}<span class="under">${t.merknad}</span></span><span class="belop">${felt(radId("tillegg", null, t.kode), "pris_ore", krInput(t.pris_ore))} kr</span></div>`)}</div></section>
      <section class="kort"><h2>Kjederabatt</h2>
        <div class="sumlinjer">${pl.rabattrinn.map((t: any) => html`<div><span>Fra ${felt(radId("rabattrinn", null, `trinn-${t.fra_butikker}`), "fra_butikker", t.fra_butikker, { kr: false, klasse: "tallfelt" })} butikker hos samme eier</span><span class="belop">${felt(radId("rabattrinn", null, `trinn-${t.fra_butikker}`), "prosent", t.prosent, { kr: false, klasse: "tallfelt" })} %</span></div>`)}</div>
        <p class="meta">Gjelder pakker, ekstra brukere og Hengsel Ute. Gjelder ikke tillegg, etablering og viderefakturering. Rabatten avrundes til hele kroner.</p></section>
      <section class="kort"><h2>Viderefakturering og vilkår</h2>
        <div class="sumlinjer"><div><span>Påslag på SMS, Penneo og AI</span><span class="belop"><input class="tallfelt" type="number" min="0" max="100" step="0.5" name="pl:viderefakturering_prosent" value="${pl.viderefakturering_prosent}" ${laast ? "disabled" : ""} /> %</span></div>
          <div><span>Binding</span><span class="belop"><input class="tallfelt" type="number" min="1" name="pl:binding_mnd" value="${pl.binding_mnd}" ${laast ? "disabled" : ""} /> måneder</span></div>
          <div><span>Oppsigelsesfrist</span><span class="belop"><input class="tallfelt" type="number" min="0" name="pl:oppsigelse_mnd" value="${pl.oppsigelse_mnd}" ${laast ? "disabled" : ""} /> måneder</span></div>
          <div><span>Mva</span><span class="belop"><input class="tallfelt" type="number" min="0" max="100" name="pl:mva_prosent" value="${pl.mva_prosent}" ${laast ? "disabled" : ""} /> %</span></div>
          <div><span>Gjelder fra</span><span class="belop"><input type="date" name="pl:gjelder_fra" value="${pl.gjelder_fra}" ${laast ? "disabled" : ""} class="datofelt inntast" /></span></div>
          <div><span>Prisjustering</span><span class="belop">Årlig etter KPI</span></div>
          <div><span>Merket «Eksempel»</span><span class="belop"><label class="avkryss"><input type="checkbox" name="pl:eksempel" value="1" ${pl.eksempel ? "checked" : ""} ${laast ? "disabled" : ""} /> vises på tilbud</label></span></div></div></section>
      <section class="kort"><h2>Leverandør på tilbud og avtaler <a class="mer" href="/innstillinger/leverandor">Innstillinger › Leverandør</a></h2><p class="meta">Navn, org.nr., adresse, e-post og signatar kopieres inn i tilbud og avtaler når de lages. Det er ikke besluttet hvilket selskap som selger Hengsel.</p></section>
      <section class="kort"><h2>Innstillinger</h2>
        <div class="sumlinjer"><div><span>«Fornyes snart» vises når fornyelsesdatoen er innen</span><span class="belop"><input class="tallfelt" type="number" min="0" max="365" name="innst:fornyes_snart_dager" value="${innst.fornyes_snart_dager}" /> dager</span></div><div><span>Tilbud er gyldig i</span><span class="belop"><input class="tallfelt" type="number" min="1" max="365" name="innst:tilbud_gyldig_dager" value="${innst.tilbud_gyldig_dager}" /> dager</span></div></div>
        <button class="mt-10 knapp liten" type="button" id="lagre-innst" >Lagre innstillingene</button></section>
    </div></form>`);
  qa<HTMLButtonElement>("[data-versjon]").forEach((b) => b.addEventListener("click", () => { valgtId = b.dataset.versjon!; last(); }));
  q("#ny-versjon")?.addEventListener("click", async () => {
    const r = await skjemaDialog({ tittel: "Ny versjon", knapp: "Lag utkast", innhold: `<div class="felt-rad"><label class="felt"><span>Versjon (f.eks. 2027.1)</span><input name="versjon" type="text" required /></label><label class="felt"><span>Gjelder fra</span><input name="gjelder_fra" type="date" required /></label></div><p class="meta">Utkastet kopierer prisene fra versjon ${pl.versjon}. Endre dem, og publiser når de er bekreftet.</p>`,
      send: async (d) => { valgtId = (await api<{ id: string }>("POST", "/api/prisliste", { versjon: d.versjon, gjelder_fra: d.gjelder_fra, kopier_fra: pl.id })).id; } });
    if (r) { toast("Utkastet er laget"); last(); }
  });
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
  q("#publiser")?.addEventListener("click", async () => { if (!confirm(`Publisere ${pl.versjon}? Den aktive versjonen arkiveres, og eksempel-merket fjernes.`)) return; try { await api("POST", `/api/prisliste/${pl.id}/publiser`); toast(`Prisliste ${pl.versjon} er aktiv`); last(); } catch (e: any) { toast(e.message); } });
  q("#lagre-innst")?.addEventListener("click", async () => { const f = q<HTMLFormElement>("#skjema")!; try { await api("PATCH", "/api/innstillinger", { fornyes_snart_dager: (f.elements.namedItem("innst:fornyes_snart_dager") as HTMLInputElement).value, tilbud_gyldig_dager: (f.elements.namedItem("innst:tilbud_gyldig_dager") as HTMLInputElement).value }); toast("Innstillingene er lagret"); last(); } catch (e: any) { toast(e.message); } });
  q("#prov-igjen")?.addEventListener("click", last);
}

async function last() {
  if (!liste) sett(rot, html`<header class="sidehode"><h1>Prisliste</h1></header>${raw(skjelett(3))}`);
  try {
    liste = await api("GET", "/api/prisliste");
    innst = await api("GET", "/api/innstillinger");
    if (!valgtId) valgtId = liste.gjeldende ? liste.versjoner.find((v: any) => v.versjon === liste.gjeldende.versjon)?.id ?? liste.versjoner[0]?.id : liste.versjoner[0]?.id;
    if (!valgtId) { sett(rot, html`<header class="sidehode"><h1>Prisliste</h1></header><div class="kort tom"><b>Ingen prisliste</b><span>Lag den første versjonen.</span><div class="handlinger"><button class="knapp primar" type="button" id="ny-versjon">Ny versjon</button></div></div>`); q("#ny-versjon")?.addEventListener("click", async () => { await skjemaDialog({ tittel: "Ny versjon", knapp: "Lag utkast", innhold: `<div class="felt-rad"><label class="felt"><span>Versjon</span><input name="versjon" type="text" required /></label><label class="felt"><span>Gjelder fra</span><input name="gjelder_fra" type="date" required /></label></div>`, send: (d) => api("POST", "/api/prisliste", d) }); last(); }); return; }
    valgt = await api("GET", `/api/prisliste/${valgtId}`);
    vis();
  } catch (e) { sett(rot, html`<header class="sidehode"><h1>Prisliste</h1></header>${raw(feilbanner(e, "Kunne ikke hente prislisten."))}`); q("#prov-igjen")?.addEventListener("click", last); }
}
last();
