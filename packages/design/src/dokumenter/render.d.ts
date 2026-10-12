import type { DokSide } from "./data";

export declare const esc: (s: unknown) => string;
export declare function renderA4Side(
  side: DokSide,
  o: { fot: string; nr: number; total: number; ligg?: boolean; forst?: boolean; klasse?: string; bildeSti?: string; logoSti?: string },
): string;
