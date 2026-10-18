#!/usr/bin/env node
/**
 * K-192: kopierer den pinnede Hengsel-designsystem-mappa (packages/hengsel-tokens/ds) til sites/design/public/ds, så design.hengsel.no kan servere
 * nedlastingene (tokens.css, tokens.ts, hengsel.tokens.json, fonts, logoer) på /ds/. Kjøres først i `npm run build -w sites/design` (og dev).
 * Det finnes bare én pin: packages/hengsel-tokens/designsystem.pin.json. sites/design/public/ds er generert og ligger ikke i git.
 * N-7b: dokumentmalene kopieres uten README, uten mal.html (flettefelt, ikke en side) og uten side-N.png (pakkens forhåndsvisninger er tatt i kundetemaet; siden viser egne i Hengsel standard,
 * scripts/lag-dokumentmal-bilder.mjs), og eksempel.html gjøres CSP-trygg av scripts/lag-dokumentmaler.mjs som kjøres rett etter denne.
 */
import { cp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const mal = join(rot, "sites", "design", "public", "ds");
await rm(mal, { recursive: true, force: true });
const ikkeMed = (f) => /[\\/]dokumentmaler[\\/]/.test(f) && (/[\\/]side-\d+\.png$/.test(f) || /\.md$/.test(f) || /[\\/]mal\.html$/.test(f));
await cp(join(rot, "packages", "hengsel-tokens", "ds"), mal, { recursive: true, filter: (f) => !ikkeMed(f) });
console.log("✓ packages/hengsel-tokens/ds → sites/design/public/ds");
