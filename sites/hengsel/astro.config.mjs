import { defineConfig, envField } from "astro/config";
import { oppdaterManifest } from "@sngroup/hengsel-tokens/skjermbilder.mjs";

// Statisk side for Cloudflare Workers (statiske filer, se wrangler.jsonc). Ingen server og ingen inline-skript. CSS-en ligger inline, og
// scripts/csp-hasher.mjs legger hashene inn i CSP-en i dist/_headers etter bygging.
// K-233: app-skjermbildene lenkes fra biblioteket på bilder.hengsel.no; bare manifest.json hentes her (oppdaterer kopien i packages/hengsel-tokens når
// biblioteket svarer, ellers brukes kopien, og bygget feiler aldri på det).
await oppdaterManifest();

export default defineConfig({
  site: "https://hengsel.no",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  // Én CSS-fil for hele nettstedet: færre forespørsler som blokkerer visning, og den caches på tvers av sider.
  vite: { build: { assetsInlineLimit: 0, cssCodeSplit: false } },
  // Miljøvariabler som leses ved bygging (fra skallet, Workers Builds → Settings → Build → Variables, eller .env):
  //   LOGIN  adressen til «Logg inn» i menyen. Tom eller ikke satt = lenken vises ikke (app.hengsel.no finnes ikke ennå).
  env: {
    schema: {
      LOGIN: envField.string({ context: "server", access: "public", optional: true, default: "" }),
    },
  },
});
