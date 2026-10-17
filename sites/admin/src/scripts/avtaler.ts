/**
 * 26-004 Avtale og Penneo (N-4): faner Alle · Utkast · Til signering · Signert · Fornyes snart (· Sagt opp når det finnes) · Dokumenter og vilkår,
 * med antall (regel 2e). Tabell «Avtaler» (høyden følger antall rader) med «Eier ▾» og søk i tittelfeltet; Penneo-status til høyre i tittelen.
 * «Ny avtale fra tilbud» i topplinja. Samme API som før: GET /api/avtaler, GET /api/tilbud?uten_avtale=1, POST /api/avtaler.
 */
import { api, html, raw, kr, dato, sett, q, feilbanner, tilstand, toast, skjemaDialog, AVTALESTATUS } from "../lib/dom";
import { rad, flis, kpille, velger, sokFelt, tabell, tabellHoyde, tom, laster, settFaner, kobleKit } from "../lib/kit";

const rot = q("#side")!;
let filter = new URLSearchParams(location.search).get("status") ?? "alle";
let eierFilter = "alle";
let data: any = null;

function vis({ tomt = false, feil = null as unknown } = {}) {
  const alle = data?.avtaler ?? [];
  const antall = (s: string) => alle.filter((a: any) => a.visning === s).length;
  settFaner([
    { id: "alle", navn: "Alle", antall: data ? alle.length : undefined },
    ...["utkast", "signering", "signert", "fornyes_snart", ...(antall("sagt_opp") ? ["sagt_opp"] : [])].map((s) => ({ id: s, navn: AVTALESTATUS[s], antall: data ? antall(s) : undefined })),
    { id: "dokumenter", navn: "Dokumenter og vilkår" },
  ], filter, (id) => { filter = id; history.replaceState(null, "", id === "alle" ? location.pathname : `?status=${id}`); vis(); });
  if (filter === "dokumenter") {
    sett(rot, rad(320, [flis({ id: "dokumenter", tittel: "Dokumenter og vilkår", tittelverdi: data ? `Penneo: ${data.penneo_koblet ? "koblet til" : "ikke koblet til"}` : "", innhold: html`<div class="k-brod">
      <p>Avtaler lages fra et tilbud som kunden har sagt ja til. Kundeavtale, databehandleravtale og supportnivå fylles ut fra de aktive avtalemalene, og leverandøren hentes fra Innstillinger › Leverandør.</p>
      <p>Signering i Penneo: kunden signerer først, så leverandøren. ${data && !data.penneo_koblet ? "Penneo er ikke koblet til; signering registreres for hånd på avtalesiden til hemmeligheten PENNEO_API_KEY er satt i Workeren." : ""}</p>
      <p>Binding, oppsigelse og KPI-justering står i prislisten (<a href="/innstillinger/prisliste">Innstillinger › Prisliste</a>).</p></div>` })]));
    return kobleKit(rot);
  }
  const eiere = [...new Map(alle.map((a: any) => [a.eier_id, a.eier_navn])).entries()] as [string, string][];
  const rader = alle.filter((a: any) => (filter === "alle" || a.visning === filter) && (eierFilter === "alle" || a.eier_id === eierFilter));
  const innhold = feil && !data ? raw(feilbanner(feil, "Kunne ikke hente avtalene."))
    : !data ? laster()
    : tomt ? tom("Ingen avtaler ennå", "Avtaler lages fra et tilbud som kunden har sagt ja til. Kundeavtale, databehandleravtale og supportnivå fylles ut fra malene.")
    : html`${feil ? raw(feilbanner(feil, "Kunne ikke hente status fra Penneo. Avtalene vises, men signeringsstatus kan være utdatert.")) : ""}${tabell({
        kompakt: rader.length <= 9,
        kolonner: [{ navn: "Nr." }, { navn: "Eier", midt: true }, { navn: "Per mnd", h: true, midt: true }, { navn: "Start", h: true, midt: true }, { navn: "Fornyes", h: true, midt: true }, { navn: "Binding", midt: true }, { navn: "Status", klasse: "statuskol" }],
        rader: rader.map((a: any) => html`<tr data-lenke="/avtaler/${a.nr}"><th scope="row"><a href="/avtaler/${a.nr}">${a.nr}</a></th><td class="midt">${a.eier_navn}</td><td class="h midt">${kr(a.per_mnd_ore)}</td><td class="h midt tid">${a.start ? dato(a.start) : "–"}</td><td class="h midt tid">${a.status === "sagt_opp" ? `Opphører ${dato(a.opphorer)}` : a.fornyes ? dato(a.fornyes) : "–"}</td><td class="midt">${a.binding_mnd} mnd</td><td>${kpille(AVTALESTATUS[a.visning] ?? a.visning, a.visning)}</td></tr>`),
        ingen: `Ingen avtaler med status «${AVTALESTATUS[filter] ?? filter}».` })}`;
  const verktoy = data ? html`${velger("eier-filter", "Eier", [["alle", "Eier: Alle"], ...eiere], eierFilter)}${sokFelt("avtalene")}` : "";
  sett(rot, rad(tabellHoyde(rader.length), [flis({ id: "avtaler", tittel: "Avtaler", teller: data ? rader.length : "", tittelverdi: data && !data.penneo_koblet ? "Penneo ikke koblet til" : "", verktoy, innhold })]));
  kobleKit(rot);
  q<HTMLSelectElement>("#eier-filter")?.addEventListener("change", (e) => { eierFilter = (e.target as HTMLSelectElement).value; vis(); });
  q("#prov-igjen")?.addEventListener("click", last);
}

async function nyAvtale() {
  const t = await api<{ tilbud: any[] }>("GET", "/api/tilbud?uten_avtale=1");
  if (!t.tilbud.length) { toast("Ingen tilbud uten avtale. Lag et tilbud i prisberegneren først."); return; }
  await skjemaDialog({ tittel: "Ny avtale fra tilbud", knapp: "Lag avtale", innhold: `<label class="felt"><span>Tilbud</span><select name="tilbud_id">${t.tilbud.map((x) => `<option value="${x.id}">${x.nr} v${x.versjon} · ${x.eier_navn} · ${kr(x.sum_mnd_ore)}/mnd</option>`).join("")}</select></label><label class="felt"><span>Startdato (standard: første dag i neste måned)</span><input name="start" type="date" /></label>`,
    send: async (d) => { const a = await api<{ nr: string }>("POST", "/api/avtaler", { tilbud_id: d.tilbud_id, start: d.start || undefined }); toast(`Avtale ${a.nr} er laget`, { href: `/avtaler/${a.nr}`, tekst: "Åpne" }); } });
  last();
}
q("#ny-avtale")?.addEventListener("click", nyAvtale);

async function last() {
  if (tilstand() === "tom") { data = { avtaler: [], penneo_koblet: false }; return vis({ tomt: true }); }
  if (!data) vis();
  try { data = await api("GET", "/api/avtaler"); vis({ tomt: data.avtaler.length === 0 }); }
  catch (e) { vis({ feil: e }); }
}
last();
