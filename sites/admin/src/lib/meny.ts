/**
 * Menyen i Hengsel Admin (K-240, 60-213 punkt a) lages fra denne ene konfigurasjonen. Punktene for fase B og C står her med fase «b»/«c»
 * og vises IKKE før de er bygd (menyen filtrerer på fase «a»). Drift-sidene fra K-184 finnes i dag og ligger under /drift.
 * Telefon: bunnfanene Oversikt, Tavle, Eiere, Avtaler og Mer (BUNNFANER). Under 1024 px er sidemenyen en skuff.
 */
export type Fase = "a" | "b" | "c";
export interface Punkt { id: string; navn: string; sti: string; ikon: string; fase: Fase; under?: boolean }
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
    { id: "saker", navn: "Saker", sti: "/support/saker", ikon: "saker", fase: "b", under: true },
    { id: "timer", navn: "Timer", sti: "/support/timer", ikon: "kalender", fase: "b", under: true },
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
  ] },
];

/** Menyen som vises nå: bare fase A. Grupper uten punkter faller bort. */
export function menyNaa(fase: Fase = "a"): Gruppe[] {
  return MENY.map((g) => ({ ...g, punkter: g.punkter.filter((p) => p.fase === fase) })).filter((g) => g.punkter.length);
}

export const BUNNFANER = [
  { id: "oversikt", navn: "Oversikt", sti: "/", ikon: "oversikt" },
  { id: "tavle", navn: "Tavle", sti: "/salg/tavle", ikon: "salgstavle" },
  { id: "eiere", navn: "Eiere", sti: "/salg/eiere", ikon: "utstillinger" },
  { id: "avtaler", navn: "Avtaler", sti: "/avtaler", ikon: "signert" },
  { id: "mer", navn: "Mer", sti: "#meny", ikon: "mer" },
];

/** Brødsmulene i toppfeltet per side-id */
export const STI: Record<string, string[]> = {
  oversikt: ["Oversikt"], tavle: ["Salg", "Tavle"], eiere: ["Salg", "Eiere og butikker"], eierkort: ["Salg", "Eiere og butikker"], prisberegner: ["Salg", "Prisberegner"],
  kunder: ["Kunder"], kundekort: ["Kunder"], avtaler: ["Avtaler"], avtale: ["Avtaler"], prisliste: ["Innstillinger", "Prisliste"], leverandor: ["Innstillinger", "Leverandør"],
  drift: ["Drift", "Status"], "drift-kunder": ["Drift", "Kundemapper"],
};
