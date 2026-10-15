/** SC1 Abonnement (K-260): velg kunde, fakta, linjer per butikk med kjederabatt (regnet ut av pris.js i Workeren), tillegg, sum og endringer. */
import { api, html, raw, sett, q, kr, dato, ikon, pille, toast, skjemaDialog, feilbanner, esc } from "../lib/dom";
import { rot, sidehode, lagLaster, tom, eksempel } from "../lib/fase-c";

const params = new URLSearchParams(location.search);
let valgt = params.get("id") ?? "";
const hode = () => sidehode("Abonnement", "Lages fra signert avtale. Endringer gjelder fra en dato og kommer med i fakturakjøringen.");

interface Data { liste: any; abo: any | null }

const laster = lagLaster<Data>({
  omraade: "Fakturering", feiltekst: "Kunne ikke hente abonnementene.", hode,
  tomData: () => ({ liste: { abonnementer: [], kan_lages: [] }, abo: null }),
  hent: async () => {
    const liste = await api("GET", "/api/abonnement");
    if (!valgt && liste.abonnementer.length) valgt = liste.abonnementer[0].id;
    const abo = valgt ? await api("GET", `/api/abonnement/${valgt}`) : null;
    return { liste, abo };
  },
  vis,
});

function velger(l: any) {
  return html`<label class="felt min-160"><span>Kunde</span><select id="velg">${l.abonnementer.map((a: any) => html`<option value="${a.id}" ${raw(a.id === valgt ? "selected" : "")}>${a.eier_navn}</option>`)}</select></label>`;
}

function vis({ liste, abo }: Data, { feil }: { feil?: unknown } = {}) {
  const lagKnapp = liste.kan_lages.length ? `<button class="knapp" type="button" id="lag">${ikon("pluss", 18)}Lag fra signert avtale</button>` : "";
  if (!liste.abonnementer.length || !abo) {
    sett(rot(), html`${hode()}<div class="kort">${tom("ordre", "Ingen abonnementer ennå", "Et abonnement lages fra en signert avtale. Linjene (butikker, pakker, brukere, montører og tillegg) hentes fra tilbudet avtalen ble laget fra.", lagKnapp)}</div>`);
    q("#lag")?.addEventListener("click", () => lag(liste));
    return;
  }
  const a = abo.abonnement, p = abo.pris;
  const fakta = [["Gjelder fra", dato(a.gjelder_fra)], ["Binding til", dato(a.binding_til)], ["Neste KPI-dato", dato(a.neste_kpi_dato)], ["Neste faktura", a.neste_faktura ? dato(a.neste_faktura) : "Ingen"], ["Avtale", a.avtale_nr], ["Prisliste", abo.prisliste?.versjon ?? "–"]];
  const mangler = p && !p.rabatt_prosent && p.neste_trinn ? `${p.neste_trinn.fra_butikker - p.antall_butikker} ${p.neste_trinn.fra_butikker - p.antall_butikker === 1 ? "butikk" : "butikker"} til ${p.neste_trinn.prosent} % kjederabatt` : "";
  sett(rot(), html`${hode()}
    ${feil ? raw(feilbanner(feil, "Prislisten kunne ikke hentes. Beløpene under er de sist hentede.")) : ""}
    <div class="rad-flex">${velger(liste)}<span class="fyll"></span>${raw(lagKnapp)}<button class="knapp primar" type="button" id="ny-endring">${raw(ikon("pluss", 18))}Ny endring</button></div>
    <section class="kort flat" aria-label="Fakta">
      <div class="korthode"><h2>${a.eier_navn}</h2>${a.status !== "aktiv" ? pille("sagt_opp", a.opphorer ? `Opphører ${dato(a.opphorer)}` : "Sagt opp") : pille("signert", "Aktiv")}${abo.prisliste?.eksempel ? eksempel("Eksempel – prislisten er ikke låst") : ""}<a class="knapp liten" href="/avtaler/${a.avtale_nr}">Åpne avtalen</a></div>
      <dl class="fakta">${fakta.map(([n, v]) => html`<div><dt>${n}</dt><dd>${v}</dd></div>`)}</dl>
    </section>
    <div class="bred-smal">
      <section class="kort flat" aria-labelledby="h-linjer">
        <div class="korthode"><h2 id="h-linjer">Linjer per butikk</h2><span class="meta">Per måned uten mva, ${dato(abo.dato)}</span></div>
        ${p ? html`<div class="tabellramme"><table class="tabell"><thead><tr><th>Butikk</th><th>Pakke</th><th class="hoyre">Brukere</th><th class="hoyre">Ekstra brukere</th><th class="hoyre">Montører</th><th class="hoyre">Pakkepris</th><th class="hoyre">Sum</th></tr></thead>
          <tbody>${p.rader.map((r: any) => html`<tr><td>${r.navn}</td><td>${r.pakke_navn}</td><td class="hoyre">${r.inkl_brukere + r.antall_brukere}</td><td class="hoyre dempet">${r.antall_brukere ? `${r.antall_brukere} × ${kr(r.brukere_ore / r.antall_brukere)}` : "–"}</td><td class="hoyre">${r.montorer}</td><td class="hoyre">${kr(r.pakke_ore)}</td><td class="hoyre">${kr(r.sum_ore)}</td></tr>`)}</tbody></table></div>
          <div class="rad-linje"><span>Hengsel Ute, ${p.ute.modell === "firma" ? `firmapris for opptil ${p.ute.firma_maks} montører (${p.ute.antall})` : p.ute.modell === "ingen" ? "ingen montører" : `${p.ute.antall} montører × ${kr(p.ute.montor_ore)}`}</span><b>${kr(p.ute.pris_ore)}</b></div>
          ${p.rabatt_ore ? html`<div class="rad-linje rabatt"><span>Kjederabatt ${p.rabatt_prosent} % (${p.antall_butikker} butikker) av ${kr(p.grunnlag_ore)}</span><b>−${kr(p.rabatt_ore)}</b></div>` : mangler ? html`<div class="rad-linje dempet">${mangler}</div>` : ""}
          ${p.tillegg.map((t: any) => html`<div class="rad-linje"><span>${t.navn} <span class="meta">${t.inkludert ? t.grunn : "tillegg, uten rabatt"}</span></span><b>${t.inkludert ? "Inkludert" : kr(t.belop_ore)}</b></div>`)}
          ${p.kpi_faktor !== 1 ? html`<div class="rad-linje dempet"><span>Før KPI-justering</span><span>${kr(p.netto_ore)}</span></div>` : ""}
          <div class="sumblokk"><b>Per måned uten mva</b><span class="stor">${kr(p.pris_ore)}</span><span class="dempet">Mva ${abo.prisliste.mva_prosent} %</span><span class="hoyre dempet">${kr(p.mva_ore)}</span><span class="dempet">Per måned med mva</span><span class="hoyre dempet">${kr(p.inkl_ore)}</span></div>`
        : tom("ordre", "Ingen linjer på denne datoen", "Abonnementet har ingen butikker som gjelder nå.")}
      </section>
      <section class="kort flat" aria-labelledby="h-endringer">
        <div class="korthode"><h2 id="h-endringer">Endringer</h2><span class="meta">Nyeste først</span></div>
        <ul class="liste">${abo.endringer.map((e: any) => html`<li><span class="meta">${dato(e.gjelder_fra)}</span><div class="tekst"><b>${e.tekst} ${e.framtidig ? raw(`<span class="merkelapp">Kommer</span>`) : ""}</b><span>${e.type_navn} · ${e.hvem}</span></div></li>`)}</ul>
      </section>
    </div>`);
  q<HTMLSelectElement>("#velg")?.addEventListener("change", (e) => { valgt = (e.target as HTMLSelectElement).value; history.replaceState(null, "", `?id=${valgt}`); laster.last(); });
  q("#lag")?.addEventListener("click", () => lag(liste));
  q("#ny-endring")?.addEventListener("click", () => nyEndring(abo));
}

async function lag(liste: any) {
  let id = "";
  const r = await skjemaDialog({ tittel: "Lag abonnement fra signert avtale", knapp: "Lag abonnement", innhold: `<label class="felt"><span>Avtale</span><select name="avtale_nr">${liste.kan_lages.map((a: any) => `<option value="${esc(a.nr)}">${esc(a.nr)} · ${esc(a.eier_navn)} · fra ${dato(a.start)}</option>`).join("")}</select></label><p class="meta">Linjene hentes fra tilbudet avtalen ble laget fra, med prislisten avtalen gjelder.</p>`,
    send: async (d) => { id = (await api<{ id: string }>("POST", "/api/abonnement", { avtale_nr: d.avtale_nr })).id; } });
  if (r) { valgt = id; history.replaceState(null, "", `?id=${id}`); toast("Abonnementet er laget"); laster.last(); }
}

async function nyEndring(abo: any) {
  const butikker = abo.linjer.filter((l: any) => l.type === "butikk");
  const pakker = Object.entries(abo.prisliste?.pakker ?? {}) as [string, any][];
  const neste = abo.abonnement.neste_faktura ?? abo.idag;
  const r = await skjemaDialog({ tittel: "Ny endring", knapp: "Lagre endring", bred: true, innhold: `
    <div class="felt-rad"><label class="felt"><span>Type</span><select name="type">${abo.endringstyper.map((t: any) => `<option value="${t.kode}">${t.kode === "butikk_lagt_til" ? "Butikk lagt til" : t.kode === "butikk_fjernet" ? "Butikk fjernet" : t.kode === "tillegg" ? "Tillegg (legg til eller fjern)" : t.navn}</option>`).join("")}</select></label>
      <label class="felt"><span>Gjelder fra</span><input name="gjelder_fra" type="date" value="${neste}" required /></label></div>
    <div class="felt-rad"><label class="felt"><span>Butikk</span><select name="linje_id">${butikker.map((b: any) => `<option value="${b.id}">${esc(b.butikk_navn)} (${abo.prisliste?.pakker?.[b.pakke]?.navn ?? b.pakke})</option>`).join("")}</select></label>
      <label class="felt"><span>Ny butikk (navn)</span><input name="butikk_navn" type="text" maxlength="120" /></label></div>
    <div class="felt-rad"><label class="felt"><span>Pakke</span><select name="pakke">${pakker.map(([k, x]) => `<option value="${k}">${x.navn} · ${kr(x.pris_ore)}</option>`).join("")}</select></label>
      <label class="felt"><span>Ekstra brukere</span><input name="ekstra_brukere" type="number" min="0" max="1000" /></label>
      <label class="felt"><span>Montører</span><input name="montorer" type="number" min="0" max="1000" /></label>
      <label class="felt"><span>Tillegg</span><select name="tillegg_kode">${(abo.prisliste?.tillegg ?? []).map((t: any) => `<option value="${esc(t.kode)}">${esc(t.navn)}</option>`).join("")}</select></label></div>
    <label class="felt"><span>Merknad (valgfri)</span><input name="tekst" type="text" maxlength="300" /></label>
    <p class="meta">Feltene som ikke hører til typen, brukes ikke. Kjederabatten regnes ut på nytt fra antall butikker.</p>`,
    send: async (d) => {
      const k: Record<string, unknown> = { type: d.type, gjelder_fra: d.gjelder_fra, tekst: d.tekst || undefined };
      if (["pakke", "ekstra_brukere", "montorer", "butikk_fjernet"].includes(d.type)) k.linje_id = d.linje_id;
      if (d.type === "pakke" || d.type === "butikk_lagt_til") k.pakke = d.pakke;
      if (d.type === "ekstra_brukere" || d.type === "butikk_lagt_til") k.ekstra_brukere = d.ekstra_brukere || 0;
      if (d.type === "montorer" || d.type === "butikk_lagt_til") k.montorer = d.montorer || 0;
      if (d.type === "butikk_lagt_til") k.butikk_navn = d.butikk_navn;
      if (d.type === "tillegg") k.tillegg_kode = d.tillegg_kode;
      await api("POST", `/api/abonnement/${abo.abonnement.id}/endringer`, k);
    } });
  if (r) { toast("Endringen er lagret"); laster.last(); }
}

laster.last();
