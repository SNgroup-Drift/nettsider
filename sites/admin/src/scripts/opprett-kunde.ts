/**
 * Opprett kunde (K-272, S-65): veiviser i fire steg (Kunde, Butikker og merker, Domene og tema, Administrator) og et femte steg med oppsummering.
 * Eirik bekrefter oppsummeringen, trykker «Start», og kommer til fremdriftssiden (/oppstart/ny-kunde/<id>). Kontrollen skjer på serveren
 * (/api/ny-kunde/valider) med de samme reglene som Action-en bruker. Under veiviseren ligger tidligere oppsett.
 */
import { api, ApiFeil, html, raw, q, qa, sett, skjelett, feilbanner, ikon, esc, tid, pille } from "../lib/dom";
import { STEG, STATUSNAVN } from "../lib/ny-kunde.js";

const rot = q("#side")!;
const NAVN = ["Kunde", "Butikker og merker", "Domene og tema", "Administrator", "Oppsummering"];
let valg: any = null;
let trinn = 0;
const s: Record<string, any> = { id: "", navn: "", kjede: "", orgnr: "", test: false, butikker: "", merker: "", domenetype: "app", domene: "", tema: "hengsel", admin_epost: "", admin_navn: "", ref: "main", torr: false };

const linjer = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);
const tilSkjema = () => ({
  id: s.id, navn: s.navn, kjede: s.kjede ? { navn: s.kjede } : undefined, orgnr: s.orgnr, test: !!s.test, tema: s.tema,
  butikker: linjer(s.butikker).map((n) => ({ navn: n })), merker: linjer(s.merker).map((n) => ({ navn: n })),
  domene: s.domenetype === "eget" ? { type: "eget", verdi: s.domene } : { type: "app" }, admin: { epost: s.admin_epost, navn: s.admin_navn },
});

const stepper = () => html`<ol class="steg-linje" aria-label="Veiviser">${NAVN.map((n, i) => html`<li aria-current="${i === trinn ? "step" : "false"}" data-ferdig="${i < trinn}"><span class="nr">${i < trinn ? raw(ikon("hake", 14)) : i + 1}</span><span>${n}</span></li>`)}</ol>`;
const felt = (navn: string, etikett: string, innhold: string, hjelp = "") => `<div class="felt"><label for="f-${navn}"><span>${esc(etikett)}</span></label>${innhold}${hjelp ? `<p class="meta">${hjelp}</p>` : ""}</div>`;
const inn = (navn: string, etikett: string, o: { type?: string; hjelp?: string; plassholder?: string; autofokus?: boolean } = {}) =>
  felt(navn, etikett, `<input id="f-${navn}" name="${navn}" type="${o.type ?? "text"}" value="${esc(s[navn] ?? "")}" ${o.plassholder ? `placeholder="${esc(o.plassholder)}"` : ""} autocomplete="off" />`, o.hjelp);

function skjema(): string {
  if (trinn === 0) return `${inn("id", "Kunde-id (slug)", { hjelp: "Små bokstaver, tall og bindestrek. Blir navnet på Supabase-prosjektet <b>hengsel-&lt;id&gt;</b>, Pages-prosjektet og GitHub-miljøet <b>kunde-&lt;id&gt;</b>.", plassholder: "f.eks. nordli-kjokken" })}
    ${inn("navn", "Navn", { plassholder: "Nordli Kjøkken AS" })}${inn("kjede", "Kjede (valgfritt, ellers samme som navn)")}${inn("orgnr", "Org.nr.", { plassholder: "9 siffer", hjelp: "Kontrollsifferet sjekkes." })}
    <label class="avkryss"><input type="checkbox" name="test" ${s.test ? "checked" : ""} /> <span><b>Testkunde.</b> Kan rives ned igjen med «Fjern testkunde». Merkingen legges i GitHub-miljøet.</span></label>`;
  if (trinn === 1) return `${felt("butikker", "Første butikk(er)", `<textarea id="f-butikker" name="butikker" rows="5" placeholder="En butikk per linje">${esc(s.butikker)}</textarea>`, "Én butikk per linje. Koden lages fra navnet.")}
    ${felt("merker", "Merke(r)", `<textarea id="f-merker" name="merker" rows="4" placeholder="Ett merke per linje">${esc(s.merker)}</textarea>`, "Ett merke per linje. Det første blir standardmerke i alle butikkene.")}`;
  if (trinn === 2) return `<fieldset class="felt"><legend>Domene</legend>
      <label class="avkryss"><input type="radio" name="domenetype" value="app" ${s.domenetype === "app" ? "checked" : ""} /> <span><b>${esc(s.id || "<kunde>")}.app.hengsel.no</b> – DNS ligger hos oss</span></label>
      <label class="avkryss"><input type="radio" name="domenetype" value="eget" ${s.domenetype === "eget" ? "checked" : ""} /> <span><b>Eget domene</b> (f.eks. crm.kunde.no) – kunden legger inn CNAME</span></label></fieldset>
    ${s.domenetype === "eget" ? inn("domene", "Kundens domene", { plassholder: "crm.kunde.no" }) : ""}
    ${felt("tema", "Tema", `<select id="f-tema" name="tema">${valg.temaer.map((t: any) => `<option value="${esc(t.kode)}" ${s.tema === t.kode ? "selected" : ""}>${esc(t.navn)}</option>`).join("")}</select>`, "Nye temaer lages som egen PR (docs/kunder.md, punkt 5).")}`;
  if (trinn === 3) return `${inn("admin_epost", "Første administrator, e-post", { type: "email", hjelp: "Får en e-post med invitasjonslenke og rollen superadmin i kjeden." })}${inn("admin_navn", "Navn (valgfritt)")}`;
  return "";
}

function les(form: HTMLFormElement) {
  const d = new FormData(form);
  for (const [k, v] of d.entries()) if (typeof v === "string") s[k] = v.trim();
  if (trinn === 0) s.test = d.has("test");
}

async function oppsummering() {
  sett(q("#innhold", rot), html`<div class="skjelett kortet" aria-hidden="true"></div>`);
  let v: any;
  try { v = await api("POST", "/api/ny-kunde/valider", tilSkjema()); }
  catch (e) {
    if (e instanceof ApiFeil && Object.keys(e.felt).length) {
      sett(q("#innhold", rot), html`<div class="banner" role="alert">${raw(ikon("stoppet", 20))}<div><b>Oppsettet har feil.</b><ul>${Object.entries(e.felt).map(([f, m]) => html`<li>${m}</li>`)}</ul></div></div><div class="knapper"><button class="knapp" type="button" id="tilbake">Tilbake</button></div>`);
      q("#tilbake", rot)?.addEventListener("click", () => { trinn = 0; vis(); });
      return;
    }
    sett(q("#innhold", rot), raw(feilbanner(e, "Kunne ikke kontrollere oppsettet.")));
    q("#prov-igjen", rot)?.addEventListener("click", oppsummering);
    return;
  }
  const k = v.kunde;
  const rad = (a: string, b: unknown) => html`<tr><th scope="row">${a}</th><td>${b}</td></tr>`;
  sett(q("#innhold", rot), html`
    <section class="kort oppsummering" aria-labelledby="h-opps"><h2 id="h-opps" class="korthode">Oppsummering ${k.test ? pille("demo", "Testkunde") : ""}</h2>
      <div class="tabellramme"><table class="tabell nokkel-verdi"><tbody>
        ${rad("Kunde", html`<b>${k.navn}</b> (${k.id})`)}${rad("Kjede", `${k.kjede.navn} (${k.kjede.kode})`)}${rad("Org.nr.", k.orgnr)}
        ${rad("Butikker", k.butikker.map((b: any) => b.navn).join(", "))}${rad("Merker", k.merker.map((m: any) => m.navn).join(", "))}
        ${rad("Domene", k.domene.hoveddomene)}${rad("Tema", valg.temaer.find((t: any) => t.kode === k.tema)?.navn ?? k.tema)}
        ${rad("Første administrator", `${k.admin.navn} <${k.admin.epost}>`)}
        ${rad("Navn i systemene", html`Supabase <code>${k.supabase_navn}</code> · Pages <code>${k.pages_prosjekt}</code> · GitHub-miljø <code>${k.github_miljo}</code>`)}
      </tbody></table></div></section>
    <section class="kort" aria-labelledby="h-skjer"><h2 id="h-skjer" class="korthode">Dette skjer av seg selv</h2>
      <ol class="skjer-liste">${STEG.map((x: any) => html`<li><b>${x.navn}</b><span class="meta">${x.forklaring.replace("<id>", k.id)}</span></li>`)}</ol></section>
    ${valg.kan_starte ? "" : html`<div class="banner" role="alert">${raw(ikon("stoppet", 20))}<div><b>Kan ikke starte ennå.</b>Mangler Worker-hemmelighet: ${valg.mangler.join(", ")}. Se claude/k272-rapport.md i hengsel-crm for hva du må legge inn.</div></div>`}
    <div id="start-feil"></div>
    <form id="start" class="kort start-form" novalidate>
      <label class="avkryss"><input type="checkbox" name="bekreftet" /> <span><b>Jeg har kontrollert oppsummeringen.</b> Dette oppretter et Supabase-prosjekt (kostnad per måned) og et Pages-prosjekt.</span></label>
      <div class="valg-rad">
        ${k.test ? html`<label class="felt liten-felt"><span>Gren å kjøre fra</span><select name="ref"><option value="main" ${s.ref === "main" ? "selected" : ""}>main</option><option value="demo" ${s.ref === "demo" ? "selected" : ""}>demo (bare testkunder)</option></select></label>` : ""}
        <label class="avkryss"><input type="checkbox" name="torr" ${s.torr ? "checked" : ""} /> <span>Tørrkjøring (skriver ut planen, oppretter ingenting)</span></label>
      </div>
      <div class="knapper"><button class="knapp" type="button" id="tilbake">Tilbake</button><button class="knapp primar" type="submit" id="start-knapp" ${valg.kan_starte ? "" : "disabled"}>${raw(ikon("pil-hoyre", 18))}Start</button></div>
    </form>`);
  q("#tilbake", rot)?.addEventListener("click", () => { trinn = 3; vis(); });
  const form = q<HTMLFormElement>("#start", rot)!;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form);
    if (!d.has("bekreftet")) { sett(q("#start-feil", rot), html`<div class="banner" role="alert">${raw(ikon("stoppet", 18))}<div>Kryss av for at du har kontrollert oppsummeringen.</div></div>`); return; }
    s.ref = String(d.get("ref") ?? "main"); s.torr = d.has("torr");
    const knapp = q<HTMLButtonElement>("#start-knapp", rot)!; knapp.disabled = true;
    try { const r = await api<{ id: string }>("POST", "/api/ny-kunde", { ...tilSkjema(), bekreftet: true, ref: s.ref, torrkjoring: s.torr }); location.href = `/oppstart/ny-kunde/${r.id}`; }
    catch (err) { const f = err as ApiFeil; sett(q("#start-feil", rot), html`<div class="banner" role="alert">${raw(ikon("stoppet", 18))}<div><b>Kunne ikke starte.</b> ${f.message} <span class="feilkode">Feilkode ${f.kode}.</span></div></div>`); knapp.disabled = false; }
  });
}

function vis() {
  sett(q("#innhold", rot), html`<form id="veiviser" class="kort veiviser-form" novalidate><h2 class="korthode">${NAVN[trinn]}</h2><div class="skjema-kropp">${raw(skjema())}</div><div id="feil"></div>
    <div class="knapper">${trinn > 0 ? html`<button class="knapp" type="button" id="tilbake">Tilbake</button>` : ""}<button class="knapp primar" type="submit">${trinn === 3 ? "Til oppsummering" : "Neste"}</button></div></form>`);
  sett(q("#stepper", rot), stepper());
  const form = q<HTMLFormElement>("#veiviser", rot)!;
  qa<HTMLInputElement>("input[name=domenetype]", form).forEach((r) => r.addEventListener("change", () => { les(form); vis(); }));
  q("#tilbake", rot)?.addEventListener("click", () => { les(form); trinn--; vis(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault(); les(form);
    const mangler = trinn === 0 ? (!s.id ? "Kunde-id mangler." : !s.navn ? "Navn mangler." : !s.orgnr ? "Org.nr. mangler." : "") : trinn === 1 ? (!linjer(s.butikker).length ? "Minst én butikk." : !linjer(s.merker).length ? "Minst ett merke." : "") : trinn === 3 ? (!s.admin_epost ? "E-post til administrator mangler." : "") : "";
    if (mangler) { sett(q("#feil", rot), html`<p class="feil" role="alert">${mangler}</p>`); return; }
    trinn++;
    if (trinn >= 4) { sett(q("#stepper", rot), stepper()); trinn = 4; sett(q("#stepper", rot), stepper()); void oppsummering(); } else vis();
  });
}

async function tidligere() {
  const boks = q("#tidligere", rot)!;
  try {
    const d = await api<{ jobber: any[] }>("GET", "/api/ny-kunde");
    if (!d.jobber.length) { sett(boks, html`<p class="meta">Ingen oppsett er startet ennå.</p>`); return; }
    sett(boks, html`<div class="tabellramme"><table class="tabell"><thead><tr><th>Kunde</th><th>Startet</th><th>Status</th></tr></thead><tbody>
      ${d.jobber.map((j) => html`<tr data-lenke="/oppstart/ny-kunde/${j.id}"><td class="to-linjer"><a href="/oppstart/ny-kunde/${j.id}">${j.navn}</a><span>${j.kunde_id}${j.test ? " · test" : ""}${j.torrkjoring ? " · tørrkjøring" : ""}</span></td><td>${tid(j.opprettet)}</td><td>${pille(j.status === "ferdig" ? "aktiv" : j.status === "feil" ? "feil" : j.status === "fjernet" ? "utkast" : "demo", STATUSNAVN[j.status as keyof typeof STATUSNAVN])}</td></tr>`)}
    </tbody></table></div>`);
    qa<HTMLTableRowElement>("tr[data-lenke]", boks).forEach((tr) => tr.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a")) return; location.href = tr.dataset.lenke!; }));
  } catch (e) { sett(boks, raw(feilbanner(e, "Kunne ikke hente tidligere oppsett.", "prov-igjen-liste"))); q("#prov-igjen-liste", rot)?.addEventListener("click", tidligere); }
}

async function start() {
  sett(rot, html`<header class="sidehode"><div><h1>Opprett kunde</h1><p class="under">Fyll inn kunden, bekreft oppsummeringen, så går alt det tekniske av seg selv. Du følger fremdriften steg for steg.</p></div></header>${raw(skjelett(2, "rad"))}`);
  try { valg = await api("GET", "/api/ny-kunde/valg"); }
  catch (e) { sett(rot, html`<header class="sidehode"><div><h1>Opprett kunde</h1></div></header>${raw(feilbanner(e, "Kunne ikke hente valgene."))}`); q("#prov-igjen", rot)?.addEventListener("click", start); return; }
  sett(rot, html`<header class="sidehode"><div><h1>Opprett kunde</h1><p class="under">Fyll inn kunden, bekreft oppsummeringen, så går alt det tekniske av seg selv. Du følger fremdriften steg for steg.</p></div>
    <div class="handlinger"><a class="knapp" href="/oppstart">${raw(ikon("pil-venstre", 18))}Oppstarter</a></div></header>
    <div id="stepper"></div><div id="innhold"></div>
    <section class="kort uten-pad" aria-labelledby="h-tid"><h2 id="h-tid" class="korthode">Tidligere oppsett</h2><div id="tidligere" class="innrykk">${raw(skjelett(2, "rad"))}</div></section>`);
  vis();
  void tidligere();
}
void start();
