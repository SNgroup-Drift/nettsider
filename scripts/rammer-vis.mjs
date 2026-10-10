#!/usr/bin/env node
/**
 * Romkort, flater og hero på forsiden til Visningsrommet: enhetsrammene (sites/vis/src/assets/rammer) med skjermbilder fra
 * sites/vis/src/skjermbilder, ferdig sammensatt som webp med gjennomsiktig bunn i sites/vis/src/img (rom-*.webp, flate-*.webp, hero.webp).
 * Rom uten skjermbilde fra designfilene (rommet selv i Studio Display) lages av scripts/skjermbilder-vis.mjs med samme hjelper.
 * Dokumentene (/dokumenter/) beholdes som A4-ark uten ramme.
 *
 * Kjør: node scripts/rammer-vis.mjs   (npm run rammer:vis)
 */
import sharp from "sharp";
import { join } from "node:path";
import { enhet, tilWebp, skjermbilder, img } from "./lib/rammer.mjs";

const sb = (n) => join(skjermbilder, `${n}.webp`);
// romkort: [slug, enhet, skjermbilde, bredde/høyde]
const rom = [
  ["reise", "pc", "crm-tilbud-kunde"],
  ["crm", "pc", "crm-min-dag"],
  ["kunde", "tlf", "portal-tlf-nytt-kjokken"],
  ["montor", "tlf", "ute-i-dag"],
  ["minside", "pc", "portal-mitt-kjokken"],
  ["tegning", "tlf", "ute-laser"],
  ["firmaleder", "pc", "crm-resultater"],
];
// flater på forsiden (Butikken, Montøren, Kunden, Leverandøren)
const flater = [
  ["butikken", "mac", "mb-crm-min-dag"],
  ["montoren", "tlf", "ute-ks"],
  ["kunden", "tlf", "portal-tlf-nytt-kjokken"],
  ["leverandoren", "ipad", "crm-ipad-ordre"],
];
const mal = (t) => (t === "tlf" ? { hoyde: 760 } : { bredde: 960 });
for (const [slug, t, s] of rom) await tilWebp(await enhet(t, sb(s)), join(img, `rom-${slug}.webp`), mal(t));
for (const [slug, t, s] of flater) await tilWebp(await enhet(t, sb(s)), join(img, `flate-${slug}.webp`), mal(t));

// Hero: Studio Display (crm-tilbud) og iPhone (ute-i-dag) sammen, telefonen i riktig størrelsesforhold til skjermen (høyde ≈ 40 % av Studio Display-rammen)
{
  const pc = await sharp(await enhet("pc", sb("crm-tilbud"))).resize({ width: 1240 }).png().toBuffer();
  const pcM = await sharp(pc).metadata();
  const tlf = await sharp(await enhet("tlf", sb("ute-i-dag"))).resize({ height: Math.round(pcM.height * 0.62) }).png().toBuffer();
  const tM = await sharp(tlf).metadata();
  const W = pcM.width + Math.round(tM.width * 0.45), H = pcM.height;
  const buf = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: pc, left: 0, top: 0 }, { input: tlf, left: W - tM.width, top: H - tM.height }]).png().toBuffer();
  const i = await sharp(buf).webp({ quality: 88, alphaQuality: 100, effort: 5 }).toFile(join(img, "hero.webp"));
  console.log(`hero.webp ${i.width}×${i.height}`);
}

// Dokumentene: A4-arket uten ramme (bare myk skygge på gjennomsiktig bunn)
{
  const ark = await sharp(join(skjermbilder, "..", "dokumenter", "dok-tilbud.webp")).resize({ height: 640 }).png().toBuffer();
  const m = await sharp(ark).metadata();
  const pad = 40, skygge = await sharp({ create: { width: m.width, height: m.height, channels: 4, background: { r: 49, g: 38, b: 29, alpha: 0.28 } } }).png().toBuffer();
  const blur = await sharp({ create: { width: m.width + 2 * pad, height: m.height + 2 * pad, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: skygge, left: pad, top: pad + 8 }]).blur(14).png().toBuffer();
  await sharp(blur).composite([{ input: ark, left: pad, top: pad }]).webp({ quality: 88, alphaQuality: 100 }).toFile(join(img, "rom-dokumenter.webp"));
}
console.log(`${rom.length} romkort, ${flater.length} flater, hero og dokumentark i sites/vis/src/img/`);
