/**
 * Hjelpere for A4-sidene: ren TypeScript, ingen Astro- eller DOM-avhengighet (kan brukes av andre byggetrinn).
 *
 * CSP-en tillater ikke style-attributter, så kolonnemalene i tabeller (`mal`) og høydene på bildeplassene (`hh`) blir klasser.
 * a4DynamiskCss() lager reglene for klassene som trengs for et sett dokumenter; legg dem i én <style> på siden.
 * Alle mål skaleres med --u (se styles/a4.css), så de følger bredden på siden.
 */
import type { Dokument } from "../../content/dokumenter-data";

const px = (n: string | number) => `calc(${n} * var(--u))`;

/** Klassen for en kolonnemal som «48px 1fr 70px 110px». */
export const malKlasse = (mal: string) => "a4-m-" + mal.replace(/px/g, "p").replace(/[^a-z0-9]+/gi, "_");
/** Klassen for en bildeplass med gitt høyde (designpx). */
export const hhKlasse = (hh: number) => "a4-hh-" + String(hh).replace(".", "_");

/** CSS for kolonnemalene og bildehøydene som brukes i dokumentene. */
export function a4DynamiskCss(dokumenter: Dokument[]): string {
  const maler = new Set<string>();
  const hoyder = new Set<number>();
  for (const d of dokumenter)
    for (const s of d.sider)
      for (const b of s.blokker ?? []) {
        if (b.type === "tabell") maler.add(b.mal);
        if (b.type === "bilder" || b.type === "bilde") hoyder.add(b.hh);
      }
  const regler: string[] = [];
  for (const m of maler) regler.push(`.${malKlasse(m)}{grid-template-columns:${m.replace(/(\d*\.?\d+)px/g, (_, n) => px(n))}}`);
  for (const h of hoyder) regler.push(`.${hhKlasse(h)}{height:${px(h)}}`);
  return regler.join("\n");
}
