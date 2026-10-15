/** SA9 Leverandør: skjema for navn, org.nr., adresse, e-post, signatar (navn, rolle, e-post) og eksempel-merket. */
import { api, html, raw, ikon, sett, q, feilbanner, skjelett, toast, skjemaData, visFeltfeil } from "../lib/dom";

const rot = q("#side")!;
function vis(d: any) {
  const l = d.leverandor;
  const f = (navn: string, label: string, type = "text") => html`<label class="felt"><span>${label}</span><input name="${navn}" type="${type}" value="${l[navn] ?? ""}" maxlength="200" /></label>`;
  sett(rot, html`<header class="sidehode"><div><h1>Leverandør ${d.eksempel ? raw(`<span class="eksempel-merke">Eksempel</span>`) : ""}</h1><p class="under">Innstillinger › Leverandør. Det er ikke besluttet hvilket selskap som selger Hengsel. Feltene fylles inn i tilbud (SA6) og avtaler (SA7), og signataren signerer etter kunden i Penneo.</p></div></header>
    <form class="skjema-kolonne kort" id="skjema" novalidate >
      ${f("navn", "Selskap")}
      <div class="felt-rad">${f("orgnr", "Org.nr.")}${f("epost", "E-post på tilbud", "email")}</div>
      ${f("adresse", "Adresse")}
      <div class="felt-rad">${f("signatar", "Signatar (navn)")}${f("signatar_rolle", "Rolle")}${f("signatar_epost", "Signatarens e-post (Penneo)", "email")}</div>
      <label class="avkryss"><input type="checkbox" name="eksempel" value="1" ${d.eksempel ? "checked" : ""} /> Merk som eksempel på tilbud og avtaler til selskapet er besluttet</label>
      <div class="knapper-rad knapper" ><button class="knapp primar" type="submit">${raw(ikon("hake", 18))}Lagre</button></div>
    </form>`);
  q<HTMLFormElement>("#skjema")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = skjemaData(form) as Record<string, string>;
    try { await api("PUT", "/api/leverandor", { ...data, eksempel: data.eksempel ? 1 : 0 }); toast("Leverandøren er lagret"); last(); }
    catch (err: any) { visFeltfeil(form, err.felt ?? {}); toast(err.message); }
  });
  q("#prov-igjen")?.addEventListener("click", last);
}
async function last() {
  sett(rot, html`<header class="sidehode"><h1>Leverandør</h1></header>${raw(skjelett(1))}`);
  try { vis(await api("GET", "/api/leverandor")); }
  catch (e) { sett(rot, html`<header class="sidehode"><h1>Leverandør</h1></header>${raw(feilbanner(e, "Kunne ikke hente leverandøren."))}`); q("#prov-igjen")?.addEventListener("click", last); }
}
last();
