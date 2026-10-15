/**
 * SA1 Oversikt: fem tall, tre kort fra fase B/C (K-259: «Åpne saker og frister», «Oppstarter i gang», «Neste fakturakjøring»), neste steg
 * (forfalt og i dag), nye leads fra «Be om demo» og frister fra Drift. Tilstander: tom, laster, feil.
 * «Neste fakturakjøring» leses fra GET /api/oversikt/fakturering (K-260).
 */
import { api, html, raw, kr, dato, datoKort, flertall, ikon, neste, sett, q, feilbanner, skjelett, tilstand, tid } from "../lib/dom";
import { frist, fremdrift, settBredder } from "../lib/support-ui";

const rot = q("#side")!;
const frister: { tekst: string; kategori: string; dato: string; horer: string }[] = JSON.parse(rot.dataset.frister ?? "[]");
const UKEDAG = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
const idagTekst = () => { const d = new Date(); return `${UKEDAG[d.getDay()]} ${d.getDate()}. ${MND[d.getMonth()]}`; };

const hode = () => html`<header class="sidehode"><div><p class="under">${idagTekst()}</p><h1>Oversikt</h1></div></header>`;
const fristKort = () => html`<section class="kort" aria-labelledby="h-frister"><h2 id="h-frister">Frister fra Drift <a class="mer" href="/drift#frister">Alle frister</a></h2>
  ${frister.length ? raw(`<ul class="liste">${frister.map((f) => html`<li>${raw(ikon("frist", 18))}<div class="tekst"><b>${f.tekst}</b><span>${f.kategori} · ${f.horer}</span></div><span class="meta">${f.dato}</span></li>`).join("")}</ul>`) : raw(`<p class="meta">Ingen frister med dato.</p>`)}</section>`;

function vis(d: any, tom = false) {
  const t = d.tall;
  const tall = [
    ["Aktive kunder", String(t.aktive_kunder), d.sagt_opp.length ? `${flertall(d.sagt_opp.length, "sagt opp", "sagt opp")}, slutter ${datoKort(d.sagt_opp[0].opphorer)}` : "ingen oppsigelser", "/kunder"],
    ["Butikker", String(t.butikker_hos_kunder), "hos aktive kunder", "/kunder"],
    ["Inntekt per måned", kr(t.inntekt_mnd_ore), "uten mva, signerte avtaler", "/avtaler"],
    ["Åpne muligheter", String(t.apne_muligheter), `${kr(t.apen_verdi_ore)} per mnd`, "/salg/tavle"],
    [`Fornyes innen ${d.fornyes_snart_dager} dager`, String(t.fornyes_snart), d.fornyes.map((a: any) => `${a.eier_navn.split(" ")[0]} ${datoKort(a.fornyes)}`).join(", ") || "ingen", "/avtaler?status=fornyes_snart"],
  ];
  sett(rot, html`${raw(hode())}
    ${d.prisliste && d.prisliste.status !== "aktiv" ? raw(`<div class="banner varsel">${ikon("innstillinger", 18)}<div><b>Prislisten ${d.prisliste.versjon} er et utkast.</b> Tavla og prisberegneren bruker den som eksempel til den er publisert under Innstillinger › Prisliste.</div></div>`) : ""}
    <section class="tall" aria-label="Tallene">${tall.map(([navn, verdi, under, href]) => html`<a class="kort" href="${href}"><span class="navn">${navn}</span><span class="verdi">${verdi}</span><span class="under">${under}</span></a>`)}</section>
    <div class="tre-kort" id="fase-bc">${raw(skjelett(3))}</div>
    <div class="to-kolonner">
      <div class="rutenett en-kolonne" >
        <section class="kort" aria-labelledby="h-neste"><h2 id="h-neste">Neste steg <span class="mer">I dag og forfalt</span></h2>
          ${d.neste_steg.length ? raw(`<ul class="liste">${d.neste_steg.map((n: any) => html`<li><a class="rad" href="/salg/eiere/${n.eier_id}"><div class="tekst"><b>${n.tekst}</b><span>${n.eier_navn}</span></div>${neste("", n.dato, d.idag)}${raw(`<span class="neste" data-naar="${n.forfalt ? "forfalt" : "i_dag"}">${ikon(n.forfalt ? "frist" : "kalender", 16)}${n.forfalt ? `Forfalt ${datoKort(n.dato)}` : "I dag"}</span>`)}</a></li>`).join("")}</ul>`) : raw(`<p class="meta">Ingen steg i dag.</p>`)}
        </section>
        ${d.leads.length ? html`<section class="kort" aria-labelledby="h-leads"><h2 id="h-leads">Nye leads <span class="mer">Fra «Be om demo»</span></h2>
          <ul class="liste">${d.leads.map((l: any) => html`<li><a class="rad" href="/salg/eiere/${l.id}"><div class="tekst"><b>${l.navn} ${l.lead_ny ? raw(`<span class="pille" data-status="ny">Ny</span>`) : ""}</b><span>${l.kontakt_navn ?? ""}${l.kontakt_navn ? " · " : ""}${flertall(l.antall_butikker, "butikk", "butikker")}${l.fylke ? ` · ${l.fylke}` : ""}</span></div><span class="meta">${l.lead_tid ? tid(l.lead_tid) : ""}</span></a></li>`)}</ul></section>` : ""}
      </div>
      ${raw(fristKort())}
    </div>`);
  void tom;
  void visFaseBC(tom);
}

// ── K-259: kortene for saker, oppstarter og neste fakturakjøring ──
const sakerKort = (d: any | null) => html`<section class="kort uten-pad" aria-labelledby="h-saker"><h2 id="h-saker" class="korthode"><a href="/support/saker">Åpne saker og frister</a><span class="mer">${d ? `${d.apne} åpne · ${d.forfalt} forfalt` : ""}</span></h2>
  ${!d ? raw(`<p class="meta innrykk">Kunne ikke hente sakene.</p>`) : d.saker.length ? html`<ul class="liste innrykk">${d.saker.map((s: any) => html`<li><a class="rad" href="/support/saker/${s.nr}"><div class="tekst"><b>${s.emne}</b><span>${s.nr} · ${s.eier_navn ?? "Ukjent kunde"}</span></div>${frist(s.frist)}</a></li>`)}</ul>` : raw(`<p class="meta innrykk">Ingen åpne saker.</p>`)}</section>`;
const oppstartKort = (d: any | null) => html`<section class="kort uten-pad" aria-labelledby="h-oppstart"><h2 id="h-oppstart" class="korthode"><a href="/oppstart">Oppstarter i gang</a></h2>
  ${!d ? raw(`<p class="meta innrykk">Kunne ikke hente oppstartene.</p>`) : d.i_gang.length ? html`<ul class="liste innrykk">${d.i_gang.map((o: any) => html`<li class="oppstart-li"><a class="rad blokk" href="/oppstart/${o.id}"><span class="topp"><b>${o.eier_navn}</b><span class="meta">Start ${dato(o.oppstartsdato)}</span></span>
    <span class="fremdrift-rad">${fremdrift(o.ferdig, o.av)}<span class="meta">${o.ferdig} av ${o.av}</span></span>${o.stopper.map((x: any) => html`<span class="stopper-tekst">${raw(ikon("stoppet", 16))}<b>Stopper:</b> ${x.punkt}</span>`)}</a></li>`)}</ul>` : raw(`<p class="meta innrykk">Ingen oppstarter i gang.</p>`)}</section>`;
const fakturaKort = (k: any | null) => html`<section class="kort uten-pad" aria-labelledby="h-faktura"><h2 id="h-faktura" class="korthode"><a href="/fakturering/kjoring">Neste fakturakjøring</a></h2>
  ${!k ? raw(`<div class="innrykk kommer"><span class="merke kommer">Kommer</span><p class="meta">Fakturakjøringen bygges i fase C. Kortet viser dato, antall, sum og feil når den er på plass.</p></div>`) : html`<div class="innrykk"><b class="stor-dato">${dato(k.dato)}</b><p class="meta">${k.mnd_navn ?? k.navn ?? ""}${k.dager_til != null ? `, om ${k.dager_til} dager` : ""}</p>
    <dl class="dl mt-10"><dt>Fakturaer</dt><dd class="hoyre-tall">${k.antall ?? 0}</dd><dt>Sum uten mva</dt><dd class="hoyre-tall"><b>${kr(k.sum_uten_mva_ore)}</b></dd><dt>Klar</dt><dd class="hoyre-tall">${k.klar ?? 0}</dd><dt>Sendt</dt><dd class="hoyre-tall">${k.sendt ?? 0}</dd></dl></div>
    ${k.feil ? html`<p class="feil-linje">${raw(ikon("stoppet", 16))}${k.feil} feil${k.feilmeldinger?.[0] ? `: ${k.feilmeldinger[0]}` : ""}</p>` : ""}`}</section>`;

async function visFaseBC(tom: boolean) {
  const boks = q("#fase-bc");
  if (!boks) return;
  if (tom) { sett(boks, html`${sakerKort({ apne: 0, forfalt: 0, saker: [] })}${oppstartKort({ i_gang: [] })}${fakturaKort(null)}`); return; }
  const [s, o, k] = await Promise.allSettled([api("GET", "/api/oversikt/saker"), api("GET", "/api/oversikt/oppstart"), api("GET", "/api/oversikt/fakturering")]);
  sett(boks, html`${sakerKort(s.status === "fulfilled" ? s.value : null)}${oppstartKort(o.status === "fulfilled" ? o.value : null)}${fakturaKort(k.status === "fulfilled" && k.value?.dato ? k.value : null)}`);
  settBredder(boks);
}

async function last() {
  const t = tilstand();
  if (t === "tom") return vis({ idag: "", tall: { aktive_kunder: 0, butikker_hos_kunder: 0, inntekt_mnd_ore: 0, apne_muligheter: 0, apen_verdi_ore: 0, fornyes_snart: 0 }, sagt_opp: [], fornyes: [], neste_steg: [], leads: [], fornyes_snart_dager: 90, prisliste: null }, true);
  sett(rot, html`${raw(hode())}<section class="tall">${raw(skjelett(5))}</section><div class="to-kolonner">${raw(skjelett(2))}</div>`);
  try { vis(await api("GET", "/api/oversikt")); }
  catch (e) {
    sett(rot, html`${raw(hode())}${raw(feilbanner(e, "Kunne ikke hente oversikten."))}<section class="tall">${["Aktive kunder", "Butikker", "Inntekt per måned", "Åpne muligheter", "Fornyes snart"].map((n) => html`<div class="kort"><span class="navn">${n}</span><span class="verdi">–</span><span class="under">sist hentede tall mangler</span></div>`)}</section>${raw(fristKort())}`);
    q("#prov-igjen")?.addEventListener("click", last);
  }
}
last();
document.addEventListener("aktivitet-lagret", last);
void dato;
