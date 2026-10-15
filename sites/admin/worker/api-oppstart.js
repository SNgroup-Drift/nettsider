/**
 * API for Oppstart i Hengsel Admin fase B (K-259, 60-211 SO1/SO2). Rutene monteres i worker/api.js med monter(rute), bak samme Access-sjekk.
 * Bare rollen eier (support får ADM-403 i worker/tilgang.js). Status for en oppstart beregnes fra de ni punktene (oppstartStatus i
 * src/lib/support.js) og lagres ikke. Punkt 1 «Avtale signert» følger avtalen: når avtalen er signert, regnes punktet som ferdig.
 *
 * Ruter (GET hvis ikke annet er sagt):
 *   /api/oppstart (POST ny fra avtale) · /api/oppstart/valg · /api/oppstart/:id (PATCH dato, ansvarlig) · /api/oppstart/:id/paaminnelse (POST)
 *   /api/oppstartspunkt/:id (PATCH status, ansvarlig, dato, detalj) · /api/oppstartspunkt/:id/okter (POST) · /api/opplaeringsokt/:id (PATCH, DELETE)
 *   /api/oversikt/oppstart (SA1-kortet «Oppstarter i gang»)
 */
import { ApiFeil, naa, idagOslo, ulid, innstilling, forsteINesteMnd, dagerMellom } from "./db.js";
import * as V from "./valider.js";
import { OPPSTARTSTATUSER, OPPSTARTSTATUSNAVN, ANSVARLIGE, ANSVARLIGNAVN, OPPSTARTSPUNKTER, oppstartStatus } from "../src/lib/support.js";

const ULID = "([0-9A-HJKMNP-TV-Z]{26})";
const alle = async (st) => (await st.all()).results;
const ikkeFunnet = (m = "Finnes ikke.") => new ApiFeil(404, "ADM-404", m);
const konflikt = (m) => new ApiFeil(409, "ADM-409", m);

/** Punktene med avtalens status lagt over punkt 1, og øktene for opplæringen */
async function punkterFor(db, oppstarter) {
  if (!oppstarter.length) return new Map();
  const ider = oppstarter.map((o) => o.id);
  const sp = ider.map(() => "?").join(",");
  const punkter = await alle(db.prepare(`SELECT * FROM oppstartspunkt WHERE oppstart_id IN (${sp}) ORDER BY nr`).bind(...ider));
  const okter = punkter.length ? await alle(db.prepare(`SELECT * FROM opplaeringsokt WHERE punkt_id IN (${punkter.map(() => "?").join(",")}) ORDER BY dato, fra`).bind(...punkter.map((p) => p.id))) : [];
  const ut = new Map(ider.map((id) => [id, []]));
  for (const p of punkter) {
    const o = oppstarter.find((x) => x.id === p.oppstart_id);
    const status = p.nr === 1 && o.avtale_status === "signert" ? "ferdig" : p.status;
    ut.get(p.oppstart_id).push({ ...p, status, lagret_status: p.status, fra_avtale: p.nr === 1 && o.avtale_status === "signert", ansvarlig_navn: ANSVARLIGNAVN[p.ansvarlig], status_navn: OPPSTARTSTATUSNAVN[status], okter: okter.filter((k) => k.punkt_id === p.id) });
  }
  return ut;
}

const OPPSTART_SQL = `SELECT o.*, e.navn AS eier_navn, a.nr AS avtale_nr, a.status AS avtale_status, a.signert_tid AS avtale_signert
  FROM oppstart o JOIN eier e ON e.id = o.eier_id LEFT JOIN avtale a ON a.id = o.avtale_id`;

function visOppstart(o, punkter, idag) {
  const s = oppstartStatus(punkter);
  const fullfort = s.status === "ferdig" ? punkter.map((p) => p.ferdig_tid).filter(Boolean).sort().pop() ?? null : null;
  return {
    id: o.id, eier_id: o.eier_id, eier_navn: o.eier_navn, avtale_nr: o.avtale_nr, avtale_status: o.avtale_status, oppstartsdato: o.oppstartsdato, ansvarlig: o.ansvarlig,
    dager_igjen: dagerMellom(idag, o.oppstartsdato), status: s.status, status_navn: OPPSTARTSTATUSNAVN[s.status], ferdig: s.ferdig, av: s.av, fullfort,
    neste: s.neste ? { nr: s.neste.nr, punkt: s.neste.punkt, ansvarlig: s.neste.ansvarlig, ansvarlig_navn: ANSVARLIGNAVN[s.neste.ansvarlig] } : null,
    stopper: s.stopper.map((p) => ({ nr: p.nr, punkt: p.punkt, detalj: p.detalj })), venter: s.venter.map((p) => ({ nr: p.nr, punkt: p.punkt })),
  };
}

async function hentOppstart(db, id) {
  const o = await db.prepare(`${OPPSTART_SQL} WHERE o.id = ?`).bind(id).first();
  if (!o) throw ikkeFunnet("Oppstarten finnes ikke.");
  return o;
}

/** Den faste lista (innstillingen «oppstart_punkter», ellers den innebygde) */
async function malPunkter(db) {
  const v = (await innstilling(db, "oppstart_punkter", OPPSTARTSPUNKTER)).verdi;
  return Array.isArray(v) && v.length === 9 && v.every((p) => p && ANSVARLIGE.includes(p.ansvarlig) && typeof p.punkt === "string") ? v : OPPSTARTSPUNKTER;
}

export function monter(rute) {
  // SO2 Oppstarter i gang og fullførte
  rute("GET", "/api/oppstart", async ({ db }) => {
    const idag = idagOslo();
    const oppstarter = await alle(db.prepare(`${OPPSTART_SQL} ORDER BY o.oppstartsdato`));
    const p = await punkterFor(db, oppstarter);
    const liste = oppstarter.map((o) => visOppstart(o, p.get(o.id), idag));
    return { idag, i_gang: liste.filter((o) => o.status !== "ferdig"), fullfort: liste.filter((o) => o.status === "ferdig").sort((a, b) => String(b.fullfort).localeCompare(String(a.fullfort))) };
  });

  // Avtaler som kan få oppstart (til signering eller signert, uten oppstart). Oppstarten åpnes når avtalen sendes (60-212 valg 9).
  rute("GET", "/api/oppstart/valg", async ({ db }) => ({
    avtaler: await alle(db.prepare(`SELECT a.nr, a.status, a.start, e.navn AS eier_navn FROM avtale a JOIN eier e ON e.id = a.eier_id
      WHERE a.status IN ('signering', 'signert') AND NOT EXISTS (SELECT 1 FROM oppstart o WHERE o.avtale_id = a.id) ORDER BY a.opprettet DESC`)),
  }));

  // Ny oppstart fra en avtale, med de ni punktene fra malen
  rute("POST", "/api/oppstart", async ({ req, db }) => {
    const b = await V.lesJson(req);
    const nr = V.tekst(b.avtale_nr, "avtale_nr", { maks: 20, pakrevd: true });
    const a = await db.prepare("SELECT * FROM avtale WHERE nr = ?").bind(nr).first();
    if (!a) throw V.feil("avtale_nr", "Avtalen finnes ikke.");
    if (await db.prepare("SELECT 1 FROM oppstart WHERE avtale_id = ?").bind(a.id).first()) throw konflikt("Avtalen har allerede en oppstart.");
    const dato = V.dato(b.oppstartsdato, "oppstartsdato") ?? a.start ?? forsteINesteMnd(idagOslo());
    const id = ulid(), t = naa();
    const mal = await malPunkter(db);
    await db.batch([
      db.prepare("INSERT INTO oppstart (id, eier_id, avtale_id, oppstartsdato, ansvarlig, opprettet, endret) VALUES (?, ?, ?, ?, 'Eirik', ?, ?)").bind(id, a.eier_id, a.id, dato, t, t),
      ...mal.map((p, i) => db.prepare("INSERT INTO oppstartspunkt (id, oppstart_id, nr, punkt, ansvarlig, dato, er_frist, status, detalj, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, 'ikke', ?, ?, ?)")
        .bind(ulid(), id, i + 1, p.punkt, p.ansvarlig, i === 8 ? dato : null, 0, i === 0 ? `${a.nr} i Penneo.` : null, t, t)),
    ]);
    return { id };
  });

  // SO1 Oppstart for én kunde
  rute("GET", `/api/oppstart/${ULID}`, async ({ db, p }) => {
    const o = await hentOppstart(db, p[0]);
    const idag = idagOslo();
    const punkter = (await punkterFor(db, [o])).get(o.id);
    const alleOppstarter = await alle(db.prepare(`SELECT o.id, e.navn AS eier_navn FROM oppstart o JOIN eier e ON e.id = o.eier_id ORDER BY o.oppstartsdato`));
    return { idag, oppstart: visOppstart(o, punkter, idag), punkter, andre: alleOppstarter, statuser: OPPSTARTSTATUSER.map((s) => ({ id: s, navn: OPPSTARTSTATUSNAVN[s] })), ansvarlige: ANSVARLIGE.map((a) => ({ id: a, navn: ANSVARLIGNAVN[a] })) };
  });

  rute("PATCH", `/api/oppstart/${ULID}`, async ({ req, db, p }) => {
    const o = await hentOppstart(db, p[0]);
    const b = await V.lesJson(req);
    const dato = b.oppstartsdato !== undefined ? V.dato(b.oppstartsdato, "oppstartsdato", { pakrevd: true }) : o.oppstartsdato;
    const ansvarlig = b.ansvarlig !== undefined ? V.tekst(b.ansvarlig, "ansvarlig", { maks: 60, pakrevd: true }) : o.ansvarlig;
    await db.prepare("UPDATE oppstart SET oppstartsdato = ?, ansvarlig = ?, endret = ? WHERE id = ?").bind(dato, ansvarlig, naa(), o.id).run();
    return {};
  });

  // «Send påminnelse»: logges på eieren. Ingen e-post sendes fra Admin.
  rute("POST", `/api/oppstart/${ULID}/paaminnelse`, async ({ db, p, bruker }) => {
    const o = await hentOppstart(db, p[0]);
    const punkter = (await punkterFor(db, [o])).get(o.id);
    const hos = punkter.filter((x) => x.ansvarlig === "kunden" && ["stopper", "venter", "ikke", "igang"].includes(x.status)).map((x) => x.punkt);
    if (!hos.length) throw konflikt("Ingen punkter venter på kunden.");
    const t = naa();
    await db.prepare("INSERT INTO aktivitet (id, eier_id, type, dato, tittel, tekst, hvem, opprettet, endret) VALUES (?, ?, 'notat', ?, ?, ?, ?, ?, ?)")
      .bind(ulid(), o.eier_id, idagOslo(), "Påminnelse om oppstart", `Venter på kunden: ${hos.join(", ")}. Påminnelsen er logget, ikke sendt (e-postløsningen er ikke bestemt).`, bruker.navn, t, t).run();
    return { logget: true, sendt: false, punkter: hos };
  });

  // Endre et punkt: klikk på status bytter (60-211 SO1)
  rute("PATCH", `/api/oppstartspunkt/${ULID}`, async ({ req, db, p }) => {
    const pk = await db.prepare("SELECT * FROM oppstartspunkt WHERE id = ?").bind(p[0]).first();
    if (!pk) throw ikkeFunnet("Punktet finnes ikke.");
    const b = await V.lesJson(req);
    const status = b.status !== undefined ? V.valg(b.status, "status", OPPSTARTSTATUSER, { pakrevd: true }) : pk.status;
    const ansvarlig = b.ansvarlig !== undefined ? V.valg(b.ansvarlig, "ansvarlig", ANSVARLIGE, { pakrevd: true }) : pk.ansvarlig;
    const dato = b.dato !== undefined ? V.dato(b.dato, "dato") : pk.dato;
    const er_frist = b.er_frist !== undefined ? V.flagg(b.er_frist, "er_frist") : pk.er_frist;
    const detalj = b.detalj !== undefined ? V.tekst(b.detalj, "detalj", { maks: 1000, linjeskift: true }) : pk.detalj;
    const t = naa();
    const ferdigTid = status === "ferdig" ? (pk.status === "ferdig" ? pk.ferdig_tid : t) : null;
    await db.prepare("UPDATE oppstartspunkt SET status = ?, ansvarlig = ?, dato = ?, er_frist = ?, detalj = ?, ferdig_tid = ?, endret = ? WHERE id = ?").bind(status, ansvarlig, dato, er_frist, detalj, ferdigTid, t, pk.id).run();
    return { status };
  });

  // Opplæringsøkter (punkt 7)
  const lesOkt = (b, ny) => ({
    navn: V.tekst(b.navn, "navn", { maks: 120, pakrevd: ny }), dato: V.dato(b.dato, "dato", { pakrevd: ny }),
    fra: b.fra ? (/^([01]\d|2[0-3]):[0-5]\d$/.test(b.fra) ? b.fra : (() => { throw V.feil("fra", "Skriv tid som TT:MM."); })()) : null,
    til: b.til ? (/^([01]\d|2[0-3]):[0-5]\d$/.test(b.til) ? b.til : (() => { throw V.feil("til", "Skriv tid som TT:MM."); })()) : null,
    sted: V.tekst(b.sted, "sted", { maks: 200 }), deltakere: V.tekst(b.deltakere, "deltakere", { maks: 500 }),
  });
  rute("POST", `/api/oppstartspunkt/${ULID}/okter`, async ({ req, db, p }) => {
    const pk = await db.prepare("SELECT id FROM oppstartspunkt WHERE id = ?").bind(p[0]).first();
    if (!pk) throw ikkeFunnet("Punktet finnes ikke.");
    const o = lesOkt(await V.lesJson(req), true);
    const id = ulid(), t = naa();
    await db.prepare("INSERT INTO opplaeringsokt (id, punkt_id, navn, dato, fra, til, sted, deltakere, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, pk.id, o.navn, o.dato, o.fra, o.til, o.sted, o.deltakere, t, t).run();
    return { id };
  });
  rute("PATCH", `/api/opplaeringsokt/${ULID}`, async ({ req, db, p }) => {
    const k = await db.prepare("SELECT * FROM opplaeringsokt WHERE id = ?").bind(p[0]).first();
    if (!k) throw ikkeFunnet("Økten finnes ikke.");
    const b = await V.lesJson(req);
    const o = lesOkt({ ...k, ...b }, true);
    await db.prepare("UPDATE opplaeringsokt SET navn = ?, dato = ?, fra = ?, til = ?, sted = ?, deltakere = ?, endret = ? WHERE id = ?").bind(o.navn, o.dato, o.fra, o.til, o.sted, o.deltakere, naa(), k.id).run();
    return {};
  });
  rute("DELETE", `/api/opplaeringsokt/${ULID}`, async ({ db, p }) => {
    await db.prepare("DELETE FROM opplaeringsokt WHERE id = ?").bind(p[0]).run();
    return {};
  });

  // SA1-kortet «Oppstarter i gang»
  rute("GET", "/api/oversikt/oppstart", async ({ db }) => {
    const idag = idagOslo();
    const oppstarter = await alle(db.prepare(`${OPPSTART_SQL} ORDER BY o.oppstartsdato`));
    const p = await punkterFor(db, oppstarter);
    return { i_gang: oppstarter.map((o) => visOppstart(o, p.get(o.id), idag)).filter((o) => o.status !== "ferdig") };
  });
}
