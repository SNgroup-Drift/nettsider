/**
 * Menyen i Hengsel Admin (K-240, K-259, 60-211 «Meny») lages fra denne ene konfigurasjonen. Fra K-259 vises ALLE punktene: fase A, fase B
 * (Support, Oppstart; K-259), fase C (Fakturering, Tall; K-260) og Drift. «fase» sier bare hvilken leveranse punktet hører til.
 * Stiene for fase C eies av K-260 og må ikke endres der uten å endre dem her.
 * roller: hvem som ser punktet («eier», «support»). Rollen support ser bare Support (Saker, Timer); Kunder er holdt utenfor til Eirik har
 * svart på 60-212 spørsmål 6 (API-et for kunder gir ADM-403 for support). Menyen filtreres i nettleseren (app.ts) og stengt i Workeren.
 * Telefon: bunnfanene Oversikt, Tavle, Saker, Eiere og Mer (60-212 valg 14, BUNNFANER). Under 1024 px er sidemenyen en skuff.
 */
export type Fase = "a" | "b" | "c";
export type Rolle = "eier" | "support";
export interface Punkt { id: string; navn: string; sti: string; ikon: string; fase: Fase; under?: boolean; roller?: Rolle[] }
export interface Gruppe { navn?: string; punkter: Punkt[] }

export const MENY: Gruppe[] = [
  { punkter: [{ id: "oversikt", navn: "Oversikt", sti: "/", ikon: "oversikt", fase: "a" }] },
  { navn: "Salg", punkter: [
    { id: "tavle", navn: "Tavle", sti: "/salg/tavle", ikon: "salgstavle", fase: "a", under: true },
    { id: "eiere", navn: "Eiere og butikker", sti: "/salg/eiere", ikon: "utstillinger", fase: "a", under: true },
    { id: "prisberegner", navn: "Prisberegner", sti: "/salg/prisberegner", ikon: "etterkalkyler", fase: "a", under: true },
  ] },
  { punkter: [
    { id: "kunder", navn: "Kunder", sti: "/kunder", ikon: "kunder", fase: "a" },
    { id: "avtaler", navn: "Avtaler", sti: "/avtaler", ikon: "signert", fase: "a" },
  ] },
  { navn: "Support", punkter: [
    { id: "saker", navn: "Saker", sti: "/support/saker", ikon: "saker", fase: "b", under: true, roller: ["eier", "support"] },
    { id: "timer", navn: "Timer", sti: "/support/timer", ikon: "kalender", fase: "b", under: true, roller: ["eier", "support"] },
  ] },
  { punkter: [{ id: "oppstart", navn: "Oppstart", sti: "/oppstart", ikon: "prosjektplan", fase: "b" }] },
  { navn: "Fakturering", punkter: [
    { id: "abonnement", navn: "Abonnement", sti: "/fakturering/abonnement", ikon: "ordre", fase: "c", under: true },
    { id: "kjoring", navn: "Fakturakjøring", sti: "/fakturering/kjoring", ikon: "fakturaer", fase: "c", under: true },
    { id: "kpi", navn: "KPI", sti: "/fakturering/kpi", ikon: "prisavvik", fase: "c", under: true },
    { id: "utestaende", navn: "Utestående", sti: "/fakturering/utestaende", ikon: "forskudd-leverandor", fase: "c", under: true },
  ] },
  { punkter: [{ id: "tall", navn: "Tall", sti: "/tall", ikon: "rapporter", fase: "c" }] },
  { navn: "Drift", punkter: [
    { id: "drift", navn: "Status", sti: "/drift", ikon: "resultater", fase: "a", under: true },
    { id: "drift-lenker", navn: "Lenker", sti: "/drift#lenker", ikon: "lenke", fase: "a", under: true },
    { id: "drift-kontoer", navn: "Kontoer", sti: "/drift#kontoer", ikon: "profil", fase: "a", under: true },
    { id: "drift-frister", navn: "Frister", sti: "/drift#frister", ikon: "frist", fase: "a", under: true },
    { id: "drift-rutiner", navn: "Rutiner", sti: "/drift#rutiner", ikon: "kontrollmal", fase: "a", under: true },
    { id: "drift-kunder", navn: "Kundemapper", sti: "/drift/kunder", ikon: "kunder", fase: "a", under: true },
  ] },
  { navn: "Innstillinger", punkter: [
    { id: "prisliste", navn: "Prisliste", sti: "/innstillinger/prisliste", ikon: "innstillinger", fase: "a", under: true },
    { id: "leverandor", navn: "Leverandør", sti: "/innstillinger/leverandor", ikon: "profil", fase: "a", under: true },
    { id: "support-innstillinger", navn: "Support og roller", sti: "/innstillinger/support", ikon: "saker", fase: "b", under: true },
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
  { id: "oversikt", navn: "Oversikt", sti: "/", ikon: "oversikt", roller: ["eier"] },
  { id: "tavle", navn: "Tavle", sti: "/salg/tavle", ikon: "salgstavle", roller: ["eier"] },
  { id: "saker", navn: "Saker", sti: "/support/saker", ikon: "saker", roller: ["eier", "support"] },
  { id: "eiere", navn: "Eiere", sti: "/salg/eiere", ikon: "utstillinger", roller: ["eier"] },
  { id: "timer", navn: "Timer", sti: "/support/timer", ikon: "kalender", roller: ["support"] },
  { id: "mer", navn: "Mer", sti: "#meny", ikon: "mer", roller: ["eier", "support"] },
];

/** Brødsmulene i toppfeltet per side-id */
export const STI: Record<string, string[]> = {
  oversikt: ["Oversikt"], tavle: ["Salg", "Tavle"], eiere: ["Salg", "Eiere og butikker"], eierkort: ["Salg", "Eiere og butikker"], prisberegner: ["Salg", "Prisberegner"],
  kunder: ["Kunder"], kundekort: ["Kunder"], avtaler: ["Avtaler"], avtale: ["Avtaler"], prisliste: ["Innstillinger", "Prisliste"], leverandor: ["Innstillinger", "Leverandør"],
  drift: ["Drift", "Status"], "drift-kunder": ["Drift", "Kundemapper"],
  saker: ["Support", "Saker"], sak: ["Support", "Saker", "Sak"], timer: ["Support", "Timer"], oppstart: ["Oppstart"], "oppstart-kunde": ["Oppstart", "Kunde"],
  "support-innstillinger": ["Innstillinger", "Support og roller"], "ingen-tilgang": ["Ingen tilgang"],
};
