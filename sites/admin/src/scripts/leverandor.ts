/**
 * 26-010 Innstillinger (leverandør), N-4: rad 1 (480) Skjema 1/2 ×2 «Leverandør» (navn, org.nr., adresse, e-post) og «Signatar» (navn, rolle,
 * e-post i Penneo, eksempel-merket), hver med sin «Lagre»; rad 2 (120) Tekst 1/1 «Brukes i». Pillen «Eksempel» i topplinja. Samme API som før
 * (GET/PUT /api/leverandor); begge skjemaene lagrer hele leverandøren.
 */
import { api, html, raw, sett, q, feilbanner, toast, skjemaData, visFeltfeil } from "../lib/dom";
import { rad, flis, settSidepille, laster } from "../lib/kit";

const rot = q("#side")!;
let d: any = null;
function vis() {
  const l = d.leverandor;
  settSidepille(d.eksempel ? "Eksempel" : "", "eksempel");
  const f = (navn: string, label: string, type = "text") => html`<label class="felt"><span>${label}</span><input name="${navn}" type="${type}" value="${l[navn] ?? ""}" maxlength="200" /></label>`;
  sett(rot, html`${rad(480, [
    flis({ id: "leverandor", bredde: "1/2", tittel: "Leverandør", innhold: html`<form class="k-skjema" id="skjema-leverandor" novalidate>${f("navn", "Navn")}${f("orgnr", "Org.nr.")}${f("adresse", "Adresse")}${f("epost", "E-post", "email")}</form>`, handling: raw(`<button class="knapp primar" type="submit" form="skjema-leverandor">Lagre leverandør</button>`) }),
    flis({ id: "signatar", bredde: "1/2", tittel: "Signatar", innhold: html`<form class="k-skjema" id="skjema-signatar" novalidate>${f("signatar", "Signerer for leverandøren")}${f("signatar_rolle", "Rolle")}${f("signatar_epost", "E-post i Penneo (signerer etter kunden)", "email")}<label class="k-avkryss"><input type="checkbox" name="eksempel" value="1" ${raw(d.eksempel ? "checked" : "")} /> Merk som eksempel på tilbud og avtaler</label></form>`, handling: raw(`<button class="knapp primar" type="submit" form="skjema-signatar">Lagre signatar</button>`) }),
  ])}${rad(120, [flis({ id: "brukes-i", tittel: "Brukes i", innhold: raw(`<div class="k-brod"><p>Tilbud og avtaler. Hvem som selger Hengsel, er ikke besluttet; ${d.eksempel ? "selskapet er et eksempel til det er bestemt." : "feltene kopieres inn når tilbud og avtaler lages."}</p></div>`) })])}`);
  for (const id of ["#skjema-leverandor", "#skjema-signatar"]) q<HTMLFormElement>(id)!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const lev = { ...skjemaData(q<HTMLFormElement>("#skjema-leverandor")!), ...skjemaData(q<HTMLFormElement>("#skjema-signatar")!) } as Record<string, string>;
    try { await api("PUT", "/api/leverandor", { ...lev, eksempel: lev.eksempel ? 1 : 0 }); toast(id === "#skjema-signatar" ? "Signataren er lagret" : "Leverandøren er lagret"); last(); }
    catch (err: any) { visFeltfeil(form, err.felt ?? {}); toast(err.message); }
  });
}
async function last() {
  if (!d) sett(rot, rad(480, [flis({ bredde: "1/2", tittel: "Leverandør", innhold: laster() }), flis({ bredde: "1/2", tittel: "Signatar", innhold: laster() })]));
  try { d = await api("GET", "/api/leverandor"); vis(); }
  catch (e) { sett(rot, rad(480, [flis({ tittel: "Leverandør", innhold: raw(feilbanner(e, "Kunne ikke hente leverandøren.")) })])); q("#prov-igjen")?.addEventListener("click", last); }
}
last();
