/**
 * K-223: gjør HTML fra en Hengsel-side (hengsel.no eller Visningsrommet) om til kundens utgave. Brukes av sites/hengsel/src/kunde.ts (Side.astro, ved
 * bygging av sidene under /kunde/sigdal) og scripts/bygg-sigdal-vis.mjs (Visningsrommet i Sigdal-utgave). Profilen er profil.json.
 *  - lenker til sidene i utgaven får kunderoten, demo og priser blir e-post, personvern peker til hengsel.no, innloggingen til Visningsrommet til kundens vis
 *  - skjermbilder på Hengsel-sidene (/img/app, /img/apptest, /img/dok-forside) hentes fra kundens plassholdermappe (<rot>/img/…)
 *  - Hengsel-logoene (SVG med Hengsel-farger) byttes mot tekstmerke, så ingen Hengsel-farger står på kundens sider
 *  - tekstene i profilen (tekst: [fra, til])
 */
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
  ut = ut.replace(/(src|srcset|poster)="\/img\/(app|apptest)\//g, `$1="${p.sti}/img/$2/`);
  ut = ut.replace(/(src|srcset)="\/img\/dok-forside\.webp"/g, `$1="${p.sti}/img/dok-forside.webp"`);
  ut = ut.replace(/(\d+x), \/img\/(app|apptest)\//g, `$1, ${p.sti}/img/$2/`);
  ut = ut.replace(/href="\/apptest\/Logg_inn_i_demoen\.pdf"/g, `href="${p.sti}/apptest/Logg_inn_i_demoen.pdf"`);
  for (const [fra, til] of p.tekst) ut = ut.split(fra).join(til);
  return ut;
}
