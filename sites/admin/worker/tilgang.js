/**
 * Hvem som får se og gjøre hva (K-184, K-240). Dette er den eneste lista over personer, og den inneholder bare e-postadresser, ingen hemmeligheter.
 *
 * - `alle: true` = alle sidene (salg, kunder, avtaler, innstillinger og Drift med alle kundemappene).
 * - `rolle: "eier"` = kan også skrive gjennom /api (fase A: bare Eirik). Alle andre får 403 på POST/PATCH/DELETE.
 * - `kunder: [...]` = bare disse kundemappene under Drift (/drift/kunder/<id>), for en senere «kunde-admin». Resten er stengt for dem.
 * - `rolle: "support"` (K-259, 60-211; K-469): ser Støtte (Saker og Timer, timer uten beløp) og Kunder (bare lesing, uten beløp:
 *   utenBelop i worker/index.js), leser og skriver saker og tidsføring, og får ADM-403 på alt annet. Supportpersoner står ikke her, men i tabellen bruker i D1 (rolle = 'support', aktiv = 1), så Eirik kan legge dem
 *   til uten kodeendring (supportFraDb). Databasen kan bare gi rollen support, aldri eier.
 * Cloudflare Access slipper inn hvem Access-policyen sier; denne lista er et ekstra lag som Workeren sjekker selv, så en for vid Access-policy
 * ikke gir innsyn. En adresse som ikke står her, får 403 selv med gyldig Access-token.
 */
export const ROLLER = {
  "es@sngroup.no": { alle: true, rolle: "eier", navn: "Eirik" },
  // Eksempel for senere (ikke i bruk): "innkjop@kunde.no": { kunder: ["eksempel-kjokken"], navn: "Innkjøp" },
};

/** Filer som alle innloggede trenger for å vise en side. Ingen data. */
const FELLES = [/^\/_astro\//, /^\/fonts\//, /^\/logo\//, /^\/favicon[\w-]*\.(?:svg|png|ico)$/, /^\/404(?:\.html)?$/];

/**
 * K-469 (26-001): filene innloggingskortene trenger før innlogging (stilark, skrifter, logo, favicon). Ingen data og ingen skript; alt annet
 * krever gyldig Access-token som før.
 */
const UTEN_INNLOGGING = [/^\/_astro\/[\w.-]+\.(?:css|svg|woff2?)$/, /^\/fonts\/[\w./-]+\.woff2?$/, /^\/logo\/[\w.-]+\.svg$/, /^\/favicon[\w-]*\.(?:svg|png|ico)$/];
export const utenInnlogging = (sti) => typeof sti === "string" && !sti.includes("..") && UTEN_INNLOGGING.some((re) => re.test(sti));

/** @returns {{alle?: boolean, rolle?: string, navn?: string, kunder?: string[]} | null} */
export function rolleFor(epost) {
  if (typeof epost !== "string") return null;
  return ROLLER[epost.trim().toLowerCase()] ?? null;
}

/** Sider og API-ruter rollen support får se (60-211 «Rolle Support»). Alt annet gir ADM-403 / «Ingen tilgang». */
const SUPPORT_SE = [/^\/support(?:\/.*)?$/, /^\/stotte(?:\.html)?$/, /^\/kunder(?:\/[A-Za-z0-9_-]+)?(?:\.html)?$/, /^\/api\/eiere(?:\/[A-Za-z0-9_-]+)?$/, /^\/ingen-tilgang(?:\.html|\/)?$/, /^\/api\/meg$/, /^\/api\/meny-tall$/, /^\/api\/saker(?:\/.*)?$/, /^\/api\/timer(?:\/.*)?$/, /^\/api\/tidsforing(?:\/.*)?$/];
/** API-ruter rollen support får skrive til */
const SUPPORT_SKRIVE = [/^\/api\/saker(?:\/.*)?$/, /^\/api\/tidsforing(?:\/.*)?$/];
const utenSkraastrek = (sti) => (sti.length > 1 ? sti.replace(/\/+$/, "") : sti);

/** Kan denne rollen hente denne stien? */
export function kanSe(rolle, sti) {
  if (!rolle) return false;
  if (rolle.alle) return true;
  if (FELLES.some((re) => re.test(sti))) return true;
  if (rolle.rolle === "support") return !sti.includes("..") && SUPPORT_SE.some((re) => re.test(utenSkraastrek(sti)));
  const m = /^\/drift\/kunder\/([a-z0-9-]+)(?:\.html)?\/?$/.exec(sti);
  return !!m && Array.isArray(rolle.kunder) && rolle.kunder.includes(m[1]);
}

/** Kan denne rollen skrive (POST, PATCH, DELETE under /api)? Eier alt; support bare saker og tidsføring. */
export function kanSkrive(rolle, sti = "") {
  if (!rolle) return false;
  if (rolle.rolle === "eier") return true;
  return rolle.rolle === "support" && !sti.includes("..") && SUPPORT_SKRIVE.some((re) => re.test(utenSkraastrek(sti)));
}

/** Supportperson fra tabellen bruker i D1 (bare rollen support, bare aktive). null når adressen ikke finnes eller databasen mangler. */
export async function supportFraDb(db, epost) {
  if (!db || typeof epost !== "string" || !epost) return null;
  try {
    const r = await db.prepare("SELECT navn FROM bruker WHERE epost = ? AND rolle = 'support' AND aktiv = 1").bind(epost.trim().toLowerCase()).first();
    return r ? { rolle: "support", navn: r.navn } : null;
  } catch { return null; }
}
