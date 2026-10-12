#!/usr/bin/env node
/**
 * K-192: kopierer den pinnede Hengsel-designsystem-mappa (packages/hengsel-tokens/ds) til sites/design/public/ds, så design.hengsel.no kan servere
 * nedlastingene (tokens.css, tokens.ts, hengsel.tokens.json, fonts, logoer) på /ds/. Kjøres først i `npm run build -w sites/design` (og dev).
 * Det finnes bare én pin: packages/hengsel-tokens/designsystem.pin.json. sites/design/public/ds er generert og ligger ikke i git.
 */
import { cp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const mal = join(rot, "sites", "design", "public", "ds");
await rm(mal, { recursive: true, force: true });
await cp(join(rot, "packages", "hengsel-tokens", "ds"), mal, { recursive: true });
console.log("✓ packages/hengsel-tokens/ds → sites/design/public/ds");
