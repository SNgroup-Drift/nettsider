import { defineConfig } from "astro/config";
import { oppdaterManifest } from "@sngroup/hengsel-tokens/skjermbilder.mjs";

// design.hengsel.no (K-182): Hengsel-designfasiten. Statisk side for Cloudflare Workers (statiske filer, se wrangler.jsonc), uten server, skript fra tredjepart
// eller informasjonskapsler. Siden genereres fra packages/hengsel-tokens/ds/tokens/hengsel.tokens.json (pinnet, se packages/hengsel-tokens/designsystem.pin.json og scripts/hent-designsystem.mjs). public/ds kopieres dit ved bygging (scripts/kopier-ds.mjs).
// CSS-en ligger inline; scripts/csp-hasher.mjs legger hashene inn i CSP-en i dist/_headers etter bygging.
// K-233: app-skjermbildene lenkes fra biblioteket på bilder.hengsel.no; bare manifest.json hentes her (oppdaterer kopien i packages/hengsel-tokens når
// biblioteket svarer, ellers brukes kopien, og bygget feiler aldri på det).
await oppdaterManifest();

export default defineConfig({
  site: "https://design.hengsel.no",
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  vite: { build: { assetsInlineLimit: 0, cssCodeSplit: false } },
});
