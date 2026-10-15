/**
 * «Ny sak» i toppfeltet på Support-sidene (K-259, 60-211 SB1): for saker som kommer på e-post eller telefon. Kunde, butikk og kontakt velges
 * fra /api/saker/valg; saken får svarfrist fra supportnivået og åpnes etterpå.
 */
import { api, esc, q, qa, skjemaDialog } from "../lib/dom";

type Valg = { eiere: { id: string; navn: string; er_kunde: boolean; butikker: { id: string; navn: string }[]; kontakter: { id: string; navn: string; rolle: string | null }[] }[] };
let valg: Valg | null = null;

export async function nySak() {
  try { valg ??= await api<Valg>("GET", "/api/saker/valg"); } catch { valg = { eiere: [] }; }
  const eiere = valg.eiere;
  const innhold = `
    <label class="felt"><span>Emne</span><input name="emne" type="text" maxlength="150" required /></label>
    <div class="felt-rad">
      <label class="felt"><span>Kunde</span><select name="eier_id"><option value="">Velg kunde</option>${eiere.map((e) => `<option value="${esc(e.id)}">${esc(e.navn)}${e.er_kunde ? "" : " (prospekt)"}</option>`).join("")}</select></label>
      <label class="felt"><span>Butikk</span><select name="butikk_id"><option value="">Velg kunde først</option></select></label>
      <label class="felt"><span>Kontakt</span><select name="kontakt_id"><option value="">Velg kunde først</option></select></label>
    </div>
    <div class="felt-rad">
      <label class="felt"><span>Kilde</span><select name="kilde"><option value="epost">E-post</option><option value="telefon">Telefon</option></select></label>
      <label class="felt"><span>Prioritet</span><select name="prioritet"><option value="kritisk">Kritisk</option><option value="hoy">Høy</option><option value="normal" selected>Normal</option><option value="lav">Lav</option></select></label>
    </div>
    <label class="felt"><span>Hva kunden skrev eller sa</span><textarea name="tekst" maxlength="8000" rows="5"></textarea></label>`;
  let nr = "";
  const vent = skjemaDialog({ tittel: "Ny sak", innhold, knapp: "Lagre sak", bred: true, send: async (d) => {
    nr = (await api<{ nr: string }>("POST", "/api/saker", { emne: d.emne, eier_id: d.eier_id || undefined, butikk_id: d.butikk_id || undefined, kontakt_id: d.kontakt_id || undefined, kilde: d.kilde, prioritet: d.prioritet, tekst: d.tekst || undefined })).nr;
  } });
  // Butikk og kontakt følger kunden
  const dlg = [...document.querySelectorAll("dialog")].pop()!;
  q<HTMLSelectElement>("[name=eier_id]", dlg)?.addEventListener("change", (e) => {
    const eier = eiere.find((x) => x.id === (e.target as HTMLSelectElement).value);
    q<HTMLSelectElement>("[name=butikk_id]", dlg)!.innerHTML = `<option value="">${eier ? "Ingen bestemt" : "Velg kunde først"}</option>${(eier?.butikker ?? []).map((b) => `<option value="${esc(b.id)}">${esc(b.navn)}</option>`).join("")}`;
    q<HTMLSelectElement>("[name=kontakt_id]", dlg)!.innerHTML = `<option value="">${eier ? "Ingen bestemt" : "Velg kunde først"}</option>${(eier?.kontakter ?? []).map((k) => `<option value="${esc(k.id)}">${esc(k.navn)}${k.rolle ? `, ${esc(k.rolle)}` : ""}</option>`).join("")}`;
  });
  if (await vent && nr) location.href = `/support/saker/${nr}`;
}

qa<HTMLButtonElement>("[data-ny-sak]").forEach((b) => b.addEventListener("click", () => { void nySak(); }));
document.addEventListener("ny-sak", () => { void nySak(); });
