/** SA7 Avtaleside: status, signatarer i rekkefølge (kunden først), Penneo av/på, dokumenter med malversjon, vilkår og handlinger. */
import { api, html, raw, kr, dato, tid, ikon, pille, sett, q, qa, skjelett, toast, skjemaDialog, idFraSti, AVTALESTATUS } from "../lib/dom";

const rot = q("#side")!;
const nr = idFraSti();
let d: any = null;

function vis() {
  const a = d.avtale;
  const st = q("#sidetittel"); if (st) st.textContent = a.nr;
  document.title = `${a.nr} · Hengsel Admin`;
  const SIGN: Record<string, string> = { ikke_sendt: "Ikke sendt", venter: "Venter", signert: "Signert" };
  const lev = a.leverandor ?? {};
  sett(rot, html`
    <header class="sidehode"><div><div class="merker mb-6 merker" >${pille(a.visning, AVTALESTATUS[a.visning])}${d.prisliste?.eksempel ? raw(`<span class="eksempel-merke">Eksempel – prisene er ikke låst</span>`) : ""}</div><h1>${a.nr}</h1><p class="under"><a href="/salg/eiere/${a.eier_id}">${a.eier_navn}</a> · ${a.linje_navn} · ${kr(a.per_mnd_ore)} per måned uten mva</p></div>
      <div class="handlinger">
        ${a.status === "utkast" ? html`<button class="knapp primar" type="button" id="send">${raw(ikon("sendt", 18))}Send til signering</button>` : ""}
        ${a.status === "signering" ? html`<button class="knapp" type="button" id="paaminnelse">${raw(ikon("varsler", 18))}Send påminnelse</button>` : ""}
        ${d.pdf ? html`<a class="knapp" href="${d.pdf}" target="_blank" rel="noopener">${raw(ikon("tilbud", 18))}${a.status === "signert" && a.signert_pdf_nokkel ? "Last ned signert PDF" : "Forhåndsvis tilbudet (PDF)"}</a>` : ""}
        ${a.status === "signert" ? html`<button class="knapp" type="button" id="si-opp">Si opp</button>` : ""}
      </div></header>
    <div class="to-kolonner">
      <div class="rutenett en-kolonne" >
        <section class="kort"><h2>Signering i Penneo <span class="mer">${d.ventetekst}</span></h2>
          ${!d.penneo_koblet ? raw(`<div class="mb-12 banner varsel" >${ikon("stoppet", 18)}<div><b>Penneo er ikke koblet til.</b> Sett hemmeligheten PENNEO_API_KEY i Workeren for å sende via Penneo. Til da markeres signeringen for hånd, i samme rekkefølge.</div></div>`) : ""}
          <ul class="signatarer">${d.signatarer.map((s: any) => html`<li><span class="nr">${s.rekkefolge}</span><div class="tekst"><b>${s.navn}</b><span>${s.rolle ?? (s.part === "kunde" ? "kunden" : "leverandøren")}${s.epost ? ` · ${s.epost}` : ""}</span></div>
            <div class="status">${pille(s.status === "signert" ? "signert" : s.status === "venter" ? "venter" : "ikke_sendt", SIGN[s.status])}<span>${s.status === "signert" ? `Signert ${tid(s.signert)}` : s.status === "venter" ? `Sendt ${tid(s.sendt)}` : s.rekkefolge === 2 ? "Etter kunden" : ""}</span>
            ${a.status === "signering" && s.rekkefolge === d.neste_signatar ? html`<button class="knapp liten" type="button" data-signert="${s.rekkefolge}">Marker som signert</button>` : ""}</div></li>`)}</ul>
          <p class="mt-10 meta" >Rekkefølge: 1 kunden (den med signaturrett hos eieren), 2 leverandøren. Avtalen får status «Signert» først når begge har signert.</p></section>
        <section class="kort"><h2>Dokumenter</h2>
          <ul class="liste">${d.dokumenter.map((x: any) => html`<li>${raw(ikon("tilbud", 20))}<div class="tekst"><b>${x.navn}</b><span>Mal ${x.versjon} · gjelder fra ${dato(x.gjelder_fra)}${x.eksempel ? " · eksempel, fila er ikke lagt inn" : ""}</span></div></li>`)}
            ${d.tilbud ? html`<li>${raw(ikon("tilbud", 20))}<div class="tekst"><b>Tilbud ${d.tilbud.nr} v${d.tilbud.versjon}</b><span>${dato(d.tilbud.dato)} · ${d.tilbud.status}</span></div><a class="knapp liten" href="${d.pdf}" target="_blank" rel="noopener">PDF</a></li>` : ""}</ul></section>
      </div>
      <section class="kort"><h2>Vilkår</h2>
        <dl class="dl"><dt>Start</dt><dd>${a.start ? dato(a.start) : "–"}</dd><dt>Binding</dt><dd>${a.binding_mnd} måneder</dd><dt>Oppsigelsesfrist</dt><dd>${a.oppsigelse_mnd} måneder</dd><dt>Fornyes</dt><dd>${a.fornyes ? dato(a.fornyes) : "–"}</dd>${a.opphorer ? html`<dt>Opphører</dt><dd>${dato(a.opphorer)}</dd>` : ""}<dt>Prisjustering</dt><dd>${a.prisjustering === "kpi" ? "Årlig etter KPI" : a.prisjustering}</dd><dt>Per måned</dt><dd>${kr(a.per_mnd_ore)} uten mva</dd><dt>Prisliste</dt><dd>${d.prisliste?.versjon ?? "–"}</dd><dt>Leverandør</dt><dd>${lev.navn ?? "–"}${lev.orgnr ? `, org.nr. ${lev.orgnr}` : ""}${lev.signatar ? ` · signatar ${lev.signatar}` : ""}</dd>${a.penneo_sak_id ? html`<dt>Penneo-sak</dt><dd>${a.penneo_sak_id}</dd>` : ""}</dl>
        <p class="mt-12 meta" >Varsel om fornyelse går til eier og Eirik ${d.fornyes_snart_dager ?? 90} dager før fornyelsesdatoen. Oppsigelse må komme senest ${a.oppsigelse_mnd} måneder før. Viderefakturert bruk (SMS, Penneo og AI) kommer i tillegg.</p></section>
    </div>`);
  q("#send")?.addEventListener("click", async () => { try { const r = await api<any>("POST", `/api/avtaler/${nr}/send`); toast(r.penneo ? "Sendt til Penneo. Kunden signerer først." : "Avtalen er til signering. Penneo er ikke koblet til, så signeringen registreres for hånd."); last(); } catch (e: any) { toast(e.message); } });
  q("#paaminnelse")?.addEventListener("click", async () => { try { const r = await api<any>("POST", `/api/avtaler/${nr}/paaminnelse`); toast(r.melding); last(); } catch (e: any) { toast(e.message); } });
  qa<HTMLButtonElement>("[data-signert]").forEach((b) => b.addEventListener("click", async () => { try { const r = await api<any>("POST", `/api/avtaler/${nr}/signert`, { rekkefolge: Number(b.dataset.signert) }); toast(r.alle_signert ? "Begge har signert. Eieren er nå kunde." : "Signert. Leverandøren får invitasjon nå."); last(); } catch (e: any) { toast(e.message); } }));
  q("#si-opp")?.addEventListener("click", async () => { await skjemaDialog({ tittel: `Si opp ${nr}`, knapp: "Si opp", innhold: `<label class="felt"><span>Opphører (standard: fornyelsesdatoen)</span><input name="opphorer" type="date" /></label>`, send: (f) => api("PATCH", `/api/avtaler/${nr}`, { status: "sagt_opp", opphorer: f.opphorer || undefined }) }); last(); });
  q("#prov-igjen")?.addEventListener("click", last);
}

async function last() {
  if (!d) sett(rot, html`<p class="meta">Henter avtalen …</p><div class="to-kolonner">${raw(skjelett(2))}</div>`);
  try { d = await api("GET", `/api/avtaler/${nr}`); d.fornyes_snart_dager = (await api<any>("GET", "/api/innstillinger").catch(() => ({ fornyes_snart_dager: 90 }))).fornyes_snart_dager; vis(); }
  catch (e: any) { sett(rot, html`<div class="kort tom">${raw(ikon("stoppet", 28))}<b>Kunne ikke åpne avtalen</b><span>${e.kode === "ADM-404" ? "Avtalen finnes ikke." : "Dataene kunne ikke hentes."} <span class="feilkode">Feilkode ${e.kode ?? "ADM-504"}.</span></span><div class="handlinger"><a class="knapp" href="/avtaler">Tilbake til avtalene</a><button class="knapp primar" type="button" id="prov-igjen">Prøv igjen</button></div></div>`); q("#prov-igjen")?.addEventListener("click", last); }
}
last();
