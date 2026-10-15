/**
 * K-259: eksempeldata til Hengsel Admin fase B (saker, meldinger, tidsføring, oppstarter), fra docs/design/admin-fase-a/assets/admin-data-bc.js.
 * Legges inn i en lokal database ETTER fase A-dataene (admin-eksempeldata.mjs), til testene og skjermbildene (scripts/skjermbilder-k259.mjs).
 * Alt er oppdiktet og bygges aldri inn i sidene eller migreringene. Fristene settes ut fra «nå» i arbeidstid, så forfalt, snart og pause
 * vises uansett når det kjøres.
 */
import { lagApi } from "./admin-eksempeldata.mjs";
import { lagSak, hentSupportniva } from "../../sites/admin/worker/api-support.js";
import { ulid, idagOslo, pluss } from "../../sites/admin/worker/db.js";
import { leggTilArbeidsminutter, arbeidsminutterMellom } from "../../sites/admin/src/lib/support.js";

export const SUPPORTBRUKER = { epost: "support@eksempel.no", navn: "Supportperson", rolle: "support" };

/** Et tidspunkt som ligger «min» arbeidsminutter før nå (for forfalte frister) */
function arbeidsminutterFor(naaIso, min, arbeidstid) {
  let t = new Date(naaIso).getTime() - min * 60_000;
  for (let i = 0; i < 20000 && arbeidsminutterMellom(new Date(t).toISOString(), naaIso, arbeidstid) < min; i++) t -= 5 * 60_000;
  return new Date(t).toISOString();
}

export async function leggInnEksempeldataB(env, ider, { naa = new Date() } = {}) {
  const db = env.DB;
  const api = lagApi(env);
  const nivaa = await hentSupportniva(db);
  const a = nivaa.verdi.arbeidstid;
  const naaIso = naa.toISOString();
  const idag = idagOslo(naa);
  const forHalvtime = new Date(naa.getTime() - 30 * 60_000);
  const kontakt = async (eier, navn) => db.prepare("SELECT id, navn FROM kontakt WHERE eier_id = ? AND navn = ?").bind(eier, navn).first();
  const butikk = async (eier, navn) => (await db.prepare("SELECT id FROM butikk WHERE eier_id = ? AND navn = ?").bind(eier, navn).first())?.id ?? null;
  const tid = (minFor) => new Date(naa.getTime() - minFor * 60_000).toISOString();

  // Supportpersonen (rollen support i tabellen bruker)
  await db.prepare("INSERT INTO bruker (id, epost, navn, rolle, aktiv, opprettet, endret) VALUES (?, ?, ?, 'support', 1, ?, ?)").bind(ulid(), SUPPORTBRUKER.epost, SUPPORTBRUKER.navn, naaIso, naaIso).run();

  const SAKER = [
    { nr: 1040, eier: "vestby", butikk: "Vestby Kjøkken", kontakt: "Anne Vestby", kilde: "epost", prioritet: "kritisk", status: "lost", emne: "Kan ikke logge inn etter nytt passord", tekst: "Hei. Jeg byttet passord i går og kommer ikke inn nå. Haster, vi har kunder i butikken.", dagerFor: 6 },
    { nr: 1041, eier: "granlund", butikk: "Granlund Kongsberg", kontakt: "Mette Aas", kilde: "hjelp-crm", prioritet: "normal", status: "lost", emne: "Feil adresse på ordrebekreftelse", tekst: "Ordrebekreftelsen viser gammel adresse for Kongsberg-butikken.", dagerFor: 5 },
    { nr: 1042, eier: "aune", butikk: "Aune Kjøkken Fauske", kontakt: "Bjørn Aune", kilde: "hjelp-ute", prioritet: "hoy", status: "lost", emne: "Bilder lastes ikke opp fra montasje", tekst: "Montøren får ikke lastet opp bilder fra montasjen i dag.", dagerFor: 2 },
    { nr: 1043, eier: "strand", butikk: "Strand Interiør Sørlandsparken", kontakt: "Eva Strand", kilde: "epost", prioritet: "lav", status: "aapen", emne: "Ønske: eksport av montørtimer til Excel", tekst: "Kan vi få eksportert montørtimene per måned til Excel?", frist: 720, dagerFor: 2 },
    { nr: 1044, eier: "granlund", butikk: "Granlund Hønefoss", kontakt: "Lars Granlund", kilde: "hjelp-crm", prioritet: "hoy", status: "aapen", emne: "Oktoberrapporten viser feil sum", tekst: "Summen i månedsrapporten stemmer ikke med ordrene.", frist: -10, dagerFor: 1 },
    { nr: 1045, eier: "vestby", butikk: "Vestby Kjøkken", kontakt: "Anne Vestby", kilde: "hjelp-crm", prioritet: "normal", status: "venter", emne: "Import av kundeliste fra gammelt system", tekst: "Vi vil importere kundelista fra det gamle systemet. Hvilket format trenger dere?", frist: 300, dagerFor: 2 },
    { nr: 1046, eier: "aune", butikk: "Aune Kjøkken Bodø", kontakt: "Bjørn Aune", kilde: "epost", prioritet: "normal", status: "aapen", emne: "Hvordan legger vi til en ny selger?", tekst: "Vi har fått en ny selger. Hvordan legger vi henne til?", frist: -50, dagerFor: 1 },
    { nr: 1047, eier: "strand", butikk: "Strand Interiør Kvadraturen", kontakt: "Eva Strand", kilde: "hjelp-crm", prioritet: "hoy", status: "aapen", emne: "Logoen mangler på tilbud-PDF", tekst: "Logoen vår kommer ikke med når vi lager PDF av tilbudet. Den vises på skjermen, men ikke i PDF-en. Gjelder alle tilbud i dag. Vi skal sende tre tilbud før lunsj.", frist: 105, dagerFor: 0,
      hjelp: { side: "Tilbud › T-2026-118 › Forhåndsvis PDF", adresse: "strand.hengsel.no/tilbud/T-2026-118", versjon: "Hengsel CRM 2.0.4", enhet: "Chrome 129 · Windows 11 · 1920 × 1080", bruker: "Eva Strand (admin i CRM)" },
      skjermbilde: { nokkel: "saker/eksempel/skjermbilde-tilbud-pdf.png", type: "image/png", navn: "skjermbilde-tilbud-pdf.png", bytes: 184320 } },
    { nr: 1048, eier: "granlund", butikk: "Granlund Drammen", kontakt: "Mette Aas", kilde: "hjelp-ute", prioritet: "kritisk", status: "ny", emne: "Montørene får ikke åpnet dagens oppdrag", tekst: "Appen henger når jeg trykker på oppdraget hos kunden i Drammen.", frist: 42, dagerFor: 0,
      hjelp: { side: "I dag › Oppdrag", adresse: "granlund.hengsel.no/ute/i-dag", versjon: "Hengsel Ute 1.8.2", enhet: "iPhone 14 · iOS 18.0", bruker: "Mette Aas" } },
  ];
  const saker = {};
  for (const s of SAKER) {
    const eierId = ider[s.eier];
    const k = await kontakt(eierId, s.kontakt);
    const opprettet = s.dagerFor ? new Date(Date.parse(`${pluss(idag, -s.dagerFor)}T07:${String(10 + (s.nr % 40)).padStart(2, "0")}:00Z`)) : forHalvtime;
    const sak = await lagSak(db, { emne: s.emne, tekst: s.tekst, prioritet: s.prioritet, kilde: s.kilde, eier_id: eierId, butikk_id: await butikk(eierId, s.butikk), kontakt_id: k?.id ?? null, kontakt_navn: s.kontakt, hvem: s.kontakt, hjelp: s.hjelp, skjermbilde: s.skjermbilde, opprettet_av: s.kilde.startsWith("hjelp") ? "hjelp" : "Eirik" }, nivaa, opprettet);
    // Løpenummer og frist som i tegningene
    const svarfrist = s.frist == null ? sak.svarfrist : s.frist >= 0 ? leggTilArbeidsminutter(naaIso, s.frist, a) : arbeidsminutterFor(naaIso, -s.frist, a);
    const lost = s.status === "lost" ? new Date(opprettet.getTime() + 45 * 60_000).toISOString() : null;
    await db.prepare("UPDATE sak SET nr_tall = ?, status = ?, svarfrist = ?, frist_stoppet = ?, frist_igjen_min = ?, lost_tid = ?, sist_aktivitet = ? WHERE id = ?")
      .bind(s.nr, s.status, svarfrist, s.status === "venter" ? tid(60 * 20) : null, s.status === "venter" ? s.frist : null, lost, lost ?? opprettet.toISOString(), sak.id).run();
    saker[s.nr] = { ...sak, nr: `H-${s.nr}`, eier_id: eierId };
  }

  // Tråden i H-1047 (60-211 SB2): kunde, internt notat, svar og kundens svar på e-post
  const s47 = saker[1047].id;
  const m = (type, hvem, minFor, tekst, kanal = null) => db.prepare("INSERT INTO melding (id, sak_id, type, hvem, tid, kanal, tekst, utsendelse, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(ulid(), s47, type, hvem, tid(minFor), kanal, tekst, type === "svar" ? "utkast" : null, tid(minFor), tid(minFor)).run();
  await db.prepare("UPDATE melding SET tid = ? WHERE sak_id = ?").bind(tid(29), s47).run();
  await m("intern", "Eirik", 26, "Logoen ble lastet opp på nytt i går (SVG). PDF-motoren støtter kanskje ikke SVG med innebygd font. Sjekker med Code.");
  await m("svar", "Eirik", 22, "Hei Eva. Takk, jeg ser det samme hos meg. Vi ser på det nå. Til saken er løst kan du laste opp logoen som PNG under Innstillinger › Tema, så kommer den med i PDF-en.", "E-post (utkast, ikke sendt)");
  await m("kunde", "Eva Strand", 4, "PNG fungerte for nye tilbud. Men de som allerede er sendt har fortsatt ikke logo. Må vi lage dem på nytt?", "Svar på e-post");
  await db.prepare("UPDATE sak SET sist_aktivitet = ? WHERE id = ?").bind(tid(4), s47).run();
  // Ventende sak: Eirik har bedt om fil
  await db.prepare("INSERT INTO melding (id, sak_id, type, hvem, tid, kanal, tekst, utsendelse, opprettet, endret) VALUES (?, ?, 'svar', 'Eirik', ?, 'E-post (utkast, ikke sendt)', ?, 'utkast', ?, ?)")
    .bind(ulid(), saker[1045].id, tid(60 * 20), "Hei Anne. Send gjerne lista som Excel eller CSV, så ser vi på den.", tid(60 * 20), tid(60 * 20)).run();

  // Tidsføring denne måneden (60-211 SB3): Granlund 4,5 t, Strand 3,75 t, Aune 4,5 t, Vestby 0,75 t
  const forste = `${idag.slice(0, 7)}-01`;
  const dag = (n) => { const d = pluss(forste, n); return d > idag ? idag : d; };
  const fores = (nr, eier, dato, min, tekst, maate = "manuell", fra = null, til = null) => db.prepare("INSERT INTO tidsforing (id, sak_id, eier_id, dato, fra, til, minutter, hvem, hvem_epost, tekst, maate, opprettet, endret) VALUES (?, ?, ?, ?, ?, ?, ?, 'Eirik', 'es@sngroup.no', ?, ?, ?, ?)")
    .bind(ulid(), saker[nr].id, ider[eier], dato, fra, til, min, tekst, maate, naaIso, naaIso).run();
  await fores(1047, "strand", idag, 20, "Feilsøking, gjenskapt feilen", "tidtaker", "08:10", "08:30");
  await fores(1047, "strand", idag, 15, "Telefon med Eva", "manuell", "09:05", "09:20");
  await fores(1043, "strand", dag(2), 90, "Sjekket eksportformat");
  await fores(1047, "strand", dag(1), 100, "Gjennomgang av tilbudsmalen");
  await fores(1044, "granlund", dag(3), 60, "Kontroll av rapporten");
  await fores(1048, "granlund", idag, 30, "Feilsøking i Ute");
  await fores(1041, "granlund", dag(1), 45, "Rettet adressen");
  await fores(1044, "granlund", dag(4), 75, "Møte med Lars");
  await fores(1041, "granlund", dag(5), 30, "Oppfølging");
  await fores(1048, "granlund", dag(6), 30, "Test av ny versjon");
  await fores(1046, "aune", dag(1), 90, "Gjennomgang av brukeroppsett");
  await fores(1042, "aune", dag(2), 105, "Feilsøking bildeopplasting");
  await fores(1046, "aune", dag(3), 45, "Telefon med Bjørn");
  await fores(1042, "aune", dag(4), 30, "Kontroll etter retting");
  await fores(1045, "vestby", dag(1), 30, "Svar om format");
  await fores(1040, "vestby", dag(2), 15, "Nullstilte passord");

  // Tidtakeren går på H-1047 for Eirik (18 min)
  await db.prepare("INSERT INTO tidtaker (sak_id, hvem_epost, startet) VALUES (?, 'es@sngroup.no', ?)").bind(s47, new Date(naa.getTime() - 18 * 60_000 - 24_000).toISOString()).run();

  // ── Oppstarter (60-211 SO1/SO2) ──
  const oppstart = async (avtaleNr, dato) => (await api("POST", "/api/oppstart", { avtale_nr: avtaleNr, oppstartsdato: dato })).id;
  const nordli = await oppstart(ider.avtaleNordli, pluss(idag, 18));
  const elv = (await db.prepare("SELECT nr FROM avtale WHERE eier_id = ?").bind(ider.elvetangen).first("nr"));
  const elvetangen = await oppstart(elv, pluss(idag, 48));
  const strand = await oppstart(ider.avtaleStrand, null);
  const granlund = await oppstart(ider.avtaleGranlund, null);
  const punkter = async (id) => (await api("GET", `/api/oppstart/${id}`)).punkter;
  const sett = async (id, nr, data) => { const p = (await punkter(id)).find((x) => x.nr === nr); await api("PATCH", `/api/oppstartspunkt/${p.id}`, data); return p; };
  await sett(nordli, 1, { status: "venter", dato: pluss(idag, -1), detalj: `${ider.avtaleNordli} i Penneo. Kari Nordli har ikke signert. Sendt ${pluss(idag, -1).slice(8, 10)}.${pluss(idag, -1).slice(5, 7)}, påminnelse om to dager.` });
  await sett(nordli, 2, { status: "ferdig", dato: pluss(idag, -2), detalj: "Egen database (eu-nord-1 · nordli), nettsted og adressen nordli.hengsel.no. Klar, ikke åpnet for brukere." });
  await sett(nordli, 3, { status: "stopper", dato: pluss(idag, -5), detalj: "IT-ansvarlig hos Nordli må godkjenne Hengsel i Microsoft 365 før innlogging virker. Lenke sendt for fem dager siden. Ingen svar." });
  await sett(nordli, 4, { status: "ferdig", dato: pluss(idag, -1), detalj: "Sigdal-tema. Logo mottatt som PNG." });
  await sett(nordli, 5, { status: "ikke", dato: pluss(idag, 13), er_frist: 1, detalj: "Fra Excel og eldre system. Venter på at Microsoft-godkjenningen er på plass." });
  await sett(nordli, 6, { status: "igang", dato: pluss(idag, 14), er_frist: 1, detalj: "14 brukere og 4 montører, fordelt på tre butikker." });
  const p7 = await sett(nordli, 7, { status: "igang", dato: pluss(idag, 15) });
  await api("POST", `/api/oppstartspunkt/${p7.id}/okter`, { navn: "Opplæring 1: selgere", dato: pluss(idag, 15), fra: "09:00", til: "11:00", sted: "Nordli Kjøkken Hamar", deltakere: "Kari Nordli, Per Nordli og 6 selgere" });
  await api("POST", `/api/oppstartspunkt/${p7.id}/okter`, { navn: "Opplæring 2: montører og ordre", dato: pluss(idag, 22), fra: "13:00", til: "15:00", sted: "Video", deltakere: "Per Nordli, Siri Haug og 4 montører" });
  await sett(nordli, 8, { status: "ikke", dato: pluss(idag, 16), er_frist: 1, detalj: "Kundemiljøet får nye versjoner sammen med de andre. Utrullingen skjer ikke fra Admin." });
  await sett(nordli, 9, { status: "ikke", detalj: "Abonnement fra oppstart og etablering (3 × Butikk). Ligger i fakturakjøringen." });
  void elvetangen;
  for (const id of [strand, granlund]) for (const p of await punkter(id)) await api("PATCH", `/api/oppstartspunkt/${p.id}`, { status: "ferdig" });
  // Fullført-datoene som i tegningen (lagres som ferdig_tid)
  await db.prepare("UPDATE oppstartspunkt SET ferdig_tid = ? WHERE oppstart_id = ?").bind(`${pluss(idag, -250)}T10:00:00.000Z`, strand).run();
  await db.prepare("UPDATE oppstartspunkt SET ferdig_tid = ? WHERE oppstart_id = ?").bind(`${pluss(idag, -218)}T10:00:00.000Z`, granlund).run();

  return { ...ider, saker, oppstart: { nordli, elvetangen, strand, granlund } };
}
