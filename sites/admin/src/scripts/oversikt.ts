/** SA1 Oversikt: fem tall, neste steg (forfalt og i dag), nye leads fra «Be om demo» og frister fra Drift. Tilstander: tom, laster, feil. */
import { api, html, raw, kr, dato, datoKort, flertall, ikon, neste, sett, q, feilbanner, skjelett, tilstand, tid } from "../lib/dom";

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
