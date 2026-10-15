/**
 * Fakturering i Hengsel Admin fase C (K-260, 60-211 SC1–SC3). Rene funksjoner uten database: brukes av Workeren (worker/api-fakturering.js),
 * av sidene og av testene (scripts/admin-fase-c.test.mjs). Prisene regnes alltid med beregn() i pris.js (samme funksjon som prisberegneren
 * og tilbudet i K-240), aldri med priser i koden. Kjederabatten regnes ut hver gang og lagres ikke. Beløp i øre, datoer ISO (ÅÅÅÅ-MM-DD).
 *
 * Regler (60-211, 60-212):
 *  1. Abonnementet har linjer per butikk (pakke, ekstra brukere, montører) og tillegg. Hver linje gjelder fra en dato og til en dato (eller løpende).
 *     Linjene som gjelder på en dato gir prisen den dagen: beregn(prisliste, produktlinje, butikker, { tillegg }).netto_ore.
 *  2. KPI: hver kunde som er varslet om en KPI-justering med KPI-dato på eller før datoen, får prisen ganget med (1 + prosent/100).
 *     Ny pris avrundes til hele kroner. Viderefakturering justeres ikke.
 *  3. Fakturering skjer forskuddsvis den 1. Abonnementet er med når det har startet før neste måned og ikke er opphørt før den 1.
 *  4. Etablering kommer på første faktura (måneden abonnementet starter), uten rabatt.
 *  5. Timer: minutter ført forrige måned ut over inkluderte timer (support_timer fra pakkene) × timepris. Inkluderte timer nullstilles hver måned.
 *  6. Viderefakturering: kostpris + påslag (prislistens viderefakturering_prosent, 15 %), uten rabatt.
 */
import { beregn, tilHeleKroner, viderefakturering, kr } from "./pris.js";

export const MND_NAVN = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

/** «2026-11» → «2026-11-01» (fakturadatoen) */
export const forsteIMnd = (maaned) => `${maaned}-01`;
/** «2026-11-17» → «2026-11» */
export const maanedFor = (dato) => dato.slice(0, 7);
/** «2026-11» + n måneder */
export function leggTilMnd(maaned, n) {
  const [y, m] = maaned.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
/** «2026-11» → «November 2026» */
export const maanedNavn = (maaned, stor = true) => { const [y, m] = maaned.split("-").map(Number); const n = MND_NAVN[m - 1]; return `${stor ? n[0].toUpperCase() + n.slice(1) : n} ${y}`; };
/** Siste dag i måneden */
export const sisteIMnd = (maaned) => { const [y, m] = maaned.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); };

/** Linjene som gjelder på en dato */
export function linjerPaa(linjer, dato) {
  return linjer.filter((l) => l.gjelder_fra <= dato && (!l.gjelder_til || l.gjelder_til >= dato)).sort((a, b) => (a.rekkefolge ?? 0) - (b.rekkefolge ?? 0));
}

/** Faktoren fra KPI-justeringene som gjelder på datoen (bare varslede kunder) */
export function kpiFaktor(kpi, dato) {
  return (kpi ?? []).filter((k) => k.varslet && k.kpi_dato <= dato).reduce((f, k) => f * (1 + Number(k.prosent) / 100), 1);
}

/** Ny pris etter KPI, hele kroner (regel 2) */
export const kpiNyPris = (ore, prosent) => tilHeleKroner(Math.round(ore * (1 + Number(prosent) / 100)));

/**
 * Prisen for abonnementet på en dato.
 * @param {{produktlinje: string}} abo
 * @param {Array<{type:"butikk"|"tillegg", butikk_navn?:string, pakke?:string, ekstra_brukere?:number, montorer?:number, tillegg_kode?:string, gjelder_fra:string, gjelder_til?:string|null}>} linjer
 * @param {ReturnType<import("./pris.js").normaliserPrisliste>} pl
 * @param {Array<{kpi_dato:string, prosent:number, varslet?:string|null}>} kpi
 * @returns {null | ReturnType<typeof beregn> & { kpi_faktor:number, for_kpi_ore:number, pris_ore:number, butikker:any[], tillegg_koder:string[] }}
 */
export function prisPaa(abo, linjer, pl, kpi, dato) {
  const gjelder = linjerPaa(linjer, dato);
  const butikker = gjelder.filter((l) => l.type === "butikk").map((l) => ({ navn: l.butikk_navn, pakke: l.pakke, brukere: Number(l.ekstra_brukere ?? 0), montorer: Number(l.montorer ?? 0) }));
  if (!butikker.length) return null;
  const tilleggKoder = gjelder.filter((l) => l.type === "tillegg").map((l) => l.tillegg_kode);
  const r = beregn(pl, abo.produktlinje, butikker, { tillegg: tilleggKoder });
  const faktor = kpiFaktor(kpi, dato);
  const pris = faktor === 1 ? r.netto_ore : tilHeleKroner(Math.round(r.netto_ore * faktor));
  return { ...r, kpi_faktor: faktor, for_kpi_ore: r.netto_ore, pris_ore: pris, butikker, tillegg_koder: tilleggKoder };
}

/** Er abonnementet med i kjøringen for måneden (regel 3)? */
export function erMed(abo, maaned) {
  const neste = forsteIMnd(leggTilMnd(maaned, 1));
  if (abo.gjelder_fra >= neste) return false;
  if (abo.opphorer && abo.opphorer < forsteIMnd(maaned)) return false;
  return true;
}

/** Antall fakturaer igjen til og med opphør, fra og med denne måneden */
export function fakturaerIgjen(abo, maaned) {
  if (!abo.opphorer) return null;
  let n = 0;
  for (let m = maaned; forsteIMnd(m) <= abo.opphorer && n < 240; m = leggTilMnd(m, 1)) n++;
  return n;
}

const timer = (min) => { const t = min / 60; return `${String(Math.round(t * 100) / 100).replace(".", ",")} t`; };
const krTekst = (ore) => kr(ore).replace(/ kr$/, "");
const kostTekst = (ore) => (ore / 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, " ");

/**
 * Fakturaen for ett abonnement i en måned (rene tall). Returnerer null når abonnementet ikke er med.
 * @param {object} p
 * @param {any} p.abo  abonnementet (produktlinje, gjelder_fra, opphorer)
 * @param {any[]} p.linjer  alle abonnementslinjer
 * @param {any} p.pl  normalisert prisliste
 * @param {any[]} [p.kpi]  KPI-justeringer for kunden
 * @param {any[]} [p.endringer]  abonnementsendringer (gjelder_fra, type, tekst)
 * @param {string} p.maaned  «2026-11»
 * @param {boolean} [p.etableringFakturert]  etablering er fakturert i en tidligere kjøring
 * @param {number|null} [p.minutterForrigeMnd]  ført tid forrige måned (null = tidsføringen finnes ikke)
 * @param {number} [p.timeprisOre]
 * @param {Array<{id?:string, tekst:string, kostpris_ore:number}>} [p.viderefakturert]  manuelle kostpriser
 */
export function lagFaktura({ abo, linjer, pl, kpi = [], endringer = [], maaned, etableringFakturert = false, minutterForrigeMnd = null, timeprisOre = 0, viderefakturert = [] }) {
  if (!erMed(abo, maaned)) return null;
  const dato = forsteIMnd(maaned);
  // Fra første dag abonnementet gjelder i måneden (start midt i måneden gir full måned, regel 3)
  const prisDato = abo.gjelder_fra > dato ? abo.gjelder_fra : dato;
  const naa = prisPaa(abo, linjer, pl, kpi, prisDato);
  if (!naa) return null;
  const forrigeMnd = leggTilMnd(maaned, -1);
  const forrigeDato = forsteIMnd(forrigeMnd);
  const forrige = erMed(abo, forrigeMnd) && abo.gjelder_fra <= forrigeDato ? prisPaa(abo, linjer, pl, kpi, forrigeDato) : null;
  const ut = [];
  const antallButikker = naa.butikker.length;
  ut.push({
    type: "abonnement", kilde: "auto", antall: 1, pris_ore: naa.pris_ore, kostpris_ore: null, paaslag_prosent: null, rabatt_ore: naa.rabatt_ore, belop_ore: naa.pris_ore,
    tekst: `Abonnement ${maanedNavn(maaned, false)}, ${antallButikker} ${antallButikker === 1 ? "butikk" : "butikker"}${naa.rabatt_ore ? ` (kjederabatt ${naa.rabatt_prosent} %, ${krTekst(naa.rabatt_ore)} kr)` : ""}${naa.kpi_faktor !== 1 ? ", KPI-justert" : ""}`,
  });
  // 4. Etablering første måned
  const startMnd = maanedFor(abo.gjelder_fra) === maaned;
  if (startMnd && !etableringFakturert && naa.etablering_ore > 0) {
    const perPakke = {};
    for (const b of naa.butikker) perPakke[b.pakke] = (perPakke[b.pakke] ?? 0) + 1;
    const tekst = Object.entries(perPakke).map(([k, n]) => `${n} × ${pl.pakker[abo.produktlinje][k]?.navn ?? k}`).join(", ");
    ut.push({ type: "etablering", kilde: "auto", antall: 1, pris_ore: naa.etablering_ore, kostpris_ore: null, paaslag_prosent: null, rabatt_ore: 0, belop_ore: naa.etablering_ore, tekst: `Etablering, ${tekst} (uten rabatt)` });
  }
  // 5. Timer ut over inkludert forrige måned
  if (minutterForrigeMnd !== null && minutterForrigeMnd !== undefined) {
    const inklMin = naa.support_timer * 60;
    const over = Math.max(0, Math.round(minutterForrigeMnd) - inklMin);
    if (over > 0 && timeprisOre > 0) {
      const belop = Math.round((over * timeprisOre) / 60);
      ut.push({ type: "timer", kilde: "auto", antall: over / 60, pris_ore: timeprisOre, kostpris_ore: null, paaslag_prosent: null, rabatt_ore: 0, belop_ore: belop,
        tekst: `Support ${MND_NAVN[Number(forrigeMnd.slice(5)) - 1]}: ${timer(over)} ut over ${timer(inklMin)} inkludert × ${krTekst(timeprisOre)} kr` });
    }
  }
  // 6. Viderefakturering
  for (const v of viderefakturert) {
    const belop = viderefakturering(pl, v.kostpris_ore);
    ut.push({ id: v.id, type: "viderefakturert", kilde: "manuell", antall: 1, pris_ore: belop, kostpris_ore: v.kostpris_ore, paaslag_prosent: pl.viderefakturering_prosent, rabatt_ore: 0, belop_ore: belop,
      tekst: `${v.tekst} (kostpris ${kostTekst(v.kostpris_ore)} + ${pl.viderefakturering_prosent} %)` });
  }
  ut.forEach((l, i) => { l.rekkefolge = i + 1; });
  // «Endret:» mot forrige måned
  const endret = [];
  const diff = forrige ? naa.pris_ore - forrige.pris_ore : 0;
  const iPerioden = endringer.filter((e) => e.gjelder_fra > forrigeDato && e.gjelder_fra <= dato && e.type !== "start").sort((a, b) => a.gjelder_fra.localeCompare(b.gjelder_fra));
  if (startMnd) endret.push(`Ny kunde fra ${abo.gjelder_fra.slice(8, 10)}.${abo.gjelder_fra.slice(5, 7)}`);
  iPerioden.forEach((e, i) => endret.push(`${e.tekst} fra ${e.gjelder_fra.slice(8, 10)}.${e.gjelder_fra.slice(5, 7)}${i === iPerioden.length - 1 && diff ? ` (${diff > 0 ? "+" : "−"}${krTekst(Math.abs(diff))} kr)` : ""}`));
  if (!iPerioden.length && diff && !startMnd) endret.push(`Prisen er endret (${diff > 0 ? "+" : "−"}${krTekst(Math.abs(diff))} kr)${naa.kpi_faktor !== (forrige?.kpi_faktor ?? 1) ? ", KPI-justering" : ""}`);
  if (ut.some((l) => l.type === "timer")) endret.push("Ny linje: support ut over inkludert");
  const igjen = fakturaerIgjen(abo, maaned);
  if (igjen !== null) endret.push(`Sagt opp. ${igjen === 1 ? "Siste faktura" : `${igjen} fakturaer igjen`}`);
  const sum = ut.reduce((s, l) => s + l.belop_ore, 0);
  const mva = Math.round((sum * pl.mva_prosent) / 100);
  return { linjer: ut, endret, fast_ore: naa.pris_ore, sum_ore: sum, mva_ore: mva, inkl_ore: sum + mva, rabatt_ore: naa.rabatt_ore, rabatt_prosent: naa.rabatt_prosent, support_timer: naa.support_timer, diff_ore: diff };
}

/** Engangslinjene summert per type (sidepanelet i SC2) */
export function summerPerType(fakturaer) {
  const ut = { abonnement: 0, etablering: 0, timer: 0, viderefakturert: 0 };
  for (const f of fakturaer) for (const l of f.linjer) ut[l.type] = (ut[l.type] ?? 0) + l.belop_ore;
  return ut;
}

/** E-postutkastet til kunden om KPI-justering (sendes aldri automatisk) */
export function kpiEpost({ fornavn, kunde, kpi_dato, prosent, pris_ore, ny_pris_ore, leverandor, avsender = "Eirik" }) {
  const d = `${kpi_dato.slice(8, 10)}.${kpi_dato.slice(5, 7)}.${kpi_dato.slice(0, 4)}`;
  const p = String(prosent).replace(".", ",");
  return {
    emne: `Prisjustering for Hengsel fra ${d}`,
    tekst: `Hei ${fornavn || "der"}.\n\nAbonnementet til ${kunde} justeres årlig etter konsumprisindeksen (KPI), slik det står i avtalen. KPI-endringen er ${p} %.\n\nFra ${d} blir prisen ${kr(ny_pris_ore)} per måned uten mva (i dag ${kr(pris_ore)}). Viderefakturering av SMS, Penneo og AI endres ikke.\n\nSi fra hvis du har spørsmål.\n\nHilsen ${avsender}\n${leverandor}`,
  };
}
