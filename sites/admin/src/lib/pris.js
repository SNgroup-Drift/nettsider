/**
 * Prisberegningen for Hengsel Admin (K-240, 60-213 punkt e). Én ren funksjon uten priser i koden: alle tall kommer fra prislisten.
 * Brukes av prisberegneren i nettleseren (SA5), av Workeren når et tilbud lagres (SA6) og av testene (scripts/admin-fase-a.test.mjs).
 * Alle beløp er heltall i øre. Rabatten avrundes til hele kroner (0,5 rundes opp). Mva regnes i øre.
 *
 * Regler, i rekkefølge:
 *  1. Alle tall hentes fra prislisten. Tilbudet lagrer prislisteversjonen.
 *  2. Hver butikk har sin egen pakke. Butikklinje = pakkepris (for produktlinjen) + ekstra brukere × ekstrapris for pakken.
 *  3. Hengsel Ute regnes for hele eieren: montører summeres. Pris = det billigste av montørpris × antall og firmapris (firmapris bare når antall ≤ maks). 0 montører = ingen linje.
 *  4. Grunnlag for rabatt = sum butikklinjer + Ute.
 *  5. Rabattrinn velges fra antall butikker (høyeste trinn som passer). Rabatt = grunnlag × prosent, avrundet til hele kroner.
 *  6. Rabatten gjelder pakker, ekstra brukere og Ute. Ikke tillegg, etablering og viderefakturering.
 *  7. Tillegg legges til etter rabatten. Sikkerhetskopi som er inkludert vises som «Inkludert», 0 kr.
 *  8. Per måned uten mva = grunnlag − rabatt + tillegg. Mva med øre. Per år = per måned × 12.
 *  9. Etablering = sum per butikk etter pakke, engangs, uten rabatt, med og uten mva.
 * 10. Viderefakturering står som tekst og faktureres etter bruk.
 */

/**
 * Lager den normaliserte prislisten fra raden i `prisliste` og radene i `prislisterad` (slik de ligger i D1).
 * @param {{versjon:string, mva_prosent:number, viderefakturering_prosent:number, binding_mnd:number, oppsigelse_mnd:number, prisjustering:string, rabatt_gjelder:string|string[], status?:string, gjelder_fra?:string, eksempel?:number, id?:string}} pl
 * @param {Array<Record<string, any>>} rader
 */
export function normaliserPrisliste(pl, rader) {
  const pakker = { sigdal: {}, hengsel: {} };
  const ute = { montor_ore: 0, firma_ore: 0, firma_maks: 0 };
  const tillegg = [];
  const rabattrinn = [];
  for (const r of rader) {
    if (r.type === "pakke") {
      if (!pakker[r.produktlinje]) pakker[r.produktlinje] = {};
      pakker[r.produktlinje][r.kode] = {
        kode: r.kode, navn: r.navn, pris_ore: Number(r.pris_ore), inkl_brukere: Number(r.inkl_brukere ?? 0), ekstra_bruker_ore: Number(r.ekstra_bruker_ore ?? 0),
        support_timer: Number(r.support_timer ?? 0), etablering_ore: Number(r.etablering_ore ?? 0), moduler: lesJson(r.moduler, []), merknad: r.merknad ?? "",
      };
    } else if (r.type === "ute") {
      if (r.kode === "montor") ute.montor_ore = Number(r.pris_ore);
      if (r.kode === "firma") { ute.firma_ore = Number(r.pris_ore); ute.firma_maks = Number(r.maks_antall ?? 0); }
    } else if (r.type === "tillegg") {
      tillegg.push({ kode: r.kode, navn: r.navn, pris_ore: Number(r.pris_ore), inkludert_regel: r.inkludert_regel ?? null, merknad: r.merknad ?? "" });
    } else if (r.type === "rabattrinn") {
      rabattrinn.push({ fra_butikker: Number(r.fra_butikker), prosent: Number(r.prosent) });
    }
  }
  rabattrinn.sort((a, b) => a.fra_butikker - b.fra_butikker);
  return {
    id: pl.id ?? null, versjon: pl.versjon, status: pl.status ?? null, gjelder_fra: pl.gjelder_fra ?? null, eksempel: Number(pl.eksempel ?? 0) === 1,
    mva_prosent: Number(pl.mva_prosent), viderefakturering_prosent: Number(pl.viderefakturering_prosent), binding_mnd: Number(pl.binding_mnd), oppsigelse_mnd: Number(pl.oppsigelse_mnd ?? 3),
    prisjustering: pl.prisjustering, rabatt_gjelder: lesJson(pl.rabatt_gjelder, ["pakke", "ekstra_brukere", "ute"]),
    pakker, ute, tillegg, rabattrinn,
  };
}

function lesJson(v, standard) {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string" || !v) return standard;
  try { return JSON.parse(v); } catch { return standard; }
}

/** Hele kroner i øre, 0,5 kr rundes opp */
export const tilHeleKroner = (ore) => Math.round(ore / 100) * 100;
const pros = (ore, prosent) => Math.round((ore * prosent) / 100);

/**
 * @param {ReturnType<typeof normaliserPrisliste>} pl
 * @param {"sigdal"|"hengsel"} linje
 * @param {Array<{navn:string, pakke:"start"|"butikk"|"komplett", brukere?:number, montorer?:number}>} butikker  brukere = EKSTRA brukere ut over de inkluderte
 * @param {{tillegg?: string[]}} [valg]  koder for valgte tillegg (f.eks. ["domene"])
 */
export function beregn(pl, linje, butikker, valg = {}) {
  const pakkerForLinje = pl.pakker[linje];
  if (!pakkerForLinje) throw new Error(`Ukjent produktlinje «${linje}»`);
  const n = butikker.length;
  const rader = butikker.map((b) => {
    const p = pakkerForLinje[b.pakke];
    if (!p) throw new Error(`Ukjent pakke «${b.pakke}» for ${linje}`);
    const antallBrukere = Math.max(0, Math.trunc(Number(b.brukere ?? 0)));
    const montorer = Math.max(0, Math.trunc(Number(b.montorer ?? 0)));
    const brukere_ore = antallBrukere * p.ekstra_bruker_ore;
    return {
      navn: b.navn, pakke: p.kode, pakkeNavn: p.navn, pakke_ore: p.pris_ore, antall_brukere: antallBrukere, ekstra_bruker_ore: p.ekstra_bruker_ore, brukere_ore,
      inkl_brukere: p.inkl_brukere, support_timer: p.support_timer, montorer, etablering_ore: p.etablering_ore, moduler: p.moduler, sum_ore: p.pris_ore + brukere_ore,
    };
  });
  // 3. Hengsel Ute for hele eieren
  const antallMontorer = rader.reduce((s, r) => s + r.montorer, 0);
  const perMontor = antallMontorer * pl.ute.montor_ore;
  const firmaMulig = antallMontorer > 0 && antallMontorer <= pl.ute.firma_maks && pl.ute.firma_ore < perMontor;
  const ute = {
    antall: antallMontorer, modell: antallMontorer === 0 ? "ingen" : firmaMulig ? "firma" : "montor",
    pris_ore: antallMontorer === 0 ? 0 : firmaMulig ? pl.ute.firma_ore : perMontor,
    montor_ore: pl.ute.montor_ore, firma_ore: pl.ute.firma_ore, firma_maks: pl.ute.firma_maks,
  };
  // 4–5. Grunnlag og rabatt
  const grunnlag_ore = rader.reduce((s, r) => s + r.sum_ore, 0) + ute.pris_ore;
  const trinn = pl.rabattrinn.filter((t) => n >= t.fra_butikker).sort((a, b) => b.prosent - a.prosent)[0] ?? null;
  const rabatt_prosent = trinn ? trinn.prosent : 0;
  const rabatt_ore = trinn ? tilHeleKroner(pros(grunnlag_ore, rabatt_prosent)) : 0;
  const nesteTrinn = pl.rabattrinn.find((t) => n < t.fra_butikker) ?? null;
  // 7. Tillegg etter rabatten
  const valgt = new Set(valg.tillegg ?? []);
  const harKomplett = rader.some((r) => r.pakke === "komplett");
  const tillegg = pl.tillegg.map((t) => {
    const inkludert = t.inkludert_regel === "komplett_eller_flere_butikker" && (harKomplett || n >= 2);
    const med = inkludert || valgt.has(t.kode);
    const grunn = inkludert ? (harKomplett ? "Inkludert i Komplett" : "Inkludert, flere butikker") : med ? "Tillegg, uten rabatt" : "";
    return { kode: t.kode, navn: t.navn, pris_ore: t.pris_ore, merknad: t.merknad, valgt: med, inkludert, belop_ore: med && !inkludert ? t.pris_ore : 0, grunn };
  });
  const tillegg_ore = tillegg.reduce((s, t) => s + t.belop_ore, 0);
  // 8. Sum
  const netto_ore = grunnlag_ore - rabatt_ore + tillegg_ore;
  const mva_ore = pros(netto_ore, pl.mva_prosent);
  const aar_ore = netto_ore * 12;
  const aar_mva_ore = pros(aar_ore, pl.mva_prosent);
  // 9. Etablering
  const etablering_ore = rader.reduce((s, r) => s + r.etablering_ore, 0);
  const etablering_mva_ore = pros(etablering_ore, pl.mva_prosent);
  const support_timer = rader.reduce((s, r) => s + r.support_timer, 0);

  // Tilbudslinjene, i rekkefølgen de står i tilbudet (SA6)
  const linjer = [];
  for (const r of rader) {
    linjer.push({ type: "pakke", butikk_navn: r.navn, pakke: r.pakke, antall: 1, enhetspris_ore: r.pakke_ore, belop_ore: r.pakke_ore, rabatterbar: 1, tekst: `${r.inkl_brukere} brukere og ${r.support_timer} t support/mnd inkludert` });
    if (r.antall_brukere > 0) linjer.push({ type: "ekstra_brukere", butikk_navn: r.navn, pakke: r.pakke, antall: r.antall_brukere, enhetspris_ore: r.ekstra_bruker_ore, belop_ore: r.brukere_ore, rabatterbar: 1, tekst: `${r.antall_brukere} ekstra ${r.antall_brukere === 1 ? "bruker" : "brukere"} × ${kr(r.ekstra_bruker_ore)}` });
  }
  if (ute.modell !== "ingen") {
    linjer.push({ type: "ute", butikk_navn: null, pakke: null, antall: ute.antall, enhetspris_ore: ute.modell === "firma" ? ute.firma_ore : ute.montor_ore, belop_ore: ute.pris_ore, rabatterbar: 1, tekst: uteTekst(ute) });
  }
  if (rabatt_ore > 0) {
    linjer.push({ type: "rabatt", butikk_navn: null, pakke: null, antall: n, enhetspris_ore: null, belop_ore: -rabatt_ore, rabatterbar: 0, tekst: `Kjederabatt ${rabatt_prosent} % (${n} butikker) av ${kr(grunnlag_ore)}` });
  }
  for (const t of tillegg.filter((x) => x.valgt)) {
    linjer.push({ type: "tillegg", butikk_navn: null, pakke: null, antall: 1, enhetspris_ore: t.pris_ore, belop_ore: t.belop_ore, rabatterbar: 0, tekst: t.inkludert ? `${t.navn}: ${t.grunn}` : `${t.navn}, tillegg uten rabatt` });
  }
  const etabPerPakke = {};
  for (const r of rader) etabPerPakke[r.pakke] = (etabPerPakke[r.pakke] ?? 0) + 1;
  for (const [kode, antall] of Object.entries(etabPerPakke)) {
    const p = pakkerForLinje[kode];
    linjer.push({ type: "etablering", butikk_navn: null, pakke: kode, antall, enhetspris_ore: p.etablering_ore, belop_ore: antall * p.etablering_ore, rabatterbar: 0, tekst: `${antall} × ${p.navn} à ${kr(p.etablering_ore)}` });
  }
  linjer.push({ type: "viderefakturering", butikk_navn: null, pakke: null, antall: null, enhetspris_ore: null, belop_ore: 0, rabatterbar: 0, tekst: `SMS, Penneo og AI faktureres etter bruk til kostpris + ${pl.viderefakturering_prosent} %, uten rabatt.` });
  linjer.forEach((l, i) => { l.rekkefolge = i + 1; });

  return {
    versjon: pl.versjon, linje, antall_butikker: n, rader, ute,
    grunnlag_ore, rabatt_prosent, rabatt_fra_butikker: trinn ? trinn.fra_butikker : null, rabatt_ore, neste_trinn: nesteTrinn,
    tillegg, tillegg_ore, netto_ore, mva_ore, inkl_ore: netto_ore + mva_ore,
    aar_ore, aar_mva_ore, aar_inkl_ore: aar_ore + aar_mva_ore,
    etablering_ore, etablering_mva_ore, etablering_inkl_ore: etablering_ore + etablering_mva_ore,
    per_butikk_ore: n ? Math.round(netto_ore / n) : 0, support_timer, linjer,
  };
}

/** Forklaringen på Ute-linjen, som i tilbudet */
export function uteTekst(ute) {
  if (ute.modell === "ingen") return "Ingen montører";
  if (ute.modell === "firma") return `Firmapris for opptil ${ute.firma_maks} montører (${ute.antall} montører)`;
  const over = ute.antall > ute.firma_maks;
  return `${ute.antall} ${ute.antall === 1 ? "montør" : "montører"} × ${kr(ute.montor_ore)}${over ? `, over ${ute.firma_maks}, firmapris gjelder ikke` : `, billigere enn firmapris ${kr(ute.firma_ore)}`}`;
}

/** Viderefakturering: kostpris + påslag, uten rabatt (regel 10). Returnerer øre. */
export function viderefakturering(pl, kostpris_ore) {
  return kostpris_ore + pros(kostpris_ore, pl.viderefakturering_prosent);
}

/** Øre som «2 140 kr», «3 697,25 kr», «−2 591 kr». Hele kroner uten desimaler, ellers to. */
export function kr(ore) {
  const neg = ore < 0;
  const abs = Math.abs(Math.round(ore));
  const kroner = Math.floor(abs / 100);
  const rest = abs % 100;
  const hel = String(kroner).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${neg ? "−" : ""}${hel}${rest ? `,${String(rest).padStart(2, "0")}` : ""} kr`;
}
