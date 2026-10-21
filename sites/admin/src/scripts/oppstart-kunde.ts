/**
 * SO1 Oppstart for én kunde (K-259, 60-211): oppstartsdato stort med dager igjen, kunde, avtale og fremdrift; banner med 2 px rød ring når
 * noe stopper (hva, hva det hindrer, hva som venter på kunden, «Send påminnelse»); sjekklista med ni punkter (status, ansvarlig, dato eller
 * frist, detalj). Opplæring viser øktene med dato, sted og deltakere. Klikk på status bytter (meny med de fem statusene).
 * Tilstander: tom («Lag sjekkliste fra mal»), laster, feil (endring ikke lagret).
 * K-469: på kitet fra N-4: kunden er sidetittelen (brødsmule Oppstart), de andre oppstartene er faner, Status 1/3 ×3 (Oppstartsdato, Avtale,
 * Fremdrift), flisen «Stopper» (det som stopper vises tydelig, med «Send påminnelse») og Tabell 1/1 «Sjekkliste».
 */
import { api, ApiFeil, html, raw, q, qa, sett, tilstand, feilbanner, ikon, esc, dato, toast, skjemaDialog, idFraSti } from "../lib/dom";
import { flis, rad, tom, laster, settTittel, settSidepille, settFaner } from "../lib/kit";
import { fremdrift, oppstartstatus, ansvarlig, settBredder } from "../lib/support-ui";

const rot = q("#side")!;
const id = idFraSti();
let d: any = null;
const UKEDAG = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const oktTid = (k: any) => `${stor(UKEDAG[new Date(`${k.dato}T12:00:00Z`).getUTCDay()])} ${dato(k.dato)}${k.fra ? ` kl. ${k.fra.replace(":00", "")}${k.til ? `–${k.til.replace(":00", "")}` : ""}` : ""}`;
const STATUSIKON: Record<string, string> = { ferdig: "hake", stopper: "stoppet", igang: "pil-hoyre", venter: "kalender", ikke: "" };

function punktDato(p: any) {
  if (p.nr === 7 && p.okter.length) return p.okter.map((k: any) => `${k.dato.slice(8, 10)}.${k.dato.slice(5, 7)}`).join(" og ");
  return p.dato ? `${p.er_frist ? "Frist " : ""}${dato(p.dato)}` : "–";
}

function vis() {
  const o = d.oppstart;
  const hos = d.punkter.filter((p: any) => p.status === "venter" && p.ansvarlig === "kunden").map((p: any) => p.punkt.toLowerCase());
  settTittel(o.eier_navn, "Oppstart");
  settSidepille(o.status_navn ?? "", o.stopper.length ? "feil" : o.status === "ferdig" ? "ferdig" : "pagar");
  if (d.andre.length > 1) settFaner(d.andre.map((x: any) => ({ id: x.id, navn: x.eier_navn.replace(/ AS$/, ""), href: `/oppstart/${x.id}` })), o.id);
  const dager = o.dager_igjen > 0 ? `${o.dager_igjen} dager igjen` : o.dager_igjen === 0 ? "I dag" : `${-o.dager_igjen} dager siden`;
  const status = rad(120, [
    flis({ bredde: "1/3", tittel: "Oppstartsdato", innhold: html`<p class="k-statusverdi"><b>${dato(o.oppstartsdato)}</b> <span class="${o.dager_igjen < 0 ? "dempet" : "aksent-tekst"}">${dager}</span></p>` }),
    flis({ bredde: "1/3", tittel: "Avtale", innhold: html`<p class="k-statusverdi"><b>${o.avtale_nr ?? "–"}</b> <span class="dempet">Ansvarlig: ${o.ansvarlig}</span></p>` }),
    flis({ bredde: "1/3", tittel: "Fremdrift", innhold: html`<p class="k-statusverdi"><b>${o.ferdig} av ${o.av} ferdig</b></p>${fremdrift(o.ferdig, o.av)}` }),
  ]);
  const stopper = o.stopper.length ? rad("auto", [flis({ id: "stopper", tittel: "Stopper", teller: o.stopper.length, klasse: "stopper-flis", handling: html`<button class="knapp" type="button" id="paaminnelse">${raw(ikon("sendt", 18))}Send påminnelse</button>`,
    innhold: html`<div class="stopper-banner" role="alert"><span class="stopper-ikon">${raw(ikon("stoppet", 20))}</span><div>${o.stopper.map((s: any) => html`<b>Stopper: ${s.punkt}</b><p>${s.detalj ?? ""}</p>`)}${hos.length ? html`<p class="meta">Venter også på kunden: ${hos.join(", ")}.</p>` : ""}</div></div>` })]) : "";
  const sjekk = flis({ id: "sjekkliste", tittel: "Sjekkliste", teller: d.punkter.length, tittelverdi: "Klikk på status for å endre", innhold: html`<div id="lagre-feil"></div>${d.punkter.length ? html`<div class="tabellramme"><table class="tabell sjekkliste"><thead><tr><th class="ikon-kol"><span class="visuelt-skjult">Status</span></th><th>Punkt</th><th>Ansvarlig</th><th>Dato</th><th>Status</th></tr></thead><tbody>
        ${d.punkter.map((p: any) => html`<tr data-status="${p.status}"><td class="ikon-kol"><span class="statusprikk" data-status="${p.status}">${raw(STATUSIKON[p.status] ? ikon(STATUSIKON[p.status], 16) : "")}</span></td>
          <td class="punkt"><b>${p.nr}. ${p.punkt}</b>${p.detalj ? html`<span>${p.detalj}</span>` : ""}
            ${p.nr === 7 ? html`<div class="okter">${p.okter.map((k: any) => html`<div class="okt"><b>${k.navn}</b><span>${oktTid(k)}${k.sted ? ` · ${k.sted}` : ""}</span>${k.deltakere ? html`<span class="meta">Deltakere: ${k.deltakere}</span>` : ""}<button class="lukk-liten" type="button" data-slett-okt="${k.id}" aria-label="Slett økten">${raw(ikon("lukk", 16))}</button></div>`)}<button class="knapp tekst liten" type="button" data-ny-okt="${p.id}">${raw(ikon("pluss", 16))}Ny økt</button></div>` : ""}</td>
          <td><button class="ansvarlig-knapp" type="button" data-ansvarlig="${p.id}" aria-label="Endre ansvarlig for ${p.punkt}">${ansvarlig(p.ansvarlig, p.ansvarlig_navn)}</button></td>
          <td class="dato-celle"><button class="dato-knapp" type="button" data-dato="${p.id}">${punktDato(p)}</button></td>
          <td><button class="status-knapp" type="button" data-punkt="${p.id}" aria-haspopup="menu" aria-label="Status for ${p.punkt}: ${p.status_navn}. Klikk for å endre">${oppstartstatus(p.status, p.status_navn)}</button>${p.fra_avtale ? html`<span class="meta liten blokk">fra avtalen</span>` : ""}</td></tr>`)}
      </tbody></table></div>` : tom("Ingen sjekkliste ennå", "", html`<button class="knapp primar" type="button" disabled>Lag sjekkliste fra mal</button>`)}` });
  sett(rot, html`${status}${stopper}${rad("auto", [sjekk])}`);
  koble();
  settBredder(rot);
}

function visFeil(e: unknown) {
  const f = e instanceof ApiFeil ? e : new ApiFeil(0, "ADM-504", "Noe gikk galt.");
  sett(q("#lagre-feil", rot), `<div class="banner" role="alert">${ikon("stoppet", 18)}<div><b>Endringen ble ikke lagret.</b>${esc(f.message)} <span class="feilkode">Feilkode ${esc(f.kode)}.</span></div></div>`);
}
async function lagre(sti: string, kropp: unknown, metode = "PATCH") {
  try { await api(metode, sti, kropp); await last(); } catch (e) { visFeil(e); }
}

function statusMeny(knapp: HTMLElement, punktId: string) {
  q(".statusmeny")?.remove();
  const m = document.createElement("div");
  m.className = "statusmeny";
  m.setAttribute("role", "menu");
  m.innerHTML = d.statuser.map((s: any) => `<button type="button" role="menuitem" data-ny="${esc(s.id)}">${oppstartstatus(s.id, s.navn)}</button>`).join("");
  knapp.closest("td")!.append(m);
  (m.querySelector("button") as HTMLElement).focus();
  m.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>("[data-ny]"); if (b) { m.remove(); void lagre(`/api/oppstartspunkt/${punktId}`, { status: b.dataset.ny }); } });
  m.addEventListener("keydown", (e) => { if (e.key === "Escape") { m.remove(); knapp.focus(); } });
  setTimeout(() => document.addEventListener("click", function bort(e) { if (!m.contains(e.target as Node)) { m.remove(); document.removeEventListener("click", bort); } }), 0);
}

function koble() {
  qa<HTMLButtonElement>("[data-punkt]", rot).forEach((b) => b.addEventListener("click", () => statusMeny(b, b.dataset.punkt!)));
  qa<HTMLButtonElement>("[data-ansvarlig]", rot).forEach((b) => b.addEventListener("click", () => {
    const p = d.punkter.find((x: any) => x.id === b.dataset.ansvarlig);
    const neste = d.ansvarlige[(d.ansvarlige.findIndex((a: any) => a.id === p.ansvarlig) + 1) % d.ansvarlige.length];
    void lagre(`/api/oppstartspunkt/${p.id}`, { ansvarlig: neste.id });
  }));
  qa<HTMLButtonElement>("[data-dato]", rot).forEach((b) => b.addEventListener("click", async () => {
    const p = d.punkter.find((x: any) => x.id === b.dataset.dato);
    await skjemaDialog({ tittel: `${p.nr}. ${p.punkt}`, innhold: `<div class="felt-rad"><label class="felt"><span>Dato</span><input name="dato" type="date" value="${esc(p.dato ?? "")}" /></label><label class="felt"><span>Type</span><select name="er_frist"><option value="0"${p.er_frist ? "" : " selected"}>Dato</option><option value="1"${p.er_frist ? " selected" : ""}>Frist</option></select></label></div><label class="felt"><span>Detalj</span><textarea name="detalj" maxlength="1000" rows="3">${esc(p.detalj ?? "")}</textarea></label>`,
      send: async (x) => { await api("PATCH", `/api/oppstartspunkt/${p.id}`, { dato: x.dato || null, er_frist: x.er_frist, detalj: x.detalj }); } });
    await last();
  }));
  qa<HTMLButtonElement>("[data-ny-okt]", rot).forEach((b) => b.addEventListener("click", async () => {
    await skjemaDialog({ tittel: "Ny opplæringsøkt", innhold: `<label class="felt"><span>Navn</span><input name="navn" type="text" maxlength="120" placeholder="Opplæring 1: selgere" /></label><div class="felt-rad"><label class="felt"><span>Dato</span><input name="dato" type="date" /></label><label class="felt"><span>Fra</span><input name="fra" type="time" /></label><label class="felt"><span>Til</span><input name="til" type="time" /></label></div><label class="felt"><span>Sted</span><input name="sted" type="text" maxlength="200" /></label><label class="felt"><span>Deltakere</span><input name="deltakere" type="text" maxlength="500" /></label>`,
      send: async (x) => { await api("POST", `/api/oppstartspunkt/${b.dataset.nyOkt}/okter`, x); } });
    await last();
  }));
  qa<HTMLButtonElement>("[data-slett-okt]", rot).forEach((b) => b.addEventListener("click", () => lagre(`/api/opplaeringsokt/${b.dataset.slettOkt}`, undefined, "DELETE")));
  q("#paaminnelse", rot)?.addEventListener("click", async () => {
    try { const r = await api<{ punkter: string[] }>("POST", `/api/oppstart/${id}/paaminnelse`); toast(`Påminnelsen er logget på kunden (${r.punkter.length} punkt). E-post sendes ikke ennå.`); } catch (e) { visFeil(e); }
  });
}

async function last() {
  if (!d) sett(rot, html`${rad(120, ["Oppstartsdato", "Avtale", "Fremdrift"].map((t) => flis({ bredde: "1/3", tittel: t, innhold: laster() })))}${rad(480, [flis({ id: "sjekkliste", tittel: "Sjekkliste", innhold: laster() })])}`);
  try {
    // ?tilstand=feil viser feilen ved lagring (60-211); oppstarten hentes som vanlig
    const ny = await api("GET", `/api/oppstart/${id}`, undefined, { utenTilstand: tilstand() === "feil" });
    if (!ny?.oppstart) throw new ApiFeil(404, "ADM-404", "Oppstarten finnes ikke.");
    if (tilstand() === "tom") ny.punkter = [];
    d = ny;
    document.title = `Oppstart ${d.oppstart.eier_navn} · Hengsel Admin`;
    vis();
    if (tilstand() === "feil") visFeil(new ApiFeil(503, "ADM-504", "Serveren svarte ikke. Statusen står som før."));
  } catch (e) {
    if (d) { visFeil(e); return; }
    sett(rot, rad(320, [flis({ tittel: "Oppstart", innhold: html`${raw(feilbanner(e, e instanceof ApiFeil && e.status === 404 ? "Oppstarten finnes ikke." : "Kunne ikke hente oppstarten."))}<p><a href="/oppstart">Til oppstarter</a></p>` })]));
    q("#prov-igjen", rot)?.addEventListener("click", last);
  }
}
last();
