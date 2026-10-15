/**
 * Visningsbitene for Support og Oppstart (K-259, 60-210): prioritet som fire stolper og ord (ikke farge, 60-212 valg 5), svarfrist-merket
 * (snart: gul flate; forfalt: rød tekst, ikon og ring på hvit flate; pause: klokka står), kilde med ikon, statuspiller og timestolpen.
 * Bare klasser; fargene ligger i styles/support.css som variabler fra tokens.css.
 */
import { esc, raw, ikon, type Raa } from "./dom";
import { timer as timerTekst } from "./support.js";

export const PRIO_STOLPER: Record<string, number> = { kritisk: 4, hoy: 3, normal: 2, lav: 1 };
export const PRIO_NAVN: Record<string, string> = { kritisk: "Kritisk", hoy: "Høy", normal: "Normal", lav: "Lav" };
export const KILDE_IKON: Record<string, string> = { "hjelp-crm": "oversikt", "hjelp-ute": "montasje", epost: "sendt", telefon: "telefon" };
export const SAKSTATUS: Record<string, string> = { ny: "Ny", aapen: "Åpen", venter: "Venter på kunde", lost: "Løst" };

/** Prioritet: fire stolper der så mange som prioriteten er fylt, og ordet */
export function prioritet(p: string, medOrd = true): Raa {
  const n = PRIO_STOLPER[p] ?? 2;
  const stolper = [1, 2, 3, 4].map((i) => `<i${i <= n ? ' class="pa"' : ""}></i>`).join("");
  return raw(`<span class="prio" data-prio="${esc(p)}"><span class="stolper" aria-hidden="true">${stolper}</span>${medOrd ? `<span>${esc(PRIO_NAVN[p] ?? p)}</span>` : `<span class="visuelt-skjult">${esc(PRIO_NAVN[p] ?? p)}</span>`}</span>`);
}

/** Svarfrist-merket fra frist = { tilstand, tekst, kort } */
export function frist(f: { tilstand: string; tekst: string; kort?: string }, kort = false): Raa {
  const ikonNavn = f.tilstand === "pause" ? "kalender" : f.tilstand === "lost" ? "hake" : "frist";
  return raw(`<span class="frist-merke" data-tilstand="${esc(f.tilstand)}">${ikon(ikonNavn, 16)}<span>${esc(kort && f.kort ? f.kort : f.tekst)}</span></span>`);
}

export const kilde = (k: string, navn: string) => raw(`<span class="kilde">${ikon(KILDE_IKON[k] ?? "hjelp", 16)}<span>${esc(navn)}</span></span>`);
export const sakstatus = (s: string) => raw(`<span class="pille" data-sakstatus="${esc(s)}">${esc(SAKSTATUS[s] ?? s)}</span>`);
export const oppstartstatus = (s: string, navn: string) => raw(`<span class="pille" data-oppstart="${esc(s)}">${esc(navn)}</span>`);
export const ansvarlig = (a: string, navn: string) => raw(`<span class="ansvarlig" data-ansvarlig="${esc(a)}">${esc(navn)}</span>`);

/** Timer som «3,75 t» */
export const t = (min: number) => timerTekst(min);

/** Stolpe for brukt mot inkludert: grønn innenfor, lilla over (60-212 valg 10), strek ved inkludert */
export function timestolpe(inkludert: number, brukt: number): Raa {
  const maks = Math.max(inkludert, brukt, 1) * 1.15;
  const innenfor = Math.min(brukt, inkludert) / maks * 100;
  const over = Math.max(0, brukt - inkludert) / maks * 100;
  const merke = inkludert / maks * 100;
  const p = (x: number) => Math.round(x * 10) / 10;
  return raw(`<span class="timestolpe" role="img" aria-label="${esc(`${t(brukt)} brukt av ${t(inkludert)} inkludert`)}"><span class="innenfor" data-bredde="${p(innenfor)}"></span><span class="over" data-bredde="${p(over)}"></span><span class="inkl-strek" data-venstre="${p(merke)}"></span></span>`);
}

/** Fremdrift x av n som stolpe */
export function fremdrift(ferdig: number, av: number): Raa {
  const pst = av ? Math.round((ferdig / av) * 100) : 0;
  return raw(`<span class="fremdrift" role="img" aria-label="${ferdig} av ${av} ferdig"><span class="fylt" data-bredde="${pst}"></span></span>`);
}

/** Bredder og plassering settes med CSSOM etter innsetting (CSP tillater ikke style-attributter i markup) */
export function settBredder(rot: ParentNode = document) {
  rot.querySelectorAll<HTMLElement>("[data-bredde]").forEach((el) => { el.style.width = `${Number(el.dataset.bredde) || 0}%`; });
  rot.querySelectorAll<HTMLElement>("[data-venstre]").forEach((el) => { el.style.left = `${Number(el.dataset.venstre) || 0}%`; });
}

/** «HH:MM» i norsk tid */
export const klokke = (iso: string | null | undefined) => (iso ? new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "");
/** «14.10 08:05», eller bare klokka når det er i dag */
export function sist(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const dag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(d);
  const idag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  return dag === idag ? klokke(iso) : `${dag.slice(8, 10)}.${dag.slice(5, 7)} ${klokke(iso)}`;
}
export const datoTid = (iso: string | null | undefined) => { if (!iso) return ""; const dag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date(iso)); return `${dag.slice(8, 10)}.${dag.slice(5, 7)} ${klokke(iso)}`; };
