/**
 * K-260: eksempeldata til Hengsel Admin fase C og Drift (60-211, assets/admin-data-bc.js), lagt inn gjennom API-et i en lokal database etter
 * eksempeldataene fra fase A (admin-eksempeldata.mjs). Brukes av testene og skjermbildene (scripts/skjermbilder-k260.mjs). Alt er oppdiktet
 * og bygges aldri inn i sidene eller migreringene. Datoene regnes fra «i dag», så neste fakturakjøring er alltid neste måned.
 *
 * To ting kan ikke lages gjennom API-et i fase C og settes rett i den lokale databasen, merket under:
 *  - tidsføringen er fase B (K-259). Finnes ikke tabellen, lages en minste utgave med den avtalte formen (eier_id, dato, minutter, fakturert_kjoring_id).
 *  - statusene Sendt og Feil kommer fra PowerOffice, som ikke er koblet til. De settes for hånd så kortene kan vises.
 */
import { leggInnEksempeldata, lagApi } from "./admin-eksempeldata.mjs";
import { idagOslo, pluss, ulid } from "../../sites/admin/worker/db.js";
import { leggTilMnd, maanedFor, forsteIMnd } from "../../sites/admin/src/lib/fakturering.js";

export async function leggInnEksempeldataC(env, { idag = idagOslo(), endringer = true, statuser = true } = {}) {
  const ider = await leggInnEksempeldata(env, { idag });
  const api = lagApi(env);
  const db = env.DB;
  const d = (n) => pluss(idag, n);
  const neste = leggTilMnd(maanedFor(idag), 1);
  const forrige = leggTilMnd(maanedFor(idag), 0);

  // Nordli signerer med start den 1. i neste måned (ny kunde i neste fakturakjøring, med etablering)
  await api("PATCH", `/api/avtaler/${ider.avtaleNordli}`, { start: forsteIMnd(neste) });
  await api("POST", `/api/avtaler/${ider.avtaleNordli}/signert`, { rekkefolge: 1 });
  await api("POST", `/api/avtaler/${ider.avtaleNordli}/signert`, { rekkefolge: 2 });

  // Abonnement fra hver signerte avtale
  for (const n of ["avtaleGranlund", "avtaleStrand", "avtaleVestby", "avtaleAune", "avtaleHovde", "avtaleNordli"]) await api("POST", "/api/abonnement", { avtale_nr: ider[n] });
  const aboer = (await api("GET", "/api/abonnement")).abonnementer;
  ider.abo = Object.fromEntries(aboer.map((a) => [Object.entries(ider).find(([, v]) => v === a.eier_id)?.[0], a.id]));

  if (endringer) {
    const granlund = await api("GET", `/api/abonnement/${ider.abo.granlund}`);
    const jevnaker = granlund.linjer.find((l) => l.butikk_navn === "Granlund Jevnaker");
    await api("POST", `/api/abonnement/${ider.abo.granlund}/endringer`, { type: "pakke", linje_id: jevnaker.id, pakke: "butikk", gjelder_fra: forsteIMnd(neste) });
  }

  // Tidsføring forrige måned (fase B). Lages bare når K-259 ikke har laget tabellen.
  await db.exec("CREATE TABLE IF NOT EXISTS tidsforing (id TEXT PRIMARY KEY, eier_id TEXT NOT NULL, dato TEXT NOT NULL, minutter INTEGER NOT NULL, fakturert_kjoring_id TEXT)");
  const kol = new Set((await db.prepare("SELECT name FROM pragma_table_info('tidsforing')").all()).results.map((r) => r.name));
  const dag = forsteIMnd(forrige).replace(/-01$/, "-12");
  const timer = [["granlund", 270], ["strand", 225], ["aune", 270], ["vestby", 45]];
  if (kol.has("sak_id")) {
    // K-259 (0002): tidsføring hører til en sak. Én eksempelsak per eier.
    const t = "2026-10-01T08:00:00Z";
    let nr = 9001;
    for (const [eier, min] of timer) {
      const sak = ulid();
      await db.prepare("INSERT INTO sak (id, nr_tall, emne, eier_id, kilde, prioritet, status, svarfrist, sist_aktivitet, opprettet, endret) VALUES (?, ?, 'Eksempel for fakturakjøring', ?, 'epost', 'normal', 'lost', ?, ?, ?, ?)").bind(sak, nr++, ider[eier], t, t, t, t).run();
      await db.prepare("INSERT INTO tidsforing (id, sak_id, eier_id, dato, minutter, hvem, maate, opprettet, endret) VALUES (?, ?, ?, ?, ?, 'Eirik', 'manuell', ?, ?)").bind(ulid(), sak, ider[eier], dag, min, t, t).run();
    }
  } else if (["id", "eier_id", "dato", "minutter"].every((k) => kol.has(k))) {
    for (const [eier, min] of timer) {
      await db.prepare("INSERT INTO tidsforing (id, eier_id, dato, minutter) VALUES (?, ?, ?, ?)").bind(ulid(), ider[eier], dag, min).run();
    }
  }

  // Neste fakturakjøring: utkast og kostpriser for viderefakturering (legges inn for hånd, 60-212 spørsmål 9)
  await api("POST", `/api/fakturakjoring/${neste}/utkast`);
  const mndNavn = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"][Number(forrige.slice(5)) - 1];
  for (const [eier, tekst, kost] of [["granlund", `SMS, ${mndNavn}`, 41200], ["granlund", `AI, ${mndNavn}`, 28600], ["strand", "Penneo, 2 signeringer", 9800], ["aune", `SMS, ${mndNavn}`, 6400]]) {
    await api("POST", `/api/fakturakjoring/${neste}/viderefakturering`, { eier_id: ider[eier], tekst, kostpris_ore: kost });
  }
  if (statuser) {
    // Simulert: resultatet av en tidligere sending til PowerOffice (ikke koblet til i fase C)
    const k = await db.prepare("SELECT id FROM fakturakjoring WHERE maaned = ?").bind(neste).first();
    await db.prepare("UPDATE faktura SET status = 'sendt', poweroffice_id = 'eksempel', sendt = ? WHERE kjoring_id = ? AND eier_id IN (?, ?)").bind(new Date().toISOString(), k.id, ider.granlund, ider.strand).run();
    await db.prepare("UPDATE faktura SET status = 'feil', feilmelding = 'PowerOffice: kunden finnes ikke. Opprett kunden i PowerOffice og prøv igjen.' WHERE kjoring_id = ? AND eier_id = ?").bind(k.id, ider.nordli).run();
    await db.prepare("UPDATE fakturakjoring SET status = 'delvis_sendt' WHERE id = ?").bind(k.id).run();
  }

  // KPI (prosent for hånd, varsel 30 dager som eksempel)
  await api("PUT", `/api/kpi/${idag.slice(0, 4)}`, { prosent: "3,1", kilde: "SSB, lagt inn for hånd", varsel_dager: 30, eksempel: 1 });

  // Drift: kontoer, frister, rutiner og kundemiljøene Status viser
  const hvelv = "https://start.1password.com/open/i?a=EKSEMPEL&v=hengsel-drift";
  for (const k of [
    { tjeneste: "Database og lagring", eier: "ES-Holding AS (eksempel)", plan: "Pro, eu-nord-1", kost_mnd_ore: 265000, fornyes_tekst: "Månedlig", hvelv: "Hengsel drift", hvelv_url: hvelv },
    { tjeneste: "Nettsted og hosting", eier: "ES-Holding AS (eksempel)", plan: "Team", kost_mnd_ore: 42000, fornyes_tekst: "Månedlig", hvelv: "Hengsel drift", hvelv_url: hvelv },
    { tjeneste: "Domene hengsel.no", eier: "Eirik", plan: "1 år", kost_mnd_ore: 1800, fornyes: d(112), hvelv: "Hengsel drift", hvelv_url: hvelv },
    { tjeneste: "Domene sigdal-crm.no", eier: "Eirik", plan: "1 år", kost_mnd_ore: 1800, fornyes: d(8), hvelv: "Hengsel drift", hvelv_url: hvelv },
    { tjeneste: "Microsoft 365, support@hengsel.no", eier: "ES-Holding AS (eksempel)", plan: "Business Basic, 2 lisenser", kost_mnd_ore: 14000, fornyes: d(79), hvelv: "Hengsel drift", hvelv_url: hvelv },
    { tjeneste: "Penneo", eier: "ES-Holding AS (eksempel)", plan: "Per signering", kost_mnd_ore: 0, fornyes_tekst: "Løpende", hvelv: "Hengsel økonomi", merknad: "Viderefaktureres" },
    { tjeneste: "SMS-leverandør", eier: "ES-Holding AS (eksempel)", plan: "Per melding", kost_mnd_ore: 0, fornyes_tekst: "Løpende", hvelv: "Hengsel drift", merknad: "Viderefaktureres" },
    { tjeneste: "AI-tjeneste", eier: "ES-Holding AS (eksempel)", plan: "Per bruk", kost_mnd_ore: 0, fornyes_tekst: "Løpende", hvelv: "Hengsel drift", merknad: "Viderefaktureres" },
    { tjeneste: "PowerOffice Go", eier: "ES-Holding AS (eksempel)", plan: "Standard", kost_mnd_ore: 59000, fornyes_tekst: "Månedlig", hvelv: "Hengsel økonomi" },
  ]) await api("POST", "/api/drift/kontoer", k);
  for (const f of [
    { tekst: "Fornye domenet sigdal-crm.no", kategori: "Domene", dato: d(8), varsel_dager: 14 },
    { tekst: "Årlig gjennomgang av databehandleravtaler", kategori: "Personvern", dato: d(17), varsel_dager: 30 },
    { tekst: "Test gjenoppretting av sikkerhetskopi", kategori: "Drift", dato: d(18), varsel_dager: 7 },
    { tekst: "KPI-varsel til Aune Kjøkken", kategori: "Fakturering", dato: d(2), varsel_dager: 0 },
    { tekst: "Fornyelse Microsoft 365", kategori: "Konto", dato: d(79), varsel_dager: 30 },
  ]) await api("POST", "/api/drift/frister", f);
  const rutiner = [
    ["maaned", "Hver måned, før den 1.", ["Gå gjennom fakturakjøringen og endringene siden forrige måned", "Før timer ut over inkludert som fakturalinjer", "Legg inn kostpris for SMS, Penneo og AI", "Send til PowerOffice og sjekk at ingen står med Feil"], [true, true, false, false]],
    ["uke", "Hver uke", ["Se over feil siste 7 dager i Status", "Sjekk at alle kundemiljøer har sikkerhetskopi på", "Lukk saker som har ventet på kunden i mer enn 14 dager"], [true, true, false]],
    ["kvartal", "Hvert kvartal", ["Test gjenoppretting av én kundedatabase", "Gå gjennom kontoer og kost per måned"], [false, false]],
  ];
  for (const [gruppe, navn, punkter] of rutiner) await api("POST", "/api/drift/rutiner", { gruppe, navn, punkter });
  const r = (await api("GET", "/api/drift/rutiner")).rutiner;
  for (const [i, [, , , ok]] of rutiner.entries()) for (const [j, p] of r[i].punkter.entries()) if (ok[j]) await api("PUT", `/api/drift/rutinepunkter/${p.id}/avkryssing`, { ok: 1 });
  await api("PUT", "/api/innstillinger/kundemiljoer", { kundemiljoer: [
    { navn: "Granlund Innredning AS", adresse: "granlund.hengsel.no", eier_id: ider.granlund },
    { navn: "Strand Interiør AS", adresse: "strand.hengsel.no", eier_id: ider.strand },
    { navn: "Vestby Kjøkken AS", adresse: "vestby.hengsel.no", eier_id: ider.vestby },
    { navn: "Aune Kjøkken AS", adresse: "aune.hengsel.no", eier_id: ider.aune },
    { navn: "Hovde Interiør AS", adresse: "hovde.hengsel.no", eier_id: ider.hovde },
    { navn: "Nordli Kjøkken AS", adresse: "nordli.hengsel.no", eier_id: ider.nordli },
  ] });
  ider.neste = neste;
  return ider;
}
