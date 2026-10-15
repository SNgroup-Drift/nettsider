/**
 * Regnereglene for Support og Oppstart i Hengsel Admin fase B (K-259, 60-211, 60-212). Rene funksjoner uten database, brukt i Workeren
 * (worker/api-support.js, worker/api-oppstart.js), i nettleseren og i testene. Ingen tall er bestemt her: frister, arbeidstid, timepris og
 * føringsenhet kommer fra innstillingene (merket «Eksempel» til Eirik har bestemt dem).
 *
 * Svarfrist (60-212 valg 3): regnes i arbeidstid (standard hverdager 08–16, norsk tid) fra saken ble opprettet, og står stille mens saken
 * venter på kunden. «Snart» = 25 % eller mindre igjen. 1 virkedag = én arbeidsdag (8 t med standard arbeidstid). Helligdager er ikke med.
 */

export const PRIORITETER = ["kritisk", "hoy", "normal", "lav"];
export const PRIORITETSNAVN = { kritisk: "Kritisk", hoy: "Høy", normal: "Normal", lav: "Lav" };
export const STATUSER = ["ny", "aapen", "venter", "lost"];
export const STATUSNAVN = { ny: "Ny", aapen: "Åpen", venter: "Venter på kunde", lost: "Løst" };
/** Kunden ser andre navn (60-212 valg 13) */
export const KUNDESTATUS = { ny: "Ny", aapen: "Under arbeid", venter: "Venter på deg", lost: "Løst" };
export const KILDER = ["hjelp-crm", "hjelp-ute", "epost", "telefon"];
export const KILDENAVN = { "hjelp-crm": "«Hjelp» i CRM", "hjelp-ute": "«Hjelp» i Ute", epost: "E-post", telefon: "Telefon" };
export const MELDINGSTYPER = ["kunde", "svar", "intern"];

/** Standard supportnivå (Eksempel, 60-212 spørsmål 3). Lagres i innstilling «supportniva». */
export const STANDARD_SUPPORTNIVA = {
  frister: { kritisk: { min: 60, tekst: "1 time" }, hoy: { min: 240, tekst: "4 timer" }, normal: { virkedager: 1, tekst: "1 virkedag" }, lav: { virkedager: 3, tekst: "3 virkedager" } },
  arbeidstid: { fra: "08:00", til: "16:00", dager: [1, 2, 3, 4, 5] },
};

// ── Norsk tid uten bibliotek ─────────────────────────────────────────────────────────────────────────────────────────────────
const FMT = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", weekday: "short" });
const UKEDAG = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Delene av et tidspunkt i norsk tid: { y, m, d, h, min, s, ukedag (1 = mandag) } */
export function osloDeler(t) {
  const o = {};
  for (const p of FMT.formatToParts(new Date(t))) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute, s: +o.second, ukedag: UKEDAG[o.weekday] };
}
/** Tidspunkt (ms) for en norsk veggklokke-tid */
export function fraOslo(y, m, d, h = 0, min = 0) {
  const gjett = Date.UTC(y, m - 1, d, h, min);
  const forskyv = (t) => { const p = osloDeler(t); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(t / 1000) * 1000; };
  let t = gjett - forskyv(gjett);
  t = gjett - forskyv(t);
  return t;
}
const klokke = (s) => { const [h, m] = String(s).split(":").map(Number); return h * 60 + (m || 0); };

function normaliserArbeidstid(a = STANDARD_SUPPORTNIVA.arbeidstid) {
  const fra = klokke(a.fra ?? "08:00"), til = klokke(a.til ?? "16:00");
  const dager = Array.isArray(a.dager) && a.dager.length ? a.dager.map(Number) : [1, 2, 3, 4, 5];
  if (!(til > fra)) throw new Error("Arbeidstiden må slutte etter at den starter.");
  return { fra, til, dager, lengde: til - fra };
}

/** Minutter i én arbeidsdag (8 t = 480 med standard arbeidstid) */
export const arbeidsdag = (arbeidstid) => normaliserArbeidstid(arbeidstid).lengde;

/** Neste tidspunkt i arbeidstid fra t (t selv hvis den er i arbeidstid). Returnerer { t, igjenIDag } */
function tilArbeidstid(t, a) {
  for (let i = 0; i < 400; i++) {
    const p = osloDeler(t);
    const naaMin = p.h * 60 + p.min;
    if (a.dager.includes(p.ukedag) && naaMin < a.til) {
      if (naaMin >= a.fra) return { t, igjenIDag: a.til - naaMin - p.s / 60 };
      return { t: fraOslo(p.y, p.m, p.d, 0, a.fra), igjenIDag: a.lengde };
    }
    const neste = new Date(Date.UTC(p.y, p.m - 1, p.d + 1));
    t = fraOslo(neste.getUTCFullYear(), neste.getUTCMonth() + 1, neste.getUTCDate(), 0, a.fra);
  }
  throw new Error("Fant ingen arbeidstid.");
}

/** start + minutter arbeidstid. Negative minutter: like mange minutter (vanlig tid) før start, så en forfalt frist forblir forfalt. */
export function leggTilArbeidsminutter(start, minutter, arbeidstid) {
  const a = normaliserArbeidstid(arbeidstid);
  let t = new Date(start).getTime();
  if (minutter < 0) return new Date(t + minutter * 60_000).toISOString();
  let igjen = minutter;
  for (let i = 0; i < 2000; i++) {
    const s = tilArbeidstid(t, a);
    if (igjen <= s.igjenIDag) return new Date(s.t + igjen * 60_000).toISOString();
    igjen -= s.igjenIDag;
    t = s.t + s.igjenIDag * 60_000;
  }
  throw new Error("For lang frist.");
}

/** Arbeidsminutter fra a til b. Negativt når b er før a. */
export function arbeidsminutterMellom(fra, til, arbeidstid) {
  const a0 = new Date(fra).getTime(), b0 = new Date(til).getTime();
  if (b0 < a0) return -arbeidsminutterMellom(til, fra, arbeidstid);
  const a = normaliserArbeidstid(arbeidstid);
  let t = a0, sum = 0;
  for (let i = 0; i < 5000 && t < b0; i++) {
    const s = tilArbeidstid(t, a);
    if (s.t >= b0) break;
    const slutt = s.t + s.igjenIDag * 60_000;
    sum += (Math.min(slutt, b0) - s.t) / 60_000;
    t = slutt;
  }
  return Math.round(sum);
}

/** Fristen for en prioritet i arbeidsminutter, med teksten («4 timer») */
export function fristFor(prioritet, nivaa = STANDARD_SUPPORTNIVA) {
  const f = nivaa?.frister?.[prioritet] ?? STANDARD_SUPPORTNIVA.frister[prioritet];
  if (!f) throw new Error(`Ukjent prioritet: ${prioritet}`);
  const min = f.min != null ? Number(f.min) : Number(f.virkedager) * arbeidsdag(nivaa?.arbeidstid);
  return { min, tekst: f.tekst ?? `${min} min` };
}

/** Svarfristen som tidspunkt for en sak opprettet ved «opprettet» */
export function beregnSvarfrist(opprettet, prioritet, nivaa = STANDARD_SUPPORTNIVA) {
  return leggTilArbeidsminutter(opprettet, fristFor(prioritet, nivaa).min, nivaa?.arbeidstid);
}

/**
 * Statusbytte og fristen. «venter» stopper klokka (frist_stoppet = nå, frist_igjen_min = arbeidsminutter som var igjen). Ut av «venter»
 * starter den igjen med det som var igjen. «lost» setter løst tid; gjenåpnes en løst sak, får den ny frist fra nå.
 * @returns felt som skal lagres på saken
 */
export function byttStatus(sak, ny, naaIso, nivaa = STANDARD_SUPPORTNIVA) {
  if (!STATUSER.includes(ny)) throw new Error(`Ukjent status: ${ny}`);
  const a = nivaa?.arbeidstid;
  const ut = { status: ny, svarfrist: sak.svarfrist, frist_stoppet: sak.frist_stoppet ?? null, frist_igjen_min: sak.frist_igjen_min ?? null, lost_tid: sak.lost_tid ?? null };
  if (sak.status === ny) return ut;
  if (ny === "venter") {
    if (sak.status !== "lost") { ut.frist_stoppet = naaIso; ut.frist_igjen_min = arbeidsminutterMellom(naaIso, sak.svarfrist, a); }
    ut.lost_tid = null;
    return ut;
  }
  if (sak.status === "venter" && sak.frist_igjen_min != null) ut.svarfrist = leggTilArbeidsminutter(naaIso, Number(sak.frist_igjen_min), a);
  if (sak.status === "lost" && ny !== "lost") ut.svarfrist = beregnSvarfrist(naaIso, sak.prioritet, nivaa);
  ut.frist_stoppet = null; ut.frist_igjen_min = null;
  ut.lost_tid = ny === "lost" ? naaIso : null;
  return ut;
}

/** «42 min», «1 t 45 min», «1 d 4 t» (d = arbeidsdag) */
export function varighet(min, dag = 480) {
  const m = Math.max(0, Math.round(Math.abs(min)));
  if (m < 60) return `${m} min`;
  if (m < dag) { const t = Math.floor(m / 60), r = m % 60; return r ? `${t} t ${r} min` : `${t} t`; }
  const d = Math.floor(m / dag), t = Math.floor((m % dag) / 60);
  return t ? `${d} d ${t} t` : `${d} d`;
}

/**
 * Hvordan svarfristen står nå: ok | snart (≤ 25 % igjen) | forfalt | pause (venter på kunde) | lost.
 * @returns {{ tilstand: string, igjen_min: number|null, tekst: string, kort: string }}
 */
export function fristTilstand(sak, naaIso, nivaa = STANDARD_SUPPORTNIVA) {
  const dag = arbeidsdag(nivaa?.arbeidstid);
  if (sak.status === "lost") return { tilstand: "lost", igjen_min: null, tekst: "Løst", kort: "Løst" };
  if (sak.status === "venter") return { tilstand: "pause", igjen_min: sak.frist_igjen_min ?? null, tekst: "Pause, venter på kunden", kort: "Pause" };
  const igjen = arbeidsminutterMellom(naaIso, sak.svarfrist, nivaa?.arbeidstid);
  if (igjen < 0 || (igjen === 0 && new Date(naaIso) >= new Date(sak.svarfrist))) {
    return { tilstand: "forfalt", igjen_min: igjen, tekst: `Forfalt ${varighet(-igjen, dag)}`, kort: `Forfalt ${varighet(-igjen, dag)}` };
  }
  const total = fristFor(sak.prioritet, nivaa).min;
  return { tilstand: igjen <= total * 0.25 ? "snart" : "ok", igjen_min: igjen, tekst: `${varighet(igjen, dag)} igjen`, kort: varighet(igjen, dag) };
}

const RANG = { forfalt: 0, snart: 1, ok: 2, pause: 3, lost: 4 };
/** Sortering i SB1: forfalt først (mest forfalt øverst), så snart, så resten etter frist; venter og løst til slutt */
export function sorterSaker(saker) {
  return [...saker].sort((a, b) => (RANG[a.frist.tilstand] - RANG[b.frist.tilstand])
    || (a.frist.tilstand === "lost" ? String(b.lost_tid).localeCompare(String(a.lost_tid)) : (a.frist.igjen_min ?? 0) - (b.frist.igjen_min ?? 0))
    || String(a.svarfrist).localeCompare(String(b.svarfrist)));
}

// ── Tidsføring ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Påbegynte enheter (standard 15 min): 1–15 → 15, 16–30 → 30. 0 eller mindre gir 0. */
export function avrundKvarter(minutter, enhet = 15) {
  const m = Number(minutter);
  if (!Number.isFinite(m) || m <= 0) return 0;
  return Math.ceil(Math.ceil(m - 1e-9) / enhet) * enhet;
}
/** Tidtaker: sekunder mellom start og stopp, rundet opp til påbegynte enheter */
export function tidtakerMinutter(startIso, stoppIso, enhet = 15) {
  const sek = (new Date(stoppIso).getTime() - new Date(startIso).getTime()) / 1000;
  return avrundKvarter(sek / 60, enhet);
}
/** Timer med komma: 225 min → «3,75 t» */
export const timer = (min) => `${(Math.round((min / 60) * 100) / 100).toString().replace(".", ",")} t`;

/**
 * Inkluderte timer per måned (60-211 SB3, 60-212 valg 7): sum av support_timer for pakken til hver butikk, fra prislisten.
 * Status: under | grense (≥ 90 %) | over. Over: (brukt − inkludert) × timepris blir en fakturalinje neste måned.
 */
export function timerStatus({ inkludert_min, brukt_min, timepris_ore = null }) {
  const over_min = Math.max(0, brukt_min - inkludert_min);
  const status = over_min > 0 ? "over" : inkludert_min > 0 && brukt_min >= inkludert_min * 0.9 ? "grense" : "under";
  const igjen_min = Math.max(0, inkludert_min - brukt_min);
  return { status, over_min, igjen_min, belop_ore: timepris_ore == null ? null : Math.round((over_min / 60) * timepris_ore) };
}

// ── Svarmaler og kundevisning ───────────────────────────────────────────────────────────────────────────────────────────────
/** Fyller {fornavn}, {svarfrist} og {lenke} i en svarmal */
export function fyllMal(tekst, { fornavn = "", svarfrist = "", lenke = "" } = {}) {
  return String(tekst).replace(/\{fornavn\}/g, fornavn).replace(/\{svarfrist\}/g, svarfrist).replace(/\{lenke\}/g, lenke).replace(/Hei \./g, "Hei.");
}

/**
 * Det kunden får se av en sak (e-post og senere «Mine saker» i CRM/Ute). Interne notater tas ALDRI med, og hjelp-data og frist-internt
 * holdes utenfor. Brukes av e-postutkastet og testene.
 */
export function kundeVisning(sak, meldinger) {
  return {
    nr: sak.nr, emne: sak.emne, status: KUNDESTATUS[sak.status] ?? sak.status, opprettet: sak.opprettet,
    meldinger: meldinger.filter((m) => m.type === "kunde" || m.type === "svar").map((m) => ({ fra: m.type === "svar" ? "Hengsel support" : m.hvem, tid: m.tid, tekst: m.tekst })),
  };
}

// ── Oppstart ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const OPPSTARTSTATUSER = ["ikke", "igang", "venter", "stopper", "ferdig"];
export const OPPSTARTSTATUSNAVN = { ikke: "Ikke startet", igang: "I gang", venter: "Venter på kunden", stopper: "Stopper", ferdig: "Ferdig" };
export const ANSVARLIGE = ["eirik", "code", "kunden"];
export const ANSVARLIGNAVN = { eirik: "Eirik", code: "Code", kunden: "Kunden" };
/** Den faste lista på ni punkter (60-211 SO1). Ligger også i migreringen som innstilling «oppstart_punkter». */
export const OPPSTARTSPUNKTER = [
  { nr: 1, punkt: "Avtale signert", ansvarlig: "kunden" },
  { nr: 2, punkt: "Kundemiljø opprettet", ansvarlig: "code" },
  { nr: 3, punkt: "Microsoft-godkjenning hos kunden", ansvarlig: "kunden" },
  { nr: 4, punkt: "Tema og logo", ansvarlig: "eirik" },
  { nr: 5, punkt: "Import av åpne tilbud og ordre", ansvarlig: "code" },
  { nr: 6, punkt: "Brukere opprettet", ansvarlig: "eirik" },
  { nr: 7, punkt: "Opplæring 1 og 2", ansvarlig: "eirik" },
  { nr: 8, punkt: "Lagt i utrullingslista", ansvarlig: "code" },
  { nr: 9, punkt: "Første faktura klar", ansvarlig: "eirik" },
];

/**
 * Status for en oppstart, beregnet fra punktene (lagres ikke): ferdig når alle er ferdige, stopper når ett stopper, i gang når noe er
 * påbegynt, ellers ikke startet. Neste punkt = første som ikke er ferdig.
 */
export function oppstartStatus(punkter) {
  const ferdig = punkter.filter((p) => p.status === "ferdig").length;
  const stopper = punkter.filter((p) => p.status === "stopper");
  const venter = punkter.filter((p) => p.status === "venter");
  const neste = [...punkter].sort((a, b) => a.nr - b.nr).find((p) => p.status !== "ferdig") ?? null;
  const status = punkter.length && ferdig === punkter.length ? "ferdig" : stopper.length ? "stopper" : punkter.some((p) => p.status !== "ikke") ? "igang" : "ikke";
  return { status, ferdig, av: punkter.length, neste, stopper, venter };
}
