/**
 * API for «Opprett kunde» (K-272, S-65). Rutene monteres i worker/api.js med monter(rute), bak Access og rollesjekken i index.js (bare eier skriver).
 * I tillegg kreves det at innloggingen er es@sngroup.no for å starte, prøve igjen og fjerne (STARTERE under), selv om flere skulle få rollen eier.
 *
 * Starter GitHub Action «Ny kunde» (workflow_dispatch) i SNgroup-Drift/hengsel-crm med GITHUB_DISPATCH_TOKEN: fin-kornet token, bare dette repoet,
 * rettighet Actions: Read and write (Metadata: Read-only kommer av seg selv), utløp høyst 90 dager. Hemmelighet i Workeren, aldri i repoet eller D1.
 * Action-en rapporterer hvert steg til POST /api/oppstart/rapport (worker/ny-kunde-rapport.js).
 *
 * Ruter (GET hvis ikke annet er sagt):
 *   /api/ny-kunde/valg · /api/ny-kunde/valider (POST) · /api/ny-kunde (POST starter) · /api/ny-kunde/:id · /api/ny-kunde/:id/prov-igjen (POST)
 *   /api/ny-kunde/:id/fjern (POST, bare testkunder)
 */
import { ApiFeil, naa, ulid, ER_ULID } from "./db.js";
import * as V from "./valider.js";
import { normaliser, tilAction, sjekkliste, sjekklisteTekst, STEG, TEMAER, STATUSNAVN, STEGSTATUSNAVN } from "../src/lib/ny-kunde.js";

export const STARTERE = ["es@sngroup.no"];
export const REPO = "SNgroup-Drift/hengsel-crm";
const ULID_RE = "([0-9A-HJKMNP-TV-Z]{26})";
const alle = async (st) => (await st.all()).results;
const ikkeFunnet = () => new ApiFeil(404, "ADM-404", "Jobben finnes ikke.");

function kreverStarter(bruker) {
  if (!STARTERE.includes(String(bruker?.epost ?? "").toLowerCase()) || bruker.rolle !== "eier") throw new ApiFeil(403, "ADM-403", "Bare es@sngroup.no kan opprette og fjerne kunder.");
}

/** Starter en workflow. Feilen forteller bare HTTP-status, aldri tokenet. */
export async function startWorkflow(env, fil, ref, inputs) {
  const token = env.GITHUB_DISPATCH_TOKEN;
  if (!token) throw new ApiFeil(503, "ADM-503", "GitHub-tokenet mangler (Worker-hemmeligheten GITHUB_DISPATCH_TOKEN). Se claude/k272-rapport.md i hengsel-crm.");
  const repo = env.GITHUB_REPO || REPO;
  let svar;
  try {
    svar = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${fil}/dispatches`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "hengsel-admin", "Content-Type": "application/json" },
      body: JSON.stringify({ ref, inputs }),
    });
  } catch { throw new ApiFeil(502, "ADM-502", "Kunne ikke nå GitHub."); }
  if (svar.status !== 204 && svar.status !== 200) {
    const hint = svar.status === 401 || svar.status === 403 ? " Sjekk at tokenet ikke er utløpt og har Actions: Read and write på hengsel-crm." : svar.status === 404 || svar.status === 422 ? ` Finnes ${fil} på grenen ${ref}?` : "";
    throw new ApiFeil(502, "ADM-502", `GitHub avviste starten (HTTP ${svar.status}).${hint}`);
  }
}

async function logg(db, jobbId, hvem, handling, detalj = null) {
  await db.prepare("INSERT INTO ny_kunde_logg (jobb_id, tid, hvem, handling, detalj) VALUES (?, ?, ?, ?, ?)").bind(jobbId, naa(), hvem, handling, detalj).run();
}

function visJobb(j) {
  return {
    id: j.id, kunde_id: j.kunde_id, navn: j.navn, test: !!j.test, git_ref: j.git_ref, torrkjoring: !!j.torrkjoring, status: j.status, status_navn: STATUSNAVN[j.status] ?? j.status, gjeldende_steg: j.gjeldende_steg,
    run_url: j.run_url, startet_av: j.startet_av, opprettet: j.opprettet, endret: j.endret, ferdig_tid: j.ferdig_tid,
    resultat: j.resultat ? (() => { try { return JSON.parse(j.resultat); } catch { return null; } })() : null,
  };
}
const visSteg = (s) => ({ nr: s.nr, kode: s.kode, navn: s.navn, status: s.status, status_navn: STEGSTATUSNAVN[s.status] ?? s.status, forsok: s.forsok, startet: s.startet, ferdig: s.ferdig, sekunder: s.sekunder, feil: s.feil, logg: s.logg, resultat: s.resultat ? (() => { try { return JSON.parse(s.resultat); } catch { return null; } })() : null });

async function hentJobb(db, id) {
  const j = await db.prepare("SELECT * FROM ny_kunde_jobb WHERE id = ?").bind(id).first();
  if (!j) throw ikkeFunnet();
  return j;
}

export function monter(rute) {
  rute("GET", "/api/ny-kunde/valg", async ({ env }) => ({
    temaer: TEMAER.map(([kode, navn]) => ({ kode, navn })), steg: STEG,
    kan_starte: !!env.GITHUB_DISPATCH_TOKEN && !!env.NY_KUNDE_RAPPORTNOKKEL,
    mangler: [!env.GITHUB_DISPATCH_TOKEN && "GITHUB_DISPATCH_TOKEN", !env.NY_KUNDE_RAPPORTNOKKEL && "NY_KUNDE_RAPPORTNOKKEL"].filter(Boolean),
    repo: env.GITHUB_REPO || REPO,
  }));

  // Kontroll uten å starte noe (oppsummeringssteget i veiviseren)
  rute("POST", "/api/ny-kunde/valider", async ({ req, db }) => {
    const b = await V.lesJson(req);
    const ider = (await alle(db.prepare("SELECT kunde_id FROM ny_kunde_jobb WHERE status <> 'fjernet'"))).map((r) => r.kunde_id);
    const { kunde, feil } = normaliser(b, { eksisterendeIder: ider });
    if (!kunde) throw new ApiFeil(400, "ADM-400", "Oppsettet har feil.", feil);
    return { kunde, sjekkliste: sjekkliste({ navn: kunde.navn, innstilling: tilAction(kunde) }) };
  });

  rute("GET", "/api/ny-kunde", async ({ db }) => {
    const jobber = await alle(db.prepare("SELECT * FROM ny_kunde_jobb ORDER BY opprettet DESC LIMIT 100"));
    return { jobber: jobber.map(visJobb) };
  });

  rute("POST", "/api/ny-kunde", async ({ req, env, db, bruker }) => {
    kreverStarter(bruker);
    const b = await V.lesJson(req);
    if (b.bekreftet !== true) throw new ApiFeil(400, "ADM-400", "Oppsummeringen må bekreftes.", { bekreftet: "Bekreft oppsummeringen." });
    const ider = (await alle(db.prepare("SELECT kunde_id FROM ny_kunde_jobb WHERE status <> 'fjernet'"))).map((r) => r.kunde_id);
    const { kunde, feil } = normaliser(b, { eksisterendeIder: ider });
    if (!kunde) throw new ApiFeil(400, "ADM-400", "Oppsettet har feil.", feil);
    const ref = b.ref === "demo" ? "demo" : "main";
    if (ref === "demo" && !kunde.test) throw new ApiFeil(400, "ADM-400", "Bare testkunder kan settes opp fra demo.", { ref: "Velg main for en ekte kunde." });
    const torr = b.torrkjoring === true;
    if (!env.NY_KUNDE_RAPPORTNOKKEL && !torr) throw new ApiFeil(503, "ADM-503", "NY_KUNDE_RAPPORTNOKKEL mangler, så Action-en kan ikke rapportere. Se claude/k272-rapport.md i hengsel-crm.");
    const id = ulid(), t = naa();
    const innstilling = JSON.stringify(tilAction(kunde));
    await db.batch([
      db.prepare("INSERT INTO ny_kunde_jobb (id, kunde_id, navn, test, innstilling, git_ref, torrkjoring, status, startet_av, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, 'ny', ?, ?, ?)").bind(id, kunde.id, kunde.navn, kunde.test ? 1 : 0, innstilling, ref, torr ? 1 : 0, bruker.epost, t, t),
      ...STEG.map((s) => db.prepare("INSERT INTO ny_kunde_steg (id, jobb_id, nr, kode, navn, endret) VALUES (?, ?, ?, ?, ?, ?)").bind(ulid(), id, s.nr, s.kode, s.navn, t)),
    ]).catch((e) => { if (/UNIQUE/.test(String(e?.message))) throw new ApiFeil(409, "ADM-409", `Kunde-id «${kunde.id}» er allerede i bruk.`, { id: "Allerede i bruk." }); throw e; });
    await logg(db, id, bruker.epost, torr ? "startet (tørrkjøring)" : "startet", `${kunde.id}, gren ${ref}`);
    try {
      await startWorkflow(env, "ny-kunde.yml", ref, { kunde: innstilling, jobb_id: id, fra_steg: "miljo", torrkjoring: torr ? "true" : "false" });
    } catch (e) {
      await db.prepare("UPDATE ny_kunde_jobb SET status = 'feil', endret = ? WHERE id = ?").bind(naa(), id).run();
      await logg(db, id, "Admin", "start feilet", e.message);
      throw e;
    }
    return { id };
  });

  rute("GET", `/api/ny-kunde/${ULID_RE}`, async ({ db, p }) => {
    const j = await hentJobb(db, p[0]);
    const steg = await alle(db.prepare("SELECT * FROM ny_kunde_steg WHERE jobb_id = ? ORDER BY nr").bind(j.id));
    const hist = await alle(db.prepare("SELECT tid, hvem, handling, detalj FROM ny_kunde_logg WHERE jobb_id = ? ORDER BY id DESC LIMIT 200").bind(j.id));
    const pr = steg.find((s) => s.kode === "kundelista" && s.resultat);
    let prUrl = null; try { prUrl = pr ? JSON.parse(pr.resultat).pr_url ?? null : null; } catch { prUrl = null; }
    const ferdig = j.status === "ferdig";
    const s = ferdig ? sjekkliste({ navn: j.navn, test: j.test, innstilling: j.innstilling, pr_url: prUrl }) : null;
    return { jobb: visJobb(j), steg: steg.map(visSteg), historikk: hist, pr_url: prUrl, sjekkliste: s, sjekkliste_tekst: ferdig ? sjekklisteTekst({ navn: j.navn, innstilling: j.innstilling }) : null, kan_fjernes: !!j.test && ["ferdig", "feil"].includes(j.status) };
  });

  // Prøv igjen fra steg X: steg fra X og utover settes tilbake til «venter», og Action-en startes med fra_steg
  rute("POST", `/api/ny-kunde/${ULID_RE}/prov-igjen`, async ({ req, env, db, p, bruker }) => {
    kreverStarter(bruker);
    const j = await hentJobb(db, p[0]);
    const b = await V.lesJson(req);
    const fra = STEG.find((s) => s.kode === b.fra_steg);
    if (!fra) throw new ApiFeil(400, "ADM-400", "Ukjent steg.", { fra_steg: "Velg et steg." });
    if (!["feil", "ferdig"].includes(j.status)) throw new ApiFeil(409, "ADM-409", j.status === "fjernet" || j.status === "fjerner" ? "Kunden er revet ned." : "Jobben pågår. Vent til den stopper eller er ferdig.");
    const t = naa();
    await db.batch([
      db.prepare("UPDATE ny_kunde_steg SET status = 'venter', forsok = forsok + 1, feil = NULL, startet = NULL, ferdig = NULL, sekunder = NULL, endret = ? WHERE jobb_id = ? AND nr >= ?").bind(t, j.id, fra.nr),
      db.prepare("UPDATE ny_kunde_jobb SET status = 'ny', gjeldende_steg = NULL, ferdig_tid = NULL, endret = ? WHERE id = ?").bind(t, j.id),
    ]);
    await logg(db, j.id, bruker.epost, "prøv igjen", `fra steg ${fra.nr} (${fra.kode})`);
    try {
      await startWorkflow(env, "ny-kunde.yml", j.git_ref, { kunde: j.innstilling, jobb_id: j.id, fra_steg: fra.kode, torrkjoring: j.torrkjoring ? "true" : "false" });
    } catch (e) {
      await db.prepare("UPDATE ny_kunde_jobb SET status = 'feil', endret = ? WHERE id = ?").bind(naa(), j.id).run();
      await logg(db, j.id, "Admin", "start feilet", e.message);
      throw e;
    }
    return { id: j.id };
  });

  // Fjern testkunde: bare kunder merket test, og kunde-id-en må skrives på nytt. Action-en sjekker merkingen en gang til i GitHub-miljøet.
  rute("POST", `/api/ny-kunde/${ULID_RE}/fjern`, async ({ req, env, db, p, bruker }) => {
    kreverStarter(bruker);
    const j = await hentJobb(db, p[0]);
    const b = await V.lesJson(req);
    if (!j.test) throw new ApiFeil(403, "ADM-403", "Bare kunder merket test kan fjernes herfra.");
    if (!["ferdig", "feil"].includes(j.status)) throw new ApiFeil(409, "ADM-409", "Jobben pågår, eller kunden er allerede revet ned.");
    if (b.bekreft !== j.kunde_id) throw new ApiFeil(400, "ADM-400", "Skriv kunde-id-en for å bekrefte.", { bekreft: `Skriv «${j.kunde_id}».` });
    await db.prepare("UPDATE ny_kunde_jobb SET status = 'fjerner', endret = ? WHERE id = ?").bind(naa(), j.id).run();
    await logg(db, j.id, bruker.epost, "fjern testkunde", j.kunde_id);
    try {
      await startWorkflow(env, "fjern-kunde.yml", j.git_ref, { kunde_id: j.kunde_id, bekreft: b.bekreft, jobb_id: j.id, torrkjoring: "false" });
    } catch (e) {
      await db.prepare("UPDATE ny_kunde_jobb SET status = 'feil', endret = ? WHERE id = ?").bind(naa(), j.id).run();
      await logg(db, j.id, "Admin", "start feilet", e.message);
      throw e;
    }
    return { id: j.id };
  });
}
export { ER_ULID };
