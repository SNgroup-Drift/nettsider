/** SA4 Eierkort: topp med status og handlinger, lead-banner, kundemiljø, butikker, kontakter, muligheter, tilbud og avtaler, tidslinje med filter og neste steg. */
import { api, html, raw, kr, orgnr, dato, tid, flertall, ikon, pille, kjede, neste, sett, q, qa, feilbanner, skjelett, tilstand, toast, taptDialog, skjemaDialog, idFraSti, KOLONNENAVN, KILDER, AKTIVITET, TILBUDSTATUS, AVTALESTATUS } from "../lib/dom";

const rot = q("#side")!;
const id = idFraSti();
const tilbake = rot.dataset.tilbake ?? "/salg/eiere";
let data: any = null;
let tlFilter = "alle";

function vis(d: any) {
  data = d;
  const e = d.eier;
  const erKunde = e.er_kunde;
  const erLead = e.kilde === "be_om_demo" && e.status === "ny" && (e.lead_melding || e.lead_tid);
  q("#brodsmule-sist")!.textContent = e.navn;
  document.title = `${e.navn} · Hengsel Admin`;
  const akt = tlFilter === "alle" ? d.aktiviteter : d.aktiviteter.filter((a: any) => a.type === tlFilter);
  const pakkeNavn = (k: string | null) => d.prisliste?.pakker?.[k ?? ""]?.navn ?? (k ? k : "–");
  const perButikk = new Map((d.per_butikk ?? []).map((x: any) => [x.navn, x]));
  const dok = [
    ...d.tilbud.map((t: any) => ({ ikon: "tilbud", tittel: `${t.nr} v${t.versjon}`, tekst: `${dato(t.dato)} · prisliste ${t.prisliste_versjon} · ${kr(t.sum_mnd_ore)}/mnd`, status: t.status, statusTekst: TILBUDSTATUS[t.status], href: `/salg/tilbud/${t.nr}/${t.versjon}.pdf`, id: t.id, type: "tilbud" })),
    ...d.avtaler.map((a: any) => ({ ikon: "signert", tittel: a.nr, tekst: `${kr(a.per_mnd_ore)}/mnd${a.fornyes ? ` · fornyes ${dato(a.fornyes)}` : ""}`, status: a.visning, statusTekst: AVTALESTATUS[a.visning], href: `/avtaler/${a.nr}`, type: "avtale" })),
  ];
  sett(rot, html`
    <header class="eierhode">
      <div class="merker">${pille(erKunde ? "kunde" : e.status)}${kjede(e.kjede)}<span class="kjede">${d.linje_navn}</span>${e.lead_ny ? pille("ny", "Ny lead") : ""}</div>
      <div class="sidehode"><div><h1>${e.navn}</h1><p class="under">Org.nr. ${orgnr(e.orgnr)}${e.adresse ? ` · ${e.adresse}${e.postnr || e.sted ? `, ${[e.postnr, e.sted].filter(Boolean).join(" ")}` : ""}` : ""} · Kilde: ${KILDER[e.kilde] ?? "–"}</p></div>
        <div class="handlinger">
          <label class="min-160 felt bare-telefon" ><span>Status</span><select id="status-velger">${Object.entries(KOLONNENAVN).filter(([k]) => k !== "kunde").map(([k, n]) => html`<option value="${k}" ${k === e.status ? "selected" : ""}>${n}</option>`)}</select></label>
          <button class="knapp" type="button" id="rediger">${raw(ikon("innstillinger", 18))}Rediger</button>
          <button class="knapp" type="button" id="ny-akt">${raw(ikon("pluss", 18))}Ny aktivitet</button>
          <a class="knapp primar" href="/salg/prisberegner?eier=${e.id}">${raw(ikon("etterkalkyler", 18))}${erKunde ? "Endre abonnement" : "Prisberegner"}</a>
        </div></div>
    </header>
    ${erLead ? html`<div class="banner info">${raw(ikon("innboks", 20))}<div><b>Nytt lead fra «Be om demo» · ${tid(e.lead_tid)}</b>${e.lead_melding ? html`«${e.lead_melding}» ` : ""}<span class="meta">${e.lead_kanal ?? ""}${e.lead_butikker ? ` · ${e.lead_butikker} butikk` : ""} · Svar innen 24 timer</span>
      <div class="mt-8 handlinger" ><button class="knapp primar liten" type="button" id="avtal-demo">${raw(ikon("kalender", 16))}Avtal demo</button><button class="knapp liten" type="button" id="ikke-aktuell">Ikke aktuell</button></div></div></div>` : ""}
    ${e.status === "tapt" ? html`<div class="banner varsel">${raw(ikon("stoppet", 20))}<div><b>Tapt: ${e.tap_grunn ?? "uten grunn"}</b>${e.tap_merknad ?? ""} <button class="ml-8 knapp liten" type="button" id="gjenapne" >Åpne på nytt</button></div></div>` : ""}
    <div class="to-kolonner">
      <div class="rutenett en-kolonne" >
        ${erKunde ? html`<section class="kort"><h2>Kundemiljø ${e.miljo_adresse ? raw(`<a class="mer" href="https://${encodeURI(e.miljo_adresse)}" rel="noopener">Åpne kundesiden ${ikon("pil-hoyre", 14)}</a>`) : ""}</h2>
          <dl class="dl"><dt>Adresse</dt><dd>${e.miljo_adresse ?? raw(`<span class="dempet">fyll inn</span>`)}</dd><dt>Tema og database</dt><dd>${[e.miljo_tema, e.miljo_database].filter(Boolean).join(" · ") || raw(`<span class="dempet">fyll inn</span>`)}</dd><dt>Versjon og siste innlogging</dt><dd class="meta">Leses fra kundemiljøet (ikke koblet til i fase A)</dd></dl></section>` : ""}
        <section class="kort tabellramme"><h2>Butikker <span class="mer">${flertall(d.butikker.length, "butikk", "butikker")} · pakke per butikk</span><button class="knapp liten" type="button" id="ny-butikk">Legg til</button></h2>
          ${d.butikker.length ? html`<table class="tabell"><thead><tr><th>Butikk</th><th>Sted</th><th>Pakke</th>${erKunde ? raw(`<th>Moduler</th><th class="hoyre">Brukere</th><th class="hoyre">Montører</th>`) : raw(`<th class="hoyre">Montører</th>`)}<th class="hoyre">Pakke og brukere</th><th></th></tr></thead>
            <tbody>${d.butikker.map((b: any) => { const p: any = perButikk.get(b.navn); return html`<tr><td><b>${b.navn}</b></td><td class="dempet">${b.sted ?? "–"}</td><td>${pakkeNavn(b.pakke)}${!b.pakke ? raw(` <span class="meta">(foreslått Butikk)</span>`) : ""}</td>${erKunde ? html`<td class="liten-tekst dempet" >${(p?.moduler ?? []).join(", ")}</td><td class="hoyre">${b.brukere ?? "–"}</td><td class="hoyre">${b.montorer ?? "–"}</td>` : html`<td class="hoyre">${b.montorer ?? "–"}</td>`}<td class="hoyre">${p ? kr(p.sum_ore) : "–"}</td><td class="hoyre"><button class="knapp tekst liten" type="button" data-rediger-butikk="${b.id}">Endre</button></td></tr>`; })}</tbody></table>` : raw(`<p class="meta">Ingen butikker ennå.</p>`)}</section>
        <section class="kort"><h2>Kontaktpersoner <button class="knapp liten" type="button" id="ny-kontakt">Legg til</button></h2>
          ${d.kontakter.length ? html`<ul class="liste kontaktliste">${d.kontakter.map((k: any) => html`<li><span class="init">${k.navn.split(" ").map((s: string) => s[0]).join("").slice(0, 2)}</span><div class="tekst"><b>${k.navn}${k.signaturrett ? raw(` <span class="kjede">signaturrett</span>`) : ""}</b><span>${k.rolle ?? ""}</span></div><span class="meta">${k.telefon ? html`<a href="tel:${k.telefon.replace(/\s/g, "")}">${k.telefon}</a>` : ""}${k.telefon && k.epost ? " · " : ""}${k.epost ? html`<a href="mailto:${k.epost}">${k.epost}</a>` : ""}</span><button class="knapp tekst liten" type="button" data-rediger-kontakt="${k.id}">Endre</button></li>`)}</ul>` : raw(`<p class="meta">Ingen kontaktpersoner ennå.</p>`)}</section>
        <section class="kort"><h2>Muligheter</h2>
          ${d.muligheter.filter((m: any) => !m.lukket).length ? html`<ul class="liste">${d.muligheter.filter((m: any) => !m.lukket).map((m: any) => html`<li><div class="tekst"><b>${m.produktlinje === "sigdal" ? "Sigdal CRM" : "Hengsel"}, ${flertall(m.antall_butikker, "butikk", "butikker")}</b><span>${m.verdi_mnd_ore ? `${kr(m.verdi_mnd_ore)} per mnd · ` : d.verdi_ore ? `${kr(d.verdi_ore)} per mnd (standard oppsett) · ` : ""}åpnet ${dato(m.aapnet)}</span></div>${pille(m.fase)}</li>`)}</ul>` : raw(`<p class="meta">Ingen åpne muligheter.</p>`)}</section>
        <section class="kort"><h2>Tilbud og avtaler</h2>
          ${dok.length ? html`<ul class="liste">${dok.map((x: any) => html`<li>${raw(ikon(x.ikon, 20))}<div class="tekst"><b><a href="${x.href}" ${x.type === "tilbud" ? 'target="_blank" rel="noopener"' : ""}>${x.tittel}</a></b><span>${x.tekst}</span></div>${pille(x.status, x.statusTekst)}${x.type === "tilbud" && x.status === "utkast" ? html`<button class="knapp liten" type="button" data-send-tilbud="${x.id}">Merk som sendt</button>` : ""}${x.type === "tilbud" && (x.status === "sendt" || x.status === "utkast") && !d.avtaler.length ? html`<button class="knapp liten" type="button" data-lag-avtale="${x.id}">Lag avtale</button>` : ""}</li>`)}</ul>` : raw(`<p class="meta">Ingen tilbud ennå. <a href="/salg/prisberegner?eier=${e.id}">Lag et i prisberegneren.</a></p>`)}</section>
      </div>
      <section class="kort"><h2>Tidslinje <button class="knapp tekst liten" type="button" id="ny-akt-2">Ny aktivitet</button></h2>
        ${e.neste_tekst && e.neste_dato && e.status !== "tapt" ? html`<div class="nesteboks">${raw(ikon(d.forfalt ? "frist" : "kalender", 20))}<div><span class="meta">Neste steg</span><br /><b>${e.neste_tekst}</b></div>${neste("", e.neste_dato, d.idag)}${raw(`<span class="neste meta" data-naar="${d.forfalt ? "forfalt" : d.i_dag ? "i_dag" : "senere"}">${d.forfalt ? `Forfalt ${dato(e.neste_dato)}` : d.i_dag ? "I dag" : dato(e.neste_dato)}</span>`)}</div>` : ""}
        <div class="mb-12 chips" >${[["alle", "Alle"], ...Object.entries(AKTIVITET).map(([k, v]) => [k, v[0]])].map(([k, n]) => html`<button class="chip" type="button" data-tl="${k}" aria-pressed="${tlFilter === k}">${n}</button>`)}</div>
        ${akt.length ? html`<ul class="tidslinje">${akt.map((a: any) => html`<li><span class="prikk" data-type="${a.type}">${raw(ikon(AKTIVITET[a.type]?.[1] ?? "tilbud", 16))}</span><div class="innhold"><b>${a.tittel}<span>${dato(a.dato)}</span></b>${a.tekst ? html`<p>${a.tekst}</p>` : ""}${a.neste_tekst ? html`<p class="meta">Neste steg: ${a.neste_tekst} (${dato(a.neste_dato)})</p>` : ""}<div class="meta">${AKTIVITET[a.type]?.[0] ?? a.type} · ${a.hvem}${a.kontakt_navn ? ` · ${a.kontakt_navn}` : ""}</div></div></li>`)}</ul>`
        : d.aktiviteter.length ? raw(`<p class="meta">Ingen aktiviteter av denne typen.</p>`) : raw(`<div class="tom">${ikon("samtaler", 28)}<b>Ingen aktiviteter ennå</b><span>Logg samtaler, møter og demoer her, og sett et neste steg.</span><div class="handlinger"><button class="knapp primar" type="button" id="forste-akt">${ikon("pluss", 18)}Første aktivitet</button></div></div>`)}
      </section>
    </div>`);
  koble();
}

const nyAkt = (type?: string) => document.dispatchEvent(new CustomEvent("ny-aktivitet", { detail: { id: data.eier.id, navn: data.eier.navn, kontakter: data.kontakter, type } }));
const tapt = async () => { const g = await taptDialog(data.eier.navn, data.tap_grunner); if (!g) return; await api("PATCH", `/api/eiere/${id}`, { status: "tapt", ...g }); toast(`${data.eier.navn} er markert som tapt`); last(); };

function koble() {
  ["#ny-akt", "#ny-akt-2", "#forste-akt"].forEach((s) => q(s)?.addEventListener("click", () => nyAkt()));
  q("#avtal-demo")?.addEventListener("click", () => nyAkt("demo"));
  q("#ikke-aktuell")?.addEventListener("click", tapt);
  q("#gjenapne")?.addEventListener("click", async () => { await api("PATCH", `/api/eiere/${id}`, { status: "ny" }); toast("Eieren er åpnet på nytt"); last(); });
  qa<HTMLButtonElement>("[data-tl]").forEach((b) => b.addEventListener("click", () => { tlFilter = b.dataset.tl!; vis(data); }));
  q<HTMLSelectElement>("#status-velger")?.addEventListener("change", async (ev) => {
    const ny = (ev.target as HTMLSelectElement).value;
    if (ny === "tapt") return tapt();
    try { await api("PATCH", `/api/eiere/${id}`, { status: ny }); toast(`Flyttet til ${KOLONNENAVN[ny]}`); last(); } catch (e: any) { toast(e.message); last(); }
  });
  q("#rediger")?.addEventListener("click", async () => {
    const e = data.eier;
    const f = (navn: string, label: string, verdi: string | null, type = "text") => `<label class="felt"><span>${label}</span><input name="${navn}" type="${type}" value="${(verdi ?? "").replace(/"/g, "&quot;")}" /></label>`;
    await skjemaDialog({ tittel: "Rediger eier", bred: true, innhold: `${f("navn", "Eier", e.navn)}<div class="felt-rad">${f("orgnr", "Org.nr.", e.orgnr)}<label class="felt"><span>Kjede</span><select name="kjede"><option value="annen" ${e.kjede === "annen" ? "selected" : ""}>Uavhengig</option><option value="sigdal" ${e.kjede === "sigdal" ? "selected" : ""}>Sigdal</option></select></label><label class="felt"><span>Produktlinje</span><select name="produktlinje"><option value="hengsel" ${e.produktlinje === "hengsel" ? "selected" : ""}>Hengsel</option><option value="sigdal" ${e.produktlinje === "sigdal" ? "selected" : ""}>Sigdal CRM</option></select></label></div>
      <div class="felt-rad">${f("adresse", "Adresse", e.adresse)}${f("postnr", "Postnr.", e.postnr)}${f("sted", "Sted", e.sted)}${f("fylke", "Fylke", e.fylke)}</div>
      <div class="felt-rad">${f("neste_tekst", "Neste steg", e.neste_tekst)}${f("neste_dato", "Dato", e.neste_dato, "date")}</div>
      ${e.er_kunde ? `<div class="felt-rad">${f("miljo_adresse", "Kundemiljø, adresse", e.miljo_adresse)}${f("miljo_tema", "Tema", e.miljo_tema)}${f("miljo_database", "Database", e.miljo_database)}</div>` : ""}`,
      send: (d) => api("PATCH", `/api/eiere/${id}`, d) });
    last();
  });
  const butikkSkjema = (b: any = {}) => `<label class="felt"><span>Butikk</span><input name="navn" type="text" value="${(b.navn ?? "").replace(/"/g, "&quot;")}" required /></label><div class="felt-rad"><label class="felt"><span>Sted</span><input name="sted" type="text" value="${(b.sted ?? "").replace(/"/g, "&quot;")}" /></label><label class="felt"><span>Pakke</span><select name="pakke"><option value="">Ikke valgt</option>${["start", "butikk", "komplett"].map((p) => `<option value="${p}" ${b.pakke === p ? "selected" : ""}>${p[0].toUpperCase() + p.slice(1)}</option>`).join("")}</select></label><label class="felt"><span>Brukere (totalt)</span><input name="brukere" type="number" min="0" value="${b.brukere ?? ""}" /></label><label class="felt"><span>Montører</span><input name="montorer" type="number" min="0" value="${b.montorer ?? ""}" /></label></div>`;
  q("#ny-butikk")?.addEventListener("click", async () => { await skjemaDialog({ tittel: "Ny butikk", innhold: butikkSkjema(), send: (d) => api("POST", `/api/eiere/${id}/butikker`, { ...d, pakke: d.pakke || undefined, brukere: d.brukere || undefined, montorer: d.montorer || undefined }) }); last(); });
  /** Slett-knapp i en åpen redigeringsdialog: sletter og lukker dialogen (avbryt-hendelsen løser skjemaDialog-løftet) */
  const kobleSlett = (sti: string, tekst: string) => {
    const dlg = qa<HTMLDialogElement>("dialog").at(-1)!;
    q("[data-slett]", dlg)?.addEventListener("click", async () => {
      if (!confirm(tekst)) return;
      try { await api("DELETE", sti); dlg.dispatchEvent(new Event("cancel", { cancelable: true })); last(); } catch (e: any) { toast(e.message); }
    });
  };
  qa<HTMLButtonElement>("[data-rediger-butikk]").forEach((b) => b.addEventListener("click", async () => {
    const butikk = data.butikker.find((x: any) => x.id === b.dataset.redigerButikk);
    const p = skjemaDialog({ tittel: "Endre butikk", innhold: `${butikkSkjema(butikk)}<button class="venstre knapp tekst liten" type="button" data-slett >Slett butikken</button>`, send: (d) => api("PATCH", `/api/butikker/${butikk.id}`, { navn: d.navn, sted: d.sted, pakke: d.pakke || null, brukere: d.brukere === "" ? null : d.brukere, montorer: d.montorer === "" ? null : d.montorer }) });
    kobleSlett(`/api/butikker/${butikk.id}`, "Slette butikken?");
    await p; last();
  }));
  const kontaktSkjema = (k: any = {}) => `<label class="felt"><span>Navn</span><input name="navn" type="text" value="${(k.navn ?? "").replace(/"/g, "&quot;")}" required /></label><div class="felt-rad"><label class="felt"><span>Rolle</span><input name="rolle" type="text" value="${(k.rolle ?? "").replace(/"/g, "&quot;")}" /></label><label class="felt"><span>Telefon</span><input name="telefon" type="tel" value="${k.telefon ?? ""}" /></label><label class="felt"><span>E-post</span><input name="epost" type="email" value="${k.epost ?? ""}" /></label></div><div class="chips"><label class="avkryss"><input type="checkbox" name="signaturrett" value="1" ${k.signaturrett ? "checked" : ""} /> Signaturrett</label><label class="avkryss"><input type="checkbox" name="primaer" value="1" ${k.primaer ? "checked" : ""} /> Primærkontakt</label></div>`;
  q("#ny-kontakt")?.addEventListener("click", async () => { await skjemaDialog({ tittel: "Ny kontaktperson", innhold: kontaktSkjema(), send: (d) => api("POST", `/api/eiere/${id}/kontakter`, { ...d, signaturrett: d.signaturrett ? 1 : 0, primaer: d.primaer ? 1 : 0 }) }); last(); });
  qa<HTMLButtonElement>("[data-rediger-kontakt]").forEach((b) => b.addEventListener("click", async () => {
    const k = data.kontakter.find((x: any) => x.id === b.dataset.redigerKontakt);
    const p = skjemaDialog({ tittel: "Endre kontaktperson", innhold: `${kontaktSkjema(k)}<button class="venstre knapp tekst liten" type="button" data-slett >Slett kontakten</button>`, send: (d) => api("PATCH", `/api/kontakter/${k.id}`, { ...d, signaturrett: d.signaturrett ? 1 : 0, primaer: d.primaer ? 1 : 0 }) });
    kobleSlett(`/api/kontakter/${k.id}`, "Slette kontakten?");
    await p; last();
  }));
  qa<HTMLButtonElement>("[data-send-tilbud]").forEach((b) => b.addEventListener("click", async () => { await api("PATCH", `/api/tilbud/${b.dataset.sendTilbud}`, { status: "sendt" }); toast("Tilbudet er merket som sendt"); last(); }));
  qa<HTMLButtonElement>("[data-lag-avtale]").forEach((b) => b.addEventListener("click", async () => { try { const a = await api<{ nr: string }>("POST", "/api/avtaler", { tilbud_id: b.dataset.lagAvtale }); toast(`Avtale ${a.nr} er laget`, { href: `/avtaler/${a.nr}`, tekst: "Åpne" }); last(); } catch (e: any) { toast(e.message); } }));
  q("#prov-igjen")?.addEventListener("click", last);
}

async function last() {
  const t = tilstand();
  if (!data) sett(rot, html`<p class="meta">Henter eierkortet …</p><div class="to-kolonner"><div class="rutenett en-kolonne" >${raw(skjelett(3))}</div>${raw(skjelett(1))}</div>`);
  if (t === "tom") { const d = await api("GET", `/api/eiere/${id}`).catch(() => null); if (d) { d.aktiviteter = []; d.muligheter = []; d.tilbud = []; d.avtaler = []; d.eier.neste_tekst = null; return vis(d); } }
  try { vis(await api("GET", `/api/eiere/${id}`)); }
  catch (e: any) {
    sett(rot, html`<div class="kort tom">${raw(ikon("stoppet", 28))}<b>Kunne ikke åpne eierkortet</b><span>${e.kode === "ADM-404" ? "Eieren finnes ikke." : "Eieren finnes, men dataene kunne ikke hentes."} <span class="feilkode">Feilkode ${e.kode ?? "ADM-504"}.</span></span><div class="handlinger"><a class="knapp" href="${tilbake}">${rot.dataset.tilbakeNavn ?? "Tilbake til listen"}</a><button class="knapp primar" type="button" id="prov-igjen">Prøv igjen</button></div></div>`);
    q("#prov-igjen")?.addEventListener("click", last);
  }
}
last();
document.addEventListener("aktivitet-lagret", last);
