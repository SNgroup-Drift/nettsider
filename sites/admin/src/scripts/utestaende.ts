/** SC4 Utestående (K-260): lest fra PowerOffice med tidspunkt, lagres ikke. Uten nøklene: tom tilstand med forklaring. */
import { api, html, raw, sett, kr, dato, tid, ikon } from "../lib/dom";
import { rot, sidehode, lagLaster, tom } from "../lib/fase-c";

const hode = (d?: any) => sidehode("Utestående", d?.hentet ? `Lest fra PowerOffice ${tid(d.hentet)}. Bare til å lese. Purring gjøres i PowerOffice.` : "Leses fra PowerOffice. Bare til å lese. Purring gjøres i PowerOffice.");
const laster = lagLaster<any>({
  omraade: "Fakturering", feiltekst: "PowerOffice svarte ikke. Ingenting er lagret, så listen kan ikke vises.", hode: () => hode(), skjelettN: 4, skjelettKlasse: "rad",
  tomData: () => ({ koblet: true, hentet: null, rader: [], sum_ore: 0, forfalt_ore: 0 }),
  hent: () => api("GET", "/api/utestaende"), vis,
});
function vis(d: any) {
  if (!d.koblet) {
    sett(rot(), html`${hode(d)}<div class="kort">${tom("forskudd-leverandor", "PowerOffice er ikke koblet til", "Utestående leses fra PowerOffice hver gang siden åpnes, og lagres ikke i Admin. Koblingen slås på når hemmelighetene POWEROFFICE_APP_KEY, POWEROFFICE_CLIENT_KEY og POWEROFFICE_SUBSCRIPTION_KEY er satt i Workeren.")}</div>`);
    return;
  }
  sett(rot(), html`${hode(d)}
    <div class="rad-flex"><span class="fyll"></span><span class="meta">Utestående <b>${kr(d.sum_ore)}</b></span><span class="meta">Forfalt <b class="rod-tekst">${kr(d.forfalt_ore)}</b></span></div>
    ${!d.rader.length ? html`<div class="kort">${tom("forskudd-leverandor", "Ingen utestående fakturaer", "Alle fakturaer i PowerOffice er betalt.")}</div>`
    : html`<div class="kort tabellramme"><table class="tabell"><thead><tr><th>Faktura</th><th>Kunde</th><th>Fakturadato</th><th>Forfall</th><th class="hoyre">Beløp med mva</th><th class="hoyre">Over forfall</th><th>Purring</th></tr></thead>
      <tbody>${d.rader.map((r: any) => html`<tr><td class="dempet">${r.fakturanr}</td><td><b>${r.eier_navn}</b></td><td class="dempet">${dato(r.fakturadato)}</td><td>${dato(r.forfall)}</td><td class="hoyre"><b>${kr(r.belop_ore)}</b></td><td class="hoyre">${r.dager_over ? raw(`<span class="rod-tekst">${r.dager_over} dager</span>`) : "–"}</td><td class="dempet">${r.purring ?? (r.dager_over ? "Ikke purret" : "Ikke forfalt")}</td></tr>`)}</tbody></table></div>`}`);
  void ikon;
}
laster.last();
