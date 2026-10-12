/**
 * Hvem som får se hva (K-184). Dette er den eneste lista over personer, og den inneholder bare e-postadresser, ingen hemmeligheter.
 *
 * - `alle: true`  = Plattform og alle kunder (Eirik).
 * - `kunder: [...]` = bare disse kundemappene (src/data/kunder/<id>), for en senere «kunde-admin». Plattformsidene er stengt for dem.
 * Cloudflare Access slipper inn hvem Access-policyen sier; denne lista er et ekstra lag som Workeren sjekker selv, så en for vid Access-policy
 * ikke gir innsyn. En adresse som ikke står her, får 403 selv med gyldig Access-token.
 */
export const ROLLER = {
  "es@sngroup.no": { alle: true },
  // Eksempel for senere (ikke i bruk): "innkjop@kunde.no": { kunder: ["eksempel-kjokken"] },
};

/** Filer som alle innloggede trenger for å vise en side. Ingen data. */
const FELLES = [/^\/_astro\//, /^\/fonts\//, /^\/logo\//, /^\/favicon[\w-]*\.(?:svg|png)$/, /^\/404(?:\.html)?$/];

/** @returns {{alle?: boolean, kunder?: string[]} | null} */
export function rolleFor(epost) {
  if (typeof epost !== "string") return null;
  return ROLLER[epost.trim().toLowerCase()] ?? null;
}

/** Kan denne rollen hente denne stien? */
export function kanSe(rolle, sti) {
  if (!rolle) return false;
  if (rolle.alle) return true;
  if (FELLES.some((re) => re.test(sti))) return true;
  const m = /^\/kunder\/([a-z0-9-]+)(?:\.html)?\/?$/.exec(sti);
  return !!m && Array.isArray(rolle.kunder) && rolle.kunder.includes(m[1]);
}
