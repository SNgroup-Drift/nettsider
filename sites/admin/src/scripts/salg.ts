/**
 * 26-009 Salg (N-4): tallraden (Åpne muligheter, Inntekt per måned, Neste steg i dag, Fornyes innen N dager), salgstavla med fem kolonner
 * (dra og slipp på PC; slipp i «Tapt» krever grunn – feltet vises mens et kort dras), «Status ▾» (Åpne, Tapt), søk, fanen Liste, og tabellen
 * «Neste steg: forfalt og i dag». Samme API som før: GET /api/oversikt, GET /api/tavle, PATCH /api/eiere/:id. Tilstander: tom, laster, feil.
 * K-469 (60-211 SA1): rad 4 med tre kort, Kortliste 1/3 ×3: «Åpne saker og frister» (fire nærmeste, forfalt først), «Oppstarter i gang»
 * (fremdrift og hva som stopper) og «Neste fakturakjøring» (dato, antall, sum uten mva, klar og sendt, feil i rød tekst). Tittelen åpner Saker,
 * Oppstart og Fakturakjøring. Kilder: GET /api/oversikt/saker, /api/oversikt/oppstart og /api/oversikt/fakturering.
 */
import { api, html, raw, kr, datoKort, flertall, sett, q, qa, feilbanner, tilstand, toast, taptDialog, nyEierDialog } from "../lib/dom";
import { frist } from "../lib/support-ui";
import { rad, flis, tallflis, kpille, sokFelt, velger, tabell, tabellHoyde, tom, laster, settFaner, kobleKit, liste } from "../lib/kit";

const rot = q("#side")!;
let fane = "tavle";
let visTapt = false;
let sokeord = "";
let ov: any = null, tv: any = null;
let kort: { saker: any; oppstart: any; fakturering: any } | null = null;
let dras: string | null = null;
const APNE = ["ny", "demo", "tilbud", "forhandling", "signert"];

const tallRad = (o: any | null) => {
  if (!o) return rad(120, ["Åpne muligheter", "Inntekt per måned", "Neste steg i dag", "Fornyes innen 90 dager"].map((e) => tallflis({ etikett: e, tall: "–" })));
  const t = o.tall, forfalt = o.neste_steg.filter((n: any) => n.forfalt).length;
  return rad(120, [
    tallflis({ etikett: "Åpne muligheter", tall: String(t.apne_muligheter), under: `${kr(t.apen_verdi_ore)} per måned`, href: "/salg/tavle" }),
    tallflis({ etikett: "Inntekt per måned", tall: kr(t.inntekt_mnd_ore), under: "uten mva, signerte avtaler", href: "/avtaler" }),
    tallflis({ etikett: "Neste steg i dag", tall: String(o.neste_steg.length), under: forfalt ? `${forfalt} forfalt` : "ingen forfalt", tone: forfalt ? "feil" : o.neste_steg.length ? "advarsel" : undefined }),
    tallflis({ etikett: `Fornyes innen ${o.fornyes_snart_dager} dager`, tall: String(t.fornyes_snart), under: o.fornyes.map((a: any) => `${a.eier_navn.split(" ")[0]} ${datoKort(a.fornyes)}`).join(", ") || "ingen", tone: t.fornyes_snart ? "advarsel" : undefined, href: "/avtaler?status=fornyes_snart" }),
  ]);
};

const passer = (c: any) => !sokeord || c.navn.toLowerCase().includes(sokeord.toLowerCase());
const kortHtml = (c: any) => html`<a class="k-tavlekort" href="/salg/eiere/${c.id}" draggable="${!c.er_kunde}" data-id="${c.id}" title="${c.navn} · ${flertall(c.antall_butikker, "butikk", "butikker")}${c.neste_tekst ? ` · ${c.neste_tekst}` : ""}" ${raw(c.forfalt ? "data-forfalt" : "")}><span>${c.navn} · ${flertall(c.antall_butikker, "butikk", "butikker")}</span></a>`;

function tavleFlis(t: any | null, feil?: unknown) {
  const kolonner = t ? t.kolonner.filter((k: any) => (visTapt ? k.id === "tapt" : APNE.includes(k.id))) : [];
  const verktoy = html`${velger("tavle-status", "Status", [["apne", "Status: Åpne"], ["tapt", "Status: Tapt"]], visTapt ? "tapt" : "apne")}${sokFelt("salgstavla", "tavle-sok", sokeord)}`;
  const innhold = feil ? raw(feilbanner(feil, "Kunne ikke hente salgstavla."))
    : !t ? laster()
    : tilstand() === "tom" ? tom("Ingen muligheter ennå", "Legg inn den første eieren, eller importer listen fra Excel. Leads fra «Be om demo» havner i «Ny» av seg selv.", html`<a class="knapp" href="/salg/import">Importer fra Excel</a>`)
    : html`<div class="k-tavle" role="list">${kolonner.map((k: any) => { const kort = k.kort.filter(passer); return html`<section class="k-kolonne" data-kolonne="${k.id}" aria-label="${k.navn}" role="listitem">
        <div class="k-kolonne-hode"><span class="navn">${k.navn}${k.antall && k.id !== "tapt" ? ` · ${kr(k.sum_ore)}` : ""}</span><span class="antall">${kort.length}</span></div>
        ${kort.length ? kort.map(kortHtml) : raw(`<div class="tomt">${sokeord ? "Ingen treff" : "Tomt"}</div>`)}</section>`; })}
        ${!visTapt ? raw(`<section class="k-kolonne k-tapt-slipp" data-kolonne="tapt" aria-label="Tapt" hidden><div class="k-kolonne-hode"><span class="navn">Tapt</span></div><div class="tomt">Slipp her. Grunnen må fylles ut.</div></section>`) : ""}</div>`;
  const antall = t ? (visTapt ? t.kolonner.find((k: any) => k.id === "tapt")?.antall ?? 0 : t.apne) : "";
  return flis({ id: "salgstavle", tittel: "Salgstavle", teller: antall, verktoy, innhold });
}

function listeFlis(t: any | null) {
  const kort = t ? t.kolonner.filter((k: any) => (visTapt ? k.id === "tapt" : APNE.includes(k.id))).flatMap((k: any) => k.kort.map((c: any) => ({ ...c, kolonne: k.id, kolonneNavn: k.navn }))).filter(passer) : [];
  const rader = kort.map((c: any) => html`<tr data-lenke="/salg/eiere/${c.id}"><th scope="row"><a href="/salg/eiere/${c.id}">${c.navn}</a></th><td class="h midt">${c.antall_butikker}</td><td class="h midt">${c.verdi_ore != null ? kr(c.verdi_ore) : "–"}</td><td class="midt">${c.tap_grunn ? `Grunn: ${c.tap_grunn}` : c.neste_tekst ?? "–"}</td><td>${kpille(c.kolonneNavn, c.kolonne)}</td></tr>`);
  return { hoyde: tabellHoyde(kort.length), html: flis({ id: "salgsliste", tittel: "Muligheter", teller: kort.length, verktoy: html`${velger("tavle-status", "Status", [["apne", "Status: Åpne"], ["tapt", "Status: Tapt"]], visTapt ? "tapt" : "apne")}${sokFelt("mulighetene", "tavle-sok", sokeord)}`,
    innhold: t ? tabell({ kompakt: kort.length <= 9, kolonner: [{ navn: "Eier" }, { navn: "Butikker", h: true, midt: true, klasse: "smal" }, { navn: "Verdi per mnd", h: true, midt: true }, { navn: "Neste steg", midt: true }, { navn: "Status", klasse: "smal" }], rader }) : laster() }) };
}

function nesteFlis(o: any | null) {
  const n = o?.neste_steg ?? [];
  const naar = (x: any) => (x.forfalt ? datoKort(x.dato) : "i dag");
  const rader = n.map((x: any) => html`<tr data-lenke="/salg/eiere/${x.eier_id}"><th scope="row" class="tid">${naar(x)}</th><td><a href="/salg/eiere/${x.eier_id}">${x.eier_navn}</a></td><td class="midt">${x.tekst}</td><td>${x.forfalt ? kpille("Forfalt", "feil") : kpille("I dag", "ny")}</td></tr>`);
  return { hoyde: tabellHoyde(n.length), html: flis({ id: "neste-steg", tittel: "Neste steg: forfalt og i dag", teller: o ? n.length : "", verktoy: sokFelt("neste steg"),
    innhold: o ? tabell({ kompakt: true, kolonner: [{ navn: "Når", klasse: "smal" }, { navn: "Eier" }, { navn: "Hva", midt: true }, { navn: "Status", klasse: "smal" }], rader, ingen: "Ingen steg i dag." }) : laster() }) };
}

/** K-469: de tre kortene fra fase B og C (SA1). Feil i ett kort stopper ikke de andre. */
function kortRad() {
  const feilet = (x: any) => x instanceof Error;
  const k = kort;
  const saker = !k ? null : feilet(k.saker) ? null : k.saker;
  const sakRader = (saker?.saker ?? []).map((s: any) => ({ venstre: html`<a href="/support/saker/${s.nr}">${s.emne}</a> <span class="dempet">${s.nr}${s.eier_navn ? ` · ${s.eier_navn}` : ""}</span>`, hoyre: frist(s.frist, true) }));
  const sl = liste("ov-saker", "Åpne saker og frister", sakRader, { maks: 4, tom: "Ingen åpne saker." });
  const opp = !k || feilet(k.oppstart) ? null : k.oppstart;
  const oppRader = (opp?.i_gang ?? []).map((o: any) => ({ venstre: html`<a href="/oppstart/${o.id}">${o.eier_navn}</a> <span class="dempet">${o.ferdig} av ${o.av}${o.stopper.length ? ` · ${o.stopper[0].punkt}` : o.neste ? ` · ${o.neste.punkt}` : ""}</span>`, hoyre: o.stopper.length ? kpille("Stopper", "feil") : kpille(o.status_navn, o.status === "venter" ? "venter" : "pagar") }));
  const ol = liste("ov-oppstart", "Oppstarter i gang", oppRader, { maks: 4, tom: "Ingen oppstarter i gang." });
  const f = !k || feilet(k.fakturering) ? null : k.fakturering;
  const fakturaInnhold = !k ? laster() : !f ? tom("Fakturakjøringen svarte ikke") : html`<ul class="k-liste">
      <li><span class="k-celle">${f.navn}</span><span class="k-hoyre">${datoKort(f.dato)}</span></li>
      <li><span class="k-celle">${flertall(f.antall, "faktura", "fakturaer")}</span><span class="k-hoyre">${kr(f.sum_uten_mva_ore)} uten mva</span></li>
      <li><span class="k-celle">Klar ${f.klar} · sendt ${f.sendt}</span><span class="k-hoyre">${f.feil ? raw(`<b class="forfalt-tekst">${f.feil} feil</b>`) : "ingen feil"}</span></li></ul>`;
  return rad(320, [
    flis({ bredde: "1/3", id: "ov-saker", tittel: "Åpne saker og frister", tittelHref: "/stotte", teller: saker ? saker.apne : "", innhold: !k ? laster() : !saker ? tom("Sakene svarte ikke") : sl.innhold, handling: sl.handling }),
    flis({ bredde: "1/3", id: "ov-oppstart", tittel: "Oppstarter i gang", tittelHref: "/oppstart", teller: opp ? opp.i_gang.length : "", innhold: !k ? laster() : !opp ? tom("Oppstartene svarte ikke") : ol.innhold, handling: ol.handling }),
    flis({ bredde: "1/3", id: "ov-faktura", tittel: "Neste fakturakjøring", tittelHref: "/fakturering", innhold: fakturaInnhold }),
  ], "ov-kort");
}

function vis(feil?: unknown) {
  settFaner([{ id: "tavle", navn: "Tavle" }, { id: "liste", navn: "Liste" }], fane, (id) => { fane = id; vis(); });
  const neste = nesteFlis(ov);
  const midt = fane === "liste" ? listeFlis(tv) : { hoyde: 480 as const, html: tavleFlis(tv, feil) };
  sett(rot, html`${tallRad(ov)}${rad(midt.hoyde, [midt.html])}${rad(neste.hoyde, [neste.html])}${kortRad()}`);
  koble();
}

function koble() {
  kobleKit(rot);
  q<HTMLSelectElement>("#tavle-status")?.addEventListener("change", (e) => { visTapt = (e.target as HTMLSelectElement).value === "tapt"; vis(); });
  const s = q<HTMLInputElement>("#tavle-sok");
  s?.addEventListener("input", () => { sokeord = s.value; const pos = s.selectionStart; vis(); const s2 = q<HTMLInputElement>("#tavle-sok"); s2?.focus(); s2?.setSelectionRange(pos, pos); });
  q("#prov-igjen")?.addEventListener("click", last);
  // Dra og slipp (PC). Mens et kort dras, vises «Tapt» som eget slippfelt.
  const taptFelt = q(".k-tapt-slipp");
  qa<HTMLAnchorElement>(".k-tavle .k-tavlekort").forEach((k) => {
    k.addEventListener("dragstart", (e) => { if (k.getAttribute("draggable") !== "true") { e.preventDefault(); return; } dras = k.dataset.id!; k.classList.add("dras"); if (taptFelt) taptFelt.hidden = false; e.dataTransfer!.effectAllowed = "move"; e.dataTransfer!.setData("text/plain", dras); });
    k.addEventListener("dragend", () => { k.classList.remove("dras"); qa(".k-kolonne.slipp").forEach((c) => c.classList.remove("slipp")); if (taptFelt) taptFelt.hidden = true; dras = null; });
    k.addEventListener("click", (e) => { if (dras) e.preventDefault(); });
  });
  qa(".k-tavle .k-kolonne").forEach((c) => {
    c.addEventListener("dragover", (e) => { if (!dras) return; e.preventDefault(); e.dataTransfer!.dropEffect = "move"; c.classList.add("slipp"); });
    c.addEventListener("dragleave", () => c.classList.remove("slipp"));
    c.addEventListener("drop", async (e) => {
      e.preventDefault(); c.classList.remove("slipp");
      const id = dras ?? e.dataTransfer?.getData("text/plain"); dras = null;
      const mal = c.dataset.kolonne!;
      if (!id || !tv) return;
      const k = tv.kolonner.flatMap((x: any) => x.kort.map((y: any) => ({ ...y, kolonne: x.id }))).find((x: any) => x.id === id);
      if (!k || k.kolonne === mal) return;
      await flytt(k, mal);
    });
  });
}

async function flytt(k: any, mal: string) {
  const navn = tv.kolonner.find((x: any) => x.id === mal)?.navn ?? mal;
  let kropp: Record<string, unknown> = { status: mal };
  if (mal === "tapt") { const g = await taptDialog(k.navn, tv.tap_grunner); if (!g) return vis(); kropp = { status: "tapt", ...g }; }
  try {
    await api("PATCH", `/api/eiere/${k.id}`, kropp);
    toast(mal === "tapt" ? `${k.navn} er markert som tapt` : `${k.navn} er flyttet til ${navn}`);
    await last();
  } catch (e: any) { toast(`Kunne ikke flytte: ${e.message ?? e}`); }
}

async function last() {
  if (tilstand() === "tom") {
    ov = { tall: { apne_muligheter: 0, apen_verdi_ore: 0, inntekt_mnd_ore: 0, fornyes_snart: 0 }, neste_steg: [], fornyes: [], fornyes_snart_dager: 90 };
    kort = { saker: { apne: 0, forfalt: 0, saker: [] }, oppstart: { i_gang: [] }, fakturering: { navn: "–", dato: "", antall: 0, sum_uten_mva_ore: 0, klar: 0, sendt: 0, feil: 0 } };
    tv = { apne: 0, tap_grunner: [], kolonner: [["ny", "Ny"], ["demo", "Demo avtalt"], ["tilbud", "Tilbud sendt"], ["forhandling", "Forhandling"], ["signert", "Signert"], ["tapt", "Tapt"]].map(([id, navn]) => ({ id, navn, antall: 0, sum_ore: 0, kort: [] })) };
    return vis();
  }
  if (!ov) vis();
  const feil = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));
  void Promise.all([api("GET", "/api/oversikt/saker").catch(feil), api("GET", "/api/oversikt/oppstart").catch(feil), api("GET", "/api/oversikt/fakturering").catch(feil)])
    .then(([saker, oppstart, fakturering]) => { kort = { saker, oppstart, fakturering }; if (ov) vis(); });
  try { [ov, tv] = await Promise.all([api("GET", "/api/oversikt"), api("GET", "/api/tavle")]); vis(); if (location.pathname.startsWith("/salg/tavle") && matchMedia("(max-width: 959px)").matches) q("#salgstavle")?.scrollIntoView(); }
  catch (e) { vis(e); }
}
q("#ny-mulighet")?.addEventListener("click", async () => { const id = await nyEierDialog(); if (id) location.href = `/salg/eiere/${id}`; });
last();
document.addEventListener("aktivitet-lagret", last);
