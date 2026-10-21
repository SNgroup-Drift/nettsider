/**
 * Felles skript for alle sidene i Hengsel Admin (K-240, N-4): skuffen under 1024 px, bunnfanen «Mer», bred/smal sidemeny (valget huskes i
 * nettleseren, regel 7), søket i topplinja (⌘K / Ctrl+K eller «/», Enter går til Eiere og butikker), søkeikonet og «⋯» på telefon, eksempel-pillen,
 * bjella og profilen, og dialogen «Ny aktivitet» (fra topplinja og eierkortet). Ingen tredjepart.
 */
import { api, ApiFeil, esc, html, q, qa, toast, skjemaData, visFeltfeil, ikon, AKTIVITET } from "../lib/dom";
import "./ny-sak";

// K-259: rollen (eier / support) styrer hva menyen og toppfeltet viser. Workeren stenger uansett; dette er bare visningen.
// Rollen huskes i sessionStorage så menyen ikke blinker ved neste side.
const settRolle = (r: string) => { document.documentElement.dataset.rolle = r; try { sessionStorage.setItem("admin-rolle", r); } catch { /* privat modus */ } };
try { const r = sessionStorage.getItem("admin-rolle"); if (r === "eier" || r === "support") document.documentElement.dataset.rolle = r; } catch { /* privat modus */ }

const sidemeny = q("#sidemeny");
const overlegg = q("#skuff-overlegg");
const apne = (ja: boolean) => { sidemeny?.classList.toggle("apen", ja); overlegg?.classList.toggle("apen", ja); q("#meny-knapp")?.setAttribute("aria-expanded", String(ja)); if (ja) q<HTMLAnchorElement>("#sidemeny a")?.focus(); };
q("#meny-knapp")?.addEventListener("click", () => apne(!sidemeny?.classList.contains("apen")));
q("#fane-mer")?.addEventListener("click", () => apne(true));
overlegg?.addEventListener("click", () => apne(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") apne(false); });

// Bred/smal sidemeny (regel 7): knappen nederst i menyen. Valget huskes per enhet; uten valg styrer skjermbredden (bred fra 1440 px).
const MENY_NOKKEL = "admin-meny";
const settMeny = (v: string | null) => { if (v === "bred" || v === "smal") document.documentElement.dataset.meny = v; else delete document.documentElement.dataset.meny; q("#meny-bredde")?.setAttribute("aria-pressed", String(erSmal())); };
const erSmal = () => document.documentElement.dataset.meny === "smal" || (!document.documentElement.dataset.meny && matchMedia("(min-width: 1024px) and (max-width: 1439px)").matches);
try { settMeny(localStorage.getItem(MENY_NOKKEL)); } catch { settMeny(null); }
q("#meny-bredde")?.addEventListener("click", () => { const ny = erSmal() ? "bred" : "smal"; settMeny(ny); try { localStorage.setItem(MENY_NOKKEL, ny); } catch { /* privat modus */ } });

// Telefon: søkeikonet åpner søkefeltet over topplinja, «⋯» viser de sekundære handlingene
const toppsok = q("#toppsok");
q("#sok-ikon")?.addEventListener("click", () => { toppsok?.classList.add("apen"); q<HTMLInputElement>("#sok")?.focus(); });
q<HTMLInputElement>("#sok")?.addEventListener("blur", () => toppsok?.classList.remove("apen"));
q("#mer-handlinger")?.addEventListener("click", (e) => { const t = q("#toppfelt"); const apen = !t?.classList.contains("vis-mer"); t?.classList.toggle("vis-mer", apen); (e.currentTarget as HTMLElement).setAttribute("aria-expanded", String(apen)); });
document.addEventListener("click", (e) => { if (!(e.target as HTMLElement).closest("#mer-handlinger")) q("#toppfelt")?.classList.remove("vis-mer"); });

// Eksempel-pillen i topplinja: «Eksempel – prislisten er ikke låst» så lenge gjeldende prisliste er merket eksempel
// Prislisten er ikke for rollen support (K-469): pillen hentes først når /api/meg har svart med en annen rolle
const eksPille = q("#sidepille[data-eksempel]");
const visEksPille = () => eksPille && api<{ prisliste: { eksempel: number | boolean } }>("GET", "/api/prisliste/gjeldende", undefined, { utenTilstand: true }).then((g) => {
  if (!g.prisliste?.eksempel) return;
  eksPille.textContent = "Eksempel – prislisten er ikke låst"; eksPille.dataset.tone = "advarsel"; eksPille.hidden = false;
}).catch(() => {});

// Søk: Enter går til Eiere og butikker med søkeordet. På Drift-sidene filtreres siden (drift.ts).
const sok = q<HTMLInputElement>("#sok");
if (sok && sok.dataset.modus !== "side") {
  const mal = sok.dataset.modus === "saker" ? "/stotte" : "/salg/eiere";
  sok.addEventListener("keydown", (e) => { if (e.key === "Enter" && sok.value.trim()) location.href = `${mal}?sok=${encodeURIComponent(sok.value.trim())}`; });
}
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); toppsok?.classList.add("apen"); sok?.focus(); return; }
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
  e.preventDefault();
  sok?.focus();
});

// ── Ny aktivitet (SA8) ───────────────────────────────────────────────────────────────────────────────────────────────────────
const dlg = q<HTMLDialogElement>("#dlg-aktivitet");
const form = dlg?.querySelector("form") as HTMLFormElement | undefined;
let eiere: { id: string; navn: string }[] | null = null;

/** Åpner dialogen. eier = { id, navn, kontakter } fra eierkortet, ellers velges eier i dialogen. */
export async function nyAktivitet(eier?: { id: string; navn: string; kontakter?: { id: string; navn: string; rolle?: string | null }[] }) {
  if (!dlg || !form) return;
  form.reset();
  visFeltfeil(form, {});
  (form.elements.namedItem("type") as RadioNodeList).value = "samtale";
  const eierVelger = q<HTMLSelectElement>("[name=eier_id]", form)!;
  const kontaktVelger = q<HTMLSelectElement>("[name=kontakt_id]", form)!;
  const lagre = q<HTMLButtonElement>("[data-lagre]", form)!;
  const fyllKontakter = (k: { id: string; navn: string; rolle?: string | null }[]) => { kontaktVelger.innerHTML = `<option value="">Ingen</option>${k.map((x) => `<option value="${esc(x.id)}">${esc(x.navn)}${x.rolle ? `, ${esc(x.rolle)}` : ""}</option>`).join("")}`; };
  if (eier) {
    eierVelger.innerHTML = `<option value="${esc(eier.id)}">${esc(eier.navn)}</option>`;
    eierVelger.disabled = true;
    fyllKontakter(eier.kontakter ?? []);
  } else {
    eierVelger.disabled = false;
    eierVelger.innerHTML = `<option value="">Henter …</option>`;
    fyllKontakter([]);
    try {
      eiere ??= (await api<{ eiere: { id: string; navn: string }[] }>("GET", "/api/eiere")).eiere.map((e) => ({ id: e.id, navn: e.navn }));
      eierVelger.innerHTML = `<option value="">Velg eier</option>${eiere.map((e) => `<option value="${esc(e.id)}">${esc(e.navn)}</option>`).join("")}`;
    } catch (e) { eierVelger.innerHTML = `<option value="">Kunne ikke hente eiere</option>`; }
  }
  const datoFelt = q<HTMLInputElement>("[name=dato]", form)!;
  datoFelt.value = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  lagre.disabled = true;
  dlg.showModal();
}
if (dlg && form) {
  const tittel = q<HTMLInputElement>("[name=tittel]", form)!;
  const lagre = q<HTMLButtonElement>("[data-lagre]", form)!;
  tittel.addEventListener("input", () => { lagre.disabled = !tittel.value.trim(); });
  q<HTMLSelectElement>("[name=eier_id]", form)!.addEventListener("change", async (e) => {
    const id = (e.target as HTMLSelectElement).value;
    if (!id) return;
    try { const k = await api<{ kontakter: { id: string; navn: string; rolle: string | null }[] }>("GET", `/api/eiere/${id}`); q<HTMLSelectElement>("[name=kontakt_id]", form)!.innerHTML = `<option value="">Ingen</option>${k.kontakter.map((x) => `<option value="${esc(x.id)}">${esc(x.navn)}${x.rolle ? `, ${esc(x.rolle)}` : ""}</option>`).join("")}`; } catch { /* beholder lista */ }
  });
  qa("[data-lukk]", dlg).forEach((b) => b.addEventListener("click", () => dlg.close()));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!tittel.value.trim()) return;
    const d = skjemaData(form) as Record<string, string>;
    const kropp: Record<string, unknown> = { eier_id: d.eier_id, type: d.type, tittel: d.tittel, tekst: d.tekst, dato: d.dato, kontakt_id: d.kontakt_id || undefined, neste_tekst: d.neste_tekst || undefined, neste_dato: d.neste_dato || undefined };
    lagre.disabled = true;
    try {
      await api("POST", "/api/aktiviteter", kropp);
      dlg.close();
      const navn = q<HTMLSelectElement>("[name=eier_id]", form)!.selectedOptions[0]?.textContent ?? "eieren";
      toast(`Aktiviteten er lagret på ${navn}`);
      document.dispatchEvent(new CustomEvent("aktivitet-lagret", { detail: { eier_id: d.eier_id } }));
    } catch (err) {
      // Lagring feiler: feilmeldingen vises i dialogen, teksten beholdes (60-213 punkt b)
      const f = err instanceof ApiFeil ? err : new ApiFeil(0, "ADM-504", "Kunne ikke lagre.");
      visFeltfeil(form, Object.keys(f.felt).length ? f.felt : { tittel: `${f.message} (${f.kode})` });
      lagre.disabled = false;
    }
  });
  qa<HTMLButtonElement>("[data-ny-aktivitet]").forEach((b) => b.addEventListener("click", () => nyAktivitet()));
  document.addEventListener("ny-aktivitet", (e) => nyAktivitet((e as CustomEvent).detail));
}
// Typeknappene i dialogen får ikonene sine her (ingen inline-skript)
qa("[data-type-ikon]").forEach((el) => { el.innerHTML = ikon(AKTIVITET[el.dataset.typeIkon!]?.[1] ?? "tilbud", 16); });
// Hvem er innlogget (navn og rolle fra Workeren) i bunnen av sidemenyen
api<{ navn: string; rolle: string; epost: string }>("GET", "/api/meg").then((m) => {
  settRolle(m.rolle === "support" ? "support" : "eier");
  if (m.rolle !== "support") visEksPille();
  document.dispatchEvent(new CustomEvent("rolle", { detail: m.rolle }));
  const init = esc((m.navn || m.epost).slice(0, 1).toUpperCase());
  const b = q("#bruker"); if (b) b.innerHTML = `<span class="init">${init}</span><span class="navn"><b>${esc(m.navn)}</b>${m.rolle === "eier" ? "Admin" : m.rolle === "support" ? "Support" : esc(m.rolle)}</span>`;
  const p = q("#profil"); if (p) { p.textContent = (m.navn || m.epost).slice(0, 1).toUpperCase(); p.title = m.navn; }
  visMenytall(m.rolle);
}).catch(() => {});

// Tallene i menyen (60-211): åpne saker, oppstarter i gang, «N feil» på Fakturakjøring (fra K-260, når endepunktet finnes), frister innen 14 dager
function settTall(id: string, tekst: string, feil = false) { const el = q(`[data-tall="${id}"]`); if (el) { el.textContent = tekst; el.classList.toggle("feil", feil); } }
function visMenytall(rolle: string) {
  api<{ saker: number; oppstart?: number }>("GET", "/api/meny-tall").then((t) => { settTall("saker", t.saker ? String(t.saker) : "");
    const bj = q("#bjelle-tall"); if (bj) { bj.textContent = t.saker ? String(t.saker) : ""; bj.hidden = !t.saker; } if (t.oppstart !== undefined) settTall("oppstart", t.oppstart ? String(t.oppstart) : ""); }).catch(() => {});
  if (rolle !== "eier") return;
  api<{ feil?: number }>("GET", "/api/oversikt/fakturering").then((k) => { if (k && k.feil) settTall("kjoring", `${k.feil} feil`, true); }).catch(() => { /* kommer med K-260 */ });
}
const fristTall = q("[data-tall='drift-frister']");
if (fristTall?.dataset.datoer !== undefined) {
  const idag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const om14 = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date(Date.now() + 14 * 86_400_000));
  const n = (fristTall.dataset.datoer ?? "").split(",").filter((d) => d && d >= idag && d <= om14).length;
  fristTall.textContent = n ? String(n) : "";
}
// Toast-elementet skjules når det klikkes
q("#toast")?.addEventListener("click", (e) => { if ((e.target as HTMLElement).tagName !== "A") (e.currentTarget as HTMLElement).hidden = true; });
void html;
