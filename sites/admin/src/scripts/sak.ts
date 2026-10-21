/**
 * SB2 Sak (K-259, 60-211): tråden (kunden hvit, svar furu, interne notater gule og merket «kunden ser ikke dette»), svar eller internt notat
 * med svarmaler, statusbytte som segment (frist-stopp ved «Venter på kunde»), tidtaker og manuell føring, kontakt og kunde, og det som ble
 * sendt med «Hjelp». Svar lagres som e-postutkast med forhåndsvisning; ingenting sendes fra Admin (rapporten K-259).
 * Tilstander: tom (ingen meldinger), laster (grå blokker), feil (svaret kunne ikke lagres, teksten tas vare på som utkast i nettleseren).
 */
import { api, ApiFeil, html, raw, q, qa, sett, tilstand, feilbanner, ikon, esc, toast, skjemaDialog, idFraSti, type Raa } from "../lib/dom";
import { prioritet, frist, kilde, klokke, datoTid, timestolpe, settBredder, t as timer } from "../lib/support-ui";
import { flis, rad, tom, laster, settTittel, settSidepille } from "../lib/kit";

const rot = q("#side")!;
const nr = idFraSti();
const UTKAST = `admin-utkast-${nr}`;
let d: any = null;
let modus: "svar" | "intern" = "svar";
let klokkeTid: ReturnType<typeof setInterval> | null = null;

const init = (navn: string | null | undefined) => esc((navn ?? "?").split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase());
const lesUtkast = () => { try { return sessionStorage.getItem(UTKAST) ?? ""; } catch { return ""; } };
const lagreUtkast = (v: string) => { try { if (v) sessionStorage.setItem(UTKAST, v); else sessionStorage.removeItem(UTKAST); } catch { /* privat modus */ } };

/** Rad 1: flisen «Sak» med fakta og svarfristen, og statusvalget i tittelfeltet (frist-stopp ved «Venter på kunde») */
function topp(): Raa {
  const s = d.sak;
  settTittel(s.emne, "Saker");
  settSidepille(s.status_navn ?? "", s.status === "lost" ? "ferdig" : s.status === "venter" ? "venter" : s.status === "ny" ? "ny" : "pagar");
  const segment = html`<div class="segment status-segment" role="group" aria-label="Status">${d.statuser.map((x: any) => html`<button type="button" data-status="${x.id}" aria-pressed="${String(s.status === x.id)}">${x.navn}</button>`)}</div>`;
  return rad("auto", [flis({ id: "sak", tittel: s.nr, verktoy: segment, innhold: html`<p class="merker">${prioritet(s.prioritet)}${kilde(s.kilde, s.kilde_navn)}<span class="dempet">Opprettet ${datoTid(s.opprettet)}</span>${frist(s.frist)}<span class="dempet">${d.frist_tekst}</span></p>` })]);
}

function melding(m: any): Raa {
  const etikett = m.type === "intern" ? html`<span class="etikett intern">Internt notat · kunden ser ikke dette</span>` : m.type === "svar" ? html`<span class="etikett svar">Svar til kunden${m.utsendelse === "utkast" ? " · e-postutkast" : ""}</span>` : html`<span class="etikett">${m.kanal ?? ""}</span>`;
  return html`<li class="melding" data-type="${m.type}">
    <span class="init" aria-hidden="true">${raw(init(m.hvem))}</span>
    <div><p class="melding-hode"><b>${m.hvem}</b>${etikett}<span class="tid">${datoTid(m.tid)}</span></p>
      <div class="boble">${m.tekst}</div>
      ${m.type === "svar" ? html`<button class="knapp tekst liten" type="button" data-epost="${m.id}">${raw(ikon("sendt", 16))}Vis e-posten</button>` : ""}</div></li>`;
}

function skriv(): Raa {
  const fornavn = (d.kontakt.navn ?? "kunden").split(/\s+/)[0];
  return html`<div class="skriv" data-modus="${modus}">
    <div class="skriv-topp"><div class="segment" role="group" aria-label="Skriv"><button type="button" data-modus="svar" aria-pressed="${String(modus === "svar")}">Svar til kunden</button><button type="button" data-modus="intern" aria-pressed="${String(modus === "intern")}">Internt notat</button></div>
      ${d.brukerveiledning_url && modus === "svar" ? html`<button class="knapp tekst liten" type="button" id="lenke-veiledning">${raw(ikon("lenke", 16))}Lenke til brukerveiledningen</button>` : ""}</div>
    ${modus === "svar" && d.svarmaler.length ? html`<div class="chips maler"><span class="navn">Svarmaler</span>${d.svarmaler.map((m: any, i: number) => html`<button type="button" class="chip" data-mal="${i}">${m.navn}</button>`)}</div>` : ""}
    <div id="skriv-feil"></div>
    <label class="visuelt-skjult" for="skrivfelt">${modus === "svar" ? "Svar til kunden" : "Internt notat"}</label>
    <textarea id="skrivfelt" rows="4" maxlength="8000" placeholder="${modus === "svar" ? `Skriv til ${fornavn} …` : "Skriv et notat. Kunden ser det ikke."}"></textarea>
    <div class="skriv-bunn"><p class="meta">${modus === "svar" ? (d.kontakt.epost ? `Lagres som e-postutkast til ${d.kontakt.navn ?? d.kontakt.epost} (${d.kontakt.epost}). E-post sendes ikke fra Admin ennå.` : "Kunden har ingen e-postadresse. Svaret lagres i saken.") : "Bare du og supportrollen ser interne notater."}</p>
      <button class="knapp primar" type="button" id="send" disabled>${raw(ikon(modus === "svar" ? "sendt" : "tilbud", 18))}${modus === "svar" ? "Lagre svar" : "Lagre notat"}</button></div></div>`;
}

function tidsforing(): Raa {
  const tt = d.tidtaker;
  const tm = d.timer_mnd;
  return flis({ id: "tidsforing", tittel: "Tidsføring", tittelverdi: `Denne saken: ${d.sum_min ? timer(d.sum_min) : "0 t"}`, innhold: html`
    <div class="tidtaker" data-gar="${String(!!tt)}">
      <div><span class="meta">${tt ? `Tidtakeren går · startet ${klokke(tt.startet)}` : "Tidtakeren står"}</span><b class="klokke" id="klokke">${tt ? "00:00:00" : "00:00:00"}</b></div>
      ${tt ? html`<div class="knapper-rad"><button class="knapp" type="button" id="tid-avbryt">Avbryt</button><button class="knapp" type="button" id="tid-stopp">${raw(`<span class="stopp-ikon" aria-hidden="true"></span>`)}Stopp og før</button></div>` : html`<button class="knapp" type="button" id="tid-start">${raw(ikon("frist", 18))}Start</button>`}
    </div>
    ${d.tid.length ? html`<ul class="foringer">${d.tid.map((x: any) => html`<li><span class="dempet">${x.dato.slice(8, 10)}.${x.dato.slice(5, 7)}</span><div><b>${x.tekst ?? (x.maate === "tidtaker" ? "Tidtaker" : "Føring")}</b><span class="meta">${x.fra && x.til ? `${x.fra}–${x.til} · ` : ""}${x.hvem}${x.maate === "tidtaker" ? " · tidtaker" : ""}</span></div><b class="min">${x.minutter} min</b>${x.fakturert_i ? "" : html`<button class="lukk-liten" type="button" data-slett-tid="${x.id}" aria-label="Slett føringen">${raw(ikon("lukk", 16))}</button>`}</li>`)}</ul>` : html`<p class="meta innrykk">Ingen tid ført på saken ennå.</p>`}
    <form class="manuell" id="manuell" novalidate><label class="visuelt-skjult" for="man-min">Minutter</label><span class="min-felt"><input id="man-min" name="minutter" type="number" min="1" max="1440" step="1" value="${d.foring_min}" inputmode="numeric" /><span>min</span></span>
      <label class="visuelt-skjult" for="man-tekst">Hva ble gjort</label><input id="man-tekst" name="tekst" type="text" maxlength="300" placeholder="Hva ble gjort" /><button class="knapp" type="submit">Før tid</button></form>
    <p class="meta innrykk">Føres i påbegynte ${d.foring_min} minutter.</p>
    ${tm ? html`<div class="inkludert"><p><span>Inkluderte timer, ${d.eier.navn.replace(/ AS$/, "")}</span><b>${timer(tm.brukt_min)} av ${timer(tm.inkludert_min)}</b></p>${timestolpe(tm.inkludert_min, tm.brukt_min)}
      <p class="meta">${tm.over_min ? `${timer(tm.over_min)} over inkludert i ${tm.mnd_navn}. Tid ut over inkludert faktureres.` : `${timer(tm.igjen_min)} igjen i ${tm.mnd_navn}. Tid ut over inkludert faktureres.`}</p></div>` : ""}` });
}

function kontaktKort(): Raa {
  const k = d.kontakt;
  return flis({ id: "kontakt", tittel: "Kontakt og kunde", handling: d.eier && d.kan_apne_kunde ? html`<a class="k-vis-alle" href="/kunder/${d.eier.id}">Åpne kunden</a>` : "", innhold: html`<div class="kontaktboks"><span class="init">${raw(init(k.navn))}</span><div><b>${k.navn ?? "Ukjent kontakt"}</b>${k.rolle ? html`<span class="meta">${k.rolle}</span>` : ""}<span class="meta">${[k.telefon, k.epost].filter(Boolean).join(" · ")}</span></div></div>
    <dl class="dl innrykk"><dt>Butikk</dt><dd>${d.butikk_navn ?? "–"}</dd><dt>Kunde</dt><dd>${d.eier?.navn ?? "Ikke koblet til en kunde"}</dd><dt>Pakker</dt><dd>${d.eier?.pakker || "–"}</dd></dl>` });
}

function hjelpKort(kompakt = false): Raa {
  const h = d.hjelp;
  if (!h) return kompakt ? html`` : flis({ id: "hjelp", tittel: "Sendt med «Hjelp»", innhold: html`<p class="meta">Saken kom på ${d.sak.kilde === "telefon" ? "telefon" : "e-post"}. Side i appen, adresse, versjon og nettleser følger bare med når kunden bruker «Hjelp» i Hengsel CRM eller Ute.</p>` });
  if (kompakt) return html`<section class="kort hjelp-kompakt bare-telefon"><b>${raw(ikon("hjelp", 16))} Sendt med ${d.sak.kilde_navn}</b><span>${h.side ?? ""}</span><span>${[h.versjon, h.enhet?.split(" · ")[0], h.skjermbilde ? "med skjermbilde" : ""].filter(Boolean).join(" · ")}</span></section>`;
  return flis({ id: "hjelp", tittel: "Sendt med «Hjelp»", klasse: "bare-pc", innhold: html`<dl class="dl"><dt>Side i appen</dt><dd>${h.side ?? "–"}</dd><dt>Adresse</dt><dd>${h.adresse ?? "–"}</dd><dt>Versjon</dt><dd>${h.versjon ?? "–"}</dd><dt>Nettleser</dt><dd>${h.enhet ?? "–"}</dd><dt>Innlogget som</dt><dd>${h.bruker ?? "–"}</dd></dl>
    ${h.skjermbilde ? html`<div class="skjermbilde"><div class="skjermbilde-flate" aria-hidden="true"><span>skjermbilde fra brukeren</span></div><p>${raw(ikon("kamera", 16))}<span>${h.skjermbilde.navn}</span><a href="${h.skjermbilde.url}" target="_blank" rel="noopener">Åpne</a></p></div>` : html`<p class="meta">Ingen skjermbilde lagt ved.</p>`}` });
}

function vis() {
  const meldinger = d.meldinger;
  const traad = flis({ bredde: "2/3", id: "traad", tittel: "Tråd", teller: meldinger.length, tittelverdi: "Interne notater ser bare du", klasse: "traad",
    innhold: html`<div class="telefon-tidtaker bare-telefon">${frist(d.sak.frist, true)}<button class="knapp liten" type="button" data-telefon-tid>${d.tidtaker ? raw(`<span class="stopp-ikon" aria-hidden="true"></span><span id="klokke-telefon">00:00:00</span>`) : raw(`${ikon("frist", 16)}Start tid`)}</button></div>
      ${hjelpKort(true)}
      ${meldinger.length ? html`<ol class="meldinger">${meldinger.map(melding)}</ol>` : tom("Ingen meldinger ennå", `Saken ble opprettet av ${d.sak.kilde.startsWith("hjelp") ? "kunden" : "Eirik"}. Skriv et svar eller et internt notat under.`)}
      ${skriv()}` });
  sett(rot, html`${topp()}${rad("auto", [traad, html`<div class="k-b13 k-stabel">${tidsforing()}${kontaktKort()}${hjelpKort()}</div>`])}`);
  koble();
  settBredder(rot);
  startKlokke();
}

function startKlokke() {
  if (klokkeTid) clearInterval(klokkeTid);
  if (!d.tidtaker) return;
  const start = new Date(d.tidtaker.startet).getTime();
  const oppdater = () => { const s = Math.max(0, Math.floor((Date.now() - start) / 1000)); const v = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, "0")).join(":"); for (const id of ["klokke", "klokke-telefon"]) { const el = document.getElementById(id); if (el) el.textContent = v; } };
  oppdater();
  klokkeTid = setInterval(oppdater, 1000);
}

async function epostVisning(id: string) {
  try {
    const { epost } = await api("GET", `/api/saker/${nr}/epost-utkast/${id}`);
    const tekst = `Til: ${epost.til ?? "(mangler e-postadresse)"}\nEmne: ${epost.emne}\n\n${epost.tekst}`;
    const r = await skjemaDialog({ tittel: "E-postutkast (sendes ikke)", bred: true, knapp: "Kopier e-posten", innhold: `<div class="banner varsel">${ikon("innstillinger", 18)}<div><b>Ikke sendt.</b> E-postløsningen er ikke bestemt ennå, så Admin sender ingenting. Kopier teksten hvis du vil sende den selv.</div></div><dl class="dl"><dt>Til</dt><dd>${esc(epost.til ?? "Mangler e-postadresse")}</dd><dt>Emne</dt><dd>${esc(epost.emne)}</dd></dl><pre class="epost-tekst">${esc(epost.tekst)}</pre>` });
    if (r) { try { await navigator.clipboard.writeText(tekst); toast("E-posten er kopiert"); } catch { toast("Kunne ikke kopiere. Merk teksten og kopier selv."); } }
  } catch (e) { toast(e instanceof ApiFeil ? e.message : "Kunne ikke vise e-posten"); }
}

function koble() {
  qa<HTMLButtonElement>(".status-segment button", rot).forEach((b) => b.addEventListener("click", async () => {
    if (b.getAttribute("aria-pressed") === "true") return;
    try { await api("PATCH", `/api/saker/${nr}`, { status: b.dataset.status }); toast(b.dataset.status === "venter" ? "Venter på kunde. Svarfristen står stille." : `Status: ${b.textContent}`); await last(); }
    catch (e) { toast(e instanceof ApiFeil ? `${e.message} (${e.kode})` : "Kunne ikke lagre"); }
  }));
  qa<HTMLButtonElement>(".skriv-topp [data-modus]", rot).forEach((b) => b.addEventListener("click", () => { const tekst = q<HTMLTextAreaElement>("#skrivfelt", rot)!.value; modus = b.dataset.modus as "svar" | "intern"; vis(); q<HTMLTextAreaElement>("#skrivfelt", rot)!.value = tekst; oppdaterSend(); }));
  const felt = q<HTMLTextAreaElement>("#skrivfelt", rot)!;
  felt.value = lesUtkast();
  felt.addEventListener("input", () => { oppdaterSend(); lagreUtkast(felt.value); });
  oppdaterSend();
  qa<HTMLButtonElement>("[data-mal]", rot).forEach((b) => b.addEventListener("click", () => { felt.value = d.svarmaler[Number(b.dataset.mal)].tekst; felt.focus(); oppdaterSend(); lagreUtkast(felt.value); }));
  q("#lenke-veiledning", rot)?.addEventListener("click", () => { felt.value = `${felt.value}${felt.value && !/\s$/.test(felt.value) ? " " : ""}${d.brukerveiledning_url}`; felt.focus(); oppdaterSend(); });
  q("#send", rot)?.addEventListener("click", send);
  qa<HTMLButtonElement>("[data-epost]", rot).forEach((b) => b.addEventListener("click", () => epostVisning(b.dataset.epost!)));
  q("#tid-start", rot)?.addEventListener("click", () => tidtaker("start"));
  q("#tid-stopp", rot)?.addEventListener("click", () => tidtaker("stopp"));
  q("#tid-avbryt", rot)?.addEventListener("click", () => tidtaker("avbryt"));
  q("[data-telefon-tid]", rot)?.addEventListener("click", () => tidtaker(d.tidtaker ? "stopp" : "start"));
  qa<HTMLButtonElement>("[data-slett-tid]", rot).forEach((b) => b.addEventListener("click", async () => {
    try { await api("DELETE", `/api/tidsforing/${b.dataset.slettTid}`); toast("Føringen er slettet"); await last(); } catch (e) { toast(e instanceof ApiFeil ? e.message : "Kunne ikke slette"); }
  }));
  q<HTMLFormElement>("#manuell", rot)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const min = (f.elements.namedItem("minutter") as HTMLInputElement).value, tekst = (f.elements.namedItem("tekst") as HTMLInputElement).value.trim();
    if (!tekst) { (f.elements.namedItem("tekst") as HTMLInputElement).focus(); toast("Skriv hva som ble gjort"); return; }
    try { const r = await api<{ minutter: number }>("POST", `/api/saker/${nr}/tid`, { minutter: Number(min), tekst }); toast(`${r.minutter} min er ført`); await last(); } catch (err) { toast(err instanceof ApiFeil ? err.message : "Kunne ikke føre tid"); }
  });
}

function oppdaterSend() { const b = q<HTMLButtonElement>("#send", rot); if (b) b.disabled = !q<HTMLTextAreaElement>("#skrivfelt", rot)?.value.trim(); }

async function send() {
  const felt = q<HTMLTextAreaElement>("#skrivfelt", rot)!;
  const tekst = felt.value.trim();
  if (!tekst) return;
  const knapp = q<HTMLButtonElement>("#send", rot)!;
  knapp.disabled = true;
  try {
    if (tilstand() === "feil") throw new ApiFeil(503, "ADM-504", "Serveren svarte ikke.");
    const r = await api<{ id: string; epost: any }>("POST", `/api/saker/${nr}/meldinger`, { type: modus, tekst });
    lagreUtkast("");
    toast(modus === "svar" ? "Svaret er lagret som e-postutkast" : "Notatet er lagret");
    await last();
    if (modus === "svar" && r.epost) void epostVisning(r.id);
  } catch (e) {
    lagreUtkast(tekst);
    const f = e instanceof ApiFeil ? e : new ApiFeil(0, "ADM-504", "Noe gikk galt.");
    sett(q("#skriv-feil", rot), `<div class="banner" role="alert">${ikon("stoppet", 18)}<div><b>${modus === "svar" ? "Svaret" : "Notatet"} kunne ikke lagres.</b>Teksten er tatt vare på som utkast i nettleseren. ${esc(f.message)} <span class="feilkode">Feilkode ${esc(f.kode)}.</span></div></div>`);
    knapp.disabled = false;
  }
}

async function tidtaker(hva: "start" | "stopp" | "avbryt") {
  try {
    if (hva === "start") { await api("POST", `/api/saker/${nr}/tidtaker`); toast("Tidtakeren går"); }
    if (hva === "avbryt") { await api("DELETE", `/api/saker/${nr}/tidtaker`); toast("Tidtakeren er stoppet uten føring"); }
    if (hva === "stopp") {
      let tekst: string | null = "";
      const r = await skjemaDialog({ tittel: "Stopp og før", knapp: "Før tid", innhold: `<p class="meta">Tiden rundes opp til påbegynte ${d.foring_min} minutter.</p><label class="felt"><span>Hva ble gjort</span><input name="tekst" type="text" maxlength="300" /></label>`, send: async (x) => { tekst = x.tekst; const s = await api<{ minutter: number }>("POST", `/api/saker/${nr}/tidtaker/stopp`, { tekst: x.tekst || undefined }); toast(`${s.minutter} min er ført`); } });
      if (!r) return;
      void tekst;
    }
    await last();
  } catch (e) { toast(e instanceof ApiFeil ? e.message : "Kunne ikke bruke tidtakeren"); }
}

async function hentSak() {
  // ?tilstand=feil gjelder bare lagring av svar på denne siden; saken hentes som vanlig (api uten tilstand)
  if (tilstand() === "feil" || tilstand() === "tom") {
    const data = await api("GET", `/api/saker/${nr}`, undefined, { utenTilstand: true });
    if (tilstand() === "tom") { data.meldinger = []; data.tid = []; data.sum_min = 0; data.tidtaker = null; }
    return data;
  }
  return api("GET", `/api/saker/${nr}`);
}

async function last() {
  if (!d) sett(rot, html`${rad(120, [flis({ tittel: "Sak", innhold: laster() })])}${rad(480, [flis({ bredde: "2/3", tittel: "Tråd", innhold: laster() }), flis({ bredde: "1/3", tittel: "Tidsføring", innhold: laster() })])}`);
  try {
    d = await hentSak();
    vis();
    document.title = `${d.sak.nr} ${d.sak.emne} · Hengsel Admin`;
    if (tilstand() === "feil") { sett(q("#skriv-feil", rot), `<div class="banner" role="alert">${ikon("stoppet", 18)}<div><b>Svaret kunne ikke sendes.</b>Det er lagret som utkast. <span class="feilkode">Feilkode ADM-504.</span></div></div>`); q<HTMLTextAreaElement>("#skrivfelt", rot)!.value = "Hei Eva. Tilbud som allerede er sendt må lages på nytt for å få logoen med. Vi kan gjøre det for dere i dag."; oppdaterSend(); }
  } catch (e) {
    sett(rot, rad(320, [flis({ tittel: "Sak", innhold: html`${raw(feilbanner(e, e instanceof ApiFeil && e.status === 404 ? "Saken finnes ikke." : "Kunne ikke hente saken."))}<p><a href="/stotte">Til saker</a></p>` })]));
    q("#prov-igjen", rot)?.addEventListener("click", last);
  }
}
last();
