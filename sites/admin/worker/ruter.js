/**
 * Rutene i Hengsel Admin fase A (60-213 punkt a). Sidene er statiske Astro-filer; de med id i adressen deler én fil som leser id-en fra adressen.
 * stiTilFil(sti) sier hvilken fil Workeren skal hente for en sti. Brukes av worker/index.js og av den lokale serveren i scripts/ (skjermbilder).
 */
export const ULID = "[0-9A-HJKMNP-TV-Z]{26}";
const AVTALE_NR = "A-\\d{4}-\\d{3,}";
const TILBUD_NR = "T-\\d{4}-\\d{3,}";

export const DYNAMISKE = [
  [new RegExp(`^/salg/eiere/${ULID}$`), "/salg/eierkort"],
  [new RegExp(`^/kunder/${ULID}$`), "/kunder/kundekort"],
  [new RegExp(`^/avtaler/${AVTALE_NR}$`), "/avtaler/avtale"],
  [/^\/support\/saker\/H-\d{1,7}$/, "/support/sak"], // K-259 SB2
  [new RegExp(`^/oppstart/${ULID}$`), "/oppstart/kunde"], // K-259 SO1
  [new RegExp(`^/oppstart/ny-kunde/${ULID}$`), "/oppstart/ny-kunde/jobb"], // K-272 Opprett kunde: fremdrift
];

export const TILBUD_PDF = new RegExp(`^/salg/tilbud/(${TILBUD_NR})/(\\d{1,3})\\.pdf$`);

/** Filsti for en sti, eller uendret når den ikke er dynamisk */
export function stiTilFil(sti) {
  for (const [re, fil] of DYNAMISKE) if (re.test(sti)) return fil;
  return sti;
}

/** Id-en i en dynamisk sti (brukes i nettleseren) */
export function idFraSti(sti) {
  const m = /\/([^/]+)$/.exec(sti.replace(/\/$/, ""));
  return m ? decodeURIComponent(m[1]) : "";
}
