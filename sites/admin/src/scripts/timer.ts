/**
 * SB3 Timer (K-259, 60-211): per kunde og måned pakker, inkludert, brukt, antall saker, stolpe med merke for inkludert og status
 * (Under · På grensen ≥ 90 % · Over inkludert). Over: «1,5 t × 1 150 kr = 1 725 kr blir en fakturalinje i november». Rollen support
 * får ingen beløp fra API-et (vis_belop = false). Måned velges med pilene (?mnd=ÅÅÅÅ-MM).
 */
import { api, html, raw, q, qa, sett, skjelett, tilstand, feilbanner, ikon, kr } from "../lib/dom";
import { timestolpe, settBredder, t as timer } from "../lib/support-ui";

const rot = q("#side")!;
let mnd = new URLSearchParams(location.search).get("mnd") ?? "";
const STATUS: Record<string, string> = { under: "Under", grense: "På grensen", over: "Over inkludert" };
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function hode(d: any | null) {
  const under = d ? (d.vis_belop ? `Inkluderte timer per måned: 1, 2 eller 3 per butikk etter pakke. Timer ut over faktureres med ${kr(d.timepris_ore)} per time${d.timepris_eksempel ? " (eksempel, Innstillinger)" : ""}. Føres i påbegynte ${d.foring_min} min.` : `Inkluderte timer per måned: 1, 2 eller 3 per butikk etter pakke. Føres i påbegynte ${d.foring_min} min.`) : "Henter timer …";
  return html`<header class="sidehode"><div><h1>Timer</h1><p class="under">${under}</p></div>
    ${d ? html`<div class="mndvelger"><button class="knapp ikon-knapp" type="button" data-mnd="${d.forrige}" aria-label="Forrige måned">${raw(ikon("pil-venstre", 18))}</button><b>${stor(d.mnd_navn)}</b><button class="knapp ikon-knapp" type="button" data-mnd="${d.neste}" aria-label="Neste måned">${raw(ikon("pil-hoyre", 18))}</button></div>` : ""}</header>`;
}

function forbruk(k: any, d: any) {
  if (k.status === "over") {
    const tekst = d.vis_belop ? `${timer(k.over_min)} × ${kr(d.timepris_ore)} = ${kr(k.belop_ore)} blir en fakturalinje i ${d.faktura_mnd}` : `${timer(k.over_min)} over inkludert. Blir en fakturalinje i ${d.faktura_mnd}`;
    return html`<span class="forbruk-tekst" data-status="over">${tekst}${d.vis_belop ? raw(` <a href="/fakturering/kjoring">Se fakturakjøringen</a>`) : ""}</span>`;
  }
  return html`<span class="forbruk-tekst" data-status="${k.status}">${timer(k.igjen_min)} igjen i ${d.mnd_navn.split(" ")[0]}</span>`;
}

function vis(d: any) {
  const rader = d.kunder;
  sett(rot, html`${hode(d)}
    ${rader.length ? html`<div class="kort uten-pad"><div class="tabellramme"><table class="tabell timetabell"><thead><tr><th>Kunde</th><th class="hoyre">Inkludert</th><th class="hoyre">Brukt</th><th>Forbruk</th><th>Status</th></tr></thead><tbody>
      ${rader.map((k: any) => html`<tr><td class="to-linjer"><b>${k.navn}</b><span>${k.pakker || "Ingen butikker"} · ${k.saker} ${k.saker === 1 ? "sak" : "saker"}</span><span class="liten">${k.avtaleaar.tekst}</span></td>
        <td class="hoyre">${timer(k.inkludert_min)}</td><td class="hoyre"><b>${timer(k.brukt_min)}</b></td>
        <td class="forbruk">${timestolpe(k.inkludert_min, k.brukt_min)}${forbruk(k, d)}</td>
        <td><span class="pille" data-timer="${k.status}">${STATUS[k.status]}</span></td></tr>`)}
    </tbody></table></div></div>
    <p class="forklaring"><span class="nokkel innenfor"></span>Brukt innenfor inkludert <span class="nokkel over"></span>Ut over inkludert <span class="nokkel strek"></span>Inkluderte timer <span>På grensen = 90 % eller mer brukt.</span></p>` : html`<div class="kort tom">${raw(ikon("kalender", 32))}<b>Ingen kunder med avtale</b><span>Timene vises når en kunde har signert avtale og det er ført tid på sakene.</span></div>`}`);
  qa<HTMLButtonElement>("[data-mnd]", rot).forEach((b) => b.addEventListener("click", () => { mnd = b.dataset.mnd!; history.replaceState(null, "", `?mnd=${mnd}`); last(); }));
  settBredder(rot);
}

async function last() {
  if (tilstand() === "tom") return vis({ kunder: [], vis_belop: false, foring_min: 15, mnd_navn: "", forrige: "", neste: "" });
  sett(rot, html`${hode(null)}<div class="kort uten-pad">${raw(skjelett(4, "rad"))}</div>`);
  try { vis(await api("GET", `/api/timer${mnd ? `?mnd=${encodeURIComponent(mnd)}` : ""}`)); }
  catch (e) { sett(rot, html`${hode(null)}${raw(feilbanner(e, "Kunne ikke hente timene."))}`); q("#prov-igjen", rot)?.addEventListener("click", last); }
}
last();
