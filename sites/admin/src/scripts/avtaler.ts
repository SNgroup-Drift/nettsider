/** SA7 Avtaler: tabell med filter på status (med antall), Penneo-banner når status ikke kan hentes, «Ny avtale fra tilbud». */
import { api, html, raw, kr, dato, ikon, pille, sett, q, qa, feilbanner, skjelett, tilstand, toast, skjemaDialog, AVTALESTATUS } from "../lib/dom";

const rot = q("#side")!;
let filter = new URLSearchParams(location.search).get("status") ?? "alle";
let data: any = null;

const hode = () => html`<header class="sidehode"><div><h1>Avtaler</h1><p class="under">Avtaler lages fra et tilbud. Signering i Penneo: kunden først, så leverandøren.</p></div><div class="handlinger"><button class="knapp primar" type="button" id="ny-avtale">${raw(ikon("pluss", 18))}Ny avtale fra tilbud</button></div></header>`;

function vis(d: any, { tom = false, feil = null as unknown } = {}) {
  data = d;
  const valg = [["alle", "Alle"], ...Object.entries(AVTALESTATUS)];
  const rader = d.avtaler.filter((a: any) => filter === "alle" || a.visning === filter);
  sett(rot, html`${raw(hode())}
    ${feil ? raw(feilbanner(feil, "Kunne ikke hente status fra Penneo. Avtalene vises, men signeringsstatus kan være utdatert.")) : ""}
    ${!d.penneo_koblet && !tom ? raw(`<div class="banner varsel">${ikon("signert", 20)}<div><b>Penneo er ikke koblet til.</b> Signering registreres for hånd på avtalesiden til hemmeligheten PENNEO_API_KEY er satt i Workeren.</div></div>`) : ""}
    <div class="chips">${valg.map(([id, n]) => html`<button class="chip" type="button" data-filter="${id}" aria-pressed="${filter === id}">${n}<span class="tall">${id === "alle" ? d.avtaler.length : d.avtaler.filter((a: any) => a.visning === id).length}</span></button>`)}</div>
    <div class="kort tabellramme">${tom ? raw(`<div class="tom">${ikon("signert", 28)}<b>Ingen avtaler ennå</b><span>Avtaler lages fra et tilbud som kunden har sagt ja til. Kundeavtale, databehandleravtale og supportnivå fylles ut fra malene.</span></div>`)
      : rader.length === 0 ? raw(`<div class="tom"><b>Ingen avtaler med status «${AVTALESTATUS[filter] ?? filter}»</b></div>`)
      : html`<table class="tabell"><thead><tr><th>Avtale</th><th>Eier</th><th>Status</th><th class="hoyre">Per mnd</th><th>Start</th><th>Fornyes</th><th>Binding</th></tr></thead>
        <tbody>${rader.map((a: any) => html`<tr data-lenke="/avtaler/${a.nr}"><td><a href="/avtaler/${a.nr}">${a.nr}</a></td><td>${a.eier_navn}</td><td>${pille(a.visning, AVTALESTATUS[a.visning])}</td><td class="hoyre">${kr(a.per_mnd_ore)}</td><td class="dempet">${a.start ? dato(a.start) : "–"}</td><td class="dempet">${a.status === "sagt_opp" ? `Opphører ${dato(a.opphorer)}` : a.fornyes ? dato(a.fornyes) : "–"}</td><td class="dempet">${a.binding_mnd} måneder</td></tr>`)}</tbody></table>`}</div>`);
  qa<HTMLButtonElement>("[data-filter]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.filter!; history.replaceState(null, "", filter === "alle" ? location.pathname : `?status=${filter}`); vis(data); }));
  qa<HTMLTableRowElement>("tr[data-lenke]").forEach((r) => r.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; location.href = r.dataset.lenke!; }));
  q("#ny-avtale")?.addEventListener("click", nyAvtale);
  q("#prov-igjen")?.addEventListener("click", last);
}

async function nyAvtale() {
  const t = await api<{ tilbud: any[] }>("GET", "/api/tilbud?uten_avtale=1");
  if (!t.tilbud.length) { toast("Ingen tilbud uten avtale. Lag et tilbud i prisberegneren først."); return; }
  await skjemaDialog({ tittel: "Ny avtale fra tilbud", knapp: "Lag avtale", innhold: `<label class="felt"><span>Tilbud</span><select name="tilbud_id">${t.tilbud.map((x) => `<option value="${x.id}">${x.nr} v${x.versjon} · ${x.eier_navn} · ${kr(x.sum_mnd_ore)}/mnd</option>`).join("")}</select></label><label class="felt"><span>Startdato (standard: første dag i neste måned)</span><input name="start" type="date" /></label>`,
    send: async (d) => { const a = await api<{ nr: string }>("POST", "/api/avtaler", { tilbud_id: d.tilbud_id, start: d.start || undefined }); toast(`Avtale ${a.nr} er laget`, { href: `/avtaler/${a.nr}`, tekst: "Åpne" }); } });
  last();
}

async function last() {
  if (tilstand() === "tom") return vis({ avtaler: [], penneo_koblet: false }, { tom: true });
  if (!data) sett(rot, html`${raw(hode())}<div class="kort">${raw(skjelett(5, "rad"))}</div>`);
  try { const d = await api("GET", "/api/avtaler"); vis(d, { tom: d.avtaler.length === 0 }); }
  catch (e) { if (data) vis(data, { feil: e }); else { sett(rot, html`${raw(hode())}${raw(feilbanner(e, "Kunne ikke hente avtalene."))}`); q("#prov-igjen")?.addEventListener("click", last); } }
}
last();
