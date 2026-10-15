/** SD2 Rutiner (K-260): grupper (måned, uke, kvartal) med avkryssing per periode og telling. */
import { api, html, raw, sett, q, qa, ikon, toast, skjemaDialog, tid } from "../lib/dom";
import { rot, sidehode, lagLaster, tom } from "../lib/fase-c";

const hode = () => sidehode("Rutiner", "Det som skal gjøres hver måned, uke og kvartal. Avkryssingen gjelder perioden og nullstilles i neste.", `<button class="knapp primar" type="button" id="ny">${ikon("pluss", 18)}Ny rutine</button>`);
const laster = lagLaster<any>({ omraade: "Drift", feiltekst: "Kunne ikke hente rutinene.", hode, tomData: () => ({ rutiner: [] }), hent: () => api("GET", "/api/drift/rutiner"), vis });
function vis(d: any) {
  sett(rot(), html`${hode()}
    ${!d.rutiner.length ? html`<div class="kort">${tom("kontrollmal", "Ingen rutiner ennå", "Lag en rutine for måned, uke eller kvartal med punktene som skal krysses av.")}</div>`
    : html`<div class="to-like">${d.rutiner.map((r: any) => html`<section class="kort flat rutinegruppe"><div class="korthode"><h2>${r.navn}</h2><span class="meta">${r.periode_navn} · ${r.ferdige} av ${r.antall}</span></div>
      ${r.punkter.map((p: any) => html`<label class="punkt ${p.ok ? "ok" : ""}"><input type="checkbox" data-punkt="${p.id}" ${raw(p.ok ? "checked" : "")} /><span>${p.tekst}</span>${p.ok ? html`<span class="hvem">${p.hvem} ${tid(p.tid)}</span>` : ""}</label>`)}
      <div class="rad-linje"><span></span><button class="knapp liten" type="button" data-nytt="${r.id}">${raw(ikon("pluss", 16))}Nytt punkt</button></div></section>`)}</div>`}`);
  qa<HTMLInputElement>("[data-punkt]").forEach((c) => c.addEventListener("change", async () => { await api("PUT", `/api/drift/rutinepunkter/${c.dataset.punkt}/avkryssing`, { ok: c.checked ? 1 : 0 }); laster.last(); }));
  qa<HTMLButtonElement>("[data-nytt]").forEach((b) => b.addEventListener("click", async () => { if (await skjemaDialog({ tittel: "Nytt punkt", knapp: "Lagre", innhold: `<label class="felt"><span>Punkt</span><input name="tekst" type="text" maxlength="200" required /></label>`, send: (x) => api("POST", `/api/drift/rutiner/${b.dataset.nytt}/punkter`, x) })) { toast("Punktet er lagt til"); laster.last(); } }));
  q("#ny")?.addEventListener("click", async () => {
    if (await skjemaDialog({ tittel: "Ny rutine", knapp: "Lagre", innhold: `<div class="felt-rad"><label class="felt"><span>Hvor ofte</span><select name="gruppe"><option value="maaned">Hver måned</option><option value="uke">Hver uke</option><option value="kvartal">Hvert kvartal</option></select></label><label class="felt"><span>Navn</span><input name="navn" type="text" maxlength="120" /></label></div><label class="felt"><span>Punkter, ett per linje</span><textarea name="punkter" rows="4"></textarea></label>`,
      send: (x) => api("POST", "/api/drift/rutiner", { gruppe: x.gruppe, navn: x.navn || undefined, punkter: String(x.punkter ?? "").split("\n").map((s) => s.trim()).filter(Boolean) }) })) { toast("Rutinen er lagret"); laster.last(); }
  });
}
laster.last();
