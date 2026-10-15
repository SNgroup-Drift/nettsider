/** K-240: lager en liten .xlsx (zip med XML) i minnet, til testen av Excel-importen og til skjermbildet av forhåndsvisningen. Ingen avhengigheter. */
import { deflateRawSync } from "node:zlib";

export const RADER_EKSEMPEL = [
  ["Eier", "Org.nr.", "Adresse", "Postnr.", "Sted", "Fylke", "Kjede", "Antall butikker", "Butikker", "Kontakt", "Kontakt e-post", "Kontakt telefon", "Kilde"],
  ["Lunde Kjøkken AS", "930 221 467", "Storgata 1", "2317", "Hamar", "Innlandet", "Sigdal", "2", "Lunde Hamar; Lunde Gjøvik", "Ola Lunde", "ola@lunde.no", "900 00 000", "Sigdal-kjedemøte"],
  ["Brekke Interiør AS", "921 774 038", "", "", "Bergen", "Vestland", "Sigdal", "1", "", "Eli Brekke", "eli@brekke.no", "", ""],
  ["Nordli Kjøkken AS", "923456781", "", "", "Hamar", "Innlandet", "Sigdal", "3", "", "Kari Nordli", "kari@nordli-kjokken.no", "", "Sigdal-kjedemøte"],
  ["Sandvik Kjøkken AS", "928 330 115", "", "", "Stavanger", "Rogaland", "Sigdal", "1", "", "", "", "", ""],
  ["Tveit Innredning", "", "", "", "Arendal", "Agder", "Sigdal", "1", "", "Jan Tveit", "", "", ""],
  ["Holm & Sønn Kjøkken AS", "917 552 904", "", "", "Moss", "Østfold", "Sigdal", "4", "", "", "", "", ""],
];

function crc32(buf) { let c = ~0; for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; }

export function lagZip(filer) {
  const deler = [], katalog = [];
  let offset = 0;
  for (const [navn, tekst] of Object.entries(filer)) {
    const data = Buffer.from(tekst, "utf8"), pakket = deflateRawSync(data), n = Buffer.from(navn);
    const lokal = Buffer.alloc(30); lokal.writeUInt32LE(0x04034b50, 0); lokal.writeUInt16LE(20, 4); lokal.writeUInt16LE(8, 8); lokal.writeUInt32LE(crc32(data), 14); lokal.writeUInt32LE(pakket.length, 18); lokal.writeUInt32LE(data.length, 22); lokal.writeUInt16LE(n.length, 26);
    const sentral = Buffer.alloc(46); sentral.writeUInt32LE(0x02014b50, 0); sentral.writeUInt16LE(20, 6); sentral.writeUInt16LE(8, 10); sentral.writeUInt32LE(crc32(data), 16); sentral.writeUInt32LE(pakket.length, 20); sentral.writeUInt32LE(data.length, 24); sentral.writeUInt16LE(n.length, 28); sentral.writeUInt32LE(offset, 42);
    deler.push(lokal, n, pakket); katalog.push(sentral, n);
    offset += lokal.length + n.length + pakket.length;
  }
  const kat = Buffer.concat(katalog);
  const eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(katalog.length / 2, 8); eocd.writeUInt16LE(katalog.length / 2, 10); eocd.writeUInt32LE(kat.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...deler, kat, eocd]);
}

export function lagXlsx(rader) {
  const strenger = []; const si = (s) => { let i = strenger.indexOf(s); if (i < 0) { strenger.push(s); i = strenger.length - 1; } return i; };
  const kol = (i) => String.fromCharCode(65 + i);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const sheet = rader.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => v === "" ? "" : /^\d+$/.test(v) && ri > 0 && ci === 7 ? `<c r="${kol(ci)}${ri + 1}"><v>${v}</v></c>` : `<c r="${kol(ci)}${ri + 1}" t="s"><v>${si(v)}</v></c>`).join("")}</row>`).join("");
  return lagZip({
    "[Content_Types].xml": `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>`,
    "xl/workbook.xml": `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Kjedeliste" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    "xl/sharedStrings.xml": `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${strenger.map((s) => `<si><t>${esc(s)}</t></si>`).join("")}</sst>`,
    "xl/worksheets/sheet1.xml": `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet}</sheetData></worksheet>`,
  });
}
export const lagXlsxEksempel = () => lagXlsx(RADER_EKSEMPEL);
