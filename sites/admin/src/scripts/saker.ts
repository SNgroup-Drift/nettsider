/**
 * SB1 Saker (K-259, 60-211), på kitet fra N-4 (K-469, 26-011 Støtte): status som faner med antall (regel 2e, ingen tallrad), én Tabell 1/1 «Saker»
 * med Prioritet ▾, Kilde ▾, Kunde ▾ og søk i tittelfeltet. Sortert forfalt først, så snart, så resten; svarfristen viser tid igjen, og forfalt står
 * med rød tekst og ramme, uten rødt fyll. Klikk åpner saken. Telefon: kort per sak i samme flis. Tilstander: tom (hvor saker kommer fra),
 * laster, feil (tabellen står som sist hentet), ingen treff. Filteret står i adressen (?status=…&prioritet=…&kilde=…&eier=…&sok=…).
 */
import { api, html, raw, q, sett, tilstand, feilbanner } from "../lib/dom";
void raw;
import { flis, rad, tabell, tabellHoyde, tom, laster, velger, sokFelt, settFaner, settSidepille, kobleKit } from "../lib/kit";
import { prioritet, frist, kilde, sakstatus, sist } from "../lib/support-ui";

const rot = q("#side")!;
const p = new URLSearchParams(location.search);
const filter = { status: p.get("status") ?? "apne", prioritet: p.get("prioritet") ?? "alle", kilde: p.get("kilde") ?? "alle", eier: p.get("eier") ?? "", sok: p.get("sok") ?? "" };

const STATUSVALG = [["apne", "Alle åpne"], ["ny", "Ny"], ["aapen", "Åpen"], ["venter", "Venter på kunde"], ["lost", "Løst"]];
const PRIOVALG = [["alle", "Alle"], ["kritisk", "Kritisk"], ["hoy", "Høy"], ["normal", "Normal"], ["lav", "Lav"]];
const KILDEVALG = [["alle", "Alle"], ["hjelp-crm", "«Hjelp» i CRM"], ["hjelp-ute", "«Hjelp» i Ute"], ["epost", "E-post"], ["telefon", "Telefon"]];
let sistData: any = null;

function adresse() {
  const u = new URLSearchParams();
  if (filter.status !== "apne") u.set("status", filter.status);
  if (filter.prioritet !== "alle") u.set("prioritet", filter.prioritet);
  if (filter.kilde !== "alle") u.set("kilde", filter.kilde);
  if (filter.eier) u.set("eier", filter.eier);
  if (filter.sok) u.set("sok", filter.sok);
  return u.toString();
}
const settAdresse = () => history.replaceState(null, "", `${location.pathname}${adresse() ? `?${adresse()}` : ""}`);

const rad1 = (s: any) => html`<tr data-lenke="/support/saker/${s.nr}" data-frist="${s.frist.tilstand}">
  <td>${prioritet(s.prioritet)}</td>
  <th scope="row" class="sak-emne"><a href="/support/saker/${s.nr}">${s.emne}</a><span>${s.nr}${s.kontakt_navn ? ` · ${s.kontakt_navn}` : ""}</span></th>
  <td class="to-linjer"><b>${s.eier_navn ?? "Ukjent kunde"}</b><span>${s.butikk_navn ?? ""}</span></td>
  <td>${kilde(s.kilde, s.kilde_navn)}</td>
  <td>${sakstatus(s.status)}</td>
  <td>${frist(s.frist)}</td>
  <td class="dempet">${sist(s.sist_aktivitet)}</td></tr>`;

const kort = (s: any) => html`<a class="sakkort" href="/support/saker/${s.nr}" data-frist="${s.frist.tilstand}">
  <span class="topp">${prioritet(s.prioritet)}<span class="nr">· ${s.nr}</span>${sakstatus(s.status)}</span>
  <b>${s.emne}</b>
  <span class="bunn"><span>${s.eier_navn ?? "Ukjent kunde"}${s.kontakt_navn ? ` · ${s.kontakt_navn}` : ""}</span>${frist(s.frist, true)}</span></a>`;

const medAntall = (valg: string[][], antall: Record<string, number> = {}, navn: string) =>
  valg.filter(([v]) => v !== "telefon" || antall[v]).map(([v, t]) => [v, v === "alle" ? `${navn} ▾` : `${t} (${antall[v] ?? 0})`] as [string, string]);

function vis(d: any | null, feil?: unknown) {
  const a = d?.antall ?? { status: {}, prioritet: {}, kilde: {} };
  settFaner(STATUSVALG.map(([id, navn]) => ({ id, navn, antall: d ? a.status[id] ?? 0 : undefined })), filter.status, (id) => { filter.status = id; settAdresse(); last(); });
  const kunder: [string, string][] = [["", "Kunde ▾"], ...((d?.kunder ?? []) as any[]).map((k) => [k.id, k.navn] as [string, string])];
  const verktoy = d?.totalt ? html`${velger("velg-prioritet", "Prioritet", medAntall(PRIOVALG, a.prioritet, "Prioritet"), filter.prioritet)}${velger("velg-kilde", "Kilde", medAntall(KILDEVALG, a.kilde, "Kilde"), filter.kilde)}${velger("velg-kunde", "Kunde", kunder, filter.eier)}${sokFelt("sakene")}` : "";
  const saker: any[] = d?.saker ?? [];
  const innhold = !d ? laster()
    : !d.totalt ? tom("Ingen saker ennå", "Saker kommer når en kunde trykker «Hjelp» i Hengsel CRM eller Hengsel Ute, eller når du lager en sak fra en e-post eller en telefon med «Ny sak».", html`<button class="knapp primar" type="button" data-ny-sak-tom>Ny sak</button>`)
    : !saker.length ? tom("Ingen treff", "Ingen saker passer med filteret.", html`<button class="knapp" type="button" id="nullstill">Vis alle åpne</button>`)
    : html`<div class="bare-pc">${tabell({ kompakt: saker.length <= 9, kolonner: [{ navn: "Prioritet", klasse: "smal" }, { navn: "Sak" }, { navn: "Kunde og butikk" }, { navn: "Kilde" }, { navn: "Status", klasse: "smal" }, { navn: "Svarfrist" }, { navn: "Sist", klasse: "smal" }], rader: saker.map(rad1) })}</div>
      <div class="sakkort-liste bare-telefon">${saker.map(kort)}</div>`;
  // Svarfristene per prioritet er ikke besluttet: «Eksempel» står som pille etter sidetittelen (60-211)
  settSidepille(d?.supportniva_eksempel ? "Eksempel – svarfrister" : "", "eksempel");
  const f = flis({ id: "saker", tittel: "Saker", teller: d ? saker.length : "", verktoy, innhold: html`${feil ? raw(feilbanner(feil, "Innboksen svarte ikke. Listen står som sist hentet.")) : ""}${innhold}` });
  sett(rot, rad(d && saker.length ? tabellHoyde(saker.length) : 320, [f]));
  koble();
}

function koble() {
  kobleKit(rot);
  const velg = (id: string, felt: keyof typeof filter) => q<HTMLSelectElement>(`#${id}`, rot)?.addEventListener("change", (e) => { (filter as any)[felt] = (e.target as HTMLSelectElement).value; settAdresse(); last(); });
  velg("velg-prioritet", "prioritet"); velg("velg-kilde", "kilde"); velg("velg-kunde", "eier");
  q("#nullstill", rot)?.addEventListener("click", () => { Object.assign(filter, { status: "apne", prioritet: "alle", kilde: "alle", eier: "", sok: "" }); history.replaceState(null, "", location.pathname); last(); });
  q("[data-ny-sak-tom]", rot)?.addEventListener("click", () => document.dispatchEvent(new CustomEvent("ny-sak")));
  q("#prov-igjen", rot)?.addEventListener("click", last);
}

const TOM = { totalt: 0, saker: [], apne: 0, forfalt: 0, kunder: [], antall: { status: {}, prioritet: {}, kilde: {} } };
async function last() {
  const t = tilstand();
  if (t === "tom") return vis(TOM);
  if (!sistData) vis(null);
  try { sistData = await api("GET", `/api/saker?${adresse()}`); vis(sistData); }
  catch (e) { vis(sistData ?? TOM, e); }
}
last();
document.addEventListener("sak-lagret", last);
