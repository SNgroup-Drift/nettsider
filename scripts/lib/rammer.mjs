/**
 * Apples Product Bezels (sites/vis/src/assets/rammer) med skjermbilde i hullet, som ett bilde på gjennomsiktig bunn.
 * Samme mål som assets/enhet.css (skjermhull og hjørneradius i prosent), brukt til romkort, flater og hero på forsiden.
 * Skjermbildet ligger under rammen, klippes med skjermens hjørner og fyller hullet (cover, fra toppen). Rammen brukes som den er.
 */
import sharp from "sharp";
import { join, resolve } from "node:path";

const vis = resolve(import.meta.dirname, "..", "..", "sites", "vis", "src");
export const skjermbilder = join(vis, "skjermbilder");
export const img = join(vis, "img");
export const ENHET = {
  pc: { fil: "studio-display", b: 2160, h: 1664, hull: [2.59, 3.37, 94.81, 69.23], r: [1.2, 1.6] },
  tlf: { fil: "iphone-18", b: 1174, h: 2400, hull: [5.37, 2.5, 89.27, 95], r: [14, 6.1] },
  ipad: { fil: "ipad-liggende", b: 2400, h: 1740, hull: [5, 6.84, 90, 86.32], r: [1.2, 1.6] },
  mac: { fil: "macbook", b: 2400, h: 1565, hull: [12.63, 14.19, 74.75, 71.63], r: [1, 1.4] },
};

/** type: pc | tlf | ipad | mac. skjerm: filsti eller Buffer. Gir PNG-buffer i rammens egen størrelse. */
export async function enhet(type, skjerm) {
  const e = ENHET[type];
  const [l, t, w, h] = e.hull.map((p, i) => Math.round((p / 100) * (i % 2 === 0 ? e.b : e.h)));
  const rx = Math.round((e.r[0] / 100) * w), ry = Math.round((e.r[1] / 100) * h);
  const maske = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${rx}" ry="${ry}"/></svg>`);
  const sk = await sharp(skjerm).resize(w, h, { fit: "cover", position: "top" }).composite([{ input: maske, blend: "dest-in" }]).png().toBuffer();
  const ramme = join(vis, "assets", "rammer", `${e.fil}.webp`);
  return sharp({ create: { width: e.b, height: e.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: sk, left: l, top: t }, { input: ramme, left: 0, top: 0 }]).png().toBuffer();
}

/** Enhet skalert til bredde (eller høyde for telefon), som webp med alfa. */
export async function tilWebp(buf, ut, { bredde, hoyde } = {}) {
  const p = sharp(buf).resize({ width: bredde, height: hoyde, fit: "inside" });
  return p.webp({ quality: 86, alphaQuality: 100, effort: 5 }).toFile(ut);
}
