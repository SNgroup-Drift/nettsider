/** Innstillinger i fase C (K-260): Varsler, Kundemiljøer (listen Status leser), Avtalemaler og Brukere og roller. Supportnivå, timepris og svarmaler er K-259. */
import { api, html, raw, sett, q, qa, dato, toast, esc } from "../lib/dom";
import { rot, sidehode, lagLaster, tom, eksempel } from "../lib/fase-c";

const side = rot().dataset.side ?? "varsler";
const UNDER = [["/innstillinger/leverandor", "Leverandør"], ["/innstillinger/prisliste", "Prisliste"], ["/innstillinger/avtalemaler", "Avtalemaler"], ["/innstillinger/brukere", "Brukere og roller"], ["/innstillinger/varsler", "Varsler"], ["/innstillinger/kundemiljoer", "Kundemiljøer"]];
const meny = () => raw(`<nav class="undermeny" aria-label="Innstillinger">${UNDER.map(([h, n]) => `<a href="${h}" ${h.endsWith(side) ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</nav>`);
const TITLER: Record<string, [string, string, string]> = {
  varsler: ["Varsler", "Hva Admin varsler om. Varsel vises i Admin; e-post sendes ikke fra fase C.", "/api/innstillinger/varsler"],
  kundemiljoer: ["Kundemiljøer", "Listen Drift › Status viser. Bare adresser, aldri nøkler.", "/api/innstillinger/kundemiljoer"],
  avtalemaler: ["Avtalemaler", "Malene avtalene fylles ut fra. Versjon, gjelder fra, hvor mange avtaler som bruker dem og status.", "/api/innstillinger/avtalemaler"],
  brukere: ["Brukere og roller", "Hvem som har tilgang til Admin, og hva rollene ser.", "/api/innstillinger/brukere"],
};
const [tittel, under, sti] = TITLER[side];
const hode = () => html`${sidehode(tittel, under)}${meny()}`;
const laster = lagLaster<any>({ omraade: "Innstillinger", feiltekst: `Kunne ikke hente ${tittel.toLowerCase()}.`, hode, skjelettKlasse: "rad", hent: () => api("GET", sti), vis });

function vis(d: any) {
  if (side === "varsler") {
    sett(rot(), html`${hode()}<section class="kort flat">${d.varsler.map((v: any) => html`<label class="bryter-rad"><span class="tekst"><b>${v.navn}</b><span>${v.tekst}</span></span><input class="bryter" type="checkbox" role="switch" data-varsel="${v.kode}" ${raw(v.paa ? "checked" : "")} /></label>`)}</section>`);
    qa<HTMLInputElement>("[data-varsel]").forEach((c) => c.addEventListener("change", async () => { await api("PATCH", sti, { [c.dataset.varsel!]: c.checked ? 1 : 0 }); toast(`${c.closest("label")!.querySelector("b")!.textContent} er ${c.checked ? "på" : "av"}`); }));
  } else if (side === "kundemiljoer") {
    const rad = (m: any = {}) => `<div class="felt-rad" data-rad><label class="felt"><span>Navn</span><input name="navn" type="text" maxlength="120" value="${esc(m.navn ?? "")}" /></label><label class="felt"><span>Adresse</span><input name="adresse" type="text" maxlength="200" placeholder="kunde.hengsel.no" value="${esc(m.adresse ?? "")}" /></label><label class="felt"><span>Kunde</span><select name="eier_id"><option value="">Ingen</option>${d.kunder.map((k: any) => `<option value="${k.id}" ${k.id === m.eier_id ? "selected" : ""}>${esc(k.navn)}</option>`).join("")}</select></label></div>`;
    sett(rot(), html`${hode()}<form class="kort" id="miljoer" novalidate>${raw((d.kundemiljoer.length ? d.kundemiljoer : [{}]).map(rad).join(""))}
      <div class="rad-flex"><button class="knapp" type="button" id="ny-rad">Ny rad</button><span class="fyll"></span>${d.kunder.some((k: any) => k.miljo_adresse) ? raw(`<button class="knapp" type="button" id="fra-kunder">Fyll fra kundekortene</button>`) : ""}<button class="knapp primar" type="submit">Lagre</button></div></form>`);
    q("#ny-rad")?.addEventListener("click", () => q("#miljoer [data-rad]:last-of-type")!.insertAdjacentHTML("afterend", rad()));
    q("#fra-kunder")?.addEventListener("click", () => { d.kundemiljoer = d.kunder.filter((k: any) => k.miljo_adresse).map((k: any) => ({ navn: k.navn, adresse: k.miljo_adresse, eier_id: k.id })); vis(d); });
    q<HTMLFormElement>("#miljoer")!.addEventListener("submit", async (e) => {
      e.preventDefault();
      const liste = qa("[data-rad]").map((r) => ({ navn: (q<HTMLInputElement>("[name=navn]", r)!).value, adresse: (q<HTMLInputElement>("[name=adresse]", r)!).value, eier_id: (q<HTMLSelectElement>("[name=eier_id]", r)!).value || null })).filter((m) => m.adresse.trim());
      try { await api("PUT", sti, { kundemiljoer: liste }); toast("Kundemiljøene er lagret"); laster.last(); } catch (err: any) { toast(err?.message ?? "Kunne ikke lagre"); }
    });
  } else if (side === "avtalemaler") {
    sett(rot(), html`${hode()}${!d.maler.length ? html`<div class="kort">${tom("signert", "Ingen avtalemaler", "Malene legges inn med migreringen.")}</div>` : html`<div class="kort tabellramme"><table class="tabell"><thead><tr><th>Mal</th><th>Versjon</th><th>Gjelder fra</th><th class="hoyre">Brukt i</th><th>Status</th></tr></thead>
      <tbody>${d.maler.map((m: any) => html`<tr><td><b>${m.navn}</b> ${m.eksempel ? eksempel() : ""}</td><td>${m.versjon}</td><td>${dato(m.gjelder_fra)}</td><td class="hoyre">${m.brukt} ${m.brukt === 1 ? "avtale" : "avtaler"}</td><td>${raw(`<span class="pille" data-status="${esc(m.status)}">${esc(m.status === "aktiv" ? "Aktiv" : m.status === "utkast" ? "Utkast" : "Arkivert")}</span>`)}</td></tr>`)}</tbody></table></div>`}`);
  } else {
    sett(rot(), html`${hode()}<div class="to-like">
      <section class="kort flat"><div class="korthode"><h2>Brukere</h2></div><table class="tabell"><tbody>${d.brukere.map((b: any) => html`<tr><td><b>${b.navn}</b><br /><span class="meta">${b.epost}</span></td><td>${b.rolle === "eier" ? "Eier" : b.rolle === "support" ? "Support" : b.rolle}</td></tr>`)}</tbody></table>
        <div class="rad-linje dempet">Tilgang styres av Cloudflare Access og lista i worker/tilgang.js. Nye brukere legges inn der, ikke her.</div></section>
      <section class="kort flat"><div class="korthode"><h2>Hva rollene ser</h2></div><table class="tabell"><thead><tr><th>Område</th><th>Eier</th><th>Support</th></tr></thead><tbody>${d.tilgang.map((t: any) => html`<tr><td>${t.omraade}</td><td>${t.eier}</td><td class="dempet">${t.support}</td></tr>`)}</tbody></table></section></div>`);
  }
}
laster.last();
