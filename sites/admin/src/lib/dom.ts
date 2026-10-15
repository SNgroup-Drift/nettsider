/**
 * Små hjelpere for sidene i Hengsel Admin (K-240): HTML-maler med escaping, norsk dato og beløp, og kall mot /api (samme Worker, bak Access).
 * Ingen tredjepart, ingen lagring utenom sessionStorage for søkeordet.
 */
import { kr as krOre } from "./pris.js";
import { ikon } from "./ikoner";

export { ikon };
export const kr = (ore: number | null | undefined) => (ore === null || ore === undefined ? "–" : krOre(ore));
export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
/** Mal-tag: ${verdi} escapes, ${raw(html)} settes inn uendret, lister settes sammen */
export class Raa { constructor(public html: string) {} toString() { return this.html; } }
export const raw = (s: string | Raa) => (s instanceof Raa ? s : new Raa(s));
/** html`…` gir Raa (ferdig markup) så nøstede maler og lister av maler settes inn uendret, mens vanlige verdier escapes */
export function html(deler: TemplateStringsArray, ...verdier: unknown[]): Raa {
  const inn = (v: unknown): string => (v instanceof Raa ? v.html : Array.isArray(v) ? v.map(inn).join("") : v === null || v === undefined || v === false ? "" : esc(v));
  return new Raa(deler.reduce((ut, del, i) => ut + inn(verdier[i - 1]) + del));
}
export const dato = (iso: string | null | undefined) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : iso ?? "–");
export const datoKort = (iso: string | null | undefined) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}` : iso ?? "");
export const tid = (iso: string | null | undefined) => { if (!iso) return ""; const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : `${dato(d.toISOString())} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
export const orgnr = (s: string | null | undefined) => (s && /^\d{9}$/.test(s) ? `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}` : s ?? "–");
export const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
export const KOLONNENAVN: Record<string, string> = { ny: "Ny", demo: "Demo avtalt", tilbud: "Tilbud sendt", forhandling: "Forhandling", signert: "Signert", tapt: "Tapt", kunde: "Kunde" };
export const AVTALESTATUS: Record<string, string> = { utkast: "Utkast", signering: "Til signering", signert: "Signert", fornyes_snart: "Fornyes snart", sagt_opp: "Sagt opp" };
export const TILBUDSTATUS: Record<string, string> = { utkast: "Utkast", sendt: "Sendt", erstattet: "Erstattet", akseptert: "Akseptert" };
export const PRISLISTESTATUS: Record<string, string> = { utkast: "Utkast", aktiv: "Aktiv", arkivert: "Arkivert" };
export const KILDER: Record<string, string> = { be_om_demo: "Be om demo", sigdal_kjedemote: "Sigdal-kjedemøte", anbefaling: "Anbefaling", messe: "Messe", import: "Import", annet: "Annet" };
export const AKTIVITET: Record<string, [string, string]> = { samtale: ["Samtale", "telefon"], mote: ["Møte", "mitt-team"], demo: ["Demo", "salgstavle"], epost: ["E-post", "sendt"], notat: ["Notat", "tilbud"] };
export const pille = (status: string, tekst?: string) => raw(`<span class="pille" data-status="${esc(status)}">${esc(tekst ?? KOLONNENAVN[status] ?? AVTALESTATUS[status] ?? status)}</span>`);
export const kjede = (k: string) => raw(`<span class="kjede" data-kjede="${esc(k)}">${k === "sigdal" ? "Sigdal" : "Uavhengig"}</span>`);
/** Neste steg med farge: forfalt (rød), i dag (aksent), senere (dempet) */
export function neste(tekst: string | null, datoIso: string | null, idag: string): Raa {
  if (!tekst || !datoIso) return raw("");
  const naar = datoIso < idag ? "forfalt" : datoIso === idag ? "i_dag" : "senere";
  const d = naar === "forfalt" ? `Forfalt ${datoKort(datoIso)}` : naar === "i_dag" ? "I dag" : datoKort(datoIso);
  return raw(`<span class="neste" data-naar="${naar}">${ikon(naar === "forfalt" ? "frist" : "kalender", 16)}<span>${esc(tekst)}</span><span class="dato">${d}</span></span>`);
}

export class ApiFeil extends Error { constructor(public status: number, public kode: string, melding: string, public felt: Record<string, string> = {}) { super(melding); } }
/** Kall mot API-et. Kaster ApiFeil med kode (ADM-401, ADM-403, ADM-404, ADM-504 …). ?tilstand=feil i adressen tvinger en feil (til skjermbilder). */
export async function api<T = any>(metode: string, sti: string, kropp?: unknown, { fil }: { fil?: File } = {}): Promise<T> {
  const t = tilstand();
  if (t === "feil") throw new ApiFeil(503, "ADM-504", "Databasen svarte ikke.");
  if (t === "laster") await new Promise(() => {});
  const hoder: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  if (fil) { body = new FormData(); (body as FormData).append("fil", fil); }
  else if (kropp !== undefined) { hoder["Content-Type"] = "application/json"; body = JSON.stringify(kropp); }
  let r: Response;
  try { r = await fetch(sti, { method: metode, headers: hoder, body, credentials: "same-origin" }); }
  catch { throw new ApiFeil(0, "ADM-504", "Fikk ikke kontakt med serveren."); }
  let data: any = null;
  try { data = await r.json(); } catch { /* tom */ }
  if (!r.ok) throw new ApiFeil(r.status, data?.kode ?? `ADM-${r.status}`, data?.melding ?? "Noe gikk galt.", data?.feil ?? {});
  return data as T;
}
/** ?tilstand=tom|laster|feil (bare til skjermbilder og testing av tilstandene) */
export const tilstand = () => new URLSearchParams(location.search).get("tilstand") ?? "";
export const q = <T extends HTMLElement = HTMLElement>(s: string, rot: ParentNode = document) => rot.querySelector<T>(s);
export const qa = <T extends HTMLElement = HTMLElement>(s: string, rot: ParentNode = document) => [...rot.querySelectorAll<T>(s)];
export function sett(el: HTMLElement | null, markup: string | Raa) { if (el) el.innerHTML = String(markup); }
export function toast(tekst: string, lenke?: { href: string; tekst: string }) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.innerHTML = `${ikon("hake", 18)}<span>${esc(tekst)}</span>${lenke ? ` <a href="${esc(lenke.href)}">${esc(lenke.tekst)}</a>` : ""}`;
  t.hidden = false;
  clearTimeout((t as any)._tid);
  (t as any)._tid = setTimeout(() => { t.hidden = true; }, 4000);
}
export const feilbanner = (e: unknown, tittel: string, provIgjenId = "prov-igjen") => {
  const f = e instanceof ApiFeil ? e : new ApiFeil(0, "ADM-504", (e as Error)?.message ?? "Ukjent feil");
  return `<div class="banner" role="alert">${ikon("stoppet", 20)}<div><b>${esc(tittel)}</b>${esc(f.message)} <span class="feilkode">Feilkode ${esc(f.kode)}.</span></div><button class="knapp liten" type="button" id="${provIgjenId}">Prøv igjen</button></div>`;
};
export const skjelett = (n: number, klasse = "kortet") => Array.from({ length: n }, () => `<div class="skjelett ${klasse}" aria-hidden="true"></div>`).join("");
export const idFraSti = () => decodeURIComponent(location.pathname.replace(/\/$/, "").split("/").pop() ?? "");
/** Les feltene i et skjema som objekt (tomme strenger beholdes) */
export const skjemaData = (f: HTMLFormElement) => Object.fromEntries([...new FormData(f).entries()].map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
export function visFeltfeil(f: HTMLFormElement, feil: Record<string, string>) {
  for (const el of qa("[aria-invalid]", f)) el.removeAttribute("aria-invalid");
  for (const el of qa(".felt .feil", f)) el.remove();
  for (const [navn, melding] of Object.entries(feil)) {
    const el = f.elements.namedItem(navn.split(".")[0]) as HTMLElement | null;
    if (!el) continue;
    el.setAttribute("aria-invalid", "true");
    const p = document.createElement("p"); p.className = "feil"; p.textContent = melding;
    el.closest(".felt")?.append(p);
  }
}

/** En liten dialog med et skjema. Returnerer feltene når «knapp» trykkes, null ved avbryt. send(data) kan kaste ApiFeil med felt; da vises feilene og dialogen står. */
export function skjemaDialog({ tittel, innhold, knapp = "Lagre", bred = false, send }: { tittel: string; innhold: string; knapp?: string; bred?: boolean; send?: (data: Record<string, string>, form: HTMLFormElement) => Promise<unknown | false> }): Promise<Record<string, string> | null> {
  return new Promise((los) => {
    const d = document.createElement("dialog");
    if (bred) d.className = "bred";
    d.innerHTML = `<form method="dialog" novalidate><h2>${esc(tittel)}<button class="lukk" type="button" data-lukk aria-label="Lukk">${ikon("lukk", 20)}</button></h2>${innhold}<div class="knapper"><button class="knapp" type="button" data-lukk>Avbryt</button><button class="knapp primar" type="submit" data-send>${esc(knapp)}</button></div></form>`;
    document.body.append(d);
    const form = d.querySelector("form") as HTMLFormElement;
    const ferdig = (v: Record<string, string> | null) => { d.close(); d.remove(); los(v); };
    qa("[data-lukk]", d).forEach((b) => b.addEventListener("click", () => ferdig(null)));
    d.addEventListener("cancel", (e) => { e.preventDefault(); ferdig(null); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = skjemaData(form) as Record<string, string>;
      const sendKnapp = q<HTMLButtonElement>("[data-send]", form)!;
      if (!send) return ferdig(data);
      sendKnapp.disabled = true;
      try { const r = await send(data, form); if (r === false) { sendKnapp.disabled = false; q(".banner", form)?.remove(); return; } ferdig(data); }
      catch (err) {
        const f = err instanceof ApiFeil ? err : new ApiFeil(0, "ADM-504", (err as Error)?.message ?? "Noe gikk galt.");
        visFeltfeil(form, Object.keys(f.felt).length ? f.felt : {});
        let b = q(".banner", form); if (!b) { b = document.createElement("div"); b.className = "banner"; b.setAttribute("role", "alert"); form.querySelector("h2")!.after(b); }
        b.innerHTML = `${ikon("stoppet", 18)}<div>${esc(f.message)} <span class="feilkode">${esc(f.kode)}</span></div>`;
        sendKnapp.disabled = false;
      }
    });
    d.showModal();
    (d.querySelector("input, select, textarea") as HTMLElement | null)?.focus();
  });
}
/** Dialogen «Marker … som tapt» (SA2) / «Ikke aktuell» (SA4): grunn er påkrevd, knappen er av til en grunn er valgt. Returnerer { tap_grunn, tap_merknad } eller null. */
export function taptDialog(navn: string, grunner: string[]): Promise<{ tap_grunn: string; tap_merknad: string } | null> {
  return new Promise((los) => {
    const d = document.createElement("dialog");
    d.innerHTML = `<form method="dialog" novalidate><h2>Marker ${esc(navn)} som tapt<button class="lukk" type="button" data-lukk aria-label="Lukk">${ikon("lukk", 20)}</button></h2>
      <p class="meta">Grunnen må fylles ut. Den brukes i rapporten over tapte salg.</p>
      <div class="valg" role="radiogroup" aria-label="Grunn">${grunner.map((g) => `<label><input type="radio" name="tap_grunn" value="${esc(g)}" />${esc(g)}</label>`).join("")}</div>
      <label class="felt"><span>Merknad (valgfri)</span><input name="tap_merknad" type="text" maxlength="500" /></label>
      <div class="knapper"><button class="knapp" type="button" data-lukk>Avbryt</button><button class="knapp primar" type="submit" data-send disabled>Flytt til Tapt</button></div></form>`;
    document.body.append(d);
    const form = d.querySelector("form") as HTMLFormElement;
    const ferdig = (v: { tap_grunn: string; tap_merknad: string } | null) => { d.close(); d.remove(); los(v); };
    qa("[data-lukk]", d).forEach((b) => b.addEventListener("click", () => ferdig(null)));
    d.addEventListener("cancel", (e) => { e.preventDefault(); ferdig(null); });
    form.addEventListener("change", () => { q<HTMLButtonElement>("[data-send]", form)!.disabled = !(form.elements.namedItem("tap_grunn") as RadioNodeList).value; });
    form.addEventListener("submit", (e) => { e.preventDefault(); const dta = skjemaData(form) as Record<string, string>; if (dta.tap_grunn) ferdig({ tap_grunn: dta.tap_grunn, tap_merknad: dta.tap_merknad ?? "" }); });
    d.showModal();
  });
}
export const NY_EIER_FELTER = `
  <label class="felt"><span>Eier (selskap)</span><input name="navn" type="text" maxlength="120" required /></label>
  <div class="felt-rad">
    <label class="felt"><span>Org.nr.</span><input name="orgnr" type="text" inputmode="numeric" maxlength="11" placeholder="9 siffer" /></label>
    <label class="felt"><span>Kjede</span><select name="kjede"><option value="annen">Uavhengig</option><option value="sigdal">Sigdal</option></select></label>
    <label class="felt"><span>Produktlinje</span><select name="produktlinje"><option value="hengsel">Hengsel</option><option value="sigdal">Sigdal CRM</option></select></label>
  </div>
  <div class="felt-rad">
    <label class="felt"><span>Adresse</span><input name="adresse" type="text" maxlength="200" /></label>
    <label class="felt"><span>Postnr.</span><input name="postnr" type="text" maxlength="10" /></label>
    <label class="felt"><span>Sted</span><input name="sted" type="text" maxlength="100" /></label>
    <label class="felt"><span>Fylke</span><input name="fylke" type="text" maxlength="60" /></label>
  </div>
  <div class="felt-rad">
    <label class="felt"><span>Kilde</span><select name="kilde"><option value="annet">Annet</option><option value="sigdal_kjedemote">Sigdal-kjedemøte</option><option value="anbefaling">Anbefaling</option><option value="messe">Messe</option><option value="be_om_demo">Be om demo</option></select></label>
    <label class="felt"><span>Kontaktperson</span><input name="kontakt_navn" type="text" maxlength="120" /></label>
    <label class="felt"><span>Kontakt e-post</span><input name="kontakt_epost" type="email" maxlength="254" /></label>
  </div>`;
export async function nyEierDialog(): Promise<string | null> {
  let id: string | null = null;
  const r = await skjemaDialog({ tittel: "Ny eier", innhold: NY_EIER_FELTER, knapp: "Lagre eier", bred: true, send: async (d) => {
    const kropp: Record<string, unknown> = { navn: d.navn, orgnr: d.orgnr, kjede: d.kjede, produktlinje: d.produktlinje, adresse: d.adresse, postnr: d.postnr, sted: d.sted, fylke: d.fylke, kilde: d.kilde, status: "ny" };
    if (d.kontakt_navn) kropp.kontakter = [{ navn: d.kontakt_navn, epost: d.kontakt_epost || undefined, primaer: 1, signaturrett: 1 }];
    id = (await api<{ id: string }>("POST", "/api/eiere", kropp)).id;
  } });
  return r ? id : null;
}
