#!/usr/bin/env node
/**
 * K-212 runde 2: legger inn palettpakke v2 fra Design (design_handoff_hengsel_furu_v2, 14.10.2026) i den pinnede designsystemmappa (packages/hengsel-tokens/ds)
 * og oppdaterer pin-fila med sha256 for hver fil. Pakken ligger i design/handoff/ og blir liggende som kilde.
 *
 *   node scripts/hent-palettpakke.mjs [--pakke design/handoff/design_handoff_hengsel_furu_v2]
 *
 * Fargene (hengsel.tokens.json) er allerede furu og lik pakkens besluttede grunnpalett (lys, mørk, økt kontrast og P3; 328 verdier sjekket), så tokens-filene i ds er uendret.
 * Det som byttes er assets: logoer og merker (designsystem/logo), ikonsettet (ikoner/), favicon og app-ikon. De gamle logofilene (åtte former, 32 filer, noen med brevann-
 * og pre-furu-farger) fjernes: pakken er den nye fasiten.
 * Ikke med (FORESLÅTT i pakkens README, venter på Eirik): monokrome produktlogoer og -merker (hvit og blekk for CRM, Ute, Admin og Levering). De tas ikke i bruk.
 * Plattformlag, K-206-roller, mørke foreslåtte verdier og skrivebord-laget er heller ikke med.
 * Kjør deretter: node scripts/lag-hengsel-tokens.mjs (ingen endring ventet) og npm run build.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const pakke = resolve(rot, arg("--pakke") ?? "design/handoff/design_handoff_hengsel_furu_v2");
const ds = join(rot, "packages", "hengsel-tokens", "ds");
const PIN = join(rot, "packages", "hengsel-tokens", "designsystem.pin.json");

/** Foreslått, ikke besluttet (README «Foreslått», punkt 18): monokrome produktlogoer og -merker. */
const FORESLATT = /^(logo|merke)-(crm|ute|admin|levering)-(hvit|blekk)\.svg$/;

const alle = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async (e) => (e.isDirectory() ? alle(join(dir, e.name)) : [join(dir, e.name)])))).flat();
const utelatt = [];

// Logoer og merker
await rm(join(ds, "assets", "logo"), { recursive: true, force: true });
await mkdir(join(ds, "assets", "logo"), { recursive: true });
for (const f of (await readdir(join(pakke, "designsystem", "logo"))).filter((x) => x.endsWith(".svg"))) {
  if (FORESLATT.test(f)) { utelatt.push(`assets/logo/${f}`); continue; }
  await cp(join(pakke, "designsystem", "logo", f), join(ds, "assets", "logo", f));
}
// Ikonsettet (49 SVG-er med currentColor i 16, 20 og 24 px, navn og SF Symbol i ikoner.json, sprite og tabell)
await rm(join(ds, "assets", "ikoner"), { recursive: true, force: true });
await mkdir(join(ds, "assets", "ikoner"), { recursive: true });
for (const m of ["16", "20", "24"]) await cp(join(pakke, "ikoner", m), join(ds, "assets", "ikoner", m), { recursive: true });
for (const f of ["ikoner.json", "hengsel-ikoner.svg", "IKONER.md"]) await cp(join(pakke, "ikoner", f), join(ds, "assets", "ikoner", f));
// Favicon og app-ikon (Icon Composer-pakke)
await rm(join(ds, "assets", "favicon"), { recursive: true, force: true });
await cp(join(pakke, "designsystem", "favicon"), join(ds, "assets", "favicon"), { recursive: true });
await rm(join(ds, "assets", "app-ikon"), { recursive: true, force: true });
await cp(join(pakke, "designsystem", "app-ikon"), join(ds, "assets", "app-ikon"), { recursive: true });

// Pin: sha256 for hver fil i ds. Commit og tokens-filene står som før (fargene er identiske med pakkens besluttede palett).
const pin = JSON.parse(await readFile(PIN, "utf8"));
const filer = {};
for (const f of (await alle(ds)).sort()) filer[relative(ds, f)] = createHash("sha256").update(await readFile(f)).digest("hex");
const ny = {
  repo: pin.repo, sti: pin.sti, commit: pin.commit, versjon: pin.versjon,
  palettpakke: { navn: "design_handoff_hengsel_furu_v2", dato: "2026-10-14", kilde: relative(rot, pakke), merknad: "assets (logo, ikoner, favicon, app-ikon) fra pakken; tokens uendret fordi hengsel.tokens.json allerede er lik pakkens besluttede palett", ikkeTattIBruk: utelatt },
  ...(pin.merkepakke ? { merkepakke: pin.merkepakke } : {}),
  filer,
};
await writeFile(PIN, JSON.stringify(ny, null, 2) + "\n");
const n = Object.keys(filer).length;
console.log(`✓ ${n} filer i ds, pin oppdatert (${utelatt.length} foreslåtte monokrome logoer ikke tatt med)`);
await stat(join(ds, "tokens", "hengsel.tokens.json"));
// K-231: merkepakke v2 ligger oppå palettpakken (levert av, sendt med, favicon med flis, nye ikoner, motion, deling, butikk, PWA). Tømmingen over tok dem med seg, så de legges inn igjen.
if (pin.merkepakke) {
  console.log(`→ legger merkepakken ${pin.merkepakke.navn} inn igjen (${pin.merkepakke.kilde})`);
  execFileSync(process.execPath, [join(rot, "scripts", "hent-merkepakke.mjs"), "--pakke", join(rot, pin.merkepakke.kilde)], { stdio: "inherit" });
}
