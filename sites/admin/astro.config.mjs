import { defineConfig } from "astro/config";

// Statisk side for Cloudflare Workers (se wrangler.jsonc). Ingen inline-skript; CSS-en ligger inline og
// scripts/csp-hasher.mjs legger hashene inn i CSP-en i dist/_headers etter bygging. Samme oppsett som sites/hengsel.
export default defineConfig({
  site: "https://admin.hengsel.no",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  vite: { build: { assetsInlineLimit: 0, cssCodeSplit: false } },
});
