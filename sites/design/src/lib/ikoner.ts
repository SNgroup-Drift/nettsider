/**
 * Ikonsettet fra designsystem 2.5 (N-7): 72 strekikoner, 16/20/24 px (currentColor) pluss nivåikonene også i 12 px. 68 er Designs 2.5 (19 av dem nye), og fire er CRM-ets egne
 * (montasjeplan, innboks, profil og hjelp, `egen`-merkene i ikoner.json og ikoner-tillegg.json). Kilden er pakkens ikoner.json (ds/ikoner-2-5, kopiert til public/ds/ikoner-2-5 ved bygging); siden har ingen egen liste.
 * SVG-ene har c2pa-metadata og rolle/aria-label; siden tegner dem inline som dekor (aria-hidden) og lar navnet stå som tekst ved siden av.
 * Status i ikoner.json: foreslått (venter på bekreftelse).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Ikon { fil: string; navn: string; gruppe: "meny" | "verktoy" | "status" | "hjelp" | "nivaa"; sf: string; egen: boolean; ny?: string; bruk: string }
const mappe = () => join(process.cwd(), "public", "ds", "ikoner-2-5");
const kart = JSON.parse(readFileSync(join(mappe(), "ikoner.json"), "utf8")) as { navn: string; dato: string; status: string; merknad: string; ikoner: Ikon[] };
export const ikonStatus = kart.status;
export const ikonDato = kart.dato;
export const ikoner: Ikon[] = kart.ikoner;
export const ikonerNye: Ikon[] = ikoner.filter((i) => i.ny);
export const GRUPPER: [Ikon["gruppe"], string][] = [["meny", "Meny"], ["verktoy", "Verktøy"], ["status", "Trenger handling og saker"], ["nivaa", "Haster og synlighet"], ["hjelp", "Hjelpeikoner"]];

const cache = new Map<string, string>();
/** Innmaten til SVG-en (uten metadata og xmlns) og attributtene på <svg>, for inline bruk. */
export function ikonSvg(navn: string, storrelse: 12 | 16 | 20 | 24 = 24): string {
  const nokkel = `${storrelse}/${navn}`;
  let s = cache.get(nokkel);
  if (!s) {
    s = readFileSync(join(mappe(), String(storrelse), `${navn}.svg`), "utf8")
      .replace(/<metadata>[\s\S]*?<\/metadata>/, "")
      .replace(/<title>[\s\S]*?<\/title>/, "")
      .replace(/ xmlns:c2pa="[^"]*"/, "")
      .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true" focusable="false"')
      .replace("<svg ", '<svg class="ikon-svg" ');
    cache.set(nokkel, s);
  }
  return s;
}
