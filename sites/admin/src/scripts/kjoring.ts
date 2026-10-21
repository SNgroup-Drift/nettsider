/**
 * SC2 Fakturakjøring (K-260): ett kort per faktura, sidepanel med summer, kostpriser for viderefakturering og «Send N til PowerOffice».
 * K-469 (26-012 Fakturering): på kitet fra N-4. Topplinja har måneden og knappene (Lag utkast / Regn ut på nytt, Send N til PowerOffice, grå med
 * forklaring når PowerOffice ikke er koblet til). Faner Alle · Klar · Sendt · Feil med antall (2e). Status 1/3 ×3 (Sum uten mva, Mva 25 %,
 * Sum med mva, 3c), Flis 2/3 «Fakturaer» med ett kort per faktura og Flis 1/3 «Engangslinjer». Ingenting sendes uten nøkler.
 */
import { api, html, raw, sett, q, qa, kr, dato, ikon, pille, toast, skjemaDialog, feilbanner, tilstand } from "../lib/dom";
import { rot, sidehode, lagLaster, tom } from "../lib/fase-c";
import { flis, rad, settFaner, settTittel, settSidepille } from "../lib/kit";

let fane = "alle";

let maaned = new URLSearchParams(location.search).get("maaned") ?? "";
const STATUS: Record<string, string> = { klar: "Klar", sendt: "Sendt", feil: "Feil" };
const TYPE: Record<string, string> = { abonnement: "Abonnement", etablering: "Etablering", timer: "Timer ut over inkludert", viderefakturert: "Viderefakturert" };

const hode = (d?: any) => sidehode(d ? `Fakturakjøring ${d.navn.toLowerCase().replace(/^./, (c: string) => c.toUpperCase())}` : "Fakturakjøring",
  d ? `Faktureres forskuddsvis ${dato(d.fakturadato)}. Endringer er markert mot ${d.forrige_navn.toLowerCase()}.` : "Faktureres forskuddsvis den 1. i måneden.");

const laster = lagLaster<any>({
  omraade: "Fakturering", feiltekst: "Kunne ikke hente fakturakjøringen.", hode: () => hode(), skjelettN: 3,
  tomData: () => ({ maaned: "", navn: "November 2026", fakturadato: "", forrige_navn: "Oktober 2026", lagret: false, fakturaer: [], antall: 0, klar: 0, sendt: 0, feil: 0, sum_ore: 0, mva_ore: 0, inkl_ore: 0, per_type: {}, poweroffice_koblet: false, kjoringer: [] }),
  hent: () => api("GET", maaned ? `/api/fakturakjoring/${maaned}` : "/api/fakturakjoring"),
  vis,
});

function fakturakort(f: any, d: any) {
  const abo = f.linjer.find((l: any) => l.type === "abonnement");
  const engang = f.linjer.filter((l: any) => l.type !== "abonnement");
  const kanEndre = d.lagret && f.status !== "sendt";
  return html`<article class="kort flat faktura" data-status="${f.status}">
    <div class="korthode"><b>${f.eier_navn}</b>${pille(f.status, STATUS[f.status])}${f.status === "feil" && d.poweroffice_koblet ? raw(`<button class="knapp liten" type="button" data-send-en="${f.id}">Prøv igjen</button>`) : ""}${kanEndre ? raw(`<button class="knapp liten" type="button" data-kostpris="${f.eier_id}">${ikon("pluss", 16)}Kostpris</button>`) : ""}</div>
    ${f.feilmelding ? html`<div class="feillinje">${raw(ikon("stoppet", 16))}${f.feilmelding}</div>` : ""}
    ${f.endret.length ? html`<div class="endret"><span>Endret:</span>${f.endret.map((e: string) => html`<span class="merkelapp">${e}</span>`)}</div>` : ""}
    ${abo ? html`<div class="fakturalinje"><span class="type">Abonnement</span><span>${abo.tekst} <a href="/fakturering/abonnement?id=${f.abonnement_id}">Se linjene</a></span><span></span><span class="belop">${kr(abo.belop_ore)}</span></div>` : ""}
    ${engang.map((l: any) => html`<div class="fakturalinje"><span class="type">${TYPE[l.type] ?? l.type}</span><span>${l.tekst}</span><span>${l.kilde === "manuell" && kanEndre && l.id ? raw(`<button class="knapp tekst liten" type="button" data-slett="${l.id}" aria-label="Slett linjen">${ikon("lukk", 16)}</button>`) : ""}</span><span class="belop">${kr(l.belop_ore)}</span></div>`)}
    <div class="fakturabunn">${!f.endret.length ? html`<span>Ingen endring siden ${d.forrige_navn.split(" ")[0].toLowerCase()}</span>` : ""}<span class="fyll"></span><span>Uten mva <b>${kr(f.sum_ore)}</b></span><span>Mva ${kr(f.mva_ore)}</span><span>Med mva <b>${kr(f.inkl_ore)}</b></span></div>
  </article>`;
}

function vis(d: any, { feil }: { feil?: unknown } = {}) {
  if (!maaned && d.maaned) maaned = d.maaned;
  const tomt = tilstand() === "tom" || !d.fakturaer.length;
  settTittel("Fakturakjøring", "Fakturering");
  settSidepille(d.navn, d.lagret ? "pagar" : "advarsel");
  const knapp = d.poweroffice_koblet
    ? `<button class="knapp primar" type="button" id="send" ${d.klar && d.lagret ? "" : "disabled"}>${ikon("sendt", 18)}Send ${d.klar} til PowerOffice</button>`
    : `<button class="knapp primar" type="button" disabled title="PowerOffice er ikke koblet til" aria-describedby="po-av">${ikon("sendt", 18)}Send ${d.klar} til PowerOffice</button>`;
  const mndValg = d.kjoringer?.length ? `<label class="felt"><span class="visuelt-skjult">Måned</span><select id="mnd">${[...new Set([d.maaned, ...d.kjoringer.map((k: any) => k.maaned)])].sort().reverse().map((m) => `<option value="${m}" ${m === d.maaned ? "selected" : ""}>${m}</option>`).join("")}</select></label>` : "";
  const topp = q("#topphandlinger");
  if (topp) topp.innerHTML = `<button class="knapp" type="button" id="utkast">${d.lagret ? "Regn ut på nytt" : "Lag utkast"}</button>${knapp}`;
  settFaner([{ id: "alle", navn: "Alle", antall: d.antall }, ...["klar", "sendt", "feil"].map((s) => ({ id: s, navn: STATUS[s], antall: d[s] ?? 0 }))], fane, (id) => { fane = id; vis(d, { feil }); });
  const fakturaer = d.fakturaer.filter((f: any) => fane === "alle" || f.status === fane);
  const varsler = html`${!d.poweroffice_koblet ? raw(`<div class="forklaring" id="po-av">${ikon("hjelp", 16)}<span><b>PowerOffice er ikke koblet til.</b> «Send til PowerOffice» er av til hemmelighetene POWEROFFICE_APP_KEY, POWEROFFICE_CLIENT_KEY og POWEROFFICE_SUBSCRIPTION_KEY er satt i Workeren. Ingenting sendes herfra før det.</span></div>`) : ""}
    ${feil ? raw(feilbanner(feil, "PowerOffice svarte ikke", "prov-igjen")) : ""}
    ${!d.lagret && !tomt ? raw(`<div class="banner varsel">${ikon("fakturaer", 18)}<div><b>Forhåndsvisning.</b> Utkastet er ikke lagret. «Lag utkast» lagrer fakturaene, så kostpriser kan legges inn.</div></div>`) : ""}
    ${!d.tidsforing && !tomt ? raw(`<div class="forklaring">${ikon("kalender", 16)}<span>Tidsføringen (Support › Timer) finnes ikke ennå, så timer ut over inkludert er ikke med.</span></div>`) : ""}`;
  const statusRad = rad(120, [
    flis({ bredde: "1/3", tittel: "Sum uten mva", innhold: html`<p class="k-statusverdi"><b>${kr(d.sum_ore)}</b> <span class="dempet">${d.antall} ${d.antall === 1 ? "faktura" : "fakturaer"}</span></p>` }),
    flis({ bredde: "1/3", tittel: "Mva 25 %", innhold: html`<p class="k-statusverdi"><b>${kr(d.mva_ore)}</b></p>` }),
    flis({ bredde: "1/3", tittel: "Sum med mva", innhold: html`<p class="k-statusverdi"><b>${kr(d.inkl_ore)}</b> <span class="dempet">faktureres ${d.fakturadato ? dato(d.fakturadato) : "den 1."}</span></p>` }),
  ]);
  const fakturaFlis = flis({ bredde: "2/3", id: "fakturaer", tittel: "Fakturaer", teller: fakturaer.length, tittelverdi: d.forrige_navn ? `Endringer mot ${d.forrige_navn.toLowerCase()}` : "", verktoy: mndValg,
    innhold: html`${varsler}${tomt ? tom("fakturaer", `Ingen fakturaer i ${d.navn.toLowerCase()} ennå`, "Kjøringen fylles fra abonnementene, ført tid og viderefakturering. Abonnement lages fra signerte avtaler under Fakturering › Abonnement.", `<a class="knapp" href="/fakturering/abonnement">Til Abonnement</a>`)
      : html`<div class="stabel">${fakturaer.length ? fakturaer.map((f: any) => fakturakort(f, d)) : raw(`<p class="meta">Ingen fakturaer med denne statusen.</p>`)}</div>`}` });
  const engang = flis({ bredde: "1/1", id: "engangslinjer", tittel: "Engangslinjer", innhold: html`${["etablering", "timer", "viderefakturert"].map((t) => html`<div class="rad-linje"><span>${TYPE[t]}</span><b>${kr(d.per_type[t] ?? 0)}</b></div>`)}
      <div class="rad-linje dempet">Viderefakturering er kostpris + 15 %, uten kjederabatt. Etablering har ikke rabatt. Timer: ${d.timepris ? `${kr(d.timepris.ore)} per time${d.timepris.eksempel ? " (Eksempel)" : ""}` : ""}.</div>` });
  sett(rot(), html`${statusRad}${rad("auto", [fakturaFlis, html`<div class="k-b13 k-stabel">${engang}</div>`])}`);
  q<HTMLSelectElement>("#mnd")?.addEventListener("change", (e) => { maaned = (e.target as HTMLSelectElement).value; history.replaceState(null, "", `?maaned=${maaned}`); laster.last(); });
  q("#utkast")?.addEventListener("click", async () => { await api("POST", `/api/fakturakjoring/${d.maaned}/utkast`); toast("Utkastet er lagret"); laster.last(); });
  q("#send")?.addEventListener("click", () => send(d));
  q("#prov-igjen")?.addEventListener("click", () => laster.last());
  qa<HTMLButtonElement>("[data-send-en]").forEach((b) => b.addEventListener("click", () => send(d, b.dataset.sendEn)));
  qa<HTMLButtonElement>("[data-slett]").forEach((b) => b.addEventListener("click", async () => { await api("DELETE", `/api/fakturalinjer/${b.dataset.slett}`); toast("Linjen er slettet"); laster.last(); }));
  qa<HTMLButtonElement>("[data-kostpris]").forEach((b) => b.addEventListener("click", () => kostpris(d, b.dataset.kostpris!)));
}

async function send(d: any, fakturaId?: string) {
  try {
    const r = await api("POST", `/api/fakturakjoring/${d.maaned}/send`, fakturaId ? { faktura_id: fakturaId } : {});
    toast(`${r.sendt} sendt, ${r.feil} med feil`);
    laster.last();
  } catch (e) { vis(d, { feil: e }); }
}

async function kostpris(d: any, eierId: string) {
  const f = d.fakturaer.find((x: any) => x.eier_id === eierId);
  const r = await skjemaDialog({ tittel: `Kostpris for ${f.eier_navn}`, knapp: "Legg til linje", innhold: `
    <label class="felt"><span>Tekst</span><input name="tekst" type="text" maxlength="120" placeholder="SMS, oktober" required /></label>
    <label class="felt"><span>Kostpris uten mva (kr)</span><input name="kostpris" type="text" inputmode="decimal" placeholder="412,00" required /></label>
    <p class="meta">Faktureres som kostpris + 15 %, uten kjederabatt.</p>`,
    send: async (x) => {
      const kost = Math.round(Number(String(x.kostpris).replace(/\s/g, "").replace(",", ".")) * 100);
      await api("POST", `/api/fakturakjoring/${d.maaned}/viderefakturering`, { eier_id: eierId, tekst: x.tekst, kostpris_ore: Number.isFinite(kost) ? kost : -1 });
    } });
  if (r) { toast("Linjen er lagt til"); laster.last(); }
}

laster.last();
