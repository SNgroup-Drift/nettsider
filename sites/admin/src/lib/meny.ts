/**
 * Menyen i Hengsel Admin lages fra denne ene konfigurasjonen. N-4 (sidekartet 26-001–26-013, S-68): øverst sidekartets punkter (Salg, Eiere og
 * butikker, Prisberegner, Avtaler) og gruppen Innstillinger (Prisliste, Leverandør, Excel-import, Tilbakemeldinger). Støtte og Fakturering er
 * «Kommer» i sidekartet og står ikke i menyen (sidene /stotte og /fakturering finnes). Under dem står modulene som allerede er bygd i fase B
 * (Support, Oppstart; K-259) og fase C (Fakturering, Tall; K-260) og Drift, uendret, så ingenting som virker forsvinner.
 * Oversikt (SA1) er slått sammen med tavla i Salg (26-009) og ligger på «/». Kunder er fanen «Aktive kunder» i Eiere og butikker (26-002).
 * roller: hvem som ser punktet («eier», «support»). Rollen support ser bare Support (Saker, Timer). Menyen filtreres i nettleseren (app.ts) og
 * stengt i Workeren. Telefon: bunnfanene Oversikt, Tavle, Eiere, Avtaler og Mer (besluttet 15.10, BUNNFANER).
 */
export type Fase = "a" | "b" | "c";
export type Rolle = "eier" | "support";
export interface Punkt { id: string; navn: string; sti: string; ikon: string; fase: Fase; under?: boolean; roller?: Rolle[] }
export interface Gruppe { navn?: string; punkter: Punkt[]; skille?: boolean }

export const MENY: Gruppe[] = [
  { punkter: [
    { id: "salg", navn: "Salg", sti: "/", ikon: "salgsbanken", fase: "a" },
    { id: "eiere", navn: "Eiere og butikker", sti: "/salg/eiere", ikon: "kunder", fase: "a" },
    { id: "prisberegner", navn: "Prisberegner", sti: "/salg/prisberegner", ikon: "tilbud", fase: "a" },
    { id: "avtaler", navn: "Avtaler", sti: "/avtaler", ikon: "signert", fase: "a" },
  ] },
  { navn: "Innstillinger", punkter: [
    { id: "prisliste", navn: "Prisliste", sti: "/innstillinger/prisliste", ikon: "rapporter", fase: "a" },
    { id: "leverandor", navn: "Leverandør", sti: "/innstillinger/leverandor", ikon: "profil", fase: "a" },
    { id: "import", navn: "Excel-import", sti: "/salg/import", ikon: "last-opp", fase: "a" },
    { id: "tilbakemeldinger", navn: "Tilbakemeldinger", sti: "/innstillinger/tilbakemeldinger", ikon: "varsler", fase: "a" },
  ] },
  { navn: "Support", skille: true, punkter: [
    { id: "saker", navn: "Saker", sti: "/support/saker", ikon: "saker", fase: "b", roller: ["eier", "support"] },
    { id: "timer", navn: "Timer", sti: "/support/timer", ikon: "kalender", fase: "b", roller: ["eier", "support"] },
    { id: "support-innstillinger", navn: "Support og roller", sti: "/innstillinger/support", ikon: "innstillinger", fase: "b" },
  ] },
  { punkter: [{ id: "oppstart", navn: "Oppstart", sti: "/oppstart", ikon: "prosjektplan", fase: "b" }] },
  { navn: "Fakturering", punkter: [
    { id: "abonnement", navn: "Abonnement", sti: "/fakturering/abonnement", ikon: "ordre", fase: "c" },
    { id: "kjoring", navn: "Fakturakjøring", sti: "/fakturering/kjoring", ikon: "fakturaer", fase: "c" },
    { id: "kpi", navn: "KPI", sti: "/fakturering/kpi", ikon: "prisavvik", fase: "c" },
    { id: "utestaende", navn: "Utestående", sti: "/fakturering/utestaende", ikon: "forskudd-leverandor", fase: "c" },
  ] },
  { punkter: [{ id: "tall", navn: "Tall", sti: "/tall", ikon: "resultater", fase: "c" }] },
  { navn: "Drift", punkter: [
    { id: "drift", navn: "Status", sti: "/drift/status", ikon: "resultater", fase: "a" },
    { id: "drift-lenker", navn: "Lenker", sti: "/drift/lenker", ikon: "lenke", fase: "a" },
    { id: "drift-kontoer", navn: "Kontoer", sti: "/drift/kontoer", ikon: "profil", fase: "a" },
    { id: "drift-frister", navn: "Frister", sti: "/drift/frister", ikon: "frist", fase: "a" },
    { id: "drift-rutiner", navn: "Rutiner", sti: "/drift/rutiner", ikon: "kontrollmal", fase: "a" },
    { id: "drift-kunder", navn: "Kundemapper", sti: "/drift/kunder", ikon: "kunder", fase: "a" },
  ] },
];

/** Rollene som ser et punkt (standard: bare eier) */
export const rollerFor = (p: Punkt): Rolle[] => p.roller ?? ["eier"];

/** Menyen som vises: alle punktene (fase A, B og C og Drift), valgfritt bare for én rolle. Grupper uten punkter faller bort. */
export function menyNaa(rolle?: Rolle): Gruppe[] {
  return MENY.map((g) => ({ ...g, punkter: g.punkter.filter((p) => !rolle || rollerFor(p).includes(rolle)) })).filter((g) => g.punkter.length);
}

/** Navnet på menygruppen (eller punktet) en sti hører til, til «Du har ikke tilgang til …» */
export function omradeFor(sti: string): string {
  const s = sti.replace(/\/+$/, "") || "/";
  let best: { navn: string; lengde: number } = { navn: "denne siden", lengde: 0 };
  for (const g of MENY) for (const p of g.punkter) {
    const ps = p.sti.split("#")[0];
    if (ps === "/" ? s === "/" : s === ps || s.startsWith(`${ps}/`)) if (ps.length > best.lengde) best = { navn: g.navn ?? p.navn, lengde: ps.length };
  }
  return best.navn;
}

export const BUNNFANER = [
  { id: "salg", navn: "Oversikt", sti: "/", ikon: "min-dag", roller: ["eier"] },
  { id: "tavle", navn: "Tavle", sti: "/salg/tavle#salgstavle", ikon: "salgsbanken", roller: ["eier"] },
  { id: "eiere", navn: "Eiere", sti: "/salg/eiere", ikon: "kunder", roller: ["eier"] },
  { id: "avtaler", navn: "Avtaler", sti: "/avtaler", ikon: "signert", roller: ["eier"] },
  { id: "saker", navn: "Saker", sti: "/support/saker", ikon: "saker", roller: ["support"] },
  { id: "timer", navn: "Timer", sti: "/support/timer", ikon: "kalender", roller: ["support"] },
  { id: "mer", navn: "Mer", sti: "#meny", ikon: "mer", roller: ["eier", "support"] },
];

/** Forelderen (brødsmulen over tittelen i topplinja, regel 8) per side-id */
export const FORELDER: Record<string, string> = {
  eierkort: "Eiere og butikker", kundekort: "Eiere og butikker", prisberegner: "", import: "Eiere og butikker", avtale: "Avtaler",
  prisliste: "Innstillinger", leverandor: "Innstillinger", tilbakemeldinger: "Innstillinger", "support-innstillinger": "Innstillinger",
  sak: "Saker", "oppstart-kunde": "Oppstart", "drift-kunder": "Drift",
};
/** Menypunktet som er aktivt for en side-id som ikke selv står i menyen */
export const AKTIVT_PUNKT: Record<string, string> = { tavle: "salg", eierkort: "eiere", kunder: "eiere", kundekort: "eiere", avtale: "avtaler", sak: "saker", "oppstart-kunde": "oppstart" };
