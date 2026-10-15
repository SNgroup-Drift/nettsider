/**
 * Innstillinger › Support og roller (K-259): svarfrist per prioritet og arbeidstid (supportnivå), timepris for support, føres i (minutter),
 * svarmaler ({fornavn}, {svarfrist}, {lenke}), lenke til brukerveiledningen, adressene «Hjelp» kan komme fra, og supportpersonene
 * (rollen support). Verdier som ikke er besluttet er merket «Eksempel» til haken fjernes. Bare rollen eier.
 */
import { api, ApiFeil, html, raw, q, qa, sett, skjelett, tilstand, feilbanner, ikon, esc, toast, kr, visFeltfeil, skjemaData } from "../lib/dom";

const rot = q("#side")!;
const PRIO = [["kritisk", "Kritisk"], ["hoy", "Høy"], ["normal", "Normal"], ["lav", "Lav"]];
const DAGER = [[1, "Man"], [2, "Tir"], [3, "Ons"], [4, "Tor"], [5, "Fre"], [6, "Lør"], [7, "Søn"]];
const hode = () => html`<header class="sidehode"><div><h1>Support og roller</h1><p class="under">Supportnivå, timepris og svarmaler. Endringene gjelder nye saker og nye føringer.</p></div></header>`;

function vis(d: any, brukere: any[]) {
  const n = d.supportniva;
  sett(rot, html`${hode()}
    <form class="kort skjema-kolonne" id="skjema" novalidate>
      <h2>Supportnivå ${d.supportniva_eksempel || d.timepris_eksempel ? raw(`<span class="eksempel-merke">Eksempel</span>`) : ""}</h2>
      <div class="tabellramme"><table class="tabell"><thead><tr><th>Prioritet</th><th>Svarfrist</th><th>Minutter (eller)</th><th>Virkedager</th></tr></thead><tbody>
        ${PRIO.map(([k, navn]) => html`<tr><td>${navn}</td><td><input class="inntast" name="tekst_${k}" value="${n.frister[k]?.tekst ?? ""}" maxlength="40" /></td><td><input class="tallfelt" name="min_${k}" type="number" min="1" value="${n.frister[k]?.min ?? ""}" /></td><td><input class="tallfelt" name="dager_${k}" type="number" min="1" value="${n.frister[k]?.virkedager ?? ""}" /></td></tr>`)}
      </tbody></table></div>
      <div class="felt-rad"><label class="felt"><span>Arbeidstid fra</span><input name="fra" type="time" value="${n.arbeidstid.fra}" /></label><label class="felt"><span>Til</span><input name="til" type="time" value="${n.arbeidstid.til}" /></label></div>
      <fieldset class="dager"><legend class="meta">Arbeidsdager</legend>${DAGER.map(([v, t]) => html`<label class="avkryss"><input type="checkbox" name="dag" value="${v}" ${raw(n.arbeidstid.dager.includes(v) ? "checked" : "")} />${t}</label>`)}</fieldset>
      <p class="meta">Svarfristen regnes i arbeidstid og står stille mens saken venter på kunden. Helligdager er ikke med.</p>
      <div class="felt-rad"><label class="felt"><span>Timepris for support (kr uten mva)</span><input name="timepris" type="number" min="0" step="1" value="${Math.round(d.timepris_ore / 100)}" /></label><label class="felt"><span>Føres i (minutter)</span><input name="foring" type="number" min="1" max="60" value="${d.foring_min}" /></label></div>
      <label class="felt"><span>Lenke til brukerveiledningen</span><input name="lenke" type="url" value="${d.brukerveiledning_url}" placeholder="https://" /></label>
      <h2>Svarmaler</h2><p class="meta">{fornavn}, {svarfrist} og {lenke} fylles inn i saken.</p>
      <div id="maler">${d.svarmaler.map((m: any, i: number) => mal(m, i))}</div>
      <button class="knapp venstre" type="button" id="ny-mal">${raw(ikon("pluss", 18))}Ny svarmal</button>
      <h2>«Hjelp» fra Hengsel CRM og Ute</h2>
      <label class="felt"><span>Adresser som kan sende «Hjelp» (én per linje, *. for alle underdomener)</span><textarea name="origins" rows="3">${d.hjelp_origins.join("\n")}</textarea></label>
      <label class="avkryss"><input type="checkbox" name="eksempel" ${raw(d.supportniva_eksempel ? "checked" : "")} />Merk verdiene som eksempel (ikke besluttet)</label>
      <div class="knapper-rad"><button class="knapp primar" type="submit">Lagre</button></div>
    </form>
    <section class="kort" aria-labelledby="h-brukere"><h2 id="h-brukere">Brukere og roller</h2>
      <div class="tabellramme"><table class="tabell"><thead><tr><th>Navn</th><th>E-post</th><th>Rolle</th><th>Tilgang</th><th></th></tr></thead><tbody>
        ${brukere.map((b) => html`<tr><td>${b.navn}</td><td class="dempet">${b.epost}</td><td>${b.rolle === "eier" ? "Eier" : "Support"}</td><td class="dempet">${b.rolle === "eier" ? "Alt" : "Saker og timer, uten beløp"}</td>
          <td>${b.rolle === "support" ? html`<button class="knapp liten" type="button" data-aktiv="${b.id}" data-verdi="${b.aktiv ? 0 : 1}">${b.aktiv ? "Steng" : "Åpne"}</button>` : ""}</td></tr>`)}
      </tbody></table></div>
      <form class="felt-rad mt-12" id="ny-bruker" novalidate><label class="felt"><span>Navn</span><input name="navn" maxlength="120" /></label><label class="felt"><span>E-post</span><input name="epost" type="email" maxlength="254" /></label><button class="knapp" type="submit">Legg til supportperson</button></form>
      <p class="meta mt-8">Personen må også slippes inn av Cloudflare Access. Rollen eier står i koden (worker/tilgang.js) og gis ikke herfra.</p>
    </section>`);
  koble(d);
}
const mal = (m: any, i: number) => html`<div class="mal" data-i="${i}"><label class="felt"><span>Navn</span><input name="malnavn" value="${m.navn}" maxlength="60" /></label><label class="felt"><span>Tekst</span><textarea name="maltekst" rows="2" maxlength="2000">${m.tekst}</textarea></label><button class="knapp tekst liten venstre" type="button" data-fjern-mal>Fjern</button></div>`;

function koble(d: any) {
  const form = q<HTMLFormElement>("#skjema", rot)!;
  q("#ny-mal", rot)?.addEventListener("click", () => { q("#maler", rot)!.insertAdjacentHTML("beforeend", String(mal({ navn: "", tekst: "" }, Date.now()))); kobleMaler(); });
  kobleMaler();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const x = skjemaData(form) as Record<string, string>;
    const frister: any = {};
    for (const [k] of PRIO) frister[k] = x[`min_${k}`] ? { min: Number(x[`min_${k}`]), tekst: x[`tekst_${k}`] } : { virkedager: Number(x[`dager_${k}`]), tekst: x[`tekst_${k}`] };
    const dager = qa<HTMLInputElement>("[name=dag]:checked", form).map((i) => Number(i.value));
    const svarmaler = qa(".mal", form).map((m) => ({ navn: q<HTMLInputElement>("[name=malnavn]", m)!.value.trim(), tekst: q<HTMLTextAreaElement>("[name=maltekst]", m)!.value.trim() })).filter((m) => m.navn || m.tekst);
    try {
      await api("PATCH", "/api/support/innstillinger", { supportniva: { frister, arbeidstid: { fra: x.fra, til: x.til, dager } }, timepris_ore: Math.round(Number(x.timepris) * 100), foring_min: Number(x.foring), svarmaler, brukerveiledning_url: x.lenke, hjelp_origins: x.origins.split(/\s+/).filter(Boolean), eksempel: q<HTMLInputElement>("[name=eksempel]", form)!.checked ? 1 : 0 });
      toast("Innstillingene er lagret"); last();
    } catch (err) { const f = err instanceof ApiFeil ? err : new ApiFeil(0, "ADM-504", "Kunne ikke lagre."); visFeltfeil(form, f.felt); toast(`${f.message}${Object.values(f.felt)[0] ? ` ${Object.values(f.felt)[0]}` : ""}`); }
  });
  q<HTMLFormElement>("#ny-bruker", rot)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    try { await api("POST", "/api/brukere", skjemaData(f)); toast("Supportpersonen er lagt til"); last(); } catch (err) { const x = err instanceof ApiFeil ? err : new ApiFeil(0, "ADM-504", "Kunne ikke lagre."); visFeltfeil(f, x.felt); toast(x.message); }
  });
  qa<HTMLButtonElement>("[data-aktiv]", rot).forEach((b) => b.addEventListener("click", async () => { try { await api("PATCH", `/api/brukere/${b.dataset.aktiv}`, { aktiv: Number(b.dataset.verdi) }); last(); } catch (err) { toast(err instanceof ApiFeil ? err.message : "Kunne ikke lagre"); } }));
  void d; void kr; void esc;
}
function kobleMaler() { qa<HTMLButtonElement>("[data-fjern-mal]", rot).forEach((b) => { b.onclick = () => b.closest(".mal")?.remove(); }); }

async function last() {
  sett(rot, html`${hode()}${raw(skjelett(2, "kortet"))}`);
  if (tilstand() === "tom") return;
  try { const [d, b] = await Promise.all([api("GET", "/api/support/innstillinger"), api("GET", "/api/brukere")]); vis(d, b.brukere); }
  catch (e) { sett(rot, html`${hode()}${raw(feilbanner(e, "Kunne ikke hente innstillingene."))}`); q("#prov-igjen", rot)?.addEventListener("click", last); }
}
last();
