/**
 * 26-008 Tilbakemeldinger (N-4): tilbakemeldingene som kommer med «Hjelp» i Hengsel CRM og Hengsel Ute (sakene med kilde hjelp-crm og hjelp-ute,
 * K-259). Ingen ny logikk: leser GET /api/saker?status=alle og viser bare de to kildene. Faner Nye · Under arbeid · Løst i <måned>, Tabell kompakt
 * med «Kunde ▾» og søk i tittelfeltet. Raden åpner saken (/support/saker/:nr), der den behandles.
 */
import { api, html, raw, datoKort, sett, q, feilbanner, tilstand } from "../lib/dom";
import { rad, flis, kpille, velger, sokFelt, tabell, tabellHoyde, tom, laster, settFaner, kobleKit } from "../lib/kit";

const rot = q("#side")!;
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
const naa = new Date();
const mndNokkel = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(naa).slice(0, 7);
let fane = "ny";
let kunde = "alle";
let saker: any[] | null = null;
let feil: unknown = null;

const gruppe = (s: any) => (s.status === "ny" ? "ny" : s.status === "lost" ? ((s.lost_tid ?? "").slice(0, 7) === mndNokkel ? "lost" : "eldre") : "arbeid");
const naar = (iso: string) => { const d = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date(iso)); const t = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)).replace(":", "."); return d === new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(naa) ? `i dag ${t}` : datoKort(d); };

function vis() {
  const alle = saker ?? [];
  const n = (g: string) => alle.filter((s) => gruppe(s) === g).length;
  settFaner([{ id: "ny", navn: "Nye", antall: saker ? n("ny") : undefined }, { id: "arbeid", navn: "Under arbeid", antall: saker ? n("arbeid") : undefined }, { id: "lost", navn: `Løst i ${MND[naa.getMonth()]}`, antall: saker ? n("lost") : undefined }], fane, (id) => { fane = id; vis(); });
  const kunder = [...new Map(alle.filter((s) => s.eier_id).map((s) => [s.eier_id, s.eier_navn])).entries()] as [string, string][];
  const rader = alle.filter((s) => gruppe(s) === fane && (kunde === "alle" || s.eier_id === kunde));
  const innhold = feil ? raw(feilbanner(feil, "Kunne ikke hente tilbakemeldingene."))
    : !saker ? laster()
    : !alle.length ? tom("Ingen tilbakemeldinger ennå", "Det som sendes med «Hjelp» i Hengsel CRM og Hengsel Ute havner her og i Support.")
    : tabell({ kompakt: true, kolonner: [{ navn: "Når", klasse: "smal" }, { navn: "Fra", midt: true }, { navn: "Kunde", midt: true }, { navn: "Kanal", midt: true }, { navn: "Hva", midt: true }, { navn: "Status", klasse: "statuskol" }],
        rader: rader.map((s) => html`<tr data-lenke="/support/saker/${s.nr}"><th scope="row" class="tid">${naar(s.opprettet)}</th><td class="midt">${s.kontakt_navn ?? "–"}</td><td class="midt">${s.eier_navn ?? "Ukjent kunde"}</td><td class="midt">${s.kilde === "hjelp-ute" ? "Hengsel Ute" : "Hengsel CRM"}</td><td class="midt"><a href="/support/saker/${s.nr}">${s.emne}</a></td><td>${kpille(s.status === "ny" ? "Ny" : s.status === "lost" ? "Løst" : "Under arbeid", s.status === "ny" ? "ny" : s.status === "lost" ? "lost" : "under_arbeid")}</td></tr>`),
        ingen: "Ingen i denne fanen." });
  const verktoy = saker && alle.length ? html`${velger("kunde-filter", "Kunde", [["alle", "Kunde: Alle"], ...kunder], kunde)}${sokFelt("tilbakemeldingene")}` : "";
  sett(rot, rad(tabellHoyde(rader.length), [flis({ id: "tilbakemeldinger", tittel: "Tilbakemeldinger", teller: saker ? rader.length : "", verktoy, innhold })]));
  kobleKit(rot);
  q<HTMLSelectElement>("#kunde-filter")?.addEventListener("change", (e) => { kunde = (e.target as HTMLSelectElement).value; vis(); });
  q("#prov-igjen")?.addEventListener("click", last);
}

async function last() {
  feil = null;
  if (tilstand() === "tom") { saker = []; return vis(); }
  vis();
  try { saker = (await api<{ saker: any[] }>("GET", "/api/saker?status=alle")).saker.filter((s) => s.kilde === "hjelp-crm" || s.kilde === "hjelp-ute"); }
  catch (e) { feil = e; }
  vis();
}
last();
