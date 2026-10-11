/** Typer for data.js (dokumentene på hengsel.no/dokumenter og i Visningsrommet). */

export declare const LAGES_STEG: readonly ["Ordren i CRM", "Valg", "Knapp", "Ferdig PDF", "Sendt"];
/** Stående A4 er 794 × 1123 px, liggende 1123 × 794 px (96 dpi). */
export declare const A4: { readonly bredde: 794; readonly hoyde: 1123 };

export type Par = [string, string];
export type Status = "Løst" | "OK" | "Utgått" | "Åpen" | string;
export type Fase = "Befaring" | "Montering" | "KS" | "Reklamasjon";
export type CelleTone = "" | "ny" | "warn" | "bad" | "tom";

export type Blokk =
  | { type: "h"; t: string }
  | { type: "kv"; kol: number; kv: { k: string; v: string }[] }
  | { type: "linjer"; rader: { l: string; v: string }[]; sum: { l: string; v: string } | null }
  | { type: "tabell"; kol: string[]; rader: { c: string[] }[]; mal: string; sum: { l: string; v: string } | null }
  | { type: "boks"; t: string; linjer: string[] }
  | { type: "tekst"; t: string }
  | { type: "klausuler"; rader: { nr: string; t: string; s: string }[] }
  | { type: "bilder"; rader: string[]; hh: number }
  | { type: "bilde"; t: string; hh: number }
  | { type: "sign"; rader: { navn: string; rolle: string }[] }
  | { type: "signbokser"; rader: { t: string; s: string }[] }
  | { type: "stats"; rader: { k: string; v: string }[] }
  | { type: "ks"; rader: { p: string; m: string; s: string; avvik: boolean }[] }
  | { type: "punkter"; rader: { ref: string; fase: Fase | string; t: string; s: Status; sist: string }[] }
  | { type: "plan"; dager: string[]; rader: { navn: string; firma: string; celler: { t: string; s: string; tone: CelleTone }[] }[] };

export interface Forside {
  eyebrow: string;
  tittel: string;
  under: string;
  /** Fire felt under tittelen: [navn, verdi] */
  meta?: Par[];
  pris?: string;
  prisTekst?: string;
  /** Fire fliser: [tittel, tekst] */
  fliser?: Par[];
  tekst?: string;
}

export interface Todelt {
  eyebrow: string;
  t: string;
  s: string;
  steg: Par[];
}

export interface DokSide {
  /** Navnet i innholdslisten */
  navn: string;
  forside?: Forside;
  todelt?: Todelt;
  eyebrow?: string;
  tittel?: string;
  ingress?: string;
  /** Linjer øverst til høyre (ved siden av logoen) */
  hoyre?: string[];
  blokker?: Blokk[];
}

export interface Dokument {
  id: string;
  /** Tittel i velgeren og over innholdslisten */
  t: string;
  /** Én setning under tittelen */
  s: string;
  /** Liggende A4 */
  ligg?: boolean;
  /** Bunnlinjen på hver side (venstre) */
  fot: string;
  /** «Slik lages det»: fem tekster, i rekkefølgen LAGES_STEG */
  lages: string[];
  sider: DokSide[];
}

export declare const DOKUMENTER: Dokument[];
