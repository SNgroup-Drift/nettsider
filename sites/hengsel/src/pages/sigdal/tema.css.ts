/**
 * /sigdal/tema.css (K-223): Sigdal-temaet som egen CSS-fil, lastet bare av sidene under /sigdal (Hode.astro, kunde-prop).
 * Astro legger all CSS inline på hver side, så temaet kan ikke ligge i en vanlig CSS-import: da ville Sigdals farger stå på Hengsel-sidene.
 * Filen er @font-face for Newsreader og Inter (selvhostet fra npm) pluss packages/kundetema-sigdal/tokens.css.
 */
import type { APIRoute } from "astro";
import tokens from "@sngroup/kundetema-sigdal/tokens.css?raw";
import { fontFaceCss } from "@sngroup/kundetema-sigdal/fonter.mjs";

export const GET: APIRoute = () => new Response(fontFaceCss() + "\n" + tokens, { headers: { "Content-Type": "text/css; charset=utf-8" } });
