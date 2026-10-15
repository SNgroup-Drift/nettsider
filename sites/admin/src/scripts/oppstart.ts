/**
 * SO2 Oppstarter (K-259, 60-211): én rad per kunde med avtale, oppstartsdato, fremdrift (x av 9), neste punkt med ansvarlig og «Stopper: …»
 * i rød tekst. Fullført under. «Ny oppstart» lager sjekklista fra en avtale som er sendt til signering eller signert. Telefon: kort per kunde.
 */
import { api, html, raw, q, qa, sett, skjelett, tilstand, feilbanner, ikon, esc, dato, skjemaDialog } from "../lib/dom";
import { fremdrift, oppstartstatus, ansvarlig, settBredder } from "../lib/support-ui";

const rot = q("#side")!;
const hode = () => html`<header class="sidehode"><div><h1>Oppstart</h1><p class="under">Ni punkter fra signert avtale til første faktura. Oppstarten åpnes når avtalen sendes til signering.</p></div>
  <div class="handlinger"><button class="knapp primar" type="button" id="ny-oppstart">${raw(ikon("pluss", 18))}Ny oppstart</button></div></header>`;

const neste = (o: any) => html`${o.neste ? html`<span class="neste-punkt">${o.neste.punkt} ${ansvarlig(o.neste.ansvarlig, o.neste.ansvarlig_navn)}</span>` : ""}
  ${o.stopper.map((s: any) => html`<span class="stopper-tekst">${raw(ikon("stoppet", 16))}<b>Stopper:</b> ${s.punkt}</span>`)}`;

function vis(d: any) {
  const ingen = !d.i_gang.length && !d.fullfort.length;
  sett(rot, html`${hode()}
    ${ingen ? html`<div class="kort tom">${raw(ikon("prosjektplan", 32))}<b>Ingen oppstarter ennå</b><span>En oppstart lages fra en avtale som er sendt til signering. Sjekklista har ni punkter, fra signert avtale til første faktura.</span></div>` : html`
    <div class="kort uten-pad bare-pc"><div class="tabellramme"><table class="tabell oppstarttabell"><thead><tr><th>I gang</th><th>Oppstart</th><th>Fremdrift</th><th>Neste punkt</th><th>Status</th></tr></thead><tbody>
      ${d.i_gang.length ? d.i_gang.map((o: any) => html`<tr data-lenke="/oppstart/${o.id}"><td class="to-linjer"><a href="/oppstart/${o.id}">${o.eier_navn}</a><span>${o.avtale_nr ? `Avtale ${o.avtale_nr}` : ""}</span></td><td>${dato(o.oppstartsdato)}</td>
        <td class="fremdrift-celle">${fremdrift(o.ferdig, o.av)}<span class="meta">${o.ferdig} av ${o.av}</span></td><td class="neste-celle">${neste(o)}</td><td>${oppstartstatus(o.status, o.status_navn)}</td></tr>`) : html`<tr><td colspan="5" class="dempet">Ingen oppstarter i gang.</td></tr>`}
      ${d.fullfort.length ? html`<tr class="gruppe-rad"><th colspan="5">Fullført</th></tr>${d.fullfort.map((o: any) => html`<tr data-lenke="/oppstart/${o.id}"><td><a href="/oppstart/${o.id}">${o.eier_navn}</a></td><td class="dempet">${dato(o.oppstartsdato)}</td><td class="dempet">${o.ferdig} av ${o.av}</td><td class="dempet">${o.fullfort ? `Fullført ${dato(o.fullfort.slice(0, 10))}` : "Fullført"}</td><td>${oppstartstatus("ferdig", "Ferdig")}</td></tr>`)}` : ""}
    </tbody></table></div></div>
    <div class="bare-telefon oppstartkort-liste">
      ${d.i_gang.length ? html`<p class="liste-etikett">I gang</p>${d.i_gang.map((o: any) => html`<a class="kort oppstartkort" href="/oppstart/${o.id}"><span class="topp"><b>${o.eier_navn.replace(/ AS$/, "")}</b><span class="meta">${dato(o.oppstartsdato)}</span></span>
        <span class="fremdrift-rad">${fremdrift(o.ferdig, o.av)}<span class="meta">${o.ferdig} av ${o.av}</span></span>${o.neste ? html`<span>Neste: ${o.neste.punkt} ${ansvarlig(o.neste.ansvarlig, o.neste.ansvarlig_navn)}</span>` : ""}
        ${o.stopper.map((s: any) => html`<span class="stopper-tekst">${raw(ikon("stoppet", 16))}<b>Stopper:</b> ${s.punkt}</span>`)}</a>`)}` : ""}
      ${d.fullfort.length ? html`<p class="liste-etikett">Fullført</p><div class="kort uten-pad"><ul class="liste innrykk">${d.fullfort.map((o: any) => html`<li><a class="rad" href="/oppstart/${o.id}"><span class="ferdig-ikon">${raw(ikon("hake", 16))}</span><div class="tekst"><b>${o.eier_navn.replace(/ AS$/, "")}</b></div><span class="meta">${o.fullfort ? dato(o.fullfort.slice(0, 10)) : ""}</span></a></li>`)}</ul></div>` : ""}
    </div>`}`);
  koble();
  settBredder(rot);
}

function koble() {
  qa<HTMLTableRowElement>("tr[data-lenke]", rot).forEach((tr) => tr.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; location.href = tr.dataset.lenke!; }));
  q("#ny-oppstart", rot)?.addEventListener("click", nyOppstart);
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
  sett(rot, html`${hode()}<div class="kort uten-pad">${raw(skjelett(4, "rad"))}</div>`);
  try { vis(await api("GET", "/api/oppstart")); }
  catch (e) { sett(rot, html`${hode()}${raw(feilbanner(e, "Kunne ikke hente oppstartene."))}`); koble(); }
}
last();
