/**
 * K-223: kundeutgaver av Hengsel-sidene (hengsel.no/<kunde>). Sidene er de samme som på hengsel.no; en kundeutgave får kundens tema
 * (packages/kundetema-<kunde>), kundens meny og bunn, og tekstene bytter ut «Hengsel CRM» med «<Kunde> CRM» der det passer.
 * Utgaven lages ved at Side.astro henter ut HTML-en til sidens innhold og kjører den gjennom tilKunde() (bare under kunderoten, aldri på Hengsel-sidene).
 * Profilen (tekstene, titlene, sidene) står i packages/kundetema-<kunde>/profil.json. Hver erstatning må treffe minst én gang i de bygde
 * Hengsel-sidene: scripts/kundetema.test.mjs sjekker det.
 */
import profil from "@sngroup/kundetema-sigdal/profil.json";
import { tilKunde as tilKundeProfil } from "@sngroup/kundetema-sigdal/tilkunde.mjs";
import type { MenyNokkel } from "./content/nav";

export type KundeNokkel = "sigdal";

export interface Kunde {
  nokkel: KundeNokkel;
  navn: string;
  produkt: string;
  /** Rotstien, uten skråstrek til slutt */
  sti: string;
  /** Sidene som finnes i kundeutgaven (stier uten kunderot) */
  sider: readonly string[];
  /** Tittel per side (sti uten kunderot, «/» er forsiden) */
  titler: Record<string, string>;
  tekst: readonly (readonly [string, string])[];
  meny: readonly (readonly [MenyNokkel, string, string])[];
  bunnProdukt: readonly (readonly [string, string])[];
  /** Adressen til kundens Visningsrom */
  vis: string;
}

export const SIGDAL: Kunde = {
  nokkel: "sigdal",
  navn: profil.navn,
  produkt: profil.produkt,
  sti: profil.sti,
  sider: profil.sider,
  titler: profil.titler,
  tekst: profil.tekst as [string, string][],
  vis: profil.vis,
  meny: [
    ["crm", "CRM", "/crm"],
    ["ute", "Hengsel Ute", "/ute"],
    ["portal", "Kundeportal", "/kundeportal"],
    ["slik", "Slik virker det", "/slik-virker-det"],
    ["dok", "Dokumenter", "/dokumenter"],
    ["int", "Integrasjoner", "/integrasjoner"],
  ],
  bunnProdukt: [["CRM", "/crm"], ["Hengsel Ute", "/ute"], ["Kundeportal", "/kundeportal"], ["Dokumenter", "/dokumenter"], ["Test appen", "/apptest"]],
};

export const KUNDER: Record<KundeNokkel, Kunde> = { sigdal: SIGDAL };

/** Kunden en sti hører til, eller undefined for Hengsel-sidene. Astro.url.pathname er «/kunde/sigdal.html» eller «/kunde/sigdal/crm.html» (build.format «file»). */
export function kundeFra(pathname: string): Kunde | undefined {
  const sti = pathname.replace(/\/index\.html$/, "").replace(/\.html$/, "");
  for (const k of Object.values(KUNDER)) if (sti === k.sti || sti.startsWith(k.sti + "/")) return k;
  return undefined;
}

/** Stien uten kunderot og uten «.html», «/» for forsiden */
export function kundeSti(k: Kunde, pathname: string): string {
  const s = pathname.replace(/\/index\.html$/, "").replace(/\.html$/, "").slice(k.sti.length).replace(/\/$/, "");
  return s === "" ? "/" : s;
}

/** Adressen til en side i kundeutgaven: «/» → «/kunde/sigdal», «/crm» → «/kunde/sigdal/crm» */
export const kundeHref = (k: Kunde, href: string) => (href === "/" ? k.sti : `${k.sti}${href}`);

/** Hengsel-sidens HTML → kundens utgave (se packages/kundetema-sigdal/tilkunde.mjs) */
export const tilKunde = (html: string, k: Kunde) => tilKundeProfil(html, { ...profil, tekst: k.tekst } as never);
