/**
 * Ikonsettet fra palettpakke v2 (49 strekikoner, 16/20/24 px, currentColor) pluss de fire nye fra merkepakke v2 (K-231: Montasjeplan, Innboks, Profil og Hjelp, i ikoner-tillegg.json).
 * Filene ligger i packages/hengsel-tokens/ds/assets/ikoner og kopieres til public/ds/assets/ikoner ved bygging.
 * SVG-ene har c2pa-metadata og rolle/aria-label; siden tegner dem inline som dekor (aria-hidden) og lar navnet stå som tekst ved siden av.
 * Status i ikoner.json: foreslått (venter på bekreftelse).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Ikon { fil: string; navn: string; gruppe: "meny" | "verktoy" | "status" | "hjelp"; sf: string; egen: boolean; bruk: string }
const mappe = () => join(process.cwd(), "public", "ds", "assets", "ikoner");
const kart = JSON.parse(readFileSync(join(mappe(), "ikoner.json"), "utf8")) as { navn: string; dato: string; status: string; ikoner: Ikon[] };
const tillegg = JSON.parse(readFileSync(join(mappe(), "ikoner-tillegg.json"), "utf8")) as { status: string; ikoner: Omit<Ikon, "gruppe">[] };
/** Gruppen for de nye ikonene: tre menypunkter og ett hjelpeikon */
const TILLEGG_GRUPPE: Record<string, Ikon["gruppe"]> = { montasjeplan: "meny", innboks: "meny", profil: "meny", hjelp: "hjelp" };
export const ikonStatus = kart.status;
export const ikonDato = kart.dato;
export const ikonTilleggStatus = tillegg.status;
export const ikonerPalett: Ikon[] = kart.ikoner;
export const ikonerTillegg: Ikon[] = tillegg.ikoner.map((i) => ({ ...i, gruppe: TILLEGG_GRUPPE[i.fil] }));
export const ikoner: Ikon[] = [...ikonerPalett, ...ikonerTillegg];
export const GRUPPER: [Ikon["gruppe"], string][] = [["meny", "Meny"], ["verktoy", "Verktøy"], ["status", "Trenger handling og saker"], ["hjelp", "Hjelpeikoner"]];

const cache = new Map<string, string>();
/** Innmaten til SVG-en (uten metadata og xmlns) og attributtene på <svg>, for inline bruk. */
export function ikonSvg(navn: string, storrelse: 16 | 20 | 24 = 24): string {
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
