/**
 * Dokumentmalene (designsystem 2.10, N-7b): 28 maler for CRM-ets PDF- og e-postgeneratorer. Listen leses fra den pinnede mappa (ds/dokumentmaler, kopiert til
 * public/ds/dokumentmaler ved bygging): nummer, mappe og familie fra README-tabellen, navn og antall flettefelt fra hver malmappe, sider fra antall sider i
 * eksempelet. Siden har ingen egen liste: en ny mal i pin-mappa kommer med ved neste pin, og en mal uten rad i README-tabellen stopper bygget.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface Mal { nr: string; mappe: string; navn: string; familie: string; sider: number; felt: number; ny: boolean; eksempel: string; bilde: string; felter: string }
const rot = join(process.cwd(), "..", "..", "packages", "hengsel-tokens", "ds", "dokumentmaler");

const FAMILIE: Record<string, string> = { salg: "Salg", montasje: "Montasje", avtale: "Avtale", logistikk: "Logistikk", "økonomi": "Økonomi", "kundeportal/e-post": "Kundeportal og e-post", annet: "Annet" };
const rader = readFileSync(join(rot, "README.md"), "utf8").split("\n").map((l) => l.match(/^\| (\d\d) \| `([^`/]+)\/` \| ([^|]*?) \| ([^|]*?) \| (\d+) \|/)).filter((m): m is RegExpMatchArray => !!m);
const mapper = readdirSync(rot).filter((m) => /^\d\d-/.test(m)).sort();

export const dokumentmaler: Mal[] = mapper.map((mappe) => {
  const rad = rader.find((m) => m[2] === mappe);
  if (!rad) throw new Error(`Malen ${mappe} står ikke i tabellen i dokumentmaler/README.md (pinnet designsystem)`);
  const j = JSON.parse(readFileSync(join(rot, mappe, "felter.json"), "utf8")) as { dokument: string; felt: unknown[] };
  const sider = readdirSync(join(rot, mappe)).filter((f) => /^side-\d+\.png$/.test(f)).length;
  return {
    nr: rad[1], mappe, navn: j.dokument, familie: FAMILIE[rad[4]] ?? rad[4], sider: sider || Number(rad[5]), felt: j.felt.length, ny: /\*\*\(NY\)\*\*/.test(rad[3]) || /\(NY\)/.test(rad[3]),
    eksempel: `/ds/dokumentmaler/${mappe}/eksempel.html`, felter: `/ds/dokumentmaler/${mappe}/felter.json`, bilde: `/dokumentmaler/${mappe}.png`,
  };
});
export const familier = [...new Set(dokumentmaler.map((m) => m.familie))];
export const antallSider = dokumentmaler.reduce((s, m) => s + m.sider, 0);
