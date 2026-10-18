#!/usr/bin/env node
/**
 * K-182/K-192: henter Hengsel-designsystemet (SNgroup-Drift/hengsel-crm, før innlandet-crm-sync; _ds/hengsel-designsystem) inn i packages/hengsel-tokens/ds
 * fra en PINNET commit, så bygget er reproduserbart og Workers Builds ikke trenger tilgang til det private repoet.
 *
 *   node scripts/hent-designsystem.mjs --kilde /sti/til/hengsel-crm [--commit <sha>]
 *
 * Uten --commit brukes commiten som står i packages/hengsel-tokens/designsystem.pin.json (verifiserer at filene er uendret).
 * Med --commit pinnes en ny commit: filene leses med `git show <sha>:<sti>` (ikke fra arbeidsmappa), kopieres, og pin-fila skrives på nytt
 * med sha256 for hver fil. tokens/hengsel.tokens.json er ENESTE kilde; tokens.css, tokens.ts og fonts.css er generert av designsystemet.
 * Palettpakke v2 (K-212) og merkepakke v2 (K-231) i design/handoff legges inn igjen etterpå (blokkene palettpakke og merkepakke i pin-fila).
 * Det finnes ÉN pin, og den gjelder alle Hengsel-sidene (hengsel.no, vis., design., admin.). Etter henting genereres den delte token-fila (packages/hengsel-tokens/tokens.css og fonts.css)
 * med scripts/lag-hengsel-tokens.mjs. Testene scripts/design-fasit.test.mjs og scripts/hengsel-regler.test.mjs feiler hvis en fil ikke samsvarer med pin-fila,
 * eller hvis den delte fila avviker fra hengsel.tokens.json.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const MAL = join(rot, "packages", "hengsel-tokens", "ds");
const PIN = join(rot, "packages", "hengsel-tokens", "designsystem.pin.json");
const DS = "_ds/hengsel-designsystem";

// N-1: Hengsel-sidene henter bare Hengsel-delen av designsystemet. Kundetemaet (Sigdal: sigdal.tokens.json, kundetema-sigdal.css, assets/logo/kunde,
// assets/fonts/kundetema-sigdal og TWK Lausanne) og alt i tokens/ som er kundetema, plattform eller layout (hengsel-palett.*, grunn.css, layout.css,
// ios.css) hører ikke hjemme her, og heller ikke components/, ui_kits/, plattform/, templates/, dokumentasjon/ og guidelines/.
// Lista er hele "hva hentes": ny fil i designsystemet kommer ikke med før den står her.
const HENTES = [
  "tokens/hengsel.tokens.json", "tokens/tokens.css", "tokens/fonts.css", "tokens/plattform.css", "tokens/tokens.ts",
  "tokens/layout.css", // N-7b: bare Teller-blokka (--teller-*, --flate-meny) brukes, av scripts/lag-hengsel-tokens.mjs; resten av layout.css er ikke Hengsel-sidenes
  "tokens/fonts-fri-liste.css", // unntak fra N-1-lista: OFL-skriftene design.hengsel.no viser på /skrift og /last-ned; ingen Sigdal eller TWK
  "assets/logo", "assets/fonts", "assets/favicon", "assets/ikoner",
  "dokumentmaler", // N-7b: de 28 dokumentmalene (mal, eksempel.html, felter.json, side-N.png) som design.hengsel.no lister; ingen kundetema
  "dokumentasjon/LAYOUT-REGLER.md", // N-7c: design.hengsel.no viser 3c (korte stegnavn, Befaring som hendelse) på /dokumentmaler
];
const MD_MED = [`${DS}/dokumentmaler/README.md`, `${DS}/dokumentmaler/felter.md`, `${DS}/dokumentasjon/LAYOUT-REGLER.md`]; // N-7c: .md-filer som hentes (resten av .md holdes utenfor)
const UTE = ["assets/logo/kunde/", "assets/fonts/kundetema-sigdal/"];
// N-7 (designsystem 2.5): produktlogoene (Hengsel oransje, CRM blå, Ute grønn, Admin lilla) står bare i Designs kilde claude-design/2-5/assets/logo, ikke i assets/logo
// (K-371 tok dem ikke inn), og ikonsettet 2.5 (72 ikoner med ikoner.json) ligger i ikoner/ i roten. De legges i egne mapper i ds så palettpakke v2 og merkepakke v2 ikke berøres.
const EKSTRA = [
  { fra: "claude-design/2-5/assets/logo", til: "produktlogo", bare: /\.svg$/ },
  { fra: "ikoner", til: "ikoner-2-5", bare: /\.(svg|json|md)$/ },
];

const arg = (navn) => { const i = process.argv.indexOf(navn); return i > 0 ? process.argv[i + 1] : undefined; };
const kilde = resolve(arg("--kilde") ?? process.env.DESIGNSYSTEM_KILDE ?? "/home/user/innlandet-crm-sync");
const pin = JSON.parse(await readFile(PIN, "utf8").catch(() => "{}"));
const commit = arg("--commit") ?? pin.commit;
if (!commit) throw new Error("Ingen commit: gi --commit <sha> (første gang) eller ha en pin-fil.");

const git = (...a) => execFileSync("git", ["-C", kilde, ...a], { maxBuffer: 64 * 1024 * 1024 });
const full = git("rev-parse", "--verify", `${commit}^{commit}`).toString().trim();
const filer = git("ls-tree", "-r", "--name-only", full, "--", ...HENTES.map((m) => `${DS}/${m}`)).toString().trim().split("\n")
  .filter((f) => (!/\.(swift|md)$/.test(f) || MD_MED.includes(f)) && !f.includes("/arkiv/") && !UTE.some((u) => f.slice(DS.length + 1).startsWith(u)) && !/lausanne/i.test(f));
// tokens.ts og tokens.css hører med (nedlasting); Swift-filen gjør ikke det
const ut = {};
const ekstra = EKSTRA.flatMap((e) => git("ls-tree", "-r", "--name-only", full, "--", `${DS}/${e.fra}`).toString().trim().split("\n").filter((f) => f && e.bare.test(f)).map((f) => ({ f, rel: `${e.til}/${f.slice(`${DS}/${e.fra}/`.length)}` })));
await rm(MAL, { recursive: true, force: true });
for (const f of filer) {
  const rel = f.slice(DS.length + 1);
  const data = git("show", `${full}:${f}`);
  await mkdir(dirname(join(MAL, rel)), { recursive: true });
  await writeFile(join(MAL, rel), data);
  ut[rel] = createHash("sha256").update(data).digest("hex");
}
for (const { f, rel } of ekstra) {
  const data = git("show", `${full}:${f}`);
  await mkdir(dirname(join(MAL, rel)), { recursive: true });
  await writeFile(join(MAL, rel), data);
  ut[rel] = createHash("sha256").update(data).digest("hex");
}
const nyPin = { repo: "SNgroup-Drift/hengsel-crm", sti: DS, commit: full, versjon: JSON.parse(await readFile(join(MAL, "tokens", "hengsel.tokens.json"), "utf8")).versjon, filer: ut };
// Med palettpakke (K-212 runde 2) er logo, ikoner, favicon og app-ikon i pin-fila fra pakken, ikke fra commiten: bare tokens og fonter sammenliknes.
const fraCommit = (f) => (pin.palettpakke ? Object.fromEntries(Object.entries(f).filter(([k]) => /^(tokens|assets\/fonts|produktlogo|ikoner-2-5)\//.test(k))) : f);
if (!arg("--commit") && pin.filer && JSON.stringify(fraCommit(pin.filer)) !== JSON.stringify(fraCommit(ut))) throw new Error("Filene på pinnet commit avviker fra pin-fila (pin-fila er redigert for hånd?).");
await writeFile(PIN, JSON.stringify(nyPin, null, 2) + "\n");
console.log(`✓ ${Object.keys(ut).length} filer fra ${full.slice(0, 8)} (designsystem ${nyPin.versjon}) → packages/hengsel-tokens/ds`);
execFileSync(process.execPath, [join(rot, "scripts", "lag-hengsel-tokens.mjs")], { stdio: "inherit" });
// K-212 runde 2: assets fra palettpakke v2 (logo, ikoner, favicon, app-ikon) ligger i ds fra pakken i design/handoff, ikke fra pinnet commit. Legges inn igjen til Design har pinnet dem i designsystemet.
if (pin.palettpakke) {
  console.log(`→ legger palettpakken ${pin.palettpakke.navn} inn igjen (${pin.palettpakke.kilde})`);
  execFileSync(process.execPath, [join(rot, "scripts", "hent-palettpakke.mjs"), "--pakke", join(rot, pin.palettpakke.kilde)], { stdio: "inherit" });
}
// K-231/K-238: merkepakke v2 (levert av, sendt med, favicon med flis, ikoner, motion, deling, butikk, PWA, app-ikon) ligger også i ds fra pakken i design/handoff.
// Uten dette steget forsvant den fra ds og pin-fila ved ny pin (K-238).
if (pin.merkepakke) {
  console.log(`→ legger merkepakken ${pin.merkepakke.navn} inn igjen (${pin.merkepakke.kilde})`);
  execFileSync(process.execPath, [join(rot, "scripts", "hent-merkepakke.mjs"), "--pakke", join(rot, pin.merkepakke.kilde)], { stdio: "inherit" });
}
