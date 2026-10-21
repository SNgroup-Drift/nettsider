/**
 * SO2 Oppstarter (K-259, 60-211): én rad per kunde med avtale, oppstartsdato, fremdrift (x av 9), neste punkt med ansvarlig og «Stopper: …»
 * i rød tekst. Fullført under. «Ny oppstart» lager sjekklista fra en avtale som er sendt til signering eller signert. Telefon: kort per kunde.
 * K-469: på kitet fra N-4: fanene I gang · Fullført med antall (2e), Tabell 1/1 «Oppstarter», «Ny oppstart» i topplinja. Veiviseren fra K-272
 * (Opprett kunde) kan hektes på «Ny oppstart» senere uten ny migrering: POST /api/oppstart tar en avtale som før.
 */
import { api, html, raw, q, qa, sett, tilstand, feilbanner, ikon, esc, dato, skjemaDialog } from "../lib/dom";
import { flis, rad, tom, laster, settFaner, tabellHoyde } from "../lib/kit";
import { fremdrift, oppstartstatus, ansvarlig, settBredder } from "../lib/support-ui";

const rot = q("#side")!;
let fane = "i_gang";
const UNDER = "Ni punkter fra signert avtale til første faktura. Oppstarten åpnes når avtalen sendes til signering.";

const neste = (o: any) => html`${o.neste ? html`<span class="neste-punkt">${o.neste.punkt} ${ansvarlig(o.neste.ansvarlig, o.neste.ansvarlig_navn)}</span>` : ""}
  ${o.stopper.map((s: any) => html`<span class="stopper-tekst">${raw(ikon("stoppet", 16))}<b>Stopper:</b> ${s.punkt}</span>`)}`;

function vis(d: any) {
  const ingen = !d.i_gang.length && !d.fullfort.length;
  settFaner([{ id: "i_gang", navn: "I gang", antall: d.i_gang.length }, { id: "fullfort", navn: "Fullført", antall: d.fullfort.length }], fane, (id) => { fane = id; vis(d); });
  const liste: any[] = fane === "fullfort" ? d.fullfort : d.i_gang;
  const pc = fane === "fullfort"
    ? liste.map((o: any) => html`<tr data-lenke="/oppstart/${o.id}"><th scope="row"><a href="/oppstart/${o.id}">${o.eier_navn}</a></th><td class="dempet">${dato(o.oppstartsdato)}</td><td class="dempet">${o.ferdig} av ${o.av}</td><td class="dempet">${o.fullfort ? `Fullført ${dato(o.fullfort.slice(0, 10))}` : "Fullført"}</td><td>${oppstartstatus("ferdig", "Ferdig")}</td></tr>`)
    : liste.map((o: any) => html`<tr data-lenke="/oppstart/${o.id}"><th scope="row" class="to-linjer"><a href="/oppstart/${o.id}">${o.eier_navn}</a><span>${o.avtale_nr ? `Avtale ${o.avtale_nr}` : ""}</span></th><td>${dato(o.oppstartsdato)}</td>
        <td class="fremdrift-celle">${fremdrift(o.ferdig, o.av)}<span class="meta">${o.ferdig} av ${o.av}</span></td><td class="neste-celle">${neste(o)}</td><td>${oppstartstatus(o.status, o.status_navn)}</td></tr>`);
  const telefon = liste.map((o: any) => html`<a class="kort oppstartkort" href="/oppstart/${o.id}"><span class="topp"><b>${o.eier_navn.replace(/ AS$/, "")}</b><span class="meta">${dato(o.oppstartsdato)}</span></span>
        <span class="fremdrift-rad">${fremdrift(o.ferdig, o.av)}<span class="meta">${o.ferdig} av ${o.av}</span></span>${o.neste && fane !== "fullfort" ? html`<span>Neste: ${o.neste.punkt} ${ansvarlig(o.neste.ansvarlig, o.neste.ansvarlig_navn)}</span>` : ""}
        ${o.stopper.map((s: any) => html`<span class="stopper-tekst">${raw(ikon("stoppet", 16))}<b>Stopper:</b> ${s.punkt}</span>`)}</a>`);
  const innhold = ingen ? tom("Ingen oppstarter ennå", "En oppstart lages fra en avtale som er sendt til signering. Sjekklista har ni punkter, fra signert avtale til første faktura.")
    : !liste.length ? tom(fane === "fullfort" ? "Ingen fullførte oppstarter ennå" : "Ingen oppstarter i gang")
    : html`<div class="tabellramme bare-pc"><table class="tabell oppstarttabell" data-k-tabell><thead><tr><th>Kunde</th><th>Oppstart</th><th>Fremdrift</th><th>${fane === "fullfort" ? "Fullført" : "Neste punkt"}</th><th>Status</th></tr></thead><tbody>${pc}</tbody></table></div>
      <div class="bare-telefon oppstartkort-liste">${telefon}</div><p class="meta bare-pc">${UNDER}</p>`;
  sett(rot, rad(liste.length ? tabellHoyde(liste.length) : 320, [flis({ id: "oppstarter", tittel: "Oppstarter", teller: liste.length, innhold })]));
  koble();
  settBredder(rot);
}

function koble() {
  qa<HTMLTableRowElement>("tr[data-lenke]", rot).forEach((tr) => tr.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; location.href = tr.dataset.lenke!; }));
  const ny = q("#ny-oppstart"); if (ny && !ny.dataset.koblet) { ny.dataset.koblet = "1"; ny.addEventListener("click", nyOppstart); }
  q("#prov-igjen", rot)?.addEventListener("click", last);
}

async function nyOppstart() {
  let avtaler: any[] = [];
  try { avtaler = (await api("GET", "/api/oppstart/valg")).avtaler; } catch { /* tom liste */ }
  let id = "";
  const innhold = avtaler.length
    ? `<label class="felt"><span>Avtale</span><select name="avtale_nr">${avtaler.map((a) => `<option value="${esc(a.nr)}">${esc(a.nr)} · ${esc(a.eier_navn)} (${a.status === "signert" ? "signert" : "til signering"})</option>`).join("")}</select></label><label class="felt"><span>Oppstartsdato (tom = avtalens start)</span><input name="oppstartsdato" type="date" /></label><p class="meta">Sjekklista lages fra malen med ni punkter.</p>`
    : `<p class="meta">Ingen avtaler er sendt til signering uten oppstart. Send en avtale til signering under Avtaler først.</p>`;
  const r = await skjemaDialog({ tittel: "Ny oppstart", innhold, knapp: avtaler.length ? "Lag sjekkliste fra mal" : "Lukk", send: avtaler.length ? async (x) => { id = (await api<{ id: string }>("POST", "/api/oppstart", { avtale_nr: x.avtale_nr, oppstartsdato: x.oppstartsdato || undefined })).id; } : undefined });
  if (r && id) location.href = `/oppstart/${id}`;
}

async function last() {
  if (tilstand() === "tom") return vis({ i_gang: [], fullfort: [] });
  sett(rot, rad(320, [flis({ id: "oppstarter", tittel: "Oppstarter", innhold: laster() })]));
  try { vis(await api("GET", "/api/oppstart")); }
  catch (e) { sett(rot, rad(320, [flis({ id: "oppstarter", tittel: "Oppstarter", innhold: raw(feilbanner(e, "Kunne ikke hente oppstartene.")) })])); koble(); }
}
last();
