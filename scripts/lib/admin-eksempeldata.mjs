/**
 * K-240: eksempeldata til Hengsel Admin fase A, lagt inn gjennom API-et (worker/api.js) i en lokal database. Brukes av testene og av
 * skjermbildene (scripts/skjermbilder-k240.mjs). Alle navn, org.nr., kontakter, beløp og datoer er oppdiktet (60-213 punkt j) og bygges
 * aldri inn i siden eller migreringene. Datoene regnes fra «i dag», så forfalt, i dag og «fornyes snart» vises uansett når det kjøres.
 */
import { handterApi } from "../../sites/admin/worker/api.js";
import { lagreLead } from "../../sites/admin/worker/lead.js";
import { idagOslo, pluss, plussMnd } from "../../sites/admin/worker/db.js";

export const BRUKER = { epost: "es@sngroup.no", navn: "Eirik", rolle: "eier" };

/** Kall mot API-et uten nettverk: metode, sti, kropp */
export function lagApi(env, bruker = BRUKER) {
  return async (metode, sti, kropp, { fil } = {}) => {
    const hoder = {};
    let body;
    if (fil) { body = new FormData(); body.append("fil", new File([fil.data], fil.navn)); }
    else if (kropp !== undefined) { hoder["Content-Type"] = "application/json"; body = JSON.stringify(kropp); }
    const req = new Request(`https://admin.hengsel.no${sti}`, { method: metode, headers: hoder, body });
    const r = await handterApi(req, env, { bruker });
    const data = await r.json();
    if (!r.ok) throw new Error(`${metode} ${sti} → ${r.status} ${JSON.stringify(data)}`);
    return data;
  };
}

const b = (navn, sted, pakke, brukere, montorer) => ({ navn, sted, pakke, brukere, montorer });
const k = (navn, rolle, telefon, epost, signaturrett = 0) => ({ navn, rolle, telefon, epost, signaturrett, primaer: 0 });

export async function leggInnEksempeldata(env, { idag = idagOslo() } = {}) {
  const api = lagApi(env);
  const d = (n) => pluss(idag, n);
  const ider = {};
  const eier = async (nokkel, data) => { ider[nokkel] = (await api("POST", "/api/eiere", data)).id; return ider[nokkel]; };
  const akt = (eier_id, type, dato, tittel, tekst, neste) => api("POST", "/api/aktiviteter", { eier_id, type, dato, tittel, tekst, ...(neste ? { neste_tekst: neste[0], neste_dato: neste[1] } : {}) });

  // Leverandøren (eksempel, k.2) med utfylte felt så tilbudet kan vises
  await api("PUT", "/api/leverandor", { navn: "ES-Holding AS", orgnr: "929551304", adresse: "Storgata 7, 3510 Hønefoss", epost: "salg@hengsel.no", signatar: "Eirik", signatar_rolle: "daglig leder", signatar_epost: "eirik@eksempel.no", eksempel: 1 });

  // ── Prospekter ──
  await eier("nordli", { navn: "Nordli Kjøkken AS", orgnr: "923456781", adresse: "Strandgata 14", postnr: "2317", sted: "Hamar", fylke: "Innlandet", kjede: "sigdal", produktlinje: "sigdal", status: "forhandling", kilde: "sigdal_kjedemote",
    butikker: [b("Nordli Kjøkken Hamar", "Hamar", "butikk", null, 2), b("Nordli Kjøkken Gjøvik", "Gjøvik", "butikk", null, 1), b("Nordli Kjøkken Lillehammer", "Lillehammer", "butikk", null, 1)],
    kontakter: [k("Kari Nordli", "Daglig leder, beslutter", "913 42 118", "kari@nordli-kjokken.no", 1), k("Per Nordli", "Butikksjef Hamar", "936 10 204", "per@nordli-kjokken.no"), k("Siri Haug", "Økonomi", "482 77 015", "siri@nordli-kjokken.no")] });
  await eier("fjordhuset", { navn: "Fjordhuset Interiør AS", orgnr: "918222405", adresse: "Storgata 31", postnr: "6413", sted: "Molde", fylke: "Møre og Romsdal", kjede: "annen", produktlinje: "hengsel", status: "demo", kilde: "be_om_demo",
    butikker: [b("Fjordhuset Interiør", "Molde", "butikk", null, 2)], kontakter: [k("Ola Fjeld", "Daglig leder", "958 30 447", "ola@fjordhuset.no", 1)] });
  await eier("bakken", { navn: "Bakken & Berg Kjøkken AS", orgnr: "925117093", adresse: "Grønnegata 52", postnr: "9008", sted: "Tromsø", fylke: "Troms", kjede: "annen", produktlinje: "hengsel", status: "ny", kilde: "be_om_demo",
    butikker: [b("Bakken & Berg Tromsø", "Tromsø", "butikk", null, 2), b("Bakken & Berg Harstad", "Harstad", "butikk", null, 1)], kontakter: [k("Jonas Berg", "Daglig leder", "934 20 771", "jonas@bakkenberg.no", 1)] });
  await eier("solsiden", { navn: "Solsiden Interiør AS", orgnr: "931004562", adresse: "Beddingen 10", postnr: "7042", sted: "Trondheim", fylke: "Trøndelag", kjede: "annen", produktlinje: "hengsel", status: "tilbud", kilde: "messe",
    butikker: [b("Solsiden Interiør", "Trondheim", "start", null, 1)], kontakter: [k("Ingrid Lie", "Daglig leder", "911 08 336", "ingrid@solsiden-interior.no", 1)] });
  await eier("elvetangen", { navn: "Elvetangen Kjøkkensenter AS", orgnr: "916330871", adresse: "Elvegata 3", postnr: "3717", sted: "Skien", fylke: "Telemark", kjede: "sigdal", produktlinje: "sigdal", status: "tilbud", kilde: "sigdal_kjedemote",
    butikker: [b("Elvetangen Skien", "Skien", "butikk", null, 2), b("Elvetangen Porsgrunn", "Porsgrunn", "butikk", null, 2), b("Elvetangen Notodden", "Notodden", "butikk", null, 2), b("Elvetangen Bø", "Bø", "butikk", null, 1)], kontakter: [k("Tone Elvetangen", "Daglig leder", "922 61 409", "tone@elvetangen.no", 1)] });
  await eier("lysaker", { navn: "Lysaker Innredning AS", orgnr: "927640118", adresse: "Lysaker torg 5", postnr: "1366", sted: "Lysaker", fylke: "Akershus", kjede: "annen", produktlinje: "hengsel", status: "forhandling", kilde: "messe",
    butikker: [b("Lysaker Innredning", "Bærum", "butikk", null, 1), b("Lysaker Innredning Asker", "Asker", "butikk", null, 1)], kontakter: [k("Henrik Moe", "Daglig leder", "976 33 102", "henrik@lysaker-innredning.no", 1)] });
  await eier("fossum", { navn: "Fossum Interiør AS", orgnr: "926551870", adresse: "Storgata 2", postnr: "2000", sted: "Lillestrøm", fylke: "Akershus", kjede: "annen", produktlinje: "hengsel", status: "forhandling", kilde: "anbefaling",
    butikker: [b("Fossum Interiør Lillestrøm", "Lillestrøm", "komplett", 8, 2), b("Fossum Interiør Jessheim", "Jessheim", "komplett", 6, 1)], kontakter: [k("Mona Fossum", "Daglig leder", "960 02 845", "mona@fossum-interior.no", 1)] });
  await eier("moen", { navn: "Moen Kjøkkenstudio AS", orgnr: "929403615", adresse: "Sjøgata 12", postnr: "8006", sted: "Bodø", fylke: "Nordland", kjede: "sigdal", produktlinje: "sigdal", status: "demo", kilde: "sigdal_kjedemote",
    butikker: [b("Moen Kjøkkenstudio", "Bodø", "start", null, 1)], kontakter: [k("Rune Moen", "Daglig leder", "977 41 920", "rune@moenkjokken.no", 1)] });
  // ── Kunder (signert avtale) ──
  await eier("granlund", { navn: "Granlund Innredning AS", orgnr: "912845330", adresse: "Industriveien 8", postnr: "3511", sted: "Hønefoss", fylke: "Buskerud", kjede: "sigdal", produktlinje: "sigdal", status: "forhandling", kilde: "anbefaling",
    butikker: [b("Granlund Hønefoss", "Hønefoss", "komplett", 12, 6), b("Granlund Drammen", "Drammen", "komplett", 10, 5), b("Granlund Kongsberg", "Kongsberg", "butikk", 5, 3), b("Granlund Hokksund", "Hokksund", "butikk", 4, 2), b("Granlund Jevnaker", "Jevnaker", "start", 3, 1)],
    kontakter: [k("Lars Granlund", "Eier og daglig leder", "917 55 032", "lars@granlund.no", 1), k("Mette Aas", "Driftsleder, admin i CRM", "940 12 680", "mette@granlund.no")] });
  await eier("vestby", { navn: "Vestby Kjøkken AS", orgnr: "914902337", adresse: "Sentrumsvegen 9", postnr: "1540", sted: "Vestby", fylke: "Akershus", kjede: "sigdal", produktlinje: "sigdal", status: "forhandling", kilde: "sigdal_kjedemote",
    butikker: [b("Vestby Kjøkken", "Vestby", "butikk", 5, 2)], kontakter: [k("Anne Vestby", "Daglig leder", "995 21 560", "anne@vestbykjokken.no", 1)] });
  await eier("strand", { navn: "Strand Interiør AS", orgnr: "919774206", adresse: "Markens gate 40", postnr: "4611", sted: "Kristiansand", fylke: "Agder", kjede: "annen", produktlinje: "hengsel", status: "forhandling", kilde: "be_om_demo",
    butikker: [b("Strand Interiør Kvadraturen", "Kristiansand", "butikk", 6, 3), b("Strand Interiør Sørlandsparken", "Kristiansand", "butikk", 5, 2)], kontakter: [k("Eva Strand", "Daglig leder", "948 70 113", "eva@strandinterior.no", 1)] });
  await eier("aune", { navn: "Aune Kjøkken AS", orgnr: "911336904", adresse: "Kongens gate 18", postnr: "8006", sted: "Bodø", fylke: "Nordland", kjede: "sigdal", produktlinje: "sigdal", status: "forhandling", kilde: "sigdal_kjedemote",
    butikker: [b("Aune Kjøkken Bodø", "Bodø", "start", 3, 2), b("Aune Kjøkken Fauske", "Fauske", "start", 2, 1), b("Aune Kjøkken Mo", "Mo i Rana", "start", 3, 1)], kontakter: [k("Bjørn Aune", "Daglig leder", "913 80 254", "bjorn@aunekjokken.no", 1)] });
  await eier("hovde", { navn: "Hovde Interiør AS", orgnr: "920118455", adresse: "Torget 3", postnr: "2609", sted: "Lillehammer", fylke: "Innlandet", kjede: "annen", produktlinje: "hengsel", status: "forhandling", kilde: "messe",
    butikker: [b("Hovde Interiør", "Lillehammer", "komplett", 6, 2)], kontakter: [k("Nils Hovde", "Daglig leder", "905 11 234", "nils@hovde-interior.no", 1)] });

  // Tilbud og avtaler. Nordli: v1 (erstattet) og v2 (sendt), avtale til signering, kunden har ikke signert ennå.
  const nordliB = (await api("GET", `/api/eiere/${ider.nordli}`)).butikker;
  const t1 = await api("POST", "/api/tilbud", { eier_id: ider.nordli, produktlinje: "sigdal", butikker: [{ navn: nordliB[0].navn, pakke: "komplett", brukere: 0, montorer: 2 }, { navn: nordliB[1].navn, pakke: "butikk", brukere: 1, montorer: 1 }, { navn: nordliB[2].navn, pakke: "butikk", brukere: 0, montorer: 1 }], tillegg: ["domene"] });
  await api("PATCH", `/api/tilbud/${t1.id}`, { status: "sendt" });
  const t2 = await api("POST", "/api/tilbud", { eier_id: ider.nordli, produktlinje: "sigdal", butikker: nordliB.map((x) => ({ navn: x.navn, pakke: "butikk", brukere: 0, montorer: x.montorer })), tillegg: [] });
  await api("PATCH", `/api/tilbud/${t2.id}`, { status: "sendt" });
  const a1 = await api("POST", "/api/avtaler", { tilbud_id: t2.id });
  await api("POST", `/api/avtaler/${a1.nr}/send`);
  ider.tilbudNordli = t2; ider.avtaleNordli = a1.nr;
  // Elvetangen: tilbud sendt og avtale som utkast
  const elvB = (await api("GET", `/api/eiere/${ider.elvetangen}`)).butikker;
  const t3 = await api("POST", "/api/tilbud", { eier_id: ider.elvetangen, produktlinje: "sigdal", butikker: elvB.map((x) => ({ navn: x.navn, pakke: "butikk", brukere: 0, montorer: x.montorer })), tillegg: [] });
  await api("PATCH", `/api/tilbud/${t3.id}`, { status: "sendt" });
  await api("POST", "/api/avtaler", { tilbud_id: t3.id });
  // Solsiden: tilbud sendt
  const solB = (await api("GET", `/api/eiere/${ider.solsiden}`)).butikker;
  const t4 = await api("POST", "/api/tilbud", { eier_id: ider.solsiden, produktlinje: "hengsel", butikker: [{ navn: solB[0].navn, pakke: "start", brukere: 0, montorer: 1 }], tillegg: [] });
  await api("PATCH", `/api/tilbud/${t4.id}`, { status: "sendt" });

  // Kundene: tilbud → avtale → sendt → begge signerer. Start settes så «fornyes snart» (innen 90 dager) og «signert» vises.
  const kunde = async (nokkel, linje, start, { tillegg = [] } = {}) => {
    const e = await api("GET", `/api/eiere/${ider[nokkel]}`);
    const t = await api("POST", "/api/tilbud", { eier_id: ider[nokkel], produktlinje: linje, butikker: e.butikker.map((x) => ({ navn: x.navn, pakke: x.pakke, brukere: Math.max(0, (x.brukere ?? 0) - (e.prisliste?.pakker ? 0 : 0) - (x.pakke === "start" ? 3 : x.pakke === "butikk" ? 5 : 6)), montorer: x.montorer })), tillegg });
    await api("PATCH", `/api/tilbud/${t.id}`, { status: "sendt" });
    const a = await api("POST", "/api/avtaler", { tilbud_id: t.id });
    await api("PATCH", `/api/avtaler/${a.nr}`, { start });
    await api("POST", `/api/avtaler/${a.nr}/send`);
    await api("POST", `/api/avtaler/${a.nr}/signert`, { rekkefolge: 1 });
    await api("POST", `/api/avtaler/${a.nr}/signert`, { rekkefolge: 2 });
    return a.nr;
  };
  ider.avtaleGranlund = await kunde("granlund", "sigdal", plussMnd(idag, -7), { tillegg: ["domene"] });
  await api("PATCH", `/api/eiere/${ider.granlund}`, { miljo_adresse: "granlund.hengsel.no", miljo_database: "eu-nord-1 · granlund", miljo_tema: "Sigdal", neste_tekst: "Kvartalsmøte", neste_dato: d(22) });
  ider.avtaleVestby = await kunde("vestby", "sigdal", plussMnd(idag, -10));
  await api("PATCH", `/api/eiere/${ider.vestby}`, { miljo_adresse: "vestby.hengsel.no", miljo_database: "eu-nord-1 · vestby", miljo_tema: "Sigdal", neste_tekst: "Fornyelsessamtale", neste_dato: d(14) });
  ider.avtaleStrand = await kunde("strand", "hengsel", plussMnd(idag, -8), { tillegg: ["domene"] });
  await api("PATCH", `/api/eiere/${ider.strand}`, { miljo_adresse: "strand.hengsel.no", miljo_database: "eu-nord-1 · strand", miljo_tema: "Hengsel" });
  ider.avtaleAune = await kunde("aune", "sigdal", plussMnd(idag, -11));
  await api("PATCH", `/api/eiere/${ider.aune}`, { miljo_adresse: "aune.hengsel.no", miljo_database: "eu-nord-1 · aune", miljo_tema: "Sigdal", neste_tekst: "Forslag om oppgradering til Butikk", neste_dato: d(7) });
  ider.avtaleHovde = await kunde("hovde", "hengsel", plussMnd(idag, -20));
  await api("PATCH", `/api/avtaler/${ider.avtaleHovde}`, { status: "sagt_opp", opphorer: `${idag.slice(0, 4)}-12-31` });

  // Lysaker: tapt med grunn
  await api("PATCH", `/api/eiere/${ider.lysaker}`, { status: "tapt", tap_grunn: "Valgte annen leverandør", tap_merknad: "Gikk for et system de kjente fra før." });

  // Neste steg: forfalt, i dag og senere
  await akt(ider.nordli, "notat", d(-24), "Kom inn via Sigdal-kjedemøtet", "Anbefalt av Lars Granlund.");
  await akt(ider.nordli, "samtale", d(-20), "Første samtale", "Vil ha tilbud for tre butikker. Bruker Excel og et eldre system i dag.");
  await akt(ider.nordli, "demo", d(-12), "Demo i butikken på Hamar", "Viste tilbud, montørapp og kundeportal. Per likte montasjeplanen.");
  await akt(ider.nordli, "mote", d(-5), "Gjennomgang av pris", "Kari og Siri ønsker færre brukere i Lillehammer og spør om binding.");
  await akt(ider.nordli, "epost", d(-1), `Tilbud ${t2.nr} v2 sendt`, "Sendt til Kari Nordli. Butikk-pakken for tre butikker.", ["Følg opp tilbud v2", d(-1)]);
  await akt(ider.fossum, "mote", d(-4), "Møte om oppsett", "Gikk gjennom modulene.", ["Send referat fra møtet", d(-4)]);
  await akt(ider.solsiden, "epost", d(-3), `Tilbud ${t4.nr} v1 sendt`, null, ["Ring om tilbudet", d(0)]);
  await akt(ider.bakken, "samtale", d(-2), "Kort samtale", "Vil se en demo.", ["Ring og avtal demo", d(1)]);
  await akt(ider.fjordhuset, "samtale", d(-6), "Avtalt demo", null, ["Demo på video", d(2)]);
  await akt(ider.elvetangen, "epost", d(-2), `Tilbud ${t3.nr} v1 sendt`, null, ["Svar på spørsmål om montørapp", d(3)]);
  await akt(ider.moen, "samtale", d(-1), "Avtalt demo i butikken", null, ["Demo i butikken", d(8)]);

  // Lead fra «Be om demo» (lagres som på /api/lead)
  const lead = await lagreLead(env.DB, { navn: "Silje Haugen", butikk: "Haugen Kjøkken & Bad AS", epost: "silje@haugenkjokken.no", tlf: "901 47 225", avdelinger: "1", melding: "Vi er tre selgere og to montører. Bruker Excel og e-post i dag. Kan vi se hvordan tilbud og montasje henger sammen?" });
  ider.haugen = lead.eier_id;
  await api("PATCH", `/api/eiere/${ider.haugen}`, { orgnr: "932118640", adresse: "Leirvikvegen 22", postnr: "5411", sted: "Stord", fylke: "Vestland" });

  return ider;
}
