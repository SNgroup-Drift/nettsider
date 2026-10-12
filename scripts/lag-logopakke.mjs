#!/usr/bin/env node
/**
 * K-182: lager sites/design/public/last-ned/hengsel-logopakke.zip fra logoene i designsystemet (sites/design/public/ds/assets/logo, 32 SVG-filer)
 * pluss lisensfilene for skriftene. Kjøres først i `npm run build -w sites/design`. Ren Node (zip uten komprimering), og alltid de samme bytene for de samme filene
 * (fast tidsstempel, sortert), så bygget er reproduserbart. Fila genereres, den er ikke i git.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const ds = join(rot, "sites", "design", "public", "ds");
const ut = join(rot, "sites", "design", "public", "last-ned");

const crcTabell = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTabell[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

export async function lagZip(filer) {
  const deler = [];
  const sentral = [];
  let forskyvning = 0;
  const dato = (2026 - 1980) << 9 | 10 << 5 | 12; // 12.10.2026
  for (const [navn, data] of filer) {
    const n = Buffer.from(navn);
    const crc = crc32(data);
    const lokal = Buffer.alloc(30);
    lokal.writeUInt32LE(0x04034b50, 0); lokal.writeUInt16LE(20, 4); lokal.writeUInt16LE(0x0800, 6); lokal.writeUInt16LE(0, 8);
    lokal.writeUInt16LE(0, 10); lokal.writeUInt16LE(dato, 12); lokal.writeUInt32LE(crc, 14); lokal.writeUInt32LE(data.length, 18); lokal.writeUInt32LE(data.length, 22);
    lokal.writeUInt16LE(n.length, 26); lokal.writeUInt16LE(0, 28);
    deler.push(lokal, n, data);
    const sen = Buffer.alloc(46);
    sen.writeUInt32LE(0x02014b50, 0); sen.writeUInt16LE(20, 4); sen.writeUInt16LE(20, 6); sen.writeUInt16LE(0x0800, 8); sen.writeUInt16LE(0, 10);
    sen.writeUInt16LE(0, 12); sen.writeUInt16LE(dato, 14); sen.writeUInt32LE(crc, 16); sen.writeUInt32LE(data.length, 20); sen.writeUInt32LE(data.length, 24);
    sen.writeUInt16LE(n.length, 28); sen.writeUInt32LE(forskyvning, 42);
    sentral.push(sen, n);
    forskyvning += 30 + n.length + data.length;
  }
  const sentralBuf = Buffer.concat(sentral);
  const slutt = Buffer.alloc(22);
  slutt.writeUInt32LE(0x06054b50, 0); slutt.writeUInt16LE(filer.length, 8); slutt.writeUInt16LE(filer.length, 10);
  slutt.writeUInt32LE(sentralBuf.length, 12); slutt.writeUInt32LE(forskyvning, 16);
  return Buffer.concat([...deler, sentralBuf, slutt]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const logoer = (await readdir(join(ds, "assets", "logo"))).filter((f) => f.endsWith(".svg")).sort();
  if (logoer.length !== 32) throw new Error(`Forventet 32 logofiler i designsystemet, fant ${logoer.length}`);
  const les = (...s) => readFile(join(ds, ...s));
  const les_meg = `Hengsel-logopakken (merke v3). Designsystem fra ${JSON.parse(await readFile(join(rot, "sites", "design", "designsystem.pin.json"), "utf8")).versjon}.

Åtte former, to utgaver (aksent og ensfarget), lys og mørk: 32 SVG-filer. Filnavn: {form}-{aksent-}{lys|mork}.svg (symbolet heter hengsel-symbol).
  aksent-lys   Warm Black med stift i Deep Blue. Standard på lys flate.
  aksent-mork  Off White med stift i Dusty Blue. Standard på mørk flate.
  lys          helt Warm Black (trykk og PDF)
  mork         helt Off White (blå flater og foto)

Ikke tegn filene om, strekk eller roter dem, legg til skygge eller kontur, eller bytt farger. Minste høyde: symbol 16 px, logo med tekst 14 px. Fri sone: halve symbolhøyden.
Alle regler og plasseringer: https://design.hengsel.no/merke
`;
  const filer = [
    ["LES-MEG.txt", Buffer.from(les_meg)],
    ...(await Promise.all(logoer.map(async (f) => [`logo/${f}`, await les("assets", "logo", f)]))),
    ["skrifter/LICENSE-Inter.txt", await les("assets", "fonts", "LICENSE-Inter.txt")],
    ["skrifter/LICENSE-Newsreader.txt", await les("assets", "fonts", "LICENSE-Newsreader.txt")],
  ];
  await mkdir(ut, { recursive: true });
  await writeFile(join(ut, "hengsel-logopakke.zip"), await lagZip(filer));
  console.log(`✓ hengsel-logopakke.zip: ${logoer.length} logoer`);
}
