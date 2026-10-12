/** Bredden på en logo-SVG ved gitt høyde, fra viewBox i filen (bygges inn som width/height på <img>, så siden ikke hopper). Filene ligger i public/ds/assets/logo. */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cache = new Map<string, [number, number]>();
export function logoMaal(src: string, hoyde: number): { width: number; height: number } {
  let vb = cache.get(src);
  if (!vb) {
    const svg = readFileSync(join(process.cwd(), "public", src), "utf8");
    const m = /viewBox="([\d.\s-]+)"/.exec(svg);
    if (!m) throw new Error(`Fant ikke viewBox i ${src}`);
    const d = m[1].trim().split(/\s+/).map(Number);
    vb = [d[2], d[3]];
    cache.set(src, vb);
  }
  return { width: Math.round((hoyde * vb[0]) / vb[1] * 100) / 100, height: hoyde };
}
