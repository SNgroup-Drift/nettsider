#!/usr/bin/env node
/**
 * K-182, oppdatert i K-212 runde 2 og K-231: lager sites/design/public/last-ned/hengsel-logopakke.zip fra logoene og merkene i designsystemet (packages/hengsel-tokens/ds/assets/logo, palettpakke v2)
 * pluss merkepakke v2 (levert av, sendt med som SVG og PNG, favicon med flis) og lisensfilene for skriftene, hengsel-ikoner.zip fra ikonsettet (ds/assets/ikoner, 49 + 4 nye),
 hengsel-butikkmaler.zip (ds/assets/butikk) og hengsel-appikoner.zip (PWA, Expo og Android fra ds/assets/pwa og ds/assets/app-ikon). Kjøres først i `npm run build -w sites/design`. Ren Node (zip uten komprimering), og alltid de samme bytene for de samme filene
 * (fast tidsstempel, sortert), så bygget er reproduserbart. Fila genereres, den er ikke i git.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const rot = resolve(import.meta.dirname, "..");
const ds = join(rot, "packages", "hengsel-tokens", "ds");
const ut = join(rot, "sites", "design", "public", "last-ned");

const alleFiler = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async (e) => (e.isDirectory() ? alleFiler(join(dir, e.name)) : [join(dir, e.name)])))).flat();
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
  if (logoer.length < 30) throw new Error(`Forventet logoene fra palettpakke v2 i designsystemet, fant ${logoer.length}`);
  const les = (...s) => readFile(join(ds, ...s));
  const pngNavn = (await readdir(join(ds, "assets", "logo", "png"))).filter((f) => f.endsWith(".png")).sort();
  const flisNavn = (await readdir(join(ds, "assets", "favicon"))).filter((f) => /^favicon-flis|^favicon\.ico$/.test(f)).sort();
  if (pngNavn.length !== 18 || flisNavn.length !== 5) throw new Error(`Forventet 18 PNG og 5 favicon-filer fra merkepakke v2, fant ${pngNavn.length} og ${flisNavn.length}`);
  const pin = JSON.parse(await readFile(join(rot, "packages", "hengsel-tokens", "designsystem.pin.json"), "utf8"));
  const les_meg = `Hengsel-logopakken (palettpakke v2, ${pin.palettpakke?.dato ?? ""}). Designsystem ${pin.versjon}.

${logoer.length} SVG-filer: logo-{hengsel|crm|ute|admin|levering}-{lys|mork}.svg (merke og navn), merke-{hengsel|crm|ute|admin|levering}-{lys|mork}.svg (merket alene),
hengsel-merke-* (glass, tonet, blekk, hvit), logo-hengsel-{blekk|hvit|glass-*|tonet}.svg og ordmerke-hengsel-*.svg.
  lys    blekk på bladene og furu på stiften (produktfarge i stiften på produktmerkene). Standard på lys flate.
  mork   lys blekk på bladene og lysere furu på stiften. Standard på mørk flate.
  blekk  helt blekk (trykk og PDF).  hvit  helt hvit (furuflater og foto).
De monokrome produktlogoene (hvit og blekk for CRM, Ute, Admin og Levering) er foreslått og ikke med.
levert-av-hengsel-{lys|mork|blekk|hvit}.svg og sendt-med-hengsel-{lys|mork}.svg (merkepakke v2). PNG i png/ (1x, 2x og 3x): bruk PNG i e-post, «Sendt med Hengsel» i 160 px bredde med 2x-fila.
favicon/: favicon.ico (16, 32, 48), favicon-flis.svg og favicon-flis-{16,32,48}.png (merket på hvit flis, synlig også i mørke faner).

Ikke tegn filene om, strekk eller roter dem, legg til skygge eller kontur, eller bytt farger. Minste høyde: symbol 16 px, logo med tekst 14 px. Fri sone: halve symbolhøyden.
Alle regler og plasseringer: https://design.hengsel.no/merke
`;
  const filer = [
    ["LES-MEG.txt", Buffer.from(les_meg)],
    ...(await Promise.all(logoer.map(async (f) => [`logo/${f}`, await les("assets", "logo", f)]))),
    ...(await Promise.all(pngNavn.map(async (f) => [`png/${f}`, await les("assets", "logo", "png", f)]))),
    ...(await Promise.all(flisNavn.map(async (f) => [`favicon/${f}`, await les("assets", "favicon", f)]))),
    ["skrifter/LICENSE-Schibsted-Grotesk.txt", await les("assets", "fonts", "LICENSE-Schibsted-Grotesk.txt")],
  ];
  await mkdir(ut, { recursive: true });
  await writeFile(join(ut, "hengsel-logopakke.zip"), await lagZip(filer));
  console.log(`✓ hengsel-logopakke.zip: ${logoer.length} logoer, ${pngNavn.length} PNG, ${flisNavn.length} favicon-filer`);

  // Ikonsettet (designsystem 2.5, N-7): 72 SVG-er i 16, 20 og 24 px (currentColor), nivåikonene også i 12 px, navn og SF Symbol i ikoner.json, sprite og tabell (ds/ikoner-2-5, fra pakken)
  const ikonJson = JSON.parse(await readFile(join(ds, "ikoner-2-5", "ikoner.json"), "utf8"));
  const ikonNavn = ikonJson.ikoner.map((i) => i.fil).sort();
  const ikonFiler = [
    ["LES-MEG.txt", Buffer.from(`Hengsel-ikonene (designsystem 2.5). Status: foreslått, venter på bekreftelse.\n\n${ikonNavn.length} strekikoner på et 20 px rutenett, i 16, 20 og 24 px (nivåikonene også i 12 px). Fargen er currentColor.\nikoner.json har navn, gruppe, SF Symbol og bruk. 68 er fra Design 2.5 (19 nye), fire er egne (Montasjeplan, Innboks, Profil og Hjelp, se ikoner-tillegg.json).\nhengsel-ikoner.svg er en sprite med <symbol id>. IKONER.md er tabellen.\nhttps://design.hengsel.no/komponenter#ikoner\n`)],
    ["ikoner.json", await les("ikoner-2-5", "ikoner.json")],
    ["ikoner-tillegg.json", await les("ikoner-2-5", "ikoner-tillegg.json")],
    ["hengsel-ikoner.svg", await les("ikoner-2-5", "hengsel-ikoner.svg")],
    ["IKONER.md", await les("ikoner-2-5", "IKONER.md")],
    ...(await Promise.all(["16", "20", "24"].flatMap((m) => ikonNavn.map(async (n) => [`${m}/${n}.svg`, await les("ikoner-2-5", m, `${n}.svg`)])))),
    ...(await Promise.all(ikonNavn.filter((n) => existsSync(join(ds, "ikoner-2-5", "12", `${n}.svg`))).map(async (n) => [`12/${n}.svg`, await les("ikoner-2-5", "12", `${n}.svg`)]))),
  ];
  await writeFile(join(ut, "hengsel-ikoner.zip"), await lagZip(ikonFiler));
  console.log(`✓ hengsel-ikoner.zip: ${ikonNavn.length} ikoner × 3 størrelser`);

  // Butikkmaler (SVG-maler med navngitte felt, forhåndsvisninger, maler.json og tekster.json) og app-ikoner (PWA, Expo og Android)
  const under = async (mappe, prefiks) => (await alleFiler(join(ds, "assets", mappe))).sort().map((f) => [`${prefiks}${relative(join(ds, "assets", mappe), f).split("\\").join("/")}`, f]);
  const lesFiler = (liste) => Promise.all(liste.map(async ([n, f]) => [n, await readFile(f)]));
  const butikk = await under("butikk", "");
  await writeFile(join(ut, "hengsel-butikkmaler.zip"), await lagZip([["LES-MEG.txt", Buffer.from("Butikkmaler for Hengsel Ute (merkepakke v2, 14.10.2026): App Store (iPhone 6,9\", 6,5\", iPad 13\") og Google Play (telefon, nettbrett 10\", funksjonsgrafikk 1024x500).\nSVG-malene har navngitte felt: #overskrift (#overskrift-linje-1, #overskrift-linje-2), #undertekst, #skjermbilde (tomt <image href=\"\">, klippet med #skjerm-klipp) og #skjermbilde-felt (plassholder, fjernes). Mål for hvert felt står i maler.json, forslag til tekst i tekster.json.\nforhandsvisning/ har PNG med eksempeltekst. Tekstene er forslag. Skjermbildene tas fra demo.hengsel.no.\nhttps://design.hengsel.no/merke#butikk\n")], ...(await lesFiler(butikk))]));
  console.log(`✓ hengsel-butikkmaler.zip: ${butikk.length} filer`);
  const appikon = [...(await under("pwa", "pwa/")), ...(await under("app-ikon/expo", "expo/")), ...(await under("app-ikon/android", "android/"))];
  await writeFile(join(ut, "hengsel-appikoner.zip"), await lagZip([["LES-MEG.txt", Buffer.from("App-ikoner (merkepakke v2, 14.10.2026).\npwa/: CRM (192, 512, maskable 512, apple-touch 180) og Visning (maskable 512), med manifest-utdrag.json.\nexpo/ute og expo/visning: icon, icon-dark, icon-tinted, adaptive-icon (og monokrom), splash-icon, med app-json-utdrag.json.\nandroid/ute og android/visning: res/ til app/src/main/res/, og Google Play-ikon 512.\niOS (SwiftUI): bruk hengsel_ute.icon i designsystemet (ds/assets/app-ikon/hengsel_ute.icon) direkte i Xcode.\nhttps://design.hengsel.no/merke#app-ikoner\n")], ...(await lesFiler(appikon))]));
  console.log(`✓ hengsel-appikoner.zip: ${appikon.length} filer`);
}
