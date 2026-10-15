/**
 * SB1 Saker (K-259, 60-211): liste med filter (status, prioritet, kilde, kunde) og antall per valg, sortert forfalt først, så snart, så resten.
 * Klikk åpner saken. Telefon: kort per sak med filterbrikker øverst. Tilstander: tom (hvor saker kommer fra), laster (grå rader), feil
 * (banner, listen står), ingen treff. Filteret står i adressen (?status=…&prioritet=…&kilde=…&eier=…&sok=…).
 */
import { api, html, raw, q, qa, sett, skjelett, tilstand, feilbanner, ikon, esc } from "../lib/dom";
import { prioritet, frist, kilde, sakstatus, sist } from "../lib/support-ui";

const rot = q("#side")!;
const p = new URLSearchParams(location.search);
const filter = { status: p.get("status") ?? "apne", prioritet: p.get("prioritet") ?? "alle", kilde: p.get("kilde") ?? "alle", eier: p.get("eier") ?? "", sok: p.get("sok") ?? "" };
const sok = q<HTMLInputElement>("#sok");
if (sok && filter.sok) sok.value = filter.sok;

const STATUSVALG = [["apne", "Alle åpne"], ["ny", "Ny"], ["aapen", "Åpen"], ["venter", "Venter på kunde"], ["lost", "Løst"]];
const PRIOVALG = [["alle", "Alle"], ["kritisk", "Kritisk"], ["hoy", "Høy"], ["normal", "Normal"], ["lav", "Lav"]];
const KILDEVALG = [["alle", "Alle"], ["hjelp-crm", "«Hjelp» i CRM"], ["hjelp-ute", "«Hjelp» i Ute"], ["epost", "E-post"], ["telefon", "Telefon"]];
let sist_data: any = null;

function adresse() {
  const u = new URLSearchParams();
  if (filter.status !== "apne") u.set("status", filter.status);
  if (filter.prioritet !== "alle") u.set("prioritet", filter.prioritet);
  if (filter.kilde !== "alle") u.set("kilde", filter.kilde);
  if (filter.eier) u.set("eier", filter.eier);
  if (filter.sok) u.set("sok", filter.sok);
  return u.toString();
}

const chips = (navn: string, felt: keyof typeof filter, valg: string[][], antall: Record<string, number>) => html`<div class="chips" role="group" aria-label="${navn}"><span class="navn">${navn}</span>
  ${valg.filter(([v]) => v !== "telefon" || antall[v]).map(([v, t]) => html`<button type="button" class="chip" data-felt="${felt}" data-verdi="${v}" aria-pressed="${String(filter[felt] === v)}">${t} <span class="tall">${antall[v] ?? 0}</span></button>`)}</div>`;

function hode(d: any | null) {
  const under = d ? html`${d.apne} åpne${d.forfalt ? raw(` · <b class="forfalt-tekst">${d.forfalt} forfalt</b>`) : ""} · svarfrist etter supportnivå${d.supportniva_eksempel ? " (eksempel)" : ""}` : html`Henter saker …`;
  const kunder = d?.kunder ?? [];
  return html`<header class="sidehode"><div><h1>Saker</h1><p class="under">${under}</p></div>
    <label class="velger"><span>Kunde</span><select id="velg-kunde"><option value="">Alle kunder</option>${kunder.map((k: any) => html`<option value="${k.id}" ${raw(filter.eier === k.id ? "selected" : "")}>${k.navn}</option>`)}</select></label></header>`;
}

const rad = (s: any) => html`<tr data-lenke="/support/saker/${s.nr}" data-frist="${s.frist.tilstand}">
  <td>${prioritet(s.prioritet)}</td>
  <td class="sak-emne"><a href="/support/saker/${s.nr}">${s.emne}</a><span>${s.nr}${s.kontakt_navn ? ` · ${s.kontakt_navn}` : ""}</span></td>
  <td class="to-linjer"><b>${s.eier_navn ?? "Ukjent kunde"}</b><span>${s.butikk_navn ?? ""}</span></td>
  <td>${kilde(s.kilde, s.kilde_navn)}</td>
  <td>${sakstatus(s.status)}</td>
  <td>${frist(s.frist)}</td>
  <td class="dempet">${sist(s.sist_aktivitet)}</td></tr>`;

const kort = (s: any) => html`<a class="sakkort" href="/support/saker/${s.nr}" data-frist="${s.frist.tilstand}">
  <span class="topp">${prioritet(s.prioritet)}<span class="nr">· ${s.nr}</span>${sakstatus(s.status)}</span>
  <b>${s.emne}</b>
  <span class="bunn"><span>${s.eier_navn ?? "Ukjent kunde"}${s.kontakt_navn ? ` · ${s.kontakt_navn}` : ""}</span>${frist(s.frist, true)}</span></a>`;

function vis(d: any, feil?: unknown) {
  const filtre = html`<div class="filtre">${chips("Status", "status", STATUSVALG, d.antall.status)}${chips("Prioritet", "prioritet", PRIOVALG, d.antall.prioritet)}${chips("Kilde", "kilde", KILDEVALG, d.antall.kilde)}</div>`;
  const telefonFiltre = html`<div class="chips bare-telefon" role="group" aria-label="Status">${[["apne", "Åpne", d.antall.status.apne], ["ny", "Ny", d.antall.status.ny], ["venter", "Venter", d.antall.status.venter], ["lost", "Løst", d.antall.status.lost]].map(([v, t, n]) => html`<button type="button" class="chip" data-felt="status" data-verdi="${v}" aria-pressed="${String(filter.status === v)}">${t} <span class="tall">${n}</span></button>`)}</div>`;
  let liste;
  if (!d.totalt) liste = html`<div class="kort tom">${raw(ikon("innboks", 32))}<b>Ingen saker ennå</b><span>Saker kommer når en kunde trykker «Hjelp» i Hengsel CRM eller Hengsel Ute, eller når du lager en sak fra en e-post eller en telefon med «Ny sak».</span><div class="handlinger"><button class="knapp primar" type="button" data-ny-sak-tom>${raw(ikon("pluss", 18))}Ny sak</button></div></div>`;
  else if (!d.saker.length) liste = html`<div class="kort tom">${raw(ikon("sok", 32))}<b>Ingen treff</b><span>Ingen saker passer med filteret.</span><div class="handlinger"><button class="knapp" type="button" id="nullstill">Vis alle åpne</button></div></div>`;
  else liste = html`<div class="kort uten-pad bare-pc"><div class="tabellramme"><table class="tabell saktabell"><thead><tr><th>Prioritet</th><th>Sak</th><th>Kunde og butikk</th><th>Kilde</th><th>Status</th><th>Svarfrist</th><th>Sist</th></tr></thead><tbody>${d.saker.map(rad)}</tbody></table></div></div>
    <div class="sakkort-liste bare-telefon">${d.saker.map(kort)}</div>`;
  sett(rot, html`${hode(d)}${feil ? raw(feilbanner(feil, "Innboksen svarte ikke. Listen står som sist hentet.")) : ""}${raw(d.totalt ? String(filtre) : "")}${raw(d.totalt ? String(telefonFiltre) : "")}${liste}`);
  koble();
}

function koble() {
  qa<HTMLButtonElement>(".chip[data-felt]", rot).forEach((b) => b.addEventListener("click", () => { (filter as any)[b.dataset.felt!] = b.dataset.verdi!; history.replaceState(null, "", `${location.pathname}${adresse() ? `?${adresse()}` : ""}`); last(); }));
  q<HTMLSelectElement>("#velg-kunde", rot)?.addEventListener("change", (e) => { filter.eier = (e.target as HTMLSelectElement).value; history.replaceState(null, "", `${location.pathname}${adresse() ? `?${adresse()}` : ""}`); last(); });
  q("#nullstill", rot)?.addEventListener("click", () => { Object.assign(filter, { status: "apne", prioritet: "alle", kilde: "alle", eier: "", sok: "" }); if (sok) sok.value = ""; history.replaceState(null, "", location.pathname); last(); });
  q("[data-ny-sak-tom]", rot)?.addEventListener("click", () => document.dispatchEvent(new CustomEvent("ny-sak")));
  qa<HTMLTableRowElement>("tr[data-lenke]", rot).forEach((tr) => tr.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; location.href = tr.dataset.lenke!; }));
  q("#prov-igjen", rot)?.addEventListener("click", last);
}

const TOM = { totalt: 0, saker: [], apne: 0, forfalt: 0, kunder: [], antall: { status: {}, prioritet: {}, kilde: {} } };
async function last() {
  const t = tilstand();
  if (t === "tom") return vis(TOM);
  if (!sist_data) sett(rot, html`${hode(null)}<div class="kort uten-pad">${raw(skjelett(6, "rad"))}</div>`);
  try { sist_data = await api("GET", `/api/saker?${adresse()}`); vis(sist_data); }
  catch (e) { if (sist_data) vis(sist_data, e); else { sett(rot, html`${hode(null)}${raw(feilbanner(e, "Innboksen svarte ikke. Listen står som sist hentet."))}<div class="kort uten-pad">${raw(skjelett(4, "rad"))}</div>`); q("#prov-igjen", rot)?.addEventListener("click", last); } }
}
last();
void esc;
