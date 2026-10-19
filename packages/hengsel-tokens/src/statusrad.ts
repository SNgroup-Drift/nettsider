/**
 * N-7e (designsystem 2.13, K-388): Statusrad. Ikonkartet er pakkens `status-ikon.json` (ds/ikoner-2-5), ikonene er de 24 px store strekikonene fra samme mappe
 * (status-ny/-pagar/-sannsynlig/-ferdig/-ingen, nivaa-haster/-venter/-snart, prisavvik, stoppet), tegnet inline med currentColor. Fargen og radbakgrunnen
 * settes av `statusrad.css` fra variablene i tokens.css. Verdiene i `data-status` er nøklene i kartet.
 */
import kart from "../ds/ikoner-2-5/status-ikon.json";

export type Status = "ny" | "pagar" | "venter" | "sannsynlig" | "ferdig" | "advarsel" | "feil" | "haster" | "snart" | "snart-venter" | "ingen";
export const STATUSKART = kart as { versjon: string; ikon: Record<Status, string>; farge: Record<Status, string | null> };
export const STATUSER = Object.keys(STATUSKART.ikon) as Status[];
export const STATUSNAVN: Record<Status, string> = {
  ny: "Ny", pagar: "Pågår", venter: "Venter", sannsynlig: "Sannsynlig", ferdig: "Ferdig", advarsel: "Advarsel", feil: "Feil",
  haster: "Haster", snart: "Snart", "snart-venter": "Venter, snart frist", ingen: "Ingen status",
};

const svger = import.meta.glob("../ds/ikoner-2-5/24/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
/** Innmaten til ikonet (uten metadata og tittel) og attributtene på <svg>, klar for inline bruk som dekor */
export function statusSvg(status: Status): string {
  const raw = svger[`../ds/ikoner-2-5/24/${STATUSKART.ikon[status]}.svg`];
  if (!raw) throw new Error(`Statusikon mangler for «${status}»`);
  const indre = raw.replace(/<metadata>[\s\S]*?<\/metadata>/, "").replace(/<title>[\s\S]*?<\/title>/, "").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return `<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.458" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${indre}</svg>`;
}
