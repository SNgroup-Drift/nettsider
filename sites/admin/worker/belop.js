/**
 * K-469 (60-211 «Rolle Support»): rollen support ser Kunder, men ikke beløp. Alle beløp i API-et er heltall øre i felt som slutter på `_ore`
 * (verdi_ore, sum_mnd_ore, per_mnd_ore …). utenBelop setter dem til null i hele svaret, også i lister og under-objekter. Samme regel som timer
 * uten beløp i K-259 (timepris_ore og belop_ore er null for support).
 */
export function utenBelop(v) {
  if (Array.isArray(v)) return v.map(utenBelop);
  if (!v || typeof v !== "object") return v;
  const ut = {};
  for (const [k, x] of Object.entries(v)) ut[k] = /_ore$/.test(k) ? null : utenBelop(x);
  return ut;
}

/** Svar fra API-et til rollen support på /api/eiere*: samme JSON uten beløp. Andre svar (feil, andre typer) går uendret. */
export async function utenBelopSvar(svar) {
  if (!(svar instanceof Response) || !(svar.headers.get("Content-Type") ?? "").includes("application/json")) return svar;
  const data = await svar.clone().json().catch(() => null);
  if (data === null) return svar;
  const h = new Headers(svar.headers);
  h.delete("Content-Length");
  return new Response(JSON.stringify(utenBelop(data)), { status: svar.status, headers: h });
}
