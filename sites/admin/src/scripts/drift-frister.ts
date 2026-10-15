/** SD2 Frister (K-260): frist, kategori, dato, varsel og dager igjen (7 eller færre: gul). «Ny frist». */
import { api, html, raw, sett, q, qa, esc, dato, ikon, toast, skjemaDialog } from "../lib/dom";
import { rot, sidehode, lagLaster, tom } from "../lib/fase-c";

const hode = () => sidehode("Frister", "Domener, avtaler, sikkerhetskopi og andre datoer som ikke må glippe.", `<button class="knapp primar" type="button" id="ny">${ikon("pluss", 18)}Ny frist</button>`);
const laster = lagLaster<any>({ omraade: "Drift", feiltekst: "Kunne ikke hente fristene.", hode, skjelettKlasse: "rad", tomData: () => ({ frister: [], kategorier: [] }), hent: () => api("GET", "/api/drift/frister"), vis });
const FELT = (f: any = {}) => `<label class="felt"><span>Frist</span><input name="tekst" type="text" maxlength="200" value="${esc(f.tekst ?? "")}" required /></label>
  <div class="felt-rad"><label class="felt"><span>Kategori</span><input name="kategori" type="text" maxlength="60" value="${esc(f.kategori ?? "")}" list="kategorier" required /></label><label class="felt"><span>Dato</span><input name="dato" type="date" value="${esc(f.dato ?? "")}" required /></label><label class="felt"><span>Varsel, dager før</span><input name="varsel_dager" type="number" min="0" max="365" value="${esc(f.varsel_dager ?? 14)}" /></label></div>`;
const igjen = (f: any) => (f.dager < 0 ? `Forfalt for ${-f.dager} dager siden` : f.dager === 0 ? "I dag" : `${f.dager} dager`);
function vis(d: any) {
  sett(rot(), html`${hode()}<datalist id="kategorier">${d.kategorier.map((k: string) => html`<option value="${k}"></option>`)}</datalist>
    ${!d.frister.length ? html`<div class="kort">${tom("frist", "Ingen frister", "Legg inn datoer som domener, fornyelser og årlige gjennomganger.")}</div>`
    : html`<div class="kort tabellramme"><table class="tabell"><thead><tr><th>Frist</th><th>Kategori</th><th>Dato</th><th>Varsel</th><th class="hoyre">Dager igjen</th><th></th></tr></thead>
      <tbody>${d.frister.map((f: any) => html`<tr><td><b>${f.tekst}</b></td><td class="dempet">${f.kategori}</td><td>${dato(f.dato)}</td><td class="dempet">${f.varsel_dager ? `${f.varsel_dager} dager før` : "Ingen"}</td>
        <td class="hoyre">${raw(`<span class="${f.niva === "forfalt" ? "rod-tekst" : f.niva === "snart" ? "gul-tekst" : ""}">${igjen(f)}</span>`)}</td><td class="hoyre"><button class="knapp liten" type="button" data-endre="${f.id}">Endre</button></td></tr>`)}</tbody></table></div>`}`);
  q("#ny")?.addEventListener("click", async () => { if (await skjemaDialog({ tittel: "Ny frist", knapp: "Lagre", innhold: FELT(), send: (x) => api("POST", "/api/drift/frister", x) })) { toast("Fristen er lagret"); laster.last(); } });
  qa<HTMLButtonElement>("[data-endre]").forEach((b) => b.addEventListener("click", async () => {
    const f = d.frister.find((x: any) => x.id === b.dataset.endre);
    if (await skjemaDialog({ tittel: "Endre frist", knapp: "Lagre", innhold: FELT(f), send: (x) => api("PATCH", `/api/drift/frister/${f.id}`, x) })) { toast("Fristen er lagret"); laster.last(); }
  }));
}
laster.last();
