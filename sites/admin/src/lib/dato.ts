/**
 * Norsk datovisning (K-192). Datafilene har ÅÅÅÅ-MM-DD internt; siden viser dd.mm.åååå (12.10.2026).
 * Ren strengomforming, ingen Date, så tidssoner kan ikke flytte dagen.
 */
const iso = /^(\d{4})-(\d{2})-(\d{2})$/;

export function norskDato(dato: string): string {
  const m = iso.exec(dato);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : dato;
}
