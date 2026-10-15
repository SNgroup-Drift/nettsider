/** SD1 Status (K-260): én rad per kundemiljø, bare til å lese. Fase C: kundemiljøenes tall er ikke koblet til; plattformens offentlige statussider vises. */
import { api, html, raw, sett, ikon, pille, tid } from "../lib/dom";
import { rot, sidehode, lagLaster, tom } from "../lib/fase-c";

const IKKE = raw(`<span class="pille" data-status="ikke_koblet">Ikke koblet</span>`);
const NIVA: Record<string, string> = { none: "Alt virker", minor: "Mindre feil", major: "Større feil", critical: "Kritisk", ukjent: "Ukjent", av: "Ikke hentet" };
const hode = () => sidehode("Status", "Kundemiljøene og plattformen. Bare til å lese: utrulling og fletting skjer ikke fra Admin.");
const laster = lagLaster<any>({
  omraade: "Drift", feiltekst: "Kunne ikke hente status.", hode, skjelettN: 4, skjelettKlasse: "rad",
  tomData: () => ({ miljoer: [], plattform: [], kilde: "innstillinger" }),
  hent: () => api("GET", "/api/drift/status"), vis,
});
function vis(d: any) {
  sett(rot(), html`${hode()}
    ${d.plattform.length ? html`<section class="lenkekort" aria-label="Plattformen">${d.plattform.map((p: any) => html`<a href="${p.url}" target="_blank" rel="noopener noreferrer"><b>${p.navn}</b><span class="meta">${p.tekst}</span><span>${pille(p.indikator, NIVA[p.indikator] ?? p.beskrivelse)} <span class="meta">${p.beskrivelse}${p.hentet ? ` · ${tid(p.hentet)}` : ""}</span></span></a>`)}</section>` : ""}
    <div class="forklaring">${raw(ikon("hjelp", 16))}<span>Versjon, siste utrulling, feil siste 24 t, siste innlogging, brukere og sikkerhetskopi leses fra kundemiljøene når koblingen er på plass. Fase C viser listen fra Innstillinger › Kundemiljøer${d.kilde === "eierkort" ? " (tom, så miljøadressene fra kundekortene brukes)" : ""}. Ingen nøkler er lagt inn.</span></div>
    ${!d.miljoer.length ? html`<div class="kort">${tom("resultater", "Ingen kundemiljøer", "Legg inn kundemiljøene under Innstillinger › Kundemiljøer.", `<a class="knapp" href="/innstillinger/kundemiljoer">Til Kundemiljøer</a>`)}</div>`
    : html`<div class="kort tabellramme"><table class="tabell"><thead><tr><th>Kundemiljø</th><th>Versjon</th><th>Siste utrulling</th><th class="hoyre">Feil 24 t</th><th>Siste innlogging</th><th class="hoyre">Brukere</th><th>Sikkerhetskopi</th></tr></thead>
      <tbody>${d.miljoer.map((m: any) => html`<tr><td><b>${m.navn}</b><br /><a href="https://${m.adresse}" target="_blank" rel="noopener noreferrer" class="meta">${m.adresse}</a></td><td>${IKKE}</td><td>${IKKE}</td><td class="hoyre">${IKKE}</td><td>${IKKE}</td><td class="hoyre">${IKKE}</td><td>${IKKE}</td></tr>`)}</tbody></table></div>`}`);
}
laster.last();
