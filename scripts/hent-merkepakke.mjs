#!/usr/bin/env node
/**
 * K-231: legger inn merkepakke v2 fra Design (hengsel_merke_v2, 14.10.2026) og pinner filene med sha256, som palettpakken (scripts/hent-palettpakke.mjs).
 *
 *   node scripts/hent-merkepakke.mjs [--pakke design/handoff/hengsel_merke_v2]
 *
 * To steg, og begge går inn i pin-fila packages/hengsel-tokens/designsystem.pin.json (blokken `merkepakke`):
 *  1. Designsystemmappa (packages/hengsel-tokens/ds/assets): «Levert av Hengsel» og «Sendt med Hengsel» (SVG i logo/, PNG i logo/png/), favicon med hvit flis (favicon/),
 *     de fire nye ikonene (ikoner/ og ikoner-tillegg.json), motion (motion/, med kilden), delingsbilder (deling/), butikkmaler (butikk/), PWA-ikoner (pwa/)
 *     og app-ikon for Expo og Android (app-ikon/expo, app-ikon/android). Mappene med Icon Composer-pakken (iOS) er lik den i ds fra før og kopieres ikke (sjekkes).
 *     Alle filer i ds får sha256 i `filer`, som før.
 *  2. Utplassering til sidene (UTPLASSERT under): hver fil kopieres byte for byte og får sha256 i `merkepakke.utplassert` sammen med kilden i pakken.
 *     scripts/merkepakke.test.mjs sjekker at hver utplassert fil er uendret og lik kilden.
 * Pakkens egen LES-MEG.md blir liggende i design/handoff som kilde (den er ikke tatt med i ds).
 * Kjøres automatisk etter hent-palettpakke.mjs (som tømmer logo/, ikoner/, favicon/ og app-ikon/) når pin-fila har `merkepakke`.
 * Kjør deretter: npm run build og npm test.
 */
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { TIL_DS, UTPLASSERT } from "./lib/merkepakke.mjs";

const rot = resolve(import.meta.dirname, "..");
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const pakke = resolve(rot, arg("--pakke") ?? "design/handoff/hengsel_merke_v2");
const ds = join(rot, "packages", "hengsel-tokens", "ds");
const PIN = join(rot, "packages", "hengsel-tokens", "designsystem.pin.json");

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const alle = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async (e) => (e.isDirectory() ? alle(join(dir, e.name)) : [join(dir, e.name)])))).flat();
const kopier = async (fra, til) => { await mkdir(dirname(til), { recursive: true }); await cp(fra, til); };

const pin = JSON.parse(await readFile(PIN, "utf8"));
const les = (rel) => readFile(join(pakke, rel));

// Steg 1
for (const [fraMappe, tilMappe, monster] of TIL_DS) {
  const mappe = join(pakke, fraMappe);
  for (const f of (await alle(mappe)).map((x) => relative(mappe, x).split("\\").join("/")).sort()) {
    // mappa 5-logoer-ikoner har undermappa ikoner/, som har en egen rad
    if (fraMappe === "5-logoer-ikoner" && f.includes("/")) continue;
    if (monster.test(f)) await kopier(join(mappe, f), join(ds, "assets", tilMappe, f));
  }
}
// Icon Composer-pakken (iOS) er lik den i ds fra palettpakken
for (const f of await alle(join(pakke, "4-pwa-appikon", "ios", "hengsel_ute.icon"))) {
  const r = relative(join(pakke, "4-pwa-appikon", "ios", "hengsel_ute.icon"), f);
  const eks = await readFile(join(ds, "assets", "app-ikon", "hengsel_ute.icon", r)).catch(() => null);
  if (!eks || sha(eks) !== sha(await readFile(f))) throw new Error(`hengsel_ute.icon/${r} i pakken er ikke lik filen i ds (palettpakken): må avklares med Design`);
}

// Pin: sha256 for hver fil i ds
const filer = {};
for (const f of (await alle(ds)).sort()) filer[relative(ds, f).split("\\").join("/")] = sha(await readFile(f));

// Steg 2
const utplassert = {};
for (const [fra, til] of UTPLASSERT) {
  const data = await les(fra);
  await kopier(join(pakke, fra), join(rot, til));
  utplassert[til] = { fra: `${relative(rot, pakke).split("\\").join("/")}/${fra}`, sha256: sha(data) };
}

const ny = {
  repo: pin.repo, sti: pin.sti, commit: pin.commit, versjon: pin.versjon, palettpakke: pin.palettpakke,
  merkepakke: {
    navn: "hengsel_merke_v2",
    dato: "2026-10-14",
    kilde: relative(rot, pakke).split("\\").join("/"),
    merknad: "assets i ds fra pakken (levert av, sendt med, favicon med flis, fire nye ikoner, motion, deling, butikk, PWA, app-ikon for Expo og Android); utplassert til sidene byte for byte",
    ikkeTattIBruk: ["4-pwa-appikon/ios/hengsel_ute.icon (lik palettpakken)", "LES-MEG.md (blir liggende i pakken)"],
    utplassert: Object.fromEntries(Object.entries(utplassert).sort(([a], [b]) => (a < b ? -1 : 1))),
  },
  filer,
};
await writeFile(PIN, JSON.stringify(ny, null, 2) + "\n");
console.log(`✓ ${Object.keys(filer).length} filer i ds, ${Object.keys(utplassert).length} filer utplassert, pin oppdatert`);
