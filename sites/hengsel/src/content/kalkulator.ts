/**
 * Ny forside (prøveside): eksempelprislisten til priskalkulatoren på hengsel.no. Bygger på prismodellen i Hengsel Admin (packages/pris/src/pris.js,
 * normaliserPrisliste() og beregn()), men ALLE TALL HER ER PLASSHOLDERE merket «Eksempel» – ikke prisene til Hengsel. Runde tall med vilje, så ingen
 * leser dem som ekte. Ekte priser ligger bare i prislisten i Admin (D1) og vises aldri på nettsidene.
 * Beløp i øre, som i pris.js.
 */
import { beregn, kr, normaliserPrisliste, uteTekst } from "../../../../packages/pris/src/pris.js";

export const EKSEMPEL_PRISLISTE = normaliserPrisliste(
  {
    versjon: "eksempel", eksempel: 1, mva_prosent: 25, viderefakturering_prosent: 0, binding_mnd: 0, oppsigelse_mnd: 3, prisjustering: "", rabatt_gjelder: ["pakke", "ekstra_brukere", "ute"],
  },
  [
    { type: "pakke", produktlinje: "hengsel", kode: "butikk", navn: "Butikkpakke", pris_ore: 100000, inkl_brukere: 3, ekstra_bruker_ore: 10000, support_timer: 1, etablering_ore: 500000 },
    { type: "ute", kode: "montor", pris_ore: 10000 },
    { type: "ute", kode: "firma", pris_ore: 50000, maks_antall: 8 },
    { type: "rabattrinn", fra_butikker: 3, prosent: 5 },
    { type: "rabattrinn", fra_butikker: 10, prosent: 10 },
  ],
);

/** Pakken alle butikkene får i eksempelet */
export const EKSEMPEL_PAKKE = "butikk" as const;

export interface Valg { butikker: number; brukere: number; montorer: number }

/** Butikklista til beregn(): brukere i skjemaet er alle brukere per butikk; beregn() vil ha de ekstra ut over de inkluderte. Montørene står på første butikk (Ute regnes for hele eieren). */
export function butikkliste(v: Valg) {
  const inkl = EKSEMPEL_PRISLISTE.pakker.hengsel[EKSEMPEL_PAKKE].inkl_brukere;
  return Array.from({ length: v.butikker }, (_, i) => ({
    navn: `Butikk ${i + 1}`, pakke: EKSEMPEL_PAKKE, brukere: Math.max(0, v.brukere - inkl), montorer: i === 0 ? v.montorer : 0,
  }));
}

/** Radene i prisoppstillingen, i fast rekkefølge. Komponenten tegner alle; skriptet fyller tekst og beløp og skjuler rader som er tomme. */
export const RADER = ["pakker", "brukere", "ute", "rabatt", "maned", "aar", "etablering"] as const;
export type Radnokkel = (typeof RADER)[number];
export interface Rad { tekst: string; belop: string; vis: boolean }

/** Gjør resultatet fra beregn() om til en kort oppstilling for nettsiden (uten mva; mva står under). */
export function oppstilling(v: Valg): { rader: Record<Radnokkel, Rad>; mva: string; neste: string } {
  const r = beregn(EKSEMPEL_PRISLISTE, "hengsel", butikkliste(v));
  const p = EKSEMPEL_PRISLISTE.pakker.hengsel[EKSEMPEL_PAKKE];
  const ekstra = r.rader.reduce((s, x) => s + x.antall_brukere, 0);
  const ekstraOre = r.rader.reduce((s, x) => s + x.brukere_ore, 0);
  const pakkerOre = r.rader.reduce((s, x) => s + x.pakke_ore, 0);
  return {
    rader: {
      pakker: { tekst: `${v.butikker} × ${p.navn} (${p.inkl_brukere} brukere inkludert)`, belop: kr(pakkerOre), vis: true },
      brukere: { tekst: `${ekstra} ekstra ${ekstra === 1 ? "bruker" : "brukere"} × ${kr(p.ekstra_bruker_ore)}`, belop: kr(ekstraOre), vis: ekstra > 0 },
      ute: { tekst: `Hengsel Ute: ${uteTekst(r.ute)}`, belop: kr(r.ute.pris_ore), vis: r.ute.modell !== "ingen" },
      rabatt: { tekst: `Kjederabatt ${r.rabatt_prosent} % fra ${r.rabatt_fra_butikker ?? 0} butikker`, belop: kr(-r.rabatt_ore), vis: r.rabatt_ore > 0 },
      maned: { tekst: "Per måned", belop: kr(r.netto_ore), vis: true },
      aar: { tekst: "Per år", belop: kr(r.aar_ore), vis: true },
      etablering: { tekst: "Oppstart, én gang", belop: kr(r.etablering_ore), vis: true },
    },
    mva: `Uten mva. Med mva: ${kr(r.inkl_ore)} per måned.`,
    neste: r.neste_trinn ? `Fra ${r.neste_trinn.fra_butikker} butikker: ${r.neste_trinn.prosent} % kjederabatt.` : "Høyeste kjederabatt er med.",
  };
}
