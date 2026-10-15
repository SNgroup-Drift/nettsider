/** ST1 Tall (K-260): MRR, kunder, butikker, churn, inntekt per måned og år, kunder og butikker over tid, timer mot inkludert, bidrag, salgstrakt, fornyelser. */
import { api, html, raw, sett, kr, dato, flertall } from "../lib/dom";
import { rot, sidehode, lagLaster, tom, soyler, parSoyler, stolpe, tusen, timer, eksempel } from "../lib/fase-c";

const hode = () => sidehode("Tall", "Uten mva. Regnet i Workeren fra abonnementene, avtalene og tavla i Admin.");
const laster = lagLaster<any>({
  omraade: "Tall", feiltekst: "Kunne ikke regne ut tallene.", hode, skjelettN: 3,
  tomData: () => ({ tall: { inntekt_mnd_ore: 0, kunder: 0 }, mnd: [], tom: true }),
  hent: () => api("GET", "/api/tall"), vis,
});

function vis(d: any) {
  if (d.tom || (!d.tall.kunder && !d.mnd.some((m: any) => m.inntekt_ore))) {
    sett(rot(), html`${hode()}<div class="kort">${tom("rapporter", "Ingen tall ennå", "Tallene fylles inn når det finnes abonnementer. Salgstrakten fylles fra tavla.")}</div>`);
    return;
  }
  const t = d.tall;
  const kort = [
    [`Inntekt i ${d.navn.split(" ")[0].toLowerCase()}`, kr(t.inntekt_mnd_ore), "per måned (MRR)"],
    ["Hittil i år", kr(t.hittil_ore), d.aar[1].merknad],
    ["Kunder", String(t.kunder), t.churn.oppsagt ? `${flertall(t.churn.oppsagt, "sagt opp", "sagt opp")} siste 12 mnd (${String(t.churn.prosent).replace(".", ",")} %)` : "ingen oppsigelser siste 12 mnd"],
    ["Butikker", String(t.butikker), t.saker ? `${t.saker.apne} åpne saker` : "hos aktive kunder"],
  ];
  sett(rot(), html`${hode()}
    <section class="tall" aria-label="Nøkkeltall">${kort.map(([n, v, u]) => html`<div class="kort"><span class="navn">${n}</span><span class="verdi">${v}</span><span class="under">${u}</span></div>`)}</section>
    <div class="bred-smal">
      <section class="kort flat"><div class="korthode"><h2>Inntekt per måned</h2><span class="meta">Tusen kr, uten mva</span></div>
        <div class="diagram">${soyler(d.mnd.map((m: any) => ({ navn: m.navn, verdi: m.inntekt_ore, etikett: tusen(m.inntekt_ore) })), { merk: d.mnd.length - 1 })}</div></section>
      <section class="kort flat"><div class="korthode"><h2>Inntekt per år</h2></div>
        ${d.aar.map((a: any) => html`<div class="rad-linje"><span><b>${a.aar}</b><br /><span class="meta">${a.merknad}</span></span><b>${kr(a.inntekt_ore)}</b></div>`)}</section>
    </div>
    <div class="to-like">
      <section class="kort flat"><div class="korthode"><h2>Kunder og butikker</h2><span class="meta">Siste 12 måneder</span></div>
        <div class="diagram">${parSoyler(d.mnd.map((m: any) => ({ navn: m.navn, a: m.kunder, b: m.butikker })))}</div>
        <div class="forklaring-farger"><span><svg width="10" height="10" aria-hidden="true"><rect class="soyle" width="10" height="10" rx="2"></rect></svg> Kunder</span><span><svg width="10" height="10" aria-hidden="true"><rect class="soyle svak" width="10" height="10" rx="2"></rect></svg> Butikker</span></div></section>
      <section class="kort flat"><div class="korthode"><h2>Supporttimer mot inkludert</h2><span class="meta">${d.navn}</span></div>
        ${d.tidsforing ? html`<table class="tabell"><tbody>${d.per_kunde.map((k: any) => html`<tr><td>${k.eier_navn}</td><td class="min-160">${stolpe(k.timer ?? 0, k.inkl_timer)}</td><td class="hoyre">${timer(k.timer)} av ${k.inkl_timer} t</td></tr>`)}</tbody></table>`
          : raw(`<p class="rad-linje dempet">Tidsføringen (Support › Timer) er ikke på plass ennå.</p>`)}</section>
    </div>
    <section class="kort flat"><div class="korthode"><h2>Driftskost og bidrag per kunde</h2>${eksempel(`Intern kost ${kr(d.internkost_ore)} per supporttime${d.internkost_eksempel ? ", eksempel" : ""}`)}</div>
      <div class="tabellramme"><table class="tabell"><thead><tr><th>Kunde</th><th class="hoyre">Inntekt</th><th class="hoyre">Supporttimer</th><th class="hoyre">Kost</th><th class="hoyre">Bidrag</th><th class="hoyre">Andel</th></tr></thead>
      <tbody>${d.per_kunde.map((k: any) => html`<tr><td>${k.eier_navn}</td><td class="hoyre">${kr(k.inntekt_ore)}</td><td class="hoyre">${timer(k.timer)}</td><td class="hoyre dempet">${kr(k.kost_ore)}</td><td class="hoyre"><b>${kr(k.bidrag_ore)}</b></td><td class="hoyre dempet">${k.andel === null ? "–" : `${String(k.andel).replace(".", ",")} %`}</td></tr>`)}</tbody></table></div>
      <div class="rad-linje dempet">Databasekost per kunde er ikke koblet til i fase C og er ikke med.</div></section>
    <div class="to-like">
      <section class="kort flat"><div class="korthode"><h2>Salgstrakt</h2><span class="meta">Eiere som har nådd steget</span></div>
        <table class="tabell"><tbody>${d.trakt.map((s: any) => html`<tr><td>${s.navn}</td><td class="hoyre"><b>${s.antall}</b></td><td class="hoyre dempet">${s.overgang === null ? "" : `${s.overgang} %`}</td></tr>`)}</tbody></table>
        ${d.tapt.length ? html`<div class="korthode"><h2>Årsaker til tapt</h2></div><table class="tabell"><tbody>${d.tapt.map((x: any) => html`<tr><td>${x.grunn}</td><td class="hoyre">${x.antall}</td></tr>`)}</tbody></table>` : ""}</section>
      <section class="kort flat"><div class="korthode"><h2>Fornyes de neste 90 dagene</h2></div>
        ${d.fornyes.length ? html`<table class="tabell"><tbody>${d.fornyes.map((f: any) => html`<tr><td><a href="/avtaler/${f.nr}">${f.eier_navn}</a></td><td class="dempet">${f.status === "sagt_opp" ? `Opphører ${dato(f.opphorer)}` : dato(f.fornyes)}</td><td class="hoyre dempet">${f.dager} dager</td><td class="hoyre">${kr(f.per_mnd_ore)}</td></tr>`)}</tbody></table>` : raw(`<p class="rad-linje dempet">Ingen avtaler fornyes de neste 90 dagene.</p>`)}</section>
    </div>`);
}
laster.last();
