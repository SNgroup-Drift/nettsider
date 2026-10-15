/**
 * Hvem som får se og gjøre hva (K-184, K-240). Dette er den eneste lista over personer, og den inneholder bare e-postadresser, ingen hemmeligheter.
 *
 * - `alle: true` = alle sidene (salg, kunder, avtaler, innstillinger og Drift med alle kundemappene).
 * - `rolle: "eier"` = kan også skrive gjennom /api (fase A: bare Eirik). Alle andre får 403 på POST/PATCH/DELETE.
 * - `kunder: [...]` = bare disse kundemappene under Drift (/drift/kunder/<id>), for en senere «kunde-admin». Resten er stengt for dem.
 * Cloudflare Access slipper inn hvem Access-policyen sier; denne lista er et ekstra lag som Workeren sjekker selv, så en for vid Access-policy
 * ikke gir innsyn. En adresse som ikke står her, får 403 selv med gyldig Access-token.
 */
export const ROLLER = {
  "es@sngroup.no": { alle: true, rolle: "eier", navn: "Eirik" },
  // Eksempel for senere (ikke i bruk): "innkjop@kunde.no": { kunder: ["eksempel-kjokken"], navn: "Innkjøp" },
};

/** Filer som alle innloggede trenger for å vise en side. Ingen data. */
const FELLES = [/^\/_astro\//, /^\/fonts\//, /^\/logo\//, /^\/favicon[\w-]*\.(?:svg|png|ico)$/, /^\/404(?:\.html)?$/];

/** @returns {{alle?: boolean, rolle?: string, navn?: string, kunder?: string[]} | null} */
export function rolleFor(epost) {
  if (typeof epost !== "string") return null;
  return ROLLER[epost.trim().toLowerCase()] ?? null;
}

/** Kan denne rollen hente denne stien? */
export function kanSe(rolle, sti) {
  if (!rolle) return false;
  if (rolle.alle) return true;
  if (FELLES.some((re) => re.test(sti))) return true;
  const m = /^\/drift\/kunder\/([a-z0-9-]+)(?:\.html)?\/?$/.exec(sti);
  return !!m && Array.isArray(rolle.kunder) && rolle.kunder.includes(m[1]);
}

/** Kan denne rollen skrive (POST, PATCH, DELETE under /api)? Bare eier. */
export function kanSkrive(rolle) {
  return !!rolle && rolle.rolle === "eier";
}
