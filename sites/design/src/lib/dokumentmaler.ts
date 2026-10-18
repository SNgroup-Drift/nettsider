/**
 * Dokumentmalene (designsystem 2.10, N-7b og N-7c): maler for CRM-ets PDF- og e-postgeneratorer. Listen leses fra den pinnede mappa (ds/dokumentmaler, kopiert til
 * public/ds/dokumentmaler ved bygging): nummer, mappe og familie fra README-tabellen, navn og antall flettefelt fra hver malmappe, sider fra antall side-N.png.
 * Bildene er Designs egne side-N.png i Hengsel standard (2.10b). Siden har ingen egen liste: en ny mal i pin-mappa kommer med ved neste pin, og en mal uten rad i
 * README-tabellen stopper bygget, unntatt malene i FORELOPIG (levert uten eksempel.html, felter.json og tabellrad; nå 29-e11, resten kommer i Designs 2.10c).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface Side { n: number; bilde: string; bredde: number; hoyde: number }
export interface Mal { nr: string; mappe: string; navn: string; familie: string; sider: Side[]; felt: number | null; ny: boolean; epost: boolean; eksempel: string | null; felter: string | null; foreloepig: boolean }
const rot = join(process.cwd(), "..", "..", "packages", "hengsel-tokens", "ds", "dokumentmaler");

/** Maler som er levert uten eksempel.html, felter.json og rad i README-tabellen. Testen i scripts/n7c.test.mjs sier fra når en av dem er komplett, så oppføringen kan fjernes. */
export const FORELOPIG: Record<string, { navn: string; familie: string }> = {
  "29-e11-hvordan-gikk-det": { navn: "E-post: Hvordan gikk det", familie: "kundeportal/e-post" },
};

const FAMILIE: Record<string, string> = { salg: "Salg", montasje: "Montasje", avtale: "Avtale", logistikk: "Logistikk", "økonomi": "Økonomi", "kundeportal/e-post": "Kundeportal og e-post", annet: "Annet" };
const rader = readFileSync(join(rot, "README.md"), "utf8").split("\n").map((l) => l.match(/^\| (\d\d) \| `([^`/]+)\/` \| ([^|]*?) \| ([^|]*?) \| (\d+) \|/)).filter((m): m is RegExpMatchArray => !!m);
const mapper = readdirSync(rot).filter((m) => /^\d\d-/.test(m)).sort();

/** Bredde og høyde fra PNG-hodet (IHDR), så bildet har mål og siden ikke hopper. */
function png(fil: string) {
  const b = readFileSync(fil);
  return { bredde: b.readUInt32BE(16), hoyde: b.readUInt32BE(20) };
}

export const dokumentmaler: Mal[] = mapper.map((mappe) => {
  const rad = rader.find((m) => m[2] === mappe);
  const forelopig = FORELOPIG[mappe];
  if (!rad && !forelopig) throw new Error(`Malen ${mappe} står ikke i tabellen i dokumentmaler/README.md (pinnet designsystem)`);
  const harFelter = existsSync(join(rot, mappe, "felter.json"));
  const harEksempel = existsSync(join(rot, mappe, "eksempel.html"));
  const j = harFelter ? (JSON.parse(readFileSync(join(rot, mappe, "felter.json"), "utf8")) as { dokument: string; felt: unknown[] }) : null;
  const sider: Side[] = readdirSync(join(rot, mappe)).map((f) => f.match(/^side-(\d+)\.png$/)).filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ n: Number(m[1]), bilde: `/ds/dokumentmaler/${mappe}/${m[0]}`, ...png(join(rot, mappe, m[0])) })).sort((a, b) => a.n - b.n);
  if (!sider.length) throw new Error(`Malen ${mappe} har ingen side-N.png`);
  const famKode = rad?.[4] ?? forelopig.familie;
  return {
    nr: mappe.slice(0, 2), mappe, navn: j?.dokument ?? rad?.[3]?.replace(/\*\*\(NY\)\*\*|\(NY\)/g, "").replace(/\*\*/g, "").trim() ?? forelopig.navn,
    familie: FAMILIE[famKode] ?? famKode, sider, felt: j ? j.felt.length : null, ny: !!rad && /\(NY\)/.test(rad[3]), epost: famKode === "kundeportal/e-post",
    eksempel: harEksempel ? `/ds/dokumentmaler/${mappe}/eksempel.html` : null, felter: harFelter ? `/ds/dokumentmaler/${mappe}/felter.json` : null, foreloepig: !rad,
  };
});
export const familier = [...new Set(dokumentmaler.map((m) => m.familie))];
export const antallSider = dokumentmaler.reduce((s, m) => s + m.sider.length, 0);

/** Avsnittet fra en .md-fil i pin-mappa som starter med overskriften `###? <begynnelse>` og går til neste overskrift på samme eller høyere nivå. Tom liste hvis avsnittet ikke finnes. */
export function avsnitt(fil: string, begynnelse: RegExp): { tittel: string; linjer: string[] } | null {
  const linjer = readFileSync(fil, "utf8").split("\n");
  const start = linjer.findIndex((l) => /^#{2,4} /.test(l) && begynnelse.test(l));
  if (start < 0) return null;
  const niva = linjer[start].match(/^#+/)![0].length;
  let slutt = linjer.length;
  for (let i = start + 1; i < linjer.length; i++) { const m = linjer[i].match(/^(#+) /); if (m && m[1].length <= niva) { slutt = i; break; } }
  return { tittel: linjer[start].replace(/^#+\s*/, ""), linjer: linjer.slice(start + 1, slutt).filter((l) => l.trim()) };
}
export const layoutRegler = avsnitt(join(rot, "..", "dokumentasjon", "LAYOUT-REGLER.md"), /^#{2,4} 3c\b/);
export const nyeFelter = avsnitt(join(rot, "felter.md"), /Nye i 2\.10b/);
