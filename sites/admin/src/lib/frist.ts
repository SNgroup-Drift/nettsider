/**
 * Frister: dager igjen og farge. Rød under 7 dager (også utløpt), gul under 30, grønn ellers, «fyll inn» uten dato.
 * Dagene regnes på norske kalenderdøgn. Samme kode kjører ved bygging (grunnverdi uten JavaScript) og i nettleseren (src/scripts/admin.ts),
 * så fargene er riktige også når siden er bygget for en stund siden.
 */
import { norskDato } from "./dato";
export type FristNiva = "rod" | "gul" | "gronn" | "ukjent";

const iso = /^\d{4}-\d{2}-\d{2}$/;

/** Dagens dato i Norge som ÅÅÅÅ-MM-DD */
export function idagOslo(na: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(na);
}

export function dagerIgjen(dato: string | null | undefined, na: Date = new Date()): number | null {
  if (!dato || !iso.test(dato)) return null;
  const [y, m, d] = dato.split("-").map(Number);
  const [iy, im, id] = idagOslo(na).split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(iy, im - 1, id)) / 86_400_000);
}

export function niva(dager: number | null): FristNiva {
  if (dager === null) return "ukjent";
  if (dager < 7) return "rod";
  if (dager < 30) return "gul";
  return "gronn";
}

export function tekstFor(dager: number | null): string {
  if (dager === null) return "fyll inn";
  if (dager < 0) return `utløpt for ${-dager} ${dager === -1 ? "dag" : "dager"} siden`;
  if (dager === 0) return "i dag";
  if (dager === 1) return "i morgen";
  return `om ${dager} dager`;
}

export function datoNorsk(dato: string | null | undefined): string {
  if (!dato || !iso.test(dato)) return "fyll inn";
  return norskDato(dato);
}
