// Web-app-manifestet bygges fra pinnet hengsel.tokens.json, så fargene ikke står som egne verdier i repoet.
import type { APIRoute } from "astro";
import tokens from "@sngroup/hengsel-tokens/tokens.json";

export const GET: APIRoute = () => {
  const farge = tokens.farge["flate-side"].lys;
  const manifest = {
    name: "Hengsel",
    short_name: "Hengsel",
    display: "browser",
    background_color: farge,
    theme_color: farge,
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2) + "\n", { headers: { "Content-Type": "application/manifest+json" } });
};
