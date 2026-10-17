/**
 * 26-013 Eierkort (N-4): topplinja med eierens navn, status-pillen, «Prisberegner» og «Ny aktivitet» (resten under «⋯»: Rediger, Endre status,
 * Ikke aktuell / Åpne på nytt). Faner Oversikt · Prisberegner (26-005) · Tilbud · Avtaler · Tidslinje.
 * Oversikt: rad 1 (320) Liste 1/2 ×2 Kontaktpersoner og Muligheter og tilbud, rad 2 (320) Liste 1/2 ×2 Butikker og Tidslinje; for kunder rad 3 med
 * Kundemiljø og Avtaler. Lead fra «Be om demo» og tapt vises som banner øverst. Samme API og handlinger som før (SA4).
 */
import { api, html, raw, kr, orgnr, dato, datoKort, tid, flertall, ikon, sett, q, qa, feilbanner, tilstand, toast, taptDialog, skjemaDialog, idFraSti, KOLONNENAVN, KILDER, AKTIVITET, TILBUDSTATUS, AVTALESTATUS } from "../lib/dom";
import { rad, flis, liste, kpille, tabell, tabellHoyde, velger, settFaner, settSidepille, settTittel, kobleKit, laster, tom, type ListeRad } from "../lib/kit";

const rot = q("#side")!;
const id = idFraSti();
const tilbake = rot.dataset.tilbake ?? "/salg/eiere";
let data: any = null;
let fane = location.hash === "#tidslinje" ? "tidslinje" : "oversikt";
let tlFilter = "alle";

const linjeNavn = (l: string) => (l === "sigdal" ? "Sigdal CRM" : "Hengsel");
const nesteTone = (d: any) => (d.forfalt ? "feil" : d.i_dag ? "ny" : "venter");
const nesteTekst = (d: any, e: any) => (d.forfalt ? `Forfalt ${datoKort(e.neste_dato)}` : d.i_dag ? "I dag" : datoKort(e.neste_dato));

function faner(d: any | null) {
  settFaner([
    { id: "oversikt", navn: "Oversikt" },
    { id: "prisberegner", navn: "Prisberegner", href: `/salg/prisberegner?eier=${id}` },
    { id: "tilbud", navn: "Tilbud", antall: d ? d.tilbud.length : undefined },
    { id: "avtaler", navn: "Avtaler", antall: d ? d.avtaler.length : undefined },
    { id: "tidslinje", navn: "Tidslinje", antall: d ? d.aktiviteter.length : undefined },
  ], fane, (f) => { fane = f; history.replaceState(null, "", f === "tidslinje" ? "#tidslinje" : location.pathname); vis(data); });
}

function oversikt(d: any) {
  const e = d.eier, erKunde = e.er_kunde;
  const pakkeNavn = (k: string | null) => d.prisliste?.pakker?.[e.produktlinje]?.[k ?? ""]?.navn ?? d.prisliste?.pakker?.hengsel?.[k ?? ""]?.navn ?? (k ? k[0].toUpperCase() + k.slice(1) : "Pakke ikke valgt");
  const perButikk = new Map((d.per_butikk ?? []).map((x: any) => [x.navn, x]));
  const kontakter: ListeRad[] = d.kontakter.map((k: any) => ({
    venstre: html`<b>${k.navn}</b> <span>${[k.rolle, k.signaturrett ? "signaturrett" : ""].filter(Boolean).join(", ")}${k.telefon ? ` · ${k.telefon}` : ""}${k.epost && !k.telefon ? ` · ${k.epost}` : ""}</span>`,
    hoyre: html`<button class="knapp tekst" type="button" data-rediger-kontakt="${k.id}">Endre</button>`,
  }));
  const apne = d.muligheter.filter((m: any) => !m.lukket);
  const mulTilbud: ListeRad[] = [
    ...apne.map((m: any) => ({ venstre: html`<b>${linjeNavn(m.produktlinje)}, ${flertall(m.antall_butikker, "butikk", "butikker")}</b> <span>${m.verdi_mnd_ore ? `${kr(m.verdi_mnd_ore)} per mnd` : d.verdi_ore ? `${kr(d.verdi_ore)} per mnd` : ""}</span>`, hoyre: kpille(KOLONNENAVN[m.fase] ?? m.fase, m.fase) })),
    ...d.tilbud.map((t: any) => ({ venstre: html`<b><a href="/salg/tilbud/${t.nr}/${t.versjon}.pdf" target="_blank" rel="noopener">${t.nr} v${t.versjon}</a></b> <span>${datoKort(t.dato)} · prisliste ${t.prisliste_versjon} · ${kr(t.sum_mnd_ore)}/mnd</span>`,
      hoyre: html`${t.status === "utkast" ? html`<button class="knapp" type="button" data-send-tilbud="${t.id}">Merk som sendt</button>` : ""}${(t.status === "sendt" || t.status === "utkast") && !d.avtaler.length ? html`<button class="knapp" type="button" data-lag-avtale="${t.id}">Lag avtale</button>` : ""}${kpille(TILBUDSTATUS[t.status] ?? t.status, t.status)}` })),
  ];
  const butikker: ListeRad[] = d.butikker.map((b: any) => { const p: any = perButikk.get(b.navn); return { venstre: html`<b>${b.navn}</b> <span>${pakkeNavn(b.pakke)}${p ? ` · ${kr(p.sum_ore)}` : ""}${b.sted ? ` · ${b.sted}` : ""}</span>`, hoyre: html`<button class="knapp tekst" type="button" data-rediger-butikk="${b.id}">Endre</button>` }; });
  const tl: ListeRad[] = [
    ...(e.neste_tekst && e.neste_dato && e.status !== "tapt" ? [{ venstre: html`<b>${e.neste_tekst}</b> <span>neste steg · ${dato(e.neste_dato)}</span>`, hoyre: kpille(nesteTekst(d, e), nesteTone(d)) }] : []),
    ...d.aktiviteter.map((a: any) => ({ venstre: html`<b>${a.tittel}</b> <span>${datoKort(a.dato)} · ${a.hvem}</span>` })),
  ];
  const L = (lid: string, tittel: string, rader: ListeRad[], tomTekst: string, ekstra: string = "") => { const l = liste(lid, tittel, rader, { tom: tomTekst }); return flis({ id: lid, bredde: "1/2", tittel, teller: rader.length, tellerHoyre: true, innhold: l.innhold, handling: html`${raw(ekstra)}${l.handling}` }); };
  const rader = [
    rad(320, [L("kontakter", "Kontaktpersoner", kontakter, "Ingen kontaktpersoner ennå.", `<button class="k-lenkeknapp" type="button" id="ny-kontakt">Legg til</button>`), L("muligheter", "Muligheter og tilbud", mulTilbud, "Ingen åpne muligheter eller tilbud.", `<a class="k-lenkeknapp" href="/salg/prisberegner?eier=${e.id}">Lag tilbud</a>`)]),
    rad(320, [L("butikker", "Butikker", butikker, "Ingen butikker ennå.", `<button class="k-lenkeknapp" type="button" id="ny-butikk">Legg til</button>`), L("tidslinje-kort", "Tidslinje", tl, "Ingen aktiviteter ennå.", `<button class="k-lenkeknapp" type="button" id="ny-akt-2">Ny aktivitet</button>`)]),
  ];
  if (erKunde) {
    const miljo: ListeRad[] = [
      { venstre: html`<b>Adresse</b> <span>${e.miljo_adresse ?? "fyll inn"}</span>`, hoyre: e.miljo_adresse ? html`<a class="k-lenkeknapp" href="https://${encodeURI(e.miljo_adresse)}" rel="noopener">Åpne</a>` : "" },
      { venstre: html`<b>Tema og database</b> <span>${[e.miljo_tema, e.miljo_database].filter(Boolean).join(" · ") || "fyll inn"}</span>` },
      { venstre: html`<b>Versjon og siste innlogging</b> <span>leses fra kundemiljøet (ikke koblet til)</span>` },
    ];
    const avtaler: ListeRad[] = d.avtaler.map((a: any) => ({ venstre: html`<b><a href="/avtaler/${a.nr}">${a.nr}</a></b> <span>${kr(a.per_mnd_ore)}/mnd${a.fornyes ? ` · fornyes ${dato(a.fornyes)}` : ""}</span>`, hoyre: kpille(AVTALESTATUS[a.visning] ?? a.visning, a.visning) }));
    rader.push(rad(320, [L("miljo", "Kundemiljø", miljo, ""), L("avtaler-kort", "Avtaler", avtaler, "Ingen avtaler.")]));
  }
  return rader;
}

function tilbudFane(d: any) {
  const r = d.tilbud.map((t: any) => html`<tr><th scope="row"><a href="/salg/tilbud/${t.nr}/${t.versjon}.pdf" target="_blank" rel="noopener">${t.nr} v${t.versjon}</a></th><td class="midt">${dato(t.dato)}</td><td class="midt">${t.prisliste_versjon}</td><td class="h midt">${kr(t.sum_mnd_ore)}</td><td class="midt">${t.status === "utkast" ? html`<button class="knapp" type="button" data-send-tilbud="${t.id}">Merk som sendt</button>` : ""} ${(t.status === "sendt" || t.status === "utkast") && !d.avtaler.length ? html`<button class="knapp" type="button" data-lag-avtale="${t.id}">Lag avtale</button>` : ""}</td><td>${kpille(TILBUDSTATUS[t.status] ?? t.status, t.status)}</td></tr>`);
  return rad(tabellHoyde(r.length), [flis({ id: "tilbud", tittel: "Tilbud", teller: r.length, handling: raw(`<a class="knapp primar" href="/salg/prisberegner?eier=${d.eier.id}">Lag tilbud</a>`),
    innhold: tabell({ kompakt: true, kolonner: [{ navn: "Tilbud" }, { navn: "Dato", midt: true }, { navn: "Prisliste", midt: true }, { navn: "Per mnd", h: true, midt: true }, { navn: "", midt: true }, { navn: "Status", klasse: "statuskol" }], rader: r, ingen: "Ingen tilbud ennå." }) })]);
}
function avtaleFane(d: any) {
  const r = d.avtaler.map((a: any) => html`<tr data-lenke="/avtaler/${a.nr}"><th scope="row"><a href="/avtaler/${a.nr}">${a.nr}</a></th><td class="h midt">${kr(a.per_mnd_ore)}</td><td class="midt">${a.start ? dato(a.start) : "–"}</td><td class="midt">${a.fornyes ? dato(a.fornyes) : "–"}</td><td>${kpille(AVTALESTATUS[a.visning] ?? a.visning, a.visning)}</td></tr>`);
  return rad(tabellHoyde(r.length), [flis({ id: "avtaler", tittel: "Avtaler", teller: r.length, innhold: tabell({ kompakt: true, kolonner: [{ navn: "Avtale" }, { navn: "Per mnd", h: true, midt: true }, { navn: "Start", midt: true }, { navn: "Fornyes", midt: true }, { navn: "Status", klasse: "statuskol" }], rader: r, ingen: "Ingen avtaler ennå." }) })]);
}
function tidslinjeFane(d: any) {
  const e = d.eier;
  const akt = tlFilter === "alle" ? d.aktiviteter : d.aktiviteter.filter((a: any) => a.type === tlFilter);
  const innhold = html`${e.neste_tekst && e.neste_dato && e.status !== "tapt" ? html`<div class="nesteboks">${raw(ikon(d.forfalt ? "frist" : "kalender", 20))}<div><span class="meta">Neste steg</span><br /><b>${e.neste_tekst}</b></div><span class="meta">${kpille(nesteTekst(d, e), nesteTone(d))}</span></div>` : ""}
    ${akt.length ? html`<ul class="tidslinje">${akt.map((a: any) => html`<li><span class="prikk" data-type="${a.type}">${raw(ikon(AKTIVITET[a.type]?.[1] ?? "tilbud", 16))}</span><div class="innhold"><b>${a.tittel}<span>${dato(a.dato)}</span></b>${a.tekst ? html`<p>${a.tekst}</p>` : ""}${a.neste_tekst ? html`<p class="meta">Neste steg: ${a.neste_tekst} (${dato(a.neste_dato)})</p>` : ""}<div class="meta">${AKTIVITET[a.type]?.[0] ?? a.type} · ${a.hvem}${a.kontakt_navn ? ` · ${a.kontakt_navn}` : ""}</div></div></li>`)}</ul>`
    : d.aktiviteter.length ? raw(`<p class="meta">Ingen aktiviteter av denne typen.</p>`) : tom("Ingen aktiviteter ennå", "Logg samtaler, møter og demoer her, og sett et neste steg.", raw(`<button class="knapp primar" type="button" id="forste-akt">Første aktivitet</button>`))}`;
  return rad("auto", [flis({ id: "tidslinje", tittel: "Tidslinje", teller: akt.length, verktoy: velger("tl-filter", "Type", [["alle", "Type: Alle"], ...Object.entries(AKTIVITET).map(([k, v]) => [k, v[0]] as [string, string])], tlFilter), innhold, handling: raw(`<button class="knapp primar" type="button" id="ny-akt-3">Ny aktivitet</button>`) })]);
}

function vis(d: any) {
  data = d;
  const e = d.eier;
  const erLead = e.kilde === "be_om_demo" && e.status === "ny" && (e.lead_melding || e.lead_tid);
  settTittel(e.navn);
  settSidepille(e.er_kunde ? "Kunde" : KOLONNENAVN[e.status] ?? e.status, e.er_kunde ? "kunde" : e.status);
  faner(d);
  const varsler = html`${erLead ? html`<div class="banner info">${raw(ikon("innboks", 20))}<div><b>Nytt lead fra «Be om demo» · ${tid(e.lead_tid)}</b>${e.lead_melding ? html`«${e.lead_melding}» ` : ""}<span class="meta">${e.lead_kanal ?? ""}${e.lead_butikker ? ` · ${e.lead_butikker} butikk` : ""} · Svar innen 24 timer</span>
      <div class="mt-8 knapper-rad"><button class="knapp primar liten" type="button" id="avtal-demo">${raw(ikon("kalender", 16))}Avtal demo</button><button class="knapp liten" type="button" id="ikke-aktuell">Ikke aktuell</button></div></div></div>` : ""}
    ${e.status === "tapt" ? html`<div class="banner varsel">${raw(ikon("stoppet", 20))}<div><b>Tapt: ${e.tap_grunn ?? "uten grunn"}</b>${e.tap_merknad ?? ""} <button class="ml-8 knapp liten" type="button" id="gjenapne">Åpne på nytt</button></div></div>` : ""}`;
  // Org.nr., adresse, kjede, linje og kilde står som tooltip på tittelen (regel 6: ingen tekst utenfor fliser); de endres under «⋯ › Rediger eier»
  const t = q("#sidetittel"); if (t) t.title = `Org.nr. ${orgnr(e.orgnr)}${e.adresse ? ` · ${e.adresse}${e.postnr || e.sted ? `, ${[e.postnr, e.sted].filter(Boolean).join(" ")}` : ""}` : ""} · ${e.kjede === "sigdal" ? "Sigdal" : "Uavhengig"} · ${d.linje_navn} · Kilde: ${KILDER[e.kilde] ?? "–"}`;
  const innhold = fane === "tilbud" ? [tilbudFane(d)] : fane === "avtaler" ? [avtaleFane(d)] : fane === "tidslinje" ? [tidslinjeFane(d)] : oversikt(d);
  sett(rot, html`${varsler}${innhold}`);
  koble();
}

const nyAkt = (type?: string) => document.dispatchEvent(new CustomEvent("ny-aktivitet", { detail: { id: data.eier.id, navn: data.eier.navn, kontakter: data.kontakter, type } }));
const tapt = async () => { const g = await taptDialog(data.eier.navn, data.tap_grunner); if (!g) return; await api("PATCH", `/api/eiere/${id}`, { status: "tapt", ...g }); toast(`${data.eier.navn} er markert som tapt`); last(); };

async function rediger() {
  const e = data.eier;
  const f = (navn: string, label: string, verdi: string | null, type = "text") => `<label class="felt"><span>${label}</span><input name="${navn}" type="${type}" value="${(verdi ?? "").replace(/"/g, "&quot;")}" /></label>`;
  await skjemaDialog({ tittel: "Rediger eier", bred: true, innhold: `${f("navn", "Eier", e.navn)}<div class="felt-rad">${f("orgnr", "Org.nr.", e.orgnr)}<label class="felt"><span>Kjede</span><select name="kjede"><option value="annen" ${e.kjede === "annen" ? "selected" : ""}>Uavhengig</option><option value="sigdal" ${e.kjede === "sigdal" ? "selected" : ""}>Sigdal</option></select></label><label class="felt"><span>Produktlinje</span><select name="produktlinje"><option value="hengsel" ${e.produktlinje === "hengsel" ? "selected" : ""}>Hengsel</option><option value="sigdal" ${e.produktlinje === "sigdal" ? "selected" : ""}>Sigdal CRM</option></select></label></div>
    <div class="felt-rad">${f("adresse", "Adresse", e.adresse)}${f("postnr", "Postnr.", e.postnr)}${f("sted", "Sted", e.sted)}${f("fylke", "Fylke", e.fylke)}</div>
    <div class="felt-rad">${f("neste_tekst", "Neste steg", e.neste_tekst)}${f("neste_dato", "Dato", e.neste_dato, "date")}</div>
    ${e.er_kunde ? `<div class="felt-rad">${f("miljo_adresse", "Kundemiljø, adresse", e.miljo_adresse)}${f("miljo_tema", "Tema", e.miljo_tema)}${f("miljo_database", "Database", e.miljo_database)}</div>` : ""}`,
    send: (dta) => api("PATCH", `/api/eiere/${id}`, dta) });
  last();
}
async function endreStatus() {
  const e = data.eier;
  const r = await skjemaDialog({ tittel: "Endre status", knapp: "Lagre", innhold: `<label class="felt"><span>Status</span><select name="status">${Object.entries(KOLONNENAVN).filter(([k]) => k !== "kunde").map(([k, n]) => `<option value="${k}" ${k === e.status ? "selected" : ""}>${n}</option>`).join("")}</select></label>` });
  if (!r || r.status === e.status) return;
  if (r.status === "tapt") return tapt();
  try { await api("PATCH", `/api/eiere/${id}`, { status: r.status }); toast(`Flyttet til ${KOLONNENAVN[r.status]}`); last(); } catch (err: any) { toast(err.message); last(); }
}

function koble() {
  kobleKit(rot);
  ["#ny-akt-2", "#ny-akt-3", "#forste-akt"].forEach((s) => q(s)?.addEventListener("click", () => nyAkt()));
  q("#avtal-demo")?.addEventListener("click", () => nyAkt("demo"));
  q("#ikke-aktuell")?.addEventListener("click", tapt);
  q("#gjenapne")?.addEventListener("click", async () => { await api("PATCH", `/api/eiere/${id}`, { status: "ny" }); toast("Eieren er åpnet på nytt"); last(); });
  q<HTMLSelectElement>("#tl-filter")?.addEventListener("change", (ev) => { tlFilter = (ev.target as HTMLSelectElement).value; vis(data); });
  const butikkSkjema = (b: any = {}) => `<label class="felt"><span>Butikk</span><input name="navn" type="text" value="${(b.navn ?? "").replace(/"/g, "&quot;")}" required /></label><div class="felt-rad"><label class="felt"><span>Sted</span><input name="sted" type="text" value="${(b.sted ?? "").replace(/"/g, "&quot;")}" /></label><label class="felt"><span>Pakke</span><select name="pakke"><option value="">Ikke valgt</option>${["start", "butikk", "komplett"].map((p) => `<option value="${p}" ${b.pakke === p ? "selected" : ""}>${p[0].toUpperCase() + p.slice(1)}</option>`).join("")}</select></label><label class="felt"><span>Brukere (totalt)</span><input name="brukere" type="number" min="0" value="${b.brukere ?? ""}" /></label><label class="felt"><span>Montører</span><input name="montorer" type="number" min="0" value="${b.montorer ?? ""}" /></label></div>`;
  q("#ny-butikk")?.addEventListener("click", async () => { await skjemaDialog({ tittel: "Ny butikk", innhold: butikkSkjema(), send: (dta) => api("POST", `/api/eiere/${id}/butikker`, { ...dta, pakke: dta.pakke || undefined, brukere: dta.brukere || undefined, montorer: dta.montorer || undefined }) }); last(); });
  /** Slett-knapp i en åpen redigeringsdialog: sletter og lukker dialogen (avbryt-hendelsen løser skjemaDialog-løftet) */
  const kobleSlett = (sti: string, tekst: string) => {
    const dlg = qa<HTMLDialogElement>("dialog").at(-1)!;
    q("[data-slett]", dlg)?.addEventListener("click", async () => {
      if (!confirm(tekst)) return;
      try { await api("DELETE", sti); dlg.dispatchEvent(new Event("cancel", { cancelable: true })); last(); } catch (err: any) { toast(err.message); }
    });
  };
  const lukkAlle = () => qa<HTMLDialogElement>("dialog.k-alle[open]").forEach((dl) => dl.close());
  qa<HTMLButtonElement>("[data-rediger-butikk]").forEach((b) => b.addEventListener("click", async () => {
    lukkAlle();
    const butikk = data.butikker.find((x: any) => x.id === b.dataset.redigerButikk);
    const p = skjemaDialog({ tittel: "Endre butikk", innhold: `${butikkSkjema(butikk)}<button class="venstre knapp tekst liten" type="button" data-slett>Slett butikken</button>`, send: (dta) => api("PATCH", `/api/butikker/${butikk.id}`, { navn: dta.navn, sted: dta.sted, pakke: dta.pakke || null, brukere: dta.brukere === "" ? null : dta.brukere, montorer: dta.montorer === "" ? null : dta.montorer }) });
    kobleSlett(`/api/butikker/${butikk.id}`, "Slette butikken?");
    await p; last();
  }));
  const kontaktSkjema = (k: any = {}) => `<label class="felt"><span>Navn</span><input name="navn" type="text" value="${(k.navn ?? "").replace(/"/g, "&quot;")}" required /></label><div class="felt-rad"><label class="felt"><span>Rolle</span><input name="rolle" type="text" value="${(k.rolle ?? "").replace(/"/g, "&quot;")}" /></label><label class="felt"><span>Telefon</span><input name="telefon" type="tel" value="${k.telefon ?? ""}" /></label><label class="felt"><span>E-post</span><input name="epost" type="email" value="${k.epost ?? ""}" /></label></div><div class="chips"><label class="avkryss"><input type="checkbox" name="signaturrett" value="1" ${k.signaturrett ? "checked" : ""} /> Signaturrett</label><label class="avkryss"><input type="checkbox" name="primaer" value="1" ${k.primaer ? "checked" : ""} /> Primærkontakt</label></div>`;
  q("#ny-kontakt")?.addEventListener("click", async () => { await skjemaDialog({ tittel: "Ny kontaktperson", innhold: kontaktSkjema(), send: (dta) => api("POST", `/api/eiere/${id}/kontakter`, { ...dta, signaturrett: dta.signaturrett ? 1 : 0, primaer: dta.primaer ? 1 : 0 }) }); last(); });
  qa<HTMLButtonElement>("[data-rediger-kontakt]").forEach((b) => b.addEventListener("click", async () => {
    lukkAlle();
    const k = data.kontakter.find((x: any) => x.id === b.dataset.redigerKontakt);
    const p = skjemaDialog({ tittel: "Endre kontaktperson", innhold: `${kontaktSkjema(k)}<button class="venstre knapp tekst liten" type="button" data-slett>Slett kontakten</button>`, send: (dta) => api("PATCH", `/api/kontakter/${k.id}`, { ...dta, signaturrett: dta.signaturrett ? 1 : 0, primaer: dta.primaer ? 1 : 0 }) });
    kobleSlett(`/api/kontakter/${k.id}`, "Slette kontakten?");
    await p; last();
  }));
  qa<HTMLButtonElement>("[data-send-tilbud]").forEach((b) => b.addEventListener("click", async () => { await api("PATCH", `/api/tilbud/${b.dataset.sendTilbud}`, { status: "sendt" }); toast("Tilbudet er merket som sendt"); last(); }));
  qa<HTMLButtonElement>("[data-lag-avtale]").forEach((b) => b.addEventListener("click", async () => { try { const a = await api<{ nr: string }>("POST", "/api/avtaler", { tilbud_id: b.dataset.lagAvtale }); toast(`Avtale ${a.nr} er laget`, { href: `/avtaler/${a.nr}`, tekst: "Åpne" }); last(); } catch (err: any) { toast(err.message); } }));
  q("#prov-igjen")?.addEventListener("click", last);
}

// Topplinja: «Prisberegner», «Ny aktivitet» og «⋯» (Rediger, Endre status, Ikke aktuell / Åpne på nytt)
q<HTMLAnchorElement>("#til-prisberegner")?.setAttribute("href", `/salg/prisberegner?eier=${id}`);
q("#ny-akt")?.addEventListener("click", () => data && nyAkt());
q("#rediger")?.addEventListener("click", () => data && rediger());
q("#endre-status")?.addEventListener("click", () => data && endreStatus());
q("#marker-tapt")?.addEventListener("click", () => data && (data.eier.status === "tapt" ? api("PATCH", `/api/eiere/${id}`, { status: "ny" }).then(() => { toast("Eieren er åpnet på nytt"); last(); }) : tapt()));

async function last() {
  const t = tilstand();
  if (!data) { faner(null); sett(rot, html`${rad(320, [flis({ bredde: "1/2", tittel: "Kontaktpersoner", innhold: laster() }), flis({ bredde: "1/2", tittel: "Muligheter og tilbud", innhold: laster() })])}${rad(320, [flis({ bredde: "1/2", tittel: "Butikker", innhold: laster() }), flis({ bredde: "1/2", tittel: "Tidslinje", innhold: laster() })])}`); }
  if (t === "tom") { const d = await api("GET", `/api/eiere/${id}`).catch(() => null); if (d) { d.aktiviteter = []; d.muligheter = []; d.tilbud = []; d.avtaler = []; d.eier.neste_tekst = null; return vis(d); } }
  try { vis(await api("GET", `/api/eiere/${id}`)); }
  catch (e: any) {
    sett(rot, rad(320, [flis({ tittel: "Kunne ikke åpne eierkortet", innhold: tom(e.kode === "ADM-404" ? "Eieren finnes ikke." : "Eieren finnes, men dataene kunne ikke hentes.", `Feilkode ${e.kode ?? "ADM-504"}.`, html`<a class="knapp" href="${tilbake}">${rot.dataset.tilbakeNavn ?? "Tilbake til listen"}</a><button class="knapp primar" type="button" id="prov-igjen">Prøv igjen</button>`) })]));
    q("#prov-igjen")?.addEventListener("click", last);
  }
}
last();
document.addEventListener("aktivitet-lagret", last);
void feilbanner;
