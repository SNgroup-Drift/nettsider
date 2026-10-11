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
// romkort og flater: [slug, enhet, skjermbilde (eller liste av skjermbilder for flere telefoner ved siden av hverandre)]
// Enheter veksler som i fasit 62: Studio Display, MacBook, iPad og iPhone 18; aldri samme ramme på to kort ved siden av hverandre.
const rom = [
  ["reise", "pc", "crm-tilbud"],
  ["crm", "pc", "crm-min-dag"],
  ["kunde", "tlf", "portal-tilbud"],
  ["montor", "tlf", "ute-i-dag"],
  ["minside", "tlf", ["kundeportal-k06", "kundeportal-k08"]],
  ["tegning", "tlf", "ute-laser"],
  ["firmaleder", "ipad", "crm-ipad-leder"],
];
// flater (Butikken, Montøren, Kunden, Leverandøren)
const flater = [
  ["butikken", "pc", "crm-salgstavla"],
  ["montoren", "tlf", "ute-i-dag"],
  ["kunden", "tlf", ["kundeportal-k03", "portal-tilbud"]],
  ["leverandoren", "mac", "mb-crm-ordre-kontrollmal"],
];
const mal = (t) => (t === "tlf" ? { hoyde: 760 } : { bredde: 960 });
const tomt = (w, h) => ({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
async function lag(t, sk) {
  if (!Array.isArray(sk)) return enhet(t, sb(sk));
  const deler = await Promise.all(sk.map(async (n) => sharp(await enhet(t, sb(n))).resize({ height: 1200 }).png().toBuffer()));
  const m = await Promise.all(deler.map((d) => sharp(d).metadata()));
  const gap = 90, W = m.reduce((a, x) => a + x.width, 0) + gap * (m.length - 1);
  let x = 0;
  return sharp(tomt(W, 1200)).composite(deler.map((d, i) => { const c = { input: d, left: x, top: 0 }; x += m[i].width + gap; return c; })).png().toBuffer();
}
for (const [slug, t, s] of rom) await tilWebp(await lag(t, s), join(img, `rom-${slug}.webp`), mal(t));
for (const [slug, t, s] of flater) await tilWebp(await lag(t, s), join(img, `flate-${slug}.webp`), mal(t));

// Hero (fasit 62): Studio Display (crm-tilbud, v4), iPad (crm-ipad-leder) nede til venstre og iPhone (ute-i-dag) nede til høyre
{
  const W = 1500;
  const pc = await sharp(await enhet("pc", sb("crm-tilbud"))).resize({ width: Math.round(W * 0.88) }).png().toBuffer();
  const ipad = await sharp(await enhet("ipad", sb("crm-ipad-leder"))).resize({ width: Math.round(W * 0.48) }).png().toBuffer();
  const tlf = await sharp(await enhet("tlf", sb("ute-i-dag"))).resize({ width: Math.round(W * 0.26) }).png().toBuffer();
  const [pM, iM, tM] = await Promise.all([pc, ipad, tlf].map((b) => sharp(b).metadata()));
  const H = pM.height + Math.round(W * 0.14);
  const buf = await sharp(tomt(W, H)).composite([
    { input: pc, left: Math.round(W * 0.02), top: 0 },
    { input: ipad, left: 0, top: H - iM.height - Math.round(W * 0.02) },
    { input: tlf, left: W - tM.width, top: H - tM.height },
  ]).png().toBuffer();
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
