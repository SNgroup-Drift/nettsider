export interface LagesSteg { t: string; s: string; knapp: string | null; bilde: string; alt: string }
export type EtterpaType = "pdf" | "epost" | "sms" | "sign" | "lagret";
export interface LagesDok {
  steg: LagesSteg[];
  etterpa: [EtterpaType, string][];
  rom: { u: string; t: string }[];
}
export declare const LAGES: Record<string, LagesDok>;
export declare const ETTERPA_TYPE: Record<EtterpaType, string>;
