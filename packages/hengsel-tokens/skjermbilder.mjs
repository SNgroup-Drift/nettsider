/**
 * K-233: skjermbildebiblioteket på bilder.hengsel.no (laget av K-228 i hengsel-crm: skjermbildene tas automatisk fra demoen i Hengsel- og
 * Sigdal-tema og legges på R2 med manifest.json).
 *
 * Alle app-skjermbilder på Hengsel-sidene (hengsel.no, /kunde/sigdal, vis og Sigdal-utgaven, design) lenkes fra
 * `${BILDEDOMENE}/<tema>/<sti>`; ingenting lastes ned ved bygging. Bare manifest.json leses (sha256, bytes og mål per fil), og bygget feiler
 * ikke om biblioteket er nede: da brukes sist kjente kopi i repoet (skjermbilder-manifest.json), som oppdaterManifest() skriver over når
 * biblioteket svarer. Bilder som ikke står i manifestet, vises som plassholderen «Skjermbilde kommer» med data-skjermbilde="<nøkkel>";
 * scripts/skjermbilder-bibliotek.test.mjs godtar bare nøklene i KJENTE_MANGLER.
 *
 * Stiene i biblioteket (samme som sites/hengsel/public/kunde/sigdal/img hadde i K-223): app/<navn>-lys.webp (iOS), apptest/<navn>-lys[@1x].webp,
 * hjelp/<id>[@1x].webp, dok-forside.webp, vis/skjermbilder/<navn>[-mork][@1x].webp og vis/<rom|flate|forsta|hero>*.webp. Ingen hemmeligheter her.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
// Kopien importeres som JSON (ikke lest fra disk): i Astro-byggene bunter Vite den inn, og import.meta.url peker ikke på denne mappa der.
import kopi from "./skjermbilder-manifest.json" with { type: "json" };

export const BILDEDOMENE = "https://bilder.hengsel.no/skjermbilder/v1";
export const TEMAER = ["hengsel", "sigdal"];
export const PLASSHOLDER = "Skjermbilde kommer";
export const MANIFEST_FIL = fileURLToPath(new URL("./skjermbilder-manifest.json", import.meta.url));

/** Adressen til et bilde i biblioteket: bildeUrl("hengsel", "app/idag-lys.webp") */
export const bildeUrl = (tema, sti) => `${BILDEDOMENE}/${tema}/${sti}`;

/** Nøkkelen i KJENTE_MANGLER og data-skjermbilde: «app/idag-lys.webp» → «app/idag», «vis/skjermbilder/ute-ks-mork@1x.webp» → «vis/skjermbilder/ute-ks» */
export const skjermbildeNokkel = (sti) => sti.replace(/(?:-lys|-mork)?(?:@1x)?\.webp$/, "");

let lest;
/** Sist kjente manifest (kopien i repoet, eller det oppdaterManifest() hentet). { versjon, laget, antall, filer: { "<tema>/<sti>": { sha256, bytes, bredde, hoyde } } } */
export function lesManifest() {
  if (!lest) lest = sjekkManifest(kopi);
  return lest;
}

function sjekkManifest(m) {
  if (!m || typeof m !== "object" || m.versjon !== 1 || !m.filer || typeof m.filer !== "object") throw new Error("manifest.json har ikke formen { versjon: 1, filer: {…} }");
  for (const [sti, f] of Object.entries(m.filer)) {
    if (!/^[a-z]+\/[\w@./-]+\.webp$/.test(sti) || !Number.isInteger(f?.bredde) || !Number.isInteger(f?.hoyde)) throw new Error(`manifest.json: ${sti} mangler mål`);
  }
  return m;
}

/** Finnes bildet i biblioteket (etter manifestet)? */
export const finnes = (tema, sti, manifest = lesManifest()) => Object.hasOwn(manifest.filer, `${tema}/${sti}`);

/**
 * Bildet slik siden skal lenke det, eller null når det ikke står i manifestet (plassholder).
 * hd: sti er 2×-fila; når @1x-utgaven finnes, kommer den som x1 og i srcset (1x, 2x).
 * @returns {{ url: string, bredde: number, hoyde: number, nokkel: string, srcset?: string, x1?: { url: string, bredde: number, hoyde: number } } | null}
 */
export function skjermbilde(tema, sti, { hd = false, manifest = lesManifest() } = {}) {
  const f = manifest.filer[`${tema}/${sti}`];
  if (!f) return null;
  const ut = { url: bildeUrl(tema, sti), bredde: f.bredde, hoyde: f.hoyde, nokkel: skjermbildeNokkel(sti) };
  if (hd) {
    const sti1 = sti.replace(/\.webp$/, "@1x.webp");
    const f1 = manifest.filer[`${tema}/${sti1}`];
    if (f1) {
      ut.x1 = { url: bildeUrl(tema, sti1), bredde: f1.bredde, hoyde: f1.hoyde };
      ut.srcset = `${ut.x1.url} 1x, ${ut.url} 2x`;
    }
  }
  return ut;
}

/** HTML for plassholderen (samme markup overalt, så testen kjenner den igjen): <figure data-skjermbilde="<nøkkel>">…</figure> */
export function plassholderHtml(sti, navn = "", klasse = "plassholder") {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<figure class="${klasse}" data-skjermbilde="${esc(skjermbildeNokkel(sti))}" role="img" aria-label="${esc(PLASSHOLDER)}${navn ? `: ${esc(navn)}` : ""}"><b>${PLASSHOLDER}</b>${navn ? `<span>${esc(navn)}</span>` : ""}</figure>`;
}

/**
 * Henter manifest.json fra biblioteket og skriver det over kopien i repoet når det svarer 200 med gyldig innhold. Feiler aldri: er biblioteket
 * nede (eller nås ikke, som fra Code-økta), brukes kopien. Kjøres fra byggene (astro.config.mjs i hengsel og design, bygg.mjs i vis) i vanlig Node,
 * der import.meta.url peker på denne mappa (MANIFEST_FIL); Astro-sidene leser det oppdaterte manifestet fordi Vite bunter JSON-fila etterpå.
 */
export async function oppdaterManifest({ tidsfrist = 5000, logg = console } = {}) {
  const url = `${BILDEDOMENE}/manifest.json`;
  try {
    const svar = await fetch(url, { signal: AbortSignal.timeout(tidsfrist), headers: { accept: "application/json" } });
    if (!svar.ok) throw new Error(`svarte ${svar.status}`);
    const tekst = await svar.text();
    const nytt = sjekkManifest(JSON.parse(tekst));
    const gammelt = readFileSync(MANIFEST_FIL, "utf8");
    if (gammelt.trim() !== tekst.trim()) {
      writeFileSync(MANIFEST_FIL, tekst.endsWith("\n") ? tekst : `${tekst}\n`);
      logg.log(`✓ skjermbilder: manifest.json hentet fra biblioteket (${Object.keys(nytt.filer).length} filer, laget ${nytt.laget}); kopien i repoet er oppdatert`);
    } else logg.log(`✓ skjermbilder: manifest.json er uendret (${Object.keys(nytt.filer).length} filer)`);
    lest = nytt;
    return nytt;
  } catch (e) {
    const kopi = lesManifest();
    logg.log(`· skjermbilder: ${url} nås ikke (${e?.message ?? e}); bruker kopien i repoet (${Object.keys(kopi.filer).length} filer, laget ${kopi.laget})`);
    return kopi;
  }
}
