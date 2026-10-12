import { defineConfig } from "astro/config";

// design.hengsel.no (K-182): Hengsel-designfasiten. Statisk side for Cloudflare Workers (statiske filer, se wrangler.jsonc), uten server, skript fra tredjepart
// eller informasjonskapsler. Siden genereres fra public/ds/tokens/hengsel.tokens.json (pinnet, se designsystem.pin.json og scripts/hent-designsystem.mjs).
// CSS-en ligger inline; scripts/csp-hasher.mjs legger hashene inn i CSP-en i dist/_headers etter bygging.
export default defineConfig({
  site: "https://design.hengsel.no",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  vite: { build: { assetsInlineLimit: 0, cssCodeSplit: false } },
});
