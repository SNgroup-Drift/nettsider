/** SD2 Kontoer (K-260): tjeneste, eier, plan, kost per måned, fornyelse (snart: rød tekst) og lenke til 1Password-hvelvet. Aldri hemmeligheter. */
import { api, html, raw, sett, q, qa, esc, kr, dato, ikon, toast, skjemaDialog } from "../lib/dom";
import { rot, sidehode, lagLaster, tom } from "../lib/fase-c";

const knapp = `<button class="knapp primar" type="button" id="ny">${ikon("pluss", 18)}Ny konto</button>`;
const hode = () => sidehode("Kontoer", "Tjenestene Hengsel betaler for. Innlogging, passord og nøkler ligger bare i 1Password.", knapp);
const laster = lagLaster<any>({ omraade: "Drift", feiltekst: "Kunne ikke hente kontoene.", hode, skjelettKlasse: "rad", tomData: () => ({ kontoer: [], sum_mnd_ore: 0 }), hent: () => api("GET", "/api/drift/kontoer"), vis });
const FELT = (k: any = {}) => `
  <label class="felt"><span>Tjeneste</span><input name="tjeneste" type="text" maxlength="120" value="${esc(k.tjeneste ?? "")}" required /></label>
  <div class="felt-rad"><label class="felt"><span>Eier</span><input name="eier" type="text" maxlength="120" value="${esc(k.eier ?? "")}" /></label><label class="felt"><span>Plan</span><input name="plan" type="text" maxlength="120" value="${esc(k.plan ?? "")}" /></label></div>
  <div class="felt-rad"><label class="felt"><span>Kost per måned (kr)</span><input name="kost" type="text" inputmode="decimal" value="${k.kost_mnd_ore ? k.kost_mnd_ore / 100 : ""}" /></label><label class="felt"><span>Fornyes (dato)</span><input name="fornyes" type="date" value="${esc(k.fornyes ?? "")}" /></label><label class="felt"><span>eller</span><input name="fornyes_tekst" type="text" maxlength="60" placeholder="Månedlig" value="${esc(k.fornyes_tekst ?? "")}" /></label></div>
  <div class="felt-rad"><label class="felt"><span>1Password-hvelv</span><input name="hvelv" type="text" maxlength="120" value="${esc(k.hvelv ?? "")}" /></label><label class="felt"><span>Lenke til hvelvet</span><input name="hvelv_url" type="url" placeholder="Kopier lenke i 1Password" value="${esc(k.hvelv_url ?? "")}" /></label></div>
  <label class="felt"><span>Merknad</span><input name="merknad" type="text" maxlength="300" value="${esc(k.merknad ?? "")}" /></label>
  <p class="meta">Skriv aldri passord, nøkler eller koder her.</p>`;
const kropp = (d: Record<string, string>) => ({ ...d, kost: undefined, kost_mnd_ore: d.kost ? Math.round(Number(d.kost.replace(/\s/g, "").replace(",", ".")) * 100) : 0 });

function vis(d: any) {
  sett(rot(), html`${hode()}
    ${!d.kontoer.length ? html`<div class="kort">${tom("profil", "Ingen kontoer ennå", "Legg inn tjenestene Hengsel betaler for, med lenke til hvelvet i 1Password.")}</div>`
    : html`<div class="kort tabellramme"><table class="tabell"><thead><tr><th>Tjeneste</th><th>Eier</th><th>Plan</th><th class="hoyre">Kost per mnd</th><th>Fornyes</th><th>1Password</th><th></th></tr></thead>
      <tbody>${d.kontoer.map((k: any) => html`<tr><td><b>${k.tjeneste}</b>${k.merknad ? html`<br /><span class="meta">${k.merknad}</span>` : ""}</td><td class="dempet">${k.eier ?? "–"}</td><td>${k.plan ?? "–"}</td><td class="hoyre">${k.kost_mnd_ore ? kr(k.kost_mnd_ore) : "–"}</td>
        <td>${k.fornyes ? raw(`<span class="${k.snart ? "rod-tekst" : ""}">${dato(k.fornyes)}${k.snart ? ` (${k.dager} dager)` : ""}</span>`) : k.fornyes_tekst ?? "–"}</td>
        <td>${k.hvelv_url ? html`<a href="${k.hvelv_url}" target="_blank" rel="noopener noreferrer">1Password · ${k.hvelv ?? "hvelv"}</a>` : k.hvelv ? `1Password · ${k.hvelv}` : "–"}</td>
        <td class="hoyre"><button class="knapp liten" type="button" data-endre="${k.id}">Endre</button></td></tr>`)}</tbody>
      <tfoot><tr><td colspan="3"><b>Sum fast kost per måned</b></td><td class="hoyre"><b>${kr(d.sum_mnd_ore)}</b></td><td colspan="3"></td></tr></tfoot></table></div>`}`);
  q("#ny")?.addEventListener("click", async () => { if (await skjemaDialog({ tittel: "Ny konto", knapp: "Lagre", bred: true, innhold: FELT(), send: (x) => api("POST", "/api/drift/kontoer", kropp(x)) })) { toast("Kontoen er lagret"); laster.last(); } });
  qa<HTMLButtonElement>("[data-endre]").forEach((b) => b.addEventListener("click", async () => {
    const k = d.kontoer.find((x: any) => x.id === b.dataset.endre);
    if (await skjemaDialog({ tittel: `Endre ${k.tjeneste}`, knapp: "Lagre", bred: true, innhold: FELT(k), send: (x) => api("PATCH", `/api/drift/kontoer/${k.id}`, kropp(x)) })) { toast("Kontoen er lagret"); laster.last(); }
  }));
}
laster.last();
