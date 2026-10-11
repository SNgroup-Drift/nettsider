import type { Dokument } from "./data";

/** Klassen for en kolonnemal som «48px 1fr 70px 110px». */
export declare const malKlasse: (mal: string) => string;
/** Klassen for en bildeplass med gitt høyde (designpx). */
export declare const hhKlasse: (hh: number) => string;
/** CSS for kolonnemalene og bildehøydene som brukes i dokumentene. */
export declare function a4DynamiskCss(dokumenter: Dokument[]): string;
