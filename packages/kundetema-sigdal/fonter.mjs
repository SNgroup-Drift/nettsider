// Skriftfilene til Sigdal-temaet (selvhostet fra npm, @fontsource-variable): Newsreader til overskrifter, Inter til alt annet.
// Importeres med ?url av sites/hengsel/src/pages/sigdal/tema.css.ts, som lager @font-face i /sigdal/tema.css. Bare latin (æ, ø og å ligger der).
import newsreader from "@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url";
import inter from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";

export const FONTER = { newsreader, inter };

export function fontFaceCss(urler = FONTER) {
  return `@font-face { font-family: 'Newsreader Variable'; font-style: normal; font-display: swap; font-weight: 200 800; src: url(${urler.newsreader}) format('woff2-variations'); }
@font-face { font-family: 'Inter Variable'; font-style: normal; font-display: swap; font-weight: 100 900; src: url(${urler.inter}) format('woff2-variations'); }
`;
}
