/**
 * K-223: gjør HTML fra en Hengsel-side (hengsel.no eller Visningsrommet) om til kundens utgave. Brukes av sites/hengsel/src/kunde.ts (Side.astro, ved
 * bygging av sidene under /kunde/sigdal) og scripts/bygg-sigdal-vis.mjs (Visningsrommet i Sigdal-utgave). Profilen er profil.json.
 *  - lenker til sidene i utgaven får kunderoten, demo og priser blir e-post, personvern peker til hengsel.no, innloggingen til Visningsrommet til kundens vis
 *  - app-skjermbilder fra biblioteket (bilder.hengsel.no, K-233) hentes i kundens tema: …/v1/hengsel/<sti> → …/v1/sigdal/<sti> (biblioteket har samme stier
 *    i begge temaer). Komponentene velger temaet selv under /kunde/sigdal (Skjermbilde.astro, A4Side.astro, bygg.mjs med VIS_TEMA); dette er sikkerhetsnettet.
 *  - Hengsel-logoene (SVG med Hengsel-farger) byttes mot tekstmerke, så ingen Hengsel-farger står på kundens sider
 *  - tekstene i profilen (tekst: [fra, til])
 */
import { BILDEDOMENE } from "@sngroup/hengsel-tokens/skjermbilder.mjs";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const LOGO_TEKST = [
  [/hengsel-crm-aksent-lys\.svg$|logo-crm-/, (p) => p.produkt],
  [/hengsel-ute-aksent-lys\.svg$/, () => "Hengsel Ute"],
  [/levert-av-hengsel-lys\.svg$/, () => "levert av Hengsel"],
  [/hengsel-(?:aksent-)?lys\.svg$/, () => "levert av Hengsel"],
];

/**
 * opsjoner.rot: adressen «/» skal bli til (standard kunderoten; Visningsrommet bruker p.vis).
 * opsjoner.kunTekstOgLogo: bare logoene og tekstene (Visningsrommet har egne stier: /crm/ er et rom der, ikke Hengsels /crm).
 */
export function tilKunde(html, p, { rot = p.sti, kunTekstOgLogo = false } = {}) {
  let ut = html;
  // Hengsel-logoene som <img> → tekstmerke (class og alt tas med)
  ut = ut.replace(/<img\b[^>]*\bsrc="(?:\/assets)?\/logo\/((?:levert-av-)?hengsel-[a-z-]*lys\.svg)"[^>]*>/g, (tag, fil) => {
    const alt = /\balt="([^"]*)"/.exec(tag)?.[1] ?? "";
    const klasse = /\bclass="([^"]*)"/.exec(tag)?.[1] ?? "";
    const tekst = LOGO_TEKST.find(([re]) => re.test(fil))?.[1](p) ?? p.produkt;
    return `<span class="${klasse} kl-ord" role="img" aria-label="${alt || tekst}">${tekst}</span>`;
  });
  if (kunTekstOgLogo) {
    for (const [fra, til] of p.tekst) ut = ut.split(fra).join(til);
    return ut;
  }
  for (const side of p.sider) {
    if (side === "/") continue;
    ut = ut.replace(new RegExp(`href="${esc(side)}(?=["#?])`, "g"), `href="${p.sti}${side}`);
  }
  ut = ut.replace(/href="\/"/g, `href="${rot}"`);
  ut = ut.replace(/href="\/priser-og-demo(?:#[a-z-]*)?"/g, `href="mailto:hei@hengsel.no?subject=${encodeURIComponent(p.produkt)}"`);
  ut = ut.replace(/href="\/personvern"/g, 'href="https://hengsel.no/personvern"');
  ut = ut.replace(/href="https:\/\/hengsel\.no\/apptest"/g, `href="${p.sti}/apptest"`);
  ut = ut.replace(/href="https:\/\/vis\.hengsel\.no"/g, `href="${p.vis}"`);
  ut = ut.replace(new RegExp(`${esc(BILDEDOMENE)}/hengsel/`, "g"), `${BILDEDOMENE}/${p.kunde}/`);
  ut = ut.replace(/href="\/apptest\/Logg_inn_i_demoen\.pdf"/g, `href="${p.sti}/apptest/Logg_inn_i_demoen.pdf"`);
  for (const [fra, til] of p.tekst) ut = ut.split(fra).join(til);
  return ut;
}
