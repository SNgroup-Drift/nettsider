/**
 * N-5: regeltekstene fra Hengsel-designsystemet (_ds/hengsel-designsystem) som mønstersidene (/monstre) siterer under flisene.
 * Teksten skrives aldri på nytt: hvert sitat er et utsnitt (regex) av fila i designsystemet, og bygget feiler hvis utsnittet ikke finnes.
 * Fila leses fra den pinnede kopien i packages/hengsel-tokens/ds når den finnes der, ellers fra den ordrette kopien i src/content/ds-sitat
 * (commit og sha256 i kilde.json; den pinnede kopien har bare tokens/ og assets/). scripts/design-fasit.test.mjs sjekker begge deler.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import kilde from "../content/ds-sitat/kilde.json";

/** Repoets rot: bygget kjøres fra sites/design, men leter oppover så det virker uansett hvor Astro starter */
function finnRot(): string {
  let d = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(d, "packages", "hengsel-tokens", "designsystem.pin.json"))) return d;
    d = dirname(d);
  }
  throw new Error("Fant ikke repoets rot (packages/hengsel-tokens)");
}
const rot = finnRot();
const pinnet = join(rot, "packages", "hengsel-tokens", "ds");
const sitat = resolve(rot, "sites", "design", "src", "content", "ds-sitat");

export const dsKilde = { repo: kilde.repo, sti: kilde.sti, commit: kilde.commit, kort: kilde.commit.slice(0, 8), versjon: kilde.versjon };
export type DsFil = keyof typeof kilde.filer;

const cache = new Map<string, { tekst: string; fra: "pinnet" | "sitat" }>();
/** Fila fra designsystemet: den pinnede kopien først, så den ordrette kopien */
export function lesDs(fil: DsFil) {
  let f = cache.get(fil);
  if (!f) {
    const p = join(pinnet, fil);
    f = existsSync(p) ? { tekst: readFileSync(p, "utf8"), fra: "pinnet" } : { tekst: readFileSync(join(sitat, fil), "utf8"), fra: "sitat" };
    cache.set(fil, f);
  }
  return f;
}

export interface Sitat { fil: DsFil; tekst: string; fra: "pinnet" | "sitat" }
/** Utsnittet av fila som treffer `utsnitt` (ordrett). Kaster når det ikke finnes, så endret tekst i designsystemet stopper bygget. */
export function siter(fil: DsFil, utsnitt: RegExp): Sitat {
  const f = lesDs(fil);
  const m = utsnitt.exec(f.tekst);
  if (!m) throw new Error(`N-5: «${utsnitt.source}» finnes ikke i ${kilde.sti}/${fil} (${f.fra}). Siter teksten slik den står i designsystemet.`);
  return { fil, tekst: m[0].trim().replace(/^- /, ""), fra: f.fra };
}

/** Markdown inne i en linje (`kode`, **fet**) til HTML. Resten escapes. */
export function mdLinje(s: string): string {
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}

/** Tabellen i flisklasser.md: én rad per flisklasse, med cellene ordrett */
export function flisklasser() {
  const f = lesDs("flisklasser.md");
  const linjer = f.tekst.split("\n").filter((l) => l.startsWith("| ") && !/^\|\s*-/.test(l) && !l.startsWith("| Klasse"));
  if (linjer.length < 13) throw new Error("N-5: flisklasser.md har ikke tabellen med de 13 flisklassene");
  return linjer.map((l) => {
    const c = l.split("|").slice(1, -1).map((x) => x.trim());
    return { klasse: c[0], nokkel: c[1].replace(/`/g, ""), bredde: c[2], hoyde: c[3], innhold: c[4], tilstand: c[5] };
  });
}
