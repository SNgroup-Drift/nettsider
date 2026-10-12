#!/usr/bin/env node
/**
 * K-182/K-192: henter Hengsel-designsystemet (SNgroup-Drift/innlandet-crm-sync, _ds/hengsel-designsystem) inn i packages/hengsel-tokens/ds
 * fra en PINNET commit, så bygget er reproduserbart og Workers Builds ikke trenger tilgang til det private repoet.
 *
 *   node scripts/hent-designsystem.mjs --kilde /sti/til/innlandet-crm-sync [--commit <sha>]
 *
 * Uten --commit brukes commiten som står i packages/hengsel-tokens/designsystem.pin.json (verifiserer at filene er uendret).
 * Med --commit pinnes en ny commit: filene leses med `git show <sha>:<sti>` (ikke fra arbeidsmappa), kopieres, og pin-fila skrives på nytt
 * med sha256 for hver fil. tokens/hengsel.tokens.json er ENESTE kilde; tokens.css, tokens.ts og fonts.css er generert av designsystemet.
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

const arg = (navn) => { const i = process.argv.indexOf(navn); return i > 0 ? process.argv[i + 1] : undefined; };
const kilde = resolve(arg("--kilde") ?? process.env.DESIGNSYSTEM_KILDE ?? "/home/user/innlandet-crm-sync");
const pin = JSON.parse(await readFile(PIN, "utf8").catch(() => "{}"));
const commit = arg("--commit") ?? pin.commit;
if (!commit) throw new Error("Ingen commit: gi --commit <sha> (første gang) eller ha en pin-fil.");

const git = (...a) => execFileSync("git", ["-C", kilde, ...a], { maxBuffer: 64 * 1024 * 1024 });
const full = git("rev-parse", "--verify", `${commit}^{commit}`).toString().trim();
const filer = git("ls-tree", "-r", "--name-only", full, "--", `${DS}/tokens`, `${DS}/assets/logo`, `${DS}/assets/fonts`).toString().trim().split("\n")
  .filter((f) => !/\.(swift|md)$/.test(f) && !f.includes("/arkiv/"));
// tokens.ts og tokens.css hører med (nedlasting); Swift-filen gjør ikke det
const ut = {};
await rm(MAL, { recursive: true, force: true });
for (const f of filer) {
  const rel = f.slice(DS.length + 1);
  const data = git("show", `${full}:${f}`);
  await mkdir(dirname(join(MAL, rel)), { recursive: true });
  await writeFile(join(MAL, rel), data);
  ut[rel] = createHash("sha256").update(data).digest("hex");
}
const nyPin = { repo: "SNgroup-Drift/innlandet-crm-sync", sti: DS, commit: full, versjon: JSON.parse(await readFile(join(MAL, "tokens", "hengsel.tokens.json"), "utf8")).versjon, filer: ut };
if (!arg("--commit") && pin.filer && JSON.stringify(pin.filer) !== JSON.stringify(ut)) throw new Error("Filene på pinnet commit avviker fra pin-fila (pin-fila er redigert for hånd?).");
await writeFile(PIN, JSON.stringify(nyPin, null, 2) + "\n");
console.log(`✓ ${Object.keys(ut).length} filer fra ${full.slice(0, 8)} (designsystem ${nyPin.versjon}) → packages/hengsel-tokens/ds`);
execFileSync(process.execPath, [join(rot, "scripts", "lag-hengsel-tokens.mjs")], { stdio: "inherit" });
